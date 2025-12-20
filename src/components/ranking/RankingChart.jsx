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
// useChainSelection 훅을 가져오기
import useChainSelection from "../../hooks/useChainSelection";
import { COLORS } from "../../constants/colors";

import DraggableChain from "./DraggableChain";
import DroppableSlot from "./DroppableSlot";
import DroppableListArea from "./DroppableListArea";

const RankingChart = () => {
  // DND 처리에 필요한 함수만 useChainStore에서 가져오기
  const {
    allChains,
    applySelection,
    clearSlot,
    removeChainById,
  } = useChainStore();

  // 선택 로직 관련 모든 상태와 함수는 useChainSelection에서 가져오기
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

    // 리스트 영역으로 드롭 → 슬롯 해제
    if (target === "ranking-list") {
      removeChainById(chainId);
      return;
    }

    // 슬롯(main/sub1/sub2)으로 드롭
    applySelection(chainId, target);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e) => setActiveId(e.active.id)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full w-full select-none" style={{ padding: 'clamp(20px, 2vw, 32px)' }}>

        {/* TITLE */}
        <h2 className="font-semibold shrink-0" style={{ fontSize: 'clamp(16px, 1.2vw, 20px)', marginBottom: 'clamp(24px, 2vh, 32px)' }}>HEMP Rank</h2>

        {/* FILTER BUTTONS */}
        <div className="flex items-center shrink-0" style={{ gap: 'clamp(12px, 1.2vw, 20px)', marginBottom: 'clamp(12px, 1.5vh, 20px)' }}>
          {/* Chain 정렬 */}
          <button
            className="flex items-center gap-1"
            onClick={() => setSortType("name")}
          >
            <span
              className={
                sortType === "name"
                  ? "text-white text-xs font-semibold leading-tight"
                  : "text-gray-400 text-xs font-semibold leading-tight"
              }
            >
              Chain
            </span>
            <img src="/Icons/filter.png" className="w-4 h-4 opacity-70" alt="filter" />
          </button>

          {/* Score 정렬 */}
          <button
            className="flex items-center gap-1"
            onClick={() => setSortType("score")}
          >
            <span

              className={
                sortType === "score"
                  ? "text-white text-xs font-semibold leading-tight"
                  : "text-gray-400 text-xs font-semibold leading-tight"
              }
            >
              HEMP Score
            </span>
            <img src="/Icons/filter.png" className="w-4 h-4 opacity-70" alt="filter" />
          </button>
        </div>

        {/* LIST AREA */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <DroppableListArea>
            {sortedChains.map((chain) => {
              const isSelected = selectedIds.includes(chain.id);
              return (
                <DraggableChain
                  key={chain.id}
                  chain={chain}
                  selectionInfo={getSelectionInfo(chain.id)}
                  isSelected={isSelected}
                  // onClick에 selectChain 함수를 사용합니다.
                  // selectChain 함수가 useChainStore의 applySelection(null)을 호출하여 스마트 셀렉션을 실행합니다.
                  onClick={() => selectChain(chain.id)}
                />
              );
            })}
          </DroppableListArea>
        </div>

        {/* SLOT AREA */}
        <div className="mt-6 flex flex-col justify-between shrink-0">
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