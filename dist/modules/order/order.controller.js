"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getAllOrders = exports.cancelOrder = exports.getOrderById = exports.getOrders = exports.createOrder = void 0;
const order_service_1 = require("./order.service");
const http_constants_1 = require("../../shared/constants/http.constants");
// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(http_constants_1.HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: http_constants_1.HTTP_MESSAGES.UNAUTHORIZED });
        }
        // items: [{productId, quantity}], addressId: string, paymentMethod: string
        const order = await order_service_1.orderService.createOrder(req.user._id.toString(), req.body);
        res.status(http_constants_1.HTTP_STATUS.CREATED).json({
            success: true,
            data: order,
        });
    }
    catch (error) {
        if (error.message.includes('Insufficient stock') || error.message.includes('not found')) {
            return res.status(http_constants_1.HTTP_STATUS.BAD_REQUEST).json({ success: false, message: error.message });
        }
        next(error);
    }
};
exports.createOrder = createOrder;
// @desc    Get logged in user orders
// @route   GET /api/orders/myorders   (Doc says GET /api/orders - filter by user)
// But routing at /api/orders is usually "All" for admin or "Mine" for user.
// Current route setup: router.use('/orders', ...)
// /api/orders -> usually getMyOrders for user role, getAllOrders for admin.
// However, controller usually splits them.
// Let's implement getOrders which decides based on logic, or stick to separate methods.
// The doc says: "GET /api/orders Get user's order history".
// So for a normal user, `GET /api/orders` returns THEIR history.
const getOrders = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(http_constants_1.HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: http_constants_1.HTTP_MESSAGES.UNAUTHORIZED });
        }
        // If admin, maybe return all? Or strictly follow doc "Get user's order history".
        // I'll stick to "Get user's order history" for this endpoint. Admin can have /all or similar.
        // Or we handle roles here.
        // For now, assume this is for the user.
        const orders = await order_service_1.orderService.getUserOrders(req.user._id.toString());
        res.status(http_constants_1.HTTP_STATUS.OK).json({
            success: true,
            count: orders.length,
            data: orders,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrders = getOrders;
// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
    try {
        const order = await order_service_1.orderService.getOrderById(req.params.id);
        if (!order) {
            return res.status(http_constants_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: http_constants_1.HTTP_MESSAGES.NOT_FOUND,
            });
        }
        // Check ownership
        // if (order.user._id.toString() !== req.user!._id.toString() && req.user!.role !== 'ADMIN') {
        //      return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'Not authorized' });
        // }
        res.status(http_constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: order,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderById = getOrderById;
// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
    try {
        const order = await order_service_1.orderService.cancelOrder(req.params.id, req.user._id.toString());
        res.status(http_constants_1.HTTP_STATUS.OK).json({ success: true, data: order });
    }
    catch (error) {
        if (error.message.includes('not found') || error.message.includes('cannot be cancelled')) {
            return res.status(http_constants_1.HTTP_STATUS.BAD_REQUEST).json({ success: false, message: error.message });
        }
        next(error);
    }
};
exports.cancelOrder = cancelOrder;
// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
    try {
        const orders = await order_service_1.orderService.getAllOrders();
        res.status(http_constants_1.HTTP_STATUS.OK).json({
            success: true,
            count: orders.length,
            data: orders,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllOrders = getAllOrders;
// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const order = await order_service_1.orderService.updateStatus(req.params.id, status);
        if (!order) {
            return res.status(http_constants_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: http_constants_1.HTTP_MESSAGES.NOT_FOUND,
            });
        }
        res.status(http_constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: order,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateOrderStatus = updateOrderStatus;
