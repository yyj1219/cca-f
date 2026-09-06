# Tool Design & MCP Integration — 통합 용어 사전

`PRESTUDY-*.md` 6개 파일의 용어 사전을 항목명 기준으로 통합했다.
원본 항목 313개 → 고유 용어 257개.
한 용어에 설명이 여러 개면 출처마다 서술이 달랐던 것이므로 모두 남겼다.

---

**@ Mention** — 프롬프트에 리소스·파일을 인라인 참조하는 구문. MCP는 `@<server>:<uri>` 형태

**`-32602 Invalid params`** — 잘못된 인자에 대한 표준 JSON-RPC 에러 코드

**`-32700 Parse error`** — JSON 파싱 실패에 대한 표준 JSON-RPC 에러 코드

**`.claude/settings.json`** — Claude Code의 동작 설정 파일(권한·훅·환경변수 등). 전역 MCP 등록 경로가 아님

**`.gitignore`** — Git이 무시할 경로 목록. Grep의 기본 검색에서도 제외되지만, 경로를 직접 지정하면 검색됨

**`.mcp.json`**

- 프로젝트 스코프 MCP 서버 설정 파일  <sub>(PRESTUDY-tool-01-15.md)</sub>
- 프로젝트 스코프 MCP 서버 정의를 담는, 버전 관리에 커밋되는 설정 파일  <sub>(PRESTUDY-tool-16-30.md)</sub>
- 프로젝트 루트에 두는 MCP 설정 파일. project 스코프. git 공유 대상  <sub>(PRESTUDY-tool-31-45.md)</sub>
- 프로젝트 루트에 두고 git에 커밋하는 프로젝트 범위 MCP 서버 설정 파일.  <sub>(PRESTUDY-tool-76-85.md)</sub>

**`{"type":"any"}`** — 반드시 도구 중 하나를 호출해야 함. 일반 텍스트만으로 응답 불가

**`{"type":"auto"}`** — 기본값. 도구를 쓸지, 어떤 걸 쓸지 모두 모델이 자율 판단

**`{"type":"none"}`** — 어떤 도구도 호출 금지. 텍스트 응답만

**`{"type":"tool","name":"X"}`** — 반드시 도구 X를 호출해야 함. 특정 도구 강제

**`/mcp`** — Claude Code에서 MCP 서버 상태를 확인·관리하는 명령

**`~/.claude.json`**

- 사용자(전역) 스코프 설정 파일  <sub>(PRESTUDY-tool-01-15.md)</sub>
- 홈 디렉터리의 사용자 설정 파일. user 스코프 저장 위치  <sub>(PRESTUDY-tool-31-45.md)</sub>

**`alwaysLoad: true`** — 특정 MCP 서버의 도구를 세션 시작 시 항상 컨텍스트에 로드하는 서버별 옵션

**`claude mcp add --scope project`** — 프로젝트 범위로 MCP 서버를 등록하는 CLI 명령.

**`claude mcp list`** — 등록된 MCP 서버와 연결 상태를 확인하는 CLI 명령.

**`CLAUDE_PROJECT_DIR`** — 프로젝트 루트 절대 경로를 담는 내장 변수. Claude Code가 자식 프로세스 환경에 자동 주입

**`computer-use`** — 화면 조작·GUI 제어용 예약된 내장 식별자

**`Edit` tool** — 파일의 특정 문자열을 치환하는 부분 수정 도구.

**`ENABLE_TOOL_SEARCH`** — 도구 탐색 기능 전체를 켜고 끄는 전역 환경 변수

**`errorCategory`** — 에러 성격 분류 값 (`transient`, `validation`/`permanent` 등)

**`glob` parameter** — Grep에서 파일명 패턴으로 대상을 한정하는 파라미터.

**`Glob` tool** — 파일 **이름/경로** 패턴으로 파일 목록을 찾는 도구.

**`Grep` tool** — ripgrep 기반 파일 내용 검색 도구.

**`headers`** — MCP 서버 요청에 붙일 정적 HTTP 헤더 설정. 장기 고정 키에 적합.

**`headersHelper`** — 매 연결 시 지정 스크립트를 실행하고 그 **stdout의 JSON**을 헤더로 사용하는 설정. 매번 새 토큰이 필요한 인증에 사용.

**`isError`** — 도구 실행 결과가 실패인지 나타내는 불리언 플래그

**`isRetryable`** — 동일 요청 재시도가 의미 있는지 나타내는 플래그

**`list_changed` Notification** — 서버의 도구/리소스/프롬프트 목록이 바뀌었음을 클라이언트에 알리는 MCP 알림

**`MAX_MCP_OUTPUT_TOKENS`** — MCP 도구 응답 결과의 최대 토큰 수 제한

**`multiline` mode** — 줄바꿈을 가로지르는 패턴까지 매칭하게 하는 Grep 옵션. 줄이 나뉜 클래스 헤더 검색에 필요.

**`notifications/tools/list_changed`** — 도구 목록이 변경되었음을 서버가 클라이언트에 알리는 MCP 알림. 받은 클라이언트는 연결 유지 상태로 `tools/list`를 재요청

**`oauth` block / `authServerMetadataUrl`** — OAuth 2.0 인가 서버 메타데이터 URL을 지정해 인증 흐름을 자동 발견하게 하는 설정. OAuth 서버가 존재할 때만 유효.

