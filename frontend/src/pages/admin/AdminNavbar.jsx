import React, { useEffect, useState } from "react";
import { FaUser, FaPowerOff, FaBell } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";

const AdminNavbar = () => {

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
                <div className='bg-blue-500/20 p-2 rounded-lg'>
                    <FaUser className='text-blue-500 text-lg'/>
                </div>
                <h3 className="text-white font-semibold">Welcome, {user?.u_name}</h3>
            </div>
            <div className='flex items-center space-x-4'>
                <button className="relative p-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 border border-yellow-500/50 rounded-lg transition">
                    <FaBell className='text-lg'/>
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div id='bt_section' className='relative'>
                    <button className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50 rounded-lg transition" onClick={() => setConfirmOpen(true)}> 
                        <FaPowerOff className='text-lg'/> 
                    </button>
                    <div id="bt_text_main" className="absolute my_font_family text-xs font-bold px-2 py-1 border border-gray-600 bg-[#1a1f2e] text-white rounded z-50 right-0 mt-1"><p>Logout</p></div>
                </div>
            </div>
            {/* ConfirmModal */}
            <ConfirmModal show={confirmOpen} message="Are you sure you want to logout?"
                onConfirm={logout} onCancel={() => setConfirmOpen(false)}/>            
        </div>
    )
}

export default AdminNavbar