import multer from "multer";
import XLSX from "xlsx";
import User from "../models/User.js";
import Batch from "../models/Batch.js";
import PendingStudent from "../models/PendingStudent.js";

const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes("spreadsheet") || file.originalname.match(/\.(xlsx|xls|csv)$/i)) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel or CSV files allowed"));
    }
  }
}).single("file");

const parseWorkbook = (buffer) => {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

  return rows.map((row) => {
    const normalized = {};
    Object.keys(row).forEach((key) => {
      normalized[key.toString().trim().toLowerCase()] = row[key];
    });
    return normalized;
  });
};

export const uploadExcel = async (req, res) => {
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const commit = req.query.commit === "true";
    const semester = req.body.semester ? Number(req.body.semester) : null;
    const batchId = req.params.id || req.body.batchId;

    if (!batchId) {
      return res.status(400).json({ message: "batchId required (param or body)" });
    }

    try {
      const batch = await Batch.findById(batchId);
      if (!batch) {
        return res.status(404).json({ message: "Batch not found" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      if (!batch.isActive) {
        return res.status(400).json({ message: "Batch is inactive, can not upload file." });
      }

      const rows = parseWorkbook(req.file.buffer);
      const errors = [];
      const parsedRows = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const regno = (row.regno || row["student id"] || row["studentid"] || row["regno"] || row["id"] || "").toString().trim().toUpperCase();
        const name = (row.name || row.fullname || row["full name"] || "").toString().trim();
        const email = (row.email || row.e_mail || "").toString().trim().toLowerCase();
        const group = (row.group || row.groupname || row["group name"] || "").toString().trim();

        if (!regno) {
          errors.push({ row: i + 2, message: "Missing regno" });
          continue;
        }

        parsedRows.push({ regno, name, email, group });
      }

      const seenEmails = new Set();
      for (let i = 0; i < parsedRows.length; i++) {
        const row = parsedRows[i];
        if (!row.email) continue;
        if (seenEmails.has(row.email)) {
          errors.push({ row: i + 2, message: `Duplicate email: ${row.email}` });
        } else {
          seenEmails.add(row.email);
        }
      }

      const previousStudents = await User.find({
        u_regno: { $exists: true },
        $or: [{ u_batchId: batch._id }, { u_course: batch.course }]
      })
        .select("u_regno u_isActive")
        .lean();

      const previousRegNos = previousStudents.map((student) => student.u_regno);
      const incomingRegNos = parsedRows.map((row) => row.regno);
      const setNew = incomingRegNos.filter((regno) => !previousRegNos.includes(regno));
      const setContinuing = incomingRegNos.filter((regno) => previousRegNos.includes(regno));
      const setRemoved = previousRegNos.filter((regno) => !incomingRegNos.includes(regno));

      const existingEmails = [];
      for (const regno of setNew) {
        const candidate = parsedRows.find((row) => row.regno === regno);
        if (!candidate || !candidate.email) continue;

        const emailExists = await User.findOne({ u_email: candidate.email });
        if (emailExists) {
          existingEmails.push({ regno: candidate.regno, email: candidate.email, message: "Email already in use by another user" });
        }
      }

      const allErrors = [...errors, ...existingEmails];

      if (!commit) {
        return res.status(200).json({
          preview: parsedRows.slice(0, 50),
          summary: {
            newCount: setNew.length,
            continuingCount: setContinuing.length,
            removedCount: setRemoved.length,
            errorsCount: allErrors.length
          },
          errors: allErrors
        });
      }

      const pending = [];
      const pendingErrors = [];

      for (const row of parsedRows) {
        const { regno, name, email } = row;

        const approvedStudent = await User.findOne({ u_regno: regno });
        if (approvedStudent) {
          pendingErrors.push({ regno, message: "Student already has an approved account" });
          continue;
        }

        if (email) {
          const emailExists = await User.findOne({ u_email: email });
          if (emailExists && emailExists.u_role !== "admin") {
            pendingErrors.push({ regno, email, message: "Email already registered to another student" });
            continue;
          }
        }

        const pendingStudent = await PendingStudent.findOneAndUpdate(
          { u_regno: regno },
          {
            u_regno: regno,
            u_name: name,
            u_email: email || `${regno}@example.com`,
            u_course: batch.course,
            u_year: semester ? Math.ceil(semester / 2) : 1,
            u_semester: semester || 1,
            batchId: batch._id,
            u_isApproved: false
          },
          { upsert: true, new: true }
        );

        pending.push({ regno, name: pendingStudent.u_name, email: pendingStudent.u_email, status: "Pending student approval via signup" });
      }

      try {
        await Batch.findByIdAndUpdate(batch._id, {
          lastUploadSummary: {
            date: new Date(),
            newCount: pending.length,
            continuingCount: 0,
            removedCount: 0
          }
        });
      } catch (e) {
        console.error("Failed to update batch.lastUploadSummary:", e);
      }

      return res.status(200).json({
        summary: {
          pendingCount: pending.length,
          errorCount: pendingErrors.length,
        },
        pending,
        errors: pendingErrors,
        message: `✅ Uploaded ${pending.length} students. They must sign up to activate their accounts.`
      });
    } catch (error) {
      console.error("Excel upload error:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  });
};