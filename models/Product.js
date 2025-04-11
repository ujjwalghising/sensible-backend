//productmodels
import mongoose from 'mongoose';

// models/productModel.js or product.schema.js
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  images: { type: [String], required: true }, // ✅ renamed and changed to array
  description: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  category: { type: String, required: true },
});


const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
