import React from "react";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor
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
    selectedSubId2
  } = useChainSelection();

  const [activeId, setActiveId] = React.useState(null);
  const [sortType, setSortType] = React.useState("score");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const sortedChains = [...allChains].sort((a, b) =>
    sortType === "name" ? a.name.localeCompare(b.name) : b.score - a.score
  );

  const activeChain = allChains.find((c) => c.id === activeId);
  const selectedIds = [selectedMainId, selectedSubId1, selectedSubId2].filter(id => id !== null);

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
        <h2 className="text-[18px] font-semibold mb-[29.9px] shrink-0">HEMP Rank</h2>

        {/* FILTER BUTTONS */}
        <div className="
            flex items-center gap-4 
            mb-4 pb-3 shrink-0 
            border-b border-[#29303A] w-full
        ">
          <button className="flex items-center gap-1" onClick={() => setSortType("name")}>
            <span className={sortType === "name" ? "text-white text-xs font-semibold leading-tight" : "text-gray-400 text-xs font-semibold leading-tight"}>
              Chain
            </span>
            <img src="/Icons/icn_sort_24.png" className="w-6 h-6" alt="filter" />
          </button>

          <button className="flex items-center gap-1" onClick={() => setSortType("score")}>
            <span className={sortType === "score" ? "text-white text-xs font-semibold leading-tight" : "text-gray-400 text-xs font-semibold leading-tight"}>
              HEMP Score
            </span>
            <img src="/Icons/icn_sort_24.png" className="w-6 h-6" alt="filter" />
          </button>
        </div>

        {/* LIST AREA */}
        <div className="flex-1 min-h-0 overflow-y-auto mb-4">
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
        <div className="shrink-0 flex flex-col gap-6 pt-2 border-t border-white/5">
          
          {/* Main Section */}
          <div>
            <h3 className="text-gray-500 text-xs font-medium mb-2 pl-1">
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

          {/* Comparison Section */}
          <div>
            <h3 className="text-gray-500 text-xs font-medium mb-2 pl-1">
              Comparison
            </h3>
            <div className="flex flex-col gap-3">
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
              isOverlay={true}
            />
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};

export default RankingChart;