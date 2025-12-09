import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import RankingChart from '../components/ranking/RankingChart';
import HempMap from '../components/charts/HempMap';

// 임시 차트 컴포넌트
const PlaceholderChart = ({ title }) => (
  <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold bg-[#1A1B20]/50">
    {title} (Coming Soon)
  </div>
);

const DashboardPage = () => {
  return (
    <MainLayout leftSidebar={<RankingChart />}>
      
      {/* 메인 콘텐츠 컨테이너 */}
      <div className="flex flex-col w-full h-full gap-6">
        
        {/* 1. 상단 영역  */}
        <div className="flex w-full h-[328px] gap-6 shrink-0">
          
          {/* 1-1. 버블 차트  */}
          <div className="w-[710px] h-full bg-[#1A1B20] rounded-lg relative overflow-hidden border border-gray-800 shadow-lg">
             <div className="absolute inset-0 w-full h-full">
                <HempMap />
             </div>
          </div>

          {/* 1-2. 레이더 차트 */}
          <div className="flex-1 h-full bg-[#1A1B20] rounded-lg relative overflow-hidden border border-gray-800 shadow-lg">
             <PlaceholderChart title="Radar Chart" />
          </div>

        </div>
        
        {/* 2. 하단 영역*/}
        <div className="flex-1 w-full bg-[#1A1B20] rounded-lg relative overflow-hidden border border-gray-800 shadow-lg">
           <PlaceholderChart title="Sankey Chart" />
        </div>

      </div>
    </MainLayout>
  );
};

export default DashboardPage;