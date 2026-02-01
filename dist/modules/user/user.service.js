"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const address_model_1 = __importDefault(require("./address.model"));
const wishlist_model_1 = __importDefault(require("./wishlist.model"));
class UserService {
    // Address Methods
    async getAddresses(userId) {
        return await address_model_1.default.find({ userId });
    }
    async addAddress(userId, data) {
        // If set as default, unset others // Optional logic but good UX
        if (data.isDefault) {
            await address_model_1.default.updateMany({ userId }, { isDefault: false });
        }
        return await address_model_1.default.create({ ...data, userId });
    }
    async updateAddress(userId, addressId, data) {
        if (data.isDefault) {
            await address_model_1.default.updateMany({ userId }, { isDefault: false });
        }
        return await address_model_1.default.findOneAndUpdate({ _id: addressId, userId }, data, { new: true });
    }
    async deleteAddress(userId, addressId) {
        return await address_model_1.default.findOneAndDelete({ _id: addressId, userId });
    }
    // Wishlist Methods
    async getWishlist(userId) {
        const wishlist = await wishlist_model_1.default.findOne({ userId }).populate('products');
        return wishlist ? wishlist.products : [];
    }
    async toggleWishlist(userId, productId) {
        let wishlist = await wishlist_model_1.default.findOne({ userId });
        if (!wishlist) {
            wishlist = await wishlist_model_1.default.create({ userId, products: [] });
        }
        // Convert string to ObjectId for comparison is usually handled by mongoose, but good to be explicit or use string helpers
        // Mongoose array methods:
        const index = wishlist.products.indexOf(productId);
        if (index > -1) {
            // Remove
            wishlist.products.splice(index, 1);
        }
        else {
            // Add
            wishlist.products.push(productId);
        }
        await wishlist.save();
        // Return populated? Or just list. Doc says "Add/Remove from wishlist".
        const populated = await wishlist.populate('products');
        return populated.products;
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
