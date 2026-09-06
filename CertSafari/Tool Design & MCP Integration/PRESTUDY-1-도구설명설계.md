# 1. 도구 설명과 이름 설계

## 이 장에서 다루는 것
- 모델은 무엇을 보고 도구를 고르는가 (라우팅의 원리)
- 도구 이름 짓기 규칙
- 좋은 설명 쓰기: 무엇을·무엇을 반환·언제 쓰고·언제 쓰지 말 것
- 비슷한 도구들을 구분시키는 법 (상호 참조, 부정 명세)
- 파라미터 설명과 input_schema description
- 시스템 프롬프트가 도구 선택에 미치는 영향
- 흔한 실패와 효과 없는 처방들

---

## 1.1 모델은 무엇을 보고 도구를 고르는가

### 라우팅(Routing)이란
여러 도구 중 상황에 맞는 하나를 고르는 모델의 판단을 **도구 라우팅**이라고 합니다. 라우팅이 실패하면 잘못된 도구가 실행되거나, 애초에 불가능한 작업을 시도하다 실패합니다. 이 현상을 **Misrouting**(오라우팅, 오호출)이라 부릅니다.

### 모델이 볼 수 있는 것은 세 가지뿐
모델은 도구의 **소스 코드를 보지 않습니다.** 라우팅에 쓸 수 있는 정보는 사실상 다음뿐입니다.

| 모델이 보는 것 | 모델이 보지 못하는 것 |
|---|---|
| `name` (도구 이름) | 구현 소스 코드 |
| `description` (설명) | 내부 함수 이름 |
| `input_schema` (JSON Schema) | 백엔드 라우팅 가중치 |

이 셋만 보고 모델은 두 가지를 결정합니다.
1. **어떤 도구를 부를 것인가** (도구 선택)
2. **어떤 인자를 넣을 것인가** (인자 생성)

### 설명은 문서가 아니라 프롬프트다
도구 설명은 사람이 읽는 주석이 아니라, **모델이 라우팅 결정을 내리는 근거**이자 **API 계약**입니다. 설명이 부실하면 모델은 추측하고, 추측은 틀립니다.

모델의 도구 선택은 사실상 **자연어 요청과 도구 설명 간의 의미(semantic) 매칭**입니다. 사용자 요청 문장과 각 도구의 이름·설명을 의미적으로 비교해서 가장 잘 맞는 것을 고르므로, 선택 정확도는 **설명 문장의 품질**에 거의 전적으로 달려 있습니다.

> **원칙:** 라우팅이 틀린다 → **도구 명세(specification)를 고친다.** 라우팅 문제는 거의 항상 도구 명세의 문제이지, 모델의 문제가 아닙니다. 에이전트를 더 붙이거나, 예시를 늘리거나, 가중치를 만지는 것은 우회일 뿐입니다.

---

## 1.2 도구 이름 짓기

### 기본 규칙
- **의미가 드러나게, `동사_명사` 형태로** — `create_issue`, `run_report`, `get_user_profile`.
- 이름은 **의미론적 신호**이지 충돌 회피용 ID가 아닙니다. 무작위 고유 문자열로 바꾸면 의미 충돌은 사라지지만 **의미 자체가 사라져서** 모델이 언제 이 도구를 써야 하는지 전혀 알 수 없게 됩니다.
- 내장 도구와 **같은 이름을 쓰지 말 것** — 커스텀 도구를 내장 `Grep`과 같은 `grep`으로 개명하면 이름 충돌과 혼란만 유발합니다.
- **버전 접미사(`_v1`, `_v2`)로만 구분하지 말 것** — `v2`는 "더 새롭고 더 강력하다"는 신호만 줄 뿐 **무엇이 다른지**는 하나도 전달하지 않습니다. 오히려 모델이 v2를 무조건 선호하게 만들어 오호출이 늘 수 있습니다.
- **이모지나 눈에 띄는 이름은 무의미** — 시각적 구분은 사람에게만 의미가 있습니다. 모델은 텍스트 토큰의 의미를 볼 뿐 "화면에서 튀는 정도"를 보지 않습니다.

