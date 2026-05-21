const express = require('express');
const router = express.Router();
const {generateToken, verifyToken} = require('../../utils/jwt');
const {hashPassword, comparePassword} = require('../../utils/bcrypt');
const {postRegisterSchema} = require('./auth.schema');
const validateInput = require('../../middlewares/validate');
const { poolPromise, sql } = require('../../config/db');

// Simulasi database pengguna
const users = [];

// Register
router.post('/register', validateInput(postRegisterSchema), async (req, res) => {
    try {
        const {USERNAME, PASSWORD, NOREG, EMAIL, ROLE_ID} = req.body;

        const pool = await poolPromise; // tunggu koneksi pool database siap
        const user = await pool.request() // buat request SQL baru
            .query`SELECT USERNAME FROM amir.TB_M_USER WHERE USERNAME = ${USERNAME}`; // eksekusi query untuk ambil seluruh data
            
        // Cek apakah username sudah ada
        if (user.recordset.length > 0) {
            return res.status(400).json({message: 'Username already exists'});
        }

        // Hash password
        const hashedPassword = await hashPassword(PASSWORD);
        console.log(`Password asli: ${PASSWORD}, 
            Password hash: ${hashedPassword}`);

        // Simpan pengguna ke "database" // tunggu koneksi pool database siap
        const result = await pool.request() // buat request SQL baru
            .query`INSERT INTO amir.TB_M_USER (
                USERNAME, PASSWORD, NOREG, EMAIL, ROLE_ID, CREATED_DT, CREATED_BY)
                OUTPUT inserted.USERNAME, inserted.NOREG, inserted.EMAIL, inserted.ROLE_ID
                VALUES (${USERNAME}, ${hashedPassword}, 
                ${NOREG}, ${EMAIL}, ${ROLE_ID}, GETDATE(), ${USERNAME})`;
        
        if(result.rowsAffected[0] === 0) {
            return res.status(500).json({message: 'Failed to register user'});
        }
        
        res.status(201).json({
            data: {
                USERNAME: result.recordset[0].USERNAME,
                NOREG: result.recordset[0].NOREG,
                EMAIL: result.recordset[0].EMAIL,
                ROLE_ID: result.recordset[0].ROLE_ID
            },
            message: 'User registered successfully'});
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({message: 'Internal server error'});
    }
});

// Login 
router.post('/login', async (req, res) => {
    const {username, password} = req.body;

    // Cari pengguna berdasarkan username
    const user = users.find(user => user.username === username);
    if (!user) {
        return res.status(400).json({message: 'Please check your username and password'});
    }

    // Bandingkan password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        return res.status(400).json({message: 'Please check your username and password'});
    }

    // Generate token
    const token = generateToken({username: user.username});
    res.status(200).json({
       data:{token},
       message: 'Login successful'
    });
});

module.exports = router;