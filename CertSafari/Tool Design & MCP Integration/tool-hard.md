# Tool Design & MCP Integration — 고난도 선별 문제

원본: tool-merged.md (전체 80문제 중 16문제 선별, 20%)

**선별 기준** — 아래 특징 중 하나 이상에 해당하는 문제 중, 특히 난이도가 높은 것:

- **덜 틀린 답 고르기** — 정답이 "명백히 옳은 것"이 아니라 "덜 틀린 것", 매력적인 오답이 2~3개
- **원칙이 깨지는 예외** — 외운 규칙을 그대로 적용하면 틀린다
- **유사 현상 구분** — 표면적으로 같아 보이는 두 현상, 같은 증상 다른 원인
- **복합 시나리오** — 여러 개념이 한 문제에 교차
- **근본 원인 vs 증상 완화** — 오답이 그럴듯한 완화책이고 정답은 구조적 해법
- **부분적으로만 맞는 오답** — 결론은 맞지만 근거가 틀린 선택지 등
- **길이가 단서 아님** — 정답이 가장 길고 서술적이지 않다

**재배치 안내** — 묻는 주제가 같은 것끼리 묶고, 유사 시나리오이지만 답이 다른 문제를 인접 배치했다. 괄호 안 원본 번호는 그대로다.

---

# A. errorCategory 분류 — 같은 질문 형태, 답은 business / permission / transient / validation

1과 30: business(정책 규칙). 44: permission(토큰 스코프). 68: transient + isRetryable true(429). 60: validation + isRetryable false(필수 인자 누락). 네 카테고리를 시나리오만 보고 갈라야 한다.

## 1번 문제 (원본 1번)

**어려운 이유** [덜 틀린 답 고르기, 부분적으로만 맞는 오답] — "다시 시도하지 말 것"이라는 요구를 permission/business/transient 중 어떤 errorCategory로 번역할지가 미세한 판단이고 permission 선택지도 표면상 그럴듯하다.

**1. 문제 원문**

A `submit_refund` MCP tool rejects a request because the customer's order is past the 30-day return window. The engineer designing the error response wants the agent to explain the rejection to the customer in plain language and never attempt this exact call again. Which response body best achieves this?

A) A text block plus structured content with `errorCategory: "permission"` and a description asking the customer to contact their account administrator.

B) A text block explaining the rejection, along with structured metadata including `errorCategory: "business"` to indicate a business rule violation and a description stating the order fell outside the 30-day return window.

C) A bare text block reading "Refund denied" with no structured metadata.

D) A text block plus structured content with `errorCategory: "transient"` and a description telling the agent to wait 30 seconds and resubmit.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: A text block explaining the rejection, along with structured metadata including `errorCategory: "business"` to indicate a business rule violation and a description stating the order fell outside the 30-day return window.

**정답 및 해설:**

**핵심 개념**: MCP(Model Context Protocol) 오류 처리 및 에러 카테고리 설계
MCP 기반 애플리케이션에서 AI 에러 처리 시, LLM 에이전트가 상황을 올바르게 판단(재시도 여부 결정)하고 사용자에게 명확히 전달할 수 있도록 **자연어 설명(Text Block)**과 **구조화된 에러 메타데이터(Structured Metadata)**를 함께 전달해야 합니다.

**문제 상황 분석:**
- 환불 기간(30일) 경과로 인한 거절은 변경될 수 없는 비즈니스 규칙 위반(Business Logic Violation)에 해당합니다.
- 요구사항 1: 에이전트가 고객에게 쉽게 이유를 설명할 수 있어야 함 (명확한 자연어 텍스트 블록 필요).
- 요구사항 2: 동일한 호출을 다시 시도(Retry)하지 않아야 함 (`transient`가 아닌 비재시도성 카테고리 표기 필요).

**B번이 정답인 이유:**
- **자연어 설명 제공**: 거절 사유 및 30일 경과 사실이 기재된 텍스트 블록을 포함하여 에이전트가 고객에게 상황을 명확히 안내할 수 있습니다.
- **적절한 에러 카테고리 지정**: 비즈니스 로직 위반을 뜻하는 `errorCategory: "business"`를 전달함으로써 에이전트가 동일한 입력으로 도구를 재호출해도 결과가 바뀌지 않음을 인지하고 재시도를 방지할 수 있습니다.

**오답 분석:**

- Option A (오답): `permission`은 권한 문제(액세스 거부)일 때 사용하며, 계정 관리자 연락 안내는 환불 기한 만료 문제와 부합하지 않습니다.
- Option C (오답): 메타데이터가 없는 단순 텍스트("Refund denied")는 AI 에러 판단을 위한 정보가 부족하며, 원인 파악과 적절한 후속 조치를 어렵게 만듭니다.
- Option D (오답): `transient` 카테고리는 일시적 오류(일시적 네트워크 오류 등)를 의미하므로, 에이전트가 30초 후 동일한 요청을 불필요하게 재시도하게 만듭니다.

---

## 2번 문제 (원본 30번)

**어려운 이유** [부분적으로만 맞는 오답, 덜 틀린 답 고르기] — business error라는 결론이 같은 선택지가 두 개라 근거(별도 서비스 검사 시점 vs 요청 자체는 정상)의 타당성만으로 골라야 한다.

**1. 문제 원문**

A `cancel_subscription` MCP tool rejects a cancellation because the account is locked in a legal hold, a policy condition that will not change no matter how the request is retried or reformatted. The engineer must choose between labeling this a validation error or a business error. Which choice is correct, and why?

A) Validation error, because any rejection after initial schema checks indicates the input, when checked against account state, does not pass full system validation.

B) Business error, because the legal hold check occurs in a separate service after request validation, so the rejection is a business rule violation, not a schema issue.

C) It is a business error because the request itself is well-formed and the rejection stems from a policy rule about the account's state rather than malformed input.

D) Validation fails because the account ID in the request is the specific field that, when evaluated against the account's legal hold status, causes the rejection.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: It is a business error because the request itself is well-formed and the rejection stems from a policy rule about the account's state rather than malformed input.

**정답 및 해설:**

**핵심 개념**: 
검증 에러(Validation Error)는 전달된 데이터/입력의 형식, 구조, 필드 누락 등 스키마(Schema) 차원의 결함을 의미하며, 비즈니스 에러(Business/Domain Error)는 입력 형식 자체는 정상(Well-formed)이지만 도메인 정책, 계정 상태, 비즈니스 규칙 위반으로 인해 요청을 처리할 수 없는 경우 발생합니다.

