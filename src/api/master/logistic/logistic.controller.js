const express = require('express');
const router = express.Router();
const validateInput = require('../../../middlewares/validate');
const authorize = require('../../../middlewares/authorize');
const { featureGuard, functionGuard } = require('../../../middlewares/guard');
const { getAllLogistic, getLogisticById, createLogistic, updateLogistic, deleteLogistic } = require('./logistic.service');
const { postLogisticSchema, putLogisticSchema, deleteLogisticSchema } = require('./logistic.model');

router.use(authorize, functionGuard('masterLogistic'));

// GET /api/master/logistic
router.get('/', featureGuard("viewLogistic"), async (req, res, next) => { 
    const serviceResponse = await getAllLogistic();
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// GET /api/master/logistic/:id
router.get('/:id', featureGuard('viewLogisticDetail'), async (req, res, next) => {
    const serviceResponse = await getLogisticById(req.params.id);
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// POST /api/master/logistic
router.post('/', featureGuard("createLogistic"), validateInput(postLogisticSchema), async (req, res, next) => {
    const serviceResponse = await createLogistic({
        ...req.body,
        CREATED_BY: req.user.data.username
    });
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// PUT /api/master/logistic/:id
router.put('/:id', featureGuard("updateLogistic"), validateInput(putLogisticSchema), async (req, res, next) => {
    const serviceResponse = await updateLogistic(req.params.id, {
        ...req.body,
        CHANGED_BY: req.user.data.username
    });
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// DELETE /api/master/logistic/:id
router.delete('/:id', featureGuard("deleteLogistic"), validateInput(deleteLogisticSchema), async (req, res, next) => {
    const serviceResponse = await deleteLogistic(req.params.id);
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

module.exports = router;
