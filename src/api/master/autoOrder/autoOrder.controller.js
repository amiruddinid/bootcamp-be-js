const express = require('express');
const router = express.Router();
const validateInput = require('../../../middlewares/validate');
const authorize = require('../../../middlewares/authorize');
const { postUpdateConfigSchema } = require('./autoOrder.model');
const {
    getJobConfigService,
    updateJobConfigService,
    triggerJobService,
    getInventoryStatusService
} = require('./autoOrder.service');

// Protect all endpoints with authorization middleware
router.use(authorize);

// GET /api/auto-order/config - Retrieve current job schedule time
router.get('/config', async (req, res) => {
    const serviceResponse = await getJobConfigService();
    return res.status(serviceResponse.status).json(serviceResponse);
});

// PUT /api/auto-order/config - Update the job schedule execution time
router.put('/config', validateInput(postUpdateConfigSchema), async (req, res) => {
    const { scheduleTime } = req.body;
    // Get username from decoded token user info (see authorize middleware)
    const username = req.user && req.user.data ? req.user.data.username : 'SYSTEM';
    
    const serviceResponse = await updateJobConfigService(scheduleTime, username);
    return res.status(serviceResponse.status).json(serviceResponse);
});

// POST /api/auto-order/trigger - Manually trigger the auto-order job execution immediately
router.post('/trigger', async (req, res) => {
    const serviceResponse = await triggerJobService();
    return res.status(serviceResponse.status).json(serviceResponse);
});

// GET /api/auto-order/inventory-status - Retrieve materials and their total inventory stock levels
router.get('/inventory-status', async (req, res) => {
    const serviceResponse = await getInventoryStatusService();
    return res.status(serviceResponse.status).json(serviceResponse);
});

module.exports = router;
