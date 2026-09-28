# Test-MCP

MCP(Model Context Protocol) 관련 문제 모음. Test1~Test6.md에서 추출.

### 출처: Test1.md
## 질문 28

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Your .mcp.json defines both a GitHub server and a coverage-analysis server. A teammate wants to add a pipeline step that activates each server separately as needed. How should you respond?

**A.** Explain that servers stay dormant until the system prompt references their tools by name, which triggers on-demand discovery.

**설명**

이는 틀렸다. 디스커버리는 시스템 프롬프트에서의 언급이 아니라 서버 연결에 의해 이루어진다. 프롬프트에서 도구 이름을 언급하는 것은 어떤 연결이나 디스커버리 동작도 일으키지 않는다. 서버가 연결되는 순간 도구들은 이미 디스커버리되어 목록화되어 있다.

**B.** Tell the teammate the agent must call a listing tool on each server mid-session to load that server's tools before it can use them.

**설명**

이는 틀렸다. tools/list 요청을 포함한 기능 디스커버리는 서버가 연결될 때 Claude Code 호스트가 수행하며, 에이전트가 세션 중간에 명시적으로 수행하는 단계가 아니다. 에이전트는 스스로 도구를 가져올 필요 없이 사용 가능한 도구 집합에서 이미 디스커버리된 도구들을 그대로 보게 된다.

**C(정답).** Explain that tools from all configured servers are discovered at connection time and available simultaneously; the agent selects among them by description.

**설명**

이것이 맞다. Claude Code가 MCP 서버에 연결되면 각 서버로 디스커버리 요청을 보내며, 연결된 모든 서버의 도구가 에이전트에게 동시에 제공된다. 별도의 활성화나 전환 단계는 필요 없다. 모델은 도구 이름과 설명을 기반으로 통합된 도구 집합 중에서 선택한다.

**D.** Advise that only one server's tools can be loaded per session, so the pipeline needs to run a separate Claude Code invocation for each configured server.

**설명**

이는 틀렸다. 세션당 서버 하나라는 제한은 존재하지 않는다. 여러 MCP 서버를 동일한 세션에서 설정하고 연결할 수 있으며, 모든 서버의 도구가 함께 사용 가능하다. 파이프라인을 여러 개의 개별 실행으로 분리하는 것은 존재하지 않는 제약을 해결하기 위해 불필요한 복잡성을 추가하는 것이다.

### 전반적인 설명

Claude Code에서 MCP 통합에 대한 사고 모델은, 디스커버리를 소유하는 주체가 에이전트가 아니라 호스트라는 것이다. 세션이 시작되면 Claude Code는 설정된 모든 서버(프로젝트 범위의 .mcp.json과 사용자 범위 설정 모두)에 연결하고, 각각에 대해 tools/list, prompts/list, resources/list와 같은 기능 디스커버리 요청을 보낸다. 그 결과들은 하나의 도구 인벤토리로 병합되며, 각 도구는 mcp__<서버명>__<도구명> 형태로 네임스페이스가 지정되어, 예를 들어 GitHub 서버의 list_issues는 mcp__github__list_issues가 된다. 모델의 관점에서는 활성 서버라는 개념이 존재하지 않는다. 디스커버리된 모든 도구는 하나의 평평한 카탈로그에 놓이며, 선택은 내장 도구와 동일한 방식으로 이름과 설명을 읽어 이루어진다.

이러한 설계 때문에 파이프라인에서의 활성화 단계는 불필요할 뿐만 아니라 오히려 역효과를 낳는다. 이미 프로토콜이 처리하고 있는 것을 통제하기 위한 오케스트레이션 로직을 추가하게 되고, 예를 들어 GitHub 서버의 풀 리퀘스트 diff와 커버리지 서버의 커버리지 리포트를 같은 리뷰에서 하나의 추론 과정 안에서 연관 짓는 것과 같이, 에이전트가 여러 서버의 도구를 결합해 사용하는 것을 막게 된다. 서버는 재연결 없이 list_changed 알림을 통해 도구 목록을 동적으로 갱신할 수도 있다.

정확히 유지해야 할 한 가지 경계는, 사용 가능함(available)과 허용됨(permitted)이 같지 않다는 점이다. 디스커버리된 MCP 도구라도 Claude가 호출하기 전에는 여전히 권한이 필요하다. 자동화된 CI 실행에서는 일반적으로 mcp__github__*와 같은 와일드카드를 포함한 allowedTools 항목을 통해 이를 처리한다. 디스커버리 및 권한 모델에 대해서는 Agent SDK MCP 문서와 Claude Code MCP 문서를 참조하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test1.md
## 질문 29

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : An engineer needs the backend MCP server to load for every teammate who clones the repository, while a prototype notification server should load only for that engineer. How should the two servers be configured?

**A.** Register both servers in ~/.claude.json and have each teammate copy the backend server entry into their own configuration manually.

**설명**

이 방식은 공유 인프라 설정을 수작업 복제 작업으로 만든다. 모든 팀원이 항목을 직접 복사해야 하고, 서버 정의가 바뀔 때마다 설정이 서로 달라진다. 버전 관리되는 .mcp.json이 존재하는 이유가 바로 클론 시점에 팀 도구가 함께 도착하도록 하기 위함이다.

**B.** List the backend server in CLAUDE.md so it loads for every teammate, and add the prototype to the project root .mcp.json.

**설명**

CLAUDE.md는 모델에게 프로젝트 맥락과 지시사항을 제공할 뿐, MCP 서버를 설정하거나 실행하지 않는다. 프로토타입을 .mcp.json에 두는 것도 필요와 정반대의 결과를 낳아, 실험용 서버를 팀 전체와 공유하게 된다.

**C(정답).** Define the backend server in a .mcp.json file at the project root checked into version control, and register the prototype in ~/.claude.json.

**설명**

정답이다. .mcp.json의 프로젝트 범위 서버는 버전 관리에 커밋되도록 설계되어 있어 모든 기여자가 동일한 MCP 도구 세트를 갖게 되고, ~/.claude.json의 사용자 범위 항목은 한 엔지니어의 계정에만 비공개로 유지된다. 결과적으로 각 서버는 정확히 필요한 대상에게만 노출된다.

**D.** Define both servers in the project root .mcp.json, labeling the prototype as experimental in its description so teammates know to ignore it.

**설명**

프로젝트 .mcp.json에 있는 것은 무엇이든 버전 관리를 통해 배포되므로, 설명에 어떤 라벨을 붙이든 프로토타입은 모든 팀원에게 로드된다. 설명은 문서화일 뿐 범위를 제한하는 메커니즘이 아니다.

### 전반적인 설명

Claude Code의 MCP 서버 설정은 위치에 따라 범위가 결정되며, 그 위치가 대상 범위를 결정한다. 프로젝트 루트의 .mcp.json에 정의된 서버는 프로젝트 범위이다. 이 파일은 버전 관리에 커밋되도록 설계되어 있어, 저장소를 클론하는 누구든 별도 설정 없이 동일한 도구 세트를 받는다. ~/.claude.json에 등록된 서버는 사용자의 홈 디렉터리에 있으며 저장소를 통해 공유되지 않으므로, 팀이 아닌 한 엔지니어에게만 귀속되어야 하는 개인용/실험용 서버에 적합한 위치이다.

이러한 구분은 의도된 설계 절충이다. 팀 도구는 코드베이스와 함께 진화하는 단일 소스가 필요하며, 이는 버전 관리 파일이 정확히 제공하는 것이다. 개인 실험은 격리가 필요하므로 미완성 프로토타입이 팀원의 세션에 절대 나타나지 않아야 한다. 프로토콜은 공유 설정의 신뢰 문제까지 고려한다. .mcp.json의 프로젝트 범위 서버는 대화형 세션에서 실행되기 전에 사용자 승인을 요구하여, 클론된 저장소가 몰래 프로세스를 실행하는 것을 막는다. 비밀 값은 .mcp.json 내부의 ${API_TOKEN}과 같은 환경변수 확장을 통해 저장소 밖에 유지된다.

다른 선택지들의 실패 양상도 같은 모델에서 비롯된다. 프로젝트 파일에 넣은 것은 무엇이든 모두에게 배포되므로, 설명 라벨로는 프로토타입의 공유를 되돌릴 수 없다. 공유 서버를 개인별 파일에 두면 자동 배포 대신 시간이 지날수록 어긋나는 수작업 복사가 된다. 그리고 CLAUDE.md는 모델에게 지시와 맥락을 제공할 뿐, MCP 서버 등록에는 아무 역할도 하지 않는다. 범위 참고 자료는 Claude Code MCP 문서와 MCP 퀵스타트를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test1.md
## 질문 35

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : The agent calls escalate_to_human on almost every billing question, even routine ones. The tool descriptions are clear and well-bounded, but the system prompt states: "billing matters are sensitive, so handle escalation with care." What should you change?

**A.** Add a hook that blocks escalate_to_human calls whenever the current conversation concerns a billing topic.

**설명**

일괄 차단은 증상만 억누르면서 정당한 에스컬레이션까지 막아버린다. 예를 들어 청구 고객이 명시적으로 상담원 연결을 요청하거나 실제 정책 공백이 있는 경우도 막히게 된다. 훅은 확고한 비즈니스 규칙을 강제하기 위한 것이지, 잘못된 프롬프트 문구를 보완하기 위한 것이 아니다.

**B(정답).** Revise the system prompt so the wording no longer pairs billing with escalation, letting the tool descriptions govern selection.

**설명**

정답이다. 잘못된 라우팅은 도구가 아니라 시스템 프롬프트에서 비롯된다. 해당 문장은 "billing"이라는 키워드를 "escalation" 개념과 언어적으로 연결시켜, 그렇지 않으면 충분히 명확한 도구 설명을 압도하는 의도치 않은 연상을 만든다. 이 연결을 제거하면 도구 설명이 다시 선택 신호로 작동하게 된다.

**C.** Expand the escalate_to_human description with billing-specific boundary language so it outweighs the system prompt phrasing.

**설명**

도구 설명은 이미 명확하고 경계가 잘 잡혀 있으므로, 여기에 텍스트를 더 추가하는 것은 잘못된 대상을 손대는 것이다. 이는 설명과 프롬프트 사이에 힘겨루기를 만드는 것일 뿐, 근본 원인인 충돌하는 연상을 제거하지는 못한다.

**D.** Append a system prompt instruction that routine billing questions must be resolved directly and never escalated at first contact.

**설명**

반대 지시를 추가해도 원래의 billing-escalation 연결은 그대로 남아있어, 이제 컨텍스트에는 신호가 없어지는 것이 아니라 서로 충돌하는 두 신호가 존재하게 된다. 잘못된 문구 위에 덧붙이는 패치는 여전히 확률적이며, 연상을 그 근원에서 제거하는 것이 신뢰할 수 있는 해법이다.

### 전반적인 설명

도구 설명은 모델이 도구를 선택하는 데 사용하는 주된 메커니즘이지만, 진공 상태에서 작동하지는 않는다. 시스템 프롬프트는 매 턴마다 도구 설명과 함께 읽히며, 그 안의 문구는 잘 작성된 설명조차 압도하는 의도치 않은 키워드 연상을 만들어낼 수 있다. "청구 문제는 민감하므로 에스컬레이션을 신중히 처리하라"와 같은 문장은 "billing"이라는 단어를 "escalation" 개념과 반복적으로 나란히 배치하여, 고객 메시지에 청구 관련 표현이 들어있을 때마다 모델이 그 도구의 설명이 실제로 뭐라고 말하든 escalate_to_human 쪽으로 밀려나게 만든다.

옳은 사고 모델은 도구 선택이 컨텍스트 안의 모든 것에 의해 형성된다는 것이며, 디버깅 질문은 항상 "실제로 나쁜 신호를 만들어내는 것은 어느 아티팩트인가?"이다. 여기서는 설명이 이미 명확하므로, 해법은 문제가 되는 프롬프트 문구를 다시 쓰는 것이다. 예를 들어 청구 문의는 일반적인 해결 흐름을 통해 처리되며 에스컬레이션은 도구 자체의 설명에 있는 기준을 따른다고 명시하는 식이다. 이렇게 하면 보완을 계속 쌓는 대신 충돌 자체를 제거하게 된다.

나머지 선택지들은 모두 증상만 다룬다. 반대 지시를 덧붙이면 billing-escalation 연결은 그대로 남고 그 위에 모순되는 규칙이 쌓이므로, 컨텍스트에는 충돌하는 신호가 남아 행동이 계속 일관되지 않게 된다. escalate_to_human 설명을 키우는 것은 한 컨텍스트 요소가 다른 요소를 목소리로 압도하도록 요구하는 것으로, 신뢰할 수 없고 토큰 오버헤드도 늘어난다. 청구 주제에서 에스컬레이션을 막는 훅은 확률적 오작동을 다른 종류의 확정적 실패로 바꿔놓는다. 명시적으로 상담원을 요청하는 고객이나 실제로 정책 범위 밖인 사례를 더 이상 에스컬레이션할 수 없게 되어, 에이전트의 에스컬레이션 의무를 직접적으로 훼손한다. 설명과 주변 컨텍스트가 도구 선택을 함께 어떻게 이끄는지는 Tool use with Claude와 Writing effective tools for agents를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test1.md
## 질문 48

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The web-search subagent requests retrieval of a paywalled source that licensing policy prohibits, and the fetch tool rejects the call. Which error response design lets the subagent handle this refusal correctly?

**A.** Return a successful result with an empty document body so the research workflow continues without any interruption.

**설명**

이는 잘 알려진 안티패턴인 오류의 침묵 억제(silent suppression)에 해당한다. 서브에이전트는 정책상의 거부와 실제로 콘텐츠가 없는 소스를 구분할 수 없으므로, 최종 보고서는 없는 내용을 지어내거나 아무 설명 없이 공백을 남기게 된다.

**B.** Set errorCategory to validation and retriable to true, so the subagent adjusts the request parameters and retries the fetch.

**설명**

이는 정책상의 거부를 수정 가능한 입력 문제로 잘못 분류하는 것이다. 요청을 어떻게 다시 작성해도 금지된 소스가 허용되지는 않으므로, retriable 플래그는 항상 거부될 규칙에 대해 헛된 재시도 루프를 유발한다.

**C(정답).** Set errorCategory to business and retriable to false, with a plain-language note explaining the licensing restriction.

**설명**

이것이 정답인 이유는 정책상의 거부가 비즈니스 오류(business error)이기 때문이다. 아무리 재시도해도 성공할 수 없으므로 retriable: false로 설정하면 낭비되는 시도를 막을 수 있다. 평이한 설명은 서브에이전트가 코디네이터에게 전달할 수 있는 자료가 되므로, 최종 보고서는 해당 소스가 왜 제외되었는지 정직하게 밝힐 수 있다.

**D.** Return the compliance engine's raw rejection payload with internal rule identifiers so no policy detail is lost.

**설명**

내부 규칙 식별자와 원본 페이로드는 모델이 실제로 활용할 수 없는 정보이며, 인용이 포함된 보고서에 노출되어서는 안 되는 내용이다. 오류 응답은 무슨 일이 일어났고 다음에 무엇을 해야 하는지를 에이전트에게 알려주어야 하며, 백엔드 내부 구조를 드러내서는 안 된다.

### 전반적인 설명

구조화된 오류 메타데이터가 존재하는 이유는 도구 호출이 실패한 순간 에이전트가 올바른 복구 결정을 내릴 수 있도록 하기 위해서다. 표준 분류 체계는 일시적 오류(백오프를 두고 재시도), 검증 오류(입력을 고쳐서 재시도), 비즈니스 오류(정책이나 규칙 위반이므로 설명만 하고 재시도하지 않음), 권한 오류(에스컬레이션)를 구분한다. 라이선스 금지는 정의상 비즈니스 오류다. 요청 형식은 올바르고 서비스도 정상이었지만, 규칙이 그 결과를 금지한 것이다. retriable: false로 표시하면 반복이 무의미하다는 것을 에이전트에게 알려주고, 평이한 설명은 대신 유용한 행동, 즉 커버리지 공백과 그 원인을 코디네이터에게 보고하도록 해 종합 보고서가 정직하고 완전하게 유지되도록 한다.

기술적으로 도구 실패는 Claude에게 문서화된 오류 플래그를 통해 전달된다. Messages API의 tool_result 블록에 있는 is_error: true, 또는 MCP 방식 도구 결과의 isError 플래그가 그것이다. errorCategory나 retriable 같은 필드는 오류 콘텐츠 내부에 넣는 애플리케이션 수준의 메타데이터다. 프로토콜은 이를 해석하지 않지만, 모델은 이를 읽고 다음 행동을 그에 맞춰 조건화한다. 이것이 바로 Anthropic의 가이드가 "Operation failed" 같은 일반적인 오류 문자열을 경고하는 이유다. 오류 메시지는 무엇이 잘못되었고 에이전트가 다음에 무엇을 시도해야 하는지 말해주어야 한다. 문서화된 오류 신호 전달 패턴은 Handle tool calls를 참고하라.

다른 대안들은 각기 복구 계약을 깨뜨린다. 거부를 검증 오류로 표시하면 입력을 고칠 수 있다고 에이전트에게 알리는 것인데, 이는 거짓이며 결코 바뀌지 않을 규칙에 대해 재작성 루프를 만들어낸다. 빈 본문을 성공으로 반환하는 것은 침묵 억제 안티패턴으로, 알려져 있고 설명 가능한 제외 사유를 이후 단계의 잘못된 정보로 바꿔버린다. 컴플라이언스 엔진의 내부 페이로드를 그대로 쏟아내는 것은 아무도 활용할 수 없는 세부사항을 보존하는 것일 뿐이다. 내부 규칙 식별자는 에이전트의 어떤 판단에도 도움이 되지 않으며, 백엔드 구조가 생성된 출력물로 유출될 위험을 안고 있다.

### 도메인

Tool Design & MCP Integration

### 출처: Test1.md
## 질문 49

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The extraction tool returns the identical message "extraction failed" whether the document store timed out or a file uses an unsupported format. The agent keeps retrying unsupported files, wasting turns. How should the tool's error responses change?

**A.** Add a system prompt instruction telling the agent to retry every failed extraction exactly once before moving on.

**설명**

일률적인 재시도 정책은 서로 다른 대응이 필요한 실패들에 동일한 복구 전략을 적용한다. 일시적 타임아웃은 성공하기까지 여러 번 재시도가 필요할 수 있는 반면, 지원되지 않는 형식은 절대 재시도해서는 안 되므로, 이 규칙은 여전히 시도를 낭비하고 복구 가능한 작업을 포기하게 만든다.

**B.** Wrap raw exception stack traces from the parser in the error message so the agent can infer whether to retry.

**설명**

스택 트레이스는 모델이 추측해야 하는 내부 구현 정보를 노출할 뿐 기계가 인식할 수 있는 재시도 신호가 아니며, 원시 트레이스로부터의 추론은 신뢰할 수 없다. 재시도 가능 여부의 판단은 실패의 의미를 알고 있는 도구 작성자가 내려서 명시적으로 전달해야 한다.

**C(정답).** Include an errorCategory and an isRetryable flag alongside a descriptive message in each error response.

**설명**

구조화된 오류 메타데이터는 에이전트가 판단 시점에 필요한 정보를 제공한다. 일시적 타임아웃은 isRetryable이 true로 전달되어 재시도되고, 지원되지 않는 형식은 isRetryable이 false로 전달되어 에이전트가 다음으로 넘어간다. 이는 절대 성공할 수 없는 실패에 대한 재시도 낭비를 직접적으로 없애준다.

**D.** Return unsupported-format failures as successful results with an empty extraction object so the agent stops retrying.

**설명**

실패를 성공으로 표시하는 것은 알려진 안티패턴인 조용한 오류 은폐다. 에이전트와 모든 다운스트림 시스템은 누락된 데이터를 정당한 빈 결과로 취급하게 되어, 감지 가능했던 실패가 잘못된 정보로 바뀌어 버린다.

### 전반적인 설명

여기서의 실패 양상은 일반적인 오류 메시지가 낳는 전형적인 결과다. 모든 실패가 똑같이 보이면 에이전트는 일시적 문제(재시도로 해결될 가능성이 높은 타임아웃)와 영구적 문제(파서가 절대 받아들이지 않을 파일 형식)를 구별할 수 없다. 이 신호가 없으면 모델은 추측에 의존하게 되고, 그 추측은 양쪽 방향 모두에서 틀리게 된다. 영구적 실패에 대한 헛된 재시도와, 복구 가능한 실패에 대한 조기 포기다.

해결책은 도구가 자신의 실패 의미에 대한 권위자가 되도록 만드는 것이다. 일반적으로 errorCategory(transient, validation, business), isRetryable 불리언, 그리고 사람이 읽을 수 있는 설명을 담은 구조화된 메타데이터를 반환하면, 재시도 결정이 확률적 추론에서 명시적 계약으로 바뀐다. 에이전트는 타임아웃에서 isRetryable: true를 읽고 백오프와 함께 재시도하고, 지원되지 않는 형식에서 isRetryable: false를 읽으면 즉시 멈추고 이를 설명하거나 다른 방식으로 문서를 처리할 수 있다. 설명 메시지는 추가로 자체 수정도 가능하게 하는데, 예를 들어 지원되는 형식을 제안하거나 대체 조회 방법을 제시할 수 있다.

다른 대안들은 모두 이 신호를 전달하지 못한다. 일괄적인 한 번 재시도 프롬프트 규칙은 서로 다른 대응이 필요한 오류 유형들에 하나의 복구 전략을 하드코딩한다. 실패를 성공한 빈 결과로 보고하는 것은 조용한 은폐로, 눈에 보이는 실패를 다운스트림 파이프라인이 신뢰할 데이터로 바꿔버린다. 원시 스택 트레이스는 모델이 해석해야 하는 산문일 뿐 신뢰할 수 있는 신호가 아니며, 에이전트가 필요로 하지도 않고 반복해서도 안 되는 내부 정보를 노출시킨다.

에이전트가 적절히 복구할 수 있도록 도구 오류를 전달하는 방법에 대해서는 MCP Tools documentation과 Anthropic's tool use overview를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test1.md
## 질문 57

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : The lookup_order tool returns the identical message "Operation failed" whether the backend timed out, the order ID was malformed, or the order belongs to a different account. The agent's recovery behavior is erratic: it sometimes retries and sometimes gives up, with no relation to the actual cause. What should you change?


**A(정답).** Return distinct error responses that state the cause, whether a retry makes sense, and what the agent should try next.

**설명**

정답이다. 에이전트의 복구 결정은 전적으로 도구 결과에 담긴 정보에 의존한다. 타임아웃이라면 재시도가 타당하고, 잘못된 형식의 ID라면 입력을 수정해야 하며, 다른 계정의 주문이라면 고객에게 확인을 요청하거나 에스컬레이션해야 한다. 이런 경우들을 구분해주는 설명적인 오류만이 에이전트가 올바른 경로를 선택하게 해준다.

**B.** Add exponential-backoff retry logic in the harness so every failed lookup_order call is retried before the agent ever sees the failure.

**설명**

일괄 재시도는 타임아웃 같은 일시적 실패에만 도움이 된다. 잘못된 형식의 주문 ID나 다른 계정 접근 거부를 재시도하는 것은 항상 실패할 호출에 시도를 낭비하는 것이며, 에이전트는 여전히 입력을 수정하거나 적절히 에스컬레이션할 정보를 받지 못한다.

**C.** Write system prompt rules describing how the agent should respond to each possible lookup_order failure mode.

**설명**

모든 실패가 동일한 문자열로 도착한다면, 원인별 대응 행동을 설명하는 지시사항은 무용하다. 에이전트는 실제로 어떤 실패 모드가 발생했는지 알 수 없기 때문이다. 빠져 있는 신호는 프롬프트가 아니라 도구 결과에 있어야 한다.

**D.** Route every lookup_order failure straight to escalate_to_human so a person handles the ambiguity.

**설명**

모든 실패를 에스컬레이션하면 에이전트가 스스로 해결할 수 있는 문제, 예를 들어 일시적 타임아웃을 재시도하거나 고객에게 주문 번호 확인을 요청하는 문제까지도 최초 접촉 해결 목표를 희생하게 된다. 에스컬레이션은 에이전트가 정말로 복구할 수 없는 실패를 위해 남겨두어야 한다.

### 전반적인 설명

에이전트의 복구 로직은 도구가 제공하는 정보만큼만 좋을 수 있다. 도구 호출이 실패하면 모델은 자신이 받은 tool_result 콘텐츠를 바탕으로 다음에 무엇을 할지 추론한다. "Operation failed" 같은 균일한 문자열은 근본적으로 서로 다른 상황들(일시적인 백엔드 타임아웃, 수정 가능한 입력 문제, 접근 거부)을 구분할 수 없는 하나의 신호로 뭉개버린다. 문제에서 보이는 불규칙한 동작은 예측 가능한 결과이다. 모델은 추측을 강요받게 되고, 그 선택은 실제 원인과 무관하게 무작위로 보인다.

Anthropic의 가이드는 이 점을 명시하고 있다. 도구 오류는 is_error: true를 포함한 tool_result 블록으로 반환하고, 오류 내용에는 무엇이 잘못되었으며 Claude가 다음에 무엇을 시도해야 하는지를 담아야 한다. 예를 들어 단순한 "failed"가 아니라 "Rate limit exceeded. Retry after 60 seconds"와 같은 식이다. 오류 범주와 재시도 가능 여부 지표 같은 구조화된 메타데이터는 복구를 정보에 기반한 결정으로 만든다. 일시적 실패는 재시도하고, 잘못된 입력은 수정하고, 접근 문제는 에스컬레이션하거나 신원을 확인한다.

다른 선택지들은 모두 잘못된 계층에서 작동하기 때문에 실패한다. 하네스 수준의 일괄 재시도는 세 가지 다른 전략이 필요한 오류 유형에 하나의 전략만 적용하며, 여전히 에이전트를 눈뜬 맹인 상태로 둔다. 실패 모드별 프롬프트 규칙은 도구 출력이 그 모드를 전혀 드러내지 않을 때는 작동할 수 없다. 모든 실패를 에스컬레이션하는 것은 실제로 무슨 일이 있었는지 알기만 하면 에이전트가 충분히 고칠 수 있는 문제에 대해서까지 최초 접촉 해결을 희생시킨다.

문서화된 오류 응답 패턴은 Handle tool calls and errors를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test2.md
## 질문 3

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : The process_refund tool rejects an out-of-window refund with isError: true, errorCategory: "business", isRetryable: false, and message: "ERR_RB_221: refund_window_check failed". The agent then tells customers an unspecified internal error occurred. What change fixes the customer communication?

**A(정답).** Include a plain-language reason in the message field, such as the order being past the returns window, that the agent can relay.

**설명**

정답이다. 플래그는 이미 에이전트에게 재시도하지 말라고 알려주지만, 메시지 내용은 에이전트가 고객에게 전달하는 데 사용하는 것이다. 내부 오류 코드는 전달할 내용을 전혀 제공하지 않으므로, 코드를 정책상의 이유를 담은 사람이 읽을 수 있는 설명으로 바꾸면 에이전트가 거부 사유를 정확히 전달할 수 있게 된다.

**B.** Set isRetryable to true so the agent retries the call and gathers additional detail before responding to the customer.

**설명**

오답이다. 반품 기한 위반은 아무리 재시도해도 바뀌지 않는 비즈니스 규칙에 의한 거부이므로, 이를 재시도 가능으로 표시하면 확정적으로 거부될 호출에 낭비되는 호출을 유발한다. 재시도한다고 추가 정보가 생기지도 않는다. 응답에는 도구가 넣은 내용만 그대로 담겨 있다.

**C.** Return the policy engine's complete rejection payload, including rule identifiers and internal thresholds, so no detail is lost.

**설명**

오답이다. 원본 내부 페이로드는 에이전트가 유용하게 활용할 수 없고 고객에게 그대로 전달해서도 안 되는 규칙 식별자와 내부 임계값을 노출한다. 목표는 최대한의 세부 정보가 아니라 에이전트의 다음 행동에 맞게 다듬어진 메시지이며, 이 경우에는 고객에게 적절한 표현으로 거부 사유를 설명하는 것이다.

**D.** Maintain a mapping of error codes to customer explanations in the system prompt so the agent can translate ERR_RB_221 itself.

**설명**

오답이다. 코드-설명 매핑 테이블을 프롬프트에 넣는 것은 도구가 이미 가지고 있는 지식을 중복시키고, 매 턴마다 토큰을 소모하며, 정책 엔진이 코드를 추가하거나 변경할 때마다 낡은 정보가 되어 어긋난다. 설명은 실패가 발생한 지점, 즉 오류 응답 자체에 있어야 한다.

### 전반적인 설명

이 상황의 오류 응답은 이미 올바른 제어 신호를 갖고 있다. isError: true는 호출이 실패했음을 표시하고, 애플리케이션 수준 메타데이터(errorCategory: "business", isRetryable: false)는 이것이 재시도해서는 안 되는 정책상의 거부임을 에이전트에게 정확히 알려준다. 빠져 있는 것은 계약의 소통 부분이다. 비즈니스 오류의 존재 목적 전체가 사용자에게 설명하는 것이므로, message 필드에는 에이전트가 전달할 수 있는 사유, 예를 들어 주문이 반품 기한을 벗어났다는 내용이 담겨야 한다. ERR_RB_221 같은 내부 코드만 있으면, 에이전트는 사유를 지어내거나 모호한 "내부 오류"로 넘어갈 수밖에 없고, 두 경우 모두 최초 접촉 해결에 해를 끼친다.

