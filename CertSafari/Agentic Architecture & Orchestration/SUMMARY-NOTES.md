# Agentic Architecture & Orchestration — 학습용 핵심 요약 노트

모의시험 94문항(01–50, 61–70, 81–114) 기반. 51–60, 71–80번은 원본 파일에 문항이 없습니다.

**사용법**: "문제 신호"로 지문 키워드를 잡고 → "정답 키워드"를 고르고 → "함정 키워드"는 버린다.

---

## 0. 5초 판별 치트시트 (Decision Cheatsheet)

| 지문에 이게 보이면 | 정답은 이 방향 |
|---|---|
| guarantee / never / must / always / every time (보장·절대) | **Hook (결정론적)** — 프롬프트 강화는 오답 |
| irreversible / financial / compliance (비가역·금전·규제) | **PreToolUse hook + deny 또는 ask** |
| cannot be known ahead of time / vague / depends on findings (미리 알 수 없음) | **Dynamic orchestrator (동적)** |
| same steps every time / never branch (항상 같은 순서) | **Prompt chain (고정 체인)** |
| independent / none depend on another (서로 독립) | **Parallel 병렬 실행 후 synthesize** |
| never modify / read-only (수정 금지) | **tools 배열을 읽기 전용으로 제한** |
| subagent doesn't know X (서브에이전트가 모름) | **컨텍스트 격리 — 프롬프트에 명시적 전달** |
| different machine / fresh container (다른 머신·새 컨테이너) | **transcript 없음 → 결과를 새 프롬프트에 주입** |
| stale / rewritten file (오래된·변경된 파일) | **재읽기 지시 또는 새 세션 + 요약 주입** |
| two independent explorations (두 갈래 독립 탐색) | **fork_session** |
| tool output 형식 제각각 (출력 형식 불일치) | **PostToolUse hook + updatedToolOutput** |
| tool input 정규화·덮어쓰기 (입력 정규화) | **PreToolUse hook + updatedInput** |

**만능 오답 패턴 (거의 항상 함정)**
- "prompt를 더 강하게/반복해서 쓴다" (system prompt 강화)
- "temperature를 낮춘다"
- "더 큰 모델로 바꾼다"
- "maxTurns를 늘린다"
- "timeout을 늘린다"
- "always / never / all / only" 같은 절대 단정어가 들어간 보기
- 문제와 무관한 파라미터를 만능 해결책처럼 제시하는 보기

---

## 1. 에이전트 루프 & Messages API (Agent Loop)

**해당 문제**: 1, 5, 19 / 6·12·13·16(21-40) / 64, 68 / 83, 99, 111

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| `stop_reason` | 정지 이유 | 루프 제어의 **유일한 공식 신호** |
| `end_turn` | 턴 종료 | 도구 요청 없이 완료 → **루프 종료** |
| `tool_use` | 도구 사용 | 도구 실행 후 결과 넣고 **루프 계속** |
| `tool_result` | 도구 결과 | **user role 메시지**에 담아 append |
| `tool_use_id` | 도구 호출 ID | 각 결과를 원래 호출에 **1:1 매핑** |
| `is_error: true` | 오류 표시 | 실패해도 **중단 말고 모델에게 전달** |
| agentic loop | 에이전틱 루프 | 요청→도구→결과→재요청 반복 |

### 정답 키워드 (Correct)
- **"stop_reason directly reports whether Claude finished its turn"** (stop_reason이 턴 완료 여부를 직접 보고) — 문서화된 신호
- **"new user-role message appended after the assistant message"** (assistant 메시지 뒤 새 user 메시지로 추가) — tool_result 위치
- **"a separate tool_result block for each, matching each result to its own tool_use_id"** (각 결과를 자기 tool_use_id에 매핑해 개별 블록으로) — 다중 도구 호출
- **"append tool_result and send the full updated conversation back"** (전체 갱신 대화를 되돌려 보냄)
- **"lets Claude see the failure in context and decide the next step, such as retrying"** (실패를 맥락에 넣고 모델이 다음 단계 결정) — 에러 처리
- **"end_turn on the first response is a valid immediate completion"** (첫 응답의 end_turn도 정상 완료) — 도구 없이 끝날 수 있음
- **"end_turn means Claude produced a final response with no further tool request"** (더 이상 도구 요청 없는 최종 응답)
- **"tool_result was never added to the context, so the model has no record"** (결과를 컨텍스트에 안 넣어서 모델이 기억 못함) — 반복 호출의 원인
- **"application must execute each requested tool and submit results as tool_result"** (애플리케이션이 직접 도구 실행) — Messages API 직접 연동
- **"cut the loop off while stop_reason is still tool_use"** (아직 tool_use인데 루프를 끊음) — 고정 반복 상한의 문제

