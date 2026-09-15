# Agentic Architecture & Orchestration — 고난도 선별 문제

원본: aao-merged.md (전체 108문제 중 24문제 선별, 22%)

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

# A. PreToolUse permissionDecision 선택 — 같은 환불 게이트, 답은 deny / ask / allow+updatedInput

76: deny + reason은 호출 취소 후 이유 전달. 101: 사람 승인 대기는 ask. 96: 재시도 루프 억제는 allow + no-op updatedInput(ask가 아님). 63: 위험도별 ask/allow. 24: 검증 ID 강제는 allow + updatedInput 덮어쓰기. 17: 훅 내부 예외는 잡아서 deny. 59: 플래그 대신 명시적 검증 결과 검사.

## 1번 문제 (원본 76번)

**어려운 이유** [유사 현상 구분] — deny + reason의 효과가 사용자에게 승인 프롬프트를 띄우는 "ask" 동작과 혼동되기 쉽고, reason이 모델에게 전달되는지 여부가 관건이다.

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

**B) The tool call is cancelled, and the reason is provided to Claude to inform subsequent actions.**

~~C) The tool call is allowed, and the permissionDecisionReason is logged as a warning.~~

~~D) The user is shown an interactive approval prompt asking to allow or deny the tool call.~~

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
`permissionDecision`을 `"deny"`로 설정하면, 런타임은 예정된 **도구 실행을 즉시 취소** (Cancel)합니다. 동시에 `permissionDecisionReason`에 적힌 사유("Use the sandboxed low-privilege wrapper script instead")가 모델(Claude)에게 도구 실행 결과 형태의 피드백으로 전달됩니다. 이를 통해 Claude는 자신이 요청한 도구 호출이 왜 거부되었는지 이해하고, 샌드박스화된 저권한 래퍼 스크립트를 대신 사용하는 식의 **후속 대안 행동을 취할 수 있게 됩니다.**

**오답 분석:**

- Option A (오답): `permissionDecisionReason`은 `"deny"` 및 `"ask"` 등 거부 또는 확인 요청 사유를 전달할 때 모두 유효하게 사용할 수 있으며, 세션 오류 종료를 발생시키지 않습니다.
- ~~Option C (오답): `"permissionDecision": "deny"`는 명시적으로 도구 실행을 막는 결정이므로 도구 호출이 허용(allowed)되지 않습니다.~~
- ~~Option D (오답): 대화형 승인 프롬프트를 띄우려면 `"permissionDecision": "ask"`를 반환해야 합니다. `"deny"`는 차단 및 거부 사유를 모델에게 즉시 전달합니다.~~

---

## 2번 문제 (원본 101번)

**어려운 이유** [유사 현상 구분] — deny+사유로 인간 검토를 유도하는 A가 목적상 비슷해 보이지만, 실제 일시정지·승인 흐름을 만드는 것은 "ask"뿐이라는 구분이 필요하다.

**1. 문제 원문**

For refunds between $500 and $1000, policy requires the agent to pause and let a human reviewer approve or reject before the refund proceeds, rather than blocking it outright or letting it run automatically. Which PreToolUse hookSpecificOutput configuration matches this requirement?

A) permissionDecision set to "deny", paired with a permissionDecisionReason that instructs the model to contact a human reviewer on its own

~~B) permissionDecision set to "allow", combined with an additionalContext note asking the model to mention the amount to the user afterward~~

**C) permissionDecision set to "ask", so the operation is surfaced for approval instead of executing automatically or being silently rejected**

~~D) async set to true with asyncTimeout raised to 60000, so the hook has enough time to reach a human reviewer before the call proceeds~~

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: permissionDecision set to "ask", so the operation is surfaced for approval instead of executing automatically or being silently rejected

**정답 및 해설:**

**핵심 개념**: PreToolUse Hook 및 승인 메커니즘 (`permissionDecision: 'ask'`)
Claude Code 및 Agentic Framework의 `PreToolUse` 훅에서는 도구 실행 전 제어를 위해 `permissionDecision` 속성을 사용합니다. 이 속성은 주로 `'allow'`(자동 승인), `'deny'`(차단/거부), `'ask'`(사람의 승인 요구)의 값을 가질 수 있습니다.

