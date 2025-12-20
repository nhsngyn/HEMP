const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// 경로 설정
// 실제 데이터 파일 우선 사용, 없으면 기본 파일 사용
const realDataPath = path.join(__dirname, '../real_data/_HEMP_processed_data.xlsx');
const defaultDataPath = path.join(__dirname, '../hemp_data.xlsx');
const excelFilePath = fs.existsSync(realDataPath) ? realDataPath : defaultDataPath;
const outputFilePath = path.join(__dirname, '../src/data/mockData.js');

try {
  console.log('📂 엑셀 데이터 로드 중...');
  console.log(`📄 파일 경로: ${excelFilePath}`);
  
  const workbook = XLSX.readFile(excelFilePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const dataRows = rows.slice(1); 

  const jsonData = dataRows.map((row) => {
    // 1. 데이터 추출
    const raw = {
      name: String(row[0] || "Unknown"),
      proposals: Number(row[1]) || 0,
      part: Number(row[2]) || 0,
      cons: Number(row[3]) || 0,
      stab: Number(row[4]) || 0,
      rej: Number(row[5]) || 0,
      vib: Number(row[6]) || 0,
    };

    // 2. ID 생성
    const id = raw.name.toLowerCase().trim().replace(/\s+/g, '-');

    // 3. 점수 합산
    const totalScore = Number((raw.part + raw.cons + raw.stab + raw.rej + raw.vib).toFixed(2));

    return {
      id: id,
      name: raw.name,
      score: totalScore,
      
      // public/logos/chainImg.png 파일로 고정!
      logoUrl: "/logos/chainImg.png",
      
      proposals: raw.proposals,
      
      // 세부 지표
      participation: raw.part,
      consensus: raw.cons,
      stability: raw.stab,
      rejection: raw.rej,
      vib: raw.vib,
      
      color: '#A0A0A0'
    };
  }).filter(item => item.name !== "Unknown");

  const fileContent = `// [자동 생성] 로컬 이미지(chainImg.png) 통일 버전: ${new Date().toLocaleString()}\n\nexport const mockChains = ${JSON.stringify(jsonData, null, 2)};`;
  fs.writeFileSync(outputFilePath, fileContent, 'utf8');
  
  console.log(`✅ 데이터 변환 완료! (총 ${jsonData.length}개 체인)`);
  console.log(`👉 모든 로고 경로가 '/logos/chainImg.png'로 설정되었습니다.`);

} catch (err) {
  console.error('❌ 에러:', err.message);
}