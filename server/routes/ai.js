
const express = require("express");
const multer = require("multer");
const { GoogleGenAI } = require("@google/genai");
const Product = require("../models/Product");

const router = express.Router();

// =====================================================
// IMAGE UPLOAD
// =====================================================

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowed.includes(file.mimetype)) {
      return cb(
        new Error("Upload a JPG, PNG, or WEBP image.")
      );
    }

    cb(null, true);
  },
});

// =====================================================
// HELPERS
// =====================================================

const clean = (value) =>
  value == null ? "" : String(value).toLowerCase().trim();

const values = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map(String);
  }

  return value ? [String(value)] : [];
};

const colorFamily = (value) => {
  const text = clean(value);

  const families = {
    blue: [
      "blue", "navy", "royal", "sky", "teal",
      "cyan", "aqua", "indigo",
    ],
    red: [
      "red", "maroon", "wine", "burgundy",
      "crimson", "scarlet",
    ],
    pink: ["pink", "rose", "magenta", "fuchsia"],
    green: [
      "green", "olive", "mint", "emerald",
      "lime", "sage",
    ],
    yellow: ["yellow", "mustard", "lemon", "gold"],
    orange: ["orange", "coral", "peach"],
    purple: ["purple", "violet", "lavender", "plum"],
    brown: [
      "brown", "beige", "tan", "camel",
      "coffee", "chocolate",
    ],
    white: ["white", "ivory", "cream"],
    black: ["black", "charcoal"],
    grey: ["grey", "gray", "silver"],
  };

  for (const [family, words] of Object.entries(families)) {
    if (words.some((word) => text.includes(word))) {
      return family;
    }
  }

  return text;
};


const normalizeType = (value) => {
  const text = clean(value);

  if (
    text.includes("saree blouse") ||
    text.includes("sari blouse") ||
    text.includes("blouse")
  ) {
    return "blouse";
  }

  if (text.includes("saree") || text.includes("sari")) {
    return "saree";
  }

  if (text.includes("kurti")) return "kurti";

  if (text.includes("lehenga") || text.includes("lehnga")) {
    return "lehenga";
  }

  if (
    text.includes("nightwear") ||
    text.includes("night wear") ||
    text.includes("nightdress") ||
    text.includes("night dress") ||
    text.includes("pajama")
  ) {
    return "nightwear";
  }

  if (text.includes("top") || text.includes("shirt")) {
    return "top";
  }

  if (
    text.includes("western") ||
    text.includes("gown") ||
    text.includes("dress")
  ) {
    return "western";
  }

  return text || "unknown";
};


// =====================================================
// MATCHING
// =====================================================

const calculateMatch = (product, analysis) => {
  let score = 0;
  const reasons = [];

  const category = clean(product.category);
  const productType = normalizeType(
    product.aiDressType || product.category
  );
  const detectedType = normalizeType(analysis.dressType);

  // Category is the strongest requirement.
  if (
    detectedType &&
    detectedType !== "other" &&
    detectedType !== "unknown" &&
    (
      productType === detectedType ||
      category.includes(detectedType) ||
      detectedType.includes(category)
    )
  ) {
    score += 35;
    reasons.push("Dress type matches");
  }

  const productColors = [
    product.aiColor,
    ...values(product.colors),
  ].filter(Boolean);

  const detectedColor = colorFamily(analysis.color);

  const sameColor = productColors.some(
    (color) => colorFamily(color) === detectedColor
  );

  if (
    detectedColor &&
    detectedColor !== "unknown" &&
    sameColor
  ) {
    score += 30;
    reasons.push("Color matches");
  }

  const shade = clean(analysis.shade);
  const productShade = clean(product.aiShade);

  if (
    shade &&
    shade !== "unknown" &&
    productShade &&
    (
      productShade.includes(shade) ||
      shade.includes(productShade)
    )
  ) {
    score += 15;
    reasons.push("Shade is similar");
  }

  const pattern = clean(analysis.pattern);
  const productPattern = clean(product.aiPattern);

  if (
    pattern &&
    pattern !== "unknown" &&
    productPattern &&
    (
      productPattern.includes(pattern) ||
      pattern.includes(productPattern)
    )
  ) {
    score += 10;
    reasons.push("Pattern is similar");
  }

  const style = clean(analysis.style);
  const productStyle = clean(product.aiStyle);

  if (
    style &&
    style !== "unknown" &&
    productStyle &&
    (
      productStyle.includes(style) ||
      style.includes(productStyle)
    )
  ) {
    score += 5;
    reasons.push("Style is similar");
  }

  const searchableText = [
    product.name,
    product.category,
    product.description,
    ...productColors,
    product.aiShade,
    product.aiPattern,
    product.aiDressType,
    product.aiStyle,
    ...values(product.aiKeywords),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const keywords = Array.isArray(analysis.keywords)
    ? analysis.keywords
    : [];

  const keywordMatches = keywords.filter((keyword) => {
    const word = clean(keyword);
    return word.length > 2 && searchableText.includes(word);
  }).length;

  if (keywordMatches > 0) {
    score += Math.min(keywordMatches * 2, 5);
    reasons.push("Fashion details match");
  }

  return {
    score: Math.min(score, 100),
    reasons,
  };
};

// =====================================================
// AI PHOTO SEARCH
// POST /api/ai/analyze-dress
// =====================================================

router.post(
  "/analyze-dress",
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload a dress photo.",
        });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          success: false,
          message: "GEMINI_API_KEY is missing from server/.env.",
        });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
      });

      const prompt = `
Analyze this image of women's clothing for TrendyWear.

Identify the main garment type, main color, closest color shade,
pattern, style, and 3-8 short visual keywords.

Use these garment types when appropriate:
saree, kurti, western, top, lehenga, nightwear, other.

Be accurate about the visible clothing. Do not recommend or invent
products. If a detail is uncertain, use "unknown".

Return only a JSON object with these fields:
{
  "dressType": "string",
  "color": "string",
  "shade": "string",
  "pattern": "string",
  "style": "string",
  "keywords": ["string"]
}
`;

      console.log("AI PHOTO SEARCH: sending image to Gemini");

 
