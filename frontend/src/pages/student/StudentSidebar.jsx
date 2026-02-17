import React from 'react'
import { FaBuilding, FaCalendarAlt, FaTachometerAlt,FaMoneyBillWave,FaUsers, FaCog, FaQuestion, } from 'react-icons/fa'
import { NavLink } from 'react-router-dom'  
import { useNavigate } from 'react-router-dom';

const StudentSidebar = () => {

   const navigate = useNavigate();

   return (
      <div className="fixed text-white bg-black flex h-screen w-48 my_font_family">
      <div className='flex flex-col h-auto justify-between'>

         <div>
            {/* Sidebar image & top links */}
            <div id="sidebar_head" className='flex items-center justify-center'>
               <h3 className="flex items-center justify-center text-l text-center text-white my_font_family bg-gray-900 rounded py-1 space-x-1 w-20">
                  <span>Uni</span>
                  <span className="bg-white text-black rounded px-1">Hub</span>
               </h3> 
            </div>
            <div className="p-4">                                             
               <NavLink to="/admin-dashboard" className={({isActive})=>`${isActive ? "bg-gray-800":" "}
                     flex items-center space-x-4 px-4 rounded border border-black hover:border-gray-300`} end>   
                  <FaTachometerAlt/> <span>Dashboard </span>
               </NavLink>
               <NavLink className={({isActive})=>`${isActive ? "bg-gray-800":" "} 
                     flex items-center space-x-4 px-4 rounded border border-black hover:border-gray-300`}>
                  <FaUsers/> <span>Link1</span>
               </NavLink>
               <NavLink className={({isActive})=>`${isActive ? "bg-gray-800":" "}
                     flex items-center space-x-4 px-4 rounded border border-black hover:border-gray-300`}> 
                  <FaBuilding/> < span>Link2</span>
               </NavLink>
               <NavLink className={({isActive})=>`${isActive ? "bg-gray-800":" "}
                     flex items-center space-x-4 px-4 rounded border border-black hover:border-gray-300`}>
                     <FaCalendarAlt/> <span>Link3</span>
               </NavLink>
               <NavLink className={({isActive})=>`${isActive ? "bg-gray-800":" "}
                     flex items-center space-x-4 px-4 rounded border border-black hover:border-gray-300`}>
                     <FaMoneyBillWave/> <span>Link4</span>
               </NavLink>
            </div>
         </div>
         {/* Sidebar bottom links */}
         <div>
            <div className="p-4">                                             
               <NavLink   className={({isActive})=>`${isActive ? "bg-gray-800":" "}
                  flex items-center space-x-4 px-4 rounded border border-black hover:border-gray-300`} end>   
                  <FaCog/> <span>Settings </span>
               </NavLink>
               <NavLink className={({isActive})=>`${isActive ? "bg-gray-800":" "}
                  flex items-center space-x-4 px-4 rounded border border-black hover:border-gray-300`}>
                  <FaQuestion/> <span>Help</span>
               </NavLink>
            </div>
         </div>

      </div>
    </div>
  )
}

export default StudentSidebar;