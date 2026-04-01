import React, { useEffect, useState } from "react";
import { FaUser, FaPowerOff, FaBell } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import API from "../../api";
import ThemeToggleButton from "../../components/ThemeToggleButton.jsx";

const StudentNavbar = () => {

  const { user, logout, loading } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !["student", "lecturer"].includes(user.u_role)) return;
      try {
        const [submissionRes, notificationRes] = await Promise.all([
          API.get("/submissions/student/my"),
          API.get("/submissions/student/notifications"),
        ]);
        setSubmissions(submissionRes.data?.submissions || []);
        setNotifications(notificationRes.data?.notifications || []);
        setUnreadCount(notificationRes.data?.unreadCount || 0);
      } catch (err) {
        setSubmissions([]);
        setNotifications([]);
      }
    };

    fetchData();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const formatDate = (value) => new Date(value).toLocaleDateString("en-GB");  

  const getTimeLeftLabel = (value) => {
    const due = new Date(value).getTime();
    const now = Date.now();
    const diff = due - now;

    if (diff <= 0) return "Overdue";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} day${days === 1 ? "" : "s"} left`;        

    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"} left`;    

    const minutes = Math.max(1, Math.floor(diff / (1000 * 60)));
    return `${minutes} minute${minutes === 1 ? "" : "s"} left`;
  };

  const handleMarkAllAsRead = async () => {
    try {
      await API.post("/submissions/student/notifications/read-all");
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  };

  if (loading) return null;

    return (
        <div className='relative flex justify-between items-center bg-gradient-to-r from-[#1a1f2e] to-[#0f1419] border-b border-gray-700/30 h-16 px-8 my_font_family shadow-lg'>
            <div className='flex items-center text-white space-x-4'>
                <div className='h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center'>
                  <FaUser className='text-blue-400'/>
                </div>
                <div>
                  <p className='text-xs text-gray-400 font-semibold tracking-wide'>WELCOME BACK</p>
                  <h3 className="text-white font-bold">{user?.u_name}</h3>
                </div>
            </div>
            <div className='flex items-center space-x-3'>
                <ThemeToggleButton variant='compact' />
                <button
                    onClick={() => setNotificationOpen((prev) => !prev)}        
                    className="relative p-3 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 rounded-lg transition-all duration-200"
                    title="View notifications and submissions"
                >
                    <FaBell className='text-lg'/>
                    {(submissions.length > 0 || unreadCount > 0) && (
                        <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1.5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold shadow-lg">
                            {Math.max(submissions.length, unreadCount)}
                        </span>
                    )}
                </button>
                <div id='bt_section' className='relative'>
                    <button className="p-3 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-all duration-200" onClick={() => setConfirmOpen(true)}> <FaPowerOff/> </button>
                    <div id="bt_text_main" className="absolute my_font_family text-xs font-bold px-3 py-1.5 border border-red-500/30 bg-red-500/20 text-red-400 z-50 rounded-lg whitespace-nowrap shadow-lg"><p>Logout</p></div>
                </div>
            </div>

            {notificationOpen && (
                <div className='absolute right-8 top-20 z-50 w-[400px] max-h-[600px] overflow-y-auto rounded-2xl border border-gray-700/30 bg-[#1a1f2e]/95 backdrop-blur-xl p-6 shadow-2xl'>
                    <div className='mb-6 flex items-center justify-between gap-2'>
                        <h4 className='text-lg font-bold text-white'>Notifications</h4>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className='text-xs text-blue-300 hover:text-blue-200 underline font-medium'
                          >
                            Mark all read
                          </button>
                        )}
                    </div>

                    {/* Notifications Section */}
                    {notifications.length > 0 && (
                      <div className='mb-6 space-y-3 pb-6 border-b border-gray-700/30'>
                        <h5 className='text-xs uppercase tracking-wider text-gray-400 font-bold mb-3'>📬 New Submissions</h5>
                        {notifications.map((notif) => (
                          <div key={notif._id} className={`rounded-lg border p-3 text-xs transition-all ${notif.isRead ? 'border-gray-700/20 bg-[#0f1419]/40' : 'border-blue-500/30 bg-blue-500/10'}`}>
                            <p className={`font-semibold line-clamp-2 ${notif.isRead ? 'text-gray-400' : 'text-blue-300'}`}>{notif.title}</p>
                            {notif.submissionId && (
                              <p className='text-gray-400 mt-2 text-[10px]'>📅 Due: {formatDate(notif.submissionId.s_dueDate)}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Submissions Section */}
                    {submissions.length === 0 ? (
                        <div className='text-center py-8'>
                          <p className='text-gray-400 font-medium'>No pending submissions</p>
                          <p className='text-gray-500 text-xs mt-2'>New assignments appear here</p>
                        </div>
                    ) : (
                        <div className='space-y-3'>
                            <h5 className='text-xs uppercase tracking-wider text-gray-400 font-bold'>📋 Active Submissions</h5>
                            {submissions.map((item) => {
                              const isUrgent = new Date(item.s_dueDate) - Date.now() < 86400000;
                              const isOverdue = new Date(item.s_dueDate) < Date.now();
                              return (
                                <div key={item._id} className={`rounded-lg border p-4 text-xs ${isOverdue ? 'border-red-500/30 bg-red-500/10' : isUrgent ? 'border-orange-500/30 bg-orange-500/10' : 'border-gray-700/30 bg-[#0f1419]/50'}`}>
                                    <div className='flex items-start justify-between gap-2 mb-2'>
                                        <p className='font-bold text-white'>{item.s_title}</p>
                                        <span className={`text-[10px] font-bold ${isOverdue ? 'text-red-400' : isUrgent ? 'text-orange-400' : 'text-green-400'}`}>{isOverdue ? '⚠️ OVERDUE' : isUrgent ? '⏰ URGENT' : '✓ OK'}</span>
                                    </div>
                                    <p className='text-gray-400 mb-1'>Module: {item.s_module}</p>
                                    <p className='text-gray-500 text-[10px]'>Year {item.s_year} / Semester {item.s_semester}</p>
                                </div>
                            )})}
                        </div>
                    )}

                </div>
            )}
            <ConfirmModal show={confirmOpen} message="Are you sure you want to logout?"
                onConfirm={logout} onCancel={() => setConfirmOpen(false)}/>     

        </div>
    )
}

export default StudentNavbar