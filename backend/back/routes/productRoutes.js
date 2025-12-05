const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const jwt = require("jsonwebtoken");

// Middleware to verify token and role
const auth = (roles = []) => {
    return (req, res, next) => {
        const token = req.header("Authorization");
        if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded.user;

            if (roles.length > 0 && !roles.includes(req.user.role)) {
                return res.status(403).json({ msg: "Access denied" });
            }
            next();
        } catch (err) {
            res.status(401).json({ msg: "Token is not valid" });
        }
    };
};

// GET all products (Accessible by all authenticated users)
router.get("/", auth(), async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// POST add product (Admin, Manager)
router.post("/", auth(["admin", "manager"]), async (req, res) => {
    const { name, price, stock, minStock, description } = req.body;
    try {
        const newProduct = new Product({ name, price, stock, minStock, description });
        const product = await newProduct.save();
        res.json(product);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// PUT update product (Admin, Manager)
router.put("/:id", auth(["admin", "manager"]), async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ msg: "Product not found" });

        const { name, price, stock, minStock, description } = req.body;

        product.name = name || product.name;
        product.price = price || product.price;
        product.stock = stock !== undefined ? stock : product.stock;
        product.minStock = minStock !== undefined ? minStock : product.minStock;
        product.description = description || product.description;

        await product.save();
        res.json(product);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// PUT update stock only (Staff)
router.put("/:id/stock", auth(["admin", "manager", "staff"]), async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ msg: "Product not found" });

        const { stock } = req.body;
        if (stock === undefined) return res.status(400).json({ msg: "Stock value required" });

        product.stock = stock;
        await product.save();
        res.json(product);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// DELETE product (Admin only)
router.delete("/:id", auth(["admin"]), async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ msg: "Product not found" });

        await Product.findByIdAndDelete(req.params.id);
        res.json({ msg: "Product removed" });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

module.exports = router;
