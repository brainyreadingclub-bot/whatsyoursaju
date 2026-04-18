# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SAJU (사주명리 분석)** — 생년월일시 기반 사주명리 분석 웹 서비스. 프론트엔드는 단일 `index.html`(약 6,600줄) 정적 페이지, 백엔드는 Vercel Serverless Functions(`api/*.js`) 하이브리드 구조.

- 배포: Vercel (https://whatsyoursaju.com)
- 프론트 의존성 (모두 CDN): html2canvas, korean-lunar-calendar (v0.3.6), Google Fonts, GA (G-LTFZ1YMVNM)
- 백엔드 의존성 (`node_modules/`): `@anthropic-ai/sdk` — Vercel Functions 런타임 전용
- 사전 예약 폼: Formspree (https://formspree.io/f/mreyjvza)
- 한국어 전용 서비스

## Architecture

프론트엔드: `index.html`에 CSS + HTML + JS 인라인 (빌드 시스템 없음).
백엔드: `api/` 아래 Vercel Serverless Functions (`counsel.js` AI 상담, `og-gunghap.js` 궁합 OG 이미지).

### 파일 구조
```
index.html            ← 메인 서비스 (CSS+HTML+JS 인라인, 약 6,600줄)
about.html            ← 서비스 소개
privacy.html          ← 개인정보 처리방침
terms.html            ← 이용약관
guide/                ← SEO용 가이드 아티클 (sitemap.xml에 등록)
api/
  counsel.js          ← AI 상담 엔드포인트 (Claude Sonnet 4.6)
  og-gunghap.js       ← 궁합 OG 이미지 동적 생성
prompts/
  saju-counsel-v2.md  ← 현역 AI 상담 시스템 프롬프트 (v1은 이전 버전 보존)
og-image.png          ← 메인 OG 이미지 (1200×630)
robots.txt            ← 크롤러 허용 + sitemap 경로
sitemap.xml           ← SEO sitemap (HTTPS URL만 등록)
vercel.json           ← cleanUrls + /share/gunghap rewrite
ads.txt               ← 광고 인증 (AdSense 준비)
CORE/                 ← 기획 문서 (서비스개요, PRD, 기술스택, TODO)
검토문서/              ← 해석 품질 개선 등 검토 자료
test_step1~3.js       ← 계산 로직 검증 (index.html 함수 독립 복사본)
test_review.js        ← 버그 수정 회귀 테스트
test_ai_counsel.js    ← AI 상담 응답 테스트 (+ test_ai_counsel_results.json)
```

### index.html 섹션 (대략 위치 — 변동 잦으므로 참고용)
| 줄 범위 | 내용 |
|---------|------|
| 1–38 | `<head>` (meta, fonts, CDN scripts, GA) |
| 39–2530 | `<style>` CSS (약 2,490줄) |
| 2604–2753 | HTML body (입력 폼, 파티클, 로딩, 결과 영역, 모달, sticky CTA) |
| 2755–2946 | JS 데이터 상수 (천간/지지/오행/절기/합충형파해/공망/신살 조견표) |
| 2947–3214 | JS 핵심 계산 (`getSajuYear`, 4주, 공망, 십신, 12운성, 용신, 합충) |
| 3215–3342 | JS `serializeSajuContext` (AI 상담용 컨텍스트 직렬화) |
| 3343–3860 | JS **관계 분석 엔진** (`analyzeCrossPillars`, `analyzeOhaengComplement`, `analyzeRelationship`, `analyzeRelationshipFull`) |
| 3865–4309 | JS 궁합 미니게임 (`analyzeGunghap`, shareGunghap) |
| 4310–4983 | JS 신살/분석 텍스트 (건강·재물·연애·세운) |
| 4984–5065 | JS `generateTeaserInsight` (충격의 한 줄) |
| 5066–6255 | JS `analyze()` 메인 함수 (2.5초 setTimeout 내 렌더링) |
| 6256–6383 | JS 공유/탭 전환/sticky CTA/프리미엄 모달 |
| 6384–6550 | JS `runTests()` 브라우저 내장 테스트 러너 |

### 결과 화면 3-Tier 구조
```
Tier 1 (항상 펼침): 사주테이블 + 합충형파해 + 오행 + 일간요약 + 공유CTA
  └─ 데스크톱: 2-column (.tier1-grid), 모바일: 1-column
충격의 한 줄: 전환 트리거 (호기심만, CTA 버튼 없음)
Tier 2 (탭 UI): 올해 | 사랑 | 재물 | 성격 | 건강 | 심화
  └─ switchTab() — display:none/block 토글, GA tab_switch 이벤트
궁합 미니게임: 무료 바이럴 엔진 (천간합/오행/지지 기반 점수)
Tier 3: 프리미엄 블러 카드 2개 + 프라이싱 테이블
```

### 수익화 동선 (자연 전환 퍼널)
```
분석결과 → 충격의한줄(호기심) → 탭탐색 → 궁합미니게임(공유) → 블러프리미엄 → 프라이싱
```
- CTA: 소프트 텍스트 링크 ("더 알아보기 →"), 공격적 버튼 없음
- 모바일: sticky CTA bar (프리미엄 신청 + 공유하기)
- 프리미엄 모달 → Formspree 이메일 수집 (향후 Stripe + AI 분석 연동 예정)

### 핵심 계산 함수
| 함수 | 역할 |
|------|------|
| `getSajuYear()` | 입춘(2/4) 기준 사주 연도 결정 |
| `getSajuMonthJi()` | 절기 경계 기준 월지 결정 |
| `getYearPillar/MonthPillar/DayPillar/HourPillar()` | 4주(년월일시) 간지 계산 |
| `getSipsung()` | 십신(십성) 산출 |
| `get12Unsung()` | 12운성 (양간 순행, 음간 역행) |
| `countElements()` | 오행 카운트 (천간+지지+장간 가중치 0.7/0.3/0.1) |
| `getYongsin()` | 용신/희신/기신 판단 (신강/신약 기준) |
| `getJohuYongsin()` | 조후용신 (계절 기반) |
| `getDaeun()` | 대운 계산 (순행/역행, 시작나이) |
| `findHapChung()` | 육합/삼합/상충/삼형/파/해 감지 |
| `detectSinsal()` | 신살 6종 (도화/역마/화개/천을귀인/천덕/월덕) |
| `detectJahyung()` | 자형 감지 (同지지 반복) |
| `getGongmang()` | 공망 계산 (일주 기준 60갑자 순) |
| `lunarToSolar()` | 음력→양력 변환 (korean-lunar-calendar CDN) |
| `getYearFortune()` | 세운 (targetYear 파라미터, 3년 호출) |
| `analyzeGunghap()` | 궁합 점수 계산 (천간합+오행+지지+음양) |
| `shareGunghap()` | 궁합 공유 카드 (html2canvas) |
| `analyzeCrossPillars()` | 두 사람 간 기둥 교차 분석 (관계 분석 엔진) |
| `analyzeOhaengComplement()` | 오행 상호 보완도 |
| `analyzeRelationship()` | 관계 유형별 분석 (연인/가족/동료 등) |
| `analyzeRelationshipFull()` | 관계 분석 풀 렌더링 (총점+등급+천간극+삼합+기신) |
| `serializeSajuContext()` | `_lastAnalysisResult` → AI 상담용 한글/한자 컨텍스트 직렬화 |
| `askAI()` | 클라이언트 → `/api/counsel` POST (AI 상담 호출) |
| `detectSpecialStructures()` | 특수 구조 (식신생재, 관살혼잡 등) |
| `getHealthAnalysis/WealthAnalysis/LoveAnalysis()` | 영역별 풀이 텍스트 |
| `generateTeaserInsight()` | "충격의 한 줄" 전환 트리거 텍스트 생성 |
| `getCheonganHap()` | 천간합 상대 찾기 (궁합용) |
| `용어뱃지()` | 전문용어→순화 뱃지 변환 헬퍼 |
| `runTests()` | 브라우저 내장 테스트 러너 (콘솔 출력) |

### 주요 데이터 구조
- 기둥(Pillar): `{ gan: number, ji: number }` — 천간/지지 인덱스 (0-indexed)
- 절기경계: `[양력월, 평균시작일, 사주월지지인덱스]` 역순 배열
- 장간 가중치: 본기 0.7, 중기 0.3, 여기 0.1
- 공망순: 6개 순(旬) × 2개 공망지지, `startJi = (dayJiIdx - dayGanIdx + 12) % 12`
- 용어순화: 이중 레이어 (전문용어 + 순화표현 뱃지)

### 도메인 특이사항
- 절기일은 평균값 기준 (±1일 오차 가능)
- 변수명/함수명에 한자·한글 혼용 (예: `천간`, `지지장간`, `십이운성순서`)
- 신살 조견표는 연해자평 기준 (유파마다 약간 차이)
- analyze() 내부에 **2.5초 setTimeout** — 로딩 애니메이션 후 계산+렌더링 실행
- `window._lastAnalysisResult`에 마지막 분석 결과 저장 (궁합에서 재사용)

### AI 상담 아키텍처
- `/api/counsel.js`: Vercel Serverless Function (Claude Sonnet 4.6)
- 시스템 프롬프트: `prompts/saju-counsel-v2.md` (6단계 해석 프로토콜)
- 클라이언트: `askAI()` 함수 → `serializeSajuContext()` → POST `/api/counsel`
- `serializeSajuContext()`: `_lastAnalysisResult` → 한글/한자 텍스트 변환 (궁위 포함)
- `_lastAnalysisResult`: 22개 필드 (기존 8 + 인적정보 3 + 분석 8 + 십신/운성/공망 3)
- 환경변수: `ANTHROPIC_API_KEY` (Vercel 대시보드 설정)
- **주의**: 현재 일일 제한 없음 → Phase A에서 즉시 추가 필요

### 수익 모델
- **현재**: 광고 수익 우선 (AdSense 준비 중)
- **향후**: 구독 모델 (Phase E, 트래픽 달성 후)
- 상세 로드맵: `CORE/TODO.md` (Phase A→B→C→D→E)

## Development

빌드/번들러 없음. 로컬 서버로 직접 개발:

```bash
# 로컬 서버 실행
npx http-server . -p 8080 -c-1
```

## Testing

Node.js CLI 테스트 (83개 테스트, 계산 로직 검증):

```bash
node test_step1.js   # 20개: 입춘/절기 경계, 4주 계산 정확도
node test_step2.js   # 38개: 12운성, 대운, 오행카운트, 용신, 합충
node test_step3.js   # 16개: 십신, 풀이 텍스트, 합충 케이스, 동적 연도
node test_review.js  #  9개: 편재/정재 판별, 재물 분석, null 시주
```

전체 실행:
```bash
node test_step1.js && node test_step2.js && node test_step3.js && node test_review.js
```

**주의:** 테스트 파일은 `index.html`의 계산 함수를 **독립 복사**하여 사용. `index.html` 계산 로직 수정 시 반드시 해당 테스트 파일도 동기화할 것. 반대도 마찬가지.

### AI 상담 테스트 (별도)
```bash
node test_ai_counsel.js   # 실제 /api/counsel 호출 — ANTHROPIC_API_KEY 필요
```
- 결과는 `test_ai_counsel_results.json`에 저장 (응답 품질 회귀 확인용)
- 유료 API 호출이므로 로컬 개발 중 상시 실행 금지

### 계산 파이프라인

입력 검증 → (음력 시 양력변환) → 4주 계산 → 오행 카운트 → 신강/신약 → 용신/조후용신 → 십신·12운성 → 합충형파해 → 신살·공망 → 영역별 풀이 → 세운 3년 → 대운 → 결과 렌더링 → 궁합/공유

## Git 커밋 컨벤션

- 한국어 메시지, 접두사: `Phase N:`, `Fix:`, `UX:`, `Step N:`
- 도메인 용어 그대로 사용 (편재, 천간합, 장간 등)

## 기준 테스트 케이스

검증의 기본 기준: **1994-10-11 14:07 남자 (미시, hour value=7)**
- 년주: 甲戌, 월주: 甲戌, 일주: 庚午, 시주: 癸未
- 대운: 순행 (乙亥→丙子→丁丑...), 시작나이 9세
- 공망: 戌亥 (甲子순)
- 신살: 화개살(戌), 천을귀인(午)
- 합충형파해: 午未 육합, 甲甲 천간합, 戌戌 자형, 戌未 파
- 음력 검증: 음력 1994-09-07 → 양력 1994-10-11 (동일 사주)
- 세운: 2026(丙午/보통), 2027(丁未/주의), 2028(戊申/주의)
