"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("./order.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const router = (0, express_1.Router)();
// User routes
router.post('/', auth_middleware_1.protect, order_controller_1.createOrder);
router.get('/my', auth_middleware_1.protect, order_controller_1.getMyOrders);
router.get('/admin/all', auth_middleware_1.protect, auth_middleware_1.admin, order_controller_1.getAllOrders);
router.get('/:id', auth_middleware_1.protect, order_controller_1.getOrderById);
router.patch('/:id/status', auth_middleware_1.protect, auth_middleware_1.admin, order_controller_1.updateOrderStatus);
exports.default = router;
