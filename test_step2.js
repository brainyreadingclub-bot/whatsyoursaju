// Step 2 검증: 분석 로직 수정 테스트
const 천간 = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const 지지 = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const 천간음양 = ['양','음','양','음','양','음','양','음','양','음'];
const 천간오행 = ['목','목','화','화','토','토','금','금','수','수'];
const 지지오행 = ['수','토','목','목','토','화','화','토','금','금','토','수'];
const 십이운성순서 = ['장생','목욕','관대','건록','제왕','쇠','병','사','묘','절','태','양'];
const 십성 = ['비견','겁재','식신','상관','편재','정재','편관','정관','편인','정인'];
const 오행한자 = { '목':'木', '화':'火', '토':'土', '금':'金', '수':'水' };

// 수정된 장생 값
const 양간장생 = { '甲': 11, '丙': 2, '戊': 2, '庚': 5, '壬': 8 };
const 음간장생 = { '乙': 6, '丁': 9, '己': 9, '辛': 0, '癸': 3 };

const 지지장간 = {
  '子': ['癸'], '丑': ['己','癸','辛'], '寅': ['甲','丙','戊'], '卯': ['乙'],
  '辰': ['戊','乙','癸'], '巳': ['丙','庚','戊'], '午': ['丁','己'], '未': ['己','丁','乙'],
  '申': ['庚','壬','戊'], '酉': ['辛'], '戌': ['戊','辛','丁'], '亥': ['壬','甲']
};

const 육합 = [['子','丑'], ['寅','亥'], ['卯','戌'], ['辰','酉'], ['巳','申'], ['午','未']];
const 상충 = [['子','午'], ['丑','未'], ['寅','申'], ['卯','酉'], ['辰','戌'], ['巳','亥']];

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

// 수정된 12운성 함수
function get12Unsung(dayGanIdx, jiIdx) {
  const isYang = 천간음양[dayGanIdx] === '양';
  let startJi = isYang ? 양간장생[천간[dayGanIdx]] : 음간장생[천간[dayGanIdx]];
  if (startJi === undefined) return '—';
  let diff = isYang ? (jiIdx - startJi + 12) % 12 : (startJi - jiIdx + 12) % 12;
  return 십이운성순서[diff];
}

// 수정된 오행카운트
function countElements(pillars) {
  const count = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };
  pillars.forEach(p => {
    if (p) {
      count[천간오행[p.gan]]++;
      count[지지오행[p.ji]]++;
      const jj = 지지장간[지지[p.ji]];
      if (jj) {
        const weights = [0.7, 0.3, 0.1];
        jj.forEach((g, i) => {
          const gIdx = 천간.indexOf(g);
          count[천간오행[gIdx]] += (weights[i] || 0.1);
        });
      }
    }
  });
  return count;
}

// 수정된 용신
function getYongsin(dayGanIdx, elementCounts) {
  const dayElement = 천간오행[dayGanIdx];
  const 생아 = { '목':'수', '화':'목', '토':'화', '금':'토', '수':'금' };
  const 아생 = { '목':'화', '화':'토', '토':'금', '금':'수', '수':'목' };
  const 극아 = { '목':'금', '화':'수', '토':'목', '금':'화', '수':'토' };
  const 아극 = { '목':'토', '화':'금', '토':'수', '금':'목', '수':'화' };
  const 비겁력 = elementCounts[dayElement] + elementCounts[생아[dayElement]];
  const 설기력 = elementCounts[아생[dayElement]] + elementCounts[아극[dayElement]] + elementCounts[극아[dayElement]];
  let 용신, 희신, 기신;
  if (비겁력 > 설기력) {
    용신 = 아극[dayElement]; 희신 = 아생[dayElement]; 기신 = 생아[dayElement];
  } else {
    용신 = 생아[dayElement]; 희신 = dayElement; 기신 = 극아[dayElement];
  }
  return { 용신, 희신, 기신, 신강여부: 비겁력 > 설기력 ? '신강' : '신약' };
}

// 조후용신
function getJohuYongsin(monthJi) {
  if ([5, 6, 7].includes(monthJi)) return { johu: '수', 설명: '여름생' };
  if ([11, 0, 1].includes(monthJi)) return { johu: '화', 설명: '겨울생' };
  return null;
}

