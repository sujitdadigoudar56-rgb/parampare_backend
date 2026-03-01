import { Request, Response, NextFunction } from 'express';
import Order from '../order/order.model';
import Product from '../product/product.model';
import User from '../user/user.model';
import { HTTP_STATUS } from '../../shared/constants/http.constants';

// @desc    Upload images (to S3 if configured, otherwise local disk)
// @route   POST /api/admin/upload
// @access  Private/Admin
export const uploadImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as any[];
    if (!files || files.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'No files uploaded' });
    }

    // S3 files have `location`, local disk files have `filename`
    const urls = files.map((f) =>
      f.location ? f.location : `/uploads/products/${f.filename}`
    );

    const usingS3 = !!(files[0].location);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      urls,
      storage: usingS3 ? 's3' : 'local',
      message: usingS3
        ? 'Uploaded to AWS S3'
        : 'Uploaded to local storage. Add AWS credentials to .env to use S3.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product (Admin)
// @route   POST /api/admin/products
// @access  Private/Admin
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.create(req.body);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: product });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const updateProductAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Product not found' });
    res.status(HTTP_STATUS.OK).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const deleteProductAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Product not found' });
    res.status(HTTP_STATUS.OK).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'USER' });

    // Calculate total revenue
    const orders = await Order.find({ status: { $ne: 'cancelled' } });
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'fullName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        totalOrders,
        totalProducts,
        totalUsers,
        totalRevenue,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const count = await User.countDocuments();
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user (Admin)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`GET /api/admin/users/${req.params.id} hit`);
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log(`User ${req.params.id} not found`);
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'User not found' });
    }
    res.status(HTTP_STATUS.OK).json({ success: true, data: user });
  } catch (error) {
    console.error(`Error in getUserById:`, error);
    next(error);
  }
};

// @desc    Update user status (Admin)
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
export const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
