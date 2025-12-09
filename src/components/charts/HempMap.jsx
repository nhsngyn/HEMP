import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import useChainStore from '../../store/useChainStore';
import { COLORS } from '../../constants/colors';

const HempMap = () => {
  const { allChains, selectedMainId, selectedSubId1, selectedSubId2 } = useChainStore();

  const option = useMemo(() => {
    if (!allChains || allChains.length === 0) return {};

    // 1. 선택 여부 확인 헬퍼 함수
    const getSelectionInfo = (id) => {
      if (id === selectedMainId) return { type: 'main', color: COLORS.MAIN, z: 100 };
      if (id === selectedSubId1) return { type: 'sub1', color: COLORS.SUB1, z: 90 };
      if (id === selectedSubId2) return { type: 'sub2', color: COLORS.SUB2, z: 90 };
      return null;
    };

    // 2. 버블 크기 계산 함수 (프로포절 개수 기준)
    const calculateBubbleSize = (proposalCount, isSelected) => {
      const count = proposalCount || 0;
      
      let size = (count * 0.5) + 25; 
      size = Math.min(Math.max(size, 25), 85);
      return isSelected ? size + 10 : size;
    };

    const seriesData = allChains.map((chain) => {
      const selection = getSelectionInfo(chain.id);
      const isSelected = !!selection;
      const hasAnySelection = selectedMainId || selectedSubId1 || selectedSubId2;
      
      const size = calculateBubbleSize(chain.proposals, isSelected);
      
      // 로고 이미지 경로 (데이터에 logoUrl이 있다고 가정)
      const logoUrl = chain.logoUrl || "";

      return {
        name: chain.name,
        value: [
          chain.score,        
          chain.participation || 0 
        ],
        
        // 1. 심볼은 투명한 원으로 설정
        symbol: 'circle',
        symbolSize: size, 

        // 2. 실제 이미지는 배경으로
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

        // 3. 스타일 설정
        itemStyle: {
          color: 'transparent', 
          
          // 선택 안 된 애들은 흐리게
          opacity: isSelected ? 1 : (hasAnySelection ? 0.3 : 0.9),
          
          borderColor: isSelected ? selection.color : 'transparent',
          borderWidth: isSelected ? 3 : 0,
          shadowBlur: isSelected ? 20 : 0,
          shadowColor: isSelected ? selection.color : 'transparent'
        },
        
        // Z-index: 선택된 게 위로 올라오게
        z: selection ? selection.z : 2
      };
    });

    return {
      backgroundColor: 'transparent',
      // 차트 여백 설정
      grid: {
        top: '12%', right: '8%', bottom: '12%', left: '8%',
        containLabel: true
      },
      // 툴팁 
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
      // X축 
      xAxis: {
        name: 'HEMP Score',
        type: 'value',
        scale: true, // 0부터 시작하지 않고 데이터 범위에 맞춤
        splitLine: { lineStyle: { color: '#2A2B30' } },
        axisLabel: { color: '#9CA3AF' },
        nameTextStyle: { color: '#9CA3AF', fontWeight: 'bold' }
      },
      // Y축
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