import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from './product.controller';
import { protect } from '../../core/middleware/auth.middleware';
// import { admin } from '../../core/middleware/auth.middleware'; // TODO: Implement admin middleware

const router = Router();

router.route('/')
  .get(getProducts)
  .post(protect as any, createProduct); // Add admin check later

router.route('/:id')
  .get(getProduct)
  .put(protect as any, updateProduct) // Add admin check later
  .delete(protect as any, deleteProduct); // Add admin check later

export default router;
