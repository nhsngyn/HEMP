import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import useChainStore from '../../store/useChainStore';
import useChainSelection from '../../hooks/useChainSelection';
import { BUBBLE_CHART } from '../../constants/chart';

const HempMap = () => {
  const { allChains } = useChainStore();
  
  // selectChain 가져오기
  const { 
    selectChain,
    getSelectionInfo, 
    selectedMainId, selectedSubId1, selectedSubId2 
  } = useChainSelection();

  const option = useMemo(() => {
    if (!allChains || allChains.length === 0) return {};

    const hasAnySelection = selectedMainId || selectedSubId1 || selectedSubId2;

   const { THRESHOLDS, SIZES } = BUBBLE_CHART;

    const calculateBubbleSize = (proposalCount, isSelected) => {
      const count = proposalCount || 0;
      let baseSize;
      if (count >= THRESHOLDS.Q3) {
        baseSize = SIZES.HUGE;
      } 
      else if (count >= THRESHOLDS.Q2) {
        baseSize = SIZES.LARGE;
      } 
      else if (count >= THRESHOLDS.Q1) {
        baseSize = SIZES.MEDIUM;
      } 
      else {
        baseSize = SIZES.SMALL;
      }
      return isSelected ? baseSize + SIZES.SELECTED_OFFSET : baseSize;
    };
    const seriesData = allChains.map((chain) => {
      const selection = getSelectionInfo(chain.id);
      const isSelected = !!selection;
      
      const size = calculateBubbleSize(chain.proposals, isSelected);
      const logoUrl = chain.logoUrl || "";

      return {
        name: chain.name,
        value: [chain.score, chain.participation || 0],
        symbol: 'circle',
        symbolSize: size, 
        label: {
          show: true,
          position: 'inside',
          formatter: '{logo|}',
          rich: {
            logo: {
              backgroundColor: { image: logoUrl },
              width: size,
              height: size,
              borderRadius: size / 2 
            }
          }
        },
        itemStyle: {
          color: 'transparent',
          opacity: isSelected ? 1 : (hasAnySelection ? 0.3 : 0.85),
          borderColor: isSelected ? selection.color : 'transparent',
          borderWidth: isSelected ? 3 : 0,
          shadowBlur: isSelected ? 20 : 0,
          shadowColor: isSelected ? selection.color : 'transparent'
        },
        z: selection ? selection.z : 2
      };
    });

    return {
      backgroundColor: 'transparent',
      grid: {
        top: '20%', right: '8%', bottom: '12%', left: '8%',
        containLabel: true
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(26, 27, 32, 0.95)',
        borderColor: '#4B5563',
        textStyle: { color: '#fff' },
        formatter: (params) => {
          const chainData = allChains.find(c => c.name === params.name);
          const logoImg = chainData?.logoUrl ? `<img src="${chainData.logoUrl}" style="width:20px;height:20px;vertical-align:middle;margin-right:8px;border-radius:50%;" />` : '';
          return `
            <div style="font-weight:bold; margin-bottom:8px; font-size:15px; display:flex; align-items:center;">
              ${logoImg} ${params.name}
            </div>
            <div style="color:#bbb; margin-bottom:4px;">HEMP Score: <b style="color:white">${params.value[0]}</b></div>
            <div style="color:#bbb; margin-bottom:4px;">Participation: <b style="color:white">${params.value[1]}%</b></div>
            <div style="color:#bbb;">Proposals: <b style="color:#FCD34D">${chainData?.proposals || 0}개</b></div>
          `;
        }
      },
      xAxis: {
        name: 'HEMP Score',
        type: 'value',
        scale: true,
        splitLine: { lineStyle: { color: '#2A2B30' } },
        axisLabel: { color: '#9CA3AF' },
        nameTextStyle: { color: '#9CA3AF', fontWeight: 'bold' }
      },
      yAxis: {
        name: 'Participation',
        type: 'value',
        scale: true,
        splitLine: { lineStyle: { color: '#2A2B30' } },
        axisLabel: { formatter: '{value}%', color: '#9CA3AF' },
        nameTextStyle: { color: '#9CA3AF', fontWeight: 'bold' }
      },
      series: [
        {
          type: 'scatter',
          data: seriesData,
          animationDurationUpdate: 500,
          animationEasingUpdate: 'cubicOut'
        }
      ]
    };
  }, [allChains, selectedMainId, selectedSubId1, selectedSubId2, getSelectionInfo]);

  // 클릭 핸들러
  const onChartClick = (params) => {
    const clickedChain = allChains.find(c => c.name === params.name);
    if (clickedChain) {
      // 클릭 시 자동 배치 (이미 선택된 체인이면 무시됨)
      selectChain(clickedChain.id);
    }
  };

  return (
    <div className="w-full h-full relative">
      <h3 className="absolute top-4 left-6 text-white font-bold text-lg z-10 pointer-events-none">
        HEMP Map
      </h3>
      <ReactECharts 
        option={option} 
        style={{ height: '100%', width: '100%' }} 
        opts={{ renderer: 'svg' }}
        onEvents={{
          click: onChartClick
        }}
      />
    </div>
  );
};

export default HempMap;