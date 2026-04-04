import mongoose from "mongoose";

const markRowSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    studentName: { type: String, default: "" },
    marks: { type: Number, required: true, min: 0 },
    studentRef: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

const marksSchema = new mongoose.Schema(
  {
    batchId: { type: String, required: true, index: true },
    semester: { type: String, default: "" },

    subjectName: { type: String, required: true, trim: true },
    subjectCode: { type: String, required: true, trim: true },
    assessmentName: { type: String, required: true, trim: true },
    maxMarks: { type: Number, required: true, min: 1 },

    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    uploadedByName: { type: String, default: "" },

    rows: [markRowSchema],
  },
  { timestamps: true }
);

marksSchema.index(
  { batchId: 1, semester: 1, subjectCode: 1, assessmentName: 1 },
  { unique: true }
);

export default mongoose.model("Marks", marksSchema);