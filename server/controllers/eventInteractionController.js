import Event from "../models/Event.js";
import User from "../models/User.js";
import EventRegistration from "../models/EventRegistration.js";
import EventComment from "../models/EventComment.js";
import EventRating from "../models/EventRating.js";

const getUserId = (user) => user?.id || user?._id?.toString() || "";

const getUserBatchId = (userDoc) => {
  return (
    userDoc?.u_batchId?.toString() ||
    userDoc?.batchId?.toString() ||
    userDoc?.u_batch?.toString() ||
    userDoc?.batch?.toString() ||
    ""
  );
};

const getCurrentUser = async (req) => {
  const userId = getUserId(req.user);
  if (!userId) return null;
  return User.findById(userId).lean();
};

const canViewEvent = (user, event) => {
  if (!user) {
    return { ok: false, status: 404, message: "User not found" };
  }

  if (user.u_role === "admin") {
    return { ok: true };
  }

  if (user.u_role === "lecturer") {
    return { ok: true };
  }

  if (user.u_role === "student" || user.u_role === "batchrep") {
    const myBatchId = getUserBatchId(user);
    const eventBatchId = event.batch?._id?.toString() || event.batch?.toString();

    if (!myBatchId || String(myBatchId) !== String(eventBatchId)) {
      return { ok: false, status: 403, message: "Not allowed to view this event" };
    }
  }

  return { ok: true };
};

const canParticipate = (user, event) => {
  if (!user) {
    return { ok: false, status: 404, message: "User not found" };
  }

  if (!["student", "batchrep"].includes(user.u_role)) {
    return { ok: false, status: 403, message: "Only students can participate" };
  }

  const myBatchId = getUserBatchId(user);
  const eventBatchId = event.batch?._id?.toString() || event.batch?.toString();

  if (!myBatchId || String(myBatchId) !== String(eventBatchId)) {
    return { ok: false, status: 403, message: "Event not related to your batch" };
  }

  return { ok: true };
};

export const getEventDetails = async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const event = await Event.findById(req.params.id)
      .populate("batch", "name intakeYear course batchCode groups")
      .populate("createdBy", "u_name u_email u_role")
      .populate("updatedBy", "u_name u_email u_role");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const viewCheck = canViewEvent(user, event);
    if (!viewCheck.ok) {
      return res.status(viewCheck.status).json({ message: viewCheck.message });
    }

    const registration = await EventRegistration.findOne({
      event: event._id,
      user: user._id,
    }).lean();

    const comments = await EventComment.find({ event: event._id })
      .populate("user", "u_name u_regno u_course u_batchCode")
      .sort({ createdAt: -1 })
      .lean();

    const ratings = await EventRating.find({ event: event._id }).lean();

    const myComment = await EventComment.findOne({
      event: event._id,
      user: user._id,
    }).lean();

    const myRating = await EventRating.findOne({
      event: event._id,
      user: user._id,
    }).lean();

    const ratingCount = ratings.length;
    const ratingAverage =
      ratingCount > 0
        ? ratings.reduce((sum, item) => sum + Number(item.rating || 0), 0) / ratingCount
        : 0;

    const response = {
      event,
      registrationStatus: registration?.status || "not_registered",
      isRegistered: registration?.status === "registered",
      commentCount: comments.length,
      ratingSummary: {
        count: ratingCount,
        average: Number(ratingAverage.toFixed(1)),
      },
      comments,
      myComment: myComment || null,
      myRating: myRating?.rating || null,
    };

    if (user.u_role === "admin" || user.u_role === "batchrep" || user.u_role === "lecturer") {
      const registrations = await EventRegistration.find({ event: event._id })
        .populate("user", "u_name u_regno u_course u_batchCode u_batchId u_role")
        .sort({ createdAt: -1 })
        .lean();

      response.registrations = registrations;
      response.registeredStudents = registrations.filter((r) => r.status === "registered");
      response.cancelledStudents = registrations.filter((r) => r.status === "cancelled");
    }

    return res.status(200).json(response);
  } catch (err) {
    console.error("getEventDetails error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const registerForEvent = async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const event = await Event.findById(req.params.id).lean();
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const check = canParticipate(user, event);
    if (!check.ok) {
      return res.status(check.status).json({ message: check.message });
    }

    if (event.status === "Cancelled") {
      return res.status(400).json({ message: "This event is cancelled" });
    }

    const saved = await EventRegistration.findOneAndUpdate(
      { event: event._id, user: user._id },
      {
        status: "registered",
        registeredAt: new Date(),
        cancelledAt: null,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      message: "Registered for event successfully",
      registration: saved,
    });
  } catch (err) {
    console.error("registerForEvent error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const unregisterFromEvent = async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const event = await Event.findById(req.params.id).lean();
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const check = canParticipate(user, event);
    if (!check.ok) {
      return res.status(check.status).json({ message: check.message });
    }

    const { reason, note } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Reason is required" });
    }

    const validReasons = [
      "Schedule conflict",
      "Not interested",
      "Personal reason",
      "Health issue",
      "Other",
    ];

    if (!validReasons.includes(reason)) {
      return res.status(400).json({ message: "Invalid reason" });
    }

    const existing = await EventRegistration.findOne({
      event: event._id,
      user: user._id,
    });

    if (!existing || existing.status !== "registered") {
      return res.status(400).json({ message: "You are not registered for this event" });
    }

    existing.status = "cancelled";
    existing.cancelledAt = new Date();
    existing.reason = reason;
    existing.note = note || "";
    await existing.save();

    return res.status(200).json({
      message: "Unregistered from event successfully",
      registration: existing,
    });
  } catch (err) {
    console.error("unregisterFromEvent error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const addEventComment = async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const event = await Event.findById(req.params.id).lean();
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const check = canParticipate(user, event);
    if (!check.ok) {
      return res.status(check.status).json({ message: check.message });
    }

    const registered = await EventRegistration.findOne({
      event: event._id,
      user: user._id,
      status: "registered",
    });

    if (!registered) {
      return res.status(403).json({
        message: "Only registered students can comment on this event",
      });
    }

    const { comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "Comment is required" });
    }

    const saved = await EventComment.findOneAndUpdate(
      { event: event._id, user: user._id },
      { comment: comment.trim() },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    ).populate("user", "u_name u_regno u_course u_batchCode");

    return res.status(201).json({
      message: "Comment saved successfully",
      comment: saved,
    });
  } catch (err) {
    console.error("addEventComment error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const addEventRating = async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const event = await Event.findById(req.params.id).lean();
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const check = canParticipate(user, event);
    if (!check.ok) {
      return res.status(check.status).json({ message: check.message });
    }

    const registered = await EventRegistration.findOne({
      event: event._id,
      user: user._id,
      status: "registered",
    });

    if (!registered) {
      return res.status(403).json({
        message: "Only registered students can rate this event",
      });
    }

    const rating = Number(req.body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const saved = await EventRating.findOneAndUpdate(
      { event: event._id, user: user._id },
      { rating },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(201).json({
      message: "Rating saved successfully",
      rating: saved,
    });
  } catch (err) {
    console.error("addEventRating error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};