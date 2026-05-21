const express = require('express'); // import framework Express untuk membuat HTTP server
const router = express.Router(); // buat router baru untuk mendefinisikan route material
const { poolPromise, sql } = require('../../../config/db'); // import koneksi database dan helper SQL
const AppError = require('../../../utils/AppError'); // import custom error class untuk error handling
const validateInput = require('../../../middlewares/validate'); // import middleware untuk validasi input
const { deleteMaterialByIdSchema, createMaterialSchema } = require('./material.schema'); // import schema validasi untuk delete material


// CLEAN ARCHITECTURE
// asynchronous 
router.get('/', async(req, res, next) => { // route GET untuk mengambil semua material
    try {
        const pool = await poolPromise; // tunggu koneksi pool database siap
        const result = await pool.request() // buat request SQL baru
            .query('SELECT * FROM amir.TB_M_MATERIAL'); // eksekusi query untuk ambil seluruh data
        
        res.status(200).json({ // kirim response HTTP 200 dengan payload JSON
            message: 'Data material berhasil diambil', // pesan sukses
            data: result.recordset // hasil query dikirim dalam field data
        })
    } catch (error) {
        return next(new AppError('Internal Server Error', 500));
    }
    
})

router.get('/:id', async(req, res, next) => { // route GET untuk mengambil material berdasarkan ID
    try {
        const id = req.params.id; // ambil parameter id dari URL
        const pool = await poolPromise; // dapatkan koneksi database dari pool
        const result = await pool.request() // buat request SQL baru
            .input('id', id) // binding parameter id untuk mencegah SQL injection
            .query('SELECT * FROM amir.TB_M_MATERIAL WHERE ID = @id'); // eksekusi query dengan filter ID

        if(result.recordset.length === 0){ // jika tidak ada data yang ditemukan
            return next(new AppError('Data material tidak ditemukan', 404)); // buat instance AppError dengan pesan dan status code, lalu lempar ke middleware error handler
        }

        res.status(200).json({ // kirim response HTTP 200
            message: 'Data material berhasil diambil', // pesan sukses
            data: result.recordset[0] // ambil baris pertama dari hasil query
        })
    } catch (error) {
        return next(new AppError('Internal Server Error', 500)); // jika terjadi error, buat instance AppError dan lempar ke middleware error handler
    }

    
});

// router.get('/:id', async(req, res, next) => { // route GET untuk mengambil material berdasarkan ID
    
//     try {
//         const id = req.params.id; // ambil parameter id dari URL
//         const pool = await poolPromise; // dapatkan koneksi database dari pool
//         const result = await pool.request() // buat request SQL baru
//             .input('id', id) // binding parameter id untuk mencegah SQL injection
//             .query('SELECT * FROM amir.TB_M_MATERIAL WHERE ID = @id'); // eksekusi query dengan filter ID
        
//         if(result.recordset.length === 0){ // jika tidak ada data yang ditemukan
//             return next(new AppError('Data material tidak ditemukan', 404)); // buat instance AppError dengan pesan dan status code, lalu lempar ke middleware error handler
//         }

//         res.status(200).json({ // kirim response HTTP 200
//             message: 'Data material berhasil diambil', // pesan sukses
//             data: result.recordset[0] // ambil baris pertama dari hasil query
//         })
//     } catch (error) {
//         return next(new AppError('Internal Server Error', 500)); // jika terjadi error, buat instance AppError dan lempar ke middleware error handler
//     }
// });

