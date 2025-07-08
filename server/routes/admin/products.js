import express from "express";
import Product from "../models/products.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

router.post("/add", async (req, res) => {
  const { name, description, price, image } = req.body;

  if (!name || !description || !price) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const product = new Product({
      name,
      description,
      price,
      image,
    });

    await product.save();
    res.status(201).json({ message: "Product added", product });

  } catch (error) {
    console.error("Product upload error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
