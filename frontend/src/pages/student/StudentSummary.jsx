import React, { useEffect, useState, useMemo } from 'react'
import { FaCheckCircle, FaCalendarAlt, FaUsers, FaClock, FaTrophy, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts'
import { useAuth } from '../../context/AuthContext'

const StudentSummary = () => {
    const { user } = useAuth();

    // Mock data for charts
    const participationData = [
        { month: 'Jan', events: 2, registered: 2 },
        { month: 'Feb', events: 3, registered: 3 },
        { month: 'Mar', events: 5, registered: 4 },
        { month: 'Apr', events: 4, registered: 3 },
        { month: 'May', events: 6, registered: 5 },
        { month: 'Jun', events: 7, registered: 6 }
    ];

    const eventsByCategory = [
        { name: 'Tech', value: 5, percentage: '42%' },
        { name: 'Sports', value: 3, percentage: '25%' },
        { name: 'Cultural', value: 2, percentage: '17%' },
        { name: 'Academic', value: 2, percentage: '16%' }
    ];

    const upcomingEvents = [
        { id: 1, name: 'Tech Conference 2024', date: '2024-04-15', category: 'Tech', status: 'Registered', change: '+3.8%' },
        { id: 2, name: 'Coding Workshop', date: '2024-04-20', category: 'Tech', status: 'Registered', change: '+2.1%' },
        { id: 3, name: 'Career Fair', date: '2024-05-10', category: 'Career', status: 'Interested', change: '-1.2%' },
        { id: 4, name: 'Sports Tournament', date: '2024-05-15', category: 'Sports', status: 'Registered', change: '+5.4%' }
    ];

    return (
        <div className='p-8 space-y-8'>
            {/* Header Section */}
            <div className='flex justify-between items-start'>
                <div>
                    <h1 className='text-5xl font-bold text-white mb-2'>Welcome, {user?.u_name || 'Student'}</h1>
                    <p className='text-gray-400'>Here's your event portfolio overview</p>
                </div>
            </div>

            {/* Main Hero Card - Total Events */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
                {/* Primary Metric Card */}
                <div className='lg:col-span-2 bg-[#1a1f2e] border border-gray-700 rounded-lg p-8'>
                    <div className='flex justify-between items-start mb-8'>
                        <div>
                            <p className='text-gray-400 text-sm mb-2'>Total Events Registered</p>
                            <h2 className='text-5xl font-bold text-white'>12</h2>
                            <div className='flex items-center space-x-2 mt-4'>
                                <div className='flex items-center text-green-400 text-sm'>
                                    <FaArrowUp className='mr-1' /> +3 this month
                                </div>
                            </div>
                        </div>
                        <div className='text-right'>
                            <div className='inline-block bg-blue-500/20 p-4 rounded-lg'>
                                <FaCalendarAlt className='text-blue-500 text-2xl' />
                            </div>
                        </div>
                    </div>
                    {/* Mini chart */}
                    <ResponsiveContainer width="100%" height={60}>
                        <LineChart data={participationData.slice(-3)}>
                            <Line type="monotone" dataKey="registered" stroke="#3b82f6" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Quick Stats */}
                <div className='space-y-3'>
                    <div className='bg-[#1a1f2e] border border-gray-700 rounded-lg p-6'>
                        <p className='text-gray-400 text-xs mb-2'>COMPLETED EVENTS</p>
                        <h3 className='text-3xl font-bold text-white'>8</h3>
                        <p className='text-green-400 text-xs mt-2'>Attended all</p>
                    </div>
                    <div className='bg-[#1a1f2e] border border-gray-700 rounded-lg p-6'>
                        <p className='text-gray-400 text-xs mb-2'>CURRENT STREAK</p>
                        <h3 className='text-3xl font-bold text-white'>4</h3>
                        <p className='text-orange-400 text-xs mt-2'>Consecutive events</p>
                    </div>
                </div>
            </div>

            {/* Event Performance Chart */}
            <div className='bg-[#1a1f2e] border border-gray-700 rounded-lg p-6'>
                <div className='flex justify-between items-center mb-6'>
                    <h3 className='text-white font-semibold text-lg'>Event Participation Performance</h3>
                    <div className='flex gap-2'>
                        <button className='px-4 py-2 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/50'>1D</button>
                        <button className='px-4 py-2 text-gray-400 text-xs rounded-full border border-gray-700'>1W</button>
                        <button className='px-4 py-2 text-gray-400 text-xs rounded-full border border-gray-700'>1M</button>
                        <button className='px-4 py-2 text-gray-400 text-xs rounded-full border border-gray-700'>6M</button>
                        <button className='px-4 py-2 text-gray-400 text-xs rounded-full border border-gray-700'>1Y</button>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={participationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="month" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f1419', border: '1px solid #333', borderRadius: '8px' }}
                            labelStyle={{ color: '#fff' }}
                        />
                        <Line type="monotone" dataKey="events" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} name="Total Events" />
                        <Line type="monotone" dataKey="registered" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} name="Registered" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Two Column Section */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Events by Category */}
                <div className='bg-[#1a1f2e] border border-gray-700 rounded-lg p-6'>
                    <h3 className='text-white font-semibold text-lg mb-6'>Event Distribution</h3>
                    <div className='space-y-4'>
                        {eventsByCategory.map((cat, idx) => (
                            <div key={idx} className='flex items-center justify-between'>
                                <div className='flex items-center space-x-3'>
                                    <div className='w-3 h-3 rounded-full bg-blue-500'></div>
                                    <span className='text-gray-300'>{cat.name}</span>
                                </div>
                                <div className='flex items-center space-x-3'>
                                    <span className='text-white font-semibold'>{cat.value}</span>
                                    <span className='text-gray-400 text-sm'>{cat.percentage}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Stats Cards */}
                <div className='space-y-3'>
                    <div className='bg-[#1a1f2e] border border-gray-700 rounded-lg p-6'>
                        <div className='flex justify-between items-start'>
                            <div>
                                <p className='text-gray-400 text-xs mb-1'>TOTAL ATTENDEES MET</p>
                                <h4 className='text-2xl font-bold text-white'>490</h4>
                                <p className='text-green-400 text-xs mt-2'>+12 this week</p>
                            </div>
                            <FaUsers className='text-purple-500 text-xl' />
                        </div>
                    </div>
                    <div className='bg-[#1a1f2e] border border-gray-700 rounded-lg p-6'>
                        <div className='flex justify-between items-start'>
                            <div>
                                <p className='text-gray-400 text-xs mb-1'>UPCOMING EVENTS</p>
                                <h4 className='text-2xl font-bold text-white'>4</h4>
                                <p className='text-orange-400 text-xs mt-2'>Within 30 days</p>
                            </div>
                            <FaClock className='text-orange-500 text-xl' />
                        </div>
                    </div>
                </div>
            </div>

            {/* Events Overview Table */}
            <div className='bg-[#1a1f2e] border border-gray-700 rounded-lg p-6'>
                <h3 className='text-white font-semibold text-lg mb-6'>Event Overview</h3>
                <div className='overflow-x-auto'>
                    <table className='w-full'>
                        <thead>
                            <tr className='border-b border-gray-700'>
                                <th className='text-left py-3 px-4 text-gray-400 font-medium text-xs'>EVENT NAME</th>
                                <th className='text-left py-3 px-4 text-gray-400 font-medium text-xs'>DATE</th>
                                <th className='text-left py-3 px-4 text-gray-400 font-medium text-xs'>CATEGORY</th>
                                <th className='text-left py-3 px-4 text-gray-400 font-medium text-xs'>STATUS</th>
                                <th className='text-right py-3 px-4 text-gray-400 font-medium text-xs'>CHANGE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {upcomingEvents.map((event) => (
                                <tr key={event.id} className='border-b border-gray-700/50 hover:bg-[#252d3d]/50 transition'>
                                    <td className='py-4 px-4 text-white font-medium'>{event.name}</td>
                                    <td className='py-4 px-4 text-gray-400 text-sm'>{event.date}</td>
                                    <td className='py-4 px-4'>
                                        <span className='text-gray-300 text-sm'>{event.category}</span>
                                    </td>
                                    <td className='py-4 px-4'>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            event.status === 'Registered' 
                                                ? 'bg-green-500/20 text-green-400' 
                                                : 'bg-blue-500/20 text-blue-400'
                                        }`}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td className={`py-4 px-4 text-right font-semibold ${event.change.includes('+') ? 'text-green-400' : 'text-red-400'}`}>
                                        {event.change}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentSummary;