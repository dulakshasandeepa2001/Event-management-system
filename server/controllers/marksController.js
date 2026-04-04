import path from "path";
import XLSX from "xlsx";
import Marks from "../models/Marks.js";
import User from "../models/User.js";

const getBatchId = (user) =>
  user?.u_batchId || user?.batchId || user?.batch || user?.u_batch || "";

const getSemester = (user, body) =>
  user?.u_semester || user?.semester || body?.semester || "";

const getUserId = (user) => user?._id || user?.id || "";

const getUserName = (user) => user?.u_name || user?.name || "";

const normalize = (value) => String(value ?? "").trim();

const toNumber = (value) => {
  const n = Number(String(value ?? "").trim());
  return Number.isFinite(n) ? n : null;
};

const isAllowedFile = (file) => {
  if (!file) return false;
  const ext = path.extname(file.originalname).toLowerCase();
  return [".xlsx", ".xls", ".csv"].includes(ext);
};

const readWorkbookRows = (file) => {
  const ext = path.extname(file.originalname).toLowerCase();

  let workbook;
  if (ext === ".csv") {
    workbook = XLSX.read(file.buffer.toString("utf8"), { type: "string" });
  } else {
    workbook = XLSX.read(file.buffer, { type: "buffer" });
  }

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
};

const getValue = (row, keys) => {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") {
      return row[key];
    }
  }
  return "";
};

const buildStudentQuery = (studentIds, batchId) => {
  const conditions = [
    {
      $or: [
        { role: "student" },
        { u_role: "student" },
      ],
    },
    {
      $or: [
        { u_regno: { $in: studentIds } },
        { studentId: { $in: studentIds } },
        { student_id: { $in: studentIds } },
        { regNo: { $in: studentIds } },
      ],
    },
  ];

  if (batchId) {
    conditions.push({
      $or: [
        { u_batchId: batchId },
        { batchId: batchId },
        { batch: batchId },
      ],
    });
  }

  return { $and: conditions };
};

const parseAndValidateRows = async ({ file, maxMarks, batchId }) => {
  const rawRows = readWorkbookRows(file);

  if (!rawRows.length) {
    return {
      validRows: [],
      invalidRows: [{ row: 1, reason: "File is empty" }],
    };
  }

  const studentIds = rawRows
    .map((row) =>
      normalize(
        getValue(row, ["student_id", "studentId", "sid", "SID", "Student ID", "STUDENT_ID"])
      )
    )
    .filter(Boolean);

  const uniqueStudentIds = [...new Set(studentIds)];

  const students = await User.find(buildStudentQuery(uniqueStudentIds, batchId)).lean();
  const studentMap = new Map();

  students.forEach((stu) => {
    const sid = normalize(stu.u_regno || stu.studentId || stu.student_id || stu.regNo);
    if (sid) {
      studentMap.set(sid, stu);
    }
  });

  const seen = new Set();
  const validRows = [];
  const invalidRows = [];

  rawRows.forEach((row, index) => {
    const rowNumber = index + 2;

    const studentId = normalize(
      getValue(row, ["student_id", "studentId", "sid", "SID", "Student ID", "STUDENT_ID"])
    );

    const marksRaw = getValue(row, ["marks", "mark", "score", "Marks", "MARKS"]);
    const marks = toNumber(marksRaw);

    if (!studentId) {
      invalidRows.push({ row: rowNumber, reason: "Student ID is missing" });
      return;
    }

    if (seen.has(studentId)) {
      invalidRows.push({ row: rowNumber, reason: `Duplicate student ID: ${studentId}` });
      return;
    }

    seen.add(studentId);

    if (marks === null) {
      invalidRows.push({ row: rowNumber, reason: `Invalid marks for student ${studentId}` });
      return;
    }

    if (marks < 0) {
      invalidRows.push({ row: rowNumber, reason: `Marks cannot be negative for ${studentId}` });
      return;
    }

    if (marks > maxMarks) {
      invalidRows.push({
        row: rowNumber,
        reason: `Marks ${marks} exceed maximum allowed ${maxMarks} for ${studentId}`,
      });
      return;
    }

    const student = studentMap.get(studentId);

    if (!student) {
      invalidRows.push({
        row: rowNumber,
        reason: `Student ID ${studentId} not found in the current batch`,
      });
      return;
    }

    validRows.push({
      studentId,
      studentName: normalize(student.u_name || student.name || student.fullName),
      marks,
      studentRef: student._id,
    });
  });

  return { validRows, invalidRows };
};

