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
    <div className='p-8 space-y-8'>
      <div>
        <h1 className='text-4xl font-bold text-white mb-2'>Welcome, {user?.u_name || 'Student'}</h1>
        <p className='text-gray-400'>
          {user?.u_role === 'lecturer' ? 'Lecture overview for submissions and portal activity' : "Here's your event portfolio overview"}
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 bg-[#1a1f2e] border border-gray-700 rounded-lg p-8'>
          <div className='flex justify-between items-start mb-8'>
            <div>
              <p className='text-gray-400 text-sm mb-2'>Total Submissions Assigned</p>
              <h2 className='text-5xl font-bold text-white'>{submissions.length}</h2>
              <div className='flex items-center text-green-400 text-sm mt-4'>
                <FaArrowUp className='mr-1' /> {activeSubmissions.length} active now
              </div>
            </div>
            <div className='inline-block bg-blue-500/20 p-4 rounded-lg'>
              <FaCalendarAlt className='text-blue-500 text-2xl' />
            </div>
          </div>

          <ResponsiveContainer width='100%' height={80}>
            <LineChart data={chartData}>
              <Line type='monotone' dataKey='registered' stroke='#3b82f6' strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className='space-y-3'>
          <div className='bg-[#1a1f2e] border border-gray-700 rounded-lg p-6'>
            <p className='text-gray-400 text-xs mb-2'>UPCOMING SUBMISSIONS</p>
            <h3 className='text-3xl font-bold text-white'>{activeSubmissions.length}</h3>
            <p className='text-green-400 text-xs mt-2'>Need your action</p>
          </div>
          <div className='bg-[#1a1f2e] border border-gray-700 rounded-lg p-6'>
            <p className='text-gray-400 text-xs mb-2'>OVERDUE SUBMISSIONS</p>
            <h3 className='text-3xl font-bold text-white'>{overdueSubmissions.length}</h3>
            <p className='text-orange-400 text-xs mt-2'>Please submit soon</p>
          </div>
        </div>
      </div>

      <div className='bg-[#1a1f2e] border border-gray-700 rounded-lg p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h3 className='text-white font-semibold text-lg'>Event Participation Performance</h3>
          <div className='flex gap-2 text-xs text-gray-400'>
            <span className='px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/50'>1D</span>
            <span className='px-4 py-2 rounded-full border border-gray-700'>1W</span>
            <span className='px-4 py-2 rounded-full border border-gray-700'>1M</span>
          </div>
        </div>
        <ResponsiveContainer width='100%' height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray='3 3' stroke='#333' />
            <XAxis dataKey='month' stroke='#888' />
            <YAxis stroke='#888' />
            <Tooltip contentStyle={{ backgroundColor: '#0f1419', border: '1px solid #333', borderRadius: '8px' }} />
            <Line type='monotone' dataKey='events' stroke='#3b82f6' strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
            <Line type='monotone' dataKey='registered' stroke='#10b981' strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className='bg-[#1a1f2e] border border-gray-700 rounded-lg p-6'>
        <h3 className='text-white font-semibold text-lg mb-6'>Submission Overview</h3>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-gray-700 text-xs text-gray-400'>
                <th className='text-left py-3 px-4'>TITLE</th>
                <th className='text-left py-3 px-4'>MODULE</th>
                <th className='text-left py-3 px-4'>DUE DATE</th>
                <th className='text-left py-3 px-4'>YEAR/SEM</th>
                <th className='text-right py-3 px-4'>TIME LEFT</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 && (
                <tr>
                  <td colSpan='5' className='py-4 px-4 text-center text-sm text-gray-400'>No submission notifications right now.</td>
                </tr>
              )}
              {submissions.map((submission) => {
                const countdown = getCountdown(submission.s_dueDate);
                return (
                  <tr key={submission._id} className='border-b border-gray-700/50 hover:bg-[#252d3d]/50 transition'>
                    <td className='py-4 px-4 text-white font-medium'>{submission.s_title}</td>
                    <td className='py-4 px-4 text-gray-300 text-sm'>{submission.s_module}</td>
                    <td className='py-4 px-4 text-gray-400 text-sm'>{formatDate(submission.s_dueDate)}</td>
                    <td className='py-4 px-4 text-gray-300 text-sm'>{submission.s_year} / {submission.s_semester}</td>
                    <td className={`py-4 px-4 text-right font-semibold ${countdown.overdue ? 'text-red-400' : 'text-green-400'}`}>
                      {countdown.label}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentSummary;