const express = require('express');
const router = express.Router();
const validateInput = require('../../../middlewares/validate');
const authorize = require('../../../middlewares/authorize');
const { featureGuard, functionGuard } = require('../../../middlewares/guard');
const { getAllRolePermissions, getRolePermissionsById, createRolePermissions, updateRolePermissions, deleteRolePermissions } = require('./rolePermissions.service');
const { postRolePermissionsSchema, putRolePermissionsSchema, deleteRolePermissionsSchema } = require('./rolePermissions.model');

router.use(authorize, functionGuard('masterRolePermissions'));

// GET /api/master/role-permissions
router.get('/', featureGuard("viewRolePermissions"), async (req, res, next) => { 
    const serviceResponse = await getAllRolePermissions();
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// GET /api/master/role-permissions/:id
router.get('/:id', featureGuard('viewRolePermissionsDetail'), async (req, res, next) => {
    const serviceResponse = await getRolePermissionsById(req.params.id);
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// POST /api/master/role-permissions
router.post('/', featureGuard("createRolePermissions"), validateInput(postRolePermissionsSchema), async (req, res, next) => {
    const serviceResponse = await createRolePermissions({
        ...req.body,
        CREATED_BY: req.user.data.username
    });
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// PUT /api/master/role-permissions/:id
router.put('/:id', featureGuard("updateRolePermissions"), validateInput(putRolePermissionsSchema), async (req, res, next) => {
    const serviceResponse = await updateRolePermissions(req.params.id, {
        ...req.body,
        CHANGED_BY: req.user.data.username
    });
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

// DELETE /api/master/role-permissions/:id
router.delete('/:id', featureGuard("deleteRolePermissions"), validateInput(deleteRolePermissionsSchema), async (req, res, next) => {
    const serviceResponse = await deleteRolePermissions(req.params.id);
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

module.exports = router;
