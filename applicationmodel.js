import { Schema, model } from "mongoose";

const applicationSchema = new Schema(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },

    jobSeeker: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["PENDING", "SHORTLISTED", "REJECTED", "ACCEPTED"],
      default: "PENDING"
    },

    appliedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

applicationSchema.index(
  { job: 1, jobSeeker: 1 },
  { unique: true }
);

export const ApplicationModel = model(
  "Application",
  applicationSchema
);