# 사전학습 노트: 도구 설계와 MCP 통합 (tool 46-60 대비)

이 문서는 해당 범위의 문제들이 다루는 개념을 **아무 배경지식이 없는 상태**에서 읽고 이해할 수 있도록 정리한 것입니다. 크게 다섯 개의 큰 주제를 다룹니다.

1. LLM 에이전트와 도구(Tool) 호출의 기본 원리
2. 도구 설명(description)과 이름 설계 — 라우팅 신뢰성
3. 제약된 도구 설계와 권한/역할 분리
4. 구조화된 에러 설계
5. Anthropic Claude API 파라미터 (`tool_choice`, extended thinking)
6. MCP(Model Context Protocol)의 Tool / Resource 구분
7. Claude Code 내장 도구 (Read / Write / Edit / Grep / Glob / Bash) 사용법과 선택 기준

---

## 0. 출발점: LLM 에이전트와 "도구"란 무엇인가

### 0.1 LLM 은 원래 텍스트만 만든다

대규모 언어 모델(LLM, Large Language Model)은 입력된 텍스트를 보고 다음 텍스트를 생성하는 프로그램입니다. 그 자체로는 파일을 읽거나, 데이터베이스를 조회하거나, 서버에 배포를 할 수 없습니다. 모델은 "계산"할 수 있는 게 아니라 "말"할 수 있을 뿐입니다.

### 0.2 도구 호출(Tool Calling / Function Calling)

이 한계를 넘기 위해 만들어진 것이 **도구 호출**입니다. 개발자가 모델에게 "네가 쓸 수 있는 함수 목록"을 미리 알려주면, 모델은 필요할 때 "이 함수를, 이런 인자로 실행해 줘"라는 **구조화된 출력(JSON)** 을 냅니다. 실제 실행은 모델이 아니라 모델을 감싸고 있는 애플리케이션(에이전트 런타임)이 합니다.

전형적인 도구 정의는 이렇게 생겼습니다.

```json
{
  "name": "get_stock_price",
  "description": "Returns the latest publicly available market price for a given stock ticker. Public market data only; cannot access private accounts or user-specific information.",
  "input_schema": {
    "type": "object",
    "properties": {
      "ticker": { "type": "string", "description": "Stock ticker symbol, e.g. AAPL" }
    },
    "required": ["ticker"]
  }
}
```

세 부분이 핵심입니다.

- `name` — 도구의 식별자. 짧지만 의미를 담아야 합니다.
- `description` — **모델이 이 도구를 언제 쓸지 판단하는 유일한 근거**. 사람이 아니라 모델을 위한 문서입니다.
- `input_schema` — 인자의 형태를 정의하는 JSON Schema. 모델이 만들어 낼 수 있는 입력의 모양을 제한합니다.

### 0.3 전체 실행 루프

```
사용자 요청
  → 모델이 도구 목록 + description 을 읽음
  → 모델이 "어떤 도구를, 어떤 인자로" 호출할지 결정 (= 라우팅)
  → 런타임이 실제로 실행
  → 결과를 다시 모델에게 전달
  → 모델이 다음 행동을 결정하거나 최종 답변 생성
```

이 루프의 **결정 지점**이 두 곳입니다. 어떤 도구를 고를 것인가(도구 선택), 그리고 어떤 인자를 넣을 것인가(인자 추출). 이 범위의 내용 대부분은 "이 두 결정을 어떻게 하면 모델이 덜 틀리게 만들 수 있는가"에 관한 것입니다.

---

## 1. 도구 설명(Description)과 이름 설계 — 라우팅 신뢰성

### 1.1 라우팅(Routing)이란

여러 도구 중 상황에 맞는 하나를 고르는 모델의 판단을 **도구 라우팅**이라고 합니다. 라우팅이 실패하면 잘못된 도구가 실행되거나, 애초에 불가능한 작업을 시도하다 실패합니다.

모델이 라우팅에 쓸 수 있는 정보는 사실상 `name` + `description` + `input_schema` 뿐입니다. 그러니 라우팅 문제는 거의 항상 **도구 명세(specification)의 문제**이지, 모델의 문제가 아닙니다.

### 1.2 모호한 설명이 만드는 문제

나쁜 예:

```
name: get_financial_data
description: "Gets financial data."
```

"financial data"라는 말은 주가도 되고, 환율도 되고, 사용자의 개인 계좌 잔액도 됩니다. 모델은 사용자가 "내 계좌 잔액 알려줘"라고 하면 이 도구를 부릅니다. 실제로는 공개 주가만 제공하는 도구인데도요. 이런 **범위를 넘는 호출**은 실패하거나, 더 나쁘게는 모델이 없는 데이터를 지어내는 환각(hallucination)으로 이어집니다.

좋은 예:

```
description: "Returns public stock market prices only.
Cannot access private account balances, holdings, or any user-specific
financial information."
```

### 1.3 부정 제약(Negative Constraint)

"무엇을 할 수 있는가"만 쓰면 부족합니다. **"무엇은 할 수 없는가"** 를 명시적으로 쓰는 것이 강력합니다. 이를 부정 제약이라고 부릅니다.

- `"...cannot access private account information."`
- `"Use for non-web content only; for web pages use fetch_web_page instead."`

부정 제약은 모델이 잘못된 기대를 갖는 것을 사전에 차단하기 때문에, 잘못된 호출을 가장 확실히 줄여 줍니다.

### 1.4 겹치는 도구의 경계 긋기

두 도구의 기능이 다른데 설명이 같다면, 모델 입장에서는 **동전 던지기**와 다르지 않습니다.

문제 상황 예:

