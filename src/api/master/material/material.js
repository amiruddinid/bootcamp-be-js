const express = require('express');
const router = express.Router();
const { poolPromise } = require('../../../config/db');

// CLEAN ARCHITECTURE
// asynchronous 
router.get('/', async(req, res) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .query('SELECT * FROM amir.TB_M_MATERIAL');
    
    res.status(200).json({
        message: 'Data material berhasil diambil',
        data: result.recordset
    })
})

module.exports = router;