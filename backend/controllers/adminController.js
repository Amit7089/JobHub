
const jwt = require("jsonwebtoken");

function adminLogin(req, res) {
  try {
    const { email, password } = req.body || {};

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;

    // Check required environment variables
    if (!adminEmail || !adminPassword || !jwtSecret) {
      console.error(
        "Admin login failed: Required environment variables are missing."
      );

      return res.status(500).json({
        success: false,
        message: "Admin authentication is not configured on the server.",
      });
    }

    // Validate input
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter your admin email and password.",
      });
    }

    // Verify credentials
    const emailMatches =
      email.trim().toLowerCase() ===
      adminEmail.trim().toLowerCase();

    const passwordMatches = password === adminPassword;

    if (!emailMatches || !passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Email ya password galat hai.",
      });
    }

    // Generate admin JWT
    const token = jwt.sign(
      {
        role: "admin",
        email: adminEmail.trim().toLowerCase(),
      },
      jwtSecret,
      {
        expiresIn: "8h",
        algorithm: "HS256",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      token,
      admin: {
        email: adminEmail.trim().toLowerCase(),
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Admin login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during admin login.",
    });
  }
}

module.exports = { adminLogin };
