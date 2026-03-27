import express from "express";
import {
  createSubmission,
  deleteSubmission,
  getSubmissionEngagementDetails,
  getStudentSubmissions,
  getStudentSubmissionUploads,
  getSubmissions,
  markSubmissionOpened,
  submissionUploadMiddleware,
  uploadStudentSubmission,
  updateSubmission,
} from "../controllers/submissionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/student/my", getStudentSubmissions);
router.get("/student/uploads/my", getStudentSubmissionUploads);
router.post("/:id/open", markSubmissionOpened);
router.post("/:id/upload", submissionUploadMiddleware, uploadStudentSubmission);
router.get("/:id/engagement", getSubmissionEngagementDetails);
router.get("/", getSubmissions);
router.post("/", createSubmission);
router.put("/:id", updateSubmission);
router.delete("/:id", deleteSubmission);

export default router;
