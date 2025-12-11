import React from "react";
import ReactECharts from "echarts-for-react";

const SankeyChart = ({ data }) => {
  // 🔹 기본 예시 데이터 (나중에 swap 가능)
  const option = {
    title: {
      text: "Sankey Chart",
      left: "center",
      textStyle: { color: "#fff", fontSize: 14 },
    },
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
    },
    series: [
      {
        type: "sankey",
        layout: "none",
        emphasis: {
          focus: "adjacency",
        },
        data: data?.nodes || [
          { name: "A" },
          { name: "B" },
          { name: "C" },
          { name: "D" },
        ],
        links: data?.links || [
          { source: "A", target: "B", value: 5 },
          { source: "A", target: "C", value: 3 },
          { source: "B", target: "D", value: 8 },
          { source: "C", target: "D", value: 2 },
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

export default SankeyChart;
