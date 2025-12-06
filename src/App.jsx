import React from 'react';
import MainLayout from './components/layout/MainLayout';
import RankingChart from './components/ranking/RankingChart';
import HempMap from './components/charts/HempMap';

function App() {
  return (
    // ⚠️ 주의: MainLayout 바깥에 <div className="p-10"> 같은 게 있으면 레이아웃이 망가집니다.
    // MainLayout이 최상위 태그가 되도록 해주세요.
    <MainLayout leftSidebar={<RankingChart />}>
      
      {/* 오른쪽 메인 영역 내용 */}
      <div className="flex flex-col w-full h-full p-6 gap-6">
        
        {/* 상단 버블 차트 */}
        <div className="flex-[1.5] w-full bg-[#1A1B20] rounded-lg relative overflow-hidden border border-gray-800">
           <div className="absolute inset-0 w-full h-full">
              <HempMap />
           </div>
        </div>
        
        {/* 하단 차트들 */}
        <div className="flex-1 flex gap-6 min-h-[250px]">
           <div className="flex-1 border border-dashed border-gray-700 rounded-lg"></div>
           <div className="flex-1 border border-dashed border-gray-700 rounded-lg"></div>
        </div>

      </div>
    </MainLayout>
  );
}

export default App;