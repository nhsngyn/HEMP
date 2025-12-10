import React from "react";
import { useDraggable } from "@dnd-kit/core";
import ChainCard from "./ChainCard";

const DraggableChain = ({ chain, selectionInfo, onClick, isOverlay = false }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: chain.id,
  });

  const [downPos, setDownPos] = React.useState(null);

  const handlePointerDown = (e) => {
    setDownPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e) => {
    if (!downPos) return;

    const dx = Math.abs(e.clientX - downPos.x);
    const dy = Math.abs(e.clientY - downPos.y);

    // 클릭 판정
    if (dx < 5 && dy < 5 && !isDragging) {
      onClick?.();
    }

    setDownPos(null);
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{ cursor: "grab", opacity: isOverlay ? 0.6 : 1 }}
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
