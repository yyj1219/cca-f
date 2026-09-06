# 3. 구조화된 출력과 스키마 설계

이 장에서 다루는 것:

- 왜 구조화된 출력이 필요한가 — 프롬프트로 부탁하기 vs 도구 호출(Tool Use) vs strict 모드
- JSON Schema 기초와 주요 키워드 (`type`, `properties`, `required`, `enum`, `pattern`, `format`, `description`)
- 스키마 설계 원칙 — 필드 세분화, 중첩, enum, required, nullable, 추출과 정규화의 분리
- 환각(Hallucination)을 강제하지 않는 스키마 설계 — 탈출구 값, optional/null, 출처 메타데이터
- 검증(Validation)의 계층 — 구조 검증 / 의미·비즈니스 검증 / 교차 검증 / Self-Correction 루프 / Human-in-the-Loop
- 흔한 스키마 설계 실패와 오답 패턴

---

## 3.1 왜 구조화된 출력인가

LLM의 기본 출력은 자유 형식 텍스트입니다. 그러나 실무 파이프라인은 모델의 답을 프로그램이 파싱해서 DB에 넣거나 다음 단계로 넘겨야 합니다. 그러려면 출력이 **기계가 읽을 수 있는 형식(주로 JSON)** 이어야 합니다. JSON은 `{"key": "value"}` 형태의 데이터 표기법이고, 괄호 하나만 어긋나도 파싱이 실패합니다.

구조화된 출력(Structured Output)이란 모델의 답을 자유 문장 대신 **정해진 JSON 형태**로 받는 기법입니다. 문서에서 정보를 뽑아 데이터베이스에 넣는 추출 파이프라인(extraction pipeline)에 필수적입니다.

```json
{
  "account_number": "1234-5678",
  "usage_details": {
    "meter_reading": 4821,
    "billing_period": "2026-04"
  },
  "billing_address": "서울시 ...",
  "service_address": "서울시 ..."
}
```

### 방법 1: 자연어로 부탁하기 (프롬프트 전용) — 취약함

```
JSON으로만 응답하라. 다른 말은 절대 붙이지 마라.
```

이 방식의 실패 양상:

- **사족 텍스트(stray commentary)**: "물론입니다! 요청하신 JSON입니다:" 같은 서문/후문이 붙습니다.
- **깨진 괄호(malformed brackets)**: 중괄호나 따옴표가 빠지거나 쉼표가 남습니다.
- **필드 누락**: 필수 필드를 빠뜨립니다.

근본 원인은 이것이 **확률적 텍스트 생성일 뿐, 형식에 대한 기술적 보장이 아니기** 때문입니다.

부분적 완화책들과 그 한계:

