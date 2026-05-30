const { poolPromise, sql } = require('../../../config/db');

const findAllCustomer = async () => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query('SELECT ID, CUSTOMER_CODE, NAME, TYPE, ADDRESS, PHONE, CREATED_DT, CREATED_BY, CHANGED_DT, CHANGED_BY FROM amir.TB_M_CUSTOMER');
    
    return {
        data: result.recordset,
        rows: result.rowsAffected[0]
    };
};

const findCustomerById = async (id) => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query`SELECT ID, CUSTOMER_CODE, NAME, TYPE, ADDRESS, PHONE, CREATED_DT, CREATED_BY, CHANGED_DT, CHANGED_BY FROM amir.TB_M_CUSTOMER WHERE ID = ${id}`;

    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const findCustomerByCode = async (customerCode) => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query`SELECT ID, CUSTOMER_CODE, NAME, TYPE, ADDRESS, PHONE, CREATED_DT, CREATED_BY, CHANGED_DT, CHANGED_BY FROM amir.TB_M_CUSTOMER WHERE CUSTOMER_CODE = ${customerCode}`;
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const insertCustomer = async (customerData) => {
    const pool = await poolPromise;
    const request = pool.request();
    const { CUSTOMER_CODE, NAME, TYPE, ADDRESS, PHONE, CREATED_BY } = customerData;

    const businessKeyResult = await pool.request()
            .input('Input_Prefix', 'CUS')
            .output('Output_NewID', sql.VarChar(50), null)
            .execute('amir.usp_GenerateBusinessKey');

    const result = await request.query`
        INSERT INTO amir.TB_M_CUSTOMER (ID, CUSTOMER_CODE, NAME, TYPE, ADDRESS, PHONE, CREATED_BY, CREATED_DT) 
        OUTPUT INSERTED.ID, INSERTED.CUSTOMER_CODE, INSERTED.NAME, INSERTED.TYPE, INSERTED.ADDRESS, INSERTED.PHONE, INSERTED.CREATED_BY, INSERTED.CREATED_DT
        VALUES (${businessKeyResult.output.Output_NewID}, ${CUSTOMER_CODE}, ${NAME}, ${TYPE}, ${ADDRESS}, ${PHONE}, ${CREATED_BY}, GETDATE())`;
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const updateCustomerById = async (id, customerData) => {
    const pool = await poolPromise;
    const request = pool.request();
    const { CUSTOMER_CODE, NAME, TYPE, ADDRESS, PHONE, CHANGED_BY } = customerData;
    const result = await request.query`
        UPDATE amir.TB_M_CUSTOMER SET CUSTOMER_CODE = ${CUSTOMER_CODE}, NAME = ${NAME}, 
        TYPE = ${TYPE}, ADDRESS = ${ADDRESS}, PHONE = ${PHONE}, 
        CHANGED_BY = ${CHANGED_BY}, CHANGED_DT = GETDATE() WHERE ID = ${id};
        SELECT ID, CUSTOMER_CODE, NAME, TYPE, ADDRESS, PHONE, CREATED_BY, CREATED_DT, CHANGED_BY, CHANGED_DT 
        FROM amir.TB_M_CUSTOMER WHERE ID = ${id}`;
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const deleteCustomerById = async (id) => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query`
        DELETE FROM amir.TB_M_CUSTOMER WHERE ID = ${id}`;
    
    return {
        data: null,
        rows: result.rowsAffected[0]
    };
};

module.exports = {
    findAllCustomer,
    findCustomerById,
    findCustomerByCode,
    insertCustomer,
    updateCustomerById,
    deleteCustomerById
};
