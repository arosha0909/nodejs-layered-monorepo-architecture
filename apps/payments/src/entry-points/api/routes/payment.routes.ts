/**
 * @fileoverview Payment API routes
 * @author Node.js Best Practices
 */

import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate, authorize } from '@shared/middleware';

const router = Router();
const paymentController = new PaymentController();

// All routes require authentication
router.use(authenticate);

// Payment routes
router.post('/', paymentController.createPayment);
router.get('/', paymentController.getPayments);
router.get('/stats', paymentController.getPaymentStats);

// Payment by ID routes
router.get('/:paymentId', paymentController.getPaymentById);
router.put('/:paymentId', paymentController.updatePayment);
router.patch('/:paymentId/cancel', paymentController.cancelPayment);
router.post('/:paymentId/process', paymentController.processPayment);
router.post('/:paymentId/refund', paymentController.processRefund);

// Admin only routes
router.use(authorize('admin'));

export default router;
