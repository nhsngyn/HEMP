import { useEffect, useRef, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import useChainStore from '../../store/useChainStore';
import { COLORS } from '../../constants/colors';
import { sankeyMockPropositions, defaultDummyPropositions } from '../../data/sankeyMockData';

// 상수 정의
const TYPE_COLORS = {
  'Parameter Change': '#FF6B6B',
  'Software Upgrade': '#FF8E53',
  'Text Proposal': '#FFD93D',
  'Governance': '#6BCF7F',
  'Tokenomics': '#4D96FF',
  'Security': '#9B59B6',
  'Other': '#9CA3AF'
};

const RESULT_TO_PARTICIPATION_COLORS = {
  'Passed': '#3B82494D',
  'Rejected': '#8D3C3C4d',
  'Failed': '#4C556445'
};

// Result → Participation 링크 활성화 색상 (호버/선택 시)
const RESULT_TO_PARTICIPATION_ACTIVATED_COLORS = {
  'Passed': '#4DD36899',
  'Rejected': '#DF4E4Ecc',
  'Failed': '#8590A2e6'
};

const COLUMN_LABELS = ['Type', 'Result', 'Participation', 'Vote Composition', 'Processing Speed'];
const NODE_COLOR = '#4C5564';
const NODE_WIDTH = 12;
const NODE_PADDING = 6;
const MIN_NODE_GAP = 4;
const MIN_NODE_HEIGHT = 10;
const LINK_OPACITY = 0.6;
const MIN_LINK_WIDTH = 4;
const SANKEY_ITERATIONS = 32; // 렌더링 횟수

// 노드 카테고리 정의
const NODE_CATEGORIES = {
  types: ['Parameter Change', 'Software Upgrade', 'Text Proposal', 'Governance', 'Tokenomics', 'Security', 'Other'],
  results: ['Passed', 'Rejected', 'Failed'],
  participationLevels: ['High', 'Mid', 'Low'],
  voteCompositions: ['Consensus', 'Contested', 'Polarized'],
  processingSpeeds: ['Fast', 'Normal', 'Slow']
};

// Generate Sankey data for Proposition Configuration Flow
// Column order: Type(0) -> Result(1) -> Participation(2) -> Vote Composition(3) -> Processing Speed(4)
const generateSankeyData = (mainChain, mockPropositions) => {
  if (!mainChain) {
    return { nodes: [], links: [] };
  }

  const { types, results, participationLevels, voteCompositions, processingSpeeds } = NODE_CATEGORIES;

  // Get propositions data (use mock data if not available)
  const propositions = (mainChain.propositions && Array.isArray(mainChain.propositions) && mainChain.propositions.length > 0)
    ? mainChain.propositions
    : (mockPropositions[mainChain.id] || mockPropositions['default'] || []);

  // Calculate proposal counts for each type (for sorting)
  const typeCounts = new Map();
  propositions.forEach(prop => {
    const propType = prop.type || 'Other';
    typeCounts.set(propType, (typeCounts.get(propType) || 0) + 1);
  });

  // Sort types by proposal count (descending)
  const sortedTypes = [...types].sort((a, b) => {
    const countA = typeCounts.get(a) || 0;
    const countB = typeCounts.get(b) || 0;
    return countB - countA;
  });

  // Define sort orders for each column
  const sortOrders = {
    0: sortedTypes, // Type: sorted by proposal count
    1: ['Passed', 'Rejected', 'Failed'], // Result
    2: ['High', 'Mid', 'Low'], // Participation
    3: ['Consensus', 'Contested', 'Polarized'], // Vote Composition
    4: ['Fast', 'Normal', 'Slow'] // Processing Speed
  };

  // Create nodes for all columns with proper ordering
  const nodes = [
    ...sortOrders[0].map(name => ({ name, column: 0, type: name })),
    ...sortOrders[1].map(name => ({ name, column: 1, type: null })),
    ...sortOrders[2].map(name => ({ name, column: 2, type: null })),
    ...sortOrders[3].map(name => ({ name, column: 3, type: null })),
    ...sortOrders[4].map(name => ({ name, column: 4, type: null }))
  ];

  const getNodeIndex = (name, column) => nodes.findIndex(n => n.name === name && n.column === column);

  // 링크들은 모두 "같은 속성을 갖는 프로포절들을 묶어서" 집계된 형태로 생성
  const links = [];

  // Type→Result 링크 카운트 (집계)
  const typeResultCounts = new Map();
  // Result→Participation, Participation→Vote, Vote→Speed 링크 카운트 (타입 구분 없이 집계)
  const resultParticipationCounts = new Map();
  const participationVoteCounts = new Map();
  const voteSpeedCounts = new Map();
  propositions.forEach(prop => {
    const propType = prop.type || 'Other';
    const participationLevel = prop.participationLevel || 'Mid';
    const voteComposition = prop.voteComposition || 'Consensus';
    const result = prop.result || 'Passed';
    const processingSpeed = prop.processingSpeed || 'Normal';

    // Type → Result 집계 (타입별)
    const trKey = `type-${propType}|result-${result}`;
    typeResultCounts.set(trKey, (typeResultCounts.get(trKey) || 0) + 1);

    // Result → Participation (타입 구분 없이 결과/참여만으로 집계)
    const rpKey = `result-${result}|participation-${participationLevel}`;
    resultParticipationCounts.set(rpKey, (resultParticipationCounts.get(rpKey) || 0) + 1);

    // Participation → Vote Composition
    const pvKey = `participation-${participationLevel}|vote-${voteComposition}`;
    participationVoteCounts.set(pvKey, (participationVoteCounts.get(pvKey) || 0) + 1);

    // Vote Composition → Processing Speed
    const vsKey = `vote-${voteComposition}|speed-${processingSpeed}`;
    voteSpeedCounts.set(vsKey, (voteSpeedCounts.get(vsKey) || 0) + 1);
  });

  // Type→Result 링크 생성 (집계된 value 사용, 타입별 링크 유지)
  sortedTypes.forEach(type => {
    results.forEach(result => {
      const key = `type-${type}|result-${result}`;
      const count = typeResultCounts.get(key) || 0;
      if (count > 0) {
        const sourceIdx = getNodeIndex(type, 0);
        const targetIdx = getNodeIndex(result, 1);
        if (sourceIdx !== -1 && targetIdx !== -1) {
          links.push({
            source: sourceIdx,
            target: targetIdx,
            value: count,
            type
          });
        }
      }
    });
  });

  // Result→Participation 링크 생성 (Result/Participation 조합당 하나의 굵은 링크)
  results.forEach(result => {
    participationLevels.forEach(level => {
      const key = `result-${result}|participation-${level}`;
      const count = resultParticipationCounts.get(key) || 0;
      if (count > 0) {
        const sourceIdx = getNodeIndex(result, 1);
        const targetIdx = getNodeIndex(level, 2);
        if (sourceIdx !== -1 && targetIdx !== -1) {
          links.push({
            source: sourceIdx,
            target: targetIdx,
            value: count,
            type: null
          });
        }
      }
    });
  });

  // Participation→Vote Composition 링크 생성
  participationLevels.forEach(level => {
    voteCompositions.forEach(vote => {
      const key = `participation-${level}|vote-${vote}`;
      const count = participationVoteCounts.get(key) || 0;
      if (count > 0) {
        const sourceIdx = getNodeIndex(level, 2);
        const targetIdx = getNodeIndex(vote, 3);
        if (sourceIdx !== -1 && targetIdx !== -1) {
          links.push({
            source: sourceIdx,
            target: targetIdx,
            value: count,
            type: null
          });
        }
      }
    });
  });

  // Vote Composition→Processing Speed 링크 생성
  voteCompositions.forEach(vote => {
    processingSpeeds.forEach(speed => {
      const key = `vote-${vote}|speed-${speed}`;
      const count = voteSpeedCounts.get(key) || 0;
      if (count > 0) {
        const sourceIdx = getNodeIndex(vote, 3);
        const targetIdx = getNodeIndex(speed, 4);
        if (sourceIdx !== -1 && targetIdx !== -1) {
          links.push({
            source: sourceIdx,
            target: targetIdx,
            value: count,
            type: null
          });
        }
      }
    });
  });

  return { nodes, links };
};

const SankeyChart = ({ width = 1400, height = 800 }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const propositionInfoRef = useRef(null);
  const { allChains, selectedMainId, setSankeyFilter, clearSankeyFilter } = useChainStore();
  const [selectedLink, setSelectedLink] = useState(null);

  // Get main chain data
  const mainChain = useMemo(() => {
    return allChains.find(c => c.id === selectedMainId);
  }, [allChains, selectedMainId]);

  const sankeyData = useMemo(() => {
    const mockData = {
      ...sankeyMockPropositions,
      'default': defaultDummyPropositions
    };
    return generateSankeyData(mainChain, mockData);
  }, [mainChain]);

  // Get propositions data (for external consumers like ProposalsTable)
  const propositionsData = useMemo(() => {
    if (!mainChain) return [];
    const mockData = {
      ...sankeyMockPropositions,
      'default': defaultDummyPropositions
    };
    return (mainChain.propositions && Array.isArray(mainChain.propositions) && mainChain.propositions.length > 0)
      ? mainChain.propositions
      : (mockData[mainChain.id] || mockData['default'] || []);
  }, [mainChain]);

  const hasPropositionsData = useMemo(() => {
    if (!mainChain) return false;
    if (Array.isArray(mainChain.propositions) && mainChain.propositions.length > 0) return true;
    return !!(sankeyMockPropositions[mainChain.id] || defaultDummyPropositions);
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

      const svg = d3.select(svgRef.current);
      svg.attr('width', containerWidth)
        .attr('height', containerHeight)
        .style('overflow', 'visible');

      // Background click to deselect
      svg.on('click', function (event) {
        // Only deselect if clicking directly on SVG background (not on links/nodes)
        if (event.target === this || event.target.tagName === 'svg') {
          setSelectedLink(null);
          clearSankeyFilter();
        }
      });

      // Error message helper
      const showError = (title, reason, detail = '') => {
        const errorGroup = svg.append('g')
          .attr('class', 'error-message')
          .attr('transform', `translate(${containerWidth / 2}, ${containerHeight / 2})`);

        errorGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('fill', '#ef4444')
          .attr('font-size', '20px')
          .attr('font-weight', 'bold')
          .attr('y', -20)
          .text(title);

        errorGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('fill', '#fca5a5')
          .attr('font-size', '14px')
          .attr('y', 10)
          .text(`Reason: ${reason}`);

        if (detail) {
          errorGroup.append('text')
            .attr('text-anchor', 'middle')
            .attr('fill', '#9ca3af')
            .attr('font-size', '12px')
            .attr('y', 30)
            .text(detail);
        }
      };

      if (!mainChain) {
        svg.append('text')
          .attr('x', containerWidth / 2)
          .attr('y', containerHeight / 2)
          .attr('text-anchor', 'middle')
          .attr('fill', '#9ca3af')
          .attr('font-size', '18px')
          .text('Select a MAIN CHAIN to view Sankey diagram');
        return;
      }

      if (!hasPropositionsData) {
        const reason = !mainChain.propositions
          ? 'The selected chain does not have a "propositions" property.'
          : !Array.isArray(mainChain.propositions)
            ? 'The "propositions" property is not an array.'
            : 'The "propositions" array is empty.';
        showError('⚠️ No Proposition Data Available', reason, 'Please ensure the chain data includes proposition information.');
        return;
      }

      if (sankeyData.links.length === 0) {
        showError('⚠️ No Data to Display', 'Proposition data exists but could not be processed.', 'Please check the proposition data structure.');
        return;
      }
      // padding 값 조절
      const padding = { top: 25, right: 60, bottom: 60, left: 50 };
      const chartWidth = containerWidth - padding.left - padding.right;
      const chartHeight = containerHeight - padding.top - padding.bottom;

      if (chartWidth <= 0 || chartHeight <= 0) {
        setTimeout(drawChart, 100);
        return;
      }

      // Store original node metadata
      const originalNodes = sankeyData.nodes.map((d, i) => ({
        index: i,
        name: d.name,
        column: d.column,
        type: d.type || null
      }));

      // Create data copy for sankey processing
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
          type: d.type || null,
          // Preserve proposition metadata so it survives through sankey() processing
          propositionId: d.propositionId,
          propositionIndex: d.propositionIndex
        }))
      };

      // Create Sankey generator
      const sankeyGenerator = sankey()
        .nodeWidth(NODE_WIDTH)
        .nodePadding(NODE_PADDING)
        .extent([
          [padding.left, padding.top],
          [padding.left + chartWidth, padding.top + chartHeight]
        ])
        .iterations(SANKEY_ITERATIONS);

      // Process data with sankey
      const graph = sankeyGenerator(dataCopy);
      let { nodes, links } = graph;

      // Add stable keys to Type→Result links for accurate matching
      links.forEach(link => {
        if (link.source && link.target && link.source.column === 0 && link.target.column === 1) {
          link.stableKey = `${link.source.name}-${link.source.column}->${link.target.name}-${link.target.column}-${link.type || 'ALL'}`;
        }
      });

      // Adjust horizontal spacing between columns
      const groupNodesByColumn = (nodes) => {
        const grouped = {};
        nodes.forEach(node => {
          if (!grouped[node.column]) grouped[node.column] = [];
          grouped[node.column].push(node);
        });
        return grouped;
      };

      const nodesByColumnForSpacing = groupNodesByColumn(nodes);
      const columnCount = Object.keys(nodesByColumnForSpacing).length;

      if (columnCount > 1) {
        const columnPositions = {};
        Object.keys(nodesByColumnForSpacing).forEach(colIdx => {
          const colNodes = nodesByColumnForSpacing[colIdx];
          columnPositions[colIdx] = colNodes.reduce((sum, n) => sum + (n.x0 + n.x1) / 2, 0) / colNodes.length;
        });

        const sortedColumns = Object.keys(columnPositions).sort((a, b) => columnPositions[a] - columnPositions[b]);
        const minX = padding.left;
        const maxX = padding.left + chartWidth;
        const totalWidth = maxX - minX;
        const spacingBetweenColumns = (totalWidth - (NODE_WIDTH * columnCount)) / (columnCount - 1);

        sortedColumns.forEach((colIdx, idx) => {
          const newX = minX + idx * (NODE_WIDTH + spacingBetweenColumns);
          const colNodes = nodesByColumnForSpacing[colIdx];
          const currentCenterX = columnPositions[colIdx];
          const offset = newX - currentCenterX;

          colNodes.forEach(node => {
            node.x0 += offset;
            node.x1 += offset;
          });
        });
      }

      // NOTE:
      // 여기서는 d3-sankey가 계산한 node.y0 / y1 / link.y0 / y1 를 그대로 사용한다.
      // (수동으로 y를 재조정하면, 중간 컬럼에서 노드와 리본의 경계가 미세하게 틀어지는 문제가 생기기 때문에
      //  완벽 정렬을 위해 기본 레이아웃을 신뢰한다.)

      // Link color function (기본 색상)
      const getLinkColor = (link) => {
        if (link.source && link.target) {
          const sourceColumn = link.source.column;
          const targetColumn = link.target.column;

          // Result → Participation links use result-based colors
          if (sourceColumn === 1 && targetColumn === 2) {
            return RESULT_TO_PARTICIPATION_COLORS[link.source.name] || COLORS.GRAY500;
          }

          // Gray links: Type→Result, Participation→Vote, Vote→Speed
          if ((sourceColumn === 0 && targetColumn === 1) ||
            (sourceColumn === 2 && targetColumn === 3) ||
            (sourceColumn === 3 && targetColumn === 4)) {
            return '#4C556445';
          }
        }

        // Other links use proposal type color
        if (link.type) {
          return TYPE_COLORS[link.type] || COLORS.GRAY500;
        }

        // Fallback: trace back to type column
        const findTypeFromNode = (node, visited = new Set()) => {
          if (visited.has(node)) return 'Other';
          visited.add(node);

          if (node.column === 0) return node.name;

          const incomingLinks = links.filter(l => l.target === node);
          if (incomingLinks.length > 0) {
            const sortedLinks = incomingLinks.sort((a, b) => (b.value || 0) - (a.value || 0));
            return findTypeFromNode(sortedLinks[0].source, visited);
          }

          return 'Other';
        };

        const linkType = findTypeFromNode(link.source);
        return TYPE_COLORS[linkType] || COLORS.GRAY500;
      };

      // Link color function (활성화 색상 - 호버/선택 시)
      const getActivatedLinkColor = (link) => {
        if (link.source && link.target) {
          const sourceColumn = link.source.column;
          const targetColumn = link.target.column;

          // Result → Participation links use activated colors
          if (sourceColumn === 1 && targetColumn === 2) {
            return RESULT_TO_PARTICIPATION_ACTIVATED_COLORS[link.source.name] || getLinkColor(link);
          }
        }

        // Other links keep their original color
        return getLinkColor(link);
      };

      // Helper function to check if link is selected
      const isLinkSelected = (link) => {
        if (!selectedLink || !link.source || !link.target) return false;

        // For other links, compare name and column
        const sourceMatches = String(link.source.name) === String(selectedLink.source.name) &&
          Number(link.source.column) === Number(selectedLink.source.column);
        const targetMatches = String(link.target.name) === String(selectedLink.target.name) &&
          Number(link.target.column) === Number(selectedLink.target.column);
        return sourceMatches && targetMatches;
      };

      // Helper function to check if link should use gray color scheme
      const isGrayLink = (link) => {
        if (!link.source || !link.target) return false;
        const sourceColumn = link.source.column;
        const targetColumn = link.target.column;
        return (sourceColumn === 0 && targetColumn === 1) || // Type → Result
          (sourceColumn === 2 && targetColumn === 3) || // Participation → Vote Composition
          (sourceColumn === 3 && targetColumn === 4);   // Vote Composition → Processing Speed
      };

      // Get link color based on selection state
      const getLinkStrokeColor = (link) => {
        if (!selectedLink) {
          // No selection: use normal colors
          return getLinkColor(link);
        }

        // Selection active
        if (isLinkSelected(link)) {
          // Selected link: use #93E72999 for gray links, activated color for others
          if (isGrayLink(link)) {
            return '#93E72999';
          }
          return getActivatedLinkColor(link);
        } else {
          // Not selected: use #4C556445 for gray links, normal for others
          if (isGrayLink(link)) {
            return '#4C556445';
          }
          return getLinkColor(link);
        }
      };

      // Get link opacity based on state
      const getLinkOpacity = (link, isHovered = false) => {
        if (isLinkSelected(link)) {
          return 1; // Selected links always full opacity
        }
        if (isHovered && isGrayLink(link)) {
          return 1; // Gray links on hover: full opacity
        }
        if (selectedLink && isGrayLink(link) && !isLinkSelected(link)) {
          return 0.6; // Unselected gray links when selection is active
        }
        return LINK_OPACITY; // Default opacity
      };

      // Draw links
      const linkPaths = svg
        .append('g')
        .attr('class', 'links')
        .selectAll('path')
        .data(links, (d) => {
          // Use stable key for Type→Result links, index for others
          if (d.source && d.target && d.source.column === 0 && d.target.column === 1) {
            return d.stableKey || `${d.source.name}-${d.source.column}->${d.target.name}-${d.target.column}`;
          }
          return null; // Let D3 use default key for other links
        })
        .enter()
        .append('path')
        .attr('d', (d) => {
          // CRITICAL: For Type→Result links, ALWAYS recompute path using current node positions
          // This ensures links align perfectly with the updated node y0/y1 positions
          if (d.source && d.target && d.source.column === 0 && d.target.column === 1) {
            // Always use current node positions - don't rely on cached computedPath
            return sankeyLinkHorizontal()(d);
          }
          return sankeyLinkHorizontal()(d);
        })
        .attr('stroke', getLinkStrokeColor)
        .attr('stroke-width', (d) => Math.max(MIN_LINK_WIDTH, d.width || MIN_LINK_WIDTH))
        .attr('fill', 'none')
        .attr('opacity', (d) => getLinkOpacity(d, false))
        .style('cursor', 'pointer')
        .on('mouseenter', function (event, d) {
          if (!isLinkSelected(d)) {
            d3.select(this)
              .attr('stroke', isGrayLink(d) ? '#93E72999' : getActivatedLinkColor(d))
              .attr('opacity', 1);
          }
        })
        .on('mouseleave', function (event, d) {
          if (!isLinkSelected(d)) {
            d3.select(this)
              .attr('stroke', getLinkStrokeColor(d))
              .attr('opacity', getLinkOpacity(d, false));
          }
        })
        .on('click', function (event, d) {
          event.stopPropagation();
          // Toggle selection: if same link clicked, deselect; otherwise select new link
          if (isLinkSelected(d)) {
            setSelectedLink(null);
            clearSankeyFilter();
          } else {
            // CRITICAL: Get actual node properties directly from the link's source/target nodes
            // For Type→Result links, also store propositionId for exact matching
            const sourceNode = d.source;
            const targetNode = d.target;
            const linkData = {
              source: {
                name: String(sourceNode.name),
                column: Number(sourceNode.column)
              },
              target: {
                name: String(targetNode.name),
                column: Number(targetNode.column)
              },
              type: d.type || null
            };
            setSelectedLink(linkData);
            setSankeyFilter({
              sourceColumn: Number(sourceNode.column),
              targetColumn: Number(targetNode.column),
              sourceName: String(sourceNode.name),
              targetName: String(targetNode.name),
              type: d.type || null
            });

            // 선택된 리본에 맞는 Proposal 테이블 섹션으로 자동 스크롤
            const proposalsSection = document.getElementById('proposals-section');
            if (proposalsSection) {
              proposalsSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
            }
          }
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
        .attr('rx', 1)
        .attr('ry', 1)
        .attr('fill', NODE_COLOR)
        .attr('opacity', 1)
        .attr('stroke', '#1F2937')
        .attr('stroke-width', 1);

      // Helper function to check if node is part of selected link
      const isNodeSelected = (node) => {
        if (!selectedLink || !node) return false;

        // Type → Result 리본 선택 시, Type 컬럼 노드는 항상 리본의 시작 Type과 정확히 매칭되도록 별도 처리
        let selectedTypeName = null;
        if (Number(selectedLink.source?.column) === 0) {
          selectedTypeName = String(selectedLink.source.name);
        } else if (Number(selectedLink.target?.column) === 0) {
          selectedTypeName = String(selectedLink.target.name);
        }

        if (node.column === 0 && selectedTypeName) {
          return String(node.name) === selectedTypeName;
        }

        // 그 외 컬럼은 기존 방식대로 source/target 비교
        const matchesSource = String(node.name) === String(selectedLink.source.name) &&
          Number(node.column) === Number(selectedLink.source.column);
        const matchesTarget = String(node.name) === String(selectedLink.target.name) &&
          Number(node.column) === Number(selectedLink.target.column);
        return matchesSource || matchesTarget;
      };

      // Add node labels (centered on node with 8px offset)
      const maxColumn = Math.max(...nodes.map(n => n.column));
      node
        .append('text')
        .attr('x', (d) => {
          const nodeCenterX = (d.x0 + d.x1) / 2;
          // For last column, place text to the left with 8px gap
          // For other columns, place text to the right with 8px gap
          if (d.column === maxColumn) {
            return nodeCenterX - (d.x1 - d.x0) / 2 - 8;
          } else {
            return nodeCenterX + (d.x1 - d.x0) / 2 + 8;
          }
        })
        .attr('y', (d) => (d.y0 + d.y1) / 2) // Vertical center
        .attr('dy', '0.35em')
        .attr('text-anchor', (d) => d.column === maxColumn ? 'end' : 'start')
        .attr('font-size', '12px')
        .attr('font-weight', (d) => isNodeSelected(d) ? '700' : '400')
        .attr('fill', '#FFFFFF')
        .attr('pointer-events', 'none')
        .attr('font-family', 'SUIT')
        .text((d) => d.name);

      // Add column group titles
      const nodesByColumnForLabels = groupNodesByColumn(nodes);
      Object.keys(nodesByColumnForLabels).forEach(columnIndex => {
        const columnNodes = nodesByColumnForLabels[columnIndex];
        if (columnNodes.length === 0) return;

        const topNode = columnNodes.reduce((min, node) => node.y0 < min.y0 ? node : min);
        const labelX = columnNodes[0].x0 + (columnNodes[0].x1 - columnNodes[0].x0) / 2;

        const colIdx = parseInt(columnIndex);
        const labelText = COLUMN_LABELS[colIdx] || '';

        // Processing Speed는 2줄이므로 더 위로 올림
        const labelY = colIdx === 4 && labelText === 'Processing Speed'
          ? Math.max(padding.top - 30, topNode.y0 - 25)
          : Math.max(padding.top - 30, topNode.y0 - 15);

        // Processing Speed는 2줄로 표시
        if (colIdx === 4 && labelText === 'Processing Speed') {
          const textGroup = svg.append('text')
            .attr('x', labelX)
            .attr('y', labelY)
            .attr('text-anchor', 'middle')
            .attr('fill', '#6D7380')
            .attr('font-size', '13px')
            .attr('font-weight', '600')
            .attr('pointer-events', 'none');

          textGroup.append('tspan')
            .attr('x', labelX)
            .attr('dy', '0em')
            .text('Processing');

          textGroup.append('tspan')
            .attr('x', labelX)
            .attr('dy', '14px')
            .text('Speed');
        } else {
          svg.append('text')
            .attr('x', labelX)
            .attr('y', labelY)
            .attr('text-anchor', 'middle')
            .attr('fill', '#6D7380')
            .attr('font-size', '13px')
            .attr('font-weight', '600')
            .attr('pointer-events', 'none')
            .text(labelText);
        }
      });

    };

    // Initial render
    drawChart();

    // Resize handler
    const handleResize = () => {
      drawChart();
    };

    // Window resize 이벤트
    window.addEventListener('resize', handleResize);

    // ResizeObserver로 컨테이너 크기 변경 감지 (더 정확함)
    const resizeObserver = new ResizeObserver(() => {
      drawChart();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [width, height, mainChain, sankeyData, hasPropositionsData, selectedLink]);

  return (
    <div ref={containerRef} className="w-full h-full absolute inset-0 flex flex-col" style={{ overflow: 'visible' }}>
      {/* Title with icon */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3">
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: '24px',
            height: '24px',
            backgroundColor: '#4C5564',
            color: '#9CA3AF',
            fontSize: '12px',
            fontWeight: '900'
          }}
        >
          3
        </div>
        <h2
          className="text-gray-100 font-extrabold"
          style={{ fontSize: '14px' }}
        >
          Proposal Configuration Flow
        </h2>
      </div>
      {/* Chart area */}
      <div className="flex-1 min-h-0 relative mt-2">
        <svg ref={svgRef} className="w-full h-full " style={{ overflow: 'visible' }} />
      </div>

    </div>
  );
};

export default SankeyChart;
