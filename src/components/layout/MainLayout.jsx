import React from 'react';

const MainLayout = ({ leftSidebar, children }) => {
  return (
    <div className="flex w-full min-h-screen bg-black overflow-x-hidden">
      
      {/* 1. 왼쪽 사이드바 영역 */}
      <aside 
        className="
          w-[260px] 
          h-screen 
          sticky top-0 
          flex-shrink-0 
          z-50
        "
        style={{
          background: 'var(--bg-2, rgba(255, 255, 255, 0.08))',
        }}
      >
        {leftSidebar}
      </aside>

      <main className="flex-1 min-w-0"style={{
          background: 'background: var(--gray900, #101217)',
        }}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;