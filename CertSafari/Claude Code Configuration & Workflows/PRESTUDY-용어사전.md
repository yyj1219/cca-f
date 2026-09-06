# Claude Code Configuration & Workflows — 통합 용어 사전

`PRESTUDY-*.md` 9개 파일의 용어 사전을 항목명 기준으로 통합했다.
원본 항목 254개 → 고유 용어 223개.
한 용어에 설명이 여러 개면 출처마다 서술이 달랐던 것이므로 모두 남겼다.

---

**.claude/rules/** — 지침을 주제별 파일로 나누어 담는 디렉터리. 각 파일은 frontmatter로 적용 범위를 선언할 수 있다.

**`--allowedTools`** — 프롬프트 없이 자동 승인할 도구/명령 패턴을 지정하는 CLI 옵션.

**`--allowedTools` / `--disallowedTools`** — 사용 가능/금지 도구를 명시적으로 지정하는 CLI 플래그. Bash 차단의 확실한 방법.

**`--input-format stream-json`** — 구조화된 JSON 이벤트를 입력으로 받는 옵션. 일반 텍스트 파이프에는 필요 없다.

**`--max-budget-usd`** — 작업당 비용 상한. 안전장치이지 품질 향상 수단이 아니다.

**`--max-turns`** — 에이전트의 최대 턴(왕복) 수 제한. 폭주·비용 방지용이며 권한 통제 수단이 아니다.

**`--no-session-persistence`** — 실행 간 세션 기록을 남기지 않는 옵션.

**`--output-format stream-json`** — 결과를 JSON 이벤트 스트림으로 출력하는 옵션. 프로그램 파싱용.

**`--output-format`**

- 출력 형식 지정. `text` / `json` / `stream-json`  <sub>(PRESTUDY-conf-01-09.md)</sub>
- 출력 형식 지정(`text` / `json` / `stream-json`). 형식만 바꾸며 로직을 추가하지 않는다.  <sub>(PRESTUDY-conf-30-39.md)</sub>

**`--verbose`** — 도구 호출 등 실행 상세 로그를 함께 출력. 비용 정보 획득의 필수 조건은 아님

**`-p` / `--print`** — 비대화형(headless) 실행 플래그. 프롬프트 실행 후 결과를 출력하고 종료. CI 자동화용

**`-p` / print mode** — 대화형 UI 없이 한 번 실행하고 결과를 출력한 뒤 종료하는 CLI 모드.

**`.claude/`** — 프로젝트 안의 설정 범위. 커밋하면 팀 전체에 공유된다.

**`.claude/commands/`** — 슬래시 명령어 파일(`이름.md`) 디렉터리. 초기 방식.

**`.claude/rules/`**

- 규칙 문서를 주제별 파일로 쪼개어 담는 디렉터리  <sub>(PRESTUDY-conf-01-09.md)</sub>
- 규칙 파일들을 모아두는 디렉터리.  <sub>(PRESTUDY-conf-30-39.md)</sub>
- 규칙 `.md` 파일 디렉터리. 하위 폴더까지 **재귀적으로** 탐색된다.  <sub>(PRESTUDY-conf-60-74.md)</sub>

**`.claude/skills/<name>/SKILL.md`** — 현재 권장되는 스킬 구조. 디렉터리 형태라 부속 파일을 함께 담을 수 있다.

**`.gitignore`** — Git이 추적하지 않을 파일을 지정하는 목록. 여기에 넣으면 팀에 공유되지 않는다.

**`@` Import** — `CLAUDE.md` 등에서 `@경로`로 다른 파일의 *내용 전체*를 컨텍스트에 불러오는 문법.

**`/memory`** — 현재 세션에 실제로 로드된 메모리 파일들을 확인하는 슬래시 명령어. 지침 로딩 문제 진단용.

**`~/.claude/`** — 홈 디렉터리의 개인 설정 범위. Git 저장소 밖이라 커밋 대상이 아니다.

**`acceptEdits`** — 파일 쓰기 등 일반 작업을 자동 승인하는 권한 모드. 읽기 전용 잠금 요구와는 상충한다.

**`Bash(...)`** — 셸 명령 실행 도구에 대한 권한 패턴 표기 형식.

**`claude -p` / Headless Mode** — 대화형 UI 없이 1회 실행 후 종료하는 실행 방식. 스크립트·CI·봇용.

**`CLAUDE.local.md`** — 개인 전용 메모리 파일. 보통 Git에서 제외되며 팀에 공유되지 않는다.

**`CLAUDE.md`** — Claude Code가 세션 시작 시 자동으로 읽는 프로젝트/사용자 지침 파일.

**`context: fork`** — 스킬을 서브에이전트에서 실행해 중간 과정을 격리하고 최종 결과만 메인 대화로 반환하게 하는 설정.

**`disable-model-invocation: true`** — 모델의 자동 호출을 막고 사람이 직접 부를 때만 실행되게 하는 설정. 컨텍스트 분리와 무관.

**`dontAsk`** — 프롬프트 없이, 허용 규칙과 내장 읽기 전용 세트 밖의 모든 것을 즉시 거부하는 권한 모드. 자동화 환경용.

**`jq`** — 명령줄 JSON 처리 도구. `jq -r '.result'` 형태로 특정 필드를 추출

**`json` 출력** — 결과와 메타데이터를 하나의 JSON 객체로 반환. 스크립트 파싱용

**`managed-settings.json`** — 조직이 중앙에서 정책을 강제 배포하는 관리형 설정 파일. 배포 대상 범위가 곧 적용 범위다.

**`paths:`** — 스킬이 어떤 파일 경로에서 관련되는지 지정하는 매칭 패턴. 활성화 조건이지 실행 위치 설정이 아니다.

**`permissions.allow`** — 설정 파일에 기록하는 허용 규칙 목록.

**`result` (필드)** — JSON 응답에서 실제 답변 텍스트가 담기는 필드

**`session_id`** — 세션 식별자. 이후 세션 재개나 추적에 사용

**`settings.local.json`** — 권한·CLI 설정을 담는 개인용 JSON 파일. 서술형 지침 문서가 아니다.

**`SKILL.md`** — 스킬 정의 파일. 스킬 디렉터리 안에 위치한다.

**`stream-json`**

- 진행 이벤트를 줄 단위 JSON으로 실시간 스트리밍하는 형식  <sub>(PRESTUDY-conf-01-09.md)</sub>
- 결과를 JSON 이벤트로 점진적으로 흘려보내는 출력 형식.  <sub>(PRESTUDY-conf-30-39.md)</sub>

**`total_cost_usd`** — JSON 응답에 포함되는 이번 호출의 총 API 비용(달러)

**`usage`** — 입력/출력/캐시 토큰 사용량 정보

**`user-invocable: false`** — 사용자가 직접 호출하지 못하게 막는 설정(모델 내부 전용). 컨텍스트 분리와 무관.

**10MB stdin cap** — 파이프 입력 크기 상한. 초과 시 처리 없이 에러와 함께 즉시 종료된다.

**accept-edits / acceptEdits** — 파일 편집을 매번 묻지 않고 자동 승인하는 모드. 방향이 확실한 반복 편집에 적합

**acceptEdits** — 파일 편집을 자동 수락하는 권한 모드. 승인 클릭을 줄일 뿐, 사전 조사를 대체하지 않는다.

**adherence** — 준수율. 지침이 실제로 지켜지는 정도. 지침이 길고 지금 작업과 무관할수록 떨어진다.

**allowed-tools**

- SKILL.md frontmatter 필드. 나열된 도구의 **사용자 승인 프롬프트를 생략(자동 허용)** 한다. 도구 사용을 차단하는 보안 제한이 **아니다**.  <sub>(PRESTUDY-conf-10-19.md)</sub>
- 스킬 프론트매터에서 사용자 승인 없이 자동 실행 가능한 도구/명령을 지정하는 필드.  <sub>(PRESTUDY-conf-20-29.md)</sub>

**AskUserQuestion**

- Claude가 사용자에게 구조화된 질문을 던져 요구사항·엣지 케이스·트레이드오프를 끌어내는 도구.  <sub>(PRESTUDY-conf-10-19.md)</sub>
- Claude Code가 사용자에게 선택지 있는 질문을 던지는 도구. 요구사항 인터뷰에 사용.  <sub>(PRESTUDY-conf-30-39.md)</sub>

**asynchronous worker** — 큐에서 작업을 꺼내 백그라운드로 처리하는 프로세스.

**Auto-approve** — 자동 승인. 프롬프트 없이 실행이 허용되는 것.

**auto-detecting execution mode** — 이벤트 맥락을 보고 실행 모드를 자동 판별하는 v1.0 동작. 별도 `mode` 지정이 불필요해졌다.

**Bash tool** — Claude가 셸 명령을 실행하는 도구. 기본 활성이며, 막으려면 명시적으로 차단해야 한다.

**brace expansion** — `{ts,tsx}` 처럼 여러 대안을 한 패턴에 쓰는 중괄호 확장 문법.

**Broad Investigation** — 넓은 조사. 파일 수십 개를 읽어 흐름을 파악하는 단계. 위임 대상.

**Built-in Read-only Command Set** — `ls`, `cat`, `grep` 등 상태를 바꾸지 않아 기본 허용되는 내장 명령 집합.

**Burst limit** — 버스트 제한. 짧은 순간에 몰린 요청을 얼마나 허용할지의 한계

**bypassPermissions** — 모든 권한 확인을 건너뛰는 모드. 사람 검토 지점이 사라지므로 격리된 환경에서만 제한적으로 사용

**cache invalidation**

- 캐시 무효화. 원본이 바뀌었을 때 낡은 캐시본을 언제 어떻게 폐기할지 결정하는 문제.  <sub>(PRESTUDY-conf-10-19.md)</sub>
- 원본 변경 시 캐시된 값을 폐기하는 처리.  <sub>(PRESTUDY-conf-20-29.md)</sub>

**call site** — 어떤 함수/API가 실제로 호출되는 코드 지점.

**Canonical path** — 심볼릭 링크를 모두 풀어낸 실제 파일 시스템 경로.

**CI (continuous integration)** — 변경마다 자동으로 빌드·테스트를 돌리는 체계. 안전망이지 설계 대체재는 아니다.

**CI pipeline**

- CI 파이프라인. 코드 변경 시 자동으로 빌드·테스트·배포를 수행하는 자동화 흐름  <sub>(PRESTUDY-conf-01-09.md)</sub>
- 커밋마다 자동으로 빌드·테스트·검사를 수행하는 자동화 파이프라인.  <sub>(PRESTUDY-conf-60-74.md)</sub>

**CI Runner** — CI 파이프라인에서 작업을 실행하는 머신/프로세스. 사람이 상주하지 않는다.

**Circular detection** — 순환 감지. 링크가 자기 자신으로 되돌아오는 구조에서 무한 루프를 막는 기능

**circular detection**

- 심볼릭 링크가 서로를 가리켜 순환할 때 무한 루프를 막기 위해 방문 경로를 추적해 감지·중단하는 안전장치.  <sub>(PRESTUDY-conf-10-19.md)</sub>
- 링크가 서로를 가리키는 순환을 감지해 무한 루프를 막는 기능.  <sub>(PRESTUDY-conf-20-29.md)</sub>

**claude_args** — v1.0에서 프롬프트 외 세부 설정을 담는 인자. Claude Code CLI 인자 형식과 정렬되어 있다.

**claude-code-action** — GitHub Actions에서 Claude Code를 실행하는 액션.

**CLAUDE.local.md**

- 프로젝트 안의 개인용 지침 파일. 해당 프로젝트에만 적용되고 보통 gitignore 대상  <sub>(PRESTUDY-conf-01-09.md)</sub>
- 개인/로컬 전용 지침 파일. 팀 공용 규칙을 여기에 복사하면 중복 로딩으로 컨텍스트만 낭비된다.  <sub>(PRESTUDY-conf-10-19.md)</sub>
- 같은 프로젝트의 개인 전용 지침 문서. `.gitignore`에 직접 등록해야 한다.  <sub>(PRESTUDY-conf-60-74.md)</sub>

**CLAUDE.md**

- Claude에게 주는 프로젝트 지침서 마크다운 파일. 세션 시작 시 자동 로드  <sub>(PRESTUDY-conf-01-09.md)</sub>
- 프로젝트 규칙을 적어 세션 시작 시 Claude의 컨텍스트에 자동 주입되는 마크다운 파일. 저장소 루트 또는 디렉터리별로 둘 수 있다.  <sub>(PRESTUDY-conf-10-19.md)</sub>
- Claude Code가 세션 시작 시 자동 로드하는 지침 마크다운 파일. 프로젝트용(커밋)과 개인용(`~/.claude/`)이 있다.  <sub>(PRESTUDY-conf-20-29.md)</sub>
- 프로젝트 루트에 두면 자동 로드되는 프로젝트 상시 지침 문서. 커밋해 팀 공유.  <sub>(PRESTUDY-conf-60-74.md)</sub>

**code span** — 백틱 하나로 감싼 인라인 코드 구간. 임포트 파서가 내부를 건너뛴다.

**Code Span** — 백틱으로 감싼 인라인 코드. 임포트 파서가 건너뛰므로 `@` 임포트를 막는 데 쓰인다.

**concurrency bug** — 실행 순서/타이밍에 따라 결과가 달라지는 버그.

**conflict resolution** — 충돌 해결. 동시 편집 등으로 상충하는 변경이 발생했을 때 이를 병합·조정하는 전략(OT, CRDT 등).

**context** — 모델이 현재 알고 있는 텍스트 전체. 여기 없는 정보는 모델이 모른다.

**context (컨텍스트)** — Claude가 한 번에 참조할 수 있는 정보 전체. 유한하며, 무엇을 넣느냐가 품질과 비용을 좌우한다.

**Context / Context window** — 모델이 한 번에 볼 수 있는 텍스트 작업 공간. 여기 안 들어간 정보는 모델에게 없는 것과 같다.

**Context isolation** — 서브에이전트가 메인 대화 히스토리를 물려받지 않는 성질. 스킬 본문에 "앞서 논의한 대로" 같은 참조를 쓰면 안 되는 이유.

**Context pollution** — 컨텍스트 오염. 불필요한 파일 내용이 대화 컨텍스트를 잠식해 성능이 떨어지는 현상

**Context Pollution / Noise** — 현재 작업과 무관한 내용이 컨텍스트에 쌓여 모델 판단을 흐리는 현상.

**context usage** — 컨텍스트 사용량. 세션 시작 시점의 사용량이 높을수록 실제 작업에 쓸 여유가 줄어든다.

**Context Window** — 모델이 한 번에 처리할 수 있는 텍스트 총량. 토큰 단위로 제한되며, 다 차면 정보가 잘리고 비용·지연이 증가한다.

**context: fork**

- 스킬을 메인 대화와 분리된 별도 컨텍스트의 서브에이전트에서 실행하는 설정. 결과만 메인으로 돌아온다.  <sub>(PRESTUDY-conf-10-19.md)</sub>
- 스킬을 별도 서브에이전트에서 실행할지 정하는 옵션. `allowed-tools` 동작의 전제 조건은 아니다.  <sub>(PRESTUDY-conf-20-29.md)</sub>

**Contextual Deduplication** — 이전 결과를 컨텍스트에 넣고 "중복은 제외하라"고 지시해 반복 출력을 막는 기법.

**Correction cycle** — 수정 주기. AI 결과가 틀려서 사람이 지적하고 다시 고치는 왕복 횟수

**critical section** — 동시 진입이 금지된 코드 구간. 락으로 보호한다.

**Dedup window** — 멱등성 키를 보관하는 유효 기간. 만료되면 키가 해제된다.

**default mode** — 기본 모드. 편집과 명령 실행마다 사용자 승인을 요청

**Deployment topology** — 배포 토폴로지. 서비스들이 어떤 환경에 어떻게 배치·연결되는지의 구조

**Direct Execution**

- 직접 실행. 계획·위임 없이 바로 시키는 것. 원인이 명확하고 범위가 좁은 수정에 적합  <sub>(PRESTUDY-conf-01-09.md)</sub>
- 위임 없이 메인 에이전트가 직접 수행하는 것. 좁고 확실한 작업에 적합.  <sub>(PRESTUDY-conf-30-39.md)</sub>

**Direct execution** — 계획 단계 없이 Claude가 곧바로 편집을 수행하는 방식. 완전히 명세된 작업에 적합.

**Direct Execution (직접 실행)** — 계획이나 위임 없이 곧바로 변경을 수행하는 방식. 범위가 좁고 명확하며 코드가 잘 파악된 경우에 적합.

**direct execution (Act)** — 계획 없이 곧바로 코드를 수정·실행하는 방식.

**direct_prompt / custom_instructions / mode / max_turns** — 베타 시절의 개별 파라미터들. v1.0에서 기능이 제거된 것이 아니라 `prompt` 및 `claude_args` 구조로 통합·재편되었다.

**Edge Case** — 에지 케이스. null, 빈 값, 0, 경계값 등 정상 경로 밖의 조건.

**Editing Mode (편집 모드)** — 실제 파일 수정이 허용되는 모드. 계획 승인 시 이 모드로 전환해 승인된 설계를 곧바로 구현한다.

**Explore agent** — 내장 읽기 전용 탐색 에이전트. 컨텍스트를 작게 유지하기 위해 **시작 시 CLAUDE.md를 로드하지 않는다**.

**Explore subagent**

- 탐색 전용 서브에이전트. 위치를 모르는 코드를 넓게 찾을 때 사용. 메인 대화의 컨텍스트 오염을 막음  <sub>(PRESTUDY-conf-01-09.md)</sub>
- 읽기 전용 탐색 담당 서브에이전트. 광범위한 코드 조사에 사용.  <sub>(PRESTUDY-conf-20-29.md)</sub>
- 저장소 전역 탐색·검색 전용 서브에이전트. 결론만 요약해 돌려준다.  <sub>(PRESTUDY-conf-60-74.md)</sub>

**Explore Subagent** — 넓은 범위의 코드 탐색·조사에 특화된 읽기 전용 서브에이전트.

**failure handling** — 실패 처리. 네트워크 단절, 서버 장애 등 비정상 상황에서의 동작과 복구 방식 설계.

**Failure Mode** — 실패 모드. 시스템이 잘못될 수 있는 방식(타임아웃, 0건, 인덱스 다운 등)과 그때의 동작.

**fenced code block** — 백틱 세 개로 감싼 여러 줄 코드 블록. 역시 임포트 파싱에서 제외된다.

**Fenced Code Block** — 백틱 세 개로 감싼 코드 블록. 역시 임포트 파싱에서 제외된다.

**Few-shot Prompting** — 구체적인 입력–출력 예시를 함께 제시해 모델의 동작을 유도하는 프롬프팅 기법.

**Few-shot prompting** — 원하는 입력→출력 예시 2~3개를 프롬프트에 넣어, 추상적 지시("간결하게") 대신 구체적 패턴으로 형식을 고정하는 기법.

**Filtering** — 결과를 조건으로 걸러내는 규칙.

**Flaky test** — 코드 변경 없이도 성공/실패가 오락가락하는 불안정한 테스트.

**Fresh Session** — 컨텍스트가 비어 있는 새 대화 세션. 단계 전환 시 노이즈를 끊기 위해 사용한다.

**frontmatter**

- 마크다운 파일 맨 위에 `---`로 감싸 쓰는 YAML 메타데이터 블록. `paths`, `allowed-tools`, `context`, `agent` 등을 선언한다.  <sub>(PRESTUDY-conf-10-19.md)</sub>
- 마크다운 문서 맨 앞에 `---` 로 감싸 넣는 YAML 메타데이터 영역.  <sub>(PRESTUDY-conf-20-29.md)</sub>

**Frontmatter**

- 마크다운 파일 최상단 `---` 사이의 YAML 메타데이터 블록.  <sub>(PRESTUDY-conf-30-39.md)</sub>
- 마크다운 맨 앞에 `---`로 감싼 YAML 메타데이터 블록.  <sub>(PRESTUDY-conf-60-74.md)</sub>

**Git submodule** — 깃 서브모듈. 한 저장소 안에 다른 저장소를 중첩시키는 깃 기능. 심볼릭 링크와는 별개의 메커니즘

**git submodule** — 한 git 저장소 안에 다른 저장소를 포함시키는 기능. 규칙 공유에 심볼릭 링크를 쓰기 위한 전제 조건은 아니다.

**glob**

- 파일 경로 매칭 패턴 표기법. `*`는 한 디렉터리 단계 내, `**`는 재귀적 하위 전체, `?`는 한 글자.  <sub>(PRESTUDY-conf-10-19.md)</sub>
- 파일 경로를 패턴으로 매칭하는 문법(`*`, `**`, `?`, 중괄호).  <sub>(PRESTUDY-conf-20-29.md)</sub>

**Glob / Wildcard** — `*` 등을 쓰는 단순 패턴 매칭 문법. 정규표현식과 다르다.

**Glob pattern** — `*`, `**` 등을 쓰는 파일 경로 매칭 문법. `src/**/*.go` 등. 프로젝트 루트 기준 상대 경로로 쓴다.

**globstar** — `**`. 디렉터리 경계를 넘어 임의의 깊이까지 재귀 매칭하는 glob 패턴.

**Hallucination** — 근거 없이 그럴듯한 내용을 지어내는 현상. 구체적 로그 없이 추측을 시키면 발생하기 쉽다.

**Idempotency key** — 같은 요청의 중복 처리를 막기 위해 요청마다 붙이는 고유 식별자.

**idiom** — 특정 라이브러리에서 통용되는 관용적 코드 작성 방식.

**Import (`@경로`)** — CLAUDE.md 안에서 다른 파일을 끌어오는 문법. 작업 디렉터리와 무관하게 항상 로드됨

**import (`@path`)** — CLAUDE.md에서 다른 파일 내용을 컨텍스트로 끌어오는 문법.

**Inline Comment (PR)** — PR의 특정 코드 줄에 다는 댓글. 봇이 중복 게시하기 쉬운 대상.

**Interface** — 인터페이스. 함수 시그니처·타입·엔드포인트 등 모듈 간 계약. 스펙에 명시해야 할 항목.

**Iteration** — 요청 → 생성 → 검증 → 피드백 → 재수정의 반복 작업 사이클.

**least privilege** — 최소 권한 원칙. 필요한 최소한의 권한만 부여하는 보안 원칙. `allowed-tools`는 이를 구현하는 수단이 아니다.

**Literal Text** — 해석되지 않고 글자 그대로 남는 텍스트.

**Load at launch** — 시작 시 로드. Claude 실행 시점의 디렉터리 기준으로 해당 CLAUDE.md가 자동 로드되는 것

**Load on demand** — 온디맨드 로드. Claude가 특정 디렉터리의 파일을 읽는 순간 그 디렉터리의 CLAUDE.md가 함께 로드되는 것

**locking behavior** — 락을 언제 잡고 푸는가에 대한 동작 규칙.

**Logical grouping** — 피드백을 전달할 때, 같은 로직에서 나온 실패는 묶고 무관한 실패는 분리하는 원칙.

**Managed policy** — 관리형 정책. 조직/IT가 배포하고 개인이 편집할 수 없는 강제 설정

**Memory (Claude Code)** — 세션에 자동 로드되는 지침 파일들의 총칭.

**message queue** — 작업을 큐에 넣어 비동기로 처리하게 하는 인프라 구성 요소.

**Microservices** — 마이크로서비스. 기능별로 독립 배포되는 작은 서비스들로 나눈 구조

**migration** — 라이브러리·프레임워크·구조를 다른 것으로 옮기는 대규모 변경 작업.

**Migration Script** — 기존 데이터를 새 스키마 형태로 변환해 옮기는 스크립트.

**Monolith** — 모놀리스. 하나의 큰 덩어리로 배포되는 애플리케이션 구조

**Monorepo**

- 모노레포. 여러 패키지/서비스를 하나의 저장소에서 관리하는 구조  <sub>(PRESTUDY-conf-01-09.md)</sub>
- 여러 프로젝트를 하나의 저장소에서 관리하는 방식. 규칙을 하위 폴더로 분류할 필요가 큰 환경.  <sub>(PRESTUDY-conf-60-74.md)</sub>

**Narrow Implementation** — 좁은 구현. 파일 하나에 필드 하나 추가 같은 작은 수정. 직접 실행 대상.

**Non-interactive** — 사람의 중간 승인 없이 실행되는 방식(CI 등). `-p` 모드가 여기 해당.

**Non-interactive Environment** — 비대면 환경. 권한 프롬프트에 답할 사람이 없는 CI 등의 실행 환경.

**Null check**

- 널 체크. 값이 비어 있는지 확인하는 방어 코드  <sub>(PRESTUDY-conf-01-09.md)</sub>
- 값이 없을 수 있는 필드를 접근 전에 검사하는 것. 빠뜨리면 런타임 크래시.  <sub>(PRESTUDY-conf-60-74.md)</sub>

**Off-by-one error** — 반복문 경계에서 한 칸 어긋나는 고전적 버그(`<` vs `<=`).

**ORM** — Object-Relational Mapping. 객체와 관계형 DB를 이어 주는 라이브러리 계층.

**Override** — 오버라이드. 우선순위가 높은 쪽이 낮은 쪽을 가리고 대신 실행되는 것

**path-scoped rule** — `paths`로 범위를 지정한 규칙. **위치**가 아닌 **패턴** 기준이라 저장소 전역에 흩어진 파일도 겨냥할 수 있다.

**Path-scoped rule** — `paths:` 프론트매터로 특정 파일 패턴에만 적용되도록 범위를 제한한 규칙.

**paths (frontmatter)** — 규칙이 적용될 파일들을 글로브 패턴 목록으로 지정하는 필드. 지정 시 매칭 파일 작업 때만 규칙이 로드되고, 생략하면 항상 로드된다.

**per-directory CLAUDE.md** — 특정 디렉터리 안에 두는 CLAUDE.md. 그 디렉터리 트리, 즉 **위치** 기준으로 지침이 적용된다.

**Per-model cost breakdown** — 모델별 비용 내역. 여러 모델이 사용된 경우 각각의 토큰 수와 비용

**permission mode**

- 도구 승인 정책을 결정하는 세션 수준 설정. 실제 도구 제한은 이쪽 영역이며 `allowed-tools`로 대체되지 않는다.  <sub>(PRESTUDY-conf-10-19.md)</sub>
- 도구 사용 승인 방식의 단계(기본 / acceptEdits / plan 등).  <sub>(PRESTUDY-conf-20-29.md)</sub>

**Permission Mode** — 권한 모드. 규칙에 없는 요청을 만났을 때의 기본 대응 방식.

**permission prompt** — 도구를 실행하기 전 사용자에게 승인을 구하는 확인 절차.

**Plan Mode**

- 계획 모드. 파일을 수정하지 않고 코드베이스를 탐색·분석한 뒤 설계안을 제출하는 모드. 승인 후에만 실행 단계로 진입  <sub>(PRESTUDY-conf-01-09.md)</sub>
- 파일을 변경하기 전에 계획을 먼저 세우고 검토받는 모드. 컨텍스트 소모를 줄여주지는 않으며, 사소한 단일 수정에까지 쓰면 과잉이다.  <sub>(PRESTUDY-conf-30-39.md)</sub>

**plan mode** — 코드를 수정하지 않고 탐색·계획만 수행하는 모드. 승인 후 실행으로 전환한다.

**Plan mode** — Claude가 먼저 설계안을 제시하고 승인받은 뒤 실행하는 모드. 접근 방식이 불확실할 때 사용.

**Plan Mode (계획 모드)** — 코드를 수정하지 않고 조사 후 구현 계획을 제시하는 읽기 전용 모드.

**PR (Pull Request)** — 코드 변경 사항을 병합하기 위해 올리는 요청. 리뷰가 붙는 단위.

**Prefix Matching** — 접두사 매칭. 패턴 끝의 `*`로 인해 해당 문자열로 *시작하는* 모든 명령이 매칭되는 방식.

**Prior Findings** — 이전 실행에서 보고된 발견 사항. 중복 방지를 위해 새 실행 컨텍스트에 주입한다.

**Project scope** — 프로젝트 수준. 저장소 안 `.claude/` 아래. 팀 전체가 공유, 저장소에 커밋됨

**Project Scope** — 프로젝트 범위. `<프로젝트>/.claude/` 에 두어 저장소를 공유하는 모두에게 적용되는 설정.

**Prompt** — 모델에게 주는 지시문 및 입력 전체.

**prompt (v1.0 파라미터)** — v1.0에서 여러 프롬프트 관련 입력을 통합한 단일 파라미터.

**Ranking** — 검색 결과의 정렬·순위 규칙.

**Rate limiter** — 속도 제한 장치. 일정 시간 안의 요청 수를 제한하는 컴포넌트

**recursive glob wildcard (`**`)** — 디렉터리 경계를 넘어 임의 깊이를 매칭하는 와일드카드. `src/api/**/*.ts`가 깊은 중첩까지 포함하는 이유.

**Regex Alternation** — 정규식의 `|` 를 이용한 택일 표현. `--allowedTools`가 쓰는 방식이 *아니다*.

**regression** — 수정 과정에서 기존에 정상이던 기능이 깨지는 현상.

**Regression (회귀)** — 고친 것이 다른 멀쩡하던 기능을 깨뜨리는 현상.

**Requirements Elicitation** — 요구사항 도출. 모호한 요청을 질문으로 파고들어 구체적 결정 사항으로 바꾸는 과정.

**Reset window / reset timing** — 리셋 윈도우. 카운터가 초기화되어 요청이 다시 허용되는 시간 구간

**resolve** — 심볼릭 링크를 따라가 실제 대상 파일을 찾아내는 동작.

**resolve (심볼릭 링크 해석)** — 링크를 따라가 실제 대상 파일의 내용을 읽어내는 동작.

**Resolve (a symlink)** — 심볼릭 링크를 따라가 실제 대상 파일에 도달하는 것

**retry logic** — 실패한 호출을 조건에 따라 다시 시도하는 로직.

**sandbox** — 실행을 격리해 외부 영향을 제한하는 환경. `allowed-tools` 설정만으로 자동 적용되지 않는다.

**Schema** — 데이터의 구조 정의(필드 이름·타입·관계). 데이터 모양은 알려주지만 비즈니스 의도는 담지 않는다.

**second pass** — 1차 작업의 불일치를 맞추기 위해 다시 전체를 훑는 재작업.

**Self-contained Spec** — 자립형 명세서. 그 문서만 읽고도 구현 가능한, 외부 대화 맥락에 의존하지 않는 스펙.

**Service boundary** — 서비스 경계. 어떤 기능·데이터가 어느 서비스에 속하는지의 분할선

**Session** — 하나의 이어지는 대화 단위. 컨텍스트가 유지되는 범위.

**Session Persistence** — 세션 지속성. 이전 실행의 상태를 이어받는 기능. 끄면 기억이 더 사라진다.

**Single source of truth** — 단일 진실 공급원. 정보의 정본을 한 곳에만 두고 나머지는 그것을 참조하는 원칙

**single source of truth**

- 단일 진실 공급원. 같은 정보를 여러 곳에 복사하지 않고 한 곳에서만 관리해 불일치(드리프트)를 막는 원칙.  <sub>(PRESTUDY-conf-10-19.md)</sub>
- 동일 정보의 원본을 한 곳에만 두는 원칙. 복사본 난립을 막는다.  <sub>(PRESTUDY-conf-20-29.md)</sub>

**Single Source of Truth** — 어떤 정보의 원본이 오직 한 곳에만 존재하는 상태. 복사본이 갈라지는(drift) 문제를 원천 차단한다.

**Skill**

- 스킬. 특정 작업 절차를 담은 재사용 가능한 지침. `SKILL.md`로 정의하고 슬래시 명령으로 호출 가능  <sub>(PRESTUDY-conf-01-09.md)</sub>
- `SKILL.md`로 정의하는 재사용 가능한 절차 패키지. 프론트매터로 동작을 설정한다.  <sub>(PRESTUDY-conf-30-39.md)</sub>

**Skill / SKILL.md**

- 특정 작업 수행 방법을 담은 사전 포장된 지시서와 그 정의 파일.  <sub>(PRESTUDY-conf-10-19.md)</sub>
- 재사용 가능한 작업 절차를 담은 지침 묶음. `.claude/skills/` 또는 `~/.claude/skills/`에 위치.  <sub>(PRESTUDY-conf-20-29.md)</sub>

**Skill precedence** — 스킬 우선순위. 이름 충돌 시 `Enterprise > Personal > Project > Plugins` 순으로 하나만 선택됨

**SKILL.md** — 스킬 정의 파일. 스킬 이름은 이 파일이 든 디렉터리 이름으로 정해짐

**Slash Command** — `/이름` 으로 호출하는 저장된 프롬프트. `.claude/commands/이름.md` 파일로 정의한다.

**Slash command** — `/이름` 형태로 호출하는 커스텀 명령.

**Spec (Specification)** — 명세서. 무엇을 만들지 확정해 적은 문서.

**Spec-driven Development** — 스펙을 먼저 확정하고 그것을 기준으로 구현하는 개발 방식.

**Stack trace** — 스택 트레이스. 예외 발생 시 호출 경로를 보여주는 출력. 원인 위치 특정에 사용

**stale read** — 캐시가 무효화되지 않아 낡은 값을 읽는 버그.

**Statelessness** — 상태 없음. 헤드리스 실행이 매번 아무 기억 없이 시작하는 성질.

**stdin** — 표준 입력. 파이프(`|`)로 앞 명령의 출력을 Claude에게 전달할 때 쓰인다.

**Stop sequence** — 이 문자열이 생성되면 즉시 출력을 중단하라고 지정하는 파라미터. 포맷 경계용이며 길이 제어용으로는 부적절하다.

**Subagent**

- 서브에이전트. 격리된 별도 AI 인스턴스에 하위 작업을 위임하고 결과 요약만 받아오는 구조  <sub>(PRESTUDY-conf-01-09.md)</sub>
- 메인 대화와 분리된 자체 컨텍스트를 가진 보조 에이전트. 작업을 위임받아 수행하고 결과만 반환한다.  <sub>(PRESTUDY-conf-30-39.md)</sub>
- 메인 대화가 위임한 작업을 별도 컨텍스트에서 수행하는 하위 Claude 인스턴스.  <sub>(PRESTUDY-conf-60-74.md)</sub>

**subagent** — 별도 컨텍스트를 갖는 보조 에이전트. 결과 요약만 메인으로 돌아온다.

**subagent (서브에이전트)** — 자체 컨텍스트를 가진 보조 에이전트. 작업을 위임하고 결론만 받아 메인 컨텍스트를 보호한다.

**submodule** — 다른 git 저장소를 내 저장소 안에 참조로 포함시키는 git 기능.

**surface (표면화)** — 사전에 명확하지 않던 설계 고려사항을 드러내 인지 가능하게 만드는 것.

**Symlink (심볼릭 링크)** — 다른 경로를 가리키는 파일 시스템 바로가기. `ln -s 원본 링크`. Claude Code는 이를 따라 규칙을 정상 로드한다.

**Symlink (symbolic link)** — 심볼릭 링크. 다른 경로를 가리키는 바로가기 파일. `ln -s 대상 링크명`

**symlink (symbolic link)**

- 다른 경로를 가리키는 참조 파일. 복사본이 아니므로 원본 변경이 즉시 반영된다. `.claude/rules/`는 이를 정상 해석한다.  <sub>(PRESTUDY-conf-10-19.md)</sub>
- 다른 경로를 가리키는 바로가기 파일. 읽으면 OS가 대상으로 따라간다.  <sub>(PRESTUDY-conf-20-29.md)</sub>

**system prompt** — 에이전트에게 기본적으로 주어지는 역할·행동 지시문. 포크된 Explore 실행은 이것과 스킬 내용만 보게 된다.

**System prompt** — 대화 전체에 걸쳐 적용되는 상위 지시문. `--append-system-prompt`로 덧붙일 수 있다.

**TDD (Test-Driven Development)** — 테스트 주도 개발. 테스트를 먼저 작성하고 그것을 통과시키는 구현을 나중에 하는 방식

**Test Case** — 입력과 기대 출력의 쌍. 버그를 모호함 없이 전달하는 가장 좋은 형식이자 회귀 방지 수단.

**Test suite** — 한 프로젝트의 테스트 모음. 수정 후에는 개별 테스트가 아니라 전체를 다시 돌려 회귀를 확인한다.

**Test-driven iteration** — 테스트 주도 반복. 테스트 실패 출력을 AI에게 공유하며 반복 수정하는 워크플로

**Throttling** — 스로틀링. 한도를 초과한 요청을 거부하거나 지연시키는 동작

**token** — 모델이 텍스트를 세는 단위. 비용과 한도의 기준.

**Token** — 모델이 텍스트를 세는 단위. 대략 단어 조각 하나.

**trade-off** — 한쪽을 얻으면 다른 쪽을 잃는 선택 관계. 아키텍처 결정의 핵심 판단 재료.

**tradeoff** — 트레이드오프. 한 가지를 얻기 위해 다른 것을 포기해야 하는 설계 선택의 구조.

**Transcript** — 대화 기록 원문. 길고 정제되지 않아 스펙을 대체할 수 없다.

**tree-wide** — 저장소 디렉터리 트리 전역. 한 디렉터리에 국한되지 않음을 뜻한다.

**User Scope / Global Scope** — 사용자(전역) 범위. `~/.claude/` 에 두어 그 개인 머신의 모든 프로젝트에 적용되나, 남에게 공유되지 않는다.

**User-level / Personal scope** — 사용자(개인) 수준. `~/.claude/` 아래. 그 머신의 모든 프로젝트에 적용, 저장소에 커밋 안 됨

**verbatim** — 글자 그대로, 변형 없이. 여러 저장소가 동일 규칙을 그대로 재사용하는 상황을 가리킨다.

**well-scoped requirement** — 범위가 명확히 한정된 요구사항. 직접 실행이 정당화되는 조건.

**Workspace Trust** — 처음 여는 프로젝트를 신뢰할지 묻는 보안 관문. 수락 전에는 프로젝트 스킬의 사전 승인이 무효.
