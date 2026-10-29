
const Job = require("../models/job.js");

function isValidId(id) {
  return /^[a-f\d]{24}$/i.test(id);
}

// Public: published PUBLIC jobs list.
// Premium and Walk-in jobs are not exposed through this endpoint.
exports.getJobs = async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      experience = "",
      page = "1",
      limit = "12",
    } = req.query;

    const currentPage = Number(page);
    const pageSize = Number(limit);

    // Validate pagination.
    if (
      !Number.isInteger(currentPage) ||
      currentPage < 1 ||
      !Number.isInteger(pageSize) ||
      pageSize < 1 ||
      pageSize > 50
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    // Only public, published jobs can appear on All Jobs.
    const filter = {
      jobType: "public",
      status: "published",
    };

    // Exclude expired jobs. Jobs without an expiry date remain available.
    filter.$and = [
      {
        $or: [
          { expiresAt: null },
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } },
        ],
      },
    ];

    // Search by job title, company, or category.
    if (search.trim()) {
      const escaped = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$and.push({
        $or: [
          { title: { $regex: escaped, $options: "i" } },
          { company: { $regex: escaped, $options: "i" } },
          { category: { $regex: escaped, $options: "i" } },
        ],
      });
    }

    // Filter by category.
    if (category.trim()) {
      filter.category = category.trim();
    }

    // Filter by experience.
    if (experience.trim()) {
      filter.experience = experience.trim();
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize)
        .lean(),

      Job.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      jobs,
      pagination: {
        page: currentPage,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("getJobs error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch jobs",
    });
  }
};

// Public: fetch one published PUBLIC job.
// Premium and Walk-in jobs cannot be accessed through this endpoint.
exports.getJobById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await Job.findOne({
      _id: req.params.id,
      jobType: "public",
      status: "published",
      $and: [
        {
          $or: [
            { expiresAt: null },
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: new Date() } },
          ],
        },
      ],
    }).lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or no longer available",
      });
    }

    return res.json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("getJobById error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch job",
    });
  }
};
