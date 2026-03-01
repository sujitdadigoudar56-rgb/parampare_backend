"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserStatus = exports.getUserById = exports.getAllUsers = exports.getDashboardStats = exports.deleteProductAdmin = exports.updateProductAdmin = exports.createProduct = exports.uploadImages = void 0;
const order_model_1 = __importDefault(require("../order/order.model"));
const product_model_1 = __importDefault(require("../product/product.model"));
const user_model_1 = __importDefault(require("../user/user.model"));
const http_constants_1 = require("../../shared/constants/http.constants");
// @desc    Upload images (to S3 if configured, otherwise local disk)
// @route   POST /api/admin/upload
// @access  Private/Admin
const uploadImages = async (req, res, next) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(http_constants_1.HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'No files uploaded' });
        }
        // S3 files have `location`, local disk files have `filename`
        const urls = files.map((f) => f.location ? f.location : `/uploads/products/${f.filename}`);
        const usingS3 = !!(files[0].location);
        res.status(http_constants_1.HTTP_STATUS.OK).json({
            success: true,
            urls,
            storage: usingS3 ? 's3' : 'local',
            message: usingS3
                ? 'Uploaded to AWS S3'
                : 'Uploaded to local storage. Add AWS credentials to .env to use S3.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.uploadImages = uploadImages;
// @desc    Create product (Admin)
// @route   POST /api/admin/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
    try {
        const product = await product_model_1.default.create(req.body);
        res.status(http_constants_1.HTTP_STATUS.CREATED).json({ success: true, data: product });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(http_constants_1.HTTP_STATUS.BAD_REQUEST).json({ success: false, message: error.message });
        }
        next(error);
    }
};
exports.createProduct = createProduct;
// @desc    Update product (Admin)
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const updateProductAdmin = async (req, res, next) => {
    try {
        const product = await product_model_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product)
            return res.status(http_constants_1.HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Product not found' });
        res.status(http_constants_1.HTTP_STATUS.OK).json({ success: true, data: product });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProductAdmin = updateProductAdmin;
// @desc    Delete product (Admin)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProductAdmin = async (req, res, next) => {
    try {
        const product = await product_model_1.default.findByIdAndDelete(req.params.id);
        if (!product)
            return res.status(http_constants_1.HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Product not found' });
        res.status(http_constants_1.HTTP_STATUS.OK).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProductAdmin = deleteProductAdmin;
const getDashboardStats = async (req, res, next) => {
    try {
        const totalOrders = await order_model_1.default.countDocuments();
        const totalProducts = await product_model_1.default.countDocuments();
        const totalUsers = await user_model_1.default.countDocuments({ role: 'USER' });
        // Calculate total revenue
        const orders = await order_model_1.default.find({ status: { $ne: 'cancelled' } });
        const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
        // Get recent orders
        const recentOrders = await order_model_1.default.find()
            .populate('user', 'fullName')
            .sort({ createdAt: -1 })
            .limit(5);
        res.status(http_constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: {
                totalOrders,
                totalProducts,
                totalUsers,
                totalRevenue,
                recentOrders
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboardStats = getDashboardStats;
// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const count = await user_model_1.default.countDocuments();
        const users = await user_model_1.default.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        res.status(http_constants_1.HTTP_STATUS.OK).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data: users
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllUsers = getAllUsers;
// @desc    Get single user (Admin)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res, next) => {
    try {
        console.log(`GET /api/admin/users/${req.params.id} hit`);
        const user = await user_model_1.default.findById(req.params.id);
        if (!user) {
            console.log(`User ${req.params.id} not found`);
            return res.status(http_constants_1.HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'User not found' });
        }
        res.status(http_constants_1.HTTP_STATUS.OK).json({ success: true, data: user });
    }
    catch (error) {
        console.error(`Error in getUserById:`, error);
        next(error);
    }
};
exports.getUserById = getUserById;
// @desc    Update user status (Admin)
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res, next) => {
    try {
        const { isActive } = req.body;
        const user = await user_model_1.default.findByIdAndUpdate(req.params.id, { isActive }, { new: true, runValidators: true });
        if (!user) {
            return res.status(http_constants_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(http_constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserStatus = updateUserStatus;
