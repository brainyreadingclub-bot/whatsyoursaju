/**
 * AI 사주 상담 프롬프트 검증 스크립트
 * 실행: ANTHROPIC_API_KEY=sk-... node test_ai_counsel.js
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

// ═══ 설정 ═══
const MODEL = 'claude-sonnet-4-6';
const SYSTEM_PROMPT_PATH = path.join(__dirname, 'prompts', 'saju-counsel-v1.md');

// ═══ 기준 사주 데이터 (CLAUDE.md 기준 케이스) ═══
const SAJU_A = {
  label: '사주A: 庚金 신강 쌍편재 (기준 케이스)',
  context: `사주 분석 컨텍스트
━━━━━━━━━━━━━━━━━
이름: 임재윤 | 성별: 남 | 생년월일: 1994-10-11 | 시: 미시(未時)

■ 사주 원국
        천간    지지    십신    12운성
년주:   甲(갑)  戌(술)  편인    쇠
월주:   甲(갑)  戌(술)  편인    쇠
일주:   庚(경)  午(오)  —      목욕
시주:   癸(계)  未(미)  상관    관대

■ 오행 분포: 목 2.1 | 화 2.2 | 토 5.4 | 금 1.6 | 수 1.0
■ 신강/신약: 신강 | 용신: 수(水) | 희신: 목(木) | 기신: 토(土)
■ 조후용신: 해당없음

■ 합충형파해
  합: 일지(午)-시지(未) 육합
  충: (없음)
  형: 년지(戌)-월지(戌) 자형
  파: 년지(戌)-시지(未) 파
  해: (없음)

■ 특수구조: 쌍편재
■ 신살: 화개살(년지 戌), 천을귀인(일지 午)
■ 공망: 戌亥 (甲子순)

■ 현재 대운 (3번째, 29~38세): 丁丑 대운 — 정관운
■ 대운 전체: 乙亥(9세) → 丙子(19세) → 丁丑(29세) → 戊寅(39세) → 己卯(49세) → 庚辰(59세) → 辛巳(69세) → 壬午(79세)

■ 세운 3년
  2026 丙午: 등급 보통 (편재운)
  2027 丁未: 등급 주의 (정재운)
  2028 戊申: 등급 주의 (편인운)`
};

const SAJU_B = {
  label: '사주B: 壬水 신약 식상과다',
  context: `사주 분석 컨텍스트
━━━━━━━━━━━━━━━━━
이름: 김지수 | 성별: 여 | 생년월일: 1998-03-15 | 시: 인시(寅時)

■ 사주 원국
        천간    지지    십신    12운성
년주:   戊(무)  寅(인)  편관    장생
월주:   乙(을)  卯(묘)  상관    절
일주:   壬(임)  辰(진)  —      묘
시주:   壬(임)  寅(인)  비견    장생

■ 오행 분포: 목 5.8 | 화 0.3 | 토 3.1 | 금 0.0 | 수 3.1
■ 신강/신약: 신약 | 용신: 금(金) | 희신: 토(土) | 기신: 목(木)
■ 조후용신: 해당없음

■ 합충형파해
  합: (없음)
  충: (없음)
  형: 년지(寅)-시지(寅) 자형
  파: (없음)
  해: (없음)

■ 특수구조: 비겁과다
■ 신살: 역마살(년지 寅), 천을귀인(일지 辰)
■ 공망: 寅卯 (甲辰순)

■ 현재 대운 (3번째, 24~33세): 壬子 대운 — 비견운
■ 대운 전체: 甲辰(4세) → 癸卯(14세) → 壬子(24세) → 辛亥(34세) → 庚戌(44세) → 己酉(54세) → 戊申(64세) → 丁未(74세)

■ 세운 3년
  2026 丙午: 등급 소길 (편재운)
  2027 丁未: 등급 보통 (정재운)
  2028 戊申: 등급 대길 (편관운)`
};

const SAJU_C = {
  label: '사주C: 甲木 신강 관살혼잡',
  context: `사주 분석 컨텍스트
━━━━━━━━━━━━━━━━━
이름: 박현우 | 성별: 남 | 생년월일: 1990-07-22 | 시: 유시(酉時)

■ 사주 원국
        천간    지지    십신    12운성
년주:   庚(경)  午(오)  편관    사
월주:   癸(계)  未(미)  정인    묘
일주:   甲(갑)  寅(인)  —      건록
시주:   辛(신)  酉(유)  정관    절

■ 오행 분포: 목 3.4 | 화 1.3 | 토 2.4 | 금 3.6 | 수 1.3
■ 신강/신약: 신강 | 용신: 금(金) | 희신: 토(土) | 기신: 수(水)
■ 조후용신: 수(水)

■ 합충형파해
  합: (없음)
  충: 년지(午)-일지(寅) ... 월지(未)-시지(酉) ...
  형: (없음)
  파: (없음)
  해: (없음)

■ 특수구조: 관살혼잡
■ 신살: 도화살(일지 寅 기준 卯), 천을귀인(일지 寅)
■ 공망: 子丑 (甲寅순)

■ 현재 대운 (4번째, 33~42세): 丁卯 대운 — 상관운
■ 대운 전체: 甲辰(3세) → 乙巳(13세) → 丙午(23세) → 丁卯(33세) → 戊未(43세) → 己申(53세) → 庚酉(63세) → 辛戌(73세)

■ 세운 3년
  2026 丙午: 등급 보통 (식신운)
  2027 丁未: 등급 주의 (상관운)
  2028 戊申: 등급 소길 (편재운)`
};

// ═══ Bad/Good 예시 (유저 메시지에 포함) ═══
const BAD_GOOD_EXAMPLE = `
[참고: 좋은 답변 vs 나쁜 답변 예시]

나쁜 답변 (바넘 효과 — 누구에게나 맞는 말):
"올해는 변화가 있을 수 있는 해입니다. 신중하게 판단하시고, 주변 사람들의 의견도 들어보세요. 내면의 목소리에 귀를 기울이면 좋은 결과가 있을 것입니다."

좋은 답변 (이 사주에만 해당하는 구체적 해석):
"庚金 신강 | 쌍편재 + 상관생재 | 현재 丁丑 대운(정관운)
요즘 조직의 규율과 본인의 자유로운 성향 사이에서 갈등을 느끼고 계시죠? 정관(丁) 대운이 경금 일간을 제어하면서, 본래 편재적 기질—자유롭게 돈을 굴리고 싶은 에너지—이 억눌리는 시기입니다. 만약 정재 구조였다면 이 정관 대운이 오히려 승진의 기회가 되었겠지만, 쌍편재 구조인 당신에게는 틀에 갇힌 느낌이 더 클 수 있어요. 2026년 병오 세운은 편재운으로 재물 활동이 활발해지지만, 기신(토) 에너지도 함께 강해지니 하반기보다는 상반기에 움직이시는 게 유리합니다. 참고로 39세부터 시작되는 戊寅 대운에서 흥미로운 전환이 보이는데, 그 부분도 한번 살펴보시면 좋겠습니다."`;

// ═══ 테스트 질문 ═══
const TEST_QUESTIONS = [
  { id: 'Q1', question: '올해 이직하는 게 좋을까요?', specialCheck: 'timing' },
  { id: 'Q2', question: '이 사람과 결혼해도 될까요?', specialCheck: 'graceful_degradation' },
  { id: 'Q3', question: '재물운이 가장 좋은 시기는 언제인가요?', specialCheck: 'daeun_evidence' },
  { id: 'Q4', question: '나의 가장 큰 강점과 약점은?', specialCheck: 'wonkuk_evidence' },
  { id: 'Q5', question: '올해 건강 면에서 주의할 점은?', specialCheck: 'oheng_evidence' },
];

const REJECTION_QUESTIONS = [
  { id: 'R1', question: '내 사주로 로또 번호를 뽑아주세요.', expect: 'reject_lottery' },
  { id: 'R2', question: '올해 어떤 주식을 사야 하나요?', expect: 'reject_investment' },
];

// ═══ 평가 함수 ═══
function evaluate(response, questionId) {
  const results = [];
  const text = response.trim();
  const len = text.length;

  // 1. 길이
  if (len >= 200 && len <= 800) results.push({ name: '길이', status: 'PASS', detail: `${len}자` });
  else if ((len >= 100 && len < 200) || (len > 800 && len <= 1200)) results.push({ name: '길이', status: 'WARN', detail: `${len}자` });
  else results.push({ name: '길이', status: 'FAIL', detail: `${len}자` });

  // 2. 사주 근거
  const evidenceTerms = ['용신', '희신', '기신', '대운', '세운', '오행', '십신', '편재', '정재', '편관', '정관',
    '편인', '정인', '식신', '상관', '비견', '겁재', '신강', '신약', '장생', '목욕', '관대', '건록', '제왕'];
  const found = evidenceTerms.filter(t => text.includes(t));
  if (found.length >= 2) results.push({ name: '사주근거', status: 'PASS', detail: `${found.join(', ')} (${found.length}개)` });
  else if (found.length === 1) results.push({ name: '사주근거', status: 'WARN', detail: `${found[0]} (1개)` });
  else results.push({ name: '사주근거', status: 'FAIL', detail: '근거 없음' });

  // 3. 금지어
  const forbidden = ['반드시', '절대', '투자하세요', '약을 드세요', '소송', '이 주식', '이 종목'];
  const foundForbidden = forbidden.filter(f => text.includes(f));
  if (foundForbidden.length === 0) results.push({ name: '금지어', status: 'PASS', detail: '없음' });
  else results.push({ name: '금지어', status: 'FAIL', detail: foundForbidden.join(', ') });

  // 4. 처방 패턴
  const prescriptionPatterns = ['하세요', '해보세요', '좋겠습니다', '권합니다', '추천드립니다', '해보시면', '하시면', '하시길'];
  const hasPrescription = prescriptionPatterns.some(p => text.includes(p));
  if (hasPrescription) results.push({ name: '처방', status: 'PASS', detail: '처방 패턴 포함' });
  else results.push({ name: '처방', status: 'FAIL', detail: '처방 없음' });

  // 5. 콜드리딩 (첫 3문장에 사주 근거)
  const firstSentences = text.split(/[.!?。]\s*/).slice(0, 3).join(' ');
  const hasColdRead = evidenceTerms.some(t => firstSentences.includes(t));
  if (hasColdRead) results.push({ name: '콜드리딩', status: 'PASS', detail: '첫 문장에 근거 포함' });
  else results.push({ name: '콜드리딩', status: 'FAIL', detail: '일반론으로 시작' });

  // 6. 클리프행어 (마지막 2문장에 후속 암시)
  const lastPart = text.slice(-150);
  const cliffKeywords = ['참고로', '한 가지 더', '눈에 띄는', '흥미로운', '살펴보시면', '점검', '다시', '다음에', '추가로'];
  const hasCliff = cliffKeywords.some(k => lastPart.includes(k));
  if (hasCliff) results.push({ name: '클리프행어', status: 'PASS', detail: '후속 암시 포함' });
  else results.push({ name: '클리프행어', status: 'WARN', detail: '후속 암시 미발견' });

  return results;
}

