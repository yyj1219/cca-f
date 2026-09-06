### 57번 문제

**1. 문제 원문**

A logistics company ingests shipment confirmation emails from many different carriers. Dates appear as `03/14/2026`, `14-Mar-2026`, and `2026.03.14` depending on the carrier, but the extraction schema defines `ship_date` as a string with a strict ISO 8601 pattern. Extractions frequently fail schema validation because the source dates don't match the expected format. According to the current Anthropic official guidance, what is the most effective fix?

A) Loosen the schema to accept any string for `ship_date`, and add a downstream step that uses a date parser to normalize the value to ISO 8601 format before storing it in the database.

B) Remove the `ship_date` field from the extraction schema and infer the shipment date later from other fields such as tracking number lookup or email metadata.

C) Retain the strict ISO 8601 schema constraint for `ship_date` and add an explicit `description` in the JSON schema telling Claude to parse and normalize the carrier date string to ISO 8601 format (e.g., `YYYY-MM-DD`).

D) Split `ship_date` into three fields such as `ship_date_us`, `ship_date_eu`, and `ship_date_iso`, each expecting a different carrier date format, and populate only the one matching the extracted string.

---

**2. 구간별 직독직해 번역**

**[QUESTION]**

**A logistics company**
한 물류 회사는

**ingests shipment confirmation emails**
배송 확인 이메일을 수집합니다

**from many different carriers.**
여러 다양한 운송업체로부터.

**Dates appear as**
날짜는 다음과 같이 표시됩니다

**03/14/2026, 14-Mar-2026, and 2026.03.14**
03/14/2026, 14-Mar-2026, 그리고 2026.03.14로

**depending on the carrier,**
운송업체에 따라,

**but the extraction schema defines**
하지만 추출 스키마는 정의합니다

**ship_date as a string**
`ship_date`를 문자열로

**with a strict ISO 8601 pattern.**
엄격한 ISO 8601 패턴을 가진.

**Extractions frequently fail**
추출이 자주 실패합니다

**schema validation**
스키마 검증에

**because the source dates don't match**
원본 날짜가 일치하지 않기 때문에

**the expected format.**
예상된 형식과.

**According to the current Anthropic official guidance,**
최신 Anthropic 공식 가이드에 따르면,

**what is the most effective fix?**
가장 효과적인 해결책은 무엇입니까?

**[OPTIONS]**

**A) Loosen the schema**
스키마를 완화하여

**to accept any string for ship_date,**
`ship_date`에 대해 모든 문자열을 허용하고,

**and add a downstream step**
후속 단계를 추가합니다

**that uses a date parser**
날짜 파서를 사용하여

**to normalize the value to ISO 8601 format**
값을 ISO 8601 형식으로 정규화하는

**before storing it in the database.**
데이터베이스에 저장하기 전에.

<br>

**B) Remove the ship_date field**
`ship_date` 필드를 제거합니다

**from the extraction schema**
추출 스키마에서

**and infer the shipment date later**
그리고 나중에 배송 날짜를 추론합니다

**from other fields**
다른 필드로부터

**such as tracking number lookup or email metadata.**
운송장 번호 조회 또는 이메일 메타데이터와 같은.

<br>

**C) Retain the strict ISO 8601 schema constraint**
`ship_date`에 대한 엄격한 ISO 8601 스키마 제약을 유지하고

**for ship_date**
`ship_date` 필드에 대해

**and add an explicit description**
명시적인 `description`을 추가합니다

**in the JSON schema**
JSON 스키마에

**telling Claude to parse and normalize**
Claude에게 파싱 및 정규화를 하도록 지시하는

**the carrier date string to ISO 8601 format (e.g., YYYY-MM-DD).**
운송업체 날짜 문자열을 ISO 8601 형식(예: YYYY-MM-DD)으로.

<br>

**D) Split ship_date into three fields**
`ship_date`를 세 개의 필드로 분할합니다

**such as ship_date_us, ship_date_eu, and ship_date_iso,**
`ship_date_us`, `ship_date_eu`, `ship_date_iso`와 같은,

**each expecting a different carrier date format,**
각각 서로 다른 운송업체 날짜 형식을 기대하며,

**and populate only the one**
하나의 필드만 채웁니다

**matching the extracted string.**
추출된 문자열과 일치하는.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
A번: Loosen the schema to accept any string for `ship_date`, and add a downstream step that uses a date parser to normalize the value to ISO 8601 format before storing it in the database.

**정답 및 해설:**

**핵심 개념:**
LLM을 활용한 정보 추출(Information Extraction) 시스템 설계 시 스키마 제약과 후속 처리(Downstream Processing)의 역할 분담에 관한 모범 사례입니다. 비구조화된 다양한 포맷의 데이터를 추출할 때 스키마 레벨에서 과도하게 엄격한 패턴 제약을 걸면 검증 실패(Validation Failure)가 발생하므로 추출 단계와 정규화 단계를 분리해야 합니다.

**문제 상황 분석:**
- 운송업체마다 이메일 내 날짜 포맷(`03/14/2026`, `14-Mar-2026`, `2026.03.14` 등)이 다르게 입력되고 있습니다.
- 추출 스키마에서 `ship_date`에 엄격한 ISO 8601 패턴 제약을 설정해 두어 스키마 검증 실패가 빈번하게 발생합니다.
- Anthropic 공식 가이드에 부합하는 가장 안정적이고 효과적인 해결 방법을 찾고 있습니다.

**A번이 정답인 이유:**
Anthropic 공식 문서 및 LLM 시스템 설계 모범 사례에 따르면, 비구조화된 다량의 포맷 데이터를 추출할 때는 LLM 추출 단계에서 스키마 제약을 단순 문자열(`type: string`)로 완화하여 원본 데이터를 안정적으로 추출하는 것이 권장됩니다. 추출 이후, 확정적(deterministic)이고 신뢰할 수 있는 후속 애플리케이션 코드(Downstream Date Parser)를 통해 ISO 8601 형식으로 정규화(Normalization)하여 데이터베이스에 저장하는 것이 시스템의 안정성과 성공률을 극대화하는 모범적인 접근 방식입니다.

**오답 분석:**
- Option B (오답): 핵심 정보인 배송 날짜 필드 자체를 추출 스키마에서 제거하는 것은 비효율적이며, 운송장 번호 조회나 메타데이터 추론에 의존하는 것은 불필요한 복잡성과 외부 API 호출 비용을 발생시킵니다.
- Option C (오답): JSON 스키마 내의 엄격한 정규표현식(Regex)이나 ISO 8601 패턴 제약이 유지되면, Claude가 원본 문자열을 정확히 인지하더라도 스키마 검증 단계(Schema Validation)에서 거부되어 오류가 지속 발생합니다.
- Option D (오답): 날짜 포맷마다 필드(`ship_date_us`, `ship_date_eu` 등)를 분할하는 방식은 스키마 구조를 불필요하게 복잡하게 만들고, 새로운 포맷이 추가될 때마다 스키마를 계속 수정해야 하므로 유지보수성이 크게 떨어집니다.

---

### 58번 문제

**1. 문제 원문**

An architect defines a 'code-reviewer' subagent and invokes it from the main agent immediately after code generation. Which statement accurately describes what context the reviewer subagent starts with?

A) The subagent starts with its own system prompt plus the Agent tool's prompt string, but not the parent's history or tool results

B) The subagent inherits the parent's reasoning trace but not the actual code files, so the parent must re-describe the implementation in prose

C) The subagent automatically receives the parent's entire conversation transcript, including every tool call and result from the generation phase

D) The subagent shares the same context window as the parent, so any file the parent read during generation is already visible to the subagent

---

**2. 구간별 직독직해 번역**

**[QUESTION]**

**An architect defines**
한 아키텍트가 정의합니다

**a 'code-reviewer' subagent**
'code-reviewer' 서브에이전트를

**and invokes it**
그리고 이를 호출합니다

**from the main agent**
메인 에이전트로부터

**immediately after code generation.**
코드 생성 직후에.

**Which statement accurately describes**
어떤 문장이 정확하게 설명합니까

**what context**
어떤 컨텍스트를 가지고

**the reviewer subagent starts with?**
검토자 서브에이전트가 시작하는지를?

**[OPTIONS]**

**A) The subagent starts with**
서브에이전트는 시작합니다

**its own system prompt**
자체 시스템 프롬프트와

**plus the Agent tool's prompt string,**
Agent 도구의 프롬프트 문자열을 더하여,

**but not the parent's history**
하지만 부모의 대화 기록이나

**or tool results**
도구 실행 결과는 포함하지 않습니다

<br>

**B) The subagent inherits**
서브에이전트는 상속받습니다

**the parent's reasoning trace**
부모의 추론 추적 기록을

**but not the actual code files,**
하지만 실제 코드 파일은 제외하고,

**so the parent must re-describe**
따라서 부모는 다시 설명해야 합니다

**the implementation in prose**
구현 내용을 글(줄글)로

<br>

**C) The subagent automatically receives**
서브에이전트는 자동으로 전달받습니다

**the parent's entire conversation transcript,**
부모의 전체 대화 기록을,

**including every tool call**
모든 도구 호출과

**and result from the generation phase**
생성 단계의 결과를 포함하여

<br>

**D) The subagent shares**
서브에이전트는 공유합니다

**the same context window as the parent,**
부모와 동일한 컨텍스트 창을,

**so any file the parent read**
따라서 부모가 읽은 모든 파일은

**during generation**
생성 과정 중에

**is already visible to the subagent**
서브에이전트가 이미 볼 수 있습니다

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
A번: The subagent starts with its own system prompt plus the Agent tool's prompt string, but not the parent's history or tool results

**정답 및 해설:**

**핵심 개념:**
Anthropic 에이전트 아키텍처(Agentic Architecture) 및 Claude Agentic 워크플로에서 서브에이전트(Subagent)의 컨텍스트 격리(Context Isolation) 원칙에 대한 문제입니다. 서브에이전트는 독자적인 컨텍스트 창(Clean Context)을 가지고 실행되어 부모 에이전트의 대화 이력 오염을 방지합니다.

**문제 상황 분석:**
- 메인 에이전트(Parent Agent)가 코드를 생성한 직후 'code-reviewer' 서브에이전트를 호출합니다.
- 서브에이전트가 생성될 때 초기화되는 컨텍스트(Context) 범위에 대한 정확한 동작을 파악해야 합니다.
- 서브에이전트 호출 시 부모의 컨텍스트가 자동으로 전달되는지, 혹은 독립된 컨텍스트로 시작되는지가 핵심 구분 요소입니다.

**A번이 정답인 이유:**
Anthropic의 멀티 에이전트/서브에이전트 설계 모범 사례에 따르면, 서브에이전트는 토큰 낭비 방지 및 불필요한 노이즈 차단을 위해 독립된 컨텍스트 창을 새로 생성하여 시작합니다. 서브에이전트가 실행될 때 보유하는 컨텍스트는 서브에이전트 고유의 system prompt와 부모 에이전트가 Agent 도구 호출 시 전달한 입력 프롬프트(prompt string)뿐이며, 부모 에이전트의 이전 대화 히스토리나 다른 도구 실행 결과는 자동으로 상속되지 않습니다.

**오답 분석:**
- Option B (오답): 서브에이전트는 부모의 추론 기록(Reasoning trace)을 자동으로 상속받지 않습니다.
- Option C (오답): 서브에이전트는 부모의 전체 대화 기록 및 모든 도구 호출/결과를 자동으로 전달받지 않습니다. (독립된 컨텍스트로 시작함)
- Option D (오답): 서브에이전트는 부모와 동일한 컨텍스트 창을 공유하지 않으며 별도의 컨텍스트 창을 할당받습니다.

---

### 59번 문제

**1. 문제 원문**

A document-processing service receives files that could be invoices, resumes, or contracts, but the type is not known ahead of time. The service defines three separate extraction tools (`extract_invoice`, `extract_resume`, `extract_contract`) and needs Claude to always call exactly one of them so the pipeline never falls back to plain text. Which `tool_choice` configuration should be used?

A) Omit the `tools` parameter and instruct Claude in the system prompt to always respond using one of the three named JSON shapes

B) Set `tool_choice` to `{"type": "tool", "name": "extract_invoice"}` so the same extraction tool always runs regardless of document type

C) Set `tool_choice` to `{"type": "auto"}` so Claude evaluates the document and decides whether calling a tool is appropriate

D) Set `tool_choice` to `{"type": "any"}` so Claude must call one of the three tools but can pick whichever matches the document

---

**2. 구간별 직독직해 번역**

**[QUESTION]**

**A document-processing service**
문서 처리 서비스는

**receives files**
파일들을 수신합니다

**that could be invoices, resumes, or contracts,**
송장, 이력서, 또는 계약서일 수 있는,

**but the type is not known**
하지만 유형을 알 수 없습니다

**ahead of time.**
사전에.

**The service defines**
이 서비스는 정의합니다

**three separate extraction tools**
세 개의 개별 추출 도구를

**(extract_invoice, extract_resume, extract_contract)**
(`extract_invoice`, `extract_resume`, `extract_contract`)

**and needs Claude to always call**
그리고 Claude가 항상 호출하도록 해야 합니다

**exactly one of them**
그 중 정확히 하나만을

**so the pipeline never falls back**
파이프라인이 절대로 되돌아가지 않도록

**to plain text.**
일반 텍스트 출력으로.

**Which tool_choice configuration**
어떤 `tool_choice` 설정이

**should be used?**
사용되어야 합니까?

**[OPTIONS]**

**A) Omit the tools parameter**
`tools` 파라미터를 생략하고

**and instruct Claude in the system prompt**
시스템 프롬프트에서 Claude에게 지시합니다

**to always respond using**
항상 사용하여 응답하도록

**one of the three named JSON shapes**
지정된 세 가지 JSON 형태 중 하나를

<br>

**B) Set tool_choice to {"type": "tool", "name": "extract_invoice"}**
`tool_choice`를 `{"type": "tool", "name": "extract_invoice"}`로 설정합니다

**so the same extraction tool always runs**
동일한 추출 도구가 항상 실행되도록

**regardless of document type**
문서 유형에 관계없이

<br>

**C) Set tool_choice to {"type": "auto"}**
`tool_choice`를 `{"type": "auto"}`로 설정합니다

**so Claude evaluates the document**
Claude가 문서를 평가하고

**and decides whether calling a tool is appropriate**
도구 호출이 적절한지 여부를 결정하도록

<br>

**D) Set tool_choice to {"type": "any"}**
`tool_choice`를 `{"type": "any"}`로 설정합니다

**so Claude must call one of the three tools**
Claude가 세 도구 중 하나를 반드시 호출해야 하지만

**but can pick whichever matches the document**
문서와 일치하는 것을 자유롭게 선택할 수 있도록

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: Set `tool_choice` to `{"type": "any"}` so Claude must call one of the three tools but can pick whichever matches the document

**정답 및 해설:**

**핵심 개념:**
Anthropic Claude API의 `tool_choice` 파라미터 조작에 관한 문제입니다. Claude에게 도구 사용을 강제하면서도 복수의 도구 옵션 중 문서 유형에 적합한 도구를 모델 스스로 선택하게 만들려면 `{"type": "any"}` 옵션을 지정해야 합니다.

**문제 상황 분석:**
- 입력 파일이 송장, 이력서, 계약서 중 하나이지만 사전 유형 분류가 불가능한 상황입니다.
- 제공된 도구는 `extract_invoice`, `extract_resume`, `extract_contract` 총 3개입니다.
- 파이프라인 안전성을 위해 일반 텍스트 응답으로 이탈하는 것을 방지하고, 제공된 3개의 도구 중 정확히 하나를 **강제로 호출(Forced tool use)**하게 만들어야 합니다.

**D번이 정답인 이유:**
`tool_choice: {"type": "any"}` 설정은 Claude가 제공된 도구 목록(`tools`) 중에서 **반드시 하나 이상의 도구를 호출하도록 강제**합니다. 동시에 특정한 도구 하나만을 고정하는 것이 아니라, 정의된 도구들 중 어떤 도구를 사용할지 모델이 전달된 입력(문서 내용)을 분석하여 자유롭게 판단할 수 있게 해줍니다. 따라서 일반 텍스트 응답 방지와 유연한 도구 선택이라는 요구사항을 완벽히 충족합니다.

**오답 분석:**
- Option A (오답): `tools` 파라미터를 아예 제거하면 Claude API의 도구 호출(Tool Use) 기능을 사용할 수 없으며, 프롬프트 지시만으로는 모델이 일반 텍스트나 잘못된 형식으로 응답하는 것을 보장하여 막을 수 없습니다.
- Option B (오답): `{"type": "tool", "name": "extract_invoice"}` 설정은 문서 내용이 이력서나 계약서이더라도 무조건 `extract_invoice` 도구만 강제로 호출하므로 잘못된 도구가 실행됩니다.
- Option C (오답): `{"type": "auto"}`는 Claude API의 기본 동작으로, 모델이 도구를 호출할지 아니면 일반 텍스트로 응답할지를 스스로 결정합니다. 따라서 파이프라인이 일반 텍스트 응답으로 이탈할 가능성이 존재합니다.

---

### 60번 문제

**1. 문제 원문**

A pull-request review agent is meant to flag branches (conditional paths) that lack test coverage. In practice it inconsistently flags newly introduced branches that are already exercised indirectly by an existing integration test, producing noisy false positives that erode reviewer trust. Detailed instructions about 'coverage' have not resolved the inconsistency. What should the team add to the prompt?

A) A couple of examples pairing a diff with a coverage judgment: one branch with no test, one covered indirectly

B) A requirement to run the full test suite and flag any branch under one hundred percent line coverage

C) A rule treating any file changed by fewer than ten lines as automatically having adequate coverage

D) An instruction to flag every new conditional branch in a diff regardless of the surrounding test suite entirely

---

**2. 구간별 직독직해 번역**

**[QUESTION]**

**A pull-request review agent**
Pull Request 검토 에이전트는

**is meant to flag branches**
분기(조건부 경로)를 표시하도록 되어 있습니다

**(conditional paths)**
(조건부 경로)

**that lack test coverage.**
테스트 커버리지가 부족한.

**In practice**
실제 운용에서

**it inconsistently flags**
이 에이전트는 비일관되게 표시합니다

**newly introduced branches**
새롭게 도입된 분기들을

**that are already exercised indirectly**
이미 간접적으로 테스트된

**by an existing integration test,**
기존 통합 테스트에 의해,

**producing noisy false positives**
노이즈가 많은 거짓 양성(잘못된 경고)을 생성하며

**that erode reviewer trust.**
검토자의 신뢰를 떨어뜨리는.

**Detailed instructions about 'coverage'**
'커버리지'에 대한 세부적인 지시사항으로도

**have not resolved the inconsistency.**
이 비일관성을 해결하지 못했습니다.

**What should the team add**
팀은 무엇을 추가해야 합니까

**to the prompt?**
프롬프트에?

**[OPTIONS]**

**A) A couple of examples**
몇 가지 예시를

**pairing a diff with a coverage judgment:**
diff(코드 변경사항)와 커버리지 판단을 짝지은:

**one branch with no test,**
테스트가 전혀 없는 분기 하나와,

**one covered indirectly**
간접적으로 커버되는 분기 하나를

<br>

**B) A requirement to run the full test suite**
전체 테스트 수트를 실행하라는 요구사항과

**and flag any branch**
모든 분기를 표시하라는 요구사항

**under one hundred percent line coverage**
라인 커버리지가 100% 미만인

<br>

**C) A rule treating any file**
모든 파일을 처리하는 규칙

**changed by fewer than ten lines**
10줄 미만으로 변경된

**as automatically having adequate coverage**
자동으로 적절한 커버리지를 가진 것으로

<br>

**D) An instruction to flag**
표시하라는 지시사항

**every new conditional branch in a diff**
diff의 모든 새로운 조건부 분기를

**regardless of the surrounding test suite entirely**
주변 테스트 수트와 전혀 상관없이

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
A번: A couple of examples pairing a diff with a coverage judgment: one branch with no test, one covered indirectly

**정답 및 해설:**

**핵심 개념:**
퓨샷 프롬프팅(Few-Shot Prompting / In-Context Learning)을 활용한 복잡한 판단 기준의 명확화입니다. 텍스트 지시(Zero-shot instruction)만으로 모호하거나 미묘한 에지 케이스(예: 간접 커버리지 판단)를 모델이 제대로 구분하지 못할 때는 구체적인 입력-출력 예시(Few-shot Examples)를 제공하는 것이 가장 효과적입니다.

**문제 상황 분석:**
- PR 검토 에이전트가 테스트 커버리지가 부족한 코드 분기를 판별하는 역할을 수행합니다.
- 기존 통합 테스트에 의해 간접적으로 테스트되는 새 분기에 대해 거짓 양성(False Positive) 경고를 일관성 없이 발생시켜 신뢰도를 저하시키고 있습니다.
- '커버리지'에 대한 구체적인 서술형 지시사항을 프롬프트에 추가했음에도 일관성 문제가 해결되지 않는 상황입니다.

**A번이 정답인 이유:**
Anthropic 프롬프트 엔지니어링 가이드라인에 따르면, 모호한 개념("간접적으로 테스트됨"과 "테스트되지 않음")을 모델에 학습시킬 때 구체적인 지시어(Instruction)만으로는 한계가 있습니다. 실제 코드 변경사항(Diff)과 이에 대한 올바른 커버리지 판단 결과가 쌍을 이루는 예시(Examples)를 프롬프트에 직접 제공하는 퓨샷 기술을 적용하면, Claude가 패턴을 명확히 파악하여 비일관적인 경고 문제를 가장 효과적으로 해결할 수 있습니다.

**오답 분석:**
- Option B (오답): 전체 테스트 수트를 무조건 실행하고 100% 미만 커버리지를 모두 경고하는 것은 검토 노이즈(False Positive)를 오히려 크게 증가시키고 실행 비용/시간을 극대화합니다.
- Option C (오답): 10줄 미만 변경 파일을 무조건 안전하다고 간주하는 임의적 하드코딩 규칙은 실제 커버리지가 누락된 중요한 버그 경로를 놓치게 만듭니다.
- Option D (오답): 주변 테스트 상황을 무시하고 모든 조건부 분기를 무조건 경고하는 것은 간접 커버리지 분기까지 모두 경고 대상으로 만들어 문제의 원인인 거짓 양성을 극대화합니다.

---

### 61번 문제

**1. 문제 원문**

A legal-review pipeline must guarantee that every submitted contract receives a result within 30 hours of arrival, using the Message Batches API's up-to-24-hour processing window. How often must the pipeline start a new batch submission cycle to guarantee this SLA in the worst case?

A) At least once every 6 hours, since a contract can wait up to that interval before inclusion and still finish within 24 hours before the 30-hour deadline

B) At least once every 24 hours, since that matches the batch processing window and therefore satisfies any SLA built on top of it

C) At least once every 30 hours, since the submission cadence should simply mirror the length of the SLA the pipeline promises

D) At least once every 18 hours, since leaving extra headroom beyond the minimum required interval better protects an already generous SLA

---

**2. 구간별 직독직해 번역**

**[QUESTION]**

**A legal-review pipeline**
법률 검토 파이프라인은

**must guarantee**
보장해야 합니다

**that every submitted contract**
제출된 모든 계약서가

**receives a result**
결과를 받는 것을

**within 30 hours of arrival,**
도착 후 30시간 이내에,

**using the Message Batches API's**
Message Batches API의

**up-to-24-hour processing window.**
최대 24시간의 처리 창을 사용하여.

**How often must the pipeline start**
파이프라인은 얼마나 자주 시작해야 합니까

**a new batch submission cycle**
새로운 배치 제출 주기를

**to guarantee this SLA**
이 SLA를 보장하기 위해

**in the worst case?**
최악의 경우에?

**[OPTIONS]**

**A) At least once every 6 hours,**
최소 6시간마다 한 번씩,

**since a contract can wait**
계약서가 대기할 수 있으므로

**up to that interval**
해당 간격만큼 최대

**before inclusion**
배치에 포함되기 전에

**and still finish within 24 hours**
그리고 여전히 24시간 이내에 완료되어

**before the 30-hour deadline**
30시간 마감 시한 이전에 처리될 수 있기 때문에

<br>

**B) At least once every 24 hours,**
최소 24시간마다 한 번씩,

**since that matches**
이것이 일치하므로

**the batch processing window**
배치 처리 창과

**and therefore satisfies**
따라서 충족하기 때문에

**any SLA built on top of it**
그 위에 구축된 모든 SLA를

<br>

**C) At least once every 30 hours,**
최소 30시간마다 한 번씩,

**since the submission cadence**
제출 주기가

**should simply mirror**
단순히 반영해야 하므로

**the length of the SLA**
SLA의 기간을

**the pipeline promises**
파이프라인이 약속하는

<br>

**D) At least once every 18 hours,**
최소 18시간마다 한 번씩,

**since leaving extra headroom**
추가적인 여유 공간을 남겨두는 것이

**beyond the minimum required interval**
최소 필요 간격 이상으로

**better protects**
더 잘 보호하기 때문에

**an already generous SLA**
이미 넉넉한 SLA를

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
A번: At least once every 6 hours, since a contract can wait up to that interval before inclusion and still finish within 24 hours before the 30-hour deadline

**정답 및 해설:**

**핵심 개념:**
Anthropic Message Batches API의 최악 시간 계산 및 SLA(Service Level Agreement) 설계 공식입니다. 전체 대기 시간은 '다음 배치 제출까지의 대기 시간(Accumulation/Ingestion Delay)'과 '배치 처리 시간(Processing Window)'의 합으로 결정됩니다.

**문제 상황 분석:**
- 전체 SLA 목표시간: 도착 후 최대 30시간 이내 결과 제공
- Message Batches API의 최대 처리 시간: 최대 24시간
- 최악의 경우(Worst Case): 어떤 계약서가 이전 배치 제출 직후에 도착하여 다음 배치가 제출될 때까지 최대 주깃값만큼 대기하고, 해당 배치가 최대 처리 시간인 24시간을 풀로 채워 처리되는 상황입니다.

**A번이 정답인 이유:**
최악의 대기 시간을 수식으로 표현하면 다음과 같습니다.
$$\text{최대 소요 시간} = \text{배치 제출 주기}(T) + \text{배치 최대 처리 시간}(24\text{시간}) \le 30\text{시간}$$
$$T + 24 \le 30 \implies T \le 6\text{시간}$$
따라서 다음 배치 제출 주기는 최소 6시간마다 한 번씩 시작되어야 합니다. 계약서가 이전 배치를 놓치고 최대 6시간 동안 대기하더라도, 배치 처리 시간 최대 24시간을 더하면 $6 + 24 = 30$시간으로 보장된 SLA 마감 시한을 완벽히 준수할 수 있습니다.

**오답 분석:**
- Option B (오답): 24시간 주기로 제출할 경우, 최악의 대기 시간은 $24\text{시간}(\text{대기}) + 24\text{시간}(\text{처리}) = 48\text{시간}$이 되어 30시간 SLA를 초과합니다.
- Option C (오답): 30시간 주기로 제출할 경우, 최악의 대기 시간은 $30\text{시간}(\text{대기}) + 24\text{시간}(\text{처리}) = 54\text{시간}$이 되어 SLA를 크게 위반합니다.
- Option D (오답): 18시간 주기로 제출할 경우, 최악의 대기 시간은 $18 + 24 = 42$시간이 되어 30시간 SLA를 초과하게 됩니다.

---

### 62번 문제

**1. 문제 원문**

An HR onboarding pipeline extracts a "start_date" field, but the model returns it in "DD/MM/YYYY" order while the schema requires "YYYY-MM-DD". The form clearly shows the actual date; only the field's formatting is wrong. What is the appropriate response?

A) Treat this as a semantic error needing a calculated-value cross-check rather than a simple formatting retry

B) Retry with feedback naming the required format, since the underlying date is already present and this is purely formatting

C) Abandon structured extraction for this field entirely and store the date only as free text from now on

D) Treat this as unrecoverable and escalate straight to a human reviewer without ever attempting a corrective retry first here

---

**2. 구간별 직독직해 번역**

**[QUESTION]**

**An HR onboarding pipeline**
HR 온보딩 파이프라인이

**extracts a "start_date" field,**
"start_date" 필드를 추출하지만,

**but the model returns it**
모델이 이것을 반환합니다

**in "DD/MM/YYYY" order**
"DD/MM/YYYY" 순서로

**while the schema requires "YYYY-MM-DD".**
스키마는 "YYYY-MM-DD"를 요구하는 반면에.

**The form clearly shows**
양식은 명확하게 보여줍니다

**the actual date;**
실제 날짜를;

**only the field's formatting is wrong.**
단지 필드의 포맷만 잘못되었습니다.

**What is the appropriate response?**
적절한 대응은 무엇입니까?

**[OPTIONS]**

**A) Treat this as a semantic error**
이것을 의미론적 오류로 취급합니다

**needing a calculated-value cross-check**
계산된 값의 교차 검증이 필요한

**rather than a simple formatting retry**
단순한 포맷 재시도보다는

<br>

**B) Retry with feedback**
피드백과 함께 재시도합니다

**naming the required format,**
요구되는 포맷을 명시하는,

**since the underlying date is already present**
기본 날짜는 이미 존재하고

**and this is purely formatting**
이것은 순전히 포맷 문제이기 때문에

<br>

**C) Abandon structured extraction**
구조화된 추출을 포기합니다

**for this field entirely**
이 필드에 대해 완전히

**and store the date only as free text**
그리고 날짜를 자유 텍스트로만 저장합니다

**from now on**
이제부터는

<br>

**D) Treat this as unrecoverable**
이것을 복구 불가능한 것으로 취급합니다

**and escalate straight to a human reviewer**
그리고 인간 검토자에게 즉시 이관합니다

**without ever attempting**
시도조차 하지 않고

**a corrective retry first here**
여기서 교정 재시도를 먼저

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
B번: Retry with feedback naming the required format, since the underlying date is already present and this is purely formatting

**정답 및 해설:**

**핵심 개념:**
LLM 시스템의 스키마 검증 실패 시 오류 복구 패턴(Self-Correction via Feedback)입니다. 추출하려는 원본 데이터의 의미적 내용(Semantic Date)이 올바르고 단순 포맷 미스매치가 발생한 경우, 필요한 포맷을 교정 피드백으로 명시하여 모델에 재요청(Retry)하는 것이 가장 적절한 처리 방식입니다.

**문제 상황 분석:**
- HR 온보딩 입력 양식에 날짜 데이터 자체는 올바르게 들어있습니다.
- 모델이 추출한 값은 `DD/MM/YYYY` 형식이고, 목표 스키마의 요구 포맷은 `YYYY-MM-DD`입니다.
- 정보의 부재나 로직상의 의미적 오류가 아닌, 순수한 단순 표기/포맷 형식의 오류 상황입니다.

**B번이 정답인 이유:**
원본 날짜 데이터가 원본에 존재하고 단순히 포맷 표현 방식만 차이가 나는 오류는 교정 재시도(Corrective Retry)로 손쉽게 해결할 수 있습니다. 스키마 검증기(Validator)에서 발생한 에러 메시지("형식이 YYYY-MM-DD이어야 함")를 Claude에게 피드백으로 전달하여 재요청하면, 모델이 전달받은 포맷 지침을 바탕으로 올바른 정규화 형식(`YYYY-MM-DD`)으로 즉시 바로잡아 응답할 수 있습니다.

**오답 분석:**
- Option A (오답): 날짜 자체의 값이 잘못된 것이 아니라 서식만 틀린 것이므로, 계산 값 교차 검증이 필요한 의미론적 오류(Semantic Error)가 아닙니다.
- Option C (오답): 단지 포맷 오류라는 이유만으로 구조화 데이터 추출(Structured Extraction)을 완전히 포기하고 자유 텍스트로 저장하는 것은 데이터 파이프라인 설계를 저해합니다.
- Option D (오답): 단순 포맷 오류를 복구 불가능한 문제로 판단하여 사람의 개입(Human-in-the-loop)으로 곧바로 이관하는 것은 불필요한 인적 리소스 소모를 야기하며, 자동화 교정 재시도를 먼저 시도해야 합니다.

---

### 63번 문제

**1. 문제 원문**

An operations lead argues that because most Message Batches finish processing in under an hour, the team can safely promise customers a fixed 90-minute turnaround for a nightly summarization job. A colleague pushes back on this plan. What is the strongest technical objection to the promise?

A) The Batches API carries no guaranteed latency SLA, so a batch can legitimately take up to 24 hours under heavy demand, making a fixed 90-minute promise unreliable

B) The Batches API caps total daily throughput per workspace, so a 90-minute promise would only be broken once the workspace exceeds its allotted request volume

C) Summarization requests inherently take longer to process than other request types, so 90 minutes is too short a window regardless of typical batch completion times

D) Fixed turnaround promises are incompatible with the Batches API because every batch must be manually retrieved through the console rather than through automated polling

---

**2. 구간별 직독직해 번역**

**[QUESTION]**

**An operations lead argues that**
한 운영 팀장은 주장합니다

**because most Message Batches**
대부분의 Message Batches가

**finish processing in under an hour,**
1시간 이내에 처리를 완료하기 때문에,

**the team can safely promise customers**
팀이 고객에게 안전하게 약속할 수 있다고

**a fixed 90-minute turnaround**
고정된 90분의 처리 시간을

**for a nightly summarization job.**
야간 요약 작업에 대해.

**A colleague pushes back on this plan.**
한 동료가 이 계획에 반대합니다.

**What is the strongest technical objection**
가장 강력한 기술적 반대 의견은 무엇입니까

**to the promise?**
이 약속에 대한?

**[OPTIONS]**

**A) The Batches API carries**
Batches API는 제공하지 않습니다

**no guaranteed latency SLA,**
보장된 지연 시간 SLA를,

**so a batch can legitimately take**
따라서 배치는 정당하게 소요될 수 있습니다

**up to 24 hours under heavy demand,**
부하가 높은 상황에서 최대 24시간까지,

**making a fixed 90-minute promise unreliable**
고정된 90분 약속을 신뢰할 수 없게 만듭니다

<br>

**B) The Batches API caps**
Batches API는 제한합니다

**total daily throughput per workspace,**
워크스페이스당 일일 총 처리량을,

**so a 90-minute promise would only be broken**
따라서 90분 약속은 깨지게 될 것입니다

**once the workspace exceeds**
워크스페이스가 초과하는 경우에만

**its allotted request volume**
할당된 요청 처리량을

<br>

**C) Summarization requests inherently take longer**
요약 요청은 본질적으로 더 오래 걸립니다

**to process than other request types,**
다른 요청 유형보다 처리하는 데,

**so 90 minutes is too short a window**
따라서 90분은 너무 짧은 시간입니다

**regardless of typical batch completion times**
일반적인 배치 완료 시간과 상관없이

<br>

**D) Fixed turnaround promises are incompatible**
고정 처리 시간 약속은 양립할 수 없습니다

**with the Batches API**
Batches API와

**because every batch must be manually retrieved**
모든 배치가 수동으로 조회되어야 하기 때문에

**through the console**
콘솔을 통해

**rather than through automated polling**
자동화된 폴링을 통한 것이 아니라

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
A번: The Batches API carries no guaranteed latency SLA, so a batch can legitimately take up to 24 hours under heavy demand, making a fixed 90-minute promise unreliable

**정답 및 해설:**

**핵심 개념:**
Anthropic Message Batches API의 처리 시간 처리 모델 및 SLA(Service Level Agreement) 사양입니다. Message Batches API는 비동기식 대량 처리를 통해 비용을 50% 절감하는 대신, 지연 시간(Latency)에 대한 짧은 완료 시간을 보장하지 않고 최대 24시간 내 처리를 목표로 설계되었습니다.

**문제 상황 분석:**
- 운영 팀장은 평소 배치가 1시간 이내로 완료된다는 관측 데이터만을 근거로 고객에게 "90분 이내 처리 완료"라는 고정 SLA를 약속하자고 제안합니다.
- 동료는 이 약속의 위험성을 지적하며 기술적으로 반대하려 합니다.
- 시스템 서비스 수준 계약(SLA) 측면에서 Batches API가 제공하는 공식 명세와의 충돌점을 찾는 것이 핵심입니다.

**A번이 정답인 이유:**
Anthropic 공식 문서에 따르면 Message Batches API는 최단 처리 시간이나 짧은 완료 시간을 보장(Guarantee)하는 SLA를 제공하지 않습니다. 대다수의 작업이 통상 1시간 내외로 일찍 끝난다 하더라도, 트래픽 폭주나 서버 부하 상황에서는 공식 처리 기한인 최대 24시간까지 소요되는 것이 시스템상 정상 동작(Legitimate Behavior)입니다. 따라서 90분과 같은 짧은 고정 완성 시간을 고객에게 약속하는 것은 서비스 장애로 직결될 수 있으므로 기술적으로 가장 강력한 반대 근거가 됩니다.

**오답 분석:**
- Option B (오답): 워크스페이스별 요청량 제한(Rate Limit) 문제보다, 배치 API 자체의 비동기적 지연 시간 무보장 특성이 90분 SLA 약속을 이행하지 못하게 만드는 근본적인 원인입니다.
- Option C (오답): 요약 요청이라고 해서 모델 내부적으로 배치 처리 창(Window) 자체를 수 시간 이상 지연시키지는 않으며, 문제의 핵심은 요청 유형이 아닌 Batches API의 latency 보장 여부입니다.
- Option D (오답): Message Batches API는 콘솔 수동 조회뿐만 아니라 API 요청을 통한 자동화된 폴링(Polling)이나 웹훅/결과 조회가 완전히 지원됩니다.

---

### 64번 문제

**1. 문제 원문**

Over several months, a code-review assistant's structured findings include a `detected_pattern` field, and the team aggregates dismissal rates by pattern value. They discover that findings tagged with `detected_pattern` "decorator-wrapped test fixture" are dismissed over 90% of the time. What is the primary value this feedback loop provides?

A) It pinpoints one over-triggering pattern so the detection rule can be tuned or suppressed for that construct specifically

B) It confirms that developers dismiss findings at random and that the review process should therefore be discontinued entirely

C) It proves the extraction tool's JSON schema itself has a syntax defect that must be patched before the next release

D) It lets the team automatically close every future finding across all categories without any developer review at all

---

**2. 구간별 직독직해 번역**

**[QUESTION]**

**Over several months,**  
수개월 동안,

**a code-review assistant's structured findings**  
코드 검토 어시스턴트의 구조화된 발견 사항은

**include a detected_pattern field,**  
`detected_pattern` 필드를 포함하며,

**and the team aggregates dismissal rates**  
팀은 기각률(기각 비율)을 집계합니다

**by pattern value.**  
패턴 값별로.

**They discover that**  
그들은 발견합니다

**findings tagged with detected_pattern**  
`detected_pattern`으로 태그가 지정된 발견 사항들이

**"decorator-wrapped test fixture"**  
"decorator-wrapped test fixture"라는

**are dismissed over 90% of the time.**  
90% 이상 기각된다는 사실을.

**What is the primary value**  
주요 가치는 무엇입니까

**this feedback loop provides?**  
이 피드백 루프가 제공하는?

**[OPTIONS]**

**A) It pinpoints one over-triggering pattern**  
이것은 과도하게 트리거되는 하나의 패턴을 정확히 집어내어

**so the detection rule can be tuned or suppressed**  
탐지 규칙을 조정하거나 억제할 수 있게 합니다

**for that construct specifically**  
해당 구문에 대해 구체적으로

<br>

**B) It confirms that developers dismiss findings**  
이것은 개발자들이 발견 사항을 기각함을 확인합니다

**at random**  
무작위로

**and that the review process should therefore be discontinued entirely**  
따라서 검토 프로세스를 완전히 중단해야 함을

<br>

**C) It proves the extraction tool's JSON schema itself**  
이것은 추출 도구의 JSON 스키마 자체가

**has a syntax defect**  
구문 오류(syntax defect)를 가지고 있음을 증명합니다

**that must be patched before the next release**  
다음 릴리스 전에 패치되어야 하는

<br>

**D) It lets the team automatically close**  
이것은 팀이 자동으로 닫을 수 있게 합니다

**every future finding across all categories**  
모든 카테고리에 걸친 향후 모든 발견 사항을

**without any developer review at all**  
개발자의 검토 없이 전혀

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
A번: It pinpoints one over-triggering pattern so the detection rule can be tuned or suppressed for that construct specifically

**정답 및 해설:**

**핵심 개념:**  
AI 코드 리뷰 어시스턴트 모니터링 및 피드백 루프(Feedback Loop) 모범 사례입니다. 구조화된 필드 데이터를 기반으로 기각률(Dismissal Rate)을 집계하면 과도한 오탐(False Positive / Over-triggering) 패턴을 파악하여 탐지 규칙을 정밀하게 미세 조정(Tuning)하거나 억제(Suppression)할 수 있습니다.

**문제 상황 분석:**  
- AI 기반 코드 검토 도구가 탐지 패턴별로 결과를 출력하고 있습니다.
- 특정 패턴("decorator-wrapped test fixture")의 기각률이 90% 이상으로 매우 높게 관측되었습니다.
- 이러한 피드백 루프 데이터를 활용하여 시스템을 개선하는 가장 직접적인 기술적 목적을 찾아야 합니다.

**A번이 정답인 이유:**  
90% 이상의 높은 기각률은 해당 규칙이 개발자에게 실질적인 유효성을 제공하지 못하고 오탐(False Positive)을 남발하고 있음을 의미합니다. 구조화된 데이터 모니터링 피드백 루프를 통해 이와 같이 과도하게 트리거되는 특정 패턴을 명확히 식별(Pinpoint)해냄으로써, 프롬프트나 탐지 규칙을 해당 코드 구조에 맞게 수정(Tune)하거나 불필요한 알림을 차단(Suppress)하여 노이즈를 줄이고 검토 신뢰도를 높일 수 있습니다.

**오답 분석:**  
- Option B (오답): 개발자들이 무작위로 기각하는 것이 아니라 특정 패턴에만 기각률이 90% 이상 집중된 상황이므로 검토 프로세스 전체를 중단할 이유가 없습니다.
- Option C (오답): 높은 기각률은 AI 판단 규칙의 도메인 적합성 문제이지, JSON 스키마 자체의 구문 에러(Syntax Defect)와는 무관합니다.
- Option D (오답): 특정 카테고리의 오탐을 발견했다고 해서 모든 카테고리의 향후 결과를 개발자 검토 없이 자동으로 종결(Close)하는 것은 위험한 일반화 오류입니다.

---

### 65번 문제

**1. 문제 원문**

A support-automation platform routes incoming tickets to one of several extraction tools depending on ticket type: bug_report, feature_request, or billing_issue. The routing logic currently inspects keywords in the ticket text with regex before choosing which single tool to force via tool_choice, but the regex misclassifies many tickets, leading to the wrong tool being forced. What is a better architecture using tool_choice?

A) Force each of the three tools in three separate parallel requests per ticket, then keep whichever single response happens to return without an error

B) Keep the regex-based routing exactly as-is, but improve the accuracy of the regex patterns since tool_choice cannot influence which tool Claude ultimately calls

C) Register all three tools and set tool_choice to {"type": "auto"} so Claude can choose to skip calling a tool for tickets that seem too ambiguous to classify

D) Register all three extraction tools in the same request and set tool_choice to {"type": "any"}, letting Claude read the ticket and select the correct tool itself

---

**2. 구간별 직독직해 번역**

**[QUESTION]**

**A support-automation platform**
지원 자동화 플랫폼은

**routes incoming tickets**
유입되는 티켓들을 라우팅합니다

**to one of several extraction tools**
여러 추출 도구 중 하나로

**depending on ticket type:**
티켓 유형에 따라:

**bug_report, feature_request, or billing_issue.**
`bug_report`, `feature_request`, 또는 `billing_issue`.

**The routing logic currently inspects**
현재 라우팅 로직은 검사합니다

**keywords in the ticket text**
티켓 텍스트의 키워드를

**with regex**
정규표현식을 사용하여

**before choosing which single tool**
단일 도구를 선택하기 전에

**to force via tool_choice,**
`tool_choice`를 통해 강제할,

**but the regex misclassifies**
하지만 정규표현식이 잘못 분류합니다

**many tickets,**
많은 티켓을,

**leading to the wrong tool**
잘못된 도구가

**being forced.**
강제되는 결과로 이어집니다.

**What is a better architecture**
더 나은 아키텍처는 무엇입니까

**using tool_choice?**
`tool_choice`를 사용하는?

**[OPTIONS]**

**A) Force each of the three tools**
세 개의 도각각을 강제합니다

**in three separate parallel requests**
티켓당 세 개의 별도 병렬 요청으로,

**per ticket,**
티켓마다,

**then keep whichever single response**
그런 다음 어느 단일 응답이든 유지합니다

**happens to return without an error**
오류 없이 반환되는

<br>

**B) Keep the regex-based routing**
정규표현식 기반 라우팅을 유지합니다

**exactly as-is,**
정확히 그대로,

**but improve the accuracy**
하지만 정확도를 향상시킵니다

**of the regex patterns**
정규표현식 패턴의

**since tool_choice cannot influence**
`tool_choice`가 영향을 미칠 수 없기 때문에

**which tool Claude ultimately calls**
Claude가 최종적으로 어떤 도구를 호출할지에

<br>

**C) Register all three tools**
세 도구를 모두 등록하고

**and set tool_choice to {"type": "auto"}**
`tool_choice`를 `{"type": "auto"}`로 설정합니다

**so Claude can choose to skip**
Claude가 건너뛰는 것을 선택할 수 있도록

**calling a tool**
도구 호출을

**for tickets that seem too ambiguous**
너무 모호해 보이는 티켓에 대해

**to classify**
분류하기에

<br>

**D) Register all three extraction tools**
세 개의 추출 도구를 모두 등록합니다

**in the same request**
동일한 요청 내에

**and set tool_choice to {"type": "any"}**,
그리고 `tool_choice`를 `{"type": "any"}`로 설정합니다,

**letting Claude read the ticket**
Claude가 티켓을 읽고

**and select the correct tool itself**
올바른 도구를 스스로 선택하도록 하면서

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: Register all three extraction tools in the same request and set tool_choice to {"type": "any"}, letting Claude read the ticket and select the correct tool itself

**정답 및 해설:**

**핵심 개념:**
Claude API의 `tool_choice` 파라미터 제어 및 라우팅 패턴 설계입니다. 외부 정규표현식(Regex) 기반 분류기의 오류를 방지하고, 모델이 문맥(Semantic Context)을 직접 이해하여 여러 도구 옵션 중 반드시 하나를 선택하도록 강제하는 방법입니다.

**문제 상황 분석:**
- 시스템이 티켓을 `bug_report`, `feature_request`, `billing_issue` 중 하나의 extraction tool로 라우팅해야 합니다.
- 기존의 사전 정규표현식(Regex) 방식은 키워드 매칭 오류로 인해 잘못된 도구를 강제 전달하는 오작동이 빈번합니다.
- 단순 텍스트로 탈출하지 않으면서도(추출 필수), Claude가 티켓의 문맥을 분석하여 올바른 도구를 스스로 선택하도록 만드는 아키텍처 개선이 필요합니다.

**D번이 정답인 이유:**
단일 요청 내에 세 가지 도구를 모두 제공(`tools`)하고, `tool_choice`를 `{"type": "any"}`로 설정하면 Claude는 일반 텍스트 응답을 출력하는 대신 **제공된 도구 목록 중 하나를 무조건 호출**해야 합니다. 이를 통해 Claude의 자연어 이해 능력을 활용하여 정규표현식의 분류 오류를 완벽히 대체함과 동시에 반드시 추출 도구가 실행되도록 강제할 수 있습니다.

**오답 분석:**
- Option A (오답): 모든 티켓에 대해 3개의 병렬 API 요청을 보내는 것은 불필요한 토큰 비용과 컴퓨팅 리소스를 3배로 낭비하게 만듭니다.
- Option B (오답): 정규표현식 패턴 개선은 취약한 키워드 매칭 한계를 근본적으로 해결하지 못하며, `tool_choice`가 호출 도구에 영향을 줄 수 없다는 설명도 기술적으로 거짓입니다.
- Option C (오답): `{"type": "auto"}`는 Claude가 도구를 호출하지 않고 일반 텍스트 응답으로 돌아갈(fallback) 가능성을 열어두기 때문에, 항상 추출 도구가 실행되어야 하는 자동화 파이프라인에는 적합하지 않습니다.

---

### 66번 문제

**1. 문제 원문**

A team building a resume-parsing tool wants to guarantee that structured candidate data is extracted via a `parse_resume` tool on the current turn. They also want to know whether Claude can include natural-language reasoning about ambiguous resume sections before that tool call. Which `tool_choice` configuration should be used to guarantee the `parse_resume` call, and what does Anthropic documentation state about natural-language commentary before a forced tool call?

A) `tool_choice: {"type": "auto"}`, combined with an explicit user-message instruction to use the `parse_resume` tool and share any relevant reasoning as text

B) `tool_choice: {"type": "tool", "name": "parse_resume"}`, because this is the documented way to force the specific tool; the trade-off is that forced tool use suppresses natural-language text before the tool call

C) `tool_choice: {"type": "any"}`, because `any` allows Claude to freely mix natural-language commentary with the forced tool call in the same response

D) `tool_choice: {"type": "none"}`, so Claude can freely decide in text whether to also produce a `parse_resume` tool call afterward

---

**2. 구간별 직독직해 번역**

**[QUESTION]**

**A team building**  
한 팀이 구축하고 있습니다

**a resume-parsing tool**  
이력서 파싱 도구를

**wants to guarantee that**  
보장하기를 원합니다

**structured candidate data is extracted**  
구조화된 지원자 데이터가 추출되는 것을

**via a parse_resume tool**  
`parse_resume` 도구를 통해

**on the current turn.**  
현재 턴에서.

**They also want to know**  
그들은 또한 알고 싶어 합니다

**whether Claude can include**  
Claude가 포함할 수 있는지 여부를

**natural-language reasoning**  
자연어 추론을

**about ambiguous resume sections**  
모호한 이력서 섹션에 관한

**before that tool call.**  
해당 도구 호출 이전에.

**Which tool_choice configuration**  
어떤 `tool_choice` 설정이

**should be used**  
사용되어야 합니까

**to guarantee the parse_resume call,**  
`parse_resume` 호출을 보장하기 위해,

**and what does Anthropic documentation state**  
그리고 Anthropic 공식 문서에는 무엇이라 명시되어 있습니까

**about natural-language commentary**  
자연어 해설(설명)에 대해

**before a forced tool call?**  
강제된 도구 호출 이전에?

**[OPTIONS]**

**A) tool_choice: {"type": "auto"},**  
`tool_choice: {"type": "auto"}` 설정,

**combined with an explicit user-message instruction**  
명시적인 사용자 메시지 지시사항과 결합된

**to use the parse_resume tool**  
`parse_resume` 도구를 사용하라는

**and share any relevant reasoning as text**  
그리고 관련 추론을 텍스트로 공유하라는

<br>

**B) tool_choice: {"type": "tool", "name": "parse_resume"},**  
`tool_choice: {"type": "tool", "name": "parse_resume"}` 설정,

**because this is the documented way**  
이것이 문서화된 방법이기 때문에

**to force the specific tool;**  
특정 도구를 강제하는;

**the trade-off is that**  
트레이드오프(절충점)는 ~라는 것입니다

**forced tool use suppresses**  
강제된 도구 사용이 억제한다는 것입니다

**natural-language text**  
자연어 텍스트를

**before the tool call**  
도구 호출 이전에

<br>

**C) tool_choice: {"type": "any"},**  
`tool_choice: {"type": "any"}` 설정,

**because any allows Claude**  
`any`는 Claude에게 허용하기 때문에

**to freely mix natural-language commentary**  
자연어 해설을 자유롭게 섞는 것을

**with the forced tool call**  
강제된 도구 호출과 함께

**in the same response**  
동일한 응답 내에서

<br>

**D) tool_choice: {"type": "none"},**  
`tool_choice: {"type": "none"}` 설정,

**so Claude can freely decide in text**  
Claude가 텍스트 내에서 자유롭게 결정할 수 있도록

**whether to also produce**  
또한 생성할지 여부를

**a parse_resume tool call afterward**  
나중에 `parse_resume` 도구 호출을

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
B번: `tool_choice: {"type": "tool", "name": "parse_resume"}`, because this is the documented way to force the specific tool; the trade-off is that forced tool use suppresses natural-language text before the tool call

**정답 및 해설:**

**핵심 개념:**  
Anthropic Claude API의 `tool_choice` 파라미터 동작 방식 및 강제 도구 사용(Forced Tool Use) 시 트레이드오프입니다. 특정 도구를 명시적으로 지정하여 실행을 보장할 수 있지만, 도구가 강제될 경우 도구 호출 전 작성되는 일반 자연어 텍스트 생성이 억제(Suppression)되는 특성이 있습니다.

**문제 상황 분석:**  
- 이력서 파싱 서비스에서 현재 턴에 `parse_resume`이라는 특정 도구가 반드시 호출되도록 보장해야 합니다.
- 동시에 도구 호출 전 모호한 이력서 영역에 대한 자연어 추론/해설을 포함할 수 있는지 여부를 공식 문서 기준으로 확인하려 합니다.
- 특정 도구 강제 제어 파라미터 구성법과 해당 기능 사용 시 발생하는 동작 제약 조건을 파악해야 합니다.

**B번이 정답인 이유:**  
Anthropic 공식 문서에 따르면 특정 단일 도구의 호출을 보장하려면 `tool_choice: {"type": "tool", "name": "parse_resume"}` 형태로 지정해야 합니다. 또한 공식 문서에는 특정한 도구가 강제로 설정될 경우, 모델은 도구 호출 전 서술형 자연어 텍스트(Natural-language text/commentary)를 함께 출력하는 대신 곧바로 도구 호출(Tool call)에 필요한 JSON 객체만 생성하도록 유도 및 억제된다고 명시되어 있습니다. 따라서 B번이 기술적 사양과 공식 문서 지침을 정확히 설명합니다.

**오답 분석:**  
- Option A (오답): `{"type": "auto"}`는 모델이 도구를 호출할지 일반 텍스트로 응답할지 스스로 판단하게 만들므로, 사용자 프롬프트에 지시를 추가하더라도 API 수준에서 특정 도구 호출을 100% 보장하지 못합니다.
- Option C (오답): `{"type": "any"}`는 전체 도구 중 하나를 호출하도록 강제하지만 어떤 도구가 실행될지 지정하지 못하며, 강제 도구 사용 시 자연어 해설 생성을 자유롭게 혼용할 수 있다는 설명 역시 오답입니다.
- Option D (오답): `{"type": "none"}`은 도구 호출을 완전히 비활성화(Disable)하는 설정이므로 `parse_resume` 도구가 실행되지 않습니다.

---

### 67번 문제

**1. 문제 원문**

A real estate platform extracts property listings from scraped web pages using a single `describe_property` tool. The `square_footage` field is defined as a required number, but many older listings state size only in vague prose like "spacious with room to grow" and never give a numeric figure. Extraction logs show the model consistently inventing plausible square footage values for these listings. Which two schema changes together best resolve this while preserving data quality for downstream reports?

A) Keep `square_footage` required, but change its type to string so the model can output a placeholder like "unspecified" or "N/A" instead of fabricating a number, ensuring the field is always present.

B) You can make `square_footage` optional for missing values and add a `square_footage_source` enum that stores 'stated', 'estimated', or 'unknown' so reports can separate confirmed from absent values.

C) Keep `square_footage` required, and add a system prompt instruction (e.g., "Do not guess; output 'N/A' for missing data") and a configuration flag to require manual review of any numeric output.

D) Remove `square_footage` from the schema entirely, and rely on a separate keyword-search script to scan raw listing text for numeric patterns and inject the first match into a staging column for reports.

---

**2. 구간별 직독직해 번역**

**[QUESTION]**

**A real estate platform**
한 부동산 플랫폼은

**extracts property listings**
매물 목록을 추출합니다

**from scraped web pages**
스크래핑한 웹 페이지로부터

**using a single describe_property tool.**
단일 `describe_property` 도구를 사용하여.

**The square_footage field**
`square_footage` 필드는

**is defined as a required number,**
필수 숫자형(required number)으로 정의되어 있습니다,

**but many older listings**
하지만 많은 오래된 매물들은

**state size only in vague prose**
모호한 서술문으로만 크기를 기술하며

**like "spacious with room to grow"**
"성장 여유가 있는 넓은 공간"과 같은

**and never give a numeric figure.**
숫자 수치를 전혀 제공하지 않습니다.

**Extraction logs show**
추출 로그는 보여줍니다

**the model consistently inventing**
모델이 지속적으로 지어내고 있음을

**plausible square footage values**
그럴듯한 면적(square footage) 수치들을

**for these listings.**
이러한 매물들에 대해.

**Which two schema changes together**
어떤 두 가지 스키마 변경 사항의 조합이

**best resolve this**
이 문제를 가장 잘 해결합니까

**while preserving data quality**
데이터 품질을 유지하면서

**for downstream reports?**
후속 리포트를 위한?

**[OPTIONS]**

**A) Keep square_footage required,**
`square_footage`를 필수(required) 항목으로 유지하되,

**but change its type to string**
타입을 문자열(string)로 변경하여

**so the model can output a placeholder**
모델이 자리표시자(placeholder)를 출력할 수 있도록 합니다

**like "unspecified" or "N/A"**
"unspecified" 또는 "N/A"와 같은

**instead of fabricating a number,**
숫자를 지어내는 대신에,

**ensuring the field is always present.**
필드가 항상 존재하도록 보장하면서.

<br>

**B) You can make square_footage optional**
`square_footage`를 선택적(optional) 항목으로 만들 수 있습니다

**for missing values**
누락된 값에 대해

**and add a square_footage_source enum**
그리고 `square_footage_source` 열거형(enum)을 추가하여

**that stores 'stated', 'estimated', or 'unknown'**
'stated', 'estimated', 또는 'unknown'을 저장하도록 합니다

**so reports can separate**
리포트가 구분할 수 있도록

**confirmed from absent values.**
확인된 값과 누락된 값을.

<br>

**C) Keep square_footage required,**
`square_footage`를 필수 항목으로 유지하고,

**and add a system prompt instruction**
시스템 프롬프트 지시사항을 추가합니다

**(e.g., "Do not guess; output 'N/A' for missing data")**
(예: "추측하지 마시오; 누락된 데이터는 'N/A'로 출력하시오")

**and a configuration flag**
그리고 설정 플래그를 추가합니다

**to require manual review**
수동 검토를 요구하는

**of any numeric output.**
모든 숫자 출력에 대해.

<br>

**D) Remove square_footage from the schema entirely,**
`square_footage`를 스키마에서 완전히 제거하고,

**and rely on a separate keyword-search script**
별도의 키워드 검색 스크립트에 의존합니다

**to scan raw listing text**
원본 매물 텍스트를 스캔하여

**for numeric patterns**
숫자 패턴을 찾고

**and inject the first match**
첫 번째 일치 항목을 주입하는

**into a staging column for reports.**
리포트용 스테이징 컬럼에.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
B번: You can make `square_footage` optional for missing values and add a `square_footage_source` enum that stores 'stated', 'estimated', or 'unknown' so reports can separate confirmed from absent values.

**정답 및 해설:**

**핵심 개념:**
LLM 정보 추출 시스템의 환각(Hallucination) 방지 및 스키마 설계 모범 사례(Schema Design Best Practice)입니다. 원본 데이터에 특정 값이 누락되어 있을 때, 해당 필드를 필수(required) 수치 타입으로 지정하면 모델은 스키마 검증 실패를 피하기 위해 임의의 값을 지어내는 환각 현상을 일으킵니다. 이를 방지하려면 필드를 선택 항목(optional)으로 전환하고 메타데이터(출처/신뢰도 enum)를 함께 정의하는 스키마 개편이 필요합니다.

**문제 상황 분석:**
- 원본 웹페이지에 면적 수치가 없고 모호한 텍스트만 존재합니다.
- 추출 스키마에서 `square_footage`가 필수(required) 숫자(number) 타입으로 정의되어 있어, Claude가 스키마 형식을 맞추려고 그럴듯한 숫자를 지어내고(환각) 있습니다.
- 후속 다운스트림 리포트의 데이터 품질(숫자 타입 유지 및 실제 수치 유무 구분)을 보장하는 최적의 스키마 변경 방법 2가지를 조합해야 합니다.