**문제 상황 분석:**
- 500달러~1000달러 사이의 환불 요청 발생.
- 완전 차단(`deny`)하거나 자동 실행(`allow`)하는 대신, **작업을 일시 정지**하고 사람(Human Reviewer)의 승인/거절 판단을 받아야 함.
- 사람의 직접적인 개입(**Human-in-the-loop**)을 유도하는 **훅 설정값**을 찾아야 함.

**C번이 정답인 이유:**
`permissionDecision: 'ask'`로 설정하면 **도구의 자동 실행이 일시 정지되고 사용자/검토자 UI 상에 승인 요청이 노출** (Surface)됩니다. 이를 통해 사람이 직접 검토하여 승인(Approve)하거나 거절(Reject)할 때까지 도구 호출을 대기시킬 수 있으므로 정책 요구사항에 완벽하게 부합합니다.

**오답 분석:**

- Option A (오답): `'deny'`는 **도구 실행을 완전히 거부 및 차단**하는 설정입니다. 거부 사유를 프롬프트로 전달하더라도 사람의 승인 인터페이스를 띄워 진행 여부를 정하는 메커니즘이 아닙니다.
- ~~Option B (오답): `'allow'`는 환불을 즉시 승인 및 실행해 버리므로 human reviewer의 사전 승인 정책을 위반합니다.~~
- ~~Option D (오답): `async` 및 `asyncTimeout`은 훅 실행의 비동기 타임아웃을 조절하는 설정일 뿐, 사람에게 승인 요청을 전달하는 인터랙션 제어 권한(Permission Decision)을 구성하지 못합니다.~~

---

## 3번 문제 (원본 96번)

**어려운 이유** [덜 틀린 답 고르기, 부분적으로만 맞는 오답] — 재시도 루프를 끊는 방법으로 deny 메시지 수정(C)이 그럴듯하나, 정책상 인간 승인이 필요한 ask로 전환하는 것이 결정론적 통제를 유지하는 답이다.

**1. 문제 원문**

An architect is implementing a PreToolUse hook to control `issue_refund` calls. The hook currently denies any refund over $500 with `permissionDecision: 'deny'` and a `permissionDecisionReason`. However, the agent retries the same refund multiple times, causing a poor user experience. Which change best addresses this retry behavior while maintaining deterministic control in the hook?

~~A) Switch the hook from `PreToolUse` to `PostToolUse` so the refund executes once; then automatically reverse the transaction if it exceeds $500.~~

B) Change the hook to return `permissionDecision: 'allow'` and provide an `updatedInput` that replaces the `issue_refund` call with a safe operation (e.g., a no-op `echo` command) so the tool call succeeds without performing the refund.

C) Remove the `permissionDecisionReason` string from the denial response to produce a shorter message that is less likely to contain phrasing the model might interpret as a reason to reattempt the `issue_refund` call.

D) Use `permissionDecision: 'ask'` to require human approval for the refund, stopping the retry loop and providing explicit oversight for irreversible actions.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Use `permissionDecision: 'ask'` to require human approval for the refund, stopping the retry loop and providing explicit oversight for irreversible actions.

**정답 및 해설:**

**핵심 개념**: 훅의 세 가지 결정(allow / deny / ask)과 재시도 루프 차단, 되돌릴 수 없는 작업에 대한 Human-in-the-loop

`PreToolUse` 훅의 `deny`는 종료 신호가 아니라 모델에게 전달되는 피드백입니다. 공식 문서에 따르면 Claude Code는 도구 호출을 차단하고 Claude에게 그 이유를 보여주며, 모델은 이를 해결 가능한 실패로 해석하여 **같은 요청을 반복**할 수 있습니다. 이 재시도 루프는 공식 저장소에도 이슈로 보고된 실제 현상입니다.

반면 `ask`는 결정권을 사람에게 이전합니다. 사람의 결정은 모델이 재해석해 우회할 피드백이 아니라 최종 결정이므로 **루프가 끊기고**, 어떤 호출을 넘길지는 훅 코드가 조건(금액 > 500)에 따라 결정하므로 **결정론적 제어도 유지**됩니다.

