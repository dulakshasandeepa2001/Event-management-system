import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // Target student who should receive the notification
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Submission that triggered the notification
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      required: true,
    },

    // Type of notification: 'submission_created', 'submission_updated', etc.
    type: {
      type: String,
      enum: ["submission_created", "submission_updated", "submission_reminder"],
      default: "submission_created",
    },

    // Notification title and message
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },

    // Status tracking
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },

    // Additional metadata
    metadata: {
      submissionTitle: String,
      submissionModule: String,
      dueDate: Date,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
notificationSchema.index({ studentId: 1, createdAt: -1 });
notificationSchema.index({ studentId: 1, isRead: 1 });
notificationSchema.index({ submissionId: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
