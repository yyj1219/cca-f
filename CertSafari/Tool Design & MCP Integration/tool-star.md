# Tool Design & MCP Integration — ★ 표시

---

* _inconsistent_ : 일관성 없는
* _tend to_ : ~하는 경향이 있다
* _interpret_ : 해석하다
* _up to date_ : 최신의
* _capability_ : 기능
* _presumed_ : 간주된다
* _sufficient_ : 충분한
* _happen to + 동사원형_ : 우연히, 공교롭게도
* _outright_ : 완전히
* _implicit_ : 암묵적인, 내재된
* _explicit_ : 명시적인
* _surface_ : 표면화하다, 드러내다
* _typically_ : 일반적으로
* _coerce_ : 억지로 맞추다
* _significantly_ : 상당히
* _influence_ : 영향력
* _assessment_ : 평가
* _appropriate_ : 적절한
* _distinguish_ : 구별하다
* _worthwhile_ : 해볼 가치가 있는지

---

## 6번 문제

**1. 문제 원문**

A synthesis agent's job is to combine findings that a separate research agent has already gathered into a final answer. Because it **shares a tool registry with the research agent**, the synthesis agent also has access to a web_search tool. During testing, the synthesis agent repeatedly calls web_search mid-synthesis instead of using the findings already provided to it, **producing(만들어냄) inconsistent(일관성없는) citations(인용)**. What is the best explanation and fix for this behavior?

A) Agents **tend to(경향이 있다)** misuse tools outside their specialization when given access to them; web_search should be **removed from the synthesis agent**'s tool set and **left with the research agent**.

C) The web_search tool's description is **too vague(모호한)** for the synthesis agent to **interpret(해석하다)** correctly(종합 에이전트가 제대로 해석하기에는 너무 모호하다);  rewriting it(웹서치의 디스크립션) with guidance that it is a research tool and should not be used during synthesis would prevent the extra calls.

D) The research agent is passing incomplete findings(불완전한 결과를 줬는지를 문제 내용으로는 알 수 없으니 오답이다), so the synthesis agent searches for missing information; updating the research agent to include complete source lists would prevent the extra calls. => 이 답을 선택했다니, 나는 문제에 없는 내용을 추정하는 오류를 자주 일으키는 것 같다.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: A번**

**정답 및 해설:**

**핵심 개념**: 멀티 에이전트 역할 분리 및 최소 권한 도구 노출 (Least Privilege / Tool Scoping)  
멀티 에이전트 시스템(Multi-Agent Architecture) 설계 시 각 에이전트에 필요한 도구만 선택적으로 전달(Tool Scoping)해야 합니다. **수행할 필요가 없는 도구**(예: 종합 단계에서의 검색 도구)에 **접근 권한이 열려 있으면 에이전트가 불필요하게 해당 도구를 호출**하여 환각(Hallucination)을 일으키거나 출처의 일관성을 깨뜨릴 수 있습니다.

**문제 상황 분석:**  
- 종합(Synthesis) 에이전트의 본래 역할은 이미 조사된 데이터만 취합하는 것임.
- 공용 도구 레지스트리를 공유하다 보니 쓰지 말아야 할 `web_search` 도구가 종합 에이전트에게 노출됨.
- 에이전트가 불필요하게 `web_search`를 호출하여 일관성 없는 인용 결과를 생성하는 오작동 발생.

**A번이 정답인 이유:**  

- **최소 권한의 원칙 준수**: **에이전트에 목적에 맞지 않는 도구가 주어지면 이를 오용할 가능성이 매우 높습니다**. 가장 근본적이고 철저한 해결책은 종합 에이전트의 도구 목록에서 `web_search`를 아예 제거(Scope 제거)하고, 검색 권한은 리서치 에이전트에만 한정하는 것입니다.

**오답 분석:**  
- Option C (오답): 도구 설명(Description)에 "종합 시 사용하지 말 것"이라는 텍스트 지침을 넣더라도, 프롬프트 지시를 우회하거나 무시하는 LLM의 특성상 도구 자체를 차단하는 것보다 불안정합니다.

---

## 7번 문제 (★)

**1. 문제 원문**

A support agent has both `search_web` and `fetch_webpage_results` as separate tools. Testing shows the model almost always calls `search_web`, even for tasks better suited to `fetch_webpage_results`. The system prompt contains "Always prefer searching for the most **up to date(최신의)** information." What most likely explains the bias?

B) Keyword-sensitive system prompt wording creates an unintended association that overrides the more accurate(정확한) tool description.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: B번**

**정답 및 해설:**

**핵심 개념**: 프롬프트 엔지니어링 및 편향(Prompt Bias / Keyword Association)  
시스템 프롬프트에 작성된 특정 키워드 문구("searching")는 모델이 도구를 선택할 때 강한 **정렬 편향(Alignment Bias)을 유발할 수 있습니다**. 도구 설명(Tool Description)이 아무리 정확하더라도, 상위 수준인 시스템 프롬프트의 강한 지시어와 특정 도구명(`search_web`) 간의 키워드 연관성이 도구 설명에 의한 합리적 판단을 덮어버릴(Override) 수 있습니다.

