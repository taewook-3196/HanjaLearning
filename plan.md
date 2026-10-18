# 아빠한자 (HanjaLearning) — 개발 현황·운영 인수인계 계획서

> **최종 확인일: 2026-10-18 (KST)**  
> **정본:** GitHub `main`의 이 파일. 다른 채팅/LLM은 반드시 이 문서와 **현재 GitHub·Vercel·Supabase 실상**을 대조한 뒤 작업할 것.  
> **중요:** 이 문서는 이력 및 운영 맥락의 스냅샷이다. '완료'는 해당 PR 병합/CI 통과 등으로 확인된 범위만 뜻하며 실제 모바일·운영 기능 검증과 다르다.

## 0. 다음 작업자가 가장 먼저 할 일
1. `taewook-3196/HanjaLearning`의 `main`, 열린 PR, 최근 CI 및 배포 커밋 확인. 이 문서가 오래되었으면 최신 상태를 먼저 갱신한다.
2. Vercel `hanja-learning` production이 어떤 Git SHA를 서비스하는지 확인. 새 배포를 임의로 반복하지 않는다.
3. Supabase 프로젝트 **HanjaLearning** (`ehaibfemacjsqzsidlye`)의 실제 스키마/조회 함수/공개 데이터 상태를 **읽기 전용**으로 점검한다. StockPortfolio DB와 혼동 금지.
4. 아래 **진행 중 작업**을 우선 처리. 변경은 별도 브랜치→PR→CI→병합으로 관리하고, **완료 직후 이 파일의 상태·증거·다음 작업·변경 이력 갱신**.
5. 실제 사용자 계정·기기 테스트가 필요한 항목은 코드/CI 검증과 구분하여 '실기기 검증 대기'로 둔다.

## 1. 서비스 및 접근 지점
| 구분 | 식별자/주소 | 비고 |
|---|---|---|
| 앱 | 아빠한자 / HanjaLearning | 광고 없는 대한검정회 급수 학습·모의시험 웹/PWA |
| GitHub | https://github.com/taewook-3196/HanjaLearning | 기본 브랜치 `main` |
| 운영 URL | https://hanja-learning.vercel.app | Vercel Git 연동 |
| Vercel 프로젝트 | `hanja-learning` (계정 `taewook-3196`) | 운영 배포 대상 |
| Vercel 관리 | https://vercel.com/taewook-3196/hanja-learning | 프로젝트 설정/배포/로그 |
| Supabase 프로젝트 | `HanjaLearning` / `ehaibfemacjsqzsidlye` | 서울 리전 ap-northeast-2 |
| Supabase 대시보드 | https://supabase.com/dashboard/project/ehaibfemacjsqzsidlye | 실제 권한 확인 필요 |
| 별도 DB — 접근 주의 | `StockPortfolio` / `gtwlifmjdfjvkiujzypd` | **이 앱의 DB 아님** |
| 시험 기준 | 대한검정회 | 공식 급수·배정한자·문항 유형 교차검증 필수 |

**기술 스택:** Next.js 16(App Router), React 19, TypeScript, Tailwind CSS 4, `@supabase/ssr`, `@supabase/supabase-js`, `hanzi-writer`; npm. `package.json`이 실제 버전·명령의 정본이다. 대상 기기 iPhone/iPad Safari, Android 폰/태블릿. 인증·DB는 Supabase, 배포는 Vercel.

