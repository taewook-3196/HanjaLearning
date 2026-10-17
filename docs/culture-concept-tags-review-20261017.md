# 운영 문화·예절 문항 개념 태그 검수 초안 (2026-10-17)

운영 `exam_culture_items`의 **PUBLISHED 문항**을 읽기 전용으로 조회하여 제목과 주제에 따라 제안한 매핑이다. 아래 값은 검수용 초안이며 **운영 DB에 기록하지 않았다.** 기존 `topic` 값은 유지한다.

| 급수 | 문항 ID | 제안 concept_tags | 개념 |
|---|---:|---|---|
| 5 | 3 | `meal-etiquette` | 식사 예절 |
| 5 | 4 | `library-etiquette` | 도서관 예절 |
| 5 | 15 | `filial` | 효도 |
| PRE4 | 5 | `telephone-etiquette` | 전화 예절 |
| PRE4 | 6 | `visiting-etiquette` | 방문 예절 |
| PRE4 | 13 | `sangwon` | 상원 |
| PRE4 | 14 | `filial` | 효 |
| PRE4 | 22 | `sangwon, chuseok` | 상원과 추석 |
| PRE4 | 41 | `filial` | 효행 |
| PRE4 | 42 | `elders` | 경로 |
| PRE4 | 43 | `elders` | 장유유서 |
| PRE4 | 44 | `library-etiquette` | 도서관 예절 |
| PRE4 | 45 | `dano` | 단오 |
| PRE4 | 46 | `chuseok` | 추석 |
| 4 | 7 | `public-transport-courtesy` | 대중교통 배려 |
| 4 | 8 | `queue-etiquette` | 줄서기 |
| 4 | 16 | `chuseok` | 추석 |
| 4 | 19 | `filial` | 효 |
| PRE3 | 9 | `appointment-etiquette` | 약속 |
| PRE3 | 10 | `online-etiquette` | 온라인 예절 |
| PRE3 | 17 | `elders` | 경로 |
| PRE3 | 20 | `guest-etiquette` | 손님 공경 |
| 3 | 11 | `shared-property-etiquette` | 공용 물품 |
| 3 | 12 | `discussion-etiquette` | 토론 |
| 3 | 18 | `family-rites` | 관혼상제 |
| 3 | 21 | `community-cooperation` | 공동체 협력 |

## 적용 전 확인
- 실제 정답·선택지·해설과 대조해 개념 태그가 질문 전체를 포괄하는지 편집자 검수 필요.
- 서로 다른 급수 간 같은 개념 키를 공유해도 출제기는 현재 **한 시험 내에서만** 중복을 막는다.
- 이 매핑은 `concept_tags` 컬럼이 추가되기 전에는 저장하거나 활용할 수 없다. 운영 변경은 별도 승인과 백업 이후에만 진행한다.
- PRE4 임시 ID 기반 fallback은 모든 문항에 검수된 태그가 저장되고 실제 운영 검증을 마치기 전까지 유지한다.
