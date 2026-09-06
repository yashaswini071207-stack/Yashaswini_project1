import exp from "express";
import { isValidObjectId } from "mongoose";
import { ApplicationModel } from "../models/ApplicationModel.js";
import { JobModel } from "../models/JobModel.js";
import { verifyToken } from "../middlewares/tokenVerificationMiddleware.js";
import { allowedRoles } from "../middlewares/allowedRolesMiddleware.js";

export const applicationRouter = exp.Router();


// Apply for a job
applicationRouter.post(
  "/applications",
  verifyToken,
  allowedRoles("JOB_SEEKER"),
  async (req, res) => {
    try {
      const { jobId } = req.body;

      if (!isValidObjectId(jobId)) {
        return res.status(400).json({
          success: false,
          message: "A valid jobId is required"
        });
      }

      const job = await JobModel.findById(jobId);

      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Job not found"
        });
      }

      if (job.status !== "OPEN") {
        return res.status(400).json({
          success: false,
          message: "This job is not open for applications"
        });
      }

      if (job.applicationDeadline <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "The application deadline has passed"
        });
      }

      const existingApplication = await ApplicationModel.findOne({
        job: jobId,
        jobSeeker: req.user.id
      });

      if (existingApplication) {
        return res.status(409).json({
          success: false,
          message: "You have already applied for this job"
        });
      }

      const application = await ApplicationModel.create({
        job: jobId,
        jobSeeker: req.user.id
      });

      res.status(201).json({
        success: true,
        message: "Application submitted successfully",
        data: application
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);


// View my applications
applicationRouter.get(
  "/applications/my-applications",
  verifyToken,
  allowedRoles("JOB_SEEKER"),
  async (req, res) => {
    try {
      const applications = await ApplicationModel.find({
        jobSeeker: req.user.id
      })
        .populate("job")
        .populate("jobSeeker", "name email");

      res.status(200).json({
        success: true,
        message: "Your applications",
        data: applications
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);


// View a particular application
applicationRouter.get(
  "/applications/:id",
  verifyToken,
  async (req, res) => {
    try {
      const application = await ApplicationModel.findById(
        req.params.id
      )
        .populate("job")
        .populate("jobSeeker", "name email");

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found"
        });
      }

      // Job Seeker can view only their own application
      if (
        req.user.role === "JOB_SEEKER" &&
        application.jobSeeker._id.toString() !== req.user.id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to view this application"
        });
      }

      // Employer can view only applications for their own job
      if (
        req.user.role === "EMPLOYER" &&
        application.job.employer.toString() !== req.user.id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to view this application"
        });
      }

      res.status(200).json({
        success: true,
        message: "Application details",
        data: application
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);


// Employer views applications for their job
applicationRouter.get(
  "/jobs/:jobId/applications",
  verifyToken,
  allowedRoles("EMPLOYER"),
  async (req, res) => {
    try {
      const job = await JobModel.findOne({
        _id: req.params.jobId,
        employer: req.user.id
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Job not found or you are not the owner"
        });
      }

      const applications = await ApplicationModel.find({
        job: req.params.jobId
      })
        .populate("jobSeeker", "name email skills experience")
        .populate("job", "title companyName");

      res.status(200).json({
        success: true,
        message: "Applications received",
        data: applications
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);


// Employer updates application status
applicationRouter.patch(
  "/applications/:id/status",
  verifyToken,
  allowedRoles("EMPLOYER"),
  async (req, res) => {
    try {
      const { status } = req.body;

      if (!["PENDING", "SHORTLISTED", "REJECTED", "ACCEPTED"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid application status"
        });
      }

      const application = await ApplicationModel.findById(
        req.params.id
      ).populate("job");

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found"
        });
      }

      // Check whether the employer owns the job
      if (
        application.job.employer.toString() !==
        req.user.id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this application"
        });
      }

      application.status = status;

      await application.save();

      res.status(200).json({
        success: true,
        message: "Application status updated",
        data: application
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);
