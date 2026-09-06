# Agentic Architecture & Orchestration — 통합 용어 사전

`PRESTUDY-*.md` 6개 파일의 용어 사전을 항목명 기준으로 통합했다.
원본 항목 412개 → 고유 용어 317개.
한 용어에 설명이 여러 개면 출처마다 서술이 달랐던 것이므로 모두 남겼다.

---

**--resume** — 세션 ID로 이전 대화를 이어가는 CLI 옵션. 로컬 트랜스크립트 파일을 읽는다.

**.claude/agents** — 서브에이전트 정의를 마크다운 파일로 저장하는 프로젝트 디렉터리. 정의 저장소일 뿐 실시간 상태 공유 기능은 아니다.

**"end_turn"** — `stop_reason` 값. 모델이 최종 응답을 냈고 더 요청할 도구가 없음 → **종료**. 첫 턴에도 나올 수 있음.

**"tool_use"** — `stop_reason` 값. 모델이 도구 호출을 요청함 → 도구를 실행하고 **계속**.

**/clear**

- 현재 컨텍스트를 완전히 비우는 명령. 이전 추론 흐름이 사라진다.  <sub>(PRESTUDY-aao-01-20.md)</sub>
- 대화 맥락을 초기화. 베이스라인이 사라짐.  <sub>(PRESTUDY-aao-61-80.md)</sub>

**/compact**

- 대화 기록을 요약으로 압축해 토큰을 절약하는 명령. 분기를 만들지는 않는다.  <sub>(PRESTUDY-aao-01-20.md)</sub>
- 대화 이력을 요약·압축해 토큰을 절약. 세부 맥락은 손실되며 외부 파일을 다시 읽지 않음.  <sub>(PRESTUDY-aao-61-80.md)</sub>

**/fork [name]** — 대화형 세션에서 지금까지의 대화 복사본을 만들고 그쪽으로 전환하는 명령. 원본은 보존된다.

**/resume** — 저장된 기존 세션을 골라 다시 불러오는 명령.

**`--continue`** — 최근 세션을 이어받음

**`--fork-session`** — 이어받되 새 세션 ID로 분기

**`--from-pr <number>`** — Pull Request를 기점으로 시작. 세션 ID 재개와는 다른 기능

**`--output-format json`** — 결과를 구조화된 JSON으로 출력해 스크립트가 파싱 가능하게 함

**`--resume <session-id>`** — 지정 세션 ID를 이어받음

**`-p` / `--print`** — 대화형 UI 없이 단발 실행하고 표준 출력으로 결과 반환

**`/clear`** — 현재 세션의 컨텍스트 창을 비우는 슬래시 명령

**`/rename`** — 진행 중인 세션에 사람이 읽기 쉬운 이름을 부여하는 슬래시 명령

**`additionalContext`** — 모델에게 참고 정보를 덧붙이는 필드(강제력 없음)

**`allowedTools`** — 특정 에이전트/세션에 허용되는 도구 목록 설정

**`async` / `asyncTimeout`** — 훅의 비동기 실행 여부와 타임아웃(ms) 설정. 사람 승인 기능과 무관

**`claude --resume <name>`** — 이름 또는 세션 ID로 이전 세션을 재개하는 CLI 명령

**`continue_conversation`** — 대화를 이어갈지 여부를 지정하는 옵션

**`description` 필드** — "언제 이 에이전트를 부를지"를 코디네이터에게 알리는 라우팅 트리거. 모호하면 자동 위임이 안 됨

**`end_turn`** — 모델이 발언을 자연스럽게 마쳤다는 `stop_reason` 값. 루프 종료 신호

**`fork_session`** — 세션 분기를 활성화하는 옵션

**`getSessionInfo()`** — 단일 세션의 메타데이터를 조회하는 함수 (목록 열거용 아님)

**`getSessionMessages()`** — 특정 세션의 전체 메시지 이력을 읽는 SDK 함수

**`hookSpecificOutput`** — 훅이 판정 결과를 담아 반환하는 출력 구조

**`listSessions()`** — 리포지토리/프로젝트의 세션 목록을 열거하는 SDK 함수

**`mcp__` prefix** — MCP 서버가 제공하는 도구 이름에 붙는 접두사. 매처 사용의 필수 조건은 아님

**`messages` array** — 대화 전체를 순서대로 담는 배열. 매 요청마다 누적된 전체를 보내야 함

**`model` 필드** — 이 에이전트가 사용할 모델. 코디네이터의 모델 설정과 독립적

**`permissionDecision`**

- 훅의 판정 값: `allow`(실행) / `deny`(차단) / `ask`(사람 승인 요청)  <sub>(PRESTUDY-aao-101-114.md)</sub>
- 훅이 반환하는 권한 결정값. `"allow"` 또는 `"deny"`  <sub>(PRESTUDY-aao-41-60.md)</sub>

**`permissionDecisionReason`** — 거부·질의 사유를 설명하는 문자열

**`PostToolUse`** — 도구 실행 직후에 동작하는 훅. 실행 자체는 막을 수 없음

**`PreToolUse`** — 도구 실행 직전에 동작하는 훅. 허용/거부/입력변형이 가능

**`prompt` 필드** — 호출된 서브에이전트가 받는 시스템 프롬프트. "어떻게 행동할지"를 정의

**`query()`** — SDK의 단일 프롬프트 실행 호출

**`renameSession()` / `tagSession()`** — 세션 이름 변경 / 태그 부착. 메타데이터 수정용

**`settings.local.json`** — 로컬 권한·설정을 담는 파일. deny 규칙 등을 정의

**`stop_reason`** — 모델이 응답을 멈춘 이유를 나타내는 API 응답 필드

**`tool_result`**

- 도구 실행 결과를 모델에게 되돌려주는 메시지 블록  <sub>(PRESTUDY-aao-101-114.md)</sub>
- 도구 실행 결과를 모델에게 되돌려주는 메시지 블록. 기존 이력에 **append** 해야 함  <sub>(PRESTUDY-aao-41-60.md)</sub>

**`tool_use`**

- 모델이 도구를 호출하려고 멈췄다는 `stop_reason` 값. 루프를 계속해야 함  <sub>(PRESTUDY-aao-101-114.md)</sub>
- 모델이 도구 호출을 요청하는 메시지 블록  <sub>(PRESTUDY-aao-41-60.md)</sub>

**`tools` 필드** — 이 에이전트에게 실제 전달되는 도구 화이트리스트. 여기 없는 도구는 호출 불가

**`tools` field** — 서브에이전트가 사용할 도구 화이트리스트. 상위 deny를 우회하지 못함

**`updatedInput`** — 훅이 도구에 전달될 입력 인자를 바꿔치기하는 필드

**Accumulated Reasoning** — 세션 동안 쌓인 시스템 이해·판단 근거. resume으로만 온전히 보존됨.

**adaptive decomposition** — 앞 단계에서 발견한 내용에 따라 다음 하위 작업이 결정되는 분해 방식.

**Adaptive Decomposition** — 실행 중 발견에 따라 계획에 새 하위 작업을 추가하는 패턴. 가변 구조 작업에 필요.

**Adaptive Investigation Plan** — 조사 중 발견된 이슈마다 새 하위 작업을 생성하는 적응형 계획.

**Adaptive Strategy** — 적응형 전략. 새 정보가 드러나면 계획을 수정해 나가는 접근

**additionalContext** — 기존 출력에 정보를 **덧붙이는** 필드. 교체가 아님.

**Agent**

