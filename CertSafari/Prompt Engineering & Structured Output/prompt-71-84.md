### 71번 문제

**1. 문제 원문**

A team is adding few-shot examples to a ticket-triage prompt to fix inconsistent priority assignments. They have dozens of historical tickets available and are deciding how many to include and how to select them. Which approach best follows effective few-shot practice while avoiding new failure modes?

A) Select only the single ticket that was hardest to triage historically as the key lesson

B) Include as many historical tickets as the context window allows for maximum reliability

C) Select three to five diverse examples covering distinct edge cases relevant to triage

D) Select examples entirely at random from the archive to avoid any selection bias

---

**2. 구간별 직독직해 번역**

**QUESTION**

**A team is adding**
한 팀이 추가하고 있습니다

**few-shot examples**
퓨샷(few-shot) 예시들을

**to a ticket-triage prompt**
티켓 분류(triage) 프롬프트에

**to fix inconsistent priority assignments.**
일관되지 않은 우선순위 할당 문제를 해결하기 위해.

**They have dozens of historical tickets available**
그들은 수십 개의 과거 티켓 데이터를 보유하고 있으며

**and are deciding**
결정하려고 합니다

**how many to include**
몇 개를 포함할지

**and how to select them.**
그리고 그것들을 어떻게 선택할지를.

**Which approach**
어떤 접근 방식이

**best follows effective few-shot practice**
효과적인 퓨샷 실무 모범 사례를 가장 잘 따르면서

**while avoiding new failure modes?**
새로운 오류 유형(failure modes)을 방지할 수 있을까요?

**OPTIONS**

**A) Select only the single ticket**
단 하나의 티켓만 선택합니다

**that was hardest to triage historically**
역대 가장 분류하기 어려웠던

**as the key lesson**
핵심 교훈으로서

**B) Include as many historical tickets**
가능한 많은 과거 티켓을 포함합니다

**as the context window allows**
컨텍스트 창이 허용하는 한

**for maximum reliability**
최대의 신뢰성을 위해

**C) Select three to five diverse examples**
3개에서 5개의 다양성 있는 예시를 선택합니다

**covering distinct edge cases**
명확히 구별되는 예외 케이스(edge cases)들을 다루는

**relevant to triage**
티켓 분류와 관련된

**D) Select examples entirely at random**
예시를 완전히 무작위로 선택합니다

**from the archive**
아카이브(기록)로부터

**to avoid any selection bias**
선택 편향(selection bias)을 피하기 위해

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
C번: Select three to five diverse examples covering distinct edge cases relevant to triage

**정답 및 해설:**

**핵심 개념:** 프롬프트 엔지니어링의 퓨샷 러닝(Few-Shot Learning) 모범 사례입니다. 적절한 개수(보통 3~5개)의 다채롭고 대표성 있는 예시를 제공하여 모델이 작업의 패턴과 경계 조건(Edge Cases)을 명확히 이해하도록 돕는 프롬프트 디자인 기술입니다.

**문제 상황 분석:**
- 개발 팀이 티켓 분류 프롬프트의 불일치 문제를 해결하기 위해 과거 티켓 데이터를 활용하여 퓨샷 예시를 추가하려 함.
- 활용 가능한 과거 데이터는 수십 개가 존재함.
- 모델의 성능을 향상시키면서 과적합, 토큰 낭비, 새로운 실패 유형 발생 등의 부작용을 최소화하는 최적의 예시 선정 방식을 찾아야 함.

**C번이 정답인 이유:**
퓨샷 프롬프팅(Few-Shot Prompting)의 모범 사례는 모델에게 명확한 패턴을 학습시킬 수 있는 3~5개의 대표적이고 다양한 예시(Diverse Examples)를 선별하는 것입니다. 특히 분류 작업에서는 모호하거나 다루기 힘든 예외 케이스(Edge Cases)를 균형 있게 포함함으로써, 모델이 모호한 상황에서도 올바른 우선순위를 판단하도록 유도할 수 있습니다. 예시의 개수가 너무 적지도, 과도하게 많지도 않아 토큰 비용 효율성과 신뢰성을 모두 확보할 수 있는 기술적으로 완벽한 접근법입니다.

**오답 분석:**
- Option A (오답): 단 1개의 가장 어려운 예시만 제공하는 것(One-Shot)은 모델이 일반적인 패턴을 학습하기에 부족하며, 특정 극단적인 사례에 편향(Overfitting)되어 오히려 일반적인 티켓 분류 시 오류가 발생할 수 있습니다.
- Option B (오답): 컨텍스트 창이 허용하는 한 최대한 많은 예시를 넣으면 컨텍스트 과부하, 비용 및 지연 시간(Latency) 증가, 그리고 컨텍스트 중간에 위치한 정보에 집중하지 못하는 "Lost in the Middle" 현상 등의 failure mode가 발생합니다.
- Option D (오답): 무작위 추출은 불균형한 분포를 초래하거나 중요한 예외 케이스 및 핵심 클래스를 누락시킬 수 있으며, 품질이 낮거나 모호한 데이터가 예시로 포함되어 프롬프트 성능을 저하시킬 수 있습니다.

---

### 72번 문제

**1. 문제 원문**

A team built a classification prompt with twenty exact input-output pairs, one for every edge case they had personally encountered in their historical data. The prompt performs well on those twenty inputs but degrades noticeably whenever a customer submits a new input that is similar to, but not identical to, one of the twenty. What change would best help the model generalize its judgment to these novel-but-similar inputs?

A) Remove the examples entirely and rely on a single instruction sentence describing the desired behavior

B) Keep appending every newly discovered literal pair to the prompt so every past case is eventually represented

C) Increase the max_tokens parameter so the model has more room to reason before each classification

D) Reduce the twenty examples to a small set that makes the underlying decision rule visible to the model

---

**2. 구간별 직독직해 번역**

**QUESTION**

**A team built**
한 팀이 작성했습니다

**a classification prompt**
분류 프롬프트를

**with twenty exact input-output pairs,**
20개의 정확한 입력-출력 쌍을 포함하여,

**one for every edge case**
모든 예외 케이스(edge case)당 하나씩

**they had personally encountered**
그들이 직접 마주쳤던

**in their historical data.**
그들의 과거 데이터에서.

**The prompt performs well**
이 프롬프트는 성능을 잘 발휘합니다

**on those twenty inputs**
해당 20개의 입력에 대해서는

**but degrades noticeably**
하지만 눈에 띄게 저하됩니다

**whenever a customer submits**
고객이 제출할 때마다

**a new input**
새로운 입력을

**that is similar to,**
유사하지만,

**but not identical to,**
동일하지는 않은,

**one of the twenty.**
그 20개 중 하나와.

**What change**
어떤 변경 사항이

**would best help the model**
모델에게 가장 큰 도움이 될까요

**generalize its judgment**
그 판단을 일반화하도록

**to these novel-but-similar inputs?**
이러한 신규이지만 유사한 입력에 대해?

**OPTIONS**

**A) Remove the examples entirely**
예시들을 완전히 제거합니다

**and rely on a single instruction sentence**
그리고 단 하나의 지시 문장에 의존합니다

**describing the desired behavior**
원하는 동작을 설명하는

**B) Keep appending**
계속해서 추가합니다

**every newly discovered literal pair**
새롭게 발견된 모든 문자 그대로의(literal) 쌍을

**to the prompt**
프롬프트에

**so every past case**
모든 과거 사례가

**is eventually represented**
결국 다 다뤄질 수 있도록

**C) Increase the max_tokens parameter**
max_tokens 파라미터를 늘립니다

**so the model has more room**
모델이 더 많은 여유를 갖도록

**to reason before each classification**
각 분류 전에 추론할 수 있는

**D) Reduce the twenty examples**
20개의 예시를 줄입니다

**to a small set**
소수의 핵심 세트로

**that makes the underlying decision rule**
근본적인 결정 규칙(decision rule)을 만들어주는

**visible to the model**
모델이 쉽게 파악할 수 있도록

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: Reduce the twenty examples to a small set that makes the underlying decision rule visible to the model

**정답 및 해설:**

**핵심 개념:** 프롬프트 엔지니어링에서의 암기(Overfitting/Memorization) 방지 및 일반화(Generalization) 성능 최적화입니다. 지나치게 많은 개별 예시는 모델이 패턴을 이해하는 대신 입출력 형태를 단순히 암기하게 만듭니다.

**문제 상황 분석:**
- 개발 팀이 과거 데이터의 모든 예외 케이스를 커버하기 위해 20개에 달하는 입출력 쌍을 예시로 작성함.
- 동일한 20개 입력에 대해서는 잘 작동하지만, 조금이라도 변형된 신규 유사 입력이 들어오면 성능이 크게 저하됨 (암기 현상 발생).
- 유사하지만 새로운 입력 패턴에도 올바르게 반응할 수 있도록 모델의 '일반화 능력'을 향상시켜야 함.

**D번이 정답인 이유:**
과도한 수(20개)의 예시는 모델이 문제의 근본 원리와 규칙을 파악하는 대신 주어진 예시를 암기하도록 유도하여 과적합(Overfitting)을 일으킵니다. 따라서 예시의 개수를 소수(3~5개 수준)로 축소하고, 분류의 근본적인 판단 기준과 논리 규칙(Decision Rule)이 명확히 드러나도록 정제된 예시를 제시하는 것이 모델의 일반화(Generalization) 능력을 극대화하는 모범 사례입니다.

