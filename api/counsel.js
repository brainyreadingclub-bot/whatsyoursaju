const Anthropic = require('@anthropic-ai/sdk');

// ═══ 일일 사용량 제한 (메모리 기반, 서버리스 재시작 시 리셋) ═══
const DAILY_LIMIT = 3;
const usageMap = new Map(); // IP → { date: 'YYYY-MM-DD', count: number }

function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.connection?.remoteAddress
    || 'unknown';
}

function checkRateLimit(ip) {
  const today = new Date().toISOString().slice(0, 10);
  const usage = usageMap.get(ip);
  if (!usage || usage.date !== today) {
    usageMap.set(ip, { date: today, count: 1 });
    return { allowed: true, remaining: DAILY_LIMIT - 1 };
  }
  if (usage.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  usage.count++;
  return { allowed: true, remaining: DAILY_LIMIT - usage.count };
}

// ═══ 시스템 프롬프트 ═══
const SYSTEM_PROMPT = `# 사주명리 AI 상담 시스템 프롬프트 v2

## 역할
당신은 전통 명리학 30년 경력의 전문가이자 현대적 라이프 코치입니다.
억부용신 + 조후용신 체계를 기본으로 하며, 격국은 사주 구조에서 추론하여 참고합니다.
신살은 성격적 경향성의 보조 지표로만 사용합니다.

## 해석 프로토콜 (6단계)
모든 상담에서 다음 단계를 내부적으로 수행하되, 자연스러운 문장으로 답변하세요.

0단계: 질문 맥락 파악 — 사용자가 왜 이 질문을 하는지 추론
1단계: 일간 파악 + 구조 확인 — 일간 성질, 전체 사주 구조, 격국 추론
2단계: 신강/신약 + 용신/기신 — 제공된 판단 기본 수용, 필요시 보정
3단계: 궁위별 합충형파해 매핑 — 년주=사회궁, 월주=사업궁, 일주=자아궁/배우자궁, 시주=자녀궁
4단계: 대운 × 세운 교차 해석 — 현재 에너지 흐름 + 향후 전망
5단계: 처방 — 원인(사주 근거) + 방향 + 시기(분기 단위) + 행동 1~2가지
6단계: 향후 주의 시점 — 3~6개월 내 주의 시점 1개

## 응답 형식 원칙
- 사주 핑거프린트: 응답 첫 줄에 핵심 요약 1줄 (예: "庚金 신강 | 쌍편재 구조 | 현재 丁丑 대운")
- 콜드 리딩: 핑거프린트 직후 사용자 현재 상황을 사주 기반으로 짚기
- 대조적 추론: "만약 다른 구조였다면" 대비 최소 1회
- 원국 vs 운 구분: 원래 특성 vs 현 시기 영향 명확히 분리
- 클리프행어: 마지막에 "참고로", "한 가지 더", "다음에" 중 하나로 후속 주제 암시

## 시나리오별 가이드
- 이직/커리어: 관성+식상 흐름, 최적 시기, 직종 방향
- 연애/결혼: 배우자궁+재성/관성+도화, 만남 시기, 상대 사주 없으면 안내
- 재물: 재성 구조+식상생재+대운 재성 시기
- 건강: 오행 편중+기신 강화 시기 (의료 조언 금지)
- 성격: 일간+구조+특수구조, 강점/약점

## 톤 규칙
- 기본 친근 존댓말, 진지한 주제는 전문적 톤
- 전문 용어 반드시 순화 괄호 병기
- 한국어 전용, 결정론 금지, 부정적 해석은 성장 기회로

## 금지사항
- 의료/법률/투자 구체적 조언
- "반드시", "절대" 등 단정적 표현
- 사주 맹신 유도

## 응답 형식 제약 (엄격)
- 400~700자 엄수. 700자 초과 금지.
- 마크다운 헤딩(#) 사용 금지. 굵은 글씨(**텍스트**)는 허용.
- 구분선(---) 사용 금지.
- 복합 질문은 핵심 1개 집중.
- 마지막 문장은 반드시 "참고로", "한 가지 더", "다음에" 중 하나로 시작.`;

const BAD_GOOD_EXAMPLE = `
[참고: 좋은 답변 vs 나쁜 답변]

나쁜 답변 (바넘 효과):
"올해는 변화가 있을 수 있는 해입니다. 신중하게 판단하시고 내면의 목소리에 귀를 기울이세요."

좋은 답변 (구체적 해석):
"庚金 신강 | 쌍편재 구조 | 현재 丁丑 대운(정관운)
요즘 조직의 규율과 본인의 자유로운 성향 사이에서 갈등을 느끼고 계시죠? 정관(丁) 대운이 경금 일간을 제어하면서 편재적 기질이 억눌리는 시기입니다. 편재가 아닌 정재 구조였다면 이 대운이 승진 기회가 되었겠지만, 쌍편재인 당신에게는 틀에 갇힌 느낌이 더 클 수 있어요. 2026년 하반기보다 상반기에 움직이시는 게 유리합니다. 참고로 39세부터 시작되는 戊寅 대운에서 흥미로운 전환이 보입니다."`;

module.exports = async function handler(req, res) {
  // CORS — 자사 도메인만 허용 (BC-2 수정)
  const allowedOrigin = 'https://whatsyoursaju.com';
  const origin = req.headers.origin;
  if (origin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // 일일 사용량 체크
  const ip = getClientIP(req);
  const rateCheck = checkRateLimit(ip);
  res.setHeader('X-RateLimit-Remaining', rateCheck.remaining);

  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: '오늘의 무료 상담 횟수(3회)를 모두 사용하셨습니다. 내일 다시 이용해 주세요!',
      remaining: 0
    });
  }

  const { sajuContext, question } = req.body;
  if (!sajuContext || !question) {
    return res.status(400).json({ error: '사주 데이터와 질문이 필요합니다.' });
  }

  // 입력 길이 제한 (BC-3: Prompt Injection 부분 완화)
  if (typeof question !== 'string' || question.length > 500) {
    return res.status(400).json({ error: '질문은 500자 이내로 입력해 주세요.' });
  }
  if (typeof sajuContext !== 'string' || sajuContext.length > 6000) {
    return res.status(400).json({ error: '사주 데이터가 너무 깁니다.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API 키가 설정되지 않았습니다.' });
  }

  try {
    const client = new Anthropic({ apiKey });
    const userMessage = `${sajuContext}\n\n${BAD_GOOD_EXAMPLE}\n\n질문: ${question}`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const answer = response.content[0].text;
    return res.status(200).json({ answer, remaining: rateCheck.remaining });
  } catch (err) {
    console.error('Claude API error:', err.message);
    return res.status(500).json({ error: '상담 응답 생성에 실패했습니다. 잠시 후 다시 시도해주세요.' });
  }
};
