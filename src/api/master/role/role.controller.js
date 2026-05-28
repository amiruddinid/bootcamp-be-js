const express = require('express');
const router = express.Router();
const validateInput = require('../../../middlewares/validate');
const authorize = require('../../../middlewares/authorize');
const {featureGuard, functionGuard} = require('../../../middlewares/guard');
const {getAllRole, getRoleById, createRole, updateRole, deleteRole} = 
    require('./role.service');
const { postRoleSchema, putRoleSchema, deleteRoleSchema } = require('./role.model');

router.use(authorize, functionGuard('masterRole')); // pasang middleware authorize untuk semua route di router ini

// GET /api/master/role : untuk mengambil semua role
router.get('/', featureGuard("viewRole"), 
    async(req, res, next) => { 
        const serviceResponse = await 
            getAllRole(); // panggil service untuk mengambil semua role
    return res.status(serviceResponse.status)
        .json(serviceResponse.data);
});

// GET /api/master/role/:id : untuk mengambil role berdasarkan ID (detail role)
router.get('/:id', featureGuard('viewRoleDetail'), 
    async(req, res, next) => {
        const serviceResponse = await 
            getRoleById(req.params.id); // panggil service untuk mengambil role berdasarkan ID
        return res.status(serviceResponse.status)
            .json(serviceResponse.data);
    }
);

// POST /api/master/role : untuk membuat role baru
router.post('/', featureGuard("createRole"), validateInput(postRoleSchema),
async(req, res, next) => {
    const serviceResponse = await createRole({
        ...req.body,
        CREATED_BY: req.user.data.username
    }); // panggil service untuk membuat role baru
    return res.status(serviceResponse.status)
        .json(serviceResponse.data);
});

// PUT /api/master/role/:id : untuk mengupdate role berdasarkan ID
router.put('/:id', featureGuard("updateRole"), validateInput(putRoleSchema),
    async(req, res, next) => {
        const serviceResponse = await updateRole(req.params.id, {
            ...req.body,
            CHANGED_BY: req.user.data.username
        }); // panggil service untuk mengupdate role
        return res.status(serviceResponse.status)
            .json(serviceResponse.data);
    }
);

// DELETE /api/master/role/:id : untuk menghapus role berdasarkan ID
router.delete('/:id', featureGuard("deleteRole"), validateInput(deleteRoleSchema), 
    async(req, res, next) => {
        const serviceResponse = await deleteRole(req.params.id); // panggil service untuk menghapus role
        return res.status(serviceResponse.status)
            .json(serviceResponse.data);
    }
);

module.exports = router;