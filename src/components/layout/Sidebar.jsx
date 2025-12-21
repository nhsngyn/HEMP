import React from "react";
import RankingChart from "../ranking/RankingChart";

const Sidebar = () => {
  return (
    <div className="flex flex-col w-full h-full pt-[50px] text-white"
      style={{
        background: '#15171C',
        paddingLeft: '24px',
        paddingRight: '30px',
      }}>
      {/* 상단 타이틀 */}
      <h1 className="text-[28px] font-bold " >HEMP</h1>

      {/* 랭킹 차트 영역 */}
      <div className="flex-1 min-h-0" style={{ marginTop: 'calc(20px * var(--scale))' }}>
        <RankingChart />
      </div>
    </div>
  );
};

export default Sidebar;