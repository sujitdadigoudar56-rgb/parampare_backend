import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order, { IOrder } from '../order/order.model';
import Cart from '../cart/cart.model';
import { orderService, OrderItemInput } from '../order/order.service';

// Razorpay credentials. Note: the project historically used the misspelled
// RAZORPAY_SECRATE — we read both so existing deployments keep working.
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_SECRET || process.env.RAZORPAY_SECRATE || '';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

let razorpayInstance: Razorpay | null = null;

export const getRazorpay = (): Razorpay => {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials are not configured (RAZORPAY_KEY / RAZORPAY_SECRET)');
  }
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
  }
  return razorpayInstance;
};

/**
 * Map a Razorpay *payment* entity status onto our internal paymentStatus.
 * https://razorpay.com/docs/payments/payments/#payment-life-cycle
 */
export const mapPaymentStatus = (razorpayStatus?: string): IOrder['paymentStatus'] => {
  switch (razorpayStatus) {
    case 'created':
      return 'Created';
    case 'authorized':
      return 'Authorized';
    case 'captured':
      return 'Paid';
    case 'refunded':
      return 'Refunded';
    case 'failed':
      return 'Failed';
    default:
      return 'Pending';
  }
};

/**
 * Map a Razorpay *order* entity status onto our internal paymentStatus.
 * https://razorpay.com/docs/api/orders/#order-entity
 */
export const mapOrderStatus = (razorpayOrderStatus?: string): IOrder['paymentStatus'] => {
  switch (razorpayOrderStatus) {
    case 'created':
      return 'Created';
    case 'attempted':
      return 'Attempted';
    case 'paid':
      return 'Paid';
    default:
      return 'Pending';
  }
};

// Derive the fulfillment status from a payment outcome.
const fulfillmentFor = (paymentStatus: IOrder['paymentStatus']): IOrder['status'] | undefined => {
  switch (paymentStatus) {
    case 'Paid':
      return 'Order Confirmed';
    case 'Failed':
      return 'Payment Failed';
    case 'Refunded':
    case 'Partially Refunded':
      return 'Cancelled';
    default:
      return undefined; // leave fulfillment status untouched for in-flight states
  }
};

export class PaymentService {
  /**
   * Create an unpaid order in our DB, then a linked Razorpay order. Returns
   * everything the frontend needs to open Razorpay Checkout.
   */
  async createOrder(userId: string, data: { items: OrderItemInput[]; shippingAddress: any }) {
    if (!data.items?.length) throw new Error('No items provided for payment');
    if (!data.shippingAddress) throw new Error('Shipping address is required');

    const order = await orderService.createPendingOnlineOrder(userId, data);

    const razorpayOrder = await getRazorpay().orders.create({
      amount: Math.round(order.totalAmount * 100), // paise
      currency: 'INR',
      receipt: order.orderId || String(order._id),
      notes: { orderId: String(order._id), userId },
    });

    order.razorpayOrderId = razorpayOrder.id;
    order.paymentStatus = mapOrderStatus(razorpayOrder.status);
    await order.save();

    return {
      keyId: RAZORPAY_KEY_ID,
      orderId: String(order._id),
      razorpayOrder, // contains id, amount, currency, status, ...
    };
  }

