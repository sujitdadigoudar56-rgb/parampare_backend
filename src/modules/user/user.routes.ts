import { Router } from 'express';
import {
  getProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  toggleWishlist
} from './user.controller';
import { protect } from '../../core/middleware/auth.middleware';

const router = Router();

router.use(protect as any); // All routes private

router.get('/profile', getProfile as any);

router.route('/addresses')
  .get(getAddresses as any)
  .post(addAddress as any);

router.route('/addresses/:id')
  .put(updateAddress as any)
  .delete(deleteAddress as any);

router.get('/wishlist', getWishlist as any);
router.post('/wishlist/:productId', toggleWishlist as any);

export default router;
