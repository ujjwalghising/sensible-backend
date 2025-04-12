import express from "express";
import Product from "../models/Product.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Add a new product
router.post("/add", async (req, res) => {
  try {
    const { name, price, images, description, quantity, category } = req.body;

    const newProduct = new Product({
      name,
      price,
      images,
      description,
      quantity: quantity || 1,
      category,
    });

    await newProduct.save();

    res.status(201).json({ 
      message: "Product added successfully", 
      product: newProduct 
    });
  } catch (err) {
    res.status(500).json({ 
      message: "Error adding product", 
      error: err.message 
    });
  }
});

// ✅ Get all products or filtered by category, rating, stock
router.get("/", async (req, res) => {
  try {
    const { category, rating, inStock } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (rating) {
      filter.rating = { $gte: Number(rating) }; // >= given rating
    }

    if (inStock === "true") {
      filter.stock = { $gt: 0 }; // Only show products with stock > 0
    }

    const products = await Product.find(filter);

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ 
      message: "Error fetching products", 
      error: err.message 
    });
  }
});


// ✅ Get products by category (case-insensitive)
router.get('/category/:categoryName', async (req, res) => {
  try {
    const { categoryName } = req.params;
    const products = await Product.find({ 
      category: { $regex: new RegExp(categoryName, "i") } 
    });

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found in this category" });
    }

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ 
      message: "Failed to fetch category products", 
      error: err.message 
    });
  }
});

// ✅ Search products by name or description
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: new RegExp(query, "i") } },
        { description: { $regex: new RegExp(query, "i") } },
      ],
    });

    if (products.length === 0) {
      return res.status(404).json({ message: "No matching products found" });
    }

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ 
      message: "Error searching products", 
      error: err.message 
    });
  }
});

// ✅ Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ 
      message: "Error fetching product", 
      error: err.message 
    });
  }
});

// ✅ Update product by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ 
      message: "Product updated successfully", 
      product: updatedProduct 
    });
  } catch (err) {
    res.status(500).json({ 
      message: "Error updating product", 
      error: err.message 
    });
  }
});

// ✅ Delete product by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ 
      message: "Error deleting product", 
      error: err.message 
    });
  }
});
// ✅ Route to add a review
router.post("/:id/review", protect, async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) return res.status(404).json({ message: "Product not found" });

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    return res.status(400).json({ message: "You already reviewed this product" });
  }

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.averageRating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.numReviews;

  await product.save();

  res.status(201).json({
    message: "Review added successfully",
    averageRating: product.averageRating,
    numReviews: product.numReviews,
  });
});




export default router;