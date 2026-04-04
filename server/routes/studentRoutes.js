import express from "express";
<<<<<<< HEAD
import { getAllStudents, getStudentById, setStudentManualInactive } from "../controllers/studentController.js";
=======
import { getAllStudents, getStudentById, getStudentsByBatch, setStudentManualInactive } from "../controllers/studentController.js";
>>>>>>> ra_new_part
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// protect all student routes (we check specific permissions inside controller)
router.use(protect);

router.get("/", getAllStudents);
<<<<<<< HEAD
=======
router.get("/batch/:batchId", getStudentsByBatch);
>>>>>>> ra_new_part
router.get("/:id", getStudentById);

router.patch("/:id/manual-deactivate", protect, setStudentManualInactive);

export default router;