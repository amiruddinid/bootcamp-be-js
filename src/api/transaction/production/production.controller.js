const express = require('express');
const router = express.Router();
const validateInput = require('../../../middlewares/validate'); // Middleware untuk validasi schema input payload (Zod)
const authorize = require('../../../middlewares/authorize');   // Middleware untuk memverifikasi autentikasi JWT token
const { featureGuard, functionGuard } = require('../../../middlewares/guard'); // Middleware untuk membatasi akses fungsi & fitur user
const { getAllProduction, getProductionById, createProduction, updateProduction } = require('./production.service');
const { postProductionSchema, putProductionStatusSchema, getProductionByIdSchema } = require('./production.model');

// Gunakan middleware verifikasi token (authorize) dan hak akses modul (functionGuard) untuk seluruh endpoint di router ini
router.use(authorize, functionGuard('transactionProduction'));

// GET /api/transaction/production : Untuk mengambil daftar seluruh perintah produksi
router.get('/', featureGuard("viewProduction"), async (req, res, next) => {
    const serviceResponse = await getAllProduction();
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// GET /api/transaction/production/:id : Untuk mengambil detail lengkap perintah produksi tertentu
router.get('/:id', featureGuard('viewProductionDetail'), validateInput(getProductionByIdSchema), async (req, res, next) => {
    const serviceResponse = await getProductionById(req.params.id);
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// POST /api/transaction/production : Untuk membuat perintah produksi baru (memotong stok dan mencatat logs)
router.post('/', featureGuard("createProduction"), validateInput(postProductionSchema), async (req, res, next) => {
    const serviceResponse = await createProduction({
        ...req.body,
        CREATED_BY: req.user.data.username // Lampirkan username pembuat transaksi dari data JWT token
    });
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// PUT /api/transaction/production/:id/status : Untuk mengupdate status produksi (In Progress, Completed, Cancelled)
router.put('/:id/status', featureGuard("updateProductionStatus"), validateInput(putProductionStatusSchema), async (req, res, next) => {
    const serviceResponse = await updateProduction(req.params.id, {
        ...req.body,
        CHANGED_BY: req.user.data.username // Lampirkan username pengubah transaksi dari data JWT token
    });
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

module.exports = router;
