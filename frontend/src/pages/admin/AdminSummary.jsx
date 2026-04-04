import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { FaCheckCircle, FaFileAlt, FaMoneyBillWave, FaBuilding, FaDownload,
<<<<<<< HEAD
  FaHourglassHalf, FaTimesCircle, FaUsers, FaCalendarAlt, FaBell, FaUserTie, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend as ReLegend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, LineChart, Line } from 'recharts';

const AdminSummary = () => {

=======
  FaHourglassHalf, FaTimesCircle, FaUsers, FaCalendarAlt, FaBell, FaUserTie, FaArrowUp, FaArrowDown, FaSync } from 'react-icons/fa'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend as ReLegend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, LineChart, Line } from 'recharts';
import API from '../../api'

const AdminSummary = () => {

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState("all");
  const [totalStudents, setTotalStudents] = useState(0);
  const [activeStudents, setActiveStudents] = useState(0);

  useEffect(() => {
    fetchAllStudents();
    fetchStudentStats();
  }, []);

  const fetchStudentStats = async () => {
    try {
      const res = await API.get('/api/students?limit=1000&skip=0');
      const allStudents = res.data.students || [];
      setTotalStudents(allStudents.length);
      setActiveStudents(allStudents.filter(s => s.u_isActive).length);
    } catch (err) {
      console.error('Failed to load student stats:', err);
    }
  };

  const fetchAllStudents = async (search = "", active = "all") => {
    setLoadingStudents(true);
    try {
      let url = '/api/students?limit=100&skip=0';
      
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      if (active !== "all") {
        url += `&isActive=${active === "active"}`;
      }
      
      console.log('🔵 Fetching students from:', url);
      const res = await API.get(url);
      console.log('🟢 Students response:', res.data);
      
      if (res.data && res.data.students) {
        setStudents(res.data.students);
        console.log('✅ Set students:', res.data.students.length, 'students');
      } else {
        console.warn('⚠️ No students in response:', res.data);
        setStudents([]);
      }
    } catch (err) {
      console.error('❌ Failed to load students:', err);
      console.error('Error details:', err.response?.data || err.message);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    fetchAllStudents(value, filterActive);
  };

  const handleFilterActive = (value) => {
    setFilterActive(value);
    fetchAllStudents(searchTerm, value);
  };

>>>>>>> ra_new_part
  // Mock data for charts
  const eventData = [
    { name: 'Jan', events: 24, registrations: 120 },
    { name: 'Feb', events: 19, registrations: 95 },
    { name: 'Mar', events: 29, registrations: 140 },
    { name: 'Apr', events: 18, registrations: 85 },
    { name: 'May', events: 35, registrations: 180 },
    { name: 'Jun', events: 42, registrations: 220 }
  ];

  const categoryData = [
    { name: 'Technical', value: 35, color: '#3b82f6' },
    { name: 'Sports', value: 25, color: '#ef4444' },
    { name: 'Cultural', value: 22, color: '#8b5cf6' },
    { name: 'Academic', value: 18, color: '#10b981' }
  ];

  const batchData = [
    { name: 'Batch 2023', students: 45, events: 12, attendance: 92 },
    { name: 'Batch 2024', students: 42, events: 8, attendance: 88 },
    { name: 'Batch 2025', students: 38, events: 15, attendance: 85 }
  ];

  const recentActivities = [
    { id: 1, action: 'New event created', details: 'Tech Hackathon 2026', time: '2 hours ago', icon: FaCalendarAlt },
    { id: 2, action: 'Batch updated', details: 'Batch 2023 data updated', time: '4 hours ago', icon: FaBuilding },
    { id: 3, action: 'User registered', details: '5 new students joined', time: '6 hours ago', icon: FaUsers },
    { id: 4, action: 'Report generated', details: 'Monthly analytics ready', time: '1 day ago', icon: FaFileAlt }
  ];

  return (
    <div className='p-8 space-y-8 bg-[#0f1419] min-h-screen text-white overflow-y-auto'>
      
      {/* Header */}
      <div className='space-y-2'>
        <h1 className='text-5xl font-bold text-white'>Admin Dashboard</h1>
        <p className='text-gray-400'>Welcome back! Here's your management overview</p>
      </div>

      {/* Key Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        
        {/* Total Events */}
        <div className='bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-gray-400 text-sm font-semibold'>Total Events</h3>
            <div className='bg-blue-500/20 p-3 rounded-lg'>
              <FaCalendarAlt className='text-blue-500 text-lg' />
            </div>
          </div>
          <div className='space-y-2'>
            <p className='text-3xl font-bold text-white'>247</p>
            <div className='flex items-center text-green-500 text-sm'>
              <FaArrowUp className='mr-1' /> 12% from last month
            </div>
          </div>
        </div>

        {/* Total Students */}
        <div className='bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-gray-400 text-sm font-semibold'>Total Students</h3>
            <div className='bg-purple-500/20 p-3 rounded-lg'>
              <FaUsers className='text-purple-500 text-lg' />
            </div>
          </div>
          <div className='space-y-2'>
<<<<<<< HEAD
            <p className='text-3xl font-bold text-white'>892</p>
            <div className='flex items-center text-green-500 text-sm'>
              <FaArrowUp className='mr-1' /> 8% from last month
=======
            <p className='text-3xl font-bold text-white'>{totalStudents}</p>
            <div className='flex items-center text-green-500 text-sm'>
              <FaArrowUp className='mr-1' /> {activeStudents} active students
>>>>>>> ra_new_part
            </div>
          </div>
        </div>

        {/* Total Batches */}
        <div className='bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-xl p-6 hover:border-orange-500 transition'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-gray-400 text-sm font-semibold'>Total Batches</h3>
            <div className='bg-orange-500/20 p-3 rounded-lg'>
              <FaBuilding className='text-orange-500 text-lg' />
            </div>
          </div>
          <div className='space-y-2'>
            <p className='text-3xl font-bold text-white'>45</p>
            <div className='flex items-center text-green-500 text-sm'>
              <FaArrowUp className='mr-1' /> 5% from last month
            </div>
          </div>
        </div>

        {/* Registrations */}
        <div className='bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-xl p-6 hover:border-green-500 transition'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-gray-400 text-sm font-semibold'>Total Registrations</h3>
            <div className='bg-green-500/20 p-3 rounded-lg'>
              <FaCheckCircle className='text-green-500 text-lg' />
            </div>
          </div>
          <div className='space-y-2'>
            <p className='text-3xl font-bold text-white'>1,243</p>
            <div className='flex items-center text-green-500 text-sm'>
              <FaArrowUp className='mr-1' /> 15% from last month
            </div>
          </div>
        </div>

      </div>

      {/* Charts Section */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        
        {/* Events & Registrations Trend */}
        <div className='lg:col-span-2 bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-xl p-6'>
          <h3 className='text-lg font-bold text-white mb-6'>Events & Registration Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={eventData}>
              <defs>
                <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
              <Area type="monotone" dataKey="events" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEvents)" />
              <Area type="monotone" dataKey="registrations" stroke="#10b981" fillOpacity={1} fill="url(#colorReg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Event Categories */}
        <div className='bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-xl p-6'>
          <h3 className='text-lg font-bold text-white mb-6'>Event Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Batch Overview & Recent Activities */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        
        {/* Batch Overview Table */}
        <div className='bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-xl p-6'>
          <h3 className='text-lg font-bold text-white mb-6'>Batch Overview</h3>
          <div className='space-y-4'>
            {batchData.map((batch, i) => (
              <div key={i} className='flex items-center justify-between p-4 bg-[#0f1419] hover:bg-[#1a1f2e] rounded-lg border border-gray-700 transition'>
                <div>
                  <p className='text-white font-semibold'>{batch.name}</p>
                  <p className='text-gray-400 text-sm'>{batch.students} students • {batch.events} events</p>
                </div>
                <div className='text-right'>
                  <p className='text-green-500 font-bold'>{batch.attendance}%</p>
                  <p className='text-gray-400 text-xs'>Attendance</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className='bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-xl p-6'>
          <h3 className='text-lg font-bold text-white mb-6'>Recent Activities</h3>
          <div className='space-y-4'>
            {recentActivities.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className='flex items-start gap-4 p-4 bg-[#0f1419] hover:bg-[#1a1f2e] rounded-lg border border-gray-700 transition'>
                  <div className='bg-blue-500/20 p-3 rounded-lg flex-shrink-0'>
                    <IconComponent className='text-blue-500 text-lg' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-white font-semibold text-sm'>{activity.action}</p>
                    <p className='text-gray-400 text-xs truncate'>{activity.details}</p>
                  </div>
                  <p className='text-gray-500 text-xs flex-shrink-0'>{activity.time}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

<<<<<<< HEAD
=======
      {/* Students Table Section */}
      <div className='bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-xl p-6'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h3 className='text-lg font-bold text-white'>All Students</h3>
            <p className='text-gray-400 text-sm mt-1'>{students.length} students loaded</p>
          </div>
          <button 
            onClick={() => {
              fetchAllStudents(searchTerm, filterActive);
              fetchStudentStats();
            }}
            disabled={loadingStudents}
            className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50'
          >
            <FaSync className={loadingStudents ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Search and Filters */}
        <div className='flex gap-4 mb-6'>
          <input 
            type="text" 
            placeholder="Search by name, email, or RegNo..." 
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className='flex-1 px-4 py-2 bg-[#0f1419] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none'
          />
          <select
            value={filterActive}
            onChange={(e) => handleFilterActive(e.target.value)}
            className='px-4 py-2 bg-[#0f1419] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none'
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {/* Students Table */}
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='border-b border-gray-600'>
              <tr>
                <th className='text-left py-3 px-4 text-gray-400 font-semibold text-sm'>ID</th>
                <th className='text-left py-3 px-4 text-gray-400 font-semibold text-sm'>RegNo</th>
                <th className='text-left py-3 px-4 text-gray-400 font-semibold text-sm'>Name</th>
                <th className='text-left py-3 px-4 text-gray-400 font-semibold text-sm'>Email</th>
                <th className='text-left py-3 px-4 text-gray-400 font-semibold text-sm'>Course</th>
                <th className='text-left py-3 px-4 text-gray-400 font-semibold text-sm'>Year</th>
                <th className='text-left py-3 px-4 text-gray-400 font-semibold text-sm'>Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingStudents ? (
                <tr>
                  <td colSpan="7" className='py-8 text-center text-gray-400'>
                    <div className='flex justify-center items-center gap-2'>
                      <FaSync className='animate-spin' />
                      Loading students...
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="7" className='py-8 text-center text-gray-400'>
                    No students found
                  </td>
                </tr>
              ) : (
                students.map((student, idx) => (
                  <tr key={student._id || idx} className='border-b border-gray-700 hover:bg-[#0f1419] transition'>
                    <td className='py-3 px-4 text-gray-400 text-xs font-mono'>{(student._id || '—').substring(0, 8)}</td>
                    <td className='py-3 px-4 text-white font-medium'>{student.u_regno || '—'}</td>
                    <td className='py-3 px-4 text-gray-300'>{student.u_name || '—'}</td>
                    <td className='py-3 px-4 text-gray-300 text-sm'>{student.u_email || '—'}</td>
                    <td className='py-3 px-4 text-gray-300'>{student.u_course || '—'}</td>
                    <td className='py-3 px-4 text-gray-300 text-center'>Year {student.u_year || 1}</td>
                    <td className='py-3 px-4'>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        student.u_isActive 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {student.u_isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

>>>>>>> ra_new_part
    </div>
  );
};

export default AdminSummary;