| 도구 | 실제 기능 | 등록된 설명 |
|---|---|---|
| `translate_text` | 언어만 직역 | "Converts text between languages." |
| `localize_content` | 번역 + 통화·날짜 형식 + 문화적 표현 조정 | "Converts text between languages." |

올바른 해결은 **각 도구의 고유 기능과 배제 범위를 설명에 나눠 쓰는 것**입니다.

```
translate_text:
  "Direct language-to-language translation only.
   Does NOT adjust currency, date formats, or cultural references."

localize_content:
  "Full localization: translates text AND adapts currency, date/number
   formats, and culture-specific references for the target locale.
   Use when output must feel native to the target market."
```

여기서 배워야 할 원칙:

- **통합(merge)은 해결책이 아니다.** 두 도구를 하나로 합치고 `localize: true` 같은 boolean 플래그로 구분하게 하면, 라우팅 문제가 "플래그 값 결정 문제"로 이름만 바뀝니다. 설명은 더 짧아졌으니 오히려 나빠질 수 있습니다.
- **삭제도 해결책이 아니다.** 단순 번역과 전체 현지화는 비용·지연·목적이 다릅니다. 값싼 쪽을 없애면 모든 요청이 비싼 경로로 갑니다.
- **버전 이름 붙이기(`_v2`, `_v1`)는 해결책이 아니다.** `v2`는 "더 새롭고 더 강력하다"는 신호만 줄 뿐, **무엇이 다른지**는 하나도 전달하지 않습니다. 오히려 모델이 v2를 무조건 선호하게 만들어 오호출이 늘 수 있습니다.
- **설명 삭제는 최악이다.** 이름만 남기면 모델이 가진 맥락이 사라져 오호출 위험이 극대화됩니다.

### 1.5 도구가 추가되면 기존 도구도 갱신해야 한다

시간이 지나며 전용 도구(successor tool)가 새로 생기면, 기존 범용 도구의 **역할 범위가 줄어듭니다**. 그런데 기존 도구의 이름과 설명을 그대로 두면 여전히 "나는 다 할 수 있다"고 광고하는 셈이라 모델이 계속 그쪽으로 갑니다.

예: `analyze_content` 가 이메일·메모·웹페이지를 모두 요약하다가, 웹 전용 `analyze_web_page` 가 새로 생긴 경우.

올바른 조치는 두 가지를 동시에 하는 것입니다.

1. **이름 변경** — 남은 범위를 반영 (`analyze_content` → `analyze_pasted_text`)
2. **설명 갱신** — 새 도구가 가져간 케이스를 명시적으로 배제 (`"For pasted text such as emails and internal notes. Do NOT use for web pages; use analyze_web_page for those."`)

반면 다음은 잘못된 접근입니다.
- 사용자에게 매번 내부 ID로 도구를 지정하게 하기 → 시스템의 결함을 사용자에게 전가
- 백엔드 라우팅 가중치만 조정 → 도구 정의 레벨의 모호성은 그대로 남음

### 1.6 요약: 라우팅 문제의 기본 처방

라우팅이 틀린다 → **도구 명세를 고친다.** 에이전트를 더 붙이거나, 예시를 늘리거나, 가중치를 만지는 것은 우회일 뿐입니다.

---

## 2. 제약된 도구 설계 (Constrained Tool Design)

### 2.1 범용(Generic) 도구의 위험

범용 도구란 자유도가 매우 큰 인자를 받는 도구입니다.

- 임의의 바이트 오프셋 범위 (`read_range(file, start=10234, end=10998)`)
- 자유 형식 SQL (`run_sql(query)`)
- 임의의 셸 명령 (`shell(cmd)`)

이런 도구는 강력하지만, LLM은 정확한 숫자 계산이나 오프셋 산술에 약합니다. 결과적으로:

- 무관한 구간을 가져오거나
- 문장 중간이 잘린 깨진 텍스트(malformed span)를 가져오거나
- 의도치 않은 데이터를 건드립니다.

### 2.2 제약된(Constrained) 도구로의 교체

핵심 패턴은 **모델이 실수할 수 있는 자유도 자체를 인터페이스에서 없애는 것**입니다.

Before (generic):

```json
{ "name": "retrieve_clause",
  "input_schema": { "properties": {
    "file": {"type": "string"},
    "start_byte": {"type": "integer"},
    "end_byte": {"type": "integer"} } } }
```

After (constrained):

```json
{ "name": "get_clause_by_id",
  "input_schema": { "properties": {
    "clause_id": { "type": "string",
      "description": "Clause identifier from the parsed clause index, e.g. 'S3.2'" } } } }
```

이때 문서는 사전에 파싱되어 **조항 인덱스(pre-parsed index)** 로 준비됩니다. 서버는 인덱스에 존재하는 유효한 ID만 받아들이고, 항상 완전한 조항 하나를 반환합니다. 모델은 오프셋을 계산할 기회 자체가 없으므로 그 종류의 실수가 **구조적으로 불가능**해집니다.

### 2.3 잘못된 대안들

- **검증용 2차 에이전트 추가** — 결함 있는 인터페이스는 그대로 두고 감시자만 붙이는 것. 토큰 비용과 복잡도만 늘고 근본 원인은 남습니다.
- **설명에 예시(few-shot)를 더 넣기** — 모델의 산술 한계를 프롬프트로 완전히 통제할 수 없습니다. 게다가 "제약된 도구로 교체"라는 패턴 자체가 아닙니다.
- **더 넓은 권한의 도구를 추가 (`raw_file_read`)** — 제약을 거는 것과 정반대 방향입니다.

### 2.4 일반 원칙

> 모델이 특정 종류의 실수를 반복한다면, 그 실수를 "가능하게 만드는 인자"를 스키마에서 제거하라. 프롬프트로 부탁하지 말고 타입으로 막아라.

