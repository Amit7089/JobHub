
const express = require("express");

const { adminLogin } = require("../controllers/adminController");
const adminAuth = require("../middleware/adminAuth");

const {
  getAdminJobs,
  createAdminJob,
  updateAdminJob,
  publishAdminJob,
  deleteAdminJob,
} = require("../controllers/adminJobController");

const uploadPoster = require("../middleware/uploadPoster");

const {
  getAdminWalkinPoster,
  updateWalkinPoster,
} = require("../controllers/walkinPosterController");

const router = express.Router();

// Handle poster upload errors safely.
function handlePosterUpload(req, res, next) {
  uploadPoster.single("poster")(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Poster image maximum 5 MB ki honi chahiye.",
      });
    }

    return res.status(400).json({
      success: false,
      message:
        error.message || "Poster image upload nahi ho paayi.",
    });
  });
}

// Admin login (public).
router.post("/auth/login", adminLogin);

// All routes below require admin authentication.
router.use(adminAuth);

// -----------------------------------------
// JOB MANAGEMENT
// -----------------------------------------

router.get("/jobs", getAdminJobs);

// Create a job with an optional Walk-in poster.
router.post("/jobs", handlePosterUpload, createAdminJob);

// Update a job and optionally replace its poster.
router.patch("/jobs/:id", handlePosterUpload, updateAdminJob);

// Publish and delete jobs.
router.patch("/jobs/:id/publish", publishAdminJob);
router.delete("/jobs/:id", deleteAdminJob);

// -----------------------------------------
// LEGACY WALK-IN POSTER MANAGER
// Keep temporarily to avoid breaking existing UI.
// Remove after the new per-job poster workflow is verified.
// -----------------------------------------

router.get("/walkin-poster", getAdminWalkinPoster);

router.put(
  "/walkin-poster",
  handlePosterUpload,
  updateWalkinPoster
);

module.exports = router;
