import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["OWNER", "LEADER", "MEMBER"],
          default: "MEMBER",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    settings: {
      allowMemberViewAllTasks: {
        type: Boolean,
        default: true,
      },

      enableEmailReminders: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ "members.userId": 1 });

const Project = mongoose.model("Project", projectSchema);
export default Project;
