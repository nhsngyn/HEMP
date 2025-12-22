import React from "react";

const ChainCard = ({ chain, selectionInfo, isDragging, isOverlay }) => {
  const isSelected = !!selectionInfo;
  const highlightColor = selectionInfo?.color;

  const maxBarLength = 120;
  const barWidth = Math.min(chain.score * 1.2, maxBarLength);

  return (
    <div
      className={`flex items-center w-full h-[44px] px-2 gap-2 rounded-[7.4px] transition-all ${
        isDragging ? 'opacity-35' : 'opacity-100'
      }`}
      style={{
        borderWidth: '0.93px',
        borderStyle: 'solid',
        borderColor: isSelected ? highlightColor : 'transparent',
        boxSizing: 'border-box',
      }}
    >
      <div className="w-[80px] flex-shrink-0 truncate text-body2-m text-gray-200">
        {chain.name}
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="relative w-[120px] h-[20px] rounded-[3.59px] overflow-hidden bg-gray-800">
          <div
            className={`absolute left-0 top-0 h-full rounded-[3.59px] ${isSelected ? '' : 'bg-gray-700'}`}
            style={{
              width: `${barWidth}px`,
              backgroundColor: isSelected ? highlightColor : undefined,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ChainCard;
