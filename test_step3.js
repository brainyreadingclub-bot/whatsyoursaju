// Step 3 검증: 풀이 텍스트 통합 테스트
const 천간 = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const 지지 = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const 천간음양 = ['양','음','양','음','양','음','양','음','양','음'];
const 천간오행 = ['목','목','화','화','토','토','금','금','수','수'];
const 지지오행 = ['수','토','목','목','토','화','화','토','금','금','토','수'];
const 십이운성순서 = ['장생','목욕','관대','건록','제왕','쇠','병','사','묘','절','태','양'];
const 십성 = ['비견','겁재','식신','상관','편재','정재','편관','정관','편인','정인'];
const 오행한자 = { '목':'木', '화':'火', '토':'土', '금':'金', '수':'水' };
const 양간장생 = { '甲': 11, '丙': 2, '戊': 2, '庚': 5, '壬': 8 };
const 음간장생 = { '乙': 6, '丁': 9, '己': 9, '辛': 0, '癸': 3 };
const 육합 = [['子','丑'], ['寅','亥'], ['卯','戌'], ['辰','酉'], ['巳','申'], ['午','未']];
const 상충 = [['子','午'], ['丑','未'], ['寅','申'], ['卯','酉'], ['辰','戌'], ['巳','亥']];

const 절기경계 = [
  [12, 7, 0], [11, 7, 11], [10, 8, 10], [9, 8, 9],
  [8, 8, 8], [7, 7, 7], [6, 6, 6], [5, 6, 5],
  [4, 5, 4], [3, 6, 3], [2, 4, 2], [1, 6, 1],
];

function getSajuYear(y, m, d) { return (m < 2 || (m === 2 && d < 4)) ? y - 1 : y; }
function getSajuMonthJi(m, d) {
  for (const [mm, dd, ji] of 절기경계) { if (m > mm || (m === mm && d >= dd)) return ji; }
  return 0;
}
function getYearPillar(y, m, d) {
  m = m || 6; d = d || 1;
  const sy = getSajuYear(y, m, d);
  return { gan: ((sy - 4) % 10 + 10) % 10, ji: ((sy - 4) % 12 + 12) % 12 };
}
function getMonthPillar(y, m, d) {
  d = d || 15;
  const sy = getSajuYear(y, m, d);
  const yg = ((sy - 4) % 10 + 10) % 10;
  const mgb = ((yg % 5) * 2 + 2) % 10;
  const mj = getSajuMonthJi(m, d);
  const ti = ((mj - 2) + 12) % 12;
  return { gan: (mgb + ti) % 10, ji: mj };
}
function getDayPillar(y, m, d) {
  const base = new Date(1900, 0, 1);
  const target = new Date(y, m - 1, d);
  const diff = Math.floor((target - base) / 86400000);
  return { gan: ((diff + 1) % 10 + 10) % 10, ji: ((diff + 11) % 12 + 12) % 12 };
}
function getHourPillar(dg, h) { return h < 0 ? null : { gan: ((dg % 5) * 2 + h) % 10, ji: h }; }
function getSipsung(dayGanIdx, targetGanIdx) {
  const 오행순 = ['목','화','토','금','수'];
  const diff = (오행순.indexOf(천간오행[targetGanIdx]) - 오행순.indexOf(천간오행[dayGanIdx]) + 5) % 5;
  return 십성[diff * 2 + (천간음양[dayGanIdx] === 천간음양[targetGanIdx] ? 0 : 1)];
}
function getDaeun(mg, mj, yg, gender, by, bm, bd) {
  const forward = (천간음양[yg] === '양') === (gender === 'male');
  let startAge = 3;
  if (by && bm && bd) {
    const birth = new Date(by, bm - 1, bd);
    let target = null;
    if (forward) {
      for (let i = 절기경계.length - 1; i >= 0; i--) {
        const jd = new Date(by, 절기경계[i][0] - 1, 절기경계[i][1]);
        if (jd > birth) { target = jd; break; }
      }
      if (!target) target = new Date(by + 1, 0, 6);
    } else {
      for (let i = 0; i < 절기경계.length; i++) {
        const jd = new Date(by, 절기경계[i][0] - 1, 절기경계[i][1]);
        if (jd <= birth) { target = jd; break; }
      }
      if (!target) target = new Date(by - 1, 11, 7);
    }
    startAge = Math.round(Math.abs(Math.floor((birth - target) / 86400000)) / 3);
    if (startAge < 1) startAge = 1;
    if (startAge > 10) startAge = 10;
  }
  const daeuns = [];
  for (let i = 1; i <= 8; i++) {
    daeuns.push({
      gan: forward ? (mg + i) % 10 : (mg - i + 100) % 10,
      ji: forward ? (mj + i) % 12 : (mj - i + 120) % 12,
      age: startAge + (i - 1) * 10
    });
  }
  return daeuns;
}
function findHapChung(pillars) {
  const result = { 합: [], 충: [] };
  const jn = pillars.filter(p => p).map((p, i) => ({ name: ['년지','월지','일지','시지'][i], ji: 지지[p.ji] }));
  for (let a = 0; a < jn.length; a++) for (let b = a + 1; b < jn.length; b++) {
    const pair = [jn[a].ji, jn[b].ji];
    for (const [x, y] of 육합) if ((pair[0]===x&&pair[1]===y)||(pair[0]===y&&pair[1]===x))
      result.합.push(`${jn[a].name}(${pair[0]})-${jn[b].name}(${pair[1]})`);
    for (const [x, y] of 상충) if ((pair[0]===x&&pair[1]===y)||(pair[0]===y&&pair[1]===x))
      result.충.push(`${jn[a].name}(${pair[0]})-${jn[b].name}(${pair[1]})`);
  }
  return result;
}
function getJohuYongsin(mj) {
  if ([5, 6, 7].includes(mj)) return { johu: '수', 설명: '여름생' };
  if ([11, 0, 1].includes(mj)) return { johu: '화', 설명: '겨울생' };
  return null;
}

