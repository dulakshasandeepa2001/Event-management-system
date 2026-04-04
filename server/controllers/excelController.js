import multer from "multer";
import XLSX from "xlsx";
import User from "../models/User.js";
import Batch from "../models/Batch.js";
<<<<<<< HEAD
=======
import PendingStudent from "../models/PendingStudent.js";
>>>>>>> ra_new_part
import bcrypt from "bcryptjs";
import crypto from "crypto";

// multer memory storage
const storage = multer.memoryStorage();
export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes("spreadsheet") || file.originalname.match(/\.(xlsx|xls|csv)$/i)) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel or CSV files allowed"));
    }
  }
}).single("file");

// parse XLSX buffer -> array of normalized rows
const parseWorkbook = (buffer) => {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
  // normalize column names lowercased keys
  const normalized = rows.map((r) => {
    const lower = {};
    Object.keys(r).forEach((k) => {
      lower[k.toString().trim().toLowerCase()] = r[k];
    });
    return lower;
  });
  return normalized;
};

export const uploadExcel = async (req, res) => {
  uploadMiddleware(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });

    const commit = req.query.commit === "true";
    const { semester } = req.body;
    const batchId = req.params.id || req.body.batchId;

    if (!batchId) return res.status(400).json({ message: "batchId required (param or body)" });

    try {
      const batch = await Batch.findById(batchId);
      if (!batch) return res.status(404).json({ message: "Batch not found" });

      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      if (!batch.isActive) return res.status(400).json({ message: "Batch is inactive, can not upload file." });

      const rows = parseWorkbook(req.file.buffer);

      // expected fields in normalized row: regno, name, email, group (case-insensitive)
      const errors = [];
      const parsedRows = [];

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        // try several common headers
        const regno = (r.regno || r["student id"] || r["studentid"] || r["regno"] || r["id"] || "").toString().trim();
        const name = (r.name || r.fullname || r["full name"] || "").toString().trim();
        const email = (r.email || r.e_mail || "").toString().trim();
        const group = (r.group || r.groupname || r["group name"] || "").toString().trim();

        if (!regno) {
          errors.push({ row: i + 2, message: "Missing regno" });
          continue;
        }

        parsedRows.push({ regno, name, email, group });
      }

<<<<<<< HEAD
=======
      // Check for duplicate emails in the Excel file itself
      const emailMap = {};
      for (const row of parsedRows) {
        if (row.email) {
          if (emailMap[row.email]) {
            errors.push({ row: parsedRows.indexOf(row) + 2, message: `Duplicate email: ${row.email}` });
          } else {
            emailMap[row.email] = true;
          }
        }
      }

>>>>>>> ra_new_part
      // fetch previous students — match by batchId OR by course (so both styles are supported)
      const previousStudents = await User.find({
        u_regno: { $exists: true },
        $or: [
          { u_batchId: batch._id },
          { u_course: batch.course }
        ]
      }).select("u_regno u_isActive").lean();

      const previousRegNos = previousStudents.map((s) => s.u_regno);
      const incomingRegNos = parsedRows.map((p) => p.regno);

      const setNew = incomingRegNos.filter((r) => !previousRegNos.includes(r));
      const setContinuing = incomingRegNos.filter((r) => previousRegNos.includes(r));
      const setRemoved = previousRegNos.filter((r) => !incomingRegNos.includes(r));

<<<<<<< HEAD
=======
      // Check for emails that already exist in database (for new students)
      const existingEmails = [];
      for (const regno of setNew) {
        const p = parsedRows.find((x) => x.regno === regno);
        if (p && p.email) {
          const emailExists = await User.findOne({ u_email: p.email });
          if (emailExists) {
            existingEmails.push({ regno: p.regno, email: p.email, message: `Email already in use by another user` });
          }
        }
      }

>>>>>>> ra_new_part
      // If commit=false -> return preview only
      if (!commit) {
        return res.status(200).json({
          preview: parsedRows.slice(0, 50),
          summary: {
            newCount: setNew.length,
            continuingCount: setContinuing.length,
            removedCount: setRemoved.length,
<<<<<<< HEAD
            errorsCount: errors.length,
          },
          errors,
=======
            errorsCount: errors.length + existingEmails.length,
          },
          errors: [...errors, ...existingEmails],
>>>>>>> ra_new_part
        });
      }

      // commit === true -> apply changes
