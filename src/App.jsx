import React from 'react';
import MainLayout from './components/layout/MainLayout';
import RankingChart from './components/ranking/RankingChart';

function App() {
  return (
    <MainLayout
      leftPanel={<RankingChart />} 
    >
      {/* 우측은 아직 준혁님 자리 (비워둠) */}
      <div className="w-full h-1/2 border border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-400 mb-4">
        HEMP Map Area (Ready)
      </div>
      
      <div className="flex gap-4 h-1/2">
         <div className="w-1/2 border border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-400">
            Radar Chart Area
         </div>
         <div className="w-1/2 border border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-400">
            Sankey Chart Area
         </div>
      </div>
    </MainLayout>
  );
}

export default App;