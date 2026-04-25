import mongoose from "mongoose";

const submissionActivitySchema = new mongoose.Schema(
  {
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    openCount: { type: Number, default: 0 },
    firstOpenedAt: { type: Date, default: Date.now },
    lastOpenedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

submissionActivitySchema.index({ submissionId: 1, studentId: 1 }, { unique: true });

const SubmissionActivity = mongoose.model("SubmissionActivity", submissionActivitySchema);

export default SubmissionActivity;
