# Prompt Engineering & Structured Output — 통합 용어 사전

`PRESTUDY-*.md` 7개 파일의 용어 사전을 항목명 기준으로 통합했다.
원본 항목 323개 → 고유 용어 274개.
한 용어에 설명이 여러 개면 출처마다 서술이 달랐던 것이므로 모두 남겼다.

---

**"Other" Fallback Pattern** — `other` enum 값 + 자유 텍스트 상세 필드로 예외를 안전하게 격리하는 설계

**`calculated_total`** — 개별 품목을 코드로 합산한 값. 인쇄된 합계와 대조하는 데 씀

**`description` (schema)** — 스키마 필드에 붙이는 자연어 설명. 모델을 유도하지만 보장하지는 않음

**`input_schema`** — 도구가 받는 인자를 기술한 JSON Schema

**`messages` array** — 대화 이력을 담는 배열. 배치 요청에도 여러 개 넣을 수 있음

**`tool_choice: {"type":"tool","name":X}`** — 지정 도구 X를 반드시 호출하도록 강제

**`tool_choice: any`** — 등록된 도구 중 반드시 하나 호출. 어느 것인지는 모델이 선택

**`tool_choice: auto`** — 기본값. 도구 호출 여부를 모델이 결정. 텍스트만 답할 수도 있음

**`tool_choice: none`** — 도구를 전혀 호출하지 않음

**`tool_result` block** — 애플리케이션이 도구를 실행한 결과를 모델에게 돌려주는 블록

**`tool_use` block** — 응답에 담겨 오는, 모델의 도구 호출 요청 블록. 인자가 구조화되어 있음

**`tools`** — 요청에 첨부하는 도구 정의 목록 파라미터

**Accumulation / Ingestion Delay** — 누적 지연. 항목이 도착해서 다음 배치에 실릴 때까지 기다리는 시간

**Agent** — 에이전트. 목표를 받아 도구를 써가며 스스로 단계를 진행하는 LLM 시스템

**Agent / Subagent** — 도구를 쓰며 스스로 작업하는 LLM 시스템 / 상위 에이전트가 위임한 하위 인스턴스

**Agent workflow** — 모델이 도구를 호출하고 결과를 받아 다시 추론하는 다단계 작업 흐름

**Agentic Workflow** — 에이전트 워크플로. 여러 단계와 도구 사용이 이어지는 자동화 흐름

**Alert fatigue** — 경고 피로도. 부정확한 알림이 반복되어 전체 알림을 무시하게 되는 현상

**Alert Fatigue** — 알림 피로. 알림이 너무 많아 사용자가 전부 무시하게 되는 현상

**Alert Fatigue (알림 피로)** — 오탐이 많아 사용자가 도구 출력을 통째로 무시하게 되는 현상

**Anchoring** — 하나의 극단적 예시가 기준 척도를 그쪽으로 끌어당기는 편향

**Asynchronous**

- 비동기. 제출과 결과 수신이 분리된 처리  <sub>(PRESTUDY-prompt-43-56.md)</sub>
- 비동기. 요청 즉시 결과가 오지 않고 나중에 조회하는 방식  <sub>(PRESTUDY-prompt-57-70.md)</sub>

**Audit trail** — 감사 추적. 원본과 변경 이력을 남겨 사후 검증을 가능하게 하는 기록

**Auto-fix** — 고신뢰 발견 사항을 사람 개입 없이 자동으로 수정하는 것

**Blind Spot (맹점)** — 생성 시의 잘못된 가정·누락된 조건. 같은 세션에서는 반복해서 놓친다.

**Blocking Workflow** — 결과가 나올 때까지 후속 작업이 멈춰 있는 흐름(예: merge gate)

**Borderline Case** — 판정이 애매한 경계선 사례. 예시 세트에 반드시 포함해야 값어치가 큼

**Business Rule / Logic Constraint** — "end_date는 start_date 이후" 같은 필드 간 논리 규칙. 코드로 별도 검증해야 한다.

**Business-plausibility Check** — 값이 비즈니스적으로 말이 되는지 애플리케이션 코드에서 하는 별도 검증

**Canonical Standard** — 프로젝트 전역의 공식 표준 규칙 (지역 관행과 대비되는 기준점)

**Categorical criteria** — 범주적 기준. 확신도가 아니라 문제 유형(보안·정확성 vs 서식·스타일)으로 정하는 기준

**Categorical Field** — 집계·그룹화가 가능한 범주형 필드. 통계 분석의 전제

**Chain-of-Thought (CoT)** — 답만이 아니라 판단 과정·근거를 함께 다루게 하는 프롬프팅. 예시에 이유를 붙이면 일반화가 좋아진다.

**Changeset**

- 리뷰 대상이 되는 변경 사항 전체 묶음.  <sub>(PRESTUDY-prompt-01-14.md)</sub>
- 한 번에 변경된 파일들의 묶음  <sub>(PRESTUDY-prompt-85-104.md)</sub>

**Checkable Condition** — 검증 가능한 조건. "위험해 보이는" 대신 "매개변수화 없는 SQL 문자열 결합" 같은 판정 가능한 기준

**Chunking** — 긴 입력을 작은 조각으로 나누어 여러 요청으로 처리하는 기법

**Clarity and Specificity** — 명확성과 구체성. 모호한 표현 대신 검증 가능한 조건을 명시하는 원칙

**Clean Context** — 깨끗한 컨텍스트. 부모 이력이 섞이지 않은 새 컨텍스트 창

**Client-side Tool** — 애플리케이션이 직접 실행하고 결과를 되먹여야 하는 도구. 다단계 왕복 필요

**Closed Enum** — 예외를 허용하지 않는 폐쇄형 열거형. 예상 밖 입력에서 강제 맞춤을 유발

**Confidence Level (신뢰도)** — 모델이 그 판단을 얼마나 확신하는지. 심각도와 별개의 축

**Confidence Score / Label** — 결과의 확신 정도를 나타내는 점수·라벨. 보정이 부정확할 수 있어 판정 기준으로 삼기엔 위험하다.

**Confidence threshold** — 신뢰도 임계값. 숫자를 붙여도 여전히 주관적 자기평가

**Confidence-based filtering** — 모델의 주관적 확신도로 보고 여부를 거르는 방식. 구체적 규칙이 없어 효과가 없음

**Confidence-based Routing** — 신뢰도에 따라 자동 처리와 사람 검토로 분기하는 설계

**Consistency check** — 품목 합 = 인쇄된 합계처럼 산술적 일치를 확인하는 검사

**Context Isolation**

- 서브에이전트가 부모의 대화 이력 없이 빈 컨텍스트로 시작하는 성질  <sub>(PRESTUDY-prompt-29-42.md)</sub>
- 컨텍스트 격리. 서브에이전트가 부모와 분리된 자체 컨텍스트에서 시작하는 원칙  <sub>(PRESTUDY-prompt-57-70.md)</sub>

**Context Window**

- 모델이 한 번에 다룰 수 있는 토큰 총량. 예시마다 정책 문서를 반복 삽입하면 낭비된다.  <sub>(PRESTUDY-prompt-01-14.md)</sub>
- 한 요청에서 모델이 다룰 수 있는 입력+출력 토큰 총량의 상한  <sub>(PRESTUDY-prompt-29-42.md)</sub>
- 컨텍스트 창. 모델이 한 번에 볼 수 있는 토큰 총량  <sub>(PRESTUDY-prompt-57-70.md)</sub>

**Context window** — 모델이 한 번에 볼 수 있는 토큰의 최대 길이

**Contract**

- 동작 계약. 함수가 외부에 약속한 동작 명세  <sub>(PRESTUDY-prompt-43-56.md)</sub>
- 파일/모듈 간에 지켜야 할 인터페이스 규격(시그니처, 타입, 의미)  <sub>(PRESTUDY-prompt-85-104.md)</sub>

**Contract (계약)** — 모듈·인터페이스가 서로에게 약속한 입출력 규격과 동작.

**Control flow** — 제어 흐름. 조건문·분기 등 코드가 실제로 실행되는 경로

**Convergence (수렴)** — 여러 리뷰어가 같은 이슈에 같은 분류를 내리는 상태.

**Conversation Transcript** — 대화 기록. 지금까지 오간 메시지 전체. 서브에이전트에 자동 상속되지 않음

**Corrective Retry** — 교정 재시도. 오류 내용을 알려주고 다시 요청하는 복구 방식

**Cross-contamination** — 한 범주의 규칙·예시가 다른 범주에 잘못 적용되는 현상

**Cross-file Integration Pass** — 여러 파일을 함께 놓고 데이터 흐름을 검토해 단일 권고를 내는 단계

**Cross-validation (data)** — 중복 정보를 함께 추출해 서로 대조하는 검증

**custom_id**

- 배치의 각 요청에 붙이는 고유 식별자. 결과를 원래 요청과 짝짓고, 실패 건만 골라 재제출할 때 쓴다.  <sub>(PRESTUDY-prompt-01-14.md)</sub>
- 배치 각 요청에 부여하는 고유 식별자. 결과 매칭의 유일하게 안전한 기준  <sub>(PRESTUDY-prompt-29-42.md)</sub>

**Data Flow**

- 값이 파일과 모듈을 거쳐 흐르는 경로. 파일 단위 검사로는 전체를 볼 수 없다.  <sub>(PRESTUDY-prompt-01-14.md)</sub>
- 값이 함수·파일·모듈을 거쳐 흘러가는 경로  <sub>(PRESTUDY-prompt-29-42.md)</sub>

**Date Parser** — 날짜 파서. `14-Mar-2026` 같은 다양한 표기를 날짜 객체로 변환하는 라이브러리 (예: `dateutil`)

**Decoupling extraction & parsing** — 모델은 원문 추출만, 형식 변환은 결정론적 코드가 담당하도록 역할을 분리하는 설계

**description** — 필드 설명문. 모델에게는 필드별 지시문 역할을 하지만 검증기의 판정을 대체하지 못함

**detected_pattern** — 발견 사항을 촉발한 코드 구문/규칙 이름을 담는 필드. 기각 경향 분석의 핵심

**Deterministic**

- 결정론적. 같은 입력에 항상 같은 출력  <sub>(PRESTUDY-prompt-43-56.md)</sub>
- 결정론적. 같은 입력에 항상 같은 출력. 파서/정규표현식이 여기 해당  <sub>(PRESTUDY-prompt-57-70.md)</sub>

**Dismissal** — 개발자가 발견 사항을 "문제 아님"으로 기각하는 행위

**Dismissal Rate** — 기각률. 사용자가 "문제 아님"으로 닫아버린 알림의 비율. 오탐의 실전 대리 지표

**Docstring** — 함수/클래스 안에 쓰는 설명 문자열. 호출자가 읽는 문서

**Downstream** — 파이프라인의 후속 단계

**Downstream Processing** — 후속 처리. 추출 이후 단계(정규화, 저장, 리포팅)의 애플리케이션 코드

