import React from 'react';

const MainLayout = ({ leftSidebar, children }) => {
  return (
    <div 
      className="flex w-full min-h-screen overflow-x-hidden"
    
    >
      
      {/* 1. 왼쪽 사이드바 영역 */}
      <aside 
        className="
          w-[260px] 
          h-screen 
          sticky top-0 
          flex-shrink-0 
          z-50
        "

      >
        {leftSidebar}
      </aside>

      {/* 2. 메인 콘텐츠 영역 */}
      <main 
        className="flex-1 min-w-0"
        style={{ backgroundColor: 'transparent' }} 
      >
        {children}
      </main>
    </div>
  );
};

export default MainLayout;