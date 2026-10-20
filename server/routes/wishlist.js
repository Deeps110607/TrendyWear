const express = require("express");
const router = express.Router();

const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const wishlist = await Wishlist.find({ userId })
      .populate("productId")
      .sort({ createdAt: -1 });

    // Remove products that no longer exist
    const validWishlist = wishlist.filter(
      (item) => item.productId
    );

    // Automatically clean broken wishlist records
    const invalidIds = wishlist
      .filter((item) => !item.productId)
      .map((item) => item._id);

    if (invalidIds.length > 0) {
      await Wishlist.deleteMany({
        _id: { $in: invalidIds },
      });
    }

    res.json({
      success: true,
      wishlist: validWishlist,
    });
  } catch (err) {
    console.error("Get wishlist error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist.",
      error: err.message,
    });
  }
});

// =====================================================
// ADD PRODUCT TO WISHLIST
// POST /api/wishlist
// =====================================================
router.post("/", async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required.",
      });
    }

    // Check product exists
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Do not allow inactive products
    if (product.isActive === false) {
      return res.status(400).json({
        success: false,
        message: "This product is no longer available.",
      });
    }

    // Check duplicate
    const existing = await Wishlist.findOne({
      userId,
      productId,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Product is already in your wishlist.",
        wishlistItem: existing,
      });
    }

    const wishlistItem = new Wishlist({
      userId,
      productId,
    });

    await wishlistItem.save();

    const populatedItem = await Wishlist.findById(
      wishlistItem._id
    ).populate("productId");

    res.status(201).json({
      success: true,
      message: "Product added to wishlist.",
      wishlistItem: populatedItem,
    });
  } catch (err) {
    console.error("Add wishlist error:", err);

    // Duplicate index protection
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Product is already in your wishlist.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to add product to wishlist.",
      error: err.message,
    });
  }
});

// =====================================================
// REMOVE PRODUCT FROM WISHLIST
// DELETE /api/wishlist/:userId/:productId
// =====================================================
router.delete("/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const deleted = await Wishlist.findOneAndDelete({
      userId,
      productId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Product is not in your wishlist.",
      });
    }

    res.json({
      success: true,
      message: "Product removed from wishlist.",
    });
  } catch (err) {
    console.error("Remove wishlist error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to remove product from wishlist.",
      error: err.message,
    });
  }
});

// =====================================================
// CHECK IF PRODUCT IS IN WISHLIST
// GET /api/wishlist/:userId/check/:productId
// =====================================================
router.get("/:userId/check/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const exists = await Wishlist.exists({
      userId,
      productId,
    });

    res.json({
      success: true,
      inWishlist: !!exists,
    });
  } catch (err) {
    console.error("Wishlist check error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to check wishlist.",
      error: err.message,
    });
  }
});

// =====================================================
// DELETE ALL WISHLIST ENTRIES FOR A PRODUCT
// Used when ADMIN deletes a product
// DELETE /api/wishlist/product/:productId
// =====================================================
router.delete("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await Wishlist.deleteMany({
      productId,
    });

    res.json({
      success: true,
      message: "Product removed from all wishlists.",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("Delete product wishlist references error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to clean product from wishlists.",
      error: err.message,
    });
  }
});

module.exports = router;