export const previewMarksUpload = async (req, res) => {
  try {
    const batchId = getBatchId(req.user);
    if (!batchId) {
      return res.status(400).json({ message: "Batch information not found for logged-in user." });
    }

    const { subjectName, subjectCode, assessmentName, maxMarks } = req.body;
    const parsedMaxMarks = toNumber(maxMarks);

    if (!subjectName || !subjectCode || !assessmentName || parsedMaxMarks === null) {
      return res.status(400).json({
        message: "Subject name, subject code, assessment name and max marks are required.",
      });
    }

    if (!req.file || !isAllowedFile(req.file)) {
      return res.status(400).json({ message: "Please upload a valid Excel/CSV file." });
    }

    const { validRows, invalidRows } = await parseAndValidateRows({
      file: req.file,
      maxMarks: parsedMaxMarks,
      batchId,
    });

    return res.json({
      message: "Preview generated successfully.",
      summary: {
        batchId,
        subjectName: normalize(subjectName),
        subjectCode: normalize(subjectCode),
        assessmentName: normalize(assessmentName),
        maxMarks: parsedMaxMarks,
        totalRows: validRows.length + invalidRows.length,
        validRows: validRows.length,
        invalidRows: invalidRows.length,
      },
      validRows,
      invalidRows,
    });
  } catch (error) {
    console.error("Preview marks upload error:", error);
    return res.status(500).json({
      message: "Failed to preview marks file.",
      error: error.message,
    });
  }
};

export const createMarksUpload = async (req, res) => {
  try {
    const batchId = getBatchId(req.user);
    if (!batchId) {
      return res.status(400).json({ message: "Batch information not found for logged-in user." });
    }

    const semester = getSemester(req.user, req.body);
    const { subjectName, subjectCode, assessmentName, maxMarks } = req.body;

    const parsedMaxMarks = toNumber(maxMarks);

    if (!subjectName || !subjectCode || !assessmentName || parsedMaxMarks === null) {
      return res.status(400).json({
        message: "Subject name, subject code, assessment name and max marks are required.",
      });
    }

    if (!req.file || !isAllowedFile(req.file)) {
      return res.status(400).json({ message: "Please upload a valid Excel/CSV file." });
    }

    const { validRows, invalidRows } = await parseAndValidateRows({
      file: req.file,
      maxMarks: parsedMaxMarks,
      batchId,
    });

    if (invalidRows.length > 0) {
      return res.status(400).json({
        message: "Fix the file errors before saving.",
        invalidRows,
      });
    }

    const filter = {
      batchId,
      semester,
      subjectCode: normalize(subjectCode),
      assessmentName: normalize(assessmentName),
    };

    const payload = {
      batchId,
      semester,
      subjectName: normalize(subjectName),
      subjectCode: normalize(subjectCode),
      assessmentName: normalize(assessmentName),
      maxMarks: parsedMaxMarks,
      uploadedBy: getUserId(req.user),
      uploadedByName: getUserName(req.user),
      rows: validRows,
    };

    const saved = await Marks.findOneAndUpdate(filter, { $set: payload }, { new: true, upsert: true });

    return res.status(201).json({
      message: "Marks uploaded successfully.",
      data: saved,
    });
  } catch (error) {
    console.error("Create marks upload error:", error);
    return res.status(500).json({
      message: "Failed to save marks.",
      error: error.message,
    });
  }
};

export const listMarks = async (req, res) => {
  try {
    const batchId = getBatchId(req.user);
    if (!batchId) {
      return res.status(400).json({ message: "Batch information not found for logged-in user." });
    }

    const semester = getSemester(req.user, req.body);
    const filter = semester ? { batchId, semester } : { batchId };

    const marks = await Marks.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const data = marks.map((item) => {
      const totalEntered = item.rows.reduce((sum, row) => sum + Number(row.marks || 0), 0);
      return {
        ...item,
        totalEntered,
        studentCount: item.rows.length,
      };
    });

    return res.json({ data });
  } catch (error) {
    console.error("List marks error:", error);
    return res.status(500).json({
      message: "Failed to load marks.",
      error: error.message,
    });
  }
};

export const getMarksById = async (req, res) => {
  try {
    const batchId = getBatchId(req.user);
    const item = await Marks.findOne({
      _id: req.params.id,
      batchId,
    }).lean();

    if (!item) {
      return res.status(404).json({ message: "Marks record not found." });
    }

    return res.json({ data: item });
  } catch (error) {
    console.error("Get marks by id error:", error);
    return res.status(500).json({
      message: "Failed to load marks record.",
      error: error.message,
    });
  }
};

