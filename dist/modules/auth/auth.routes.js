"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auth.routes.ts
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const validation_middleware_1 = require("../../core/middleware/validation.middleware");
const router = (0, express_1.Router)();
// Route handlers with validation
router.post('/register', (0, validation_middleware_1.validate)(validation_middleware_1.registerSchema), auth_controller_1.register);
router.post('/login', (0, validation_middleware_1.validate)(validation_middleware_1.loginSchema), auth_controller_1.login);
router.post('/send-otp', (0, validation_middleware_1.validate)(validation_middleware_1.otpRequestSchema), auth_controller_1.sendOtp);
router.post('/verify-otp', (0, validation_middleware_1.validate)(validation_middleware_1.otpVerifySchema), auth_controller_1.verifyOtp);
router.post('/logout', auth_middleware_1.protect, auth_controller_1.logout);
// router.post('/refresh', ...); // Refresh token logic not yet implemented in controller/service fully, skipping for now or adding stub
router.get('/userDetails', auth_middleware_1.protect, auth_controller_1.getMe);
exports.default = router;
