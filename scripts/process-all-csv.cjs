const fs = require('fs');
const path = require('path');

// CSV 파일을 읽어서 차트 데이터 형식으로 변환하는 함수
function convertCSVToPropositions(csvFilePath) {
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
  
  // type 매핑 (CSV의 type을 차트에서 사용하는 type으로 변환)
  const typeMapping = {
    'MsgExecLegacyContent': 'Software Upgrade',
    'MsgCommunityPoolSpend': 'Governance',
    'MsgUpdateParams': 'Parameter Change',
    // 필요에 따라 추가 매핑
  };
  
  function mapType(csvType) {
    if (!csvType) return 'Other';
    // 매핑에 있으면 사용, 없으면 원본 사용 (또는 'Other')
    return typeMapping[csvType] || 'Other';
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
  };
  
  const result = {};
  let totalProcessed = 0;
  
  // 각 CSV 파일 처리
  for (const [filename, chainId] of Object.entries(chainIdMap)) {
    const csvPath = path.join(csvDir, filename);
    
    if (!fs.existsSync(csvPath)) {
      console.log(`⚠️  파일 없음: ${filename}`);
      continue;
    }
    
    try {
      const propositions = convertCSVToPropositions(csvPath);
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

