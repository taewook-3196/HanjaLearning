# 8급 그림한자 공개 전 점검 및 롤백 절차

## 확인된 상태 (2026-10-15)
- 운영 DB 공개 그림: 木, 水, 火 (3개)
- 신규 SVG: 日, 月, 人, 門, 土, 子 (6개)
- 신규 6개 ID와 8급 배정 및 경로 중복 0건을 읽기 전용 SQL로 확인
- `supabase/verification/grade8_picture_bank_preflight.sql` 재실행 가능
- 신규 데이터 SQL: `supabase/migrations/20261015075000_grade8_picture_bank_draft.sql`

## 운영 등록 전 확인
1. `hanja_image_items` 기존 행 전체를 별도 백업하고 복구 가능한지 확인한다.
2. SVG 여섯 개를 실제 iOS Safari 및 Android Chrome에서 열어 그림과 한자 대응을 검수한다. 특히 **土(흙에서 새싹)**, **子(어린아이)** 는 뜻의 모호성을 확인한다.
3. 사전 검사 SQL에서 여섯 개 한자와 ID가 일치하고 이미지 경로 충돌이 없는지 확인한다.
4. SQL을 적용할 때 신규 여섯 개는 반드시 **DRAFT** 상태로 등록한다. 신규 등록 후 `asset_license='APP_ORIGINAL'`과 `content_status='DRAFT'`를 확인한다.
5. 8급 사용자 조회 RPC는 `content_status='PUBLISHED'`만 반환하므로 DRAFT가 시험에 노출되지 않는지 검증한다.
6. 검수 통과한 행만 별도 승인으로 PUBLISHED 전환한다. 공개 이후 RPC 반환 이미지 9개와 시험당 3문항, 3회 중복 방지 동작을 실제 기기에서 확인한다.

## 롤백
- 출제 문제가 발견되면 우선 신규 여섯 경로에 해당하는 행의 `content_status`만 `DRAFT`로 되돌린다. 기존 3개 그림은 건드리지 않는다.
- 즉시 재검증: 8급 이미지 RPC에서 신규 여섯 개가 제외되고 기존 세 개는 유지되는지 확인한다.
- 행 삭제나 ID 재사용은 피하고, 백업 및 감사 기록을 남긴다.

**주의:** 이 문서는 운영 DB를 변경하지 않는다. 운영 데이터 등록·공개는 별도 승인과 검증을 거친다.
