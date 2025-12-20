import React from 'react';
import MainLayout from './components/layout/MainLayout';
import Sidebar from './components/layout/Sidebar';
import DashboardPage from './pages/DashboardPage'; 

function App() {
  return (
    // MainLayout(틀) 안에 DashboardPage(내용)를 넣습니다.
    <MainLayout leftSidebar={<Sidebar />}>
      <DashboardPage />
    </MainLayout>
  );
}

export default App;