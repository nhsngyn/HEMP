const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// CSV 파일 읽기
const csvFile = process.argv[2] || 'hemp_data.csv';
const csvPath = path.isAbsolute(csvFile) 
  ? csvFile 
  : path.join(process.cwd(), csvFile);

console.log(`Reading CSV file: ${csvPath}`);

// CSV 파일 읽기
const fileContent = fs.readFileSync(csvPath, 'utf8');
const lines = fileContent.trim().split('\n');

// 헤더 파싱
const headers = lines[0].split(',').map(h => h.trim());
console.log('Headers:', headers);

// 데이터 파싱
const data = [];
for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split(',').map(v => v.trim());
  const row = {};
  headers.forEach((header, idx) => {
    const value = values[idx];
    // 숫자로 변환 가능하면 변환
    if (value && !isNaN(value) && value !== '') {
      row[header] = parseFloat(value);
    } else {
      row[header] = value;
    }
  });
  data.push(row);
}

console.log(`\nLoaded ${data.length} chains\n`);

// 지표별 최대/최소값 계산
const participationValues = data.map(d => d['Participation']).filter(v => !isNaN(v));
const consensusValues = data.map(d => d['Consensus']).filter(v => !isNaN(v));
const stabilityValues = data.map(d => d['Stability(작을수록 좋은것)']).filter(v => !isNaN(v));
const acceptanceValues = data.map(d => d['Acceptance Rate(%)']).filter(v => !isNaN(v));
const validatorBalanceValues = data.map(d => d['Validator Balance(Nakamoto Coefficient) (클수록 좋은 것)']).filter(v => !isNaN(v));

const maxParticipation = Math.max(...participationValues);
const minParticipation = Math.min(...participationValues);
const maxConsensus = Math.max(...consensusValues);
const minConsensus = Math.min(...consensusValues);
const maxStability = Math.max(...stabilityValues);
const minStability = Math.min(...stabilityValues);
const maxAcceptance = Math.max(...acceptanceValues);
const minAcceptance = Math.min(...acceptanceValues);
const maxValidatorBalance = Math.max(...validatorBalanceValues);
const minValidatorBalance = Math.min(...validatorBalanceValues);

console.log('Min/Max values:');
console.log(`  Participation: ${minParticipation} ~ ${maxParticipation}`);
console.log(`  Consensus: ${minConsensus} ~ ${maxConsensus}`);
console.log(`  Stability: ${minStability} ~ ${maxStability} (작을수록 좋음)`);
console.log(`  Acceptance Rate: ${minAcceptance} ~ ${maxAcceptance}`);
console.log(`  Validator Balance: ${minValidatorBalance} ~ ${maxValidatorBalance}\n`);

// 점수 계산 함수
function calculateScore(row) {
  // 각 지표를 0-1 범위로 정규화
  // Participation: 클수록 좋음
  const participationScore = (row['Participation'] - minParticipation) / (maxParticipation - minParticipation);
  
  // Consensus: 클수록 좋음
  const consensusScore = (row['Consensus'] - minConsensus) / (maxConsensus - minConsensus);
  
  // Stability: 작을수록 좋음 (역정규화)
  const stabilityScore = 1 - ((row['Stability(작을수록 좋은것)'] - minStability) / (maxStability - minStability));
  
  // Acceptance Rate: 클수록 좋음
  const acceptanceScore = (row['Acceptance Rate(%)'] - minAcceptance) / (maxAcceptance - minAcceptance);
  
  // Validator Balance: 클수록 좋음
  const validatorBalanceScore = (row['Validator Balance(Nakamoto Coefficient) (클수록 좋은 것)'] - minValidatorBalance) / (maxValidatorBalance - minValidatorBalance);
  
  // 평균 점수 계산 (각 지표 동일 가중치)
  const rawScore = (participationScore + consensusScore + stabilityScore + acceptanceScore + validatorBalanceScore) / 5;
  
  // 100점 만점으로 변환
  const score100 = rawScore * 100;
  
  // 소수점 1자리에서 반올림
  const roundedScore = Math.round(score100 * 10) / 10;
  
  return {
    participationScore: Math.round(participationScore * 100 * 10) / 10,
    consensusScore: Math.round(consensusScore * 100 * 10) / 10,
    stabilityScore: Math.round(stabilityScore * 100 * 10) / 10,
    acceptanceScore: Math.round(acceptanceScore * 100 * 10) / 10,
    validatorBalanceScore: Math.round(validatorBalanceScore * 100 * 10) / 10,
    totalScore: roundedScore
  };
}

// 각 체인별 점수 계산
const results = data.map(row => {
  const scores = calculateScore(row);
  return {
    name: row['Name'],
    participation: row['Participation'],
    consensus: row['Consensus'],
    stability: row['Stability(작을수록 좋은것)'],
    acceptanceRate: row['Acceptance Rate(%)'],
    validatorBalance: row['Validator Balance(Nakamoto Coefficient) (클수록 좋은 것)'],
    ...scores
  };
});

// 점수순으로 정렬
results.sort((a, b) => b.totalScore - a.totalScore);

// 결과 출력
console.log('='.repeat(100));
console.log('HEMP Score Calculation Results');
console.log('='.repeat(100));
console.log('\nRank | Name              | Participation | Consensus | Stability | Acceptance | Validator | Total Score');
console.log('-'.repeat(100));

results.forEach((result, index) => {
  console.log(
    `${String(index + 1).padStart(4)} | ${result.name.padEnd(16)} | ${String(result.participationScore).padStart(12)} | ${String(result.consensusScore).padStart(9)} | ${String(result.stabilityScore).padStart(9)} | ${String(result.acceptanceScore).padStart(10)} | ${String(result.validatorBalanceScore).padStart(9)} | ${String(result.totalScore).padStart(10)}`
  );
});

// JSON 파일로 저장
const outputJson = {
  metadata: {
    calculatedAt: new Date().toISOString(),
    totalChains: results.length,
    minMaxValues: {
      participation: { min: minParticipation, max: maxParticipation },
      consensus: { min: minConsensus, max: maxConsensus },
      stability: { min: minStability, max: maxStability },
      acceptanceRate: { min: minAcceptance, max: maxAcceptance },
      validatorBalance: { min: minValidatorBalance, max: maxValidatorBalance }
    }
  },
  results: results
};

const outputPath = csvPath.replace('.csv', '_scores.json');
fs.writeFileSync(outputPath, JSON.stringify(outputJson, null, 2), 'utf8');
console.log(`\n✅ Results saved to: ${outputPath}`);

// CSV로도 저장
const csvOutput = [
  ['Name', 'Participation', 'Consensus', 'Stability', 'Acceptance Rate', 'Validator Balance', 'Participation Score', 'Consensus Score', 'Stability Score', 'Acceptance Score', 'Validator Balance Score', 'Total Score']
];

results.forEach(result => {
  csvOutput.push([
    result.name,
    result.participation,
    result.consensus,
    result.stability,
    result.acceptanceRate,
    result.validatorBalance,
    result.participationScore,
    result.consensusScore,
    result.stabilityScore,
    result.acceptanceScore,
    result.validatorBalanceScore,
    result.totalScore
  ]);
});

const csvOutputPath = csvPath.replace('.csv', '_scores.csv');
const csvContent = csvOutput.map(row => row.join(',')).join('\n');
fs.writeFileSync(csvOutputPath, csvContent, 'utf8');
console.log(`✅ CSV results saved to: ${csvOutputPath}`);

