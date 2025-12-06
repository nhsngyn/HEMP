import React from 'react';

const MainLayout = ({ leftPanel, children }) => {
  return (
    <div className="flex h-screen w-full bg-hemp-bg text-white overflow-hidden">
      {/* 좌측 패널 (Ranking & Selection) - 고정 너비 (360px) */}
      <aside className="w-[360px] h-full border-r border-hemp-gray p-6 flex flex-col z-10 bg-hemp-bg">
        {leftPanel}
      </aside>

      {/* 우측 메인 컨텐츠 (Charts) - 남은 공간 다 차지 */}
      <main className="flex-1 h-full p-8 overflow-y-auto relative">
        <div className="max-w-[1600px] mx-auto h-full flex flex-col gap-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;