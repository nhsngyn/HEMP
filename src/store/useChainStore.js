import { create } from 'zustand';
import { mockChains } from '../data/mockData';

const useChainStore = create((set) => ({
  allChains: mockChains,
  selectedMainId: null,
  selectedSubId1: null,
  selectedSubId2: null,
  
  clearSlot: (slotType) => set(() => {
    const key = { main: 'selectedMainId', sub1: 'selectedSubId1', sub2: 'selectedSubId2' }[slotType];
    return key ? { [key]: null } : {};
  }),

  removeChainById: (chainId) => set((state) => {
    const updates = {};
    if (state.selectedMainId === chainId) updates.selectedMainId = null;
    if (state.selectedSubId1 === chainId) updates.selectedSubId1 = null;
    if (state.selectedSubId2 === chainId) updates.selectedSubId2 = null;
    return updates;
  }),

  applySelection: (chainId, targetSlot = null) => set((state) => {
    const slots = {
      main: state.selectedMainId,
      sub1: state.selectedSubId1,
      sub2: state.selectedSubId2,
    };

    const slotKeyMap = {
      main: 'selectedMainId',
      sub1: 'selectedSubId1',
      sub2: 'selectedSubId2',
    };

    const updates = {};
    const currentSlotKey = Object.keys(slots).find(key => slots[key] === chainId);

    // 클릭 이벤트
    if (!targetSlot) {
      if (currentSlotKey) {
        return {}; 
      }
      
      let finalTargetKey = null;

      // 비어있는 슬롯 순서대로 확인 (Main -> Sub1 -> Sub2)
      if (!slots.main) finalTargetKey = 'selectedMainId';
      else if (!slots.sub1) finalTargetKey = 'selectedSubId1';
      else if (!slots.sub2) finalTargetKey = 'selectedSubId2';
      
      if (finalTargetKey) {
        updates[finalTargetKey] = chainId;
      }
      
      return updates;
    } 

    // 드래그 앤 드롭
    if (currentSlotKey) {
      updates[slotKeyMap[currentSlotKey]] = null;
    }
    
    // 새로운 슬롯에 배치
    const finalTargetKey = slotKeyMap[targetSlot];
    if (finalTargetKey) {
      updates[finalTargetKey] = chainId;
    }
    
    return updates;
  }),

  resetAll: () => set({ selectedMainId: null, selectedSubId1: null, selectedSubId2: null }),
}));

export default useChainStore;