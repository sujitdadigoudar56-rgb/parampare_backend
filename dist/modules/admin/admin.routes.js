"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("./admin.controller");
const order_controller_1 = require("../order/order.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const upload_middleware_1 = require("../../core/middleware/upload.middleware");
const router = (0, express_1.Router)();
// All admin routes require auth + admin role
router.use(auth_middleware_1.protect, auth_middleware_1.admin);
// ── Dashboard ──────────────────────────────
router.get('/stats', admin_controller_1.getDashboardStats);
// ── Users ──────────────────────────────────
router.get('/users', admin_controller_1.getAllUsers);
router.patch('/users/:id/status', admin_controller_1.updateUserStatus);
// ── Orders ─────────────────────────────────
router.get('/orders', order_controller_1.getAllOrders);
// ── Images (S3 Upload) ─────────────────────
router.post('/upload', upload_middleware_1.uploadToS3.array('images', 5), admin_controller_1.uploadImages);
// ── Products ───────────────────────────────
router.post('/products', admin_controller_1.createProduct);
router.put('/products/:id', admin_controller_1.updateProductAdmin);
router.delete('/products/:id', admin_controller_1.deleteProductAdmin);
exports.default = router;
