/**
 * @fileoverview User API routes
 * @author Node.js Best Practices
 */

import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '@shared/middleware';

const router = Router();
const userController = new UserController();

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes (require authentication)
router.use(authenticate);

// User profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/change-password', userController.changePassword);
router.patch('/deactivate', userController.deactivateAccount);

// Admin only routes
router.use(authorize('admin'));

router.get('/', userController.getUsers);
router.get('/stats', userController.getUserStats);
router.get('/:userId', userController.getUserById);
router.put('/:userId', userController.updateUser);

export default router;
