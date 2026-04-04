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
      <div className="rounded-3xl border border-cyan-400/10 bg-[#0b1224] p-8 text-center text-slate-400">
        Loading lecture workspace...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-100">
      <section id="overview" className="relative overflow-hidden rounded-3xl border border-cyan-400/10 bg-gradient-to-br from-[#0b1530] via-[#101d35] to-[#050b18] p-6 shadow-2xl shadow-cyan-950/20 md:p-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-24 left-16 h-52 w-52 rounded-full bg-fuchsia-500/10 blur-3xl" />

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

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[430px] xl:grid-cols-2">
            {dashboardStats.map((card) => (
              <article key={card.label} className="rounded-2xl border border-cyan-400/10 bg-[#0b1326]/90 p-4 backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{card.label}</p>
                  <span className="text-cyan-300">{card.icon}</span>
                </div>
                <p className="mt-3 text-3xl font-bold text-white">{card.value}</p>
                <p className="mt-1 text-sm text-slate-400">{card.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {(message || error) && (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${error ? 'border-rose-400/20 bg-rose-500/10 text-rose-100' : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100'}`}>
          {error || message}
        </div>
      )}

      <section id="deadlines" className="grid gap-6 xl:grid-cols-12">
        <article className="xl:col-span-5 rounded-3xl border border-cyan-400/10 bg-[#0b1326] p-5 shadow-xl shadow-black/10">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Deadlines</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Create deadline</h2>
            </div>
            <FaClock className="text-cyan-300" />
          </div>

          <form onSubmit={handleDeadlineSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Title</span>
                <input
                  name="d_title"
                  value={deadlineForm.d_title}
                  onChange={handleDeadlineChange}
                  className="w-full rounded-xl border border-slate-700 bg-[#07101c] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                  placeholder="Deadline title"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Subject</span>
                <input
                  name="d_subject"
                  value={deadlineForm.d_subject}
                  onChange={handleDeadlineChange}
                  className="w-full rounded-xl border border-slate-700 bg-[#07101c] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                  placeholder="Subject name"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Year</span>
                <select
                  name="d_year"
                  value={deadlineForm.d_year}
                  onChange={handleDeadlineChange}
                  className="w-full rounded-xl border border-slate-700 bg-[#07101c] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>Year {year}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Semester</span>
                <select
                  name="d_semester"
                  value={deadlineForm.d_semester}
                  onChange={handleDeadlineChange}
                  className="w-full rounded-xl border border-slate-700 bg-[#07101c] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                >
                  {semesterOptions.map((semester) => (
                    <option key={semester} value={semester}>Semester {semester}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Course</span>
              <input
                name="d_course"
                value={deadlineForm.d_course}
                onChange={handleDeadlineChange}
                className="w-full rounded-xl border border-slate-700 bg-[#07101c] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                placeholder="Course name"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Due date</span>
              <input
                type="date"
                name="d_dueDate"
                value={deadlineForm.d_dueDate}
                onChange={handleDeadlineChange}
                className="w-full rounded-xl border border-slate-700 bg-[#07101c] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Description</span>
              <textarea
                name="d_description"
                value={deadlineForm.d_description}
                onChange={handleDeadlineChange}
                rows="4"
                className="w-full rounded-xl border border-slate-700 bg-[#07101c] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                placeholder="Add a short deadline description"
              />
            </label>

            <button
              type="submit"
              disabled={deadlineSaving}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-[#03111f] transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FaPlus /> {deadlineSaving ? 'Creating...' : 'Create Deadline'}
            </button>
          </form>
        </article>

        <article className="xl:col-span-7 rounded-3xl border border-cyan-400/10 bg-[#0b1326] p-5 shadow-xl shadow-black/10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Deadline List</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Upcoming and created deadlines</h2>
            </div>
            <span className="rounded-full border border-slate-700 bg-[#07101c] px-3 py-1 text-xs text-slate-300">
              {deadlines.length} total
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#09111f] text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Scope</th>
                </tr>
              </thead>
              <tbody>
                {upcomingDeadlines.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-sm text-slate-500">
                      No deadlines due in the next 7 days.
                    </td>
                  </tr>
                ) : (
                  upcomingDeadlines.map((item) => (
                    <tr key={item._id} className="border-t border-slate-800 bg-[#07101c] text-sm text-slate-300">
                      <td className="px-4 py-3 font-semibold text-white">{item.d_title}</td>
                      <td className="px-4 py-3">{item.d_subject}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p>{formatDate(item.d_dueDate)}</p>
                          <p className="text-xs text-slate-500">{daysLeftLabel(item.d_dueDate)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
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
        <article className="xl:col-span-5 rounded-3xl border border-cyan-400/10 bg-[#0b1326] p-5 shadow-xl shadow-black/10">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Submissions</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Create submission</h2>
            </div>
            <FaClipboardList className="text-cyan-300" />
          </div>

          <form onSubmit={handleSubmissionSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Title</span>
                <input
                  name="s_title"
                  value={submissionForm.s_title}
                  onChange={handleSubmissionChange}
                  className="w-full rounded-xl border border-slate-700 bg-[#07101c] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                  placeholder="Submission title"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Module</span>
                <input
                  name="s_module"
                  value={submissionForm.s_module}
                  onChange={handleSubmissionChange}
                  className="w-full rounded-xl border border-slate-700 bg-[#07101c] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                  placeholder="Module name"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Year</span>
                <select
                  name="s_year"
                  value={submissionForm.s_year}
                  onChange={handleSubmissionChange}
                  className="w-full rounded-xl border border-slate-700 bg-[#07101c] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>Year {year}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Semester</span>
                <select
                  name="s_semester"
                  value={submissionForm.s_semester}
                  onChange={handleSubmissionChange}
                  className="w-full rounded-xl border border-slate-700 bg-[#07101c] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                >
                  {semesterOptions.map((semester) => (
                    <option key={semester} value={semester}>Semester {semester}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Course</span>
              <input
                name="s_course"
                value={submissionForm.s_course}
                onChange={handleSubmissionChange}
                className="w-full rounded-xl border border-slate-700 bg-[#07101c] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                placeholder="Course name"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Due date</span>
              <input
                type="date"
                name="s_dueDate"
                value={submissionForm.s_dueDate}
                onChange={handleSubmissionChange}
                className="w-full rounded-xl border border-slate-700 bg-[#07101c] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Description</span>
              <textarea
                name="s_description"
                value={submissionForm.s_description}
                onChange={handleSubmissionChange}
                rows="4"
                className="w-full rounded-xl border border-slate-700 bg-[#07101c] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                placeholder="Add a short submission description"
              />
            </label>

            <button
              type="submit"
              disabled={submissionSaving}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-[#03111f] transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FaPlus /> {submissionSaving ? 'Creating...' : 'Create Submission'}
            </button>
          </form>
        </article>

        <article className="xl:col-span-7 rounded-3xl border border-cyan-400/10 bg-[#0b1326] p-5 shadow-xl shadow-black/10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Submission List</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Active submission sheets</h2>
            </div>
            <span className="rounded-full border border-slate-700 bg-[#07101c] px-3 py-1 text-xs text-slate-300">
              {activeSubmissions.length} active
            </span>
          </div>

          <div className="mb-4 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={submissionQuery}
              onChange={(event) => setSubmissionQuery(event.target.value)}
              placeholder="Search by title, module, or course"
              className="w-full rounded-xl border border-slate-700 bg-[#07101c] py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-400/40"
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#09111f] text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Module</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-sm text-slate-500">
                      No submissions match your search.
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((item) => (
                    <tr key={item._id} className="border-t border-slate-800 bg-[#07101c] text-sm text-slate-300">
                      <td className="px-4 py-3 font-semibold text-white">{item.s_title}</td>
                      <td className="px-4 py-3">{item.s_module}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p>{formatDate(item.s_dueDate)}</p>
                          <p className="text-xs text-slate-500">{daysLeftLabel(item.s_dueDate)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openSubmissionDetail(item._id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
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

      <section id="events" className="rounded-3xl border border-cyan-400/10 bg-[#0b1326] p-5 shadow-xl shadow-black/10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Events</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Review event records</h2>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-[#07101c] px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/5"
          >
            <FaSyncAlt className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        <div className="mb-4 relative max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={eventQuery}
            onChange={(event) => setEventQuery(event.target.value)}
            placeholder="Search by title, category, or location"
            className="w-full rounded-xl border border-slate-700 bg-[#07101c] py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-400/40"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#09111f] text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-sm text-slate-500">
                    No events found.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((item) => (
                  <tr key={item._id} className="border-t border-slate-800 bg-[#07101c] text-sm text-slate-300">
                    <td className="px-4 py-3 font-semibold text-white">{item.title}</td>
                    <td className="px-4 py-3">{item.category || 'Academic'}</td>
                    <td className="px-4 py-3">{formatDate(item.eventDate)}</td>
                    <td className="px-4 py-3">{item.batch?.name || item.batch || '-'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openEventDetail(item._id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
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

      <section id="details" className="rounded-3xl border border-cyan-400/10 bg-[#0b1326] p-5 shadow-xl shadow-black/10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Submission details</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Student collection view</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-[#07101c] px-3 py-1 text-xs text-slate-300">
            <FaComments /> open/upload collection
          </div>
        </div>

        {detailLoading ? (
          <div className="rounded-2xl border border-slate-800 bg-[#07101c] p-8 text-center text-sm text-slate-400">
            Loading details...
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-[#07101c] p-4 text-sm text-slate-400">
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

            <div className="rounded-2xl border border-slate-800 bg-[#09111f] p-4">
              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-slate-500">Recent Comments</p>
              <div className="max-h-52 space-y-2 overflow-auto">
                {(eventDetail.comments || []).slice(0, 5).map((comment) => (
                  <div key={comment._id} className="rounded-xl border border-slate-800 bg-[#07101c] p-3 text-sm text-slate-300">
                    <p className="font-semibold text-white">{comment.user?.u_name || 'Student'}</p>
                    <p className="mt-1 text-slate-400">{comment.comment}</p>
                  </div>
                ))}
                {(eventDetail.comments || []).length === 0 && (
                  <p className="text-sm text-slate-500">No comments available.</p>
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

            <div className="overflow-hidden rounded-2xl border border-slate-800">
              <div className="max-h-[440px] overflow-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#09111f] text-left text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Index</th>
                      <th className="px-4 py-3">Open Count</th>
                      <th className="px-4 py-3">Submitted</th>
                      <th className="px-4 py-3">File</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(submissionDetail.studentDetails || []).map((student) => (
                      <tr key={student.studentId} className="border-t border-slate-800 bg-[#07101c] text-slate-300">
                        <td className="px-4 py-3 font-semibold text-white">{student.fullName}</td>
                        <td className="px-4 py-3">{student.email}</td>
                        <td className="px-4 py-3">{student.indexNumber}</td>
                        <td className="px-4 py-3">{student.openCount || 0}</td>
                        <td className="px-4 py-3">{student.submittedAt ? formatDate(student.submittedAt) : '-'}</td>
                        <td className="px-4 py-3">
                          {student.fileUrl ? (
                            <a
                              href={`http://localhost:5001${student.fileUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
                            >
                              <FaEye /> View
                            </a>
                          ) : (
                            <span className="text-slate-500">No file</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(submissionDetail.studentDetails || []).length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
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
  );
};

const DetailCard = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-800 bg-[#09111f] p-4">
    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{label}</p>
    <p className="mt-2 text-lg font-semibold text-white">{value}</p>
  </div>
);

const ModalShell = ({ title, onClose, children, wide = false }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
    <div className={`w-full ${wide ? 'max-w-6xl' : 'max-w-3xl'} rounded-3xl border border-slate-700 bg-[#0b1326] p-5 shadow-2xl shadow-black/40`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <button onClick={onClose} className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300 transition hover:bg-white/5">
          Close
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default LectureSummary;
