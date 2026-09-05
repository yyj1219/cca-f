### 16번 문제

**1. 문제 원문**

A custom MCP server dynamically adds a new tool partway through a long-running session, based on state changes on its own backend. The server sends the appropriate MCP notification for this. What should the architect expect Claude Code to do, without any manual reconnect?

A) Ignore the `list_changed` notification and continue with the initial tool set, as tools are only loaded at session start and no dynamic refresh is supported.  

B) Disconnect from the server and silently reconnect in the background, discarding any in-flight tool calls, then rely on the reconnect to pick up the new tool list.  

C) It will automatically refresh the tools from that server after receiving its `list_changed` notification, making the new tool usable without a disconnect.  

D) Require the user to run `/mcp` and manually select "Refresh tools" before the newly added tool becomes available, since the tool list updates only on manual refresh.  

---

**2. 구간별 직독직해 번역**

**QUESTION:**  
**A custom MCP server**  
사용자 정의 MCP 서버가  

**dynamically adds a new tool**  
동적으로 새로운 도구를 추가합니다  

**partway through a long-running session,**  
장시간 실행되는 세션 도중에  

**based on state changes**  
상태 변화에 기반하여  

**on its own backend.**  
자신의 백엔드에서의  

**The server sends**  
서버는 전송합니다  

**the appropriate MCP notification for this.**  
이를 위한 적절한 MCP 알림을  

**What should the architect expect**  
아키텍트는 무엇을 기대해야 합니까  

**Claude Code to do,**  
Claude Code가 수행할 것으로  

**without any manual reconnect?**  
수동 재연결 없이?  

---

**OPTIONS:**  

**Option A:**  
**Ignore the `list_changed` notification**  
`list_changed` 알림을 무시하고  

**and continue with the initial tool set,**  
초기 도구 세트로 계속 진행합니다  

**as tools are only loaded**  
도구는 오직 로드되기 때문에  

**at session start**  
세션 시작 시에만  

**and no dynamic refresh is supported.**  
그리고 동적 새로고침이 지원되지 않기 때문에  

**Option B:**  
**Disconnect from the server**  
서버와의 연결을 끊고  

**and silently reconnect in the background,**  
백그라운드에서 자동으로 재연결합니다  

**discarding any in-flight tool calls,**  
진행 중인 모든 도구 호출을 폐기하면서  

**then rely on the reconnect**  
그런 다음 재연결에 의존합니다  

**to pick up the new tool list.**  
새로운 도구 목록을 가져오기 위해  

**Option C:**  
**It will automatically refresh the tools**  
도구를 자동으로 새로고침합니다  

**from that server**  
해당 서버로부터  

**after receiving its `list_changed` notification,**  
`list_changed` 알림을 받은 후  

**making the new tool usable**  
새로운 도구를 사용할 수 있게 만듭니다  

**without a disconnect.**  
연결 끊기 없이  

**Option D:**  
**Require the user to run `/mcp`**  
사용자가 `/mcp`를 실행하도록 요구합니다  

**and manually select "Refresh tools"**  
그리고 수동으로 "Refresh tools"를 선택하도록  

**before the newly added tool**  
새로 추가된 도구가  

**becomes available,**  
사용 가능해지기 전에  

**since the tool list updates**  
도구 목록 업데이트는  

**only on manual refresh.**  
오직 수동 새로고침 시에만 이뤄지므로  

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**C번**: It will automatically refresh the tools from that server after receiving its `list_changed` notification, making the new tool usable without a disconnect.

**정답 및 해설:**  
**핵심 개념**: MCP (Model Context Protocol) 및 `notifications/tools/list_changed`  
MCP 규격에서는 서버의 도구 목록이 변경되었을 때 클라이언트에 알림(Notification)을 보낼 수 있는 event 기반 알림 체계를 정의합니다. Claude Code와 같은 MCP 클라이언트는 서버로부터 `notifications/tools/list_changed` 알림을 받으면 연결을 끊지 않고 동적으로 도구 목록을 재요청(tools/list)하여 최신 상태로 갱신합니다.

**문제 상황 분석:**
- 장시간 실행되는 세션 중 MCP 서버의 백엔드 상태 변경으로 인해 신규 도구가 동적으로 추가되었습니다.
- 서버는 표준 MCP 알림인 `notifications/tools/list_changed`를 클라이언트로 전송했습니다.
- 클라이언트(Claude Code)가 수동 재연결이나 개입 없이 이 알림을 어떻게 처리하는지 묻고 있습니다.

**C번이 정답인 이유:**
MCP 표준 프로토콜 작동 방식에 따라 클라이언트는 `list_changed` 알림을 수신하면 연결을 유지한 상태에서 즉시 `tools/list` 요청을 다시 보내 새 도구 목록을 동적으로 동기화합니다. 따라서 재연결이나 사용자 개입 없이 신규 도구를 즉시 사용할 수 있습니다.

**오답 분석:**
- Option A (오답): Claude Code 및 MCP 프로토콜은 `list_changed` 알림을 무시하지 않으며 동적 새로고침을 지원합니다.
- Option B (오답): 도구 목록 변경 시 세션 재연결이나 진행 중인 도구 호출(in-flight tool calls)을 강제로 폐기할 필요가 없습니다. 연결을 유지한 채 알림/요청으로 업데이트합니다.
- Option D (오답): 서버가 알림을 전송하지 않는 특수한 상황이 아니라 알림을 올바르게 발송한 상황이므로, 사용자가 수동으로 `/mcp` 명령어를 실행할 필요가 없습니다.

<br>

---

### 17번 문제

**1. 문제 원문**

A research agent has a generic `fetch_url` tool that can retrieve content from any URL, including URLs the model hallucinates or pulls from untrusted parts of a document. This has led to the agent fetching malformed or irrelevant pages. The team wants a scoped alternative that only allows retrieval of legitimate source documents. Which change best follows the guidance on replacing generic tools with constrained alternatives?

A) Remove URL retrieval from the agent entirely and require a human to paste document contents into the conversation


B) Keep `fetch_url` but rename it to `get_document` so its purpose is clearer to the model when selecting a tool


C) Keep `fetch_url` unchanged and add a second, identical tool named `fetch_url_v2` as a fallback for failed retrievals


D) Replace `fetch_url` with a `load_document` tool that validates the URL against an allowed document source before retrieving it

---

**2. 구간별 직독직해 번역**

**QUESTION:**  
**A research agent has**  
리서치 에이전트는 가지고 있습니다  

**a generic `fetch_url` tool**  
일반적인 `fetch_url` 도구를  

**that can retrieve content**  
콘텐츠를 가져올 수 있는  

**from any URL,**  
모든 URL로부터  

**including URLs the model hallucinates**  
모델이 환각(환각 현상)을 일으키는 URL을 포함하여  

**or pulls from untrusted parts**  
또는 신뢰할 수 없는 부분에서 가져오는  

**of a document.**  
문서의  

**This has led to**  
이것은 결과를 초래했습니다  

**the agent fetching**  
에이전트가 가져오는  

**malformed or irrelevant pages.**  
잘못된 형식이나 관련 없는 페이지를  

**The team wants**  
팀은 원합니다  

**a scoped alternative**  
범위가 제한된 대안을  

**that only allows retrieval**  
가져오기만 허용하는  

**of legitimate source documents.**  
정당한 출처 문서의  

**Which change best follows**  
어떤 변경이 가장 잘 따릅니까  

**the guidance on replacing**  
교체에 대한 지침을  

**generic tools with constrained alternatives?**  
일반 도구를 제약 조건이 있는 대안으로?  

---

**OPTIONS:**  

**Option A:**  
**Remove URL retrieval**  
URL 조회를 제거하고  

**from the agent entirely**  
에이전트로부터 완전히  

**and require a human**  
인간이 하도록 요구합니다  

**to paste document contents**  
문서 내용을 붙여넣도록  

**into the conversation**  
대화 창에  

**Option B:**  
**Keep `fetch_url`**  
`fetch_url`을 유지하지만  

**but rename it to `get_document`**  
`get_document`로 이름을 변경합니다  

**so its purpose is clearer**  
그 목적이 더 명확해지도록  

**to the model when selecting a tool**  
도구를 선택할 때 모델에게  

**Option C:**  
**Keep `fetch_url` unchanged**  
`fetch_url`을 변경 없이 유지하고  

**and add a second, identical tool**  
동일한 두 번째 도구를 추가합니다  

**named `fetch_url_v2`**  
`fetch_url_v2`라는 이름의  

**as a fallback for failed retrievals**  
실패한 조회에 대한 대체(fallback) 수단으로  

**Option D:**  
**Replace `fetch_url` with a `load_document` tool**  
`fetch_url`을 `load_document` 도구로 교체합니다  

**that validates the URL**  
URL을 검증하는  

**against an allowed document source**  
허용된 문서 출처에 대해  

**before retrieving it**  
콘텐츠를 가져오기 전에  

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**D번**: Replace `fetch_url` with a `load_document` tool that validates the URL against an allowed document source before retrieving it

