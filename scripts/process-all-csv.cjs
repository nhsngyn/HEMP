const fs = require('fs');
const path = require('path');

// 타입명 포맷팅: "Msg" 제거 + 대문자 기준 띄어쓰기
function formatTypeName(csvType) {
  if (!csvType) return '';
  
  // "Msg"로 시작하지 않으면 원본 그대로 반환
  if (!csvType.startsWith('Msg')) {
    return csvType;
  }
  
  // "Msg"로 시작하면 제거하고 대문자 기준으로 띄어쓰기 추가
  let formatted = csvType.substring(3);
  formatted = formatted.replace(/([A-Z])/g, ' $1').trim();
  
  return formatted;
}

// 모든 CSV 파일에서 타입 분포 분석하여 상위 6개 선택
function analyzeTypeDistribution(csvDir) {
  const typeCounts = new Map();
  const chainIdMap = {
    'agoric.csv': 'agoric',
    'akash.csv': 'akash',
    'axelar.csv': 'axelar',
    'chihuahua.csv': 'chihuahua',
    'cosmos.csv': 'cosmos',
    'dydx.csv': 'dydx',
    'gravity-bridge.csv': 'gravity-bridge',
    'injective.csv': 'injective',
    'kava.csv': 'kava',
    'osmosis.csv': 'osmosis',
    'persistence.csv': 'persistence',
    'provenance.csv': 'provenance',
    'secret.csv': 'secret',
    'sei.csv': 'sei',
    'stargaze.csv': 'stargaze',
    'stride.csv': 'stride',
    'terra.csv': 'terra',
    'xpla.csv': 'xpla',
  };
  
  // 모든 CSV 파일에서 타입 수집
  for (const [filename, chainId] of Object.entries(chainIdMap)) {
    const csvPath = path.join(csvDir, filename);
    if (!fs.existsSync(csvPath)) continue;
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) continue;
    
    const headers = lines[0].split(',').map(h => h.trim());
    const typeIdx = headers.indexOf('type');
    if (typeIdx === -1) continue;
    
    // CSV 파싱 헬퍼
    function parseCSVLine(line) {
      const values = [];
      let current = '';
      let inQuotes = false;
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    }
    
    // 타입 카운트
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = parseCSVLine(line);
      const csvType = values[typeIdx] || '';
      if (csvType && csvType !== 'type') {
        typeCounts.set(csvType, (typeCounts.get(csvType) || 0) + 1);
      }
    }
  }
  
  // 상위 6개 타입 선택
  const sortedTypes = Array.from(typeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([type]) => type);
  
  return sortedTypes;
}