**문제 상황 분석:**
- 500달러 초과 환불 시 훅이 `deny`를 반환하지만, 모델이 이를 최종 결정으로 받아들이지 않고 동일 환불을 반복 요청하여 UX가 저하됨.
- 요구 조건: 재시도 루프를 끊되 훅의 결정론적 제어를 유지할 것.
- 환불은 되돌릴 수 없는 재무 작업이므로 실행 전 게이트를 유지하면서 사람의 최종 결정을 받아야 함.

**D번이 정답인 이유:**
1. 재시도 차단: 고액 환불은 거부 메시지 대신 사람의 승인 프롬프트로 넘어가고, 승인이든 거부든 사람의 명시적 결정으로 종료되어 모델이 다시 시도할 여지가 없습니다.
2. 결정론적 제어 유지: 임계값 판정과 에스컬레이션 여부는 훅 코드가 결정하며 프롬프트로 우회할 수 없습니다.
3. 명시적 감독: 무조건 deny하면 정당한 고액 환불까지 막히지만, ask는 정당한 경우 승인하고 부당한 경우 차단할 수 있으며 감사 추적도 남습니다.

**오답 분석:**

~~- Option A (오답): PostToolUse는 실행 후에 호출되므로 환불 자체를 막을 수 없고, 사후 반전은 반전 실패 등 새로운 실패 지점을 만듭니다.~~
- Option B (오답): issue_refund를 몰래 no-op으로 바꾸면 모델은 환불이 완료된 것으로 인식하여 사용자에게 거짓 보고를 하게 됩니다. `updatedInput`은 **인자 보정 용도**이지 도구의 의미를 바꿔 **모델을 속이는 용도가 아닙니다.**
- Option C (오답): 사유 문구를 지워도 deny가 피드백으로 전달되는 구조는 그대로이며, 오히려 실패 원인을 몰라 시행착오성 재시도가 늘어날 수 있는 확률적 완화일 뿐입니다.

---

## 4번 문제 (원본 63번)

**어려운 이유** [덜 틀린 답 고르기] — 미검증 상태에서 환불을 "ask"로 둘지 "deny"로 둘지가 둘 다 방어 가능해, 마스킹된 읽기를 allow로 두는 조합과의 짝짓기에서 판단이 갈린다.

**1. 문제 원문**

An agent handles two kinds of unverified requests: viewing a masked order history (read-only, low risk) and issuing a refund (financial, irreversible). The architect wants to gate both with PreToolUse hooks but use different permission decisions based on risk. Which pairing of returned `permissionDecision` values best fits the two cases before identity is verified?

A) "ask" for the refund and "allow" for the masked order history lookup, because the irreversible refund needs human confirmation before proceeding, while the masked, read-only lookup is low risk and can be permitted automatically.

~~B) "allow" for both the masked order history lookup and the refund, since neither action can realistically be reversed once the workflow reaches the hook stage.~~

~~C) "deny" for both the masked order history lookup and the refund, since any unverified request should be treated identically regardless of the underlying tool.~~

~~D) "ask" for the masked order history lookup and "deny" for the refund, since the reversible read can tolerate a manual check while the irreversible refund should not proceed at all.~~

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

---

## 5번 문제 (원본 24번)

**어려운 이유** [덜 틀린 답 고르기, 부분적으로만 맞는 오답] — 세션 상태에 검증 ID가 있으면 통과시키는 A가 상식적으로 맞아 보이나, 모델이 다른 ID를 써넣는 것을 막으려면 updatedInput으로 인자 자체를 덮어써야 한다는 점이 함정이다.

### 1. 문제 원문

A refund workflow requires that process_refund always be called with the exact customer_id captured by an earlier verified get_customer call, never a value the model retypes from the conversation. A PreToolUse hook already blocks the call when no verified ID exists in session state. What should the hook do once a verified ID is present, to prevent the model from substituting a different ID string?