| 시도 | 하는 일 | 왜 부족한가 |
|---|---|---|
| 시스템 프롬프트를 더 엄격하게 쓰고 실패 시 재시도 | 실패 확률을 낮추고 실패 시 다시 시도 | 근본 원인 미해결. 비용과 지연시간(latency) 증가 |
| `temperature`를 0으로 낮추기 | 출력을 결정론적으로 만들어 변동성 축소 | 결정론적이라고 문법이 옳은 건 아니다. 구문 오류를 차단하지 못함 |
| 백틱(```` ``` ````)으로 감싸게 하고 후처리로 제거 | 코드블록 경계로 사족을 잘라냄 | 백틱 안쪽 JSON 자체의 문법 오류는 그대로 남음 |

> **temperature란**: 다음 토큰을 고를 때의 무작위성 정도를 조절하는 파라미터. 0이면 가장 확률 높은 토큰만 고르고, 높이면 다양성이 늘어납니다. **형식 보장 장치가 아닙니다.**

### 방법 2: 도구 호출 (Tool Use / Function Calling) — 권장

신뢰할 수 있는 JSON을 얻는 정석입니다.

**개념**: 모델에게 자유 텍스트를 쓰게 하는 대신, **호출 가능한 "도구"를 정의**하고 그 도구의 **입력 인자를 채우게** 합니다. 그 인자는 API가 구조화된 블록으로 돌려주므로, 우리는 텍스트를 파싱할 필요 없이 그 값을 그대로 씁니다.

**핵심 구성 요소**:

- `tools`: 요청에 첨부하는 도구 정의 목록
- `input_schema`: 각 도구가 받는 인자를 기술한 **JSON Schema**. 필드 이름, 타입, 필수 여부, 설명을 담습니다
- `tool_use`: 응답에 담겨 오는 콘텐츠 블록. 모델이 어떤 도구를 어떤 인자로 부르고 싶은지가 들어 있습니다
- `tool_result`: 우리가 도구를 실제로 실행한 뒤 모델에게 돌려주는 결과 블록

예시(지원 티켓 분류 추출):

```python
tools = [{
    "name": "record_ticket",
    "description": "지원 티켓의 분류 결과를 기록한다",
    "input_schema": {
        "type": "object",
        "properties": {
            "priority": {"type": "string", "enum": ["low", "medium", "high"]},
            "category": {"type": "string"},
            "summary":  {"type": "string", "description": "한 문장 요약"}
        },
        "required": ["priority", "category", "summary"]
    }
}]
```

응답에서 `tool_use` 블록의 `input`을 그대로 꺼내면 이미 파싱된 딕셔너리입니다.

**"추출용 도구(extraction tool)" 패턴**: 실제로 실행할 함수가 없어도 됩니다. 스키마를 강제하기 위한 껍데기 도구를 정의해두고, 모델이 그것을 호출하게 만들어 인자만 받아 쓰는 방식이 널리 쓰입니다.

```json
{
  "name": "record_transaction",
  "description": "PDF 내역서에서 추출한 거래 한 건을 기록한다.",
  "input_schema": { "...출력 스키마..." }
}
```

### 방법 3: 엄격한 도구 사용 (Strict Tool Use, `strict: true`)

도구 호출에 **strict 옵션(엄격한 적용)** 을 켜면, API가 **서버 측에서 디코딩 단계에 스키마를 강제**합니다. 즉 스키마에 맞지 않는 토큰은 애초에 생성될 수 없습니다. 구문 오류와 필수 필드 누락이 **구조적으로 차단**됩니다.

따라서 지저분한 스캔 문서 같은 어려운 입력에서도:

- **strict tool_use**: 스키마 준수가 보장됨. 별도의 JSON 복구(JSON-repair) 라이브러리가 필수적이지 않음
- **프롬프트 전용 JSON 요청**: 여전히 유효하지 않은 구문이나 필드 누락으로 벗어날 수 있음

`strict: true`가 **보장하는 것은 딱 두 가지뿐**입니다.

- **구조 적합성(structural conformance)** — 필드 구성이 스키마와 일치
- **타입 적합성(type conformance)** — 각 값의 데이터 타입이 일치

**보장하지 않는 것:**

- 값이 원본 문서에 실제로 있던 사실인지 (환각 방지 아님)
- 값이 비즈니스적으로 말이 되는지

예: `quantity`가 `integer`여야 한다고 했을 때 `-99999`나 `1000000`도 스키마는 통과합니다. 창고에 100만 개가 있을 리 없다는 판단은 스키마가 못 합니다. `strict: true`는 내부적으로 원본을 다시 읽어 의미를 재확인하는 기능이 **아니며**, 필드 타입이 숫자라는 이유로 검증이 면제되는 것도 아닙니다.

> `tool_choice`(도구 호출 여부·대상을 제어하는 파라미터)는 4장에서 다룹니다. 여기서 기억할 점은 하나입니다: `tool_choice`는 **호출 여부(형식)만 강제할 뿐, 인자 값의 내용이 옳은지는 보장하지 않습니다.** 정보가 없는 상황에서 강제 호출을 걸면 모델은 오히려 값을 지어냅니다.

**흔한 오해 정리:**

- "두 방식은 어차피 같은 모델이 해석하니 신뢰도가 동등하다" → 아닙니다. 한쪽은 확률적 생성, 다른 쪽은 디코딩 제약입니다.
- "도구 정의가 붙으면 프롬프트가 길어져서 오히려 불리하다" → 아닙니다. 형식 보장 이득이 압도적입니다.

---

## 3.2 JSON Schema 기초와 주요 키워드

**JSON Schema**는 "이 JSON은 이렇게 생겨야 한다"를 기계가 읽을 수 있게 적어둔 명세서입니다. 어떤 필드가 있어야 하는지, 각 필드의 타입은 무엇인지, 값의 제약은 무엇인지를 정의합니다.

```json
{
  "type": "object",
  "properties": {
    "amount":           { "type": "number" },
    "currency":         { "type": "string", "enum": ["USD", "EUR", "KRW"] },
    "transaction_type": { "type": "string", "enum": ["deposit", "withdrawal"] },
    "ship_date":        { "type": "string", "description": "운송업체가 명시한 발송일 문자열" }
  },
  "required": ["amount", "currency", "transaction_type"]
}
```

주요 키워드:

| 키워드 | 뜻 |
|---|---|
| `type` | 값의 타입 (`string`, `number`, `integer`, `boolean`, `object`, `array`, `null`) |
| `properties` | 객체가 가질 수 있는 필드들의 정의 |
| `required` | 반드시 있어야 하는 필드 이름 목록 |
| `description` | 사람과 모델이 읽는 설명문. LLM에게는 사실상 "필드별 미니 프롬프트" 역할 |
| `enum` | 허용되는 값의 목록을 한정 (예: `["stated", "estimated", "unknown"]`) |
| `pattern` | 문자열이 만족해야 할 정규표현식 |
| `format` | 의미적 형식 힌트 (예: `date`, `email`) |
| `minimum` / `maximum` | 숫자 범위 제약 |

정리하면 스키마가 표현할 수 있는 것은 다음과 같습니다.

- 필드의 **데이터 타입**(number, string, boolean, array, object)
- **필수 필드(required)** 여부
- 허용값 목록(**enum**), 숫자 범위(minimum/maximum), 문자열 패턴(pattern, 정규식)
- 중첩 구조, 배열 원소의 타입

### 중첩(Nesting)과 부모 객체(Parent object)

JSON은 객체 안에 객체를 넣을 수 있습니다. 이를 중첩이라고 합니다.

```json
{
  "type": "object",
  "properties": {
    "usage_details": {
      "type": "object",
      "properties": {
        "meter_reading": { "type": "number" }
      },
      "required": ["meter_reading"]
    }
  }
}
```

`meter_reading`이 `usage_details` 안에 들어가야 하는데 `billing_address` 안에 들어갔다면, **값 자체는 맞지만 위치가 틀린 것**입니다. 이런 실수를 "잘못된 부모 객체 아래 중첩되었다"고 표현합니다.

---

## 3.3 스키마 설계 원칙

### 3.3.1 필드 세분화(Granularity) — 나중에 물어볼 질문을 답할 해상도로 기록하라

출력 스키마의 각 필드를 **얼마나 잘게** 기록할지는 나중의 분석 능력을 결정합니다.

예: 코드 검토 어시스턴트가 발견 항목마다 `detected_pattern` 필드를 기록한다고 할 때,

- **거친 범주(coarse)**: `"security"`
- **구체적 트리거(fine-grained)**: `"regex:sql_concat_v3"`, `"function:eval"`, `"decorator:@app.route_without_auth"`, `"sanitize_input_helper_call"`

**왜 세분화가 중요한가 — 피드백 루프**: 개발자가 경고를 **기각(dismiss)** 하는 행동은 오탐의 신호입니다. 하지만 `"security"`로만 기록해두면 "보안 경고 기각률 40%"라는 사실만 남고, **어떤 규칙이 범인인지 알 수 없습니다.** 구체적 규칙 단위로 기록하면 "`regex:sql_concat_v3`의 기각률이 90%"라는 식으로 **원인을 격리(isolate)** 하여 그 규칙만 수정할 수 있습니다.

```json
"detected_pattern": {"type": "string", "example": "sanitize_input_helper_call"}
```

이 필드가 있으면 `SELECT detected_pattern, COUNT(*) FROM findings WHERE dismissed = true GROUP BY detected_pattern` 같은 집계가 가능해집니다.

**흔한 잘못된 반론과 나쁜 대안**:

- "대시보드가 렌더링하기 쉬우려면 값 종류가 적어야 한다" → 세밀한 데이터는 나중에 **집계(group by)** 해서 거칠게 만들 수 있지만, 거친 데이터를 나중에 세밀하게 되돌릴 수는 없습니다. 표현 편의를 위해 데이터 해상도를 버리는 것은 잘못된 설계입니다.
- "심각도(severity) 필드로 분석하면 된다" → 심각도는 "얼마나 위험한가"이지 "어떤 규칙이 발동했는가"가 아니므로 원인 추적에 쓸 수 없습니다.
- 발견 사항당 **단일 종합 신뢰도 점수만** 두고 어떤 규칙이 만들었는지 기록하지 않으면 → 원인 추적 불가.
- **자유 텍스트 코멘트**만 두면 → 검토자마다 표현이 달라 그룹화·집계 불가.
- 모든 경고의 severity를 일괄 상향 → 분석과 무관하고 알림 피로만 가중.

**원칙**: 집계하고 싶은 축은 반드시 **범주형(categorical) 필드**로 저장하라. 자유 텍스트는 분석 단위가 될 수 없다. 로그와 메타데이터는 나중에 물어볼 질문을 답할 수 있는 해상도로 기록하라. 집계는 나중에 해도 되지만, 기록하지 않은 정보는 영원히 복구되지 않는다.

### 3.3.2 enum(열거형) 설계

`enum`은 필드가 가질 수 있는 값을 미리 정해진 목록으로 제한합니다(**closed enum, 폐쇄형 열거형**). 장점은 값이 정규화되어 후속 처리가 쉬워진다는 것입니다.

```json
{ "governing_law": { "enum": ["California", "New York", "Delaware"] } }
```

문제는 **현실이 목록보다 지저분하다**는 것입니다. 목록에 안 맞는 데이터가 섞이면 모델은 답을 내야 하므로 **가장 비슷해 보이는 값에 억지로 끼워 맞춥니다(forced fitting).** 그러면 잘못된 라벨이 조용히 데이터에 섞여 기존 카테고리 통계까지 오염됩니다.

**해법 1 — 탈출구(escape hatch) 값을 enum에 추가한다.**

계약서에서 준거법(governing_law)을 뽑는다고 합시다. 현실은 셋 중 하나입니다.

1. 명시적으로 적혀 있다.
2. 두 사법권에 걸쳐 모호하게 암시된다.
3. 아예 언급이 없다.

enum에 구체적인 사법권 이름만 있으면 2번과 3번에서도 모델은 **억지로 하나를 골라야 합니다.** 이것이 바로 환각을 강제하는 구조입니다. 출력은 형식상 유효하지만 내용은 거짓입니다.

```json
{ "governing_law": { "enum": ["California", "New York", "Delaware", "unclear"] } }
```

이제 모델은 확신이 없을 때 `"unclear"`를 선택할 수 있고, 파이프라인은 "확실히 식별된 데이터"와 "사람이 확인해야 할 데이터"를 깔끔하게 나눌 수 있습니다. `"unknown"`, `"not_stated"`처럼 상황을 더 세분화한 값을 두어도 좋습니다.

**해법 2 — `other` 값과 자유 텍스트 상세 필드를 짝지어 둔다.**

```json
"category":        {"enum": ["billing","technical","shipping","account","refund","other"]},
"category_detail": {"type": "string", "description": "category가 other일 때 실제 내용"}
```

애매한 건이 `other`로 격리되어 5개 정상 카테고리가 깨끗하게 유지되고, `category_detail`을 나중에 분석해 새 카테고리를 만들 근거로 쓸 수 있습니다.

**피해야 할 대안들:**

- **enum을 없애고 완전 자유 텍스트로** → 표기가 제각각이 되어 집계 불가.
- **`strict`를 끄고 필드를 생략하게** → 데이터에 구멍이 생기고 감사가 불가능.
- **`miscellaneous_unclear_ticket_type_pending_manual_review` 같은 장황한 값 하나만 추가** → **상세 내용을 담을 자유 텍스트 필드가 없어** 왜 애매했는지 알 수 없음.
- **필드를 boolean으로 바꾸기**("사법권이 언급되었는가 예/아니오") → **어느 사법권인지라는 핵심 정보를 잃습니다.** 모호성을 없애려다 유용성을 버리는 것입니다.
- **모든 값을 `ambiguous_California`처럼 접두사 붙여 복제하기** → enum 크기가 2배가 되어 복잡해지고, **아예 언급이 없는 경우**를 표현할 값이 여전히 없습니다.
- **강제로 고르게 만들기(`tool_choice`로 강제)** → 문제를 악화시킬 뿐입니다. 모호성 문제의 해법은 강제가 아니라 스키마에 "unclear" 같은 값을 두는 것입니다.

### 3.3.3 엄격한 제약의 함정 — 추출과 정규화의 역할 분리

스키마에 `pattern`으로 강한 정규표현식을 걸면 직관적으로는 "안전해 보입니다". 그러나 **원본 데이터의 형식이 제각각일 때는 오히려 실패율을 폭증시킵니다.**

예: 물류 회사가 여러 운송업체로부터 배송 확인 이메일을 받는데, 날짜가 이렇게 옵니다.

- `03/14/2026` (미국식 MM/DD/YYYY)
- `14-Mar-2026` (유럽식 + 월 이름)
- `2026.03.14` (점 구분 ISO 유사형)

스키마가 `ship_date`에 대해 ISO 8601(`YYYY-MM-DD`) 정규표현식을 강제하면, 모델이 원본을 정확히 읽어냈더라도 형식이 안 맞아 계속 검증 실패가 납니다.

> **ISO 8601**: 날짜/시간의 국제 표준 표기. 날짜는 `YYYY-MM-DD` (예: `2026-03-14`).

**모범 사례는 "LLM에게는 느슨하게 뽑게 하고, 형식 통일은 결정론적 코드가 한다"입니다(decoupling extraction and normalization).**

1. **추출 단계**: 스키마의 `ship_date` 제약을 **평범한 문자열(`type: "string"`)로 완화(loosen)** 한다 → 모델은 원문 날짜를 실패 없이 그대로 가져온다.
2. **후속 처리(Downstream Processing) 단계**: 검증된 **날짜 파서(date parser)** 라이브러리로 ISO 8601로 **정규화(normalization)** 한 뒤 DB에 저장한다.

```python
from dateutil import parser  # 결정론적 date parser

raw = extracted["ship_date"]                  # "14-Mar-2026" 같은 원본 문자열
iso = parser.parse(raw).date().isoformat()    # "2026-03-14"
db.insert(ship_date=iso)
```

왜 이게 더 나은가:

- **결정론적(deterministic)**: 날짜 파서는 같은 입력에 항상 같은 출력을 냅니다. LLM은 확률적(probabilistic)이라 매번 같으리란 보장이 없습니다.
- **실패 지점 축소**: LLM은 "읽기"만 담당하고, "형식 맞추기"라는 별개의 부담을 지지 않습니다.
- **유지보수**: 새 날짜 형식이 등장해도 파서 라이브러리가 대부분 흡수하며, 스키마는 손댈 필요가 없습니다.

**원칙**: LLM에게는 "원문에서 찾아오기"라는 잘하는 일을 시키고, "형식 변환"이라는 결정론적 작업은 일반 코드에 맡긴다. 결정론적 코드가 할 수 있는 일을 확률적 모델에 떠넘기지 않는다.

### 3.3.4 required와 nullable

`required`는 강력하지만 위험한 키워드입니다. 원본에 없을 수 있는 값을 `required`로 묶으면 모델은 값을 지어낼 수밖에 없습니다(다음 절 참조). 원본에 없을 수 있는 값이라면:

- `required` 목록에서 빼거나
- `"type": ["number", "null"]`처럼 **null을 허용**해서 "값이 없음"을 정직하게 표현할 자리를 만듭니다.

**원칙**: 스키마는 "원본 현실"을 표현할 수 있어야 합니다. 원본에 없을 수 있는 값이라면, 스키마에 "없음"을 표현할 자리를 만들어 주어야 합니다.

---

## 3.4 환각 방지를 위한 스키마 설계

**환각(Hallucination)** 은 모델이 근거 없는 정보를 그럴듯하게 만들어내는 현상입니다. 정보 추출에서는 "원본에 없는 값을 지어내는 것"으로 나타납니다.

### 3.4.1 `required` + `number` 조합이 환각을 유발하는 메커니즘

부동산 매물 추출 시나리오를 봅시다. 스키마가 이렇게 되어 있습니다.

```json
{
  "properties": { "square_footage": { "type": "number" } },
  "required": ["square_footage"]
}
```

그런데 오래된 매물 글에는 면적 숫자가 없고 "spacious with room to grow(널찍하고 여유 있음)" 같은 서술만 있습니다.

이때 모델은 딜레마에 빠집니다. 필드는 **필수(required)** 이고 타입은 **숫자(number)** 인데, 원본에는 숫자가 없습니다. 스키마를 만족시키려면 무언가 숫자를 넣어야 하고, 결국 **그럴듯한 값을 지어냅니다.** 즉, **과도하게 엄격한 스키마가 모델에게 환각을 강요하는 구조**입니다.

### 3.4.2 해법 1 — 필드를 선택적(optional) / nullable로

`required` 목록에서 빼거나 `null`을 허용하면, 모델은 "값이 없음"을 정직하게 표현할 수 있습니다. 지어낼 이유가 사라집니다.

```json
{
  "properties": {
    "square_footage": { "type": ["number", "null"] }
  },
  "required": []
}
```

### 3.4.3 해법 2 — 출처/신뢰도 메타데이터 필드 추가

값이 비었을 때 "왜 비었는지"를 구별하지 못하면 다운스트림 리포트가 곤란해집니다. 그래서 **`enum` 타입의 출처(source) 필드**를 함께 둡니다.

```json
{
  "properties": {
    "square_footage": { "type": ["number", "null"] },
    "square_footage_source": {
      "type": "string",
      "enum": ["stated", "estimated", "unknown"],
      "description": "stated=원문에 명시됨, estimated=문맥에서 추정, unknown=정보 없음"
    }
  }
}
```

이렇게 하면 리포트에서 **확인된 값(stated)** 과 **부재/추정 값**을 명확히 분리해 집계할 수 있습니다. 두 변경(**optional 전환 + source enum 추가**)이 **함께** 작동해야 환각도 막고 데이터 품질도 지킵니다.

### 3.4.4 흔한 오답 패턴과 이유

- **숫자 필드를 문자열로 바꾸고 "N/A" 넣기** — 필드는 항상 채워지지만, 다운스트림에서 평균/합계 같은 수치 연산을 할 때 타입 오류가 납니다. 데이터 품질이 오히려 나빠집니다.
- **`number` 필수 필드에 "N/A"를 출력하라고 시스템 프롬프트로 지시** — 스키마 타입 검증에서 즉시 실패합니다. **프롬프트 지시는 스키마 타입을 이길 수 없습니다.**
- **필드를 빼고 정규표현식 스크립트로 대체** — 모호한 서술문("널찍한")의 문맥을 정규표현식이 이해할 리 없으며, LLM 추출의 장점을 통째로 버리는 선택입니다.
- **문제가 되는 필드를 스키마에서 삭제하기** — 오류를 없애는 게 아니라 **요구사항 자체를 포기**하는 것입니다.

---

## 3.5 검증(Validation) 계층

검증은 하나가 아니라 **여러 계층**입니다. 구조 검증(스키마)과 의미 검증(비즈니스 규칙)은 서로 다른 계층이며, 둘 다 필요합니다.

| 계층 | 무엇을 보는가 | 도구 |
|---|---|---|
| 1. 구조/타입 검증 | 필드 존재, 타입, enum, pattern, format | JSON Schema, `jsonschema`, `pydantic`, strict tool use |
| 2. 의미·비즈니스 검증 | 필드 간 정합성, 값의 타당성 | 평범한 애플리케이션 코드 |
| 3. 교차 검증 | 중복 추출한 정보끼리 대조 | 산술 일치성 검사 |
| 4. Self-Correction 루프 | 위반 내용을 피드백해 재추출 | 재시도 + 피드백 프롬프트 |
| 5. Human-in-the-Loop | 코드로도 모델로도 못 푸는 건 | 사람에게 이관 |

### 3.5.1 계층 1 — 스키마 검증

**검증기(Validator)** 는 LLM이 뱉은 JSON을 스키마와 대조해서 통과/실패를 판정하는 프로그램입니다. Python이면 `jsonschema`, `pydantic` 같은 라이브러리를 씁니다.

```python
from jsonschema import validate, ValidationError

try:
    validate(instance=model_output, schema=SHIPMENT_SCHEMA)
except ValidationError as e:
    print("검증 실패:", e.message)   # 예: "'14-Mar-2026' does not match ISO 패턴"
```

검증에 실패하면 그 응답은 파이프라인에서 거부됩니다. 즉 **아무리 모델이 올바른 정보를 읽어냈어도, 형식이 스키마와 안 맞으면 그 추출은 실패로 처리됩니다.** 그리고 실패 시 나오는 **어떤 필드가 어떻게 잘못됐는지에 대한 오류 메시지**는 뒤에 나오는 오류 피드백 재시도의 재료가 됩니다.

### 3.5.2 스키마가 잡아주는 것과 못 잡는 것 — 가장 중요한 구분

| | 잡아준다 | 못 잡는다 |
|---|---|---|
| 필드가 빠졌는가 | O | |
| 타입이 맞는가(숫자 자리에 문자열) | O | |
| enum에 없는 값인가 | O | |
| 날짜 문자열 형식이 맞는가 | O | |
| 값이 **원본 문서의 실제 내용과 일치하는가** | | X |
| 두 필드 사이의 **의미적 정합성** | | X |
| 값이 **비즈니스적으로 말이 되는가** | | X |

**구문/구조 오류(Schema Violation) vs 의미론적 오류(Semantic Error)**

- **스키마 위반**: `amount`가 없다, `amount`에 `"삼천"`이 들어왔다 → 검증기가 에러를 냅니다.
- **의미론적 오류**: `amount`는 정상적인 숫자 `50000`이고 필수 필드도 다 있는데, **원본에는 입금(deposit)인데 출금(withdrawal)으로 라벨링**되었다. 또는 원본이 EUR인데 통화 기호를 잘못 읽어 USD로 기록되었다. 영수증 실제 금액이 `428.40`인데 `"total": 128.40`으로 읽혔다.

두 번째 경우 **스키마 검증은 아무 불평 없이 통과합니다.** 이것이 구조화 출력의 근본적 한계입니다. 스캔 문서, OCR, 흐릿한 인쇄물에서는 이런 **형식은 통과하는 잘못된 값(plausible but wrong value)** 이 반드시 생깁니다.

또한 스키마는 **필드들 사이의 논리적 관계**를 보장하지 못합니다. `start_date`와 `end_date`가 각각 올바른 날짜 문자열이더라도, `end_date < start_date`인 논리적 모순은 타입 검증으로 절대 잡히지 않습니다. 이런 규칙을 **비즈니스 규칙(business rule) / 논리 제약(logic constraint)** 이라고 부릅니다.

```json
{
  "type": "object",
  "properties": {
    "start_date": {"type": "string", "format": "date"},
    "end_date":   {"type": "string", "format": "date"}
  },
  "required": ["start_date", "end_date"]
}
```

**전형적인 오답 패턴** — 의미론적 오류를 만났을 때 다음은 모두 틀린 진단입니다.

- "스키마 위반이다" → 아니다. 타입도 필수 조건도 다 만족했다.
- "strict mode를 켜면 된다 / 스키마를 더 잘 짜면 된다" → 아니다. JSON Schema는 원본 문서를 읽지 않으므로 원본 대비 정확성을 검증할 방법이 없다.
- "`tool_choice`로 강제하면 된다" → 아니다. 호출 여부와 인자 내용의 진위는 별개다.
- "`max_tokens`를 늘리면 된다" → 아니다. 잘림(truncation) 문제가 아니다.

> **`max_tokens`와 잘림(Truncation)**: `max_tokens`는 모델이 한 번의 응답에서 **생성할 수 있는 최대 출력 토큰 수**입니다. 이 한도에 도달하면 응답이 문장 중간에서 끊깁니다. 증상은 명확합니다 — **JSON이 닫히지 않은 채 끝남, 배열이 중간에서 잘림, 파싱 에러.** 따라서 다음은 `max_tokens`와 **무관**합니다: JSON이 완전한 형태로 나왔는데 값이 틀린 경우(→ 의미론적 오류), 원본에 정보가 없어서 빈 값이 나온 경우(→ 데이터 부재), 합계가 안 맞는 경우(→ 원본 데이터 오류이거나 계산 오류).

### 3.5.3 계층 2 — 의미론적/비즈니스 검증 계층

스키마 검증 **뒤에** 별도의 검증 단계를 둡니다. 이것은 LLM이 아니라 보통 평범한 코드로 씁니다.

```python
def cross_check(record, source_text):
    # 통화 기호와 금액 표기를 대조
    if record["currency"] == "USD" and "€" in source_text:
        raise SemanticError("통화 기호 불일치")
    # 거래 유형과 부호 대조
    if record["transaction_type"] == "deposit" and record["amount"] < 0:
        raise SemanticError("입금인데 금액이 음수")
```

**비즈니스 타당성 검사(business-plausibility check)** 도 같은 계층입니다.

```python
def validate(rec):
    q = rec["quantity"]            # strict:true 덕분에 int인 건 확실
    assert 0 < q <= MAX_PER_SHIPMENT, "implausible quantity"
```

### 3.5.4 계층 3 — 교차 검증 / 산술 일치성 검사

**중복된 정보를 함께 추출한 뒤 서로 맞는지 대조**하는 것이 정석입니다.

영수증 예시:

1. **개별 품목 가격(line items)** 을 전부 추출한다
2. **인쇄된 합계(printed total)** 도 추출한다
3. 품목 합을 더해 `calculated_total`을 **코드로 계산**한다
4. `calculated_total`과 `printed_total`이 어긋나는(diverge) 레코드에 **플래그를 세운다**

```python
calculated_total = sum(item["price"] for item in record["line_items"])
if abs(calculated_total - record["printed_total"]) > 0.01:
    record["needs_review"] = True
```

같은 원리를 다른 곳에도 적용할 수 있습니다: 소계+세금 = 합계, 시작일 < 종료일, 개수 × 단가 = 금액 등.

**하면 안 되는 것들:**

- **품목 추출을 생략해 파이프라인을 빠르게 만들기** — 대조할 근거를 스스로 없애는 것입니다. 속도를 위해 검증을 버리는 교환입니다.
- **추출된 값을 그대로 믿기** — 문제를 방치하는 것입니다.
- **모델이 "더 그럴듯한 값"으로 조용히 덮어쓰게 하기(silently overwrite)** — 가장 위험합니다. 원본과 대조할 수 없게 되어 **감사 추적(audit trail)** 이 사라지고, 모델의 추측이 새로운 오류를 만듭니다. **원본 값은 항상 보존하고, 의심 사항은 덮어쓰지 말고 플래그로 표시해 사람이 보게 합니다.**

### 3.5.5 계층 4 — Self-Correction 루프 (검증 → 피드백 → 재시도)

논리 제약은 **코드로 직접 검사**하고, 위반 시 그 내용을 **피드백 메시지로 만들어 모델에 다시 요청**하는 것이 표준 패턴입니다. 이를 자기 수정(self-correction) 루프 또는 피드백 루프라고 합니다.

```python
MAX_RETRIES = 3

def extract_with_check(text):
    feedback = None
    for attempt in range(MAX_RETRIES):
        data = call_model(text, feedback)          # feedback 이 있으면 프롬프트에 덧붙임
        if data["end_date"] >= data["start_date"]:
            return data                            # 검증 통과
        feedback = (f"직전 출력의 end_date({data['end_date']})가 "
                    f"start_date({data['start_date']})보다 앞섭니다. "
                    f"원문을 다시 확인해 계약 기간의 순서를 바로잡아 주세요.")
    return None                                    # 한도 소진 → 사람에게 이관
```

핵심 포인트:

- 검증은 **추출 이후에 코드가** 수행한다 (결정적이고 신뢰할 수 있음)
- 재시도 시 **무엇이 왜 틀렸는지를 구체적으로** 알려 준다. 단순 재요청보다 훨씬 성공률이 높다
- 프롬프트에 "날짜에 주의하라"고 한 번 적어 두는 것만으로는 부족하다. 확률적 생성 모델은 지시를 항상 지키지 않으므로 **사후 검증이 반드시 필요**하다

### 3.5.6 계층 5 — 재시도 한계와 Human-in-the-Loop

재시도 루프에는 반드시 **최대 재시도 횟수(maximum retries)** 가 있어야 합니다. 그리고 더 중요한 것은 **실패 원인의 구분**입니다.

| 실패 유형 | 원인 | 올바른 대응 |
|---|---|---|
| 구조적 실패 | 형식 위반, 필드 누락, 논리 제약 위반 — 정보는 원본에 있음 | 피드백 재시도로 해결 가능 |
| 원본 데이터 부재 (genuinely absent) | 애초에 원본에 그 정보가 없음 | 재시도 중단, **사람에게 이관** |

예: 스캔된 경비 보고서에서 직원이 프로젝트 코드 칸을 아예 비워 뒀다면, 이미지 어디에도 그 값이 없습니다. 이때 재시도를 계속하면:

- 프롬프트/스키마를 아무리 정교하게 다듬어도 없는 데이터가 생기지 않고
- 온도를 올리면 모델이 그럴듯한 코드를 **지어낼(환각) 확률만 커지며**
- 더 큰 모델로 바꿔도 마찬가지입니다

따라서 재시도를 멈추고 해당 건을 예외로 표시해 담당자에게 넘기는 **Human-in-the-Loop(사람 개입)** 설계가 정답입니다. 잘 만든 파이프라인은 "실패를 조용히 채워 넣지" 않고 "실패를 사람에게 드러냅니다".

---

## 3.6 흔한 스키마 설계 실패 정리

| 실패 패턴 | 왜 나쁜가 | 올바른 대안 |
|---|---|---|
| 엄격한 `pattern`으로 형식까지 모델에게 떠넘김 | 원본 형식이 제각각이면 검증 실패 폭증 | `type: string`으로 완화 + 다운스트림 파서로 정규화 |
| 형식마다 필드 쪼개기 (`ship_date_us`/`_eu`/`_iso`) | 데이터 모델 파편화, 새 형식마다 스키마 수정 | 단일 필드 + 파싱 계층 |
| 문제 필드를 아예 제거하고 나중에 추론 | 본문에 있는 데이터를 버리고 외부 API 조회 등 불필요한 복잡도·비용 | 필드는 유지하고 제약만 완화 |
| 엄격한 제약은 두고 `description`으로만 지시 | `description`은 **유도이지 보장이 아님**. 검증기 판정을 대신하지 못함 | 제약 자체를 현실에 맞게 조정 |
| 원본에 없을 수 있는 값을 `required` + `number`로 | 모델에게 환각을 강요 | optional/nullable + source enum |
| `number` 필드에 "N/A"를 넣게 프롬프트로 지시 | 스키마 타입 검증에서 즉시 실패 | `["number","null"]` |
| 숫자 필드를 문자열로 바꿔 "N/A" 수용 | 다운스트림 수치 연산에서 타입 오류, 데이터 품질 악화 | 위와 동일 |
| 탈출구 없는 폐쇄형 enum | 억지 끼워 맞추기(forced fitting)로 통계 오염 | `unclear`/`other` + 자유 텍스트 상세 필드 |
| enum 제거하고 자유 텍스트 | 표기 제각각, 집계 불가 | enum + `other` 폴백 |
| 값을 거친 범주로만 기록 | 원인 격리 불가, 되돌릴 수 없는 해상도 손실 | 세분화된 범주형 필드로 기록 후 집계 |
| 자유 텍스트 코멘트로 분석하려 함 | 표현이 제각각이라 그룹화 불가 | 범주형 필드 |
| 필드를 boolean으로 축소해 모호성 제거 | 핵심 정보(어느 값인지) 상실 | 탈출구 값 추가 |
| 의심스러운 값을 모델이 조용히 덮어쓰게 함 | 감사 추적 소멸, 새 오류 생성 | 원본 보존 + `needs_review` 플래그 |
| 검증 없이 스키마 통과만 믿음 | 의미론적 오류가 그대로 DB에 들어감 | 의미·비즈니스·교차 검증 계층 추가 |
| 없는 데이터를 재시도로 계속 캐냄 | 환각 확률만 상승 | 재시도 한도 + Human-in-the-Loop |

---
