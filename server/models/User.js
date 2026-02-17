import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    
    u_regno:{ type: String, sparse: true, unique: true }, // from excel
    u_name: { type: String, required: true },
    u_email: { type: String, required: true, unique: true },
    u_password: { type: String, required: true },
    u_role: { type: String, enum: ["admin", "student", "lecturer"] },
    isBatchRep: { type: Boolean, default: false },
    
    u_faculty: { type: String, required: true },
    u_course: { type: String, required: true },
    u_year: { type: Number, default: 1 },
    u_semester: { type: Number, default: 1 },

    u_isActive: { type: Boolean, default: true },

}, { timestamps: true });

const User = mongoose.model("User",userSchema);
export default User