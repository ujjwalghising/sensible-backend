import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String },
});

const CartItem = mongoose.model("CartItem", cartItemSchema);
export default CartItem;
