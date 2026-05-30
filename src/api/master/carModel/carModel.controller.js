const express = require('express');
const router = express.Router();
const validateInput = require('../../../middlewares/validate');
const authorize = require('../../../middlewares/authorize');
const { featureGuard, functionGuard } = require('../../../middlewares/guard');
const { getAllCarModel, getCarModelById, createCarModel, updateCarModel, deleteCarModel } = require('./carModel.service');
const { postCarModelSchema, putCarModelSchema, deleteCarModelSchema } = require('./carModel.model');

router.use(authorize, functionGuard('masterCarModel'));

// GET /api/master/car-model
router.get('/', featureGuard("viewCarModel"), async (req, res, next) => { 
    const serviceResponse = await getAllCarModel();
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// GET /api/master/car-model/:id
router.get('/:id', featureGuard('viewCarModelDetail'), async (req, res, next) => {
    const serviceResponse = await getCarModelById(req.params.id);
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// POST /api/master/car-model
router.post('/', featureGuard("createCarModel"), validateInput(postCarModelSchema), async (req, res, next) => {
    const serviceResponse = await createCarModel({
        ...req.body,
        CREATED_BY: req.user.data.username
    });
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// PUT /api/master/car-model/:id
router.put('/:id', featureGuard("updateCarModel"), validateInput(putCarModelSchema), async (req, res, next) => {
    const serviceResponse = await updateCarModel(req.params.id, {
        ...req.body,
        CHANGED_BY: req.user.data.username
    });
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// DELETE /api/master/car-model/:id
router.delete('/:id', featureGuard("deleteCarModel"), validateInput(deleteCarModelSchema), async (req, res, next) => {
    const serviceResponse = await deleteCarModel(req.params.id);
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

module.exports = router;
