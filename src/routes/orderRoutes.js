const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/init', orderController.initData);
router.put('/update-address', orderController.updateAddress);
router.delete('/:orderid', orderController.deleteOrder);
router.get('/view-orders', orderController.getAllOrders);
router.get('/stats', orderController.getStats);

module.exports = router;
