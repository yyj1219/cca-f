# 76번 문제

**1. 문제 원문**

An architect is scoping the tool integration work for a new project. The team needs to connect Claude Code to their Jira instance for standard issue read/write operations, and separately needs a way to trigger their in-house deployment pipeline, which has no public equivalent. How should the architect approach these two needs?

A) Skip MCP for both needs and instead give the agent direct Bash access to curl the Jira API and run the deployment scripts by hand

B) Build custom MCP servers for both Jira and the deployment pipeline, since only in-house servers can be trusted with production credentials

C) Adopt an existing community or vendor Jira MCP server for the standard integration, and reserve custom server work for the team-specific pipeline

D) Adopt a community MCP server for the deployment pipeline, since third-party servers already understand internal tooling, and build a custom one for Jira instead

---

**2. 구간별 직독직해 번역**

**An architect is scoping the tool integration work**
설계자가 도구 통합 작업의 범위를 정하고 있습니다

**for a new project.**
새로운 프로젝트를 위한.

**The team needs to connect Claude Code**
팀은 Claude Code를 연결해야 합니다

**to their Jira instance**
그들의 Jira 인스턴스에

**for standard issue read/write operations,**
표준 이슈 읽기/쓰기 작업을 위해,

**and separately needs a way**
그리고 별도로 방법이 필요합니다

**to trigger their in-house deployment pipeline,**
그들의 사내 배포 파이프라인을 실행할,

**which has no public equivalent.**
공개된 대안이 없는 (사내 전용 시스템인).

**How should the architect approach**
설계자는 어떻게 접근해야 할까요

**these two needs?**
이 두 가지 요구에 대해?

**A) Skip MCP for both needs**
두 요구 모두에 대해 MCP를 건너뛰고

**and instead give the agent direct Bash access**
대신 에이전트에게 직접 Bash 접근 권한을 주어

**to curl the Jira API**
Jira API를 curl하게 하고

**and run the deployment scripts by hand**
배포 스크립트를 수동으로 실행하게 하라

**B) Build custom MCP servers**
커스텀 MCP 서버를 구축하라

**for both Jira and the deployment pipeline,**
Jira와 배포 파이프라인 둘 다를 위해,

**since only in-house servers can be trusted**
사내 서버만 신뢰할 수 있으므로

**with production credentials**
프로덕션 자격 증명을 가질 때

**C) Adopt an existing community or vendor Jira MCP server**
기존 커뮤니티나 벤더의 Jira MCP 서버를 채택하라

**for the standard integration,**
표준 통합을 위해,

**and reserve custom server work**
그리고 커스텀 서버 작업은 남겨두어라

**for the team-specific pipeline**
팀 전용 파이프라인을 위해

**D) Adopt a community MCP server**
커뮤니티 MCP 서버를 채택하라

**for the deployment pipeline,**
배포 파이프라인을 위해,

**since third-party servers already understand internal tooling,**
서드파티 서버가 이미 내부 도구를 이해하고 있으므로,

**and build a custom one for Jira instead**
대신 Jira를 위한 커스텀 서버를 구축하라

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
**C번**: Adopt an existing community or vendor Jira MCP server for the standard integration, and reserve custom server work for the team-specific pipeline

**정답 및 해설:**
**핵심 개념**: Model Context Protocol(MCP)은 AI 모델이 외부 도구와 통신하게 해주는 개방형 표준 프로토콜로, 표준화된 서비스는 기존 오픈소스/벤더 제공 서버를 활용하고 사내 전용 시스템은 커스텀 서버로 확장하는 것이 효율적인 아키텍처 방식입니다.

**문제 상황 분석:**
- Claude Code를 Jira 및 사내 배포 파이프라인과 연동해야 함
- Jira는 대중적인 표준 이슈 읽기/쓰기 작업임
- 배포 파이프라인은 외부 공개 대안이 없는 사내 독자 시스템임

**C번이 정답인 이유:**
Jira와 같은 범용 서비스는 이미 제작된 커뮤니티/벤더 MCP 서버를 재사용하고, 독자적인 사내 배포 파이프라인에만 커스텀 MCP 서버 구축을 집중하는 것이 개발 효율성과 유지보수성 측면에서 가장 합리적인 접근법입니다.

**오답 분석:**
Option A (오답): MCP를 쓰지 않고 직접 Bash와 curl을 사용하게 하는 것은 보안 및 자동화 관점에서 부적절합니다.
Option B (오답): 이미 잘 만들어진 표준 Jira MCP 서버가 있음에도 불필요하게 처음부터 커스텀 서버를 만들 이유가 없습니다.
Option D (오답): 외부 커뮤니티 서버는 사내 독자적인 배포 파이프라인을 알 수 없습니다.


# 77번 문제

**1. 문제 원문**

An architect is evaluating a customer-support triage agent whose only job is to read an incoming ticket and route it to billing, technical, or account-management queues. The agent currently has route_ticket, plus process_refund, reset_password, and close_account tools "in case they're needed later." Logs show the agent occasionally calls process_refund directly instead of routing the ticket to billing. What is the most appropriate fix?

