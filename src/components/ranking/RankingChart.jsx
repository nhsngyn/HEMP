import React from "react";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { createPortal } from "react-dom";

import useChainStore from "../../store/useChainStore";
import useChainSelection from "../../hooks/useChainSelection";
import { COLORS } from "../../constants/colors";

import DraggableChain from "./DraggableChain";
import DroppableSlot from "./DroppableSlot";
import DroppableListArea from "./DroppableListArea";

const RankingChart = () => {
  const {
    allChains,
    applySelection,
    clearSlot,
    removeChainById,
  } = useChainStore();

  const {
    selectChain,
    getSelectionInfo,
    selectedMainId,
    selectedSubId1,
    selectedSubId2,
  } = useChainSelection();

  const [activeId, setActiveId] = React.useState(null);

  /* =========================
   * SORT CONFIG
   * ========================= */
  const [sortConfig, setSortConfig] = React.useState({
    key: "score", // 'name' | 'score'
    order: "desc", // 'asc' | 'desc'
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  /* =========================
   * SORTED CHAINS
   * ========================= */
  const sortedChains = [...allChains].sort((a, b) => {
    const { key, order } = sortConfig;

    if (key === "name") {
      const result = a.name.localeCompare(b.name);
      return order === "asc" ? result : -result;
    }

    if (key === "score") {
      const result = a.score - b.score;
      return order === "asc" ? result : -result;
    }

    return 0;
  });

  const activeChain = allChains.find((c) => c.id === activeId);
  const selectedIds = [
    selectedMainId,
    selectedSubId1,
    selectedSubId2,
  ].filter((id) => id !== null);

  /* =========================
   * SORT HANDLERS
   * ========================= */
  const handleSortClick = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          ...prev,
          order: prev.order === "asc" ? "desc" : "asc",
        };
      }
      return { key, order: "asc" };
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return "/Icons/icn_sort_default_24.svg";
    }
    return sortConfig.order === "asc"
      ? "/Icons/icn_sort_up_24.svg"
      : "/Icons/icn_sort_down_24.svg";
  };

  /* =========================
   * DND HANDLERS
   * ========================= */
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

    applySelection(chainId, target);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e) => setActiveId(e.active.id)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full w-full select-none">

        {/* TITLE */}
        <h2 className="text-gray-200 text-[18px] font-semibold mb-[30px]">
          HEMP Rank
        </h2>

        {/* FILTER BUTTONS */}
        <div
          className="
            flex items-center gap-4
            mb-1 pb-3 shrink-0 
            border-b w-full
            pl-[9px]
          "
          style={{ borderColor: COLORS.GRAY700 }}
        >
          {/* Name Sort */}
          <button
            className="flex items-center gap-1"
            onClick={() => handleSortClick("name")}
          >
            <span
              className={
                sortConfig.key === "name"
                  ? "text-white text-xs font-semibold leading-tight"
                  : "text-gray-400 text-xs font-semibold leading-tight"
              }
            >
              Name
            </span>
            <img
              src={getSortIcon("name")}
              className="w-6 h-6"
              alt="sort by name"
            />
          </button>

          {/* Score Sort */}
          <button
            className="flex items-center gap-1"
            onClick={() => handleSortClick("score")}
          >
            <span
              className={
                sortConfig.key === "score"
                  ? "text-white text-xs font-semibold leading-tight"
                  : "text-gray-400 text-xs font-semibold leading-tight"
              }
            >
              HEMP Score
            </span>
            <img
              src={getSortIcon("score")}
              className="w-6 h-6"
              alt="sort by score"
            />
          </button>
        </div>

        {/* LIST AREA */}
        <div className="flex-1 min-h-0 overflow-y-auto mb-[35px]">
          <DroppableListArea>
            {sortedChains.map((chain) => {
              const isSelected = selectedIds.includes(chain.id);
              return (
                <DraggableChain
                  key={chain.id}
                  chain={chain}
                  selectionInfo={getSelectionInfo(chain.id)}
                  isSelected={isSelected}
                  onClick={() => selectChain(chain.id)}
                />
              );
            })}
          </DroppableListArea>
        </div>

        {/* SLOT AREA */}
        <div className="shrink-0 flex flex-col gap-[24px]">

          {/* Main */}
          <div>
            <h3 className="text-gray-500 text-xs font-medium mb-[8px]">
              Main
            </h3>
            <DroppableSlot
              id="main"
              color={COLORS.MAIN}
              placeholderText="Main Chain"
              selectedChainId={selectedMainId}
              onClear={() => clearSlot("main")}
            />
          </div>

          {/* Comparison */}
          <div>
            <h3 className="text-gray-500 text-xs font-medium mb-[8px]">
              Comparison
            </h3>
            <div className="flex flex-col gap-[8px]">
              <DroppableSlot
                id="sub1"
                color={COLORS.SUB1}
                placeholderText="Chain1"
                selectedChainId={selectedSubId1}
                onClear={() => clearSlot("sub1")}
              />
              <DroppableSlot
                id="sub2"
                color={COLORS.SUB2}
                placeholderText="Chain2"
                selectedChainId={selectedSubId2}
                onClear={() => clearSlot("sub2")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* DRAG OVERLAY */}
      {createPortal(
        <DragOverlay>
          {activeChain && (
            <DraggableChain
              chain={activeChain}
              isOverlay
            />
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};

export default RankingChart;
