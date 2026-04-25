# OpenClaw AI Chatbot Integration Guide

## Overview
The Event Management System now includes an AI-powered chatbot integrated with your local OpenClaw service. The chatbot helps users with questions about submissions, deadlines, exam results, events, and platform navigation.

## Architecture

### Components Added:
1. **Backend Controller**: `server/controllers/chatbotController.js`
   - Handles chat messages via `/api/chatbot/chat` endpoint
   - Maintains conversation history for context
   - Connects to local LLM service (OpenClaw or compatible)
   - Falls back to keyword-matching responses if service unavailable

2. **Backend Route**: `server/routes/chatbotRoutes.js`
   - POST `/api/chatbot/chat` - Send message and get AI response
   - POST `/api/chatbot/clear` - Clear conversation history

3. **Frontend Component**: `frontend/src/components/AIChatWidget.jsx` (updated)
   - Real-time AI chat interface
   - Conversation history management
   - Auto-scroll to latest messages
   - Loading indicator while waiting for response
   - Quick prompt buttons for common questions

## Setup Instructions

### Step 1: Ensure OpenClaw is Running
```bash
openclaw gateway
# Should show: "ready (6 plugins: ...)"
# MCP loopback server listening on http://127.0.0.1:49252/mcp
```

### Step 2: Configure Local LLM Endpoint
You have two options:

#### Option A: Using OpenClaw with Local LLM (Recommended)
Edit `server/.env`:
```env
OPENAI_API_ENDPOINT=http://localhost:8000/v1
LOCAL_AI_ENDPOINT=http://127.0.0.1:49252/mcp
```

#### Option B: Using LM Studio (Alternative)
1. Download LM Studio from https://lmstudio.ai/
2. Start LM Studio and load a model
3. Edit `server/.env`:
```env
OPENAI_API_ENDPOINT=http://localhost:1234/v1
```

#### Option C: Using Ollama (Alternative)
1. Install Ollama from https://ollama.ai/
2. Start: `ollama serve`
3. Pull a model: `ollama pull mistral`
4. Edit `server/.env`:
```env
OPENAI_API_ENDPOINT=http://localhost:11434/v1
```

### Step 3: Install Dependencies (if needed)
```bash
cd server
npm install axios  # Already in dependencies for API calls
cd ../frontend
npm install  # Already has required dependencies
```

### Step 4: Start the Application
```bash
# Terminal 1: Start MongoDB (if not running)
mongosh

# Terminal 2: Start Backend
cd server
npm start
# Should show: Server running on http://localhost:5001

# Terminal 3: Start Frontend
cd frontend
npm run dev
# Should show: http://localhost:5173
```

### Step 5: Test the Chatbot
1. Open the app at http://localhost:5173
2. Login with a student/batchrep account
3. Click the chatbot button (bottom-right corner) with comment icon
4. Try a quick prompt or type a message
5. You should see the AI response after a few seconds

## API Endpoints

### Send Chat Message
```
POST /api/chatbot/chat
Headers:
  Authorization: Bearer {token}
  Content-Type: application/json

Body:
{
  "message": "How do I upload a submission?",
  "conversationHistory": [
    {"role": "assistant", "content": "Hello!"},
    {"role": "user", "content": "Hi there"}
  ]
}

Response:
{
  "message": "You can upload submissions from...",
  "conversationHistory": [...],
  "usingFallback": false
}
```

### Clear Conversation
```
POST /api/chatbot/clear
Headers:
  Authorization: Bearer {token}

Response:
{
  "message": "Conversation cleared",
  "conversationHistory": []
}
```

## Fallback Mode
If the local LLM service is unavailable:
- Chatbot enters fallback mode
- Uses keyword-matching to provide helpful responses
- Response will include `"usingFallback": true`
- Common keywords: "submit", "deadline", "result", "marks", "exam", "event"

## System Prompt
The chatbot is configured with this system prompt:
```
You are a helpful AI assistant for the Event Management System. You help users with:
- Event registration and management
- Submission deadlines and uploads
- Exam results and marks
- Student notifications and notices
- Dashboard navigation and features
- General platform questions

Be concise, friendly, and provide actionable help.
```

## Features

### Conversation Context
- Last 6 messages kept for context
- Helps AI understand follow-up questions
- User/assistant roles properly tracked

### Real-time Updates
- Loading indicator ("Thinking...") while processing
- Auto-scroll to latest message
- Quick prompt buttons for common questions

### Security
- Authentication required (JWT token)
- Only logged-in users can use chatbot
- Messages not stored persistently (session-only)

## Troubleshooting

### "Failed to process chat message"
1. Check if backend server is running: `npm start` in `server/` folder
2. Verify MongoDB connection in terminal
3. Check browser console for errors

### AI not responding / Timeout
1. Verify local LLM service is running
   - For LM Studio: Check http://localhost:1234/health
   - For Ollama: Check http://localhost:11434/api/tags
2. Check `server/.env` - correct endpoint URL?
3. Try with a simpler question first

### "Using fallback" responses
1. Local LLM service might be unreachable
2. Check firewall/network connection
3. Verify API endpoint in `.env` matches your setup
4. Restart the backend server

### CORS Errors
- Should be handled by existing CORS config in `server/index.js`
- If issues persist, check that frontend URL matches CORS whitelist

## Environment Variables Reference

```env
# Required for chatbot
OPENAI_API_ENDPOINT=http://localhost:8000/v1    # Local LLM API endpoint
LOCAL_AI_ENDPOINT=http://127.0.0.1:49252/mcp    # OpenClaw MCP endpoint

# Existing (keep as-is)
MONGO_URI=mongodb+srv://...
PORT=5001
JWT_SECRET=your_jwt_secret_key_change_this_in_production
```

## Files Modified/Created

### Created:
- `server/controllers/chatbotController.js` - Chat logic
- `server/routes/chatbotRoutes.js` - API routes
- `OPENCLAW_INTEGRATION.md` - This guide

### Modified:
- `server/index.js` - Added chatbot routes
- `server/.env` - Added AI configuration
- `frontend/src/components/AIChatWidget.jsx` - Real API integration

## Next Steps

1. **Test with different questions** - Try various topics to see AI responses
2. **Customize system prompt** - Edit SYSTEM_PROMPT in `chatbotController.js` for domain-specific help
3. **Add conversation persistence** - Optionally save chat history to database
4. **Train on custom data** - Fine-tune LLM with your platform's documentation
5. **Add analytics** - Track which topics users ask about most

## Support

If chatbot doesn't work:
1. Check all services are running (backend, local LLM, MongoDB)
2. Verify network connectivity: `ping localhost`
3. Check browser console and server logs for errors
4. Ensure you're logged in before using chatbot
5. Try the fallback responses (they should always work)

---
Integration Date: April 24, 2026
OpenClaw Version: 2026.4.11
