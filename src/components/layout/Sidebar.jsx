import React from "react";
import RankingChart from "../ranking/RankingChart";

const Sidebar = () => {
  return (
    <aside
      className="
        w-full
        h-full
        bg-[#111418]
        text-white
        flex flex-col
        px-6
        py-[60px]
        /* ✨ 수정됨: sticky, top-0, h-screen, w-[260px] 제거 -> 부모(MainLayout)의 제어를 따름 */
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