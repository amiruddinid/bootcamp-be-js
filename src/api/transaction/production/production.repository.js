const { poolPromise, sql } = require('../../../config/db'); // Import koneksi pool database MSSQL

// Repository untuk mengambil daftar seluruh perintah produksi
const findAllProduction = async () => {
    const pool = await poolPromise;
    const request = pool.request();
    // Melakukan query SELECT dengan melakukan LEFT JOIN ke tabel master mobil untuk mendapatkan nama dan kode model
    const result = await request.query(`
        SELECT p.ID, p.PRODUCTION_ORDER_NO, p.CAR_MODEL_ID, p.VIN, p.ENGINE_NUMBER, 
               p.START_DATE, p.END_DATE, p.STATUS, p.CREATED_DT, p.CREATED_BY, p.CHANGED_DT, p.CHANGED_BY,
               c.MODEL_NAME, c.MODEL_CODE
        FROM amir.TB_R_PRODUCTION p
        LEFT JOIN amir.TB_M_CAR_MODEL c ON p.CAR_MODEL_ID = c.ID
    `);
    
    return {
        data: result.recordset,
        rows: result.rowsAffected[0]
    };
};

// Repository untuk mencari detail perintah produksi berdasarkan ID
const findProductionById = async (id) => {
    const pool = await poolPromise;
    const request = pool.request();
    // Mengamankan query parameter dari SQL Injection menggunakan template literals bawaan driver mssql
    const result = await request.query`
        SELECT p.ID, p.PRODUCTION_ORDER_NO, p.CAR_MODEL_ID, p.VIN, p.ENGINE_NUMBER, 
               p.START_DATE, p.END_DATE, p.STATUS, p.CREATED_DT, p.CREATED_BY, p.CHANGED_DT, p.CHANGED_BY,
               c.MODEL_NAME, c.MODEL_CODE
        FROM amir.TB_R_PRODUCTION p
        LEFT JOIN amir.TB_M_CAR_MODEL c ON p.CAR_MODEL_ID = c.ID
        WHERE p.ID = ${id}
    `;

    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

// Repository untuk mengambil data konsumsi material bahan baku pada suatu perintah produksi
const findProductionMaterialsByProductionId = async (productionId) => {
    const pool = await poolPromise;
    const request = pool.request();
    // Menghubungkan TB_R_PRODUCTION_MATERIAL dengan TB_M_MATERIAL untuk mengambil spesifikasi detail material
    const result = await request.query`
        SELECT pm.ID, pm.PRODUCTION_ID, pm.MATERIAL_ID, pm.QUANTITY_CONSUMED, pm.CREATED_DT, pm.CREATED_BY,
               m.NAME as MATERIAL_NAME, m.PART_NUMBER, m.UNIT, m.CATEGORY
        FROM amir.TB_R_PRODUCTION_MATERIAL pm
        LEFT JOIN amir.TB_M_MATERIAL m ON pm.MATERIAL_ID = m.ID
        WHERE pm.PRODUCTION_ID = ${productionId}
    `;

    return {
        data: result.recordset,
        rows: result.rowsAffected[0]
    };
};

// Repository untuk melacak riwayat (logs) perubahan status pada perintah produksi
const findProductionLogsByProductionId = async (productionId) => {
    const pool = await poolPromise;
    const request = pool.request();
    // Mengurutkan log riwayat status berdasarkan tanggal dibuat (kronologis)
    const result = await request.query`
        SELECT ID, PRODUCTION_ID, PREVIOUS_STATUS, NEW_STATUS, OPERATOR_ID, NOTES, CREATED_DT, CREATED_BY
        FROM amir.TB_H_PRODUCTION_LOG
        WHERE PRODUCTION_ID = ${productionId}
        ORDER BY CREATED_DT ASC
    `;

    return {
        data: result.recordset,
        rows: result.rowsAffected[0]
    };
};

// Repository untuk mengeksekusi Stored Procedure pembuatan perintah produksi dengan transaksi aman
const createProductionOrderTransaction = async (productionData) => {
    const pool = await poolPromise;
    const { CAR_MODEL_ID, VIN, ENGINE_NUMBER, CREATED_BY } = productionData;

    // Membangun parameter input dan output untuk stored procedure
    const result = await pool.request()
        .input('Input_CarModelID', sql.NVarChar(50), CAR_MODEL_ID)
        .input('Input_VIN', sql.NVarChar(255), VIN)
        .input('Input_EngineNumber', sql.NVarChar(255), ENGINE_NUMBER)
        .input('Input_User', sql.NVarChar(255), CREATED_BY)
        .output('Output_NewID', sql.NVarChar(50)) // Output berupa ID Perintah Produksi baru yang dihasilkan
        .execute('amir.usp_CreateProductionOrder'); // Eksekusi Stored Procedure

    return {
        data: {
            ID: result.output.Output_NewID,
            PRODUCTION_ORDER_NO: result.output.Output_NewID,
            CAR_MODEL_ID,
            VIN,
            ENGINE_NUMBER,
            STATUS: 'In Progress',
            CREATED_BY
        },
        rows: 1
    };
};

// Repository untuk memperbarui status produksi sekaligus menyimpannya ke audit log log_status
const updateProductionStatus = async (id, statusData) => {
    const pool = await poolPromise;
    
    // Inisialisasi transaksi SQL Server di tingkat Node.js
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    
    try {
        const { STATUS, NOTES, CHANGED_BY, PREVIOUS_STATUS } = statusData;
        const request = transaction.request();
        
        // Query 1: Memperbarui kolom STATUS, CHANGED_BY, dan END_DATE di tabel utama produksi
        await request.input('id', sql.NVarChar(50), id)
                     .input('status', sql.NVarChar(255), STATUS)
                     .input('changedBy', sql.NVarChar(255), CHANGED_BY)
                     .query(`
                         UPDATE amir.TB_R_PRODUCTION 
                         SET STATUS = @status, 
                             CHANGED_BY = @changedBy, 
                             CHANGED_DT = GETDATE(), 
                             END_DATE = CASE WHEN @status IN ('Completed', 'Cancelled') THEN GETDATE() ELSE NULL END
                         WHERE ID = @id
                     `);
        
        // Query 2: Menambahkan catatan riwayat perubahan status baru ke tabel log history
        await request.input('logId', sql.NVarChar(50), require('crypto').randomUUID())
                     .input('prevStatus', sql.NVarChar(255), PREVIOUS_STATUS || null)
                     .input('notes', sql.NVarChar(sql.MAX), NOTES || '')
                     .query(`
                         INSERT INTO amir.TB_H_PRODUCTION_LOG (ID, PRODUCTION_ID, PREVIOUS_STATUS, NEW_STATUS, OPERATOR_ID, NOTES, CREATED_BY, CREATED_DT)
                         VALUES (@logId, @id, @prevStatus, @status, @changedBy, @notes, @changedBy, GETDATE())
                     `);
        
        // Lakukan commit jika kedua query di atas sukses dijalankan
        await transaction.commit();
        return true;
    } catch (error) {
        // Lakukan rollback membatalkan seluruh perubahan jika salah satu query gagal
        await transaction.rollback();
        throw error; // Lempar error ke service layer
    }
};

module.exports = {
    findAllProduction,
    findProductionById,
    findProductionMaterialsByProductionId,
    findProductionLogsByProductionId,
    createProductionOrderTransaction,
    updateProductionStatus
};
