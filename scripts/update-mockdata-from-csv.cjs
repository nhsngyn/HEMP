const fs = require('fs');
const path = require('path');

// CSV 파일 읽기
const csvPath = path.join(process.cwd(), 'hemp_data.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');
const csvLines = csvContent.trim().split('\n');
const csvHeaders = csvLines[0].split(',').map(h => h.trim());

console.log('Reading CSV file:', csvPath);
console.log('Headers:', csvHeaders);

// CSV 데이터 파싱
const csvChains = [];
for (let i = 1; i < csvLines.length; i++) {
  const values = csvLines[i].split(',').map(v => v.trim());
  const chain = {
    name: values[0],
    proposals: parseInt(values[1]) || 0,
    participation: parseFloat(values[2]) || 0,
    consensus: parseFloat(values[3]) || 0,
    stability: parseFloat(values[4]) || 0,
    acceptanceRate: parseFloat(values[5]) || 0,
    validatorBalance: parseFloat(values[6]) || 0
  };
  csvChains.push(chain);
}

console.log(`\nLoaded ${csvChains.length} chains from CSV\n`);

// 기존 mockData.js 읽기 (logoUrl과 color 정보 유지)
const mockDataPath = path.join(process.cwd(), 'src/data/mockData.js');
const mockDataContent = fs.readFileSync(mockDataPath, 'utf8');

// 기존 mockChains 추출
const mockChainsMatch = mockDataContent.match(/export const mockChains = \[([\s\S]*?)\];/);
if (!mockChainsMatch) {
  console.error('mockChains를 찾을 수 없습니다.');
  process.exit(1);
}

const mockChainsStr = '[' + mockChainsMatch[1] + ']';
const existingMockChains = eval(mockChainsStr);

// 기존 체인 정보를 이름으로 매핑 (logoUrl, color 유지)
const existingChainMap = {};
existingMockChains.forEach(chain => {
  existingChainMap[chain.name.toLowerCase()] = {
    logoUrl: chain.logoUrl || '/logos/chainImg.png',
    color: chain.color || '#A0A0A0'
  };
});

// 새로운 mockChains 생성
const newMockChains = csvChains.map(csvChain => {
  const nameLower = csvChain.name.toLowerCase();
  const existing = existingChainMap[nameLower] || {};
  
  // id 생성 (이름을 소문자로, 공백과 하이픈 처리)
  const id = nameLower.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  return {
    id: id,
    name: csvChain.name,
    score: 0, // 나중에 계산하거나 기존 값 사용
    logoUrl: existing.logoUrl || '/logos/chainImg.png',
    proposals: csvChain.proposals,
    participation: csvChain.participation,
    consensus: csvChain.consensus,
    stability: csvChain.stability,
    rejection: csvChain.acceptanceRate, // Acceptance Rate를 rejection으로 매핑 (성공률)
    vib: csvChain.validatorBalance, // Validator Balance를 vib로 매핑
    color: existing.color || '#A0A0A0'
  };
});

// 기존 score 값 유지 (이름으로 매칭)
existingMockChains.forEach(existing => {
  const newChain = newMockChains.find(c => c.name.toLowerCase() === existing.name.toLowerCase());
  if (newChain && existing.score) {
    newChain.score = existing.score;
  }
});

// JSON을 포맷팅하여 mockData.js 생성
const formattedChains = newMockChains.map(chain => {
  return `  {
    "id": "${chain.id}",
    "name": "${chain.name}",
    "score": ${chain.score},
    "logoUrl": "${chain.logoUrl}",
    "proposals": ${chain.proposals},
    "participation": ${chain.participation},
    "consensus": ${chain.consensus},
    "stability": ${chain.stability},
    "rejection": ${chain.rejection},
    "vib": ${chain.vib},
    "color": "${chain.color}"
  }`;
}).join(',\n');

const newMockDataContent = `// [자동 생성] CSV 데이터로 업데이트: ${new Date().toISOString()}

export const mockChains = [
${formattedChains}
];`;

// 파일 저장
fs.writeFileSync(mockDataPath, newMockDataContent, 'utf8');

console.log('✅ mockData.js 업데이트 완료!');
console.log(`\n업데이트된 체인 수: ${newMockChains.length}`);
console.log('\n데이터 매핑:');
console.log('  - Participation → participation');
console.log('  - Consensus → consensus');
console.log('  - Stability → stability');
console.log('  - Acceptance Rate(%) → rejection');
console.log('  - Validator Balance → vib');
console.log(`\n파일 저장 위치: ${mockDataPath}`);

