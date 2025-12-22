import React, { useMemo, useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import useChainStore from '../../store/useChainStore';
import useChainSelection from '../../hooks/useChainSelection';
import { BUBBLE_CHART } from '../../constants/chart';
import { COLORS } from '../../constants/colors';

const HempMap = () => {
  const chartRef = useRef(null);

  const {
    allChains,
    selectedMainId,
    selectedSubId1,
    selectedSubId2,
  } = useChainStore();

  const { selectChain, getSelectionInfo } = useChainSelection();

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

    const { SIZES, THRESHOLDS } = BUBBLE_CHART;

    const calculateBubbleSize = (proposalCount, isSelected) => {
      const count = Number(proposalCount) || 0;
      let base;
      if (count >= THRESHOLDS.Q3) base = SIZES.HUGE;
      else if (count >= THRESHOLDS.Q2) base = SIZES.LARGE;
      else if (count >= THRESHOLDS.Q1) base = SIZES.MEDIUM;
      else base = SIZES.SMALL;
      return isSelected ? base + SIZES.SELECTED_OFFSET : base;
    };

    const seriesData = allChains.map((chain) => {
      const selection = getSelectionInfo(chain.id);
      const isSelected = Boolean(selection);
      const size = calculateBubbleSize(chain.proposals, isSelected);
      const logoUrl = chain.logoUrl;

      return {
        id: chain.id,
        name: chain.name,
        value: [
          Number(chain.score) || 0,
          Number(chain.participation) || 0,
        ],
        symbol: logoUrl ? `image://${logoUrl}` : 'circle',
        symbolSize: size,

        itemStyle: {
          opacity: isSelected ? 1 : 0.2,
          shadowBlur: isSelected ? 20 : 0,
          shadowColor: isSelected ? selection.color : 'transparent',
          color: logoUrl ? undefined : COLORS.WHITE,
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

    const axisLineStyle = {
      show: true,
      lineStyle: {
        color: COLORS.GRAY700,
        type: 'solid',
        width: 1,
      },
    };

    return {
      backgroundColor: 'transparent',
      animation: false,
      textStyle: { fontFamily: 'SUIT' },

      grid: {
        left: 83,
        right: 24,
        top: 48,
        bottom: 28,
        containLabel: false,
      },

      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        backgroundColor: 'transparent',
        padding: 0,
        borderWidth: 0,
        confine: true,
        alwaysShowContent: false,

        axisPointer: {
          show: true,
          type: 'cross',
          snap: true,
          link: [{ xAxisIndex: 'all' }],
          crossStyle: {
            type: 'dashed',
            width: 1,
            color: COLORS.GRAY300,
          },
          label: {
            show: true,
            backgroundColor: 'transparent',
            padding: 0,
            fontFamily: 'SUIT',
            fontSize: 14,
            fontWeight: 600,
            color: COLORS.WHITE,
            formatter: (params) => Math.round(params.value),
          },
        },

        formatter: (params) => {
          const chainData = chainMap[params.name];
          if (!chainData) return '';
          return `
            <div style="
              display:inline-flex;
              padding:4px 8px;
              gap:8px;
              border-radius:4px;
              background:${COLORS.GRAY700};
              margin-bottom: 8px;
            ">
              <span style="color:${COLORS.GRAY200}; font-size:12px;">Proposals</span>
              <span style="color:${COLORS.WHITE}; font-weight:600;">${chainData.proposals ?? 0}</span>
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
          padding: [12, 16, 0, 0],
        },
        type: 'value',
        scale: true,
        axisLabel: { show: false },
        axisTick: { show: false },
        axisLine: axisLineStyle,
        splitLine: {
          show: true,
          lineStyle: { type: 'dashed', color: 'rgba(255,255,255,0.1)' },
        },
        axisPointer: { show: true, snap: true }
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
        axisLine: axisLineStyle,
        splitLine: {
          show: true,
          lineStyle: { type: 'dashed', color: 'rgba(255,255,255,0.1)' },
        },
        axisPointer: { show: true, snap: true }
      },

      series: [
        {
          type: 'scatter',
          data: seriesData,
          cursor: 'pointer',
          large: true,
          progressive: 500,
          emphasis: {
            scale: false,
            itemStyle: {}
          }
        },
      ],
    };
  }, [
    allChains,
    selectedMainId,
    selectedSubId1,
    selectedSubId2,
    getSelectionInfo,
    chainMap,
  ]);

  /* ---------------- events ---------------- */

  const handleChartMouseOver = (params) => {
    if (params.componentType !== 'series') return;

    const echartsInstance = chartRef.current?.getEchartsInstance();
    if (!echartsInstance) return;

    const hoveredId = params.data.id;
    const hoveredData = params.data.value; // [x, y] 좌표
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

    // 버블의 좌표에 axisPointer 고정
    echartsInstance.dispatchAction({
      type: 'updateAxisPointer',
      currTrigger: 'mousemove',
      x: hoveredData[0],
      y: hoveredData[1],
    });

    echartsInstance.setOption({
      tooltip: {
        axisPointer: {
          crossStyle: { color: lineColor },
          label: { color: textColor },
        },
      },
    });
  };

  const handleChartMouseOut = () => {
    const echartsInstance = chartRef.current?.getEchartsInstance();
    if (!echartsInstance) return;

    echartsInstance.setOption({
      tooltip: {
        axisPointer: {
          crossStyle: { color: COLORS.GRAY300 },
          label: { color: COLORS.WHITE },
        },
      },
    });
  };

  const onChartClick = (params) => {
    const chain = allChains.find((c) => c.name === params.name);
    if (chain) selectChain(chain.id);
  };

  if (!option) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        Loading Chart…
      </div>
    );
  }

  return (
    <div className="w-full h-full relative p-[12px]">
      <div className="absolute top-0 left-0 z-10 flex items-center gap-3 px-4 py-3">
        <div
          className="flex items-center justify-center rounded-full text-caption1-sb"
          style={{
            width: '18px',
            height: '18px',
            backgroundColor: '#ffffff15',
            color: '#D1D5DB'
          }}
        >
          1
        </div>
        <h2
          className="text-body3-b"
          style={{ color: '#D1D5DB' }}
        >
          HEMP Map
        </h2>
      </div>

      {/* 인포메이션 툴팁 영역 (기존 유지) */}
      <div className="absolute top-5 right-5 z-50 group">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="cursor-help opacity-70 hover:opacity-100 transition-opacity"
        >
          <circle cx="12" cy="12" r="7.5" stroke="#6D7380" />
          <circle cx="12" cy="8.2832" r="0.75" fill="#6D7380" />
          <rect x="11.25" y="10.166" width="1.5" height="6.30078" rx="0.75" fill="#6D7380" />
        </svg>

        <div
          className="
            absolute
            right-5
            w-max
            max-w-[370px]
            p-2
            rounded-lg
            shadow-xl
            opacity-0
            group-hover:opacity-100
            transition-opacity
            duration-200
            pointer-events-none
          "
          style={{ backgroundColor: COLORS.GRAY700 }}
        >
          <p
            className="font-suit text-[12px] font-medium leading-[140%] text-left"
            style={{ color: COLORS.GRAY300 }}
          >
            Circle size reflects the volume of proposals.<br />
            Chains are categorized into four tiers based on their ranking.
          </p>
        </div>
      </div>

      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ width: '100%', height: '100%' }}
        opts={{ renderer: 'canvas' }}
        onEvents={{
          click: onChartClick,
          mouseover: handleChartMouseOver,
          mouseout: handleChartMouseOut,
        }}
      />
    </div>
  );
};

export default HempMap;