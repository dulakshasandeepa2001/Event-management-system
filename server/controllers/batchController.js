import mongoose from "mongoose";
import Batch from "../models/Batch.js";
import User from "../models/User.js";

/**
 * Helper: create display name and batchCode from intakeYear, monthName, course
 * intakeYear: number (e.g. 2023)
 * monthName: string (e.g. "Jan")
 * course: string (e.g. "IT")
 */
const makeBatchNameAndCode = (intakeYear, monthName, course) => {
  const yearStr = String(intakeYear || "");
  const yy = yearStr.length >= 2 ? yearStr.slice(-2) : yearStr;
  const monthPart = String(monthName || "").trim().slice(0,3);
  const monthFormatted = monthPart ? (monthPart.charAt(0).toUpperCase() + monthPart.slice(1).toLowerCase()) : "";
  const courseClean = String(course || "").replace(/\s+/g, "").toUpperCase();
  const batchCode = (yy && monthFormatted && courseClean) ? `${yy}${monthFormatted}${courseClean}` : "";
  const displayName = (intakeYear && monthFormatted && courseClean) ? `${intakeYear} ${monthFormatted} intake - ${courseClean}` : "";
  return { displayName, batchCode };
};

// Create a new batch
export const createBatch = async (req, res) => {
  try {
    // Expect intakeYear (Number), name (month string), course (string), groups optional
    let { name: monthName, intakeYear, course, groups } = req.body;

    // Defensive: ensure types
    intakeYear = intakeYear ? Number(intakeYear) : undefined;
    monthName = monthName ? String(monthName).trim() : "";
    course = course ? String(course).trim() : "";

    const { displayName, batchCode } = makeBatchNameAndCode(intakeYear, monthName, course);

    // Build stored batch: keep original fields but store display name in `name`
    const batch = new Batch({
      name: displayName || `${intakeYear || ""} ${monthName || ""}`.trim(),
      intakeYear,
      course: course ? course.toUpperCase() : course,
      batchCode: batchCode || undefined,
      groups: groups || []
    });

    await batch.save();
    return res.status(201).json({ batch });
  } catch (err) {
    console.error("createBatch error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// List batches with counts
export const listBatches = async (req, res) => {
  try {
    const { course, name, active } = req.query;
    const filter = {};
    if (course) filter.course = course;
    if (name) filter.name = { $regex: name, $options: "i" };
    if (typeof active !== "undefined") filter.isActive = active === "true";

    const batches = await Batch.find(filter).lean();

    const enriched = await Promise.all(batches.map(async (b) => {
      const studentCount = await User.countDocuments({
        u_regno: { $exists: true },
        u_batchId: b._id
      });
      const activeCount = await User.countDocuments({
        u_regno: { $exists: true },
        u_isActive: true,
        u_batchId: b._id
      });
      const inactiveCount = studentCount - activeCount;

      // ensure displayed name is consistent: prefer stored name, otherwise build
      const displayName = b.name || (b.intakeYear && b.course && b.name ? `${b.intakeYear} ${b.name} intake - ${b.course}` : "");

      return {
        _id: b._id,
        name: displayName,
        course: b.course,
        intakeYear: b.intakeYear,
        groupsCount: (b.groups || []).length,
        studentCount,
        activeCount,
        inactiveCount,
        createdAt: b.createdAt,
        lastUpload: b.lastUploadSummary || null,
        isActive: b.isActive,
        batchCode: b.batchCode || ""
      };
    }));

    return res.status(200).json({ batches: enriched });
  } catch (err) {
    console.error("listBatches error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get a single batch
export const getBatch = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid batch id" });

    const batch = await Batch.findById(id).lean();
    if (!batch) return res.status(404).json({ message: "Not found" });

    // fetch students by u_batchId ONLY (do not use course fallback)
    const students = await User.find({
      u_regno: { $exists: true },
      u_batchId: batch._id
    }).select("u_regno u_name u_email u_isActive u_batchCode u_manualInactive").lean();

    // if batch is inactive => 0
    // if batch is active => count students that are u_isActive === true and not manually inactive
    const activeCount = batch.isActive ? students.filter(s => s.u_isActive && !s.u_manualInactive).length : 0;

    return res.status(200).json({
      batch,
      students,
      studentCount: students.length,
      activeCount
    });
  } catch (err) {
    console.error("getBatch error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update batch (recompute name & batchCode if intakeYear/name/course provided)
export const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // if incoming fields contain intakeYear/name/course -> recompute
    if (updates.intakeYear || updates.name || updates.course) {
      const intakeYear = updates.intakeYear ? Number(updates.intakeYear) : undefined;
      const monthName = updates.name ? String(updates.name).trim() : undefined;
      const course = updates.course ? String(updates.course).trim() : undefined;
      const { displayName, batchCode } = makeBatchNameAndCode(intakeYear, monthName, course);
      if (displayName) updates.name = displayName;
      if (batchCode) updates.batchCode = batchCode;
      if (course) updates.course = course.toUpperCase();
    }

    const batch = await Batch.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!batch) return res.status(404).json({ message: "Not found" });

    return res.status(200).json({ batch });
  } catch (err) {
    console.error("updateBatch error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Deactivate batch (soft)
export const deactivateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const batch = await Batch.findByIdAndUpdate(id, { isActive: false }, { new: true }).lean();
    if (!batch) return res.status(404).json({ message: "Not found" });

    // Also deactivate students in this batch
    await User.updateMany({ u_batchId: id }, { $set: { u_isActive: false } });

    return res.status(200).json({ message: "Batch deactivated", batch });
  } catch (err) {
    console.error("deactivateBatch error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Activate batch
export const activateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const batch = await Batch.findById(id);
    if (!batch) return res.status(404).json({ message: "Batch not found" });
    if (batch.isActive) return res.status(400).json({ message: "Batch already active" });

    batch.isActive = true;
    await batch.save();

    // Only set students active if they are NOT manually deactivated by admin.
    // We assume User model has `u_manualInactive` flag (see models/User.js change).
    await User.updateMany(
      { u_batchId: id, u_manualInactive: { $ne: true } },
      { $set: { u_isActive: true } }
    );

    return res.status(200).json({ message: "Batch and eligible students activated" });
  } catch (err) {
    console.error("activateBatch error:", err);
    return res.status(500).json({ message: "Failed to activate batch" });
  }
};

// Delete batch (hard)
export const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid batch id" });

    const batch = await Batch.findById(id);
    if (!batch) return res.status(404).json({ message: "Not found" });

    if (batch.isActive) return res.status(400).json({ message: "Deactivate batch before deleting" });

    await Batch.findByIdAndDelete(id);
    return res.status(200).json({ message: "Batch deleted" });
  } catch (err) {
    console.error("deleteBatch error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Export activation codes
const makeCsv = (rows) => {
  const header = ["batchName", "regno", "name", "email", "activationCode"];
  const lines = [header.join(",")];
  rows.forEach(r => {
    const esc = (v) => {
      if (v == null) return "";
      const s = String(v);
      if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };
    lines.push([esc(r.batchName), esc(r.regno), esc(r.name), esc(r.email), esc(r.activationCode)].join(","));
  });
  return lines.join("\r\n");
};

const escapeRegex = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');


export const exportActivationCodes = async (req, res) => {
  try {
    let ids = [];
    if (req.params.id && req.params.id !== "activation-codes") ids = [req.params.id];
    else if (req.query.ids) ids = String(req.query.ids).split(",").map(x => x.trim()).filter(Boolean);
    else return res.status(400).json({ message: "Batch id(s) required" });

    ids = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (!ids.length) return res.status(400).json({ message: "No valid batch ids provided" });

    const batches = await Batch.find({ _id: { $in: ids } }).lean();
    if (!batches.length) return res.status(404).json({ message: "No batches found" });

    const aggregatedRows = [];

    for (const b of batches) {
      // Match users by batchId OR by u_batchCode (if stored). Do NOT fallback to global list.
      const matchClauses = [{ u_batchId: b._id }];
      if (b.batchCode) matchClauses.push({ u_batchCode: b.batchCode });

      const users = await User.find({
        $and: [
          { u_regno: { $exists: true } },
          { $or: matchClauses },
          { $or: [
              { u_activationCode: { $exists: true, $ne: null } },
              { activationCode: { $exists: true, $ne: null } },
              { u_activation_code: { $exists: true, $ne: null } }
          ] }
        ]
      }).select("u_regno u_name u_email u_activationCode activationCode u_activation_code u_batchCode").lean();

      // If no users matched for this batch, skip adding anything for it
      users.forEach(u => {
        const code = u.u_activationCode || u.activationCode || u.u_activation_code || null;
        if (!code) return;
        aggregatedRows.push({
          batchName: b.name,
          regno: u.u_regno || "",
          name: u.u_name || "",
          email: u.u_email || "",
          activationCode: code
        });
      });
    }

    if (!aggregatedRows.length) {
      // nothing found for requested batch(es) — inform caller so frontend can show toast
      return res.status(404).json({ message: "No students with activation codes found for the requested batch(es)." });
    }

    const makeCsv = (rows) => {
      const header = ["batchName", "regno", "name", "email", "activationCode"];
      const lines = [header.join(",")];
      rows.forEach(r => {
        const esc = (v) => {
          if (v == null) return "";
          const s = String(v);
          if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
            return `"${s.replace(/"/g, '""')}"`;
          }
          return s;
        };
        lines.push([esc(r.batchName), esc(r.regno), esc(r.name), esc(r.email), esc(r.activationCode)].join(","));
      });
      return lines.join("\r\n");
    };

    const csv = makeCsv(aggregatedRows);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="activation_codes_${Date.now()}.csv"`);
    return res.status(200).send(csv);
  } catch (err) {
    console.error("exportActivationCodes error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};