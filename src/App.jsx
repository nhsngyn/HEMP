import React from 'react';
import MainLayout from './components/layout/MainLayout';
import RankingChart from './components/ranking/RankingChart';
import HempMap from './components/charts/HempMap';

function App() {
  return (
    <MainLayout
      leftPanel={<RankingChart />} 
    >
      {/* 전체 컨테이너: 세로 방향 (flex-col), 높이 100% (h-full) */}
      <div className="flex flex-col gap-6 w-full h-full">
        
        {/* 1. 상단 HEMP Map 영역 (화면의 60% 차지) */}
        {/* min-h-[400px]: 화면이 작아져도 최소 400px은 확보해라! */}
        <div className="flex-[1.5] w-full min-h-[400px] bg-[#1A1B20] rounded-lg relative overflow-hidden">
          {/* 차트 컴포넌트 */}
          <div className="absolute inset-0 w-full h-full">
             <HempMap />
          </div>
        </div>
        
        {/* 2. 하단 차트 영역 (나머지 공간 차지) */}
        {/* min-h-[250px]: 최소 높이 확보 */}
        <div className="flex-1 w-full min-h-[250px] flex gap-6">
           
           {/* 준혁님 레이더 차트 자리 */}
           <div className="flex-1 border border-dashed border-gray-600 rounded-lg flex items-center justify-center bg-[#1A1B20]/50 text-gray-400">
              Radar Chart
           </div>
           
           {/* 준혁님 생키 차트 자리 */}
           <div className="flex-1 border border-dashed border-gray-600 rounded-lg flex items-center justify-center bg-[#1A1B20]/50 text-gray-400">
              Sankey Chart
           </div>
        </div>

      </div>
    </MainLayout>
  );
}

export default App;