유용한 사고 모델은 도구 오류 메시지가 모델에게 다음에 무엇을 해야 하는지 알려주는 지시라는 것이다. Anthropic의 가이드는 무엇이 잘못되었고 모델이 다음에 무엇을 시도해야 하는지를 명시하는 메시지를 위해 일반적이거나 불투명한 오류를 피해야 한다고 명시한다. "failed"보다는 "Rate limit exceeded. Retry after 60 seconds"가 낫다. 일시적 오류의 경우 다음 행동은 재시도이므로 메시지는 이를 뒷받침해야 한다. 비즈니스 오류의 경우 다음 행동은 대화이므로, 메시지는 고객에게 적합한 언어로 작성되어야 한다. errorCategory와 isRetryable은 애플리케이션이 정의하는 구조화된 메타데이터이고, is_error(또는 MCP 스타일 결과에서는 isError)는 문서화된 프로토콜 수준의 실패 플래그라는 점에 유의하라. 이 두 계층은 함께 작동한다.

다른 선택지들은 각기 다른 방식으로 이 계약을 어긴다. 프롬프트 측의 코드 변환 테이블은 도구가 이미 갖고 있는 지식을 다시 만드는 것이며 조용히 낡아간다. isRetryable을 true로 바꾸는 것은 확정적인 정책 거부를 복구 가능한 것으로 잘못 표시하여 헛된 재시도를 유발한다. 원본 정책 엔진 페이로드를 그대로 전달하는 것은 세부 정보는 최대화하지만 유용성은 그렇지 않다. 내부 규칙 식별자는 에이전트가 실행할 수도 없고 고객에게 노출하기에도 적절하지 않다. 문서화된 오류 결과 구조와 유용한 오류 메시지 작성 가이드는 Handle tool calls를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test2.md
## 질문 24

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : After the system prompt was updated to instruct the agent to "process every customer issue to full resolution," logs show it initiating process_refund on billing disputes where customers only want a charge explained. What is the most direct fix?

**A.** Use tool_choice to force get_customer as the first tool call in every session so a refund cannot be the agent's opening action.

**설명**

특정 도구를 첫 호출로 강제하는 것은 시작 호출만 통제할 뿐, 에이전트는 이후 어느 턴에서든 원치 않는 환불을 시작할 수 있다. 또한 편향을 유발하는 프롬프트 문구를 제거하는 대신 모든 대화에 경직성을 더한다.

**B.** Lower the sampling temperature so the agent applies its tool selection logic more consistently across billing conversations.

**설명**

온도는 토큰 선택의 무작위성에 영향을 미칠 뿐, 이 오작동을 유발하는 의미적 연상에는 영향을 주지 않는다. 온도를 낮추면 에이전트는 동일하게 편향된 선택을 더 일관되게 적용할 뿐이며, 더 정확해지는 것은 아니다.

**C(정답).** Reword the system prompt instruction so it no longer echoes the tool name, for example "resolve every customer issue to full resolution".

**설명**

정답이다. 미션 문구 속의 "process"라는 단어가 process_refund 도구와 의도치 않은 키워드 연상을 만들어 그 도구 쪽으로 선택을 편향시킨다. 이 문구 변경 직후에 오작동이 나타났으므로, 반복된 키워드를 제거하는 것이 근본 원인을 직접 다루는 방법이다.

**D.** Expand the process_refund description with additional boundary language listing the billing situations where issuing a refund is not appropriate.

**설명**

동작 회귀는 프롬프트 업데이트 직후에 발생했으므로, 새로 도입된 문구가 개입해야 할 가장 직접적인 지점이다. 경계 문구를 추가하는 것은 프롬프트 변경이 만들어낸 키워드 연상을 제거하는 것이 아니라 그 편향을 보완하는 것일 뿐이다.

### 전반적인 설명

도구가 Messages API에 제공되면, Anthropic은 도구 정의, 도구 설정, 그리고 사용자의 시스템 프롬프트를 결합한 특별한 시스템 프롬프트를 구성한다. 따라서 모델은 도구 설명만으로 도구를 선택하는 것이 아니라 프롬프트 문구와 도구 메타데이터 사이의 상호작용을 바탕으로 선택한다. "process every customer issue"처럼 어휘가 도구 이름(process_refund)과 겹치는 지시는 요청이 다른 것을 요구하더라도 모델을 그 도구 쪽으로 조용히 밀어붙인다. 프롬프트 업데이트 직후에 오작동이 나타난 것은 새 문구가 근본 원인임을 정확히 가리킨다.

기억해둘 사고 모델은, 도구 선택이 선택 시점에 모델이 보는 모든 텍스트에 의해 조종된다는 것이다. Anthropic은 시스템 프롬프트 문구가 도구 사용을 유발하는 경계를 이동시킨다고 문서화하고 있다. "판단에 따라 사용하라"와 같은 가벼운 표현은 행동을 보수적으로 유지하고, 더 강한 행동 지향적 언어는 도구 사용을 늘린다. 키워드 반복은 같은 효과의 더 미묘한 형태이므로, 도구 변경 없이 오작동이 나타났을 때 프롬프트 어휘를 도구 이름과 대조해 검토하는 것이 표준적인 디버깅 단계이다.

다른 선택지들은 모두 원인을 놓치고 있다. 환불 도구의 설명을 확장하는 것은 반복된 키워드 자체를 제거하는 대신 프롬프트 업데이트가 만든 편향을 상쇄하기 위해 토큰을 추가하는 것이다. 회귀가 특정 문구 변경 뒤에 나타났다면, 그 문구를 수정하는 것이 가장 직접적인 첫 번째 해법이다. 온도는 샘플링의 무작위성을 조절할 뿐 의미적 연상을 조절하지 않으므로, 온도를 낮춘다고 특정 도구로의 체계적인 편향이 교정되지는 않는다. tool_choice로 get_customer를 먼저 강제하는 것은 시작 행동만 제한할 뿐, 이후 턴에서 동일한 원치 않는 환불 호출이 발생할 여지를 남기고, 모든 세션에 불필요한 고정 단계를 부과한다. Tool use overview와 How to implement tool use를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test2.md
## 질문 25

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : A coordinator agent delegates refactoring investigations (usage scans, dependency traces) to several subagents. You are auditing how subagent failures reach the coordinator. Which TWO reporting behaviors are anti-patterns to eliminate? (Select TWO.)

**A(정답).** Halting the entire investigation as soon as any single subagent reports an unrecoverable failure.

**설명**

전체 작업을 단일 실패로 중단하는 것은 안티패턴이다. 다른 모든 서브에이전트가 이미 확보한 유효한 결과를 버리게 되기 때문이다. 코디네이터는 확보한 결과로 작업을 계속하고 커버리지가 불완전한 부분을 기록해야 한다.

**B(정답).** Returning an empty result set marked as successful when a subagent's dependency scan fails midway.

**설명**

이는 침묵의 오류 은폐(silent error suppression)로, 문서화된 안티패턴이다. 코디네이터는 매치가 없는 깨끗한 성공으로 보고 해당 코드에 의존성이 없다고 결론짓게 되며, 실패가 잘못된 정보로 변질되어 이후 리팩토링 결정을 오염시킨다.

**C.** Reporting a genuinely empty match set as a successful result, distinct from a failed access attempt.

**설명**

이는 안티패턴이 아니라 올바른 동작이다. 성공적으로 실행되었지만 아무것도 찾지 못한 검색은 유효한 결과이며, 이를 접근 실패와 혼동하면 무의미한 재시도나 잘못된 경보를 유발하므로 둘은 구분 가능해야 한다.

**D.** Proceeding with results from the remaining subagents while annotating the resulting coverage gap.

**설명**

이는 전파된 실패에 대해 권장되는 코디네이터의 대응 방식이며 안티패턴이 아니다. 부족한 부분을 문서화하면서 부분 결과로 계속 진행하면 유용한 작업 결과를 보존하고 최종 출력이 자신의 한계를 정직하게 드러낼 수 있다.

### 전반적인 설명

각 서브에이전트는 자신만의 대화를 가진 별도의 에이전트 인스턴스로 실행되므로, 코디네이터는 내부적인 재시도나 도구 호출을 전혀 보지 못하고 서브에이전트의 최종 메시지만 돌려받는다. 이 격리 구조 때문에 실패 보고의 정확성이 그만큼 중요하다. 그 보고서가 코디네이터가 실제로 무슨 일이 있었는지 알 수 있는 유일한 창이기 때문이다. 이러한 컨텍스트 경계가 어떻게 동작하는지는 Claude Agent SDK의 서브에이전트 문서를 참고하라.

두 가지 행동이 이 계약을 어긴다. 침묵의 은폐, 즉 실패를 빈 결과의 성공으로 반환하는 것은 오류를 거짓 데이터로 바꾼다. 중간에 죽어버린 의존성 스캔이 의존성이 없는 모듈과 똑같이 보이게 되고, 코디네이터는 이 허구를 바탕으로 리팩토링을 계획하게 된다. 단일 실패로 전체 작업을 중단하는 것은 반대 극단이다. 하나의 분기가 실패했다는 이유로 이미 완료된 모든 조사 결과를 버리는 것인데, 올바른 대응은 부분 결과로 계속 진행하고 커버리지 공백을 주석으로 표시하는 것이다.

안티패턴이 아닌 두 가지 행동은 건강한 실패 전파의 두 축이다. 유효한 빈 결과(쿼리는 실행되었지만 매치가 없음)와 접근 실패(쿼리가 완료되지 못함)를 구분하는 것은 코디네이터에게 재시도 여부 결정이 의미가 있는지를 알려준다. 그리고 명시적인 공백 주석과 함께 부분 결과로 계속 진행하는 것은 시스템을 생산적이면서도 정직하게 유지한다. 최종 보고서는 완전함을 가장하거나 아무것도 전달하지 않는 대신, 검증된 부분과 검증되지 않은 부분을 명확히 밝힐 수 있다.

### 도메인

Tool Design & MCP Integration

### 출처: Test2.md
## 질문 33

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : The agent must invoke record_task as its first action on every request, but runs sometimes begin with a Grep call or a plain-text reply instead. Which tool_choice setting on the first request guarantees the required first step?

**A(정답).** Force the record_task tool with {"type": "tool", "name": "record_task"} on the initial request.

**설명**

특정 도구를 명시적으로 강제하는 것은 특정 도구의 실행을 보장하는 유일한 tool_choice 옵션이다. API는 모델이 record_task에 대한 tool_use 블록을 반드시 생성하도록 강제하므로, 일반 텍스트 응답과 잘못된 도구로 시작하는 경우를 모두 제거할 수 있으며, 이후 요청부터는 다시 auto로 전환할 수 있다.

**B.** Add a firm system prompt rule that record_task must always precede any other tool call.

**설명**

프롬프트 지시는 확률적으로 동작에 영향을 미친다. 준수 가능성을 높일 뿐 순서를 보장하지는 못한다. 시나리오에서 이미 모델이 이 단계를 건너뛰는 모습을 보여주고 있으며, 보장을 위해서는 문구를 강화하는 것이 아니라 API 수준의 제약이 필요하다.

**C.** Strengthen the record_task description to state it runs before all other tools in every session.

**설명**

설명(description)은 모델이 여러 도구 중 하나를 선택할 때 도구 선택을 안내하지만, 기본값인 auto 설정에서는 모델이 여전히 일반 텍스트로 응답하거나 다른 도구를 먼저 사용할 수 있다. 설명은 선택 품질을 높일 뿐 실행 순서를 강제하지는 못한다.

**D.** Set tool_choice to {"type": "any"} on the initial request so a tool call is guaranteed.

**설명**

any 설정은 어떤 도구든 호출되는 것을 보장하지만, 어떤 도구를 호출할지는 여전히 모델이 선택한다. Grep 등 다른 내장 도구가 여전히 목록에 남아 있으므로, 실행이 record_task가 아니라 검색으로 시작될 수 있으며, 이는 실제로 관찰된 실패 사례 중 하나에 해당한다.

### 전반적인 설명

tool_choice 매개변수는 도구 호출에 대해 하니스에 세 단계의 제어 수준을 제공한다. auto(도구가 제공될 때의 기본값)는 클라우드가 도구를 호출할지 여부 자체를 결정하도록 두므로, 실행이 일반 텍스트 응답으로 시작될 수 있는 이유가 여기에 있다. any는 이를 "도구가 반드시 호출되어야 한다"로 조여주지만 어떤 도구를 호출할지는 여전히 모델의 선택에 맡기므로, Grep이 먼저 실행되는 상황이 여전히 발생할 수 있다. 강제 지정 형태인 {"type": "tool", "name": "record_task"}만이 두 결정을 모두 고정한다. 즉 도구가 호출될 것이며, 그것이 바로 그 도구가 된다. 이는 로깅이나 메타데이터 추출 단계처럼 다른 무엇보다 먼저 실행되어야 하는 실행 순서를 보장하기 위한 공식적으로 문서화된 메커니즘이다.

여기서 핵심적인 사고 모델은, 프롬프트와 도구 설명은 확률 분포를 형성할 뿐이고, tool_choice는 출력 공간 자체를 제약한다는 점이다. 어떤 단계가 필수적일 때(컴플라이언스 로깅, 신원 확인, 필수 초기 추출 등) 그 제약은 API 수준에 있어야 하며, 문구 변경은 단지 건너뛸 가능성을 낮출 뿐이다. 알아둘 만한 트레이드오프 하나는, tool_choice가 any이거나 특정 도구로 강제될 때 API는 도구 사용을 강제하기 위해 어시스턴트 메시지를 사전에 채워 넣으므로, 모델은 도구 호출 전에 자연어 서두를 생성하지 않는다는 점이다. record_task 같은 조용한 기록 단계에서는 이것이 문제가 되지 않으며, 이후 턴에서 loop를 다시 auto로 전환하면 에이전트는 완전한 유연성을 되찾는다.

forced-tool 구문과 응답 텍스트와의 상호작용을 포함한 tool_choice의 전체적인 동작 방식은 도구 사용 구현에 관한 공식 가이드를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test2.md
## 질문 43

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : The team wants a shared ticketing MCP server available to every engineer on the project, but the server needs an API token that must never be committed. Which TWO configuration steps are correct? (Select TWO.)

**A(정답).** Add the server entry to .mcp.json at the project root and check that file into version control.

**설명**

프로젝트 범위(project-scoped) MCP 설정은 리포지토리 루트의 .mcp.json에 위치하며, 이 파일을 커밋하는 것이 설계된 배포 방식이다. 리포지토리를 pull하는 모든 기여자는 동일한 서버 정의를 자동으로 얻게 된다. 이는 팀 공용 도구를 위해 의도된 범위 그 자체이다.

**B.** Have each engineer add the server to ~/.claude.json and follow setup steps documented in the team wiki.

**설명**

사용자 수준의 ~/.claude.json 파일은 개인적이고 실험적인, 한 개인에게만 국한되는 서버를 위한 것이다. 위키 안내를 통해 공용 서버를 수동으로 복제하면 서버 정의가 변경될 때마다 설정이 제각각 어긋나게 되며, 이는 버전 관리되는 팀 설정의 목적 자체를 무력화한다.

**C.** Paste each engineer's token value directly into the committed .mcp.json since the repository is private.

**설명**

실제 자격 증명을 커밋하는 것은 리포지토리 공개 범위와 무관하게 보안 안티패턴이다. 비밀 값은 git 히스토리에 영구히 남고, 리포지토리에 접근 권한이 있는 누구에게나 노출되며, 엔지니어별로 다르게 설정할 수도 없다. 환경 변수 확장(expansion) 기능이 존재하는 이유가 바로 이것을 막기 위해서다.

**D(정답).** Reference the token in the env block as ${TICKETS_TOKEN}, expanded from each engineer's environment.

**설명**

.mcp.json은 환경 변수 확장을 지원하므로, 커밋되는 파일에는 자리표시자(placeholder)만 담기고 실제 비밀 값은 각 엔지니어가 자신의 환경을 통해 제공한다. 이렇게 하면 자격 증명을 버전 관리에서 배제하면서도 공용 설정은 완전히 정상적으로 동작한다.

### 전반적인 설명

Claude Code의 MCP 서버 설정은 서버가 의도하는 대상 범위에 그대로 대응되는 스코프 모델을 따른다. 팀 전체가 공유해야 하는 서버는 프로젝트 범위, 즉 리포지토리 루트의 .mcp.json 파일에 속하며 버전 관리에 커밋되어 코드베이스와 함께 이동한다. 한 사람만 실험하는 서버는 사용자 범위(~/.claude.json)에 속하며, 이 파일은 리포지토리에 전혀 관여하지 않는다. 올바른 범위를 선택하는 것은 단순한 형식 문제가 아니다. 이는 팀원들이 클론 시점에 도구를 자동으로 얻는지, 아니면 직접 손으로 재구성해야 하는지를 결정한다.

공용 설정에서의 긴장 지점은, 유용한 서버는 대체로 자격 증명이 필요한데 버전 관리는 자격 증명이 절대 들어가서는 안 되는 곳이라는 점이다. 이를 해결하는 메커니즘이 환경 변수 확장이다. 커밋되는 파일은 ${TICKETS_TOKEN}을 참조하고, Claude Code는 로드 시점에 각 엔지니어 자신의 값으로 이를 대체한다. 설정의 구조는 공유되지만, 비밀 값은 공유되지 않는다. 이는 또한 모두가 하나의 자격 증명을 공유하는 대신 각자 자신의 권한 범위에 맞는 토큰을 보유할 수 있다는 의미이기도 하다.

토큰을 커밋되는 파일에 하드코딩하면 이 분리가 깨진다. 비밀 값이 git 히스토리에 영구히 남고, 프라이빗 리포지토리는 접근 권한 부여, 포크, CI 미러 등에 따라 변할 수 있는 약한 경계에 불과하다. 위키 안내를 통해 서버를 각 엔지니어의 ~/.claude.json에 밀어넣는 방식은 스코프 모델을 뒤집는다. 공용 인프라가 수동적이고 어긋나기 쉬운 잡무가 되어버리고, 서버 정의가 바뀔 때마다 모든 엔지니어가 이를 알아채고 자신의 파일을 갱신해야 한다. 범위 및 설정에 관한 자세한 내용은 MCP를 통해 Claude Code를 도구에 연결하기 문서를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test2.md
## 질문 46

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : During each pull request review, the agent spends several tool calls listing available lint rule sets, database schemas, and API documentation pages before it examines any code. Which design change best reduces this discovery overhead?

**A(정답).** Publish the lint rule index, schema listings, and documentation hierarchy as MCP resources the agent reads directly.

**설명**

MCP 리소스는 스키마, 문서, 인덱스와 같은 읽기 가능한 컨텍스트 데이터를 노출하기 위해 프로토콜이 설계한 기본 요소다. 에이전트는 반복적인 탐색성 도구 호출을 통해 카탈로그를 재구성하는 대신 직접 읽을 수 있으며, 이는 각 리뷰 시작 시점의 디스커버리 오버헤드를 줄여준다.

**B.** Raise the per-review tool-call budget so the discovery phase can complete before the review's turn limit is reached.

**설명**

예산을 늘리는 것은 비효율을 제거하는 대신 그 비용을 지불하는 것이다. 매 리뷰마다 동일한 카탈로그를 다시 디스커버리하는 데 호출과 컨텍스트를 계속 소모하게 되며, 이는 파이프라인을 느리게 만들고 실제 코드 분석에 사용할 컨텍스트를 줄인다.

**C.** Hard-code the current lint rules, schema names, and documentation index into CLAUDE.md so they load with every session.

**설명**

CLAUDE.md 안의 정적 콘텐츠는 린트 규칙, 스키마, 문서가 변경되는 순간 오래된 정보가 되어, 잘못된 리뷰를 다시 불러들인다. 또한 그 리뷰에 필요하든 아니든 매 요청에 카탈로그 데이터를 부풀린다.

**D.** Add a list_available_inventory tool that the agent must call once per review to fetch the full catalog in one response.

**설명**

이는 MCP 리소스가 읽기 가능한 데이터를 노출하기 위한 일급 기본 요소로서 이미 제공하는 것을 맞춤형 도구로 다시 만드는 것이다. 또한 리소스가 이런 종류의 카탈로그를 드러내기 위해 프로토콜이 설계한 메커니즘임에도, 선택 공간에 또 하나의 도구를 추가하는 셈이 된다.

### 전반적인 설명

Model Context Protocol은 에이전트를 백엔드 시스템에 연결하기 위한 두 가지 상호 보완적인 기본 요소를 정의한다. 도구는 POST 엔드포인트처럼 동작을 수행하고, 리소스는 GET 엔드포인트처럼 읽기용 데이터를 노출한다. 린트 규칙 인덱스, 데이터베이스 스키마, 문서 계층 구조와 같은 콘텐츠 카탈로그는 정확히 리소스가 노출하기 위해 존재하는 종류의 컨텍스트 데이터다. 매 리뷰 시작 시 일련의 탐색성 도구 호출을 통해 무엇이 존재하는지 탐침하는 대신, 에이전트는 그 카탈로그를 리소스로 읽어 디스커버리를 크게 줄일 수 있다.

사고 모델은, 에이전트가 실제 작업을 하기 전에 반복적으로 탐침하는 모든 것이 리소스의 후보라는 것이다. 카탈로그가 얼마나 최신 상태인지는 서버가 그 리소스를 어떻게 구현하는지에 달려 있지만, 이를 최신으로 유지하는 것은 프롬프트 유지보수의 부담이 아니라 서버 측의 관심사가 된다. 이것이 CLAUDE.md에 인벤토리를 박아 넣는 것에 비해 갖는 핵심적인 장점이다. CLAUDE.md는 시간이 지나면서 오래되고, 카탈로그가 필요하든 아니든 매 세션에 토큰 부담을 더한다. 동일한 기능을 맞춤형 인벤토리 도구로 감싸는 것은 기계적으로는 동작하지만, 프로토콜의 기본 요소를 중복시키고 모델이 선택해야 할 도구 목록을 늘려서 선택 신뢰도 자체를 떨어뜨린다. 단순히 도구 호출 예산을 늘리는 것이 가장 약한 선택이다. 이는 지연 시간과 컨텍스트 공간이 리뷰 품질과 처리량에 직접 영향을 미치는 CI 환경에서 낭비되는 호출에 보조금을 지급하는 것과 같다.

CI/CD 파이프라인에서는 이것이 두 배로 중요하다. 정적 카탈로그를 다시 디스커버리하는 데 소비되는 모든 토큰은 diff를 분석하는 데 사용할 수 없는 컨텍스트이며, 매 추가 왕복은 풀 리퀘스트에 대한 피드백 루프를 늘린다. MCP Resources와 Connect Claude Code to tools via MCP를 참조하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test2.md
## 질문 53

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline's automated reviews use a GitHub MCP server that requires a personal access token. The server configuration must reach every contributor and CI runner through version control. How should the token be handled?

**A(정답).** Reference the token as ${GITHUB_TOKEN} in the project .mcp.json and export the variable in CI and on developer machines.

**설명**

이것이 문서화된 패턴이다. .mcp.json은 ${GITHUB_TOKEN}과 같은 환경 변수 확장을 지원하므로, 공유 설정 파일을 커밋하면서도 각 환경이 자신만의 비밀 값을 제공할 수 있다. CI 시스템은 토큰을 파이프라인 변수로 주입하고, 개발자는 로컬에서 이를 설정하므로 자격 증명이 버전 관리에 들어가는 일이 결코 없다.

**B.** Configure the server and its token in ~/.claude.json on each contributor machine and CI runner, documenting the setup steps.

**설명**

사용자 수준의 ~/.claude.json은 개인용 및 실험용 서버를 위한 것이며, 팀 공유 인프라를 위한 것이 아니다. 모든 기여자와 러너가 설정을 수동으로 복제하도록 요구하면 드리프트가 발생하고, 팀이 필요로 하는 버전 관리 기반 배포를 포기하게 된다.

**C.** Paste the token directly into the project .mcp.json, since the repository is private and only contributors can read it.

**설명**

실제 자격 증명을 버전 관리에 커밋하는 것은 저장소의 가시성과 무관하게 보안 안티패턴이다. 토큰은 git 히스토리에 계속 남아, 현재와 미래의 모든 기여자에게 노출되며, 안전하게 교체하려면 히스토리를 다시 작성해야 한다.

**D.** Store the token in CLAUDE.md so it is loaded into context on every session and available whenever the server needs it.

**설명**

CLAUDE.md는 모델에게 프로젝트 지침을 제공하는 것이며 서버 설정이 아니므로, MCP 서버는 이런 방식으로는 자격 증명을 결코 받을 수 없다. 이는 또한 비밀 값을 커밋된 파일에 두고, 모든 요청에서 모델 컨텍스트에 노출시키는 셈이 된다.

### 전반적인 설명

Claude Code의 프로젝트 수준 .mcp.json은 팀이 MCP 서버 설정을 버전 관리를 통해 배포할 수 있도록 존재한다. 이 파일은 저장소 루트에 위치하며 다른 설정 파일처럼 커밋된다. 이는 자격 증명과 명백한 긴장 관계를 만들고, 환경 변수 확장은 이를 해결하기 위해 설계된 메커니즘이다. ${GITHUB_TOKEN}과 같은 자리표시자가 비밀 값 대신 커밋되고, Claude Code는 실행 시점에 환경에서 이를 확장한다. 확장은 command, args, env, url, headers 필드에서 동작하며, ${VAR:-default} 형태는 변수가 설정되지 않았을 때 대체값을 제공한다.

이 설계는 CI/CD에 특히 잘 맞는다. 파이프라인은 토큰을 보호된 파이프라인 변수로 주입하고, 개발자는 이를 로컬에서 export하며, 하나의 커밋된 파일이 양쪽에서 동일하게 동작한다. 자격 증명을 교체한다는 것은 git 히스토리를 다시 쓰는 것이 아니라 환경을 업데이트하는 것을 의미한다.

각 대안은 요구사항의 한쪽 측면을 깨뜨린다. 토큰을 하드코딩하면 공유 요구는 충족되지만 비밀 값이 저장소에 영구적으로 유출된다. 서버를 ~/.claude.json으로 옮기면 비밀 값은 저장소 밖에 두지만 버전 관리 기반 배포를 희생하게 된다. 그 파일은 개인용, 실험용 서버를 위한 범위이며, 머신별 수동 설정은 동기화에서 벗어나게 된다. CLAUDE.md는 모델에게 지침을 제공하는 컨텍스트 파일이며 MCP 서버 설정에는 아무런 역할을 하지 않는다. 따라서 그곳에 토큰을 두면 아무것도 설정되지 않으면서 커밋되어 컨텍스트에 노출되는 두 가지 문제가 동시에 발생한다.

확장 문법과 지원되는 필드에 대해서는 Claude Code MCP 문서를 참조하고, ${API_KEY} 형태의 자리표시자를 사용하는 예시는 Agent SDK MCP 문서를 참조하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test2.md
## 질문 59

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline's .mcp.json configures three MCP servers: GitHub, Jira, and a coverage analyzer. Which TWO configuration steps should the team take so the servers' tools are usable in unattended review runs? (Select TWO.)

**A.** Defer each server's connection until the model first requests one of its tools, so tool catalogs load lazily on demand.

**설명**

이는 MCP 디스커버리가 동작하는 방식이 아니다. 서버는 미리 연결되며, Claude Code는 서버가 연결되는 즉시 tools/list와 같은 디스커버리 요청을 보낸다. 따라서 도구 카탈로그는 최초 사용 시점이 아니라 연결 시점에 수집된다. 요청별로 지연 연결되는 모드는 설정할 수 있는 것이 존재하지 않는다.

**B(정답).** Write permission rules using the namespaced form mcp____, which keeps same-named tools distinct.

**설명**

이것이 올바른 접근 방식이다. Claude Code는 모든 MCP 도구 앞에 서버 이름을 붙인다. 예를 들어 mcp__github__list_issues처럼. 따라서 권한 규칙은 이 네임스페이스가 지정된 형태를 사용해야 하며, 기저의 이름이 동일하더라도 서로 다른 서버의 도구들이 충돌하는 일은 결코 없다. 이 네임스페이스 부여는 또한 권한 설정에서 mcp__github__*와 같은 와일드카드 패턴을 가능하게 한다.

**C(정답).** Pre-approve the tools the pipeline needs through allowedTools entries, since unattended runs cannot answer interactive prompts.

**설명**

이것이 올바른 접근 방식이다. 사용 가능함과 허용됨은 별개의 관심사다. 디스커버리는 도구를 모델에게 보이게 만들지만, Claude가 호출하기 전에는 MCP 도구에 명시적인 승인이 필요하다. 헤드리스 CI 실행에는 프롬프트를 승인할 사람이 없으므로, allowedTools(또는 와일드카드 패턴)가 미리 그 호출을 승인해 두어야 한다.

**D.** Rename any tools that share a name across servers so Claude Code does not merge them into one deduplicated definition.

**설명**

이 단계는 불필요하다. 병합은 일어나지 않기 때문이다. 서버 이름 접두사는 이름이 중복되더라도 모든 도구를 구분되게 유지한다. 각 서버의 도구는 이름을 바꾸지 않아도 독립적으로 참조되고 독립적으로 권한이 부여된 상태를 유지한다.

### 전반적인 설명

