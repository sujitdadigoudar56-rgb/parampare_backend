"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleWishlist = exports.removeFromWishlist = exports.addToWishlist = exports.getWishlist = void 0;
const wishlist_service_1 = require("./wishlist.service");
const http_constants_1 = require("../../shared/constants/http.constants");
const getWishlist = async (req, res, next) => {
    try {
        const items = await wishlist_service_1.wishlistService.getWishlist(req.user.id);
        res.status(http_constants_1.HTTP_STATUS.OK).json({ success: true, data: items });
    }
    catch (error) {
        next(error);
    }
};
exports.getWishlist = getWishlist;
const addToWishlist = async (req, res, next) => {
    try {
        const { productId } = req.body;
        if (!productId)
            return res.status(http_constants_1.HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'productId required' });
        const items = await wishlist_service_1.wishlistService.addToWishlist(req.user.id, productId);
        res.status(http_constants_1.HTTP_STATUS.OK).json({ success: true, data: items });
    }
    catch (error) {
        next(error);
    }
};
exports.addToWishlist = addToWishlist;
const removeFromWishlist = async (req, res, next) => {
    try {
        const { productId } = req.body;
        if (!productId)
            return res.status(http_constants_1.HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'productId required' });
        const items = await wishlist_service_1.wishlistService.removeFromWishlist(req.user.id, productId);
        res.status(http_constants_1.HTTP_STATUS.OK).json({ success: true, data: items });
    }
    catch (error) {
        next(error);
    }
};
exports.removeFromWishlist = removeFromWishlist;
const toggleWishlist = async (req, res, next) => {
    try {
        const { productId } = req.body;
        if (!productId)
            return res.status(http_constants_1.HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'productId required' });
        const result = await wishlist_service_1.wishlistService.toggleWishlist(req.user.id, productId);
        res.status(http_constants_1.HTTP_STATUS.OK).json({ success: true, ...result });
    }
    catch (error) {
        next(error);
    }
};
exports.toggleWishlist = toggleWishlist;
