import express from 'express';
import { sendChatMessage, clearConversation } from '../controllers/chatbotController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Chat endpoint - requires authentication
router.post('/chat', protect, sendChatMessage);

// Clear conversation endpoint
router.post('/clear', protect, clearConversation);

export default router;