const interaction = await ai.interactions.create({
  model: "gemini-3.8-flash",
  input: [
    {
      type: "text",
      text: prompt,
    },
    {
      type: "image",
      data: req.file.buffer.toString("base64"),
      mime_type: req.file.mimetype,
    },
  ],
  response_format: {
    type: "text",
    mime_type: "application/json",
    schema: {
      type: "object",
      properties: {
        dressType: { type: "string" },
        color: { type: "string" },
        shade: { type: "string" },
        pattern: { type: "string" },
        style: { type: "string" },
        keywords: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: [
        "dressType",
        "color",
        "shade",
        "pattern",
        "style",
        "keywords",
      ],
    },
  },
});


      const rawText = interaction.output_text;

      if (!rawText) {
        throw new Error("Gemini returned an empty response.");
      }

      let analysis;

      try {
        analysis = JSON.parse(rawText);
      } catch {
        console.error("Invalid Gemini response:", rawText);
        throw new Error("Gemini returned invalid JSON.");
      }

      analysis = {
        dressType: analysis.dressType || "unknown",
        color: analysis.color || "unknown",
        shade: analysis.shade || "unknown",
        pattern: analysis.pattern || "unknown",
        style: analysis.style || "unknown",
        keywords: Array.isArray(analysis.keywords)
          ? analysis.keywords
          : [],
      };

      console.log("AI DRESS ANALYSIS:", analysis);

      // Load real, in-stock products from MongoDB.
      const products = await Product.find({
        stock: { $gt: 0 },
      }).lean();

      console.log("AVAILABLE PRODUCTS:", products.length);

      // Match each product safely.
      const matches = products
        .map((product) => {
          const result = calculateMatch(product, analysis);

          return {
            _id: String(product._id),
            name: product.name || "Product",
            category: product.category || "",
            description: product.description || "",
            price: Number(product.price) || 0,
            image: product.image || "",
            colors: values(product.colors),
            stock: Number(product.stock) || 0,
            matchScore: result.score,
            matchReasons: result.reasons,
          };
        })
        .filter((product) => product.matchScore >= 30)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 8);

      console.log("AI MATCH COUNT:", matches.length);
console.log("AI MATCH COUNT:", matches.length);
console.log("AI MATCH IMAGES:", matches.map(p => ({
  name: p.name,
  image: p.image
})));
      return res.json({
        success: true,
        analysis,
        matches,
        message:
          matches.length > 0
            ? "Matching TrendyWear products found."
            : "No matching product is currently available in TrendyWear.",
      });
    } catch (error) {
      console.error("AI DRESS SEARCH ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "AI dress search failed.",
      });
    }
  }
);

// =====================================================
// UPLOAD / MULTER ERRORS
// =====================================================

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Image is too large. Maximum size is 10 MB."
        : error.message;

    return res.status(400).json({
      success: false,
      message,
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Image upload failed.",
    });
  }

  next();
});

module.exports = router;
