import React from "react";
import RankingChart from "../ranking/RankingChart";

const Sidebar = () => {
  return (
    <div
      className="flex flex-col"
      style={{
        width: '100%',
        height: '100%',
        paddingLeft: '24px',
        paddingRight: '22px',
        paddingTop: '133px',
        paddingBottom: '62px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ marginBottom: '53px', flexShrink: 0 }}>
        <img src="/Icons/logo-type.svg" alt="HEMP" />
      </div>

      <div className="flex-1 min-h-0">
        <RankingChart />
      </div>
    </div>
  );
};

export default Sidebar;
