import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import useChainStore from '../../store/useChainStore';
import { COLORS } from '../../constants/colors';

// 상수 정의
const METRICS = [
  { key: 'vib', label: 'VIB (Validator Influence Balance)', maxValue: 20 },
  { key: 'participation', label: 'Participation', maxValue: 20 },
  { key: 'rejection', label: 'Success Rate', maxValue: 20 },
  { key: 'stability', label: 'Stability', maxValue: 20 },
  { key: 'consensus', label: 'Consensus', maxValue: 20 },
];

const CHART_CONFIG = {
  GRID_LEVELS: 5,
  PADDING: 60,
  LABEL_OFFSET: 30,
};

const CHAIN_CONFIGS = [
  { key: 'sub2', color: COLORS.SUB2, opacity: 0.2, strokeWidth: 1.5, strokeOpacity: 0.7 },
  { key: 'sub1', color: COLORS.SUB1, opacity: 0.2, strokeWidth: 1.5, strokeOpacity: 0.7 },
  { key: 'main', color: COLORS.MAIN, opacity: 0.3, strokeWidth: 2, strokeOpacity: 0.9 },
];

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

  // 모든 체인의 중앙값 계산
  const medianValues = useMemo(() => {
    if (!allChains || allChains.length === 0) {
      return METRICS.reduce((acc, metric) => {
        acc[metric.key] = 0;
        return acc;
      }, {});
    }

    const medians = {};
    METRICS.forEach(metric => {
      const values = allChains
        .map(chain => getValue(chain, metric.key))
        .filter(v => v > 0)
        .sort((a, b) => a - b);

      if (values.length === 0) {
        medians[metric.key] = 0;
      } else if (values.length % 2 === 0) {
        // 짝수 개일 때 중간 두 값의 평균
        const mid = values.length / 2;
        medians[metric.key] = (values[mid - 1] + values[mid]) / 2;
      } else {
        // 홀수 개일 때 중간 값
        medians[metric.key] = values[Math.floor(values.length / 2)];
      }
    });

    return medians;
  }, [allChains]);

  // 중앙값으로 만든 가상 체인 객체
  const medianChain = useMemo(() => {
    return {
      name: 'Median',
      ...medianValues
    };
  }, [medianValues]);

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

      // 차트 설정
      const size = Math.min(containerWidth, containerHeight) - CHART_CONFIG.PADDING * 2;
      const centerX = containerWidth / 2;
      const centerY = containerHeight / 2;
      const radius = size / 2;
      const numAxes = METRICS.length;
      const angleStep = (2 * Math.PI) / numAxes;

      // 스케일 생성
      const scales = METRICS.map(metric =>
        d3.scaleLinear().domain([0, metric.maxValue]).range([0, radius])
      );

      // 라인 생성 함수
      const createLine = () => d3.line().x(d => d[0]).y(d => d[1]).curve(d3.curveLinearClosed);

      // 그리드 그리기
      const drawGrid = () => {
        const gridGroup = svg.append('g').attr('class', 'grid');
        for (let level = 1; level <= CHART_CONFIG.GRID_LEVELS; level++) {
          const levelRadius = (radius * level) / CHART_CONFIG.GRID_LEVELS;
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
      };

      // 축 그리기
      const drawAxes = () => {
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
            .attr('x', centerX + Math.cos(angle) * (radius + CHART_CONFIG.LABEL_OFFSET))
            .attr('y', centerY + Math.sin(angle) * (radius + CHART_CONFIG.LABEL_OFFSET))
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#9ca3af')
            .attr('font-size', 'var(--font-size-xs)')
            .attr('font-weight', '500')
            .text(metric.label);
        });
      };

      // 폴리곤 생성 함수
      const createPolygon = (chain, useCenterPoint = false, useDefaultValue = false) => {
        if (!chain) return null;

        const points = METRICS.map((metric, i) => {
          let distance;
          if (useCenterPoint) {
            // 중앙에 작은 점으로 표시 (값 반영 없음)
            distance = radius * 0.05; // 반지름의 5% 크기
          } else if (useDefaultValue) {
            // 기본값 15 사용
            distance = scales[i](15);
          } else {
            // 실제 값 반영
            const value = Math.min(getValue(chain, metric.key), metric.maxValue);
            distance = scales[i](value);
          }
          const angle = i * angleStep - Math.PI / 2;
          return [
            centerX + Math.cos(angle) * distance,
            centerY + Math.sin(angle) * distance
          ];
        });

        return { points, line: createLine() };
      };

      // 데이터 폴리곤 그리기
      const drawPolygons = () => {
        const dataGroup = svg.append('g').attr('class', 'data');

        // 중앙값 폴리곤을 항상 먼저 그리기 (배경 레이어)
        const hasSelectedChain = !!mainChain;
        // 체인 선택 전: 기본값 15, 체인 선택 후: 실제 median 값 반영
        const medianPolygon = createPolygon(medianChain, false, !hasSelectedChain);
        if (medianPolygon) {
          const medianStrokeColor = hasSelectedChain ? COLORS.GRAY400 : COLORS.GRAY300;
          const medianStrokeWidth = hasSelectedChain ? 0.7 : 1;

          dataGroup.append('path')
            .attr('d', medianPolygon.line(medianPolygon.points))
            .attr('fill', '#282a2e')
            .attr('fill-opacity', 0.5)
            .attr('stroke', medianStrokeColor)
            .attr('stroke-width', medianStrokeWidth)
            .attr('stroke-dasharray', '4,4')
            .attr('stroke-opacity', 0.8)

            .lower(); // 배경 레이어로 이동
        }

        // 메인 체인이 있으면 메인/서브 체인 폴리곤 그리기 (위 레이어)
        if (mainChain) {
          const chainMap = { sub2: subChain2, sub1: subChain1, main: mainChain };
          CHAIN_CONFIGS.forEach(config => {
            const chain = chainMap[config.key];
            const polygon = createPolygon(chain);
            if (polygon) {
              dataGroup.append('path')
                .attr('d', polygon.line(polygon.points))
                .attr('fill', config.color)
                .attr('fill-opacity', config.opacity)
                .attr('stroke', config.color)
                .attr('stroke-width', config.strokeWidth)
                .attr('stroke-opacity', config.strokeOpacity);
            }
          });
        }
      };

      // 차트 그리기 실행
      drawGrid();
      drawAxes();
      drawPolygons();
    };

    // Initial render
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
  }, [mainChain, subChain1, subChain2, medianChain]);

  // 점수 계산 (메인 체인이 없으면 중앙값 사용)
  const { scorePercentage, displayChain } = useMemo(() => {
    const chain = mainChain || medianChain;
    if (!chain) return { scorePercentage: 0, displayChain: null };
    const total = METRICS.reduce((sum, metric) => sum + getValue(chain, metric.key), 0);
    const maxTotal = METRICS.reduce((sum, metric) => sum + metric.maxValue, 0);
    return {
      scorePercentage: Math.round((total / maxTotal) * 100),
      displayChain: chain
    };
  }, [mainChain, medianChain]);


  return (
    <div className="w-full h-full relative">
      {/* Title with icon - absolute positioned */}
      <div className="absolute top-0 left-0 z-10 flex items-center gap-3 px-4 py-3">

        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: '20px',
            height: '20px',
            backgroundColor: '#4C5564',
            color: '#9CA3AF',
            fontSize: '12px',
            fontWeight: '400'
          }}
        >
          2
        </div>
        <h2
          className="text-white font-semibold " style={{ fontSize: '13px' }}
        >
          HEMP Comparison Radar Chart
        </h2>
      </div>
      {/* Chart area - original layout maintained */}
      <div className="radar_arena w-full h-full flex gap-6 my-1 p-3 min-h-0">
        {/* 왼쪽: 레이더 차트 (60%) */}
        <div ref={radarContainerRef} className="h-full" style={{ width: '60%' }}>
          <svg ref={svgRef} className="w-full h-full mt-2" />
        </div>

        {/* Divider */}
        <div className="border-r border-gray-700 h-full mt-auto"></div>

        {/* 오른쪽: 점수 정보 (40%) */}
        <div className="info_arena h-full flex flex-col gap-2 min-h-0 overflow-hidden" style={{ width: '40%' }}>
          {/* Chain name badge 또는 Median 레이블 */}
          <div className="flex justify-start shrink-0">
            <div
              className="px-4 py-1.5 rounded-lg"
              style={{ backgroundColor: '#282a2e' }}
            >
              {mainChain ? (
                <span
                  className="font-bold truncate block max-w-full"
                  style={{
                    color: '#80ff00',
                    fontSize: 'var(--font-size-xs)'
                  }}
                >
                  {mainChain.name}
                </span>
              ) : (
                <span
                  className="font-bold truncate block max-w-full"
                  style={{
                    color: '#9ca3af',
                    fontSize: 'var(--font-size-xs)'
                  }}
                >
                  Median
                </span>
              )}
            </div>
          </div>

          {/* HEMP Score 영역 (4/10) */}
          <div className="flex flex-col gap-1 min-h-0" style={{ flex: '4 0 0' }}>
            <div className="flex flex-col gap-1">
              <p
                className="text-gray-100 font-extrabold"
                style={{ fontSize: 'var(--font-size-sm)' }}
              >
                HEMP Score
              </p>
              <div className="flex items-baseline justify-end gap-1">
                <span
                  className="font-bold"
                  style={{
                    color: mainChain ? COLORS.MAIN : '#FFFFFF',
                    fontSize: 'var(--font-size-lg)'
                  }}
                >
                  {scorePercentage}
                </span>
                <span
                  className="text-gray-500"
                  style={{ fontSize: 'var(--font-size-xs)' }}
                >
                  /100
                </span>
              </div>
            </div>
            {/* Divider */}
            <div className="border-t border-gray-700 mt-2"></div>
          </div>

          {/* Individual metric scores 영역 (6/10) */}
          <div className="flex flex-col gap-1 min-h-0" style={{ flex: '6 0 0' }}>
            {METRICS.map(metric => {
              const value = getValue(displayChain, metric.key);
              // Score label에서는 VIB만 표시
              const displayLabel = metric.key === 'vib' ? 'VIB' : metric.label;
              return (
                <div key={metric.key} className="flex justify-between items-center shrink-0">
                  <span className="text-gray-300 font-extrabold" style={{ fontSize: 'var(--font-size-xs)' }}>
                    {displayLabel}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-white font-extrabold" style={{ fontSize: 'var(--font-size-xs)' }}>
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
    </div >
  );
};

export default RadarChart;
