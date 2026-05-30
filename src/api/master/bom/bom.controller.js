const express = require('express');
const router = express.Router();
const validateInput = require('../../../middlewares/validate');
const authorize = require('../../../middlewares/authorize');
const { featureGuard, functionGuard } = require('../../../middlewares/guard');
const { getAllBom, getBomById, createBom, updateBom, deleteBom } = require('./bom.service');
const { postBomSchema, putBomSchema, deleteBomSchema } = require('./bom.model');

router.use(authorize, functionGuard('masterBom'));

// GET /api/master/bom
router.get('/', featureGuard("viewBom"), async (req, res, next) => { 
    const serviceResponse = await getAllBom();
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// GET /api/master/bom/:id
router.get('/:id', featureGuard('viewBomDetail'), async (req, res, next) => {
    const serviceResponse = await getBomById(req.params.id);
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// POST /api/master/bom
router.post('/', featureGuard("createBom"), validateInput(postBomSchema), async (req, res, next) => {
    const serviceResponse = await createBom({
        ...req.body,
        CREATED_BY: req.user.data.username
    });
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// PUT /api/master/bom/:id
router.put('/:id', featureGuard("updateBom"), validateInput(putBomSchema), async (req, res, next) => {
    const serviceResponse = await updateBom(req.params.id, {
        ...req.body
    });
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// DELETE /api/master/bom/:id
router.delete('/:id', featureGuard("deleteBom"), validateInput(deleteBomSchema), async (req, res, next) => {
    const serviceResponse = await deleteBom(req.params.id);
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

module.exports = router;
