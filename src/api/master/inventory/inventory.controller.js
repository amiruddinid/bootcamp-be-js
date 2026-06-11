const express = require('express');
const router = express.Router();
const authorize = require('../../../middlewares/authorize');
const { 
    getInventoryList, 
    getReceiptList, 
    approveReceiptService 
} = require('./inventory.service');

// Protect all routes with authorize middleware
router.use(authorize);

// GET /api/inventory - Retrieve current inventory stock levels
router.get('/', async (req, res) => {
    const serviceResponse = await getInventoryList();
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// GET /api/inventory/receipts - Retrieve all material receipt orders
router.get('/receipts', async (req, res) => {
    const serviceResponse = await getReceiptList();
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// POST /api/inventory/approve/:id - Approve order and commit quantities to inventory
router.post('/approve/:id', async (req, res) => {
    const username = req.user && req.user.data ? req.user.data.username : 'SYSTEM';
    const serviceResponse = await approveReceiptService(req.params.id, username);
    return res.status(serviceResponse.status).json(serviceResponse);
});

module.exports = router;