### 범위가 줄어들면 이름도 바꾼다 (Description Drift)
시간이 지나며 전용 도구(successor tool)가 새로 생기면, 기존 범용 도구의 **역할 범위가 줄어듭니다.** 그런데 이름과 설명을 그대로 두면 여전히 "나는 다 할 수 있다"고 광고하는 셈이라 모델이 계속 그쪽으로 갑니다. 이를 **설명 표류(description drift)** 또는 **도구 범위 중복(overlapping scope)**이라 부릅니다.

예: `analyze_content`가 이메일·내부 메모·웹페이지를 모두 요약하다가, 웹 전용 `analyze_web_page`가 새로 생긴 경우.

올바른 조치는 **두 가지를 동시에** 하는 것입니다.

1. **이름 변경** — 남은 실제 역할을 반영 (`analyze_content` → `analyze_pasted_text`)
2. **설명 갱신** — 새 도구가 가져간 케이스를 명시적으로 **제외**
   `"For pasted text such as emails and internal notes. Do NOT use for web pages; use analyze_web_page for those."`

같은 패턴의 다른 사례: 붙여넣기 텍스트 요약용 `analyze_content`의 설명을 PDF 처리용 신규 `analyze_document`에 거의 그대로 복붙해 경계가 사라진 경우 → 기존 도구를 `summarize_pasted_text`로 개명하고 "대화에 붙여넣은 평문 텍스트만" 처리한다고 범위를 좁히며, `analyze_document`는 "업로드된 PDF 파일"을 담당한다고 명시합니다.

---

## 1.3 설명 쓰기 — 무엇을·언제·언제 쓰지 말 것

### 좋은 설명의 체크리스트
| # | 항목 | 설명 |
|---|---|---|
| 1 | **무엇을 하는가** | 한 문장으로 명확한 동작 정의 |
| 2 | **무엇을 반환하는가** | 반환값의 형태와 실제 필드명, 출력 상세도(요약 300단어 / 전체 거래 내역 CSV 등) |
| 3 | **입력 형식(input format)** | 각 인자의 정확한 형태와 유효 범위 |
| 4 | **예시 질의(example query)** | 이 도구가 호출되어야 할 대표적 사용자 발화 한둘 |
| 5 | **범위 밖(out of scope)** | 이 도구가 **하지 않는 일** |
| 6 | **이웃 도구와의 경계** | 언제 다른 도구를 대신 써야 하는가 |
| 7 | **경계 동작 및 오류/제약** | 부분 입력, 빈 결과, 실패 시 반환, 지원 지역, 길이 제한 |

### (1) 무엇을 반환하는지 — 구체적 필드명으로
"Returns user account information." 같은 문장은 아무 정보도 주지 않습니다. **반환하는 실제 필드를 나열**하세요.

```json
{
  "name": "get_user_profile",
  "description": "Returns the user's profile fields: display name, email, avatar URL, timezone, and locale. Does NOT return roles or permissions."
},
{
  "name": "get_user_permissions",
  "description": "Returns the user's authorization data: assigned roles, access scopes, and permission flags. Does NOT return display name or contact details."
}
```

### (2) 부정 제약(Negative Constraint) — "무엇은 못 하는가"
"무엇을 할 수 있는가"만 쓰면 부족합니다. **"무엇은 할 수 없는가"**를 명시적으로 쓰는 것이 강력합니다. 부정 제약은 모델이 잘못된 기대를 갖는 것을 사전에 차단하기 때문에 잘못된 호출을 가장 확실히 줄여 줍니다.

