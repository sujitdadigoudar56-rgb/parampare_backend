import { Router } from 'express';
import { createRazorpayOrder, verifyPayment, razorpayWebhook } from './payment.controller';
import { protect } from '../../core/middleware/auth.middleware';

const router = Router();

// Public — Razorpay calls this directly; authenticated via X-Razorpay-Signature.
router.post('/webhook', razorpayWebhook as any);

// Authenticated payment routes
router.post('/create-order', protect as any, createRazorpayOrder as any);
router.post('/verify', protect as any, verifyPayment as any);

export default router;
