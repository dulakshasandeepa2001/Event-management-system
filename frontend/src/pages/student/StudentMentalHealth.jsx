import React, { useMemo, useState } from 'react';
import { FaHeart, FaPaperPlane, FaUserFriends } from 'react-icons/fa';

const supportiveReplies = [
  'Thanks for sharing. You are not alone, and it is okay to feel this way.',
  'Try a short break: 4 deep breaths, water, and a 5-minute walk.',
  'You are doing your best. One step at a time is enough for today.',
  'Would you like to write down what is stressing you most right now?',
  'Talking to a trusted friend can help. You can also reach out to a counselor.',
];

const quickTips = [
  'Take 10 deep breaths slowly',
  'Message one trusted friend today',
  'Sleep at a fixed time tonight',
  'Do a 15-minute walk without phone',
];

const StudentMentalHealth = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: 'Hi, I am your friendly support chat. How are you feeling today?',
    },
  ]);
  const [input, setInput] = useState('');

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const userMessage = { id: Date.now(), role: 'user', text };
    const reply = supportiveReplies[Math.floor(Math.random() * supportiveReplies.length)];
    const assistantMessage = { id: Date.now() + 1, role: 'assistant', text: reply };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput('');
  };

  return (
    <div className='space-y-5 p-6 md:p-8'>
      <section className='rounded-2xl border border-cyan-400/15 bg-[#121a2f] p-5'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h2 className='text-2xl font-bold text-white'>Mental Health Friend Chat</h2>
            <p className='mt-1 text-sm text-slate-400'>A safe space to talk, reflect, and get supportive reminders.</p>
          </div>
          <span className='inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200'>
            <FaHeart />
            Support Mode
          </span>
        </div>
      </section>

      <div className='grid gap-5 lg:grid-cols-3'>
        <section className='rounded-2xl border border-cyan-400/15 bg-[#121a2f] p-4 lg:col-span-2'>
          <h3 className='mb-3 text-base font-semibold text-white'>Chat</h3>

          <div className='max-h-[380px] space-y-3 overflow-auto rounded-xl border border-cyan-400/10 bg-[#0e162b] p-3'>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm ${
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

          <div className='mt-3 flex gap-2'>
            <input
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage();
              }}
              placeholder='Type what you feel...'
              className='w-full rounded-xl border border-cyan-400/20 bg-[#0e162b] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-400/40'
            />
            <button
              type='button'
              onClick={sendMessage}
              disabled={!canSend}
              className='inline-flex items-center gap-2 rounded-xl bg-cyan-500/20 px-3 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <FaPaperPlane />
              Send
            </button>
          </div>
        </section>

        <section className='rounded-2xl border border-cyan-400/15 bg-[#121a2f] p-4'>
          <h3 className='mb-3 text-base font-semibold text-white'>Quick Self-Care Tips</h3>
          <div className='space-y-2'>
            {quickTips.map((tip) => (
              <article key={tip} className='rounded-lg border border-cyan-400/10 bg-[#0e162b] px-3 py-2 text-sm text-slate-300'>
                {tip}
              </article>
            ))}
          </div>

          <div className='mt-4 rounded-lg border border-blue-400/15 bg-blue-500/10 p-3 text-xs text-blue-200'>
            <p className='inline-flex items-center gap-2 font-semibold'>
              <FaUserFriends />
              Talk to a friend
            </p>
            <p className='mt-1 text-blue-100'>
              If stress is high, reach out to a close friend, mentor, or university counselor.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentMentalHealth;
