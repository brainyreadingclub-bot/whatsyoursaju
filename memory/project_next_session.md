# 다음 세션 핸드오프

> 최종 갱신: 2026-03-27

## 현재 진행 상태

### 완료된 것
- 코어 문서 3개 전면 재설계 완료 (서비스_개요, PRD, 기술_스택_및_시스템_구조)
- CORE/TODO.md 실행 계획 문서 생성 (Phase 0.5 ~ Phase 3 상세 태스크)
- 도메인 연결 완료 (whatsyoursaju.com — GoDaddy DNS + Vercel)
- SEO 전면 구현 완료:
  - robots.txt, sitemap.xml 생성
  - JSON-LD 3종 (WebApplication, FAQPage, BreadcrumbList)
  - 시맨틱 HTML (main/section/footer/nav/h1/h2/h3)
  - ARIA 접근성 (radiogroup, tab, dialog)
  - noscript 폴백, meta robots, theme-color
  - 네이버 사이트 소유확인 메타 태그
- Google Search Console 등록 + sitemap 제출
- Naver Search Advisor 등록 + sitemap 제출
- 메모리 시스템 초기화 (memory/ 디렉토리)

### 진행 중인 것
- 없음 (인프라 세팅 완료, Phase 0.5 코드 작업 미시작)

## 다음 할 일 (우선순위 순)

### 1. Phase 0.5: AI 상담 프롬프트 설계 (최우선)
- 명리학 해석 프레임워크 시스템 프롬프트 작성
- 기준 테스트 케이스(1994-10-11 남자)로 품질 검증
- 실제 질문 테스트: "이직해야 할까?", "이 사람과 결혼해도 될까?"
- 검증 기준: "와, 이걸 어떻게 알지?" 반응 유도

### 2. Phase 0.5: 사주 컨텍스트 직렬화
- window._lastAnalysisResult 확장 (hapChung, sinsalList, specialStructures, daeunList 추가)
- AI에 전달할 JSON 형식 확정 (기술_스택 문서 §4 참조)

### 3. Phase 0.5: 베타 테스트 + 가격 검증
- Formspree 이메일 리스트에서 베타 초대 (10~20명)
- 가격 민감도 조사 (1,900 vs 3,900원)

### 4. Phase 1: Vercel Functions + 결제 연동
- /api/ 디렉토리 생성
- PortOne 결제 연동
- AI 상담 엔드포인트 (/api/counsel)

## 블로커 / 사용자 액션 필요

- **사업자 등록**: PortOne 실서비스에는 사업자등록 필요 (테스트 모드는 가능)
- **Anthropic API 키**: AI 상담 구현 시 환경변수로 설정 필요
- **베타 테스터**: Formspree 이메일 리스트에서 10~20명 초대 필요
- **가격 확정**: Phase 0.5 검증 후 A/B 테스트로 확정 (1,900 vs 3,900원)

## 주의사항

- `getYearFortune()`은 연단위 전용 — 월운 캘린더에는 사용 불가, `getMonthFortune()` 신규 개발 필요 (Phase 2)
- 테스트 파일과 index.html 계산 함수는 독립 복사본 — 한쪽 수정 시 동기화 필수
- 현재 블러 카드 내용은 더미(████) — 프리미엄 궁합 콘텐츠는 AI 생성으로 채워야 함
- AI 원가 ~40원/건 (Sonnet 기준) — 건당 마진 97%+

## 참조 문서

- `CORE/TODO.md` — **전체 계획 문서 (Phase 0.5~3 상세 태스크)**
- `CORE/서비스_개요.md` — 비전, 경쟁 포지셔닝, 로드맵
- `CORE/PRD.md` — 사용자 스토리, 유료 상품 정의, 전환 퍼널, 품질 기준
- `CORE/기술_스택_및_시스템_구조.md` — 아키텍처, API 설계, AI 연동, 비용 구조