**`output_mode`** — Grep 결과 표시 방식: `files_with_matches`(경로만) / `content`(매칭 줄) / `count`(개수). 검색 철저함과는 무관.

**`Read` tool** — 파일 내용을 읽는 도구. 덮어쓰기 안전장치의 전제 조건.

**`tools/call`** — 특정 도구를 인자와 함께 실행 요청하는 MCP 메서드

**`tools/list`**

- 서버의 도구 목록을 조회하는 MCP 요청. `list_changed` 수신 후 자동 재호출됨  <sub>(PRESTUDY-tool-01-15.md)</sub>
- 서버의 도구 목록을 요청하는 MCP 메서드  <sub>(PRESTUDY-tool-16-30.md)</sub>

**`type` parameter** — Grep에서 검색 대상을 언어별로 한정하는 파라미터(`py`, `js` 등).

**`Write` tool** — 파일을 새로 만들거나 전체를 교체하는 도구. 기존 파일이면 같은 대화 내 사전 `Read` 필요.

**503 Service Unavailable** — 서버가 일시적으로 요청을 처리할 수 없음을 뜻하는 HTTP 상태 코드

**Adaptive Thinking** — 최신 모델이 사고량을 스스로 조절하는 방식. 강제 도구 호출과 함께 사용 가능

**Agent Loop** — 모델 호출 → 도구 실행 → 결과 반환을 반복하는 순환 구조

**Alias** — `export { formatDate as fmt }` 처럼 심볼에 붙인 다른 이름

**Allowlist** — 허용된 값(도메인, 출처 등)만 통과시키는 목록 기반 검증 방식

**Ambiguity** — 두 도구의 설명이 겹쳐 모델이 구분하지 못하는 모호성

**Ambiguity (모호성)** — 둘 이상의 도구 설명이 겹쳐 모델이 구분하지 못하는 상태.

**Anchoring / Keyword Association Bias** — 시스템 프롬프트의 특정 단어가 이름이 비슷한 도구 쪽으로 모델 선택을 끌어당기는 편향

**Attack surface (공격 표면)** — 공격자가 악용할 수 있는 진입점의 총합. 도구를 줄이면 함께 줄어든다.

**Backoff / Exponential Backoff** — 재시도 간격을 점점 늘려 가는 재시도 전략

**Bash**

- 셸 명령을 실제로 실행하고 stdout/stderr를 캡처하는 도구  <sub>(PRESTUDY-tool-31-45.md)</sub>
- 셸 명령 실행 도구. 대화형 에디터 용도로는 부적합  <sub>(PRESTUDY-tool-46-60.md)</sub>

**Boundary behavior (경계 동작)** — 빈 입력, 없는 ID, 부분 입력, 최대치 등 가장자리 상황에서의 동작 규정.

**business (오류)** — 비즈니스 규칙 위반. 같은 입력으로는 결과가 바뀌지 않아 재시도 무의미

**Business Error** — 도메인 정책 규칙(환불 기간 등)에 걸린 오류. 재시도 불가

**Business Error / Domain Error** — 입력은 정상이나 도메인 정책·상태 때문에 거부되는 에러

**Byte Offset** — 파일 시작부터의 바이트 위치. LLM이 정확히 계산하기 어려운 값

**Caller** — 함수를 실제로 호출하는 코드 지점

**Candidate Set** — 모델이 비교해야 하는 도구 후보 집합

**Community / vendor server** — 커뮤니티나 서비스 제공사가 이미 만들어 배포한 MCP 서버. 표준 서비스에는 이것을 채택.

**Connection Reset** — 네트워크 연결이 상대편에 의해 끊긴 상태. 대표적 일시적 오류

**Constrained / Scoped Tool** — 입력과 대상 범위를 좁히고 검증을 붙인 전용 도구

**Constrained Tool** — 사전 검증된 식별자 등 제한된 입력만 받아 오용 여지를 구조적으로 차단한 도구

**Context Isolation** — 서브에이전트의 중간 과정이 상위 컨텍스트를 오염시키지 않게 하는 것

**Context Window**

- 한 번의 요청에 담을 수 있는 토큰 총량의 한계  <sub>(PRESTUDY-tool-01-15.md)</sub>
- 모델이 한 번에 처리할 수 있는 토큰 총량  <sub>(PRESTUDY-tool-31-45.md)</sub>

**Coordinator / Orchestrator** — 작업을 나눠 서브에이전트에게 위임하고 결과를 취합하는 상위 에이전트

**Coordinator / Orchestrator Agent** — 작업을 분할하고 위임하며 결과를 통합하는 상위 에이전트

**Cross-Role Tool** — 원래 다른 역할의 소관인 도구. 필요하면 전체가 아닌 좁은 단일 도구로만 허용

**Custom MCP server** — 사내 고유 시스템처럼 외부에 동등물이 없는 대상을 위해 직접 구축하는 서버.

**Decision Complexity** — 후보군이 클수록 커지는 모델의 의사결정 부담

**Declined charge** — 결제가 정상 처리 시도 후 거절된 도메인 실패. 프로토콜 에러가 아니라 `isError: true`로 보고

**Deferred Loading** — 도구 정의를 미리 넣지 않고 필요 시점에 로드하는 방식

**Delegation** — 상위 에이전트가 하위 에이전트에게 작업을 넘기는 것

**description (오류 필드)** — 실패의 구체적 사유를 담은 사람이 읽을 수 있는 문장

