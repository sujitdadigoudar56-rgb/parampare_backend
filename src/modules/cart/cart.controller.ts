import { Request, Response, NextFunction } from 'express';
import { cartService } from './cart.service';
import { HTTP_STATUS, HTTP_MESSAGES } from '../../shared/constants/http.constants';

// @desc    Get cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cart = await cartService.getCart(req.user!._id.toString());
        res.status(HTTP_STATUS.OK).json({ success: true, data: cart });
    } catch (error) {
        next(error);
    }
};

// @desc    Add to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { productId, quantity } = req.body;
        const cart = await cartService.addToCart(req.user!._id.toString(), productId, quantity || 1);
        res.status(HTTP_STATUS.OK).json({ success: true, data: cart });
    } catch (error) {
        next(error);
    }
};

// @desc    Update cart item
// @route   PUT /api/cart/update
// @access  Private
export const updateCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { productId, quantity } = req.body;
        const cart = await cartService.updateCartItem(req.user!._id.toString(), productId, quantity);
        res.status(HTTP_STATUS.OK).json({ success: true, data: cart });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove from cart
// @route   DELETE /api/cart/remove
// @access  Private
export const removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { productId } = req.body; // or query? Doc says DELETE /api/cart/remove, usually body or params.
        // DELETE methods with body is discouraged but supported. Param is better: /api/cart/:productId
        // But doc says /api/cart/remove. I'll check body.
        const cart = await cartService.removeFromCart(req.user!._id.toString(), productId);
        res.status(HTTP_STATUS.OK).json({ success: true, data: cart });
    } catch (error) {
        next(error);
    }
};