### 함정 키워드 (Distractor)
- **"final text block is non-empty"** (마지막 텍스트 블록이 비어있지 않음) — 도구 호출 시에도 설명 텍스트가 나오므로 신뢰 불가
- **"total count of content blocks"** (콘텐츠 블록 총 개수) — 완료 신호 아님
- **"stop_reason and text emptiness always change together"** (항상 함께 변함) — 거짓
- **"metadata on the HTTP request headers"** (HTTP 헤더에 메타데이터로) — 틀림
- **"system-role message before the original user prompt"** (원래 프롬프트 앞 system 메시지) — 틀림
- **"inside that same assistant-role message, replacing it"** (같은 assistant 메시지 안에 넣어 대체) — 틀림
- **"Claude executes the tools internally on Anthropic's servers"** (Anthropic 서버가 도구를 실행) — 클라이언트 도구는 절대 아님
- **"registers a webhook URL that Anthropic calls back"** (웹훅 콜백) — 없는 기능
- **"API automatically executes any tool whose name matches"** (이름이 맞으면 자동 실행) — 없음
- **"is_error becomes the sole termination signal"** (is_error가 유일한 종료 신호) — 아님
- **"error tool_results reset that tool's rate limits"** (에러 결과가 rate limit 초기화) — 거짓
- **"context window silently resets"** / **"API automatically clears tool_use blocks every two iterations"** (컨텍스트가 조용히 초기화됨) — 존재하지 않는 동작
- **"Messages API enforces its own hard limit of five tool calls"** (API가 5회 도구 호출 제한을 강제) — 거짓

### Client SDK vs Agent SDK (99번)
- 정답: **"Agent SDK bundles built-in tools and runs the agentic loop internally, while the Client SDK requires manually inspecting stop_reason"** (Agent SDK는 내장 도구 + 루프 자체 제공 / Client SDK는 직접 stop_reason 확인 후 루프 작성)
- 함정: "Client SDK cannot return stop_reason at all" (아예 반환 못함 — 거짓), "both need an identical amount of custom loop code" (동일한 양의 코드 필요 — 거짓)

---

## 2. Hooks — 결정론적 제어 (Deterministic Guardrails)

**해당 문제**: 6, 7, 17, 18 / 1·2·3·4·17·18(21-40) / 48, 61, 65 / 81, 85, 88, 96, 98, 102, 104, 107, 113

### 훅 종류와 용도 (반드시 암기)
| 원문 | 한국어 | 언제 쓰나 |
|---|---|---|
| **PreToolUse** | 도구 실행 **전** | 차단(deny), 승인 요청(ask), **입력 정규화·덮어쓰기(updatedInput)** |
| **PostToolUse** | 도구 실행 **후** | **출력 정규화(updatedToolOutput)**, 결과 형식 통일 |
| **SubagentStop** | 서브에이전트 종료 시 | 완료 감지 및 **결과 집계(aggregate)** |
| **UserPromptSubmit** | 사용자 입력 제출 시 | 프롬프트 전처리 |
| **SessionStart** | 세션 시작 시 | 초기 컨텍스트 주입 |
| **Notification** | 권한 프롬프트 등 | 결과 정보는 담지 못함 |

### permissionDecision 3종
| 값 | 한국어 | 언제 |
|---|---|---|
| `deny` | 거부 | 절대 안 되는 것 (정책 위반, 검증 실패) |
| `ask` | 사람에게 확인 요청 | **비가역 작업 + 인간 검토 필요** (예: $500~$1000 환불) |
| `allow` | 허용 | 저위험·읽기 전용 작업 |

### 정답 키워드 (Correct)
- **"enforces the rule entirely outside of model generation, so it cannot be bypassed"** (모델 생성 과정 밖에서 강제 → 우회 불가) ★ 훅 문제 최빈 정답
- **"deterministically enforces the rule on every matching tool call, while the prompt clause only influences the likelihood"** (훅은 결정론적 / 프롬프트는 확률적 영향만)
- **"registered in application code separate from the prompt, so a prompt edit cannot silently remove the enforcement"** (프롬프트와 분리된 코드에 등록 → 프롬프트 수정으로 사라지지 않음)
- **"returns permissionDecision 'deny' with a reason whenever the amount exceeds $500"** (임계값 초과 시 이유와 함께 거부)
- **"permissionDecision 'ask', so the operation is surfaced for approval"** (승인용으로 노출) — 인간 검토 필요 시
- **"a single PreToolUse hook that normalizes then checks the threshold, returning updatedInput"** (하나의 훅에서 정규화 후 검증, updatedInput 반환)
- **"permissionDecision 'allow' together with updatedInput that overwrites the customer_id with the verified ID"** (검증된 ID로 인자 덮어쓰기)
- **"a PostToolUse hook that parses each response and returns updatedToolOutput with values rewritten into one consistent format"** (응답을 하나의 형식으로 재작성)
- **"updatedToolOutput, because it replaces output for all tools (built-in and MCP)"** (내장·MCP 도구 **모두**에 적용) ★ updatedMCPToolOutput은 MCP 전용
- **"Catch the timeout and return permissionDecision 'deny' with a reason"** (예외를 잡아 거부 반환) — **Fail-Closed 패턴**
- **"the second hook operates on the first hook's updatedToolOutput"** (두 번째 훅이 첫 훅의 출력 위에서 동작) — 훅 체이닝
- **"Inside the callback function, by reading input_data['tool_input']['category']"** (콜백 안에서 인자 검사) — matcher는 도구 **이름만** 필터
- **"inspect the explicit verification result in the tool call parameters, instead of relying on a separate boolean flag"** (별도 플래그 대신 명시적 검증 결과 확인) — 상태 결합도 낮추기
- **"Refunds are financial and hard to reverse, and prompt instructions have a non-zero failure rate"** (금전·비가역 + 프롬프트 실패율은 0이 아님)
- **"the regex matcher is unanchored... the fix is to anchor with ^ and $"** (앵커 없는 정규식 → `^refund$`로 고정)

