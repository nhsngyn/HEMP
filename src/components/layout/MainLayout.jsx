import React from 'react';

const MainLayout = ({ leftSidebar, children }) => {
  return (
    <div className="flex w-full min-h-screen bg-black overflow-x-hidden">
      
      {/* 1. 왼쪽 사이드바 영역 (고정) */}
      <aside 
        className="
          w-[260px] 
          h-screen 
          sticky top-0 
          flex-shrink-0 
          z-50
          bg-[#111418]
        "
      >
        {/* 여기에 Sidebar 컴포넌트가 들어옵니다 */}
        {leftSidebar}
      </aside>

      {/* 2. 오른쪽 콘텐츠 영역 (유동적) */}
      <main className="flex-1 min-w-0 bg-black">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;