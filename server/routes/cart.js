const express = require("express");
const router = express.Router();

const Cart = require("../models/Cart");
const Product = require("../models/Product");

// =====================================================
// GET USER CART
// GET /api/cart/:userId
// =====================================================
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.find({ userId })
      .populate("productId")
      .sort({ createdAt: -1 });

    // Find cart entries whose products were deleted
    const invalidItems = cart.filter(
      (item) => !item.productId
    );

    if (invalidItems.length > 0) {
      await Cart.deleteMany({
        _id: {
          $in: invalidItems.map((item) => item._id),
        },
      });
    }

    const validCart = cart.filter(
      (item) => item.productId
    );

    res.json({
      success: true,
      cart: validCart,
    });
  } catch (err) {
    console.error("Get cart error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch cart.",
      error: err.message,
    });
  }
});

// =====================================================
// ADD PRODUCT TO CART
// POST /api/cart
// =====================================================
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      productId,
      quantity,
      size,
      color,
    } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required.",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    if (product.isActive === false) {
      return res.status(400).json({
        success: false,
        message: "This product is no longer available.",
      });
    }

    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: "This product is out of stock.",
      });
    }

    const requestedQuantity =
      Number(quantity) > 0 ? Number(quantity) : 1;

    // Check whether product already exists
    const existing = await Cart.findOne({
      userId,
      productId,
    });

    if (existing) {
      const newQuantity =
        existing.quantity + requestedQuantity;

      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} item(s) available in stock.`,
        });
      }

      existing.quantity = newQuantity;

      if (size !== undefined) {
        existing.size = size;
      }

      if (color !== undefined) {
        existing.color = color;
      }

      await existing.save();

      const updatedCart = await Cart.findById(
        existing._id
      ).populate("productId");

      return res.json({
        success: true,
        message: "Cart quantity updated.",
        cartItem: updatedCart,
      });
    }

    const cartItem = new Cart({
      userId,
      productId,
      quantity: requestedQuantity,
      size: size || "",
      color: color || "",
    });

    await cartItem.save();

    const populatedItem = await Cart.findById(
      cartItem._id
    ).populate("productId");

    res.status(201).json({
      success: true,
      message: "Product added to cart.",
      cartItem: populatedItem,
    });
  } catch (err) {
    console.error("Add cart error:", err);

    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Product is already in your cart.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to add product to cart.",
      error: err.message,
    });
  }
});

// =====================================================
// UPDATE CART QUANTITY
// PUT /api/cart/:userId/:productId
// =====================================================
router.put("/:userId/:productId", async (req, res) => {
  try {
    const {
      userId,
      productId,
      quantity,
      size,
      color,
    } = req.body;

    const newQuantity = Number(quantity);

    if (!newQuantity || newQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1.",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    if (newQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} item(s) available.`,
      });
    }

    const cartItem = await Cart.findOne({
      userId,
      productId,
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product is not in cart.",
      });
    }

    cartItem.quantity = newQuantity;

    if (size !== undefined) {
      cartItem.size = size;
    }

    if (color !== undefined) {
      cartItem.color = color;
    }

    await cartItem.save();

    const updatedCart = await Cart.findById(
      cartItem._id
    ).populate("productId");

    res.json({
      success: true,
      message: "Cart updated successfully.",
      cartItem: updatedCart,
    });
  } catch (err) {
    console.error("Update cart error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to update cart.",
      error: err.message,
    });
  }
});

// =====================================================
// REMOVE PRODUCT FROM CART
// DELETE /api/cart/:userId/:productId
// =====================================================
router.delete("/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const deleted = await Cart.findOneAndDelete({
      userId,
      productId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Product is not in your cart.",
      });
    }

    res.json({
      success: true,
      message: "Product removed from cart.",
    });
  } catch (err) {
    console.error("Remove cart error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to remove product from cart.",
      error: err.message,
    });
  }
});

// =====================================================
// REMOVE PRODUCT FROM ALL CARTS
// Used when ADMIN deletes a product
// DELETE /api/cart/product/:productId
// =====================================================
router.delete("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await Cart.deleteMany({
      productId,
    });

    res.json({
      success: true,
      message: "Product removed from all carts.",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error(
      "Delete product cart references error:",
      err
    );

    res.status(500).json({
      success: false,
      message: "Failed to clean product from carts.",
      error: err.message,
    });
  }
});

module.exports = router;