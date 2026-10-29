const mongoose = require("mongoose");

const walkinPosterSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "walkin",
      unique: true,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WalkinPoster", walkinPosterSchema);