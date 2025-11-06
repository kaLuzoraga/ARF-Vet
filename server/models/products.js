import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Vitamins & Supplements', 'Medications', 'Nutrition', 'Wellness', 'Other'],
    default: 'Other'
  },
  image: {
    type: String,
    required: false
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});

const Product = mongoose.model("Product", productSchema);
export default Product;