**오답 분석:**
- Option A (오답): 예시를 완전히 삭제하는 것(Zero-shot)은 규칙이 복잡하거나 예외 케이스가 존재하는 분류 문제에서 모델의 정확도와 응답 일관성을 떨어뜨립니다.
- Option B (오답): 새로운 사례가 나올 때마다 무제한으로 예시를 추가하는 것은 과적합을 심화시키고, 프롬프트의 토큰 비용 증가 및 지연 시간을 유발하며 "Lost in the Middle" 현상으로 성능이 더 악화됩니다.
- Option C (오답): `max_tokens` 파라미터는 모델이 생성할 수 있는 최대 출력 토큰 길이를 제한하는 설정일 뿐이며, 프롬프트의 과적합 문제나 분류 판단의 일반화 능력을 개선하지 못합니다.

---

### 73번 문제

**1. 문제 원문**

An architect wants a review subagent that can analyze generated code but must never modify it. How should the subagent be configured?

A) Grant the subagent Bash access only, since Bash can be used to read file contents without needing dedicated Read or Grep tools

B) Restrict the subagent's tools field to read-only tools like Read, Grep, and Glob, omitting Edit, Write, and Bash

C) Leave the tools field unset so the subagent inherits every tool from the parent, then instruct it in the prompt not to use Edit or Write

D) Grant the subagent Edit and Write access but set permission mode to require manual approval for every edit it proposes

---

**2. 구간별 직독직해 번역**

**QUESTION**

**An architect wants**
한 아키텍트가 원합니다

**a review subagent**
리뷰 서브에이전트(review subagent)를

**that can analyze generated code**
생성된 코드를 분석할 수 있지만

**but must never modify it.**
절대로 수정해서는 안 되는.

**How should the subagent be configured?**
이 서브에이전트는 어떻게 구성되어야 할까요?

**OPTIONS**

**A) Grant the subagent**
서브에이전트에 부여합니다

**Bash access only,**
Bash 권한만,

**since Bash can be used**
Bash는 사용될 수 있으므로

**to read file contents**
파일 내용을 읽기 위해

**without needing dedicated Read or Grep tools**
전용 Read나 Grep 도구 없이도

**B) Restrict the subagent's tools field**
서브에이전트의 tools 필드를 제한합니다

**to read-only tools**
읽기 전용 도구들로

**like Read, Grep, and Glob,**
Read, Grep, Glob과 같은,

**omitting Edit, Write, and Bash**
Edit, Write, Bash는 제외하고

**C) Leave the tools field unset**
tools 필드를 설정하지 않은 상태로 둡니다

**so the subagent inherits**
서브에이전트가 상속받도록

**every tool from the parent,**
상위(parent) 에이전트로부터 모든 도구를,

**then instruct it in the prompt**
그런 다음 프롬프트로 지시합니다

**not to use Edit or Write**
Edit나 Write를 사용하지 말라고

**D) Grant the subagent**
서브에이전트에 부여합니다

**Edit and Write access**
Edit 및 Write 권한을

**but set permission mode**
하지만 권한 모드를 설정합니다

**to require manual approval**
수동 승인을 요구하도록

**for every edit it proposes**
제안하는 모든 수정 사항에 대해

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
B번: Restrict the subagent's tools field to read-only tools like Read, Grep, and Glob, omitting Edit, Write, and Bash

**정답 및 해설:**

**핵심 개념:** Claude Code / AI 에이전트 시스템 architecture의 도구 권한 최소화 및 에이전트 도구 구성(Tool Scope Restriction) 보안 원칙입니다. 시스템 상에서 파일 변경을 원천적으로 차단하기 위해 읽기 전용 툴만 포함하도록 명시적으로 설정합니다.

**문제 상황 분석:**
- 개발자가 생성된 코드를 분석/리뷰하는 서브에이전트를 생성하고자 함.
- 서브에이전트는 코드를 절대 수정해서는 안 되는 강력한 제약 조건을 가짐.
- 프롬프트에만 의존하거나 우회 가능한 위험 없이, 하드 제어(Hard Control) 수준에서 완전한 읽기 전용 모드를 구현해야 함.

**B번이 정답인 이유:**
서브에이전트 설정의 `tools` 필드에서 파일 수정 기능을 가진 `Edit`, `Write`뿐만 아니라, 명령어 실행을 통해 파일 시스템을 변경할 가능성이 있는 `Bash` 권한까지 완전히 제외하는 것입니다. 읽기 전용 도구(`Read`, `Grep`, `Glob`)만 `tools` 목록에 포함하도록 제한함으로써, 에이전트가 의도치 않게 코드베이스를 수정하는 행위를 하드웨어/시스템 스키마 레벨에서 원천 차단할 수 있습니다.

**오답 분석:**
- Option A (오답): `Bash` 권한만 부여할 경우, 모델이 `rm`, `sed`, `echo >` 등의 Shell 명령어를 통해 파일 내용을 얼마든지 수정할 수 있게 되므로 '절대 수정 불가' 제약을 위반하게 됩니다.
- Option C (오답): 프롬프트 지시어(Soft Constraint)에만 의존하여 수정 도구 사용을 금지하는 방식은 프롬프트 탈옥이나 모델의 지시 불이행 시 파일을 수정할 위험이 여전히 존재하는 취약한 방식입니다.
- Option D (오답): 수정 권한을 주고 수동 승인을 받는 방식은 수정 동작 자체를 하드 차단하는 것이 아니며, 사용자에게 불필요한 수동 승인 피로감을 주므로 완벽한 차단 구성 방식이 아닙니다.

---

### 74번 문제

**1. 문제 원문**

An architect is reviewing a schema-enforced invoice extraction tool. The tool_use response consistently returns syntactically valid JSON with the correct field types, yet a downstream finance audit finds that individual line-item amounts frequently fail to sum to the reported invoice total. What should the architect conclude about the current design?

A) The tool_choice must be set to auto instead of a forced tool, since forced tool calls are known to skip internal consistency checks on numeric fields

B) The model is very likely hallucinating the schema itself at request time, so the input_schema needs to be resent with every single follow-up message

C) The JSON schema enforced by tool use guarantees syntactic validity but does not verify semantic correctness such as arithmetic consistency between related fields

D) The schema must be missing a required field constraint, since required fields are the only mechanism that can prevent numeric mismatches between line items and totals

---

**2. 구간별 직독직해 번역**

**QUESTION**

**An architect is reviewing**
한 아키텍트가 검토하고 있습니다

**a schema-enforced invoice extraction tool.**
스키마가 강제된 청구서 추출 도구를.

**The tool_use response**
tool_use 응답은

**consistently returns**
일관되게 반환합니다

**syntactically valid JSON**
구문적으로 유효한 JSON을

**with the correct field types,**
올바른 필드 타입과 함께,

**yet a downstream finance audit finds**
하지만 후속 재무 감사에서 발견합니다

**that individual line-item amounts**
개별 항목 금액들의 합이

**frequently fail to sum to**
자주 일치하지 않는다는 것을

**the reported invoice total.**
보고된 청구서 총액과.

**What should the architect conclude**
아키텍트는 무엇이라고 결론 내려야 할까요

**about the current design?**
현재 설계에 대해?

**OPTIONS**

**A) The tool_choice must be set to auto**
tool_choice가 auto로 설정되어야 합니다

**instead of a forced tool,**
강제 도구 호출 대신에,

**since forced tool calls are known to skip**
강제 도구 호출은 스킵하는 것으로 알려져 있으므로

**internal consistency checks on numeric fields**
숫자 필드에 대한 내부 일관성 검사를

**B) The model is very likely hallucinating**
모델이 환각을 일으키고 있을 가능성이 높습니다

**the schema itself at request time,**
요청 시점의 스키마 자체에 대해,

**so the input_schema needs to be resent**
따라서 input_schema를 다시 전송해야 합니다

**with every single follow-up message**
모든 후속 메시지마다

**C) The JSON schema enforced by tool use**
도구 사용에 의해 강제되는 JSON 스키마는

**guarantees syntactic validity**
구문적 유효성(syntactic validity)을 보장하지만

**but does not verify semantic correctness**
의미적 정확성(semantic correctness)을 검증하지는 않습니다

**such as arithmetic consistency**
산술적 일관성과 같은

**between related fields**
관련 필드 간의

**D) The schema must be missing**
스키마에 누락된 것이 틀림없습니다

**a required field constraint,**
필수 필드(required field) 제약 조건이,

**since required fields are the only mechanism**
필수 필드가 유일한 메커니즘이기 때문에

**that can prevent numeric mismatches**
숫자 불일치를 방지할 수 있는

**between line items and totals**
개별 항목과 총액 사이의

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
C번: The JSON schema enforced by tool use guarantees syntactic validity but does not verify semantic correctness such as arithmetic consistency between related fields

**정답 및 해설:**

