import React, { useMemo, useState, useRef, useEffect } from 'react';
import { FaComments, FaPaperPlane, FaRobot, FaTimes, FaSpinner, FaTrash } from 'react-icons/fa';
import API from '../api';

const quickPrompts = [
  'How to upload submission?',
  'Create a submission for me',
  'List my deadlines',
  'Schedule an event',
];

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: 'Hello! 👋 I\'m your AI Assistant powered by DeepSeek. I can:\n✨ Answer questions about the system\n⚡ Execute commands (create submissions, events, deadlines)\n📋 List your deadlines and submissions\n\nWhat would you like me to help with?',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (customText) => {
    const text = (customText || input).trim();
    if (!text || loading) return;

    try {
      setLoading(true);

      // Add user message
      const userMsg = { id: Date.now(), role: 'user', text };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');

      // Get conversation history (last 6 messages for context)
      const conversationHistory = messages
        .slice(-6)
        .filter((msg) => msg.role !== 'bot' || !msg.text.includes('Hello!'))
        .map((msg) => ({
          role: msg.role,
          content: msg.text,
        }));

      // Detect if user wants to perform an action (agent mode)
      const actionKeywords = ['create', 'submit', 'upload', 'make', 'schedule', 'register', 'add', 'generate', 'list'];
      const isActionRequest = actionKeywords.some(keyword => text.toLowerCase().includes(keyword));

      // Choose endpoint based on request type
      const endpoint = isActionRequest ? '/agent/agent' : '/chatbot/chat';

      // Call backend API
      const response = await API.post(endpoint, {
        message: text,
        conversationHistory,
      });

      const aiMessage = {
        id: Date.now() + 1,
        role: 'bot',
        text: response.data.message,
        toolsExecuted: response.data.toolsExecuted,
        provider: response.data.provider,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = {
        id: Date.now() + 1,
        role: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        role: 'bot',
        text: 'Hello! 👋 I\'m your AI Assistant powered by DeepSeek. I can:\n✨ Answer questions about the system\n⚡ Execute commands (create submissions, events, deadlines)\n📋 List your deadlines and submissions\n\nWhat would you like me to help with?',
      },
    ]);
    setInput('');
  };

  return (
    <>
      <button
        type='button'
        onClick={() => setIsOpen((prev) => !prev)}
        className='fixed bottom-6 right-6 z-[70] inline-flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/30 bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-2xl shadow-cyan-900/40 transition hover:scale-110 text-2xl'
        aria-label='Open AI chat assistant'
      >
        {isOpen ? <FaTimes /> : <FaComments />}
      </button>

      {isOpen && (
        <section className='fixed bottom-24 right-6 z-[70] w-[95vw] max-w-3xl h-[600px] rounded-3xl border border-cyan-300/20 bg-[#0c1530] shadow-2xl shadow-blue-950/50 flex flex-col'>
          <header className='flex items-center justify-between border-b border-cyan-300/15 px-6 py-4 flex-shrink-0'>
            <div className='flex items-center gap-3'>
              <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-200 text-xl'>
                <FaRobot />
              </span>
              <div>
                <h3 className='text-lg font-semibold text-slate-100'>AI Chat Assistant</h3>
                <p className='text-xs text-slate-400'>Powered by DeepSeek AI</p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={clearChat}
                className='p-2 text-slate-400 transition hover:text-red-400 hover:bg-red-500/10 rounded-lg'
                aria-label='Clear chat'
                title='Clear conversation'
              >
                <FaTrash />
              </button>
              <button
                type='button'
                onClick={() => setIsOpen(false)}
                className='p-2 text-slate-400 transition hover:text-slate-200 hover:bg-slate-700/20 rounded-lg'
                aria-label='Close AI chat assistant'
              >
                <FaTimes />
              </button>
            </div>
          </header>

          <div className='flex-1 space-y-4 overflow-auto px-6 py-4'>
            {messages.map((msg) => (
              <div key={msg.id}>
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-cyan-500/25 text-cyan-50 rounded-br-none'
                        : 'bg-slate-700/50 text-slate-100 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
                {msg.toolsExecuted && msg.toolsExecuted.length > 0 && (
                  <div className='mt-2 flex justify-start'>
                    <div className='max-w-[75%] rounded-lg bg-green-500/15 border border-green-500/30 px-3 py-2 text-xs text-green-200'>
                      {msg.toolsExecuted.map((tool, idx) => (
                        <div key={idx}>
                          ✅ {tool.toolName}: {tool.status === 'success' ? 'Completed' : 'Failed'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className='flex justify-start'>
                <div className='flex items-center gap-3 rounded-2xl bg-slate-700/50 px-4 py-3 text-cyan-200'>
                  <FaSpinner className='animate-spin text-lg' />
                  <span className='text-sm'>DeepSeek is processing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className='border-t border-cyan-300/10 px-6 py-4 flex-shrink-0'>
            {messages.length <= 1 && (
              <div className='mb-3 flex flex-wrap gap-2'>
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type='button'
                    onClick={() => sendMessage(prompt)}
                    className='rounded-full border border-cyan-300/30 bg-cyan-500/15 px-3 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-500/30 hover:border-cyan-300/50'
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            <div className='flex items-center gap-2'>
              <input
                type='text'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder='Ask me anything... (Shift+Enter for new line)'
                className='flex-1 rounded-xl border border-cyan-300/30 bg-[#101b38] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/60 focus:bg-[#141f48] transition'
              />
              <button
                type='button'
                disabled={!canSend}
                onClick={() => sendMessage()}
                className='inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/30 text-cyan-200 transition hover:bg-cyan-500/50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-cyan-500/30'
                aria-label='Send chat message'
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default AIChatWidget;
