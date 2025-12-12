import React from 'react';

const MainLayout = ({ leftSidebar, children }) => {
  // Rank : Bubble : Radar = 39 : 76 : 64
  // Total = 179
  // Rank = 39/179 ≈ 21.8%, Main area = 140/179 ≈ 78.2%
  // 1920x1080 비율 유지 (16:9)
  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center overflow-auto">
      <div
        className="grid bg-black overflow-hidden p-[60px]"
        style={{
          gridTemplateColumns: '21.8% 78.2%',
          width: '1920px',
          height: '1080px',
          maxWidth: '100vw',
          maxHeight: '100vh',
          aspectRatio: '16/9'
        }}
      >

        {/* 1. 왼쪽 패널 */}
        <aside className="relative w-full h-full border-r border-[#333] bg-[#0d0d0d] z-20 overflow-y-auto">
          {leftSidebar}
        </aside>

        {/* 2. 오른쪽 패널 */}
        <main className="relative w-full h-full min-w-0 z-10 bg-black">
          {children}
        </main>

      </div>
    </div>
  );
};

export default MainLayout;
