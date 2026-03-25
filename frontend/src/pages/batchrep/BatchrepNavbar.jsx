import React, { useEffect, useState } from "react";
import { FaUser, FaPowerOff, FaBell } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";

const BatchrepNavbar = () => {

  const { user, logout, loading } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  if (loading) return null; // or spinner

    return (
        <div className='flex justify-between items-center bg-gray-800 h-14 px-6 my_font_family'>
            <div className='flex items-center text-white space-x-2'>
                <FaUser/>
                <h3 className="text-white">Welcome {user?.u_name}</h3>
            </div>
            <div className='flex items-center space-x-3'>
                <button className="relative p-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 border border-yellow-500/50 rounded-lg transition">
                    <FaBell/>
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div id='bt_section' className='relative'>
                    <button className="p-1 bg-black text-red-500 border-2 rounded-full" onClick={() => setConfirmOpen(true)}> <FaPowerOff/> </button>
                    <div id="bt_text_main" className="absolute my_font_family text-xs font-bold px-1 border-2 border-black bg-white z-50"><p>Log-out</p></div>
                </div>
            </div>
            {/* ConfirmModal */}
            <ConfirmModal show={confirmOpen} message="Are you sure you want to logout?"
                onConfirm={logout} onCancel={() => setConfirmOpen(false)}/>            
        </div>
    )
}

export default BatchrepNavbar