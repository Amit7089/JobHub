
const mongoose = require("mongoose");

const paymentTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    plan: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      required: true,
    },

    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Payment hone se pehle payment ID available nahi hoti.
    // Isliye default null ke bajay field ko unset rakhenge.
    razorpayPaymentId: {
      type: String,
      default: undefined,
      trim: true,
    },

    status: {
      type: String,
      enum: ["created", "captured", "failed"],
      default: "created",
      required: true,
      index: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Sirf actual string payment IDs unique honi chahiye.
// Missing/null payment IDs is index mein include nahi hongi.
paymentTransactionSchema.index(
  { razorpayPaymentId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      razorpayPaymentId: { $type: "string" },
    },
  }
);

module.exports = mongoose.model(
  "PaymentTransaction",
  paymentTransactionSchema
);
