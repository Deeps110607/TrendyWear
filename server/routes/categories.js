const express = require("express");
const router = express.Router();

const Category = require("../models/Category");

// =========================
// GET ALL CATEGORIES
// =========================
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      categories,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// =========================
// ADD CATEGORY
// =========================
router.post("/", async (req, res) => {
  try {
    const category = new Category(req.body);

    await category.save();

    res.json({
      success: true,
      message: "Category Added Successfully",
      category,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// =========================
// UPDATE CATEGORY
// =========================
router.put("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      category,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// =========================
// DELETE CATEGORY
// =========================
router.delete("/:id", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Category Deleted",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

module.exports = router;