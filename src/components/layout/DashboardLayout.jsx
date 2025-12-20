import React from "react";
import Sidebar from "./Sidebar"; 

// DashboardLayout은 이제 앱의 메인 컨테이너 역할을 합니다.
const DashboardLayout = ({ children }) => {
  return (
    <div className="w-full min-h-screen flex text-white">
      <Sidebar /> 
      {/* 오른쪽 콘텐츠 영역 (반응형) */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;