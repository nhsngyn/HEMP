import React from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { createPortal } from "react-dom";

import useChainStore from "../../store/useChainStore";
import { COLORS } from "../../constants/colors";

import DraggableChain from "./DraggableChain";
import DroppableSlot from "./DroppableSlot";
import DroppableListArea from "./DroppableListArea";

const RankingChart = () => {
  const {
    allChains,
    selectedMainId,
    selectedSubId1,
    selectedSubId2,
    setSlot,
    clearSlot,
    removeChainById,
  } = useChainStore();

  const [activeId, setActiveId] = React.useState(null);

  // 드래그 시작
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // 드래그 종료 → 슬롯 또는 리스트로 drop
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const chainId = active.id;
    const target = over.id;

    // 리스트로 버리기
    if (target === "ranking-list") {
      removeChainById(chainId);
      return;
    }

    // 슬롯에 배치
    setSlot(target, chainId);
  };

  // 선택된 슬롯 정보를 전달해주는 함수
  const getSelectionInfo = (id) => {
    if (id === selectedMainId) return { type: "main", color: COLORS.MAIN };
    if (id === selectedSubId1) return { type: "sub1", color: COLORS.SUB1 };
    if (id === selectedSubId2) return { type: "sub2", color: COLORS.SUB2 };
    return null;
  };

  const activeChain = allChains.find((item) => item.id === activeId);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full select-none">

        {/* HEADER */}
        <h2 className="text-xl font-bold mb-4 text-white">HEMP Rank</h2>

        {/* SLOT AREA */}
        <div className="mb-6 space-y-2">
          <DroppableSlot
            id="main"
            title="MAIN CHAIN"
            color={COLORS.MAIN}
            selectedChainId={selectedMainId}
            onClear={() => clearSlot("main")}
          />

          <div className="flex gap-2">
            <DroppableSlot
              id="sub1"
              title="SUB 1"
              color={COLORS.SUB1}
              selectedChainId={selectedSubId1}
              onClear={() => clearSlot("sub1")}
            />
            <DroppableSlot
              id="sub2"
              title="SUB 2"
              color={COLORS.SUB2}
              selectedChainId={selectedSubId2}
              onClear={() => clearSlot("sub2")}
            />
          </div>
        </div>

        <div className="border-t border-gray-700 my-2"></div>

        {/* LIST AREA */}
        <DroppableListArea>
          {allChains.map((chain) => (
            <DraggableChain
              key={chain.id}
              chain={chain}
              selectionInfo={getSelectionInfo(chain.id)}
            />
          ))}
        </DroppableListArea>
      </div>

      {createPortal(
  <DragOverlay>
    {activeChain ? (
      <DraggableChain 
        chain={activeChain}
        isOverlay
      />
    ) : null}
  </DragOverlay>,
  document.body
)}

    </DndContext>
  );
};

export default RankingChart;