---

## 3. 도구 개수, 서브에이전트, 역할 분리

### 3.1 도구 개수와 선택 정확도의 관계

모델은 도구를 고를 때 **모든 도구의 이름·설명·스키마를 한꺼번에 비교**합니다. 도구가 늘어날수록:

- 컨텍스트에 들어가는 스키마 텍스트가 늘고
- 서로 의미가 겹치는 도구 쌍이 기하급수적으로 늘고
- 후보군(candidate set)에서 하나를 고르는 **의사결정 복잡성**이 커집니다.

경험적으로 도구가 대략 **10~20개**를 넘어가면 도구 선택 정확도와 인자 추출 정확도가 눈에 띄게 떨어집니다.

### 3.2 해결책: 전문화된 서브에이전트로 분할

20개 도구를 가진 단일 만능 에이전트를, 단계별로 나눈 5개의 서브에이전트(각각 약 4개 도구)와 가벼운 오케스트레이터(orchestrator)로 재설계합니다.

```
                 ┌─ research  agent  (4 tools)
                 ├─ outline   agent  (4 tools)
Orchestrator ────┼─ draft     agent  (4 tools)
                 ├─ edit      agent  (4 tools)
                 └─ publish   agent  (4 tools)
```

**신뢰성이 좋아지는 진짜 이유**는 하나입니다. 각 서브에이전트가 비교해야 하는 **후보군이 20개에서 4개로 줄어들어 의사결정 복잡성이 직접적으로 낮아지기 때문**입니다.

흔히 오해하는 것들:

- "API 호출 수가 줄어서" — 아닙니다. 오케스트레이터 ↔ 서브에이전트 통신이 추가되므로 총 호출 수는 오히려 늘거나 비슷합니다. 그리고 호출 수는 애초에 선택 오류의 원인이 아니었습니다.
- "컨텍스트 윈도우가 작아져서 모델이 더 신중해져서" — 컨텍스트 크기와 신중함은 인과관계가 없습니다.
- "결과를 캐싱해서 도구 호출이 사라져서" — 캐싱은 속도·비용 이야기이지 선택 정확도 이야기가 아닙니다.

### 3.3 범위 제한 교차 역할 도구 (Scoped Cross-Role Tools)

멀티 에이전트를 나누면 새 문제가 생깁니다. 어떤 에이전트가 **다른 역할의 기능 일부를 자주(high-frequency) 필요로 하는** 경우입니다.

예: 종합(synthesis) 에이전트가 최종 답변을 쓰기 전에 인용된 통계 수치 하나를 확인하고 싶어 합니다. 그런데 출처 간 충돌을 해소하는 깊은 리서치 능력은 없습니다.

**올바른 설계:**

- 종합 에이전트에게 **좁은 범위의 `verify_fact` 도구 하나만** 준다. (단일 주장의 빠른 확인 전용)
- 출처가 충돌하는 복잡한 케이스는 조정자(coordinator)에게 **에스컬레이션(refer)** 하도록 한다.

**잘못된 설계들:**

| 접근 | 왜 나쁜가 |
|---|---|
| 검증 도구를 아예 주지 않고 모든 수치를 조정자가 수동 검토 | 자주 발생하는 단순 작업이 병목이 됨 |
| 리서치 에이전트의 전체 도구 세트를 통째로 부여 | 최소 권한 원칙 위배, 도구 개수 증가로 선택 정확도 하락 |
| 조정자만 도구를 갖고 종합 에이전트는 매번 요청·대기 | 불필요한 에이전트 간 통신 비용과 지연(latency) |

핵심 원칙 두 가지:

- **최소 권한 원칙 (Principle of Least Privilege)** — 각 에이전트는 자기 역할에 필요한 최소한의 도구만 가진다.
- **빈도에 맞춘 범위 부여** — 자주 필요한 단순 기능은 직접 주고, 드물고 복잡한 기능은 담당 역할에 위임한다.

---

## 4. 구조화된 에러 설계 (Structured Error Design)

### 4.1 왜 필요한가

도구가 실패했을 때 `isError: true` 와 `"Operation failed."` 같은 일반적인 텍스트만 돌려주면, 모델(과 이를 감싼 런타임)은 **다음에 무엇을 해야 할지** 알 수 없습니다. 재시도해야 할까? 사용자에게 물어봐야 할까? 포기해야 할까?

**구조화된 에러**란 실패에 기계가 읽을 수 있는 메타데이터를 붙이는 것입니다.

```json
{
  "isError": true,
  "errorCategory": "permission",
  "isRetryable": false,
  "message": "Token scope 'read' is insufficient; 'deploy' scope required.",
  "remediation": "Request a token with the deploy scope, then retry."
}
```

### 4.2 에러 범주(errorCategory)

| 범주 | 의미 | 예 | 재시도 가능? |
|---|---|---|---|
| `validation` | 입력값의 형식/타입/필수값이 잘못됨 | 날짜 문자열 형식 오류, 필수 필드 누락 | ✗ (입력을 고쳐야 함) |
| `permission` | 인증은 되었으나 권한 범위(scope)가 부족함 | `read` 토큰으로 `deploy` 시도 | ✗ (권한이 바뀌기 전엔 무조건 실패) |
| `business` | 도메인 정책 규칙에 걸림 | 환불 가능 기간 30일 초과, 재고 부족 | ✗ (상황이 바뀌어야 함) |
| `transient` | 일시적인 인프라 문제 | 네트워크 타임아웃, 503, 레이트 리밋 | ✓ (백오프 후 재시도) |

### 4.3 재시도 가능성(isRetryable)

`isRetryable` 은 **"똑같은 요청을 그대로 다시 보냈을 때 성공할 가능성이 있는가"** 를 뜻합니다.

