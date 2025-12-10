import React from "react";
import { useDroppable } from "@dnd-kit/core";
import DraggableChain from "./DraggableChain";
import useChainStore from "../../store/useChainStore";

const DroppableSlot = ({ id, title, color, selectedChainId, onClear }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const { allChains } = useChainStore();

  const selectedChain = allChains.find((c) => c.id === selectedChainId);

  return (
    <div
      ref={setNodeRef}
      className={`
        relative 
        w-full 
        min-h-[80px]
        rounded-lg 
        px-3 
        py-2
        flex items-center 
        transition-all 
        ${isOver ? "bg-white/10 border border-white" : "border border-dashed border-gray-600"}
        ${selectedChain ? "border-solid" : ""}
      `}
      style={{
        borderColor: isOver ? "#fff" : selectedChain ? color : "rgba(255,255,255,0.3)",
        backgroundColor: selectedChain ? color + "15" : undefined,
      }}
    >
      {/* SLOT LABEL */}
      <span
        className="absolute top-1 left-2 text-[10px] font-bold opacity-70 tracking-widest"
        style={{ color }}
      >
        {title}
      </span>

      {/* IF SLOT HAS SELECTED CHAIN */}
      {selectedChain ? (
        <>
          <DraggableChain
            chain={selectedChain}
            selectionInfo={{ type: id, color }}
            // [수정] 슬롯에 들어간 카드는 isSelected=true로 비활성화하여 ID 충돌을 방지합니다.
            isSelected={true} 
          />

          {/* CLEAR BUTTON */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute top-1 right-2 text-gray-400 hover:text-white text-xs"
          >
            ✕
          </button>
        </>
      ) : (
        <div className="text-gray-500 text-sm ml-2">Drag here</div>
      )}
    </div>
  );
};

export default DroppableSlot;