# 시나리오1_CICD

## 질문 1

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline exposes scan_code (security scanning) and check_code (linting), but both tools carry the description "checks code and reports issues," and review requests are frequently misrouted. Which TWO changes most directly fix this? (Select TWO.)


**A(정답).** Rewrite check_code's description to state what it lints, its expected inputs, and when NOT to use it.

**설명**

설명은 모델이 도구를 선택할 때 사용하는 주된 메커니즘이므로, 입력 조건과 명확한 경계 표현을 추가하면 모호한 라우팅 문제가 직접적으로 해소된다. 언제 사용하지 말아야 하는지를 명시하면 현재의 동일한 설명들이 지워버린 경계선을 다시 그릴 수 있다.

**B(정답).** Rename scan_code to run_security_scan and update its description to reference vulnerability detection specifically.

**설명**

도구의 실제 기능을 반영하도록 이름을 변경하고, 설명을 다시 작성하여 구체적인 도메인을 명시하면 모델이 선택을 수행하는 지점에서 발생하는 의미상의 중복이 제거된다. 이는 이름과 설명이 서로 뒤섞이는 도구에 대해 문서화된 해결책이다.

**C.** Add few-shot routing examples to the review prompt showing which tool handles each request type.

**설명**

프롬프트 예시는 토큰 오버헤드를 추가하고, 모델이 실제로 도구 설명을 읽는 시점인 선택 지점과는 다른 곳에 지침을 배치한다. 근본적인 설명들은 여전히 동일하게 남아 있으므로, 이 우회 방법 아래에서 모호성은 그대로 지속된다.

**D.** Merge both tools into a single analyze_code tool with a mode parameter that selects scanning or linting behavior.

**설명**

두 도구를 병합하면 겉으로 드러나던 선택 문제가 하나의 과부하된 인터페이스 안에 숨겨진 모드 선택 문제로 바뀔 뿐이다. 모델은 여전히 두 동작 중 올바른 것을 선택해야 하지만, 이제는 그 선택을 안내할 별도의 설명이 없어진다.

### 전반적인 설명

Claude는 이름이나 주변 프롬프트 텍스트에서 의도를 추론하는 것이 아니라, 주로 설명을 읽음으로써 도구를 선택한다. 두 도구의 설명이 동일하거나 거의 동일하면 모델은 이들을 구분할 신호를 얻지 못하며, 잘못된 라우팅은 예측 가능한 결과다. 유지해야 할 사고 모델은, 도구 설명이 모델이 선택 시점에 참조하는 인터페이스 계약이라는 것이다. 그 선택에 영향을 주고자 하는 것은 무엇이든 바로 그곳에 있어야 한다.

따라서 해결책은 두 개의 지렛대를 동시에 작동시키는 것이다. scan_code를 run_security_scan과 같은 이름으로 변경하고 설명을 취약점 탐지에 근거시키면 이름 수준의 중복이 제거되며, check_code의 설명을 다시 작성하여 무엇을 린트하는지, 어떤 입력을 기대하는지, 언제 사용해서는 안 되는지를 명시하면 두 영역 사이에 명확한 경계가 그려진다. 이 두 변경을 함께 적용하면 새로운 장치를 추가하지 않고도 각 도구의 목적이 명확해진다.

대안들은 구조적인 이유로 부족하다. 프롬프트 안의 퓨샷 라우팅 예시는 설명이 직접 담아야 할 구분을 가르치는 데 토큰을 소비하며, 모델은 선택 시점에 여전히 구분되지 않는 두 정의를 마주하게 된다. 모드 파라미터 뒤로 도구를 병합하는 것은 안티패턴이다. 이는 결정을 제거하는 것이 아니라 설명이 더 이상 안내할 수 없는 단일 도구 안에 결정을 묻어버리는 것이며, 이것이 바로 과부하된 도구를 목적별로 분리하는 것이 반대 방향이 아니라 권장되는 방향인 이유다. 설명이 Claude의 도구 선택을 어떻게 이끄는지에 대해서는 도구 사용 개요를 참조하라.

### 도메인

Tool Design & MCP Integration



## 질문 2

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



## 질문 3

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline's custom fetch_pr_diff MCP tool is described only as "Retrieves a diff." The agent passes repository URLs instead of the required numeric pull request identifier and calls it on merged PRs it cannot serve. Which fix is highest-leverage?

**A.** Rename the tool to fetch_pr_diff_by_number so the required identifier type is evident from the name alone.

**설명**

더 명확한 이름은 도움이 될 수 있지만, 이름만으로는 입력 형식, 예시, 범위 경계를 전달할 수 없으며, 설명이 여전히 선택과 입력 구성을 지배하는 신호로 남는다. 설명이 잘 작성된 평범한 이름의 도구가, 한 줄짜리 설명을 가진 이름 좋은 도구보다 더 나은 성능을 낸다.