**문제 상황 분석:**
- 클라이언트가 보낸 구독 취소 요청 메시지는 형식이나 데이터 타입 측면에서 완벽한 상태(Well-formed)입니다.
- 계정이 '법적 보류(Legal hold)' 상태에 있어 정책상 취소가 불가능한 시스템/비즈니스 제약이 존재합니다.
- 입력값의 형식을 재구성(reformat)하거나 재시도(retry)하더라도 비즈니스 정책 조건이 바뀌지 않는 한 해결되지 않습니다.

**C번이 정답인 이유:**
요청 문맥 및 스키마 관점에서 입력값 형태 자체는 정상적이지만, 시스템의 비즈니스 정책(계정 상태가 법적 보류)에 의해 거부된 것이므로 '비즈니스 에러(Business error)'로 분류하는 것이 정확합니다. C번은 입력 데이터의 결함(Malformed input)이 아닌 계정 상태 정책(Policy rule)이 원인임을 명확히 설명합니다.

**오답 분석:**
- **Option A (오답)**: 시스템 상태 체크 과정에서 거부된다고 해서 이를 유효성 검증(Validation) 에러로 분류하는 것은 에러의 본질(입력 오류 vs 도메인 정책 위반)을 혼동한 설명입니다.
- **Option B (오답)**: 비즈니스 에러로 분류한 결론은 맞지만, 이유로서 '별도의 서비스에서 실행되기 때문'이라는 구조적/실행 위치 조건은 에러의 개념적 원인 분류 표준이 아닙니다.
- **Option D (오답)**: 계정 ID 필드가 법적 보류 상태와 평가된다는 이유로 이를 검증 실패(Validation fails)로 규정하는 것은 잘못되었습니다. 필드의 형식적 유효성과 데이터가 가리키는 대상의 상태 정책 위반은 엄격히 구분됩니다.

---

## 3번 문제 (원본 44번)

**어려운 이유** [부분적으로만 맞는 오답, 덜 틀린 답 고르기] — permission과 business 둘 다 isRetryable:false라 결론이 동일하고 환불 창구 규칙과의 유비를 내세운 오답을 근거로만 걸러야 한다.

**1. 문제 원문**

A `deploy_service` MCP tool requires an API token scoped to the `deploy` role. An agent calls it using a token scoped only to `read`. The server returns `isError: true` with generic text "Operation failed." Under a structured error design, how should this failure be categorized and handled differently from a network timeout on the same tool?

A) As `errorCategory: "business"` with `isRetryable: false`, since restricting deploy access is functionally the same kind of policy rule as a refund window

B) As `errorCategory: "permission"` with `isRetryable: false`, since resubmitting with the same token will fail identically until the caller's scope changes

C) As `errorCategory: "transient"` with `isRetryable: true`, since both permission failures and timeouts stem from the deploy service being temporarily unreachable

D) As `errorCategory: "validation"` with `isRetryable: true`, since the token itself is a malformed input field that a retry with backoff can resolve

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: As `errorCategory: "permission"` with `isRetryable: false`, since resubmitting with the same token will fail identically until the caller's scope changes

**정답 및 해설:**

**핵심 개념**: 에러의 구조화(Structured Error Design) 및 재시도 가능 여부(Retryability)
시스템 및 API 설계에서 에러는 실패 원인에 따라 카테고리화됩니다. 권한 부족(Permission/Authorization) 실패는 클라이언트의 권한(Scope)이 변경되지 않는 한 동일한 요청을 반복해도 무조건 실패하므로 `isRetryable: false`로 설정해야 합니다. 반면 네트워크 타임아웃 등 일시적 문제(Transient Error)는 재시도(`isRetryable: true`)가 가능합니다.

**문제 상황 분석:**
- `deploy_service` 도구는 `deploy` 권한(scope)을 가진 API 토큰이 필요함
- 에이전트는 `read` 권한만 가진 토큰으로 요청하여 서버에서 실패를 반환받음
- 권한 범위가 부족하여 발생한 실패를 네트워크 타임아웃과 구분하여 적절히 분류 및 처리해야 함

**B번이 정답인 이유:**
요청 실패의 근본 원인은 토큰의 권한 부족(`read` vs `deploy`)입니다. 따라서 에러 범주는 `permission`이 맞습니다. 또한, 권한 범위(Scope)를 수정하지 않고 동일한 토큰으로 요청을 다시 보낸다고 해서 성공할 가능성은 0%이므로, 재시도가 불가능함(`isRetryable: false`)을 명시하여 불필요한 네트워크 재요청을 방지해야 합니다.

**오답 분석:**
- **Option A (오답)**: 비즈니스 로직 정책(예: 환불 기간 초과)과 접근 권한(Authorization/IAM)은 명확히 다릅니다. 이 문제는 비즈니스 규칙이 아닌 IAM 권한 범주의 문제입니다.
- **Option C (오답)**: 권한 부족은 일시적 문제(`transient`)가 아니며, 서버가 접근 불가 상태인 것도 아닙니다. 똑같이 재시도한다고 해서 해결되지 않으므로 `isRetryable: true` 설정은 잘못되었습니다.
- **Option D (오답)**: 토큰의 형식이 깨진(malformed) 입력 검증 오류(`validation`)가 아니라 권한 부족 오류입니다. 또한 지연 후 재시도(backoff retry)로 해결될 수 있는 문제가 아닙니다.

---

## 4번 문제 (원본 68번)

**어려운 이유** [덜 틀린 답 고르기] — 429 백오프에서 transient+retryable을 고르되 재시도 한도를 에이전트가 스스로 관리한다는 뉘앙스까지 맞아야 해 "try again later" 텍스트 선택지와 갈린다.

**1. 문제 원문**

A `run_report` MCP tool depends on a data warehouse that occasionally throttles requests with a 429 response. The tool author wants the agent to back off and retry automatically, but only up to a sensible limit, rather than retrying forever or giving up immediately. Which structured error response best supports this behavior?

A) `errorCategory: "permission"`, `isRetryable: false`, and a description stating the report requires elevated warehouse access to proceed

B) `errorCategory: "validation"`, `isRetryable: true`, and a description asking the agent to reduce the report's date range before resubmitting the identical query