// 수정된 대운
function getDaeun(monthGan, monthJi, yearGan, gender, birthYear, birthMonth, birthDay) {
  const isYangGan = 천간음양[yearGan] === '양';
  const isMale = gender === 'male';
  const forward = (isYangGan && isMale) || (!isYangGan && !isMale);

  let startAge = 3;
  if (birthYear && birthMonth && birthDay) {
    const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
    let targetDate = null;
    if (forward) {
      for (let i = 절기경계.length - 1; i >= 0; i--) {
        const [m, d] = 절기경계[i];
        const jDate = new Date(birthYear, m - 1, d);
        if (jDate > birthDate) { targetDate = jDate; break; }
      }
      if (!targetDate) targetDate = new Date(birthYear + 1, 0, 6);
    } else {
      for (let i = 0; i < 절기경계.length; i++) {
        const [m, d] = 절기경계[i];
        const jDate = new Date(birthYear, m - 1, d);
        if (jDate <= birthDate) { targetDate = jDate; break; }
      }
      if (!targetDate) targetDate = new Date(birthYear - 1, 11, 7);
    }
    const dayDiff = Math.abs(Math.floor((birthDate - targetDate) / 86400000));
    startAge = Math.round(dayDiff / 3);
    if (startAge < 1) startAge = 1;
    if (startAge > 10) startAge = 10;
  }

  const daeuns = [];
  for (let i = 1; i <= 8; i++) {
    const ganIdx = forward ? (monthGan + i) % 10 : (monthGan - i + 100) % 10;
    const jiIdx = forward ? (monthJi + i) % 12 : (monthJi - i + 120) % 12;
    daeuns.push({ gan: ganIdx, ji: jiIdx, age: startAge + (i - 1) * 10 });
  }
  return daeuns;
}

// 합충 감지
function findHapChung(pillars) {
  const result = { 합: [], 충: [] };
  const jiNames = pillars.filter(p => p).map((p, i) => ({
    name: ['년지','월지','일지','시지'][i], ji: 지지[p.ji]
  }));
  for (let a = 0; a < jiNames.length; a++) {
    for (let b = a + 1; b < jiNames.length; b++) {
      const pair = [jiNames[a].ji, jiNames[b].ji];
      for (const [x, y] of 육합) {
        if ((pair[0] === x && pair[1] === y) || (pair[0] === y && pair[1] === x))
          result.합.push(`${jiNames[a].name}(${pair[0]})-${jiNames[b].name}(${pair[1]})`);
      }
      for (const [x, y] of 상충) {
        if ((pair[0] === x && pair[1] === y) || (pair[0] === y && pair[1] === x))
          result.충.push(`${jiNames[a].name}(${pair[0]})-${jiNames[b].name}(${pair[1]})`);
      }
    }
  }
  return result;
}

const fmt = (p) => 천간[p.gan] + 지지[p.ji];
let pass = 0, fail = 0;

function test(label, actual, expected) {
  const ok = actual === expected;
  console.log(`  ${ok?'✅':'❌'} ${label}: ${actual} ${ok?'':'→ 정답: '+expected}`);
  ok ? pass++ : fail++;
}

console.log('═══════════════════════════════════════════════════');
console.log('  Step 2 검증: 분석 로직 수정');
console.log('═══════════════════════════════════════════════════\n');

// ══════ 2-1, 2-2: 12운성 테스트 ══════
console.log('▸ 12운성 양간 테스트:');
test('庚+午 = 목욕', get12Unsung(6, 6), '목욕');
test('甲+亥 = 장생', get12Unsung(0, 11), '장생');
test('甲+寅 = 건록', get12Unsung(0, 2), '건록');
test('丙+寅 = 장생', get12Unsung(2, 2), '장생');
test('丙+巳 = 건록', get12Unsung(2, 5), '건록');
test('壬+申 = 장생', get12Unsung(8, 8), '장생');
test('壬+亥 = 건록', get12Unsung(8, 11), '건록');
test('戊+寅 = 장생', get12Unsung(4, 2), '장생');
test('庚+巳 = 장생', get12Unsung(6, 5), '장생');
test('庚+申 = 건록', get12Unsung(6, 8), '건록');

console.log('\n▸ 12운성 음간 테스트:');
test('乙+午 = 장생', get12Unsung(1, 6), '장생');
test('乙+卯 = 건록', get12Unsung(1, 3), '건록');
test('丁+酉 = 장생', get12Unsung(3, 9), '장생');
test('丁+午 = 건록', get12Unsung(3, 6), '건록');
test('辛+子 = 장생', get12Unsung(7, 0), '장생');
test('辛+酉 = 건록', get12Unsung(7, 9), '건록');
test('癸+卯 = 장생', get12Unsung(9, 3), '장생');
test('癸+子 = 건록', get12Unsung(9, 0), '건록');

