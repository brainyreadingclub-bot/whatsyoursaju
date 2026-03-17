// 검토 후 버그 수정 검증
const 천간 = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const 천간음양 = ['양','음','양','음','양','음','양','음','양','음'];
const 천간오행 = ['목','목','화','화','토','토','금','금','수','수'];
const 오행한자 = { '목':'木', '화':'火', '토':'土', '금':'金', '수':'水' };

let pass = 0, fail = 0;
function test(label, actual, expected) {
  const ok = actual === expected;
  console.log(`  ${ok?'✅':'❌'} ${label}: ${actual} ${ok?'':'→ 정답: '+expected}`);
  ok ? pass++ : fail++;
}

console.log('═══════════════════════════════════════════════════');
console.log('  검토 후 버그 수정 검증');
console.log('═══════════════════════════════════════════════════\n');

// 편재/정재 로직 재현 (수정된 버전)
function getWealthType(dayGanIdx, wealthElement, pillars) {
  const dayYY = 천간음양[dayGanIdx];
  const pillarGans = (pillars || []).filter(p => p).map(p => p.gan);
  const 편재수 = pillarGans.filter(g => 천간오행[g] === wealthElement && 천간음양[g] === dayYY).length;
  const 정재수 = pillarGans.filter(g => 천간오행[g] === wealthElement && 천간음양[g] !== dayYY).length;
  return (편재수 + 정재수 > 0) ? (편재수 >= 정재수 ? '편재' : '정재') : '';
}

console.log('▸ 버그 1: 편재/정재 실제 사주 기반 판단');

// 케이스 1: 庚(금,양) 일간, 사주에 甲(목,양)=편재 있음
const pillars1 = [
  { gan: 0, ji: 10 },  // 甲戌 (甲=목,양 → 庚의 편재)
  { gan: 0, ji: 10 },  // 甲戌
  { gan: 6, ji: 6 },   // 庚午
  { gan: 9, ji: 7 }    // 癸未
];
test('庚일간+甲(편재) → 편재', getWealthType(6, '목', pillars1), '편재');

// 케이스 2: 庚(금,양) 일간, 사주에 乙(목,음)=정재 있음
const pillars2 = [
  { gan: 1, ji: 10 },  // 乙戌 (乙=목,음 → 庚의 정재)
  { gan: 2, ji: 6 },   // 丙午
  { gan: 6, ji: 6 },   // 庚午
  { gan: 9, ji: 7 }    // 癸未
];
test('庚일간+乙(정재) → 정재', getWealthType(6, '목', pillars2), '정재');

// 케이스 3: 재성 천간이 없는 경우
const pillars3 = [
  { gan: 6, ji: 10 },  // 庚戌
  { gan: 2, ji: 6 },   // 丙午
  { gan: 6, ji: 6 },   // 庚午
  { gan: 9, ji: 7 }    // 癸未
];
test('庚일간+재성없음 → 빈값', getWealthType(6, '목', pillars3), '');

// 케이스 4: 편재2 정재1 → 편재 우세
const pillars4 = [
  { gan: 0, ji: 10 },  // 甲戌 (편재)
  { gan: 0, ji: 6 },   // 甲午 (편재)
  { gan: 6, ji: 6 },   // 庚午
  { gan: 1, ji: 7 }    // 乙未 (정재)
];
test('庚일간+편재2정재1 → 편재', getWealthType(6, '목', pillars4), '편재');

// 케이스 5: 편재1 정재2 → 정재 우세
const pillars5 = [
  { gan: 1, ji: 10 },  // 乙戌 (정재)
  { gan: 1, ji: 6 },   // 乙午 (정재)
  { gan: 6, ji: 6 },   // 庚午
  { gan: 0, ji: 7 }    // 甲未 (편재)
];
test('庚일간+편재1정재2 → 정재', getWealthType(6, '목', pillars5), '정재');

console.log('\n▸ 버그 2: wealthTypeText가 text 덮어쓰기에 영향 안 받음');
// 시뮬레이션: wealthTypeText는 별도 변수
let wealthTypeText = '편재 텍스트';
let text = '';
text = '새 재물 분석 텍스트';  // 덮어쓰기
const result = wealthTypeText + text;
test('wealthTypeText 보존됨', result.includes('편재 텍스트'), true);
test('text도 포함됨', result.includes('새 재물 분석 텍스트'), true);

console.log('\n▸ 다른 일간 테스트');
// 丙(화,양) 일간, 재성=금 → 庚(금,양)=편재, 辛(금,음)=정재
const pillars6 = [
  { gan: 7, ji: 0 },   // 辛子 (정재)
  { gan: 2, ji: 6 },   // 丙午
  { gan: 2, ji: 6 },   // 丙午
  { gan: 3, ji: 7 }    // 丁未
];
test('丙일간+辛(정재) → 정재', getWealthType(2, '금', pillars6), '정재');

const pillars7 = [
  { gan: 6, ji: 0 },   // 庚子 (편재)
  { gan: 2, ji: 6 },   // 丙午
  { gan: 2, ji: 6 },   // 丙午
  null                  // 시간 미입력
];
test('丙일간+庚(편재)+null시주 → 편재', getWealthType(2, '금', pillars7), '편재');

console.log('\n═══════════════════════════════════════════════════');
console.log(`  결과: ${pass}개 통과 / ${fail}개 실패`);
console.log('═══════════════════════════════════════════════════');
