const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const Wishlist = require("../models/Wishlist");
const Cart = require("../models/Cart");
const upload = require("../middleware/upload");

// =====================================================
// GET ALL ACTIVE PRODUCTS
// GET /api/products
// =====================================================
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    res.json(products);
  } catch (err) {
    console.error("Get products error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products.",
      error: err.message,
    });
  }
});

// =====================================================
// GET SINGLE PRODUCT
// GET /api/products/:id
// =====================================================
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.json(product);
  } catch (err) {
    console.error("Get single product error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product.",
      error: err.message,
    });
  }
});

// =====================================================
// ADD PRODUCT
// POST /api/products
// =====================================================
router.post(
  "/",
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        name,
        category,
        description,
        brand,
        price,
        discount,
        stock,
        sizes,
        colors,
        isFeatured,
      } = req.body;

      if (!name || !category || price === undefined) {
        return res.status(400).json({
          success: false,
          message:
            "Product name, category and price are required.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Product image is required.",
        });
      }

      const numericPrice = Number(price);
      const numericDiscount = Number(discount || 0);
      const numericStock = Number(stock || 0);

      if (
        !Number.isFinite(numericPrice) ||
        numericPrice <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Price must be greater than 0.",
        });
      }

      if (
        !Number.isFinite(numericDiscount) ||
        numericDiscount < 0 ||
        numericDiscount > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Discount must be between 0 and 100.",
        });
      }

      if (
        !Number.isFinite(numericStock) ||
        numericStock < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Stock cannot be negative.",
        });
      }

      let parsedSizes = [];
      let parsedColors = [];

      try {
        parsedSizes =
          typeof sizes === "string"
            ? JSON.parse(sizes || "[]")
            : Array.isArray(sizes)
            ? sizes
            : [];
      } catch {
        parsedSizes = [];
      }

      try {
        parsedColors =
          typeof colors === "string"
            ? JSON.parse(colors || "[]")
            : Array.isArray(colors)
            ? colors
            : [];
      } catch {
        parsedColors = [];
      }

      const product = new Product({
        name: name.trim(),
        category: category.trim(),
        description: description || "",
        brand: brand || "TrendyWear",
        price: numericPrice,
        discount: numericDiscount,
        stock: numericStock,
        sizes: parsedSizes,
        colors: parsedColors,
        isFeatured:
          isFeatured === true ||
          isFeatured === "true",
        isActive: true,
        image: `/uploads/products/${req.file.filename}`,
      });

      await product.save();

      res.status(201).json({
        success: true,
        message: "Product Added Successfully",
        product,
      });
    } catch (err) {
      console.error("Add product error:", err);

      res.status(500).json({
        success: false,
        message: "Failed to add product.",
        error: err.message,
      });
    }
  }
);

// =====================================================
// UPDATE PRODUCT
// PUT /api/products/:id
// =====================================================
router.put(
  "/:id",
  upload.single("image"),
  async (req, res) => {
    try {
      const product = await Product.findById(
        req.params.id
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }

      if (req.body.name !== undefined) {
        product.name = req.body.name.trim();
      }

      if (req.body.category !== undefined) {
        product.category =
          req.body.category.trim();
      }

      if (req.body.description !== undefined) {
        product.description =
          req.body.description;
      }

      if (req.body.brand !== undefined) {
        product.brand = req.body.brand;
      }

      if (req.body.price !== undefined) {
        const price = Number(req.body.price);

        if (!Number.isFinite(price) || price <= 0) {
          return res.status(400).json({
            success: false,
            message: "Price must be greater than 0.",
          });
        }

        product.price = price;
      }

      if (req.body.discount !== undefined) {
        const discount = Number(
          req.body.discount
        );

        if (
          !Number.isFinite(discount) ||
          discount < 0 ||
          discount > 100
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Discount must be between 0 and 100.",
          });
        }

        product.discount = discount;
      }

      if (req.body.stock !== undefined) {
        const stock = Number(req.body.stock);

        if (
          !Number.isFinite(stock) ||
          stock < 0
        ) {
          return res.status(400).json({
            success: false,
            message: "Stock cannot be negative.",
          });
        }

        product.stock = stock;
      }

      // SIZES
      if (req.body.sizes !== undefined) {
        if (Array.isArray(req.body.sizes)) {
          product.sizes = req.body.sizes;
        } else {
          try {
            product.sizes = JSON.parse(
              req.body.sizes || "[]"
            );
          } catch {
            product.sizes = [];
          }
        }
      }

      // COLORS
      if (req.body.colors !== undefined) {
        if (Array.isArray(req.body.colors)) {
          product.colors = req.body.colors;
        } else {
          try {
            product.colors = JSON.parse(
              req.body.colors || "[]"
            );
          } catch {
            product.colors = [];
          }
        }
      }

      // FEATURED
      if (req.body.isFeatured !== undefined) {
        product.isFeatured =
          req.body.isFeatured === true ||
          req.body.isFeatured === "true";
      }

      // ACTIVE
      if (req.body.isActive !== undefined) {
        product.isActive =
          req.body.isActive === true ||
          req.body.isActive === "true";
      }

      // NEW IMAGE
      if (req.file) {
        product.image =
          `/uploads/products/${req.file.filename}`;
      }

      await product.save();

      res.json({
        success: true,
        message: "Product Updated Successfully",
        product,
      });
    } catch (err) {
      console.error("Update product error:", err);

      res.status(500).json({
        success: false,
        message: "Failed to update product.",
        error: err.message,
      });
    }
  }
);

// =====================================================
// DELETE PRODUCT
// DELETE /api/products/:id
//
// Deletes:
// 1. Product
// 2. All wishlist references
// 3. All cart references
// =====================================================
router.delete("/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    const product =
      await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Delete product
    await Product.findByIdAndDelete(productId);

    // Delete from all wishlists
    const wishlistResult =
      await Wishlist.deleteMany({
        productId,
      });

    // Delete from all carts
    const cartResult =
      await Cart.deleteMany({
        productId,
      });

    res.json({
      success: true,
      message: "Product deleted successfully.",
      deletedProductId: productId,
      wishlistRemoved:
        wishlistResult.deletedCount,
      cartRemoved:
        cartResult.deletedCount,
    });
  } catch (err) {
    console.error("Delete product error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to delete product.",
      error: err.message,
    });
  }
});

module.exports = router;