import React, { useEffect, useMemo, useState } from 'react';
import { FaCheckCircle, FaEdit, FaEye, FaFileDownload, FaPlus, FaTrash } from 'react-icons/fa';
import API from '../../api';

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

const BatchrepSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [submissionFormData, setSubmissionFormData] = useState(initialSubmissionForm);
  const [editingSubmissionId, setEditingSubmissionId] = useState(null);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [isEngagementModalOpen, setIsEngagementModalOpen] = useState(false);
  const [engagementLoading, setEngagementLoading] = useState(false);
  const [selectedSubmissionForEngagement, setSelectedSubmissionForEngagement] = useState(null);
  const [engagementSummary, setEngagementSummary] = useState({ openedStudentCount: 0, uploadedStudentCount: 0 });
  const [engagementDetails, setEngagementDetails] = useState([]);
  const minDueDate = new Date().toISOString().split('T')[0];

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

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('en-GB');
  };

  const getSubmissionStage = (item) => {
    // Check if all students who opened the submission have also submitted
    const openedCount = item.openedStudentCount || 0;
    const submittedCount = item.submittedStudentCount || 0;
    
    if (openedCount > 0 && submittedCount >= openedCount) {
      return 'Completed';
    }

    const dueTs = new Date(item.s_dueDate).getTime();
    const nowTs = Date.now();
    const daysLeft = Math.floor((dueTs - nowTs) / (1000 * 60 * 60 * 24));

    if (dueTs < nowTs) return 'Ended';
    if (daysLeft <= 7) return 'In Progress';
    return 'Not Open';
  };

  const stats = useMemo(() => {
    const total = submissions.length;
    const notOpen = submissions.filter((item) => getSubmissionStage(item) === 'Not Open').length;
    const inProgress = submissions.filter((item) => getSubmissionStage(item) === 'In Progress').length;
    const completed = submissions.filter((item) => getSubmissionStage(item) === 'Completed').length;
    const ended = submissions.filter((item) => getSubmissionStage(item) === 'Ended').length;

    const percent = (value) => (total ? Math.round((value / total) * 100) : 0);

    return {
      total,
      notOpen,
      inProgress,
      completed,
      ended,
      notOpenPct: percent(notOpen),
      inProgressPct: percent(inProgress),
      completedPct: percent(completed),
      endedPct: percent(ended),
    };
  }, [submissions]);

  const handleSubmissionFormChange = (e) => {
    const { name, value } = e.target;
    setSubmissionFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetSubmissionForm = () => {
    setSubmissionFormData(initialSubmissionForm);
    setEditingSubmissionId(null);
  };

  const openCreateSubmissionModal = () => {
    setSubmissionMessage('');
    resetSubmissionForm();
    setIsSubmissionModalOpen(true);
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

  const handleSubmissionExport = () => {
    if (!submissions.length) return;
    const header = ['Date', 'Module', 'Year', 'Semester', 'Course', 'Title', 'Opened', 'Uploaded', 'Description', 'Stage'];
    const rows = submissions.map((s) => [
      formatDate(s.s_dueDate),
      s.s_module,
      s.s_year,
      s.s_semester,
      s.s_course || 'All',
      s.s_title,
      s.openedStudentCount || 0,
      s.submittedStudentCount || s.uploadCount || 0,
      (s.s_description || '').replace(/,/g, ' '),
      getSubmissionStage(s),
    ]);

    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'submission-dashboard-export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openEngagementModal = async (submission) => {
    try {
      setSubmissionMessage('');
      setEngagementLoading(true);
      setIsEngagementModalOpen(true);
      setSelectedSubmissionForEngagement(submission);
      const res = await API.get(`/submissions/${submission._id}/engagement`);
      setEngagementSummary(res.data?.summary || { openedStudentCount: 0, uploadedStudentCount: 0 });
      setEngagementDetails(res.data?.studentDetails || []);
    } catch (err) {
      setSubmissionMessage(err.response?.data?.message || 'Failed to load submission engagement details');
      setIsEngagementModalOpen(false);
    } finally {
      setEngagementLoading(false);
    }
  };

  return (
    <div className='space-y-5'>
      <section className='rounded-2xl border border-cyan-300/10 bg-[#09122a] p-4 md:p-5'>
        <h2 className='mb-4 text-lg font-semibold text-slate-100'>Submission Dashboard</h2>

        <div className='grid gap-3 md:grid-cols-4'>
          <article className='rounded-xl border border-cyan-300/10 bg-[#0d1734] p-3'>
            <p className='text-xs uppercase tracking-wider text-slate-400'>Total</p>
            <p className='mt-1 text-3xl font-bold text-slate-100'>{stats.total}</p>
          </article>
          <article className='rounded-xl border border-cyan-300/10 bg-[#0d1734] p-3'>
            <p className='text-xs uppercase tracking-wider text-slate-400'>Not Open</p>
            <p className='mt-1 text-3xl font-bold text-cyan-200'>{stats.notOpen}</p>
            <p className='text-xs text-slate-400'>{stats.notOpenPct}%</p>
          </article>
          <article className='rounded-xl border border-cyan-300/10 bg-[#0d1734] p-3'>
            <p className='text-xs uppercase tracking-wider text-slate-400'>In Progress</p>
            <p className='mt-1 text-3xl font-bold text-amber-300'>{stats.inProgress}</p>
            <p className='text-xs text-slate-400'>{stats.inProgressPct}%</p>
          </article>
          <article className='rounded-xl border border-cyan-300/10 bg-[#0d1734] p-3'>
            <p className='text-xs uppercase tracking-wider text-slate-400'>Completed</p>
            <p className='mt-1 text-3xl font-bold text-green-300'>{stats.completed}</p>
            <p className='text-xs text-slate-400'>{stats.completedPct}%</p>
          </article>
        </div>

        <div className='mt-4 space-y-2'>
          <div>
            <div className='mb-1 flex justify-between text-xs text-slate-400'><span>Not Open</span><span>{stats.notOpenPct}%</span></div>
            <div className='h-2 rounded-full bg-[#0a132c]'><div className='h-2 rounded-full bg-cyan-500' style={{ width: `${stats.notOpenPct}%` }} /></div>
          </div>
          <div>
            <div className='mb-1 flex justify-between text-xs text-slate-400'><span>In Progress</span><span>{stats.inProgressPct}%</span></div>
            <div className='h-2 rounded-full bg-[#0a132c]'><div className='h-2 rounded-full bg-amber-500' style={{ width: `${stats.inProgressPct}%` }} /></div>
          </div>
          <div>
            <div className='mb-1 flex justify-between text-xs text-slate-400'><span>Completed</span><span>{stats.completedPct}%</span></div>
            <div className='h-2 rounded-full bg-[#0a132c]'><div className='h-2 rounded-full bg-green-500' style={{ width: `${stats.completedPct}%` }} /></div>
          </div>
        </div>
      </section>

      <section className='rounded-2xl border border-cyan-300/10 bg-[#09122a] p-4 md:p-5'>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
          <h2 className='text-lg font-semibold text-slate-100'>Submission Details</h2>
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
                <th className='px-3 py-2'>Opened</th>
                <th className='px-3 py-2'>Uploaded</th>
                <th className='px-3 py-2'>Stage</th>
                <th className='px-3 py-2'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loadingSubmissions && submissions.length === 0 && (
                <tr>
                  <td colSpan='9' className='rounded-xl bg-[#0d1734] px-3 py-4 text-center text-slate-400'>No submissions yet. Create your first submission above.</td>
                </tr>
              )}
              {submissions.map((row) => {
                const stage = getSubmissionStage(row);
                const stageClass =
                  stage === 'Ended'
                    ? 'bg-rose-500/15 text-rose-200'
                    : stage === 'Completed'
                    ? 'bg-green-500/15 text-green-200'
                    : stage === 'In Progress'
                    ? 'bg-amber-500/15 text-amber-200'
                    : 'bg-cyan-500/15 text-cyan-200';

                return (
                  <tr key={row._id} className='rounded-xl bg-[#0d1734] text-slate-200'>
                    <td className='rounded-l-xl px-3 py-3'>{formatDate(row.s_dueDate)}</td>
                    <td className='px-3 py-3'>
                      <p>{row.s_module}</p>
                      <p className='text-xs text-slate-400'>{`${row.openedStudentCount || 0} opened / ${row.submittedStudentCount || row.uploadCount || 0} uploaded`}</p>
                    </td>
                    <td className='px-3 py-3'>{row.s_year}</td>
                    <td className='px-3 py-3'>{row.s_semester}</td>
                    <td className='max-w-[220px] truncate px-3 py-3 text-slate-300'>{row.s_title}</td>
                    <td className='px-3 py-3 text-amber-200'>{row.openedStudentCount || 0}</td>
                    <td className='px-3 py-3 text-cyan-200'>{row.submittedStudentCount || row.uploadCount || 0}</td>
                    <td className='rounded-r-xl px-3 py-3'>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${stageClass}`}>
                        <FaCheckCircle className='text-[10px]' />
                        {stage}
                      </span>
                    </td>
                    <td className='px-3 py-3'>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => openEngagementModal(row)}
                          className='rounded-md bg-amber-500/20 p-2 text-amber-200 hover:bg-amber-500/30'
                          title='View opened/uploaded details'
                        >
                          <FaEye />
                        </button>
                        <button onClick={() => handleEditSubmission(row)} className='rounded-md bg-cyan-500/20 p-2 text-cyan-200 hover:bg-cyan-500/30'>
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDeleteSubmission(row._id)} className='rounded-md bg-rose-500/20 p-2 text-rose-200 hover:bg-rose-500/30'>
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {submissionMessage && <p className='mt-3 text-xs text-cyan-300'>{submissionMessage}</p>}
      </section>

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

      {isEngagementModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
          <div className='w-full max-w-4xl rounded-2xl border border-cyan-300/20 bg-[#0b1735] p-5'>
            <div className='mb-4 flex items-center justify-between'>
              <div>
                <h3 className='text-base font-semibold text-slate-100'>Submission Engagement</h3>
                <p className='text-sm text-slate-300'>
                  {selectedSubmissionForEngagement?.s_module || '-'} - {selectedSubmissionForEngagement?.s_title || '-'}
                </p>
              </div>
              <button
                type='button'
                onClick={() => {
                  setIsEngagementModalOpen(false);
                  setEngagementDetails([]);
                  setSelectedSubmissionForEngagement(null);
                }}
                className='text-xs text-slate-300 hover:text-white'
              >
                Close
              </button>
            </div>

            <div className='mb-4 grid gap-3 md:grid-cols-2'>
              <article className='rounded-xl border border-amber-300/20 bg-[#101d3f] p-3'>
                <p className='text-xs uppercase tracking-wider text-slate-400'>Students Opened</p>
                <p className='mt-1 text-2xl font-bold text-amber-200'>{engagementSummary.openedStudentCount || 0}</p>
              </article>
              <article className='rounded-xl border border-cyan-300/20 bg-[#101d3f] p-3'>
                <p className='text-xs uppercase tracking-wider text-slate-400'>Students Uploaded</p>
                <p className='mt-1 text-2xl font-bold text-cyan-200'>{engagementSummary.uploadedStudentCount || 0}</p>
              </article>
            </div>

            <div className='max-h-[55vh] overflow-auto rounded-xl border border-cyan-300/10'>
              <table className='min-w-full text-sm'>
                <thead className='sticky top-0 bg-[#101d3f] text-left text-xs uppercase tracking-wider text-slate-400'>
                  <tr>
                    <th className='px-3 py-2'>Student</th>
                    <th className='px-3 py-2'>Index</th>
                    <th className='px-3 py-2'>Opened</th>
                    <th className='px-3 py-2'>Open Count</th>
                    <th className='px-3 py-2'>Uploaded</th>
                    <th className='px-3 py-2'>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {!engagementLoading && engagementDetails.length === 0 && (
                    <tr>
                      <td colSpan='6' className='px-3 py-5 text-center text-slate-400'>No student activity yet for this submission.</td>
                    </tr>
                  )}

                  {engagementLoading && (
                    <tr>
                      <td colSpan='6' className='px-3 py-5 text-center text-slate-400'>Loading details...</td>
                    </tr>
                  )}

                  {!engagementLoading && engagementDetails.map((student) => (
                    <tr key={student.studentId} className='border-t border-cyan-300/10 text-slate-200'>
                      <td className='px-3 py-2'>
                        <p>{student.fullName || '-'}</p>
                        <p className='text-xs text-slate-400'>{student.email || '-'}</p>
                      </td>
                      <td className='px-3 py-2'>{student.indexNumber || '-'}</td>
                      <td className='px-3 py-2'>
                        <span className={`rounded-full px-2 py-1 text-xs ${student.opened ? 'bg-amber-500/20 text-amber-200' : 'bg-slate-500/20 text-slate-300'}`}>
                          {student.opened ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className='px-3 py-2'>{student.openCount || 0}</td>
                      <td className='px-3 py-2'>
                        <span className={`rounded-full px-2 py-1 text-xs ${student.uploaded ? 'bg-cyan-500/20 text-cyan-200' : 'bg-slate-500/20 text-slate-300'}`}>
                          {student.uploaded ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className='px-3 py-2 text-xs text-slate-300'>
                        {student.submittedAt ? formatDate(student.submittedAt) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchrepSubmissions;