Claude Code가 세션을 시작하면, 설정된 모든 MCP 서버에 연결하고 기능 디스커버리를 실행하며, 연결되는 각 서버에 tools/list, prompts/list, resources/list와 같은 요청을 보낸다. 그 결과는 하나의 통합된 카탈로그다. 연결된 모든 서버의 도구가 동시에 사용 가능해지고, 모델은 이름과 설명을 기반으로 그중에서 선택한다. 모델의 첫 요청에 의해 촉발되는 지연 방식의 온디맨드 연결은 존재하지 않으며, 이름이 비슷한 도구들의 병합도 일어나지 않는다.

이 통합 카탈로그를 실제로 동작하게 만드는 두 가지 메커니즘이 있다. 첫째는 네임스페이스 부여다. 모든 MCP 도구는 mcp__<서버명>__<도구명> 형태로 노출되므로, github 서버의 list_issues는 mcp__github__list_issues가 되고, 자체적으로 list_issues를 노출하는 두 번째 서버가 있더라도 결코 충돌하지 않는다. 둘째는 사용 가능함과 허용됨의 분리다. 디스커버리는 도구를 보이게만 만든다. Claude가 실제로 MCP 도구를 호출하기 전에는 대화형으로든, 아니면 mcp__github__*와 같은 와일드카드로 한 서버의 모든 것을 자동 승인할 수 있는 allowedTools와 같은 설정을 통해서든 권한이 부여되어야 한다. 이 분리는 무인 실행이 이루어지고 사전 승인되지 않은 도구는 아예 호출될 수 없는 CI에서 가장 중요해진다.

이 설계는 예측 가능성을 얻기 위해 약간의 사전 연결 작업을 대가로 지불한다. 에이전트는 매 턴을 자신의 전체 도구 집합을 알고 시작하며, 운영자는 그중 정확히 어떤 부분 집합을 사용할 수 있는지를 통제한다. 디스커버리, 네이밍, 권한에 대한 세부 사항은 MCP in the Agent SDK와 Connect Claude Code to tools via MCP를 참조하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test3.md
## 질문 4

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : When engineers ask Claude Code debugging questions about this repository, it frequently answers from general knowledge without reading any project files, and those answers are often wrong. Which change most directly increases its tendency to investigate before answering?

**A.** Lower the sampling temperature so the decision to read files becomes deterministic rather than probabilistic.

**설명**

이는 오답이다. 온도(temperature)는 지원되는 맥락에서 토큰 선택의 무작위성을 조절하는 샘플링 파라미터일 뿐, 질문이 조사를 필요로 하는지에 대한 모델의 판단을 바꾸지 않는다. 일반 지식으로 답하려는 경향이 있는 모델은 낮은 온도에서도 똑같이 그렇게 행동하며, 그 경향 자체는 프롬프트 문구를 통해 바꿔야 한다.

**B.** Rewrite the Read and Grep tool descriptions to clarify when each applies, since descriptions drive tool selection.

**설명**

이는 오답이다. 설명(description)은 여러 도구가 후보일 때 어느 것을 고를지 결정하는 데 주로 쓰인다. 여기서 문제는 모델이 도구를 전혀 사용하지 않는다는 것으로, 이는 라우팅 문제가 아니라 경향성(propensity) 문제다. 또한 빌트인 도구의 설명은 팀이 Claude Code 설정의 일부로 편집할 수 있는 대상도 아니다.

**C(정답).** Add an instruction to CLAUDE.md directing Claude to use its tools to inspect the relevant code before responding.

**설명**

이는 정답이다. 모델이 직접 답하는 대신 도구를 호출하기로 결정하는 기준점은 프롬프트 문구를 통해 조정 가능하다고 문서화되어 있다. 응답 전에 도구로 조사하라는 식의 지시는 도구 사용을 늘리며, CLAUDE.md는 Claude Code 세션에 로드되는 지속적인 프로젝트 지시를 제공하므로 팀 전체에 걸친 행동 조정을 넣기에 적절한 위치다.

**D.** Set tool_choice to {"type": "any"} so the model must emit a tool call on every turn before it can produce an answer.

**설명**

이는 오답이다. 매 턴마다 도구 호출을 강제하는 것은 모델이 평범한 텍스트 답변을 절대 내놓지 못하게 막는 무딘 방식이며, 에이전트 루프의 정상적인 답변 전달 단계를 깨뜨린다. 또한 이는 팀이 Claude Code 동작을 조정하는 데 쓰는 설정 계층이 아니라 Messages API 계층에서 동작하는 것이다.

### 전반적인 설명

기본값인 tool_choice: {"type": "auto"} 아래에서 모델은 매 턴마다 요청이 어떤 도구가 설명하는 능력에 대응되는지, 그리고 답이 이미 컨텍스트에 있는지를 따져 도구를 호출할지 직접 답할지를 결정한다. 이 결정 경계는 고정되어 있지 않다. Anthropic은 이것이 시스템 프롬프트 문구를 통해 조정 가능하다고 문서화하고 있다. "응답 전에 도구로 조사하라"와 같은 가벼운 지시는 도구 사용을 늘리고, 더 강한 문구는 그 효과를 더 밀어붙이며, "판단에 따라 하라"는 식의 문구는 행동을 보수적으로 유지시킨다. 에이전트가 조사를 충분히 하지 않을 때 가장 효과적인 해법은 명시적인 경향성 지시이며, Claude Code에서는 CLAUDE.md가 그런 지시를 두는 자연스러운 자리다. CLAUDE.md는 Claude Code 세션 시작 시 로드되는 지속적인 프로젝트 메모리 역할을 하므로, 그 조정이 해당 레포지토리에서의 팀 전체 작업에 균일하게 적용된다.

새겨둘 만한 사고 모델은, 도구 동작이 도구 정의, 도구 설정, 호출자의 시스템 프롬프트를 조합해 API가 구성하는 전체 프롬프트에 의해 형성된다는 점이다. 따라서 도구 메타데이터와 지시 문구 둘 다 중요하지만, 이들은 서로 다른 실패 모드를 해결한다. 설명과 이름은 라우팅이 모호할 때 어느 도구를 고를지를 결정하고, 프롬프트 문구는 도구를 애초에 사용할지 여부를 바꾼다. 여기서 Read와 Grep의 설명을 다시 쓰는 것은 잘못된 실패 모드를 겨냥한 것이며, 어차피 빌트인 도구 설명은 팀이 편집할 수 있는 대상이 아니다. tool_choice: {"type": "any"}를 강제하면 최종 텍스트 답변을 내놓아야 할 턴을 포함해 매 턴마다 도구 호출을 보장하게 되어, 미묘한 조정 문제를 깨진 루프로 바꿔버린다. 온도를 낮추는 것은, 그 샘플링 파라미터가 지원되는 경우라도 토큰 선택의 변동성만 바꿀 뿐 언제 조사가 필요한지에 대한 모델의 판단은 바꾸지 않는다. Tool use overview와 How to implement tool use를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test3.md
## 질문 26

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : An engineer wants to test an experimental build of the team's extraction MCP server in one project only, while teammates keep loading the shared version from the project's .mcp.json. Which configuration approach achieves this?

**A.** Register the experimental server at user scope under the same name, keeping it private while remaining outside version control.

**설명**

사용자 스코프는 비공개이지만 이 프로젝트뿐 아니라 머신의 모든 프로젝트에 적용된다. 또한 우선순위 순서에서 프로젝트 스코프보다 하위에 위치하므로, 공유된 .mcp.json 정의가 이 프로젝트에서는 여전히 우선하게 되어 실험용 빌드가 이곳에서는 로드되지 않는다.

**B(정답).** Add the experimental server at local scope under the same name, letting it shadow the shared project definition on this machine only.

**설명**

정답이다. 로컬 스코프는 사용자 홈 디렉터리의 ~/.claude.json 안에 현재 프로젝트 항목으로 저장되며, 비공개로 유지되고 이 프로젝트에만 적용된다. 동일한 이름의 서버에 대해 로컬 스코프가 프로젝트 스코프보다 우선순위가 높으므로, 실험용 빌드는 이 머신에서만 적용되고 팀원들은 계속 공유된 .mcp.json 정의를 로드하게 된다.

**C.** Edit the project's .mcp.json to point at the experimental build, planning to revert the file before committing any changes.

**설명**

버전 관리되는 팀 공유 파일을 수정하면 실험용 설정이 실수로 커밋될 위험을 한 걸음 남겨두게 된다. 스코프 시스템은 개인적인 오버라이드가 공유 기준선을 건드릴 필요가 없도록 존재하므로, 이 수동 수정 후 되돌리기 방식은 불필요하고 위험하다.

**D.** Add the experimental server under a new name to .mcp.json and note in CLAUDE.md that this project should prefer the experimental tools.

**설명**

이 방식은 실험용 서버 설정을 공유 파일에 커밋하여 모든 팀원에게 노출시키고, 그 후 확률적인 프롬프트 안내에 의존해 도구 선택을 조정한다. 스코프 기반 섀도잉은 팀이 보는 것을 전혀 바꾸지 않고도 동일한 문제를 결정론적으로 해결한다.

### 전반적인 설명

Claude Code는 엄격한 스코프 우선순위 순서로 MCP 서버 설정을 해석한다. 로컬 스코프가 프로젝트 스코프보다 우선하고, 프로젝트 스코프가 사용자 스코프보다 우선한다(그 뒤로 플러그인이 제공하는 서버와 커넥터가 이어진다). 동일한 서버 이름이 여러 스코프에 나타나면 가장 높은 우선순위의 정의만 사용되며, 정의들이 필드 단위로 병합되는 일은 없다. 이 설계는 개발자가 팀의 공유 서버를 개인용 빌드로 일시적으로 섀도잉할 수 있게 해주며, 이것이 바로 공유 도구의 변경 사항을 테스트하기 위한 의도된 작업 방식이다.

핵심 모델은 각 스코프가 서로 다른 대상을 위해 존재한다는 것이다. 저장소 루트에 있는 프로젝트 수준의 .mcp.json은 버전 관리에 커밋되어 팀의 기준선을 정의한다. 로컬 스코프(~/.claude.json 안에 현재 프로젝트 항목으로 저장됨)는 한 사용자와 한 프로젝트에만 비공개로 적용되며, 실험용 설정을 위한 권장 위치가 된다. 사용자 스코프는 비공개이지만 머신의 모든 프로젝트에 적용된다. 로컬이 프로젝트보다 우선하므로, 엔지니어의 실험용 추출 서버는 그 사람의 머신에서 이 프로젝트에만 적용되고, 팀원들은 영향 없이 .mcp.json의 공유 정의를 계속 로드한다.

나머지 대안들은 모두 이러한 경계 중 하나를 깨뜨린다. 커밋된 .mcp.json을 수정하는 것은 되돌리기를 잊는 순간 개인 실험이 팀 전체의 문제가 되게 만든다. 사용자 스코프는 두 가지 이유로 실패한다. 실험이 다른 모든 프로젝트로 유출되며, 우선순위가 낮아 테스트를 의도했던 이 프로젝트에서조차 프로젝트 정의가 여전히 우선한다. 공유 파일 안에서 서버 이름을 바꾸고 CLAUDE.md로 선택을 조정하는 방식은 실험용 인프라를 저장소에 커밋하고, 결정론적 설정 메커니즘을 프롬프트 안내로 대체해버린다. 전체 우선순위 규칙과 스코프 설명에 대해서는 Claude Code MCP documentation을 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test3.md
## 질문 33

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : Your team's MCP tool for querying the internal package registry returns the string "Error occurred" for both expired credentials and brief registry outages. The agent retries credential failures repeatedly and gives up during outages. What should the tool do on failure instead?

**A.** Return a successful result with an empty payload during outages, letting the agent continue without interruption.

**설명**

실패를 성공으로 표시하는 것은 침묵의 오류 은폐라는 잘 알려진 안티패턴이다. 에이전트는 빈 페이로드를 유효한 답으로 취급하게 되어(예: 패키지가 존재하지 않는다고 결론짓는 등) 복구 가능한 장애를 잘못된 정보로 바꿔버린다.

**B.** Keep the same generic message and add a system prompt rule to retry every failed call twice before escalating.

**설명**

포괄적인 재시도 정책은 서로 다른 대응이 필요한 오류 유형에 하나의 복구 전략만을 적용한다. 만료된 자격 증명 실패를 재시도하는 것은 무의미하며, 장애 상황에서는 두 번의 재시도가 너무 적거나 불필요할 수 있다. 문제는 도구 경계에서 정보가 빠져 있다는 것이며, 프롬프트 규칙으로는 그 정보를 공급할 수 없다.

**C(정답).** Return an errorCategory field (transient or permission), an isRetryable boolean, and a brief plain-language message.

**설명**

이는 정답이다. 구조화된 오류 메타데이터는 결정 시점에 에이전트가 필요로 하는 신호를 제공한다. isRetryable이 true인 일시적 오류는 백오프와 함께 재시도되고, isRetryable이 false인 권한 오류는 계속 반복 호출하는 대신 에스컬레이션된다. 사람이 읽을 수 있는 메시지는 에이전트가 실패 상황을 적절히 설명하거나 그에 맞게 행동하도록 해준다.

**D.** Return the registry client's raw stack trace and internal exception details, so no diagnostic information is lost.

**설명**

원본 스택 트레이스는 모델이 신뢰성 있게 해석할 수 없는 내부 구현을 노출시키면서도 여전히 오류가 재시도 가능한지 분류하지 못한다. 정보의 양이 많다고 해서 결정에 필요한 구조가 되는 것은 아니다. 에이전트에게 필요한 것은 구현 내부 정보가 아니라 범주와 재시도 가능성 신호다.

### 전반적인 설명

에이전트의 복구 행동은 도구가 반환하는 정보의 질에 좌우된다. 모든 실패가 하나의 불투명한 문자열로 뭉개지면 모델은 재시도, 접근 방식 변경, 에스컬레이션 중 무엇을 선택할지 판단할 근거가 없어 추측하게 되며, 여기서는 양쪽 방향 모두에서 잘못 추측한다. 해법은 도구의 오류 응답이 결정에 필요한 사실을 담도록 만드는 것이다. 실패를 분류하는 errorCategory(장애·타임아웃은 transient, 잘못된 입력은 validation, 접근 문제는 permission, 정책 거부는 business), 재시도 여부를 직접 답하는 isRetryable 불리언, 그리고 에이전트가 활용하거나 전달할 수 있는 사람이 읽을 수 있는 메시지다.

사고 모델은 각 범주가 서로 다른 복구 행동에 대응된다는 것이다. 일시적 오류는 백오프와 함께 재시도되고, 검증 오류는 에이전트가 입력을 고치도록 유도하며, 권한 오류는 사람에게 에스컬레이션되고, 비즈니스 오류는 재시도하지 않고 설명된다. 이 상황에서 만료된 자격 증명은 권한 실패(isRetryable false, 토큰 관리자에게 에스컬레이션)이고, 짧은 레지스트리 장애는 일시적 오류(isRetryable true, 재시도)다. 이런 메타데이터가 있으면 에이전트의 현재 행동이 올바른 방향으로 뒤바뀐다.

다른 대안들은 모두 도구 경계가 지렛대 지점이라는 것을 놓치고 있다. 원본 스택 트레이스를 그대로 쏟아내는 것은 분류 없이 양만 늘리고 모델이 반복해서는 안 될 내부 정보를 유출시킨다. 모든 것을 두 번 재시도하는 프롬프트 수준의 규칙은 서로 다른 대응이 필요한 오류 유형에 하나의 전략을 하드코딩하는 것이다. 장애 중에 빈 성공을 반환하는 것은 침묵의 은폐다. 에이전트는 누락된 데이터를 진짜 답으로 취급하게 되는데, 이는 눈에 보이는 실패보다 더 나쁘다. MCP는 추가로 isError 플래그를 제공해 실패가 모델이 추론해야 할 산문이 아니라 프로토콜 차원에서 보이도록 하며, 구조화된 본문이 다음에 무엇을 해야 할지 알려준다. 오류 처리 가이드는 MCP 문서의 Tools 부분을 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test3.md
## 질문 35

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A pull request modifies a shared helper function that several wrapper modules re-export under different names. The review agent must locate every call site to judge the change's blast radius. Which investigation approach is correct?

**A.** Read every file under the source tree in sequence and assemble a complete call graph before evaluating the change.

**설명**

모든 파일을 다 읽는 방식은 헬퍼와 전혀 관련 없는 파일들에까지 컨텍스트 윈도우를 소모시켜, 분석이 시작되기도 전에 성능을 저하시킨다. 목표를 좁힌 콘텐츠 검색은 훨씬 적은 비용으로 관련 파일을 찾아낸다.

**B.** Glob with a pattern derived from the helper function's name to find all files that reference it, then Read each match.

**설명**

Glob은 파일 이름과 경로를 패턴과 매칭하는 것이며, 파일 내용 안을 들여다보지 않는다. 관련 없어 보이는 이름의 파일 안에서 참조되는 함수는 결코 찾을 수 없으므로, 이 접근 방식은 두 도구의 역할을 서로 바꿔버린 것이다.

**C.** Grep the codebase for the helper function's original name, since every wrapper ultimately delegates to that one implementation.

**설명**

래퍼가 다시 내보낸 별칭을 임포트하는 호출자들은 자신의 코드에서 원래 이름을 전혀 언급하지 않는다. 원래 식별자만 검색하면 직접적인 사용처는 찾아내지만, 이름이 바뀐 내보내기를 통해 호출되는 모든 지점을 조용히 놓쳐 변경의 영향 범위를 과소평가하게 된다.

**D(정답).** Read the wrapper modules to enumerate every exported name, then Grep file contents for each of those names across the codebase.

**설명**

이것이 래핑된 함수를 추적하는 올바른 패턴이다. 래퍼 모듈은 별칭을 만들어내므로 호출자는 내보내진 이름들 중 어느 것이든 참조할 수 있다. 먼저 그 이름들을 모두 나열하고, 각각에 대해 콘텐츠 검색을 하는 것만이 모든 호출 지점을 찾는 유일한 방법이다.

### 전반적인 설명

래퍼 모듈은 하나의 함수가 하나의 이름을 갖는다는 가정을 무너뜨린다. 헬퍼가 (흔히 별칭으로) 다시 내보내지면, 코드베이스에는 원래 식별자가 아니라 래퍼가 내보낸 이름들을 참조하는 호출 지점들이 존재하게 된다. 따라서 신뢰할 수 있는 추적 작업 흐름은 두 단계로 이루어진다. 먼저 래퍼 모듈을 Read하여 그 함수가 보이는 모든 이름의 전체 목록을 만들고, 그다음 그 각각의 이름으로 파일 내용을 Grep한다. 별칭 인벤토리가 완성된 이후에야 콘텐츠 검색이 구현체로 가는 모든 경로를 실제로 커버하게 된다.

여기서 도구를 나누는 배경이 되는 사고 모델이 중요하다. Grep은 파일 내부(식별자, 임포트, 오류 문자열 등)를 검색하며, 어떤 이름을 찾아야 하는지 알고 있을 때 적합한 도구다. Glob은 파일 경로를 패턴과 매칭하며 파일 내용 안에 묻혀 있는 참조는 볼 수 없으므로, 함수 이름으로부터 Glob 패턴을 도출하는 것은 두 도구의 영역을 혼동하는 것이다. 또한 Grep은 기본적으로 파일 경로만 반환한다는 점도 유의해야 한다. 에이전트가 개별 호출 지점을 살펴봐야 할 때는 콘텐츠 모드로 전환하거나(또는 이어서 Read를 사용하여) 정확히 일치하는 줄을 보여주게 해야 한다.

원래 이름만 검색하는 것은 더 미묘한 함정이다. 모든 래퍼가 그 구현체로 위임한다는 사실 때문에 충분할 것처럼 느껴지지만, 위임은 실행 시점에 일어나는 일이며 검색이 살펴보는 소스 텍스트 안에서는 일어나지 않는다. 별칭을 임포트하는 코드에는 별칭만 존재한다. 그리고 호출 그래프를 만들기 위해 모든 파일을 읽는 것은 점진적 조사가 피하고자 하는 안티패턴이다. 이는 검색이 먼저 범위를 좁히도록 하지 않고 컨텍스트 예산을 무차별적으로 소비하는 것이다. 이 작업 흐름을 뒷받침하는 Grep과 Glob의 동작에 대해서는 Claude Code tools reference를 참조하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test3.md
## 질문 39

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : A Glob call with the pattern **/*.ts across the legacy monorepo returns a truncation flag indicating the 100-file cap was reached. The agent needs a complete list of TypeScript files in the payments service. What should it do next?

**A(정답).** Re-run Glob with a narrower pattern scoped to the payments subtree, such as services/payments/**/*.ts.

**설명**

이는 truncation(잘림)에 대해 의도된 대응이다. 이 플래그는 정확히 에이전트에게 패턴이 지나치게 광범위하게 일치했다는 것을 알리기 위해 존재한다. 패턴을 관련 하위 트리로 범위를 좁히면 일치 집합이 상한 이하로 줄어들어 에이전트가 실제로 필요한 완전한 목록을 얻게 된다.

**B.** Treat the returned files as sufficient, since Glob sorts by modification time and the newest 100 cover active code.

**설명**

수정 시각 순 정렬은 최근에 손댄 파일을 먼저 나타나게 하지만, 최신성이 완전성을 의미하지는 않는다. 레거시 모노레포에서는 최근에 변경되지 않은 결제 관련 파일이 완전히 제외될 수 있으며, 이는 에이전트에게 조용히 불완전한 목록을 남기는 결과를 낳는다.

**C.** Switch to Grep with the same pattern, since content search is not subject to the 100-file result cap.

**설명**

Grep은 파일 내용 안을 검색하므로, 확장자로 파일을 나열하는 데는 적합하지 않은 도구다. **/*.ts 같은 경로 패턴을 콘텐츠 검색 도구에 적용하는 것은 지나치게 광범위한 일치를 고치는 것이 아니라 도구의 경계를 잘못 사용하는 것이다.

**D.** Re-run the same broad Glob pattern, expecting the second pass to return the next batch of matching files.

**설명**

Glob에는 연속 호출에 걸쳐 서로 다른 배치의 일치 결과를 반환하는 메커니즘이 없다. 동일하게 지나치게 광범위한 패턴을 반복하면 동일한 잘린 결과만 그대로 재생산될 뿐이다. 상한에 도달했을 때 문서화된 해결책은 검색 패턴을 좁히는 것이다.

### 전반적인 설명

Glob 도구는 재귀적 일치를 위한 **를 포함한 표준 글롭(glob) 문법을 사용해 경로 패턴(이름, 확장자, 디렉터리)으로 파일을 일치시킨다. 그 결과는 수정 시각순으로 정렬되며 100개 파일로 상한이 걸려 있다. 상한에 도달하면 도구는 결과에 truncation(잘림) 플래그를 포함시킨다. 이 플래그는 오류가 아니라, 정확히 하나의 행동, 즉 일치 집합이 상한 이내로 들어오도록 패턴을 좁히라는 것을 촉구하기 위해 설계된 신호이다. 검색 범위를 **/*.ts에서 services/payments/**/*.ts로 좁히면 지나치게 광범위하고 잘린 결과를 관련 하위 트리에 대한 완전한 결과로 바꿀 수 있다.

여기서 가져야 할 사고 모델은, 상한은 거대한 파일 목록으로 에이전트의 컨텍스트가 넘치지 않도록 보호하는 것이고, truncation 플래그는 불완전성에 대한 정직함을 유지해주는 것이라는 점이다. 이 플래그를 무시하는 전략은 어떤 것이든 조용한 데이터 손실의 위험을 안고 있다. 수정 시각순 정렬에 의존하는 것은 가장 최신인 100개 파일이 관련 있는 파일이라고 가정하는 것인데, 이는 중요한 파일이 수년 전에 작성되었을 수 있는 레거시 코드에서는 심하게 잘못될 수 있다. Glob에는 페이지네이션 메커니즘이 없으므로, 동일한 패턴을 다시 실행하면 동일하게 잘린 결과가 그대로 재현된다. 그리고 Grep은 명확한 역할 분담의 반대편에 자리한다. Grep은 파일 안에 무엇이 있는지를 검색하고, Glob은 파일이 무엇이라고 불리는지를 일치시킨다. 확장자로 파일을 나열하는 것은 명백히 Glob의 영역이다.

Glob의 패턴 문법, 결과 정렬, truncation 동작에 대해서는 Claude Code 도구 레퍼런스를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test3.md
## 질문 42

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The review agent keeps misrouting style nitpicks to flag_security_issue instead of flag_style_issue. Both tool descriptions have already been rewritten twice with explicit boundaries and example inputs, yet the misrouting rate is unchanged. What should you do next?

**A(정답).** Audit the system prompt for wording that associates one issue category with a particular tool, and neutralize any such phrasing.

**설명**

설명이 이미 명시적이고 반복된 재작성으로도 잘못된 라우팅 비율이 바뀌지 않는다면, 선택 편향은 맥락의 다른 곳에서 비롯되고 있을 가능성이 높다. 모든 발견 사항을 잠재적 보안 문제로 프레이밍하는 문구와 같은 시스템 프롬프트 표현은 잘 작성된 도구 설명을 압도하는 키워드 연관을 만들어낼 수 있으므로, 그 문구를 검토하고 중화하는 것이 실제 근본 원인을 겨냥한다.

**B.** Rewrite both descriptions a third time, embedding few-shot examples of past misrouted issues in each one.

**설명**

상황 설명 자체가 두 차례의 설명 개선에도 변화가 없었다는 것을 명시하고 있으며, 이는 설명이 실패 지점이 아니라는 강력한 증거다. 세 번째 재작성은 토큰 오버헤드를 더할 뿐, 편향의 실제 원인은 그대로 남겨둔다.

**C.** Merge the two tools into a single flag_issue tool that takes a category parameter, so the model never selects between them.

**설명**

도구를 병합하면 눈에 보이는 선택 결정이 하나의 과부하된 도구 안에 숨겨진 모드 결정으로 바뀌며, 설명은 이런 상황을 안내하는 데 더 취약하다. 이는 오분류를 해결하지 않고 위치만 옮기는, 잘 알려진 안티패턴이다.

**D.** Use tool_choice to force flag_style_issue whenever the changed files are formatting or documentation only.

**설명**

강제된 도구 선택은 필수 단계나 실행 순서를 보장하기 위해 존재하는 것이며, 이슈별 분류를 대체하기 위한 것이 아니다. 하니스 안의 파일 타입 휴리스틱은 혼합된 diff 안의 이슈 범주를 판단할 수 없으며, 포맷 변경이 실제 보안 함의를 함께 지니는 경우마다 오작동하게 된다.

### 전반적인 설명

도구 설명은 주된 선택 메커니즘이지만, 모델이 도구를 선택할 때 고려하는 유일한 텍스트는 아니다. 맥락 안의 모든 것이 선택에 관여하며, 시스템 프롬프트는 영향력에서 도구 정의보다 위에 위치한다. "모든 리뷰에서 보안이 최우선이다"와 같은 단 하나의 지침도, 두 설명이 얼마나 신중하게 경계를 그려놓았든 상관없이 경계선상의 발견 사항을 보안 도구 쪽으로 끌어당기는 키워드 수준의 연관을 만들어낼 수 있다.

여기서의 진단 논리는 증거에 관한 것이다. 두 차례의 설명 개선에도 잘못된 라우팅 비율이 전혀 움직이지 않았다는 것은 설명이 실패 지점이 아니라는 강력한 신호다. 다음으로 살펴봐야 할 곳은 시스템 프롬프트이며, 특정 주제, 우선순위, 범주를 한 도구의 영역과 짝짓는 키워드 민감성 지침을 찾아야 한다. 그 문구를 중화하면(예를 들어, 하나의 범주를 강조하는 대신 각 발견 사항을 실제 범주에 따라 분류하도록 지시하면) 잘 작성된 설명들이 다시 선택을 주도할 수 있게 된다.

대안들은 각각 이 지점을 놓치고 있다. 도구들을 범주 파라미터를 가진 하나로 합치는 것은 동일한 분류 결정을 설명이 더 이상 안내할 수 없는 곳에 묻어버리는 것으로, 과부하된 도구에 대해 문서화된 안티패턴이다. tool_choice로 도구를 강제하는 것은 특정 단계나 순서를 보장하기 위해 설계된 것이며, 이슈별 라우팅을 수행하기 위한 것이 아니다. 파일 경로 휴리스틱은 발견 사항의 내용을 분류할 수 없다. 그리고 세 번째 설명 재작성은 증거가 이미 무죄로 판명한 한 가지 요소에 노력과 토큰을 소비하는 것이다.

도구 정의에 대한 Anthropic의 지침과 주변 맥락이 도구 선택에 어떻게 영향을 미치는지에 대해서는 Implement tool use를 참조하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test3.md
## 질문 48

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : A custom MCP tool runs static analysis file by file during an automated documentation task. Occasionally a single file fails to parse. How should the tool report that failure so the overall run stays reliable?

**A.** Terminate the entire documentation run on the first parse failure so no output is ever produced from incomplete analysis.

**설명**

파일 하나 때문에 전체 워크플로를 멈추면 이미 완료된 유효한 분석 결과가 모두 폐기된다. 파싱할 수 없는 파일 하나가 다른 모든 파일에 대해 생성된 문서를 무효화하지는 않으므로, 이는 작은 공백을 전체 진행 상황의 손실과 맞바꾸는 것이다.

**B.** Retry parsing the failing file repeatedly inside the tool until it succeeds, keeping the failure invisible to the model.

**설명**