나쁜 예:
```
name: get_financial_data
description: "Gets financial data."
```
"financial data"는 주가도 되고, 환율도 되고, 개인 계좌 잔액도 됩니다. 사용자가 "내 계좌 잔액 알려줘"라고 하면 실제로는 공개 주가만 제공하는 이 도구를 부릅니다. 이런 **범위를 넘는 호출**은 실패하거나, 더 나쁘게는 모델이 없는 데이터를 지어내는 환각(hallucination)으로 이어집니다.

좋은 예:
```
description: "Returns public stock market prices only.
Cannot access private account balances, holdings, or any user-specific
financial information."
```

부정 제약의 전형적 형태:
- `"...cannot access private account information."`
- `"Use for non-web content only; for web pages use fetch_web_page instead."`

### (3) 예시 질의 — few-shot 효과
구체적 예시 하나가 추상적 설명 열 줄보다 강력합니다. 모델은 예시를 그대로 모방합니다. "이런 요청이 오면 이 도구다"라는 대표 유스케이스 한둘이면 충분하고, 많이 넣을 필요는 없습니다.

### (4) 언제 이 도구가 더 나은지를 말해야 커스텀 도구가 쓰인다
설명이 `"Finds symbol usages."` 한 줄뿐이면, 정밀한 커스텀 도구를 만들어도 에이전트는 계속 내장 `Grep`만 씁니다. 모델 입장에서는 익숙하고 검증된 도구가 안전해 보이기 때문입니다. 원인은 설명이 **무엇을 반환하는지**, **언제 텍스트 검색보다 나은지**를 말해주지 않는 것입니다.

```
find_symbol_usages: 프로젝트의 심볼 인덱스를 이용해 특정 심볼의 모든 사용처를
파일 경로·행 번호·사용 종류(호출/임포트/재export)와 함께 반환한다.
이름이 바뀐 임포트(import { a as b })를 거친 사용처, 빌드로 생성된 코드 등
텍스트 검색으로는 문자열이 일치하지 않아 놓치는 경우까지 찾아낸다.
심볼 단위의 정확한 참조 추적이 필요할 때 Grep 대신 사용한다.
```

효과 없는 대응: 이름을 내장 도구와 같게 바꾸기 / 내장 `Grep`을 아예 제거하기(범용 텍스트 검색 능력을 통째로 상실) / 매 호출마다 수동 승인 요구하기(사람 부담만 늘고 모델의 판단 근거는 하나도 개선되지 않음).

### (5) 도움이 되지 않는 것들
| 넣어도 소용없는 것 | 이유 |
|---|---|
| 파라미터 조합의 나열만 | 스키마는 "어떻게 부르는가"만 알려 줄 뿐 "언제 부르는가"를 알려 주지 않음 |
| 구현 세부 정보 (담당 엔지니어 이름, 구현 언어) | 사용자의 요청과 아무 의미적 연관이 없음 |
| 이모지·눈에 띄는 표기 | 모델은 토큰의 의미만 봄 |
| 홍보성 문구("더 유능한 옵션") | 구별 기준을 주지 않고 한쪽으로 편향만 시킴 |

### (6) 설명 템플릿을 표준화하라
개별 도구를 하나씩 고치는 것은 **증상 치료**입니다. 새 도구가 추가될 때마다 같은 문제가 반복됩니다. 장기 해법은 팀 전체가 따르는 **도구 설명 템플릿**을 제정하는 것입니다.

권장 템플릿 항목: ① 무엇을 하는가 ② 출력 상세도 ③ 예시 쿼리 ④ 유사 도구와의 차이 ⑤ 입력 형식 ⑥ 경계 동작 및 오류.

템플릿을 규범으로 만들면 앞으로 추가되는 모든 도구에 자동 적용되므로 문제 재발을 구조적으로 막습니다.

---

## 1.4 비슷한 도구들을 구분시키는 법 (Disambiguation)

