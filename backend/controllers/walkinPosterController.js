const { Readable } = require("stream");
const cloudinary = require("../config/cloudinary");
const WalkinPoster = require("../models/WalkinPoster");

function uploadBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "jobhub/walkin-posters",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from(buffer).pipe(stream);
  });
}

// Admin: current poster load karein
async function getAdminWalkinPoster(req, res) {
  try {
    const poster = await WalkinPoster.findOne({ key: "walkin" }).lean();

    return res.json({
      success: true,
      poster: poster
        ? {
            imageUrl: poster.imageUrl,
            updatedAt: poster.updatedAt,
          }
        : null,
    });
  } catch (error) {
    console.error("Get admin walk-in poster failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Poster load nahi ho paaya.",
    });
  }
}

// Admin: naya poster upload ya replace karein
async function updateWalkinPoster(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Pehle poster image select karein.",
      });
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary configuration missing hai.",
      });
    }

    const previousPoster = await WalkinPoster.findOne({
      key: "walkin",
    });

    // Upload new image first, so old poster remains available on failure.
    const uploaded = await uploadBuffer(req.file.buffer);

    const poster = await WalkinPoster.findOneAndUpdate(
      { key: "walkin" },
      {
        $set: {
          imageUrl: uploaded.secure_url,
          publicId: uploaded.public_id,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    // Delete old image only after the new URL is saved successfully.
    if (
      previousPoster?.publicId &&
      previousPoster.publicId !== uploaded.public_id
    ) {
      try {
        await cloudinary.uploader.destroy(previousPoster.publicId);
      } catch (cleanupError) {
        console.error(
          "Old poster cleanup failed:",
          cleanupError.message
        );
      }
    }

    return res.json({
      success: true,
      message: "Walk-in poster successfully update ho gaya.",
      poster: {
        imageUrl: poster.imageUrl,
        updatedAt: poster.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update walk-in poster failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Poster update nahi ho paaya. Configuration aur server logs check karein.",
    });
  }
}

// Premium user: latest poster fetch karein
async function getPublicWalkinPoster(req, res) {
  try {
    const poster = await WalkinPoster.findOne({
      key: "walkin",
    }).lean();

    return res.json({
      success: true,
      poster: poster
        ? {
            imageUrl: poster.imageUrl,
            updatedAt: poster.updatedAt,
          }
        : null,
    });
  } catch (error) {
    console.error("Get public walk-in poster failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Walk-in poster load nahi ho paaya.",
    });
  }
}

module.exports = {
  getAdminWalkinPoster,
  updateWalkinPoster,
  getPublicWalkinPoster,
};