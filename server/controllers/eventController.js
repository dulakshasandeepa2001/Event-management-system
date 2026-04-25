import Event from "../models/Event.js";
import Batch from "../models/Batch.js";
import User from "../models/User.js";
import Rep from "../models/Rep.js";

const getUserBatchId = (userDoc) => {
  return (
    userDoc?.u_batchId?.toString() ||
    userDoc?.batchId?.toString() ||
    userDoc?.u_batch?.toString() ||
    userDoc?.batch?.toString() ||
    userDoc?.assignedBatch?.toString() ||
    ""
  );
};

const getRequestAccountId = (user) => user?.id || user?._id?.toString() || user?._id || "";

const normalizeRepAccount = (rep) => {
  if (!rep) return null;

  return {
    ...rep,
    _id: rep._id,
    id: rep._id,
    u_name: rep.r_name,
    u_email: rep.r_email,
    u_role: rep.r_role || "batchrep",
    isBatchRep: true,
    sourceModel: "Rep",
  };
};

const getCurrentAccount = async (reqUser) => {
  const accountId = getRequestAccountId(reqUser);
  if (!accountId) return null;

  if (reqUser?.sourceModel === "Rep" || reqUser?.isBatchRep) {
    const rep = await Rep.findById(accountId).lean();
    if (rep) return normalizeRepAccount(rep);
  }

  const user = await User.findById(accountId).lean();
  if (user) return { ...user, sourceModel: "User" };

  const rep = await Rep.findById(accountId).lean();
  if (rep) return normalizeRepAccount(rep);

  return null;
};

const normalizeTargetGroups = (targetGroups) => {
  if (!targetGroups) return [];
  if (Array.isArray(targetGroups)) return targetGroups.filter(Boolean);

  if (typeof targetGroups === "string") {
    const trimmed = targetGroups.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch (e) {
      // ignore JSON parse error and fall back to comma split
    }
    return trimmed
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean);
  }

  return [];
};

const canManageEvent = async (reqUser, eventBatchId = null) => {
  const me = await getCurrentAccount(reqUser);
  if (!me) return { ok: false, status: 404, message: "User not found" };

  if (me.u_role === "admin") {
    return { ok: true, me };
  }

  if (me.u_role === "batchrep") {
    const myBatchId = getUserBatchId(me);
    if (!myBatchId) {
      return { ok: true, me }; // fallback if batch relation is not stored yet
    }

    if (eventBatchId && myBatchId !== eventBatchId.toString()) {
      return {
        ok: false,
        status: 403,
        message: "You can only manage events for your own batch",
      };
    }

    return { ok: true, me, myBatchId };
  }

  return {
    ok: false,
    status: 403,
    message: "You are not allowed to manage events",
  };
};

export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      eventDate,
      startTime,
      endTime,
      location,
      batchId,
      targetGroups,
      status,
    } = req.body;

    if (!title || !description || !eventDate || !batchId) {
      return res.status(400).json({
        message: "Title, description, event date and batch are required",
      });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    const access = await canManageEvent(req.user, batchId);
    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
    }

    const me = access.me;

    const event = await Event.create({
      title,
      description,
      category: category || "Academic",
      eventDate,
      startTime: startTime || "",
      endTime: endTime || "",
      location: location || "",
      batch: batchId,
      targetGroups: normalizeTargetGroups(targetGroups),
      status: status || "Upcoming",
      createdBy: me._id,
      updatedBy: me._id,
    });

    const populated = await Event.findById(event._id)
      .populate("batch", "name intakeYear course batchCode")
      .populate("createdBy", "u_name u_email u_role");

    return res.status(201).json({
      message: "Event created successfully",
      event: populated,
    });
  } catch (err) {
    console.error("createEvent error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getEvents = async (req, res) => {
  try {
    const user = await getCurrentAccount(req.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const role = user.u_role;
    const myBatchId = getUserBatchId(user);

    const {
      batchId,
      category,
      status,
      search = "",
    } = req.query;

    const filter = {};

    // role-based visibility
    if (role === "student" || role === "batchrep") {
      if (myBatchId) filter.batch = myBatchId;
    } else if (role === "admin" || role === "lecturer") {
      if (batchId) filter.batch = batchId;
    }

    // extra filters
    if (category) filter.category = category;
    if (status) filter.status = status;

    if (search && String(search).trim()) {
      filter.title = { $regex: search.trim(), $options: "i" };
    }

    const events = await Event.find(filter)
      .populate("batch", "name intakeYear course batchCode")
      .populate("createdBy", "u_name u_email u_role")
      .sort({ eventDate: 1, createdAt: -1 });

    return res.status(200).json({ events });
  } catch (err) {
    console.error("getEvents error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("batch", "name intakeYear course batchCode")
      .populate("createdBy", "u_name u_email u_role");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const access = await canManageEvent(req.user, event.batch?._id || event.batch);
    const user = await getCurrentAccount(req.user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.u_role === "student") {
      const myBatchId = getUserBatchId(user);
      if (myBatchId && myBatchId !== event.batch?._id?.toString() && myBatchId !== event.batch?.toString()) {
        return res.status(403).json({ message: "Not allowed to view this event" });
      }
    }

    if (user.u_role === "batchrep") {
      const myBatchId = getUserBatchId(user);
      if (myBatchId && myBatchId !== event.batch?._id?.toString() && myBatchId !== event.batch?.toString()) {
        return res.status(403).json({ message: "Not allowed to view this event" });
      }
    }

    if (!access.ok && user.u_role === "admin") {
      // admin is allowed anyway
    }

    return res.status(200).json({ event });
  } catch (err) {
    console.error("getEventById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const access = await canManageEvent(req.user, event.batch);
    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
    }

    const {
      title,
      description,
      category,
      eventDate,
      startTime,
      endTime,
      location,
      batchId,
      targetGroups,
      status,
    } = req.body;

    if (batchId && access.me.u_role !== "admin") {
      const myBatchId = getUserBatchId(access.me);
      if (myBatchId && myBatchId !== batchId) {
        return res.status(403).json({
          message: "You can only move events inside your own batch",
        });
      }
    }

    if (batchId) {
      const batch = await Batch.findById(batchId);
      if (!batch) {
        return res.status(404).json({ message: "Batch not found" });
      }
      event.batch = batchId;
    }

    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (category !== undefined) event.category = category;
    if (eventDate !== undefined) event.eventDate = eventDate;
    if (startTime !== undefined) event.startTime = startTime;
    if (endTime !== undefined) event.endTime = endTime;
    if (location !== undefined) event.location = location;
    if (targetGroups !== undefined) event.targetGroups = normalizeTargetGroups(targetGroups);
    if (status !== undefined) event.status = status;

    event.updatedBy = access.me._id;
    await event.save();

    const populated = await Event.findById(event._id)
      .populate("batch", "name intakeYear course batchCode")
      .populate("createdBy", "u_name u_email u_role");

    return res.status(200).json({
      message: "Event updated successfully",
      event: populated,
    });
  } catch (err) {
    console.error("updateEvent error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const access = await canManageEvent(req.user, event.batch);
    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
    }

    await Event.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Event deleted successfully",
    });
  } catch (err) {
    console.error("deleteEvent error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};