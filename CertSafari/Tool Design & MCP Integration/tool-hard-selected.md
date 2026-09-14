# Tool Design & MCP Integration 고난도

---

# 1번 문제

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

# 2번 문제

**1. 문제 원문**

A coordinator dispatches the same document-indexing task to three subagents in parallel, each covering a different folder. Subagent 1 finishes cleanly. Subagent 2 hits a permission error on one file it cannot resolve locally and reports partial results plus that failure. Subagent 3's process crashes with no output at all. How should the coordinator's downstream handling differ between subagent 2 and subagent 3?

A) The coordinator should treat both subagent 2 and subagent 3 identically by discarding any partial results from subagent 2 and marking both folders for indexing as unprocessed, since neither subagent fully completed its assigned indexing task successfully.

B) The coordinator should treat both subagent 2 and subagent 3 identically by retrying files with permission errors, assuming subagent 3's crash was also due to a permission issue on some file, since that is the most common cause of non-completion in such tasks.

C) For subagent 2, the coordinator should ignore the reported permission error and mark the folder complete, since most files were indexed successfully, and for subagent 3, the coordinator should also mark its folder complete because no error was reported.

D) For subagent 2, the coordinator can use the partial results and address the specific reported permission gap; for subagent 3, lacking completed work or diagnostic detail, it must treat the entire folder as unprocessed.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**D번**: For subagent 2, the coordinator can use the partial results and address the specific reported permission gap; for subagent 3, lacking completed work or diagnostic detail, it must treat the entire folder as unprocessed.

**정답 및 해설:**  

**핵심 개념**: 멀티 에이전트 분산 처리 및 오류 핸들링 (Partial Results vs Process Crash)  
멀티 에이전트 시스템에서 병렬 작업을 수행할 때 발생한 에러의 형태(우아한 실패 보고 vs 예기치 않은 프로세스 다운)에 따라 코디네이터의 후속 처리 전략이 달라집니다. 부분적인 성과와 명확한 진단 정보가 전달된 경우 이를 활용하여 핀포인트 조치를 취하고, 진단 정보가 전혀 없이 강제 종료된 작업은 안전하게 전체 재처리를 준비해야 합니다.

**문제 상황 분석:**  
- 서브에이전트 1: 정상 완결 (추가 조치 불필요).
- 서브에이전트 2: 일부 작업 성공 후 특정 파일의 권한 문제로 실패했음을 코디네이터에게 우아하게 보고함 (부분 결과 및 명확한 오류 메타데이터 존재).
- 서브에이전트 3: 아무런 출력이나 에러 로그 없이 프로세스 자체가 크래시(Crash)됨 (완료된 결과물 및 에러 진단 정보가 전무함).

**D번이 정답인 이유:**  
- **서브에이전트 2 대응**: 유효하게 처리된 부분 결과를 버리지 않고 활용하면서, 보고된 단일 권한 문제(Permission Gap)에 대해서만 권한 부여 후 재시도 등의 타겟 조치를 수행할 수 있습니다.
- **서브에이전트 3 대응**: 프로세스가 완전 다운되어 어디까지 진행되었는지 판단할 데이터나 실패 원인 진단 정보가 전혀 없으므로, 데이터 정합성을 위해 해당 폴더 전체를 미처리(Unprocessed) 상태로 간주하고 처음부터 재작업을 계획해야 합니다.

**오답 분석:**  
- Option A (오답): 서브에이전트 2가 제공한 유효한 부분 결과와 진단 정보를 무시하고 모두 버리는 것은 자원 낭비이며 비효율적입니다.
- Option B (오답): 진단 데이터가 전혀 없는 서브에이전트 3의 충돌 원인을 추측에 기반하여 "권한 문제"로 지레짐작하고 처리하는 것은 위험한 자율성 설계입니다.
- Option C (오답): 일부 파일 인덱싱 실패 및 프로세스 충돌로 인한 미완료 상태를 무시하고 폴더 전체를 "완료됨"으로 표시하면 데이터 누락 및 시스템 오작동을 유발합니다.

---

# 13번 문제

**1. 문제 원문**

