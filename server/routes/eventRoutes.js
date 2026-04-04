import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";

import {
  getEventDetails,
  registerForEvent,
  unregisterFromEvent,
  addEventComment,
  addEventRating,
} from "../controllers/eventInteractionController.js";

const router = express.Router();

// Everyone logged in can see events (filtered by role inside controller)
router.get("/", protect, getEvents);

router.get("/:id/details", protect, getEventDetails);
router.post("/:id/register", protect, registerForEvent);
router.post("/:id/unregister", protect, unregisterFromEvent);
router.post("/:id/comments", protect, addEventComment);
router.post("/:id/ratings", protect, addEventRating);


router.get("/:id", protect, getEventById);

// Only batchrep/admin can manage
router.post("/", protect, createEvent);
router.put("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);

export default router;