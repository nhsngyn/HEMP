import React, { useMemo } from 'react';
import { sankeyMockPropositions, defaultDummyPropositions } from '../../data/sankeyMockData';

const ProposalsTable = ({ mainChain }) => {
  const propositions = useMemo(() => {
    if (!mainChain) return [];
    
    const mockData = {
      ...sankeyMockPropositions,
      'default': defaultDummyPropositions
    };
    
    return (mainChain.propositions && Array.isArray(mainChain.propositions) && mainChain.propositions.length > 0)
      ? mainChain.propositions
      : (mockData[mainChain.id] || mockData['default'] || []);
  }, [mainChain]);

  const getStatusColor = (status) => {
    if (status.includes('PASSED')) return 'text-green-500';
    if (status.includes('REJECTED')) return 'text-red-500';
    if (status.includes('VOTING')) return 'text-orange-500';
    return 'text-gray-400';
  };

  return (
    <div 
      className="w-full h-full bg-[#1A1B20] rounded-lg shadow-lg flex flex-col"
      style={{
        padding: 'calc(24px * var(--scale))'
      }}
    >
      <div 
        className="flex items-center justify-between shrink-0"
        style={{ marginBottom: 'calc(16px * var(--scale))' }}
      >
        <h2 
          className="text-white font-semibold"
          style={{ fontSize: 'calc(1.125rem * var(--scale))' }}
        >
          All Proposals {propositions.length}
        </h2>
      </div>
      
      <div className="overflow-x-auto flex-1 min-h-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th 
                className="text-left text-gray-400 font-medium"
                style={{
                  padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                  fontSize: 'calc(0.875rem * var(--scale))'
                }}
              >
                ID
              </th>
              <th 
                className="text-left text-gray-400 font-medium"
                style={{
                  padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                  fontSize: 'calc(0.875rem * var(--scale))'
                }}
              >
                Title
              </th>
              <th 
                className="text-left text-gray-400 font-medium"
                style={{
                  padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                  fontSize: 'calc(0.875rem * var(--scale))'
                }}
              >
                Type
              </th>
              <th 
                className="text-left text-gray-400 font-medium"
                style={{
                  padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                  fontSize: 'calc(0.875rem * var(--scale))'
                }}
              >
                Participation
              </th>
              <th 
                className="text-left text-gray-400 font-medium"
                style={{
                  padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                  fontSize: 'calc(0.875rem * var(--scale))'
                }}
              >
                Status
              </th>
              <th 
                className="text-left text-gray-400 font-medium"
                style={{
                  padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                  fontSize: 'calc(0.875rem * var(--scale))'
                }}
              >
                Processing Time
              </th>
            </tr>
          </thead>
          <tbody>
            {propositions.map((prop, index) => (
              <tr 
                key={index} 
                className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors"
              >
                <td 
                  className="text-gray-300"
                  style={{
                    padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                    fontSize: 'calc(0.875rem * var(--scale))'
                  }}
                >
                  #{prop.id || (1000 + index)}
                </td>
                <td 
                  className="text-gray-300 max-w-md truncate"
                  style={{
                    padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                    fontSize: 'calc(0.875rem * var(--scale))'
                  }}
                >
                  {prop.title || 'Proposal Title'}
                </td>
                <td 
                  className="text-gray-300"
                  style={{
                    padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                    fontSize: 'calc(0.875rem * var(--scale))'
                  }}
                >
                  {prop.type || 'Other'}
                </td>
                <td 
                  className="text-gray-300"
                  style={{
                    padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                    fontSize: 'calc(0.875rem * var(--scale))'
                  }}
                >
                  {prop.participation || '0.00%'}
                </td>
                <td 
                  className={`font-medium ${getStatusColor(prop.status || prop.result)}`}
                  style={{
                    padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                    fontSize: 'calc(0.875rem * var(--scale))'
                  }}
                >
                  {prop.status || (prop.result === 'Passed' ? 'PASSED' : prop.result === 'Rejected' ? 'REJECTED' : 'VOTING PERIOD')}
                </td>
                <td 
                  className="text-gray-300"
                  style={{
                    padding: `calc(12px * var(--scale)) calc(16px * var(--scale))`,
                    fontSize: 'calc(0.875rem * var(--scale))'
                  }}
                >
                  {prop.processingTime || (prop.processingSpeed === 'Fast' ? '1-2 days' : prop.processingSpeed === 'Normal' ? '2-5 days' : '4-9 days')}
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

