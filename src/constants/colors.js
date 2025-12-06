// 기획서 기반 컬러 시스템 정의 [cite: 540, 541]
export const COLORS = {
  // Brand Colors
  MAIN: '#93e729',   // Neon Green (Main Chain)
  SUB1: '#bbb143',   // Muted Yellow (Sub Chain 1)
  SUB2: '#3CA7C4',   // Muted Blue (Sub Chain 2)
  
  // Backgrounds
  BG_DARK: '#101217', // App Background
  BG_CARD: '#15171C', // Card Background
  
  // Text & Borders
  TEXT_MAIN: '#FFFFFF',
  TEXT_SUB: '#9CA3AE', // Gray-300
  BORDER: '#2A2B30',
};

// 체인 타입에 따른 색상 반환 헬퍼
export const getChainColor = (type) => {
  switch (type) {
    case 'main': return COLORS.MAIN;
    case 'sub1': return COLORS.SUB1;
    case 'sub2': return COLORS.SUB2;
    default: return '#4B5563'; // Gray for unselected
  }
};