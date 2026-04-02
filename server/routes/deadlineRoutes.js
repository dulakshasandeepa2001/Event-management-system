import express from "express";
import {
  createDeadline,
  deleteDeadline,
  getDeadlines,
  getStudentDeadlines,
  updateDeadline,
} from "../controllers/deadlineController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/student/my", getStudentDeadlines);
router.get("/", getDeadlines);
router.post("/", createDeadline);
router.put("/:id", updateDeadline);
router.delete("/:id", deleteDeadline);

export default router;
