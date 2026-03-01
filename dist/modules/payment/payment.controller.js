"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.createRazorpayOrder = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const order_model_1 = __importDefault(require("../order/order.model"));
const http_constants_1 = require("../../shared/constants/http.constants");
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRATE, // Using the variable name with typo as found in .env
});
// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
const createRazorpayOrder = async (req, res, next) => {
    try {
        const { amount, currency = 'INR', receipt, dbOrderId } = req.body;
        if (!amount) {
            return res.status(http_constants_1.HTTP_STATUS.BAD_REQUEST).json({
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
        // If dbOrderId is provided, update the order in database with razorpayOrderId
        if (dbOrderId) {
            await order_model_1.default.findByIdAndUpdate(dbOrderId, {
                razorpayOrderId: order.id,
            });
        }
        res.status(http_constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: order,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createRazorpayOrder = createRazorpayOrder;
// @desc    Verify Razorpay Payment
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto_1.default
            .createHmac("sha256", process.env.RAZORPAY_SECRATE)
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
            }
            catch (fetchError) {
                console.error('Error fetching Razorpay payment details:', fetchError);
                // Continue with req.body if fetch fails, so we don't break the flow
            }
            // Update order in database
            let order;
            if (dbOrderId) {
                order = await order_model_1.default.findByIdAndUpdate(dbOrderId, {
                    razorpayOrderId: razorpay_order_id,
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                    razorpayResponse: razorpayFullResponse,
                    paymentStatus: 'Paid',
                }, { new: true });
            }
            else {
                // Fallback: try to find by razorpay_order_id if dbOrderId is not provided
                order = await order_model_1.default.findOneAndUpdate({ razorpayOrderId: razorpay_order_id }, {
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                    razorpayResponse: razorpayFullResponse,
                    paymentStatus: 'Paid',
                }, { new: true });
            }
            if (!order) {
                return res.status(http_constants_1.HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: "Order not found in database",
                });
            }
            res.status(http_constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: "Payment verified and full details saved successfully",
                data: order,
            });
        }
        else {
            // Optionally mark as failed
            if (dbOrderId) {
                await order_model_1.default.findByIdAndUpdate(dbOrderId, { paymentStatus: 'Failed' });
            }
            else {
                await order_model_1.default.findOneAndUpdate({ razorpayOrderId: razorpay_order_id }, { paymentStatus: 'Failed' });
            }
            res.status(http_constants_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "Invalid signature, payment verification failed",
            });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.verifyPayment = verifyPayment;
