
const jwt = require("jsonwebtoken");

function userAuth(req, res, next) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({
      success: false,
      message: "Authentication is not configured.",
    });
  }

  const authHeader = req.headers.authorization || "";
  const [scheme, ...parts] = authHeader.split(" ");
  const token = parts.join(" ").trim();

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      message: "Please login to continue.",
    });
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (!decoded.id || decoded.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "User access required.",
      });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Session expired. Please login again.",
    });
  }
}

module.exports = userAuth;
