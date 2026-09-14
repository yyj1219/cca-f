# Agentic Architecture & Orchestration 문제 분석 모음

---

## 1번 문제

**1. 문제 원문**

A team is implementing termination logic for an autonomous refactoring agent. Loop A exits when `response.stop_reason == "end_turn"`. Loop B exits when the assistant's final text block is non-empty, on the assumption that any explanatory text means Claude is finished. Which loop correctly implements the standard termination pattern?

A) Both loops behave identically in practice, since stop_reason and trailing text emptiness always change together on every response

B) Loop B, because a populated final text block is treated as the only reliable indicator that Claude has stopped requesting further tool calls

C) Loop A, because stop_reason directly reports whether Claude finished its turn without requesting a tool, which is the documented signal

D) Neither loop works, because the API only signals completion through the total count of content blocks returned in the response

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Loop A, because stop_reason directly reports whether Claude finished its turn without requesting a tool, which is the documented signal

**정답 및 해설:**

**핵심 개념**: Anthropic Claude API의 에이전틱 루프 종료 패턴 (Agent Loop Termination)

Claude API에서는 모델이 턴을 완료했는지, 아니면 도구 호출(`tool_use`)을 요청하는 중인지를 판별하기 위해 공식적으로 `stop_reason` 필드를 제공합니다. `stop_reason`이 `"end_turn"`인 경우 더 이상 실행할 도구가 없으며 모델이 응답을 마쳤음을 나타냅니다. 반면 도구를 사용할 때는 `stop_reason`이 `"tool_use"`가 됩니다.

**문제 상황 분석:**

* 에이전트 루프 제어 시, Claude가 추가적인 Tool을 호출할지 작업이 완전히 끝났는지를 신뢰성 있게 판단해야 함
* 루프 B는 "텍스트 존재 여부"라는 불확실한 부수 효과(Side Effect)에 의존하여 종료를 판단하려 함
* 루프 A는 API에서 정식 명세로 제공하는 `stop_reason` 값을 활용하여 정확한 턴 종료 상태를 감지함

**C번이 정답인 이유:**
Anthropic Claude API 공식 문서에 따르면, 모델 응답의 완료 신호는 `response.stop_reason` 필드로 제공됩니다. `stop_reason == "end_turn"`은 모델이 도구 요청 없이 자연스럽게 대화 턴을 마쳤음을 의미하므로, 에이전트 루프를 안전하고 올바르게 종료하는 표준 조건입니다.

**오답 분석:**

- Option A (오답): 도구를 호출하는 응답(`tool_use`)에서도 텍스트 설명이 포함될 수 있으므로, `stop_reason`과 텍스트 유무는 함께 움직이지 않습니다.

- Option B (오답): 텍스트 블록의 존재는 도구 호출 중에도 발생할 수 있으므로 신뢰할 수 있는 종료 지표가 아닙니다.

- Option D (오답): API는 콘텐츠 블록의 총 개수가 아닌 `stop_reason` 필드를 통해 완료 상태를 전달합니다.

---

## 2번 문제

**1. 문제 원문**

A coordinator needs to run "style-checker," "security-scanner," and "test-coverage" subagents against the same pull request, and the team wants all three to run concurrently rather than one after another. The coordinator currently emits one Task call, waits for the result, then emits the next Task call in a following turn. What change achieves true parallel execution?

A) Emit all three Task calls for the checker, scanner, and coverage subagents within one coordinator response instead of spreading them across separate turns

B) Merge style-checker, security-scanner, and test-coverage into a single AgentDefinition so that one Task call now covers all three concerns at once

C) Set persistSession to false on each subagent call so none of them block on writing a transcript to disk before the next one in line can start

D) Increase maxTurns on each of the three subagent definitions so they can each finish faster and thereby appear to overlap more in wall-clock time

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Emit all three Task calls for the checker, scanner, and coverage subagents within one coordinator response instead of spreading them across separate turns

**정답 및 해설:**

**핵심 개념**: 멀티 에이전트 시스템의 병렬 도구 호출 (Parallel Tool Calling)

Claude 및 관련 에이전트 프레임워크(Claude Code SDK 등)에서는 단일 모델 응답(Turn) 내에서 여러 개의 도구 호출(Tool/Task Call)을 동시에 발행할 수 있습니다. 런타임 환경은 단일 응답에 포함된 독립적인 작업 요청들을 병렬로 처리한 뒤, 모든 결과를 취합하여 다음 턴에 모델로 전달하는 패턴을 사용합니다.

**문제 상황 분석:**

* 코디네이터 에이전트가 3개의 독립된 서브에이전트 작업을 순차적으로 실행하고 있음
* 현재 방식은 턴 1(Task 1 요청) -> 대기 및 결과 수신 -> 턴 2(Task 2 요청) 형태의 직렬 처리 구조임
* 세 개 작업의 독립성을 유지하면서 동시성(Parallel Execution)을 달성할 수 있는 프레임워크 제어 방식이 필요함

**A번이 정답인 이유:**
단일 코디네이터 응답(Response/Turn) 내에서 3개 서브에이전트에 대한 Task 호출을 한 번에 배출(Emit)하면, 에이전트 오케스트레이터 및 런타임 환경이 이 요청들을 감지하고 병렬로 동시 실행합니다. 각 턴마다 하나씩 나누어 발행하던 것을 한 턴의 응답에 모두 담는 것이 병렬 실행을 가능하게 하는 올바른 접근법입니다.

**오답 분석:**

- Option B (오답): 세 개의 서로 다른 관심사 및 에이전트를 하나로 통합하는 것은 서브에이전트 분리 설계의 이점(단일 책임, 모듈화)을 훼손하며, 동시성이 아닌 단일 직렬 작업으로 변경하는 것에 불과합니다.

- Option C (오답): `persistSession` 속성은 세션 저장 여부에 관한 설정일 뿐, 턴 기반의 직렬 호출 흐름을 병렬 호출 흐름으로 전환해 주지 않습니다.

- Option D (오답): `maxTurns` 상한을 높이는 것은 각 서브에이전트가 수행할 수 있는 최대 대화 턴 수를 늘릴 뿐, 코디네이터의 직렬 호출 방식을 병렬 구조로 바꾸지 못합니다.

---

## 3번 문제

**1. 문제 원문**

A CI worker runs `claude --resume <session-id>` to continue a session that was created and last active on a different ephemeral build machine. The resume call returns a brand-new session with none of the prior history instead of the expected conversation. What is the most likely root cause?

A) CI workers are restricted from resuming any session that was started interactively via the CLI

B) The session name was too long for the resume lookup to match it against the stored transcript index

C) The session's transcript file only exists on the original machine and was never copied to the new worker

D) The session ID was generated with fork_session enabled, which prevents cross-machine resumption entirely

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: The session's transcript file only exists on the original machine and was never copied to the new worker

**정답 및 해설:**

**핵심 개념**: Claude Code CLI 세션 상태 유지 및 트랜스크립트 관리 (Session Transcripts & Persistence)

Claude Code CLI 및 에이전트 환경에서 대화 세션 기록(Transcript/History)은 중앙 서버가 아닌 **로컬 디스크 파일 시스템**(`~/.claude/` 또는 작업 디렉터리 내 세션 데이터)에 저장됩니다. `--resume` 옵션은 인수로 전달된 세션 ID에 해당하는 로컬 트랜스크립트 파일/기록을 읽어와 대화를 재개합니다.

**문제 상황 분석:**

* 세션이 다른 일회성(ephemeral) 빌드 머신에서 생성되고 마지막으로 실행됨
* 세션 트랜스크립트 파일이 이전 머신의 로컬 디스크에만 남아 있고, 새로 생성된 CI 워커 머신으로 전달/복사되지 않음
* CLI가 해당 세션 ID의 대화 기록 파일을 찾지 못해 이전 기록을 로드하지 못하고 새로운 세션을 생성함

**C번이 정답인 이유:**
일회성 빌드 인프라(Ephemeral Build Machine)에서는 컨테이너나 가상 머신이 종료되면 해당 환경의 디스크 데이터가 함께 삭제되거나 분리됩니다. Claude CLI의 세션 대화 기록(Transcript)은 로컬 파일 기반으로 저장되므로, 다른 머신에서 동일한 세션을 재개하려면 원본 머신의 세션 트랜스크립트 파일이나 상태 아티팩트를 새 워커 환경으로 미리 복사/공유해 두어야 합니다. 이 과정이 누락되어 파일이 존재하지 않는 것이 원인입니다.

**오답 분석:**

- Option A (오답): CI 환경이라고 해서 CLI를 통해 대화형으로 시작된 세션의 재개를 인위적으로 금지하거나 제한하는 정책은 존재하지 않습니다.

- Option B (오답): 세션 조회 실패는 이름 길이 제약 때문이 아니라 트랜스크립트 파일의 부재 때문입니다.

- Option D (오답): `fork_session` 설정은 기존 세션을 복제하여 새 분기 세션을 만드는 기능에 관한 것으로, 머신 간 세션 이전을 원천 차단하는 기능이 아닙니다.

---

## 4번 문제

**1. 문제 원문**

A team wants several Claude Code agents to message each other directly and coordinate on a shared set of tasks over an extended session, rather than one agent invoking others as one-shot subtasks and receiving only a final summary back. Which pattern fits this requirement better than standard coordinator subagents?

A) Agent teams, which support inter-agent messaging and centralized management of multiple coordinating sessions

B) Filesystem-based subagents stored in .claude/agents, since only these support persistent shared state fully

C) Standard subagents with the Agent tool disabled, so they cannot spawn any further nested subagents at all

D) A single subagent configured with a longer maxTurns value so it can simulate multiple separate participants at once

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Agent teams, which support inter-agent messaging and centralized management of multiple coordinating sessions

**정답 및 해설:**

**핵심 개념**: 에이전트 팀 (Agent Teams / Multi-Agent Collaboration)

Claude Code 에이전트 아키텍처에서 **표준 코디네이터-서브에이전트(Coordinator-Subagent)** 패턴은 상위 에이전트가 하위 작업 에이전트를 일회성(One-shot)으로 호출하고 최종 결과 요약만 돌려받는 수직적 구조입니다. 반면 **Agent Teams** 패턴은 여러 에이전트들이 **피어-투-피어(P2P) 형태**로 서로 직접 메시지를 주고받으며 장기 세션 동안 지속적으로 협력할 수 있는 동적·상호작용 구조를 제공합니다.

**문제 상황 분석:**

* 일회성 호출 및 단방향 최종 요약 반환 방식의 표준 코디네이터 모델로는 한계가 있음
* 여러 에이전트 간의 직접적인 동시 메시징(Inter-agent messaging)이 필요함
* 지속적인 세션 동안 공유 작업에 대해 상호 조율 및 지속적 협업이 이루어져야 함

**A번이 정답인 이유:**
`Agent teams` 구조는 에이전트 간 직접 통신(Inter-agent messaging)을 지원하여 단방향 일회성 호출이 아닌 양방향 상호작용 및 협업 세션을 관리할 수 있도록 설계된 패턴입니다. 따라서 문제에서 제시한 요구사항에 정확히 부합합니다.

**오답 분석:**

- Option B (오답): `.claude/agents` 파일시스템 저장은 서브에이전트의 정의(Prompt, Tool 등)를 지속적으로 관리하는 방식일 뿐, 에이전트 간 실시간 동적 메시지 교환 기능을 제공하는 것이 아닙니다.

- Option C (오답): Agent 도구를 비활성화하는 것은 에이전트가 다른 하위 에이전트를 생성하지 못하도록 차단하는 제약 설정일 뿐, 에이전트 간 협업 통신 기능을 활성화해 주지 않습니다.

- Option D (오답): 단일 에이전트의 `maxTurns`를 늘리는 것은 하나의 에이전트가 수행 가능한 최대 턴 수만 확장할 뿐이며, 여러 독립적인 에이전트 간 직접 메시징 환경을 구성하는 솔루션이 아닙니다.

---

## 5번 문제

**1. 문제 원문**

While implementing an agent loop, an engineer is unsure where a tool_result block belongs once a tool finishes executing. Which placement correctly continues the conversation so Claude can incorporate the result into its next round of reasoning?

A) Insert the tool_result directly inside that same assistant-role message that originally contained the matching tool_use block, replacing it fully

B) Attach the tool_result as metadata on the HTTP request headers rather than as part of the messages array sent to the API

C) Add the tool_result as content inside a new user-role message appended after the assistant message that contained the matching tool_use block

D) Store the tool_result in a separate system-role message positioned before the original user prompt at the start of history

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Add the tool_result as content inside a new user-role message appended after the assistant message that contained the matching tool_use block

**정답 및 해설:**

**핵심 개념**: Claude Messages API의 Tool Use 및 Tool Result 메시지 구조

Claude Messages API에서 도구(Tool)를 활용하는 대화 흐름은 `user` ➔ `assistant` (`tool_use` 요청) ➔ `user` (`tool_result` 반환) ➔ `assistant` (다음 추론/응답) 형태의 턴 교대를 엄격하게 따릅니다. 클라이언트는 도구 실행 결과를 반드시 `role: "user"` 메시지의 `content` 배열 내 `tool_result` 블록으로 전달해야 합니다.

**문제 상황 분석:**

* 에이전트 루프에서 모델의 `tool_use` 요청을 받아 로컬/외부 도구 실행을 완료함
* 실행 결과(`tool_result`)를 API 요청 대화 기록(`messages`) 중 어디에 배치해야 하는지 정확한 스펙 확인이 필요함
* 모델이 이전 추론 맥락과 실행 결과를 연계하여 다음 추론을 지속할 수 있도록 올바른 페이로드 구조를 구성해야 함

**C번이 정답인 이유:**
Anthropic Claude API 공식 스펙에 따르면, 어시스턴트 메시지(`role: "assistant"`)가 `tool_use` 블록을 포함하여 도구 실행을 요청하면, 클라이언트는 도구를 수행한 후 그 결과를 담은 `tool_result` 블록을 **해당 `assistant` 메시지 바로 뒤에 추가되는 새로운 `role: "user"` 메시지의 `content` 요소**로 전달해야 합니다. 이를 통해 Claude는 사용자/외부 환경으로부터 실행 결과를 되돌려받은 것으로 인식하고 다음 단계의 추론 및 응답을 계속할 수 있습니다.

**오답 분석:**

- Option A (오답): `tool_result`는 `assistant` 메시지를 대체하거나 내부에 포함하는 것이 아니라, 대화 흐름상 턴을 전환하여 새로운 `user` 메시지로 전송해야 합니다.

- Option B (오답): 도구 실행 결과 데이터는 HTTP 요청 헤더가 아닌 API 요청 본문의 `messages` 배열 내에 포함되어야 합니다.

- Option D (오답): `tool_result`는 대화 기록의 맨 처음 `system` 메시지에 배치하는 것이 아니라, 대응되는 `tool_use`를 호출했던 `assistant` 메시지 직후의 `user` 메시지 위치에 배치해야 합니다.

---

## 6번 문제

**1. 문제 원문**

A finance-operations agent uses a process_payment MCP tool. An architect wants to normalize the `amount` field, which some upstream integrations send as a string like "$1,250.00" and others send as a float like 1250.0, into a single float type, and then enforce a compliance threshold on the normalized value before the tool call proceeds. Which design best achieves this, according to Anthropic's hook system behavior?

A) Implement a single PreToolUse hook that normalizes the amount to a float and then checks the threshold, returning an updatedInput with the normalized value if allowed, or denying the call otherwise.

B) Perform both normalization and threshold checking in a single PostToolUse hook, using the tool's output to derive the normalized amount and then compare against the threshold.

C) Use a PreToolUse hook for normalization to convert the amount and update the input, then a PostToolUse hook for threshold enforcement to verify the converted amount after the tool executes.

D) Register two PreToolUse hooks in any order, as updatedInput automatically propagates between PreToolUse hooks so the normalization hook's changes are always visible to the threshold-enforcement hook.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Implement a single PreToolUse hook that normalizes the amount to a float and then checks the threshold, returning an updatedInput with the normalized value if allowed, or denying the call otherwise.

**정답 및 해설:**

**핵심 개념**: Anthropic Claude Agent SDK의 Tool Hook 패턴 (`PreToolUse` Hook)

`PreToolUse` 훅은 도구가 실제 실행되기 직전에 호출 인자를 검증, 수정, 또는 실행 자체를 차단(Deny)하기 위해 사용됩니다. 하나의 `PreToolUse` 훅 핸들러 내에서 입력 데이터 정규화(Normalization)와 조건 검증(Threshold Enforcement)을 순차적으로 수행하고, 성공 시 정규화된 입력값(`updatedInput`)을 전달하거나 조건 불만족 시 실행을 거부하는 방식이 가장 안전하고 단정적인(Deterministic) 설계입니다.

**문제 상황 분석:**

* 상류 데이터에 의해 `amount` 필드 포맷이 문자열/실수 혼재되어 들어옴
* 도구 실행 전에 정규화(float 변환)와 컴플라이언스 기준(임계값 검사)을 모두 통과해야 함
* 조건 미달 시 도구 실행이 일어나는 것을 미연에 차단(Block/Deny)해야 함

**A번이 정답인 이유:**
도구가 실행되기 전(`before the tool call proceeds`)에 입력 데이터를 변환하고 검증까지 완료해야 하므로 `PreToolUse` 훅이 필요합니다. 단일 `PreToolUse` 훅 내부에서 정규화를 거친 후 그 값을 바탕으로 임계값을 체크하면, 정규화된 값의 참조 보장은 물론 통과 시 `updatedInput`을 반환하고 불통 시 즉시 호출을 거부(Deny)하는 로직을 가장 신뢰성 있게 구현할 수 있습니다.

**오답 분석:**

- Option B (오답): `PostToolUse` 훅은 도구가 이미 실행을 마친 후에 호출되므로, 도구 실행 전 입력 검증 및 차단이라는 목적에 맞지 않습니다.

- Option C (오답): 임계값 검증을 도구가 실행된 후(`PostToolUse`)에 진행하면 기준에 미달하는 유효하지 않은 결제 요청이 이미 처리되어 버립니다.

- Option D (오답): 두 개의 별도 `PreToolUse` 훅을 순서 상관없이 등록할 경우, 훅 간의 실행 순서 보장 및 `updatedInput` 전파 시점에 의존성이 생겨 임계값 검사 훅이 정규화되지 않은 포맷을 전달받을 위험이 있습니다.

---

## 7번 문제

**1. 문제 원문**

An architect is deciding between two enforcement strategies for a compliance rule that blocks database deletions outside business hours: a PreToolUse hook that checks the current time and denies the call, versus a system prompt clause instructing the agent to avoid deletions outside business hours. Which statement correctly characterizes the tradeoff?

A) The prompt clause enforces the rule deterministically because Claude always follows explicit system prompt instructions verbatim once they are stated clearly enough, ensuring any outside-hours deletion is blocked.

B) Both approaches are functionally equivalent because the Agent SDK's runtime translates system prompt rules into tool-use permission checks, so the deletion is always prevented regardless of enforcement method.

C) The hook deterministically enforces the rule on every matching tool call regardless of output, while the prompt clause only influences the likelihood that a compliant call is generated.

D) The hook only affects what the user sees in the transcript, so the underlying tool call still executes even when the hook returns a deny decision, meaning the database record is deleted despite the compliance rule.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: The hook deterministically enforces the rule on every matching tool call regardless of output, while the prompt clause only influences the likelihood that a compliant call is generated.

**정답 및 해설:**

**핵심 개념**: 결정론적 제어(Deterministic Guardrails) vs 확률적 제어(Probabilistic Prompting)

에이전틱 시스템에서 컴플라이언스 및 보안 정책을 강제할 때, 시스템 프롬프트(Prompt)는 모델의 생성 확률을 제어하는 **확률적(_Probabilistic_)** 접근법이며, PreToolUse 훅(Hook)은 코드 런타임 수준에서 실행 여부를 하드 차단하는 **결정론적(_Deterministic_)** 접근법입니다.

**문제 상황 분석:**

* 업무 시간 외 데이터베이스 삭제를 금지하는 엄격한 컴플라이언스 규칙 적용 필요
* 프롬프트에 지침을 추가하는 방식과 `PreToolUse` 훅을 작성하는 방식의 제어 특성을 비교
* 보안 및 규정 준수 관점에서 두 방식 간의 상충 관계(Tradeoff)와 메커니즘 차이를 정확히 파악해야 함

**C번이 정답인 이유:**
`PreToolUse` 훅은 모델이 생성한 `tool_use` 요청이 실제 실행되기 전에 프로그래밍 방식으로 조건(현재 시간)을 검사하고, 미달 시 `deny`를 반환하여 100% 확실하게(Deterministically) 도구 실행을 막습니다. 반면 프롬프트에 규칙을 적는 것은 LLM의 행동 확률을 조절할 뿐이므로, 환각이나 지시 미이행으로 인해 여전히 위반 호출이 발생할 가능성이 남게 됩니다.

**오답 분석:**

- Option A (오답): 프롬프트 지시사항은 확률적으로 동작하므로 결정론적(Deterministic)으로 동작한다는 설명은 틀렸습니다.

- Option B (오답): SDK 런타임이 자연어로 된 시스템 프롬프트 규칙을 자동으로 도구 권한 검사 코드로 변환해 주지 않으므로 두 방식은 기능적으로 전혀 다릅니다.

- Option D (오답): `PreToolUse` 훅이 `deny`를 반환하면 실제 도구의 실행 자체가 차단되므로 데이터베이스 레코드가 삭제된다는 설명은 틀렸습니다.

---

## 8번 문제

**1. 문제 원문**

A coordinator runs a "web-search" subagent and a "document-analysis" subagent, both of which return findings that must later be cited with their original sources when a "synthesis" subagent writes the final report. Reviewers keep finding that the final report attributes a claim to the wrong source URL or page number. What is the best way to pass the prior agents' findings into the synthesis subagent's prompt to prevent this?

A) Pass only a short summary of each prior agent's findings and let synthesis re-fetch every original source itself to confirm the exact URL and page number for each claim

B) Pass the findings exactly as free-form conversational text copied from the subagents' chat-style replies, since exact wording matters more than structure for citation accuracy

C) Pass the findings as structured entries that separate content from metadata, such as source URL, document name, and page number, so synthesis preserves correct attribution

D) Pass the findings as one continuous block of prose combining every source's text together, trusting synthesis to keep the origin of each sentence straight from context

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Pass the findings as structured entries that separate content from metadata, such as source URL, document name, and page number, so synthesis preserves correct attribution

**정답 및 해설:**



**핵심 개념**: 멀티 에이전트 컨텍스트 전달 및 구조화 데이터(Structured Data Separation)

멀티 에이전트 시스템에서 하위 에이전트가 수집한 정보를 상위/후속 에이전트에게 전달할 때, 비구조화된 비격식 텍스트(Free-form text)로 전달하면 모델이 출처 메타데이터(URL, 페이지 번호 등)와 실제 본문 내용을 혼동하여 잘못 인용하는 환각(Hallucination)이 발생하기 쉽습니다. 따라서 콘텐츠 본문과 메타데이터를 분리한 구조화된 형식(JSON, Key-Value, Markdown 스키마 등)으로 프롬프트에 제공하는 것이 정보의 출처 귀속(Attribution) 정확도를 극대화하는 표준 패턴입니다.

**문제 상황 분석:**

* 웹 검색 및 문서 분석 서브에이전트가 가져온 결과로 종합 보고서를 작성하는 과정임
* 최종 보고서에서 출처 URL이나 페이지 번호가 잘못 매칭되는 문제가 지속해서 발생함
* 정보의 손실이나 환각 없이 출처 메타데이터와 내용을 확실히 연결하여 후속 에이전트에 전달하는 프롬프트 구성 방식이 필요함

**C번이 정답인 이유:**
내용(Content)과 메타데이터(Source URL, Document Name, Page Number 등)를 명확히 분리하여 구조화된 엔트리 형태로 전달하면, LLM이 문장을 종합할 때 해당 문장의 출처 정보(메타데이터)를 정확히 추적할 수 있습니다. 이는 모델이 컨텍스트 파싱 중 출처를 오인하거나 모호하게 다루는 위험을 근본적으로 제거해 줍니다.

**오답 분석:**

- Option A (오답): 이미 이전 에이전트가 조사한 원본 데이터를 다시 Re-fetch(재조회)하게 만드는 것은 비효율적이며 redundant한 API/도구 호출 비용과 시간을 발생시킵니다.

- Option B (오답): 자유 형태의 대화형 텍스트는 메타데이터와 정보 내용이 섞여 있어, 정확한 출처 표기를 보장하기에는 오히려 구조화된 데이터보다 취약합니다.

- Option D (오답): 모든 텍스트를 하나의 연속된 산문 블록으로 합치는 것은 출처의 경계를 모호하게 만들어 환각 및 출처 오귀속(Wrong Attribution) 문제를 더욱 악화시킵니다.

---

## 9번 문제

**1. 문제 원문**

A coordinator spawns two subagents in parallel to investigate the billing and address concerns from a multi-concern ticket. Before writing the final customer response, the coordinator needs to know that both subagents have actually finished and to collect what each one found. Which hook is designed for this?

A) SubagentStop, which fires on subagent completion and lets the coordinator log or aggregate each subagent's results as they finish

B) Notification, which fires only for permission prompts and cannot carry any information about a subagent's investigation results

C) PreToolUse, which fires before a subagent starts and can preview the result the subagent will eventually produce

D) UserPromptSubmit, which fires when the customer's original ticket text is submitted and carries both subagents' final findings

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: SubagentStop, which fires on subagent completion and lets the coordinator log or aggregate each subagent's results as they finish

**정답 및 해설:**

**핵심 개념**: Claude Agent SDK 이벤트 훅 (`SubagentStop` Hook)

Claude Agent SDK 생태계에서 서브에이전트(Subagent)의 라이프사이클을 추적하기 위해 다양한 라이프사이클 훅이 제공됩니다. 그중  `SubagentStop` 훅 은 **하위 서브에이전트가 자신의 작업을 완전히 종료하고 턴을 마치는 시점에 트리거**되어, 실행 결과나 반환 데이터를 상위 코디네이터 또는 수집기에 집계(Aggregate)하거나 로깅할 수 있도록 설계된 전용 훅입니다.

**문제 상황 분석:**

* 코디네이터가 여러 이슈를 처리하기 위해 2개의 서브에이전트를 병렬로 실행함
* 코디네이터가 최종 응답을 작성하기 전, 각 서브에이전트의 작업 완료 상태를 확인하고 조사 결과를 수집해야 함
* 서브에이전트 작업 종료 이벤트와 연동하여 결과를 취합하는 데 적합한 라이프사이클 훅을 찾아야 함

**A번이 정답인 이유:**
`SubagentStop` 훅은 말 그대로 서브에이전트의 실행이 완료되는 시점에 정확히 호출됩니다. 이를 통해 각 서브에이전트가 조사를 마쳤는지 여부를 감지할 수 있으며, 이들이 생성한 최종 출력 결과를 로깅하거나 모아서 코디네이터의 종합 응답 작성 단계로 전달할 수 있습니다.

**오답 분석:**

- Option B (오답): `Notification` 훅은 **사용자 승인 요청 등 단순 알림 이벤트**에 대응할 뿐, 서브에이전트의 수행 결과 데이터를 처리하지 않습니다.

- Option C (오답): `PreToolUse` 훅은 도구나 서브에이전트 실행 직전에 호출되는 훅이므로, 실행이 끝나야 나오는 결과를 미래 예측하여 가져올 수 없습니다.

- Option D (오답): `UserPromptSubmit` 훅은 **최초 프롬프트 제출 시점에 트리거**되는 훅이므로, 이후 진행되는 서브에이전트의 최종 결과를 미리 가지고 있을 수 없습니다.

---

## 10번 문제

**1. 문제 원문**

An architect resumed a session this morning expecting yesterday's investigation, but the agent behaved as if starting completely fresh with no memory of prior findings. The team confirms the correct session ID was passed. What should the architect check first?

A) Whether the prompt text used to resume matched the original prompt text exactly

B) Whether the original session had exceeded its maximum turn or budget limit before ending

C) Whether the resume call ran from the same working directory the original session was started in

D) Whether the teammate who ran the original session had sufficient tool permissions granted

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Whether the resume call ran from the same working directory the original session was started in

**정답 및 해설:**

**핵심 개념**: Claude Code CLI 세션 저장 및 작업 디렉터리 바인딩 (Session Persistence & Working Directory Context)

Claude Code CLI에서 **대화 세션 기록(Transcript 및 History)은 프로젝트/작업 디렉터리별 범위(Scope)에 격리되어 저장**되거나 상과 관계를 가집니다. 정확한 Session ID를 전달하더라도 CLI 명령을 실행하는 현재 작업 디렉터리(Working Directory)가 원래 세션을 시작했던 디렉터리와 다르면 해당 경로의 세션 기록을 찾아올 수 없거나 빈 세션으로 인식됩니다.

**문제 상황 분석:**

* 올바른 Session ID를 전달했음에도 불구하고 이전 기억 없이 완전히 새로 시작하는 현상이 발생함
* Session ID의 오탈자 문제가 아닌 환경/실행 경로 맥락의 문제임
* 세션 인덱스 및 대화 트랜스크립트 파일이 저장되고 바인딩되는 기준 경로(Working Directory) 확인이 최우선임

**C번이 정답인 이유:**
Claude CLI는 실행된 작업 디렉터리를 기반으로 프로젝트 컨텍스트와 세션 내역을 관리합니다. 다른 디렉터리 경로에서 동일한 세션 ID로 `--resume`을 실행하면 해당 디렉터리 기준의 세션 스토리지에서 기록을 찾지 못하여 새로운 빈 세션이 생성되므로, 가장 먼저 **원래 세션이 시작되었던 동일한 작업 디렉터리**에서 명령어를 실행했는지 확인해야 합니다.

**오답 분석:**


- Option A (오답): 세션 재개시 프롬프트 텍스트가 원래와 동일할 필요는 없으며, 새로운 지시어를 전달하더라도 이전 세션의 대화 내역은 그대로 유지되어야 합니다.

- Option B (오답): 최대 턴 수나 예산 한도가 초과되어 종료되었더라도 이전 대화 트랜스크립트 자체는 남아 있으므로, 아예 기억이 없는 빈 세션으로 시작되지는 않습니다.

- Option D (오답): 도구 실행 권한 여부는 세션 대화 기록의 저장 및 재개(Resume) 동작에 직접적인 영향을 주지 않습니다.

---

## 11번 문제

**1. 문제 원문**

An architect reviews a multi-agent research assistant and finds that each subagent independently implements its own retry logic, logging format, and rate-limit backoff, leading to inconsistent behavior across the system. Which change best aligns this design with the hub-and-spoke coordinator pattern's intended benefits?

A) Remove logging and retry logic from subagents entirely, since coordinator-based systems should never retry failed subtasks

B) Centralize error handling, logging, and retry policy in the coordinator so all subagent communication stays consistent

C) Standardize the retry logic across subagents by copying the identical code into each subagent's own system prompt

D) Assign one subagent the role of monitoring the others' retries and logs so the coordinator need not track failures

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Centralize error handling, logging, and retry policy in the coordinator so all subagent communication stays consistent

**정답 및 해설:**

**핵심 개념**: 허브 앤 스포크 코디네이터 패턴 (Hub-and-Spoke Coordinator Pattern)

허브 앤 스포크 패턴에서 코디네이터(Hub)는 시스템의 중앙 제어부 역할을 담당하며, 여러 서브에이전트(Spokes)의 작업을 오케스트레이션합니다. ** 공통적인 관심사인 로깅, 에러 처리, 재시도(Retry) 정책, 백오프(Backoff) 등을 중앙 코디네이터로 집중(Centralize) ** 하면 일관된 통신 규칙과 단일 책임 원칙을 유지할 수 있으며, 서브에이전트 코드가 파편화되는 것을 방지합니다.

**문제 상황 분석:**

* 각 서브에이전트가 로깅, 재시도, 속도 제한 백오프 로직을 각각 파편화되어 독립적으로 구현함
* 시스템 전체적으로 일관성 없는(Inconsistent) 동작과 통신 메시지 구조가 발생함
* 허브 앤 스포크 코디네이터 아키텍처의 취지에 맞는 중앙 집중형 개선 방법이 필요함

**B번이 정답인 이유:**
에러 처리, 로깅, 재시도 정책을 중앙의 코디네이터(Hub)로 모아 중앙 집중화(Centralize)하면, 모든 서브에이전트와의 통신 및 예외 처리가 일관된 기준에 따라 관리됩니다. 이를 통해 시스템 유지보수성이 크게 향상되고 파편화된 동작을 완벽히 해결할 수 있습니다.

**오답 분석:**

- Option A (오답): 실패한 하위 작업을 코디네이터 패턴에서 재시도하지 않아야 한다는 제약은 없으며, 로깅을 완전히 제거하는 것은 모니터링을 불가능하게 만듭니다.

- Option C (오답): 프롬프트에 동일한 코드를 중복 복사하는 것은 코드 파편화 문제를 해결하지 못하며, 프롬프트 용량 낭비 및 관리 복잡성을 증대시킵니다.

- Option D (오답): 다른 서브에이전트들을 모니터링하는 별도의 서브에이전트를 두는 것은 코디네이터의 오케스트레이션 책임을 왜곡하고 불필요한 계층을 추가하게 됩니다.

---

## 12번 문제

**1. 문제 원문**

During an interactive session investigating a caching bug, the architect wants to explore an alternate hypothesis without losing the current line of reasoning, and wants to keep working in the terminal rather than scripting against the SDK. Which in-session action creates a divergent copy of the conversation while leaving the current one intact?

A) Run /resume and select the same session again from the picker to duplicate it in place

B) Run /clear to empty context and begin reasoning about the alternate hypothesis immediately

C) Run /compact to replace the history with a summary focused on the alternate hypothesis

D) Run /fork with an optional name to switch into a copy of the conversation so far

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Run /fork with an optional name to switch into a copy of the conversation so far

**정답 및 해설:**

**핵심 개념**: Claude Code CLI 슬래시 명령어 (`/fork` Command)

Claude Code 대화형 CLI 세션에서는 현재 진행 중인 대화 컨텍스트와 흐름을 손상시키지 않고 다른 탐색 경로로 분기할 수 있는 슬래시 명령어인 `/fork`를 제공합니다. `/fork [name]`을 실행하면 지금까지 쌓인 대화 트랜스크립트 상태를 그대로 복사하여 새로운 세션(분기)을 생성하고, 사용자는 원본 세션을 안전하게 보존한 채 새 분기 세션에서 탐색을 이어갈 수 있습니다.

**문제 상황 분석:**

* 터미널 내 대화형 세션에서 버그 조사를 진행 중임
* 현재까지의 추론 맥락을 잃지 않으면서 새로운 대안 가설을 검증해 보고 싶어 함
* SDK 스크립팅 없이 대화형 명령어(In-session action)만으로 기존 세션을 보존한 채 복사본(Divergent copy)을 만들어 전환해야 함

**D번이 정답인 이유:**
`/fork` 슬래시 명령어는 현재 대화 상태의 독립된 복사본을 만들어 해당 복사본 세션으로 즉시 전환해 주는 표준 CLI 기능입니다. 기존 대화 기록은 원본 세션에 그대로 보존(Intact)되므로, 사용자는 언제든지 원본을 해치지 않고 대안 가설을 시험해 볼 수 있습니다.

**오답 분석:**

- Option A (오답): `/resume`은 이전에 저장된 기존 세션을 다시 로드하거나 선택하는 명령어일 뿐, 현재 세션을 그 자리에서 복제(Duplicate in place)해 분기해 주지 않습니다.

- Option B (오답): `/clear`는 지금까지의 대화 컨텍스트를 완전히 지우고 초기화하는 명령어이므로 이전의 추론 흐름을 잃어버리게 됩니다.

- Option C (오답): `/compact`는 현재 대화 기록을 압축하여 토큰을 절약하는 명령어로, 대안 가설을 위한 별도의 대화 복사본을 분기 생성하지 않습니다.

---

## 13번 문제

**1. 문제 원문**

A customer onboarding workflow always performs three steps for every new account in the same order: create the account record, provision default permissions, and send a welcome email. None of these steps ever branch based on account data. Separately, a fraud investigation workflow examines a flagged account by pulling transaction history, and the specific records to inspect next depend entirely on what suspicious patterns are found in the transactions already reviewed. Which pairing of decomposition strategies correctly matches each workflow?

A) Onboarding should use adaptive decomposition since account creation always carries some risk of failure, while fraud investigation should use a fixed three-step chain

B) Onboarding should use a fixed prompt chain since its steps never branch, while fraud investigation should use adaptive decomposition based on findings

C) Both workflows should use a fixed prompt chain, since any workflow involving financial data must follow one strictly predetermined sequence of steps

D) Both workflows should use a dynamic orchestrator, since dynamic decomposition is always the safer default no matter how predictable a workflow's steps are

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Onboarding should use a fixed prompt chain since its steps never branch, while fraud investigation should use adaptive decomposition based on findings

**정답 및 해설:**

**핵심 개념**: 프롬프트 체이닝(Prompt Chaining) vs 적응형/동적 작업 분해(Adaptive/Dynamic Decomposition)

* **고정 프롬프트 체인 (Fixed Prompt Chain)**: **실행 순서가 정해져 있고 조건부 분기가 없는 예측 가능한 작업 시퀀스**에 적합합니다.
* **적응형 분해 (Adaptive/Dynamic Decomposition)**: 이전 단계의 실행 결과나 환경 데이터에 따라 **이후에 수행할 작업 단계가 동적으로 결정**되는 복잡한 워크플로우에 적합합니다.

**문제 상황 분석:**

* 고객 온보딩 워크플로우: 조건 분기 없이 동일한 3개 단계가 고정된 순서로 실행되는 완전 정적 프로세스임
* 사기 조사 워크플로우: 이전 거래 분석 결과(의심 패턴)에 따라 다음 검사 대상 레코드가 달라지는 동적/조건부 프로세스임
* 각 워크플로우의 제어 흐름 특성에 가장 적합한 작업 분해(Decomposition) 전략을 매칭해야 함

**B번이 정답인 이유:**
온보딩 프로세스는 분기가 전혀 없는 선형 구조이므로 예측 가능하고 경량화된 고정 프롬프트 체인(Fixed prompt chain)을 사용하는 것이 최선입니다. 반면 사기 조사 프로세스는 검토 결과에 따라 다음 조치가 동적으로 달라지는 탐색적 구조이므로 적응형 분해(Adaptive decomposition)를 사용하는 것이 적합합니다.

**오답 분석:**

- Option A (오답): 정적 온보딩에 적응형 분해를 적용하고 동적 사기 조사에 고정 체인을 적용하여 두 전략이 반대로 설명되었습니다.

- Option C (오답): 사기 조사 워크플로우는 상황에 따른 가변적 탐색이 필요하므로 고정된 순서만을 따라서는 올바른 조사를 수행할 수 없습니다.

- Option D (오답): 오버헤드가 발생하고 예측 가능한 작업에는 불필요한 동적 오케스트레이터를 모든 워크플로우의 기본값으로 사용하는 것은 잘못된 설계 접근법입니다.

---

## 14번 문제

**1. 문제 원문**

A customer's message covers three distinct concerns: a late shipment, a coupon that failed to apply, and a request to close their account. The agent has separate tools for shipment tracking, coupon validation, and account closure. The architect wants the fastest accurate resolution while keeping the final reply coherent. What ordering of steps best achieves this?

A) Split the message into the three concerns, investigate shipment tracking, coupon validation, and account status concurrently, then combine the findings into one synthesized reply

B) Ask the customer to restate their single message as three separate, single-concern tickets before any investigation ever begins on any of the three items

C) Investigate only the account-closure request first, since closing the account would make the shipment and coupon concerns moot and therefore not worth investigating at all

D) Investigate the shipment concern to full resolution and reply to the customer about it alone, then wait for a follow-up message before ever considering the coupon or account-closure concerns

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Split the message into the three concerns, investigate shipment tracking, coupon validation, and account status concurrently, then combine the findings into one synthesized reply

**정답 및 해설:**

**핵심 개념**: 동시성/병렬 에이전틱 팬아웃-팬인 패턴 (Parallel Fan-out / Fan-in Pattern)

복합적인 지시사항이나 독립적인 여러 요구사항이 포함된 프롬프트를 처리할 때, **각 작업을 하위 태스크로 분할(Fan-out)하여 동시(Concurrent/Parallel)에 처리**한 뒤, 결과를 하나로 수집하여 종합(Fan-in / Synthesis)하는 패턴을 사용하면 응답 시간을 최소화(Fastest)하면서도 일관된 단일 응답(Coherent reply)을 제공할 수 있습니다.

**문제 상황 분석:**

* 고객 메시지에 서로 독립적인 3가지 요청(배송 추적, 쿠폰 검증, 계정 해지)이 포함되어 있음
* 시스템에는 3가지 요청을 각각 처리할 수 있는 개별 도구가 마련되어 있음
* 가장 빠른 처리 속도(Fastest)를 확보하면서 고객에게 전달할 최종 답변의 일관성(Coherent reply)을 유지해야 함

**A번이 정답인 이유:**
세 가지 요청은 서로 독립적인 작업이므로 각 도구 호출을 병렬(Concurrently)로 실행하면 전체 대기 시간을 단축시킬 수 있습니다. 이후 병렬 처리 결과를 종합하여 단일 응답으로 결합(Synthesized reply)하면 고객 관점에서도 한 번에 일관되고 명확한 답변을 받을 수 있어 속도와 정확성, 일관성을 모두 충족시킵니다.

**오답 분석:**

- Option B (오답): 고객에게 메시지를 세 개로 나누어 다시 작성해 달라고 요청하는 것은 심각한 UX 저해 요소이며, 에이전트의 자동화 및 처리 능력을 활용하지 못하는 방식입니다.

- Option C (오답): 다른 이슈(지연된 배송 및 쿠폰 적용 오류)에 대한 원인 파악과 보상 조치를 생략한 채 계정 해지만 일방적으로 진행하는 것은 올바른 고객 지원 처리 절차가 아닙니다.

- Option D (오답): 독립된 항목들을 순차적으로 하나씩 처리하고 후속 메시지를 기다리는 것은 전체 처리 속도를 불필요하게 지연시킵니다.

---

## 15번 문제

**1. 문제 원문**

A coordinator prompt for a "research-assistant" subagent currently reads: "Step 1: search for the top 5 articles. Step 2: open each one. Step 3: extract the publish date. Step 4: return a table." Reviewers find the subagent produces a table even when the most useful sources have no clear publish date, or when six sources would answer the question better than five. What change to the coordinator prompt would improve outcomes here?

A) Replace the step list with an even more granular ten-step sequence covering search syntax, click order, and field extraction to remove ambiguity entirely

B) Keep the same four numbered steps but increase the required article count from five to six so the subagent always gathers slightly more source material overall

C) Keep the same four numbered steps but add a fifth step instructing the subagent to double-check the publish date it already extracted back in step three

D) Rewrite the prompt around the research goal and quality bar, such as finding credible, relevant sources and reporting what is verifiable, rather than a fixed step sequence

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Rewrite the prompt around the research goal and quality bar, such as finding credible, relevant sources and reporting what is verifiable, rather than a fixed step sequence

**정답 및 해설:**

**핵심 개념**: 에이전틱 프롬프트 설계 (Goal-Oriented Prompting vs. Over-specification)

LLM 기반 에이전트에게 지나치게 경직되고 고정된 절차(Over-specified fixed steps)를 강제하면 **환경의 가변성**(예: 출처 수, 날짜 유무 등)에 유연하게 대응하지 못합니다. 대신 에이전트의 목표(Goal)와 **품질 기준(_Quality Bar_)** 중심으로 프롬프트를 구성하면, 에이전트가 상황에 맞게 유연하게 자율성을 발휘하여 최선의 결과를 도출할 수 있습니다.

**문제 상황 분석:**

* 현재 프롬프트는 "5개 기사 검색 ➔ 열기 ➔ 날짜 추출 ➔ 표 반환"이라는 **지나치게 절차적**인 4단계로 고정되어 있음
* 날짜 정보가 없는 유용한 출처가 있더라도 날짜 추출 단계에 매여 무리하게 표를 만들거나, 5개 이상의 출처가 필요한 상황에서도 5개에만 제한되는 유연성 부재 문제가 발생함
* 경직된 단계별 알고리즘 지시 대신, 에이전트가 목적에 맞게 판단할 수 있는 **가이드라인 중심**의 변경이 필요함

**D번이 정답인 이유:**
고정된 단계 지시어(Fixed step sequence)를 없애고, 신뢰할 수 있고 관련성 높은 정보 수집 및 검증 가능한 내용 보고라는 목표(Goal)와 **품질 기준(Quality Bar)** 중심으로 프롬프트를 재작성해야 합니다. 이렇게 하면 에이전트가 조사 과정에서 5개 또는 6개의 출처를 유연하게 선택하거나, 게시 날짜가 없는 경우에도 다른 중요한 메타데이터나 내용을 잘 정리하여 전달할 수 있습니다.

**오답 분석:**

- Option A (오답): 단계를 더 세분화(10단계)하여 과도하게 명세(Over-specification)하면 유연성이 더욱 떨어지고 예외 상황에 대한 에이전트의 적응력이 상실됩니다.

- Option B (오답): 단순 숫자를 5개에서 6개로 늘려도 경직된 절차 구조 자체는 그대로 유지되므로 근본적인 문제가 해결되지 않습니다.

- Option C (오답): 이미 추출한 날짜를 재확인하는 단계를 추가하더라도, 출처에 날짜가 아예 없는 본질적인 예외 상황을 해결하지 못합니다.

---

## 16번 문제

**1. 문제 원문**

An architect is asked to design an agent that investigates why a production incident occurred, given only a vague alert message and no prior knowledge of which service is at fault. The number of logs, services, and code paths to inspect cannot be known ahead of time. Which decomposition approach is most appropriate?

A) A single prompt that asks the model to name the root cause immediately from only the wording of the alert message

B) A prompt chain with a hardcoded set of five investigation steps that always runs in full regardless of what is found

C) A fixed sequential chain that always inspects the database, then the cache layer, then the load balancer, in that fixed order

D) A dynamic orchestrator that generates and prioritizes new investigation subtasks based on what each prior step uncovers

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: A dynamic orchestrator that generates and prioritizes new investigation subtasks based on what each prior step uncovers

**정답 및 해설:**

**핵심 개념**: 동적 오케스트레이션 및 작업 분해 (Dynamic Orchestration & Task Decomposition)

탐색 대상의 범위, 경로, 단계 수를 **사전에 예측할 수 없는 복잡한 문제** (장애 원인 분석 등)를 해결할 때는 **동적 오케스트레이터(Dynamic Orchestrator)** 패턴이 적합합니다. 이 접근 방식은 이전 실행 단계의 결과 및 조사 내용을 바탕으로 다음으로 수행해야 할 하위 작업(Subtask)을 실시간으로 동적 생성하고 우선순위를 재조정합니다.

**문제 상황 분석:**

* 모호한 경고 메시지만 주어진 상태이며, 어느 서비스에서 문제가 발생했는지에 대한 사전 정보가 없음
* 검사해야 하는 로그, 대상 서비스, 코드 경로의 수를 사전에 정의하는 것이 불가능함
* 정적인 규칙이나 고정된 단계로는 가변적인 조사 상황에 대응할 수 없는 구조임

**D번이 정답인 이유:**
사전에 탐색 경로를 알 수 없는 장애 조사의 경우, 각 단계에서 발견되는 단서(로그 메시지, 오류 코드 등)에 따라 조사 방향이 유연하게 달라져야 합니다. 동적 오케스트레이터(Dynamic Orchestrator)는 앞선 단계의 조사 결과를 해석하여 추가로 수행할 작업을 동적으로 생성하고 우선순위를 부여하므로 문제 상황의 요구조건에 완벽하게 부합합니다.

**오답 분석:**

- Option A (오답): 모호한 알림 문구 하나만으로 단일 프롬프트에서 즉시 근본 원인을 추론하는 것은 환각(Hallucination)을 유발하며 불가능한 요구사항입니다.

- Option B (오답): 고정된 5단계 프롬프트 체인은 상황 변화에 적응하지 못하며, 불필요한 단계를 고정 실행하게 되거나 필요한 조사를 누락시킵니다.

- Option C (오답): 데이터베이스 ➔ 캐시 ➔ 로드 밸런서로 고정된 순서의 체인을 사용하는 것은 문제의 원인이 다른 영역(예: 서드파티 API, 인증 서비스 등)에 있을 경우 근본 원인을 찾지 못하게 됩니다.

---

## 17번 문제

**1. 문제 원문**

A PreToolUse hook gating process_refund throws an unhandled exception whenever the internal verification service it calls times out. During an outage of that service, every refund attempt in the session crashes the agent entirely instead of being cleanly denied. What change to the hook fixes this without weakening the enforcement it provides?

A) Catch the timeout and return permissionDecision "allow", since a service outage is not the customer's fault and refunds should never be penalized for infrastructure issues

B) Increase the hook's timeout value to several hours, so the hook keeps waiting on the verification service instead of failing quickly during a temporary outage

C) Catch the timeout inside the hook and return permissionDecision "deny" with a reason explaining the outage, instead of letting the exception propagate and crash the session

D) Remove the hook entirely for the duration of any outage of the verification service, so refunds can proceed unblocked until that service comes back online

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Catch the timeout inside the hook and return permissionDecision "deny" with a reason explaining the outage, instead of letting the exception propagate and crash the session

**정답 및 해설:**

**핵심 개념**: 에이전트 훅 예외 처리 및 장애 시 처리 안전성 (Fail-Closed Pattern & Defensive Hook Design)

보안 및 검증 훅(`PreToolUse` hook)은 검증 대상 **외부/내부 서비스에 문제가 생겨 예외(Exception)가 발생할 때 전체 에이전트 루프나 세션이 다운되지 않도록 예외 처리**를 갖춰야 합니다. 또한 보안/규정 준수 관점에서는 검증이 불가능한 상태일 때 허용("allow")하는 것이 아니라 안전하게 차단("deny")하는 **Fail-Closed(실패 시 차단)** 원칙을 준수해야 합니다.

**문제 상황 분석:**

* 환불을 제어하는 `PreToolUse` 훅이 검증 서비스의 타임아웃 예외를 처리하지 않아 세션 전체가 충돌(Crash)함
* 훅이 제공하는 검증/강제력(Enforcement)을 약화시키지 않으면서(보안 유지) 에이전트 세션 충돌을 방지해야 함
* 내부 서비스 장애 시에도 에이전트가 예외를 안전하게 수습하고, 사유와 함께 거부("deny") 처리를 전달하는 구조로 전환해야 함

**C번이 정답인 이유:**
훅 내부에서 타임아웃 예외를 `catch`하여 처리되지 않은 예외가 세션 전체로 전파되어 크래시를 일으키는 것을 막습니다. 동시에 검증되지 않은 환불 건이 실행되지 않도록 `permissionDecision: "deny"`와 함께 장애 사유를 전달하면, 보안 강제력(Enforcement)을 그대로 유지하면서도 에이전트 세션을 안전하게 계속 유지할 수 있습니다.

**오답 분석:**

- Option A (오답): 장애 발생 시 허용("allow")으로 반환하면 검증되지 않은 환불 요청이 승인되어 훅의 보안/검증 강제력이 심각하게 약화됩니다 (Fail-Open 오류).

- Option B (오답): 타임아웃 시간을 수 시간으로 늘리는 것은 에이전트가 무한정 대기 상태(Hang)에 빠지게 만들어 근본적인 예외 처리가 되지 못합니다.

- Option D (오답): 장애 기간에 훅을 아예 제거하면 무검증 환불이 가능해지므로 훅의 통제 및 강제력을 포기하는 결과를 낳습니다.

---

## 18번 문제

**1. 문제 원문**

A support agent has two tools, get_customer and process_refund. The team's system prompt says "Always call get_customer and confirm the identity before calling process_refund." During testing, the agent occasionally calls process_refund first when a ticket is phrased as an urgent complaint. The architect wants this ordering to hold every time, not just most of the time. What should they implement?

A) A rewritten system prompt that repeats the ordering requirement twice and adds the word "must" in place of "always" to strengthen the instruction

B) A PreToolUse hook matched to process_refund that checks for a verified customer ID in session state and returns permissionDecision "deny" when none exists

C) A larger context window for the agent so it retains the ordering instruction even when the ticket phrasing shifts partway through the conversation

D) A follow-up user-facing reminder message injected after every ticket that restates the required call order before the agent responds

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: A PreToolUse hook matched to process_refund that checks for a verified customer ID in session state and returns permissionDecision "deny" when none exists

**정답 및 해설:**

**핵심 개념**: 결정론적 제어 훅 (`PreToolUse` Hook) vs 확률적 프롬프팅

시스템 프롬프트(Prompt)에 명시된 지시사항은 확률적으로 동작하므로 긴급한 프롬프트 분위기나 환각(Hallucination)에 의해 예외가 발생할 수 있습니다. 반면, **`PreToolUse` 훅**은 특정 도구가 실행되기 전에 코드 수준에서 하드 게이트웨이(Hard Gate) 역할을 하여 조건을 만족하지 못할 경우 `deny`를 반환함으로써 100% 결정론적(Deterministic)으로 순서 및 보안 정책을 강제합니다.

**문제 상황 분석:**

* 프롬프트 지시("항상 고객 조회 후 환불 수행")에도 불구하고, 긴급 불만 티켓 시 에이전트가 순서를 어기고 `process_refund`를 먼저 호출하는 현상이 간헐적으로 발생함
* 프롬프트에 기반한 방식을 넘어 100% 예외 없이(Every time) 도구 호출 순서를 강제할 솔루션이 필요함
* `process_refund` 실행 전에 신원 검증 여부를 판단하여 실행을 차단할 수 있는 제어 메커니즘이 요구됨

**B번이 정답인 이유:**
`process_refund` 도구가 호출되기 직전에 트리거되는 `PreToolUse` 훅을 작성하면, 세션 상태에 검증된 고객 ID(verified customer ID)가 없는 경우 즉시 `permissionDecision: "deny"`를 반환하여 execution을 하드 차단할 수 있습니다. 이는 프롬프트의 확률적 한계를 극복하고 100% 확실하게 순서를 강제하는 정석적인 에이전트 설계 패턴입니다.

**오답 분석:**

- Option A (오답): 프롬프트 문구를 아무리 강화하거나 강한 단어("must")를 써도 프롬프트는 확률적(Probabilistic)으로 동작하므로 100% 유지를 보장할 수 없습니다.

- Option C (오답): 컨텍스트 윈도우 크기를 늘리는 것은 모델의 지시 이행 신뢰성이나 도구 호출 순서의 엄격한 강제와 직접적인 관련이 없습니다.

- Option D (오답): 대화 중간에 상기 메시지를 지속해서 주입하는 것 역시 확률적 접근 방식에 불과하여 예외적인 툴 호출을 하드 차단하지 못합니다.

---

## 19번 문제

**1. 문제 원문**

A team is building an agent that queries a ticketing system, then a knowledge base, then drafts a reply, using the Messages API directly rather than a higher-level SDK. They debate whether their own code must execute the tools Claude requests. Which statement accurately describes the responsibility split in this direct integration?

A) Their application must execute each requested tool and submit results as tool_result blocks, since the API never runs client-side tools itself

B) Tool execution happens only if the application registers a webhook URL that Anthropic calls back synchronously during response generation

C) The Messages API automatically executes any tool whose name matches a function already defined within the calling application's runtime

D) Claude executes the ticketing system and knowledge base calls internally on Anthropic's servers, so the application only renders the final answer

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Their application must execute each requested tool and submit results as tool_result blocks, since the API never runs client-side tools itself

**정답 및 해설:**

**핵심 개념**: Anthropic Messages API의 도구 사용(Tool Use) 책임 분담 모델

**Claude Messages API를 직접 사용**할 때, API 자체는 **도구 실행 요청**(`tool_use`)을 반환하는 역할만 수행합니다. 클라이언트 애플리케이션은 해당 요청을 수신하여 자사/로컬 환경에서 직접 관련 로직(도구)을 실행하고, 그 실행 결과 데이터를 `tool_result` 블록 형태로 다시 API에 전송해주어야 할 책임이 있습니다.

**문제 상황 분석:**

* **고수준 SDK의 추상화 없이** Claude Messages API를 직접(Direct Integration) 다루는 상황임
* 모델이 요구하는 도구(티켓팅 시스템 조회, KB 검색 등)를 원격 API(Anthropic)가 실행하는지 클라이언트 코드가 실행하는지 명확한 역할 규명이 필요함
* **저수준 REST/Messages API 레벨에서 도구 호출 및 결과 반환의 주체**가 누구인지 파악해야 함

**A번이 정답인 이유:**
**Anthropic Messages API는 클라이언트 도구 코드를 직접 수행하는 런타임 환경을 제공하지 않습니다**. 모델은 단지 "어떤 도구를 무슨 인자로 호출해 달라"는 JSON 스펙(`tool_use`)을 응답할 뿐이며, 클라이언트 애플리케이션이 이 도구를 실제 실행하고 그 결과(`tool_result`)를 다음 턴의 `user` 메시지 인자로 되돌려주는 제어 루프를 직접 구현해야 합니다.

**오답 분석:**

- Option B (오답): Anthropic API는 response generation 도중에 클라이언트의 Webhook URL을 동기적으로 호출하여 도구를 대리 실행해 주는 메커니즘을 제공하지 않습니다.

- Option C (오답): Messages API는 로컬 런타임의 함수를 자동으로 감지하거나 실행할 수 있는 원격 바인딩 기능이 없습니다.

- Option D (오답): Anthropic 서버가 개발자의 사내 티켓팅 시스템이나 KB API를 내부적으로 직접 호출하여 실행해주지 않습니다.

---

## 20번 문제

**1. 문제 원문**

A support-ticket triage system always performs the same three actions on every incoming ticket: classify category, extract customer sentiment, and generate a brief summary. None of these actions ever depend on the outcome of another action within the same ticket. Based on Anthropic's workflow patterns, which decomposition or execution pattern is most appropriate, and what is the key justification?

A) An adaptive investigation plan, because triage requires generating new subtasks based on what earlier steps in the ticket discover.

B) Execute the three actions in parallel using separate, concurrent LLM calls, then aggregate the results. Justification: The subtasks are independent, so parallelization improves efficiency and follows Anthropic's recommended pattern for independent subtask execution.

C) A dynamic orchestrator, because sentiment extraction might reveal information that changes how many classification steps are needed.

D) A fixed prompt chain, because the subtasks are the same for every ticket and can be cleanly predetermined regardless of ticket content.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Execute the three actions in parallel using separate, concurrent LLM calls, then aggregate the results. Justification: The subtasks are independent, so parallelization improves efficiency and follows Anthropic's recommended pattern for independent subtask execution.

**정답 및 해설:**

**핵심 개념**: Anthropic의 워크플로우 패턴 중 병렬화 패턴 (Parallelization Pattern)

Anthropic이 제시하는 LLM 워크플로우 디자인 패턴에 따르면, **하위 작업(Subtask)들이 서로 의존성이 없고 독립적일 때 이를 순차적(Sequential)으로 실행하는 대신 병렬(Parallel)로 동시에 실행**하면 처리 시간(Latency)을 획기적으로 줄이고 효율성을 극대화할 수 있습니다.

**문제 상황 분석:**

* 들어오는 모든 티켓에 대해 3가지 작업(카테고리 분류, 감정 분석, 요약 생성)을 고정적으로 수행함
* 동일한 티켓 내에서 이 3가지 작업 간에는 어떠한 데이터 의존성도 존재하지 않음 (서로의 실행 결과를 기다릴 필요가 없음)
* 속도와 효율성을 극대화하면서 Anthropic의 권장 에이전틱 디자인 패턴에 부합하는 구조를 선택해야 함

**B번이 정답인 이유:**
세 가지 작업(분류, 감정 추출, 요약)은 완전히 독립적(Independent)이므로, 독립된 별도의 LLM 프롬프트 호출을 만들어 동시에 동시 실행(Concurrent LLM calls)한 후 결과만 수집하여 집계(Aggregate)하는 병렬 실행 패턴이 가장 적합합니다. 이는 실행 지연 시간을 대폭 감소시킵니다.

**오답 분석:**

- Option A (오답): 이전 단계의 발견 내용에 따라 새로운 하위 작업을 동적으로 계속 만들어내는 적응형 방식은 서로 독립적이고 고정된 3개 작업에 불필요한 오버헤드를 발생시킵니다.

- Option C (오답): 감정 추출 결과에 따라 단계가 변한다는 전제는 문제의 "어떠한 작업도 다른 작업의 결과에 의존하지 않는다"는 지문 조건에 위배됩니다.

- Option D (오답): 고정 프롬프트 체인(Fixed prompt chain)은 이전 단계의 출력이 다음 단계의 입력이 되는 순차적(Sequential) 종속 구조에 적합합니다. 독립적인 작업들을 순차적으로 실행하면 응답 시간(Latency)만 증가하므로 병렬 패턴보다 비효율적입니다.

---

---

## 21번 문제

### 1. 문제 원문

During a security review, an architect is asked to justify why a refund-blocking rule was implemented as a PreToolUse hook instead of as a stricter, more detailed system prompt paragraph that explicitly lists dollar thresholds and escalation steps. Which justification is most accurate?

A) A hook is required because the Agent SDK does not allow system prompts to reference numeric thresholds like dollar amounts, and the only way to enforce refund-blocking based on amounts is through a hook that intercepts tool use.

B) A hook is faster to write than a detailed prompt paragraph because it avoids specifying exact dollar thresholds and escalation steps, making it the preferred method when rapid deployment is prioritized during a security review.

C) A hook produces a more articulate explanation to the end user than a system prompt would, since hookSpecificOutput text is always shown verbatim in the chat transcript, providing clearer messages than natural language prompts.

D) A hook enforces the rule entirely outside of model generation, so it cannot be bypassed by unusual phrasing, prompt injection in tool results, or the model simply misapplying a complex instruction.

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**  
**D번**: A hook enforces the rule entirely outside of model generation, so it cannot be bypassed by unusual phrasing, prompt injection in tool results, or the model simply misapplying a complex instruction.

**정답 및 해설:**


**핵심 개념**: PreToolUse Hook과 LLM 제어 한계 (Deterministic Control vs Probabilistic Generation)  
LLM(대형 언어 모델)의 프롬프트 지시사항은 탈옥(Jailbreak), 프롬프트 주입(Prompt Injection), 환각 및 무작위성으로 인해 완전히 보장될 수 없습니다. 반면, 코드 수준에서 동작하는 **PreToolUse Hook**은 모델의 생성 과정과 독립적으로 특정 도구 호출 실행 직전에 확정적(Deterministic)으로 검증 및 차단을 수행합니다.

**문제 상황 분석:**
- 환불 차단과 같은 강력한 보안/비즈니스 제약 조건을 프롬프트에만 의존할 경우, 사용자의 독특한 표현 방식이나 입력값에 포함된 프롬프트 주입 공격으로 우회될 위험이 있습니다.
- 모델이 복잡한 지시사항을 제대로 해석하지 못하거나 임계값을 잘못 계산하여 도구를 실행할 가능성이 존재합니다.
- 안전하고 확실한 결제/환불 보안 규칙 적용을 위해 프로그래밍 방식의 거부(Hook) 구조 도입 필요성이 제기됩니다.

**D번이 정답인 이유:**  
PreToolUse 훅은 결정론적(Deterministic) 코드로 작동하여 LLM의 확률적 생성 로직 외부에서 규칙을 적용합니다. 이로 인해 모델이 프롬프트를 잘못 해석하거나, 사용자가 주입 공격을 시도하더라도 도구 실행 자체를 물리적으로 차단하므로 가장 정확하고 확실한 보안 주장에 해당합니다.

**오답 분석:**
- Option A (오답): Agent SDK가 시스템 프롬프트에서 숫자나 금액 임계값을 참조하는 것을 금지한다는 설명은 사실이 아닙니다. 프롬프트에 금액 조건을 넣는 것은 당연히 가능합니다.
- Option B (오답): 훅을 작성하는 목적은 단순히 작성 속도를 높이거나 임계값 명시를 피하기 위함이 아닙니다. 오히려 훅 내부에 정확한 조건 로직을 코드로 구현해야 하므로 더 엄격한 프로그래밍이 요구됩니다.
- Option C (오답): 훅의 주요 목적과 이점은 사용자 설명 유연성이 아니라, 안전성 확보 및 실행 제어입니다. 또한 설명 제공 기능 자체가 시스템 프롬프트보다 훅이 항상 우수하다고 볼 수도 없습니다.

---

## 22번 문제

### 1. 문제 원문

A support-automation agent has a refund_customer MCP tool. Company policy requires that refunds over $500 never be issued autonomously and must instead be routed to a human reviewer. The architect currently relies on a system prompt telling Claude never to approve refunds above that amount. During testing, the agent occasionally approves a $600 refund anyway. What is the most effective fix?

A) Rewrite the system prompt to state the $500 threshold rule three times using varied phrasings and include a dedicated section that precedes every example conversation, making the constraint more salient during generation.

B) Lower the model's temperature to 0.1 for any session that calls refund_customer, forcing deterministic tool-call decisions that respect the $500 limit more consistently and prevent unauthorized high-value approvals.

C) Register a PostToolUse hook matched to refund_customer that examines tool_input.amount and, if it exceeds $500, writes the transaction details to an audit log and triggers a post-hoc review process to flag the violation.

D) You can register a PreToolUse hook on refund_customer that inspects tool_input.amount and returns permissionDecision "deny" with a reason whenever the amount exceeds $500 redirecting the workflow to escalation.

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**  
**D번**: You can register a PreToolUse hook on refund_customer that inspects tool_input.amount and returns permissionDecision "deny" with a reason whenever the amount exceeds $500 redirecting the workflow to escalation.

**정답 및 해설:**


**핵심 개념**: PreToolUse Hook 및 결정론적 거부 (Pre-execution Validation)  
LLM에 전달하는 자연어 프롬프트나 온도(temperature) 조절만으로는 비즈니스 핵심 규칙을 100% 강제하기 어렵습니다. 도구가 실행되기 직전에 입력 매개변수(`tool_input`)를 검사하여 엄격한 조건 검증을 수행하고, 조건 위반 시 실행을 차단(`deny`)하는 **PreToolUse Hook**을 사용하는 것이 가장 확실한 보안 및 가드레일 구현 방법입니다.

**문제 상황 분석:**
- 500달러 초과 환불은 사람이 검토해야 하는 필수 비즈니스 정책이 존재함.
- 시스템 프롬프트로 제약을 가했으나, 테스트 중 에이전트가 600달러 환불 도구를 그대로 실행하는 오작동 발생.
- 모델의 자연어 이해 및 확률적 생성 방식에만 의존하지 않고, 도구 호출 자체를 확정적으로 차단하는 메커니즘이 필요함.

**D번이 정답인 이유:**  
`PreToolUse` 훅은 `refund_customer` 도구가 실제 호출되기 전 단계에서 동작합니다. `tool_input.amount`를 검사하여 금액이 $500를 초과할 경우 `permissionDecision`을 `"deny"`로 반환함으로써 도구 실행을 완벽히 차단하고 사유와 함께 에스컬레이션 워크플로로 안전하게 전환할 수 있습니다.

**오답 분석:**
- Option A (오답): 프롬프트를 반복 작성하거나 강조하더라도 LLM의 확률적 특성상 환불 도구 호출을 100% 신뢰성 있게 차단할 수 없습니다.
- Option B (오답): `temperature`를 0.1로 낮추면 응답의 무작위성은 줄어들지만, 프롬프트 지시사항을 잘못 해석하거나 지키지 않는 근본적인 문제를 완벽히 방지하지는 못합니다.
- Option C (오답): `PostToolUse` 훅은 도구가 이미 실행된 후(이미 환불이 승인되어 발송된 후)에 동작합니다. 사후 로그 기록 및 검토는 가능하지만, 무단 고액 환불이 발생하는 것 자체를 사전에 막지 못합니다.

---

## 23번 문제

### 1. 문제 원문

An architect's agent calls three MCP tools that each return timestamps in a different format: Unix epoch integers, ISO 8601 strings, and numeric status codes mixed with dates. The model frequently misreads these inconsistent formats when reasoning about order history. Which hook design correctly normalizes the data before the model ever sees it?

A) Register a PostToolUse hook matched to the three MCP tools that parses each tool's response and returns hookSpecificOutput.updatedToolOutput with values rewritten into one consistent format.

B) Register a PreToolUse hook matched to the three MCP tools that intercepts the call, rewrites any timestamp field in tool_input to ISO 8601 format, ensuring each MCP server receives a pre-normalized request payload.

C) Register a Notification hook for the three MCP tools that parses each tool invocation's returned message field for date-like substrings, converts them into ISO 8601 format, and republishes a normalized summary to the transcript.

D) Add a system prompt instruction directing Claude to convert all timestamps and status codes from the three MCP tools into a single consistent ISO 8601 format before reasoning about order history.

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**  
**A번**: Register a PostToolUse hook matched to the three MCP tools that parses each tool's response and returns hookSpecificOutput.updatedToolOutput with values rewritten into one consistent format.

**정답 및 해설:**


**핵심 개념**: PostToolUse Hook 및 Output Data Normalization  
MCP 도구 실행 후 모델에 결과가 전달되기 전, 도구의 응답 데이터(Output)를 가로채 변형/정규화하려면 **PostToolUse Hook**을 사용합니다. 이때 `hookSpecificOutput.updatedToolOutput` 필드를 수정하여 반환하면, 모델은 정구화되고 정리된 단일 형식의 응답만을 수신하게 됩니다.

**문제 상황 분석:**
- 3개의 MCP 도구가 타임스탬프 데이터를 서로 다른 포맷(Unix epoch, ISO 8601, 상태 코드 혼합형)으로 반환하고 있음.
- 비일치하는 포맷 때문에 LLM이 주문 내역을 추론할 때 오독(misread)하는 현상이 빈번하게 발생함.
- 목적: **도구가 실행된 후 모델이 응답을 확인하기 전에** 데이터를 단일 표준 포맷으로 정규화해야 함.

**A번이 정답인 이유:**  
`PostToolUse` 훅은 도구의 실행 결과(Response)를 모델에 제공하기 직전에 개입할 수 있는 지점입니다. 각 도구의 응답 데이터를 파싱한 후 `hookSpecificOutput.updatedToolOutput`을 통해 일관된 데이터 포맷으로 수정해 주면, 모델은 원본의 불일치한 데이터를 보지 않고 정규화된 데이터만 전달받아 정확하게 추론할 수 있습니다.

**오답 분석:**
- Option B (오답): `PreToolUse` 훅은 도구가 실행되기 **전**에 도구로 전달되는 입력(`tool_input`)을 검사/수정하는 훅입니다. 문제 상황은 도구가 반환하는 **출력(Response)** 포맷의 문제이므로 적절하지 않습니다.
- Option C (오답): Notification 훅은 알림 및 기록 관찰용으로 주로 사용되며, 모델이 실제로 수신하는 도구의 실행 결과 출력(`tool_output`) 자체를 치환하여 전달하는 표준적이고 확정적인 방법이 아닙니다.
- Option D (오답): 문제에서 "모델이 데이터를 보기 전에(before the model ever sees it)" 정규화하길 원했습니다. 시스템 프롬프트 지시는 모델이 비일치 데이터를 직접 읽고 변환하도록 시키는 것이므로 요구사항에 맞지 않으며, 모델의 오독 위험성을 완전히 배제할 수 없습니다.

---

## 24번 문제

### 1. 문제 원문

A refund workflow requires that process_refund always be called with the exact customer_id captured by an earlier verified get_customer call, never a value the model retypes from the conversation. A PreToolUse hook already blocks the call when no verified ID exists in session state. What should the hook do once a verified ID is present, to prevent the model from substituting a different ID string?

A) Return an empty object so the call proceeds unchanged, since the presence of a verified ID in session state is enough evidence that the model used it

B) Return permissionDecision "ask" so a human reviewer retypes the same ID manually before every refund, even when verification already succeeded

C) Return permissionDecision "allow" together with updatedInput that overwrites the tool's customer_id argument with the verified ID stored in session state

D) Return permissionDecision "defer" so the query pauses indefinitely until an operator resumes it with the corrected customer_id argument

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**  
**C번**: Return permissionDecision "allow" together with updatedInput that overwrites the tool's customer_id argument with the verified ID stored in session state

**정답 및 해설:**


**핵심 개념**: PreToolUse Hook과 Tool Input Mutation (Input Overwriting)  
Agent SDK의 `PreToolUse` 훅은 단순히 도구 호출을 승인(`allow`)하거나 거부(`deny`)하는 가드레일 역할뿐만 아니라, 모델이 전달하려는 인자 값(`tool_input`)을 안전하게 강제 덮어쓰기(`updatedInput`)하여 수정하는 기능을 제공합니다. 이를 통해 모델의 인자 재작성 오작동이나 프롬프트 환각(Hallucination) 위험을 원천 차단할 수 있습니다.

**문제 상황 분석:**
- `process_refund` 도구 호출 시, 대화 맥락에서 모델이 재작성한 ID가 아닌 검증된 정확한 `customer_id`가 전달되어야 함.
- 세션 상태에 검증된 ID가 존재하는 상황에서, 모델이 임의로 다른 ID 문자열을 입력하거나 잘못 대치하는 위험을 방지해야 함.
- 목적: 검증된 ID가 존재할 때 호출을 승인함과 동시에 인자 값을 세션에 저장된 실제 검증 ID로 확실하게 덮어써서 보장하는 가장 효과적인 방법 탐색.

**C번이 정답인 이유:**  
`PreToolUse` 훅에서 `permissionDecision: "allow"`와 함께 `updatedInput` 필드를 반환하면, 도구가 실제로 실행되기 전에 모델이 생성한 `customer_id` 인자를 세션 상태에 저장되어 있던 검증된 ID로 안전하게 강제 교체(Overwrite)할 수 있습니다. 이를 통해 모델의 인자 왜곡 위험을 완전히 방지하고 자동화된 흐름을 유지할 수 있습니다.

**오답 분석:**
- Option A (오답): 빈 객체를 반환하여 호출을 그대로 진행할 경우, 세션에 검증된 ID가 있더라도 모델이 `tool_input`에 오타를 내거나 잘못된 ID를 전달했을 때 이를 보정하지 못하고 그대로 오실행됩니다.
- Option B (오답): 이미 세션 상태 검증이 성공했음에도 매번 사람에게 수동 재입력을 요청하는 것(`"ask"`)은 불필요한 수작업 개입을 발생시켜 자동화 효율성을 크게 떨어뜨립니다.
- Option D (오답): `"defer"`를 통해 무기한 일시 중지하는 것은 정상적인 검증 완료 상태에서 시스템 작동을 중단시키므로 잘못된 처리 방식입니다.

---

## 25번 문제

### 1. 문제 원문

A coordinator for a market-research assistant splits the broad query 'analyze the competitive landscape for electric vehicle charging networks' into narrow subtasks like 'find charger connector types' and 'list charging speeds,' each assigned to a separate subagent. The synthesized report ends up missing pricing models, regulatory incentives, and major competitors entirely. What went wrong?

A) The subagents duplicated each other's work on connector types, leaving no time to research the remaining subtopics

B) The coordinator decomposed the query too narrowly, so the subtasks covered only a few facets and left broad areas uncovered

C) The synthesis step ran before all subagents had finished, so the coordinator aggregated partial results instead of complete ones

D) The subagents lacked sufficient tool access to search external sources, so they returned incomplete results for their subtasks

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**  
**B번**: The coordinator decomposed the query too narrowly, so the subtasks covered only a few facets and left broad areas uncovered

**정답 및 해설:**


**핵심 개념**: 에이전트 작업 분해 오류 (Over-narrow Task Decomposition)  
멀티 에이전트 시스템에서 코디네이터(Coordinator)나 오케스트레이터(Orchestrator)가 광범위한 요청을 하위 작업(Subtask)으로 분해할 때, 전체 맥락(Context)을 아우르지 못하고 지나치게 구체적이거나 좁은 범위로만 분해하면 필수적인 영역들이 누락되어 불완전한 최종 결과물이 생성됩니다.

**문제 상황 분석:**
- 원본 쿼리는 '전기차 충전 네트워크의 **경쟁 환경 분석**'이라는 대단히 넓은 범주의 주제임.
- 코디네이터가 이를 '커넥터 유형', '충전 속도'라는 극히 일부의 기술적 사양 수준으로만 좁게 분해함.
- 그 결과, 전체 분석에서 가장 중요한 '가격 모델', '규제 인센티브', '주요 경쟁사' 항목이 하위 작업 목록에서 아예 배제되어 최종 보고서에 빠지게 됨.

**B번이 정답인 이유:**  
코디네이터가 초기에 원본 요청을 분해(Decompose)할 때 너무 좁은 범위(Narrow facets)로 분해했기 때문에, 하위 작업으로 지정되지 않은 광범위한 영역들(가격, 규제, 경쟁사 등)이 커버되지 못하고 누락된 것이 문제의 근본 원인입니다.

**오답 분석:**
- Option A (오답): 지문에서는 서브에이전트들이 개별 하위 작업을 각각 수행했다고 명시되어 있으며, 중복 작업으로 인한 시간 부족에 대한 언급은 없습니다.
- Option C (오답): 모든 서브에이전트의 작업 완료 여부 타이밍 문제가 아니라, 하위 작업 정의 단계 자체에서 핵심 주제들이 빠진 것이 문제입니다.
- Option D (오답): 도구 접근 권한 부족 문제는 '지정된 하위 작업' 내의 수행 결과 부실을 일으킬 수 있지만, 아예 도메인 주제(가격, 경쟁사 등) 자체가 작업 계획에서 누락된 이유를 설명하지는 못합니다.

---

## 26번 문제

### 1. 문제 원문

A build-automation loop's exception handler catches a tool execution failure, appends a tool_result block with `"is_error": true` describing the failure, and sends the updated conversation back to Claude. A reviewer argues the loop should terminate immediately on any tool failure instead. Why is appending the error and continuing generally the better design here?

A) It lets Claude see the failure in context and decide the next step, such as retrying with different arguments, consistent with model-driven reasoning

B) It removes the need for any stop_reason checks, since is_error becomes the sole termination signal for the rest of the loop

C) It is required, since the Messages API automatically terminates any conversation that lacks a correctly formatted is_error field after any single failure

D) It guarantees the same tool will succeed on the next attempt, because error tool_results reset that tool's internal rate limits

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**  
**A번**: It lets Claude see the failure in context and decide the next step, such as retrying with different arguments, consistent with model-driven reasoning

**정답 및 해설:**


**핵심 개념**: Agentic Error Handling & Model-Driven Recovery (에이전트 에러 처리 및 모델 기반 복구)  
에이전트 루프에서 도구 실행 에러가 발생했을 때 프로그램 시스템을 즉시 강제 종료(Hard Fail)하는 대신, 에러 내용을 `tool_result`의 `"is_error": true` 메시지로 구성하여 모델에 되돌려주는 패턴입니다. 이를 통해 LLM은 오류 맥락을 파악하고 잘못된 매개변수를 수정하여 재시도하거나 대안적 해결책을 스스로 도출할 수 있습니다.

**문제 상황 분석:**
- 빌드 자동화 루프 수행 중 도구 실행 실패 예외 발생.
- 현재 시스템은 `"is_error": true`와 에러 메시지를 `tool_result`에 담아 Claude에게 전달하여 대화를 이어가도록 구현됨.
- 리뷰어는 도구 실패 시 루프를 즉시 중단해야 한다고 주장하나, 자율형 에이전트 설계 관점에서는 에러를 대화 맥락에 포함시켜 계속 진행하는 방식이 더 권장됨.

**A번이 정답인 이유:**  
에이전트 모델의 주요 강점은 오류 상황에서 스스로 복구 전략을 마련하는 자율 추론 능력입니다. 에러 결과를 대화 이력에 포함시키면 Claude가 에러 원인(예: 잘못된 경로, 오타, 매개변수 오류 등)을 파악하고 다른 인자로 도구를 다시 호출하는 등 적절한 다음 조치를 결정할 수 있습니다.

**오답 분석:**
- Option B (오답): `is_error`는 도구 실행 결과의 실패 여부를 나타낼 뿐이며, 모델 응답의 완료 상태를 나타내는 `stop_reason` 확인을 대체하거나 제거하지 않습니다.
- Option C (오답): Messages API는 `is_error` 필드가 없다고 해서 대화를 자동으로 강제 종료하지 않습니다.
- Option D (오답): 에러 결과를 반환한다고 해서 다음 도구 실행의 성공이 보장되거나 도구의 내부 호출 제한(Rate Limit)이 초기화되는 것은 아닙니다.

---

## 27번 문제

### 1. 문제 원문

A platform team is designing an agent that performs quarterly compliance reviews of Terraform configuration files. Every quarter, the exact same checklist of eleven rules is applied to every file, and no rule's outcome changes which other rules are checked. A junior engineer suggests using a dynamic orchestrator that generates new compliance subtasks at runtime. What should the architect recommend instead, and why?

A) Keep the dynamic orchestrator, since generating compliance subtasks at runtime always produces higher-quality findings than any fixed checklist ever would

B) Use a fixed prompt chain, but let the model silently skip whichever of the eleven rules it judges unnecessary for a given file

C) Use a fixed prompt chain that walks the eleven-rule checklist in the same order every quarter, since the subtasks never depend on intermediate findings

D) Switch to a dynamic orchestrator, since Terraform files vary too much in size for any fixed review process to ever be applied consistently

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**  
**C번**: Use a fixed prompt chain that walks the eleven-rule checklist in the same order every quarter, since the subtasks never depend on intermediate findings

**정답 및 해설:**


**핵심 개념**: Dynamic Orchestrator vs Fixed Prompt Chain (동적 오케스트레이터 대 고정 프롬프트 체인)  
에이전트 워크플로를 설계할 때 실행 흐름이 이전 단계의 출력값에 따라 동적으로 변해야 하는 경우가 아니라면, 미리 정해진 순서대로 작동하는 고정 프롬프트 체인(Fixed Prompt Chain) 또는 파이프라인 구조를 사용하는 것이 시스템의 일관성, 결정론성, 예측 가능성 및 비용 효율성 면에서 훨씬 우수합니다.

**문제 상황 분석:**
- 매 분기마다 모든 Terraform 파일에 정확히 동일한 11가지 규칙 체크리스트가 수행됨.
- 특정 규칙의 검사 결과가 다른 규칙의 검사 여부에 영향을 주지 않음 (하위 작업 간 의존성 없음).
- 불필요하게 복잡하고 무작위성을 유발할 수 있는 런타임 동적 오케스트레이터(Dynamic Orchestration) 대신, 정형화된 워크플로를 처리할 적절한 아키텍처 패턴 선정이 필요함.

**C번이 정답인 이유:**  
검사해야 할 작업과 순서가 명확히 고정되어 있고, 각 하위 작업이 중간 결과에 따라 변경되지 않는 조건에서는 런타임 오케스트레이터의 동적 계획(Dynamic Planning) 능력이 불필요합니다. 따라서 매 분기마다 고정된 순서로 11가지 규칙을 실행하는 고정 프롬프트 체인(Fixed Prompt Chain)을 사용하는 것이 비용과 일관성 측면에서 가장 효율적입니다.

**오답 분석:**
- Option A (오답): 동적 생성 방식이 고정 체크리스트보다 항상 더 높은 품질의 결과를 낸다는 주장은 사실이 아닙니다. 정해진 규정을 누락하거나 자율적인 판단 오차를 유발할 위험이 있습니다.
- Option B (오답): 컴플라이언스 검토에서 모델이 임의로 규정을 건너뛰는 것(silently skip)은 보안/합의 검토의 완전성을 해치므로 매우 위험한 방식입니다.
- Option D (오답): Terraform 파일의 크기 차이가 고정 검토 프로세스의 적용 불가를 의미하지 않으며, 단순 크기 변동 때문에 동적 오케스트레이터로 전환할 이유가 되지 못합니다.

---

## 28번 문제

### 1. 문제 원문

A coordinator has several custom subagents defined, each with a description field summarizing what it's for. When a new query arrives, the coordinator does not explicitly name any subagent. How does it typically decide which, if any, subagent to invoke?

A) It requires the query to include the subagent's exact name, otherwise no subagent is ever considered for delegation

B) It matches the query against each subagent's description field and delegates automatically when a match is found

C) It invokes subagents in the fixed order they were defined in the agents configuration, regardless of the query

D) It always invokes every defined subagent and discards the ones whose output isn't relevant to the query

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**  
**B번**: It matches the query against each subagent's description field and delegates automatically when a match is found

**정답 및 해설:**


**핵심 개념**: Description-based Agent Routing (설명 기반 에이전트 라우팅)  
멀티 에이전트 시스템에서 코디네이터(Coordinator 또는 Orchestrator) 에이전트는 하위 서브에이전트들의 목적과 역할을 기술한 `description` 필드를 LLM 프롬프트/시스템 맥락에 포함시켜 판단합니다. 새로운 요청이 들어오면 LLM이 사용자의 쿼리 의도와 각 서브에이전트의 `description`을 비교 매칭하여 가장 적절한 서브에이전트로 위임(Delegation)을 수행합니다.

**문제 상황 분석:**
- 여러 서브에이전트가 정의되어 있으며, 각 서브에이전트는 자신의 용도를 요약한 `description` 필드를 지님.
- 입력된 쿼리 내에는 실행할 서브에이전트의 이름이 명시적으로 제시되지 않음.
- 코디네이터가 쿼리를 분석하여 적절한 서브에이전트를 동적으로 선택하고 호출하는 메커니즘을 묻고 있음.

**B번이 정답인 이유:**  
코디네이터는 입력된 사용자 쿼리의 의미와 각 서브에이전트에 작성된 `description`의 내용을 비교/평가하여 적합성이 높은 서브에이전트를 자동으로 선별하고 작업을 위임합니다.

**오답 분석:**
- Option A (오답): 쿼리에 서브에이전트의 정확한 이름이 명시되지 않더라도 `description` 기반의 의미적 매칭(Semantic Matching)을 통해 동적으로 하위 에이전트를 호출할 수 있습니다.
- Option C (오답): 쿼리의 내용과 관계없이 설정 파일에 정해진 순서대로 호출하는 방식은 정적 체인에 불과하며, 동적 에이전트 라우팅 방식이 아닙니다.
- Option D (오답): 정의된 모든 서브에이전트를 무조건 전체 호출한 뒤 불필요한 출력을 버리는 방식은 심각한 불필요 비용(Token) 발생 및 시간 지연을 유발하므로 올바른 오케스트레이션 설계가 아닙니다.

---

## 29번 문제

### 1. 문제 원문

A researcher tasks an agent with answering an open-ended question: "What is causing the 15% increase in checkout abandonment over the last month?" The relevant data sources, whether logs, analytics dashboards, or recent deploys, are not specified in advance and depend on what early findings suggest. How should this task be decomposed?

A) Generate an initial investigation subtask, evaluate its findings, then dynamically generate follow-up subtasks that pursue the most promising leads

B) Split the investigation into per-file local analysis passes across the codebase, followed by a single cross-file integration pass

C) Have the model state the cause immediately from only the phrase describing the abandonment increase, without consulting any data source

D) Chain together a fixed sequence of exactly three steps: analytics dashboard, then server logs, then recent deploys, always in that exact same order

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**  
**A번**: Generate an initial investigation subtask, evaluate its findings, then dynamically generate follow-up subtasks that pursue the most promising leads

**정답 및 해설:**


**핵심 개념**: Dynamic Task Decomposition & Exploratory Planning (동적 작업 분해 및 탐색적 계획)  
탐색적이고 열린 결말(Open-ended)을 갖는 문제 해결 시, 사용할 데이터 소스나 조사 방향을 사전에 고정할 수 없습니다. 따라서 초기 하위 작업(Initial Subtask)의 실행 결과를 바탕으로 다음 단계의 조사 방향을 동적으로 결정하는 '동적 작업 분해(Dynamic Task Decomposition)' 기법이 필수적입니다.

**문제 상황 분석:**
- "지난달 결제 이탈률 15% 증가 원인"이라는 탐색적이고 광범위한 질문이 주어짐.
- 확인할 데이터 소스(로그, 대시보드, 배포 내역 등)가 사전에 정해져 있지 않음.
- 초기 조사 결과에 따라 접근해야 할 데이터 소스와 다음 조사 단계가 달라지는 가변적인 구조임.

**A번이 정답인 이유:**  
초기 탐색 작업을 통해 얻은 단서(Findings)를 평가하고, 이를 바탕으로 가장 가능성이 높은 단서(Promising leads)를 추적하는 후속 작업을 동적으로 생성(Dynamically generate)하는 방식이 불확실하고 탐색적인 문제 상황을 해결하는 가장 효과적이고 유연한 에이전트 설계 패턴입니다.

**오답 분석:**
- Option B (오답): 모든 소스 코드를 파일별로 순차 분석하는 방식은 데이터 소스가 사전에 지정되지 않고 원인이 로그/대시보드/배포 등 다양한 영역에 존재할 수 있는 문제의 특성과 맞지 않으며 비효율적입니다.
- Option C (오답): 어떤 데이터 소스도 참조하지 않고 텍스트 문구만으로 원인을 즉시 추론하는 것은 환각(Hallucination)을 유발하며 근거 없는 답변을 생성하게 됩니다.
- Option D (오답): 대시보드 → 로그 → 배포 순서로 단계를 고정하는 정적 체인(Fixed sequence)은 초기 조사에서 배포 문제가 유력한 단서로 지목되더라도 무조건 고정된 순서만을 강제하므로 유연성이 떨어집니다.

---

## 30번 문제

### 1. 문제 원문

An architect resumed a session and asked the agent to revert a file to a state from earlier in that same conversation, expecting the session itself to have preserved the file's old contents. The agent instead reports it can only see the file's current, edited contents on disk. What explains this behavior?

A) The resume call must have used the wrong session ID, since a correct resume would restore the earlier file contents automatically

B) Sessions persist the conversation history, not a snapshot of the filesystem, so file reverts require a separate checkpointing mechanism

C) The agent's read tool caches results only for the current turn, so earlier reads are always inaccessible after resuming

D) fork_session was required to preserve the file's earlier state, and it was omitted from this particular resume call

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**  
**B번**: Sessions persist the conversation history, not a snapshot of the filesystem, so file reverts require a separate checkpointing mechanism

**정답 및 해설:**


**핵심 개념**: Session State vs Filesystem State Persistence (세션 상태 대 파일 시스템 상태 영속성)  
에이전트 세션(Session)은 모델과 나눈 텍스트 대화 이력(Conversation history, Prompts, Responses, Tool call logs 등)을 저장하고 재개할 뿐, 실제 로컬/외부 파일 시스템의 스냅샷이나 버전 관리 상태까지 자동으로 백업·복원하지 않습니다. 따라서 파일의 이전 버전 복구가 필요하다면 Git 버전 관리나 별도의 파일 체크포인팅(Checkpointing) 메커니즘을 연동해야 합니다.

**문제 상황 분석:**
- 개발자가 기존 세션을 재개(Resume)한 후 에이전트에게 이전 대화 시점의 파일 상태로 원복(Revert)을 요청함.
- 개발자는 세션이 저장될 때 파일 시스템의 이전 상태도 함께 저장되었을 것이라 오해함.
- 에이전트는 세션을 재개했음에도 파일 시스템에는 현재 수정된 실물 파일만 존재하므로 이전 상태로 복구할 수 없다고 응답함.

**B번이 정답인 이유:**  
세션 재개(Resume)는 오직 프롬프트와 메시지 등 **대화 기록(Conversation history)**만을 유지 및 복원합니다. 실제 디스크 상의 파일 시스템 스냅샷을 저장하는 것이 아니므로, 세션 기록만으로는 물리적인 파일 내용을 이전 상태로 자동 되돌릴 수 없으며 별도의 파일 시스템 백업/체크포인트 메커니즘이 필요합니다.

**오답 분석:**
- Option A (오답): 세션 ID가 올바르게 사용되었더라도 세션 저장 메커니즘 자체에 파일 시스템 스냅샷 복원 기능이 포함되어 있지 않습니다.
- Option C (오답): 에이전트의 대화 맥락에는 이전 턴의 읽기(Read) 도구 결과나 파일 내용 기록이 텍스트 형태로 남아있을 수 있으나, 이 동작의 원인이 단순히 "읽기 도구의 턴 단위 캐싱 제한" 때문은 아닙니다. 핵심은 세션 저장이 실제 파일 시스템 스냅샷을 보존하지 않는다는 점입니다.
- Option D (오답): `fork_session`은 기존 세션의 대화 맥락을 분기(Fork)하여 새로운 세션을 만드는 기능이며, 실제 파일 시스템 상태를 캡처하거나 보존하는 스냅샷 도구가 아닙니다.

---

## 31번 문제

### 1. 문제 원문

During a design review, an engineer says: "Let's just resume the analysis session twice, once for the caching approach and once for the queueing approach, so we get two independent explorations." A colleague objects. What is the correct concern with this plan, given how resume and fork differ?

A) Resume and fork behave identically in this scenario, so the colleague's objection is unfounded and either call sequence produces two independent explorations

B) Resuming the same session twice appends both explorations to one shared history in sequence, so the second exploration sees the first; forking gives two independent branches

C) Resume can only ever be called once per session id, so the second resume attempt would fail outright and the queueing exploration could never start at all

D) Resuming quietly discards all prior tool results before continuing, so neither the caching nor the queueing exploration would retain the original analysis

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**  
**B번**: Resuming the same session twice appends both explorations to one shared history in sequence, so the second exploration sees the first; forking gives two independent branches

**정답 및 해설:**


**핵심 개념**: Session Resume vs Session Fork (세션 재개 대 세션 분기)  
- **Resume(재개)**: 기존 세션 ID의 단일 대화 기록(Linear History) 끝에 새로운 프롬프트와 턴을 연속해서 누적 추가하는 방식입니다. 동일 세션을 연속해서 resume하면 이전 작업 내역이 동일 맥락(Context)에 그대로 남아있게 됩니다.
- **Fork(분기)**: 기준 시점의 대화 히스토리를 복사하여 서로 다른 세션 ID를 가지는 별개의 대화 브랜치(Branch)를 생성하는 방식입니다. 이를 사용해야 서로의 대화 기록에 영향을 주지 않는 완전한 독립적 탐색이 가능해집니다.

**문제 상황 분석:**
- 엔지니어가 하나의 분석 세션에서 두 가지 다른 접근 방식(캐싱, 큐잉)을 각각 `resume`하여 독립적인 탐색을 수행하고자 함.
- 그러나 동일 세션 ID로 `resume`을 연속 호출하면 단일 대화 이력에 두 접근 방식에 대한 탐색 내용이 순차적으로 추가(Append)됨.
- 이로 인해 두 번째 탐색(큐잉)을 진행할 때 LLM 맥락에 첫 번째 탐색(캐싱)의 내용이 남아있어 독립성이 오염되는 문제가 발생함.

**B번이 정답인 이유:**  
동일한 세션을 두 번 `resume`할 경우 두 번째 탐색 프롬프트는 첫 번째 탐색의 대화 이력 뒤에 덧붙여집니다. 따라서 두 번째 탐색 시 모델이 첫 번째 탐색의 결과와 맥락을 참조하게 되므로 완전한 독립성이 보장되지 않습니다. 두 개의 독립된 탐색 브랜치를 만들려면 `fork`를 사용하여 히스토리를 갈라놓아야 하므로 동료의 우려가 타당하며, B번 설명이 이를 가장 명확하게 지적하고 있습니다.

**오답 분석:**
- Option A (오답): Resume과 Fork는 히스토리 병합 구조 및 독립된 브랜치 생성 여부에서 동작 방식이 전혀 다릅니다.
- Option C (오답): Resume은 동일 세션 ID에 대해 여러 번 호출할 수 있습니다. 단지 동일한 히스토리 라인 뒤에 계속 덧붙여질 뿐, 두 번째 호출이 에러로 실패하지는 않습니다.
- Option D (오답): Resume 수행 시 이전 도구 결과나 대화 이력을 폐기(Discard)하지 않고 모두 보존하여 전달합니다.

---

## 32번 문제

### 1. 문제 원문

A support-ticket agent receives a simple, fully answerable question. On the very first request, Claude's response has stop_reason "end_turn" and contains only a text answer, with no tool_use block at all. An engineer flags this as a bug, assuming every task must go through at least one tool call before the loop can end. Is this assumption correct?

A) Yes, because the API rejects any first response carrying stop_reason "end_turn" and requires the client to resend the request

B) No, but only because the Messages API silently inserts a placeholder tool_use block whenever no real tool call was necessary

C) No, stop_reason "end_turn" on the first response is a valid immediate completion whenever Claude can answer without needing any tool

D) Yes, the loop must always force at least one tool_use round trip before accepting stop_reason "end_turn" as genuine completion

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**  
**C번**: No, stop_reason "end_turn" on the first response is a valid immediate completion whenever Claude can answer without needing any tool

**정답 및 해설:**


**핵심 개념**: Agent Loop Completion & Direct Answer Capability (에이전트 루프 종료 및 직접 응답 능력)  
Claude 및 Messages API 기반의 에이전트 루프는 매 턴마다 도구 호출(`tool_use`)을 강제하지 않습니다. 모델이 도구의 도움 없이도 자신의 자체 지식만으로 질문에 자연어로 완전히 답변할 수 있다고 판단하면, 첫 턴부터 `stop_reason: "end_turn"`과 함께 텍스트 결과만을 즉시 반환하며 루프를 정상 종료합니다.

**문제 상황 분석:**
- 에이전트가 단순하고 즉시 답변 가능한 지원 티켓 질문을 수신함.
- Claude는 도구를 사용하지 않고 첫 요청에서 `stop_reason: "end_turn"`과 일반 텍스트 응답을 반환함.
- 엔지니어는 "에이전트 루프가 종료되려면 최소 1번 이상의 도구 호출을 거쳐야 한다"며 이를 버그로 오해함.

**C번이 정답인 이유:**  
에이전트 루프에서 도구 사용은 필수 의무 사항이 아니라 필요에 의해 선택되는 수단입니다. 도구 호출 없이 해결 가능한 간단한 쿼리의 경우, 첫 번째 응답에서 `stop_reason: "end_turn"`이 반환되는 것은 지극히 정상적인 즉시 완료(Immediate completion) 패턴이므로 엔지니어의 가정은 틀렸습니다.

**오답 분석:**
- Option A (오답): Messages API는 첫 번째 응답이 `end_turn`이라고 해서 요청을 거부하거나 재전송을 요구하지 않습니다.
- Option B (오답): Messages API는 도구를 사용하지 않을 때 임의로 가짜(Placeholder) `tool_use` 블록을 생성해 넣지 않습니다.
- Option D (오답): 에이전트 루프가 정식 완료로 인정받기 위해 무조건 1회 이상의 도구 왕복 호출을 거쳐야 할 필요는 없습니다.

---

## 33번 문제

### 1. 문제 원문

A platform team is building a shared agentic-loop library for several internal agents. One engineer proposes checking `response.stop_reason in ("tool_use", "end_turn")` and treating both values as "continue the loop." What is wrong with treating "end_turn" as a continue condition in this shared loop?

A) "end_turn" is only ever returned on the very first request in a conversation, so treating it as continue causes an infinite loop from turn two onward

B) "end_turn" marks a billing boundary in the API, so continuing past it causes duplicate charges for tokens that were already generated

C) "end_turn" and "tool_use" cannot both be valid stop_reason values for the same account, so the proposed condition would always evaluate to false

D) "end_turn" means Claude produced a final response with no further tool request, so continuing on it sends requests after the task is already done

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**  
**D번**: "end_turn" means Claude produced a final response with no further tool request, so continuing on it sends requests after the task is already done

**정답 및 해설:**


**핵심 개념**: Messages API의 `stop_reason` 종류 및 Agentic Loop 제어  
- `stop_reason: "tool_use"`: 모델이 도구를 실행하고자 하므로 클라이언트가 도구를 호출한 뒤 그 결과(`tool_result`)를 모델에 전송하여 대화/루프를 계속 이어가야 함을 의미합니다.
- `stop_reason: "end_turn"`: 모델이 도구 호출 없이 텍스트 응답 생성을 정상적으로 마쳤거나, 요청된 작업 완수를 위한 최종 답변을 생성을 완료했음을 의미합니다. 즉, 에이전트 루프의 **종료 조건(Termination condition)**입니다.

**문제 상황 분석:**
- 공유 에이전트 루프 라이브러리를 작성 중인 엔지니어가 `stop_reason`이 `"tool_use"`일 때뿐만 아니라 `"end_turn"`일 때도 루프를 계속 돌리도록 조건을 설정함.
- `"end_turn"`은 태스크가 성공적으로 완료되어 모델이 유저에게 최종 답변을 전달한 상태를 나타냄.
- 이를 계속 조건으로 판단하면 태스크가 이미 끝났음에도 불구하고 불필요하게 다음 요청을 모델에게 재전송하는 오류가 발생함.

**D번이 정답인 이유:**  
`"end_turn"`은 Claude가 추가적인 도구 호출 없이 최종 답변 생성을 완료했다는 신호입니다. 따라서 이를 루프 지속 조건으로 사용할 경우, 작업이 이미 끝났음에도 무의미하게 추가 API 요청을 전송하게 되므로 잘못된 설계입니다.

**오답 분석:**
- Option A (오답): `"end_turn"`은 첫 번째 요청뿐만 아니라 도구 실행 결과를 전달받은 뒤의 턴 등 작업이 완료되는 어느 턴에서나 반환될 수 있습니다.
- Option B (오답): `"end_turn"`은 요금 청구 경계(billing boundary)를 나타내거나 토큰 중복 청구를 유발하는 개념이 아닙니다.
- Option C (오답): `"end_turn"`과 `"tool_use"`는 계정과 상관없이 모든 Anthropic API 사용 환경에서 반환되는 가장 기본적인 표준 `stop_reason` 값들입니다.

---

## 34번 문제

### 1. 문제 원문

A content pipeline generates a product description, then always runs it through the same brand-tone checker, then always runs it through the same profanity filter, regardless of what the description says. A designer proposes replacing this with an orchestrator that dynamically decides, based on the description's content, whether to run the tone checker or the profanity filter first. What is the strongest critique of this proposal?

A) Because both checks always run in the same fixed order regardless of content, a prompt chain already handles this predictably; introducing a dynamic orchestrator adds unnecessary complexity and latency without improving the outcome.

B) A dynamic orchestrator is necessary because product descriptions vary in length, something a fixed chain is fundamentally unable to accommodate.

C) Dynamic orchestration should be adopted anyway, since it always produces better brand-tone results than any fixed check order can ever achieve.

D) The profanity filter cannot function correctly unless it always runs before the tone checker in every possible pipeline design imaginable.

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**  
**A번**: Because both checks always run in the same fixed order regardless of content, a prompt chain already handles this predictably; introducing a dynamic orchestrator adds unnecessary complexity and latency without improving the outcome.

**정답 및 해설:**


**핵심 개념**: Over-engineering in Agentic Workflows (Prompt Chaining vs Dynamic Orchestration)  
에이전트 워크플로를 설계할 때 결정론적이고 단순한 작업 단계(예: A 실행 후 B 실행)는 고정된 **프롬프트 체인(Prompt Chain)** 형태로 구성하는 것이 가장 비용 효율적이고 예측 가능하며 빠릅니다. 조건 판단이 불필요한 단순 단계에 LLM 기반의 **동적 오케스트레이터(Dynamic Orchestrator)**를 도입하는 것은 오버엔지니어링이며 불필요한 비용, 지연 시간(Latency), 불확실성을 가중시킵니다.

**문제 상황 분석:**
- 현재 파이프라인: 제품 설명 생성 → 브랜드 톤 검사 → 비속어 필터 순서로 '내용에 상관없이 항상 동일한 순서'로 실행됨.
- 디자이너의 제안: 내용에 따라 두 필터의 실행 순서를 동적으로 결정하는 오케스트레이터를 도입하자는 제안.
- 순서를 동적으로 바꿀 실질적인 비즈니스 실익이나 요구사항이 없음에도 불구하고 런타임 동적 판단 레이어를 추가하려는 상황.

**A번이 정답인 이유:**  
두 검사 단계가 결국 모두 실행되어야 하고 고정된 순서로 처리해도 문제가 없다면, 기존의 단순 프롬프트 체인만으로도 완벽하게 예측 가능한 결과를 만들어냅니다. 여기에 동적 오케스트레이터를 도입하면 결과를 개선하지도 못하면서 불필요한 LLM 호출로 인한 지연 시간(Latency)과 시스템 복잡성만 커지게 되므로 가장 타당하고 강력한 비판입니다.

**오답 분석:**
- Option B (오답): 프롬프트 체인은 텍스트 입력의 길이 변동을 자연스럽게 처리할 수 있습니다. 텍스트 길이 차이 때문에 동적 오케스트레이터가 필수적이라는 주장은 기술적으로 틀렸습니다.
- Option C (오답): 동적 오케스트레이션이 항상 고정 순서보다 더 나은 결과를 낸다는 주장은 사실이 아니며, 문제에 대한 비판이 아니라 오히려 오케스트레이터 도입을 옹호하는 잘못된 주장입니다.
- Option D (오답): 비속어 필터가 '모든 가능한 파이프라인 설계'에서 반드시 톤 검사기보다 먼저 실행되어야만 하는 절대적인 이유나 제약은 존재하지 않습니다.

---

## 35번 문제

### 1. 문제 원문

A coordinator agent is configured with allowedTools set to ["Read", "Grep", "Glob"] and defines a "research-assistant" subagent in its agents map. When the coordinator tries to delegate a task to research-assistant, every invocation halts on a permission prompt instead of running automatically. What is the most likely cause and fix?

A) The subagent's tools array lists more permissions than the coordinator holds, so the runtime blocks the escalation until an operator confirms it manually

B) The coordinator's system prompt does not mention the subagent by name, so the permission layer treats each delegation as an unrecognized action requiring review

C) The subagent invocation tool, Task, is not listed in allowedTools, so each spawn attempt requires manual approval; add Task to allowedTools to auto-approve subagent calls

D) The research-assistant definition is missing a model field, so the runtime cannot select a default model and pauses for confirmation before every call

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**  
**C번**: The subagent invocation tool, Task, is not listed in allowedTools, so each spawn attempt requires manual approval; add Task to allowedTools to auto-approve subagent calls

**정답 및 해설:**


**핵심 개념**: Agent Subagent Delegation Tool (`Task` Tool) & `allowedTools`  
에이전트 프레임워크(Claude Code SDK / Agent SDK)에서 코디네이터가 하위 서브에이전트를 생성하거나 작업을 위임할 때, 내부적으로 `Task` 도구를 호출합니다. 수동 확인 창(Permission Prompt) 없이 자동으로 서브에이전트를 호출/실행하려면, 코디네이터의 자동 승인 도구 목록인 `allowedTools`에 `Task` 도구가 포함되어 있어야 합니다.

**문제 상황 분석:**
- 코디네이터의 `allowedTools` 배열에는 `["Read", "Grep", "Glob"]`만 지정되어 있음.
- 서브에이전트(`research-assistant`)로 작업을 위임할 때마다 자동 실행되지 않고 권한 확인 프롬프트(Permission Prompt)가 계속 출력됨.
- 이는 작업을 위임하는 도구(`Task` 도구) 자체가 `allowedTools`에 등록되어 있지 않아 런타임이 이를 매번 수동 승인 대상 작업으로 판단하기 때문임.

**C번이 정답인 이유:**  
서브에이전트를 생성 및 실행하는 하위 호출은 내부적으로 `Task` 도구 실행으로 다루어집니다. `allowedTools` 목록에 `Task`가 빠져 있으면 런타임은 위임 시도 때마다 사용자/작업자의 수동 승인을 요구하게 됩니다. 따라서 `allowedTools` 배열에 `Task`를 추가해 주는 것이 정확한 원인 파악 및 해결책입니다.

**오답 분석:**
- Option A (오답): 서브에이전트의 권한이 코디네이터보다 많아 발생하는 이슈가 아니라, 위임 호출 도구 자체의 자동 승인 설정 누락이 원인입니다.
- Option B (오답): 권한 레이어가 시스템 프롬프트 내 서브에이전트 이름 언급 여부를 검사하여 승인 여부를 결정하지는 않습니다.
- Option D (오답): `model` 필드가 누락되었을 경우 프레임워크가 기본 모델(Default Model)을 적용하거나 설정 오류를 내며, 호출할 때마다 승인 확인 팝업을 띄우지 않습니다.

---

## 36번 문제

### 1. 문제 원문

An architect is building a client-side agent loop against the Messages API for a data-cleanup task. The first response has stop_reason set to "tool_use" and contains a tool_use block requesting a file-listing tool. What should the loop do next to correctly continue the agentic execution?

A) Run the tool locally, write its output only to an application log file, and resend the prior conversation exactly as it stood before

B) Hold off on running the requested tool until Claude produces assistant text describing exactly what output it expects the tool call to return

C) Append only the tool_use block to history and send a new request with just the original prompt, dropping the tool result needed to interpret it

D) Execute the requested tool, append a tool_result block tagged with the tool_use_id, and send the full updated conversation back to Claude

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**  
**D번**: Execute the requested tool, append a tool_result block tagged with the tool_use_id, and send the full updated conversation back to Claude

**정답 및 해설:**


**핵심 개념**: Messages API Agentic Loop & Tool Result Handling (도구 결과 처리 및 에이전트 루프)  
Anthropic Messages API 기반 에이전트 루프에서 모델이 `stop_reason: "tool_use"` 응답을 반환하면, 클라이언트는 다음과 같은 순서로 루프를 이어가야 합니다:
1. 요청된 도구를 로컬 환경에서 실행합니다.
2. 실행 결과 데이터를 해당 도구 요청의 `id`(`tool_use_id`)와 매칭되는 `tool_result` 블록으로 작성합니다.
3. Assistant의 `tool_use` 응답 메시지와 User의 `tool_result` 응답 메시지를 기존 대화 이력(History)에 누적 덧붙여(Append) 전체 업데이트된 메시지 배열을 API에 다시 전송합니다.

**문제 상황 분석:**
- 데이터 정리 작업을 수행 중인 클라이언트 측 에이전트 루프가 첫 턴에서 Claude로부터 `stop_reason: "tool_use"` 응답을 수신함.
- 응답 내용에는 파일 목록 조회를 위한 `tool_use` 블록이 포함되어 있음.
- 에이전트 흐름을 정상적으로 이어나가기 위해 클라이언트 코드가 취해야 하는 표준 API 프로토콜 절차를 선택해야 함.

**D번이 정답인 이유:**  
요청된 도구를 실제로 실행한 뒤, 실행된 결과를 해당 요청의 `tool_use_id`와 연결하여 `tool_result` 블록으로 생성하고, 이를 포함해 업데이트된 전체 대화 기록을 Claude에 다시 전달하는 것이 Anthropic Messages API의 정석적인 도구 호출 루프(Tool Use Round-Trip) 방식입니다.

**오답 분석:**
- Option A (오답): 도구 실행 결과를 로컬 로그 파일에만 기록하고 모델에게 이전 대화만 그대로 재전송하면 모델은 도구 실행 결과를 알 수 없어 작업 진행이 중단되거나 동일한 도구 호출을 반복합니다.
- Option B (오답): `tool_use` 블록이 수신되었다면 이미 도구 실행 정보(매개변수 등)가 충분히 전달된 상태이므로 추가적인 설명 텍스트 생성을 기다릴 필요 없이 즉시 도구를 실행해야 합니다.
- Option C (오답): 도구 결과를 삭제한 채 원본 프롬프트만 다시 보낼 경우 모델이 요청한 도구 호출에 대한 응답이 전달되지 않아 API 응답 오류가 발생하거나 원하는 결과를 얻을 수 없습니다.

---

## 37번 문제

### 1. 문제 원문

An agent connects to two MCP servers named "billing" and "inventory". An architect wants a single PreToolUse hook to run for every tool exposed by the "billing" server, without matching any tool from "inventory" or any built-in tool like Bash or Read. Which matcher achieves this?

A) `^mcp__`

B) `mcp__billing__.*`

C) `billing`

D) `mcp__billing`

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**  
**B번**: `mcp__billing__.*`

**정답 및 해설:**


**핵심 개념**: MCP Tool Naming Convention & Regex Matcher Pattern  
Claude Agent SDK 및 MCP(Model Context Protocol) 연동 환경에서 MCP 서버가 제공하는 도구들은 `mcp__<server_name>__<tool_name>` 형태의 네임스페이스 규칙으로 이름이 지정됩니다. 특정 MCP 서버의 모든 도구만을 타겟팅하여 훅(Hook)을 적용할 때는 와일드카드 정규식 패턴인 `mcp__<server_name>__.*` 패턴을 사용합니다.

**문제 상황 분석:**
- 에이전트에 "billing"과 "inventory"라는 두 개의 MCP 서버가 연결되어 있음.
- "billing" 서버가 노출하는 모든 도구에 대해서만 `PreToolUse` 훅이 작동하도록 설정하려고 함.
- "inventory" 서버의 도구 및 `Bash`, `Read` 같은 내장(Built-in) 도구는 매칭에서 제외되어야 함.

**B번이 정답인 이유:**  
"billing" MCP 서버에서 제공하는 도구들의 네임스페이스 형식은 `mcp__billing__<tool_name>`이 됩니다. 정규식 패턴 `mcp__billing__.*`을 매처로 지정하면 `mcp__billing__`으로 시작하는 모든 도구 명칭을 정확히 일치시키며, "inventory" 서버의 도구(`mcp__inventory__.*`)나 내장 도구(`Bash`, `Read`)는 제외시킵니다.

**오답 분석:**
- Option A (오답): `^mcp__` 패턴은 "billing" 서버뿐만 아니라 "inventory" 서버를 포함한 모든 MCP 서버의 도구들을 전부 매칭하므로 조건에 맞지 않습니다.
- Option C (오답): `billing` 문자열 단독 지정은 MCP 도구의 네임스페이스 규칙(`mcp__billing__<tool_name>`)과 일치하지 않아 의도한 도구들을 올바르게 포착할 수 없습니다.
- Option D (오답): `mcp__billing`은 뒤에 와일드카드 패턴(`__.*`)이 빠져 있어 `mcp__billing__create_invoice`와 같은 개별 도구명을 완벽히 매칭하지 못합니다.

---

## 38번 문제

### 1. 문제 원문

A billing MCP server exposes several tools: issue_refund, void_authorization, and apply_credit, all of which move money and should be gated behind the same identity-verification check. Writing three nearly identical PreToolUse hooks, one per tool name, would work but creates duplication the architect wants to avoid. What matcher approach covers all three with one hook registration, without also matching unrelated read-only tools from the same server?

A) No matcher at all, relying on the assumption that hooks without a matcher only fire for the subset of tools that historically move money

B) A regex matcher such as "mcp__billing__(issue_refund|void_authorization|apply_credit)" naming the three money-moving tools within the billing server's namespace

C) A matcher of "*" restricted afterward by giving the hook a five-second timeout, since a shorter timeout value narrows down which tools the hook actually applies to

D) The matcher "mcp__billing" by itself, since any matcher beginning with the server's name automatically covers every single tool that server exposes

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**  
**B번**: A regex matcher such as "mcp__billing__(issue_refund|void_authorization|apply_credit)" naming the three money-moving tools within the billing server's namespace

**정답 및 해설:**


**핵심 개념**: MCP Tool Namespace & Regex Pattern Matching  
MCP(Model Context Protocol) 환경에서 도구 이름은 `mcp__<server_name>__<tool_name>`의 네임스페이스 규칙을 따릅니다. 동일 서버 내의 여러 특정 도구들만을 선택적으로 지정하려면 OR 연산자(`|`)를 사용한 정규식(Regex) 매처 패턴을 활용하여 중복 코드 등록 없이 단일 훅으로 통합 관리할 수 있습니다.

**문제 상황 분석:**
- `billing` MCP 서버에서 자금을 이동시키는 3가지 도구(`issue_refund`, `void_authorization`, `apply_credit`)에 동일한 신원 검증 훅을 적용해야 함.
- 훅을 3번 따로 등록하는 중복 작성을 피하고 단 1회의 훅 등록으로 처리해야 함.
- 동일한 `billing` 서버에 존재하는 다른 읽기 전용(Read-only) 도구들은 매칭 대상에서 제외되어야 함.

**B번이 정답인 이유:**  
`mcp__billing__(issue_refund|void_authorization|apply_credit)`과 같이 정규식 파이프(`|`) 기호를 사용하면, `billing` 서버의 네임스페이스 하위에서 특정 3개 도구만을 정확히 선별하여 단 하나의 훅으로 매칭할 수 있습니다. 읽기 전용 도구들은 그룹화 패턴에 포함되지 않으므로 영향받지 않습니다.

**오답 분석:**
- Option A (오답): 매처가 없는 훅이 자금을 이동시키는 도구만을 알아서 감지하여 실행된다는 가정은 잘못되었습니다. 매처가 없으면 모든 도구에 적용되거나 올바르게 동작하지 않습니다.
- Option C (오답): 와일드카드 `*` 매처를 사용하면 모든 도구가 매칭되며, 타임아웃 설정은 훅의 적용 대상 도구 범위를 필터링하는 기능이 아닙니다.
- Option D (오답): `mcp__billing` 단독 지정은 정규식 규칙상 뒤의 도구 명칭을 정확히 식별하지 못할 뿐만 아니라, 서버의 모든 도구(읽기 전용 도구 포함)를 매칭하려 시도하게 되므로 조건에 부합하지 않습니다.

---

## 39번 문제

### 1. 문제 원문

A coordinator's prompt says only: "Use the code-reviewer agent to check the authentication module." The team wants to guarantee code-reviewer is invoked rather than risk Claude answering the review directly, since automatic delegation based on the description field has been unreliable for this task in the past. Does this prompt achieve that guarantee, and why?

A) Yes, but only if the description field is also removed from the AgentDefinition, since a populated description field always overrides an explicit name mention.

B) No, the prompt alone is not a guaranteed invocation. While explicitly asking for the code-reviewer agent influences the model, it does not force its use; the system may still respond directly. To reliably enforce delegation, you must use a programmatic constraint such as setting the `tool_choice` parameter to that subagent or using the dedicated subagent invocation syntax (e.g., `@code-reviewer` in Claude Code).

C) Yes, naming the subagent by name in the prompt is explicit invocation, which bypasses automatic description-based matching and directly invokes that subagent.

D) No, explicit invocation by name only works for built-in subagents like the general-purpose agent, not for custom AgentDefinition entries like code-reviewer.

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**  
**B번**: No, the prompt alone is not a guaranteed invocation. While explicitly asking for the code-reviewer agent influences the model, it does not force its use; the system may still respond directly. To reliably enforce delegation, you must use a programmatic constraint such as setting the `tool_choice` parameter to that subagent or using the dedicated subagent invocation syntax (e.g., `@code-reviewer` in Claude Code).

**정답 및 해설:**


**핵심 개념**: Deterministic Subagent Invocation vs Prompt-based Guidance (확정적 서브에이전트 호출 대 프롬프트 기반 안내)  
LLM에게 프롬프트 텍스트로 특정 서브에이전트를 사용하라고 자연어로 지시하는 것은 확률적인 영향(Influence)만 줄 뿐, 100% 확정적(Deterministic)으로 서브에이전트 도구를 호출하도록 강제하지는 못합니다. 서브에이전트 호출을 보장하려면 API 레벨의 `tool_choice` 파라미터 제약 조건을 설정하거나, CLI/인터페이스의 전용 서브에이전트 멘션 구문(예: `@subagent-name`)을 명시해야 합니다.

**문제 상황 분석:**
- 개발팀은 `code-reviewer` 서브에이전트가 확실하게 실행되어 검토를 수행하기를 원함.
- 프롬프트에 단순 텍스트로 "code-reviewer 에이전트를 사용하여 인증 모듈을 검사하라"고 작성함.
- 프롬프트 텍스트만으로 서브에이전트 실행이 100% 보장되는지 여부 및 원인 파악 필요.

**B번이 정답인 이유:**  
프롬프트에 자연어로 작성된 지시사항은 모델의 생성 확률에 영향을 미치지만 하위 도구/서브에이전트 호출을 구동하는 물리적 제약이 되지 않습니다. 모델은 직접 응답을 선택할 수 있는 가능성이 여전히 남아있습니다. 완전한 호출 보장을 위해서는 `tool_choice` 파라미터 지정이나 CLI 수준의 `@code-reviewer`와 같은 구체적이고 프로그래밍된 제약 문법을 명시해야 합니다.

**오답 분석:**
- Option A (오답): `description` 필드를 제거한다고 해서 프롬프트의 자연어 텍스트 지시가 확정적 훅/도구 호출로 바뀌는 것은 아닙니다.
- Option C (오답): 자연어 프롬프트에서 이름을 언급하는 것은 '자연어 가이드'일 뿐, 자동 매칭을 우회하여 호출을 100% 보장하는 프로그래밍적 호출이 아닙니다.
- Option D (오답): 이름에 의한 명시적 지시는 커스텀 에이전트와 내장 에이전트 모두에 영향을 줄 수 있으나, 단지 '텍스트 지시'만으로는 둘 다 실행을 100% 강제하지 못한다는 점이 핵심입니다. 내장 에이전트에만 작동한다는 제한 설명은 틀렸습니다.

---

## 40번 문제

### 1. 문제 원문

An architect is reviewing a design where a large code review agent analyzes every file in a pull request in one combined prompt, then a second prompt asks it to summarize cross-file issues. Stakeholders report that the cross-file summary frequently misses real integration bugs that are visible when files are compared directly. What is the most likely cause, and what change would fix it?

A) The cross-file pass should be dropped and replaced with one combined pass that covers every file and every possible relationship in a single prompt

B) The two passes should run in reverse order, producing the cross-file summary before any individual file has actually been analyzed

C) The two-prompt structure is fine as is, but the model needs a longer system prompt that more precisely defines what an integration bug is

D) The first pass already dilutes attention across all files at once, so splitting it into per-file analyses gives the cross-file pass richer findings

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**  
**D번**: The first pass already dilutes attention across all files at once, so splitting it into per-file analyses gives the cross-file pass richer findings

**정답 및 해설:**


**핵심 개념**: Map-Reduce Pattern & Context Dilution (맵-리듀스 패턴 및 맥락 희석)  
LLM에 한 번에 지나치게 많은 정보(모든 파일)를 밀어 넣으면 모델의 주의력(Attention)이 분산되어 세부 사항을 놓치는 현상이 발생합니다. 이를 방지하기 위해 각 파일을 개별적으로 깊이 있게 선 분석(Map 단계)한 후, 그 결과들을 종합하여 파일 간 연관성 및 통합 버그를 분석(Reduce 단계)하는 구조가 훨씬 더 정확합니다.

**문제 상황 분석:**
- 첫 번째 단계에서 PR 내의 모든 파일을 단일 프롬프트에 몰아넣어 분석을 시도함.
- 두 번째 단계에서 첫 번째 결과를 바탕으로 파일 간(cross-file) 문제 요약을 시도함.
- 한 번에 너무 많은 파일 정보를 처리하느라 컨텍스트 내 맥락이 희석되어, 개별 파일의 상세 정보가 손실되고 결과적으로 교차 통합 버그를 포착하지 못하는 문제 발생.

**D번이 정답인 이유:**  
모든 파일을 한 번에 분석하는 첫 번째 패스는 컨텍스트 윈도우 내 모델의 주의력(Attention)을 희석시킵니다. 따라서 첫 번째 단계를 개별 파일 단위(per-file analysis)로 분할하여 깊이 있게 먼저 분석한 후, 생성된 풍부한 파일별 분석 결과를 바탕으로 파일 간 연동 문제(cross-file pass)를 교차 검토하도록 구조를 바꾸는 것이 올바른 해결책입니다.

**오답 분석:**
- Option A (오답): 단일 프롬프트에 모든 파일과 관계를 때려 넣는 방식을 계속 유지/확장하면 Attention 분산 및 Context 오염이 더 심해집니다.
- Option B (오답): 개별 파일에 대한 분석이 이뤄지기도 전에 교차 요약을 먼저 수행하는 순서 역전은 논리적으로 불가능하며 의미가 없습니다.
- Option C (오답): 원인은 시스템 프롬프트 표현의 명확성 부족이 아니라, 너무 많은 정보를 한 번에 넣어 생기는 컴퓨팅 주의력(Attention) 분산 및 정보 누락에 있습니다.

---

## 41번 문제

**1. 문제 원문**

A single support ticket reads: "I was double-charged for my subscription and I also need my shipping address updated before the next shipment." The agent has tools for billing lookups and for address changes. The architect wants both concerns resolved efficiently in one response rather than sequentially re-reading the ticket twice. What is the recommended approach?

A) Ask the customer to submit two separate tickets, since a single support workflow is only designed to track and resolve one concern per conversation

B) Skip the address change silently and resolve only the billing concern, since financial issues take unconditional precedence over account-detail updates

C) Decompose the ticket into the billing concern and the address concern, investigate both in parallel using shared context, then synthesize the findings into one unified resolution

D) Resolve the billing concern fully first, close that thread, then open an entirely new session with no memory of the ticket to investigate the address change

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Decompose the ticket into the billing concern and the address concern, investigate both in parallel using shared context, then synthesize the findings into one unified resolution

**정답 및 해설:**

**핵심 개념**: Multi-intent Resolution & Task Decomposition (다중 의도 해결 및 작업 분해)  
AI 에이전트 및 LLM 시스템 아키텍처에서 하나의 요청에 여러 독립적인 요청(청구 문의 + 주소 변경)이 포함된 경우, 이를 각각의 하위 작업으로 분해(Decompose)하여 병렬 처리하고 결과를 하나의 종합 응답으로 합성(Synthesize)하는 패턴이 가장 효율적입니다.

**문제 상황 분석:**
- 단일 지원 티켓 내에 "이중 청구 해결"과 "배송지 주소 변경"이라는 두 가지 독립된 요청이 동시에 존재합니다.
- 순차적으로 티켓을 두 번 다시 읽고 처리하는 방식은 토큰 소모와 응답 시간을 증가시켜 비효율적입니다.
- 아키텍터는 효율적인 단일 응답으로 두 문제를 처리하는 멀티태스킹/병렬 처리 접근법을 요구하고 있습니다.

**C번이 정답인 이유:**
C번은 티켓을 두 개의 작업(청구 문제, 주소 문제)으로 분해한 뒤, 공유 컨텍스트를 활용해 병렬로 조회를 진행하고, 최종 결과를 하나로 합성하여 전달하도록 제시합니다. 이는 컨텍스트 낭비를 줄이고 병렬 처리를 통해 빠른 응답 시간을 제공하는 가장 최선의 아키텍처 패턴입니다.

**오답 분석:**

- Option A (오답): 고객에게 티켓을 다시 나누어 제출하라고 요청하는 것은 사용자 경험(UX)을 심각하게 저해하는 방식입니다.
- Option B (오답): 주소 변경 요청을 임의로 무시하는 것은 고객의 요청을 완전하게 해결하지 못하므로 잘못된 접근입니다.
- Option D (오답): 첫 번째 문제를 해결한 뒤 컨텍스트(기억)가 없는 새 세션을 열어 처리하는 것은 불필요하게 세션을 분리하고 정보를 손실시키므로 비효율적입니다.

---

## 42번 문제

**1. 문제 원문**

An architect is choosing between prompt chaining and orchestrator-workers for a document-processing pipeline that converts a PDF invoice into a structured JSON record, validates required fields are present, and stores the record. Every invoice follows the same three-field schema and the steps never branch. What is the strongest argument for choosing prompt chaining here?

A) Orchestrator-workers setups cannot process PDF documents under any circumstances, making chaining the only technically feasible option here

B) Prompt chaining always produces more accurate JSON extraction results than any other decomposition pattern, no matter how predictable the task is

C) Chaining is required for any workflow with more than a single step, no matter how those steps depend on or relate to one another

D) The task decomposes cleanly into fixed, predictable subtasks always in the same order, giving chaining predictability without delegation overhead

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: The task decomposes cleanly into fixed, predictable subtasks always in the same order, giving chaining predictability without delegation overhead

**정답 및 해설:**

**핵심 개념**: Prompt Chaining vs. Orchestrator-Workers Architectural Patterns  
프롬프트 체이닝(Prompt Chaining)은 순차적이고 고정된 순서의 작업을 처리할 때 중앙 제어 오버헤드 없이 직관적으로 실행하는 방식입니다. 반면 오케스트레이터-워커(Orchestrator-Workers) 패턴은 동적 분기, 작업 분할, 위임(Delegation)이 필요한 복잡한 작업에 적합합니다.

**문제 상황 분석:**
- 모든 PDF 송장이 동일한 3개 필드 스키마를 따르며 조건부 분기(Branching)가 전혀 없습니다.
- 처리 과정(JSON 변환 -> 검증 -> 저장)이 항상 고정된 순서로 실행되는 순차적 워크플로우입니다.
- 동적으로 작업을 할당하고 판단할 오케스트레이터의 역할이 불필요한 단순 구조입니다.

**D번이 정답인 이유:**
작업이 동일한 순서의 고정되고 예측 가능한 하위 단계로 분해될 때, 프롬프트 체이닝은 중앙 오케스트레이터가 동적으로 판단하고 위임하는 불필요한 오버헤드(Delegation overhead) 없이 명확하고 안정적인 예측 가능성을 제공하므로 최선의 선택입니다.

**오답 분석:**

- Option A (오답): 오케스트레이터-워커 패턴이 PDF 문서를 처리하지 못한다는 제약은 거짓입니다. 멀티모달 모델 및 적절한 도구가 있다면 어떠한 아키텍처 패턴이든 PDF 처리가 가능합니다.
- Option B (오답): 체이닝이 항상 다른 모든 패턴보다 더 정확한 JSON을 추출한다는 기술적 보장은 없습니다. 절대적인 우위를 나타내는 단어('always')는 오답의 힌트입니다.
- Option C (오답): 단일 단계 이상의 모든 워크플로우에 무조건 체이닝이 필수적인 것은 아닙니다. 작업의 성격(동적 위임 필요성 등)에 따라 적절한 패턴을 선택해야 합니다.

---

## 43번 문제

**1. 문제 원문**

A team is building a "doc-reviewer" subagent that should be able to read and comment on documentation but must never be able to modify files, even accidentally. The coordinator itself has Read, Edit, Write, Grep, and Glob available. How should the doc-reviewer's AgentDefinition be configured to guarantee this constraint?

A) Give doc-reviewer the same tools as the coordinator, then rely on the description field to signal that the subagent is read-only in practice

B) Leave tools unset on the doc-reviewer definition and instead instruct it in the prompt field never to call Edit or Write during its review

C) Set tools to ["Read", "Grep"] on the doc-reviewer definition so it inherits only the listed read tools regardless of what the coordinator has available

D) Set the coordinator's own allowedTools to just ["Read", "Grep"] for the duration of the review so neither agent can access Edit or Write

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Set tools to ["Read", "Grep"] on the doc-reviewer definition so it inherits only the listed read tools regardless of what the coordinator has available

**정답 및 해설:**

**핵심 개념**: 최소 권한의 원칙 (Principle of Least Privilege) 및 에이전트 도구 제한 (Tool Scoping/Permissions)  
에이전트 기반 아키텍처에서는 보안과 하드 경계(Hard Constraint)를 보장하기 위해 프롬프트 지시사항(Soft Prompting)에 의존하는 대신, 에이전트에 명시적으로 전달하는 사용 가능 도구 목록(`tools`)을 제한해야 합니다. 서브에이전트 정의(`AgentDefinition`) 시 사용할 수 있는 도구를 제한하면 에이전트가 우발적으로 권한 외의 조작을 수행하는 것을 가드레일 차원에서 완벽히 차단할 수 있습니다.

**문제 상황 분석:**
- `doc-reviewer` 서브에이전트는 문서 조회만 가능해야 하며, 실수로라도 파일을 수정(`Edit`, `Write`)해서는 안 됩니다.
- 상위 에이전트인 `coordinator`는 `Edit`, `Write`를 포함한 전체 도구 권한을 보유하고 있습니다.
- 프롬프트 지시어에만 의존하지 않고 시스템적으로 완벽하게 파일 수정을 차단하는 명확한 제어 방법이 필요합니다.

**C번이 정답인 이유:**
서브에이전트의 `AgentDefinition`에서 `tools` 필드를 `["Read", "Grep"]`과 같이 필요로 하는 읽기 전용 도구로 명시적 제한(Explicit scoping)을 두게 되면, 상위 코디네이터가 어떤 권한을 가지고 있든 관계없이 서브에이전트에는 `Edit` 및 `Write` 도구 자체가 전달되지 않으므로 절대 파일이 수정될 수 없습니다.

**오답 분석:**

- Option A (오답): 모든 도구 권한을 주고 `description` 필드로 읽기 전용임을 나타내는 것은 시스템적 제약이 아닌 참고용 메타데이터에 불과하므로 실수로 인한 파일 변경을 막지 못합니다.
- Option B (오답): 프롬프트 지시(Prompting)로 수정을 금지하는 것은 LLM 환각이나 지시 미이행으로 인해 무너질 수 있는 "Soft Limit"에 불과하므로 absolute/guaranteed 제약조건을 만족시키지 못합니다.
- Option D (오답): 코디네이터 자체의 권한을 동적으로 좁히는 것은 코디네이터가 본래 수행해야 하는 다른 편집 작업까지 방해할 뿐만 아니라, 서브에이전트 자체의 독립된 권한 정의 표준 방식이 아닙니다.

---

## 44번 문제

**1. 문제 원문**

An architect defines a `performance-optimizer` subagent with the intention that the main Claude coordinator will delegate to it automatically whenever a user asks about slow database queries. In practice, the coordinator almost always answers query-tuning questions directly instead of delegating. The subagent definition's `prompt` field is detailed and technically accurate. What is the most likely reason automatic delegation is failing?

A) The `tools` field lists Bash and Read, which are too permissive for a subagent Claude expects to invoke only for read-only analysis tasks.

B) The subagent's `prompt` is written in the second person, which the delegation matcher treats as intended for the end user rather than the subagent.

C) The subagent's `description` field is vague or missing, so Claude has no trigger signal for when this subagent applies and defaults to handling the task itself.

D) The coordinator's own system prompt was not updated to reference `performance-optimizer`, so the runtime cannot resolve the subagent name at dispatch time.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: The subagent's `description` field is vague or missing, so Claude has no trigger signal for when this subagent applies and defaults to handling the task itself.

**정답 및 해설:**

**핵심 개념**: Subagent Routing & Agent Description Matching (서브에이전트 라우팅 및 설명 매칭)  
멀티 에이전트 시스템에서 메인 에이전트(코디네이터)가 특정 서브에이전트에 작업을 자동으로 위임(Delegation)할지 여부를 결정할 때 사용하는 핵심 기준은 서브에이전트 정의 내의 `description` 필드입니다. `prompt` 필드는 서브에이전트가 호출된 후 어떻게 작동할지를 정의하는 반면, `description` 필드는 라우터/코디네이터에게 "언제 이 에이전트를 호출해야 하는가"를 알려주는 트리거 역할을 합니다.

**문제 상황 분석:**
- `performance-optimizer` 서브에이전트의 `prompt` 필드는 기술적으로 정확하고 상세하게 작성되어 있습니다.
- 그러나 사용자가 쿼리 튜닝 질문을 할 때 코디네이터가 이를 서브에이전트로 라우팅하지 않고 자신이 직접 처리합니다.
- 서브에이전트 실행 내부 로직(`prompt`)은 유효하나, 라우팅 트리거 조건이 올바르게 전달되지 않고 있는 현상입니다.

**C번이 정답인 이유:**
`description` 필드가 모호하거나 누락되어 있으면 메인 코디네이터는 사용자의 요청(느린 쿼리 질문)이 해당 서브에이전트의 담당 영역인지 판단할 수 있는 트리거 신호를 얻지 못합니다. 이에 따라 라우팅 조건이 부합하지 않는다고 판단하고 자체적으로 요청을 직접 처리하게 됩니다.

**오답 분석:**

- Option A (오답): `tools` 권한의 범위가 넓다고 해서 코디네이터가 서브에이전트 호출 자체를 거부하거나 무시하지는 않습니다.
- Option B (오답): 프롬프트의 인칭 시점(2인칭 사용 등)은 에이전트 라우팅 여부를 결정하는 주요 트리거 메커니즘이 아닙니다.
- Option D (오답): 서브에이전트 기반 아키텍처에서는 서브에이전트 정의(등록) 파일에 의해 동적으로 검색 및 라우팅이 수행되므로, 메인 코디네이터의 시스템 프롬프트를 수동으로 매번 수정해 하드코딩할 필요가 없습니다.

---

## 45번 문제

**1. 문제 원문**

A coordinator calls the same "endpoint-finder" subagent twice in a row, once for the billing service and once for the notifications service, using two separate Task invocations without resuming a specific agent id. On the second call, the subagent has no awareness that a billing-service scan happened earlier and re-explains basic conventions it already covered. Why does this happen, and is it expected behavior?

A) Yes, expected: each invocation starts a fresh context unless a specific prior agent is explicitly resumed, so separate calls to the same agent type share no memory

B) Yes, this is expected, but only because the two calls targeted different services; invoking endpoint-finder twice for the same service would have shared memory automatically

C) No, this is a bug: all subagents invoked within the same coordinator session automatically share one combined context window across every Task call

D) No, this is a bug: subagent definitions cache their reasoning across calls automatically, so two invocations of endpoint-finder should share memory by default

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Yes, expected: each invocation starts a fresh context unless a specific prior agent is explicitly resumed, so separate calls to the same agent type share no memory

**정답 및 해설:**

**핵심 개념**: Subagent Lifecycle & Context Isolation (서브에이전트 생명주기와 컨텍스트 격리)  
서브에이전트 기반 시스템(예: Claude Code / Agent SDK)에서 각 Task 호출은 기본적으로 완전히 독립된 새로운(Fresh) 컨텍스트 상태에서 실행됩니다. 이전 서브에이전트 실행의 상태나 기억을 유지하려면 특정 에이전트 ID를 지정하여 명시적으로 세션을 재개(Resume)해야만 합니다.

**문제 상황 분석:**
- 코디네이터가 `endpoint-finder`라는 서브에이전트를 2회 연속 호출했습니다.
- 특정 `agent_id`를 재개(Resume)하지 않고 각각 두 개의 별도 Task로 호출했습니다.
- 두 번째 호출 시, 이전 청구 서비스 검색 이력을 알지 못하고 동일한 기초 설명을 반복했습니다.

**A번이 정답인 이유:**
서브에이전트는 개별 Task 실행 시 독립된 실행 환경을 가집니다. 이전 실행 상태(`agent_id`)를 명시적으로 이어받지 않으면 기본적으로 새로운 컨텍스트로 시작되므로, 이전 호출의 메모리를 기억하지 못하는 것은 버그가 아니라 정상적인 **예상 행동(Expected behavior)**입니다.

**오답 분석:**

- Option B (오답): 동일한 서비스를 대상으로 두 번 호출하더라도, `agent_id`를 재개하지 않는 한 상태/메모리가 자동으로 공유되지는 않습니다.
- Option C (오답): 모든 서브에이전트 호출이 컨텍스트 창을 자동으로 합쳐서 공유하지 않습니다. 컨텍스트 윈도우 크기 폭발을 막기 위해 기본적으로 차단 및 격리됩니다.
- Option D (오답): 서브에이전트 정의 수준에서 자동으로 추론 내용을 캐싱하거나 상태를 공유하지 않습니다.

---

## 46번 문제

**1. 문제 원문**

A coordinator delegates a task to a 'documentation-reviewer' subagent that should only read and comment on files, never modify them. During testing, the subagent unexpectedly edits a file it was reviewing. What configuration change prevents this?

A) Restrict the subagent's tools field to read-only tools like Read and Grep, omitting Edit and Write

B) Add a system prompt instruction telling the subagent not to modify files, without changing its tool access

C) Move the file-editing logic into the coordinator so the subagent never needs to call any tools at all

D) Lower the subagent's model tier so it is less capable of generating file-modification tool calls

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Restrict the subagent's tools field to read-only tools like Read and Grep, omitting Edit and Write

**정답 및 해설:**

**핵심 개념**: 최소 권한의 원칙 (Principle of Least Privilege) 및 도구 범위 제어 (Tool Scoping)  
에이전트 아키텍처에서 에이전트의 행동을 완벽하게 통제하고 부작용(Side Effects)을 방지하는 가장 신뢰성 높은 방법은 프롬프트 지시(Soft Limit)가 아닌, 사용 가능한 도구 목록(`tools`)에서 권한을 제거하는 것(Hard Limit)입니다.

**문제 상황 분석:**
- `documentation-reviewer` 서브에이전트는 파일을 읽고 코멘트만 작성해야 합니다.
- 테스트 과정에서 해당 서브에이전트가 파일 수정(`Edit`) 작업을 예기치 않게 수행했습니다.
- 프롬프트 지시만으로는 모델의 우발적인 도구 호출 및 행동을 100% 차단하기 어렵습니다.

**A번이 정답인 이유:**
서브에이전트의 정의 중 `tools` 필드에서 `Edit` 및 `Write` 도구를 제외하고 `Read`, `Grep` 등 읽기 전용 도구만 포함하도록 제한하면, 모델이 아무리 수정 명령을 생성하려 해도 실행할 도구 자체가 없으므로 원천적으로 파일 변경을 방지할 수 있습니다.

**오답 분석:**

- Option B (오답): 프롬프트 문구로만 금지하는 것은 소프트 가드레일에 불과하여 환각이나 예기치 않은 동작으로 파일 수정 도구를 호출하는 위험을 확실히 막지 못합니다.
- Option C (오답): 파일 읽기/검토를 해야 하는 서브에이전트에게 모든 도구 권한을 박탈하면 문서를 읽는 기본 작업조차 수행할 수 없게 됩니다.
- Option D (오답): 모델 성능(Tier)을 낮추면 프롬프트 이해도나 오판 가능성이 높아져 오히려 예기치 않은 동작이나 오류를 더 유발할 수 있으며, 하드웨어적인 제약 조건이 되지 못합니다.

---

## 47번 문제

**1. 문제 원문**

An architect wants to send a single follow-up question, 'summarize what we changed,' to an already-completed non-interactive session and capture the answer as structured data for a script to parse, without opening the interactive terminal UI. Which invocation fits this need?

A) claude --resume <session-id> and then type the follow-up question at the interactive prompt

B) claude --from-pr <number> "summarize what we changed" with no output format specified

C) claude -p --resume <session-id> --output-format json "summarize what we changed"

D) claude --continue --fork-session "summarize what we changed" piped into a JSON parser

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: claude -p --resume <session-id> --output-format json "summarize what we changed"

**정답 및 해설:**

**핵심 개념**: Claude Code CLI Flags & Non-interactive Session Resumption  
Claude Code CLI에서 이미 완료된 세션을 이어받아 단발성 작업을 수행하려면 옵션 플래그들의 역할을 올바르게 조합해야 합니다.
- `-p` / `--print`: 대화형 UI(Interactive Terminal)를 열지 않고 단발성 프롬프트를 실행 및 출력합니다.
- `--resume <session-id>`: 이전 세션의 대화 이력과 컨텍스트를 불러와 연결합니다.
- `--output-format json`: 스크립트나 외부 프로그램이 출력 결과를 구조화된 데이터(JSON)로 파싱할 수 있게 지정합니다.

**문제 상황 분석:**
- 이미 완료된 비대화형 세션의 컨텍스트를 그대로 재사용하여 후속 질문을 던져야 합니다 (`--resume <session-id>`).
- 대화형 터미널 UI를 열지 않고 일회성으로 처리해야 합니다 (`-p` 또는 `--print`).
- 스크립트 파싱을 위한 구조화된 데이터(JSON) 형태 출력이 필요합니다 (`--output-format json`).

**C번이 정답인 이유:**
`claude -p --resume <session-id> --output-format json "summarize what we changed"` 명령은 대화형 UI 오픈 없이(`-p`), 이전 세션 맥락을 이어받아(`--resume`), 입력된 질문을 처리하고 결과를 JSON 구조화 데이터(`--output-format json`)로 정확히 출력하므로 문제의 모든 조건을 완벽하게 충족합니다.

**오답 분석:**

- Option A (오답): `-p` 플래그 없이 `--resume`만 사용하면 대화형 터미널 UI가 열리게 되므로 "without opening the interactive terminal UI" 조건에 위배됩니다.
- Option B (오답): Pull Request 번호를 참조하는 `--from-pr` 플래그는 기존 세션 ID 기반 재개 기능이 아니며, 출력 형식도 지정되지 않아 파싱이 불가능합니다.
- Option D (오답): `--continue` 및 `--fork-session` 플래그 조합만으로는 대화형 터미널 생성을 차단하거나 JSON 구조화 출력을 보장하지 못합니다.

---

## 48번 문제

**1. 문제 원문**

An engineering lead wants an agent workflow that first generates a marketing blog post outline, then expands the outline into full prose, then proofreads the prose for grammar. Each stage's output is always exactly what the next stage needs, and the number of stages never varies. Which architectural choice best matches this scenario?

A) An adaptive investigation plan that generates new subtasks whenever the proofreading stage finds an issue

B) A single subagent with a general instruction to write and polish a blog post, leaving stage boundaries implicit within one response

C) A prompt chain with a checkpoint between each stage so a malformed outline or draft can be caught before the next stage proceeds

D) A dynamic orchestrator-workers setup that decides how many drafting stages to run based on the outline's content

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: A prompt chain with a checkpoint between each stage so a malformed outline or draft can be caught before the next stage proceeds

**정답 및 해설:**

**핵심 개념**: Prompt Chaining with Gatekeeper/Checkpoint Pattern (체크포인트가 포함된 프롬프트 체이닝)  
작업 단계의 순서가 일정하고 단계 수가 변하지 않으며(Deterministic & Sequential), 이전 단계의 출력이 다음 단계의 입력으로 전달되는 구조에는 **프롬프트 체이닝(Prompt Chaining)**이 가장 적합합니다. 여기에 각 단계 사이에 검증 체크포인트(Checkpoint/Gatekeeper)를 두면 잘못된 형식의 출력이 다음 단계로 전달되는 것을 사전에 방지할 수 있습니다.

**문제 상황 분석:**
- 개요 생성 -> 본문 작성 -> 문법 교정으로 이어지는 순차적이고 변하지 않는 3단계 워크플로우입니다.
- 단계의 수가 결코 변경되지 않으며, 각 단계의 출력 데이터가 다음 단계의 요구 입력과 정확히 일치합니다.
- 복잡한 동적 라우팅이나 위임 구조 없이 안정적이고 예측 가능한 실행 관리가 요구됩니다.

**C번이 정답인 이유:**
고정된 단계 구조를 가진 워크플로우에는 프롬프트 체이닝 패턴이 가장 효율적입니다. 특히 각 단계 사이에 체크포인트를 포함한 프롬프트 체이닝을 구성하면, 개요나 초안이 잘못 생성되었을 때 다음 단계로 진행되기 전에 이를 검증하고 잡아낼 수 있어 안정적인 파이프라인 출력을 보장합니다.

**오답 분석:**

- Option A (오답): 교정 단계에서 문제가 발견될 때마다 새로운 하위 작업을 동적으로 생성하는 방식은 단계 수가 고정되어 있다는 전제 조건에 어긋납니다.
- Option B (오답): 단일 프롬프트/서브에이전트 안에서 모든 단계를 암묵적으로 처리하면 각 단계별 제어 및 실패 시 복구가 불가능해지며, 명확한 단계 구분이 모호해집니다.
- Option D (오답): 개요 내용에 따라 단계 수를 동적으로 결정하는 오케스트레이터 방식은 단계 수가 변하지 않는 고정형 파이프라인 문제 조건("number of stages never varies")에 부합하지 않는 불필요한 오버헤드입니다.

---

## 49번 문제

**1. 문제 원문**

A team is tasked with adding comprehensive tests to a 200,000-line legacy codebase with no existing test suite and undocumented module boundaries. Which sequence of decomposition steps best reflects an adaptive strategy for this open-ended task?

A) Map the codebase structure to find modules and dependencies, identify high-impact gaps, then build a test plan that adjusts as dependencies surface

B) Write one exhaustive test file covering every function in the codebase in a single continuous pass before any tests are ever run

C) Have one subagent write every single test for the entire codebase in one uninterrupted session with no intermediate checkpoints along the way

D) Generate test files for every single source file in strict alphabetical order without first assessing how the modules actually relate to one another

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Map the codebase structure to find modules and dependencies, identify high-impact gaps, then build a test plan that adjusts as dependencies surface

**정답 및 해설:**


**핵심 개념**: 대규모 레거시 코드베이스 분석 및 적응적 분해 전략 (Adaptive Decomposition Strategy)
- 기존 테스트와 문서가 없는 20만 줄 분량의 대규모 코드베이스 작업을 수행할 때, 일괄 처리 방식(Big Bang Approach)은 높은 실패 위험을 초래합니다.
- 점진적으로 의존성을 파악하고 우선순위(High-impact)를 지정하며, 새로운 정보가 드러남에 따라 유연하게 계획을 수정하는 적응적 방식이 필수적입니다.

**문제 상황 분석:**
- 20만 줄 규모의 대형 레거시 코드베이스로, 사전 정보나 문서화된 모듈 경계가 없습니다.
- 기존 테스트 스위트가 전혀 없어 코드 작동 방식과 잠재적 버그 위험 요소를 파악하기 어렵습니다.
- 탐색과 작성을 병행하며 구조를 파악해야 하는 대표적인 개방형/불확실 과제(Open-ended task)입니다.

**A번이 정답인 이유:**
A번은 단계적으로 전체 구조 및 의존성을 파악(Mapping)하고, 영향도가 높은 영역부터 우선순위를 지정한 뒤, 작업을 진행하면서 새로 드러나는 의존성에 맞추어 계획을 유연하게 수정(Adjusts)하는 적응형(Adaptive) 프로세스를 정확히 제시합니다.

**오답 분석:**

- Option B (오답): 테스트를 한 번도 실행하지 않고 모든 함수를 한 번에 작성하는 빅뱅 방식은 피드백 루프가 없어 위험하며, 레거시 코드의 숨겨진 의존성 때문에 실패할 가능성이 매우 높습니다.
- Option C (오답): 중간 점검(Intermediate Checkpoint) 없이 단일 세션으로 전체 테스트 생성을 에이전트에게 전임하는 것은 컨텍스트 한계 및 오류 누적 문제를 일으킵니다.
- Option D (오답): 모듈 간 관계나 중요도를 고려하지 않고 순수 알파벳순으로 작성하는 방식은 의존성이 꼬여 효율적인 테스트 구현이 불가능합니다.

---

## 50번 문제

**1. 문제 원문**

An architect is scripting a build pipeline where each single prompt is a one-shot task with no follow-up question expected afterward. According to session-management guidance, what is the appropriate amount of session handling to add for this task?

A) Enable `fork_session` so a parallel branch is available if a follow-up becomes necessary

B) None beyond a single `query()` call, since no additional prompts will share context afterward

C) Capture the session ID and pass it to resume immediately after, to be safe

D) Set `continue_conversation=True` so a follow-up could be added later without refactoring

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: None beyond a single `query()` call, since no additional prompts will share context afterward

**정답 및 해설:**


**핵심 개념**: 에이전틱 SDK/API 세션 관리 및 원샷(One-shot) 프롬프팅
- 후속 질의응답이나 대화 이력 공유가 필요 없는 독립적·단발성(One-shot) 작업에는 세션 상태 유지 및 ID 추적 등의 오버헤드가 불필요합니다.
- 단일 호출 함수(예: `query()`)만으로 요청을 처리하고 세션 관리 기능을 생략하는 것이 시스템 자원과 코드 복잡성을 최적화하는 올바른 설계입니다.

**문제 상황 분석:**
- 빌드 파이프라인 내에서 실행되는 개별 프롬프트 작업입니다.
- 수행할 작업이 일회성(One-shot)이며, 이후 추가적인 후속 질문(Follow-up)이 발생하지 않는 구조입니다.
- 이전에 나눈 대화 맥락(Context)을 공유하거나 유지할 필요성이 전혀 없습니다.

**B번이 정답인 이유:**
후속 프롬프트와 컨텍스트를 공유하지 않는 완벽한 단발성 작업이므로, 세션 ID 추적, 세션 분기(Fork), 세션 재개(Resume) 등의 추가 처리가 일절 필요하지 않습니다. 기본 `query()` 단일 호출만 수행하는 것이 가이드라인에 부합하는 가장 최적화된 방식입니다.

**오답 분석:**

- Option A (오답): 후속 질문이 예상되지 않는 구조에서 병렬 분기를 위한 `fork_session`을 활성화하는 것은 불필요한 복잡성과 자원 낭비를 발생시킵니다.
- Option C (오답): 단발성 작업에서 안전을 이유로 세션 ID를 저장하고 즉시 재개하는 것은 상태가 필요 없는(Stateless) 작업에 불필요한 상태 관리를 적용하는 오버헤드입니다.
- Option D (오답): 대화를 이어가지 않는 일회성 파이프라인 작업에 나중을 대비해 `continue_conversation=True`를 설정하는 것은 사용하지 않는 기능을 켜두는 불필요한 접근입니다.

---

## 51번 문제

**1. 문제 원문**

An architect writes a PreToolUse hook with the regex matcher `/refund/` intending it to gate a single custom tool named `refund`. During a review, a colleague notices the matcher would also fire on a tool named `issue_refund_note` that only writes an internal comment and should never be gated. What is the cause and the correct fix?

A) The regex matcher `/refund/` is unanchored, so it matches any tool name containing the substring 'refund'. The fix is to anchor the regex with `^` and `$`: `/^refund$/`, ensuring it only matches the exact tool name `refund`.

B) Matchers can only target tool names that begin with the `mcp__` server prefix. A custom in-process tool like `refund` must be renamed to include this prefix before any matcher can reliably target it.

C) The hook fires on every single tool call by default unless a timeout value is explicitly configured. Adding a timeout would stop it from matching `issue_refund_note`.

D) The matcher `/refund/` uses a regular expression, but regular expression matchers in hooks are automatically anchored to match exactly, so it would only fire on the tool named exactly `refund`. The colleague's concern is unfounded; no fix is needed.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: The regex matcher `/refund/` is unanchored, so it matches any tool name containing the substring 'refund'. The fix is to anchor the regex with `^` and `$`: `/^refund$/`, ensuring it only matches the exact tool name `refund`.

**정답 및 해설:**


**핵심 개념**: 정규표현식 앵커링(Regex Anchoring) 및 훅 매칭 패턴
- 정규표현식에서 위치 앵커 문자(`^`: 문자열의 시작, `$`: 문자열의 끝)를 사용하지 않으면, 패턴이 포함된 모든 부분 문자열(Substring)을 매칭합니다.
- 특정 도구의 이름과 정확히 1:1 일치(Exact Match)하도록 훅 매처를 제한하려면 `/^패턴$/` 형태로 앵커링해야 의도치 않은 도구의 오작동 및 제어를 방지할 수 있습니다.

**문제 상황 분석:**
- 개발자가 `refund`라는 특정 도구의 실행을 제어(Gate)하기 위해 `/refund/` 정규표현식 매처를 등록했습니다.
- 앵커(`^`, `$`)를 지정하지 않아 `refund`라는 문자열이 들어간 다른 도구(`issue_refund_note`)까지 정규표현식 조건에 일치하게 됩니다.
- 제어 대상이 아닌 내부 주석용 도구까지 훅에 걸려 의도치 않은 매칭 오류가 발생했습니다.

**A번이 정답인 이유:**
앵커가 없는 `/refund/`는 부분 문자열 일치(Substring matching)를 수행하므로 `issue_refund_note`에도 조건이 들어맞게 됩니다. 문자열의 시작(`^`)과 끝(`$`)을 나타내는 앵커를 명시하여 `/^refund$/` 형태로 정규표현식을 작성해야만 정확히 `refund` 도구에만 매칭됩니다.

**오답 분석:**

- Option B (오답): 훅 매처가 `mcp__` 접두사를 가진 도구만 지정할 수 있다는 제약은 존재하지 않으며, 커스텀 도구 이름을 강제로 변경할 필요가 없습니다.
- Option C (오답): 훅 매칭 여부와 타임아웃(Timeout) 설정은 무관하며, 타임아웃을 설정한다고 해서 부분 문자열 매칭 패턴이 변경되지는 않습니다.
- Option D (오답): 정규표현식 매처는 자동으로 앵커링되지 않으므로 개발자가 직접 `^`와 `$`를 명시해야 합니다. 따라서 동료의 우려는 타당합니다.

---

## 52번 문제

**1. 문제 원문**

A coordinator dynamically builds a "security-reviewer" AgentDefinition and needs the strict variant of the review to use a noticeably more capable model than routine reviews, without changing the model used for the rest of the coordinator's own work. Which configuration achieves this?

A) Resume the coordinator's session with a different model argument each time a strict review is requested, then dispatch the subagent from that resumed session

B) Add the more capable model's name as an entry in the security-reviewer's tools array so the runtime treats it as an available capability for that call

C) Fork the coordinator's session before every strict review so the fork inherits a separate, upgraded default model for all subsequent subagent calls

D) Set the model field on the strict security-reviewer's AgentDefinition to the more capable model, leaving the coordinator's own model configuration untouched

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Set the model field on the strict security-reviewer's AgentDefinition to the more capable model, leaving the coordinator's own model configuration untouched

**정답 및 해설:**


**핵심 개념**: AgentDefinition의 독립적 모델 설정 (Agent Model Configuration)
- 에이전트 프레임워크(예: Claude Code SDK 등)에서 하위 에이전트(Subagent)는 각자의 `AgentDefinition` 개체 내에 독립적인 `model` 필드를 가집니다.
- 상위 에이전트(Coordinator)의 모델 설정을 건드리지 않고 개별 하위 에이전트만 고성능 모델을 사용하게 하려면, 해당 하위 에이전트의 정의(`AgentDefinition`) 내 `model` 필드만 원하는 모델로 지정하면 됩니다.

**문제 상황 분석:**
- 코디네이터 에이전트가 "security-reviewer" 하위 에이전트의 정의(`AgentDefinition`)를 동적으로 생성하는 상황입니다.
- 정기 검토와 달리 '엄격한 검토(strict variant)' 시에는 하위 에이전트가 더 뛰어난 모델을 사용해야 합니다.
- 조건으로 코디네이터 자체의 모델 설정은 변경되지 않고 그대로 유지되어야 합니다.

**D번이 정답인 이유:**
`AgentDefinition` 스키마에는 에이전트별 전용 모델을 명시할 수 있는 `model` 필드가 존재합니다. 엄격한 검토용으로 생성되는 `AgentDefinition` 내의 `model` 필드에만 고성능 모델을 지정하면, 코디네이터의 기존 모델 설정에 아무런 영향을 주지 않으면서 요구사항을 완벽하게 충족할 수 있습니다.

**오답 분석:**

- Option A (오답): 코디네이터의 세션을 다른 모델 인수로 재개(Resume)하면 코디네이터 본인의 모델 환경까지 변경되므로 "코디네이터의 모델 설정을 변경하지 않는다"는 조건을 위배합니다.
- Option B (오답): 모델 지정은 에이전트 속성(`model` 필드)에 설정하는 것이지 `tools` 배열에 도구 항목으로 추가하는 것이 아닙니다.
- Option C (오답): 세션을 분기(Fork)하여 상속 구성을 변경하는 복잡한 세션 조작은 불필요하며, 단지 하위 에이전트 정의 개체(`AgentDefinition`)의 모델 필드만 설정하는 것으로 해결됩니다.

---

## 53번 문제

**1. 문제 원문**

An architect delegates a task to a subagent using the Agent tool, expecting it to reference a decision the user made three turns earlier in the main conversation about which authentication provider to use. The subagent's response ignores that decision entirely and proposes a different provider. What is the most likely cause, and how should the architect fix it?

A) The subagent inherited a stale cached copy of the conversation and needs its session resumed to pick up the recent turns

B) The subagent's system prompt overrides user decisions by design, so the architect must disable its custom system prompt

C) The coordinator's tool permissions blocked the authentication context from being read, so the architect must widen the subagent's tool access

D) The subagent's context starts fresh each call, so the decision must be included directly in the Agent tool's prompt text

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: The subagent's context starts fresh each call, so the decision must be included directly in the Agent tool's prompt text

**정답 및 해설:**


**핵심 개념**: 하위 에이전트의 독립적 컨텍스트 격리 (Subagent Context Isolation)
- 에이전틱 아키텍처에서 Agent 도구로 호출되는 하위 에이전트(Subagent)는 기본적으로 메인 대화 세션의 전체 대화 이력을 자동으로 상속받지 않는 독립적인(Fresh/Isolated) 컨텍스트 상태로 시작합니다.
- 따라서 메인 대화에서 오간 핵심 결정 사항이나 이전 맥락 정보는 Agent 도구를 호출할 때 전달하는 프롬프트(Prompt Text)에 명시적으로 포함시켜 넘겨주어야 합니다.

**문제 상황 분석:**
- 메인 대화에서 사용자가 특정 인증 제공자(Authentication Provider)를 사용하기로 결정을 내렸습니다.
- 상위 에이전트가 Agent 도구를 사용하여 하위 에이전트에 작업을 위임했습니다.
- 하위 에이전트는 사용자의 결정을 무시하고 전혀 다른 인증 제공자를 제안했습니다. 이는 하위 에이전트가 메인 대화의 이전 맥락을 알지 못하기 때문입니다.

**D번이 정답인 이유:**
하위 에이전트 호출 시 컨텍스트는 매번 새롭게(Fresh) 시작됩니다. 상위 대화의 이력이 하위 에이전트에 자동으로 전달되지 않으므로, 3턴 전에 결정된 인증 제공자 관련 정보를 Agent 도구의 프롬프트 문자열 내에 직접 작성해서 전달해야만 하위 에이전트가 이를 인지하고 올바르게 작동할 수 있습니다.

**오답 분석:**

- Option A (오답): 캐시 문제가 아니며, 하위 에이전트의 기본 구조는 이전 메인 대화 이력을 상속하지 않고 독립 컨텍스트로 동작하는 것입니다.
- Option B (오답): 시스템 프롬프트가 사용자 결정을 일부러 무시하도록 설계되어 있다는 설명은 문제 상황의 원인이 아닙니다.
- Option C (오답): 도구 권한(Tool Permissions) 부족으로 인해 대화 컨텍스트를 읽지 못한 것이 아니며, 컨텍스트 전달은 도구 접근 권한의 문제가 아니라 프롬프트 입력의 문제입니다.

---

## 54번 문제

**1. 문제 원문**

An architect is building a custom session picker for an internal tool and needs a way to enumerate every session on disk for a repository along with reading a particular session's full message history, without shelling out to the interactive CLI picker. Which SDK-exposed functions fit this need?

A) `listSessions()` to enumerate sessions and `getSessionMessages()` to read a session's messages

B) `getSessionInfo()` to enumerate all sessions and `resume()` to read a session's messages

C) `fork_session()` to enumerate sessions and `continue()` to read a session's messages

D) `renameSession()` to enumerate sessions and `tagSession()` to read a session's messages

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: `listSessions()` to enumerate sessions and `getSessionMessages()` to read a session's messages

**정답 및 해설:**


**핵심 개념**: Agentic SDK 세션 관리 API (`listSessions`, `getSessionMessages`)
- SDK 기반의 애플리케이션에서 세션 저장소(디스크)를 다룰 때, CLI 인터랙션을 거치지 않고 직접 세션 목록과 세션 내 대화 기록을 조회할 수 있도록 헬퍼 함수를 제공합니다.
- `listSessions()`는 지정된 프로젝트/리포지토리에 존재하는 세션 목록을 반환하며, `getSessionMessages()`는 해당 세션 ID의 전체 대화/메시지 내역을 조회합니다.

**문제 상황 분석:**
- 내부 도구에서 대화형 CLI 세션 선택기를 직접 호출하지 않고 커스텀 세션 선택기(UI/기능)를 구현하고자 합니다.
- 저장소 디스크에 저장된 전체 세션 목록을 열거(Enumerate)해야 합니다.
- 선택된 특정 세션의 전체 메시지 이력(Full message history)을 불러와 조회해야 합니다.

**A번이 정답인 이유:**
세션 목록을 열거할 때는 직관적이고 명확하게 설계된 `listSessions()` 함수를 사용하고, 해당 세션의 전체 대화/메시지 내역을 읽어올 때는 `getSessionMessages()` 함수를 사용합니다. 두 함수는 세션 조회 및 이력 접근 요구사항을 정확히 충족시킵니다.

**오답 분석:**

- Option B (오답): `getSessionInfo()`는 단일 세션의 메타데이터 정보를 가져오는 함수이며, `resume()`은 대화 세션을 다시 재개하여 계속 진행하는 함수로 단순 메시지 조회용이 아닙니다.
- Option C (오답): `fork_session()`은 기존 세션을 분기하여 새 대화를 시작하는 함수이며, `continue()`는 세션을 이어 나가는 연산입니다. 세션 목록 열거 및 조회 기능이 아닙니다.
- Option D (오답): `renameSession()`은 세션의 이름을 변경하는 함수이고 `tagSession()`은 세션에 태그를 부착하는 메타데이터 수정 함수로, 목록 열거 및 메시지 읽기와 무관합니다.

---

## 55번 문제

**1. 문제 원문**

An architect registers three independent PreToolUse hooks for the same `charge_card` tool: one checks fraud signals, one checks the daily spending cap, and one checks account status. During a live call, the fraud-signal hook returns permissionDecision "deny" while the other two both return "allow". What happens to the tool call?

A) The call proceeds, because only the first hook registered in the PreToolUse array is evaluated and the remaining two hooks are skipped entirely

B) The call proceeds, because a majority of the registered hooks returned "allow" and the SDK resolves conflicting decisions by simple vote

C) The SDK raises a configuration error and halts the session, because hooks matched to the same tool are not permitted to return conflicting decisions

D) The call is blocked, because when multiple hooks disagree the most restrictive result applies and any single "deny" overrides the other hooks' "allow" decisions

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: The call is blocked, because when multiple hooks disagree the most restrictive result applies and any single "deny" overrides the other hooks' "allow" decisions

**정답 및 해설:**


**핵심 개념**: PreToolUse 훅의 가장 제한적인 결과 적용 원칙 (Most Restrictive Evaluation)
- 동일한 도구 호출에 대해 여러 개의 `PreToolUse` 훅이 등록된 경우, 보안 및 안전성 보장을 위해 거부권(Veto) 방식 또는 "가장 제한적인 결과 적용(Most Restrictive Principle)" 정책을 따릅니다.
- 다른 훅들이 모두 허용("allow")을 반환하더라도 단 하나의 훅이라도 거부("deny")를 반환하면 최종 권한 결정은 거부("deny")로 수렴하여 해당 도구 호출이 차단됩니다.

**문제 상황 분석:**
- `charge_card` 도구에 대해 총 3개의 독립적인 `PreToolUse` 훅이 실행되었습니다.
- 일일 지출 한도 훅과 계정 상태 훅은 각각 "allow"를 반환했습니다.
- 그러나 사기 신호 검사 훅이 "deny"를 반환했습니다.

**D번이 정답인 이유:**
보안 및 접근 제어 로직에서 복수의 보안 검사 훅이 충돌할 경우, 시스템의 안전을 보장하기 위해 가장 보수적이고 제한적인 결정이 우선 적용됩니다. 따라서 단 한 개의 "deny" 결정이라도 존재하는 순간 다른 훅들의 "allow" 결정보다 우선시되어 최종 도구 호출은 차단(Blocked)됩니다.

**오답 분석:**

- Option A (오답): 첫 번째 훅만 평가되고 나머지는 스킵되는 것이 아니라, 대상 도구에 매칭된 모든 훅이 평가됩니다.
- Option B (오답): 훅 결정 간의 충돌은 다수결(Simple vote) 방식으로 해결하지 않으며, 보안 제어에서 다수결 방식은 허점이 될 수 있습니다.
- Option C (오답): 여러 훅이 다른 결과를 내는 것은 정상적인 보안 검사 시나리오이며 설정 오류(Configuration error)를 일으키거나 세션을 중단시키지 않습니다.

---

## 56번 문제

**1. 문제 원문**

While a session is resumed via `--continue --fork-session` to try a riskier approach, the architect notices that a permission the original session had approved with 'allow for this session' is being re-prompted in the new branch. Why does this happen?

A) Session-scoped permission approvals do not carry over from the original session into a newly forked branch

B) Permission approvals expire automatically after a fixed number of turns, independent of forking

C) The `--fork-session` flag was combined incorrectly with `--continue` and should have been used with `--resume` instead

D) Forking always resets the working directory, which invalidates any previously granted tool permissions

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Session-scoped permission approvals do not carry over from the original session into a newly forked branch

**정답 및 해설:**


**핵심 개념**: 세션 범위 권한(Session-Scoped Permissions) 및 세션 분기(Forking) 동작 방식
- 'allow for this session' 승인은 특정 세션 식별자(Session ID)에 국한된 세션 전용(Session-scoped) 권한 승인입니다.
- `--fork-session` 플래그를 사용하여 새로운 브랜치/세션을 생성하면, 시스템은 안전성을 위해 대화 이력만 복사하고 기존 세션의 임시 권한 승인 상태는 새 세션으로 이전(Carry over)하지 않습니다.

**문제 상황 분석:**
- 개발자가 위험성이 높은 접근 방식을 시도하기 위해 `--continue --fork-session`을 이용하여 이전 세션을 별도의 브랜치로 분기했습니다.
- 원본 세션에서 'allow for this session'으로 승인했던 도구 권한이 새로 분기된 브랜치에서 다시 승인 요청(Re-prompt)되었습니다.
- 이는 분기된 세션이 새로운 세션 컨텍스트를 형성하면서 발생한 보안 메커니즘 현상입니다.

**A번이 정답인 이유:**
세션 범위(Session-scoped) 권한은 해당 특정 세션 내부에서만 유효합니다. `--fork-session`을 통해 새로 분기된 브랜치는 별개의 세션으로 취급되므로, 원본 세션에서 부여했던 '이 세션 동안 허용' 권한은 보안상의 이유로 새 세션에 자동으로 전달되지 않고 재승인을 요구하게 됩니다.

**오답 분석:**

- Option B (오답): 권한 승인은 고정된 턴 수(Fixed number of turns) 후에 만료되는 규칙을 따르지 않으며, 이번 재요청의 원인은 턴 수가 아니라 세션 분기입니다.
- Option C (오답): `--fork-session` 플래그는 기존 세션을 이어받아 분기할 때 `--continue`와 함께 올바르게 조합되어 사용될 수 있습니다.
- Option D (오답): 세션 분기(Forking)가 작업 디렉토리(Working directory)를 항상 초기화하는 것은 아니며, 디렉토리 변경 때문에 권한이 무효화되는 것도 아닙니다.

---

## 57번 문제

**1. 문제 원문**

A monitoring agent's loop executes a requested metrics-fetch tool and prepares the next request. The engineer building the payload includes the new `tool_result` but replaces the entire prior `messages` array with just that single `tool_result`, instead of appending it to the existing history. What will most likely go wrong when this request is sent?

A) The Messages API rejects the request with an authentication error, since `tool_result` blocks require a session token from the first call

B) The `tool_result` is silently converted into a system prompt, permanently altering Claude's instructions for every later turn

C) Claude loses the original prompt and the reasoning that led to the tool call, so it cannot correctly interpret what the result is answering

D) Claude automatically re-fetches the full prior conversation from server-side storage, so the replaced array has no practical effect

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Claude loses the original prompt and the reasoning that led to the tool call, so it cannot correctly interpret what the result is answering

**정답 및 해설:**


**핵심 개념**: Messages API의 무상태성(Statelessness) 및 컨텍스트 유지 구조
- Anthropic Claude의 Messages API는 무상태(Stateless) API로, 서버 측에서 이전 대화 이력을 자동으로 저장하거나 기억하지 않습니다.
- 에이전트 루프에서 도구 실행 결과(`tool_result`)를 돌려줄 때는 이전 사용자 질문, 모델의 도구 호출 의도(`tool_use`), 그리고 이에 대한 결과(`tool_result`)가 누적된 전체 `messages` 배열을 순서대로 포함하여 전송해야 컨텍스트가 유지됩니다.

**문제 상황 분석:**
- 엔지니어가 `messages` 배열에 새로운 `tool_result`를 추가(Append)하지 않고, 이전 대화 이력 전체를 덮어씌워 단일 `tool_result`만 전송했습니다.
- 이로 인해 이전 질문, 시스템 프롬프트 맥락, 모델이 왜 해당 도구를 호출했었는지에 대한 맥락(`tool_use`)이 전부 삭제되었습니다.

**C번이 정답인 이유:**
API는 무상태 방식이므로 이전 대화 기록이 지워지면 Claude는 원래 사용자의 요청이 무엇이었는지, 왜 이 도구 결과값이 돌아왔는지에 대한 맥락을 전혀 알 수 없게 됩니다. 따라서 수집된 도구 결과값을 제대로 해석하거나 유용한 답변을 생성할 수 없게 됩니다.

**오답 분석:**

- Option A (오답): `tool_result`가 세션 토큰 미비로 인해 인증 오류(Authentication error)를 발생시키지는 않습니다.
- Option B (오답): `tool_result`가 자동으로 시스템 프롬프트(System prompt)로 변환되는 동작 방식은 존재하지 않습니다.
- Option D (오답): Claude API는 무상태(Stateless)이므로 서버 측에 대화 기록을 자동으로 저장해 두었다가 전송되지 않은 이력을 다시 불러오는 기능(Re-fetch)이 없습니다.

---

## 58번 문제

**1. 문제 원문**

A session has already analyzed an authentication module in depth and produced a JWT-based redesign plan. The architect now wants to explore what an OAuth2-based redesign would look like using the same accumulated analysis as a starting point, but only if the JWT thread can still be resumed unchanged afterward. Which approach satisfies both requirements?

A) Start a brand-new session with no prior context and paste a short written summary of the JWT plan into the first prompt before asking about OAuth2

B) Resume the existing session directly and ask about OAuth2 in the same conversation, then resume it again afterward and ask it to disregard the OAuth2 detour

C) Continue the most recent session in the working directory, trusting that it preserves the JWT thread as a separate branch once a new topic is introduced

D) Resume the session with fork enabled to copy the current history into a new session id, then explore OAuth2 there while the original stays untouched

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Resume the session with fork enabled to copy the current history into a new session id, then explore OAuth2 there while the original stays untouched

**정답 및 해설:**


**핵심 개념**: 세션 포크(Session Forking) 메커니즘
- 기존 세션의 맥락(누적 분석 이력)을 그대로 출발점으로 이용하면서, 원본 세션의 상태를 훼손하지 않고 새로운 탐색이나 대안 실험을 진행하려면 **세션 포크(Forking)**를 사용해야 합니다.
- 포크 기능은 현재까지 누적된 대화 이력을 복사하여 새로운 세션 ID(New Session ID)를 생성하므로, 원본 세션은 변경되지 않은 상태로 보존됩니다.

**문제 상황 분석:**
- 세션에 이미 층층이 쌓인 심층 분석 컨텍스트(JWT 기반 계획)가 존재합니다.
- 요구사항 1: 누적된 분석 이력을 시작점으로 삼아 OAuth2 방안을 탐색해야 합니다.
- 요구사항 2: 원본 JWT 대화 스레드는 나중에 변경 없이 그대로 재개할 수 있어야 합니다 (원본 보존).

**D번이 정답인 이유:**
`fork` 옵션을 활성화하여 세션을 재개하면 기존 대화 맥락이 그대로 새 세션 ID로 복사되므로 누적 분석 이력을 활용할 수 있습니다. 동시에 새로운 대화 내용은 독립된 새 세션에 저장되므로, 원본 JWT 세션은 오염되지 않고 그대로 유지되어 향후 변경 없이 재개할 수 있습니다.

**오답 분석:**

- Option A (오답): 완전히 새로운 세션을 시작하고 요약본만 전달하면 지금까지 누적된 상세 분석 컨텍스트(Depth)를 상실하게 됩니다.
- Option B (오답): 동일한 세션에서 대화를 이어 나간 뒤 나중에 무시해 달라고 요청하는 것은 이전 컨텍스트를 지속적으로 오염시키며 완벽한 원본 보존이 불가능합니다.
- Option C (오답): 단순히 세션을 이어가는 것만으로는 새로운 주제가 들어왔을 때 알아서 별도의 브랜치로 자동 분리해 주지 않으므로, 명시적인 포크(Fork) 설정이 필요합니다.

---

## 59번 문제

**1. 문제 원문**

A developer implements a PreToolUse hook that gates the `process_refund` tool by checking a boolean flag `is_verified`. The flag is expected to be set to `true` by a separate `mark_verified` tool after a human reviewer approves a photo ID. In an incident, the `mark_verified` tool executed and the human reviewer explicitly rejected the ID, but due to a software bug the `is_verified` flag was incorrectly set to `true`. The PreToolUse hook consequently allowed `process_refund`, resulting in an unauthorized refund. What change to the PreToolUse hook would best prevent this category of failure?

* A) Add a PostToolUse hook on `process_refund` that verifies the flag again after the refund has been initiated, so it can reverse the transaction if the flag is invalid.
* B) Modify the PreToolUse hook to inspect the explicit verification result included in the `process_refund` tool call parameters, confirming that the human review expressly passed, instead of relying on a separate boolean flag that can be set incorrectly.
* C) Replace the model with a larger, more capable language model that can independently re-read the entire conversation and determine whether the human review actually succeeded, overriding the flag when necessary.
* D) Increase the timeout on the PreToolUse hook to re-check the flag periodically; the hook will eventually notice the review was incorrect and block the refund.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**B번**: Modify the PreToolUse hook to inspect the explicit verification result included in the `process_refund` tool call parameters, confirming that the human review expressly passed, instead of relying on a separate boolean flag that can be set incorrectly.

**정답 및 해설:**  
**핵심 개념**: Tool Hooking 및 상태 결합도 저하(Decoupling State Failure)  
에이전트 시스템에서 도구 호출을 검증할 때는 잘못 업데이트될 가능성이 있는 외부 공유 상태(간접 플래그)에 의존하기보다, 도구 호출 시 전달되는 직접적인 인자 및 명시적 검증 파라미터를 인스펙션(입력 검증)하는 것이 보안상 안전합니다.

**문제 상황 분석:**  
- `process_refund` 실행 전 검증 훅(PreToolUse)이 간접적인 상태 값인 `is_verified` 플래그에만 의존함.
- 검토자가 거부했음에도 별도 도구의 소프트웨어 버그로 인해 `is_verified`가 `true`로 오작동함.
- 결과적으로 잘못된 검증 플래그를 믿은 훅이 승인되지 않은 환불 처리 도구를 허용함.

**B번이 정답인 이유:**  
잘못 설정될 수 있는 제3의 플래그 변수에 의존하는 구조적 결함을 해결하려면, `process_refund` 호출 시 파라미터로 넘어오는 원천 검증 결과 데이터를 PreToolUse 훅이 직접 확인하도록 검증 로직을 강화해야 합니다. 이를 통해 오염되기 쉬운 상태 플래그로 인한 오류를 완전히 방지할 수 있습니다.

**오답 분석:**  
- **Option A (오답):** 이미 환불이 실행(PostToolUse)된 후 후속 조치를 취하는 방식은 부작용(Side-effect)을 수반하며, 오염된 동일한 플래그를 재검증하는 것은 근본적인 해결책이 아닙니다.
- **Option C (오답):** 모델 크기를 늘리는 것은 결정론적인 소프트웨어 상태 버그나 입력 검증 문제를 해결해주지 못하며, 비효율적이고 비용이 큽니다.
- **Option D (오답):** 타임아웃을 늘려 주기적으로 플래그를 다시 확인하더라도, 플래그를 만드는 소프트웨어 자체가 잘못 값을 썼다면 플래그 값은 변경되지 않으므로 문제를 해결할 수 없습니다.

---

## 60번 문제

**1. 문제 원문**

An architect is deciding between two designs for an incident-response agent: Design X lets Claude choose which diagnostic tool to call next based on the evolving conversation, while Design Y hardcodes a fixed sequence (check logs, then check metrics, then restart service) regardless of what earlier tool results reveal. Which statement correctly characterizes the tradeoff?

* A) Design X lets the model adapt its next action to intermediate findings, while Design Y is a fixed tree that ignores what earlier results show
* B) Design X and Design Y always produce identical conversation histories, differing only in which tool names appear in the system prompt text
* C) Design X requires disabling stop_reason inspection entirely, while Design Y depends on stop_reason to pick the next hardcoded step in its sequence
* D) Design X necessarily issues more tool_use blocks per request, because every model-driven loop always batches all available tools in one turn

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**A번**: Design X lets the model adapt its next action to intermediate findings, while Design Y is a fixed tree that ignores what earlier results show

**정답 및 해설:**  
**핵심 개념**: 자율적 LLM 에이전트(Dynamic Agent Loop) vs 고정 워크플로우(Deterministic Workflow)  
에이전트 설계 시 LLM이 중간 도구 실행 결과를 보고 스스로 다음 작업(Tool Call)을 판단하는 방식(동적/유연함)과, 사전 정해진 순서대로 도구를 실행하는 방식(정적/결정론적) 간의 트레이드오프를 묻는 문제입니다.

**문제 상황 분석:**  
- 설계 X: 대화 및 진단 결과 맥락에 맞춰 모델이 자율적으로 다음에 쓸 도구를 결정하는 동적(Dynamic) 구조
- 설계 Y: 이전 도구 결과와 무관하게 [로그 확인 -> 메트릭 확인 -> 서비스 재시작]이라는 하드코딩된 시퀀스만 따르는 정적(Static) 구조
- 두 설계 방식의 동작 특성 및 차이점을 가장 잘 서술한 선지를 선별해야 함

**A번이 정답인 이유:**  
설계 X는 실행 중간에 나오는 발견/결과(intermediate findings)에 따라 모델이 유연하게 다음 행동을 결정(adapt)하는 반면, 설계 Y는 이전 단계의 출력값이나 유의미한 정보를 반영하지 못하고 정해진 순서(fixed tree/sequence)대로만 실행되므로 올바른 트레이드오프 설명입니다.

**오답 분석:**  
- **Option B (오답):** 동적으로 도구가 선택되는 설계 X와 하드코딩된 시퀀스를 따르는 설계 Y의 대화 기록(conversation histories)은 도구 호출 및 반환값에 따라 완전히 달라지므로 "항상 동일하다"는 설명은 거짓입니다.
- **Option C (오답):** 모델 기반 에이전트 루프(설계 X)에서도 도구 사용 여부를 감지하기 위해 `stop_reason` (`tool_use` 등) 확인이 필수적이며, 이를 완전히 비활성화해야 한다는 설명은 틀렸습니다.
- **Option D (오답):** LLM은 단일 턴에서 필요한 도구만 선택적으로 호출할 수 있으며, 사용 가능한 모든 도구를 한 번에 배치(batch)로 무조건 다 호출해야 하는 것은 아닙니다.

---

## 61번 문제

**1. 문제 원문**

An architect is drafting the handoff protocol for cases where an agent must escalate mid-process to a human supervisor who cannot see the conversation. The draft template currently has one field: a free-text "notes" box the agent fills in however it sees fit. What is the strongest improvement to make the handoffs reliably useful?

* A) Keep the single free-text field but increase its maximum character limit so the agent has more room available to describe everything it happened to observe
* B) Keep the single free-text field but instruct the agent, via the system prompt, to always remember to mention the customer's name somewhere within its written notes
* C) Replace the free-text field with required structured fields for customer details, root cause analysis, and a recommended action, so every handoff contains the same essentials
* D) Remove the notes field entirely and have the human supervisor call the customer back so they can re-explain the entire situation again from the beginning

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**C번**: Replace the free-text field with required structured fields for customer details, root cause analysis, and a recommended action, so every handoff contains the same essentials

**정답 및 해설:**  
**핵심 개념**: 에이전트 핸드오프 설계(Human-in-the-Loop Handoff Protocol) 및 구조화된 데이터(Structured Data)  
인공지능 에이전트가 사람 관리자(Human Supervisor)에게 작업을 이관할 때, 대화 맥락을 보지 못하는 관리자가 신속하고 정확하게 상황을 파악할 수 있도록 표준화되고 구조화된 필수 필드(Structured Schema)를 제공하는 것이 핵심입니다.

**문제 상황 분석:**  
- 에이전트가 대화 중간에 대화 이력을 볼 수 없는 사람 관리자에게 작업을 이관(Escalate)해야 함.
- 기존 템플릿은 에이전트가 자유롭게 작성하는 하나의 텍스트 상자(Free-text)로 구성되어 있어 전달되는 정보의 일관성과 품질이 보장되지 않음.
- 핸드오프 정보의 신뢰성과 유용성을 극대화하기 위한 구조적 개선안을 찾아야 함.

**C번이 정답인 이유:**  
자유 형식(Free-text) 필드는 에이전트마다 작성하는 양식이나 누락하는 정보가 달라져 신뢰성이 떨어집니다. 이를 고객 정보, 원인 분석, 권장 조치와 같이 명확히 구분된 필수 구조화 필드(Required Structured Fields)로 바꾸면, 모든 이관 건에서 빠짐없이 동일한 핵심 정보를 일관되게 수집 및 전달할 수 있습니다.

**오답 분석:**  
- **Option A (오답):** 글자 수 제한만 늘린다고 해서 에이전트가 핵심 정보를 누락 없이 일관되게 작성한다는 보장이 없으며, 불필요하게 장황한 텍스트만 늘어날 수 있습니다.
- **Option B (오답):** 고객 이름 외에도 원인 분석, 조치 사항 등 필수 정보가 수두룩하며, 단순 시스템 프롬프트 지시만으로는 자유 형식 필드의 구조적 정보 누락 문제를 완벽히 해결할 수 없습니다.
- **Option D (오답):** 이전 대화 내용을 고객에게 처음부터 다시 설명하게 만드는 것은 고객 경험(CX)을 극도로 저해하는 비효율적인 방식입니다.

---

## 62번 문제

**1. 문제 원문**

A single response from Claude contains two tool_use blocks in the same turn: one requesting a currency-conversion tool and one requesting a tax-lookup tool, both needed to finish a pricing calculation. How should the loop handle this before sending the next request?

* A) Execute both requested tools and append a separate tool_result block for each, matching each result to its own tool_use_id, before continuing
* B) Merge both tool requests into a single tool_result block with one combined tool_use_id chosen arbitrarily from the two requests
* C) Send two entirely separate follow-up conversations to Claude, one addressing each tool_use block in isolation from the other
* D) Execute only the first tool_use block encountered and skip the second one, since the API always processes one tool request per turn

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**A번**: Execute both requested tools and append a separate tool_result block for each, matching each result to its own tool_use_id, before continuing

**정답 및 해설:**  
**핵심 개념**: 다중 도구 호출(Batch/Parallel Tool Use) 처리 및 `tool_use_id` 맵핑  
Claude API는 단일 응답(Turn) 내에서 여러 개의 도구를 동시에 호출할 수 있도록 병렬 도구 사용(Parallel Tool Use)을 지원합니다. 이 경우 애플리케이션 루프는 각 `tool_use` 블록을 모두 실행하고, 개별 `tool_use_id`에 대응하는 `tool_result` 블록을 각각 생성하여 단일 사용자 메시지 턴에 묶어 전달해야 합니다.

**문제 상황 분석:**  
- Claude가 가격 계산을 위해 통화 환산 도구와 세금 조회 도구를 **한 턴에 동시에 호출(2개 tool_use 블록)**함.
- 에이전트 루프(Agent Loop)가 다음 Claude 요청을 보내기 전, 이 병렬 도구 요청을 표준 메시지 규격에 맞춰 처리해야 함.

**A번이 정답인 이유:**  
Claude API 사양에 따르면, 하나의 응답에서 여러 개의 `tool_use` 블록이 반환된 경우 애플리케이션은 각 도구를 실행한 후, 각각의 `tool_use_id`와 짝을 이루는 별도의 `tool_result` 블록을 만들어 다음 `user` 턴의 `content` 배열에 포함시켜 전송해야 합니다.

**오답 분석:**  
- **Option B (오답):** 여러 도구의 실행 결과를 임의의 `tool_use_id` 하나로 병합하면 ID 맵핑이 깨져 API 검증 오류가 발생합니다.
- **Option C (오답):** 대화를 두 개로 분리하여 보낼 필요가 없으며, 하나의 연관된 대화 스레드(Context) 내에서 모든 결과를 함께 전달해야 모델이 이를 통합하여 가격 계산을 완료할 수 있습니다.
- **Option D (오답):** Claude API는 한 턴에 둘 이상의 도구 요청을 처리할 수 있으며, 두 번째 요청을 무시하면 필요한 데이터(세금 정보 등)가 누락되어 작업이 실패합니다.

---

## 63번 문제

**1. 문제 원문**

An agent handles two kinds of unverified requests: viewing a masked order history (read-only, low risk) and issuing a refund (financial, irreversible). The architect wants to gate both with PreToolUse hooks but use different permission decisions based on risk. Which pairing of returned `permissionDecision` values best fits the two cases before identity is verified?

* A) "ask" for the refund and "allow" for the masked order history lookup, because the irreversible refund needs human confirmation before proceeding, while the masked, read-only lookup is low risk and can be permitted automatically.
* B) "allow" for both the masked order history lookup and the refund, since neither action can realistically be reversed once the workflow reaches the hook stage.
* C) "deny" for both the masked order history lookup and the refund, since any unverified request should be treated identically regardless of the underlying tool.
* D) "ask" for the masked order history lookup and "deny" for the refund, since the reversible read can tolerate a manual check while the irreversible refund should not proceed at all.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**A번**: "ask" for the refund and "allow" for the masked order history lookup, because the irreversible refund needs human confirmation before proceeding, while the masked, read-only lookup is low risk and can be permitted automatically.

**정답 및 해설:**  
**핵심 개념**: PreToolUse Hook 및 위험 기반 권한 제어 (Risk-based Permission Decision)  
에이전트 시스템에서 PreToolUse 훅은 도구가 실행되기 전에 접근 권한을 결정(`permissionDecision`)하는 정책 인터페이스입니다. 대표적인 결정 제어 값으로 자동 허용(`allow`), 사람에게 승인 요청(`ask`), 완전 거부(`deny`) 등이 있으며, 도구 실행의 리스크와 가역성(Reversibility)에 따라 차등 부여합니다.

**문제 상황 분석:**  
- 에이전트가 검증되지 않은 사용자의 요청 2가지를 처리하려 함.
- **요청 1:** 마스킹된 주문 내역 조회 (읽기 전용, 민감정보 마스킹, 민감도/위험도 매우 낮음)
- **요청 2:** 환불 처리 (금전적 작업, 취소/복구가 불가능한 되돌릴 수 없는 위험 작업)
- 신원 미검증 상태에서 위험도 기반 차등 정책을 적용할 때 가장 적절한 `permissionDecision` 결합을 선택해야 함.

**A번이 정답인 이유:**  
마스킹 처리된 읽기 전용 데이터 조회는 보안 위험이 매우 낮으므로 별도의 확인 없이 자동 허용(`allow`)해도 안전합니다. 반면 금전적 손실을 발생시키고 되돌릴 수 없는 환불 작업은 신원 미검증 상태에서 즉시 실행되면 안 되므로, 사람(사용자/관리자)의 직접적인 확인 및 개입을 요구하는 `ask` 정책을 적용하는 것이 가장 적합합니다.

**오답 분석:**  
- **Option B (오답):** 미검증 상태에서 위험도가 높고 되돌릴 수 없는 환불 작업까지 전부 자동 허용(`allow`)하는 것은 심각한 보안 및 재무적 위험을 초래합니다.
- **Option C (오답):** 도구의 위험도와 상관없이 모든 요청을 거부(`deny`)하면 유연한 위험 기반 권한 제어(Risk-based permission) 정책을 구현하고자 하는 목적에 부합하지 않으며 사용자 경험(UX)을 극도로 저해합니다.
- **Option D (오답):** 위험도가 낮은 읽기 작업에 수동 확인(`ask`)을 붙이고 고위험 작업만 거부하는 조합은 단순/안전한 작업을 불필요하게 지연시킬 뿐만 아니라, `ask`의 용도(확인 후 실행)를 잘못 적용한 설명입니다.

---

## 64번 문제

**1. 문제 원문**

A team has finished a shared analysis of a monolith's test suite in one session and now wants to compare two independent refactoring strategies (extract-service vs. strangler-fig) starting from that same analyzed baseline, without letting either exploration corrupt the other or the original session. What is the most appropriate mechanism?

* A) Start two brand-new sessions and describe the test-suite findings from memory in each opening prompt
* B) Resume the analysis session, complete the first strategy, then use /clear and resume again for the second
* C) Resume the analysis session twice with fork_session set, producing two independent branches from the shared baseline
* D) Resume the analysis session once and alternate prompts between the two strategies within that single conversation

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**C번**: Resume the analysis session twice with fork_session set, producing two independent branches from the shared baseline

**정답 및 해설:**  
**핵심 개념**: 세션 포크(`fork_session`) 및 대화 브랜칭 관리  
에이전트 세션 관리 기술 중 `fork_session`은 기존 세션의 맥락(Context Baseline)을 그대로 복사하여 새로운 세션 브랜치를 만드는 기능입니다. 이를 통해 원본 세션 상태를 유지하면서 동일한 기점에서 여러 파생 실험이나 탐색을 독립적으로 수행할 수 있습니다.

**문제 상황 분석:**  
- 하나의 세션에서 모놀리스 테스트 수트에 대한 사전 분석(베이스라인 맥락)을 마침.
- 동일한 베이스라인 상태에서 서로 다른 2가지 리팩토링 전략(서비스 추출, 스트랭글러 피그)을 실험/비교하고자 함.
- 두 실험이 서로의 대화 맥락을 오염시키지 않아야 하며, 원본 분석 세션도 온전히 유지되어야 함.

**C번이 정답인 이유:**  
`fork_session` 옵션을 활성화하여 이전 분석 세션을 두 번 재개(Resume)하면, 공유된 베이스라인 맥락을 가진 독립된 2개의 세션 브랜치가 만들어집니다. 이를 통해 원본 세션을 오염시키지 않고 두 가지 전략을 각각 독립적으로 실행 및 비교할 수 있습니다.

**오답 분석:**  
- **Option A (오답):** 기억(수동 요약)에 의존하여 프롬프트로 재입력하면 정교한 분석 맥락과 데이터가 누락될 수 있으며 비효율적입니다.
- **Option B (오답):** 세션을 재개하여 첫 번째 작업을 마친 후 `/clear`를 사용하면 대화 맥락이 초기화되므로 동일한 분석 베이스라인에서 시작할 수 없습니다.
- **Option D (오답):** 한 대화 스레드 내에서 두 전략의 프롬프트를 번갈아 주고받으면 대화 맥락이 섞여 서로 오염(Cross-contamination)됩니다.

---

## 65번 문제

**1. 문제 원문**

A Claude Code session from three days ago read and cached the contents of a configuration file (e.g., a CLAUDE.md or agent definition). Since then, another engineer has substantially rewritten that file in a separate branch that was just merged. The architect needs to continue work while accounting for the file rewrite and preserving the accumulated reasoning about the surrounding system. What is the best approach?

* A) Resume the session and trust its cached understanding of the configuration file since resumption restores full context.
* B) Resume the session and run /compact immediately before asking any follow-up question about the file.
* C) Start a new session and provide it with a concise summary of the previous session's findings and reasoning.
* D) Resume the session and explicitly tell the agent the configuration file changed, prompting it to re-read that file.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**D번**: Resume the session and explicitly tell the agent the configuration file changed, prompting it to re-read that file.

**정답 및 해설:**  
**핵심 개념**: 캐시 오염 방지(Cache Invalidation) 및 세션 재개(Session Resumption)  
Claude Code 세션을 재개하면 이전의 대화 이력과 시스템 추론 맥락이 유지됩니다. 하지만 세션 진행 중 읽었던 외부 파일 내용이 실제 디스크 상에서 수정되었을 경우, 모델은 과거 대화 맥락에 담긴 캐시 데이터를 계속 신뢰할 수 있으므로 명시적으로 파일 재조회(Re-read)를 유도해야 합니다.

**문제 상황 분석:**  
- 3일 전 세션에서 설정 파일(CLAUDE.md 등)을 읽어 세션 맥락 내에 캐시해 둔 상태임.
- 외부에서 해당 파일이 대폭 수정 및 병합(Merge)되었음.
- 기존 주변 시스템에 대해 축적된 추론 맥락(Accumulated Reasoning)은 그대로 유지하면서, 수정된 파일 내용만 새로 반영하고자 함.

**D번이 정답인 이유:**  
문제의 핵심 요구사항은 **"축적된 추론(accumulated reasoning)을 보존"**하면서 **"파일 재작성을 반영"**하는 것입니다.  
세션을 재개(`Resume`)하면 이전 세션의 수많은 복잡한 추론 과정, 맥락, 변수 관계가 100% 온전히 유지됩니다. 이때 파일이 바뀌었음을 에이전트에게 알려주면(`explicitly tell the agent... prompting it to re-read`), 에이전트는 기존의 깊은 추론 맥락을 유지한 채 해당 파일만 다시 읽어와(Re-read) 캐시를 최신화하므로 문제의 조건들을 완벽히 충족합니다.

**오답 분석:**  
- **Option A (오답):** 세션을 재개해도 디스크 상에서 외부 변경된 파일 내용이 자동으로 대화 이력에 업데이트되지 않으므로, 이전 캐시 데이터만 신뢰하면 환각이나 잘못된 분석이 발생합니다.
- **Option B (오답):** `/compact` 명령어는 대화 이력을 요약/압축하는 기능일 뿐, 외부 파일의 최신 내용을 읽어오거나 업데이트해 주지 않습니다.
- **Option C (오답):** 새 세션을 시작하고 요약문(Summary)을 넘겨주는 방식은 이전 세션의 '상세한 추론 맥락'이 축약되면서 정보가 손실(Context Loss)됩니다. 문제에서 요구한 "축적된 추론의 보존"을 달성하지 못합니다.

---

## 66번 문제

**1. 문제 원문**

An inventory-reconciliation agent calls a database-query tool and must decide whether to retry with broader filters or produce a final summary. The architect wants Claude itself to make that branching decision instead of the application hardcoding "if the query returns zero rows, retry with broader filters." What loop design achieves this?

* A) Return the tool_result in the next request and let Claude's own reasoning over the updated conversation decide whether to retry or finish
* B) Have the application inspect the row count from the tool_result and pick one of two hardcoded prompt templates based on that count
* C) Precompute every possible query refinement in advance and let the application select one from a lookup table keyed by row count
* D) Send the tool_result to a separate rules engine that decides the next tool call, then forward that decision to Claude for confirmation only

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**A번**: Return the tool_result in the next request and let Claude's own reasoning over the updated conversation decide whether to retry or finish

**정답 및 해설:**  
**핵심 개념**: 에이전트 루프(Agent Loop) 및 모델 중심 추론(Model-Driven Control Flow)  
LLM 에이전트 아키텍처에서 도구 실행 결과(`tool_result`)를 대화 이력에 덧붙여 다시 모델에 전달하면, 모델은 업데이트된 대화 맥락을 바탕으로 다음에 새로운 도구를 호출할지(`tool_use`), 아니면 답변 작성을 완료하고 종료할지 스스로 추론하여 결정합니다.

**문제 상황 분석:**  
- 데이터베이스 조회 도구를 실행한 후, 결과(행 개수 등)에 따라 조회를 확장할지 요약문을 작성할지 분기해야 함.
- 애플리케이션 코드에 `if (rows == 0)` 식의 조건문 규칙을 하드코딩하는 정적 방식 대신, Claude가 자율적으로 판단하는 모델 중심(Model-driven) 루프를 구축하려 함.
- Claude가 직접 도구 결과를 평가하고 다음 행동을 결정하게 만드는 루프 패턴을 찾아야 함.

**A번이 정답인 이유:**  
애플리케이션이 `tool_result` 메시지를 다음 API 요청에 그대로 포함하여 Claude에 전달하면, Claude는 해당 도구 결과와 지금까지의 대화 맥락을 종합적으로 추론합니다. 이를 통해 더 넓은 필터로 다시 도구를 호출할지(`retry`) 아니면 텍스트 응답을 출력하여 종료할지(`finish`) 스스로 결정하게 되므로 문제 요구사항을 정확히 충족합니다.

**오답 분석:**  
- **Option B (오답):** 애플리케이션이 행 개수를 검사하여 프롬프트 템플릿을 분기하는 방식은 Claude 자체가 분기를 결정하는 것이 아니라 애플리케이션 코드가 조건 판단을 하드코딩하는 정적 방식입니다.
- **Option C (오답):** 사전 계산된 룩업 테이블을 사용하는 방식은 모델의 자율 추론을 배제하고 결정론적 규칙 테이블에 의존하므로 아키텍트의 의도에 어긋납니다.
- **Option D (오답):** 외부 룰 엔진이 실행할 도구를 판단하고 Claude에게 단순히 승인만 받는 방식은 핵심 제어 흐름이 룰 엔진에 하드코딩되어 있어 모델 중심의 추론 분기 구조가 아닙니다.

---

## 67번 문제

**1. 문제 원문**

An architect is defining a "database-migration" AgentDefinition with a long prompt field describing SQL best practices, rollback strategy, and data integrity checks. Separately, each time the coordinator invokes this subagent it supplies a different per-call prompt describing the specific table and migration at hand. What is the correct relationship between these two prompt sources?

* A) AgentDefinition.prompt is ignored at runtime once a per-call prompt is supplied, so only the invocation-time prompt actually reaches the subagent's model
* B) The per-call prompt is merged into the coordinator's own system prompt instead of the subagent's, so the subagent only ever sees AgentDefinition.prompt
* C) Both prompt sources are concatenated and then truncated to the shorter of the two, so only whichever prompt is more concise is guaranteed to reach the subagent intact
* D) AgentDefinition.prompt sets the subagent's persistent system prompt and expertise, while the per-call prompt passed at invocation supplies the specific task details for that run

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**D번**: AgentDefinition.prompt sets the subagent's persistent system prompt and expertise, while the per-call prompt passed at invocation supplies the specific task details for that run

**정답 및 해설:**  
**핵심 개념**: 서브에이전트(Subagent) 프롬프트 계층 구조 (System Prompt vs Per-call Task Prompt)  
에이전트 프레임워크에서 서브에이전트는 역할, 규칙, 도구 사용법 등을 정해두는 정적 definition(시스템 프롬프트)과, 호출 시점에 전달되어 구체적인 과업 및 입력을 지정하는 동적 prompt(사용자/작업 프롬프트)를 결합하여 작동합니다.

**문제 상황 분석:**  
- `AgentDefinition.prompt`에는 SQL 모범 사례, 롤백 전략 등 고정적이고 공통적인 지침(System Prompt/Expertise)이 선언됨.
- 코디네이터 에이전트가 해당 서브에이전트를 호출할 때는 실행 건별로 대상 테이블, 변경 내용 등 구체적인 동적 작업 지시(Per-call Task Details)를 전달함.
- 두 종류의 프롬프트가 서브에이전트 실행 시 어떻게 상호작용하는지 메커니즘을 파악해야 함.

**D번이 정답인 이유:**  
`AgentDefinition.prompt`는 서브에이전트의 영구적인 페르소나 및 지침(System Prompt)으로 적용되고, 호출 시 전달되는 `per-call prompt`는 해당 회차 실행에서 수행할 구체적인 동적 과업(Task Prompt)으로 전달되어 함께 완벽한 맥락을 구성합니다.

**오답 분석:**  
- **Option A (오답):** `AgentDefinition.prompt`가 무시되지 않으며, 시스템 지침과 호출 프롬프트는 함께 모델로 전달됩니다.
- **Option B (오답):** 호출 프롬프트는 코디네이터가 아닌 서브에이전트의 입력 맥락으로 전달됩니다.
- **Option C (오답):** 프롬프트를 임의로 연결 후 더 짧은 길이에 맞춰 잘라내는(truncate) 식의 비합리적인 로직은 존재하지 않습니다.

---

## 68번 문제

**1. 문제 원문**

A team wants to enforce that get_customer must run before process_refund, and registers two separate PreToolUse hooks: one matched to get_customer that writes a "verified" marker to a session file, and one matched to process_refund that reads that same file. A reviewer worries this design assumes the hooks run in a guaranteed order relative to each other. Is that assumption safe, and why?

A) It is unsafe, because each hook runs only when its matched tool is invoked, but nothing guarantees that get_customer is invoked before process_refund. The model could skip the prerequisite tool entirely, causing the process_refund hook to read a file that may not exist or contain valid data.

B) It is unsafe, because hooks matched to different tools share no session state with each other at all, so the process_refund hook can never see a file written by the get_customer hook.

C) It is safe, because the runtime automatically orders hooks alphabetically by their tool name before executing them, which guarantees get_customer's hook always runs first.

D) It is unsafe, because every registered PreToolUse hook always executes in parallel for every tool call in the session regardless of its matcher, so the file could be read before it is ever written.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: It is unsafe, because each hook runs only when its matched tool is invoked, but nothing guarantees that `get_customer` is invoked before `process_refund`. The model could skip the prerequisite tool entirely, causing the `process_refund` hook to read a file that may not exist or contain valid data.

**정답 및 해설:**

**핵심 개념**: 훅(PreToolUse Hooks)의 이벤트 기반 실행 구조 및 LLM 툴 호출의 비결정성(Nondeterminism).
PreToolUse 훅은 매칭된 도구가 실제 호출되는 시점에 구동되며, LLM 모델이 툴을 어떤 순서로 호출할지(또는 생략할지)는 런타임 차원에서 강제되지 않습니다.

**문제 상황 분석:**
- 팀에서는 `get_customer`가 실행될 때 세션 파일에 마커를 쓰고, `process_refund`가 실행될 때 이 마커 파일을 읽어 검증하도록 훅을 설계함
- 그러나 PreToolUse 훅은 각 도구가 호출될 때 개별적으로 실행되는 이벤트 트리거 구조임
- LLM 모델이 `get_customer` 도구 호출을 거치지 않고 바로 `process_refund` 도구를 호출할 경우, 선행 훅이 실행되지 않아 세션 파일이 존재하지 않는 문제가 발생함

**A번이 정답인 이유:**
각 PreToolUse 훅은 지정된 매처(Matcher)에 해당하는 도구가 실제로 호출되는 순간에만 실행됩니다. 에이전트(LLM)가 순서를 어기거나 필수 선행 도구인 `get_customer`를 호출하지 않고 `process_refund`를 직접 호출하면, 파일 쓰기 작업이 일어난 적이 없으므로 `process_refund` 훅은 에러를 일으키거나 잘못된 파일 상태를 참조하게 됩니다. 따라서 이 설계는 안전하지 않습니다.

**오답 분석:**

- Option B (오답): 훅들은 로컬 파일 시스템이나 동일 세션 환경에 접근하여 데이터를 공유할 수 있습니다. 상태 공유가 불가능하다는 주장은 사실이 아닙니다.
- Option C (오답): 런타임이 도구 이름의 알파벳 순서(alphabetically)로 훅의 실행 순서를 자동 보장한다는 메커니즘은 존재하지 않습니다.
- Option D (오답): PreToolUse 훅은 매처 조건과 상관없이 무조건 병렬 실행되는 것이 아니라, 해당 도구가 트리거될 때 선행(Pre) 실행됩니다.

---

## 69번 문제

**1. 문제 원문**

An architect is choosing where to place enforcement for a workflow where refund_tool must never run before verify_tool succeeds. One option is a Notification hook that logs a warning message whenever refund_tool is called without prior verification. Why does this option fail to meet the deterministic-compliance requirement?

A) Notification hooks cannot be matched to a specific tool name at all, so the warning would fire for every tool call in the session, including routine operations like search, rather than only refund_tool.

B) Notification hooks execute before the tool call but require a human to manually click through every notification, adding non-deterministic latency because the workflow stalls until the human responds.

C) Notification hooks only carry status messages and cannot set a permissionDecision that blocks the call, so the refund would already have executed before the warning is logged.

D) Notification hooks are only available in the Python SDK, so a TypeScript-based agent could not use this approach even if it wanted to log a warning, as the TypeScript runtime lacks hook registration.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Notification hooks only carry status messages and cannot set a permissionDecision that blocks the call, so the refund would already have executed before the warning is logged.

**정답 및 해설:**

**핵심 개념**: Notification Hook과 PreToolUse Hook의 차이 및 권한 제어(Permission Control).
에이전트 SDK에서 Notification 훅은 알림 및 단순 로깅(비동기 상태 전달) 목적으로 사용되며, 실행 제어권(`permissionDecision`)을 가져 도구 호출을 차단(Block)하는 기능이 없습니다. 필수 선행 조건 준수를 강제하려면 차단 권한을 갖는 `PreToolUse` 훅을 사용해야 합니다.

**문제 상황 분석:**
- 검증 도구(`verify_tool`)가 성공하기 전에는 환불 도구(`refund_tool`)가 절대 실행되지 않도록 강제해야 하는 요구사항이 존재함
- 알림(Notification) 훅을 사용하여 무단 호출 시 경고 로그를 남기도록 제안함
- 하지만 단순 알림(Notification)은 차단/승인 권한 제어(Decision mechanism)가 없으므로 도구 실행 자체를 막지 못함

**C번이 정답인 이유:**
Notification 훅은 상태 메시지 수신 및 로그 기록 용도로만 작동하며, 도구 실행을 중단하거나 거부할 수 있는 `permissionDecision`을 반환하지 못합니다. 따라서 경고가 출력되거나 로그가 남더라도 이미 `refund_tool` 실행은 차단되지 않은 채 진행되어 버리므로 결정론적 규정 준수(Deterministic Compliance) 요구사항을 만족할 수 없습니다.

**오답 분석:**

- Option A (오답): Notification 훅 역시 매처(Matcher)를 지정하여 특정 툴 이름(`refund_tool`)에만 반응하도록 설정할 수 있습니다.
- Option B (오답): Notification 훅이 사람의 수동 클릭을 필수적으로 요구하거나 이를 위해 워크플로 전체를 멈추게 만들지는 않습니다.
- Option D (오답): Notification 훅 등록 및 이벤트 수신 기능은 Python SDK뿐만 아니라 TypeScript SDK 등 주요 에이전트 SDK에서 공통으로 지원합니다.

---

## 70번 문제

**1. 문제 원문**

A team wants to send every tool call's arguments to an external audit service without slowing down the agent's response time, and this audit step has no bearing on whether the call is allowed to proceed. Which hook output pattern fits this requirement?

A) A PostToolUse hook that returns permissionDecision "ask" so the user is prompted to confirm the audit request was sent before the next tool call runs

B) A PreToolUse hook that returns permissionDecision "allow" together with updatedInput containing the audit payload appended to the original arguments

C) A PreToolUse hook that returns permissionDecision "defer" so the session pauses until the audit service confirms receipt, then resumes automatically

D) A PreToolUse hook that fires the audit request and returns {"async": true, "asyncTimeout": 30000} so the agent proceeds without waiting for the request to finish

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: A PreToolUse hook that fires the audit request and returns `{"async": true, "asyncTimeout": 30000}` so the agent proceeds without waiting for the request to finish

**정답 및 해설:**

**핵심 개념**: 비동기 훅 실행(Async Hook Execution) 및 넌블로킹 감사 패턴.
에이전트의 실행 응답 시간을 지연시키지 않고 외부 서비스로 감사(Audit) 데이터를 백그라운드에서 전송하려면, 훅 출력 시 `async: true` 옵션을 반환하여 넌블로킹(Non-blocking) 방식으로 처리하도록 해야 합니다.

**문제 상황 분석:**
- 모든 도구 호출의 인자를 외부 감사 서비스로 전송해야 함
- 에이전트의 응답 시간이 저하되어서는 안 됨 (동기식 대기 불가)
- 해당 감사 단계는 도구 실행 허용/거부 여부에 아무런 영향을 주지 않음 (독립적 실행)

**D번이 정답인 이유:**
`PreToolUse` 훅 내에서 외부 감사 요청을 발생시킨 뒤 `{"async": true, ...}` 객체를 반환하면 런타임은 해당 감사 작업의 완결을 기다리지 않고 즉시 도구 실행 및 다음 단계 프로세스를 계속 진행합니다. 따라서 응답 지연 없이 넌블로킹으로 요구사항을 만족할 수 있습니다.

**오답 분석:**

- Option A (오답): `permissionDecision: "ask"`는 다음 실행 전 사용자에게 확인 프롬프트를 띄우므로 응답 시간을 오히려 크게 지연시키고 불필요한 사용자 개입을 발생시킵니다.
- Option B (오답): 도구 입력 인자(`updatedInput`)에 감사 페이로드를 직접 추가하여 전달하는 방식은 도구 본래의 스키마와 인자를 오염시키며, 백그라운드 외부 전송 목적에도 맞지 않습니다.
- Option C (오답): `permissionDecision: "defer"`는 감사 서비스의 응답 확인을 받을 때까지 세션을 일시 정지(Pause)시키므로 응답 시간을 지연시키지 않아야 한다는 핵심 조건에 위배됩니다.

---

## 71번 문제

**1. 문제 원문**

A team is building an automated pipeline that takes a raw customer support transcript, produces a structured summary, then translates that summary into three fixed target languages. The steps and their order never change between runs. Which decomposition strategy best fits this workflow?

A) A dynamic orchestrator that decides at runtime whether summarization or translation should happen first

B) A fixed prompt-chaining pipeline with a programmatic check after the summarization step before translation begins

C) A single subagent that reads the transcript once and produces all three translations without an intermediate summary artifact

D) An adaptive investigation plan that generates new subtasks based on which language the transcript happens to mention

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: A fixed prompt-chaining pipeline with a programmatic check after the summarization step before translation begins

**정답 및 해설:**

**핵심 개념**: 프롬프트 체이닝(Prompt Chaining) 워크플로 패턴.
단계와 실행 순서가 정해져 있고 변하지 않는 고정된 워크플로(Deterministic Workflow)에는 런타임 판단을 수행하는 동적 오케스트레이터 대신, 각 단계를 순차적으로 연결하는 **프롬프트 체이닝(Prompt Chaining)** 패턴이 가장 효율적이고 안정적입니다.

**문제 상황 분석:**
- 원본 대화록 수집 -> 구조화된 요약 생성 -> 3개 언어로 번역 순서의 워크플로
- 실행 시 단계와 순서가 절대 변경되지 않는 명확한 고정 프로세스
- 요약본이라는 중간 산출물(Artifact)이 반드시 필요함

**B번이 정답인 이유:**
작업의 순서와 단계가 결정론적(Deterministic)으로 고정되어 있으므로, 복잡하고 비용이 많이 드는 동적 오케스트레이터 대신 고정된 프롬프트 체이닝 구조를 사용하는 것이 최적입니다. 요약 단계와 번역 단계 사이에 프로그래밍 방식(Programmatic check)으로 요약 결과물의 유효성을 검증하는 단계를 두면 파이프라인의 신뢰성을 극대화할 수 있습니다.

**오답 분석:**

- Option A (오답): 실행 순서가 절대로 바뀌지 않는 고정 워크플로이므로, 런타임에 순서를 판단하는 동적 오케스트레이터(Dynamic orchestrator)는 불필요한 오버헤드와 비결정성을 유발합니다.
- Option C (오답): 요구사항에 명시된 "구조화된 요약 생성"이라는 중간 생성물(Intermediate summary artifact) 단계를 건너뛰므로 조건을 충족하지 못합니다.
- Option D (오답): 대화록 내용에 따라 하위 작업을 동적으로 생성하는 적응형 계획(Adaptive plan)은 정해진 3개 언어로의 번역이라는 고정 워크플로 목적에 맞지 않습니다.

---

## 72번 문제

**1. 문제 원문**

A team built a fixed five-step prompt chain to migrate a database schema: extract schema, generate migration script, validate syntax, apply migration, and confirm row counts. During testing, some migrations require an unplanned sixth step to backfill a newly discovered column that has no default value, which the chain cannot accommodate. What is the fundamental flaw in the team's approach?

A) The team should not execute a migration without having a deterministic, complete understanding of the database schema beforehand; the design flaw is relying on runtime schema extraction that can miss columns.

B) The task has variable structure depending on discovered schema details, so it should use adaptive decomposition that adds backfill subtasks when they are found.

C) The fixed chain only ever lacked a programmatic checkpoint right after the validate-syntax step, and adding that single checkpoint would resolve the backfill issue.

D) The fixed chain was correct, and the team should add a sixth hardcoded backfill step to the pipeline for every future migration regardless of schema.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: The task has variable structure depending on discovered schema details, so it should use adaptive decomposition that adds backfill subtasks when they are found.

**정답 및 해설:**

**핵심 개념**: 프롬프트 체이닝(Prompt Chaining) vs. 적응형 작업 분해(Adaptive Decomposition).
모든 단계와 흐름이 미리 정해진 결정론적 작업에는 고정된 프롬프트 체인(Fixed Chain)이 적합합니다. 하지만 수행 도중 발견되는 상태나 데이터 조건에 따라 필요한 하위 작업(Subtask)이 동적으로 달라지는 동적 작업(Dynamic Workflow)에는 상황에 맞게 계획을 수정/추가할 수 있는 **적응형 분해(Adaptive Decomposition) / 동적 오케스트레이션** 패턴을 적용해야 합니다.

**문제 상황 분석:**
- 팀은 스키마 추출부터 확인까지 5단계로 구성된 고정된 프롬프트 체인을 설계함
- 테스트 과정에서 기본값이 없는 컬럼이 새로 발견되는 등 예외 상황이 발생함
- 이 경우 백필(Backfill) 작업을 추가로 수행해야 하지만, 고정된 5단계 파이프라인 구조 특성상 변화하는 요구사항을 유연하게 처리하지 못함

**B번이 정답인 이유:**
마이그레이션 대상 스키마의 세부 상태(예: 기본값 없는 컬럼 존재 여부)에 따라 동적으로 작업 순서나 단계가 달라져야 하는 가변적 구조(Variable structure)입니다. 따라서 단계를 고정해 두기보다는, 런타임 분석 결과에 따라 필요한 하위 작업(백필 등)을 동적으로 계획하고 추가할 수 있는 **적응형 분해(Adaptive Decomposition)** 기법을 사용하는 것이 구조적 결함을 해결하는 올바른 접근법입니다.

**오답 분석:**

- Option A (오답): 사전 탐색이나 런타임 스키마 추출 자체의 문제가 아니라, 추출된 스키마 결과에 맞게 워크플로 단계를 동적으로 유연하게 구성하지 못한 설계의 문제입니다.
- Option C (오답): 구문 검증 직후 체크포인트를 추가하는 것은 조건 판단만 할 뿐, 고정된 파이프라인에 없던 '백필 단계'를 동적으로 생성하여 실행해 주지는 못합니다.
- Option D (오답): 백필이 불필요한 스키마 마이그레이션까지 모든 파이프라인에 6번째 백필 단계를 하드코딩하는 것은 불필요한 연산과 에러를 유발하는 잘못된 접근입니다.

---

## 73번 문제

**1. 문제 원문**

An architect designs a workflow where a coordinator's subagent spawns its own subagent, which spawns another, several levels deep. According to official Anthropic documentation as of June 2026, what is the maximum nesting depth allowed for subagents in Claude Code?

A) Only the main coordinator agent may spawn subagents on its own; no subagent may ever spawn another under any configuration.

B) Nesting stops automatically after the second level unless the subagent's model is set to a more capable tier.

C) Nesting is unlimited as long as each subagent has the Agent tool included in its allowed tools list.

D) Subagents can nest up to a maximum of five levels deep, including the main agent as the first level.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Subagents can nest up to a maximum of five levels deep, including the main agent as the first level.

**정답 및 해설:**

**핵심 개념**: 서브에이전트 다단계 중첩(Nested Subagents Depth Limit).
Claude Code는 최신 업데이트(2026년 6월 v2.1.172 기준)를 통해 서브에이전트가 또 다른 하위 서브에이전트를 재귀적으로 호출할 수 있는 중첩 구조(Nested Subagents)를 공식 지원합니다. 무한 재귀 및 자원 고갈을 방지하기 위해 최대 중첩 깊이는 메인 에이전트를 포함하여 **최대 5단계(5 levels deep)**로 제한됩니다.

**문제 상황 분석:**
- 아키텍트가 코디네이터 서브에이전트가 계속해서 하위 서브에이전트를 생성하는 다단계 중첩(Nested) 워크플로를 설계함
- 초기 버전과 달리 최신 공식 문서 기준 최대 중첩 허용 단계 한계를 확인해야 함
- 2026년 6월 최신 사양상 허용되는 정확한 서브에이전트 중첩 깊이 제약을 묻고 있음

**D번이 정답인 이유:**
Anthropic Claude Code의 2026년 6월 공식 문서 및 업데이트 내역에 따르면, 서브에이전트의 다단계 중첩 기능이 해제되어 하위 작업 격리 및 병렬 처리가 가능해졌습니다. 이때 제어할 수 없는 무한 랩핑(Infinite Recursion)을 방지하기 위한 시스템 가드레일로서 메인 에이전트를 1단계로 포함해 **최대 5단계 깊이(up to 5 levels deep)**까지 중첩 생성을 허용합니다.

**오답 분석:**

- Option A (오답): 서브에이전트 하위 생성 금지는 early version(초기 버전)에만 적용되었던 제약이며, 2026년 6월 업데이트 기준으로는 중첩 생성이 지원됩니다.
- Option B (오답): 서브에이전트 모델 성능 계층(Tier) 변경 여부와 상관없이 최대 5단계까지 중첩이 허용됩니다.
- Option C (오답): `Agent` 툴을 허용 목록에 추가하더라도 무제한(unlimited) 중첩은 불가능하며, 시스템적으로 5단계 캡(Cap)이 적용됩니다.

---

## 74번 문제

**1. 문제 원문**

A coordinator needs three independent code-quality checks (style, security, test coverage) performed on a pull request before it can synthesize a review. Currently the coordinator invokes each subagent one after another, and the review takes the sum of all three durations. How should the coordinator change its invocation strategy?

A) Invoke only the security subagent first, then decide whether to skip the other two remaining checks based on that outcome

B) Merge all three checks into the coordinator's own logic so no subagents are needed for this review

C) Invoke the style, security, and test-coverage subagents concurrently so the review finishes in the time of the slowest

D) Increase the maxTurns setting on each subagent so that each one finishes its individual check faster

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Invoke the style, security, and test-coverage subagents concurrently so the review finishes in the time of the slowest

**정답 및 해설:**

**핵심 개념**: 서브에이전트 동시/병렬 호출(Concurrent Subagent Execution)을 통한 병목 해소.
서로 의존성이 없는 독립적인 하위 작업(Independent subtasks)들을 순차적(Sequential)으로 수행하면 총 소요 시간이 각 작업의 합만큼 늘어납니다. 이를 병렬/동시(Concurrent) 호출로 전환하면 전체 처리 시간이 가장 오래 걸리는 단일 작업의 실행 시간 수준으로 대폭 단축됩니다.

**문제 상황 분석:**
- 풀 리퀘스트 검토를 위해 스타일, 보안, 테스트 커버리지라는 3개의 검사가 필요함
- 세 검사는 서로 영향을 주지 않는 독립적인(independent) 작업임
- 현재는 순차 실행(one after another)하여 전체 시간이 3개 작업 시간의 합(sum of all three durations)만큼 걸리는 성능 병목이 발생함

**C번이 정답인 이유:**
세 검사 작업이 완전히 독립적이므로, 코디네이터가 3개의 서브에이전트를 동시에(concurrently) 호출하도록 전략을 수정하는 것이 가장 효율적입니다. 병렬 처리 시 전체 검토 시간은 3개 개별 작업 소요 시간의 합에서 가장 오래 걸리는 작업(slowest)의 실행 시간으로 감소합니다.

**오답 분석:**

- Option A (오답): 3가지 검사가 모두 수행된 후 리뷰를 종합해야 하므로 조건부로 검사를 생략하는 방식은 요구사항을 충족하지 못합니다.
- Option B (오답): 서브에이전트를 제거하고 코디네이터 단일 로직으로 합치면 컨텍스트 오염 및 단일 에이전트 오버헤드가 증가하며, 병렬 처리의 이점도 사라집니다.
- Option D (오답): `maxTurns` 설정은 에이전트가 수행할 수 있는 최대 대화/도구 호출 턴 수를 제한하는 가드레일 값입니다. 이 값을 늘린다고 해서 개별 실행 속도가 빨라지지 않습니다.

---

## 75번 문제

**1. 문제 원문**

An agent loop generating a long report hits a response where stop_reason comes back as "max_tokens" rather than "tool_use" or "end_turn", because the output was truncated before Claude could finish. The loop's control flow only branches on those two familiar values and falls through to the "end_turn" branch by default. What is the risk of that fallback behavior?

A) The loop treats a truncated, incomplete response as if the task were finished, so it stops the agent before Claude has actually completed the work

B) The loop discards the truncated response entirely and silently resends the very first request in the conversation from scratch

C) The loop automatically increases the max_tokens parameter on the very next outgoing request without any code change, resolving the truncation entirely

D) The loop crashes immediately with an unhandled exception, since "max_tokens" is not a value the Messages API is permitted to return

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: The loop treats a truncated, incomplete response as if the task were finished, so it stops the agent before Claude has actually completed the work

**정답 및 해설:**

**핵심 개념**: API `stop_reason` 예외 처리 및 토큰 제한(Max Tokens Truncation).
Claude Messages API에서 `stop_reason`이 `"max_tokens"`로 반환되는 것은 모델이 응답을 마쳐서 끝난 것(`"end_turn"`)이 아니라 지정된 최대 토큰 수에 도달하여 응답이 도중에 끊겼음을 의미합니다. 이를 별도로 처리하지 않고 `"end_turn"`과 동일하게 처리하면 에이전트는 미완성된 결과물을 최종 결과물로 오인하게 됩니다.

**문제 상황 분석:**
- 에이전트 루프가 대화록 또는 긴 보고서를 생성하던 중 출력 한계에 도달함
- API 응답의 `stop_reason`이 `"max_tokens"`로 반환되어 생성이 중단됨
- 제어 로직이 `"tool_use"`와 `"end_turn"`만 분기하도록 작성되어, 기본 폴백(fallback) 로직에 의해 `"end_turn"` 분기로 처리됨

**A번이 정답인 이유:**
`stop_reason`이 `"max_tokens"`일 때 `"end_turn"` 분기로 떨어지면, 시스템은 모델이 답변 생성을 완료한 것으로 판단하여 루프를 정상 종료합니다. 결과적으로 Claude가 작성을 채 마치지 않은 잘린(truncated) 미완성 보고서를 최종 결과로 받아들여 작업을 조기 종료하게 되는 심각한 논리 오류가 발생합니다.

**오답 분석:**

- Option B (오답): 잘못된 폴백 분기로 인해 기존 응답을 버리고 처음부터 재요청하는 일은 발생하지 않으며, 단지 현재의 잘린 응답을 완성본으로 처리할 뿐입니다.
- Option C (오답): 별도의 코드 작성이나 `max_tokens` 증가 제어 로직 없이 자동으로 다음 요청의 `max_tokens` 값이 늘어나지는 않습니다.
- Option D (오답): `"max_tokens"`는 Messages API가 제공하는 정식 표준 `stop_reason` 값 중 하나이므로 이 값 자체가 언핸들드 예외나 시스템 래시를 일으키지는 않습니다.

---

## 76번 문제

**1. 문제 원문**

A developer writes a PreToolUse hook that intercepts calls to a destructive shell command and returns the following JSON:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Use the sandboxed low-privilege wrapper script instead"
  }
}
```

What is the runtime effect?

A) The session terminates with an error because permissionDecisionReason is only valid with permissionDecision: "ask".

B) The tool call is cancelled, and the reason is provided to Claude to inform subsequent actions.

C) The tool call is allowed, and the permissionDecisionReason is logged as a warning.

D) The user is shown an interactive approval prompt asking to allow or deny the tool call.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: The tool call is cancelled, and the reason is provided to Claude to inform subsequent actions.

**정답 및 해설:**


**핵심 개념**: PreToolUse Hook에서의 `permissionDecision: "deny"`와 피드백 메커니즘.
Claude 에이전트 SDK의 `PreToolUse` 훅은 도구가 실행되기 전에 호출을 가로채 제어권을 행사할 수 있습니다. `"permissionDecision": "deny"`로 지정하면 해당 도구의 실행을 차단하고, `permissionDecisionReason`에 명시된 거부 사유를 Claude(LLM)에게 전달하여 모델이 다른 수단을 찾거나 적절한 후속 조치를 취할 수 있도록 안내합니다.

**문제 상황 분석:**
- 개발자가 파괴적인 쉘 명령어를 가로채는 `PreToolUse` 훅을 작성함
- 훅 실행 결과로 `"permissionDecision": "deny"`와 거부 이유 메시지를 반환함
- 이 결과가 에이전트 런타임 및 Claude의 동작에 어떤 영향을 미치는지 묻는 상황임

**B번이 정답인 이유:**
`permissionDecision`을 `"deny"`로 설정하면, 런타임은 예정된 도구 실행을 즉시 취소(Cancel)합니다. 동시에 `permissionDecisionReason`에 적힌 사유("Use the sandboxed low-privilege wrapper script instead")가 모델(Claude)에게 도구 실행 결과 형태의 피드백으로 전달됩니다. 이를 통해 Claude는 자신이 요청한 도구 호출이 왜 거부되었는지 이해하고, 샌드박스화된 저권한 래퍼 스크립트를 대신 사용하는 식의 후속 대안 행동을 취할 수 있게 됩니다.

**오답 분석:**

- Option A (오답): `permissionDecisionReason`은 `"deny"` 및 `"ask"` 등 거부 또는 확인 요청 사유를 전달할 때 모두 유효하게 사용할 수 있으며, 세션 오류 종료를 발생시키지 않습니다.
- Option C (오답): `"permissionDecision": "deny"`는 명시적으로 도구 실행을 막는 결정이므로 도구 호출이 허용(allowed)되지 않습니다.
- Option D (오답): 대화형 승인 프롬프트를 띄우려면 `"permissionDecision": "ask"`를 반환해야 합니다. `"deny"`는 차단 및 거부 사유를 모델에게 즉시 전달합니다.

---

## 77번 문제

### 1. 문제 원문

A PreToolUse hook needs to block refunds above $500 only when they target a specific merchant category, based on a field named category inside the refund tool's arguments. The hook is registered with matcher="refund_customer". Where should the category check be implemented?

A) Inside the callback function itself, by reading input_data["tool_input"]["category"] and applying the conditional logic there, since matchers only filter by tool name

B) In the tool's own MCP server definition, since PreToolUse hooks cannot inspect individual tool arguments under any circumstances

C) In the matcher string, by writing a regex such as refund_customer.*category=restricted so the SDK filters on the argument before invoking the callback

D) In a second, separate matcher field called argument_matcher that the HookMatcher accepts alongside the tool-name matcher

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**

**A번**: Inside the callback function itself, by reading input_data["tool_input"]["category"] and applying the conditional logic there, since matchers only filter by tool name

**정답 및 해설:**

**핵심 개념**: Anthropic Claude Agent SDK / Claude Code Hook 시스템  
Hook 등록 시 사용되는 `matcher` 속성은 실행할 도구의 이름(tool name) 패턴을 매칭하는 역할만 수행합니다. 도구로 전달되는 상세 인자(arguments)의 데이터값을 기반으로 조건부 제어를 수행하려면 콜백 함수 내부로 들어오는 `input_data`를 직접 조회하여 조건문 검사를 작성해야 합니다.

**문제 상황 분석:**
- 환불 도구(`refund_customer`) 사용 요청 중 금액($500 초과)과 카테고리(`category` 필드) 조건에 따라 실행을 차단(block)하려 함.
- 훅 등록 시 지정한 `matcher="refund_customer"`는 대상 도구 이름만 필터링함.
- 도구 인자의 내부 세부 값 검증을 처리할 위치를 결정해야 함.

**A번이 정답인 이유:**
SDK의 훅 시스템에서 `matcher` 파라미터는 도구 이름만을 대상으로 정규식 또는 문자열 매칭을 지원합니다. 인자(arguments) 내부의 `category` 값이나 금액 등의 특정 데이터를 검사하기 위해서는 훅의 콜백 함수 내부로 넘어오는 데이터 객체(`input_data["tool_input"]`)를 직접 파싱하여 `if` 조건문 로직을 적용해야 합니다.

**오답 분석:**
- Option B (오답): PreToolUse 훅은 `input_data`를 통해 전달되는 도구 인자를 완벽히 검사할 수 있습니다. 검사 자체가 불가능하다는 설명은 거짓입니다.
- Option C (오답): `matcher` 속성에 정규식을 작성하여 도구 인자값까지 한 번에 필터링하는 기능은 지원되지 않습니다. 매처는 오직 도구 이름 필터링용입니다.
- Option D (오답): SDK에는 `argument_matcher`라는 별도의 매처 필드가 존재하지 않습니다.

---

## 78번 문제

### 1. 문제 원문

A session investigating a rate-limiter bug hit error_max_turns before reaching a conclusion. The architect wants to keep the analysis already performed and simply let the agent keep working with a higher turn ceiling, rather than repeating the investigation. What should the architect do?

A) Rerun the original prompt from scratch since a turn limit indicates the approach was flawed

B) Fork the session and set a higher max_turns only on the newly forked branch of it

C) Start a fresh session and manually restate every file the agent had already read before

D) Resume the session's ID with a higher max_turns value configured on the new follow-up query

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**

**D번**: Resume the session's ID with a higher max_turns value configured on the new follow-up query

**정답 및 해설:**

**핵심 개념**: Agent Session Resume 및 max_turns 재설정  
에이전트 실행 도중 설정된 최대 대화 턴 수(`max_turns`)에 도달하여 `error_max_turns`로 중단된 경우, 이전까지 수행된 조사 맥락(Context)을 그대로 유지하려면 해당 세션의 ID를 사용하여 세션을 재개(Resume)하면 됩니다. 이때 새로운 후속 실행(follow-up query) 시 더 높은 `max_turns` 옵션을 전달하여 계속 진행시킬 수 있습니다.

**문제 상황 분석:**
- 에이전트가 버그 조사 중 작업 최대 제한 턴 수에 도달하여 `error_max_turns` 오류로 중단됨.
- 아키텍트는 처음부터 다시 조사하는 낭비를 피하고, 기존 조사 맥락을 그대로 유지하길 원함.
- 제한 상한선만 완화하여 에이전트가 중단된 지점부터 이어서 작업을 완료하도록 조치해야 함.

**D번이 정답인 이유:**
에이전트 SDK 및 CLI 환경에서는 기존 세션 ID(Session ID)를 지정하여 세션을 재개(Resume)할 수 있습니다. 후속 요청을 보낼 때 `max_turns` 값을 기존보다 높여서 전달하면, 이미 쌓인 이력과 파일 분석 결과를 그대로 보존한 채 에이전트에게 추가 턴을 부여하여 남아있는 작업을 연속해서 완수하게 할 수 있습니다.

**오답 분석:**
- Option A (오답): 처음부터 다시 실행하는 것은 기존의 분석 결과를 모두 버리고 작업을 중복 수행하게 되므로 문제의 요구사항("keep the analysis already performed")에 위배됩니다.
- Option B (오답): 단순히 동일 세션을 이어서 계속 진행(Resume)하면 되는 상황에서 불필요하게 세션을 분기(Fork)할 필요가 없습니다.
- Option C (오답): 새 세션을 열고 이전에 읽었던 파일 목록을 수동으로 입력하는 것은 비효율적이며, SDK가 제공하는 세션 재개(Resume) 기능을 활용하지 않는 잘못된 방법입니다.

---

## 79번 문제

### 1. 문제 원문

A developer debugging an agent loop notices that on iteration three, Claude requests the same file-read tool with the same arguments used on iteration one, as if it never saw the earlier result. The loop's history-building code only appends the assistant's text blocks to conversation history, never the tool_use or tool_result blocks. What is the most likely cause of the repeated call?

A) The tool_result from iteration one was never added to the context sent back to Claude, so the model has no record the file was already read.

B) Claude's context window silently resets whenever stop_reason returns "tool_use" on two consecutive iterations in a row.

C) The tool being called is inherently non-idempotent, so the Messages API requires Claude to call it again on every single subsequent iteration.

D) The Messages API automatically clears tool_use blocks from history every two iterations to control overall token usage.

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**

**A번**: The tool_result from iteration one was never added to the context sent back to Claude, so the model has no record the file was already read.

**정답 및 해설:**

**핵심 개념**: LLM Agent Loop 및 Tool Call History 관리  
에이전트 루프에서 LLM이 도구를 사용하고 결과를 인지하려면, 도구 호출 요청(`tool_use`)과 그 도구의 실행 결과(`tool_result`)가 대화 이력(Conversation History)에 올바르게 포함되어야 합니다. 대화 이력에 텍스트 답변만 남기고 도구 결과 블록을 누락하면, 모델은 자신이 이전 회차에서 도구를 실행했다는 사실과 그 결과 내용을 전혀 알 수 없어 동일한 요청을 반복하게 됩니다.

**문제 상황 분석:**
- 개발자가 작성한 에이전트 루프 코드에서 대화 이력을 구성할 때 어시스턴트의 텍스트 블록만 append함.
- `tool_use` 블록과 `tool_result` 블록은 이력에 포함시키지 않고 제외함.
- 결과적으로 3번째 턴에서 Claude는 1번째 턴에서 읽은 파일 결과를 전달받지 못해 같은 파일을 다시 읽으라고 동일한 인자로 도구를 재호출함.

**A번이 정답인 이유:**
문제에서 이력 생성 코드가 `tool_use`와 `tool_result` 블록을 대화 이력에 추가하지 않는다고 명시되어 있습니다. Claude 모델은 전달받은 컨텍스트만을 바탕으로 다음 행동을 판단하므로, 이전 결과(`tool_result`)가 이력에서 누락되면 해당 파일을 읽었다는 사실 자체를 알 수 없어 동일한 도구 호출을 반복하게 됩니다.

**오답 분석:**
- Option B (오답): `stop_reason`이 연속으로 "tool_use"라고 해서 컨텍스트 창이 자동으로 초기화되는 동작 방식은 존재하지 않습니다.
- Option C (오답): 도구의 멱등성과 관계없이 Messages API가 특정 도구를 매 반복마다 강제로 다시 호출하게 만드는 메커니즘은 없습니다.
- Option D (오답): Messages API는 토큰 제어를 위해 자동으로 `tool_use` 블록을 2턴마다 지우지 않으며, 컨텍스트 관리는 개발자가 직접 제어해야 합니다.

---

## 80번 문제

### 1. 문제 원문

An architect ran a two-hour investigation into a flaky payment-retry bug yesterday afternoon and named the session 'payment-retry-bug' before stopping for the day. This morning, a teammate wants the architect to pick the investigation back up with full context of everything already read and concluded, without hunting through the interactive session picker. Which approach satisfies this most directly?

A) Run claude --continue to resume the most recent session in the working directory

B) Start a new session and paste yesterday's terminal scrollback as the first prompt

C) Open the session picker with claude --resume and manually scroll to find the session

D) Run claude --resume payment-retry-bug to resume that exact named session directly

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**

**D번**: Run claude --resume payment-retry-bug to resume that exact named session directly

**정답 및 해설:**

**핵심 개념**: Claude Code CLI 세션 이름 지정 및 특정 세션 재개(`--resume <session_name_or_id>`)  
Claude Code CLI에서는 작업 세션에 이름을 부여할 수 있으며, 이전에 저장하거나 이름을 지정한 특정 세션을 인터랙티브 선택기(Session Picker) 목록에서 일일이 찾지 않고 즉시 재개하려면 `claude --resume <session_name>` 명령어를 사용합니다.

**문제 상황 분석:**
- 어제 'payment-retry-bug'라는 이름을 부여하고 종료한 세션이 존재함.
- 세션 선택기 UI에서 탐색하는 과정(hunting through the interactive session picker) 없이 바로 특정 세션을 지정해 열고자 함.
- 어제 작업한 모든 맥락과 파일 분석 결과가 그대로 유지되어야 함.

**D번이 정답인 이유:**
`claude --resume` 뒤에 특정 세션 이름(`payment-retry-bug`)을 인수로 직접 전달하면, 대화형 목록 선택기를 거치지 않고 명시한 세션을 바로 불러와 이전 컨텍스트 그대로 작업을 재개할 수 있습니다.

**오답 분석:**
- Option A (오답): `claude --continue`는 해당 디렉터리의 가장 최근 세션을 이어받는 명령어로, 어제 해당 작업 이후 다른 세션 명령을 실행했을 수 있는 가능성이 있고 특정 이름의 세션을 정확히 지정하는 명령어는 아닙니다.
- Option B (오답): 새 세션을 열어 텍스트를 붙여넣는 방식은 이전 세션의 상태, 도구 실행 결과, 캐시 등의 전체 맥락을 온전히 복원하지 못하므로 비효율적입니다.
- Option C (오답): 인자 없이 `claude --resume`만 실행하면 세션 선택기 목록이 열려 사용자가 수동으로 탐색해야 하므로, "without hunting through the interactive session picker"라는 문제의 조건에 위배됩니다.

---

## 81번 문제

### 1. 문제 원문

Two different PostToolUse hooks are registered for the same query_database tool: one truncates overly long result sets to a fixed row limit, and one converts embedded timestamps into ISO 8601. Both need to apply to the same tool response in sequence for the final output the model sees to be both trimmed and normalized. What should the architect verify about how these hooks combine?

A) Whether the hooks are declared using the same HookMatcher timeout value, because the SDK uses timeouts to resolve conflicts when multiple hooks register for the same event, and a mismatch causes one hook's output to be ignored if it finishes later.

B) Whether the hooks run in a way that lets the second hook operate on the first hook's updatedToolOutput, since if both run independently against the original response only one transformation may be applied.

C) Whether the SDK executes PostToolUse hooks in alphabetical order by hook name, because the hook registration system sorts callbacks by name to ensure deterministic processing, and reversing names could swap the truncation and normalization steps.

D) Whether both hooks share the same tool_use_id, because the SDK requires hooks to have identical matchers in order to compose their transformations on the same response, and mismatched IDs would cause the second hook to ignore the first's output.

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**

**B번**: Whether the hooks run in a way that lets the second hook operate on the first hook's updatedToolOutput, since if both run independently against the original response only one transformation may be applied.

**정답 및 해설:**

**핵심 개념**: Agent SDK의 PostToolUse Hook 파이프라인 / 체이닝(Chaining) 메커니즘  
동일한 도구(Tool) 호출 결과에 대해 여러 개의 `PostToolUse` 훅을 체이닝(Chaining)하여 결과를 순차적으로 가공할 때, 각 훅 단계는 이전 훅이 변경하여 파이프라인으로 전달한 `updatedToolOutput` 상태를 넘겨받아 이어서 작업해야 합니다. 훅들이 이전 훅의 출력이 아닌 원본 응답만 독립적으로 참조한다면 덮어쓰기 현상이 발생하여 최종적으로 하나의 변환 결과만 남게 됩니다.

**문제 상황 분석:**
- `query_database` 도구 결과에 2개의 `PostToolUse` 훅(결과 행 잘라내기, 타임스탬프 정규화)을 등록함.
- 최종적으로 모델에 전달되는 데이터는 "잘려진 동시에 정규화된" 데이터여야 함.
- 두 훅의 변환 작업이 상실 없이 연속적으로 중첩 적용되도록 체이닝 구조를 검증해야 함.

**B번이 정답인 이유:**
여러 `PostToolUse` 훅을 사용하여 동일한 도구 출력을 순차 변환할 경우, 두 번째 훅이 첫 번째 훅의 변경 결과물인 `updatedToolOutput`을 입력받아 연산을 수행하는 구조인지 확인해야 합니다. 만약 두 훅이 서로 독립적으로 원본 데이터만 바라보고 실행된다면 마지막에 반환된 변경값만 적용되어 이전 훅의 변환 내용이 유실되기 때문입니다.

**오답 분석:**
- Option A (오답): SDK는 동일 이벤트 충돌 해결을 위해 타임아웃 값을 기준으로 삼지 않으며, 더 늦게 끝나는 훅의 출력을 무시하는 로직을 사용하지 않습니다.
- Option C (오답): SDK의 훅 실행 순서는 알파벳 이름순 정렬에 의존하지 않으며, 등록된 파이프라인 체인의 연쇄 작업 방식을 검증하는 것이 핵심입니다.
- Option D (오답): `tool_use_id`는 실행된 특정 도구 호출의 고유 식별자일 뿐이며, 파이프라인 합성을 위해 두 훅에 별도로 수동 지정하거나 동일하게 맞춰야 하는 파라미터가 아닙니다.

---

## 82번 문제

### 1. 문제 원문

A platform team is building a research assistant using Claude Agent SDK subagents. During code review, they notice that two subagents pass results directly to each other through a shared file that the coordinator never inspects, and when one subagent fails, the coordinator has no visibility into what happened. Which architectural change should the team make to align with the hub-and-spoke coordinator pattern?

A) Route all inter-subagent communication through the coordinator so it can log outcomes and handle failures consistently

B) Merge the two subagents into one combined subagent that also owns the coordinator's error-handling responsibilities

C) Configure the subagents to poll a shared task queue directly and notify the coordinator only after completion

D) Give each subagent direct write access to a shared database so they can exchange results outside the coordinator's view

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**

**A번**: Route all inter-subagent communication through the coordinator so it can log outcomes and handle failures consistently

**정답 및 해설:**

**핵심 개념**: Hub-and-Spoke Coordinator Pattern (허브 앤 스포크 코디네이터 패턴)  
다중 에이전트 시스템에서 중심이 되는 코디네이터(Hub)가 모든 하위 서브에이전트(Spoke) 간의 데이터 흐름, 상태 관리, 에러 처리를 중앙 집중식으로 제어하는 아키텍처 패턴입니다. 서브에이전트 간의 직접적인 통신이나 우회 채널을 제거하고 코디네이터를 통해서만 데이터를 주고받게 함으로써 시스템 전체의 가시성(Visibility)과 제어력을 확보합니다.

**문제 상황 분석:**
- 두 서브에이전트가 코디네이터를 거치지 않고 공유 파일로 결과를 직접 주고받고 있음.
- 서브에이전트에 에러/실패가 발생해도 중앙 코디네이터가 이를 인지하거나 제어할 수 없는 가시성 결여 문제 발생.
- 시스템을 표준 허브 앤 스포크 패턴으로 정렬하기 위한 올바른 구조 변경을 찾아야 함.

**A번이 정답인 이유:**
허브 앤 스포크 패턴의 핵심 원칙은 중앙의 허브(코디네이터)가 모든 통신과 제어 흐름의 중심이 되는 것입니다. 서브에이전트 간의 모든 데이터 교환을 코디네이터를 거치도록 라우팅하면, 코디네이터가 중간 결과를 로깅하고 에러가 발생했을 때 이를 감지하여 일관되게 예외 처리를 수행할 수 있습니다.

**오답 분석:**
- Option B (오답): 서브에이전트를 단순히 하나로 통합하고 에러 처리 책임을 서브에이전트에게 넘기는 것은 코디네이터의 본래 역할(중앙 제어 및 모니터링)을 왜곡하며 아키텍처적으로 바람직하지 않습니다.
- Option C (오답): 공유 큐를 직접 폴링하고 완료 후에만 알리는 방식 역시 작업 진행 상황 및 중간 실패에 대한 코디네이터의 실시간 가시성을 떨어뜨립니다.
- Option D (오답): 공유 데이터베이스를 통해 코디네이터의 시야 밖에서 직접 통신하게 만드는 것은 문제에서 지적한 공유 파일 우회 방식과 동일한 결함을 반복하는 행동입니다.

---

## 83번 문제

### 1. 문제 원문

An architect is consolidating tool-output normalization into a single PostToolUse hook that must work for both MCP tools and built-in tools. Currently, a legacy MCP tool uses updatedMCPToolOutput and a newer built-in tool uses updatedToolOutput. Which field should the shared hook use to replace the output for both tool types?

A) updatedToolOutput, because it replaces output for all tools (built-in and MCP) in the PostToolUse hook, while updatedMCPToolOutput only works for MCP tools.

B) systemMessage, because it can be used to display the normalized output to the user for all tools.

C) updatedMCPToolOutput, because it is the field intended for cross-tool output replacement.

D) additionalContext, because it provides a way to add extra information that overrides the original tool output.

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**

**A번**: updatedToolOutput, because it replaces output for all tools (built-in and MCP) in the PostToolUse hook, while updatedMCPToolOutput only works for MCP tools.

**정답 및 해설:**

**핵심 개념**: Agent SDK PostToolUse Hook의 표준 출력 교체 필드  
`PostToolUse` 훅 반환 객체에서 `updatedToolOutput`은 표준(Standardized/General) 필드로서 내장 도구(built-in tools)와 MCP 도구(MCP tools) 모두의 출력을 대체/교체할 수 있습니다. 과거 구버전 필드인 `updatedMCPToolOutput`은 MCP 도구에만 한정되지만, `updatedToolOutput`은 범용 필드로 호환성을 제공합니다.

**문제 상황 분석:**
- MCP 도구와 내장 도구 모두의 출력을 정규화하는 단일 `PostToolUse` 훅을 통합 작성 중임.
- 레거시 코드는 `updatedMCPToolOutput`을 사용하고 신규 코드는 `updatedToolOutput`을 사용함.
- 두 종류의 도구 모두에서 출력 변경이 작동하는 표준 통합 필드를 선택해야 함.

**A번이 정답인 이유:**
`updatedToolOutput` 필드는 `PostToolUse` 훅에서 내장(built-in) 도구와 MCP 도구를 가리지 않고 모든 도구의 최종 출력을 재정의(override)할 수 있는 범용 표준 필드입니다. 반면 `updatedMCPToolOutput`은 레거시 MCP 도구 전용 필드이므로 내장 도구의 출력을 교체할 수 없습니다. 따라서 공유 훅에서는 `updatedToolOutput`을 사용해야 합니다.

**오답 분석:**
- Option B (오답): `systemMessage`는 사용자 UI에 알림이나 보조 안내 메시지를 보여주기 위한 용도이지, 도구 실행 결과(Tool Output) 자체를 대체하여 모델에 전달하는 용도가 아닙니다.
- Option C (오답): `updatedMCPToolOutput`은 교차 도구(cross-tool)용 필드가 아니며, MCP 도구로 범위가 제한되는 레거시 전용 필드입니다.
- Option D (오답): `additionalContext`는 기존 출력에 부가적인 컨텍스트를 추가하는 필드일 뿐, 기존 도구 출력을 완전 대체(replace/override)하는 용도가 아닙니다.

---

## 84번 문제

### 1. 문제 원문

An application serves many concurrent users, each with their own long-running investigation conversation against the same repository directory. A backend service needs to resume a specific user's conversation on demand, potentially hours after the user's last message, while other users' sessions remain active in the same directory. Which session option should the service use?

A) Track each user's captured session ID and pass it to resume when that user sends a follow-up

B) Set fork_session=True on every request so each user gets an isolated copy of the directory's latest session

C) Rely on the session picker to let the backend service select the correct user's conversation

D) Pass continue_conversation=True (or continue: true) on every incoming request regardless of user

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**

**A번**: Track each user's captured session ID and pass it to resume when that user sends a follow-up

**정답 및 해설:**

**핵심 개념**: Session ID 기반 다중 사용자 세션 관리 및 Resume  
동일한 작업 디렉터리 내에서 여러 사용자가 동시 세션을 유지하거나 개별 대화를 복원해야 할 경우, 각 사용자 세션마다 부여되는 고유한 **Session ID**를 저장·관리하는 것이 필수적입니다. 백엔드 서비스가 특정 사용자의 이전 대화 맥락을 정확히 이어받으려면, 해당 사용자의 Session ID를 명시하여 세션을 재개(`resume`)해야 합니다.

**문제 상황 분석:**
- 동일한 리포지토리 디렉터리에서 여러 동시 사용자가 개별적으로 대화를 진행함.
- 마지막 메시지 전송 후 수 시간이 지나더라도 특정 사용자의 대화를 선택적으로 재개해야 함.
- 동일 디렉터리 내에서 다른 사용자들의 세션도 동시에 활성화되어 있으므로 대화 간 혼선이 없어야 함.

**A번이 정답인 이유:**
세션 ID는 특정 대화 흐름(History 및 Context)을 식별하는 고유한 값입니다. 백엔드가 사용자별로 할당된 Session ID를 DB나 메모리에 추적·저장해 두고, 해당 사용자가 후속 요청을 보낼 때 그 Session ID를 명시하여 재개(`resume`)하면 동일한 디렉터리 내에서 다른 사용자 세션과의 충돌 없이 특정 사용자의 맥락만 정확히 이어서 처리할 수 있습니다.

**오답 분석:**
- Option B (오답): `fork_session=True`는 기존 세션의 상태를 복사하여 새로운 브랜치를 생성하는 옵션입니다. 개별 사용자의 대화 맥락을 지속적으로 이어가는 세션 유지 목적에 적합하지 않으며, '최신 세션'을 복사하는 방식은 다른 사용자의 세션과 혼선이 발생합니다.
- Option C (오답): 세션 선택기(Session Picker)는 CLI 환경에서 사람이 터미널을 통해 수동으로 세션을 고르는 대화형 UI 인터페이스입니다. 자동화된 백엔드 서비스(Backend Service)가 프로그래밍 방식으로 선택해 사용할 수 있는 옵션이 아닙니다.
- Option D (오답): `continue` 또는 가장 최근 세션을 이어받는 옵션을 사용자 구별 없이 적용하면, 동일 디렉터리 내에서 다른 사용자가 가장 최근에 남긴 세션을 잘못 불러오게 되어 데이터 오염 및 대화 혼선이 발생합니다.

---

## 85번 문제

### 1. 문제 원문

During a security audit, an agent is asked to determine whether a reported vulnerability in one library is exploitable anywhere in a large application. The affected call sites, their reachability, and the mitigations already in place are all unknown at the start. Which task decomposition pattern should the architect choose, and why?

A) Prompt chaining, because vulnerability audits always follow the same three fixed steps of scan, patch, and verify regardless of the application involved

B) Prompt chaining, because breaking the audit into a fixed number of stages guarantees that every call site will be found before the process finally ends

C) A single-pass prompt, because the model can always determine exploitability directly from the vulnerability's CVE description without ever inspecting the codebase

D) Orchestrator-workers, because the required investigation steps cannot be predicted upfront and must be generated from what each search for call sites reveals

---

### 3. 정답 및 해설 (Answer & Explanation)

**정답:**

**D번**: Orchestrator-workers, because the required investigation steps cannot be predicted upfront and must be generated from what each search for call sites reveals

**정답 및 해설:**

**핵심 개념**: Dynamic Task Decomposition / Orchestrator-Workers Pattern  
오케스트레이터-워커(Orchestrator-Workers) 패턴은 중앙의 오케스트레이터 에이전트가 작업을 동적으로 할당 및 분해하여 여러 워커(Worker) 에이전트에게 전파하는 워크플로 패턴입니다. 전체 하위 작업의 수나 구체적인 탐색 경로를 사전에 예측할 수 없고, 동적으로 발견되는 결과에 따라 다음 작업 단계를 생성해야 할 때 가장 적합합니다.

**문제 상황 분석:**
- 대규모 애플리케이션 내 라이브러리 취약점의 실제 악용 가능성(Exploitability)을 파악해야 함.
- 시작 시점에는 어디서 이 라이브러리를 호출하는지(Call sites), 도달 가능한지(Reachability), 완화 조치가 있는지 전혀 알 수 없음.
- 탐색 결과(호출 지점 발견 등)에 따라 조사해야 할 대상과 하위 작업이 동적으로 늘어나고 변함.

**D번이 정답인 이유:**
호출 지점과 도달 가능성을 미리 알 수 없는 유연하고 복잡한 시스템에서는 하위 탐색 단계나 세부 조사를 사전에 고정된 단계(Fixed steps)로 정의할 수 없습니다. 오케스트레이터(Orchestrator)가 각 워커의 탐색 결과(어디서 해당 라이브러리를 호출하는지)를 받아보고, 그에 맞춰 추가 분석이나 검증 작업을 워커들에게 동적으로 분배하는 **Orchestrator-workers** 패턴이 필연적입니다.

**오답 분석:**
- Option A (오답): 프롬프트 체이닝(Prompt chaining)은 일직선상의 고정된 단계(Sequential, Fixed pipeline)를 순차 실행할 때 적합합니다. 탐색 대상과 범위가 동적으로 바뀌는 가변적인 조사에는 적합하지 않습니다.
- Option B (오답): 고정된 단계로 나누는 것만으로는 코드베이스 내의 모든 호출 지점을 찾아내는 것을 보장할 수 없으며, 예기치 못한 호출 구조에 대처하지 못합니다.
- Option C (오답): CVE 설명만 보고 실제 코드베이스를 검사하지 않은 채 개별 애플리케이션에서의 악용 가능성을 완벽히 판단하는 것은 불가능합니다.

---

## 86번 문제

**1. 문제 원문**

A reviewer is designing an agentic code review for a pull request that touches 40 files across a monorepo. Reviewers have noticed that when a single pass tries to hold all 40 files in context at once, subtle cross-file issues are missed and comments become generic. What restructuring addresses this attention dilution problem?

A) Randomize the file order within the single combined pass before each run so different files receive more attention each time

B) Run a per-file local analysis pass on each file independently, then run a separate cross-file integration pass over the per-file findings

C) Keep the single combined pass but instruct the model to prioritize whichever files appear first in the diff ordering

D) Raise the review prompt's sampling temperature so the single combined pass considers a wider range of possible issues across all the files

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Run a per-file local analysis pass on each file independently, then run a separate cross-file integration pass over the per-file findings

**정답 및 해설:**

**핵심 개념**: 분할 정복(Divide and Conquer) 기반의 에이전트 워크플로우 설계 및 주의력 분산(Attention Dilution) 방지. 대규모 컨텍스트를 한 번에 처리할 때 발생하는 성능 저하를 방지하기 위해 단계를 분리(개별 파일 분석 -> 결과 요약 기반의 통합 분석)하여 처리합니다.

**문제 상황 분석:**
- 모노레포 내 40개 파일에 달하는 대용량 코드를 단일 LLM 프롬프트/패스로 처리하려 하고 있음.
- 컨텍스트 길이가 길어짐에 따라 Attention Dilution(주의력 분산) 현상이 발생하여 미묘한 연관 이슈를 놓치고 코멘트가 추상적으로 변함.
- 처리 구조를 재설계하여 각 파일에 대한 세밀한 분석과 파일 간 통합 분석 성능을 둘 다 확보해야 함.

**B번이 정답인 이유:**
40개 파일을 한 번에 처리하면 LLM의 Attention 메커니즘이 분산되어 세부 사항을 놓치게 됩니다. 먼저 1단계(Map)로 각 파일별 독립 분석 패스를 수행하여 파일 내부의 세부 문제 및 핵심 요약(Findings)을 추출하고, 2단계(Reduce/Integration)로 요약된 결과들만 모아 파일 간 연관성을 분석하는 단계적 에이전트 아키텍처를 도입하면 각 단계별 컨텍스트 부하를 극적으로 줄이면서도 정확도를 극대화할 수 있습니다.

**오답 분석:**
- Option A (오답): 순서를 무작위로 바꾸더라도 한 번에 40개 전체 파일을 컨텍스트에 넣는 본질적인 프롬프트 길이 및 Attention 분산 문제는 전혀 해결되지 않으며 비결정성만 증가합니다.
- Option C (오답): 앞쪽 파일에만 우선순위를 두면 뒤쪽에 위치한 파일의 검토 품질이 심각하게 떨어지며 전체적인 검토 누락 문제를 다루지 못합니다.
- Option D (오답): Temperature(온도)를 높이는 것은 모델의 출력 무작위성과 창의성을 높이는 옵션일 뿐, 컨텍스트 초과 및 Attention 분산 문제를 해결해주지 않으며 오히려 환각(Hallucination) 위험만 증가시킵니다.

---

## 87번 문제

**1. 문제 원문**

An architect is designing a serverless pipeline where each stage runs in a fresh, short-lived container and cannot guarantee access to any previous container's local disk. The pipeline still needs later stages to act on the conclusions of an earlier stage's investigation. Which strategy best fits this constraint?

A) Pass the earlier stage's session ID to resume in the next container and expect the transcript to be found automatically

B) Capture the earlier stage's key results as application state and pass them into a new session's opening prompt

C) Set fork_session=True in the next container so it branches from the earlier stage's session ID directly

D) Rely on claude --continue in the next container to pick up the most recent local session automatically

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Capture the earlier stage's key results as application state and pass them into a new session's opening prompt

**정답 및 해설:**

**핵심 개념**: 비저장성(Stateless) 컨테이너 환경에서의 상태 관리 및 프롬프트 주입. 로컬 디스크나 세션 대화 기록이 유지되지 않는 환경에서는 상태(결과 데이터)를 외부 애플리케이션 상태로 관리하고 새 컨테이너 프롬프트에 주입해야 합니다.

**문제 상황 분석:**
- 각 단계는 매번 새로 생성되고 곧 사라지는(fresh, short-lived) 서버리스 컨테이너에서 독립적으로 실행됨.
- 컨테이너 간 로컬 디스크 공유가 불가능하므로, 이전 컨테이너의 로컬 세션 파일이나 트랜스크립트에 직접 접근할 수 없음.
- 이전 단계의 조사 결과 및 결론을 다음 단계의 에이전트/컨테이너로 전달해야 하는 구조적 제약이 존재함.

**B번이 정답인 이유:**
서버리스 환경에서는 이전 컨테이너의 파일 시스템이 영구 보존되지 않으므로, 로컬 세션 파일이나 트랜스크립트에 의존하는 모든 방식은 실패합니다. 따라서 이전 단계에서 도출된 핵심 결과 및 결론(Key results)을 외부 저장소/파이프라인 변수(Application state)로 추출·저장한 뒤, 다음 단계 컨테이너가 시작될 때 새 세션의 첫 프롬프트(Opening prompt)에 Context 형태로 전달하는 방식이 유일하게 동작하는 전략입니다.

**오답 분석:**
- Option A (오답): 세션 ID만 전달해서는 로컬 디스크가 영구 보존되지 않는 서버리스 컨테이너에서 이전 세션의 트랜스크립트 파일(.jsonl 등)을 찾아낼 수 없습니다.
- Option C (오답): `fork_session` 기능은 이전 세션의 디스크 파일 및 트랜스크립트가 로컬에 존재함을 전제로 동작하므로, 로컬 디스크가 공유되지 않는 환경에서는 작동하지 않습니다.
- Option D (오답): `claude --continue`는 해당 컨테이너 내부 로컬 디스크의 가장 최근 세션을 이어가는 명령어입니다. 완전히 새로운(fresh) 컨테이너에서는 이전 세션 히스토리가 존재하지 않으므로 작동하지 않습니다.

---

## 88번 문제

**1. 문제 원문**

A coordinator runs a "web-researcher" subagent that gathers ten sources on a topic, then spawns a "synthesis" subagent to write the final report. The synthesis subagent's output ignores nearly all of the researcher's findings and instead re-derives generic conclusions from scratch. The coordinator's prompt to synthesis only said "Write a report based on the research that was just completed." What change fixes this?

A) Switch the synthesis subagent's model to a larger model so it infers the missing research context from the phrase "just completed" more reliably

B) Increase the synthesis subagent's maxTurns so it has enough turns to independently rediscover the same ten sources the researcher already found

C) Include the complete findings from web-researcher directly in synthesis's prompt, since subagents never automatically inherit parent or sibling context

D) Grant synthesis the same search tools as web-researcher so it can re-run the original queries itself before drafting the final written report

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Include the complete findings from web-researcher directly in synthesis's prompt, since subagents never automatically inherit parent or sibling context

**정답 및 해설:**

**핵심 개념**: 멀티 에이전트 아키텍처에서의 컨텍스트 격리(Context Isolation) 및 데이터 전달. 독립된 서브에이전트는 부모 또는 형제 에이전트의 수행 대화 이력(Context)을 자동으로 공유받지 않으므로, 필요한 결과 데이터는 명시적으로 프롬프트에 포함하여 전달해야 합니다.

**문제 상황 분석:**
- 코디네이터가 `web-researcher`를 실행해 데이터를 모은 후, 별도의 `synthesis` 서브에이전트를 새로 생성함.
- `synthesis` 에이전트에게 "방금 완료된 조사를 기반으로 보고서를 써라"라고만 프롬프트를 전달함.
- 서브에이전트는 독립된 세션/컨텍스트를 가지고 시작되므로, 이전 `web-researcher`가 무엇을 조사했는지 알지 못해 상투적이고 독자적인 내용만 작성함.

**C번이 정답인 이유:**
서브에이전트는 기본적으로 독립적인 실행 환경(Clean state)을 가집니다. 부모 에이전트나 다른 형제 서브에이전트(`web-researcher`)가 수행한 대화나 조사 결과는 명시적으로 전달해주지 않으면 `synthesis` 에이전트가 접근할 수 없습니다. 따라서 코디네이터가 `web-researcher`로부터 받은 최종 결과 데이터를 `synthesis`에 전달하는 프롬프트에 명시적으로 인젝션(Direct Injection)해 주어야 문제가 해결됩니다.

**오답 분석:**
- Option A (오답): 컨텍스트 자체가 전달되지 않았으므로, 모델의 크기(파라미터 수)를 늘리더라도 존재하지 않는 정보를 독심술처럼 알아낼 수 없습니다.
- Option B (오답): 이미 다른 에이전트가 완료한 일을 처음부터 다시 검색하게 만드는 것은 턴 수 및 토큰 비용의 낭비이며, 에이전트 분업 아키텍처의 목적에 어긋납니다.
- Option D (오답): 검색 도구를 부여해 쿼리를 재실행하게 하는 것 역시 `web-researcher`가 수행한 작업을 불필요하게 중복 수행하는 비효율적인 방식입니다.

---

## 89번 문제

**1. 문제 원문**

An architect wants a "lead-investigator" subagent that, once running, can itself spawn narrower sub-investigator subagents to parallelize a large audit, while a separate "final-summarizer" subagent must never be allowed to spawn any subagents of its own. How should the two AgentDefinitions differ to enforce this?

A) Set lead-investigator's model to a larger model and final-summarizer's model to a smaller one, since only larger models are capable of nested delegation

B) Set background to true on lead-investigator only, since background execution is what grants an agent the ability to spawn further subagents

C) Include the subagent-invocation tool in lead-investigator's tools array, and omit it from (or add it to disallowedTools on) final-summarizer's definition

D) Give both agents identical tools arrays, but set a lower maxTurns on final-summarizer so it runs out of turns before it could attempt to spawn anything

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Include the subagent-invocation tool in lead-investigator's tools array, and omit it from (or add it to disallowedTools on) final-summarizer's definition

**정답 및 해설:**

**핵심 개념**: 에이전트 도구 권한 관리(Agent Tool Capabilities) 및 도구 기반 서브에이전트 제어. LLM 기반 에이전트가 다른 하위 에이전트를 생성/호출하는 권한은 에이전트에 부여된 도구(Tools)의 유무에 의해 결정됩니다.

**문제 상황 분석:**
- `lead-investigator` 에이전트는 대규모 작업을 분할하여 자식 서브에이전트를 생성(Spawn)해야 함.
- `final-summarizer` 에이전트는 하위 서브에이전트를 절대 생성하지 못하도록 제한해야 함.
- 프레임워크 차원에서 두 에이전트의 정의(AgentDefinition)를 다르게 구성하여 하위 에이전트 생성 기능 권한을 확실히 제어해야 함.

**C번이 정답인 이유:**
에이전트가 다른 서브에이전트를 생성/위임(Spawn/Delegate)하는 행위는 본질적으로 '서브에이전트 호출 도구(subagent-invocation tool)'를 사용할 수 있느냐에 달려 있습니다. 따라서 하위 에이전트 생성이 필요한 `lead-investigator`에는 해당 도구를 `tools` 목록에 제공하고, 하위 생성을 금지해야 하는 `final-summarizer`에는 해당 도구를 `tools` 배열에서 아예 제외하거나 `disallowedTools`에 명시하여 도구 접근 권한을 차단하는 것이 구조적 강제(Enforce)를 위한 정석적인 솔루션입니다.

**오답 분석:**
- Option A (오답): 모델 크기는 추론 및 문맥 파악 능력의 차이일 뿐이며, 하위 에이전트 생성 능력은 모델 크기가 아닌 사용 가능한 Tool 배열 정의에 의해 결정됩니다.
- Option B (오답): 백그라운드 실행 여부(`background: true`)는 프로세스 비동기 실행 방식과 관련된 옵션일 뿐, 서브에이전트를 생성할 수 있는 도구 권한을 부여하는 기능이 아닙니다.
- Option D (오답): `maxTurns`는 실행 가능한 최대 반복(Turn) 횟수를 제한할 뿐이며, 서브에이전트 생성 권한 자체를 차단하지 못합니다. 턴 수가 적더라도 첫 번째 턴에서 서브에이전트를 생성하려고 시도할 수 있으므로 확실한 제어가 불가능합니다.

---

## 90번 문제

**1. 문제 원문**

An architect is deciding whether identity verification before a refund needs a programmatic gate or can rely on prompt instructions alone. A colleague argues the system prompt already tells Claude to verify first, so a hook is redundant engineering effort. Why is the colleague's reasoning wrong for this specific workflow?

A) Claude cannot call two different tools within the same conversation turn, so verification and refund must be separated by a human-reviewed pause to execute each in its own turn.

B) The refund tool's schema does not expose a customer_id parameter, so the model has no field in which to store verification outcomes, preventing any automated check that verification was performed.

C) Refunds are financial and hard to reverse, and prompt instructions have a non-zero failure rate, so a single skipped verification becomes an unrecoverable compliance gap.

D) System prompts are truncated by the runtime after a fixed number of characters, so verification instructions placed near the end of a long prompt are silently dropped, making enforcement unreliable.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Refunds are financial and hard to reverse, and prompt instructions have a non-zero failure rate, so a single skipped verification becomes an unrecoverable compliance gap.

**정답 및 해설:**

**핵심 개념**: 프로그래밍적 가드레일(Programmatic Gate/Hook) vs 프롬프트 기반 지시의 차이. 결정론적(Deterministic)으로 반드시 준수되어야 하는 중요 비즈니스/컴플라이언스 로직에는 환각 및 확률적 오류 가능성이 있는 프롬프트 조작 대신 코드 수준의 훅(Hook)이나 가드레일이 필수적입니다.

**문제 상황 분석:**
- 환불 처리 전 신원 확인 절차를 프롬프트 지시만으로 처리할지, 코드 기반의 훅(Hook)/게이트로 강제할지 판단해야 함.
- 동료는 "프롬프트에 이미 지시했으니 훅 구현은 낭비"라고 주장함.
- 환불 작업은 즉각적인 금전 손실 및 컴플라이언스 위반을 초래하는 불가역적(Hard to reverse) 작업이라는 특성이 있음.

**C번이 정답인 이유:**
LLM의 프롬프트 지시 준수는 확률적(Probabilistic)이므로 100% 이행을 보장할 수 없으며, 언제나 실패율(non-zero failure rate)이 존재합니다. 일반적인 텍스트 생성은 오답이 나와도 영향도가 낮지만, 환불과 같은 금융 및 컴플라이언스 민감 작업은 단 한 번의 검증 누락으로도 심각한 금전적·법적 손실을 발생시킵니다. 따라서 프롬프트에만 의존해서는 안 되며, 프로그래밍 방식(Code Gate / Hook)으로 엄격하게 제어해야 한다는 점을 명확히 지적합니다.

**오답 분석:**
- Option A (오답): Claude는 단일 대화 턴 내에서 여러 도구를 연속적으로 호출(Parallel/Sequential Tool Calling)할 수 있으므로, 사람의 개입을 위해서만 턴이 분리된다는 제약은 사실이 아닙니다.
- Option B (오답): 툴 스키마의 `customer_id` 유무는 프롬프트와 프로그래밍적 가드레일 간의 강제성 비교와 직접적인 관련이 없는 지어낸 조건입니다.
- Option D (오답): Claude 런타임이 고정된 글자 수 이후 시스템 프롬프트를 무단으로 잘라내고 버린다는 설명은 사실이 아닙니다.

---

## 91번 문제

**1. 문제 원문**

After a coordinator aggregates results from search and analysis subagents into a synthesis report on 'emerging risks in supply chain cybersecurity,' the report thoroughly covers ransomware but omits any discussion of third-party vendor risk, which was part of the original scope. What should the coordinator do next?

A) Publish the report as final, since the coordinator already invoked every available subagent once already

B) Ask the synthesis subagent to rewrite the existing report in a different tone without gathering new source material

C) Evaluate the synthesis output for gaps, then re-delegate targeted queries on vendor risk before re-invoking synthesis

D) Restart the entire pipeline from scratch with a completely new set of subagents to avoid compounding earlier synthesis errors

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Evaluate the synthesis output for gaps, then re-delegate targeted queries on vendor risk before re-invoking synthesis

**정답 및 해설:**

**핵심 개념**: 코디네이터-서브에이전트 루프(Coordinator-Subagent Loop)에서의 결과 평가 및 타깃 재위임(Targeted Re-delegation). 코디네이터는 출력을 평가하여 요구사항 대비 누락된 영역(Gap)을 파악하고, 해당 부족 부분에 대해서만 표적 쿼리를 재위임하여 보고서를 보완해야 합니다.

**문제 상황 분석:**
- '공급망 사이버 보안의 신종 위험'에 대해 검색 및 분석 에이전트를 돌려 통합 보고서를 작성함.
- 원래 범위에 포함되어 있던 '제3자 공급업체 위험(third-party vendor risk)' 내용이 보고서에서 완전히 누락됨.
- 전체 작업을 처음부터 다시 하거나 불완전한 보고서를 그대로 제출하지 않고, 효율적으로 누락된 범위를 보완해야 하는 상황임.

**C번이 정답인 이유:**
에이전트 오케스트레이션 패턴에서 코디네이터는 단순한 전달자가 아니라 결과물의 품질과 완전성을 검증(Evaluate for gaps)하는 역할을 수행합니다. 원래 목표 범위 중 누락된 부분(Vendor risk)이 발견되었으므로, 해당 부분에 특화된 표적 쿼리를 서브에이전트에 다시 위임하여 추가 자료를 수집한 뒤 통합(Synthesis) 과정을 재실행하는 것이 가장 효율적이고 정확한 조치입니다.

**오답 분석:**
- Option A (오답): 원래 목표 범위의 핵심 내용이 누락되었음에도 이미 한 번씩 실행했다고 해서 미완성 보고서를 최종본으로 발행하는 것은 부적절합니다.
- Option B (오답): 새로운 자료 수집 없이 어조(Tone)만 바꾸는 것은 누락된 정보(Vendor risk)를 채워 넣지 못하므로 근본적인 해결책이 될 수 없습니다.
- Option D (오답): 잘 작성된 랜섬웨어 부분까지 모두 버리고 처음부터 전체 파이프라인을 재시작하는 것은 불필요한 토큰 소비 및 리소스 낭비를 초래합니다.

---

## 92번 문제

**1. 문제 원문**

An agent's inventory_lookup MCP tool returns stock levels as a numeric status code (0, 1, 2) meaning in-stock, low-stock, and out-of-stock respectively, while a separate warehouse_lookup tool returns the same concept as plain strings. The architect wants the model to reason over one consistent vocabulary for stock status regardless of which tool answered. Which hook change achieves this with a deterministic guarantee?

A) A SessionStart hook that documents the numeric-to-string mapping once in a system message shown to the user at the beginning of the session

B) A PreToolUse hook matched to both tools that rewrites tool_input so both tools receive identical request parameters before they execute

C) A PostToolUse hook matched to both tools that maps each tool's raw response onto the same set of string labels and returns it via updatedToolOutput

D) A UserPromptSubmit hook that reminds the model at the start of every turn to translate numeric status codes into the equivalent string labels itself

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: A PostToolUse hook matched to both tools that maps each tool's raw response onto the same set of string labels and returns it via updatedToolOutput

**정답 및 해설:**

**핵심 개념**: 결정론적 출력 정제(Deterministic Output Normalization) 및 `PostToolUse` 훅. 외부 도구가 반환하는 응답 형태가 상이할 때, 이를 결정론적(100% 확실한 코드 실행)으로 표준화하기 위해서는 도구 실행 직후 개입하여 응답 데이터를 수정하는 `PostToolUse` 훅을 사용해야 합니다.

**문제 상황 분석:**
- `inventory_lookup` 도구는 숫자 상태 코드(0, 1, 2)를 반환하고, `warehouse_lookup` 도구는 문자열("in-stock" 등)을 반환함.
- 모델이 어느 도구를 사용하든 상관없이 동일한 규격의 문자열 표현으로 재고 상태를 해석할 수 있도록 전처리가 필요함.
- 확률적인 프롬프트 지시(Probabilistic)가 아닌 100% 확실한 코드 기반(Deterministic) 보장이 필요함.

**C번이 정답인 이유:**
도구 호출 결과가 모델(LLM)의 컨텍스트로 들어가기 바로 전 단계인 `PostToolUse` 라이프사이클 훅을 활용하면, 도구의 원시 응답(raw response)을 결정론적 파이프라인 코드로 인터셉트할 수 있습니다. 각 도구가 반환한 결과값을 동일한 규격의 문자열 레이블 세트로 정제(Mapping)한 뒤 `updatedToolOutput`을 통해 모델에게 전달하면, 모델은 항상 일관된 형식의 재고 상태 어휘 데이터만 수신하게 되어 100% 확실하게 추론을 수행할 수 있습니다.

**오답 분석:**
- Option A (오답): 프롬프트/시스템 메시지에 매핑 정보를 문서화하는 것은 모델의 환각이나 확률적 실수 가능성이 남으므로 '결정론적 보장(deterministic guarantee)'을 제공하지 못합니다.
- Option B (오답): `PreToolUse` 훅은 도구가 실행되기 전에 요청 입력값(`tool_input`)을 변경하는 훅입니다. 문제에서 원하는 것은 도구 실행 후 결과값의 정제이므로 시점이 맞지 않습니다.
- Option D (오답): 매 턴 프롬프트로 변환 지시를 상기시키는 방식 역시 확률적인 프롬프트 지시일 뿐이며, 코드 수준의 결정론적 보장을 제공하지 못합니다.

---

## 93번 문제

**1. 문제 원문**

An architect is choosing between the Client SDK and the Agent SDK for an internal automation that must read files, run shell commands, and iterate until a task is done, while avoiding a hand-written tool-execution loop. Which factor should most influence this decision?

A) The Client SDK cannot return a stop_reason value at all, making any tool-use loop impossible to build without adopting the Agent SDK

B) Both SDKs need an identical amount of custom loop code to handle stop_reason, so the choice should rest solely on language preference

C) The Agent SDK bundles built-in tools and runs the agentic loop internally, while the Client SDK requires manually inspecting stop_reason

D) The Agent SDK requires the team to manually append tool_result blocks after every call, unlike the Client SDK, which appends them automatically

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: The Agent SDK bundles built-in tools and runs the agentic loop internally, while the Client SDK requires manually inspecting stop_reason

**정답 및 해설:**

**핵심 개념**: Client SDK vs Agent SDK 차이점. Agent SDK는 내장 도구(파일 읽기, 셸 실행 등)와 실행 자율성을 갖춘 에이전틱 루프(Agentic Loop)를 자체 제공하는 반면, Client SDK는 API 인터페이스만 제공하므로 개발자가 `stop_reason`을 확인하고 도구를 실행해 결과를 다시 넣어주는 루프를 직접 작성해야 합니다.

**문제 상황 분석:**
- 파일 읽기, 쉘 명령어 실행, 작업 완료 시까지 반복(Iteration)을 수행하는 내부 자동화 도구 구축 필요.
- 개발자가 직접 수동으로 도구 실행 루프(hand-written tool-execution loop)를 작성하는 것을 피하고자 함.
- 두 SDK의 기능적 구조 차이점(내장 루프 및 기본 도구 지원 유무)을 바탕으로 최선의 선택을 해야 함.

**C번이 정답인 이유:**
Client SDK(Anthropic API Client)는 기본 API 통신 라이브러리로, LLM이 `tool_use`를 요청할 때 응답의 `stop_reason`을 사용자가 직접 확인하고 해당 도구를 수동으로 실행한 뒤 결과를 프롬프트에 다시 덧붙이는 루프를 구현해야 합니다. 반면 Agent SDK(Claude Code SDK / Agent Framework)는 파일 읽기/쓰기, Bash 실행 등의 내장 도구(Built-in tools)와 도구 실행 및 결과 반환을 무한히 반복하는 에이전틱 루프(Agentic loop)를 내부적으로 추상화하여 자동으로 처리해 주므로, 문제의 조건에 가장 부합합니다.

**오답 분석:**
- Option A (오답): Client SDK도 API 응답으로 `stop_reason`(`tool_use`, `end_turn` 등)을 정상 반환합니다. 단지 루프 코드를 개발자가 직접 짜야 할 뿐입니다.
- Option B (오답): Agent SDK는 내부적으로 루프를 자동 처리하므로 수동 루프 코드가 필요 없습니다. 따라서 두 SDK가 요구하는 커스텀 루프 코드의 양은 전혀 동일하지 않습니다.
- Option D (오답): 설명이 반대로 되어 있습니다. `tool_result` 블록을 수동으로 추가해야 하는 것은 Client SDK이며, Agent SDK는 이 과정을 자동화합니다.

---

## 94번 문제

**1. 문제 원문**

A coordinator needs to orchestrate a large-scale codebase migration involving on the order of two hundred independent file-level subtasks, far more than the handful of subagents a coordinator typically delegates to per turn. Which approach is best suited to this scale?

A) Use the Workflow tool to move orchestration into a script the runtime executes outside the conversation itself

B) Invoke a single general-purpose subagent and have it sequentially handle all subtasks within one context window

C) Keep using turn-by-turn subagent delegation but increase the coordinator's maxTurns to accommodate more invocations

D) Split the migration across multiple coordinators that each independently maintain their own separate pipeline

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Use the Workflow tool to move orchestration into a script the runtime executes outside the conversation itself

**정답 및 해설:**

**핵심 개념**: 대규모 에이전트 오케스트레이션과 외부 스크립트/Workflow 분리. 200개 이상의 무거운 서브태스크를 대화형 LLM 턴(Turn) 내에서 직접 조율하면 토큰 소비, 턴 제한, 대화 컨텍스트 오버헤드가 극심해지므로 결정론적인 외부 스크립트/Workflow 기반으로 오케스트레이션 로직을 분리하는 것이 정석입니다.

**문제 상황 분석:**
- 200여 개의 파일 수준 독립 서브태스크를 다루는 대규모 마이그레이션 작업을 오케스트레이션해야 함.
- 일반적으로 코디네이터 에이전트가 턴당 위임할 수 있는 서브에이전트 수(몇 개 수준)를 대폭 초과하는 수치임.
- 대화 컨텍스트 윈도우 한계 및 턴 수 제한을 극복하면서 이 규모의 오케스트레이션을 안정적으로 처리할 방법이 필요함.

**A번이 정답인 이유:**
대화형 에이전트(LLM)가 200개 이상의 서브태스크를 일일이 턴을 거쳐 관리하려고 하면 컨텍스트 윈도우가 폭발하고 대화 턴 수 한계에 부딪히며 지연 시간과 비용이 기하급수적으로 증가합니다. 이때 Workflow 도구(Workflow tool)를 사용하면 대규모 루프 및 배치 오케스트레이션 로직을 대화 밖의 외부 스크립트(Script/Runtime)로 넘겨 독립적으로 실행시킨 뒤 최종 결과만 수신하게 할 수 있습니다. 이를 통해 컨텍스트 소비를 최소화하고 안정적인 대규모 자동화를 달성할 수 있습니다.

**오답 분석:**
- Option B (오답): 하나의 컨텍스트 윈도우 내에서 200개 파일 작업을 순차 처리하는 것은 용량 초과(Context Window Overflow) 및 주의력 분산(Attention Dilution)을 일으키며 100% 실패하게 됩니다.
- Option C (오답): `maxTurns`만 늘려서 대화 턴 내에서 200번 이상 서브에이전트를 계속 호출하게 만드는 것은 비효율적인 토큰 낭비와 긴 실행 지연을 초래하며, 대화 컨텍스트 오버헤드를 해결하지 못합니다.
- Option D (오답): 중앙 조율 스크립트 없이 여러 코디네이터로 단순히 쪼개어 각각 파이프라인을 유지하도록 만들면, 코디네이터 간의 상태 동기화 및 작업 중복 관리 등 또 다른 복잡성을 야기합니다.

---

## 95번 문제

**1. 문제 원문**

Two sub-agents independently research the release year of a major historical event: one reports 1969, the other reports 1970, citing different sources. Under the orchestrator-subagent pattern, how should the orchestrator handle this discrepancy before presenting a final answer?

A) The orchestrator aggregates the findings and presents the conflicting reports to the end user with references to the different sources, rather than unilaterally resolving the discrepancy.

B) The end user handles the discrepancy because sub-agents are not permitted to report ambiguous or conflicting findings to the orchestrator.

C) Whichever sub-agent returned its result first takes precedence, since first-to-respond is authoritative in a hub-and-spoke architecture.

D) The conflicting results should be discarded to maintain output consistency, and the orchestrator should provide no answer.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: The orchestrator aggregates the findings and presents the conflicting reports to the end user with references to the different sources, rather than unilaterally resolving the discrepancy.

**정답 및 해설:**

**핵심 개념**: 오케스트레이터-서브에이전트 패턴(Orchestrator-Subagent Pattern) 및 데이터 합성(Data Synthesis)
오케스트레이터-서브에이전트 패턴에서 오케스트레이터의 역할은 하위 에이전트들의 작업 결과를 수집, 요약, 종합(Synthesize)하여 사용자에게 명확한 정보를 전달하는 것입니다. 출처가 다른 상충 정보가 발생했을 때 환각(Hallucination)이나 자의적 판단으로 특정 값을 임의 채택하지 않고, 근거와 함께 상충 상황을 투명하게 안내하는 것이 올바른 디자인 패턴입니다.

**문제 상황 분석:**
- 두 서브 에이전트가 동일한 사건에 대해 서로 다른 출처를 기반으로 1969년과 1970년이라는 불일치된 결과를 반환함.
- 오케스트레이터는 어느 한쪽이 확실히 맞다고 단정할 수 없는 상태에 직면함.
- 시스템의 신뢰성과 투명성을 유지하면서 최종 답변을 사용자에게 제공해야 함.

**A번이 정답인 이유:**
오케스트레이터는 자의적으로 불일치를 무시하거나 하나의 답을 임의 선택해서는 안 됩니다. 대신 두 서브 에이전트의 조사 결과를 모두 집계하고, 각각의 출처 정보와 함께 상충되는 내용을 사용자에게 있는 그대로 제시하여 사용자가 상황을 판단할 수 있도록 돕는 것이 시스템의 투명성과 정보 정확성 측면에서 가장 적절합니다.

**오답 분석:**

- Option B (오답): 서브 에이전트가 오케스트레이터에게 모호하거나 상충되는 결과를 보고할 수 없다는 제약 조건은 사실이 아닙니다. 서브 에이전트는 검색/조사된 결과를 있는 그대로 보고해야 합니다.
- Option C (오답): 단순히 먼저 응답했다는 속도(First-to-respond)만으로 결과의 정확성이나 권위(Authoritative)를 담보할 수 없습니다.
- Option D (오답): 결과가 상충된다고 해서 모든 정보를 폐기하고 아무런 답변도 제공하지 않는 것은 시스템의 유용성을 크게 저해하는 잘못된 방식입니다.

---

## 96번 문제

**1. 문제 원문**

An architect is implementing a PreToolUse hook to control `issue_refund` calls. The hook currently denies any refund over $500 with `permissionDecision: 'deny'` and a `permissionDecisionReason`. However, the agent retries the same refund multiple times, causing a poor user experience. Which change best addresses this retry behavior while maintaining deterministic control in the hook?

A) Switch the hook from `PreToolUse` to `PostToolUse` so the refund executes once; then automatically reverse the transaction if it exceeds $500.

B) Change the hook to return `permissionDecision: 'allow'` and provide an `updatedInput` that replaces the `issue_refund` call with a safe operation (e.g., a no-op `echo` command) so the tool call succeeds without performing the refund.

C) Remove the `permissionDecisionReason` string from the denial response to produce a shorter message that is less likely to contain phrasing the model might interpret as a reason to reattempt the `issue_refund` call.

D) Use `permissionDecision: 'ask'` to require human approval for the refund, stopping the retry loop and providing explicit oversight for irreversible actions.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Change the hook to return `permissionDecision: 'allow'` and provide an `updatedInput` that replaces the `issue_refund` call with a safe operation (e.g., a no-op `echo` command) so the tool call succeeds without performing the refund.

**정답 및 해설:**

**핵심 개념**: 훅을 통한 입력 변환(Input Rewriting) 및 에이전트 무한 재시도 차단
에이전트(LLM)는 도구 실행이 `deny`되면 이를 해결 가능한 오류로 받아들이고 계속해서 재시도하는 특성이 있습니다. 에이전트의 무한 재시도를 차단하면서 훅 시스템 레벨에서 자동화된 결정론적 제어(Deterministic Control)를 유지하기 위한 공식 패턴은, 에이전트에게는 성공(`allow`) 응답을 주되 `updatedInput`을 통해 실제 무해한 명령어(no-op/echo)로 우회 처리하는 것입니다.

**문제 상황 분석:**
- 500달러 초과 환불 요청 시 훅에서 `deny`를 반환함.
- 에이전트(LLM)가 거부 응답을 처리하고 종료하는 대신, 동일한 요청을 지속적으로 재시도하여 UX를 저해함.
- **조건:** 사람이 아닌 '훅'이 스스로 무한 재시도를 막고, 자동화된 결정론적 제어(Deterministic Control)를 계속 유지해야 함.

**B번이 정답인 이유:**
`permissionDecision: 'allow'`와 함께 `updatedInput`으로 실행 명령을 안전한 작업(예: `echo` 등 no-op)으로 교체하면, 에이전트는 도구 실행이 완전히 성공했다고 판단하여 재시도 루프를 즉시 종료합니다. 동시에 실제 환불은 수행되지 않으므로 훅이 완전한 결정론적 제어권을 가지게 됩니다.

**오답 분석:**

- Option A (오답): `PostToolUse`는 이미 환불 명령이 수행된 이후에 동작하므로 환불 실행 자체를 차단할 수 없습니다.
- Option C (오답): 메시지 단어 몇 개를 지우는 식의 프롬프트 수정은 LLM의 재시도 본능을 결정론적으로 제어하지 못합니다.
- Option D (오답): `'ask'` 방식은 최종 결정을 사람에게 위임(Human-in-the-loop)하므로, 훅 코드 자체에서 자동화된 결정론적 제어(Deterministic Control)를 유지하라는 요구사항에 부합하지 않으며 사용자 피로도를 증가시킵니다.

---

## 97번 문제

**1. 문제 원문**

A team runs multiple ad-hoc investigation sessions per week and wants every session to be easy to locate and resume using a human-readable handle, especially when several tasks run in parallel on the same day. What is the most direct way to make a session resumable by a memorable handle?

A) Rely on the default auto-generated display name that combines the directory name with a random suffix

B) Keep every session running continuously so that it never needs to be resumed by name at a later point

C) Give the session a descriptive name at startup or via /rename so it can later be resumed with claude --resume <name>

D) Note the raw session ID in a spreadsheet and resume with claude --resume <session-id> each time it's needed

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Give the session a descriptive name at startup or via /rename so it can later be resumed with claude --resume <name>

**정답 및 해설:**

**핵심 개념**: Claude Code 세션 관리(Session Management) 및 세션 이름 지정(Session Renaming)
Claude Code CLI 환경에서는 진행 중인 작업 세션을 저장하고 나중에 다시 이어서 작업할 수 있습니다. 기본적으로는 자동 생성된 세션 ID나 무작위 이름이 부여되지만, 시작 시 이름을 지정하거나 세션 내부에서 `/rename` 명령어를 사용하여 직관적이고 설명적인 이름(Human-readable/Memorable handle)을 부여하면, 추후 `claude --resume <name>` 명령으로 손쉽게 이전 작업 환경을 재개할 수 있습니다.

**문제 상황 분석:**
- 팀에서 매주 다수의 임시 조사 세션을 병렬로 실행함.
- 동일한 날짜에 여러 작업이 동시 진행되므로, 복잡한 세션 ID 대신 사람이 알아보기 쉬운 이름(Memorable handle)으로 세션을 식별하고 재개해야 함.
- 세션을 명확한 이름으로 다시 찾아 재개하기 위한 가장 직접적이고 표준적인 방안을 찾아야 함.

**C번이 정답인 이유:**
시작 시점에 세션 이름을 명시적으로 부여하거나 작업 도중 `/rename` 슬래시 명령어를 사용하면 세션에 사람이 이해하기 쉬운 식별자를 할당할 수 있습니다. 이후 `claude --resume <name>`을 실행하면 해당 세션의 컨텍스트를 즉시 다시 불러올 수 있으므로 문제의 요구사항을 가장 직접적으로 충족합니다.

**오답 분석:**

- Option A (오답): 무작위 접미사(Random suffix)가 붙은 자동 생성 이름은 병렬로 여러 세션이 진행될 때 원하는 세션을 직관적으로 구별하기 어렵습니다.
- Option B (오답): 세션을 계속 켜두는 것은 리소스 낭비이며, 세션을 종료했다가 나중에 사람이 읽기 쉬운 이름으로 다시 재개하려는 본문의 목적에 맞지 않습니다.
- Option D (오답): 임의의 원시 세션 ID(Raw session ID)를 스프레드시트에 일일이 적는 방식은 번거로우며, "기억하기 쉬운 핸들(Memorable handle)"을 사용하는 것이 아닙니다.

---

## 98번 문제

**1. 문제 원문**

An architect wants a compliance rule enforced so reliably that it must hold even if the model's system prompt is later edited by another team member who is unaware of the refund policy. Which design property makes a PreToolUse hook the right mechanism for this, compared to keeping the rule only in the system prompt?

A) The hook increases the model's confidence score for refund-related completions by adjusting sampling parameters, making it statistically less likely to produce a noncompliant call even if the prompt is altered.

B) The hook is registered in application code separate from the prompt, so a prompt edit cannot silently remove the enforcement as it could remove a sentence describing the same rule.

C) The hook is stored in the same configuration file as the system prompt, so any prompt edit is automatically validated against the hook's refund logic before being saved, preventing removal of the enforcement.

D) The hook automatically regenerates the system prompt on every session start from a template that includes the refund policy, so any manual edits are replaced with the compliant version.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: The hook is registered in application code separate from the prompt, so a prompt edit cannot silently remove the enforcement as it could remove a sentence describing the same rule.

**정답 및 해설:**

**핵심 개념**: 결정론적 가드레일(Deterministic Guardrails)과 관심사의 분리(Separation of Concerns)
LLM 에이전트 시스템에서 프롬프트(Natural Language Prompt)는 유연하지만 팀원의 실수나 우회 공격으로 수정 및 누락될 위험이 있습니다. 반면, `PreToolUse`와 같은 도구 실행 전 훅(Hook)은 프롬프트와 독립된 애플리케이션 프로그래밍 코드(Application Code)로 작동하므로 프롬프트 변경 여부와 상관없이 무조건 적용되는 결정론적(Deterministic) 강제력을 제공합니다.

**문제 상황 분석:**
- 환불 정책 규정 준수 규칙을 절대적으로 유지하고 싶음.
- 환불 정책을 잘 모르는 다른 팀원이 시스템 프롬프트를 수정하더라도 규칙이 파괴되지 않아야 함.
- 프롬프트 기반 제어 대비 `PreToolUse` 훅이 가지는 근본적인 설계상 장점을 찾아야 함.

**B번이 정답인 이유:**
`PreToolUse` 훅은 시스템 프롬프트의 텍스트가 아닌 애플리케이션 코드 수준에서 따로 등록되고 실행됩니다. 따라서 다른 개발자가 프롬프트에서 환불 규칙 안내 문장을 실수로 삭제하거나 수정하더라도, 소스코드에 작성된 훅의 결정론적 로직은 영향을 받지 않고 그대로 유지됩니다.

**오답 분석:**

- Option A (오답): 훅은 샘플링 파라미터를 조절하여 신뢰도 점수를 올리는 방식이 아니라, 도구 실행 직전에 인터셉트하여 승인/거부/변환을 수행하는 코드 레벨 제어 장치입니다.
- Option C (오답): 훅이 프롬프트와 동일한 설정 파일에 저장되어 프롬프트 저장을 자동 검증한다는 설명은 표준 훅 아키텍처의 동작 방식과 맞지 않습니다.
- Option D (오답): 훅은 프롬프트를 템플릿으로부터 재생성해 주는 도구가 아니며, 도구 호출(Tool Call) 단계에서 해당 요청을 가로채 제어하는 역할을 합니다.

---

## 99번 문제

**1. 문제 원문**

A prior session spent many turns reading and cross-referencing a large data-pipeline codebase, and most of its tool results are now stale because the pipeline was heavily refactored afterward. The architect has already captured the session's final conclusions in a structured summary (such as progress notes or a summary document) and only needs those conclusions—not the intermediate tool calls—to continue the next phase of work. Which continuation strategy is more reliable here?

A) Resume the prior session and issue /clear right after resuming to reset its context window

B) Start a fresh session and inject the already-prepared structured summary of the prior conclusions as the opening prompt

C) Resume the prior session so the agent inherits every cached tool result automatically as-is

D) Fork the prior session and continue exploration straight from its unmodified stale history

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Start a fresh session and inject the already-prepared structured summary of the prior conclusions as the opening prompt

**정답 및 해설:**

**핵심 개념**: 컨텍스트 오염 방지(Context Pollution Avoidance) 및 새 세션 프롬프트 주입(Fresh Session Injection)
코드베이스가 리팩토링되어 이전 작업의 중간 결과물(Tool Call Results)이 더 이상 유효하지 않을(Stale) 때는, 이전 히스토리를 그대로 유지하거나 재개하는 것이 모델에 환각이나 잘못된 전제를 유발할 수 있습니다. 이미 작성된 깔끔한 요약본만으로 새로운 세션을 시작하는 것이 컨텍스트 창을 정제하고 가장 신뢰성 높은 환경을 구축하는 표준 전략입니다.

**문제 상황 분석:**
- 이전 세션에서 수행한 대규모 코드 탐색 결과 및 도구 호출 이력이 리팩토링으로 인해 더 이상 유효하지 않음(Stale).
- 하지만 핵심 결론은 이미 아키텍트가 구조화된 요약 문서로 정리해 둔 상태임.
- 다음 단계 작업을 시작할 때 불필요하고 오래된 중간 도구 호출 내역을 배제하고 안전하게 작업을 계속하는 방법을 찾아야 함.

**B번이 정답인 이유:**
새로운 세션(Fresh Session)을 열고 이전에 정제된 구조화 요약본을 첫 프롬프트로 입력하면, 오래되고 왜곡된 도구 호출 히스토리로 인한 컨텍스트 오염을 완벽히 차단할 수 있습니다. 불필요한 토큰 소비도 줄이고 모델이 검증된 최신 결론 바탕으로 정확하게 동작할 수 있습니다.

**오답 분석:**

- Option A (오답): 이전 세션을 재개(Resume)한 뒤 `/clear`를 실행하는 것보다 처음부터 새 세션을 열고 요약본을 주입하는 것이 더 간결하고 확실하며, 세션 관리 측면에서 오버헤드가 없습니다.
- Option C (오답): 이전 세션을 그대로 재개하면 리팩토링 전의 오래된 캐시 결과(Stale tool result)를 에이전트가 참조하게 되어 잘못된 답변을 생성합니다.
- Option D (오답): 이전 세션을 포크하더라도 유효하지 않은 이전 히스토리가 그대로 유지되므로 에이전트가 오작동할 위험이 큽니다.

---

## 100번 문제

**1. 문제 원문**

An architect designs a workflow where a coordinator's subagent spawns its own subagent, which spawns another, several levels deep. According to official Anthropic documentation as of June 2026, what is the maximum nesting depth allowed for subagents in Claude Code?

A) Nesting stops automatically after the second level unless the subagent's model is set to a more capable tier.

B) Nesting is unlimited as long as each subagent has the Agent tool included in its allowed tools list.

C) Subagents can nest up to a maximum of five levels deep, including the main agent as the first level.

D) Only the main coordinator agent may spawn subagents on its own; no subagent may ever spawn another under any configuration.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Subagents can nest up to a maximum of five levels deep, including the main agent as the first level.

**정답 및 해설:**

**핵심 개념**: Claude Code 중첩 서브 에이전트(Nested Subagents) 및 컨텍스트격리 제약
Claude Code는 서브 에이전트가 또 다른 하위 서브 에이전트를 호출하는 중첩(Nesting) 구조를 공식 지원합니다. 무한 재귀 및 자원 낭비를 방지하기 위해 Anthropic 공식 스펙은 **최대 5단계(Depth 5)**의 하드 리밋(Hard Limit)을 적용합니다.

**문제 상황 분석:**
- 2026년 6월 Anthropic의 Claude Code 업데이트 스펙을 기반으로 함.
- 메인 코디네이터 에이전트로부터 시작하여 하위 서브 에이전트가 연속적으로 자식 에이전트를 생성(Nested Spawning)할 수 있는 최대 깊이를 묻고 있음.

**C번이 정답인 이유:**
Anthropic 공식 문서 및 릴리스 노트에 따르면, Claude Code의 중첩 서브 에이전트는 무한 루프와 과도한 API 비용을 방지하기 위해 메인 에이전트부터 포함하여 **최대 5단계(Level 5)** 깊이까지 생성되도록 제한(Cap)되어 있습니다. 각 단계는 독립된 컨텍스트 창을 가져 효율적인 작업 분담이 가능합니다.

**오답 분석:**

- Option A (오답): 모델 계층(Tier)에 따라 2단계로 제한이 해제되는 유연한 방식이 아니라, 하드 리밋으로 5단계가 적용됩니다.
- Option B (오답): `Agent` 도구가 허용되어 있다고 해서 무제한 중첩(Unlimited)이 허용되지 않습니다.
- Option D (오답): 서브 에이전트의 자식 생성 금지 제약은 초기 버전의 제한 사항이었으나, 업데이트를 통해 최대 5단계까지 중첩 생성이 가능하도록 확장되었습니다.

---

## 101번 문제

**1. 문제 원문**

For refunds between $500 and $1000, policy requires the agent to pause and let a human reviewer approve or reject before the refund proceeds, rather than blocking it outright or letting it run automatically. Which PreToolUse hookSpecificOutput configuration matches this requirement?

A) permissionDecision set to "deny", paired with a permissionDecisionReason that instructs the model to contact a human reviewer on its own

B) permissionDecision set to "allow", combined with an additionalContext note asking the model to mention the amount to the user afterward

C) permissionDecision set to "ask", so the operation is surfaced for approval instead of executing automatically or being silently rejected

D) async set to true with asyncTimeout raised to 60000, so the hook has enough time to reach a human reviewer before the call proceeds

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: permissionDecision set to "ask", so the operation is surfaced for approval instead of executing automatically or being silently rejected

**정답 및 해설:**

**핵심 개념**: PreToolUse Hook 및 승인 메커니즘 (`permissionDecision: 'ask'`)
Claude Code 및 Agentic Framework의 `PreToolUse` 훅에서는 도구 실행 전 제어를 위해 `permissionDecision` 속성을 사용합니다. 이 속성은 주로 `'allow'`(자동 승인), `'deny'`(차단/거부), `'ask'`(사람의 승인 요구)의 값을 가질 수 있습니다.

**문제 상황 분석:**
- 500달러~1000달러 사이의 환불 요청 발생.
- 완전 차단(`deny`)하거나 자동 실행(`allow`)하는 대신, 작업을 일시 정지하고 사람(Human Reviewer)의 승인/거절 판단을 받아야 함.
- 사람의 직접적인 개입(Human-in-the-loop)을 유도하는 훅 설정값을 찾아야 함.

**C번이 정답인 이유:**
`permissionDecision: 'ask'`로 설정하면 도구의 자동 실행이 일시 정지되고 사용자/검토자 UI 상에 승인 요청이 노출(Surface)됩니다. 이를 통해 사람이 직접 검토하여 승인(Approve)하거나 거절(Reject)할 때까지 도구 호출을 대기시킬 수 있으므로 정책 요구사항에 완벽하게 부합합니다.

**오답 분석:**

- Option A (오답): `'deny'`는 도구 실행을 완전히 거부 및 차단하는 설정입니다. 거부 사유를 프롬프트로 전달하더라도 사람의 승인 인터페이스를 띄워 진행 여부를 정하는 메커니즘이 아닙니다.
- Option B (오답): `'allow'`는 환불을 즉시 승인 및 실행해 버리므로 human reviewer의 사전 승인 정책을 위반합니다.
- Option D (오답): `async` 및 `asyncTimeout`은 훅 실행의 비동기 타임아웃을 조절하는 설정일 뿐, 사람에게 승인 요청을 전달하는 인터랙션 제어 권한(Permission Decision)을 구성하지 못합니다.

---

## 102번 문제

**1. 문제 원문**

A support-ticket triage system always invokes a full pipeline of five subagents (classifier, sentiment analyzer, knowledge-base search, summarizer, and escalation checker) for every incoming ticket, including simple one-line requests that only need classification. Response times have become unacceptable. How should the coordinator be redesigned?

A) Run all five subagents in parallel for every ticket so total latency matches the slowest subagent instead of the sum.

B) Convert all five subagents into a single subagent that runs every step sequentially without coordinator involvement.

C) Have the coordinator assess each ticket's complexity by running a dedicated lightweight classification prompt that returns a structured JSON object with fields like `complexity` (e.g., `low`, `medium`, `high`) and `required_subagents`, then dynamically invoke only the subagents listed in that output.

D) Remove the coordinator entirely and let the classifier subagent directly invoke the remaining subagents it deems necessary.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Have the coordinator assess each ticket's complexity by running a dedicated lightweight classification prompt that returns a structured JSON object with fields like `complexity` (e.g., `low`, `medium`, `high`) and `required_subagents`, then dynamically invoke only the subagents listed in that output.

**정답 및 해설:**

**핵심 개념**: 동적 에이전트 오케스트레이션(Dynamic Agent Orchestration) 및 조건부 라우팅
모든 입력 요청에 대해 동일한 중대형 하위 에이전트 파이프라인 전체를 무조건 일률적으로 실행하는 정적 구조는 심각한 레이턴시(지연 시간) 및 자원 낭비를 초래합니다. 입력을 사전에 경량화된 평가 단계로 라우팅하여 필요한 에이전트만 동적으로 선별 호출(Dynamic Routing)하는 것이 멀티 에이전트 아키텍처의 표준 최적화 패턴입니다.

**문제 상황 분석:**
- 단순 한 줄짜리 문의(분류만 필요)부터 복잡한 문의까지 모든 티켓에 대해 5개의 서브 에이전트 전체를 고정 실행함.
- 불필요한 에이전트의 대량 실행으로 전체 응답 시간이 지나치게 길어짐.
- 입력 티켓의 복잡성에 따라 필수 서브 에이전트만 선별하여 실행하는 라우터/코디네이터 구조 개선이 필요함.

**C번이 정답인 이유:**
코디네이터가 먼저 가볍고 빠른 경량 분류 프롬프트(Lightweight classification prompt)를 실행하여 티켓의 복잡도와 실제 필요한 서브 에이전트 목록(`required_subagents`)을 파악한 후, 해당 티켓 처리에 꼭 필요한 에이전트만 동적으로 가동하는 라우팅 방식을 도입하면 지연 시간을 크게 줄이고 효율성을 극대화할 수 있습니다.

**오답 분석:**

- Option A (오답): 병렬 처리(Parallel execution)는 개별 실행 시간을 줄일 수는 있으나, 단순 한 줄 문의에 지식베이스 검색, 요약, 감정 분석 등 불필요한 5개 에이전트를 여전히 모두 가동하므로 지연 시간 및 토큰 비용 최적화의 근본적 해결책이 되지 못합니다.
- Option B (오답): 5개 에이전트를 하나로 합쳐 순차 실행하면 지연 시간이 오히려 더 길어지며 오케스트레이션 제어를 포기하게 됩니다.
- Option D (오답): 코디네이터를 제거하고 서브 에이전트가 다른 서브 에이전트를 직접 호출하게 만드는 것은 에이전트 간 의존성을 복잡하게 만들어 결합도를 높이고 관리 및 제어를 어렵게 만듭니다.

---

## 103번 문제

**1. 문제 원문**

Midway through investigating a billing dispute, an agent determines the case requires a policy exception only a human supervisor can approve. The human agent who picks up the case will not have access to the conversation transcript. Which handoff summary is most useful to that human agent?

A) Billing issue escalated; customer wants money back; please review and use your judgment on what discount or credit, if any, is appropriate here

B) The customer seems upset about a charge and asked several questions before the case was escalated for further human review of the account history

C) Customer ID 88213; root cause: a duplicate authorization hold from a retried gateway call was never released; recommended action: void the hold.

D) See the attached conversation transcript for full details; the customer's most recent message explains the situation better than a summary could

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Customer ID 88213; root cause: a duplicate authorization hold from a retried gateway call was never released; recommended action: void the hold.

**정답 및 해설:**

**핵심 개념**: 에이전트 인수인계 요약(Agent Handoff Summary) 및 컨텍스트 전달 최적화
AI 에이전트가 처리하던 작업을 사람 상담원(Human Agent)에게 핸드오프(Handoff)할 때는, 대화 전체 기록을 읽지 않고도 즉시 의사결정을 내릴 수 있도록 **핵심 식별자(ID), 근본 원인(Root Cause), 추천 조치(Recommended Action)**를 명확하고 구조화된 데이터로 전달해야 합니다.

**문제 상황 분석:**
- 청구 분쟁 조사 중 사람 관리자의 승인이 필요한 정책 예외 상황 발생.
- 인수인계받을 사람 상담원은 대화 전문 기록(Conversation Transcript)에 접근할 수 없음.
- 따라서 이전 대화 맥락을 모르더라도 한눈에 문제를 파악하고 즉시 조치할 수 있는 구체적이고 정제된 인수인계 정보가 필요함.

**C번이 정답인 이유:**
C번은 대화 기록이 없는 상태에서도 담당자가 즉시 조치할 수 있도록 **고객 식별자(Customer ID 88213)**, 조사 결과 밝혀진 **기술적 근본 원인(중복 승인 보류 미해제)**, 그리고 **구체적인 조치 방법(보류 취소)**을 완벽히 정제하여 제공하므로 가장 유용합니다.

**오답 분석:**

- Option A (오답): 내용이 매우 모호하며, 어떠한 결제건에 대한 문제인지 원인과 판단 근거 데이터가 전혀 포함되어 있지 않습니다.
- Option B (오답): 고객의 감정 상태와 거친 질의 과정만 언급할 뿐, 기술적/업무적 근본 원인이나 해결책을 제공하지 못합니다.
- Option D (오답): 문제 조건에서 사람 상담원은 대화 기록(Transcript)에 접근할 수 없다(`will not have access`)고 명시했으므로, 대화 기록을 참조하라는 안내는 불가능한 조치입니다.

---

## 104번 문제

**1. 문제 원문**

During a long-running research task, a foreground subagent produces several paragraphs of analysis before a server overload error cuts it off mid-response. According to Anthropic's official documentation (Claude Code v2.1.199+), what does the coordinator receive as the Agent tool result?

A) An automatic retry that silently reruns the subagent from the start until it completes without error

B) A completely empty result with no indication that an error occurred, requiring the coordinator to poll for status separately

C) The full expected output, reconstructed from cached intermediate tool calls made before the overload occurred

D) The partial text output the subagent already produced, along with a note that the subagent didn't finish

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: The partial text output the subagent already produced, along with a note that the subagent didn't finish

**정답 및 해설:**

**핵심 개념**: 서브 에이전트 부분 출력 반환(Partial Output Recovery) 및 에러 처리
Claude Code의 서브 에이전트 실행 중 서버 과부하(Server Overload), 타임아웃, 중단 등 예외 상황이 발생하면, 코디네이터 에이전트가 작업 상황을 파악하고 이후 복구 전략을 결정할 수 있도록 기존까지 생성된 부분 결과물(Partial Output)과 미완료 상태 표시를 함께 반환합니다.

**문제 상황 분석:**
- 서브 에이전트가 긴 분석 작업 중 여러 단락의 텍스트를 정상 생성함.
- 응답 출력 중 서버 과부하 오류가 발생하여 실행이 중간에 중단됨.
- 코디네이터가 수신하게 되는 `Agent` 도구 결과(Tool Result)의 형태를 확인해야 함.

**D번이 정답인 이유:**
Anthropic 공식 규격상 서브 에이전트 실행이 중간에 예외로 끊기면, 코디네이터는 지금까지 서브 에이전트가 출력을 성공한 부분 텍스트(Partial text output)와 "완료되지 않았음(didn't finish)"을 알리는 참고 메시지/노트를 전달받습니다. 이를 통해 코디네이터는 이미 생성된 정보를 잃지 않고 활용하면서 중단된 지점부터 이어서 작업을 재개하거나 대응할 수 있습니다.

**오답 분석:**

- Option A (오답): 무조건적인 자동 재시도(Automatic retry)를 즉시 수행하면 무한 루프나 과도한 자원 소모가 발생할 수 있으므로, 제어권을 가진 코디네이터에게 상태를 보고하는 것이 우선입니다.
- Option B (오답): 오류 표시 없이 완전히 빈 결과(Empty result)를 반환하지 않으며, 이미 생성된 컨텍스트 보존을 위해 부분 출력을 포함합니다.
- Option C (오답): 캐시된 중간 도구 호출만으로 완성된 전체 출력(Full expected output)을 복원하는 것은 불가능하며 실제 생성된 범위를 넘어서는 동작입니다.

---

## 105번 문제

**1. 문제 원문**

A junior engineer proposes capping an autonomous research agent at exactly 5 tool-call iterations and treating that cap as the loop's primary stopping mechanism, regardless of stop_reason. What is the main architectural problem with relying on a fixed iteration cap this way?

A) It can cut the loop off while stop_reason is still "tool_use", forcing the agent to abandon work Claude has not finished reasoning through

B) It causes the API to immediately reject the request, since the Messages API enforces its own hard limit of five tool calls total

C) It stops tool_result blocks from being appended to conversation history entirely once the third iteration has completed

D) It forces every one of the later requests to omit the tools parameter entirely, disabling any further tool use for the rest of that session

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: It can cut the loop off while stop_reason is still "tool_use", forcing the agent to abandon work Claude has not finished reasoning through

**정답 및 해설:**

**핵심 개념**: 에이전트 루프 제어(Agentic Loop Control) 및 `stop_reason` 기반 완료 판단
에이전트 시스템에서 모델이 도구를 호출할 때는 응답의 `stop_reason`이 `"tool_use"`로 반환됩니다. 에이전트 루프의 올바른 종료 조건(Primary Stopping Mechanism)은 모델이 더 이상 도구 호출을 필요로 하지 않고 최종 답변 생성을 완료했음을 의미하는 `"end_turn"`(또는 `"stop_sequence"`)을 `stop_reason`으로 전달받는 것입니다. 고정된 반복 횟수(Iteration Cap)만을 주 정지 조건으로 삼으면 추론 작업이 진행 중임에도 무작위로 작업이 중간 단절될 수 있습니다.

**문제 상황 분석:**
- 주니어 엔지니어가 에이전트 루프의 주 정지 메커니즘으로 `stop_reason`을 확인하는 대신 '고정된 5회 반복 상한선'을 제안함.
- 에이전트가 복잡한 연구 과제를 수행하는 도중 5번째 반복에 도달했을 때의 문제점을 평가해야 함.
- 모델의 완성도 높은 추론 및 결과물 도출을 방해하는 구조적 결함을 파악하는 것이 핵심임.

**A번이 정답인 이유:**
`stop_reason`이 여전히 `"tool_use"`라는 것은 Claude가 목표 달성을 위해 다음 도구를 실행하거나 추론을 이어가야 한다고 판단했음을 뜻합니다. `stop_reason` 상태를 무시하고 횟수 제한만으로 루프를 강제 종료하면, 에이전트가 전체 작업을 마무리짓지 못하고 미완성 상태에서 중단되는 심각한 아키텍처적 문제가 발생합니다. (고정 횟수 상한선은 무한 루프 방지용 안전 가드레일/서킷 브레이커로만 써야 하며, 정지 메커니즘 자체가 되어서는 안 됩니다.)

**오답 분석:**

- Option B (오답): Anthropic Messages API 자체에는 총 5회 도구 호출이라는 하드 리밋 제한이 존재하지 않습니다.
- Option C (오답): 3번째 반복 완료 후 `tool_result` 블록 추가가 차단된다는 규칙은 존재하지 않으며 논리적 근거가 없는 설명입니다.
- Option D (오답): 루프 상한선 설정이 이후 요청에서 `tools` 파라미터를 자동으로 생략하게 만들지 않습니다.

---

## 106번 문제

**1. 문제 원문**

A "test-runner" subagent is defined with tools set to ["Bash", "Read", "Grep"]. The coordinator that spawns it has a settings.local.json deny rule that blocks Bash usage. When the coordinator delegates a task to test-runner, can the subagent successfully execute Bash commands?

A) Yes, because a subagent's own tools field independently grants it access to Bash regardless of coordinator-level deny rules.

B) No, because subagents must inherit coordinator-level deny rules, so Bash calls inside test-runner would be blocked.

C) No, because Task must also appear in the subagent's own tools field before any of its other listed tools become usable during execution.

D) Yes, but only for the first Bash call; subsequent Bash calls would then be denied.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: No, because subagents must inherit coordinator-level deny rules, so Bash calls inside test-runner would be blocked.

**정답 및 해설:**

**핵심 개념**: 서브 에이전트 권한 상속(Permission Inheritance) 및 설정 계층 구조
Claude Code 및 에이전트 오케스트레이션 프레임워크에서 서브 에이전트는 상위(코디네이터) 에이전트의 보안 설정 및 접근 제어 규칙을 상속받습니다. 코디네이터 수준의 `settings.local.json`에 정의된 차단 규칙(`deny rule`)은 서브 에이전트 자체에 어떤 도구(`tools`)가 명시되어 있든 관계없이 상위 가드레일로서 최우선 적용됩니다.

**문제 상황 분석:**
- `test-runner` 서브 에이전트는 자체 정의상 `Bash` 도구를 사용할 수 있도록 선언됨.
- 이를 호출하는 코디네이터 에이전트에는 `settings.local.json`을 통해 `Bash` 사용을 차단하는 `deny` 규칙이 적용되어 있음.
- 하위 에이전트가 상위 에이전트의 제어 정책을 우회할 수 있는지 여부를 판단해야 함.

**B번이 정답인 이유:**
보안 및 샌드박스 정책상 서브 에이전트는 코디네이터의 상위 제어 규칙을 전적으로 상속받아야 합니다. 따라서 상위 코디네이터 레벨에서 `Bash` 도구가 거부(`deny`)되어 있다면, 하위 에이전트의 설정에 `Bash`가 포함되어 있다 할지라도 실제로 `Bash` 명령을 실행할 수 없으며 차단됩니다.

**오답 분석:**

- Option A (오답): 서브 에이전트의 설정이 상위 코디네이터의 보안/거부 정책을 우회하거나 무시할 수는 없습니다.
- Option C (오답): `Task` 도구 유무와 무관하게 차단의 원인은 코디네이터 레벨의 `Bash` 거부 규칙 상속 때문입니다.
- Option D (오답): 횟수와 관계없이 코디네이터 차단 정책에 의해 첫 번째 `Bash` 호출부터 즉시 거부됩니다.

---

## 107번 문제

**1. 문제 원문**

An architect writes a PreToolUse hook with the regex matcher `/refund/` intending it to gate a single custom tool named `refund`. During a review, a colleague notices the matcher would also fire on a tool named `issue_refund_note` that only writes an internal comment and should never be gated. What is the cause and the correct fix?

A) The matcher `/refund/` uses a regular expression, but regular expression matchers in hooks are automatically anchored to match exactly, so it would only fire on the tool named exactly `refund`. The colleague's concern is unfounded; no fix is needed.

B) Matchers can only target tool names that begin with the `mcp__` server prefix. A custom in-process tool like `refund` must be renamed to include this prefix before any matcher can reliably target it.

C) The hook fires on every single tool call by default unless a timeout value is explicitly configured. Adding a timeout would stop it from matching `issue_refund_note`.

D) The regex matcher `/refund/` is unanchored, so it matches any tool name containing the substring 'refund'. The fix is to anchor the regex with `^` and `$`: `/^refund$/`, ensuring it only matches the exact tool name `refund`.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: The regex matcher `/refund/` is unanchored, so it matches any tool name containing the substring 'refund'. The fix is to anchor the regex with `^` and `$`: `/^refund$/`, ensuring it only matches the exact tool name `refund`.

**정답 및 해설:**

**핵심 개념**: 정규표현식 앵커(Regex Anchors `^`, `$`) 및 훅 도구 매칭 규칙
Claude Code 및 SDK의 훅(Hook) 시스템에서 도구 이름을 필터링할 때 정규표현식(Regex)을 사용합니다. 문자열의 시작(`^`)과 끝(`$`)을 지정하는 앵커 기호 없이 `/refund/`와 같이 단순 부분 문자열 패턴을 작성하면, 해당 텍스트가 포함된 모든 도구 이름(예: `issue_refund_note`, `refund_user`, `process_refund`)에 매칭되는 의도치 않은 오버매칭(Over-matching)이 발생합니다.

**문제 상황 분석:**
- 개발자가 `refund`라는 단일 커스텀 도구에만 적용되는 `PreToolUse` 훅을 작성하고자 함.
- 정규표현식 매처로 `/refund/`를 사용함.
- `issue_refund_note`처럼 `refund`라는 단어가 중간에 포함된 다른 도구까지 훅이 불필요하게 가동되는 문제가 예상됨.

**D번이 정답인 이유:**
`/refund/`는 앵커가 없는(Unanchored) 정규표현식이므로 `refund`를 부분 문자열로 가진 모든 도구 이름과 일치하게 됩니다. 이를 해결하려면 시작 앵커(`^`)와 끝 앵커(`$`)를 추가하여 `/^refund$/` 패턴으로 작성해야만 정확히 도구 이름이 `refund`인 경우에만 훅이 동작하도록 제어할 수 있습니다.

**오답 분석:**

- Option A (오답): 정규표현식 매처는 자동으로 완벽 일치(Exact Match) 앵커링이 적용되지 않습니다. 앵커를 명시하지 않으면 서브스트링 매칭으로 동작합니다.
- Option B (오답): 매처는 `mcp__` 접두사가 붙은 도구뿐만 아니라 일반/커스텀 인-프로세스 도구 이름도 모두 자유롭게 타깃팅할 수 있습니다.
- Option C (오답): 타임아웃 설정 유무는 정규표현식 매칭 패턴 식별 알고리즘과 아무런 관련이 없습니다.

---

## 108번 문제

**1. 문제 원문**

A coordinator calls the same "endpoint-finder" subagent twice in a row, once for the billing service and once for the notifications service, using two separate Task invocations without resuming a specific agent id. On the second call, the subagent has no awareness that a billing-service scan happened earlier and re-explains basic conventions it already covered. Why does this happen, and is it expected behavior?

A) No, this is a bug: all subagents invoked within the same coordinator session automatically share one combined context window across every Task call

B) Yes, this is expected, but only because the two calls targeted different services; invoking endpoint-finder twice for the same service would have shared memory automatically

C) No, this is a bug: subagent definitions cache their reasoning across calls automatically, so two invocations of endpoint-finder should share memory by default

D) Yes, expected: each invocation starts a fresh context unless a specific prior agent is explicitly resumed, so separate calls to the same agent type share no memory

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Yes, expected: each invocation starts a fresh context unless a specific prior agent is explicitly resumed, so separate calls to the same agent type share no memory

**정답 및 해설:**

**핵심 개념**: 서브 에이전트 컨텍스트 격리(Context Isolation) 및 세션 재개(Session Resumption)
Claude Code 및 멀티 에이전트 오케스트레이션 프레임워크에서 서브 에이전트는 실행될 때마다 완전히 독립된 새로운 컨텍스트 창(Fresh Context Window)을 부여받습니다. 이전에 생성된 에이전트의 상태나 대화 기억을 계속 이어가려면 특정 에이전트 ID를 명시적으로 재개(Resume)해야 하며, 동일한 서브 에이전트 타입을 새로 호출하더라도 이전 호출의 기억이나 메모리는 자동으로 공유되지 않는 것이 의도된 기본 동작입니다.

**문제 상황 분석:**
- 코디네이터가 `endpoint-finder` 서브 에이전트를 두 번 호출함.
- 특정 에이전트 ID를 지정하여 재개(`resume`)하지 않고 독립된 별개의 Task로 각각 실행함.
- 두 번째 서브 에이전트는 첫 번째 호출에서 수행한 작업 내용이나 이미 다룬 컨벤션을 기억하지 못하고 새로 설명함.
- 이것이 기술적으로 정상적인 백그라운드 매커니즘인지 판별해야 함.

**D번이 정답인 이유:**
서브 에이전트는 컨텍스트 오염 및 불필요한 토큰 낭비를 방지하기 위해 각 호출 시마다 상태가 없는(Stateless) 클린 상태로 시작됩니다. 특정 에이전트 ID를 이용해 세션을 지속시하지 않는 한 동일한 타입의 서브 에이전트를 여러 번 호출하더라도 메모리가 공유되지 않는 것은 설계된 정상 동작(Expected Behavior)입니다.

**오답 분석:**

- Option A (오답): 동일한 코디네이터 내의 서브 에이전트들이 하나의 컨텍스트 창을 공유한다는 것은 오답입니다. 서브 에이전트의 핵심 목적은 컨텍스트를 격리하여 독립적으로 작업하는 것입니다.
- Option B (오답): 타깃 서비스가 동일하더라도 에이전트 ID를 재개하지 않고 새로 호출하면 메모리는 절대 자동으로 공유되지 않습니다.
- Option C (오답): 서브 에이전트 정의가 호출 간 추론 상태를 자동으로 캐싱/공유하지 않습니다.
