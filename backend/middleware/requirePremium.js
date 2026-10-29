
const Membership = require("../models/Membership");

async function requirePremium(req, res, next) {
  try {
    const membership = await Membership.findOne({
      userId: req.user.id,
    }).lean();

    const active =
      membership &&
      membership.status === "active" &&
      ["monthly", "yearly"].includes(membership.plan) &&
      membership.expiresAt &&
      new Date(membership.expiresAt) > new Date();

    if (!active) {
      return res.status(403).json({
        success: false,
        code: "PREMIUM_REQUIRED",
        message: "This feature requires an active Premium membership.",
      });
    }

    req.membership = membership;
    return next();
  } catch (error) {
    console.error("Premium access check failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify Premium access.",
    });
  }
}

module.exports = requirePremium;
