import React, { useState } from 'react';
import { FaPowerOff } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import ThemeToggleButton from '../../components/ThemeToggleButton.jsx';

const LectureNavbar = () => {
  const { user, logout, loading } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (loading) return null;

  return (
    <header className="sticky top-0 z-20 border-b border-cyan-400/10 bg-[#040b18]/90 backdrop-blur-xl">
      <div className="flex flex-col gap-3 px-4 py-4 md:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">Lecture Workspace</p>
          <h1 className="mt-1 text-xl font-bold text-white md:text-2xl">
            Welcome back, {user?.u_name || 'Lecturer'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">Deadlines, submissions, event review, and submission detail tracking.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ThemeToggleButton />
          <button
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20"
          >
            <FaPowerOff /> Logout
          </button>
        </div>
      </div>

      <ConfirmModal
        show={confirmOpen}
        message="Are you sure you want to logout?"
        onConfirm={logout}
        onCancel={() => setConfirmOpen(false)}
      />
    </header>
  );
};

export default LectureNavbar;