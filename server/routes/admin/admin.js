import express from "express";
const router = express.Router();

// Inventory Page
router.get("/inventory", (req, res) => {
  res.render("admin/inventory", { page: "inventory" });
});

// Orders Page
router.get("/orders", (req, res) => {
  res.render("admin/orders", { page: "orders" });
});

// Users Page
router.get("/users", (req, res) => {
  res.render("admin/users", { page: "users" });
});

export default router;
