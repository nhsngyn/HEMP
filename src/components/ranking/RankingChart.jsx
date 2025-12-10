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
    applySelection, // [필수] setSlot 대신 이걸 써야 합니다.
    clearSlot,
    removeChainById,
  } = useChainStore();

  const [activeId, setActiveId] = React.useState(null);
  const [sortType, setSortType] = React.useState("score");

  // [설정] 드래그 감도 조절 (클릭과 구분하기 위해 5px 움직여야 드래그 시작)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // 정렬 로직
  const sortedChains = [...allChains].sort((a, b) =>
    sortType === "name" ? a.name.localeCompare(b.name) : b.score - a.score
  );

  const activeChain = allChains.find((c) => c.id === activeId);

  // [중요] 이미 슬롯에 들어간 체인은 리스트에서 빼야 합니다. (ID 중복 방지)
  const selectedIds = [selectedMainId, selectedSubId1, selectedSubId2];
  const availableChains = sortedChains.filter(chain => !selectedIds.includes(chain.id));

  const getSelectionInfo = (id) => {
    if (id === selectedMainId) return { type: "main", color: COLORS.MAIN };
    if (id === selectedSubId1) return { type: "sub1", color: COLORS.SUB1 };
    if (id === selectedSubId2) return { type: "sub2", color: COLORS.SUB2 };
    return null;
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const chainId = active.id;
    const target = over.id;

    // 1. 리스트 영역으로 드롭 -> 슬롯 해제
    if (target === "ranking-list") {
      removeChainById(chainId);
      return;
    }

    // 2. 슬롯으로 드롭 -> applySelection 사용
    // target ID("main", "sub1", "sub2")를 그대로 넘김
    applySelection(chainId, target);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e) => setActiveId(e.active.id)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full select-none">
        <h2 className="text-[18px] font-semibold mb-[29.9px]">HEMP Rank</h2>

        {/* 필터 버튼 영역 (기존 코드 유지) */}
        <div className="flex items-center gap-4 mb-4">
          <button className="flex items-center gap-1" onClick={() => setSortType("name")}>
             <span className="text-gray-400 font-semibold text-[16px]">Chain</span>
             <img src="/Icons/filter.png" className="w-4 h-4 opacity-70" alt="" />
          </button>
          <button className="flex items-center gap-1" onClick={() => setSortType("score")}>
             <span className="text-white font-semibold text-[16px]">HEMP Score</span>
             <img src="/Icons/filter.png" className="w-4 h-4 opacity-70" alt="" />
          </button>
        </div>

        {/* 리스트 영역 */}
        <div className="h-[280px]">
          <DroppableListArea>
            {/* [중요] filtered된 availableChains 사용 */}
            {availableChains.map((chain) => (
              <DraggableChain
                key={chain.id}
                chain={chain}
                selectionInfo={getSelectionInfo(chain.id)}
              />
            ))}
          </DroppableListArea>
        </div>

        {/* 슬롯 영역 */}
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

      {/* 드래그 오버레이 */}
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