**정답 및 해설:**  
**핵심 개념**: 도구 제약 설계 (Constrained Tools / Scoped Tools)  
에이전트 디자인 패턴에서 범용성 도구(Generic Tool)는 모델의 환각(Hallucination)이나 잘못된 경로 탐색을 유발할 수 있습니다. 이를 방지하기 위해 입력을 제한하거나 허용 목록(Allowlist) 검증을 수행하는 전용/제약 도구(Constrained Alternative)로 대체하는 것이 안전하고 정확한 도구 호출을 유도하는 표준 가이드라인입니다.

**문제 상황 분석:**
- 에이전트가 사용하는 범용 `fetch_url` 도구가 임의의 URL(환각된 URL, 신뢰할 수 없는 URL 등)에 접근할 수 있는 상태입니다.
- 결과적으로 형식에 맞지 않거나 업무와 무관한 페이지를 무분별하게 불러오는 문제가 발생하고 있습니다.
- 팀은 일반 도구를 제약이 있는 대안(Constrained alternative)으로 대체하여 정당한 출처의 문서만 가져오도록 제한하길 원합니다.

**D번이 정답인 이유:**
범용 `fetch_url` 도구를 제거하고, 허용된 문서 출처(Allowed document source)인지 검증하는 로직이 포함된 `load_document` 도구로 교체하는 것이 "일반 도구를 제약 조건이 포함된 대안으로 교체"하는 지침에 정확하게 부합합니다.

**오답 분석:**
- Option A (오답): 도구 자동화를 완전히 제거하고 사용자에게 붙여넣기를 요구하는 것은 에이전트의 자동화 기능을 포기하는 접근법이며 제약된 도구 도입이 아닙니다.
- Option B (오답): 이름만 변경하는 것(Rename)은 내부 접근 제어 및 입력 검증 로직을 추가하지 않으므로 임의 URL 호출 문제를 해결하지 못합니다.
- Option C (오답): 동일한 기능의 두 번째 도구를 추가하는 것은 경계 제약(Constraint)을 부여하지 않으며 복잡도만 증가시킵니다.

<br>

---

### 18번 문제

**1. 문제 원문**

A project-scoped stdio server's `.mcp.json` entry sets `"args": ["--root", "${CLAUDE_PROJECT_DIR}"]` with no fallback value. What happens when a teammate runs Claude Code from a shell where this variable happens not to be set in their own environment?

A) It resolves correctly, since Claude Code injects `CLAUDE_PROJECT_DIR` into the spawned server's own environment, though a default like `${CLAUDE_PROJECT_DIR:-.}` remains the safer practice


B) The expansion silently becomes an empty string in this case, since Claude Code never provides a value for this variable unless a plugin explicitly sets one


C) The expansion fails outright, because `${CLAUDE_PROJECT_DIR}` can only ever be read from the invoking shell's own environment, never from a value Claude Code injects itself


D) The expansion falls back automatically to the user's home directory, since that is treated as the implicit default whenever no fallback is written in `.mcp.json`

---

**2. 구간별 직독직해 번역**

**QUESTION:**  
**A project-scoped stdio server's**  
프로젝트 범위 stdio 서버의  

**`.mcp.json` entry sets**  
`.mcp.json` 항목은 설정합니다  

**`"args": ["--root", "${CLAUDE_PROJECT_DIR}"]`**  
`"args": ["--root", "${CLAUDE_PROJECT_DIR}"]`로  

**with no fallback value.**  
대체(fallback) 값 없이  

**What happens when**  
무슨 일이 일어납니까  

**a teammate runs Claude Code**  
팀원이 Claude Code를 실행할 때  

**from a shell**  
쉘 환경에서  

**where this variable happens not to be set**  
이 변수가 설정되어 있지 않은  

**in their own environment?**  
그들 자신의 환경 내에  

---

**OPTIONS:**  

**Option A:**  
**It resolves correctly,**  
올바르게 확인(해결)됩니다  

**since Claude Code injects**  
Claude Code가 주입하기 때문에  

**`CLAUDE_PROJECT_DIR`**  
`CLAUDE_PROJECT_DIR` 변수를  

**into the spawned server's own environment,**  
생성된 서버 자체의 환경으로  

**though a default like `${CLAUDE_PROJECT_DIR:-.}`**  
비록 `${CLAUDE_PROJECT_DIR:-.}`와 같은 기본값이  

**remains the safer practice**  
더 안전한 관행으로 남을지라도  

**Option B:**  
**The expansion silently becomes**  
확장(대입) 결과가 무소식으로 됩니다  

**an empty string in this case,**  
이 경우 빈 문자열이  

**since Claude Code never provides**  
Claude Code가 결코 제공하지 않기 때문에  

**a value for this variable**  
이 변수에 대한 값을  

**unless a plugin explicitly sets one**  
플러그인이 명시적으로 설정하지 않는 한  

**Option C:**  
**The expansion fails outright,**  
확장(대입)이 즉시 실패합니다  

**because `${CLAUDE_PROJECT_DIR}`**  
`${CLAUDE_PROJECT_DIR}`는  

**can only ever be read**  
읽힐 수만 있기 때문에  

**from the invoking shell's own environment,**  
호출하는 쉘 자체의 환경에서만  

**never from a value**  
값으로부터는 읽히지 않고  

**Claude Code injects itself**  
Claude Code가 자체적으로 주입하는  

**Option D:**  
**The expansion falls back automatically**  
확장 결과가 자동으로 대체(fallback)됩니다  

**to the user's home directory,**  
사용자의 홈 디렉터리로  

**since that is treated**  
그것이 취급되기 때문에  

**as the implicit default**  
암묵적인 기본값으로  

**whenever no fallback is written**  
대체 값이 작성되어 있지 않을 때마다  

**in `.mcp.json`**  
`.mcp.json` 내에  

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

### 19번 문제

**1. 문제 원문**

A code-review subagent was originally scoped to Read, Grep, and Glob so it could inspect a codebase without changing it. During a refactor, an engineer also grants it Bash and a deploy_service tool because "it might be handy." Shortly after, the review agent begins running deploy_service mid-review on branches that haven't been approved. What principle explains this outcome and what is the correct fix?

A) The review agent's system prompt needs a stronger instruction telling it never to deploy, while keeping all five tools available so that it can still use Bash for code inspection but is prevented from running deploy_service.


B) The deploy_service tool's input schema is likely malformed, so the fix is to add stricter JSON schema validation on its parameters so that the agent only submits deployment requests for branches that have passed review.


C) The review agent should be given even more tools, such as advanced file-search and environment-status utilities, so that deploy_service becomes just one option among many and is therefore less likely to be selected inadvertently.


D) Tools beyond an agent's specialization tend to get misused when available, so Bash and deploy_service should be removed, restricting the review agent to the read-only tools its role requires.

---

**2. 구간별 직독직해 번역**

**QUESTION:**  
**A code-review subagent**  
코드 리뷰 서브에이전트는  

**was originally scoped**  
원래 범위를 가졌습니다  

**to Read, Grep, and Glob**  
Read, Grep, Glob으로  

**so it could inspect**  
검사할 수 있도록  

**a codebase**  
코드베이스를  

**without changing it.**  
그것을 변경하지 않고  

**During a refactor,**  
리팩터링 과정에서  

**an engineer also grants it**  
한 엔지니어가 부여합니다  

**Bash and a deploy_service tool**  
Bash와 deploy_service 도구를  

**because "it might be handy."**  
"유용할 수 있다"는 이유로  

**Shortly after,**  
직후에  

**the review agent begins running**  
리뷰 에이전트는 실행하기 시작합니다  

**deploy_service mid-review**  
리뷰 도중에 deploy_service를  

**on branches that haven't been approved.**  
승인되지 않은 브랜치에 대해  

**What principle explains**  
어떤 원칙이 설명하며  

**this outcome**  
이러한 결과를  

**and what is the correct fix?**  
올바른 해결책은 무엇입니까?  

---

**OPTIONS:**  

**Option A:**  
**The review agent's system prompt**  
리뷰 에이전트의 시스템 프롬프트는  

**needs a stronger instruction**  
더 강력한 지시어가 필요합니다  

**telling it never to deploy,**  
절대 배포하지 말라고 명령하는  

**while keeping all five tools available**  
5개 도구를 모두 사용 가능한 상태로 유지하면서  

**so that it can still use Bash**  
여전히 Bash를 사용할 수 있도록  

**for code inspection**  
코드 검사를 위해  

**but is prevented from running deploy_service.**  
하지만 deploy_service 실행은 방지되도록  

**Option B:**  
**The deploy_service tool's input schema**  
deploy_service 도구의 입력 스키마가  

**is likely malformed,**  
잘못 형성되었을 가능성이 높습니다  

**so the fix is**  
따라서 해결책은  

**to add stricter JSON schema validation**  
더 엄격한 JSON 스키마 검증을 추가하는 것입니다  

**on its parameters**  
그 매개변수에  

**so that the agent only submits**  
에이전트가 제출하기만 하도록  

**deployment requests**  
배포 요청을  

**for branches that have passed review.**  
리뷰를 통과한 브랜치에 대해서만  

**Option C:**  
**The review agent should be given**  
리뷰 에이전트에게 제공되어야 합니다  

**even more tools,**  
훨씬 더 많은 도구가  

**such as advanced file-search**  
고급 파일 검색 및  

**and environment-status utilities,**  
환경 상태 유틸리티와 같은  

**so that deploy_service becomes**  
deploy_service가 되도록  

**just one option among many**  
많은 옵션 중 하나일 뿐이 되도록  

