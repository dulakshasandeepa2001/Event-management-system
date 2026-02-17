import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'

import { FaCheckCircle, FaFileAlt, FaMoneyBillWave, FaBuilding, FaDownload,
  FaHourglassHalf, FaTimesCircle, FaUsers, FaCalendarAlt, FaBell, FaUserTie } from 'react-icons/fa'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend as ReLegend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';

const AdminSummary = () => {

   return (
      <div>
         <div className='bg-black justify-between flex p-1 px-6'>
            <p className='my_font_family font-bold text-white'>Dashboard Overview</p>
            <div id='bt_section' className='relative'>
               <button className="p-1 bg-black text-orange-500 border-2 rounded-full"> <FaBell/> </button>
               <div className='absolute flex -top-1 -right-1 p-1 items-center justify-center text-white font-bold bg-red-600 h-5 rounded-full'>
                  <p className="text-xs">{0}</p>
               </div>
               <div id="bt_text_main" className="absolute my_font_family text-xs font-bold px-1 border-2 border-black bg-white z-50">
                  <p>Notifications</p>
               </div>
            </div>
         </div>
      </div>

   );
};

export default AdminSummary;