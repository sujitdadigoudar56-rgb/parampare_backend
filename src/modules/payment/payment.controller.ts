import { Request, Response, NextFunction } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../order/order.model';
import { HTTP_STATUS } from '../../shared/constants/http.constants';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY!,
  key_secret: process.env.RAZORPAY_SECRATE!, // Using the variable name with typo as found in .env
});

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
export const createRazorpayOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, currency = 'INR', receipt, orderId } = req.body;

    if (!amount) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Amount is required',
      });
    }

    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise for INR)
      currency,
      receipt: orderId || receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // If orderId (Mongo ID) is provided, update the order in database with razorpayOrderId immediately
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        razorpayOrderId: order.id,
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRATE!)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Fetch the full payment object from Razorpay
      let razorpayFullResponse = req.body;
      try {
        const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
        if (paymentDetails) {
          razorpayFullResponse = { ...req.body, paymentDetails };
        }
      } catch (fetchError) {
        console.error('Error fetching Razorpay payment details:', fetchError);
      }

      // Find the order by razorpay_order_id
      let order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

      // Fallback: If order not found by razorpayOrderId, fetch Razorpay order details to get 'receipt' (Mongo Order ID)
      if (!order) {
        try {
          const rzOrder = await razorpay.orders.fetch(razorpay_order_id);
          if (rzOrder && rzOrder.receipt && rzOrder.receipt.match(/^[0-9a-fA-F]{24}$/)) {
            order = await Order.findById(rzOrder.receipt);
          }
        } catch (fetchOrderError) {
          console.error('Error fetching Razorpay order details:', fetchOrderError);
        }
      }

      if (!order) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: "Order not found in database",
        });
      }

      // Update order with payment details
      order.razorpayOrderId = razorpay_order_id;
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;
      order.razorpayResponse = razorpayFullResponse;
      order.paymentStatus = 'Paid';
      await order.save();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Payment verified and order updated successfully",
        data: order,
      });
    } else {
      // Payment failed verification
      const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
      if (order) {
        order.paymentStatus = 'Failed';
        await order.save();
      }

      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid signature, payment verification failed",
      });
    }
  } catch (error) {
    next(error);
  }
};