**문제 상황 분석:**  
- 에이전트에 `search_web`과 `fetch_webpage_results`라는 두 도구가 존재함.
- `fetch_webpage_results`가 더 적합한 상황에서도 모델이 지나치게 `search_web`만 선택함.
- 시스템 프롬프트에 "Always prefer **searching**..."이라는 지침이 명시되어 있어, 모델이 'searching' 키워드를 `search_web` 도구와 강력하게 연관 지어 판단 오류가 발생함.

**B번이 정답인 이유:**  
- 시스템 프롬프트 내의 "searching"이라는 키워드가 모델에게 강한 앵커링 효과(Anchoring Effect)를 일으켜, 개별 도구의 정확한 설명보다 우선하여 `search_web` 도구를 선택하도록 만든 원인입니다.

---

## 8번 문제 (★)

**1. 문제 원문**

A team member tries to add a custom MCP server named `computer-use` to give the agent a specialized screenshot tool. What should the architect expect to happen?

A) Claude Code loads the custom server but silently strips its screenshot tool since that **capability(기능)** is **presumed(간주된다)** reserved for the built-in server

B) Claude Code rejects or skips the server because `computer-use` is a reserved built-in name, so the team member needs to pick a different name

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: B번**

**정답 및 해설:**

**핵심 개념**: Claude Code 내장 예약어(Reserved Names) 및 MCP 서버 네이밍 충돌  
Claude Code에는 시스템 내부 기능(예: `computer-use` 등)을 위해 미리 지정된 **내장 MCP 서버 예약어**가 존재합니다. 커스텀 MCP 서버를 등록할 때 **내부 예약어와 동일한 식별자 이름을 사용할 경우**, 이름 충돌 방지 및 시스템 안정성을 위해 해당 **서버 등록을 거부(Reject)하거나 스킵(Skip)하도록 설계**되어 있습니다.

**문제 상황 분석:**  
- 팀원이 `computer-use`라는 이름의 커스텀 MCP 서버를 등록하려고 함.
- `computer-use`는 Anthropic/Claude Code 생태계에서 컴퓨터 조작 및 GUI 제어 기능 전용으로 정의된 예약된 내장 식별자(Reserved Built-in Name)임.
- 예약명을 커스텀 서버에 사용할 때 Claude Code가 이를 어떻게 처리할지 파악해야 함.

**B번이 정답인 이유:**  
- 예약된 내장 이름과 명칭 충돌이 발생하므로 Claude Code는 시스템 충돌 및 섀도잉(Shadowing) 현상을 방지하기 위해 해당 서버 구성을 거부하거나 건너뜁니다.
- 커스텀 스크린샷 도구를 정상적으로 등록 및 사용하려면 팀원이 `custom-computer-use`나 `my-screenshot-tool`처럼 예약되지 않은 다른 이름을 선택해야 합니다.

**오답 분석:**  
- Option A (오답): 서버를 로드한 뒤 도구만 일부 몰래 제거(silently strip)하는 부분적인 비정상 로드 동작을 수행하지 않습니다.
- Option C (오답): 사용자 정의 커스텀 서버가 기본 내장(Built-in) 서버의 기능을 덮어씌워 숨기는 것(Override/Hide)을 허용하지 않습니다.

---

## 9번 문제 (★)

**1. 문제 원문**

An architect is designing tool access for a three-agent pipeline: an intake agent, a processing agent, and a delivery agent. The intake agent occasionally needs to check processing status, which is normally a processing-agent operation. Following the principle of scoped tool access with limited cross-role tools, how should the architect handle this?

C) Give the intake agent only a narrow check_status tool for that specific high-frequency need, while routing deeper processing operations through the processing agent.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: C번**

**정답 및 해설:**

**핵심 개념**: 

멀티 에이전트 아키텍처에서는 **각 에이전트가** 자신의 본래 역할에 필요한 **최소한의 도구에만 접근**할 수 있도록 도구 스코프(Scope)를 제한해야 합니다. **다른 에이전트의 역할 영역에 속하는 작업이 예외적으로 필요하더라도** 전체 도구 세트를 부여하는 대신, **해당 목적에 국한된 좁은 범위(Narrow Scope)의 특정 도구만 제한적으로 허용**하는 것이 보안 및 시스템 안정성 측면에서 올바른 설계입니다.

**문제 상황 분석:**
- 접수(Intake) 에이전트가 원래 처리(Processing) 에이전트의 담당 영역인 '처리 상태 확인'을 가끔 실행해야 하는 상황임.
- 범위 지정 도구 접근(Scoped tool access) 및 제한된 역할 간 도구 허용(Limited cross-role tools) 원칙을 준수해야 함.
- 에이전트에 너무 넓은 권한을 주지 않으면서 요구사항을 충족하는 아키텍처 수립 필요.

**C번이 정답인 이유:**
- 접수 에이전트에 처리 에이전트의 모든 권한을 주는 대신, 상태 조회 목적에만 국한된 읽기 전용/단일 목적의 `check_status` 도구만 최소한으로 부여합니다.
- 실제 데이터의 수정이나 깊은 처리 작업(Deeper processing operations)은 기존대로 처리 에이전트를 거치도록 유지함으로써, 최소 권한 원칙과 역할 분리(Separation of Concerns)를 완벽하게 달성합니다.

