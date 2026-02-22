import { Router } from 'express';
import {
  createCategory,
  getCategories,
  getCategoryTree,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
} from './category.controller';
import { protect } from '../../core/middleware/auth.middleware';

const router = Router();

router.route('/')
  .get(getCategories)
  .post(protect as any, createCategory);

router.get('/tree', getCategoryTree);

router.get('/slug/:slug', getCategoryBySlug);

router.route('/:id')
  .put(protect as any, updateCategory)
  .delete(protect as any, deleteCategory);

export default router;