**and is therefore less likely**  
따라서 가능성이 낮아지도록  

**to be selected inadvertently.**  
부주의하게 선택될  

**Option D:**  
**Tools beyond an agent's specialization**  
에이전트의 전문 범위를 벗어나는 도구는  

**tend to get misused when available,**  
사용 가능할 때 남용되는 경향이 있으므로  

**so Bash and deploy_service should be removed,**  
Bash와 deploy_service는 제거되어야 합니다  

**restricting the review agent**  
리뷰 에이전트를 제한하면서  

**to the read-only tools**  
읽기 전용 도구로  

**its role requires.**  
그 역할이 필요로 하는  

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**D번**: Tools beyond an agent's specialization tend to get misused when available, so Bash and deploy_service should be removed, restricting the review agent to the read-only tools its role requires.

**정답 및 해설:**  
**핵심 개념**: 최소 권한의 원칙 (Principle of Least Privilege) 및 에이전트 도구 제한 (Tool Scoping)  
에이전트 아키텍처에서는 에이전트에게 지정된 역할에 꼭 필요한 최점단 도구만 제공해야 합니다. 역할의 범위를 넘어서는 강력하거나 위험한 도구(Bash, 배포 도구 등)가 제공되면 프롬프트 지시어만으로는 오용(Misuse) 및 환각으로 인한 실행을 완벽히 차단하기 어렵습니다.

**문제 상황 분석:**
- 읽기 전용 검사 기능(Read, Grep, Glob)만 제공되던 코드 리뷰 에이전트에 불필요하게 Bash 및 `deploy_service` 도구가 추가되었습니다.
- 결과적으로 승인되지 않은 브랜치에 대해 리뷰 도중 배포 명령을 실행하는 무단/오작동 문제가 발생했습니다.
- 원인 규명 및 에이전트 설계 원칙에 따른 적절한 수정 방안을 도출해야 합니다.

**D번이 정답인 이유:**
에이전트에게 전문 역할 범위를 벗어난 도구를 부여하면 잘못 선택되어 실행될 위험이 매우 높아집니다. 프롬프트로 제약하는 것보다 도구 집합 자체에서 제거하여 읽기 전용(Read-only) 도구로만 범위를 제한(Scope)하는 것이 가장 안전하고 올바른 해결책입니다.

**오답 분석:**
- Option A (오답): 도구를 그대로 둔 채 시스템 프롬프트에 배포 금지 지시문만 강화하는 것은 모델의 환각이나 명령 오해로 인한 실행 위험을 완벽히 제거할 수 없습니다.
- Option B (오답): 스키마 검증은 입력 형태의 유효성을 검사할 뿐, 에이전트가 배포 도구 자체를 호출하려는 의도나 타이밍을 막지 못합니다.
- Option C (오답): 도구를 더 추가하면 도구 선택 공간이 복잡해져 에이전트의 오작동 및 환각 가능성이 오히려 증대됩니다.

<br>

---

### 20번 문제

**1. 문제 원문**

An architect asks Claude Code to find every place in a large monorepo that calls a function named `parseInvoice`, including calls inside a minified bundle that is gitignored but still needs to be checked. Which approach correctly locates all call sites?

A) Run Glob with the pattern `**/*parseInvoice*` to find files whose names contain the function, then treat that file list as the complete set of callers


B) Run Glob with the pattern `**/*.js` to list every JavaScript file, then judge from file names alone which ones likely reference parseInvoice


C) Run Grep across the repo for parseInvoice, then Grep the gitignored bundle's path directly, since a direct path is still searched


D) Run Grep once with the multiline flag enabled, assuming multiline mode makes Grep search gitignored files as a side effect of that flag

---

**2. 구간별 직독직해 번역**

**QUESTION:**  
**An architect asks**  
아키텍트가 요청합니다  

**Claude Code to find**  
Claude Code가 찾도록  

**every place in a large monorepo**  
대규모 모노레포의 모든 위치를  

**that calls a function**  
함수를 호출하는  

**named `parseInvoice`,**  
`parseInvoice`라는 이름의  

**including calls**  
호출들을 포함하여  

**inside a minified bundle**  
경량화된(minified) 번들 내부의  

**that is gitignored**  
`.gitignore`에 등록되어 있지만  

**but still needs to be checked.**  
여전히 확인이 필요한  

**Which approach correctly locates**  
어떤 접근 방식이 정확히 찾아냅니까  

**all call sites?**  
모든 호출 위치를?  

---

**OPTIONS:**  

**Option A:**  
**Run Glob with the pattern `**/*parseInvoice*`**  
`**/*parseInvoice*` 패턴으로 Glob을 실행합니다  

**to find files**  
파일들을 찾기 위해  

**whose names contain the function,**  
이름에 해당 함수가 포함된  

**then treat that file list**  
그런 다음 그 파일 목록을 간주합니다  

**as the complete set of callers**  
호출자의 전체 집합으로  

**Option B:**  
**Run Glob with the pattern `**/*.js`**  
`**/*.js` 패턴으로 Glob을 실행합니다  

**to list every JavaScript file,**  
모든 자바스크립트 파일 목록을 뽑기 위해  

**then judge from file names alone**  
그런 다음 파일 이름만으로 판단합니다  

**which ones likely reference `parseInvoice`**  
어떤 파일이 `parseInvoice`를 참조할 가능성이 높은지  

**Option C:**  
**Run Grep across the repo**  
리포지토리 전체에 대해 Grep을 실행합니다  

**for `parseInvoice`,**  
`parseInvoice`를 찾기 위해  

**then Grep the gitignored bundle's path directly,**  
그런 다음 `.gitignore` 처리된 번들 경로를 직접 Grep합니다  

**since a direct path is still searched**  
직접 지정된 경로는 여전히 검색되기 때문에  

**Option D:**  
**Run Grep once**  
Grep을 한 번 실행합니다  

**with the multiline flag enabled,**  
multiline 플래그를 활성화한 상태로  

**assuming multiline mode makes Grep search**  
multiline 모드가 Grep으로 하여금 검색하게 만든다고 가정하면서  

**gitignored files**  
`.gitignore` 처리된 파일들을  

**as a side effect of that flag**  
해당 플래그의 부작용(부차적 효과)으로  

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

<br>

---

### 21번 문제

**1. 문제 원문**

A team built a custom MCP server exposing a `find_symbol_usages` tool that is far more accurate than text search, but the agent keeps reaching for the built-in Grep tool instead. The tool's current description is just "Finds symbol usages." What change is most likely to fix this?

A) Rename the tool from `find_symbol_usages` to `grep` so the agent recognizes it as a drop-in upgrade for its existing habit of reaching for text search  

B) Remove Grep from the list of available built-in tools entirely so the agent has no remaining alternative but to call the MCP tool for every search it runs  

C) Set the tool's permission mode to require manual approval on every single call so the agent is forced to weigh it before falling back to Grep  

D) Rewrite the description to explain what it returns and when it beats text search, such as resolving usages across renamed imports and generated code grep cannot match  

---

**2. 구간별 직독직해 번역**

**QUESTION:**  
**A team built**  
한 팀이 구축했습니다  

**a custom MCP server**  
사용자 정의 MCP 서버를  

**exposing a `find_symbol_usages` tool**  
`find_symbol_usages` 도구를 제공하는  

**that is far more accurate**  
훨씬 더 정확한  

**than text search,**  
텍스트 검색보다  

**but the agent keeps reaching for**  
하지만 에이전트는 계속해서 선택합니다  

**the built-in Grep tool instead.**  
대신 내장된 Grep 도구를  

**The tool's current description is**  
그 도구의 현재 설명은  

**just "Finds symbol usages."**  
단지 "Finds symbol usages."입니다  

**What change is most likely**  
어떤 변경이 가장 가능성이 높습니까  

**to fix this?**  
이 문제를 해결할?  

---

**OPTIONS:**  

**Option A:**  
**Rename the tool**  
도구의 이름을 변경합니다  

**from `find_symbol_usages` to `grep`**  
`find_symbol_usages`에서 `grep`으로  

**so the agent recognizes it**  
에이전트가 이를 인식하도록  

**as a drop-in upgrade**  
대체 가능한 업그레이드로  

**for its existing habit**  
기존의 습관에 대한  

**of reaching for text search**  
텍스트 검색을 선택하던  

**Option B:**  
**Remove Grep**  
Grep을 제거합니다  

**from the list of available built-in tools entirely**  
사용 가능한 내장 도구 목록에서 완전히  

**so the agent has no remaining alternative**  
에이전트에게 남은 대안이 없도록  

**but to call the MCP tool**  
MCP 도구를 호출할 수밖에  

**for every search it runs**  
실행하는 모든 검색에 대해  

**Option C:**  
**Set the tool's permission mode**  
도구의 권한 모드를 설정합니다  

**to require manual approval**  
수동 승인을 요구하도록  

**on every single call**  
모든 단일 호출마다  

**so the agent is forced to weigh it**  
에이전트가 이를 강제로 고려하도록  

**before falling back to Grep**  
Grep으로 돌아가기 전에  

**Option D:**  
**Rewrite the description**  
설명을 다시 작성합니다  

**to explain what it returns**  
무엇을 반환하는지 설명하도록  