- 네트워크 타임아웃 → 서버가 잠깐 바빴을 뿐, 다시 보내면 성공할 수 있음 → `true`
- 권한 부족 → 토큰의 scope 가 바뀌지 않는 한 성공 확률 0% → `false`

`isRetryable: false` 를 정확히 표시하는 것은 **불필요한 재시도 폭풍을 막아** 지연과 비용, 서버 부하를 줄입니다.

### 4.4 자주 혼동되는 구분

- **permission vs business** — 둘 다 "규칙에 막혔다"지만 층위가 다릅니다. `permission` 은 IAM/인가(authorization) 층의 문제(누가 무엇을 할 자격이 있는가)이고, `business` 는 도메인 규칙 층의 문제(환불 기간, 최소 주문 금액 등)입니다. 배포 권한 제한은 IAM 문제이지 비즈니스 정책이 아닙니다.
- **permission vs validation** — 토큰이 **깨진 형식**이면 `validation`, 형식은 멀쩡한데 **권한이 모자라면** `permission` 입니다.
- **permission vs transient** — 권한 부족은 서버가 접근 불가능한 것이 아니라 서버가 **의도적으로 거절**한 것입니다. 백오프 재시도로 해결되지 않습니다.

### 4.5 백오프(Backoff)

`transient` 에러를 재시도할 때는 즉시가 아니라 점점 간격을 늘려 가며(지수 백오프, exponential backoff) 재시도합니다. 1초 → 2초 → 4초 → 8초 식입니다. 이는 이미 부하가 걸린 서버를 더 밀어붙이지 않기 위한 것입니다. 반대로 `validation`, `permission`, `business` 에러에 백오프 재시도를 거는 것은 순수한 낭비입니다.

---

## 5. Anthropic Claude API 파라미터

### 5.1 `tool_choice`

`tool_choice` 는 모델이 도구를 어떻게 쓸지를 강제하는 요청 파라미터입니다. 네 가지 값이 있습니다.

| 값 | 동작 |
|---|---|
| `{"type": "auto"}` | 모델이 도구를 부를지, 그냥 텍스트로 답할지 스스로 결정 (기본값에 해당) |
| `{"type": "any"}` | **반드시 제공된 도구 중 하나를 호출**해야 함. 자유 텍스트 응답 금지. 어떤 도구인지는 모델이 선택 |
| `{"type": "tool", "name": "X"}` | **반드시 지정한 도구 X를** 호출. 도구까지 고정 |
| `{"type": "none"}` | 도구를 전혀 호출하지 못하게 함. 텍스트 응답만 |

`any` 와 `tool` 을 합쳐 **강제 도구 호출(forced tool calling)** 이라고 부릅니다.

주의: `{"type": "forced"}` 라는 값은 **존재하지 않습니다**. 또 `any` 는 도구가 단 하나만 정의되어 있어도 정상 동작합니다(도구 개수 제한 없음).

#### 사용 예: 구조화된 출력 강제

분류 서브에이전트가 `tag_urgent` / `tag_normal` / `tag_spam` 중 하나를 반드시 호출해야 하고, 절대 산문으로 답하면 안 되며, 어떤 태그인지는 메시지 내용에 따라 달라져야 한다면 → 정답은 `{"type": "any"}` 입니다.

- `auto` 는 텍스트 응답을 허용하므로 "항상 도구 호출"을 보장하지 못합니다.
- `none` 은 도구 호출을 완전히 막습니다.
- `{"type":"tool","name":"tag_normal"}` 은 내용과 무관하게 항상 같은 태그를 강제하므로 분류가 되지 않습니다.

```python
response = client.messages.create(
    model="claude-...",
    tools=[tag_urgent, tag_normal, tag_spam],
    tool_choice={"type": "any"},   # 도구 중 하나는 무조건 호출
    messages=[{"role": "user", "content": message_text}],
)
```

### 5.2 확장 사고 (Extended Thinking)

**확장 사고**는 모델이 최종 답변을 내기 전에 내부적으로 더 긴 추론 과정을 거치도록 하는 기능입니다. 복잡한 다단계 문제에서 정확도를 높입니다.

두 가지 형태가 있습니다.

- **수동 확장 사고 (manual extended thinking)** — 요청에 `thinking: {"type": "enabled", "budget_tokens": N}` 을 명시적으로 켭니다.
- **적응형 사고 (adaptive thinking)** — 더 새로운 모델에서 지원되며, 모델이 필요에 따라 사고량을 스스로 조절합니다.

### 5.3 확장 사고와 `tool_choice` 의 비호환

이 조합에는 중요한 제약이 있습니다.

> **수동 확장 사고(`thinking: {"type": "enabled"}`)가 켜져 있으면 `tool_choice` 로 `{"type": "any"}` 와 `{"type": "tool", ...}` 를 쓸 수 없습니다.** 이 경우 `auto` 또는 `none` 만 지원되며, 강제 옵션을 넣으면 API 요청 자체가 에러로 실패합니다.

이유를 직관적으로 이해하자면: 강제 도구 호출은 모델의 첫 출력이 반드시 도구 호출 블록이어야 한다는 제약인데, 수동 확장 사고는 첫 출력이 반드시 thinking 블록이어야 한다는 제약이기 때문에 서로 충돌합니다.

**해결 방법 (둘 다 필요할 때):**

1. **적응형 사고로 전환** — 더 새로운 모델에서 지원되며, 사고와 강제 도구 호출을 함께 쓸 수 있습니다.
2. **수동 확장 사고를 끈다** — 강제 도구 호출이 더 중요하다면 사고를 포기합니다.

