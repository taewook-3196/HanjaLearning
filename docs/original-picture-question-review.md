# 자체 제작 그림 문제 후보 (검수 전)

8급: original-sun.svg(日), original-moon.svg(月), original-tree.svg(木), original-fire.svg(火), original-water.svg(水), original-person.svg(人), original-earth.svg(土), original-gate.svg(門), original-mother.svg(母 후보, 파일명 교체 완료).

7급 추가: original-mountain.svg(山), original-mouth.svg(口), original-hand.svg(手).

- SVG는 코드로 새로 그린 단순 도형이며 외부 기출 이미지·삽화 복제물이 아닙니다.
- 그림의 의미가 정답 한자와 충분히 대응하는지 사람의 교육 콘텐츠 검수가 필요합니다. 특히 門·土·口·手는 실제 앱 화면에서 확인하세요.
- 동일 글자 日의 서로 다른 그림은 서로 다른 문항 ID를 갖지만 정답이 같으므로 3회 로테이션의 학습 다양성은 별도 평가해야 합니다.
- 이 PR은 정적 에셋만 추가합니다. 운영 DB hanja_image_items에는 등록하지 않으며 사용자에게 노출되지 않습니다.
- DB 게시 전에 대상 급수, 고유 ID, 정답 연결, 4지선다, 이미지 경로, 접근성 alt, 공개 라이선스를 검증해야 합니다.

## 1차 정적 검수 결과 (2026-10-10)

- **보류: original-earth.svg** — 현재 선과 산 모양이 흙더미보다 산맥/지형으로 읽힐 수 있어 정답 土의 명확성이 부족합니다.
- **보류: original-gate.svg** — 대문의 윤곽은 있으나 중앙 세로선과 대칭 구조가 門 자체의 자형 힌트가 되어 그림의 의미를 묻는 문제인지 자형 맞히기인지 혼재합니다.
- **보류: original-mouth.svg** — 곡선이 웃는 입인지 구분할 수 있지만 얼굴 맥락이 없어 다른 곡선 형태로 읽힐 수 있습니다.
- **보류: original-hand.svg** — 손가락 윤곽이 겹쳐 작은 모바일 화면에서 식별이 어려울 수 있습니다.
- **보류: original-mother.svg** — original-sun.svg와 정답 日 중복으로 연속 회차 다양성이 부족합니다.
- **조건부 후보: original-sun.svg, original-moon.svg, original-tree.svg, original-fire.svg, original-water.svg, original-person.svg, original-mountain.svg** — 정적 SVG 경로와 도형 의미는 검토했으나 실제 기기 렌더링·아동 사용성 검수는 아직 수행하지 않았습니다.

**결론:** 12개 모두 운영 게시 금지 유지. 의미가 불명확한 4개는 도안 수정, 日 중복 1개는 다른 8급 한자로 교체한 뒤 이미지 표시/정답/오답 난이도를 검증해야 합니다.

## 2차 도안 수정

- original-earth.svg: 흙더미 윤곽과 흙 알갱이 추가.
- original-gate.svg: 아치형 대문 형태로 수정하여 門 자형 직접 모사를 줄임.
- original-mouth.svg: 입술·입안 선을 구분하도록 수정.
- original-hand.svg: 손바닥·손가락 윤곽을 정리.
- original-mother.svg: 日 중복을 피하도록 **母(어머니와 아이)** 그림 후보로 내용 변경. 파일명은 original-mother.svg로 정리 완료.

이 수정은 SVG 경로의 정적 검토만 수행했습니다. 실제 기기 렌더링 및 아동 검수는 미완료이며, DB에 등록하지 않습니다.
