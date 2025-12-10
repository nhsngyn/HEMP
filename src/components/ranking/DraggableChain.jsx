import React from "react";
import { useDraggable } from "@dnd-kit/core";
import ChainCard from "./ChainCard";

const DraggableChain = ({ chain, selectionInfo, onClick, isOverlay = false, isSelected = false }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: chain.id,
    // 오버레이거나 리스트에서 이미 선택된 상태면 드래그 비활성화
    disabled: isOverlay || isSelected, 
  });

  const [downPos, setDownPos] = React.useState(null);

  const handlePointerDown = (e) => {
    // dnd-kit 리스너 호출. disabled 여부는 훅에서 처리함.
    if (listeners?.onPointerDown) {
      listeners.onPointerDown(e);
    }
    setDownPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e) => {
    if (!downPos) return;

    const dx = Math.abs(e.clientX - downPos.x);
    const dy = Math.abs(e.clientY - downPos.y);

    // [핵심 변경] 클릭 판정 및 실행 로직
    // 1. 5px 미만 움직임이고 드래그 중이 아닐 때만 클릭으로 인정
    // 2. '이미 선택된 상태가 아닐 때만' onClick을 발생시켜 토글을 원천 봉쇄함.
    if (dx < 5 && dy < 5 && !isDragging && !isSelected) { 
      onClick?.(); 
    }

    setDownPos(null);
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onKeyDown={listeners?.onKeyDown}
      
      style={{ 
        // 선택된 아이템은 커서를 default로 변경하여 클릭이 안 되는 것을 시각적으로 표시
        cursor: (isOverlay || isSelected) ? "default" : "grab", 
        // 선택됨(isSelected): 0.4 (흐릿), 나머지 기존 로직 유지
        opacity: isOverlay ? 0.8 : (isDragging ? 0.3 : (isSelected ? 0.4 : 1)), 
        touchAction: "none"
      }}
    >
      <ChainCard
        chain={chain}
        selectionInfo={selectionInfo}
        isOverlay={isOverlay}
        isDragging={isDragging}
        isSelected={isSelected}
      />
    </div>
  );
};

export default DraggableChain;