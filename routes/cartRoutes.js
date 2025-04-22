import express from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get current user's cart
router.get('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    res.json(cart || { user: req.user._id, items: [] });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cart', error: err.message });
  }
});

// Add or update item in cart
router.post('/add', protect, async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || quantity < 1) return res.status(400).json({ message: 'Invalid input' });

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const cart = await Cart.findOne({ user: req.user._id }) || new Cart({ user: req.user._id, items: [] });
    const existingItem = cart.items.find(item => item.productId.toString() === productId);

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > product.countInStock) {
        return res.status(400).json({ message: 'Exceeds available stock' });
      }
      existingItem.quantity = newQty;
    } else {
      cart.items.push({
        productId,
        name: product.name,
        price: product.price,
        quantity,
        image: product.images?.[0] || '/assets/no-image.jpg',
        category: product.category,
        description: product.description,
      });
    }

    await cart.save();
    res.status(201).json({ message: 'Cart updated', cart });
  } catch (err) {
    res.status(500).json({ message: 'Error updating cart', error: err.message });
  }
});

// Update item quantity
router.put('/update-item/:cartItemId', protect, async (req, res) => {
  const { quantity } = req.body;
  const { cartItemId } = req.params;

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.id(cartItemId);
    if (!item) return res.status(404).json({ message: 'Cart item not found' });

    const product = await Product.findById(item.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (quantity > product.countInStock)
      return res.status(400).json({ message: 'Not enough stock' });

    item.quantity = quantity;
    await cart.save();

    res.json({ message: 'Cart item updated successfully', cart });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
});


// Remove item from cart
router.delete('/remove/:productId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item.productId.toString() !== req.params.productId);
    await cart.save();
    res.json({ message: 'Item removed', cart });
  } catch (err) {
    res.status(500).json({ message: 'Error removing item', error: err.message });
  }
});

// Clear cart
router.delete('/clear', protect, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear cart', error: err.message });
  }
});

// Checkout
router.post('/checkout', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product || item.quantity > product.countInStock) {
        return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
      }
    }

    // Optionally reduce stock here
    await Cart.deleteOne({ user: req.user._id });
    res.json({ message: 'Checkout successful!' });
  } catch (err) {
    res.status(500).json({ message: 'Checkout failed', error: err.message });
  }
});

export default router;
