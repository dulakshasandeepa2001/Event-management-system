import React, { useMemo, useState } from 'react';
import { FaComments, FaPaperPlane, FaRobot, FaTimes } from 'react-icons/fa';

const botReplies = [
  'I can help with submissions, deadlines, and dashboard navigation. What do you need?',
  'Try checking your Submissions page for due dates and upload status updates.',
  'For exam-related details, open Exam Results from the sidebar.',
  'If you are stressed, visit Mental Health page and use the support chat section.',
  'I can also help you find where to create events and notices in your dashboard.',
];

const quickPrompts = [
  'How to upload submission?',
  'Where are exam results?',
  'How to check deadlines?',
  'I need help with stress',
];

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: 'Hello! I am your AI assistant for Event Hub. Ask me anything about this system.',
    },
  ]);

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  const sendMessage = (customText) => {
    const text = (customText || input).trim();
    if (!text) return;

    const userMsg = { id: Date.now(), role: 'user', text };
    const reply = botReplies[Math.floor(Math.random() * botReplies.length)];
    const botMsg = { id: Date.now() + 1, role: 'bot', text: reply };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  return (
    <>
      <button
        type='button'
        onClick={() => setIsOpen((prev) => !prev)}
        className='fixed bottom-6 right-6 z-[70] inline-flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/30 bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-2xl shadow-cyan-900/40 transition hover:scale-105'
        aria-label='Open AI chat assistant'
      >
        {isOpen ? <FaTimes /> : <FaComments />}
      </button>

      {isOpen && (
        <section className='fixed bottom-24 right-6 z-[70] w-[92vw] max-w-sm rounded-2xl border border-cyan-300/20 bg-[#0c1530] shadow-2xl shadow-blue-950/50'>
          <header className='flex items-center justify-between border-b border-cyan-300/15 px-4 py-3'>
            <div className='flex items-center gap-2'>
              <span className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-200'>
                <FaRobot />
              </span>
              <div>
                <h3 className='text-sm font-semibold text-slate-100'>AI Chat Assistant</h3>
                <p className='text-[11px] text-slate-400'>Available on all pages</p>
              </div>
            </div>
            <button
              type='button'
              onClick={() => setIsOpen(false)}
              className='text-slate-400 transition hover:text-slate-200'
              aria-label='Close AI chat assistant'
            >
              <FaTimes />
            </button>
          </header>

          <div className='max-h-72 space-y-3 overflow-auto px-4 py-3'>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[88%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-cyan-500/20 text-cyan-100'
                      : 'bg-slate-700/40 text-slate-200'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className='border-t border-cyan-300/10 px-4 py-3'>
            <div className='mb-2 flex flex-wrap gap-2'>
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type='button'
                  onClick={() => sendMessage(prompt)}
                  className='rounded-full border border-cyan-300/20 bg-cyan-500/10 px-2.5 py-1 text-[11px] text-cyan-100 transition hover:bg-cyan-500/20'
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className='flex items-center gap-2'>
              <input
                type='text'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage();
                }}
                placeholder='Ask me anything...'
                className='w-full rounded-xl border border-cyan-300/20 bg-[#101b38] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/40'
              />
              <button
                type='button'
                disabled={!canSend}
                onClick={() => sendMessage()}
                className='inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-200 transition hover:bg-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-50'
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
