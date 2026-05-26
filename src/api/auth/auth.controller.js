const express = require('express');
const router = express.Router();
const {postRegisterSchema, postLoginSchema} = require('./auth.model');
const validateInput = require('../../middlewares/validate');
const authorize = require('../../middlewares/authorize');
const {registerUser, loginUser, getProfile} = require('./auth.service');

// Controller : (routing, menerima request, memanggil service, mengirim response)
// 1. memproses data, 
// 2. menerima request dari client, 
// 3. memanggil service untuk memproses data, 
// 4. dan mengirim response ke client
router.post('/register', validateInput(postRegisterSchema), async (req, res) => {
    const {USERNAME, PASSWORD, NOREG, EMAIL, ROLE_ID} = req.body;
    const serviceResponse = await 
        registerUser({USERNAME, PASSWORD, NOREG, EMAIL, ROLE_ID});
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

router.post('/login', validateInput(postLoginSchema), async (req, res) => {
    const {username, password} = req.body;
    const serviceResponse = await 
        loginUser({username, password});
    return res.status(serviceResponse.status).json(serviceResponse.data);
});

router.get('/profile', authorize, (req, res) => {
    return res.status(200).json({
        status: 200,
        data:req.user.data,
        message: 'Profile retrieved successfully'
    });
});

module.exports = router;