**and when it beats text search,**  
그리고 언제 텍스트 검색보다 뛰어난지  

**such as resolving usages**  
사용처를 분석하는 것과 같이  

**across renamed imports**  
이름이 변경된 임포트 전반이나  

**and generated code**  
그리고 생성된 코드에서  

**grep cannot match**  
grep이 일치시킬 수 없는  

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**D번**: Rewrite the description to explain what it returns and when it beats text search, such as resolving usages across renamed imports and generated code grep cannot match

**정답 및 해설:**  
**핵심 개념**: 도구 설명 최적화 (Tool Description Optimization / Prompt Engineering for Tools)  
LLM 기반 에이전트는 도구의 이름과 설명(Description)을 읽고 어떤 상황에서 해당 도구를 호출할지 판단합니다. 도구 설명이 모호하거나 너무 단순하면 모델은 익숙한 기본 도구(예: Grep)를 선택하는 경향이 있습니다. 구체적인 반환 값, 정밀도, 차별화된 사용 시점(Use cases)을 설명에 명시하면 에이전트의 도구 선택 능력이 대폭 향상됩니다.

**문제 상황 분석:**
- 텍스트 검색보다 우수한 성능을 가진 커스텀 MCP 도구 `find_symbol_usages`를 추가했습니다.
- 그러나 에이전트는 이 도구 대신 내장 `Grep` 도구를 계속 사용합니다.
- 원인은 커스텀 도구의 설명이 "Finds symbol usages."로 너무 간소하여 모델이 Grep 대비 이점과 적절한 사용 타이밍을 판단하지 못하기 때문입니다.

**D번이 정답인 이유:**
도구 설명을 수정하여 도구가 반환하는 정보의 구체적 형태와 Grep(일반 텍스트 검색) 대비 더 우수한 사용 시점(예: 이름이 변경된 import 문, 자동 생성 코드 등의 심볼 추적)을 명확히 명시하면 에이전트가 상황에 맞는 정확한 도구를 선택하도록 유도할 수 있습니다.

**오답 분석:**
- Option A (오답): 도구 이름을 내장 도구와 동일한 `grep`으로 변경하는 것은 도구 충돌 및 혼란을 야기하며, 올바른 설계 방식이 아닙니다.
- Option B (오답): 범용 텍스트 검색에 유용한 기본 Grep 도구를 완전히 제거하는 것은 에이전트의 일반적인 탐색 및 검색 능력을 심각하게 제한합니다.
- Option C (오답): 호출 시마다 수동 승인을 요구하는 것은 인간의 개입 부담을 늘릴 뿐, 에이전트가 스스로 어떤 도구가 더 적절한지 판단하는 프롬프트/선택 로직을 개선해 주지 못합니다.

<br>

---

### 22번 문제

**1. 문제 원문**

A QA engineer notices that a coding assistant consistently picks `run_linter` instead of `run_type_checker` when a user says "check my code for issues," even though the user meant type errors. Both tools' descriptions read "Checks code for issues." What is the most targeted fix?

A) Reduce the number of code-checking tools available to the assistant to one, since offering more than one inherently causes confusion.  

B) Instruct users to say "lint" or "type check" explicitly every time, since tool descriptions cannot influence this kind of ambiguity.  

C) Specify in each description the exact category of issue each tool detects, along with an example phrase associated with each one.  

D) Merge the two tools' outputs into a single combined report and always run both regardless of what the user actually asked for.  

---

**2. 구간별 직독직해 번역**

**QUESTION:**  
**A QA engineer notices**  
QA 엔지니어가 발견합니다  

**that a coding assistant**  
코딩 어시스턴트가  

**consistently picks `run_linter`**  
일관되게 `run_linter`를 선택한다는 것을  

**instead of `run_type_checker`**  
`run_type_checker` 대신에  

**when a user says**  
사용자가 말할 때  

**"check my code for issues,"**  
"내 코드의 문제를 점검해줘"라고  

**even though the user meant**  
비록 사용자는 의도했음에도 불구하고  

**type errors.**  
타입 에러를  

**Both tools' descriptions read**  
두 도구의 설명은 모두 써 있습니다  

**"Checks code for issues."**  
"코드의 문제를 점검합니다"라고  

**What is the most targeted fix?**  
가장 정밀하게 표적화된 해결책은 무엇입니까?  

---

**OPTIONS:**  

**Option A:**  
**Reduce the number of code-checking tools**  
코드 점검 도구의 수를 줄입니다  

**available to the assistant to one,**  
어시스턴트가 사용할 수 있는 도구를 하나로  

**since offering more than one**  
하나 이상을 제공하는 것이  

**inherently causes confusion.**  
본질적으로 혼란을 야기하기 때문에  

**Option B:**  
**Instruct users to say**  
사용자들에게 말하도록 지시합니다  

**"lint" or "type check" explicitly**  
"lint" 또는 "type check"라고 명시적으로  

**every time,**  
매번  

**since tool descriptions cannot influence**  
도구 설명은 영향을 줄 수 없기 때문에  

**this kind of ambiguity.**  
이러한 종류의 모호성에  

**Option C:**  
**Specify in each description**  
각 설명에 명시합니다  

**the exact category of issue**  
이슈의 정확한 범주를  

**each tool detects,**  
각 도구가 감지하는  

**along with an example phrase**  
예시 문구와 함께  

**associated with each one.**  
각각과 관련된  

**Option D:**  
**Merge the two tools' outputs**  
두 도구의 출력을 병합합니다  

**into a single combined report**  
하나의 결합된 리포트로  

**and always run both**  
그리고 항상 둘 다 실행합니다  

**regardless of what the user actually asked for.**  
사용자가 실제로 요청한 것과 상관없이  

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**C번**: Specify in each description the exact category of issue each tool detects, along with an example phrase associated with each one.

**정답 및 해설:**  
**핵심 개념**: 도구 설명 세분화 및 예시 프롬프팅 (Tool Description Disambiguation)  
LLM 기반 에이전트는 도구의 기능 설명(Tool Description)을 기반으로 사용자의 의도에 맞는 도구를 선택합니다. 도구의 설명이 서로 동일하거나 지나치게 모호하면 모델은 임의의 도구를 무분별하게 선택하게 됩니다. 각 도구가 감지하는 문제 유형(스타일/구문 에러 vs 타입 에러)과 연관 트리거 문구를 설명에 명확히 작성하는 것이 도구 오선택을 방지하는 가장 근본적이고 정밀한 해결책입니다.

**문제 상황 분석:**
- 사용자가 "내 코드의 문제를 점검해줘"라고 입력하여 타입 에러 검사를 원하고 있습니다.
- 그러나 어시스턴트는 `run_type_checker` 대신 `run_linter`만을 계속 선택하고 있습니다.
- 그 원인은 두 도구의 설명이 모두 "Checks code for issues."로 동일하여 모델이 구별하지 못하기 때문입니다.

**C번이 정답인 이유:**
각 도구의 설명에 감지하는 문제의 정확한 카테고리(예: `run_linter`는 스타일/문법 구문 오류, `run_type_checker`는 타입 불일치/타입 오류)와 트리거가 될 수 있는 예시 문구를 명확히 명시하면, 모델이 모호한 입력에 대해서도 의도를 올바르게 판단하여 적절한 도구를 선택할 수 있게 됩니다.

**오답 분석:**
- Option A (오답): 도구 수를 하나로 줄이는 것은 타입 체크 기능이나 린트 기능 중 하나를 포기하는 것이므로 적절한 해결책이 아닙니다.
- Option B (오답): 도구 설명(Description)은 모델의 판단에 결정적인 영향을 미칩니다. 사용자에게 프롬프트 규칙을 강요하는 것은 에이전트의 사용성을 저해합니다.
- Option D (오답): 검사 목적과 무관하게 항상 두 도구를 모두 실행하는 것은 불필요한 연산 자원 및 시간 낭비를 초래합니다.

<br>

---

### 23번 문제

**1. 문제 원문**

A repository's `.mcp.json` defines a server named `analytics`, and a developer also has a server named `analytics` added with local scope on their machine pointing at a different endpoint entirely. When that developer runs Claude Code in the project, which server definition is used?

A) The project-scoped definition, because `.mcp.json` is checked into version control and therefore always overrides a developer's personal machine-level entries


B) The local-scoped definition, because local scope takes precedence over project scope when names collide, and the two entries are not merged


C) Neither definition connects, because Claude Code treats a duplicate server name across scopes as a configuration error and skips both


D) Both definitions are merged field by field, with the local entry's fields filling in whatever the project entry leaves unspecified

---

**2. 구간별 직독직해 번역**

**QUESTION:**  
**A repository's `.mcp.json`**  
리포지토리의 `.mcp.json`은  

**defines a server**  
서버를 정의합니다  

**named `analytics`,**  
`analytics`라는 이름의  

**and a developer also has**  
그리고 개발자 역시 가지고 있습니다  

**a server named `analytics`**  
`analytics`라는 이름의 서버를  

**added with local scope**  
로컬 스코프(범위)로 추가된  

**on their machine**  
자신의 로컬 머신에  

**pointing at a different endpoint entirely.**  
전혀 다른 엔드포인트를 가리키는  

**When that developer runs**  
그 개발자가 실행할 때  

**Claude Code in the project,**  
프로젝트 내에서 Claude Code를  

