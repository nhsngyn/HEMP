import React from "react";

const ChainCard = ({ chain, selectionInfo, isDragging, isOverlay }) => {
  const isSelected = !!selectionInfo;
  const highlightColor = selectionInfo?.color;

  // Score 100 → 120px 막대로 계산
  const maxBarLength = 120;
  const barWidth = Math.min(chain.score * (maxBarLength / 100), maxBarLength);

  return (
    <div
      className={`
        flex items-center 
        w-[188px]
        h-[44px] // height: 44px
        px-2 // padding: 0 8px
        gap-2 // gap: 8px
        self-stretch // align-self: stretch
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
      }}
    >
      {/* 이름 */}
      <div className="
        w-[60px] 
        flex-shrink-0 
        text-gray-200 
        text-base 
        font-medium 
        leading-[140%] 
        tracking-tight 
        truncate
      ">
        {chain.name}
      </div>

      {/* 막대 + 점수 컨테이너 */}
      <div className="flex-1 flex items-center gap-2">
        
        {/* 막대바 배경 */}
        <div className="
          flex-1
          h-[20px]
          rounded-[3.59px]
          relative overflow-hidden
        ">
          <div
            className="h-full rounded-[3.59px]"
            style={{
              // width는 계산된 barWidth (max 120px) 사용
              width: `${barWidth}px`,
              backgroundColor: isSelected ? highlightColor : "#29303A",
            }}
          />
        </div>
      </div>
      
      {/* 메인/서브 표시 */}
      {isSelected && (
        <div 
          style={{ backgroundColor: highlightColor }}
        ></div>
      )}
    </div>
  );
};

export default ChainCard;