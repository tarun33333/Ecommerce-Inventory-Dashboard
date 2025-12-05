const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user");
const Product = require("./models/product");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected for Seeding");

        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});

        // Seed Users
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("123456", salt);

        const users = [
            { name: "Admin User", email: "admin@example.com", password: hashedPassword, role: "admin" },
            { name: "Manager User", email: "manager@example.com", password: hashedPassword, role: "manager" },
            { name: "Staff User", email: "staff@example.com", password: hashedPassword, role: "staff" }
        ];

        await User.insertMany(users);
        console.log("Users Seeded");

        // Seed Products
        const products = [
            { name: "Laptop", price: 1200, stock: 50, minStock: 10, description: "High performance laptop" },
            { name: "Mouse", price: 25, stock: 5, minStock: 10, description: "Wireless mouse" }, // Low stock
            { name: "Keyboard", price: 45, stock: 100, minStock: 15, description: "Mechanical keyboard" },
            { name: "Monitor", price: 300, stock: 8, minStock: 5, description: "4K Monitor" }
        ];

        await Product.insertMany(products);
        console.log("Products Seeded");

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