기억해 둘 오해들:
- 확장 사고가 `tool_choice` **전부**를 막는 것은 아닙니다. `auto` 와 `none` 은 정상 동작합니다.
- 도구 개수와는 무관한 문제입니다.
- `any` 는 deprecated 되지 않았습니다.

---

## 6. MCP (Model Context Protocol)

### 6.1 MCP 란

**Model Context Protocol(MCP)** 은 LLM 애플리케이션(호스트/클라이언트)과 외부 시스템(서버)을 연결하는 표준 프로토콜입니다. "에이전트가 외부 세계와 연결되는 방식의 USB-C 규격" 정도로 이해하면 됩니다. 이슈 트래커, 파일 시스템, 데이터베이스, 사내 API 등을 MCP 서버로 감싸면, 어떤 MCP 호환 에이전트든 같은 방식으로 붙일 수 있습니다.

MCP 서버가 노출할 수 있는 기본 요소(primitive)는 세 가지입니다.

| Primitive | 성격 | 누가 주도하는가 | 예 |
|---|---|---|---|
| **Tool** | 실행/행동. 동적 연산, 검색, 상태 변경 | 모델이 호출 | `create_issue`, `search_issues`, `deploy_service` |
| **Resource** | 읽기 전용 컨텍스트 데이터 | 애플리케이션이 컨텍스트에 주입 | 이슈 요약 카탈로그, 문서, 설정 파일, 스키마 |
| **Prompt** | 재사용 가능한 프롬프트 템플릿 | 사용자가 선택 | "이 PR 리뷰해줘" 슬래시 명령 |

### 6.2 Tool vs Resource — 이 구분이 왜 중요한가

전형적인 문제 상황:

> 에이전트가 큰 이슈 트래커를 다룰 때, "어떤 이슈들이 존재하는지" 파악하려고 탐색적 검색 도구를 계속 반복 호출한다. 토큰과 지연 시간이 낭비된다.

이건 **검색 성능 문제가 아니라 "무엇이 있는지 모른다"는 컨텍스트 부족 문제**입니다. 매번 도구로 물어보게 하는 대신, **이슈 요약 카탈로그를 MCP 리소스로 노출**하면 에이전트는 처음부터(up front) 목록을 보고 시작할 수 있습니다. 탐색 호출이 통째로 사라집니다.

**핵심 판단 기준:**

- 에이전트가 반복적으로 "무엇이 있지?"를 묻고 있다 → **Resource** 로 미리 제공하라.
- 에이전트가 "이걸 해줘 / 이 조건으로 계산해줘"를 하고 있다 → **Tool** 이 맞다.

### 6.3 효과 없는 대안들

| 시도 | 왜 안 되는가 |
|---|---|
| 검색 도구를 더 추가한다 | 여전히 "도구 호출로 탐색"하는 구조. 도구 개수만 늘어 라우팅 정확도까지 나빠짐 |
| 도구 호출 타임아웃을 늘린다 | 타임아웃은 한 호출이 얼마나 오래 기다릴 수 있는지일 뿐, 반환량이나 호출 횟수와 무관 |
| 전송 계층을 stdio → HTTP 로 바꾼다 | 통신 방식 차이일 뿐. 반복 탐색 구조 자체는 그대로 |

### 6.4 MCP 전송 계층 (Transport)

참고로 MCP 서버는 두 가지 방식으로 연결됩니다.

- **stdio** — 서버를 로컬 자식 프로세스로 띄우고 표준 입출력으로 통신. 로컬 도구에 적합.
- **HTTP (Streamable HTTP / SSE)** — 원격 서버에 네트워크로 연결. 여러 클라이언트가 공유 가능.

전송 계층은 **어디서 어떻게 연결하느냐**의 문제이지, **에이전트의 행동 패턴**을 바꾸는 수단이 아닙니다.

### 6.5 MCP 도구의 에러 반환

MCP 도구 결과는 `isError` 필드로 실패를 표시합니다. 4장에서 다룬 구조화된 에러 설계는 이 `isError: true` 응답의 본문에 `errorCategory`, `isRetryable` 같은 필드를 실어 보내는 형태로 적용됩니다.

---

## 7. Claude Code 내장 도구

Claude Code 는 코드베이스를 다루는 에이전트로, 다음 도구들을 씁니다. 각 도구의 **역할 경계**를 정확히 아는 것이 핵심입니다.

### 7.1 도구 한눈에 보기

| 도구 | 하는 일 | 하지 못하는 일 |
|---|---|---|
| `Read` | 파일 내용을 읽어 컨텍스트에 로드 | 수정 불가 |
| `Write` | 파일 전체를 새 내용으로 덮어쓰기 | 부분 병합(merge) 불가 |
| `Edit` | 파일 안의 특정 문자열을 다른 문자열로 치환 | 대규모 재배치에는 부적합 |
| `Grep` | 파일 **내용(content)** 을 정규식 패턴으로 검색 | **수정 불가 — 순수 검색 도구** |
| `Glob` | 파일 **경로/이름(path)** 패턴으로 파일 목록 수집 | 파일 내용은 보지 않음 |
| `Bash` | 셸 명령 실행 | 대화형(interactive) 에디터는 부적합 |

가장 흔한 혼동 두 가지를 먼저 못 박아 둡시다.

- **Grep 은 검색만 한다.** 아무리 매치를 찾아도 파일을 고쳐 주지 않습니다. Grep 결과가 곧 파일에 반영된 것도 아닙니다.
- **Glob 은 파일 이름만 본다.** 변수명이 파일 *내용* 안에 있으면 Glob 으로는 절대 찾을 수 없습니다.

### 7.2 Grep 사용법

```
Grep(pattern="API_TIMEOUT_MS", output_mode="content", glob="**/*.ts")
```

