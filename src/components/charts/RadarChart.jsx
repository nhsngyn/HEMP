import React from "react";
import ReactECharts from "echarts-for-react";

const RadarChart = ({ data }) => {
  // 🔹 기본 옵션 (나중에 커스터마이징 가능)
  const option = {
    title: {
      text: "Radar Chart",
      textStyle: { color: "#fff", fontSize: 14 },
      left: "center",
    },
    tooltip: {},
    radar: {
      indicator: [
        { name: "Metric A", max: 100 },
        { name: "Metric B", max: 100 },
        { name: "Metric C", max: 100 },
        { name: "Metric D", max: 100 },
        { name: "Metric E", max: 100 },
      ],
      splitNumber: 5,
      axisName: {
        color: "#ccc",
      },
    },
    series: [
      {
        type: "radar",
        data: [
          {
            value: data || [70, 60, 80, 50, 90],
            areaStyle: { opacity: 0.2 },
          },
        ],
      },
    ],
  };

  return (
    <div className="w-full h-full">
      <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
    </div>
  );
};

export default RadarChart;