A) Leave all four tools in place but add a system prompt line that forces refunds to go through billing first, so the triage agent only calls process_refund after routing.

B) Add a human approval step before process_refund executes so the triage agent can still invoke it but only after manual confirmation, preventing direct automated refunds.

C) Remove process_refund, reset_password, and close_account from the triage agent so it only has route_ticket, matching its single core routing function.

D) Rename process_refund to billing_queue_helper so the triage agent treats it as a routing alias rather than a direct action, avoiding unintended refund calls.

---

**2. 구간별 직독직해 번역**

**An architect is evaluating**
설계자가 평가하고 있습니다

**a customer-support triage agent**
고객 지원 분류 에이전트를

**whose only job is**
유일한 업무가 ~인

**to read an incoming ticket**
들어오는 티켓을 읽고

**and route it to billing, technical, or account-management queues.**
빌링, 기술, 계정 관리 큐로 라우팅하는 것인.

**The agent currently has route_ticket,**
에이전트는 현재 route_ticket을 가지고 있으며,

**plus process_refund, reset_password, and close_account tools**
추가로 process_refund, reset_password, close_account 도구를 가지고 있습니다

**"in case they're needed later."**
"나중에 필요할 경우를 대비해."

**Logs show the agent occasionally calls process_refund directly**
로그는 에이전트가 가끔 process_refund를 직접 호출함을 보여줍니다

**instead of routing the ticket to billing.**
티켓을 빌링 큐로 라우팅하는 대신에.

**What is the most appropriate fix?**
가장 적절한 해결책은 무엇입니까?

**A) Leave all four tools in place**
네 가지 도구 모두 그대로 두고

**but add a system prompt line**
시스템 프롬프트 한 줄을 추가하라

**that forces refunds to go through billing first,**
환불이 먼저 빌링을 거치도록 강제하는,

**so the triage agent only calls process_refund after routing.**
분류 에이전트가 라우팅 후에만 process_refund를 호출하도록.

**B) Add a human approval step**
사람의 승인 단계를 추가하라

**before process_refund executes**
process_refund가 실행되기 전에

**so the triage agent can still invoke it**
분류 에이전트가 여전히 그것을 호출할 수 있도록

**but only after manual confirmation,**
수동 확인 후에만,

**preventing direct automated refunds.**
직접적인 자동 환불을 방지하면서.

**C) Remove process_refund, reset_password, and close_account**
process_refund, reset_password, close_account를 제거하라

**from the triage agent**
분류 에이전트로부터

**so it only has route_ticket,**
오직 route_ticket만 갖도록,

**matching its single core routing function.**
단일 핵심 라우팅 기능에 맞추어.

**D) Rename process_refund to billing_queue_helper**
process_refund의 이름을 billing_queue_helper로 변경하라

**so the triage agent treats it as a routing alias**
분류 에이전트가 그것을 라우팅 별칭으로 취급하도록

**rather than a direct action,**
직접적인 작업이 아니라,

**avoiding unintended refund calls.**
의도치 않은 환불 호출을 피하면서.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
**C번**: Remove process_refund, reset_password, and close_account from the triage agent so it only has route_ticket, matching its single core routing function.

**정답 및 해설:**
**핵심 개념**: AI 에이전트 설계 시 단일 책임 원칙(Single Responsibility Principle) 및 최소 권한 원칙을 적용하여, 역할에 불필요한 도구를 제공하지 않고 오직 필요한 최소한의 도구만 부여해야 오작동을 방지할 수 있습니다.

**문제 상황 분석:**
- 분류 에이전트의 유일한 역할은 들어오는 티켓을 적절한 큐로 라우팅하는 것임
- 혹시 몰라 추가해둔 환불/비밀번호 초기화 등의 실행 도구들로 인해, 에이전트가 직접 환불 함수를 호출하는 오작동 발생

**C번이 정답인 이유:**
에이전트 본연의 라우팅 업무 외의 실행 도구들을 제거하고 오직 `route_ticket` 도구만 남겨두는 것이 오작동을 차단하는 가장 확실하고 근본적인 설계적 해결책입니다.

**오답 분석:**
Option A (오답): 프롬프트로 제어하려 해도 LLM의 우회 가능성이 남으며, 불필요한 도구를 계속 노출하는 원인이 해결되지 않습니다.
Option B (오답): 승인 단계를 추가해도 라우팅 에이전트가 환불 도구를 호출하려고 시도하는 문제 자체가 사라지지 않습니다.
Option D (오답): 도구 이름 변경은 임시방편일 뿐이며 에이전트에 혼란을 야기할 수 있습니다.


# 78번 문제

**1. 문제 원문**

A finance agent has generate_summary_report and generate_detailed_report, both described only as "Generates a report for the given account." An analyst asks for "a quick overview," and the model sometimes invokes the detailed variant instead. What long-term fix best prevents this pattern from recurring on new tools?

A) Establish a description template requiring tools to state output granularity, an example query, and how they differ from similar ones.