---

## 11번 문제 (★)

**1. 문제 원문**

A `book_meeting_room` MCP tool fails because the requested room is already reserved for the requested time slot. The tool author wants the agent to be able to explain the conflict to the user in natural language and suggest picking a different time, without the agent needing to parse a raw exception message. Which element of the structured error response most directly enables this?

B) A human-readable description field stating the room is already booked for that slot, separate from any machine-oriented errorCategory or isRetryable flags

D) Omitting the description field entirely, since errorCategory alone is **sufficient(충분한)** for the agent to generate an accurate, context-specific explanation

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: B번**

**정답 및 해설:**

**핵심 개념**: 
  
MCP 표준 에러 응답은 기계적인 제어를 위한 플래그(`errorCategory`, `isRetryable` 등)와, LLM 에이전트가 이해하고 사용자에게 전달할 수 있는 **사람이 읽기 쉬운 설명 텍스트(`description` / `message`)를 분리하여 작성**합니다. 명확한 자연어 메시지가 제공될 때 에이전트는 복잡한 파싱 없이 사용자에게 원인을 명확히 안내할 수 있습니다.

**문제 상황 분석:**  
- 회의실 예약 도구 실행 시 시간대 충돌로 인한 에러가 발생함.
- 에이전트가 날것의 로우(Raw) 예외 메시지나 스택 트레이스를 직접 파싱하지 않아야 함.
- 사용자에게 자연어로 상황을 설명하고 대안(다른 시간 선택)을 제시하도록 만들기 위한 에러 응답 요소를 찾아야 함.

**B번이 정답인 이유:**  
- 기계 판별용 메타데이터와 구분되는 '사람이 읽기 쉬운 설명 필드'를 전달하면, 에이전트가 해당 텍스트의 맥락을 즉시 파악할 수 있습니다.

**오답 분석:**  

- Option D (오답): 구체적인 세부 사유(어떤 이유로 거절되었는지)를 포함하는 description 필드를 생략하고 대분류 카테고리만 제공하면, 에이전트가 사용자에게 맥락에 맞는 정확한 안내를 제공할 수 없습니다.

---

## 28번 문제 (★)

**1. 문제 원문**

A `charge_card` MCP tool receives a request with an amount field formatted as `"$45.00"` instead of a numeric type as specified by its input schema. Before the tool's handler logic even runs, how does the MCP client typically **surface(표면화하다)** this failure, and how / **should that differ(달라야 하는가)** / from the tool later reporting a **declined charge(카드 승인 거절)**? => 프로토콜 오류와 비즈니스 오류가 각각 어떻게 달라야 하는가를 묻고 있다.

A) The malformed argument triggers a JSON-RPC protocol error from schema validation before the tool executes, while a declined charge is reported inside the tool result with `isError:true`.

B) The client silently **coerces(억지로 맞추다)** the malformed argument to a number before invocation, so neither a schema validation error nor a declined charge occurs; the handler receives a valid amount, and any decline is a business result.

D) Both failures are reported **identically(동일하게)** as JSON-RPC protocol errors with code -32602 (Invalid params), because the client validates the request against the schema before calling the tool handler. => 프로토콜 오류와 카드 승인 거절을 동일하게 취급하면 안 되므로 오류다. `code -32602 (Invalid params)` 자체는 프로토콜 오류 맞다.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: A번**

**정답 및 해설:**  

**핵심 개념**: 

MCP(Model Context Protocol) 시스템에서 에러는 명확히 두 개의 계층으로 구분됩니다.  
1. 프로토콜 수준 에러 (**JSON-RPC Protocol Error**): 도구 호출 전, **입력 스키마 위반**(타입 불일치, 필드 누락, JSON 파싱 실패 등)이 발생할 때 반환됩니다.  
2. 도구/비즈니스 수준 에러 (Tool Result Error): 도구 핸들러 로직은 정상적으로 구동되었으나, 외부 결제 거절/잔액 부족 등 업무 로직상 실패가 발생했을 때 반환됩니다. 이는 도구 실행 결과(`tool result`) 내에 `isError: true` 항목으로 포함되어 전달됩니다.

**문제 상황 분석:**
- `charge_card` 도구의 스키마는 숫자 타입을 요구하나, 문자열 `"$45.00"` 형태의 잘못된 인자가 입력되었습니다.
- 도구의 실행 로직(핸들러)이 동작하기 전 단계에서 스키마 검증 실패가 발생합니다.
- 스키마 검증 실패 방식과 결제 거절(도구 내부의 비즈니스 결과) 실패 표출 방식 간의 차이를 묻고 있습니다.

**A번이 정답인 이유:**
형식이 잘못된 인자(Malformed argument)는 스키마 검증 단계에서 도구 핸들러 실행 전에 **JSON-RPC 프로토콜 에러**를 유발합니다. 반면 도구가 정상 호출된 후 카드사 응답 등에 의해 발생하는 결제 거절(Declined charge)은 도구 실행 응답(`tool result`) 객체 내부에서 **`isError: true`** 상태로 반환됩니다. 두 에러의 발생 시점과 표출 형태를 정확히 구분하고 있습니다.