**Edge case** — 판단이 애매한 경계 사례. 설명 없는 예시만으로는 여기서 오판하기 쉽다.

**Effort Level** — 리뷰의 깊이/비용 수준 설정. 높일수록 시간·크레딧을 더 쓰고 검증 정확도가 오른다.

**Enum**

- 필드가 가질 수 있는 값을 정해진 목록으로 제한하는 스키마 요소  <sub>(PRESTUDY-prompt-29-42.md)</sub>
- 필드가 가질 수 있는 값을 정해진 목록으로 제한하는 스키마 제약  <sub>(PRESTUDY-prompt-85-104.md)</sub>

**enum** — 허용 값을 정해진 목록으로 한정하는 키워드 (예: `stated`/`estimated`/`unknown`)

**Enum (열거형)** — 값을 고정된 후보 집합으로 제한하는 타입. 형식 제약일 뿐 이해 능력을 높이지는 않는다.

**Error-Feedback Retry** — 무엇이 왜 틀렸는지 알려주며 다시 요청하는 재시도 기법

**Escalation** — 에스컬레이션. 자동 복구가 불가능할 때 상위 처리(사람)로 넘기는 것

**Escape Hatch Value** — `"unclear"`, `"unknown"`처럼 모호·부재 상황을 표현하기 위해 enum에 두는 값

**Example diversity** — 예시를 길이·언어·형태·정보 위치 등에서 다양하게 구성하는 것

**expired (result type)** — 배치가 24시간 안에 처리하지 못한 요청의 결과 타입. 과금되지 않으며 자동 재대기열되지 않는 종료 상태.

**Explicit Criteria** — 객관적으로 참/거짓 판정이 가능한 명확한 기준

**Explicit criteria** — 명시적 기준. 무엇을 보고/스킵할지 구체적으로 명시한 규칙

**Extended Thinking**

- 모델이 답하기 전 더 오래 추론하도록 하는 기능. 컨텍스트 한계를 늘려주지는 않음  <sub>(PRESTUDY-prompt-29-42.md)</sub>
- 답하기 전 내부적으로 길게 추론하게 하는 기능. 강제 도구 선택과 병용 불가  <sub>(PRESTUDY-prompt-85-104.md)</sub>

**Extraction Pipeline** — 문서에서 정형 데이터를 뽑아내는 자동화 처리 흐름

**Extraction tool** — 실제 실행 함수 없이, 스키마를 강제해 데이터를 뽑기 위해 정의하는 도구

**Fabrication** — 환각 중에서도 특히 없는 수치·사실을 만들어내는 것

**Fallback Default** — 실패 시 자동으로 채우는 기본값. 추출 파이프라인에서는 데이터 오염 원인이 되므로 지양.

**Fallback to Plain Text** — 도구를 호출하지 않고 일반 텍스트로 응답해 버리는 것. `auto`에서 발생 가능

**False Negative** — 실제 문제를 놓치는 미탐

**False Negative (미탐)** — 실제 문제인데 놓친 것

**False Negative (FN)** — 미탐/거짓 음성. 진짜 문제인데 놓친 경우

**False Positive** — 문제가 아닌 것을 문제라고 지적하는 오탐

**False positive** — 오탐. 문제가 아닌데 문제라고 지적한 것

**False Positive (오탐)**

- 실제 문제가 아닌데 문제라고 보고된 결과. 독립 재현·검증으로 걸러낸다.  <sub>(PRESTUDY-prompt-01-14.md)</sub>
- 실제로는 문제가 아닌데 문제라고 표시한 것  <sub>(PRESTUDY-prompt-85-104.md)</sub>

**False Positive (FP)** — 오탐/거짓 양성. 문제가 아닌데 문제라고 표시한 경우

**False positive rate** — 오탐률

**False Positive Rate** — 오탐률. 알림 중 잘못된 알림의 비율

**Feedback Loop** — 피드백 루프. 운영 결과를 지표로 모아 시스템을 개선하는 순환 구조

**Few-shot / Worked Example** — 원하는 출력의 완성 예시를 프롬프트에 넣어 형식을 고정하는 방식

**Few-shot example bias** — 편향된 예시 집합이 특정 유형 밖의 입력에서 성능 저하를 일으키는 현상

**Few-shot Prompting**

- 프롬프트에 입출력 예시 몇 개를 넣어 패턴을 알려 주는 방식.  <sub>(PRESTUDY-prompt-01-14.md)</sub>
- 입력–정답 예시 몇 개를 프롬프트에 넣어 기준을 학습시키는 방식  <sub>(PRESTUDY-prompt-85-104.md)</sub>

**Few-shot prompting** — 프롬프트 안에 입력-출력 견본 몇 개를 넣어 원하는 동작을 유도하는 기법

**Few-Shot Prompting** — 퓨샷 프롬프팅. 입력-출력 예시 몇 개를 프롬프트에 넣어 패턴을 따르게 하는 기법

**Finding** — 검토 도구가 찾아낸 문제 하나. 위치·설명·심각도·신뢰도 등을 담는 구조화 단위

**Flag** — 의심 레코드에 표시를 남겨 사람 검토로 보내는 것. 값을 덮어쓰지 않는 것이 핵심

**Fleet (에이전트 군단)** — 여러 리뷰어 에이전트를 병렬로 돌리는 구성. `ultra` 수준 리뷰가 이 방식을 쓴다.

**Forced Fitting** — 맞는 enum 값이 없을 때 모델이 억지로 가장 비슷한 값에 끼워 넣는 현상

