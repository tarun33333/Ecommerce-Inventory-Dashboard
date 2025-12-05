const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            name: { type: String, required: true }, // Store name in case product is deleted
            quantity: { type: Number, required: true },
            price: { type: Number, required: true } // Store price at time of order
        }
    ],
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected", "Packed", "Shipped"],
        default: "Pending"
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