### 중복 설명 = 동전 던지기
두 도구가 이름만 다르고 설명이 사실상 같으면 모델에게는 **구별 신호가 0**입니다. 라우팅이 거의 동전 던지기 수준이 됩니다. 임베딩 공간에서 두 설명의 **의미론적 거리**가 너무 가까운 상태입니다.

전형적 사례들:

| 도구 쌍 | 동일하게 붙은 설명 | 나타나는 증상 |
|---|---|---|
| `process_data` / `process_information` | "Processes data provided by the user." | 무작위 선택 |
| `get_user_profile` / `get_user_permissions` | "Returns user account information." | 절반 확률로 틀림 |
| `run_linter` / `run_type_checker` | "Checks code for issues." | 늘 린터만 실행 |
| `translate_text` / `localize_content` | "Converts text between languages." | 현지화가 필요한데 직역만 함 |
| `generate_summary_report` / `generate_detailed_report` | "Generates a report for the given account." | "간단한 개요만" 요청에도 상세 보고서 |
| `create_ticket` / `escalate_ticket` | 둘 다 "handles customer issues" 포함 | 에스컬레이션해야 할 사안도 그냥 티켓 생성 |
| `analyze_content` / `analyze_document` | 거의 동일한 한 줄 | 붙여넣은 텍스트에도 document 도구 호출 |

이름의 summary/detailed 차이만으로 모델이 추론하기를 기대하는 것은 **불안정**합니다.

### 핵심 기법: 상호 참조(cross-reference)
각 설명이 자기 영역만 말하는 게 아니라 **경계선의 반대편도 가리켜** 주는 패턴입니다. "**A일 때는 나를, B일 때는 저쪽 도구를**" — 이것이 모호성 해소의 핵심 기법입니다.

```
analyze_content:
  Summarizes raw text supplied directly in the request (pasted text,
  copied article bodies, chat transcripts). Input is a plain string.
  If the user has uploaded a file or given a document ID, use
  `analyze_document` instead.

analyze_document:
  Summarizes an uploaded document referenced by document ID
  (PDF, DOCX, TXT files). Input is a document identifier, not text.
  If the user pasted the text inline, use `analyze_content` instead.
```

고유 기능 + 배제 범위를 나눠 쓴 예:
```
translate_text:
  "Direct language-to-language translation only.
   Does NOT adjust currency, date formats, or cultural references."

localize_content:
  "Full localization: translates text AND adapts currency, date/number
   formats, and culture-specific references for the target locale.
   Use when output must feel native to the target market."
```

**고유한 트리거 조건**과 **선행 조건**까지 적은 예:
```text
create_ticket:
  신규 고객 문의를 최초로 접수해 티켓을 만든다. 아직 티켓이 없는 사안에만 사용한다.
  이미 존재하는 티켓이 SLA를 초과했거나 고객이 상급자 대응을 요구하면
  create_ticket이 아니라 escalate_ticket을 사용할 것.

escalate_ticket:
  이미 존재하는 티켓을 상위 지원 등급으로 올린다. 기존 ticket_id가 반드시 필요하다.
  SLA 초과, 반복 실패, 고객의 명시적 에스컬레이션 요구 시에만 사용한다.
  아직 티켓이 없다면 먼저 create_ticket을 사용할 것.
```

**감지 범주 + 사용자 발화 예시**를 적은 예:
```
run_linter: 코드 스타일과 구문 관례 위반(포매팅, 미사용 변수, 네이밍 규칙,
import 정렬 등)을 검사한다. "린트 돌려줘", "스타일 정리해줘"에 해당.

run_type_checker: 정적 타입 검사를 수행해 타입 불일치, 잘못된 인자 타입,
null 가능성 오류 등 타입 오류를 검출한다. "타입 에러 있는지 봐줘",
"타입 체크해줘"에 해당.
```

