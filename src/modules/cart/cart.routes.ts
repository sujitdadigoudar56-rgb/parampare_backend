import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCart,
  removeFromCart
} from './cart.controller';
import { protect } from '../../core/middleware/auth.middleware';

const router = Router();

router.use(protect as any);

router.get('/', getCart as any);
router.post('/add', addToCart as any);
router.put('/update', updateCart as any);
router.delete('/remove', removeFromCart as any);

export default router;
