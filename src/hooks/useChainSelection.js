// src/hooks/useChainSelection.js
import useChainStore from "../store/useChainStore";
import { COLORS } from "../constants/colors";

const useChainSelection = () => {
  const {
    selectedMainId,
    selectedSubId1,
    selectedSubId2,
    // [수정 1] setSlot 대신 applySelection을 가져옵니다.
    applySelection,
  } = useChainStore();

  const getSelectionInfo = (id) => {
    if (id === selectedMainId)
      return { type: "main", color: COLORS.MAIN };

    if (id === selectedSubId1)
      return { type: "sub1", color: COLORS.SUB1 };

    if (id === selectedSubId2)
      return { type: "sub2", color: COLORS.SUB2 };

    return null;
  };

  const selectChain = (chainId) => {
    // [수정 2] applySelection에 로직을 위임합니다.
    // targetSlot을 null로 전달하면, store의 applySelection 로직이 
    // "메인->서브1->서브2 우선순위로 빈 슬롯에 자동 배치" 및 
    // "이미 선택된 체인은 무시"하는 모든 스마트 셀렉션 규칙을 처리합니다.
    return applySelection(chainId, null);
  };

  return {
    getSelectionInfo,
    selectChain,
    selectedMainId,
    selectedSubId1,
    selectedSubId2,
  };
};

export default useChainSelection;