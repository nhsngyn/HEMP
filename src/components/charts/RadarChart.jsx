import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import useChainStore from '../../store/useChainStore';
import { COLORS } from '../../constants/colors';

// 상수 정의
const METRICS = [
  { key: 'vib', label: 'VIB', maxValue: 20 },
  { key: 'participation', label: 'Participation', maxValue: 20 },
  { key: 'rejection', label: 'Rejection Rate', maxValue: 20 },
  { key: 'stability', label: 'Stability', maxValue: 20 },
  { key: 'consensus', label: 'Consensus', maxValue: 20 },
];

const GRID_LEVELS = 5;
const PADDING = 60;
const LABEL_OFFSET = 30;

const RadarChart = () => {
  const svgRef = useRef(null);
  const radarContainerRef = useRef(null);
  const { allChains, selectedMainId, selectedSubId1, selectedSubId2 } = useChainStore();

  // 체인 데이터 배열로 통합
  const chains = useMemo(() => {
    const findChain = (id) => allChains.find(c => c.id === id);
    return {
      main: findChain(selectedMainId),
      sub1: findChain(selectedSubId1),
      sub2: findChain(selectedSubId2),
    };
  }, [allChains, selectedMainId, selectedSubId1, selectedSubId2]);

  const { main: mainChain, sub1: subChain1, sub2: subChain2 } = chains;

  // 메트릭 값 가져오기
  const getValue = (chain, metricKey) => {
    if (!chain) return 0;
    const value = chain[metricKey];
    return value != null ? Math.min(value, 20) : 0;
  };

  // 뷰포트 기반 폰트 크기 계산 (공통 함수)
  const getResponsiveFontSize = (baseMultiplier = 0.01, minSize = 12) => {
    const viewportSize = Math.min(window.innerWidth, window.innerHeight);
    return Math.max(minSize, viewportSize * baseMultiplier);
  };

  // 레이더 차트 그리기
  useEffect(() => {
    if (!svgRef.current || !radarContainerRef.current) return;

    const drawChart = () => {
      if (!svgRef.current || !radarContainerRef.current) return;

      d3.select(svgRef.current).selectAll('*').remove();

      const containerWidth = radarContainerRef.current.clientWidth;
      const containerHeight = radarContainerRef.current.clientHeight;

      if (containerWidth === 0 || containerHeight === 0) {
        setTimeout(drawChart, 100);
        return;
      }

      const svg = d3.select(svgRef.current);
      svg.attr('width', containerWidth).attr('height', containerHeight);

      // 메인 체인이 없을 때 메시지 표시
      if (!mainChain) {
        svg.append('text')
          .attr('x', containerWidth / 2)
          .attr('y', containerHeight / 2)
          .attr('text-anchor', 'middle')
          .attr('fill', '#9ca3af')
          .attr('font-size', `${getResponsiveFontSize()}px`)
          .text('Select a MAIN CHAIN to view Radar Chart');
        return;
      }

      // 차트 설정
      const size = Math.min(containerWidth, containerHeight) - PADDING * 2;
      const centerX = containerWidth / 2;
      const centerY = containerHeight / 2;
      const radius = size / 2;
      const numAxes = METRICS.length;
      const angleStep = (2 * Math.PI) / numAxes;

      // 스케일 생성
      const scales = METRICS.map(metric =>
        d3.scaleLinear().domain([0, metric.maxValue]).range([0, radius])
      );

      // 그리드 그리기
      const gridGroup = svg.append('g').attr('class', 'grid');
      const createLine = () => d3.line().x(d => d[0]).y(d => d[1]).curve(d3.curveLinearClosed);

      for (let level = 1; level <= GRID_LEVELS; level++) {
        const levelRadius = (radius * level) / GRID_LEVELS;
        const points = Array.from({ length: numAxes }, (_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          return [
            centerX + Math.cos(angle) * levelRadius,
            centerY + Math.sin(angle) * levelRadius
          ];
        });

        gridGroup.append('path')
          .attr('d', createLine()(points))
          .attr('fill', 'none')
          .attr('stroke', '#374151')
          .attr('stroke-width', 1)
          .attr('opacity', 0.3);
      }

      // 축 그리기
      const axesGroup = svg.append('g').attr('class', 'axes');
      METRICS.forEach((metric, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const endX = centerX + Math.cos(angle) * radius;
        const endY = centerY + Math.sin(angle) * radius;

        // 축 선
        axesGroup.append('line')
          .attr('x1', centerX).attr('y1', centerY)
          .attr('x2', endX).attr('y2', endY)
          .attr('stroke', '#4b5563')
          .attr('stroke-width', 1)
          .attr('opacity', 0.5);

        // 축 라벨
        axesGroup.append('text')
          .attr('x', centerX + Math.cos(angle) * (radius + LABEL_OFFSET))
          .attr('y', centerY + Math.sin(angle) * (radius + LABEL_OFFSET))
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', '#9ca3af')
          .attr('font-size', `${getResponsiveFontSize(0.006, 9)}px`)
          .attr('font-weight', '500')
          .text(metric.label);
      });

      // 폴리곤 생성 함수
      const createPolygon = (chain, color, opacity) => {
        if (!chain) return null;

        const points = METRICS.map((metric, i) => {
          const value = Math.min(getValue(chain, metric.key), metric.maxValue);
          const distance = scales[i](value);
          const angle = i * angleStep - Math.PI / 2;
          return [
            centerX + Math.cos(angle) * distance,
            centerY + Math.sin(angle) * distance
          ];
        });

        return { points, color, opacity, line: createLine() };
      };

      // 데이터 폴리곤 그리기 (배열로 통합)
      const dataGroup = svg.append('g').attr('class', 'data');
      const chainConfigs = [
        { chain: subChain2, color: COLORS.SUB2, opacity: 0.15, strokeWidth: 1.5, strokeOpacity: 0.6 },
        { chain: subChain1, color: COLORS.SUB1, opacity: 0.2, strokeWidth: 1.5, strokeOpacity: 0.7 },
        { chain: mainChain, color: COLORS.MAIN, opacity: 0.3, strokeWidth: 2, strokeOpacity: 0.9 },
      ];

      chainConfigs.forEach(config => {
        const polygon = createPolygon(config.chain, config.color, config.opacity);
        if (polygon) {
          dataGroup.append('path')
            .attr('d', polygon.line(polygon.points))
            .attr('fill', polygon.color)
            .attr('fill-opacity', polygon.opacity)
            .attr('stroke', polygon.color)
            .attr('stroke-width', config.strokeWidth)
            .attr('stroke-opacity', config.strokeOpacity);
        }
      });
    };

    drawChart();

    // Window resize 이벤트
    const handleResize = () => drawChart();
    window.addEventListener('resize', handleResize);

    // ResizeObserver로 컨테이너 크기 변경 감지 (더 정확함)
    const resizeObserver = new ResizeObserver(() => {
      drawChart();
    });

    if (radarContainerRef.current) {
      resizeObserver.observe(radarContainerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [mainChain, subChain1, subChain2]);

  // 점수 계산
  const { totalScore, scorePercentage } = useMemo(() => {
    if (!mainChain) return { totalScore: 0, scorePercentage: 0 };
    const total = METRICS.reduce((sum, metric) => sum + getValue(mainChain, metric.key), 0);
    const maxTotal = METRICS.reduce((sum, metric) => sum + metric.maxValue, 0);
    return {
      totalScore: total,
      scorePercentage: Math.round((total / maxTotal) * 100)
    };
  }, [mainChain]);

  if (!mainChain) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-400" style={{ fontSize: 'var(--font-size-lg)' }}>
          Select a MAIN CHAIN to view Radar Chart
        </p>
      </div>
    );
  }

  return (
    <div className="radar_arena w-full h-full flex gap-6 p-4 min-h-0">
      {/* 왼쪽: 레이더 차트 (60%) */}
      <div ref={radarContainerRef} className="h-full" style={{ width: '60%' }}>
        <svg ref={svgRef} className="w-full h-full" />
      </div>

      {/* 오른쪽: 점수 정보 (40%) */}
      <div className="info_arena h-full flex flex-col gap-2 min-h-0 overflow-hidden" style={{ width: '40%' }}>
        {/* Chain name badge */}
        <div className="flex  justify-start shrink-0">
          <div
            className="px-4 py-1.5 rounded-lg"
            style={{ backgroundColor: '#282a2e' }}
          >
            <span
              className="font-bold truncate block max-w-full"
              style={{
                color: '#80ff00',
                fontSize: 'var(--font-size-xs)'
              }}
            >
              {mainChain.name}
            </span>
          </div>
        </div>

        {/* HEMP Score 영역 (4/10) */}
        <div className="flex flex-col gap-1 min-h-0" style={{ flex: '4 0 0' }}>
          <div className="flex flex-col gap-1">
            <p
              className="text-gray-100 font-extrabold"
              style={{ fontSize: 'var(--font-size-base)' }}
            >
              HEMP Score
            </p>
            <div className="flex items-baseline justify-end gap-1">
              <span
                className="font-bold"
                style={{
                  color: COLORS.MAIN,
                  fontSize: 'var(--font-size-xl)'
                }}
              >
                {scorePercentage}
              </span>
              <span
                className="text-gray-500"
                style={{ fontSize: 'var(--font-size-sm)' }}
              >
                /100
              </span>
            </div>
          </div>
          {/* Divider */}
          <div className="border-t border-gray-600 mt-auto"></div>
        </div>

        {/* Individual metric scores 영역 (6/10) */}
        <div className="flex flex-col gap-2 min-h-0 overflow-hidden justify-around" style={{ flex: '6 0 0' }}>
          {METRICS.map(metric => {
            const value = getValue(mainChain, metric.key);
            return (
              <div key={metric.key} className="flex justify-between items-center mr-1">
                <span className="text-gray-300 font-extrabold" style={{ fontSize: 'var(--font-size-xs)' }}>
                  {metric.label}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-white justify-end font-extrabold" style={{ fontSize: 'var(--font-size-xs)' }}>
                    {Math.round(value)}
                  </span>
                  <span className="text-gray-500" style={{ fontSize: 'var(--font-size-xs)' }}>
                    /{metric.maxValue}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RadarChart;