배타적으로 다시 쓴 최소 예:
```
process_data:        CSV/JSON 등 구조화된 데이터 파일을 정규화·집계한다. 비정형 텍스트에는 쓰지 말 것.
process_information: 자유 서술형 텍스트 문서를 요약·분류한다. 표 형식 데이터에는 process_data를 쓸 것.
```

### 모호성 해소를 위해 **하면 안 되는** 대응들
| 잘못된 대응 | 왜 안 되는가 |
|---|---|
| 두 도구를 하나로 **통합**하고 `localize: true` 같은 boolean 플래그로 구분 | 라우팅 문제가 "플래그 값 결정 문제"로 이름만 바뀜. 설명은 짧아졌으니 오히려 나빠질 수 있음 |
| 설명 수정 없이 **플래그만 추가** (`create_ticket(escalate=true)`) | 모델은 플래그를 언제 true로 둘지 판단할 기준을 얻지 못함 |
| 한쪽 도구를 **삭제** | 실제 사용 사례가 처리 불가능해짐. 단순 번역과 전체 현지화는 비용·지연·목적이 다름 — 값싼 쪽을 없애면 모든 요청이 비싼 경로로 감. 모호성 문제를 기능 상실로 바꾸는 것 |
| **설명 삭제** (이름만 남기기) | 최악. 모델이 역할·입력 규칙을 알 수 없어 오호출 위험이 극대화 |
| **버전 접미사**(`_v1`, `_v2`)로 구분 | 무엇이 다른지 전달 못 함. 의미 정보가 사라져 구분 능력이 오히려 악화 |
| 내부 **함수 이름만** 다르게 하기 | 모델은 내부 함수 이름을 보지 못함. 백엔드 라우팅은 모델의 선택 문제를 해결하지 못함 |
| **백엔드 라우팅 가중치** 조정 | 모호성은 **프롬프트 계층**에 있음. 백엔드 숫자는 모델의 판단 근거를 바꾸지 못함 |
| 사용자에게 매번 **도구 ID/내부 도구명**을 지정하게 하기 | 에이전트의 자율 도구 선택이라는 존재 이유와 자연어 인터페이스의 목적 자체가 부정됨 |
| 사용자에게 **정확한 용어**를 쓰라고 강요 | 고칠 수 있는 것을 사용자에게 떠넘기는 것 |
| 클라이언트마다 **하드코딩** | 서버 결함을 모든 소비자에게 전가. 서버 작성자가 설명을 고치는 게 근본 해결 |
| 도구 대신 **리소스로 변경** | 모호한 설명 문제는 리소스로 바꿔도 그대로 남음 |
| **항상 둘 다/모두 호출**하고 결과 합치기 | 불필요한 연산·시간 낭비이며, 부작용이 있는 도구(환불, 계정 해지)에서는 실제 피해 발생 |
| **도구 개수를 인위적으로 제한**(예: 2개) | 선택은 쉬워지지만 실제 업무를 표현 못 함. 문제는 개수가 아니라 설명의 품질 |
| **샘플링 온도(temperature) 올리기** | 온도는 출력의 무작위성 조절값. 높이면 선택이 **더** 예측 불가능해짐 — 정확히 반대 방향 |
| **실행 전 지연(delay) 삽입** | 모델은 "기다리며 재고"하지 않음. 의사결정은 이미 끝난 상태 |
| **이름을 무작위 고유 문자열**로 변경 | 의미 자체가 사라져 언제 써야 할지 알 수 없게 됨 |

> **원칙: 도구 선택 문제의 근본 해결은 거의 항상 "이름과 설명을 명확히 하는 것"이다.**

---

## 1.5 파라미터 설명과 input_schema description

설명은 도구 **선택**뿐 아니라 **인자 생성**의 근거이기도 합니다. 입력 형식이 명시되지 않으면 모델이 인자를 왜곡하거나 없는 필드를 지어냅니다.

