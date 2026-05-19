const express = require('express');
const router = express.Router();
const materialRouter =
    require('./api/master/material/material')
// const carModelRouter = 
//     require('./api/master/carModel/carModel')

router.use('/material', materialRouter)
// router.use('/car-model', carModelRouter)

//default export
module.exports = router;