import Deadline from "../models/Deadline.js";

const canManageDeadlines = (user) => {
  if (!user) return false;
  return user.u_role === "admin" || user.u_role === "batchrep" || user.u_role === "lecturer" || !!user.isBatchRep;
};

const isValidFutureOrTodayDate = (rawDate) => {
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = new Date(parsed);
  selected.setHours(0, 0, 0, 0);

  return selected.getTime() >= today.getTime();
};

const normalizeDeadlinePayload = (payload) => {
  return {
    d_title: (payload.d_title || "").trim(),
    d_subject: (payload.d_subject || "").trim(),
    d_description: (payload.d_description || "").trim(),
    d_year: payload.d_year !== undefined ? Number(payload.d_year) : undefined,
    d_semester: payload.d_semester !== undefined ? Number(payload.d_semester) : undefined,
    d_course: (payload.d_course || "").trim(),
    d_dueDate: payload.d_dueDate,
  };
};

const validateDeadlinePayload = (payload, { partial = false } = {}) => {
  const normalized = normalizeDeadlinePayload(payload);

  if (!partial || payload.d_title !== undefined) {
    if (!normalized.d_title || normalized.d_title.length < 3 || normalized.d_title.length > 120) {
      return "Deadline title must be between 3 and 120 characters";
    }
  }

  if (!partial || payload.d_subject !== undefined) {
    if (!normalized.d_subject || normalized.d_subject.length < 2 || normalized.d_subject.length > 80) {
      return "Subject must be between 2 and 80 characters";
    }
  }

  if (!partial || payload.d_year !== undefined) {
    if (!Number.isInteger(normalized.d_year) || normalized.d_year < 1 || normalized.d_year > 4) {
      return "Year must be between 1 and 4";
    }
  }

  if (!partial || payload.d_semester !== undefined) {
    if (!Number.isInteger(normalized.d_semester) || normalized.d_semester < 1 || normalized.d_semester > 2) {
      return "Semester must be 1 or 2";
    }
  }

  if (!partial || payload.d_dueDate !== undefined) {
    if (!normalized.d_dueDate || !isValidFutureOrTodayDate(normalized.d_dueDate)) {
      return "Due date must be today or a future date";
    }
  }

  if (normalized.d_description.length > 1000) {
    return "Description must be 1000 characters or fewer";
  }

  if (normalized.d_course.length > 100) {
    return "Course must be 100 characters or fewer";
  }

  return null;
};

export const createDeadline = async (req, res) => {
  try {
    if (!canManageDeadlines(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const validationError = validateDeadlinePayload(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const normalized = normalizeDeadlinePayload(req.body);

    const deadline = await Deadline.create({
      d_title: normalized.d_title,
      d_subject: normalized.d_subject,
      d_description: normalized.d_description,
      d_year: normalized.d_year,
      d_semester: normalized.d_semester,
      d_course: normalized.d_course,
      d_dueDate: normalized.d_dueDate,
      createdBy: req.user._id,
      createdByModel: req.user.sourceModel || "User",
    });

    return res.status(201).json({ deadline });
  } catch (err) {
    console.error("createDeadline error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getDeadlines = async (req, res) => {
  try {
    if (!canManageDeadlines(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { year, semester, subject } = req.query;
    const filter = {};

    if (year) filter.d_year = Number(year);
    if (semester) filter.d_semester = Number(semester);
    if (subject) filter.d_subject = { $regex: subject, $options: "i" };

    const deadlines = await Deadline.find(filter).sort({ d_dueDate: 1, createdAt: -1 }).lean();
    return res.status(200).json({ deadlines });
  } catch (err) {
    console.error("getDeadlines error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateDeadline = async (req, res) => {
  try {
    if (!canManageDeadlines(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    const validationError = validateDeadlinePayload(req.body, { partial: true });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const normalized = normalizeDeadlinePayload(req.body);
    const payload = {};

    if (req.body.d_title !== undefined) payload.d_title = normalized.d_title;
    if (req.body.d_subject !== undefined) payload.d_subject = normalized.d_subject;
    if (req.body.d_description !== undefined) payload.d_description = normalized.d_description;
    if (req.body.d_year !== undefined) payload.d_year = normalized.d_year;
    if (req.body.d_semester !== undefined) payload.d_semester = normalized.d_semester;
    if (req.body.d_course !== undefined) payload.d_course = normalized.d_course;
    if (req.body.d_dueDate !== undefined) payload.d_dueDate = normalized.d_dueDate;

    const deadline = await Deadline.findByIdAndUpdate(id, { $set: payload }, { new: true, runValidators: true });

    if (!deadline) return res.status(404).json({ message: "Deadline not found" });

    return res.status(200).json({ deadline });
  } catch (err) {
    console.error("updateDeadline error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteDeadline = async (req, res) => {
  try {
    if (!canManageDeadlines(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    const deadline = await Deadline.findByIdAndDelete(id);

    if (!deadline) return res.status(404).json({ message: "Deadline not found" });

    return res.status(200).json({ message: "Deadline deleted" });
  } catch (err) {
    console.error("deleteDeadline error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getStudentDeadlines = async (req, res) => {
  try {
    if (!req.user || req.user.u_role !== "student") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const studentYear = Number(req.user.u_year || 1);
    const studentSemester = Number(req.user.u_semester || 1);
    const studentCourse = (req.user.u_course || "").trim();

    const courseFilter = studentCourse
      ? [{ d_course: { $exists: false } }, { d_course: "" }, { d_course: studentCourse }]
      : [{ d_course: { $exists: false } }, { d_course: "" }];

    const deadlines = await Deadline.find({
      d_year: studentYear,
      d_semester: studentSemester,
      $or: courseFilter,
    })
      .sort({ d_dueDate: 1 })
      .lean();

    return res.status(200).json({ deadlines });
  } catch (err) {
    console.error("getStudentDeadlines error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};