### 사례: 인자 왜곡과 범위 혼동
문제: 설명이 `"Get weather for a location."` 한 줄뿐. 결과적으로
- 모델이 여러 단어로 된 도시 이름(`San Francisco`)을 뭉개거나 잘못 변형 → **입력 형식 미명시**
- 사용자가 과거 기후 보고서를 원할 때도 이 도구를 호출 → **범위 경계 미명시**

개선 예 (입력 형식 + 예시 쿼리 + 범위 밖, 세 가지가 각각 위 실패에 정확히 대응):
```
Get current and forecast weather for a location.

Input: `location` is a city name as a plain string. Keep multi-word
names intact with spaces, e.g. "San Francisco". Optionally disambiguate
with "City, Country", e.g. "Paris, France".

Example: location = "San Francisco"

Out of scope: historical climate records or long-term climate averages.
For those, use `get_climate_history` instead.
```

### 경계 동작(boundary behavior)을 적어라
**경계 동작**이란 "정상 범위의 가장자리에서 어떻게 되는가"입니다. 예: 빈 값 처리, 존재하지 않는 ID, 최대 항목 수, 부분 입력 허용 여부, 멱등성(같은 호출을 두 번 하면?), 실패 시 반환 형태.

문제: 설명이 "Updates a customer record with given fields."뿐. 결과적으로
- 모델이 스키마에 없는 필드를 지어내서 넘김 (허용 필드 목록이 없으므로)
- **부분 업데이트(partial update)**가 되는지 불명확 — 일부 필드만 보내면 나머지는 유지되는가, 비워지는가?

해결:
```text
update_customer_record:
  고객 레코드의 지정된 필드만 수정한다(부분 업데이트 지원 — 전달하지 않은 필드는 기존 값 유지).
  수정 가능한 필드: email, phone, billing_address, marketing_opt_in 뿐이다.
  그 외 필드(id, created_at, credit_score)는 읽기 전용이며 전달 시 요청 전체가 거부된다.
  존재하지 않는 customer_id면 404 오류를 반환하며 아무것도 변경하지 않는다.
```

### 스키마 자체도 정확하게
- 필수/선택, 타입, 열거값(enum), 형식(날짜 등)을 정확히 선언.
- 오류는 **분류 가능하고 행동 지침이 담기게** 반환.

### 주의할 오해
- **모든 필드를 required로 강제하는 것은 해법이 아닙니다.** 부분 업데이트 기능 자체가 사라지고, 모델은 모르는 필드까지 억지로 채워 넣어야 해서 오히려 환각이 늘어납니다.
- **도구 선언 순서**는 스키마에 없는 필드를 지어내는 현상과 무관합니다.
- **camelCase / snake_case 명명 규칙** 차이도 "존재하지 않는 필드를 창작"하는 원인이 아닙니다. 스키마에 적힌 이름을 그대로 쓰면 되는 문제입니다.
- **런타임 검증은 설명을 대체하지 못합니다.** 검증을 전부 런타임 오류 핸들러로 미루면 오류는 **호출한 뒤에야** 발생합니다. 사전에 막을 수 있는 실패를 사후 처리로 미루는 것은 왕복(round trip)과 토큰만 늘립니다.
- **설명을 더 줄이는 것**은 정반대 방향입니다. 정보 부족이 원인인데 정보를 더 없애는 것입니다.

---

## 1.6 시스템 프롬프트와 도구 선택의 관계

### 시스템 프롬프트란
대화 전체에 걸쳐 모델의 역할·규칙·정책을 규정하는 최상위 지시문입니다. 사용자 메시지보다 강한 권위를 갖도록 학습되어 있습니다.

### 프롬프트 한 줄이 도구 선택을 뒤집는다
시스템 프롬프트에 이런 문장이 있다고 합시다.

> "If in doubt, use the search tool." (확신이 없으면 검색 도구를 써라)

그러면 사내 문서 검색(`lookup_internal_docs`)이 훨씬 적절한 질문에도 모델이 웹 검색(`search_web`)을 호출하기 시작합니다. 이것은 **모델의 결함이 아닙니다.** 모델은 지시를 충실히 따른 것입니다.

