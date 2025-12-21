import React, { useMemo, useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import useChainStore from '../../store/useChainStore';
import useChainSelection from '../../hooks/useChainSelection';
import { BUBBLE_CHART } from '../../constants/chart';

const HempMap = () => {
  // 차트 인스턴스 접근을 위한 Ref
  const chartRef = useRef(null);

  // 1. 상태 직접 구독 (반응성 보장)
  const { allChains, selectedMainId, selectedSubId1, selectedSubId2 } = useChainStore();
  
  const { 
    selectChain,
    getSelectionInfo
  } = useChainSelection();

  // 2. 창 크기 변경 시 차트 리사이즈 (반응형 해결)
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.getEchartsInstance().resize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chainMap = useMemo(() => {
    if (!allChains) return {};
    return allChains.reduce((acc, chain) => {
      acc[chain.name] = chain;
      return acc;
    }, {});
  }, [allChains]);

  const option = useMemo(() => {
    if (!allChains || allChains.length === 0) return null;

    // 선택 여부 확인
    const hasAnySelection = !!(selectedMainId || selectedSubId1 || selectedSubId2);
    const { SIZES, THRESHOLDS } = BUBBLE_CHART;

    const calculateBubbleSize = (proposalCount, isSelected) => {
      const count = Number(proposalCount) || 0;
      let baseSize;
      if (count >= THRESHOLDS.Q3) baseSize = SIZES.HUGE;
      else if (count >= THRESHOLDS.Q2) baseSize = SIZES.LARGE;
      else if (count >= THRESHOLDS.Q1) baseSize = SIZES.MEDIUM;
      else baseSize = SIZES.SMALL;
      return isSelected ? baseSize + SIZES.SELECTED_OFFSET : baseSize;
    };

    const seriesData = allChains.map((chain) => {
      // 3. 여기서 선택 상태를 실시간 계산 (Selection Hook 사용)
      const selection = getSelectionInfo(chain.id);
      const isSelected = !!selection; // boolean 변환
      const size = calculateBubbleSize(chain.proposals, isSelected);
      const logoUrl = chain.logoUrl || "";

      return {
        name: chain.name,
        value: [Number(chain.score) || 0, Number(chain.participation) || 0],
        symbol: 'circle',
        symbolSize: size,
        label: {
          show: true,
          position: 'center',
          formatter: logoUrl ? '{logo|}' : '',
          rich: {
            logo: {
              backgroundColor: { image: logoUrl },
              width: size * 0.9,
              height: size * 0.9,
              borderRadius: (size * 0.9) / 2,
            }
          }
        },
        itemStyle: {
          color: '#E5E7EB',
          // 선택된 게 있는데 나는 선택 안 됐다면 흐리게
          opacity: hasAnySelection && !isSelected ? 0.1 : 1,
          borderColor: isSelected ? selection.color : 'transparent',
          borderWidth: isSelected ? 3 : 0,
          shadowBlur: isSelected ? 15 : 0,
          shadowColor: isSelected ? selection.color : 'transparent'
        },
        z: isSelected ? 100 : 2
      };
    });

    const axisTextStyle = {
      color: '#6D7380',
      fontFamily: 'SUIT',
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 15.6,
    };

    const solidAxisLineStyle = {
      show: true,
      lineStyle: { color: '#6D7380', type: 'solid', width: 1 }
    };

    // 점선 라벨 스타일
    const axisPointerLabelStyle = {
      backgroundColor: '#29303A',
      color: '#FFFFFF',
      fontFamily: 'SUIT',
      fontSize: 12,
      padding: [4, 6],
      borderRadius: 4,
    };

    return {
      backgroundColor: 'transparent',
      textStyle: { fontFamily: 'SUIT' },
      
      // 애니메이션 설정
      animation: true,
      animationDuration: 300,

      grid: {
        top: '20%', bottom: '12%', left: '8%', right: '8%',
        containLabel: false 
      },

      // 4. 툴팁: 'item' 트리거 (버블 위에 있을 때만 정보창 표시)
      tooltip: {
        trigger: 'item',
        padding: 0,
        borderWidth: 0,
        backgroundColor: 'transparent',
        formatter: (params) => {
          const chainData = chainMap[params.name]; 
          if (!chainData) return '';
          
          return `
            <div style="
              display: inline-flex;
              padding: 4px 8px;
              align-items: center;
              gap: 8px;
              border-radius: 4px;
              background: #29303A; 
              font-family: 'SUIT';
              font-size: 12px;
              font-weight: 500;
              line-height: 1.3;
              box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
            ">
              <span style="color: #9CA3AF;">Proposals</span>
              <span style="color: #FFFFFF;">${chainData.proposals || 0}</span>
            </div>
          `;
        }
      },

      xAxis: {
        name: 'HEMP Score',
        nameLocation: 'end',
        nameGap: 10,
        nameTextStyle: { ...axisTextStyle, align: 'right', verticalAlign: 'top', padding: [10, 0, 0, 0] },
        type: 'value',
        scale: true,
        axisLabel: { show: false }, 
        axisTick: { show: false }, 
        axisLine: solidAxisLineStyle,
        
        splitLine: { 
          show: true,
          lineStyle: { type: 'dashed', color: 'rgba(255,255,255,0.1)' } 
        },
        
        // 5. 점선(수치) 강제 표시: tooltip trigger가 item이어도 점선이 나오게 설정
        axisPointer: {
          show: true, // 항상 켜짐
          type: 'line',
          snap: false, // 마우스 따라 부드럽게 이동
          lineStyle: { type: 'dashed', color: 'rgba(255,255,255,0.3)' },
          label: {
            show: true,
            ...axisPointerLabelStyle,
            formatter: (params) => Math.round(params.value)
          }
        }
      },

      yAxis: {
        name: 'Participation',
        nameLocation: 'end',
        nameGap: 10,
        nameTextStyle: { ...axisTextStyle, align: 'left', padding: [0, 0, 0, -10] },
        type: 'value',
        scale: true,
        axisLabel: { show: false }, 
        axisTick: { show: false }, 
        axisLine: solidAxisLineStyle,
        
        splitLine: { 
          show: true,
          lineStyle: { type: 'dashed', color: 'rgba(255,255,255,0.1)' } 
        },

        // 5. 점선(수치) 강제 표시
        axisPointer: {
          show: true, // 항상 켜짐
          type: 'line',
          snap: false, // 마우스 따라 부드럽게 이동
          lineStyle: { type: 'dashed', color: 'rgba(255,255,255,0.3)' },
          label: {
            show: true,
            ...axisPointerLabelStyle,
            formatter: (params) => Math.round(params.value)
          }
        }
      },

      series: [
        {
          type: 'scatter',
          data: seriesData,
          large: true, 
          largeThreshold: 500,
        }
      ]
    };
  }, [allChains, selectedMainId, selectedSubId1, selectedSubId2, getSelectionInfo, chainMap]); // 의존성 배열 확인

  const onChartClick = (params) => {
    const clickedChain = allChains.find(c => c.name === params.name);
    if (clickedChain) {
      selectChain(clickedChain.id);
    }
  };

  // 로딩
  if (!allChains || allChains.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        <span className="animate-pulse">Loading Chart...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-4 left-5 flex items-center gap-2 z-10 pointer-events-none">
        <img src="/Icons/icn_num1.png" alt="1" width="20" height="20" />
        <h3 className="text-white font-bold text-base">HEMP Map</h3>
      </div>

      <div className="absolute top-4 right-5 z-10 group">
        <img 
          src="/Icons/Frame 183.png" 
          alt="Info" 
          width="20" height="20"
          className="cursor-help opacity-70 hover:opacity-100 transition-opacity"
        />
        <div className="absolute right-0 top-6 w-48 p-2 bg-gray-800 text-xs text-gray-300 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Circle size reflects the volume of proposals.
        </div>
      </div>

      {option && (
        <ReactECharts 
          ref={chartRef}
          option={option} 
          style={{ height: '100%', width: '100%' }} 
          opts={{ renderer: 'svg' }}
          onEvents={{ click: onChartClick }}
        />
      )}
    </div>
  );
};

export default HempMap;