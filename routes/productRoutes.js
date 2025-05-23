import express from "express";
import Product from "../models/Product.js";
import { protect } from "../middleware/authMiddleware.js";
import { stockUpdateEmitter, setupStockUpdateStream } from "../controllers/productSSE.js";

const router = express.Router();

// ✅ Add a new product
router.post("/add", async (req, res) => {
  try {
    const { name, price, images, description, quantity, category, countInStock } = req.body;

    // Create a new product
    const newProduct = new Product({
      name,
      price,
      images,
      description,
      quantity: quantity || 1, // Default to 1 if not provided
      category,
      countInStock: countInStock || quantity || 1, // Use countInStock if provided, fallback to quantity, or default to 1
    });

    // Save the product to the database
    await newProduct.save();

    // Respond with success
    res.status(201).json({
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (err) {
    // Handle errors
    res.status(500).json({
      message: "Error adding product",
      error: err.message,
    });
  }
});


// ✅ Get all products or filtered by category, rating, stock
router.get("/", async (req, res) => {
  try {
    const { category, rating, inStock } = req.query;

    const filter = {};

    if (category) filter.category = category;

    if (rating) filter.rating = { $gte: Number(rating) };

    if (inStock === "true") filter.countInStock = { $gt: 0 };
    if (inStock === "false") filter.countInStock = { $lte: 0 };

    const products = await Product.find(filter);

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching products",
      error: err.message,
    });
  }
});

// ✅ Get products by category (case-insensitive)
router.get("/category/:categoryName", async (req, res) => {
  try {
    const { categoryName } = req.params;
    const products = await Product.find({
      category: { $regex: new RegExp(categoryName, "i") },
    });

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found in this category" });
    }

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch category products",
      error: err.message,
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
      error: err.message,
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

    // Add the inStock virtual field to the response
    const productWithStockStatus = {
      ...product.toObject(),
      inStock: product.inStock, // Add the virtual field in the response
    };

    res.status(200).json(productWithStockStatus);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching product",
      error: err.message,
    });
  }
});

// ✅ Update product by ID
router.put("/:id", async (req, res) => {
  try {
    const { name, price, images, description, category, countInStock, quantity } = req.body;

    // Prepare the updated product data
    const updatedData = {
      name,
      price,
      images,
      description,
      category,
      countInStock: countInStock !== undefined ? countInStock : quantity || 1, // Use countInStock for stock
    };

    // Update the product by ID
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating product",
      error: err.message,
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
      error: err.message,
    });
  }
});

// ✅ Add a review
router.post("/:id/review", protect, async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({
      message: "Error adding review",
      error: err.message,
    });
  }
});

// Stock update SSE endpoint
router.get("/sse/stock-updates", setupStockUpdateStream);

// Update product stock by ID and emit changes via SSE
router.patch("/:id/update-stock", async (req, res) => {
  try {
    const { stock } = req.body; // The new stock value

    if (stock === undefined) {
      return res.status(400).json({ message: "Stock value is required" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update the stock of the product
    product.countInStock = stock;
    await product.save();

    // Emit the updated product data to all connected clients
    stockUpdateEmitter.emit("stockUpdated", product);

    res.status(200).json({
      message: "Product stock updated successfully",
      product: {
        id: product._id,
        stock: product.countInStock,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating product stock",
      error: err.message,
    });
  }
});

export default router;