B) Rename both tools to have identical names distinguished only by a numeric version suffix, so a routing layer disambiguates them.

C) Cap the number of tools available to the agent at two, so the model always faces a simple binary choice between them.

D) Require the analyst to always type the exact internal tool name into every request instead of relying on the model to choose.

---

**2. 구간별 직독직해 번역**

**A finance agent has**
재무 에이전트가 갖고 있습니다

**generate_summary_report and generate_detailed_report,**
generate_summary_report와 generate_detailed_report를,

**both described only as**
둘 다 단지 ~라고만 설명되어 있는

**"Generates a report for the given account."**
"주어진 계정에 대한 보고서를 생성합니다."

**An analyst asks for "a quick overview,"**
분석가가 "간단한 개요"를 요청하면,

**and the model sometimes invokes**
모델이 때때로 호출합니다

**the detailed variant instead.**
대신 상세한 버전을.

**What long-term fix best prevents**
어떤 장기적 해결책이 가장 잘 방지할까요

**this pattern from recurring on new tools?**
이 패턴이 새 도구들에서 재발하는 것을?

**A) Establish a description template**
설명 템플릿을 확립하라

**requiring tools to state output granularity,**
도구가 출력 상세도를 명시하도록 요구하는,

**an example query,**
예시 쿼리와,

**and how they differ from similar ones.**
유사한 도구들과 어떻게 다른지를.

**B) Rename both tools to have identical names**
두 도구의 이름을 동일하게 바꾸어라

**distinguished only by a numeric version suffix,**
숫자 버전 접미사로만 구분되도록,

**so a routing layer disambiguates them.**
라우팅 레이어가 그것들을 명확히 구분할 수 있게.

**C) Cap the number of tools available to the agent at two,**
에이전트가 사용할 수 있는 도구 수를 2개로 제한하라,

**so the model always faces a simple binary choice between them.**
모델이 항상 단순한 이진 선택에 직면하도록.

**D) Require the analyst to always type**
분석가가 항상 입력하도록 요구하라

**the exact internal tool name into every request**
모든 요청에 정확한 내부 도구 이름을

**instead of relying on the model to choose.**
모델이 선택하도록 의존하는 대신.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
**A번**: Establish a description template requiring tools to state output granularity, an example query, and how they differ from similar ones.

**정답 및 해설:**
**핵심 개념**: AI 에이전트의 도구 선택(Tool Selection) 정확도를 높이기 위해, 출력의 상세 수준, 사용 예시, 다른 도구와의 차이점을 포함하는 표준화된 도구 설명 템플릿 작성이 필수적입니다.

**문제 상황 분석:**
- 요약 보고서와 상세 보고서 도구의 설명이 동일하여 모호함
- 사용자가 간단한 개요를 요청했을 때 상세 보고서가 잘못 호출되는 현상 발생

**A번이 정답인 이유:**
도구 설명(Description)에 출력 상세도, 사용 예시, 타 도구와의 차이점을 명시하도록 템플릿화하는 것이 향후 추가될 새 도구들에 대해서도 문제 재발을 막는 근본적인 장기 해결책입니다.

**오답 분석:**
Option B (오답): 동일 이름에 버전 번호만 붙이면 모델의 도구 구분 능력이 더 떨어집니다.
Option C (오답): 사용 가능 도구를 2개로 제한하는 것은 실제 비즈니스 환경에서 확장성이 없는 제약입니다.
Option D (오답): 사용자에게 내부 도구명을 직접 치게 하는 것은 자연어 처리 에이전트 도입 목적에 맞지 않습니다.


# 79번 문제

**1. 문제 원문**

A tool description reads "Updates a customer record with given fields." In practice, the model frequently passes fields that don't exist on the schema, and it's unclear whether partial updates are supported. What documentation gap explains this failure mode?

A) The description omits the expected input format and boundary behavior, such as which fields are valid and whether partial updates work.

B) The customer record tool was declared after read-only tools, causing the model to deprioritize it and pass fields not defined in the schema.

C) The tool's JSON schema uses camelCase field names, which conflicts with the model's snake_case training, causing invalid field passing.

D) The model cannot reliably handle optional parameters, so the documentation must require every field to be marked required, such as all fields being mandatory.

---

**2. 구간별 직독직해 번역**

**A tool description reads**
도구 설명에 이렇게 적혀 있습니다

**"Updates a customer record with given fields."**
"주어진 필드로 고객 레코드를 업데이트합니다."

**In practice, the model frequently passes**
실제로 모델은 자주 전달합니다

**fields that don't exist on the schema,**
스키마에 존재하지 않는 필드를,

**and it's unclear**
그리고 불분명합니다

**whether partial updates are supported.**
부분 업데이트가 지원되는지 여부가.

**What documentation gap**
어떤 문서화의 공백이

**explains this failure mode?**
이 실패 모드를 설명합니까?

**A) The description omits**
설명이 누락하고 있습니다

**the expected input format and boundary behavior,**
예상되는 입력 형식과 경계 동작을,

**such as which fields are valid**
어떤 필드가 유효한지와 같은