주요 파라미터:

- `pattern` — 찾을 정규식.
- `output_mode`
  - `files_with_matches` (기본) — 매치가 있는 파일 경로만
  - `content` — 매치된 **줄 번호와 줄 내용**까지
  - `count` — 파일별 매치 개수
- `glob` / `type` — 검색 범위를 파일 패턴이나 언어 타입으로 좁힘
- `-i` 대소문자 무시, `-n` 줄 번호, `-A`/`-B`/`-C` 앞뒤 문맥 줄, `multiline` 여러 줄에 걸친 패턴

**쓰는 상황:** 코드베이스 전체에서 어떤 심볼/문자열이 어디에 쓰이는지 **영향 범위(scope)를 파악할 때.**

### 7.3 Glob 사용법

```
Glob(pattern="src/components/**/*.tsx")
Glob(pattern="src/components/**/*.test.tsx")
```

파일 경로 패턴만 매칭합니다. `**` 는 하위 디렉터리 전체, `*` 는 이름 일부를 뜻합니다.

**쓰는 상황:** 명명 규칙(naming convention)이 신뢰할 만할 때, **파일의 존재/부재를 파일 내용을 읽지 않고** 판단할 때.

예: `src/components` 아래에서 테스트 파일이 없는 컴포넌트 개수 세기.

1. `**/*.tsx` 로 컴포넌트 목록 수집 (단, `.test.tsx` 제외)
2. `**/*.test.tsx` 로 테스트 목록 수집
3. 두 경로 목록을 비교해 짝이 없는 것을 셈

파일을 하나도 열지 않으므로 I/O와 토큰 소모가 최소입니다. 반대로 각 파일을 Read 로 다 열어 보거나, 파일 내용에 "test"라는 단어가 있는지 Grep 하거나, 전체 테스트 스위트를 Bash 로 돌리는 것은 모두 훨씬 무겁고 부정확합니다.

### 7.4 Edit — 고유성(Uniqueness) 요구사항

```
Edit(file_path=..., old_string="...", new_string="...", replace_all=false)
```

**Edit 의 가장 중요한 규칙:** `old_string` 은 파일 안에서 **정확히 한 번만 등장해야** 합니다. 두 번 이상 등장하면 어느 것을 바꿔야 할지 알 수 없으므로 오작동을 막기 위해 호출이 **실패**합니다.

문제 상황: `logger.warn("legacy-path")` 가 같은 파일의 서로 다른 두 함수에 있고, 그중 하나만 바꿔야 합니다.

**올바른 해결: `old_string` 을 넓힌다 (widen).** 대상 위치의 주변 코드 — 앞뒤 줄, 함수 선언부 등 — 를 함께 포함시켜 파일 내에서 유일하게 식별되게 만든 뒤 재시도합니다.

```
old_string:
function handleLegacyRequest() {
  logger.warn("legacy-path")
```

이렇게 하면 다른 함수 안의 동일한 로그 줄과 구분됩니다.

**잘못된 해결들:**

- `replace_all: true` 로 둘 다 바꾼 뒤 하나를 수동으로 되돌리기 → 의도와 어긋나는 비정상적 우회이며, 중간에 잘못된 상태를 만듭니다. (`replace_all` 은 **정말로 모든 occurrence를 바꿀 때만** 쓰는 옵션입니다.)
- `Write` 에 새 로그 한 줄만 content 로 넘기기 → **Write 는 파일 전체를 덮어씁니다.** 한 줄만 넘기면 파일이 그 한 줄만 남고 나머지가 전부 사라집니다. Write 는 병합하지 않습니다.
- `Grep` 으로 고치기 → Grep 은 파일을 수정할 수 없습니다.

### 7.5 Write — 전체 덮어쓰기

`Write` 는 지정한 경로의 파일을 **주어진 content 로 통째로 교체**합니다. 부분 병합 개념이 없습니다.

**Write 가 적합한 상황:** 파일 구조를 대대적으로 재배치할 때.

예: 파일 곳곳에 흩어진 여러 `export` 문을 상단의 한 블록으로 모으기.

**올바른 순서: Read → Write**

1. `Read` 로 파일 전체 내용을 로드
2. 머릿속(모델 출력)에서 재구성된 전체 파일을 만든 뒤
3. 같은 경로에 `Write` 로 통째로 씀

왜 여러 번의 `Edit` 이 아닌가? 각 export 를 지우고 상단에 추가하는 작업을 연쇄적인 Edit 으로 하면, 앞의 Edit 이 파일을 바꾸면서 뒤의 Edit 이 기대하던 `old_string` 이 더 이상 유일하지 않거나 아예 존재하지 않게 되어 실패하거나 코드가 꼬입니다.

또한 단일 파일의 존재 여부를 확인하려고 `Glob` 을 부르는 것은 불필요하고, `Edit` 의 `old_string` 에 파일 전체 텍스트를 넣는 것은 Edit 도구의 취지에 맞지 않습니다 — 그 경우엔 그냥 `Write` 를 쓰면 됩니다.

### 7.6 Edit vs Write 선택 기준

| 상황 | 도구 |
|---|---|
| 국소적인 몇 줄 수정, 대상이 고유하게 식별됨 | `Edit` |
| 정말로 모든 occurrence 를 동일하게 바꿈 | `Edit` + `replace_all: true` |
| 파일 구조 전체 재배치, 대량 이동 | `Read` → `Write` |
| 새 파일 생성 | `Write` |

### 7.7 대규모 변경 전 영향 범위 파악하기

수백 개 파일에 걸친 환경 변수 이름 변경(`API_TIMEOUT_MS` → `REQUEST_TIMEOUT_MS`) 같은 작업에서 **가장 먼저 할 일은 "어디를 고쳐야 하는지 전부 찾는 것"** 입니다.