**핵심 개념:** JSON 스키마 기반 구조화된 데이터 추출(Structured Data Extraction)의 한계와 검증 범위입니다. 스키마 제약은 구문(Type, Required 여부 등)만 보장할 뿐, 논리적/산술적 의미(Semantic Validity)까지 보장하지 않습니다.

**문제 상황 분석:**
- 청구서 데이터 추출 도구가 올바른 타입의 JSON 규격을 일관되게 생성하고 있음 (구문적 정상).
- 하지만 추출된 개별 품목(line-item) 금액의 합이 청구서 총액(total)과 일치하지 않는 문제가 발생함.
- 도구 사용(tool_use) 시 적용되는 JSON 스키마의 기술적 검증 한계를 올바르게 진단해야 함.

**C번이 정답인 이유:**
LLM의 tool_use 또는 Structured Outputs 기능에 전달되는 JSON Schema는 데이터 타입(`string`, `number` 등) 및 필드 존재 유무와 같은 구문적 유효성(Syntactic Validity)만을 기계적으로 강제합니다. 개별 항목의 합이 총액과 일치하는지와 같은 연산 법칙이나 필드 간의 논리적 일관성, 즉 의미적 정확성(Semantic Correctness)은 스키마 자체로 검증할 수 없습니다. 따라서 이러한 비즈니스 로직 및 산술 검증은 후속 애플리케이션 코드(Downstream Validation)에서 별도로 처리해야 합니다.

**오답 분석:**
- Option A (오답): `tool_choice`를 `auto`나 강제 지정(`tool`)으로 바꾸는 것과 숫자 필드의 산술 일관성 검사 여부는 아무런 관련이 없습니다.
- Option B (오답): 응답이 올바른 타입의 유효한 JSON을 반환하고 있으므로 모델이 스키마 자체를 환각(hallucination)하여 잘못 해석하는 상황이 아닙니다.
- Option D (오답): `required` 속성은 필수 필드의 존재 여부만 제약할 뿐, 개별 항목과 총액 간의 숫자 불일치를 방지하는 계산 검증 기능은 제공하지 못합니다.

---

### 75번 문제

**1. 문제 원문**

After temporarily disabling a high false-positive "performance suggestions" category and rewriting its criteria with specific, checkable rules, an architect must decide when it is safe to re-enable the category for the whole team. What is the most appropriate validation step before re-enabling it broadly?

A) Re-enable the category immediately after the new criteria are added to the repository, because the explicit rules themselves demonstrate improved precision without needing any further validation against historic pull requests.

B) Ask a single senior engineer to review the new criteria against a small set of past pull requests that triggered false positives, and authorize re-enabling if the criteria appear sound based on that manual check.

C) Re-enable the category only for pull requests opened by the engineer who reported the false positives, as a limited pilot to verify the criteria, while keeping it disabled for all other contributors.

D) Run the rewritten prompt against a held-out set of past pull requests with known findings, and confirm its false positive rate has dropped to an acceptable level before re-enabling it for everyone.

---

**2. 구간별 직독직해 번역**

**QUESTION**

**After temporarily disabling**
임시로 비활성화한 후

**a high false-positive**
높은 거짓 양성(오탐, false-positive) 비율을 보이던

**"performance suggestions" category**
"성능 제안" 범주를

**and rewriting its criteria**
그리고 그 기준을 다시 작성한 후

**with specific, checkable rules,**
구체적이고 검증 가능한 규칙으로,

**an architect must decide**
아키텍트는 결정해야 합니다

**when it is safe**
언제가 안전한지를

**to re-enable the category**
해당 범주를 다시 활성화하는 것이

**for the whole team.**
전체 팀을 위해.

**What is the most appropriate**
가장 적절한

**validation step**
검증 단계는 무엇일까요

**before re-enabling it broadly?**
이를 광범위하게 다시 활성화하기 전에?

**OPTIONS**

**A) Re-enable the category immediately**
해당 범주를 즉시 다시 활성화합니다

**after the new criteria are added**
새로운 기준이 추가된 직후

**to the repository,**
저장소에,

**because the explicit rules themselves**
명시적인 규칙들 자체가

**demonstrate improved precision**
개선된 정밀도를 증명하므로

**without needing any further validation**
추가적인 검증이 필요 없이

**against historic pull requests.**
과거 풀 리퀘스트(PR)들에 대한.

**B) Ask a single senior engineer**
단 한 명의 수석 엔지니어에게 요청합니다

**to review the new criteria**
새로운 기준을 검토하도록

**against a small set of past pull requests**
거짓 양성을 유발했던 소수의 과거 PR 세트와 비교하여,

**that triggered false positives,**
**and authorize re-enabling**
그리고 다시 활성화하도록 승인합니다

**if the criteria appear sound**
기준이 타당해 보이는 경우

**based on that manual check.**
해당 수동 점검에 기반하여.

**C) Re-enable the category only**
오직 해당 범주를 다시 활성화합니다

**for pull requests opened**
작성된 풀 리퀘스트에 대해서만

**by the engineer who reported**
보고했던 엔지니어에 의해

**the false positives,**
거짓 양성을,

**as a limited pilot**
제한된 파일럿 테스트로서

**to verify the criteria,**
기준을 검증하기 위한,

**while keeping it disabled**
비활성화 상태로 유지하면서

**for all other contributors.**
다른 모든 기여자에 대해서는.

**D) Run the rewritten prompt**
다시 작성된 프롬프트를 실행합니다

**against a held-out set**
격리된 평가용(held-out) 세트에 대해

**of past pull requests**
과거 풀 리퀘스트들의

**with known findings,**
이미 결과가 알려진,

**and confirm its false positive rate**
그리고 거짓 양성 비율이 낮아졌는지 확인합니다

**has dropped to an acceptable level**
수용 가능한 수준으로

**before re-enabling it for everyone.**
모든 사람에게 다시 활성화하기 전에.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: Run the rewritten prompt against a held-out set of past pull requests with known findings, and confirm its false positive rate has dropped to an acceptable level before re-enabling it for everyone.

**정답 및 해설:**

**핵심 개념:** 프롬프트 평가 및 회귀 테스트(Prompt Evaluation & Regression Testing) 모범 사례입니다. AI 프롬프트의 품질을 개선하거나 수정한 후에는 결과를 정량적으로 검증하기 위해 미리 별도로 격리해 둔 검증용 데이터셋(Held-out dataset / Gold standard dataset)을 기반으로 자동화된 벤치마크 테스트를 거쳐야 합니다.

**문제 상황 분석:**
- 코드 리뷰 또는 정적 분석 에이전트의 "성능 제안" 카테고리가 높은 거짓 양성(False Positive)을 발생시켜 임시 비활성화됨.
- 아키텍트가 해당 카테고리의 판단 기준 프롬프트를 명확하고 검증 가능한 규칙으로 수정함.
- 전체 팀에 배포(Re-enable)하기 전, 오탐율이 실제로 줄어들었는지 안전하게 검증하는 가장 정석적인 품질 관리(QA) 절차를 찾아야 함.

**D번이 정답인 이유:**
프롬프트 변경 사항을 배포하기 전에는 결과가 이미 수집되어 있는 과거 실제 데이터셋(Held-out Dataset)을 대상으로 수정된 프롬프트를 실행하여 정량 지표(False Positive Rate)를 측정해야 합니다. 오탐율이 목표치 이하로 감소했음을 객관적인 데이터로 확인한 후 전체 배포를 진행하는 것이 프롬프트 회귀 테스트(Regression Testing)의 모범 사례입니다.

**오답 분석:**
- Option A (오답): 아무런 실제 테스트나 검증 없이 명시적 규칙을 썼다는 이유만으로 즉시 배포하는 것은 맹목적인 추측이며, 실제 운영 환경에서 예기치 못한 Side-effect나 다른 유형의 오탐을 일으킬 수 있습니다.
- Option B (오답): 엔지니어 한 명의 주관적인 수동 눈단속(Manual Check)과 소수 편향 데이터에 의존하는 방식은 정량적인 평가 수치가 부족하며 검증의 객관성과 신뢰성을 담보할 수 없습니다.
- Option C (오답): 오류를 리포트한 특정 개발자의 PR에만 한정하여 활성화하는 라이브 프로덕션 파일럿 방식은 불완전하며, 데이터 샘플의 다양성을 반영하지 못하고 해당 개발자에게 테스트 부담을 전가합니다.

---

### 76번 문제

**1. 문제 원문**

A developer is assembling a batch of translation requests and needs to assign each one an identifier that the Message Batches API will accept and later use to correlate a result with its original request. Which identifier is valid for this purpose?

A) doc-2026-report_final, since it uses only letters, digits, hyphens, and underscores, staying under the 64-character limit

B) doc/2026/report:final, since embedding the ingestion date and a colon-separated section label makes the request easier to trace during a later audit

C) doc#2026#report#final#v2, since separating each descriptive segment with a distinct punctuation mark avoids any ambiguity about where one part ends

D) doc 2026 report final v2, since spaces between each descriptive segment keep the identifier readable when scanning a long results file by eye

---

**2. 구간별 직독직해 번역**

**QUESTION**

**A developer is assembling**
한 개발자가 구성하고 있습니다

**a batch of translation requests**
번역 요청 배치(batch)를

