import React, { useEffect, useRef, useState } from 'react';

const MainLayout = ({ leftSidebar, children }) => {
  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);

  // 16:9 비율 기준 (1920×1080)
  const CANVAS_WIDTH = 1920;
  const CANVAS_HEIGHT = 1080;
  const SIDEBAR_RATIO = 0.218; // 21.8%
  const CONTENT_RATIO = 0.782; // 78.2%

  useEffect(() => {
    const updateScale = () => {
      if (!wrapperRef.current) return;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // 사이드바 너비 계산 (고정 비율)
      const newSidebarWidth = viewportWidth * SIDEBAR_RATIO;
      const availableContentWidth = viewportWidth - newSidebarWidth;
      const availableContentHeight = viewportHeight;

      // 16:9 비율을 유지하면서 화면을 최대한 채우는 스케일 계산
      const targetContentWidth = CANVAS_WIDTH * CONTENT_RATIO;
      const targetContentHeight = CANVAS_HEIGHT;

      // 가로/세로 비율에 맞춰 스케일 계산 (더 작은 값 선택하여 비율 유지)
      const scaleX = availableContentWidth / targetContentWidth;
      const scaleY = availableContentHeight / targetContentHeight;
      const newScale = Math.min(scaleX, scaleY);

      // 실제 스케일된 크기
      const scaledContentWidth = targetContentWidth * newScale;
      const scaledContentHeight = targetContentHeight * newScale;

      // CSS 변수로 스케일 값 설정 (폰트 크기 등에 사용)
      document.documentElement.style.setProperty('--scale', newScale);
      document.documentElement.style.setProperty('--base-font-size', `${16 * newScale}px`);

      setScale(newScale);
      setSidebarWidth(newSidebarWidth);
      setContentWidth(availableContentWidth);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div className="w-screen h-screen bg-black flex overflow-hidden" ref={wrapperRef}>
      {/* 좌측 사이드바 - sticky */}
      <aside
        className="sticky top-0 border-r border-[#333] bg-[#0d0d0d] z-20 overflow-y-auto"
        style={{
          width: `${sidebarWidth}px`,
          height: '100vh',
          flexShrink: 0
        }}
      >
        {leftSidebar}
      </aside>

      {/* 우측 메인 콘텐츠 영역 - 16:9 캔버스 */}
      <div
        className="overflow-y-auto"
        style={{
          width: `${contentWidth}px`,
          height: '100vh',
          scrollSnapType: 'y mandatory',
          scrollBehavior: 'smooth'
        }}
      >
        <div
          style={{
            width: `${CANVAS_WIDTH * CONTENT_RATIO}px`,
            height: `${CANVAS_HEIGHT}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'relative'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