**which server definition is used?**  
어떤 서버 정의가 사용됩니까?  

---

**OPTIONS:**  

**Option A:**  
**The project-scoped definition,**  
프로젝트 스코프 정의  

**because `.mcp.json` is checked into**  
`.mcp.json`이 체크인되어 있기 때문에  

**version control**  
버전 관리(Git 등)에  

**and therefore always overrides**  
따라서 항상 덮어씁니다  

**a developer's personal machine-level entries**  
개발자의 개인 머신 수준 항목을  

**Option B:**  
**The local-scoped definition,**  
로컬 스코프 정의  

**because local scope takes precedence**  
로컬 스코프가 우선순위를 갖기 때문에  

**over project scope**  
프로젝트 스코프보다  

**when names collide,**  
이름이 충돌할 때  

**and the two entries are not merged**  
그리고 두 항목은 병합되지 않습니다  

**Option C:**  
**Neither definition connects,**  
두 정의 모두 연결되지 않습니다  

**because Claude Code treats**  
Claude Code가 취급하기 때문에  

**a duplicate server name across scopes**  
여러 스코프에 걸친 중복된 서버 이름을  

**as a configuration error**  
설정 오류로  

**and skips both**  
그리고 둘 다 건너뜁니다  

**Option D:**  
**Both definitions are merged**  
두 정의가 병합됩니다  

**field by field,**  
필드별로  

**with the local entry's fields filling in**  
로컬 항목의 필드가 채워지면서  

**whatever the project entry leaves unspecified**  
프로젝트 항목이 지정하지 않은 상태로 둔 것은 무엇이든  

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**B번**: The local-scoped definition, because local scope takes precedence over project scope when names collide, and the two entries are not merged

**정답 및 해설:**  
**핵심 개념**: MCP 서버 설정 스코프 우선순위 (MCP Scope Precedence)  
Claude Code의 MCP 설정 구조에서는 개발자가 개인 로컬 환경에 맞춰 구성한 설정이 개별 개발 환경에 맞춤화될 수 있도록 **로컬 스코프(Local Scope)**에 가장 높은 우선순위를 부여합니다. 동일한 이름을 가진 MCP 서버가 여러 스코프에 중복 정의되어 이름 충돌이 발생하면, 높은 우선순위의 스코프 설정이 낮은 우선순위 설정을 전체 덮어쓰며, 필드별 부분 병합은 이루어지지 않습니다.

**문제 상황 분석:**
- 프로젝트 리포지토리의 `.mcp.json` (Project scope)에 `analytics`라는 MCP 서버가 정의되어 있습니다.
- 개발자 개인 머신의 로컬 설정 (Local scope)에도 완전히 다른 엔드포인트를 가리키는 `analytics` 서버가 등록되어 있습니다.
- 동일한 서버 이름을 가질 때 Claude Code가 어떤 스코프의 설정을 채택하는지 충돌 해결 정책을 묻고 있습니다.

**B번이 정답인 이유:**
Claude Code의 스코프 우선순위 규칙에 따라 이름 충돌(Name collision) 발생 시 **로컬 스코프(Local scope)**가 프로젝트 스코프(Project scope)보다 명확하게 우선합니다. 또한 두 설정이 부분적으로 합쳐지는 것이 아니라 로컬 스코프의 전체 정의가 단독 적용되므로 B번이 올바른 설명입니다.

**오답 분석:**
- Option A (오답): 프로젝트 스코프(`.mcp.json`)가 버전에 포함되어 있다 해서 로컬 사용자 설정을 강제로 덮어쓰지 않습니다. 오히려 개인화된 로컬 스코프가 프로젝트 설정을 재정의(Override)할 수 있도록 설계되어 있습니다.
- Option C (오답): 스코프 간 서버 이름 중복은 설정 에러로 처리되어 차단되는 것이 아니라, 우선순위 규칙에 따라 단일 설정을 선택하여 정상 작동합니다.
- Option D (오답): 두 스코프의 설정 필드들이 객체 단위로 병합(Field-by-field merge)되는 것이 아니며, 높은 우선순위 스코프의 엔트리가 전체 채택됩니다.

<br>

---

### 24번 문제

**1. 문제 원문**

A project has three MCP servers configured: a Postgres server, a Sentry server, and a Slack server, all healthy and connected. Mid-session, the agent is asked to pull a database schema, cross-reference a recent Sentry error, and post a summary to Slack in one request. What should the architect expect about tool availability for this request?

A) Tools from all three connected servers are available to the agent simultaneously, so it can call across Postgres, Sentry, and Slack tools within the same turn as needed


B) Only one MCP server can hold an active connection at any given time, so the developer must disconnect Postgres before Sentry's tools will respond to a call


C) Only the tools from the server whose name the prompt most closely matches will be loaded, so the agent must be told explicitly which server to prioritize


D) The agent must complete every Postgres tool call and receive its results before Sentry and Slack tools become selectable at all during that same turn

---

**2. 구간별 직독직해 번역**

**QUESTION:**  
**A project has**  
프로젝트에는 가지고 있습니다  

**three MCP servers configured:**  
구성된 3개의 MCP 서버를:  

**a Postgres server,**  
Postgres 서버,  

**a Sentry server,**  
Sentry 서버,  

**and a Slack server,**  
그리고 Slack 서버를,  

**all healthy and connected.**  
모두 정상 작동하며 연결된 상태로.  

**Mid-session,**  
세션 진행 도중,  

**the agent is asked**  
에이전트는 요청을 받습니다  

**to pull a database schema,**  
데이터베이스 스키마를 가져오고,  

**cross-reference a recent Sentry error,**  
최근 Sentry 에러를 교차 참조하며,  

**and post a summary to Slack**  
Slack에 요약을 게시하라는  

**in one request.**  
단 하나의 요청 안에서.  

**What should the architect expect**  
아키텍트는 무엇을 예상해야 합니까  

**about tool availability**  
도구 사용 가능성에 대해  

**for this request?**  
이 요청을 위한?  

---

**OPTIONS:**  

**Option A:**  
**Tools from all three connected servers**  
연결된 세 서버 모두의 도구들이  

**are available to the agent simultaneously,**  
에이전트에게 동시에 사용 가능하므로,  

**so it can call across**  
교차 호출할 수 있습니다  

**Postgres, Sentry, and Slack tools**  
Postgres, Sentry, Slack 도구들을  

**within the same turn as needed**  
필요에 따라 동일한 턴 내에서  

**Option B:**  
**Only one MCP server**  
오직 하나의 MCP 서버만  

**can hold an active connection**  
활성 연결을 유지할 수 있으므로  

**at any given time,**  
어느 시점에든,  

**so the developer must disconnect Postgres**  
개발자는 Postgres 연결을 해제해야 합니다  

**before Sentry's tools will respond to a call**  
Sentry의 도구가 호출에 응답하기 전에  

**Option C:**  
**Only the tools from the server**  
오직 서버로부터의 도구들만  

**whose name the prompt most closely matches**  
프롬프트와 가장 밀접하게 일치하는 이름을 가진  

**will be loaded,**  
로드될 것이므로,  

**so the agent must be told explicitly**  
에이전트는 명시적으로 전달받아야 합니다  

**which server to prioritize**  
어떤 서버를 우선시할지  

**Option D:**  
**The agent must complete**  
에이전트는 완료해야 합니다  

**every Postgres tool call**  
모든 Postgres 도구 호출을  

**and receive its results**  
그리고 그 결과를 받아야 합니다  

**before Sentry and Slack tools**  
Sentry 및 Slack 도구가  

**become selectable at all**  
선택 가능해지기 전에  

**during that same turn**  
동일한 턴 동안에  

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**A번**: Tools from all three connected servers are available to the agent simultaneously, so it can call across Postgres, Sentry, and Slack tools within the same turn as needed

**정답 및 해설:**  
**핵심 개념**: MCP 멀티 서버 동시 연결 및 다중 도구 호출 (Multi-MCP Server Coexistence & Multi-Tool Calling)  
MCP(Model Context Protocol) 클라이언트는 복수의 MCP 서버와 동시에 세션을 유지할 수 있습니다. 각 서버가 노출하는 모든 도구들은 컨텍스트에 통합되어 에이전트에게 동시에(simultaneously) 제공되며, 모델은 단일 턴/요청 내에서도 여러 서버의 도구를 자유롭게 조합하여 연속적으로 혹은 동시에 호출할 수 있습니다.

**문제 상황 분석:**
- 현재 Postgres, Sentry, Slack이라는 3개의 MCP 서버가 모두 정상적으로 연결되어 있습니다.
- 단 한 번의 프롬프트 요청으로 "DB 스키마 조회 -> Sentry 에러 참조 -> Slack 요약 전송"이라는 다중 단계 및 다중 서버 작업을 처리해야 합니다.
- MCP 클라이언트 환경에서 이 3개 서버의 도구들이 제공되는 방식과 동작 방식을 파악하는 것이 핵심입니다.

**A번이 정답인 이유:**
연결된 모든 MCP 서버의 도구 목록은 클라이언트에 동시 노출됩니다. 따라서 에이전트는 한 번의 사용자 요청(동일한 턴) 내에서 필요에 따라 Postgres, Sentry, Slack 도구들을 제약 없이 자유롭게 순차적/다중 호출할 수 있습니다.

