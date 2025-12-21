import React, { useMemo } from 'react';
import HempMap from '../components/charts/HempMap';
import RadarChart from '../components/charts/RadarChart';
import SankeyChart from '../components/charts/SankeyChart';
import ProposalsTable from '../components/charts/ProposalsTable';
import useChainStore from '../store/useChainStore';

const DashboardPage = () => {
  const { allChains, selectedMainId } = useChainStore();

  const mainChain = useMemo(() => {
    return allChains.find(c => c.id === selectedMainId);
  }, [allChains, selectedMainId]);


  return (
    <div className="flex flex-col w-full h-full">
      
      {/* 상단 섹션 */}
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
        <div className="flex flex-col justify-end h-[133px] pb-4 shrink-0">
          <p className="text-gray-400 text-body2-r">
            Deeper Analysis on Blockchains
          </p>
          <h2 className="text-white text-3xl font-bold mt-1">
           HEMP: Health Evaluation Metric using Proposals
          </h2>
        </div>

        {/* 상단 차트 영역 */}
        <div className="flex w-full min-h-0 h-[360px]" style={{ gap: 'calc(16px * var(--scale))' }}>
          
          {/* 1. HempMap */}
          <div 
            className="h-full relative overflow-hidden shadow-lg" 
            style={{ ...cardStyle, width: '52%' }} 
          >
            <HempMap />
          </div>

          {/* 2. RadarChart */}
          <div 
            className="h-full relative overflow-hidden shadow-lg shrink-0" 
            style={{ ...cardStyle, width: '48%' }}
          >
            <RadarChart />
          </div>
        </div>

        {/* 3. SankeyChart */}
        <div 
          className="w-full h-[400px] relative overflow-hidden shadow-lg min-h-0" 
          style={cardStyle}
        >
          <SankeyChart />
        </div>
      </section>

      {/* 하단 테이블 섹션 */}
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

    </div>
  );
};

export default DashboardPage;