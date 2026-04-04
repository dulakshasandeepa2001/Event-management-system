import User from "../models/User.js";
import Rep from "../models/Rep.js";

const allowedRoles = ["admin", "student", "batchrep", "lecturer"];

const isAdminUser = (user) => user && user.u_role === "admin";

const serializeUser = (user) => ({
  id: user._id,
  accountType: "user",
  u_name: user.u_name,
  u_email: user.u_email,
  u_role: user.u_role || "student",
  isBatchRep: !!user.isBatchRep,
  u_regno: user.u_regno || null,
  u_faculty: user.u_faculty || null,
  u_course: user.u_course || null,
  u_year: user.u_year ?? null,
  u_semester: user.u_semester ?? null,
  u_isActive: user.u_isActive ?? true,
  u_manualInactive: !!user.u_manualInactive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const serializeRep = (rep) => ({
  id: rep._id,
  accountType: "rep",
  u_name: rep.r_name,
  u_email: rep.r_email,
  u_role: rep.r_role || "batchrep",
  isBatchRep: true,
  u_regno: null,
  u_faculty: null,
  u_course: null,
  u_year: null,
  u_semester: null,
  u_isActive: true,
  u_manualInactive: false,
  createdAt: rep.createdAt,
  updatedAt: rep.updatedAt,
});

const buildUserQuery = (role, search) => {
  const query = {};

  if (role && role !== "all") {
    query.u_role = role;
  }

  if (search) {
    query.$or = [
      { u_name: { $regex: search, $options: "i" } },
      { u_email: { $regex: search, $options: "i" } },
      { u_regno: { $regex: search, $options: "i" } },
    ];
  }

  return query;
};

const buildRepQuery = (role, search) => {
  if (role && role !== "all" && role !== "batchrep") {
    return null;
  }

  const query = {};

  if (search) {
    query.$or = [
      { r_name: { $regex: search, $options: "i" } },
      { r_email: { $regex: search, $options: "i" } },
    ];
  }

  return query;
};

export const getUsers = async (req, res) => {
  try {
    if (!isAdminUser(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const role = String(req.query.role || "all").toLowerCase();
    const accountType = String(req.query.accountType || "all").toLowerCase();
    const search = String(req.query.search || "").trim();
    const limit = Math.max(1, Number.parseInt(req.query.limit || "500", 10) || 500);
    const skip = Math.max(0, Number.parseInt(req.query.skip || "0", 10) || 0);

    const userQuery = accountType === "rep" ? null : buildUserQuery(role, search);
    const repQuery = accountType === "user" ? null : buildRepQuery(role, search);

    const [userDocs, repDocs, totalUsers, activeUsers, adminCount, studentCount, lecturerCount, userBatchRepCount, legacyBatchRepCount] = await Promise.all([
      userQuery ? User.find(userQuery).select("-u_password").sort({ createdAt: -1 }).lean() : Promise.resolve([]),
      repQuery ? Rep.find(repQuery).select("-r_password").sort({ createdAt: -1 }).lean() : Promise.resolve([]),
      User.countDocuments(),
      User.countDocuments({ u_isActive: true }),
      User.countDocuments({ u_role: "admin" }),
      User.countDocuments({ u_role: "student" }),
      User.countDocuments({ u_role: "lecturer" }),
      User.countDocuments({ u_role: "batchrep" }),
      Rep.countDocuments(),
    ]);

    const accounts = [
      ...userDocs.map(serializeUser),
      ...repDocs.map(serializeRep),
    ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const totalCount = accounts.length;
    const pagedAccounts = accounts.slice(skip, skip + limit);

    return res.status(200).json({
      users: pagedAccounts,
      pagination: {
        total: totalCount,
        limit,
        skip,
        pages: Math.ceil(totalCount / limit),
      },
      summary: {
        totalAccounts: totalUsers + legacyBatchRepCount,
        activeAccounts: activeUsers + legacyBatchRepCount,
        admins: adminCount,
        students: studentCount,
        lecturers: lecturerCount,
        batchreps: userBatchRepCount + legacyBatchRepCount,
        userAccounts: totalUsers,
        legacyBatchReps: legacyBatchRepCount,
      },
    });
  } catch (err) {
    console.error("getUsers error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    if (!isAdminUser(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    const requestedRole = String(req.body.u_role || "").trim().toLowerCase();

    if (!allowedRoles.includes(requestedRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(id);

    if (!user) {
      const rep = await Rep.findById(id);
      if (rep) {
        return res.status(400).json({ message: "Legacy batch rep accounts are read only" });
      }

      return res.status(404).json({ message: "User not found" });
    }

    if (req.user._id.toString() === id && requestedRole !== "admin") {
      return res.status(400).json({ message: "You cannot change your own role away from admin" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          u_role: requestedRole,
          isBatchRep: requestedRole === "batchrep",
        },
      },
      { new: true, runValidators: true }
    ).select("-u_password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: requestedRole === "batchrep" ? "Student promoted to batch rep" : "User role updated",
      user: serializeUser(updatedUser),
    });
  } catch (err) {
    console.error("updateUserRole error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};