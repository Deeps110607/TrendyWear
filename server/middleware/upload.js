const multer = require("multer");
const path = require("path");

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 100000);

    cb(
      null,
      uniqueName + path.extname(file.originalname)
    );
  },
});

// File Filter
const fileFilter = (req, file, cb) => {
  const allowed = /jpg|jpeg|png|webp/;

  const isValid = allowed.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error("Only Images Allowed"));
  }
};

module.exports = multer({
  storage,
  fileFilter,
});