import React from "react";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ children }) => {
  return (
    <div className="w-full h-screen flex bg-[#0D0D0F] text-white">
      
      {/* 왼쪽 사이드바 (고정형 + sticky) */}
      <Sidebar />

      {/* 오른쪽 콘텐츠 영역 (반응형) */}
      <main className="flex-1 h-screen overflow-y-auto p-8">
        {children}
      </main>

    </div>
  );
};

export default DashboardLayout;