A coordinator agent delegates tasks to a research agent, a coding agent, and a QA agent. Currently, every subagent is configured with the full union of all tools used anywhere in the pipeline, so each has around 15 tools available, and each agent's tool choice is left at {"type": "auto"} in every turn. The team reports agents occasionally reaching for tools clearly outside their remit, like the QA agent invoking a deploy tool. What combination of changes best addresses this while preserving each agent's ability to decide when to act versus respond?

A) Keep the shared 15-tool set for all subagents, but switch every subagent's tool_choice to {"type": "any"} so a tool call is always forced, ensuring subagents cannot respond without selecting a tool.

B) Restrict each subagent's tool set to only what its own role needs, and also force every subagent's tool_choice to a single named tool for all turns, such as search tool for research and test tool for QA.

C) Restrict each subagent's tool set to only what its role needs, while keeping tool_choice at {"type": "auto"} so each agent still decides per turn whether to call a tool.

D) Keep the shared 15-tool set for all subagents, but switch every subagent's tool_choice to {"type": "none"} so no subagent can call tools directly, requiring the coordinator to invoke tools on its behalf.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Restrict each subagent's tool set to only what its role needs, while keeping tool_choice at {"type": "auto"} so each agent still decides per turn whether to call a tool.

**정답 및 해설:**

**핵심 개념**: 도구 스코핑(Tool Scoping/Least Privilege) 및 `tool_choice: "auto"`  
멀티 에이전트 시스템에서 에이전트가 권한을 벗어난 도구를 오용하는 문제를 방지하는 가장 올바른 기법은 **최소 권한의 원칙(Principle of Least Privilege)**에 따라 각 에이전트 역할에 필수적인 도구만 노출되도록 제한(Restrict Tool Set)하는 것입니다. 이때 `tool_choice`를 `"auto"`로 유지해야 에이전트가 상황에 따라 도구를 호출(act)할지, 아니면 단순 자연어 응답(respond)을 생성할지 스스로 자율적으로 판단할 수 있습니다.

**문제 상황 분석:**
- 모든 서브에이전트에 15개의 전체 도구 세트가 통째로 제공되고 있음.
- QA 에이전트가 배포 도구를 호출하는 등 담당 소관(Remit)을 벗어나는 도구 오용 현상이 발생함.
- **요구사항**: 도구 오용을 방지하면서도, 각 에이전트가 턴별로 "도구를 실행할지(act) vs 대화로 응답할지(respond)" 결정하는 자율적 능력을 유지해야 함.

**C번이 정답인 이유:**
- **도구 범위 제한(Role-based Scoping)**: QA 에이전트에는 QA 도구만, 리서치 에이전트에는 리서치 도구만 제공하여 근본적으로 타 역할의 도구를 호출할 위험을 차단합니다.
- **자율성 유지(`"auto"`)**: `tool_choice`를 `{"type": "auto"}`로 유지하면 모델이 필요에 따라 도구를 호출하거나 텍스트로 바로 응답하는 동작 방식을 계속해서 자유롭게 선택할 수 있습니다.

**오답 분석:**

- Option A (오답): `{"type": "any"}`는 턴마다 무조건 아무 도구나 하나 이상 호출하도록 강제하므로, 도구를 사용하지 않고 텍스트로 응답(respond)하려는 자율적 결정을 불가능하게 만듭니다. 또한 15개 전체 도구를 유지하면 도구 오용 문제가 해결되지 않습니다.
- Option B (오답): 특정 도구 단 하나로 `tool_choice`를 고정하면 에이전트가 도구를 쓰지 않고 일반 텍스트로 응답하는 옵션이 차단되며, 다양한 도구를 상황에 맞게 선택할 수 없게 됩니다.
- Option D (오답): `{"type": "none"}`으로 설정하면 서브에이전트가 도구를 전혀 사용할 수 없어 에이전트 본연의 자율적 동작 및 도구 호출 수행 능력(act)이 상실됩니다.

---

### 20번 문제

**1. 문제 원문**

An architect asks Claude Code to find every place in a large monorepo that calls a function named `parseInvoice`, including calls inside a minified bundle that is gitignored but still needs to be checked. Which approach correctly locates all call sites?

A) Run Glob with the pattern `**/*parseInvoice*` to find files whose names contain the function, then treat that file list as the complete set of callers


