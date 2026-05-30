const { poolPromise, sql } = require('../../../config/db');

const findAllCarModel = async () => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query('SELECT ID, MODEL_CODE, MODEL_NAME, COLOR, TRANSMISSION_TYPE, CREATED_DT, CREATED_BY, CHANGED_DT, CHANGED_BY FROM amir.TB_M_CAR_MODEL');
    
    return {
        data: result.recordset,
        rows: result.rowsAffected[0]
    };
};

const findCarModelById = async (id) => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query`SELECT ID, MODEL_CODE, MODEL_NAME, COLOR, TRANSMISSION_TYPE, CREATED_DT, CREATED_BY, CHANGED_DT, CHANGED_BY FROM amir.TB_M_CAR_MODEL WHERE ID = ${id}`;

    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const findCarModelByCode = async (modelCode) => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query`SELECT ID, MODEL_CODE, MODEL_NAME, COLOR, TRANSMISSION_TYPE, CREATED_DT, CREATED_BY, CHANGED_DT, CHANGED_BY FROM amir.TB_M_CAR_MODEL WHERE MODEL_CODE = ${modelCode}`;
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const insertCarModel = async (carModelData) => {
    const pool = await poolPromise;
    const request = pool.request();
    const { MODEL_CODE, MODEL_NAME, COLOR, TRANSMISSION_TYPE, CREATED_BY } = carModelData;

    const businessKeyResult = await pool.request()
            .input('Input_Prefix', 'MOD')
            .output('Output_NewID', sql.VarChar(50), null)
            .execute('amir.usp_GenerateBusinessKey');

    const result = await request.query`
        INSERT INTO amir.TB_M_CAR_MODEL (ID, MODEL_CODE, MODEL_NAME, COLOR, TRANSMISSION_TYPE, CREATED_BY, CREATED_DT) 
        OUTPUT INSERTED.ID, INSERTED.MODEL_CODE, INSERTED.MODEL_NAME, INSERTED.COLOR, INSERTED.TRANSMISSION_TYPE, INSERTED.CREATED_BY, INSERTED.CREATED_DT
        VALUES (${businessKeyResult.output.Output_NewID}, ${MODEL_CODE}, ${MODEL_NAME}, ${COLOR}, ${TRANSMISSION_TYPE}, ${CREATED_BY}, GETDATE())`;
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const updateCarModelById = async (id, carModelData) => {
    const pool = await poolPromise;
    const request = pool.request();
    const { MODEL_CODE, MODEL_NAME, COLOR, TRANSMISSION_TYPE, CHANGED_BY } = carModelData;
    const result = await request.query`
        UPDATE amir.TB_M_CAR_MODEL SET MODEL_CODE = ${MODEL_CODE}, MODEL_NAME = ${MODEL_NAME}, 
        COLOR = ${COLOR}, TRANSMISSION_TYPE = ${TRANSMISSION_TYPE}, 
        CHANGED_BY = ${CHANGED_BY}, CHANGED_DT = GETDATE() WHERE ID = ${id};
        SELECT ID, MODEL_CODE, MODEL_NAME, COLOR, TRANSMISSION_TYPE, CREATED_BY, CREATED_DT, CHANGED_BY, CHANGED_DT 
        FROM amir.TB_M_CAR_MODEL WHERE ID = ${id}`;
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const deleteCarModelById = async (id) => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query`
        DELETE FROM amir.TB_M_CAR_MODEL WHERE ID = ${id}`;
    
    return {
        data: null,
        rows: result.rowsAffected[0]
    };
};

module.exports = {
    findAllCarModel,
    findCarModelById,
    findCarModelByCode,
    insertCarModel,
    updateCarModelById,
    deleteCarModelById
};
