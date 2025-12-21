import React from "react";
import { COLORS } from '../../constants/colors';


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
      `}
      style={{
        border: isSelected
          ? `0.93px solid ${highlightColor}`
          : '0.93px solid transparent',
        opacity: isDragging ? 0.35 : 1,
      }}
    >
      {/* 1. 이름 영역*/}
      <div
        className="
          flex-shrink-0 
          text-gray-200 
          text-base 
          font-medium 
          truncate
        "
        style={{ width: '80px' }} 
      >
        {chain.name}
      </div>

    {/* 2. 막대 + 점수 컨테이너 */}
<div className="flex items-center gap-2 flex-1 min-w-0 justify-end">

  {/* 막대바 배경 */}
  <div
    className="
      relative
      h-[20px]
      rounded-[3.59px]
      overflow-hidden
    "
    style={{ width: '120px' }}
  >
    {/* 100점 기준 바 */}
    <div
      className="
        absolute right-0 top-0
        h-full
        rounded-[3.59px]
      "
      style={{
        width: '120px',
        backgroundColor: COLORS.GRAY800,
      }}
    />

    {/* 실제 점수 바 */}
    <div
      className="
        absolute right-0 top-0
        h-full
        rounded-[3.59px]
      "
      style={{
        width: `${barWidth}px`,
        backgroundColor: isSelected
          ? highlightColor
          : COLORS.GRAY700,
      }}
    />
  </div>
</div>

    </div>
  );
};

export default ChainCard;
