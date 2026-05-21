const express = require('express');
const router = express.Router();
const materialRouter =
    require('./api/master/material/material')
// const carModelRouter = 
//     require('./api/master/carModel/carModel')
const errorTestRouter =
    require('./api/master/error-test/test') 

router.use('/material', materialRouter)
// router.use('/car-model', carModelRouter)
router.use('/error-test', errorTestRouter)
//default export
module.exports = router;