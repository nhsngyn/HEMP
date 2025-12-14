// Sankey Chart용 더미 프로포절 데이터
// 각 프로포절은 type, participationLevel, voteComposition, result, processingSpeed를 가짐

const types = [
  'Parameter Change',
  'Software Upgrade',
  'Text Proposal',
  'Governance',
  'Tokenomics',
  'Security',
  'Other'
];

const participationLevels = ['High', 'Mid', 'Low'];
const voteCompositions = ['Consensus', 'Contested', 'Polarized'];
const results = ['Passed', 'Rejected', 'Failed'];
const processingSpeeds = ['Fast', 'Normal', 'Slow'];

// 랜덤 선택 헬퍼 함수
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

// 더미 프로포절 생성 함수
const generateDummyPropositions = (count = 50) => {
  const propositions = [];

  for (let i = 0; i < count; i++) {
    propositions.push({
      type: randomChoice(types),
      participationLevel: randomChoice(participationLevels),
      voteComposition: randomChoice(voteCompositions),
      result: randomChoice(results),
      processingSpeed: randomChoice(processingSpeeds)
    });
  }

  return propositions;
};

// 체인별 더미 프로포절 데이터
export const sankeyMockPropositions = {
  'sei': generateDummyPropositions(65),
  'osmosis': generateDummyPropositions(791),
  'injective': generateDummyPropositions(377),
  'dydx': generateDummyPropositions(300),
  'stargaze': generateDummyPropositions(295),
  'cosmos': generateDummyPropositions(179),
  'axelar': generateDummyPropositions(262),
  'secret': generateDummyPropositions(201),
  'kava': generateDummyPropositions(200),
  'gravity-bridge': generateDummyPropositions(196),
  'persistence': generateDummyPropositions(137),
  'akash': generateDummyPropositions(135),
  'terra': generateDummyPropositions(118),
  'xpla': generateDummyPropositions(30),
  'stride': generateDummyPropositions(90),
  'provenance': generateDummyPropositions(34),
  'agoric': generateDummyPropositions(79),
  'chihuahua': generateDummyPropositions(81),
};

// 기본 더미 데이터 (체인 ID가 없을 때 사용)
export const defaultDummyPropositions = generateDummyPropositions(100);

