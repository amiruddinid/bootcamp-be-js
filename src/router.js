const express = require('express');
const router = express.Router();
const materialRouter =
    require('./api/master/material/material')

router.use('/material', materialRouter)

module.exports = router;