export const updateMarksUpload = async (req, res) => {
  try {
    const batchId = getBatchId(req.user);
    if (!batchId) {
      return res.status(400).json({ message: "Batch information not found for logged-in user." });
    }

    const existing = await Marks.findOne({
      _id: req.params.id,
      batchId,
    });

    if (!existing) {
      return res.status(404).json({ message: "Marks record not found." });
    }

    const semester = getSemester(req.user, req.body) || existing.semester;
    const subjectName = req.body.subjectName ?? existing.subjectName;
    const subjectCode = req.body.subjectCode ?? existing.subjectCode;
    const assessmentName = req.body.assessmentName ?? existing.assessmentName;
    const maxMarksRaw = req.body.maxMarks ?? existing.maxMarks;
    const parsedMaxMarks = toNumber(maxMarksRaw);

    if (!subjectName || !subjectCode || !assessmentName || parsedMaxMarks === null) {
      return res.status(400).json({
        message: "Subject name, subject code, assessment name and max marks are required.",
      });
    }

    let rows = existing.rows;
    let invalidRows = [];

    if (req.file) {
      if (!isAllowedFile(req.file)) {
        return res.status(400).json({ message: "Please upload a valid Excel/CSV file." });
      }

      const parsed = await parseAndValidateRows({
        file: req.file,
        maxMarks: parsedMaxMarks,
        batchId,
      });

      rows = parsed.validRows;
      invalidRows = parsed.invalidRows;

      if (invalidRows.length > 0) {
        return res.status(400).json({
          message: "Fix the file errors before updating.",
          invalidRows,
        });
      }
    } else {
      const overLimit = rows.filter((row) => Number(row.marks) > parsedMaxMarks);
      if (overLimit.length > 0) {
        return res.status(400).json({
          message: "Existing marks exceed the new maximum marks. Upload a corrected file.",
          invalidRows: overLimit.map((row) => ({
            studentId: row.studentId,
            marks: row.marks,
          })),
        });
      }
    }

    existing.semester = semester;
    existing.subjectName = normalize(subjectName);
    existing.subjectCode = normalize(subjectCode);
    existing.assessmentName = normalize(assessmentName);
    existing.maxMarks = parsedMaxMarks;
    existing.uploadedBy = getUserId(req.user);
    existing.uploadedByName = getUserName(req.user);
    existing.rows = rows;

    await existing.save();

    return res.json({
      message: "Marks record updated successfully.",
      data: existing,
    });
  } catch (error) {
    console.error("Update marks error:", error);
    return res.status(500).json({
      message: "Failed to update marks.",
      error: error.message,
    });
  }
};

export const deleteMarksUpload = async (req, res) => {
  try {
    const batchId = getBatchId(req.user);

    const deleted = await Marks.findOneAndDelete({
      _id: req.params.id,
      batchId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Marks record not found." });
    }

    return res.json({ message: "Marks record deleted successfully." });
  } catch (error) {
    console.error("Delete marks error:", error);
    return res.status(500).json({
      message: "Failed to delete marks.",
      error: error.message,
    });
  }
};

export const getStudentMarks = async (req, res) => {
  try {
    const batchId = getBatchId(req.user);
    const studentId = normalize(
      req.user.u_regno || req.user.studentId || req.user.student_id || req.user.regNo
    );

    if (!batchId || !studentId) {
      return res.status(400).json({ message: "Student batch or student ID is missing." });
    }

    const items = await Marks.find({ batchId })
      .sort({ createdAt: -1 })
      .lean();

    const data = items
      .map((item) => {
        const row = item.rows.find((r) => normalize(r.studentId) === studentId);

        if (!row) return null;

        return {
          id: item._id,
          subjectName: item.subjectName,
          subjectCode: item.subjectCode,
          assessmentName: item.assessmentName,
          maxMarks: item.maxMarks,
          marks: row.marks,
          percentage: item.maxMarks
            ? ((Number(row.marks) / Number(item.maxMarks)) * 100).toFixed(2)
            : "0.00",
          semester: item.semester,
          uploadedByName: item.uploadedByName,
          createdAt: item.createdAt,
        };
      })
      .filter(Boolean);

    return res.json({ data });
  } catch (error) {
    console.error("Get student marks error:", error);
    return res.status(500).json({
      message: "Failed to load student marks.",
      error: error.message,
    });
  }
};

export const getStudentMarkById = async (req, res) => {
  try {
    const batchId = getBatchId(req.user);
    const studentId = normalize(
      req.user.u_regno || req.user.studentId || req.user.student_id || req.user.regNo
    );

    const item = await Marks.findOne({
      _id: req.params.id,
      batchId,
    }).lean();

    if (!item) {
      return res.status(404).json({ message: "Marks record not found." });
    }

    const row = item.rows.find((r) => normalize(r.studentId) === studentId);

    if (!row) {
      return res.status(404).json({ message: "Marks for this student were not found." });
    }

    return res.json({
      data: {
        id: item._id,
        subjectName: item.subjectName,
        subjectCode: item.subjectCode,
        assessmentName: item.assessmentName,
        maxMarks: item.maxMarks,
        marks: row.marks,
        percentage: item.maxMarks
          ? ((Number(row.marks) / Number(item.maxMarks)) * 100).toFixed(2)
          : "0.00",
        semester: item.semester,
        uploadedByName: item.uploadedByName,
        createdAt: item.createdAt,
      },
    });
  } catch (error) {
    console.error("Get student mark by id error:", error);
    return res.status(500).json({
      message: "Failed to load student mark.",
      error: error.message,
    });
  }
};