**Forced Tool Calling** — `any` 또는 특정 도구 지정으로 도구 호출을 강제하는 것

**Forced Tool Use** — 강제 도구 사용. `any` 또는 특정 도구 지정. 도구 호출 전 자연어 텍스트가 억제됨

**Formatting Error** — 형식 오류. 값은 맞는데 표기 형식만 스키마와 다른 오류

**Free-text Field** — 자유 서술 필드. 세부 정보 보존에는 좋으나 집계 축으로는 부적합

**Generalization** — 예시에 없던 새로운 입력에도 올바른 판단을 확장 적용하는 능력.

**Generator / Verifier** — 결과를 만든 주체 / 그것을 검사하는 주체. 분리해야 검증이 유효하다.

**Generator Instance** — 결과(코드 변경·초안 발견 사항)를 만드는 쪽 인스턴스

**Genuinely Absent Data** — 원본에 정보가 실제로 존재하지 않는 상태. 재시도·모델 교체로 해결되지 않는다.

**Hallucination**

- 근거 없는 내용을 그럴듯하게 지어내는 현상  <sub>(PRESTUDY-prompt-29-42.md)</sub>
- 환각. 모델이 근거 없는 값을 그럴듯하게 지어내는 현상  <sub>(PRESTUDY-prompt-57-70.md)</sub>

**Hallucination (환각)**

- 모델이 근거 없는 값을 사실인 양 만들어 내는 현상.  <sub>(PRESTUDY-prompt-01-14.md)</sub>
- 근거가 없는데 그럴듯한 값을 지어내는 현상  <sub>(PRESTUDY-prompt-85-104.md)</sub>

**Human Escalation** — 정책·의미 판단이 필요해 사람에게 넘기는 절차

**Human-in-the-Loop** — 자동 처리로 해결 불가한 건을 사람에게 이관하는 설계.

**Human-in-the-loop** — 사람이 개입해 검토·승인하는 단계를 파이프라인에 두는 설계

**Human-in-the-Loop (HITL)** — 불확실한 건만 사람에게 넘겨 처리하는 자동화/사람 협업 구조

**In-context Learning**

- 모델 파라미터를 바꾸지 않고, 프롬프트 안의 예시만으로 그 자리에서 패턴을 익히는 현상.  <sub>(PRESTUDY-prompt-01-14.md)</sub>
- 가중치 변경 없이 프롬프트 문맥만으로 일어나는 임시 학습  <sub>(PRESTUDY-prompt-85-104.md)</sub>

**In-context learning** — 재학습 없이 프롬프트 안의 예시 패턴만으로 동작이 바뀌는 현상

**In-Context Learning** — 인컨텍스트 러닝. 가중치 학습 없이 문맥 속 예시만으로 패턴을 습득하는 현상

**Independent Review** — 이전 생성 맥락이 없는 새 인스턴스로 수행하는 검토

**Information Extraction** — 정보 추출. 비구조화 텍스트에서 정해진 필드 값을 뽑아내는 작업

**input_schema**

- 도구가 받는 입력의 JSON Schema  <sub>(PRESTUDY-prompt-57-70.md)</sub>
- 도구가 받는 인자의 JSON Schema. API 동작이 아니라 인자 형태만 규정  <sub>(PRESTUDY-prompt-85-104.md)</sub>

**Instruction Drift** — 지시문이 길어질수록 모델이 일부 규칙을 놓치거나 무시하는 현상

**Integration / Cross-file Pass** — 변경 집합 전체를 함께 보는 검사 단계. 파일 간 데이터 흐름·계약 불일치를 잡는다.

**Integration Pass** — 변경 묶음 전체를 보는 검토. 파일 간 데이터 흐름과 계약 불일치를 잡음

**invalid_request_error** — 클라이언트 입력 문제로 발생하는 4xx 계열 오류. 입력을 고쳐야 해결됨

**ISO 8601**

- 날짜/시간 국제 표준 표기. 날짜는 `YYYY-MM-DD`  <sub>(PRESTUDY-prompt-43-56.md)</sub>
- 국제 표준 날짜/시간 표기법. 날짜는 `YYYY-MM-DD` (예: `2026-03-14`)  <sub>(PRESTUDY-prompt-57-70.md)</sub>

**Iterative Refinement** — 소규모 실험 → 결과 확인 → 프롬프트 수정을 반복하며 품질을 올리는 절차.

**JSON** — `{"key": "value"}` 형태의 데이터 표기법. 문법이 조금만 어긋나도 파싱 실패

**JSON Schema**

- 필드 이름·타입·필수 여부·형식을 규정하는 명세. 타입은 검사하지만 필드 간 논리 관계는 못 잡는다.  <sub>(PRESTUDY-prompt-01-14.md)</sub>
- JSON 데이터의 필드명·타입·필수 여부·설명을 기술하는 명세  <sub>(PRESTUDY-prompt-43-56.md)</sub>
- JSON의 구조·타입·제약을 기계가 읽을 수 있게 기술한 명세  <sub>(PRESTUDY-prompt-57-70.md)</sub>
- 필드 이름·타입·필수 여부·허용값을 기술하는 명세 형식  <sub>(PRESTUDY-prompt-85-104.md)</sub>

**Latency**

- 요청부터 응답까지 걸리는 지연 시간  <sub>(PRESTUDY-prompt-29-42.md)</sub>
- 지연시간. 요청부터 응답까지 걸리는 시간  <sub>(PRESTUDY-prompt-43-56.md)</sub>
- 지연 시간. 요청부터 결과까지 걸리는 시간  <sub>(PRESTUDY-prompt-57-70.md)</sub>

