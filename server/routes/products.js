const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const Wishlist = require("../models/Wishlist");
const Cart = require("../models/Cart");
const upload = require("../middleware/upload");
const cloudinary = require("cloudinary").v2;

// Cloudinary configuration from Render environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image buffer directly to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "trendywear/products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

// Parse arrays sent as JSON strings or regular arrays
const parseArray = (value) => {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

// =====================================================
// GET ALL ACTIVE PRODUCTS
// GET /api/products
// =====================================================
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
    }).sort({ createdAt: -1 });

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
router.post("/", upload.single("image"), async (req, res) => {
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
        message: "Product name, category and price are required.",
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

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
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

    if (!Number.isFinite(numericStock) || numericStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative.",
      });
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary environment variables are not configured.",
      });
    }

    // Upload image to Cloudinary
    const uploadedImage = await uploadToCloudinary(req.file.buffer);

    const product = new Product({
      name: name.trim(),
      category: category.trim(),
      description: description || "",
      brand: brand || "TrendyWear",
      price: numericPrice,
      discount: numericDiscount,
      stock: numericStock,
      sizes: parseArray(sizes),
      colors: parseArray(colors),
      isFeatured: isFeatured === true || isFeatured === "true",
      isActive: true,
      image: uploadedImage.secure_url,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product Added Successfully",
      product,
    });
  } catch (err) {
    console.error("Add product / Cloudinary upload error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to add product or upload image.",
      error: err.message,
    });
  }
});

// =====================================================
// UPDATE PRODUCT
// PUT /api/products/:id
// =====================================================
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

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
      product.category = req.body.category.trim();
    }

    if (req.body.description !== undefined) {
      product.description = req.body.description;
    }

    if (req.body.brand !== undefined) {
      product.brand = req.body.brand;
    }

    if (req.body.price !== undefined) {
      const value = Number(req.body.price);

      if (!Number.isFinite(value) || value <= 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be greater than 0.",
        });
      }

      product.price = value;
    }

    if (req.body.discount !== undefined) {
      const value = Number(req.body.discount);

      if (!Number.isFinite(value) || value < 0 || value > 100) {
        return res.status(400).json({
          success: false,
          message: "Discount must be between 0 and 100.",
        });
      }

      product.discount = value;
    }

    if (req.body.stock !== undefined) {
      const value = Number(req.body.stock);

      if (!Number.isFinite(value) || value < 0) {
        return res.status(400).json({
          success: false,
          message: "Stock cannot be negative.",
        });
      }

      product.stock = value;
    }

    if (req.body.sizes !== undefined) {
      product.sizes = parseArray(req.body.sizes);
    }

    if (req.body.colors !== undefined) {
      product.colors = parseArray(req.body.colors);
    }

    if (req.body.isFeatured !== undefined) {
      product.isFeatured =
        req.body.isFeatured === true ||
        req.body.isFeatured === "true";
    }

    if (req.body.isActive !== undefined) {
      product.isActive =
        req.body.isActive === true ||
        req.body.isActive === "true";
    }

    // If a replacement image was uploaded, save its Cloudinary URL
    if (req.file) {
      if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
      ) {
        return res.status(500).json({
          success: false,
          message: "Cloudinary environment variables are not configured.",
        });
      }

      const uploadedImage = await uploadToCloudinary(req.file.buffer);
      product.image = uploadedImage.secure_url;
    }

    await product.save();

    res.json({
      success: true,
      message: "Product Updated Successfully",
      product,
    });
  } catch (err) {
    console.error("Update product / Cloudinary upload error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to update product or upload image.",
      error: err.message,
    });
  }
});

// =====================================================
// DELETE PRODUCT AND ITS WISHLIST/CART REFERENCES
// DELETE /api/products/:id
// =====================================================
router.delete("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    await Product.findByIdAndDelete(productId);

    const wishlistResult = await Wishlist.deleteMany({ productId });
    const cartResult = await Cart.deleteMany({ productId });

    res.json({
      success: true,
      message: "Product deleted successfully.",
      deletedProductId: productId,
      wishlistRemoved: wishlistResult.deletedCount,
      cartRemoved: cartResult.deletedCount,
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