import express from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all cart items for current user
router.get('/', protect, async (req, res) => {
  try {
    const cartItems = await Cart.find({ user: req.user._id });
    res.json({ items: cartItems });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart items', error: error.message });
  }
});

// Add item to cart
router.post('/add', protect, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) return res.status(400).json({ message: 'Product ID is required' });
    if (quantity < 1) return res.status(400).json({ message: 'Quantity must be at least 1' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (quantity > product.countInStock)
      return res.status(400).json({ message: 'Not enough stock available' });

    let cartItem = await Cart.findOne({ user: req.user._id, productId });

    if (cartItem) {
      const totalQty = cartItem.quantity + quantity;
      if (totalQty > product.countInStock) {
        return res.status(400).json({ message: 'Exceeds available stock' });
      }
      cartItem.quantity = totalQty;
    } else {
      cartItem = new Cart({
        user: req.user._id,
        productId,
        name: product.name,
        price: product.price,
        quantity,
        image: product.images?.[0] || '/assets/no-image.jpg',
        category: product.category,
        description: product.description,
      });
    }

    await cartItem.save();
    res.status(201).json({ message: 'Item added to cart', cartItem });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart', error: error.message });
  }
});

// Update quantity
router.put('/update/:id', protect, async (req, res) => {
  const { quantity } = req.body;

  if (quantity < 1) return res.status(400).json({ message: 'Quantity must be at least 1' });

  try {
    const item = await Cart.findOne({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const product = await Product.findById(item.productId);
    if (quantity > product.countInStock)
      return res.status(400).json({ message: 'Not enough stock' });

    item.quantity = quantity;
    await item.save();
    res.json({ message: 'Item updated', item });
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart', error: error.message });
  }
});

// Delete item
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await Cart.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ message: 'Item not found' });

    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing item', error: error.message });
  }
});

// Clear cart
router.delete('/clear', protect, async (req, res) => {
  try {
    await Cart.deleteMany({ user: req.user._id });
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear cart', error: error.message });
  }
});

// Validate coupon
router.post('/validate-coupon', protect, (req, res) => {
  const { code } = req.body;
  if (code === 'SAVE20') {
    return res.json({ valid: true, discount: 20 });
  }
  res.json({ valid: false, discount: 0 });
});

// Checkout
router.post('/checkout', protect, async (req, res) => {
  try {
    const cartItems = await Cart.find({ user: req.user._id });
    if (!cartItems.length) return res.status(400).json({ message: 'Cart is empty' });

    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product || item.quantity > product.countInStock) {
        return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
      }
    }

    // (Optional) Reduce product stock here if doing real order logic

    await Cart.deleteMany({ user: req.user._id });
    res.json({ message: 'Checkout successful!' });
  } catch (error) {
    res.status(500).json({ message: 'Checkout failed', error: error.message });
  }
});

export default router;
