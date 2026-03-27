import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProtectedRoute from './utils/ProtectedRoute.jsx';
import Login from "./pages/common/Login.jsx";
import Register from "./pages/common/Register.jsx";
import Events from "./pages/common/Events.jsx";


import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminSummary from './pages/admin/AdminSummary.jsx';

import StudentDashboard from './pages/student/StudentDashboard.jsx';
import StudentSummary from './pages/student/StudentSummary.jsx';
import StudentSubmissions from './pages/student/StudentSubmissions.jsx';
import StudentExamResults from './pages/student/StudentExamResults.jsx';
import StudentMentalHealth from './pages/student/StudentMentalHealth.jsx';

import BatchrepDashboard from './pages/batchrep/BatchrepDashboard.jsx';
import BatchrepSummary from './pages/batchrep/BatchrepSummary.jsx';
import BatchrepSubmissions from './pages/batchrep/BatchrepSubmissions.jsx';
import BatchrepEvents from './pages/batchrep/BatchrepEvents.jsx';
import BatchrepStudents from './pages/batchrep/BatchrepStudents.jsx';
import BatchrepNotices from './pages/batchrep/BatchrepNotices.jsx';

import AddBatch from './pages/crud-batch/AddBatch.jsx';
import ViewBatch from './pages/crud-batch/ViewBatch.jsx';
import ListBatch from './pages/crud-batch/ListBatch.jsx';
import AIChatWidget from './components/AIChatWidget.jsx';

function App() {
  return (
    <>
<Routes>
  <Route path="/" element={<Login />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register  />} />
  <Route path="/events" element={<Events />} />

  <Route path="/admin-dashboard" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }>
          <Route index element={<AdminSummary />} />
          <Route path="events" element={<Events />} />
          <Route path="/admin-dashboard/add-batch" element={<AddBatch />} />
          <Route path="/admin-dashboard/view-batch/:id" element={<ViewBatch />} />
          <Route path="/admin-dashboard/list-batch" element={<ListBatch />} />
        </Route>

        <Route path="/batchrep-dashboard" element={
          <ProtectedRoute role="batchrep">
            <BatchrepDashboard />
          </ProtectedRoute>
        }>
          <Route index element={<BatchrepSummary />} />
          <Route path="events" element={<BatchrepEvents />} />
          <Route path="students" element={<BatchrepStudents />} />
          <Route path="submissions" element={<BatchrepSubmissions />} />
          <Route path="notices" element={<BatchrepNotices />} />
        </Route>

        <Route path="/student-dashboard" element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        }>
          <Route index element={<StudentSummary />} />
          <Route path="submissions" element={<StudentSubmissions />} />
          <Route path="exam-results" element={<StudentExamResults />} />
          <Route path="mental-health" element={<StudentMentalHealth />} />
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