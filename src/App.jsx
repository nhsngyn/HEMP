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
        className="flex flex-col w-full h-full gap-4"
        style={{
          padding: 'clamp(12px, 1.5vw, 24px)',
          minHeight: 0,
          overflow: 'hidden'
        }}
      >

        {/* Title */}
        <header className="shrink-0 flex flex-col gap-1">
          <p className="text-gray-400 text-sm font-normal">Multidimensional Chain Health via HEMP</p>
          <h1 className="text-white text-2xl font-extrabold">Deeper Analysis on Blockchains</h1>
        </header>

        {/* 1. 상단 영역 */}
        {/* Bubble : Radar = 76 : 64 */}
        <div className="flex w-full gap-4 min-h-0" style={{ flex: '40 0 0' }}>

          {/* 1-1. 버블 차트 (76/140 ≈ 54.3%) */}
          <div className="h-full bg-[#1A1B20] rounded-lg relative overflow-hidden  shadow-lg" style={{ width: '55%' }}>
            <div className="absolute inset-0 w-full h-full">
              <HempMap />
            </div>
          </div>

          {/* 1-2. 레이더 차트 (64/140 ≈ 45.7%) */}
          <div className="h-full bg-[#1A1B20] rounded-lg relative overflow-hidden  shadow-lg shrink-0 my-auto" style={{ width: '45%' }}>
            <RadarChart />
          </div>

        </div>

        {/* 2. 하단 영역 (생키 차트) */}
        <div className="w-full h-full bg-[#1A1B20] rounded-lg relative overflow-hidden shadow-lg min-h-0" style={{ flex: '60 0 0' }}>
          <SankeyChart />
        </div>

      </div>
    </MainLayout>
  );
}

export default App;
