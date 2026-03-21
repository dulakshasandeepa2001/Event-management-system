import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g. "IT-1" or "Group 1"
    description: String
});

const batchSchema = new mongoose.Schema({
    name: { type: String, required: true }, // "2023Jan"
    intakeYear: { type: Number },
    course: { type: String },
    batchCode: { type: String, unique: true, uppercase: true, trim: true },
    semesterCount: { type: Number, default: 8 },
    groups: [groupSchema],
    isActive: { type: Boolean, default: true }, // soft delete
    lastUploadSummary: { // optional small summary to display on list
        date: Date, 
        newCount: Number,
        continuingCount: Number,
        removedCount: Number
    },
    meta: mongoose.Schema.Types.Mixed
}, { timestamps: true });

const Batch = mongoose.model("Batch", batchSchema);
export default Batch;