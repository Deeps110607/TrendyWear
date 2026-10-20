const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    size: {
      type: String,
      default: "",
    },

    color: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Same user cannot have duplicate cart records
// for the same product.
cartSchema.index(
  { userId: 1, productId: 1 },
  { unique: true }
);

module.exports =
  mongoose.models.Cart ||
  mongoose.model("Cart", cartSchema);