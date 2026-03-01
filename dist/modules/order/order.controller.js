"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getOrderByIdAdmin = exports.getAllOrders = exports.getOrderById = exports.getMyOrders = exports.createOrder = void 0;
const order_service_1 = require("./order.service");
const http_constants_1 = require("../../shared/constants/http.constants");
// POST /api/orders — place order
const createOrder = async (req, res, next) => {
    try {
        const { items, shippingAddress, paymentMethod } = req.body;
        if (!items || items.length === 0) {
            return res.status(http_constants_1.HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'No items in order' });
        }
        if (!shippingAddress) {
            return res.status(http_constants_1.HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Shipping address required' });
        }
        const order = await order_service_1.orderService.createOrder(req.user.id, { items, shippingAddress, paymentMethod });
        res.status(http_constants_1.HTTP_STATUS.CREATED).json({ success: true, data: order });
    }
    catch (error) {
        next(error);
    }
};
exports.createOrder = createOrder;
// GET /api/orders/my — my orders
const getMyOrders = async (req, res, next) => {
    try {
        const orders = await order_service_1.orderService.getMyOrders(req.user.id);
        res.status(http_constants_1.HTTP_STATUS.OK).json({ success: true, data: orders });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyOrders = getMyOrders;
// GET /api/orders/:id
const getOrderById = async (req, res, next) => {
    try {
        const order = await order_service_1.orderService.getOrderById(String(req.params.id), req.user.id);
        if (!order)
            return res.status(http_constants_1.HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Order not found' });
        res.status(http_constants_1.HTTP_STATUS.OK).json({ success: true, data: order });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderById = getOrderById;
// GET /api/orders/admin/all — admin: get all orders
const getAllOrders = async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const result = await order_service_1.orderService.getAllOrders(page, limit);
        res.status(http_constants_1.HTTP_STATUS.OK).json({ success: true, ...result });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllOrders = getAllOrders;
// GET /api/orders/admin/:id — admin: get single order
const getOrderByIdAdmin = async (req, res, next) => {
    try {
        console.log(`GET /api/admin/orders/${req.params.id} hit`);
        const order = await order_service_1.orderService.getOrderByIdAdmin(String(req.params.id));
        if (!order) {
            console.log(`Order ${req.params.id} not found`);
            return res.status(http_constants_1.HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Order not found' });
        }
        res.status(http_constants_1.HTTP_STATUS.OK).json({ success: true, data: order });
    }
    catch (error) {
        console.error(`Error in getOrderByIdAdmin:`, error);
        next(error);
    }
};
exports.getOrderByIdAdmin = getOrderByIdAdmin;
// PATCH /api/orders/:id/status — admin
const updateOrderStatus = async (req, res, next) => {
    try {
        const order = await order_service_1.orderService.updateOrderStatus(String(req.params.id), req.body.status);
        if (!order)
            return res.status(http_constants_1.HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Order not found' });
        res.status(http_constants_1.HTTP_STATUS.OK).json({ success: true, data: order });
    }
    catch (error) {
        next(error);
    }
};
exports.updateOrderStatus = updateOrderStatus;