~~A) Return an empty object so the call proceeds unchanged, since the presence of a verified ID in session state is enough evidence that the model used it~~

~~B) Return permissionDecision "ask" so a human reviewer retypes the same ID manually before every refund, even when verification already succeeded~~

C) Return permissionDecision "allow" together with updatedInput that overwrites the tool's customer_id argument with the verified ID stored in session state

~~D) Return permissionDecision "defer" so the query pauses indefinitely until an operator resumes it with the corrected customer_id argument~~

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

## 6번 문제 (원본 17번)

**어려운 이유** [덜 틀린 답 고르기, 원칙이 깨지는 예외] — 검증 서비스 장애 시 "고객 잘못이 아니니 allow"라는 A가 인간적으로 설득력 있으나, fail-closed 원칙상 deny 반환이 정답이라는 판단이 갈린다.

**1. 문제 원문**

A PreToolUse hook gating process_refund throws an unhandled exception whenever the internal verification service it calls times out. During an outage of that service, every refund attempt in the session crashes the agent entirely instead of being cleanly denied. What change to the hook fixes this without weakening the enforcement it provides?

A) Catch the timeout and return permissionDecision "allow", since a service outage is not the customer's fault and refunds should never be penalized for infrastructure issues

~~B) Increase the hook's timeout value to several hours, so the hook keeps waiting on the verification service instead of failing quickly during a temporary outage~~

C) Catch the timeout inside the hook and return permissionDecision **"deny"** with a reason explaining the outage, instead of letting the exception propagate and crash the session

~~D) Remove the hook entirely for the duration of any outage of the verification service, so refunds can proceed unblocked until that service comes back online~~

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
- ~~Option B (오답): 타임아웃 시간을 수 시간으로 늘리는 것은 에이전트가 무한정 대기 상태(Hang)에 빠지게 만들어 근본적인 예외 처리가 되지 못합니다.~~
- Option D (오답): 장애 기간에 훅을 아예 제거하면 무검증 환불이 가능해지므로 훅의 통제 및 강제력을 포기하는 결과를 낳습니다.

---

## 7번 문제 (원본 59번)

**어려운 이유** [근본 원인 vs 증상 완화, 복합 시나리오] — 사후 롤백(A)이나 모델 격상(C)이 그럴듯한 완화책이고, 별도 불리언 플래그 대신 명시적 검증 결과를 확인하도록 계약을 바꾸는 것이 근본 해법임을 가려내야 한다.

**1. 문제 원문**

A developer implements a PreToolUse hook that gates the `process_refund` tool by checking a boolean flag `is_verified`. The flag is expected to be set to `true` by a separate `mark_verified` tool after a human reviewer approves a photo ID. In an incident, the `mark_verified` tool executed and the human reviewer explicitly rejected the ID, but due to a software bug the `is_verified` flag was incorrectly set to `true`. The PreToolUse hook consequently allowed `process_refund`, resulting in an unauthorized refund. What change to the PreToolUse hook would best prevent this category of failure?

A) Add a **PostToolUse** hook on `process_refund` that verifies the flag again after the refund has been initiated, so it can reverse the transaction if the flag is invalid.

**B) Modify the PreToolUse hook to inspect the explicit verification result included in the `process_refund` tool call parameters, confirming that the human review expressly passed, instead of relying on a separate boolean flag that can be set incorrectly.**

~~C) Replace the model with a larger, more capable language model that can independently re-read the entire conversation and determine whether the human review actually succeeded, overriding the flag when necessary.~~

~~D) Increase the timeout on the PreToolUse hook to re-check the flag periodically; the hook will eventually notice the review was incorrect and block the refund.~~

---

**3. 정답 및 해설 (Answer & Explanation)**

**B번**: 

**Modify the PreToolUse hook**
PreToolUse 훅을 수정하세요

**to inspect the explicit verification result**
명시적인 검증 결과를 점검하도록

**included in the process_refund tool call parameters,**
`process_refund` 툴 호출 매개변수에 포함된

**confirming that the human review expressly passed,**
사람의 검토가 명확히 통과했음을 확인하며

