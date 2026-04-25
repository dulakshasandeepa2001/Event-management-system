import mongoose from "mongoose";

const pendingStudentSchema = new mongoose.Schema({
  u_regno: { type: String, required: true },  // Student ID
  u_name: { type: String },  // Name (filled at signup)
  u_email: { type: String, required: true },
  u_course: { type: String },
  u_year: { type: Number },
  u_semester: { type: Number },
  u_faculty: { type: String },  // Faculty (filled at signup)
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" },  // Link to batch
  
  // ✅ Signup tracking
  u_isApproved: { type: Boolean, default: false },  // true = student signed up
  signedUpAt: { type: Date },  // When they completed signup
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },  // Link to User account
  
  // Metadata
  uploadedAt: { type: Date, default: Date.now },  // When admin uploaded
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }  // 30 days
});

// Auto-delete after 30 days if not approved
pendingStudentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PendingStudent = mongoose.model("PendingStudent", pendingStudentSchema);
export default PendingStudent;
