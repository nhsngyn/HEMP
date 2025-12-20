import React from "react";
import { useDroppable } from "@dnd-kit/core";
import useChainStore from "../../store/useChainStore";

const DroppableSlot = ({ id, color, selectedChainId, onClear, placeholderText }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const { allChains } = useChainStore(); 

  const selectedChain = allChains.find((c) => c.id === selectedChainId);
  const isSelected = !!selectedChain;

  const logoUrl = selectedChain?.logoUrl || "/logos/chainImg.png"; 
  const chainName = selectedChain?.name;

  const LOGO_SIZE = '24px'; 
  const INNER_PADDING_LEFT = '13.017px';
  const INNER_PADDING_RIGHT = '11.158px'; 

  const handleClear = (e) => {
    e.stopPropagation();
    onClear();
  };
  
  return (
    <div
      ref={setNodeRef}
      className={`
        flex items-center 
        w-full h-[48px] 
        rounded-[5.744px]
        transition-all 
        bg-transparent
        ${isOver ? "ring-1 ring-gray-500 bg-gray-800/50" : ""}
      `}
      style={{
        border: isSelected ? '1px solid #29303A' : `1px dashed #29303A`, 
        backgroundColor: isSelected ? '#191C23' : 'transparent',
      }}
    >
      {/* 1. 하이라이트 선 */}
      <div 
        className="flex-shrink-0 self-stretch"
        style={{ 
          width: '5.772px', 
          backgroundColor: color, 
          borderRadius: '5.744px 0 0 5.744px',
        }}
      ></div>

      {/* 2. 슬롯 내부 콘텐츠 */}
      <div 
        className="flex items-center flex-1 self-stretch relative h-full"
        style={{ 
          paddingLeft: INNER_PADDING_LEFT, 
          paddingRight: INNER_PADDING_RIGHT, 
        }}
      >
        {selectedChain ? (
          <div className="flex items-center w-full justify-between">
              <div className="flex items-center gap-2"> 
                  <img 
                      src={logoUrl} 
                      alt={`${chainName} logo`}
                      className="rounded-full flex-shrink-0 bg-white"
                      style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
                  />
                  <span className="text-gray-100 font-semibold text-[15px] truncate">
                      {chainName}
                  </span>
              </div>
              
              {/* 삭제 아이콘 버튼 */}
              <button
                  onClick={handleClear}
                  className="
                    flex items-center justify-center 
                    z-10 flex-shrink-0 
                    opacity-60 hover:opacity-100 
                    transition-opacity
                  "
                  title="Remove"
              >
                  <img 
                    src="/Icons/icn_delete_20.png" 
                    alt="delete" 
                    className="w-5 h-5"
                  />
              </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full opacity-40">
             <div 
                className="rounded-full bg-gray-600 flex-shrink-0"
                style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
              ></div>
              <span className="text-gray-400 text-sm font-medium truncate">
                {placeholderText || "Select Chain"}
              </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DroppableSlot;