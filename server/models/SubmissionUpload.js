import mongoose from "mongoose";

const submissionUploadSchema = new mongoose.Schema(
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
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    comment: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["submitted", "resubmitted"], default: "submitted" },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

submissionUploadSchema.index({ submissionId: 1, studentId: 1 }, { unique: true });

const SubmissionUpload = mongoose.model("SubmissionUpload", submissionUploadSchema);

export default SubmissionUpload;