// CSV 파일을 읽어서 차트 데이터 형식으로 변환하는 함수
function convertCSVToPropositions(csvFilePath, top6Types) {
  // CSV 파일 읽기
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
  const lines = csvContent.trim().split('\n');
  
  // 헤더 파싱
  const headers = lines[0].split(',').map(h => h.trim());
  const idIdx = headers.indexOf('id');
  const titleIdx = headers.indexOf('title');
  const typeIdx = headers.indexOf('type');
  const statusIdx = headers.indexOf('status');
  const processingTimeIdx = headers.indexOf('ProcessingTime');
  const participationIdx = headers.indexOf('Participation');
  const consensusIdx = headers.indexOf('Consensus');
  
  // Participation을 participationLevel로 변환 (0~1 -> High/Mid/Low)
  function getParticipationLevel(participation) {
    const value = parseFloat(participation);
    if (value >= 0.6) return 'High';
    if (value >= 0.3) return 'Mid';
    return 'Low';
  }
  
  // Participation을 백분율 문자열로 변환
  function formatParticipation(participation) {
    const value = parseFloat(participation);
    return (value * 100).toFixed(2) + '%';
  }
  
  // Consensus를 voteComposition으로 변환 (0~1 -> Consensus/Contested/Polarized)
  function getVoteComposition(consensus) {
    const value = parseFloat(consensus);
    if (value >= 0.8) return 'Consensus';
    if (value >= 0.5) return 'Contested';
    return 'Polarized';
  }
  
  // ProcessingTime을 processingSpeed로 변환
  function getProcessingSpeed(processingTime) {
    if (!processingTime) return 'Normal';
    
    // "3 days, 0 hours 0 minutes" 형식 파싱
    const dayMatch = processingTime.match(/(\d+)\s*days?/);
    const hourMatch = processingTime.match(/(\d+)\s*hours?/);
    const minuteMatch = processingTime.match(/(\d+)\s*minutes?/);
    
    const days = dayMatch ? parseInt(dayMatch[1]) : 0;
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;
    
    const totalHours = days * 24 + hours + minutes / 60;
    
    if (totalHours <= 72) return 'Fast';      // 3일 이하
    if (totalHours <= 120) return 'Normal';   // 5일 이하
    return 'Slow';                             // 5일 초과
  }
  
  // status를 result로 변환
  function getResult(status) {
    if (!status) return 'Passed';
    const upperStatus = status.toUpperCase();
    if (upperStatus.includes('PASSED')) return 'Passed';
    if (upperStatus.includes('REJECTED')) return 'Rejected';
    return 'Failed';
  }
  
  // status를 포맷팅 (예: "PASSED (75.5%)")
  function formatStatus(status, participation) {
    if (!status) return 'PASSED';
    const upperStatus = status.toUpperCase();
    if (upperStatus.includes('PASSED')) {
      const value = parseFloat(participation);
      return `PASSED (${(value * 100).toFixed(1)}%)`;
    }
    if (upperStatus.includes('REJECTED')) {
      const value = parseFloat(participation);
      return `REJECTED (${(value * 100).toFixed(1)}%)`;
    }
    return 'FAILED';
  }
  
  // 타입 매핑: 상위 6개는 포맷팅된 이름으로, 나머지는 "Other"
  function mapType(csvType) {
    if (!csvType) return 'Other';
    
    // 상위 6개에 포함되어 있으면 포맷팅된 이름 사용
    if (top6Types.includes(csvType)) {
      return formatTypeName(csvType);
    }
    
    // 나머지는 "Other"
    return 'Other';
  }
  
  // 데이터 변환
  const propositions = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // CSV 파싱 (쉼표로 분리, 하지만 제목에 쉼표가 있을 수 있으므로 주의)
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    // 값 추출
    const id = values[idIdx] ? parseInt(values[idIdx]) : 1000 + i;
    const title = values[titleIdx] || `Proposal ${id}`;
    const csvType = values[typeIdx] || '';
    const status = values[statusIdx] || '';
    const processingTime = values[processingTimeIdx] || '';
    const participation = values[participationIdx] || '0';
    const consensus = values[consensusIdx] || '0';
    
    // 변환
    const proposition = {
      id: id,
      title: title,
      type: mapType(csvType),
      originalType: csvType || '', // 원본 타입 저장 (프로포절 테이블용)
      participationLevel: getParticipationLevel(participation),
      voteComposition: getVoteComposition(consensus),
      result: getResult(status),
      processingSpeed: getProcessingSpeed(processingTime),
      status: formatStatus(status, participation),
      processingTime: processingTime || '-',
      participation: formatParticipation(participation)
    };
    
    propositions.push(proposition);
  }
  
  return propositions;
}

