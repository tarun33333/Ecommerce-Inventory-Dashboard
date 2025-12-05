const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    minStock: { type: Number, default: 10 }, // Alert threshold
    description: String
});

module.exports = mongoose.model("Product", productSchema);
