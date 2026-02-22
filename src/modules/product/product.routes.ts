import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from './product.controller';
import { protect, admin } from '../../core/middleware/auth.middleware';

const router = Router();

router.route('/')
  .get(getProducts)
  .post(protect as any, admin as any, createProduct); 

router.route('/:id')
  .get(getProduct)
  .put(protect as any, admin as any, updateProduct) 
  .delete(protect as any, admin as any, deleteProduct); 

export default router;
