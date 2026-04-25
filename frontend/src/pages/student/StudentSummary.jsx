import React, { useEffect, useMemo, useState } from 'react';
import { FaCalendarAlt, FaClock, FaUsers, FaArrowUp } from 'react-icons/fa';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import API from '../../api';

const StudentSummary = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user || !['student', 'lecturer'].includes(user.u_role)) return;

      try {
        const res = await API.get('/submissions/student/my');
        setSubmissions(res.data?.submissions || []);
      } catch (err) {
        setSubmissions([]);
      }
    };

    fetchSubmissions();
  }, [user]);

  const formatDate = (value) => new Date(value).toLocaleDateString('en-GB');

  const getCountdown = (value) => {
    const due = new Date(value).getTime();
    const diff = due - Date.now();

    if (diff <= 0) {
      const overdueDays = Math.max(1, Math.ceil(Math.abs(diff) / (1000 * 60 * 60 * 24)));
      return { label: `${overdueDays} day${overdueDays === 1 ? '' : 's'} overdue`, overdue: true };
    }

    const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (daysLeft > 0) return { label: `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`, overdue: false };

    const hoursLeft = Math.max(1, Math.floor(diff / (1000 * 60 * 60)));
    return { label: `${hoursLeft} hour${hoursLeft === 1 ? '' : 's'} left`, overdue: false };
  };

  const activeSubmissions = useMemo(
    () => submissions.filter((item) => new Date(item.s_dueDate).getTime() >= Date.now()),
    [submissions]
  );
  const overdueSubmissions = useMemo(
    () => submissions.filter((item) => new Date(item.s_dueDate).getTime() < Date.now()),
    [submissions]
  );

  const chartData = [
    { month: 'Jan', events: 2, registered: 2 },
    { month: 'Feb', events: 3, registered: 3 },
    { month: 'Mar', events: 5, registered: 4 },
    { month: 'Apr', events: 4, registered: 3 },
    { month: 'May', events: 6, registered: 5 },
    { month: 'Jun', events: 7, registered: 6 },
  ];

  return (
    <div className='min-h-screen bg-[#0f1419] p-6 md:p-10'>
      <div className='max-w-7xl mx-auto space-y-8'>
        {/* Header */}
        <div className='mb-12'>
          <h1 className='text-5xl font-bold text-white mb-3'>Welcome, {user?.u_name || 'Student'}</h1>
          <p className='text-gray-400 text-lg'>
            {user?.u_role === 'lecturer' ? 'Lecture overview for submissions and portal activity' : 'Track your submissions and manage your academic progress'}
          </p>
        </div>

        {/* KPI Cards Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-2xl p-7 hover:border-blue-500/40 transition-all duration-300 shadow-lg shadow-blue-500/5'>
            <div className='flex items-start justify-between mb-4'>
              <div>
                <p className='text-blue-300/70 text-xs font-semibold tracking-wide mb-2'>TOTAL SUBMISSIONS</p>
                <h2 className='text-4xl font-bold text-white'>{submissions.length}</h2>
              </div>
              <div className='bg-blue-500/20 p-3 rounded-xl'>
                <FaCalendarAlt className='text-blue-400 text-xl' />
              </div>
            </div>
            <div className='flex items-center text-blue-300 text-sm'>
              <FaArrowUp className='mr-2 text-xs' /> {activeSubmissions.length} active submissions
            </div>
          </div>

          <div className='bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-2xl p-7 hover:border-green-500/40 transition-all duration-300 shadow-lg shadow-green-500/5'>
            <div className='flex items-start justify-between mb-4'>
              <div>
                <p className='text-green-300/70 text-xs font-semibold tracking-wide mb-2'>COMPLETED</p>
                <h2 className='text-4xl font-bold text-white'>{submissions.length - activeSubmissions.length}</h2>
              </div>
              <div className='bg-green-500/20 p-3 rounded-xl'>
                <svg className='w-6 h-6 text-green-400' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                </svg>
              </div>
            </div>
            <p className='text-green-300/70 text-sm'>All submissions submitted on time</p>
          </div>

          <div className='bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-2xl p-7 hover:border-orange-500/40 transition-all duration-300 shadow-lg shadow-orange-500/5'>
            <div className='flex items-start justify-between mb-4'>
              <div>
                <p className='text-orange-300/70 text-xs font-semibold tracking-wide mb-2'>PENDING</p>
                <h2 className='text-4xl font-bold text-white'>{activeSubmissions.length}</h2>
              </div>
              <div className='bg-orange-500/20 p-3 rounded-xl'>
                <FaClock className='text-orange-400 text-xl' />
              </div>
            </div>
            <p className='text-orange-300/70 text-sm'>Awaiting submission</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className='bg-[#1a1f2e]/60 border border-gray-700/30 rounded-2xl p-8 backdrop-blur-sm'>
          <div className='flex justify-between items-center mb-8'>
            <div>
              <h3 className='text-white font-semibold text-xl'>Participation Trend</h3>
              <p className='text-gray-400 text-sm mt-1'>Your submission activity over the past 6 months</p>
            </div>
            <div className='flex gap-2'>
              <span className='px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 text-xs font-medium'>6M</span>
              <span className='px-4 py-2 rounded-lg border border-gray-700/50 text-gray-400 text-xs font-medium'>3M</span>
              <span className='px-4 py-2 rounded-lg border border-gray-700/50 text-gray-400 text-xs font-medium'>1M</span>
            </div>
          </div>
          <ResponsiveContainer width='100%' height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray='3 3' stroke='#2a3142' vertical={false} />
              <XAxis dataKey='month' stroke='#888' style={{ fontSize: '12px' }} />
              <YAxis stroke='#888' style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f1419', border: '1px solid #2a3142', borderRadius: '12px' }} />
              <Line type='monotone' dataKey='events' stroke='#3b82f6' strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} activeDot={{ r: 7 }} />
              <Line type='monotone' dataKey='registered' stroke='#10b981' strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Submissions Table */}
        <div className='bg-[#1a1f2e]/60 border border-gray-700/30 rounded-2xl p-8 backdrop-blur-sm overflow-hidden'>
          <div className='mb-6'>
            <h3 className='text-white font-semibold text-xl mb-1'>Submission Queue</h3>
            <p className='text-gray-400 text-sm'>Track all your pending and upcoming submissions</p>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-gray-700/50 text-xs text-gray-400 uppercase tracking-wider'>
                  <th className='text-left py-4 px-6 font-semibold'>Submission Title</th>
                  <th className='text-left py-4 px-6 font-semibold'>Module</th>
                  <th className='text-left py-4 px-6 font-semibold'>Due Date</th>
                  <th className='text-left py-4 px-6 font-semibold'>Level</th>
                  <th className='text-right py-4 px-6 font-semibold'>Status</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-700/30'>
                {submissions.length === 0 && (
                  <tr>
                    <td colSpan='5' className='py-12 px-6 text-center'>
                      <p className='text-gray-400 font-medium'>No submissions right now</p>
                      <p className='text-gray-500 text-sm mt-1'>Check back soon for new assignments</p>
                    </td>
                  </tr>
                )}
                {submissions.map((submission) => {
                  const countdown = getCountdown(submission.s_dueDate);
                  const isUrgent = countdown.overdue || (new Date(submission.s_dueDate) - Date.now()) < 86400000; // less than 1 day
                  return (
                    <tr key={submission._id} className='hover:bg-[#252d3d]/40 transition-colors duration-200'>
                      <td className='py-5 px-6 text-white font-medium'>{submission.s_title}</td>
                      <td className='py-5 px-6 text-gray-300'>{submission.s_module}</td>
                      <td className='py-5 px-6 text-gray-400'>{formatDate(submission.s_dueDate)}</td>
                      <td className='py-5 px-6'>
                        <span className='px-3 py-1 bg-blue-500/10 text-blue-300 rounded-full text-sm font-medium border border-blue-500/20'>
                          Year {submission.s_year} / Sem {submission.s_semester}
                        </span>
                      </td>
                      <td className='py-5 px-6 text-right'>
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                          countdown.overdue 
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                            : isUrgent 
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                            : 'bg-green-500/20 text-green-300 border border-green-500/30'
                        }`}>
                          {countdown.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSummary;