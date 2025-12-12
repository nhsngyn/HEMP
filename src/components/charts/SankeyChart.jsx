import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import useChainStore from '../../store/useChainStore';
import { COLORS } from '../../constants/colors';

// 타입별 색상 팔레트 (무지개 7색 + 기타 회색)
const TYPE_COLORS = {
  'Parameter Change': '#FF6B6B',    // 빨강
  'Software Upgrade': '#FF8E53',    // 주황
  'Text Proposal': '#FFD93D',       // 노랑
  'Governance': '#6BCF7F',          // 초록
  'Tokenomics': '#4D96FF',          // 파랑
  'Security': '#9B59B6',            // 남색
  'Other': '#9CA3AF'                // 회색 (기타)
};

// Generate Sankey data for Proposition Configuration Flow
// 5 columns: Type -> Participation Level -> Vote Composition -> Result -> Processing Speed
const generateSankeyData = (mainChain) => {
  if (!mainChain) {
    return { nodes: [], links: [] };
  }

  // Column 1: Type (7 partitions)
  const types = [
    'Parameter Change',
    'Software Upgrade',
    'Text Proposal',
    'Governance',
    'Tokenomics',
    'Security',
    'Other'
  ];

  // Column 2: Participation Level (4 partitions)
  const participationLevels = [
    'High',
    'Medium',
    'Low',
    'Very Low'
  ];

  // Column 3: Vote Composition (4 partitions)
  const voteCompositions = [
    'Yes Dominant',
    'Balanced',
    'No Dominant',
    'Abstain Heavy'
  ];

  // Column 4: Result (4 partitions - accept, rejected, etc 3 degree)
  const results = [
    'Passed',
    'Rejected',
    'Pending',
    'Withdrawn'
  ];

  // Column 5: Processing Speed (4 partitions)
  const processingSpeeds = [
    'Fast',
    'Medium',
    'Slow',
    'Very Slow'
  ];

  // Create nodes for all columns
  // 타입 노드에는 타입 정보를 저장
  const nodes = [
    ...types.map(name => ({ name, column: 0, type: name })),
    ...participationLevels.map(name => ({ name, column: 1, type: null })),
    ...voteCompositions.map(name => ({ name, column: 2, type: null })),
    ...results.map(name => ({ name, column: 3, type: null })),
    ...processingSpeeds.map(name => ({ name, column: 4, type: null })),
  ];

  // 타입 인덱스를 타입 이름으로 매핑
  const typeIndexToName = types;

  // 각 노드의 타입을 추적하는 함수 (타입 컬럼까지 거슬러 올라가기)
  const getNodeType = (nodeIndex, allLinks) => {
    const node = nodes[nodeIndex];
    // 타입 컬럼이면 바로 반환
    if (node.column === 0) {
      return node.name;
    }
    // 이전 컬럼의 링크를 찾아서 타입 추적
    const incomingLinks = allLinks.filter(l => l.target === nodeIndex);
    if (incomingLinks.length > 0) {
      return getNodeType(incomingLinks[0].source, allLinks);
    }
    return 'Other'; // 기본값
  };

  // Create links between columns
  const links = [];

  // Type -> Participation Level
  links.push(
    { source: 0, target: 7, value: 45, type: typeIndexToName[0] },   // Parameter Change -> High
    { source: 0, target: 8, value: 30, type: typeIndexToName[0] },  // Parameter Change -> Medium
    { source: 0, target: 9, value: 15, type: typeIndexToName[0] },  // Parameter Change -> Low
    { source: 1, target: 7, value: 60, type: typeIndexToName[1] }, // Software Upgrade -> High
    { source: 1, target: 8, value: 25, type: typeIndexToName[1] },  // Software Upgrade -> Medium
    { source: 1, target: 9, value: 10, type: typeIndexToName[1] },  // Software Upgrade -> Low
    { source: 2, target: 8, value: 35, type: typeIndexToName[2] },  // Text Proposal -> Medium
    { source: 2, target: 9, value: 40, type: typeIndexToName[2] },  // Text Proposal -> Low
    { source: 2, target: 10, value: 5, type: typeIndexToName[2] },  // Text Proposal -> Very Low
    { source: 3, target: 7, value: 20, type: typeIndexToName[3] },  // Governance -> High
    { source: 3, target: 8, value: 30, type: typeIndexToName[3] },  // Governance -> Medium
    { source: 4, target: 7, value: 15, type: typeIndexToName[4] },  // Tokenomics -> High
    { source: 4, target: 8, value: 25, type: typeIndexToName[4] },  // Tokenomics -> Medium
    { source: 5, target: 7, value: 50, type: typeIndexToName[5] },   // Security -> High
    { source: 5, target: 8, value: 20, type: typeIndexToName[5] },   // Security -> Medium
    { source: 6, target: 8, value: 20, type: typeIndexToName[6] },  // Other -> Medium
    { source: 6, target: 9, value: 15, type: typeIndexToName[6] },  // Other -> Low
  );

  // 각 노드의 타입을 미리 계산하여 저장
  const nodeTypeMap = new Map();
  nodes.forEach((node, i) => {
    if (node.column === 0) {
      nodeTypeMap.set(i, node.name);
    }
  });

  // Participation Level -> Vote Composition
  // source 노드로 들어오는 링크의 타입을 찾아서 저장
  const participationLinks = [
    { source: 7, target: 11, value: 80 },  // High -> Yes Dominant
    { source: 7, target: 12, value: 40 },  // High -> Balanced
    { source: 8, target: 12, value: 60 },  // Medium -> Balanced
    { source: 8, target: 13, value: 30 },  // Medium -> No Dominant
    { source: 9, target: 12, value: 30 },  // Low -> Balanced
    { source: 9, target: 13, value: 40 },  // Low -> No Dominant
    { source: 9, target: 14, value: 10 },  // Low -> Abstain Heavy
    { source: 10, target: 13, value: 20 }, // Very Low -> No Dominant
    { source: 10, target: 14, value: 5 },  // Very Low -> Abstain Heavy
  ];
  participationLinks.forEach(link => {
    // source 노드로 들어오는 링크 중 가장 큰 value를 가진 링크의 타입 사용
    const incomingToSource = links.filter(l => l.target === link.source);
    const linkType = incomingToSource.length > 0
      ? (incomingToSource.sort((a, b) => (b.value || 0) - (a.value || 0))[0].type || 'Other')
      : 'Other';
    links.push({ ...link, type: linkType });
  });

  // Vote Composition -> Result
  const voteLinks = [
    { source: 11, target: 15, value: 100 }, // Yes Dominant -> Passed
    { source: 11, target: 16, value: 20 },  // Yes Dominant -> Rejected
    { source: 12, target: 15, value: 70 }, // Balanced -> Passed
    { source: 12, target: 16, value: 50 }, // Balanced -> Rejected
    { source: 12, target: 17, value: 20 },  // Balanced -> Pending
    { source: 13, target: 16, value: 80 }, // No Dominant -> Rejected
    { source: 13, target: 15, value: 10 }, // No Dominant -> Passed
    { source: 14, target: 16, value: 10 }, // Abstain Heavy -> Rejected
    { source: 14, target: 17, value: 5 },  // Abstain Heavy -> Pending
  ];
  voteLinks.forEach(link => {
    const incomingToSource = links.filter(l => l.target === link.source && l.type);
    const linkType = incomingToSource.length > 0
      ? (incomingToSource.sort((a, b) => (b.value || 0) - (a.value || 0))[0].type || 'Other')
      : 'Other';
    links.push({ ...link, type: linkType });
  });

  // Result -> Processing Speed
  const resultLinks = [
    { source: 15, target: 19, value: 120 }, // Passed -> Fast
    { source: 15, target: 20, value: 50 },  // Passed -> Medium
    { source: 15, target: 21, value: 10 },  // Passed -> Slow
    { source: 16, target: 20, value: 60 },  // Rejected -> Medium
    { source: 16, target: 21, value: 50 },  // Rejected -> Slow
    { source: 16, target: 22, value: 20 }, // Rejected -> Very Slow
    { source: 17, target: 20, value: 15 },  // Pending -> Medium
    { source: 17, target: 21, value: 10 },  // Pending -> Slow
    { source: 18, target: 21, value: 5 },   // Withdrawn -> Slow
    { source: 18, target: 22, value: 5 },   // Withdrawn -> Very Slow
  ];
  resultLinks.forEach(link => {
    const incomingToSource = links.filter(l => l.target === link.source && l.type);
    const linkType = incomingToSource.length > 0
      ? (incomingToSource.sort((a, b) => (b.value || 0) - (a.value || 0))[0].type || 'Other')
      : 'Other';
    links.push({ ...link, type: linkType });
  });

  return { nodes, links };
};

const SankeyChart = ({ width = 1400, height = 800 }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const { allChains, selectedMainId } = useChainStore();

  // Get main chain data
  const mainChain = useMemo(() => {
    return allChains.find(c => c.id === selectedMainId);
  }, [allChains, selectedMainId]);

  // Generate Sankey data from main chain
  const sankeyData = useMemo(() => {
    return generateSankeyData(mainChain);
  }, [mainChain]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const drawChart = () => {
      if (!svgRef.current || !containerRef.current) return;

      // Clear previous render
      d3.select(svgRef.current).selectAll('*').remove();

      const containerWidth = containerRef.current.clientWidth || width;
      const containerHeight = containerRef.current.clientHeight || height;

      if (containerWidth === 0 || containerHeight === 0) {
        setTimeout(drawChart, 100);
        return;
      }

      // If no main chain selected, show message
      if (!mainChain || sankeyData.nodes.length === 0) {
        const svg = d3.select(svgRef.current);
        svg.attr('width', containerWidth).attr('height', containerHeight);

        svg.append('text')
          .attr('x', containerWidth / 2)
          .attr('y', containerHeight / 2)
          .attr('text-anchor', 'middle')
          .attr('fill', '#9ca3af')
          .attr('font-size', '18px')
          .text('Select a MAIN CHAIN to view Sankey diagram');
        return;
      }

      // Add padding for better visualization
      const padding = { top: 20, right: 20, bottom: 20, left: 20 };
      const chartWidth = containerWidth - padding.left - padding.right;
      const chartHeight = containerHeight - padding.top - padding.bottom;

      const svg = d3.select(svgRef.current);
      svg.attr('width', containerWidth).attr('height', containerHeight);

      // 원본 데이터 저장 (타입 정보 추적용)
      const originalNodes = sankeyData.nodes.map((d, i) => ({
        index: i,
        name: d.name,
        column: d.column,
        type: d.type || null
      }));

      const originalLinks = sankeyData.links.map(d => ({
        sourceIndex: typeof d.source === 'number' ? d.source : d.source.index,
        targetIndex: typeof d.target === 'number' ? d.target : d.target.index,
        source: d.source,
        target: d.target,
        value: d.value,
        type: d.type || null
      }));

      // Create a deep copy of the data to avoid mutating the original
      const dataCopy = {
        nodes: sankeyData.nodes.map((d, i) => ({
          name: d.name,
          column: d.column,
          type: d.type || null,
          originalIndex: i
        })),
        links: sankeyData.links.map(d => ({
          source: d.source,
          target: d.target,
          value: d.value,
          type: d.type || null
        }))
      };

      // Create Sankey generator
      const sankeyGenerator = sankey()
        .nodeWidth(20)
        .nodePadding(8)
        .extent([[padding.left, padding.top], [chartWidth + padding.left, chartHeight + padding.top]]);

      // Process the data (sankey modifies the data in place)
      const graph = sankeyGenerator(dataCopy);
      const { nodes, links } = graph;

      // 노드 인덱스 매핑 생성 (원본 인덱스 -> sankey 처리 후 노드)
      const nodeIndexMap = new Map();
      nodes.forEach((node, i) => {
        // 원본 노드 찾기 (name으로 매칭)
        const originalNode = originalNodes.find(n => n.name === node.name);
        if (originalNode) {
          node.column = originalNode.column;
          node.type = originalNode.type;
          nodeIndexMap.set(originalNode.index, node);
        }
      });

      // 노드 색상 함수 (타입별로 색상 적용)
      const getNodeColor = (node) => {
        // 첫 번째 컬럼(column 0)은 타입이므로 타입별 색상 사용
        if (node.column === 0) {
          return TYPE_COLORS[node.name] || COLORS.GRAY500;
        }
        // 다른 컬럼은 회색 계열
        return COLORS.GRAY500;
      };

      // 링크 색상 함수: 원본 링크 데이터를 기반으로 타입 찾기
      const getLinkColor = (link) => {
        // 링크에 이미 type이 저장되어 있으면 사용
        if (link.type) {
          return TYPE_COLORS[link.type] || COLORS.GRAY500;
        }

        // source 노드에서 타입 컬럼까지 거슬러 올라가서 타입 찾기
        const findTypeFromNode = (node, visited = new Set()) => {
          // 무한 루프 방지
          if (visited.has(node)) {
            return 'Other';
          }
          visited.add(node);

          // 타입 컬럼(column 0)이면 바로 타입 이름 반환
          if (node.column === 0) {
            return node.name;
          }

          // 이전 컬럼으로 연결된 링크를 찾아서 타입 추적
          // 여러 incoming link가 있을 수 있으므로, 가장 큰 value를 가진 링크의 타입 사용
          const incomingLinks = links.filter(l => l.target === node);
          if (incomingLinks.length > 0) {
            // value가 큰 순서로 정렬하여 가장 큰 링크의 타입 사용
            const sortedLinks = incomingLinks.sort((a, b) => (b.value || 0) - (a.value || 0));
            return findTypeFromNode(sortedLinks[0].source, visited);
          }

          // 타입을 찾을 수 없으면 기본값
          return 'Other';
        };

        // source 노드에서 시작해서 타입 컬럼까지 거슬러 올라가기
        const linkType = findTypeFromNode(link.source);
        return TYPE_COLORS[linkType] || COLORS.GRAY500;
      };

      // Draw links
      const link = svg
        .append('g')
        .attr('class', 'links')
        .selectAll('path')
        .data(links)
        .enter()
        .append('path')
        .attr('d', sankeyLinkHorizontal())
        .attr('stroke', (d) => {
          const linkColor = getLinkColor(d);
          // 원래 색상을 직접 사용하여 더 선명하게
          return linkColor;
        })
        .attr('stroke-width', (d) => Math.max(1, d.width))
        .attr('fill', 'none')
        .attr('opacity', 0.6)
        .on('mouseover', function (event, d) {
          d3.select(this).attr('opacity', 0.9);
          // Show tooltip
          const tooltip = svg
            .append('g')
            .attr('class', 'tooltip')
            .attr('transform', `translate(${event.offsetX}, ${event.offsetY})`);

          tooltip
            .append('rect')
            .attr('x', -60)
            .attr('y', -30)
            .attr('width', 120)
            .attr('height', 25)
            .attr('fill', 'rgba(0, 0, 0, 0.85)')
            .attr('rx', 4);

          tooltip
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('fill', 'white')
            .attr('y', -12)
            .attr('font-size', '11px')
            .text(`Value: ${d.value.toFixed(1)}`);
        })
        .on('mouseout', function () {
          d3.select(this).attr('opacity', 0.6);
          svg.select('.tooltip').remove();
        });

      // Draw nodes
      const node = svg
        .append('g')
        .attr('class', 'nodes')
        .selectAll('g')
        .data(nodes)
        .enter()
        .append('g');

      node
        .append('rect')
        .attr('x', (d) => d.x0)
        .attr('y', (d) => d.y0)
        .attr('height', (d) => d.y1 - d.y0)
        .attr('width', (d) => d.x1 - d.x0)
        .attr('fill', (d) => getNodeColor(d))
        .attr('opacity', 0.85)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .on('mouseover', function (event, d) {
          d3.select(this).attr('opacity', 1);
        })
        .on('mouseout', function () {
          d3.select(this).attr('opacity', 0.85);
        });

      // Add labels at the top of each node
      const midX = (padding.left + chartWidth + padding.left) / 2;

      node
        .append('text')
        .attr('x', (d) => (d.x0 + d.x1) / 2)
        .attr('y', (d) => d.y0 - 5)
        .attr('dy', '0')
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('fill', '#e5e7eb')
        .attr('font-weight', '400')
        .text((d) => d.name);

      // Add column labels at the top
      const columnLabels = ['Type', 'Participation Level', 'Vote Composition', 'Result', 'Processing Speed'];
      const columnCount = 5;
      const columnWidth = chartWidth / columnCount;

      columnLabels.forEach((label, i) => {
        svg.append('text')
          .attr('x', padding.left + i * columnWidth + columnWidth / 2)
          .attr('y', padding.top - 10)
          .attr('text-anchor', 'middle')
          .attr('fill', '#9ca3af')
          .attr('font-size', '12px')
          .attr('font-weight', '600')
          .text(label);
      });

    };

    // Initial render
    drawChart();

    // Resize handler
    const handleResize = () => {
      drawChart();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [width, height, mainChain, sankeyData]);

  return (
    <div ref={containerRef} className="w-full h-full absolute inset-0">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default SankeyChart;