**and needs to assign each one**
그리고 각각에 부여해야 합니다

**an identifier**
식별자(`custom_id`)를

**that the Message Batches API will accept**
Message Batches API가 수용할 수 있고

**and later use**
추후에 사용할 수 있는

**to correlate a result**
결과를 연관 짓기 위해

**with its original request.**
원본 요청과.

**Which identifier is valid**
어떤 식별자가 유효할까요

**for this purpose?**
이 목적에 대해?

**OPTIONS**

**A) doc-2026-report_final,**
`doc-2026-report_final`

**since it uses only letters, digits,**
문자, 숫자만 사용하므로,

**hyphens, and underscores,**
하이픈, 그리고 언더스코어만,

**staying under the 64-character limit**
64자 제한을 넘지 않으면서

**B) doc/2026/report:final,**
`doc/2026/report:final`

**since embedding the ingestion date**
수집 날짜를 포함하고

**and a colon-separated section label**
콜론으로 구분된 섹션 라벨을 포함하면

**makes the request easier to trace**
요청을 추적하기 더 쉽게 만들어 주므로

**during a later audit**
나중의 감사 과정에서

**C) doc#2026#report#final#v2,**
`doc#2026#report#final#v2`

**since separating each descriptive segment**
각 기술적 세그먼트를 구분하는 것이

**with a distinct punctuation mark**
별도의 구문 기호로

**avoids any ambiguity**
모호함을 피하게 해주므로

**about where one part ends**
한 부분이 어디서 끝나는지에 대한

**D) doc 2026 report final v2,**
`doc 2026 report final v2`

**since spaces between each descriptive segment**
각 기술적 세그먼트 사이의 공백이

**keep the identifier readable**
식별자의 가독성을 유지해 주므로

**when scanning a long results file by eye**
긴 결과 파일을 눈으로 훑어볼 때

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
A번: doc-2026-report_final, since it uses only letters, digits, hyphens, and underscores, staying under the 64-character limit

**정답 및 해설:**

**핵심 개념:** Anthropic Message Batches API의 `custom_id` 식별자 제약 조건 규칙입니다. 각 요청을 식별하는 `custom_id`는 영문자, 숫자, 하이픈(`-`), 언더스코어(`_`)만 허용하며 최대 길이 제약이 있습니다.

**문제 상황 분석:**
- 개발자가 Anthropic Message Batches API를 사용해 대량의 번역 요청을 배치로 처리하려고 함.
- 각 요청 결과를 원본 요청과 매핑하기 위해 사용자 지정 식별자(`custom_id`)를 부여해야 함.
- API 규격상 유효한(Valid) 문자와 길이 제한 조건을 만족하는 식별자를 찾아야 함.

**A번이 정답인 이유:**
Anthropic의 Message Batches API 사양에 따르면, 개별 요청의 `custom_id`는 알파벳 영문자(a-z, A-Z), 숫자(0-9), 하이픈(`-`), 언더스코어(`_`) 조합으로만 구성되어야 하며, 최대 글자 수 제한(64자 이내)을 준수해야 합니다. `doc-2026-report_final`은 특수문자 없이 해당 문자 집합과 길이 제한을 완벽하게 충족하므로 유효한 식별자입니다.

**오답 분석:**
- Option B (오답): 슬래시(`/`) 및 콜론(`:`)은 API에서 허용하지 않는 금지된 특수문자이므로 요청 처리 시 유효성 검사 에러(Validation Error)가 발생합니다.
- Option C (오답): 샵/우물정 기호(`#`)는 식별자 규격에서 지원하지 않는 특수문자이므로 거부됩니다.
- Option D (오답): 공백문자(Space)는 `custom_id`에 포함될 수 없는 유효하지 않은 문자입니다.

---

### 77번 문제

**1. 문제 원문**

A purchase-order extractor uses a strict JSON schema, so every response has correctly typed fields and no missing keys. On one order, the extracted line-item amounts sum to $940 while the extracted "order_total" field reads $980. Both values are individually valid against the schema. How should this discrepancy be classified and handled?

A) As a transient sampling artifact unlikely to recur, so no additional application-level check is really needed here

B) As a schema syntax error, since the two numeric fields disagree with each other despite both matching their declared types here

C) As a semantic error the schema cannot catch, requiring a check that compares a calculated_total against the stated order_total

D) As a tool-input validation failure that strict schema enforcement should already have blocked before it was returned

---

**2. 구간별 직독직해 번역**

**QUESTION**

**A purchase-order extractor uses**
구매 주문서 추출기는 사용합니다

**a strict JSON schema,**
엄격한 JSON 스키범를,

**so every response has**
따라서 모든 응답은 가집니다

**correctly typed fields**
올바른 타입의 필드들과

**and no missing keys.**
누락되지 않은 키들을.

**On one order,**
한 주문에서,

**the extracted line-item amounts sum to $940**
추출된 개별 품목 금액의 합은 $940인 반면

**while the extracted "order_total" field reads $980.**
추출된 "order_total" 필드는 $980로 읽힙니다.

**Both values are individually valid**
두 값 모두 개별적으로 유효합니다

**against the schema.**
스키마에 대해.

**How should this discrepancy**
이 불일치는 어떻게

**be classified and handled?**
분류되고 처리되어야 할까요?

**OPTIONS**

**A) As a transient sampling artifact**
재발할 가능성이 낮은 일시적인 샘플링 아티팩트로 분류하여,

**unlikely to recur,**
**so no additional application-level check**
따라서 추가적인 애플리케이션 레벨의 검사가

**is really needed here**
여기서는 실제로 필요하지 않다

**B) As a schema syntax error,**
스키마 구문 에러로 분류하여,

**since the two numeric fields disagree**
두 숫자 필드가 불일치하기 때문에

**with each other**
서로

**despite both matching**
둘 다 일치함에도 불구하고

**their declared types here**
여기서 선언된 타입과

**C) As a semantic error**
스키마가 감지할 수 없는 의미적 오류(semantic error)로 분류하여,

**the schema cannot catch,**
**requiring a check**
검사를 요구한다

**that compares a calculated_total**
계산된 총액(calculated_total)을 비교하는

**against the stated order_total**
명시된 order_total과

**D) As a tool-input validation failure**
도구 입력 유효성 검사 실패로 분류하여,

**that strict schema enforcement**
엄격한 스키마 강제가

**should already have blocked**
이미 차단했어야만 하는

**before it was returned**
반환되기 전에

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
C번: As a semantic error the schema cannot catch, requiring a check that compares a calculated_total against the stated order_total

**정답 및 해설:**

**핵심 개념:** JSON 스키마 기반 구조화된 데이터 추출(Structured Data Extraction)의 의미적 오류(Semantic Error) 검증입니다. JSON 스키마는 데이터의 구문적 타입(Syntactic Validity)만 보장하므로, 산술적/논리적 일관성 검사는 후속 애플리케이션 검증 로직에 위임해야 합니다.

**문제 상황 분석:**
- 구매 주문서 추출기가 엄격한 JSON 스키마를 사용하여 데이터 타입 및 필수 키 규격을 모두 충족함.
- 그러나 추출된 개별 품목의 합($940)과 주문 총액 필드($980) 간에 산술적 불일치가 발생함.
- 스키마 수준에서는 두 수치 모두 유효한 숫자(number) 타입이므로 시스템 오류 없이 통과함.

**C번이 정답인 이유:**
JSON 스키마는 데이터 구조와 타입 형태(Syntactic Validity)만을 강제할 수 있으며, 서로 다른 두 필드 간의 산술 계산 관계나 비즈니스 로직(Semantic Correctness)을 검증할 수 없습니다. 따라서 이러한 불일치는 스키마가 잡아낼 수 없는 '의미적 오류(semantic error)'로 분류해야 하며, 애플리케이션 코드 레벨에서 개별 항목의 계산된 합계(`calculated_total`)와 문서의 총액(`order_total`)을 비교·검증하는 후속 로직(Downstream Logic)을 추가하여 처리해야 합니다.

**오답 분석:**
- Option A (오답): 불일치 현상은 모델의 환각이나 산술 능력 한계로 인해 지속해서 발생할 수 있으므로 무시해서는 안 되며, 애플리케이션 레벨의 검사가 반드시 필요합니다.
- Option B (오답): 두 필드 모두 선언된 타입(number)을 준수했으므로 JSON 스키마 구문 에러(Syntax error)가 아닙니다.
- Option D (오답): 엄격한 JSON 스키마 유효성 검사는 구문 규칙만 판별하므로 필드 간의 수치 계산 불일치를 차단할 수 있는 기전이 아닙니다.

---

### 78번 문제

**1. 문제 원문**

A generator instance is instructed: 'Before you finish, re-read your changes and point out any mistakes.' The team observes this rarely surfaces issues that a fresh reviewer later finds. What best explains this?

A) The instruction is phrased as a command rather than a question, and rephrasing it as a question would make the model more critical of its own output

B) The generator lacks access to the files it just wrote, so it cannot literally re-read the changes it is being asked to critique

C) The generator's extended thinking is disabled by default, so it never allocates any reasoning tokens to the re-read step at all

D) The generator is still in the session where it already committed to its design decisions, so it is less likely to question choices it just justified

