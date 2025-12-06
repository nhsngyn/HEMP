import React from 'react';

const MainLayout = ({ leftSidebar, children }) => {
  return (
    // 전체 컨테이너: flex, 높이 고정(1004px), 검은 배경
    <div className="flex w-full h-[1004px] bg-black overflow-hidden relative">
      
      {/* 왼쪽: 랭킹 차트 (362px 고정) */}
      <aside className="w-[362px] h-full shrink-0 border-r border-gray-700 bg-gray-900 overflow-y-auto z-20">
        {/* leftSidebar가 없으면 에러 방지를 위해 null 처리 */}
        {leftSidebar || <div className="text-white p-4">랭킹 차트 없음</div>}
      </aside>

      {/* 오른쪽: 버블 차트 (나머지 채움) */}
      <main className="flex-1 h-full relative z-10 bg-black">
        {children || <div className="text-white p-4">메인 차트 없음</div>}
      </main>

    </div>
  );
};

export default MainLayout;