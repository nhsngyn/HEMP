import React, { useEffect, useRef, useState } from 'react';

const MainLayout = ({ leftSidebar, children }) => {
  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);

  // 16:10 비율 기준 (1680×1050) - 가로 확장
  const CANVAS_WIDTH = 1680;
  const CANVAS_HEIGHT = 750;
  const SIDEBAR_RATIO = 0.18; // 20%
  const CONTENT_RATIO = 0.8; // 80%
  const minSidebarWidth = 240; // 최소 사이드바 너비

  useEffect(() => {
    const updateScale = () => {
      if (!wrapperRef.current) return;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // 사이드바 너비 계산 (최소 너비 보장)
      const calculatedSidebarWidth = viewportWidth * SIDEBAR_RATIO;
      const newSidebarWidth = Math.max(calculatedSidebarWidth, minSidebarWidth);
      const availableContentWidth = viewportWidth - newSidebarWidth;
      const availableContentHeight = viewportHeight;

      // 16:10 비율을 유지하면서 화면을 최대한 채우는 스케일 계산
      const targetContentWidth = CANVAS_WIDTH * CONTENT_RATIO;
      const targetContentHeight = CANVAS_HEIGHT;

      // 가로/세로 비율에 맞춰 스케일 계산 (더 작은 값 선택하여 비율 유지)
      const scaleX = availableContentWidth / targetContentWidth;
      const scaleY = availableContentHeight / targetContentHeight;
      let newScale = Math.min(scaleX, scaleY);

      // Retina 디스플레이 고려한 스케일 제한 (최소 0.5, 최대 1.2)
      const minScale = 0.5;
      const maxScale = 1.2;
      newScale = Math.max(minScale, Math.min(maxScale, newScale));

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
    <div className="w-screen h-screen bg-#101217 flex overflow-hidden" ref={wrapperRef}>
      {/* 좌측 사이드바 - sticky */}
      <aside
        className="sticky top-0 border-[#29303A] bg-[#ffffff06] z-20 overflow-y-auto"
        style={{
          width: `${sidebarWidth}px`,
          height: '100vh',
          flexShrink: 0
        }}
      >
        {leftSidebar}
      </aside>

      {/* 우측 메인 콘텐츠 영역 - 16:10 캔버스 */}
      <div
        id="main-scroll-container"
        className="overflow-y-auto overflow-x-hidden bg-[#101217]"
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