  /**
   * Verify the signature returned by Razorpay Checkout, then fetch the
   * authoritative payment from Razorpay and persist its status + raw data.
   */
  async verifyPayment(
    userId: string,
    payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
  ) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return { success: false, code: 400, message: 'Missing Razorpay verification fields' };
    }

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id, user: userId as any });
    if (!order) {
      return { success: false, code: 404, message: 'Order not found for this payment' };
    }

    // 1) Verify signature: HMAC_SHA256(order_id|payment_id, secret)
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // timingSafeEqual throws if lengths differ, so guard length first.
    const isAuthentic =
      expectedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature));

    if (!isAuthentic) {
      order.paymentStatus = 'Failed';
      order.status = 'Payment Failed';
      await order.save();
      return { success: false, code: 400, message: 'Invalid signature, payment verification failed', order };
    }

    // 2) Fetch the real payment from Razorpay — never trust the client for the status.
    const payment = await getRazorpay().payments.fetch(razorpay_payment_id);

    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.razorpayResponse = payment;

    if (!order.razorpayEvents) order.razorpayEvents = [];
    order.razorpayEvents.push({
      event: 'verify.fetch',
      status: (payment as any)?.status,
      entity: payment,
      receivedAt: new Date(),
    });

    await this.applyPaymentEntity(order, payment);
    await order.save();

    if (order.paymentStatus === 'Paid' || order.paymentStatus === 'Authorized') {
      // Payment captured/authorized — safe to clear the cart now.
      await Cart.findOneAndDelete({ user: userId as any });
      return { success: true, code: 200, message: 'Payment verified successfully', order };
    }

    return { success: false, code: 400, message: `Payment not successful (status: ${payment.status})`, order };
  }

  /**
   * Apply a Razorpay payment entity onto an order document (status + amounts).
   * Shared by verify and the webhook handler.
   */
  private async applyPaymentEntity(order: IOrder, payment: any) {
    const paymentStatus = mapPaymentStatus(payment?.status);
    order.paymentStatus = paymentStatus;
    order.razorpayPaymentId = payment?.id || order.razorpayPaymentId;

    switch (payment?.status) {
      case 'captured':
        order.amountPaid = (payment.amount || 0) / 100;
        order.paidAt = payment.captured_at ? new Date(payment.captured_at * 1000) : new Date();
        break;
      case 'refunded':
        order.amountRefunded = (payment.amount_refunded || payment.amount || 0) / 100;
        order.refundedAt = new Date();
        break;
      case 'authorized':
        order.amountPaid = (payment.amount || 0) / 100;
        break;
      default:
        break;
    }

    const fulfillment = fulfillmentFor(paymentStatus);
    if (fulfillment) order.status = fulfillment;
  }

  /**
   * Verify and handle a Razorpay webhook. `rawBody` MUST be the exact bytes
   * received (see index.ts express.json verify hook) or the HMAC will not match.
   */
  async handleWebhook(rawBody: Buffer | string, signature?: string) {
    if (!RAZORPAY_WEBHOOK_SECRET) {
      throw new Error('RAZORPAY_WEBHOOK_SECRET is not configured');
    }
    if (!signature) {
      return { success: false, code: 400, message: 'Missing webhook signature' };
    }

    const body = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody;
    const expected = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET).update(body).digest('hex');

    const valid =
      expected.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    if (!valid) {
      return { success: false, code: 400, message: 'Invalid webhook signature' };
    }

    const event = JSON.parse(body);
    const paymentEntity = event?.payload?.payment?.entity;
    const orderEntity = event?.payload?.order?.entity;
    const refundEntity = event?.payload?.refund?.entity;
    const razorpayOrderId: string | undefined = paymentEntity?.order_id || orderEntity?.id || refundEntity?.notes?.orderId;

    // Locate our order. Prefer the notes.orderId we stamped at creation time.
    let order: IOrder | null = null;
    if (paymentEntity?.notes?.orderId || orderEntity?.notes?.orderId) {
      order = await Order.findById(paymentEntity?.notes?.orderId || orderEntity?.notes?.orderId);
    }
    if (!order && razorpayOrderId) {
      order = await Order.findOne({ razorpayOrderId });
    }

    if (!order) {
      // Acknowledge so Razorpay stops retrying, but flag it.
      return { success: true, code: 200, message: `No matching order for event ${event?.event}` };
    }

    const eventName: string = event?.event || 'unknown';
    // The entity most relevant to this event — stored in both the audit log and razorpayResponse.
    const primaryEntity = paymentEntity || orderEntity || refundEntity;

    // Append-only audit log: every event + its full Razorpay object is kept.
    if (!order.razorpayEvents) order.razorpayEvents = [];
    order.razorpayEvents.push({
      event: eventName,
      status: paymentEntity?.status || orderEntity?.status || refundEntity?.status,
      entity: primaryEntity,
      receivedAt: new Date(),
    });

    switch (eventName) {
      case 'payment.authorized':
        await this.applyPaymentEntity(order, paymentEntity);
        order.razorpaySignature = order.razorpaySignature || 'webhook';
        order.razorpayResponse = paymentEntity || order.razorpayResponse;
        break;

      case 'payment.captured':
      case 'order.paid':
        await this.applyPaymentEntity(order, paymentEntity || { status: 'captured', amount: orderEntity?.amount_paid });
        order.razorpayResponse = paymentEntity || orderEntity || order.razorpayResponse;
        await Cart.findOneAndDelete({ user: order.user });
        break;

      case 'payment.failed':
        order.paymentStatus = 'Failed';
        order.status = 'Payment Failed';
        order.razorpayResponse = paymentEntity || order.razorpayResponse;
        break;

      case 'refund.created':
        order.paymentStatus = 'Partially Refunded';
        order.amountRefunded = (refundEntity?.amount || 0) / 100;
        order.razorpayResponse = refundEntity || order.razorpayResponse;
        break;

      case 'refund.processed':
        order.paymentStatus = 'Refunded';
        order.status = 'Cancelled';
        order.amountRefunded = (refundEntity?.amount || 0) / 100;
        order.refundedAt = new Date();
        order.razorpayResponse = refundEntity || order.razorpayResponse;
        break;

      default:
        // Unrecognized event — still logged above; persist the log and acknowledge.
        await order.save();
        return { success: true, code: 200, message: `Logged unhandled event ${eventName}` };
    }

    await order.save();
    return { success: true, code: 200, message: `Processed ${eventName}` };
  }
}

export const paymentService = new PaymentService();