### 함정 키워드 (Distractor)
- **"Rewrite the system prompt to state the rule three times"** (규칙을 세 번 반복 작성) — 확률적 제어, 보장 불가
- **"Lower the model's temperature to 0.1"** (temperature 낮추기) — 결정론적 보장 아님
- **"repeats the ordering requirement twice and adds the word 'must'"** (must로 바꾸고 두 번 반복) — 동일 함정
- **"a larger context window so it retains the instruction"** (컨텍스트 윈도우 확대) — 무관
- **"a PostToolUse hook that writes to an audit log after the fact"** (사후 감사 로그) — 이미 실행된 뒤라 차단 실패
- **"catch the timeout and return 'allow'"** (타임아웃 시 허용) — **Fail-Open**, 보안 붕괴
- **"Increase the hook's timeout to several hours"** (타임아웃을 몇 시간으로) — 해결 아님
- **"Remove the hook during the outage"** (장애 동안 훅 제거) — 강제력 포기
- **"a regex in the matcher string such as refund_customer.*category=restricted"** (matcher 문자열로 인자 필터) — matcher는 **도구 이름만** 필터
- **"a second field called argument_matcher"** (argument_matcher 필드) — 존재하지 않음
- **"updatedInput automatically propagates between PreToolUse hooks"** (훅 간 자동 전파) — 보장되지 않음
- **"hooks sorted alphabetically by name"** / **"conflicts resolved by timeout value"** / **"hooks must share the same tool_use_id"** (이름순 정렬·타임아웃으로 충돌 해결·같은 ID 필요) — 모두 지어낸 규칙
- **"regex matchers in hooks are automatically anchored"** (자동 앵커됨) — 거짓
- **"Add a PostToolUse hook to reverse the transaction after the refund is initiated"** (실행 후 되돌리기) — 비가역 작업에 부적절
- **"Replace the model with a larger model that can re-read the conversation"** (더 큰 모델로 교체) — 결정론 아님

### MCP matcher 정규식 (17·18번(21-40), 48번, 113번)
| 패턴 | 의미 | 판정 |
|---|---|---|
| `mcp__billing__.*` / `mcp__billing__*` | billing 서버의 **모든 도구** | ✅ 정답 |
| `mcp__billing__(issue_refund\|void_authorization\|apply_credit)` | 특정 3개 도구만 | ✅ 정답 |
| `mcp__billing` | 접두사만 (도구 구분 못함) | ❌ 함정 |
| `^mcp__` | 모든 MCP 서버 (inventory까지 매칭) | ❌ 함정 |
| `billing` | 앵커 없음, 아무 데나 매칭 | ❌ 함정 |
| `/refund/` | 앵커 없음 → `issue_refund_note`도 매칭 | ❌ 함정 |
| `/^refund$/` | 정확히 `refund`만 | ✅ 정답 |

**MCP 도구 이름 규칙**: `mcp__<서버명>__<도구명>` (밑줄 **2개**씩)

**주의 (102번)**: "`allow` + `updatedInput`으로 환불을 no-op으로 바꿔치기"는 보통 우회처럼 보이지만, **재시도 루프 차단**을 묻는 102번에서는 정답입니다. 지문이 "denied 후 모델이 계속 재시도한다"를 문제 삼는지 확인하세요.

---

## 3. 작업 분해 패턴 (Task Decomposition Patterns)

**해당 문제**: 13, 14, 15, 16, 20 / 5·7·9·14·20(21-40) / 41, 42, 46, 50, 62, 70 / 90, 91

