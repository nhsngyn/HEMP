import React, { useEffect, useMemo, useRef } from 'react';
import MainLayout from './components/layout/MainLayout';
import Sidebar from './components/layout/Sidebar';
import HempMap from './components/charts/HempMap';
import SankeyChart from './components/charts/SankeyChart';
import RadarChart from './components/charts/RadarChart';
import ProposalsTable from './components/charts/ProposalsTable';
import useChainStore from './store/useChainStore';

function App() {
  const { allChains, selectedMainId, selectedSubId1, selectedSubId2, sankeyFilter } = useChainStore();
  const prevSankeyFilterRef = useRef(null);

  const mainChain = useMemo(() => {
    return allChains.find(c => c.id === selectedMainId);
  }, [allChains, selectedMainId]);

  const hasAnySelection = !!(selectedMainId || selectedSubId1 || selectedSubId2);
  const prevMainIdRef = useRef(selectedMainId);

  // 메인 체인이 새로 등록될 때마다 타이틀이 가려질 때까지 스크롤
  useEffect(() => {
    const prevMainId = prevMainIdRef.current;

    // 메인 체인이 없거나, 이전과 동일하면 스크롤하지 않음
    if (!selectedMainId || prevMainId === selectedMainId) {
      prevMainIdRef.current = selectedMainId;
      return;
    }

    prevMainIdRef.current = selectedMainId;

    // DOM 업데이트 대기 후 스크롤
    setTimeout(() => {
      const scrollContainer = document.getElementById('main-scroll-container');
      const headerEl = document.getElementById('dashboard-header');

      if (!scrollContainer || !headerEl) return;

      // 헤더의 하단 위치 계산
      const headerBottom = headerEl.offsetTop + headerEl.offsetHeight;

      // 타이틀이 완전히 가려질 때까지 스크롤 (헤더 높이만큼 추가 여백)
      scrollContainer.scrollTo({
        top: headerBottom + 30,
        behavior: 'smooth'
      });
    }, 50);
  }, [selectedMainId]);

  // Sankey 링크 선택 시 ProposalsTable로 스크롤
  useEffect(() => {
    if (!sankeyFilter) {
      prevSankeyFilterRef.current = null;
      return;
    }

    // 이전 필터와 동일하면 스크롤하지 않음
    const prevFilter = prevSankeyFilterRef.current;
    if (prevFilter &&
      prevFilter.sourceColumn === sankeyFilter.sourceColumn &&
      prevFilter.targetColumn === sankeyFilter.targetColumn &&
      prevFilter.sourceName === sankeyFilter.sourceName &&
      prevFilter.targetName === sankeyFilter.targetName) {
      return;
    }

    prevSankeyFilterRef.current = sankeyFilter;

    // proposals-section으로 스크롤
    const scrollContainer = document.getElementById('main-scroll-container');
    const proposalsSection = document.getElementById('proposals-section');

    if (!scrollContainer || !proposalsSection) return;

    // 약간의 지연 후 스크롤 (DOM 업데이트 대기)
    setTimeout(() => {
      const sectionTop = proposalsSection.offsetTop;
      scrollContainer.scrollTo({
        top: sectionTop - 20, // 약간의 여백
        behavior: 'smooth'
      });
    }, 100);
  }, [sankeyFilter]);

  return (
    <MainLayout leftSidebar={<Sidebar />}>
      <>
        {/* Section 1: Main Sankey Visualization (16:10 slide) */}
        <section
          className="w-full flex flex-col"
          style={{
            padding: 'calc(20px * var(--scale))',
            paddingTop: 'calc(10px * var(--scale))',
            paddingLeft: '24px',
            paddingRight: '24px',
            gap: '24px',
            height: '1080px',
            boxSizing: 'border-box'
          }}
        >
          {/* Title */}
          <header
            id="dashboard-header"
            className="shrink-0 flex flex-col"
            style={{ gap: 'calc(1px * var(--scale))', marginBottom: '24px' }}
          >
            <p className="font-extrabold" style={{ fontSize: '16px', fontFamily: 'SUIT', fontWeight: 600, color: '#6D7380' }}>Deeper Analysis on Blockchains</p>
            <h1 className="font-semibold" style={{ fontSize: '22px', fontFamily: 'SUIT', fontWeight: 600, color: '#E8EAED' }}>
              HEMP: Health Evaluation Metric using Proposals
            </h1>
          </header>

          {/* 1. 상단 영역 (HEMP Radar) - 40% */}
          {/* Bubble : Radar = 76 : 64 */}
          <div className="flex w-full min-h-0" style={{ gap: '12px', flex: '2.8 0 0' }}>

            {/* 1-1. 버블 차트 (76/140 ≈ 54.3%) */}
            <div className="h-full bg-[#ffffff05] rounded-2xl relative overflow-hidden shadow-lg" style={{ width: '52%' }}>
              <div className="absolute inset-0 w-full h-full">
                <HempMap />
              </div>
            </div>

            {/* 1-2. 레이더 차트 (64/140 ≈ 45.7%) */}
            <div className="h-full bg-[#ffffff05] rounded-2xl relative overflow-hidden shadow-lg shrink-0 my-auto" style={{ width: '48%' }}>
              <RadarChart />
            </div>

          </div>

          {/* 2. 하단 영역 (Sankey) - 60% */}
          <div className="w-full bg-[#ffffff05] rounded-2xl relative overflow-hidden shadow-lg min-h-0" style={{ flex: '6 0 0' }}>
            <SankeyChart />
          </div>
        </section>

        {/* Section 2: Proposals Table */}
        <section
          id="proposals-section"
          className="w-full"
          style={{
            padding: 'calc(12px * var(--scale))',
            paddingLeft: '24px',
            paddingRight: '24px',
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
