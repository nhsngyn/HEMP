 // DashboardLayout.jsx
import React from "react";
import Sidebar from "./Sidebar.jsx";

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex w-full h-screen bg-[#0F1116] text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