// POST / CREATE (Non SP)
// 1. Ambil data dari body request (sesuai dengan field yang 
// ada di table TB_M_MATERIAL)
// 2. Buat business key dengan execute sp usp_GenerateBusinessKey 
// simpan ke variabel
// 3. Insert data ke table TB_M_MATERIAL dengan body request 
// dan business key yang sudah dibuat
// 4. Return response dengan status 201 dan data yang sudah diinsert
router.post('/', validateInput(createMaterialSchema), async(req, res, next) => { // route POST untuk membuat material baru tanpa stored procedure
    try {
        const body = req.body; // ambil data request body dari client

        // // Validasi bad request: pastikan semua field wajib ada dan tidak kosong
        // const { PART_NUMBER, NAME, CATEGORY, UNIT, SUPPLIER_ID } = body;
        // if (!PART_NUMBER || !NAME || !CATEGORY || !UNIT || !SUPPLIER_ID) {
        //     return next(new AppError('Bad Request: PART_NUMBER, NAME, CATEGORY, UNIT, dan SUPPLIER_ID wajib diisi', 400));
        // }

        const pool = await poolPromise; // ambil koneksi pool database
        
        const businessKeyResult = await pool.request() // buat request baru untuk generate business key
            .input('Input_Prefix', 'MAT') // kirim prefix 'MAT' sebagai input ke stored procedure
            .output('Output_NewID', sql.VarChar(50), null) // deklarasikan output parameter untuk ID baru
            .execute('amir.usp_GenerateBusinessKey'); // jalankan stored procedure generate business key

        const result = await pool.request() // buat request baru untuk insert data
            .input('id', businessKeyResult.output.Output_NewID) // gunakan business key yang dihasilkan sebagai ID
            .input('partNumber', body.PART_NUMBER) // pasang nilai PART_NUMBER dari body request
            .input('name', body.NAME) // pasang nilai NAME dari body request
            .input('category', body.CATEGORY) // pasang nilai CATEGORY dari body request
            .input('unit', body.UNIT) // pasang nilai UNIT dari body request
            .input('supplierId', body.SUPPLIER_ID) // pasang nilai SUPPLIER_ID dari body request
            .input('user', "system") // pasang user yang membuat data (sementara hardcoded 'system')
            .query(`
                INSERT INTO amir.TB_M_MATERIAL (ID, PART_NUMBER, NAME, CATEGORY, 
                UNIT, SUPPLIER_ID, CREATED_BY, CREATED_DT)
                OUTPUT inserted.*
                VALUES (@id, @partNumber, @name, @category, @unit, 
                @supplierId, @user, GETDATE())
            `); // eksekusi insert dan kembalikan baris yang baru saja ditambahkan

        res.status(201).json({ // kirim response HTTP 201 saat data berhasil dibuat
            message: 'Data material berhasil ditambahkan', // pesan sukses
            data: result.recordset[0] // kirim data yang baru dibuat sebagai response
        })
    } catch (error) {
        return next(new AppError('Internal Server Error', 500));
    }
    
})

// POST / CREATE (SP)
// 1. Ambil data dari body request (sesuai dengan field yang ada 
// di table TB_M_MATERIAL)
// 2. Execute sp usp_InsertMaterial dengan input data 
// dari body request
// 3. Return response dengan status 201 dan
// data yang sudah diinsert
router.post('/sp', async(req, res, next) => { // route POST menggunakan stored procedure untuk insert material
    try {
        const body = req.body; // ambil data request body dari client

        // Validasi bad request: pastikan semua field wajib ada dan tidak kosong
        const { PART_NUMBER, NAME, CATEGORY, UNIT, SUPPLIER_ID } = body;
        if (!PART_NUMBER || !NAME || !CATEGORY || !UNIT || !SUPPLIER_ID) {
            return next(new AppError('Bad Request: PART_NUMBER, NAME, CATEGORY, UNIT, dan SUPPLIER_ID wajib diisi', 400));
        }

        const pool = await poolPromise; // ambil koneksi pool database
        // SQL Parameterization (DISARANKAN, AMAN DARI SQL INJECTION)
        const result = await pool.request() // buat request SQL baru
            .input('Input_PartNumber', body.PART_NUMBER) // pasang PART_NUMBER ke parameter stored procedure
            .input('Input_Name', body.NAME) // pasang NAME
            .input('Input_Category', body.CATEGORY) // pasang CATEGORY
            .input('Input_Unit', body.UNIT) // pasang UNIT
            .input('Input_SupplierID', body.SUPPLIER_ID) // pasang SUPPLIER_ID
            .input('Input_User', "system") // pasang user yang membuat data (sementara hardcoded 'system')
            .execute('amir.usp_InsertMaterial'); // jalankan stored procedure insert material
        
        // SQL Injection (TIDAK DISARANKAN, BERBAHAYA)
        // OWASP TOP 10
        // const result = await pool.request()      
        //     .query(`EXEC amir.usp_InsertMaterial 
        //         @Input_PartNumber='${body.PART_NUMBER}',
        //         @Input_Name='${body.NAME}',
        //         @Input_Category='${body.CATEGORY}',
        //         @Input_Unit='${body.UNIT}',
        //         @Input_SupplierID='${body.SUPPLIER_ID}',
        //         @Input_User='${body.USER}'
        //     `);
        // https://github.com/tediousjs/node-mssql#es6-tagged-template-literals
        // Jika tanpa () maka akan dianggap seperti Parameterization
        // const result = await pool.request()      
        //     .query`EXEC amir.usp_InsertMaterial 
        //         @Input_PartNumber='${body.PART_NUMBER}',
        //         @Input_Name='${body.NAME}',
        //         @Input_Category='${body.CATEGORY}',
        //         @Input_Unit='${body.UNIT}',
        //         @Input_SupplierID='${body.SUPPLIER_ID}',
        //         @Input_User='${body.USER}'
        //     `;

        res.status(201).json({ // kirim response HTTP 201 setelah insert berhasil
            message: 'Data material berhasil ditambahkan', // pesan sukses
        })
    } catch (error) {
        return next(new AppError('Internal Server Error', 500));
    }
    
})

