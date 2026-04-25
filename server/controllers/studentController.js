import User from "../models/User.js";
import Batch from "../models/Batch.js";

// GET /api/students -> list all students (admin or batch rep) with optional filtering
export const getAllStudents = async (req, res) => {
  try {
    // permission: allow if admin role OR batch rep flag
    if (!(req.user.u_role === "admin" || req.user.isBatchRep)) {
      return res.status(403).json({ message: "Forbidden" });
    } 

    // Extract query filters
    const { batchId, course, isActive, search, limit = 100, skip = 0 } = req.query;
    
    // Build filter object
    const filter = { u_role: "student" };
    
    if (batchId) {
      filter.u_batchId = batchId;
    }
    
    if (course) {
      filter.u_course = { $regex: course, $options: "i" };
    }
    
    if (isActive !== undefined) {
      filter.u_isActive = isActive === "true";
    }
    
    // Search by name, email, or registration number
    if (search) {
      filter.$or = [
        { u_name: { $regex: search, $options: "i" } },
        { u_email: { $regex: search, $options: "i" } },
        { u_regno: { $regex: search, $options: "i" } }
      ];
    }

    // Get total count for pagination
    const totalCount = await User.countDocuments(filter);
    
    // Fetch students with pagination
    const students = await User.find(filter)
      .select("-u_password")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    // Enrich with batch details if needed
    const enrichedStudents = await Promise.all(
      students.map(async (student) => {
        if (student.u_batchId) {
          const batch = await Batch.findById(student.u_batchId).select("name course").lean();
          return {
            ...student,
            batchDetails: batch
          };
        }
        return student;
      })
    );

    return res.status(200).json({ 
      students: enrichedStudents,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Get All Students Error:', err.message);
    console.error('Stack:', err.stack);
    return res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};

// GET /api/students/:id -> single student (admin / batchrep / self)
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
    console.error('Get Student By ID Error:', err.message);
    console.error('Stack:', err.stack);
    return res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};

// GET /api/students/batch/:batchId -> get all students in a batch
export const getStudentsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { search, isActive, limit = 100, skip = 0 } = req.query;
    
    // permission: allow if admin role OR batch rep flag
    if (!(req.user.u_role === "admin" || req.user.isBatchRep)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Verify batch exists
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // Build filter
    const filter = { 
      u_role: "student",
      u_batchId: batchId
    };

    if (isActive !== undefined) {
      filter.u_isActive = isActive === "true";
    }

    if (search) {
      filter.$or = [
        { u_name: { $regex: search, $options: "i" } },
        { u_email: { $regex: search, $options: "i" } },
        { u_regno: { $regex: search, $options: "i" } }
      ];
    }

    // Get total count
    const totalCount = await User.countDocuments(filter);

    // Fetch students
    const students = await User.find(filter)
      .select("-u_password")
      .sort({ u_regno: 1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    return res.status(200).json({
      batch: {
        _id: batch._id,
        name: batch.name,
        course: batch.course,
        intakeYear: batch.intakeYear
      },
      students,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Get Students By Batch Error:', err.message);
    return res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// PATCH /api/student/:id/manual-deactivate  -> body: { manualInactive: true/false }
export const setStudentManualInactive = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user || req.user.u_role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const { manualInactive } = req.body;
    const currentStudent = await User.findById(id).select("u_isActive").lean();
    if (!currentStudent) return res.status(404).json({ message: "Student not found" });

    const student = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          u_manualInactive: !!manualInactive,
          u_isActive: manualInactive ? false : (currentStudent.u_isActive ?? true),
        },
      },
      { new: true }
    );
    if (!student) return res.status(404).json({ message: "Student not found" });
    return res.status(200).json({ student });
  } catch (err) {
    console.error("setStudentManualInactive error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
