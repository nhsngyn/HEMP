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

  // 스마트 셀렉트: 버블 차트를 누르면 빈 슬롯에 우선순위대로 들어감
smartSelect: (chainId) => set((state) => {
    // 1. 이미 선택된 체인이면? -> 해제 (토글 기능)
    if (state.selectedMainId === chainId) return { selectedMainId: null };
    if (state.selectedSubId1 === chainId) return { selectedSubId1: null };
    if (state.selectedSubId2 === chainId) return { selectedSubId2: null };

    // 2. 빈 슬롯 찾기 (우선순위: Main -> Sub1 -> Sub2)
    if (!state.selectedMainId) return { selectedMainId: chainId };
    if (!state.selectedSubId1) return { selectedSubId1: chainId };
    if (!state.selectedSubId2) return { selectedSubId2: chainId };

    // 3. 꽉 찼다면? -> Main을 교체
    return { selectedMainId: chainId };
  }),

  // 초기화
  resetAll: () => set({ 
    selectedMainId: null, 
    selectedSubId1: null, 
    selectedSubId2: null 
  }),
}));

export default useChainStore;