**Latency SLA** — 응답까지 걸리는 시간에 대한 보장. 배치 API에는 없음

**Least Privilege** — 작업에 꼭 필요한 최소한의 도구·권한만 부여하는 원칙

**Local conventions** — 특정 파일/모듈에 자리 잡은 지역적 코딩 관례

**Malformed brackets** — 괄호/따옴표가 어긋나 파싱이 실패하는 상태

**max_tokens**

- 모델이 생성할 수 있는 최대 출력 토큰 수. 출력이 도중에 잘리는 문제에만 관계하며 품질 문제와는 무관.  <sub>(PRESTUDY-prompt-01-14.md)</sub>
- 모델이 **생성**할 출력의 최대 토큰 수. 입력 길이와는 무관  <sub>(PRESTUDY-prompt-29-42.md)</sub>

**Merge Gate** — 검토 결과가 나올 때까지 PR 병합을 막는 CI 관문

**Message Batches API**

- 대량 요청을 묶어 비동기로 처리하는 API. 최대 24시간 소요, 동기식 대비 약 50% 저렴.  <sub>(PRESTUDY-prompt-01-14.md)</sub>
- 대량 요청을 비동기로 처리하는 API. 약 50% 저렴하나 최대 24시간 소요  <sub>(PRESTUDY-prompt-29-42.md)</sub>
- 비동기 대량 요청 처리 API. 약 50% 비용 절감. 요청 중간 왕복은 불가능  <sub>(PRESTUDY-prompt-43-56.md)</sub>
- 요청을 묶어 비동기로 처리하는 Anthropic API. 비용 약 50% 절감  <sub>(PRESTUDY-prompt-57-70.md)</sub>
- 비동기 배치 API. 50% 할인, 24시간 내 처리 목표, 지연 SLA 없음  <sub>(PRESTUDY-prompt-85-104.md)</sub>

**Messages API**

- Anthropic의 기본 동기식 LLM 호출 API. 요청을 보내고 수 초 내 응답을 받는다.  <sub>(PRESTUDY-prompt-01-14.md)</sub>
- 동기식 API. 요청을 보내고 그 자리에서 수 초 내 응답을 받음  <sub>(PRESTUDY-prompt-85-104.md)</sub>

**Metadata Field** — 메타데이터 필드. 값 자체가 아니라 값의 출처·신뢰도를 기술하는 부가 필드

**Mid-request round trip** — 한 요청 처리 도중에 외부 결과를 받아 이어가는 왕복. 배치에서는 불가능

**Model drift** — 모델 자체가 시간에 따라 변해 성능이 달라지는 현상. 프롬프트 변경 직후의 저하와 혼동하면 안 됨

**Monolithic Schema** — 모든 경우를 한 스키마에 담은 거대 스키마. 노이즈와 혼동을 유발

**Multi-pass / Two-step Review** — 생성 호출과 검증 호출을 분리한 방식

**Multi-turn** — 여러 차례 주고받는 대화 구성

**Nesting / Parent Object** — JSON 객체 안에 객체를 넣는 계층 구조 / 그 상위 객체

**Noise** — 중요하지 않은 지적이 쌓여 진짜 이슈를 가리는 현상.

**Normalization**

- 제각각인 표현을 하나의 표준 형식으로 변환하는 것  <sub>(PRESTUDY-prompt-43-56.md)</sub>
- 정규화. 제각각인 표기를 하나의 표준 형식으로 통일하는 것  <sub>(PRESTUDY-prompt-57-70.md)</sub>

**Normalization (정규화)** — 비정형 표현을 정해진 형식·단위로 변환하는 것

**Notification Fatigue** — 오탐이 잦아 사용자가 도구의 출력을 아예 무시하게 되는 현상

**Null Fallback** — 값을 확정할 수 없을 때 `null`을 내도록 명시적 예시로 학습시키는 패턴

**Observability / Telemetry** — 시스템 동작을 사후에 측정·분석할 수 있게 데이터를 남기는 것

**optional** — 선택적 필드. `required`에 없거나 `null`을 허용하는 필드

**Orchestration** — 여러 에이전트·작업의 실행 순서와 병렬성을 조율하는 것

**Output Consistency** — 출력 일관성. 실행마다 필드 순서·구성이 동일하게 유지되는 성질

**Over-engineering** — 과잉 설계. 단순 문제에 불필요하게 복잡한 해법(예: 형식 고정을 위한 2단계 API 호출)을 적용하는 것

**Over-triggering** — 과도한 트리거. 규칙이 필요 이상으로 자주 발동해 오탐을 양산하는 상태

**Paired / Contrasting Examples** — 문제 사례와 허용 사례를 짝지어 각각의 정답과 함께 제시하는 예시 기법

**Parent Agent** — 부모/메인 에이전트. 서브에이전트를 호출하는 상위 에이전트

**pattern** — 문자열이 만족해야 할 정규표현식을 지정하는 키워드

**Payload** — 요청에 실려 보내지는 데이터 전체의 크기

**Per-batch Limits** — 단일 배치 한계: 요청 100,000개 또는 총 페이로드 256MB 중 먼저 도달하는 것

**Per-file Pass**

- 파일을 하나씩 격리해 보는 검사 단계. 문법·스타일·파일 내부 로직에 적합.  <sub>(PRESTUDY-prompt-01-14.md)</sub>
- 파일 하나씩 독립적으로 검토하는 단계. 파일 간 상호작용은 볼 수 없음  <sub>(PRESTUDY-prompt-29-42.md)</sub>
- 파일 하나 단위로 수행하는 검토. 문법·스타일·국소 로직에 강함  <sub>(PRESTUDY-prompt-85-104.md)</sub>

**Placeholder** — 자리표시자. 값이 없을 때 채우는 `"N/A"`, `"unspecified"` 같은 임시 값

**Plausible error** — 형식은 유효해서 스키마 검증을 통과하지만 값이 틀린 오류

**Polling** — 폴링. 주기적으로 API에 상태를 물어 완료 여부를 확인하는 방식

**Positive / Negative Example** — 값을 뽑아내야 하는 사례 / 값이 없어 null이 정답인 사례. 둘을 함께 줘야 경계가 잡힌다.

**Precision**

- 지적한 것 중 진짜 문제의 비율  <sub>(PRESTUDY-prompt-29-42.md)</sub>
- 정밀도. 지적한 것 중 실제 문제인 비율  <sub>(PRESTUDY-prompt-43-56.md)</sub>
- 정밀도 = TP/(TP+FP). 표시한 것 중 진짜 문제의 비율  <sub>(PRESTUDY-prompt-57-70.md)</sub>

**Precision (정밀도)** — 문제라고 표시한 것 중 실제 문제인 비율. 오탐이 많으면 낮아짐

**Precondition** — 전제 조건. 코드가 실행되기 전에 성립해야 하는 조건

**Probabilistic** — 확률적. LLM처럼 같은 입력에도 출력이 달라질 수 있는 성질

**Processing / Formatting Error** — 정보는 맞게 읽었으나 구조·위치·형식이 틀린 오류. 재시도로 해결 가능

**Processing Window** — 처리 창. 배치가 완료되기까지 허용되는 최대 시간. Batches API는 최대 24시간

**Prompt**

- 모델에 넣는 입력 텍스트 전체  <sub>(PRESTUDY-prompt-29-42.md)</sub>
- 모델에게 보내는 입력 텍스트 전체. 배경, 지시, 예시, 실제 입력이 섞인다  <sub>(PRESTUDY-prompt-43-56.md)</sub>

**Prompt Chaining** — 작업을 여러 API 호출로 나누고 출력을 다음 입력으로 넘기는 구조

**Prompt Engineering** — 프롬프트 엔지니어링. 모델 입력을 설계해 원하는 동작을 끌어내는 기술

**Prompt iteration** — 프롬프트를 반복 개선하고 검증하는 작업

**Prompt String** — 부모가 Agent 도구를 호출하며 서브에이전트에 넘기는 지시 문자열. 시스템 프롬프트와 함께 서브에이전트가 갖는 유일한 초기 컨텍스트

**Prompt structuring** — 프롬프트의 각 영역을 명확히 구분해 배치하는 설계

**Rate Limit**

- 단위 시간당 허용되는 요청 수/토큰 수 상한. 동기식 병렬 호출을 무한정 늘릴 수 없는 이유.  <sub>(PRESTUDY-prompt-01-14.md)</sub>
- 요청량 제한. 일정 시간당 허용되는 요청 수의 상한  <sub>(PRESTUDY-prompt-57-70.md)</sub>

**Raw Context Integrity** — 검토자에게 요약본이 아닌 원본(raw diff)을 그대로 전달해야 한다는 원칙

**Reasoning Trace** — 추론 흔적. 모델이 결론에 이르기까지의 사고 과정 기록

**Recall**

- 재현율. 실제 문제 중 잡아낸 비율  <sub>(PRESTUDY-prompt-43-56.md)</sub>
- 재현율 = TP/(TP+FN). 진짜 문제 중 잡아낸 비율  <sub>(PRESTUDY-prompt-57-70.md)</sub>

**Recall (재현율)** — 실제 문제 중 찾아낸 비율. 미탐이 많으면 낮아짐

**Regression** — 이전에 잘 되던 동작이 변경 이후 나빠지는 성능 저하

**Representative Sample** — 전체 데이터의 다양한 양상을 반영한 소규모 표본. 대량 배치 전 프롬프트 검증에 사용.

**required** — 반드시 존재해야 하는 필드를 지정하는 JSON Schema 키워드

**Result Type** — 배치 결과 항목의 상태 (`succeeded`, `errored`, `canceled`, `expired`)

**Resume (Session)** — 이전 세션을 대화 이력째로 이어서 실행하는 것. 맥락이 지워지지 않음

**Retry Limit (Maximum Retries)** — 재시도 상한. 없으면 무한 루프와 비용 폭증, 환각 유도로 이어진다.

**Reviewer Instance** — 생성 결과를 독립적으로 검증하는 별도 인스턴스

**Round trip** — 요청-응답 왕복

**Routing** — 라우팅. 입력을 유형에 따라 알맞은 처리 경로/도구로 보내는 것

**Rubric** — 루브릭. 판단 기준을 항목화해 정리한 지침

**Sampling variance** — 확률적 생성의 결과 변동성. 이것에만 기대는 재시도는 나쁜 설계

**Schema** — 출력 JSON이 가져야 할 필드·타입·계층의 규격 정의

**Schema Validation**

- 출력이 스키마를 지켰는지 검사하는 단계  <sub>(PRESTUDY-prompt-29-42.md)</sub>
- 스키마 검증. 출력이 스키마를 만족하는지 프로그램이 판정하는 단계  <sub>(PRESTUDY-prompt-57-70.md)</sub>

