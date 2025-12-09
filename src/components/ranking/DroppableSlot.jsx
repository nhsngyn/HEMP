import React from "react";
import { useDroppable } from "@dnd-kit/core";
import DraggableChain from "./DraggableChain";
import useChainStore from "../../store/useChainStore";

const DroppableSlot = ({ id, title, color, selectedChainId, onSelect, onClear }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const { allChains } = useChainStore();

  const selectedChain = allChains.find((c) => c.id === selectedChainId);

  // 클릭으로 슬롯 체인 선택
  const handleClick = () => {
    if (!selectedChain) return;
    onSelect?.(selectedChain.id);
  };

  return (
    <div
      ref={setNodeRef}
      onClick={handleClick}
      className={`
        relative 
        w-full h-[64px] 
        rounded-lg 
        border-2 
        flex items-center 
        px-3
        transition-all cursor-pointer
        ${isOver ? "bg-gray-700 border-white" : "border-dashed border-gray-600"}
        ${selectedChain ? "border-solid" : ""}
      `}
      style={{
        borderColor: isOver ? "#fff" : selectedChain ? color : undefined,
        backgroundColor: selectedChain ? color + "15" : undefined,
      }}
    >
      <span
        className="absolute top-1 left-2 text-[10px] font-bold opacity-70 tracking-widest"
        style={{ color }}
      >
        {title}
      </span>

      {selectedChain ? (
        <>
          {/* 슬롯 안 카드도 draggable */}
          <DraggableChain
            chain={selectedChain}
            selectionInfo={{ type: id, color }}
            onClick={() => onSelect?.(selectedChain.id)}
          />

          {/* Clear 버튼 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear?.();
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