<<<<<<< HEAD
      const created = [];
      for (const regno of setNew) {
        const p = parsedRows.find((x) => x.regno === regno) || {};
        const exists = await User.findOne({ u_regno: regno });
        if (exists) continue;

        // generate activation code
        const activationCode = crypto.randomBytes(4).toString("hex").toUpperCase();

        // temp random password hashed
        const temp = crypto.randomBytes(6).toString("hex");
        const hashed = await bcrypt.hash(temp, 10);

        const newUser = new User({
          u_regno: regno,
          u_name: p.name || "Student",
          u_email: p.email || `${regno}@example.com`,
          u_password: hashed,
          u_role: "student",
          u_course: batch.course || "",
          u_batchId: batch._id,
          u_batchCode: batch.batchCode || undefined, // optional: helps cross-matching
          u_year: semester ? Math.ceil(semester / 2) : 1,
          u_semester: semester || 1,
          u_isActive: !!batch.isActive, // NEW: respect batch active state
          u_activationCode: activationCode,
          u_manualInactive: false // new users are not manually inactive by admin
        });

        await newUser.save();
        created.push({ regno, activationCode, email: newUser.u_email, name: newUser.u_name });
      }

      // For continuing students: ensure they are linked to this batch (but do NOT change u_isActive)
      for (const regno of setContinuing) {
        const p = parsedRows.find(x => x.regno === regno) || {};
        // update batchId if missing or different, but preserve u_isActive and u_manualInactive
        await User.updateOne(
          { u_regno: regno },
          {
            $set: {
              u_batchId: batch._id,
              u_course: batch.course || "",
              u_batchCode: batch.batchCode || undefined
            }
          }
        );
      }

      // mark removed as inactive
      const removedUpdated = [];
      for (const regno of setRemoved) {
        const user = await User.findOne({ u_regno: regno });
        if (!user) continue;
        user.u_isActive = false;
        await user.save();
        removedUpdated.push(regno);
      }

      // update batch lastUploadSummary so list page can show quick summary
=======
      // SAVE PENDING STUDENTS (waiting for signup)
      const pending = [];
      const pendingErrors = [];

      for (const row of parsedRows) {
        const { regno, name, email } = row;

        // Check if already has approved account
        const approvedStudent = await User.findOne({ u_regno: regno });
        if (approvedStudent) {
          pendingErrors.push({ regno, message: "Student already has an approved account" });
          continue;
        }

        // Check for duplicate emails in committed users
        const emailExists = await User.findOne({ u_email: email });
        if (emailExists && emailExists.u_rolle !== "admin") {
          pendingErrors.push({ regno, email, message: "Email already registered to another student" });
          continue;
        }

        // Create or update pending student record
        await PendingStudent.findOneAndUpdate(
          { u_regno: regno, u_email: email },
          {
            u_regno: regno,
            u_name: name,
            u_email: email,
            u_course: batch.course,
            u_year: semester ? Math.ceil(semester / 2) : 1,
            u_semester: semester || 1,
            batchId: batch._id,
            u_isApproved: false
          },
          { upsert: true, new: true }
        );

        pending.push({ regno, name, email, status: "Pending student approval via signup" });
      }

      // Update batch summary
>>>>>>> ra_new_part
      try {
        await Batch.findByIdAndUpdate(batch._id, {
          lastUploadSummary: {
            date: new Date(),
<<<<<<< HEAD
            newCount: created.length,
            continuingCount: setContinuing.length,
            removedCount: removedUpdated.length
          }
        });
      } catch (e) {
        // non-fatal logging
        console.error("Failed to update batch.lastUploadSummary:", e);
      }

      // return commit result
      return res.status(200).json({
        summary: {
          newCount: created.length,
          continuingCount: setContinuing.length,
          removedCount: removedUpdated.length,
          errorsCount: errors.length,
        },
        created,
        removed: removedUpdated,
        errors,
=======
            newCount: pending.length,
            continuingCount: 0,
            removedCount: 0
          }
        });
      } catch (e) {
        console.error("Failed to update batch.lastUploadSummary:", e);
      }

      // Return upload result
      return res.status(200).json({
        summary: {
          pendingCount: pending.length,
          errorCount: pendingErrors.length,
        },
        pending,
        errors: pendingErrors,
        message: `✅ Uploaded ${pending.length} students. They must sign up to activate their accounts.`
>>>>>>> ra_new_part
      });
    } catch (error) {
      console.error("Excel upload error:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  });
};