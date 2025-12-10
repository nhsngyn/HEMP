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
  const [sortType, setSortType] = React.useState("score");

  const sortedChains = [...allChains].sort((a, b) =>
    sortType === "name" ? a.name.localeCompare(b.name) : b.score - a.score
  );

  const activeChain = allChains.find((c) => c.id === activeId);

  const getSelectionInfo = (id) => {
    if (id === selectedMainId) return { type: "main", color: COLORS.MAIN };
    if (id === selectedSubId1) return { type: "sub1", color: COLORS.SUB1 };
    if (id === selectedSubId2) return { type: "sub2", color: COLORS.SUB2 };
    return null;
  };

  return (
    <DndContext
      onDragStart={(e) => setActiveId(e.active.id)}
      onDragEnd={(event) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over) return;

        const chainId = active.id;
        const target = over.id;

        // 리스트 영역으로 드롭 → 리스트로 되돌리기
        if (target === "ranking-list") {
          removeChainById(chainId);
          return;
        }

        // 슬롯(main/sub1/sub2)으로 드롭
        setSlot(target, chainId);
      }}
    >
      <div className="flex flex-col h-full select-none">

        {/* TITLE */}
        <h2 className="text-[18px] font-semibold mb-[29.9px]">HEMP Rank</h2>

        {/* FILTER BUTTONS */}
        <div className="flex items-center gap-4 mb-4">
          {/* Chain 정렬 */}
          <button
            className="flex items-center gap-1"
            onClick={() => setSortType("name")}
          >
            <span
              className={
                sortType === "name"
                  ? "text-white font-semibold text-[16px]"
                  : "text-gray-400 font-semibold text-[16px]"
              }
            >
              Chain
            </span>
            <img src="/Icons/filter.png" className="w-4 h-4 opacity-70" />
          </button>

          {/* Score 정렬 */}
          <button
            className="flex items-center gap-1"
            onClick={() => setSortType("score")}
          >
            <span
              className={
                sortType === "score"
                  ? "text-white font-semibold text-[16px]"
                  : "text-gray-400 font-semibold text-[16px]"
              }
            >
              HEMP Score
            </span>
            <img src="/Icons/filter.png" className="w-4 h-4 opacity-70" />
          </button>
        </div>

        {/* LIST AREA (고정 height + 내부 DroppableListArea) */}
        <div className="h-[280px]">
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

        {/* SLOT AREA (고정 height) */}
        <div className="h-[226px] mt-6 flex flex-col justify-between">
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
          {activeChain && <DraggableChain chain={activeChain} isOverlay />}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};

export default RankingChart;
