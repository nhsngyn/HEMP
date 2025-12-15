// src/store/useChainStore.js
import { create } from 'zustand';
import { mockChains } from '../data/mockData';

// 슬롯 키들을 배열로 관리
const SLOT_KEYS = ['selectedMainId', 'selectedSubId1', 'selectedSubId2'];

const useChainStore = create((set) => ({
  allChains: mockChains,
  selectedMainId: null,
  selectedSubId1: null,
  selectedSubId2: null,
  // Sankey ↔ ProposalsTable 연동용 필터 (리본 선택 상태)
  sankeyFilter: null,
  
  clearSlot: (slotType) => set(() => {
    // slotType을 store key로 매핑
    const keyMap = { main: 'selectedMainId', sub1: 'selectedSubId1', sub2: 'selectedSubId2' };
    const key = keyMap[slotType];
    return key ? { [key]: null } : {};
  }),

  removeChainById: (chainId) => set((state) => {
    const updates = {};
    // 반복문으로 깔끔하게 처리
    SLOT_KEYS.forEach(key => {
      if (state[key] === chainId) updates[key] = null;
    });
    return updates;
  }),

  applySelection: (chainId, targetSlot = null) => set((state) => {
    // 1. 현재 체인이 이미 어딘가에 있는지 확인
    const currentSlotKey = SLOT_KEYS.find(key => state[key] === chainId);
    const updates = {};

    // 2. targetSlot 문자열을 실제 스토어 키로 변환
    const targetKeyMap = {
      main: 'selectedMainId',
      sub1: 'selectedSubId1',
      sub2: 'selectedSubId2',
    };
    const finalTargetKey = targetSlot ? targetKeyMap[targetSlot] : null;

    if (!finalTargetKey) {
      if (currentSlotKey) return {};

      const emptySlotKey = SLOT_KEYS.find(key => !state[key]);
      
      updates[emptySlotKey || SLOT_KEYS[0]] = chainId;
      
      return updates;
    }

    if (currentSlotKey && currentSlotKey !== finalTargetKey) {
      updates[currentSlotKey] = null;
    }
    
    updates[finalTargetKey] = chainId;
    
    return updates;
  }),

  // Sankey 리본 선택 시 설정되는 필터
  setSankeyFilter: (filter) => set({ sankeyFilter: filter }),
  clearSankeyFilter: () => set({ sankeyFilter: null }),

  resetAll: () => set({ selectedMainId: null, selectedSubId1: null, selectedSubId2: null }),
}));

export default useChainStore;