"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wishlistService = exports.WishlistService = void 0;
const wishlist_model_1 = __importDefault(require("./wishlist.model"));
class WishlistService {
    async getWishlist(userId) {
        const wishlist = await wishlist_model_1.default.findOne({ user: userId }).populate('items.product');
        if (!wishlist)
            return [];
        // Filter out items where product no longer exists in DB
        return wishlist.items.filter((i) => i.product);
    }
    async addToWishlist(userId, productId) {
        let wishlist = await wishlist_model_1.default.findOne({ user: userId });
        if (!wishlist) {
            wishlist = await wishlist_model_1.default.create({ user: userId, items: [] });
        }
        const already = wishlist.items.some((i) => i.product && i.product.toString() === productId);
        if (!already) {
            wishlist.items.push({ product: productId });
            await wishlist.save();
        }
        const populated = await wishlist.populate('items.product');
        return populated.items.filter((i) => i.product);
    }
    async removeFromWishlist(userId, productId) {
        const wishlist = await wishlist_model_1.default.findOne({ user: userId });
        if (!wishlist)
            return [];
        wishlist.items = wishlist.items.filter((i) => i.product && i.product.toString() !== productId);
        await wishlist.save();
        const populated = await wishlist.populate('items.product');
        return populated.items.filter((i) => i.product);
    }
    async toggleWishlist(userId, productId) {
        let wishlist = await wishlist_model_1.default.findOne({ user: userId });
        if (!wishlist) {
            wishlist = await wishlist_model_1.default.create({ user: userId, items: [] });
        }
        const idx = wishlist.items.findIndex((i) => i.product && i.product.toString() === productId);
        if (idx > -1) {
            wishlist.items.splice(idx, 1);
            await wishlist.save();
            const populated = await wishlist.populate('items.product');
            return { added: false, items: populated.items.filter((i) => i.product) };
        }
        else {
            wishlist.items.push({ product: productId });
            await wishlist.save();
            const populated = await wishlist.populate('items.product');
            return { added: true, items: populated.items.filter((i) => i.product) };
        }
    }
}
exports.WishlistService = WishlistService;
exports.wishlistService = new WishlistService();