**Description Drift** — 기능 범위가 바뀌었는데 설명이 갱신되지 않아 생기는 불일치

**Deterministic Control** — 확률적 유도가 아니라 시스템이 결과를 강제하는 제어 방식

**Disambiguation** — 모호성 해소. 이름·설명을 구체화해 도구 경계를 분명히 하는 작업

**Dynamic Tool Refresh** — 세션 중간에 재연결 없이 도구 목록을 자동 갱신하는 동작

**Edit**

- 파일 안의 `old_string`을 `new_string`으로 치환하는 도구  <sub>(PRESTUDY-tool-31-45.md)</sub>
- `old_string` → `new_string` 치환 도구. `old_string` 이 파일 내에서 유일해야 함  <sub>(PRESTUDY-tool-46-60.md)</sub>

**Edit (도구)** — `old_string`을 `new_string`으로 치환하는 국소 수정 도구

**Empty result** — 정상 실행되었으나 조건에 맞는 데이터가 0건인 상태. **에러가 아님**

**Empty Result** — 조회는 성공했으나 반환할 항목이 없는 정상 상태 (`[]`)

**Encapsulation** — 내부 처리 과정을 감추고 결과만 노출하는 설계 원칙

**Enum parameter** — 정해진 값 목록 중 하나만 받는 파라미터. 각 값의 선택 기준을 설명해야 유효하다.

**Environment injection** — 클라이언트가 자식 프로세스 환경에 변수를 스스로 넣어 주는 것

**errorCategory**

- 오류의 성격 분류. `transient`, `business`, `permission`, `validation` 등  <sub>(PRESTUDY-tool-01-15.md)</sub>
- 에러의 종류를 기계가 분기할 수 있게 표기한 필드  <sub>(PRESTUDY-tool-31-45.md)</sub>
- 실패 원인의 종류: `validation` / `permission` / `business` / `transient`  <sub>(PRESTUDY-tool-46-60.md)</sub>

**Escalation**

- 하위에서 해결 못 한 문제를 더 높은 권한의 주체에게 넘기는 것  <sub>(PRESTUDY-tool-01-15.md)</sub>
- 자체 해결 불가능한 사안을 상위로 올려 판단을 요청하는 것  <sub>(PRESTUDY-tool-31-45.md)</sub>

**Escalation / Refer** — 자기 역량 밖의 복잡한 케이스를 상위/담당 에이전트에게 넘기는 것

**ETL (Extract–Transform–Load)** — 데이터를 추출·변환·적재하는 3단계 데이터 파이프라인 패턴

**Exploratory Overhead** — 무엇이 있는지 파악하려고 반복 호출하며 낭비되는 토큰·지연

**Exponential Backoff** — 재시도 간격을 1→2→4초처럼 지수적으로 늘리는 전략

**Extended Thinking** — 답변 전에 모델이 긴 내부 추론을 거치게 하는 기능

**Fallback syntax `${VAR:-default}`** — 변수가 없을 때 쓸 기본값을 지정하는 셸식 문법

**Fault Containment** — 장애를 발생 지점 계층에서 흡수해 상위로 전파하지 않는 원칙

**Few-Shot (예시 쿼리)** — 도구 설명에 대표 요청 예시를 한둘 넣어 사용 시점을 구체적으로 알려 주는 기법

**Field-by-field merge** — 설정을 필드 단위로 섞는 방식. MCP 스코프 충돌에서는 **일어나지 않음**

**Forced Tool Calling** — `any` 또는 `tool` 로 도구 호출을 강제하는 것

**Generic Tool**

- `fetch_url`처럼 입력 범위가 넓고 무엇이든 할 수 있는 범용 도구  <sub>(PRESTUDY-tool-16-30.md)</sub>
- 임의의 자유도 높은 인자(바이트 범위, 자유 SQL 등)를 받는 범용 도구  <sub>(PRESTUDY-tool-46-60.md)</sub>

**Glob**

- 파일 **이름/경로 패턴**을 찾는 도구. 내용은 보지 않음  <sub>(PRESTUDY-tool-16-30.md)</sub>
- 파일명 패턴(`**/*.test.*`)으로 파일 경로를 나열하는 도구  <sub>(PRESTUDY-tool-31-45.md)</sub>
- 파일 **경로·이름** 패턴으로 파일 목록을 찾는 도구. 내용은 보지 않음  <sub>(PRESTUDY-tool-46-60.md)</sub>

**Glob (도구)** — 경로 패턴으로 파일 경로를 찾는 검색 도구. 수정 시간순 정렬. 내용 변경 없음

**Graceful Failure Reporting** — 실패 시 부분 결과 + 미해결 항목 + 오류 원인 + 시도 내역을 명시해 보고하는 방식

**Grep**

- 파일 **내용**을 정규식으로 검색하는 도구. ripgrep 기반  <sub>(PRESTUDY-tool-16-30.md)</sub>
- 파일 내용을 정규식으로 검색하는 도구  <sub>(PRESTUDY-tool-31-45.md)</sub>
- 파일 **내용**을 정규식으로 검색하는 도구. 수정 기능 없음  <sub>(PRESTUDY-tool-46-60.md)</sub>

**Grep (도구)** — 파일 내용을 정규식으로 검색하는 읽기 전용 도구. `output_mode: content`로 매칭 줄 출력

**Guardrail (안전장치)** — 데이터 유실이나 위험한 동작을 구조적으로 막는 장치.