// 모든 CSV 파일 처리
function processAllCSVFiles(csvDir, outputPath) {
  const chainIdMap = {
    'agoric.csv': 'agoric',
    'akash.csv': 'akash',
    'axelar.csv': 'axelar',
    'chihuahua.csv': 'chihuahua',
    'cosmos.csv': 'cosmos',
    'dydx.csv': 'dydx',
    'gravity-bridge.csv': 'gravity-bridge',
    'injective.csv': 'injective',
    'kava.csv': 'kava',
    'osmosis.csv': 'osmosis',
    'persistence.csv': 'persistence',
    'provenance.csv': 'provenance',
    'secret.csv': 'secret',
    'sei.csv': 'sei',
    'stargaze.csv': 'stargaze',
    'stride.csv': 'stride',
    'terra.csv': 'terra',
    'xpla.csv': 'xpla',
  };
  
  // 1단계: 전체 타입 분포 분석하여 상위 6개 선택
  console.log('📊 타입 분포 분석 중...');
  const top6Types = analyzeTypeDistribution(csvDir);
  console.log('✅ 상위 6개 타입:', top6Types.map(t => `${t} → ${formatTypeName(t)}`).join(', '));
  console.log('');
  
  const result = {};
  let totalProcessed = 0;
  
  // 2단계: 각 CSV 파일 처리
  for (const [filename, chainId] of Object.entries(chainIdMap)) {
    const csvPath = path.join(csvDir, filename);
    
    if (!fs.existsSync(csvPath)) {
      console.log(`⚠️  파일 없음: ${filename}`);
      continue;
    }
    
    try {
      const propositions = convertCSVToPropositions(csvPath, top6Types);
      result[chainId] = propositions;
      totalProcessed += propositions.length;
      console.log(`✅ ${chainId}: ${propositions.length}개 프로포절 처리됨`);
    } catch (error) {
      console.error(`❌ ${filename} 처리 중 오류:`, error.message);
    }
  }
  
  // 결과를 JavaScript 파일로 저장
  const fileContent = `// [자동 생성] 실제 CSV 데이터에서 변환된 프로포절 데이터: ${new Date().toLocaleString()}
// 각 프로포절은 type, participationLevel, voteComposition, result, processingSpeed를 가짐

export const sankeyMockPropositions = ${JSON.stringify(result, null, 2)};

// 기본 더미 데이터 (체인 ID가 없을 때 사용)
export const defaultDummyPropositions = [];
`;
  
  fs.writeFileSync(outputPath, fileContent, 'utf-8');
  console.log(`\n✅ 완료! 총 ${totalProcessed}개의 프로포절이 ${outputPath}에 저장되었습니다.`);
  
  return result;
}

// 명령줄 인자 처리
const args = process.argv.slice(2);

// 기본 경로들 (우선순위 순서)
const defaultPaths = [
  path.resolve(__dirname, '../real_data'),  // 프로젝트 내부 real_data 폴더
  path.resolve(__dirname, '../data/csv'),   // 프로젝트 내부 data/csv 폴더
  path.resolve(__dirname, '../csv'),         // 프로젝트 루트의 csv 폴더
  path.resolve(process.env.HOME, 'Downloads'), // 사용자 Downloads 폴더
];

let csvDir = null;
let outputPath = null;

if (args.length > 0) {
  // 명령줄에서 경로 지정
  csvDir = path.resolve(args[0]);
  outputPath = args[1] ? path.resolve(args[1]) : path.resolve(__dirname, '../src/data/sankeyMockData.js');
} else {
  // 기본 경로 중에서 찾기
  for (const defaultPath of defaultPaths) {
    if (fs.existsSync(defaultPath)) {
      csvDir = defaultPath;
      console.log(`📂 CSV 디렉토리 자동 감지: ${csvDir}`);
      break;
    }
  }
  outputPath = path.resolve(__dirname, '../src/data/sankeyMockData.js');
}

if (!csvDir || !fs.existsSync(csvDir)) {
  console.error(`❌ CSV 디렉토리를 찾을 수 없습니다.`);
  console.log('\n사용법:');
  console.log('  1. 프로젝트 내부에 data/csv/ 또는 csv/ 폴더를 만들고 CSV 파일들을 넣으세요');
  console.log('  2. 또는 명령줄에서 경로를 지정하세요:');
  console.log('     node process-all-csv.cjs <CSV파일들이있는디렉토리> [출력파일경로]');
  console.log('     예시: node process-all-csv.cjs ~/Downloads src/data/sankeyMockData.js');
  process.exit(1);
}

processAllCSVFiles(csvDir, outputPath);

