
const crypto = require("crypto");
const mongoose = require("mongoose");

const PaymentTransaction = require("../models/PaymentTransaction");
const Membership = require("../models/Membership");
const ProcessedWebhook = require("../models/ProcessedWebhook");

const PLAN_DAYS = {
  monthly: 30,
  yearly: 365,
};

function verifyWebhookSignature(rawBody, signature, secret) {
  if (
    !Buffer.isBuffer(rawBody) ||
    typeof signature !== "string" ||
    !/^[a-f0-9]{64}$/i.test(signature)
  ) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest();

  const received = Buffer.from(signature, "hex");

  return (
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received)
  );
}

async function razorpayWebhook(req, res) {
  const rawBody = req.body;
  const signature = req.get("x-razorpay-signature");
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Razorpay webhook secret is not configured.");
    return res.status(500).send("Webhook configuration error");
  }

  if (
    !verifyWebhookSignature(rawBody, signature, webhookSecret)
  ) {
    return res.status(400).send("Invalid webhook signature");
  }

  let payload;

  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return res.status(400).send("Invalid JSON payload");
  }

  const event = payload.event;

  // Only process events relevant to membership payments.
  const supportedEvents = [
    "payment.captured",
    "order.paid",
    "payment.failed",
  ];

  if (!supportedEvents.includes(event)) {
    return res.status(200).json({
      success: true,
      message: "Event ignored",
    });
  }

  const payment = payload.payload?.payment?.entity;

  if (!payment?.order_id || !payment?.id) {
    return res.status(400).send("Payment details missing");
  }

  const eventId =
    req.get("x-razorpay-event-id") ||
    crypto.createHash("sha256").update(rawBody).digest("hex");

  let eventRecord;

  try {
    eventRecord = await ProcessedWebhook.create({
      eventId,
      event,
      status: "processing",
    });
  } catch (error) {
    if (error.code === 11000) {
      const existing = await ProcessedWebhook.findOne({ eventId });

      if (existing?.status === "processed") {
        return res.status(200).json({
          success: true,
          message: "Webhook already processed",
        });
      }

      // Ask Razorpay to retry if another attempt is still processing.
      return res.status(500).send("Webhook processing is in progress");
    }

    console.error("Webhook event registration failed:", error.message);
    return res.status(500).send("Unable to register webhook event");
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const transaction = await PaymentTransaction.findOne({
        razorpayOrderId: payment.order_id,
      }).session(session);

      if (!transaction) {
        throw new Error("Matching JobHub payment order not found");
      }

      if (
        payment.amount !== transaction.amount ||
        payment.currency !== transaction.currency
      ) {
        throw new Error("Webhook payment amount or currency mismatch");
      }

      // A failed attempt must not downgrade a captured payment.
      if (event === "payment.failed") {
        if (transaction.status !== "captured") {
          transaction.status = "failed";
          await transaction.save({ session });
        }

        return;
      }

      if (
        payment.status !== "captured" ||
        payment.captured !== true
      ) {
        throw new Error("Payment is not captured");
      }

      // Checkout verification may already have activated the plan.
      // Do not extend membership a second time.
      if (transaction.status === "captured") {
        if (transaction.razorpayPaymentId !== payment.id) {
          throw new Error("Order already captured with another payment");
        }

        return;
      }

      const durationDays = PLAN_DAYS[transaction.plan];

      if (!durationDays) {
        throw new Error("Invalid membership plan");
      }

      const now = new Date();

      const existingMembership = await Membership.findOne({
        userId: transaction.userId,
      }).session(session);

      const existingExpiry = existingMembership?.expiresAt;

      const hasActivePremium =
        existingMembership &&
        existingMembership.plan !== "free" &&
        existingMembership.status === "active" &&
        existingExpiry &&
        new Date(existingExpiry) > now;

      const startsAt = hasActivePremium
        ? new Date(existingExpiry)
        : now;

      const expiresAt = new Date(
        startsAt.getTime() +
          durationDays * 24 * 60 * 60 * 1000
      );

      await Membership.findOneAndUpdate(
        { userId: transaction.userId },
        {
          $set: {
            plan: transaction.plan,
            status: "active",
            startsAt,
            expiresAt,
            lastPaymentId: payment.id,
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

      transaction.status = "captured";
      transaction.razorpayPaymentId = payment.id;
      transaction.paidAt = new Date();

      await transaction.save({ session });
    });

    await ProcessedWebhook.updateOne(
      { _id: eventRecord._id },
      { $set: { status: "processed" } }
    );

    return res.status(200).json({
      success: true,
      message: "Webhook processed",
    });
  } catch (error) {
    console.error("Razorpay webhook processing failed:", error.message);

    // Delete the unfinished event so a retry can process it.
    await ProcessedWebhook.deleteOne({ _id: eventRecord._id });

    return res.status(500).send("Webhook processing failed");
  } finally {
    await session.endSession();
  }
}

module.exports = { razorpayWebhook };
