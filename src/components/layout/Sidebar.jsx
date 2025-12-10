import React from "react";
import RankingChart from "../ranking/RankingChart";

const Sidebar = () => {
  return (
    <aside
      className="
        w-[260px]
        h-screen
        sticky top-0
        bg-[#111418]
        text-white
        flex flex-col
        px-6
        py-[60px]
      "
    >
      {/* 상단 타이틀 */}
      <h1 className="text-[28px] font-bold">HEMP</h1>

      {/* RankingChart */}
      <div className="mt-[43px] flex-1 min-h-0">
        <RankingChart />
      </div>
    </aside>
  );
};

export default Sidebar;
