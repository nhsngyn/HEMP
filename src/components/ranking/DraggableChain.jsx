import React from "react";
import { useDraggable } from "@dnd-kit/core";
import ChainCard from "./ChainCard";

const DraggableChain = ({ chain, selectionInfo, onClick, isOverlay = false }) => {
  // [수정 1] Overlay 상태일 때는 훅을 비활성화하여 ID 중복 에러 방지
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: chain.id,
    disabled: isOverlay, 
  });

  const [downPos, setDownPos] = React.useState(null);

  const handlePointerDown = (e) => {
    // [수정 2] dnd-kit의 드래그 리스너를 먼저 실행 (중요!)
    if (listeners?.onPointerDown) {
      listeners.onPointerDown(e);
    }
    
    // 클릭 판정을 위한 좌표 저장
    setDownPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e) => {
    if (!downPos) return;

    const dx = Math.abs(e.clientX - downPos.x);
    const dy = Math.abs(e.clientY - downPos.y);

    // 5px 미만 움직임이고 드래그 중이 아닐 때만 클릭으로 인정
    if (dx < 5 && dy < 5 && !isDragging) {
      onClick?.();
    }
    setDownPos(null);
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      // {...listeners}  <-- [제거] 아래 onPointerDown에서 직접 호출하므로 여기선 뺍니다.
      
      // [수정 3] 합성된 이벤트 핸들러 연결
      onPointerDown={handlePointerDown} 
      onPointerUp={handlePointerUp}
      
      // 키보드 접근성 등 나머지 리스너는 필요 시 개별 연결 (보통 마우스 드래그엔 불필요)
      onKeyDown={listeners?.onKeyDown}
      
      style={{ 
        cursor: isOverlay ? "grabbing" : "grab", 
        opacity: isOverlay ? 0.8 : (isDragging ? 0.3 : 1), // 드래그 중인 원본은 흐리게
        touchAction: "none" // 모바일/터치 드래그 오류 방지
      }}
    >
      <ChainCard
        chain={chain}
        selectionInfo={selectionInfo}
        isOverlay={isOverlay}
        isDragging={isDragging}
      />
    </div>
  );
};

export default DraggableChain;