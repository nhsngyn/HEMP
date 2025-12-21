import React, { useMemo, useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import useChainStore from '../../store/useChainStore';
import useChainSelection from '../../hooks/useChainSelection';
import { BUBBLE_CHART } from '../../constants/chart';
import { COLORS } from '../../constants/colors';

const HempMap = () => {
  const chartRef = useRef(null);
  const { allChains, selectedMainId, selectedSubId1, selectedSubId2 } = useChainStore();
  const { selectChain, getSelectionInfo } = useChainSelection();

  /* =========================
   * Resize
   * ========================= */
  useEffect(() => {
    const handleResize = () => {
      chartRef.current?.getEchartsInstance().resize();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* =========================
   * Chain Map (tooltip용)
   * ========================= */
  const chainMap = useMemo(() => {
    return allChains.reduce((acc, chain) => {
      acc[chain.name] = chain;
      return acc;
    }, {});
  }, [allChains]);

  /* =========================
   * Chart Option
   * ========================= */
  const option = useMemo(() => {
    if (!allChains || allChains.length === 0) return null;

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
      const selection = getSelectionInfo(chain.id);
      const isSelected = !!selection;
      const size = calculateBubbleSize(chain.proposals, isSelected);

      return {
        id: chain.id,
        name: chain.name,
        value: [
          Number(chain.score) || 0,
          Number(chain.participation) || 0
        ],

        /* 🔥 핵심: 로고를 symbol로 직접 사용 */
        symbol: chain.logoUrl
          ? `image://${chain.logoUrl}`
          : 'circle',

        symbolSize: size * 0.9,

        itemStyle: {
          color: COLORS.GRAY100,
          opacity: hasAnySelection && !isSelected ? 0.15 : 1,
          borderColor: isSelected ? selection.color : 'transparent',
          borderWidth: isSelected ? 3 : 0,
          shadowBlur: isSelected ? 14 : 0,
          shadowColor: isSelected ? selection.color : 'transparent'
        },

        z: isSelected ? 100 : 10
      };
    });

    const axisTextStyle = {
      color: COLORS.GRAY400,
      fontFamily: 'SUIT',
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 15.6,
      letterSpacing: -0.24
    };

    const solidAxisLineStyle = {
      show: true,
      lineStyle: { color: COLORS.GRAY400, width: 1 }
    };

    return {
      backgroundColor: 'transparent',
      textStyle: { fontFamily: 'SUIT' },
      animation: true,
      animationDuration: 200,

      grid: {
        left: 83,
        right: 24,
        top: 48,
        bottom: 28,
        containLabel: false
      },

      tooltip: {
        trigger: 'item',
        position: 'top',
        backgroundColor: 'transparent',
        padding: 0,
        borderWidth: 0,
        formatter: (params) => {
          const chainData = chainMap[params.name];
          if (!chainData) return '';

          return `
            <div style="
              display: inline-flex;
              padding: 4px 8px;
              gap: 8px;
              border-radius: 4px;
              background: ${COLORS.GRAY700};
              font-family: SUIT;
              font-size: 12px;
              font-weight: 500;
              color: ${COLORS.WHITE};
              box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            ">
              <span style="color:${COLORS.GRAY300};">Proposals</span>
              <span>${chainData.proposals || 0}</span>
            </div>
          `;
        }
      },

      xAxis: {
        name: 'HEMP Score',
        nameLocation: 'end',
        nameTextStyle: {
          ...axisTextStyle,
          align: 'right',
          padding: [12, 16, 0, 0]
        },
        type: 'value',
        scale: true,
        axisLabel: { show: false },
        axisTick: { show: false },
        axisLine: solidAxisLineStyle,
        splitLine: {
          show: true,
          lineStyle: { type: 'dashed', color: 'rgba(255,255,255,0.1)' }
        }
      },

      yAxis: {
        name: 'Participation',
        nameLocation: 'end',
        nameTextStyle: {
          ...axisTextStyle,
          align: 'right',
          padding: [0, 8, 0, 0]
        },
        type: 'value',
        scale: true,
        axisLabel: { show: false },
        axisTick: { show: false },
        axisLine: solidAxisLineStyle,
        splitLine: {
          show: true,
          lineStyle: { type: 'dashed', color: 'rgba(255,255,255,0.1)' }
        }
      },

      series: [
        {
          type: 'scatter',
          data: seriesData,
          cursor: 'pointer'
        }
      ]
    };
  }, [
    allChains,
    selectedMainId,
    selectedSubId1,
    selectedSubId2,
    getSelectionInfo,
    chainMap
  ]);

  const onChartClick = (params) => {
    const clickedChain = allChains.find(c => c.name === params.name);
    if (clickedChain) selectChain(clickedChain.id);
  };

  if (!allChains || allChains.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        <span className="animate-pulse">Loading Chart...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative p-[12px]">
      <div className="absolute top-[20px] left-[12px] flex items-center gap-2 z-10 pointer-events-none">
        <img src="/Icons/icn_num1.png" alt="1" width="20" height="20" />
        <h3 className="text-white font-bold text-base font-suit">HEMP Map</h3>
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