**instead of relying on a separate boolean flag**
별도의 불리언(Boolean) 플래그에 의존하는 대신

**that can be set incorrectly.**
잘못 설정될 수 있는

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
- ~~Option C (오답): 모델 크기를 늘리는 것은 결정론적인 소프트웨어 상태 버그나 입력 검증 문제를 해결해주지 못하며, 비효율적이고 비용이 큽니다.~~
- ~~Option D (오답): 타임아웃을 늘려 주기적으로 플래그를 다시 확인하더라도, 플래그를 만드는 소프트웨어 자체가 잘못 값을 썼다면 플래그 값은 변경되지 않으므로 문제를 해결할 수 없습니다.~~

---

# B. 훅 여러 개의 조합과 실행 순서

6: 정규화+임계값은 단일 PreToolUse(훅 간 updatedInput 전파 없음). 55: 하나라도 deny면 차단. 68: 서로 다른 도구의 훅 간 순서는 보장 안 됨. 81: PostToolUse 체이닝 시 updatedToolOutput 전달 여부 확인.

## 8번 문제 (원본 6번)

**어려운 이유** [복합 시나리오, 부분적으로만 맞는 오답] — 정규화와 임계값 검사를 PreToolUse 두 개로 나누는 D가 그럴듯하지만 updatedInput이 훅 간 자동 전파되지 않는다는 미세한 사실을 알아야 하고, C의 Pre+Post 분업도 직관적으로 매력적이다.

**1. 문제 원문**

A finance-operations agent uses a process_payment MCP tool. An architect wants to normalize the `amount` field, which some upstream integrations send as a string like "$1,250.00" and others send as a float like 1250.0, into a single float type, and then enforce a compliance threshold on the normalized value **before the tool call proceeds(도구 실행 전)**. Which design best achieves this, according to Anthropic's hook system behavior?

**A) Implement a single PreToolUse hook that normalizes the amount to a float and then checks the threshold, returning an updatedInput with the normalized value if allowed, or denying the call otherwise.**

~~B) Perform both normalization and threshold checking in a single PostToolUse hook, using the tool's output to derive the normalized amount and then compare against the threshold.~~

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

~~- Option B (오답): `PostToolUse` 훅은 도구가 이미 실행을 마친 후에 호출되므로, 도구 실행 전 입력 검증 및 차단이라는 목적에 맞지 않습니다.~~
- Option C (오답): 임계값 검증을 **도구가 실행된 후**(`PostToolUse`)에 진행하면 기준에 미달하는 유효하지 않은 결제 **요청이 이미 처리되어** 버립니다.
- Option D (오답): 두 개의 별도 `PreToolUse` 훅을 순서 상관없이 등록할 경우, **훅 간의 실행 순서** 보장 및 `updatedInput` **전파 시점에 의존성**이 생겨 임계값 검사 훅이 정규화되지 않은 포맷을 전달받을 위험이 있습니다.

---

## 9번 문제 (원본 55번)

**어려운 이유** [원칙이 깨지는 예외] — 다수결·선착순·설정 오류 등 그럴듯한 결합 규칙 중 "가장 제한적인 결정이 우선"이라는 규칙을 정확히 기억해야 한다.

**1. 문제 원문**

An architect registers three independent PreToolUse hooks for the same `charge_card` tool: one checks fraud signals, one checks the daily spending cap, and one checks account status. During a live call, the fraud-signal hook returns permissionDecision "deny" while the other two both return "allow". What happens to the tool call?

A) The call proceeds, because only the first hook registered in the PreToolUse array is evaluated and the remaining two hooks are skipped entirely

B) The call proceeds, because a majority of the registered hooks returned "allow" and the SDK resolves conflicting decisions by simple vote

C) The SDK raises a configuration error and halts the session, because hooks matched to the same tool are not permitted to return conflicting decisions

**D) The call is blocked, because when multiple hooks disagree the most restrictive(제한적인) result applies and any single "deny" overrides the other hooks' "allow" decisions**

---

**3. 정답 및 해설 (Answer & Explanation)**

**단어**

* 거부권(Veto) <-> 다수결(Simple vote)

