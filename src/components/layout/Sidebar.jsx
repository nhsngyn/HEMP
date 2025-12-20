import React from "react";
import RankingChart from "../ranking/RankingChart";

const Sidebar = () => {
  return (
    <div className="flex flex-col w-full h-full text-white">
      
      {/* 상단 HEMP 타이틀 (RankingChart 내부 패딩과 라인 맞춤) */}
      <h1 className="text-[28px] font-bold px-6 pt-[60px] shrink-0">
        HEMP
      </h1>

      {/* 랭킹 차트 리스트 */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        {/* RankingChart 내부에도 p-6 패딩이 있어서 자연스럽게 정렬됨 */}
        <RankingChart />
      </div>
    </div>
  );
};

export default Sidebar;