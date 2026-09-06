import { Schema, model } from "mongoose";

const salaryRangeSchema = new Schema(
  {
    min: {
      type: Number,
      required: true,
      min: 0
    },
    max: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

salaryRangeSchema.path("max").validate({
  validator(value) {
    return this.min <= value;
  },
  message: "Maximum salary must be greater than or equal to minimum salary"
});

const jobSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 100,
      trim: true
    },

    companyName: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 100,
      trim: true
    },

    description: {
      type: String,
      required: true,
      minLength: 10,
      maxLength: 5000,
      trim: true
    },

    location: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 100,
      trim: true
    },

    employmentType: {
      type: String,
      required: true,
      enum: ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]
    },

    salaryRange: {
      type: salaryRangeSchema,
      required: true
    },

    requiredSkills: {
      type: [String],
      default: []
    },

    experienceRequirement: {
      type: Number,
      default: 0,
      min: 0
    },

    postedDate: {
      type: Date,
      default: Date.now
    },

    applicationDeadline: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN"
    },

    employer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const JobModel = model("Job", jobSchema);