// ══════ 2-3, 2-4: 대운 테스트 ══════
console.log('\n▸ 대운 테스트 (1994-10-11 남자):');
// 월주 甲戌, 년간 甲(양), 남자 → 순행
// 甲戌 → 乙亥, 丙子, 丁丑, 戊寅, 己卯, 庚辰, 辛巳, 壬午
const mp = getMonthPillar(1994, 10, 11);
const yp = getYearPillar(1994, 10, 11);
test('월주 확인', fmt(mp), '甲戌');

const daeun = getDaeun(mp.gan, mp.ji, yp.gan, 'male', 1994, 10, 11);
test('대운1', fmt(daeun[0]), '乙亥');
test('대운2', fmt(daeun[1]), '丙子');
test('대운3', fmt(daeun[2]), '丁丑');
test('대운4', fmt(daeun[3]), '戊寅');
test('대운5', fmt(daeun[4]), '己卯');

// 대운 시작나이: 10/11 ~ 11/7(입동) = 27일 ÷ 3 = 9
test('대운 시작나이', daeun[0].age.toString(), '9');

// 역행 테스트: 음간 년, 남자 → 역행
console.log('\n▸ 대운 역행 테스트 (乙년, 남자):');
// 乙년 3월 → 월주는 戊寅(yearGan=1→乙, monthGanBase=((1%5)*2+2)%10=4→戊, ji=2→寅)
const mp2 = getMonthPillar(1995, 3, 15);
const yp2 = getYearPillar(1995, 3, 15);
test('월주 확인', fmt(mp2), '己卯');
// 乙(음), 남자 → 역행: 己卯 → 戊寅, 丁丑, 丙子...
const daeun2 = getDaeun(mp2.gan, mp2.ji, yp2.gan, 'male', 1995, 3, 15);
test('역행 대운1', fmt(daeun2[0]), '戊寅');
test('역행 대운2', fmt(daeun2[1]), '丁丑');
test('역행 대운3', fmt(daeun2[2]), '丙子');

// ══════ 2-5: 오행 카운트 테스트 ══════
console.log('\n▸ 오행 카운트 (1994-10-11):');
const dp = getDayPillar(1994, 10, 11);
const hp = getHourPillar(dp.gan, 7);
const pillars = [yp, mp, dp, hp];
const ec = countElements(pillars);
console.log('  오행:', JSON.stringify(ec));
// 천간: 甲(목) 甲(목) 庚(금) 癸(수) → 목2 금1 수1
// 지지: 戌(토) 戌(토) 午(화) 未(토) → 토2 화1 토1=토3
// 장간: 戌[戊0.7辛0.3丁0.1]×2 + 午[丁0.7己0.3] + 未[己0.7丁0.3乙0.1]
// 戌장간 ×2: 토1.4 금0.6 화0.2
// 午장간: 화0.7 토0.3
// 未장간: 토0.7 화0.3 목0.1
// 합계: 목=2+0.1=2.1, 화=1+0.2+0.7+0.3=2.2, 토=3+1.4+0.3+0.7=5.4, 금=1+0.6=1.6, 수=1
const yi = getYongsin(dp.gan, ec);
test('신강여부', yi.신강여부, '신강');
console.log(`  비겁력(금+토): ${(ec['금']+ec['토']).toFixed(1)}`);
console.log(`  설기력(수+목+화): ${(ec['수']+ec['목']+ec['화']).toFixed(1)}`);

// ══════ 2-6: 조후용신 테스트 ══════
console.log('\n▸ 조후용신 테스트:');
test('戌月(가을) 조후', getJohuYongsin(10), null);
test('午月(여름) 조후', getJohuYongsin(6)?.johu, '수');
test('子月(겨울) 조후', getJohuYongsin(0)?.johu, '화');
test('卯月(봄) 조후', getJohuYongsin(3), null);
test('巳月(여름) 조후', getJohuYongsin(5)?.johu, '수');
test('亥月(겨울) 조후', getJohuYongsin(11)?.johu, '화');

// ══════ 2-7: 합충 테스트 ══════
console.log('\n▸ 합충 테스트 (1994-10-11):');
const hc = findHapChung(pillars);
console.log('  합:', hc.합.length > 0 ? hc.합.join(', ') : '없음');
console.log('  충:', hc.충.length > 0 ? hc.충.join(', ') : '없음');
// 년지戌-월지戌: 자형 (육합/상충 해당 없음)
// 일지午-시지未: 육합 ✅
test('午未 육합 감지', hc.합.some(h => h.includes('午') && h.includes('未')).toString(), 'true');
// 辰戌 상충 없음 (辰이 없으므로)
test('충 개수', hc.충.length.toString(), '0');

console.log('\n═══════════════════════════════════════════════════');
console.log(`  결과: ${pass}개 통과 / ${fail}개 실패`);
console.log('═══════════════════════════════════════════════════');