B) Run Glob with the pattern `**/*.js` to list every JavaScript file, then judge from file names alone which ones likely reference parseInvoice


C) Run Grep across the repo for parseInvoice, then Grep the gitignored bundle's path directly, since a direct path is still searched


D) Run Grep once with the multiline flag enabled, assuming multiline mode makes Grep search gitignored files as a side effect of that flag

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**C번**: Run Grep across the repo for parseInvoice, then Grep the gitignored bundle's path directly, since a direct path is still searched

**정답 및 해설:**  
**핵심 개념**: Claude Code 도구 검색 동작 방식 (`Grep` 및 `.gitignore` 메커니즘)  
Claude Code의 `Grep` 도구(ripgrep 기반)는 기본적으로 프로젝트의 `.gitignore` 규칙을 준수하여 무시된 파일 및 디렉터리(예: `dist/`, `build/`, `node_modules/` 등)를 전체 검색 대상에서 제외합니다. 하지만 `.gitignore`에 등록된 경로라 할지라도 검색 명령어에 대상 파일이나 디렉터리 경로를 명시적으로 직접 지정하면 해당 경로 내부를 검색합니다.

**문제 상황 분석:**
- 대규모 모노레포에서 `parseInvoice` 함수가 호출되는 모든 위치를 찾아야 합니다.
- 전체 코드베이스 외에도, `.gitignore`에 등록되어 검색 기본 대상에서 제외되는 경량화된 번들(Minified bundle) 파일 내부까지 확인해야 하는 조건이 존재합니다.
- `.gitignore` 처리된 파일까지 빠짐없이 검색하기 위한 정확한 탐색 전략을 도출해야 합니다.

**C번이 정답인 이유:**
일반적인 리포지토리 전체 `Grep` 실행은 `.gitignore`에 지정된 무시 대상을 자동으로 스킵합니다. 따라서 전체 리포지토리에 대해 1차 검색을 수행한 후, `.gitignore` 처리된 번들 파일의 경로를 직접(Direct path) 지정하여 추가 `Grep`을 실행하면 제외되었던 경로까지 정확하게 검색하여 모든 호출 위치를 누락 없이 확보할 수 있습니다.

**오답 분석:**
- Option A (오답): `Glob`은 파일/디렉터리의 '이름'이나 '경로 패턴'을 검색하는 도구입니다. 코드 내부에서 함수가 호출된 내용(텍스트)을 검색하는 데 사용할 수 없으며, 파일명에 함수 이름이 포함되어 있지 않으면 찾을 수 없습니다.
- Option B (오답): `Glob`으로 자바스크립트 파일 목록만 나열한 뒤 파일명만 보고 함수 참조 여부를 추측하는 것은 실제 코드 내용을 탐색하지 못하므로 오탐 및 누락이 발생합니다.
- Option D (오답): `multiline` 옵션은 여러 줄에 걸친 문자열 패턴 검색을 지원하는 플래그일 뿐, `.gitignore` 규칙을 무시하거나 우회하는 효과를 제공하지 않습니다.

---

### 27번 문제

**1. 문제 원문**

An MCP server exposes `update_inventory`. When the request body is missing the required `sku` field, the server currently returns `isError: true` with `errorCategory: "transient"` and `isRetryable: true`. An agent retries the exact same malformed request repeatedly and never succeeds. What is wrong with this error classification?

A) `isRetryable` should remain true because validation errors are inherently transient once the missing field is eventually supplied by a later, unrelated request


B) The categorization is correct as written, since the agent's repeated retries are the expected and desired behavior for any error carrying `isRetryable: true`


C) The tool should have used a JSON-RPC protocol-level error instead of a tool result, since any error involving a missing field must always be surfaced at the protocol layer


D) A missing required field is a validation error, not a transient one, so marking it retryable causes the agent to resend an identically malformed request instead of correcting the input

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**D번**: A missing required field is a validation error, not a transient one, so marking it retryable causes the agent to resend an identically malformed request instead of correcting the input

