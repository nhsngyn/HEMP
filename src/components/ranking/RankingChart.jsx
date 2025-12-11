import React, { useState, useMemo } from 'react';
import { 
  DndContext,
  useDraggable,
  useDroppable,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { createPortal } from 'react-dom';
import useChainStore from '../../store/useChainStore';
import useChainSelection from '../../hooks/useChainSelection';
import { COLORS } from '../../constants/colors';

// ---------------------------
// 1. 공통 디자인 컴포넌트 (변경 없음)
// ---------------------------
const ChainCard = ({ chain, selectionInfo, isOverlay, isDragging, style, ...props }) => {
  const isSelected = !!selectionInfo;
  const borderColor = isSelected ? selectionInfo.color : '#374151';

  const finalStyle = { 
    ...style,
    borderColor: isOverlay ? '#FFFFFF' : borderColor,
    boxShadow: isSelected && !isDragging && !isOverlay 
      ? `0 0 10px ${selectionInfo.color}40` 
      : 'none',
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      style={finalStyle}
      className={`
        p-3 mb-2 rounded border-2 flex justify-between items-center group transition-all duration-300 ease-in-out
        ${isOverlay ? 'bg-gray-700 scale-105 z-50 shadow-xl' : 'bg-[#1A1B20]'}
        ${isSelected && !isOverlay ? 'bg-opacity-20' : 'hover:border-gray-400'}
        ${props.cursor ? props.cursor : ''} 
      `}
      {...props}
    >
      <div className="flex items-center gap-2">
        {isSelected && (
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectionInfo.color }} />
        )}
        <span className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-gray-300'}`}>
          {chain.name}
        </span>
      </div>
      
      <span className={`text-xs ${isOverlay ? 'text-white' : 'text-gray-500'}`}>
        {chain.score}
      </span>
    </div>
  );
};

// ---------------------------
// 2. DraggableChain
// ---------------------------
const DraggableChain = ({ chain, selectionInfo, onClick }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: chain.id,
    data: { chain, selectionInfo } 
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
    >
      <ChainCard 
        chain={chain} 
        selectionInfo={selectionInfo} 
        isDragging={isDragging}
        isSlotItem={true} 
        cursor="cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};

// ---------------------------
// 3. 리스트 영역 (변경 없음)
// ---------------------------
const DroppableListArea = ({ children }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'ranking-list' });

  return (
    <div 
      ref={setNodeRef} 
      className={`flex-1 overflow-y-auto px-4 pt-2 custom-scrollbar transition-colors
        ${isOver ? 'bg-white/5' : ''} 
      `}
    >
      <h3 className="text-xs text-gray-500 mb-3 uppercase font-bold tracking-wider">
        All Chains List
      </h3>
      {children}
    </div>
  );
};

// ---------------------------
// 4. 슬롯 영역
// ---------------------------
const DroppableSlot = ({ id, title, color, selectedChainId, onClear }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const { allChains } = useChainStore();
  
  const selectedChain = allChains.find(c => c.id === selectedChainId);

  return (
    <div 
      ref={setNodeRef}
      className={`relative w-full h-16 rounded-lg border-2 mb-0 flex flex-col justify-center transition-all duration-200
        ${isOver ? 'bg-gray-700 border-white' : 'border-dashed border-gray-600'}
        ${selectedChain ? 'border-solid bg-opacity-10' : ''}
      `}
      style={{ 
        borderColor: isOver ? '#FFFFFF' : (selectedChain ? color : undefined), 
        backgroundColor: selectedChain ? `${color}10` : undefined,
      }}
    >
      <span className="absolute top-1 left-2 text-[9px] font-bold uppercase opacity-70 tracking-widest" style={{ color: color }}>
        {title}
      </span>

      {selectedChain ? (
        <div className="w-full h-full flex items-center justify-center px-2 pt-3">
            <div className="w-full">
                 {/* 슬롯에 있는 아이템은 Draggable 상태 */}
                 <DraggableChain chain={selectedChain} selectionInfo={{ color }} />
            </div>
    
            <button 
                onPointerDown={(e) => e.stopPropagation()} 
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="absolute top-1 right-2 text-gray-500 hover:text-white text-xs z-10 p-1 cursor-pointer"
            >
                ✕
            </button>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-600 text-sm pointer-events-none pt-2">
          Drag here
        </div>
      )}
    </div>
  );
};

// ---------------------------
// 5. 메인 컴포넌트
// ---------------------------
const RankingChart = () => {
  const { allChains, selectedMainId, selectedSubId1, selectedSubId2, clearSlot, removeChainById } = useChainStore();
  const { selectChain, applySelection, getSelectionInfo } = useChainSelection();
  
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, 
      },
    })
  );

  const sortedChains = useMemo(() => {
    return [...(allChains || [])].sort((a, b) => b.score - a.score);
  }, [allChains]);

  const handleDragStart = (event) => setActiveId(event.active.id);

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

  // [FIX 1] activeChain 계산 로직 추가
  const activeChain = useMemo(() => 
    allChains.find((c) => c.id === activeId),
  [activeId, allChains]);

  // [FIX 1-1] DragOverlay에 표시할 선택 정보 (색상 등) 계산
  const activeSelectionInfo = useMemo(() => {
    if (!activeId) return null;
    return getSelectionInfo(activeId); 
  }, [activeId, getSelectionInfo]);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="w-full h-full relative bg-[#0d0d0d] flex flex-col overflow-hidden select-none">
        
        <div className="p-4 bg-[#0d0d0d] z-10 border-b border-gray-800 shrink-0">
          <h2 className="text-xl font-bold text-white">HEMP Rank</h2>
        </div>

        <DroppableListArea>
          {sortedChains.map((chain) => {
            const selectionInfo = getSelectionInfo(chain.id);
            
            if (selectionInfo) {
              return (
                <div key={chain.id} className="opacity-50 pointer-events-none grayscale">
                   <ChainCard
                    chain={chain}
                    selectionInfo={selectionInfo}
                    cursor="cursor-default"
                  />
                </div>
              );
            }

            return (
              <DraggableChain 
                key={chain.id}
                chain={chain}
                selectionInfo={null}
                onClick={() => selectChain(chain.id)}
              />
            );
          })}
        </DroppableListArea>

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
          {activeChain ? (
            <ChainCard 
              chain={activeChain} 
              selectionInfo={activeSelectionInfo}
              isOverlay={true} 
            />
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};

export default RankingChart;