**and whether partial updates work.**
그리고 부분 업데이트가 작동하는지 여부를.

**B) The customer record tool was declared**
고객 레코드 도구가 선언되었습니다

**after read-only tools,**
읽기 전용 도구들 뒤에,

**causing the model to deprioritize it**
모델이 그것을 후순위로 처리하게 만들고

**and pass fields not defined in the schema.**
스키마에 정의되지 않은 필드를 전달하게 만들면서.

**C) The tool's JSON schema uses camelCase field names,**
도구의 JSON 스키마가 camelCase 필드명을 사용합니다,

**which conflicts with the model's snake_case training,**
이것이 모델의 snake_case 학습과 충돌하여,

**causing invalid field passing.**
유효하지 않은 필드 전달을 일으킵니다.

**D) The model cannot reliably handle optional parameters,**
모델은 선택적 매개변수를 안정적으로 처리하지 못합니다,

**so the documentation must require**
따라서 문서는 요구해야 합니다

**every field to be marked required,**
모든 필드가 필수로 표시되도록,

**such as all fields being mandatory.**
모든 필드가 의무적인 것처럼.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
**A번**: The description omits the expected input format and boundary behavior, such as which fields are valid and whether partial updates work.

**정답 및 해설:**
**핵심 개념**: 도구 스키마 및 문서 정의 시 예상 입력 형식과 경계 조건(어떤 필드가 허용되는지, 부분 수정이 가능한지 등)을 명확히 문서화하지 않으면 LLM이 잘못된 인수를 생성하는 실패 모드가 발생합니다.

**문제 상황 분석:**
- 설명이 너무 간략해서 허용되는 필드 범위나 부분 업데이트 동작 여부를 알 수 없음
- 모델이 스키마에 없는 유효하지 않은 필드를 임의로 넘기는 현상 발생

**A번이 정답인 이유:**
문서에 허용 가능한 입력 필드 목록 및 부분 업데이트 가능 여부 등 '입력 형식 및 경계 동작'에 대한 명확한 기술이 누락된 것이 현상의 원인입니다.

**오답 분석:**
Option B (오답): 도구 선언 순서는 스키마에 없는 필드를 생성하는 문제와 직접적인 상관이 없습니다.
Option C (오답): 변수명 표기법(camelCase/snake_case) 문제로 존재하지 않는 필드를 지어내는 현상을 설명할 수 없습니다.
Option D (오답): 모든 필드를 필수(required)로 강제하는 것은 부분 업데이트 기능을 원천 차단하므로 올바른 표준 접근법이 아닙니다.


# 80번 문제

**1. 문제 원문**

Two tools, create_ticket and escalate_ticket, both include the phrase "handles customer issues" in their descriptions. The model regularly calls create_ticket for cases that should instead be escalated. Which revision best resolves the ambiguity?

A) Combine both tools' functionality into create_ticket and pass an escalate flag, without changing any description text.

B) Add a short delay before escalate_ticket executes so the model has more time to reconsider which tool it selected.

C) Instruct the model, in the system prompt, to always call both tools together on every customer issue regardless of context.

D) Rewrite each description to state its specific trigger condition, and note explicitly when to use the other tool instead.

---

**2. 구간별 직독직해 번역**

**Two tools, create_ticket and escalate_ticket,**
두 도구 create_ticket과 escalate_ticket은

**both include the phrase "handles customer issues"**
둘 다 "고객 이슈를 처리한다"라는 문구를 포함합니다

**in their descriptions.**
그들의 설명 안에.

**The model regularly calls create_ticket**
모델은 정기적으로 create_ticket을 호출합니다

**for cases that should instead be escalated.**
대신 에스컬레이션되어야 하는 케이스들에 대해.

**Which revision best resolves the ambiguity?**
어떤 수정이 모호성을 가장 잘 해결할까요?

**A) Combine both tools' functionality into create_ticket**
두 도구의 기능을 create_ticket 하나로 결합하고

**and pass an escalate flag,**
escalate 플래그를 전달하라,

**without changing any description text.**
설명 텍스트는 전혀 바꾸지 않고.

**B) Add a short delay**
짧은 지연 시간을 추가하라

**before escalate_ticket executes**
escalate_ticket이 실행되기 전에

**so the model has more time to reconsider**
모델이 재고할 수 있는 더 많은 시간을 갖도록

**which tool it selected.**
어떤 도구를 선택했는지.

**C) Instruct the model, in the system prompt,**
시스템 프롬프트에서 모델에게 지시하라,

**to always call both tools together**
항상 두 도구를 함께 호출하도록

**on every customer issue regardless of context.**
맥락과 상관없이 모든 고객 이슈에 대해.

**D) Rewrite each description**
각 설명을 다시 작성하라

**to state its specific trigger condition,**
구체적인 트리거 조건을 명시하도록,

**and note explicitly**
그리고 명시적으로 언급하라

**when to use the other tool instead.**
언제 대신 다른 도구를 써야 하는지.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
**D번**: Rewrite each description to state its specific trigger condition, and note explicitly when to use the other tool instead.

