// src/routes/auth.routes.ts
import { Router } from 'express';
import { getMe, sendOtp, verifyOtp, logout, register, login } from './auth.controller';
import { protect } from '../../core/middleware/auth.middleware';
import { validate, otpRequestSchema, otpVerifySchema, registerSchema, loginSchema } from '../../core/middleware/validation.middleware';

const router = Router();

// Route handlers with validation
router.post('/register', validate(registerSchema), register as any);
router.post('/login', validate(loginSchema), login as any);

router.post('/send-otp', validate(otpRequestSchema), sendOtp as any);
router.post('/verify-otp', validate(otpVerifySchema), verifyOtp as any);
router.post('/logout', protect as any, logout as any); 
// router.post('/refresh', ...); // Refresh token logic not yet implemented in controller/service fully, skipping for now or adding stub

router.get('/userDetails', protect as any, getMe as any);

export default router;
