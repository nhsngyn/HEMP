import { create } from 'zustand';
import { mockChains } from '../data/mockData';

const useChainStore = create((set) => ({
  // 1. 데이터 상태
  allChains: mockChains,
  
  selectedMainId: null,
  selectedSubId1: null,
  selectedSubId2: null,

  // 2. 액션
  
  // (기존) 특정 슬롯에 체인 넣기 + 이동 로직 포함
  setSlot: (slotType, chainId) => set((state) => {
    const newState = { ...state };
    
    // 이미 다른 칸에 있던 놈이면 거기서 뺌 (이동 기능)
    if (state.selectedMainId === chainId) newState.selectedMainId = null;
    if (state.selectedSubId1 === chainId) newState.selectedSubId1 = null;
    if (state.selectedSubId2 === chainId) newState.selectedSubId2 = null;

    // 새 자리에 넣기
    if (slotType === 'main') newState.selectedMainId = chainId;
    if (slotType === 'sub1') newState.selectedSubId1 = chainId;
    if (slotType === 'sub2') newState.selectedSubId2 = chainId;

    return newState;
  }),

  // (기존) X버튼용 - 슬롯 비우기
  clearSlot: (slotType) => set((state) => {
    if (slotType === 'main') return { selectedMainId: null };
    if (slotType === 'sub1') return { selectedSubId1: null };
    if (slotType === 'sub2') return { selectedSubId2: null };
    return state;
  }),

  // [NEW] 리스트로 드래그했을 때 - ID 기반 삭제
  removeChainById: (chainId) => set((state) => {
    const newState = { ...state };
    if (state.selectedMainId === chainId) newState.selectedMainId = null;
    if (state.selectedSubId1 === chainId) newState.selectedSubId1 = null;
    if (state.selectedSubId2 === chainId) newState.selectedSubId2 = null;
    return newState;
  }),
}));

export default useChainStore;