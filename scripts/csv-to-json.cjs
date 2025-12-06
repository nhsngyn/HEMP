const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx'); // 엑셀 라이브러리 사용

// ★ 중요: 이번엔 .xlsx 파일을 읽습니다!
const excelFilePath = path.join(__dirname, '../hemp_data.xlsx');
const outputFilePath = path.join(__dirname, '../src/data/mockData.js');

try {
  console.log('📂 엑셀 파일(.xlsx)을 읽는 중...');
  
  // 1. 엑셀 파일 로드 (파일이 없으면 여기서 에러가 납니다)
  const workbook = XLSX.readFile(excelFilePath);
  const sheetName = workbook.SheetNames[0]; // 첫 번째 시트 선택
  const sheet = workbook.Sheets[sheetName];
  
  // 2. 데이터를 JSON으로 변환
  const rawData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  // 3. 데이터 매핑
  const jsonData = rawData.map((row) => {
    // 엑셀 헤더 순서대로 값을 가져옵니다 (0번째: 이름, 1번째: 점수...)
    const values = Object.values(row);

    return {
      id: String(values[0]).toLowerCase().replace(/\s+/g, '-'), 
      name: String(values[0]), 
      score: Number(values[1]) || 0,        
      participation: Number(values[2]) || 0,
      consensus: Number(values[3]) || 0,    
      stability: Number(values[4]) || 0,    
      rejection: Number(values[5]) || 0,    
      vib: Number(values[6]) || 0,          
      color: '#A0A0A0' 
    };
  });

  // 4. 저장
  const fileContent = `// [자동 생성] 엑셀 데이터 변환 완료: ${new Date().toLocaleString()}\n\nexport const mockChains = ${JSON.stringify(jsonData, null, 2)};`;
  fs.writeFileSync(outputFilePath, fileContent, 'utf8');
  
  console.log(`✅ 변환 성공! 총 ${jsonData.length}개의 체인 데이터를 가져왔습니다.`);
  console.log(`👉 저장 경로: src/data/mockData.js`);

} catch (err) {
  console.error('❌ 에러 발생:', err.message);
  console.log('힌트: hemp_data.xlsx 파일이 프로젝트 제일 바깥쪽(루트)에 있는지 확인해주세요!');
}