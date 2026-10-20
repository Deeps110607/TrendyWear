const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// Same product cannot be added twice by the same user
wishlistSchema.index(
  { userId: 1, productId: 1 },
  { unique: true }
);

module.exports =
  mongoose.models.Wishlist ||
  mongoose.model("Wishlist", wishlistSchema);