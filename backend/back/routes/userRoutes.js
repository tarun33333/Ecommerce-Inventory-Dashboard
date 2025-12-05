const express = require("express");
const router = express.Router();
const User = require("../models/user");
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

// GET all users (Admin only)
router.get("/", auth(["admin"]), async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// DELETE user (Admin only)
router.delete("/:id", auth(["admin"]), async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: "User removed" });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

module.exports = router;
