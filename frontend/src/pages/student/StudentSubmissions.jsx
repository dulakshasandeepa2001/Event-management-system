import React, { useEffect, useMemo, useState } from 'react';
import { FaCloudUploadAlt, FaExternalLinkAlt, FaFileUpload, FaInfo, FaEye } from 'react-icons/fa';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';

const StudentSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [comment, setComment] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [openedSubmissionIds, setOpenedSubmissionIds] = useState({});
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsSubmission, setDetailsSubmission] = useState(null);
  const { user } = useAuth();
  const canUpload = user?.u_role === 'student';

  const fetchData = async () => {
    try {
      const [submissionRes, uploadRes] = await Promise.all([
        API.get('/submissions/student/my'),
        API.get('/submissions/student/uploads/my'),
      ]);

      setSubmissions(submissionRes.data?.submissions || []);
      setUploads(uploadRes.data?.uploads || []);
    } catch (err) {
      setUploadMessage(err.response?.data?.message || 'Failed to load submissions');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const uploadsBySubmissionId = useMemo(() => {
    const map = {};
    uploads.forEach((item) => {
      const submissionId = item?.submissionId?._id || item?.submissionId;
      if (submissionId) map[String(submissionId)] = item;
    });
    return map;
  }, [uploads]);

  const formatDate = (value) => new Date(value).toLocaleDateString('en-GB');

  const getTimeLeftLabel = (value) => {
    const due = new Date(value).getTime();
    const now = Date.now();
    const diff = due - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} day${days === 1 ? '' : 's'} left`;

    const hours = Math.max(1, Math.floor(diff / (1000 * 60 * 60)));
    return `${hours} hour${hours === 1 ? '' : 's'} left`;
  };

  const openUploadModal = (submission) => {
    if (!canUpload) return;
    setSelectedSubmission(submission);
    setSelectedFile(null);
    setComment('');
    setUploadMessage('');
    setIsUploadModalOpen(true);
    markSubmissionOpen(submission._id);
  };

  const openDetailsModal = (submission) => {
    setDetailsSubmission(submission);
    setIsDetailsModalOpen(true);
    if (canUpload) {
      markSubmissionOpen(submission._id);
    }
  };

  const markSubmissionOpen = async (submissionId) => {
    if (!submissionId || openedSubmissionIds[submissionId] || !canUpload) return;

    try {
      await API.post(`/submissions/${submissionId}/open`);
      setOpenedSubmissionIds((prev) => ({ ...prev, [submissionId]: true }));
    } catch (_err) {
      // Engagement tracking should not block the student workflow.
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!canUpload) {
      setUploadMessage('Lecturers can view submissions only.');
      return;
    }

    if (!selectedSubmission || !selectedFile) {
      setUploadMessage('Please select a file first');
      return;
    }

    try {
      setIsUploading(true);
      setUploadMessage('');

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('comment', comment);

      const response = await API.post(`/submissions/${selectedSubmission._id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Show success message
      setUploadMessage('✓ Submission successful! Your file has been uploaded.');
      
      // Refresh data to update the table immediately
      await fetchData();
      
      // Close modal after a brief delay
      setTimeout(() => {
        setIsUploadModalOpen(false);
      }, 1500);
    } catch (err) {
      setUploadMessage(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='p-6 space-y-6'>
      <section className='rounded-2xl border border-gray-700 bg-[#1a1f2e] p-5'>
        <h2 className='text-xl font-bold text-white'>My Submission Upload Page</h2>
        <p className='mt-1 text-sm text-gray-400'>
          {canUpload ? 'Open each submission and upload your file before due date.' : 'Lecture view mode: review submissions without uploading files.'}
        </p>
      </section>

      <section className='rounded-2xl border border-gray-700/30 bg-[#1a1f2e]/60 backdrop-blur-sm p-8'>
        <div className='mb-8'>
          <h3 className='text-xl font-bold text-white mb-2'>Your Submissions</h3>
          <p className='text-gray-400 text-sm'>Upload your work before the due date to ensure timely submission</p>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-gray-700/50 text-left text-xs uppercase tracking-wider text-gray-400 font-semibold'>
                <th className='px-6 py-4'>Submission Title</th>
                <th className='px-6 py-4'>Module</th>
                <th className='px-6 py-4'>Due Date</th>
                <th className='px-6 py-4'>Time Left</th>
                <th className='px-6 py-4'>Status</th>
                <th className='px-6 py-4'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-700/30'>
              {submissions.length === 0 && (
                <tr>
                  <td colSpan='6' className='px-6 py-12 text-center'>
                    <p className='text-gray-400 font-medium'>No submissions available</p>
                    <p className='text-gray-500 text-sm mt-1'>New assignments will appear here</p>
                  </td>
                </tr>
              )}
              {submissions.map((item) => {
                const upload = uploadsBySubmissionId[String(item._id)];
                const status = upload ? (upload.status === 'resubmitted' ? 'Re-Submitted' : 'Submitted') : 'Not Submitted';
                const isUrgent = new Date(item.s_dueDate) - Date.now() < 86400000; // less than 1 day
                const isOverdue = new Date(item.s_dueDate) < Date.now();

                return (
                  <tr key={item._id} className='hover:bg-[#252d3d]/40 transition-colors duration-200'>
                    <td className='px-6 py-5 font-semibold text-white'>{item.s_title}</td>
                    <td className='px-6 py-5 text-gray-300'>{item.s_module}</td>
                    <td className='px-6 py-5 text-gray-400'>{formatDate(item.s_dueDate)}</td>
                    <td className='px-6 py-5'>
                      <span className={`font-medium ${isOverdue ? 'text-red-400' : isUrgent ? 'text-orange-400' : 'text-green-400'}`}>
                        {getTimeLeftLabel(item.s_dueDate)}
                      </span>
                    </td>
                    <td className='px-6 py-5'>
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${
                        upload ? 'bg-green-500/10 text-green-300 border-green-500/30' : 'bg-orange-500/10 text-orange-300 border-orange-500/30'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => openDetailsModal(item)}
                          className='inline-flex items-center gap-2 rounded-lg bg-purple-500/20 border border-purple-500/30 px-3 py-2 text-xs font-medium text-purple-300 hover:bg-purple-500/30 transition-colors'
                          title='View submission details and description'
                        >
                          <FaEye className='text-sm' />
                          View
                        </button>

                        <button
                          onClick={() => openUploadModal(item)}
                          disabled={!canUpload}
                          className='inline-flex items-center gap-2 rounded-lg bg-blue-500/20 border border-blue-500/30 px-3 py-2 text-xs font-medium text-blue-300 hover:bg-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:border-gray-700/30 transition-colors'
                        >
                          <FaFileUpload />
                          {canUpload ? (upload ? 'Re-Upload' : 'Upload') : 'View Only'}
                        </button>

                        {upload?.fileUrl && (
                          <a
                            href={`http://localhost:5001${upload.fileUrl}`}
                            target='_blank'
                            rel='noreferrer'
                            className='inline-flex items-center gap-1 rounded-lg bg-green-500/20 px-3 py-2 text-xs text-green-300 hover:bg-green-500/30'
                          >
                            <FaExternalLinkAlt />
                            View
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {uploadMessage && <p className='mt-3 text-sm text-cyan-300'>{uploadMessage}</p>}
      </section>

      {isDetailsModalOpen && detailsSubmission && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4'>
          <div className='w-full max-w-lg rounded-2xl border border-gray-700 bg-[#1a1f2e] p-5'>
            <div className='mb-4 flex items-start justify-between'>
              <div>
                <h3 className='text-lg font-semibold text-white'>{detailsSubmission.s_title}</h3>
                <p className='text-sm text-gray-400'>{detailsSubmission.s_module}</p>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className='text-gray-400 hover:text-gray-300'
              >
                ✕
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-xs uppercase tracking-wider text-gray-500'>Module</label>
                <p className='mt-1 text-sm text-gray-200'>{detailsSubmission.s_module}</p>
              </div>

              <div>
                <label className='block text-xs uppercase tracking-wider text-gray-500'>Due Date</label>
                <p className='mt-1 text-sm text-gray-200'>{formatDate(detailsSubmission.s_dueDate)}</p>
              </div>

              <div>
                <label className='block text-xs uppercase tracking-wider text-gray-500'>Year & Semester</label>
                <p className='mt-1 text-sm text-gray-200'>Year {detailsSubmission.s_year} - Semester {detailsSubmission.s_semester}</p>
              </div>

              {detailsSubmission.s_course && (
                <div>
                  <label className='block text-xs uppercase tracking-wider text-gray-500'>Course</label>
                  <p className='mt-1 text-sm text-gray-200'>{detailsSubmission.s_course}</p>
                </div>
              )}

              <div>
                <label className='block text-xs uppercase tracking-wider text-gray-500'>Description</label>
                <div className='mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-700 bg-[#0f1419] p-3'>
                  <p className='text-sm text-gray-300 whitespace-pre-wrap'>{detailsSubmission.s_description || 'No description provided.'}</p>
                </div>
              </div>
            </div>

            <div className='mt-6 flex justify-end gap-2'>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className='rounded-lg border border-gray-600 px-4 py-2 text-xs text-gray-300 hover:bg-gray-700/20'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isUploadModalOpen && selectedSubmission && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4'>
          <div className='w-full max-w-lg rounded-2xl border border-gray-700 bg-[#1a1f2e] p-5'>
            <div className='mb-4'>
              <h3 className='text-lg font-semibold text-white'>Upload Submission File</h3>
              <p className='text-sm text-gray-400'>{selectedSubmission.s_title} ({selectedSubmission.s_module})</p>
            </div>

            {uploadMessage && uploadMessage.includes('Submission successful') ? (
              // Success state
              <div className='py-8 text-center'>
                <div className='mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20'>
                  <svg className='h-8 w-8 text-green-400' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                  </svg>
                </div>
                <h4 className='text-lg font-semibold text-white'>Submission Successful!</h4>
                <p className='mt-2 text-sm text-gray-300'>Your file has been uploaded and will be reviewed by your instructor.</p>
              </div>
            ) : (
              // Upload form
              <form onSubmit={handleUpload} className='space-y-3'>
                <label className='block'>
                  <span className='mb-1 block text-sm text-gray-300'>Choose file</span>
                  <input
                    type='file'
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className='w-full rounded-lg border border-gray-700 bg-[#0f1419] px-3 py-2 text-sm text-gray-200'
                    required
                  />
                </label>

                <label className='block'>
                  <span className='mb-1 block text-sm text-gray-300'>Comment (optional)</span>
                  <textarea
                    rows='3'
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className='w-full rounded-lg border border-gray-700 bg-[#0f1419] px-3 py-2 text-sm text-gray-200'
                    placeholder='Add a short note for your upload'
                  />
                </label>

                {uploadMessage && (
                  <p className='rounded-lg border border-red-700/50 bg-red-500/10 px-3 py-2 text-sm text-red-300'>
                    {uploadMessage}
                  </p>
                )}

                <div className='mt-2 flex justify-end gap-2'>
                  <button
                    type='button'
                    onClick={() => setIsUploadModalOpen(false)}
                    className='rounded-lg border border-gray-600 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700/20'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={isUploading}
                    className='inline-flex items-center gap-2 rounded-lg bg-blue-500/20 px-3 py-2 text-xs font-semibold text-blue-200 hover:bg-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    <FaCloudUploadAlt />
                    {isUploading ? 'Uploading...' : 'Upload File'}
                  </button>
                </div>
              </form>
            )}

            {uploadMessage && uploadMessage.includes('Submission successful') && (
              <div className='mt-4 flex justify-end'>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className='rounded-lg border border-green-600/50 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-300 hover:bg-green-500/20'
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSubmissions;
