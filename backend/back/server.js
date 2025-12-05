const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const connectDB = require("./config/db");

const app = express();
app.use(express.json());
app.use(cors());


connectDB();


app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/users", require("./routes/userRoutes"));


app.listen(5000, () => console.log("Server running on 5000"));
