import Submission from "../models/Submission.js";
import SubmissionUpload from "../models/SubmissionUpload.js";
import SubmissionActivity from "../models/SubmissionActivity.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "../public/uploads/submissions");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 40);
    cb(null, `${Date.now()}-${req.user?._id || "student"}-${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

export const submissionUploadMiddleware = upload.single("file");

const canManageSubmissions = (user) => {
  if (!user) return false;
  return user.u_role === "admin" || user.u_role === "batchrep" || !!user.isBatchRep;
};

const isBatchRepUser = (user) => user && (user.u_role === "batchrep" || !!user.isBatchRep);

const isValidFutureOrTodayDate = (rawDate) => {
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = new Date(parsed);
  selected.setHours(0, 0, 0, 0);

  return selected.getTime() >= today.getTime();
};

const normalizeSubmissionPayload = (payload) => {
  return {
    s_title: (payload.s_title || "").trim(),
    s_module: (payload.s_module || "").trim(),
    s_description: (payload.s_description || "").trim(),
    s_year: payload.s_year !== undefined ? Number(payload.s_year) : undefined,
    s_semester: payload.s_semester !== undefined ? Number(payload.s_semester) : undefined,
    s_course: (payload.s_course || "").trim(),
    s_dueDate: payload.s_dueDate,
  };
};

const validateSubmissionPayload = (payload, { partial = false } = {}) => {
  const normalized = normalizeSubmissionPayload(payload);

  if (!partial || payload.s_title !== undefined) {
    if (!normalized.s_title || normalized.s_title.length < 3 || normalized.s_title.length > 120) {
      return "Submission title must be between 3 and 120 characters";
    }
  }

  if (!partial || payload.s_module !== undefined) {
    if (!normalized.s_module || normalized.s_module.length < 2 || normalized.s_module.length > 80) {
      return "Module must be between 2 and 80 characters";
    }
  }

  if (!partial || payload.s_year !== undefined) {
    if (!Number.isInteger(normalized.s_year) || normalized.s_year < 1 || normalized.s_year > 4) {
      return "Year must be between 1 and 4";
    }
  }

  if (!partial || payload.s_semester !== undefined) {
    if (!Number.isInteger(normalized.s_semester) || normalized.s_semester < 1 || normalized.s_semester > 2) {
      return "Semester must be 1 or 2";
    }
  }

  if (!partial || payload.s_dueDate !== undefined) {
    if (!normalized.s_dueDate || !isValidFutureOrTodayDate(normalized.s_dueDate)) {
      return "Due date must be today or a future date";
    }
  }

  if (normalized.s_description.length > 1000) {
    return "Description must be 1000 characters or fewer";
  }

  if (normalized.s_course.length > 100) {
    return "Course must be 100 characters or fewer";
  }

  return null;
};

export const createSubmission = async (req, res) => {
  try {
    if (!canManageSubmissions(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const validationError = validateSubmissionPayload(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const normalized = normalizeSubmissionPayload(req.body);

    const submission = await Submission.create({
      s_title: normalized.s_title,
      s_module: normalized.s_module,
      s_description: normalized.s_description,
      s_year: normalized.s_year,
      s_semester: normalized.s_semester,
      s_course: normalized.s_course,
      s_dueDate: normalized.s_dueDate,
      createdBy: req.user._id,
      createdByModel: req.user.sourceModel || "User",
    });

    return res.status(201).json({ submission });
  } catch (err) {
    console.error("createSubmission error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getSubmissions = async (req, res) => {
  try {
    if (!canManageSubmissions(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { year, semester, module } = req.query;
    const filter = {};

    if (isBatchRepUser(req.user)) {
      filter.createdBy = req.user._id;
      filter.createdByModel = req.user.sourceModel || "Rep";
    }

    if (year) filter.s_year = Number(year);
    if (semester) filter.s_semester = Number(semester);
    if (module) filter.s_module = { $regex: module, $options: "i" };

    const submissions = await Submission.find(filter).sort({ s_dueDate: 1, createdAt: -1 }).lean();

    const submissionIds = submissions.map((item) => item._id);
    const uploadStats = submissionIds.length
      ? await SubmissionUpload.aggregate([
          { $match: { submissionId: { $in: submissionIds } } },
          {
            $group: {
              _id: "$submissionId",
              uploadCount: { $sum: 1 },
              students: { $addToSet: "$studentId" },
            },
          },
        ])
      : [];

    const uploadMap = uploadStats.reduce((acc, stat) => {
      acc[String(stat._id)] = {
        uploadCount: stat.uploadCount || 0,
        submittedStudentCount: Array.isArray(stat.students) ? stat.students.length : 0,
      };
      return acc;
    }, {});

    const openStats = submissionIds.length
      ? await SubmissionActivity.aggregate([
          { $match: { submissionId: { $in: submissionIds } } },
          {
            $group: {
              _id: "$submissionId",
              openedStudentCount: { $sum: 1 },
              totalOpenCount: { $sum: { $ifNull: ["$openCount", 0] } },
            },
          },
        ])
      : [];

    const openMap = openStats.reduce((acc, stat) => {
      acc[String(stat._id)] = {
        openedStudentCount: stat.openedStudentCount || 0,
        totalOpenCount: stat.totalOpenCount || 0,
      };
      return acc;
    }, {});

    const enrichedSubmissions = submissions.map((item) => {
      const stat = uploadMap[String(item._id)] || { uploadCount: 0, submittedStudentCount: 0 };
      const openStat = openMap[String(item._id)] || { openedStudentCount: 0, totalOpenCount: 0 };
      return {
        ...item,
        uploadCount: stat.uploadCount,
        submittedStudentCount: stat.submittedStudentCount,
        openedStudentCount: openStat.openedStudentCount,
        totalOpenCount: openStat.totalOpenCount,
      };
    });

    return res.status(200).json({ submissions: enrichedSubmissions });
  } catch (err) {
    console.error("getSubmissions error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateSubmission = async (req, res) => {
  try {
    if (!canManageSubmissions(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    const validationError = validateSubmissionPayload(req.body, { partial: true });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const normalized = normalizeSubmissionPayload(req.body);
    const payload = {};

    if (req.body.s_title !== undefined) payload.s_title = normalized.s_title;
    if (req.body.s_module !== undefined) payload.s_module = normalized.s_module;
    if (req.body.s_description !== undefined) payload.s_description = normalized.s_description;
    if (req.body.s_year !== undefined) payload.s_year = normalized.s_year;
    if (req.body.s_semester !== undefined) payload.s_semester = normalized.s_semester;
    if (req.body.s_course !== undefined) payload.s_course = normalized.s_course;
    if (req.body.s_dueDate !== undefined) payload.s_dueDate = normalized.s_dueDate;

    const query = { _id: id };
    if (isBatchRepUser(req.user)) {
      query.createdBy = req.user._id;
      query.createdByModel = req.user.sourceModel || "Rep";
    }

    const submission = await Submission.findOneAndUpdate(
      query,
      { $set: payload },
      { new: true, runValidators: true }
    );

    if (!submission) return res.status(404).json({ message: "Submission not found" });

    return res.status(200).json({ submission });
  } catch (err) {
    console.error("updateSubmission error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteSubmission = async (req, res) => {
  try {
    if (!canManageSubmissions(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;

    const query = { _id: id };
    if (isBatchRepUser(req.user)) {
      query.createdBy = req.user._id;
      query.createdByModel = req.user.sourceModel || "Rep";
    }

    const submission = await Submission.findOneAndDelete(query);

    if (!submission) return res.status(404).json({ message: "Submission not found" });

    await Promise.all([
      SubmissionUpload.deleteMany({ submissionId: submission._id }),
      SubmissionActivity.deleteMany({ submissionId: submission._id }),
    ]);

    return res.status(200).json({ message: "Submission deleted" });
  } catch (err) {
    console.error("deleteSubmission error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getStudentSubmissions = async (req, res) => {
  try {
    if (!req.user || req.user.u_role !== "student") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const studentYear = Number(req.user.u_year || 1);
    const studentSemester = Number(req.user.u_semester || 1);

    const submissions = await Submission.find({
      s_year: studentYear,
      s_semester: studentSemester,
    })
      .sort({ s_dueDate: 1 })
      .lean();

    return res.status(200).json({ submissions });
  } catch (err) {
    console.error("getStudentSubmissions error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const uploadStudentSubmission = async (req, res) => {
  try {
    if (!req.user || req.user.u_role !== "student") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    const { comment } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const studentYear = Number(req.user.u_year || 1);
    const studentSemester = Number(req.user.u_semester || 1);

    const submission = await Submission.findOne({
      _id: id,
      s_year: studentYear,
      s_semester: studentSemester,
    }).lean();

    if (!submission) {
      return res.status(404).json({ message: "Submission not found for this student" });
    }

    const existing = await SubmissionUpload.findOne({
      submissionId: submission._id,
      studentId: req.user._id,
    });

    if (existing?.fileName) {
      const oldPath = path.resolve(uploadDir, existing.fileName);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const payload = {
      submissionId: submission._id,
      studentId: req.user._id,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      fileUrl: `/uploads/submissions/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      comment: comment || "",
      status: existing ? "resubmitted" : "submitted",
      submittedAt: new Date(),
    };

    const uploadDoc = await SubmissionUpload.findOneAndUpdate(
      { submissionId: submission._id, studentId: req.user._id },
      { $set: payload },
      { upsert: true, new: true, runValidators: true }
    ).lean();

    return res.status(200).json({ message: "Submission uploaded successfully", upload: uploadDoc });
  } catch (err) {
    console.error("uploadStudentSubmission error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getStudentSubmissionUploads = async (req, res) => {
  try {
    if (!req.user || req.user.u_role !== "student") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const uploads = await SubmissionUpload.find({ studentId: req.user._id })
      .populate("submissionId", "s_title s_module s_dueDate s_year s_semester")
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({ uploads });
  } catch (err) {
    console.error("getStudentSubmissionUploads error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const markSubmissionOpened = async (req, res) => {
  try {
    if (!req.user || req.user.u_role !== "student") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;

    const studentYear = Number(req.user.u_year || 1);
    const studentSemester = Number(req.user.u_semester || 1);

    const submission = await Submission.findOne({
      _id: id,
      s_year: studentYear,
      s_semester: studentSemester,
    }).lean();

    if (!submission) {
      return res.status(404).json({ message: "Submission not found for this student" });
    }

    const now = new Date();
    const activity = await SubmissionActivity.findOneAndUpdate(
      { submissionId: submission._id, studentId: req.user._id },
      {
        $setOnInsert: { firstOpenedAt: now },
        $set: { lastOpenedAt: now },
        $inc: { openCount: 1 },
      },
      { upsert: true, new: true }
    ).lean();

    return res.status(200).json({ message: "Submission open tracked", activity });
  } catch (err) {
    console.error("markSubmissionOpened error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getSubmissionEngagementDetails = async (req, res) => {
  try {
    if (!canManageSubmissions(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;

    const query = { _id: id };
    if (isBatchRepUser(req.user)) {
      query.createdBy = req.user._id;
      query.createdByModel = req.user.sourceModel || "Rep";
    }

    const submission = await Submission.findOne(query).lean();
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const [activities, uploads] = await Promise.all([
      SubmissionActivity.find({ submissionId: submission._id })
        .populate("studentId", "u_fullname u_email u_indexnumber")
        .lean(),
      SubmissionUpload.find({ submissionId: submission._id })
        .populate("studentId", "u_fullname u_email u_indexnumber")
        .lean(),
    ]);

    const detailsMap = {};

    activities.forEach((act) => {
      const sid = String(act.studentId?._id || act.studentId);
      if (!sid) return;

      detailsMap[sid] = {
        studentId: sid,
        fullName: act.studentId?.u_fullname || "Unknown",
        email: act.studentId?.u_email || "-",
        indexNumber: act.studentId?.u_indexnumber || "-",
        opened: true,
        openCount: act.openCount || 0,
        firstOpenedAt: act.firstOpenedAt || null,
        lastOpenedAt: act.lastOpenedAt || null,
        uploaded: false,
        submittedAt: null,
        fileUrl: null,
      };
    });

    uploads.forEach((upload) => {
      const sid = String(upload.studentId?._id || upload.studentId);
      if (!sid) return;

      if (!detailsMap[sid]) {
        detailsMap[sid] = {
          studentId: sid,
          fullName: upload.studentId?.u_fullname || "Unknown",
          email: upload.studentId?.u_email || "-",
          indexNumber: upload.studentId?.u_indexnumber || "-",
          opened: false,
          openCount: 0,
          firstOpenedAt: null,
          lastOpenedAt: null,
          uploaded: true,
          submittedAt: upload.submittedAt || null,
          fileUrl: upload.fileUrl || null,
        };
      } else {
        detailsMap[sid].uploaded = true;
        detailsMap[sid].submittedAt = upload.submittedAt || detailsMap[sid].submittedAt;
        detailsMap[sid].fileUrl = upload.fileUrl || detailsMap[sid].fileUrl;
      }
    });

    const studentDetails = Object.values(detailsMap).sort((a, b) => {
      if (a.uploaded !== b.uploaded) return a.uploaded ? -1 : 1;
      return a.fullName.localeCompare(b.fullName);
    });

    return res.status(200).json({
      submission,
      summary: {
        openedStudentCount: activities.length,
        uploadedStudentCount: uploads.length,
      },
      studentDetails,
    });
  } catch (err) {
    console.error("getSubmissionEngagementDetails error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};
