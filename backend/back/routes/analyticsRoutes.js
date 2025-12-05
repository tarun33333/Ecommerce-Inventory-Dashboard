const express = require("express");
const router = express.Router();
const Order = require("../models/order");



const jwt = require("jsonwebtoken");

const checkAuth = (roles = []) => {
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

// GET Admin Analytics
router.get("/admin", checkAuth(["admin"]), async (req, res) => {
    try {
        // 1. Orders per Day (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const ordersPerDay = await Order.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 2. Top Selling Products
        const topProducts = await Order.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.name",
                    totalSold: { $sum: "$items.quantity" }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        res.json({ ordersPerDay, topProducts });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// GET Manager Analytics
router.get("/manager", checkAuth(["manager", "admin"]), async (req, res) => {
    try {
        // 1. Status Distribution
        const statusDistribution = await Order.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // 2. Staff Activity (Orders created per day - proxy for staff activity)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const staffActivity = await Order.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({ statusDistribution, staffActivity });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