---

**2. 구간별 직독직해 번역**

**QUESTION**

**A generator instance is instructed:**
생성자(generator) 인스턴스가 지시받습니다:

**'Before you finish,**
'작업을 마치기 전에,

**re-read your changes**
당신의 변경 사항을 다시 읽고

**and point out any mistakes.'**
실수가 있다면 지적하세요.'라고.

**The team observes**
팀은 관찰합니다

**this rarely surfaces issues**
이 방법이 문제점을 거의 드러내지 못한다는 것을

**that a fresh reviewer later finds.**
새로운 리뷰어(fresh reviewer)가 나중에 찾아내는.

**What best explains this?**
이 현상을 가장 잘 설명하는 것은 무엇일까요?

**OPTIONS**

**A) The instruction is phrased**
지시문이 표현되어 있습니다

**as a command rather than a question,**
질문이 아닌 명령문 형태로,

**and rephrasing it as a question**
그리고 이를 질문 형태로 바꾸는 것이

**would make the model more critical**
모델을 더 비판적으로 만들 것입니다

**of its own output**
자기 자신의 출력물에 대해

**B) The generator lacks access**
생성자가 접근 권한이 없습니다

**to the files it just wrote,**
방금 작성한 파일에 대한,

**so it cannot literally re-read**
따라서 말 그대로 다시 읽을 수 없습니다

**the changes it is being asked to critique**
비평하도록 요청받은 변경 사항을

**C) The generator's extended thinking**
생성자의 확장된 사고(extended thinking) 기능이

**is disabled by default,**
기본적으로 비활성화되어 있습니다,

**so it never allocates**
따라서 할당하지 않습니다

**any reasoning tokens**
어떠한 추론 토큰도

**to the re-read step at all**
다시 읽기 단계에 전혀

**D) The generator is still in the session**
생성자가 여전히 동일한 세션 내에 존재합니다

**where it already committed**
그것이 이미 확립했던

**to its design decisions,**
자신의 설계 결정 사항에,

**so it is less likely to question**
따라서 의문을 제기할 가능성이 낮습니다

**choices it just justified**
방금 스스로 정당화한 선택들에 대해

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: The generator is still in the session where it already committed to its design decisions, so it is less likely to question choices it just justified

**정답 및 해설:**

**핵심 개념:** LLM 에이전트 시스템 architecture의 확증 편향(Confirmation Bias) 및 생성자-검증자 분리(Generator-Evaluator Separation) 원칙입니다. 동일한 대화 맥락(Context Window) 내에서 모델에게 자신의 출력을 스스로 검토하게 하면 이전에 생성한 로직을 그대로 비판 없이 수용하는 경향이 발생합니다.

**문제 상황 분석:**
- 생성기(Generator) 역할을 하는 LLM에게 코드나 응답을 작성하게 한 뒤, 동일한 인스턴스/세션 내에서 "마무리하기 전에 정정할 실수가 있는지 검토하라"고 지시함.
- 동일 세션 검토는 성능이 떨어지며, 새로운 리뷰어 에이전트(Fresh Reviewer)가 나중에 발견하는 오류를 잡지 못함.
- 왜 단일 인스턴스 내에서의 Self-Correction/Self-Review가 한계를 갖는지 그 원인을 찾아야 함.

**D번이 정답인 이유:**
LLM은 자신이 이전 토큰으로 생성하고 정당화한 설계 결정과 논리 구조에 대해 동일한 컨텍스트 세션 내에서 확증 편향(Self-Consistency Bias)을 가집니다. 이미 확정하여 출력한 내용에 대해 동일한 세션에서 스스로 비판적 질문을 던지기 어렵기 때문에, 효과적인 코드 리뷰나 검증을 위해서는 완전히 독립된 사상을 가진 별도의 검증자 인스턴스(Fresh Evaluator/Reviewer Subagent)로 분리하여 검증해야 합니다.

**오답 분석:**
- Option A (오답): 명령문 대신 질문 형태로 프롬프트를 바꾼다고 해서 동일 세션에 존재하는 모델의 self-bias나 확증 편향이 기술적으로 해결되지 않습니다.
- Option B (오답): 생성기 에이전트는 작성된 파일 내용이나 이전 출력 토큰에 컨텍스트로 직접 접근할 수 있으므로 파일 접근 권한 부재가 원인이 아닙니다.
- Option C (오답): 확장 추론(extended thinking)의 비활성화 여부와 상관없이, 원인 본질은 추론 토큰 부족이 아닌 동일 컨텍스트 맥락에서의 생성자 편향에 있습니다.

---

### 79번 문제

**1. 문제 원문**

A lease-extraction tool processes a residential lease that states a monthly rent of $1,800 in the summary clause on page 1 but $1,850 in the payment schedule on page 4. Both values extract cleanly and both are individually valid numbers. What should the extraction output do with this discrepancy?

A) Extract only the payment-schedule figure from page four, since it sits within a more detailed section of the lease

B) Average the two conflicting values together and return that single mean figure as the extracted monthly rent amount

C) Extract both rent values, set a conflict_detected boolean to true, and route the record for human reconciliation rather than guessing

D) Extract only the first rent figure found on page one of the lease, and quietly discard the later conflicting value found on page four

---

**2. 구간별 직독직해 번역**

**QUESTION**

**A lease-extraction tool processes**
임대차 계약서 추출 도구가 처리합니다

**a residential lease**
주거용 임대차 계약서를

**that states a monthly rent of $1,800**
월 임대료 $1,800를 명시한

**in the summary clause on page 1**
1페이지의 요약 조항에

**but $1,850 in the payment schedule**
하지만 대금 지급 일정표에는 $1,850를

**on page 4.**
4페이지의.

**Both values extract cleanly**
두 값 모두 깔끔하게 추출되며

**and both are individually valid numbers.**
둘 다 개별적으로 유효한 숫자입니다.

**What should the extraction output do**
추출 출력물은 어떻게 해야 할까요

**with this discrepancy?**
이러한 불일치에 대해?

**OPTIONS**

**A) Extract only the payment-schedule figure**
지급 일정표 금액만 추출합니다

**from page four,**
4페이지의,

**since it sits within a more detailed section**
더 상세한 섹션 내에 위치하므로

**of the lease**
임대차 계약서의

**B) Average the two conflicting values together**
충돌하는 두 값을 함께 평균을 냅니다

**and return that single mean figure**
그리고 그 단일 평균값을 반환합니다

**as the extracted monthly rent amount**
추출된 월 임대료 금액으로

**C) Extract both rent values,**
두 임대료 값을 모두 추출하고,

**set a conflict_detected boolean to true,**
`conflict_detected` 불리언(Boolean) 값을 `true`로 설정하며,

**and route the record for human reconciliation**
사람의 검토/조정을 위해 해당 레코드를 전달합니다

**rather than guessing**
임의로 추측하는 대신

**D) Extract only the first rent figure**
첫 번째 임대료 금액만 추출합니다

**found on page one of the lease,**
임대차 계약서 1페이지에서 발견된,

**and quietly discard the later conflicting value**
그리고 나중에 나오는 충돌하는 값을 조용히 버립니다

**found on page four**
4페이지에서 발견된

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
C번: Extract both rent values, set a conflict_detected boolean to true, and route the record for human reconciliation rather than guessing

**정답 및 해설:**

**핵심 개념:** 정보 추출(Information Extraction) 시스템 및 LLM 에이전트 설계에서의 데이터 모호성/충돌 처리 모범 사례(Human-in-the-Loop & Fallback Strategy)입니다. 원본 문서 내 데이터 간에 명확한 충돌이 발생할 경우, 모델이 임의로 추측하거나 데이터를 손실시키는 대신 충돌 플래그를 생성하고 검토자(Human Reviewer)에게 에스컬레이션해야 합니다.

**문제 상황 분석:**
- 1페이지의 요약 조항에는 월세가 $1,800로, 4페이지의 지급 일정표에는 $1,850로 상충되게 기술되어 있음.
- 두 수치 모두 구문적으로 완벽히 추출 가능한 유효한 숫자 데이터임.
- AI 모델이나 시스템이 임의로 비즈니스적 판단을 내리지 않고, 신뢰성을 높이기 위한 올바른 예외 처리 방식을 선택해야 함.

**C번이 정답인 이유:**
LLM이나 정보 추출 시스템이 원본 문서 자체의 논리적 충돌을 마주했을 때, 둘 중 하나의 값을 임의로 선택하거나 계산하여 답을 "추측(Guessing)"하는 것은 심각한 환각(Hallucination) 및 데이터 왜곡을 유발할 수 있습니다. 가장 안전하고 모범적인 시스템 설계 방식은 충돌하는 정보 양쪽을 모두 수집한 뒤, `conflict_detected: true`와 같은 플래그를 설정하여 사람이 직접 확인하고 조정(Human Reconciliation)할 수 있도록 시스템 흐름을 제어하는 것입니다.