**정답 및 해설:**  
**핵심 개념**: MCP 에러 분류 및 재시도 메커니즘 (Error Classification & Retry Logic)  
MCP 및 에이전트 시스템에서 에러는 네트워크 타임아웃, 일시적 일시 정지 등과 같은 **일시적 에러(Transient Error)**와, 잘못된 요청 파라미터나 누락된 필수 필드 등과 같은 **유효성/입력 에러(Validation Error / Permanent Error)**로 구분됩니다. 유효성 에러를 일시적 에러로 잘못 분류하고 `isRetryable: true`로 설정하면, 에이전트는 입력을 수정하지 않은 채 똑같이 잘못된 요청을 무한히 재시도하는 무한 루프에 빠지게 됩니다.

**문제 상황 분석:**
- `update_inventory` 도구 실행 시 필수 값인 `sku` 필드가 누락되는 입력 오류가 발생했습니다.
- 서버가 이를 일시적 에러(`transient`)로 분류하고 `isRetryable: true`를 반환했습니다.
- 에이전트는 이 응답을 받고 입력값을 수정하는 대신 동일한 페이로드를 반복 재시도하여 계속 실패하는 문제가 발생했습니다.

**D번이 정답인 이유:**
필수 필드 누락은 일시적인 네트워크 장애가 아닌 클라이언트의 **입력 검증 에러(Validation error)**입니다. 재시도 가능(`isRetryable: true`)으로 응답하면 에이전트는 단순 재시도(Retry)로 해결될 것이라 판단하여 잘못된 요청을 그대로 재전송하게 되므로, 이를 잘못된 에러 분류로 올바르게 지적한 D번이 정답입니다.

**오답 분석:**
- Option A (오답): 나중에 다른 관련 없는 요청이 필드를 제공한다고 해서 이전 잘못된 요청이 자동으로 해결되지 않습니다. 유효성 에러는 일시적 에러가 아닙니다.
- Option B (오답): 에이전트가 실패할 것이 명확한 요청을 무한 반복 재시도하는 것은 잘못된 분류로 인해 발생한 부작용이며, 정상적인 동작이 아닙니다.
- Option C (오답): 도구가 정상적으로 수신되어 인자(Argument) 수준에서 유효성 검사가 실패한 경우, 이는 JSON-RPC 프로토콜 자체의 파싱 실패가 아니라 도구 실행 결과(Tool result) 내의 응답 오류로 처리되는 것이 일반적입니다.

---

### 29번 문제

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

---

### 30번 문제

**1. 문제 원문**

A `search_tickets` MCP tool queries a support database for tickets matching a filter. For a particular customer, the query executes successfully but zero tickets match. The tool currently returns `isError: true` with the text "No tickets found," and the coordinating agent responds to the user by apologizing for a system failure. What is the correct fix?

A) Keep `isError: true` but change errorCategory to transient so the agent automatically retries the identical search until a ticket eventually appears


B) Keep `isError: true` and add isRetryable false, since an empty result set should be treated the same as any other failed tool invocation


C) Return `isError: false` but omit the results array entirely, letting the agent infer from the missing field that the search matched nothing


D) Return `isError: false` with structured content showing an empty results array, since a successful query with no matches is not a tool execution error

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**D번**: Return `isError: false` with structured content showing an empty results array, since a successful query with no matches is not a tool execution error

**정답 및 해설:**  
**핵심 개념**: MCP 도구 에러 처리 vs 빈 검색 결과 (Tool Errors vs Empty Results)  
MCP(Model Context Protocol) 및 에이전트 개발에서 도구 실행 에러(`isError: true`)는 데이터베이스 연결 실패, 권한 오류, 구문 오류 등 도구 수행 자체의 시스템적 결함이 발생했을 때만 사용해야 합니다. 쿼리가 정상 실행되어 조건에 맞는 데이터가 0건 조회된 것은 정상적인 실행 결과(Success)이며, 이때는 `isError: false`와 함께 빈 배열(`[]`) 형태의 구조화된 데이터(Structured content)를 반환해야 에이전트가 시스템 에러로 오해하지 않고 사용자에게 정확한 검색 결과를 안내할 수 있습니다.

