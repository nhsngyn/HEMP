// src/pages/DashboardPage.jsx
// 차트들 배치하는 페이지 본문

import React from "react";

import BubbleChart from "../components/charts/HempMap";
import RadarChart from "../components/charts/RadarChart";
import SankeyChart from "../components/charts/SankeyChart";

const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-8">

      <div className="flex flex-col justify-end h-[133px] pb-4">
        {/* 팀 명 */}
        <p className="text-gray-300 text-base font-medium">Multidimensional Chain Health via HEMP</p>
        {/* 프로젝트 명 */}
        <h2 className="text-white text-3xl font-bold mt-1">Deeper Analysis on Blockchains</h2>
      </div>

      <div className="flex flex-wrap gap-6">
        <div className="flex-1 min-w-[540px] h-[320px] bg-[#111418] rounded-lg">
          <BubbleChart />
        </div>

        <div className="flex-1 min-w-[540px] h-[320px] bg-[#111418] rounded-lg">
          <RadarChart />
        </div>
      </div>

      <div className="w-full min-w-[1024px] h-[400px] bg-[#111418] rounded-lg">
        <SankeyChart />
      </div>

    </div>
  );
};


export default DashboardPage;