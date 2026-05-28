const express = require('express');
const router = express.Router();
const validateInput = require('../../../middlewares/validate');
const authorize = require('../../../middlewares/authorize');
const {featureGuard, functionGuard} = require('../../../middlewares/guard');
const {getAllMaterial, getMaterialById, createMaterial, updateMaterial, deleteMaterial} = 
    require('./material.service');
const { postMaterialSchema, putMaterialSchema, deleteMaterialSchema } = require('./material.model');

router.use(authorize, functionGuard('masterMaterial')); // pasang middleware authorize untuk semua route di router ini

// GET /api/master/material : untuk mengambil semua material
router.get('/', featureGuard("viewMaterial"), 
    async(req, res, next) => { 
        const serviceResponse = await 
            getAllMaterial(); // panggil service untuk mengambil semua material
    return res.status(serviceResponse.status)
        .json(serviceResponse.data);
});

// GET /api/master/material/:id : untuk mengambil material berdasarkan ID (detail material)
router.get('/:id', featureGuard('viewMaterialDetail'), 
    async(req, res, next) => {
        const serviceResponse = await 
            getMaterialById(req.params.id); // panggil service untuk mengambil material berdasarkan ID
        return res.status(serviceResponse.status)
            .json(serviceResponse.data);
    }
);

// POST /api/master/material : untuk membuat material baru
router.post('/', featureGuard("createMaterial"), validateInput(postMaterialSchema),
async(req, res, next) => {
    const serviceResponse = await createMaterial({
        ...req.body,
        CREATED_BY: req.user.data.username
    }); // panggil service untuk membuat material baru
    return res.status(serviceResponse.status)
        .json(serviceResponse.data);
});

// PUT /api/master/material/:id : untuk mengupdate material berdasarkan ID
router.put('/:id', featureGuard("editMaterial"), validateInput(putMaterialSchema),
    async(req, res, next) => {
        const serviceResponse = await updateMaterial(req.params.id, {
            ...req.body,
            CHANGED_BY: req.user.data.username
        }); // panggil service untuk mengupdate material
        return res.status(serviceResponse.status)
            .json(serviceResponse.data);
    }
);

// DELETE /api/master/material/:id : untuk menghapus material berdasarkan ID
router.delete('/:id', featureGuard("deleteMaterial"), validateInput(deleteMaterialSchema), 
    async(req, res, next) => {
        const serviceResponse = await deleteMaterialById(req.params.id); // panggil service untuk menghapus material
        return res.status(serviceResponse.status)
            .json(serviceResponse.data);
    }
);

module.exports = router;