### 앵커링 / 키워드 연관 편향
도구 설명이 정확해도, 상위 계층인 시스템 프롬프트의 **문구가 특정 도구 쪽으로 모델을 끌어당길 수 있습니다.**

예: 프롬프트에 "Always prefer **searching** for the most up to date information."이 있고 도구 이름이 `search_web`이라면, 모델은 'searching'이라는 단어와 `search_web`이라는 이름 사이의 어휘적 연관을 강하게 형성합니다. 그 결과 실제로는 `fetch_webpage_results`가 적절한 상황에서도 거의 항상 `search_web`을 고릅니다. 이를 **앵커링(anchoring) / 키워드 연관 편향**이라 합니다.

### 교훈
- 시스템 프롬프트의 명시적 지시는 모델 자체의 적합성 판단을 **덮어쓸(override) 수 있다.**
- 광범위한 기본 규칙("애매하면 X를 써라")은 강력하지만 **부작용이 크다.**
- 특정 도구명과 겹치는 동사·명사를 무심코 쓰면 안 된다.
- 규칙을 쓸 거라면 **조건을 좁혀야** 한다.
  - 좋은 예: "For questions about internal policies, products, or runbooks, use `lookup_internal_docs` first. Use `search_web` only for public, external information."
  - 도구 중립적 표현: "필요하면 최신 정보를 확보하되, 어떤 도구가 적절한지는 각 도구 설명을 근거로 판단할 것."

---

## 1.7 흔한 실패와 잘못된 진단

### 중복 설명 문제를 잘못 진단하는 방식
| 잘못된 진단 | 사실 |
|---|---|
| "컨텍스트 창이 부족해서" | 도구 정의 두 개는 수백 토큰 수준이라 컨텍스트 한계와 무관 |
| "사용자 프롬프트가 모호해서" | 원인은 개발자가 작성한 도구 정의 쪽. 사용자가 아무리 명확히 말해도 두 도구가 구분되지 않으면 정확히 고를 수 없음 |
| "도구 배열의 선언 순서 때문에" | 순서를 바꾸면 앞쪽 도구로 편향이 생길 뿐, 모호성 자체는 사라지지 않음 |
| "JSON 스키마 오류 때문에" | 스키마가 완벽해도 프롬프트 편향 때문에 밀려날 수 있음 |

### 존재하지 않는 메커니즘 (자주 나오는 오해)
- 병렬 도구 사용 시 특정 도구가 자동으로 걸러지는 메커니즘은 **없습니다.**
- 도구 스키마 안에 개별 `temperature` 값을 넣는 필드는 **없습니다.** temperature는 모델 호출 단위의 샘플링 파라미터이지 도구별 속성이 아닙니다.
- 설명이 일정 토큰 길이를 넘으면 모델이 그 도구를 체계적으로 회피한다는 임계값은 **없습니다.**
- "도구 이름에 'search'가 들어가면 무조건 우선"이라는 규칙 같은 건 **없습니다.** 선택은 이름·설명·프롬프트 맥락의 종합 결과입니다.

### 도구 설계 일반 원칙 요약
- 이름은 **의미가 드러나게**, `동사_명사` 형태로.
- 설명에는 **입력 형식 + 예시 + 범위 밖 + 이웃 도구와의 경계**.
- 스키마에 필수/선택, 타입, 열거값, 형식(날짜 등)을 정확히 선언.
- 오류는 **분류 가능하고 행동 지침이 담기게**.
- 비슷한 도구가 둘 이상이면 반드시 **상호 배타적 조건**을 명시.
- 도구가 추가되면 **기존 도구의 이름과 설명도 함께 갱신**.
- 개별 수정이 아니라 **설명 템플릿 표준화**로 재발을 구조적으로 막는다.