**B.** Keep the description minimal and return structured validation errors, letting the agent correct its inputs through repeated retry attempts.

**설명**

구조화된 오류는 유용한 보완책이지만 사후 대응적이다. 잘못된 호출마다 수정이 이루어지기 전에 한 번의 턴을 소비하게 된다. 실패의 원인이 불충분한 설명에 있을 때는, 설명을 개선하는 것이 잘못된 호출을 복구하는 비용을 지불하는 대신 그것을 애초에 피하도록 돕는다.

**C.** Add the input format rules and the merged-PR restriction to the pipeline's system prompt rather than to the tool itself.

**설명**

시스템 프롬프트 지침은 도구 사용에 영향을 줄 수 있지만, 도구 설명이 도구 선택과 인자 구성에 대해 가장 주된, 가장 지역화된 신호다. 사용 지침을 도구 정의로부터 떨어뜨려 두면 결정 지점에서의 신호가 약해지고, 도구가 늘어날수록 확장성이 나빠진다.

**D(정답).** Rewrite the description to state the numeric identifier format, show an example input, and note that merged PRs are out of scope.

**설명**

이것이 맞는 이유는, 모델이 도구를 호출할지, 어떻게 호출할지를 결정할 때 읽는 주된 정보가 도구 설명이기 때문이다. 입력 형식, 예시, 그리고 병합된 PR에 대한 경계를 명시하면 생성 시점에 잘못된 호출과 범위 밖 호출을 모두 크게 줄일 수 있으며, 헛된 시도가 발생하기 전에 실패를 해결하게 된다.

### 전반적인 설명

Anthropic의 문서는 도구 설명이 도구 사용 성능에서 가장 중요한 요소라고 명시하며, 도구당 최소 3~4개의 문장을 권장하고 복잡한 도구는 더 많이 작성하라고 권한다. 좋은 설명은 도구가 무엇을 하는지, 언제 사용하고 언제 사용하지 말아야 하는지, 각 파라미터가 무엇을 의미하고 어떤 형식을 기대하는지, 그리고 도구가 처리할 수 없는 것과 같은 주의사항을 다룬다. 사고 모델은 이렇다: 모델은 그 순간 읽는 정의로부터 모든 도구 호출을 구성하므로, 정의는 선택과 인자 구성 모두를 형성하는 가장 직접적이고 지역화된 지점이다. "Retrieves a diff"와 같은 한 줄짜리 설명은 모델이 식별자 형식을 추론할 근거를 전혀 주지 않으며, 병합된 풀 리퀘스트가 도구의 계약 범위 밖이라는 신호도 주지 않는다.

각 대안은 이 지렛대 지점을 놓치고 있다. 검증 오류와 재시도에 의존하는 것은 대체로 피할 수 있는 결함을 복구 가능한 것으로 취급하는 것이다. 오류 메타데이터는 존재해야 하지만, 주된 학습 메커니즘이 아니라 안전망으로서 존재해야 한다. 왜냐하면 잘못된 호출마다 파이프라인에서 한 턴을 소모하기 때문이다. 사용 규칙을 시스템 프롬프트에 넣는 것은 동작에 영향을 줄 수 있지만, 모델이 호출을 구성할 때 참조하는 도구 정의로부터 지침을 떨어뜨려 놓는 것이며, 이 방식은 도구 카탈로그가 커질수록 성능이 저하된다. 이름 변경은 미미하게 도움이 되지만, 이름은 형식, 예시, 경계를 표현할 수 없다. 문서의 예시들은 상세한 설명이, 잘 선택된 이름과 빈약한 설명의 조합보다 더 나은 성능을 낸다는 것을 보여준다.

숫자로 된 PR 식별자처럼 형식에 민감한 파라미터의 경우, 설명 안에 구체적인 예시 입력을 직접 포함시키고 input_schema가 기대하는 파라미터 타입과 형식을 명시하도록 하여, 스키마와 서술문이 서로를 보강하게 하라. 도구 설명 작성에 대한 전체 모범 사례 지침은 How to implement tool use를 참조하라.

### 도메인

Tool Design & MCP Integration



## 질문 4

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



## 질문 5

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



## 질문 6

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



## 질문 7

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



## 질문 8

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



## 질문 9

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



## 질문 10

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



## 질문 11

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The MCP tool query_code_index returns cross-repository symbol references with coverage data, yet the review agent keeps choosing Grep instead. Its current description is "Searches code." Which TWO changes most directly fix this? (Select TWO.)