- 도구를 스스로 호출하며 목표 달성까지 루프를 도는 LLM 기반 프로그램  <sub>(PRESTUDY-aao-101-114.md)</sub>
- LLM에 도구와 반복 루프를 결합해, 스스로 도구를 골라 쓰며 작업을 수행하는 시스템.  <sub>(PRESTUDY-aao-21-40.md)</sub>
- 에이전트. 모델 + 도구 + 반복 루프로 구성된 자율 실행 단위  <sub>(PRESTUDY-aao-41-60.md)</sub>

**Agent Loop** — 모델 호출 → 도구 실행 → 결과 반환 → 재호출을 반복하는 제어 사이클. 에이전트의 핵심 구조.

**Agent SDK (Claude Agent SDK)** — 내장 도구와 에이전틱 루프를 자동 제공하는 상위 SDK.

**Agent Teams** — 에이전트끼리 직접 메시지를 주고받고, 여러 협력 세션을 중앙 관리하는 패턴. 장기 협업에 적합.

**AgentDefinition**

- 서브에이전트의 정의 객체. 설명, 시스템 프롬프트, 사용 가능 도구, 모델 등을 담는다.  <sub>(PRESTUDY-aao-01-20.md)</sub>
- 서브에이전트 정의. `name`, `description`, `tools`, `model`, `prompt` 등을 포함.  <sub>(PRESTUDY-aao-21-40.md)</sub>
- 에이전트 정의 객체. `name`, `description`, `prompt`, `tools`, `model` 등을 담음  <sub>(PRESTUDY-aao-41-60.md)</sub>
- 서브에이전트의 정의(설명, 프롬프트, 도구, 모델 등).  <sub>(PRESTUDY-aao-61-80.md)</sub>
- 서브에이전트의 정의(설명, 프롬프트, tools, model, maxTurns 등).  <sub>(PRESTUDY-aao-81-100.md)</sub>

**AgentDefinition.prompt** — 서브에이전트의 **지속적 시스템 프롬프트/전문성**. 매 호출마다 항상 적용되는 고정 지침.

**agentic loop**

- 모델 호출 → 도구 요청 감지 → 도구 실행 → 결과 반환 → 재호출을 종료 신호까지 반복하는 제어 루프.  <sub>(PRESTUDY-aao-01-20.md)</sub>
- 모델 호출 → 도구 실행 → 결과 반환을 작업 완료까지 반복하는 구조.  <sub>(PRESTUDY-aao-81-100.md)</sub>

**Agentic Loop**

- 도구 호출과 결과 반영을 반복하는 에이전트의 실행 순환 구조  <sub>(PRESTUDY-aao-101-114.md)</sub>
- 모델 응답 → 도구 실행 → 결과 반환 → 다시 모델 응답을 반복하는 에이전트의 실행 구조.  <sub>(PRESTUDY-aao-21-40.md)</sub>

**allow** — 사람 확인 없이 자동 허용. 저위험·읽기 전용 작업에 적합.

**allowedTools** — 자동 실행이 사전 승인된 도구 이름 목록.

**Append vs. Replace** — 덧붙이기 대 덮어쓰기. `tool_result`는 덧붙여야 하며, 덮어쓰면 원본 질문과 호출 의도를 잃음

**application state** — 세션 기능 밖에서 애플리케이션이 직접 저장·전달하는 결과 데이터.

**ask** — 사용자에게 대화형 승인 프롬프트. 되돌릴 수 없는 고위험 작업에 적합.

**async: true / asyncTimeout** — 훅을 넌블로킹으로 처리하게 하는 반환 옵션. 런타임이 완료를 기다리지 않고 진행. 외부 감사 전송 등에 사용.

**attention dilution** — 컨텍스트가 과대해져 모델 주의가 분산되고 세부를 놓치는 현상.

**attribution** — 각 주장이 어느 출처에서 왔는지 정확히 귀속시키는 것.

**Audit (감사)** — 도구 호출 인자 등을 외부 시스템에 기록해 추적 가능성을 확보하는 것. 허용 판단과 무관하면 비동기로 처리.

**Backfill (백필)** — 새로 추가된 컬럼 등에 기존 행의 값을 채워 넣는 작업. 스키마에 따라 필요 여부가 달라지는 대표적 가변 단계.

**background** — 에이전트를 비동기로 실행하는 옵션. 권한과는 무관.

**Baseline** — 분기의 출발점이 되는 공유 맥락 상태.

**Big Bang Approach** — 빅뱅 방식. 중간 피드백 없이 한 번에 전부 처리하려는 접근. 개방형 과제에서 실패 위험이 큼

**Branching**

- 분기. 조건에 따라 실행 경로가 갈리는 것  <sub>(PRESTUDY-aao-41-60.md)</sub>
- 같은 베이스라인에서 여러 갈래 실험을 분리해 진행하는 것.  <sub>(PRESTUDY-aao-61-80.md)</sub>

**Built-in Tool**

- `Bash`, `Read`, `Grep`, `Glob`, `Task` 등 MCP 접두사가 붙지 않는 내장 도구.  <sub>(PRESTUDY-aao-21-40.md)</sub>
- 내장 도구. `Read`, `Write`, `Edit`, `Grep`, `Glob`, `Bash` 등 런타임이 기본 제공하는 도구  <sub>(PRESTUDY-aao-41-60.md)</sub>

**built-in tools** — Agent SDK가 기본 제공하는 도구들(파일 읽기/쓰기, Bash, 검색 등).

**Cache Invalidation** — 세션 맥락에 박힌 낡은 파일 내용을 최신화하는 것. 파일 변경 사실을 알려 **재조회(re-read)** 시켜야 함.

**call site** — 특정 함수·라이브러리가 실제로 호출되는 코드상의 지점.

**Checkpoint / Gate** — 단계 사이에 두는 프로그래밍 방식 검증. 잘못된 중간 산출물이 다음 단계로 넘어가는 것을 차단.

**Checkpoint / Gatekeeper** — 체크포인트/게이트키퍼. 단계 사이에서 출력이 올바른지 검증하고, 잘못되면 다음 단계로 넘기지 않는 지점

**Checkpointing**

- 파일 상태를 되돌리기 위해 별도로 마련해야 하는 스냅샷/버전 관리 메커니즘.  <sub>(PRESTUDY-aao-21-40.md)</sub>
- 파일/코드 상태의 스냅샷을 따로 저장해 되돌릴 수 있게 하는 별도 메커니즘(Git 등). 세션 기능이 아님.  <sub>(PRESTUDY-aao-61-80.md)</sub>

**Circuit Breaker** — 비정상 폭주를 감지해 강제로 끊는 안전 장치

**CLAUDE.md** — 프로젝트 지침을 담아 에이전트가 읽는 설정 파일. 외부에서 수정되면 세션 캐시가 낡을 수 있음.

**Client SDK** — Anthropic API를 감싼 얇은 클라이언트. 도구 루프를 직접 구현해야 함.

**compliance threshold** — 규정 준수를 위해 넘어서면 안 되는 기준값.

**Concurrent Invocation** — 독립적인 서브에이전트를 동시에 호출. 총 시간이 합에서 최장 하나로 감소.

**content block**

- 메시지 `content` 배열의 원소. `text`, `tool_use`, `tool_result` 등의 타입을 가진다.  <sub>(PRESTUDY-aao-01-20.md)</sub>
- 메시지 내용의 단위. `text`, `tool_use`, `tool_result` 등.  <sub>(PRESTUDY-aao-81-100.md)</sub>

**Context** — 컨텍스트. 모델이 이번 호출에서 보는 입력 전체. 여기 없으면 모델은 모름

**context / context window** — 모델에게 한 번에 전달되는 텍스트 전체 / 그 최대 용량.

**Context Dilution** — 맥락 희석. 한 프롬프트에 정보가 너무 많아 모델의 주의가 분산되고 디테일이 누락되는 현상.

