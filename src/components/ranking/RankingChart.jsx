import React from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { createPortal } from "react-dom";

import useChainStore from "../../store/useChainStore";
import useChainSelection from "../../hooks/useChainSelection";

import DraggableChain from "./DraggableChain";
import DroppableSlot from "./DroppableSlot";
import DroppableListArea from "./DroppableListArea";
import { COLORS } from "../../constants/colors";

const RankingChart = () => {
  const {
    allChains,
    selectedMainId,
    selectedSubId1,
    selectedSubId2,
    removeChainById,
  } = useChainStore();

  const { selectChain, applySelection } = useChainSelection(); // ⭐ 클릭 + 드래그 로직 통합

  const [activeId, setActiveId] = React.useState(null);

  /* ---------------------------
        Drag Start
  -----------------------------*/
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  /* ---------------------------
        Drag End → applySelection
  -----------------------------*/
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const chainId = active.id;
    const target = over.id;

    // 리스트 영역에 놓으면 → unselect
    if (target === "ranking-list") {
      removeChainById(chainId);
      return;
    }

    // 슬롯(main/sub1/sub2)에 놓으면 → 훅으로 처리
    applySelection(chainId, target);
  };

  /* ---------------------------
      선택된 슬롯 하이라이트 정보
  -----------------------------*/
  const getSelectionInfo = (id) => {
    if (id === selectedMainId) return { type: "main", color: COLORS.MAIN };
    if (id === selectedSubId1) return { type: "sub1", color: COLORS.SUB1 };
    if (id === selectedSubId2) return { type: "sub2", color: COLORS.SUB2 };
    return null;
  };

  const activeChain = allChains.find((c) => c.id === activeId);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full select-none">

        {/* HEADER */}
        <h2 className="text-lg font-semibold text-white mb-6">HEMP Rank</h2>

        {/* SLOT AREA */}
        <div className="mb-6 space-y-4">
          <DroppableSlot
            id="main"
            title="Main"
            color={COLORS.MAIN}
            selectedChainId={selectedMainId}
            onSelect={selectChain}
          />

          <DroppableSlot
            id="sub1"
            title="Comparison"
            color={COLORS.SUB1}
            selectedChainId={selectedSubId1}
            onSelect={selectChain}
          />

          <DroppableSlot
            id="sub2"
            title="Comparison"
            color={COLORS.SUB2}
            selectedChainId={selectedSubId2}
            onSelect={selectChain}
          />
        </div>

        {/* LIST AREA */}
        <DroppableListArea>
          {allChains.map((chain) => (
            <DraggableChain
              key={chain.id}
              chain={chain}
              selectionInfo={getSelectionInfo(chain.id)}
              onClick={() => selectChain(chain.id)}
            />
          ))}
        </DroppableListArea>
      </div>

      {/* OVERLAY (드래그 미리보기) */}
      {createPortal(
        <DragOverlay>
          {activeChain ? (
            <DraggableChain chain={activeChain} isOverlay />
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};

export default RankingChart;
