// AI Agent Controller - Enables chatbot to execute commands and create resources
import axios from 'axios';
import Submission from '../models/Submission.js';
import Event from '../models/Event.js';
import Deadline from '../models/Deadline.js';
import User from '../models/User.js';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const OPENAI_API_ENDPOINT = process.env.OPENAI_API_ENDPOINT || 'https://api.deepseek.com/v1';

// Available functions the AI can call
const AVAILABLE_FUNCTIONS = {
  create_submission: {
    description: 'Create a new submission for a student',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Submission title' },
        description: { type: 'string', description: 'Submission description' },
        deadlineId: { type: 'string', description: 'Deadline ID (optional)' },
        fileUrl: { type: 'string', description: 'File URL or path (optional)' },
      },
      required: ['title'],
    },
  },
  create_event: {
    description: 'Create a new event',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Event title' },
        date: { type: 'string', description: 'Event date (YYYY-MM-DD)' },
        description: { type: 'string', description: 'Event description (optional)' },
        category: { type: 'string', description: 'Event category (optional)' },
      },
      required: ['title', 'date'],
    },
  },
  create_deadline: {
    description: 'Create a new deadline',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Deadline title' },
        dueDate: { type: 'string', description: 'Due date (YYYY-MM-DD)' },
        description: { type: 'string', description: 'Deadline description (optional)' },
      },
      required: ['title', 'dueDate'],
    },
  },
  get_submission_details: {
    description: 'Get details of a submission',
    parameters: {
      type: 'object',
      properties: {
        submissionId: { type: 'string', description: 'Submission ID' },
      },
      required: ['submissionId'],
    },
  },
  list_deadlines: {
    description: 'List all deadlines for a batch',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
};

// System prompt for AI Agent mode
const AGENT_SYSTEM_PROMPT = `You are an AI Agent for the Event Management System with DIRECT COMMAND EXECUTION.

🔴 CRITICAL RULES:
1. NEVER ask for clarification or additional information
2. Extract ALL parameters from user message
3. Use empty strings/defaults for optional missing fields
4. EXECUTE IMMEDIATELY when user requests an action
5. Auto-populate from context: year, semester from user profile
6. Parse dates intelligently (e.g., "Friday" = next Friday, YYYY-MM-DD format)

✅ YOUR CAPABILITIES:
- create_submission(title, description?) - Create submission with auto-populated year, semester, module
- create_event(title, date, description?, category?) - Create event instantly
- create_deadline(title, dueDate, description?) - Create deadline instantly
- get_submission_details(submissionId) - Get DETAILED submission info
- list_deadlines() - Show all deadlines

⚡ EXECUTION MODE:
- User: "Create submission" → Instantly create with intelligent defaults
- User: "What is my submission" → Get FULL details
- User: "Show details" → Provide comprehensive information
- NEVER ASK - ONLY EXECUTE AND DELIVER RESULTS

💡 EXAMPLE CONVERSATIONS:
- "Create project submission" → Executed with auto values
- "What are my submissions" → List with full details
- "Tell me about submission X" → Provide complete info

Remember: User intent = Immediate execution + comprehensive response!`;

export const sendAgentMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const userId = req.user._id; // Get from authenticated user
    const batchId = req.user.u_batchId || req.user.batchId; // Get batch from user

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Build conversation messages
    const messages = [
      { role: 'system', content: AGENT_SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    try {
      // Call DeepSeek with function calling
      const response = await axios.post(
        `${OPENAI_API_ENDPOINT}/chat/completions`,
        {
          model: 'deepseek-chat',
          messages,
          tools: Object.entries(AVAILABLE_FUNCTIONS).map(([name, config]) => ({
            type: 'function',
            function: {
              name,
              description: config.description,
              parameters: config.parameters,
            },
          })),
          tool_choice: 'auto',
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000
        }
      );

      const assistantMessage = response.data.choices[0].message;
      let toolResults = [];
      let finalResponse = assistantMessage.content || 'Done!';

      // Check if AI wants to call a function
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        for (const toolCall of assistantMessage.tool_calls) {
          const functionName = toolCall.function.name;
          let functionArgs = JSON.parse(toolCall.function.arguments);

          // Auto-inject user context into arguments
          functionArgs.userId = userId;
          functionArgs.batchId = batchId;

          try {
            // Execute the function
            const result = await executeFunction(functionName, functionArgs, userId, batchId);
            toolResults.push({
              toolName: functionName,
              result,
              status: 'success'
            });
          } catch (error) {
            console.error(`Function execution error for ${functionName}:`, error);
            toolResults.push({
              toolName: functionName,
              result: error.message,
              status: 'error'
            });
          }
        }

        // Get follow-up response from AI based on function results
        if (toolResults.length > 0) {
          const successCount = toolResults.filter(t => t.status === 'success').length;
          const errorCount = toolResults.filter(t => t.status === 'error').length;

          const summaryText = toolResults
            .map(t => `${t.toolName}: ${t.status === 'success' ? '✅ ' + t.result.message : '❌ ' + t.result}`)
            .join('\n');

          finalResponse = `I've processed your request:\n\n${summaryText}`;

          if (errorCount > 0) {
            finalResponse += `\n\n⚠️ Some operations encountered issues. Please check the details above.`;
          }
        }
      }

      return res.json({
        message: finalResponse,
        conversationHistory: [
          ...conversationHistory,
          { role: 'user', content: message },
          { role: 'assistant', content: finalResponse }
        ],
        toolsExecuted: toolResults,
        provider: 'deepseek-agent'
      });
    } catch (error) {
      console.error('DeepSeek API error:', error.message);
      
      // Fallback: Try to parse user intent directly if API fails
      const fallbackResponse = generateFallbackResponse(message, userId, batchId);
      return res.json({
        message: fallbackResponse,
        conversationHistory: [
          ...conversationHistory,
          { role: 'user', content: message },
          { role: 'assistant', content: fallbackResponse }
        ],
        usingFallback: true
      });
    }
  } catch (error) {
    console.error('Agent error:', error);
    res.status(500).json({
      error: 'Failed to process agent request',
      message: 'Sorry, I encountered an error. Please try again.'
    });
  }
};

