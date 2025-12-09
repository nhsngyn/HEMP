// src/pages/DashboardPage.jsx
import React from "react";
import HempMap from "../components/charts/HempMap";
import RadarChart from "../components/charts/RadarChart";
import SankeyChart from "../components/charts/SankeyChart";

const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-8">

      {/* TOP CHARTS */}
      <div className="flex gap-6">

        {/* Bubble Map */}
        <div
          className="
            w-[763px] h-[353px]
            rounded-[15px] 
            bg-white/[0.02]
            p-4
          "
        >
          <HempMap />
        </div>

        {/* Radar Chart */}
        <div
          className="
            w-[647px] h-[353px]
            rounded-[15px] 
            bg-white/[0.02]
            p-4
          "
        >
          <RadarChart />
        </div>
      </div>

      {/* Sankey Chart */}
      <div
        className="
          w-[1433px] h-[481px]
          rounded-[15px] 
          bg-white/[0.02]
          p-4
        "
      >
        <SankeyChart />
      </div>
    </div>
  );
};

export default DashboardPage;
