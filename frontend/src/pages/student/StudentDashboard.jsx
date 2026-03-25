import StudentSidebar from './StudentSidebar'
import StudentNavbar from './StudentNavbar'
import { Outlet } from 'react-router-dom'

const StudentDashboard = () => {

    return (
        <div className="flex h-screen bg-[#0f1419]">
            <StudentSidebar />

            <div className='flex-1 flex flex-col bg-[#0f1419] ml-48'>
                <StudentNavbar />
                
                {/* Main scrollable content */}
                <div className='flex-1 overflow-y-auto bg-[#0f1419]'>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;