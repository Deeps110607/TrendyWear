const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const User = require("../models/User");

// =====================================================
// CREATE ORDER
// POST /api/orders
// =====================================================
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      items,
      paymentMethod,
    } = req.body;

    // =================================================
    // BASIC VALIDATION
    // =================================================

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID.",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one product.",
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required.",
      });
    }

    if (!["UPI", "CARD", "SCANNER"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method.",
      });
    }

    // =================================================
    // VERIFY USER
    // =================================================

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // =================================================
    // VERIFY PRODUCTS + STOCK
    // =================================================

    const verifiedItems = [];

    for (const item of items) {
      if (!item.productId) {
        return res.status(400).json({
          success: false,
          message: "Invalid product in order.",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID.",
        });
      }

      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "One of the products was not found.",
        });
      }

      if (product.isActive === false) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is no longer available.`,
        });
      }

      const quantity = Number(item.quantity || 1);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${product.name}.`,
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message:
            `Only ${product.stock} ${product.name} item(s) are available.`,
        });
      }

      // =================================================
      // PRICE + DISCOUNT
      // =================================================

      const originalPrice = Number(product.price || 0);

      const discount = Number(product.discount || 0);

      const finalPrice =
        discount > 0
          ? originalPrice -
            (originalPrice * discount) / 100
          : originalPrice;

      verifiedItems.push({
        productId: product._id,

        name: product.name,

        category: product.category || "",

        image: product.image || "",

        originalPrice: originalPrice,

        discount: discount,

        price:
          Math.round(finalPrice * 100) / 100,

        quantity: quantity,

        size: item.size || "",

        color: item.color || "",
      });
    }

    // =================================================
    // CALCULATE TOTAL FROM DATABASE
    // =================================================

    const calculatedTotal =
      verifiedItems.reduce(
        (total, item) =>
          total +
          Number(item.price) *
            Number(item.quantity),
        0
      );

    const finalTotal =
      Math.round(calculatedTotal * 100) / 100;

    // =================================================
    // CREATE ORDER
    // =================================================

    const order = new Order({
      userId: user._id,

      items: verifiedItems,

      totalAmount: finalTotal,

      paymentMethod: paymentMethod,

      paymentStatus: "paid",

      orderStatus: "placed",
    });

    await order.save();

    // =================================================
    // REDUCE STOCK
    // =================================================

    const updatedProducts = [];

    for (const item of verifiedItems) {
      const updatedProduct =
        await Product.findOneAndUpdate(
          {
            _id: item.productId,

            stock: {
              $gte: item.quantity,
            },
          },
          {
            $inc: {
              stock: -item.quantity,
            },
          },
          {
            new: true,
          }
        );

      if (!updatedProduct) {
        // ---------------------------------------------
        // ROLLBACK ANY STOCK ALREADY REDUCED
        // ---------------------------------------------

        for (const previous of updatedProducts) {
          await Product.findByIdAndUpdate(
            previous.productId,
            {
              $inc: {
                stock: previous.quantity,
              },
            }
          );
        }

        await Order.findByIdAndDelete(order._id);

        return res.status(409).json({
          success: false,
          message:
            "Stock changed while placing your order. Please try again.",
        });
      }

      updatedProducts.push({
        productId: item.productId,
        quantity: item.quantity,
      });
    }

    // =================================================
    // REMOVE PURCHASED PRODUCTS FROM CART
    // =================================================

    await Cart.deleteMany({
      userId: user._id,

      productId: {
        $in: verifiedItems.map(
          (item) => item.productId
        ),
      },
    });

    // =================================================
    // GET COMPLETE ORDER
    // INCLUDING CUSTOMER + PRODUCT DETAILS
    // =================================================

    const completeOrder =
      await Order.findById(order._id)
        .populate(
          "userId",
          "name email phone"
        )
        .populate(
          "items.productId",
          "name category image price discount stock"
        );

    // =================================================
    // SUCCESS
    // =================================================

    res.status(201).json({
      success: true,

      message: "Order placed successfully!",

      order: completeOrder,
    });

  } catch (err) {
    console.error(
      "Create order error:",
      err
    );

    res.status(500).json({
      success: false,

      message: "Failed to place order.",

      error: err.message,
    });
  }
});

// =====================================================
// GET USER ORDERS
// GET /api/orders/:userId
// =====================================================
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID.",
      });
    }

    const orders = await Order.find({
      userId: userId,
    })
      .populate(
        "userId",
        "name email phone"
      )
      .populate(
        "items.productId",
        "name category image price discount"
      )
      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,

      orders: orders,
    });

  } catch (err) {
    console.error(
      "Get user orders error:",
      err
    );

    res.status(500).json({
      success: false,

      message: "Failed to fetch orders.",

      error: err.message,
    });
  }
});

// =====================================================
// GET ALL ORDERS - ADMIN
// GET /api/orders
// =====================================================
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate(
        "userId",
        "name email phone"
      )
      .populate(
        "items.productId",
        "name category image price discount"
      )
      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,

      orders: orders,
    });

  } catch (err) {
    console.error(
      "Get all orders error:",
      err
    );

    res.status(500).json({
      success: false,

      message: "Failed to fetch orders.",

      error: err.message,
    });
  }
});

// =====================================================
// UPDATE ORDER STATUS
// PUT /api/orders/:id/status
// =====================================================
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "placed",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order =
      await Order.findByIdAndUpdate(
        req.params.id,
        {
          orderStatus: status,
        },
        {
          new: true,
        }
      )
        .populate(
          "userId",
          "name email phone"
        )
        .populate(
          "items.productId",
          "name category image price discount"
        );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    res.json({
      success: true,

      message: "Order status updated.",

      order: order,
    });

  } catch (err) {
    console.error(
      "Update order status error:",
      err
    );

    res.status(500).json({
      success: false,

      message:
        "Failed to update order status.",

      error: err.message,
    });
  }
});

module.exports = router;