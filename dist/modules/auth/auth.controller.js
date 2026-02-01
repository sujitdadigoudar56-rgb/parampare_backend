"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getMe = exports.verifyOtp = exports.sendOtp = exports.login = exports.register = void 0;
const auth_service_1 = require("./auth.service");
const http_constants_1 = require("../../shared/constants/http.constants");
// @desc    Register user (Email/Password)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
    try {
        const result = await auth_service_1.authService.register(req.body);
        res.status(http_constants_1.HTTP_STATUS.CREATED).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        if (error.message.includes('already exists')) {
            return res.status(http_constants_1.HTTP_STATUS.BAD_REQUEST).json({ success: false, message: error.message });
        }
        next(error);
    }
};
exports.register = register;
// @desc    Login user (Email/Password)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const result = await auth_service_1.authService.login(req.body);
        res.status(http_constants_1.HTTP_STATUS.OK).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        if (error.message === 'Invalid credentials') {
            return res.status(http_constants_1.HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: error.message });
        }
        next(error);
    }
};
exports.login = login;
// @desc    Send OTP for Login or Register
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res, next) => {
    try {
        let { identifier, type, phoneNumber } = req.body; // type: 'login' | 'register'
        // Support legacy "phoneNumber" field
        if (!identifier && phoneNumber) {
            identifier = phoneNumber;
        }
        // Validation should be done by middleware (Joi), but basic check here
        if (!identifier) {
            return res.status(http_constants_1.HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Identifier (or phoneNumber) is required' });
        }
        // Pass identifier to service
        const message = await auth_service_1.authService.generateOtp(identifier);
        res.status(http_constants_1.HTTP_STATUS.OK).json({
            success: true,
            message,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.sendOtp = sendOtp;
// @desc    Verify OTP and authenticate
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res, next) => {
    try {
        const { identifier, otp, userData } = req.body;
        // Simple logic: If userData is provided, treating as Intent to Register.
        // If NOT provided, treating as Intent to Login.
        const isLogin = !userData;
        const result = await auth_service_1.authService.verifyOtp(identifier, otp, isLogin, userData);
        res.status(http_constants_1.HTTP_STATUS.OK).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        if (error.message === 'Invalid OTP' || error.message === 'OTP expired' || error.message === 'User not found') {
            return res.status(http_constants_1.HTTP_STATUS.BAD_REQUEST).json({ success: false, message: error.message });
        }
        next(error);
    }
};
exports.verifyOtp = verifyOtp;
// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(http_constants_1.HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: http_constants_1.HTTP_MESSAGES.UNAUTHORIZED });
        }
        // Refresh user data from service
        const user = await auth_service_1.authService.getMe(req.user._id.toString());
        res.status(http_constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        if (error.message === 'User not found') {
            return res.status(http_constants_1.HTTP_STATUS.NOT_FOUND).json({ success: false, message: error.message });
        }
        next(error);
    }
};
exports.getMe = getMe;
// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private (optional, usually just client side clearing token)
const logout = async (req, res, next) => {
    // server-side logout could involve blacklisting token, but often just client side.
    // We'll just return success.
    res.status(http_constants_1.HTTP_STATUS.OK).json({ success: true, message: 'Logged out successfully' });
};
exports.logout = logout;
// Keeping register/login implementations if needed for backward compatibility or admin, 
// but commenting them out or removing to enforce OTP flow as per request
// ...