### 패턴 선택 기준 ★ 가장 자주 나오는 축
| 패턴 (원문) | 한국어 | 선택 조건 (지문 신호) |
|---|---|---|
| **Prompt Chaining** | 프롬프트 체이닝 | steps **never branch**, same order every time (항상 같은 고정 순서) |
| **Parallelization** | 병렬화 | subtasks are **independent** (서로 의존 없음) |
| **Orchestrator-Workers / Dynamic Orchestration** | 동적 오케스트레이션 | **cannot be known ahead of time**, depends on what earlier steps uncover |
| **Map-Reduce / Divide and Conquer** | 분할 정복 | 항목이 너무 많아 **attention dilution** (주의력 희석) |
| **Routing** | 라우팅 | 요청마다 복잡도가 달라 필요한 것만 호출 |

### 정답 키워드 (Correct)
- **"a fixed prompt chain since its steps never branch"** (분기가 없으므로 고정 체인)
- **"adaptive decomposition based on findings"** (발견 내용에 따른 적응형 분해)
- **"a dynamic orchestrator that generates and prioritizes new investigation subtasks based on what each prior step uncovers"** (이전 단계 결과로 새 하위작업 생성·우선순위화) ★ 조사·인시던트 단골 정답
- **"the subtasks are independent, so parallelization improves efficiency"** (독립적이므로 병렬화)
- **"investigate concurrently, then combine the findings into one synthesized reply"** (동시 조사 후 하나로 종합) — fan-out / fan-in
- **"a per-file local analysis pass, then a separate cross-file integration pass"** (파일별 분석 → 파일 간 통합 분석) ★ 40개 파일 PR 문제
- **"the first pass already dilutes attention across all files at once"** (한 번에 전부 담으면 주의력이 희석됨)
- **"a prompt chain with a checkpoint between each stage"** (단계마다 체크포인트를 둔 체인) — 게이트 검증 포함
- **"decomposes cleanly into fixed, predictable subtasks, giving predictability without delegation overhead"** (위임 오버헤드 없이 예측 가능)
- **"a dynamic orchestrator adds unnecessary complexity and latency without improving the outcome"** (불필요한 복잡도·지연만 추가) — **오버엔지니어링 비판**
- **"decomposed the query too narrowly, so the subtasks left broad areas uncovered"** (너무 좁게 쪼개서 넓은 영역이 누락됨)
- **"Rewrite the prompt around the research goal and quality bar, rather than a fixed step sequence"** (고정 단계 대신 목표·품질 기준 중심) — **goal-oriented prompting**
- **"Design X lets the model adapt its next action to intermediate findings, while Design Y is a fixed tree"** (동적 vs 고정 트레이드오프)
- **"assess each ticket's complexity with a lightweight classification prompt returning structured JSON, then invoke only the required subagents"** (경량 분류로 필요한 것만 호출) — 조건부 라우팅
- **"Orchestrator-workers, because the required investigation steps cannot be predicted upfront"** (조사 단계를 미리 예측 불가) — 보안 감사 문제

### 함정 키워드 (Distractor)
- **"dynamic orchestration is always the safer default"** (동적이 항상 더 안전한 기본값) — always가 붙으면 오답
- **"always produces better results than any fixed order can ever achieve"** (항상 더 낫다) — 절대 단정
- **"any workflow involving financial data must follow one predetermined sequence"** (금융 데이터면 무조건 고정 순서) — 거짓
- **"let the model silently skip whichever rules it judges unnecessary"** (모델이 임의로 규칙 생략) — 컴플라이언스 위반
- **"an even more granular ten-step sequence to remove ambiguity entirely"** (10단계로 더 세분화) — over-specification 함정
- **"add a fifth step to double-check the date it already extracted"** (이미 추출한 것을 재확인) — 근본 원인 미해결
- **"increase the required article count from five to six"** (5개→6개) — 숫자 조정은 함정
- **"Ask the customer to submit two separate tickets"** (티켓을 나눠 재제출 요청) — 사용자에게 부담 전가
- **"Randomize the file order"** / **"Raise the sampling temperature"** (파일 순서 무작위화·temperature 상승) — 주의력 희석 미해결
- **"a longer system prompt that more precisely defines what an integration bug is"** (더 긴 시스템 프롬프트) — 구조 문제를 프롬프트로 덮음
- **"Prompt chaining, because audits always follow the same three fixed steps"** (감사는 항상 3단계) — 미지의 조사에 부적합
- **"a single-pass prompt, the model can determine exploitability from the CVE description alone"** (CVE 설명만으로 판단) — 코드베이스 미검사
- **"Skip the address change silently"** / **"Resolve one concern, then open a new session with no memory"** (한쪽만 처리·기억 없는 새 세션) — 다중 의도 처리 실패

---

## 4. 서브에이전트 & 코디네이터 (Subagents & Coordination)

**해당 문제**: 2, 4, 8, 9, 11 / 8·15·19(21-40) / 43, 44, 45, 47, 69 / 87, 93, 94, 95, 97, 100, 101, 106, 108, 109, 110, 112, 114

