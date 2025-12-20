import React, { useMemo } from 'react';
import MainLayout from './components/layout/MainLayout';
import Sidebar from './components/layout/Sidebar'; // [중요] RankingChart 대신 Sidebar import
import HempMap from './components/charts/HempMap';
import SankeyChart from './components/charts/SankeyChart';
import RadarChart from './components/charts/RadarChart';
import ProposalsTable from './components/charts/ProposalsTable';
import useChainStore from './store/useChainStore';

function App() {
  const { allChains, selectedMainId } = useChainStore();

  const mainChain = useMemo(() => {
    return allChains.find(c => c.id === selectedMainId);
  }, [allChains, selectedMainId]);

  return (
    // [중요] leftSidebar 속성에 <Sidebar />를 전달해야 타이틀이 보입니다.
    <MainLayout leftSidebar={<Sidebar />}>
      <>
        {/* Section 1: 차트 대시보드 */}
        <section
          className="w-full flex flex-col"
          style={{
            padding: 'calc(12px * var(--scale))',
            paddingLeft: 'calc(20px * var(--scale))',
            paddingRight: 'calc(12px * var(--scale) + 5px)',
            gap: 'calc(16px * var(--scale))',
            boxSizing: 'border-box'
          }}
        >
          {/* 헤더 */}
          <header className="shrink-0 flex flex-col" style={{ gap: 'calc(4px * var(--scale))' }}>
            <p className="text-gray-400 font-normal" style={{ fontSize: 'calc(0.875rem * var(--scale))' }}>
              Multidimensional Chain Health via HEMP
            </p>
            <h1 className="text-white font-extrabold" style={{ fontSize: 'calc(1.5rem * var(--scale))' }}>
              Deeper Analysis on Blockchains
            </h1>
          </header>

          {/* 상단: Bubble + Radar 차트 */}
          <div className="flex w-full min-h-0 h-[360px]" style={{ gap: 'calc(16px * var(--scale))' }}>
            <div className="h-full bg-[#ffffff06] rounded-2xl relative overflow-hidden shadow-lg" style={{ width: '52%' }}>
              <HempMap />
            </div>
            <div className="h-full bg-[#ffffff06] rounded-2xl relative overflow-hidden shadow-lg shrink-0" style={{ width: '48%' }}>
              <RadarChart />
            </div>
          </div>

          {/* 하단: Sankey 차트 */}
          <div className="w-full h-[400px] bg-[#ffffff06] rounded-2xl relative overflow-hidden shadow-lg min-h-0">
            <SankeyChart />
          </div>
        </section>

        {/* Section 2: 테이블 */}
        <section
          id="proposals-section"
          className="w-full"
          style={{
            padding: 'calc(12px * var(--scale))',
            paddingLeft: 'calc(20px * var(--scale))',
            paddingRight: 'calc(12px * var(--scale) + 5px)',
            minHeight: 'auto',
            marginBottom: '40px',
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