**정답 및 해설:**
**핵심 개념**: 여러 도구가 유사한 설명을 가질 때 발생하는 모호성(Ambiguity)을 해결하기 위해, 각 도구 설명에 고유한 실행 트리거 조건과 타 도구 사용 시점을 명확히 기재해야 합니다.

**문제 상황 분석:**
- `create_ticket`과 `escalate_ticket` 설명에 중복되는 개괄적 문구가 포함됨
- 모델이 에스컬레이션 대상 건임에도 일반 티켓 생성 도구를 호출함

**D번이 정답인 이유:**
각 도구가 호출되어야 하는 구체적인 조건과, 다른 도구를 사용해야 하는 예외 조건을 설명에 명시하는 것이 모델의 잘못된 도구 선택을 예방하는 가장 정확한 해결책입니다.

**오답 분석:**
Option A (오답): 설명을 수정하지 않고 플래그만 추가하면 모델은 플래그 설정 기준을 알 수 없습니다.
Option B (오답): 실행 지연 시간 추가는 AI의 의사결정 모호성 개선과 아무 관련이 없습니다.
Option C (오답): 모든 상황에서 두 도구를 동시 호출하게 하는 것은 자원 낭비이며 부작용을 낳습니다.


# 81번 문제

**1. 문제 원문**

A contributor clones a team repository that includes a checked-in .mcp.json defining a deploy-tools server. They open the project in Claude Code for the first time and run claude mcp list. What should they expect to see for deploy-tools before they take any further action?

A) It connects immediately and silently, because checking a server into .mcp.json is itself treated as implicit approval from every contributor who clones the repo

B) It is renamed automatically with a numeric suffix, because Claude Code assumes any newly cloned .mcp.json server name conflicts with an existing one

C) It fails to load at all, because project-scoped servers only activate for the teammate who originally added them via claude mcp add --scope project

D) It appears as pending approval, because project-scoped servers from .mcp.json require the contributor to explicitly approve them before Claude Code connects

---

**2. 구간별 직독직해 번역**

**A contributor clones a team repository**
기여자가 팀 저장소를 복제합니다

**that includes a checked-in .mcp.json**
체크인된 .mcp.json을 포함하는

**defining a deploy-tools server.**
deploy-tools 서버를 정의하는.

**They open the project in Claude Code**
그들은 Claude Code에서 프로젝트를 엽니다

**for the first time**
처음으로

**and run claude mcp list.**
그리고 claude mcp list를 실행합니다.

**What should they expect to see**
그들은 무엇을 볼 것으로 예상해야 합니까

**for deploy-tools**
deploy-tools에 대해

**before they take any further action?**
추가 조치를 취하기 전에?

**A) It connects immediately and silently,**
즉시 아무 알림 없이 연결된다,

**because checking a server into .mcp.json**
.mcp.json에 서버를 체크인하는 것 자체가

**is itself treated as implicit approval**
암묵적 승인으로 취급되기 때문에

**from every contributor who clones the repo**
저장소를 클론하는 모든 기여자로부터의.

**B) It is renamed automatically**
자동으로 이름이 변경된다

**with a numeric suffix,**
숫자 접미사와 함께,

**because Claude Code assumes**
Claude Code가 가정하기 때문에

**any newly cloned .mcp.json server name**
새로 클론된 .mcp.json 서버 이름이

**conflicts with an existing one**
기존의 것과 충돌한다고.

**C) It fails to load at all,**
전혀 로드에 실패한다,

**because project-scoped servers only activate**
프로젝트 범위 서버는 오직 활성화되기 때문에

**for the teammate who originally added them**
원래 그것을 추가했던 팀원에게만

**via claude mcp add --scope project**
claude mcp add --scope project를 통해.

**D) It appears as pending approval,**
승인 대기 중(pending approval)으로 표시된다,

**because project-scoped servers from .mcp.json**
.mcp.json의 프로젝트 범위 서버는

**require the contributor to explicitly approve them**
기여자가 명시적으로 승인하도록 요구하기 때문에

**before Claude Code connects**
Claude Code가 연결하기 전에.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
**D번**: It appears as pending approval, because project-scoped servers from .mcp.json require the contributor to explicitly approve them before Claude Code connects

**정답 및 해설:**
**핵심 개념**: Claude Code의 프로젝트 레벨 MCP 설정(`.mcp.json`)은 악성 스크립트의 자동 실행을 방지하기 위해, 저장소를 처음 클론한 사용자에게 명시적인 승인(Approval)을 요구하도록 보안 설계가 되어 있습니다.

**문제 상황 분석:**
- 저장소에 포함된 `.mcp.json`에 `deploy-tools` MCP 서버가 등록되어 있음
- 해당 프로젝트를 클론한 사용자가 Claude Code에서 최초로 상태를 확인하는 상황

**D번이 정답인 이유:**
외부에서 클론된 프로젝트 범위의 MCP 서버는 무단 실행으로 인한 보안 위협을 막기 위해 사용자가 승인하기 전까지 **pending approval(승인 대기)** 상태로 표시됩니다.

