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
  const titles = [
    'Increase voting period to 14 days and expedited voting period',
    'Update governance parameters for better decision making',
    'Proposal to modify token distribution',
    'Security enhancement proposal',
    'Network upgrade proposal',
    'Parameter adjustment for stability',
    'Community governance improvement'
  ];

  for (let i = 0; i < count; i++) {
    const result = randomChoice(results);
    const processingSpeed = randomChoice(processingSpeeds);

    // Status formatting based on result
    let status = '';
    if (result === 'Passed') {
      status = `PASSED (${(Math.random() * 30 + 50).toFixed(1)}%)`;
    } else if (result === 'Rejected') {
      status = `REJECTED (${(Math.random() * 30 + 70).toFixed(1)}%)`;
    } else {
      // Spec: Failed 상태는 단순히 FAILED로 표기
      status = 'FAILED';
    }

    // Processing time based on speed
    const processingTimes = {
      'Fast': `${Math.floor(Math.random() * 2) + 1}days, ${Math.floor(Math.random() * 12)}h ${Math.floor(Math.random() * 60)}m`,
      'Normal': `${Math.floor(Math.random() * 3) + 2}days, ${Math.floor(Math.random() * 12)}h ${Math.floor(Math.random() * 60)}m`,
      'Slow': `${Math.floor(Math.random() * 5) + 4}days, ${Math.floor(Math.random() * 12)}h ${Math.floor(Math.random() * 60)}m`
    };

    propositions.push({
      id: 1000 + i,
      title: randomChoice(titles),
      type: randomChoice(types),
      participationLevel: randomChoice(participationLevels),
      voteComposition: randomChoice(voteCompositions),
      result: result,
      processingSpeed: processingSpeed,
      status: status,
      processingTime: processingTimes[processingSpeed],
      participation: (Math.random() * 100).toFixed(2) + '%'
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

