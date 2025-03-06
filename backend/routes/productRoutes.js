import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// Add a new product
router.post("/add", async (req, res) => {
  try {
    const { name, price, image, description, quantity, category } = req.body;

    const newProduct = new Product({
      name,
      price,
      image,
      description,
      quantity: quantity || 1,
      category, // Add category
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

// Get all products or by category
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;

    let products;

    if (category) {
      products = await Product.find({ category });
    } else {
      products = await Product.find(); // Fetch all products if no category
    }

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

// Get products by category
router.get('/category/:categoryName', async (req, res) => {
  const { categoryName } = req.params;
  try {
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

// Get product by ID
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

// Update product
router.put("/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({ 
      message: "Product updated", 
      product: updatedProduct 
    });
  } catch (err) {
    res.status(500).json({ 
      message: "Error updating product", 
      error: err.message 
    });
  }
});

// Delete product
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ 
      message: "Error deleting product", 
      error: err.message 
    });
  }
});

// Search products by name or description
// Search for products
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    console.log("Search Query:", query); // Debug log

    // Find products by name or description
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
    console.error("Search Error:", err.message);
    res.status(500).json({ 
      message: "Error searching products", 
      error: err.message 
    });
  }
});

// Get all products or by category
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    let products;

    if (category) {
      products = await Product.find({ category });
    } else {
      products = await Product.find();
    }

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
});

// Search products by name or description
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    console.log("Search Query:", query);

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
    console.error("Search Error:", err.message);
    res.status(500).json({ 
      message: "Error searching products", 
      error: err.message 
    });
  }
});

// Get all products or by category
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    let products;

    if (category) {
      products = await Product.find({ category });
    } else {
      products = await Product.find();
    }

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
});

// Get product by ID (this must come last!)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Error fetching product", error: err.message });
  }
});

export default router;
