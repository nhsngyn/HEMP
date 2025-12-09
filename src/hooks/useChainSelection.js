import useChainStore from '../store/useChainStore';
import { COLORS } from '../constants/colors';

const useChainSelection = () => {
  const { 
    selectedMainId,
    selectedSubId1,
    selectedSubId2,
    applySelection
  } = useChainStore();

  const getSelectionInfo = (chainId) => {
    if (chainId === selectedMainId) 
      return { type: 'main', color: COLORS.MAIN, z: 100, label: 'MAIN' };

    if (chainId === selectedSubId1) 
      return { type: 'sub1', color: COLORS.SUB1, z: 90, label: 'SUB 1' };

    if (chainId === selectedSubId2) 
      return { type: 'sub2', color: COLORS.SUB2, z: 90, label: 'SUB 2' };

    return null;
  };

  // ⭐ 클릭 전용 함수: 자동 우선순위(Main→Sub1→Sub2) 배치
  const selectChain = (chainId) => {
    applySelection(chainId);  
    // targetSlot 없음 → 자동 우선순위 배치
  };

  return {
    getSelectionInfo,
    applySelection, // 드래그에서 사용
    selectChain,    // 클릭에서 사용
    selectedMainId,
    selectedSubId1,
    selectedSubId2,
  };
};

export default useChainSelection;
