import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,     // Admin
  updateOrderStatus // Admin
} from './order.controller';
import { protect } from '../../core/middleware/auth.middleware';

const router = Router();

router.use(protect as any); // All order routes are protected

// User: Create Order, Get History
router.route('/')
  .post(createOrder as any)
  .get(getOrders as any); 

// Admin routes (hidden/protected further in real app)
router.get('/admin/all', getAllOrders as any);
router.patch('/:id/status', updateOrderStatus as any);

router.route('/:id')
  .get(getOrderById as any);

router.put('/:id/cancel', cancelOrder as any);

export default router;