**Context Isolation**

- 각 서브에이전트가 별도의 독립 컨텍스트를 갖게 하는 설계  <sub>(PRESTUDY-aao-101-114.md)</sub>
- 컨텍스트 격리. 서브에이전트 호출마다 새 컨텍스트로 시작하는 설계  <sub>(PRESTUDY-aao-41-60.md)</sub>
- 서브에이전트가 별도 컨텍스트를 써서 상위 대화가 오염되지 않게 하는 것.  <sub>(PRESTUDY-aao-61-80.md)</sub>

**context isolation** — 서브에이전트가 독립 컨텍스트를 가져 상위를 오염시키지 않는 성질.

**Context Loss** — 요약이나 초기화로 상세한 추론 맥락이 사라지는 것.

**Context Pollution** — 낡거나 무관한 정보가 컨텍스트에 남아 판단을 그르치는 현상

**context window** — 모델이 한 번에 볼 수 있는 토큰 한계. 지시 준수 보장과는 다른 문제다.

**Context Window**

- 모델이 한 번에 참조할 수 있는 대화·문서 내용의 총량  <sub>(PRESTUDY-aao-101-114.md)</sub>
- 컨텍스트 윈도우. 한 번에 담을 수 있는 최대 크기  <sub>(PRESTUDY-aao-41-60.md)</sub>

**Continue** — 이어가기. 작업 디렉터리의 가장 최근 세션을 ID 지정 없이 이어감

**coordinator**

- 서브에이전트들을 지휘하는 상위 에이전트. 허브 앤 스포크의 허브.  <sub>(PRESTUDY-aao-01-20.md)</sub>
- 서브에이전트들을 지휘·취합·평가하는 중앙 에이전트(허브).  <sub>(PRESTUDY-aao-81-100.md)</sub>

**Coordinator** — 코디네이터. 서브에이전트에게 작업을 위임하는 상위 에이전트

**Coordinator / Orchestrator**

- 요청을 하위 작업으로 분해하고 서브에이전트에 배분·종합하는 상위 에이전트.  <sub>(PRESTUDY-aao-21-40.md)</sub>
- 서브에이전트를 호출하고 결과를 종합하는 상위 에이전트.  <sub>(PRESTUDY-aao-61-80.md)</sub>

**Cross-contamination** — 한 대화 안에서 여러 주제를 섞어 맥락이 서로 오염되는 현상.

**cross-cutting concern** — 로깅, 에러 처리, 재시도, 백오프처럼 여러 컴포넌트에 공통으로 걸치는 관심사. 중앙화 대상.

**Decompose / Synthesize** — 분해 / 합성. 요청을 나누고, 각 결과를 하나의 통합 응답으로 묶는 두 단계

**Decoupling State Failure** — 검증을 오염 가능한 간접 공유 상태(플래그)에서 떼어내, 호출 인자의 명시적 원천 데이터로 옮기는 것.

**Delegation** — 위임. 코디네이터가 작업을 서브에이전트에게 넘기는 행위.

**Delegation Overhead** — 위임 오버헤드. 중앙 조정자가 "다음에 뭘 할지" 판단하는 데 드는 추가 호출·토큰·지연

**deny** — 도구 호출을 취소. 실행되지 않으며, 사유가 모델에 전달됨.

**Deny Rule** — 특정 도구·명령의 사용을 차단하는 규칙

**description (field)** — 서브에이전트의 용도 요약. 코디네이터가 쿼리와 의미 매칭해 라우팅하는 근거.

**Description-based Routing** — 쿼리와 각 서브에이전트 `description`을 의미적으로 비교해 자동 위임하는 방식.

**deterministic** — 결정론적. 같은 조건이면 항상 같은 결과. 훅·코드 수준 통제의 성질.

**Deterministic** — 결정론적. 같은 입력에 항상 같은 결과. 코드 로직이 여기에 해당.

**Deterministic Compliance** — 정책이 확률이 아니라 코드로 항상 강제되는 상태. 훅이 담당.

**Deterministic Control** — 매번 동일하게 작동하는 코드 기반의 확정적 통제

**deterministic guarantee** — 코드로 100% 보장되는 통제. 프롬프트 기반 확률적 통제와 대비.

**Deterministic Workflow** — 다음 행동이 코드에 고정되어 있는 방식. 예측 가능하지만 중간 결과에 적응 못 함.

**direct integration** — 상위 SDK 없이 Messages API를 직접 호출하는 방식. 도구 실행과 루프 관리 책임이 전부 애플리케이션에 있다.

**Dynamic Orchestration** — 실행 중 결과에 따라 다음 하위 작업을 생성하는 방식.

**dynamic orchestrator** — 실행 중에 새 하위 작업을 생성하고 우선순위를 매기는 오케스트레이터. 탐색적 문제에 적합.

**Dynamic Orchestrator** — 동적 오케스트레이터. 이전 단계의 발견에 따라 다음 하위 작업을 생성·우선순위화하는 조정자

**Dynamic Routing** — 입력의 성격을 먼저 판단해 필요한 단계만 골라 실행하는 방식

**Dynamic Task Decomposition** — 초기 결과를 평가해 후속 하위 작업을 실행 중에 생성하는 분해 방식.

**end_turn**

- `stop_reason` 값 중 하나. 도구 요청 없이 턴을 마쳤음을 뜻하며, 에이전틱 루프 종료의 표준 신호.  <sub>(PRESTUDY-aao-01-20.md)</sub>
- 모델이 정상적으로 할 말을 마침. 루프 종료 신호.  <sub>(PRESTUDY-aao-61-80.md)</sub>

**ephemeral build machine** — CI에서 작업마다 새로 만들어지고 끝나면 사라지는 일회성 머신. 디스크가 보존되지 않아 세션 재개가 깨진다.

**error_max_turns** — `max_turns` 상한에 걸려 중단된 상태. 접근 실패가 아니라 예산 소진.

**Escalation**

- 에스컬레이션. 자동 처리가 불가능하거나 부적절한 건을 사람 검토자에게 넘기는 절차.  <sub>(PRESTUDY-aao-21-40.md)</sub>
- 에이전트가 처리 도중 사람 관리자에게 넘기는 것.  <sub>(PRESTUDY-aao-61-80.md)</sub>

**Exact Match** — 정확 일치. 앵커를 써야 얻어짐

**Expected Behavior** — 예상된 동작. 버그가 아니라 설계된 정상 동작

**Exploratory Planning** — 결과가 불확실한 문제에서 단서를 따라가며 계획을 갱신하는 방식.

**fail-closed** — 검증 불가·장애 시 **차단**하는 원칙. 보안·컴플라이언스의 기본값.

**fail-open** — 검증 불가·장애 시 **허용**해 버리는 위험한 동작. 장애 중 통제가 우회된다.

**fan-in** — 병렬 실행된 결과들을 하나로 모아 종합하는 단계.

**fan-out** — 하나의 입력을 여러 독립 하위 작업으로 분배하는 단계.

**Filesystem State** — 디스크의 실제 파일 상태. **세션에 스냅샷으로 저장되지 않음.**

**fixed prompt chain** — 정해진 단계를 정해진 순서로 이어 붙인 구조. 단계가 고정되고 앞 출력이 뒤 입력이 되는 순차 의존 상황에 적합.

**Fixed Tree** — 이전 결과와 무관하게 정해진 경로만 따르는 고정 구조.

**Fork** — 기존 세션을 복제해 별도 갈래로 진행하는 것(히스토리도 함께 복제됨)

**Fork (fork_session)** — 기존 이력을 복제해 **독립된 새 갈래**를 만드는 분기. 서로를 보지 못하는 병렬 탐색에 필요.

