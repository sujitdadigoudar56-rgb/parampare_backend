import { Request, Response, NextFunction } from 'express';
import { orderService } from './order.service';
import { HTTP_STATUS, HTTP_MESSAGES } from '../../shared/constants/http.constants';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: HTTP_MESSAGES.UNAUTHORIZED });
    }
    
    // items: [{productId, quantity}], addressId: string, paymentMethod: string
    const order = await orderService.createOrder(req.user._id.toString(), req.body);
    
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    if (error.message.includes('Insufficient stock') || error.message.includes('not found')) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders   (Doc says GET /api/orders - filter by user)
// But routing at /api/orders is usually "All" for admin or "Mine" for user.
// Current route setup: router.use('/orders', ...)
// /api/orders -> usually getMyOrders for user role, getAllOrders for admin.
// However, controller usually splits them.
// Let's implement getOrders which decides based on logic, or stick to separate methods.
// The doc says: "GET /api/orders Get user's order history".
// So for a normal user, `GET /api/orders` returns THEIR history.
export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: HTTP_MESSAGES.UNAUTHORIZED });
    }
    
    // If admin, maybe return all? Or strictly follow doc "Get user's order history".
    // I'll stick to "Get user's order history" for this endpoint. Admin can have /all or similar.
    // Or we handle roles here.
    // For now, assume this is for the user.
    const orders = await orderService.getUserOrders(req.user._id.toString());
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.getOrderById(req.params.id as string);
    
    if (!order) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: HTTP_MESSAGES.NOT_FOUND,
      });
    }

    // Check ownership
    // if (order.user._id.toString() !== req.user!._id.toString() && req.user!.role !== 'ADMIN') {
    //      return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'Not authorized' });
    // }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await orderService.cancelOrder(req.params.id as string, req.user!._id.toString());
        res.status(HTTP_STATUS.OK).json({ success: true, data: order });
    } catch (error: any) {
        if (error.message.includes('not found') || error.message.includes('cannot be cancelled')) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await orderService.getAllOrders();
    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const order = await orderService.updateStatus(req.params.id as string, status);

    if (!order) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: HTTP_MESSAGES.NOT_FOUND,
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
