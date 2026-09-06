import exp from "express";
import { JobModel } from "../models/JobModel.js";
import { verifyToken } from "../middlewares/tokenVerificationMiddleware.js";
import { allowedRoles } from "../middlewares/allowedRolesMiddleware.js";

export const jobRouter = exp.Router();


// Get all available jobs
jobRouter.get("/jobs", async (req, res) => {
  try {
    const jobs = await JobModel.find({ status: "OPEN" })
      .populate("employer", "name email");

    res.status(200).json({
      success: true,
      message: "Available jobs",
      data: jobs
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// Get a single job by ID
jobRouter.get("/jobs/:id", async (req, res) => {
  try {
    const job = await JobModel.findById(req.params.id)
      .populate("employer", "name email");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Job details",
      data: job
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// Create a new job
jobRouter.post(
  "/jobs",
  verifyToken,
  allowedRoles("EMPLOYER"),
  async (req, res) => {
    try {
      const jobData = req.body;

      const applicationDeadline = new Date(jobData.applicationDeadline);

      if (
        !jobData.applicationDeadline ||
        Number.isNaN(applicationDeadline.getTime()) ||
        applicationDeadline <= new Date()
      ) {
        return res.status(400).json({
          success: false,
          message: "Application deadline must be a valid future date"
        });
      }

      jobData.employer = req.user.id;

      const job = await JobModel.create(jobData);

      res.status(201).json({
        success: true,
        message: "Job created successfully",
        data: job
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);


// Get employer's own jobs
jobRouter.get(
  "/my-jobs",
  verifyToken,
  allowedRoles("EMPLOYER"),
  async (req, res) => {
    try {
      const jobs = await JobModel.find({
        employer: req.user.id
      });

      res.status(200).json({
        success: true,
        message: "Your jobs",
        data: jobs
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);


// Update employer's own job
jobRouter.put(
  "/jobs/:id",
  verifyToken,
  allowedRoles("EMPLOYER"),
  async (req, res) => {
    try {
      const job = await JobModel.findOne({
        _id: req.params.id,
        employer: req.user.id
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Job not found or you are not the owner"
        });
      }

      const {
        title,
        companyName,
        description,
        location,
        employmentType,
        salaryRange,
        requiredSkills,
        experienceRequirement,
        applicationDeadline,
        status
      } = req.body;

      const deadline = new Date(applicationDeadline);

      if (
        !applicationDeadline ||
        Number.isNaN(deadline.getTime()) ||
        deadline <= new Date()
      ) {
        return res.status(400).json({
          success: false,
          message: "Application deadline must be a valid future date"
        });
      }

      const updatedJob = await JobModel.findByIdAndUpdate(
        req.params.id,
        {
          title,
          companyName,
          description,
          location,
          employmentType,
          salaryRange,
          requiredSkills,
          experienceRequirement,
          applicationDeadline,
          status
        },
        {
          new: true,
          runValidators: true
        }
      );

      res.status(200).json({
        success: true,
        message: "Job updated successfully",
        data: updatedJob
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);


// Delete employer's own job
jobRouter.delete(
  "/jobs/:id",
  verifyToken,
  allowedRoles("EMPLOYER"),
  async (req, res) => {
    try {
      const job = await JobModel.findOneAndDelete({
        _id: req.params.id,
        employer: req.user.id
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Job not found or you are not the owner"
        });
      }

      res.status(200).json({
        success: true,
        message: "Job deleted successfully"
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);