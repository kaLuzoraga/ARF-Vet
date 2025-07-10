import Product from "../models/products.js";

const checkCartStock = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ message: "Not enough stock available" });
        }

        next();
    } catch (error) {
        console.error("Stock check failed:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export default checkCartStock;