**오답 분석:**
Option A (오답): 클론했다는 이유로 자동 승인되어 즉시 연결되는 것은 보안 정책상 금지됩니다.
Option B (오답): 이름 충돌을 무조건 가정하여 자동으로 접미사를 붙여 변경하지 않습니다.
Option C (오답): 최초 작성자 외 팀원도 사용할 수 있으며, 다만 사용 전 명시적 승인 단계가 필요할 뿐입니다.


# 82번 문제

**1. 문제 원문**

An internal MCP server requires a Kerberos-derived token that must be freshly minted for every connection, and no OAuth authorization server is involved. According to Anthropic documentation, which approach is most accurate for handling this authentication scheme?

A) Configure a static headers entry with the token value hardcoded, then rotate the config file manually whenever the token expires.

B) Configure the oauth block with authServerMetadataUrl pointed at the internal Kerberos realm so Claude Code discovers the flow automatically.

C) Configure headersHelper to run a script that generates the token and writes the resulting header JSON to stdout on each connection.

D) Do not attempt to configure Kerberos directly in Claude Code MCP authentication; use an intermediary service that authenticates via Kerberos and then uses Anthropic-supported credentials such as API keys or OAuth tokens.

---

**2. 구간별 직독직해 번역**

**An internal MCP server requires**
내부 MCP 서버가 요구합니다

**a Kerberos-derived token**
Kerberos 기반 토큰을

**that must be freshly minted**
새로 발급되어야만 하는

**for every connection,**
모든 연결마다,

**and no OAuth authorization server is involved.**
그리고 어떠한 OAuth 권한 부여 서버도 관여하지 않습니다.

**According to Anthropic documentation,**
Anthropic 문서에 따르면,

**which approach is most accurate**
어떤 접근 방식이 가장 정확합니까

**for handling this authentication scheme?**
이 인증 방식을 처리하기 위해?

**A) Configure a static headers entry**
정적 headers 항목을 구성하라

**with the token value hardcoded,**
토큰 값이 하드코딩된 상태로,

**then rotate the config file manually**
그런 다음 설정 파일을 수동으로 교체하라

**whenever the token expires.**
토큰이 만료될 때마다.

**B) Configure the oauth block**
oauth 블록을 구성하라

**with authServerMetadataUrl**
authServerMetadataUrl을 사용하여

**pointed at the internal Kerberos realm**
내부 Kerberos 렐름을 가리키는

**so Claude Code discovers the flow automatically.**
Claude Code가 흐름을 자동으로 감지하도록.

**C) Configure headersHelper**
headersHelper를 구성하라

**to run a script that generates the token**
토큰을 생성하는 스크립트를 실행하도록

**and writes the resulting header JSON to stdout**
그리고 결과 헤더 JSON을 표준 출력으로 쓰도록

**on each connection.**
매 연결 시마다.

**D) Do not attempt to configure Kerberos directly**
Kerberos를 직접 구성하려고 시도하지 마라

**in Claude Code MCP authentication;**
Claude Code MCP 인증에서;

**use an intermediary service**
중개 서비스를 사용하라

**that authenticates via Kerberos**
Kerberos를 통해 인증하고

**and then uses Anthropic-supported credentials**
Anthropic이 지원하는 자격 증명을 사용하는

**such as API keys or OAuth tokens.**
API 키나 OAuth 토큰 같은.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
**C번**: Configure headersHelper to run a script that generates the token and writes the resulting header JSON to stdout on each connection.

**정답 및 해설:**
**핵심 개념**: 동적 동반 토큰/인증 헤더가 매 연결 시 새로 생성되어야 할 경우, Claude Code는 `headersHelper` 설정을 통해 외부 스크립트를 실행하고 그 결과를 `stdout`으로 받아와 헤더로 적용하는 방식을 지원합니다.

**문제 상황 분석:**
- 매 연결마다 새로 발급되어야 하는 Kerberos 기반 토큰
- 별도의 OAuth 서버가 없음

**C번이 정답인 이유:**
Anthropic 공식 가이드에 따라, 매번 동적으로 변하는 인증 헤더 생성을 위해 `headersHelper`에 스크립트를 지정하여 연결 시마다 최신 토큰 JSON을 `stdout`으로 출력받아 사용하는 것이 올바른 구성법입니다.

**오답 분석:**
Option A (오답): 매 연결마다 새로 뽑아야 하므로 정적 파일 하드코딩 및 수동 교체는 불가능합니다.
Option B (오답): OAuth 구조가 없으므로 oauth 블록을 적용할 수 없습니다.
Option D (오답): 중개 서버 구축 없이 `headersHelper` 기능으로 직접 해결이 가능합니다.


# 83번 문제

**1. 문제 원문**

Claude Code needs to overwrite an existing configuration file, settings.local.json, with an updated version generated in response to the architect's request. Claude has not read this file at any point earlier in the current conversation. What must Claude do before the Write call will succeed?

A) Run Grep against the file to confirm its current contents, since Grep results satisfy the same prior-access requirement that Read would

