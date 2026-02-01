import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Generic Joi Validation Middleware
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
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

// Joi Schemas

export const registerSchema = Joi.object({
  fullName: Joi.string().required().messages({
    'any.required': 'Full Name is required',
    'string.empty': 'Full Name cannot be empty'
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Please include a valid email'
  }),
  password: Joi.string().min(6).optional().messages({
    'string.min': 'Password must be at least 6 characters long'
  }),
  confirmPassword: Joi.any().equal(Joi.ref('password'))
    .messages({ 'any.only': 'Passwords do not match' }),
  countryCode: Joi.string().optional().default('+91'),
  mobile: Joi.string().pattern(/^[0-9]{10}$/).optional().messages({
    'string.pattern.base': 'Mobile number must be a valid 10-digit number'
  })
}).or('email', 'mobile').messages({
  'object.missing': 'Either email or mobile number is required'
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please include a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

export const otpRequestSchema = Joi.object({
  mobile: Joi.string().required().pattern(/^[0-9]{10}$/).messages({
    'any.required': 'Mobile number is required',
    'string.pattern.base': 'Mobile number must be 10 digits'
  }),
  type: Joi.string().valid('login', 'register').optional()
});

export const otpVerifySchema = Joi.object({
  mobile: Joi.string().required().pattern(/^[0-9]{10}$/),
  otp: Joi.string().length(6).required(),
  userData: Joi.object().optional()
});
