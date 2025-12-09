const ChainCard = ({ chain, selectionInfo, isDragging, isOverlay }) => {
  const isSelected = !!selectionInfo;
  const highlightColor = selectionInfo?.color;
  const barWidth = Math.min(chain.score * 1.43, 143);

  return (
    <div
      className={`
        flex items-center 
        h-[52px]
        px-[11px]
        rounded-[7.4px]
        transition-all 
      `}
      style={{
        pointerEvents: "none", 
        border: isSelected
          ? `0.93px solid ${highlightColor}`
          : "0.93px solid rgba(255,255,255,0.12)",
        backgroundColor: isSelected
          ? "rgba(255,255,255,0.05)"
          : "rgba(26,27,32,1)",
        opacity: isDragging ? 0.35 : 1,
        boxShadow:
          isSelected && !isOverlay && !isDragging
            ? `0 0 12px ${highlightColor}66`
            : "none",
      }}
    >
      {/* 이름 영역 */}
      <div className="w-[71px] flex-shrink-0 text-white font-medium text-sm truncate">
        {chain.name}
      </div>

      {/* 막대 + 점수 */}
      <div className="flex-1 flex items-center">
        <div className="relative w-full h-[21px] bg-[#2A2B30] rounded-[4px] overflow-hidden">
          <div
            className="h-full rounded-[4px]"
            style={{
              width: `${barWidth}px`,
              backgroundColor: isSelected ? highlightColor : "#4B4B4B",
            }}
          ></div>
        </div>

        <span className="ml-2 text-[12px] text-gray-300">{chain.score}</span>
      </div>
    </div>
  );
};
export default ChainCard;
