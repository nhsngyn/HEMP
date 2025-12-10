import { create } from 'zustand';
import { mockChains } from '../data/mockData';

const useChainStore = create((set) => ({
  allChains: mockChains,
  selectedMainId: null,
  selectedSubId1: null,
  selectedSubId2: null,
  
  // 1. 슬롯의 X 버튼 클릭 시
  clearSlot: (slotType) => set(() => {
    const key = { main: 'selectedMainId', sub1: 'selectedSubId1', sub2: 'selectedSubId2' }[slotType];
    return key ? { [key]: null } : {};
  }),

  // 2. 리스트로 드래그해서 버릴 때
  removeChainById: (chainId) => set((state) => {
    const updates = {};
    if (state.selectedMainId === chainId) updates.selectedMainId = null;
    if (state.selectedSubId1 === chainId) updates.selectedSubId1 = null;
    if (state.selectedSubId2 === chainId) updates.selectedSubId2 = null;
    return updates;
  }),

  // --- 선택 엔진 applySelection ---
  // targetSlot이 있으면(드래그) -> 강제 배치
  // targetSlot이 없으면(클릭) -> 자동 배치 (Main->Sub1->Sub2)
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

    const isAlreadySelected = Object.values(slots).includes(chainId);

    // Case 1: 이미 선택된 체인을 그냥 클릭함 (targetSlot 없음)
    if (isAlreadySelected && !targetSlot) {
      return {}; 
    }

    const updates = {};

    // Case 2: 드래그 앤 드롭 (targetSlot 있음) OR 클릭인데 선택 안 된 상태
    if (isAlreadySelected) {
      for (const [key, value] of Object.entries(slots)) {
        if (value === chainId) {
          updates[slotKeyMap[key]] = null;
        }
      }
    }

    // 배치할 목표 슬롯 결정
    let finalTargetKey = null;

    if (targetSlot) {
      // [드래그] 사용자가 지정한 슬롯
      finalTargetKey = slotKeyMap[targetSlot];
    } else {
      // [클릭/버블] 자동 우선순위 배치
      if (!slots.main) finalTargetKey = 'selectedMainId';
      else if (!slots.sub1) finalTargetKey = 'selectedSubId1';
      else if (!slots.sub2) finalTargetKey = 'selectedSubId2';
      else finalTargetKey = 'selectedMainId'; // 꽉 찼으면 Main 교체
    }

    // 최종 업데이트
    if (finalTargetKey) {
      updates[finalTargetKey] = chainId;
    }
    
    return updates;
  }),

  resetAll: () => set({ selectedMainId: null, selectedSubId1: null, selectedSubId2: null }),
}));

export default useChainStore;