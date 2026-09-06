import exp from "express";
import { UserModel } from "../models/UserModel.js";
import { JobModel } from "../models/JobModel.js";
import { verifyToken } from "../middlewares/tokenVerificationMiddleware.js";
import { allowedRoles } from "../middlewares/allowedRolesMiddleware.js";

export const adminRouter = exp.Router();


// Get all users
adminRouter.get(
  "/users",
  verifyToken,
  allowedRoles("ADMIN"),
  async (req, res) => {
    try {
      const users = await UserModel.find().select("-password");

      res.status(200).json({
        success: true,
        message: "All users",
        data: users
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);


// Get user by ID
adminRouter.get(
  "/users/:id",
  verifyToken,
  allowedRoles("ADMIN"),
  async (req, res) => {
    try {
      const user = await UserModel.findById(req.params.id)
        .select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "User found",
        data: user
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);


// Update user status
adminRouter.patch(
  "/users/:id/status",
  verifyToken,
  allowedRoles("ADMIN"),
  async (req, res) => {
    try {
      const { active } = req.body;

      const user = await UserModel.findByIdAndUpdate(
        req.params.id,
        { active: active },
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "User status updated",
        data: user
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);


// Delete user
adminRouter.delete(
  "/users/:id",
  verifyToken,
  allowedRoles("ADMIN"),
  async (req, res) => {
    try {
      const user = await UserModel.findByIdAndDelete(
        req.params.id
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "User deleted successfully"
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);


// Get all jobs
adminRouter.get(
  "/jobs",
  verifyToken,
  allowedRoles("ADMIN"),
  async (req, res) => {
    try {
      const jobs = await JobModel.find()
        .populate("employer", "-password");

      res.status(200).json({
        success: true,
        message: "All jobs",
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


// Get job by ID
adminRouter.get(
  "/jobs/:id",
  verifyToken,
  allowedRoles("ADMIN"),
  async (req, res) => {
    try {
      const job = await JobModel.findById(req.params.id)
        .populate("employer", "-password");

      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Job not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "Job found",
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


// Delete job
adminRouter.delete(
  "/jobs/:id",
  verifyToken,
  allowedRoles("ADMIN"),
  async (req, res) => {
    try {
      const job = await JobModel.findByIdAndDelete(
        req.params.id
      );

      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Job not found"
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
