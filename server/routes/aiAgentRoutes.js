import express from 'express';
import { sendAgentMessage } from '../controllers/aiAgentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Agent endpoint - enables AI to execute commands
router.post('/agent', protect, sendAgentMessage);

export default router;