**문제 상황 분석:**
- `search_tickets` 쿼리는 성공적으로 실행되었으나 조건에 맞는 티켓이 없어 결과가 0건 나왔습니다.
- 도구가 결과가 없음을 사유로 `isError: true`를 반환했습니다.
- 이를 수신한 에이전트는 시스템 장애가 발생한 것으로 판단하여 사용자에게 불필요한 사과 응답을 제공하는 문제가 발생했습니다.

**D번이 정답인 이유:**
검색 결과가 없는 것은 도구 실행 에러가 아닙니다. 따라서 `isError: false`를 반환하고 응답 내에 빈 배열(`"results": []`)을 구조화하여 명시해 주는 것이 올바른 도구 응답 설계입니다. 이를 통해 에이전트는 시스템 장애가 아닌 "조건에 일치하는 티켓이 없음"이라는 정상적인 검색 결과를 올바르게 인식하고 응답하게 됩니다.

**오답 분석:**
- Option A (오답): 일치하는 데이터가 없는 정상 응답 상태를 일시적 에러(`transient`)로 변경하면, 무의미하게 동일한 검색을 반복 재시도하는 낭비가 발생합니다.
- Option B (오답): 정상적인 빈 결과를 여전히 에러(`isError: true`)로 처리하는 것은 문제의 원인을 해결하지 못하며 에이전트가 지속적으로 장애로 인식하게 만듭니다.
- Option C (오답): 배열 자체를 생략해 버리면 에이전트가 결과를 해석할 때 스키마 불일치로 또 다른 에러나 환각을 일으킬 수 있으며, 검색 결과가 비어 있음을 나타내는 올바른 스키마 표현은 빈 배열(`[]`)을 명시하는 것입니다.

---

### 31번 문제

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

### 33번 문제

**1. 문제 원문**

An onboarding agent walks a new user through account setup and needs to call `create_profile` immediately as the very first action of the conversation, before considering any other tool such as `send_welcome_email` or `assign_default_settings`. After that first call, the agent should freely decide among the remaining tools based on what the user says. What is the best way to configure this?

A) Order `create_profile` first in the `tools` array and leave `tool_choice` at `{"type": "auto"}` for the whole conversation

B) Use `tool_choice: {"type": "none"}` for the first turn so the model cannot call any tool, then switch to `{"type": "auto"}` afterward

C) Use `tool_choice: {"type": "any"}` for the entire conversation so the model is always forced to pick from `create_profile`, `send_welcome_email`, and `assign_default_settings`

D) Use `tool_choice: {"type": "tool", "name": "create_profile"}` for the first turn only, then switch to `tool_choice: {"type": "auto"}` for subsequent turns

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Use `tool_choice: {"type": "tool", "name": "create_profile"}` for the first turn only, then switch to `tool_choice: {"type": "auto"}` for subsequent turns

**정답 및 해설:**

**핵심 개념**: 
Anthropic Claude API의 `tool_choice` 파라미터는 모델의 도구 호출 동작을 정밀하게 제어합니다. 특정 도구를 무조건 강제로 실행하게 하려면 `{"type": "tool", "name": "<tool_name>"}`을 지정하며, 이후 턴에서 모델이 대화 흐름에 따라 도구 사용 여부 및 종류를 자율적으로 판단하게 하려면 `{"type": "auto"}`로 변경해야 합니다.

**문제 상황 분석:**
- 첫 턴에서는 다른 도구보다 `create_profile` 도구가 무조건 최우선으로 실행되어야 하는 명확한 제약 조건이 존재합니다.
- 첫 호출이 완료된 이후 턴부터는 사용자의 입력 내용에 따라 남아있는 도구들을 자율적/자유롭게 선택하여 사용할 수 있어야 합니다.
- 따라서 턴(Turn)의 진행 상태에 따라 `tool_choice` 설정을 동적으로 변경해주는 전략이 필요합니다.

**D번이 정답인 이유:**
첫 턴에서는 `tool_choice`를 `{"type": "tool", "name": "create_profile"}`로 지정하여 모델이 다른 도구나 일반 텍스트 응답 대신 무조건 `create_profile` 도구를 호출하도록 강제합니다. 그 후 두 번째 턴부터는 `tool_choice: {"type": "auto"}`로 변경함으로써 모델이 상황에 맞게 도구를 호출하거나 응답하도록 자율성을 부여하는 것이 완벽한 해결책입니다.

