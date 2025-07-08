import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: false
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["Pending", "Processing", "Completed", "Cancelled"],
    default: "Pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
