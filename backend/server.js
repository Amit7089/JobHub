
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const jobRoutes = require("./routes/jobRoutes");
const authRoutes = require("./routes/authRoutes");
const membershipRoutes = require("./routes/membershipRoutes");
const adminRoutes = require("./routes/adminRoutes");

const premiumRoutes = require("./routes/premiumRoutes");

const {
  razorpayWebhook,
} = require("./controllers/razorpayWebhookController");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.post(
  "/api/webhooks/razorpay",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

app.use(express.json({ limit: "10kb" }));

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "JobHub API is running",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/membership", membershipRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/premium", premiumRoutes);

// Error handler for invalid JSON and unexpected errors
app.use((err, req, res, next) => {
  console.error("API error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(err.status || 500).json({
    success: false,
    message:
      err.status === 400
        ? "Invalid request body."
        : "Internal server error.",
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`JobHub API running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
