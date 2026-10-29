
const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    plan: {
      type: String,
      enum: ["free", "monthly", "yearly"],
      default: "free",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
      required: true,
    },
    startsAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    lastPaymentId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Membership", membershipSchema);
