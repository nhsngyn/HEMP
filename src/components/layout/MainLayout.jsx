import React from 'react';

const MainLayout = ({ leftSidebar, children }) => {
  return (
   <div className="grid grid-cols-[362px_1fr] w-screen h-screen bg-black overflow-hidden p-[60px]">
      
      {/* 1. 왼쪽 패널 */}
      <aside className="relative w-full h-full border-r border-[#333] bg-[#0d0d0d] z-20 overflow-y-auto">
        {leftSidebar}
      </aside>

      {/* 2. 오른쪽 패널 */}
      <main className="relative w-full h-full min-w-0 z-10 bg-black">
        {children}
      </main>

    </div>
  );
};

export default MainLayout;