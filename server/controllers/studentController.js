import User from "../models/User.js";
//import SemesterRecord from "../models/SemesterRecord.js"; // optional if you added it

// GET /api/student  -> list all students (admin or batch rep)
export const getAllStudents = async (req, res) => {
  try {
    // permission: allow if admin role OR batch rep flag
    if (!(req.user.u_role === "admin" || req.user.isBatchRep)) {
      return res.status(403).json({ message: "Forbidden" });
    } 

    // If you want only active students for current semester:
    const students = await User.find({ u_role: "student" }).select("-u_password").lean();
    return res.status(200).json({ students });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/student/:id -> single student (admin / batchrep / self)
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    // allow self, admin, or batch rep
    if (!(req.user.u_role === "admin" || req.user.isBatchRep || req.user._id.toString() === id)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const student = await User.findById(id).select("-u_password");
    if (!student) return res.status(404).json({ message: "Student not found" });
    return res.status(200).json({ student });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};