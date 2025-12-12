import React, { useMemo } from 'react';
import MainLayout from './components/layout/MainLayout';
import RankingChart from './components/ranking/RankingChart';
import HempMap from './components/charts/HempMap';
import SankeyChart from './components/charts/SankeyChart';
import RadarChart from './components/charts/RadarChart';
import useChainStore from './store/useChainStore';

function App() {
  const { allChains, selectedMainId } = useChainStore();

  // 메인 체인 데이터
  const mainChain = useMemo(() => {
    return allChains.find(c => c.id === selectedMainId);
  }, [allChains, selectedMainId]);

  return (
    <MainLayout leftSidebar={<RankingChart />}>

      <div 
        className="flex flex-col w-full h-full gap-6"
        style={{ 
          padding: 'clamp(12px, 1.5vw, 24px)',
          minHeight: 0,
          overflow: 'hidden'
        }}
      >

        {/* Chain 제목 */}
        {mainChain && (
          <header className="shrink-0 h-[30px]">
            <h1 className="text-gray-100 text-3xl font-extrabold">{mainChain.name}</h1>
          </header>
        )}

        {/* 1. 상단 영역 */}
        {/* Bubble : Radar = 76 : 64 */}
        <div className="flex w-full gap-4 min-h-0" style={{ flex: '35 0 0' }}>

          {/* 1-1. 버블 차트 (76/140 ≈ 54.3%) */}
          <div className="h-full bg-[#1A1B20] rounded-lg relative overflow-hidden border border-gray-800 shadow-lg" style={{ width: '55%' }}>
            <div className="absolute inset-0 w-full h-full">
              <HempMap />
            </div>
          </div>

          {/* 1-2. 레이더 차트 (64/140 ≈ 45.7%) */}
          <div className="h-full bg-[#1A1B20] rounded-lg relative overflow-hidden border border-gray-800 shadow-lg shrink-0 my-auto" style={{ width: '45%' }}>
            <RadarChart />
          </div>

        </div>

        {/* 2. 하단 영역 (생키 차트) */}
        <div className="w-full h-full bg-[#1A1B20] rounded-lg relative overflow-hidden border border-gray-800 shadow-lg min-h-0" style={{ flex: '48 0 0' }}>
          <SankeyChart />
        </div>

      </div>
    </MainLayout>
  );
}

export default App;
