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
  'Rejected': '#887E244D',
  'Failed': '#8D3C3C4D'
};

// Result → Participation 링크 활성화 색상 (호버/선택 시)
const RESULT_TO_PARTICIPATION_ACTIVATED_COLORS = {
  'Passed': '#4DD36899',
  'Rejected': '#E4D43F99',
  'Failed': '#DF4E4Ecc'
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

  // Aggregate link counts by type
  const linkCounts = new Map();
  propositions.forEach(prop => {
    const propType = prop.type || 'Other';
    const participationLevel = prop.participationLevel || 'Mid';
    const voteComposition = prop.voteComposition || 'Consensus';
    const result = prop.result || 'Passed';
    const processingSpeed = prop.processingSpeed || 'Normal';

    const linkKeys = [
      `type-${propType}|result-${result}|${propType}`,
      `result-${result}|participation-${participationLevel}|${propType}`,
      `participation-${participationLevel}|vote-${voteComposition}|${propType}`,
      `vote-${voteComposition}|speed-${processingSpeed}|${propType}`
    ];

    linkKeys.forEach(key => {
      linkCounts.set(key, (linkCounts.get(key) || 0) + 1);
    });
  });

  // Generate links between columns
  const createLinks = (sourceColumn, targetColumn, sourceValues, targetValues, keyPrefix, includeType = false) => {
    const links = [];
    // Maintain order: iterate sourceValues and targetValues in their sorted order
    sourceValues.forEach(sourceVal => {
      targetValues.forEach(targetVal => {
        if (includeType) {
          // Use sorted types to maintain order
          sortedTypes.forEach(type => {
            const key = `${keyPrefix}-${sourceVal}|${keyPrefix === 'type' ? 'result' : keyPrefix === 'result' ? 'participation' : keyPrefix === 'participation' ? 'vote' : 'speed'}-${targetVal}|${type}`;
            const count = linkCounts.get(key) || 0;
            if (count > 0) {
              const sourceIdx = getNodeIndex(sourceVal, sourceColumn);
              const targetIdx = getNodeIndex(targetVal, targetColumn);
              if (sourceIdx !== -1 && targetIdx !== -1) {
                links.push({ source: sourceIdx, target: targetIdx, value: count, type });
              }
            }
          });
        } else {
          const key = `${keyPrefix}-${sourceVal}|${keyPrefix === 'type' ? 'result' : 'participation'}-${targetVal}|${sourceVal}`;
          const count = linkCounts.get(key) || 0;
          if (count > 0) {
            const sourceIdx = getNodeIndex(sourceVal, sourceColumn);
            const targetIdx = getNodeIndex(targetVal, targetColumn);
            if (sourceIdx !== -1 && targetIdx !== -1) {
              links.push({ source: sourceIdx, target: targetIdx, value: count, type: sourceVal });
            }
          }
        }
      });
    });

    // Sort links to match node order: first by source index, then by target index
    links.sort((a, b) => {
      if (a.source !== b.source) {
        return a.source - b.source;
      }
      return a.target - b.target;
    });

    return links;
  };

  const links = [
    ...createLinks(0, 1, sortOrders[0], sortOrders[1], 'type'),
    ...createLinks(1, 2, sortOrders[1], sortOrders[2], 'result', true),
    ...createLinks(2, 3, sortOrders[2], sortOrders[3], 'participation', true),
    ...createLinks(3, 4, sortOrders[3], sortOrders[4], 'vote', true)
  ];

  return { nodes, links };
};

