import React from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaClock } from 'react-icons/fa';

const upcomingEvents = [
  { id: 1, title: 'Batch Meeting', date: '05/04/2026', time: '10:00 AM', venue: 'Main Hall', audience: 'All Students' },
  { id: 2, title: 'Career Seminar', date: '08/04/2026', time: '01:30 PM', venue: 'Auditorium', audience: 'Year 3 & 4' },
  { id: 3, title: 'Project Review', date: '12/04/2026', time: '09:00 AM', venue: 'Lab 3', audience: 'Final Year' },
];

const BatchrepEvents = () => {
  return (
    <div className='space-y-5'>
      <section className='rounded-2xl border border-cyan-300/10 bg-[#09122a] p-4 md:p-5'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-semibold text-slate-100'>Batch Events</h2>
            <p className='mt-1 text-sm text-slate-400'>View and monitor upcoming events for your batch.</p>
          </div>
          <span className='rounded-full border border-cyan-300/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200'>
            {upcomingEvents.length} upcoming
          </span>
        </div>
      </section>

      <section className='rounded-2xl border border-cyan-300/10 bg-[#09122a] p-4 md:p-5'>
        <h3 className='mb-4 text-lg font-semibold text-slate-100'>Event Timeline</h3>

        <div className='space-y-3'>
          {upcomingEvents.map((event) => (
            <article key={event.id} className='rounded-xl border border-cyan-300/10 bg-[#0d1734] p-4'>
              <div className='flex flex-wrap items-start justify-between gap-3'>
                <div>
                  <h4 className='text-base font-semibold text-slate-100'>{event.title}</h4>
                  <p className='mt-1 text-xs text-slate-400'>{event.audience}</p>
                </div>
                <span className='rounded-full bg-cyan-500/15 px-2 py-1 text-xs text-cyan-200'>Scheduled</span>
              </div>

              <div className='mt-3 grid gap-2 text-sm text-slate-300 md:grid-cols-3'>
                <div className='flex items-center gap-2'>
                  <FaCalendarAlt className='text-cyan-300' />
                  <span>{event.date}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <FaClock className='text-cyan-300' />
                  <span>{event.time}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <FaMapMarkerAlt className='text-cyan-300' />
                  <span>{event.venue}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className='rounded-2xl border border-cyan-300/10 bg-[#09122a] p-4 md:p-5'>
        <div className='flex items-center gap-2 text-slate-300'>
          <FaUsers className='text-cyan-300' />
          <p className='text-sm'>Use this page to track event plans before publishing announcements.</p>
        </div>
      </section>
    </div>
  );
};

export default BatchrepEvents;
