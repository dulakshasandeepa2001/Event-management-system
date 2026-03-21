import React, { useEffect, useState } from "react";
import { FaUser, FaPowerOff } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";

const StudentNavbar = () => {

  const { user, logout, loading } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  if (loading) return null; // or spinner

    return (
        <div className='flex justify-between items-center bg-[#1a1f2e] border-b border-gray-700 h-16 px-6 my_font_family'>
            <div className='flex items-center text-white space-x-3'>
                <FaUser className='text-blue-500'/>
                <h3 className="text-white font-semibold">Welcome, {user?.u_name}</h3>
            </div>
            <div>
                <div id='bt_section' className='relative'>
                    <button className="p-2 bg-red-500/20 text-red-400 border border-red-500 rounded-lg hover:bg-red-500/30 transition" onClick={() => setConfirmOpen(true)}> <FaPowerOff/> </button>
                    <div id="bt_text_main" className="absolute my_font_family text-xs font-bold px-2 py-1 border border-red-500 bg-red-500/20 text-red-400 z-50 rounded whitespace-nowrap"><p>Log-out</p></div>
                </div>
            </div>
            {/* ConfirmModal */}
            <ConfirmModal show={confirmOpen} message="Are you sure you want to logout?"
                onConfirm={logout} onCancel={() => setConfirmOpen(false)}/>            
        </div>
    )
}

export default StudentNavbar