import { Response, NextFunction, Request } from 'express';
import { authService } from './auth.service';
import { IUser } from '../user/user.model';
import { HTTP_STATUS, HTTP_MESSAGES } from '../../shared/constants/http.constants';

// Extend Request type locally or import from shared types
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// @desc    Register user (Email/Password)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body);
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Login user (Email/Password)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    if (error.message === 'Invalid credentials') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Send OTP for Login or Register
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { mobile, type } = req.body; // type: 'login' | 'register'
    
    // Validation should be done by middleware (Joi)
    if (!mobile) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Mobile number is required' });
    }

    const message = await authService.generateOtp(mobile);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message,
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Verify OTP and authenticate
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { mobile, otp, userData } = req.body;
    
    // Simple logic: If userData is provided, treating as Intent to Register.
    // If NOT provided, treating as Intent to Login.
    const isLogin = !userData;

    const result = await authService.verifyOtp(mobile, otp, isLogin, userData);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    if (error.message === 'Invalid OTP' || error.message === 'OTP expired' || error.message === 'User not found') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: HTTP_MESSAGES.UNAUTHORIZED });
    }
    
    // Refresh user data from service
    const user = await authService.getMe(req.user._id.toString());

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    if (error.message === 'User not found') {
       return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private (optional, usually just client side clearing token)
export const logout = async (req: Request, res: Response, next: NextFunction) => {
    // server-side logout could involve blacklisting token, but often just client side.
    // We'll just return success.
    res.status(HTTP_STATUS.OK).json({ success: true, message: 'Logged out successfully' });
};

// Keeping register/login implementations if needed for backward compatibility or admin, 
// but commenting them out or removing to enforce OTP flow as per request
// ...
