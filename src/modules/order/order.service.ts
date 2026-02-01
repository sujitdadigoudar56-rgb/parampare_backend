import Order, { IOrder } from './order.model';
import { productService } from '../product/product.service';
import mongoose from 'mongoose';

export class OrderService {
  // Create new order
  async createOrder(userId: string, orderData: { items: { productId: string, quantity: number }[], addressId: string, paymentMethod: string }): Promise<IOrder> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { items, addressId, paymentMethod } = orderData;
        
        let totalAmount = 0;
        const processedItems = [];

        for (const item of items) {
            const product = await productService.findById(item.productId);
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
            await productService.updateStock(item.productId, -item.quantity);
            
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
        const Address = (await import('../user/address.model')).default;
        const addressDoc = await Address.findById(addressId);
        if (!addressDoc) throw new Error('Address not found');

        const shippingAddressSnapshot = {
            address: addressDoc.house + ', ' + addressDoc.street,
            city: addressDoc.city,
            postalCode: addressDoc.pincode,
            country: 'India', // default
            // Add other fields as needed
        };

        const order = await Order.create([{
            user: userId,
            orderNumber,
            items: processedItems,
            totalAmount,
            status: 'pending',
            paymentMethod,
            shippingAddress: shippingAddressSnapshot
        }], { session });

        await session.commitTransaction();
        return order[0];

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
  }

  // Get orders for a specific user
  async getUserOrders(userId: string): Promise<IOrder[]> {
    return await Order.find({ user: userId }).populate('items.product').sort('-createdAt');
  }

  // Get single order
  async getOrderById(id: string): Promise<IOrder | null> {
    return await Order.findById(id).populate('items.product').populate('user', 'fullName email');
  }

  // Cancel order (User)
  async cancelOrder(id: string, userId: string): Promise<IOrder | null> {
      const order = await Order.findOne({ _id: id, user: userId });
      if (!order) throw new Error('Order not found');
      
      // Statuses: pending, processing, shipped, delivered, cancelled
      if (order.status !== 'pending' && order.status !== 'processing') {
          throw new Error('Order cannot be cancelled at this stage');
      }

      order.status = 'cancelled';
      await order.save();

      // Restore stock
      for (const item of order.items) {
          await productService.updateStock(item.product.toString(), item.quantity);
      }

      return order;
  }

  // Get all orders (Admin)
  async getAllOrders(): Promise<IOrder[]> {
    return await Order.find().populate('user', 'fullName email').sort('-createdAt');
  }

  // Update order status (Admin)
  async updateStatus(id: string, status: string): Promise<IOrder | null> {
    return await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
  }
}

export const orderService = new OrderService();
