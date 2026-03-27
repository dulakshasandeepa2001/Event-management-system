import React from 'react'
import {
   FaChartPie,
   FaCalendarAlt,
   FaFileAlt,
   FaUsers,
   FaBullhorn,
   FaLifeRing,
   FaCog,
   FaSignOutAlt,
} from 'react-icons/fa'
import { NavLink } from 'react-router-dom'  
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const BatchrepSidebar = () => {

   const navigate = useNavigate(); 
   const location = useLocation();
   const { logout } = useAuth();

   const links = [
      { to: '/batchrep-dashboard', icon: <FaChartPie />, label: 'Overview' },
      { to: '/batchrep-dashboard/events', icon: <FaCalendarAlt />, label: 'Events' },
      { to: '/batchrep-dashboard/students', icon: <FaUsers />, label: 'Students' },
      { to: '/batchrep-dashboard/submissions', icon: <FaFileAlt />, label: 'Submissions' },
      { to: '/batchrep-dashboard/notices', icon: <FaBullhorn />, label: 'Notices' },
   ];

   return (
      <aside className="fixed bottom-0 left-0 z-30 w-full border-t border-cyan-400/10 bg-[#070d1f]/95 backdrop-blur lg:top-0 lg:h-screen lg:w-72 lg:border-r lg:border-t-0 lg:bg-[#070d1f]">
         <div className='flex h-full flex-col justify-between p-4 lg:p-5'>

            <div>
               <div className='mb-6 rounded-2xl border border-cyan-300/15 bg-gradient-to-r from-[#0b1733] to-[#111c3a] p-4'>
                  <h3 className="text-lg font-bold tracking-wide text-slate-100">
                     Batch<span className='text-cyan-300'>Console</span>
                  </h3>
                  <p className='mt-1 text-xs text-slate-400'>Batch Representative Panel</p>
               </div>

               <nav className="grid grid-cols-2 gap-2 lg:grid-cols-1 lg:gap-1">
                  {links.map((link) => (
                     <NavLink
                        key={link.label}
                        to={link.to}
                        end={link.to === '/batchrep-dashboard'}
                        className={({ isActive }) =>
                           `${((link.to !== '/batchrep-dashboard' && location.pathname.startsWith(link.to)) || isActive)
                              ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/20 text-cyan-100 border-cyan-300/30'
                              : 'text-slate-300 border-transparent hover:bg-[#111938] hover:text-slate-100'
                           } flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition`
                        }
                     >
                        <span className='text-sm'>{link.icon}</span>
                        <span>{link.label}</span>
                     </NavLink>
                  ))}
               </nav>

               <div className='mt-5 hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-[#0e1a3d] to-[#1a1140] p-4 lg:block'>
                  <p className='text-sm font-semibold text-slate-100'>Need to publish updates?</p>
                  <p className='mt-1 text-xs text-slate-400'>Share event notices and announcements quickly.</p>
                  <button
                     onClick={() => navigate('/events')}
                     className='mt-3 rounded-lg bg-cyan-500/20 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/30'
                  >
                     Open Event Board
                  </button>
               </div>
            </div>

            <div className='mt-3 grid grid-cols-2 gap-2 lg:grid-cols-1 lg:gap-1'>
               <button className='flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 hover:bg-[#111938]'>
                  <FaLifeRing />
                  <span>Help</span>
               </button>
               <button className='flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 hover:bg-[#111938]'>
                  <FaCog />
                  <span>Settings</span>
               </button>
               <button
                  onClick={logout}
                  className='col-span-2 flex items-center gap-3 rounded-xl border border-rose-400/20 px-3 py-2.5 text-sm text-rose-200 hover:bg-rose-500/10 lg:col-span-1'
               >
                  <FaSignOutAlt />
                  <span>Log Out</span>
               </button>
            </div>
         </div>
      </aside>
   )
}

export default BatchrepSidebar;