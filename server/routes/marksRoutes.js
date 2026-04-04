import express from "express";
import multer from "multer";
import {
  previewMarksUpload,
  createMarksUpload,
  listMarks,
  getMarksById,
  updateMarksUpload,
  deleteMarksUpload,
  getStudentMarks,
  getStudentMarkById,
} from "../controllers/marksController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post("/preview", protect, upload.single("file"), previewMarksUpload);
router.post("/", protect, upload.single("file"), createMarksUpload);

router.get("/student", protect, getStudentMarks);
router.get("/student/:id", protect, getStudentMarkById);

router.get("/", protect, listMarks);
router.get("/:id", protect, getMarksById);
router.put("/:id", protect, upload.single("file"), updateMarksUpload);
router.delete("/:id", protect, deleteMarksUpload);

export default router;