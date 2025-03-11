import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// ✅ Add a new product
router.post("/add", async (req, res) => {
  try {
    const { name, price, image, description, quantity, category } = req.body;

    const newProduct = new Product({
      name,
      price,
      image,
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

// ✅ Get all products or by category
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;

    let products = category 
      ? await Product.find({ category }) 
      : await Product.find();

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

export default router;