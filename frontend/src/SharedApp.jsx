// frontend/src/SharedApp.jsx

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SharedImage from "./pages/SharedImage";

// This is a separate app just for shared images
// It doesn't have any redirects or auth protection
const SharedApp = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/shared/:token" element={<SharedImage />} />
        {/* Also handle the root for this app */}
        <Route path="*" element={<SharedImage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default SharedApp;