**B번이 정답인 이유:**
1. **`square_footage`를 optional로 변경**: 누락된 데이터에 대해 모델이 억지로 숫자를 지어내지 않고 필드를 생략하거나 `null`로 반환할 수 있게 하여 환각을 근본적으로 차단합니다.
2. **`square_footage_source` enum 필드 추가**: `'stated'`(명시됨), `'estimated'`(추정됨), `'unknown'`(알 수 없음) 등의 출처 메타데이터 필드를 추가함으로써 다운스트림 리포팅 시스템이 실제 확인된 값과 누락/추정 데이터를 명확히 분리하여 집계할 수 있게 해줍니다.

**오답 분석:**
- Option A (오답): 숫자형 데이터를 다루는 필드를 문자열(`string`)로 변경하고 `"N/A"`나 `"unspecified"` 같은 자리표시자 텍스트를 채우게 만들면, 후속 리포트 시스템에서 해당 필드를 숫자형으로 계산/수학적 연산(평균 계산 등)을 할 때 유형 오류가 발생하여 데이터 품질이 저하됩니다.
- Option C (오답): 숫자 타입으로 정의된 필수 필드에 `"N/A"`라는 문자열을 출력하라는 지시를 내리면 JSON 스키마 타입 검증 오류(Type Validation Error)가 발생합니다. 또한 모든 숫자 출력에 대해 수동 검토를 거치게 하는 것은 자동화 파이프라인의 효율성을 저해합니다.
- Option D (오답): 스키마에서 필드를 완전히 제거하고 단순 정규표현식/키워드 스크립트에 의존하는 것은 모호한 서술문 문맥을 처리하지 못하며 LLM을 통한 정보 추출의 이점을 포기(abandonment)하는 잘못된 아키텍처입니다.

---

### 68번 문제

**1. 문제 원문**

A code-review assistant reports findings in three categories: security, correctness, and style. The style category has a 60% false positive rate while security and correctness are both above 90% precision. Developers say they now distrust every finding the tool produces, including the security ones. Which explanation best accounts for this reaction?

A) Developers are miscounting the false positive rate because they are including security findings that were later fixed, leading them to distrust the tool's accuracy, even for security findings.

B) Security and correctness findings are inherently harder to verify than style findings, so developers assume the reported precision figures cannot be trusted, since they are often harder to verify.

C) The tool's overall accuracy score is mathematically dominated by the style category, so the reported precision numbers for security are actually inflated, eroding trust in the tool's accuracy.

D) A single category with a high false positive rate can undermine confidence in the tool's accurate categories, because developers experience all findings as coming from one undifferentiated source.

---

**2. 구간별 직독직해 번역**

**[QUESTION]**

**A code-review assistant**
코드 검토 어시스턴트가

**reports findings**
발견 사항을 보고합니다

**in three categories:**
세 가지 카테고리로:

**security, correctness, and style.**
보안(security), 정확성(correctness), 그리고 스타일(style).

**The style category**
스타일 카테고리는

**has a 60% false positive rate**
60%의 거짓 양성(오탐) 비율을 보이는 반면

**while security and correctness**
보안과 정확성은

**are both above 90% precision.**
둘 다 90% 이상의 정밀도를 기록하고 있습니다.

**Developers say**
개발자들은 말합니다

**they now distrust**
이제 불신한다고

**every finding the tool produces,**
도구가 생성하는 모든 발견 사항을,

**including the security ones.**
보안에 관한 항목을 포함하여.

**Which explanation**
어떤 설명이

**best accounts for this reaction?**
이러한 반응을 가장 잘 설명합니까?

**[OPTIONS]**

**A) Developers are miscounting**
개발자들이 잘못 계산하고 있습니다

**the false positive rate**
거짓 양성 비율을

**because they are including security findings**
나중에 수정된 보안 발견 사항을 포함하고 있기 때문에,

**that were later fixed,**
나중에 수정된,

**leading them to distrust**
이로 인해 도구의 정확성을 불신하게 만듭니다,

**the tool's accuracy,**
도구의 정확성을,

**even for security findings.**
보안 발견 사항에 대해서조차.

<br>

**B) Security and correctness findings**
보안 및 정확성 발견 사항은

**are inherently harder to verify**
본질적으로 검증하기 더 어렵습니다

**than style findings,**
스타일 발견 사항보다,

**so developers assume**
따라서 개발자들은 가정을 합니다

**the reported precision figures**
보고된 정밀도 수치를

**cannot be trusted,**
신뢰할 수 없다고,

**since they are often harder to verify.**
검증하기가 자주 더 어렵기 때문에.

<br>

**C) The tool's overall accuracy score**
도구의 전체 정확도 점수는

**is mathematically dominated**
수학적으로 지배됩니다

**by the style category,**
스타일 카테고리에 의해,

**so the reported precision numbers for security**
따라서 보안에 대해 보고된 정밀도 수치가

**are actually inflated,**
실제로는 부풀려진 것이며,

**eroding trust in the tool's accuracy.**
도구의 정확성에 대한 신뢰를 떨어뜨립니다.

<br>

**D) A single category**
단 하나의 카테고리가

**with a high false positive rate**
높은 거짓 양성 비율을 가진

**can undermine confidence**
신뢰도를 떨어뜨릴 수 있습니다

**in the tool's accurate categories,**
도구의 정확한 카테고리에 대한,

**because developers experience all findings**
개발자들이 모든 발견 사항을 경험하기 때문에

**as coming from one undifferentiated source.**
구분되지 않는 하나의 출처로부터 오는 것으로.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: A single category with a high false positive rate can undermine confidence in the tool's accurate categories, because developers experience all findings as coming from one undifferentiated source.

**정답 및 해설:**

**핵심 개념:**
AI 에이전트 및 자동화 도구 도입 시 발생하는 사용자 경험(UX) 및 피로도(Alert Fatigue / Trust Erosion) 심리학에 관한 개념입니다. 사용자는 시스템이 출력하는 결과를 카테고리별로 분리해서 인식하기보다, 하나의 '통합된 출처(Single Undifferentiated Source)'에서 나온 출력물로 인식합니다.

**문제 상황 분석:**
- 보안(Security) 및 정확성(Correctness) 카테고리는 90% 이상의 매우 높은 정밀도(Precision)를 보입니다.
- 반면, 스타일(Style) 카테고리는 60%라는 높은 오탐률(False Positive Rate)을 나타냅니다.
- 개발자들은 정밀도가 높은 보안 알림까지 포함하여 도구 전체의 결과를 불신하고 배척하는 현상이 발생했습니다.

**D번이 정답인 이유:**
개발자(사용자) 관점에서는 AI 도구가 제공하는 모든 결과물이 "동일한 하나의 AI 리뷰어"에서 생성된 것으로 체감됩니다. 높은 오탐률을 가진 단 하나의 카테고리(스타일)가 전체적인 도구의 신뢰도를 잠식하여, 실제로는 정밀도가 높은 다른 카테고리(보안, 정확성)의 경고까지 무시하게 만드는 전형적인 신뢰 훼손(Trust Erosion) 현상을 정확히 설명합니다.

**오답 분석:**
- Option A (오답): 개발자가 수정된 이슈를 포함해 오탐률을 잘못 계산했다는 것은 사용자 심리적 불신의 근본적인 아키텍처/경험적 원인을 설명하지 못합니다.
- Option B (오답): 보안 및 정확성 이슈의 검증 난이도가 높아서 보고된 정밀도 수치 자체를 불신한다는 주장은 문제에서 제시된 "스타일 카테고리의 60% 오탐률이 유발한 전체적 불신"이라는 맥락과 부합하지 않습니다.
- Option C (오답): 전체 정확도 점수가 수학적으로 부풀려졌다는 주장은 가설일 뿐이며, 개별 카테고리의 실제 정밀도 수치(보안 > 90%)가 거짓임을 증명하는 설명이 아닙니다.

---

### 69번 문제

**1. 문제 원문**

An architect is comparing two candidate prompts for a security-findings category before choosing one for production. Prompt X says: "Flag anything that looks like it could be a security risk." Prompt Y says: "Flag code that writes user-supplied input directly into a SQL query string without parameterization, or that stores a plaintext password." Which statement correctly evaluates the two prompts with respect to reducing false positives?

A) Prompt Y is worse because its specific examples of SQL injection and plaintext passwords will cause the model to focus on those patterns and miss other risks, leading to more false negatives.

B) Prompt X is preferable because its broad phrasing allows the model to capture a wider range of security threats, including subtle logic flaws and misconfigurations that Prompt Y's specific list might miss.

C) The two prompts are functionally equivalent, as both ultimately rely on the model's general security knowledge to determine what constitutes a risk, making the specific wording irrelevant to false-positive rates.

D) Prompt Y is preferable because it names specific, checkable conditions that define a security issue, while Prompt X relies on an open-ended judgment about what 'looks like' a risk.

---

**2. 구간별 직독직해 번역**

**[QUESTION]**

**An architect is comparing**
한 아키텍트가 비교하고 있습니다

**two candidate prompts**
두 개의 후보 프롬프트를

**for a security-findings category**
보안 발견 사항 카테고리를 위한

**before choosing one for production.**
운영 환경용으로 하나를 선택하기 전에.

**Prompt X says:**
프롬프트 X는 말합니다:

**"Flag anything that looks like**
"~처럼 보이는 모든 항목을 표시하라

**it could be a security risk."**
보안 위험이 될 수 있는."

**Prompt Y says:**
프롬프트 Y는 말합니다:

**"Flag code that writes**
"코드를 표시하라

**user-supplied input directly**
사용자가 제공한 입력을 직접 작성하는

**into a SQL query string**
SQL 쿼리 문자열에

**without parameterization,**
매개변수화(parameterization) 없이,

**or that stores a plaintext password."**
또는 평문 비밀번호를 저장하는."

**Which statement correctly evaluates**
어떤 문장이 바르게 평가합니까

**the two prompts**
두 프롬프트를

**with respect to reducing false positives?**
거짓 양성(오탐) 줄이기에 관하여?

**[OPTIONS]**

**A) Prompt Y is worse**
프롬프트 Y가 더 나쁩니다

