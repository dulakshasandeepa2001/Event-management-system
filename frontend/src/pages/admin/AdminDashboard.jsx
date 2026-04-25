import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import { Outlet } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-[#050b18] text-slate-100 my_font_family">
      <AdminSidebar />

      <div className="lg:pl-72">
        <AdminNavbar />
        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;