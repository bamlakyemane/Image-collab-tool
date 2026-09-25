// frontend/src/App.jsx

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Library from "./pages/Library";
import SharedImage from "./pages/SharedImage";
import ImageView from "./pages/ImageView";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import "./styles/toast.css";

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
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Public routes */}
          <Route path="/shared/:token" element={<SharedImage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
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
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
