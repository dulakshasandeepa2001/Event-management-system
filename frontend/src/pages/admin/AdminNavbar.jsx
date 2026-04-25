import React, { useEffect, useState } from 'react';
import { FaUser, FaPowerOff, FaBell } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import ThemeToggleButton from '../../components/ThemeToggleButton.jsx';

const AdminNavbar = () => {
  const { user, logout, loading } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  if (loading) return null;

  return (
    <div className="flex h-16 items-center justify-between border-b border-cyan-400/10 bg-[#070d1f]/95 px-4 md:px-6 my_font_family">
      <div className="flex items-center gap-3 text-white">
        <div className="rounded-lg bg-cyan-500/15 p-2 text-cyan-300">
          <FaUser className="text-lg" />
        </div>
        <h3 className="font-semibold text-slate-100">Welcome, {user?.u_name}</h3>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggleButton variant="compact" />

        <button className="relative rounded-lg border border-yellow-500/50 bg-yellow-500/20 p-2 text-yellow-400 transition hover:bg-yellow-500/30">
          <FaBell className="text-lg" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <button
          onClick={() => setConfirmOpen(true)}
          className="rounded-lg border border-rose-500/50 bg-rose-500/20 p-2 text-rose-400 transition hover:bg-rose-500/30"
        >
          <FaPowerOff className="text-lg" />
        </button>
      </div>

      <ConfirmModal
        show={confirmOpen}
        message="Are you sure you want to logout?"
        onConfirm={logout}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default AdminNavbar;