import React from 'react';

const MainLayout = ({ leftSidebar, children }) => {
  return (
    <div 
      className="flex w-full min-h-screen overflow-x-hidden"
      // 전체 페이지 배경: #101217 (유지)
      style={{ backgroundColor: '#101217' }} 
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
        style={{
          // ✨ 사이드바 배경색을 카드와 동일한 #15171C로 변경
          background: '#15171C', 
          borderRight: '1px solid rgba(255, 255, 255, 0.05)'
        }}
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