**오답 분석:**
- **Option A (오답)**: `tools` 배열 내의 순서는 모델의 자율적 선택(`auto`)에 강제력을 제공하지 않습니다. 모델이 첫 턴에 다른 도구를 선택하거나 텍스트 응답만 보낼 위험이 있습니다.
- **Option B (오답)**: `{"type": "none"}`은 첫 턴에 모델이 어떠한 도구도 호출하지 못하도록 금지하므로, 첫 동작으로 `create_profile`을 실행해야 하는 요구사항에 정반대됩니다.
- **Option C (오답)**: `{"type": "any"}`는 목록 내의 무작위 도구를 반드시 하나 호출하도록 강제하지만, 특정 도구(`create_profile`)만을 지정하여 강제할 수 없으며, 전체 대화 동안 적용하면 이후 턴에서 자율적 판단을 방해합니다.

---

### 34번 문제

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
- 케이스 1: 존재하는 고객이지만 주문 내역이 없음 → 시스템 및 고객 조회는 정상 성공했으나 데이터 목록만 비어 있는 정상 응답 상태입니다.
- 케이스 2: 데이터베이스에 입력된 고객 ID 자체가 존재하지 않음 → 요청한 대상(Resource)을 찾을 수 없는 명백한 조회 에러 상태입니다.
- 두 상황을 구분 없이 동일하게 처리하면 에러 핸들링 및 사용자에 대한 응답 유효성이 떨어지게 됩니다.

**B번이 정답인 이유:**
존재하는 고객의 주문 0건 케이스는 조회가 정상적으로 완료된 것이므로 `isError:false`와 함께 빈 배열(`[]`)을 반환해야 합니다. 반면, 데이터베이스에 존재하지 않는 고객 ID 케이스는 리소스를 찾을 수 없는 오류 상황이므로 `isError:true`, `errorCategory: not_found_error` 및 오류 상세 설명을 반환하는 것이 시스템 및 에이전트 설계 표준에 부합합니다.

**오답 분석:**
- **Option A (오답)**: 두 케이스 모두 에러(`isError:true`) 및 일시적 오류(`transient`)로 처리하고 재시도를 수행하는 것은 잘못된 오류 분류이자 불필요한 네트워크 재요청을 유발합니다.
- **Option C (오답)**: 정상 조회된 빈 결과를 의심스러운 오류(`suspicious`)로 간주하고, 존재하지 않는 리소스 조회를 성공(`isError:false`)으로 처리하는 것은 두 케이스의 의미를 반대로 뒤바꾼 설명입니다.
- **Option D (오답)**: 존재하지 않는 고객 ID 조회를 정상 응답으로 간주하여 빈 배열로 반환하면, 에러를 감추게 되므로 에러 핸들링이 불가능해집니다.

---

### 38번 문제

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
- 상위 코디네이터가 서브에이전트에게 3단계 데이터 마이그레이션(추출 → 변환 → 로드)을 위임함.
- 마지막 '로드' 단계에서 일시적인 연결 재설정(Transient Condition)으로 2회 실패가 발생했으나, 서브에이전트 내부에서 3번째 시도 만에 최종 성공함.
- 전체 태스크 관점에서는 3단계가 모두 최종 성공적으로 완료된 상태임.

**B번이 정답인 이유:**
일시적인 장애는 서브에이전트 수준에서 이미 성공적으로 복구(Resolved locally)되어 전체 마이그레이션 과업이 완성되었으므로, 코디네이터에게는 최종 작업의 성공 결과만 상위로 보고하는 것이 계층적 위임 구조 및 카오스 차단(Fault Containment) 원칙에 부합합니다.

**오답 분석:**
- **Option A (오답)**: 이미 내부 재시도로 최종 성공했음에도 불구하고 `isError: true`를 반환하면 상위 코디네이터가 불필요하게 전체 태스크를 재시도하거나 에러 처리를 수행하여 중복 작업 및 시스템 혼란을 유발합니다.
- **Option C (오답)**: 연결 재설정이 일시적 오류(Transient Condition)라고 문제에 명시되어 있고 세 번째에 성공했으므로, 자격 증명 만료로 단정 짓고 자격 증명을 재요청하는 것은 잘못된 진단입니다.
- **Option D (오답)**: 세 번째 시도에서 '로드' 단계가 최종 성공했음에도 불구하고 처음에 실패했다는 이유로 결과를 누락하거나 부분 성공으로만 보고하는 것은 데이터 상태 불일치를 일으킵니다.