**Schema validation** — 출력이 스키마의 타입·형식에 맞는지 검사하는 것. 값의 정확성은 보장하지 않음

**Self-Confirmation Bias** — 자기가 만든 결과를 자기가 검토할 때 생기는 확증 편향

**Self-contained Resolution** — 서버 도구가 애플리케이션 개입 없이 단일 요청 패스 안에서 해결되는 성질

**Self-Correction** — 모델이 피드백을 받아 자기 출력을 스스로 고치는 것

**Self-Correction / Feedback Loop** — 검증 실패 내용을 피드백으로 넣어 모델에 재요청하는 루프.

**Self-Correction via Feedback** — 피드백 기반 자가 교정. 검증기 에러 메시지를 모델에게 되돌려 고치게 하는 패턴

**Self-framing** — 생성자가 자기 결과를 자기 관점으로 서술해 검토자의 시야를 가두는 편향

**Self-review** — 생성한 세션이 스스로 검토하는 것. 생성 시 맹점을 그대로 물려받는다.

**Semantic Error** — 의미 오류. 값 자체가 틀린 오류. 교차 검증이 필요

**Server-side Tool (Built-in Tool)** — 웹 검색처럼 서버 내부에서 한 요청 안에 자동 완결되는 도구

**Severity (심각도)** — 그 문제가 진짜라면 얼마나 위험한지

**Severity Definition** — Critical 등 심각도 등급의 정의. 객관적·검증 가능해야 리뷰 결과가 수렴한다.

**Severity label** — 심각도 레이블(critical/warning/informational 등). 낮춰도 노이즈 출력 자체는 남음

**Single Undifferentiated Source** — 미분화된 단일 출처. 사용자가 여러 카테고리 출력을 하나의 출처로 뭉뚱그려 인식하는 것

**Single-pass** — 한 번의 호출로 생성과 검증을 모두 처리하는 방식

**SLA (Service Level Agreement)**

- 서비스가 보장하는 처리/응답 기한. 배치 주기 설계의 상한 조건이 된다.  <sub>(PRESTUDY-prompt-01-14.md)</sub>
- 서비스 수준 협약. 제공자가 보장하는 성능/가용성 약속  <sub>(PRESTUDY-prompt-57-70.md)</sub>

**Spurious pattern** — 의도치 않은 상관 패턴. 예시들이 우연히 공유한 특징(길이, 언어 등)을 규칙으로 오학습하는 것

**Stateful retry** — 원본·이전 출력·피드백을 대화 이력에 유지한 채 다시 시도하는 방식

**Stateless** — 서버가 이전 요청을 기억하지 않는 성질. 매 요청에 필요한 맥락을 다시 보내야 함

**Stray commentary** — JSON 앞뒤에 붙는 불필요한 설명 텍스트(사족)

**Strict tool use** — 서버 측 디코딩 단계에서 `input_schema` 준수를 강제하는 옵션. 구문 오류·필드 누락을 구조적으로 차단

**Strict Tool Use (`strict: true`)** — 출력이 JSON Schema를 문법적으로 100% 준수하도록 강제하는 옵션

**Structural Conformance** — 필드 구성이 스키마와 일치하는가

**Structured Data** — 구조화 데이터. 정해진 필드와 타입을 가진 JSON/테이블 형태의 데이터

**Structured Output**

- 모델이 정해진 JSON 스키마 형태로 답하게 하는 기법.  <sub>(PRESTUDY-prompt-01-14.md)</sub>
- 자유 문장이 아니라 JSON 등 파싱 가능한 형태로 결과를 받는 것  <sub>(PRESTUDY-prompt-29-42.md)</sub>
- 자유 텍스트가 아니라 정해진 스키마를 따르는 형태로 받는 출력  <sub>(PRESTUDY-prompt-85-104.md)</sub>

**Structured output** — 기계가 파싱 가능한 형태(주로 JSON)의 모델 출력

**Subagent** — 서브에이전트. 부모 에이전트가 하위 작업을 위임하는 별도 에이전트

**Submission Cadence** — 제출 주기. 새 배치를 얼마나 자주 제출하는지의 간격

**Suppression** — 억제. 특정 패턴/케이스에 대한 알림을 꺼서 노이즈를 줄이는 것

**Synchronous / Asynchronous**

- 동기식은 응답을 기다린다. 비동기식은 제출해 두고 나중에 결과를 회수한다.  <sub>(PRESTUDY-prompt-01-14.md)</sub>
- 응답을 기다리는 동기 호출 / 나중에 결과를 찾아가는 비동기 호출  <sub>(PRESTUDY-prompt-29-42.md)</sub>

**System Prompt**

- 대화 전체에 적용되는 상위 지시문. 공통 정책·규칙은 여기에 한 번만 적는다.  <sub>(PRESTUDY-prompt-01-14.md)</sub>
- 시스템 프롬프트. 모델의 역할·규칙을 정하는 최상위 지시문  <sub>(PRESTUDY-prompt-57-70.md)</sub>

**System prompt** — 대화 전체에 걸쳐 모델의 역할과 규칙을 정하는 상위 지시문

**Targeted feedback** — 무엇이 왜 틀렸는지를 구체적으로 지목하는 피드백

**Temperature**

- 샘플링 무작위성 파라미터. 높이면 다양해지지만 환각 위험이 커진다. 정보 추출에는 보통 낮게 둔다.  <sub>(PRESTUDY-prompt-01-14.md)</sub>
- 다음 토큰 선택의 무작위성 파라미터. 0이면 결정론적. 형식 보장 장치가 아님  <sub>(PRESTUDY-prompt-43-56.md)</sub>

