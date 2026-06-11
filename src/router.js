const express = require('express');
const router = express.Router();

const materialRouter = require('./api/master/material/material.controller');
const roleRouter = require('./api/master/role/role.controller');
const carModelRouter = require('./api/master/carModel/carModel.controller');
const customerRouter = require('./api/master/customer/customer.controller');
const logisticRouter = require('./api/master/logistic/logistic.controller');
const supplierRouter = require('./api/master/supplier/supplier.controller');
const bomRouter = require('./api/master/bom/bom.controller');
const rolePermissionsRouter = require('./api/master/rolePermissions/rolePermissions.controller');
const userRouter = require('./api/master/user/user.controller');
const autoOrderRouter = require('./api/master/autoOrder/autoOrder.controller');
const inventoryRouter = require('./api/master/inventory/inventory.controller');

const errorTestRouter = require('./api/master/error-test/test');
const authRouter = require('./api/auth/auth.controller');
const productionTransactionRouter = require('./api/transaction/production/production.controller');

router.use('/material', materialRouter);
router.use('/role', roleRouter);
router.use('/car-model', carModelRouter);
router.use('/customer', customerRouter);
router.use('/logistic', logisticRouter);
router.use('/supplier', supplierRouter);
router.use('/bom', bomRouter);
router.use('/role-permissions', rolePermissionsRouter);
router.use('/user', userRouter);

// Transaction Routes
router.use('/transaction/production', productionTransactionRouter);

router.use('/auto-order', autoOrderRouter);
router.use('/inventory', inventoryRouter);
router.use('/error-test', errorTestRouter);
router.use('/auth', authRouter);

module.exports = router;