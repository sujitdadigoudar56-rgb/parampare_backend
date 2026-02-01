"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromCart = exports.updateCart = exports.addToCart = exports.getCart = void 0;
const cart_service_1 = require("./cart.service");
const http_constants_1 = require("../../shared/constants/http.constants");
// @desc    Get cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
    try {
        const cart = await cart_service_1.cartService.getCart(req.user._id.toString());
        res.status(http_constants_1.HTTP_STATUS.OK).json({ success: true, data: cart });
    }
    catch (error) {
        next(error);
    }
};
exports.getCart = getCart;
// @desc    Add to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;
        const cart = await cart_service_1.cartService.addToCart(req.user._id.toString(), productId, quantity || 1);
        res.status(http_constants_1.HTTP_STATUS.OK).json({ success: true, data: cart });
    }
    catch (error) {
        next(error);
    }
};
exports.addToCart = addToCart;
// @desc    Update cart item
// @route   PUT /api/cart/update
// @access  Private
const updateCart = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;
        const cart = await cart_service_1.cartService.updateCartItem(req.user._id.toString(), productId, quantity);
        res.status(http_constants_1.HTTP_STATUS.OK).json({ success: true, data: cart });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCart = updateCart;
// @desc    Remove from cart
// @route   DELETE /api/cart/remove
// @access  Private
const removeFromCart = async (req, res, next) => {
    try {
        const { productId } = req.body; // or query? Doc says DELETE /api/cart/remove, usually body or params.
        // DELETE methods with body is discouraged but supported. Param is better: /api/cart/:productId
        // But doc says /api/cart/remove. I'll check body.
        const cart = await cart_service_1.cartService.removeFromCart(req.user._id.toString(), productId);
        res.status(http_constants_1.HTTP_STATUS.OK).json({ success: true, data: cart });
    }
    catch (error) {
        next(error);
    }
};
exports.removeFromCart = removeFromCart;
