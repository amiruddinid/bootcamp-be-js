const { poolPromise, sql } = require('../../../config/db');

const findAllBom = async () => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query(`
        SELECT b.ID, b.CAR_MODEL_ID, b.INVENTORY_ID, b.QTY_REQUIRED, b.CREATED_DT, b.CREATED_BY, 
               c.MODEL_NAME, c.MODEL_CODE, 
               i.WAREHOUSE_LOCATION, 
               m.NAME as MATERIAL_NAME, m.PART_NUMBER
        FROM amir.TB_M_BOM b
        LEFT JOIN amir.TB_M_CAR_MODEL c ON b.CAR_MODEL_ID = c.ID
        LEFT JOIN amir.TB_R_INVENTORY i ON b.INVENTORY_ID = i.ID
        LEFT JOIN amir.TB_M_MATERIAL m ON i.MATERIAL_ID = m.ID
        ORDER BY CREATED_DT DESC
    `);
    
    return {
        data: result.recordset,
        rows: result.rowsAffected[0]
    };
};

const findBomById = async (id) => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query`
        SELECT b.ID, b.CAR_MODEL_ID, b.INVENTORY_ID, b.QTY_REQUIRED, b.CREATED_DT, b.CREATED_BY, 
               c.MODEL_NAME, c.MODEL_CODE, 
               i.WAREHOUSE_LOCATION, 
               m.NAME as MATERIAL_NAME, m.PART_NUMBER
        FROM amir.TB_M_BOM b
        LEFT JOIN amir.TB_M_CAR_MODEL c ON b.CAR_MODEL_ID = c.ID
        LEFT JOIN amir.TB_R_INVENTORY i ON b.INVENTORY_ID = i.ID
        LEFT JOIN amir.TB_M_MATERIAL m ON i.MATERIAL_ID = m.ID
        WHERE b.ID = ${id}
    `;

    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const findBomByDetails = async (carModelId, inventoryId) => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query`
        SELECT ID, CAR_MODEL_ID, INVENTORY_ID, QTY_REQUIRED, CREATED_DT, CREATED_BY
        FROM amir.TB_M_BOM 
        WHERE CAR_MODEL_ID = ${carModelId} AND INVENTORY_ID = ${inventoryId}
    `;
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const insertBom = async (bomData) => {
    const pool = await poolPromise;
    const request = pool.request();
    const { CAR_MODEL_ID, INVENTORY_ID, QTY_REQUIRED, CREATED_BY } = bomData;

    const businessKeyResult = await pool.request()
            .input('Input_Prefix', 'BOM')
            .output('Output_NewID', sql.VarChar(50), null)
            .execute('amir.usp_GenerateBusinessKey');

    const result = await request.query`
        INSERT INTO amir.TB_M_BOM (ID, CAR_MODEL_ID, INVENTORY_ID, QTY_REQUIRED, CREATED_BY, CREATED_DT) 
        OUTPUT INSERTED.ID, INSERTED.CAR_MODEL_ID, INSERTED.INVENTORY_ID, INSERTED.QTY_REQUIRED, INSERTED.CREATED_BY, INSERTED.CREATED_DT
        VALUES (${businessKeyResult.output.Output_NewID}, ${CAR_MODEL_ID}, ${INVENTORY_ID}, ${QTY_REQUIRED}, ${CREATED_BY}, GETDATE())`;
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const updateBomById = async (id, bomData) => {
    const pool = await poolPromise;
    const request = pool.request();
    const { CAR_MODEL_ID, INVENTORY_ID, QTY_REQUIRED } = bomData;
    const result = await request.query`
        UPDATE amir.TB_M_BOM SET CAR_MODEL_ID = ${CAR_MODEL_ID}, INVENTORY_ID = ${INVENTORY_ID}, 
        QTY_REQUIRED = ${QTY_REQUIRED} WHERE ID = ${id};
        SELECT ID, CAR_MODEL_ID, INVENTORY_ID, QTY_REQUIRED, CREATED_BY, CREATED_DT 
        FROM amir.TB_M_BOM WHERE ID = ${id}`;
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const deleteBomById = async (id) => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query`
        DELETE FROM amir.TB_M_BOM WHERE ID = ${id}`;
    
    return {
        data: null,
        rows: result.rowsAffected[0]
    };
};

module.exports = {
    findAllBom,
    findBomById,
    findBomByDetails,
    insertBom,
    updateBomById,
    deleteBomById
};
