import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import useChainStore from '../../store/useChainStore';
import { COLORS } from '../../constants/colors';

const METRICS = [
  { key: 'vib', label: 'VIB (Validator Influence Balance)', maxValue: 26 },
  { key: 'participation', label: 'Participation', maxValue: 26 },
  { key: 'rejection', label: 'Success Rate', maxValue: 16 },
  { key: 'stability', label: 'Stability', maxValue: 16 },
  { key: 'consensus', label: 'Consensus', maxValue: 16 },
];

const CHART_CONFIG = {
  GRID_LEVELS: 5,
  PADDING: 70,
  LABEL_OFFSET: 40,
};

const CHAIN_CONFIGS = [
  { key: 'sub2', color: COLORS.SUB2, opacity: 0.2, strokeWidth: 1.5, strokeOpacity: 0.6 },
  { key: 'sub1', color: COLORS.SUB1, opacity: 0.2, strokeWidth: 1.5, strokeOpacity: 0.6 },
  { key: 'main', color: COLORS.MAIN, opacity: 0.2, strokeWidth: 1.5, strokeOpacity: 0.6 },
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

  // 지표별 최대값 헬퍼
  const getMetricMax = (metricKey) => {
    const metric = METRICS.find((m) => m.key === metricKey);
    return metric?.maxValue ?? 20;
  };

  // 메트릭 값 가져오기 (지표별 만점 기준으로 캡)
  const getValue = (chain, metricKey) => {
    if (!chain) return 0;
    const raw = chain[metricKey];
    const max = getMetricMax(metricKey);
    if (raw == null) return 0;
    return Math.min(raw, max);
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
      const centerX = containerWidth / 2 - 2;
      const centerY = containerHeight / 2 + 13;
      const radius = size / 1.5 * 0.9;
      const numAxes = METRICS.length;
      const angleStep = (2 * Math.PI) / numAxes;

      // 스케일 생성 (0~지표별 최대값 → 0~radius)
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
          const labelX = centerX + Math.cos(angle) * (radius + CHART_CONFIG.LABEL_OFFSET + 3);
          const labelY = centerY + Math.sin(angle) * (radius + CHART_CONFIG.LABEL_OFFSET - 10);

          if (metric.key === 'vib') {
            // VIB는 두 줄로 표시
            const textGroup = axesGroup.append('text')
              .attr('x', labelX)
              .attr('y', labelY)
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('fill', '#9ca3af')
              .attr('font-family', 'SUIT')
              .attr('font-size', '11px')
              .attr('font-weight', '700');

            textGroup.append('tspan')
              .attr('x', labelX)
              .attr('dy', '0em')
              .text('VIB (Validator');

            textGroup.append('tspan')
              .attr('x', labelX)
              .attr('dy', '1.2em')
              .text('Influence Balance)');
          } else {
            // 다른 메트릭은 한 줄로 표시
            axesGroup.append('text')
              .attr('x', labelX)
              .attr('y', labelY)
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('fill', '#9ca3af')
              .attr('font-family', 'SUIT')
              .attr('font-size', '11px')
              .attr('font-weight', '700')
              .text(metric.label);
          }
        });
      };

      // 폴리곤 생성 함수
      const createPolygon = (chain, useCenterPoint = false, useDefaultValue = false) => {
        if (!chain) return null;

        const points = METRICS.map((metric, i) => {
          let distance;
          if (useCenterPoint) {
            // 각 축의 중앙~약간 위에 배치 (0.6, 즉 60%)
            distance = radius * 0.6;
          } else if (useDefaultValue) {
            // 기본값 15 사용 (각 지표 만점 대비 비율로 정규화)
            const normalized = 15 / metric.maxValue; // 0~1
            distance = normalized * radius;
          } else {
            // 실제 값 반영 (0~1 범위로 정규화 후 반지름에 매핑)
            const value = getValue(chain, metric.key);
            const normalized = metric.maxValue > 0 ? value / metric.maxValue : 0; // 0~1
            distance = normalized * radius;
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
        // 항상 실제 median 값 반영
        const medianPolygon = createPolygon(medianChain, false, false);
        if (medianPolygon) {
          const medianStrokeColor = hasSelectedChain ? COLORS.GRAY500 : COLORS.GRAY300;
          const medianStrokeWidth = hasSelectedChain ? 0.7 : 1;

          dataGroup.append('path')
            .attr('d', medianPolygon.line(medianPolygon.points))
            .attr('fill', '#9CA3AE')
            .attr('fill-opacity', 0.03)
            .attr('stroke', medianStrokeColor)
            .attr('stroke-width', medianStrokeWidth)
            .attr('stroke-dasharray', '5,5')
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
              // 초기에는 중심에서 아주 작은 폴리곤으로 시작
              const initialPoints = polygon.points.map(([x, y]) => {
                const dx = x - centerX;
                const dy = y - centerY;
                const factor = 0.1; // 10% 크기에서 시작
                return [centerX + dx * factor, centerY + dy * factor];
              });

              const path = dataGroup.append('path')
                .attr('d', polygon.line(initialPoints))
                .attr('fill', config.color)
                .attr('fill-opacity', config.opacity)
                .attr('stroke', config.color)
                .attr('stroke-width', config.strokeWidth)
                .attr('stroke-opacity', config.strokeOpacity);

              // 메인/서브 체인이 선택되거나 변경될 때 부드럽게 확장되는 애니메이션
              path
                .transition()
                .duration(700)
                .ease(d3.easeCubicOut)
                .attr('d', polygon.line(polygon.points));
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
          className="flex items-center justify-center rounded-full text-caption1-sb"
          style={{
            width: '18px',
            height: '18px',
            backgroundColor: '#ffffff15',
            color: '#D1D5DB'
          }}
        >
          2
        </div>
        <h2
          className="text-body3-b"
          style={{ color: '#D1D5DB' }}
        >
          HEMP Comparison Radar Chart
        </h2>
      </div>
      {/* Chart area - original layout maintained */}
      <div
        className="radar_arena w-full h-full flex my-1 min-h-0"
        style={{
          gap: 'clamp(16px, 1.5vw, 24px)',
          padding: 'clamp(8px, 0.6vw, 12px)'
        }}
      >
        {/* 왼쪽: 레이더 차트 (60%) */}
        <div ref={radarContainerRef} className="h-full" style={{ width: '65%' }}>
          <svg ref={svgRef} className="w-full h-full mt-4" />
        </div>

        {/* Divider */}
        <div className="border-r border-gray-700 my-auto" style={{ height: '99%' }}></div>

        {/* 오른쪽: 점수 정보 (40%) */}
        <div
          className="info_arena h-full flex flex-col min-h-0 overflow-hidden"
          style={{
            width: '35%',
            gap: 'clamp(4px, 0.5vh, 8px)',
            paddingTop: 'clamp(2px, 0.6vw, 2px)',
            paddingBottom: 'clamp(2px, 0.6vw, 10px)',
            paddingLeft: 'clamp(2px, 0.7vw, 2px)',
            paddingRight: 'clamp(4px, 0.7vw, 6px)',
            boxSizing: 'border-box'
          }}
        >
          {/* Chain name badge 또는 Median 레이블 */}
          <div className="flex justify-start shrink-0">
            <div
              className="rounded-md shrink-0"
              style={{
                backgroundColor: '#282a2e',
                padding: 'clamp(2px, 0.25vw, 2px) clamp(8px, 0.7vw, 8px)',
                maxWidth: '100%',
                boxSizing: 'border-box'
              }}
            >
              {mainChain ? (
                <span
                  className="font-bold truncate block max-w-full"
                  style={{
                    color: '#80ff00',
                    fontSize: 'clamp(15px, 0.65vw, 13px)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: '500',
                    fontFamily: 'SUIT'
                  }}
                >
                  {mainChain.name}
                </span>
              ) : (
                <span
                  className="font-bold truncate block max-w-full"
                  style={{
                    color: '#9ca3af',
                    fontSize: 'clamp(14px, 0.65vw, 13px)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: '500',
                    fontFamily: 'SUIT'
                  }}
                >
                  Median
                </span>
              )}
            </div>
          </div>

          {/* HEMP Score 영역 (3.5/10) */}
          <div
            className="flex flex-col min-h-0 shrink-0"
            style={{
              flex: '3.5 0 0',
              gap: 'clamp(3px, 0.4vh, 6px)',
              maxHeight: '100%',
              overflow: 'hidden',
              justifyContent: 'flex-start'
            }}
          >
            <div className="flex flex-col shrink-0" style={{ gap: 'clamp(2px, 0.25vh, 4px)' }}>
              <p
                className="text-gray-100 font-bold shrink-0"
                style={{
                  fontSize: 'clamp(20px, 0.85vw, 20px)',
                  lineHeight: 'clamp(1.2, 1.3vh, 1.4)',
                  margin: 0
                }}
              >
                HEMP Score
              </p>
              <div
                className="flex items-baseline justify-end shrink-0"
                style={{
                  gap: 'clamp(1px, 0.12vw, 2px)',
                  // marginTop: 'clamp(8px, 0.5vh, 8px)'
                }}
              >
                <span
                  className="font-bold shrink-0"
                  style={{
                    color: mainChain ? COLORS.MAIN : '#FFFFFF',
                    fontSize: 'clamp(18px, 2.5vw, 30px)',
                    lineHeight: '1',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {scorePercentage}
                </span>
                <span
                  className="text-gray-500 shrink-0"
                  style={{
                    fontSize: 'clamp(18px, 0.75vw, 15px)',
                    lineHeight: 'clamp(1.2, 1.3vh, 1.4)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  /100
                </span>
              </div>
            </div>
            {/* Divider */}
            <div
              className="border-t border-gray-700 shrink-0 "
              style={{ marginTop: 'clamp(10px, 1.5vh, 8px)', marginRight: '1px' }}
            ></div>
          </div>

          {/* Individual metric scores 영역 (6.5/10) */}
          <div
            className="flex flex-col min-h-0 overflow-hidden"
            style={{
              flex: '6.5 0 0',
              gap: 'clamp(1px, 0.2vh, 3px)',
              maxHeight: '100%',
              justifyContent: 'space-between'
            }}
          >
            {METRICS.map(metric => {
              const value = getValue(displayChain, metric.key);
              // Score label에서는 VIB만 표시
              const displayLabel = metric.key === 'vib' ? 'VIB' : metric.label;
              return (
                <div
                  key={metric.key}
                  className="flex justify-between items-center shrink-0"
                  style={{
                    gap: 'clamp(6px, 0.8vw, 12px)',
                    paddingTop: 'clamp(0px, 0.1vh, 2px)',
                    paddingBottom: 'clamp(0px, 0.1vh, 2px)',
                    minHeight: 0,
                    flex: '1 1 0'
                  }}
                >
                  <span
                    className="text-gray-300 font-semibold shrink-0"
                    style={{
                      fontSize: 'clamp(15px, 0.7vw, 14px)',
                      lineHeight: 'clamp(1.2, 1.3vh, 1.4)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {displayLabel}
                  </span>
                  <div
                    className="flex items-baseline shrink-0"
                    style={{
                      gap: 'clamp(1px, 0.12vw, 2px)',
                      minWidth: '60px',
                      justifyContent: 'flex-end'
                    }}
                  >
                    <span
                      className="text-white font-semibold shrink-0"
                      style={{
                        fontSize: 'clamp(18px, 0.7vw, 12px)',
                        lineHeight: 'clamp(1.2, 1.3vh, 1.4)',
                        whiteSpace: 'nowrap',
                        textAlign: 'right',
                        display: 'inline-block',
                        minWidth: '20px'
                      }}
                    >
                      {Math.round(value)}
                    </span>
                    <span
                      className="text-gray-500 shrink-0"
                      style={{
                        fontSize: 'clamp(16px, 0.7vw, 14px)',
                        lineHeight: 'clamp(1.40, 1.3vh, 1.4)',
                        whiteSpace: 'nowrap'
                      }}
                    >
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