**정답:**

**D번**: The call is blocked, because when multiple hooks disagree the most restrictive result applies and any single "deny" overrides the other hooks' "allow" decisions

**정답 및 해설:**

**핵심 개념**: PreToolUse 훅의 가장 제한적인 결과 적용 원칙 (Most Restrictive Evaluation)
- 동일한 도구 호출에 대해 **여러 개의 `PreToolUse` 훅**이 등록된 경우, 보안 및 안전성 보장을 위해 **거부권(Veto) 방식** 또는 **"가장 제한적인 결과 적용(Most Restrictive Principle)" 정책**을 따릅니다.
- 다른 훅들이 모두 허용("allow")을 반환하더라도 **단 하나의 훅이라도 거부("deny")를 반환**하면 최종 권한 결정은 거부("deny")로 수렴하여 **해당 도구 호출이 차단**됩니다.

**문제 상황 분석:**
- `charge_card` 도구에 대해 총 3개의 독립적인 `PreToolUse` 훅이 실행되었습니다.
- 일일 지출 한도 훅과 계정 상태 훅은 각각 "allow"를 반환했습니다.
- 그러나 사기 신호 검사 훅이 "deny"를 반환했습니다.

**D번이 정답인 이유:**
보안 및 접근 제어 로직에서 복수의 보안 검사 훅이 충돌할 경우, 시스템의 안전을 보장하기 위해 가장 보수적이고 제한적인 결정이 우선 적용됩니다. 따라서 단 한 개의 "deny" 결정이라도 존재하는 순간 다른 훅들의 "allow" 결정보다 우선시되어 최종 도구 호출은 차단(Blocked)됩니다.

**오답 분석:**

- Option A (오답): 첫 번째 훅만 평가되고 나머지는 스킵되는 것이 아니라, 대상 **도구에 매칭된 모든 훅이 평가**됩니다.
- Option B (오답): 훅 결정 간의 충돌은 다수결(Simple vote) 방식으로 해결하지 않으며, **보안 제어에서 다수결 방식은 허점**이 될 수 있습니다.
- Option C (오답): **여러 훅이 다른 결과**를 내는 것은 **정상**적인 보안 검사 시나리오이며 설정 오류(Configuration error)를 일으키거나 세션을 중단시키지 않습니다.

---

## 10번 문제 (원본 68번)

**어려운 이유** [근본 원인 vs 증상 완화, 부분적으로만 맞는 오답] — "unsafe"라는 결론이 같은 오답 B·D가 있어, 훅 간 상태 공유 불가나 병렬 실행이 아니라 모델이 선행 도구를 건너뛸 수 있다는 진짜 이유를 골라야 한다.

**1. 문제 원문**

A team wants to enforce that get_customer must run before process_refund, and registers two separate PreToolUse hooks: one matched to get_customer that writes a "verified" marker to a session file, and one matched to process_refund that reads that same file. A reviewer worries this design assumes the hooks run in a guaranteed order relative to each other. Is that **assumption(가정)** safe, and why?

A) It is unsafe, because each hook runs only when its matched tool is invoked, but nothing guarantees that get_customer is invoked before process_refund. The model could skip the **prerequisite(전제조건)** tool entirely, causing the process_refund hook to read a file that may not exist or contain valid data.

B) It is unsafe, because hooks matched to different tools share no session state with each other at all, so the process_refund hook can never see a file written by the get_customer hook.

~~C) It is safe, because the runtime automatically orders hooks alphabetically by their tool name before executing them, which guarantees get_customer's hook always runs first.~~

~~D) It is unsafe, because every registered PreToolUse hook always executes in parallel for every tool call in the session regardless of its matcher, so the file could be read before it is ever written.~~

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: It is unsafe, because each hook runs only when its matched tool is invoked, but nothing guarantees that `get_customer` is invoked before `process_refund`. The model could skip the prerequisite tool entirely, causing the `process_refund` hook to read a file that may not exist or contain valid data.

**정답 및 해설:**