**오답 분석:**
- Option A (오답): 더 상세한 섹션이라는 이유만으로 시스템이 임의로 4페이지 값을 선택하는 것은 비즈니스적 추측에 불과하며, 법적/계약적 위험을 초래합니다.
- Option B (오답): 두 임대료의 평균($1,825)을 구하는 것은 문서의 원본 데이터 어디에도 존재하지 않는 가짜 데이터를 생성하는 환각(Hallucination) 행위입니다.
- Option D (오답): 먼저 발견된 값만 취하고 나중의 충돌 값을 묵인한 채 삭제(quietly discard)하는 것은 정보 손실을 야기하며 데이터 검증의 신뢰성을 완전히 떨어뜨립니다.

---

### 80번 문제

**1. 문제 원문**

A team is designing a schema to extract a customer's phone number from scanned support emails. Many older emails in the corpus never mention a phone number at all. In an early version, phone_number was marked as a required string field, and the team noticed Claude sometimes fabricated plausible-looking numbers to satisfy the schema. What is the best fix?

A) Remove the tool definition entirely and ask Claude in plain prose to only include a phone number if it is confident one was found

B) Make phone_number an optional, nullable field so Claude can omit it or return null when the source document contains no phone number

C) Keep phone_number required but change its type from string to an enum of common area codes so the model has fewer values to guess from

D) Keep phone_number required and add a second required field called phone_number_confidence so low-confidence guesses can be filtered out later

---

**2. 구간별 직독직해 번역**

**QUESTION**

**A team is designing**
한 팀이 설계하고 있습니다

**a schema to extract**
추출하기 위한 스키마를

**a customer's phone number**
고객의 전화번호를

**from scanned support emails.**
스캔된 지원 이메일로부터.

**Many older emails in the corpus**
말뭉치(corpus) 내의 많은 이전 이메일들은

**never mention a phone number at all.**
전화번호를 전혀 언급하지 않습니다.

**In an early version,**
초기 버전에서,

**phone_number was marked**
`phone_number`가 지정되었습니다

**as a required string field,**
필수 문자열(required string) 필드로,

**and the team noticed**
그리고 팀은 알아차렸습니다

**Claude sometimes fabricated**
Claude가 때때로 날조(환각)한다는 것을

**plausible-looking numbers**
그럴듯해 보이는 번호를

**to satisfy the schema.**
스키마를 충족하기 위해.

**What is the best fix?**
가장 좋은 해결책은 무엇일까요?

**OPTIONS**

**A) Remove the tool definition entirely**
도구 정의를 완전히 제거하고

**and ask Claude in plain prose**
줄글(plain prose)로 Claude에게 요청합니다

**to only include a phone number**
전화번호만 포함하도록

**if it is confident one was found**
전화번호가 발견되었다고 확신할 때만

**B) Make phone_number an optional, nullable field**
`phone_number`를 선택적(optional) 및 null 허용(nullable) 필드로 만듭니다

**so Claude can omit it**
Claude가 이를 누락할 수 있도록

**or return null**
또는 null을 반환할 수 있도록

**when the source document contains no phone number**
원본 문서에 전화번호가 포함되어 있지 않을 때

**C) Keep phone_number required**
`phone_number`를 필수 항목으로 유지하지만

**but change its type from string**
그 타입을 string에서 변경합니다

**to an enum of common area codes**
흔한 지역 번호의 enum으로

**so the model has fewer values**
모델이 더 적은 값을 갖도록

**to guess from**
추측할 수 있는

**D) Keep phone_number required**
`phone_number`를 필수 항목으로 유지하고

**and add a second required field**
두 번째 필수 필드를 추가합니다

**called phone_number_confidence**
`phone_number_confidence`라 불리는

**so low-confidence guesses**
신뢰도가 낮은 추측들을

**can be filtered out later**
나중에 걸러낼 수 있도록

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
B번: Make phone_number an optional, nullable field so Claude can omit it or return null when the source document contains no phone number

**정답 및 해설:**

**핵심 개념:** 구조화된 데이터 추출(Structured Data Extraction)에서의 스키마 설계 모범 사례입니다. 존재하지 않을 수 있는 정보에 대해 스키마 필드를 `required`로 강제하면 모델이 스키마 조건 충족을 위해 가짜 데이터(환각, Hallucination)를 생성하게 되므로, 선택적(Optional) 및 Nullable 필드로 설계해야 합니다.

**문제 상황 분석:**
- 이메일 데이터 중 상당수는 전화번호 정보가 포함되어 있지 않음.
- 초기 스키마 설계에서 `phone_number` 필드를 `required` 속성으로 지정함.
- Claude는 스키마의 필수 요구 조건을 충족하기 위해 존재하지 않는 전화번호를 그럴듯하게 지어내는 환각 현상을 일으킴.

**B번이 정답인 이유:**
원본 데이터에 정보가 부재할 가능성이 있는 속성을 `required` 필드로 지정하면 LLM은 유효성 검사 규칙을 통과하기 위해 가짜 데이터를 지어내도록 강요받게 됩니다. 해당 필드를 `optional` 및 `nullable`(`type: ["string", "null"]`)로 정의하면, 원본 문서에 관련 정보가 없을 때 모델이 안전하게 값을 생략하거나 `null`을 반환할 수 있어 환각을 효과적으로 방지할 수 있습니다.

**오답 분석:**
- Option A (오답): 구조화된 출력(Tool use / JSON Schema)을 완전히 제거하면 데이터 추출의 정교함과 후속 애플리케이션 파싱의 안정성이 현저히 떨어집니다.
- Option C (오답): 필드를 여전히 `required`로 유지한 채 `enum` 타입으로 변경하는 것은 모델이 가짜 지역 번호를 선택하도록 강요할 뿐이며, 전화번호가 없는 이메일 문제를 해결하지 못합니다.
- Option D (오답): 필드를 `required`로 유지하면 모델이 여전히 가짜 번호를 생성해야 하며, 신뢰도 필드를 추가하는 것은 불필요하게 스키마를 복잡하게 만들고 원인(필수 필드 제약)을 해결하지 못합니다.

---

### 81번 문제

**1. 문제 원문**

A team built a pipeline where the same Claude instance that generates code is then asked, within the same conversation, to 'review your own work for bugs before finishing.' QA later finds subtle issues the model missed during that self-review step. Which architectural change is most effective at catching those issues going forward?

A) Add stricter self-review instructions to the system prompt so the model scrutinizes its own prior decisions more carefully

B) Ask the same instance to review the code twice in a row within the same session before returning results

C) Increase the extended thinking budget for the self-review step so the model reasons longer before finishing

D) Spawn a second, independent Claude instance with no access to the generation session's history to review the code fresh

---

**2. 구간별 직독직해 번역**

**QUESTION**

**A team built a pipeline**
한 팀이 파이프라인을 구축했습니다

**where the same Claude instance**
동일한 Claude 인스턴스가

**that generates code**
코드를 생성하는

**is then asked,**
그 후 요청받는,

**within the same conversation,**
동일한 대화 내에서,

**to 'review your own work for bugs**
'버그가 있는지 당신 자신의 작업을 검토하라

**before finishing.'**
마무리하기 전에'라고.

**QA later finds**
QA팀이 나중에 발견합니다

**subtle issues**
미세한 문제들을

**the model missed**
모델이 놓친

**during that self-review step.**
해당 자가 검토(self-review) 단계 동안.

**Which architectural change**
어떤 아키텍처적 변경 사항이

**is most effective**
가장 효과적일까요

**at catching those issues**
그러한 문제들을 잡아내는 데

**going forward?**
앞으로?

**OPTIONS**

**A) Add stricter self-review instructions**
더 엄격한 자가 검토 지시문(instructions)을 추가합니다

**to the system prompt**
시스템 프롬프트에

**so the model scrutinizes**
모델이 면밀히 조사하도록

**its own prior decisions**
자신의 이전 결정들을

**more carefully**
더 주의 깊게

**B) Ask the same instance**
동일한 인스턴스에 요청합니다

**to review the code twice in a row**
코드를 연속으로 두 번 검토하도록

**within the same session**
동일한 세션 내에서

**before returning results**
결과를 반환하기 전에

**C) Increase the extended thinking budget**
확장 추론 예산(extended thinking budget)을 늘립니다

**for the self-review step**
자가 검토 단계를 위한

**so the model reasons longer**
모델이 더 오랫동안 추론하도록

**before finishing**
마무리하기 전에

**D) Spawn a second, independent Claude instance**
두 번째의 독립적인 Claude 인스턴스를 생성합니다

**with no access**
접근 권한이 없는

**to the generation session's history**
코드 생성 세션의 대화 이력(history)에

**to review the code fresh**
코드를 새롭게(객관적으로) 검토하기 위해

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: Spawn a second, independent Claude instance with no access to the generation session's history to review the code fresh

**정답 및 해설:**

**핵심 개념:** AI 에이전트 시스템 architecture의 생성자-검증자 분리(Generator-Evaluator Separation) 원칙 및 Self-Consistency / Confirmation Bias(확증 편향) 극복입니다. 단일 세션에서 모델에게 스스로의 결과를 검토하게 하면 이전 문맥에 의한 편향이 발생하므로, 컨텍스트가 완전히 격리된 별도의 검증자 인스턴스를 두는 것이 정석입니다.

