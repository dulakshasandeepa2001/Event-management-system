import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  FaBug,
  FaCalendarCheck,
  FaClipboardCheck,
  FaUsers,
  FaBullhorn,
  FaCheckCircle,
  FaUserGraduate,
  FaFileDownload,
  FaEdit,
  FaTrash,
  FaPlus,
} from 'react-icons/fa';
import API from '../../api';
import { useTheme } from '../../context/ThemeContext.jsx';

const initialForm = {
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

const yearOptions = [
  { label: '1st Year', value: '1' },
  { label: '2nd Year', value: '2' },
  { label: '3rd Year', value: '3' },
  { label: '4th Year', value: '4' },
];

const monthlyThreatData = [
  { month: 'Jan', value: 12 },
  { month: 'Feb', value: 10 },
  { month: 'Mar', value: 15 },
  { month: 'Apr', value: 18 },
  { month: 'May', value: 22 },
  { month: 'Jun', value: 19 },
  { month: 'Jul', value: 21 },
  { month: 'Aug', value: 24 },
  { month: 'Sep', value: 20 },
  { month: 'Oct', value: 26 },
  { month: 'Nov', value: 23 },
  { month: 'Dec', value: 28 },
];

const virusBreakdown = [
  { name: 'Workshop', value: 26, color: '#8b5cf6' },
  { name: 'Seminar', value: 22, color: '#ec4899' },
  { name: 'Sports', value: 18, color: '#0ea5e9' },
  { name: 'Club', value: 34, color: '#3b82f6' },
];

const deviceTrend = [
  { day: 'Mon', value: 38 },
  { day: 'Tue', value: 44 },
  { day: 'Wed', value: 41 },
  { day: 'Thu', value: 49 },
  { day: 'Fri', value: 46 },
  { day: 'Sat', value: 30 },
  { day: 'Sun', value: 27 },
];

const BatchrepSummary = () => {
  const { isDarkTheme } = useTheme();
  const [deadlines, setDeadlines] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);        
  const [loadingDeadlines, setLoadingDeadlines] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [submissionFormData, setSubmissionFormData] = useState(initialSubmissionForm);
  const [editingSubmissionId, setEditingSubmissionId] = useState(null);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);    
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');
  
  // Dashboard metrics state
  const [dashboardMetrics, setDashboardMetrics] = useState({
    snapshot: { totalDeadlines: 0, dueThisWeek: 0, participants: 0, pendingApprovals: 0, noticesSent: 0 },
    monthlyTrend: monthlyThreatData,
    engagementScore: 0,
    eventsByCategory: virusBreakdown,
    weeklyAttendance: deviceTrend,
  });
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  
  const minDueDate = new Date().toISOString().split('T')[0];

  const riskCards = useMemo(() => {
    return [
      { title: 'Total Deadlines', value: String(dashboardMetrics.snapshot.totalDeadlines), icon: <FaCalendarCheck />, color: 'from-fuchsia-500/30 to-fuchsia-600/10' },
      { title: 'Due This Week', value: String(dashboardMetrics.snapshot.dueThisWeek), icon: <FaClipboardCheck />, color: 'from-violet-500/30 to-violet-600/10' },
      { title: 'Participants', value: String(dashboardMetrics.snapshot.participants), icon: <FaUsers />, color: 'from-pink-500/30 to-pink-600/10' },
      { title: 'Pending Approvals', value: String(dashboardMetrics.snapshot.pendingApprovals), icon: <FaBug />, color: 'from-blue-500/30 to-blue-600/10' },
      { title: 'Notices Sent', value: String(dashboardMetrics.snapshot.noticesSent), icon: <FaBullhorn />, color: 'from-cyan-500/30 to-cyan-600/10' },
    ];
  }, [dashboardMetrics.snapshot]);

  const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('en-GB');
  };

  const fetchDeadlines = async () => {
    try {
      setLoadingDeadlines(true);
      const res = await API.get('/deadlines');
      setDeadlines(res.data?.deadlines || []);
    } catch (err) {
      setFormMessage(err.response?.data?.message || 'Failed to load deadlines');
    } finally {
      setLoadingDeadlines(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setLoadingSubmissions(true);
      const res = await API.get('/submissions');
      setSubmissions(res.data?.submissions || []);
    } catch (err) {
      setSubmissionMessage(err.response?.data?.message || 'Failed to load submissions');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const fetchDashboardMetrics = async () => {
    try {
      setLoadingMetrics(true);
      const res = await API.get('/dashboard');
      if (res.data) {
        setDashboardMetrics({
          snapshot: res.data.snapshot || dashboardMetrics.snapshot,
          monthlyTrend: res.data.monthlyTrend || monthlyThreatData,
          engagementScore: res.data.engagementScore || 0,
          eventsByCategory: res.data.eventsByCategory || virusBreakdown,
          weeklyAttendance: res.data.weeklyAttendance || deviceTrend,
        });
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      // Keep using default data if API fails
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    fetchDeadlines();
    fetchSubmissions();
    fetchDashboardMetrics();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
  };

  const resetSubmissionForm = () => {
    setSubmissionFormData(initialSubmissionForm);
    setEditingSubmissionId(null);
  };

  const openCreateModal = () => {
    setFormMessage('');
    resetForm();
    setIsDeadlineModalOpen(true);
  };

  const openCreateSubmissionModal = () => {
    setSubmissionMessage('');
    resetSubmissionForm();
    setIsSubmissionModalOpen(true);
  };

  const handleSubmitDeadline = async (e) => {
    e.preventDefault();
    setFormMessage('');

    const normalizedTitle = formData.d_title.trim();
    const normalizedSubject = formData.d_subject.trim();
    const normalizedDescription = formData.d_description.trim();      
    const normalizedCourse = formData.d_course.trim();

    if (normalizedTitle.length < 3 || normalizedTitle.length > 120) {
      setFormMessage('Deadline title must be between 3 and 120 characters');    
      return;
    }

    if (normalizedSubject.length < 2 || normalizedSubject.length > 80) {        
      setFormMessage('Subject must be between 2 and 80 characters');
      return;
    }

    if (!formData.d_dueDate || formData.d_dueDate < minDueDate) {
      setFormMessage('Due date must be today or a future date');
      return;
    }

    if (normalizedDescription.length > 1000) {
      setFormMessage('Description must be 1000 characters or fewer');
      return;
    }

    if (normalizedCourse.length > 100) {
      setFormMessage('Course must be 100 characters or fewer');
      return;
    }

    const payload = {
      ...formData,
      d_title: normalizedTitle,
      d_subject: normalizedSubject,
      d_description: normalizedDescription,
      d_course: normalizedCourse,
    };

    try {
      if (editingId) {
        await API.put(`/deadlines/${editingId}`, payload);
        setFormMessage('Deadline updated successfully');
      } else {
        await API.post('/deadlines', payload);
        setFormMessage('Deadline created successfully');
      }

      await fetchDeadlines();
      resetForm();
      setIsDeadlineModalOpen(false);
    } catch (err) {
      setFormMessage(err.response?.data?.message || 'Failed to save deadline'); 
    }
  };

  const handleEdit = (deadline) => {
    setFormMessage('');
    setEditingId(deadline._id);
    setFormData({
      d_title: deadline.d_title || '',
      d_subject: deadline.d_subject || '',
      d_description: deadline.d_description || '',
      d_year: String(deadline.d_year || '1'),
      d_semester: String(deadline.d_semester || '1'),
      d_course: deadline.d_course || '',
      d_dueDate: deadline.d_dueDate ? new Date(deadline.d_dueDate).toISOString().split('T')[0] : '',
    });
    setIsDeadlineModalOpen(true);
  };

  const handleSubmissionFormChange = (e) => {
    const { name, value } = e.target;
    setSubmissionFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitSubmission = async (e) => {
    e.preventDefault();
    setSubmissionMessage('');

    const normalizedTitle = submissionFormData.s_title.trim();
    const normalizedModule = submissionFormData.s_module.trim();
    const normalizedDescription = submissionFormData.s_description.trim();      
    const normalizedCourse = submissionFormData.s_course.trim();

    if (normalizedTitle.length < 3 || normalizedTitle.length > 120) {
      setSubmissionMessage('Submission title must be between 3 and 120 characters');
      return;
    }

    if (normalizedModule.length < 2 || normalizedModule.length > 80) {
      setSubmissionMessage('Module must be between 2 and 80 characters');       
      return;
    }

    if (!submissionFormData.s_dueDate || submissionFormData.s_dueDate < minDueDate) {
      setSubmissionMessage('Due date must be today or a future date');
      return;
    }

    if (normalizedDescription.length > 1000) {
      setSubmissionMessage('Description must be 1000 characters or fewer');     
      return;
    }

    if (normalizedCourse.length > 100) {
      setSubmissionMessage('Course must be 100 characters or fewer');
      return;
    }

    const payload = {
      ...submissionFormData,
      s_title: normalizedTitle,
      s_module: normalizedModule,
      s_description: normalizedDescription,
      s_course: normalizedCourse,
    };

    try {
      if (editingSubmissionId) {
        await API.put(`/submissions/${editingSubmissionId}`, payload);
        setSubmissionMessage('Submission updated successfully');
      } else {
        await API.post('/submissions', payload);
        setSubmissionMessage('Submission created successfully');
      }

      await fetchSubmissions();
      resetSubmissionForm();
      setIsSubmissionModalOpen(false);
    } catch (err) {
      setSubmissionMessage(err.response?.data?.message || 'Failed to save submission');
    }
  };

  const handleEditSubmission = (submission) => {
    setSubmissionMessage('');
    setEditingSubmissionId(submission._id);
    setSubmissionFormData({
      s_title: submission.s_title || '',
      s_module: submission.s_module || '',
      s_description: submission.s_description || '',
      s_year: String(submission.s_year || '1'),
      s_semester: String(submission.s_semester || '1'),
      s_course: submission.s_course || '',
      s_dueDate: submission.s_dueDate ? new Date(submission.s_dueDate).toISOString().split('T')[0] : '',
    });
    setIsSubmissionModalOpen(true);
  };

  const handleDeleteSubmission = async (id) => {
    const confirmed = window.confirm('Delete this submission?');
    if (!confirmed) return;

    try {
      await API.delete(`/submissions/${id}`);
      setSubmissionMessage('Submission deleted successfully');
      await fetchSubmissions();
      if (editingSubmissionId === id) resetSubmissionForm();
    } catch (err) {
      setSubmissionMessage(err.response?.data?.message || 'Failed to delete submission');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this deadline?');
    if (!confirmed) return;

    try {
      await API.delete(`/deadlines/${id}`);
      setFormMessage('Deadline deleted successfully');
      await fetchDeadlines();
      if (editingId === id) resetForm();
    } catch (err) {
      setFormMessage(err.response?.data?.message || 'Failed to delete deadline');
    }
  };

  const handleExport = () => {
    if (!deadlines.length) return;
    const header = ['Date', 'Subject', 'Year', 'Semester', 'Course', 'Title', 'Description'];
    const rows = deadlines.map((d) => [
      formatDate(d.d_dueDate),
      d.d_subject,
      d.d_year,
      d.d_semester,
      d.d_course || 'All',
      d.d_title,
      (d.d_description || '').replace(/,/g, ' '),
    ]);

    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'deadline-export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmissionExport = () => {
    if (!submissions.length) return;
    const header = ['Date', 'Module', 'Year', 'Semester', 'Course', 'Title', 'Description'];
    const rows = submissions.map((s) => [
      formatDate(s.s_dueDate),
      s.s_module,
      s.s_year,
      s.s_semester,
      s.s_course || 'All',
      s.s_title,
      (s.s_description || '').replace(/,/g, ' '),
    ]);

    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'submission-export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className='min-h-screen bg-[#0f1419] p-6 md:p-10'>
      <div className='max-w-7xl mx-auto space-y-8'>
      <section className='bg-[#1a1f2e]/60 border border-gray-700/30 rounded-2xl p-8 backdrop-blur-sm shadow-lg shadow-gray-700/5'>
        <div className='mb-6 flex items-center justify-between'>
          <h2 className='text-2xl font-bold text-white'>Batch Activity Snapshot</h2>
          <button className='rounded-lg border border-gray-700/30 bg-[#0f1419]/80 px-4 py-2 text-xs font-semibold text-gray-300 transition hover:bg-white/5'>Daily</button>
        </div>

        <div className={isDarkTheme ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-5' : 'grid gap-6 sm:grid-cols-2 xl:grid-cols-5'}>
          {riskCards.map((card) => (
            <article
              key={card.title}
              className='bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 transition-all duration-300 shadow-lg shadow-blue-500/5' 
            >
              <div className='mb-4 flex items-center justify-between'>
                <div className={`grid h-12 w-12 place-items-center rounded-lg bg-blue-500/20 text-blue-400`}>
                  {card.icon}
                </div>
              </div>
              <h3 className='text-3xl font-bold text-white'>{card.value}</h3>
              <p className='mt-2 text-sm text-gray-400'>{card.title}</p>       
            </article>
          ))}
        </div>
      </section>

      <section className='grid gap-5 xl:grid-cols-12'>
        <article className='rounded-2xl border border-cyan-300/10 bg-[#09122a] p-4 md:p-5 xl:col-span-8'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-lg font-semibold text-slate-100'>Monthly Event Trend</h2>
            <button className='rounded-xl border border-cyan-300/20 bg-[#101d3f] px-3 py-1.5 text-xs text-slate-300'>Yearly</button>
          </div>
          <div className='h-72'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={dashboardMetrics.monthlyTrend}>
                <CartesianGrid stroke='rgba(148,163,184,0.12)' vertical={false} />
                <XAxis dataKey='month' stroke='#94a3b8' tick={{ fontSize: 11 }} />
                <YAxis stroke='#94a3b8' tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b1735',
                    border: '1px solid rgba(56,189,248,0.2)',
                    borderRadius: '12px',
                    color: '#cbd5e1',
                  }}
                />
                <Line
                  type='monotone'
                  dataKey='value'
                  stroke='#a855f7'
                  strokeWidth={3}
                  dot={{ r: 3, stroke: '#c084fc', strokeWidth: 2, fill: '#0b1735' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className='rounded-2xl border border-cyan-300/10 bg-[#09122a] p-4 md:p-5 xl:col-span-4'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-lg font-semibold text-slate-100'>Engagement Score</h2>
            <span className='rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200'>Healthy</span>
          </div>

          <div className='relative mx-auto h-56 w-56'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={[{ name: 'covered', value: Math.min(dashboardMetrics.engagementScore, 1000) }, { name: 'left', value: Math.max(0, 1000 - dashboardMetrics.engagementScore) }]}
                  innerRadius={72}
                  outerRadius={96}
                  startAngle={220}
                  endAngle={-40}
                  dataKey='value'
                  stroke='none'
                >
                  <Cell fill='#fb923c' />
                  <Cell fill='rgba(148,163,184,0.2)' />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className='absolute inset-0 grid place-items-center text-center'>
              <div>
                <p className='text-xs text-slate-400'>Score</p>
                <p className='text-4xl font-bold text-slate-100'>{dashboardMetrics.engagementScore}</p>        
              </div>
            </div>
          </div>
          <div className='mt-2 flex justify-between text-xs text-slate-400'>    
            <span>0</span>
            <span>1000</span>
          </div>
        </article>
      </section>

      <section className='grid gap-5 xl:grid-cols-12'>
        <article className='rounded-2xl border border-cyan-300/10 bg-[#09122a] p-4 md:p-5 xl:col-span-4'>
            <h2 className='mb-3 text-lg font-semibold text-slate-100'>Events By Category</h2>
          <div className='h-48'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie data={dashboardMetrics.eventsByCategory} dataKey='value' innerRadius={48} outerRadius={72} paddingAngle={4}>
                  {dashboardMetrics.eventsByCategory.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className='grid grid-cols-2 gap-2 text-xs text-slate-300'>        
            {dashboardMetrics.eventsByCategory.map((entry) => (
              <li key={entry.name} className='flex items-center gap-2'>
                <span className='h-2.5 w-2.5 rounded-full' style={{ backgroundColor: entry.color }} />
                <span>{entry.name}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className='rounded-2xl border border-cyan-300/10 bg-[#09122a] p-4 md:p-5 xl:col-span-8'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-lg font-semibold text-slate-100'>Weekly Attendance Trend</h2>
            <FaUserGraduate className='text-cyan-300' />
          </div>

          <div className='h-48'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={dashboardMetrics.weeklyAttendance}>
                <defs>
                  <linearGradient id='deviceArea' x1='0' y1='0' x2='0' y2='1'>  
                    <stop offset='0%' stopColor='#22d3ee' stopOpacity={0.4} />  
                    <stop offset='100%' stopColor='#22d3ee' stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke='rgba(148,163,184,0.12)' vertical={false} />
                <XAxis dataKey='day' stroke='#94a3b8' tick={{ fontSize: 11 }} />
                <YAxis stroke='#94a3b8' tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b1735',
                    border: '1px solid rgba(56,189,248,0.2)',
                    borderRadius: '12px',
                    color: '#cbd5e1',
                  }}
                />
                <Area type='monotone' dataKey='value' stroke='#22d3ee' strokeWidth={2.5} fill='url(#deviceArea)' />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className='rounded-2xl border border-cyan-300/10 bg-[#09122a] p-4 md:p-5'>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
          <h2 className='text-lg font-semibold text-slate-100'>Deadline Schedule Details</h2>
          <div className='flex items-center gap-2'>
            <button
              onClick={openCreateModal}
              className='inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-[#10355b] px-3 py-2 text-xs text-cyan-100 hover:bg-[#124267]'   
            >
              <FaPlus />
              Create Deadline
            </button>
            <button onClick={handleExport} className='inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-[#101d3f] px-3 py-2 text-xs text-slate-200'>
              <FaFileDownload />
              Export
            </button>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='min-w-full border-separate border-spacing-y-2 text-sm'>
            <thead>
              <tr className='text-left text-xs uppercase tracking-wider text-slate-400'>
                <th className='px-3 py-2'>Date</th>
                <th className='px-3 py-2'>Subject</th>
                <th className='px-3 py-2'>Year</th>
                <th className='px-3 py-2'>Semester</th>
                <th className='px-3 py-2'>Title</th>
                <th className='px-3 py-2'>Status</th>
                <th className='px-3 py-2'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loadingDeadlines && deadlines.length === 0 && (
                <tr>
                  <td colSpan='7' className='rounded-xl bg-[#0d1734] px-3 py-4 text-center text-slate-400'>No deadlines yet. Create your first deadline above.</td>
                </tr>
              )}
              {deadlines.map((row) => (
                <tr key={row._id} className='rounded-xl bg-[#0d1734] text-slate-200'>
                  <td className='rounded-l-xl px-3 py-3'>{formatDate(row.d_dueDate)}</td>
                  <td className='px-3 py-3'>{row.d_subject}</td>
                  <td className='px-3 py-3'>{row.d_year}</td>
                  <td className='px-3 py-3'>{row.d_semester}</td>
                  <td className='max-w-[220px] truncate px-3 py-3 text-slate-300'>{row.d_title}</td>
                  <td className='rounded-r-xl px-3 py-3'>
                    <span className='inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-1 text-xs text-emerald-200'>
                      <FaCheckCircle className='text-[10px]' />
                      Active
                    </span>
                  </td>
                  <td className='px-3 py-3'>
                    <div className='flex items-center gap-2'>
                      <button onClick={() => handleEdit(row)} className='rounded-md bg-cyan-500/20 p-2 text-cyan-200 hover:bg-cyan-500/30'>
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(row._id)} className='rounded-md bg-rose-500/20 p-2 text-rose-200 hover:bg-rose-500/30'>
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className='rounded-2xl border border-cyan-300/10 bg-[#09122a] p-4 md:p-5'>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
          <h2 className='text-lg font-semibold text-slate-100'>Submission Schedule Details</h2>
          <div className='flex items-center gap-2'>
            <button
              onClick={openCreateSubmissionModal}
              className='inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-[#10355b] px-3 py-2 text-xs text-cyan-100 hover:bg-[#124267]'   
            >
              <FaPlus />
              Create Submission
            </button>
            <button onClick={handleSubmissionExport} className='inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-[#101d3f] px-3 py-2 text-xs text-slate-200'>
              <FaFileDownload />
              Export
            </button>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='min-w-full border-separate border-spacing-y-2 text-sm'>
            <thead>
              <tr className='text-left text-xs uppercase tracking-wider text-slate-400'>
                <th className='px-3 py-2'>Date</th>
                <th className='px-3 py-2'>Module</th>
                <th className='px-3 py-2'>Year</th>
                <th className='px-3 py-2'>Semester</th>
                <th className='px-3 py-2'>Title</th>
                <th className='px-3 py-2'>Status</th>
                <th className='px-3 py-2'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loadingSubmissions && submissions.length === 0 && (
                <tr>
                  <td colSpan='7' className='rounded-xl bg-[#0d1734] px-3 py-4 text-center text-slate-400'>No submissions yet. Create your first submission above.</td>
                </tr>
              )}
              {submissions.map((row) => (
                <tr key={row._id} className='rounded-xl bg-[#0d1734] text-slate-200'>
                  <td className='rounded-l-xl px-3 py-3'>{formatDate(row.s_dueDate)}</td>
                  <td className='px-3 py-3'>{row.s_module}</td>
                  <td className='px-3 py-3'>{row.s_year}</td>
                  <td className='px-3 py-3'>{row.s_semester}</td>
                  <td className='max-w-[220px] truncate px-3 py-3 text-slate-300'>{row.s_title}</td>
                  <td className='rounded-r-xl px-3 py-3'>
                    <span className='inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-1 text-xs text-emerald-200'>
                      <FaCheckCircle className='text-[10px]' />
                      Active
                    </span>
                  </td>
                  <td className='px-3 py-3'>
                    <div className='flex items-center gap-2'>
                      <button onClick={() => handleEditSubmission(row)} className='rounded-md bg-cyan-500/20 p-2 text-cyan-200 hover:bg-cyan-500/30'>
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDeleteSubmission(row._id)} className='rounded-md bg-rose-500/20 p-2 text-rose-200 hover:bg-rose-500/30'>     
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {submissionMessage && <p className='mt-3 text-xs text-cyan-300'>{submissionMessage}</p>}
      </section>

      {isDeadlineModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
          <div className='w-full max-w-2xl rounded-2xl border border-cyan-300/20 bg-[#0b1735] p-5'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-base font-semibold text-slate-100'>
                {editingId ? 'Update Deadline' : 'Create Deadline'}
              </h3>
              <button
                type='button'
                onClick={() => {
                  setIsDeadlineModalOpen(false);
                  resetForm();
                }}
                className='text-xs text-slate-300 hover:text-white'
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmitDeadline} className='space-y-3'>        
              <div className='grid gap-3 md:grid-cols-2'>
                <input name='d_title' value={formData.d_title} onChange={handleFormChange} placeholder='Deadline title' className='rounded-lg border border-cyan-300/15 bg-[#101d3f] px-3 py-2 text-sm text-slate-100 outline-none' required /> 
                <input name='d_subject' value={formData.d_subject} onChange={handleFormChange} placeholder='Subject' className='rounded-lg border border-cyan-300/15 bg-[#101d3f] px-3 py-2 text-sm text-slate-100 outline-none' required />    

                <select name='d_year' value={formData.d_year} onChange={handleFormChange} className='rounded-lg border border-cyan-300/15 bg-[#101d3f] px-3 py-2 text-sm text-slate-100 outline-none' required>
                  {yearOptions.map((year) => (
                    <option key={year.value} value={year.value}>{year.label}</option>
                  ))}
                </select>

                <select name='d_semester' value={formData.d_semester} onChange={handleFormChange} className='rounded-lg border border-cyan-300/15 bg-[#101d3f] px-3 py-2 text-sm text-slate-100 outline-none' required>
                  <option value='1'>Semester 1</option>
                  <option value='2'>Semester 2</option>
                </select>

                <input name='d_course' value={formData.d_course} onChange={handleFormChange} placeholder='Course (optional)' className='rounded-lg border border-cyan-300/15 bg-[#101d3f] px-3 py-2 text-sm text-slate-100 outline-none' />     
                <input name='d_dueDate' type='date' min={minDueDate} value={formData.d_dueDate} onChange={handleFormChange} className='rounded-lg border border-cyan-300/15 bg-[#101d3f] px-3 py-2 text-sm text-slate-100 outline-none' required />
              </div>

              <textarea name='d_description' value={formData.d_description} onChange={handleFormChange} rows='3' placeholder='Description (optional)' className='w-full rounded-lg border border-cyan-300/15 bg-[#101d3f] px-3 py-2 text-sm text-slate-100 outline-none' />

              {formMessage && <p className='text-xs text-cyan-300'>{formMessage}</p>}

              <div className='flex items-center justify-end gap-2'>
                <button
                  type='button'
                  onClick={() => {
                    setIsDeadlineModalOpen(false);
                    resetForm();
                  }}
                  className='rounded-lg border border-cyan-300/20 bg-[#101d3f] px-3 py-2 text-xs text-slate-200'
                >
                  Cancel
                </button>
                <button type='submit' className='inline-flex items-center gap-2 rounded-lg bg-cyan-500/20 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/30'>
                  <FaPlus />
                  {editingId ? 'Update Deadline' : 'Create Deadline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSubmissionModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
          <div className='w-full max-w-2xl rounded-2xl border border-cyan-300/20 bg-[#0b1735] p-5'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-base font-semibold text-slate-100'>
                {editingSubmissionId ? 'Update Submission' : 'Create Submission'}
              </h3>
              <button
                type='button'
                onClick={() => {
                  setIsSubmissionModalOpen(false);
                  resetSubmissionForm();
                }}
                className='text-xs text-slate-300 hover:text-white'
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmitSubmission} className='space-y-3'>      
              <div className='grid gap-3 md:grid-cols-2'>
                <input name='s_title' value={submissionFormData.s_title} onChange={handleSubmissionFormChange} placeholder='Submission title' className='rounded-lg border border-cyan-300/15 bg-[#101d3f] px-3 py-2 text-sm text-slate-100 outline-none' required />
                <input name='s_module' value={submissionFormData.s_module} onChange={handleSubmissionFormChange} placeholder='Module' className='rounded-lg border border-cyan-300/15 bg-[#101d3f] px-3 py-2 text-sm text-slate-100 outline-none' required />

                <select name='s_year' value={submissionFormData.s_year} onChange={handleSubmissionFormChange} className='rounded-lg border border-cyan-300/15 bg-[#101d3f] px-3 py-2 text-sm text-slate-100 outline-none' required>
                  {yearOptions.map((year) => (
                    <option key={year.value} value={year.value}>{year.label}</option>
                  ))}
                </select>

                <select name='s_semester' value={submissionFormData.s_semester} onChange={handleSubmissionFormChange} className='rounded-lg border border-cyan-300/15 bg-[#101d3f] px-3 py-2 text-sm text-slate-100 outline-none' required>     
                  <option value='1'>Semester 1</option>
                  <option value='2'>Semester 2</option>
                </select>

                <input name='s_course' value={submissionFormData.s_course} onChange={handleSubmissionFormChange} placeholder='Course (optional)' className='rounded-lg border border-cyan-300/15 bg-[#101d3f] px-3 py-2 text-sm text-slate-100 outline-none' />
                <input name='s_dueDate' type='date' min={minDueDate} value={submissionFormData.s_dueDate} onChange={handleSubmissionFormChange} className='rounded-lg border border-cyan-300/15 bg-[#101d3f] px-3 py-2 text-sm text-slate-100 outline-none' required />
              </div>

              <textarea name='s_description' value={submissionFormData.s_description} onChange={handleSubmissionFormChange} rows='3' placeholder='Description (optional)' className='w-full rounded-lg border border-cyan-300/15 bg-[#101d3f] px-3 py-2 text-sm text-slate-100 outline-none' />

              {submissionMessage && <p className='text-xs text-cyan-300'>{submissionMessage}</p>}

              <div className='flex items-center justify-end gap-2'>
                <button
                  type='button'
                  onClick={() => {
                    setIsSubmissionModalOpen(false);
                    resetSubmissionForm();
                  }}
                  className='rounded-lg border border-cyan-300/20 bg-[#101d3f] px-3 py-2 text-xs text-slate-200'
                >
                  Cancel
                </button>
                <button type='submit' className='inline-flex items-center gap-2 rounded-lg bg-cyan-500/20 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/30'>
                  <FaPlus />
                  {editingSubmissionId ? 'Update Submission' : 'Create Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default BatchrepSummary;