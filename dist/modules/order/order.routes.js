"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("./order.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect); // All order routes are protected
// User: Create Order, Get History
router.route('/')
    .post(order_controller_1.createOrder)
    .get(order_controller_1.getOrders);
// Admin routes (hidden/protected further in real app)
router.get('/admin/all', order_controller_1.getAllOrders);
router.patch('/:id/status', order_controller_1.updateOrderStatus);
router.route('/:id')
    .get(order_controller_1.getOrderById);
router.put('/:id/cancel', order_controller_1.cancelOrder);
exports.default = router;
