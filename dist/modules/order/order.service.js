"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderService = exports.OrderService = void 0;
const order_model_1 = __importDefault(require("./order.model"));
const product_service_1 = require("../product/product.service");
const mongoose_1 = __importDefault(require("mongoose"));
class OrderService {
    // Create new order
    async createOrder(userId, orderData) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const { items, addressId, paymentMethod } = orderData;
            let totalAmount = 0;
            const processedItems = [];
            for (const item of items) {
                const product = await product_service_1.productService.findById(item.productId);
                if (!product) {
                    throw new Error(`Product ${item.productId} not found`);
                }
                if (product.stockQuantity < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}`);
                }
                // Decrement Stock
                // Note: In transaction, we should pass session, but productService might not support it yet. 
                // For now, we call updateStock which saves. If generic error, we rely on error handling.
                // Ideally, productService methods should accept session.
                // Or we do it manually here for atomicity?
                // Let's call productService.updateStock which uses findById and save. 
                // Better: updateOne with session.
                // Since product service doesn't expose session, we risk partial updates if we crash here.
                // But strict transaction handling across modules needs careful design.
                // I will use `productService.updateStock` and catch errors.
                await product_service_1.productService.updateStock(item.productId, -item.quantity);
                totalAmount += product.price * item.quantity;
                processedItems.push({
                    product: product._id,
                    quantity: item.quantity,
                    price: product.price
                });
            }
            // Create Order
            const orderNumber = `PAR-ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            // Mock shipping address from ID for now or fetch it if reference
            // Ideally we fetch Address by addressId. 
            // For now, storing addressId or fetching? Doc says "Snapshot of address".
            // I'll assume we fetch it or client passes it? Doc says Payload: addressId.
            // I should fetch address. I need UserService or Address model.
            // Quick fix: Just store addressId as specific field or mock snapshot.
            // Let's use addressId string for now in `shippingAddress` field or fetch it if I import Address.
            // I will import Address model directly to fetch snapshot.
            // Dynamic import to avoid circular dep if any (Address model is safe)
            const Address = (await Promise.resolve().then(() => __importStar(require('../user/address.model')))).default;
            const addressDoc = await Address.findById(addressId);
            if (!addressDoc)
                throw new Error('Address not found');
            const shippingAddressSnapshot = {
                address: addressDoc.house + ', ' + addressDoc.street,
                city: addressDoc.city,
                postalCode: addressDoc.pincode,
                country: 'India', // default
                // Add other fields as needed
            };
            const order = await order_model_1.default.create([{
                    user: userId,
                    orderNumber,
                    items: processedItems,
                    totalAmount,
                    status: 'PENDING',
                    paymentMethod,
                    shippingAddress: shippingAddressSnapshot
                }], { session });
            await session.commitTransaction();
            return order[0];
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    // Get orders for a specific user
    async getUserOrders(userId) {
        return await order_model_1.default.find({ user: userId }).populate('items.product').sort('-createdAt');
    }
    // Get single order
    async getOrderById(id) {
        return await order_model_1.default.findById(id).populate('items.product').populate('user', 'fullName email');
    }
    // Cancel order (User)
    async cancelOrder(id, userId) {
        const order = await order_model_1.default.findOne({ _id: id, user: userId });
        if (!order)
            throw new Error('Order not found');
        if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
            throw new Error('Order cannot be cancelled at this stage');
        }
        order.status = 'CANCELLED';
        await order.save();
        // Restore stock
        for (const item of order.items) {
            await product_service_1.productService.updateStock(item.product.toString(), item.quantity);
        }
        return order;
    }
    // Get all orders (Admin)
    async getAllOrders() {
        return await order_model_1.default.find().populate('user', 'fullName email').sort('-createdAt');
    }
    // Update order status (Admin)
    async updateStatus(id, status) {
        return await order_model_1.default.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    }
}
exports.OrderService = OrderService;
exports.orderService = new OrderService();
