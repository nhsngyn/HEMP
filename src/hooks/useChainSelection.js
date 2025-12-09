import useChainStore from '../store/useChainStore';
import { COLORS } from '../constants/colors';

const useChainSelection = () => {
  // 스토어에서 상태와 'smartSelect' 가져오기
  const { 
    selectedMainId, selectedSubId1, selectedSubId2, 
    smartSelect,
    removeChainById 
  } = useChainStore();

  const getSelectionInfo = (chainId) => {
    if (chainId === selectedMainId) return { type: 'main', color: COLORS.MAIN, z: 100, label: 'MAIN' };
    if (chainId === selectedSubId1) return { type: 'sub1', color: COLORS.SUB1, z: 90, label: 'SUB 1' };
    if (chainId === selectedSubId2) return { type: 'sub2', color: COLORS.SUB2, z: 90, label: 'SUB 2' };
    return null;
  };

  const toggleChainSelection = (chainId) => {
    smartSelect(chainId);
  };

  return {
    getSelectionInfo,
    toggleChainSelection,
    selectedMainId,
    selectedSubId1,
    selectedSubId2,
  };
};

export default useChainSelection;