// src/components/ranking/DroppableListArea.jsx
import React from "react";
import { useDroppable } from "@dnd-kit/core";

const DroppableListArea = ({ children }) => {
  const { setNodeRef, isOver } = useDroppable({ id: "ranking-list" });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-1 overflow-y-auto pr-2 
        custom-scrollbar p-2 rounded-lg 
        ${isOver ? "bg-white/5" : ""}
      `}
    >
      {children}
    </div>
  );
};

export default DroppableListArea;
