import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Cart.css";
import { FaTrashAlt } from "react-icons/fa";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  // Fetch cart items from backend
  useEffect(() => {
    axios.get("http://localhost:5000/api/cart")
      .then((res) => setCartItems(res.data))
      .catch((err) => console.error("Error fetching cart items:", err));
  }, []);

  // Calculate total price
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Remove item from cart
  const removeFromCart = (id) => {
    axios.delete(`http://localhost:5000/api/cart/${id}`)
      .then(() => setCartItems((prev) => prev.filter((item) => item._id !== id)))
      .catch((err) => console.error("Error removing item:", err));
  };

  // Add an item to the cart (example)
  const addToCart = (item) => {
    axios.post("http://localhost:5000/api/cart", item)
      .then((res) => setCartItems([...cartItems, res.data]))
      .catch((err) => console.error("Error adding item:", err));
  };

  return (
    <div className="cart-container">
      <h2 className="cart-title">Your Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p className="empty-cart">Your cart is empty.</p>
      ) : (
        <div className="cart-items">
          {cartItems.map((item) => (
            <div className="cart-item" key={item._id}>
              <img src={item.image} alt={item.name} className="cart-item-img" />
              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p>Price: ₹{item.price.toFixed(2)}</p>
                <p>Quantity: {item.quantity}</p>
              </div>
              <button className="remove-btn" onClick={() => removeFromCart(item._id)}>
                <FaTrashAlt />
              </button>
            </div>
          ))}
          <div className="cart-total">
            <h3>Total: ₹{totalPrice.toFixed(2)}</h3>
            <button className="checkout-btn">Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
