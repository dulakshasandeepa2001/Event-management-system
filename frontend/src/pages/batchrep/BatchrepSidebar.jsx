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
import { useTheme } from '../../context/ThemeContext.jsx';

const BatchrepSidebar = () => {

   const navigate = useNavigate();
   const location = useLocation();
   const { logout } = useAuth();
   const { isDarkTheme } = useTheme();

   const shellClassName = isDarkTheme
      ? 'fixed bottom-0 left-0 z-30 w-full border-t border-cyan-400/10 bg-[#070d1f]/95 backdrop-blur lg:top-0 lg:h-screen lg:w-72 lg:border-r lg:border-t-0 lg:bg-[#070d1f]'
      : 'fixed bottom-0 left-0 z-30 w-full border-t border-slate-200 bg-white/95 text-slate-900 shadow-[0_-12px_40px_rgba(15,23,42,0.08)] backdrop-blur lg:top-0 lg:h-screen lg:w-72 lg:border-r lg:border-t-0 lg:border-slate-200 lg:bg-white';

   const brandCardClassName = isDarkTheme
      ? 'mb-6 rounded-2xl border border-cyan-300/15 bg-gradient-to-r from-[#0b1733] to-[#111c3a] p-4'
      : 'mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm';

   const linkBaseClassName = 'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition';
   const activeLinkClassName = isDarkTheme
      ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/20 text-cyan-100 border-cyan-300/30'
      : 'bg-white text-slate-900 border-cyan-200 shadow-sm';
   const inactiveLinkClassName = isDarkTheme
      ? 'text-slate-300 border-transparent hover:bg-[#111938] hover:text-slate-100'
      : 'text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-900';

   const helperCardClassName = isDarkTheme
      ? 'mt-5 hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-[#0e1a3d] to-[#1a1140] p-4 lg:block'
      : 'mt-5 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:block';

   const helperButtonClassName = isDarkTheme
      ? 'mt-3 rounded-lg bg-cyan-500/20 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/30'
      : 'mt-3 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-200';

   const footerButtonClassName = isDarkTheme
      ? 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 hover:bg-[#111938]'
      : 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100';

   const logoutButtonClassName = isDarkTheme
      ? 'col-span-2 flex items-center gap-3 rounded-xl border border-rose-400/20 px-3 py-2.5 text-sm text-rose-200 hover:bg-rose-500/10 lg:col-span-1'
      : 'col-span-2 flex items-center gap-3 rounded-xl border border-rose-200 px-3 py-2.5 text-sm text-rose-700 hover:bg-rose-50 lg:col-span-1';

   const links = [
      { to: '/batchrep-dashboard', icon: <FaChartPie />, label: 'Overview' },   
      { to: '/batchrep-dashboard/list-event', icon: <FaCalendarAlt />, label: 'Events' },
      { to: '/batchrep-dashboard/students', icon: <FaUsers />, label: 'Students' },
      { to: '/batchrep-dashboard/submissions', icon: <FaFileAlt />, label: 'Submissions' },
      { to: '/batchrep-dashboard/notices', icon: <FaBullhorn />, label: 'Notices' },
   ];

   return (
      <aside className={shellClassName}>
         <div className='flex h-full flex-col justify-between p-4 lg:p-5'>      

            <div>
               <div className={brandCardClassName}>
                  <h3 className={isDarkTheme ? 'text-lg font-bold tracking-wide text-slate-100' : 'text-lg font-bold tracking-wide text-slate-900'}>
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
                           `${linkBaseClassName} ${((link.to !== '/batchrep-dashboard' && location.pathname.startsWith(link.to)) || isActive)
                              ? activeLinkClassName
                              : inactiveLinkClassName
                           }`
                        }
                     >
                        <span className='text-sm'>{link.icon}</span>
                        <span>{link.label}</span>
                     </NavLink>
                  ))}
               </nav>

               <div className={helperCardClassName}>
                  <p className={isDarkTheme ? 'text-sm font-semibold text-slate-100' : 'text-sm font-semibold text-slate-900'}>Need to publish updates?</p>
                  <p className='mt-1 text-xs text-slate-400'>Share event notices and announcements quickly.</p>
                  <button
                     onClick={() => navigate('/batchrep-dashboard/list-event')}
                     className={helperButtonClassName}
                  >
                     Open Event Board
                  </button>
               </div>
            </div>

            <div className='mt-3 grid grid-cols-2 gap-2 lg:grid-cols-1 lg:gap-1'>
               <button className={footerButtonClassName}>
                  <FaLifeRing />
                  <span>Help</span>
               </button>
               <button className={footerButtonClassName}>
                  <FaCog />
                  <span>Settings</span>
               </button>
               <button onClick={logout} className={logoutButtonClassName}>
                  <FaSignOutAlt />
                  <span>Log Out</span>
               </button>
            </div>
         </div>
      </aside>
   )
}

export default BatchrepSidebar;