const SankeyChart = ({ width = 1400, height = 800 }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const { allChains, selectedMainId } = useChainStore();
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
      const padding = { top: 25, right: 60, bottom: 55, left: 50 };
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
          type: d.type || null
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

      // Restore original node metadata
      nodes.forEach((node) => {
        const originalNode = originalNodes.find(n => n.name === node.name);
        if (originalNode) {
          node.column = originalNode.column;
          node.type = originalNode.type;
        }
      });

      // Define sort orders for each column (same as in generateSankeyData)
      const getProposalCounts = () => {
        const counts = new Map();
        sankeyData.links.forEach(link => {
          if (link.source && link.source.column === 0) {
            const typeName = link.source.name;
            counts.set(typeName, (counts.get(typeName) || 0) + (link.value || 0));
          }
        });
        return counts;
      };

      const typeCounts = getProposalCounts();
      const sortedTypes = [...NODE_CATEGORIES.types].sort((a, b) => {
        const countA = typeCounts.get(a) || 0;
        const countB = typeCounts.get(b) || 0;
        return countB - countA;
      });

      const columnSortOrders = {
        0: sortedTypes, // Type: sorted by proposal count
        1: ['Passed', 'Rejected', 'Failed'], // Result
        2: ['High', 'Mid', 'Low'], // Participation
        3: ['Consensus', 'Contested', 'Polarized'], // Vote Composition
        4: ['Fast', 'Normal', 'Slow'] // Processing Speed
      };

      // Create a map for quick lookup of sort order index
      const getSortIndex = (nodeName, column) => {
        const sortOrder = columnSortOrders[column] || [];
        const index = sortOrder.indexOf(nodeName);
        return index === -1 ? 999 : index; // Put unknown nodes at the end
      };

      // Adjust node heights proportionally within each column
      const nodesByColumnForHeight = groupNodesByColumn(nodes);

      // Adjust node heights and maintain sort order
      Object.keys(nodesByColumnForHeight).forEach(columnIndex => {
        const colIdx = parseInt(columnIndex);
        const columnNodes = nodesByColumnForHeight[columnIndex];
        if (columnNodes.length === 0) return;

        // Sort nodes by defined order (ensure consistent ordering)
        const sortedNodes = [...columnNodes].sort((a, b) => {
          const indexA = getSortIndex(a.name, colIdx);
          const indexB = getSortIndex(b.name, colIdx);
          return indexA - indexB;
        });

        // Calculate node values for proportional sizing
        const nodeValues = sortedNodes.map(node => {
          const incomingValue = links
            .filter(link => link.target === node)
            .reduce((sum, link) => sum + (link.value || 0), 0);
          const outgoingValue = links
            .filter(link => link.source === node)
            .reduce((sum, link) => sum + (link.value || 0), 0);

          // For first column (Type), use only outgoing value
          // For last column, use only incoming value
          // For middle columns, use the maximum
          if (colIdx === 0) {
            return Math.max(outgoingValue, 1); // Type nodes: use outgoing only
          } else if (colIdx === 4) {
            return Math.max(incomingValue, 1); // Last column: use incoming only
          } else {
            return Math.max(incomingValue, outgoingValue, 1); // Middle columns: use max
          }
        });

        const totalValue = nodeValues.reduce((sum, val) => sum + val, 0);

        // Get column bounds from sankey layout, but ensure it fits within container
        // Use the actual sankey-calculated bounds to maintain link alignment
        const sankeyColumnTop = Math.min(...columnNodes.map(n => n.y0));
        const sankeyColumnBottom = Math.max(...columnNodes.map(n => n.y1));
        const sankeyColumnHeight = sankeyColumnBottom - sankeyColumnTop;

        // Ensure column fits within container bounds
        const maxAllowedTop = padding.top;
        const maxAllowedBottom = padding.top + chartHeight;
        const columnTop = Math.max(maxAllowedTop, sankeyColumnTop);
        const columnBottom = Math.min(maxAllowedBottom, sankeyColumnBottom);
        const columnHeight = columnBottom - columnTop;

        // Calculate total gap needed
        const totalGap = (sortedNodes.length - 1) * MIN_NODE_GAP;
        const availableHeight = Math.max(columnHeight - totalGap, sortedNodes.length * MIN_NODE_HEIGHT);

        // Reassign y positions in sort order from top to bottom
        // This ensures links start from the correct node positions matching the sort order
        const maxY = maxAllowedBottom;
        const maxAvailableHeight = maxY - columnTop - (sortedNodes.length - 1) * MIN_NODE_GAP;
        const finalAvailableHeight = Math.min(availableHeight, maxAvailableHeight);

        // Start from the actual column top (which may be adjusted for container bounds)
        // 모든 노드를 동일한 높이로 통일
        const uniformNodeHeight = finalAvailableHeight / sortedNodes.length;
        let currentY = columnTop;
        sortedNodes.forEach((node, idx) => {
          // Update node position - sankeyLinkHorizontal() will use these updated positions
          node.y0 = currentY;
          node.y1 = currentY + uniformNodeHeight;
          currentY = node.y1 + MIN_NODE_GAP;
        });
      });

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
        // Compare both name and column for accurate matching
        return link.source.name === selectedLink.source.name &&
          link.source.column === selectedLink.source.column &&
          link.target.name === selectedLink.target.name &&
          link.target.column === selectedLink.target.column;
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
        .data(links)
        .enter()
        .append('path')
        .attr('d', sankeyLinkHorizontal())
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
          } else {
            setSelectedLink({
              source: { name: d.source.name, column: d.source.column },
              target: { name: d.target.name, column: d.target.column }
            });
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
        // Compare both name and column for accurate matching
        return (node.name === selectedLink.source.name && node.column === selectedLink.source.column) ||
          (node.name === selectedLink.target.name && node.column === selectedLink.target.column);
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
            fontWeight: '400'
          }}
        >
          3
        </div>
        <h2
          className="text-gray-100 font-semibold"
          style={{ fontSize: '14px' }}
        >
          Proposal Configuration Flow
        </h2>
      </div>
      {/* Chart area */}
      <div className="flex-1 min-h-0 relative">
        <svg ref={svgRef} className="w-full h-full " style={{ overflow: 'visible' }} />
      </div>
    </div>
  );
};

export default SankeyChart;