**Guessed Values** — 선행 도구를 부르지 않고 모델이 임의로 지어낸 인자 값

**Hallucination** — 모델이 근거 없는 내용을 사실처럼 생성하는 현상

**Hallucination (환각)** — 모델이 존재하지 않는 정보(예: 가짜 URL)를 사실처럼 생성하는 현상

**HTTP / SSE transport** — 원격 MCP 서버와 HTTP 기반으로 통신하는 방식.

**Human approval step** — 위험한 도구 실행 전 사람이 확인하는 단계. 유용하지만 설계 결함 자체를 없애지는 못한다.

**IAM (Identity and Access Management)** — 누가 무엇을 할 자격이 있는지를 관리하는 계층

**Impact Scope** — 변경이 영향을 미치는 전체 파일·라인 범위

**in-flight tool call** — 이미 전송되어 아직 결과가 오지 않은, 진행 중인 도구 호출

**Input Schema**

- 도구 입력 파라미터의 JSON Schema. 타입·필수 여부·필드 설명 포함  <sub>(PRESTUDY-tool-01-15.md)</sub>
- 도구 인자의 이름·타입·필수 여부를 정의한 JSON Schema  <sub>(PRESTUDY-tool-16-30.md)</sub>
- 도구의 파라미터를 JSON Schema로 정의한 것  <sub>(PRESTUDY-tool-31-45.md)</sub>
- 도구 인자의 형태를 정의하는 JSON Schema. 모델 출력의 모양을 제한함  <sub>(PRESTUDY-tool-46-60.md)</sub>

**Input schema** — 도구의 입력 구조를 정의한 JSON Schema. 파라미터 이름·타입·required·설명 포함.

**Intermediary service** — Kerberos 등으로 인증한 뒤 다른 형태의 자격증명으로 변환해 주는 중개 서비스.

**isError**

- 도구 결과가 실패임을 표시하는 플래그  <sub>(PRESTUDY-tool-01-15.md)</sub>
- MCP 도구 결과에서 성공(false)/실패(true)를 나타내는 불리언 필드  <sub>(PRESTUDY-tool-31-45.md)</sub>
- MCP 도구 결과에서 실패 여부를 표시하는 불리언 필드  <sub>(PRESTUDY-tool-46-60.md)</sub>

**isRetryable**

- 동일 요청 재시도가 성공 가능한지 알려 주는 불리언 플래그  <sub>(PRESTUDY-tool-01-15.md)</sub>
- 같은 요청을 그대로 재시도했을 때 성공 가능성이 있는지 여부  <sub>(PRESTUDY-tool-46-60.md)</sub>

**JSON-RPC 2.0** — 요청/응답과 단방향 알림을 정의한 원격 호출 규격. MCP의 메시지 형식

**Kerberos** — 티켓 기반의 기업용 인증 프로토콜. OAuth가 아니며 토큰 수명이 짧다.

**Kerberos realm** — Kerberos 인증 도메인 단위. OAuth 메타데이터 URL로 쓸 수 없다.

**Latency** — 요청부터 응답까지의 지연 시간

**Least Privilege (최소 권한)** — 역할 수행에 꼭 필요한 최소한의 권한/도구만 부여하는 보안 원칙.

**Legal Hold** — 법적 분쟁·조사 등을 이유로 데이터 변경·삭제를 금지하는 정책 상태

**Literal Text** — 특수문자를 패턴으로 해석하지 않는 그대로의 문자열

**Local Scope**

- 특정 프로젝트에서 나에게만 적용되는 개인 설정  <sub>(PRESTUDY-tool-01-15.md)</sub>
- 특정 프로젝트에 대해 나에게만 적용되는 개인 설정 범위  <sub>(PRESTUDY-tool-31-45.md)</sub>

**Local scope** — 개인 머신에만 저장되는 설정. 이름 충돌 시 가장 높은 우선순위

**Malformed Input** — 형식이 깨진 입력

**Malformed Span** — 잘못된 오프셋 때문에 문장 중간이 잘린 깨진 텍스트 구간

**Manual Extended Thinking** — `thinking: {"type": "enabled"}` 로 명시적으로 켜는 확장 사고. `tool_choice` 는 `auto`/`none` 만 허용

**MCP (Model Context Protocol)**

- AI 애플리케이션과 외부 도구/데이터 제공자를 잇는 표준 연결 규약  <sub>(PRESTUDY-tool-01-15.md)</sub>
- AI 클라이언트와 외부 기능 제공 서버를 잇는 표준 프로토콜. JSON-RPC 2.0 기반  <sub>(PRESTUDY-tool-16-30.md)</sub>
- AI 애플리케이션과 외부 시스템의 연결을 표준화한 개방형 프로토콜  <sub>(PRESTUDY-tool-31-45.md)</sub>
- LLM 애플리케이션과 외부 시스템을 잇는 표준 프로토콜  <sub>(PRESTUDY-tool-46-60.md)</sub>
- AI 에이전트와 외부 시스템을 연결하기 위한 개방형 표준 프로토콜.  <sub>(PRESTUDY-tool-76-85.md)</sub>

**MCP Client** — 서버에 접속해 도구 목록을 받아 모델에 제공하고 호출을 중계하는 쪽. Claude Code가 해당

**MCP Client / Host**

