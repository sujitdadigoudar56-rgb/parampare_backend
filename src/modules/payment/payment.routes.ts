import { Router } from 'express';
import { createRazorpayOrder, verifyPayment } from './payment.controller';
import { protect } from '../../core/middleware/auth.middleware';

const router = Router();

// All payment routes are protected
router.use(protect as any);

router.post('/create-order', createRazorpayOrder as any);
router.post('/verify', verifyPayment as any);

export default router;