문법 문제로 파싱에 실패한 파일은 재시도해도 성공하지 않으므로, 무제한 재시도는 시간만 낭비하고 실행을 멈추게 할 수 있다. 재시도는 타임아웃 같은 일시적 실패에는 도움이 되지만 결정적인 파싱 오류에는 도움이 되지 않으며, 실패를 모델에 숨기면 모델이 상황에 맞춰 대응할 능력을 없애버린다.

**C.** Return an empty analysis result marked as successful so the run proceeds smoothly without interrupting the remaining files.

**설명**

이는 조용한 억제(silent suppression) 안티패턴이다. Claude는 이 빈 결과를 그 파일에 특별한 내용이 없다는 실제 발견 사항으로 취급하여, 아무도 확인할 생각을 못 하는 눈에 보이지 않는 공백이 있는 문서를 만들어내게 된다.

**D(정답).** Return an error naming the file and the parse failure, so Claude continues with the remaining files and notes the gap.

**설명**

이는 정답이다. 실패를 숨기지도 않고 나머지 실행을 희생시키지도 않기 때문이다. Claude는 무엇이 왜 실패했는지에 대한 정확한 정보를 받으며, 성공한 파일들로 계속 진행할 수 있고, 어떤 파일이 다루어지지 않았는지를 문서에 주석으로 표시할 수 있다.

### 전반적인 설명

에이전트 워크플로에서 오류 전달은 하나의 원칙에 근거한다. 모델은 실제로 받은 정보에 대해서만 좋은 결정을 내릴 수 있다. 도구가 스스로 해결할 수 없는 실패를 만났을 때 올바른 동작은, 무엇이 왜 실패했는지를 밝히는 정직하고 서술적인 오류(MCP에서는 isError로 표시된 도구 결과)를 반환하면서 나머지 워크플로는 계속 진행되도록 하는 것이다. 그러면 Claude는 그 실패에 대해 추론할 수 있다. 해당 파일을 건너뛰거나, 다른 접근법을 시도하거나, 최종 문서에 그 커버리지 공백이 숨겨지지 않고 눈에 보이도록 주석을 달 수 있다.

두 가지 전형적인 안티패턴은 서로 반대 극단에 있다. 조용한 억제, 즉 빈 결과를 성공으로 표시해 반환하는 방식은 모델의 세계관을 왜곡한다. 빈 분석 결과는 "이 파일에는 문서화할 것이 없다"는 사실적 주장으로 읽히며, 이는 우아한 성능 저하가 아니다. 실패 하나로 전체 실행을 종료하는 것은 반대되는 실패 양상이다. 국지적이고 복구 가능한 문제를 전역적으로 치명적인 것으로 취급하고, 이미 만들어낸 모든 유효한 결과를 버리게 된다. 무제한 내부 재시도는 세 번째 함정이다. 재시도는 타임아웃 같은 일시적 오류에만 의미가 있는 반면, 결정적인 파싱 오류는 시도할 때마다 똑같이 실패하므로, 재시도 루프는 문제를 여전히 숨긴 채 실행을 멈추게 할 뿐이다.

기억해야 할 사고 모델은 다음과 같다. 오류 범주를 구분하고, 복구가 그럴듯한 경우에만 국지적으로 복구하며, 그 외의 모든 것은 구조화되고 정확한 컨텍스트로 드러내어 에이전트(또는 사람)가 부분적인 결과를 가지고 어떻게 진행할지 결정하게 하는 것이다. 오류 결과가 모델에 어떻게 전달되는지는 Implement tool use와 MCP tools를 참고하라.

### 도메인

Context Management & Reliability

### 출처: Test3.md
## 질문 50

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A pull request review step queries a vulnerability database through an MCP tool. Some reviews report "no vulnerabilities found" when the database actually timed out, letting flawed code merge. How should the tool report these two outcomes?

**A(정답).** Report timeouts as errors with actionable context and zero-match queries as successful results, so retries and approvals stay distinct.

**설명**

이는 정답입니다. 타임아웃과 실제로 깨끗한 조회는 서로 다른 응답이 필요한, 의미상 서로 다른 결과이기 때문입니다. 타임아웃은 재시도 결정을 유발해야 하고, 유효한 빈 결과는 그 자체로 유의미한 발견입니다. 도구의 오류 보고에서 이 둘을 구분해두면 리뷰 워크플로가 실패와 깨끗한 결과를 뒤섞지 않고 올바르게 판단할 수 있습니다.

**B.** Standardize both outcomes to a single "scan unavailable" status so the review workflow's error handling stays simple and uniform.

**설명**

범용 상태는 복구 결정에 필요한 맥락을 숨깁니다. 워크플로는 재시도할지, 다른 소스를 사용할지, 유효한 빈 결과를 받아들일지 판단할 수 없습니다. 더 나쁜 것은, 성공적인 매치-없음 조회까지도 겉보기 실패로 바꿔버려서 정당하고 유의미한 발견을 폐기하게 된다는 점입니다.

**C.** Fail the entire pipeline run whenever the database times out, since an incomplete security review must never reach developers.

**설명**

단일 도구 실패로 전체 워크플로를 중단시키는 것은 완료된 모든 리뷰 작업을 버리는 안티패턴입니다. 더 나은 설계는 맥락을 담아 오류를 전파해서 워크플로가 재시도하거나, 부분적인 결과로 진행하거나, 커버리지 공백을 주석으로 남길 수 있게 하는 것입니다.

**D.** Return an empty findings list marked as success when the database times out, so the review degrades gracefully instead of blocking.

**설명**

이는 침묵 억제 안티패턴으로, 실패를 사실처럼 꾸며놓은 것입니다. 이는 정확히 지금의 버그를 만들어내는 행동으로, 타임아웃이 깨끗한 스캔과 구별되지 않아서 결함 있는 코드가 병합되는 상황입니다.

### 전반적인 설명

여기서 핵심 구분은 접근 실패(조회가 실행되지 못함: 타임아웃, 서비스 오류)와 유효한 빈 결과(조회가 성공적으로 실행되었고 정당하게 아무것도 찾지 못함) 사이의 차이입니다. 둘은 표면적으로는 비슷해 보입니다. 발견 항목이 없다는 점에서요. 하지만 의미는 정반대입니다. 하나는 "우리는 모른다"이고 다른 하나는 "확인했고 깨끗하다"입니다. 이 둘을 뭉뚱그리는 어떤 보고 설계든 다운스트림 로직이 추측하도록 강요하게 되고, 보안 리뷰에서는 결함 있는 코드가 실제로는 완료되지 않은 스캔의 힘을 빌려 병합될 수 있다는 의미가 됩니다.

이 둘을 구분해 유지하는 메커니즘은 프로토콜 수준에 존재합니다. MCP 도구 호출이 실행에 실패하면 그 결과는 오류 결과(MCP 프로토콜의 isError 플래그)와 함께, 타임아웃이나 시도한 조회 등 무엇이 실패했는지 설명하는 실행 가능한 메시지로 보고해야 합니다. 매치가 0건인 성공적인 조회는 정상적인, 오류가 아닌 결과로 반환됩니다. 빈 결과는 완전히 유효한 형태이며 실패를 의미한다고 가정해서는 안 됩니다. 동일한 원칙이 Messages API의 클라이언트 측 도구에도 적용되어, 실패한 실행은 is_error: true를 가진 tool_result 블록으로 반환되고 유효한 빈 결과는 오류 플래그를 갖지 않습니다. 오류 결과가 어떻게 표현되는지, 그리고 오류 메시지가 왜 범용적이지 않고 구체적이어야 하는지는 Handle tool calls를 참고하십시오.

거부된 세 가지 설계는 각각 문서화된 안티패턴에 해당합니다. 타임아웃을 빈 콘텐츠와 함께 성공으로 표시하는 것은 침묵 억제입니다. 실패가 사라지고 리뷰는 결코 검증한 적 없는 것을 단언하게 됩니다. 모든 것을 하나의 "scan unavailable" 상태로 뭉뚱그리는 것은 복구 결정에 필요한 맥락을 없애버리는 동시에 깨끗한 스캔을 장애처럼 잘못 보고합니다. 하나의 타임아웃으로 전체 파이프라인을 실패시키는 것은 재시도나 주석 처리된 커버리지 공백으로 보존할 수 있었던 모든 부분적 리뷰 작업을 버리는 것입니다. 견고한 오류 보고는 계층화되고 정직해야 합니다. 결과 유형을 구분하고, 실행 가능한 맥락을 첨부하며, 더 넓은 시야를 가진 계층이 복구 방법을 결정하도록 해야 합니다.

### 도메인

Context Management & Reliability

### 출처: Test3.md
## 질문 52

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : An engineer adds a remote MCP server to the project's .mcp.json, giving the entry a name and a url field but nothing else. On startup, Claude Code skips the server and reports a configuration error. What change fixes this?

**A.** Add a command field launching a local proxy process, since project-scoped entries must define one.

**설명**

이는 오답이다. 로컬 프로세스를 실행하기 위한 command가 필요한 것은 stdio 서버 항목뿐이며, HTTP 항목은 자신의 url에 직접 연결한다. 프록시 프로세스를 도입하는 것은 필드 하나의 설정 오류를 해결하기 위해 불필요한 인프라를 추가하는 셈이다.

**B(정답).** Add "type": "http" to the server entry so the url is interpreted as a remote endpoint.

**설명**

이 답이 정답이다. Claude Code는 type 필드가 없는 항목을 command로 실행되는 stdio 서버로 취급하므로, type 없이 url만 있는 항목은 설정 오류이며 해당 서버는 건너뛰어진다. 항목을 HTTP 서버로 선언하면 Claude Code가 해당 URL을 원격 엔드포인트로 연결하도록 알려주게 된다.

**C.** Move the entry to ~/.claude.json, because remote servers can only be configured at user scope.

**설명**

이는 오답이다. 원격 HTTP 서버는 프로젝트 범위의 .mcp.json에서 완전히 지원되며, 이는 팀 공용 서버가 있어야 할 정확한 위치이다. 파일의 범위는 해당 항목이 건너뛰어지는 이유와 아무 관련이 없다.

**D.** Wrap the url value in ${...} environment variable expansion so it resolves at startup.

**설명**

이는 오답이다. .mcp.json의 환경 변수 확장은 토큰과 같은 비밀 값을 버전 관리에서 배제하기 위해 존재하는 것이며, url 필드를 유효하게 만들기 위한 것이 아니다. 이 항목이 실패하는 이유는 전송 방식(transport type)이 선언되지 않았기 때문이며, URL을 작성하는 방식과는 관련이 없다.

### 전반적인 설명

Claude Code의 .mcp.json은 근본적으로 다른 두 종류의 서버 항목을 지원하며, type 필드가 이를 구분하는 방법이다. stdio 서버는 Claude Code가 직접 실행하는 로컬 프로세스이므로, 그 항목에는 command(그리고 보통 args)가 필요하다. HTTP 서버는 Claude Code가 네트워크를 통해 연결하는 원격 엔드포인트이므로, 그 항목에는 "type": "http"와 url이 필요하다. type이 없을 때는 stdio가 기본값으로 간주되기 때문에, url만 있는 항목은 Claude Code에게 실행할 command가 없는 stdio 서버처럼 보인다. 그런 서버는 시작할 수 없으므로 해당 항목을 건너뛰고 설정 오류를 보고한다.

여기서 유지해야 할 사고 모델은, type 필드가 전송 방식(transport)을 선택하고, 그 전송 방식이 다른 어떤 필드가 의미를 갖는지를 결정한다는 것이다. 프록시를 통해 원격 서버 앞에 command를 추가하면 기술적으로는 실행 가능한 stdio 항목이 만들어지겠지만, 이는 잘못된 문제를 해결하는 것이며 모든 팀원이 설치해야 하는 프로세스를 추가로 늘릴 뿐이다. 항목을 ~/.claude.json으로 옮기는 것은 서버를 누가 보게 되는지(버전 관리를 통한 공유가 아니라 개인적인 것으로)를 바꿀 뿐, 항목이 파싱되는 방식을 바꾸지는 않는다. ${GITHUB_TOKEN}과 같은 환경 변수 확장은 자격 증명을 커밋되는 파일 밖에 두기 위한 비밀 관리 기능이며, 전송 방식의 해석을 바꾸지 않는다.

프로젝트 범위 설정 형식과 stdio, HTTP 서버 항목의 예시는 MCP를 통해 Claude Code를 도구에 연결하기 문서를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test3.md
## 질문 55

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The review MCP server's url must come from a REVIEW_API_URL variable that CI exports, but developer machines that have not set the variable should fall back to a staging endpoint. How should the shared .mcp.json express this?

**A.** Write the url as ${REVIEW_API_URL} alone and add a setup step requiring every developer to export the staging endpoint manually.

**설명**

단순 자리표시자는 변수가 실제로 설정되어 있을 때만 동작한다. 변수가 없는 머신에서는 Claude Code가 누락된 변수에 대한 경고와 함께 설정을 로드하고 해당 필드에 ${REVIEW_API_URL}이라는 문자 그대로의 텍스트를 남겨두어, 연결 시점에 서버가 깨진다. 또한 폴백이 모든 개발자가 기억해야 하는 수동 단계에 의존하게 되는데, ${VAR:-default} 형태는 공유 파일 안에서 이를 자동으로 처리해준다.

**B.** Maintain a second .mcp.json with the staging URL hard-coded and have a setup script copy the correct variant into place per environment.

**설명**

설정 파일을 중복시키면 변형본들 사이에 드리프트가 생기고, 모든 환경이 올바르게 실행해야 하는 스크립트 복사 단계가 추가된다. 기본값이 있는 환경 변수 확장은 추가 장치 없이 하나의 버전 관리 파일 안에서 동일한 문제를 해결한다.