**Fork / Session Forking** — 포크. 현재 이력을 복사해 새 세션 ID를 만들고 거기서 진행. 원본은 보존됨

**fork_session**

- 재개 시 원본 세션을 복제해 분기 세션을 만드는 옵션.  <sub>(PRESTUDY-aao-01-20.md)</sub>
- 재개 시 맥락을 복사해 **독립 브랜치 세션**을 만드는 옵션. 원본과 브랜치 간 오염 방지.  <sub>(PRESTUDY-aao-61-80.md)</sub>
- 기존 세션을 복사해 새로운 분기를 만드는 옵션. 원본 보존.  <sub>(PRESTUDY-aao-81-100.md)</sub>

**Free-text** — 자유 형식 텍스트. 일관성과 완결성이 보장되지 않음.

**Fresh Context**

- 이전 기록이 전혀 없는 깨끗한 새 컨텍스트  <sub>(PRESTUDY-aao-101-114.md)</sub>
- 새 컨텍스트. 이전 이력이 전혀 없는 초기 상태  <sub>(PRESTUDY-aao-41-60.md)</sub>

**Fresh Session Injection** — 새 세션을 열고 정제된 요약본만 첫 프롬프트로 주입하는 이어가기 전략

**goal-oriented prompting** — 절차 대신 목표와 품질 기준을 제시해 에이전트의 판단 여지를 남기는 프롬프트 설계.

**guardrail** — 에이전트가 넘지 못하게 막는 안전 경계. 훅이 대표적 구현 수단.

**Guardrail**

- 위험 행동을 사전에 막는 안전 장치  <sub>(PRESTUDY-aao-101-114.md)</sub>
- 가드레일. 에이전트가 허용 범위를 벗어나지 못하게 하는 안전장치.  <sub>(PRESTUDY-aao-21-40.md)</sub>
- 가드레일. 에이전트의 위험 행동을 막는 안전장치 전반  <sub>(PRESTUDY-aao-41-60.md)</sub>
- 폭주·무한 재귀·자원 고갈을 막는 시스템적 안전 한계.  <sub>(PRESTUDY-aao-61-80.md)</sub>

**Hallucination**

- 모델이 근거 없이 그럴듯한 정보를 지어내는 현상  <sub>(PRESTUDY-aao-101-114.md)</sub>
- 환각. 모델이 근거 없는 사실이나 값을 그럴듯하게 지어내는 현상.  <sub>(PRESTUDY-aao-21-40.md)</sub>
- 환각. 모델이 근거 없이 그럴듯한 내용을 만들어내는 현상  <sub>(PRESTUDY-aao-41-60.md)</sub>

**Handoff Protocol** — 이관 시 전달할 정보의 형식과 절차를 정한 규약.

**Handoff Summary** — AI가 사람에게 업무를 넘길 때 전달하는 자기완결적 요약(식별자·근본원인·권장조치)

**Hard Fail** — 오류 발생 시 루프를 즉시 강제 종료하는 방식. 자율 복구 기회를 없앰.

**hard gate** — 조건을 만족하지 못하면 실행을 코드 수준에서 무조건 막는 관문.

**Hard Limit** — 설정으로 풀 수 없는 고정 상한

**Hard Limit / Hard Constraint** — 하드 제약. 도구 미부여처럼 물리적으로 불가능하게 만드는 통제. 보장됨

**High-impact Gap** — 영향도가 큰 공백. 우선적으로 다뤄야 할 취약 영역

**hook**

- 에이전트 생애주기의 특정 시점에 런타임이 자동 실행하는 개발자 코드.  <sub>(PRESTUDY-aao-01-20.md)</sub>
- 에이전트 실행의 특정 시점에 실행되는 사용자 코드 콜백.  <sub>(PRESTUDY-aao-81-100.md)</sub>

**Hook**

- 에이전트 실행 흐름의 특정 지점에서 자동 실행되는 사용자 정의 코드  <sub>(PRESTUDY-aao-101-114.md)</sub>
- 실행 과정의 특정 시점에 자동 실행되도록 등록해 둔 개발자 코드. 모델 생성 바깥에서 동작.  <sub>(PRESTUDY-aao-21-40.md)</sub>
- 훅. 실행 흐름의 특정 시점에 런타임이 결정론적으로 실행하는 사용자 정의 로직  <sub>(PRESTUDY-aao-41-60.md)</sub>
- 특정 이벤트에 자동 실행되는 사용자 코드. 프롬프트와 달리 **항상** 실행되어 결정론적 강제가 가능.  <sub>(PRESTUDY-aao-61-80.md)</sub>

**hook chaining** — 여러 훅을 파이프라인처럼 연결해, 뒤 훅이 앞 훅의 결과를 이어받아 가공하는 것.

**HookMatcher** — 훅을 어떤 도구에 걸지 지정하는 등록 객체. `matcher`는 **도구 이름만** 매칭.

**hookSpecificOutput**

- 훅이 반환하는 훅 전용 출력 컨테이너.  <sub>(PRESTUDY-aao-21-40.md)</sub>
- 훅 반환 JSON에서 이벤트별 결과를 담는 필드. `hookEventName`, `permissionDecision` 등을 포함.  <sub>(PRESTUDY-aao-61-80.md)</sub>

**hub-and-spoke**

- 중앙 코디네이터(허브)가 여러 서브에이전트(스포크)와만 통신하는 구조. 공통 관심사를 허브에 중앙화한다.  <sub>(PRESTUDY-aao-01-20.md)</sub>
- 모든 통신이 중앙 허브를 경유하는 아키텍처 패턴.  <sub>(PRESTUDY-aao-81-100.md)</sub>

**Hub-and-Spoke** — 모든 통신이 중앙 허브(오케스트레이터)를 거치는 아키텍처 형태

**Human-in-the-Loop (HITL)**

- 중요한 결정 지점에 사람의 승인/판단을 끼워 넣는 설계  <sub>(PRESTUDY-aao-101-114.md)</sub>
- 고위험·비가역 작업 전에 사람이 개입하도록 설계하는 것.  <sub>(PRESTUDY-aao-61-80.md)</sub>

**idempotent / non-idempotent** — 같은 입력으로 여러 번 실행해도 결과가 같은가 여부. 도구 자체의 성질.

**Input Rewriting** — 훅이 도구 입력을 안전한 형태로 변환하는 기법

**Input Validation / Inspection** — 도구 호출 인자를 직접 검사해 정당성을 확인하는 것. 간접 플래그 신뢰보다 안전.

**input_data** — 훅 콜백이 받는 데이터 객체. `tool_input`에 도구 인자가 들어 있음.

**inter-agent messaging** — 에이전트 간 직접 메시지 교환. 코디네이터를 거치지 않는 수평적 통신.

**Intermediate Artifact** — 단계 사이에 생기는 중간 산출물(예: 구조화된 요약). 검증 지점이자 다음 단계 입력.

**Intermediate Findings** — 실행 도중 얻은 중간 결과. 모델 중심 루프는 여기에 적응하고, 고정 워크플로는 무시함.

**is_error** — `tool_result`에 붙이는 플래그. 도구 실행이 실패했음을 모델에게 알림. `stop_reason`을 대체하지 않음.

**Iteration Cap** — 루프 반복 횟수 상한. 주 정지 조건이 아니라 안전망으로만 써야 함

**Latency**

- 요청부터 응답까지 걸리는 지연 시간  <sub>(PRESTUDY-aao-101-114.md)</sub>
- 지연 시간. 불필요한 동적 판단 단계는 비용과 함께 지연도 늘림.  <sub>(PRESTUDY-aao-21-40.md)</sub>

