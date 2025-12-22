import React from "react";
import RankingChart from "../ranking/RankingChart";

const Sidebar = () => {
  return (
    <div className="flex flex-col w-full h-full px-4 py-[50px] text-white"
      style={{
        background: '#15171C',
      }}>
      {/* 상단 타이틀 */}
      <div className="mb-[40px]">
        <img src="/Icons/logo-type.svg" alt="HEMP" />
      </div>

      {/* 랭킹 차트 영역 */}
      <div className="flex-1 min-h-0">
        <RankingChart />
      </div>
    </div>
  );
};

export default Sidebar;