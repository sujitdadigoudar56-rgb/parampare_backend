"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleWishlist = exports.getWishlist = exports.deleteAddress = exports.updateAddress = exports.addAddress = exports.getAddresses = exports.getProfile = void 0;
const user_service_1 = require("./user.service");
const auth_service_1 = require("../auth/auth.service");
const http_constants_1 = require("../../shared/constants/http.constants");
// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getProfile = async (req, res, next) => {
    try {
        const user = await auth_service_1.authService.getMe(req.user._id.toString());
        res.status(http_constants_1.HTTP_STATUS.OK).json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
// @desc    Get saved addresses
// @route   GET /api/user/addresses
// @access  Private
const getAddresses = async (req, res, next) => {
    try {
        const addresses = await user_service_1.userService.getAddresses(req.user._id.toString());
        res.status(http_constants_1.HTTP_STATUS.OK).json({ success: true, data: addresses });
    }
    catch (error) {
        next(error);
    }
};
exports.getAddresses = getAddresses;
// @desc    Add new address
// @route   POST /api/user/addresses
// @access  Private
const addAddress = async (req, res, next) => {
    try {
        const address = await user_service_1.userService.addAddress(req.user._id.toString(), req.body);
        res.status(http_constants_1.HTTP_STATUS.CREATED).json({ success: true, data: address });
    }
    catch (error) {
        next(error);
    }
};
exports.addAddress = addAddress;
// @desc    Update address
// @route   PUT /api/user/addresses/:id
// @access  Private
const updateAddress = async (req, res, next) => {
    try {
        const address = await user_service_1.userService.updateAddress(req.user._id.toString(), req.params.id, req.body);
        if (!address) {
            return res.status(http_constants_1.HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Address not found' });
        }
        res.status(http_constants_1.HTTP_STATUS.OK).json({ success: true, data: address });
    }
    catch (error) {
        next(error);
    }
};
exports.updateAddress = updateAddress;
// @desc    Delete address
// @route   DELETE /api/user/addresses/:id
// @access  Private
const deleteAddress = async (req, res, next) => {
    try {
        const address = await user_service_1.userService.deleteAddress(req.user._id.toString(), req.params.id);
        if (!address) {
            return res.status(http_constants_1.HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Address not found' });
        }
        res.status(http_constants_1.HTTP_STATUS.OK).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAddress = deleteAddress;
// @desc    Get wishlist
// @route   GET /api/user/wishlist
// @access  Private
const getWishlist = async (req, res, next) => {
    try {
        const wishlist = await user_service_1.userService.getWishlist(req.user._id.toString());
        res.status(http_constants_1.HTTP_STATUS.OK).json({ success: true, count: wishlist.length, data: wishlist });
    }
    catch (error) {
        next(error);
    }
};
exports.getWishlist = getWishlist;
// @desc    Toggle wishlist item
// @route   POST /api/user/wishlist/:productId
// @access  Private
const toggleWishlist = async (req, res, next) => {
    try {
        const wishlist = await user_service_1.userService.toggleWishlist(req.user._id.toString(), req.params.productId);
        res.status(http_constants_1.HTTP_STATUS.OK).json({ success: true, data: wishlist });
    }
    catch (error) {
        next(error);
    }
};
exports.toggleWishlist = toggleWishlist;
