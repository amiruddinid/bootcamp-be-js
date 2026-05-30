const { poolPromise, sql } = require('../../../config/db');

const findAllRolePermissions = async () => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query(`
        SELECT rp.ID, rp.ROLE_ID, rp.[FUNCTION], rp.FEATURE, rp.CREATED_DT, rp.CREATED_BY, rp.CHANGED_DT, rp.CHANGED_BY, r.ROLE_NAME 
        FROM amir.TB_M_ROLE_PERMISSIONS rp
        JOIN amir.TB_M_ROLE r ON rp.ROLE_ID = r.ID
    `);
    
    return {
        data: result.recordset,
        rows: result.rowsAffected[0]
    };
};

const findRolePermissionsById = async (id) => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query`
        SELECT rp.ID, rp.ROLE_ID, rp.[FUNCTION], rp.FEATURE, rp.CREATED_DT, rp.CREATED_BY, rp.CHANGED_DT, rp.CHANGED_BY, r.ROLE_NAME 
        FROM amir.TB_M_ROLE_PERMISSIONS rp
        JOIN amir.TB_M_ROLE r ON rp.ROLE_ID = r.ID
        WHERE rp.ID = ${id}
    `;

    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const findRolePermissionsByDetails = async (roleId, func, feature) => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query`
        SELECT ID, ROLE_ID, [FUNCTION], FEATURE, CREATED_DT, CREATED_BY, CHANGED_DT, CHANGED_BY 
        FROM amir.TB_M_ROLE_PERMISSIONS 
        WHERE ROLE_ID = ${roleId} AND [FUNCTION] = ${func} AND FEATURE = ${feature}
    `;
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const insertRolePermissions = async (rolePermissionsData) => {
    const pool = await poolPromise;
    const request = pool.request();
    const { ROLE_ID, FUNCTION, FEATURE, CREATED_BY } = rolePermissionsData;

    const result = await request.query`
        INSERT INTO amir.TB_M_ROLE_PERMISSIONS (ROLE_ID, [FUNCTION], FEATURE, CREATED_BY, CREATED_DT) 
        OUTPUT INSERTED.ID, INSERTED.ROLE_ID, INSERTED.[FUNCTION], INSERTED.FEATURE, INSERTED.CREATED_BY, INSERTED.CREATED_DT
        VALUES (${ROLE_ID}, ${FUNCTION}, ${FEATURE}, ${CREATED_BY}, GETDATE())`;
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const updateRolePermissionsById = async (id, rolePermissionsData) => {
    const pool = await poolPromise;
    const request = pool.request();
    const { ROLE_ID, FUNCTION, FEATURE, CHANGED_BY } = rolePermissionsData;
    const result = await request.query`
        UPDATE amir.TB_M_ROLE_PERMISSIONS SET ROLE_ID = ${ROLE_ID}, [FUNCTION] = ${FUNCTION}, 
        FEATURE = ${FEATURE}, CHANGED_BY = ${CHANGED_BY}, CHANGED_DT = GETDATE() WHERE ID = ${id};
        SELECT ID, ROLE_ID, [FUNCTION], FEATURE, CREATED_BY, CREATED_DT, CHANGED_BY, CHANGED_DT 
        FROM amir.TB_M_ROLE_PERMISSIONS WHERE ID = ${id}`;
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const deleteRolePermissionsById = async (id) => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query`
        DELETE FROM amir.TB_M_ROLE_PERMISSIONS WHERE ID = ${id}`;
    
    return {
        data: null,
        rows: result.rowsAffected[0]
    };
};

module.exports = {
    findAllRolePermissions,
    findRolePermissionsById,
    findRolePermissionsByDetails,
    insertRolePermissions,
    updateRolePermissionsById,
    deleteRolePermissionsById
};
