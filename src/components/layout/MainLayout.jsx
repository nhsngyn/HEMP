import React from 'react';

const MainLayout = ({ leftSidebar, children }) => {
  // Rank : Bubble : Radar = 39 : 76 : 64
  // Total = 179
  // Rank = 39/179 ≈ 21.8%, Main area = 140/179 ≈ 78.2%
  // 반응형 레이아웃: 1024px ~ 1920px
  // 기준 폭: 1440px
  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center overflow-hidden">
      <div
        className="grid bg-black overflow-hidden"
        style={{
          gridTemplateColumns: '21.8% 78.2%',
          width: 'clamp(1024px, 100vw, 1920px)',
          height: '100vh',
          padding: 'clamp(30px, 4.17vw, 60px)',
          maxHeight: '100vh',
          boxSizing: 'border-box'
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
