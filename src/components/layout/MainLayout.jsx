// src/components/layout/MainLayout.jsx
// 앱 전체 기본 프레임
const MainLayout = ({ children }) => {
  return (
    <div className="w-full h-full bg-[#101217] text-white">
      {children}
    </div>
  );
};