**오답 분석:**
- Option B (오답): MCP는 동시에 여러 서버 연결을 유지할 수 있으며, 하나의 서버만 선택적 연결을 허용한다는 제약은 존재하지 않습니다.
- Option C (오답): 프롬프트 키워드 유사도에 따라 특정 서버의 도구만 선택적으로 로드되는 것이 아니며, 연결된 모든 서버의 도구가 기본적으로 로드 및 제공됩니다.
- Option D (오답): 순차적인 작업이라 하더라도 동일 턴 내에서 다른 서버의 도구가 선택 불가능하게 블로킹되는 구조가 아닙니다. 모든 도구는 턴 시작 시점부터 이미 선택 가능한 상태로 노출되어 있습니다.

<br>

---

### 25번 문제

**1. 문제 원문**

A tool named `analyze_content`, originally built for summarizing pasted text, has its description copied almost verbatim onto a newer tool, `analyze_document`, meant for uploaded PDFs. Following the pattern of renaming a tool to eliminate overlap, what should the team do?

A) Rename `analyze_content` to a more specific name, such as `summarize_pasted_text`, and limit its description to pasted text only, while `analyze_document` handles uploaded PDFs.


B) Give both tools identical descriptions but different internal function names so backend routing can disambiguate them.


C) Delete `analyze_document` and require users to always paste document contents in as plain text from now on.


D) Add a disclaimer inside each tool's error message stating the wrong tool may have been called, shown after execution fails.

---

**2. 구간별 직독직해 번역**

**QUESTION:**  
**A tool named `analyze_content`,**  
`analyze_content`라는 이름의 도구는,  

**originally built for**  
원래 ~를 위해 만들어진  

**summarizing pasted text,**  
붙여넣은 텍스트를 요약하기  

**has its description copied**  
그 설명이 복사되었습니다  

**almost verbatim**  
거의 토씨 하나 틀리지 않고(그대로)  

**onto a newer tool, `analyze_document`,**  
더 새로운 도구인 `analyze_document`로,  

**meant for uploaded PDFs.**  
업로드된 PDF를 위한.  

**Following the pattern of renaming a tool**  
도구 이름을 변경하는 패턴을 따라서  

**to eliminate overlap,**  
중복을 제거하기 위해,  

**what should the team do?**  
팀은 무엇을 해야 합니까?  

---

**OPTIONS:**  

**Option A:**  
**Rename `analyze_content`**  
`analyze_content`의 이름을 변경합니다  

**to a more specific name,**  
더 구체적인 이름으로,  

**such as `summarize_pasted_text`,**  
`summarize_pasted_text`와 같은,  

**and limit its description**  
그리고 그 설명을 제한합니다  

**to pasted text only,**  
붙여넣은 텍스트로만,  

**while `analyze_document` handles uploaded PDFs.**  
`analyze_document`가 업로드된 PDF를 처리하는 동안.  

**Option B:**  
**Give both tools identical descriptions**  
두 도구에 동일한 설명을 제공합니다  

**but different internal function names**  
하지만 서로 다른 내부 함수 이름을  

**so backend routing can disambiguate them.**  
백엔드 라우팅이 그 모호성을 해소할 수 있도록.  

**Option C:**  
**Delete `analyze_document`**  
`analyze_document`를 삭제합니다  

**and require users to always paste**  
그리고 사용자에게 항상 붙여넣도록 요구합니다  

**document contents in as plain text**  
문서 내용을 일반 텍스트로  

**from now on.**  
이제부터는.  

**Option D:**  
**Add a disclaimer inside each tool's error message**  
각 도구의 에러 메시지 안에 경고 문구를 추가합니다  

**stating the wrong tool may have been called,**  
잘못된 도구가 호출되었을 수 있음을 명시하는,  

**shown after execution fails.**  
실행이 실패한 후에 표시되는.  

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**A번**: Rename `analyze_content` to a more specific name, such as `summarize_pasted_text`, and limit its description to pasted text only, while `analyze_document` handles uploaded PDFs.

**정답 및 해설:**  
**핵심 개념**: 도구 모호성 해소 및 명명 패턴 (Tool Disambiguation & Specific Naming)  
LLM 에이전트는 도구의 **이름(Name)**과 **설명(Description)**을 바탕으로 어떤 도구를 호출할지 판단합니다. 도구의 이름이나 설명이 중복(Overlap)되면 모델이 올바른 도구를 선택하지 못하고 오호출할 가능성이 높아집니다. 역할이 명확히 구분되도록 도구의 이름을 구체화하고 설명을 명확히 한정하는 것이 권장되는 디자인 패턴입니다.

**문제 상황 분석:**
- 텍스트 요약용 기존 도구(`analyze_content`)와 PDF 처리용 신규 도구(`analyze_document`)의 설명이 거의 동일하게 복사되었습니다.
- 기능적 대상(붙여넣은 일반 텍스트 vs 업로드된 PDF 파일)이 다름에도 명칭과 설명의 중복으로 인해 LLM이 혼란을 겪을 수 있습니다.
- "중복을 제거하기 위한 도구 명명/재정의 패턴"에 부합하는 해결책을 찾아야 합니다.

**A번이 정답인 이유:**
기존 범용 도구 이름(`analyze_content`)을 목적에 맞게 구체적인 이름(`summarize_pasted_text`)으로 변경하고, 설명 또한 "붙여넣은 텍스트 처리"로 명확히 제한하여, PDF 처리 전용 도구인 `analyze_document`와 이름/설명 상의 중복 및 모호성을 완벽히 제거할 수 있습니다.

**오답 분석:**
- Option B (오답): 두 도구의 설명을 동일하게 유지하면 LLM 프롬프트 수준에서 도구 선택 모호성이 해소되지 않으므로 백엔드 라우팅 이전에 잘못된 도구가 선택됩니다.
- Option C (오답): PDF 파일 처리라는 핵심 기능을 삭제하는 것은 사용자 경험을 떨어뜨리는 잘못된 접근 방식입니다.
- Option D (오답): 도구 호출이 이미 실패한 이후 에러 메시지에 경고를 남기는 사후 처리는 에이전트의 올바른 도구 선택 능력을 사전에 개선해주지 못합니다.

<br>

---

### 26번 문제

**1. 문제 원문**

Claude Code is asked to create a brand-new configuration file, `config/feature-flags.json`, that does not yet exist anywhere in the repository, with content fully specified by the architect in the request. Which tool should Claude use to create this file?

A) Read, followed immediately by Write, on the assumption that Write always requires a preceding Read regardless of whether the target file exists


B) Write, providing the full file path and the complete specified content, since creating a brand-new file does not require a prior read


C) Bash, using a heredoc to populate the file, on the assumption that Write cannot create files that do not already exist


D) Edit, providing an old_string that matches the contents of an empty file and a new_string containing the specified content

---

**2. 구간별 직독직해 번역**

**QUESTION:**  
**Claude Code is asked**  
Claude Code는 요청을 받습니다  

**to create a brand-new configuration file,**  
완전히 새로운 설정 파일을 생성하도록,  

**`config/feature-flags.json`,**  
`config/feature-flags.json`이라는,  

**that does not yet exist**  
아직 존재하지 않는  

**anywhere in the repository,**  
리포지토리 내 어디에도,  

**with content fully specified**  
내용이 완전히 명시된 상태로  

**by the architect in the request.**  
요청에서 아키텍트에 의해.  

**Which tool should Claude use**  
Claude는 어떤 도구를 사용해야 합니까  

**to create this file?**  
이 파일을 생성하기 위해?  

---

**OPTIONS:**  

**Option A:**  
**Read, followed immediately by Write,**  
Read 후 즉시 Write를 수행합니다,  

**on the assumption that Write**  
Write가  

**always requires a preceding Read**  
항상 이전 Read를 필요로 한다는 가정하에  

**regardless of whether**  
여부와 상관없이  

**the target file exists**  
대상 파일이 존재하는지  

**Option B:**  
**Write, providing the full file path**  
전체 파일 경로와  

**and the complete specified content,**  
지정된 전체 내용을 제공하며 Write를 사용합니다,  

**since creating a brand-new file**  
완전히 새로운 파일을 생성하는 것은  

**does not require a prior read**  
사전 읽기를 필요로 하지 않으므로  

**Option C:**  
**Bash, using a heredoc**  
heredoc을 사용하여 Bash를 사용합니다  

**to populate the file,**  
파일을 채우기 위해,  

**on the assumption that Write cannot create files**  
Write가 파일을 생성할 수 없다는 가정하에  

**that do not already exist**  
이미 존재하지 않는  

**Option D:**  
**Edit, providing an old_string**  
old_string을 제공하며 Edit을 사용합니다  

**that matches the contents of an empty file**  
빈 파일의 내용과 일치하는  

**and a new_string containing the specified content**  
그리고 지정된 내용을 포함하는 new_string을  

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**B번**: Write, providing the full file path and the complete specified content, since creating a brand-new file does not require a prior read

**정답 및 해설:**  
**핵심 개념**: Claude Code 도구 역할 구분 (`Write` vs `Edit` vs `Read`)  
Claude Code의 파일 조작 도구 중 `Write` 도구는 새 파일 생성 및 파일 전체 덮어쓰기 용도로 설계되었습니다. 완전히 새로운(brand-new) 파일을 생성할 때는 사전에 파일 내용이나 경로를 `Read`할 필요가 없으며, 전체 파일 경로와 파일에 들어갈 전체 내용만 `Write` 도구에 전달하여 즉시 파일을 생성합니다.

