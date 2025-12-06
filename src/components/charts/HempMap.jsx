import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import useChainStore from '../../store/useChainStore';
import { COLORS } from '../../constants/colors';

const HempMap = () => {
  // 1. Store에서 데이터와 선택 상태를 실시간으로 구독합니다.
  const { allChains, selectedMainId, selectedSubId1, selectedSubId2 } = useChainStore();

  // 2. 차트 옵션 생성 (데이터나 선택이 바뀔 때만 다시 계산)
  const option = useMemo(() => {
    
    // 헬퍼: 이 체인이 선택된 놈인지(Main/Sub), 색깔은 뭔지 판별
    const getSelectionInfo = (id) => {
      if (id === selectedMainId) return { type: 'main', color: COLORS.MAIN, z: 10 };
      if (id === selectedSubId1) return { type: 'sub1', color: COLORS.SUB1, z: 9 };
      if (id === selectedSubId2) return { type: 'sub2', color: COLORS.SUB2, z: 9 };
      return null;
    };

    // 데이터 매핑: 우리가 가진 데이터를 ECharts가 이해하는 형식으로 변환
    const seriesData = allChains.map((chain) => {
      const selection = getSelectionInfo(chain.id);
      const isSelected = !!selection;

      return {
        name: chain.name,
        // [X축 값, Y축 값] -> [HEMP 점수, 참여도]
        value: [
          chain.score,        
          chain.participation 
        ],
        // 스타일링 (선택 여부에 따라 갈라짐)
        itemStyle: {
          color: isSelected ? selection.color : '#374151', // 선택되면 네온, 아니면 다크그레이
          opacity: isSelected ? 1 : 0.6,                   // 선택된 건 쨍하게, 배경은 흐릿하게
          borderColor: isSelected ? '#fff' : 'transparent', 
          borderWidth: isSelected ? 2 : 0,
          shadowBlur: isSelected ? 15 : 0,                 // 네온 글로우 효과 ✨
          shadowColor: isSelected ? selection.color : 'transparent'
        },
        // 크기: 선택된 건 크게(25), 나머진 작게(12)
        symbolSize: isSelected ? 25 : 12,
        // 순서: 선택된 게 맨 위로 올라오도록(Z-index)
        z: selection ? selection.z : 2
      };
    });

    // 최종 ECharts 설정 객체 반환
    return {
      backgroundColor: 'transparent',
      grid: {
        top: '15%', right: '10%', bottom: '15%', left: '10%',
        containLabel: true
      },
      // 마우스 올렸을 때 뜨는 툴팁
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1A1B20',
        borderColor: '#4B5563',
        textStyle: { color: '#fff' },
        formatter: (params) => {
          return `
            <div style="font-weight:bold; margin-bottom:4px; font-size:14px;">${params.name}</div>
            <div style="color:#9CA3AF; font-size:12px;">HEMP Score: <span style="color:white">${params.value[0]}</span></div>
            <div style="color:#9CA3AF; font-size:12px;">Participation: <span style="color:white">${params.value[1]}</span></div>
          `;
        }
      },
      xAxis: {
        name: 'HEMP Score',
        type: 'value',
        min: 0, max: 100, // 점수 범위 0~100 고정
        splitLine: { lineStyle: { color: '#2A2B30' } }, // 배경 격자선 (어둡게)
        axisLabel: { color: '#9CA3AF' },
        nameTextStyle: { color: '#9CA3AF', padding: [0, 0, 0, 10] }
      },
      yAxis: {
        name: 'Participation',
        type: 'value',
        min: 0, max: 100,
        splitLine: { lineStyle: { color: '#2A2B30' } },
        axisLabel: { color: '#9CA3AF' },
        nameTextStyle: { color: '#9CA3AF', padding: [0, 0, 10, 0] }
      },
      series: [
        {
          type: 'scatter', // 산점도 (버블 차트)
          data: seriesData,
          animationDurationUpdate: 500, // 부드러운 전환 애니메이션
          animationEasingUpdate: 'cubicOut'
        }
      ]
    };
  }, [allChains, selectedMainId, selectedSubId1, selectedSubId2]);

  return (
    <div className="w-full h-full bg-[#1A1B20] rounded-lg border border-gray-800 p-4 relative shadow-lg">
      <h3 className="text-white font-bold mb-2 absolute top-4 left-4 z-10 text-lg">HEMP Map</h3>
      <ReactECharts 
        option={option} 
        style={{ height: '100%', width: '100%' }} 
        opts={{ renderer: 'svg' }} // SVG로 그려서 깔끔하게
      />
    </div>
  );
};

export default HempMap;