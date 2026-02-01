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
    name: joi_1.default.string().required().messages({
        'any.required': 'Name is required',
        'string.empty': 'Name cannot be empty'
    }),
    email: joi_1.default.string().email().optional().messages({
        'string.email': 'Please include a valid email'
    }),
    password: joi_1.default.string().min(6).optional().messages({
        'string.min': 'Password must be at least 6 characters long'
    }),
    phoneNumber: joi_1.default.string().optional().messages({
        'string.base': 'Phone number must be a string'
    })
}).or('email', 'phoneNumber').messages({
    'object.missing': 'Either email or phoneNumber is required'
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().optional(),
    password: joi_1.default.string().required(),
}).messages({
    'string.email': 'Please include a valid email',
    'any.required': 'Password is required'
});
exports.otpRequestSchema = joi_1.default.object({
    identifier: joi_1.default.string().required().messages({
        'any.required': 'Identifier (Phone or Email) is required'
    }),
    type: joi_1.default.string().optional()
});
exports.otpVerifySchema = joi_1.default.object({
    identifier: joi_1.default.string().required(),
    otp: joi_1.default.string().required(),
    userData: joi_1.default.object().optional()
});
