// that code use for create user model and export it to use in other file
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    u_name: { type: String, required: true },
    u_email: { type: String, required: true, unique: true },
    u_password: { type: String, required: true },
    u_role: { type: String, enum: ["admin", "student", "batchrep", "lecturer"], default: "student" },
    isBatchRep: { type: Boolean, default: false },
    
<<<<<<< HEAD
    u_batchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch"},
=======
    u_regno: { type: String },  // Student registration number (from Excel upload)
    u_batchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch"},
    u_batchCode: { type: String },  // Batch code for cross-reference
>>>>>>> ra_new_part
    u_faculty: { type: String },
    u_course: { type: String },
    u_year: { type: Number, default: 1 },
    u_semester: { type: Number, default: 1 },

    u_isActive: { type: Boolean, default: true },
    u_manualInactive: { type: Boolean, default: false },
    u_activationCode : { type: String, default: null }

}, { timestamps: true }); 
<<<<<<< HEAD

=======
 
>>>>>>> ra_new_part

const User = mongoose.model("User", userSchema);
export default User