**C(정답).** Write the url as ${REVIEW_API_URL:-https://staging.internal/api} so environments without the variable resolve to the staging endpoint.

**설명**

Claude Code는 .mcp.json의 url과 같은 필드에서 ${VAR:-default} 확장 문법을 지원한다. 변수가 설정되어 있으면 그 값으로 확장되고, 설정되어 있지 않으면 제공된 기본값으로 확장된다. 따라서 커밋된 하나의 파일이, 프로덕션 URL을 export하는 CI와 스테이징으로 폴백하는 개발자 머신 양쪽 모두에 사용될 수 있다.

**D.** Hard-code the CI endpoint in the shared .mcp.json and have each developer define a staging copy of the server in ~/.claude.json.

**설명**

~/.claude.json의 사용자 범위 설정은 개인용, 실험용 서버를 위한 것이며, 팀 공유 도구를 위한 폴백 채널이 아니다. 모든 개발자가 수동으로 중복된 서버 정의를 유지해야 하고, 그 복사본들은 프로젝트 파일로부터 점점 벗어나게 된다. 기본값이 있는 자리표시자는 하나의 버전 관리 파일 안에서 폴백을 표현한다.

### 전반적인 설명

Claude Code는 .mcp.json을 읽을 때 환경 변수 확장을 수행하며, 이 문법은 정확히 두 가지 자리표시자 형태를 지원한다. ${VAR}는 변수의 값으로 확장되고, ${VAR:-default}는 변수가 설정되어 있으면 그 값으로, 아니면 문자 그대로의 기본값으로 확장된다. 확장은 command, args, env, url, headers 필드에서 동작한다. 설계 목표는 하나의 파일을 버전 관리에 커밋하여 모든 기여자와 CI 러너가 공유할 수 있게 하면서, 머신별 값(엔드포인트, 경로)과 비밀 값(토큰)은 저장소가 아니라 각 환경에 남겨두는 것이다.

${VAR:-default} 형태가 바로 여기서 필요한 메커니즘이다. CI는 REVIEW_API_URL을 export하여 프로덕션 엔드포인트를 얻고, 아무것도 export하지 않은 개발자 머신은 동일한 자리표시자를 스테이징 URL로 해석한다. 값도 기본값도 없는 단순한 ${VAR} 참조에서 무슨 일이 일어나는지 이해해둘 필요가 있다. Claude Code는 파일 파싱에 실패하지도 않고 빈 문자열로 대체하지도 않는다. 설정을 로드하되 claude mcp list에서 해당 서버에 대한 누락된 변수 경고를 표시하고, 확장되지 않은 ${VAR} 텍스트를 그대로 사용하는데, 이는 대체로 연결 시점에 그 서버를 깨뜨린다. 이런 동작 때문에 개발자별 수동 설정이 아니라 기본값 문법이 설정을 우아하게 저하시키는 올바른 방법이 되는 것이다.

오답들은 실제로는 실패한다. 단순 자리표시자는 폴백을 개발자가 잊을 수 있는 수동 export 단계에 의존하게 만든다. 각 개발자의 ~/.claude.json에 중복된 스테이징 서버를 밀어넣는 것은 사용자 범위 설정을 공유 도구용으로 오용하고 동기화해야 할 정의를 늘린다. 스크립트로 교체되는 두 개의 하드코딩된 파일 변형을 유지하는 것은 자리표시자 확장이 제거하고자 설계된 바로 그 설정 드리프트를 다시 끌어들인다. 확장 문법과 지원되는 필드에 대해서는 Connect Claude Code to tools via MCP를 참조하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test3.md
## 질문 59

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : A teammate is designing an MCP server that exposes the team's internal service registry: service names, endpoint schemas, and owning teams. Agents read this inventory but never modify anything. How should the server expose it?

**A.** Skip the MCP server for this data and paste the registry into the project CLAUDE.md so every session loads it.

**설명**

살아있는 인벤토리를 CLAUDE.md에 하드코딩하면 서비스가 추가되거나 소유자가 바뀌는 즉시 낡은 정보가 되며, 작업이 실제로 그 데이터를 필요로 하는지와 무관하게 매 요청마다 전체 레지스트리라는 부담을 지운다. 리소스는 그 대신 현재 데이터를 요청 시점에 제공한다.

**B.** Expose it through a get_service_registry tool, since tool calls are how agents typically pull data from servers.

**설명**

도구(tool)는 서버가 수행하는 동작을 위한 MCP 프리미티브로, POST 엔드포인트에 대응한다. 읽기 전용 참조 데이터를 도구로 감싸는 것은 기계적으로는 동작하지만 프리미티브를 잘못 사용하는 것이다. 프로토콜이 리소스를 제공하는 이유는 정확히 이런 경우, 즉 모든 읽기를 동작으로 포장하지 않고 에이전트가 맥락 데이터를 얻을 수 있게 하기 위함이다.

**C(정답).** Expose the registry as MCP resources, since resources are the protocol's primitive for data that agents read.

**설명**

리소스는 읽을 수 있는 데이터를 노출하기 위해 설계된 MCP 프리미티브로, GET 엔드포인트에 대응한다. 에이전트가 참조만 하고 절대 변경하지 않는 서비스 레지스트리는 정확히 리소스가 존재하는 이유인 콘텐츠 카탈로그 용례이며, 동작 시맨틱 없이 에이전트에게 무엇이 있는지에 대한 즉각적인 지도를 제공한다.

**D.** Expose it as an MCP prompt template so the full registry is injected into every agent conversation automatically.

**설명**

MCP 프롬프트는 코드 리뷰 워크플로우나 분석 개요와 같은 재사용 가능한 프롬프트 템플릿이다. 데이터 카탈로그를 게시하는 채널이 아니며, 전체 레지스트리를 모든 대화에 강제로 주입하면 작업이 그것을 필요로 하는지와 무관하게 컨텍스트를 낭비하게 된다.

### 전반적인 설명

Model Context Protocol은 서로 다른 역할을 가진 세 가지 프리미티브를 정의한다. 리소스는 읽기용 데이터를 노출하고(GET 엔드포인트와 유사), 도구는 동작을 수행하며(POST 엔드포인트와 유사), 프롬프트는 재사용 가능한 템플릿을 패키징한다. 에이전트가 참조만 하고 절대 변경하지 않는 서비스 레지스트리는 리소스에 정확히 대응된다. 서버가 카탈로그를 게시하면 에이전트는 실제 작업을 하기 전에 어떤 서비스, 스키마, 소유자가 존재하는지 알기 위해 이를 직접 읽는다.

분류 체계보다 설계 근거가 더 중요하다. 참조 데이터가 도구 뒤에 있으면 모델은 단지 무엇이 존재하는지 알기 위해 동작을 호출하기로 결정해야 하며, 모든 읽기가 도구 선택 결정과 무언가를 하는 것으로 포장된 왕복 호출을 소비한다. 리소스는 이 마찰을 없앤다. 콘텐츠 카탈로그처럼 동작하여 에이전트에게 사용 가능한 데이터의 즉각적인 지도를 제공하므로 탐색적 호출(서비스 목록 조회, 스키마 탐색)이 전혀 발생하지 않는다. 이것이 바로 MCP 리소스가 문서 계층 구조, 데이터베이스 스키마, 이슈 요약을 노출하는 데 권장되는 방식인 이유와 같다.

나머지 접근 방식들은 각각 프리미티브의 의도를 벗어난다. get_service_registry 도구는 리소스가 이미 제공하는 것을 중복하면서 순수한 읽기에 동작 시맨틱을 붙인다. MCP 프롬프트는 어떻게 작업할지에 대한 템플릿이지 어떤 데이터가 존재하는지를 전달하는 통로가 아니다. 그리고 레지스트리를 CLAUDE.md에 붙여넣는 것은 살아있는 단일 진실 공급원을 서비스가 바뀌면서 점점 낡아가는 정적 복사본으로 바꾸는 동시에, 대부분의 작업이 필요로 하지 않는 데이터로 모든 세션의 컨텍스트를 부풀린다. MCP Resources와 Claude Code MCP 문서를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test4.md
## 질문 1

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The extraction tool returns the message "Operation failed" both when a document genuinely contains no line items and when the document parser times out. The agent retries empty documents endlessly and abandons timed-out ones. What is the correct fix?

**A.** Retry all failures inside the tool itself and return an empty list once retries are exhausted, so the agent always receives a result.

**설명**

재시도를 모두 소진한 뒤 빈 목록을 반환하는 것은 조용한 오류 은폐다. 에이전트는 실제로 항목이 없는 문서와 한 번도 제대로 파싱되지 못한 문서를 구별할 수 없다. 그러면 다운스트림 시스템은 누락된 데이터를 정당하게 존재하지 않는 것으로 기록하게 되어 추출 정확도가 손상된다.

**B.** Add a system prompt rule instructing the agent to retry any extraction failure at most twice before moving to the next document.

**설명**

일률적인 재시도 상한은 두 상황을 동일하게 취급하므로, 에이전트는 실제로 항목이 없는 문서에서도 여전히 시도를 낭비하고, 재시도하면 해결될 타임아웃에서도 여전히 포기한다. 프롬프트 안내로는 원인에 대한 정보가 전혀 없는 도구 응답을 보완할 수 없다.

**C.** Append a retry-count field to the "Operation failed" message so the agent can track attempts and stop after a fixed threshold.

**설명**

시도 횟수를 세는 것은 피해를 제한할 뿐, 재시도가 애초에 의미가 있는지는 에이전트에게 전혀 알려주지 않는다. 핵심 결함, 즉 응답이 정당한 빈 결과와 접근 실패를 혼동한다는 문제는 그대로 남으므로, 복구 동작은 실제 원인과 계속 단절된 채 유지된다.

**D(정답).** Return a successful result with an empty list when no line items exist, and a transient, retryable error when the parser times out.

**설명**

정답이다. 두 상황은 서로 반대되는 처리를 필요로 하기 때문이다. 항목이 없는 문서는 정당한 빈 결과이므로 성공으로 보고해야 하고, 파서 타임아웃은 일시적인 접근 실패이므로 재시도할 가치가 있는 오류로 표시해야 한다. 도구 인터페이스 단계에서 이 둘을 분리하면 에이전트는 빈 문서에 대한 재시도를 멈추고 타임아웃에 대한 재시도를 시작할 수 있는 신호를 얻게 된다.

### 전반적인 설명

이 상황은 일반적인 오류 메시지가 뒤섞어 버린 두 가지 서로 다른 문제를 결합하고 있다. 항목이 없는 문서는 전혀 실패가 아니다. 도구는 정상적으로 실행되었고 아무것도 찾지 못했을 뿐이므로, 정직한 응답은 빈 데이터를 담은 성공 결과다. 파서 타임아웃은 접근 실패다. 도구는 문서를 검토할 기회조차 얻지 못했으므로 데이터는 실제로 존재할 수 있고 재시도는 가치가 있다. 두 조건이 모두 동일한 문자열 "Operation failed"로 나타나면, 에이전트는 재시도와 다음으로 넘어가는 것 중 무엇을 선택해야 할지 판단할 근거가 없어지고, 이것이 바로 그 동작이 뒤집혀 나타나는(정당한 빈 결과에는 재시도하고, 복구 가능한 타임아웃은 포기하는) 이유다.

여기서 유지해야 할 사고 모델은, 도구 응답이 실행 시점에 무슨 일이 있었는지를 알 수 있는 에이전트의 유일한 창이라는 것이다. Anthropic의 가이드는 오류 콘텐츠가 단순히 "failed"라고만 하지 말고 무엇이 잘못되었는지와 Claude가 다음에 무엇을 시도해야 하는지를 명시해야 한다고 분명히 밝히고 있다. 실제 실패의 경우, errorCategory를 transient로, isRetryable을 true로 지정하는 것과 같은 구조화된 메타데이터는 복구 결정을 추측이 아니라 계산 가능한 것으로 만든다. 마찬가지로 중요한 것은 무엇이 오류로 간주되는지의 경계다. 정당한 빈 결과를 실패로 표시하는 것은 실패를 성공으로 표시하는 것만큼이나 해롭다. 둘 다 에이전트에게 현실을 잘못 전달하기 때문이다.

나머지 접근법들은 모두 이 혼동을 그대로 남겨둔다. 도구 내부에서 재시도를 흡수하고 빈 목록을 내보내는 것은 파싱되지 않은 문서를 겉보기에 빈 문서로 바꾸는 것으로, 실패를 다운스트림 시스템을 위한 잘못된 정보로 전환하는 안티패턴이다. 재시도를 일괄적으로 제한하는 프롬프트 규칙은 서로 반대되는 정책이 필요한 두 상황에 하나의 정책을 적용한다. 재시도 카운터는 낭비되는 노력을 제한할 뿐, 그 노력이 정당한지는 결코 알려주지 않는다.

일반적인 실패 문자열 대신 유익하고 실행 가능한 오류 콘텐츠를 반환하는 문서화된 패턴에 대해서는 Handle tool calls를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test4.md
## 질문 7

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : process_refund rejects a request with isError: true, errorCategory: "business", retriable: false, and the message "Order 8841 is outside the 30-day returns window; no automatic refund is possible." What should the agent do next in the conversation?

**A.** Invoke escalate_to_human immediately with the error details, since the refund cannot be completed autonomously.

**설명**

명확하고 충분히 설명된 정책상의 거부는 에이전트가 전달할 수 있는 범위 안에 있다. 에스컬레이션 트리거는 고객의 명시적 요청, 정책상의 공백, 또는 더 이상 진행할 수 없는 상황이다. 고객이 사유를 듣기도 전에 조용히 넘겨버리면 상담원의 업무 부담이 늘고 최초 접촉 해결률이 떨어진다.

**B.** Retry process_refund once with slightly adjusted request parameters in case the returns-window check produced a false rejection.

**설명**

retriable: false 플래그는 정확히 이런 시도를 막기 위해 존재한다. 정책 위반은 입력 문제가 아니다. 파라미터를 어떻게 바꿔도 주문을 반품 기한 안으로 되돌릴 수는 없으므로, 재시도는 턴과 도구 호출을 낭비할 뿐이다.

**C.** Tell the customer a temporary system issue blocked the refund and suggest they contact support again later.

**설명**

이는 의도된 정책상의 거부를 일시적 실패로 잘못 표현하는 것으로, errorCategory 필드가 제거하려는 혼동을 그대로 재현한다. 또한 항상 거부될 요청을 고객에게 재시도하도록 권유하여 반복 문의를 확정적으로 유발한다.

**D(정답).** Relay the returns-window explanation to the customer and offer escalation if they want an exception reviewed.

**설명**

정답이다. 이는 이 오류가 가능하게 하려던 행동이다. retriable: false와 고객 친화적 메시지를 가진 비즈니스 오류는 도구 수준에서 거부가 최종적임을 에이전트에게 알려준다. 따라서 올바른 행동은 고객에게 정책을 설명하고 남아있는 정당한 경로를 제시하는 것이며, 이는 최초 접촉 해결을 유지한다.

### 전반적인 설명

구조화된 오류 메타데이터는 양방향 계약이다. 도구 작성자가 결정을 인코딩하고, 에이전트는 이를 올바르게 실행에 옮겨야 한다. errorCategory는 에이전트에게 어떤 종류의 실패가 발생했는지 알려주며, 비즈니스 오류의 경우 retriable: false와 평이한 언어의 메시지가 결합되면 다음을 의미한다. 다시 호출을 시도하지 말고, 이 텍스트를 고객에게 알리는 데 사용하라는 것이다. 이 시점에서 에이전트의 역할은 운영이 아니라 대화이다. 정책상의 이유를 전달하고, 고객이 예외 검토를 원한다면 에스컬레이션을 제안하는 등 남아있는 정당한 경로를 제시한다.

이 플래그가 실제로 무엇인지 이해할 필요가 있다. retriable은 Anthropic 플랫폼이 강제하는 필드가 아니다. 문서화된 프로토콜 수준의 신호는 도구 결과의 is_error이다(또는 MCP 스타일 결과에서는 isError). errorCategory와 retriable 같은 필드는 결과 콘텐츠 안에 담긴 애플리케이션 수준의 메타데이터이며, 모델이 이를 읽고 추론하기 때문에 작동한다. 그래서 함께 오는 메시지가 그토록 중요하다. 도구 호출 처리에 관한 Anthropic의 가이드는 모델이 추측해야 하는 간결한 실패 메시지보다, 무엇이 잘못되었고 다음에 무엇을 해야 하는지를 명시하는 오류 메시지를 명확히 권장한다.

잘못된 선택들은 각기 다른 방식으로 이 계약을 깬다. 재시도 불가능한 비즈니스 거부를 재시도하는 것은 정책 결정을 잡음으로 취급하는 것이며 결코 성공할 수 없다. 거부를 일시적 시스템 문제로 보고하는 것은 도움이 되지 않는 것보다 더 나쁘다. 정확한 정보를 잘못된 정보로 바꾸어 헛된 재문의를 유발한다. 결과를 먼저 설명하지 않고 즉시 에스컬레이션하는 것은 오류 메시지가 지원하려던 소통 단계를 건너뛰는 것이다. 에스컬레이션은 정책이 모호하거나, 고객이 상담원을 요청하거나, 에이전트가 정말로 더 진행할 수 없을 때 필요한 것이며, 명확하게 설명된 거부에는 해당하지 않는다.

### 도메인

Tool Design & MCP Integration

### 출처: Test4.md
## 질문 11

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The system's single process_document tool exposes an operation enum (extract_entities, summarize_tables, classify_document). Logs show frequent wrong-operation calls, and each operation returns a differently shaped payload that breaks downstream schema validation. Which redesign fixes both problems?

**A.** Set tool_choice to force process_document on every request so the model always calls the tool instead of answering in text.

**설명**

tool_choice로 도구 호출을 강제하면 호출이 일어나는 것은 보장되지만, 모델이 호출 안에 어떤 operation 값을 채워 넣는지에는 아무런 영향을 미치지 않는다. 잘못된 라우팅과 일관되지 않은 페이로드 형태는 둘 다 그대로 남는다.

**B(정답).** Split it into three purpose-specific tools, each with its own description, its own input_schema, and one consistent result shape.

**설명**

별도의 도구로 분리하면 operation 결정이 도구 선택 단계로 옮겨지고, 그 단계에서는 서로 다른 이름과 설명이 모델을 안내한다. 각 도구의 input_schema는 정확히 하나의 operation에 대한 입력만 기술한다. 각 도구가 이제 하나의 일관된 페이로드 형태를 반환하므로, 다운스트림 시스템은 각 결과를 operation별 출력 스키마에 대해 검증할 수 있게 되어 두 가지 실패 모두를 근원에서 해결한다.

**C.** Keep the single tool and expand its description with detailed selection criteria and examples for each operation value.

**설명**

더 풍부한 설명이 혼동을 일부 줄일 수는 있지만, operation 선택은 도구 선택으로 드러나지 않고 여전히 단일 파라미터 안에 묻혀 있으며, 도구는 여전히 서로 호환되지 않는 세 가지 페이로드 형태를 반환한다. 다운스트림 검증 문제는 전혀 해결되지 않는다.

**D.** Add an auto value to the operation enum so the tool itself infers the intended operation from the document at runtime.

**설명**

자동 감지는 모호함을 해결하는 것이 아니라 한 단계 더 깊이 밀어넣을 뿐이다. 이제 도구가 콘텐츠로부터 의도를 추측해야 하고, 잘못된 추측은 진단하기가 더 어려워진다. 또한 검증을 깨뜨리는 불일치한 출력 형태에 대해서도 아무런 조치가 되지 않는다.

### 전반적인 설명

모델은 자신이 볼 수 있는 세 가지 정보, 즉 도구 이름, 설명, input_schema(도구의 입력 파라미터를 기술하는 JSON Schema)로부터 도구 호출을 선택하고 구성한다. 실제로 서로 다른 세 가지 operation이 mode 파라미터를 가진 하나의 도구 뒤에 숨어 있으면, 정작 중요한 결정(어떤 operation을 수행할지)이 이러한 신호가 작동하는 선택 표면에서 제거되어 버린다. 모델은 도구 선택은 쉽게 해내지만, 훨씬 약한 안내만으로 enum 값을 추측하게 되며, 이것이 바로 로그에 나타난 잘못된 operation 패턴이다.

extract_entities, summarize_tables, classify_document로 분리하면 숨겨져 있던 파라미터 선택이 눈에 보이는 도구 선택으로 바뀌고, 각 이름과 설명이 명확한 경계를 그릴 수 있게 된다. 추출 파이프라인에서 마찬가지로 중요한 점은, 각 도구가 이제 하나의 계약을 소유한다는 것이다. 해당 operation의 입력에 집중된 input_schema와, 도구가 반환하는 하나의 페이로드 형태다. input_schema는 입력만을 규율한다는 점에 유의해야 한다. 애플리케이션은 여전히 각 도구가 반환하는 페이로드를 검증하지만, 도구별 계약이 있으면 세 가지 호환되지 않는 결과 형태를 하나의 스키마로 커버하려 하는 대신, 각 결과를 별도의 operation별 출력 JSON Schema에 대해 검사할 수 있다. 이는 구조적 불일치를 미봉책으로 덮는 것이 아니라 근본적으로 제거하는 것이다.

관련 operation들을 공유 파라미터 뒤로 통합하는 것은 그 operation들이 하나의 계약을 공유하고 모델이 이들 사이를 신뢰성 있게 라우팅할 때는 합리적인 설계다. 이 문제의 시나리오는 두 조건 모두 성립하지 않음을 보여준다. 라우팅이 실패하고 있고 페이로드 형태가 서로 다르므로, 이는 목적별 전용 도구가 제 값어치를 하는 경우다. 단일 도구의 설명을 확장하는 것은 여전히 모호한 구조에 대한 문서화를 개선할 뿐 형태 문제는 그대로 남긴다. auto operation 값은 추측을 도구 안으로 옮겨놓을 뿐이다. tool_choice로 호출을 강제하는 것은 도구가 호출되는지 여부를 제어할 뿐, 모델이 입력에 어떤 operation 값을 쓰는지는 제어하지 않으므로, 두 실패 중 어느 것도 바꾸지 못한다. 도구 정의(이름, 설명, input_schema)가 모델의 도구 선택과 입력 구성을 어떻게 이끄는지는 tool use overview를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test4.md
## 질문 14

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : A billing-dispute investigation is delegated to a subagent. Its custom lookup_order MCP tool fails, returning application-level error metadata your team designed: errorCategory "permission" and isRetryable false, because the account record is restricted. How should the subagent handle this failure?

**A.** Reformulate the request with alternate search parameters, since a differently shaped query may route around the restriction.

**설명**

입력을 재구성하는 것은 메타데이터가 에이전트가 고칠 수 있는 입력 문제를 나타낼 때 적절한 대응이다. 이 제한은 계정 레코드 자체에 적용되는 것이므로 쿼리를 다시 표현해도 해결되지 않으며, 접근 제어를 회피하려는 시도는 성공하더라도 부적절하다.

**B.** Retry the lookup_order call several times with exponential backoff in case the account restriction clears during the session.

**설명**

백오프를 두고 재시도하는 것은 도구가 타임아웃처럼 일시적이고 재시도 가능하다고 표시한 실패에 대한 로컬 복구 패턴이다. 이 오류는 명시적으로 isRetryable false로 표시되어 있으므로, 재시도는 도구 호출을 낭비하고 조정자의 복구 결정을 지연시킬 뿐이다.

**C.** Call escalate_to_human directly from within the subagent so the human handoff begins before the coordinator is informed.

**설명**

에스컬레이션 결정은 전체 사례 맥락을 갖고 시스템 전반에서 오류를 일관되게 처리하는 조정자에게 속한다. 서브에이전트가 스스로 에스컬레이션하면 이 중앙 통제 지점을 건너뛰게 되며, 사례 전체를 포괄하는 자체 완결적 핸드오프를 구성할 수 없다.

**D(정답).** Report the unresolved failure in its final message to the coordinator, including the error category and the attempted lookup.

**설명**

정답이다. 도구 자체의 메타데이터가 이 실패를 재시도 불가능으로 표시하고 있고, 접근 제한은 서브에이전트가 로컬에서 해결할 수 있는 범위를 벗어나므로, 올바른 조치는 이를 상위로 전달하는 것이다. 서브에이전트의 최종 메시지만 조정자에게 도달하므로, 그 메시지에는 오류 범주와 시도했던 조회 내용이 담겨야 조정자가 에스컬레이션이나 대안 경로를 결정할 수 있다.

### 전반적인 설명

여기서 핵심 판단은 여러분의 도구가 반환하는 오류 메타데이터에 맞춰 복구 행동을 일치시키는 것이다. errorCategory와 isRetryable 같은 필드는 MCP 프로토콜이나 Claude Agent SDK의 일부가 아니다. 도구 실행 실패의 경우 MCP의 도구 결과는 isError: true를 담을 수 있고, 프로토콜 수준의 오류는 별도로 MCP/JSON-RPC 오류로 처리된다. 잘 설계된 도구는 그 플래그 위에 애플리케이션 수준의 메타데이터를 추가하는데, 이는 정확히 에이전트가 복구 전략을 선택할 수 있게 하기 위함이다. 도구가 일시적이고 재시도 가능하다고 표시한 실패는 재시도하고, 도구가 수정 가능한 요청 문제를 나타내면 입력을 수정하며, 도구가 실패가 해소되지 않을 것이라고 말하면 재시도를 멈춘다. isRetryable: false로 표시된 접근 제한은 서브에이전트가 로컬에서 해결할 수 없는 종류의 실패이므로, 그 패턴은 시도를 낭비하지 않고 상위로 전달하는 것이다.

이 전달이 어떻게 이루어지는지는 서브에이전트 컨텍스트 격리에 의해 결정된다. 각 서브에이전트는 자신만의 대화를 가진 별도의 에이전트 인스턴스로 실행된다. 중간 도구 호출, 재시도, 오류는 그 컨텍스트 안에 머무르며, 오직 최종 메시지만 조정자에게 반환된다. 이 설계는 조정자의 컨텍스트를 깨끗하게 유지하지만, 서브에이전트가 의도적으로 보고하지 않는 것은 조정자가 아무것도 볼 수 없다는 의미이기도 하다. 최종 메시지에 오류 범주와 시도한 조회 내용이 빠지면 그 실패는 실질적으로 보이지 않게 되고, 조정자는 에스컬레이션, 다른 데이터 경로 시도, 또는 커버리지 공백을 주석으로 남기고 진행하는 것 중 선택할 수 없게 된다.

오답 선택지들은 각각 유효한 패턴을 잘못 적용한 것이다. 백오프 재시도는 도구가 일시적이라고 표시한 실패에 맞는 것이지 접근 거부에는 맞지 않는다. 파라미터를 재구성하는 것은 접근 제어 거부를 수정 가능한 입력 문제로 취급하는 것이다. 그리고 서브에이전트가 스스로 escalate_to_human을 호출하게 하는 것은 맥락이 가장 부족한 구성 요소에 아키텍처적 결정을 넘기는 것으로, 오류를 관찰하고 일관되게 처리하는 단일 지점으로서 조정자의 역할을 훼손한다. 서브에이전트 격리와 최종 메시지 보고가 어떻게 작동하는지는 Claude Agent SDK의 Subagents를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test4.md
## 질문 15

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : The project's .mcp.json connects five MCP servers, exposing roughly 25 tools in every session, although most coding tasks touch only the GitHub server. Claude increasingly picks the wrong tool during refactoring work. What is the highest-leverage fix?

**A(정답).** Trim the project's .mcp.json to servers the workflow uses, moving rarely needed ones to users' ~/.claude.json.

**설명**

연결된 모든 MCP 서버의 도구는 연결 시점에 발견되어 동시에 사용 가능해지므로, 매 선택 결정마다 25개 도구 전체 카탈로그가 관여한다. 연결된 서버 수를 줄이면 결정 공간이 직접 줄어드는데, 이는 신뢰할 수 없는 도구 선택에 대한 아키텍처 차원의 제어 수단이다. 개인적이거나 드물게 쓰이는 서버는 사용자 수준 설정에 속해야 한다.

**B.** Run every refactoring task in plan mode so a developer reviews tool choices before any execution happens.

**설명**

플랜 모드는 사람의 검토 지점을 추가하지만 선택을 더 신뢰할 수 있게 만들지는 못한다. 결국 개발자가 같은 잘못된 선택을 반복해서 걸러내야 한다. 원인을 제거하지 않고 검토 오버헤드로 증상만 다스리는 것이다.

**C.** Add a CLAUDE.md section mapping each common task type to the specific server tools Claude should choose.

**설명**

프롬프트 수준의 가이드는 확률적이다. 여전히 똑같이 큰 결정 공간을 지시문으로 극복하라고 요구하는 것이다. 지나치게 큰 인벤토리가 근본 원인이며, 설정을 통해 이를 완전히 없앨 수 있는데 굳이 맞서 싸울 필요가 없다.

**D.** Create a slash command Claude runs first in each session, returning the recommended tool for the requested task.

**설명**

이는 선택 문제를 해결하기 위해 라우팅 단계를 추가하는 것이며, 그 라우팅 단계의 결과 역시 동일하게 지나치게 큰 카탈로그를 대상으로 올바르게 따라야 한다. 실제 문제를 줄이는 대신 그 위에 간접 단계를 하나 더 얹는 것이다.

### 전반적인 설명

Claude Code가 MCP 서버에 연결되면 연결된 모든 서버의 모든 도구가 한꺼번에 발견되어 사용 가능해진다. 모델의 도구 선택은 그 통합된 카탈로그에 대한 단일 결정이며, 카탈로그가 커질수록 신뢰도는 떨어진다. 설명이 서로 겹치는 경우가 많아지고, 근소하게 다른 후보들이 늘어나며, 잘못 라우팅될 방법도 늘어난다. Anthropic의 문서도 이를 직접 인정하며, 대규모 도구 라이브러리에서는 선택 정확도가 떨어지고 매우 큰 카탈로그에는 온디맨드 도구 로딩과 같은 전용 완화 수단이 필요하다고 언급한다(Tool search tool 문서 참고).

여기서 가져야 할 사고 모델은, 도구 인벤토리가 프롬프팅의 문제가 아니라 아키텍처 차원의 제어 수단이라는 것이다. 대부분의 세션이 하나의 서버 도구만 필요로 한다면, 해법은 설정을 그 현실에 맞추는 것이다. 공유되고 워크플로우에 필수적인 서버는 프로젝트의 .mcp.json에 두어(버전 관리되고 팀에 배포됨) 유지하고, 드물게 쓰이거나 개인적인 서버는 ~/.claude.json으로 옮겨서 개별 개발자가 다른 모든 사람의 도구 카탈로그를 부풀리지 않고 활성화할 수 있게 한다. 이는 서브에이전트의 도구 할당을 지배하는 것과 동일한 범위 지정 원칙이다. 관련된 몇 개 도구 중에서 선택하는 모델이 수십 개 중에서 선택하는 모델보다 눈에 띄게 더 신뢰도가 높다.

대안들은 모두 결정 공간을 그대로 남겨둔다. CLAUDE.md 가이드는 지시문이 인벤토리와의 싸움에서 이기기를 바라는 것이며, 이는 확률적으로만 작동한다. 플랜 모드는 사람의 검토를 끼워 넣지만, 이는 모델이 이미 오류를 낸 뒤에야 이를 잡아내는 것이고 확장성도 떨어진다. 라우팅 슬래시 명령은 선택 문제를 고치기 위해 또 다른 선택 단계를 추가하는 것이며, 추천이 돌아온 뒤에도 모델은 여전히 동일한 25개 도구를 대상으로 올바르게 행동해야 한다. 연결된 것 자체를 줄이는 것이 실패 모드를 감시하는 대신 없애는 방법이다.

### 도메인

Tool Design & MCP Integration

### 출처: Test4.md
## 질문 21

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : Before beginning deep analysis, the document analysis subagent must identify which of several hundred downloaded source files mention the phrase "randomized controlled trial" anywhere in their text. Which tool selection accomplishes this correctly?

**A(정답).** Invoke Grep with the phrase as the pattern, scoped to the corpus directory.

**설명**

Grep는 정규식으로 파일 내용을 검색하는 내장 도구다. 기본 출력 모드인 files_with_matches는 매칭된 파일 경로를 반환하는데, 이는 서브에이전트가 전체를 읽기 전에 필요한 후보 파일 목록 그 자체다.

**B.** Invoke Glob with a wildcard pattern containing the phrase to find the files.

**설명**

Glob은 파일명과 경로를 패턴과 매칭시킬 뿐, 파일 내부를 들여다보지 않는다. 해당 문구는 파일명이 아니라 문서 본문에 등장하므로, Glob으로는 이 파일들을 찾을 수 없다.

**C.** Read each downloaded file in full and check its contents for the phrase.

**설명**

수백 개의 파일을 전부 읽으면 대부분 무관한 내용에 컨텍스트 윈도우를 소모하게 된다. 내용 검색으로 먼저 후보군을 좁혀서 Read는 실제로 중요한 파일에만 써야 한다.

**D.** Run a recursive shell grep through Bash, since it handles large directories.

**설명**

셸 grep은 기계적으로 그 문구를 찾을 수 있지만, ripgrep 기반이고 읽기 전용이며 에이전트가 직접 소비할 수 있는 구조화된 형태로 결과를 반환하는 전용 Grep 도구를 우회하는 것이다. Bash는 전용 도구가 수행할 수 없는 작업을 위해 남겨두어야 한다.

### 전반적인 설명

두 내장 검색 도구를 가르는 기준은 패턴이 어디에서 매칭되는가이다. Grep은 파일 내부를 검색한다. 파일 내용에 대해 정규식을 실행하므로, 식별자, 오류 메시지, import문, 혹은 여기서처럼 문서 본문에 묻혀 있는 특정 문구를 찾는 데 적합한 도구다. Glob은 파일명과 경로(예: **/*.md 같은 패턴)를 매칭시키므로, 어떤 파일이 존재하는지에 대해서만 답할 수 있고 그 내용에 대해서는 절대 답할 수 없다. 유용한 사고 모델은 이렇다. Glob은 "어떤 파일이 있는가?"에, Grep은 "어떤 파일이 이 내용을 담고 있는가?"에 답한다.

Grep은 ripgrep 기반이며, 패턴, 검색 범위를 좁히는 선택적 경로, 스캔할 파일을 제한하는 선택적 glob 필터, 그리고 output_mode를 받는다. 기본 모드인 files_with_matches는 매칭된 파일 경로를 반환하는데(Agent SDK 구조에서는 files 컬렉션과 개수), 이는 정확히 이 작업이 필요로 하는 사전 필터링 단계다. content 모드를 사용하면 필요할 때 실제 매칭 줄을 확인할 수 있다. Grep은 읽기 전용 도구이므로 작업 디렉터리 내에서는 권한 승인이 필요 없어 서브에이전트가 조사 과정에서 자유롭게 사용할 수 있다.

이러한 먼저 검색하고 선택적으로 읽는 패턴은 핵심적인 컨텍스트 효율화 원칙이기도 하다. 코퍼스를 전부 Read하면 무관한 자료에 컨텍스트 윈도우를 소모하게 되지만, Grep 호출 한 번으로 수백 개의 후보를 로드할 가치가 있는 소수로 줄일 수 있다. Bash를 통한 셸 grep으로 대체하는 것은 기계적으로는 동작하지만, 구조화되고 권한이 필요 없는 도구를 에이전트가 텍스트로 파싱해야 하는 명령 출력으로 바꾸는 것이며, 불필요하게 Bash 권한 처리를 거치게 된다. Grep 도구의 입력과 출력 모드에 대해서는 Claude Code 도구 레퍼런스와 Agent SDK Python 레퍼런스를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test4.md
## 질문 22

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The document analysis subagent's fetch_document MCP tool returns the full raw page payload plus 30+ crawl and encoding metadata fields per call, and the subagent exhausts its context before completing multi-document analyses. What is the most effective change?

**A.** Add a system prompt instruction telling the subagent to disregard crawl and encoding metadata when reasoning about documents.

**설명**

모델에게 필드를 무시하라고 지시해도 그것들이 컨텍스트에서 제거되지는 않는다. 관련 없는 각 필드는 여전히 각 도구 결과에서 토큰을 소비한다. 컨텍스트 윈도우는 정확히 같은 속도로 채워지므로 소진 문제는 그대로 남는다.

**B(정답).** Modify fetch_document to return only the fields the analysis needs, such as title, publication date, and relevant text sections.

**설명**

이는 관련 없는 대용량 데이터가 서브에이전트의 컨텍스트에 들어오기도 전에 소스에서 제거하기 때문에 정답이다. 도구의 응답을 분석에 관련된 필드로 다듬는 것은 윈도우를 소진시키는 불균형한 토큰 누적을 직접 막는다.

**C.** Move the subagent to a model with a larger context window so more documents fit before the limit is reached.

**설명**

더 큰 윈도우는 같은 실패를 더 높은 비용으로 미루는 것일 뿐이며, 관련 없는 필드로 채워진 긴 컨텍스트는 여전히 중요한 콘텐츠에 대한 주의를 떨어뜨린다. 장황한 도구 출력이 컨텍스트에 들어온다는 근본 원인은 그대로 남는다.

**D.** Have the coordinator summarize the subagent's accumulated results after each document so the history stays compact.

**설명**

코디네이터 측 요약은 장황한 페이로드가 이미 서브에이전트 자체의 컨텍스트를 채운 이후에 일어나므로 분석 중간의 소진을 막지 못한다. 요약은 또한 출처가 명시되는 연구 품질이 의존하는 날짜, 수치 같은 정밀한 세부사항을 잃을 위험이 있다.

### 전반적인 설명

도구 결과는 관련성에 비례하지 않게 컨텍스트에 누적된다. 원본 페이로드에 수십 개의 크롤링 및 인코딩 필드를 더해 반환하는 가져오기 작업은 모델이 결코 사용하지 않을 데이터에 토큰을 소비하며, 다중 문서 분석 루프에서 이 낭비는 호출마다 누적된다. 올바른 사고 모델은 컨텍스트 윈도우가 공유 예산이며, 모든 도구 응답은 그 내용이 중요한지 여부와 무관하게 예산을 인출한다는 것이다. 따라서 가장 효과적인 수정은 도구 인터페이스 자체에 있다. fetch_document가 간결하고 목적에 맞는 페이로드(제목, 발행일, 작성자, 관련 텍스트)를 반환하도록 설계하여 관련 없는 바이트가 컨텍스트에 전혀 들어오지 않게 하는 것이다.

도구의 계약을 고치는 것이 다운스트림 완화책보다 나은 이유는 결정적이고 모든 호출에 적용되기 때문이다. 메타데이터를 무시하라는 프롬프트 지시는 토큰 소비에 아무 변화를 주지 못한다. 필드들은 여전히 윈도우를 차지하고 주의를 희석시킨다. 더 큰 컨텍스트 윈도우로 바꾸는 것은 실패를 제거하는 대신 미루는 것이며, 긴 노이즈 컨텍스트는 여전히 윈도우 중간 콘텐츠에 대한 회상 저하를 겪는다. 코디네이터 측 요약은 서브에이전트 자체의 윈도우가 이미 채워진 후에 작동하므로 한 계층 늦으며, 정확한 날짜와 수치, 귀속 정보를 보존하는 데 가치가 달려 있는 연구 시스템에서 손실 압축은 나쁜 거래다.

원본 덤프 대신 신호 밀도가 높은 구조화된 결과를 반환한다는 이 원칙은 에이전트를 위한 핵심 컨텍스트 엔지니어링 관행이다. 사후에 팽창을 관리하려 하기보다 윈도우에 들어오는 것 자체를 설계하라. AI 에이전트를 위한 효과적인 컨텍스트 엔지니어링과 에이전트를 위한 효과적인 도구 작성에 관한 Anthropic의 가이드를 참고하라.

### 도메인

Context Management & Reliability

### 출처: Test4.md
## 질문 30

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : A developer built a personal changelog-drafting MCP server and wants it available in every repository they work in on their machine, without any teammate receiving it. How should the server be registered?

**A.** Add it to each repository's .mcp.json and tell teammates to decline it at the project-server approval prompt.

**설명**

프로젝트 루트의 .mcp.json 파일은 커밋되는 것을 전제로 하므로, 이 방식은 각 저장소를 클론하는 모든 사람에게 개인 서버를 함께 배포하는 셈이다. 승인 프롬프트는 저장소가 제공하는 프로세스에 대한 동의 안전장치일 뿐, 처음부터 공유되어서는 안 되었던 도구를 팀원이 선택적으로 거부하도록 하는 메커니즘이 아니다.

**B.** Define it in .claude/settings.local.json in each repository so the configuration stays out of version control.

**설명**

.claude/settings.local.json 파일은 로컬 Claude Code 설정을 담는 곳이며, MCP 서버 정의를 위한 문서화된 위치가 아니다. MCP 로컬 스코프조차 서버 항목을 이 프로젝트 파일이 아니라 홈 디렉터리의 ~/.claude.json에 저장한다.

**C.** Add it at local scope in each repository, repeating the registration whenever a new project is cloned.

**설명**

로컬 스코프는 비공개이며 마찬가지로 ~/.claude.json에 저장되지만, 등록된 프로젝트에서만 활성화된다. 모든 저장소에서 사용 가능해야 한다는 요구사항을 충족하려면 프로젝트마다 새로 등록해야 하는데, 사용자 스코프는 이를 단 한 번의 명령으로 달성한다.

**D(정답).** Register it once at user scope so it is stored in ~/.claude.json and loads across all projects.

**설명**

이는 정답이다. 사용자 스코프는 서버를 ~/.claude.json에 저장하는데, 이는 개발자 계정에 비공개이며 버전 관리를 통해 절대 공유되지 않는 동시에, 그 기기의 모든 프로젝트에서 서버를 사용 가능하게 만든다. 단 한 번의 등록으로 크로스 프로젝트 요구사항과 프라이버시 요구사항을 모두 충족한다.

### 전반적인 설명

Claude Code는 MCP 서버 설정을 스코프별로 해석하며, 선택하는 스코프는 사실상 대상 범위와 도달 범위에 대한 선언이다. 사용자 스코프 서버는 홈 디렉터리의 ~/.claude.json에 있다. 계정을 따라 그 기기의 모든 프로젝트에 걸쳐 적용되지만 팀원에게는 보이지 않는데, 이는 어디서나 쓰이는 개인 유틸리티에 정확히 필요한 조합이다. 프로젝트 스코프 서버는 저장소 루트의 .mcp.json에 있으며 커밋되는 것을 전제로 하므로, 프로젝트를 클론하는 누구나 이를 물려받는다. 이는 공유 팀 도구에 적합한 자리이며 개인용 헬퍼에는 잘못된 자리다. claude mcp add의 기본값인 로컬 스코프 역시 ~/.claude.json에 저장되지만 등록된 프로젝트에서만 적용되므로, 모든 저장소에서 필요한 유틸리티보다는 프로젝트별 실험이나 자격 증명을 담은 서버에 적합하다.

커밋된 .mcp.json은 클론된 저장소가 개발자 기기에서 실행될 프로세스를 정의할 수 있게 하므로, Claude Code는 대화형 세션에서 사용하기 전에 각 사용자에게 프로젝트 스코프 서버를 승인하도록 요구한다. 그 프롬프트는 동의를 위해 존재하는 것이며, 팀원이 개인 서버를 거부할 수 있게 하려고 이를 의존하는 것은 안전장치를 오용하고 공유 파일을 어지럽히는 것이다. 모든 저장소에서 로컬 스코프 등록을 반복하는 것은 기술적으로는 프라이버시를 지키지만, 사용자 스코프가 한 번에 제공하는 것을 손으로 재현하는 셈이다. 그리고 .claude/settings.local.json은 로컬 Claude Code 설정을 관리하는 곳이지 MCP 서버가 정의되는 곳이 아니라는 점을 문서에서도 명시적으로 구분한다. 스코프 동작에 대해서는 Connect Claude Code to tools via MCP를, 각 스코프에서 서버를 추가하는 방법에 대해서는 MCP quickstart를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test4.md
## 질문 32

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : An agent tracing a re-exported utility Greps for each exported name, but the results list only file paths, so it cannot tell import statements apart from actual call sites. What is the correct next step?

**A.** Fall back to Bash running grep -rn, since the built-in Grep tool is limited to reporting file paths.

**설명**

전제 자체가 틀렸다. 내장 Grep 도구는 파일 경로만 반환하도록 제한되어 있지 않으며, 단지 기본값이 그 모드일 뿐이다. 셸 grep으로 내려가는 것은 에이전트가 소비하는 구조화된 출력을 제공하는 전용 도구를 버리는 것이며, -r 플래그는 내장 도구가 제공하는 gitignore 처리도 무시한다.

**B(정답).** Re-run Grep in content output mode so each match returns the matching line with its file and line number.

**설명**

Grep은 기본적으로 패턴을 포함한 파일의 경로만 반환하는 files_with_matches 모드로 동작한다. content 모드로 전환하면 파일명과 줄 번호와 함께 매칭된 줄 자체를 반환하는데, 이것이 바로 import문과 실제 호출 지점을 구분하는 데 필요한 정보다.

**C.** Wrap the search pattern in wildcards such as .*name.* so Grep returns entire matching lines instead of paths.

**설명**

정규식 패턴은 어떤 텍스트가 매칭되는지를 제어할 뿐, 결과가 어떻게 보고되는지는 제어하지 않는다. 와일드카드로 패턴을 넓혀도 출력 모드는 바뀌지 않으므로 도구는 여전히 파일 경로만 반환한다.

**D.** Switch to Glob with the exported name as the pattern, since Glob reports richer detail about each match than Grep.

**설명**

Glob은 파일명과 경로를 패턴과 매칭시킬 뿐 파일 내용을 절대 들여다보지 않으므로, export된 심볼 이름은 Glob이 검색할 수 있는 대상이 아니다. 또한 어떤 형태로든 줄 단위 세부정보를 반환하지 않는다.

### 전반적인 설명

ripgrep 기반의 내장 Grep 도구는 결과를 보고하는 방식이 하나가 아니다. 기본값인 files_with_matches는 "이 패턴을 포함한 파일은 무엇인가?"라는 질문에 파일 경로만 반환해 답한다. 이 기본값은 의도적인 절약이다. 많은 검색에서는 심볼이 어디에 있는지 아는 것만으로 충분하며, 흔한 식별자에 대해 매칭되는 모든 줄을 반환하면 컨텍스트 윈도우가 넘칠 것이다. re-export된 함수의 import문과 실제 호출을 구분하는 것처럼 매칭 자체를 살펴봐야 하는 작업이라면, 에이전트는 content 모드를 요청해야 하며, 이는 각 매칭 줄을 파일명 및 줄 번호와 함께 반환한다. 또 다른 문서화된 방법은 경로 목록을 유지한 채 관련 파일에 대해 Read를 후속으로 실행하는 것이지만, content 모드로 검색을 재실행하면 호출 지점 증거를 한 단계로 얻을 수 있다.

유지할 만한 사고 모델은, 검색에는 두 개의 독립적인 축이 있다는 것이다. 무엇을 매칭할지(정규식 패턴)와 무엇을 보고할지(출력 모드)다. 와일드카드로 패턴을 넓히는 것은 첫 번째 축만 바꾸므로 출력은 여전히 경로 목록으로 남는다. Glob을 쓰는 것은 두 축을 완전히 혼동하는 것이다. Glob은 파일명과 경로를 패턴과 매칭시킬 뿐 파일 내부를 절대 들여다보지 않으므로 심볼을 전혀 찾을 수 없다. Bash에서 grep -rn으로 대체하는 것은 기계적으로는 동작하지만, 내장 도구의 한계에 대한 잘못된 믿음에 근거한 것이며 구조화된 결과와 기본으로 제공되는 gitignore 인식 필터링을 포기하는 것이다.

Grep 도구의 출력 모드와 Glob 및 Read와의 관계에 대해서는 Claude Code 도구 레퍼런스를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test5.md
## 질문 4

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The synthesis subagent frequently needs quick single-fact checks while writing, but its role includes no search tools. A teammate proposes granting it the web-search agent's full eight-tool search set. What is the better design?

**A.** Delegate every individual fact check through the coordinator to the web-search agent as a separate task.

**설명**

이는 잘못된 답이다. 빈도가 높은 단순 조회를 매번 완전한 위임 왕복 과정으로 바꿔버리기 때문이다. 권장되는 패턴은 코디네이터 라우팅을 복잡한 검증에만 예약해두고, 빈도 높은 단순한 요구는 역할 간 제한된 도구로 처리하는 것이다.

**B.** Grant the full eight-tool search set, adding system prompt rules restricting its use to quick fact checks only.

**설명**

이는 잘못된 답이다. 프롬프트 지시는 도구 인벤토리 문제 위에 덧씌운 확률적 가이드일 뿐이다. 에이전트의 전문 영역 밖에 있는 도구는 단지 사용 가능하다는 이유로 오용되는 경향이 있으며, 여덟 개의 추가 도구는 에이전트가 내리는 모든 결정에서 선택 복잡도를 높인다.

**C(정답).** Give the synthesis agent a single scoped verify_fact tool and route complex verifications through the coordinator.

**설명**

이것이 정답인 이유는 목적에 맞게 설계된 단일 역할 간 도구로 빈도 높은 요구를 충족시키면서도, 합성 에이전트의 도구 인벤토리를 작게 유지하기 때문이다. 선택 신뢰성은 높게 유지되고, 드물게 발생하는 복잡한 검증은 여전히 코디네이터를 거쳐 전문 에이전트로 흘러간다.

**D.** Merge the synthesis and web-search agents into a single agent so all the needed tools live in one place.

**설명**

이는 잘못된 답이다. 두 전문 영역을 합치면 도구 집합이 더 커지고 역할이 더 넓어진 하나의 에이전트가 만들어지는데, 이는 정확히 도구 선택을 악화시키는 조건이다. 각 에이전트를 신뢰할 수 있게 만들었던 범위 제한을 포기하는 것이다.

### 전반적인 설명

에이전트의 도구 인벤토리 크기는 신뢰성을 좌우하는 아키텍처적 통제 요소다. 에이전트가 지니고 있는 도구 정의 하나하나가 매 턴마다 탐색해야 하는 결정 공간을 늘리며, 그 공간이 커질수록 선택 정확도는 떨어진다. Anthropic의 문서는 한 번에 너무 많은 도구가 노출되면 올바르게 선택하는 능력이 저하된다고 언급하며, 이것이 바로 tool search tool 같은 기법이 요청에 실제로 필요한 몇 개의 도구만 로드하기 위해 존재하는 이유다. 사고 모델은 예산과 같다. 에이전트는 역할과 관련된 소수의 도구 중에서는 잘 선택하지만, 방대한 카탈로그 안에서는 그렇지 못하며, 전문 영역 밖의 도구는 단지 존재한다는 이유로 오용을 유발한다.

이 상황의 긴장은 엄격한 역할 범위 제한이 실제로 존재하는 역할 간 요구와 충돌한다는 점이다. 설계된 절충안은 제한된 역할 간 유틸리티다. verify_fact처럼 좁게 범위가 정해진 단일 도구로 빈도 높은 단순 사례를 커버하고, 복잡한 검증 작업은 계속 코디네이터를 거쳐 웹 검색 전문 에이전트로 라우팅한다. 합성 에이전트의 인벤토리는 여덟 개의 범용 도구가 아니라 제한된 도구 하나만 늘어나므로, 그 선택 행동은 거의 바뀌지 않는다.

다른 대안들은 각기 무언가를 깨뜨린다. 전체 검색 도구 집합을 가져와 프롬프트 규칙으로 단속하는 것은 확률적 지시가 구조적 문제를 보완하도록 요구하는 것이며, 오용 패턴은 대체로 지속된다. 모든 간단한 사실 확인을 코디네이터 위임으로 강제하는 것은 순수성을 지키지만, 시스템에서 가장 빈번한 작업에 지연 시간과 조정 오버헤드라는 대가를 치른다. 두 에이전트를 합치는 것은 도구와 책임을 더 넓은 하나의 에이전트로 집중시켜, 전문화가 애초에 피하려 했던 과대 카탈로그 문제를 다시 만들어낸다.

### 도메인

Tool Design & MCP Integration

### 출처: Test5.md
## 질문 12

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline's post_review_comment MCP tool fails on pull requests opened from forks because the CI token lacks write access; the tool returns only "Operation failed," and the agent retries until the job times out. What should the tool return instead?

**A.** A successful result with empty content so the agent stops retrying and proceeds with the rest of the review.

**설명**

이는 오류를 조용히 억누르는 것으로, 문서화된 안티패턴이다. 재시도는 멈추지만, 이제 에이전트는 댓글이 게시되었다고 믿게 되어, 아무도 모르는 사이에 리뷰 피드백이 사라지고 근본적인 접근 권한 문제는 드러나지도 수정되지도 않는다.

**B(정답).** A permission-category error, isRetryable: false, and a message stating the CI token cannot write to fork pull requests.

**설명**

이것이 맞는 이유는, 권한 실패는 본질적으로 재시도할 수 없는 것이기 때문이다. 아무리 재시도해도 토큰에 쓰기 권한이 부여되지는 않는다. 오류를 분류하고 재시도 불가능으로 표시하면 헛된 재시도 루프가 멈추고, 설명이 담긴 메시지는 에이전트가 추측하는 대신 작업 결과에 문제를 보고하는 등 실행 가능한 설명을 제시할 수 있게 해준다.

**C.** The git provider's raw HTTP 403 response body in full so that no diagnostic detail is lost in translation.

**설명**

원시 프로바이더 페이로드는 에이전트가 필요로 하는 인터페이스가 아니다. 이는 내부 세부사항을 실제 신호와 섞어놓고 재시도 가능성에 대한 명시적인 안내를 전혀 주지 않는다. 에이전트는 여전히 실패를 잘못 해석할 수 있으며, 응답이 도구 결과에 속하지 않는 내부 정보를 노출할 수도 있다.

**D.** A transient-category error with isRetryable: true so the agent spaces retries with exponential backoff before giving up.

**설명**

이는 영구적인 접근 권한 문제를 일시적인 문제로 잘못 분류하는 것이다. 백오프는 이후의 시도가 성공할 가능성이 있을 때만 도움이 된다. 쓰기 권한이 없는 토큰은 모든 시도에서 실패할 것이므로, 이 설계는 결국 실패하기 전에 여전히 파이프라인 시간을 낭비한다.

### 전반적인 설명

균일한 "Operation failed" 응답의 근본적인 문제는, 서로 다른 복구 동작을 요구하는 여러 실패 모드를 구분되지 않는 하나의 신호로 뭉개버린다는 것이다. 일시적인 장애는 재시도해야 하고, 잘못된 입력은 수정해야 하며, 포크 풀 리퀘스트에 쓰기를 할 수 없는 CI 토큰과 같은 권한 실패는 시도 사이에 그 조건이 바뀌지 않으므로 결코 재시도해서는 안 된다. 도구가 그 분류를 숨기면 에이전트는 추측에 의존하게 되며, 이것이 바로 작업의 시간 예산을 갉아먹는 재시도 루프를 만들어내는 원인이다.

Anthropic의 지침은 도구 오류를 정보성 있고 실행 가능하게 만들라는 것이다. 단순한 실패 문자열을 반환하는 대신 무엇이 잘못되었는지와 모델이 다음에 무엇을 해야 하는지를 말해야 한다. 오류 분류와 isRetryable 플래그 같은 구조화된 메타데이터는 복구를 에이전트가 결과 자체로부터 결정론적으로 내릴 수 있는 판단으로 바꾸어준다. 권한 오류의 경우 isRetryable: false는 즉시 재시도 루프를 종료시키고, 사람이 읽을 수 있는 메시지는 에이전트에게 유지관리자가 토큰 범위를 고칠 수 있도록 풀 리퀘스트 실행 결과에 주석을 남기는 등의 유용한 대안 행동을 제시해준다. 사고 모델은, 도구 결과가 에이전트가 외부 세계를 인지하는 유일한 통로라는 것이다. 도구가 생략하는 뉘앙스가 무엇이든, 에이전트는 그것에 대해 행동할 수 없다.

각 대안은 이 계약을 서로 다른 방식으로 깨뜨린다. 실패를 일시적이라고 표시하고 백오프를 적용하는 것은 결코 성공할 수 없는 루프를 그저 느리게 만들 뿐이다. 빈 성공을 반환하는 것은 오류를 완전히 억눌러 피드백이 조용히 사라지고 잘못된 설정이 발견되지 않은 채로 남게 된다. 원시 HTTP 403 본문을 그대로 쏟아내는 것은 세부 정보를 보존하지만 재시도 가능성에 대한 명시적인 신호가 없는 형태로 전달하여 해석을 운에 맡기게 된다. is_error: true와 함께 설명적이고 복구 지향적인 오류 내용을 반환하는 문서화된 패턴에 대해서는 Handle tool calls and errors를 참조하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test5.md
## 질문 16

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : A subagent asked to find all callers of a deprecated helper gets zero Grep matches. It currently retries the identical search several times, then reports a generic search failure to the coordinator. What is the correct behavior?

**A(정답).** Report the zero-match outcome as a successful result stating that no callers were found.

**설명**

성공적으로 실행되어 아무것도 일치하지 않은 Grep 검색은 유효한 빈 결과이며, 실패가 아니다. 서브에이전트는 이를 정당한 발견으로 보고해야 한다. 호출자가 없다는 사실 자체가 폐기(deprecation) 작업에서 코디네이터가 필요로 하는 정확한 답이기 때문이다.

**B.** Pass the raw zero-match output upward flagged with isError so the coordinator can decide how to proceed.

**설명**

성공한 조회에 오류 플래그를 설정하면 코디네이터에게 잘못된 정보를 전달하게 되며, 코디네이터는 올바른 발견을 장애로 간주하고 복구를 시도하게 된다. 오류 채널은 도구가 실제로 실행에 실패했을 때만 사용해야 한다.

**C.** Return the empty result to the coordinator with a structured error marked transient and isRetryable true.

**설명**

유효한 빈 결과를 일시적(transient)이고 재시도 가능한 오류로 표시하면, 코디네이터는 이미 올바른 답을 낸 검색을 다시 실행하게 된다. transient 범주는 타임아웃이나 서비스 불가와 같은 접근 실패를 위해 예약된 것이다.

**D.** Retry locally with progressively broader Grep patterns and backoff, then report failure if still empty.

**설명**

백오프를 적용한 로컬 재시도는 타임아웃과 같은 일시적 접근 실패에 대한 올바른 대응이며, 성공적으로 완료된 검색에 대한 대응이 아니다. 패턴을 넓히는 것 역시 질문 자체를 바꾸는 것이므로, 결과는 더 이상 코디네이터의 원래 요청에 대한 답이 되지 못한다.

### 전반적인 설명

신뢰할 수 있는 오류 전파는 많은 설계가 놓치는 하나의 구분에 의존한다. 접근 실패(타임아웃, 서비스 장애, 권한 차단)는 유효한 빈 결과(완료까지 실행되었지만 단순히 아무것도 일치하지 않은 조회)와 근본적으로 다르다. 전자는 복구해야 할 문제이고, 후자는 답이다. 폐기 작업에서 호출자가 0개라는 것은 어쩌면 가장 좋은 발견일 수 있다. 그 헬퍼를 제거할 수 있다는 의미이기 때문이다. 성공한 빈 검색을 재시도하는 서브에이전트는 문제가 아닌 것에 도구 호출 예산을 낭비하는 것이고, 이를 실패로 보고하는 서브에이전트는 코디네이터가 가진 코드베이스에 대한 그림을 오염시킨다.

이는 서브에이전트 아키텍처에서 컨텍스트 격리 때문에 더욱 중요하다. 서브에이전트는 자신만의 별도 대화에서 실행되며, 오직 그 최종 메시지만 코디네이터에게 전달된다. 코디네이터는 내부의 Grep 호출이나 재시도를 전혀 보지 못하므로, 서브에이전트가 무엇을 보고하기로 선택하든 그것이 코디네이터가 갖게 되는 전체 그림이 된다. 그 최종 메시지에서 빈 결과를 오류로 잘못 분류하면 불필요한 재실행이나 무의미한 에스컬레이션으로 이어질 수 있다.

건전한 역할 분담은 다음과 같다. 진짜로 일시적인 실패는 재시도와 백오프로 로컬에서 처리하고, 해결할 수 없는 실패는 구조화된 컨텍스트(실패 유형, 시도한 내용, 부분 결과)를 전파하며, 조회가 일치 없이 성공했을 때는 정확히 그것을 성공적인 결과로 보고한다. 검색 패턴을 넓히거나, 결과를 isError로 표시하거나, transient로 분류하는 것은 모두 올바른 답을 오작동으로 취급하는 것이다. 서브에이전트 결과가 부모 에이전트로 전달되는 방식에 대해서는 Claude Agent SDK 서브에이전트 문서를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test5.md
## 질문 18

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : To retrieve return and billing policies, the agent was given a generic fetch_url tool. Logs show it fetching internal admin pages and unrelated third-party sites, producing inconsistent policy answers. Which redesign most reliably prevents this misuse?

**A.** Add system prompt instructions stating that fetch_url must only retrieve pages from the policy knowledge base.

**설명**

프롬프트 지시는 강제가 아니라 확률적 가이드이다. 도구가 어떤 URL이든 받을 수 있는 한, 에이전트는 이를 오용할 능력을 계속 갖고 있으며, 오용은 어떤 조건에서든 다시 발생할 것이다.

**B.** Add harness-level filtering that blocks fetch_url calls to known admin and third-party domains.

**설명**

차단 목록은 사후 대응적이다. 이미 예상한 대상만 막을 수 있고, 새로 등장하는 무관한 사이트는 걸러지지 않는다. 또한 유혹 자체를 인터페이스에서 제거하는 대신, 에이전트가 시도했다가 거부되는 호출을 계속 만들게 둔다.

**C.** Expand fetch_url's description with explicit guidance on which URLs it should and should not retrieve.

**설명**

더 나은 설명은 모델이 여러 도구 중 선택해야 할 때 도구 선택을 개선하지만, 일단 호출된 범용 도구가 할 수 있는 일을 제한하지는 못한다. 도구는 여전히 임의의 URL을 받아들이므로 오용 가능성이 남는다.

**D(정답).** Replace fetch_url with a get_policy_article tool that accepts only knowledge base article identifiers.

**설명**

정답이다. 도구의 인터페이스 자체를 제약하면 원치 않는 행동이 단순히 저지되는 것이 아니라 불가능해지기 때문이다. 정책 문서 식별자만 받는 도구는 관리자 페이지나 제3자 사이트를 가져올 수 없으므로, 근본 원인을 역량 수준에서 해결한다.

### 전반적인 설명

여기서 근본 원리는 사후에 행동을 조정하려 하기보다 도구 인터페이스 수준에서 역량을 제약하는 것이다. 에이전트의 실질적 권한은 프롬프트가 어떻게 해야 한다고 말하는지가 아니라 그 도구가 무엇을 받을 수 있는지로 정의된다. 범용 fetch_url 도구는 네트워크상의 무엇이든 가져올 수 있는 능력을 부여하므로, 에이전트는 결국 설계자가 의도하지 않은 방식으로 그 능력을 사용하게 된다. 사용 가능하다는 사실 자체가 오용되는 이유이다. 범용 도구를 지식 베이스 식별자에 매핑된 get_policy_article 같은 목적에 특화된 도구로 교체하는 것은 최소 권한 원칙을 적용하는 것이다. 잘못된 행동이 인터페이스를 통해 더 이상 표현될 수 없으므로, 모델의 변동성이 얼마나 크든 그 행동을 만들어낼 수 없다.

이것이 대안들이 특유의 방식으로 부족한 이유이다. 프롬프트 지시와 더 풍부한 설명은 확률적 통제이다. 확률을 바꾸지만 능력은 그대로 남기며, 이는 정책 답변의 일관성이 최초 접촉 해결에 직접 영향을 미칠 때 받아들일 수 없다. 도메인 차단 목록은 열거적이다. 모든 나쁜 대상을 미리 예상해야 하며, 아직 목록에 없는 것은 그대로 통과한다. 제약된 도구 패턴은 문제를 뒤집어, 무한한 잘못된 입력의 집합이 아니라 작은 유효 입력의 집합을 정의한다. 동일한 패턴은 잘 설계된 에이전트 시스템 전반에서 나타난다. 예를 들어 개방형 쿼리 도구를 파라미터화된 조회로 교체하는 것이 그렇다.

좁고 잘 범위가 정해진 도구 계약이 에이전트 신뢰성을 어떻게 향상시키는지는 Writing tools for agents와 MCP tools 문서를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test5.md
## 질문 29

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : To assess a refactor of the harness's refund wrapper, Claude Code runs Grep with the pattern process_refund( to find call sites; the tool rejects the pattern and returns a diagnostic error. What is the correct next step?

**A.** Report the wrapper as unused, since the tool returned no matching lines for the pattern.

**설명**

도구는 매칭 결과 0건을 반환한 것이 아니라, 검색이 실행되기도 전에 패턴 자체를 거부했다. 검증 오류를 빈 결과로 취급하면 실패한 검색이 코드베이스에 대한 거짓 결론으로 조용히 바뀌게 된다.

**B(정답).** Escape the parenthesis in the pattern, since Grep interprets input as ripgrep regex, then rerun the search.

**설명**

정답이다. Grep은 ripgrep을 기반으로 하며 패턴을 정규표현식으로 취급하므로, 이스케이프되지 않은 여는 괄호는 유효하지 않은 그룹이 된다. 메타문자를 이스케이프하면(process_refund\() 패턴이 유효해지고 실제 호출 지점을 찾아내는데, 이는 정확히 진단 오류가 가능하게 하려던 수정 방법이다.

**C.** Switch the search to Glob, which matches literal strings without applying any regex interpretation.

**설명**

Glob은 파일 이름과 경로를 패턴에 대해 매칭할 뿐, 파일 내용은 전혀 검색하지 않으므로 함수의 호출 지점을 찾을 수 없다. 도구를 바꾸는 것은 패턴을 고치는 대신 내용 검색 자체를 포기하는 것이다.

**D.** Rerun the identical search, since a rejected pattern indicates a transient tool failure that a retry will clear.

**설명**

거부된 패턴은 입력의 검증 문제이지 도구의 일시적 실패가 아니다. 동일하게 잘못된 정규식을 재시도하면 똑같이 실패한다. 해법은 패턴을 수정하는 것이며, 이 때문에 오류에 ripgrep 진단 정보가 포함되어 있다.

### 전반적인 설명

Claude Code의 Grep 도구는 ripgrep을 기반으로 하므로, 모든 패턴은 리터럴 문자열이나 POSIX grep 문법이 아니라 ripgrep 정규표현식으로 파싱된다. (, ), ., * 같은 문자는 정규식 메타문자이므로, process_refund( 같은 호출 표현식을 검색하면 닫히지 않은 그룹이 되어 즉시 거부된다. 이는 설계된 동작이다. 패턴, glob, 또는 type 입력이 유효하지 않을 때, 도구는 ripgrep 진단 정보를 담은 오류를 반환하여 모델이 스스로 수정하고, 메타문자를 이스케이프하고(process_refund\()), 재시도할 수 있도록 정확히 필요한 정보를 제공한다. 이 피드백 루프는 구조화된 도구 오류 일반에 깔린 것과 같은 원리이다. 설명적인 실패는 복구를 가능하게 하고, 일반적인 실패는 그렇지 못한다.

거부된 패턴과 빈 결과 사이의 구분은 중요하다. 검증 오류는 검색이 전혀 실행되지 않았다는 뜻이므로, 함수가 사용되지 않는다고 결론짓는 것은 실패로부터 발견을 조작해내는 것이다. 동일한 패턴을 재시도하는 것은 확정적인 입력 문제를 타임아웃처럼 취급하는 것이다. Glob으로 바꾸는 것은 도구의 경계를 완전히 오해하는 것이다. Glob은 이름 패턴에 대해 파일 경로를 매칭할 뿐이며, 오직 Grep만 파일 내용을 검사하므로, 사용 추적에는 수정된 Grep 패턴을 대신할 것이 없다. 내장 검색 도구의 정규식 의미와 오류 동작은 Claude Code tools reference를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test5.md
## 질문 30

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : PDF summarization requests are consistently routed to the web-search subagent's summarize_page tool instead of the document agent's summarize_document tool. Both tools carry the description "Summarizes the provided content," and the coordinator's system prompt refers to every research source as a "page." Which TWO changes most directly fix the misrouting? (Select TWO.)

**A(정답).** Revise the coordinator's system prompt so it no longer calls every research source a "page."

**설명**

시스템 프롬프트의 표현은 모델이 도구 선택에 반영하는 연관성을 만들어낸다. 모든 소스를 "page"라고 부르면 로컬 문서에 대해서도 코디네이터가 page라는 이름이 붙은 도구 쪽으로 기울게 되므로, 이 편향된 어휘를 제거하는 것은 오배치의 근본 원인 중 하나를 직접적으로 해결한다.

**B(정답).** Expand each description with input formats and examples: a URL for summarize_page, a document ID for summarize_document.

**설명**

설명(description)은 모델이 도구를 선택할 때 사용하는 주된 메커니즘인데, 동일한 한 줄짜리 설명 두 개는 모델에게 구분할 근거를 아무것도 제공하지 못한다. 각 도구의 입력 형식을 구체적인 예시와 함께 명시하면 각 도구의 영역이 뚜렷하게 구분되어 중첩 문제가 해결된다.

**C.** Enable strict tool use so every tool call is validated against the defined schemas and tool names before execution.

**설명**

Strict tool use는 도구 입력이 스키마를 준수하고 도구 이름이 사용 가능한 도구 중 하나인지를 보장한다. 그러나 의미상 겹치는 두 도구 중 어느 것이 적절한지 모델이 판단하는 데는 도움이 되지 않으므로, 형식은 올바르지만 잘못된 도구를 호출하는 오배치는 계속될 것이다.

**D.** Move summarize_document ahead of summarize_page in the tool catalog, since models weight tools listed earlier more heavily.

**설명**

도구 목록의 순서는 신뢰할 수 있는 선택 메커니즘이 아니며, 위치에 의존하는 것은 실제 모호성을 그대로 남겨둔다. 모델은 여전히 동일한 설명을 가진 두 도구와 그중 하나로 편향된 프롬프트를 마주하게 된다.

### 전반적인 설명

Claude는 선택 시점에 읽는 내용, 즉 도구 설명과 시스템 프롬프트를 포함한 주변 대화를 바탕으로 도구 호출을 라우팅한다. 두 도구가 "Summarizes the provided content"처럼 동일한 설명을 공유하면 모델은 이를 구분할 텍스트적 근거가 없으므로, 선택은 남아 있는 우연한 신호에 좌우되어 저하된다. 여기서 그 신호 중 하나는 실제로 해롭다. 모든 소스를 "page"라고 부르는 시스템 프롬프트가 page라는 이름의 도구와 연관성을 형성하여, PDF 요청조차 summarize_page 쪽으로 끌어당긴다.

따라서 해결책은 두 부분으로 나뉜다. 첫째, 오해를 유발하는 프롬프트 어휘를 제거한다. 시스템 프롬프트의 표현은 도구에 대한 의도하지 않은 연관성을 만들 수 있으며, 이 편향을 없애면 코디네이터가 잘못된 선택으로 이끌리는 것을 막을 수 있다. 둘째, Anthropic이 도구 성능에서 가장 중요한 단일 요소라고 부르는 차별화된 세부 정보를 설명에 제공한다. 즉 각 도구가 입력으로 기대하는 것(URL 대 문서 ID)을 구체적인 예시와 함께 제시하여 각 도구의 영역을 명시적으로 만든다. Anthropic의 트러블슈팅 가이드는 Claude가 의도한 도구 B 대신 도구 A를 호출할 때 설명의 모호성을 원인으로 지목하며, 문서화된 해결책은 강제 메커니즘을 추가하는 것이 아니라 설명을 정교하게 다듬는 것이다.

Strict tool use는 다른 문제를 해결한다. 스키마에 맞는 입력과 유효한 도구 이름을 보장하여 형식이 잘못된 호출을 잡아내지만, 의미상 잘못된 도구 선택은 여전히 완전히 유효한 호출로 취급된다. 카탈로그 순서를 바꾸는 것은 문서화되지도 신뢰할 수도 없는 위치 효과에 기대는 것이며, 오배치를 일으키는 실제 모호성은 그대로 남는다. How to implement tool use, Troubleshooting tool use, Strict tool use를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test5.md
## 질문 44

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The review job resolves each pull request to its tracker ticket via an MCP lookup by feature name. Some lookups return multiple plausible tickets, and guessing has produced reviews against the wrong acceptance criteria. How should multiple matches be handled?

**A.** Review the diff against the acceptance criteria of every candidate ticket and combine all findings in one report.

**설명**

PR이 구현하지 않은 티켓의 기준으로 리뷰하면 근거 없는 발견 항목이 생겨서, 파이프라인이 최소화하려는 오탐률을 직접적으로 부풀립니다. 이는 어떤 티켓이 적용되는지 해결하는 대신 올바른 리뷰를 노이즈 속에 묻어버립니다.

**B(정답).** Post PR feedback flagging the ambiguous match, request the exact ticket ID from the author, and defer the criteria check.

**설명**

이는 정답입니다. 여러 매치 사이의 모호함은 답을 실제로 알고 있는 사람, 즉 PR 작성자로부터 확정적인 식별자를 얻어서 해결해야 하기 때문입니다. 비대화형 파이프라인에서는 리뷰 출력 자체가 그 요청을 전달하는 채널이 되며, 체크를 뒤로 미루는 것은 잘못된 기준으로 리뷰하는 것을 방지합니다.

**C.** Rank the candidate tickets by textual similarity to the PR description and review against the highest-scoring match.

**설명**

유사도 순위는 방법으로 치장된 휴리스틱 추측일 뿐이며, 여전히 확정적인 근거 없이 후보 하나를 선택하게 됩니다. 유사도 신호가 오도될 때마다 이 변경을 촉발한 잘못된 티켓 리뷰가 계속될 것입니다.

**D.** Have Claude rate its confidence in each candidate and proceed with the review whenever the rating clears a threshold.

**설명**

모델의 자체 평가 신뢰도는 신뢰할 수 없는 대체 지표입니다. 모델은 자신 있게 틀릴 수 있고, 그 점수는 보정이 잘 되어 있지 않습니다. 임계값을 넘으면 진행하는 것은 모호함을 해결하는 대신 같은 추측 행동을 자동화하는 것에 불과합니다.

### 전반적인 설명

조회가 여러 개의 그럴듯한 매치를 반환할 때, 신뢰할 수 있는 해결책은 항상 실제로 답을 아는 사람으로부터 추가적인 확정 식별자를 얻는 것이며, 휴리스틱으로 후보를 선택하는 것이 아닙니다. 대화형 세션에서는 대화 중간에 사용자에게 물어보는 것을 의미하고, 에이전트가 입력을 위해 멈출 수 없는 헤드리스 CI 실행에서는 그와 동등한 채널이 실행 자체의 출력입니다. 즉, 모호함을 PR 피드백으로 게시하고, 작성자에게 정확한 티켓 ID를 요청하고, 식별자가 도착할 때까지 승인 기준 체크를 뒤로 미루는 것입니다. 작성자는 PR이 어떤 티켓을 구현하는지에 대한 확실한 지식을 갖고 있으므로, 한 번의 추가 왕복으로 잘못된 티켓 리뷰라는 오류 유형 전체를 없앨 수 있습니다.

오답 보기들은 모두 더 많은 장치를 덧붙인 채 여전히 추측을 계속합니다. 텍스트 유사도 순위는 티켓 제목이 겹칠 때 정확히 실패하는 확률적 대체 지표인데, 그 겹침이 바로 모호함이 발생하는 원인입니다. 신뢰도 자체 평가는 보정이 잘 되어 있지 않습니다. 모델은 바로 어려운 사례에서 자신 있게 틀리는 경향이 있으므로, 임계값으로는 올바른 매치와 잘못된 매치를 구분할 수 없습니다. 모든 후보의 기준으로 리뷰하는 것은 잘못된 리뷰를 노이즈 많은 리뷰로 바꿔치기할 뿐입니다. 구현되지 않은 티켓에서 파생된 발견 항목은 구조적으로 오탐이며, 이는 파이프라인이 목표로 하는 실행 가능하고 노이즈가 적은 피드백이라는 목표를 훼손합니다.

일반적인 사고 모델은 이렇습니다. 휴리스틱을 이용한 모호함 해소는 불확실성을 침묵의 오류로 바꾸는 반면, 명시적인 확인 요청은 그것을 눈에 보이고 비용이 적게 드는 하나의 상호작용으로 바꿉니다. 대화형이든 자동화된 것이든 에이전트를 설계할 때는 모호함이 추측에 흡수되지 않고 누락된 식별자에 대한 요청으로 드러나도록 해야 합니다. 도구 통합과 신뢰할 수 있는 에이전트 동작에 대한 가이드는 Connect Claude Code to tools via MCP와 Building Effective Agents를 참고하십시오.

### 도메인

Context Management & Reliability

### 출처: Test5.md
## 질문 47

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : A scheduled CI job kicks off a headless research report with claude -p, but runs still stall because the invocation configures an MCP permission prompt tool that no host answers in CI. What change lets the job complete unattended?

**A(정답).** Add --permission-prompts none so the run skips the permission host and denies any action that would have prompted.

**설명**

이 플래그는 Claude Code에게 구성된 권한 호스트에게 물어보거나 응답을 기다리지 말도록 지시하므로, 아무도 응답하지 않을 승인을 기다리며 실행이 멈추는 일이 없어진다. 프롬프트가 필요했을 행동은 무기한 대기 대신 거부되어, 작업이 결정적으로 완료된다.

**B.** Drop the -p flag so the session's interactive interface can surface and resolve the approval prompts.

**설명**

-p를 제거하면 대화형 세션이 시작되는데, 이는 CI 작업이 지원할 수 없는 정확히 그 상황이다. 터미널 앞에서 응답할 사람이 없다. 작업은 권한 호스트가 아니라 대화형 입력에서 멈추게 된다.

**C.** Pipe a continuous stream of yes responses into the process's standard input so every approval request is answered automatically.

**설명**

권한 프롬프트 도구로 라우팅되는 권한 요청은 그 호스트가 응답하는 것이며, 프로세스의 표준 입력을 읽어 응답되는 것이 아니다. stdin에 텍스트를 흘려 넣는 것으로는 승인 흐름을 만족시킬 수 없으며, 설령 동작한다 해도 일괄 자동 승인은 안전하지 않은 패턴이다.

**D.** Add --output-format json so the run emits machine-readable results instead of pausing for approval input.

**설명**

출력 형식은 실행이 결과를 만들어낸 이후, 그 결과를 어떻게 직렬화할지만 통제한다. 권한 흐름에는 아무 영향이 없으므로, 실행은 여전히 응답 없는 권한 호스트를 기다리게 된다.

### 전반적인 설명

-p(--print) 플래그는 Claude Code를 비대화형으로 실행하게 하지만, 그것만으로는 완전한 무인 실행 전략이 되지 못한다. 권한 처리는 별도의 계층이다. MCP의 --permission-prompt-tool이나 Agent SDK의 canUseTool 콜백처럼 권한 호스트가 구성된 경우, 승인이 필요한 모든 도구 호출은 그 호스트로 라우팅되며 실행은 그 응답을 기다린다. CI 환경에는 그 호스트 뒤에 응답할 무언가가 없으므로, 세션 자체는 헤드리스임에도 실행이 멈추게 된다.

--permission-prompts none 플래그는 정확히 이런 상황을 위해 존재한다. 이는 Claude Code에게 권한 호스트에 전혀 물어보거나 기다리지 말도록 지시하며, 다른 방법으로 해결할 수 없는 프롬프트 대상 행동은 보류 상태로 남기는 대신 거부된다. 이는 일부 능력(거부되는 행동)을 희생하는 대신 파이프라인이 실제로 중요하게 여기는 보장, 즉 작업이 항상 종료된다는 것을 얻는 거래다. 이 플래그는 최신 Claude Code 버전(v2.1.259 이상)이 필요하다는 점에 주의하라. 올바른 사고 모델은 계층화된 파이프라인 구성이다. -p는 세션의 대화형 여부를 처리하고, --allowedTools 같은 도구 사전 승인 플래그는 어떤 호출이 절대 프롬프트를 띄우지 않을지를 처리하며, --permission-prompts none은 여전히 프롬프트를 띄울 수 있는 나머지 모든 것에 어떤 일이 일어날지를 처리한다.

다른 접근 방식들은 잘못된 계층을 대상으로 삼기 때문에 실패한다. stdin에 긍정 응답 텍스트를 흘려 넣어도 승인은 표준 입력을 통해 흐르지 않으므로 권한 호스트에 도달하지 못한다. 출력 형식을 바꾸는 것은 결과 직렬화에만 영향을 주고 승인 흐름에는 영향을 주지 않는다. -p를 제거하는 것은 응답할 사람이 없는 환경에 대화형 세션을 다시 들여옴으로써 상황을 더 악화시킨다. 무인 실행을 위한 전체 구성은 Headless mode와 CLI 레퍼런스를 참고하라.

### 도메인

Claude Code Configuration & Workflows

### 출처: Test5.md
## 질문 48

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : The repository's CLAUDE.md mixes conventions for MCP tool-handler code in src/tools/, conventions for test files scattered throughout the tree, and deployment notes. You want each convention set loaded only when matching files are being worked on. What should you do?

**A.** Keep one CLAUDE.md and use @import statements to pull each convention set in from separate topic files.

**설명**

임포트는 내용을 별도의 파일로 정리해주지만, 임포트된 모든 내용은 실행 시점에 펼쳐져 로드된다. 이는 유지보수성을 개선할 뿐 조건부 로딩을 달성하지는 못하므로, 모든 컨벤션 세트가 여전히 모든 세션에서 컨텍스트를 차지하게 된다.

**B(정답).** Move each convention set into its own .claude/rules/ file with paths glob frontmatter matching relevant files.

**설명**

이 답이 옳다. .claude/rules/의 규칙 파일은 YAML 프런트매터에 paths 필드를 선언할 수 있으며, 이러한 규칙은 Claude가 글롭 패턴에 매칭되는 파일로 작업할 때만 로드된다. 이는 주제별 조건부 로딩을 제공하여, 관련 없는 컨벤션이 컨텍스트에 들어오지 않게 해준다.

**C.** Add a CLAUDE.md inside src/tools/ and inside each directory that contains test files or deployment scripts.

**설명**

디렉터리 단위 CLAUDE.md 파일은 해당 디렉터리에 묶여 있으므로, 여러 위치에 흩어진 테스트 파일에는 통하지 않는다. 테스트가 있는 모든 디렉터리에 복사본이 필요해진다. 글롭 범위의 규칙은 위치와 무관하게 파일 유형별로 적용되므로 이 상황에 더 적합하다.

**D.** Convert each convention set into a slash command that developers run when they start work in that area.

**설명**

슬래시 명령어는 선택적으로 사용하는 프롬프트 템플릿이므로, 누군가 명령어를 호출하는 것을 기억할 때만 컨벤션이 적용된다. 매칭되는 파일 작업을 자동으로 규율해야 하는 컨벤션에는 수동 호출 없이 로드되는 메커니즘이 필요하다.

### 전반적인 설명

.claude/rules/ 디렉터리는 단일 거대 CLAUDE.md에 대한 모듈식 대안이며, 그 핵심 레버는 YAML 프런트매터의 paths 필드다. paths: ["src/tools/**/*"] 또는 paths: ["**/*.test.ts"]가 있는 규칙은 Claude가 해당 글롭에 매칭되는 파일로 작업할 때만 로드되는 반면, paths가 없는 규칙은 .claude/CLAUDE.md와 동일한 우선순위로 실행 시점에 무조건 로드된다. 개념 모델은 다음과 같다. 무조건 로드되는 모든 것은 매 세션에서 주의를 두고 경쟁하므로, 조건부 로딩은 단순한 토큰 최적화가 아니라, 실제로 적용될 때 각 규칙이 더 잘 준수되도록 만들어준다.

글롭 범위의 규칙은 디렉터리 단위 CLAUDE.md 파일이 풀 수 없는 위치 문제도 해결한다. 디렉터리 CLAUDE.md는 하나의 폴더를 규율하는데, 이는 하나의 영역에 묶인 컨벤션에는 통하지만, 테스트 대상 코드와 함께 배치된 테스트 파일처럼 트리 전체에 흩어진 파일 유형에는 통하지 않는다. **/*.test.ts와 같은 패턴은 하나의 규칙 파일로 이들을 모두 다룬다. Claude Code는 .claude/rules/ 아래를 재귀적으로 탐색해 규칙 파일을 찾아내므로, 규칙 자체도 주제별로 하위 디렉터리로 정리할 수 있다는 점도 참고할 만하다.

오답들은 각각 조건부 로딩 요구사항을 놓치고 있다. @import 구문은 소스 파일을 모듈화하지만, 임포트된 내용은 실행 시점에 인라인으로 펼쳐지므로 컨텍스트 사용량은 변하지 않는다. 슬래시 명령어는 컨벤션을 선택적으로 만드는데, 이는 가끔 있는 워크플로우에는 적합하지만 매칭되는 모든 편집을 규율해야 하는 표준에는 적합하지 않다. 규칙과 경로 범위 지정의 전체 동작에 대해서는 "Claude의 메모리 관리" 문서를 참고하라.

### 도메인

Claude Code Configuration & Workflows

### 출처: Test5.md
## 질문 53

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : The repository for this agent keeps orchestration code at the root and the MCP tool implementations under tools/. Strict TypeScript standards must apply everywhere, while error-handling conventions apply only to the tool code. Where should each set of instructions live?

**A.** Put the error-handling conventions in the project root CLAUDE.md and the TypeScript standards in a CLAUDE.md inside the tools/ directory.

**설명**

이 방법은 계층 구조를 뒤집는다. 보편적인 TypeScript 표준은 tools/ 아래에서 작업할 때만 나타나게 되고, tools에만 해당하는 에러 처리 컨벤션은 저장소 전체의 모든 세션에 로드되어 관련 없는 컨텍스트를 추가하게 된다.

**B(정답).** Put the TypeScript standards in the project root CLAUDE.md and the error-handling conventions in a CLAUDE.md inside the tools/ directory.

**설명**

이 답은 각 컨벤션을 계층 구조상 올바른 레벨에 맞춘다. 프로젝트 레벨 CLAUDE.md는 저장소의 모든 세션에서 로드되므로 보편적인 표준이 항상 적용되며, 디렉터리 레벨 CLAUDE.md는 에러 처리 컨벤션의 범위를 tools/ 내 작업으로 한정해 관련 없는 세션을 어지럽히지 않는다.

**C.** Put the TypeScript standards in each developer's ~/.claude/CLAUDE.md and the error-handling conventions in the project root CLAUDE.md.

**설명**

사용자 레벨 CLAUDE.md 파일은 개인적인 것이며 버전 관리를 통해 전달되지 않으므로, 그곳에 둔 팀 전체 표준은 시간이 지나며 어긋나거나 새 팀원에게는 아예 존재하지 않게 된다. 또한 디렉터리 특정 컨벤션을 프로젝트 범위로 끌어올려, 적용되지 않아야 할 곳에서도 로드되게 만든다.

**D.** Put both sets in the project root CLAUDE.md, using section headings that state which directory each set of conventions applies to.

**설명**

루트 CLAUDE.md는 모든 세션에서 전체가 로드되므로, 관련 없는 코드를 편집하는 중에도 도구 특정 컨벤션이 컨텍스트를 차지하게 된다. 헤딩은 범위 지정 메커니즘이 아니라 모델이 해석해야 하는 프롬프트일 뿐이며, 컨벤션을 올바른 레벨에 두는 것보다 신뢰성이 떨어진다.

### 전반적인 설명

Claude Code의 메모리는 계층화되어 있다. 사용자 레벨(~/.claude/CLAUDE.md)은 모든 프로젝트에 걸친 한 사람의 선호를 담고 있으며 버전 관리를 통해 공유되지 않는다. 프로젝트 레벨(루트 CLAUDE.md 또는 .claude/CLAUDE.md)은 커밋되어 저장소의 모든 세션에서 로드된다. 하위 디렉터리의 디렉터리 레벨 CLAUDE.md 파일은 그 트리 부분에서 작업할 때 적용되는 컨벤션을 추가한다. 개념 모델은 광범위한 것에서 구체적인 것으로 향한다는 것이다. 각 레벨은 상위 레벨이 이미 말한 것을 반복하지 않고 범위를 좁혀나간다.

이 계층 구조 뒤에 있는 설계상의 트레이드오프는 컨텍스트 경제성과 커버리지 사이의 균형이다. 루트 파일에 있는 모든 것은 매 대화에 로드되며, 모든 줄이 모델의 주의를 두고 다른 모든 줄과 경쟁한다. 따라서 한 영역에만 중요한 지침이 모든 곳에 중요한 지침을 희석시킨다. TypeScript 표준을 프로젝트 레벨에 두면 모든 작업에 그 표준이 반영되는 것이 보장되며, tools/CLAUDE.md는 에러 처리 컨벤션을 그것이 규율하는 코드에 계속 붙여둔다. CLAUDE.md는 모델이 따르는 가이드라인이며 강제되는 설정이 아니라는 점을 기억해야 한다. 규칙을 절대 건너뛸 수 없게 해야 한다면, 훅이 적합한 수단이다.

다른 배치 방식들은 각각 이러한 특성 중 하나를 깨뜨린다. 레벨을 뒤집으면 보편적인 표준이 조건부가 되고 지역적인 컨벤션이 전역화된다. 단일 거대 루트 파일은 도구 특정 규칙을 관련 없는 세션에 로드하며 모델이 해석해야 하는 헤딩에 의존한다. 그리고 사용자 레벨 배치는 팀 표준의 공유를 완전히 없애버리는데, 이는 새 팀원의 세션이 컨벤션을 무시하게 되는 전형적인 원인이다. 전체 계층 구조에 대해서는 "Claude의 메모리 관리" 문서를 참고하라.

### 도메인

Claude Code Configuration & Workflows

### 출처: Test5.md
## 질문 56

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : Logs show the agent spends several exploratory tool calls each session probing which return policies and escalation categories exist before working the actual request. Which TWO changes correctly use MCP resources to remove this discovery overhead? (Select TWO.)

**A.** Convert process_refund into an MCP resource so its refund-processing logic is available as readable reference data.

**설명**

환불 처리는 부작용이 있는 행동이며, MCP는 프리미티브를 의도적으로 구분한다. 도구는 행동을 수행하고, 리소스는 읽기용 데이터를 노출한다. 행동을 리소스로 바꾸는 것은 프로토콜을 오용하는 것이며, 이를 통해서는 에이전트가 실제로 환불을 실행할 수 없게 된다.

**B(정답).** Expose the return-policy catalog (policy names, eligibility windows, covered categories) as a readable MCP resource.

**설명**

정답이다. 정책 카탈로그는 에이전트가 읽어야 할 데이터이지 수행할 행동이 아니며, 이는 정확히 MCP 리소스가 노출하도록 설계된 것이다. 이를 리소스로 게시하면 에이전트는 탐색을 위한 도구 호출을 소모하지 않고도 사용 가능한 정책의 즉각적인 지도를 얻는다.

**C(정답).** Publish the escalation-category taxonomy and its category descriptions as an MCP resource read at session start.

**설명**

정답이다. 유효한 에스컬레이션 범주의 집합은 참조용 맥락이므로, 탐색적 도구 호출 뒤에 숨기기보다 리소스 프리미티브에 속해야 한다. 세션 시작 시 분류체계를 한 번 읽으면 반복적인 탐색이 단 한 번의 조회로 대체된다.

**D.** Paste the full policy catalog and escalation taxonomy into the agent's system prompt so lookups are never needed.

**설명**

인벤토리를 프롬프트에 하드코딩하면 정책이나 범주가 바뀌는 순간 낡은 정보가 되어, 카탈로그가 제거하려던 모호함을 다시 불러들인다. 또한 리소스가 요청 시 제공할 수 있는 정적 텍스트로 매 요청을 부풀리게 된다.

### 전반적인 설명

Model Context Protocol은 서버 기능을 의도적으로 별개의 프리미티브로 나눈다. 리소스는 애플리케이션이 제어하며 읽기용으로 노출되는 데이터로, GET 엔드포인트에 비유할 수 있다. 파일 내용, 데이터베이스 스키마, 정책 카탈로그, 작업 요약 등이다. 도구는 모델이 제어하며 행동을 수행하는 함수로, POST 엔드포인트에 비유할 수 있다. 쿼리 실행, 환불 처리 등이다. 사고 모델은, 리소스는 에이전트에게 무엇이 존재하는지 알려주고, 도구는 그것에 대해 무언가를 할 수 있게 해준다는 것이다.

이러한 구분은 정확히 이 상황의 문제를 해결하기 위해 존재한다. 카탈로그가 없으면 에이전트는 어떤 데이터와 범주가 사용 가능한지 알아내기 위해 탐색적 호출에 예산을 소모해야 하며, 실제 작업이 시작되기 전에 턴과 컨텍스트를 낭비하게 된다. 반품 정책 카탈로그와 에스컬레이션 분류체계를 리소스로 노출하면 탐색이 단 한 번의 읽기로 바뀌어, 에이전트는 매 세션을 이미 지형을 알고 있는 상태로 시작하게 되며, 이는 최초 접촉 해결 목표를 직접적으로 지원한다.

process_refund를 리소스로 재활용하는 것은 프리미티브를 뒤집는 것이다. 환불 처리는 부작용을 가지므로 도구로 남아있어야 하며, 리소스는 행동을 실행할 수 없다. 카탈로그를 시스템 프롬프트에 하드코딩하면 조회가 없어지는 것처럼 보이지만, 정책이 바뀌면서 현실과 어긋나는 스냅샷을 고정시키는 것이다. 리소스는 매 읽기마다 서버가 실시간 인벤토리를 제공하기 때문에 항상 최신 상태를 유지한다. 프리미티브 정의는 MCP Resources와 MCP Tools를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test6.md
## 질문 5

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The document analysis subagent needs both a listing of all available research corpora and the ability to fetch any single document's contents by its identifier. Which MCP resource design supports these two needs?

**A.** Define a single direct resource whose payload bundles the corpus listing together with the full text of every document it contains.

**설명**

모든 문서 내용을 하나의 리소스에 묶으면 카탈로그나 단일 문서만 필요할 때조차 에이전트가 전체 코퍼스를 컨텍스트로 끌어와야 한다. 이는 필요한 전체 콘텐츠를 선택적으로 가져오도록 하는 경량 지도라는 카탈로그의 목적 자체를 무력화한다.

**B.** Define one templated resource where passing a reserved identifier such as 'all' returns the listing instead of a single document.

**설명**

하나의 템플릿 리소스에 매직 식별자를 오버로딩하는 것은 서로 다른 두 종류의 읽기 작업을 하나의 URI 뒤에 뭉뚱그리는 것이며, 인터페이스를 모호하고 그 구조 자체로는 문서화되지 않게 만든다. 직접 리소스와 템플릿 리소스가 별개의 형태로 존재하는 이유는 정적인 목록과 매개변수화된 항목 접근 각각이 명확한 주소를 갖도록 하기 위해서다.

**C(정답).** Define a direct resource at a static URI for the listing, plus a templated resource with a {doc_id} parameter for individual documents.

**설명**

이는 두 가지 MCP 리소스 유형이 작업을 분담하는 방식과 정확히 일치한다. 고정 URI를 가진 직접 리소스는 안정적인 카탈로그를 제공하고, URI 매개변수를 가진 템플릿 리소스는 클라이언트가 ID로 임의의 단일 문서를 요청할 수 있게 한다. 두 요구사항 모두 도구를 추가하거나 과도한 크기의 페이로드 없이 읽기 지향 리소스 프리미티브를 통해 충족된다.

**D.** Define a get_document tool for the per-document reads, since MCP resources take no parameters and can only serve data at fixed static URIs.

**설명**

이는 잘못된 전제에 근거한다. MCP는 docs://documents/{doc_id}처럼 URI에 매개변수를 포함하는 템플릿 리소스를 지원하며, SDK가 이를 파싱해 핸들러에 전달한다. 순수한 읽기 작업에 도구를 사용하는 것은 액션 지향 프리미티브를 오용하는 것이다.

### 전반적인 설명

MCP 리소스는 프로토콜의 읽기 프리미티브다. 즉 에이전트가 어떤 액션을 수행하지 않고도 요청할 수 있는, 애플리케이션이 제어하는 데이터로, GET 엔드포인트와 유사하다. 리소스는 두 가지 형태로 제공된다. 직접 리소스는 정적 URI(예: docs://documents)에 위치하며, 연구 코퍼스 목록과 같은 안정적인 카탈로그에 자연스러운 위치다. 템플릿 리소스는 URI에 매개변수를 내장한다(예: docs://documents/{doc_id}). 서버 SDK가 이 매개변수를 파싱해 핸들러에 전달하므로, 에이전트는 ID로 임의의 개별 항목을 지정할 수 있다. 각각 하나씩 짝을 지어 제공하면 서브에이전트는 무엇이 존재하는지에 대한 즉각적인 지도와, 탐색적 도구 호출 없이도 임의의 단일 문서에 대한 정밀한 온디맨드 접근을 모두 얻게 된다.

유지할 사고 모델은 프리미티브 간 선택이 작업의 복잡도가 아니라 작업의 본질을 따른다는 것이다. ID로 문서를 가져오는 것은 인자를 받지만, 여전히 부작용이 없는 읽기 작업이므로 get_document 도구가 아니라 리소스에 속한다. 리소스가 매개변수를 받을 수 없다는 주장은 단순히 틀렸다. 모든 문서의 전체 텍스트를 하나의 거대한 직접 리소스에 묶으면 경량 카탈로그가 컨텍스트 폭증으로 바뀌어, 어떤 질문에 답하기 위해서도 에이전트가 전체 코퍼스를 섭취해야 하게 된다. 그리고 문서별 템플릿에 예약된 'all' 식별자로 목록을 라우팅하는 것은 프로토콜이 이미 각각을 위한 별도의 형태를 제공함에도 두 개의 서로 다른 인터페이스를 하나의 모호한 URI 뒤에 숨기는 것이다.

직접 리소스, 리소스 템플릿, 그 의도된 사용법에 대해서는 MCP Resources 공식 프로토콜 문서를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test6.md
## 질문 10

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pull request review step has the agent list every YAML manifest with a Glob call using **/*.yaml. The results include generated files under the gitignored dist/ directory, and the review flags them. What is the correct fix?

**A.** Fix the repository's .gitignore entries, since Glob only returns files from ignored directories when the ignore rules are malformed.

**설명**

이 진단은 방향이 거꾸로 되어 있다. Glob은 기본적으로 .gitignore를 참조하지 않으므로, ignore 규칙이 완벽하게 올바르더라도 무시된 파일을 반환한다. .gitignore를 수정하면 git이 추적하는 대상은 바뀌지만 Glob이 매칭하는 대상은 바뀌지 않는다.

**B.** Replace Glob with Grep for the listing step, since Grep is the tool for locating files by name pattern and it skips ignored paths.

**설명**

Grep은 실제로 gitignore된 파일을 건너뛰지만, 그 목적은 함수 이름이나 오류 문자열과 같은 패턴을 파일 내용 안에서 검색하는 것이며, 이름으로 파일을 나열하는 것이 아니다. 이를 주된 파일 디스커버리 메커니즘으로 사용하는 것은 두 도구를 서로의 영역으로 바꿔버리는 것이다.

**C.** Instruct the agent to drop the trailing entries of each result, since Glob orders ignored files after tracked ones.

**설명**

Glob은 결과를 추적 여부/무시 여부가 아니라 수정 시간으로 정렬하므로, 에이전트가 잘라낼 수 있는 위치상의 경계는 존재하지 않는다. 실제로는 최근에 다시 생성된 dist/ 파일들이 목록 앞쪽에 나타나는 경향이 있어, 이 발상은 오히려 적극적으로 오도한다.

**D(정답).** Scope the pattern to source directories, such as config/**/*.yaml, because Glob matches gitignored paths by default.

**설명**

Glob은 순수한 경로 패턴 매칭을 수행하며 기본적으로 .gitignore를 존중하지 않으므로, dist/ 안의 생성된 파일들은 저장소 전체를 대상으로 하는 패턴에 대해 정당한 매칭 결과다. 실제로 소스 매니페스트가 존재하는 디렉터리로 패턴을 좁히면, 검색이 정의되는 지점에서 잡음을 제거할 수 있다.

### 전반적인 설명

Glob에 대한 사고 모델은, 이것이 순수한 경로 패턴 매처라는 것이다. 파일 트리를 순회하며 이름이 패턴과 일치하는 모든 경로를 반환하며, git이 추적, 무시, 생성으로 간주하는지는 전혀 인지하지 못한다. 따라서 기본적으로는 dist/의 빌드 출력물 같은 gitignore된 산출물을 실제 소스 파일과 함께 드러낸다. 이는 의도적인 설계 선택이다. 에이전트는 때로 생성된 파일이나 추적되지 않는 파일을 찾아야 하므로, 이 도구는 그것들을 조용히 걸러내지 않는다. 특히 이 기본 동작은 콘텐츠를 검색할 때 gitignore된 파일을 건너뛰는 Grep과 다르다는 점에 주목해야 한다. 이 차이를 감안하지 않으면 두 도구가 같은 저장소에 대해 에이전트에게 서로 다른 그림을 보여줄 수 있다.

도구는 요청받은 대로 정확히 동작하고 있으므로, 해결책은 요청 쪽에 있다. **/*.yaml로 트리 전체를 훑기보다, 실제로 소스 매니페스트가 존재하는 디렉터리로 패턴을 좁혀야 한다. 예를 들어 config/**/*.yaml처럼. 정밀한 패턴은 또한 결과를 100개 파일 상한 안에 여유 있게 유지하고, 리뷰에 들어가는 무관한 컨텍스트를 줄여준다.

오답들은 각각 도구에 대한 잘못된 모델에 근거하고 있다. .gitignore를 고치는 것은 Glob이 그것을 참조한다고 가정하지만, 기본적으로는 그렇지 않다. Grep으로 바꾸는 것은 역할을 잘못 배정하는 것이다. Grep은 파일 내부를 검색하며, ignore 규칙을 존중하기는 하지만 파일 디스커버리의 기본 도구는 아니다. 뒤쪽 결과를 잘라내는 것은 존재하지 않는 정렬 보장을 가정한다. Glob은 수정 시간으로 정렬하므로, 방금 빌드된 산출물이 목록의 끝이 아니라 앞쪽에 오는 경우가 흔하다. Glob과 Grep의 문서화된 동작에 대해서는 Claude Code tools reference를 참조하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test6.md
## 질문 24

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : An engineer prototypes an experimental PDF-parsing MCP server and adds it to the project's .mcp.json. After the next pull, teammates hit connection errors for a server only the engineer runs. How should this server be configured?

**A.** Keep the entry in .mcp.json but gate it behind an environment variable that teammates leave unset.

**설명**

.mcp.json 안의 환경 변수 확장은 토큰과 같은 값을 서버 설정에 대입하기 위한 것이며, 서버를 조건부로 켜고 끄는 메커니즘이 아니다. 팀원들은 여전히 해당 항목을 받게 되고, Claude Code는 여전히 그 서버에 연결을 시도한다.

**B.** Register the server in CLAUDE.md instead so it is documented but not automatically connected.

**설명**

CLAUDE.md는 모델에게 프로젝트 컨텍스트와 지시사항을 제공할 뿐, MCP 서버를 설정하지는 않으므로, 이 엔지니어에게는 서버가 그냥 작동을 멈추게 된다. 문서화는 올바른 스코프에 설정을 두는 것을 대체할 수 없다.

**C.** Add the entry to .mcp.json with a comment marking it as experimental so teammates know to ignore it.

**설명**

표준 JSON은 주석을 지원하지 않으며, 설령 주석을 달 수 있다 해도 동작은 바뀌지 않는다. Claude Code는 의도와 무관하게 .mcp.json에 설정된 모든 서버에 연결을 시도한다. 팀원들은 자신이 실행하지 않는 서버에 대해 계속 연결 오류를 보게 된다.

**D(정답).** Move the server entry to ~/.claude.json so it applies only to the engineer's own environment.

**설명**

정답이다. ~/.claude.json은 버전 관리를 통해 공유되지 않는 사용자 스코프 서버 설정을 담고 있기 때문이다. 개인적이고 실험적인 서버는 그곳에 속해야 하며, 프로젝트 루트의 .mcp.json은 모든 팀원이 받아야 할 도구를 위해 예약되어 있다.

### 전반적인 설명

Claude Code는 MCP 서버 설정을 스코프별로 분리하며, 스코프는 대상 사용자를 따른다. 프로젝트 루트 파일인 .mcp.json은 버전 관리에 커밋되도록 설계되어 있으므로, 그 안의 모든 항목은 팀 전체에 대한 약속이다. 각 기여자의 Claude Code 인스턴스가 그 서버를 발견하고 연결을 시도하게 된다는 것이다. 이는 공유되고 안정적인 통합에는 올바른 위치이지만, 한 대의 머신에서만 실행되는 프로토타입에는 정확히 잘못된 위치다. ~/.claude.json에 있는 사용자 스코프 설정은 엔지니어의 홈 디렉터리에 있으며, 결코 커밋되지 않고, 오직 그 사용자만을 따르기 때문에 개인적이고 실험적인 서버가 그곳에 속하는 이유가 된다.

여기서 가져야 할 사고 모델은, 스코프 배치가 라벨링 문제가 아니라 누가 그 도구를 사용하는지에 관한 아키텍처적 결정이라는 것이다. 항목을 공유 파일에 그대로 두고 주석을 달거나 환경 변수를 설정하지 않은 채로 두는 접근법들은 이 파일이 무엇을 하는지를 잘못 이해하고 있다. 설정된 모든 서버는 시작 시점에 연결되며, ${VAR} 확장은 토큰과 같은 비밀 값을 설정에 대입하기 위해 존재하는 것이지, 서버를 켜고 끄기 위한 것이 아니다. 항목을 CLAUDE.md로 옮기는 것은 반대 방향으로 실패한다. 그 파일은 모델에게 프로젝트 컨텍스트를 제공할 뿐, MCP 서버 설정에는 어떤 역할도 하지 않기 때문이다. 이 파서가 팀 공유 인프라로 성숙해지면, 그 항목은 의도적으로 .mcp.json으로 승격시킬 수 있으며, 자격 증명은 환경 변수 확장을 통해 참조하면 된다.

스코프 옵션과 설정 파일 위치에 대해서는 Connect Claude Code to tools via MCP를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test6.md
## 질문 29

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The team's custom extraction MCP server now exposes an additional redact_pii tool. An engineer proposes tearing down and re-establishing every live agent connection so sessions can pick it up. What alternative does MCP provide?

**A(정답).** Have the server send a list_changed notification so connected sessions refresh their tool inventory without reconnecting.

**설명**

정답이다. MCP는 list_changed 알림을 지원하며, 이를 통해 연결된 서버는 자신의 도구, 프롬프트, 또는 리소스가 변경되었음을 알릴 수 있다. 그러면 클라이언트는 역량 탐색을 다시 실행하여 연결 해제나 재연결 없이 사용 가능한 도구 목록을 갱신한다.

**B.** Restart every running session, since tool discovery happens exactly once when a server connects and cannot change afterward.

**설명**

오답이다. 연결 시점의 탐색은 초기 메커니즘일 뿐 유일한 메커니즘은 아니다. 프로토콜의 list_changed 알림은 바로 활성 연결 중에 서버가 자신의 역량을 갱신할 수 있도록 존재하는 것으로, 강제 재시작을 불필요하게 만든다.

**C.** Append the new tool's name and input schema to each agent's system prompt so the model learns it exists mid-session.

**설명**

오답이다. 도구를 프롬프트로 설명하는 것만으로는 클라이언트에 등록되지 않는다. 에이전트는 프로토콜 수준의 탐색을 통해 드러난 적이 없는 도구는 여전히 호출할 수 없다. 도구의 사용 가능 여부는 MCP 역량 교환을 통해 확립되는 것이지, 프롬프트 텍스트로 확립되는 것이 아니다.

**D.** Add an entry for the new tool to .mcp.json, since the configuration file controls which individual tools each server exposes.

**설명**

오답이다. .mcp.json은 서버(명령어, 전송 방식, 환경)를 설정할 뿐, 개별 도구를 설정하지 않는다. 서버가 노출하는 도구 목록은 탐색 요청을 통해 서버 자신이 보고하는 것이므로, 추가할 도구별 설정 항목은 존재하지 않는다.

### 전반적인 설명

여기서 가져야 할 사고 모델은, MCP 도구의 사용 가능 여부가 정적인 등록이 아니라 실시간 역량 교환이라는 것이다. Claude Code나 Agent SDK 하니스와 같은 클라이언트가 서버에 연결하면, 탐색 요청(tools/list, prompts/list, resources/list)을 보내고 그 응답으로부터 도구 목록을 구성한다. 서버가 자신이 제공하는 것에 대한 신뢰의 원천이기 때문에, 프로토콜은 list_changed 알림도 정의한다. 연결된 서버는 자신의 도구가 변경되었음을 알릴 수 있고, 이는 클라이언트가 다시 탐색하여 목록을 그 자리에서 갱신하도록 유도한다. 갱신 시도가 실패하면 클라이언트는 나중에 갱신이 성공할 때까지 이전에 탐색한 역량을 유지하므로, 세션은 도구를 잃어버리는 대신 우아하게 저하된다.

이 설계 때문에 살아있는 연결을 끊는 것은 잘못된 직관이다. 재연결은 기계적으로는 작동하지만, 프로토콜이 이미 처리하고 있는 문제를 해결하기 위해 세션의 연속성을 희생하는 것이다. 이는 또한 두 가지 오답 메커니즘이 왜 실패하는지도 설명해준다. 프롬프트 텍스트는 도구를 설명할 수 있지만, 모델은 클라이언트가 탐색을 통해 실제로 등록한 도구만 호출할 수 있으므로 프롬프트만으로는 아무것도 바뀌지 않는다. 그리고 .mcp.json은 한 단계 위에서 동작한다. 어떤 서버가 존재하고 어떻게 실행하는지를 선언할 뿐, 각 서버의 도구 목록은 전적으로 서버 자신의 보고 사항이다. 커스텀 서버가 자주 진화하는(새로운 리댁션, 검증, 정규화 도구가 추가되는) 추출 시스템의 경우, 동적 탐색에 의존하면 운영상의 번거로움 없이 장기 실행 세션을 최신 상태로 유지할 수 있다.

탐색과 동적 역량 갱신에 대한 자세한 내용은 Claude Code MCP documentation과 Agent SDK MCP guide를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test6.md
## 질문 38

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : The team's MCP code-search tool returns an empty result list both when the search index times out and when a query genuinely matches nothing. Claude retries fruitless no-match queries and abandons transient outages. What is the correct fix?

**A.** Mark every empty response as a retryable error so Claude re-issues the query in both situations until results appear.

**설명**

유효한 빈 결과는 실패가 아니라 성공한 쿼리이므로, 이를 재시도 가능한 오류로 표시하면 결코 매치를 반환하지 않을 검색을 끝없이 재질의하게 된다. 이는 두 조건을 구분하는 대신 한 종류의 낭비된 재시도를 다른 종류로 바꾸는 것일 뿐이다.

**B.** Retry timeouts inside the tool and return an empty list once retries are exhausted, so Claude only ever receives results.

**설명**

일시적 실패에 대한 로컬 재시도는 합리적이지만, 재시도가 소진된 실패를 빈 성공으로 바꾸는 것은 침묵의 오류 은폐다. 에이전트는 인덱스에 실제로 접근할 수 없었던 상황을 두고 해당 코드가 존재하지 않는다고 결론짓게 되어, 복구 가능한 실패가 잘못된 정보로 바뀐다.

**C(정답).** Report timeouts as errors flagged retryable, and return no-match queries as successful results with an empty match list.

**설명**

이는 정답이다. 접근 실패와 유효한 빈 결과는 본질적으로 다른 조건이기 때문이다. 타임아웃은 에이전트가 다시 시도해야 하는 재시도 가능한 오류이고, 매치가 없는 쿼리는 에이전트가 받아들이고 넘어가야 하는 성공적인 결과다. 각 조건을 정확히 인코딩하면 에이전트가 두 경우 모두에서 올바른 복구 결정을 내릴 수 있다.

**D.** Instruct Claude in the system prompt to retry any empty result twice before concluding that no matching code exists.

**설명**

이는 정당하게 비어 있는 모든 쿼리에 낭비된 재시도를 심어 넣으면서도 여전히 에이전트에게 타임아웃을 인식할 방법을 주지 못한다. 도구의 응답 형식이 이미 무너뜨린 구분을 프롬프트 가이드로 복구할 수는 없다. 해법은 도구 인터페이스 자체에 있다.

### 전반적인 설명

핵심 문제는 도구가 시맨틱적으로 정반대인 두 조건을 하나의 구별 불가능한 응답으로 뭉개버렸다는 것이다. 접근 실패(인덱스가 타임아웃됨)는 쿼리가 실제로 실행되지 못했다는 뜻이므로 재시도하는 것이 합리적이다. 유효한 빈 결과(쿼리는 실행되었지만 아무것도 매치되지 않음)는 답이 "없음"으로 나온 성공적인 작업이다. 둘 다 빈 리스트로 도착하면 에이전트는 재시도와 수용 중 무엇을 선택할지 판단할 신호가 없어, 필연적으로 일부 경우에서 잘못된 선택을 하게 된다.

해법은 프로토콜 수준에서 각 조건을 정확하게 인코딩하는 것이다. MCP는 도구 실패를 전달하기 위한 isError 플래그를 제공하며, 도구는 추가로 오류 콘텐츠 안에 오류 범주나 재시도 가능성 지표 같은 자체 구조화된 메타데이터를 담아 다시 시도했을 때 성공할 가능성이 있는지를 에이전트에게 알려줄 수 있다(재시도 가능성은 프로토콜 자체가 강제하는 필드가 아니라 응답 본문에서 도구가 정의하는 관례다). 따라서 타임아웃은 재시도 가능으로 표시된 오류로 나타나야 하고, 정말로 비어 있는 검색은 매치가 0개인 정상적인 성공 결과로 반환되어야 한다. 그러면 에이전트는 장애는 재시도하고, 빈 답은 받아들이며, 절대 매치되지 않을 쿼리에 턴을 낭비하지 않을 수 있다.

그럴듯해 보이는 대안들은 모두 같은 시험에서 실패한다. 여전히 에이전트가 결정 시점에 필요로 하는 정보를 숨기기 때문이다. 소진된 실패를 빈 성공 뒤에 숨기면 장애가 코드베이스에 대한 거짓 부정으로 바뀐다. 빈 결과를 재시도하라는 프롬프트 지시는 모든 정당한 무매치 쿼리에 벌칙을 주면서도 타임아웃을 식별하는 데는 아무 도움이 되지 않는다. 모든 빈 응답을 재시도 가능한 오류로 표시하는 것은 성공적인 쿼리를 잘못 분류하고 낭비된 재시도를 단순히 옮겨놓을 뿐이다. 일반 원칙은 복구 행동이 도구가 노출하는 오류 정보만큼만 좋을 수 있다는 것이다. 도구는 실제로 무슨 일이 일어났는지를 설명하고 그 대응을 에이전트가 선택하게 해야 한다.

관련된 오류 신호 전달 패턴에 대해서는 MCP Tools와 Anthropic의 tool use 구현 가이드를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test6.md
## 질문 41

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : A custom MCP tool resolves internal service names to API endpoints for code generation. On multiple matches it silently returns the most recently deployed service, and Claude sometimes generates client code against the wrong one. How should the tool handle multiple matches?

**A(정답).** Return every matching service with distinguishing metadata, letting Claude ask the developer which service is intended.

**설명**

이는 정답이다. 모호성은 도구 안에 숨겨지는 것이 아니라 드러나야 하기 때문이다. Claude가 구분되는 세부 정보와 함께 모든 후보를 보게 되면, 코드가 어떤 서비스를 대상으로 해야 하는지에 대한 확실한 지식을 가진 개발자에게 명확화를 요청할 수 있다.

**B.** Attach a confidence score to the auto-selected match and have Claude proceed without asking whenever the score clears a tuned threshold.

**설명**

이는 틀린 답이다. 신뢰도 점수는 실제 모호성에 대한 신뢰할 수 없는 대리 지표이며, 휴리스틱이 자신 있게 틀리는 사례들이 그대로 통과해버린다. 또한 대안들을 Claude에게 숨기는 단일 결과 매칭 방식을 그대로 유지한다.

**C.** Add a CLAUDE.md rule instructing Claude to verify the generated client code against the target service's schema after each generation.

**설명**

이는 틀린 답이다. 생성 후 검증은 스키마 불일치를 잡아낼 뿐 정체성 오류는 잡아내지 못한다. 잘못된 서비스에 대해 생성된 클라이언트라도 그 서비스 자체의 스키마에 대해서는 깨끗하게 검증을 통과할 수 있다. 또한 모호성을 억제하는 도구 인터페이스를 고치는 대신 확률적인 지시 준수에 의존한다.

**D.** Refine the ranking heuristic to weight repository activity and ownership signals alongside deployment recency before selecting one match.

**설명**

이는 틀린 답이다. 더 정교한 휴리스틱이라도 여전히 추측일 뿐이다. 어떤 순위 결정 신호도 개발자의 의도를 신뢰성 있게 추론할 수 없으므로, 잘못된 선택은 계속 조용히 발생한다. 모델은 다른 후보가 존재했다는 사실조차 보지 못한다.

### 전반적인 설명

여기서 핵심 원칙은, 모호성은 도구 안에 묻힌 휴리스틱이 아니라 실제로 답을 아는 당사자, 즉 개발자가 해소해야 한다는 것이다. 여러 후보를 하나의 "가장 유력한" 결과로 축소하는 조회 도구는 조용한 휴리스틱 선택을 수행한다. 모델은 자신 있어 보이는 답 하나만 받고, 다른 대안이 존재했다는 신호를 전혀 받지 못하므로 질문할 방법조차 없다. 구분되는 메타데이터(소유 팀, 저장소, 환경)와 함께 모든 후보를 반환하면 모호성이 모델의 컨텍스트로 옮겨지고, 그곳에서 신뢰할 수 있는 패턴이 적용된다. 후보를 나열하고 행동에 옮기기 전에 명확화 식별자를 요청하는 것이다.

이는 근본적으로 도구 인터페이스 설계의 문제다. 도구는 모델이 인지할 수 있는 것을 결정짓는다. 불확실성을 숨기는 도구는 구조적으로 다운스트림 에이전트를 과신하게 만들고, 불확실성을 드러내는 도구는 에이전트가 올바르게 행동하도록 한다. 같은 설계상의 트레이드오프가 구조화된 오류 응답에서도 나타난다. 일반적인 상태 코드는 복구에 필요한 컨텍스트를 숨긴다.

순위 결정 휴리스틱을 개선하는 것은 오류를 여전히 보이지 않게 유지하면서 추측을 더 정교하게 만드는 것일 뿐이다. 신뢰도 임계값 기반 자율 실행은 자기 평가 신뢰도가 에스컬레이션 트리거로서 실패하는 것과 같은 이유로 실패한다. 시스템은 바로 어려운 사례에서 자신 있게 틀린다. CLAUDE.md 검증 규칙은 확률적(강제가 아닌 지침)이면서 잘못된 속성을 검사한다. 잘못된 서비스를 대상으로 생성된 코드도 그 서비스 자체와는 내부적으로 일관될 수 있기 때문이다. 신뢰할 수 있는 에이전트 동작을 지원하는 도구 인터페이스 설계에 대해서는 Connect Claude Code to tools via MCP와 Tool use with Claude를 참고하라.

### 도메인

Context Management & Reliability

### 출처: Test6.md
## 질문 48

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : The team needs Claude Code to work with Jira issues and with an internal, company-specific release-approval workflow. Which TWO integration decisions follow the recommended MCP approach? (Select TWO.)

**A(정답).** Connect an existing Atlassian MCP server for the Jira integration.

**설명**

이는 정답이다. Jira는 이미 존재하는 MCP 서버를 사용할 수 있는 표준 통합이기 때문이다. 기존 서버를 채택하면 중복된 통합 코드를 만들고 유지보수할 필요가 없어지고, 팀이 즉시 작업을 시작할 수 있다.

**B.** Write a custom Jira MCP server so tool names and descriptions match the team's conventions.

**설명**

이는 표준 통합에 대한 과잉 설계다. 기존 Jira 서버는 이미 충분히 검증된 도구를 제공하며, 단지 도구 이름을 바꾸기 위해 이를 다시 만드는 것은 의미 있는 이익 없이 지속적인 유지보수 부담만 만든다.

**C(정답).** Build a custom MCP server for the internal release-approval workflow.

**설명**

이는 정답이다. 릴리스 승인 시스템은 이 회사에만 고유한 것이므로 기존 서버가 이를 다루지 못한다. 커스텀 MCP 서버는 바로 이런 팀 특화 워크플로우, 즉 기성 서버가 다룰 수 없는 영역에 투자하기에 적합하다.

**D.** Document the internal system's REST endpoints in CLAUDE.md so Claude invokes them through Bash with curl.

**설명**

CLAUDE.md는 프로젝트 컨텍스트를 제공하는 것이지 도구 인터페이스가 아니다. 임시로 curl 명령을 통해 승인 시스템을 다루면 에이전트에게 구조화된 도구 계약, 입력 스키마, 신뢰할 수 있는 오류 신호가 전혀 주어지지 않는데, 이것들이야말로 정확히 MCP 도구가 제공하는 것들이다.

### 전반적인 설명

MCP 통합의 지침이 되는 원칙은 만들기보다 사기(buy before build)이다. Jira, GitHub, Slack과 같은 표준 SaaS 시스템의 경우 기존 MCP 서버가 이미 연결, 도구 정의, 오류 처리를 구현해두었고 해당 서비스가 발전함에 따라 계속 유지보수된다. Model Context Protocol은 정확히 N대M 통합 문제를 해결하기 위해 존재한다. 모든 팀이 각자 자신만의 Jira 서버를 작성한다면, 프로토콜이 없애고자 했던 중복을 다시 만들어내는 셈이다. 커스텀 서버 개발은 다른 누구도 만들어둔 적이 없는 능력, 즉 API, 데이터 모델, 비즈니스 규칙이 회사에 고유한 내부 릴리스 승인 워크플로우 같은 경우를 위해 남겨둔다.

두 개의 오답은 이 결정의 양극단에서 실패한다. 명명 규칙을 통제하기 위해 Jira 서버를 다시 만드는 것은 잘 동작하고 유지보수되는 통합을 미미한 이익을 위해 영구적인 유지보수 부담으로 바꾸는 것이다. 도구 선택에 튜닝이 필요하다면 보통 서버 전체를 소유하지 않고도 설명 품질을 개선하는 것으로 해결할 수 있다. 내부 엔드포인트를 CLAUDE.md에 문서화하고 Bash의 curl에 의존하는 것은 컨텍스트 파일을 통합 메커니즘으로 오용하는 것이다. 에이전트는 호출을 제약할 inputSchema도, 구조화된 도구 결과도, 실패를 추론할 isError 신호도 얻지 못하므로, 승인 워크플로우가 가장 필요로 하는 바로 그 지점에서 신뢰도가 떨어진다.

아키텍트가 지녀야 할 실용적인 결정 규칙은 다음과 같다. 표준 통합이면 기존 서버를 채택하고, 팀 고유의 워크플로우면 커스텀 서버를 만들며, 산문 지시와 셸 명령을 제대로 된 도구 인터페이스 대신 사용하지 않는다. Claude Code에서 MCP 서버가 어떻게 설정되고 발견되는지는 Connect Claude Code to tools via MCP를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test6.md
## 질문 58

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The web-search subagent's search tool fails in two distinct ways: callers sometimes pass a date filter in the wrong format, and the search backend occasionally times out. Which TWO error responses are correctly designed? (Select TWO.)

**A(정답).** Return the malformed date filter failure with errorCategory "validation", isRetryable true, and a message stating the expected format, such as YYYY-MM-DD.

**설명**

잘못된 입력 형식은 검증 오류(validation error)다. 에이전트가 그 원인을 만들었고 스스로 고칠 수 있다. 재시도 가능으로 표시하고 기대되는 형식을 명시하면 에이전트가 매개변수를 수정해 다시 시도하는 데 필요한 정보를 정확히 제공하게 된다.

**B.** Return the backend timeout with errorCategory "validation", isRetryable false, and a message asking the agent to reformulate the search query.

**설명**

타임아웃은 쿼리가 잘못되었다는 것을 전혀 나타내지 않으므로, 이를 검증 오류로 분류하면 완전히 유효한 요청을 다시 작성하도록 에이전트를 잘못 이끈다. 또한 재시도 불가로 표시하면 서비스가 복구되면 성공할 가능성이 높은 재시도까지 막아버린다.

**C(정답).** Return the backend timeout with errorCategory "transient", isRetryable true, and a message noting the search service is temporarily unavailable.

**설명**

타임아웃은 요청 자체의 문제가 아니라 일시적인 접근 실패다. 이를 일시적(transient) 오류이자 재시도 가능으로 분류하면 동일한 호출이 곧 성공할 수 있음을 에이전트에게 알려주므로, 백오프를 둔 재시도가 올바른 복구 방법이 된다.

**D.** Return the malformed date filter failure with errorCategory "permission", isRetryable false, and a message instructing the agent to escalate immediately.

**설명**

잘못된 날짜 형식은 접근 권한 문제가 아니며, 이를 permission으로 표시하고 재시도 불가로 설정하면 스스로 고칠 수 있는 입력 실수를 에스컬레이션으로 몰아넣게 된다. 에이전트는 한 번의 재시도로 고칠 수 있었을 쿼리를 포기하게 된다.

### 전반적인 설명

구조화된 오류 메타데이터의 가치는 단지 필드가 존재한다는 사실이 아니라 오류 범주와 복구 행동 사이의 매핑에서 나온다. 각 범주는 에이전트에게 서로 다른 지시를 인코딩한다. transient는 외부 세계가 일시적으로 고장 났으니 동일한 호출을 재시도하라는(가급적 백오프와 함께) 뜻이고, validation은 요청 자체가 잘못되었으니 입력을 고쳐서 재시도하라는 뜻이며, business는 정책이 그 행동을 금지하니 재시도하지 말고 설명만 하라는 뜻이고, permission은 접근이 거부되었으니 에스컬레이션하라는 뜻이다. 도구가 잘못된 범주를 부여하면, 응답이 완전히 구조화되어 있더라도 에이전트는 잘못된 복구 전략을 실행하게 된다.

여기서 두 가지 실패 모드는 명확하게 대응된다. 잘못된 날짜 필터는 검증 오류이며, 에이전트가 입력을 통제하기 때문에 정확히 재시도 가능하다. 기대되는 형식("Expected YYYY-MM-DD")을 명시한 메시지와 짝을 지으면, 오류는 모델이 다음 호출에서 활용할 수 있는 학습 신호가 된다. 백엔드 타임아웃은 일시적 오류다. 요청은 유효했고 잠시 후에는 성공할 수 있으므로 isRetryable: true가 정직한 신호다. 도구가 지켜야 할 관련된 구분도 유의할 필요가 있다. 타임아웃은 접근 실패이며 빈 결과가 아니므로, 매칭이 없는 성공적인 조회로 보고되어서는 절대 안 된다.

잘못된 조합들은 각기 범주와 행동을 교차 배선한다. 형식 실수를 permission 실패로 취급하면 한 번의 재시도로 고칠 수 있는 문제를 에스컬레이션 경로로 보내, 서브에이전트가 스스로 해결할 수 있었던 일에 코디네이터의 주의를 낭비하게 만든다. 타임아웃을 재시도 불가능한 검증 오류로 취급하면 에이전트가 올바른 쿼리를 다시 작성하도록 만들고, transient 실패를 정의하는 바로 그 재시도 기회를 박탈한다. 프로토콜의 오류 보고 패턴에 대해서는 MCP Tools를, 모델이 복구할 수 있는 오류를 반환하는 방법에 대해서는 Implement tool use를 참고하라.

### 도메인

Tool Design & MCP Integration

### 출처: Test6.md
## 질문 59

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : While the team's shared MCP servers are declared in the project's .mcp.json, one developer is prototyping an experimental citation-verification MCP server for this project that teammates should not receive yet. How should this server be configured?

**A.** In the project's .mcp.json, since MCP servers must be declared there for Claude Code to discover their tools.

**설명**

프로젝트 수준의 .mcp.json이 서버를 선언할 수 있는 유일한 곳은 아니다. ~/.claude.json에 등록된 로컬 범위와 사용자 범위 서버 역시 연결 시 그 도구들이 발견된다. 실험적인 서버를 프로젝트 파일에 넣으면 버전 관리를 통해 모든 기여자에게 배포될 것이다.

**B(정답).** As a local-scoped MCP server stored in the developer's ~/.claude.json, keeping it private and out of the repository.

**설명**

로컬 범위는 기본값이며 개인 개발용 서버, 실험적인 구성, 버전 관리에 넣지 말아야 할 자격 증명을 가진 서버를 위해 만들어졌다. 이 항목은 개발자의 ~/.claude.json에 현재 프로젝트 경로 하위에 위치하므로 해당 개발자에게만 비공개로 유지되며, 팀원들은 계속해서 프로젝트의 .mcp.json에서 온 공유 서버만 보게 된다.

**C.** In the project's .mcp.json, after adding that file to .gitignore so the experimental entry never reaches teammates.

**설명**

.mcp.json을 무시하도록 설정하면 팀의 공유 서버가 버전 관리를 통해 배포되는 것을 막아, 그 파일의 핵심 목적을 깨뜨리게 된다. 범위 지정 메커니즘은 공유 구성을 희생하지 않고도 이미 비공개 서버와 팀 서버를 분리해준다.

**D.** In CLAUDE.md, adding the server's launch command so it starts only for developers whose context loads that file.

**설명**

CLAUDE.md는 모델에게 프로젝트 컨텍스트와 지시사항을 제공하는 파일이며, MCP 서버를 구성하거나 실행하지 않는다. 서버 등록은 프로젝트 범위의 경우 .mcp.json을 통해, 로컬 및 사용자 범위의 경우 ~/.claude.json을 통해 이루어진다.

### 전반적인 설명

Claude Code의 MCP 서버 구성은 대상(audience) 기반의 범위 모델을 따르며, 서버의 범위와 그것을 저장하는 파일을 구분하는 것이 중요하다. 프로젝트 범위 서버는 저장소 루트의 .mcp.json에 선언되고 버전 관리에 커밋되므로, 모든 기여자가 자동으로 팀의 공유 서버를 받게 되며, 비밀 값은 ${GITHUB_TOKEN}과 같은 환경 변수 확장을 통해 노출되지 않게 유지된다. 나머지 두 범위는 모두 개발자의 ~/.claude.json에 저장되며 절대 공유되지 않는다. 기본값인 로컬 범위는 현재 프로젝트 내에서 서버를 해당 개발자에게만 비공개로 유지하는데, 이는 개인 개발용 서버, 실험적 구성, 자격 증명을 포함한 항목에 정확히 필요한 것이다. 사용자 범위도 비공개이지만 해당 개발자의 모든 프로젝트에서 서버를 사용할 수 있게 한다. 연결이 이루어지면 모든 범위의 서버에서 나온 도구들이 동시에 발견되고 사용 가능해진다.

사고 모델은 누가 그 서버를 받아야 하고 어디에 적용되어야 하는지를 물어 범위를 선택하는 것이다. 이 프로젝트에 결부된 인용 검증 프로토타입은 대상이 한 명이므로, 검증되어 팀 전체를 위한 .mcp.json으로 승격될 준비가 될 때까지는 로컬 범위가 적합하다. 사용자 범위는 개발자가 자신이 작업하는 모든 프로젝트에서 그 서버를 원할 때만 대안이 된다. 서버가 반드시 프로젝트 파일에 선언되어야 한다는 주장은 비공개 범위의 존재 자체를 무시하는 것이다. .mcp.json을 .gitignore에 추가하는 것은 격리 문제를 팀의 공유 서버가 의존하는 배포 메커니즘을 파괴함으로써 해결하는 셈이 된다. 그리고 CLAUDE.md는 모델의 지시사항을 형성하는 컨텍스트 파일일 뿐, MCP 서버를 등록하거나 실행하는 데는 아무 역할도 하지 않는다.

구성 범위와 그 용도에 대해서는 Connect Claude Code to tools via MCP를 참고하라.

### 도메인

Tool Design & MCP Integration

