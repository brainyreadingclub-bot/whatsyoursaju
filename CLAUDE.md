# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SAJU (사주명리 분석)** — 생년월일시 기반 사주명리 분석 웹 서비스. 단일 `index.html` (~4,850줄)로 구성된 프론트엔드 전용 정적 사이트.

- 배포: Vercel (https://whatsyoursaju.vercel.app)
- 외부 의존성 (모두 CDN): html2canvas, korean-lunar-calendar (v0.3.6), Google Fonts, GA (G-LTFZ1YMVNM)
- 사전 예약 폼: Formspree (https://formspree.io/f/mreyjvza)
- 한국어 전용 서비스

## Architecture

단일 `index.html`에 CSS + HTML + JS 인라인 포함 (빌드 시스템 없음).

### 파일 구조
```
index.html          ← 전체 서비스 (CSS+HTML+JS, ~4,850줄)
og-image.png        ← OG 이미지 (1200×630)
CORE/               ← 기획 문서 (서비스개요, PRD, 기술스택)
검토문서/            ← 해석 품질 개선 등 검토 자료
test_step1~3.js     ← 단계별 검증 테스트 (계산 함수 복사본)
test_review.js      ← 버그 수정 검증
```

### index.html 섹션 (순서대로)
| 줄 범위 | 내용 |
|---------|------|
| 1–33 | `<head>` (meta, fonts, CDN scripts, GA) |
| 34–2031 | `<style>` CSS (~2,000줄) |
| 2032–2170 | HTML body (입력 폼, 로딩, 결과 영역, 모달, sticky CTA) |
| 2171–2355 | JS 데이터 상수 (천간/지지/오행/절기/합충형파해/공망/신살 조견표) |
| 2356–2620 | JS 핵심 계산 (4주, 십신, 12운성, 오행, 용신, 대운, 합충형파해) |
| 2621–2860 | JS 궁합 미니게임 (analyzeGunghap, shareGunghap) |
| 2861–3550 | JS 분석 텍스트 (특수구조, 신살, 건강/재물/연애/운세) |
| 3550–3670 | JS 폼 초기화, 전환 트리거 |
| 3671–4470 | JS analyze() 메인 함수 (2.5초 setTimeout 내 렌더링) |
| 4470–4850 | JS 공유/탭/sticky CTA/프리미엄 모달 |

### 결과 화면 3-Tier 구조
```
Tier 1 (항상 펼침): 사주테이블 + 합충형파해 + 오행 + 일간요약 + 공유CTA
  └─ 데스크톱: 2-column (.tier1-grid), 모바일: 1-column
충격의 한 줄: 전환 트리거 (호기심만, CTA 버튼 없음)
Tier 2 (탭 UI): 올해 | 사랑 | 재물 | 성격 | 건강 | 심화
  └─ switchTab() — display:none/block 토글, GA tab_switch 이벤트
궁합 미니게임: 무료 바이럴 엔진 (천간합/오행/지지 기반 점수)
Tier 3: 프리미엄 블러 카드 3개 + 프라이싱 테이블
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
| `detectSpecialStructures()` | 특수 구조 (식신생재, 관살혼잡 등) |
| `getHealthAnalysis/WealthAnalysis/LoveAnalysis()` | 영역별 풀이 텍스트 |

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

**주의:** 테스트 파일은 `index.html`의 계산 함수를 **독립 복사**하여 사용. 한쪽 수정 시 다른 쪽도 동기화 필요.

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