**환경변수(이름만 기록):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`를 `src/lib/supabase/server.ts`에서 사용. 나머지 변수는 실제 Vercel 프로젝트 설정·코드에서 확인. **실제 키·토큰·비밀번호·세션·개인정보는 plan.md/커밋/로그에 절대 기록하지 않는다.** 공개 키와 관리자/service-role 키를 혼동하지 말고 관리자 키는 브라우저로 전달 금지. GitHub/Vercel/Supabase 접근 권한은 사용자 계정의 커넥터/OAuth로 부여하며 토큰을 채팅에 붙여넣지 않는다.

## 2. 제품 범위와 운영 원칙
- 대한검정회 8급~3급 학습, 오늘 학습(보통 5~8자), 복습/오답노트, 한자 도감(음순·획수·랜덤), 획순 쓰기, 모의시험, 친구·채팅·알림, 스티커·보상, 개인 별명/아바타·사진, 설정·회원관리.
- 급수/문제은행/훈음/사자성어의 **검증되지 않은 초안은 비공개(DRAFT)**. 기존 공개 문제를 무작정 삭제·교체하지 않는다. 원본 기출 저작권·사용권 확인 없이 그대로 복제/배포하지 않는다.
- Supabase 운영 DB DDL/DML은 먼저 읽기 전용 조사·변경 영향 분석·승인 범위 확인 후 실행. 백업/롤백 계획 필요. 사용자별 데이터 격리와 RLS 유지.
- 비용 최소화: Vercel **수동 배포는 약 30분 간격 이상**, 중요 변경 또는 변경 누적 시에만; Git 연동 자동 배포 상태도 확인. GitHub Actions/빌드 사용량 관리. 무료 범위 우선, 유료 기능은 사전 확인.
- 작업 진행 시 사용자에게 반복 확인을 요구하지 않고 가능한 코드 수정·검증·PR까지 수행. 단, 데이터 공개/삭제·운영 변경·비용 발생 등 위험 변경은 별도 검토. '계속 진행하자'는 일반 개발 작업의 승인으로 취급해 왔다.
- 앱 UI는 iOS/Android 모두에서 작은 화면·접근성·스크롤·하단 네비게이션 가림 문제 검증.
- **완료 기준:** 코드 변경 + 자동 테스트/CI + PR 병합 + 필요한 경우 Vercel READY/운영 검증. 각 단계를 별도로 표시.

## 3. 최근 완료 내역 — 검증된 기록
| PR | 작업 | 확인 |
|---|---|---|
| [#630](https://github.com/taewook-3196/HanjaLearning/pull/630) | 친구 목록 대표 스티커 7종 한글 이름, 유효성 기준 통일 | 2026-10-18 squash 병합 `b82c53372583a2ffe7583000591e158947a7c157`, CI 3개 성공 |
| [#629](https://github.com/taewook-3196/HanjaLearning/pull/629) | 채팅 백그라운드 메시지 자동 읽음 처리 제한, 복귀 시 재조회 | squash `327af4f951a769f992f0e2bff021ef1dbdab5957`, CI 성공; **실기기 미검증** |
| [#628](https://github.com/taewook-3196/HanjaLearning/pull/628) | 실시간 메시지 읽음 처리 후 새로고침 | squash `4acb4d616fed9c1b398856064e2d10147ac44795`, CI 성공 |
| [#627](https://github.com/taewook-3196/HanjaLearning/pull/627) | 친구 화면 재진입/가시성 복귀 시 목록·안읽음 갱신 | squash `603d4ccb249a971047fbaf2cf7a253b4b413952b`, CI 성공 |
| [#626](https://github.com/taewook-3196/HanjaLearning/pull/626) | 대표 스티커 저장 후 홈 화면 갱신 | squash `eb85a875fb575e56bb7b3ea4485f1045d7358f05`, CI 성공 |
| [#625](https://github.com/taewook-3196/HanjaLearning/pull/625) | 친구 카드 대표 스티커 유효성/중복 처리 | squash `fc30072f4e64fa1a09ba1608cfd5f94835a1970a` |
| [#624](https://github.com/taewook-3196/HanjaLearning/pull/624) | 홈 대표 스티커 최대 3개 정규화 | squash `073576ea19b21fe2c5ecbbdb6b98965bc091e371` |
| [#623](https://github.com/taewook-3196/HanjaLearning/pull/623) | 대표 스티커 최대 3개 선택/재탭 해제 | squash `9c756f8f75b7ff68cf24291ee7619156976dfc14` |
| [#622](https://github.com/taewook-3196/HanjaLearning/pull/622) | 문화·예절 검토 초안 중복 지문/보기 검증 강화 | squash `83cd80fc7397609ce72a4998d7acc238af067f61` |

**배포 검증:** 2026-10-18 Vercel에서 PR #629의 `327af4f` production 배포 READY 확인. **#630의 production 반영 여부는 별도 확인 필요**(Git 연동 자동 배포 가능). #629까지 배포 READY와 실제 사용자 간 채팅 테스트는 별개.

**기존 프로젝트 주요 진척(과거 대화 기반, 현재 코드/운영 재확인 필요):**
- 대한검정회 급수·오늘학습·복습·도감·쓰기·모의시험 기반 구축; 문화·예절 유형·오답/선택답/문항 스냅샷 등 보강.
- 친구/메시지, 알림 숫자, 대표 스티커, 닉네임·아바타, XP/보상 시스템 구축.
- 103~112회 사자성어 검토: 61개 통합 및 일부 예외 교차검증 기록. 공식 배정한자표와의 최종 대조는 별도 확인.
- PR #432: 준4급 문화·예절 문제 생성 이력. 8/7/6급 모의시험 화면 및 문제 부족 신고 이력.
- 안드로이드 가입/로그인 오류 개선 이력, iOS/일부 Android TTS 품질 이슈는 별도 검증 필요.

## 4. 현재 진행 중: 모의시험 문제은행·그림 문제 부족 경고
### 4.1 확인한 소스
- `src/app/exam/page.tsx`: `exam_grades`, `exam_specs`, `list_grade_hanja_core`, `list_grade_exam_hanja_support`, `list_grade_exam_words_v2` 등으로 데이터를 조회; `examReadinessSummary`, `fieldExamReadinessIssues`, `examRotationShortages`로 부족 여부 확인. 부족하면 '부족한 유형 x/y' 표시; 회전 부족은 별도 경고.
- `src/lib/exam-blueprints.ts`: **8급 25문항(그림 3), 7급 25문항(그림 1), 6급 50문항**. 다른 급수도 50문항 설계. 과거 '모든 급수 50문항'이라는 설명보다 **현재 코드 기준이 우선**.
- `src/lib/exam-generator.ts`: 그림은 해당 급수 한자, 유효한 `/exam-images/` 경로·설명, **서로 다른 유효 오답 3개** 등 조건이 충족되어야 준비 수량에 반영. `recentQuestionKeys`/sessionStorage를 통한 최근 그림 문제 순환.
- `scripts/test-pictorial-generation.ts`: 8급 그림 9개로 3회 × 3문항 회전, 보기 중복/오답/정답/이미지 접근성 검증. 테스트 픽스처는 운영 DB 실측을 대신하지 않음.
- `scripts/check-grade8-picture-seed.ts`, `supabase/migrations/20261015075000_grade8_picture_bank_draft.sql`: 추가 그림 6개가 **DRAFT**로 유지되는 계약 테스트. 검증 없이 공개 금지.
- `scripts/test-exam-blueprints.ts`, `scripts/test-exam-generator.ts`, `scripts/test-exam-rotation-readiness.ts`, `scripts/check-exam-image-assets.ts`, `scripts/test-exam-culture.ts`: 회귀 검사.
- `package.json`: `npm run test:exam`, `npm run check:exam-images`, `npm run check:grade8-picture-seed`, `npm run test:culture-review`, `npm run lint`, `npm run build`.

### 4.2 2026-10-18 운영 DB 읽기 전용 점검
- Supabase HanjaLearning 프로젝트 **ACTIVE_HEALTHY** 확인.
- `hanja_image_items` ↔ `grade_hanja` ↔ `exam_grades` (`exam_providers.code='DAEHAN'`) 조인: **8·7·6급 각각 PUBLISHED 그림 연결 9개**. 동일 이미지가 급수 간 중복 연결될 수 있음.
- `asset_path LIKE '/exam-images/%'`, 비어 있지 않은 `alt_text`, 한자 `content_status='PUBLISHED'` 조건을 포함한 조회에서도 급수별 이미지 9개.
- 한편 같은 쿼리에서 `hanja.content_status='PUBLISHED'` 및 `primary_meaning/primary_reading`가 모두 채워진 한자 수는 **각 급수 0개**로 나옴(급수별 총 연결 한자 8급 30, 7급 50, 6급 70). 이는 **현재 SQL 조건과 실제 `list_grade_hanja_core` 반환 데이터의 차이**를 확인해야 한다는 뜻이며, 앱이 반드시 0개를 받는다는 증거는 아님.
- **아직 미확인:** `list_grade_exam_hanja_support`가 실제 반환하는 이미지 수, `list_grade_hanja_core`의 데이터/상태 필터, `examReadinessSummary` 계산 결과, 운영 UI 오류 재현. 원인 확정/수정 전.

### 4.3 다음 구체적 순서 (P0)
1. DB의 `pg_get_functiondef` 또는 안전한 읽기 전용 방법으로 `list_grade_hanja_core`, `list_grade_exam_hanja_support` 함수 정의·보안·공개 필터 확인. **SECURITY DEFINER/RLS 임의 변경 금지.**
2. 실제 대한검정회 8·7·6급 grade ID별 함수 결과의 한자/그림 수량을 비교. 인증 의존 함수라면 서비스 계정 권한으로 무리하게 호출하지 말고 SQL 정의와 테스트 픽스처를 활용.
3. `hanja`의 `content_status`, 뜻/음 값 분포를 집계해 '유효 한자 0'의 원인을 찾고, **데이터 품질 문제인지 SQL 집계 조건 문제인지** 구분.
4. 실제 readiness 부족 유형과 회전 부족 유형을 별도 표로 기록. 회전 경고가 '시험 불가'와 혼동되지 않도록 UI 문구 검토.
5. 원인별 최소 수정 + 회귀 테스트. 검증 안 된 DRAFT의 PUBLISHED 승격 금지. PR→CI→병합→운영 확인.

### 4.4 2026-10-18 후속 점검 결과 (읽기 전용)
- **원인 정정:** 앞서 `hanja.primary_meaning`/`hanja.primary_reading`를 기준으로 '유효 한자 0개'를 집계한 것은 앱의 실제 데이터 모델과 달랐음. `list_grade_hanja_core`는 `hanja_readings`의 `is_primary=true` 행에서 뜻·음을 조회하므로 해당 0개는 데이터 누락의 증거가 아님.
- 운영 함수 정의 확인: `list_grade_hanja_core(bigint)`는 SECURITY INVOKER(일반 함수), `list_grade_exam_hanja_support(bigint)`는 SECURITY DEFINER이며 이미지 `asset_license in ('APP_ORIGINAL','CC0')`, `content_status='PUBLISHED'`를 필터링함. 권한/함수 변경 없음.
- 실제 운영 함수 호출 결과: 8급(id 1) **한자 30/이미지 9**, 7급(id 2) **한자 50/이미지 9**, 6급(id 3) **한자 70/이미지 9**.
- **남은 조사:** 출제 준비 수량 계산(오답 3개·유효 뜻음·이미지 검증)과 실사용 UI 경고 재현, 이미지 회전 경고 여부. 기본 함수 반환 수량만으로 모든 출제 유형 충족을 보장하지 않음.

## 5. 나머지 백로그 (우선순위는 운영 이슈에 따라 조정)
| 우선 | 항목 | 상태 / 완료 조건 |
|---|---|---|
| P0 | 8/7/6급 그림 문제·모의시험 부족/급수 혼입·50/25문항 출제 규격 점검 | 진행 중. 공식 급수 규격과 앱 구현을 일치시키고 실제 데이터 기반 재현/테스트 |
| P0 | 문제은행 유형별 배분, 중복 최소화, 보기 난이도(유사 글자·동음이의) | 부분 구현, 전 급수 품질/반복 검증 필요 |
| P1 | iOS/Android 친구 채팅 알림 읽음/복귀 | PR #627~629 코드 완료, **실기기 테스트 보류(사용자가 추후 확인)** |
| P1 | 대표 스티커 3개 선택/해제·홈 닉네임 옆·친구 카드 표시 | PR #623~630 코드 완료, 실기기/UI 확인 필요 |
| P1 | 상위 급수 문화·예절 초안 10개 | 검토 대기/비공개 유지, 출처·급수·정답 검증 후 별도 승인 |
| P1 | 5급 특수음 문항 부족 | 이전 기록: 공개 5개/필요 6개, **현재 DB 재확인** |
| P1 | 획순 없는 한자 흐린 글씨 따라쓰기/다음 글자 정상 복구 | 과거 오류, 기기별 회귀 확인 |
| P1 | 모의시험 지문 누락·그림 부족·8급에 7급 문제 혼입 | 과거 신고, 재현 및 테스트 |
| P2 | TTS 기기별 한국어 음성 목록·기본 자동 선택 | iOS 남성 음성/일부 Android 무음 이슈 |
| P2 | 학습 순서(획수/음순/랜덤)·오늘학습 반복/새 학습·XP 지급 | 기능 이력 있음, 전체 회귀 검증 |
| P2 | 친구 채팅 읽음 숫자·문의 접수/삭제·알림 UX | 부분 개선 이력, 운영 확인 |
| P2 | 프로필 사진/캐릭터·닉네임 변경 시 친구관계 유지 | 과거 요구, 실제 상태 재검증 |
| P2 | 전체 보안·성능·모바일 스크롤·무료 한도 점검 | 출시 전 종합 검증 |

## 6. 운영 검증·릴리스 체크리스트
- `main`과 열린 PR/충돌 확인 → 변경 범위 최소화.
- `npm run test:exam`, `npm run lint`, `npm run build` 중 관련 검사 실행, GitHub CI 결과 기록.
- DB 변경 시 적용 전 백업/롤백·마이그레이션/권한/RLS/기존 사용자 영향 확인; 민감 정보 비출력.
- Vercel 배포가 READY인지, **production Git SHA**가 병합 SHA와 같은지 확인. READY는 실제 앱 기능 검증을 보장하지 않는다.
- 모바일 테스트: iPhone Safari, iPad, Android Chrome; 로그인/회원관리, 오늘학습/복습, 급수별 모의시험, 그림/오답/선택답, 스티커 3개, 친구 메시지 읽음 숫자, 로그아웃·하단 메뉴.
- 비용/한도: 불필요한 수동 Vercel 재배포·GitHub Actions 실행 자제.

## 7. 이 파일 유지·갱신 규칙 (필수)
**모든 개발 세션의 시작과 종료에 `plan.md`를 읽고 갱신한다.**
1. 작업 시작 시: 최종 확인일, main SHA, 최근 배포 SHA, 열린 PR, P0/P1 항목 확인. 계획이 달라지면 먼저 해당 항목 수정.
2. 작업 중: 발견한 문제·재현 조건·검증 근거·결정·제약을 해당 항목에 즉시 반영. '추정'과 '검증'을 구분.
3. 완료 시: 해당 항목의 상태를 '코드 완료/CI 완료/병합 완료/배포 완료/실기기 검증 완료'로 구분하고 PR URL, 커밋, 검사, 남은 위험을 기록.
4. 새 요구사항: 백로그에 우선순위·완료 조건·영향 범위 추가; 기존 계획과 충돌하면 변경 이유 기록.
5. **모든 PR에 가능하면 plan.md 업데이트 포함**(특히 기능/DB/설정 변경). 코드와 문서가 다른 PR로 나뉘면 후속 문서 PR을 즉시 생성.
6. 작업 이력은 아래에 최신순으로 추가하고 오래된 항목은 요약하되 중요한 결정·제약·링크는 삭제하지 않는다.
7. 새 LLM/채팅에 인계할 때 이 파일만 읽어도 시작 가능해야 하지만 **현재 외부 시스템 상태는 반드시 다시 조회**한다.

## 8. 변경 기록
| 날짜(KST) | 변경 | 상태/근거 |
|---|---|---|
| 2026-10-18 | PR #631 plan.md 문서 main 병합, CI 3개 성공 | squash \`56870ee6ccab9969823ff12493159cdfda7e5553\` |\n| 2026-10-18 | 운영 조회 함수 정의/호출 재검증: 8/7/6급 한자 30/50/70, 이미지 각 9; '유효 한자 0' 오집계 정정 | DB 읽기 전용, 변경 없음 |\n| 2026-10-18 | 최초 통합 인수인계 문서 작성: 환경·최근 PR·모의시험 운영 DB 점검·백로그·운영 규칙 정리 | 문서 PR 작성 중; 병합 후 링크/커밋 갱신 |
| 2026-10-18 | #630 대표 스티커 한글 이름 보완 | CI 통과, main 병합 `b82c533` |
| 2026-10-18 | 8·7·6급 그림 문제 PUBLISHED 각 9개 운영 DB 읽기 전용 확인 | 출제 함수·유효 한자 집계 차이 원인 조사 필요 |

## 9. 보안·정확성 주의
- 이 문서에는 **비밀 값, 실제 사용자 계정·메일·개인 데이터, service_role 키, DB 암호**를 저장하지 않는다.
- 과거 대화의 '완료' 보고를 무조건 신뢰하지 말고 GitHub 커밋·CI·운영 DB·배포 상태를 재확인.
- 운영 배포·운영 DB 수정·검증되지 않은 문제 공개는 서로 다른 승인/검증 단계다.
- 개발 중 에러를 감추거나 시험 문항을 무리하게 채우지 말고 **검증 실패를 명확히 표시**한다.
