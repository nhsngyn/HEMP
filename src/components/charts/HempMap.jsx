import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import useChainStore from '../../store/useChainStore';
import { COLORS } from '../../constants/colors';

const HempMap = () => { 
  const { allChains, selectedMainId, selectedSubId1, selectedSubId2 } = useChainStore();

  const option = useMemo(() => {
    // 데이터가 없으면 빈 옵션 반환 (에러 방지)
    if (!allChains || allChains.length === 0) return {};

    const getSelectionInfo = (id) => {
      if (id === selectedMainId) return { type: 'main', color: COLORS.MAIN, z: 100 };
      if (id === selectedSubId1) return { type: 'sub1', color: COLORS.SUB1, z: 90 };
      if (id === selectedSubId2) return { type: 'sub2', color: COLORS.SUB2, z: 90 };
      return null;
    };

    // 2. 실제 데이터 매핑
    const seriesData = allChains.map((chain) => {
      const selection = getSelectionInfo(chain.id);
      const isSelected = !!selection;
      
      const hasAnySelection = selectedMainId || selectedSubId1 || selectedSubId2;

      return {
        name: chain.name,
        value: [
          chain.score,        
          chain.participation || 0 // 데이터 없을 경우 0 처리
        ],
        itemStyle: {
          color: isSelected 
            ? selection.color 
            : (hasAnySelection ? '#374151' : '#6B7280'),
          
          opacity: isSelected ? 1 : (hasAnySelection ? 0.3 : 0.7),
      
          borderColor: isSelected ? '#fff' : 'transparent',
          borderWidth: isSelected ? 2 : 0,
          shadowBlur: isSelected ? 15 : 0,
          shadowColor: isSelected ? selection.color : 'transparent'
        },
        
        symbolSize: isSelected ? 35 : 15,
        
        z: selection ? selection.z : 2
      };
    });

    return {
      backgroundColor: 'transparent',
      grid: {
        top: '15%', right: '8%', bottom: '15%', left: '8%',
        containLabel: true
      },

      // 툴팁 기능 : 구체적인 디자인은 나중에 정하기!
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(26, 27, 32, 0.9)', // 반투명 검정
        borderColor: '#4B5563',
        textStyle: { color: '#fff' },
        formatter: (params) => {
          return `
            <div style="font-weight:bold; margin-bottom:5px; font-size:14px;">${params.name}</div>
            <div style="color:#bbb">HEMP Score: <b style="color:white">${params.value[0]}</b></div>
            <div style="color:#bbb">Participation: <b style="color:white">${params.value[1]}</b></div>
          `;
        }
      },

      // X축 설정
      xAxis: {
        name: 'HEMP Score',
        type: 'value',
        scale: true, // 0부터 시작하지 않고 데이터 범위에 맞춤
        splitLine: { lineStyle: { color: '#2A2B30' } },
        axisLabel: { color: '#9CA3AF' },
        nameTextStyle: { color: '#9CA3AF', fontWeight: 'bold' }
      },
      // Y축 설정
      yAxis: {
        name: 'Participation',
        type: 'value',
        scale: true,
        splitLine: { lineStyle: { color: '#2A2B30' } },
        axisLabel: { color: '#9CA3AF' },
        nameTextStyle: { color: '#9CA3AF', fontWeight: 'bold' }
      },
      // 시리즈 설정
      series: [
        {
          type: 'scatter',
          data: seriesData,
          // 애니메이션 설정
          animationDurationUpdate: 500,
          animationEasingUpdate: 'cubicOut'
        }
      ]
    };
  }, [allChains, selectedMainId, selectedSubId1, selectedSubId2]);

  return (
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