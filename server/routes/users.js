const express = require("express");
const router = express.Router();

const User = require("../models/User");

// ==========================================
// GET ALL REGISTERED CUSTOMERS
// ==========================================
router.get("/", async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      message: "Failed to load customers",
      error: error.message,
    });
  }
});

// ==========================================
// GET SINGLE CUSTOMER
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);

    res.status(500).json({
      message: "Failed to load customer",
      error: error.message,
    });
  }
});

module.exports = router;