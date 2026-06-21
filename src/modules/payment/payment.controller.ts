import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service';
import { HTTP_STATUS } from '../../shared/constants/http.constants';

// @desc    Create a Razorpay order (linked to a pending order in our DB)
// @route   POST /api/payment/create-order
// @access  Private
export const createRazorpayOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'No items in order' });
    }
    if (!shippingAddress) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Shipping address is required' });
    }

    const result = await paymentService.createOrder((req as any).user.id, { items, shippingAddress });

    res.status(HTTP_STATUS.OK).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify a Razorpay payment and persist its status
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const result = await paymentService.verifyPayment((req as any).user.id, {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    res.status(result.code).json({
      success: result.success,
      message: result.message,
      data: result.order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Razorpay webhook — async source of truth for payment status
// @route   POST /api/payment/webhook
// @access  Public (verified via X-Razorpay-Signature)
export const razorpayWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string | undefined;
    // rawBody is captured in index.ts via the express.json verify hook.
    const rawBody = (req as any).rawBody ?? JSON.stringify(req.body);

    const result = await paymentService.handleWebhook(rawBody, signature);

    res.status(result.code).json({ success: result.success, message: result.message });
  } catch (error) {
    // Always 200/4xx fast; log the rest so Razorpay does not hammer retries forever.
    console.error('Razorpay webhook error:', error);
    res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Webhook handling failed' });
  }
};
