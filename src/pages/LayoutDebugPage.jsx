import React, { useMemo, useRef, useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import RankingChart from '../components/ranking/RankingChart';
import useChainStore from '../store/useChainStore';

// 디버그 레이블 컴포넌트
const DebugLabel = ({ label, size }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '4px',
        left: '4px',
        background: 'rgba(0, 255, 0, 0.9)',
        color: 'black',
        padding: '4px 8px',
        fontSize: '11px',
        fontWeight: 'bold',
        zIndex: 1000,
        borderRadius: '4px',
        fontFamily: 'monospace',
        pointerEvents: 'none',
      }}
    >
      {label} {size && `(${size})`}
    </div>
  );
};

// 크기 정보를 가져오는 훅
const useElementSize = (ref) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const updateSize = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setSize({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(ref.current);

    return () => resizeObserver.disconnect();
  }, [ref]);

  return size;
};

function LayoutDebugPage() {
  const { allChains, selectedMainId } = useChainStore();

  // 메인 체인 데이터
  const mainChain = useMemo(() => {
    return allChains.find(c => c.id === selectedMainId);
  }, [allChains, selectedMainId]);

  // 각 영역의 ref
  const mainContainerRef = useRef(null);
  const headerRef = useRef(null);
  const topAreaRef = useRef(null);
  const bubbleRef = useRef(null);
  const radarRef = useRef(null);
  const sankeyRef = useRef(null);

  // 각 영역의 크기
  const mainSize = useElementSize(mainContainerRef);
  const headerSize = useElementSize(headerRef);
  const topAreaSize = useElementSize(topAreaRef);
  const bubbleSize = useElementSize(bubbleRef);
  const radarSize = useElementSize(radarRef);
  const sankeySize = useElementSize(sankeyRef);

  // 디버그 스타일
  const debugBorder = '2px solid #00ff00';
  const debugStyle = {
    border: debugBorder,
    position: 'relative',
  };

  return (
    <MainLayout leftSidebar={<RankingChart />}>
      <div
        ref={mainContainerRef}
        className="flex flex-col w-full h-full p-6 gap-6"
        style={debugStyle}
      >
        <DebugLabel label="Main Container" size={`${mainSize.width}×${mainSize.height}`} />

        {/* Chain 제목 */}
        {mainChain && (
          <header
            ref={headerRef}
            className="shrink-0 h-[130px] mb-[30px]"
            style={debugStyle}
          >
            <DebugLabel label="Header" size={`${headerSize.width}×${headerSize.height}`} />
            <h1 className="text-white text-3xl font-bold">{mainChain.name}</h1>
          </header>
        )}

        {/* 1. 상단 영역 */}
        <div
          ref={topAreaRef}
          className="flex w-full h-[350px] gap-6 shrink-0"
          style={debugStyle}
        >
          <DebugLabel label="Top Area" size={`${topAreaSize.width}×${topAreaSize.height}`} />

          {/* 1-1. 버블 차트 */}
          <div
            ref={bubbleRef}
            className="h-full bg-[#1A1B20] rounded-lg relative overflow-visible"
            style={{ width: '54.3%', border: '2px solid #3b82f6', ...debugStyle }}
          >
            <DebugLabel label="Bubble (54.3%)" size={`${bubbleSize.width}×${bubbleSize.height}`} />
            <div className="absolute inset-0 flex items-center justify-center text-blue-400 text-sm font-medium">
              Bubble Chart Area
            </div>
          </div>

          {/* 1-2. 레이더 차트 */}
          <div
            ref={radarRef}
            className="h-full bg-[#1A1B20] rounded-lg relative overflow-visible"
            style={{ width: '45.7%', border: '2px solid #a855f7', ...debugStyle }}
          >
            <DebugLabel label="Radar (45.7%)" size={`${radarSize.width}×${radarSize.height}`} />
            <div className="absolute inset-0 flex items-center justify-center text-purple-400 text-sm font-medium">
              Radar Chart Area
            </div>
          </div>
        </div>

        {/* 2. 하단 영역 (생키 차트) */}
        <div
          ref={sankeyRef}
          className="flex-1 w-full h-[400px] bg-[#1A1B20] rounded-lg relative overflow-visible"
          style={{ border: '2px solid #eab308', ...debugStyle }}
        >
          <DebugLabel label="Sankey (flex-1)" size={`${sankeySize.width}×${sankeySize.height}`} />
          <div className="absolute inset-0 flex items-center justify-center text-yellow-400 text-sm font-medium">
            Sankey Chart Area
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default LayoutDebugPage;
