// src/pages/DashboardPage.jsx
// 차트들 배치하는 페이지 본문

import React from "react";

import DashboardLayout from "../components/layout/DashboardLayout";
import BubbleChart from "../components/charts/HempMap";
import RadarChart from "../components/charts/RadarChart";
import SankeyChart from "../components/charts/SankeyChart";

const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-8">

      <div className="flex flex-wrap gap-6">
        <div className="flex-1 min-w-[540px] h-[320px]">
          <BubbleChart />
        </div>

        <div className="flex-1 min-w-[540px] h-[320px]">
          <RadarChart />
        </div>
      </div>

      <div className="w-full min-w-[1024px] h-[400px]">
        <SankeyChart />
      </div>

    </div>
  );
};


export default DashboardPage;