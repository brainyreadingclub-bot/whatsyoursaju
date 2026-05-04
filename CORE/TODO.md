# TODO — SAJU 실행 계획 (광고 수익 우선 전략)

> 최종 업데이트: 2026-03-30 (로드맵 전면 재설계 — 구독→광고 우선 전환)
> 참조 문서: 서비스_개요.md, PRD.md, 기술_스택_및_시스템_구조.md

---

## 전략 전환 요약

기존 로드맵(Phase 0.5→1→2→3)은 **구독 결제 중심**이었으나, 현실적 제약을 고려하여 **광고 수익 우선** 전략으로 전환.

- 도메인 등록 2주 미만, 트래픽 0, 수익 0, 1인 개발
- 구독 모델은 카카오 로그인 + PortOne + 사업자 등록 필요 → 최소 2~3개월
- **AdSense로 당장 수익 + 트래픽 성장 → 나중에 구독 추가**

USP: **사주 데이터 기반 AI 대화형 상담** — 경쟁사(신한라이프, FateUp, 포스텔러) 어디에도 없음

---

## 완료 상태

- [x] 무료 분석 서비스 전체 (index.html ~5,400줄, 83개 테스트 통과)
- [x] 궁합 미니게임 + 바이럴 공유 (이미지 카드 + URL)
- [x] 전환 퍼널 UI (블러카드 + 충격의 한 줄)
- [x] Formspree 이메일 수집 (사전 예약 모달)
- [x] 모바일 sticky CTA bar + 반응형 UI
- [x] GA 전환 이벤트 추적
- [x] 도메인 연결 (www.whatsyoursaju.com)
- [x] SEO 기본 (robots.txt, sitemap.xml, JSON-LD, 시맨틱 HTML)
- [x] Google Search Console + Naver Search Advisor 등록
- [x] AI 상담 프롬프트 설계 + 검증 (v2: 31 PASS / 1 FAIL)
- [x] AI 상담 MVP 배포 (/api/counsel.js + UI)
- [x] _lastAnalysisResult 22개 필드 확장
- [x] serializeSajuContext() 직렬화 함수
- [x] 검증 보고서 대응 (XSS, try/catch, 날짜 검증, CDN SRI)
- [x] UI 폴리시 (블러, 간격, 셀렉트 다크모드, 궁합 공유, 음양 원)

---

## Phase A: AdSense 승인 준비 (4/1 ~ 4/20, 3주)

> **목표**: AdSense 승인 요건 충족 + 신청

### AdSense 승인 핵심 요건
- 필수 법적 페이지 4개 (개인정보, 이용약관, 소개, 연락처)
- 15~25개 오리지널 콘텐츠 페이지 (각 800~1500자+)
- HTTPS + 모바일 최적화 + 명확한 네비게이션
- 도메인 최소 3~4주
- "Low Value Content" 거절이 가장 흔함

### A-1. 필수 법적 페이지 (Day 1-2)
- [x] `privacy.html` 개인정보 처리방침
- [x] `terms.html` 이용약관
- [x] `about.html` 서비스 소개 + 연락처
- [x] index.html footer에 법적 링크 추가

### A-2. SEO 콘텐츠 18페이지 (Day 3-20)

URL 구조: `/guide/{slug}.html`

**Wave 1 (Week 1, 8페이지):**

| 파일명 | 제목 | 타입 | 핵심 키워드 |
|--------|------|------|------------|
| saju-basics | 사주팔자란? 10분 만에 이해하는 기초 | A직접 | 사주팔자란 |
| how-to-read-saju | 사주 보는 법: 가장 쉬운 방법 | A직접 | 사주 보는 법 |
| ohaeng-personality | 오행으로 보는 내 성격: 5가지 유형 | A직접 | 오행 성격 |
| free-saju-analysis | 2026 무료 사주풀이: 가입 없이 정밀 분석 | A직접 | 무료 사주 |
| gunghap-guide | 사주 궁합 보는 법: 우리 둘은 잘 맞을까? | A직접 | 사주 궁합 |
| 2026-fortune | 2026년 병오년 운세: 올해 어떤 변화가 올까 | A직접 | 2026 운세 |
| why-bad-luck | 올해 유독 운이 안 좋은 이유 | B발견 | 운이 안 좋은 이유 |
| best-time-to-change-jobs | 이직 시기, 사주로 보는 타이밍 | B발견 | 이직 시기 |

**Wave 2 (Week 2, 6페이지):**

| 파일명 | 제목 | 타입 | 핵심 키워드 |
|--------|------|------|------------|
| ilgan-meaning | 일간으로 보는 나의 본질: 10가지 유형 | A직접 | 일간 성격 |
| daeun-meaning | 대운이란? 내 인생의 10년 주기 | A직접 | 대운 뜻 |
| why-love-not-working | 연애가 안 되는 이유 | B발견 | 연애가 안 되는 이유 |
| how-to-improve-wealth | 재물운 높이는 법 | B발견 | 재물운 높이는 법 |
| born-time-unknown | 태어난 시간 모를 때 사주 보는 법 | A유틸 | 태어난 시간 모를 때 |
| couple-fight-reason | 맨날 싸우는 커플, 궁합의 갈등 원인 | B발견 | 커플 싸움 이유 |

