import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import useChainStore from '../../store/useChainStore';
import useChainSelection from '../../hooks/useChainSelection';
import { BUBBLE_CHART } from '../../constants/chart';

const HempMap = () => {
  const { allChains } = useChainStore();
  
  // 선택된 체인 정보 및 핸들러 가져오기
  const { 
    selectChain,
    getSelectionInfo,
    selectedMainId, selectedSubId1, selectedSubId2
  } = useChainSelection();

  // 툴팁용 데이터 매핑 (체인 이름 -> 체인 객체)
  const chainMap = useMemo(() => {
    return allChains.reduce((acc, chain) => {
      acc[chain.name] = chain;
      return acc;
    }, {});
  }, [allChains]);

  const option = useMemo(() => {
    if (!allChains || allChains.length === 0) return {};

    const hasAnySelection = selectedMainId || selectedSubId1 || selectedSubId2;
    
    // ✨ 상수 파일에서 정의된 값 사용
    const { SIZES, THRESHOLDS } = BUBBLE_CHART;

    // 프로포절 개수 기준 버블 크기 계산 (고정 임계값 사용)
    const calculateBubbleSize = (proposalCount, isSelected) => {
      const count = proposalCount || 0;
      let baseSize;

      // Q3 이상 (Huge)
      if (count >= THRESHOLDS.Q3) {
        baseSize = SIZES.HUGE;
      } 
      // Q2 이상 (Large)
      else if (count >= THRESHOLDS.Q2) {
        baseSize = SIZES.LARGE;
      } 
      // Q1 이상 (Medium)
      else if (count >= THRESHOLDS.Q1) {
        baseSize = SIZES.MEDIUM;
      } 
      // 나머지 (Small)
      else {
        baseSize = SIZES.SMALL;
      }

      // 선택된 경우 크기 확대
      return isSelected ? baseSize + SIZES.SELECTED_OFFSET : baseSize;
    };

    const seriesData = allChains.map((chain) => {
      const selection = getSelectionInfo(chain.id);
      const isSelected = !!selection;

      const size = calculateBubbleSize(chain.proposals, isSelected);
      const logoUrl = chain.logoUrl || "";

      return {
        name: chain.name,
        // [X축: HEMP Score, Y축: Participation]
        value: [chain.score, chain.participation || 0],
        symbol: 'circle',
        symbolSize: size,
        
        // 버블 내부 로고 (Rich Text)
        label: {
          show: true,
          position: 'center',
          formatter: logoUrl ? '{logo|}' : '', // 로고 없으면 빈 문자열
          rich: {
            logo: {
              backgroundColor: { image: logoUrl },
              width: size * 0.9,
              height: size * 0.9,
              borderRadius: (size * 0.9) / 2, // 둥근 로고
            }
          }
        },
        
        // 스타일 설정
        itemStyle: {
          color: '#E5E7EB', // 기본 버블 색상 (연한 회색/흰색)
          
          // 선택 안 된 상태에서 다른 게 선택되어 있다면 흐리게 처리
          opacity: hasAnySelection && !isSelected ? 0.1 : 1,
          
          // 선택 시 테두리 색상 (Main/Sub 색상)
          borderColor: isSelected ? selection.color : 'transparent',
          borderWidth: isSelected ? 3 : 0,
          
          // 선택 시 그림자 효과
          shadowBlur: isSelected ? 15 : 0,
          shadowColor: isSelected ? selection.color : 'transparent'
        },
        // 선택된 버블이 항상 위에 오도록 Z-index 설정
        z: isSelected ? 100 : 2
      };
    });

    return {
      backgroundColor: 'transparent',
      textStyle: { fontFamily: 'SUIT' },
      grid: {
        top: '25%', right: '10%', bottom: '15%', left: '10%',
        containLabel: true
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(26, 27, 32, 0.95)',
        borderColor: '#4B5563',
        textStyle: { color: '#fff', fontFamily: 'SUIT' },
        formatter: (params) => {
          const chainData = chainMap[params.name]; 
          if (!chainData) return '';
          
          // 툴팁 내용 구성
          const logoImg = chainData.logoUrl 
            ? `<img src="${chainData.logoUrl}" style="width:20px;height:20px;vertical-align:middle;margin-right:8px;border-radius:50%;" />` 
            : '';

          return `
            <div style="font-weight:bold; margin-bottom:6px; font-size:14px; display:flex; align-items:center;">
              ${logoImg} ${params.name}
            </div>
            <div style="color:#9CA3AF; font-size:12px; line-height:1.6;">
              HEMP Score: <b style="color:white">${params.value[0]}</b><br/>
              Participation: <b style="color:white">${params.value[1]}%</b><br/>
              Proposals: <b style="color:#FCD34D">${chainData.proposals || 0}</b>
            </div>
          `;
        }
      },
      xAxis: {
        name: 'HEMP Score',
        nameLocation: 'middle',
        nameGap: 25,
        type: 'value',
        scale: true, // 0부터 시작하지 않음
        splitLine: { 
          show: true,
          lineStyle: { type: 'dashed', color: 'rgba(255,255,255,0.1)' } 
        },
        axisLabel: { color: '#6D7380', fontSize: 11 },
        nameTextStyle: { color: '#6D7380', fontSize: 11, fontWeight: 'bold' }
      },
      yAxis: {
        name: 'Participation',
        nameRotate: 90,
        nameLocation: 'middle',
        nameGap: 40,
        type: 'value',
        scale: true,
        splitLine: { 
          show: true,
          lineStyle: { type: 'dashed', color: 'rgba(255,255,255,0.1)' } 
        },
        axisLabel: { formatter: '{value}%', color: '#6D7380', fontSize: 11 },
        nameTextStyle: { color: '#6D7380', fontSize: 11, fontWeight: 'bold' }
      },
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
  }, [allChains, selectedMainId, selectedSubId1, selectedSubId2, getSelectionInfo, chainMap]);

  // 클릭 핸들러
  const onChartClick = (params) => {
    const clickedChain = allChains.find(c => c.name === params.name);
    if (clickedChain) {
      // 체인 선택 액션 실행
      selectChain(clickedChain.id);
    }
  };

  return (
    <div className="w-full h-full relative">
      {/* 차트 제목 (왼쪽 상단 배지 스타일) */}
      <div className="absolute top-4 left-5 flex items-center gap-2 z-10 pointer-events-none">
        <div 
          className="flex items-center justify-center rounded-full text-[11px] font-bold text-gray-300"
          style={{ width: '20px', height: '20px', backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          1
        </div>
        <h3 className="text-white font-bold text-base">
          HEMP Map
        </h3>
      </div>

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