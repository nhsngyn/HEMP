const ChainCard = ({ chain, selectionInfo, isOverlay, isDragging, style, ...props }) => {
  const isSelected = !!selectionInfo;

  const progressWidth = Math.max(
    0,
    Math.min((chain.score / 100) * 143, 143)
  ); // 0~143px 사이로 제한

  const finalStyle = {
    ...style,
    backgroundColor: "#1A1A1A",
    borderRadius: "7.4px",
    border: isSelected
      ? `0.93px solid ${selectionInfo.color}`
      : "1px solid #2A2A2A",
    transition: "border 0.15s ease, box-shadow 0.15s ease",
    height: "52px",
    padding: "11px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  return (
    <div
      style={finalStyle}
      className={`
        mb-2 group 
        ${props.cursor ? props.cursor : ''}
      `}
      {...props}
    >
      {/* LEFT CONTENT */}
      <div className="flex items-center gap-2 flex-shrink-0 w-[120px]">
        {isSelected && (
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: selectionInfo.color }}
          />
        )}

        <span className={`font-semibold text-[15px] ${isSelected ? "text-white" : "text-gray-300"}`}>
          {chain.name}
        </span>
      </div>

      {/* PROGRESS BAR */}
      {isSelected && (
        <div
          className="h-[30px] rounded-md transition-all duration-300"
          style={{
            backgroundColor: selectionInfo.color,
            opacity: 0.25,
            width: `${progressWidth}px`,
          }}
        />
      )}

      {/* SCORE 텍스트 */}
      <span className={`text-xs pl-2 flex-shrink-0 ${isSelected ? "text-white" : "text-gray-500"}`}>
        {chain.score}
      </span>
    </div>
  );
};