C) No errorCategory or isRetryable field at all, relying on the phrase "try again later" in the text block to convey the retry semantics

D) `errorCategory: "transient"`, `isRetryable: true`, and a description noting the warehouse is rate-limiting requests, letting the agent apply its own bounded backoff strategy

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: `errorCategory: "transient"`, `isRetryable: true`, and a description noting the warehouse is rate-limiting requests, letting the agent apply its own bounded backoff strategy

**정답 및 해설:**

**핵심 개념**: MCP 도구의 일시적 오류 처리 및 속도 제한(Transient Error Handling and Rate Limiting in MCP Tools)

**문제 상황 분석:**
- 429(Too Many Requests) 응답으로 인해 속도 제한이 가끔 발생함.
- 에이전트가 무한 재시도 대신 합리적인 한도 내에서 지연(backoff)을 두고 자동 재시도해야 함.

**D번이 정답인 이유:**
- `errorCategory: "transient"`는 일시적 장애임을 나타내고, `isRetryable: true`는 재시도 가능함을 알려줍니다.
- 속도 제한 상황을 설명하여 에이전트가 자체적인 제한된 백오프 전략을 적용할 수 있게 지원합니다.

**오답 분석:**
- Option A, B, C는 권한 오류 설정, 검증 오류 설정, 구조화된 필드 누락 등으로 오답입니다.

---

## 5번 문제 (원본 60번)

**어려운 이유** [부분적으로만 맞는 오답, 덜 틀린 답 고르기] — errorCategory/isRetryable이 MCP 표준 필드가 아니라는 그 자체로 참인 서술이 정답과 경쟁해 "주된 결함"의 층위를 골라야 한다.

**1. 문제 원문**

A team is reviewing an MCP tool's error contract before launch. The current design returns `isError: true` with additional custom fields `errorCategory: "validation"` and `isRetryable: true` whenever the caller omits a required `customer_id` argument, on the reasoning that the agent might supply it correctly on a later attempt within the same conversation. What is the primary flaw in this retry guidance?

A) The `errorCategory` should be set to `'transient'` instead of `'validation'` because the error can be resolved later by the agent, implying a temporary condition.

B) The flaw is that `isRetryable` should be `false`. A missing required argument is a validation error, which means the request is malformed. Retrying the same request will not succeed; the agent must correct the input before retrying. Setting `isRetryable` to `true` misleads the agent into thinking the same request can be retried as-is.

C) The error contract includes fields that are not part of the MCP specification. MCP tool responses only define `isError` to indicate an error; there is no standard `errorCategory` or `isRetryable` field, so consumers may ignore these custom fields and miss the intended recovery guidance.

D) The `isError` field should be set to `false` because the tool can still return a result when the `customer_id` is missing, making the invocation technically successful.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: The flaw is that `isRetryable` should be `false`. A missing required argument is a validation error, which means the request is malformed. Retrying the same request will not succeed; the agent must correct the input before retrying. Setting `isRetryable` to `true` misleads the agent into thinking the same request can be retried as-is.

**정답 및 해설:**

**핵심 개념**: API 오류 계약 및 재시도 의미론(API Error Contract & Retry Semantics)

**문제 상황 분석:**
- 필수 인자 누락으로 인한 유효성 오류(`validation`)가 발생함.
- 에이전트가 나중에 값을 채울 수 있다는 이유로 `isRetryable: true`로 설정함.
- 인자 수정 없이 동일한 요청을 그대로 재시도하게 만드는 모순이 발생함.

**B번이 정답인 이유:**
- 필수 인자 누락은 잘못된 형식의 요청이므로 동일한 요청을 그대로 재시도해도 성공하지 않습니다.
- 따라서 `isRetryable`은 `false`여야 하며, 에이전트가 입력을 수정하여 재요청하도록 유도해야 합니다.

**오답 분석:**
- Option A, C, D는 오류 카테고리를 임의로 바꾸거나 규정 해석을 오인한 설명이므로 오답입니다.

---

---

# B. 프로토콜 오류 vs 도구 오류 vs 빈 결과

28: 스키마 위반은 JSON-RPC 프로토콜 오류, 거절은 isError. 33: 주문 0건은 isError false 빈 배열, 없는 ID는 not_found 오류.

## 6번 문제 (원본 28번)

**어려운 이유** [유사 현상 구분, 복합 시나리오] — 스키마 검증 실패는 프로토콜 계층, 결제 거절은 도구 결과 계층이라는 두 계층을 한 문제에서 갈라야 하고 "둘 다 isError" 선택지가 강하게 유혹한다.

**1. 문제 원문**

A `charge_card` MCP tool receives a request with an amount field formatted as `"$45.00"` instead of a numeric type as specified by its input schema. Before the tool's handler logic even runs, how does the MCP client typically surface this failure, and how should that differ from the tool later reporting a declined charge?

A) The malformed argument triggers a JSON-RPC protocol error from schema validation before the tool executes, while a declined charge is reported inside the tool result with `isError:true`.

B) The client silently coerces the malformed argument to a number before invocation, so neither a schema validation error nor a declined charge occurs; the handler receives a valid amount, and any decline is a business result.

C) Both failures are reported inside a tool result with `isError:true`, because protocol errors are reserved for unknown tool names; all other issues, like malformed arguments or declined charges, appear as tool-level errors.

D) Both failures are reported identically as JSON-RPC protocol errors with code -32602 (Invalid params), because the client validates the request against the schema before calling the tool handler.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**A번**: The malformed argument triggers a JSON-RPC protocol error from schema validation before the tool executes, while a declined charge is reported inside the tool result with `isError:true`.

**정답 및 해설:**  
**핵심 개념**: 프로토콜 수준 에러(Protocol Errors) vs 도구 실행 결과 에러(Tool Execution Errors)  
MCP(Model Context Protocol) 시스템에서 에러는 명확히 두 개의 계층으로 구분됩니다.  
1. **프로토콜 수준 에러 (JSON-RPC Protocol Error)**: 도구 호출 전, 입력 스키마 위반(타입 불일치, 필드 누락, JSON 파싱 실패 등)이 발생할 때 반환됩니다. (예: `-32602 Invalid params`) 핸들러 로직이 실행되지 않습니다.  
2. **도구/비즈니스 수준 에러 (Tool Result Error)**: 도구 핸들러 로직은 정상적으로 구동되었으나, 외부 결제 거절/잔액 부족 등 업무 로직상 실패가 발생했을 때 반환됩니다. 이는 도구 실행 결과(`tool result`) 내에 `isError: true` 항목으로 포함되어 전달됩니다.