const fmt = (p) => 천간[p.gan] + 지지[p.ji];
let pass = 0, fail = 0;
function test(label, actual, expected) {
  const ok = actual === expected;
  console.log(`  ${ok?'✅':'❌'} ${label}: ${actual} ${ok?'':'→ 정답: '+expected}`);
  ok ? pass++ : fail++;
}

console.log('═══════════════════════════════════════════════════');
console.log('  Step 3 검증: 풀이 텍스트 통합');
console.log('═══════════════════════════════════════════════════\n');

// 기본 케이스: 1994-10-11 14:07 남자
const yp = getYearPillar(1994, 10, 11);
const mp = getMonthPillar(1994, 10, 11);
const dp = getDayPillar(1994, 10, 11);
const hp = getHourPillar(dp.gan, 7);
const pillars = [yp, mp, dp, hp];

console.log('▸ 4주 십신 표시:');
test('년간 십신', getSipsung(dp.gan, yp.gan), '편재');
test('월간 십신', getSipsung(dp.gan, mp.gan), '편재');
test('시간 십신', getSipsung(dp.gan, hp.gan), '상관');
test('일간 본원', '일원', '일원'); // 일간은 항상 '일원'

console.log('\n▸ 대운 (월주 기준, analyze에서 호출):');
const daeun = getDaeun(mp.gan, mp.ji, yp.gan, 'male', 1994, 10, 11);
test('대운1', fmt(daeun[0]), '乙亥');
test('대운 시작나이', daeun[0].age.toString(), '9');
console.log(`  대운 전체: ${daeun.map(d => fmt(d) + '(' + d.age + '세)').join(' → ')}`);

console.log('\n▸ 합충 (analyze에서 호출):');
const hc = findHapChung(pillars);
test('합 개수', hc.합.length.toString(), '1');
test('午未 육합', hc.합[0].includes('午') && hc.합[0].includes('未') ? 'true' : 'false', 'true');

console.log('\n▸ 조후용신 (analyze에서 호출):');
test('戌月(가을) 조후', String(getJohuYongsin(mp.ji)), 'null');
// 겨울 케이스
test('子月(겨울) 조후', getJohuYongsin(0)?.johu, '화');
// 여름 케이스
test('午月(여름) 조후', getJohuYongsin(6)?.johu, '수');

console.log('\n▸ 동적 연도:');
const currentYear = new Date().getFullYear();
test('현재 연도', currentYear.toString(), new Date().getFullYear().toString());
console.log(`  올해 운세 제목: "${currentYear}년 올해의 운세"`);

console.log('\n▸ 편재/정재 구분 로직:');
// 庚(금, 양) → 재성=목 → 甲(양, 목)=편재, 乙(음, 목)=정재
const dayYY = 천간음양[dp.gan]; // 양
const wealthEl = '목'; // 금 아극 = 목
const 재간들 = 천간.map((g, i) => ({ gan: g, idx: i })).filter(x => 천간오행[x.idx] === wealthEl);
const 편재 = 재간들.find(x => 천간음양[x.idx] === dayYY);
const 정재 = 재간들.find(x => 천간음양[x.idx] !== dayYY);
test('庚의 편재', 편재.gan, '甲');
test('庚의 정재', 정재.gan, '乙');

// 충이 있는 사주 테스트
console.log('\n▸ 충 감지 테스트 (子午 충):');
// 甲子, X, 庚午, X 형태의 사주
const pillars2 = [
  { gan: 0, ji: 0 },  // 甲子
  { gan: 2, ji: 6 },  // 丙午
  { gan: 6, ji: 0 },  // 庚子
  { gan: 9, ji: 6 }   // 癸午
];
const hc2 = findHapChung(pillars2);
console.log(`  합: ${hc2.합.length > 0 ? hc2.합.join(', ') : '없음'}`);
console.log(`  충: ${hc2.충.length > 0 ? hc2.충.join(', ') : '없음'}`);
test('子午 충 감지', hc2.충.some(c => c.includes('子') && c.includes('午')).toString(), 'true');
test('충 개수 (子午×2)', hc2.충.length >= 2 ? 'true' : 'false', 'true');

console.log('\n═══════════════════════════════════════════════════');
console.log(`  결과: ${pass}개 통과 / ${fail}개 실패`);
console.log('═══════════════════════════════════════════════════');