**Wave 3 (Week 3, 4페이지):**

| 파일명 | 제목 | 타입 | 핵심 키워드 |
|--------|------|------|------------|
| anxiety-at-night | 밤마다 불안한 당신에게 | B발견 | 밤에 불안한 이유 |
| starting-business-timing | 창업 시기, 사업 시작하기 좋은 때 | B발견 | 창업 시기 |
| parent-child-compatibility | 부모와 자녀 궁합: 왜 자꾸 부딪힐까 | B발견 | 부모 자녀 궁합 |
| what-is-yongsin | 용신이란? 가장 필요한 기운 찾기 | A직접 | 용신이란 |

콘텐츠 타입: A직접(사주 직접 검색) 8개 / B발견(인생 고민→사주 발견) 8개 / A유틸 2개

### A-3. 기술 준비
- [x] index.html 광고 슬롯 빈 div 배치
- [x] 가격표 → 이메일 대기 리스트 전환
- [x] sitemap.xml 확장 (22+ URL)
- [x] ads.txt 생성
- [x] 공통 header/footer 네비게이션

### A-4. 비용 제어 (긴급)
- [x] `/api/counsel.js`에 일일 3회 제한

### A-5. AdSense 신청
- [x] 도메인 3~4주 경과 확인 후 신청
- [x] ads.txt + AdSense 메타 태그 배치

### Phase A 완료 기준
- [x] 18+ 콘텐츠 페이지 + 법적 3페이지 라이브
- [ ] Google Search Console 15+ 인덱싱 (진행 중)
- [x] AdSense 신청 완료 (승인 대기)
- [x] AI 상담 일일 3회 제한 작동

---

## Phase B: 트래픽 엔진 (4/21 ~ 5/11, 3주)

> **목표**: 일일 50+ 방문자, SEO 롱테일 진입

- [x] AI 상담 응답 공유 카드 (html2canvas)
- [x] 궁합 딥링크 + 동적 OG 메타 (`/api/og-gunghap.js` + `vercel.json`)
- [x] AI 상담 GA 이벤트 (ai_counsel, ai_limit_reached)
- [x] 궁합 바이럴 GA 이벤트 (gunghap_deeplink_land, gunghap_deeplink_view)
- [ ] 네이버 블로그 백링크 2~3개 (수동 마케팅)

### Phase B 완료 기준
- [ ] 일일 50+ 방문자
- [ ] AdSense 승인 완료

---

## Phase C: 광고 수익 + AI 품질 (5/12 ~ 6/1, 3주)

> **목표**: 첫 광고 수익, 일일 100+ 방문자

- [ ] AdSense 광고 배치 (결과 섹션, 궁합 후, SEO 페이지)
- [ ] AI 후속 질문 추천 2~3개
- [ ] AI 프롬프트 v3 (실제 유저 질문 기반)
- [ ] 일일 한 줄 운세 (일주 기반)
- [ ] Core Web Vitals 최적화

### Phase C 완료 기준
- [ ] 첫 AdSense 수익
- [ ] 일일 100+ 방문자

---

## Phase D: 참여 심화 + 수익 확대 (6/2 ~ 6/29, 4주)

> **목표**: 일일 300+, 월 15~30만원 광고 수익

- [ ] AI 멀티턴 대화 (localStorage 기반)
- [ ] 월운 기능 (getMonthFortune 신규)
- [ ] 띠별 운세 SEO 12페이지
- [ ] 이메일 캡처 최적화
- [ ] PWA manifest.json

### Phase D 완료 기준
- [ ] 일일 300+ 방문자
- [ ] 월 15만원+ 광고 수익
- [ ] 이메일 리스트 500+

---

## Phase E: 프리미엄 구독 (7월~, 트래픽 달성 후)

> **착수 조건**: 일일 500+ 방문자 + 월 20만원+ 광고 + 사업자 등록 완료

- [ ] 카카오 로그인 + 계정 시스템
- [ ] PortOne 정기결제 (월 6,900 / 연 39,900)
- [ ] 구독자 AI 무제한 + 프리미엄 궁합 + 그룹 분석
- [ ] Supabase/Vercel KV 인프라
- [ ] PDF 리포트, 분석 이력, 대운 알림

---

## 핵심 리스크

| 리스크 | 대응 |
|--------|------|
| Claude API 비용 폭발 | Phase A에서 일일 3회 제한 즉시 적용 |
| AdSense 승인 거부 | 콘텐츠 추가 + 재신청 |
| 트래픽 성장 부진 | 블로그 백링크 + 커뮤니티 공유 |
| 1인 개발 번아웃 | 각 Phase 2~4주, 주 3~4일 작업 |

---

## 다음 세션 시작 시

**Phase A부터 실행.**
1. `privacy.html` 개인정보 처리방침
2. `/api/counsel.js` 일일 3회 제한
3. `guide/saju-basics.html` 첫 SEO 콘텐츠
