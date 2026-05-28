const { poolPromise, sql } = require('../../../config/db');

const findAllMaterial = async () => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query('SELECT ID, PART_NUMBER, NAME, CATEGORY, UNIT, CREATED_DT, CREATED_BY, CHANGED_DT, CHANGED_BY FROM amir.TB_M_MATERIAL');
    
    return {
        data: result.recordset,
        rows: result.rowsAffected[0]
    };
};

const findMaterialById = async (id) => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await 
        request.query`SELECT m.*, s.SUPPLIER_CODE, s.NAME as SUPPLIER_NAME FROM amir.TB_M_MATERIAL m JOIN 
        amir.TB_M_SUPPLIER s ON m.SUPPLIER_ID = s.ID WHERE m.ID = ${id}`;

    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const findMaterialByPartNumber = async (partNumber) => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query`SELECT ID, PART_NUMBER, 
        NAME, CATEGORY, UNIT, CREATED_DT, CREATED_BY, CHANGED_DT, 
        CHANGED_BY FROM amir.TB_M_MATERIAL WHERE PART_NUMBER = ${partNumber}`
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const insertMaterial = async (materialData) => {
    const pool = await poolPromise;
    const request = pool.request();
    const {PART_NUMBER, NAME, CATEGORY, UNIT, SUPPLIER_ID, CREATED_BY} = materialData;
    const result = await request.query`
        INSERT INTO amir.TB_M_MATERIAL (PART_NUMBER, NAME, CATEGORY, UNIT, SUPPLIER_ID, CREATED_BY, CREATED_DT) 
        OUTPUT INSERTED.ID, INSERTED.PART_NUMBER, INSERTED.NAME, INSERTED.CATEGORY, INSERTED.UNIT, 
        INSERTED.SUPPLIER_ID, INSERTED.CREATED_BY, INSERTED.CREATED_DT
        VALUES (${PART_NUMBER}, ${NAME}, ${CATEGORY}, ${UNIT}, ${SUPPLIER_ID}, ${CREATED_BY}, GETDATE())`;
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const updateMaterialById = async (id, materialData) => {
    const pool = await poolPromise;
    const request = pool.request();
    const {PART_NUMBER, NAME, CATEGORY, UNIT, SUPPLIER_ID, CHANGED_BY} = materialData;
    const result = await request.query`
        UPDATE amir.TB_M_MATERIAL SET PART_NUMBER = ${PART_NUMBER}, NAME = ${NAME}, 
        CATEGORY = ${CATEGORY}, UNIT = ${UNIT}, SUPPLIER_ID = ${SUPPLIER_ID}, 
        CHANGED_BY = ${CHANGED_BY}, CHANGED_DT = GETDATE() WHERE ID = ${id};
        SELECT ID, PART_NUMBER, NAME, CATEGORY, UNIT, SUPPLIER_ID, CREATED_BY, CREATED_DT, CHANGED_BY, CHANGED_DT 
        FROM amir.TB_M_MATERIAL WHERE ID = ${id}`;
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const deleteMaterialById = async (id) => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query`
        DELETE FROM amir.TB_M_MATERIAL WHERE ID = ${id}`;
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

module.exports = {
    findAllMaterial,
    findMaterialById,
    findMaterialByPartNumber,
    insertMaterial,
    updateMaterialById,
    deleteMaterialById
};