import React, { useEffect, useMemo, useState } from 'react';
import {
  FaArrowRight,
  FaCalendarAlt,
  FaClock,
  FaComments,
  FaEye,
  FaFileAlt,
  FaPlus,
  FaRegFileAlt,
  FaSearch,
  FaSyncAlt,
  FaUsers,
  FaClipboardList,
} from 'react-icons/fa';
import API from '../../api';
import { useAuth } from '../../context/AuthContext.jsx';

const initialDeadlineForm = {
  d_title: '',
  d_subject: '',
  d_description: '',
  d_year: '1',
  d_semester: '1',
  d_course: '',
  d_dueDate: '',
};

const initialSubmissionForm = {
  s_title: '',
  s_module: '',
  s_description: '',
  s_year: '1',
  s_semester: '1',
  s_course: '',
  s_dueDate: '',
};

const yearOptions = ['1', '2', '3', '4'];
const semesterOptions = ['1', '2'];

const safeDate = (value) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDate = (value) => {
  const parsed = safeDate(value);
  return parsed ? parsed.toLocaleDateString('en-GB') : '-';
};

const daysLeftLabel = (value) => {
  const parsed = safeDate(value);
  if (!parsed) return '-';

  const diff = parsed.getTime() - Date.now();
  if (diff < 0) return 'Past due';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days} day${days === 1 ? '' : 's'} left`;

  const hours = Math.max(1, Math.floor(diff / (1000 * 60 * 60)));
  return `${hours} hour${hours === 1 ? '' : 's'} left`;
};

const LectureSummary = () => {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [deadlineForm, setDeadlineForm] = useState(initialDeadlineForm);
  const [submissionForm, setSubmissionForm] = useState(initialSubmissionForm);
  const [deadlineSaving, setDeadlineSaving] = useState(false);
  const [submissionSaving, setSubmissionSaving] = useState(false);
  const [eventQuery, setEventQuery] = useState('');
  const [submissionQuery, setSubmissionQuery] = useState('');
  const [eventDetail, setEventDetail] = useState(null);
  const [submissionDetail, setSubmissionDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadData = async () => {
    try {
      setError('');
      const [eventsRes, deadlinesRes, submissionsRes] = await Promise.all([
        API.get('/events'),
        API.get('/deadlines'),
        API.get('/submissions'),
      ]);

      setEvents(eventsRes.data?.events || []);
      setDeadlines(deadlinesRes.data?.deadlines || []);
      setSubmissions(submissionsRes.data?.submissions || []);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || 'Failed to load lecture workspace.');
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await loadData();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const refresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
      setMessage('Workspace refreshed.');
    } finally {
      setRefreshing(false);
    }
  };

  const upcomingDeadlines = useMemo(() => {
    return deadlines.filter((item) => {
      const parsed = safeDate(item.d_dueDate);
      if (!parsed) return false;
      const diff = parsed.getTime() - Date.now();
      return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
    });
  }, [deadlines]);

  const activeSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      const parsed = safeDate(item.s_dueDate);
      return parsed ? parsed.getTime() >= Date.now() : false;
    });
  }, [submissions]);

  const filteredEvents = useMemo(() => {
    const q = eventQuery.trim().toLowerCase();
    if (!q) return events;
    return events.filter((item) => {
      const title = (item.title || '').toLowerCase();
      const category = (item.category || '').toLowerCase();
      const location = (item.location || '').toLowerCase();
      return title.includes(q) || category.includes(q) || location.includes(q);
    });
  }, [events, eventQuery]);

  const filteredSubmissions = useMemo(() => {
    const q = submissionQuery.trim().toLowerCase();
    if (!q) return submissions;
    return submissions.filter((item) => {
      const title = (item.s_title || '').toLowerCase();
      const module = (item.s_module || '').toLowerCase();
      const course = (item.s_course || '').toLowerCase();
      return title.includes(q) || module.includes(q) || course.includes(q);
    });
  }, [submissions, submissionQuery]);

  const dashboardStats = [
    { label: 'Events', value: events.length, note: 'Visible event records', icon: <FaCalendarAlt /> },
    { label: 'Deadlines', value: deadlines.length, note: 'Created deadline items', icon: <FaClock /> },
    { label: 'Submissions', value: submissions.length, note: 'Submission sheets available', icon: <FaClipboardList /> },
    { label: 'Urgent Items', value: upcomingDeadlines.length + activeSubmissions.length, note: 'Due in the next 7 days', icon: <FaRegFileAlt /> },
  ];

  const handleDeadlineChange = (event) => {
    const { name, value } = event.target;
    setDeadlineForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmissionChange = (event) => {
    const { name, value } = event.target;
    setSubmissionForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeadlineSubmit = async (event) => {
    event.preventDefault();
    try {
      setDeadlineSaving(true);
      setMessage('');
      setError('');
      await API.post('/deadlines', deadlineForm);
      setDeadlineForm(initialDeadlineForm);
      await loadData();
      setMessage('Deadline created successfully.');
    } catch (submitError) {
      setError(submitError?.response?.data?.message || 'Failed to create deadline.');
    } finally {
      setDeadlineSaving(false);
    }
  };

  const handleSubmissionSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmissionSaving(true);
      setMessage('');
      setError('');
      await API.post('/submissions', submissionForm);
      setSubmissionForm(initialSubmissionForm);
      await loadData();
      setMessage('Submission created successfully.');
    } catch (submitError) {
      setError(submitError?.response?.data?.message || 'Failed to create submission.');
    } finally {
      setSubmissionSaving(false);
    }
  };

  const openEventDetail = async (id) => {
    try {
      setDetailLoading(true);
      setEventDetail(null);
      const response = await API.get(`/event/${id}/details`);
      setEventDetail(response.data);
    } catch (detailError) {
      setError(detailError?.response?.data?.message || 'Failed to load event details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const openSubmissionDetail = async (id) => {
    try {
      setDetailLoading(true);
      setSubmissionDetail(null);
      const response = await API.get(`/submissions/${id}/engagement`);
      setSubmissionDetail(response.data);
    } catch (detailError) {
      setError(detailError?.response?.data?.message || 'Failed to load submission details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModals = () => {
    setEventDetail(null);
    setSubmissionDetail(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1419] p-6 md:p-10 flex items-center justify-center">
        <div className="bg-[#1a1f2e]/60 border border-gray-700/30 rounded-2xl p-8 text-center text-gray-400 backdrop-blur-sm">
          <p className="text-lg">Loading lecture workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1419] p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8 text-slate-100">
        <section id="overview" className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-500/2 p-8 md:p-10 backdrop-blur-sm shadow-lg shadow-blue-500/5">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-24 left-16 h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-100">
              <FaUsers /> Lecture role
            </div>
            <h1 className="mt-5 text-3xl font-bold leading-tight text-white md:text-5xl">
              {user?.u_name || 'Lecturer'}, this workspace is focused on deadlines, submissions, event review, and detail tracking.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              The lecture account stays inside this page. It can create deadlines and submissions, inspect event data, and open detailed student submission collections without touching admin or student dashboards.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#deadlines" className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-[#03111f] transition hover:bg-cyan-400">
                Create Deadline <FaArrowRight />
              </a>
              <a href="#submissions" className="inline-flex items-center gap-2 rounded-full border border-slate-600 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/10">
                Create Submission <FaArrowRight />
              </a>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:w-[430px] xl:grid-cols-2">
            {dashboardStats.map((card) => (
              <article key={card.label} className="bg-[#1a1f2e]/60 border border-gray-700/30 rounded-2xl p-5 backdrop-blur-sm hover:border-blue-500/40 transition-all duration-300">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{card.label}</p>
                  <span className="text-blue-400 text-lg">{card.icon}</span>
                </div>
                <p className="text-3xl font-bold text-white mb-1">{card.value}</p>
                <p className="text-sm text-gray-500">{card.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {(message || error) && (
        <div className={`rounded-2xl border px-4 py-3 text-sm backdrop-blur-sm ${error ? 'border-red-500/30 bg-red-500/10 text-red-200' : 'border-green-500/30 bg-green-500/10 text-green-200'}`}>
          {error || message}
        </div>
      )}

      <section id="deadlines" className="grid gap-6 xl:grid-cols-12">
        <article className="xl:col-span-5 bg-[#1a1f2e]/60 border border-gray-700/30 rounded-2xl p-7 backdrop-blur-sm shadow-lg shadow-gray-700/5">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Deadlines</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Create deadline</h2>
            </div>
            <FaClock className="text-blue-400 text-xl" />
          </div>

          <form onSubmit={handleDeadlineSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-300">Title</span>
                <input
                  name="d_title"
                  value={deadlineForm.d_title}
                  onChange={handleDeadlineChange}
                  className="w-full rounded-lg border border-gray-700/50 bg-[#0f1419]/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50 focus:bg-[#0f1419] placeholder-gray-600"
                  placeholder="Deadline title"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-300">Subject</span>
                <input
                  name="d_subject"
                  value={deadlineForm.d_subject}
                  onChange={handleDeadlineChange}
                  className="w-full rounded-lg border border-gray-700/50 bg-[#0f1419]/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50 focus:bg-[#0f1419] placeholder-gray-600"
                  placeholder="Subject name"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-300">Year</span>
                <select
                  name="d_year"
                  value={deadlineForm.d_year}
                  onChange={handleDeadlineChange}
                  className="w-full rounded-lg border border-gray-700/50 bg-[#0f1419]/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50 focus:bg-[#0f1419]"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>Year {year}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-300">Semester</span>
                <select
                  name="d_semester"
                  value={deadlineForm.d_semester}
                  onChange={handleDeadlineChange}
                  className="w-full rounded-lg border border-gray-700/50 bg-[#0f1419]/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50 focus:bg-[#0f1419]"
                >
                  {semesterOptions.map((semester) => (
                    <option key={semester} value={semester}>Semester {semester}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-300">Course</span>
              <input
                name="d_course"
                value={deadlineForm.d_course}
                onChange={handleDeadlineChange}
                className="w-full rounded-lg border border-gray-700/50 bg-[#0f1419]/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50 focus:bg-[#0f1419] placeholder-gray-600"
                placeholder="Course name"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-300">Due date</span>
              <input
                type="date"
                name="d_dueDate"
                value={deadlineForm.d_dueDate}
                onChange={handleDeadlineChange}
                className="w-full rounded-lg border border-gray-700/50 bg-[#0f1419]/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50 focus:bg-[#0f1419]"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-300">Description</span>
              <textarea
                name="d_description"
                value={deadlineForm.d_description}
                onChange={handleDeadlineChange}
                rows="4"
                className="w-full rounded-lg border border-gray-700/50 bg-[#0f1419]/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50 focus:bg-[#0f1419] placeholder-gray-600"
                placeholder="Add a short deadline description"
              />
            </label>

            <button
              type="submit"
              disabled={deadlineSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-500/20 border border-blue-500/30 px-5 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/30 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FaPlus /> {deadlineSaving ? 'Creating...' : 'Create Deadline'}
            </button>
          </form>
        </article>

        <article className="xl:col-span-7 bg-[#1a1f2e]/60 border border-gray-700/30 rounded-2xl p-7 backdrop-blur-sm shadow-lg shadow-gray-700/5">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Deadline List</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Upcoming and created deadlines</h2>
            </div>
            <span className="rounded-lg border border-gray-700/30 bg-[#0f1419]/80 px-3 py-1 text-xs font-semibold text-gray-400">
              {deadlines.length} total
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-700/30 bg-[#0f1419]/40">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#1a1f2e]/40 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-700/30">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Scope</th>
                </tr>
              </thead>
              <tbody>
                {upcomingDeadlines.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">
                      No deadlines due in the next 7 days.
                    </td>
                  </tr>
                ) : (
                  upcomingDeadlines.map((item) => (
                    <tr key={item._id} className="hover:bg-[#252d3d]/40 transition-colors duration-200 border-b border-gray-700/30 text-sm text-gray-300">
                      <td className="px-6 py-4 font-semibold text-white">{item.d_title}</td>
                      <td className="px-6 py-4">{item.d_subject}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p>{formatDate(item.d_dueDate)}</p>
                          <p className="text-xs text-gray-500 mt-1">{daysLeftLabel(item.d_dueDate)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {item.d_year ? `Year ${item.d_year}` : '-'} / {item.d_semester ? `Sem ${item.d_semester}` : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section id="submissions" className="grid gap-6 xl:grid-cols-12">
        <article className="xl:col-span-5 bg-[#1a1f2e]/60 border border-gray-700/30 rounded-2xl p-7 backdrop-blur-sm shadow-lg shadow-gray-700/5">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Submissions</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Create submission</h2>
            </div>
            <FaClipboardList className="text-blue-400 text-xl" />
          </div>

          <form onSubmit={handleSubmissionSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-300">Title</span>
                <input
                  name="s_title"
                  value={submissionForm.s_title}
                  onChange={handleSubmissionChange}
                  className="w-full rounded-lg border border-gray-700/50 bg-[#0f1419]/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50 focus:bg-[#0f1419] placeholder-gray-600"
                  placeholder="Submission title"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-300">Module</span>
                <input
                  name="s_module"
                  value={submissionForm.s_module}
                  onChange={handleSubmissionChange}
                  className="w-full rounded-lg border border-gray-700/50 bg-[#0f1419]/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50 focus:bg-[#0f1419] placeholder-gray-600"
                  placeholder="Module name"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-300">Year</span>
                <select
                  name="s_year"
                  value={submissionForm.s_year}
                  onChange={handleSubmissionChange}
                  className="w-full rounded-lg border border-gray-700/50 bg-[#0f1419]/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50 focus:bg-[#0f1419]"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>Year {year}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-300">Semester</span>
                <select
                  name="s_semester"
                  value={submissionForm.s_semester}
                  onChange={handleSubmissionChange}
                  className="w-full rounded-lg border border-gray-700/50 bg-[#0f1419]/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50 focus:bg-[#0f1419]"
                >
                  {semesterOptions.map((semester) => (
                    <option key={semester} value={semester}>Semester {semester}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-300">Course</span>
              <input
                name="s_course"
                value={submissionForm.s_course}
                onChange={handleSubmissionChange}
                className="w-full rounded-lg border border-gray-700/50 bg-[#0f1419]/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50 focus:bg-[#0f1419] placeholder-gray-600"
                placeholder="Course name"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-300">Due date</span>
              <input
                type="date"
                name="s_dueDate"
                value={submissionForm.s_dueDate}
                onChange={handleSubmissionChange}
                className="w-full rounded-lg border border-gray-700/50 bg-[#0f1419]/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50 focus:bg-[#0f1419]"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-300">Description</span>
              <textarea
                name="s_description"
                value={submissionForm.s_description}
                onChange={handleSubmissionChange}
                rows="4"
                className="w-full rounded-lg border border-gray-700/50 bg-[#0f1419]/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50 focus:bg-[#0f1419] placeholder-gray-600"
                placeholder="Add a short submission description"
              />
            </label>

            <button
              type="submit"
              disabled={submissionSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-500/20 border border-blue-500/30 px-5 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/30 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FaPlus /> {submissionSaving ? 'Creating...' : 'Create Submission'}
            </button>
          </form>
        </article>

        <article className="xl:col-span-7 bg-[#1a1f2e]/60 border border-gray-700/30 rounded-2xl p-7 backdrop-blur-sm shadow-lg shadow-gray-700/5">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Submission List</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Active submission sheets</h2>
            </div>
            <span className="rounded-lg border border-gray-700/30 bg-[#0f1419]/80 px-3 py-1 text-xs font-semibold text-gray-400">
              {activeSubmissions.length} active
            </span>
          </div>

          <div className="mb-4 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input
              value={submissionQuery}
              onChange={(event) => setSubmissionQuery(event.target.value)}
              placeholder="Search by title, module, or course"
              className="w-full rounded-lg border border-gray-700/50 bg-[#0f1419]/80 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-blue-500/50 focus:bg-[#0f1419] placeholder-gray-600"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-700/30 bg-[#0f1419]/40">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#1a1f2e]/40 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-700/30">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Module</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">
                      No submissions match your search.
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((item) => (
                    <tr key={item._id} className="hover:bg-[#252d3d]/40 transition-colors duration-200 border-b border-gray-700/30 text-sm text-gray-300">
                      <td className="px-6 py-4 font-semibold text-white">{item.s_title}</td>
                      <td className="px-6 py-4">{item.s_module}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p>{formatDate(item.s_dueDate)}</p>
                          <p className="text-xs text-gray-500 mt-1">{daysLeftLabel(item.s_dueDate)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openSubmissionDetail(item._id)}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-500/20 border border-blue-500/30 px-3 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-500/30 transition"
                        >
                          <FaEye /> View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section id="events" className="bg-[#1a1f2e]/60 border border-gray-700/30 rounded-2xl p-7 backdrop-blur-sm shadow-lg shadow-gray-700/5">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Events</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Review event records</h2>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-700/30 bg-[#0f1419]/80 px-4 py-2 text-xs font-semibold text-gray-300 transition hover:bg-white/5"
          >
            <FaSyncAlt className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        <div className="mb-4 relative max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
          <input
            value={eventQuery}
            onChange={(event) => setEventQuery(event.target.value)}
            placeholder="Search by title, category, or location"
            className="w-full rounded-lg border border-gray-700/50 bg-[#0f1419]/80 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-blue-500/50 focus:bg-[#0f1419] placeholder-gray-600"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-700/30 bg-[#0f1419]/40">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#1a1f2e]/40 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-700/30">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Batch</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                    No events found.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((item) => (
                  <tr key={item._id} className="hover:bg-[#252d3d]/40 transition-colors duration-200 border-b border-gray-700/30 text-sm text-gray-300">
                    <td className="px-6 py-4 font-semibold text-white">{item.title}</td>
                    <td className="px-6 py-4">{item.category || 'Academic'}</td>
                    <td className="px-6 py-4">{formatDate(item.eventDate)}</td>
                    <td className="px-6 py-4">{item.batch?.name || item.batch || '-'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openEventDetail(item._id)}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-500/20 border border-blue-500/30 px-3 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-500/30 transition"
                      >
                        <FaEye /> View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section id="details" className="bg-[#1a1f2e]/60 border border-gray-700/30 rounded-2xl p-7 backdrop-blur-sm shadow-lg shadow-gray-700/5">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Submission details</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Student collection view</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-gray-700/30 bg-[#0f1419]/80 px-3 py-1 text-xs font-semibold text-gray-400">
            <FaComments /> open/upload collection
          </div>
        </div>

        {detailLoading ? (
          <div className="rounded-xl border border-gray-700/30 bg-[#0f1419]/40 p-8 text-center text-sm text-gray-500">
            Loading details...
          </div>
        ) : (
          <div className="rounded-xl border border-gray-700/30 bg-[#0f1419]/40 p-6 text-sm text-gray-500">
            Select a submission from the table above to open the full student submission collection and activity breakdown.
          </div>
        )}
      </section>

      {eventDetail && (
        <ModalShell title="Event Details" onClose={closeModals}>
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <DetailCard label="Title" value={eventDetail.event?.title} />
              <DetailCard label="Category" value={eventDetail.event?.category || 'Academic'} />
              <DetailCard label="Date" value={formatDate(eventDetail.event?.eventDate)} />
              <DetailCard label="Location" value={eventDetail.event?.location || '-'} />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <DetailCard label="Registered" value={eventDetail.registeredStudents?.length || 0} />
              <DetailCard label="Cancelled" value={eventDetail.cancelledStudents?.length || 0} />
              <DetailCard label="Comments" value={eventDetail.commentCount || 0} />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <DetailCard label="Rating Count" value={eventDetail.ratingSummary?.count || 0} />
              <DetailCard label="Average Rating" value={eventDetail.ratingSummary?.average ?? 0} />
            </div>

            <div className="rounded-xl border border-gray-700/30 bg-[#0f1419]/40 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Recent Comments</p>
              <div className="max-h-52 space-y-2 overflow-auto">
                {(eventDetail.comments || []).slice(0, 5).map((comment) => (
                  <div key={comment._id} className="rounded-lg border border-gray-700/30 bg-[#1a1f2e]/40 p-3 text-sm text-gray-300">
                    <p className="font-semibold text-white">{comment.user?.u_name || 'Student'}</p>
                    <p className="mt-1 text-gray-400">{comment.comment}</p>
                  </div>
                ))}
                {(eventDetail.comments || []).length === 0 && (
                  <p className="text-sm text-gray-500">No comments available.</p>
                )}
              </div>
            </div>
          </div>
        </ModalShell>
      )}

      {submissionDetail && (
        <ModalShell title="Submission Engagement" onClose={closeModals} wide>
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <DetailCard label="Opened Students" value={submissionDetail.summary?.openedStudentCount || 0} />
              <DetailCard label="Uploaded Students" value={submissionDetail.summary?.uploadedStudentCount || 0} />
              <DetailCard label="Submission" value={submissionDetail.submission?.s_title || '-'} />
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-700/30">
              <div className="max-h-[440px] overflow-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#1a1f2e]/40 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-700/30">
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Index</th>
                      <th className="px-6 py-4">Open Count</th>
                      <th className="px-6 py-4">Submitted</th>
                      <th className="px-6 py-4">File</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(submissionDetail.studentDetails || []).map((student) => (
                      <tr key={student.studentId} className="hover:bg-[#252d3d]/40 transition-colors duration-200 border-b border-gray-700/30 text-gray-300">
                        <td className="px-6 py-4 font-semibold text-white">{student.fullName}</td>
                        <td className="px-6 py-4">{student.email}</td>
                        <td className="px-6 py-4">{student.indexNumber}</td>
                        <td className="px-6 py-4">{student.openCount || 0}</td>
                        <td className="px-6 py-4">{student.submittedAt ? formatDate(student.submittedAt) : '-'}</td>
                        <td className="px-6 py-4">
                          {student.fileUrl ? (
                            <a
                              href={`http://localhost:5001${student.fileUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded-lg bg-blue-500/20 border border-blue-500/30 px-3 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-500/30 transition"
                            >
                              <FaEye /> View
                            </a>
                          ) : (
                            <span className="text-gray-500">No file</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(submissionDetail.studentDetails || []).length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          No engagement records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </ModalShell>
      )}
      </div>
    </div>
  );
};

const DetailCard = ({ label, value }) => (
  <div className="rounded-xl border border-gray-700/30 bg-[#1a1f2e]/60 p-4 backdrop-blur-sm">
    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
    <p className="mt-2 text-lg font-semibold text-white">{value}</p>
  </div>
);

const ModalShell = ({ title, onClose, children, wide = false }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
    <div className={`w-full ${wide ? 'max-w-6xl' : 'max-w-3xl'} rounded-2xl border border-gray-700/30 bg-[#1a1f2e]/90 p-8 shadow-2xl shadow-black/40 backdrop-blur-sm`}>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <button onClick={onClose} className="rounded-lg border border-gray-700/30 bg-[#0f1419]/80 px-4 py-2 text-sm font-semibold text-gray-300 transition hover:bg-white/5">
          Close
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default LectureSummary;
