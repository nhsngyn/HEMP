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

  // 🔵 현재 필터 상태 ("score" | "name")
  const [sortType, setSortType] = React.useState("score");

  // 🔵 정렬된 데이터 생성
  const sortedChains = [...allChains].sort((a, b) => {
    if (sortType === "name") {
      return a.name.localeCompare(b.name);
    }
    return b.score - a.score; // score 기본
  });

  // 🟢 드래그 시작
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // 🟢 드래그 종료
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const chainId = active.id;
    const target = over.id;

    if (target === "ranking-list") {
      removeChainById(chainId);
      return;
    }

    setSlot(target, chainId);
  };

  // 🟢 슬롯 UI 색상 제공
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
        
        {/* TITLE */}
        <h2 className="text-xl font-bold mb-6">HEMP Rank</h2>

        {/* 🔵 FILTER BUTTONS */}
        <div className="flex items-center gap-4 mb-4">
          
          {/* Chain 정렬 버튼 */}
          <button
            className="flex items-center gap-1"
            onClick={() => setSortType("name")}
          >
            <span
              style={{
                color: sortType === "name" ? "#FFFFFF" : "#6D7380",
                fontFamily: "SUIT",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              Chain
            </span>

            <img
              src="/Icons/filter.png"
              alt="filter"
              className="w-4 h-4 opacity-70"
            />
          </button>

          {/* Score 정렬 버튼 */}
          <button
            className="flex items-center gap-1"
            onClick={() => setSortType("score")}
          >
            <span
              style={{
                color: sortType === "score" ? "#FFFFFF" : "#6D7380",
                fontFamily: "SUIT",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              HEMP Score
            </span>

            <img
              src="/Icons/filter.png"
              alt="filter"
              className="w-4 h-4 opacity-70"
            />
          </button>
        </div>

        {/* 🔵 LIST AREA (스크롤) */}
        <div className="flex-1 overflow-y-auto pr-1">
          <DroppableListArea>
            {sortedChains.map((chain) => (
              <DraggableChain
                key={chain.id}
                chain={chain}
                selectionInfo={getSelectionInfo(chain.id)}
              />
            ))}
          </DroppableListArea>
        </div>

        {/* 🔵 SLOT AREA (아래 고정) */}
        <div className="mt-6 space-y-3 flex-shrink-0 pb-4">
          <DroppableSlot
            id="main"
            title="MAIN CHAIN"
            color={COLORS.MAIN}
            selectedChainId={selectedMainId}
            onClear={() => clearSlot("main")}
          />

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

      {/* DRAG OVERLAY */}
      {createPortal(
        <DragOverlay>
          {activeChain ? <DraggableChain chain={activeChain} isOverlay /> : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};

export default RankingChart;
