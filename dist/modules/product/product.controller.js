"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getProducts = void 0;
const product_service_1 = require("./product.service");
const http_constants_1 = require("../../shared/constants/http.constants");
// @desc    Get all products (with filters)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
    try {
        const result = await product_service_1.productService.findAll(req.query);
        res.status(http_constants_1.HTTP_STATUS.OK).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProducts = getProducts;
// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res, next) => {
    try {
        const product = await product_service_1.productService.findById(req.params.id);
        if (!product) {
            return res.status(http_constants_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: http_constants_1.HTTP_MESSAGES.NOT_FOUND,
            });
        }
        res.status(http_constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProduct = getProduct;
// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
    try {
        const product = await product_service_1.productService.createProduct(req.body);
        res.status(http_constants_1.HTTP_STATUS.CREATED).json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createProduct = createProduct;
// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
    try {
        const product = await product_service_1.productService.updateProduct(req.params.id, req.body);
        if (!product) {
            return res.status(http_constants_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: http_constants_1.HTTP_MESSAGES.NOT_FOUND,
            });
        }
        res.status(http_constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProduct = updateProduct;
// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
    try {
        const product = await product_service_1.productService.deleteProduct(req.params.id);
        if (!product) {
            return res.status(http_constants_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: http_constants_1.HTTP_MESSAGES.NOT_FOUND,
            });
        }
        res.status(http_constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: {},
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduct = deleteProduct;
