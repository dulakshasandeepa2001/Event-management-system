// Chatbot controller using DeepSeek AI or local LLM service
import axios from 'axios';

// API Configuration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const OPENAI_API_ENDPOINT = process.env.OPENAI_API_ENDPOINT || 'https://api.deepseek.com/v1';
const USE_DEEPSEEK = process.env.USE_DEEPSEEK === 'true';

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are a helpful AI assistant for the Event Management System. You help users with:
- Event registration and management
- Submission deadlines and uploads
- Exam results and marks
- Student notifications and notices
- Dashboard navigation and features
- General platform questions

Be concise, friendly, and provide actionable help. If you don't know something, suggest checking the dashboard or contacting support.`;

export const sendChatMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Build conversation messages
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Use DeepSeek API if configured
    if (USE_DEEPSEEK && DEEPSEEK_API_KEY) {
      try {
        const response = await axios.post(
          `${OPENAI_API_ENDPOINT}/chat/completions`,
          {
            model: 'deepseek-chat',
            messages,
            temperature: 0.7,
            max_tokens: 500,
          },
          {
            headers: {
              'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000
          }
        );

        const aiMessage = response.data.choices[0].message.content;

        return res.json({
          message: aiMessage,
          conversationHistory: [
            ...conversationHistory,
            { role: 'user', content: message },
            { role: 'assistant', content: aiMessage }
          ],
          provider: 'deepseek'
        });
      } catch (error) {
        console.error('DeepSeek API error:', error.message);
        // Fall back to fallback responses if DeepSeek fails
        const fallbackMessage = generateFallbackResponse(message);
        return res.json({
          message: fallbackMessage,
          conversationHistory: [
            ...conversationHistory,
            { role: 'user', content: message },
            { role: 'assistant', content: fallbackMessage }
          ],
          usingFallback: true,
          error: 'DeepSeek service unavailable, using fallback'
        });
      }
    } else {
      // Fallback mode if DeepSeek is not configured
      const fallbackMessage = generateFallbackResponse(message);
      return res.json({
        message: fallbackMessage,
        conversationHistory: [
          ...conversationHistory,
          { role: 'user', content: message },
          { role: 'assistant', content: fallbackMessage }
        ],
        usingFallback: true
      });
    }
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      message: 'Sorry, I encountered an error. Please try again.'
    });
  }
};

// Generate fallback responses based on keywords
function generateFallbackResponse(message) {
  const fallbackResponses = {
    submission: 'You can upload submissions from the Submissions page. Click "Add Submission" and select the file to upload before the deadline.',
    deadline: 'Check the Deadlines section in your dashboard to see all upcoming dates. Click on a deadline for more details.',
    results: 'Your exam results and marks are available in the Exam Results section. Contact your lecturer if you have questions.',
    event: 'Browse and register for events from the Events page. You\'ll receive notifications for new events relevant to your batch.',
    help: 'I can assist with submissions, deadlines, exam results, events, and navigation. What do you need help with?',
  };

  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('submit') || lowerMessage.includes('upload')) {
    return fallbackResponses.submission;
  } else if (lowerMessage.includes('deadline') || lowerMessage.includes('due')) {
    return fallbackResponses.deadline;
  } else if (lowerMessage.includes('result') || lowerMessage.includes('marks') || lowerMessage.includes('exam')) {
    return fallbackResponses.results;
  } else if (lowerMessage.includes('event')) {
    return fallbackResponses.event;
  }
  
  return fallbackResponses.help;
}

export const clearConversation = (req, res) => {
  res.json({ message: 'Conversation cleared', conversationHistory: [] });
};
