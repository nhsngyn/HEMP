// 스타일 가이드 기반 컬러 시스템 정의
export const COLORS = {

  MAIN: '#93E729',
  SUB1: '#3CA7C4',  
  SUB2: '#BBB143',   

  WHITE: '#FFFFFF',
  GRAY100: '#E8EAED',
  GRAY200: '#D1D5DB',
  GRAY300: '#9CA3AE',
  GRAY400: '#6D7380',
  GRAY500: '#4C5564',
  GRAY700: '#29303A',
  GRAY800: '#191C23',
  GRAY900: '#101010', /* 순수한 회색 - 파란 톤 제거 */
  GRAYBG: '#17181c', /* 카드/사이드바 배경색 */
  
  SKYBLUE: '#3CA7C4',
  YELLOW: '#BBB143',
  GREEN: '#93E729',
};

export const getChainColor = (type) => {
  switch (type) {
    case 'main': return COLORS.MAIN;
    case 'sub1': return COLORS.SUB1;
    case 'sub2': return COLORS.SUB2;
    default: return COLORS.GRAY500;
  }
};