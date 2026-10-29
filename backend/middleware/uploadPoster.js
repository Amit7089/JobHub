const multer = require("multer");

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const uploadPoster = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB maximum
    files: 1,
  },
  fileFilter(req, file, callback) {
    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new Error("Sirf JPG, PNG ya WEBP image upload kar sakte hain.")
      );
    }

    callback(null, true);
  },
});

module.exports = uploadPoster;