
const Job = require("../models/job");

async function getPremiumResources(req, res) {
  try {
    return res.json({
      success: true,
      resources: {
        telegram: process.env.TELEGRAM_INVITE_URL || null,
        whatsapp: process.env.WHATSAPP_INVITE_URL || null,
      },
    });
  } catch (error) {
    console.error("Premium resources error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load Premium resources.",
    });
  }
}

function activeJobFilter() {
  const now = new Date();

  return {
    status: "published",
    $or: [
      { expiresAt: null },
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: now } },
    ],
  };
}

async function getPremiumJobs(req, res) {
  try {
    const jobs = await Job.find({
      $and: [
        activeJobFilter(),
        {
          $or: [
            { jobType: "premium" },
            { jobType: { $exists: false } },
            { jobType: null },
          ],
        },
      ],
    })
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Premium jobs error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load Premium jobs.",
    });
  }
}

async function getPremiumWalkinJobs(req, res) {
  try {
    const jobs = await Job.find({
      $and: [
        activeJobFilter(),
        { jobType: "walkin" },
      ],
    })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(5)
      .lean();

    return res.json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Premium Walk-in jobs error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load Premium Walk-in jobs.",
    });
  }
}

module.exports = {
  getPremiumResources,
  getPremiumJobs,
  getPremiumWalkinJobs,
};
