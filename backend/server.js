
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

// Security headers
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header, such as server-to-server
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Razorpay webhook must receive the raw request body.
// Keep this before express.json().
app.post(
  "/api/webhooks/razorpay",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

// Parse JSON request bodies
app.use(express.json({ limit: "10kb" }));

// API rate limiting
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

// Authentication routes
app.use("/api/auth", authRoutes);

// Job routes
app.use("/api/jobs", jobRoutes);

// Membership and payment routes
app.use("/api/membership", membershipRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// Premium routes
app.use("/api/premium", premiumRoutes);

// Handle unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("API error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  if (err.message === "Origin not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed by CORS",
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message:
      err.status === 400
        ? "Invalid request body."
        : "Internal server error.",
  });
});

// Start server after database connection
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`JobHub API running on port ${PORT}`);
      console.log("Health endpoint: /api/health");
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
