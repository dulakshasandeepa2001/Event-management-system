import React from 'react';
import { FaBullhorn, FaCalendarAlt, FaPaperPlane } from 'react-icons/fa';

const notices = [
  { id: 1, title: 'Assignment Reminder', audience: 'All Year 2 Students', date: '29/03/2026', status: 'Sent' },
  { id: 2, title: 'Seminar Registration', audience: 'Year 3 Students', date: '30/03/2026', status: 'Draft' },
  { id: 3, title: 'Lab Session Update', audience: 'Group B', date: '31/03/2026', status: 'Sent' },
];

const BatchrepNotices = () => {
  return (
    <div className='space-y-5'>
      <section className='rounded-2xl border border-cyan-300/10 bg-[#09122a] p-4 md:p-5'>
        <h2 className='text-xl font-semibold text-slate-100'>Batch Notices</h2>
        <p className='mt-1 text-sm text-slate-400'>Draft, review, and track notices sent to students.</p>
      </section>

      <section className='rounded-2xl border border-cyan-300/10 bg-[#09122a] p-4 md:p-5'>
        <h3 className='mb-4 text-lg font-semibold text-slate-100'>Recent Notices</h3>

        <div className='space-y-3'>
          {notices.map((notice) => (
            <article key={notice.id} className='rounded-xl border border-cyan-300/10 bg-[#0d1734] p-4'>
              <div className='flex flex-wrap items-start justify-between gap-3'>
                <div>
                  <h4 className='text-base font-semibold text-slate-100'>{notice.title}</h4>
                  <p className='mt-1 text-xs text-slate-400'>{notice.audience}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs ${notice.status === 'Sent' ? 'bg-cyan-500/15 text-cyan-200' : 'bg-amber-500/15 text-amber-200'}`}>
                  {notice.status}
                </span>
              </div>

              <div className='mt-3 flex items-center gap-2 text-sm text-slate-300'>
                <FaCalendarAlt className='text-cyan-300' />
                <span>{notice.date}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className='rounded-2xl border border-cyan-300/10 bg-[#09122a] p-4 md:p-5'>
        <button className='inline-flex items-center gap-2 rounded-lg bg-cyan-500/20 px-3 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/30'>
          <FaPaperPlane />
          Create New Notice
        </button>
        <p className='mt-2 text-xs text-slate-400'>This page is now connected to the sidebar and ready for notice CRUD integration.</p>
      </section>
    </div>
  );
};

export default BatchrepNotices;
