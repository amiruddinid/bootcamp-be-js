const express = require('express');
const router = express.Router();
const {generateToken, verifyToken} = require('../../utils/jwt');
const {hashPassword, comparePassword} = require('../../utils/bcrypt');

// Simulasi database pengguna
const users = [];

// Register
router.post('/register', async (req, res) => {
    const {username, password} = req.body;

    // Cek apakah username sudah ada
    if (users.find(user => user.username === username)) {
        return res.status(400).json({message: 'Username already exists'});
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    console.log(`Password asli: ${password}, 
        Password hash: ${hashedPassword}`);

    // Simpan pengguna ke "database"
    users.push({username, password: hashedPassword});
    res.status(201).json({message: 'User registered successfully'});
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