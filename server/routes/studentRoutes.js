import express from "express";
import { getAllStudents, getStudentById, getStudentsByBatch, setStudentManualInactive } from "../controllers/studentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// protect all student routes (we check specific permissions inside controller)
router.use(protect);

router.get("/", getAllStudents);
router.get("/batch/:batchId", getStudentsByBatch);
router.get("/:id", getStudentById);

router.patch("/:id/manual-deactivate", protect, setStudentManualInactive);

export default router;