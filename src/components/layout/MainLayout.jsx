import React from 'react';

const MainLayout = ({ leftSidebar, children }) => {
  return (
    <div className="flex w-full min-h-screen bg-black overflow-x-hidden">
      
      {/* 1. 왼쪽 사이드바 영역 (사용자 코드 기준) */}
      <aside 
        className="
          w-[260px] 
          h-screen 
          sticky top-0 
          flex-shrink-0 
          z-50
        "
        style={{
          // 요청하셨던 투명 배경 스타일 유지
          background: 'var(--bg-2, rgba(255, 255, 255, 0.08))',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)', // (옵션) 경계선
          backdropFilter: 'blur(10px)' // (옵션) 블러 효과
        }}
      >
        {leftSidebar}
      </aside>

      {/* 2. 메인 콘텐츠 영역 (사용자 코드 기준) */}
      <main 
        className="flex-1 min-w-0"
        style={{
          background: 'var(--gray900, #101217)',
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default MainLayout;