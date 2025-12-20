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

  // 스타일 상수 (사용자분 기존 코드 값 유지)
  const LOGO_SIZE = '24px'; // 로고 크기 살짝 조정 (박스 높이에 맞춤)
  const INNER_PADDING_LEFT = '13.017px';
  const INNER_PADDING_RIGHT = '11.158px'; 

  const handleClear = (e) => {
    e.stopPropagation();
    onClear();
  };
  
  return (
    // Title은 부모에서 처리하므로 여기선 제거
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
        // 선택되면 투명 테두리(혹은 스타일링), 아니면 점선 테두리
        border: isSelected ? '1px solid #29303A' : `1px dashed #29303A`, 
        backgroundColor: isSelected ? '#191C23' : 'transparent',
      }}
    >
      {/* 1. 하이라이트 선 (Left Edge Bar - 기존 디자인 유지) */}
      <div 
        className="flex-shrink-0 self-stretch"
        style={{ 
          width: '5.772px', 
          backgroundColor: color, 
          borderRadius: '5.744px 0 0 5.744px',
        }}
      ></div>

      {/* 2. 슬롯 내부 콘텐츠 (Inner Content Area) */}
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
                  <span className="text-gray-100 font-semibold text-[15px] truncate">
                      {chainName}
                  </span>
              </div>
              <button
                  onClick={handleClear}
                  className="text-gray-400 hover:text-white text-sm z-10 flex-shrink-0"
              >
                  ✕
              </button>
          </div>
        ) : (
          /* [상태 2] 빈 슬롯일 때 (Placeholder 추가) */
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