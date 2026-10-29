
const express = require("express");
const rateLimit = require("express-rate-limit");

const userAuth = require("../middleware/userAuth");
const {
  createOrder,
  verifyPayment,
  getMyMembership,
} = require("../controllers/membershipController");

const router = express.Router();

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many payment requests. Please try again later.",
  },
});

router.use(userAuth);

router.get("/me", getMyMembership);
router.post("/create-order", paymentLimiter, createOrder);
router.post("/verify", paymentLimiter, verifyPayment);

module.exports = router;
