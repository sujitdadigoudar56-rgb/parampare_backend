"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleWishlist = exports.getWishlist = exports.deleteAddress = exports.updateAddress = exports.addAddress = exports.getAddresses = exports.updateProfile = exports.getProfile = void 0;
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
// @desc    Update user profile
// @route   PATCH /api/user/profile
// @access  Private
const updateProfile = async (req, res, next) => {
    try {
        const { fullName, email } = req.body;
        const User = (await Promise.resolve().then(() => __importStar(require('../user/user.model')))).default;
        const updated = await User.findByIdAndUpdate(req.user._id.toString(), { $set: { fullName, email } }, { new: true, runValidators: true }).select('-password');
        res.status(http_constants_1.HTTP_STATUS.OK).json({ success: true, data: updated });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
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