### 핵심 개념
| 원문 | 한국어 | 핵심 |
|---|---|---|
| **Task tool** | Task 도구 | 서브에이전트 호출 도구. `allowedTools`에 없으면 매번 권한 프롬프트 |
| **description field** | 설명 필드 | **자동 위임(라우팅)의 트리거 신호** — 모호하면 위임 안 됨 |
| **prompt field** | 프롬프트 필드 | 서브에이전트의 **영구 시스템 프롬프트** (전문성 정의) |
| **per-call prompt** | 호출별 프롬프트 | 그 실행의 **구체적 작업 내용** |
| **tools array** | 도구 배열 | 권한 제한 수단 — **최소 권한 원칙** |
| **Context isolation** | 컨텍스트 격리 | 서브에이전트는 부모·형제 맥락을 **자동 상속하지 않음** |
| **Hub-and-Spoke** | 허브 앤 스포크 | 모든 통신을 코디네이터 경유 → 로깅·재시도·오류처리 중앙화 |
| **Agent Teams** | 에이전트 팀 | 에이전트 간 **직접 메시징** + 다중 세션 중앙 관리 |
| **Nesting depth** | 중첩 깊이 | **최대 5단계** (메인 에이전트를 1단계로 포함) |

### 정답 키워드 (Correct)
- **"Emit all three Task calls within one coordinator response"** (한 응답 안에서 3개 Task 호출 발행) ★ 진짜 병렬 실행 방법
- **"Agent teams, which support inter-agent messaging and centralized management"** (에이전트 간 메시징 + 중앙 관리)
- **"SubagentStop, which fires on subagent completion and lets the coordinator aggregate results"** (완료 시 발화, 결과 집계)
- **"Centralize error handling, logging, and retry policy in the coordinator"** (오류처리·로깅·재시도를 코디네이터에 중앙화)
- **"Route all inter-subagent communication through the coordinator"** (모든 서브에이전트 간 통신을 코디네이터 경유)
- **"structured entries that separate content from metadata, such as source URL, document name, and page number"** (내용과 메타데이터 분리) ★ 출처 귀속
- **"matches the query against each subagent's description field and delegates automatically"** (description 매칭으로 자동 위임)
- **"the description field is vague or missing, so Claude has no trigger signal"** (description이 모호·누락 → 트리거 없음)
- **"Task is not listed in allowedTools; add Task to auto-approve subagent calls"** (allowedTools에 Task 추가)
- **"Set tools to ['Read', 'Grep'] so it inherits only the listed read tools"** (읽기 전용 도구만 부여) ★ 최소 권한 원칙
- **"Include the subagent-invocation tool in lead-investigator's tools, and omit it from final-summarizer"** (호출 도구를 한쪽에만 부여)
- **"each invocation starts a fresh context unless a specific prior agent is explicitly resumed"** (명시적 재개 없으면 매 호출이 새 컨텍스트) — **정상 동작**
- **"Include the complete findings directly in synthesis's prompt, since subagents never automatically inherit parent or sibling context"** (결과를 프롬프트에 직접 포함)
- **"AgentDefinition.prompt sets the persistent system prompt, while the per-call prompt supplies the specific task details"** (영구 시스템 프롬프트 vs 호출별 작업 내용)
- **"Subagents can nest up to a maximum of five levels deep, including the main agent as the first level"** (메인 포함 최대 5단계)
- **"Evaluate the synthesis output for gaps, then re-delegate targeted queries before re-invoking synthesis"** (갭 평가 후 표적 재위임)
- **"Use the Workflow tool to move orchestration into a script outside the conversation"** (200개 규모 → 외부 스크립트로 분리)
- **"presents the conflicting reports to the end user with references to the different sources"** (상충 결과를 출처와 함께 사용자에게 제시)
- **"The partial text output the subagent already produced, along with a note that the subagent didn't finish"** (부분 출력 + 미완료 표시)
- **"subagents must inherit coordinator-level deny rules, so Bash would be blocked"** (코디네이터 거부 규칙 상속 → 차단)
- **"the prompt alone is not a guaranteed invocation; it influences but does not force"** (이름을 불러도 호출은 보장되지 않음)
- **"required structured fields for customer details, root cause, and a recommended action"** (고객정보·근본원인·권장조치 구조화 필드) ★ 핸드오프
- **"Customer ID 88213; root cause: a duplicate authorization hold...; recommended action: void the hold"** (ID + 근본원인 + 권장조치 형태의 요약)