**오답 분석:**
- Option B (오답): MCP 클라이언트는 잘못된 데이터 타입을 수동으로 암묵적 타입 변환(Silent coercion)하지 않고 엄격한 스키마 검증을 수행합니다
- Option D (오답): 카드 결제 거절은 비즈니스 로직 실행 결과이므로, 스키마 검증 실패에 사용하는 JSON-RPC 프로토콜 에러 코드(-32602)로 반환되지 않습니다.

---

## 30번 문제 (★)

**1. 문제 원문**

A `cancel_subscription` MCP tool rejects a cancellation because the account is locked in a legal hold, a policy condition that will not change no matter how the request is retried or reformatted. The engineer must choose between labeling this a validation error or a business error. Which choice is correct, and why?

B) Business error, because the legal hold check occurs in a separate service(별도 서비스에서) after request validation(검증 이후에), so the rejection is a business rule violation, not a schema issue. => 문제에서 "검증 이후"나 "별도 서비스"에 대한 내용이 전혀 없다. 문제에 없는 내용을 추정했으므로 오답이다.

C) It is a business error because the request itself is well-formed and the rejection stems from a policy rule about the account's state rather than malformed input.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: C번**

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
- **Option B (오답)**: 비즈니스 에러로 분류한 결론은 맞지만, 이유로서 '별도의 서비스에서 실행되기 때문'이라는 구조적/실행 위치 조건은 에러의 개념적 원인 분류 표준이 아닙니다.

---

## 31번 문제 (★)

**1. 문제 원문**

Claude Code is fixing a bug and wants to reproduce it first by running the project's test suite and capturing the failing stack trace before making any code changes. Which tool should Claude use to **run the suite and view its output**? => 실행과 결과 확인이 목적이다. 목적 달성에 가장 근접한 답을 찾아야 한다.

B) Bash, to invoke the project's test runner command and capture its stdout and stderr, including the stack trace, in the result

C) Read, to open the test runner's configuration file and infer the current pass or fail status of the suite from its settings => 선택적으로 Read를 할 수도 있겠지만, 문제에서 실행과 결과 확인이 목적이라서 오답. Read는 안전을 위해 Write/Edit에서만 선행되는 것 뿐이다. 헷갈리지 말라.