router.put('/:id', async(req, res, next) => { // route PUT untuk mengupdate material berdasarkan ID
    try {
        const id = req.params.id; // ambil ID dari parameter URL
        const body = req.body; // ambil payload update dari request body

        // Validasi bad request: pastikan semua field wajib ada dan tidak kosong
        const { PART_NUMBER, NAME, CATEGORY, UNIT, SUPPLIER_ID } = body;
        if (!PART_NUMBER || !NAME || !CATEGORY || !UNIT || !SUPPLIER_ID) {
            return next(new AppError('Bad Request: PART_NUMBER, NAME, CATEGORY, UNIT, dan SUPPLIER_ID wajib diisi', 400));
        }

        const pool = await poolPromise; // ambil koneksi database

        const result = await pool.request() // buat request SQL baru
            .input('id', id) // pasang ID sebagai parameter
            .input('partNumber', body.PART_NUMBER) // pasang PART_NUMBER baru
            .input('name', body.NAME) // pasang NAME baru
            .input('category', body.CATEGORY) // pasang CATEGORY baru
            .input('unit', body.UNIT) // pasang UNIT baru
            .input('supplierId', body.SUPPLIER_ID) // pasang SUPPLIER_ID baru
            .input('user', 'system') // pasang user updater (sementara hardcoded 'system')
            .query(`
                UPDATE amir.TB_M_MATERIAL
                SET PART_NUMBER = @partNumber,
                    NAME = @name,
                    CATEGORY = @category,
                    UNIT = @unit,
                    SUPPLIER_ID = @supplierId,
                    UPDATED_BY = @user,
                    UPDATED_DT = GETDATE()
                OUTPUT inserted.*
                WHERE ID = @id
            `); // eksekusi update dan kembalikan baris yang diupdate

        res.status(200).json({ // kirim response HTTP 200 setelah update berhasil
            message: 'Data material berhasil diupdate', // pesan sukses
            data: result.recordset[0] // kirim data hasil update
        })
    } catch (error) {
        return next(new AppError('Internal Server Error', 500));
    }
    
})

router.delete('/:id', validateInput(deleteMaterialByIdSchema), async(req, res, next) => { // route DELETE untuk menghapus material berdasarkan ID
    try {
        const id = req.params.id; // ambil ID dari parameter URL

        const pool = await poolPromise; // ambil koneksi pool database

        const result = await pool.request() // buat request SQL baru
            .input('id', id) // binding parameter id untuk mencegah SQL injection
            .query('SELECT * FROM amir.TB_M_MATERIAL WHERE ID = @id'); // eksekusi query dengan filter ID
        
        if(result.recordset.length === 0){ // jika tidak ada data yang ditemukan
            return next(new AppError('Data material tidak ditemukan', 404)); // buat instance AppError dengan pesan dan status code, lalu lempar ke middleware error handler
        }

        await pool.request() // buat request SQL baru
            .input('id', id) // pasang ID sebagai parameter
            .query('DELETE FROM amir.TB_M_MATERIAL WHERE ID = @id'); // eksekusi hapus data

        res.status(200).json({ // kirim response HTTP 200 setelah data dihapus
            message: 'Data material berhasil dihapus' // pesan sukses
        })
    } catch (error) {
        return next(new AppError('Internal Server Error', 500));
    }
    
})

module.exports = router; // ekspor router agar dapat digunakan oleh app utama


// Buat handling error
// 1. Error input 400 (Bad Request)
// 2. Error Data Tidak Ada 404 (Not Found)
// 3. Error Sistem 500 (Internal Server Error)
