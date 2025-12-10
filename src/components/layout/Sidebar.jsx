import React from "react";
import RankingChart from "../ranking/RankingChart";

const Sidebar = () => {
  return (
    <aside className="w-[260px] h-screen bg-[#111418] px-6 py-[60px] flex flex-col text-white">

      {/* Title */}
      <h1 className="text-[28px] font-bold">HEMP</h1>

      {/* RankingChart 전체 넣기 */}
      <div className="mt-[43px] flex-1 min-h-0">
        <RankingChart />
      </div>

    </aside>
  );
};

export default Sidebar;
