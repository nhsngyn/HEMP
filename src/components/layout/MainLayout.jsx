// src/components/layout/MainLayout.jsx
// 앱 전체 기본 프레임

import DashboardLayout from "./DashboardLayout";

const MainLayout = ({ children }) => {
  return (
    <div className="w-full min-h-screen bg-[#101217] text-white">
      {/* DashboardPage는 children으로 전달되거나, 라우팅을 통해 전달. */}
      <DashboardLayout> 
        {children}
      </DashboardLayout>
    </div>
  );
};

export default MainLayout;