**문제 상황 분석:**
- `charge_card` 도구의 스키마는 숫자 타입을 요구하나, 문자열 `"$45.00"` 형태의 잘못된 인자가 입력되었습니다.
- 도구의 실행 로직(핸들러)이 동작하기 전 단계에서 스키마 검증 실패가 발생합니다.
- 스키마 검증 실패 방식과 결제 거절(도구 내부의 비즈니스 결과) 실패 표출 방식 간의 차이를 묻고 있습니다.

**A번이 정답인 이유:**
형식이 잘못된 인자(Malformed argument)는 스키마 검증 단계에서 도구 핸들러 실행 전에 **JSON-RPC 프로토콜 에러**를 유발합니다. 반면 도구가 정상 호출된 후 카드사 응답 등에 의해 발생하는 결제 거절(Declined charge)은 도구 실행 응답(`tool result`) 객체 내부에서 **`isError: true`** 상태로 반환됩니다. 두 에러의 발생 시점과 표출 형태를 정확히 구분하고 있습니다.

**오답 분석:**
- Option B (오답): MCP 클라이언트는 잘못된 데이터 타입을 수동으로 암묵적 타입 변환(Silent coercion)하지 않고 엄격한 스키마 검증을 수행합니다.
- Option C (오답): 프로토콜 에러는 알 수 없는 도구 이름뿐만 아니라 잘못된 파라미터 규격(Invalid params)에도 적용됩니다. 따라서 두 에러가 모두 도구 수준 에러로 반환되지 않습니다.
- Option D (오답): 카드 결제 거절은 비즈니스 로직 실행 결과이므로, 스키마 검증 실패에 사용하는 JSON-RPC 프로토콜 에러 코드(-32602)로 반환되지 않습니다.

<br>

---

## 7번 문제 (원본 33번)

**어려운 이유** [유사 현상 구분] — 주문 0건과 존재하지 않는 고객 ID라는 표면상 동일한 "빈 결과"를 성공/not_found로 나눠야 한다.

**1. 문제 원문**

A `get_customer_orders` MCP tool is called for a customer who exists in the system but has placed zero orders. Separately, the same tool is called with a customer ID that does not exist in the database at all. How should these two outcomes be reported so the agent can respond correctly in each case?

A) Both cases return `isError:true` with `errorCategory` `transient`, and the agent should schedule periodic retries for these calls to account for possible delayed order placement or customer record creation.

B) The zero-orders case returns `isError:false` with an empty order array; the nonexistent-ID case returns `isError:true` with `errorCategory` `not_found_error` and a description that the customer ID was not found.

C) The zero-orders case returns `isError:true` with `errorCategory` `suspicious` and a description noting the empty result; the nonexistent-ID case returns `isError:false` with an empty `orders` array, treating the missing ID as an empty result.

D) Both cases return `isError:false` with an empty `orders` array, and the agent should proceed without error handling for both scenarios, as the tool correctly reports the absence of orders in each case.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: The zero-orders case returns `isError:false` with an empty order array; the nonexistent-ID case returns `isError:true` with `errorCategory` `not_found_error` and a description that the customer ID was not found.

**정답 및 해설:**

**핵심 개념**: 
MCP(Model Context Protocol) 도구의 응답 설계 시, 성공적인 리소스 조회 결과가 단지 빈 집합(empty set)인 경우와 조회 대상 리소스 자체가 존재하지 않는 리소스 조회 실패(Not Found)를 구분해야 합니다. 정상적인 데이터 처리 결과는 성공(`isError:false`)으로 응답하고, 조회 리소스 미존재는 에러(`isError:true`) 및 명확한 에러 카테고리(`not_found_error`)를 반환해야 에러 대처를 정확히 할 수 있습니다.

**문제 상황 분석:**
- 케이스 1: 존재하는 고객이지만 주문 내역이 없음 $\rightarrow$ 시스템 및 고객 조회는 정상 성공했으나 데이터 목록만 비어 있는 정상 응답 상태입니다.
- 케이스 2: 데이터베이스에 입력된 고객 ID 자체가 존재하지 않음 $\rightarrow$ 요청한 대상(Resource)을 찾을 수 없는 명백한 조회 에러 상태입니다.
- 두 상황을 구분 없이 동일하게 처리하면 에러 핸들링 및 사용자에 대한 응답 유효성이 떨어지게 됩니다.

**B번이 정답인 이유:**
존재하는 고객의 주문 0건 케이스는 조회가 정상적으로 완료된 것이므로 `isError:false`와 함께 빈 배열(`[]`)을 반환해야 합니다. 반면, 데이터베이스에 존재하지 않는 고객 ID 케이스는 리소스를 찾을 수 없는 오류 상황이므로 `isError:true`, `errorCategory: not_found_error` 및 오류 상세 설명을 반환하는 것이 시스템 및 에이전트 설계 표준에 부합합니다.

**오답 분석:**
- **Option A (오답)**: 두 케이스 모두 에러(`isError:true`) 및 일시적 오류(`transient`)로 처리하고 재시도를 수행하는 것은 잘못된 오류 분류이자 불필요한 네트워크 재요청을 유발합니다.
- **Option C (오답)**: 정상 조회된 빈 결과를 의심스러운 오류(`suspicious`)로 간주하고, 존재하지 않는 리소스 조회를 성공(`isError:false`)으로 처리하는 것은 두 케이스의 의미를 반대로 뒤바꾼 설명입니다.
- **Option D (오답)**: 존재하지 않는 고객 ID 조회를 정상 응답으로 간주하여 빈 배열로 반환하면, 에러를 감추게 되므로 에러 핸들링이 불가능해집니다.

---

---

# C. 서브에이전트 재시도와 에스컬레이션 — 답이 갈리는 쌍

37: 로컬 재시도로 해결됐으면 성공만 보고. 59: 허용 재시도 소진 시 맥락 첨부해 코디네이터로 전파.

## 8번 문제 (원본 37번)

**어려운 이유** [원칙이 깨지는 예외] — "실패는 상위에 보고한다"는 규칙의 예외로, 로컬에서 해결된 transient 재시도는 성공으로만 보고해야 한다.