**문제 상황 분석:**
- 코드 생성과 자가 검토(Self-review)를 동일한 Claude 인스턴스 및 대화 세션 내에서 수행하도록 파이프라인을 구축함.
- 자가 검토 단계를 거쳤음에도 불구하고 미세한 버그나 결함을 모델이 감지하지 못하고 놓침.
- 동일 맥락 내에서의 자가 검토 한계를 극복하고, 버그 감지율을 높이기 위한 구조적(Architectural) 해결책을 찾아야 함.

**D번이 정답인 이유:**
동일한 대화 세션 안에서 코드를 생성한 모델에게 자신의 코드를 리뷰하도록 하면, 모델은 자신이 생성할 때 사용한 논리와 합리화 과정에 갇혀 버그를 제대로 찾아내지 못하는 확증 편향(Self-Consistency Bias)을 보입니다. 이를 해결하는 가장 효과적인 아키텍처적 개선책은 코드 생성 세션의 히스토리에 접근할 수 없는 독립된 두 번째 Claude 인스턴스(Reviewer Subagent)를 생성하여 백지 상태(Fresh Context)에서 코드를 객관적으로 검증하도록 역할을 분리(Separation of Concerns)하는 것입니다.

**오답 분석:**
- Option A (오답): 시스템 프롬프트에 더 엄격한 자가 검토 명령을 추가하더라도 동일 세션 내에 존재하는 모델 본연의 확증 편향 및 편향된 컨텍스트 맥락을 지울 수 없으므로 근본적인 해결책이 되지 못합니다.
- Option B (오답): 동일 세션 내에서 코드를 두 번 연속으로 리뷰하게 하는 것 역시 동일한 컨텍스트 내에서의 반복일 뿐이며 편향을 심화시킬 수 있습니다.
- Option C (오답): 확장 추론(Extended Thinking) 예산을 늘리는 것은 개별 추론 깊이를 더할 수는 있으나, 이전 생성이 유효하다고 전제하는 편향된 대화 히스토리 자체가 존재하는 한 근본적인 편향 문제를 원천적으로 해결하지는 못합니다.

---

### 82번 문제

**1. 문제 원문**

A refactor touches 60 files. A single reviewer instance given the entire diff at once produces contradictory findings between files. What change to the review architecture best addresses this?

A) Ask the generator to make smaller, sequential commits, and review only the most recent commit in full each time

B) Give the single reviewer instance a much larger context window so it can hold the whole diff in memory during one pass

C) Run the same single reviewer instance twice over the full diff, and keep only findings that appear in both runs

D) Split the review into per-file passes for local issues, plus an integration pass for cross-file consistency

---

**2. 구간별 직독직해 번역**

**QUESTION**

**A refactor touches**
리팩토링 작업이 수정합니다

**60 files.**
60개의 파일을.

**A single reviewer instance**
단일 리뷰어 인스턴스가

**given the entire diff at once**
전체 diff(차이점)를 한 번에 전달받아

**produces contradictory findings**
모순된 지적 사항을 생성합니다

**between files.**
파일들 간에.

**What change to the review architecture**
리뷰 아키텍처에 대한 어떤 변경 사항이

**best addresses this?**
이를 가장 잘 해결할까요?

**OPTIONS**

**A) Ask the generator to make**
생성기(generator)에게 만들도록 요청합니다

**smaller, sequential commits,**
더 작고 순차적인 커밋을,

**and review only the most recent commit**
그리고 가장 최근 커밋만 리뷰하도록 합니다

**in full each time**
매번 전체적으로

**B) Give the single reviewer instance**
단일 리뷰어 인스턴스에 제공합니다

**a much larger context window**
훨씬 더 큰 컨텍스트 창을

**so it can hold the whole diff**
전체 diff를 담을 수 있도록

**in memory during one pass**
한 번의 패스 동안 메모리에

**C) Run the same single reviewer instance**
동일한 단일 리뷰어 인스턴스를 실행합니다

**twice over the full diff,**
전체 diff에 대해 두 번,

**and keep only findings**
그리고 지적 사항만 유지합니다

**that appear in both runs**
두 실행 모두에서 나타나는

**D) Split the review into**
리뷰를 분할합니다

**per-file passes for local issues,**
개별 파일 단위 패스로 국소적(local) 문제를 검토하고,

**plus an integration pass**
통합 패스를 추가하여

**for cross-file consistency**
파일 간 일관성을 검토하도록

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: Split the review into per-file passes for local issues, plus an integration pass for cross-file consistency

**정답 및 해설:**

**핵심 개념:** 대규모 컨텍스트 및 분산 에이전트 코드 리뷰 아키텍처(Multi-pass Review Architecture) 모범 사례입니다. 엄청난 분량의 diff를 단일 인스턴스에 한꺼번에 전달하면 컨텍스트 과부하로 인해 모순된 결과나 환각이 발생하므로, 파일별 세부 검토(Per-file Pass)와 전체 통합 검토(Integration Pass) 단계로 분리하여 처리합니다.

**문제 상황 분석:**
- 60개에 달하는 다량의 파일 리팩토링 diff를 단일 리뷰어 AI 인스턴스에 통째로 입력함.
- 대용량 입력으로 인해 모델이 파일 간 분석에서 서로 모순되는 지적 사항(contradictory findings)을 남김.
- 방대한 코드베이스 리뷰 시 일관성과 분석 정확도를 확보하기 위한 최적의 시스템 설계 구조를 선택해야 함.

**D번이 정답인 이유:**
대규모 코드 diff를 한꺼번에 분석하려 하면 모델의 주의력(Attention)이 분산되어 파일 간 모순이나 누락이 발생합니다. 최적의 에이전트 설계는 계층적 리뷰 방식(Map-Reduce 형태)을 적용하는 것입니다. 각 파일 내부의 구문 및 국소적 버그는 파일별 독립 패스(per-file pass)로 나눠 세밀하게 분석(Map)하고, 이후 전체 파일 간 인터페이스 및 연결 일관성은 통합 패스(integration pass)로 검토(Reduce)함으로써 복잡도를 효과적으로 분산시키고 정확도를 끌어올릴 수 있습니다.

**오답 분석:**
- Option A (오답): 이전 커밋 정보를 무시하고 가장 최근 커밋만 검토하면 60개 파일 전체에 걸친 전체 리팩토링의 맥락과 변경 사항을 놓치게 됩니다.
- Option B (오답): 컨텍스트 창(Context Window)의 크기를 단순히 늘린다고 해도 컨텍스트 분량 증가에 따른 정보주의력 저하(Lost in the Middle 현상 및 환각)를 막을 수 없어 모순 문제를 해결하지 못합니다.
- Option C (오답): 거대한 전체 diff에 대해 거듭 실행을 반복하더라도 단일 패스의 컨텍스트 과부하 문제 자체가 해결되지 않으므로 논리적 모순을 없앨 수 없으며 비용만 두 배로 낭비됩니다.

---

### 83번 문제

**1. 문제 원문**

A developer building a metadata-tagging pipeline registers a single `tag_document` tool and sets `tool_choice` to `{"type": "tool", "name": "tag_document"}` to ensure every input document is tagged. They also want Claude to use extended thinking to reason carefully before tagging ambiguous documents. During testing, requests combining extended thinking with this `tool_choice` setting return an error. What should the developer do to resolve this?

A) Keep `tool_choice` forced to `tag_document` and disable extended thinking for the request, because forced tool selections are incompatible with extended thinking

B) Switch `tool_choice` to `{"type": "auto"}`, since extended thinking is only compatible with `auto` (or `none`) and is not supported alongside forced tool selections like `any` or a named tool

C) Keep `tool_choice` forced to `tag_document`, and add a top-level `thinking_mode: "extended"` field directly inside the tool's `input_schema` to bypass the restriction

D) Switch `tool_choice` to `{"type": "any"}`, since `any` is explicitly designed to support extended thinking while `auto` and forced-tool modes are the ones that are incompatible

---

**2. 구간별 직독직해 번역**

**QUESTION**

**A developer building**
한 개발자가 구축하고 있습니다

**a metadata-tagging pipeline**
메타데이터 태깅 파이프라인을

**registers a single `tag_document` tool**
단일 `tag_document` 도구를 등록하고

**and sets `tool_choice`**
`tool_choice`를 설정합니다

**to `{"type": "tool", "name": "tag_document"}`**
`{"type": "tool", "name": "tag_document"}`로

**to ensure every input document is tagged.**
모든 입력 문서가 태그되도록 보장하기 위해.

**They also want Claude**
그들은 또한 Claude가

**to use extended thinking**
확장 추론(extended thinking)을 사용하기를 원합니다

**to reason carefully**
신중하게 추론하도록

**before tagging ambiguous documents.**
모호한 문서에 태그를 지정하기 전에.

**During testing,**
테스트하는 동안,

**requests combining extended thinking**
확장 추론을 결합한 요청이

**with this `tool_choice` setting**
이 `tool_choice` 설정과

**return an error.**
에러를 반환합니다.

**What should the developer do**
개발자는 무엇을 해야 할까요

**to resolve this?**
이를 해결하기 위해?

**OPTIONS**

**A) Keep `tool_choice` forced to `tag_document`**
`tool_choice`를 `tag_document`로 강제된 상태로 유지하고