**temperature** — 토큰 샘플링의 무작위성 조절 파라미터. 0에 가까울수록 결정론적

**Terminal state** — 더 이상 상태가 바뀌지 않는 최종 상태. 만료된 배치는 여기에 해당하므로 직접 재제출해야 한다.

**Throughput**

- 단위 시간당 처리할 수 있는 작업량  <sub>(PRESTUDY-prompt-29-42.md)</sub>
- 처리량. 단위 시간당 처리할 수 있는 작업의 양  <sub>(PRESTUDY-prompt-57-70.md)</sub>

**Token** — 모델이 텍스트를 처리하는 최소 단위 조각. 과금과 길이 제한의 기준

**Tool / Tool Definition** — 모델이 호출할 수 있는 함수 명세. 구조화 출력의 표준 수단

**Tool Result** — 도구 실행 결과. 부모의 도구 결과는 서브에이전트에 자동 전달되지 않음

**Tool Schema Modularization** — 거대 통합 스키마 대신 유형별 소형 도구 여러 개로 쪼개는 설계

**Tool use / Function calling** — 모델이 정의된 도구를 호출하겠다고 요청하고, 그 인자를 구조화된 형태로 받는 방식

**Tool Use / Function Calling** — 도구 사용. 모델이 개발자가 정의한 함수를 호출하는 형태로 응답하게 하는 기능

**tool_choice**

- 모델의 도구 호출 방식을 제어하는 파라미터 (`auto`, `any`, 특정 도구 지정)  <sub>(PRESTUDY-prompt-29-42.md)</sub>
- 도구 사용 방식을 통제하는 파라미터  <sub>(PRESTUDY-prompt-57-70.md)</sub>

**tool_choice: any** — 등록된 도구 중 반드시 하나를 호출. 어느 것인지는 모델이 판단

**tool_choice: auto** — 기본값. 도구 호출과 텍스트 응답 중 모델이 스스로 선택

**tool_choice: none** — 도구를 전혀 호출하지 않음

**tool_choice: tool + name** — 지정한 특정 도구를 반드시 호출

**tool_result** — 클라이언트 측 도구 실행 결과를 모델에게 되돌려 주는 메시지

**tool_use block** — 모델이 도구를 호출했음을 나타내는 응답 블록

**tools** — API 요청에서 사용 가능한 도구 목록을 넘기는 파라미터

**True Positive (TP)** — 진짜 문제를 문제라고 맞게 표시한 경우

**Truncation** — 토큰 한도에 걸려 출력이 중간에 잘리는 현상

**Trust Erosion** — 신뢰 훼손. 한 부분의 낮은 품질이 시스템 전체에 대한 신뢰를 무너뜨리는 현상

**Tuning** — 튜닝. 탐지 규칙이나 프롬프트를 실제 데이터에 맞춰 조정하는 것

**Turn-by-turn Delegation** — 대화 턴마다 하나씩 수동으로 작업을 위임하는 방식. 규모 확장에 부적합

**Turnaround Time** — 처리 완료 시간. 작업 접수부터 결과 제공까지의 총 시간

**Type Conformance** — 각 값의 데이터 타입이 스키마와 일치하는가

**Type Validation Error** — 타입 검증 오류. `number` 필드에 `"N/A"` 문자열을 넣는 등 타입이 어긋날 때 발생

**Unstructured Data** — 비구조화 데이터. 이메일, PDF, 자유 텍스트처럼 정해진 필드 구조가 없는 데이터

**Vague Instruction** — "중요한", "확신하는" 등 판단을 모델의 주관에 맡기는 모호한 지시

**Validation Check** — 모델 출력이 규칙을 지켰는지 코드로 확인하는 단계.

**Validation Failure** — 검증 실패. 스키마를 만족하지 못해 출력이 거부되는 것

**Validator** — 검증기. `jsonschema`, `pydantic` 같은 검증 수행 라이브러리/코드

**Worked Example** — 완성 예시. 원하는 출력 형식이 완전히 구현된 본보기

**Workflow Tool** — 스크립트로 다수 서브에이전트를 병렬 조율하는 실행 도구

**Worst Case** — 최악의 경우. SLA 설계는 평균이 아니라 이 값을 기준으로 해야 함

**XML Tags**

- `<name>...</name>` 형태로 프롬프트 영역의 경계를 명확히 하는 구조화 기법  <sub>(PRESTUDY-prompt-29-42.md)</sub>
- `<example>`, `<instructions>` 등으로 프롬프트 구획을 나누는 기법. Claude에 특히 효과적  <sub>(PRESTUDY-prompt-57-70.md)</sub>

**XML tags (`<example>`, `<examples>`)** — 프롬프트 영역의 경계를 표시하는 태그. 개별 예시는 `<example>`, 전체 묶음은 `<examples>`로 감싼다

**Zero-shot**

- 예시 없이 지시문만으로 작업을 시키는 방식  <sub>(PRESTUDY-prompt-29-42.md)</sub>
- 예시 없이 지시문만으로 시키는 방식  <sub>(PRESTUDY-prompt-43-56.md)</sub>
- 예시 없이 지시문만으로 시키는 프롬프트 방식  <sub>(PRESTUDY-prompt-85-104.md)</sub>

**Zero-Shot** — 예시 없이 지시문만으로 작업을 시키는 방식

**Zero-shot Prompting** — 예시 없이 지시문만으로 작업을 시키는 방식.
