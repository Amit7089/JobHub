
const express = require("express");

const userAuth = require("../middleware/userAuth");
const requirePremium = require("../middleware/requirePremium");

const {
  getPremiumResources,
  getPremiumJobs,
  getPremiumWalkinJobs,
} = require("../controllers/premiumController");

const {
  getPublicWalkinPoster,
} = require("../controllers/walkinPosterController");

const router = express.Router();

// Login + active Premium membership required
router.use(userAuth);
router.use(requirePremium);

// Premium resources: Telegram / WhatsApp
router.get("/resources", getPremiumResources);

// Regular Premium Jobs
router.get("/jobs", getPremiumJobs);

// Latest 5 Walk-in Jobs
router.get("/walkin-jobs", getPremiumWalkinJobs);

// Latest admin-uploaded Walk-in poster
router.get("/walkin-poster", getPublicWalkinPoster);

module.exports = router;