**1. 문제 원문**

A coordinator agent delegates a three-step data migration to a subagent: extract, transform, and load, but the load step fails twice on a database connection reset, a known transient condition, before finally succeeding on the third attempt inside the subagent's own execution. What should the subagent report back to the coordinator?

A) An `isError: true` result describing both connection resets in detail, so the coordinator can decide independently whether the migration should be retried

B) A success result summarizing the completed migration, since the transient failures were resolved locally and never needed to surface above the subagent

C) An escalation asking the coordinator to obtain new database credentials, since two consecutive connection resets indicate the credentials have expired

D) A partial-results payload listing only the extract and transform steps as done, omitting the load step entirely since it initially failed twice

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: A success result summarizing the completed migration, since the transient failures were resolved locally and never needed to surface above the subagent

**정답 및 해설:**

**핵심 개념**: 
계층적 에이전트 구조(Hierarchical Agent Architecture) 및 서브에이전트 패턴에서, 서브에이전트는 위임받은 작업을 자체적으로 관리하고 복구하는 캡슐화(Encapsulation) 책임을 가집니다. 일시적 오류(Transient Fault)가 서브에이전트 내부 재시도 로직을 통해 최종 해결되어 전체 작업이 완수되었다면, 상위 코디네이터에게는 불필요한 오류 메시지 대신 **성공 결과**만 보고하는 것이 올바른 설계입니다.

**문제 상황 분석:**
- 상위 코디네이터가 서브에이전트에게 3단계 데이터 마이그레이션(추출 $\rightarrow$ 변환 $\rightarrow$ 로드)을 위임함.
- 마지막 '로드' 단계에서 일시적인 연결 재설정(Transient Condition)으로 2회 실패가 발생했으나, 서브에이전트 내부에서 3번째 시도 만에 최종 성공함.
- 전체 태스크 관점에서는 3단계가 모두 최종 성공적으로 완료된 상태임.

**B번이 정답인 이유:**
일시적인 장애는 서브에이전트 수준에서 이미 성공적으로 복구(Resolved locally)되어 전체 마이그레이션 과업이 완성되었으므로, 코디네이터에게는 최종 작업의 성공 결과만 상위로 보고하는 것이 계층적 위임 구조 및 카오스 차단(Fault Containment) 원칙에 부합합니다.

**오답 분석:**
- **Option A (오답)**: 이미 내부 재시도로 최종 성공했음에도 불구하고 `isError: true`를 반환하면 상위 코디네이터가 불필요하게 전체 태스크를 재시도하거나 에러 처리를 수행하여 중복 작업 및 시스템 혼란을 유발합니다.
- **Option C (오답)**: 연결 재설정이 일시적 오류(Transient Condition)라고 문제에 명시되어 있고 세 번째에 성공했으므로, 자격 증명 만료로 단정 짓고 자격 증명을 재요청하는 것은 잘못된 진단입니다.
- **Option D (오답)**: 세 번째 시도에서 '로드' 단계가 최종 성공했음에도 불구하고 처음에 실패했다는 이유로 결과를 누락하거나 부분 성공으로만 보고하는 것은 데이터 상태 불일치를 일으킵니다.

---

## 9번 문제 (원본 59번)

**어려운 이유** [부분적으로만 맞는 오답] — 재시도 중단·에스컬레이션이라는 방향은 맞지만 타임아웃을 permission으로 재분류하는 오답이 결론만 옳게 배치되어 있다.

**1. 문제 원문**

A subagent handling document translation calls a `translate_text` tool that fails with a connection timeout on the first attempt. The subagent's local retry policy allows up to 2 automatic retries for transient errors before escalating. The second retry also times out. What should the subagent do next?

A) Silently return a fabricated translation to the coordinator, using a cached fallback response from a prior successful call to avoid workflow interruption, despite the translate_text tool timeouts.

B) Stop retrying and propagate the failure to the coordinator, noting the errorCategory, that timeouts persisted across the allowed local attempts, and what text remained untranslated.

C) Continue retrying indefinitely at the subagent level, logging each attempt and resetting the retry count, ensuring that transient errors like timeouts are never escalated to the coordinator.

D) Immediately reclassify the error as a permission failure and propagate it to the coordinator, including the permission flag and that repeated timeouts indicate an access-control issue, while aborting further retries.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Stop retrying and propagate the failure to the coordinator, noting the errorCategory, that timeouts persisted across the allowed local attempts, and what text remained untranslated.

**정답 및 해설:**

**핵심 개념**: 서브에이전트 오류 상격 및 재시도 제한(Subagent Error Escalation & Retry Limits)

**문제 상황 분석:**
- 첫 실패 후 2회의 로컬 자동 재시도를 수행함.
- 두 번째 재시도까지 모두 시간 초과되어 로컬 재시도 한도에 도달함.
- 추가적인 로컬 시도로 해결할 수 없는 지속적 오류 상태임.

**B번이 정답인 이유:**
- 재시도 한계를 초과했으므로 재시도를 중단하고 상위 코디네이터에게 실패를 전파해야 합니다.
- 코디네이터가 적절한 후속 조치를 취할 수 있도록 오류 카테고리, 지속된 타임아웃, 미번역 텍스트 등의 상세 정보를 함께 전달합니다.

**오답 분석:**
- Option A, C, D는 각각 조작된 데이터 반환, 무한 루프 야기, 잘못된 오류 재분류 등으로 시스템 결함을 초래하므로 오답입니다.

---

---

# D. Claude Code 도구 동작 규칙과 MCP 설정

62와 78: 읽기 선행 규칙(Edit는 재읽기, Write는 첫 읽기). 55: re-export 추적은 Read 후 Grep. 17: .mcp.json 환경변수 주입. 66: headersHelper 동적 토큰.

## 10번 문제 (원본 62번)

**어려운 이유** [유사 현상 구분, 근본 원인 vs 증상 완화] — 동일한 Edit 실패 증상이 정규식 이스케이프나 호출 순서가 아니라 외부 수정으로 read-before-edit 상태가 무효화된 것임을 구분해야 한다.

**1. 문제 원문**

A teammate manually edited a shared config file in a separate editor after Claude Code had already read it earlier in the session. Claude now attempts an Edit call against that file using a string it saw during its earlier read, and the call fails. What is the most likely reason, and the correct recovery step?

