
const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    // premium = regular job, walkin = walk-in drive
    jobType: {
      type: String,
      enum: ["premium", "public", "walkin"],
      default: "premium",
      required: true,
    },

    experience: {
      type: String,
      default: "Not specified",
    },

    location: {
      type: String,
      default: "Not specified",
    },

    qualification: {
      type: String,
      default: "Check official website",
    },

    summary: {
      type: String,
      required: true,
      maxlength: 500,
    },

    officialUrl: {
      type: String,
      required: true,
      validate: {
        validator(value) {
          try {
            const url = new URL(value);

            return (
              url.protocol === "https:" &&
              Boolean(url.hostname.includes("."))
            );
          } catch {
            return false;
          }
        },
        message: "Valid HTTPS official URL required",
      },
    },

    // Walk-in poster image URL
    // Image hosting par upload hone ke baad URL yahan save hoga.
    posterUrl: {
      type: String,
      default: "",
      trim: true,
      validate: {
        validator(value) {
          if (!value) return true;

          try {
            const url = new URL(value);
            return (
              ["https:", "http:"].includes(url.protocol) &&
              Boolean(url.hostname.includes("."))
            );
          } catch {
            return false;
          }
        },
        message: "Valid poster image URL required",
      },
    },

    sourceVerifiedAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["draft", "published", "expired"],
      default: "draft",
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