**Map-Reduce** — 개별 단위를 각각 깊게 처리(Map)한 뒤 그 결과를 종합(Reduce)하는 패턴.

**map-reduce (divide and conquer)** — 개별 단위 분석 → 요약 결과만 통합 분석하는 2단계 처리 구조.

**Masking (마스킹)** — 민감 정보를 가려 표시하는 것. 마스킹된 읽기 전용 조회는 위험도가 낮음.

**Matcher**

- 훅을 적용할 도구 이름을 지정하는 패턴  <sub>(PRESTUDY-aao-101-114.md)</sub>
- 훅을 어떤 도구 호출에 적용할지 정하는 정규식 패턴.  <sub>(PRESTUDY-aao-21-40.md)</sub>
- 매처. 훅을 어떤 도구 이름에 적용할지 정하는 패턴  <sub>(PRESTUDY-aao-41-60.md)</sub>
- 훅이 어떤 도구에 반응할지 지정하는 조건. 매칭된 도구가 실제 호출될 때만 훅이 돎.  <sub>(PRESTUDY-aao-61-80.md)</sub>

**matcher** — 도구 이름 매칭용 문자열/정규식. 도구 인자 값으로는 필터링 불가.

**max_tokens (parameter)** — 요청 시 지정하는 최대 출력 토큰 수 파라미터.

**max_tokens (stop_reason)** — 출력 토큰 상한에 걸려 응답이 **잘림**. 완료가 아니라 미완성. 별도 처리 필수.

**max_turns / maxTurns** — 실행 가능한 최대 대화 턴 수 상한. 폭주·비용 방지용 예산 제한.

**maxTurns**

- 에이전트가 수행할 수 있는 최대 대화 턴 수 상한.  <sub>(PRESTUDY-aao-01-20.md)</sub>
- 에이전트가 수행할 수 있는 최대 턴 수를 제한하는 **가드레일**. 속도를 높이는 설정이 아님.  <sub>(PRESTUDY-aao-61-80.md)</sub>

**MCP (Model Context Protocol)**

- 에이전트가 외부 도구·데이터 소스에 연결하기 위한 표준 프로토콜.  <sub>(PRESTUDY-aao-21-40.md)</sub>
- 외부 시스템 기능을 에이전트에게 도구로 노출하는 표준 프로토콜  <sub>(PRESTUDY-aao-41-60.md)</sub>
- 외부 도구·데이터 소스를 에이전트에 연결하는 표준 프로토콜.  <sub>(PRESTUDY-aao-81-100.md)</sub>

**MCP Server**

- MCP를 통해 도구들을 노출하는 서버(예: billing, inventory).  <sub>(PRESTUDY-aao-21-40.md)</sub>
- MCP 서버. 도구 묶음을 제공하는 외부 프로세스  <sub>(PRESTUDY-aao-41-60.md)</sub>

**MCP server** — MCP로 도구를 제공하는 외부 프로세스/서비스.

**Messages API**

- Anthropic이 제공하는 저수준 대화 API. 메시지 배열을 주고받으며, 도구 실행 루프는 개발자가 직접 구현한다.  <sub>(PRESTUDY-aao-01-20.md)</sub>
- Claude에 메시지와 도구 정의를 보내 응답을 받는 API  <sub>(PRESTUDY-aao-101-114.md)</sub>
- Claude에 메시지를 보내고 응답을 받는 API. 에이전트 루프의 기반.  <sub>(PRESTUDY-aao-21-40.md)</sub>
- Claude에 메시지를 보내 응답을 받는 무상태 API  <sub>(PRESTUDY-aao-41-60.md)</sub>
- Claude에 대화(messages 배열)를 보내 응답을 받는 API. 상태를 저장하지 않아 매번 전체 이력을 전송.  <sub>(PRESTUDY-aao-61-80.md)</sub>
- Anthropic의 대화 요청 API. `messages` 배열을 보내고 모델 응답을 받는다.  <sub>(PRESTUDY-aao-81-100.md)</sub>

**Model Tier** — 서브에이전트에 지정하는 모델 성능 등급. 중첩 깊이 제한과 무관.

**Model-Driven Control Flow** — 다음 행동을 모델이 갱신된 맥락을 보고 스스로 정하는 방식. 유연하지만 비결정론적.

**Model-Driven Recovery** — 오류를 모델에게 돌려주어 모델이 스스로 재시도·우회를 판단하게 하는 복구 방식.

**Most Restrictive Principle** — 가장 제한적인 결과 적용 원칙. 여러 훅이 충돌하면 가장 보수적인 결정이 이김

**Multi-intent Resolution** — 다중 의도 해결. 한 발화에 든 여러 요구를 각각 처리하고 하나로 합치는 것

**Multimodal** — 멀티모달. 텍스트 외에 이미지·PDF 등도 입력으로 다루는 모델 능력

**Namespace**

- 도구 이름 충돌 방지를 위한 접두사 규칙. `mcp__<서버명>__<도구명>` (밑줄 2개).  <sub>(PRESTUDY-aao-21-40.md)</sub>
- 네임스페이스. 서버 이름을 접두사로 붙여 도구 이름 충돌을 막는 방식  <sub>(PRESTUDY-aao-41-60.md)</sub>

**Nested Subagents** — 서브에이전트가 또 서브에이전트를 낳는 재귀 구조. **메인 포함 최대 5단계**로 제한.

**Nesting Depth** — 에이전트가 자식 에이전트를 만드는 중첩 단계 수. Claude Code는 메인 포함 최대 5단계

**nesting depth** — 서브에이전트 중첩 깊이. 메인 포함 **최대 5레벨**.

**No-op** — 아무 동작도 하지 않는 명령(예: `echo`)

**Non-blocking** — 결과를 기다리지 않고 다음 단계를 진행하는 방식. 응답 지연을 막음.

**Nondeterminism (비결정성)** — LLM이 같은 입력에도 다른 도구 순서·선택을 할 수 있는 성질. 순서 보장을 프롬프트나 관습에 의존하면 안 되는 이유.

**normalization** — 형식이 제각각인 입력(`"$1,250.00"` / `1250.0`)을 하나의 표준 타입으로 통일하는 작업.

**Notification** — 권한 요청 등 알림 이벤트에 대응하는 훅. 작업 결과 데이터를 나르지 않는다.

**Notification Hook**

- 알림·기록·관찰 목적의 훅. 모델이 받는 도구 출력을 치환하는 표준 수단이 아님.  <sub>(PRESTUDY-aao-21-40.md)</sub>
- 상태 메시지·로깅 전용 훅. `permissionDecision`을 낼 수 없어 호출을 막지 못함. 매처 지정은 가능.  <sub>(PRESTUDY-aao-61-80.md)</sub>

**one-shot subtask** — 한 번 위임하고 최종 요약만 받는 일회성 하위 작업 형태.

**One-shot Task** — 원샷 작업. 후속 질문 없이 한 번 실행하고 끝나는 작업. 세션 관리 불필요

**Open-ended Task** — 개방형 과제. 범위·단계 수를 사전에 확정할 수 없는 작업

**Orchestrator / Coordinator** — 작업을 분해해 서브에이전트에게 배분하고 결과를 종합하는 상위 에이전트

**Orchestrator-Workers**

- 오케스트레이터-워커. 중앙 조정자가 하위 작업을 동적으로 만들어 워커에게 위임하는 패턴  <sub>(PRESTUDY-aao-41-60.md)</sub>
- 코디네이터가 런타임에 하위 작업 수와 종류를 정해 워커에 배분하고 결과를 종합하는 패턴.  <sub>(PRESTUDY-aao-61-80.md)</sub>