A) The `old_string` must have contained an unescaped regex metacharacter, so Claude should escape every character in `old_string` and retry the identical call

B) Edit failed because the file was read more than one tool call ago, so Claude should discard the file and recreate it from scratch using Write

C) The file changed on disk since Claude's earlier read, so the read-before-edit check fails; Claude should re-read it and retry Edit against updated text

D) Edit calls always fail on the second attempt within a session, so Claude should switch permanently to Bash-based text replacement for the rest of the session

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: The file changed on disk since Claude's earlier read, so the read-before-edit check fails; Claude should re-read it and retry Edit against updated text

**정답 및 해설:**

**핵심 개념**: 편집 전 읽기 검증 및 동시성 제어(Read-Before-Edit Verification & Concurrency Control)

**문제 상황 분석:**
- 동료가 수동으로 파일을 수정하여 디스크 상의 내용이 변경됨.
- Claude Code가 과거에 읽었던 낡은 문자열을 기준으로 수정(Edit)을 시도하여 검증에 실패함.

**C번이 정답인 이유:**
- 디스크 파일 변경으로 인해 편집 전 무결성 검사가 실패하므로, 파일을 다시 읽은 뒤 업데이트된 텍스트를 대상으로 수정 작업을 재시도해야 합니다.

**오답 분석:**
- Option A, B, D는 정규식 문제 가정, 불필요한 파일 재생성, 잘못된 세션 동작 가정 등을 담고 있어 오답입니다.

---

## 11번 문제 (원본 78번)

**어려운 이유** [원칙이 깨지는 예외] — "새 파일 생성엔 선행 Read 불필요"라는 규칙의 반대 사례로 기존 파일 덮어쓰기에는 Read가 필수다.

**1. 문제 원문**

Claude Code needs to overwrite an existing configuration file, settings.local.json, with an updated version generated in response to the architect's request. Claude has not read this file at any point earlier in the current conversation. What must Claude do before the Write call will succeed?

A) Run Grep against the file to confirm its current contents, since Grep results satisfy the same prior-access requirement that Read would

B) Read the existing file first, since Write requires it to have been read in this conversation before overwriting an existing file

C) Delete the file first using Bash, since Write can only create files that do not already exist and cannot overwrite one directly

D) Nothing extra is required, since Write can overwrite any existing file at any time regardless of whether it has been read in the conversation

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Read the existing file first, since Write requires it to have been read in this conversation before overwriting an existing file

**정답 및 해설:**

**핵심 개념**: Claude Code의 안전장치(Safety Guardrail) 중 하나로, 기존 파일의 원본 유실이나 잘못된 수정 방지를 위해 파일 덮어쓰기(`Write`) 작업 전 대화 세션 내에서 해당 파일에 대한 사전 읽기(`Read`)를 강제합니다.

**문제 상황 분석:**
- 기존 파일 `settings.local.json`을 수정하여 덮어쓰려 함
- 대화 시작 후 해당 파일을 한 번도 읽지 않음

**B번이 정답인 이유:**
Claude Code 시스템은 존재 중인 파일 덮어쓰기 전에 선행 `Read` 호출을 필수 요구조건(Prior-access requirement)으로 지정하고 있으므로, 먼저 파일을 읽어야만 Write가 수행됩니다.

**오답 분석:**

- Option A (오답): Grep으로 내용을 확인하는 것은 정식 Read 호출 조건으로 인정되지 않습니다.
- Option C (오답): 파일 삭제 후 생성이 아니라 기존 파일 덮어쓰기 기능이 지원되며, 읽기 조건만 충족하면 됩니다.
- Option D (오답): 사전 읽기 없이 바로 덮어쓰는 것은 덮어쓰기 안전 정책에 위배됩니다.

---

## 12번 문제 (원본 55번)

**어려운 이유** [원칙이 깨지는 예외, 복합 시나리오] — 별칭 재export 때문에 원본 심볼 단일 grep이 통하지 않는 예외라 "grep 한 번" 습관이 틀린 답이 된다.

**1. 문제 원문**

A module `dateUtils.ts` re-exports several functions under different names, such as `export { formatDate as fmt, parseDate as pd }`. Claude needs to find every caller of either the original or the re-exported names before it can safely rename the underlying `formatDate` function. Which approach correctly accounts for the re-exports?

A) Run Glob for `**/dateUtils*` to find files related to date utilities, then assume every caller also lives inside a file matching that same pattern

B) Read dateUtils.ts first to identify every exported name including aliases, then Grep for each exported name across the codebase

C) Run Bash to count how many times the word export appears in the repository, then read only the files where that count exceeds a fixed threshold

D) Run a single Grep search for the literal string formatDate, assuming any caller that uses the alias fmt will also match that same pattern

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Read dateUtils.ts first to identify every exported name including aliases, then Grep for each exported name across the codebase

**정답 및 해설:**

**핵심 개념**: 코드 리팩토링 시 심볼 파악 및 코드베이스 검색(`Read` -> `Grep`)  
함수 이름을 리팩토링/변경할 때, 해당 함수가 다른 이름(Alias/Re-export)으로 재정의되어 사용 중이라면 단일 원본 이름 검색만으로는 호출 지점(Caller)을 모두 찾아낼 수 없습니다. 따라서 모듈 파일을 먼저 읽어 별칭을 식별한 뒤, 식별된 모든 이름들에 대해 코드베이스 전체를 검색하는 단계별 접근 방식이 필수적입니다.

**문제 상황 분석:**
- `formatDate` 함수가 `dateUtils.ts` 내에서 `fmt`라는 별칭(alias)으로 re-export되어 있음
- 외부 코드에서는 `formatDate`뿐만 아니라 `fmt`라는 이름으로 해당 함수를 호출하고 있을 가능성이 있음
- 안전한 함수명 변경을 위해 모든 실제 호출 지점(Caller)을 누락 없이 파악해야 함

**B번이 정답인 이유:**
먼저 `Read` 도구로 `dateUtils.ts` 파일의 내용을 확인하여 `formatDate`가 `fmt`로 re-export되었음을 파악한 후, `formatDate`와 `fmt` 두 이름 모두에 대해 `Grep` 검색을 수행해야 코드베이스 전체에서 호출되는 모든 위치를 완벽하게 추적할 수 있습니다.

