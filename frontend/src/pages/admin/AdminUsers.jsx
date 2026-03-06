import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FaArrowRight,
  FaCheckCircle,
  FaExclamationTriangle,
  FaIdCard,
  FaSearch,
  FaSync,
  FaUserCog,
  FaUserEdit,
  FaUserGraduate,
  FaUserShield,
  FaUsers,
} from 'react-icons/fa';
import API from '../../api';
import { useTheme } from '../../context/ThemeContext.jsx';

const defaultSummary = {
  totalAccounts: 0,
  activeAccounts: 0,
  admins: 0,
  students: 0,
  lecturers: 0,
  batchreps: 0,
  userAccounts: 0,
  legacyBatchReps: 0,
};

const roleAccessCards = [
  {
    key: 'admin',
    title: 'Admin',
    icon: FaUserShield,
    border: 'border-blue-500/40',
    glow: 'from-blue-500/25 to-cyan-500/10',
    text: 'Full control over users, batches, events, marks, deadlines, and system settings.',
    points: ['Manage every account role', 'Edit and review all dashboards', 'Promote or reassign students'],
  },
  {
    key: 'lecturer',
    title: 'Lecturer',
    icon: FaUserCog,
    border: 'border-cyan-500/40',
    glow: 'from-cyan-500/25 to-teal-500/10',
    text: 'Lecture-only workspace for deadlines, submissions, event review, and detail inspection.',
    points: ['Create deadlines and submissions', 'Inspect event detail data', 'No batchrep dashboard access'],
  },
  {
    key: 'batchrep',
    title: 'Batch Rep',
    icon: FaUsers,
    border: 'border-emerald-500/40',
    glow: 'from-emerald-500/25 to-green-500/10',
    text: 'Student coordination and batch-scoped control for notices, events, and submissions.',
    points: ['Manage batch activity', 'Work with student records', 'Support submission and event flows'],
  },
  {
    key: 'student',
    title: 'Student',
    icon: FaUserGraduate,
    border: 'border-amber-500/40',
    glow: 'from-amber-500/25 to-orange-500/10',
    text: 'Personal dashboard for attending events, tracking submissions, marks, and settings.',
    points: ['Own submissions and marks', 'View event and deadline data', 'Update profile settings'],
  },
];

const darkRoleBadgeClasses = {
  admin: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
  lecturer: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/30',
  batchrep: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
  student: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
};

const lightRoleBadgeClasses = {
  admin: 'bg-blue-500/15 text-black border-blue-400/30',
  lecturer: 'bg-cyan-500/15 text-black border-cyan-400/30',
  batchrep: 'bg-emerald-500/15 text-black border-emerald-400/30',
  student: 'bg-amber-500/15 text-black border-amber-400/30',
};

const accountTypeBadgeClasses = {
  user: 'bg-slate-700/70 text-slate-100 border-slate-600/60',
  rep: 'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-500/30',
};

const darkStatusBadgeClasses = {
  active: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
  inactive: 'bg-rose-500/20 text-rose-200 border-rose-500/30',
  legacy: 'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-500/30',
};

const lightStatusBadgeClasses = {
  active: 'bg-emerald-500/15 text-black border-emerald-400/30',
  inactive: 'bg-rose-500/15 text-black border-rose-400/30',
  legacy: 'bg-fuchsia-500/15 text-black border-fuchsia-400/30',
};

