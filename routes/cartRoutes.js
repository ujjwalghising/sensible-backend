// routes/cartRoutes.js
import express from 'express';
import {
  addToCart,
  getCartItems,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js'; // Auth middleware

const router = express.Router();

// All routes protected (require login)
router.use(protect);

router.get('/', getCartItems); // GET /api/cart
router.post('/add', addToCart); // POST /api/cart/add
router.put('/update', updateCartItem); // PUT /api/cart/update
router.delete('/remove/:productId', removeFromCart); // DELETE /api/cart/remove/:productId
router.delete('/clear', clearCart); // DELETE /api/cart/clear

export default router;
