import express from "express";
import { getAllStudents, getStudentById } from "../controllers/studentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// protect all student routes (we check specific permissions inside controller)
router.use(protect);

router.get("/", getAllStudents);
router.get("/:id", getStudentById);

export default router;