### 함정 키워드 (Distractor)
- **"Merge the three subagents into a single AgentDefinition"** (셋을 하나로 병합) — 병렬성 상실
- **"Set persistSession to false"** (persistSession 끄기) — 병렬성과 무관
- **"Increase maxTurns so they finish faster and appear to overlap"** (maxTurns 증가로 겹쳐 보이게) — 병렬 아님
- **"Assign one subagent to monitor the others"** (한 서브에이전트가 감시역) — 허브 앤 스포크 위반
- **"copying the identical retry code into each subagent's system prompt"** (동일 코드를 각 프롬프트에 복사) — 중앙화 아님
- **"Give each subagent direct write access to a shared database"** (공유 DB 직접 쓰기) — 코디네이터 가시성 상실
- **"poll a shared task queue directly and notify the coordinator only after completion"** (직접 큐 폴링, 완료 후에만 통보) — 실패 가시성 없음
- **"requires the query to include the subagent's exact name"** (정확한 이름 필수) — 거짓
- **"invokes subagents in the fixed order they were defined"** (정의된 순서대로 호출) — 거짓
- **"always invokes every defined subagent and discards irrelevant output"** (전부 호출 후 버림) — 거짓
- **"rely on the description field to signal that the subagent is read-only"** (설명으로 읽기 전용임을 알림) — 강제력 없음
- **"instruct it in the prompt never to call Edit or Write"** (프롬프트로 금지 지시) — 확률적, 보장 불가
- **"Lower the subagent's model tier so it is less capable of generating file-modification calls"** (모델 등급 낮추기) — 넌센스
- **"Set background to true, since background execution grants the ability to spawn subagents"** (background가 생성 권한 부여) — 거짓
- **"only larger models are capable of nested delegation"** (큰 모델만 중첩 위임 가능) — 거짓
- **"Nesting is unlimited as long as each subagent has the Agent tool"** (무제한 중첩) — 거짓 (5단계 제한)
- **"all subagents in the same coordinator session share one combined context window"** (하나의 컨텍스트 공유) — 거짓
- **"subagent definitions cache their reasoning across calls"** (추론을 호출 간 캐싱) — 거짓
- **"Increase synthesis's maxTurns so it can rediscover the same sources"** (재발견하도록 턴 증가) — 낭비
- **"Switch to a larger model so it infers the missing context"** (큰 모델이 알아서 추론) — 격리 문제 미해결
- **"Grant synthesis the same search tools so it can re-run the queries"** (같은 도구 부여해 재검색) — 중복 작업
- **"Whichever sub-agent returned first takes precedence"** (먼저 응답한 쪽이 우선) — 거짓
- **"discard the conflicting results and provide no answer"** (상충 결과 폐기, 무응답) — 거짓
- **"a subagent's own tools field independently grants access regardless of deny rules"** (deny 규칙 무시하고 독립 부여) — 거짓
- **"Run all five subagents in parallel for every ticket"** (모든 티켓에 5개 전부 병렬) — 불필요한 호출 자체가 문제
- **"Remove the coordinator entirely"** (코디네이터 제거) — 허브 앤 스포크 파괴
- **"increase the coordinator's maxTurns to accommodate more invocations"** (턴 상한 증가로 대응) — 200개 규모엔 부적합
- **"See the attached conversation transcript"** (대화 기록 첨부 참조) — 상담원이 접근 못함
- **"use your judgment on what discount, if any, is appropriate"** (알아서 판단하세요) — 구조화 실패
- **"increase the free-text field's maximum character limit"** (자유 텍스트 글자수 늘리기) — 구조화 아님

---

## 5. 세션 관리 (Session Management)

**해당 문제**: 3, 10, 12 / 10·11(21-40) / 49, 66, 67 / 82, 84, 86, 89, 92, 103, 105

### 핵심 개념
| 원문 | 한국어 | 핵심 |
|---|---|---|
| **resume** | 재개 | 같은 히스토리에 **이어붙임** (순차 누적) |
| **fork / fork_session** | 분기 | **독립된 브랜치** 생성, 원본 보존 |
| **/fork** | 포크 명령 | 터미널 안에서 대화 복사본으로 전환 |
| **transcript** | 트랜스크립트 | 세션 기록 **파일**, 로컬 디스크에 저장 |
| **working directory** | 작업 디렉터리 | 세션이 **바인딩되는 위치** — 다르면 못 찾음 |
| **session name** | 세션 이름 | `/rename` 또는 시작 시 지정 → `--resume <name>` |
| **/clear** | 컨텍스트 비우기 | 히스토리 삭제 |
| **/compact** | 압축 | 히스토리를 요약으로 대체 |

