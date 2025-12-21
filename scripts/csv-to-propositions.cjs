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

// CSV 파일을 읽어서 차트 데이터 형식으로 변환하는 함수
function convertCSVToPropositions(csvFilePath, outputPath = null) {
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

  // type 매핑: 단일 파일 처리이므로 포맷팅만 적용
  // (전체 통계 기반 상위 6개 선택은 process-all-csv.cjs 사용 권장)
  function mapType(csvType) {
    if (!csvType) return 'Other';
    // 타입명 포맷팅 적용
    return formatTypeName(csvType);
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

  // 결과 출력
  const result = {
    propositions: propositions,
    count: propositions.length
  };

  if (outputPath) {
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`✅ 변환 완료: ${propositions.length}개의 프로포절이 ${outputPath}에 저장되었습니다.`);
  } else {
    console.log(JSON.stringify(result, null, 2));
  }

  return result;
}

// 명령줄 인자 처리
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('사용법: node csv-to-propositions.cjs <csv파일경로> [출력파일경로]');
  console.log('예시: node csv-to-propositions.cjs ../Downloads/agoric.csv ../src/data/agoric-propositions.json');
  process.exit(1);
}

const csvFilePath = path.resolve(args[0]);
const outputPath = args[1] ? path.resolve(args[1]) : null;

if (!fs.existsSync(csvFilePath)) {
  console.error(`❌ 파일을 찾을 수 없습니다: ${csvFilePath}`);
  process.exit(1);
}

convertCSVToPropositions(csvFilePath, outputPath);

