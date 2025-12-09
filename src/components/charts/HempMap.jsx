import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import useChainStore from '../../store/useChainStore';
import useChainSelection from '../../hooks/useChainSelection'; // ✅ 만든 훅 Import

const HempMap = () => {
  // 1. 데이터 가져오기
  const { allChains } = useChainStore();
  
  // 2. 훅 사용하기
  const { 
    getSelectionInfo, 
    toggleChainSelection, 
    selectedMainId, 
    selectedSubId1, 
    selectedSubId2 
  } = useChainSelection();

  const option = useMemo(() => {
    if (!allChains || allChains.length === 0) return {};

    // 뭔가 하나라도 선택된 게 있는지 확인
    const hasAnySelection = selectedMainId || selectedSubId1 || selectedSubId2;

    // 버블 크기 계산 함수
    const calculateBubbleSize = (proposalCount, isSelected) => {
      const count = proposalCount || 0;
      let size = (count * 0.5) + 25; 
      size = Math.min(Math.max(size, 25), 85);
      return isSelected ? size + 10 : size;
    };

    // 3. 데이터 매핑
    const seriesData = allChains.map((chain) => {
      // 훅을 통해 선택 정보져오기
      const selection = getSelectionInfo(chain.id);
      const isSelected = !!selection;
      
      const size = calculateBubbleSize(chain.proposals, isSelected);
      const logoUrl = chain.logoUrl || "";

      return {
        name: chain.name,
        value: [chain.score, chain.participation || 0],
        
        // --- 스타일링 로직 ---
        symbol: 'circle',
        symbolSize: size, 

        // 이미지 마스킹 (원형 로고)
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
          color: 'transparent', // 심볼 투명화
          
          // 선택 안 된 것들은 흐리게 처리
          opacity: isSelected ? 1 : (hasAnySelection ? 0.3 : 0.85),
          
          // 선택된 것만 훅에서 가져온 색상으로 네온 효과
          borderColor: isSelected ? selection.color : 'transparent',
          borderWidth: isSelected ? 3 : 0,
          shadowBlur: isSelected ? 20 : 0,
          shadowColor: isSelected ? selection.color : 'transparent'
        },
        
        // 선택된 것이 더 위에 오도록 z-index 설정
        z: selection ? selection.z : 2
      };
    });

    return {
      backgroundColor: 'transparent',
      grid: {
        top: '12%', right: '8%', bottom: '12%', left: '8%',
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
  }, [allChains, selectedMainId, selectedSubId1, selectedSubId2, getSelectionInfo]); // getSelectionInfo 의존성 추가

  // ✅ 4. 클릭 이벤트 핸들러
  const onChartClick = (params) => {
    // 클릭된 데이터의 이름을 통해 ID 찾기
    const clickedChain = allChains.find(c => c.name === params.name);
    
    if (clickedChain) {
      console.log("버블 클릭:", clickedChain.name);
      // 선택 안 됐으면 빈 곳에 넣고, 됐으면 빼기
      toggleChainSelection(clickedChain.id);
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
        // 클릭 이벤트 연결
        onEvents={{
          click: onChartClick
        }}
      />
    </div>
  );
};

export default HempMap;