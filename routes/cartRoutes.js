import express from "express";
import CartItem from "../models/CartItem.js";

const router = express.Router();

// Get all cart items
router.get("/", async (req, res) => {
  const items = await CartItem.find();
  res.json(items);
});

// Add item to cart
router.post("/", async (req, res) => {
  const { name, price, quantity, image } = req.body;
  const item = new CartItem({ name, price, quantity, image });
  await item.save();
  res.status(201).json(item);
});

// Remove item from cart
router.delete("/:id", async (req, res) => {
  await CartItem.findByIdAndDelete(req.params.id);
  res.json({ message: "Item removed from cart" });
});

export default router;
