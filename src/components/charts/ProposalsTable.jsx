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

    // ID 순서로 정렬 (오름차순)
    return result.sort((a, b) => {
      const idA = a.id || 0;
      const idB = b.id || 0;
      return idA - idB;
    });
  }, [sankeyFilter, propositions]);

  // Tailwind arbitrary color classes로 상태 색상 지정
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

    // 우선 실제 데이터에서 넘어온 status가 있으면 그대로 사용
    if (prop.status) {
      statusText = prop.status;
    } else {
      // 그 외에는 result 기반으로 3가지 상태만 표기
      if (prop.result === 'Passed') statusText = 'PASSED';
      else if (prop.result === 'Rejected') statusText = 'REJECTED';
      else statusText = 'FAILED';
    }

    // 퍼센트 제거 (예: "PASSED (26.3%)" -> "PASSED")
    return statusText.replace(/\s*\([^)]*%\)/g, '').trim();
  };

  const formatProcessingTime = (prop) => {

    // 종료된 경우: 총 소요 시간 (processingTime 이 있으면 사용)
    if (prop.processingTime) return prop.processingTime;

    // 더미 데이터용 기본값 (speed 기반)
    if (prop.processingSpeed === 'Fast') return '1-2 days';
    if (prop.processingSpeed === 'Normal') return '2-5 days';
    if (prop.processingSpeed === 'Slow') return '4-9 days';
    return '-';
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
        <h2
          className="text-white font-bold text-lg"
          style={{ fontFamily: 'SUIT' }}
        >
          All Proposals
        </h2> <span className="text-gray-500 font-semibold" style={{ fontSize: 'calc(1rem * var(--scale))', fontFamily: 'SUIT' }}> {filteredPropositions.length}</span>
      </div>

      <div className="overflow-x-auto flex-1 min-h-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 ">
              <th
                className="text-left text-gray-400 font-medium"
                style={{
                  padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                  fontSize: 'calc(1rem * var(--scale))',
                  fontFamily: 'SUIT',
                  fontWeight: 800
                }}
              >
                ID
              </th>
              <th
                className="text-left text-gray-400 font-medium"
                style={{
                  padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                  fontSize: 'calc(1rem * var(--scale))',
                  fontFamily: 'SUIT',
                  fontWeight: 800
                }}
              >
                Title
              </th>
              <th
                className="text-left text-gray-400 font-medium"
                style={{
                  padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                  fontSize: 'calc(1rem * var(--scale))',
                  fontFamily: 'SUIT',
                  width: '180px',
                  fontWeight: 800
                }}
              >
                Type
              </th>
              <th
                className="text-left text-gray-400 font-medium"
                style={{
                  padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                  fontSize: 'calc(1rem * var(--scale))',
                  fontFamily: 'SUIT',
                  fontWeight: 800
                }}
              >
                Participation
              </th>
              <th
                className="text-left text-gray-400 font-medium"
                style={{
                  padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                  fontSize: 'calc(1rem * var(--scale))',
                  fontFamily: 'SUIT',
                  maxWidth: '140px',
                  fontWeight: 800
                }}
              >
                Status
              </th>
              <th
                className="text-left text-gray-400 font-medium"
                style={{
                  padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                  fontSize: 'calc(1rem * var(--scale))',
                  fontFamily: 'SUIT',
                  fontWeight: 800
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
                className={` border-gray-800 hover:bg-gray-900/50 transition-colors ${index % 2 === 0 ? 'bg-transparent' : 'bg-[#29303A50]'
                  }`}
              >

                {/* ID */}
                <td
                  className="text-gray-400"
                  style={{
                    padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                    fontSize: 'calc(1rem * var(--scale))',
                    fontFamily: 'SUIT'
                  }}
                >
                  #{prop.id || (1000 + index)}
                </td>

                {/* Title */}
                <td
                  className="text-gray-100 max-w-md truncate font-medium"
                  style={{
                    padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                    fontSize: 'calc(1.2rem * var(--scale))',
                    fontFamily: 'SUIT'
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
                    width: '180px'
                  }}
                >
                  <span
                    className="inline-block items-center justify-center px-3 py-2 rounded-md bg-[#29303A] font-extrabold text-gray-200 text-sm"
                    style={{
                      fontFamily: 'SUIT',
                      maxWidth: '180px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'inline-block',
                      verticalAlign: 'middle'
                    }}
                  >
                    {prop.originalType || prop.type || 'Other'}
                  </span>
                </td>

                {/* Participation */}
                <td
                  className="text-gray-300 font-bold"
                  style={{
                    padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                    fontSize: 'calc(1rem * var(--scale))',
                    fontFamily: 'SUIT'
                  }}
                >
                  {prop.participation || '0.00%'}
                </td>

                {/* Status */}
                <td
                  className={`font-extrabold ${getStatusColor(formatStatus(prop))}`}
                  style={{
                    padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                    fontSize: 'calc(1rem * var(--scale))',
                    fontFamily: 'SUIT',
                    maxWidth: '140px'
                  }}
                >
                  {formatStatus(prop)}
                </td>

                {/* Processing Time */}
                <td
                  className="text-gray-400 font-semibold"
                  style={{
                    padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                    fontSize: 'calc(1rem * var(--scale))',
                    fontFamily: 'SUIT'
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