- MCP 서버에 연결해 도구 목록을 받고 모델에 제시하며 호출을 중계하는 쪽  <sub>(PRESTUDY-tool-01-15.md)</sub>
- MCP 서버에 연결하는 AI 애플리케이션 (Claude Code 등)  <sub>(PRESTUDY-tool-31-45.md)</sub>

**MCP client / host** — MCP 서버에 연결해 모델에게 도구를 제공하는 쪽. Claude Code가 여기 해당.

**MCP Prompt** — 재사용 가능한 프롬프트 템플릿

**MCP Resource** — 목록·문서·요약 등 읽기 전용 컨텍스트 데이터. 사전에 컨텍스트로 주입

**MCP Server**

- 도구·리소스·프롬프트를 MCP 규격으로 노출하는 프로세스 (로컬 또는 원격)  <sub>(PRESTUDY-tool-01-15.md)</sub>
- 도구·리소스·프롬프트를 노출하는 프로그램 (예: Postgres, Sentry, Slack 서버)  <sub>(PRESTUDY-tool-16-30.md)</sub>
- 특정 시스템의 기능을 MCP 규격으로 노출하는 프로그램  <sub>(PRESTUDY-tool-31-45.md)</sub>

**MCP server** — 특정 외부 시스템의 기능을 MCP 규격의 도구로 노출하는 프로그램.

**MCP Tool** — 상태 변경·동적 연산·검색을 수행하는 행동 기반 기능. 모델이 호출

**minified bundle** — 빌드로 압축·난독화된 산출물 파일. 보통 gitignore 대상

**Misrouting** — 부적절한 도구를 호출하는 오류. 주로 설명이 모호하거나 중복될 때 발생

**Missing Reference** — 리팩토링 중 놓친 참조. 런타임 에러의 원인

**Monolithic tool** — 여러 이질적 기능을 한 도구에 몰아넣은 비대한 도구. 오작동의 원인.

**multiline flag** — 여러 줄에 걸친 패턴 매칭을 켜는 검색 옵션. `.gitignore` 동작과는 무관

**Name collision** — 여러 스코프에 같은 서버 이름이 정의되어 충돌하는 상황. 우선순위가 높은 쪽 엔트리가 통째로 채택되며 병합되지 않음

**Naming Convention** — `Button.tsx` ↔ `Button.test.tsx` 같은 일관된 파일 명명 규칙

**Narrow contract** — 입력·출력·역할이 좁고 명확하게 한정된 도구 명세.

**Negative Constraint** — "이건 할 수 없다/여기엔 쓰지 마라"를 설명에 명시하는 부정형 제약

**Negative Guidance** — "이럴 때는 이 도구 대신 저 도구를 써라"처럼 경계를 명시하는 안내

**Non-retryable / Permanent Error** — 재시도해도 결과가 같은 영구적 실패

**not_found_error** — 조회 대상 리소스 자체가 존재하지 않을 때의 에러 카테고리

**Notification** — 응답을 기대하지 않는 단방향 JSON-RPC 메시지

**old_string / new_string**

- Edit의 찾을 문자열 / 바꿀 문자열. 리터럴 텍스트로 해석됨  <sub>(PRESTUDY-tool-31-45.md)</sub>
- Edit 의 치환 대상 문자열과 교체 문자열  <sub>(PRESTUDY-tool-46-60.md)</sub>

**Opaque Error** — "Operation failed." 처럼 원인을 알 수 없는 불투명한 에러 메시지

**Orchestrator / Coordinator** — 서브에이전트들을 호출·조율하는 상위 에이전트

**Ordering / Prerequisite Tool** — 다른 도구보다 반드시 먼저 실행되어야 하는 선행 도구

**Output granularity** — 도구가 내놓는 결과의 상세 수준(요약 300단어 vs 전체 내역 등).

**output_mode** — Grep 출력 형태: `files_with_matches` / `content` / `count`

**Over-privileging** — 필요 이상의 권한/도구를 부여해 오용 위험을 만드는 안티패턴

**Overlapping Scope** — 두 도구의 담당 영역이 겹쳐 모델이 구별하지 못하는 상태

**Override** — 프롬프트의 명시적 지시가 모델 자체의 판단을 덮어쓰는 현상

**Partial Results**

- 배치 작업 중 성공한 일부 결과. 실패가 있어도 버리지 않고 상위로 전달해야 함  <sub>(PRESTUDY-tool-01-15.md)</sub>
- 일부 단계만 완료된 상태의 결과 보고  <sub>(PRESTUDY-tool-31-45.md)</sub>

**Partial update (부분 업데이트)** — 일부 필드만 전달해도 나머지 필드는 기존 값이 유지되는 갱신 방식.

**Pending approval (승인 대기)** — `.mcp.json`의 프로젝트 범위 서버가 각 사용자의 명시적 승인 전까지 놓이는 상태. 자동 연결되지 않는다.

**permission (오류)** — 권한/자격 증명 부족. 같은 자격 증명으로 재시도해도 실패

**Permission Error** — 인증은 되었으나 권한 범위가 부족한 인가(authorization) 오류. 재시도 불가

**Plausible-but-wrong selection** — 그럴듯해 보이지만 의도와 다른 도구를 고르는 실패

**Policy Rule** — 계정·리소스 상태에 대한 비즈니스 규칙

**Pre-parsed Index** — 문서를 미리 파싱해 만든 조항/섹션 인덱스. 제약된 도구의 입력 후보가 됨

