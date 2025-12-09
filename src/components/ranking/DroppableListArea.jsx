import React from "react";
import { useDroppable } from "@dnd-kit/core";

const DroppableListArea = ({ children }) => {
  const { setNodeRef, isOver } = useDroppable({ id: "ranking-list" });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-1 overflow-y-auto 
        px-2 py-2 
        rounded-lg
        transition-colors
        ${isOver ? "bg-white/5" : ""}
      `}
    >
      <h3 className="text-[12px] text-gray-400 mb-1 tracking-wide">
        All Chains
      </h3>

      {children}
    </div>
  );
};

export default DroppableListArea;
