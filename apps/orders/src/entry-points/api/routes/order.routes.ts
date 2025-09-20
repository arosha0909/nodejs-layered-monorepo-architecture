/**
 * @fileoverview Order API routes
 * @author Node.js Best Practices
 */

import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate, authorize } from '@shared/middleware';

const router = Router();
const orderController = new OrderController();

// All routes require authentication
router.use(authenticate);

// Order routes
router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/stats', orderController.getOrderStats);

// Order by ID routes
router.get('/:orderId', orderController.getOrderById);
router.put('/:orderId', orderController.updateOrder);
router.patch('/:orderId/cancel', orderController.cancelOrder);

// Admin only routes
router.use(authorize('admin'));

export default router;