D) Glob, to list all files matching **/*.test.* and treat the presence of test files as confirmation that the suite runs cleanly => 테스트 파일의 존재 유무는 확인되겠지만, 그게 테스트를 한다는 것과 같은 것은 아니다. 따라서 오답.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: B번**

**정답 및 해설:**

**핵심 개념**: 

Claude Code 환경에서 `Bash` 도구는 터미널 명령어를 실행하고 그 결과로 나오는 표준 출력(`stdout`)과 표준 에러(`stderr`)를 캡처하는 데 사용됩니다. 외부 명령어(예: `npm test`, `pytest` 등 테스트 러너)를 직접 실행하여 실제 오류 발생 현상 및 스택 트레이스를 확인하기 위해서는 Shell 명령을 실행할 수 있는 `Bash` 도구가 필수적입니다.

**문제 상황 분석:**
- Claude Code가 코드를 수정하기 전, 버그를 재현하고 오류 원인을 확인하려 합니다.
- 이를 위해 프로젝트의 테스트 스위트를 직접 실행(run)하고 출력 결과(스택 트레이스)를 수집해야 합니다.
- 파일 검색, 파일 읽기 등의 단순 조회용 도구로는 시스템 명령어를 직접 실행하거나 실행 결과를 얻어올 수 없습니다.

**B번이 정답인 이유:**
`Bash` 도구는 프로젝트에 설정된 테스트 러너 명령어(예: `pytest`, `jest`, `cargo test` 등)를 실제로 실행(invoke)하고, 이 과정에서 출력되는 스택 트레이스를 포함한 `stdout`과 `stderr` 결과를 받아올 수 있는 유일한 도구입니다.

**오답 분석:**
- **Option C (오답)**: `Read`는 파일을 읽는 도구입니다. 설정 파일의 내용을 읽는 것만으로는 실제 테스트 실행 결과나 에러 발생 시의 스택 트레이스를 알 수 없습니다.
- **Option D (오답)**: `Glob`은 패턴에 맞는 파일 목록을 찾는 도구입니다. 테스트 파일이 존재하는지 확인하는 것과 실제 테스트를 실행하여 버그를 재현하는 것은 무관합니다.

---

## 36번  (★)

**1. 문제 원문**

A team observes that adding 'If in doubt, use the search tool' to the system prompt caused the model to call `search_web` even when the `lookup_internal_docs` tool was more **appropriate(적절한)**. What does this scenario illustrate?

A) System prompts can **significantly(상당히)** **influence(영향력)** tool selection, and explicit instructions may override the model's **assessment(평가)** of which tool is most **appropriate(적절한)**.

C) The word 'search' appearing anywhere in a tool's name always takes absolute priority over any other tool regardless of prompt content. => 절대적 우선순위를 갖지는 않는다. 그런 경향이 있는 것과 절대적인 것은 다르다.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: A번**

**정답 및 해설:**

**핵심 개념**: 
LLM의 도구 선택(Tool Selection) 과정에서 시스템 프롬프트(System Prompt)에 포함된 지시사항은 모델의 의사결정에 결정적인 영향을 미칩니다. **프롬프트에 명시된 지시나 편향(Bias) 문구**는 도구의 개별 설명이나 맥락적 적합성에 대한 **모델 자체의 가치 평가보다 우선시되어 적용될 수** 있습니다.

**문제 상황 분석:**
- 시스템 프롬프트에 'If in doubt, use the search tool(확신이 없으면 검색 도구를 사용하라)'이라는 강한 지시 지침을 추가함.
- 그 결과, 내부 문서를 먼저 확인하는 `lookup_internal_docs` 도구가 상황상 더 적합함에도 불구하고 모델이 프롬프트의 지침을 따라 `search_web`을 오호출함.
- 지시 문구 하나가 모델의 추론 및 도구 선택 판단 알고리즘을 덮어쓰는(Override) 지배적인 영향력을 나타냄.

**A번이 정답인 이유:**
시스템 프롬프트는 모델의 도구 선택 동작에 강력한 영향을 미치며, 명시적으로 주어진 프롬프트 지침은 모델이 본래 판단했을 최선의 도구 선택 기준보다 우선하여 작용함을 정확히 설명하고 있습니다.

**오답 분석:**
- **Option C (오답)**: 'search'라는 단어의 포함 여부만으로 무조건 절대적 우선순위가 정해진다는 것은 프롬프트의 지침(지시어) 역할을 무시한 자의적인 해석입니다.

---

## 40번 문제 (★)

**1. 문제 원문**

An MCP server's `create_invoice` tool calls a downstream billing API that returns a 503(배포 중 일시 장애) while the service is deploying. The tool wraps this in a result with `isError: true` and a text block reading only "Operation failed." The agent retries the same call five times in a row, each time failing the same way, before giving up. What is the most direct cause of the wasted retries?

A) The result carries no structured metadata **distinguishing(구별하는)** transient from non-retryable failures. The agent thus has no **basis(근거)** for deciding whether retrying is **worthwhile(해볼 가치가 있는지)**.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: A번**

**정답 및 해설:**

**핵심 개념**: 
MCP(Model Context Protocol) 및 에이전트 기반 오류 처리에서, 도구가 오류를 반환할 때 단지 "Operation failed."와 같은 모호한 불투명(opaque) 텍스트만 전달하면 에러의 본질(일시적 장애 vs 재시도 불가능한 영구 장애)을 식별할 수 없습니다. 에러의 범주(errorCategory, retryability 등)에 대한 **구조화된 메타데이터(Structured Metadata)**가 없으면 에이전트는 합리적인 재시도 전략을 결정할 수 없어 불필요한 반복 재시도를 수행하게 됩니다.

**문제 상황 분석:**
- 503 Service Unavailable 오류(배포 중 일시 장애)가 발생했으나, 도구는 구체적 메타데이터 없이 단순 "Operation failed." 텍스트와 `isError: true`만 반환함.
- 에이전트는 원인 파악 및 일시적 오류 여부, 재시도 가능 여부를 판단할 구조화된 정보가 없음.
- 그 결과 판단 근거 부족으로 포기할 때까지 동일한 무의미한 재시도를 5회 연속 반복하여 자원을 낭비함.

**A번이 정답인 이유:**
반환된 결과에 에러가 일시적(transient)인지 재시도 불가능(non-retryable)한지를 구분해 주는 구조화된 메타데이터가 전혀 포함되어 있지 않기 때문에, 에이전트가 재시도 여부 및 전략을 판단할 근거가 부족하여 무의미한 재시도를 반복한 것이 가장 직접적인 원인입니다.

---

## 46번 문제 (★)

**1. 문제 원문**

A developer wants Claude Code to update a deprecated log statement `logger.warn("legacy-path")` that appears twice in the same file, in two different functions, where only one of the two occurrences should change. Claude issues an Edit call with old_string set to exactly that log statement and the call fails. What is the correct next step?

A) Call Write with only the new log line as content, expecting Write to merge that single line into the correct spot in the existing file

B) Set replace_all to true on the same Edit call so both occurrences update identically, then manually revert whichever one should have stayed

C) Switch to Grep with the multiline flag to rewrite the matching line directly, since Grep can modify file contents once a match is found

D) Widen old_string to include enough surrounding context to uniquely identify the intended occurrence, then retry Edit with that string

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: D번**

**정답 및 해설:**

**핵심 개념**: Claude Code의 Edit 도구 동작 원리 (Uniqueness & Context Matching)
Claude Code의 `Edit` 도구는 파일 내에서 교체하고자 하는 대상 문자열(`old_string`)이 **단 하나만 존재(Unique)**할 때 안전하게 치환을 수행합니다. 만약 동일한 문자열이 파일 내에 여러 번 등장하는데 어떤 것을 바꿀지 고유하게 식별되지 않으면, 오작동을 방지하기 위해 Edit 호출이 실패합니다.

**문제 상황 분석:**
- `logger.warn("legacy-path")` 구문이 동일 파일 내에 2번 존재함
- 두 위치 중 단 1곳만 변경해야 하는 상황임
- Claude가 정확히 해당 로그 구문만 `old_string`으로 전달하여 중복으로 인해 Edit 도구가 실패함

**D번이 정답인 이유:**
동일한 문자열이 여러 곳에 존재하여 구분이 불가능할 때는, 변경하고자 하는 위치 주변의 코드(함수 선언부, 이전/다음 줄의 코드 등)를 `old_string`에 함께 포함시켜(**Widen**) 파일 내에서 대상 문자열이 유일(Unique)하게 식별되도록 context를 확장한 뒤 Edit을 재시도해야 합니다.

**오답 분석:**
- **Option A (오답)**: `Write` 도구는 파일 전체를 덮어쓰는 도구입니다. 단일 줄만 전달한다고 해서 기존 파일의 특정 위치에 자동으로 병합(Merge)해주지 않으며 파일 전체가 손상될 수 있습니다.
- **Option B (오답)**: 문제가 의도한 바는 2개 중 1개만 변경하는 것인데, `replace_all: true`로 두 곳 모두 바꾼 뒤 수동으로 되돌리는 방식은 비효율적이고 비정상적인 우회 방법입니다.
- **Option C (오답)**: `Grep`은 파일 내용을 검색(Search)하기 위한 도구일 뿐, 파일의 내용을 직접 수정(Modify)할 수 있는 기능을 가지고 있지 않습니다.

---

## 47번 문제 (★)

**1. 문제 원문**

A legal-document analysis agent has a single `retrieve_clause` tool that can pull arbitrary text ranges from any uploaded file by byte offset, which the model frequently misuses to grab unrelated or malformed spans. The team wants to replace it with a constrained alternative that only ever returns whole, well-defined clauses. Which redesign best follows the pattern of replacing a generic tool with a constrained one?

A) Keep `retrieve_clause` unchanged and add a second agent whose only job is to double-check the byte ranges after retrieval

B) Keep `retrieve_clause` but double the number of example byte-offset calls in its description so the model learns better offsets

C) Replace `retrieve_clause` with a `get_clause_by_id` tool that only accepts a validated clause identifier from a pre-parsed clause index

D) Give the agent broader access by also adding a `raw_file_read` tool so it can cross-check offsets against the full document

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: C번**

**정답 및 해설:**

**핵심 개념**: 제약된 도구 인터페이스 설계 (Constrained Tool Design)
LLM 기반 에이전트 시스템에서 임의의 인자(예: 임의의 바이트 범위, 자유 형식 SQL 문 등)를 받는 범용적이고 유연한(Generic) 도구는 모델의 예측 불가능한 오용 및 환각을 유발하기 쉽습니다. 이를 미리 정의되고 검증된 구조(구조화된 식별자, 사전 처리된 인덱스)만 허용하는 제약된(Constrained) 도구로 교체하는 것은 에이전트의 신뢰성을 극대화하는 핵심 아키텍처 패턴입니다.

**문제 상황 분석:**
- 기존 `retrieve_clause` 도구는 바이트 오프셋 기반으로 임의의 텍스트 범위를 잘라오도록 되어 있어 generic함
- LLM이 오프셋 계산을 실수하여 무관하거나 자려진 텍스트 구간(malformed spans)을 가져오는 오용이 빈번함
- 이를 방지하기 위해 완전하고 검증된 조항(clause)만을 안전하게 가져올 수 있는 constrained 형태의 도구 재설계가 필요함

**C번이 정답인 이유:**
바이트 오프셋 지정과 같은 임의의 파라미터 입력을 제거하고, 문서 파싱 단계에서 미리 정제된 조항 인덱스(pre-parsed index)의 유효한 ID만을 입력받는 `get_clause_by_id` 도구로 교체하는 것이 가장 확실하고 구조적인 제약(Constraint)을 거는 방법입니다. 이를 통해 모델은 잘못된 오프셋 계산을 할 여지 자체가 차단됩니다.

**오답 분석:**
- **Option A (오답)**: 문제가 있는 범용 도구를 그대로 둔 채 교체 검증용 2차 에이전트를 추가하는 것은 시스템 복잡도와 토큰 비용만 증가시킬 뿐, 근본적인 도구 인터페이스의 결함을 해결하지 못합니다.
- **Option B (오답)**: 도구 설명란에 프롬프트 예시(Few-shot)만 늘리는 방식은 LLM의 바이트 오프셋 실수라는 근본적 한계를 완벽히 통제할 수 없으며, 제약된 도구로의 교체 패턴이 아닙니다.
- **Option D (오답)**: 원시 파일 읽기 도구(`raw_file_read`)를 추가하여 에이전트에게 더 넓은 권한을 주는 것은 문제의 의도인 '도구 제약(Constrained Tooling)'과 완전히 반대되는 접근입니다.

---

## 50번 문제 (★)

**1. 문제 원문**

Claude Code is asked to rename an environment variable from `API_TIMEOUT_MS` to `REQUEST_TIMEOUT_MS` everywhere it is referenced across a codebase of several hundred files, with each occurrence sitting in different surrounding code. Which approach best discovers the full scope of the change before applying it?

A) Run Grep with output mode content and a glob scope to list every file and line referencing API_TIMEOUT_MS, then review that list before editing

B) Run Bash to open every file in an interactive editor, since a variable rename of this kind must be reviewed visually rather than located programmatically

C) Run Write on the project's environment configuration file first, then rely on Claude to infer other affected files from that one change afterward

D) Run Glob with the pattern **/API_TIMEOUT_MS to locate files whose names contain the variable, then edit only those matching files

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: A번**

