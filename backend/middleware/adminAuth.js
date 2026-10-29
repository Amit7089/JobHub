
const jwt = require("jsonwebtoken");

function adminAuth(req, res, next) {
  // Check server configuration
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error("Admin authentication error: JWT_SECRET is missing.");

    return res.status(500).json({
      success: false,
      message: "Server authentication is not configured.",
    });
  }

  // Read Authorization header
  const authHeader = req.headers.authorization || "";
  const [scheme, ...tokenParts] = authHeader.split(" ");
  const token = tokenParts.join(" ").trim();

  if (
    scheme !== "Bearer" ||
    !token
  ) {
    return res.status(401).json({
      success: false,
      message: "Admin login required. Please login again.",
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    if (!decoded || decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    req.admin = {
      email: decoded.email,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Admin session expired. Please login again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid admin session. Please login again.",
    });
  }
}

module.exports = adminAuth;
