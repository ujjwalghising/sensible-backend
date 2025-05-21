import Cart  from '../models/Cart.js';
import Product from '../models/Product.js';

export const addToCart = async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        category: product.category,
        quantity,
      });
    }

    await cart.save();
    res.status(201).json({ message: 'Item added to cart', cart });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update cart', error: err.message });
  }
};

export const getCart = async (req, res) => {
  const userId = req.user.id;
  try {
    const cart = await Cart.findOne({ user: userId });
    res.status(200).json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get cart', error: err.message });
  }
};

export const removeFromCart = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();

    res.status(200).json({ message: 'Item removed', cart });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove item', error: err.message });
  }
};