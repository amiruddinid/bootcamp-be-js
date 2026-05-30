const express = require('express');
const router = express.Router();
const validateInput = require('../../../middlewares/validate');
const authorize = require('../../../middlewares/authorize');
const { featureGuard, functionGuard } = require('../../../middlewares/guard');
const { getAllCustomer, getCustomerById, createCustomer, updateCustomer, deleteCustomer } = require('./customer.service');
const { postCustomerSchema, putCustomerSchema, deleteCustomerSchema } = require('./customer.model');

router.use(authorize, functionGuard('masterCustomer'));

// GET /api/master/customer
router.get('/', featureGuard("viewCustomer"), async (req, res, next) => { 
    const serviceResponse = await getAllCustomer();
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// GET /api/master/customer/:id
router.get('/:id', featureGuard('viewCustomerDetail'), async (req, res, next) => {
    const serviceResponse = await getCustomerById(req.params.id);
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// POST /api/master/customer
router.post('/', featureGuard("createCustomer"), validateInput(postCustomerSchema), async (req, res, next) => {
    const serviceResponse = await createCustomer({
        ...req.body,
        CREATED_BY: req.user.data.username
    });
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// PUT /api/master/customer/:id
router.put('/:id', featureGuard("updateCustomer"), validateInput(putCustomerSchema), async (req, res, next) => {
    const serviceResponse = await updateCustomer(req.params.id, {
        ...req.body,
        CHANGED_BY: req.user.data.username
    });
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// DELETE /api/master/customer/:id
router.delete('/:id', featureGuard("deleteCustomer"), validateInput(deleteCustomerSchema), async (req, res, next) => {
    const serviceResponse = await deleteCustomer(req.params.id);
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

module.exports = router;
