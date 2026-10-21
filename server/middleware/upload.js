const multer = require("multer");
const path = require("path");

// Store uploaded images temporarily in memory
const storage = multer.memoryStorage();

// Allow only image files
const fileFilter = (req, file, cb) => {
  const allowed = /\.(jpg|jpeg|png|webp)$/i;

  if (allowed.test(path.extname(file.originalname))) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG and WEBP images are allowed"));
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});