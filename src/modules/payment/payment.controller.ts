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
    // Supporting both dbOrderId and orderId aliases from client
    const { amount, currency = 'INR', receipt, orderId, dbOrderId } = req.body;
    const mongoOrderId = orderId || dbOrderId;

    console.log(`Creating Razorpay order. Amount: ${amount}, Mongo Order ID: ${mongoOrderId}`);

    if (!amount) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Amount is required',
      });
    }

    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise for INR)
      currency,
      receipt: mongoOrderId || receipt || `receipt_${Date.now()}`,
    };

    const rzpOrder = await razorpay.orders.create(options);
    console.log(`Razorpay order created: ${rzpOrder.id}`);

    // If mongoOrderId (Mongo ID) is provided, update the order in database with razorpayOrderId immediately
    if (mongoOrderId && mongoOrderId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log(`Attempting to link Razorpay Order ${rzpOrder.id} to Mongo Order ${mongoOrderId}`);
      const updatedOrder = await Order.findByIdAndUpdate(mongoOrderId, {
        razorpayOrderId: rzpOrder.id,
      }, { new: true });
      
      if (updatedOrder) {
        console.log(`Successfully linked Razorpay Order to Mongo Order ${mongoOrderId}`);
      } else {
        console.warn(`Could not find Mongo Order ${mongoOrderId} to link Razorpay Order`);
      }
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: rzpOrder,
    });
  } catch (error) {
    console.error('Error in createRazorpayOrder:', error);
    next(error);
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    console.log(`Verifying payment for Razorpay Order ID: ${razorpay_order_id}`);

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRATE!)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      console.log('Payment signature is authentic');

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

      // Primary Lookup Strategy: Find by razorpayOrderId
      console.log(`Primary Strategy: Looking up by razorpayOrderId: ${razorpay_order_id}`);
      let order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

      // Fallback Strategy: Fetch Razorpay order details to get 'receipt' (Mongo Order ID)
      if (!order) {
        console.log(`Fallback Strategy: Fetching Razorpay order to get receipt fallback`);
        try {
          const rzOrder = await razorpay.orders.fetch(razorpay_order_id);
          if (rzOrder && rzOrder.receipt && rzOrder.receipt.match(/^[0-9a-fA-F]{24}$/)) {
            console.log(`Found receipt in Razorpay order: ${rzOrder.receipt}`);
            order = await Order.findById(rzOrder.receipt);
          }
        } catch (fetchOrderError) {
          console.error('Error fetching Razorpay order details:', fetchOrderError);
        }
      }

      if (!order) {
        console.error(`Order not found for Razorpay Order ID: ${razorpay_order_id}`);
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: "Order not found in database",
        });
      }

      console.log(`Order found: ${order._id}. Updating status to Paid.`);

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
      console.warn('Payment signature verification failed');
      // Payment failed verification - try to find order to mark as failed
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
    console.error('Unexpected error in verifyPayment:', error);
    next(error);
  }
};
