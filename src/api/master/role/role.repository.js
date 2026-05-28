const { poolPromise, sql } = require('../../../config/db');

const findAllRole = async () => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query('SELECT ID, ROLE_NAME, CREATED_DT, CREATED_BY, CHANGED_DT, CHANGED_BY FROM amir.TB_M_ROLE');
    
    return {
        data: result.recordset,
        rows: result.rowsAffected[0]
    };
};

const findRoleById = async (id) => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await 
        request.query`SELECT * FROM amir.TB_M_ROLE WHERE ID = ${id}`;

    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const findRoleByName = async ( roleName ) => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query`SELECT ID, ROLE_NAME, 
        CREATED_DT, CREATED_BY, CHANGED_DT, CHANGED_BY FROM amir.TB_M_ROLE WHERE ROLE_NAME = ${roleName}`
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const insertRole = async (roleData) => {
    const pool = await poolPromise;
    const request = pool.request();
    const {ROLE_NAME, CREATED_BY} = roleData;

    const result = await request.query`
        INSERT INTO amir.TB_M_ROLE (ROLE_NAME, CREATED_BY, CREATED_DT) 
        OUTPUT INSERTED.ID, INSERTED.ROLE_NAME, INSERTED.CREATED_BY, INSERTED.CREATED_DT
        VALUES (${ROLE_NAME}, ${CREATED_BY}, GETDATE())`;
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const updateRoleById = async (id, roleData) => {
    const pool = await poolPromise;
    const request = pool.request();
    const {ROLE_NAME, CHANGED_BY} = roleData;
    const result = await request.query`
        UPDATE amir.TB_M_ROLE SET ROLE_NAME = ${ROLE_NAME}, 
        CHANGED_BY = ${CHANGED_BY}, CHANGED_DT = GETDATE() WHERE ID = ${id};
        SELECT ID, ROLE_NAME, CREATED_BY, CREATED_DT, CHANGED_BY, CHANGED_DT 
        FROM amir.TB_M_ROLE WHERE ID = ${id}`;
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const deleteRoleById = async (id) => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query`
        DELETE FROM amir.TB_M_ROLE WHERE ID = ${id}`;
    
    return {
        data: null,
        rows: result.rowsAffected[0]
    };
};

module.exports = {
    findAllRole,
    findRoleById,
    findRoleByName,
    insertRole,
    updateRoleById,
    deleteRoleById
};