import express from "express";
import User from "../../models/users.js";
import Order from "../../models/orders.js";
import Product from "../../models/products.js";
import bcrypt from "bcrypt";

const router = express.Router();

// Inventory Page
router.get("/inventory", (req, res) => {
  res.render("admin/inventory", { page: "inventory" });
});

// Orders Page
router.get("/orders", async (req, res) => {
  try {
    const currentOrders = await Order.find().populate("items.product");
    res.render("admin/orders", {
      page: "orders",
      currentOrders: [],
      statusOrders: [],
      historyOrders: []
    });
  } catch (err) {
    console.error("Failed to load orders:", err);
    res.render("admin/orders", { page: "orders", currentOrders: [] });
  }
});

// Users Page
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.render("admin/users", { page: "users", users });
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).send("Server error loading users.");
  }
});

// POST: Add User 
router.post("/users/add", async (req, res) => {
  try {
    const { name, email, password, address, phone, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      address,
      phone,
      role,
      userType: role === "Admin" ? "admin" : "user"
    });

    await newUser.save();
    res.status(201).json({ message: "User added successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to add user." });
  }
});

// PUT: Edit User 
router.put("/users/:id", async (req, res) => {
  try {
    const { name, email, password, address, phone, role } = req.body;

    const update = { name, email, address, phone, role, userType: role === "Admin" ? "admin" : "user" };
    if (password) {
      update.password = await bcrypt.hash(password, 10);
    }

    await User.findByIdAndUpdate(req.params.id, update);
    res.json({ message: "User updated." });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user." });
  }
});

// DELETE: Delete User 
router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user." });
  }
});

// GET: Fetch all products 
router.get("/products/all", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to load products." });
  }
});

// POST: Add new product 
router.post("/products/add", async (req, res) => {
  try {
    const { name, description, price, image, stock } = req.body;

    if (!name || !description || !price) {
      return res.status(400).json({ message: "Name, description, and price are required." });
    }

    const product = new Product({
      name,
      description,
      price,
      image,
      stock: stock || 0 // Default to 0 if not provided
    });

    await product.save();
    res.status(201).json({ message: "Product added successfully.", product });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ error: err.message || "Failed to add product." });
  }
});

// PUT: Update product
router.put("/products/:id", async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    const image = req.file?.filename;

    const update = { name, description, price, stock };
    if (image) update.image = image;

    await Product.findByIdAndUpdate(req.params.id, update);
    res.json({ message: "Product updated." });
  } catch (err) {
    res.status(500).json({ error: "Failed to update product." });
  }
});

// DELETE: Delete product
router.delete("/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product." });
  }
});

export default router;