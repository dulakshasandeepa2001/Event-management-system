import React, { useEffect, useMemo, useState } from 'react';
import { FaCloudUploadAlt, FaExternalLinkAlt, FaFileUpload, FaInfo, FaEye } from 'react-icons/fa';
import API from '../../api';

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
    markSubmissionOpen(submission._id);
  };

  const markSubmissionOpen = async (submissionId) => {
    if (!submissionId || openedSubmissionIds[submissionId]) return;

    try {
      await API.post(`/submissions/${submissionId}/open`);
      setOpenedSubmissionIds((prev) => ({ ...prev, [submissionId]: true }));
    } catch (_err) {
      // Engagement tracking should not block the student workflow.
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
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

      await API.post(`/submissions/${selectedSubmission._id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadMessage('File uploaded successfully');
      await fetchData();
      setTimeout(() => {
        setIsUploadModalOpen(false);
      }, 700);
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
        <p className='mt-1 text-sm text-gray-400'>Open each submission and upload your file before due date.</p>
      </section>

      <section className='rounded-2xl border border-gray-700 bg-[#1a1f2e] p-5'>
        <h3 className='mb-4 text-lg font-semibold text-white'>Submissions</h3>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-gray-700 text-left text-xs uppercase tracking-wider text-gray-400'>
                <th className='px-3 py-2'>Title</th>
                <th className='px-3 py-2'>Module</th>
                <th className='px-3 py-2'>Due Date</th>
                <th className='px-3 py-2'>Time Left</th>
                <th className='px-3 py-2'>Upload Status</th>
                <th className='px-3 py-2'>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 && (
                <tr>
                  <td className='px-3 py-4 text-center text-gray-400' colSpan='6'>No submissions available.</td>
                </tr>
              )}
              {submissions.map((item) => {
                const upload = uploadsBySubmissionId[String(item._id)];
                const status = upload ? (upload.status === 'resubmitted' ? 'Re-Submitted' : 'Submitted') : 'Not Submitted';
                const statusClass = upload ? 'text-green-400' : 'text-orange-400';

                return (
                  <tr key={item._id} className='border-b border-gray-700/50 text-sm text-gray-200'>
                    <td className='px-3 py-3 font-semibold'>{item.s_title}</td>
                    <td className='px-3 py-3'>{item.s_module}</td>
                    <td className='px-3 py-3'>{formatDate(item.s_dueDate)}</td>
                    <td className='px-3 py-3'>{getTimeLeftLabel(item.s_dueDate)}</td>
                    <td className={`px-3 py-3 ${statusClass}`}>{status}</td>
                    <td className='px-3 py-3'>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => openDetailsModal(item)}
                          className='inline-flex items-center gap-2 rounded-lg bg-purple-500/20 px-3 py-2 text-xs text-purple-300 hover:bg-purple-500/30'
                          title='View submission details and description'
                        >
                          <FaEye />
                          View Details
                        </button>

                        <button
                          onClick={() => openUploadModal(item)}
                          className='inline-flex items-center gap-2 rounded-lg bg-blue-500/20 px-3 py-2 text-xs text-blue-300 hover:bg-blue-500/30'
                        >
                          <FaFileUpload />
                          {upload ? 'Re-Upload' : 'Upload'}
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

              {uploadMessage && <p className='text-sm text-cyan-300'>{uploadMessage}</p>}

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
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSubmissions;
