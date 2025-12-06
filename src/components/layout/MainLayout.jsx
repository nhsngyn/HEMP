import React from 'react';

const MainLayout = ({ leftPanel, children }) => {
  return (
    // 1. 전체 화면 고정 (h-screen, overflow-hidden)
    <div className="flex h-screen w-screen bg-hemp-bg text-white overflow-hidden">
      
      {/* 2. 좌측 사이드바 (너비 고정, 높이 100%) */}
      <aside className="w-[360px] h-full border-r border-hemp-gray bg-hemp-bg flex flex-col z-10 flex-shrink-0">
        <div className="h-full p-6 overflow-hidden">
           {leftPanel}
        </div>
      </aside>

      {/* 3. 우측 메인 컨텐츠 (남은 공간 채우기) */}
      <main className="flex-1 h-full min-w-0 flex flex-col relative">
        {/* 내부 스크롤 영역 */}
        <div className="flex-1 w-full h-full overflow-y-auto p-6">
          {/* ★ 여기가 핵심! children을 감싸는 div도 h-full이어야 함 */}
          <div className="w-full h-full max-w-[1800px] mx-auto">
             {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;