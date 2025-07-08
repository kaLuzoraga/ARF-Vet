import dotenv from "dotenv";
dotenv.config();

import express from "express";
import session from "express-session";
import connect from "./database/mongodb-connect.js";
import authRouter from "./routes/users/users.js";
import path from "path";
import { fileURLToPath } from "url";
import Product from "./models/products.js";

// For __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000;
const app = express();

// Connect to MongoDB
connect();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || "secret123",
  resave: false,
  saveUninitialized: false
}));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// EJS view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Auth Route
app.use("/auth", authRouter);

// Routes for users
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
    const products = await Product.find();
    res.render("users/products", {
      user: req.session.user,
      products: products || []
    });
  } catch (err) {
    console.error("Error loading products page:", err.message);
    res.render("users/products", {
      user: req.session.user,
      products: []
    });
  }
});

app.get("/about", (req, res) => {
  if (!req.session.user || req.session.user.userType !== "user") {
    return res.redirect("/auth/login");
  }

  res.render("users/about", { user: req.session.user });
});

app.get("/profile", async (req, res) => {
  if (!req.session.user || req.session.user.userType !== "user") {
    return res.redirect("/auth/login");
  }

  try {
    const orders = []; 
    res.render("users/profile", {
      user: req.session.user,
      orders
    });
  } catch (err) {
    console.error("Error loading profile:", err.message);
    res.status(500).render("users/profile", {
      user: req.session.user,
      orders: []
    });
  }
});

app.get("/cart", (req, res) => {
  if (!req.session.user || req.session.user.userType !== "user") {
    return res.redirect("/auth/login");
  }

  const cartItems = req.session.cart || [];

  res.render("users/cart", {
    user: req.session.user,
    cartItems
  });
});

// Redirect root to login
app.get("/", (req, res) => {
  console.log("Redirecting to /auth/login");
  res.redirect("/auth/login");
});

// Start server
app.listen(port, () => {
  console.log(`Listening at: http://localhost:${port}/auth/login`);
});
