import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import { authService } from '../auth/auth.service';
import { HTTP_STATUS, HTTP_MESSAGES } from '../../shared/constants/http.constants';

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await authService.getMe(req.user!._id.toString());
        res.status(HTTP_STATUS.OK).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PATCH /api/user/profile
// @access  Private
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fullName, email } = req.body;
        const User = (await import('../user/user.model')).default;
        const updated = await User.findByIdAndUpdate(
            req.user!._id.toString(),
            { $set: { fullName, email } },
            { new: true, runValidators: true }
        ).select('-password');
        res.status(HTTP_STATUS.OK).json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

// @desc    Get saved addresses
// @route   GET /api/user/addresses
// @access  Private
export const getAddresses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const addresses = await userService.getAddresses(req.user!._id.toString());
        res.status(HTTP_STATUS.OK).json({ success: true, data: addresses });
    } catch (error) {
        next(error);
    }
};

// @desc    Add new address
// @route   POST /api/user/addresses
// @access  Private
export const addAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const address = await userService.addAddress(req.user!._id.toString(), req.body);
        res.status(HTTP_STATUS.CREATED).json({ success: true, data: address });
    } catch (error) {
        next(error);
    }
};

// @desc    Update address
// @route   PUT /api/user/addresses/:id
// @access  Private
export const updateAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const address = await userService.updateAddress(req.user!._id.toString(), req.params.id as string, req.body);
        if (!address) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Address not found' });
        }
        res.status(HTTP_STATUS.OK).json({ success: true, data: address });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete address
// @route   DELETE /api/user/addresses/:id
// @access  Private
export const deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const address = await userService.deleteAddress(req.user!._id.toString(), req.params.id as string);
        if (!address) {
             return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Address not found' });
        }
        res.status(HTTP_STATUS.OK).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};

// @desc    Get wishlist
// @route   GET /api/user/wishlist
// @access  Private
export const getWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const wishlist = await userService.getWishlist(req.user!._id.toString());
        res.status(HTTP_STATUS.OK).json({ success: true, count: wishlist.length, data: wishlist });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle wishlist item
// @route   POST /api/user/wishlist/:productId
// @access  Private
export const toggleWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const wishlist = await userService.toggleWishlist(req.user!._id.toString(), req.params.productId as string);
        res.status(HTTP_STATUS.OK).json({ success: true, data: wishlist });
    } catch (error) {
        next(error);
    }
};
