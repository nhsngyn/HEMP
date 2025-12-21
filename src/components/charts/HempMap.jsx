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

  // 창 크기 변경 시 차트 리사이즈 (반응형)
  useEffect(() => {
    const handleResize = () => {
      chartRef.current?.getEchartsInstance().resize();
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
      const logoUrl = chain.logoUrl || '';

      return {
        id: chain.id,
        name: chain.name,
        value: [Number(chain.score) || 0, Number(chain.participation) || 0],

        // ✅ 로고 정렬 해결: symbol을 이미지로 사용
        symbol: logoUrl ? `image://${logoUrl}` : 'circle',
        symbolSize: size * 0.9,

        // (기존 디자인 유지)
        itemStyle: {
          color: COLORS.GRAY100,
          opacity: hasAnySelection && !isSelected ? 0.1 : 1,
          borderColor: isSelected ? selection.color : 'transparent',
          borderWidth: isSelected ? 3 : 0,
          shadowBlur: isSelected ? 15 : 0,
          shadowColor: isSelected ? selection.color : 'transparent',
        },
        z: isSelected ? 100 : 10,
      };
    });

    const axisTextStyle = {
      color: COLORS.GRAY400,
      fontFamily: 'SUIT',
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 15.6,
      letterSpacing: -0.24,
    };

    const solidAxisLineStyle = {
      show: true,
      lineStyle: { color: COLORS.GRAY400, type: 'solid', width: 1 },
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
        containLabel: false,
      },

      tooltip: {
        trigger: 'item',
        position: 'top',
        backgroundColor: 'transparent',
        padding: 0,
        borderWidth: 0,
        axisPointer: {
          type: 'cross',
          snap: true,
          label: {
            show: true,
            backgroundColor: 'transparent',
            padding: 0,
            fontFamily: 'SUIT',
            fontSize: 14,
            fontWeight: 600,
            formatter: (params) => Math.round(params.value),
          },
          crossStyle: {
            type: 'dashed',
            width: 1,
          },
        },
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
              background: ${COLORS.GRAY700};
              font-family: 'SUIT';
              font-size: 12px;
              font-weight: 500;
              box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
              margin-bottom: 8px;
            ">
              <span style="color: ${COLORS.GRAY300};">Proposals</span>
              <span style="color: ${COLORS.WHITE};">${chainData.proposals || 0}</span>
            </div>
          `;
        },
      },

      xAxis: {
        name: 'HEMP Score',
        nameLocation: 'end',
        nameTextStyle: {
          ...axisTextStyle,
          align: 'right',
          verticalAlign: 'top',
          padding: [12, 16, 0, 0], // 6px 간격 유지
        },
        type: 'value',
        scale: true,
        axisLabel: { show: false },
        axisTick: { show: false },
        axisLine: solidAxisLineStyle,
        splitLine: {
          show: true,
          lineStyle: { type: 'dashed', color: 'rgba(255,255,255,0.1)' },
        },
      },

      yAxis: {
        name: 'Participation',
        nameLocation: 'end',
        nameGap: 4,
        nameTextStyle: {
          ...axisTextStyle,
          align: 'right',
          verticalAlign: 'top',
          padding: [0, 8, 0, 0],
        },
        type: 'value',
        scale: true,
        axisLabel: { show: false },
        axisTick: { show: false },
        axisLine: solidAxisLineStyle,
        splitLine: {
          show: true,
          lineStyle: { type: 'dashed', color: 'rgba(255,255,255,0.1)' },
        },
      },

      series: [
        {
          type: 'scatter',
          data: seriesData,
          cursor: 'pointer',
          large: false,
        },
      ],
    };
  }, [allChains, selectedMainId, selectedSubId1, selectedSubId2, getSelectionInfo, chainMap]);

  const handleChartMouseOver = (params) => {
    if (params.componentType !== 'series') return;
    const hoveredId = params.data.id;

    let lineColor = COLORS.GRAY300;
    let textColor = COLORS.WHITE;

    if (hoveredId === selectedMainId) {
      lineColor = COLORS.MAIN;
      textColor = COLORS.MAIN;
    } else if (hoveredId === selectedSubId1) {
      lineColor = COLORS.SUB1;
      textColor = COLORS.SUB1;
    } else if (hoveredId === selectedSubId2) {
      lineColor = COLORS.SUB2;
      textColor = COLORS.SUB2;
    }

    const instance = chartRef.current?.getEchartsInstance();
    if (instance) {
      instance.setOption({
        tooltip: {
          axisPointer: {
            crossStyle: { color: lineColor },
            label: { color: textColor },
          },
        },
      });
    }
  };

  const onChartClick = (params) => {
    const clickedChain = allChains.find((c) => c.name === params.name);
    if (clickedChain) {
      selectChain(clickedChain.id);
    }
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

      <div className="absolute top-4 right-5 z-10 group">
        <img
          src="/Icons/Frame 183.png"
          alt="Info"
          width="24"
          height="24"
          className="cursor-help opacity-70 hover:opacity-100 transition-opacity"
        />
        <div
          className="absolute right-0 top-8 w-[280px] p-3 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
          style={{ backgroundColor: COLORS.GRAY700 }}
        >
          <p
            className="font-suit text-[14px] font-medium leading-[140%] tracking-[-0.28px]"
            style={{ color: COLORS.GRAY300 }}
          >
            Circle size reflects the volume of proposals.
            <br />
            Chains are categorized into four tiers based on their ranking.
          </p>
        </div>
      </div>

      {option && (
        <ReactECharts
          ref={chartRef}
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'svg' }}
          onEvents={{
            click: onChartClick,
            mouseover: handleChartMouseOver,
          }}
        />
      )}
    </div>
  );
};

export default HempMap;
