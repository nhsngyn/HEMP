import React from "react";
import { useDroppable } from "@dnd-kit/core";
import useChainStore from "../../store/useChainStore";
import { COLORS } from "../../constants/colors";

const DroppableSlot = ({ id, color, selectedChainId, onClear, placeholderText }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const { allChains } = useChainStore(); 

  const selectedChain = allChains.find((c) => c.id === selectedChainId);
  const isSelected = !!selectedChain;

  const logoUrl = selectedChain?.logoUrl || "/logos/chainImg.png"; 
  const chainName = selectedChain?.name;

  // 스타일 상수
  const LOGO_SIZE = '24px'; 
  const INNER_PADDING_LEFT = '12px';
  const INNER_PADDING_RIGHT = '12px'; 

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
        border: isSelected ? '1px solid COLORS.GRAY800' : `1px dashed #29303A`, 
        backgroundColor: isSelected ? 'COLORS.GRAY800' : 'transparent',
      }}
    >
      {/* 1. 하이라이트 선 (Left Edge Bar) */}
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
          /* [상태 1] 체인이 선택되었을 때 */
          <div className="flex items-center w-full justify-between">
              <div className="flex items-center gap-2"> 
                  <img 
                      src={logoUrl} 
                      alt={`${chainName} logo`}
                      className="rounded-full flex-shrink-0 bg-white"
                      style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
                  />
                  <span className="text-body2-sb">
                      {chainName}
                  </span>
              </div>
              
              <button
  onClick={handleClear}
  className="
    flex items-center justify-center 
    z-10 flex-shrink-0 
    opacity-80 hover:opacity-100 
    transition-opacity
  "
  title="Remove"
>
  <img
    src="/Icons/icon_delete_20.svg"
    alt="delete"
    className="w-5 h-5" 
    style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
  />
</button>
          </div>
        ) : (
          /* [상태 2] 빈 슬롯일 때 */
          <div className="flex items-center gap-2 w-full opacity-40">
             <div 
                className="rounded-full bg-gray-600 flex-shrink-0"
                style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
              ></div>
              <span className="text-gray-400 text-body2-sb">
                {placeholderText || "Select Chain"}
              </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DroppableSlot;