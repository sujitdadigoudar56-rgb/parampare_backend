// src/types/express.types.ts
import { Request } from 'express';
import { IUser } from '../../modules/user/user.model';

// Extend the Express Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: IUser;
}