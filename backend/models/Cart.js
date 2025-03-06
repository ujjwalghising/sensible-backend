import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true }, // Add category
  quantity: { type: Number, default: 1 },
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;