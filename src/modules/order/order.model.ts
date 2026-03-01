import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

export interface IShippingAddress {
  fullName: string;
  mobile: string;
  house: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  alternatePhone?: string;
}

export interface IOrder extends Document {
  orderId: string;
  user: Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  status: 'Order Confirmed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  razorpayResponse?: any;
  shippingAddress: IShippingAddress;
  estimatedDelivery: Date;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema(
  {
    orderId: { type: String, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String, required: true },
        image: { type: String, default: '' },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    deliveryCharge: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Order Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Order Confirmed',
    },
    paymentMethod: { type: String, default: 'Pay on Delivery' },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    razorpayResponse: { type: Schema.Types.Mixed },
    shippingAddress: {
      fullName: { type: String, required: true },
      mobile: { type: String, required: true },
      house: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      landmark: { type: String, required: true },
      alternatePhone: { type: String },
    },
    estimatedDelivery: { type: Date },
    trackingNumber: { type: String },
  },
  { timestamps: true }
);

// Auto-generate orderId before save
orderSchema.pre('save', function (next) {
  if (!this.orderId) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
    this.orderId = `PAR-ORD-${date}-${rand}`;
  }
  next();
});

const Order = (mongoose.models['Order'] || mongoose.model<IOrder>('Order', orderSchema)) as mongoose.Model<IOrder>;
export default Order;