---

### 41번 문제

**1. 문제 원문**

A document-processing agent has both an `extract_metadata` tool and several enrichment tools (`add_tags`, `link_related`, `generate_summary`). The enrichment tools depend on fields that only `extract_metadata` produces, and in early tests the model sometimes calls an enrichment tool first with guessed values. What is the recommended way to guarantee correct ordering for this first step?

A) Remove the enrichment tools from the agent's tool list on the first turn and only provide `extract_metadata`, then after `extract_metadata` returns, re-add `add_tags`, `link_related`, and `generate_summary` for subsequent turns.

B) Set `tool_choice` to `{"type": "tool", "name": "extract_metadata"}` on the turn where metadata is needed, then let the model choose from the enrichment tools with `auto` or `any` on subsequent turns.

C) Set `tool_choice` to `{"type": "any"}` for the entire conversation, so the model must select a tool on every turn, relying on its training to choose `extract_metadata` first when metadata is absent.

D) Add a detailed description to each enrichment tool stating that they require metadata fields only `extract_metadata` can provide, and keep `tool_choice` set to `auto` throughout the conversation.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Set `tool_choice` to `{"type": "tool", "name": "extract_metadata"}` on the turn where metadata is needed, then let the model choose from the enrichment tools with `auto` or `any` on subsequent turns.

**정답 및 해설:**


**핵심 개념**: 
Claude API의 `tool_choice` 파라미터는 에이전트의 도구 호출 실행 순서를 제어(Tool Use Control)할 때 가장 효과적인 메커니즘입니다. 특정 단계에서 선행되어야 하는 선결 조건 도구가 존재하는 경우, 해당 턴에서 `tool_choice: {"type": "tool", "name": "<tool_name>"}`으로 명시하면 모델이 값 추측(Guessing)이나 다른 도구의 오호출 없이 **해당 특정 도구를 무조건 최우선으로 호출하도록 결정론적으로 강제(Guarantee/Enforce)**할 수 있습니다.

**문제 상황 분석:**
- 에이전트에 메타데이터 추출 도구(`extract_metadata`)와 데이터 보강 도구들(`add_tags` 등)이 존재함.
- 보강 도구들은 `extract_metadata`가 생성한 결과 데이터에 절대적으로 의존함.
- 프롬프트/자율성에 맡길 경우, 첫 턴에서 모델이 값을 임의로 추측하여 보강 도구를 먼저 호출하는 순서 오류(Ordering Issue)가 발생함.
- 첫 단계에서 메타데이터 추출 도구가 반드시 가장 먼저 실행되도록 선결 실행 보장이 필요한 상황임.

**B번이 정답인 이유:**
첫 번째 턴(또는 메타데이터가 필요한 턴)에서 API 요청 시 `tool_choice`를 `{"type": "tool", "name": "extract_metadata"}`로 지정하면, 모델은 다른 어떤 행동도 하지 않고 무조건 해당 도구를 가장 먼저 실행합니다. 그 후 실행 결과가 돌아온 다음 턴부터는 `tool_choice`를 `auto` 또는 `any`로 전환하여 자율적으로 보강 도구를 선택하게 하므로 실행 순서를 100% 보장하는 가장 정석적이고 명확한 솔루션입니다.

**오답 분석:**
- **Option A (오답)**: 턴마다 API에 전달하는 도구 정의(`tools` 배열) 자체를 삭제하고 재등록하는 방식은 유연성이 떨어지며, 도구 정의를 매번 변경하는 것은 권장되는 도구 제어 방식이 아닙니다. API 레벨에서는 `tool_choice`를 통해 이를 제어하는 것이 표준입니다.
- **Option C (오답)**: `tool_choice: {"type": "any"}`는 목록 중 '아무 도구나 하나 선택'하라는 의미일 뿐, `extract_metadata`를 특정하여 강제하지 못하므로 추측값에 의한 오류 호출 문제를 해결하지 못합니다.
- **Option D (오답)**: 도구 설명(Description)에 의존조건을 적는 것은 확률적인 가이드라인일 뿐이며, 모델이 값 추측으로 첫 턴에 보강 도구를 호출하는 현상을 완전히(100%) 보장하여 방지할 수 없습니다.

