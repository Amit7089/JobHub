
const express = require("express");
const rateLimit = require("express-rate-limit");
const { register, login } = require("../controllers/authController");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Bahut saari attempts ho gayi hain. Thodi der baad try karein.",
  },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

module.exports = router;
