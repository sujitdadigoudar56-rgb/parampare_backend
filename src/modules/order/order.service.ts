import Order from './order.model';
import Cart from '../cart/cart.model';

export class OrderService {
  // Place a new order — auto-clears cart
  async createOrder(userId: string, data: {
    items: { productId: string; name: string; image: string; quantity: number; price: number }[];
    shippingAddress: any;
    paymentMethod?: string;
  }) {
    const subtotal = data.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const deliveryCharge = subtotal >= 999 ? 0 : 99;
    const totalAmount = subtotal + deliveryCharge;
    const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const order = await Order.create({
      user: userId,
      items: data.items.map(i => ({
        product: i.productId as any,
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
    await Cart.findOneAndDelete({ user: userId as any });

    return order;
  }

  // Get all orders for a user
  async getMyOrders(userId: string) {
    return await Order.find({ user: userId }).sort({ createdAt: -1 });
  }

  // Get single order
  async getOrderById(orderId: string, userId: string) {
    return await Order.findOne({ _id: orderId, user: userId });
  }

  // All orders (admin)
  async getAllOrders() {
    return await Order.find().populate('user', 'fullName email mobile').sort({ createdAt: -1 });
  }

  // Update status (admin)
  async updateOrderStatus(orderId: string, status: string) {
    return await Order.findByIdAndUpdate(orderId, { status }, { new: true });
  }
}

export const orderService = new OrderService();
