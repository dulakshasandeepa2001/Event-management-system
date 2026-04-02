import mongoose from "mongoose";

const deadlineSchema = new mongoose.Schema(
  {
    d_title: { type: String, required: true, trim: true },
    d_subject: { type: String, required: true, trim: true },
    d_description: { type: String, trim: true, default: "" },
    d_year: { type: Number, required: true, min: 1, max: 6 },
    d_semester: { type: Number, required: true, min: 1, max: 2 },
    d_course: { type: String, trim: true, default: "" },
    d_dueDate: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    createdByModel: { type: String, enum: ["User", "Rep"], required: true },
  },
  { timestamps: true }
);

const Deadline = mongoose.model("Deadline", deadlineSchema);

export default Deadline;
