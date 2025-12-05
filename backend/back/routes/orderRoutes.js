const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const jwt = require("jsonwebtoken");

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

// POST create order (Staff only)
router.post("/", auth(["staff", "admin", "manager"]), async (req, res) => {
    const { customerName, items, totalAmount } = req.body;
    try {
        const newOrder = new Order({ customerName, items, totalAmount });
        const order = await newOrder.save();
        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// GET all orders (All authenticated users)
router.get("/", auth(), async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// PUT update status (Role based)
router.put("/:id/status", auth(["staff", "manager", "admin"]), async (req, res) => {
    const { status } = req.body;
    const role = req.user.role;

    try {
        let order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ msg: "Order not found" });

        // Role-based validation
        if (role === "staff") {
            if (order.status !== "Approved" || status !== "Packed") {
                return res.status(403).json({ msg: "Staff can only mark Approved orders as Packed" });
            }
        } else if (role === "manager") {
            if (status === "Approved" || status === "Rejected") {
                if (order.status !== "Pending") return res.status(400).json({ msg: "Can only approve/reject Pending orders" });
            } else if (status === "Shipped") {
                if (order.status !== "Packed") return res.status(400).json({ msg: "Can only ship Packed orders" });
            } else {
                return res.status(403).json({ msg: "Invalid status transition for Manager" });
            }
        }
       
        order.status = status;
        await order.save();
        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// DELETE order (Admin only)
router.delete("/:id", auth(["admin"]), async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ msg: "Order removed" });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

module.exports = router;
