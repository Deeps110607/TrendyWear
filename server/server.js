const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const app = express();

// ======================================
// CORS CONFIGURATION - MUST COME FIRST
// ======================================
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// ======================================
// MIDDLEWARE
// ======================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded product images
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ======================================
// API ROUTES
// ======================================
app.use("/api/ai", require("./routes/ai"));
app.use("/api/users", require("./routes/users"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/wishlist", require("./routes/wishlist"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/complaints", require("./routes/complaints"));
app.use("/api/products", require("./routes/products"));
app.use("/api/categories", require("./routes/categories"));

// ======================================
// HOME ROUTE
// ======================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TrendyWear API is running successfully!",
  });
});

// ======================================
// ERROR HANDLER
// ======================================
app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// ======================================
// DATABASE CONNECTION
// ======================================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:");
    console.error(err);
  });

// ======================================
// START SERVER
// ======================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ TrendyWear Server Running on Port ${PORT}`);
  console.log("✅ CORS configured for http://localhost:3000");
});