```
Grep(pattern="API_TIMEOUT_MS", output_mode="content", glob="**/*")
```

이렇게 하면 참조하는 모든 파일과 정확한 줄이 나오고, 이 목록을 검토한 뒤 편집에 들어갑니다.

**잘못된 접근들:**

- Bash 로 대화형 에디터를 열어 눈으로 확인 → 에이전트 환경에서 불가능하고 비효율적
- 환경 설정 파일 하나만 먼저 고치고 나머지는 모델의 "추론"에 맡김 → 수백 파일 중 일부를 놓치는(missing reference) 치명적 결과
- `Glob(pattern="**/API_TIMEOUT_MS")` → Glob 은 **파일 이름**을 찾습니다. 변수명은 파일 이름이 아니라 파일 내용 속에 있으므로 아무것도 찾지 못합니다.

### 7.8 별칭(alias)과 re-export 때문에 놓치는 호출부

리팩토링에서 특히 위험한 함정입니다. 모듈이 함수를 **다른 이름으로 다시 내보내는** 경우가 있습니다.

```ts
// dateUtils.ts
export { formatDate as fmt, parseDate as pd }
```

이러면 외부 코드는 `formatDate` 로도, `fmt` 로도 이 함수를 부를 수 있습니다. `formatDate` 만 Grep 하면 `fmt` 호출부를 전부 놓치고, 이름을 바꾸는 순간 런타임 에러가 납니다.

**올바른 절차: Read → Grep (여러 번)**

1. `Read` 로 `dateUtils.ts` 를 읽어 **모든 export 이름과 별칭을 식별** (`formatDate`, `fmt`)
2. 식별된 **각 이름마다** `Grep` 을 코드베이스 전체에 수행
3. 두 결과를 합쳐 완전한 호출부 목록을 얻음

잘못된 접근:
- `Glob("**/dateUtils*")` 로 파일만 찾고 호출자도 그 패턴 안에 있으리라 가정 → 호출자는 아무 파일에나 있을 수 있음
- `export` 라는 단어의 등장 횟수를 세어 임계값 넘는 파일만 읽기 → 호출부 탐색과 아무 관련 없음
- `formatDate` 단일 Grep 만 수행 → 별칭 `fmt` 호출부를 전부 누락

일반 원칙:

> 심볼의 이름을 바꾸기 전에, **그 심볼이 코드베이스에서 불릴 수 있는 모든 이름**을 먼저 확정하라.

---

## 8. 관통하는 설계 원칙 정리

1. **모델이 틀리면 명세를 고쳐라.** 도구 이름·설명·스키마가 라우팅 정확도의 1차 결정 요인이다.
2. **할 수 있는 것과 할 수 없는 것을 둘 다 써라.** 부정 제약은 오호출을 가장 확실히 줄인다.
3. **자유도를 타입으로 제거하라.** 프롬프트로 부탁하는 것보다 스키마로 막는 것이 안전하다.
4. **최소 권한.** 각 에이전트/도구는 자기 역할에 딱 맞는 범위만.
5. **후보군을 작게.** 도구 개수가 늘면 선택 정확도가 떨어진다. 전문화된 서브에이전트로 나눠라.
6. **실패에 메타데이터를 붙여라.** 범주와 재시도 가능성이 있어야 올바른 후속 조치가 나온다.
7. **반복 탐색은 컨텍스트 부족의 신호다.** 도구를 더 붙이지 말고 리소스로 미리 알려 줘라.
8. **도구마다 하는 일이 정해져 있다.** Grep은 검색, Glob은 경로, Edit은 국소 치환, Write는 전체 교체.
9. **고치기 전에 전체 범위를 먼저 파악하라.** 특히 별칭과 re-export를 놓치지 마라.

---

## 9. 용어 사전 (Glossary)

