import { IUser } from '../models/user.model';
import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: Omit<IUser, '_id'> & { _id: Types.ObjectId | string };
    }
  }
}
