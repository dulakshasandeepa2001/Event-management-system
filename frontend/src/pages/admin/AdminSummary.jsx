import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { FaCheckCircle, FaFileAlt, FaMoneyBillWave, FaBuilding, FaDownload,
  FaHourglassHalf, FaTimesCircle, FaUsers, FaCalendarAlt, FaBell, FaUserTie, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend as ReLegend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, LineChart, Line } from 'recharts';

const AdminSummary = () => {

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
            <p className='text-3xl font-bold text-white'>892</p>
            <div className='flex items-center text-green-500 text-sm'>
              <FaArrowUp className='mr-1' /> 8% from last month
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

    </div>
  );
};

export default AdminSummary;