**A(정답).** Highlight the concrete advantages built-in search cannot provide, such as cross-repository symbol resolution and coverage data.

**설명**

MCP 도구의 설명이 다른 선택을 할 이유를 주지 않으면 에이전트는 익숙한 내장 도구를 선호하는 경향이 있다. Grep이 따라올 수 없는 고유한 데이터와 기능을 명시적으로 언급하면, 모델이 어떤 도구를 호출할지 결정하는 바로 그 순간에 선택 신호를 제공하게 된다.

**B.** Keep the tool description brief and state the routing guidance in the pipeline's system prompt, where the agent reads it every run.

**설명**

도구 설명은 모델이 선택 시점에 참조하는 것이므로, 지침을 다른 곳으로 옮기면 가장 중요한 곳에서의 신호가 약해진다. 시스템 프롬프트 문구는 선택을 안정적으로 유도하기보다 도구와의 의도치 않은 연관을 만들어낼 수도 있다.

**C(정답).** Document the tool's input formats and expected output, with example queries showing the searches it should handle.

**설명**

설명은 모델이 도구를 선택할 때 사용하는 주된 메커니즘이며, 두 단어짜리 설명은 도구의 영역을 정의되지 않은 채로 남겨둔다. 입력 형식, 출력 계약, 예시 쿼리는 도구의 적용 가능성을 구체화하여 모델이 리뷰 작업을 그 도구에 신뢰성 있게 매칭할 수 있게 한다.

**D.** Remove Grep from the review agent's allowed tools so indexed search becomes the only way to locate code references.

**설명**

이는 선택 신호를 고치는 것이 아니라 선택을 강제하는 것이며, 체크아웃된 풀 리퀘스트에서 로컬 패턴을 스캔하는 것과 같은 Grep의 정당한 사용까지 깨뜨린다. 이 도구가 저평가되고 있는 이유는 대안이 존재해서가 아니라 설명이 비어 있기 때문이다.

### 전반적인 설명

Claude Code 에이전트가 목적이 겹치는 내장 도구와 MCP 도구를 모두 가지고 있을 때, 특히 MCP 도구의 설명이 판단할 근거를 전혀 주지 않는 경우 에이전트는 흔히 자신이 잘 아는 내장 도구를 기본으로 선택한다. 도구 설명은 주된 선택 메커니즘이다. 모델은 어떤 도구가 작업에 맞는지 결정할 때 구현이 아니라 설명을 읽는다. "Searches code"와 같은 설명은 Grep이 이미 하는 일과 기능적으로 구별되지 않으므로, 모델의 관점에서는 인덱싱된 도구를 선호할 이유가 전혀 없다.

해결책은 설명이 그 결정을 담당하게 만드는 것이다. 첫째, MCP 도구가 내장 대안에 비해 갖는 구체적인 장점을 명시한다. 로컬 체크아웃의 파일 내용만 검색하는 Grep으로는 재현할 수 없는 기능인 크로스 리포지토리 심볼 해석과 첨부된 커버리지 데이터가 그것이다. 둘째, 입력 형식, 출력 형태, 예시 쿼리를 문서화하여 모델이 어떤 리뷰 작업이 그 도구에 대응하는지 인식할 수 있게 한다. 이 둘을 함께 적용하면 모델에게 그 도구를 선택할 이유와 언제 적용되는지에 대한 명확한 그림을 모두 제공하게 된다.

Grep을 완전히 제거하는 것은 설명 문제를 기능을 삭제함으로써 해결하려는 무딘 아키텍처적 조치다. 에이전트는 풀 리퀘스트 diff를 스캔하는 작업 같은 데에는 여전히 로컬 콘텐츠 검색이 필요하며, 인벤토리를 제한하는 것은 모델에게 인덱싱된 도구가 언제 적절한지를 가르쳐주지 못한다. 지침을 시스템 프롬프트로 옮기는 것은 선택이 일어나는 곳으로부터 신호를 떨어뜨린다. 도구 정의에 담긴 지침은 그 도구와 함께 이동하여 선택의 순간에 평가되지만, 시스템 프롬프트 문구는 의도치 않은 도구 연관까지 만들어낼 수 있다.

설명 작성의 모범 사례에 대해서는 Anthropic의 tool use implementation guidance를 참조하고, 서버가 클라이언트에게 도구 정의를 어떻게 노출하는지에 대해서는 MCP tools를 참조하라.

### 도메인

Tool Design & MCP Integration



## 질문 12

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



## 질문 13

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Claude often calls the wrong one of two review tools, flag_style_issue and flag_security_issue, which carry near-identical descriptions; enabling strict tool use did not stop the misrouting. What should the team change next?