**핵심 개념**: 훅(PreToolUse Hooks)의 이벤트 기반 실행 구조 및 LLM 툴 호출의 비결정성(Nondeterminism).
PreToolUse 훅은 매칭된 도구가 실제 호출되는 시점에 구동되며, LLM 모델이 **툴을 어떤 순서로 호출할지(또는 생략할지)는 런타임 차원에서 강제되지 않습니다**.

**문제 상황 분석:**
- 팀에서는 `get_customer`가 실행될 때 세션 파일에 마커를 쓰고, `process_refund`가 실행될 때 이 마커 파일을 읽어 검증하도록 훅을 설계함
- 그러나 PreToolUse 훅은 각 도구가 호출될 때 개별적으로 실행되는 이벤트 트리거 구조임
- LLM 모델이 `get_customer` 도구 호출을 거치지 않고 바로 `process_refund` 도구를 호출할 경우, 선행 훅이 실행되지 않아 세션 파일이 존재하지 않는 문제가 발생함

**A번이 정답인 이유:**
**각 PreToolUse 훅은 지정된 매처(Matcher)에 해당하는 도구가 실제로 호출되는 순간에만 실행**됩니다. 에이전트(LLM)가 순서를 어기거나 필수 선행 도구인 `get_customer`를 호출하지 않고 `process_refund`를 직접 호출하면, 파일 쓰기 작업이 일어난 적이 없으므로 `process_refund` 훅은 에러를 일으키거나 잘못된 파일 상태를 참조하게 됩니다. 따라서 이 설계는 안전하지 않습니다.

**오답 분석:**

- Option B (오답): **훅들은** 로컬 파일 시스템이나 **동일 세션 환경에 접근하여 데이터를 공유**할 수 있습니다. 상태 공유가 불가능하다는 주장은 사실이 아닙니다.
- ~~Option C (오답): 런타임이 도구 이름의 알파벳 순서(alphabetically)로 훅의 실행 순서를 자동 보장한다는 메커니즘은 존재하지 않습니다.~~
- Option D (오답): PreToolUse 훅은 매처 조건과 상관없이 무조건 병렬 실행되는 것이 아니라, 해당 **도구가 트리거될 때 선행(Pre) 실행**됩니다.

---

## 11번 문제 (원본 81번)

**어려운 이유** [복합 시나리오, 유사 현상 구분] — 다중 PostToolUse 훅의 결합 방식이 타임아웃·알파벳순·tool_use_id 같은 그럴듯한 규칙들과 경합하며, 체이닝 여부가 실제 쟁점임을 알아야 한다.

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

---

# C. 훅 matcher와 출력 필드

51: 미앵커 정규식 matcher. 92: 출력 어휘 통일은 PostToolUse + updatedToolOutput. 83: 범용 필드는 updatedToolOutput.

## 12번 문제 (원본 51번)

**어려운 이유** [유사 현상 구분] — 정규식 매처가 자동 앵커링된다는 D의 주장이 그럴듯해, 부분 문자열 매칭 여부라는 미세한 동작 차이를 정확히 알아야 구분된다.

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

## 13번 문제 (원본 92번)

**어려운 이유** [유사 현상 구분, 근본 원인 vs 증상 완화] — SessionStart 문서화나 UserPromptSubmit 지시도 어휘 통일이라는 목표엔 부합해 보이지만, "결정론적 보장"이라는 조건이 PostToolUse 출력 변환만을 정답으로 만든다.

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

## 14번 문제 (원본 83번)

**어려운 이유** [유사 현상 구분] — updatedToolOutput과 updatedMCPToolOutput이라는 거의 동일해 보이는 두 필드의 적용 범위 차이를 정확히 알아야만 풀린다.

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

---

# D. 세션 이어가기 — resume / fresh / fork

65: 파일 변경 알리고 resume. 99: 요약이 이미 있으면 새 세션. 56: fork 시 세션 권한 승인 미승계.

## 15번 문제 (원본 65번)

**어려운 이유** [덜 틀린 답 고르기, 유사 현상 구분] — 파일이 바뀌었으니 새 세션 시작(C)도 합리적이지만, 축적된 추론을 보존하면서 재읽기만 지시하는 D가 더 나은 선택이라 두 답이 진짜로 경합한다.

