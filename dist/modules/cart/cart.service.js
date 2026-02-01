"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartService = exports.CartService = void 0;
const cart_model_1 = __importDefault(require("./cart.model"));
class CartService {
    async getCart(userId) {
        return await cart_model_1.default.findOne({ user: userId }).populate('items.product');
    }
    async addToCart(userId, productId, quantity) {
        let cart = await cart_model_1.default.findOne({ user: userId });
        if (!cart) {
            cart = await cart_model_1.default.create({ user: userId, items: [] });
        }
        const existingItemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        }
        else {
            cart.items.push({ product: productId, quantity });
        }
        await cart.save();
        return (await cart.populate('items.product'));
    }
    async updateCartItem(userId, productId, quantity) {
        const cart = await cart_model_1.default.findOne({ user: userId });
        if (!cart)
            throw new Error('Cart not found');
        const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
        if (itemIndex > -1) {
            if (quantity <= 0) {
                cart.items.splice(itemIndex, 1);
            }
            else {
                cart.items[itemIndex].quantity = quantity;
            }
            await cart.save();
            return (await cart.populate('items.product'));
        }
        throw new Error('Item not in cart');
    }
    async removeFromCart(userId, productId) {
        const cart = await cart_model_1.default.findOne({ user: userId });
        if (!cart)
            throw new Error('Cart not found');
        cart.items = cart.items.filter((item) => item.product.toString() !== productId);
        await cart.save();
        return (await cart.populate('items.product'));
    }
    async clearCart(userId) {
        await cart_model_1.default.deleteOne({ user: userId });
    }
}
exports.CartService = CartService;
exports.cartService = new CartService();
