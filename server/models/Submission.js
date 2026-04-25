import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    s_title: { type: String, required: true, trim: true },
    s_module: { type: String, required: true, trim: true },
    s_description: { type: String, trim: true, default: "" },
    s_year: { type: Number, required: true, min: 1, max: 6 },
    s_semester: { type: Number, required: true, min: 1, max: 2 },
    s_course: { type: String, trim: true, default: "" },
    s_dueDate: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    createdByModel: { type: String, enum: ["User", "Rep"], required: true },
  },
  { timestamps: true }
);

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;
