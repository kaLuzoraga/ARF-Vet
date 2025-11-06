import express from "express";
import User from "../../models/users.js";
import Order from "../../models/orders.js";
import Product from "../../models/products.js";
import Cart from "../../models/cart.js";
import bcrypt from "bcrypt";
import isAdmin from "../../middlewares/isAdmin.js";

const router = express.Router();
router.use(isAdmin);

// Inventory Page
router.get("/inventory", (req, res) => {
  res.render("admin/inventory", { page: "inventory" });
});

// Orders Page
router.get("/orders", async (req, res) => {
  try {
    const allOrders = await Order.find()
      .populate("user_id")
      .populate("items.productId");

    const formatOrder = (order) => ({
      _id: order._id,
      customerName: order.user_id?.name,
      email: order.user_id?.email,
      phone: order.user_id?.phone,
      address: order.user_id?.address,
      items: order.items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        total: i.quantity * (i.productId?.price || 0)
      })),
      total: order.total_price,
      status: order.status,
      createdAt: order.order_date
    });

    const currentOrders = allOrders.filter(o => o.status === "Pending").map(formatOrder);
    const statusOrders = allOrders.filter(o => ["Processing", "Out for Delivery"].includes(o.status)).map(formatOrder);
    const historyOrders = allOrders.filter(o => ["Completed", "Cancelled"].includes(o.status)).map(formatOrder);

    res.render("admin/orders", {
      page: "orders",
      currentOrders,
      statusOrders,
      historyOrders
    });
  } catch (err) {
    console.error("Failed to load orders:", err);
    res.render("admin/orders", { page: "orders", currentOrders: [], statusOrders: [], historyOrders: [] });
  }
});

router.post("/orders/:id/accept", async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, {
      status: "Processing"
    });
    res.redirect("/admin/orders");
  } catch (err) {
    console.error("Error accepting order:", err);
    res.status(500).send("Failed to accept order.");
  }
});

router.post("/orders/:id/cancel", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).send("Order not found");
    }

    // Only restore stock if order is being cancelled from a non-cancelled status
    if (order.status !== "Cancelled") {
      // Restore stock for cancelled orders
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.quantity } }
        );
      }
    }

    if (order.cart_id) {
      // Reset the associated cart (make it usable again)
      await Cart.findByIdAndUpdate(order.cart_id, {
        isCheckedOut: false
      });
    }

    // Mark order as cancelled
    await Order.findByIdAndUpdate(req.params.id, {
      status: "Cancelled"
    });

    res.redirect("/admin/orders");
  } catch (err) {
    console.error("Error cancelling order:", err);
    res.status(500).send("Failed to cancel order.");
  }
});

router.post("/orders/:id/update", async (req, res) => {
  try {
    const { status } = req.body;
    await Order.findByIdAndUpdate(req.params.id, { status });
    res.redirect("/admin/orders");
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).send("Failed to update order status.");
  }
});

router.post("/orders/:id/delete", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.redirect("/admin/orders");
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).send("Failed to delete order.");
  }
});

router.post("/orders/:id/delete-status", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.redirect("/admin/orders");
  } catch (err) {
    console.error("Error deleting order from status view:", err);
    res.status(500).send("Failed to delete order.");
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