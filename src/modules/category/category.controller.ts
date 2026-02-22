import { Request, Response, NextFunction } from 'express';
import { categoryService } from './category.service';
import { HTTP_STATUS } from '../../shared/constants/http.constants';

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryTree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tree = await categoryService.getCategoryTree();
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: tree,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.findBySlug(req.params.slug as string);
    if (!category) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Category not found',
      });
    }
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.updateCategory(req.params.id as string, req.body);
    if (!category) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Category not found',
      });
    }
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.deleteCategory(req.params.id as string);
    if (!category) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Category not found',
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
