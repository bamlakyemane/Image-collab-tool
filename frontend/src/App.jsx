// frontend/src/App.jsx

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Library from "./pages/Library";
import SharedImage from "./pages/SharedImage";
import ImageView from "./pages/ImageView";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

// Root redirect component
const RootRedirect = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? (
    <Navigate to="/library" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

function App() {
  console.log("App - Rendering routes");

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/shared/:token" element={<SharedImage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Test route - for debugging */}
          <Route
            path="/test"
            element={
              <div style={{ padding: "40px", textAlign: "center" }}>
                <h1>✅ Test Route Works!</h1>
                <p>If you see this, routing is working.</p>
                <a href="/library">Go to Library</a>
              </div>
            }
          />

          {/* Admin route - NO ProtectedRoute for testing */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Root route */}
          <Route path="/" element={<RootRedirect />} />

          {/* Protected routes */}
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <Library />
              </ProtectedRoute>
            }
          />
          <Route
            path="/image/:imageId"
            element={
              <ProtectedRoute>
                <ImageView />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
