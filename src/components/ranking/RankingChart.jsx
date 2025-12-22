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
  const [sortConfig, setSortConfig] = React.useState({
    key: "score",
    order: "desc",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

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
  const selectedIds = [selectedMainId, selectedSubId1, selectedSubId2].filter(Boolean);

  const handleSortClick = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { ...prev, order: prev.order === "asc" ? "desc" : "asc" }
        : { key, order: "asc" }
    );
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "/Icons/icn_sort_default_24.svg";
    return sortConfig.order === "asc"
      ? "/Icons/icn_sort_up_24.svg"
      : "/Icons/icn_sort_down_24.svg";
  };

  const handleDragEnd = ({ active, over }) => {
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
      <div className="flex flex-col h-full w-full relative select-none">
        <div className="flex items-center gap-3 shrink-0" style={{ marginBottom: '12px' }}>
          <h2 className="text-body2-b text-gray-200">HEMP Rank</h2>
        </div>

        <div
          className="flex items-center gap-4 mb-1 pb-3 shrink-0 border-b border-gray-700 w-full"
          style={{ paddingTop: 'calc(20px * var(--scale))' }}
        >
          <button
            className="flex items-center gap-1"
            onClick={() => handleSortClick("name")}
            style={{ paddingLeft: '8px' }}
          >
            <span className={`text-caption1-sb ${sortConfig.key === "name" ? "text-white" : "text-gray-400"}`}>
              Name
            </span>
            <img src={getSortIcon("name")} className="w-6 h-6" alt="sort by name" />
          </button>

          <button className="flex items-center gap-1" onClick={() => handleSortClick("score")}>
            <span className={`text-caption1-sb ${sortConfig.key === "score" ? "text-white" : "text-gray-400"}`}>
              HEMP Score
            </span>
            <img src={getSortIcon("score")} className="w-6 h-6" alt="sort by score" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden mb-[35px]">
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

        <div className="shrink-0 flex flex-col" style={{ gap: "35px" }}>
          <div>
            <h3 className="text-body3-m text-gray-500 mb-2">Main</h3>
            <DroppableSlot
              id="main"
              color="main"
              placeholderText="Drop here"
              selectedChainId={selectedMainId}
              onClear={() => clearSlot("main")}
            />
          </div>

          <div>
            <h3 className="text-body3-m text-gray-500 mb-2">Comparison</h3>
            <div className="flex flex-col gap-2">
              <DroppableSlot
                id="sub1"
                color="sub1"
                placeholderText="Drop here"
                selectedChainId={selectedSubId1}
                onClear={() => clearSlot("sub1")}
              />
              <DroppableSlot
                id="sub2"
                color="sub2"
                placeholderText="Drop here"
                selectedChainId={selectedSubId2}
                onClear={() => clearSlot("sub2")}
              />
            </div>
          </div>
        </div>
      </div>

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
