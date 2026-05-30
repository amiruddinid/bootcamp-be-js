const { poolPromise } = require('../../../config/db');

const findAllUsers = async () => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query(`
        SELECT u.USERNAME, u.NOREG, u.EMAIL, u.ROLE_ID, u.CREATED_DT, u.CREATED_BY, u.CHANGED_DT, u.CHANGED_BY, r.ROLE_NAME 
        FROM amir.TB_M_USER u
        JOIN amir.TB_M_ROLE r ON u.ROLE_ID = r.ID
    `);
    
    return {
        data: result.recordset,
        rows: result.rowsAffected[0]
    };
};

const findUserById = async (username) => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query`
        SELECT u.USERNAME, u.PASSWORD, u.NOREG, u.EMAIL, u.ROLE_ID, u.CREATED_DT, u.CREATED_BY, u.CHANGED_DT, u.CHANGED_BY, r.ROLE_NAME 
        FROM amir.TB_M_USER u
        JOIN amir.TB_M_ROLE r ON u.ROLE_ID = r.ID
        WHERE u.USERNAME = ${username}
    `;

    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const insertUser = async (userData) => {
    const pool = await poolPromise;
    const request = pool.request();
    const { USERNAME, PASSWORD, NOREG, EMAIL, ROLE_ID, CREATED_BY } = userData;

    const result = await request.query`
        INSERT INTO amir.TB_M_USER (USERNAME, PASSWORD, NOREG, EMAIL, ROLE_ID, CREATED_BY, CREATED_DT) 
        OUTPUT INSERTED.USERNAME, INSERTED.NOREG, INSERTED.EMAIL, INSERTED.ROLE_ID, INSERTED.CREATED_BY, INSERTED.CREATED_DT
        VALUES (${USERNAME}, ${PASSWORD}, ${NOREG}, ${EMAIL}, ${ROLE_ID}, ${CREATED_BY}, GETDATE())`;
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const updateUserById = async (username, userData) => {
    const pool = await poolPromise;
    const request = pool.request();
    const { PASSWORD, NOREG, EMAIL, ROLE_ID, CHANGED_BY } = userData;
    
    let result;
    if (PASSWORD) {
        result = await request.query`
            UPDATE amir.TB_M_USER SET PASSWORD = ${PASSWORD}, NOREG = ${NOREG}, 
            EMAIL = ${EMAIL}, ROLE_ID = ${ROLE_ID}, CHANGED_BY = ${CHANGED_BY}, CHANGED_DT = GETDATE()
            WHERE USERNAME = ${username};
            SELECT u.USERNAME, u.NOREG, u.EMAIL, u.ROLE_ID, u.CREATED_BY, u.CREATED_DT, u.CHANGED_BY, u.CHANGED_DT, r.ROLE_NAME 
            FROM amir.TB_M_USER u
            JOIN amir.TB_M_ROLE r ON u.ROLE_ID = r.ID
            WHERE u.USERNAME = ${username}`;
    } else {
        result = await request.query`
            UPDATE amir.TB_M_USER SET NOREG = ${NOREG}, 
            EMAIL = ${EMAIL}, ROLE_ID = ${ROLE_ID}, CHANGED_BY = ${CHANGED_BY}, CHANGED_DT = GETDATE()
            WHERE USERNAME = ${username};
            SELECT u.USERNAME, u.NOREG, u.EMAIL, u.ROLE_ID, u.CREATED_BY, u.CREATED_DT, u.CHANGED_BY, u.CHANGED_DT, r.ROLE_NAME 
            FROM amir.TB_M_USER u
            JOIN amir.TB_M_ROLE r ON u.ROLE_ID = r.ID
            WHERE u.USERNAME = ${username}`;
    }
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const deleteUserById = async (username) => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query`
        DELETE FROM amir.TB_M_USER WHERE USERNAME = ${username}`;
    
    return {
        data: null,
        rows: result.rowsAffected[0]
    };
};

module.exports = {
    findAllUsers,
    findUserById,
    insertUser,
    updateUserById,
    deleteUserById
};
