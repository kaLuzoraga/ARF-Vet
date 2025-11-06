import dotenv from "dotenv";
dotenv.config();

import express from "express";
import session from "express-session";
import connect from "./database/mongodb-connect.js";

import path from "path";
import { fileURLToPath } from "url";

import authRouter from "./routes/users/users.js";
import adminUserRoutes from "./routes/admin/admin.js";
import adminUserApiRoutes from "./routes/admin/api/users.js";
import cartRoutes from "./routes/users/cart.js";

import Cart from "./models/cart.js";
import Product from "./models/products.js";
import User from "./models/users.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000;
const app = express();

connect();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || "secret123",
  resave: false,
  saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/auth", authRouter);

app.use("/admin", adminUserRoutes);
app.use("/admin/api/users", adminUserApiRoutes);
app.use('/', cartRoutes);

app.get("/home", async (req, res) => {
  if (!req.session.user || req.session.user.userType !== "user") {
    return res.redirect("/auth/login");
  }

  try {
    const products = await Product.find();
    res.render("users/home", {
      user: req.session.user,
      products: products || []
    });
  } catch (err) {
    console.error("Error fetching products:", err.message);
    res.render("users/home", {
      user: req.session.user,
      products: []
    });
  }
});

app.get("/products", async (req, res) => {
  if (!req.session.user || req.session.user.userType !== "user") {
    return res.redirect("/auth/login");
  }

  try {
    const searchQuery = req.query.search || '';
    const categoryQuery = req.query.category || '';
    let filter = {};

    // Build filter object
    if (searchQuery) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    if (categoryQuery) {
      filter.category = categoryQuery;
    }

    const products = await Product.find(filter);

    res.render("users/products", {
      user: req.session.user,
      products: products || [],
      searchQuery: searchQuery,
      categoryQuery: categoryQuery
    });
  } catch (err) {
    console.error("Error loading products page:", err.message);
    res.render("users/products", {
      user: req.session.user,
      products: [],
      searchQuery: '',
      categoryQuery: ''
    });
  }
});

app.get("/products/:id", async (req, res) => {
  if (!req.session.user || req.session.user.userType !== "user") {
    return res.redirect("/auth/login");
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found");

    const user = await User.findById(req.session.user.id); // Fetch full user info

    res.render("users/item", {
      product,
      user // Pass to EJS
    });
  } catch (err) {
    console.error("Error loading item page:", err.message);
    res.status(500).send("Server error");
  }
});

app.get("/about", (req, res) => {
  if (!req.session.user || req.session.user.userType !== "user") {
    return res.redirect("/auth/login");
  }

  res.render("users/about", { user: req.session.user });
});

app.get("/cart", async (req, res) => {
  if (!req.session.user) return res.redirect("/auth/login");

  try {
    const cart = await Cart.findOne({ user_id: req.session.user.id, isCheckedOut: false })
      .populate("items.productId");

    const cartItems = cart?.items.map(item => ({
      _id: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      image: item.productId.image,
      quantity: item.quantity
    })) || [];

    res.render("users/cart", {
      user: req.session.user,
      cartItems
    });
  } catch (err) {
    console.error("Error loading cart:", err);
    res.status(500).render("users/cart", {
      user: req.session.user,
      cartItems: []
    });
  }
});

app.post("/cart/add", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = req.session.user.id;
  const { productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user_id: userId, isCheckedOut: false });

    if (!cart) {
      cart = new Cart({ user_id: userId, items: [] });
    }

    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.totalPrice = existingItem.quantity * product.price;
    } else {
      cart.items.push({
        productId,
        quantity,
        totalPrice: product.price * quantity
      });
    }

    await cart.save();
    res.status(200).json({ message: "Item added to cart" });

  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/cart/remove", async (req, res) => {
  if (!req.session.user) return res.redirect("/auth/login");

  const { productId } = req.body;
  try {
    await Cart.updateOne(
      { user_id: req.session.user.id, isCheckedOut: false },
      { $pull: { items: { productId: new mongoose.Types.ObjectId(productId) } } }
    );

    res.redirect("/cart");
  } catch (err) {
    console.error("Remove cart item failed:", err);
    res.status(500).redirect("/cart");
  }
});

app.get("/checkout", async (req, res) => {
  if (!req.session.user) return res.redirect("/auth/login");

  try {
    const cart = await Cart.findOne({ user_id: req.session.user.id, isCheckedOut: false }).populate("items.productId");

    const cartItems = cart?.items.map(item => ({
      _id: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      image: item.productId.image,
      quantity: item.quantity
    })) || [];

    res.render("users/orderinfo", {
      user: req.session.user,
      cartItems
    });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).send("Unable to load checkout page");
  }
});

app.get("/profile", (req, res) => {
  res.redirect("/auth/profile");
});

app.get("/", (req, res) => {
  console.log("Redirecting to /auth/login");
  res.redirect("/auth/login");
});

app.listen(port, () => {
  console.log(`Listening at: http://localhost:${port}/auth/login`);
});