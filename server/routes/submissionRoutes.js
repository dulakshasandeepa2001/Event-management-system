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
  getStudentNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/submissionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/student/my", getStudentSubmissions);
router.get("/student/uploads/my", getStudentSubmissionUploads);
router.get("/student/notifications", getStudentNotifications);
router.post("/student/notifications/read-all", markAllNotificationsAsRead);
router.post("/:id/open", markSubmissionOpened);
router.post("/:id/upload", submissionUploadMiddleware, uploadStudentSubmission);
router.post("/notifications/:id/read", markNotificationAsRead);
router.get("/:id/engagement", getSubmissionEngagementDetails);
router.get("/", getSubmissions);
router.post("/", createSubmission);
router.put("/:id", updateSubmission);
router.delete("/:id", deleteSubmission);

export default router;
