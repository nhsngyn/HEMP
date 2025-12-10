import React from "react";
import { useDraggable } from "@dnd-kit/core";
import ChainCard from "./ChainCard";

const DraggableChain = ({ chain, selectionInfo, onClick, isOverlay = false, isSelected = false }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: chain.id,
    // 오버레이거나 리스트에서 이미 선택된 상태면 드래그 비활성화 (ID 충돌 방지 및 선택 고정)
    disabled: isOverlay || isSelected, 
  });

  const [downPos, setDownPos] = React.useState(null);

  const handlePointerDown = (e) => {
    // dnd-kit의 드래그 시작 리스너를 먼저 호출하여 클릭-드래그 충돌을 해결합니다.
    if (listeners?.onPointerDown) {
      listeners.onPointerDown(e);
    }
    setDownPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e) => {
    if (!downPos) return;

    const dx = Math.abs(e.clientX - downPos.x);
    const dy = Math.abs(e.clientY - downPos.y);

    // 클릭 판정 및 실행 로직
    // 5px 미만 움직임, 드래그 중 아님, 그리고 '선택되지 않은' 상태일 때만 onClick 실행 (토글 방지)
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
      // 항목 사이에 마진을 주어 드래그 영역 충돌을 방지합니다.
      className="mb-2" 
      
      style={{ 
        // 선택되었거나 오버레이면 커서를 default로 변경 (클릭 불가 시각적 표시)
        cursor: (isOverlay || isSelected) ? "default" : "grab", 
        // 드래그 중인 원본만 흐리게 (선택 상태는 Opacity 1 유지)
        opacity: isOverlay ? 0.8 : (isDragging ? 0.35 : 1), 
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