**Principle of Least Privilege**

- 최소 권한 원칙. 각 주체에게 작업 수행에 꼭 필요한 권한(도구)만 부여  <sub>(PRESTUDY-tool-01-15.md)</sub>
- 최소 권한의 원칙. 역할 수행에 꼭 필요한 최소한의 권한(도구)만 부여  <sub>(PRESTUDY-tool-16-30.md)</sub>
- 역할 수행에 필요한 최소한의 권한/도구만 부여하는 원칙  <sub>(PRESTUDY-tool-46-60.md)</sub>

**Prior-access requirement** — 덮어쓰기 전에 그 파일을 읽었어야 한다는 사전 접근 요구 조건.

**Process Crash** — 출력도 로그도 없이 프로세스가 죽는 것. 진단 정보가 없어 전량 재처리가 안전

**Project Scope**

- 프로젝트 루트 `.mcp.json`에 저장. Git으로 팀 전체에 공유되며 그 프로젝트에만 적용  <sub>(PRESTUDY-tool-01-15.md)</sub>
- 특정 프로젝트에 적용되며 팀과 공유되는 설정 범위  <sub>(PRESTUDY-tool-31-45.md)</sub>

**Project scope** — 저장소의 `.mcp.json`에 담겨 팀과 공유되는 설정

**Prompt injection** — 외부 데이터에 숨겨진 악의적 지시가 모델의 행동을 조종하는 공격.

**Prompts (MCP)** — 재사용 가능한 프롬프트 템플릿

**Protocol Error** — 핸들러 실행 **전** 스키마·형식 위반으로 발생하는 JSON-RPC 에러

**Rate Limit** — 단위 시간당 호출 한도 초과

**Re-export** — 모듈이 다른 모듈의 심볼을 다시 내보내는 것

**Read**

- 파일 내용을 읽는 도구  <sub>(PRESTUDY-tool-31-45.md)</sub>
- Claude Code에서 파일 내용을 컨텍스트로 로드하는 도구  <sub>(PRESTUDY-tool-46-60.md)</sub>

**Read (도구)** — 파일 내용을 읽는 도구. 수정하지 않음

**Read / Write / Edit** — 각각 파일 읽기 / 새 파일 생성·전체 덮어쓰기 / 기존 파일 부분 치환 도구

**Read-only tools** — 상태를 바꾸지 않는 도구들 (Read, Grep, Glob 등)

**replace_all**

- 파일 내 모든 출현을 일괄 치환하는 Edit 옵션  <sub>(PRESTUDY-tool-31-45.md)</sub>
- Edit 에서 모든 occurrence 를 한꺼번에 바꾸는 옵션  <sub>(PRESTUDY-tool-46-60.md)</sub>

**Reproduce** — 코드를 고치기 전에 버그를 실제로 재현해 확인하는 작업

**Reserved Built-in Name** — 호스트가 내장 기능용으로 예약한 서버 이름. 커스텀 서버가 쓰면 등록이 거부/스킵됨

**Resource URI** — 리소스를 식별하는 주소 (`file://api/authentication` 등)

**Resources (MCP)** — 모델이 읽어들이는 데이터·문서. URI로 식별. "명사"

**Retry loop (무한 재시도 루프)** — 유효성 에러를 transient로 잘못 분류해 동일 요청을 끝없이 재시도하는 실패 패턴

**Retryability** — 재시도가 의미 있는지 여부

**ripgrep** — 빠른 재귀 텍스트 검색기. 기본적으로 `.gitignore`를 존중

**Scope** — 토큰에 부여된 권한 범위 (예: `read`, `deploy`)

**Scope (설정 스코프)** — 설정이 저장·적용되는 범위. Local / Project / User

**Scope: local / user / project** — MCP 서버 등록 범위. 내 프로젝트만 / 내 모든 프로젝트 / 저장소 공유.

**Scoped Cross-Role Tool** — 다른 역할의 기능 중 자주 필요한 부분만 좁게 잘라 부여한 도구

**Separation of Concerns** — 관심사 분리. 각 구성 요소가 자기 책임 범위만 담당하도록 나누는 설계 원칙

**Shadowing** — 같은 이름의 커스텀 항목이 내장 항목을 가려 버리는 현상. 예약어 정책으로 방지

**Silent Dropping** — 실패 항목을 알리지 않고 누락시키는 안티패턴. 데이터 정합성을 깨뜨림

**Single Responsibility Principle** — 단일 책임 원칙. 하나의 도구/모듈은 하나의 명확한 역할만 갖는다.

**spawned process / environment** — 클라이언트가 새로 띄운 자식 프로세스와 그 프로세스에 주어지는 환경 변수 집합

**Stack Trace**

- 예외 발생 위치를 담은 날것의 디버깅 출력. 모델에게 그대로 넘기면 안 되는 형태  <sub>(PRESTUDY-tool-01-15.md)</sub>
- 예외 발생 시점의 함수 호출 경로 기록  <sub>(PRESTUDY-tool-31-45.md)</sub>

**stdio server** — 클라이언트가 자식 프로세스로 실행하고 표준 입출력으로 통신하는 로컬 MCP 서버

**stdio transport**

- 로컬 프로세스와 표준 입출력으로 통신하는 전송 방식  <sub>(PRESTUDY-tool-31-45.md)</sub>
- MCP 서버를 로컬 프로세스로 띄우고 표준입출력으로 통신하는 방식.  <sub>(PRESTUDY-tool-76-85.md)</sub>

