// src/components/ranking/DraggableChain.jsx
import React from "react";
import { useDraggable } from "@dnd-kit/core";
import ChainCard from "./ChainCard";
import { DRAG_CLICK_THRESHOLD } from "../../constants/dnd";

const DraggableChain = ({ chain, selectionInfo, onClick, isOverlay = false, isSelected = false }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: chain.id,
    disabled: isOverlay || isSelected, 
  });

  const [downPos, setDownPos] = React.useState(null);

  const handlePointerDown = (e) => {
    if (listeners?.onPointerDown) {
      listeners.onPointerDown(e);
    }
    setDownPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e) => {
    if (!downPos) return;

    const dx = Math.abs(e.clientX - downPos.x);
    const dy = Math.abs(e.clientY - downPos.y);

    if (dx < DRAG_CLICK_THRESHOLD && dy < DRAG_CLICK_THRESHOLD && !isDragging && !isSelected) { 
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
      className="mb-4" 
      
      style={{ 
        cursor: (isOverlay || isSelected) ? "default" : "grab", 
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