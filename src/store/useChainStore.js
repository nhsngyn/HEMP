import { create } from 'zustand';
import { mockChains } from '../data/mockData';

const useChainStore = create((set) => ({
  allChains: mockChains,
  
  selectedMainId: null,
  selectedSubId1: null,
  selectedSubId2: null,

  
  setSlot: (slotType, chainId) => set((state) => {
    const newState = { ...state };
    
    if (state.selectedMainId === chainId) newState.selectedMainId = null;
    if (state.selectedSubId1 === chainId) newState.selectedSubId1 = null;
    if (state.selectedSubId2 === chainId) newState.selectedSubId2 = null;

    if (slotType === 'main') newState.selectedMainId = chainId;
    if (slotType === 'sub1') newState.selectedSubId1 = chainId;
    if (slotType === 'sub2') newState.selectedSubId2 = chainId;

    return newState;
  }),

  clearSlot: (slotType) => set((state) => {
    if (slotType === 'main') return { selectedMainId: null };
    if (slotType === 'sub1') return { selectedSubId1: null };
    if (slotType === 'sub2') return { selectedSubId2: null };
    return state;
  }),

  removeChainById: (chainId) => set((state) => {
    const newState = { ...state };
    if (state.selectedMainId === chainId) newState.selectedMainId = null;
    if (state.selectedSubId1 === chainId) newState.selectedSubId1 = null;
    if (state.selectedSubId2 === chainId) newState.selectedSubId2 = null;
    return newState;
  }),
}));

export default useChainStore;