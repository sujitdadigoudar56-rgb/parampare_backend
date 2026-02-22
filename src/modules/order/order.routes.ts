import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus } from './order.controller';
import { protect, admin } from '../../core/middleware/auth.middleware';

const router = Router();

// User routes
router.post('/', protect as any, createOrder as any);
router.get('/my', protect as any, getMyOrders as any);
router.get('/admin/all', protect as any, admin as any, getAllOrders as any);
router.get('/:id', protect as any, getOrderById as any);
router.patch('/:id/status', protect as any, admin as any, updateOrderStatus as any);

export default router;
