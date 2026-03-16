// Step 1 검증: 입춘/절기 경계 반영 후 테스트
const 천간 = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const 지지 = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const 천간한글 = ['갑','을','병','정','무','기','경','신','임','계'];
const 지지한글 = ['자','축','인','묘','진','사','오','미','신','유','술','해'];

// 절기 경계 (역순)
const 절기경계 = [
  [12, 7, 0], [11, 7, 11], [10, 8, 10], [9, 8, 9],
  [8, 8, 8], [7, 7, 7], [6, 6, 6], [5, 6, 5],
  [4, 5, 4], [3, 6, 3], [2, 4, 2], [1, 6, 1],
];

function getSajuYear(year, month, day) {
  if (month < 2 || (month === 2 && day < 4)) return year - 1;
  return year;
}

function getSajuMonthJi(month, day) {
  for (const [m, d, ji] of 절기경계) {
    if (month > m || (month === m && day >= d)) return ji;
  }
  return 0;
}

function getYearPillar(year, month, day) {
  month = month || 6; day = day || 1;
  const sajuYear = getSajuYear(year, month, day);
  const ganIdx = (sajuYear - 4) % 10;
  const jiIdx = (sajuYear - 4) % 12;
  return { gan: (ganIdx + 10) % 10, ji: (jiIdx + 12) % 12 };
}

function getMonthPillar(year, month, day) {
  day = day || 15;
  const sajuYear = getSajuYear(year, month, day);
  const yearGan = ((sajuYear - 4) % 10 + 10) % 10;
  const monthGanBase = ((yearGan % 5) * 2 + 2) % 10;
  const monthJi = getSajuMonthJi(month, day);
  const traditionalMonthIdx = ((monthJi - 2) + 12) % 12;
  const monthGan = (monthGanBase + traditionalMonthIdx) % 10;
  return { gan: monthGan, ji: monthJi };
}

function getDayPillar(year, month, day) {
  const baseDate = new Date(1900, 0, 1);
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((targetDate - baseDate) / 86400000);
  return { gan: ((diffDays + 1) % 10 + 10) % 10, ji: ((diffDays + 11) % 12 + 12) % 12 };
}

function getHourPillar(dayGan, hour) {
  if (hour < 0) return null;
  return { gan: ((dayGan % 5) * 2 + hour) % 10, ji: hour };
}

const fmt = (p) => 천간[p.gan] + 지지[p.ji];
let pass = 0, fail = 0;

function test(label, actual, expected) {
  const ok = actual === expected;
  console.log(`  ${ok?'✅':'❌'} ${label}: ${actual} ${ok?'':'→ 정답: '+expected}`);
  ok ? pass++ : fail++;
}

console.log('═══════════════════════════════════════════════════');
console.log('  Step 1 검증: 입춘/절기 경계 반영');
console.log('═══════════════════════════════════════════════════\n');

// 1. 기본 테스트 케이스: 1994-10-11
console.log('▸ 기본 테스트: 1994-10-11 14:07 남자');
let yp = getYearPillar(1994, 10, 11);
let mp = getMonthPillar(1994, 10, 11);
let dp = getDayPillar(1994, 10, 11);
let hp = getHourPillar(dp.gan, 7);
test('년주', fmt(yp), '甲戌');
test('월주', fmt(mp), '甲戌');
test('일주', fmt(dp), '庚午');
test('시주', fmt(hp), '癸未');

// 2. 입춘 경계 테스트
console.log('\n▸ 입춘 경계 테스트:');
test('1995-02-03 (입춘 전) 년주', fmt(getYearPillar(1995, 2, 3)), '甲戌');
test('1995-02-04 (입춘 당일) 년주', fmt(getYearPillar(1995, 2, 4)), '乙亥');
test('1995-02-05 (입춘 후) 년주', fmt(getYearPillar(1995, 2, 5)), '乙亥');
test('1994-01-15 (입춘 전) 년주', fmt(getYearPillar(1994, 1, 15)), '癸酉');
test('2000-02-03 (입춘 전) 년주', fmt(getYearPillar(2000, 2, 3)), '己卯');
test('2000-02-04 (입춘 당일) 년주', fmt(getYearPillar(2000, 2, 4)), '庚辰');

// 3. 절기 경계 테스트 (월주)
console.log('\n▸ 절기 경계 테스트 (월주):');
test('1994-10-07 (한로 전) 월지', 지지[getMonthPillar(1994, 10, 7).ji], '酉');
test('1994-10-08 (한로 당일) 월지', 지지[getMonthPillar(1994, 10, 8).ji], '戌');
test('1994-10-11 (한로 후) 월지', 지지[getMonthPillar(1994, 10, 11).ji], '戌');
test('1994-03-05 (경칩 전) 월지', 지지[getMonthPillar(1994, 3, 5).ji], '寅');
test('1994-03-06 (경칩 당일) 월지', 지지[getMonthPillar(1994, 3, 6).ji], '卯');
test('1994-01-03 (소한 전) 월지', 지지[getMonthPillar(1994, 1, 3).ji], '子');
test('1994-01-06 (소한 당일) 월지', 지지[getMonthPillar(1994, 1, 6).ji], '丑');
test('1994-12-08 (대설 후) 월지', 지지[getMonthPillar(1994, 12, 8).ji], '子');

// 4. 입춘 전 월주 (년도 변경 영향 확인)
console.log('\n▸ 입춘 전 월주 (년간 연동 확인):');
let mp1 = getMonthPillar(1995, 1, 15); // 1995년 1월 → 사주년은 1994 甲년
test('1995-01-15 월주 (사주년=1994 甲)', fmt(mp1), '丁丑');
// 1994 甲년, 丑月: monthGanBase=2(丙), tradIdx=(1-2+12)%12=11, monthGan=(2+11)%10=3=丁 → 丁丑

// 5. sxtwl 교차검증 케이스 재확인
console.log('\n▸ sxtwl 교차검증 재확인:');
test('영탁 1994-10-11 일주', fmt(getDayPillar(1994, 10, 11)), '庚午');

console.log('\n═══════════════════════════════════════════════════');
console.log(`  결과: ${pass}개 통과 / ${fail}개 실패`);
console.log('═══════════════════════════════════════════════════');
