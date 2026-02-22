import { Request, Response, NextFunction } from 'express';
import { orderService } from './order.service';
import { HTTP_STATUS } from '../../shared/constants/http.constants';

// POST /api/orders — place order
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    if (!items || items.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'No items in order' });
    }
    if (!shippingAddress) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Shipping address required' });
    }
    const order = await orderService.createOrder((req as any).user.id, { items, shippingAddress, paymentMethod });
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: order });
  } catch (error) { next(error); }
};

// GET /api/orders/my — my orders
export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await orderService.getMyOrders((req as any).user.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: orders });
  } catch (error) { next(error); }
};

// GET /api/orders/:id
export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.getOrderById(String(req.params.id), (req as any).user.id);
    if (!order) return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Order not found' });
    res.status(HTTP_STATUS.OK).json({ success: true, data: order });
  } catch (error) { next(error); }
};

// GET /api/orders/admin/all — admin: get all orders
export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await orderService.getAllOrders();
    res.status(HTTP_STATUS.OK).json({ success: true, data: orders });
  } catch (error) { next(error); }
};

// PATCH /api/orders/:id/status — admin
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.updateOrderStatus(String(req.params.id), req.body.status);
    if (!order) return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Order not found' });
    res.status(HTTP_STATUS.OK).json({ success: true, data: order });
  } catch (error) { next(error); }
};