**A.** Add input_examples to both tool definitions, since strict enforcement does not take effect until each tool includes examples.

**설명**

이는 틀렸다. input_examples 필드는 Claude에게 유효한 입력을 어떻게 구성하는지 보여주는 선택적인 보조 수단이며, 엄격한 강제 적용의 전제 조건이 아니다. 전제 자체가 잘못되었으며, 입력 구조의 예시는 두 설명 사이의 중복을 해결하지 못한다.

**B.** Validate the tool results the pipeline returns to the model against each tool's schema before sending them back to Claude.

**설명**

이는 틀렸으며 보장의 방향을 뒤바꾼 것이다. 엄격한 도구 사용은 Claude가 도구를 호출할 때 생성하는 입력을 검증하여 선언된 스키마와 일치하도록 보장한다. 하니스가 반환하는 결과를 검증하는 것은 Claude가 어떤 도구를 선택하는지에는 아무런 영향을 주지 않는다.

**C.** Set tool_choice to force a specific named tool on each request, since strict enforcement only applies when selection is forced.

**설명**

이는 틀렸다. 엄격한 도구 사용은 도구 선택이 자동이든 강제이든 상관없이 Claude가 생성하는 도구 호출에 적용되므로, 이 설정은 이미 적용되어 있었다. 또한 단일 도구를 강제하면 파이프라인이 필요로 하는 두 리뷰 도구 사이를 라우팅하는 Claude의 능력 자체가 사라진다.

**D(정답).** Rewrite both tool descriptions with boundary language stating when to use each tool, keeping strict tool use for schema enforcement.

**설명**

이것이 맞다. 엄격한 도구 사용은 생성된 입력이 스키마를 따르고 명명된 도구가 실제로 존재하는지를 강제하는데, 이는 문법적 보장이다. 의미상으로 겹치는 두 도구 중 Claude가 어느 것을 선택하는지에는 영향을 주지 않는다. 선택은 도구 설명에 의해 좌우되므로, 명확한 사용 시점 경계로 두 설명을 구분하는 것이 실제 실패 원인을 해결한다.

### 전반적인 설명

이 실패는 형식이 잘못된 출력이 아니라 의미상의 잘못된 라우팅이며, 이 두 문제는 서로 다른 메커니즘으로 해결된다. 엄격한 도구 사용은 Claude가 내보내는 모든 도구 호출이 사용 가능한 집합 안의 실제 도구를 명명하고, 그 도구의 input_schema에 대해 검증되는 입력을 담고 있음을 보장한다. 이는 잘못된 파라미터 타입, 누락된 필수 필드, 존재하지 않는 파라미터와 같은 실패 모드를 차단한다. 그것이 할 수 없는 일은, 설명이 거의 동일하게 읽히는 두 도구 중 요청이 실제로 무엇을 요구하는지를 결정하는 것이다. 이 경우 잘못된 도구를 호출한 것들도 이미 스키마상으로는 유효했으며, 이는 정확히 형식 문제가 아니라 선택 문제의 특징이다.

유지해야 할 사고 모델은, Claude가 주로 설명을 읽음으로써 도구들 사이를 라우팅한다는 것이다. Anthropic의 문제 해결 지침은 Claude가 도구 B를 원했는데 도구 A를 호출하는 경우의 유력한 원인으로 설명의 모호함을 든다. 그리고 문서화된 해결책은 각 설명을 다듬어서, 무엇을 하는지뿐만 아니라 언제 사용해야 하는지로 도구들을 구분하게 만드는 것이다. 상세한 설명은 도구 성능에서 단연 가장 중요한 요소로 지목된다. 따라서 해결책은 도구 정의 자체에 있다. 스타일 도구와 보안 도구에 서로 겹치지 않는 영역을 구획하는 설명을 부여하는 것이다.

대안적인 조치들은 이 기능의 경계를 잘못 읽은 것에 근거하고 있다. 엄격한 강제 적용은 강제된 tool_choice에 의해 게이트되지 않으며, 하나의 도구를 강제하면 라우팅 자체가 완전히 깨진다. 엄격 모드는 모델이 생성한 입력을 제약하는 것이며 하니스가 반환하는 결과를 제약하는 것이 아니다. 그리고 input_examples는 복잡한 입력 구조를 명확히 하기 위한 선택적 필드이며 엄격 모드의 전제 조건이 아니다. 각 메커니즘이 정확히 무엇을 보장하고 무엇을 건드리지 않는지를 아는 것이야말로, 아키텍트가 올바른 실패에 올바른 해결책을 적용할 수 있게 해준다. Strict tool use, Troubleshooting tool use, Implement tool use를 참조하라.

### 도메인

Tool Design & MCP Integration