**stdout / stderr** — 표준 출력 / 표준 에러 스트림

**Structured content** — 텍스트 외에 기계가 파싱할 수 있는 구조화된 결과 데이터 (예: 빈 배열 `[]`)

**Structured Content / Metadata** — 결과 중 기계가 읽는 구조화 필드. 카테고리·재시도 여부 등 제어 정보

**Structured Error** — `errorCategory`, `isRetryable` 등 기계가 읽을 수 있는 메타데이터를 담은 에러 응답

**Structured Metadata** — 에러에 붙는 구조화된 부가 정보(카테고리, 재시도 가능 여부, 대기 시간 등)

**Structured Output** — 자유 텍스트가 아닌, 기계가 파싱 가능한 형태의 출력

**Subagent**

- 좁은 역할 하나를 맡아 수행하는 하위 에이전트  <sub>(PRESTUDY-tool-01-15.md)</sub>
- 특정 역할에 특화되어 자기만의 축소된 도구 집합을 갖는 하위 에이전트  <sub>(PRESTUDY-tool-16-30.md)</sub>
- 위임받은 하위 작업을 독립 컨텍스트에서 수행하는 에이전트  <sub>(PRESTUDY-tool-31-45.md)</sub>
- 특정 단계/역할에 특화되어 소수의 도구만 갖는 하위 에이전트  <sub>(PRESTUDY-tool-46-60.md)</sub>

**Surrounding Context** — 유일성 확보를 위해 `old_string`에 함께 포함시키는 주변 코드·키·줄

**Synthesis Agent** — 이미 수집된 자료를 종합해 최종 답변을 만드는 에이전트

**System Prompt**

- 대화 전체에 걸쳐 모델의 역할과 규칙을 정하는 상위 지시문. 도구 설명보다 강하게 작용할 수 있음  <sub>(PRESTUDY-tool-01-15.md)</sub>
- 대화 전체의 규칙·역할을 규정하는 최상위 지시문  <sub>(PRESTUDY-tool-31-45.md)</sub>

**System prompt** — 모델에게 지속적으로 주어지는 지침 텍스트. 강한 권고이지 강제 실행 장치가 아니다.

**Temperature** — 생성 시 무작위성을 조절하는 샘플링 파라미터. 모델 호출 단위 설정이며 도구별 속성이 아님

**Test Runner** — 테스트를 실행하는 프로그램 (pytest, jest, cargo test 등)

**Text Block** — 결과 중 자연어 문장 부분. 모델이 사용자에게 그대로 설명할 수 있는 내용

**Tool / Function** — LLM이 호출할 수 있도록 이름·설명·입력 스키마로 정의된 외부 기능. 모델은 코드가 아니라 이 정의만 본다.

**Tool / Function Calling**

- 모델이 직접 실행하지 않고 "이 함수를 이렇게 불러 달라"는 요청을 출력하면 애플리케이션이 실행해 결과를 되돌려 주는 방식  <sub>(PRESTUDY-tool-01-15.md)</sub>
- 모델이 외부 함수를 구조화된 JSON으로 호출하도록 하는 메커니즘. 실행은 런타임이 함  <sub>(PRESTUDY-tool-46-60.md)</sub>

**Tool Count** — 한 에이전트에 부여된 도구 개수. 대략 10~20개를 넘으면 선택 정확도가 하락

**Tool Definition** — 도구의 `name`, `description`, `input_schema`로 이루어진 선언. 모델이 도구를 이해하는 유일한 근거

**Tool Description**

- 도구의 자연어 설명. 모델이 유사 도구 중 하나를 고를 때 쓰는 주된 신호  <sub>(PRESTUDY-tool-01-15.md)</sub>
- 도구가 무엇을 하고 언제 쓰이는지 적은 자연어 설명. 모델의 도구 선택 근거  <sub>(PRESTUDY-tool-16-30.md)</sub>
- 도구가 무엇을 하는지 자연어로 쓴 설명. 모델의 도구 선택에 가장 큰 영향을 미침  <sub>(PRESTUDY-tool-31-45.md)</sub>
- 도구의 용도를 모델에게 설명하는 텍스트. 모델의 도구 선택 근거가 되는 사실상 유일한 정보  <sub>(PRESTUDY-tool-46-60.md)</sub>

**Tool description** — 도구 설명문. 모델의 도구 선택 판단 근거 대부분을 차지하는 자연어 텍스트.

**Tool Disambiguation** — 이름·설명을 구체화해 비슷한 도구들의 경계를 분명히 하는 작업

**Tool Execution Error** — 핸들러가 실행된 뒤 도메인·시스템 실패로 발생하는 에러. 결과 안 `isError: true`로 표현

**Tool Registry** — 시스템이 보유한 도구들의 목록/저장소. 여러 에이전트가 공유하면 불필요한 노출이 생길 수 있음

**Tool Result** — 도구 실행 후 모델에게 되돌려 주는 결과 메시지

**Tool Routing** — 여러 도구 중 상황에 맞는 하나를 모델이 고르는 판단

**Tool Scoping**

- 에이전트별로 노출할 도구를 역할에 맞게 제한하는 설계  <sub>(PRESTUDY-tool-01-15.md)</sub>
- 에이전트가 사용할 수 있는 도구 집합을 역할에 맞게 제한하는 것  <sub>(PRESTUDY-tool-16-30.md)</sub>

