import React from 'react'
import { FaFileUpload, FaTachometerAlt, FaCog, FaGraduationCap, FaHeart } from 'react-icons/fa'
import { NavLink } from 'react-router-dom'  

const StudentSidebar = () => {
   return (
      <div className="fixed text-white bg-[#0f1419] border-r border-gray-700 flex flex-col h-screen w-48 my_font_family">
         {/* Top Section */}
         <div className='flex-1'>
            {/* Sidebar Logo */}
            <div className='flex items-center justify-center h-16 border-b border-gray-700'>
               <h3 className="flex items-center justify-center text-lg font-bold text-white my_font_family space-x-1">
                  <span className="text-blue-500">Event</span>
                  <span className="text-white">Hub</span>
               </h3> 
            </div>

            {/* Navigation Links */}
            <div className="p-4 space-y-2">                                             
               <NavLink to="/student-dashboard" className={({isActive})=>`${isActive ? "bg-blue-500/20 border-blue-500":"border-gray-700"} 
                     flex items-center space-x-3 px-4 py-2 rounded border hover:border-blue-500 transition`} end>   
                  <FaTachometerAlt/> <span>Dashboard</span>
               </NavLink>
               
               <NavLink to="/student-dashboard/list-event" className={({isActive})=>`${isActive ? "bg-blue-500/20 border-blue-500":"border-gray-700"} 
                  flex items-center space-x-3 px-4 py-2 rounded border hover:border-blue-500 transition`} end>   
                  <FaTachometerAlt/> <span>Events</span>
               </NavLink>

               <NavLink to="/student-dashboard/list-marks" className={({isActive})=>`${isActive ? "bg-blue-500/20 border-blue-500":"border-gray-700"} 
                  flex items-center space-x-3 px-4 py-2 rounded border hover:border-blue-500 transition`} end>   
                  <FaGraduationCap/> <span>Exam Results</span>
               </NavLink>

               <NavLink to="/student-dashboard/submissions" className={({isActive})=>`${isActive ? "bg-blue-500/20 border-blue-500":"border-gray-700"} 
                     flex items-center space-x-3 px-4 py-2 rounded border hover:border-blue-500 transition`}>   
                  <FaFileUpload/> <span>Submissions</span>
               </NavLink>

               <NavLink to="/student-dashboard/mental-health" className={({isActive})=>`${isActive ? "bg-blue-500/20 border-blue-500":"border-gray-700"} 
                     flex items-center space-x-3 px-4 py-2 rounded border hover:border-blue-500 transition`}>   
                  <FaHeart/> <span>Mental Health</span>
               </NavLink>
            </div>
         </div>

         {/* Bottom Links */}
         <div className="border-t border-gray-700">
            <div className="p-4 space-y-2">                                             
               <button
                  type="button"
                  className="w-full border-gray-700 flex items-center space-x-3 px-4 py-2 rounded border hover:border-blue-500 transition"
               >
                  <FaCog/> <span>Settings</span>
               </button>
            </div>
         </div>
      </div>
  )
}

export default StudentSidebar;