### 정답 키워드 (Correct)
- **"The session's transcript file only exists on the original machine"** (트랜스크립트가 원래 머신에만 존재) ★ CI·다른 머신 문제
- **"Whether the resume call ran from the same working directory"** (같은 작업 디렉터리에서 재개했는지)
- **"Run /fork with an optional name to switch into a copy of the conversation"** (이름 지정 가능한 대화 복사본)
- **"Resuming the same session twice appends both explorations to one shared history; forking gives two independent branches"** (재개는 누적, 포크는 독립 분기)
- **"Resume the analysis session twice with fork_session set, producing two independent branches from the shared baseline"** (공유 베이스라인에서 두 독립 브랜치)
- **"Sessions persist the conversation history, not a snapshot of the filesystem"** (세션은 대화 기록만 보존, 파일시스템 스냅샷 아님)
- **"Resume the session's ID with a higher max_turns value on the follow-up query"** (턴 상한을 올려 같은 세션 재개) — 기존 분석 보존
- **"claude --resume payment-retry-bug"** (이름으로 직접 재개)
- **"Give the session a descriptive name at startup or via /rename"** (설명적 이름 부여)
- **"claude -p --resume <session-id> --output-format json"** (비대화형 + JSON 출력) ★ 스크립트 파싱용
- **"Track each user's captured session ID and pass it to resume"** (사용자별 세션 ID 추적) — 다중 사용자
- **"Capture the earlier stage's key results as application state and pass them into a new session's opening prompt"** (결과를 앱 상태로 저장 후 새 세션 프롬프트에 주입) ★ 서버리스·컨테이너
- **"Start a fresh session and inject the already-prepared structured summary as the opening prompt"** (준비된 구조화 요약을 새 세션에 주입) — stale 컨텍스트 회피

### 함정 키워드 (Distractor)
- **"CI workers are restricted from resuming interactive sessions"** (CI가 대화형 세션 재개 금지) — 거짓
- **"the session name was too long for the lookup"** (이름이 너무 김) — 거짓
- **"fork_session prevents cross-machine resumption"** (포크가 머신 간 재개를 막음) — 거짓
- **"the prompt text used to resume must match the original exactly"** (프롬프트 텍스트 일치 필요) — 거짓
- **"Run /clear to empty context"** / **"Run /compact to replace history"** (지우기·압축) — 분기가 아니고 원본 손실
- **"Run /resume and select the same session again to duplicate it in place"** (같은 세션 재선택으로 복제) — 복제되지 않음
- **"Resume can only ever be called once per session id"** (세션당 재개 1회 제한) — 거짓
- **"Resuming quietly discards all prior tool results"** (재개 시 도구 결과 조용히 폐기) — 거짓
- **"a correct resume would restore the earlier file contents automatically"** (파일 내용까지 자동 복원) — 거짓
- **"fork_session was required to preserve the file's earlier state"** (파일 상태 보존에 포크 필요) — 거짓
- **"Rerun the original prompt from scratch since a turn limit indicates a flawed approach"** (턴 제한 = 접근 실패이므로 처음부터) — 분석 낭비
- **"Fork the session and set a higher max_turns only on the forked branch"** (포크 후 상한 조정) — 82번에선 불필요한 분기
- **"paste yesterday's terminal scrollback as the first prompt"** (터미널 스크롤백 붙여넣기) — 비효율
- **"manually scroll to find the session in the picker"** (피커에서 수동 검색) — 가장 직접적이지 않음
- **"Rely on the default auto-generated display name"** (자동 생성 이름 사용) — 기억 불가
- **"Note the raw session ID in a spreadsheet"** (세션 ID를 스프레드시트에 기록) — 사람이 읽기 어려움
- **"Keep every session running continuously"** (계속 켜두기) — 비현실적
- **"Pass continue_conversation=True on every request"** (모든 요청에 continue) — 다중 사용자 구분 불가
- **"Set fork_session=True on every request"** (모든 요청 포크) — 사용자별 이어가기 아님
- **"Rely on the session picker for a backend service"** (백엔드가 피커 사용) — 비대화형에서 불가
- **"Pass the session ID to resume in the next container and expect the transcript to be found"** (새 컨테이너에서 트랜스크립트 발견 기대) — 디스크 없음
- **"Rely on claude --continue in the next container"** (새 컨테이너에서 --continue) — 로컬 세션 없음
- **"Resume and trust its cached understanding since resumption restores full context"** (캐시된 이해 신뢰) — stale 데이터
- **"Fork the prior session and continue from its unmodified stale history"** (오래된 히스토리 그대로 포크) — 오염 유지
- **"Resume and issue /clear right after resuming"** (재개 직후 /clear) — 재개 의미 없음

### ⚠️ 67번 vs 86번 — 같은 지문, 정답 충돌 (공식 문서로 검증 완료)

두 문항의 지문과 보기 4개가 **완전히 동일**한데 정답이 서로 다릅니다. 공식 문서 확인 결과 **67번의 답(재개 + 파일이 바뀌었다고 알려 재읽기)이 맞고, 86번의 답(새 세션 + 요약)은 오답**입니다.

**정답**: "Resume the session and explicitly tell the agent the configuration file changed, prompting it to re-read that file"
(세션을 재개하고, 설정 파일이 변경되었음을 명시적으로 알려 재읽기를 유도한다)

