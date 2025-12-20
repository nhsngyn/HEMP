import React from "react";

const ChainCard = ({ chain, selectionInfo, isDragging, isOverlay }) => {
  const isSelected = !!selectionInfo;
  const highlightColor = selectionInfo?.color;

  const maxBarLength = 120;
  const barWidth = Math.min(chain.score * 1.2, maxBarLength);

  return (
    <div
      className={`
        flex items-center 
        w-[206px]
        h-[44px] 
        px-2 
        gap-2 
        self-stretch
        rounded-[7.4px]
        transition-all 
        ${isSelected ? "" : "hover:shadow-[0_0_8px_rgba(255,255,255,0.02)]"}
      `}
      style={{
        border: isSelected
          ? `0.93px solid ${highlightColor}`
          : '0.93px solid transparent',
        opacity: isDragging ? 0.35 : 1,
        boxShadow:
          isSelected && !isOverlay && !isDragging
            ? `0 0 12px ${highlightColor}66`
            : "none",
        position: 'relative', 
      }}
    >
      {/* 1. 이름 영역*/}
      <div
        className="
          flex-shrink-0 
          text-gray-200 
          text-base 
          font-medium 
          leading-[140%] 
          tracking-tight 
          truncate
        "
        style={{ width: '88px' }} 
      >
        {chain.name}
      </div>

      {/* 2. 막대 + 점수 컨테이너 */}
      <div className="flex items-center gap-2 flex-1 min-w-0">

        {/* 막대바 배경 */}
        <div className="
          flex-1
          h-[20px]
          rounded-[3.59px]
          relative overflow-hidden
        ">
          {/* 실제 점수 바 */}
          <div
            className="h-full rounded-[3.59px]"
            style={{
              width: `${barWidth}px`, // 100점 -> 120px
              backgroundColor: isSelected ? highlightColor : "#4B5563",
            }}
          />
        </div>
      </div>

    </div>
  );
};

export default ChainCard;