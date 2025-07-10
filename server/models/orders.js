import { Schema, model } from "mongoose";

const orderItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    equired: true
  }
});

const orderSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [orderItemSchema],
  total_price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["Pending", "Preparing", "Out for Delivery", "Completed", "Cancelled"],
    default: "Pending"
  },
  payment_method: {
    type: String,
    enum: ["Cash on Delivery", "GCash", "Bank Transfer"],
    default: "Cash"
  },
  delivery_address: {
    type: String,
    required: true
  },
  cart_id: {
    type: Schema.Types.ObjectId,
    ref: "Cart"
  },
  order_date: {
    type: Date,
    default: Date.now
  }
});

export default model("Order", orderSchema);