**오답 분석:**
- **Option A (오답)**: `Glob`은 파일 경로만 검색하므로 파일 내부에서 함수를 호출하는 지점을 찾을 수 없으며, 호출자가 반드시 동일한 파일명 패턴 내에만 존재한다는 가정은 잘못되었습니다.
- **Option C (오답)**: export 단어의 등장 횟수를 기준으로 임계값을 적용하는 방식은 호출 지점을 탐색하는 것과 전혀 무관한 잘못된 접근 방식입니다.
- **Option D (오답)**: `formatDate` 문자열만 단일 Grep으로 검색하면, 별칭인 `fmt`로 호출하고 있는 위치를 모두 놓치게(Miss) 되므로 리팩토링 시 런타임 에러가 발생할 수 있습니다.

---

## 13번 문제 (원본 17번)

**어려운 이유** [원칙이 깨지는 예외, 덜 틀린 답 고르기] — `${CLAUDE_PROJECT_DIR}`는 셸이 아니라 Claude Code가 주입하므로 "미설정 변수는 빈 문자열" 일반 규칙을 적용하면 오히려 틀린다.

**1. 문제 원문**

A project-scoped stdio server's `.mcp.json` entry sets `"args": ["--root", "${CLAUDE_PROJECT_DIR}"]` with no fallback value. What happens when a teammate runs Claude Code from a shell where this variable happens not to be set in their own environment?

A) It resolves correctly, since Claude Code injects `CLAUDE_PROJECT_DIR` into the spawned server's own environment, though a default like `${CLAUDE_PROJECT_DIR:-.}` remains the safer practice

B) The expansion silently becomes an empty string in this case, since Claude Code never provides a value for this variable unless a plugin explicitly sets one

C) The expansion fails outright, because `${CLAUDE_PROJECT_DIR}` can only ever be read from the invoking shell's own environment, never from a value Claude Code injects itself

D) The expansion falls back automatically to the user's home directory, since that is treated as the implicit default whenever no fallback is written in `.mcp.json`

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**A번**: It resolves correctly, since Claude Code injects `CLAUDE_PROJECT_DIR` into the spawned server's own environment, though a default like `${CLAUDE_PROJECT_DIR:-.}` remains the safer practice

**정답 및 해설:**  
**핵심 개념**: Claude Code 내장 환경 변수 주입 (Built-in Environment Variables Injection)  
Claude Code는 프로젝트 실행 환경을 정교하게 제어하기 위해 실행 시 `CLAUDE_PROJECT_DIR`와 같은 핵심 프로젝트 환경 변수를 내부적으로 자동 생성하여 자식 프로세스(MCP 서버 등)의 환경 변수로 주입합니다.

**문제 상황 분석:**
- 팀원의 로컬 OS/쉘 환경변수에는 `CLAUDE_PROJECT_DIR` 변수가 직접 정의되어 있지 않은 상태입니다.
- 프로젝트 내 `.mcp.json` 설정 파일에는 `"args": ["--root", "${CLAUDE_PROJECT_DIR}"]` 형태로 해당 변수를 참조하도록 등록되어 있습니다.
- 환경 변수 미설정 시 대체값(fallback syntax, 예: `${CLAUDE_PROJECT_DIR:-.}`)이 지정되지 않은 경우 정상 작동 여부가 질문의 핵심입니다.

**A번이 정답인 이유:**
Claude Code는 쉘 실행 환경에 해당 변수가 설정되어 있지 않더라도 프로세스를 구동할 때 프로젝트 루트 경로를 가리키는 `CLAUDE_PROJECT_DIR` 값을 자동으로 할당하여 실행 환경(spawned environment)에 주입(inject)합니다. 따라서 매개변수 치환은 올바르게 동작합니다. 다만, 시스템 환경 간 호환성을 보장하기 위해 기본값(`${CLAUDE_PROJECT_DIR:-.}`)을 작성해 두는 것이 보안 및 모범 사례(Safer practice)로 권장됩니다.

**오답 분석:**
- Option B (오답): Claude Code는 `CLAUDE_PROJECT_DIR` 값을 내장 제공하므로 플러그인 유무와 상관없이 빈 문자열로 처리되지 않습니다.
- Option C (오답): 변수를 오직 호출 쉘(Invoking shell)에서만 읽을 수 있는 것은 아니며, Claude Code가 스스로 주입한 값을 정상 수신합니다.
- Option D (오답): `.mcp.json`에서 대체 값이 없을 때 자동으로 홈 디렉터리(`~`)로 대체되는 암묵적 메커니즘은 존재하지 않습니다.

<br>

---

## 14번 문제 (원본 66번)

**어려운 이유** [원칙이 깨지는 예외, 덜 틀린 답 고르기] — 연결마다 토큰을 생성하는 headersHelper가 매우 그럴듯하지만 Kerberos는 중개 서비스로 우회하라는 예외가 정답이다.

**1. 문제 원문**

An internal MCP server requires a Kerberos-derived token that must be freshly minted for every connection, and no OAuth authorization server is involved. According to Anthropic documentation, which approach is most accurate for handling this authentication scheme?

A) Configure a static `headers` entry with the token value hardcoded, then rotate the config file manually whenever the token expires.

B) Configure `headersHelper` to run a script that generates the token and writes the resulting header JSON to stdout on each connection.

C) Configure the `oauth` block with `authServerMetadataUrl` pointed at the internal Kerberos realm so Claude Code discovers the flow automatically.

D) Do not attempt to configure Kerberos directly in Claude Code MCP authentication; use an intermediary service that authenticates via Kerberos and then uses Anthropic-supported credentials such as API keys or OAuth tokens.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Configure `headersHelper` to run a script that generates the token and writes the resulting header JSON to stdout on each connection.

**정답 및 해설:**

**핵심 개념**: MCP 설정에서 `headersHelper`를 이용한 동적 헤더 생성(Dynamic Header Generation via `headersHelper` in MCP)

**문제 상황 분석:**
- 매 연결마다 새로 발급되어야 하는 Kerberos 파생 토큰이 필요함.
- OAuth 서버가 관여하지 않아 일반적인 OAuth 흐름 사용이 불가함.

**B번이 정답인 이유:**
- `headersHelper`는 연결 시마다 스크립트를 실행하여 동적으로 인증 헤더를 생성하고 stdout으로 전달하도록 공식 지원되는 메커니즘입니다.

