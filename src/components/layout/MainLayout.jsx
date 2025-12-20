import React from 'react';

const MainLayout = ({ leftSidebar, children }) => {
  // 피그마 디자인처럼 전체 화면을 채우는 레이아웃으로 변경
  return (
    <div className="flex w-full min-h-screen bg-black overflow-x-hidden">
      
      {/* 1. 왼쪽 사이드바 패널 */}
      <aside
        className="
          w-[260px]        /* 너비 고정 */
          h-screen         /* 높이 전체 */
          sticky top-0     /* 스크롤 시 상단 고정 */
          bg-[#111418]     /* 피그마 배경색 */
          overflow-y-auto  /* 내용 많을 시 스크롤 */
          flex-shrink-0    /* 너비 줄어들지 않음 */
          z-50             /* 다른 요소 위에 표시 */
        "
      >
        {leftSidebar}
      </aside>

      {/* 2. 오른쪽 메인 콘텐츠 패널 */}
      <main 
        className="
          flex-1           /* 남은 영역 모두 차지 */
          min-w-0          /* flex 자식 요소 오버플로우 방지 */
          bg-black         /* 배경색 */

        "
      >
        {children}
      </main>

    </div>
  );
};

export default MainLayout;