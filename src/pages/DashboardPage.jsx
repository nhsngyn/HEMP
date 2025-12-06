import React from 'react';
import MainLayout from '../components/layout/MainLayout';
// 차트 임포트는 잠시 주석 처리하거나 둡니다.
// import RankingChart from '../components/ranking/RankingChart';
// import BubbleChart from '../components/charts/BubbleChart';

const DashboardPage = () => {
  return (
    <MainLayout 
      // 1. 랭킹 차트 자리에 '빨간 박스' 넣기
      leftSidebar={
        <div className="w-full h-full bg-red-500 p-4 text-white font-bold text-2xl border-4 border-yellow-400">
          여기가 랭킹 차트 (362px)
          <br/>
          보이면 성공!
        </div>
      } 
    >
      {/* 2. 버블 차트 자리에 '파란 박스' 넣기 */}
      <div className="w-full h-full bg-blue-500 p-4 text-white font-bold text-2xl border-4 border-green-400">
        여기가 버블 차트 (나머지 영역)
        <br/>
        보이면 성공!
      </div>
    </MainLayout>
  );
};

export default DashboardPage;