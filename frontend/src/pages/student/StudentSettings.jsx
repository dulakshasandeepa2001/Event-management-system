import React from 'react';
import { FaBell, FaShieldAlt, FaPalette, FaUserCircle, FaMoon, FaSun, FaLanguage, FaLock, FaTrashAlt } from 'react-icons/fa';
import ThemeToggleButton from '../../components/ThemeToggleButton.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

const toggleRows = [
  { title: 'Email notifications', description: 'Receive deadline and submission updates in your inbox.', enabled: true },
  { title: 'Push notifications', description: 'Get instant alerts for new notices and events.', enabled: false },
  { title: 'Dark mode', description: 'Keep the interface in the existing dark event hub style.', enabled: true },
  { title: 'Public profile visibility', description: 'Allow coordinators to view your profile card.', enabled: false },
];

const StudentSettings = () => {
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';

  return (
    <div className='min-h-full p-6 md:p-8 text-slate-100'>
      <div className='mb-8'>
        <p className='text-sm uppercase tracking-[0.28em] text-cyan-300/80'>Student Settings</p>
        <h1 className='mt-2 text-4xl font-bold text-white'>Personalize your portal</h1>
        <p className='mt-2 max-w-2xl text-sm text-slate-400'>UI-only settings for profile details, appearance, notifications, and privacy preferences.</p>
      </div>

      <div className='grid gap-6 xl:grid-cols-12'>
        <section className='xl:col-span-8 space-y-6'>
          <article className='rounded-2xl border border-cyan-400/10 bg-[#121a2f] p-5 shadow-xl shadow-black/10'>
            <div className='mb-5 flex items-center gap-3'>
              <div className='grid h-11 w-11 place-items-center rounded-xl bg-cyan-500/15 text-cyan-300'>
                <FaUserCircle className='text-xl' />
              </div>
              <div>
                <h2 className='text-lg font-semibold text-white'>Profile</h2>
                <p className='text-sm text-slate-400'>Keep your basic information visible and up to date.</p>
              </div>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <div>
                <label className='mb-2 block text-xs uppercase tracking-wider text-slate-400'>Full Name</label>
                <div className='rounded-xl border border-slate-700 bg-[#0e162b] px-4 py-3 text-sm text-slate-200'>rahul singh</div>
              </div>
              <div>
                <label className='mb-2 block text-xs uppercase tracking-wider text-slate-400'>Email</label>
                <div className='rounded-xl border border-slate-700 bg-[#0e162b] px-4 py-3 text-sm text-slate-200'>rahul.singh@my.sliit.lk</div>
              </div>
              <div>
                <label className='mb-2 block text-xs uppercase tracking-wider text-slate-400'>Reg No</label>
                <div className='rounded-xl border border-slate-700 bg-[#0e162b] px-4 py-3 text-sm text-slate-200'>UGR/2023/045</div>
              </div>
              <div>
                <label className='mb-2 block text-xs uppercase tracking-wider text-slate-400'>Course</label>
                <div className='rounded-xl border border-slate-700 bg-[#0e162b] px-4 py-3 text-sm text-slate-200'>Software Engineering</div>
              </div>
            </div>
          </article>

          <article className='rounded-2xl border border-cyan-400/10 bg-[#121a2f] p-5 shadow-xl shadow-black/10'>
            <div className='mb-5 flex items-center gap-3'>
              <div className='grid h-11 w-11 place-items-center rounded-xl bg-fuchsia-500/15 text-fuchsia-300'>
                <FaBell className='text-xl' />
              </div>
              <div>
                <h2 className='text-lg font-semibold text-white'>Notifications</h2>
                <p className='text-sm text-slate-400'>Choose how you want to stay informed.</p>
              </div>
            </div>

            <div className='space-y-3'>
              {toggleRows.map((item) => (
                <div key={item.title} className='flex items-start justify-between gap-4 rounded-xl border border-slate-700 bg-[#0e162b] p-4'>
                  <div>
                    <h3 className='text-sm font-semibold text-slate-100'>{item.title}</h3>
                    <p className='mt-1 text-xs text-slate-400'>{item.description}</p>
                  </div>
                  <div className={`mt-1 flex h-6 w-11 items-center rounded-full p-1 transition ${item.enabled ? 'justify-end bg-cyan-500/30' : 'justify-start bg-slate-700'}`}>
                    <div className={`h-4 w-4 rounded-full ${item.enabled ? 'bg-cyan-300' : 'bg-slate-300'}`} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className='rounded-2xl border border-cyan-400/10 bg-[#121a2f] p-5 shadow-xl shadow-black/10'>
            <div className='mb-5 flex items-center gap-3'>
              <div className='grid h-11 w-11 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300'>
                <FaShieldAlt className='text-xl' />
              </div>
              <div>
                <h2 className='text-lg font-semibold text-white'>Privacy & Security</h2>
                <p className='text-sm text-slate-400'>Simple controls for account safety and access.</p>
              </div>
            </div>

            <div className='grid gap-3 md:grid-cols-2'>
              <div className='rounded-xl border border-slate-700 bg-[#0e162b] p-4'>
                <div className='flex items-center gap-3'>
                  <FaLock className='text-cyan-300' />
                  <div>
                    <p className='text-sm font-semibold text-slate-100'>Change password</p>
                    <p className='text-xs text-slate-400'>UI placeholder for password reset flow.</p>
                  </div>
                </div>
              </div>
              <div className='rounded-xl border border-slate-700 bg-[#0e162b] p-4'>
                <div className='flex items-center gap-3'>
                  <FaTrashAlt className='text-rose-300' />
                  <div>
                    <p className='text-sm font-semibold text-slate-100'>Delete activity history</p>
                    <p className='text-xs text-slate-400'>Keep only the design, no action wired.</p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>

        <aside className='xl:col-span-4 space-y-6'>
          <article className='rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-[#14203b] to-[#0f172a] p-5 shadow-xl shadow-black/10'>
            <div className='flex items-center gap-3'>
              <div className='grid h-11 w-11 place-items-center rounded-xl bg-blue-500/15 text-blue-300'>
                <FaPalette className='text-xl' />
              </div>
              <div>
                <h2 className='text-lg font-semibold text-white'>Appearance</h2>
                <p className='text-sm text-slate-400'>Visual theme preview</p>
              </div>
            </div>

            <div className='mt-5 rounded-2xl border border-slate-700 bg-[#0b1222] p-4'>
              <div className='flex items-center justify-between text-sm text-slate-300'>
                <span>Theme</span>
                <span className='rounded-full bg-cyan-500/15 px-3 py-1 text-xs text-cyan-200'>
                  {isDarkTheme ? 'Dark' : 'Light'}
                </span>
              </div>
              <div className='mt-4 grid grid-cols-3 gap-2'>
                <div className='h-16 rounded-xl border border-slate-700 bg-[#0f1419]' />
                <div className='h-16 rounded-xl border border-slate-700 bg-[#121a2f]' />
                <div className='h-16 rounded-xl border border-slate-700 bg-[#1a2238]' />
              </div>
              <div className='mt-4 flex items-center gap-3 text-sm text-slate-400'>
                {isDarkTheme ? <FaMoon className='text-cyan-300' /> : <FaSun className='text-cyan-300' />}
                {isDarkTheme ? 'Dark theme is active for this portal.' : 'Light theme is active for this portal.'}
              </div>
              <div className='mt-4'>
                <ThemeToggleButton className='w-full justify-center' />
              </div>
            </div>
          </article>

          <article className='rounded-2xl border border-cyan-400/10 bg-[#121a2f] p-5 shadow-xl shadow-black/10'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='grid h-11 w-11 place-items-center rounded-xl bg-amber-500/15 text-amber-300'>
                <FaLanguage className='text-xl' />
              </div>
              <div>
                <h2 className='text-lg font-semibold text-white'>Language</h2>
                <p className='text-sm text-slate-400'>Interface language preview</p>
              </div>
            </div>

            <div className='rounded-xl border border-slate-700 bg-[#0e162b] px-4 py-3 text-sm text-slate-200'>English (UK)</div>
            <p className='mt-3 text-xs text-slate-400'>This is UI only. No backend changes are wired on this page.</p>
          </article>
        </aside>
      </div>
    </div>
  );
};

export default StudentSettings;
