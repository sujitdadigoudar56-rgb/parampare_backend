import { Response, NextFunction } from 'express';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import User from '../../modules/user/user.model';
import { AuthenticatedRequest } from '../../shared/types/express.types';

interface JwtDecoded extends JwtPayload {
  id: string;
}

// Middleware to protect routes
export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Get token from header
  if (req.headers.authorization?.startsWith('Bearer ')) {
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
      const secret: Secret = process.env.JWT_SECRET;
      const decoded = jwt.verify(token, secret) as JwtDecoded;

      // Get user from the token
      const user = await User.findById(decoded.id).select('-password').exec();

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found',
        });
      }

      // Add user to request object
      req.user = user;
      return next();
    } catch (error) {
      console.error('Authentication error:', error);
      
      let message = 'Not authorized, token failed';
      if (error instanceof jwt.TokenExpiredError) {
        message = 'Session expired, please login again';
      } else if (error instanceof jwt.JsonWebTokenError) {
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