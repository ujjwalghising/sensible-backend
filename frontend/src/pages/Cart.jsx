import { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Cart.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [deletedItem, setDeletedItem] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  // Fetch cart items
  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/cart');
      setCartItems(response.data);
    } catch (error) {
      toast.error('Failed to load cart items!');
    }
    setLoading(false);
  };

  // Remove item locally and sync with server
  const removeFromCart = (item) => {
    setDeletedItem(item);
    setCartItems((prevItems) => prevItems.filter((i) => i._id !== item._id));
    toast.info('Item removed. Click "Undo" to restore.');

    axios.delete(`/api/cart/${item._id}`).catch(() => {
      toast.error('Failed to remove item!');
      setCartItems((prevItems) => [...prevItems, item]);
    });
  };

  // Undo remove instantly
  const undoRemove = () => {
    if (deletedItem) {
      setCartItems((prevItems) => [...prevItems, deletedItem]);
      toast.success('Item restored to cart!');

      axios.post('/api/cart/add', {
        productId: deletedItem.productId,
        quantity: deletedItem.quantity,
      }).catch(() => toast.error('Failed to restore item!'));

      setDeletedItem(null);
    }
  };

  // Update quantity instantly
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === id ? { ...item, quantity: newQuantity } : item
      )
    );

    axios.put(`/api/cart/update/${id}`, { quantity: newQuantity })
      .then(() => toast.success('Item quantity updated'))
      .catch(() => toast.error('Failed to update quantity!'));
  };

  // Calculate total price with discount
  const getTotalPrice = () => {
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return total - (total * discount) / 100;
  };

const clearCart = () => {
  if (window.confirm('Are you sure you want to clear your entire cart?')) {
    axios.delete('/api/cart/clear')
      .then(() => {
        setCartItems([]); // Clear locally only after successful deletion
        toast.success('Cart cleared successfully!');
      })
      .catch(() => {
        toast.error('Failed to clear cart!');
        fetchCartItems(); // Re-fetch if server fails
      });
  }
};

  // Checkout cart
  const handleCheckout = () => {
    setCheckingOut(true);
    axios.post('/api/cart/checkout')
      .then(() => {
        toast.success('Checkout successful!');
        setCartItems([]);
      })
      .catch((error) => toast.error('Checkout failed!'))
      .finally(() => setCheckingOut(false));
  };

  // Apply discount
  const applyDiscount = () => {
    if (discountCode === 'SAVE20') {
      setDiscount(20);
      toast.success('Discount applied: 20% off!');
    } else {
      toast.error('Invalid discount code');
    }
  };

  return (
    <div className="cart-container">
      <ToastContainer position="top-right" autoClose={1000} hideProgressBar />

      {loading ? (
        <div className="loading">Loading your cart...</div>
      ) : cartItems.length === 0 ? (
        <div className="empty-cart">
          <img
            src="https://img.freepik.com/premium-vector/shopping-bag-sleeping-character-cartoon-mascot-vector_193274-14172.jpg"
            alt="Empty Cart"
            className="empty-cart-image"
          />
          <p>Hey, it feels so light!</p>
          <p>There is nothing in your bag. Let’s add some items.</p>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item._id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-image" />

                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p>Category: {item.category}</p>
                  <p>Price: ₹{item.price}</p>

                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item._id, parseInt(e.target.value))}
                      min="1"
                    />
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                  </div>

                  <p>Total: ₹{item.price * item.quantity}</p>
                  <button className="remove-btn" onClick={() => removeFromCart(item)}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Total Price: ₹{getTotalPrice()}</h2>

            <div className="discount-section">
              <input
                type="text"
                placeholder="Enter discount code"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
              />
              <button className="apply-btn" onClick={applyDiscount}>Apply</button>
            </div>

            {deletedItem && (
              <div className="undo-section">
                <p>Item removed: {deletedItem.name}</p>
                <button className="undo-btn" onClick={undoRemove}>Undo</button>
              </div>
            )}

            <button className="clear-cart-btn" onClick={clearCart}>
              Clear Cart
            </button>

            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={checkingOut}
            >
              {checkingOut ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;