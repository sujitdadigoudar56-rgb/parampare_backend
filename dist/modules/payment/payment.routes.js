"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("./payment.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const router = (0, express_1.Router)();
// All payment routes are protected
router.use(auth_middleware_1.protect);
router.post('/create-order', payment_controller_1.createRazorpayOrder);
router.post('/verify', payment_controller_1.verifyPayment);
exports.default = router;