**Tool Search** — 도구가 많을 때 필요한 것만 검색해 불러오는 지연 로딩 메커니즘

**Tool Selection** — 모델이 여러 도구 중 하나를 고르는 행위

**Tool selection** — 사용자 요청에 대해 모델이 어떤 도구를 호출할지 고르는 과정.

**Tool Selection / Routing** — 모델이 여러 도구 중 어떤 것을 호출할지 결정하는 과정

**Tool Selection / Tool Routing** — 여러 도구 중 요청에 맞는 하나를 고르는 과정

**Tool Use / Function Calling** — LLM에게 호출 가능한 함수 목록을 제공하고, 모델이 그중 하나를 호출하도록 하는 메커니즘

**tool_choice**

- 이번 턴에 도구를 쓸지 말지 제어하는 API 파라미터  <sub>(PRESTUDY-tool-01-15.md)</sub>
- 모델의 도구 호출 동작을 API 차원에서 제어하는 요청 파라미터  <sub>(PRESTUDY-tool-31-45.md)</sub>
- 모델의 도구 사용 방식을 강제하는 Claude API 파라미터  <sub>(PRESTUDY-tool-46-60.md)</sub>

**tool_choice: any**

- 반드시 제공된 도구 중 최소 하나를 호출해야 함. 텍스트만 응답 불가  <sub>(PRESTUDY-tool-01-15.md)</sub>
- 제공된 도구 중 반드시 하나를 호출. 어느 것인지는 모델이 선택  <sub>(PRESTUDY-tool-46-60.md)</sub>

**tool_choice: auto**

- 모델이 턴마다 도구 호출 여부를 스스로 결정 (기본값)  <sub>(PRESTUDY-tool-01-15.md)</sub>
- 도구 호출 여부를 모델이 스스로 결정  <sub>(PRESTUDY-tool-46-60.md)</sub>

**tool_choice: none**

- 도구 호출 금지, 텍스트 응답만 허용  <sub>(PRESTUDY-tool-01-15.md)</sub>
- 도구 호출 금지, 텍스트 응답만  <sub>(PRESTUDY-tool-46-60.md)</sub>

**tool_choice: tool** — 지정한 특정 도구를 반드시 호출

**tool_choice: tool (name 지정)** — 지정된 단 하나의 도구를 강제 호출

**tool_result block** — 애플리케이션이 도구 실행 결과를 모델에게 되돌려주는 블록

**tool_use block** — 모델이 출력하는, "이 도구를 이 인자로 불러달라"는 구조화된 응답 블록

**Tools (MCP)** — 모델이 호출해 행동을 수행하는 함수. "동사"

**transient (오류)** — 일시적 오류. 잠시 후 동일 요청 재시도가 유효

**Transient error** — 타임아웃·레이트 리밋 등, 그대로 다시 보내면 성공할 수 있는 일시적 에러

**Transient Error**

- 시간이 지나면 해소될 가능성이 높은 일시적 장애 (503, 타임아웃, 커넥션 리셋)  <sub>(PRESTUDY-tool-31-45.md)</sub>
- 타임아웃·503 등 일시적 인프라 오류. 백오프 후 재시도 가능  <sub>(PRESTUDY-tool-46-60.md)</sub>

**Transport (stdio / HTTP)** — MCP 서버 연결 방식. 로컬 프로세스 표준입출력 vs 원격 네트워크

**Trigger condition** — 이 도구가 호출되어야 하는 구체적 조건. 설명에 반드시 명시.

**Turn (턴)** — 사용자 요청 하나에 대응하는 에이전트의 처리 단위. 한 턴 안에 여러 도구 호출이 들어갈 수 있음

**Unique Match** — 치환 대상이 파일 내에서 유일하게 식별되는 상태

**Uniqueness (Edit)** — Edit 성공 조건. 중복 시 실패하므로 주변 문맥을 넣어 범위를 넓혀야 함

**Unprocessed** — 미처리 상태 표시. 재작업 대상임을 나타냄

**User Scope**

- `~/.claude.json`에 저장. 그 머신의 모든 프로젝트에 적용되며 팀과 공유되지 않음  <sub>(PRESTUDY-tool-01-15.md)</sub>
- 그 머신의 모든 프로젝트에 적용되며 공유되지 않는 설정 범위  <sub>(PRESTUDY-tool-31-45.md)</sub>

**Validation / Permanent error** — 필수 필드 누락·형식 오류 등, 입력을 고치지 않으면 영원히 실패하는 에러

**Validation Error**

- 입력의 형식·타입·구조 자체가 잘못된 에러. 요청을 고치면 통과 가능  <sub>(PRESTUDY-tool-31-45.md)</sub>
- 입력값의 형식·타입·필수값이 잘못된 오류. 재시도 불가  <sub>(PRESTUDY-tool-46-60.md)</sub>

**Variable expansion** — 설정 값 안의 `${VAR}`를 실제 값으로 치환하는 것

**Well-formed** — 요청이 형식적으로 올바른 상태

**Widen (old_string)** — 주변 코드를 포함시켜 대상 문자열을 유일하게 만드는 기법

**Write** — 파일 전체를 새 내용으로 덮어쓰는 도구. 부분 병합 불가

**Write (도구)** — 파일 전체를 덮어쓰는 도구. 전면 변경에 적합
