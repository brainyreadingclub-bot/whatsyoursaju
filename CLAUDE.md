# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SAJU (사주명리 분석)** — 생년월일시 기반 AI 사주명리 분석 웹 서비스. 단일 `index.html` 파일로 구성된 프론트엔드 전용 정적 사이트 (서버 없음).

- 배포: Vercel (https://whatsyoursaju.vercel.app)
- 외부 의존성: html2canvas (CDN), Google Fonts (Noto Serif KR, Cormorant Garamond, Nanum Myeongjo)
- GA: G-LTFZ1YMVNM (gtag.js, 전환 이벤트 5종 + 사전예약 3종)
- 사전 예약 폼: Formspree (https://formspree.io/f/mreyjvza)
- 한국어 전용 서비스

## Architecture

모든 코드가 `index.html` (약 3,200줄)에 인라인으로 포함되어 있음:

### 구조 (순서대로)
1. **HTML/CSS** (1~1050줄) — 입력 폼, 결과 표시 영역, 공유 카드, 로딩/파티클 애니메이션
2. **파티클 생성 스크립트** (~938줄) — 배경 장식 효과
3. **사주 분석 엔진** (~1053~1715줄) — 핵심 계산 로직
4. **UI 로직** (~1719~2713줄) — 폼 초기화, `analyze()`, 공유 기능
5. **사전 예약 모달** (~3160줄~) — 프리미엄 사전 신청 모달, Formspree 연동

### 수익화 동선
- 프리미엄 CTA 버튼 → `openPrelaunchModal()` → 이메일 수집 + 사주 정보 자동 채움
- Formspree로 POST → 운영자 이메일 알림
- 향후: Concierge MVP (카카오페이 결제) → AI 채팅 (Opus 사전분석 + Sonnet 대화)

### 핵심 계산 함수
| 함수 | 역할 |
|------|------|
| `getSajuYear()` | 입춘(2/4) 기준 사주 연도 결정 |
| `getSajuMonthJi()` | 절기 경계 기준 월지 결정 |
| `getYearPillar/MonthPillar/DayPillar/HourPillar()` | 4주(년월일시) 간지 계산 |
| `getSipsung()` | 십신(십성) 산출 |
| `get12Unsung()` | 12운성 (양간 순행, 음간 역행) |
| `countElements()` | 오행 카운트 (천간+지지+장간 가중치 포함) |
| `getYongsin()` | 용신/희신/기신 판단 (신강/신약 기준) |
| `getJohuYongsin()` | 조후용신 (계절 기반) |
| `getDaeun()` | 대운 계산 (순행/역행, 시작나이) |
| `findHapChung()` | 육합/상충 감지 |
| `getCheonganHap()` | 천간합 궁합 (甲己合土 등) |
| `detectSpecialStructures()` | 특수 구조 감지 (식신생재, 관살혼잡 등) |
| `getHealthAnalysis/WealthAnalysis/LoveAnalysis()` | 영역별 풀이 텍스트 생성 |
| `getYearFortune()` | 올해 운세 (동적 연도) |

### 주요 데이터 구조
- 기둥(Pillar): `{ gan: number, ji: number }` — 천간/지지 인덱스
- 절기경계: `[양력월, 평균시작일, 사주월지지인덱스]` 역순 배열
- 장간 가중치: 본기 0.7, 중기 0.3, 여기 0.1

### 도메인 특이사항
- 음력→양력 변환은 **미구현** (`lunarToSolar()` → null 반환, UI에서 경고)
- 절기일은 평균값 기준 (±1일 오차 가능)
- 변수명/함수명에 한자·한글 혼용 (예: `천간`, `지지장간`, `십이운성순서`)

## Development

정적 HTML이므로 빌드/번들러 없음. 브라우저에서 직접 열어 개발:

```bash
# 로컬 서버 실행
npx serve /c/project/whatsyoursaju
# 또는 Python
python -m http.server 8000 --directory /c/project/whatsyoursaju
```

## Testing

Node.js 기반 단계별 검증 테스트 (브라우저 아닌 CLI):

```bash
node test_step1.js   # 입춘/절기 경계, 4주 계산 정확도
node test_step2.js   # 12운성, 대운, 오행카운트, 용신, 합충
node test_step3.js   # 십신, 풀이 텍스트 통합, 합충 케이스
node test_review.js  # 편재/정재 판별, 재물 분석 텍스트 보존, null 시주 처리
```

각 테스트 파일은 `index.html`의 계산 함수를 독립 복제하여 검증. 테스트 결과는 ✅/❌로 콘솔에 출력되며, 마지막에 통과/실패 수 요약.

**주의:** 테스트 파일과 `index.html`의 계산 로직이 별도 복사본이므로, 한쪽 수정 시 다른 쪽도 동기화 필요.

### 계산 파이프라인

분석 흐름: 입력 검증 → 4주(년월일시) 계산 → 오행 카운트 → 신강/신약 판단 → 용신/조후용신 → 십신·12운성 → 합충 감지 → 영역별 풀이 텍스트 생성 → 대운·올해 운세 → 결과 렌더링·공유카드

### 참고 문서

`CORE/` 디렉토리에 서비스 개요, PRD, 기술 스택 및 시스템 구조 문서가 있음. 기획 의도나 요구사항 확인 시 참조.

## Git 커밋 컨벤션

- 한국어 메시지, 접두사 사용: `Fix:`, `docs:`, `Step N:`, `P1-N:` 등
- 도메인 용어 그대로 사용 (편재, 천간합 등)

## 기준 테스트 케이스

검증의 기본 기준: **1994-10-11 14:07 남자**
- 년주: 甲戌, 월주: 甲戌, 일주: 庚午, 시주: 癸未
- 대운: 순행 (乙亥→丙子→丁丑...), 시작나이 9세
