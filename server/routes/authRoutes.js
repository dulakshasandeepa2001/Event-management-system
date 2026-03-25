import express from "express"
import { login, getProfile,signin} from '../controllers/authController.js'
import { protect } from "../middleware/authMiddleware.js"


const router=express.Router()


router.post("/login", login);
router.post("/signin", signin);
router.post("/register", signin);  // Register endpoint (same as signin)

// Protected route
router.get("/profile", protect, getProfile);

export default router;