import { create } from 'zustand';
import { mockChains } from '../data/mockData';

const useChainStore = create((set) => ({
  allChains: mockChains,

  selectedMainId: null,
  selectedSubId1: null,
  selectedSubId2: null,



  // setSlot: 부분 업데이트 & 매핑 사용
  setSlot: (slotType, chainId) => set((state) => {
    // 1. 슬롯 이름과 상태 키 매핑
    const slotKeyMap = {
      main: 'selectedMainId',
      sub1: 'selectedSubId1',
      sub2: 'selectedSubId2',
    };
    
    const targetKey = slotKeyMap[slotType];
    if (!targetKey) return {}; // 잘못된 슬롯 타입이면 무시

    // 2. 토글 기능
    if (state[targetKey] === chainId) {
      return { [targetKey]: null };
    }

    // 3. 중복 방지: 다른 슬롯에 이 체인이 있다면 거기서는 비워야 함
    const updates = {};
    
    Object.values(slotKeyMap).forEach((key) => {
      if (state[key] === chainId) {
        updates[key] = null; // 기존 자리 비우기
      }
    });

    // 4. 목표 슬롯에 채우기
    updates[targetKey] = chainId;

    // 5. 변경된 것만 반환
    return updates;
  }),

  //불필요한 복사 제거
  clearSlot: (slotType) => set(() => {
    const slotKeyMap = {
      main: 'selectedMainId',
      sub1: 'selectedSubId1',
      sub2: 'selectedSubId2',
    };
    const targetKey = slotKeyMap[slotType];
    
    return targetKey ? { [targetKey]: null } : {};
  }),

  removeChainById: (chainId) => set((state) => {
    const updates = {};
    
    if (state.selectedMainId === chainId) updates.selectedMainId = null;
    if (state.selectedSubId1 === chainId) updates.selectedSubId1 = null;
    if (state.selectedSubId2 === chainId) updates.selectedSubId2 = null;
    
    return updates;
  }),

  // 초기화
  resetAll: () => set({ 
    selectedMainId: null, 
    selectedSubId1: null, 
    selectedSubId2: null 
  }),
}));

export default useChainStore;