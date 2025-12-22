const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// 명령줄 인자에서 파일 경로 가져오기
const inputFile = process.argv[2] || 'hemp_data.xlsx';
const outputFile = process.argv[3] || inputFile.replace('.xlsx', '.csv');

// 절대 경로로 변환
const inputPath = path.isAbsolute(inputFile) 
  ? inputFile 
  : path.join(process.cwd(), inputFile);

const outputPath = path.isAbsolute(outputFile)
  ? outputFile
  : path.join(process.cwd(), outputFile);

console.log(`Reading Excel file: ${inputPath}`);

// 엑셀 파일 읽기
const workbook = XLSX.readFile(inputPath);

// 첫 번째 시트 가져오기
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

console.log(`Converting sheet "${sheetName}" to CSV...`);

// CSV로 변환
const csv = XLSX.utils.sheet_to_csv(worksheet);

// CSV 파일 저장
fs.writeFileSync(outputPath, csv, 'utf8');

console.log(`✅ CSV file saved: ${outputPath}`);

// 여러 시트가 있는 경우
if (workbook.SheetNames.length > 1) {
  console.log(`\nNote: This file has ${workbook.SheetNames.length} sheets.`);
  console.log(`Only the first sheet "${sheetName}" was converted.`);
  console.log(`Other sheets: ${workbook.SheetNames.slice(1).join(', ')}`);
}

