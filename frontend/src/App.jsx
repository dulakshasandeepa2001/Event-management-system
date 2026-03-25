import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProtectedRoute from './utils/ProtectedRoute.jsx';
import Login from "./pages/common/Login.jsx";
import Register from "./pages/common/Register.jsx";

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminSummary from './pages/admin/AdminSummary.jsx';

import StudentDashboard from './pages/student/StudentDashboard.jsx';
import StudentSummary from './pages/student/StudentSummary.jsx';

import BatchrepDashboard from './pages/batchrep/BatchrepDashboard.jsx';
import BatchrepSummary from './pages/batchrep/BatchrepSummary.jsx';

import AddBatch from './pages/crud-batch/AddBatch.jsx';
import ViewBatch from './pages/crud-batch/ViewBatch.jsx';
import ListBatch from './pages/crud-batch/ListBatch.jsx';

import AddEvent from './pages/crud-event/AddEvent.jsx';
import EditEvent from './pages/crud-event/EditEvent.jsx';
import ListEvent from './pages/crud-event/ListEvent.jsx';
import ListEventStu from "./pages/crud-event/ListEventStu.jsx";
import ViewEventStu from "./pages/crud-event/ViewEventStu.jsx";

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
              <Route path="/batchrep-dashboard/add-event" element={<AddEvent />} />
              <Route path="/batchrep-dashboard/edit-event/:id" element={<EditEvent />} />
              <Route path="/batchrep-dashboard/list-event" element={<ListEvent />} />
            </Route>



            <Route path="/student-dashboard" element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }>
              <Route index element={<StudentSummary />} />
              <Route path="/student-dashboard/list-event" element={<ListEventStu />} />
              <Route path="/student-dashboard/view-event/:id" element={<ViewEventStu />} />
            </Route>      
        </Routes>



        {/* Toast container for all toast messages */}
        <ToastContainer position="top-center" autoClose={3000}
          hideProgressBar={false} closeOnClick  pauseOnHover draggable
          toastStyle={ {width:'auto', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'allipsis'} }
        />
    </>
  );
}

export default App;