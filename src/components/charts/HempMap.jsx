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

  /* ---------------- chain map ---------------- */
  const chainMap = useMemo(() => {
    if (!allChains) return {};
    return allChains.reduce((acc, chain) => {
      acc[chain.name] = chain;
      return acc;
    }, {});
  }, [allChains]);

  /* ---------------- chart option ---------------- */
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
        backgroundColor: 'transparent',
        padding: 0,
        borderWidth: 0,

        axisPointer: {
          show: true,     
          type: 'cross',  
          snap: true,     
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

    chartRef.current?.getEchartsInstance().setOption({
      tooltip: {
        axisPointer: {
          crossStyle: { color: lineColor },
          label: { color: textColor },
        },
      },
    });
  };

  const handleChartMouseOut = () => {
    chartRef.current?.getEchartsInstance().setOption({
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
      {/* 🔥 [수정됨] 상단 타이틀 및 숫자 아이콘 */}
      <div className="absolute top-[20px] left-[12px] flex items-center gap-2 z-10 pointer-events-none">
        {/* 이미지 대신 직접 그린 원형 아이콘 */}
        <div
          className="flex items-center justify-center w-[18px] h-[18px] rounded-full text-white font-bold font-suit text-[11px] leading-none"
          style={{ backgroundColor: COLORS.GRAY700}}
        >
          1
        </div>
        <h3 className="text-white font-bold text-base font-suit">HEMP Map</h3>
      </div>
      
      {/* 인포메이션 툴팁 영역 (기존 유지) */}
      <div className="absolute top-5 right-5 z-50 group">
        <img
          src="/Icons/icn_info.svg"
          alt="Info"
          width="24"
          height="24"
          className="cursor-help opacity-70 hover:opacity-100 transition-opacity"
        />

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