B) Read the existing file first, since Write requires it to have been read in this conversation before overwriting an existing file

C) Delete the file first using Bash, since Write can only create files that do not already exist and cannot overwrite one directly

D) Nothing extra is required, since Write can overwrite any existing file at any time regardless of whether it has been read in the conversation

---

**2. 구간별 직독직해 번역**

**Claude Code needs to overwrite**
Claude Code가 덮어써야 합니다

**an existing configuration file, settings.local.json,**
기존 설정 파일인 settings.local.json을,

**with an updated version**
업데이트된 버전으로

**generated in response to the architect's request.**
설계자의 요청에 응답하여 생성된.

**Claude has not read this file**
Claude는 이 파일을 읽지 않았습니다

**at any point earlier in the current conversation.**
현재 대화의 이전 어떤 시점에서도.

**What must Claude do**
Claude는 무엇을 해야 합니까

**before the Write call will succeed?**
Write 호출이 성공하기 전에?

**A) Run Grep against the file**
파일에 대해 Grep을 실행하라

**to confirm its current contents,**
현재 내용을 확인하기 위해,

**since Grep results satisfy**
Grep 결과가 충족하므로

**the same prior-access requirement that Read would**
Read가 충족할 동일한 사전 접근 요구사항을.

**B) Read the existing file first,**
기존 파일을 먼저 읽어라,

**since Write requires it**
Write가 그것을 요구하므로

**to have been read in this conversation**
이 대화에서 먼저 읽혔을 것을

**before overwriting an existing file**
기존 파일을 덮어쓰기 전에.

**C) Delete the file first using Bash,**
Bash를 사용해 파일을 먼저 삭제하라,

**since Write can only create files**
Write는 파일만 생성할 수 있으므로

**that do not already exist**
이미 존재하지 않는

**and cannot overwrite one directly**
그리고 직접 덮어쓸 수는 없으므로.

**D) Nothing extra is required,**
추가적인 작업은 필요하지 않다,

**since Write can overwrite any existing file**
Write는 어떤 기존 파일이든 덮어쓸 수 있으므로

**at any time**
언제든지

**regardless of whether it has been read in the conversation**
대화에서 읽혔는지 여부와 상관없이.

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
Option A (오답): Grep으로 내용을 확인하는 것은 정식 Read 호출 조건으로 인정되지 않습니다.
Option C (오답): 파일 삭제 후 생성이 아니라 기존 파일 덮어쓰기 기능이 지원되며, 읽기 조건만 충족하면 됩니다.
Option D (오답): 사전 읽기 없이 바로 덮어쓰는 것은 덮어쓰기 안전 정책에 위배됩니다.


# 84번 문제

**1. 문제 원문**

A single tool, analyze_document, extracts data points, produces summaries, and verifies claims against a source. Users report it inconsistently performs only one of these behaviors for ambiguous requests. Which redesign best addresses this?

A) Split the tool into extract_data_points, summarize_content, and verify_claim_against_source, each with a narrow contract.

B) Merge the tool with unrelated tools into one larger tool so the model faces fewer total choices overall.

C) Add a required mode enum parameter to the existing tool, but leave its single overarching description unchanged.

D) Keep the single tool but instruct the model, in the system prompt, to always call it three separate times per request.

---

**2. 구간별 직독직해 번역**

**A single tool, analyze_document,**
단일 도구 analyze_document는

**extracts data points, produces summaries,**
데이터 포인트를 추출하고, 요약을 생성하며,

**and verifies claims against a source.**
소스에 대조하여 주장을 검증합니다.

**Users report it inconsistently performs**
사용자들은 그것이 일관성 없이 수행한다고 보고합니다

**only one of these behaviors**
이 동작들 중 오직 하나만

**for ambiguous requests.**
모호한 요청에 대해.

**Which redesign best addresses this?**
어떤 재설계가 이것을 가장 잘 해결합니까?

**A) Split the tool**
도구를 분할하라

**into extract_data_points, summarize_content, and verify_claim_against_source,**
extract_data_points, summarize_content, verify_claim_against_source로,

**each with a narrow contract.**
각각 좁은 계약(명확한 단일 역할)을 갖도록.

**B) Merge the tool with unrelated tools**
관련 없는 도구들과 이 도구를 병합하라

**into one larger tool**
하나의 더 큰 도구로

**so the model faces fewer total choices overall.**
모델이 전반적으로 더 적은 전체 선택지에 직면하도록.

**C) Add a required mode enum parameter**
필수 mode 열거형 매개변수를 추가하라

**to the existing tool,**
기존 도구에,

**but leave its single overarching description unchanged.**
그러나 포괄적인 단일 설명은 변경하지 않은 채로 두어라.

**D) Keep the single tool**
단일 도구를 유지하라

**but instruct the model, in the system prompt,**
그러나 시스템 프롬프트에서 모델에게 지시하라,

