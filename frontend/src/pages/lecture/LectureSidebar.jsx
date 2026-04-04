import React from 'react';
import {
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaClipboardList,
  FaClock,
  FaHome,
  FaLayerGroup,
  FaRegFileAlt,
  FaSignOutAlt,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext.jsx';

const LectureSidebar = () => {
  const { logout } = useAuth();

  const navClass =
    'flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm text-slate-300 transition hover:border-cyan-400/20 hover:bg-white/5 hover:text-slate-100';

  const sectionLinks = [
    { href: '#overview', icon: <FaHome />, label: 'Overview' },
    { href: '#deadlines', icon: <FaClock />, label: 'Deadlines' },
    { href: '#submissions', icon: <FaClipboardList />, label: 'Submissions' },
    { href: '#events', icon: <FaCalendarAlt />, label: 'Events' },
    { href: '#details', icon: <FaRegFileAlt />, label: 'Submission Details' },
  ];

  return (
    <aside className="fixed bottom-0 left-0 z-30 w-full border-t border-cyan-400/10 bg-[#050b18]/95 backdrop-blur lg:top-0 lg:h-screen lg:w-80 lg:border-r lg:border-t-0 lg:bg-[#050b18]">
      <div className="flex h-full flex-col justify-between p-4 lg:p-5">
        <div>
          <div className="mb-5 rounded-3xl border border-cyan-300/15 bg-gradient-to-br from-[#0b1730] via-[#0c1629] to-[#111827] p-4 shadow-2xl shadow-cyan-950/20">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-500/15 text-cyan-300">
                <FaChalkboardTeacher className="text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-wide text-slate-100">
                  Lecture<span className="text-cyan-300">Hub</span>
                </h3>
                <p className="text-xs text-slate-400">Lecture tools for deadlines, submissions, events, and details</p>
              </div>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <FaLayerGroup /> Lecture Tools
            </div>
          </div>

          <nav className="space-y-1.5">
            {sectionLinks.map((link) => (
              <a key={link.label} href={link.href} className={navClass}>
                <span className="text-sm text-cyan-300">{link.icon}</span>
                <span>{link.label}</span>
              </a>
            ))}
          </nav>

          <div className="mt-5 rounded-2xl border border-slate-700/60 bg-[#0b1326] p-4">
            <p className="text-sm font-semibold text-slate-100">Fast lanes</p>
            <p className="mt-1 text-xs text-slate-400">Jump to the lecture sections that manage your workflow.</p>
            <div className="mt-4 grid gap-2">
              <a href="#deadlines" className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-500/10">
                Deadlines
              </a>
              <a href="#submissions" className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-500/10">
                Submissions
              </a>
              <a href="#events" className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-500/10">
                Events
              </a>
              <a href="#details" className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-500/10">
                Submission details
              </a>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-1">
          <button
            onClick={logout}
            className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-rose-400/20 px-3 py-2.5 text-sm text-rose-200 transition hover:bg-rose-500/10 lg:col-span-1"
          >
            <FaSignOutAlt />
            Log Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default LectureSidebar;
