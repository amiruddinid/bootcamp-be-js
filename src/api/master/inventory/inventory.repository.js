const { poolPromise, sql } = require('../../../config/db');

const findAllInventory = async () => {
    const pool = await poolPromise;
    const request = pool.request();
    
    const result = await request.query(`
        SELECT 
            i.ID, 
            i.MATERIAL_ID, 
            m.PART_NUMBER, 
            m.NAME as MATERIAL_NAME, 
            m.MATERIAL_CATEGORY = m.CATEGORY, -- SQL Server alias syntax or standard SELECT
            m.CATEGORY as MATERIAL_CATEGORY,
            m.UNIT as MATERIAL_UNIT,
            i.WAREHOUSE_LOCATION, 
            i.QUANTITY,
            i.CREATED_DT,
            i.CREATED_BY
        FROM amir.TB_R_INVENTORY i
        JOIN amir.TB_M_MATERIAL m ON i.MATERIAL_ID = m.ID
        ORDER BY i.CREATED_DT DESC, i.ID DESC
    `);
    
    return {
        data: result.recordset,
        rows: result.rowsAffected[0]
    };
};

const findAllReceipts = async () => {
    const pool = await poolPromise;
    const request = pool.request();
    
    // Select flat list of material orders (receipts joined with details and supplier info)
    const result = await request.query(`
        SELECT 
            r.ID,
            r.RECEIPT_NUMBER,
            r.STATUS,
            r.CREATED_DT,
            r.CREATED_BY,
            s.NAME as SUPPLIER_NAME,
            s.SUPPLIER_CODE,
            d.MATERIAL_ID,
            m.NAME as MATERIAL_NAME,
            m.PART_NUMBER as MATERIAL_PART_NUMBER,
            d.QUANTITY_RECEIVED
        FROM amir.TB_R_MATERIAL_RECEIPT r
        LEFT JOIN amir.TB_M_SUPPLIER s ON r.SUPPLIER_ID = s.ID
        LEFT JOIN amir.TB_R_RECEIPT_DETAIL d ON r.ID = d.RECEIPT_ID
        LEFT JOIN amir.TB_M_MATERIAL m ON d.MATERIAL_ID = m.ID
        ORDER BY r.CREATED_DT DESC, r.ID DESC
    `);
    
    return {
        data: result.recordset,
        rows: result.rowsAffected[0]
    };
};

const approveReceipt = async (orderId, username) => {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    
    try {
        await transaction.begin();
        
        // 1. Get receipt status to verify it exists and is in Draft state
        const receiptReq = new sql.Request(transaction);
        const receiptResult = await receiptReq.query(`
            SELECT STATUS, SUPPLIER_ID 
            FROM amir.TB_R_MATERIAL_RECEIPT 
            WHERE ID = '${orderId}'
        `);
        
        if (receiptResult.recordset.length === 0) {
            throw new Error('Receipt order not found.');
        }
        
        const receipt = receiptResult.recordset[0];
        if (receipt.STATUS !== 'Draft Order') {
            throw new Error(`Order receipt is already in status '${receipt.STATUS}'. Only Draft Orders can be approved.`);
        }
        
        // 2. Fetch all detail items of this receipt
        const detailsReq = new sql.Request(transaction);
        const detailsResult = await detailsReq.query(`
            SELECT MATERIAL_ID, QUANTITY_RECEIVED 
            FROM amir.TB_R_RECEIPT_DETAIL 
            WHERE RECEIPT_ID = '${orderId}'
        `);
        
        for (const detail of detailsResult.recordset) {
            const materialId = detail.MATERIAL_ID;
            const qtyReceived = detail.QUANTITY_RECEIVED;
            
            // 3. Check if inventory record already exists for this material
            const invReq = new sql.Request(transaction);
            const invResult = await invReq.query(`
                SELECT ID, QUANTITY 
                FROM amir.TB_R_INVENTORY 
                WHERE MATERIAL_ID = '${materialId}'
            `);
            
            if (invResult.recordset.length > 0) {
                // Update existing inventory quantity
                const invId = invResult.recordset[0].ID;
                const currentQty = invResult.recordset[0].QUANTITY;
                const newQty = currentQty + qtyReceived;
                
                const updateReq = new sql.Request(transaction);
                await updateReq.query(`
                    UPDATE amir.TB_R_INVENTORY 
                    SET QUANTITY = ${newQty}, 
                        CHANGED_BY = '${username}', 
                        CHANGED_DT = GETDATE() 
                    WHERE ID = '${invId}'
                `);
                
                // Write transaction log to TB_H_INVENTORY_LOG
                const logReq = new sql.Request(transaction);
                await logReq.query(`
                    INSERT INTO amir.TB_H_INVENTORY_LOG (
                        ID, INVENTORY_ID, MOVEMENT_TYPE, QUANTITY, BALANCE, REFERENCE_NO, CREATED_BY, CREATED_DT
                    ) VALUES (
                        NEWID(), '${invId}', 'IN', ${qtyReceived}, ${newQty}, '${orderId}', '${username}', GETDATE()
                    )
                `);
            } else {
                // Insert new inventory record
                // Generate a new inventory business key INVxxxxx
                const keyReq = new sql.Request(transaction);
                keyReq.input('Input_Prefix', 'INV');
                keyReq.output('Output_NewID', sql.VarChar(50));
                const keyResult = await keyReq.execute('amir.usp_GenerateBusinessKey');
                const newInvId = keyResult.output.Output_NewID;
                
                const insertReq = new sql.Request(transaction);
                await insertReq.query(`
                    INSERT INTO amir.TB_R_INVENTORY (
                        ID, MATERIAL_ID, WAREHOUSE_LOCATION, QUANTITY, CREATED_DT, CREATED_BY
                    ) VALUES (
                        '${newInvId}', '${materialId}', 'Shop 1', ${qtyReceived}, GETDATE(), '${username}'
                    )
                `);
                
                // Write transaction log to TB_H_INVENTORY_LOG
                const logReq = new sql.Request(transaction);
                await logReq.query(`
                    INSERT INTO amir.TB_H_INVENTORY_LOG (
                        ID, INVENTORY_ID, MOVEMENT_TYPE, QUANTITY, BALANCE, REFERENCE_NO, CREATED_BY, CREATED_DT
                    ) VALUES (
                        NEWID(), '${newInvId}', 'IN', ${qtyReceived}, ${qtyReceived}, '${orderId}', '${username}', GETDATE()
                    )
                `);
            }
        }
        
        // 4. Update the receipt status to Approved
        const updateReceiptReq = new sql.Request(transaction);
        await updateReceiptReq.query(`
            UPDATE amir.TB_R_MATERIAL_RECEIPT 
            SET STATUS = 'Approved', 
                CHANGED_BY = '${username}', 
                CHANGED_DT = GETDATE() 
            WHERE ID = '${orderId}'
        `);
        
        await transaction.commit();
        return { success: true };
    } catch (err) {
        await transaction.rollback();
        console.error('Error in approveReceipt transaction:', err);
        throw err;
    }
};

module.exports = {
    findAllInventory,
    findAllReceipts,
    approveReceipt
};
