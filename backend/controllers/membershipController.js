
const crypto = require("crypto");
const Razorpay = require("razorpay");
const mongoose = require("mongoose");

const Membership = require("../models/Membership");
const PaymentTransaction = require("../models/PaymentTransaction");

const PLANS = {
  monthly: {
    amount: 100, // ₹99 in paise
    durationDays: 30,
  },
  yearly: {
    amount: 9900, // ₹999 in paise
    durationDays: 365,
  },
};

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured.");
  }

  return {
    keyId,
    client: new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    }),
  };
}

// Create an order using the server-side plan price.
async function createOrder(req, res) {
  try {
    const { plan } = req.body || {};
    const selectedPlan = PLANS[plan];

    if (!selectedPlan) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid membership plan.",
      });
    }

    const { keyId, client } = getRazorpay();

    const order = await client.orders.create({
      amount: selectedPlan.amount,
      currency: "INR",
      receipt: `jh_${new mongoose.Types.ObjectId().toString()}`,
      notes: {
        userId: req.user.id,
        plan,
      },
    });

    await PaymentTransaction.create({
      userId: req.user.id,
      plan,
      amount: selectedPlan.amount,
      currency: "INR",
      razorpayOrderId: order.id,
      status: "created",
    });

    return res.status(201).json({
      success: true,
      keyId,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      plan,
    });
  } catch (error) {
    console.error("Create membership order failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create payment order.",
    });
  }
}

// Verify checkout signature and confirm payment with Razorpay.
async function verifyPayment(req, res) {
  const session = await mongoose.startSession();

  try {
    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = req.body || {};

    if (
      typeof orderId !== "string" ||
      typeof paymentId !== "string" ||
      typeof signature !== "string" ||
      !/^[a-f0-9]{64}$/i.test(signature)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment verification details.",
      });
    }

    // Never trust an order submitted by a different user.
    const transaction = await PaymentTransaction.findOne({
      razorpayOrderId: orderId,
      userId: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Payment order not found.",
      });
    }

    // A successful retry must not extend the membership again.
    if (transaction.status === "captured") {
      if (transaction.razorpayPaymentId === paymentId) {
        const membership = await Membership.findOne({
          userId: req.user.id,
        });

        return res.json({
          success: true,
          message: "Payment already verified.",
          membership: getMembershipResponse(membership),
        });
      }

      return res.status(409).json({
        success: false,
        message: "This order has already been processed.",
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "Payment verification is not configured.",
      });
    }

    // Use the order ID stored in our database.
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${transaction.razorpayOrderId}|${paymentId}`)
      .digest();

    const receivedSignature = Buffer.from(signature, "hex");

    if (
      expectedSignature.length !== receivedSignature.length ||
      !crypto.timingSafeEqual(expectedSignature, receivedSignature)
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed.",
      });
    }

    const { client } = getRazorpay();

    // Independently confirm the payment with Razorpay.
    const payment = await client.payments.fetch(paymentId);

    if (
      payment.order_id !== transaction.razorpayOrderId ||
      payment.amount !== transaction.amount ||
      payment.currency !== transaction.currency
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details do not match the order.",
      });
    }

    // Do not grant premium for merely authorized or failed payments.
    if (payment.status !== "captured") {
      return res.status(409).json({
        success: false,
        message:
          "Payment is not captured yet. Please check again shortly.",
        paymentStatus: payment.status,
      });
    }

    const planDetails = PLANS[transaction.plan];

    if (!planDetails) {
      return res.status(400).json({
        success: false,
        message: "Invalid membership plan on this order.",
      });
    }

    let membership;

    // Keep payment and membership changes together.
    await session.withTransaction(async () => {
      const currentTransaction = await PaymentTransaction.findOne({
        _id: transaction._id,
        userId: req.user.id,
      }).session(session);

      if (!currentTransaction) {
        throw new Error("Payment transaction not found.");
      }

      if (currentTransaction.status === "captured") {
        if (currentTransaction.razorpayPaymentId !== paymentId) {
          throw new Error("Order already processed with another payment.");
        }

        membership = await Membership.findOne({
          userId: req.user.id,
        }).session(session);

        return;
      }

      const now = new Date();

      const existingMembership = await Membership.findOne({
        userId: req.user.id,
      }).session(session);

      const existingExpiry = existingMembership?.expiresAt;
      const hasActivePremium =
        existingMembership &&
        existingMembership.plan !== "free" &&
        existingExpiry &&
        new Date(existingExpiry) > now;

      // Extend from current expiry when Premium is still active.
      const startsAt = hasActivePremium
        ? new Date(existingExpiry)
        : now;

      const expiresAt = new Date(
        startsAt.getTime() +
          planDetails.durationDays * 24 * 60 * 60 * 1000
      );

      membership = await Membership.findOneAndUpdate(
        { userId: req.user.id },
        {
          $set: {
            userId: req.user.id,
            plan: currentTransaction.plan,
            status: "active",
            startsAt,
            expiresAt,
            lastPaymentId: paymentId,
          },
        },
        {
          new: true,
          upsert: true,
          session,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      currentTransaction.status = "captured";
      currentTransaction.razorpayPaymentId = paymentId;
      currentTransaction.paidAt = now;

      await currentTransaction.save({ session });
    });

    return res.json({
      success: true,
      message: "Payment verified. Premium membership activated.",
      membership: getMembershipResponse(membership),
    });
  } catch (error) {
    console.error("Verify membership payment failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment. Please contact support if charged.",
    });
  } finally {
    await session.endSession();
  }
}

function getMembershipResponse(membership) {
  if (!membership) {
    return {
      plan: "free",
      status: "active",
      expiresAt: null,
      isPremium: false,
    };
  }

  const isPremium =
    membership.plan !== "free" &&
    membership.expiresAt &&
    new Date(membership.expiresAt) > new Date();

  return {
    plan: isPremium ? membership.plan : "free",
    status: isPremium ? "active" : "expired",
    expiresAt: membership.expiresAt,
    isPremium: Boolean(isPremium),
  };
}

// Read current membership and return the effective expiry status.

async function getMyMembership(req, res) {
  try {
    const membership = await Membership.findOne({
      userId: req.user.id,
    });

    if (
      membership &&
      membership.plan !== "free" &&
      membership.expiresAt &&
      new Date(membership.expiresAt) <= new Date() &&
      membership.status !== "expired"
    ) {
      membership.status = "expired";
      await membership.save();
    }

    return res.json({
      success: true,
      membership: getMembershipResponse(membership),
    });
  } catch (error) {
    console.error("Get membership failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load membership.",
    });
  }
}

module.exports = {
  createOrder,
  verifyPayment,
  getMyMembership,
};