**문제 상황 분석:**
- 리포지토리 상에 존재하지 않는 완전히 새로운 설정 파일(`config/feature-flags.json`)을 생성하는 요청입니다.
- 파일에 들어갈 내용이 사용자/아키텍트 요청에 완전히 명시되어 있습니다.
- 사전에 파일 읽기(Read)가 필요한지, 어떤 파일 작성 전용 도구(Write/Edit/Bash)를 사용해야 하는지가 핵심입니다.

**B번이 정답인 이유:**
존재하지 않는 완전히 새로운 파일을 생성할 때는 사전 `Read` 호출 없이 `Write` 도구에 전체 파일 경로와 내용을 전달하는 것이 올바른 도구 사용 표준입니다. 기존 파일의 일부를 수정하는 경우에는 `Edit`(또는 사전 `Read` 후 작업)이 권장되지만, 신규 파일 생성 시에는 `Write`가 독립적으로 바로 수행됩니다.

**오답 분석:**
- Option A (오답): 대상 파일이 존재하지 않는 신규 생성의 경우, 사전에 `Read` 도구를 호출할 필요가 없으며 이는 불필요한 도구 호출 턴을 낭비하게 됩니다.
- Option C (오답): `Write` 도구는 이미 존재하지 않는 신규 파일을 문제없이 생성할 수 있습니다. 셸 명령어(`Bash`)로 파일 작성을 대체하는 것은 불필요한 셸 부작용을 일으킬 수 있으므로 권장되지 않습니다.
- Option D (오답): `Edit` 도구는 기존 파일 내 특정 텍스트 구간(`old_string`)을 찾아 `new_string`으로 치환할 때 사용되는 도구이며, 존재하지 않는 신규 파일 생성용 도구가 아닙니다.

<br>

---

### 27번 문제

**1. 문제 원문**

An MCP server exposes `update_inventory`. When the request body is missing the required `sku` field, the server currently returns `isError: true` with `errorCategory: "transient"` and `isRetryable: true`. An agent retries the exact same malformed request repeatedly and never succeeds. What is wrong with this error classification?

A) `isRetryable` should remain true because validation errors are inherently transient once the missing field is eventually supplied by a later, unrelated request


B) The categorization is correct as written, since the agent's repeated retries are the expected and desired behavior for any error carrying `isRetryable: true`


C) The tool should have used a JSON-RPC protocol-level error instead of a tool result, since any error involving a missing field must always be surfaced at the protocol layer


D) A missing required field is a validation error, not a transient one, so marking it retryable causes the agent to resend an identically malformed request instead of correcting the input

---

**2. 구간별 직독직해 번역**

**QUESTION:**  
**An MCP server exposes**  
MCP 서버가 노출합니다  

**`update_inventory`.**  
`update_inventory` 도구를.  

**When the request body is missing**  
요청 본문에 누락되었을 때  

**the required `sku` field,**  
필수 항목인 `sku` 필드가,  

**the server currently returns**  
서버는 현재 반환합니다  

**`isError: true`**  
`isError: true`를  

**with `errorCategory: "transient"`**  
`errorCategory: "transient"`와 함께  

**and `isRetryable: true`.**  
그리고 `isRetryable: true`를.  

**An agent retries**  
에이전트는 재시도합니다  

**the exact same malformed request**  
정확히 동일하게 잘못 형성된 요청을  

**repeatedly**  
반복적으로  

**and never succeeds.**  
그리고 결코 성공하지 못합니다.  

**What is wrong with**  
무엇이 잘못되었습니까  

**this error classification?**  
이 에러 분류에서?  

---

**OPTIONS:**  

**Option A:**  
**`isRetryable` should remain true**  
`isRetryable`은 true로 유지되어야 합니다  

**because validation errors**  
검증 에러는  

**are inherently transient**  
본질적으로 일시적이기 때문에  

**once the missing field**  
누락된 필드가  

**is eventually supplied**  
결국 제공되면  

**by a later, unrelated request**  
나중의 관련 없는 요청에 의해  

**Option B:**  
**The categorization is correct**  
분류는 올바릅니다  

**as written,**  
작성된 대로,  

**since the agent's repeated retries**  
에이전트의 반복적인 재시도가  

**are the expected and desired behavior**  
예상되고 의도된 동작이기 때문에  

**for any error carrying `isRetryable: true`**  
`isRetryable: true`를 전달하는 모든 에러에 대해  

**Option C:**  
**The tool should have used**  
도구는 사용했어야 합니다  

**a JSON-RPC protocol-level error**  
JSON-RPC 프로토콜 수준의 에러를  

**instead of a tool result,**  
도구 실행 결과 대신에,  

**since any error involving a missing field**  
누락된 필드를 포함하는 모든 에러는  

**must always be surfaced**  
항상 표출되어야 하기 때문에  

**at the protocol layer**  
프로토콜 레이어에서  

**Option D:**  
**A missing required field is a validation error,**  
필수 필드 누락은 검증(유효성) 에러입니다,  

**not a transient one,**  
일시적인(transient) 에러가 아니라,  

**so marking it retryable**  
따라서 재시도 가능으로 표시하는 것은  

**causes the agent to resend**  
에이전트가 다시 전송하게 만듭니다  

**an identically malformed request**  
동일하게 잘못 형성된 요청을  

**instead of correcting the input**  
입력을 수정하는 대신에  

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

<br>

---

### 28번 문제

**1. 문제 원문**

A team builds a single agent that handles research, drafting, fact-checking, and formatting for a report-generation pipeline. The agent is given all 18 tools used across these functions. Reviewers notice it frequently picks a plausible-but-wrong tool, or stalls comparing similar options, even though each individual tool works correctly in isolation. Which change is most likely to fix the selection accuracy problem?

A) Rewrite the 18 tool descriptions to be shorter so the model spends less time reading each one before deciding


B) Keep the single agent but raise its max_tokens limit so it has more room to reason through the tool list


C) Split the work across specialized subagents so each one is exposed to only the 4-5 tools relevant to its own role


D) Sort the 18 tools alphabetically in the tools array so the model scans them in a consistent order

---

**2. 구간별 직독직해 번역**

**QUESTION:**  
**A team builds**  
한 팀이 구축합니다  

**a single agent**  
단일 에이전트를  

**that handles research, drafting,**  
조사, 초안 작성,  

**fact-checking, and formatting**  
사실 확인, 그리고 포맷팅을 처리하는  

**for a report-generation pipeline.**  
보고서 생성 파이프라인을 위해  

**The agent is given**  
에이전트에게는 제공됩니다  

**all 18 tools used**  
사용되는 18개의 모든 도구가  

**across these functions.**  
이 이러한 기능들 전반에서  

**Reviewers notice**  
검토자들은 발견합니다  

**it frequently picks**  
에이전트가 자주 선택한다는 것을  

**a plausible-but-wrong tool,**  
그럴듯하지만 잘못된 도구를,  

**or stalls comparing**  
또는 비교하느라 지연된다는 것을  

**similar options,**  
유사한 옵션들을,  

**even though each individual tool**  
비록 각각의 개별 도구가  

**works correctly in isolation.**  
단독으로는 올바르게 작동함에도 불구하고.  

**Which change is most likely**  
어떤 변경이 가장 가능성이 높습니까  

**to fix the selection accuracy problem?**  
선택 정확도 문제를 해결할?  

---

**OPTIONS:**  

**Option A:**  
**Rewrite the 18 tool descriptions**  
18개 도구 설명을 다시 작성합니다  

**to be shorter**  
더 짧아지도록  

**so the model spends less time**  
모델이 시간을 덜 쓰도록  

**reading each one before deciding**  
결정하기 전에 각 항목을 읽는 데  

**Option B:**  
**Keep the single agent**  
단일 에이전트를 유지하되  

**but raise its max_tokens limit**  
max_tokens 제한을 늘립니다  

**so it has more room**  
더 많은 여유를 갖도록  

**to reason through the tool list**  
도구 목록을 추론할 수 있는  

**Option C:**  
**Split the work**  
작업을 분할합니다  

**across specialized subagents**  
전문화된 서브에이전트들로  

**so each one is exposed**  
각 에이전트가 노출되도록  

**to only the 4-5 tools**  
오직 4~5개의 도구에만  

**relevant to its own role**  
자신의 역할과 관련된  

**Option D:**  
**Sort the 18 tools alphabetically**  
18개 도구를 알파벳순으로 정렬합니다  

**in the tools array**  
tools 배열 내에서  

**so the model scans them**  
모델이 그것들을 스캔하도록  

**in a consistent order**  
일관된 순서로  

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**C번**: Split the work across specialized subagents so each one is exposed to only the 4-5 tools relevant to its own role

**정답 및 해설:**  
**핵심 개념**: 서브에이전트 분할 및 도구 범위 제한 (Subagent Architecture & Tool Scoping)  
단일 에이전트에 너무 많은 도구(약 10~20개 이상)를 노출하면 컨텍스트 혼란, 유사 도구 간의 오선택(Plausible-but-wrong tool selection), 추론 지연이 발생합니다. 각 역할(리서치, 작성, 검증 등)에 특화된 서브에이전트로 분할하고 각 서브에이전트에 필드에 맞는 최소한의 도구(4~5개)만 노출하면 도구 선택의 정확도와 성능이 극대화됩니다.

