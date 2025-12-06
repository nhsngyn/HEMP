import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import useChainStore from '../../store/useChainStore';
import { COLORS } from '../../constants/colors';

const HempMap = () => { // 파일명이 BubbleChart.jsx라면 이름 맞춰주세요
  const { allChains, selectedMainId, selectedSubId1, selectedSubId2 } = useChainStore();

  const option = useMemo(() => {
    // ... (기존 차트 로직 그대로 유지: seriesData 생성 등) ...
    // 코드가 길어서 생략했습니다. 작성하신 로직 그대로 쓰시면 됩니다.
    
    // 예시 데이터 로직 (생략된 부분 채워넣으세요)
    const seriesData = allChains.map(chain => ({
        name: chain.name,
        value: [chain.score, chain.participation],
        // ... 스타일 설정 ...
    }));

    return {
      backgroundColor: 'transparent',
      grid: { top: '15%', right: '8%', bottom: '15%', left: '8%', containLabel: true },
      // ... xAxis, yAxis, series 설정 ...
      series: [{ type: 'scatter', data: seriesData }]
    };
  }, [allChains, selectedMainId, selectedSubId1, selectedSubId2]);

  return (
    // 부모 영역(오른쪽 패널)을 100% 채움
    <div className="w-full h-full relative">
      <h3 className="absolute top-4 left-6 text-white font-bold text-lg z-10 pointer-events-none">
        HEMP Map
      </h3>
      <ReactECharts 
        option={option} 
        style={{ height: '100%', width: '100%' }} 
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
};

export default HempMap;