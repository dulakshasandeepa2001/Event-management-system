import { Routes, Route } from "react-router-dom";
import ProtectedRoute from './utils/ProtectedRoute.jsx';

import Login from "./pages/common/Login.jsx";
//import Register from "./pages/common/Register.jsx";

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminSummary from './pages/admin/AdminSummary.jsx';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentSummary from './pages/student/StudentSummary.jsx';

function App() {
  return (

    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      { /* <Route path="/register" element={<Register />} /> */}

      <Route path="/admin-dashboard" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
      }>
        <Route index element={<AdminSummary/>}></Route>
      </Route>

      <Route path="/student-dashboard" element={
        <ProtectedRoute role="student">
          <StudentDashboard />
        </ProtectedRoute>
      }>
        <Route index element={<StudentSummary/>}></Route>
      </Route>

    </Routes>

  );
}

export default App;