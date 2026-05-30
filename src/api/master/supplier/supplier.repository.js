const { poolPromise, sql } = require('../../../config/db');

const findAllSupplier = async () => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query('SELECT ID, SUPPLIER_CODE, NAME, CONTACT_PERSON, PHONE, ADDRESS, IS_ACTIVE, CREATED_DT, CREATED_BY, CHANGED_DT, CHANGED_BY FROM amir.TB_M_SUPPLIER');
    
    return {
        data: result.recordset,
        rows: result.rowsAffected[0]
    };
};

const findSupplierById = async (id) => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query`SELECT ID, SUPPLIER_CODE, NAME, CONTACT_PERSON, PHONE, ADDRESS, IS_ACTIVE, CREATED_DT, CREATED_BY, CHANGED_DT, CHANGED_BY FROM amir.TB_M_SUPPLIER WHERE ID = ${id}`;

    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const findSupplierByCode = async (supplierCode) => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query`SELECT ID, SUPPLIER_CODE, NAME, CONTACT_PERSON, PHONE, ADDRESS, IS_ACTIVE, CREATED_DT, CREATED_BY, CHANGED_DT, CHANGED_BY FROM amir.TB_M_SUPPLIER WHERE SUPPLIER_CODE = ${supplierCode}`;
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const insertSupplier = async (supplierData) => {
    const pool = await poolPromise;
    const request = pool.request();
    const { SUPPLIER_CODE, NAME, CONTACT_PERSON, PHONE, ADDRESS, IS_ACTIVE, CREATED_BY } = supplierData;
    
    const isActiveVal = IS_ACTIVE === false ? 0 : 1;

    const businessKeyResult = await pool.request()
            .input('Input_Prefix', 'SUP')
            .output('Output_NewID', sql.VarChar(50), null)
            .execute('amir.usp_GenerateBusinessKey');

    const result = await request.query`
        INSERT INTO amir.TB_M_SUPPLIER (ID, SUPPLIER_CODE, NAME, CONTACT_PERSON, PHONE, ADDRESS, IS_ACTIVE, CREATED_BY, CREATED_DT) 
        OUTPUT INSERTED.ID, INSERTED.SUPPLIER_CODE, INSERTED.NAME, INSERTED.CONTACT_PERSON, INSERTED.PHONE, INSERTED.ADDRESS, INSERTED.IS_ACTIVE, INSERTED.CREATED_BY, INSERTED.CREATED_DT
        VALUES (${businessKeyResult.output.Output_NewID}, ${SUPPLIER_CODE}, ${NAME}, ${CONTACT_PERSON}, ${PHONE}, ${ADDRESS}, ${isActiveVal}, ${CREATED_BY}, GETDATE())`;
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const updateSupplierById = async (id, supplierData) => {
    const pool = await poolPromise;
    const request = pool.request();
    const { SUPPLIER_CODE, NAME, CONTACT_PERSON, PHONE, ADDRESS, IS_ACTIVE, CHANGED_BY } = supplierData;
    
    const isActiveVal = IS_ACTIVE === false ? 0 : 1;

    const result = await request.query`
        UPDATE amir.TB_M_SUPPLIER SET SUPPLIER_CODE = ${SUPPLIER_CODE}, NAME = ${NAME}, 
        CONTACT_PERSON = ${CONTACT_PERSON}, PHONE = ${PHONE}, ADDRESS = ${ADDRESS}, IS_ACTIVE = ${isActiveVal},
        CHANGED_BY = ${CHANGED_BY}, CHANGED_DT = GETDATE() WHERE ID = ${id};
        SELECT ID, SUPPLIER_CODE, NAME, CONTACT_PERSON, PHONE, ADDRESS, IS_ACTIVE, CREATED_BY, CREATED_DT, CHANGED_BY, CHANGED_DT 
        FROM amir.TB_M_SUPPLIER WHERE ID = ${id}`;
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const deleteSupplierById = async (id) => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query`
        DELETE FROM amir.TB_M_SUPPLIER WHERE ID = ${id}`;
    
    return {
        data: null,
        rows: result.rowsAffected[0]
    };
};

module.exports = {
    findAllSupplier,
    findSupplierById,
    findSupplierByCode,
    insertSupplier,
    updateSupplierById,
    deleteSupplierById
};
