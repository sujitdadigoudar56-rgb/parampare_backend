import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
} from './user.controller';
import { protect } from '../../core/middleware/auth.middleware';

const router = Router();

router.use(protect as any); // All routes private

router.get('/profile', getProfile as any);
router.patch('/profile', updateProfile as any);

router.route('/addresses')
  .get(getAddresses as any)
  .post(addAddress as any);

router.route('/addresses/:id')
  .put(updateAddress as any)
  .delete(deleteAddress as any);

export default router;
