// frontend/src/shared-main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import SharedImage from "./pages/SharedImage";

// This is a completely separate app that ONLY handles shared images
// No redirects, no ProtectedRoute, no RootRedirect
const SharedApp = () => {
  console.log("=== SharedApp Rendered ===");

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Only the shared image route - nothing else */}
          <Route path="/shared/:token" element={<SharedImage />} />
          {/* If someone goes to the root of this app, show nothing */}
          <Route path="/" element={<div>Loading...</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SharedApp />
  </React.StrictMode>,
);
