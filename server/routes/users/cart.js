import express from "express";
import Cart from "../../models/cart.js";
import Product from "../../models/products.js";
import Order from "../../models/orders.js";

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
  if (!req.session.user) return res.redirect("/auth/login");

  const userId = req.session.user.id;

  const cart = await Cart.findOne({ user_id: userId, isCheckedOut: false }).populate("items.productId");

  if (!cart || cart.items.length === 0) {
    return res.redirect("/cart");
  }

  const cartItems = cart.items.map(item => ({
    _id: item.productId._id,
    name: item.productId.name,
    image: item.productId.image,
    price: item.productId.price,
    quantity: item.quantity
  }));

  res.render("users/orderinfo", { cartItems });
});

router.post("/checkout", async (req, res) => {
  if (!req.session.user) return res.redirect("/auth/login");

  const userId = req.session.user.id;

  const { fullName, email, phone, address, paymentMethod } = req.body;

  try {
    const cart = await Cart.findOne({ user_id: userId, isCheckedOut: false }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.redirect("/cart");
    }

    const orderItems = cart.items.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity,
      totalPrice: item.productId.price * item.quantity
    }));

    const totalPrice = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);

    const newOrder = await Order.create({
      user_id: userId,
      items: orderItems,
      total_price: totalPrice,
      status: "Pending",
      payment_method: paymentMethod,
      delivery_address: address,
      cart_id: cart._id
    });

    cart.isCheckedOut = true;
    await cart.save();

    res.redirect("/orders/thankyou");
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).send("Something went wrong during checkout.");
  }
});

