import StudentSidebar from './StudentSidebar'
import StudentNavbar from './StudentNavbar'
import { Outlet } from 'react-router-dom'

const StudentDashboard = () => {

    return (
        <div>
           <StudentSidebar/>

           <div className='flex-1 bg-gray-100 ml-48 h-screen'>
                <StudentNavbar  />
                <Outlet/>
            </div>
        </div>
    );
};

export default StudentDashboard;