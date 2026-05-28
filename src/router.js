const express = require('express');
const router = express.Router();
const materialRouter =
    require('./api/master/material/material.controller')
const roleRouter =
    require('./api/master/role/role.controller')    
// const carModelRouter = 
//     require('./api/master/carModel/carModel')
const errorTestRouter =
    require('./api/master/error-test/test') 
//auth
const authRouter = require('./api/auth/auth.controller');


router.use('/material', materialRouter)
router.use('/role', roleRouter)
// router.use('/car-model', carModelRouter)
router.use('/error-test', errorTestRouter)
//auth
router.use('/auth', authRouter)

//default export
module.exports = router;