const express = require('express');
const router = express.Router();
const validateInput = require('../../../middlewares/validate');
const authorize = require('../../../middlewares/authorize');
const { featureGuard, functionGuard } = require('../../../middlewares/guard');
const { getAllSupplier, getSupplierById, createSupplier, updateSupplier, deleteSupplier } = require('./supplier.service');
const { postSupplierSchema, putSupplierSchema, deleteSupplierSchema } = require('./supplier.model');

router.use(authorize, functionGuard('masterSupplier'));

// GET /api/master/supplier
router.get('/', featureGuard("viewSupplier"), async (req, res, next) => { 
    const serviceResponse = await getAllSupplier();
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// GET /api/master/supplier/:id
router.get('/:id', featureGuard('viewSupplierDetail'), async (req, res, next) => {
    const serviceResponse = await getSupplierById(req.params.id);
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// POST /api/master/supplier
router.post('/', featureGuard("createSupplier"), validateInput(postSupplierSchema), async (req, res, next) => {
    const serviceResponse = await createSupplier({
        ...req.body,
        CREATED_BY: req.user.data.username
    });
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// PUT /api/master/supplier/:id
router.put('/:id', featureGuard("updateSupplier"), validateInput(putSupplierSchema), async (req, res, next) => {
    const serviceResponse = await updateSupplier(req.params.id, {
        ...req.body,
        CHANGED_BY: req.user.data.username
    });
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// DELETE /api/master/supplier/:id
router.delete('/:id', featureGuard("deleteSupplier"), validateInput(deleteSupplierSchema), async (req, res, next) => {
    const serviceResponse = await deleteSupplier(req.params.id);
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

module.exports = router;
