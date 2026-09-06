import exp from "express";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/UserModel.js";
import { verifyToken } from "../middlewares/tokenVerificationMiddleware.js";

export const userRouter = exp.Router();


// Register User
userRouter.post("/users", async (req, res) => {
  try {
    const userData = req.body;

    if (!["JOB_SEEKER", "EMPLOYER"].includes(userData.role)) {
      return res.status(400).json({
        success: false,
        message: "You can register only as a job seeker or employer"
      });
    }

    if (typeof userData.password !== "string" || userData.password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long"
      });
    }

    const existingUser = await UserModel.findOne({
      email: userData.email
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    const hashedPassword = await hash(userData.password, 12);

    userData.password = hashedPassword;

    const user = await UserModel.create(userData);

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: userResponse
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// Login User
userRouter.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive"
      });
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax"
    });

    res.status(200).json({
      success: true,
      message: "Login successful"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// Get own profile
userRouter.get("/users/profile", verifyToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile details",
      data: user
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// Update own profile
userRouter.put("/users/profile", verifyToken, async (req, res) => {
  try {
    const { name, skills, experience, education } = req.body;

    const user = await UserModel.findByIdAndUpdate(
      req.user.id,
      {
        name,
        skills,
        experience,
        education
      },
      {
        new: true,
        runValidators: true
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// Logout
userRouter.post("/users/logout", verifyToken, async (req, res) => {
  try {
    res.clearCookie("accessToken");

    res.status(200).json({
      success: true,
      message: "Logout successful"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
