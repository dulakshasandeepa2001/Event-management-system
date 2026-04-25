import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProtectedRoute from './utils/ProtectedRoute.jsx';
import Login from "./pages/common/Login.jsx";
import Register from "./pages/common/Register.jsx";
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminSummary from './pages/admin/AdminSummary.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminEvents from './pages/admin/AdminEvents.jsx';

import LectureDashboard from './pages/lecture/LectureDashboard.jsx';
import LectureSummary from './pages/lecture/LectureSummary.jsx';

import StudentDashboard from './pages/student/StudentDashboard.jsx';
import StudentSummary from './pages/student/StudentSummary.jsx';
import StudentSubmissions from './pages/student/StudentSubmissions.jsx';
import StudentMentalHealth from './pages/student/StudentMentalHealth.jsx';
import StudentSettings from './pages/student/StudentSettings.jsx';

import BatchrepDashboard from './pages/batchrep/BatchrepDashboard.jsx';
import BatchrepSummary from './pages/batchrep/BatchrepSummary.jsx';
import BatchrepSubmissions from './pages/batchrep/BatchrepSubmissions.jsx';
import BatchrepStudents from './pages/batchrep/BatchrepStudents.jsx';
import BatchrepNotices from './pages/batchrep/BatchrepNotices.jsx';

import AddBatch from './pages/crud-batch/AddBatch.jsx';
import ViewBatch from './pages/crud-batch/ViewBatch.jsx';
import ListBatch from './pages/crud-batch/ListBatch.jsx';
import AddEvent from './pages/crud-event/AddEvent.jsx';
import EditEvent from './pages/crud-event/EditEvent.jsx';
import ListEvent from './pages/crud-event/ListEvent.jsx';
import ViewEvent from './pages/crud-event/ViewEvent.jsx';
import ListEventStu from "./pages/crud-event/ListEventStu.jsx";
import ViewEventStu from "./pages/crud-event/ViewEventStu.jsx";
import ViewComments from "./pages/crud-event/ViewComments";

import AddMarks from './pages/crud-marks/AddMarks.jsx';
import EditMarks from './pages/crud-marks/EditMarks.jsx';
import ListMarks from './pages/crud-marks/ListMarks.jsx';
import ListMarksStu from './pages/crud-marks/ListMarksStu.jsx';
import ViewMarksStu from './pages/crud-marks/ViewMarksStu.jsx';

import AIChatWidget from './components/AIChatWidget.jsx';


function App() {
  return (
    <>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register  />} />


            <Route path="/admin-dashboard" element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }>
                <Route index element={<AdminSummary />} />
                <Route path="/admin-dashboard/events" element={<AdminEvents />} />
                <Route path="/admin-dashboard/users" element={<AdminUsers />} />
                <Route path="/admin-dashboard/add-batch" element={<AddBatch />} />
                <Route path="/admin-dashboard/view-batch/:id" element={<ViewBatch />} />
                <Route path="/admin-dashboard/list-batch" element={<ListBatch />} />
            </Route>

            <Route path="/lecture-dashboard" element={
              <ProtectedRoute role="lecturer">
                <LectureDashboard />
              </ProtectedRoute>
            }>
              <Route index element={<LectureSummary />} />
            </Route>



            <Route path="/batchrep-dashboard" element={
              <ProtectedRoute role="batchrep">
                <BatchrepDashboard />
              </ProtectedRoute>
            }>
              <Route index element={<BatchrepSummary />} />
              <Route path="/batchrep-dashboard/submissions" element={<BatchrepSubmissions />} />
              <Route path="/batchrep-dashboard/students" element={<BatchrepStudents />} />
              <Route path="/batchrep-dashboard/notices" element={<BatchrepNotices />} />
              <Route path="/batchrep-dashboard/add-event" element={<AddEvent />} />
              <Route path="/batchrep-dashboard/edit-event/:id" element={<EditEvent />} />
              <Route path="/batchrep-dashboard/list-event" element={<ListEvent />} />
              <Route path="/batchrep-dashboard/view-event/:id" element={<ViewEvent />} />
              <Route path="/batchrep-dashboard/event/:id/comments" element={<ViewComments />}
/>

              <Route path="/batchrep-dashboard/add-marks" element={<AddMarks />} />
              <Route path="/batchrep-dashboard/edit-marks/:id" element={<EditMarks />} />
              <Route path="/batchrep-dashboard/list-marks" element={<ListMarks />} />
            </Route>



            <Route path="/student-dashboard" element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }>
              <Route index element={<StudentSummary />} />
              <Route path="/student-dashboard/submissions" element={<StudentSubmissions />} />
              <Route path="/student-dashboard/mental-health" element={<StudentMentalHealth />} />
              <Route path="/student-dashboard/settings" element={<StudentSettings />} />
              <Route path="/student-dashboard/list-event" element={<ListEventStu />} />
              <Route path="/student-dashboard/view-event/:id" element={<ViewEventStu />} />

              <Route path="/student-dashboard/list-marks" element={<ListMarksStu />} />
              <Route path="/student-dashboard/view-marks/:id" element={<ViewMarksStu />} />
            </Route>      
        </Routes>



        {/* Toast container for all toast messages */}
        <ToastContainer position="top-center" autoClose={3000}
          hideProgressBar={false} closeOnClick  pauseOnHover draggable
          toastStyle={ {width:'auto', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'allipsis'} }
        />

        <AIChatWidget />
    </>
  );
}

export default App;