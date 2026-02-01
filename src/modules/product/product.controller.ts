import { Request, Response, NextFunction } from 'express';
import { productService } from './product.service';
import { HTTP_STATUS, HTTP_MESSAGES } from '../../shared/constants/http.constants';

// @desc    Get all products (with filters)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await productService.findAll(req.query);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.findById(req.params.id as string);
    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: HTTP_MESSAGES.NOT_FOUND,
      });
    }
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await productService.getCategories();
        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: categories
        });
    } catch (error) {
        next(error);
    }
}

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.updateProduct(req.params.id as string, req.body);
    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: HTTP_MESSAGES.NOT_FOUND,
      });
    }
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.deleteProduct(req.params.id as string);
    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: HTTP_MESSAGES.NOT_FOUND,
      });
    }
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
