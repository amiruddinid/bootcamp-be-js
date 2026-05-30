const { poolPromise, sql } = require('../../../config/db');

const findAllLogistic = async () => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query('SELECT ID, VENDOR_CODE, COMPANY_NAME, FLEET_TYPE, CONTACT_NUMBER, CREATED_DT, CREATED_BY, CHANGED_DT, CHANGED_BY FROM amir.TB_M_LOGISTIC');
    
    return {
        data: result.recordset,
        rows: result.rowsAffected[0]
    };
};

const findLogisticById = async (id) => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query`SELECT ID, VENDOR_CODE, COMPANY_NAME, FLEET_TYPE, CONTACT_NUMBER, CREATED_DT, CREATED_BY, CHANGED_DT, CHANGED_BY FROM amir.TB_M_LOGISTIC WHERE ID = ${id}`;

    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const findLogisticByCode = async (vendorCode) => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query`SELECT ID, VENDOR_CODE, COMPANY_NAME, FLEET_TYPE, CONTACT_NUMBER, CREATED_DT, CREATED_BY, CHANGED_DT, CHANGED_BY FROM amir.TB_M_LOGISTIC WHERE VENDOR_CODE = ${vendorCode}`;
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const insertLogistic = async (logisticData) => {
    const pool = await poolPromise;
    const request = pool.request();
    const { VENDOR_CODE, COMPANY_NAME, FLEET_TYPE, CONTACT_NUMBER, CREATED_BY } = logisticData;

    const businessKeyResult = await pool.request()
            .input('Input_Prefix', 'LOG')
            .output('Output_NewID', sql.VarChar(50), null)
            .execute('amir.usp_GenerateBusinessKey');

    const result = await request.query`
        INSERT INTO amir.TB_M_LOGISTIC (ID, VENDOR_CODE, COMPANY_NAME, FLEET_TYPE, CONTACT_NUMBER, CREATED_BY, CREATED_DT) 
        OUTPUT INSERTED.ID, INSERTED.VENDOR_CODE, INSERTED.COMPANY_NAME, INSERTED.FLEET_TYPE, INSERTED.CONTACT_NUMBER, INSERTED.CREATED_BY, INSERTED.CREATED_DT
        VALUES (${businessKeyResult.output.Output_NewID}, ${VENDOR_CODE}, ${COMPANY_NAME}, ${FLEET_TYPE}, ${CONTACT_NUMBER}, ${CREATED_BY}, GETDATE())`;
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const updateLogisticById = async (id, logisticData) => {
    const pool = await poolPromise;
    const request = pool.request();
    const { VENDOR_CODE, COMPANY_NAME, FLEET_TYPE, CONTACT_NUMBER, CHANGED_BY } = logisticData;
    const result = await request.query`
        UPDATE amir.TB_M_LOGISTIC SET VENDOR_CODE = ${VENDOR_CODE}, COMPANY_NAME = ${COMPANY_NAME}, 
        FLEET_TYPE = ${FLEET_TYPE}, CONTACT_NUMBER = ${CONTACT_NUMBER}, 
        CHANGED_BY = ${CHANGED_BY}, CHANGED_DT = GETDATE() WHERE ID = ${id};
        SELECT ID, VENDOR_CODE, COMPANY_NAME, FLEET_TYPE, CONTACT_NUMBER, CREATED_BY, CREATED_DT, CHANGED_BY, CHANGED_DT 
        FROM amir.TB_M_LOGISTIC WHERE ID = ${id}`;
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const deleteLogisticById = async (id) => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query`
        DELETE FROM amir.TB_M_LOGISTIC WHERE ID = ${id}`;
    
    return {
        data: null,
        rows: result.rowsAffected[0]
    };
};

module.exports = {
    findAllLogistic,
    findLogisticById,
    findLogisticByCode,
    insertLogistic,
    updateLogisticById,
    deleteLogisticById
};