**orchestrator-workers** — 중간 결과에 따라 하위 작업을 **동적으로 생성**해 워커에 분배하는 패턴.

**output normalization** — 서로 다른 도구의 응답 형식을 하나의 일관된 규격으로 통일하는 것.

**Over-engineering** — 필요 없는 복잡성 도입. 고정 순서면 충분한 곳에 동적 오케스트레이터를 넣는 것이 대표적.

**Over-matching** — 의도보다 넓은 대상에 패턴이 걸리는 문제

**Over-narrow Decomposition** — 분해가 지나치게 좁아 원래 요청의 넓은 영역이 통째로 누락되는 실패 패턴.

**over-specification** — 프롬프트에 절차를 지나치게 세밀히 못 박아 환경 변화에 적응하지 못하게 만드는 문제.

**Parallel Tool Use** — 모델이 한 턴에 여러 `tool_use` 블록을 내는 것. 전부 실행 후 각각의 `tool_result`를 한 user 턴에 담아 보냄.

**parallelization** — 서로 독립적인 하위 작업을 동시에 실행하는 패턴. 지연 시간을 크게 줄인다.

**Partial Output** — 실행이 중단되기 전까지 생성된 부분 결과물. 미완료 표시와 함께 코디네이터에게 전달됨

**Per-call prompt** — 호출 시점에 전달하는 **구체적 작업 지시**. 정의 프롬프트를 대체하지 않고 함께 결합됨.

**Permission Inheritance** — 서브에이전트가 상위 코디네이터의 보안 정책을 그대로 물려받는 성질

**permissionDecision**

- 훅이 반환하는 판정 값(`allow` / `deny`). `deny`면 도구 실행이 실제로 차단된다.  <sub>(PRESTUDY-aao-01-20.md)</sub>
- PreToolUse 훅의 반환 값. `"allow"`(허용), `"deny"`(차단), `"ask"`(사람에게 확인).  <sub>(PRESTUDY-aao-21-40.md)</sub>
- PreToolUse 훅이 반환하는 실행 결정 값. `allow` / `ask` / `deny`.  <sub>(PRESTUDY-aao-61-80.md)</sub>

**permissionDecisionReason** — 결정의 사유 문자열. `deny`/`ask` 모두에서 유효하며, **Claude에게 피드백으로 전달**되어 대안 행동을 유도.

**persistSession** — 세션 트랜스크립트를 디스크에 남길지 결정하는 설정.

**PostToolUse**

- 도구 실행이 끝난 후 발화하는 훅. 실행을 막을 수는 없다.  <sub>(PRESTUDY-aao-01-20.md)</sub>
- 도구 실행 **직후**에 도는 훅. 이미 부작용이 발생한 뒤라 예방 수단이 아님.  <sub>(PRESTUDY-aao-61-80.md)</sub>
- 도구 실행 **직후** 훅. 결과가 모델에 가기 전 출력 가공에 사용.  <sub>(PRESTUDY-aao-81-100.md)</sub>

**PostToolUse Hook** — 도구가 실행된 **후**, 결과가 모델에 전달되기 **전**에 실행되는 훅. 출력을 가공한다.

**PreToolUse**

- 도구 실행 직전에 발화하는 훅. 인자 검증·정규화·실행 차단에 쓴다.  <sub>(PRESTUDY-aao-01-20.md)</sub>
- 도구 실행 **직전**에 도는 훅. 유일하게 실행을 **차단**할 수 있음.  <sub>(PRESTUDY-aao-61-80.md)</sub>
- 도구 실행 **직전** 훅. 실행 차단이나 입력값 검사·수정에 사용.  <sub>(PRESTUDY-aao-81-100.md)</sub>

**PreToolUse Hook**

- 도구가 실행되기 **전**에 실행되는 훅. 입력을 검사해 허용/거부/수정한다.  <sub>(PRESTUDY-aao-21-40.md)</sub>
- 도구 실행 직전에 동작해 허용/차단을 결정하는 훅  <sub>(PRESTUDY-aao-41-60.md)</sub>

**Principle of Least Privilege** — 최소 권한의 원칙. 임무 수행에 필요한 최소한의 권한만 부여

**probabilistic** — 확률적. 대체로 따르지만 보장은 없음. 프롬프트 기반 통제의 성질.

**Probabilistic** — 확률적. 대체로 맞지만 항상은 아님. LLM 생성이 여기에 해당.

**Programmatic Check** — LLM 판단이 아닌 코드로 수행하는 검증. 결정론적이라 신뢰성이 높음.

**programmatic gate / guardrail** — 코드로 강제하는 차단 장치. 불가역적 작업에 필수.

**Prompt Chain** — 정해진 단계를 정해진 순서로 실행하는 고정 파이프라인.

**Prompt Chaining**

- 프롬프트 체이닝. 고정된 순서의 단계를 이어 붙이고 출력을 다음 입력으로 넘기는 패턴  <sub>(PRESTUDY-aao-41-60.md)</sub>
- 고정된 선형 단계들을 순서대로 잇는 패턴. 각 출력이 다음 입력. 단계 수가 불변일 때 최적.  <sub>(PRESTUDY-aao-61-80.md)</sub>

**prompt chaining** — 사전에 정해진 고정 단계를 순차 실행하는 분해 패턴.

**Prompt Injection** — 외부 데이터에 악의적 지시를 숨겨 모델이 그것을 개발자 지시로 착각하게 만드는 공격.

**quality bar** — 결과가 만족해야 할 품질 기준. 절차를 대체하는 판단 근거로 쓴다.

**rate-limit backoff** — API 호출 한도에 걸렸을 때 대기 시간을 늘려 가며 재시도하는 전략.

**reachability** — 취약한 코드가 실제 실행 경로에서 도달 가능한지 여부.

**reason** — `deny` 시 함께 전달하는 차단 사유. 모델이 대안 경로를 찾는 데 사용.

**Regex Alternation** — 정규식의 `|`. `(a|b|c)` 형태로 여러 이름을 한 패턴에 담아 훅 중복 등록을 없앰.

**Regex Anchor (`^`, `$`)** — 문자열의 시작과 끝을 고정해 정확 일치를 강제하는 정규표현식 기호

**Regex Anchoring** — 정규표현식 앵커링. `^`(시작)과 `$`(끝)로 정확히 일치하도록 범위를 고정하는 것

**Resume**

- 기존 세션 ID의 이력에 **이어 붙이는** 재개. 여러 번 호출 가능하며 하나의 일직선 이력이 됨.  <sub>(PRESTUDY-aao-21-40.md)</sub>
- 재개. 특정 세션 ID의 이력을 불러와 그 세션에 이어서 진행  <sub>(PRESTUDY-aao-41-60.md)</sub>
- 기존 세션을 이어서 재개. 축적된 추론이 온전히 보존됨.  <sub>(PRESTUDY-aao-61-80.md)</sub>

**Reversibility (가역성)** — 작업을 되돌릴 수 있는지 여부. 되돌릴 수 없을수록 사전 차단·사람 확인이 중요.

**Risk-based Permission** — 도구의 위험도와 가역성에 따라 권한 결정을 차등 적용하는 정책.

**role** — 메시지의 화자 구분. `user`(외부 입력) / `assistant`(모델 출력) / `system`(전역 지시).

**Root Cause** — 증상이 아닌 문제의 근본 원인

**Root Cause Analysis** — 문제의 근본 원인 분석. 핸드오프 필수 항목의 하나.

**Rules Engine (룰 엔진)** — 규칙 기반으로 다음 행동을 정하는 외부 시스템. 이것이 제어하면 모델 중심 루프가 아님.

**Separation of Concerns** — 서로 다른 책임을 분리해 한쪽 변경이 다른 쪽을 망가뜨리지 않게 하는 원칙

