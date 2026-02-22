import { Router } from 'express';
import {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  uploadImages,
  createProduct,
  updateProductAdmin,
  deleteProductAdmin,
} from './admin.controller';
import { getAllOrders } from '../order/order.controller';
import { protect, admin } from '../../core/middleware/auth.middleware';
import { uploadToS3 } from '../../core/middleware/upload.middleware';

const router = Router();

// All admin routes require auth + admin role
router.use(protect as any, admin as any);

// ── Dashboard ──────────────────────────────
router.get('/stats', getDashboardStats);

// ── Users ──────────────────────────────────
router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);

// ── Orders ─────────────────────────────────
router.get('/orders', getAllOrders);

// ── Images (S3 Upload) ─────────────────────
router.post('/upload', uploadToS3.array('images', 5), uploadImages as any);

// ── Products ───────────────────────────────
router.post('/products', createProduct as any);
router.put('/products/:id', updateProductAdmin as any);
router.delete('/products/:id', deleteProductAdmin as any);

export default router;