**to always call it three separate times per request.**
요청당 항상 그것을 세 번 따로 호출하도록.

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
Option B (오답): 더 큰 도구로 합치는 것은 모호성과 복잡도를 한층 더 높입니다.
Option C (오답): mode 매개변수를 추가하더라도 통틀어 놓은 설명을 고치지 않으면 여전히 판단 혼란을 줍니다.
Option D (오답): 요청마다 무조건 3번씩 호출을 강제하는 것은 심각한 자원 오남용 및 비효율을 초래합니다.


# 85번 문제

**1. 문제 원문**

Claude Code needs to find all Python files that define a class inheriting from BaseHandler, in a codebase where class definitions may span multiple lines when the base class list is long, such as class OrderHandler(\n BaseHandler, LoggingMixin\n):. A single-line Grep search for BaseHandler only catches some of these definitions. What is the most direct fix?

A) Run Grep scoped to Python files with the type parameter set to py, and enable multiline mode so wrapped class headers are matched

B) Run Glob with the pattern **/*.py to list every Python file, then read each file completely to visually check for BaseHandler

C) Run Grep with output mode files_with_matches only, on the assumption that this mode searches content more thoroughly than content mode does

D) Run Grep once per file using Bash to invoke it individually on each path, on the assumption that Grep cannot be scoped to one language repo-wide

---

**2. 구간별 직독직해 번역**

**Claude Code needs to find all Python files**
Claude Code는 모든 파이썬 파일을 찾아야 합니다

**that define a class inheriting from BaseHandler,**
BaseHandler를 상속하는 클래스를 정의하는,

**in a codebase where class definitions**
클래스 정의가 ~한 코드베이스에서

**may span multiple lines**
여러 줄에 걸쳐 있을 수 있는

**when the base class list is long,**
기반 클래스 목록이 길 때,

**such as class OrderHandler(\n BaseHandler, LoggingMixin\n):.**
`class OrderHandler(\n BaseHandler, LoggingMixin\n):`와 같은.

**A single-line Grep search for BaseHandler**
BaseHandler에 대한 단일 라인 Grep 검색은

**only catches some of these definitions.**
이러한 정의들 중 일부만 잡아냅니다.

**What is the most direct fix?**
가장 직접적인 해결책은 무엇입니까?

**A) Run Grep scoped to Python files**
파이썬 파일로 범위를 한정한 Grep을 실행하라

**with the type parameter set to py,**
type 매개변수가 py로 설정된,

**and enable multiline mode**
그리고 멀티라인 모드를 활성화하라

**so wrapped class headers are matched**
줄바꿈된 클래스 헤더들이 매칭되도록.

**B) Run Glob with the pattern **/*.py**
`**/*.py` 패턴으로 Glob을 실행하라

**to list every Python file,**
모든 파이썬 파일을 목록화하기 위해,

**then read each file completely**
그런 다음 각 파일을 완전히 읽어라

**to visually check for BaseHandler**
BaseHandler를 시각적으로 확인하기 위해.

**C) Run Grep with output mode files_with_matches only,**
files_with_matches 전용 출력 모드로 Grep을 실행하라,

**on the assumption that this mode searches content**
이 모드가 내용을 검색한다는 가정하에

**more thoroughly than content mode does**
content 모드보다 더 철저하게.

**D) Run Grep once per file using Bash**
Bash를 사용해 파일당 한 번씩 Grep을 실행하라

**to invoke it individually on each path,**
각 경로에 개별적으로 그것을 호출하기 위해,

**on the assumption that Grep cannot be scoped**
Grep이 범위 지정될 수 없다는 가정하에

**to one language repo-wide**
레포지토리 전체에서 하나의 언어로.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
**A번**: Run Grep scoped to Python files with the type parameter set to py, and enable multiline mode so wrapped class headers are matched

**정답 및 해설:**
**핵심 개념**: 정규식 및 코드 탐색 도구(Grep)에서 개행문자가 포함된 문맥(Multi-line) 검색을 수행할 때는 멀티라인 옵션(`multiline mode`)을 활성화하고 대상 확장자 범위(`type=py`)를 한정해야 검색 누락을 막을 수 있습니다.

**문제 상황 분석:**
- 상속 클래스 목록이 길어 개행(`\n`)되어 작성된 구문 존재
- 일반 단일 행 Grep 키워드 검색으로는 개행된 패턴 매칭 누락 발생

**A번이 정답인 이유:**
`type`을 `py`로 지정해 파이썬 대상 파일로 범위를 축소하고 `multiline mode`를 켜서 줄바꿈이 일어난 클래스 선언부까지 정확히 캡처하도록 설정하는 것이 해결책입니다.

**오답 분석:**
Option B (오답): 모든 파이썬 파일을 전부 읽어서 일일이 확인하는 것은 매우 비효율적인 자원 소모 방식입니다.
Option C (오답): `files_with_matches` 모드는 출력 형태(파일명만 출력)의 차이일 뿐 개행 매칭 문제를 해결하지 못합니다.
Option D (오답): Grep은 언어별 범위 지정 및 전체 탐색을 지원하므로 파일별 개별 스크립트 호출은 잘못된 방법입니다.