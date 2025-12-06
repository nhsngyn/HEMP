const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// 이름이 바뀌었으니 파일 경로도 명확하게!
const excelFilePath = path.join(__dirname, '../hemp_data.xlsx');
const outputFilePath = path.join(__dirname, '../src/data/mockData.js');

try {
  console.log('📂 엑셀 데이터 로드 중...');
  
  const workbook = XLSX.readFile(excelFilePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  
  // 헤더가 있는 2번째 줄부터 데이터로 인식 (header: 1 옵션 사용)
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const dataRows = rows.slice(1); 

  const jsonData = dataRows.map((row) => {
    // 1. 데이터 추출 (값이 없으면 0으로 처리)
    // 엑셀 컬럼 순서: Name(0), Part(1), Cons(2), Stab(3), Rej(4), VIB(5)
    const raw = {
      name: String(row[0] || "Unknown"),
      part: Number(row[1]) || 0,
      cons: Number(row[2]) || 0,
      stab: Number(row[3]) || 0,
      rej: Number(row[4]) || 0,
      vib: Number(row[5]) || 0,
    };

    // 2. [담당자 피드백 반영] 5가지 점수 단순 합산
    // (소수점 2자리까지만 깔끔하게 자름)
    const totalScore = Number((raw.part + raw.cons + raw.stab + raw.rej + raw.vib).toFixed(2));

    return {
      id: raw.name.toLowerCase().replace(/\s+/g, '-'),
      name: raw.name,
      score: totalScore, // 여기가 합산 점수!
      
      // 세부 지표도 그대로 저장 (차트용)
      participation: raw.part,
      consensus: raw.cons,
      stability: raw.stab,
      rejection: raw.rej,
      vib: raw.vib,
      
      color: '#A0A0A0' // 기본색
    };
  }).filter(item => item.name !== "Unknown");

  // 파일 저장
  const fileContent = `// [자동 생성] 5개 지표 단순 합산 버전: ${new Date().toLocaleString()}\n\nexport const mockChains = ${JSON.stringify(jsonData, null, 2)};`;
  fs.writeFileSync(outputFilePath, fileContent, 'utf8');
  
  console.log(`✅ 데이터 변환 완료!`);
  console.log(`👉 예시: ${jsonData[0].name}의 총점 = ${jsonData[0].score}`);
  console.log(`   (합산 내역: ${jsonData[0].participation} + ${jsonData[0].consensus} + ${jsonData[0].stability} + ${jsonData[0].rejection} + ${jsonData[0].vib})`);

} catch (err) {
  console.error('❌ 에러:', err.message);
}