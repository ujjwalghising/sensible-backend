import express from 'express';
import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const router = express.Router();

// ✅ Get all cart items
router.get('/', async (req, res) => {
  try {
    const cartItems = await Cart.find();
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart items', error: error.message });
  }
});

// ✅ Add item to cart
router.post('/add', async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    // Fetch product details from DB
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the item already exists in the cart
    let cartItem = await Cart.findOne({ productId });

    if (cartItem) {
      cartItem.quantity += quantity; // Update quantity
    } else {
      // Add new item with complete product details
      cartItem = new Cart({
        productId,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity,
      });
    }

    await cartItem.save();
    res.status(201).json({ message: 'Item added to cart', cartItem });
  } catch (error) {
    res.status(500).json({ message: 'Error adding item to cart', error: error.message });
  }
});

// ✅ Update item quantity
router.put('/update/:id', async (req, res) => {
  const { quantity } = req.body;

  if (quantity < 1) {
    return res.status(400).json({ message: 'Quantity must be at least 1' });
  }

  try {
    const item = await Cart.findByIdAndUpdate(
      req.params.id,
      { quantity },
      { new: true }
    );

    if (!item) return res.status(404).json({ message: 'Item not found' });

    res.json({ message: 'Item quantity updated', item });
  } catch (error) {
    res.status(500).json({ message: 'Error updating item quantity', error: error.message });
  }
});

// ✅ Remove item from cart
router.delete('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const item = await Cart.findById(req.params.id);

    if (!item) return res.status(404).json({ message: 'Item not found' });

    await Cart.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing item from cart', error: error.message });
  }
});

// Clear entire cart
router.delete('/clear', async (req, res) => {
  try {
    await Cart.deleteMany({}); // Remove all cart items
    res.status(200).json({ message: 'Cart cleared successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear cart', error });
  }
});
// ✅ Checkout route
router.post('/checkout', async (req, res) => {
  try {
    const cartItems = await Cart.find();
    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Example: Process order (you can add your logic)
    await Cart.deleteMany(); // Clear the cart after checkout

    res.status(200).json({ message: 'Checkout successful!' });
  } catch (error) {
    res.status(500).json({ message: 'Checkout failed', error: error.message });
  }
});

export default router;