**문제 상황 분석:**
- 하나의 에이전트가 보고서 생성 파이프라인의 모든 단계(조사, 작성, 검증, 포맷팅)를 담당합니다.
- 전체 18개에 달하는 과도하게 많은 도구가 단일 에이전트에 한꺼번에 부여되었습니다.
- 각 도구 자체는 정상 작동하지만, 도구 선택 옵션이 너무 많아 그럴듯하지만 잘못된 도구를 선택하거나 비교 추론하느라 지연되는 문제가 발생합니다.

**C번이 정답인 이유:**
작업을 전문화된 서브에이전트(Specialized subagents)로 분할하고, 각 서브에이전트가 본인의 역할에 필요한 4~5개의 도구에만 접근하도록 제한하면 모델이 선택해야 하는 옵션의 범위가 줄어들어 도구 선택 정확도 문제를 근본적으로 해결할 수 있습니다.

**오답 분석:**
- Option A (오답): 도구 설명을 무작정 단축하면 필수 정보가 누락되어 모델이 도구의 역할을 오해할 위험이 높아지며, 도구 개수 과다로 인한 혼란을 해결하지 못합니다.
- Option B (오답): `max_tokens`를 늘리는 것은 생성할 수 있는 응답 길이를 늘려줄 뿐, 18개의 도구 후보 중 올바른 도구를 식별하는 인지적/선택적 정확도를 높여주지 못합니다.
- Option D (오답): 도구 목록을 알파벳순으로 정렬하는 것은 도구 간의 기능적 모호성이나 과도한 도구 수로 인한 인지 과부하 문제를 해결하는 데 아무런 도움이 되지 않습니다.

<br>

---

### 29번 문제

**1. 문제 원문**

A `charge_card` MCP tool receives a request with an amount field formatted as `"$45.00"` instead of a numeric type as specified by its input schema. Before the tool's handler logic even runs, how does the MCP client typically surface this failure, and how should that differ from the tool later reporting a declined charge?

A) The malformed argument triggers a JSON-RPC protocol error from schema validation before the tool executes, while a declined charge is reported inside the tool result with `isError:true`.


B) The client silently coerces the malformed argument to a number before invocation, so neither a schema validation error nor a declined charge occurs; the handler receives a valid amount, and any decline is a business result.


C) Both failures are reported inside a tool result with `isError:true`, because protocol errors are reserved for unknown tool names; all other issues, like malformed arguments or declined charges, appear as tool-level errors.


D) Both failures are reported identically as JSON-RPC protocol errors with code -32602 (Invalid params), because the client validates the request against the schema before calling the tool handler.

---

**2. 구간별 직독직해 번역**

**QUESTION:**  
**A `charge_card` MCP tool**  
`charge_card` MCP 도구가  

**receives a request**  
요청을 받습니다  

**with an amount field**  
금액(amount) 필드를 포함한  

**formatted as `"$45.00"`**  
`"$45.00"` 형태로 포맷팅된  

**instead of a numeric type**  
숫자 타입 대신에  

**as specified by its input schema.**  
입력 스키마에 지정된 바와 같이.  

**Before the tool's handler logic even runs,**  
도구의 핸들러 로직이 실행되기도 전에,  

**how does the MCP client typically surface**  
MCP 클라이언트는 일반적으로 어떻게 표출합니까  

**this failure,**  
이 실패를,  

**and how should that differ**  
그리고 그것은 어떻게 달라야 합니까  

**from the tool later reporting**  
나중에 도구가 보고하는 것과  

**a declined charge?**  
결제 거절(declined charge)을?  

---

**OPTIONS:**  

**Option A:**  
**The malformed argument triggers**  
잘못 형성된 인자는 발생시킵니다  

**a JSON-RPC protocol error**  
JSON-RPC 프로토콜 에러를  

**from schema validation**  
스키마 검증으로부터  

**before the tool executes,**  
도구가 실행되기 전에,  

**while a declined charge is reported**  
반면 결제 거절은 보고됩니다  

**inside the tool result**  
도구 실행 결과(tool result) 내부에서  

**with `isError:true`.**  
`isError:true`와 함께.  

**Option B:**  
**The client silently coerces**  
클라이언트가 자동으로(암묵적으로) 변환합니다  

**the malformed argument to a number**  
잘못된 인자를 숫자로  

**before invocation,**  
호출 전에,  

**so neither a schema validation error**  
따라서 스키마 검증 에러도  

**nor a declined charge occurs;**  
결제 거절도 발생하지 않습니다;  

**the handler receives a valid amount,**  
핸들러는 유효한 금액을 전달받고,  

**and any decline is a business result.**  
어떤 거절이든 비즈니스 결과입니다.  

**Option C:**  
**Both failures are reported**  
두 실패 모두 보고됩니다  

**inside a tool result with `isError:true`,**  
`isError:true`가 포함된 도구 실행 결과 내부에서,  

**because protocol errors are reserved**  
프로토콜 에러는 예약되어 있기 때문에  

**for unknown tool names;**  
알 수 없는 도구 이름에 대해서만;  

**all other issues,**  
다른 모든 문제들(예:  

**like malformed arguments or declined charges,**  
잘못된 인자나 결제 거절 등)은  

**appear as tool-level errors.**  
도구 수준 에러(tool-level errors)로 나타납니다.  

**Option D:**  
**Both failures are reported identically**  
두 실패 모두 동일하게 보고됩니다  

**as JSON-RPC protocol errors**  
JSON-RPC 프로토콜 에러로  

**with code -32602 (Invalid params),**  
코드 -32602 (Invalid params)와 함께,  

**because the client validates the request**  
클라이언트가 요청을 검증하기 때문에  

**against the schema**  
스키마에 대해  

**before calling the tool handler.**  
도구 핸들러를 호출하기 전에.  

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

### 30번 문제

**1. 문제 원문**

A `search_tickets` MCP tool queries a support database for tickets matching a filter. For a particular customer, the query executes successfully but zero tickets match. The tool currently returns `isError: true` with the text "No tickets found," and the coordinating agent responds to the user by apologizing for a system failure. What is the correct fix?

A) Keep `isError: true` but change errorCategory to transient so the agent automatically retries the identical search until a ticket eventually appears


B) Keep `isError: true` and add isRetryable false, since an empty result set should be treated the same as any other failed tool invocation


C) Return `isError: false` but omit the results array entirely, letting the agent infer from the missing field that the search matched nothing


D) Return `isError: false` with structured content showing an empty results array, since a successful query with no matches is not a tool execution error

---

**2. 구간별 직독직해 번역**

**QUESTION:**  
**A `search_tickets` MCP tool**  
`search_tickets` MCP 도구가  

**queries a support database**  
지원 데이터베이스를 조회합니다  

**for tickets matching a filter.**  
필터에 일치하는 티켓들을 찾기 위해  

**For a particular customer,**  
특정 고객의 경우,  

**the query executes successfully**  
쿼리가 성공적으로 실행되었으나  

**but zero tickets match.**  
일치하는 티켓이 0개입니다.  

**The tool currently returns**  
도구는 현재 반환합니다  

**`isError: true`**  
`isError: true`를  

**with the text "No tickets found,"**  
"No tickets found"라는 텍스트와 함께,  

**and the coordinating agent responds**  
그리고 코디네이팅 에이전트는 응답합니다  

**to the user**  
사용자에게  

**by apologizing for a system failure.**  
시스템 장애에 대해 사과하면서.  

**What is the correct fix?**  
올바른 해결책은 무엇입니까?  

---

**OPTIONS:**  

**Option A:**  
**Keep `isError: true`**  
`isError: true`를 유지하되  

**but change `errorCategory` to `transient`**  
`errorCategory`를 `transient`로 변경합니다  

**so the agent automatically retries**  
에이전트가 자동으로 재시도하도록  

**the identical search**  
동일한 검색을  

**until a ticket eventually appears**  
티켓이 결국 나타날 때까지  

**Option B:**  
**Keep `isError: true`**  
`isError: true`를 유지하고  

**and add `isRetryable: false`,**  
`isRetryable: false`를 추가합니다,  

**since an empty result set**  
빈 결과 집합은  

**should be treated the same**  
동일하게 취급되어야 하기 때문에  

**as any other failed tool invocation**  
다른 실패한 도구 호출과  

**Option C:**  
**Return `isError: false`**  
`isError: false`를 반환하되  

**but omit the `results` array entirely,**  
`results` 배열을 완전히 생략합니다,  

**letting the agent infer**  
에이전트가 추론하도록 만들면서  

**from the missing field**  
누락된 필드로부터  

**that the search matched nothing**  
검색 결과가 없다는 것을  

**Option D:**  
**Return `isError: false`**  
`isError: false`를 반환합니다  

**with structured content**  
구조화된 콘텐츠와 함께  

**showing an empty results array,**  
빈 결과 배열을 보여주는,  

**since a successful query**  
성공적인 쿼리는  

**with no matches**  
일치 항목이 없더라도  

**is not a tool execution error**  
도구 실행 에러가 아니기 때문에  

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