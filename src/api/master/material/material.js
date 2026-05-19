const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../../../config/db');

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

router.get('/:id', async(req, res) => {
    const id = req.params.id;
    const pool = await poolPromise;
    const result = await pool.request()
        .input('id', id)
        .query('SELECT * FROM amir.TB_M_MATERIAL WHERE ID = @id');

    res.status(200).json({
        message: 'Data material berhasil diambil',
        data: result.recordset[0]
    })
});

// POST / CREATE (Non SP)
// 1. Ambil data dari body request (sesuai dengan field yang 
// ada di table TB_M_MATERIAL)
// 2. Buat business key dengan execute sp usp_GenerateBusinessKey 
// simpan ke variabel
// 3. Insert data ke table TB_M_MATERIAL dengan body request 
// dan business key yang sudah dibuat
// 4. Return response dengan status 201 dan data yang sudah diinsert
router.post('/', async(req, res) => {
    const body = req.body;
    const pool = await poolPromise;
    
    const businessKeyResult = await pool.request()
        .input('Input_Prefix', 'MAT')
        .output('Output_NewID', sql.VarChar(50), null)
        .execute('amir.usp_GenerateBusinessKey');

    const result = await pool.request()
        .input('id', businessKeyResult.output.Output_NewID)
        .input('partNumber', body.PART_NUMBER)
        .input('name', body.NAME)
        .input('category', body.CATEGORY)
        .input('unit', body.UNIT)
        .input('supplierId', body.SUPPLIER_ID)
        .input('user', "system") // nanti diganti 
        // dengan user yang login        
        .query(`
            INSERT INTO amir.TB_M_MATERIAL (ID, PART_NUMBER, NAME, CATEGORY, 
            UNIT, SUPPLIER_ID, CREATED_BY, CREATED_DT)
            OUTPUT inserted.*
            VALUES (@id, @partNumber, @name, @category, @unit, 
            @supplierId, @user, GETDATE())
        `);

    res.status(201).json({
        message: 'Data material berhasil ditambahkan',
        data: result.recordset[0]
    })
})


// POST / CREATE (SP)
// 1. Ambil data dari body request (sesuai dengan field yang ada 
// di table TB_M_MATERIAL)
// 2. Execute sp usp_InsertMaterial dengan input data 
// dari body request
// 3. Return response dengan status 201 dan
// data yang sudah diinsert
router.post('/sp', async(req, res) => {
    const body = req.body;
    const pool = await poolPromise;
    // SQL Parameterization (DISARANKAN, AMAN DARI SQL INJECTION)
    const result = await pool.request()
        .input('Input_PartNumber', body.PART_NUMBER)
        .input('Input_Name', body.NAME)
        .input('Input_Category', body.CATEGORY)
        .input('Input_Unit', body.UNIT)
        .input('Input_SupplierID', body.SUPPLIER_ID)
        .input('Input_User', "system") // nanti diganti 
        // dengan user yang login        
        .execute('amir.usp_InsertMaterial');
    
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

    res.status(201).json({
        message: 'Data material berhasil ditambahkan',
    })
})

router.put('/:id', async(req, res) => {
    const id = req.params.id;
    const body = req.body;
    const pool = await poolPromise;

    const result = await pool.request()
        .input('id', id)
        .input('partNumber', body.PART_NUMBER)
        .input('name', body.NAME)
        .input('category', body.CATEGORY)
        .input('unit', body.UNIT)
        .input('supplierId', body.SUPPLIER_ID)
        .input('user', 'system')
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
        `);

    res.status(200).json({
        message: 'Data material berhasil diupdate',
        data: result.recordset[0]
    })
})

router.delete('/', async(req, res) => {
    const id = req.body.ID || req.body.id || req.query.id;
    const pool = await poolPromise;

    await pool.request()
        .input('id', id)
        .query('DELETE FROM amir.TB_M_MATERIAL WHERE ID = @id');

    res.status(200).json({
        message: 'Data material berhasil dihapus'
    })
})

module.exports = router;