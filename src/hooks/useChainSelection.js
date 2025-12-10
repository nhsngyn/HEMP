// src/hooks/useChainSelection.js
import useChainStore from "../store/useChainStore";
import { COLORS } from "../constants/colors";

const useChainSelection = () => {
  const {
    selectedMainId,
    selectedSubId1,
    selectedSubId2,
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