const roleOptions = [
  { value: 'all', label: 'All roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'student', label: 'Student' },
  { value: 'batchrep', label: 'Batch Rep' },
  { value: 'lecturer', label: 'Lecturer' },
];

const accountTypeOptions = [
  { value: 'all', label: 'All accounts' },
  { value: 'user', label: 'User accounts' },
  { value: 'rep', label: 'Legacy rep accounts' },
];

const AdminUsers = () => {
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';
  const [accounts, setAccounts] = useState([]);
  const [summary, setSummary] = useState(defaultSummary);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [searchDraft, setSearchDraft] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');
  const [pendingRoles, setPendingRoles] = useState({});

  const roleBadgeClasses = isDarkTheme ? darkRoleBadgeClasses : lightRoleBadgeClasses;
  const statusBadgeClasses = isDarkTheme ? darkStatusBadgeClasses : lightStatusBadgeClasses;
  const rolePointClassName = isDarkTheme ? 'flex items-start gap-3 text-sm text-slate-100/90' : 'flex items-start gap-3 text-sm text-slate-900';

  useEffect(() => {
    const loadAccounts = async () => {
      setLoading(true);

      try {
        const res = await API.get('/users', {
          params: {
            search: searchTerm,
            role: roleFilter,
            accountType: accountTypeFilter,
            limit: 1000,
            skip: 0,
          },
        });

        const nextAccounts = res.data?.users || [];
        const nextRoles = {};

        nextAccounts.forEach((account) => {
          if (account.accountType === 'user') {
            nextRoles[account.id] = account.u_role;
          }
        });

        setAccounts(nextAccounts);
        setPendingRoles(nextRoles);
        setSummary(res.data?.summary || defaultSummary);
      } catch (err) {
        console.error('Failed to load users:', err);
        setAccounts([]);
        setSummary(defaultSummary);
        toast.error(err.response?.data?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, [searchTerm, roleFilter, accountTypeFilter, reloadKey]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSearchTerm(searchDraft.trim());
    setReloadKey((value) => value + 1);
  };

  const handleClearFilters = () => {
    setSearchDraft('');
    setSearchTerm('');
    setRoleFilter('all');
    setAccountTypeFilter('all');
  };

  const refreshAccounts = () => {
    setReloadKey((value) => value + 1);
  };

  const updateRoleDraft = (accountId, value) => {
    setPendingRoles((prev) => ({ ...prev, [accountId]: value }));
  };

  const updateRole = async (account, nextRole) => {
    if (!nextRole || nextRole === account.u_role) {
      toast.info('Role already matches the selected value');
      return;
    }

    setSavingId(account.id);

    try {
      const res = await API.patch(`/users/${account.id}/role`, {
        u_role: nextRole,
      });

      toast.success(res.data?.message || 'Role updated');
      setReloadKey((value) => value + 1);
    } catch (err) {
      console.error('Failed to update role:', err);
      toast.error(err.response?.data?.message || 'Failed to update role');
    } finally {
      setSavingId(null);
    }
  };

  const roleCountCards = [
    { label: 'Total accounts', value: summary.totalAccounts, icon: FaIdCard, accent: 'text-sky-300', bg: 'bg-sky-500/10' },
    { label: 'Active accounts', value: summary.activeAccounts, icon: FaCheckCircle, accent: 'text-emerald-300', bg: 'bg-emerald-500/10' },
    { label: 'Students', value: summary.students, icon: FaUserGraduate, accent: 'text-amber-300', bg: 'bg-amber-500/10' },
    { label: 'Batch reps', value: summary.batchreps, icon: FaUsers, accent: 'text-emerald-300', bg: 'bg-emerald-500/10' },
    { label: 'Lecturers', value: summary.lecturers, icon: FaUserCog, accent: 'text-cyan-300', bg: 'bg-cyan-500/10' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#111827] to-[#0b1220] p-8 text-white">
      <div className="space-y-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                <FaUserShield /> Admin Users
              </div>
              <h1 className="text-4xl font-black tracking-tight md:text-5xl">Role Access Control Center</h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Review every account, promote students to batch reps, and keep role access aligned with the dashboards they should see.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={refreshAccounts}
                className="inline-flex items-center gap-2 rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/20"
              >
                <FaSync className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
              >
                Reset filters
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {roleCountCards.map((card) => {
            const IconComponent = card.icon;

            return (
              <div key={card.label} className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/10 backdrop-blur">
                <div className={`mb-4 inline-flex rounded-xl ${card.bg} p-3`}>
                  <IconComponent className={card.accent} />
                </div>
                <p className="text-sm text-slate-400">{card.label}</p>
                <p className="mt-2 text-3xl font-black text-white">{card.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {roleAccessCards.map((card) => {
            const IconComponent = card.icon;

            return (
              <div
                key={card.key}
                className={`rounded-3xl border ${card.border} bg-gradient-to-br ${card.glow} p-6 shadow-xl shadow-black/15`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                      <IconComponent />
                      {card.title}
                    </div>
                    <p className="mt-4 text-lg font-bold text-white">{card.text}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {card.points.map((point) => (
                    <div key={point} className={rolePointClassName}>
                      <FaCheckCircle className="mt-0.5 shrink-0 text-emerald-300" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <form className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_0.8fr_0.8fr_auto]" onSubmit={handleSearchSubmit}>
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0f1419] px-4 py-3 text-slate-200 focus-within:border-cyan-400/60">
              <FaSearch className="text-slate-400" />
              <input
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                type="text"
                placeholder="Search by name, email, or registration number"
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
            </label>

            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="rounded-2xl border border-white/10 bg-[#0f1419] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={accountTypeFilter}
              onChange={(event) => setAccountTypeFilter(event.target.value)}
              className="rounded-2xl border border-white/10 bg-[#0f1419] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60"
            >
              {accountTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-cyan-600"
            >
              <FaSearch />
              Search
            </button>
          </form>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-[#0f1419]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Account</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Details</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Access</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10 bg-[#0b1220]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                        <div className="inline-flex items-center gap-3">
                          <FaSync className="animate-spin" />
                          Loading accounts...
                        </div>
                      </td>
                    </tr>
                  ) : accounts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                        No accounts found for the current filters.
                      </td>
                    </tr>
                  ) : (
                    accounts.map((account) => {
                      const isLegacyRep = account.accountType === 'rep';
                      const currentRole = account.u_role || 'student';
                      const roleDraft = pendingRoles[account.id] || currentRole;

                      return (
                        <tr key={`${account.accountType}-${account.id}`} className="hover:bg-white/5">
                          <td className="px-4 py-4 align-top">
                            <div className="flex items-start gap-3">
                              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                <FaIdCard className="text-cyan-300" />
                              </div>
                              <div>
                                <p className="font-semibold text-white">{account.u_name || 'Unnamed account'}</p>
                                <p className="text-sm text-slate-400">{account.u_email || 'No email'}</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${accountTypeBadgeClasses[account.accountType] || accountTypeBadgeClasses.user}`}>
                                    {isLegacyRep ? 'Legacy rep' : 'User account'}
                                  </span>
                                  {account.u_regno ? (
                                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200">
                                      {account.u_regno}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 align-top text-sm text-slate-300">
                            <div className="space-y-1">
                              <p>{account.u_course || 'No course set'}</p>
                              <p className="text-slate-500">{account.u_faculty || 'No faculty set'}</p>
                              <p className="text-slate-500">
                                {account.u_year ? `Year ${account.u_year}` : 'Year not set'}
                                {account.u_semester ? ` • Semester ${account.u_semester}` : ''}
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-4 align-top">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${roleBadgeClasses[currentRole] || roleBadgeClasses.student}`}>
                              {currentRole}
                            </span>
                          </td>

                          <td className="px-4 py-4 align-top text-sm text-slate-300">
                            {isLegacyRep ? 'Legacy batch rep record' : 'Editable user account'}
                          </td>

                          <td className="px-4 py-4 align-top">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                              isLegacyRep
                                ? statusBadgeClasses.legacy
                                : account.u_isActive
                                  ? statusBadgeClasses.active
                                  : statusBadgeClasses.inactive
                            }`}>
                              {isLegacyRep ? 'Legacy' : account.u_isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>

                          <td className="px-4 py-4 align-top">
                            {isLegacyRep ? (
                              <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300">
                                <FaExclamationTriangle className="text-fuchsia-300" />
                                Read only
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                  <select
                                    value={roleDraft}
                                    onChange={(event) => updateRoleDraft(account.id, event.target.value)}
                                    className="rounded-xl border border-white/10 bg-[#0f1419] px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400/60"
                                  >
                                    {roleOptions
                                      .filter((option) => option.value !== 'all')
                                      .map((option) => (
                                        <option key={option.value} value={option.value}>
                                          {option.label}
                                        </option>
                                      ))}
                                  </select>

                                  <button
                                    type="button"
                                    onClick={() => updateRole(account, roleDraft)}
                                    disabled={savingId === account.id}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {savingId === account.id ? <FaSync className="animate-spin" /> : <FaUserEdit />}
                                    Save role
                                  </button>
                                </div>

                                {account.u_role === 'student' ? (
                                  <button
                                    type="button"
                                    onClick={() => updateRole(account, 'batchrep')}
                                    disabled={savingId === account.id}
                                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    Promote to rep
                                    <FaArrowRight />
                                  </button>
                                ) : null}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
            <p>
              Showing {accounts.length} of {summary.totalAccounts} accounts
            </p>
            <p>
              Legacy batch reps: {summary.legacyBatchReps} • User accounts: {summary.userAccounts}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;