# 자전 찾기 자료 출처 대조 — 2차 검수

이 문서는 **출처 대조 기록**이며 운영 DB 게시 승인이나 자동 마이그레이션이 아닙니다.

| 한자 | 부수 | 총획 | 확인 자료 |
|---|---|---:|---|
| 一 | 一 | 1 | https://minkan.co.jp/kanji/ |
| 二 | 二 | 2 | https://dictionary.goo.ne.jp/word/kanji/%E4%BA%8C/ |
| 三 | 一 | 3 | https://minkan.co.jp/kanji/ |
| 十 | 十 | 2 | https://ksbookshelf.com/DW/Nihonshi/NihonshiK01.htm |
| 口 | 口 | 3 | https://ksbookshelf.com/DW/Nihonshi/NihonshiK01.htm |
| 土 | 土 | 3 | https://dictionary.goo.ne.jp/word/kanji/%E5%9C%9F/ |
| 上 | 一 | 3 | https://minkan.co.jp/kanji/ |
| 下 | 一 | 3 | https://ksbookshelf.com/DW/Nihonshi/NihonshiK01.htm |

## 실제 출제 조건

- 현재 6급과 준5급은 부수 문제 0개, 총획수 문제 0개 (운영 DB 2026-10-11 읽기 전용 검사).
- 총획수는 기존 2·3·4획에 1획을 추가하면 4종을 확보할 수 있으나, 한 회차의 고유 문제 수와 오답 품질은 별도로 확인해야 합니다.
- 현재 코드의 부수 문항은 `radical === character`인 글자를 제외합니다. 따라서 자기 자신이 부수인 기본 한자를 등록하는 것만으로 부수 문제가 생기지 않습니다. `上`·`下`처럼 부수와 글자가 다른 한자도 필요합니다.
- **대한검정회 자전 기준 및 실제 시험 문항 형식**과 대조한 뒤에만 게시합니다. 현재 외부 참고 사전 대조만 완료됐습니다.
- 기존 `formation_type`과 사용자 학습 데이터는 변경하지 않습니다.