**Server Overload** — 서버 과부하로 응답이 중간에 끊기는 오류 상황

**session**

- 하나의 연속된 대화 단위. 고유한 세션 ID를 가진다.  <sub>(PRESTUDY-aao-01-20.md)</sub>
- 하나의 대화 흐름 전체(메시지·도구 결과·읽은 파일 등 누적 맥락) 단위.  <sub>(PRESTUDY-aao-81-100.md)</sub>

**Session**

- 대화·도구 호출·결과를 담은 하나의 작업 단위  <sub>(PRESTUDY-aao-101-114.md)</sub>
- 이어서 대화할 수 있도록 저장되는 대화 단위. 세션 ID로 식별.  <sub>(PRESTUDY-aao-21-40.md)</sub>
- 세션. 고유 ID를 갖고 디스크에 저장되는 대화 이력 단위  <sub>(PRESTUDY-aao-41-60.md)</sub>
- 대화 단위. 세션 ID로 식별되며 재개 가능. **대화 이력만** 영속화.  <sub>(PRESTUDY-aao-61-80.md)</sub>

**session ID**

- 세션 식별자. `--resume`에 넘겨 특정 대화를 되살린다.  <sub>(PRESTUDY-aao-01-20.md)</sub>
- 세션을 식별하는 고유 값. 정확한 재개를 위해 애플리케이션이 저장·추적해야 함.  <sub>(PRESTUDY-aao-81-100.md)</sub>

**Session ID** — 세션 식별자

**Session Persistence** — 세션이 메시지 턴과 맥락을 저장·복원하는 것. **파일 시스템 스냅샷은 포함하지 않음.**

**session picker** — `--resume`을 인자 없이 실행하면 뜨는 대화형 세션 선택 UI. 사람용.

**Session Resumption** — 특정 에이전트/세션 ID를 지정해 이전 상태를 이어받는 것

**Session State** — 세션 동안 유지되는 상태 저장소. 검증된 ID 같은 값을 훅이 읽고 쓸 수 있음.

**Session-scoped Permission** — 세션 범위 권한. "이 세션 동안 허용"으로 부여된 승인. 포크된 새 세션으로 이전되지 않음

**SessionStart** — 세션 시작 시 한 번 실행되는 훅.

**Shared Context** — 공유 컨텍스트. 여러 하위 작업이 함께 참조하는 공통 정보. 중복 재읽기를 없앰

**Side-effect (부작용)** — 도구 실행이 외부 세계에 남기는 되돌리기 어려운 변화(환불 집행, 파일 삭제 등).

**Soft Limit / Soft Prompting** — 소프트 제약. 프롬프트 지시에만 의존하는 통제. 모델이 어길 수 있음

**Stale** — 저장된 정보가 현실 변화로 더 이상 유효하지 않은 상태

**Stateless**

- 호출 간 상태를 기억하지 않는 성질. 서브에이전트의 기본 동작  <sub>(PRESTUDY-aao-101-114.md)</sub>
- 무상태. 서버가 이전 상태를 보관하지 않는 성질  <sub>(PRESTUDY-aao-41-60.md)</sub>

**stateless / serverless** — 실행마다 상태가 초기화되는 환경. 로컬 세션 파일에 의존할 수 없음.

**Static Pipeline** — 입력과 무관하게 항상 동일한 전체 단계를 실행하는 고정 구조

**Stop** — 메인 에이전트가 턴을 마칠 때 발화하는 훅.

**stop_reason**

- 모델이 응답을 멈춘 이유를 알려주는 응답 필드. `end_turn`, `tool_use`, `max_tokens`, `stop_sequence`.  <sub>(PRESTUDY-aao-01-20.md)</sub>
- 모델이 생성을 멈춘 이유를 알려주는 응답 필드. 루프 계속/종료 판단의 근거.  <sub>(PRESTUDY-aao-21-40.md)</sub>
- 모델이 멈춘 이유. `end_turn`, `tool_use`, `max_tokens`, `stop_sequence`. 루프 분기의 기준.  <sub>(PRESTUDY-aao-61-80.md)</sub>
- 모델이 멈춘 이유. `tool_use`(도구 필요), `end_turn`(완료), `max_tokens` 등.  <sub>(PRESTUDY-aao-81-100.md)</sub>

**Strangler-Fig / Extract-Service** — 모놀리스 리팩토링 전략들. (기존 시스템을 점진적으로 감싸 대체 / 기능을 별도 서비스로 분리)

**structured entries** — 콘텐츠와 메타데이터(URL, 문서명, 페이지)를 필드로 분리한 형태의 데이터. 귀속 정확도를 높인다.

**Structured Fields** — 고객 정보·원인 분석·권장 조치처럼 **필수로 못 박은 항목들**. 자유 형식의 누락 문제를 구조적으로 해결.

**Structured Output (JSON)** — 코드가 확정적으로 파싱할 수 있도록 필드를 정해 반환하는 출력 형식

**subagent**

- 상위 에이전트가 하위 작업을 위임하는 별도 에이전트. 자체 컨텍스트를 가지며 결과 요약을 돌려준다.  <sub>(PRESTUDY-aao-01-20.md)</sub>
- 자체 컨텍스트를 가진 별도 에이전트. 작업을 위임받고 요약 결과만 반환.  <sub>(PRESTUDY-aao-81-100.md)</sub>

**Subagent**

- 오케스트레이터의 지시로 좁은 범위 작업만 수행하는 하위 에이전트  <sub>(PRESTUDY-aao-101-114.md)</sub>
- 특정 목적에 특화된 하위 에이전트. 코디네이터가 위임해서 호출.  <sub>(PRESTUDY-aao-21-40.md)</sub>
- 서브에이전트. 코디네이터가 특정 목적으로 위임하는 하위 에이전트  <sub>(PRESTUDY-aao-41-60.md)</sub>
- 자기만의 컨텍스트·시스템 프롬프트·도구를 가진 별도 에이전트 인스턴스. 하위 작업 위임 대상.  <sub>(PRESTUDY-aao-61-80.md)</sub>

**Subagent Routing / Description Matching** — 서브에이전트 라우팅. `description`을 근거로 위임 여부를 판단하는 과정

**subagent-invocation tool (Agent tool)** — 다른 서브에이전트를 생성·호출하는 도구. 이 도구 유무가 위임 권한을 결정.

**SubagentStop** — 서브에이전트가 작업을 마칠 때 발화하는 훅. 완료 감지와 결과 집계에 쓴다.

**Substring Matching** — 부분 문자열 일치. 정규식의 기본 동작

**synthesis** — 여러 출처·에이전트의 결과를 하나의 일관된 산출물로 통합하는 작업(또는 그 역할의 에이전트).

**Synthesis** — 여러 서브에이전트의 결과를 하나의 일관된 답으로 종합하는 과정

**system prompt** — 모델의 역할·규칙을 정하는 전역 지시문. 확률적으로 영향을 줄 뿐 강제력은 없다.

**System Prompt** — 모델에게 역할·규칙·맥락을 미리 지시하는 텍스트. 영향력은 있으나 강제력은 없음.

**systemMessage** — 사용자 UI에 보여주는 안내 메시지. 모델용 도구 출력이 아님.

**targeted re-delegation** — 누락된 범위만 골라 다시 위임하는 보완 전략.

**Task (tool)** — 서브에이전트를 호출하는 내장 도구. `allowedTools`에 없으면 위임마다 승인 프롬프트가 뜸.

**Task call** — 서브에이전트를 실행시키는 도구 호출. 한 응답 안에 여러 개를 넣으면 병렬 실행된다.

**task decomposition**

