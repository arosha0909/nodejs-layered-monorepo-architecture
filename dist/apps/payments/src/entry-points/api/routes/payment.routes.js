"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const middleware_1 = require("@shared/middleware");
const router = (0, express_1.Router)();
const paymentController = new payment_controller_1.PaymentController();
router.use(middleware_1.authenticate);
router.post('/', paymentController.createPayment);
router.get('/', paymentController.getPayments);
router.get('/stats', paymentController.getPaymentStats);
router.get('/:paymentId', paymentController.getPaymentById);
router.put('/:paymentId', paymentController.updatePayment);
router.patch('/:paymentId/cancel', paymentController.cancelPayment);
router.post('/:paymentId/process', paymentController.processPayment);
router.post('/:paymentId/refund', paymentController.processRefund);
router.use((0, middleware_1.authorize)('admin'));
exports.default = router;
//# sourceMappingURL=payment.routes.js.map