import React from 'react';
import { DndContext, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';
import { createPortal } from 'react-dom';
import useChainStore from '../../store/useChainStore';
import { COLORS } from '../../constants/colors';

import ChainCard from "./ChainCard";

const DraggableChain = ({ chain, selectionInfo, isOverlay = false, onPointerDown, onPointerUp }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: chain.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <ChainCard 
        chain={chain}
        selectionInfo={selectionInfo}
        isOverlay={isOverlay}
        isDragging={isDragging}
      />
    </div>
  );
};


const DroppableListArea = ({ children }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'ranking-list' });

  return (
    <div 
      ref={setNodeRef} 
      className={`flex-1 overflow-y-auto pr-2 custom-scrollbar transition-colors rounded-lg p-2
        ${isOver ? 'bg-white/5' : ''} 
      `}
    >
      <h3 className="text-sm text-gray-400 mb-2">
        {isOver ? 'Release to Unselect ↩️' : 'All Chains'}
      </h3>
      {children}
    </div>
  );
};

const DroppableSlot = ({ id, title, color, selectedChainId, onClear }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const { allChains } = useChainStore();
  
  const selectedChain = allChains.find(c => c.id === selectedChainId);

  return (
    <div 
      ref={setNodeRef}
      className={`relative w-full h-24 rounded-lg border-2 mb-3 flex flex-col justify-center transition-all duration-200
        ${isOver ? 'bg-gray-700' : 'border-dashed border-gray-600'}
        ${selectedChain ? 'border-solid bg-opacity-10' : ''}
      `}
      style={{ 
        borderColor: isOver ? '#FFFFFF' : (selectedChain ? color : undefined), 
        backgroundColor: selectedChain ? `${color}10` : undefined,
      }}
    >
      <span className="absolute top-1 left-2 text-[10px] font-bold uppercase opacity-70" style={{ color: color }}>
        {title}
      </span>

      {selectedChain ? (
        <div className="w-full h-full flex items-center justify-center p-2">
            <div className="w-full">
                 <DraggableChain chain={selectedChain} selectionInfo={null} />
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="absolute top-1 right-2 text-gray-500 hover:text-white text-xs z-10"
            >
                ✕
            </button>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500 text-sm pointer-events-none">
          Drag here
        </div>
      )}
    </div>
  );
};

const RankingChart = () => {
  const { allChains, selectedMainId, selectedSubId1, selectedSubId2, setSlot, clearSlot, removeChainById } = useChainStore();
  const [activeId, setActiveId] = React.useState(null);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const chainId = active.id;
    const targetId = over.id;

    if (targetId === 'ranking-list') {
      removeChainById(chainId);
    } else {
      setSlot(targetId, chainId);
    }
  };

  const getSelectionInfo = (id) => {
    if (id === selectedMainId) return { type: 'main', color: COLORS.MAIN };
    if (id === selectedSubId1) return { type: 'sub1', color: COLORS.SUB1 };
    if (id === selectedSubId2) return { type: 'sub2', color: COLORS.SUB2 };
    return null; 
  };

  const activeChain = allChains.find(c => c.id === activeId);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full select-none">
        <h2 className="text-xl font-bold mb-4 text-white">HEMP Rank</h2>
        
        <div className="mb-6 space-y-2">
          <DroppableSlot 
            id="main" title="MAIN CHAIN" color={COLORS.MAIN} 
            selectedChainId={selectedMainId} onClear={() => clearSlot('main')} 
          />
          <div className="flex gap-2">
            <DroppableSlot 
              id="sub1" title="SUB 1" color={COLORS.SUB1} 
              selectedChainId={selectedSubId1} onClear={() => clearSlot('sub1')} 
            />
            <DroppableSlot 
              id="sub2" title="SUB 2" color={COLORS.SUB2} 
              selectedChainId={selectedSubId2} onClear={() => clearSlot('sub2')} 
            />
          </div>
        </div>

        <div className="border-t border-gray-700 my-2"></div>

        <DroppableListArea>
          {(allChains || []).map((chain) => {
            const selectionInfo = getSelectionInfo(chain.id);
            return (
              <DraggableChain 
                key={chain.id} 
                chain={chain} 
                selectionInfo={selectionInfo} 
              />
            );
          })}
        </DroppableListArea>
      </div>

      {createPortal(
        <DragOverlay>
          {activeChain ? (
            <DraggableChain 
              chain={activeChain} 
              isOverlay 
              selectionInfo={null} 
            />
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};

export default RankingChart;