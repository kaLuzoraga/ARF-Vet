import express from "express";
import Cart from "../../models/cart.js";

const router = express.Router();

router.get("/cart", async (req, res) => {
  const userId = req.session?.user?.id;
  const cart = await Cart.findOne({ user_id: userId }).populate("items.productId");
  res.render("users/cart", {
    cartItems: cart?.items || []
  });
});

router.post("/cart/remove", async (req, res) => {
  const userId = req.session?.user?.id;
  const { productId } = req.body;

  await Cart.updateOne(
    { user_id: userId },
    { $pull: { items: { productId } } }
  );

  res.redirect("/cart");
});

router.get("/checkout", async (req, res) => {
  // Mark cart as checked out
  const userId = req.session?.user?.id;

  await Cart.findOneAndUpdate(
    { user_id: userId },
    { isCheckedOut: true }
  );

  res.render("users/checkout-success"); // Create this view
});