**근거 1 — 파일은 매 도구 호출마다 새로 읽습니다** ([Common workflows](https://code.claude.com/docs/en/common-workflows))
> "Claude reads files fresh on each tool call, so it sees edits you make in another application the next time it reads that file."
> (Claude는 매 도구 호출마다 파일을 새로 읽으므로, 다른 앱에서 한 수정도 다음에 그 파일을 읽을 때 반영됩니다.)

즉 "재개하면 옛 캐시가 남아 새 내용과 충돌한다"는 86번의 오답 근거는 **사실이 아닙니다**. 대화 이력에 옛 내용이 남아 있을 뿐, 다시 읽으라고 지시하면 디스크의 최신 내용을 그대로 가져옵니다.

**근거 2 — 재개는 추론 맥락을 온전히 복원합니다** ([Manage sessions](https://code.claude.com/docs/en/sessions))
> "A resumed session restores the conversation along with the state saved in it: Conversation history: the full history, including tool calls and results."
> (재개된 세션은 도구 호출과 결과를 포함한 **전체 이력**을 복원합니다.)

문제가 요구하는 "accumulated reasoning 보존"을 가장 잘 만족하는 것이 재개입니다. 반면 요약본을 새 세션에 넣는 방식은 문서상 **정보 손실을 감수하는 트레이드오프**로 설명됩니다:
> "Resuming from the summary costs less on each later request... but whatever the summary leaves out is no longer in Claude's context."
> (요약으로 재개하면 요청당 비용은 줄지만, 요약이 빠뜨린 것은 더 이상 컨텍스트에 없습니다.)

**근거 3 — 86번이 인용한 "Anthropic Compaction 권장 방식"은 문서에 없습니다**
[Best practices](https://code.claude.com/docs/en/best-practices)가 `/clear`·새 세션을 권하는 경우는 **무관한 작업 전환, 반복된 교정 실패, 컨텍스트 과다** 세 가지뿐이고, "설정 파일이 바뀌면 새 세션을 시작하라"는 권고는 존재하지 않습니다. CLAUDE.md에 대해서도 오히려 **디스크에서 다시 읽어 재주입한다**고 명시합니다 ([Memory](https://code.claude.com/docs/en/memory)):
> "Project-root CLAUDE.md survives compaction: after /compact, Claude re-reads it from disk and re-injects it into the session."

**시험에서의 처리**
- 두 문항 모두 **"재개 + 명시적 재읽기 지시"**를 고르세요.
- 86번은 출제 오류로 보이나, 만약 그 보기가 아예 없는 변형이 나오면 차선은 "새 세션 + 요약"입니다.
- 어느 문항이든 확실한 오답: **"캐시된 이해를 그대로 신뢰"**(재개가 파일까지 최신화해주지 않음), **"재개 직후 /compact"**(압축은 요약일 뿐 파일을 새로 읽지 않음).

---

## 6. 자주 반복되는 중복 문제 (Duplicates — 무료 점수)

같은 문제가 보기 순서만 바꿔 재출제됩니다. 정답 **내용**으로 기억하세요.

| 내용 | 출현 위치 |
|---|---|
| 프로덕션 인시던트 조사 → **dynamic orchestrator** | 16번, 46번 |
| MCP billing 서버 matcher → **`mcp__billing__.*`** | 17번(21-40), 48번 |
| doc-reviewer 읽기 전용 → **tools를 Read/Grep으로 제한** | 43번, 47번 |
| 블로그 outline→prose→proofread → **체크포인트 있는 prompt chain** | 50번, 70번 |
| endpoint-finder 두 번 호출 시 메모리 없음 → **정상 동작 (컨텍스트 격리)** | 45번, 114번 |
| 서브에이전트 중첩 깊이 → **최대 5단계** | 95번, 106번 |
| 40개 파일 PR → **파일별 분석 후 통합 패스** | 20번(21-40), 91번 |
| 다중 의도 티켓 → **분해 후 병렬 조사 → 종합** | 14번, 41번 |
| 설정 파일 재작성 후 재개 → **재개 + 재읽기 지시** | 67번 정답 / 86번은 출제 오류 (5장 참고) |

---

## 7. 최종 점검 5문장

1. **보장이 필요하면 Hook**, 유도만 하면 프롬프트 — "guarantee / never / must"는 곧 훅이다.
2. **미리 알 수 없으면 동적**, 항상 같으면 고정 체인, 서로 독립이면 병렬.
3. **서브에이전트는 아무것도 상속하지 않는다** — 필요한 건 프롬프트에 명시적으로 넣는다.
4. **세션은 대화 기록일 뿐** — 파일도, 다른 머신도, 새 컨테이너도 따라오지 않는다.
5. **temperature·모델 크기·maxTurns·timeout을 올리자는 보기는 거의 항상 오답이다.**
