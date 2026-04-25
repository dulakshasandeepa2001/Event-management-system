import express from "express";
import {
  getBatchActivitySnapshot,
  getMonthlyEventTrend,
  getEngagementScore,
  getEventsByCategory,
  getWeeklyAttendanceTrend,
  getDashboardMetrics,
} from "../controllers/dashboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// Individual endpoints for specific metrics
router.get("/snapshot", getBatchActivitySnapshot);
router.get("/monthly-trend", getMonthlyEventTrend);
router.get("/engagement-score", getEngagementScore);
router.get("/events-by-category", getEventsByCategory);
router.get("/weekly-attendance", getWeeklyAttendanceTrend);

// Combined endpoint to get all metrics at once
router.get("/", getDashboardMetrics);

export default router;
