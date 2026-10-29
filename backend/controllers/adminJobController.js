
const mongoose = require("mongoose");
const { Readable } = require("stream");
const Job = require("../models/job.js");
const cloudinary = require("../config/cloudinary.js");

const allowedFields = [
  "company",
  "title",
  "category",
  "jobType",
  "experience",
  "location",
  "qualification",
  "summary",
  "officialUrl",
  "status",
  "expiresAt",
];

const allowedJobTypes = ["premium", "public", "walkin"];
const allowedStatuses = ["draft", "published", "expired"];

// Pick only fields that admin is allowed to update.
function pickJobFields(body) {
  const jobData = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      jobData[field] = body[field];
    }
  }

  return jobData;
}

// Upload image from Multer memory storage to Cloudinary.
function uploadPosterToCloudinary(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.buffer) {
      return reject(new Error("Poster image file nahi mili"));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "jobhub/walkin-posters",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result || !result.secure_url) {
          return reject(
            new Error("Cloudinary se poster URL nahi mila")
          );
        }

        resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
}

// Validate incoming job data.
function validateJobInput(data) {
  const requiredFields = [
    "company",
    "title",
    "category",
    "officialUrl",
  ];

  for (const field of requiredFields) {
    if (
      typeof data[field] !== "string" ||
      !data[field].trim()
    ) {
      return `${field} is required`;
    }
  }

  // Validate official HTTPS URL.
  try {
    const url = new URL(data.officialUrl);

    if (
      url.protocol !== "https:" ||
      !url.hostname.includes(".")
    ) {
      return "Please enter a valid official HTTPS URL";
    }
  } catch {
    return "Please enter a valid official URL";
  }

  // Validate job type.
  if (
    data.jobType !== undefined &&
    !allowedJobTypes.includes(data.jobType)
  ) {
    return "Job type must be premium, public or walkin";
  }

  // Validate summary.
  if (
    data.summary !== undefined &&
    (
      typeof data.summary !== "string" ||
      data.summary.length > 500
    )
  ) {
    return "Summary must be a text of up to 500 characters";
  }

  // Validate expiry date.
  if (data.expiresAt) {
    const expiry = new Date(data.expiresAt);

    if (Number.isNaN(expiry.getTime())) {
      return "Please enter a valid expiry date";
    }
  }

  // Validate status.
  if (
    data.status !== undefined &&
    !allowedStatuses.includes(data.status)
  ) {
    return "Invalid job status";
  }

  return null;
}

// List all jobs, including drafts, for the admin dashboard.
async function getAdminJobs(req, res) {
  try {
    const jobs = await Job.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      jobs,
      total: jobs.length,
    });
  } catch (error) {
    console.error("getAdminJobs error:", error);

    return res.status(500).json({
      success: false,
      message: "Admin jobs fetch nahi ho paayi",
    });
  }
}

// Create a new job as a draft.
async function createAdminJob(req, res) {
  let uploadedPublicId = null;

  try {
    const data = pickJobFields(req.body || {});

    // Default job type.
    data.jobType = data.jobType || "premium";

    const validationError = validateJobInput(data);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    // Poster is allowed only for Walk-in jobs.
    if (req.file && data.jobType !== "walkin") {
      return res.status(400).json({
        success: false,
        message: "Poster upload sirf Walk-in jobs ke liye hai",
      });
    }

    // Upload poster to Cloudinary if provided.
    if (req.file) {
      const uploaded = await uploadPosterToCloudinary(req.file);

      data.posterUrl = uploaded.secure_url;
      uploadedPublicId = uploaded.public_id;
    } else {
      data.posterUrl = "";
    }

    // New jobs are always created as drafts.
    data.status = "draft";
    data.publishedAt = null;
    data.sourceVerifiedAt = null;

    const job = await Job.create(data);

    return res.status(201).json({
      success: true,
      message: "Job draft save ho gayi",
      job,
    });
  } catch (error) {
    console.error("createAdminJob error:", error);

    // If database save fails after upload, clean up the new image.
    if (uploadedPublicId) {
      try {
        await cloudinary.uploader.destroy(uploadedPublicId);
      } catch (cleanupError) {
        console.error("Poster cleanup error:", cleanupError);
      }
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Job create nahi ho paayi",
    });
  }
}

