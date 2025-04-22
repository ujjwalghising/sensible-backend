import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  images: { type: [String], required: true },
  description: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  category: { type: String, required: true },

  // Rename this 👇
  countInStock: { type: Number, required: true },

  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, default: 0 },

  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      rating: { type: Number, required: true },
      comment: { type: String },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  averageRating: { type: Number, default: 0 },
});

// Optional virtual — useful if you want `product.inStock`
productSchema.virtual("inStock").get(function () {
  return this.countInStock > 0;
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
