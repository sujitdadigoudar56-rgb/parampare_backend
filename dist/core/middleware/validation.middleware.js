"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpVerifySchema = exports.otpRequestSchema = exports.loginSchema = exports.registerSchema = exports.validate = void 0;
const joi_1 = __importDefault(require("joi"));
// Generic Joi Validation Middleware
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map((detail) => ({
                msg: detail.message,
                param: detail.path.join('.'),
            }));
            return res.status(400).json({ errors });
        }
        next();
    };
};
exports.validate = validate;
// Joi Schemas
exports.registerSchema = joi_1.default.object({
    fullName: joi_1.default.string().required().messages({
        'any.required': 'Full Name is required',
        'string.empty': 'Full Name cannot be empty'
    }),
    email: joi_1.default.string().email().optional().messages({
        'string.email': 'Please include a valid email'
    }),
    password: joi_1.default.string().min(6).optional().messages({
        'string.min': 'Password must be at least 6 characters long'
    }),
    confirmPassword: joi_1.default.any().equal(joi_1.default.ref('password'))
        .messages({ 'any.only': 'Passwords do not match' }),
    countryCode: joi_1.default.string().optional().default('+91'),
    mobile: joi_1.default.string().pattern(/^[0-9]{10}$/).optional().messages({
        'string.pattern.base': 'Mobile number must be a valid 10-digit number'
    })
}).or('email', 'mobile').messages({
    'object.missing': 'Either email or mobile number is required'
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Please include a valid email',
        'any.required': 'Email is required'
    }),
    password: joi_1.default.string().required().messages({
        'any.required': 'Password is required'
    })
});
exports.otpRequestSchema = joi_1.default.object({
    mobile: joi_1.default.string().required().pattern(/^[0-9]{10}$/).messages({
        'any.required': 'Mobile number is required',
        'string.pattern.base': 'Mobile number must be 10 digits'
    }),
    type: joi_1.default.string().valid('login', 'register').optional()
});
exports.otpVerifySchema = joi_1.default.object({
    mobile: joi_1.default.string().required().pattern(/^[0-9]{10}$/),
    otp: joi_1.default.string().length(6).required(),
    userData: joi_1.default.object().optional()
});
