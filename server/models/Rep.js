import mongoose from "mongoose";

const repSchema = new mongoose.Schema(
    {
        r_name: { type: String, required: true },
        r_email: { type: String, required: true, unique: true },
        r_password: { type: String, required: true },
        r_role: { type: String, enum: ["batchrep"], default: "batchrep" },
        isBatchRep: { type: Boolean, default: true },
        u_batchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" },
        u_batchCode: { type: String },
    },
    { timestamps: true }
);

const Rep = mongoose.model("Rep", repSchema);

export default Rep;