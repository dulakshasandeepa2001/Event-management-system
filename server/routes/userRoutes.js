import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getUsers, updateUserRole } from "../controllers/userController.js";

const router = express.Router();

router.use(protect);

router.get("/", getUsers);
router.patch("/:id/role", updateUserRole);

export default router;