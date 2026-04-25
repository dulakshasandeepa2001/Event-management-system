import React, { useEffect, useState } from 'react';
import { FaUser, FaPowerOff, FaBell } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import API from '../../api';
import ThemeToggleButton from '../../components/ThemeToggleButton.jsx';

const StudentNavbar = () => {
  const { user, logout, loading } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !['student', 'lecturer'].includes(user.u_role)) return;
      try {
        const [submissionRes, notificationRes] = await Promise.all([
          API.get('/submissions/student/my'),
          API.get('/submissions/student/notifications'),
        ]);
        setSubmissions(submissionRes.data?.submissions || []);
        setNotifications(notificationRes.data?.notifications || []);
        setUnreadCount(notificationRes.data?.unreadCount || 0);
      } catch (err) {
        setSubmissions([]);
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const formatDate = (value) => new Date(value).toLocaleDateString('en-GB');

  const handleMarkAllAsRead = async () => {
    try {
      await API.post('/submissions/student/notifications/read-all');
      setUnreadCount(0);
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  if (loading) return null;

  return (
    <div className="relative flex h-16 items-center justify-between border-b border-cyan-400/10 bg-[#070d1f]/95 px-4 md:px-6 my_font_family">
      <div className="flex items-center gap-3 text-white">
        <div className="rounded-lg bg-cyan-500/15 p-2 text-cyan-300">
          <FaUser className="text-lg" />
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wide text-slate-400">WELCOME BACK</p>
          <h3 className="font-bold text-slate-100">{user?.u_name}</h3>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggleButton variant="compact" />

        <button
          onClick={() => setNotificationOpen((prev) => !prev)}
          className="relative rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-yellow-500 transition-all duration-200 hover:bg-yellow-500/20"
          title="View notifications and submissions"
        >
          <FaBell className="text-lg" />
          {(submissions.length > 0 || unreadCount > 0) && (
            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white shadow-lg">
              {Math.max(submissions.length, unreadCount)}
            </span>
          )}
        </button>

        <button
          onClick={() => setConfirmOpen(true)}
          className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-rose-400 transition-all duration-200 hover:bg-rose-500/20"
        >
          <FaPowerOff />
        </button>
      </div>

      {notificationOpen && (
        <div className="absolute right-4 top-20 z-50 w-[400px] max-h-[600px] overflow-y-auto rounded-2xl border border-cyan-400/10 bg-[#070d1f]/95 p-6 backdrop-blur-xl shadow-2xl">
          <div className="mb-6 flex items-center justify-between gap-2">
            <h4 className="text-lg font-bold text-slate-100">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-medium text-cyan-300 underline hover:text-cyan-200"
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="mb-6 space-y-3 border-b border-slate-700/40 pb-6">
              <h5 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                New Submissions
              </h5>
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`rounded-lg border p-3 text-xs transition-all ${
                    notif.isRead
                      ? 'border-slate-700/20 bg-[#0f1419]/40'
                      : 'border-cyan-400/30 bg-cyan-500/10'
                  }`}
                >
                  <p className={`font-semibold line-clamp-2 ${notif.isRead ? 'text-slate-400' : 'text-cyan-300'}`}>
                    {notif.title}
                  </p>
                  {notif.submissionId && (
                    <p className="mt-2 text-[10px] text-slate-400">
                      Due: {formatDate(notif.submissionId.s_dueDate)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {submissions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-medium text-slate-400">No pending submissions</p>
              <p className="mt-2 text-xs text-slate-500">New assignments appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Submissions
              </h5>
              {submissions.map((item) => {
                const isUrgent = new Date(item.s_dueDate) - Date.now() < 86400000;
                const isOverdue = new Date(item.s_dueDate) < Date.now();

                return (
                  <div
                    key={item._id}
                    className={`rounded-lg border p-4 text-xs ${
                      isOverdue
                        ? 'border-red-500/30 bg-red-500/10'
                        : isUrgent
                        ? 'border-orange-500/30 bg-orange-500/10'
                        : 'border-slate-700/30 bg-[#0f1419]/50'
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <p className="font-bold text-white">{item.s_title}</p>
                      <span
                        className={`text-[10px] font-bold ${
                          isOverdue ? 'text-red-400' : isUrgent ? 'text-orange-400' : 'text-green-400'
                        }`}
                      >
                        {isOverdue ? 'OVERDUE' : isUrgent ? 'URGENT' : 'OK'}
                      </span>
                    </div>
                    <p className="mb-1 text-slate-400">Module: {item.s_module}</p>
                    <p className="text-[10px] text-slate-500">
                      Year {item.s_year} / Semester {item.s_semester}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        show={confirmOpen}
        message="Are you sure you want to logout?"
        onConfirm={logout}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default StudentNavbar;