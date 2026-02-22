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
        return (wishlist === null || wishlist === void 0 ? void 0 : wishlist.items) || [];
    }
    async addToWishlist(userId, productId) {
        let wishlist = await wishlist_model_1.default.findOne({ user: userId });
        if (!wishlist) {
            wishlist = await wishlist_model_1.default.create({ user: userId, items: [] });
        }
        const already = wishlist.items.some((i) => i.product.toString() === productId);
        if (!already) {
            wishlist.items.push({ product: productId });
            await wishlist.save();
        }
        return (await wishlist.populate('items.product')).items;
    }
    async removeFromWishlist(userId, productId) {
        const wishlist = await wishlist_model_1.default.findOne({ user: userId });
        if (!wishlist)
            return [];
        wishlist.items = wishlist.items.filter((i) => i.product.toString() !== productId);
        await wishlist.save();
        return (await wishlist.populate('items.product')).items;
    }
    async toggleWishlist(userId, productId) {
        let wishlist = await wishlist_model_1.default.findOne({ user: userId });
        if (!wishlist) {
            wishlist = await wishlist_model_1.default.create({ user: userId, items: [] });
        }
        const idx = wishlist.items.findIndex((i) => i.product.toString() === productId);
        if (idx > -1) {
            wishlist.items.splice(idx, 1);
            await wishlist.save();
            return { added: false, items: (await wishlist.populate('items.product')).items };
        }
        else {
            wishlist.items.push({ product: productId });
            await wishlist.save();
            return { added: true, items: (await wishlist.populate('items.product')).items };
        }
    }
}
exports.WishlistService = WishlistService;
exports.wishlistService = new WishlistService();
