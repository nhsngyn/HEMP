import React from 'react';
import MainLayout from './components/layout/MainLayout';
import Sidebar from './components/layout/Sidebar';
// 방금 만든 대시보드 페이지 컴포넌트를 사용합니다.
import DashboardPage from './pages/DashboardPage'; 

function App() {
  return (
    // MainLayout(틀) 안에 DashboardPage(내용)를 넣어서 구조를 완성합니다.
    <MainLayout leftSidebar={<Sidebar />}>
      <DashboardPage />
    </MainLayout>
  );
}

export default App;