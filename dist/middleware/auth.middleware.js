"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
// Middleware to protect routes
const protect = async (req, res, next) => {
    var _a;
    let token;
    // Get token from header
    if ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.startsWith('Bearer ')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            if (!process.env.JWT_SECRET) {
                console.error('JWT_SECRET is not defined in environment variables');
                return res.status(500).json({
                    success: false,
                    message: 'Server configuration error',
                });
            }
            // Verify token
            const secret = process.env.JWT_SECRET;
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            // Get user from the token
            const user = await user_model_1.default.findById(decoded.id).select('-password').exec();
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized, user not found',
                });
            }
            // Add user to request object
            req.user = user;
            return next();
        }
        catch (error) {
            console.error('Authentication error:', error);
            let message = 'Not authorized, token failed';
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                message = 'Session expired, please login again';
            }
            else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                message = 'Invalid token';
            }
            return res.status(401).json({
                success: false,
                message,
            });
        }
    }
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token provided',
        });
    }
};
exports.protect = protect;
