const express = require('express');
const router = express.Router();
const validateInput = require('../../../middlewares/validate');
const authorize = require('../../../middlewares/authorize');
const { featureGuard, functionGuard } = require('../../../middlewares/guard');
const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = require('./user.service');
const { postUserSchema, putUserSchema, deleteUserSchema } = require('./user.model');

router.use(authorize, functionGuard('masterUser'));

// GET /api/master/user
router.get('/', featureGuard("viewUser"), async (req, res, next) => { 
    const serviceResponse = await getAllUsers();
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// GET /api/master/user/:id
router.get('/:id', featureGuard('viewUserDetail'), async (req, res, next) => {
    const serviceResponse = await getUserById(req.params.id);
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// POST /api/master/user
router.post('/', featureGuard("createUser"), validateInput(postUserSchema), async (req, res, next) => {
    const serviceResponse = await createUser({
        ...req.body,
        CREATED_BY: req.user.data.username
    });
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// PUT /api/master/user/:id
router.put('/:id', featureGuard("updateUser"), validateInput(putUserSchema), async (req, res, next) => {
    const serviceResponse = await updateUser(req.params.id, {
        ...req.body,
        CHANGED_BY: req.user.data.username
    });
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// DELETE /api/master/user/:id
router.delete('/:id', featureGuard("deleteUser"), validateInput(deleteUserSchema), async (req, res, next) => {
    const serviceResponse = await deleteUser(req.params.id);
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

module.exports = router;
