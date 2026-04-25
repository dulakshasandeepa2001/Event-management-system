import React from 'react';
import {
  FaBuilding,
  FaCalendarAlt,
  FaTachometerAlt,
  FaUsers,
  FaCog,
  FaQuestion,
  FaSignOutAlt,
} from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
  const shellClassName =
    'fixed bottom-0 left-0 z-30 w-full border-t border-cyan-400/10 bg-[#070d1f]/95 backdrop-blur lg:top-0 lg:h-screen lg:w-72 lg:border-r lg:border-t-0 lg:bg-[#070d1f]';

  const brandCardClassName =
    'mb-6 rounded-2xl border border-cyan-300/15 bg-gradient-to-r from-[#0b1733] to-[#111c3a] p-4';

  const linkBaseClassName =
    'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition';

  const activeLinkClassName =
    'bg-gradient-to-r from-cyan-500/30 to-blue-500/20 text-cyan-100 border-cyan-300/30';

  const inactiveLinkClassName =
    'text-slate-300 border-transparent hover:bg-[#111938] hover:text-slate-100';

  const helperCardClassName =
    'mt-5 hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-[#0e1a3d] to-[#1a1140] p-4 lg:block';

  const helperButtonClassName =
    'mt-3 rounded-lg bg-cyan-500/20 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/30';

  const footerButtonClassName =
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 hover:bg-[#111938]';

  const logoutButtonClassName =
    'col-span-2 flex items-center gap-3 rounded-xl border border-rose-400/20 px-3 py-2.5 text-sm text-rose-200 hover:bg-rose-500/10 lg:col-span-1';

  const links = [
    { to: '/admin-dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { to: '/admin-dashboard/list-batch', icon: <FaBuilding />, label: 'Batches' },
    { to: '/admin-dashboard/events', icon: <FaCalendarAlt />, label: 'Events' },
    { to: '/admin-dashboard/users', icon: <FaUsers />, label: 'Users' },
  ];

  return (
    <aside className={shellClassName}>
      <div className="flex h-full flex-col justify-between p-4 lg:p-5">
        <div>
          <div className={brandCardClassName}>
            <h3 className="text-lg font-bold tracking-wide text-slate-100">
              Admin<span className="text-cyan-300">Hub</span>
            </h3>
            <p className="mt-1 text-xs text-slate-400">Admin Control Panel</p>
          </div>

          <nav className="grid grid-cols-2 gap-2 lg:grid-cols-1 lg:gap-1">
            {links.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.to === '/admin-dashboard'}
                className={({ isActive }) =>
                  `${linkBaseClassName} ${
                    isActive ? activeLinkClassName : inactiveLinkClassName
                  }`
                }
              >
                <span className="text-sm">{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className={helperCardClassName}>
            <p className="text-sm font-semibold text-slate-100">Need quick access?</p>
            <p className="mt-1 text-xs text-slate-400">
              Manage batches, events, and user controls from here.
            </p>
            <button className={helperButtonClassName}>Open Settings</button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-1 lg:gap-1">
          <button className={footerButtonClassName}>
            <FaQuestion />
            <span>Help</span>
          </button>
          <button className={footerButtonClassName}>
            <FaCog />
            <span>Settings</span>
          </button>
          <button className={logoutButtonClassName}>
            <FaSignOutAlt />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;