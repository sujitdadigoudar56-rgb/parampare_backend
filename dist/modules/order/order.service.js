"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderService = exports.OrderService = void 0;
const order_model_1 = __importDefault(require("./order.model"));
const cart_model_1 = __importDefault(require("../cart/cart.model"));
class OrderService {
    // Place a new order — auto-clears cart
    async createOrder(userId, data) {
        const subtotal = data.items.reduce((s, i) => s + i.price * i.quantity, 0);
        const deliveryCharge = subtotal >= 999 ? 0 : 99;
        const totalAmount = subtotal + deliveryCharge;
        const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const order = await order_model_1.default.create({
            user: userId,
            items: data.items.map(i => ({
                product: i.productId,
                name: i.name,
                image: i.image,
                quantity: i.quantity,
                price: i.price,
            })),
            subtotal,
            deliveryCharge,
            totalAmount,
            shippingAddress: data.shippingAddress,
            paymentMethod: data.paymentMethod || 'Pay on Delivery',
            estimatedDelivery,
        });
        // Clear the user's cart
        await cart_model_1.default.findOneAndDelete({ user: userId });
        return order;
    }
    // Get all orders for a user
    async getMyOrders(userId) {
        return await order_model_1.default.find({ user: userId }).sort({ createdAt: -1 });
    }
    // Get single order
    async getOrderById(orderId, userId) {
        return await order_model_1.default.findOne({ _id: orderId, user: userId });
    }
    // All orders (admin)
    async getAllOrders() {
        return await order_model_1.default.find().populate('user', 'fullName email mobile').sort({ createdAt: -1 });
    }
    // Update status (admin)
    async updateOrderStatus(orderId, status) {
        return await order_model_1.default.findByIdAndUpdate(orderId, { status }, { new: true });
    }
}
exports.OrderService = OrderService;
exports.orderService = new OrderService();