**정답 및 해설:**

**핵심 개념**: 코드베이스 검색 및 탐색 도구(Grep vs Glob)의 역할 분담  
Claude Code 도구 생태계에서 `Grep`은 파일 **내부 텍스트 내용(Content)**을 패턴으로 검색할 때 사용하며, `Glob`은 **파일 경로/이름(Filename/Path)** 패턴으로 파일 목록을 찾을 때 사용합니다. 코드 전체에서 특정 변수명이 언급된 위치를 탐색할 때는 `Grep`을 사용하여 영향 범위를 사전에 파악하는 것이 표준적인 접근법입니다.

**문제 상황 분석:**
- 수백 개의 파일에 걸쳐 환경 변수 `API_TIMEOUT_MS`가 참조되고 있음
- 각 참조 지점의 주변 코드가 서로 다름
- 변경 작업(Edit)을 적용하기 전에 영향받는 전체 범위(파일 및 정확한 줄 위치)를 완벽히 파악해야 함

**A번이 정답인 이유:**
`Grep` 도구에 검색 대상 패턴(`API_TIMEOUT_MS`)과 출력 모드(`content`)를 지정하여 실행하면, 코드베이스 전체에서 해당 변수를 참조하는 모든 파일과 해당 줄(Line) 번호/내용을 수집할 수 있습니다. 이를 통해 변경을 적용하기 전 영향 범위를 명확히 검토(Review)할 수 있으므로 최선의 접근법입니다.

