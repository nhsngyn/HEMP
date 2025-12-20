import React from "react";
import RankingChart from "../ranking/RankingChart";

const Sidebar = () => {
  return (
    <div className="flex flex-col w-full h-full px-4 py-[60px] text-white">
      {/* 상단 타이틀 */}
      <h1 className="text-[28px] font-bold mb-[43px]">HEMP</h1>

      {/* 랭킹 차트 영역 */}
      <div className="flex-1 min-h-0">
        <RankingChart />
      </div>
    </div>
  );
};

export default Sidebar;