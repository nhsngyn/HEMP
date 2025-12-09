// src/components/layout/MainLayout.jsx
import React from "react";
import RankingChart from "../ranking/RankingChart";

const MainLayout = ({ children }) => {
  return (
    <div className="w-[1920px] h-[1080px] flex bg-[#0E0F12] text-white overflow-hidden">

      {/* LEFT SIDEBAR */}
      <aside
        className="
          w-[390px] h-full 
          flex flex-col 
          px-6 py-8 
          border-r border-white/10
        "
      >
        {/* HEMP Title */}
        <h1 className="text-3xl font-bold mb-10">HEMP</h1>

        {/* Ranking Component */}
        <RankingChart />
      </aside>

      {/* RIGHT CONTENT AREA */}
      <main className="flex-1 h-full overflow-hidden p-8">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
