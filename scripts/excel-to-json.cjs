const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

/* =========================
 * PATH SETTINGS
 * ========================= */

// 실제 데이터 파일 우선 사용, 없으면 기본 파일 사용
const realDataPath = path.join(__dirname, '../real_data/_HEMP_processed_data.xlsx');
const defaultDataPath = path.join(__dirname, '../hemp_data.xlsx');
const excelFilePath = fs.existsSync(realDataPath) ? realDataPath : defaultDataPath;

// output
const outputFilePath = path.join(__dirname, '../src/data/mockData.js');

// logos
const publicLogosDir = path.join(__dirname, '../public/logos');
const fallbackLogo = '/logos/chainImg.png';

try {
  console.log('📂 엑셀 데이터 로드 중...');
  console.log(`📄 파일 경로: ${excelFilePath}`);

  /* =========================
   * LOAD EXCEL
   * ========================= */
  const workbook = XLSX.readFile(excelFilePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const dataRows = rows.slice(1); // header 제거

  /* =========================
   * TRANSFORM DATA
   * ========================= */
  const jsonData = dataRows
    .map((row) => {
      // 1. raw 데이터
      const raw = {
        name: String(row[0] || 'Unknown'),
        proposals: Number(row[1]) || 0,
        part: Number(row[2]) || 0,
        cons: Number(row[3]) || 0,
        stab: Number(row[4]) || 0,
        rej: Number(row[5]) || 0,
        vib: Number(row[6]) || 0,
      };

      if (raw.name === 'Unknown') return null;

      // 2. ID 생성 (로고 파일명 기준)
      const id = raw.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-');

      // 3. 점수 합산
      const totalScore = Number(
        (raw.part + raw.cons + raw.stab + raw.rej + raw.vib).toFixed(2)
      );

      // 4. 로고 자동 매핑
      const logoPath = `/logos/${id}.png`;
      const logoFullPath = path.join(publicLogosDir, `${id}.png`);

      const finalLogoUrl = fs.existsSync(logoFullPath)
        ? logoPath
        : fallbackLogo;

      return {
        id,
        name: raw.name,
        score: totalScore,

        // 🔥 체인별 로고 자동 적용
        logoUrl: finalLogoUrl,

        proposals: raw.proposals,

        // 세부 지표
        participation: raw.part,
        consensus: raw.cons,
        stability: raw.stab,
        rejection: raw.rej,
        vib: raw.vib,

        color: '#A0A0A0',
      };
    })
    .filter(Boolean);

  /* =========================
   * WRITE FILE
   * ========================= */
  const fileContent =
`// [자동 생성] 체인별 로고 자동 매핑 버전
// 생성 시각: ${new Date().toLocaleString()}

export const mockChains = ${JSON.stringify(jsonData, null, 2)};
`;

  fs.writeFileSync(outputFilePath, fileContent, 'utf8');

  console.log(`✅ 데이터 변환 완료! (총 ${jsonData.length}개 체인)`);
  console.log('🖼️ 로고 규칙: /public/logos/{id}.png');
  console.log('🧯 fallback:', fallbackLogo);

} catch (err) {
  console.error('❌ 에러 발생:', err);
}
