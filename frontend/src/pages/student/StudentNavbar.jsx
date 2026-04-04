import React, { useEffect, useState } from "react";
<<<<<<< HEAD
import { FaUser, FaPowerOff } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";
=======
import { FaUser, FaPowerOff, FaBell } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import API from "../../api";
>>>>>>> ra_new_part

const StudentNavbar = () => {

  const { user, logout, loading } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
<<<<<<< HEAD
=======
    const [notificationOpen, setNotificationOpen] = useState(false);
        const [submissions, setSubmissions] = useState([]);
>>>>>>> ra_new_part
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

<<<<<<< HEAD
  if (loading) return null; // or spinner

    return (
        <div className='flex justify-between items-center bg-[#1a1f2e] border-b border-gray-700 h-16 px-6 my_font_family'>
=======
    useEffect(() => {
        const fetchSubmissions = async () => {
            if (!user || user.u_role !== "student") return;
            try {
                const res = await API.get("/submissions/student/my");
                setSubmissions(res.data?.submissions || []);
            } catch (err) {
                setSubmissions([]);
            }
        };

        fetchSubmissions();
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

  if (loading) return null; // or spinner

    return (
        <div className='relative flex justify-between items-center bg-[#1a1f2e] border-b border-gray-700 h-16 px-6 my_font_family'>
>>>>>>> ra_new_part
            <div className='flex items-center text-white space-x-3'>
                <FaUser className='text-blue-500'/>
                <h3 className="text-white font-semibold">Welcome, {user?.u_name}</h3>
            </div>
<<<<<<< HEAD
            <div>
=======
            <div className='flex items-center space-x-4'>
                <button
                    onClick={() => setNotificationOpen((prev) => !prev)}
                    className="relative p-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 border border-yellow-500/50 rounded-lg transition"
                >
                    <FaBell className='text-lg'/>
                    {submissions.length > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                            {submissions.length}
                        </span>
                    )}
                </button>
>>>>>>> ra_new_part
                <div id='bt_section' className='relative'>
                    <button className="p-2 bg-red-500/20 text-red-400 border border-red-500 rounded-lg hover:bg-red-500/30 transition" onClick={() => setConfirmOpen(true)}> <FaPowerOff/> </button>
                    <div id="bt_text_main" className="absolute my_font_family text-xs font-bold px-2 py-1 border border-red-500 bg-red-500/20 text-red-400 z-50 rounded whitespace-nowrap"><p>Log-out</p></div>
                </div>
            </div>
<<<<<<< HEAD
=======

            {notificationOpen && (
                <div className='absolute right-6 top-16 z-50 w-[360px] max-h-[400px] overflow-y-auto rounded-xl border border-gray-700 bg-[#121a2e] p-3 shadow-2xl'>
                    <h4 className='mb-2 text-sm font-semibold text-white'>Submission Notifications</h4>
                    {submissions.length === 0 ? (
                        <p className='text-xs text-gray-400'>No submissions for your year/semester right now.</p>
                    ) : (
                        <div className='space-y-2'>
                            {submissions.map((item) => (
                                <div key={item._id} className='rounded-lg border border-gray-700 bg-[#0f1628] p-3'>
                                    <div className='flex items-start justify-between gap-2'>
                                        <p className='text-sm font-semibold text-white'>{item.s_title}</p>
                                        <span className='text-[11px] text-yellow-400'>{formatDate(item.s_dueDate)}</span>
                                    </div>
                                    <p className='mt-1 text-xs text-gray-300'>Module: {item.s_module}</p>
                                    <p className='text-xs text-gray-400'>Year {item.s_year} / Semester {item.s_semester}</p>
                                    <p className='text-xs text-cyan-300'>{getTimeLeftLabel(item.s_dueDate)}</p>
                                    {item.s_description && <p className='mt-1 text-xs text-gray-400'>{item.s_description}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
>>>>>>> ra_new_part
            {/* ConfirmModal */}
            <ConfirmModal show={confirmOpen} message="Are you sure you want to logout?"
                onConfirm={logout} onCancel={() => setConfirmOpen(false)}/>            
        </div>
    )
}

export default StudentNavbar