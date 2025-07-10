import express from "express";
import Cart from "../../models/cart.js";
import Product from "../../models/products.js";
import User from "../../models/users.js"; //
import Order from "../../models/orders.js";

const router = express.Router();

// ADD TO CART 
router.post("/cart/add", async (req, res) => {
  const userId = req.session?.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { productId, quantity } = req.body;
  const qty = parseInt(quantity);

  try {
    let cart = await Cart.findOne({ user_id: userId, isCheckedOut: false });

    if (!cart) {
      cart = await Cart.create({
        user_id: userId,
        items: [{ productId, quantity: qty }]
      });
    } else {
      const existingItem = cart.items.find(item => item.productId.toString() === productId);
      if (existingItem) {
        existingItem.quantity += qty;
      } else {
        cart.items.push({ productId, quantity: qty });
      }
      await cart.save();
    }

    res.status(200).json({ message: "Item added to cart." });
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ message: "Failed to add to cart." });
  }
});

// VIEW CART
router.get("/cart", async (req, res) => {
  const userId = req.session?.user?.id;
  const cart = await Cart.findOne({ user_id: userId, isCheckedOut: false }).populate("items.productId");

  const cartItems = cart?.items.map(item => ({
    _id: item.productId._id,
    name: item.productId.name,
    image: item.productId.image,
    price: item.productId.price,
    quantity: item.quantity
  })) || [];

  res.render("users/cart", { cartItems });
});

// REMOVE FROM CART
router.post("/cart/remove", async (req, res) => {
  const userId = req.session?.user?.id;
  const { productId } = req.body;

  await Cart.updateOne(
    { user_id: userId, isCheckedOut: false },
    { $pull: { items: { productId } } }
  );

  res.redirect("/cart");
});

// GET CHECKOUT PAGE
router.get("/checkout", async (req, res) => {
  if (!req.session.user) {
    console.log("User not logged in.");
    return res.redirect("/auth/login");
  }

  const userId = req.session.user.id;

  try {
    const user = await User.findById(userId); // ✅ Fetch full user info
    const cart = await Cart.findOne({ user_id: userId, isCheckedOut: false }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      console.log("Empty cart or no cart found");
      return res.redirect("/cart");
    }

    const validItems = cart.items.filter(item => item.productId);
    const cartItems = validItems.map(item => ({
      _id: item.productId._id,
      name: item.productId.name,
      image: item.productId.image,
      price: item.productId.price,
      quantity: item.quantity
    }));

    res.render("users/orderinfo", {
      user, 
      cartItems
    });

  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).send("Unable to load checkout page");
  }
});

// HANDLE CHECKOUT POST
router.post("/checkout", async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: "Unauthorized" });

  const userId = req.session.user.id;
  const { fullName, email, phone, address, paymentMethod } = req.body;

  try {
    const cart = await Cart.findOne({ user_id: userId, isCheckedOut: false }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    const orderItems = cart.items.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity,
      totalPrice: item.productId.price * item.quantity
    }));

    const totalPrice = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);

    await Order.create({
      user_id: userId,
      fullName,
      email,
      phone,
      items: orderItems,
      total_price: totalPrice,
      status: "Pending",
      payment_method: paymentMethod,
      delivery_address: address,
      cart_id: cart._id
    });

const cartItems = cart.items.map(item => ({
  name: item.productId.name,
  price: item.productId.price,
  quantity: item.quantity
}));


cart.items = [];
cart.isCheckedOut = true;
await cart.save();
    res.json({ message: "Order placed", cartItems });
  } catch (err) {
    console.error("Checkout error stack:", err.stack);
    res.status(500).json({ message: "Checkout failed", error: err.message });
  }
});

// Cancel order
router.post("/orders/:id/cancel", async (req, res) => {
  const orderId = req.params.id;
  const userId = req.session.user.id;

  try {
    await Order.updateOne({ _id: orderId, user_id: userId }, { status: "Cancelled" });
    res.redirect("/profile");
  } catch (err) {
    console.error("Cancel error:", err);
    res.status(500).send("Error cancelling order");
  }
});

// Reorder
router.post("/orders/:id/reorder", async (req, res) => {
  const oldOrder = await Order.findById(req.params.id).populate("items.productId");
  const userId = req.session.user.id;

  if (!oldOrder) return res.status(404).send("Order not found");

  const newItems = oldOrder.items.map(item => ({
    productId: item.productId._id,
    quantity: item.quantity,
    totalPrice: item.totalPrice
  }));

  const total = newItems.reduce((sum, item) => sum + item.totalPrice, 0);

  await Order.create({
    user_id: userId,
    fullName: oldOrder.fullName,
    email: oldOrder.email,
    phone: oldOrder.phone,
    items: newItems,
    total_price: total,
    status: "Pending",
    payment_method: oldOrder.payment_method,
    delivery_address: oldOrder.delivery_address
  });

  res.redirect("/profile");
});

export default router;