// Fallback response generator
function generateFallbackResponse(message, userId, batchId) {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('create') && lowerMsg.includes('submission')) {
    return '📝 To create a submission, please provide:\n- Title\n- Description\n- Deadline ID (optional)\n\nOr try: "Create submission titled \'Project 1\' with description \'My work\'"';
  }
  if (lowerMsg.includes('create') && lowerMsg.includes('event')) {
    return '📅 I can help you create an event! Please provide:\n- Event title\n- Date (YYYY-MM-DD format)\n- Category (workshop, seminar, etc)\n\nExample: "Create event \'Web Workshop\' on 2026-05-15"';
  }
  if (lowerMsg.includes('list') && lowerMsg.includes('deadline')) {
    return '📋 Fetching your deadlines...';
  }
  
  return '🤔 I can help with:\n- Creating submissions\n- Creating events\n- Listing deadlines\n- Getting submission details\n\nWhat would you like to do?';
}

// Execute function based on name
async function executeFunction(functionName, args, userId, batchId) {
  switch (functionName) {
    case 'create_submission':
      return await createSubmissionFunction(args, userId);

    case 'create_event':
      return await createEventFunction(args, batchId);

    case 'create_deadline':
      return await createDeadlineFunction(args, batchId);

    case 'get_submission_details':
      return await getSubmissionDetailsFunction(args);

    case 'list_deadlines':
      return await listDeadlinesFunction(args);

    default:
      throw new Error(`Unknown function: ${functionName}`);
  }
}

// Function implementations
async function createSubmissionFunction(args, userId) {
  try {
    const { title, description = '', deadlineId, fileUrl = '' } = args;

    // Fetch user data to get year and semester
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Calculate due date (7 days from now if not specified)
    let dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    // Create submission with all required fields
    const submission = new Submission({
      s_title: title,
      s_description: description,
      s_module: user.u_course || 'General',
      s_year: user.u_year || 1,
      s_semester: user.u_semester || 1,
      s_course: user.u_course || '',
      s_dueDate: dueDate,
      createdBy: userId,
      createdByModel: 'User',
    });

    await submission.save();
    
    return {
      success: true,
      message: `✅ Submission "${title}" created successfully`,
      submissionId: submission._id,
      details: {
        title: submission.s_title,
        module: submission.s_module,
        year: submission.s_year,
        semester: submission.s_semester,
        dueDate: submission.s_dueDate.toLocaleDateString(),
      }
    };
  } catch (error) {
    console.error('Submission creation error:', error);
    throw error;
  }
}

async function createEventFunction(args, batchId) {
  const { title, description, date, category } = args;

  const event = new Event({
    e_title: title,
    e_description: description,
    e_event_date: new Date(date),
    e_category: category,
    e_batchId: batchId,
  });

  await event.save();
  return {
    success: true,
    message: `Event "${title}" created successfully on ${date}`,
    eventId: event._id,
  };
}

async function createDeadlineFunction(args, batchId) {
  const { title, description, dueDate } = args;

  const deadline = new Deadline({
    d_title: title,
    d_description: description,
    d_due_date: new Date(dueDate),
    d_batchId: batchId,
  });

  await deadline.save();
  return {
    success: true,
    message: `Deadline "${title}" created successfully for ${dueDate}`,
    deadlineId: deadline._id,
  };
}

async function getSubmissionDetailsFunction(args) {
  const { submissionId } = args;
  const submission = await Submission.findById(submissionId)
    .populate('s_deadline')
    .populate('createdBy');

  if (!submission) {
    throw new Error('Submission not found');
  }

  const details = {
    title: submission.s_title,
    description: submission.s_description,
    module: submission.s_module,
    year: submission.s_year,
    semester: submission.s_semester,
    course: submission.s_course,
    dueDate: submission.s_dueDate?.toLocaleDateString(),
    createdBy: submission.createdBy?.u_name || 'Unknown',
    createdAt: submission.createdAt?.toLocaleDateString(),
  };

  return {
    success: true,
    message: `📋 Submission Details for "${submission.s_title}"`,
    submissionId: submission._id,
    details
  };
}

async function listDeadlinesFunction(args) {
  const { batchId } = args;
  const deadlines = await Deadline.find({ d_batchId: batchId })
    .sort({ d_due_date: 1 });

  return {
    count: deadlines.length,
    deadlines: deadlines.map(d => ({
      id: d._id,
      title: d.d_title,
      dueDate: d.d_due_date,
    })),
  };
}
