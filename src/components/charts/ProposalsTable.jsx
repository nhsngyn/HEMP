import React, { useMemo } from 'react';
import { sankeyMockPropositions, defaultDummyPropositions } from '../../data/sankeyMockData';
import useChainStore from '../../store/useChainStore';

const ProposalsTable = ({ mainChain }) => {
  const { sankeyFilter } = useChainStore();

  const propositions = useMemo(() => { // 메인 체인 데이터에서 프로포절 데이터를 가져옴
    if (!mainChain) return [];

    const mockData = {
      ...sankeyMockPropositions,
      'default': defaultDummyPropositions
    };

    return (mainChain.propositions && Array.isArray(mainChain.propositions) && mainChain.propositions.length > 0)
      ? mainChain.propositions
      : (mockData[mainChain.id] || mockData['default'] || []);
  }, [mainChain]);

  const filteredPropositions = useMemo(() => {
    let result = propositions;

    if (sankeyFilter && propositions.length > 0) {
      const { sourceColumn, targetColumn, sourceName, targetName, type } = sankeyFilter;

      result = propositions.filter((p) => {
        const propType = p.type || 'Other';
        const result = p.result || 'Passed';
        const participationLevel = p.participationLevel || p.participation || 'Mid';
        const voteComposition = p.voteComposition || 'Consensus';
        const processingSpeed = p.processingSpeed || 'Normal';

        // Type → Result
        if (sourceColumn === 0 && targetColumn === 1) {
          return propType === sourceName && result === targetName;
        }
        // Result → Participation
        if (sourceColumn === 1 && targetColumn === 2) {
          const typeMatch = type ? propType === type : true;
          return result === sourceName && participationLevel === targetName && typeMatch;
        }
        // Participation → Vote Composition
        if (sourceColumn === 2 && targetColumn === 3) {
          const typeMatch = type ? propType === type : true;
          return participationLevel === sourceName && voteComposition === targetName && typeMatch;
        }
        // Vote Composition → Processing Speed
        if (sourceColumn === 3 && targetColumn === 4) {
          const typeMatch = type ? propType === type : true;
          return voteComposition === sourceName && processingSpeed === targetName && typeMatch;
        }

        return true;
      });
    }

    return result.sort((a, b) => {
      const idA = a.id || 0;
      const idB = b.id || 0;
      return idA - idB;
    });
  }, [sankeyFilter, propositions]);

  const getStatusColor = (statusRaw) => {
    if (!statusRaw) return 'text-[#6D7380]';
    const status = statusRaw.toUpperCase();
    if (status.startsWith('PASSED')) return 'text-[#54CB97]';
    if (status.startsWith('REJECTED')) return 'text-[#F93A4D]';
    if (status.startsWith('FAILED')) return 'text-[#8590A2e6]';
    return 'text-[#6D7380]';
  };

  const formatStatus = (prop) => {
    let statusText = '';

    if (prop.status) {
      statusText = prop.status;
    } else {
      if (prop.result === 'Passed') statusText = 'PASSED';
      else if (prop.result === 'Rejected') statusText = 'REJECTED';
      else statusText = 'FAILED';
    }

    return statusText.replace(/\s*\([^)]*%\)/g, '').trim();
  };

  const formatProcessingTime = (prop) => {

    if (prop.processingTime) return prop.processingTime;
    if (prop.processingSpeed === 'Fast') return '1-2 days';
    if (prop.processingSpeed === 'Normal') return '2-5 days';
    if (prop.processingSpeed === 'Slow') return '4-9 days';
    return '-';
  };

  // 타입 포맷팅: "Msg" 제거하고 대문자 기준 띄어쓰기
  const formatTypeForDisplay = (type) => {
    if (!type) return 'Other';
    if (type.startsWith('Msg')) {
      let formatted = type.substring(3);
      formatted = formatted.replace(/([A-Z])/g, ' $1').trim();
      return formatted;
    }
    return type;
  };

  return (
    <div
      className="w-full h-full  rounded-lg shadow-lg flex flex-col"
      style={{
        padding: 'calc(24px * var(--scale))'
      }}
    >
      <div
        className="flex items-center  justify-start gap-2 shrink-0 "
        style={{ marginBottom: 'calc(16px * var(--scale))' }}
      >
        <h2 className="text-body3-b" style={{ color: '#D1D5DB' }}>
          All Proposals
        </h2> <span className="text-gray-500 text-body1-sb"> {filteredPropositions.length}</span>
      </div>

      <div className="overflow-x-auto flex-1 min-h-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 ">
              <th
                className="text-left text-gray-400 text-caption1-sb"
                style={{
                  padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`
                }}
              >
                ID
              </th>
              <th
                className="text-left text-gray-400 text-caption1-sb"
                style={{
                  padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`
                }}
              >
                Title
              </th>
              <th
                className="text-left text-gray-400 text-caption1-sb"
                style={{
                  padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                  width: '180px'
                }}
              >
                Type
              </th>
              <th
                className="text-left text-gray-400 text-caption1-sb"
                style={{
                  padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`
                }}
              >
                Participation
              </th>
              <th
                className="text-left text-gray-400 text-caption1-sb"
                style={{
                  padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                  maxWidth: '140px'
                }}
              >
                Status
              </th>
              <th
                className="text-left text-gray-400 text-caption1-sb"
                style={{
                  padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`
                }}
              >
                Processing Time
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPropositions.map((prop, index) => (
              /* Proposals Table */
              <tr
                key={index}
                className={` border-gray-800 hover:bg-gray-900/50 transition-colors ${index % 2 === 0 ? 'bg-transparent' : ''
                  }`}
                style={{
                  height: '48px',
                  backgroundColor: index % 2 === 1 ? '#191C23' : 'transparent'
                }}
              >

                {/* ID */}
                <td
                  className="text-gray-400 text-body3-m"
                  style={{
                    padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`
                  }}
                >
                  #{prop.id || (1000 + index)}
                </td>

                {/* Title */}
                <td
                  className="max-w-md truncate text-body3-m"
                  style={{
                    padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                    color: '#E8EAED'
                  }}
                >
                  {prop.title || 'Proposal Title'}
                </td>
                {/* Type */}
                <td
                  className="text-gray-200 font-bold"
                  style={{
                    padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                    fontSize: 'calc(1rem * var(--scale))',
                    fontFamily: 'SUIT',
                    width: '180px',
                    lineHeight: '22px'
                  }}
                >
                  <span
                    className="inline-flex items-center justify-center rounded-sm text-caption1-b transition-transform cursor-pointer"
                    style={{
                      height: '22px',
                      padding: '3px 8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      verticalAlign: 'middle',
                      boxSizing: 'border-box',
                      backgroundColor: '#29303A',
                      color: '#D1D5DB',
                      transformOrigin: 'center',
                      margin: 0,
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <span style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%',
                      width: '100%'
                    }}>
                      {formatTypeForDisplay(prop.originalType || prop.type || 'Other')}
                    </span>
                  </span>
                </td>

                {/* Participation */}
                <td
                  className="text-gray-300 text-caption1-sb"
                  style={{
                    padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`
                  }}
                >
                  {prop.participation || '0.00%'}
                </td>

                {/* Status */}
                <td
                  className={`text-caption1-eb ${getStatusColor(formatStatus(prop))}`}
                  style={{
                    padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                    maxWidth: '140px'
                  }}
                >
                  {formatStatus(prop)}
                </td>

                {/* Processing Time */}
                <td
                  className="text-gray-400 text-body3-sb"
                  style={{
                    padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`
                  }}
                >
                  {formatProcessingTime(prop)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProposalsTable;

