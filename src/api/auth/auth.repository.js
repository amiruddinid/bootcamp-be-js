const { poolPromise, sql } = require('../../config/db');

// Repository untuk berinteraksi dengan database, seperti query untuk insert, select, dll

const findUserByUsername = async (USERNAME) => {
    const pool = await poolPromise; // tunggu koneksi pool database siap
    const user = await pool.request() // buat request SQL baru
        .query`
                SELECT u.*, r.ROLE_NAME FROM amir.TB_M_USER u 
                JOIN amir.TB_M_ROLE r ON u.ROLE_ID = r.ID 
                WHERE u.USERNAME = ${USERNAME} `; // eksekusi query untuk ambil seluruh data
    
    return {
        // kembalikan data pengguna pertama yang ditemukan
        ...user.recordset[0],
        rows: user.rowsAffected[0]
    };
};

const createUser = async ({USERNAME, PASSWORD, NOREG, EMAIL, ROLE_ID}) => {
    const pool = await poolPromise; // tunggu koneksi pool database siap
    const result = await pool.request() // buat request SQL baru
        .query`INSERT INTO amir.TB_M_USER (
                USERNAME, PASSWORD, NOREG, EMAIL, ROLE_ID, CREATED_DT, CREATED_BY)
                OUTPUT inserted.USERNAME, inserted.NOREG, inserted.EMAIL, inserted.ROLE_ID
                VALUES (${USERNAME}, ${PASSWORD}, 
                ${NOREG}, ${EMAIL}, ${ROLE_ID}, GETDATE(), ${USERNAME})`;    
    
    return {
        ...result.recordset[0],
        rows: result.rowsAffected[0]
    };
}

const findUserFeatureByUsername = async (USERNAME) => {
    const pool = await poolPromise; // tunggu koneksi pool database siap
    const user = await pool.request() // buat request SQL baru
        .query`
                SELECT distinct rs.FEATURE FROM amir.TB_M_ROLE_PERMISSIONS rs
                JOIN amir.TB_M_USER u ON u.ROLE_ID = rs.ROLE_ID
                WHERE u.USERNAME = ${USERNAME} `; // eksekusi query untuk ambil seluruh data
    
    // DATA DARI DB :
    // [
    //     {
    //         FEATURE: 'createMaterial'
    //     },
    //     {
    //         FEATURE: 'deleteMaterial'
    //     }
    // ]
    
    const features = user.recordset.map(row => row.FEATURE);

    // Konversi ke array of string
    // ['createMaterial', 'deleteMaterial']

    return features;
}
const findUserFunctionByUsername = async (USERNAME) => {
    const pool = await poolPromise; // tunggu koneksi pool database siap
    const user = await pool.request() // buat request SQL baru
        .query`
                SELECT distinct rs.[FUNCTION] FROM amir.TB_M_ROLE_PERMISSIONS rs
                JOIN amir.TB_M_USER u ON u.ROLE_ID = rs.ROLE_ID
                WHERE u.USERNAME = ${USERNAME} `; // eksekusi query untuk ambil seluruh data
    
    // DATA DARI DB :
    // [
    //     {
    //         FUNCTION: 'masterMaterial'
    //     },
    //     {
    //         FUNCTION: 'masterUser    '
    //     }
    // ]
    
    const functions = user.recordset.map(row => row.FUNCTION);

    // Konversi ke array of string
    // ['masterMaterial', 'masterUser']

    return functions;
}

module.exports = {
    findUserByUsername,
    createUser,
    findUserFeatureByUsername,
    findUserFunctionByUsername
}