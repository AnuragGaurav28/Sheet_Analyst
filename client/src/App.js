import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard"; 
import UploadExcel from "./pages/UploadExcel";
import AnalyzeData from "./pages/AnalyzeData"; 
import History from "./pages/History";
import AdminDashboard from "./pages/AdminDashboard";
import Settings from "./pages/Settings";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadExcel />} />
        <Route path="/analyze" element={<AnalyzeData />} />
         <Route path="/history" element={<History />} />
       <Route path="/admin" element={<AdminDashboard />} />
       <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;