**오답 분석:**
- **Option B (오답)**: Bash로 대화형 에디터를 여는 것은 에이전트 환경에서 비효율적일 뿐만 아니라 자동화 및 정확한 검색 목적에 맞지 않습니다.
- **Option C (오답)**: 하나의 파일만 먼저 수정한 뒤 모델의 '추론'에만 의존해 나머지 파일을 찾는 방식은 수백 개 파일 중 일부 참조를 누락(Missing reference)시키는 치명적인 결과를 가져올 수 있습니다.
- **Option D (오답)**: `Glob`은 **파일 이름** 패턴을 일치시키는 도구입니다. 변수명이 파일 이름에 포함되어 있지 않고 파일 내용 속에 포함되어 있는 일반적인 상황에서는 `Glob`으로 참조 위치를 찾을 수 없습니다.

---

## 51번 문제 (★)

**1. 문제 원문**

A team is building an agent that uses manual extended thinking (`thinking: {"type": "enabled"}`) to reason before acting, and they want to force it to always call a tool rather than answer directly. They set `tool_choice` to `{"type": "any"}` while manual extended thinking is enabled, and the request fails. What is the correct explanation and recommended remedy?

A) The request failed because extended thinking disables all `tool_choice` options; to fix this, remove all tools from the request and let the model output its reasoning steps as text before acting.

B) The request failed because `{"type": "any"}` requires at least two tools to be defined; adding a second tool, such as a calculator, resolves the incompatibility with extended thinking.

C) The request failed because `{"type": "any"}` is deprecated; replace it with `{"type": "forced"}` and specify a tool name like `search` to satisfy the forced tool choice requirement.

D) When manual extended thinking is enabled, the `tool_choice` values `{"type": "any"}` and `{"type": "tool", ...}` are not supported; set it to `{"type": "auto"}` or `{"type": "none"}` instead. To force a tool call while still using thinking, migrate to adaptive thinking (supported on newer models), or disable manual extended thinking.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: D번**

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

## 53번 문제 (★)

**1. 문제 원문**

Claude needs to reorganize a file by moving several scattered `export` statements into one grouped block near the top. Which tool sequence should Claude use?

A) Issue one `Edit` call per export statement, each targeting a short unique snippet, relying on the accumulated edits to produce the new grouped layout.

B) Call `Glob` for the file's own path to confirm it exists, then call `Edit` with `old_string` set to the whole file's text and `new_string` as the new version.

C) Read the file to load its full contents, then call `Write` with the complete restructured file content back over that same path.

D) Call `Grep` with output mode `content` to retrieve the matching export lines, treating the returned text as already written back to the file.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: C번**

**정답 및 해설:**

**핵심 개념**: 파일 대규모 재구성을 위한 `Edit` vs `Write` 도구 선택 기준  
Claude Code 도구 세트에서 `Edit` 도구는 파일의 **일부 구간(부분 수정)**을 고유한 `old_string`을 기반으로 안전하게 치환할 때 적합합니다. 반면 파일 전체에 걸쳐 코드를 대대적으로 이동하거나 레이아웃을 완전히 재구성(Restructure/Reorganize)할 때는, 여러 번의 부분 수정보다 파일 전체 내용을 읽어온 후 **`Write` 도구로 전체 내용을 덮어쓰는 것**이 훨씬 안정적이고 오류를 최소화할 수 있습니다.

**문제 상황 분석:**
- 파일 전체에 여기저기 흩어져 있는 `export` 구문들을 파일 상단으로 모으는 대대적인 구조 변경 작업임
- 파일 전체의 여러 줄이 동시에 삭제 및 이동되는 광범위한 변화가 발생함
- 이 상황에서 가장 적절하고 효율적인 파일 수정 도구 사용 패턴을 찾아야 함

