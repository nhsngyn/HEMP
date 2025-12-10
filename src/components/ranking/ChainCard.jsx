import React from 'react';

const ChainCard = ({ chain, selectionInfo, isOverlay, isDragging }) => {
    // 100점일 때 120px의 길이를 가지도록 스코어에 비례하여 너비 계산
    const scoreBarWidth = (chain.score / 100) * 120; 

    // 랭킹 표시 (스코어가 없는 경우 비워둠)
    const rank = chain.score ? chain.rank : '';

    return (
        <div 
            // 드래그 중이거나 오버레이일 때의 스타일링은 DraggableChain.jsx에서 처리되므로 여기서는 기본 스타일만 유지
            className={`flex items-center w-full min-h-[44px] ${isOverlay ? 'bg-zinc-800' : 'bg-transparent'} rounded-[4px] px-[8px] py-[10px]`}
        >
            {/* 랭크 및 아이콘 */}
            <div className='flex-shrink-0 flex items-center w-[30px]'>
                {rank && (
                    <span className='text-gray-400 text-[14px] font-medium'>
                        {rank}
                    </span>
                )}
                <img src="/logos/chainImg.png" className='w-5 h-5 ml-1' alt={`${chain.name} logo`} />
            </div>

            {/* 체인 이름 (수정 요청 사항 적용) */}
            {/* [수정 1] TailwindCSS로 요청하신 CSS 속성을 변환하여 적용합니다. 
                color: var(--gray200, #D1D5DB) -> text-gray-200
                font-family: SUIT (Tailwind 기본폰트로 가정)
                font-size: 16px -> text-base
                font-weight: 500 -> font-medium
                letter-spacing: -0.32px -> tracking-tight
                gap: 8px (막대바와의 간격) -> gap-2
            */}
            <div className="flex items-center flex-grow text-gray-200 text-base font-medium tracking-tight leading-[140%]">
                <span className="flex-grow">{chain.name}</span>
                
                {/* 막대바 영역 (gap-2 = 8px 적용) */}
                <div className="flex items-center gap-2"> 
                    <div 
                        className="h-2 bg-gray-600 rounded-sm"
                        style={{
                            // [수정 2] 100점 = 120px 크기 적용
                            width: `${scoreBarWidth}px`, 
                            backgroundColor: selectionInfo?.color || '#374151', // 선택된 체인은 해당 색상, 아니면 gray-700
                        }}
                    ></div>
                    
                    {/* 스코어 텍스트 */}
                    <span className='text-[16px] font-semibold text-gray-200'>
                        {chain.score.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* 메인/서브 표시 (선택된 경우) */}
            {selectionInfo && (
                <div 
                    className='w-1 h-1 rounded-full ml-2 flex-shrink-0'
                    style={{ backgroundColor: selectionInfo.color }}
                ></div>
            )}
        </div>
    );
};

export default ChainCard;