// Update an existing job.
async function updateAdminJob(req, res) {
  let uploadedPublicId = null;

  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const existingJob = await Job.findById(id);

    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: "Job nahi mili",
      });
    }

    const data = pickJobFields(req.body || {});

    // Determine final job type after this update.
    const finalJobType =
      data.jobType || existingJob.jobType || "premium";

    if (!allowedJobTypes.includes(finalJobType)) {
      return res.status(400).json({
        success: false,
        message: "Job type must be premium, public or walkin",
      });
    }

    const validationError = validateJobInput({
      company: data.company ?? existingJob.company,
      title: data.title ?? existingJob.title,
      category: data.category ?? existingJob.category,
      officialUrl: data.officialUrl ?? existingJob.officialUrl,
      summary: data.summary ?? existingJob.summary,
      jobType: finalJobType,
      expiresAt: data.expiresAt ?? existingJob.expiresAt,
      status: data.status,
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    // Poster upload is allowed only for Walk-in jobs.
    if (req.file && finalJobType !== "walkin") {
      return res.status(400).json({
        success: false,
        message: "Poster upload sirf Walk-in jobs ke liye hai",
      });
    }

    // Upload a new poster only if a new file was selected.
    // Existing Walk-in poster is preserved if no new file is selected.
    if (req.file) {
      const uploaded = await uploadPosterToCloudinary(req.file);

      data.posterUrl = uploaded.secure_url;
      uploadedPublicId = uploaded.public_id;
    }

    // Clear poster when the job is not a Walk-in job.
    if (finalJobType !== "walkin") {
      data.posterUrl = "";
    }

    const wasPublished = existingJob.status === "published";
    const previousPosterUrl = existingJob.posterUrl;

    Object.assign(existingJob, data);
    existingJob.jobType = finalJobType;

    // Update publication timestamps when publishing for the first time.
    if (data.status === "published" && !wasPublished) {
      existingJob.publishedAt = new Date();
      existingJob.sourceVerifiedAt = new Date();
    } else if (
      data.status === "draft" ||
      data.status === "expired"
    ) {
      existingJob.publishedAt = null;
    }

    await existingJob.save();

    // Delete the previous poster only after the database update succeeds.
    if (
      uploadedPublicId &&
      previousPosterUrl &&
      previousPosterUrl !== existingJob.posterUrl
    ) {
      // Cloudinary public ID is not stored in this model,
      // so the old image is intentionally not deleted here.
    }

    return res.json({
      success: true,
      message: "Job update ho gayi",
      job: existingJob,
    });
  } catch (error) {
    console.error("updateAdminJob error:", error);

    // Remove newly uploaded image if the update failed.
    if (uploadedPublicId) {
      try {
        await cloudinary.uploader.destroy(uploadedPublicId);
      } catch (cleanupError) {
        console.error("Poster cleanup error:", cleanupError);
      }
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Job update nahi ho paayi",
    });
  }
}

// Publish a job after official-source verification.
async function publishAdminJob(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job nahi mili",
      });
    }

    // Ensure this job has a supported type.
    if (!allowedJobTypes.includes(job.jobType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job type. Job ko edit karke dobara save karein.",
      });
    }

    // Do not publish expired jobs.
    if (job.expiresAt && new Date(job.expiresAt) <= new Date()) {
      return res.status(400).json({
        success: false,
        message:
          "Expired job publish nahi kar sakte. Expiry date update karein.",
      });
    }

    // Validate official URL before publishing.
    try {
      const url = new URL(job.officialUrl);

      if (
        url.protocol !== "https:" ||
        !url.hostname.includes(".")
      ) {
        throw new Error("Invalid official URL");
      }
    } catch {
      return res.status(400).json({
        success: false,
        message: "Job ka official HTTPS URL verify karein",
      });
    }

    job.status = "published";
    job.publishedAt = new Date();
    job.sourceVerifiedAt = new Date();

    await job.save();

    let audienceMessage = "Job publish ho gayi";

    if (job.jobType === "public") {
      audienceMessage =
        "Public job publish ho gayi. Isse sabhi users dekh sakenge, agar public listing API mein sahi filter laga hai.";
    } else if (job.jobType === "premium") {
      audienceMessage =
        "Premium job publish ho gayi. Membership access backend par verify hona chahiye.";
    } else if (job.jobType === "walkin") {
      audienceMessage = "Walk-in job publish ho gayi";
    }

    return res.json({
      success: true,
      message: audienceMessage,
      job,
    });
  } catch (error) {
    console.error("publishAdminJob error:", error);

    return res.status(500).json({
      success: false,
      message: "Job publish nahi ho paayi",
    });
  }
}

// Delete a job.
async function deleteAdminJob(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await Job.findByIdAndDelete(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job nahi mili",
      });
    }

    return res.json({
      success: true,
      message: "Job delete ho gayi",
    });
  } catch (error) {
    console.error("deleteAdminJob error:", error);

    return res.status(500).json({
      success: false,
      message: "Job delete nahi ho paayi",
    });
  }
}

module.exports = {
  getAdminJobs,
  createAdminJob,
  updateAdminJob,
  publishAdminJob,
  deleteAdminJob,
};
