import { Outlet } from 'react-router-dom';
import LectureNavbar from './LectureNavbar.jsx';
import LectureSidebar from './LectureSidebar.jsx';

const LectureDashboard = () => {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100">
      <LectureSidebar />

      <div className="lg:pl-80">
        <LectureNavbar />

        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LectureDashboard;