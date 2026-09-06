import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 30,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },

    password: {
      type: String,
      required: true,
      minLength: 8
    },

    role: {
      type: String,
      required: true,
      enum: ["JOB_SEEKER", "EMPLOYER", "ADMIN"]
    },

    skills: {
      type: [String],
      default: []
    },

    experience: {
      type: Number,
      default: 0,
      min: 0
    },

    education: [
      {
        degree: {
          type: String,
          required: true,
          trim: true
        },
        institution: {
          type: String,
          required: true,
          trim: true
        },
        year: {
          type: Number,
          required: true,
          min: 1900,
          max: new Date().getFullYear() + 10
        }
      }
    ],

    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const UserModel = model("User", userSchema);
