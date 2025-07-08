import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, default: 1 },
  totalPrice: { type: Number }, // this should be calculated on add/update
});

const cartSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [cartItemSchema],
  created_at: { type: Date, default: Date.now },
  isCheckedOut: { type: Boolean, default: false }
});

export default mongoose.model("Cart", cartSchema);