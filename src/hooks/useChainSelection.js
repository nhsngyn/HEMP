// src/hooks/useChainSelection.js
import useChainStore from "../store/useChainStore";
import { COLORS } from "../constants/colors";

const useChainSelection = () => {
  const {
    selectedMainId,
    selectedSubId1,
    selectedSubId2,
    setSlot,
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
    if (!selectedMainId) return setSlot("main", chainId);
    if (!selectedSubId1) return setSlot("sub1", chainId);
    if (!selectedSubId2) return setSlot("sub2", chainId);

    // 모든 슬롯이 찼으면 → Main 교체
    return setSlot("main", chainId);
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
