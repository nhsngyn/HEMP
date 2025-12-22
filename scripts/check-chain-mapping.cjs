const fs = require('fs');
const path = require('path');

// CSV 파일 읽기
const csvPath = path.join(process.cwd(), 'hemp_data.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');
const csvLines = csvContent.trim().split('\n');
const csvHeaders = csvLines[0].split(',').map(h => h.trim());

// CSV 데이터 파싱
const csvChains = {};
for (let i = 1; i < csvLines.length; i++) {
  const values = csvLines[i].split(',').map(v => v.trim());
  const name = values[0];
  csvChains[name] = {
    name: name,
    participation: parseFloat(values[2]),
    consensus: parseFloat(values[3]),
    stability: parseFloat(values[4]),
    acceptanceRate: parseFloat(values[5]),
    validatorBalance: parseFloat(values[6])
  };
}

// mockData.js 읽기
const mockDataPath = path.join(process.cwd(), 'src/data/mockData.js');
const mockDataContent = fs.readFileSync(mockDataPath, 'utf8');

// mockChains 추출 (간단한 파싱)
const mockChainsMatch = mockDataContent.match(/export const mockChains = \[([\s\S]*?)\];/);
if (!mockChainsMatch) {
  console.error('mockChains를 찾을 수 없습니다.');
  process.exit(1);
}

// JSON으로 파싱 시도
const mockChainsStr = '[' + mockChainsMatch[1] + ']';
const mockChains = eval(mockChainsStr);

console.log('='.repeat(80));
console.log('체인 이름 매칭 확인');
console.log('='.repeat(80));
console.log(`\nCSV 파일 체인 수: ${Object.keys(csvChains).length}`);
console.log(`mockData 체인 수: ${mockChains.length}\n`);

// 체인 이름 비교
const csvNames = Object.keys(csvChains).sort();
const mockNames = mockChains.map(c => c.name).sort();

console.log('CSV 체인 이름:', csvNames.join(', '));
console.log('\nmockData 체인 이름:', mockNames.join(', '));

// 매칭 확인
console.log('\n' + '='.repeat(80));
console.log('매칭 상태');
console.log('='.repeat(80));

const unmatchedCSV = [];
const unmatchedMock = [];

csvNames.forEach(name => {
  const found = mockNames.find(m => m.toLowerCase() === name.toLowerCase());
  if (!found) {
    unmatchedCSV.push(name);
  }
});

mockNames.forEach(name => {
  const found = csvNames.find(c => c.toLowerCase() === name.toLowerCase());
  if (!found) {
    unmatchedMock.push(name);
  }
});

if (unmatchedCSV.length > 0) {
  console.log(`\n⚠️  CSV에만 있는 체인 (${unmatchedCSV.length}개):`, unmatchedCSV.join(', '));
}

if (unmatchedMock.length > 0) {
  console.log(`\n⚠️  mockData에만 있는 체인 (${unmatchedMock.length}개):`, unmatchedMock.join(', '));
}

if (unmatchedCSV.length === 0 && unmatchedMock.length === 0) {
  console.log('\n✅ 모든 체인 이름이 매칭됩니다!');
}

// 데이터 매핑 확인
console.log('\n' + '='.repeat(80));
console.log('데이터 매핑 확인 (첫 번째 체인 예시)');
console.log('='.repeat(80));

const firstCSVChain = csvChains[csvNames[0]];
const firstMockChain = mockChains.find(c => c.name.toLowerCase() === csvNames[0].toLowerCase());

if (firstCSVChain && firstMockChain) {
  console.log(`\n체인: ${firstCSVChain.name}`);
  console.log('\nCSV 데이터:');
  console.log(`  Participation: ${firstCSVChain.participation}`);
  console.log(`  Consensus: ${firstCSVChain.consensus}`);
  console.log(`  Stability: ${firstCSVChain.stability}`);
  console.log(`  Acceptance Rate: ${firstCSVChain.acceptanceRate}`);
  console.log(`  Validator Balance: ${firstCSVChain.validatorBalance}`);
  
  console.log('\nmockData:');
  console.log(`  participation: ${firstMockChain.participation}`);
  console.log(`  consensus: ${firstMockChain.consensus}`);
  console.log(`  stability: ${firstMockChain.stability}`);
  console.log(`  rejection: ${firstMockChain.rejection} (Success Rate = Acceptance)`);
  console.log(`  vib: ${firstMockChain.vib} (Validator Influence Balance)`);
  
  console.log('\n⚠️  주의:');
  console.log('  - CSV의 "Validator Balance"는 mockData의 "vib"와 매칭되어야 함');
  console.log('  - CSV의 "Acceptance Rate"는 mockData의 "rejection"과 매칭되어야 함');
  console.log('    (rejection은 거부율이 아니라 성공률을 의미하는 것으로 보임)');
}

// 레이더 차트 지표 확인
console.log('\n' + '='.repeat(80));
console.log('레이더 차트 지표 매핑');
console.log('='.repeat(80));
console.log('\n레이더 차트에서 사용하는 지표:');
console.log('  1. vib (Validator Influence Balance) - maxValue: 26');
console.log('  2. participation (Participation) - maxValue: 26');
console.log('  3. rejection (Success Rate = Acceptance) - maxValue: 16');
console.log('  4. stability (Stability) - maxValue: 16');
console.log('  5. consensus (Consensus) - maxValue: 16');
console.log('\nCSV 파일의 컬럼:');
console.log('  1. Participation → participation');
console.log('  2. Consensus → consensus');
console.log('  3. Stability(작을수록 좋은것) → stability');
console.log('  4. Acceptance Rate(%) → rejection (성공률)');
console.log('  5. Validator Balance(Nakamoto Coefficient) → vib');

