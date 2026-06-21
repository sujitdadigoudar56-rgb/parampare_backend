import Order from './order.model';
import Cart from '../cart/cart.model';

export type OrderItemInput = { productId: string; name: string; image: string; quantity: number; price: number };

// Single source of truth for pricing — keep in sync with the frontend checkout summary.
export const FREE_DELIVERY_THRESHOLD = 2999;
export const DELIVERY_CHARGE = 20;

export const computeOrderAmounts = (items: OrderItemInput[]) => {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const totalAmount = subtotal + deliveryCharge;
  return { subtotal, deliveryCharge, totalAmount };
};

export class OrderService {
  // Place a new order — auto-clears cart (used for COD / Pay on Delivery)
  async createOrder(userId: string, data: {
    items: OrderItemInput[];
    shippingAddress: any;
    paymentMethod?: string;
  }) {
    const { subtotal, deliveryCharge, totalAmount } = computeOrderAmounts(data.items);
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

  // Create an unpaid online order up-front so the Razorpay order id can be linked
  // to it. The cart is cleared only once the payment is verified (see PaymentService).
  async createPendingOnlineOrder(userId: string, data: {
    items: OrderItemInput[];
    shippingAddress: any;
  }) {
    const { subtotal, deliveryCharge, totalAmount } = computeOrderAmounts(data.items);
    const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return await Order.create({
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
      paymentMethod: 'Online Payment',
      status: 'Payment Pending',
      paymentStatus: 'Created',
      estimatedDelivery,
    });
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
  async getAllOrders(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const count = await Order.countDocuments();
    const orders = await Order.find()
      .populate('user', 'fullName email mobile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      orders,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    };
  }

  // Get single order (admin - no user check)
  async getOrderByIdAdmin(orderId: string) {
    return await Order.findById(orderId).populate('user', 'fullName email mobile');
  }

  // Update status (admin)
  async updateOrderStatus(orderId: string, status: string) {
    return await Order.findByIdAndUpdate(orderId, { status }, { new: true });
  }
}

export const orderService = new OrderService();
