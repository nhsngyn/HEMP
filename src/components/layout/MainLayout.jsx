import React from 'react';

const MainLayout = ({ leftSidebar, children }) => {
  // 1920x1080 비율 유지 (16:9)
  // 사이드바 너비: 고정 260px
  // 오른쪽 콘텐츠: 나머지 영역 (1fr)
  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center overflow-auto">
      <div
        className="grid bg-black overflow-hidden p-[60px]"
        style={{
          // ✨ 수정됨: 왼쪽 컬럼을 260px로 고정
          gridTemplateColumns: '260px 1fr', 
          width: '1920px',
          height: '1080px',
          maxWidth: '100vw',
          maxHeight: '100vh',
          aspectRatio: '16/9'
        }}
      >

        {/* 1. 왼쪽 패널 (사이드바) */}
        {/* ✨ 수정됨: 높이 제한(max-h-[900px]) 및 수직 중앙 정렬(self-center) 추가 */}
        <aside 
          className="
            relative w-full h-full 
            max-h-[900px] 
            self-center 
            border-r border-[#333] bg-[#0d0d0d] 
            z-20 overflow-y-auto
            rounded-2xl
          "
        >
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