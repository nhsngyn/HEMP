const fs = require('fs');
const path = require('path');

// 체인 이름과 로고 파일명 매핑
const logoMapping = {
  'Agoric': 'agoric.png',
  'Akash': 'akash.png',
  'Axelar': 'axelar.png',
  'Chihuahua': 'chihuahua.png',
  'Cosmos': 'cosmo.png', // cosmo.png -> Cosmos
  'Dydx': 'dydx.png',
  'Gravity-bridge': 'gravity-bridge.png',
  'Injective': 'injective.png',
  'Kava': 'kava.png',
  'Osmosis': 'osmosis.png',
  'Persistence': 'persistence.png',
  'Provenance': 'provenance.png',
  'Secret': 'secret.png',
  'Sei': 'sei.png',
  'Stargaze': 'stargaze.png',
  'Stride': 'strde.png', // strde.png -> Stride
  'Terra': 'terra.png',
  'Xpla': 'xpla.png'
};

// mockData.js 읽기
const mockDataPath = path.join(process.cwd(), 'src/data/mockData.js');
const mockDataContent = fs.readFileSync(mockDataPath, 'utf8');

// mockChains 추출
const mockChainsMatch = mockDataContent.match(/export const mockChains = \[([\s\S]*?)\];/);
if (!mockChainsMatch) {
  console.error('mockChains를 찾을 수 없습니다.');
  process.exit(1);
}

const mockChainsStr = '[' + mockChainsMatch[1] + ']';
const mockChains = eval(mockChainsStr);

// 각 체인의 logoUrl 업데이트
const updatedChains = mockChains.map(chain => {
  const logoFile = logoMapping[chain.name];
  if (logoFile) {
    chain.logoUrl = `/logos/${logoFile}`;
  } else {
    console.warn(`⚠️  ${chain.name}에 대한 로고 파일을 찾을 수 없습니다.`);
  }
  return chain;
});

// JSON 포맷팅
const formattedChains = updatedChains.map(chain => {
  return `  {
    "id": "${chain.id}",
    "name": "${chain.name}",
    "score": ${chain.score},
    "logoUrl": "${chain.logoUrl}",
    "proposals": ${chain.proposals},
    "participation": ${chain.participation},
    "consensus": ${chain.consensus},
    "stability": ${chain.stability},
    "rejection": ${chain.rejection},
    "vib": ${chain.vib},
    "color": "${chain.color}"
  }`;
}).join(',\n');

const newMockDataContent = `// [자동 생성] CSV 데이터로 업데이트: ${new Date().toISOString()}
// [로고 업데이트] 각 체인별 로고 이미지 적용

export const mockChains = [
${formattedChains}
];`;

// 파일 저장
fs.writeFileSync(mockDataPath, newMockDataContent, 'utf8');

console.log('✅ 체인 로고 업데이트 완료!');
console.log(`\n업데이트된 체인 수: ${updatedChains.length}`);
console.log('\n로고 파일 매핑:');
Object.entries(logoMapping).forEach(([name, file]) => {
  console.log(`  ${name} -> ${file}`);
});

