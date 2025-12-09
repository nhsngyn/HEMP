import useChainStore from '../store/useChainStore';
import { COLORS } from '../constants/colors';

 // 체인 선택과 관련된 로직을 담당하는 훅
const useChainSelection = () => {
  // 스토어에서 상태와 액션 가져오기
  const { 
    selectedMainId, selectedSubId1, selectedSubId2, 
    setSlot, removeChainById 
  } = useChainStore();

   // 1. 특정 체인 ID의 선택 정보를 반환
  const getSelectionInfo = (chainId) => {
    if (chainId === selectedMainId) {
      return { type: 'main', color: COLORS.MAIN, z: 100, label: 'MAIN' };
    }
    if (chainId === selectedSubId1) {
      return { type: 'sub1', color: COLORS.SUB1, z: 90, label: 'SUB 1' };
    }
    if (chainId === selectedSubId2) {
      return { type: 'sub2', color: COLORS.SUB2, z: 90, label: 'SUB 2' };
    }
    return null; // 선택되지 않음
  };

  const toggleChainSelection = (chainId) => {
    const info = getSelectionInfo(chainId);

    // 이미 선택된 상태라면 -> 해제
    if (info) {
      removeChainById(chainId);
      return;
    }

    // 선택 안 된 상태라면 -> 빈 슬롯 찾아서 넣기
    if (!selectedMainId) {
      setSlot('main', chainId);
    } else if (!selectedSubId1) {
      setSlot('sub1', chainId);
    } else if (!selectedSubId2) {
      setSlot('sub2', chainId);
    } else {
      // 슬롯이 꽉 찼을 때 동작 (예: 메인을 덮어쓰기)
      setSlot('main', chainId);
    }
  };

  return {
    getSelectionInfo,
    toggleChainSelection,
    // 필요하면 현재 선택된 ID들도 그대로 반환해서 바로 쓸 수 있게 함
    selectedMainId,
    selectedSubId1,
    selectedSubId2,
  };
};

export default useChainSelection;