**C번이 정답인 이유:**
파일의 전체 구조를 재배치할 때 여러 개의 부분 `Edit`을 연쇄적으로 수행하면 코드 오프셋이 달라지거나 인접 코드가 꼬여 에러가 발생하기 쉽습니다. 따라서 먼저 파일 내용을 읽어온 뒤, 재구성된 전체 코드를 `Write` 도구를 통해 동일한 경로에 통째로 새로 작성(Overwriting)하는 방식이 모범 사례(Best Practice)입니다.

**오답 분석:**
- **Option A (오답)**: 흩어진 각 구문마다 `Edit`을 여러 번 연속으로 호출하면 중간 과정에서 고유 문자열 일치가 깨지거나 코드가 꼬일 위험이 매우 큽니다.
- **Option B (오답)**: 단일 파일의 존재 여부를 확인하기 위해 `Glob`을 호출하는 것은 불필요하며, `Edit`의 `old_string`에 파일 전체 텍스트를 넣는 것은 `Edit` 도구의 취지에도 맞지 않으며 `Write` 도구를 사용하는 것이 올바른 방법입니다.
- **Option D (오답)**: `Grep`은 단순 파일 내용 검색 도구일 뿐, 파일에 데이터를 다시 쓰거나(Write) 수정하는 기능이 전혀 없습니다.

---

## 58번 문제 (★)

**1. 문제 원문**

A newly onboarded architect asks Claude Code to trace how a login request flows from the HTTP route handler through to the database call, in a codebase Claude has not explored yet. To build this understanding efficiently while keeping context usage low, what is the best incremental strategy?

A) Start by reading CLAUDE.md or AGENTS.md if they exist to gain high-level architecture context, then use Grep to locate the route handler and its imports, and read files incrementally along the call chain.

B) Use Bash to run a full-text word count across the repository and read the files with the highest counts, on the assumption larger files hold core business logic.

C) Use Read to open every file under the src directory up front, building a complete mental model of the whole codebase before looking for the login flow specifically.

D) Use Glob to list every file in the repository sorted by modification time, then read the twenty most recently modified files on the assumption they relate to login.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: A번**

**정답 및 해설:**

**핵심 개념**: 컨텍스트 윈도우 효율적 코드 탐색(Context Window Efficient Exploration)

**문제 상황 분석:**
- 새로운 아키텍트가 아직 Claude가 읽어보지 않은 프로젝트에서 로그인 흐름 추적을 요청함.
- 목적은 코드베이스를 효율적으로 이해하면서 토큰 사용량을 최소한으로 유지하는 것임.
- 무작위 파일 열람이나 전체 파일 일괄 로딩을 피하고 필요한 경로만 점진적으로 파악해야 함.

**A번이 정답인 이유:**
- 프로젝트 설정 문서(`CLAUDE.md` 등)를 먼저 읽어 전체 아키텍처를 파악합니다.
- `Grep` 도구로 라우트 핸들러 위치를 검색한 뒤 호출 체인을 따라 필요한 파일만 순차적으로 읽어 토큰 소모를 방지합니다.

**오답 분석:**
- Option A 외 오답들(B, C, D)은 대용량 파일 가정, 전체 파일 일괄 오픈, 무작위 최근 수정 파일 열람 등으로 컨텍스트 낭비 및 비효율성을 초래하므로 오답입니다.

---

## 64번 문제 (★)

**1. 문제 원문**

A platform team is designing error responses for a fleet of internal MCP tools. One engineer proposes that every tool failure, regardless of cause, return the same generic text "Operation failed" with `isError: true`, arguing this keeps the interface simple for tool authors. What is the strongest architectural objection to this proposal?

A) Returning a constant error string for every failure adds metadata overhead that pushes the total block size beyond the MCP protocol's maximum content length, so the server rejects the tool result as non-compliant.

B) A uniform generic message gives the agent no basis for choosing among retrying, adjusting input, or escalating, so it cannot make an appropriate recovery decision for each failure.

C) Uniform error text prevents the server from ever setting isError:true because the MCP specification requires a unique diagnostic string to accompany the flag for each failure, so the tool cannot activate the error state.

D) The MCP specification requires every isError:true result to include a machine-parseable stack trace, so a generic text response without that structured data violates the protocol and is rejected by the platform.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: B번**

**정답 및 해설:**

**핵심 개념**: AI 에이전트 오류 복구 및 유익한 오류 피드백(AI Agent Error Recovery & Informative Error Feedback)

**문제 상황 분석:**
- 모든 도구 실패에 동일한 텍스트("Operation failed")를 반환하자고 제안함.
- 에이전트가 오류의 원인을 진단할 수 없는 구조적 문제점이 발생함.

**B번이 정답인 이유:**
- 동일한 메시지만 반환되면 에이전트는 재시도, 입력 수정, 에스컬레이션 중 어떤 복구 조치를 취해야 할지 판단할 수 없습니다.

**오답 분석:**
- Option A, C, D는 프로토콜 길이 제한이나 가상의 필수 스택 트레이스 규칙 등을 잘못 가정했으므로 오답입니다.
