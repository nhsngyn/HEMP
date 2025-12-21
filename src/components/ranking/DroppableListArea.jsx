import React from "react";
import { useDroppable } from "@dnd-kit/core";

const DroppableListArea = ({ children }) => {
  const { setNodeRef, isOver } = useDroppable({ id: "ranking-list" });

  return (
    <div
      ref={setNodeRef}
      className={`
        w-full
        h-full
        overflow-y-auto  
        custom-scrollbar
        rounded-lg
        ${isOver ? "bg-white/5" : ""}
      `}
    >
      {children}
    </div>
  );
};

export default DroppableListArea;
