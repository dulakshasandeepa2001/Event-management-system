import AdminSidebar from './AdminSidebar'
import AdminNavbar from './AdminNavbar'
import { Outlet } from 'react-router-dom'

const AdminDashboard = () => {

    return (
        <div>
           <AdminSidebar/>

           <div className='flex-1 bg-gray-100 ml-48 h-screen'>
                <AdminNavbar  />
                <Outlet/>
            </div>
        </div>
    );
};

export default AdminDashboard;