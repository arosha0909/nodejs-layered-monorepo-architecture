"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const middleware_1 = require("@shared/middleware");
const router = (0, express_1.Router)();
const orderController = new order_controller_1.OrderController();
router.use(middleware_1.authenticate);
router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/stats', orderController.getOrderStats);
router.get('/:orderId', orderController.getOrderById);
router.put('/:orderId', orderController.updateOrder);
router.patch('/:orderId/cancel', orderController.cancelOrder);
router.use((0, middleware_1.authorize)('admin'));
exports.default = router;
//# sourceMappingURL=order.routes.js.map