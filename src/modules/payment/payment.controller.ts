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
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Amount is required',
      });
    }

    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise for INR)
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;

    if (!dbOrderId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "dbOrderId (Internal Order ID) is required",
      });
    }

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
        // Continue with req.body if fetch fails, so we don't break the flow
      }

      // Update order in database
      const order = await Order.findByIdAndUpdate(
        dbOrderId,
        {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          razorpayResponse: razorpayFullResponse,
          paymentStatus: 'Paid',
        },
        { new: true }
      );

      if (!order) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: "Order not found in database",
        });
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Payment verified and full details saved successfully",
        data: order,
      });
    } else {
      // Optionally mark as failed
      await Order.findByIdAndUpdate(dbOrderId, { paymentStatus: 'Failed' });

      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid signature, payment verification failed",
      });
    }
  } catch (error) {
    next(error);
  }
};
