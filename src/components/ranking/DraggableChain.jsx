import React from "react";
import { useDraggable } from "@dnd-kit/core";
import ChainCard from "./ChainCard";

const DraggableChain = ({ chain, selectionInfo, isOverlay = false, onClick }) => {
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

    // 클릭 판단
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
