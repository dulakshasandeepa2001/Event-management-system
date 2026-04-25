import React, { useEffect } from "react";
import { FaUserCircle, FaBell, FaSearch, FaCommentAlt } from "react-icons/fa";  
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ThemeToggleButton from "../../components/ThemeToggleButton.jsx";

const BatchrepNavbar = () => {

  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  if (loading) return null;

    return (
        <header className='sticky top-0 z-20 border-b border-cyan-400/10 bg-[#050b18]/90 px-4 py-3 backdrop-blur md:px-6 lg:px-8'>
            <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
                <div className='flex items-center gap-3'>
                    <FaUserCircle className='text-3xl text-cyan-300' />
                    <div>
                        <h3 className="text-sm font-semibold text-slate-100 md:text-base">Welcome, {user?.u_name}</h3>
                        <p className='text-xs text-slate-400'>Manage events, notices, and batch engagement in one place.</p>
                    </div>
                </div>

                <div className='flex items-center gap-2 md:gap-3'>
                    <ThemeToggleButton variant='compact' />
                    <label className='flex min-w-[180px] flex-1 items-center gap-2 rounded-full border border-cyan-300/15 bg-[#0e1630] px-3 py-2 md:min-w-[320px]'>
                        <FaSearch className='text-slate-400' />
                        <input
                            type='text'
                            placeholder='Search here'
                            className='w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none'
                        />
                    </label>

                    <button className='grid h-9 w-9 place-items-center rounded-full border border-cyan-300/15 bg-[#0d1530] text-slate-300 hover:text-cyan-200'> 
                        <FaCommentAlt />
                    </button>
                    <button className='relative grid h-9 w-9 place-items-center rounded-full border border-cyan-300/15 bg-[#0d1530] text-slate-300 hover:text-cyan-200'>
                        <FaBell />
                        <span className='absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-400' />
                    </button>
                </div>
            </div>
        </header>
    )
}

export default BatchrepNavbar