**because its specific examples**
구체적인 예시들이

**of SQL injection and plaintext passwords**
SQL 인젝션과 평문 비밀번호에 대한

**will cause the model to focus**
모델이 집중하도록 만들기 때문에

**on those patterns**
해당 패턴들에만

**and miss other risks,**
그리고 다른 위험들을 놓치게 하여,

**leading to more false negatives.**
더 많은 미탐(false negatives)으로 이어집니다.

<br>

**B) Prompt X is preferable**
프롬프트 X가 더 바람직합니다

**because its broad phrasing**
광범위한 문구가

**allows the model to capture**
모델로 하여금 포착하게 해주기 때문에

**a wider range of security threats,**
더 넓은 범위의 보안 위협을,

**including subtle logic flaws and misconfigurations**
미묘한 로직 오류 및 설정 오류를 포함하여

**that Prompt Y's specific list might miss.**
프롬프트 Y의 구체적인 목록이 놓칠 수 있는.

<br>

**C) The two prompts are functionally equivalent,**
두 프롬프트는 기능적으로 동일합니다,

**as both ultimately rely**
둘 다 궁극적으로 의존하기 때문에

**on the model's general security knowledge**
모델의 일반적인 보안 지식에

**to determine what constitutes a risk,**
무엇이 위험을 구성하는지 결정하기 위해,

**making the specific wording irrelevant**
특정한 구문(wording)을 무관하게 만들면서

**to false-positive rates.**
거짓 양성 비율과.

<br>

**D) Prompt Y is preferable**
프롬프트 Y가 더 바람직합니다

**because it names specific, checkable conditions**
구체적이고 검증 가능한 조건들을 명시하기 때문에

**that define a security issue,**
보안 문제를 정의하는,

**while Prompt X relies**
반면에 프롬프트 X는 의존합니다

**on an open-ended judgment**
개방형(주관적) 판단에

**about what 'looks like' a risk.**
무엇이 위험 '처럼 보이는지'에 관한.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: Prompt Y is preferable because it names specific, checkable conditions that define a security issue, while Prompt X relies on an open-ended judgment about what 'looks like' a risk.

**정답 및 해설:**

**핵심 개념:**
Anthropic 프롬프트 엔지니어링 가이드라인에서의 '명확성 및 구체성(Clarity and Specificity)' 원칙입니다. 개방적이고 모호한 판단 지시("위험해 보이는 것")는 모델의 주관적 추론 폭을 넓혀 무수한 거짓 양성(False Positives, 오탐)을 유발합니다. 반면, 명확하고 검증 가능한 명시적 기준(SQL 인젝션, 평문 비밀번호 저장 등)을 정의하는 프롬프트는 판단 기준을 고정시켜 오탐을 크게 줄입니다.

**문제 상황 분석:**
- 프롬프트 X: "보안 위험처럼 보이는 것은 무엇이든 표시하라" (모호하고 개방적인 지시)
- 프롬프트 Y: "매개변수화 없이 사용자 입력을 SQL 쿼리에 직접 쓰거나 평문 패스워드를 저장하는 코드를 표시하라" (구체적이고 검증 가능한 지시)
- 평가 기준: 오탐률(False Positive Rate)을 낮추는 관점에서 어떤 평가가 옳은지 파악해야 합니다.

**D번이 정답인 이유:**
오탐(False Positive)을 줄이는 가장 결정적인 요소는 지시문의 구체성입니다. 프롬프트 X처럼 모호한 어조로 지시할 경우, 모델은 조금이라도 의심스럽거나 평범한 코드 구문까지 전부 위험으로 판단하여 과도한 오탐 알림을 발생시킵니다. 반면 프롬프트 Y는 명확하게 검증 가능한 조건(Checkable Conditions)을 명시하므로, 조건에 부합하지 않는 일반 코드를 잘못 감지하는 오탐 현상을 효과적으로 억제할 수 있어 더 바람직합니다.

**오답 분석:**
- Option A (오답): 질문의 핵심 평가 기준은 '오탐 줄이기(Reducing False Positives)'입니다. 프롬프트 Y가 미탐(False Negative)을 늘릴 수 있다는 주장은 질문이 요구하는 '오탐 감소 효과'에 대한 적절한 프롬프트 평가가 아닙니다.
- Option B (오답): 포괄적인 문구(Prompt X)는 위험 탐지 범위를 넓힐 수 있지만, 그 반대급부로 엄청난 양의 오탐(False Positive)을 양산하므로 "오탐 줄이기" 목적에 정반대되는 접근 방식입니다.
- Option C (오답): 프롬프트의 구체성은 모델의 판단 범위와 오탐률에 매우 결정적인 영향을 미치므로, 두 프롬프트가 기능적으로 동일하다는 설명은 틀렸습니다.

---

### 70번 문제

**1. 문제 원문**

A team's code-review assistant prompt already spells out an exhaustive, itemized rubric for flagging issues, but reviewers still receive inconsistently formatted findings across runs: some list severity before location, others omit the suggested fix entirely. The team wants the most effective fix for this output-consistency problem. What should they do?

A) Rewrite the rubric as an even longer numbered list that spells out every field, its position, and its formatting rule in detail

B) Split the prompt into two calls: one that generates findings and a second that reformats them into the target schema

C) Add three to five worked examples in example tags that each show the exact field order and formatting wanted

D) Lower the temperature parameter to zero so the same tokens are sampled deterministically across every single run

---

**2. 구간별 직독직해 번역**

**[QUESTION]**

**A team's code-review assistant prompt**
한 팀의 코드 검토 어시스턴트 프롬프트는

**already spells out**
이미 구체적으로 설명하고 있습니다

**an exhaustive, itemized rubric**
철저하고 항목화된 지침을

**for flagging issues,**
이슈를 표시하기 위한,

**but reviewers still receive**
하지만 검토자들은 여전히 받습니다

**inconsistently formatted findings**
비일관되게 형식화된 발견 사항을

**across runs:**
실행할 때마다:

**some list severity**
일부는 심각도를 목록에 먼저 나열합니다

**before location,**
위치보다 앞에,

**others omit**
다른 것들은 생략합니다

**the suggested fix entirely.**
제안된 수정 사항을 완전히.

**The team wants**
팀은 원합니다

**the most effective fix**
가장 효과적인 해결책을

**for this output-consistency problem.**
이 출력 일관성 문제에 대해.

**What should they do?**
그들은 무엇을 해야 합니까?

**[OPTIONS]**

**A) Rewrite the rubric**
지침을 다시 작성합니다

**as an even longer numbered list**
훨씬 더 긴 번호 매기기 목록으로

**that spells out every field,**
모든 필드를 구체적으로 설명하는,

**its position,**
그 위치와,

**and its formatting rule in detail**
그리고 구체적인 형식화 규칙을 자세히

<br>

**B) Split the prompt into two calls:**
프롬프트를 두 번의 호출로 분할합니다:

**one that generates findings**
발견 사항을 생성하는 하나의 호출과

**and a second that reformats them**
이를 다시 형식화하는 두 번째 호출로

**into the target schema**
목표 스키마에 맞게

<br>

**C) Add three to five worked examples**
3개에서 5개의 완성된 예시를 추가합니다

**in example tags**
`example` 태그 내에

**that each show the exact field order**
각각 정확한 필드 순서와

**and formatting wanted**
원하는 형식을 보여주는

<br>

**D) Lower the temperature parameter to zero**
temperature 파라미터를 0으로 낮춥니다

**so the same tokens are sampled**
동일한 토큰이 샘플링되도록

**deterministically**
확정적으로(결정론적으로)

**across every single run**
매 실행마다

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
C번: Add three to five worked examples in example tags that each show the exact field order and formatting wanted

**정답 및 해설:**

**핵심 개념:**
Anthropic 프롬프트 엔지니어링 가이드라인에서의 퓨샷 프롬프팅(Few-Shot Prompting) 및 XML 태그 활용 모범 사례입니다. 서술형 자연어 지침(Instruction/Rubric)을 아무리 상세히 늘려 적더라도 모델의 출력 구조 일관성(Output Consistency)을 완벽히 강제하기는 어렵습니다. 정확한 입출력 형식 예시(Worked Examples)를 명시적인 태그로 감싸 제공하는 것이 출력 포맷 완벽 준수를 위한 가장 강력하고 효과적인 방법입니다.

**문제 상황 분석:**
- 이미 상세하고 항목화된 지침(exhaustive, itemized rubric)을 작성하여 제공하고 있습니다.
- 그럼에도 실행할 때마다 필드 순서가 바뀌거나 특정 필드가 누락되는 출력 형식의 비일관성 문제(Output Inconsistency)가 발생하고 있습니다.
- 서술형 지시문 추가 이상의 효과적이고 구조화된 포맷 고정 해결책이 필요합니다.

**C번이 정답인 이유:**
Anthropic 공식 문서에 따르면, 모델이 특정 출력 서식(필드 순서, 필수 구조 등)을 일관되게 따르도록 만드는 가장 검증된 기법은 `<example>` 또는 `<examples>` 태그 내에 원하는 포맷이 완벽히 반영된 예시 3~5개를 직접 제공(Few-shot Examples)하는 것입니다. 모델은 지침문보다 제시된 예시의 구조적 패턴을 직관적으로 학습하여 항상 동일한 형태와 순서로 응답을 생성하게 됩니다.

**오답 분석:**
- Option A (오답): 이미 항목화된 지침이 존재하는 상황에서 서술문/번호 목록을 더 길게 늘려 쓰는 것은 모델의 컨텍스트를 과도하게 늘리고 지침 준수율을 오히려 떨어뜨릴 수 있습니다.
- Option B (오답): 단순 포맷 고정을 위해 전체 추론 과정과 API 호출을 2단계(Two-call)로 분할하는 것은 불필요한 API 비용 및 지연 시간(Latency)을 대폭 증가시키는 과도한 설계(Over-engineering)입니다.
- Option D (오답): `temperature`를 0으로 설정하면 동일한 입력에 대해 샘플링의 무작위성은 줄어들지만, 코드가 달라져 입력이 변할 경우 여전히 지침을 벗어나 무작위 포맷으로 출력될 수 있으므로 포맷 일관성의 근본적인 해결책이 되지 못합니다.