import React, { useEffect, useRef, useState } from "react";
import { COLORS } from "../../constants/colors";

const MainLayout = ({ leftSidebar, children }) => {
  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(1);

  const CANVAS_WIDTH = 1680;
  const CANVAS_HEIGHT = 750;
  const CONTENT_RATIO = 0.8;
  const SIDEBAR_WIDTH = 260;

  useEffect(() => {
    const updateScale = () => {
      if (!wrapperRef.current) return;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const availableContentWidth = viewportWidth - SIDEBAR_WIDTH;
      const targetContentWidth = CANVAS_WIDTH * CONTENT_RATIO;
      const targetContentHeight = CANVAS_HEIGHT;

      const scaleX = availableContentWidth / targetContentWidth;
      const scaleY = viewportHeight / targetContentHeight;
      let newScale = Math.min(scaleX, scaleY);

      newScale = Math.max(0.5, Math.min(1.2, newScale));

      document.documentElement.style.setProperty("--scale", newScale);
      document.documentElement.style.setProperty("--base-font-size", `${16 * newScale}px`);

      setScale(newScale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="w-screen h-screen flex overflow-hidden"
      style={{ backgroundColor: '#101010' }}
    >
      <aside
        className="sticky top-0 z-30 flex-shrink-0 overflow-y-auto"
        style={{ 
          width: `${SIDEBAR_WIDTH}px`, 
          height: '100vh',
          backgroundColor: COLORS.GRAYBG 
        }}
      >
        {leftSidebar}
      </aside>

      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <div
          id="main-scroll-container"
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{
            scrollBehavior: "smooth",
            backgroundColor: '#101010',
            width: '100%',
          }}
        >
          <div className="min-h-full w-full" style={{ backgroundColor: '#101010' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
