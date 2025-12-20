import React, { useEffect, useMemo, useRef } from 'react';
import MainLayout from './components/layout/MainLayout';
import Sidebar from './components/layout/Sidebar';
import HempMap from './components/charts/HempMap';
import SankeyChart from './components/charts/SankeyChart';
import RadarChart from './components/charts/RadarChart';
import ProposalsTable from './components/charts/ProposalsTable';
import useChainStore from './store/useChainStore';

function App() {
  const { allChains, selectedMainId, selectedSubId1, selectedSubId2 } = useChainStore();

  const mainChain = useMemo(() => {
    return allChains.find(c => c.id === selectedMainId);
  }, [allChains, selectedMainId]);

  const hasAnySelection = !!(selectedMainId || selectedSubId1 || selectedSubId2);
  const prevHasSelectionRef = useRef(hasAnySelection);

  // 체인이 처음 선택됐을 때만 헤더가 안 보이도록 아래로 자동 스크롤
  useEffect(() => {
    const prev = prevHasSelectionRef.current;

    // 선택이 없거나, 이미 선택 상태였으면 스크롤하지 않음
    if (!hasAnySelection || prev) {
      prevHasSelectionRef.current = hasAnySelection;
      return;
    }

    prevHasSelectionRef.current = hasAnySelection;

    const scrollContainer = document.getElementById('main-scroll-container');
    const headerEl = document.getElementById('dashboard-header');

    if (!scrollContainer || !headerEl) return;

    const headerBottom = headerEl.offsetTop + headerEl.offsetHeight;

    scrollContainer.scrollTo({
      top: headerBottom + 8,
      behavior: 'smooth'
    });
  }, [hasAnySelection]);

  return (
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
          <header
            id="dashboard-header"
            className="shrink-0 flex flex-col"
            style={{ gap: 'calc(4px * var(--scale))' }}
          >
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
