import React from "react";
import { useDroppable } from "@dnd-kit/core";
import useChainStore from "../../store/useChainStore";

const DroppableSlot = ({ id, title, color, selectedChainId, onClear }) => {
  const { setNodeRef } = useDroppable({ id });
  const { allChains } = useChainStore(); 

  const selectedChain = allChains.find((c) => c.id === selectedChainId);
  const isSelected = !!selectedChain;

  const logoUrl = selectedChain?.logoUrl || "/logos/chainImg.png"; 
  const chainName = selectedChain?.name;

  const LOGO_SIZE = '29.75px';
  const LOGO_NAME_GAP = '7.44px';
  const INNER_PADDING_VERTICAL = '11.158px';
  const INNER_PADDING_LEFT = '13.017px';
  const INNER_PADDING_RIGHT = '11.158px'; 

  // X 버튼 클릭 핸들러
  const handleClear = (e) => {
    e.stopPropagation();
    onClear();
  };
  
  const nameClasses = "text-gray-100 font-semibold leading-normal tracking-[-0.344px]";
  const nameStyle = { fontSize: '17.213px' };

  return (
    // 전체 컨테이너: Title + Slot Box
    <div className="flex flex-col gap-1 w-[214px]">
      
      {/* SLOT LABEL (Title) */}
      <span className="text-white text-base font-semibold">
        {title}
      </span>

      {/* SLOT BOX (Droppable Area) */}
      <div
        ref={setNodeRef}
        className={`
          flex items-center 
          w-[214px] h-[48px] 
          rounded-[5.744px]
          transition-all 
          bg-transparent
        `}
        style={{
          // 기본 테두리: dashed gray500 (#4C5564). 선택 시 솔리드 컬러
          border: isSelected ? `1px solid ${color}` : `1px dashed #4C5564`, 
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

        {/* 2. 슬롯 프레임 (Inner Content Area) */}
        <div 
          className={`
            flex items-center flex-1 self-stretch relative h-full 
            bg-[#191C23] // var(--gray800)
            rounded-[0_4.744px_4.744px_0]
          `}
          style={{ 
            paddingTop: INNER_PADDING_VERTICAL, 
            paddingBottom: INNER_PADDING_VERTICAL, 
            paddingLeft: INNER_PADDING_LEFT, 
            paddingRight: INNER_PADDING_RIGHT, 
          }}
        >
          {/* CONTENT (Selected Chain or Placeholder) */}
          {selectedChain ? (
            <div className="flex items-center w-full justify-between">
                {/* 로고 & 이름 그룹 */}
                <div className="flex items-center flex-shrink-0" style={{ gap: LOGO_NAME_GAP }}> 
                    {/* 원형 체인 로고 */}
                    <img 
                        src={logoUrl} 
                        alt={`${chainName} logo`}
                        className="rounded-full flex-shrink-0"
                        style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
                    />
                    {/* 체인 이름 */}
                    <span 
                        className={nameClasses}
                        style={nameStyle}
                    >
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
          null
          )}
        </div>
      </div>
    </div>
  );
};

export default DroppableSlot;