---

# 46번 문제

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

# 53번 문제

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

# 58번 문제

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

# 60번 문제

**1. 문제 원문**

A single generalist agent handling an entire content pipeline (research, outline, draft, edit, publish) has 20 tools and shows declining tool-selection accuracy as more tools were added over time. The architect proposes splitting it into five specialized subagents, each scoped to roughly 4 tools for its stage, coordinated by a lightweight orchestrator. What is the main reliability benefit of this redesign, based on the relationship between tool count and selection accuracy?

A) The orchestrator caches tool results across subagents, which eliminates the need for most subagents to make tool calls at all

B) Splitting into subagents reduces the total number of API calls made across the whole pipeline, which is the main source of the earlier selection errors

C) Each subagent now discriminates among a much smaller candidate set, which directly reduces the decision complexity that was degrading tool selection at 20 tools

D) Each subagent now runs on a smaller context window, which forces the model to think more carefully before selecting a tool

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Each subagent now discriminates among a much smaller candidate set, which directly reduces the decision complexity that was degrading tool selection at 20 tools

**정답 및 해설:**

**핵심 개념**: 도구 개수와 도구 선택 정확도(Tool-Selection Accuracy)의 관계  
LLM 기반 에이전트 시스템에서 단일 에이전트에 제공되는 도구의 개수(Tool Count)가 늘어날수록 모델이 평가해야 하는 스키마와 설명(Description)의 양이 많아져 **의사결정 복잡성(Decision Complexity)**이 급격히 증가합니다. 도구가 약 10~20개를 넘어가면 적절한 도구를 라우팅하고 정확한 인자를 추출하는 정확도가 눈에 띄게 저하됩니다. 이를 단계별 서브에이전트로 나누어 각 에이전트가 처리하는 도구 후보군을 소수로 제한(Scoping)하는 것이 시스템 신뢰성을 높이는 핵심 아키텍처 패턴입니다.

**문제 상황 분석:**
- 1개의 범용 에이전트가 20개의 도구를 가지면서 도구 선택 정확도가 저하되는 문제 발생
- 파라미터/도구 스키마의 수와 모호성 증가로 인해 모델의 도구 라우팅 오작동 증가
- 해결책으로 5개의 전용 서브에이전트에 각각 약 4개의 도구만 할당하도록 멀티 에이전트 아키텍처로 변경함

**C번이 정답인 이유:**
단일 에이전트가 고려해야 하는 도구가 20개에서 각 서브에이전트당 4개로 대폭 줄어듦에 따라, 모델이 도구를 비교·선택할 때 거쳐야 하는 후보군 집합(Candidate Set)의 크기가 크게 감소합니다. 이는 의사결정 복잡성을 직접적으로 낮춰주어 도구 선택 정확도와 신뢰성을 획기적으로 개선합니다.

**오답 분석:**
- **Option A (오답)**: 오케스트레이터의 결과 캐싱은 응답 속도 향상이나 비용 절감 요소일 수 있으나, 도구 선택 정확도 저하 문제를 다루는 핵심 신뢰성 이점이 아니며 도구 호출 자체를 없애주지도 않습니다.
- **Option B (오답)**: 에이전트를 여러 개로 분할하고 오케스트레이션을 거치면 오케스트레이터 및 서브에이전트 간의 통신이 추가되어 총 API 호출 수가 오히려 증가하거나 유지됩니다. API 호출 횟수 자체가 도구 선택 오류의 원인이 아닙니다.
- **Option D (오답)**: 컨텍스트 윈도우 크기가 작아진다고 해서 모델이 더 신중하게 생각(Think carefully)하도록 강제되는 것은 아니며, 본 문제의 핵심 원인은 컨텍스트 크기가 아닌 도구 후보군의 복잡성입니다.

---

# 63번 문제

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