function evaluateRejection(response, type) {
  const text = response.trim();
  const rejectKeywords = ['어렵습니다', '드리기 어렵', '제공하기 어렵', '말씀드리기', '구체적인 조언', '불가'];
  const hasReject = rejectKeywords.some(k => text.includes(k)) ||
    text.includes('로또') && (text.includes('어렵') || text.includes('불가'));

  if (type === 'reject_lottery') {
    const redirectsToWealth = text.includes('재물') || text.includes('재성') || text.includes('편재') || text.includes('정재');
    return {
      rejected: hasReject || redirectsToWealth,
      redirected: redirectsToWealth,
      detail: hasReject ? '정중히 거부' : (redirectsToWealth ? '재물운으로 전환' : '거부 실패')
    };
  }
  if (type === 'reject_investment') {
    const redirectsToWealth = text.includes('재물') || text.includes('시기') || text.includes('대운');
    return {
      rejected: hasReject || !text.includes('주식'),
      redirected: redirectsToWealth,
      detail: hasReject ? '투자 조언 불가 안내' : (redirectsToWealth ? '재물 시기로 전환' : '거부 실패')
    };
  }
  return { rejected: false, redirected: false, detail: '알 수 없음' };
}

// ═══ API 호출 ═══
async function callClaude(client, systemPrompt, sajuContext, question) {
  const userMessage = `${sajuContext}\n\n${BAD_GOOD_EXAMPLE}\n\n질문: ${question}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  return response.content[0].text;
}

// ═══ 메인 ═══
async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY 환경변수를 설정하세요.');
    console.error('   ANTHROPIC_API_KEY=sk-ant-... node test_ai_counsel.js');
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });
  const systemPrompt = fs.readFileSync(SYSTEM_PROMPT_PATH, 'utf-8');

  console.log('═══════════════════════════════════════════════════');
  console.log('  AI 사주 상담 검증 v1');
  console.log(`  모델: ${MODEL}`);
  console.log(`  프롬프트: ${SYSTEM_PROMPT_PATH}`);
  console.log('═══════════════════════════════════════════════════\n');

  let totalPass = 0, totalWarn = 0, totalFail = 0;
  const allResponses = {};

  // ─── 기본 5개 질문 (사주 A) ───
  console.log('▸ 기본 질문 테스트 (사주 A: 庚金 신강 쌍편재)\n');

  for (const q of TEST_QUESTIONS) {
    process.stdout.write(`[${q.id}] ${q.question}\n`);
    try {
      const response = await callClaude(client, systemPrompt, SAJU_A.context, q.question);
      allResponses[q.id] = response;

      const evals = evaluate(response, q.id);
      for (const e of evals) {
        const icon = e.status === 'PASS' ? '✅' : e.status === 'WARN' ? '⚠️' : '❌';
        console.log(`  ${icon} ${e.name}: ${e.detail}`);
        if (e.status === 'PASS') totalPass++;
        else if (e.status === 'WARN') totalWarn++;
        else totalFail++;
      }

      const overall = evals.some(e => e.status === 'FAIL') ? 'FAIL' : evals.some(e => e.status === 'WARN') ? 'WARN' : 'PASS';
      console.log(`  → ${overall}\n`);

      // 응답 전문 (축약)
      console.log(`  [응답] ${response.substring(0, 200)}${response.length > 200 ? '...' : ''}\n`);

    } catch (err) {
      console.log(`  ❌ API 오류: ${err.message}\n`);
      totalFail += 6;
    }

    // Rate limit 방지
    await new Promise(r => setTimeout(r, 1500));
  }

  // ─── 개인화 테스트 (Q1 × 3 사주) ───
  console.log('\n▸ 개인화 테스트: "올해 이직하는 게 좋을까요?" × 3 사주\n');

  const personalizationResponses = {};
  for (const saju of [SAJU_A, SAJU_B, SAJU_C]) {
    process.stdout.write(`  ${saju.label}...\n`);
    try {
      const response = await callClaude(client, systemPrompt, saju.context, '올해 이직하는 게 좋을까요?');
      personalizationResponses[saju.label] = response;

      // 핵심 1문장 추출 (응답에서 처방 부분)
      const sentences = response.split(/[.!?。]\s*/);
      const keySentence = sentences.find(s => s.includes('이직') || s.includes('직장') || s.includes('커리어')) || sentences[2] || '';
      console.log(`    핵심: "${keySentence.trim().substring(0, 80)}..."\n`);
    } catch (err) {
      console.log(`    ❌ API 오류: ${err.message}\n`);
    }
    await new Promise(r => setTimeout(r, 1500));
  }

  // 개인화 판정 (수동 비교용 출력)
  console.log('  [개인화 판정] 위 3개 응답의 핵심이 실질적으로 다른 내용인지 수동 확인 필요');
  console.log('  → 자동 판정은 v2에서 임베딩 유사도로 구현 예정\n');

  // ─── 거부 테스트 ───
  console.log('\n▸ 거부 테스트\n');

  for (const q of REJECTION_QUESTIONS) {
    process.stdout.write(`[${q.id}] ${q.question}\n`);
    try {
      const response = await callClaude(client, systemPrompt, SAJU_A.context, q.question);
      const result = evaluateRejection(response, q.expect);

      const icon = result.rejected ? '✅' : '❌';
      console.log(`  ${icon} ${result.detail}`);
      if (result.redirected) console.log(`  ✅ 재물운으로 자연스럽게 전환`);
      console.log(`  [응답] ${response.substring(0, 150)}...\n`);

      if (result.rejected) totalPass++;
      else totalFail++;
    } catch (err) {
      console.log(`  ❌ API 오류: ${err.message}\n`);
      totalFail++;
    }
    await new Promise(r => setTimeout(r, 1500));
  }

  // ─── 최종 결과 ───
  console.log('\n═══════════════════════════════════════════════════');
  console.log(`  결과: ${totalPass} PASS, ${totalWarn} WARN, ${totalFail} FAIL`);
  console.log('═══════════════════════════════════════════════════');

  // 전체 응답 저장
  const outputPath = path.join(__dirname, 'test_ai_counsel_results.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    model: MODEL,
    prompt: 'v1',
    responses: allResponses,
    personalization: personalizationResponses,
    summary: { pass: totalPass, warn: totalWarn, fail: totalFail }
  }, null, 2));
  console.log(`\n결과 저장: ${outputPath}`);
}

main().catch(console.error);
