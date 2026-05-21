const express = require('express'); // import framework Express untuk membuat HTTP server
const router = express.Router(); // buat router baru untuk mendefinisikan route material
const { poolPromise, sql } = require('../../../config/db'); // import koneksi database dan helper SQL

// TEST ERROR HANDLING
router.get('/', async(req, res) => {
    throw new Error("terjadi kesalahan");
 }) 

// TEST Try Catch
router.get('/try-catch', async(req, res) => {
    try {
        //statement try 
        throw new Error("terjadi kesalahan");
    } catch (error) {
        //statement catch
        res.status(500).json({
            message: error.message
        })
    }
})

router.get('/next', async(req, res, next) => {
    try {
        throw new Error("Terjadi kesalahan (test next)");
    } catch (error) {
        next(error);
    }
})

router.get('/custom', async(req, res, next) => {
    try {
        const user = null;
        if(!user){
            return next(new Error("User tidak ditemukan"));
        }

        res.status(200).json({
            message: "User ditemukan",
            data: user
        })
    } catch (error) {
        next(error);
    }
})

 module.exports = router; 