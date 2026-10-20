const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    brand: {
      type: String,
      default: "TrendyWear",
    },

    price: {
      type: Number,
      required: true,
    },

    discount: {
      type: Number,
      default: 0,
    },

    stock: {
      type: Number,
      default: 0,
    },

    sizes: {
      type: [String],
      default: [],
    },

    colors: {
      type: [String],
      default: [],
    },

    image: {
      type: String,
      required: true,
    },

    // ===== AI Fields =====

    aiColor: {
      type: String,
      default: "",
    },

    aiShade: {
      type: String,
      default: "",
    },

    aiPattern: {
      type: String,
      default: "",
    },

    aiDressType: {
      type: String,
      default: "",
    },

    aiStyle: {
      type: String,
      default: "",
    },

    aiKeywords: {
      type: [String],
      default: [],
    },

    // =====================

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    rating: {
      type: Number,
      default: 5,
    },

    reviews: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);