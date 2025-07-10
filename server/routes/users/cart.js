import express from "express";
import Cart from "../../models/cart.js";
import Product from "../../models/products.js";
import Order from "../../models/orders.js";

const router = express.Router();

// ADD TO CART with stock check
router.post("/cart/add", async (req, res) => {
  const userId = req.session?.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { productId, quantity } = req.body;
  const qty = parseInt(quantity);

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found." });

    if (qty < 1) return res.status(400).json({ message: "Invalid quantity." });

    if (qty > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} in stock.` });
    }

    let cart = await Cart.findOne({ user_id: userId });

    if (!cart) {
      // Create new cart
      cart = await Cart.create({
        user_id: userId,
        items: [{ productId, quantity: qty }],
        isCheckedOut: false
      });
    } else {
      const existingItem = cart.items.find(item => item.productId.toString() === productId);

      if (existingItem) {
        const newQty = existingItem.quantity + qty;

        if (newQty > product.stock) {
          return res.status(400).json({ message: `Cannot add ${qty}. Only ${product.stock - existingItem.quantity} more left.` });
        }

        existingItem.quantity = newQty;
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

router.get("/cart", async (req, res) => {
  const userId = req.session?.user?.id;
  const cart = await Cart.findOne({ user_id: userId }).populate("items.productId");

  const cartItems = cart?.items.map(item => ({
    _id: item.productId._id,
    name: item.productId.name,
    image: item.productId.image,
    price: item.productId.price,
    quantity: item.quantity
  })) || [];

  res.render("users/cart", {
    cartItems
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
  if (!req.session.user) {
    console.log("User not logged in.");
    return res.redirect("/auth/login");
  }

  const userId = req.session.user.id;

  try {
    const cart = await Cart.findOne({ user_id: userId, isCheckedOut: false }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      console.log("Empty cart or no cart found");
      return res.redirect("/cart");
    }

    const validItems = cart.items.filter(item => item.productId);

    if (validItems.length === 0) {
      console.log("Cart has items but all products were deleted.");
      return res.redirect("/cart");
    }

    const cartItems = validItems.map(item => ({
      _id: item.productId._id,
      name: item.productId.name,
      image: item.productId.image,
      price: item.productId.price,
      quantity: item.quantity
    }));

    res.render("users/orderinfo", {
      user: req.session.user,
      cartItems
    });

  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).send("Unable to load checkout page");
  }
});

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

export default router;