- 큰 작업을 여러 하위 작업으로 쪼개는 설계 활동.  <sub>(PRESTUDY-aao-01-20.md)</sub>
- 큰 작업을 하위 작업으로 나누는 설계 행위.  <sub>(PRESTUDY-aao-81-100.md)</sub>

**Task Decomposition**

- 큰 요청을 하위 작업으로 쪼개는 것.  <sub>(PRESTUDY-aao-21-40.md)</sub>
- 작업 분해. 큰 요청을 독립적인 하위 작업으로 쪼개는 것  <sub>(PRESTUDY-aao-41-60.md)</sub>
- 큰 작업을 하위 작업으로 쪼개는 설계 행위.  <sub>(PRESTUDY-aao-61-80.md)</sub>

**Temperature** — 생성의 무작위성을 조절하는 파라미터. 낮추면 일관성은 오르지만 잘못된 해석 자체는 고쳐지지 않음.

**temperature** — 토큰 샘플링의 무작위성 조절 파라미터. 컨텍스트 문제와 무관.

**Timeout** — 훅 실행 제한 시간. 매칭 대상과는 무관

**Timeout (hook)** — 훅이 실행될 수 있는 최대 시간. **적용 대상 도구를 좁히는 기능이 아님.**

**Tool** — 에이전트가 호출할 수 있는 외부 기능(파일 읽기, API 호출, 환불 처리 등).

**Tool Naming Convention** — MCP 도구 이름 규칙. `mcp__<서버이름>__<도구이름>`

**Tool Scoping** — 도구 범위 제어. 에이전트가 쓸 수 있는 도구를 명시적으로 좁히는 것

**tool_choice** — 특정 도구 호출을 프로그래밍적으로 강제하는 API 파라미터.

**tool_input**

- 모델이 도구에 넘기려는 인자 객체. PreToolUse 훅이 검사·수정하는 대상.  <sub>(PRESTUDY-aao-21-40.md)</sub>
- 도구로 전달될 인자들. `PreToolUse`에서 검사·수정 가능.  <sub>(PRESTUDY-aao-81-100.md)</sub>

**tool_result**

- 도구 실행 결과를 모델에게 돌려주는 콘텐츠 블록. 대응하는 `tool_use`가 있던 assistant 메시지 **바로 뒤의 새 user 메시지**에 담는다.  <sub>(PRESTUDY-aao-01-20.md)</sub>
- 애플리케이션이 user 역할로 되돌려 주는 블록. `tool_use_id`로 원 요청과 짝을 이룸.  <sub>(PRESTUDY-aao-61-80.md)</sub>
- 도구를 실제 실행한 결과를 모델에 돌려주는 블록. 대응하는 `tool_use_id` 필수.  <sub>(PRESTUDY-aao-81-100.md)</sub>

**tool_result block** — 도구 실행 결과를 담아 모델에게 돌려주는 블록. `tool_use_id`가 필수.

**tool_use**

- 모델이 "이 도구를 이 인자로 실행해 달라"고 요청하는 콘텐츠 블록. assistant 메시지에 담긴다.  <sub>(PRESTUDY-aao-01-20.md)</sub>
- 모델(assistant)이 내는 블록. "이 도구를 이 인자로 실행해 달라"는 요청. 고유 `id`를 가짐.  <sub>(PRESTUDY-aao-61-80.md)</sub>
- 모델이 "이 도구를 이 인자로 실행해 달라"고 요청하는 블록.  <sub>(PRESTUDY-aao-81-100.md)</sub>

**tool_use block** — 응답 안에서 도구 이름·인자·`tool_use_id`를 담고 있는 블록.

**tool_use_id**

- `tool_use`와 `tool_result`를 짝지어 주는 식별자.  <sub>(PRESTUDY-aao-01-20.md)</sub>
- 각 도구 호출을 식별하는 ID. 결과를 돌려줄 때 반드시 같은 ID로 짝을 맞춰야 함.  <sub>(PRESTUDY-aao-21-40.md)</sub>
- `tool_use`와 `tool_result`를 1:1로 연결하는 식별자. 임의 병합·누락 시 API 검증 오류 또는 맥락 파손.  <sub>(PRESTUDY-aao-61-80.md)</sub>
- 개별 도구 호출을 식별하는 고유 ID. 요청과 결과를 짝짓는 용도일 뿐.  <sub>(PRESTUDY-aao-81-100.md)</sub>

**tools / disallowedTools** — 허용 도구 배열 / 금지 도구 목록. 에이전트의 **권한**을 결정.

**transcript**

- 세션의 전체 대화 기록. 중앙 서버가 아닌 **실행 머신의 로컬 디스크**에 저장된다.  <sub>(PRESTUDY-aao-01-20.md)</sub>
- 디스크에 저장되는 세션 대화 기록 파일(예: `.jsonl`).  <sub>(PRESTUDY-aao-81-100.md)</sub>

**Transcript** — 대화 전문 기록

**Truncation (절단)** — 토큰 한도로 출력이 중간에 끊기는 현상.

**Turn (턴)** — 대화의 한 주고받기 단위. 하나의 assistant 응답 또는 하나의 user 메시지.

**Unanchored Regex**

- 앵커가 없어 부분 문자열만 있어도 일치하는 정규표현식  <sub>(PRESTUDY-aao-101-114.md)</sub>
- 앵커 없는 정규식. 부분 문자열만 포함해도 일치하므로 의도치 않은 대상을 잡음  <sub>(PRESTUDY-aao-41-60.md)</sub>

**updatedInput**

- `PreToolUse` 훅이 수정된 도구 입력을 전달할 때 쓰는 필드.  <sub>(PRESTUDY-aao-01-20.md)</sub>
- PreToolUse 훅이 `allow`와 함께 반환해 도구 인자를 안전한 값으로 강제 교체하는 필드.  <sub>(PRESTUDY-aao-21-40.md)</sub>
- PreToolUse 훅이 도구의 **인자를 수정**할 때 쓰는 필드. 무관한 데이터를 넣으면 스키마 오염.  <sub>(PRESTUDY-aao-61-80.md)</sub>

**updatedMCPToolOutput** — MCP 도구 전용 레거시 출력 교체 필드. 내장 도구에는 적용 안 됨.

**updatedToolOutput**

- `hookSpecificOutput` 안에서 도구의 출력을 재작성해 모델에게 전달하는 필드.  <sub>(PRESTUDY-aao-21-40.md)</sub>
- 도구 출력을 교체하는 표준 필드. **내장 도구와 MCP 도구 모두**에 적용.  <sub>(PRESTUDY-aao-81-100.md)</sub>

**UserPromptSubmit**

- 사용자가 프롬프트를 제출한 시점에 발화하는 훅.  <sub>(PRESTUDY-aao-01-20.md)</sub>
- 사용자가 프롬프트를 제출할 때마다 실행되는 훅.  <sub>(PRESTUDY-aao-81-100.md)</sub>

**Variable Structure** — 실행 전에는 필요한 단계를 알 수 없고 발견에 따라 달라지는 작업 구조.

**Veto** — 거부권. 단 하나의 `deny`가 모든 `allow`를 무력화하는 구조

**visibility** — 코디네이터가 하위 작업의 진행·실패를 관측할 수 있는 정도.

**Wildcard (`*`)** — 와일드카드. 임의의 나머지 문자열을 포괄하는 패턴

**Workflow tool** — 오케스트레이션 로직을 대화 밖 스크립트로 옮겨 런타임이 실행하게 하는 도구. 초대형 배치용.

**working directory** — CLI가 실행된 디렉터리. 프로젝트 컨텍스트와 세션 저장소의 기준이 되므로, 다르면 재개가 실패한다.
