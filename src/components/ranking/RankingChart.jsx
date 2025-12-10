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
// [추가] useChainSelection 훅을 가져옵니다.
import useChainSelection from "../../hooks/useChainSelection"; 
import { COLORS } from "../../constants/colors";

import DraggableChain from "./DraggableChain";
import DroppableSlot from "./DroppableSlot";
import DroppableListArea from "./DroppableListArea";

const RankingChart = () => {
  // [수정] DND 처리에 필요한 함수만 useChainStore에서 가져옵니다.
  const {
    allChains,
    applySelection, // DND dragEnd 로직을 위해 유지
    clearSlot,
    removeChainById,
  } = useChainStore();
  
  // [추가] 선택 로직 관련 모든 상태와 함수는 useChainSelection에서 가져옵니다.
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

  // NOTE: getSelectionInfo는 이제 useChainSelection 훅에서 제공합니다.

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const chainId = active.id;
    const target = over.id;

    // 리스트 영역으로 드롭 → 슬롯 해제 (리스트로 되돌리기)
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
      <div className="flex flex-col h-full select-none">

        {/* TITLE and FILTER BUTTONS (생략) */}
        <h2 className="text-[18px] font-semibold mb-[29.9px]">HEMP Rank</h2>
        <div className="flex items-center gap-4 mb-4">
          <button className="flex items-center gap-1" onClick={() => setSortType("name")}>
             <span className={sortType === "name" ? "text-white font-semibold text-[16px]" : "text-gray-400 font-semibold text-[16px]"}>Chain</span>
             <img src="/Icons/filter.png" className="w-4 h-4 opacity-70" alt="filter" />
          </button>
          <button className="flex items-center gap-1" onClick={() => setSortType("score")}>
             <span className={sortType === "score" ? "text-white font-semibold text-[16px]" : "text-gray-400 font-semibold text-[16px]"}>HEMP Score</span>
             <img src="/Icons/filter.png" className="w-4 h-4 opacity-70" alt="filter" />
          </button>
        </div>

        {/* LIST AREA */}
        <div className="h-[280px]">
          <DroppableListArea>
            {sortedChains.map((chain) => {
              const isSelected = selectedIds.includes(chain.id);
              return (
                <DraggableChain
                  key={chain.id}
                  chain={chain}
                  selectionInfo={getSelectionInfo(chain.id)}
                  isSelected={isSelected}
                  // [수정] onClick에 selectChain 함수를 사용합니다.
                  // selectChain 함수가 useChainStore의 applySelection(null)을 호출하여 스마트 셀렉션을 실행합니다.
                  onClick={() => selectChain(chain.id)} 
                />
              );
            })}
          </DroppableListArea>
        </div>

        {/* SLOT AREA (기존 코드 유지) */}
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

      {/* DRAG OVERLAY (기존 코드 유지) */}
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