| 영어 용어 | 한국어 설명 |
|---|---|
| **Tool / Function Calling** | 모델이 외부 함수를 구조화된 JSON으로 호출하도록 하는 메커니즘. 실행은 런타임이 함 |
| **Tool Description** | 도구의 용도를 모델에게 설명하는 텍스트. 모델의 도구 선택 근거가 되는 사실상 유일한 정보 |
| **Input Schema** | 도구 인자의 형태를 정의하는 JSON Schema. 모델 출력의 모양을 제한함 |
| **Tool Routing** | 여러 도구 중 상황에 맞는 하나를 모델이 고르는 판단 |
| **Ambiguity** | 두 도구의 설명이 겹쳐 모델이 구분하지 못하는 모호성 |
| **Negative Constraint** | "이건 할 수 없다/여기엔 쓰지 마라"를 설명에 명시하는 부정형 제약 |
| **Hallucination** | 모델이 근거 없는 내용을 사실처럼 생성하는 현상 |
| **Generic Tool** | 임의의 자유도 높은 인자(바이트 범위, 자유 SQL 등)를 받는 범용 도구 |
| **Constrained Tool** | 사전 검증된 식별자 등 제한된 입력만 받아 오용 여지를 구조적으로 차단한 도구 |
| **Pre-parsed Index** | 문서를 미리 파싱해 만든 조항/섹션 인덱스. 제약된 도구의 입력 후보가 됨 |
| **Malformed Span** | 잘못된 오프셋 때문에 문장 중간이 잘린 깨진 텍스트 구간 |
| **Byte Offset** | 파일 시작부터의 바이트 위치. LLM이 정확히 계산하기 어려운 값 |
| **Tool Count** | 한 에이전트에 부여된 도구 개수. 대략 10~20개를 넘으면 선택 정확도가 하락 |
| **Decision Complexity** | 후보군이 클수록 커지는 모델의 의사결정 부담 |
| **Candidate Set** | 모델이 비교해야 하는 도구 후보 집합 |
| **Subagent** | 특정 단계/역할에 특화되어 소수의 도구만 갖는 하위 에이전트 |
| **Orchestrator / Coordinator** | 서브에이전트들을 호출·조율하는 상위 에이전트 |
| **Scoped Cross-Role Tool** | 다른 역할의 기능 중 자주 필요한 부분만 좁게 잘라 부여한 도구 |
| **Principle of Least Privilege** | 역할 수행에 필요한 최소한의 권한/도구만 부여하는 원칙 |
| **Escalation / Refer** | 자기 역량 밖의 복잡한 케이스를 상위/담당 에이전트에게 넘기는 것 |
| **Structured Error** | `errorCategory`, `isRetryable` 등 기계가 읽을 수 있는 메타데이터를 담은 에러 응답 |
| **isError** | MCP 도구 결과에서 실패 여부를 표시하는 불리언 필드 |
| **errorCategory** | 실패 원인의 종류: `validation` / `permission` / `business` / `transient` |
| **isRetryable** | 같은 요청을 그대로 재시도했을 때 성공 가능성이 있는지 여부 |
| **Validation Error** | 입력값의 형식·타입·필수값이 잘못된 오류. 재시도 불가 |
| **Permission Error** | 인증은 되었으나 권한 범위가 부족한 인가(authorization) 오류. 재시도 불가 |
| **Business Error** | 도메인 정책 규칙(환불 기간 등)에 걸린 오류. 재시도 불가 |
| **Transient Error** | 타임아웃·503 등 일시적 인프라 오류. 백오프 후 재시도 가능 |
| **Scope** | 토큰에 부여된 권한 범위 (예: `read`, `deploy`) |
| **IAM (Identity and Access Management)** | 누가 무엇을 할 자격이 있는지를 관리하는 계층 |
| **Backoff / Exponential Backoff** | 재시도 간격을 점점 늘려 가는 재시도 전략 |
| **tool_choice** | 모델의 도구 사용 방식을 강제하는 Claude API 파라미터 |
| **tool_choice: auto** | 도구 호출 여부를 모델이 스스로 결정 |
| **tool_choice: any** | 제공된 도구 중 반드시 하나를 호출. 어느 것인지는 모델이 선택 |
| **tool_choice: tool** | 지정한 특정 도구를 반드시 호출 |
| **tool_choice: none** | 도구 호출 금지, 텍스트 응답만 |
| **Forced Tool Calling** | `any` 또는 `tool` 로 도구 호출을 강제하는 것 |
| **Extended Thinking** | 답변 전에 모델이 긴 내부 추론을 거치게 하는 기능 |
| **Manual Extended Thinking** | `thinking: {"type": "enabled"}` 로 명시적으로 켜는 확장 사고. `tool_choice` 는 `auto`/`none` 만 허용 |
| **Adaptive Thinking** | 최신 모델이 사고량을 스스로 조절하는 방식. 강제 도구 호출과 함께 사용 가능 |
| **MCP (Model Context Protocol)** | LLM 애플리케이션과 외부 시스템을 잇는 표준 프로토콜 |
| **MCP Tool** | 상태 변경·동적 연산·검색을 수행하는 행동 기반 기능. 모델이 호출 |
| **MCP Resource** | 목록·문서·요약 등 읽기 전용 컨텍스트 데이터. 사전에 컨텍스트로 주입 |
| **MCP Prompt** | 재사용 가능한 프롬프트 템플릿 |
| **Transport (stdio / HTTP)** | MCP 서버 연결 방식. 로컬 프로세스 표준입출력 vs 원격 네트워크 |
| **Exploratory Overhead** | 무엇이 있는지 파악하려고 반복 호출하며 낭비되는 토큰·지연 |
| **Read** | Claude Code에서 파일 내용을 컨텍스트로 로드하는 도구 |
| **Write** | 파일 전체를 새 내용으로 덮어쓰는 도구. 부분 병합 불가 |
| **Edit** | `old_string` → `new_string` 치환 도구. `old_string` 이 파일 내에서 유일해야 함 |
| **old_string / new_string** | Edit 의 치환 대상 문자열과 교체 문자열 |
| **replace_all** | Edit 에서 모든 occurrence 를 한꺼번에 바꾸는 옵션 |
| **Uniqueness (Edit)** | Edit 성공 조건. 중복 시 실패하므로 주변 문맥을 넣어 범위를 넓혀야 함 |
| **Widen (old_string)** | 주변 코드를 포함시켜 대상 문자열을 유일하게 만드는 기법 |
| **Grep** | 파일 **내용**을 정규식으로 검색하는 도구. 수정 기능 없음 |
| **output_mode** | Grep 출력 형태: `files_with_matches` / `content` / `count` |
| **Glob** | 파일 **경로·이름** 패턴으로 파일 목록을 찾는 도구. 내용은 보지 않음 |
| **Bash** | 셸 명령 실행 도구. 대화형 에디터 용도로는 부적합 |
| **Naming Convention** | `Button.tsx` ↔ `Button.test.tsx` 같은 일관된 파일 명명 규칙 |
| **Re-export** | 모듈이 다른 모듈의 심볼을 다시 내보내는 것 |
| **Alias** | `export { formatDate as fmt }` 처럼 심볼에 붙인 다른 이름 |
| **Caller** | 함수를 실제로 호출하는 코드 지점 |
| **Missing Reference** | 리팩토링 중 놓친 참조. 런타임 에러의 원인 |
| **Impact Scope** | 변경이 영향을 미치는 전체 파일·라인 범위 |