**오답 분석:**
- Option A, C, D는 수동 교체, 부적절한 OAuth 블록 사용, 불필요한 중계 서비스 도입 등을 요구하므로 오답입니다.

---

---

# E. 도구/API 설계

51: manual thinking에서 tool_choice any 불가. 79: 다목적 도구 분리.

## 15번 문제 (원본 51번)

**어려운 이유** [원칙이 깨지는 예외] — 수동 extended thinking에서 tool_choice any/tool이 미지원이라는 좁은 예외 규정이고 오답들이 모두 그럴듯한 API 제약처럼 서술되어 있다.

**1. 문제 원문**

A team is building an agent that uses manual extended thinking (`thinking: {"type": "enabled"}`) to reason before acting, and they want to force it to always call a tool rather than answer directly. They set `tool_choice` to `{"type": "any"}` while manual extended thinking is enabled, and the request fails. What is the correct explanation and recommended remedy?

A) The request failed because extended thinking disables all `tool_choice` options; to fix this, remove all tools from the request and let the model output its reasoning steps as text before acting.

B) The request failed because `{"type": "any"}` requires at least two tools to be defined; adding a second tool, such as a calculator, resolves the incompatibility with extended thinking.

C) The request failed because `{"type": "any"}` is deprecated; replace it with `{"type": "forced"}` and specify a tool name like `search` to satisfy the forced tool choice requirement.

D) When manual extended thinking is enabled, the `tool_choice` values `{"type": "any"}` and `{"type": "tool", ...}` are not supported; set it to `{"type": "auto"}` or `{"type": "none"}` instead. To force a tool call while still using thinking, migrate to adaptive thinking (supported on newer models), or disable manual extended thinking.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: When manual extended thinking is enabled, the `tool_choice` values `{"type": "any"}` and `{"type": "tool", ...}` are not supported; set it to `{"type": "auto"}` or `{"type": "none"}` instead. To force a tool call while still using thinking, migrate to adaptive thinking (supported on newer models), or disable manual extended thinking.

**정답 및 해설:**

**핵심 개념**: Anthropic Claude API의 Extended Thinking과 Tool Choice 제한사항  
Anthropic API에서 수동 확장 사고(Manual Extended Thinking, `thinking: {"type": "enabled"}`) 기능을 사용할 때, 도구 호출을 강제하는 `tool_choice: {"type": "any"}` 또는 특정 도구를 지정하는 `tool_choice: {"type": "tool", "name": "..."}` 옵션은 서로 비호환되어 API 레벨에서 에러를 반환합니다. 수동 사고 모드에서는 `auto` 또는 `none`만 지원됩니다.

**문제 상황 분석:**
- 개발팀이 사고 과정(Extended Thinking)을 거친 후 반드시 도구를 호출하도록 `tool_choice: {"type": "any"}` 설정
- 수동 확장 사고(`type: "enabled"`)가 활성화된 상태에서 도구 강제 제약조건(`any` / `tool`)을 함께 적용함
- 두 파라미터 간의 제약조건 충돌로 인해 API 요청 실패 발생

**D번이 정답인 이유:**
수동 확장 사고(Manual Extended Thinking)를 사용할 때 Anthropic API 사상 `tool_choice`는 `auto` 및 `none`만 허용됩니다. 따라서 강제 도구 호출(`any`, `tool`)을 적용하면 안 되며, 만약 사고 과정과 도구 강제 호출을 함께 사용해야 한다면 지원하는 적응형 사고(Adaptive Thinking) 모드로 전환하거나 수동 확장 사고 기능을 비활성화해야 합니다.

**오답 분석:**
- **Option A (오답)**: 확장 사고가 모든 `tool_choice` 옵션을 비활성화하는 것은 아닙니다. `auto` 및 `none` 설정은 정상 지원됩니다.
- **Option B (오답)**: `{"type": "any"}`는 단 1개의 도구만 정의되어 있어도 올바르게 동작하는 옵션이며, 도구 개수의 문제가 아닙니다.
- **Option C (오답)**: Anthropic API에서 `{"type": "any"}`는 정상적인 파라미터이며, `{"type": "forced"}`라는 값은 존재하지 않습니다.

---

## 16번 문제 (원본 79번)

**어려운 이유** [부분적으로만 맞는 오답] — mode enum 추가는 방향이 맞지만 단일 설명문을 그대로 두어 모호성이 남는다는 점을 짚어야 도구 분할을 고를 수 있다.

**1. 문제 원문**

A single tool, analyze_document, extracts data points, produces summaries, and verifies claims against a source. Users report it inconsistently performs only one of these behaviors for ambiguous requests. Which redesign best addresses this?

A) Split the tool into extract_data_points, summarize_content, and verify_claim_against_source, each with a narrow contract.

B) Merge the tool with unrelated tools into one larger tool so the model faces fewer total choices overall.

C) Add a required mode enum parameter to the existing tool, but leave its single overarching description unchanged.

D) Keep the single tool but instruct the model, in the system prompt, to always call it three separate times per request.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Split the tool into extract_data_points, summarize_content, and verify_claim_against_source, each with a narrow contract.

**정답 및 해설:**

**핵심 개념**: 거대하고 다기능을 가진 모놀리식 도구(Monolithic Tool)는 AI에게 실행 혼란을 일으키므로, 명확하고 단일화된 기능 범위(Narrow contract)를 지닌 독립적 도구들로 분할 설계해야 합니다.

**문제 상황 분석:**
- `analyze_document` 도구가 추출, 요약, 검증 3가지 역할을 한꺼번에 맡음
- 모호한 사용자 요청 시 일부 기능만 무작위로 수행하는 문제 발생

**A번이 정답인 이유:**
세 가지 동작을 각각 별개의 전용 도구로 나누고 각 도구의 명세를 명확하게 제한함으로써, AI가 요청 목적에 맞게 필요한 도구만 정확히 선택하여 실행하도록 보장합니다.

**오답 분석:**

- Option B (오답): 더 큰 도구로 합치는 것은 모호성과 복잡도를 한층 더 높입니다.
- Option C (오답): mode 매개변수를 추가하더라도 통틀어 놓은 설명을 고치지 않으면 여전히 판단 혼란을 줍니다.
- Option D (오답): 요청마다 무조건 3번씩 호출을 강제하는 것은 심각한 자원 오남용 및 비효율을 초래합니다.

---
