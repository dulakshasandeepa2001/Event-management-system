import express from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Everyone logged in can see events (filtered by role inside controller)
router.get("/", protect, getEvents);
router.get("/:id", protect, getEventById);

// Only batchrep/admin can manage
router.post("/", protect, createEvent);
router.put("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);

export default router;