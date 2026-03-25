import AdminSidebar from './AdminSidebar'
import AdminNavbar from './AdminNavbar'
import { Outlet } from 'react-router-dom'

const AdminDashboard = () => {

    return (
        <div className='flex bg-[#0f1419] min-h-screen'>
           <AdminSidebar/>

           <div className='flex-1 flex flex-col ml-48'>
                <AdminNavbar />
                <div className='flex-1 overflow-y-auto'>
                    <Outlet/>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;