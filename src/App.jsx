import React, { useMemo } from 'react';
import MainLayout from './components/layout/MainLayout';
import RankingChart from './components/ranking/RankingChart';
import HempMap from './components/charts/HempMap';
import SankeyChart from './components/charts/SankeyChart';
import RadarChart from './components/charts/RadarChart';
import ProposalsTable from './components/charts/ProposalsTable';
import useChainStore from './store/useChainStore';

function App() {
  const { allChains, selectedMainId } = useChainStore();

  // 메인 체인 데이터
  const mainChain = useMemo(() => {
    return allChains.find(c => c.id === selectedMainId);
  }, [allChains, selectedMainId]);

  return (
    <MainLayout leftSidebar={<RankingChart />}>
      <>
        {/* Section 1: Main Sankey Visualization (16:10 slide) */}
        <section
          className="w-full flex flex-col"
          style={{
            padding: 'calc(12px * var(--scale))',
            paddingLeft: 'calc(20px * var(--scale))',
            paddingRight: 'calc(12px * var(--scale) + 5px)',
            gap: 'calc(16px * var(--scale))',
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always',
            height: '1000px',
            boxSizing: 'border-box'
          }}
        >
          {/* Title */}
          <header className="shrink-0 flex flex-col" style={{ gap: 'calc(4px * var(--scale))' }}>
            <p className="text-gray-400 font-normal" style={{ fontSize: 'calc(0.875rem * var(--scale))' }}>
              Multidimensional Chain Health via HEMP
            </p>
            <h1 className="text-white font-extrabold" style={{ fontSize: 'calc(1.5rem * var(--scale))' }}>
              Deeper Analysis on Blockchains
            </h1>
          </header>

          {/* 1. 상단 영역 (HEMP Radar) - 40% */}
          {/* Bubble : Radar = 76 : 64 */}
          <div className="flex w-full min-h-0" style={{ gap: 'calc(16px * var(--scale))', flex: '2.9 0 0' }}>

            {/* 1-1. 버블 차트 (76/140 ≈ 54.3%) */}
            <div className="h-full bg-[#ffffff06] rounded-2xl relative overflow-hidden shadow-lg" style={{ width: '52%' }}>
              <div className="absolute inset-0 w-full h-full">
                <HempMap />
              </div>
            </div>

            {/* 1-2. 레이더 차트 (64/140 ≈ 45.7%) */}
            <div className="h-full bg-[#ffffff06] rounded-2xl relative overflow-hidden shadow-lg shrink-0 my-auto" style={{ width: '48%' }}>
              <RadarChart />
            </div>

          </div>

          {/* 2. 하단 영역 (Sankey) - 60% */}
          <div className="w-full bg-[#ffffff06] rounded-2xl relative overflow-hidden shadow-lg min-h-0" style={{ flex: '6.0 0 0' }}>
            <SankeyChart />
          </div>
        </section>

        {/* Section 2: Proposals Table */}
        <section
          id="proposals-section"
          className="w-full"
          style={{
            padding: 'calc(12px * var(--scale))',
            paddingLeft: 'calc(20px * var(--scale))',
            paddingRight: 'calc(12px * var(--scale) + 5px)',
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always',
            minHeight: 'auto',
            boxSizing: 'border-box',
          }}
        >
          <ProposalsTable mainChain={mainChain} />
        </section>
      </>
    </MainLayout>
  );
}

export default App;
