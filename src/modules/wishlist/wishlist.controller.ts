import { Request, Response, NextFunction } from 'express';
import { wishlistService } from './wishlist.service';
import { HTTP_STATUS } from '../../shared/constants/http.constants';

export const getWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await wishlistService.getWishlist((req as any).user.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: items });
  } catch (error) { next(error); }
};

export const addToWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'productId required' });
    const items = await wishlistService.addToWishlist((req as any).user.id, productId);
    res.status(HTTP_STATUS.OK).json({ success: true, data: items });
  } catch (error) { next(error); }
};

export const removeFromWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'productId required' });
    const items = await wishlistService.removeFromWishlist((req as any).user.id, productId);
    res.status(HTTP_STATUS.OK).json({ success: true, data: items });
  } catch (error) { next(error); }
};

export const toggleWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'productId required' });
    const result = await wishlistService.toggleWishlist((req as any).user.id, productId);
    res.status(HTTP_STATUS.OK).json({ success: true, ...result });
  } catch (error) { next(error); }
};