**1. 문제 원문**

A Claude Code session from three days ago read and cached the contents of a configuration file (e.g., a CLAUDE.md or agent definition). Since then, another engineer has substantially rewritten that file in a separate branch that was just merged. The architect needs to continue work while accounting for the file rewrite and preserving the accumulated reasoning about the surrounding system. What is the best approach?

A) Resume the session and trust its cached understanding of the configuration file since resumption restores full context.
B) Resume the session and run /compact immediately before asking any follow-up question about the file.
C) Start a new session and provide it with a concise summary of the previous session's findings and reasoning.
D) Resume the session and explicitly tell the agent the configuration file changed, prompting it to re-read that file.

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

## 16번 문제 (원본 99번)

**어려운 이유** [원칙이 깨지는 예외] — "컨텍스트 보존을 위해 resume/fork" 원칙이 도구 결과가 낡은 경우에는 깨지고, 구조화된 요약으로 새 세션을 여는 것이 오히려 안전하다는 반전이다.

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

## 17번 문제 (원본 56번)

**어려운 이유** [유사 현상 구분] — 권한 재요청 현상의 원인이 fork의 세션 범위 승인 미상속인지, --continue와 --fork-session 조합 오류인지가 표면상 동일하게 보인다.

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

---

# E. 서브에이전트 위임과 권한

39: 이름 언급은 보장 아님. 106: 코디네이터 deny 규칙 상속. 73: 중첩 최대 5단계. 104: 중단 시 부분 출력 + 미완료 표시.

## 18번 문제 (원본 39번)

**어려운 이유** [부분적으로만 맞는 오답, 길이가 단서 아님] — 이름 명시가 명시적 호출이라는 C가 상식이지만 정답은 보증되지 않는다는 B이고, B는 tool_choice 같은 근거가 다소 어긋나 "결론은 맞고 근거는 애매한" 선택을 강요한다.

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

## 19번 문제 (원본 106번)

**어려운 이유** [원칙이 깨지는 예외] — 서브에이전트의 tools 필드가 권한을 준다는 직관이 깨지고, 코디네이터의 deny 규칙이 상속되어 차단된다는 예외를 알아야 한다.

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

## 20번 문제 (원본 73번)

**어려운 이유** [덜 틀린 답 고르기] — 중첩 깊이 제한이 5단계라는 구체적 숫자가 매력적이나 Agent 도구 보유 여부에만 달렸다는 답과 경합하는 사양 세부 사항이다.

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

## 21번 문제 (원본 104번)

**어려운 이유** [덜 틀린 답 고르기] — 서버 과부하로 중단된 서브에이전트 결과가 빈 결과인지 부분 출력+미완료 표시인지가 버전별 동작 세부라 경합한다.

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

---

# F. 워크플로 패턴 선택

20: 독립 작업은 병렬. 102: 복잡도 판정 후 동적 호출. 94: 대규모는 Workflow 도구.

## 22번 문제 (원본 20번)

**어려운 이유** [유사 현상 구분, 덜 틀린 답 고르기] — 세 작업이 항상 동일하다는 점에서 고정 프롬프트 체인(D)이 맞아 보이지만, 서로 의존하지 않으므로 병렬 실행(B)이 정답이라 "고정 순서"와 "독립 병렬"의 구분이 핵심이다.

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

## 23번 문제 (원본 102번)

**어려운 이유** [길이가 단서 아님, 덜 틀린 답 고르기] — 지연 문제만 보면 전체 병렬화(A)가 즉효처럼 보이나 단순 티켓에 불필요한 호출 자체를 줄이는 동적 선택이 정답이고, 정답 보기가 길어 길이 단서도 무력하다.

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

## 24번 문제 (원본 94번)

**어려운 이유** [원칙이 깨지는 예외] — 서브에이전트 위임이 정석이라는 학습된 원칙이 200개 규모에서 깨지고 Workflow 도구로 오케스트레이션을 대화 밖으로 옮겨야 한다는 예외를 알아야 한다.

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
