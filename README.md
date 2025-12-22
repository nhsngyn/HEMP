# HEMP: Health Evaluation Metric using Proposals

블록체인 거버넌스 제안(Proposal) 데이터를 기반으로 체인의 건강도를 평가하고 시각화하는 대시보드입니다.

## 주요 기능

- **HEMP Map (버블 차트)**: 체인별 HEMP 점수와 참여율을 버블 차트로 시각화
- **레이더 차트**: 선택한 체인들의 5가지 지표(VIB, Participation, Success Rate, Stability, Consensus)를 비교
- **생키 다이어그램**: 제안의 흐름(Type → Status → Participation → Vote Composition → Processing Speed)을 시각화
- **랭킹 시스템**: 드래그앤드롭으로 체인을 선택하고 비교
- **제안 테이블**: 선택한 체인의 모든 제안 목록을 필터링하여 표시

## 기술 스택

- **Frontend**: React 19, Vite
- **상태 관리**: Zustand
- **스타일링**: Tailwind CSS
- **차트**: ECharts, D3.js, d3-sankey
- **드래그앤드롭**: @dnd-kit
- **배포**: Vercel

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프리뷰
npm run preview
```

## 프로젝트 구조

```
src/
├── components/
│   ├── charts/          # 차트 컴포넌트 (버블, 레이더, 생키, 테이블)
│   ├── layout/          # 레이아웃 컴포넌트 (메인, 사이드바)
│   └── ranking/         # 랭킹 관련 컴포넌트 (DnD)
├── constants/           # 상수 정의 (색상, 차트 설정)
├── data/               # 목 데이터
├── hooks/              # 커스텀 훅
└── store/              # Zustand 스토어
```

## 디자인 시스템

### 색상
- Main: #93E729 (Green)
- Sub1: #3CA7C4 (Blue)
- Sub2: #BBB143 (Yellow)
- Background: #101010 (Pure Black)
- Card Background: #17181c (Gray)

### 타이포그래피
- Title: 22px, 20px
- Body: 18px, 16px, 14px
- Caption: 12px

## 배포

- **Production**: https://hemp-taupe.vercel.app
- **Repository**: https://github.com/nhsngyn/HEMP

