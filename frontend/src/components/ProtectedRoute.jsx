// frontend/src/components/ProtectedRoute.jsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  //console.log("ProtectedRoute - isAuthenticated:", isAuthenticated);
  //console.log("ProtectedRoute - loading:", loading);

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (!isAuthenticated) {
    //console.log("ProtectedRoute - Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // console.log("ProtectedRoute - Authenticated, rendering children");
  return children;
};

const styles = {
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    fontSize: "18px",
    color: "#666",
  },
};

export default ProtectedRoute;
