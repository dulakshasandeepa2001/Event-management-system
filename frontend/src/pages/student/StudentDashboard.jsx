import StudentSidebar from './StudentSidebar';
import StudentNavbar from './StudentNavbar';
import { Outlet } from 'react-router-dom';

const StudentDashboard = () => {
  return (
    <div className="min-h-screen bg-[#050b18] text-slate-100 my_font_family">
      <StudentSidebar />

      <div className="lg:pl-72">
        <StudentNavbar />
        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;