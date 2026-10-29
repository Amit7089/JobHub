
const mongoose = require("mongoose");

const processedWebhookSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
    },
    event: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["processing", "processed"],
      default: "processing",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "ProcessedWebhook",
  processedWebhookSchema
);
