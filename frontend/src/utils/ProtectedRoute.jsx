import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ children, role, allowBatchRep = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (role) {
    // admin route, allow batch rep if requested
    if (role === "admin") {
      if (user.u_role !== "admin") {
        if (!(allowBatchRep && user.isBatchRep)) {
          return <Navigate to="/login" replace />;
        }
      }
    } else if (user.u_role !== role) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