**and disable extended thinking for the request,**
해당 요청에 대해 확장 추론을 비활성화합니다,

**because forced tool selections are incompatible**
강제 도구 선택은 호환되지 않으므로

**with extended thinking**
확장 추론과

**B) Switch `tool_choice` to `{"type": "auto"}`**,
`tool_choice`를 `{"type": "auto"}`로 전환합니다,

**since extended thinking is only compatible**
확장 추론은 오직 호환되기 때문에

**with `auto` (or `none`)**
`auto` (또는 `none`)와만

**and is not supported**
그리고 지원되지 않기 때문에

**alongside forced tool selections**
강제 도구 선택과 함께는

**like `any` or a named tool**
`any` 또는 지정된 이름의 도구(named tool)와 같은

**C) Keep `tool_choice` forced to `tag_document`**,
`tool_choice`를 `tag_document`로 강제 유지하고,

**and add a top-level `thinking_mode: "extended"` field**
최상위 `thinking_mode: "extended"` 필드를 추가합니다

**directly inside the tool's `input_schema`**
도구의 `input_schema` 내부에 직접

**to bypass the restriction**
제한을 우회하기 위해

**D) Switch `tool_choice` to `{"type": "any"}`**,
`tool_choice`를 `{"type": "any"}`로 전환합니다,

**since `any` is explicitly designed**
`any`는 명시적으로 설계되었으므로

**to support extended thinking**
확장 추론을 지원하도록

**while `auto` and forced-tool modes**
반면 `auto` 및 강제 도구 모드는

**are the ones that are incompatible**
호환되지 않는 모드이므로

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
A번: Keep `tool_choice` forced to `tag_document` and disable extended thinking for the request, because forced tool selections are incompatible with extended thinking

**정답 및 해설:**

**핵심 개념:** Anthropic Claude API의 Extended Thinking(확장 추론) 기능과 Forced Tool Selection(도구 강제 호출) 간의 API 제약 조건 및 시스템 요구사항 충족 설계입니다.

**문제 상황 분석:**
- 개발자가 모든 입력 문서에 반드시 태그가 부여되도록 `tool_choice: {"type": "tool", "name": "tag_document"}` 설정을 사용하여 도구 호출을 강제함.
- 동시 처리를 위해 Extended Thinking을 활성화했으나 API 호환성 오류가 발생함.
- 파이프라인의 핵심 요구사항(모든 문서 필수 태깅 보장)을 훼손하지 않으면서 API 에러를 해결해야 함.

**A번이 정답인 이유:**
Anthropic Claude API 사양에 따르면 Extended Thinking 기능은 `tool_choice`가 `auto` 또는 `none`일 때만 호환됩니다. `{"type": "tool", "name": "tag_document"}`와 같은 강제 지정(Forced Tool Selection)이나 `any` 지정 방식은 Extended Thinking과 함께 사용할 수 없어 API 에러가 유발됩니다.
이때 파이프라인의 핵심 요구사항인 '모든 문서의 필수 태깅 보장'을 유지하려면, 도구 강제 설정을 건드리지 않고 해당 API 요청에서 Extended Thinking을 비활성화하는 것이 시스템 제약 조건을 충족시키는 유일한 정답입니다.

**오답 분석:**
- Option B (오답): `tool_choice`를 `auto`로 변경하면 API 에러는 해소되지만, Claude가 도구를 호출하지 않고 일반 텍스트 응답을 반환할 수 있어 파이프라인의 필수 요구사항(모든 문서 필수 태깅)을 보장할 수 없게 됩니다.
- Option C (오답): `input_schema` 내부에 `thinking_mode` 필드를 추가한다고 해서 API 레벨의 매개변수 호환성 제약을 우회할 수 없으며, 존재하지 않는 잘못된 스키마 속성입니다.
- Option D (오답): `any` 모드 역시 특정 도구 집합 호출을 강제하는 Forced Tool Selection의 일종이므로 Extended Thinking과 호환되지 않으며 에러가 발생합니다.

---

### 84번 문제

**1. 문제 원문**

An engineer configures the generation session with a high extended thinking effort and instructs the model to reflect deeply on flaws before submitting its code. Bugs still slip through review. Why is extended thinking insufficient as a substitute for an independent review instance here?

A) Extended thinking is capped at a token budget that is too small to cover a second full pass over the generated code

B) Extended thinking still runs in the same session that produced the code, so it retains the reasoning that justified those decisions

C) Extended thinking disables tool use during reflection, so the model cannot re-read the files it just wrote to check them

D) Extended thinking spends more tokens on reasoning, but the depth of scrutiny per issue stays roughly the same during the reflection step

---

**2. 구간별 직독직해 번역**

**QUESTION**

**An engineer configures**
한 엔지니어가 설정합니다

**the generation session**
코드 생성 세션을

**with a high extended thinking effort**
높은 확장 추론 노력(extended thinking effort) 수준으로

**and instructs the model**
그리고 모델에 지시합니다

**to reflect deeply on flaws**
결함에 대해 깊이 되돌아보도록(반성하도록)

**before submitting its code.**
코드를 제출하기 전에.

**Bugs still slip through review.**
그럼에도 버그들이 검토를 통과하여 빠져나갑니다.

**Why is extended thinking insufficient**
왜 확장 추론은 불충분할까요

**as a substitute**
대체재로서

**for an independent review instance here?**
여기서 독립된 리뷰 인스턴스를 대체하기에는?

**OPTIONS**

**A) Extended thinking is capped**
확장 추론은 제한됩니다

**at a token budget**
토큰 예산으로

**that is too small**
너무 작은

**to cover a second full pass**
두 번째 전체 패스(검토)를 다루기에

**over the generated code**
생성된 코드에 대해

**B) Extended thinking still runs**
확장 추론은 여전히 실행됩니다

**in the same session**
동일한 세션 내에서

**that produced the code,**
코드를 생성한,

**so it retains the reasoning**
따라서 추론(논리)을 그대로 유지합니다

**that justified those decisions**
그러한 결정들을 정당화했던

**C) Extended thinking disables tool use**
확장 추론은 도구 사용을 비활성화합니다

**during reflection,**
성찰(reflection) 과정 동안,

**so the model cannot re-read**
따라서 모델이 다시 읽을 수 없습니다

**the files it just wrote**
방금 작성한 파일들을

**to check them**
그것들을 확인하기 위해

**D) Extended thinking spends**
확장 추론은 사용합니다

**more tokens on reasoning,**
추론에 더 많은 토큰을,

**but the depth of scrutiny per issue**
하지만 이슈당 정밀 검토의 깊이는

**stays roughly the same**
대략 동일하게 유지됩니다

**during the reflection step**
성찰 단계 동안

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
B번: Extended thinking still runs in the same session that produced the code, so it retains the reasoning that justified those decisions

**정답 및 해설:**

**핵심 개념:** AI 에이전트 시스템 architecture의 생성자-검증자 분리(Generator-Evaluator Separation) 원칙 및 확증 편향(Confirmation Bias) 극복입니다. 단일 대화 맥락 내에서는 모델이 자신의 이전 논리를 정당화하려는 성향이 유지되므로 독립된 리뷰어 인스턴스가 필요합니다.

**문제 상황 분석:**
- 엔지니어가 코드 생성 세션의 확장 추론(Extended Thinking) 노력을 최대로 높이고, 스스로 버그와 결함을 깊이 되돌아보도록 프롬프트를 구성함.
- 그럼에도 불구하고 미세한 버그나 결함을 잡아내지 못하고 리뷰 단계에서 누락됨.
- 확장 추론 기능만으로는 독립된 검증자 인스턴스(Independent Reviewer Instance)를 대체할 수 없는 근본적인 아키텍처적 원인을 찾아야 함.

**B번이 정답인 이유:**
동일한 세션 내에서 수행되는 확장 추론은 코드를 작성할 때 형성된 대화 맥락(Context)과 추론 가정(Assumptions)을 그대로 공유합니다. 모델이 코드를 생성하면서 이미 가졌던 논리와 자기 정당화(Self-Justification) 프레임에 갇혀 있기 때문에, 아무리 생각하는 토큰을 늘려도(High effort) 자신의 오류를 객관적으로 포착하기 어렵습니다. 따라서 동일 세션에서의 자가 성찰(Self-reflection)은 편향을 완전히 탈피하지 못하며, 이전 대화 이력이 없는 완전히 독립된 리뷰어 인스턴스(Fresh Context Reviewer)로 분리해야만 정밀한 검증이 가능합니다.

**오답 분석:**
- Option A (오답): 확장 추론의 토큰 예산이 부족해서 버그를 놓치는 것이 아니며, 예산을 극대화하더라도 동일 세션 내의 확증 편향 문제는 해결되지 않습니다.
- Option C (오답): 확장 추론 중에 도구 사용이 원천 차단되는 것이 아니며, 본질적인 원인은 도구 사용 여부가 아니라 세션 간 컨텍스트 미분리로 인한 자가 편향에 있습니다.
- Option D (오답): 확장 추론은 추론 깊이와 면밀함을 크게 높여주지만, 이슈 검토의 기술적 깊이가 부족한 것이 아니라 동일 세션 내의 확증 편향이 문제의 본질입니다.