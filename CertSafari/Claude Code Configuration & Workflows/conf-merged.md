# Claude Code Configuration & Workflows 문제 분석 모음

## 1번 문제

**A platform team is restructuring a monolith into three microservices, touching shared data models, service boundaries, and deployment topology, with several viable ways to split the code. Before any files are changed, which approach should the architect direct Claude Code to take?**

A) Skip investigation and have Claude pick one service split at random right away, then rely on integration tests to catch structural mistakes later

B) Run the restructuring through a CI pipeline with bypassPermissions enabled so the extraction finishes without any manual review step

C) Enter plan mode so Claude explores the codebase, evaluates the competing service boundaries, and proposes a design before any edit is approved

D) Start in the default accept-edits mode so Claude can begin extracting services immediately and adjust the boundaries as issues surface

---

**정답:**

**[C]번**: Enter plan mode so Claude explores the codebase, evaluates the competing service boundaries, and proposes a design before any edit is approved

**정답 및 해설:**

**핵심 개념**: Claude Code의 계획 모드(Plan Mode)는 복잡한 리팩토링이나 아키텍처 변경 전 코드베이스를 탐색하고 설계안을 먼저 제안받아 검토하는 안전 장치입니다.
   
**문제 상황 분석:**
- 모놀리스 구조를 여러 개의 마이크로서비스로 분할하는 복잡한 리팩토링 작업을 수행해야 합니다.
- 공유 데이터 모델, 서비스 경계 등 다방면에 영향을 미치며 여러 가지 대안이 존재합니다.
- 코드가 임의로 변경되기 전에 아키텍트의 신중한 검토와 설계 승인이 필수적입니다.

**[C]번이 정답인 이유:**
계획 모드(Plan Mode)를 사용하면 코드를 직접 수정하기 전에 Claude가 코드베이스를 철저히 탐색하고, 다양한 서비스 분할 경계 옵션을 평가한 뒤 최적의 설계안을 먼저 제안하므로 구조적 결함을 미리 방지할 수 있습니다.

**오답 분석:**

- Option A (오답): 무작위로 분할 방식을 선택하고 테스트에만 의존하는 것은 아키텍처 리팩토링에서 치명적인 구조적 오류를 유발합니다.
- Option B (오답): 수동 검토 단계 없이 권한을 우회하여 CI 파이프라인에서 무단 추출을 진행하는 것은 위험하며 아키텍처 제어력을 상실하게 됩니다.
- Option D (오답): 기본 수정 승인 모드로 즉시 작업을 시작하면 설계 검토 없이 코드가 변경되어 복잡한 모놀리스 분할 과정에서 통제력을 잃게 됩니다.

## 2번 문제

**A release pipeline calls `claude -p --output-format json "summarize the changes in this release"` and pipes the result to a script that reads `.result`. Finance now also wants each invocation's per-model API spend recorded for cost tracking, without adding any new flags. Where does that information already appear?**

A) Cost data only appears when `--output-format stream-json` and `--verbose` are both set, so the job must switch formats

B) The cost data is only available by separately querying the Claude usage dashboard after the run completes

C) Per-invocation cost is written to a local `.claude/usage.log` file that the script must additionally parse

D) The JSON response body already includes `total_cost_usd` along with a per-model cost breakdown alongside the result field

---

**정답:**

**[D]번**: The JSON response body already includes `total_cost_usd` along with a per-model cost breakdown alongside the result field

**정답 및 해설:**

**핵심 개념**: Claude CLI의 JSON 출력 모드(`--output-format json`)는 기본적으로 응답 내용(`result`) 외에도 비용 관련 메타데이터(`total_cost_usd` 및 모델별 비용 세부 내역)를 함께 포함하여 반환합니다.
   
**문제 상황 분석:**
- 파이프라인이 `--output-format json`을 사용하여 Claude를 호출하고 응답의 결과값을 처리하고 있습니다.
- 재무팀의 요구로 추가적인 플래그 수정 없이 각 호출의 모델별 API 비용을 비용 추적 목적으로 수집해야 합니다.
- 추가 플래그를 더하지 않고도 기존 JSON 응답 데이터 구조 내에서 비용 정보를 이미 얻을 수 있는지 확인해야 합니다.

**[D]번이 정답인 이유:**
Claude CLI의 JSON 응답 구조에는 `result` 필드와 더불어 `total_cost_usd` 및 모델별 비용 내역(per-model cost breakdown)이 이미 포함되어 출력되므로, 새로운 플래그를 추가할 필요 없이 기존 결과 본문에서 해당 정보를 바로 추출할 수 있습니다.

**오답 분석:**

- Option A (오답): 비용 데이터가 특정 스트림 포맷이나 상세(verbose) 플래그 조합에서만 나타난다는 설명은 틀렸으며, 기본 JSON 출력에 이미 포함되어 있습니다.
- Option B (오답): 실행 완료 후 별도의 대시보드를 조회해야 한다는 것은 자동화된 파이프라인 스크립트 처리 방식에 맞지 않습니다.
- Option C (오답): 로컬에 별도의 `usage.log` 파일이 생성되어 파싱해야 한다는 것은 사실이 아니며, 응답 본문 내에 비용 정보가 함께 포함됩니다.

## 3번 문제

**A stack trace points to a null check missing in a single function inside one file, and the fix is a one-line conditional. Which workflow best matches the scope of this change?**

A) Delegate the fix to an Explore subagent so the discovery work stays fully isolated from the rest of the main conversation entirely

B) Plan mode, since any production bug fix always warrants a written proposal and a full approval cycle no matter how small the change is

C) Direct execution, since the change is a well-scoped, single-file fix with a clear cause already identified from the trace

D) Split the one-line fix into a multi-phase plan with a separate research session and a separate implementation session afterward

---

**정답:**

**[C]번**: Direct execution, since the change is a well-scoped, single-file fix with a clear cause already identified from the trace

**정답 및 해설:**

**핵심 개념**: Claude Code에서 명확하고 범위가 좁은 단순 버그 수정은 복잡한 계획 모드나 서브에이전트 위임 없이 직접 실행(Direct Execution)하는 것이 가장 효율적입니다.
   
**문제 상황 분석:**
- 스택 트레이스를 통해 단일 파일 내 단 하나의 함수에 널 체크가 누락된 원인이 명확히 파악되었습니다.
- 해결책 역시 한 줄짜리 조건문 추가로 매우 단순합니다.
- 변경 범위가 매우 좁고 명확하여 불필요한 오버헤드가 필요하지 않습니다.

**[C]번이 정답인 이유:**
문제에서 원인이 스택 트레이스를 통해 이미 명확히 밝혀졌고 단일 파일 내의 단순한 한 줄 수정이므로, 복잡한 절차 없이 직접 실행(Direct execution)하는 워크플로가 이 변경 사항의 범위에 가장 적합합니다.

**오답 분석:**

- Option A (오답): 이미 원인과 수정 내용이 명확한 단순 버그 수정에 탐색용 서브에이전트를 동원하는 것은 과도한 조치입니다.
- Option B (오답): 변경 사항이 매우 사소하고 명확할 때까지 무조건 서면 제안과 승인 주기를 거쳐야 한다는 것은 비효율적입니다.
- Option D (오답): 한 줄짜리 단순한 픽스를 다단계 계획이나 별도의 연구 세션으로 쪼개는 것은 불필요한 낭비입니다.

## 5번 문제

**An architect wants each developer to have their personal editor and formatting preferences automatically apply across all projects on their local machine, without committing those preferences to any project repository. Where should these preferences be configured?**

A) In the organization's managed policy CLAUDE.md, since only managed policy files can hold personal, non-project-specific preferences

B) In `~/.claude/rules/` on the developer's machine, since user-level rules apply to every project and load before project rules do

C) In CLAUDE.local.md at the root of every project, since local files are the only mechanism applying across a developer's projects

D) In `.claude/rules/` inside every project's repository, duplicated identically across each repo so the preferences travel with the code

---

**정답:**

**[B]번**: In `~/.claude/rules/` on the developer's machine, since user-level rules apply to every project and load before project rules do

**정답 및 해설:**

**핵심 개념**: Claude Code의 사용자 수준(User-level) 규칙 디렉터리를 사용하면 프로젝트 저장소에 커밋하지 않고도 모든 프로젝트에 공통 설정을 전역적으로 적용할 수 있습니다.
   
**문제 상황 분석:**
- 개발자가 프로젝트 저장소에 환경설정을 커밋하지 않기를 원합니다.
- 로컬 머신상의 모든 프로젝트에 개인 편집기 및 서식 환경설정이 자동으로 적용되어야 합니다.
- 전역적으로 작동하는 사용자 수준의 설정 위치를 파악해야 합니다.

**[B]번이 정답인 이유:**
개발자의 로컬 머신에 있는 `~/.claude/rules/` 디렉터리에 설정을 배치하면, 사용자 수준의 규칙으로서 특정 프로젝트 저장소에 커밋되지 않으면서도 모든 프로젝트에 공통으로 적용되고 프로젝트 규칙보다 먼저 로드되므로 요구사항을 완벽히 충족합니다.

**오답 분석:**

- Option A (오답): 조직의 관리형 정책 CLAUDE.md는 개인이 자유롭게 로컬 편집기 환경설정을 구성하는 용도가 아닙니다.
- Option C (오답): 각 프로젝트 루트의 CLAUDE.local.md는 특정 프로젝트 범위에 한정되거나 개별 프로젝트 저장소 안에서 다뤄지므로 모든 프로젝트에 전역적으로 적용되는 올바른 메커니즘이 아닙니다.
- Option D (오답): 프로젝트 저장소 내부의 `.claude/rules/`에 저장하고 복제하는 방식은 코드가 저장소에 커밋되어야 하므로 저장소에 커밋하지 않는다는 조건에 위배됩니다.

## 6번 문제

**A developer wants Claude Code to implement a rate limiter for an internal API and wants to reduce the number of correction cycles needed afterward. Which opening approach best follows a test-driven iteration pattern?**

A) Ask Claude to write a test suite covering the expected throttling behavior, burst limits, and reset timing first, then implement the rate limiter, iterating by sharing test failures.

B) Ask Claude to implement the rate limiter and manually verify it by running sample requests such as bursts, retries, and checking rate limit headers in the terminal, without automated tests.

C) Ask Claude to describe the rate limiting algorithm in a design document covering throttle rules, burst limits, and reset windows, then implement it from that document without writing tests.

D) Ask Claude to implement the rate limiter first, then write a matching test suite afterward that validates throttle responses, burst handling, and window resets to document the built behavior.

---

**정답:**

**[A]번**: Ask Claude to write a test suite covering the expected throttling behavior, burst limits, and reset timing first, then implement the rate limiter, iterating by sharing test failures.

**정답 및 해설:**

**핵심 개념**: 테스트 주도 개발(TDD) 패턴을 AI 에이전트 워크플로에 적용하여, 구현 전에 테스트 코드를 먼저 작성하고 실패 사례를 기반으로 반복 수정함으로써 수정 주기를 최소화합니다.
   
**문제 상황 분석:**
- 개발자가 내부 API용 속도 제한 장치를 구현하고자 합니다.
- 구현 후 발생할 수 있는 시행착오와 불필요한 수정 주기(correction cycles)를 줄이기를 원합니다.
- 테스트 주도 반복 패턴에 가장 부합하는 작업 시작 방식을 찾아야 합니다.

**[A]번이 정답인 이유:**
예상되는 스로틀링 동작, 버스트 제한, 리셋 타이밍을 다루는 테스트 스위트를 먼저 작성하게 한 뒤 이를 기반으로 구현을 진행하고, 테스트 실패 결과(test failures)를 공유하며 반복 수정하는 방식은 완벽한 테스트 주도 반복 패턴(test-driven iteration pattern)에 부합하여 수정 횟수를 크게 줄여줍니다.

**오답 분석:**

- Option B (오답): 자동화된 테스트 없이 터미널에서 **수동으로 샘플 요청을 검증하는 것은 반복 주기를 줄이는 테스트 주도 패턴이 아닙니다**.
- Option C (오답): 테스트 작성 없이 **설계 문서만 작성하고 구현하는 것은 테스트 주도 개발 방식에 어긋납니다**.
- Option D (오답): **구현을 먼저 하고 테스트를 나중에 작성하는 방식은 전통적인 테스트 후행 방식**이며, 수정 주기를 줄이려는 목적에 맞지 않습니다.

## 7번 문제

**A platform team maintains a monorepo with `packages/api`, `packages/web`, and `packages/shared`. The api package's maintainer wants api-specific database and testing conventions to load only when someone is actively working in `packages/api`, without duplicating those conventions into the root `CLAUDE.md`. Which approach best satisfies this requirement?**

A) Add `@packages/api/CLAUDE.md` as an import inside `packages/api/CLAUDE.md` itself, since imports referencing their own containing file take precedence over root-level rules

B) Paste the api-specific conventions directly into every developer's `~/.claude/CLAUDE.md` so they apply automatically whenever anyone opens the api package

C) Reference the api-specific standards file from the root `CLAUDE.md` using `@packages/api/CLAUDE.md` so it always loads at launch regardless of working directory

D) Create `packages/api/CLAUDE.md` with the api-specific conventions, so it loads at launch when Claude starts from `packages/api` or on demand when Claude reads files there

---

**정답:**

**[D]번**: Create `packages/api/CLAUDE.md` with the api-specific conventions, so it loads at launch when Claude starts from `packages/api` or on demand when Claude reads files there

**정답 및 해설:**

**핵심 개념**: Claude Code는 하위 디렉터리별로 `CLAUDE.md` 파일을 배치하여 작업 디렉터리에 따라 해당 규칙을 자동으로 로드하거나 필요할 때 온디맨드로 불러오는 스코프 규칙 관리 방식을 지원합니다.
   
**문제 상황 분석:**
- 모노레포 구조에서 `packages/api` 전용의 데이터베이스 및 테스트 규칙을 설정해야 합니다.
- 이 규칙은 루트 `CLAUDE.md`에 중복으로 포함되지 않아야 합니다.
- 오직 `packages/api` 디렉터리 내에서 작업할 때만 해당 규칙이 적용되기를 원합니다.

**[D]번이 정답인 이유:**
`packages/api/` 하위 디렉터리에 전용 `CLAUDE.md` 파일을 생성하면, Claude가 해당 디렉터리에서 시작할 때 실행 시 로드되거나 내부 파일을 읽을 때 온디맨드로 로드되므로 루트 파일을 오염시키지 않고 요구사항을 깔끔하게 만족합니다.

**오답 분석:**

- Option A (오답): 자기 자신을 참조하는 순환 임포트 구조를 파일 내에 추가하는 것은 유효하지 않으며 문법적/논리적 오류를 유발합니다.
- Option B (오답): 모든 개발자의 로컬 머신 설정 파일(`~/.claude/CLAUDE.md`)에 수동으로 붙여넣는 방식은 중앙 관리 및 자동화 목표에 위배됩니다.
- Option C (오답): 루트 `CLAUDE.md`에서 참조하면 작업 디렉터리와 무관하게 항상 로드되므로 "오직 api 패키지에서 작업할 때만 로드"하라는 조건에 어긋납니다.

## 8번 문제

**A test run against a newly generated report-export module in Claude Code produces two failures: a currency-formatting mismatch in the summary totals and a completely unrelated failure where the export filename generator omits the file extension on Windows paths. How should these two failures be presented to Claude for the next iteration?**

A) Report each failure sequentially in its own message: first address the currency-formatting mismatch, and once confirmed fixed, the filename extension issue, because the two problems are independent.

B) Withhold the filename extension failure and report only the currency-formatting mismatch as the primary defect found first, deferring the secondary extension issue to avoid distracting Claude from the more critical formatting fix.

C) Combine the currency-formatting mismatch and the filename extension omission into a single message, instructing Claude to treat them as a single interacting defect that corrupts the report and must be fixed together.

D) Ask Claude to evaluate the test results and fix whichever failure appears more severe first, relying on its internal judgment of the impact on report correctness without stating the exact currency mismatch or missing extension details.

---

**정답:**

**[A]번**: Report each failure sequentially in its own message: first address the currency-formatting mismatch, and once confirmed fixed, the filename extension issue, because the two problems are independent.

**정답 및 해설:**

**핵심 개념**: LLM 기반 코딩 에이전트(Claude Code)와 작업할 때는 서로 독립적인 **여러 개의 버그**를 한 번에 섞어 전달하기보다, **하나씩 순차적으로 해결**하여 컨텍스트 혼란을 방지하는 것이 가장 효과적입니다.
   
**문제 상황 분석:**
- 보고서 내보내기 모듈 테스트에서 통화 서식 불일치와 Windows 경로 확장자 누락이라는 두 가지 완전히 무관한(_independent_) 결함이 발생했습니다.
- 두 문제는 서로 상호작용하지 않는 독립적인 버그입니다.
- AI 에이전트에게 이를 명확하고 정확하게 지시하여 효율적인 수정 주기를 가져가야 합니다.

**[A]번이 정답인 이유:**
두 문제가 독립적이므로 각각 별도의 메시지로 순차적으로 보고하고, 첫 번째 문제가 해결된 것을 확인한 뒤에 두 번째 문제를 다루는 방식은 Claude가 한 번에 하나의 문제에 집중하도록 유도하여 수정 정확도를 높이고 오작동을 방지하는 모범 사례입니다.

**오답 분석:**

- Option B (오답): 두 번째 문제를 완전히 숨기고 나중으로 미루는 것은 한 번에 여러 문제를 해결할 수 있는 기회를 놓치게 만들며 불필요한 단계를 늘립니다.
- Option C (오답): 무관한 두 문제를 상호작용하는 단일 결함으로 묶어서 보고하면 AI가 잘못된 인과관계를 유추하여 코드를 엉뚱하게 수정할 수 있습니다.
- Option D (오답): 정확한 버그 세부 정보를 생략한 채 AI의 내부 판단에만 의존하여 심각한 것을 먼저 고치게 하는 것은 모호하고 통제 불가능한 결과를 초래합니다.

## 9번 문제

**A project's `.claude/skills/review/SKILL.md` is checked into the repo for team-wide use. A senior engineer also keeps a `~/.claude/skills/review/SKILL.md` on their laptop for personal projects, unaware it uses the same name. When this engineer works in the shared repository and runs `/review`, which skill actually executes?**

A) The personal skill at `~/.claude/skills/review/SKILL.md`, because a skill with the same name at the personal level overrides one from the project level.

B) Both skills execute in sequence, first the personal skill and then the project skill, since Claude Code merges same-named skills rather than choosing one.

C) Neither skill executes, and Claude Code reports a naming conflict error until one of the two files is renamed.

D) The project skill at `.claude/skills/review/SKILL.md`, because project-scoped skills always take priority over personal ones with the same name.

---

**정답:**

**[A]번**: The personal skill at `~/.claude/skills/review/SKILL.md`, because a skill with the same name at the personal level overrides one from the project level.

**정답 및 해설:**

**핵심 개념**: Claude Code의 **스킬(Skills) 우선순위** 계층 구조로, 동일한 이름의 스킬이 충돌할 때 **개인 범위(Personal) 설정이 프로젝트 범위(Project) 설정보다 우선 적용**됩니다.
   
**문제 상황 분석:**
- 프로젝트 저장소에는 팀 전체 공유를 위한 프로젝트 스킬(`.claude/skills/review/SKILL.md`)이 포함되어 있습니다.
- 개발자의 로컬 노트북 환경에는 동일한 이름을 가진 개인 스킬(`~/.claude/skills/review/SKILL.md`)이 존재합니다.
- 공유 저장소 안에서 `/review` 명령어를 실행할 때 어떤 스킬이 우선적으로 선택되는지 그 충돌 해결 방식을 명확히 파악해야 합니다.

**[A]번이 정답인 이유:**
Claude Code의 공식 스킬 우선순위 규칙(Enterprise > Personal > Project > Plugins)에 따르면, 개인 수준(Personal)의 스킬은 프로젝트 수준(Project)의 스킬보다 우선순위가 높습니다. 따라서 동일한 이름의 스킬이 존재할 경우 프로젝트 스킬이 무시되고 개인 스킬이 오버라이드하여 실행됩니다.

**오답 분석:**

- Option B (오답): 동일한 이름의 스킬들을 서로 병합하여 순차적으로 둘 다 실행한다는 설명은 실제 구동 방식과 다릅니다.
- Option C (오답): 이름 충돌 오류가 발생하여 실행이 중단된다는 것은 사실이 아니며, 명확한 우선순위 계층에 따라 결정됩니다.
- Option D (오답): 프로젝트 범위의 스킬이 개인 스킬보다 우선한다는 설명은 실제 Claude Code의 우선순위 방향과 반대이므로 오답입니다.

---

## 10번 문제

**1. 문제 원문**

A developer creates a `report-generator` skill and wants to ensure it can only write and edit files, without the ability to run shell commands or delete files. They configure `allowed-tools: Write Edit` in the `SKILL.md` frontmatter without changing the permission mode. Which statement about this approach is correct?

A) This configuration will effectively restrict the skill to only file write operations, preventing any destructive tool invocations.

B) Using `allowed-tools` is the recommended method to limit a skill's capabilities in compliance with least privilege principles.

C) Setting `allowed-tools` to `Write Edit` automatically sandboxes the skill, disabling all tools except file operations.

D) The `allowed-tools` field bypasses user permission prompts for the listed tools but does not restrict which tools are available to the skill; other tools like Bash can still be invoked.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**D번**: The `allowed-tools` field bypasses user permission prompts for the listed tools but does not restrict which tools are available to the skill; other tools like Bash can still be invoked.

**정답 및 해설:**


**핵심 개념**: Claude Code 스킬의 `allowed-tools` frontmatter 속성 동작 방식과 권한 프롬프트 우회 메커니즘.

**문제 상황 분석:**
- 개발자가 `report-generator` 스킬이 파일 쓰기와 편집만 수행하도록 제한하고자 합니다.
- `SKILL.md` 파일의 frontmatter에 `allowed-tools: Write Edit`를 설정하여 보안 제한을 적용하려 합니다.
- 스킬의 권한 모드를 변경하지 않은 상태에서 이 설정이 의도한 대로 도구 사용을 제한하는지 여부를 파악해야 합니다.

**D번이 정답인 이유:**
`allowed-tools` 필드는 보안상의 접근 제한(Restrict) 목적이 아니라, 나열된 도구에 대해 사용자 승인 프롬프트(permission prompts)를 생략(자동 허용)하기 위한 용도로 사용됩니다. 따라서 이 설정은 특정 도구의 사용을 차단하거나 제한하지 않으며, Bash 등 다른 도구들도 여전히 호출될 수 있습니다.

**오답 분석:**

- Option A (오답): `allowed-tools`는 도구 사용을 제한하는 보안 필터가 아니라 승인 프롬프트를 우회하는 용도이므로 파괴적인 도구 호출을 막지 못합니다.
- Option B (오답): 최소 권한 원칙을 준수하기 위해 스킬의 기능을 제한하는 올바른 권장 보안 설정 방법이 아닙니다.
- Option C (오답): 자동으로 스킬을 샌드박스 처리하거나 파일 작업 외의 도구를 원천 비활성화하지 않습니다.

---

## 11번 문제

**1. 문제 원문**

An architect finishes a plan mode session where Claude proposed a design for restructuring a shared utilities package used by 12 services. The architect wants Claude to now make the changes exactly as proposed, without re-explaining the reasoning behind each file edit. What should the architect do next?

A) Stay in plan mode indefinitely and have Claude describe each proposed file edit in the chat instead of ever actually making the edit

B) Approve the plan and choose an option that switches the session into an editing mode, so Claude proceeds directly with the approved design

C) Exit the session without approving anything and instead manually perform the twelve-service restructuring by hand rather than having Claude do it

D) Start an entirely new session from scratch and re-describe the utilities package restructuring in full before implementation begins

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**B번**: Approve the plan and choose an option that switches the session into an editing mode, so Claude proceeds directly with the approved design

**정답 및 해설:**


**핵심 개념**: Claude Code의 **Plan Mode(계획 모드)**와 승인 후 **Editing Mode(편집 모드)** 간의 전환 및 실행 흐름.

**문제 상황 분석:**
- 아키텍트가 12개 서비스에서 사용하는 공유 유틸리티 패키지 구조 조정을 위한 계획 모드 세션을 완료함.
- 추가적인 설명이나 추론 과정의 반복 없이, 제안된 설계 그대로 코드를 직접 변경하고 싶어 함.
- 계획된 내용을 효율적으로 구현 단계로 전환하기 위한 올바른 절차를 선택해야 함.

**B번이 정답인 이유:**
계획(Plan)을 승인하고 세션을 편집 모드로 전환하는 옵션을 선택하면, 이미 검증되고 합의된 설계를 바탕으로 Claude가 지연 없이 곧바로 실제 파일 수정 작업(Implementation)을 진행할 수 있기 때문입니다.

**오답 분석:**

- Option A (오답): 계획 모드에 무기한 머무르면 실제 코드 수정은 이루어지지 않고 채팅으로 설명만 반복되므로 목적에 어긋납니다.
- Option C (오답): 작업을 승인하지 않고 세션을 종료한 뒤 수동으로 직접 코드를 수정하는 것은 Claude의 자동화 기능을 활용하지 않는 비효율적인 방법입니다.
- Option D (오답): 이미 완성된 설계를 버리고 처음부터 새로운 세션을 시작하여 전체 내용을 다시 설명하는 것은 불필요한 중복 작업입니다.

---

## 12번 문제

**1. 문제 원문**

A developer asks Claude to add a check that rejects an expiration date earlier than today's date inside one existing form-validation function. The function and its surrounding file are already well understood by the team. What is the most efficient way to handle this request?

A) Delegate the task to an Explore subagent to catalog every date-handling function in the repository before writing the conditional

B) Enter plan mode first to explore whether other validation functions in the codebase should also be restructured

C) Treat the request as a multi-file migration and draft a phased plan covering all forms in the application

D) Proceed with direct execution, since the change is confined to one function with a clear, well-scoped requirement

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**D번**: Proceed with direct execution, since the change is confined to one function with a clear, well-scoped requirement

**정답 및 해설:**


**핵심 개념**: AI 코딩 어시스턴트 사용 시 작업의 복잡도에 따른 효율적인 실행 방식 선택 (Direct Execution vs. Plan Mode).

**문제 상황 분석:**
- 변경 대상이 기존의 단일 폼 검증 함수 하나로 명확히 제한되어 있음.
- 해당 함수와 주변 파일의 구조가 이미 팀원들에게 잘 파악되어 있어 추가적인 대규모 탐색이나 설계가 불필요함.
- 최소한의 노력으로 가장 효율적으로 작업을 처리할 수 있는 접근 방식을 선택해야 함.

**D번이 정답인 이유:**
요구사항의 범위가 좁고 명확하며 단일 함수 내의 수정으로 한정되어 있으므로, 복잡한 계획 모드나 서브에이전트 위임 없이 곧바로 직접 실행(Direct Execution)하는 것이 가장 빠르고 효율적이기 때문입니다.

**오답 분석:**

- Option A (오답): 이미 잘 파악된 단일 함수 수정에 불필요하게 Explore 서브에이전트를 동원해 전체 저장소를 탐색하는 것은 비효율적입니다.
- Option B (오답): 단일 함수 수정 요청에 대해 불필요하게 계획 모드(plan mode)에 진입하여 다른 함수들까지 확장하려 하는 것은 과도한 조치입니다.
- Option C (오답): 단일 파일/함수 수정 건을 대규모 다중 파일 마이그레이션으로 과장하여 처리하는 것은 적절하지 않습니다.

---

## 13번 문제

**1. 문제 원문**

An API team wants a rule requiring input validation and OpenAPI comments to apply only to TypeScript files inside `src/api/`, including deeply nested route handler subfolders, but not to TypeScript files elsewhere in the repo such as `src/utils/` or `src/components/`. Which paths frontmatter correctly scopes the rule to this requirement?

A) 
```
paths:
   - "src/api/**/*.ts"
```

B) 
```
paths:
   - "src/**/*.ts"
```

C) 
```
paths:
   - "api/**/*.ts"
```

D) 
```
paths:
   - "src/api/*.ts"
```

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: `paths: - "src/api/**/*.ts"`

**정답 및 해설:**


**핵심 개념**: 글로브(Glob) 패턴을 활용한 디렉터리 경로 및 중첩 폴더 타겟팅 규칙 설정.

**문제 상황 분석:**
- API 팀은 `src/api/` 폴더 내부의 파일에만 특정 규칙을 적용하고자 합니다.
- 하위의 깊게 중첩된(deeply nested) 서브폴더까지 모두 포함되어야 합니다.
- 반면 `src/utils/`나 `src/components/` 같은 다른 경로의 파일들은 제외되어야 합니다.

**A번이 정답인 이유:**
`src/api/` 경로 아래에 있는 모든 하위 디렉터리의 중첩된 구조(`**`)와 모든 TypeScript 파일(`.ts`)을 정확하게 타겟팅할 수 있는 올바른 글로브 패턴(`src/api/**/*.ts`)을 사용했기 때문입니다.

**오답 분석:**

- Option B (오답): `src/**/*.ts`는 `src/` 하위의 모든 TypeScript 파일을 대상으로 하므로 `src/utils/`나 `src/components/`까지 포함되어 요구사항을 벗어납니다.
- Option C (오답): `api/**/*.ts`는 루트 기준의 `src/api/` 경로와 정확히 일치하지 않아 의도대로 범위를 좁히지 못할 수 있습니다.
- Option D (오답): 단일 와일드카드(`*`)인 `src/api/*.ts`는 `src/api/` 직하위의 파일만 매칭하고 중첩된 서브폴더 내부의 파일은 포함하지 못합니다.

---

## 14번 문제

**1. 문제 원문**

An architect is deciding whether a new set of database-migration conventions should live in a per-directory CLAUDE.md inside `src/db/` or as a path-scoped rule under the repository root's `.claude/rules/` with `paths: ["**/migrations/**"]`. The migration conventions need to apply to migration files scattered across several unrelated subsystems, not just one directory. Which structure fits this requirement better, and why?

A) A per-directory CLAUDE.md in `src/db/`, because path-scoped rules can only match a single exact directory, never recursive glob wildcards

B) Neither approach works for scattered files; the only option is duplicating the same CLAUDE.md manually into every directory with migrations

C) A per-directory CLAUDE.md in `src/db/`, because directory files always take precedence over rules no matter how scattered the matches are

D) A path-scoped rule under `.claude/rules/` with the migrations glob, since it targets files by pattern tree-wide rather than one directory

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**D번**: A path-scoped rule under `.claude/rules/` with the migrations glob, since it targets files by pattern tree-wide rather than one directory

**정답 및 해설:**


**핵심 개념**: Claude Code에서 디렉터리별 `CLAUDE.md`와 루트 `.claude/rules/`의 경로 범위 지정(path-scoped rules) 및 글로브 패턴 활용 차이점.

**문제 상황 분석:**
- 데이터베이스 마이그레이션 파일들이 단일 디렉터리가 아닌 여러 개의 독립된 서브시스템에 걸쳐 산재해 있음.
- 특정 단일 디렉터리에만 국한되지 않고 프로젝트 전반의 흩어진 파일들에 공통 규칙을 적용해야 하는 상황임.
- 다중 디렉터리에 분산된 파일들을 효율적으로 커버할 수 있는 설정 방식을 선택해야 함.

**D번이 정답인 이유:**
`.claude/rules/` 하위에서 `paths: ["**/migrations/**"]`와 같은 재귀적 글로브(glob) 패턴을 사용하면, 특정 하나의 디렉터리에 묶이지 않고 저장소 전체(tree-wide)에 걸쳐 패턴과 일치하는 마이그레이션 파일을 타겟팅할 수 있으므로 산재된 파일들에 규칙을 적용하는 요구사항에 가장 적합합니다.

**오답 분석:**

- Option A (오답): 경로 범위 규칙(path-scoped rules)은 재귀적 글로브 와일드카드(`**`)를 지원하며 단일 디렉터리만 매칭한다는 설명은 틀렸습니다.
- Option B (오답): 글로브 패턴을 지원하는 경로 범위 규칙을 활용하면 되므로 수동으로 파일을 중복 복제할 필요가 없습니다.
- Option C (오답): 디렉터리별 `CLAUDE.md`는 `src/db/` 외부로 흩어져 있는 마이그레이션 파일들을 포괄할 수 없으므로 부적절합니다.

---

## 15번 문제

**1. 문제 원문**

A developer sets `context: fork` and `agent: Explore` on a `pr-summary` skill that fetches PR data and summarizes it. They notice the summary never reflects conventions written in the project's `CLAUDE.md`. Why not?

A) `context: fork` enforces strict isolation by removing project-level files like `CLAUDE.md` from every subagent's context, so even when using `agent: Explore`, the agent never sees the conventions and cannot apply them.


B) The `pr-summary` skill requires the `allowed-tools: Read` permission to include `CLAUDE.md` in the forked subagent's context, and without that permission, the file is not loaded even when the project has conventions.


C) The built-in `Explore` agent skips loading `CLAUDE.md` at startup to keep its context small, so a forked skill using that agent only sees the skill content and the agent's own system prompt.


D) `CLAUDE.md` conventions are only loaded when a skill is invoked without arguments, and since the `pr-summary` skill receives PR data as an argument, the conventions are omitted from the forked subagent's context.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**C번**: The built-in `Explore` agent skips loading `CLAUDE.md` at startup to keep its context small, so a forked skill using that agent only sees the skill content and the agent's own system prompt.

**정답 및 해설:**


**핵심 개념**: Claude Code 스킬의 `context: fork` 및 내장 `Explore` 에이전트 동작 시 `CLAUDE.md` 로딩 제외 메커니즘.

**문제 상황 분석:**
- 개발자가 `pr-summary` 스킬에 `context: fork`와 `agent: Explore` 설정을 적용함.
- 실행 결과, 생성된 요약문이 프로젝트의 `CLAUDE.md`에 정의된 코딩 컨벤션을 반영하지 못하는 현상이 발생함.
- 특정 에이전트 환경에서 프로젝트 컨벤션 파일이 누락되는 이유를 규명해야 함.

**C번이 정답인 이유:**
내장된 `Explore` 에이전트는 컨텍스트 크기를 최적화하고 작게 유지하기 위해 시작 시 `CLAUDE.md` 로딩 과정을 건너뛰도록 설계되어 있습니다. 이로 인해 `context: fork`와 `agent: Explore`를 함께 사용하는 스킬은 프로젝트의 컨벤션 정보를 전달받지 못하고, 오직 스킬의 내용과 에이전트 자체의 시스템 프롬프트만 참조하게 됩니다.

**오답 분석:**

- Option A (오답): `context: fork`가 프로젝트 수준의 파일을 무조건 제거하여 격리하는 것이 아니라, 에이전트 자체의 초기화 특성에 기인한 것입니다.
- Option B (오답): `allowed-tools: Read` 권한은 파일 읽기 권한 제어를 위한 것이며 `CLAUDE.md` 자동 로드 여부를 결정하는 직접적인 요인이 아닙니다.
- Option D (오답): 인자(arguments)의 유무에 따라 `CLAUDE.md` 로딩 여부가 결정된다는 설명은 사실과 다릅니다.

---

## 16번 문제

**1. 문제 원문**

A CLAUDE.md file has grown past 300 lines because it contains detailed conventions for GraphQL resolvers, database migrations, and CSS modules, each relevant only to a specific part of the codebase. Session-start context usage is climbing and adherence is dropping. What is the most effective way to address this using path-specific rules?

A) Copy the same GraphQL, migration, and CSS sections into a new CLAUDE.local.md file so it loads alongside the existing CLAUDE.md, giving Claude two overlapping sources of the identical guidance to reinforce adherence at every session start.


B) Wrap the GraphQL, migration, and CSS sections in HTML maintainer comments within CLAUDE.md so they are stripped before injection, then re-insert each section manually into the conversation whenever Claude happens to work on that area.


C) Move the entire CLAUDE.md content into a single .claude/rules/ file without a paths field, which shrinks the file on disk but keeps every topic's guidance loading into every session exactly as it did before the move.


D) Split each topic into its own .claude/rules/ file with a paths frontmatter scoped to the relevant file types, so each set of conventions only enters context when Claude works on matching files instead of loading all of them every session.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**D번**: Split each topic into its own .claude/rules/ file with a paths frontmatter scoped to the relevant file types, so each set of conventions only enters context when Claude works on matching files instead of loading all of them every session.

**정답 및 해설:**


**핵심 개념**: Claude Code의 경로 기반 규칙(`.claude/rules/` 및 `paths` 프론트매터)을 이용한 컨텍스트 최적화 및 모듈화 관리.

**문제 상황 분석:**
- `CLAUDE.md` 파일이 300줄 이상으로 비대해지면서 모든 세션 시작 시 불필요한 컨텍스트 소비가 증가함.
- GraphQL, 데이터베이스 마이그레이션, CSS 등 각기 다른 영역의 컨벤션이 하나의 파일에 뭉쳐 있어 규칙 준수율(adherence)이 떨어짐.
- 특정 파일이나 경로를 작업할 때만 해당 컨벤션이 선택적으로 로드되도록 구조 개선이 필요함.

**D번이 정답인 이유:**
각 주제별로 개별 `.claude/rules/` 파일을 만들고 `paths` 프론트매터를 사용하여 관련 파일 유형으로 범위를 지정하면, 매 세션마다 모든 규칙을 통째로 로드하는 대신 Claude가 실제로 일치하는 파일을 작업할 때만 해당 컨벤션이 선택적으로 컨텍스트에 주입되므로 컨텍스트 과부하를 방지하고 규칙 준수율을 높일 수 있습니다.

**오답 분석:**

- Option A (오답): 동일한 내용을 중복해서 로드하는 `CLAUDE.local.md`를 추가하면 컨텍스트 사용량이 오히려 더 늘어나 문제 상황을 악화시킵니다.
- Option B (오답): HTML 주석으로 감싸서 수동으로 대화마다 다시 삽입하는 방식은 비효율적이며 자동화된 규칙 관리 목적에 맞지 않습니다.
- Option C (오답): `paths` 필드 없이 단일 `.claude/rules/` 파일로 이동하기만 하면 디스크 파일 크기만 줄어들 뿐 모든 세션에 여전히 모든 지침이 로드되어 문제가 해결되지 않습니다.

---

## 17번 문제

**1. 문제 원문**

A product architect wants Claude Code to build a real-time collaborative document editor, a domain the architect has not built in before. Before any implementation starts, the architect wants to surface cache invalidation strategy, conflict resolution approach, and failure handling considerations that might not be obvious up front. What technique should the architect use?

A) Search for an open-source collaborative editor, instruct Claude to replicate its architecture, and assume that following its design patterns will automatically surface appropriate cache invalidation and conflict resolution strategies.

B) Write a complete technical specification personally covering every design decision, including cache invalidation, conflict resolution, and failure handling, then hand it to Claude as a fixed set of implementation instructions.

C) Ask Claude to implement a minimal collaborative editor, then use every bug and edge case found through manual testing as the primary source to surface cache invalidation, conflict resolution, and failure handling design considerations.

D) Give Claude a brief description of the feature and ask it to interview the architect using the AskUserQuestion tool, exploring technical implementation, edge cases, and tradeoffs before writing a spec.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**D번**: Give Claude a brief description of the feature and ask it to interview the architect using the AskUserQuestion tool, exploring technical implementation, edge cases, and tradeoffs before writing a spec.

**정답 및 해설:**


**핵심 개념**: 복잡하고 생소한 도메인에서 사전 구현 분석을 위한 Claude Code의 `AskUserQuestion` 도구를 활용한 대화형 요구사항 탐색 기법.

**문제 상황 분석:**
- 아키텍트가 경험이 없는 실시간 협업 문서 편집기 개발을 앞두고 있음.
- 캐시 무효화, 충돌 해결, 실패 처리 등 사전에 명확히 드러나지 않는 복잡한 설계 고려 사항을 표면화해야 함.
- 본격적인 코드 구현이나 고정된 명세서 작성 전에 숨겨진 요구사항과 트레이드오프를 도출할 효과적인 접근이 필요함.

**D번이 정답인 이유:**
`AskUserQuestion` 도구를 활용해 Claude가 개발자(아키텍트)를 인터뷰하도록 유도하면, 익숙하지 않은 도메인에서 발생할 수 있는 엣지 케이스와 기술적 트레이드오프를 사전에 철저히 탐색하고 구체적인 스펙을 작성할 수 있으므로 최선의 접근 방식입니다.

**오답 분석:**

- Option A (오답): 오픈소스 아키텍처를 단순히 모방하는 것은 특정 프로젝트의 숨겨진 캐시 무효화나 충돌 해결 전략을 자동으로 보장하지 못합니다.
- Option B (오답): 아키텍트가 직접 모든 설계를 완벽하게 작성하는 것은 사전에 드러나지 않는 고려 사항들을 발견하는 목적에 부합하지 않으며 상호작용의 이점을 살리지 못합니다.
- Option C (오답): 일단 구현부터 하고 버그를 통해 문제를 발견하는 방식은 사전 설계 단계에서 리스크를 예방하려는 요구에 역행합니다.

---

## 18번 문제

**1. 문제 원문**

A development team is migrating their `claude-code-action` workflow from beta to v1.0. They previously relied on `direct_prompt`, `custom_instructions`, `mode`, and `max_turns`. Which of the following best explains why the v1.0 action no longer uses these parameters in the same way?

A) The v1.0 action removed support for custom instructions and turn limits entirely because they are now managed automatically by the Anthropic API.

B) The parameters are still available but have been renamed to `prompt_text`, `instructions`, `execution_mode`, and `max_steps` for improved clarity.

C) The v1.0 action unifies prompt inputs and aligns with the Claude Code CLI by using a single `prompt` parameter and a `claude_args` array for other settings, while auto-detecting the execution mode.

D) The v1.0 action requires all configuration to be placed in a single `config.yml` file located in the repository root, which replaces environment variables.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**C번**: The v1.0 action unifies prompt inputs and aligns with the Claude Code CLI by using a single `prompt` parameter and a `claude_args` array for other settings, while auto-detecting the execution mode.

**정답 및 해설:**


**핵심 개념**: `claude-code-action` 베타 버전에서 v1.0으로의 전환에 따른 파라미터 구조 개편 및 Claude Code CLI와의 인터페이스 통합.

**문제 상황 분석:**
- 개발팀이 기존 베타 버전에서 사용하던 여러 개별 파라미터(`direct_prompt`, `custom_instructions`, `mode`, `max_turns`)들이 v1.0에서는 다르게 다루어짐을 발견함.
- v1.0 액션 업데이트에 따른 설정 인터페이스 변경 사유를 파악해야 함.

**C번이 정답인 이유:**
`claude-code-action` v1.0은 프롬프트 관련 입력을 단일화하고 Claude Code CLI 표준과 정렬하기 위해, 기존의 파분산된 설정들을 단일 `prompt` 파라미터와 기타 설정을 담는 `claude_args` 배열 형태로 통합했으며 실행 모드 또한 자동 감지하도록 설계되었기 때문입니다.

**오답 분석:**

- Option A (오답): 커스텀 지침이나 제한 기능이 완전히 제거되어 API가 자동 관리한다는 설명은 사실과 다릅니다.
- Option B (오답): 해당 파라미터들이 단순히 이름만 바뀌어 유지되는 것이 아니라 구조 자체가 통합 및 변경되었습니다.
- Option D (오답): 모든 설정을 루트의 단일 `config.yml` 파일로 강제한다는 설명은 액션의 파라미터 변경 구조와 일치하지 않습니다.

---

## 19번 문제

**1. 문제 원문**

A maintainer writes a project `CLAUDE.md` that includes the line `See @README for project overview and @package.json for available npm commands.` They also want to mention the file `@docs/legacy-notes.md` in a sentence purely as a pointer for humans, without Claude actually importing and loading its contents into context. How should they write that second reference?

A) Place it inside an HTML comment `<!-- @docs/legacy-notes.md -->`, since HTML comments are rendered as plain visible text but excluded from imports

B) Put a space between the `@` and the path like `@ docs/legacy-notes.md`, since only paths immediately adjacent to `@` with no space are treated as imports

C) Wrap it in backticks as `` `@docs/legacy-notes.md` ``, since import parsing skips content inside code spans and treats it as literal text

D) Prefix it with a double `@@docs/legacy-notes.md`, since a doubled `@` symbol tells the parser to render the path without importing it

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**C번**: Wrap it in backticks as `` `@docs/legacy-notes.md` ``, since import parsing skips content inside code spans and treats it as literal text

**정답 및 해설:**


**핵심 개념**: Anthropic Claude Code `CLAUDE.md` 파일 가져오기(Import Parsing) 규칙
`CLAUDE.md` 파일 내에서 `@filename` 구문은 지정된 파일의 내용을 Claude의 컨텍스트(토큰)로 자동 로드하는 기능입니다. Claude Code의 파서는 마크다운의 코드 영역(Code Spans 및 Fenced Code Blocks) 내부를 스킵하도록 설계되어 있습니다.

**문제 상황 분석:**
- 관리자는 `CLAUDE.md` 파일 내에 파일 경로를 사람(개발자)을 위한 단순 텍스트 지침/참조용으로 명시하고자 함.
- Claude가 파싱 타임에 해당 파일의 내용을 실제 컨텍스트로 불러와 토큰을 소비하고 메모리를 차지하는 것을 방지해야 함.
- 마크다운 파서가 `@` 구문을 파일 가져오기(Import)로 해석하지 않고 리터럴 텍스트로 인식하게 만드는 공식 접근법이 필요함.

**C번이 정답인 이유:**
Anthropic 공식 문서에 따르면 Claude Code의 가져오기 파싱(Import parsing) 기능은 백틱(`` ` ``)으로 감싸진 마크다운 코드 영역(code spans)이나 코드 블록 내의 내용을 무시합니다. 백틱으로 경로를 감싸서 `` `@docs/legacy-notes.md` ``와 같이 작성하면 파서가 이를 임포트 실행 코드가 아닌 일반 리터럴 텍스트로 취급하여 자동 로드를 건너뜁니다.

**오답 분석:**

- Option A (오답): HTML 주석 설명 중 "HTML 주석이 텍스트로 렌더링된다"는 전제부터 잘못되었으며, HTML 주석 처리가 파일 가져오기 파싱을 확실히 차단하는 공식 표준 방식이 아닙니다.
- Option B (오답): `@` 기호와 경로 사이에 공백을 넣는 방식(`@ docs/...`)은 공식 문서에서 권장하거나 지정한 가져오기 차단 방식이 아닙니다.
- Option D (오답): `@` 기호를 두 번 연속 작성하는 것(`@@`)은 임포트를 무효화하는 공식 이스케이프 문법이 아닙니다.

---

## 20번 문제

**1. 문제 원문**

A request asks Claude to rename a single internal helper function and update its handful of call sites within one module, where every call site is already visible in the file the developer has open. Which characteristic of this task most justifies skipping plan mode?

A) The helper function was written recently, so its current behavior is assumed to already be correct without any review

B) Plan mode is technically incapable of ever being used for a rename operation, regardless of the circumstances involved

C) The full scope of the change is already known and confined to one module, leaving no exploration or design decision to make

D) Renaming operations never require any verification of call sites at all, so the risk of this kind of change is always assumed zero

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**C번**: The full scope of the change is already known and confined to one module, leaving no exploration or design decision to make

**정답 및 해설:**


**핵심 개념**: Claude Code의 플랜 모드(Plan Mode) 사용 지침 및 생략 기준
플랜 모드는 복잡한 코드 탐색, 다중 파일에 걸친 변경 아키텍처 설계, 혹은 요구사항이 불명확한 과제를 수행할 때 단계별 계획을 수립하기 위한 모드입니다. 전체 변경 범위가 명확하고 한 파일/단일 모듈 내로 한정되어 있어 별도의 설계나 탐색이 필요 없는 단순 작업은 플랜 모드를 생략하고 바로 실행(Act)하는 것이 권장됩니다.

**문제 상황 분석:**
- 단일 모듈 내 하나의 내부 헬퍼 함수 이름 변경 및 호출 지점 수정 작업임.
- 현재 열려 있는 파일 안에서 모든 호출 지점이 이미 눈에 보이고 확인됨.
- 코드 탐색이나 구조 설계적 의사결정이 전혀 필요치 않은 고도로 국소적인 작업임.

**C번이 정답인 이유:**
변경 범위가 완벽하게 한정되어 있고 이미 모든 정보가 파악된 상태에서는 추가적인 코드베이스 탐색이나 설계 결정(design decision)을 할 필요가 없습니다. 따라서 이러한 명확하고 국소적인 수정 작업이 플랜 모드를 생략하고 즉시 변경을 수행하기에 가장 적절한 명분이 됩니다.

**오답 분석:**

- Option A (오답): 코드가 최근에 작성되었다고 해서 검토 없이 동작이 올바르다고 무조건 가정하는 것은 소프트웨어 공학적/안전성 측면에서 올바른 근거가 아닙니다.
- Option B (오답): 플랜 모드가 기술적으로 이름 변경 작업에 사용 불가능하다는 주장은 사실이 아닙니다. 변경 범위가 넓은 대규모 리팩토링의 경우 이름 변경 작업에도 플랜 모드를 유용하게 활용할 수 있습니다.
- Option D (오답): 이름 변경 시 호출 지점 검증은 필수적이며, 위험도가 항상 0이라고 볼 수 없습니다. 단지 이번 시나리오에서는 모든 호출 지점이 현재 파일에서 눈으로 즉시 확인되기 때문에 플랜 모드의 탐색 단계가 불필요한 것입니다.

---

## 21번 문제

**1. 문제 원문**

A team lead reviewing a completed library migration finds that early file conversions used one pattern, while later files in the same migration used a different, incompatible pattern, forcing a second pass to reconcile them. Which earlier decision most likely caused this outcome?

A) The team used the Explore subagent to catalog usage patterns across the codebase before starting the conversion work itself

B) The migration was executed directly from the start instead of first exploring the codebase in plan mode to settle on one pattern

C) The team approved a design in plan mode and then switched to direct execution to carry out the approved conversion steps

D) The migration was scoped to a single library instead of being combined into one larger project with an unrelated framework upgrade

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**B번**: The migration was executed directly from the start instead of first exploring the codebase in plan mode to settle on one pattern

**정답 및 해설:**


**핵심 개념**: 플랜 모드(Plan Mode)의 필요성 및 사전 설계
대규모 코드베이스나 여러 파일에 걸친 리팩토링/마이그레이션 작업 시, 사전에 플랜 모드(Plan Mode)를 통해 전체 구조와 일관된 변환 패턴을 탐색·정의하지 않고 즉시 실행(Act)에 돌입하면, 작업 진행 과정에서 모델의 컨텍스트 변화나 개별 파일 처리 방식의 차이로 인해 일관성이 깨지는 현상이 발생합니다.

**문제 상황 분석:**
- 하나의 마이그레이션 프로젝트 내에서 초기에 처리된 파일과 나중에 처리된 파일의 변환 패턴이 서로 달라 호환되지 않음.
- 불일치 문제를 해결하기 위해 전체 코드를 다시 맞추는 불필요한 2차 재작업(Second pass)이 발생함.
- 작업 시작 전 통일된 변환 규칙과 패턴을 미리 정하지 않고 진행된 것이 원인임.

**B번이 정답인 이유:**
플랜 모드(Plan Mode)에서 사전 탐색을 진행하지 않고 곧바로 직접 실행에 들어갔기 때문에, 프로젝트 전체에 적용할 표준 패턴을 미리 확정하지 못했습니다. 결과적으로 작업이 진행되는 동안 AI가 일관되지 않은 모범 사례나 무작위 패턴을 적용하게 되어 불일치가 발생하게 됩니다.

**오답 분석:**

- Option A (오답): Explore 서브에이전트로 사용 패턴을 사전에 수집하는 것은 패턴 불일치를 방지하는 바람직한 모범 사례이므로 오답입니다.
- Option C (오답): 플랜 모드에서 설계를 승인받고 실행 모드로 전환하는 것은 권장되는 작업 흐름(Workflow)입니다.
- Option D (오답): 무관한 프레임워크 업그레이드와 합치지 않고 단일 라이브러리로 범위를 좁혀 진행하는 것은 위험 요소를 줄이는 올바른 프로젝트 범위 설정 방식입니다.

---

## 22번 문제

**1. 문제 원문**

A team is choosing between two integration approaches for a new payment provider: one requires a new message queue and asynchronous worker fleet, the other requires synchronous calls from existing services with added retry logic. Each has different infrastructure and operational tradeoffs, and the team has not yet decided which to pursue. What is the most appropriate way to proceed with Claude Code?

A) Use plan mode to have Claude explore both approaches and surface the infrastructure tradeoffs before any implementation starts

B) Have Claude implement the asynchronous queue approach directly and immediately, since new infrastructure work always outranks synchronous changes

C) Have Claude implement both approaches in parallel branches with direct execution and compare the resulting pull requests once both are finished

D) Skip codebase exploration entirely and let Claude choose an approach based solely on which one requires fewer new files to be created

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**A번**: Use plan mode to have Claude explore both approaches and surface the infrastructure tradeoffs before any implementation starts

**정답 및 해설:**


**핵심 개념**: 플랜 모드(Plan Mode)의 아키텍처 탐색 및 비교 분석 기능
플랜 모드는 실제 코드 변경/구현을 시작하기 전에 다양한 기술적 접근 방식의 장단점(Trade-offs) 및 트레이드오프를 분석하고 아키텍처 의사결정을 내릴 수 있도록 코드베이스 탐색과 계획 수립을 지원하는 기능입니다.

**문제 상황 분석:**
- 두 가지 신규 결제 시스템 연동 방식(비동기 큐/워커 방식 vs 기존 서비스 동기 호출/재시도 방식)을 두고 고민 중임.
- 각 방식은 인프라 구성 및 운영 트레이드오프가 상이함.
- 팀에서 아직 추진할 방식을 최종 결정하지 않은 사전 설계 상태임.

**A번이 정답인 이유:**
아직 구체적인 연동 방식이 결정되지 않은 초기 설계 단계에서는 코드 구현을 먼저 진행하는 것이 아니라, 플랜 모드(Plan Mode)를 활용하여 각 접근 방식의 코드베이스 영향도와 인프라 트레이드오프를 탐색 및 비교·분석한 후 최선의 선택을 내리는 것이 가장 적절한 진행 방식입니다.

**오답 분석:**

- Option B (오답): 의사결정이 완료되지 않은 상태에서 특정 방식을 임의로 결정하여 즉시 구현에 들어가는 것은 부적절하며, 새로운 인프라 작업이 항상 우선한다는 조건도 잘못되었습니다.
- Option C (오답): 사전 평가 없이 불필요하게 두 가지 방식을 모두 직접 코드 구현(Direct execution)까지 완료하여 비교하는 것은 불필요한 토큰 소비와 작업 낭비를 초래합니다.
- Option D (오답): 코드베이스 탐색을 생략하고 단순히 파일 생성 개수만을 기준으로 기술 아키텍처를 선택하는 것은 올바른 엔지니어링 의사결정 방식이 아닙니다.

---

## 23번 문제

**1. 문제 원문**

A design-system team scoped a rule to paths: `["src/components/*.tsx"]` to enforce prop-naming conventions. After reorganizing, components now live in nested subfolders like `src/components/forms/Input.tsx` and `src/components/layout/Grid.tsx`. The team notices the rule no longer applies to these files. What is the cause, and how should they fix it?

A) Path-scoped rules stop matching automatically once a project exceeds a certain number of files, so the team needs to split components into multiple smaller rules files regardless of the glob pattern used.

B) The single-level pattern `src/components/*.tsx` only matches files directly inside `src/components/`, not nested subfolders; changing it to `src/components/**/*.tsx` would match files at any depth underneath that directory.

C) The rule only fails because the frontmatter is missing a leading forward slash before `src/components`, and adding one would restore matching for both top-level and nested files.

D) The pattern is unaffected by folder depth, so the rule should still apply; the real cause is that `.tsx` files require a separate paths entry using brace expansion syntax to be recognized at all.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**B번**: The single-level pattern `src/components/*.tsx` only matches files directly inside `src/components/`, not nested subfolders; changing it to `src/components/**/*.tsx` would match files at any depth underneath that directory.

**정답 및 해설:**


**핵심 개념**: Glob 패턴에서의 와일드카드(`*` vs `**`) 경로 매칭
마크다운 프론트매터나 Claude Code 규칙 설정에서 경로 범위를 지정할 때 사용되는 Glob 패턴 규칙입니다. 단일 별표(`*`)는 단일 디렉터리 레벨의 파일만 매칭하는 반면, 이중 별표(`**`)는 하위 디렉터리의 깊이(depth)에 상관없이 재귀적으로 모든 파일 및 디렉터리를 매칭합니다.

**문제 상황 분석:**
- 기존에는 `src/components/*.tsx` 패턴을 사용하여 `src/components/` 직하위에 있는 `.tsx` 파일에 규칙을 적용함.
- 폴더 구조가 재편되면서 컴포넌트들이 `src/components/forms/Input.tsx`와 같이 하위 디렉터리(subfolder) 내부로 이동함.
- 단일 와일드카드(`*`)는 디렉터리 구분자(`/`)를 넘어가지 못하므로 하위 폴더 내 파일에 규칙이 적용되지 않는 현상 발생.

**B번이 정답인 이유:**
`src/components/*.tsx` 패턴은 `src/components/` 바로 밑에 위치한 파일만 매칭합니다. 하위 폴더 내부의 모든 파일까지 재귀적으로 포함시키려면 Glob 문법에 따라 `**`(globstar)를 사용하여 `src/components/**/*.tsx`로 변경해야만 임의의 깊이에 있는 모든 파일이 정상적으로 매칭됩니다.

**오답 분석:**

- Option A (오답): 프로젝트의 파일 개수 초과로 인해 매칭이 자동으로 중단되는 규칙은 존재하지 않으며, 이는 잘못된 설명입니다.
- Option C (오답): 맨 앞에 슬래시(`/`)를 붙이지 않았다고 해서 하위 폴더 매칭이 실패하는 것이 아니며, 핵심 문제는 디렉터리 깊이를 탐색하는 `**` 구문이 빠진 것입니다.
- Option D (오답): Glob 패턴은 폴더 깊이에 직접적인 영향을 받으며, `.tsx` 확장자를 인식하기 위해 중괄호 확장 문법이 필수적으로 요구되지 않습니다.

---

## 24번 문제

**1. 문제 원문**

A contractor clones a repository containing a project skill at `.claude/skills/publish/SKILL.md` with `allowed-tools: Bash(npm publish *)` in its frontmatter. On first opening the project in Claude Code, a workspace trust dialog appears, but the contractor dismisses it without accepting. Invoking the skill still prompts for approval before running `npm publish`. What is the most likely explanation?

A) The `npm publish` command must be listed under `arguments` rather than `allowed-tools` before Claude Code will treat it as pre-approved.

B) The `allowed-tools` field only applies to skills stored in `~/.claude/skills/`, so project-scoped skills always require manual approval regardless of trust.

C) The skill's frontmatter is missing a `context: fork` declaration, and `allowed-tools` only takes effect for skills that run in a forked subagent.

D) The project's workspace trust dialog has not yet been accepted, so the `allowed-tools` grant from the checked-in project skill has not taken effect.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**D번**: The project's workspace trust dialog has not yet been accepted, so the `allowed-tools` grant from the checked-in project skill has not taken effect.

**정답 및 해설:**


**핵심 개념**: Claude Code의 워크스페이스 신뢰(Workspace Trust) 및 프로젝트 스킬 보안 권한
저장소 내 파일(`.claude/skills/`)로 등록된 프로젝트 수준의 스킬은 자동 실행 도구 권한(`allowed-tools`)을 정의할 수 있습니다. 그러나 신뢰할 수 없는 원격 코드의 무단 실행을 방지하기 위해, 개발자가 워크스페이스 신뢰(Workspace Trust) 대화상자를 수락하기 전까지는 프로젝트 스킬에 지정된 사전 승인 권한이 무효화되며 매번 사용자 승인을 요구하게 됩니다.

**문제 상황 분석:**
- 개발자가 프로젝트 스킬(`.claude/skills/publish/SKILL.md`)에 `allowed-tools: Bash(npm publish *)`를 명시함.
- 프로젝트 최초 진입 시 프롬프트된 **Workspace Trust Dialog**를 수락하지 않고 닫음(Dismiss).
- 스킬 실행 시 `npm publish`에 대한 자동 승인이 적용되지 않고 여전히 사용자 승인 창이 노출됨.

**D번이 정답인 이유:**
워크스페이스 신뢰를 수락하지 않으면 프로젝트에 포함된 스킬의 `allowed-tools` 사전 승인 권한 부여가 활성화되지 않습니다. 외부에서 클론한 코드 저장소에 악의적인 자동 실행 스킬이 포함되어 있을 수 있으므로, 사용자가 해당 워크스페이스를 신뢰(Trust)한다는 명시적 승인을 하기 전까지는 보안을 위해 모든 명령어가 수동 승인 모드로 동작하게 됩니다.

**오답 분석:**

- Option A (오답): 명령어 자동 승인은 `allowed-tools` 프론트매터에 정의하는 것이 올바른 규칙이며, `arguments`에 적는 것은 잘못된 문법입니다.
- Option B (오답): `allowed-tools`는 전역 스킬(`~/.claude/skills/`)뿐만 아니라 프로젝트 범위 스킬(`.claude/skills/`)에도 적용 가능합니다. 단, 프로젝트 스킬은 워크스페이스 신뢰가 전제되어야 합니다.
- Option C (오답): `allowed-tools` 기능이 오직 `context: fork` 서브에이전트 스킬에서만 동작한다는 설명은 사실이 아닙니다.

---

## 25번 문제

**1. 문제 원문**

During refinement of a caching layer, a code reviewer finds that a fix for a stale-read bug in the cache invalidation logic will change the locking behavior that a separate, still-open concurrency bug also touches. Both issues live in the same critical section. How should these two issues be communicated to Claude for the next revision?

A) Report the stale-read bug first in isolation, get its full fix merged with tests, then later file the concurrency bug as a separate issue without mentioning the shared critical section.

B) Ask Claude to randomly choose one of the two bugs, apply a complete fix including updated locking and cache invalidation logic, and only address the remaining bug if continuous integration tests later reveal a failure.

C) Report only the concurrency bug now, giving it full priority since it was discovered second, and defer the stale-read bug to a future sprint regardless of their shared critical section.

D) Describe both the stale-read bug and the concurrency bug together in one message, since a fix for the shared critical section will alter the locking constraints another bug relies on.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**D번**: Describe both the stale-read bug and the concurrency bug together in one message, since a fix for the shared critical section will alter the locking constraints another bug relies on.

**정답 및 해설:**


**핵심 개념**: 상호 의존적인 버그 프롬프팅 및 컨텍스트 제공 (Contextual Prompting for Interdependent Bugs)
동일한 임계 영역(Critical Section)이나 복잡한 공유 로직에 영향을 미치는 다수의 버그를 해결할 때, 각 이슈를 분리하여 지시하면 한 버그의 수정이 다른 버그의 부작용(Side effect)이나 결함을 유발할 수 있습니다. 상호 연관된 복잡한 문제는 전말과 제약 조건을 하나의 프롬프트/메시지에 결합하여 제시해야 프롬프트 모델이 전체 맥락을 파악하고 부작용 없는 통합 솔루션을 설계할 수 있습니다.

**문제 상황 분석:**
- 캐싱 레이어의 stale-read 버그 수정이 락킹 동작(locking behavior)을 변경시킴.
- 동일한 임계 영역에 별개의 동시성(concurrency) 버그가 존재함.
- 두 버그가 동일한 임계 영역 및 락킹 제약 조건에 상호 의존하고 있으므로 하나만 수정하면 다른 하나가 파손될 위험이 큼.

**D번이 정답인 이유:**
공유 임계 영역 내부의 락킹 로직을 수정하면 다른 동시성 버그가 의존하는 전제나 제약 조건이 직접적으로 변하게 됩니다. 따라서 Claude에게 개별적으로 전달하지 않고 두 버그 상황과 공유 임계 영역의 상호 의존성을 단일 메시지 내에 종합적으로 기술해야 전체적인 부작용 없이 두 버그를 완벽하게 해소하는 최적의 통합 코드를 작성할 수 있습니다.

**오답 분석:**

- Option A (오답): 공유 임계 영역에 대한 언급 없이 단독으로 버그를 수정한 뒤 나중에 별도로 처리하면, 첫 번째 버그 수습 과정에서 수정된 락킹 로직으로 인해 동시성 버그 처리가 더 복잡해지거나 새로운 회귀(Regression) 버그가 발생할 수 있습니다.
- Option B (오답): 무작위 선택이나 CI 테스트 실패에 의존하는 방식은 결정론적이어야 하는 엔지니어링 및 프롬프트 제공 원칙에 어긋납니다.
- Option C (오답): 두 번째로 발견되었다는 이유만으로 다른 연관 버그를 완전히 무시하거나 유예하는 방식은 임계 영역의 무결성을 깨뜨릴 수 있습니다.

---

## 26번 문제

**1. 문제 원문**

A new engineer joins a team that has used Claude Code for six months. All other teammates report that Claude consistently follows the project's commit message format and test-running conventions, but for the new engineer Claude ignores these conventions entirely, even though they cloned the repository fresh and confirmed that a CLAUDE.md file is present in the repo on GitHub. Upon inspection, however, the file is empty and contains none of the expected conventions. What is the most likely root cause?

A) The repository's CLAUDE.md exceeds the token limit for brand-new sessions, so it is dropped only for engineers with no prior history.

B) Claude Code caches CLAUDE.md content per machine on first run, so the new engineer must trigger a manual cache rebuild locally.

C) The new engineer's local git client is silently skipping markdown files during checkout, so CLAUDE.md never lands on disk at all.

D) The conventions are stored in the existing team members' personal CLAUDE.md files (e.g., `~/.claude/CLAUDE.md`), not in the project's committed CLAUDE.md, so the new engineer never loads them.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**D번**: The conventions are stored in the existing team members' personal CLAUDE.md files (e.g., `~/.claude/CLAUDE.md`), not in the project's committed CLAUDE.md, so the new engineer never loads them.

**정답 및 해설:**


**핵심 개념**: Claude Code의 글로벌/개인 `CLAUDE.md` 및 프로젝트 `CLAUDE.md` 계층 구조
Claude Code는 사용자 홈 디렉터리의 개인 설정 파일(`~/.claude/CLAUDE.md`)과 프로젝트 루트 경로의 커밋 대상 설정 파일(`./CLAUDE.md`)을 구분하여 로드합니다. 프로젝트 저장소에 커밋된 `./CLAUDE.md`가 비어 있다면 프로젝트 자체 설정은 존재하지 않는 것입니다.

**문제 상황 분석:**
- 기존 팀원들 환경에서는 Claude가 커밋 메시지 및 테스트 실행 규칙을 정확히 준수하고 있음.
- 신규 엔지니어가 프로젝트 저장소를 새로 클론하여 실행했을 때 Claude가 설정 규칙을 완전히 무시함.
- GitHub 저장소에 커밋되어 있는 프로젝트 루트의 `CLAUDE.md` 파일은 내용이 비어 있는 빈 파일임.

**D번이 정답인 이유:**
기존 팀원들은 프로젝트 공통 규칙을 프로젝트 저장소의 `CLAUDE.md`에 작성하여 공유한 것이 아니라, 본인들의 사용자 계정 개인 경로(`~/.claude/CLAUDE.md`)에 저장해두고 사용해 왔기 때문입니다. 저장소 내 `CLAUDE.md`는 실제 설정 없이 빈 파일로 존재했으므로, 새로 합류하여 해당 저장소만 클론한 신규 엔지니어의 환경에서는 개인 설정이 로드되지 않아 아무런 규칙도 적용되지 않았던 것입니다.

**오답 분석:**

- Option A (오답): 비어 있는 파일은 토큰 한도를 초과하지 않으며, 이전에 실행한 세션 이력 여부에 따라 `CLAUDE.md` 파일 로드를 차별적으로 드롭하는 로직은 없습니다.
- Option B (오답): `CLAUDE.md`는 세션 시작 시 디스크에서 직접 읽어들이며, 수동으로 로컬 캐시 리빌드를 수행해야 하는 구조가 아닙니다.
- Option C (오답): 질문에서 이미 개발자가 프로젝트를 체크아웃한 후 파일 내부를 직접 검사(Upon inspection)하여 "파일이 비어 있음"을 확인했다고 명시했으므로, 디스크에 파일이 존재하지 않는다는 설명은 타당하지 않습니다.

---

## 27번 문제

**1. 문제 원문**

An architect is migrating a project from one ORM library to another across 60 files, where call sites use inconsistent query patterns and the correct replacement idiom differs by pattern. The architect wants Claude to first survey how the old library is used before writing any replacement code. What is the most effective way to structure this work?

A) Apply the replacement idiom seen in the first converted file to every remaining file directly, without ever checking whether other query patterns exist

B) Enable acceptEdits mode so Claude can begin swapping calls file by file, reconciling newly discovered query patterns as extraction proceeds

C) Use plan mode to survey the inconsistent call site patterns and draft a migration approach, then exit plan mode and execute the approved plan directly

D) Skip the pattern survey and rewrite every file in one direct-execution pass, relying on the test suite to catch mismatched replacements later

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**C번**: Use plan mode to survey the inconsistent call site patterns and draft a migration approach, then exit plan mode and execute the approved plan directly

**정답 및 해설:**


**핵심 개념**: 플랜 모드(Plan Mode)를 활용한 대규모 분석 및 마이그레이션 전략
Claude Code의 플랜 모드(Plan Mode)는 대규모 파일(60개 파일)이나 복잡한 구조 변경 작업에 앞서, 코드베이스를 안전하게 탐색 및 분석(Survey)하고 체계적인 실행 계획을 수립할 때 사용하는 모드입니다. 계획 수립 단계에서는 실제 코드를 수정하지 않으므로 위험 부담 없이 다양한 호출 패턴을 파악한 뒤 구현을 시작할 수 있습니다.

**문제 상황 분석:**
- 60개에 달하는 다수의 파일에서 기존 ORM 라이브러리를 새로운 라이브러리로 변경해야 함.
- 파일마다 사용 중인 쿼리 패턴이 일정하지 않으며, 패턴에 따라 적용해야 할 수정 방식이 각기 다름.
- 아키텍트는 코드 작성(구현) 전 기존 라이브러리의 패턴과 사용 형태를 먼저 전수 조사하길 원함.

**C번이 정답인 이유:**
플랜 모드(Plan Mode)를 사용하면 Claude가 코드 수정을 시작하기 전에 전체 60개 파일의 서로 다른 쿼리 패턴을 사전에 탐색하여 분류할 수 있습니다. 탐색 결과를 바탕으로 구체적인 마이그레이션 계획 및 접근 방식을 수립하고, 사용자가 이 계획을 검토 및 승인한 뒤 플랜 모드를 나와 직접 실행(Act) 단계로 넘어가 안전하고 일관되게 코드를 변경할 수 있습니다.

**오답 분석:**

- Option A (오답): 첫 번째 파일의 패턴이 나머지 파일에도 동일하게 적용될 것이라고 단정하고 사전 확인 없이 일괄 적용하면, 패턴이 다른 나머지 파일들에서 심각한 오류가 발생합니다.
- Option B (오답): 사전 탐색 없이 즉시 파일별 수정에 들어가면서 발견되는 패턴을 그때그때 수정하는 방식은 일관성을 깨뜨리고 재작업을 유발할 수 있습니다.
- Option D (오답): 패턴 조사를 완전히 생략하고 한 번에 직접 실행하여 테스트에만 의존하는 방식은 60개 파일 대규모 마이그레이션 시 수많은 회귀 버그와 수동 수정 낭비를 발생시킵니다.

---

## 28번 문제

**1. 문제 원문**

An architect is scoping a new internal search feature and gives Claude Code the single-line prompt "I want to build a search feature for our support ticket system, interview me in detail using the AskUserQuestion tool." What is the most effective way for the architect to use the resulting interview before implementation starts?

A) Continue answering Claude's questions until ranking, filtering, and failure-mode considerations are all covered. Then have Claude write a complete selfcontained spec naming files and interfaces involved, and start a fresh session focused only on implementing that spec.


B) Skip the interactive interview and instead provide Claude with the existing support ticket schema, letting it infer the required search parameters, ranking rules, and filtering logic from the field names, data types, and existing relationships in that schema alone.


C) Answer all of Claude's interview questions thoroughly in a single session, then instruct Claude to immediately start coding the search feature directly, relying on the conversation transcript as the sole record rather than first creating a written specification or design document.


D) Answer only the first two or three questions Claude asks, then instruct Claude to immediately start implementing the search feature, filling in the missing ranking, filtering, and schema decisions with its own assumptions based on typical support ticket search patterns.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**A번**: Continue answering Claude's questions until ranking, filtering, and failure-mode considerations are all covered. Then have Claude write a complete selfcontained spec naming files and interfaces involved, and start a fresh session focused only on implementing that spec.

**정답 및 해설:**


**핵심 개념**: **대화형 요구사항 도출 및 스펙 기반 개발 (Spec-driven Development with Claude Code)**
LLM 기반 코딩 에이전트(Claude Code)를 사용할 때 가장 효과적인 워크플로우는 인터뷰를 통해 요구사항과 예외 상황을 완벽히 정제한 후, 이를 바탕으로 명확하고 독립적인 명세서(Spec) 문서/파일을 작성하게 하고, 구현 단계에서는 이전 대화의 노이즈가 없는 깨끗한 새 세션(Fresh Session)에서 해당 명세서를 기반으로 개발을 진행하는 것입니다.

**문제 상황 분석:**
- 개발 시작 전 인터뷰 도구(`AskUserQuestion`)를 활용해 세부 요구사항(랭킹, 필터링, 에러 처리 등)을 도출하는 과정입니다.
- 단일 대화 세션에 긴 인터뷰와 구현 작업이 모두 섞이면 컨텍스트 윈도우가 오염되거나 토큰 소모 및 오작동 가능성이 커집니다.
- 완벽한 스펙을 먼저 확정 짓고 독립된 환경에서 코딩에 들어가는 모범 사례(Best Practice)를 찾는 문제입니다.

**A번이 정답인 이유:**
- **완전한 요구사항 도출**: 랭킹, 필터링, 실패 모드까지 구체화할 때까지 인터뷰를 지속하여 불확실성을 없앱니다.
- **명세서(Spec) 객체화**: 대화 내용에만 의존하지 않고 관련 파일, 인터페이스를 다루는 독립적이고 완전한 명세서를 생성합니다.
- **컨텍스트 분리 (Fresh Session)**: 명세서 작성이 끝난 후 새 세션을 열어 명세서 구현에만 집중함으로써, 긴 대화 이력으로 인한 컨텍스트 낭비 및 추론 정확도 저하를 방지합니다.

**오답 분석:**
- Option B (오답): 인터뷰를 건너뛰고 DB 스키마만 제공하면 비즈니스 로직, 우선순위, 사용자 의도 등을 LLM이 임의로 추론해야 하므로 잘못된 설계로 이어집니다.
- Option C (오답): 명세서나 설계 문서 작성 없이 긴 대화 기록(Transcript)에만 의존하여 바로 코딩을 시작하면, 컨텍스트가 복잡해지고 구현 정확도가 떨어집니다.
- Option D (오답): 질문 몇 개만 답하고 나머지를 LLM의 자의적 추정에 맡기면 실제 요구사항과 일치하지 않는 모호한 기능이 구현됩니다.

---

## 29번 문제

**1. 문제 원문**

An architect is planning a task that involves both a broad investigation phase, reading dozens of files to understand a legacy authentication flow, and a narrow implementation phase, adding one new field to a single config file once the investigation clarifies where it belongs. How should this task be structured for the best balance of thoroughness and context efficiency?

A) Skip the investigation phase entirely and add the new config field to whichever file in the codebase looks most plausible at a glance


B) Delegate the broad investigation to an Explore subagent to keep discovery output out of context, then add the field with direct execution


C) Run the dozens-of-files investigation directly in the main conversation without a subagent, then execute the config change directly as well


D) Run the entire task, including the small config field addition, inside plan mode so every step gets reviewed before any file changes happen

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**B번**: Delegate the broad investigation to an Explore subagent to keep discovery output out of context, then add the field with direct execution

**정답 및 해설:**


**핵심 개념**: **서브에이전트를 통한 컨텍스트 창 효율화 (Context Window Efficiency with Subagents)**
Claude Code와 같은 AI 코딩 에이전트 환경에서 수십 개의 파일을 읽는 대규모 탐색/조사 작업은 메인 대화의 컨텍스트 윈도우(Context Window)를 빠르게 소모시키고 노이즈를 누적시킵니다. 따라서 조사 단계는 독립된 **서브에이전트(Subagent)**에게 위임하여 메인 컨텍스트를 깨끗하게 유지하고, 최종 결과(어느 파일에 추가해야 하는지)만 전달받아 핵심 구현(단일 설정 파일 수정)을 실행하는 것이 철저함과 컨텍스트 효율성 간의 최적의 균형을 제공합니다.

**문제 상황 분석:**
- 기존 인증 흐름을 이해하기 위해 수십 개의 파일을 읽어야 하는 넓은 범위의 조사(Broad Investigation) 단계가 필요합니다.
- 조사가 끝난 후 단 하나의 설정 파일에 필드 하나를 추가하는 매우 좁은 범위의 구현(Narrow Implementation) 단계가 이어집니다.
- 메인 컨텍스트 윈도우의 낭비를 막으면서도 조사의 철저함을 유지하는 효율적인 워크플로우 구조화 방식이 요구됩니다.

**B번이 정답인 이유:**
- **컨텍스트 오염 방지**: Explore 서브에이전트를 활용하면 수십 개의 파일 내용과 조사 과정에서 발생하는 불필요한 로그들이 메인 대화 스레드에 누적되지 않고 서브에이전트 내부에서 소모 및 요약됩니다.
- **효율적인 실행**: 조사를 통해 위치가 명확해지면 메인 에이전트가 단일 설정 파일에 필드를 직접 추가(Direct execution)하는 간단한 작업만 수행하므로 매우 효율적입니다.

**오답 분석:**
- Option A (오답): 조사를 건너뛰고 눈대중으로 코드를 작성하는 것은 시스템 오류 및 리팩토링 비용을 초래하는 잘못된 방식입니다.
- Option C (오답): 서브에이전트 없이 메인 대화에서 수십 개 파일을 직접 조회하면 메인 컨텍스트 윈도우가 크게 오염되어 이후 간단한 수정 작업 시에도 토큰 비용 증가 및 추론 능력 저하가 발생합니다.
- Option D (오답): 간단한 파일 수정 1건이 포함된 작업 전체를 플랜 모드로 지속하는 것은 불필요하게 단계를 복잡하게 만들며, 수십 개의 파일을 읽는 조사 과정에서 발생하는 컨텍스트 소모 문제를 해결하지 못합니다.

---

## 30번 문제

**1. 문제 원문**

A nightly job invokes `claude -p "run the migration script" --allowedTools "Bash(npm run migrate*)"` intending to allow only the exact migrate command, but the run unexpectedly also executes an unrelated command `npm run migrate-cleanup` without prompting. What causes this broader match than intended?

A) acceptEdits was implicitly enabled alongside --allowedTools, which broadens matching to include any command containing the word migrate


B) --allowedTools patterns are matched using regular expression alternation by default, so 'migrate*' matches 'migrate' or any suffix starting with a letter


C) The trailing asterisk in `Bash(npm run migrate*)` triggers prefix matching, so the pattern matches any command that starts with 'npm run migrate', including `npm run migrate-cleanup`, not just the exact `npm run migrate` command.


D) The --bare flag was omitted, causing Claude Code to fall back to a permissive default that widens all --allowedTools prefix matches

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**C번**: The trailing asterisk in `Bash(npm run migrate*)` triggers prefix matching, so the pattern matches any command that starts with 'npm run migrate', including `npm run migrate-cleanup`, not just the exact `npm run migrate` command.

**정답 및 해설:**


**핵심 개념**: **Claude Code 도구 승인 패턴 매칭 및 와일드카드 문자 (`--allowedTools`)**
Claude Code의 `--allowedTools` 옵션에서 와일드카드 문자인 별표(`*`)는 와일드카드 패턴 매칭(Globs/Prefix matching)을 의미합니다. 명령어 끝에 `*`를 붙이면 해당 문자열로 시작하는 모든 명령어가 일치하는 것으로 판단되어 자동 승인(Auto-approve) 처리됩니다.

**문제 상황 분석:**
- 개발자는 정확히 `npm run migrate` 명령만 허용하고자 했습니다.
- 하지만 권한 패턴 정의 시 끝에 별표를 붙여 `Bash(npm run migrate*)`로 설정하였습니다.
- 별표(`*`)로 인해 'npm run migrate' 뒤에 어떤 문자열이 붙더라도 조건에 부합하는 접두사 매칭(Prefix match)이 발생하여 `npm run migrate-cleanup`도 프롬프트 없이 자동 실행되었습니다.

**C번이 정답인 이유:**
- `Bash(npm run migrate*)`에 포함된 마지막 별표(`*`)가 접두사 매칭 규칙으로 작동합니다.
- 따라서 'npm run migrate'로 시작하는 모든 문자열(`npm run migrate-cleanup`, `npm run migrate:dev` 등)이 허용 범위에 포함되므로 오동작의 원인이 됩니다. 정확한 단일 명령어만 허용하려면 `Bash(npm run migrate)`처럼 별표 없이 작성해야 합니다.

**오답 분석:**
- Option A (오답): `acceptEdits` 옵션의 암묵적 활성화 문제나 단순 단어 포함 규칙 때문에 범위가 넓어진 것이 아닙니다.
- Option B (오답): `--allowedTools` 패턴은 정규식 교차(Regex alternation) 방식이 아니라 와일드카드/글로브(Glob) 매칭 방식을 기본으로 사용합니다.
- Option D (오답): `--bare` 플래그의 유무가 `--allowedTools` 패턴 매칭 방식을 변경하거나 범위를 넓히는 원인이 아닙니다.

---

## 31번 문제

**1. 문제 원문**

A DevOps engineer wants a locked-down CI runner where Claude Code can only use a small, explicitly-approved set of read-only commands and anything else causes the run to abort rather than prompt, since no human is present to answer a permission prompt. Which configuration best matches this requirement?

A) Set the permission mode to dontAsk, which denies anything not covered by permissions.allow rules or the built-in read-only command set without prompting.


B) Set the permission mode to acceptEdits, so file writes and common filesystem commands get automatic approval, and the CI run continues without pausing.


C) Set --max-turns to 1, limiting Claude to one tool call so no command needing approval is ever reached and the run completes entirely without any prompts.


D) Omit --allowedTools entirely, rely on the default interactive permission prompt to block unapproved commands, and set a short timeout so the run aborts when no one confirms.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**A번**: Set the permission mode to dontAsk, which denies anything not covered by permissions.allow rules or the built-in read-only command set without prompting.

**정답 및 해설:**


**핵심 개념**: **Claude Code 권한 모드 (`dontAsk`)**
CI/CD와 같이 상호작용하는 사용자가 없는 비대면(Non-interactive) 자동화 환경에서는 권한 요청 프롬프트가 발생할 경우 프로세스가 무한 대기 상태에 빠질 수 있습니다. `dontAsk` 모드는 허용 규칙(`permissions.allow`)이나 내장된 읽기 전용 명령어 세트에 포함되지 않은 모든 요청을 프롬프트 확인 없이 즉시 거부(Deny) 및 중단 처리하여 안전한 자동화를 가능하게 합니다.

**문제 상황 분석:**
- CI 러너 환경으로, 권한 요청에 응답할 사람이 없습니다.
- 명시적으로 승인된 최소한의 읽기 전용 명령어만 사용을 허용해야 합니다.
- 승인되지 않은 작업 요청 시 프롬프트를 띄우며 대기하는 대신 즉시 실행이 중단(Abort)되어야 합니다.

**A번이 정답인 이유:**
- `dontAsk` 권한 모드는 승인 목록(`permissions.allow`) 및 내장 읽기 전용 명령 이외의 명령어가 호출되면 대화형 프롬프트를 생략하고 즉시 차단/거부합니다. 비대면 자동화 환경 구축 조건에 정확히 부합하는 설정입니다.

**오답 분석:**
- Option B (오답): `acceptEdits` 모드는 파일 수정 및 파일시스템 관련 명령어를 자동 승인하는 모드로, 최소한의 읽기 전용 명령어만 허용해야 한다는 보안 요구사항에 위배됩니다.
- Option C (오답): `--max-turns` 옵션은 에이전트의 대화 턴 수를 제한할 뿐, 승인되지 않은 비허가 도구의 호출 자체를 안전하게 차단해주지 못합니다.
- Option D (오답): 대화형 프롬프트에 의존하여 타임아웃으로 실패를 유도하는 방식은 불필요한 대기 시간을 발생시키고 무한 블로킹 위험이 있어 CI 파이프라인 구성의 올바른 접근법이 아닙니다.

---

## 32번 문제

**1. 문제 원문**

A platform team wants a `/release-notes` slash command that every engineer on the repository gets automatically after `git pull`, so nobody has to reinstall it manually. Where should the team save the command file?

A) Save it to `.claude/commands/release-notes.md` inside the project and commit that file to the shared repository so it distributes through version control.


B) Save it to `.claude/commands/release-notes.md` in the project root, but add that file to `.gitignore` so each engineer's local changes stay conflict-free.


C) Save it to `~/.claude/skills/release-notes/SKILL.md` so that Claude loads the command automatically in every project the team lead opens on their machine.


D) Save it to `~/.claude/commands/release-notes.md` on the team lead's machine and have each engineer copy the file to their own local `~/.claude/commands/` directory.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**A번**: Save it to `.claude/commands/release-notes.md` inside the project and commit that file to the shared repository so it distributes through version control.

**정답 및 해설:**


**핵심 개념**: **Claude Code 프로젝트 범위 슬래시 명령어 (Project-scoped Slash Commands)**
Claude Code의 커스텀 슬래시 명령어는 저장소(Repository) 내 `.claude/commands/` 디렉터리에 마크다운(`.md`) 파일로 작성합니다. 해당 디렉터리에 위치한 파일은 프로젝트 단위(Project scope)로 작동하므로, 저장소에 파일(예: `.claude/commands/release-notes.md`)을 생성하고 Git 버전 관리 시스템에 포함(Commit & Push)시키면 팀원 전체가 `git pull`만으로 수동 설치 없이 동기화되어 활용할 수 있습니다.

**문제 상황 분석:**
- 플랫폼 팀은 `/release-notes`라는 자동화 명령어를 팀 내 전체 엔지니어에게 공유하고자 합니다.
- 팀원들이 수동으로 설치하거나 복사하는 과정 없이, `git pull`을 받으면 자동으로 명령어가 커밋되어 적용되기를 원합니다.
- 개인 로컬(User level) 설정이 아닌 **프로젝트 레벨(Project level)**로 명령어를 관리 및 공유하는 올바른 디렉터리 위치와 Git 커밋 방법을 찾는 문제입니다.

**A번이 정답인 이유:**
- 커스텀 명령어 파일인 `.claude/commands/release-notes.md`를 프로젝트 디렉터리 내에 작성하고, 이를 Git 버전 관리에 커밋하여 원격 리포지토리에 반영하는 것이 요구사항을 정확히 충족합니다.
- 팀원들이 `git pull`을 수행하면 변경된 `.claude/commands/release-notes.md` 파일이 로컬에 받아지며 별도의 추가 설정 없이 슬래시 명령어 `/release-notes`를 사용할 수 있게 됩니다.

**오답 분석:**
- Option B (오답): `.gitignore`에 파일이나 디렉터리를 추가하면 해당 파일이 원격 리포지토리에 동기화되지 않으므로, 다른 엔지니어들이 `git pull`을 통해 명령어를 받을 수 없습니다.
- Option C (오답): 물결표(`~`)로 시작하는 사용자 홈 디렉터리(`~/.claude/...`) 설정은 개별 머신 전역(Global/User level) 스코프입니다. 따라서 해당 팀 리드 본인의 모든 프로젝트에만 적용될 뿐, 리포지토리를 공유하는 다른 팀원들에게 자동으로 전달되지 않습니다.
- Option D (오답): 팀 리드의 전역 디렉터리에 두고 개별 엔지니어가 파일들을 일일이 복사하게 만드는 방식은 "수동 재설치나 복사 없이 `git pull`로 자동 적용되게 한다"는 문제 요구사항에 정면으로 위배됩니다.

---

## 33번 문제

**1. 문제 원문**

A data engineer is iterating with Claude Code on a migration script that transforms legacy customer records into a new schema. After the first pass, records with a null middle-name field are being dropped instead of migrated with an empty string. What is the most effective way to fix this specific edge case handling?

A) Provide a specific test case showing a record with a null middle-name field as input and the expected output record with an empty string in that field


B) Tell Claude the migration script has a bug involving null values without specifying which field or what the corrected output should look like


C) Instruct Claude to rewrite the entire migration script from scratch using a different scripting language in the hope that the new implementation avoids the issue


D) Ask Claude to add a generic try/except block around the entire transformation function so that any record causing an error is skipped silently

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**A번**: Provide a specific test case showing a record with a null middle-name field as input and the expected output record with an empty string in that field

**정답 및 해설:**


**핵심 개념**: **구체적인 테스트 케이스를 통한 AI 프롬프팅 (Few-Shot Prompting / Concrete Example Guidance)**
Claude Code와 같은 AI 코딩 에이전트에서 특정 에지 케이스(Edge Case) 버그를 수정할 때 가장 효과적인 방법은 구체적인 **입력 값(Input)**과 이에 해당하는 **기대 출력 값(Expected Output)** 형태의 테스트 케이스 예시를 명확하게 제공하는 것입니다. 이를 통해 LLM이 모호함 없이 정확한 변환 로직을 이해하고 수정을 수행할 수 있습니다.

**문제 상황 분석:**
- 레거시 데이터 마이그레이션 중 중간 이름(`middle-name`)이 `null`인 경우 빈 문자열(`""`)로 변경되어야 하나 레코드가 누락되는 에지 케이스가 발생했습니다.
- 에이전트가 변환 조건문이나 예외 처리 로직을 정확히 수정하도록 가이드하기 위한 명확한 프롬프팅 방법이 필요합니다.
- 문제를 정확히 전달하고 의도한 대로 수정을 유도하는 최적의 개선 방법을 찾는 문제입니다.

**A번이 정답인 이유:**
- `null` 입력 데이터와 수정되어야 할 빈 문자열(`""`) 출력 데이터를 예시(Specific Test Case)로 직접 제시하면, 모델이 버그의 패턴과 명확한 요구사항을 즉시 파악하여 로직을 정확하게 수정할 수 있습니다.

**오답 분석:**
- Option B (오답): 어떤 필드인지, 결과물이 어떻게 나와야 하는지 전달하지 않으면 모호성이 커져 LLM이 잘못된 방향으로 코드를 수정할 가능성이 높습니다.
- Option C (오답): 단순한 에지 케이스 하나 때문에 전체 스크립트를 다른 언어로 다시 작성하는 것은 불필요하게 비효율적이며 문제 해결을 보장하지도 못합니다.
- Option D (오답): generic `try/except` 블록을 씌워 오류를 무시(skip)하도록 만드는 것은 문제 원인인 데이터 누락 현상을 고치는 것이 아니라 오히려 문제를 더 숨기고 데이터 손실을 방지하지 못하는 잘못된 접근 방식입니다.

---

## 34번 문제

**1. 문제 원문**

Two engineers on the same team report that Claude behaves inconsistently: one gets careful adherence to a 'always run the linter before committing' rule, while the other says Claude never mentions the linter at all, even in the same repository on the same branch. Before assuming the rule text is unclear, what is the fastest way to confirm whether the inconsistency is actually a memory-loading problem?

A) Ask both engineers to restart their machines, since CLAUDE.md changes only take effect after a full operating system reboot occurs


B) Have each engineer delete their local git history and re-clone the repository, since stale git objects usually cause instruction drift between machines


C) Compare the two engineers' Claude Code version numbers, since instruction-following is versioned per release and needs a version match


D) Have each engineer run `/memory` and compare which CLAUDE.md, CLAUDE.local.md, and rules files are loaded to see if the linter rule is missing

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**D번**: Have each engineer run `/memory` and compare which CLAUDE.md, CLAUDE.local.md, and rules files are loaded to see if the linter rule is missing

**정답 및 해설:**


**핵심 개념**: **`/memory` 슬래시 명령어를 통한 메모리/지침 로딩 디버깅 (Debugging Loaded Context with `/memory`)**
Claude Code에서 `/memory` 슬래시 명령어는 현재 세션의 컨텍스트(메모리)에 어떤 설정 파일(`CLAUDE.md`, `CLAUDE.local.md`, `.claude/rules/` 등)이 제대로 읽혀 들어왔는지(Loaded) 실시간으로 디버깅하고 확인할 수 있는 내장 도구입니다.

**문제 상황 분석:**
- 동일한 저장소 및 브랜치 작업 환경임에도 불구하고 한 엔지니어의 Claude는 린터 규칙을 준수하고, 다른 엔지니어의 Claude는 규칙을 전혀 인식하지 못하는 불일치 현상이 발생했습니다.
- 규칙 문구 자체의 문제인지 판단하기에 앞서, 해당 규칙이 정의된 파일이 실제로 양쪽 엔지니어의 세션 메모리에 로드되었는지를 점검해야 합니다.
- 메모리 로딩 여부를 즉각 구별해낼 수 있는 가장 빠른 확인 방법을 찾는 문제입니다.

**D번이 정답인 이유:**
- 각 엔지니어가 Claude Code 세션에서 `/memory` 명령어를 실행하면, 현재 세션에 활성화된 `CLAUDE.md`, 개인 로컬 설정 파일(`CLAUDE.local.md`), 커스텀 규칙 파일 목록이 화면에 표시됩니다.
- 한쪽 개발자의 환경에서 `.gitignore` 설정, 파일 위치 차이, 혹은 `CLAUDE.local.md` 오버라이딩 등으로 인해 규칙 파일이 누락(Missing)되었는지 즉시 비교 및 검증할 수 있으므로 가장 빠른 진단 방법입니다.

**오답 분석:**
- Option A (오답): `CLAUDE.md` 등 설정 파일의 변경 사항은 운영체제(OS) 재부팅과 아무런 관련이 없으며, 새로운 세션을 시작하거나 명령을 입력할 때 적용됩니다.
- Option B (오답): Git 이력을 삭제하고 재클론하는 것은 단순 지침 로딩 확인을 위해 불필요하게 번거롭고 시간이 오래 걸리는 작업입니다.
- Option C (오답): 지침 수행 불일치의 원인이 버전 차이일 가능성보다, 로컬 환경의 메모리 설정 파일(`CLAUDE.local.md` 등) 또는 파일 디렉터리 구조로 인한 로딩 누락일 확률이 훨씬 높으므로 메모리 상태 조회가 우선입니다.

---

## 35번 문제

**1. 문제 원문**

A team's `explore-alternatives` skill asks Claude to brainstorm several competing architecture approaches before settling on a recommendation. The team wants that exploratory back-and-forth kept separate from the main conversation, with only the final recommendation surfacing back to the user. Which configuration accomplishes this?

A) Set `user-invocable: false` on the skill so Claude silently runs the brainstorming in the background without a command name.


B) Set `context: fork` on the skill so the brainstorming happens in a subagent, and only the returned result reaches the main conversation.


C) Set `paths: **/*` on the skill so brainstorming activates automatically no matter which file is being edited.


D) Set `disable-model-invocation: true` on the skill so brainstorming only happens when a teammate manually types the command.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**B번**: Set `context: fork` on the skill so the brainstorming happens in a subagent, and only the returned result reaches the main conversation.

**정답 및 해설:**


**핵심 개념**: **스킬 컨텍스트 포크 (`context: fork`)와 서브에이전트 실행**
Claude Code의 커스텀 스킬(Skill) 정의 시 Frontmatter에 `context: fork` 설정을 지정하면, 해당 스킬 실행 시 메인 컨텍스트를 복제(Fork)하여 별도의 **서브에이전트(Subagent)**에서 조사를 수행합니다. 서브에이전트 내부에서 이루어지는 중간 탐색 및 주고받는 대화(Intermediate Back-and-forth)는 메인 스레드의 컨텍스트 창을 더럽히지 않으며, 탐색이 완료된 최종 결과만 메인 대화 스레드로 전달됩니다.

**문제 상황 분석:**
- `explore-alternatives` 스킬을 통해 여러 아키텍처 대안을 비교 분석하는 브레인스토밍을 수행하려 합니다.
- 중간 조사 과정의 복잡한 대화 내용이 메인 세션 컨텍스트에 누적되는 것을 방지하고자 합니다.
- 메인 대화와 격리된 환경에서 작업을 수행하고 최종 결과값만 받아오도록 스킬을 설정하는 속성을 찾는 문제입니다.

**B번이 정답인 이유:**
- `context: fork` 옵션은 서브에이전트를 생성하여 독립된 대화 맥락에서 브레인스토밍 프로세스를 실행합니다.
- 복잡한 대화 과정은 서브에이전트 내에서 처리되고 최종 요약/추천 결과만 메인 스레드로 반환되므로 메인 컨텍스트의 효율성과 깔끔한 대화 흐름을 보장합니다.

**오답 분석:**
- Option A (오답): `user-invocable: false`는 사용자가 슬래시 명령어 등을 통해 직접 이 스킬을 호출하지 못하게 차단(에이전트 내부 전용으로 설정)하는 옵션이며, 컨텍스트를 분리하거나 서브에이전트를 생성해 주지 않습니다.
- Option C (오답): `paths: **/*` 속성은 특정 파일 패턴 변경 시 스킬 실행 조건이나 범위를 지정하는 매칭 패턴으로, 백그라운드 탐색 분리와 상관이 없습니다.
- Option D (오답): `disable-model-invocation: true`는 모델이 스스로 판단하여 자동 호출하는 것을 금지하고 오직 사람이 직접 호출할 때만 발동하게 만드는 옵션으로, 대화 분리 및 서브에이전트 동작과는 무관합니다.

---

## 36번 문제

**1. 문제 원문**

A reviewer bot re-runs after every new commit on a PR, and previously-posted inline comments about a missing null check keep reappearing as duplicate comments each time, even though the author never addressed them. What change to the re-run invocation would most directly stop the duplicate postings?

A) Include the prior review findings in the new run's context and instruct Claude to only report findings not already present in those prior findings, thereby avoiding duplicate comments.


B) Increase --max-turns on the re-run to a higher value so the bot can review its previous comments on the PR, recognize the null check was already reported, and avoid posting it again.


C) Add --no-session-persistence to the re-run invocation, causing each run to start with no memory of prior findings and thus preventing duplicate comments about issues like the missing null check.


D) Switch the re-run's --output-format from json to stream-json so the bot streams findings, checks each against existing PR comments, and only posts those not already present, avoiding duplicate comments.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**A번**: Include the prior review findings in the new run's context and instruct Claude to only report findings not already present in those prior findings, thereby avoiding duplicate comments.

**정답 및 해설:**


**핵심 개념**: **컨텍스트 맥락 주입을 통한 중복 출력 방지 (Contextual Deduplication / Prompting with Prior Findings)**
LLM 기반 자동화 봇(코드 리뷰어 등)은 독립적인 실행 시 이전 실행 결과를 알 수 없습니다. 동일한 코드베이스를 다시 리뷰할 경우, 이전에 보고했던 이슈라도 컨텍스트에 포함되어 있지 않으면 새로 발견된 이슈로 판단하여 동일한 인라인 댓글을 반복해서 생성합니다. 따라서 이전 리뷰 결과를 새 실행의 컨텍스트(프롬프트)에 주입하고 중복 이슈를 필터링하도록 지시해야 합니다.

**문제 상황 분석:**
- 새로운 커밋이 생성될 때마다 코드 리뷰어 봇이 새로 작동합니다.
- 작성자가 코드 수정을 하지 않았으므로 동일한 결함(null 체크 누락)이 계속 감지됩니다.
- 이전 리뷰 이력이 새 봇 실행 세션에 전달되지 않아 봇은 해당 이슈가 이미 댓글로 작성되었는지 알지 못하고 매번 중복 게시를 발생시킵니다.

**A번이 정답인 이유:**
- 새로운 리뷰 작업 실행 시 이전 실행의 발견 결과(Prior review findings)를 프롬프트/컨텍스트에 포함시켜 전달하고, "이전 결과에 이미 존재하는 지적 사항은 제외하고 새로운 지적 사항만 보고하라"는 지시를 주면 중복 게시를 완벽하게 방지할 수 있습니다.

**오답 분석:**
- Option B (오답): `--max-turns`를 올리는 것은 단순 대화 턴 수(도구 호출 횟수)를 늘리는 것일 뿐, PR 상의 이전 작성 댓글을 자동으로 읽어들이거나 인식하게 만들지 않습니다.
- Option C (오답): `--no-session-persistence`를 추가하면 오히려 이전 세션의 기억을 완전히 지워버리므로, 이전 결과를 기억하지 못해 중복 댓글 생성을 막기는커녕 계속 중복을 유발하게 됩니다.
- Option D (오답): 출력 포맷을 `json`에서 `stream-json`으로 변경하는 것은 데이터 출력 방식(스트리밍 여부)을 바꾸는 것일 뿐, 봇이 PR 댓글을 자동으로 조회하여 대조하는 비즈니스 로직을 자동으로 추가해주지 않습니다.

---

## 37번 문제

**1. 문제 원문**

An architect asks Claude Code to write a function that converts free-form date strings like `next Tuesday`, `03/04/25`, and `the 1st of March` into ISO 8601 dates. The architect has specified that ambiguous numeric inputs in `MM/DD/YY` format should be interpreted month-first, so `03/04/25` must mean March 4, 2025. Early attempts still inconsistently interpret ambiguous formats such as `03/04/25`. What is the most effective next step to fix this transformation ambiguity?

A) Provide 2-3 example input strings, including `03/04/25`, each paired with the exact ISO 8601 output the architect expects (e.g., `03/04/25` -> `2025-03-04`), so the ambiguous format resolves to a concrete rule.

B) Ask Claude to throw an exception whenever an ambiguous format like `03/04/25` is encountered, preventing any ambiguous conversion and requiring the user to provide an explicit format specification.

C) Rewrite the prompt using more forceful language demanding that Claude "get the dates right this time" without adding any new information, but emphasize that ambiguous formats must be resolved consistently.

D) Add a comment in the code explaining that date parsing is a hard problem and ask Claude to use its best judgment, for example by defaulting to month-first when formats like `03/04/25` are ambiguous.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**A번**: Provide 2-3 example input strings, including `03/04/25`, each paired with the exact ISO 8601 output the architect expects (e.g., `03/04/25` -> `2025-03-04`), so the ambiguous format resolves to a concrete rule.

**정답 및 해설:**


**핵심 개념**: 퓨샷 프롬프팅 (Few-Shot Prompting / Few-Shot Examples)
LLM 및 AI 코딩 에이전트(Claude Code)에게 모호하거나 복잡한 변환 규칙을 지시할 때, 구체적인 입출력 예시(Input-Output pairs)를 함께 제공하는 것이 단순 자연어 설명보다 명확하고 일관된 결과를 유도하는 가장 효과적인 프롬프트 엔지니어링 기법입니다.

**문제 상황 분석:**
- 아키텍트가 `MM/DD/YY` 형태의 모호한 날짜 입력은 '월 우선(month-first)'으로 해석하라는 규칙을 제시했으나, Claude가 이를 일관성 있게 처리하지 못하고 있습니다.
- 단순 텍스트 지시만으로는 모호성을 완전히 해결하지 못하는 모호성(Ambiguity) 문제가 발생하고 있습니다.
- 따라서 LLM이 규칙을 패턴으로 정확히 인식할 수 있도록 명확하고 구체적인 예시를 제시하는 개선책이 필요합니다.

**A번이 정답인 이유:**
명확한 퓨샷 예시(`03/04/25` -> `2025-03-04`)를 명시적 입출력 쌍으로 제공하면, 모델은 단순 지시문을 넘어 기대하는 변환 로직과 출력 형태를 정확히 파악하게 됩니다. 이는 모호한 날짜 파싱 문제를 해결할 때 가장 직접적이고 효과적인 방법입니다.

**오답 분석:**

- Option A (정답): 입출력 예시를 명확히 제시하여 모호성을 해결합니다.
- Option B (오답): 예외(Exception)를 발생시키고 사용자 입력 형식을 강제하는 것은 자유 형식 문자열을 자동 변환하려는 원본 기능 요구사항에 위배됩니다.
- Option C (오답): 새로운 정보나 예시 없이 단지 "이번엔 제대로 해라"와 같이 강한 어조(forceful language)만 추가하는 방식은 프롬프트 엔지니어링에서 효과가 없는 잘못된 접근법입니다.
- Option D (오답): 코드 주석에 "최선의 판단을 내려라(best judgment)"라는 애매한 지시를 남기는 것은 일관성 문제를 해결하지 못하며 오히려 모델의 자율성에 의존하여 불확실성을 높입니다.

---

## 38번 문제

**1. 문제 원문**

A payments engineer asks Claude Code to implement a discount calculation function and wants to minimize back-and-forth correction cycles from the outset. Order totals must round to the nearest cent using banker's rounding, and stacking discounts must apply in a specific order that is easy to get wrong. What should the engineer do before Claude writes any implementation code?

A) Describe the rounding and stacking rules in a single long paragraph of prose and trust that a sufficiently detailed paragraph will be interpreted correctly the first time

B) Write a test suite first that encodes the banker's rounding behavior and the discount stacking order with concrete cases, then have Claude implement against it and iterate on any failures

C) Ask Claude to implement the function using whatever rounding and stacking order seems most common in e-commerce systems, then correct it if the checkout totals look wrong later

D) Have Claude implement the function without tests, then manually spot-check three or four representative orders by hand in a spreadsheet

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**B번**: Write a test suite first that encodes the banker's rounding behavior and the discount stacking order with concrete cases, then have Claude implement against it and iterate on any failures

**정답 및 해설:**


**핵심 개념**: 테스트 주도 개발 (TDD) 및 명확한 검증 기준 제공 (Test-Driven AI Development)
AI 코딩 에이전트(Claude Code)에게 복잡하거나 잘못 처리하기 쉬운 도메인 로직(예: 오사오입, 중복 할인 순서)을 지시할 때는 줄글 형태의 명세서보다 실행 가능한 테스트 코드(Test Suite)를 먼저 제공하는 것이 가장 효과적입니다. 이를 통해 AI가 스스로 코드를 실행하고 테스트 통과 여부를 검증하며 오류를 반복 수정할 수 있습니다.

**문제 상황 분석:**
- 엔지니어는 오사오입(Banker's rounding) 및 복잡한 할인 순서 로직 구현 시 불필요한 재작업(back-and-forth)을 최소화하고자 합니다.
- 사람의 자연어 설명만으로는 예외 케이스나 반올림 경계 조건에서 오해가 생기기 쉽습니다.
- Claude가 작성한 구현을 자동으로 평가하고 스스로 피드백 루프를 돌 수 있는 객관적인 검증 수단이 사전에 필요합니다.

**B번이 정답인 이유:**
구체적인 케이스가 포함된 테스트 수트를 미리 작성해 주면, Claude Code는 구현 과정에서 생성한 코드가 비즈니스 로직을 정확히 만족하는지 즉시 실행해 보고 실패한 테스트를 스스로 수정(iterate)할 수 있습니다. 이는 피드백 주기를 단축시키고 수정 횟수를 최소화하는 가장 확실한 방법입니다.

**오답 분석:**

- Option A (오답): 자연어 줄글로 아무리 길고 상세하게 설명하더라도, 경계 조건이나 세부 로직 해석에 오류가 발생할 수 있어 주고받는 수정 주기를 줄이지 못합니다.
- Option B (정답): 실행 가능한 테스트 코드 기반으로 자율적인 피드백 루프를 형성합니다.
- Option C (오답): 일반적인 방식을 임의로 추측하게 한 뒤 나중에 수정하는 것은 불필요한 수정 주기를 극대화하는 방식입니다.
- Option D (오답): 테스트 없이 구현한 뒤 스프레드시트로 수동 점검하는 방식은 비효율적이며 AI가 스스로 디버깅하고 개선할 수 있는 피드백 루프를 제공하지 못합니다.

---

## 39번 문제

**1. 문제 원문**

In a monorepo, an engineer working exclusively on `packages/web` finds that Claude Code's context is cluttered at startup with CLAUDE.md content from `packages/admin-dashboard` and several `packages/legacy-*` packages. This happens because the monorepo's root CLAUDE.md file uses import statements to load all subpackage CLAUDE.md files. The engineer wants these excluded from their own sessions without affecting other teammates who might work in those packages. What should they do?

A) Delete the CLAUDE.md files from packages/admin-dashboard and packages/legacy-* directly, since unused files should be removed from the repository

B) Add `claudeMdExcludes` patterns for those packages to the committed `.claude/settings.json` at the repository root, since exclusions can only be configured at the project scope

C) Ask the admin-dashboard and legacy package owners to move their CLAUDE.md files into `.claude/rules/`, since only root-level CLAUDE.md files are loaded across package boundaries

D) Add `claudeMdExcludes` patterns for those packages to `.claude/settings.local.json`, since local settings apply only to that engineer's machine

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**D번**: Add `claudeMdExcludes` patterns for those packages to `.claude/settings.local.json`, since local settings apply only to that engineer's machine

**정답 및 해설:**


**핵심 개념**: 로컬 환경 설정 및 `claudeMdExcludes` (Local Settings & Scope Management)
Claude Code 환경 설정은 공용 프로젝트 설정(`.claude/settings.json`)과 개발자 개별 환경 설정(`.claude/settings.local.json`)으로 나뉩니다. 특정 패키지의 `CLAUDE.md` 파일이 자동 로드되는 것을 제외하려면 `claudeMdExcludes` 설정을 사용하며, 팀원 전체에 영향을 주지 않고 본인의 기기(세션)에만 적용하려면 Git 커밋 대상에서 제외되는 `.claude/settings.local.json`에 해당 설정을 추가해야 합니다.

**문제 상황 분석:**
- 루트 `CLAUDE.md`에서 모든 하위 패키지의 `CLAUDE.md`를 불러와 컨텍스트가 불필요한 정보로 오염되고 있습니다.
- 엔지니어는 자신이 담당하지 않는 패키지(`admin-dashboard`, `legacy-*`)의 컨텍스트 로드를 차단하려 합니다.
- 조건: 다른 팀원들의 공유 환경이나 세션에는 영향을 주지 않고 **자신의 개발 세션에만** 제외 규칙을 적용해야 합니다.

**D번이 정답인 이유:**
`.claude/settings.local.json`은 개인 로컬 환경 전용 설정 파일입니다. 여기에 `claudeMdExcludes` 패턴(예: `["packages/admin-dashboard/**", "packages/legacy-*/**"]`)을 명시하면, 해당 엔지니어의 로컬 실행 환경에서만 지정된 경로의 `CLAUDE.md` 로드가 차단되며 타 팀원의 설정에는 아무런 영향을 주지 않습니다.

**오답 분석:**

- Option A (오답): 타 팀원이 해당 패키지를 작업할 때 필요한 `CLAUDE.md` 파일 자체를 공유 저장소에서 삭제하는 것은 적절하지 못합니다.
- Option B (오답): 커밋 대상인 루트 `.claude/settings.json`에 제외 패턴을 추가하면 프로젝트를 공유하는 다른 모든 팀원들의 세션에서도 해당 패키지의 컨텍스트 로드가 차단됩니다.
- Option C (오답): 파일을 다른 디렉터리로 이동시키는 것은 팀 차원의 구조 변경을 수반하며, 로컬 환경만 격리하려는 목적에 부합하지 않습니다.
- Option D (정답): 개인 환경 전용 설정 파일인 `.claude/settings.local.json`에 제외 패턴을 기재합니다.

---

## 40번 문제

**1. 문제 원문**

A codebase currently has separate CLAUDE.md files inside src/api/tests/, src/web/tests/, and packages/shared/tests/, each repeating nearly identical testing conventions. These per-directory CLAUDE.md files only load when Claude happens to read a file inside that specific subdirectory. The team wants one definition of testing conventions that reliably applies to every test file, no matter which directory it is added to in the future. What is the best solution?

A) Keep the three subdirectory CLAUDE.md files as the definitive source for testing rules because subdirectory CLAUDE.md files automatically apply to any test file created within those directories and will cascade to new test subdirectories over time.

B) Rename the three subdirectory CLAUDE.md files to CLAUDE.local.md so they are excluded from version control while still loading automatically whenever Claude navigates into those specific testing directories, providing consistent test conventions locally.

C) Consolidate the three files into a single top-level CLAUDE.md so the shared testing conventions load into every session and are applied proactively whenever a test-related context is detected, regardless of directory structure.

D) Replace the three subdirectory CLAUDE.md files with one .claude/rules/testing.md file using a paths glob that matches the project's test file naming (e.g., "**/*.test.*" or "**/*.spec.*"), so the convention applies by file type across the repo rather than depending on directory structure.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**D번**: Replace the three subdirectory CLAUDE.md files with one `.claude/rules/testing.md` file using a paths glob that matches the project's test file naming (e.g., `"**/*.test.*"` or `"**/*.spec.*"`), so the convention applies by file type across the repo rather than depending on directory structure.

**정답 및 해설:**


**핵심 개념**: `.claude/rules/` 및 경로 패턴 매칭 (`paths` glob)
Claude Code에서는 특정 파일 패턴에 따라 모듈화된 규칙을 적용할 수 있는 모듈형 규칙 시스템(`.claude/rules/`)을 지원합니다. 규칙 파일 헤더에 `paths` 글로브 패턴(예: `paths: ["**/*.test.*"]`)을 정의하면 디렉터리 위치와 상관없이 해당 확장자나 패턴에 일치하는 모든 파일이 작업 대상이 될 때 자동으로 지정된 컨벤션 규칙이 적용됩니다.

**문제 상황 분석:**
- 여러 디렉터리에 동일한 내용의 `CLAUDE.md` 파일이 파편화되어 중복 작성되어 있습니다.
- 서브디렉터리의 `CLAUDE.md`는 해당 디렉터리 내의 파일을 읽을 때만 조건부로 로드되므로, 새로운 디렉터리에 테스트 파일이 추가되면 규칙이 누락될 위험이 있습니다.
- 특정 디렉터리 구조에 종속되지 않고, 저장소 전체의 모든 테스트 파일(`*.test.*`, `*.spec.*`)에 일관되게 적용되는 단일 규칙 정의가 필요합니다.

**D번이 정답인 이유:**
`.claude/rules/testing.md` 경로에 단일 규칙 파일을 생성하고 글로브 패턴(`paths: ["**/*.test.*"]`)을 설정하면 디렉터리 구조와 무관하게 모든 테스트 파일에 컨벤션이 정확히 적용됩니다. 중복을 제거함과 동시에 향후 새로운 디렉터리에 추가되는 테스트 파일에도 자동으로 규칙이 반영되는 가장 모범적이고 유지보수성이 높은 솔루션입니다.

**오답 분석:**

- Option A (오답): 중복된 서브디렉터리 파일들을 그대로 유지하는 것은 파편화 문제를 해결하지 못하며, 새로운 디렉터리가 생성될 때마다 매번 `CLAUDE.md`를 복사/생성해야 하는 번거로움이 유지됩니다.
- Option B (오답): `CLAUDE.local.md`는 버전 관리에 포함되지 않는 개인 로컬용 파일입니다. 팀 전체에 일관된 테스트 규칙을 강제/공유하려는 목적에 어긋납니다.
- Option C (오답): 모든 테스트 규칙을 최상위 `CLAUDE.md`에 넣으면 테스트 작업을 하지 않는 세션에도 불필요한 테스트 컨벤션 토큰이 상시 로드되어 컨텍스트 윈도우(Context Window)를 낭비하게 됩니다. 세부 규칙은 `.claude/rules/`로 분리하는 것이 바람직합니다.
- Option D (정답): `.claude/rules/` 및 글로브 패턴을 활용하여 파일 유형별로 유연하게 로드시킵니다.

---

## 41번 문제

**1. 문제 원문**

A team configures a single long-running Claude Code session that both implements a feature and then reviews its own diff before opening the PR. QA notices this workflow catches noticeably fewer bugs than an independent reviewer would. What is the underlying reason a self-review in the same session tends to be weaker?

A) The session runs out of available context window tokens by the time review begins, forcing Claude to skip reading large portions of the diff

B) Claude Code caches tool call results per session, causing the review step to reuse stale file contents from before the edits were made

C) The session retains the reasoning and assumptions used while writing the code, so it tends to re-apply the same blind spots when checking its own output instead of evaluating it fresh

D) The --print flag disables the Read tool after the first turn, so the reviewing pass cannot re-open files it already edited

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**C번**: The session retains the reasoning and assumptions used while writing the code, so it tends to re-apply the same blind spots when checking its own output instead of evaluating it fresh

**정답 및 해설:**


**핵심 개념**: 편향 유지 및 독립적 검토 세션 (Context Bias & Independent Review Sessions)
LLM 및 AI 에이전트는 동일한 세션(대화 맥락) 안에서 코드 작성과 코드 리뷰를 연속해서 수행할 경우, 이전 대화 맥락에 포함된 **자신의 추론 과정, 편향(Bias), 잘못된 전제 조건(Blind spots)**을 그대로 유지하게 됩니다. 이를 극복하고 객관적이고 엄격한 검토를 수행하려면 별도의 독립된 세션(Fresh Session)이나 독립된 프롬프트 컨텍스트에서 리뷰를 진행해야 합니다.

**문제 상황 분석:**
- 단일 Claude Code 세션에서 코드 구현과 PR 전 셀프 리뷰(Self-review)를 모두 진행하고 있습니다.
- 독립적인 리뷰어에 비해 셀프 리뷰 세션의 버그 감지율이 눈에 띄게 떨어집니다.
- 동일 세션 맥락(Context)을 공유함으로 인해 발생하는 LLM의 인지적 사각지대(Blind Spot) 유지가 원인입니다.

**C번이 정답인 이유:**
이전 턴에서 코드를 작성할 때 사용했던 논리 구조와 전제 조건들이 컨텍스트 윈도우에 남아있기 때문에, 스스로의 코드를 검토할 때 동일한 논리적 오류나 사각지대를 재인지하지 못하고 "자신이 작성한 코드가 올바르다"는 편향된 방향으로 검토를 수행하게 됩니다. 따라서 신선한 관점(Fresh perspective)에서 검토하지 못하므로 검토 능력이 떨어지게 됩니다.

**오답 분석:**

- Option A (오답): 세션 컨텍스트가 길어지면 자동 요약(Summarization)이나 자르기(Truncation)가 발생할 수 있지만, "리뷰 시작 시 diff의 대다수를 건너뛴다"는 것은 셀프 리뷰가 취약해지는 근본적인 이유가 아닙니다.
- Option B (오답): Claude Code는 파일이 수정되면 도구 호출 결과를 재조회하거나 업데이트된 컨텍스트를 사용하므로, 수정 전의 오래된(stale) 파일 내용만 고정으로 재사용한다는 설명은 사실이 아닙니다.
- Option C (정답): 작성 당시의 추론과 사각지대가 세션 맥락에 그대로 남아있어 편향이 발생합니다.
- Option D (오답): `--print` 플래그는 출력을 터미널에 인쇄하고 세션을 종료하는 비상호작용 모드 플래그일 뿐, 첫 턴 이후 Read 도구를 강제로 비활성화하는 동작을 하지 않습니다.

---

## 42번 문제

**1. 문제 원문**

During a multi-phase refactor, Claude needs to grep across hundreds of files to catalog every usage of a deprecated helper function before deciding what to do next. The architect is worried this discovery output will consume most of the main conversation's context window. What should the architect do to prevent this?

A) Delegate the cataloging work to an Explore subagent, which runs the searches in its own context and returns a condensed summary to the conversation

B) Have Claude paste the full grep output directly into the conversation and then manually delete the least relevant lines from the transcript afterward

C) Switch the main session into plan mode, which is specifically designed to automatically summarize all grep output before it reaches the conversation

D) Raise the configured context window limit for the session so the raw search results no longer need to be trimmed at all before use

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**A번**: Delegate the cataloging work to an Explore subagent, which runs the searches in its own context and returns a condensed summary to the conversation

**정답 및 해설:**


**핵심 개념**: 서브에이전트(Subagent) 활용을 통한 컨텍스트 윈도우 효율화 (Context Isolation)
Claude Code 환경에서는 대용량 파일 탐색, 코드베이스 분석 등 방대한 정보 조회가 필요할 때 서브에이전트(예: Explore subagent)를 생성하여 독립된 컨텍스트 내에서 작업을 수행하게 할 수 있습니다. 이를 통해 원본 검색 데이터는 하위 에이전트 내부에서만 처리되고 메인 대화 세션에는 최종적으로 정리된 요약 결과만 전달되므로 메인 세션의 컨텍스트 윈도우 낭비를 막을 수 있습니다.

**문제 상황 분석:**
- 리팩터링 대상인 헬퍼 함수의 사용 위치를 찾기 위해 수백 개 파일에 걸친 `grep` 조회가 필요한 상황입니다.
- Raw 데이터 형태로 수많은 검색 결과가 메인 대화에 직접 들어가면 컨텍스트 윈도우 토큰이 대량으로 소모되어 대화의 질이 떨어집니다.
- 메인 세션의 컨텍스트를 깨끗하게 유지하면서 핵심 분석 요약 정보만 받아볼 수 있는 구조적 해결책이 필요합니다.

**A번이 정답인 이유:**
Explore 서브에이전트에게 탐색 업무를 위임(Delegate)하면, 서브에이전트는 독립된 별도의 컨텍스트 윈도우에서 `grep` 명령 및 분석을 수행합니다. 메인 세션에는 정제되고 축약된 요약 결과(Condensed summary)만 반환되므로 메인 세션의 토큰 소모를 최소화할 수 있습니다.

**오답 분석:**

- Option A (정답): 별도의 하위 서브에이전트 컨텍스트에서 조회를 실행하여 요약본만 넘겨받습니다.
- Option B (오답): 대화 트랜스크립트에서 수동으로 줄을 삭제하는 것은 매우 비효율적일 뿐만 아니라 이미 사용된 컨텍스트 토큰 소모를 근본적으로 방지하지 못합니다.
- Option C (오답): 플랜 모드(Plan mode)는 코드를 직접 변경하기 전에 단계별 계획을 수립하는 기능일 뿐, `grep` 명령의 출력을 자동으로 intercept 하여 요약해 주는 기능을 수행하지 않습니다.
- Option D (오답): 컨텍스트 윈도우 제한을 무작정 올리는 것은 비효율적인 토큰 비용 발생을 야기하며, 검색 결과 수천 줄이 여전히 컨텍스트에 포함되어 노이즈(Noise)를 유발한다는 문제를 해결하지 못합니다.

---

## 45번 문제

**1. 문제 원문**

A security team wants a nightly Claude Code job to behave identically no matter which self-hosted runner picks it up, without being affected by a stray MCP server defined in one runner's shared `.mcp.json` or a hook left in a teammate's `~/.claude` directory. Which combination of choices best achieves this reproducibility goal?

A) Invoke claude with `--output-format stream-json`, and pipe the event stream through a filter that discards any hook or MCP-related events from `.mcp.json` or `~/.claude`, so only the intended assistant content appears in the final output.

B) Invoke claude with `--bare` in print mode and pass only the explicit flags needed (such as `--append-system-prompt` or `--settings`) so nothing is auto-discovered from the working directory or home folder.

C) Invoke claude in ordinary `-p` mode, and set `--max-turns` to a low number such as 2, which limits any hook or MCP server from `.mcp.json` or `~/.claude` to at most two interactions, preventing them from altering the final output.

D) Invoke claude with `--continue` and provide a pre-recorded session file that was created in a clean environment, so the job picks up that exact conversation state instead of auto-discovering any hooks or MCP servers from the runner.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**


**B번**: Invoke claude with `--bare` in print mode and pass only the explicit flags needed (such as `--append-system-prompt` or `--settings`) so nothing is auto-discovered from the working directory or home folder.

**정답 및 해설:**


**핵심 개념**: `--bare` 플래그를 통한 격리 및 자동 탐지 비활성화 (Environment Isolation)
Claude Code CLI 실행 시 `--bare` 플래그를 지정하면 로컬 작업 디렉터리나 홈 디렉터리(`~/.claude`, `.mcp.json` 등)에서 자동으로 환경 설정, 훅(Hooks), MCP 서버, 프로젝트 전용 규칙 등을 탐지하고 로드하는 동작을 완전히 차단합니다. 이를 통해 외부 환경 요소를 격리하여 일관되고 재현 가능한(Reproducible) 실행 상태를 보장할 수 있습니다.

**문제 상황 분석:**
- 여러 자체 호스팅 러너(Self-hosted runners) 환경에서 CI/CD 배치 작업을 수행할 때 환경에 따른 불일치가 발생할 수 있습니다.
- 러너 기기의 공유 `.mcp.json`이나 개발자 홈 디렉터리(`~/.claude`)에 남아있는 임의의 훅 및 MCP 서버가 실행 과정에 개입하여 출력을 오염시킬 위험이 있습니다.
- 실행 환경의 외부 요소 자동 탐지를 원천적으로 차단하고, 필요한 명시적 플래그만 지정하여 작업을 독립적으로 수행할 수 있는 방법이 필요합니다.

**B번이 정답인 이유:**
`--bare` 플래그는 작업 디렉터리 및 홈 폴더에 존재하는 설정 파일, 훅, MCP 서버 등의 자동 탐지(Auto-discovery) 기능을 비활성화합니다. 여기에 필요한 명시적 옵션(`--settings`, `--append-system-prompt` 등)만 플래그로 넘겨주면 어떠한 러너 기기에서 실행되더라도 환경 노이즈 없이 100% 동일한 결과와 동작을 보장합니다.

**오답 분석:**

- Option A (오답): 출력을 후처리(Post-filtering)하는 방식은 이미 실행 중에 훅이나 MCP 서버가 도구 실행 및 동작을 변경했거나 부작용(Side effect)을 일으킨 이후이므로 근본적인 동작 오염을 막지 못합니다.
- Option B (정답): `--bare` 플래그를 사용해 로컬 설정 파일 및 훅의 자동 탐지를 차단합니다.
- Option C (오답): `--max-turns`로 대화 회수를 제한하더라도 턴 내에서 여전히 로드된 훅이나 MCP 서버가 동작하므로 불필요한 개입이나 오류를 완전히 방지할 수 없습니다.
- Option D (오답): `--continue` 옵션은 기존 대화 기록을 이어서 진행할 뿐, 현재 실행되는 러너 환경의 훅이나 MCP 서버 자동 로드를 차단해 주지 않습니다.

---

## 47번 문제

**1. 문제 원문**

A team wants Claude to evaluate three candidate caching strategies for a high-traffic API, each requiring different changes to the request-handling layer, before any strategy is implemented. Once a strategy is picked, the actual code changes are expected to be small and localized to two files. How should the architect sequence this work?

* **A)** Implement all three caching strategies with direct execution first and delete two of them once the comparison is complete
* **B)** Skip the comparison entirely and implement whichever strategy is mentioned first, adjusting the choice later if it underperforms
* **C)** Use plan mode to compare the three caching strategies and settle on one, then leave plan mode and apply the small change with direct execution
* **D)** Use direct execution for the strategy comparison itself, then switch into plan mode only for the small two-file implementation that follows afterward

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Use plan mode to compare the three caching strategies and settle on one, then leave plan mode and apply the small change with direct execution

**정답 및 해설:**

**핵심 개념**: Claude Code 플랜 모드 vs 직접 실행 모드 (Plan Mode vs Direct Execution)
Claude Code의 Plan Mode는 코드를 직접 수정하거나 실행하지 않고 구조 분석, 전략 비교, 영향도 평가, 리팩토링 계획 등을 안전하게 세울 때 사용하는 모드입니다. 반면 Direct Execution은 확정된 계획에 맞춰 실제로 파일 읽기/쓰기 및 명령을 수행하는 모드입니다.

**문제 상황 분석:**
- 고트래픽 API를 위한 3가지 캐싱 전략의 장단점 및 요구사항을 구현 전에 미리 평가·비교해야 합니다.
- 전략이 최종 결정된 이후의 실제 코드 수정 작업은 2개 파일에 국한된 소규모 작업입니다.
- 분석/선택 단계와 실제 코드 작성 단계에 맞춰 적절한 작업 순서를 구성해야 합니다.

**C번이 정답인 이유:**
구현 전 복잡한 아키텍처 비교 분석은 코드 변경 없이 안전하게 탐색할 수 있는 Plan Mode를 사용하는 것이 가장 적합합니다. 비교를 통해 최적의 전략 1개를 확정한 후에는, 플랜 모드를 종료하고 2개 파일에 대한 소규모 변경을 Direct Execution으로 빠르게 수행하는 것이 Claude Code의 최적 워크플로우입니다.

**오답 분석:**

- Option A (오답): 비교만 진행하면 되는 단계에서 3가지 전략을 모두 실제로 코드로 구현하는 것은 불필요한 자원 낭비와 불필요한 수정 작업을 발생시킵니다.
- Option B (오답): 비교 평가 과정을 생략하고 임의로 하나를 먼저 구현하는 것은 사전 분석 요구사항을 무시하는 방식입니다.
- Option D (오답): 전략 비교에 직접 실행을 사용하고 단순한 소규모 코드 수정에 플랜 모드를 사용하는 것은 두 모드의 역할이 서로 거꾸로 뒤바뀐 접근입니다.

<br>

---

## 48번 문제

**1. 문제 원문**

An architect wants Claude Code to build a function that validates and reformats postal addresses, but plain-English descriptions of the expected reformatting keep producing inconsistent results across a handful of edge cases (missing unit numbers, PO boxes, and rural route addresses). Which action best resolves this without adding unnecessary process overhead?

* **A)** Increase the temperature or creativity setting used by Claude Code so that it explores a wider variety of reformatting outputs for edge cases such as missing unit numbers, PO boxes, and rural routes.
* **B)** Ask Claude to implement three separate reformatting functions, one for each edge case (missing unit numbers, PO boxes, and rural routes), and let the caller decide which function to invoke.
* **C)** Schedule a full team design review meeting to formally document postal address reformatting standards, including edge cases such as missing unit numbers and PO boxes, before continuing with Claude Code.
* **D)** Supply a small set of concrete input/output examples, one per edge case (missing unit number, PO box, rural route) so each ambiguous case has an unambiguous target output.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Supply a small set of concrete input/output examples, one per edge case (missing unit number, PO box, rural route) so each ambiguous case has an unambiguous target output.

**정답 및 해설:**

**핵심 개념**: 퓨샷 프롬프팅 (Few-Shot Prompting / Example-based Guidance)
LLM(대형 언어 모델)에게 복잡하거나 엣지 케이스가 존재하는 로직을 지시할 때, 단순 텍스트 설명(Plain-English Description)만으로는 모호함이 생겨 결과가 일관되지 않을 수 있습니다. 이때 각 엣지 케이스별 명확한 입력과 출력 예시(Input/Output Examples)를 제시하면 불필요한 프로세스 추가 없이 정확도와 일관성을 극대화할 수 있습니다.

**문제 상황 분석:**
- 우편 주소 재형식화 기능 개발 중 예외 사례(동·호수 누락, PO Box 등)에서 결과가 일관되지 않게 생성됨.
- 개발 프로세스상의 불필요한 오버헤드(시간·회의·구조적 복잡성 등)를 최소화하면서 문제를 해결해야 함.
- 모호한 텍스트 설명을 명확한 기준으로 보완해 주는 간단한 프롬프팅/지시 개선이 필요함.

**D번이 정답인 이유:**
각 엣지 케이스별로 구체적인 입력과 기대 출력 예시(Input/Output)를 단 몇 개만 제공해도 모델은 모호성을 완전히 해소하고 의도한 형식대로 코드를 정확히 구현합니다. 팀 전체 미팅이나 복잡한 구조 변경 없이 가장 빠르고 오버헤드가 적은 해결책입니다.

**오답 분석:**

- Option A (오답): Temperature(온도)나 창의성 설정을 높이면 출력의 무작위성(Randomness)이 증가하여 일관성이 더욱 떨어지고 모호함이 심해집니다.
- Option B (오답): 동일 목적의 함수를 엣지 케이스별로 3개로 분리하는 것은 호출 측(Caller) 코드에 불필요한 조건 분기와 복잡성을 전가하는 잘못된 설계입니다.
- Option C (오답): 문제에서 요구한 "불필요한 프로세스 오버헤드 추가 방지(without adding unnecessary process overhead)" 조건에 위배됩니다. 소규모 코드 조정에 전체 팀 리뷰 회의를 잡는 것은 과도한 오버헤드입니다.

<br>

---

## 50번 문제

**1. 문제 원문**

An architect asks Claude Code to "normalize phone numbers to a standard format" across a customer database. After two rounds of correction, Claude is still inconsistently formatting extensions and international codes. What should the architect do to communicate the transformation more effectively?

* **A)** Ask Claude to research five phone-number libraries, extract the formatted output each produces for sample international numbers, and adopt the most frequent convention as the standard.
* **B)** Repeat the original instruction but prepend each rule with all-caps modifiers like IMPORTANT and MUST so that Claude gives the normalization task greater weight.
* **C)** Split the normalization rules into separate sections for domestic numbers, international codes, and extensions, each described with exhaustive prose detail rather than examples.
* **D)** Provide 2-3 concrete input/output pairs covering domestic, international, and extension cases so Claude can infer the exact rule from examples alone, not prose.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Provide 2-3 concrete input/output pairs covering domestic, international, and extension cases so Claude can infer the exact rule from examples alone, not prose.

**정답 및 해설:**

**핵심 개념**: 예시 기반 프롬프팅 (Few-Shot / Example-Driven Prompting)
LLM(대형 언어 모델)은 모호하거나 길게 서술된 텍스트 설명(Prose)보다 명확한 **입력-출력 예시(Input/Output Examples)**를 통해 규칙과 변환 패턴을 훨씬 더 정확하고 일관되게 이해합니다. 

**문제 상황 분석:**
- 전화번호 데이터베이스 정규화 작업 중 내선 번호 및 국가 코드 형식이 일관되지 않는 문제 발생.
- 2차례에 걸쳐 텍스트 지시사항으로 수정을 시도했으나 지속적으로 모호성이 해소되지 않음.
- 텍스트 설명의 한계를 극복하고 모델에게 변환 기준을 가장 명확하고 효과적으로 전달하는 방법이 필요함.

**D번이 정답인 이유:**
긴 줄글 설명이나 단순 강조(IMPORTANT, MUST)보다 각 예외 케이스(국내, 국가 코드, 내선 번호 등)별로 구체적인 입력값과 기대되는 출력값 쌍(2~3개)을 제시하는 것이 모호함을 없애는 가장 확실한 방법입니다. Claude는 이러한 구체적 입출력 예시로부터 명확한 규칙을 추론하여 일관된 변환 결과를 출력할 수 있습니다.

**오답 분석:**

- Option A (오답): 라이브러리를 조사하고 빈도수를 계산하는 것은 불필요한 컴퓨팅과 단계를 낭비하며, 사용자가 원하는 고유한 표준 포맷을 보장해 주지 못합니다.
- Option B (오답): 대문자 강조(IMPORTANT, MUST 등)는 지시사항의 모호함을 해소해 주지 못하므로 형식 불일치 문제를 해결할 수 없습니다.
- Option C (오답): 예시 없이 줄글(prose) 설명만 길게 늘려 작성하면 모델이 해석할 수 있는 모호성이나 예외 상황이 여전히 발생하여 인공지능의 불일치를 해결하지 못합니다.

<br>

---

## 51번 문제

**1. 문제 원문**

A team's release-notes generator asks Claude to extract structured data and passes the `--json-schema` flag with a schema string that contains a typo (an unescaped brace). What should they expect to happen?

* **A)** claude exits with an error stating the value is not a valid JSON Schema, along with the validator's diagnostic, instead of producing any output
* **B)** claude silently falls back to unstructured plain-text output with no indication that the schema was invalid
* **C)** claude ignores the malformed schema and instead of failing, returns an empty structured_output object with no fields
* **D)** claude retries the request against the API up to three times using --max-retries before giving up and printing the raw text response

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: claude exits with an error stating the value is not a valid JSON Schema, along with the validator's diagnostic, instead of producing any output

**정답 및 해설:**

**핵심 개념**: CLI 인자 검증 및 구조화된 출력 (CLI Flag Validation & Structured Output)
Claude Code CLI에서 `--json-schema` 플래그를 사용할 때, 전달된 스키마 문자열은 API 호출이나 출력 생성 전 로컬에서 먼저 구문 분석(Parsing) 및 유효성 검증(Validation)을 거칩니다. 문법 오류(Syntax Error)가 존재하는 스키마가 제공되면 즉시 프로세스를 에러와 함께 종료시킵니다.

**문제 상황 분석:**
- 릴리즈 노트 생성기가 `--json-schema` 플래그를 통해 스키마 문자열을 전달함.
- 전달된 스키마 내에 이스케이프되지 않은 중괄호 등 오타(Typo)가 포함되어 파싱 불가능한 잘못된 형식(Malformed)임.
- 잘못된 CLI 플래그 인자가 입력되었을 때 Claude CLI의 동작 방식을 파악해야 함.

**A번이 정답인 이유:**
`--json-schema`에 전달된 값이 올바른 JSON Schema 형식이 아닌 경우, Claude CLI는 유효성 검증기(Validator) 수준에서 오류를 감지하고 상세한 진단 메시지(Diagnostic)를 출력하며 즉시 에러 코드와 함께 종료(Exit)됩니다. 조용히 텍스트로 전환되거나 무시하고 진행되지 않습니다.

**오답 분석:**

- Option B (오답): 구문 오류가 발생한 상황에서 경고나 오류 표시 없이 소리 없이(Silently) 평문 텍스트로 폴백하지 않습니다.
- Option C (오답): 잘못된 형식을 무시하고 빈 객체를 반환하지 않고, 사전에 검증 실패 에러를 발생시킵니다.
- Option D (오답): 문법 오류가 있는 스키마 파싱 실패는 네트워크/API 재시도 대상이 아니므로 `--max-retries` 동작이 적용되지 않습니다.

<br>

---

## 52번 문제

**1. 문제 원문**

Before implementing a multi-region deployment strategy for a service Claude Code has not worked on before, an architect wants to surface failure-mode considerations such as what happens during a regional outage, how state is reconciled after a network partition heals, and which region is authoritative during a split. What is the recommended way to elicit this input before implementation?

* **A)** Have Claude begin writing the deployment configuration immediately, and rely on production incidents to surface failure modes such as regional outages and partition recovery, adjusting the configuration iteratively as issues arise.
* **B)** Ask Claude to summarize a generic multi-region deployment tutorial, and then adopt its default failure-handling mechanisms, such as failover and consistency, without tailoring them to this service's specific regional constraints.
* **C)** Write out every failure scenario, including regional outages and partition recovery, in exhaustive detail personally beforehand, so that no interview or clarifying questions from Claude are necessary to surface failure-mode considerations.
* **D)** Give Claude a brief description of the deployment goal and have it interview the architect in detail using the AskUserQuestion tool, focusing on failure modes and tradeoffs rather than obvious questions.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Give Claude a brief description of the deployment goal and have it interview the architect in detail using the AskUserQuestion tool, focusing on failure modes and tradeoffs rather than obvious questions.

**정답 및 해설:**

**핵심 개념**: `AskUserQuestion` 도구 및 상호작용형 설계 (Interactive Clarification / Requirements Elicitation)
Claude Code가 처음 접하거나 복잡한 시스템(예: 다중 리전 배포)을 설계할 때, 사용자가 모든 예외 상황을 완벽히 수동으로 작성하는 대신, Claude가 `AskUserQuestion` 도구를 활용하여 인터뷰 형태로 필요한 질문을 상호작용하며 역으로 던지도록 유도하는 것이 권장되는 베스트 프랙티스입니다. 이를 통해 뻔하지 않은 실패 모드, 네트워크 파티션, 데이터 일관성 트레이드오프 등을 효과적으로 도출할 수 있습니다.

**문제 상황 분석:**
- Claude Code가 기존에 경험해보지 못한 서비스의 다중 리전 배포 전략을 수립해야함.
- 리전 장애, 네트워크 파티션 복구, 권한 리전 결정 등 복잡한 장애 모드(Failure modes) 고려사항을 구현 전에 미리 명확히 정의해야함.
- 아키텍트의 의도와 비즈니스 트레이드오프를 가장 효율적이고 구체적으로 수집/도출하는 가이드라인이 필요함.

**D번이 정답인 이유:**
아키텍트가 대략적인 목표를 제시하고, Claude Code가 `AskUserQuestion` 도구를 사용해 구체적인 장애 시나리오와 트레이드오프에 대해 아키텍트에게 역으로 질의(Interview)하도록 설정하는 것이 가장 효과적입니다. 이를 통해 놓치기 쉬운 에지 케이스를 사전에 함께 도출할 수 있습니다.

**오답 분석:**

- Option A (오답): 사전 검토 없이 구현을 진행하고 실제 운영 장애(Production Incident)에 의존하여 문제를 수정하는 것은 대단히 위험하고 부적절한 방식입니다.
- Option B (오답): 서비스의 특수성과 제약 조건을 고려하지 않고 일반적인 튜토리얼 수준의 기본 메커니즘을 그대로 적용하면 실제 시스템에 부합하지 않는 결함이 발생합니다.
- Option C (오답): 사람이 사전에 모든 시나리오와 세부사항을 혼자 문서화하는 것은 불필요하게 많은 공수가 들며, Claude의 분석적 탐색 능력 및 `AskUserQuestion`을 활용한 상호작용식 도출의 이점을 누리지 못합니다.

<br>

---

## 53번 문제

**1. 문제 원문**

A project ships a shared `.claude/skills/commit/SKILL.md` skill that writes commit messages in a style one developer finds too terse for their own habits. The developer wants a personal richer version of that skill while continuing to invoke the same `/commit` slash command themselves. Teammates should continue to see the original project skill when they run `/commit`. What should they do?

* **A)** Edit `.claude/skills/commit/SKILL.md` with the richer commit guidelines, and rely on the change remaining uncommitted so only the developer's local experience uses it, while teammates' copies are unaffected.
* **B)** Create `~/.claude/skills/commit/SKILL.md` as a personal copy with the same name to locally override the project skill for this developer only, leaving the shared project skill unchanged for teammates.
* **C)** Add `disable-model-invocation: true` to the shared `.claude/skills/commit/SKILL.md` so that it no longer generates output and only the developer's personal instructions apply.
* **D)** Create a differently named skill, such as `~/.claude/skills/commit-verbose/SKILL.md`, so it's invoked separately and the shared project skill remains untouched for teammates.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**B번**: Create `~/.claude/skills/commit/SKILL.md` as a personal copy with the same name to locally override the project skill for this developer only, leaving the shared project skill unchanged for teammates.

**정답 및 해설:**

**핵심 개념**: Claude Code 스킬 우선순위 (Skill Precedence & Overriding)  
Claude Code의 스킬 우선순위 계층 구조는 `Enterprise > Personal (~/.claude/skills/) > Project (.claude/skills/) > Plugin` 순을 따릅니다. 동일한 이름을 가진 스킬이 여러 범위에 존재할 경우, 상위 레벨인 Personal(사용자/개인) 레벨의 스킬이 Project(프로젝트) 레벨의 스킬을 오버라이드(Override)합니다.

**문제 상황 분석:**
- 프로젝트 공유 저장소에 팀 공용 스킬인 `.claude/skills/commit/SKILL.md`가 설정되어 있음.
- 특정 개발자가 기존 `/commit` 명령어 이름을 그대로 유지하면서 자신만의 풍부한 커밋 스타일을 사용하고자 함.
- 다른 팀원들에게는 프로젝트 공유 스킬이 그대로 유지되어 영향을 주지 않아야 함.

**B번이 정답인 이유:**  
개인 설정 디렉터리(`~/.claude/skills/commit/SKILL.md`)에 동일한 이름으로 커스텀 스킬을 작성하면, Claude Code의 우선순위 규칙에 따라 해당 개발자의 로컬 환경에서는 개인 스킬이 프로젝트 스킬을 오버라이드하여 실행됩니다. 한편, 프로젝트 저장소 파일은 변경되지 않으므로 팀원들은 기존 프로젝트 스킬을 계속 사용하게 됩니다.

**오답 분석:**

- Option A (오답): 프로젝트 내 파일(.claude/skills/commit/SKILL.md)을 지저분하게 uncommitted 상태로 남겨두는 것은 추후 실수로 커밋되거나 `git clean` / branch switching 시 날아갈 위험이 있어 올바른 구성 방식이 아닙니다.
- Option C (오답): 공유 파일에 `disable-model-invocation: true`를 추가하면 변경 사항을 저장소에 올리지 않더라도 비정식 접근이며, 커밋 시 다른 팀원 전체에게 영향을 주게 됩니다.
- Option D (오답): 개발자가 기존에 쓰던 `/commit` 슬래시 커맨드를 그대로 유지하고 싶어 한다는 요구사항에 위배됩니다. 다른 커맨드 이름(`/commit-verbose`)을 새로 만들어야 하기 때문입니다.

<br>

---

## 54번 문제

**1. 문제 원문**

A repository already has an AGENTS.md file used by several other AI coding tools, containing conventions the team wants Claude Code to follow as well, plus a short list of Claude-specific instructions like 'use plan mode for changes under src/billing/'. The team wants to avoid maintaining the same conventions in two places. What is the recommended way to structure CLAUDE.md?

* **A)** Manually copy the full contents of AGENTS.md into CLAUDE.md today, and remember to re-copy it by hand every time AGENTS.md changes
* **B)** Create CLAUDE.md starting with `@AGENTS.md` as an import, followed by the Claude-specific instructions such as the plan-mode rule underneath
* **C)** Leave CLAUDE.md absent entirely, since Claude Code silently falls back to reading AGENTS.md whenever no CLAUDE.md file is present
* **D)** Create a symbolic link (symlink) named CLAUDE.md pointing to AGENTS.md so both files always share the same content

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Create CLAUDE.md starting with `@AGENTS.md` as an import, followed by the Claude-specific instructions such as the plan-mode rule underneath

**정답 및 해설:**

**핵심 개념**: CLAUDE.md에서의 파일 가져오기 구문 (`@import` Syntax)
Claude Code 지침 파일(`CLAUDE.md`)에서는 `@path/to/file.md` 형태의 구문을 사용하여 다른 마크다운 지침 파일의 내용을 동적으로 포함(Import)시킬 수 있습니다. 이를 통해 공통 프로젝트 컨벤션을 단일 파일(예: `AGENTS.md`)에서 중앙 관리하고, Claude 전용 규칙만 `CLAUDE.md`에 추가하여 중복 관리를 방지할 수 있습니다.

**문제 상황 분석:**
- 저장소에 이미 타 AI 도구들과 공유하는 공통 지침 파일 `AGENTS.md`가 존재함.
- 공통 컨벤션을 두 곳에서 이중으로 유지관리하는 오버헤드를 피해야 함.
- 동시에 `src/billing/` 경로에 대한 플랜 모드 사용 규칙 등 Claude Code에만 적용되는 고유 지침을 함께 추가해야 함.

**B번이 정답인 이유:**
`CLAUDE.md` 파일 상단에 `@AGENTS.md`를 기재하면 Claude Code가 실행될 때 `AGENTS.md`의 내용을 자동으로 참조/불러옵니다. 그 하단에 Claude 전용 지침을 덧붙여 작성하면, 공통 지침의 단일 출처(Single source of truth)를 유지하면서도 Claude 전용 규칙을 완벽히 병합하여 전달할 수 있습니다.

**오답 분석:**

- Option A (오답): 변경사항이 생길 때마다 수동으로 수복사하는 방식은 동기화 누락 및 유지보수 문제를 일으키는 잘못된 방식입니다.
- Option C (오답): `CLAUDE.md`를 아예 삭제하면 Claude 전용으로 추가해야 하는 지침(플랜 모드 규칙 등)을 정의할 공간이 사라집니다.
- Option D (오답): 심볼릭 링크를 생성하면 `CLAUDE.md`와 `AGENTS.md`가 100% 동일한 내용만 갖게 되므로, Claude 전용 지침을 별도로 추가하여 확장할 수 없습니다.

---

## 55번 문제

**1. 문제 원문**

A backend engineer runs a test suite against a new Claude Code implementation of an inventory reconciliation function and gets three failing tests: a rounding error on fractional quantities, an off-by-one error in a loop boundary, and a missing null check for a discontinued-item field. All three appear to stem from unrelated parts of the function. What is the most effective way to communicate these results to Claude for the next iteration?

A) Report the null check issue first because it is a runtime crash risk, and postpone mentioning the other two failures until a later session.

B) Report each test failure sequentially in separate messages, addressing one issue at a time and verifying the fix before moving to the next.

C) Ask Claude to guess which of the three failures is most likely to be the underlying root cause before revealing any of the specific test output.

D) Share the full test output for all three failures in one message, let Claude propose fixes, and verify the result by rerunning the entire test suite.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Share the full test output for all three failures in one message, let Claude propose fixes, and verify the result by rerunning the entire test suite.

**정답 및 해설:**

**핵심 개념**: AI 코딩 어시스턴트 프롬프트 전략 (Context-Rich Prompting & Iterative Verification)  
LLM 기반 코딩 어시스턴트(Claude Code)는 관련된 모든 오류 컨텍스트(전체 로그)를 한 번에 제공받을 때 코드 전체의 맥락을 종합적으로 이해하여 독립적인 여러 버그를 한 번에 효율적으로 수정할 수 있습니다.

**문제 상황 분석:**
- 재고 조정 기능 테스트 중 서로 다른 원인을 가진 3가지 독립적인 버그가 동시에 발생함
- 각각의 버그는 소수점 오류, 루프 경계 오류, Null 참조 오류로 함수 내 개별적인 지점에서 유래함
- 다음 작업 반복(Iteration)을 위해 Claude에게 이 상황을 가장 효율적으로 전달하고 해결하는 전략을 찾아야 함

**D번이 정답인 이유:**
Claude와 같은 대형 언어 모델은 한 번의 요청에 충분한 맥락(Full Context)을 주었을 때 가장 높은 리팩토링 및 버그 수정 성능을 발휘합니다. 3가지 실패 로그 전체를 하나의 메시지로 전달하면 Claude가 함수 전체 구조를 파악하고 각각의 무관한 문제들을 한 번에 수정할 수 있습니다. 이후 전체 테스트 스위트를 다시 실행하여 사이드 이펙트 없이 모든 문제가 해결되었는지 일괄 검증하는 것이 개발 생산성 측면에서 가장 효율적입니다.

**오답 분석:**
- Option A (오답): 나중 세션으로 연기할 필요가 없으며, 정보를 의도적으로 숨기는 것은 컨텍스트 낭비와 불필요한 대화 턴(Turn) 증가를 초래합니다.
- Option B (오답): 버그를 하나씩 메시지로 나누어 수정하는 방식은 불필요하게 대화 턴을 소비하고 컨텍스트 윈도우 비용을 증대시키며, 전체적인 맥락 파악을 방해합니다.
- Option C (오답): 구체적인 테스트 출력(오류 로그) 없이 AI에게 근본 원인을 추측하게 만드는 것은 할루시네이션(환각)을 유발하는 비효율적인 방식입니다.

---

## 56번 문제

**1. 문제 원문**

After a developer adds a `/lint-report` command, it works when they run Claude Code themselves, but a teammate who pulled the latest commit reports the command doesn't exist. The developer confirms the file was never staged in any commit. What is the most likely cause?

A) The command file was saved under `~/.claude/commands/lint-report.md`, which lives outside the repository and was never version-controlled.

B) The command file was saved correctly but slash commands only activate after the project's CI pipeline runs once successfully.

C) The command file was saved under `.claude/commands/lint-report.md` but the teammate needs to restart their machine before new commands are detected.

D) The command file was saved under `.claude/skills/lint-report/SKILL.md`, which requires a separate enterprise license to share across teammates.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: The command file was saved under `~/.claude/commands/lint-report.md`, which lives outside the repository and was never version-controlled.

**정답 및 해설:**

**핵심 개념**: Claude Code의 개인용 설정(Personal Path) 및 Git 저장소 연동  
Claude Code에서 커스텀 명령어/스킬을 생성할 때, 사용자 홈 디렉토리(`~/.claude/...`)에 저장하면 특정 개발자의 개별 로컬 환경에서만 인식됩니다. 프로젝트 내 저장소(`.claude/...`)가 아닌 저장소 외부에 위치하기 때문에 `git add`나 `git status` 대상에 포함되지 않아 팀원들과 Git을 통해 커밋 및 공유할 수 없습니다.

**문제 상황 분석:**
- 개발자 본인 환경에서는 `/lint-report` 커스텀 명령어가 정상적으로 실행됨
- 최신 커밋을 받은 팀원 환경에서는 해당 명령어가 존재하지 않는 현상이 발생함
- Git 커밋 내역 확인 결과 해당 명령어 파일이 전혀 스테이징(staged) 및 커밋된 적이 없음

**A번이 정답인 이유:**
개발자가 명령어를 프로젝트 전역 디렉토리(`.claude/`)가 아닌 사용자 개인 로컬 디렉토리(`~/.claude/commands/lint-report.md`)에 생성했기 때문입니다. 이 디렉토리는 Git 저장소 범위를 벗어나 있으므로 Git 변경 사항으로 잡히지 않아 커밋할 수 없으며, 따라서 팀원이 코드를 pull받아도 해당 파일이 전달되지 않습니다. 팀 간 공유를 위해서는 프로젝트 내부 경로인 `.claude/commands/` 등에 저장하고 커밋해야 합니다.

**오답 분석:**
- Option B (오답): 슬래시 명령어의 활성화는 CI 파이프라인 실행 여부와 아무런 연관이 없습니다.
- Option C (오답): 새로운 명령어를 인식하기 위해 컴퓨터를 재부팅할 필요는 없으며, 문제는 파일이 Git에 공유되지 않은 점입니다.
- Option D (오답): 스킬 공유에는 엔터프라이즈 라이선스가 필요하지 않으며, 파일이 Git 추적에 걸리지 않은 근본 이유를 설명하지 못합니다.

---

## 57번 문제

**1. 문제 원문**

An architect is refining a text-summarization endpoint and finds Claude's summaries alternate unpredictably between one-sentence summaries and multi-paragraph summaries depending on the wording of the prompt, even though the prompt states "keep summaries concise." What is the most direct fix for this inconsistency?

A) Replace 'concise' with a detailed description such as 'write a summary that is short, tight, succinct, and to the point, avoiding any unnecessary words' to provide the model with explicit length guidance.

B) Remove the word 'concise' from the prompt and instead let the model determine the appropriate summary length for each input article, resulting in stable and predictable behavior across all requests.

C) Provide 2-3 sample input articles paired with example summaries at the exact target length and style, so "concise" is anchored to a concrete example rather than left open to interpretation.

D) Instruct Claude to produce exactly one sentence summaries regardless of input length, using a system prompt like 'Your response must be exactly one sentence long' and a stop sequence to truncate any further text.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Provide 2-3 sample input articles paired with example summaries at the exact target length and style, so "concise" is anchored to a concrete example rather than left open to interpretation.

**정답 및 해설:**

**핵심 개념**: 퓨샷 프롬프팅(Few-Shot Prompting) 및 추상적 지시어의 구체화  
'간결하게(concise)'와 같은 추상적인 단어는 LLM 해석상 모호함을 유발하여 응답 길이의 불확실성을 높입니다. 이를 해결하기 위해 가장 효과적이고 직접적인 프롬프트 엔지니어링 기법은 원하는 형식과 길이의 입출력 예시(Few-shot Examples)를 제공하는 것입니다.

**문제 상황 분석:**
- 프롬프트에 "keep summaries concise"라고 지정했지만 응답 길이가 한 문장에서 여러 단락까지 불일치하게 출력됨
- 'concise'라는 단어가 LLM 입장에서 자의적으로 해석될 수 있는 추상적인 표현이기 때문임
- 모델의 출력 스타일과 길이를 일관되고 안정적으로 고정하기 위한 직관적인 프롬프트 개선 방식이 필요함

**C번이 정답인 이유:**
퓨샷 예시(2~3개의 샘플 입력과 목표 요약본)를 함께 제공하면 모델은 'concise'의 실제 기준(길이, 톤, 스타일 등)을 패턴으로 학습합니다. 단어 기반 지시의 모호함을 줄이고 구체적인 구성을 직접 보여줌으로써 불일치 현상을 가장 직접적이고 효과적으로 해결할 수 있습니다.

**오답 분석:**
- A번 (오답): 비슷한 수식어(short, tight, succinct 등)를 나열하더라도 추상적인 지시라는 본질은 변하지 않으므로 출력 길이의 모호함을 확실히 해결하지 못합니다.
- B번 (오답): 단어를 제거하고 모델이 자유롭게 결정하도록 맡기면 일관성이 더욱 떨어지며 예측 불가능한 출력이 늘어납니다.
- D번 (오답): 중단 시퀀스(stop sequence)로 텍스트를 강제로 잘라내는 것은 완결되지 않은 부자연스러운 문장 절단을 유발하므로 올바른 해결책이 아닙니다.

---

## 58번 문제

**1. 문제 원문**

A developer creates a `migration-plan` skill with the body: 'Follow the approach we discussed for moving the billing service.' When invoked as a subagent, it returns a generic, unhelpful plan. What is the most likely reason?

A) Subagents cannot return text results to the main conversation, so the developer only sees an error message instead of a plan.

B) The skill is missing an `arguments` field, so the system ignores the entire skill body and substitutes a placeholder prompt.

C) The subagent does not have access to the main conversation's history, so the reference to an earlier discussion provides no actionable detail.

D) The model cannot write multi-step plans, so it defaults to a short generic response regardless of the prompt.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: The subagent does not have access to the main conversation's history, so the reference to an earlier discussion provides no actionable detail.

**정답 및 해설:**

**핵심 개념**: 서브에이전트(Subagent)의 컨텍스트 격리 (Context Isolation)  
Claude Code나 에이전트 기반 시스템에서 서브에이전트는 메인 스레드의 전체 대화 기록을 공유하지 않고, 독립된 세션/맥락(Isolated Context)에서 실행됩니다. 따라서 메인 대화에서 오간 이전 맥락("we discussed")을 서브에이전트 내부에서 직접 참조할 수 없습니다.

**문제 상황 분석:**
- 개발자가 `migration-plan` 스킬 본문에 "우리가 논의했던 방식을 따르라"는 모호한 프롬프트를 작성함
- 이 스킬이 독립적인 '서브에이전트' 형태로 호출 및 실행됨
- 서브에이전트는 메인 대화 맥락이 없으므로 구체적인 지시사항을 이해하지 못해 뭉뚱그려진 일반적인(generic) 답변만 출력함

**C번이 정답인 이유:**
서브에이전트는 독립된 하위 프로세스로 실행되므로 메인 대화창의 과거 대화 내역(conversation history)에 접근할 수 없습니다. 스킬 프롬프트에서 "we discussed(우리가 논의했던)"와 같이 대화 기록에 의존하는 구문을 사용하면, 서브에이전트는 구체적으로 무엇을 해야 할지 알 수 없게 되어 일반적이고 추상적인 답변만 반환하게 됩니다. 스킬을 작성할 때는 필요한 구체적 정보나 지침을 스킬 본문에 직접 포함해야 합니다.

**오답 분석:**
- Option A (오답): 서브에이전트는 실행 완료 후 결과를 메인 대화로 정상 반환할 수 있습니다. 오류 메시지가 뜨는 상황이 아닙니다.
- Option B (오답): `arguments` 필드가 필수 요건이 아니며, 누락되었다고 해서 시스템이 본문을 무시하거나 임의의 대체 프롬프트를 넣지 않습니다.
- Option D (오답): Claude 모델은 다단계 계획(multi-step plans) 작성을 훌륭하게 수행할 수 있습니다. 지시문 자체에 구체적인 컨텍스트가 부족한 것이 원인입니다.

---

## 59번 문제

**1. 문제 원문**

A CI job asks Claude Code to generate new unit tests for a modified module. The generated suite repeatedly proposes tests that duplicate scenarios already covered by the existing test file for that module. What should the pipeline change to reduce this redundant output?

A) Pass the existing test files for the module into Claude's context alongside the modified source, so generation is scoped against what is already covered.

B) Run the job with `--no-session-persistence` so no test history carries over between CI runs, forcing each run to generate tests without reference to past test patterns.

C) Raise `--max-budget-usd` for the job so Claude can afford to write a larger, more exhaustive test suite that covers every case twice to double-check each scenario for complete coverage.

D) Switch the job to `--output-format stream-json` and use a client-side script to deduplicate generated test events against the module's current test file.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Pass the existing test files for the module into Claude's context alongside the modified source, so generation is scoped against what is already covered.

**정답 및 해설:**

**핵심 개념**: Context-Aware Test Generation (컨텍스트 기반 테스트 생성)  
LLM(Claude Code)이 기존 코드 베이스나 테스트 환경의 정보를 파악하지 못하면, 이미 존재하는 테스트 케이스를 알 수 없어 임의의 중복 테스트를 생성하게 됩니다. 따라서 관련 있는 기존 파일(기존 테스트 파일 및 수정된 소스 파일)을 컨텍스트로 제공하는 것이 중복 생성을 방지하는 핵심 원리입니다.

**문제 상황 분석:**
- CI 작업에서 모듈 수정 후 Claude Code를 통해 신규 단위 테스트 생성을 시도함
- 기존 테스트 파일에 이미 작성된 테스트 시나리오가 계속 중복되어 작성되는 문제 발생
- 모델이 이미 무엇이 테스트되었는지 알 수 없는 상태에서 작업을 수행하여 불필요한 출력이 누적됨

**A번이 정답인 이유:**
Claude Code에 수정된 소스 코드뿐만 아니라 **기존 테스트 파일**도 함께 프롬프트 컨텍스트에 전달하면, 모델은 이미 검증된 시나리오와 누락된 시나리오(Edge Case)를 직접 비교·분석할 수 있습니다. 이를 통해 중복된 테스트 생성을 피하고 실제로 필요한 신규 테스트 케이스만 정확하게 생성할 수 있습니다.

**오답 분석:**
- Option B (오답): 세션 지속성(`--no-session-persistence`)은 실행 간 세션 공유를 차단할 뿐, 로컬의 기존 테스트 파일을 Claude에게 인식시켜 주지 못하므로 중복 문제를 해결할 수 없습니다.
- Option C (오답): 예산 제한(`--max-budget-usd`)을 늘리는 것은 생성 토큰 용량을 늘릴 뿐이며, 오히려 기존 테스트와 동일한 중복 테스트를 더 많이 생성하게 만듭니다.
- Option D (오답): 출력 형식을 스트리밍 JSON으로 바꾸고 후처리 스크립트로 중복을 거르는 방식은 복잡하며, 근본적으로 Claude가 처음부터 고품질의 비중복 테스트를 생성하도록 만드는 직접적인 해결책이 아닙니다.

---

## 61번 문제

**1. 문제 원문**

A CI pipeline runs Claude Code non-interactively to apply a pre-approved, narrowly scoped fix: updating one hardcoded timeout value in one configuration file, with the exact new value specified in advance. There is no ambiguity about approach and no exploration needed. Which workflow choice best fits this automated scenario?

A) Delegate the task to an Explore subagent to search the entire repository for every single place a timeout could plausibly still be configured

B) Reject running this task in CI entirely, since plan mode is required for every single change to any configuration file

C) Route the task through plan mode so Claude proposes a design for the timeout value change before the pipeline applies it

D) Run the task with direct execution, since it is a single, fully specified, well-scoped edit with no open design question to investigate

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Run the task with direct execution, since it is a single, fully specified, well-scoped edit with no open design question to investigate

**정답 및 해설:**

**핵심 개념**: 비대화형 CI 환경에서의 직접 실행(Direct Execution) 및 자동화 최적화  
Claude Code를 비대화형(CI/CD) 파이프라인에서 실행할 때, 구체적인 수정 내용과 변경될 값이 완벽히 명시되어 있고 추가적인 설계 검토나 탐색이 필요하지 않은 단순 작업은 계획 수립(Plan Mode)이나 서브에이전트 검색 단계 없이 **직접 실행(Direct Execution)** 방식을 사용하는 것이 가장 빠르고 효율적입니다.

**문제 상황 분석:**
- CI 파이프라인이 사전 승인된 단일 설정 파일의 하드코딩된 타임아웃 값을 변경하는 작업을 수행함
- 수정해야 할 새 값이 사전에 정확히 명시되어 있어 명확하며 탐색/분석 단계가 전혀 필요 없음
- 비대화형 자동화 실행 시 불필요한 오버헤드를 줄이고 정확한 작업을 완수할 수 있는 워크플로 모드가 필요함

**D번이 정답인 이유:**
해당 작업은 불확실성이 전혀 없으며(no ambiguity), 조사해야 할 설계상 의문점이 없는 단순 명료한 변경입니다. 따라서 탐색이나 계획 단계를 거치지 않고 직접 명령을 수행하는 **직접 실행(Direct Execution)**을 사용하는 것이 리소스와 시간을 절약하면서 자동화 목적을 달성하는 가장 적절한 워크플로입니다.

**오답 분석:**
- Option A (오답): 이미 대상 파일과 변경 값이 명확하게 결정되어 있으므로 저장소 전체를 탐색하는 Explore 서브에이전트를 실행하는 것은 불필요한 리소스 낭비입니다.
- Option B (오답): 모든 설정 파일 변경 시 Plan 모드가 필수적인 것은 아니며, CI 자동화 환경에서 이러한 단순 변경 작업을 거부할 이유가 없습니다.
- Option C (오답): 변경값이 이미 정해져 있는 단순 수정 작업에 Plan 모드를 사용하여 설계를 새로 제안받는 과정은 불필요한 단계와 지연을 유발합니다.

---

## 62번 문제

**1. 문제 원문**

An engineer works inside a symlinked checkout: the actual repository lives at `/Users/eng/code/service` and is symlinked to `/workspace/service`, and Claude Code is launched from the symlinked path. A path-scoped rule has paths: `["src/handlers/**/*.go"]`. The engineer edits `/workspace/service/src/handlers/middleware/auth.go`. Will the rule trigger given how Claude Code resolves paths through symlinks?

A) The rule triggers only for read-only operations performed through the symlink, while edits made through the symlinked path are matched against a separate, unscoped rule set.

B) The rule never triggers through a symlinked checkout, because path-scoped rules only evaluate against the canonical filesystem path returned by the operating system, bypassing any symlink entirely.

C) The rule triggers normally, because Claude Code matches path-scoped rules even when a file is reached through a symlinked path to the project directory, in addition to matching direct paths.

D) The rule triggers only if the engineer manually adds a second paths entry pointing at `/workspace/service/src/handlers/**/*.go`, since symlinked roots require an explicit absolute pattern.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: The rule triggers normally, because Claude Code matches path-scoped rules even when a file is reached through a symlinked path to the project directory, in addition to matching direct paths.

**정답 및 해설:**

**핵심 개념**: Claude Code의 심볼릭 링크(Symlink) 경로 해석 및 상대 경로 매칭  
Claude Code는 프로젝트 루트 디렉터리가 심볼릭 링크 경로로 접근되더라도 프로젝트 내 상대 경로 패턴(예: `src/handlers/**/*.go`)을 올바르게 계산하여 경로 지정 규칙(path-scoped rules)을 정규화하고 매칭합니다.

**문제 상황 분석:**
- 실제 프로젝트 디렉터리는 `/Users/eng/code/service`에 존재함
- 작업 디렉터리는 `/workspace/service`라는 심볼릭 링크로 연결되어 있으며, 이 심볼릭 경로에서 Claude Code가 실행됨
- 프로젝트 규칙에 `src/handlers/**/*.go` 상대 경로 패턴이 설정되어 있고, 엔지니어가 심볼릭 경로 내부의 해당 디렉터리 파일(`/workspace/service/src/handlers/middleware/auth.go`)을 편집함

**C번이 정답인 이유:**
Claude Code는 심볼릭 링크를 통해 프로젝트 경로에 진입했더라도 파일의 상대 경로 구조(`src/handlers/middleware/auth.go`)를 원활하게 추적 및 해결(Resolve)합니다. 따라서 직접 경로(Direct Path)뿐만 아니라 심볼릭 링크를 경유한 파일 편집 시에도 상대 경로 패턴이 정상적으로 매칭되어 규칙이 오류 없이 활성화(Trigger)됩니다.

**오답 분석:**
- Option A (오답): 읽기 작업과 수정 작업에 따라 규칙 매칭 로직이 분리되거나 별도의 비범위 규칙 세트로 전환되지 않습니다.
- Option B (오답): 심볼릭 링크를 통했다고 해서 경로 평가를 무시하거나 규칙 발동이 완전히 차단되지 않습니다.
- Option D (오답): 프로젝트 상대 경로 패턴이 이미 작성되어 있다면 심볼릭 루트를 위해 절댓값 패턴을 추가로 등록할 필요가 없습니다.

---

## 64번 문제

**1. 문제 원문**

A pipeline step runs `git diff main | claude -p "you are a typo linter..."` as part of a lint script in `package.json`. The maintainer wants Claude to have zero ability to run arbitrary Bash commands during this step, while still keeping the command portable across Windows and Linux runners. Which approach achieves the no-Bash-permission goal?

A) Running the script through npm instead of a direct shell invocation strips Bash tool access, as npm's encapsulation blocks tool invocations by the claude process.

B) Adding `--disallowedTools Bash` to the command line is the explicit way to block any Bash tool use, because piping alone does not remove the default tool access.

C) Piping the diff via stdin sends the changes directly to Claude without a tool invocation, so no Bash permission is needed to access the content itself.

D) The double-quoted prompt string itself tells Claude not to use Bash, so the invocation never makes any tool calls regardless of input, and no permission is needed.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Adding `--disallowedTools Bash` to the command line is the explicit way to block any Bash tool use, because piping alone does not remove the default tool access.

**정답 및 해설:**

**핵심 개념**: Claude Code 도구 접근 권한 제어 (`--disallowedTools`)  
Claude Code CLI 실행 시 기본적으로 셸 명령을 실행할 수 있는 Bash 도구 권한이 활성화되어 있을 수 있으며, 단순히 표준 입력(stdin)으로 텍스트를 전달하더라도 프로세스가 가지는 기본 도구 접근 권한 자체가 제거되는 것은 아닙니다. 명시적으로 특정 도구 사용을 금지하려면 CLI 플래그인 `--disallowedTools` (또는 권한 관련 플래그)를 지정해야 합니다.

**문제 상황 분석:**
- `package.json` 파이프라인에서 `git diff` 결과를 Claude CLI에 표준 입력(stdin) 파이프로 전달하여 오탈자 검사를 진행함
- 표준 입력을 받더라도 Claude가 스스로 임의의 Bash 명령어를 실행하는 위험을 완벽히 차단(zero ability)하고자 함
- OS 환경(Windows/Linux)에 독립적으로 이 권한 통제를 달성하는 명시적 방법이 필요함

**B번이 정답인 이유:**
파이프라인(`|`)을 사용하더라도 Claude Code 프로세스는 여전히 기본 권한 세트에 따라 Bash 도구를 호출할 수 있는 상태입니다. 명시적으로 `--disallowedTools Bash` 플래그를 CLI 명령줄에 추가해야 Claude 프로세스 내부에서 Bash 실행 도구의 사용을 완전히 차단할 수 있습니다.

**오답 분석:**
- Option A (오답): npm 스크립트를 경유하여 실행하더라도 자식 프로세스로 실행되는 Claude CLI의 내부 도구 접근 권한이 자동으로 차단되거나 캡슐화되지 않습니다.
- Option C (오답): 표준 입력(stdin)으로 내용이 입력되어 별도의 명령으로 차이점을 읽을 필요가 없다고 하더라도, 프로세스 실행 권한상 Bash 도구가 여전히 비활성화된 것은 아니므로 보장할 수 없습니다.
- Option D (오답): 프롬프트에 작성된 자연어 지시("Bash를 사용하지 마라")는 LLM에 대한 가이드일 뿐, 하드웨어/시스템 수준에서 도구 실행 권한을 완벽히 격리 및 차단하지 못합니다.

---

## 65번 문제

**1. 문제 원문**

A build script wants to pipe a large build-error log into Claude for a root-cause explanation: `cat build-error.txt | claude -p 'explain the root cause' > output.txt`. On one particularly verbose failure, the job exits immediately with an error and no explanation is produced. What is the most likely cause given how Claude Code handles piped stdin?

A) The build log contained non-UTF8 bytes, which -p mode rejects outright regardless of file size

B) Piped stdin is only accepted when --input-format stream-json is explicitly set, so plain text piping silently failed

C) The redirect operator > is not supported when combined with -p, so the shell discarded the response before Claude could write it

D) The build log exceeded the 10MB cap on piped stdin, so Claude Code exited with an error instead of processing the oversized input

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: The build log exceeded the 10MB cap on piped stdin, so Claude Code exited with an error instead of processing the oversized input

**정답 및 해설:**

**핵심 개념**: Claude Code의 표준 입력(stdin) 버퍼 제한 (10MB Cap)  
Claude Code CLI는 메모리 과부하 및 프롬프트 토큰 오버플로우를 방지하기 위해 파이프라인(`|`)을 통한 표준 입력(stdin) 크기에 10MB 상한선(Cap)을 두고 있습니다. 입력이 이 상한을 초과하면 입력을 처리하지 않고 에러와 함께 즉시 종료됩니다.

**문제 상황 분석:**
- 파이프라인 명령어(`cat log | claude -p ...`)를 통해 로그 파일을 Claude에 전달하여 원인 분석을 시도함
- 로그 내용이 유난히 길고 거대해진 특정 실패 상황(verbose failure)이 발생함
- Claude가 응답을 출력하지 않고 프로세스가 에러 메시지와 함께 즉시 종료됨

**D번이 정답인 이유:**
Claude Code는 stdin을 통해 입력되는 데이터에 대해 10MB 크기 제한 정책을 적용합니다. 유난히 로그가 길어져 파일 크기가 10MB를 초과하자, Claude Code가 해당 입력을 수용하지 않고 즉시 오류를 반환하며 종료된 것입니다.

**오답 분석:**
- Option A (오답): 인코딩 문제는 파일 크기와 상관없이 파이프 입력의 주된 즉시 종료 상한선 원인이 아니며, `-p` 모드가 인코딩 문제만으로 무조건 프로세스를 바로 강제 종료하지는 않습니다.
- Option B (오답): Claude Code는 별도의 옵션 없이도 일반 텍스트(plain text) 파이프 입력을 기본적으로 정상 수락합니다.
- Option C (오답): 셸 리다이렉션 연산자(`>`)는 OS 셸 표준 기능이므로 Claude Code의 `-p` 옵션과 완벽하게 함께 작동합니다.

---

## 66번 문제

**1. 문제 원문**

A team is using Claude Code to build a webhook ingestion service. During testing, three tests fail: one asserting that duplicate webhook deliveries are deduplicated using an idempotency key, one asserting that deduplication window expiry releases old keys correctly, and one asserting that a malformed JSON payload returns a 400 status. The first two failures both trace to the same deduplication store logic; the third is unrelated. What is the best way to structure feedback across these three failures?

A) Report the malformed-JSON failure first because it is the simplest, addressing the parsing error in an initial message, then combine both deduplication failures into a single follow-up message since they both involve the idempotency store.

B) Report the two deduplication-store failures together in a single message since they interact through the same store logic and report the malformed-JSON failure separately since it does not interact with the other two.

C) Report all three failures individually in separate messages, treating each test as a distinct issue so that each can be investigated in isolation, even when two failures share the same deduplication store logic, to keep the debugging process modular.

D) Wait until all three tests pass or fail consistently across several runs before reporting any of them, to confirm that the failures are reproducible and not transient, thereby avoiding premature reports on flaky test conditions.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Report the two deduplication-store failures together in a single message since they interact through the same store logic and report the malformed-JSON failure separately since it does not interact with the other two.

**정답 및 해설:**

**핵심 개념**: 논리적 피드백 구조화 (Logical Grouping of Test Failures)  
LLM(Claude Code)에게 테스트 실패 피드백을 전달할 때는 원인과 하위 로직이 서로 연관되어 있는 오류들끼리 모아서 피드백을 구성하고, 서로 무관한 별개의 오류는 분리하여 전달하는 것이 모델의 맥락 혼선을 줄이고 정밀한 수정을 이끌어내는 데 가장 효과적입니다.

**문제 상황 분석:**
- 3개의 테스트 실패 발생 (1. 멱등성 키 중복 제거, 2. 중복 제거 창 만료 키 해제, 3. 잘못된 JSON 입력 시 400 반환)
- 1번과 2번 실패는 동일한 '중복 제거 스토어 로직(deduplication store logic)'에서 발생하는 연관된 이슈임
- 3번 실패는 스토어 로직과 전혀 무관한 'JSON 파싱/유효성 검사' 이슈임

**B번이 정답인 이유:**
동일한 코드베이스 영역과 내부 로직을 공유하는 1번과 2번 실패를 하나의 메시지에 함께 묶어 피드백하면 Claude가 해당 스토어 로직의 전체적인 맥락을 함께 파악하여 종합적인 수정을 할 수 있습니다. 반면 전혀 연관이 없는 3번 파싱 실패는 별도의 메시지(또는 별도의 작업 단위)로 분리하여 피드백하는 것이 디버깅 범위를 명확히 제한하고 최선의 결과를 얻는 방법입니다.

**오답 분석:**
- Option A (오답): 순서상 가장 쉬운 것을 먼저 전달하는 것보다, 연관된 연관성을 기준으로 단일 피드백 메시지를 묶는 것(B번)이 맥락 처리 및 효율성 면에서 우수합니다.
- Option C (오답): 동일한 스토어 로직을 공유하는 두 문제를 의도적으로 개별 메시지로 쪼개어 전달하면, 첫 번째 수정이 두 번째 버그에 영향을 주어 중복 수정이나 충돌을 야기할 위험이 있습니다.
- Option D (오답): 이미 수신된 명확한 실패 결과를 처리하지 않고 단순히 여러 번 실행을 반복하며 대기하는 것은 작업 진행을 불필요하게 지연시킵니다.

---

## 67번 문제

**1. 문제 원문**

An engineering lead wants CI-invoked Claude Code reviews to consistently flag missing test coverage using the team's specific definition of a "valuable test" (asserts behavior, not implementation details) and to know which fixtures already exist in the test helpers directory. Where should this project-specific guidance be encoded so every CI run picks it up automatically without being repeated in each workflow prompt?

A) In a CLAUDE.md file at the repository root describing testing standards, the valuable-test criteria, and available fixtures

B) In the pull request description template, so each contributor retypes the testing standards before requesting review

C) In the --append-system-prompt flag value hardcoded into the CI runner's shell profile

D) In the GitHub Actions workflow YAML as a long inline prompt string duplicated across every review job

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: In a CLAUDE.md file at the repository root describing testing standards, the valuable-test criteria, and available fixtures

**정답 및 해설:**

**핵심 개념**: 프로젝트 지속적 컨텍스트 파일(`CLAUDE.md`)  
Claude Code는 프로젝트 루트 디렉터리에 위치한 `CLAUDE.md` 파일을 자동으로 인식하여 모든 세션 및 워크플로의 컨텍스트(System Prompt / Guidelines)에 집어넣습니다. 이를 통해 개별 워크플로 프롬프트에 구체적인 가이드라인을 매번 반복하지 않고도 CI 환경과 로컬 환경 전체에서 일관된 규칙을 적용할 수 있습니다.

**문제 상황 분석:**
- CI 상에서 실행되는 Claude Code 검토가 팀 고유의 "가치 있는 테스트" 기준과 기존 테스트 헬퍼/픽스처 유무를 일관되게 파악해야 함
- 매번 CI 워크플로 파일의 프롬프트에 해당 규칙 및 코딩 컨벤션을 중복해서 적지 않고 자동 로드되도록 설정하고자 함
- 프로젝트 전용 컨텍스트(Project-specific Guidance)를 지속적으로 공유하는 가장 정석적인 저장소를 찾아야 함

**A번이 정답인 이유:**
프로젝트 루트의 `CLAUDE.md` 파일은 해당 프로젝트와 관련된 주요 규칙, 코딩 컨벤션, 테스트 가이드라인, 픽스처 정보 등을 보관하는 프로젝트 전용 Single Source of Truth 역할을 합니다. Claude Code는 실행 시 루트의 `CLAUDE.md`를 자동으로 로드하므로, 여기에 테스트 기준과 사용 가능한 픽스처 목록을 기술해 두면 CI 워크플로 프롬프트 작성 시 중복 없이 자동으로 모든 검토 작업에 적용됩니다.

**오답 분석:**
- Option B (오답): PR 템플릿에 기술하여 개발자가 매번 손으로 다시 입력하도록 만드는 것은 자동화에 역행하며 사람이 실수하기 쉽습니다.
- Option C (오답): CI 러너의 셸 프로필 환경에 하드코딩하는 방식은 프로젝트 코드베이스 외부로 설정이 이탈되어 버전 관리가 불가능하고 로컬 개발 환경과의 일관성을 상실시킵니다.
- Option D (오답): YAML 파일에 프롬프트 문자열을 길게 중복 작성하는 것은 가독성이 떨어지고 유지보수가 매우 까다로워집니다.

---

## 68번 문제

**1. 문제 원문**

An engineer wants to keep their personal sandbox database URL and preferred test fixtures available to Claude Code whenever they work in a specific repository, without ever committing these personal details to the shared repository. Which configuration best achieves this?

A) Add the sandbox URL and fixtures to a `CLAUDE.local.md` file at the project root and add `CLAUDE.local.md` to the repository's `.gitignore` (or your global Git excludes) so it remains uncommitted.

B) Append the sandbox URL and fixtures to the bottom of the shared project `CLAUDE.md`, since Claude Code automatically strips personal values before committing.

C) Store the sandbox URL and fixtures in a `.claude/settings.local.json` file at the project root. Claude Code automatically adds this file to the global Git excludes, so it is never committed.

D) Store the sandbox URL and fixtures in `~/.claude/CLAUDE.md`, because user-level configuration files are automatically scoped to the current repository.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Add the sandbox URL and fixtures to a `CLAUDE.local.md` file at the project root and add `CLAUDE.local.md` to the repository's `.gitignore` (or your global Git excludes) so it remains uncommitted.

**정답 및 해설:**

**핵심 개념**: 로컬전용 프로젝트 컨텍스트 파일 (`CLAUDE.local.md`)  
Claude Code는 프로젝트 루트에서 `CLAUDE.md`뿐만 아니라 로컬 개발자 전용 설정 파일인 `CLAUDE.local.md`도 자동으로 읽어와 컨텍스트로 결합합니다. 팀과 공유되는 메인 `CLAUDE.md`와 달리, 개인 환경 설정(로컬 DB URL, 테스트 계정 등)은 `CLAUDE.local.md`에 작성하고 `.gitignore`에 등록하여 버전 관리 추적에서 제외하는 것이 표준적인 활용법입니다.

**문제 상황 분석:**
- 개발자가 특정 프로젝트/저장소 내에서 사용할 개인용 DB URL과 테스트 픽스처 지침을 Claude Code에 전달하고자 함
- 이 세부 정보는 공유 저장소(Git)에 커밋되거나 팀원들에게 유출되어서는 안 됨
- 해당 특정 프로젝트 범위(Project Scope)로 국한되면서도, 커밋 대상에서 완벽히 제외되는 설정 방식이 필요함

**A번이 정답인 이유:**
`CLAUDE.local.md` 파일은 특정 프로젝트 디렉터리에 위치하므로 프로젝트 스코프의 맥락을 가질 수 있으며, Claude Code에 의해 자동으로 로드됩니다. 동시에 이 파일명을 `.gitignore` (또는 `.git/info/exclude`)에 추가하면 버전 관리에서 제외되므로 개인 정보나 로컬 전용 컨텍스트가 Git 커밋에 포함되지 않도록 안전하게 보호할 수 있습니다.

**오답 분석:**
- Option B (오답): Claude Code가 커밋 전에 개인적인 값을 자동으로 감지해서 제거해주지 않으므로, 메인 `CLAUDE.md`에 덧붙이면 저장소에 그대로 커밋되어 버립니다.
- Option C (오답): `.claude/settings.local.json`은 도구/명령어 실행 권한이나 CLI 설정을 관리하는 JSON 구조이며 프롬프트용 지침이나 픽스처 가이드를 서술하는 문서 파일이 아닙니다. 또한 Claude Code가 이를 자동으로 global Git excludes에 등록해주지 않습니다.
- Option D (오답): `~/.claude/CLAUDE.md`는 사용자 홈 디렉터리에 위치한 전역(Global) 설정 파일입니다. 이는 특정 프로젝트에만 국한(scoped)되는 것이 아니라 모든 프로젝트에서 공통 적용되므로 문제 조건("whenever they work in a specific repository")에 맞지 않습니다.

---

## 69번 문제

**1. 문제 원문**

A developer on a shared repository wants a personal `/my-standup` slash command that formats their daily standup notes and should not appear in teammates' `/` menus or be included in pull requests. According to current Anthropic Claude Code skill best practices, where should they create this personal slash command?

A) In `~/.claude/skills/my-standup/SKILL.md`, which is a personal skill not committed to the repository and available as a slash command only to that developer.

B) In `~/.claude/commands/my-standup.md`, which is a legacy personal command location that still works but is not the current recommended skill-based structure.

C) In `.claude/commands/my-standup.md` with a leading underscore in the filename so teammates' clients skip loading it.

D) In `.claude/commands/my-standup.md`, then add a note in the PR description asking reviewers to ignore that file.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: In `~/.claude/skills/my-standup/SKILL.md`, which is a personal skill not committed to the repository and available as a slash command only to that developer.

**정답 및 해설:**

**핵심 개념**: 개인용 스킬 디렉터리(`~/.claude/skills/`) 및 슬래시 명령어 권장 구조  
Claude Code의 최신 스킬 모범 사례에서는 슬래시 명령어로 동작하는 커스텀 기능을 `SKILL.md` 구조로 표준화하여 작성할 것을 권장합니다. 프로젝트 저장소 내부(`.claude/skills/`)가 아닌 사용자 홈 디렉터리(`~/.claude/skills/`)에 생성하면, Git으로 추적되거나 팀원에게 노출되지 않는 개별 개발자 전용(Personal Scope) 슬래시 명령어로 사용할 수 있습니다.

**문제 상황 분석:**
- 일일 스탠드업 노트를 정형화하는 개인용 슬래시 명령어(`/my-standup`) 생성이 필요함
- 해당 명령어는 프로젝트 공유 저장소(Git)나 PR에 포함되어서는 안 됨
- 팀원들의 Claude Code 메뉴에 나타나지 않고 작성자 본인의 환경에서만 오롯이 동작해야 함

**A번이 정답인 이유:**
사용자 홈 디렉터리의 `~/.claude/skills/<skill-name>/SKILL.md` 경로에 생성된 스킬은 해당 개발자의 로컬 계정에만 적용되는 개인 스킬(Personal Skill)로 등록됩니다. 이는 Git 프로젝트 범위를 벗어나므로 저장소에 커밋될 위험이 없고, 슬래시 명령어 형식으로 해당 개발자 환경에서만 독립적으로 실행할 수 있는 최신 권장 모범 사례입니다.

**오답 분석:**
- Option B (오답): `~/.claude/commands/` 경로는 구버전(Legacy) 명령어 구조이며, 최신 모범 사례는 `skills/` 하위의 `SKILL.md` 구조로 작성하는 것을 권장합니다.
- Option C (오답): 프로젝트 경로인 `.claude/`에 작성하면 언더스코어를 붙이더라도 Git 추적 대상에 포함되어 PR에 올라갈 수 있으며, 언더스코어가 자동 무시 처리 기준이 아닙니다.
- Option D (오답): 프로젝트 폴더에 작성한 후 PR 리뷰어에게 수동으로 무시해 달라고 요청하는 것은 비효율적이며 파일 유출 위험이 높습니다.

---

## 71번 문제

**1. 문제 원문**

A large, rarely-needed compliance reference document is currently pasted into CLAUDE.md, and the team notices every session now starts with a noticeably larger context footprint even on days nobody needs the compliance information. Once loaded, a skill's body stays in context for the rest of that session too. Given this, which change reduces the typical per-session cost most, while still making the reference available when it is actually needed?

A) Move the document into a `.claude/skills/compliance-reference/SKILL.md` skill, since its content is loaded only in the sessions where it's actually invoked, rather than in every session by default.

B) Add `effort: low` to the YAML frontmatter of `CLAUDE.md`, which instructs Claude Code to load a reduced token-count representation of the file's instructions, leaving out the rarely-needed compliance details until explicitly requested.

C) Split `CLAUDE.md` into `CLAUDE_core.md` and `CLAUDE_compliance.md`, so that Claude Code loads only the alphabetically first file's content per session, keeping the compliance content unloaded unless referenced.

D) Move the document into a `.claude/commands/compliance.md` command file, since commands undergo transparent compression that leads to a smaller context footprint than raw `CLAUDE.md` instructions, without any manual intervention.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Move the document into a `.claude/skills/compliance-reference/SKILL.md` skill, since its content is loaded only in the sessions where it's actually invoked, rather than in every session by default.

**정답 및 해설:**

**핵심 개념**: Claude Code Custom Skills 온디맨드(On-demand) 로딩 매커니즘
`CLAUDE.md`에 작성된 내용은 모든 세션이 시작될 때마다 시스템 프롬프트/기본 컨텍스트로 무조건 로드되지만, `.claude/skills/` 디렉터리에 정의된 스킬은 선언(메타데이터)만 노출되다가 사용자가 해당 스킬을 명시적으로 호출(Invoke)할 때에만 본문 내용을 컨텍스트로 불러옵니다.

**문제 상황 분석:**
- 용량이 크고 드물게 쓰이는 문서가 `CLAUDE.md`에 포함되어 있어 매 세션마다 불필요한 토큰 소비와 비용 발생
- 규정 준수 정보가 필요한 특정 상황에만 참조할 수 있도록 유지해야함
- 세션 기본 토큰 비용(Per-session cost)을 최적화할 수 있는 아키텍처 패턴이 필요함

**A번이 정답인 이유:**
해당 참조 문서를 커스텀 스킬(`.claude/skills/compliance-reference/SKILL.md`) 형태로 분리하면, 평소 세션에서는 로드되지 않아 세션 기본 토큰 비용이 획기적으로 절감됩니다. 실제로 규정 준수 검사나 참조가 필요한 세션에서만 호출되어 로드되므로 문제에서 요구하는 조건을 완벽히 충족합니다.

**오답 분석:**

- Option B (오답): YAML 프론트매터의 `effort: low` 기능은 컨텍스트 토큰을 줄여서 축약 로드해주는 설정이 아니며, 존재하지 않는 허구의 기능 설명입니다.
- Option C (오답): Claude Code가 파일명의 알파벳순으로 첫 번째 파일만 읽고 나머지는 건너뛴다는 로직은 잘못된 설명입니다.
- Option D (오답): 커맨드 파일이 컨텍스트를 투명하게 자동 압축(Transparent compression)하여 제공한다는 설명 역시 허구의 동작 방식입니다.

---

## 73번 문제

**1. 문제 원문**

A platform team wraps `claude` inside a GitHub Actions job that fires on every pull request to summarize the diff. The first run hangs until the job times out, with no output ever written to the log. The team confirms the API key secret is valid and the prompt text is correct. What is the most likely cause of the hang?

A) The job invoked claude without the `-p` flag, so Claude Code started in interactive mode and sat waiting for terminal input that the runner never provides

B) The job checked out the repository with a shallow clone depth, so Claude Code could not resolve the diff and stalled while scanning git history

C) The workflow forgot to set ANTHROPIC_API_KEY as a masked secret, so the CLI silently retried authentication in a loop until the runner timeout

D) The runner's Node.js version is older than what the claude binary requires, so the process stayed alive while failing to parse its own CLI arguments

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: The job invoked claude without the `-p` flag, so Claude Code started in interactive mode and sat waiting for terminal input that the runner never provides

**정답 및 해설:**

**핵심 개념**: CI/CD 환경에서의 비대화형(Non-interactive) 모드 실행 (`-p` / `--print` 플래그)
Claude Code CLI는 기본적으로 사용자와 터미널에서 대화하는 대화형(Interactive) 모드로 동작합니다. 하지만 GitHub Actions와 같은 CI/CD 자동화 파이프라인(비대화형 러너 환경)에서는 사용자 입력을 받을 수 없으므로, 프롬프트 전송 및 단발성 명령 실행을 위해서는 `-p` (또는 `--print`) 플래그를 사용하여 프롬프트 모드로 실행해야 합니다.

**문제 상황 분석:**
- GitHub Actions CI/CD 환경에서 `claude` CLI 명령을 실행함
- 명령어가 로그 출력 없이 계속 대기하다가 작업 타임아웃(Timeout)으로 실패함
- API 키 및 프롬프트 문구 등 기본 환경 설정에는 이상이 없음

**A번이 정답인 이유:**
`-p` (또는 `--print`) 플래그 없이 CI/CD에서 `claude`를 실행하면 대화형 세션이 열리며 사용자 표준 입력(stdin)을 기다리게 됩니다. 자동화 러너는 입력을 주지 않으므로 CLI는 로그 출력 없이 무한정 대기 상태(Hang)에 빠지게 됩니다.

**오답 분석:**

- Option B (오답): Shallow clone으로 인해 커밋 이력을 찾지 못하면 오류 메시지를 출력하고 종료되거나 Git 관련 에러를 내뱉지, 무한 대기 상태(Hang)가 되지 않습니다.
- Option C (오답): API 키 마스킹 여부와 인증 무한 루프 재시도는 관계가 없으며, 인증 실패 시 에러 로그가 출력됩니다.
- Option D (오답): Node.js 버전 미달 문제 발생 시 프로세스가 대기하는 것이 아니라 모듈 구문 오류(SyntaxError)나 호환성 에러를 출력하며 즉시 종료됩니다.

---

## 74번 문제

**1. 문제 원문**

A developer configured `allowed-tools: Write Edit` on a skill, expecting this to prevent Claude from ever calling Bash while the skill runs. During a session, Claude still calls Bash after asking for the user's approval. Why did this happen, and what should the developer configure instead to fully remove Bash from the available pool while the skill is active?

A) `allowed-tools` only constrains tools invoked directly by the user, and does not limit tools that Claude chooses during skill execution. To remove Bash, set `model: inherit` on the skill to override Claude's autonomous tool selection.

B) `allowed-tools` is evaluated only after the skill finishes running, so Bash calls made during the skill are unaffected by its configuration. To remove Bash, set `context: fork` on the skill to sandbox execution and block unlisted tools.

C) `allowed-tools` only pre-approves the listed tools without prompting; it does not remove other tools from availability. Adding `disallowed-tools: Bash` removes Bash from Claude's pool while the skill is active.

D) `allowed-tools` requires trailing wildcards, such as `Write*` and `Edit*`, to restrict tools; without them, all tools including Bash are implicitly allowed. To block Bash, append `*` to each allowed tool so only those tools can be called.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: `allowed-tools` only pre-approves the listed tools without prompting; it does not remove other tools from availability. Adding `disallowed-tools: Bash` removes Bash from Claude's pool while the skill is active.

**정답 및 해설:**

**핵심 개념**: Custom Skills 도구 권한 메타데이터 (`allowed-tools` vs `disallowed-tools`)
Claude Code 스킬 설정에서 `allowed-tools`는 사용자의 프롬프트/승인 절차 없이 자동으로 실행(Auto-approve)을 허용할 도구 목록을 정의합니다. 반면, 특정 도구의 사용 자체를 완전히 금지하고 사용 가능한 도구 목록(Pool)에서 제거하려면 `disallowed-tools` 속성을 사용해야 합니다.

**문제 상황 분석:**
- 개발자가 스킬 내에 `allowed-tools: Write Edit`를 지정하여 Bash 사용을 완전히 막고자 함
- 하지만 실행 중 Claude가 사용자 승인(Prompting)을 거쳐 여전히 Bash를 호출함
- `allowed-tools`는 승인 없이 바로 실행할 도구만 지정할 뿐, 나열되지 않은 다른 도구의 사용 가능성(Availability)까지 차단하지는 못함

**C번이 정답인 이유:**
`allowed-tools`는 지정된 도구에 대해 사용자 승인 절차를 생략(Pre-approve)해 주는 역할을 할 뿐, 지정되지 않은 다른 도구(예: Bash)의 사용 권한을 아예 삭제하는 것은 아닙니다. 따라서 다른 도구는 사용자에게 승인을 물어보고 사용할 수 있는 상태로 남게 됩니다. 특정 도구를 스킬 실행 중 완전히 비활성화하려면 `disallowed-tools: Bash`를 명시적으로 설정해야 합니다.

**오답 분석:**

- Option A (오답): `allowed-tools`가 사용자 직접 호출 도구만 제한한다는 설명과 `model: inherit` 설정으로 자율 도구 선택을 재정의한다는 설명 모두 동작 원리와 다릅니다.
- Option B (오답): `allowed-tools`가 스킬 실행 종료 후에 평가된다는 설명이나 `context: fork` 설정으로 미등록 도구를 차단한다는 설명은 지원되지 않는 잘못된 설명입니다.
- Option D (오답): `allowed-tools` 설정에 와일드카드(`*`)가 필수적이라는 요구사항은 존재하지 않습니다.

---

## 75번 문제

**1. 문제 원문**

A team using Claude Code wants every request in the project, regardless of topic, to follow a fixed rule: never commit directly to `main` and always open a pull request instead. The rule must be enforced automatically on relevant actions and must not depend on Claude remembering or choosing to follow an instruction. Where should this rule live?

A) In a `.claude/commands/git-rule.md` command, since commands run automatically before every user message without being typed.

B) In a `.claude/skills/git-workflow/SKILL.md` skill with `disable-model-invocation: true`, since skills only load when manually typed.

C) In a `PreToolUse` hook in the project's `.claude/settings.json` that inspects Bash tool inputs, blocks any direct commit to `main`, and returns a message instructing the user to open a pull request.

D) In the project's `CLAUDE.md`, since that file is always loaded and applies as a universal standard across every conversation in the project.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: In a `PreToolUse` hook in the project's `.claude/settings.json` that inspects Bash tool inputs, blocks any direct commit to `main`, and returns a message instructing the user to open a pull request.

**정답 및 해설:**

**핵심 개념**: 결정론적 제어를 위한 Hooks System (`PreToolUse`)
프롬프트 기반 지시사항(예: `CLAUDE.md`)은 AI 모델의 주의력 저하(Attention attenuation)나 판단 오류로 인해 100% 보장되는 강제력을 갖기 어렵습니다. 반면, Claude Code의 Hook(훅) 시스템은 도구 실행 전후에 프로그램 코드 레벨로 개입하여 실행을 물리적으로 검사 및 차단할 수 있는 결정론적(Deterministic) 강제 메커니즘을 제공합니다.

**문제 상황 분석:**
- `main` 브랜치에 직접 커밋하는 것을 무조건 차단하는 고정 규칙 적용 필요
- Claude가 지시사항을 '기억'하거나 '스스로 따르도록 선택'하는 비결정론적 프롬프트 방식에 의존해서는 안 됨
- 해당 작업(Bash 커밋 명령)이 발생할 때마다 자동적이고 확실하게(Enforced automatically) 제어해야 함

**C번이 정답인 이유:**
`.claude/settings.json`에 정의된 `PreToolUse` 훅은 Claude가 Bash 도구(Git 명령 등)를 실행하기 바로 직전에 파라미터를 검사합니다. `main` 브랜치 커밋 시도가 감지되면 도구 실행 자체를 물리적으로 차단(Block)하고 사용자로 하여금 PR을 열도록 안내 메시지를 반환하므로, LLM의 기억이나 판단에 의존하지 않고 100% 확정적인 규칙 강제가 가능합니다.

**오답 분석:**

- Option A (오답): 커맨드(Commands)는 사용자 메시지마다 자동으로 실행되지 않으며, 모델의 입력을 완전히 차단하는 제어 능력을 갖지 않습니다.
- Option B (오답): 스킬(Skills)에 `disable-model-invocation: true`를 지정하더라도, 이는 사용자가 명시적으로 스킬을 호출할 때만 비활성화 관련 동작을 할 뿐 모든 명령어 실행 시점을 결정론적으로 감시/차단하지 못합니다.
- Option D (오답): `CLAUDE.md`는 프롬프트 레벨의 지침일 뿐입니다. 문제에서 "Claude가 지시사항을 기억하거나 따르기로 선택하는 것에 의존하지 않아야 한다(must not depend on Claude remembering or choosing to follow an instruction)"고 명시했으므로 프롬프트 기반 해결책인 D번은 적절하지 않습니다.

---

## 76번 문제

**1. 문제 원문**

A junior engineer asks why an architect insisted on plan mode for a task that adds a new authentication provider, when the engineer felt it could have started with direct edits right away. Investigation shows the task requires new session-handling logic, changes to token storage, updates to five different service entry points, and a decision between two competing library options. Which justification best explains the architect's choice?

A) The engineer's instinct was correct, and the architect should have started with direct execution since every requirement was already fully described

B) Plan mode should be used for any task that involves authentication, since security-related code is always exempt from direct execution by policy

C) Direct execution cannot make changes to more than one file at a time, so plan mode was the only technically available option here

D) The task spans multiple files, involves a real choice between two competing libraries, and touches core session and token-handling behavior directly

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: The task spans multiple files, involves a real choice between two competing libraries, and touches core session and token-handling behavior directly

**정답 및 해설:**

**핵심 개념**: Claude Code의 플랜 모드(Plan Mode) 활용 기준
Claude Code의 플랜 모드(Plan Mode)는 코드를 즉시 변경하기 전에 탐색, 라이브러리/설계 채택에 대한 전략 수립, 실행 계획 생성을 우선 수행하는 모드입니다. 단일 파일의 간단한 수정이 아니라 다중 파일 변경, 트레이드오프 검토(라이브러리 선택 등), 핵심 시스템 아키텍처(세션/토큰 처리 등) 수정이 필요한 복잡한 작업일 때 플랜 모드를 사용하는 것이 안전하고 효율적입니다.

**문제 상황 분석:**
- 주니어 엔지니어는 간단한 작업이라 판단하고 즉시 코드 수정을 하려 함
- 그러나 실제 작업은 5개 이상의 파일 업데이트, 핵심 세션/토큰 저장소 로직 변경, 2개의 라이브러리 중 하나를 선택하는 아키텍처적 결정을 포함함
- 따라서 코드 수정 전 사전 분석 및 전략 수립(Plan Mode)이 반드시 필요한 시나리오임

**D번이 정답인 이유:**
작업이 여러 파일에 걸쳐 있고(5개 엔트리 포인트), 사용 라이브러리 선택 등 아키텍처적 의사결정이 필요하며, 민감한 핵심 세션/토큰 로직을 직접 건드리기 때문에 코드 수정에 앞서 계획을 세우는 플랜 모드를 적용하는 것이 가장 타당합니다.

**오답 분석:**

- Option A (오답): 요구사항이 기술되어 있다 하더라도 여러 파일 변경 및 기술 선택이 수반되는 복잡한 작업이므로 직접 실행이 항상 옳지는 않습니다.
- Option B (오답): '보안 정책상 모든 인증 관련 코드는 직접 실행이 금지된다'는 식의 무조건적인 규칙은 존재하지 않습니다.
- Option C (오답): 직접 실행(Direct execution) 모드에서도 기술적으로는 여러 파일을 동시에 수정할 수 있습니다. 단지 안전성과 체계성을 위해 플랜 모드를 권장하는 것입니다.

---

## 77번 문제

**1. 문제 원문**

In a Claude Code rules file, the same conventions must apply to `.ts` and `.tsx` files anywhere under `src/`, plus `.ts` files under `lib/`, using as few `paths` glob pattern entries as possible. Which `paths` frontmatter accomplishes this most efficiently?

A)
```yaml
paths:
  - "**/*.ts"
  - "**/*.tsx"

```

B)

```yaml
paths:
  - "src/**/*.{ts,tsx}"
  - "lib/**/*.ts"

```

C)

```yaml
paths:
  - "src/*.{ts,tsx}"
  - "lib/*.ts"

```

D)

```yaml
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "lib/**/*.ts"

```

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**:

```yaml
paths:
  - "src/**/*.{ts,tsx}"
  - "lib/**/*.ts"

```

**정답 및 해설:**

**핵심 개념**: Glob 중괄호 확장(Brace Expansion) 및 재귀 패턴(`**`)
Glob 패턴에서 `{ext1,ext2}` 형태의 중괄호 확장(Brace Expansion) 기법을 사용하면 여러 확장자를 하나의 패턴으로 묶을 수 있습니다. 또한 `**` 와일드카드를 사용해야 하위 디렉터리 깊이에 상관없이(`anywhere under`) 모든 파일을 재귀적으로 탐색합니다.

**문제 상황 분석:**

* `src/` 하위의 모든 위치(`anywhere under src/`)에 있는 `.ts` 및 `.tsx` 파일 포함 필요
* `lib/` 하위의 모든 위치에 있는 `.ts` 파일 포함 필요
* 가능한 한 최소한의(as few as possible) `paths` 패턴 항목을 사용하여 효율적으로 구성해야 함

**B번이 정답인 이유:**
`src/**/*.{ts,tsx}` 단 한 줄의 패턴으로 `src/` 하위 전체에 존재하는 `.ts` 파일과 `.tsx` 파일을 모두 그룹화하여 지정합니다. 여기에 `lib/**/*.ts`를 추가하여 총 2개의 항목만으로 요구사항을 완벽하고 간결하게 충족합니다.

**오답 분석:**

- Option A (오답): `src/` 및 `lib/` 외의 다른 디렉터리에 있는 `.ts` / `.tsx` 파일까지 불필요하게 전부 매칭하므로 조건 범위를 초과합니다.
- Option C (오답): `**` 대신 `*`를 사용했기 때문에 `src/` 또는 `lib/` 최상위 폴더 바로 아래의 파일만 매칭되며, 하위 디렉터리 내부에 있는 파일들을 포함하지 못합니다.
- Option D (오답): 요구사항을 충족하지만, 중괄호 확장(`{ts,tsx}`)을 사용하지 않고 `src/` 경로를 두 줄로 분리하여 작성했기 때문에 "가장 적은 개수의 엔트리 사용" 조건에 어긋납니다.

---

## 79번 문제

**1. 문제 원문**

A developer keeps invoking a skill that walks the entire codebase and prints a long dependency analysis. Even after the skill finishes, this lengthy output keeps consuming space in the main conversation for the rest of the session. What frontmatter change would keep this analysis out of the main conversation's context while still returning a summary?

A) Add `context: fork` to the skill's frontmatter so the analysis runs in an isolated subagent and only a summarized result is returned to the main conversation.

B) Add `argument-hint: [directory]` to the skill's frontmatter so the analysis only scans one directory at a time instead of the whole codebase.

C) Add `disable-model-invocation: true` to the skill's frontmatter so only manual invocation triggers the lengthy dependency analysis.

D) Add `allowed-tools: Read Grep` to the skill's frontmatter so the analysis is limited to read-only tools that produce shorter output.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Add `context: fork` to the skill's frontmatter so the analysis runs in an isolated subagent and only a summarized result is returned to the main conversation.

**정답 및 해설:**

**핵심 개념**: Custom Skills의 `context: fork` 프론트매터 속성
Claude Code의 커스텀 스킬 설정 시 `context: fork` 속성을 추가하면 해당 스킬이 독립된 하위 에이전트(Subagent) 컨텍스트에서 실행됩니다. 서브에이전트 내에서 수행된 긴 작업 내역과 방대한 중간 출력 결과는 메인 대화의 컨텍스트 윈도우를 더럽히지 않으며, 최종 정리된 요약 결과만 메인 세션으로 반환되어 컨텍스트 공간을 최적화할 수 있습니다.

**문제 상황 분석:**

* 코드베이스 전체 탐색으로 인해 긴 의존성 분석 결과가 메인 대화 세션에 남음
* 세션이 진행되는 동안 이 긴 출력물이 계속 컨텍스트 토큰을 많이 차지하는 문제 발생
* 방대한 실행 과정을 메인 컨텍스트에서 분리하면서도, 최종 분석 요약본만 메인 대화로 전달하는 설정이 필요함

**A번이 정답인 이유:**
`context: fork` 프론트매터 옵션은 스킬을 격리된 포크(Forked) 서브에이전트 환경에서 수행하도록 합니다. 따라서 전체 코드 탐색 및 긴 분석 출력 과정은 메인 컨텍스트 외부에 남게 되며, 메인 세션에는 오직 요약된 최종 결과만 전달되어 대화 창의 컨텍스트 오버헤드를 대폭 줄여줍니다.

**오답 분석:**

- Option B (오답): `argument-hint`는 사용자에게 인자 입력 힌트 문구를 보여주는 UI용 속성일 뿐, 탐색 범위를 제한하거나 컨텍스트 분리를 수행하지 않습니다.
- Option C (오답): `disable-model-invocation: true`는 모델이 스스로 이 스킬을 호출하지 못하게 하고 사용자 수동 실행만 허용하는 설정이며, 실행 결과가 메인 대화 컨텍스트를 차지하는 문제 자체를 해결해주지는 않습니다.
- Option D (오답): `allowed-tools`는 자동 승인할 도구 목록을 지정할 뿐, 출력물의 길이를 자동으로 단축시키거나 서브 컨텍스트로 격리해 주지 않습니다.

---

## 80번 문제

**1. 문제 원문**

A platform architect is deciding whether a new 'require code owner review before merging billing changes' policy should be enforced through a CLAUDE.md instruction or through a settings.json permission rule with a hook. The policy must hold even if Claude decides, based on its own reasoning, that skipping review would be fine in a particular case. Which configuration choice is appropriate, and why?

A) Write it as a managed policy CLAUDE.md entry only, because managed policy is the sole CLAUDE.md tier that Claude cannot override regardless of its own reasoning

B) Write it as a CLAUDE.md instruction, because CLAUDE.md content carries the same enforcement guarantee as a technical control once it's committed to the project

C) Write it as a strongly worded instruction repeated in both the root CLAUDE.md and every subdirectory's CLAUDE.md, because repetition across the hierarchy is what converts guidance into enforcement

D) Implement it as a settings-based control such as a PreToolUse hook, because CLAUDE.md is context that shapes behavior but is not a hard enforcement layer Claude is guaranteed to obey

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Implement it as a settings-based control such as a PreToolUse hook, because CLAUDE.md is context that shapes behavior but is not a hard enforcement layer Claude is guaranteed to obey

**정답 및 해설:**

**핵심 개념**: 결정론적 제어(Technical Controls/Hooks) 대 비결정론적 가이드라인(Context/CLAUDE.md)
Claude Code에서 `CLAUDE.md`는 LLM의 행동 패턴을 안내하고 형성하는 시스템 프롬프트/컨텍스트 역할을 합니다. 반면, LLM의 자체 추론이나 미스판단과 관계없이 반드시 100% 준수되어야 하는 강력한 규칙은 코드 실행 전후를 프로그래밍 방식으로 제어하는 PreToolUse 훅과 같은 하드 테크니컬 제어(Technical Controls)를 이용해 강제해야 합니다.

**문제 상황 분석:**

* '결제 코드 변경 시 커밋/병합 전 코드 소유자 검토 필수'라는 엄격한 보안/운영 정책 수립 필요
* Claude가 자율적인 추론에 의해 "이번 건은 예외적으로 검토를 건너뛰어도 되겠다"고 판단하더라도 절대 무시될 수 없는 물리적 강제력 필요
* 단순 지침 제공 수준을 넘어선 물리적 차단 및 제어 메커니즘 선정 필요

**D번이 정답인 이유:**
`CLAUDE.md`에 작성된 모든 지시사항은 확률 모델인 LLM이 참조하는 '컨텍스트'일 뿐이므로, 모델의 판단이나 문맥 해석에 따라 생략될 가능성이 존재합니다. 따라서 LLM의 자율 판단과 무관하게 100% 강제되어야 하는 규칙은 `settings.json` 내 `PreToolUse` 훅을 사용해 도구 실행 단계에서 프로그램 레벨로 직접 검사하고 차단해야 합니다.

**오답 분석:**

- Option A (오답): `CLAUDE.md` 내에 Claude가 절대로 오버라이드할 수 없도록 보장된 'Managed policy' 계층이라는 것은 존재하지 않습니다.
- Option B (오답): `CLAUDE.md`에 지침을 커밋한다고 해서 소프트웨어적/기술적 제어 장치(Technical Control)와 동일한 수준의 강제 보장력이 생기지 않습니다.
- Option C (오답): 프롬프트를 여러 파일이나 하위 디렉터리에 반복 기재한다고 해서 소프트웨어 레벨의 결정론적 강제 레이어로 변환되는 것은 아닙니다.

---

## 82번 문제

**1. 문제 원문**

An engineer keeps pasting the same eight-step deployment checklist into chat whenever they ask Claude to help ship a release, and the same steps have started to also live as a growing section in the project's `CLAUDE.md`. They want the procedure available on demand without it consuming context on every single turn of every session. What should they do?

A) Move the checklist into a subagent definition under `.claude/agents/` with the deployment steps, since subagents load conditionally only when invoked, keeping the main session focused on the current task.

B) Keep expanding the `CLAUDE.md` section with detailed steps and failover instructions for multiple environments, since always-loaded content lets Claude consistently follow the full procedure on every request without prompting.

C) Convert the checklist into a `hooks` entry in `settings.json` configured as a `PreToolUse` hook that runs the deployment steps before any tool invocation, since hooks execute at defined events without consuming context.

D) Move the checklist into a `deploy-checklist` skill under `.claude/skills/`, since a skill's body only loads into context when it's invoked, unlike `CLAUDE.md` content which loads every session.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Move the checklist into a `deploy-checklist` skill under `.claude/skills/`, since a skill's body only loads into context when it's invoked, unlike `CLAUDE.md` content which loads every session.

**정답 및 해설:**

**핵심 개념**: Custom Skills의 온디맨드(On-demand) 컨텍스트 로딩
`CLAUDE.md`에 작성된 내용은 모든 세션의 매 턴마다 기본 컨텍스트로 로드되어 지속적으로 토큰을 소비합니다. 반면, `.claude/skills/` 하위에 작성된 커스텀 스킬은 평소에는 메타데이터만 상주하다가 사용자가 해당 스킬을 명시적으로 호출(Invoke)할 때에만 본문(Body) 내용을 컨텍스트로 로드하는 온디맨드 구조를 가집니다.

**문제 상황 분석:**

* 배포 시에만 드물게 쓰이는 8단계 체크리스트가 `CLAUDE.md`에 포함되어 있어 매 세션마다 불필요한 컨텍스트 토큰 소비가 발생함
* 엔지니어가 채팅에 매번 직접 붙여넣는 수고를 줄이고 필요할 때만 불러와 쓰고 싶어 함
* 매 턴마다 토큰을 차지하지 않으면서 필요 시에만 로드하는 메커니즘을 적용해야 함

**D번이 정답인 이유:**
체크리스트를 `.claude/skills/deploy-checklist`와 같이 커스텀 스킬로 분리하면, 평소 세션에서는 메인 컨텍스트를 전혀 압박하지 않습니다. 실제 배포 작업이 필요한 시점에 사용자가 스킬을 호출할 때만 스킬의 본문이 컨텍스트로 로드되므로, 컨텍스트 효율성과 재사용성을 동시에 확보하는 가장 정석적인 방법입니다.

**오답 분석:**

- Option A (오답): 서브에이전트(`.claude/agents/`)는 복잡하고 독립적인 태스크를 분리 수행할 때 사용되며, 순차적인 체크리스트 절차 지침을 온디맨드로 참조하기 위한 최선의 단위는 스킬(Skill)입니다.
- Option B (오답): `CLAUDE.md`를 계속 확장하면 모든 세션에서 고정적으로 소비되는 토큰 양이 커져 문제의 요구사항(필요할 때만 로드)에 직접 반합니다.
- Option C (오답): `PreToolUse` 훅은 도구가 실행되기 전에 프로그래밍 방식으로 인자를 검사하거나 차단하는 메커니즘이며, 배포 체크리스트 절차 지침을 로드하는 용도로 적절하지 않습니다.

---

## 83번 문제

**1. 문제 원문**

A team lead wants Claude Code to implement a CSV-to-JSON conversion utility whose column-to-field mapping rules are difficult to describe precisely in words, since the exact handling of empty cells, quoted commas, and duplicate headers matters. Which approach best sets up an effective iterative refinement loop before implementation begins?

A) Give Claude a few sample input rows paired with the exact expected JSON output including one row with an empty cell and one with a quoted comma, before asking it to write the converter.

B) Instruct Claude to select the most popular CSV parsing library from GitHub, implement the converter using that library, and rely on its default behaviors for handling empty cells and quoted commas.

C) Ask Claude to write the full converter first, without providing any example rows, then describe the handling of empty cells and quoted commas verbally once the initial output on a small CSV file shows unexpected results.

D) Tell Claude to implement the converter, adding TODO comments for any edge cases like empty cells or quoted commas it cannot resolve from the prompt, then proceed to the next task without further iteration.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Give Claude a few sample input rows paired with the exact expected JSON output including one row with an empty cell and one with a quoted comma, before asking it to write the converter.

**정답 및 해설:**

**핵심 개념**: 예시 기반 프롬프트(Few-shot Prompting / Test-driven Prompting) 및 예외 처리 구체화
말로 명확히 설명하기 어려운 복잡한 데이터 변환 로직이나 Edge Case(빈 셀, 따옴표 안의 쉼표 등)를 처리할 때는 구체적인 입력과 예상 출력의 Pair(입출력 예시)를 제공하는 방식이 가장 효과적입니다. 이를 통해 Claude는 모호한 텍스트 설명 대신 입출력 간의 변화 패턴을 명확히 파악하여 요구사항에 정확히 부합하는 코드를 작성할 수 있습니다.

**문제 상황 분석:**

* 말로 정확히 정의하기 어려운 CSV-to-JSON 매핑 규칙 및 예외 상황(빈 셀, 따옴표 내 쉼표, 중복 헤더 등) 존재
* 구현 전 요구사항을 명확히 정의하고, 모델과 반복적으로 코드를 다듬어 나갈(Iterative Refinement Loop) 최적의 프롬프팅 방식이 필요함

**A번이 정답인 이유:**
변환 로직을 코드로 구현하기 전에 예외 케이스(빈 셀, 따옴표 쉼표 등)가 포함된 샘플 입력 데이터와 이에 대응하는 정확한 JSON 결과 데이터를 Pair로 제공하면, Claude가 모호함 없이 변환 규칙을 완벽히 이해할 수 있으며, 이후 작성된 코드가 해당 요구사항을 충족하는지 테스트하며 다듬어 나가는 최적의 피드백 루프를 형성할 수 있습니다.

**오답 분석:**

- Option B (오답): 외부 라이브러리의 기본 동작(Default behaviors)에 완전히 의존하는 것은 프로젝트의 고유한 도메인 요구사항이나 특수한 Edge Case를 충족하지 못할 위험이 큽니다.
- Option C (오답): 예시 없이 전체 코드를 먼저 작성하게 하면 잘못된 전제로 구현될 가능성이 높으며, 구두/텍스트 설명만으로 예외 처리를 다듬는 것은 말로 설명하기 어렵다는 문제 전제와 상충됩니다.
- Option D (오답): 엣지 케이스를 TODO 주석으로 남겨두고 검증/개선(Iteration) 없이 다음 작업으로 넘어가는 것은 유틸리티 완성을 포기하는 방식입니다.

---

## 84번 문제

**1. 문제 원문**

While reviewing a diff from Claude Code that adds a background job scheduler, an architect notices two problems: the retry backoff logic uses the same shared timer instance that the job-locking logic also relies on to prevent double execution, so changing one affects the other; and separately, a log message uses the wrong log level and needs a one-word fix. How should the architect sequence feedback on these two problems?

A) Report the log-level fix as a separate immediate change requiring confirmation, then after it is resolved describe the retry backoff and job-locking interaction that shares the same timer, ensuring they are addressed together and not conflated with the log-level fix.

B) Describe the retry backoff and job-locking interaction in one detailed message because they depend on the same shared timer, and separately note the log-level fix as an unrelated change that should be addressed separately.

C) Combine all three items—the retry backoff logic, the job-locking logic, and the log-level fix—into a single message and instruct Claude to treat them as one inseparable change that must be implemented together due to their shared timer dependency.

D) List all three issues as a numbered list, with each item named by its symptom (e.g., 'retry backoff', 'job-locking', 'log-level') while intentionally leaving out the fact that the retry backoff and job-locking logic are coupled through the shared timer.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Describe the retry backoff and job-locking interaction in one detailed message because they depend on the same shared timer, and separately note the log-level fix as an unrelated change that should be addressed separately.

**정답 및 해설:**


**핵심 개념**: **LLM 프롬프트 및 코드 피드백 모범 사례 (Prompt Engineering & Context Grouping)**
AI 코딩 에이전트(Claude Code 등)에 피드백을 전달할 때는 의존성이 있는 논리 구조는 하나의 맥락으로 묶고, 의존성이 없고 성격이 완전히 다른 독립적 수정 사항은 분리하여 전달해야 모델의 환각이나 엉뚱한 결합을 방지할 수 있습니다.

**문제 상황 분석:**
- 재시도 백오프(retry backoff)와 작업 잠금(job-locking)은 공유 타이머 인스턴스라는 동일한 의존성을 가지고 서로 영향을 주는 상호연관적 문제입니다.
- 로그 수준(log level) 변경은 단순 오타/단어 수정 수준의 무관한 독립적 문제입니다.
- 아키텍트는 두 커플링된 문제와 하나의 독립된 문제를 AI에게 효율적으로 분리/그룹화하여 전달하는 방법을 찾아야 합니다.

**B번이 정답인 이유:**
- 동일한 공유 타이머 인스턴스를 사용하는 두 로직(재시도 백오프, 작업 잠금)은 하나의 메시지에 상세히 묶어 설명함으로써 LLM이 두 로직 간의 상호작용과 타이머 공유 문제를 한 번에 이해하고 해결할 수 있게 합니다.
- 로그 수준 수정은 상호작용 로직과 무관한 변경 사항이므로 별도의 지시로 구분하여 처리하게 하는 것이 가장 명확하고 효과적인 피드백 전달 방식입니다.

**오답 분석:**
- Option A (오답): 로그 수준 수정을 단순한 순서상 이유로 먼저 처리할 때까지 기다렸다가 다음 피드백을 진행하는 식의 불필요한 직렬화(sequential block)는 개발 피드백 흐름을 비효율적으로 만듭니다.
- Option C (오답): 타이머 의존성과 아무 상관이 없는 로그 수준 수정까지 하나의 분리 불가능한(inseparable) 변경으로 묶어 버리면 모델이 오개념을 학습하거나 잘못된 코드 리팩토링을 유발합니다.
- Option D (오답): 두 로직이 공유 타이머로 결합(coupled)되어 있다는 핵심 원인/맥락을 숨긴 채 증상만 나열하면 AI가 근본적인 아키텍처 문제를 해결하지 못합니다.

---

## 85번 문제

**1. 문제 원문**

A developer builds a `/fix-issue` skill that expects an issue number as input, such as `/fix-issue 482`. When teammates invoke it without typing a number, they get confused about what to supply. Which frontmatter field should the developer add to `SKILL.md` so the autocomplete menu shows teammates what to type?

A) `disable-model-invocation: true`, which forces teammates to always type an issue number when invoking the command manually.

B) `arguments: issue-number`, which validates that the typed value is numeric before the skill is allowed to run.

C) `description: Requires an issue number argument`, which Claude reads aloud to the user before executing the skill.

D) `argument-hint: [issue-number]`, which displays a placeholder in the autocomplete menu without changing how the skill executes.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: `argument-hint: [issue-number]`, which displays a placeholder in the autocomplete menu without changing how the skill executes.

**정답 및 해설:**


**핵심 개념**: **Claude Code SKILL.md Frontmatter 구성 요소 (argument-hint)**
Claude Code의 커스텀 스킬 정의 파일(`SKILL.md`)은 메타데이터를 작성하는 Frontmatter 영역을 제공합니다. 이 중 `argument-hint` 필드는 사용자가 CLI 상에서 스킬(명령어)을 입력하거나 자동 완성을 사용할 때 입력해야 하는 인자의 안내문구(Placeholder)를 시각적으로 보여주는 역할을 합니다.

**문제 상황 분석:**
- 개발자가 `/fix-issue`라는 커스텀 스킬을 작성했으나 인자(이슈 번호)가 필수적인 구조입니다.
- 팀원들이 인자 입력 없이 명령어를 호출하여 어떤 값을 전달해야 할지 혼란을 겪고 있습니다.
- CLI 자동 완성(Autocomplete) 메뉴에서 입력 플레이스홀더를 통해 사용자에게 힌트를 제공할 수 있는 Frontmatter 설정이 필요합니다.

**D번이 정답인 이유:**
- `argument-hint` 필드는 CLI 자동 완성 UI에 플레이스홀더 텍스트(예: `[issue-number]`)를 노출하는 용도로 설계되었습니다.
- 스킬의 실제 동작 로직에는 영향을 주지 않으면서, 사용자가 명령어를 작성할 때 어떤 형태의 인자를 입력해야 하는지 명확하게 가이드를 제시합니다.

**오답 분석:**
- Option A (오답): `disable-model-invocation` 속성은 모델이 이 스킬을 자동으로 호출하는 것을 막고 사용자의 수동 호출만 허용할 때 사용되는 옵션이며, 자동 완성 힌트 표시 기능이 아닙니다.
- Option B (오답): Claude Code의 `SKILL.md` Frontmatter에는 인자 유효성 검사를 수행하는 `arguments:`라는 표준 설정 필드가 존재하지 않습니다.
- Option C (오답): `description` 속성은 스킬이 어떤 동작을 하는지 모델 및 사용자에게 알리는 설명글이며, Claude가 소리 내어 읽어주거나 자동 완성 메뉴의 인자 힌트 플레이스홀더로 동작하지 않습니다.

---

## 86번 문제

**1. 문제 원문**

An architect is evaluating whether a requested change to a billing module needs plan mode. The change touches one file, has a single obvious implementation matching an existing pattern used elsewhere in the same file, and does not affect any other module. Which factor most strongly indicates that direct execution, rather than plan mode, is the right choice here?

A) The change is confined to a single file, has one clear implementation path, and touches no other module in the codebase

B) The existing pattern being followed in the file was written by a different engineer than the one requesting this change

C) The change can be described to Claude in a single short sentence, regardless of how many modules it actually ends up touching

D) The billing module is business-critical, so every change to it should always go through the exact same fixed review process

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: The change is confined to a single file, has one clear implementation path, and touches no other module in the codebase

**정답 및 해설:**


**핵심 개념**: **Claude Code Plan Mode vs Direct Execution (플랜 모드 vs 직접 실행)**
Claude Code에서 Plan Mode(플랜 모드)는 아키텍처 구상, 여러 파일에 걸친 복잡한 리팩토링, 또는 구현 방향성이 모호하여 사전에 계획을 검토해야 할 때 사용됩니다. 반면 변경 범위가 단일 파일로 국한되고, 구현 경로가 매우 명확하며, 타 모듈에 부작용(side effect)을 주지 않는 단순 작업의 경우 Direct Execution(직접 실행)을 사용하는 것이 효율적입니다.

**문제 상황 분석:**
- 변경하려는 작업은 단 1개의 파일만 수정합니다.
- 동일 파일 내 기존 패턴을 그대로 따르는 명확하고 단일한 구현 경로가 존재합니다.
- 다른 모듈에 영향(side effect)을 주지 않는 격리된 작업입니다.

**A번이 정답인 이유:**
- 문제에서 제시된 조건(단일 파일 수정, 명확한 단일 구현 방식, 타 모듈 미영향)을 가장 직접적이고 충실하게 종합하여 설명하고 있습니다.
- 사전에 복잡한 탐색이나 모의 계획 수립 단계(Plan Mode)를 거칠 필요 없이, 바로 코드 수정 작업을 진행(Direct Execution)하기에 완벽한 조건입니다.

**오답 분석:**
- Option B (오답): 코드를 과거에 누가 작성했는지의 인적 요소는 플랜 모드와 직접 실행 중 어떤 방식을 선택할지의 기술적 판단 기준이 되지 않습니다.
- Option C (오답): 문장이 짧다고 해서 영향 범위가 작은 것은 아닙니다. 실제로 결과적으로 여러 모듈을 수정해야 하는 작업이라면 짧은 설명과 상관없이 반드시 Plan Mode를 통해 사이드 이펙트를 검토해야 합니다.
- Option D (오답): 비즈니스 중요도가 높더라도 변경 범위와 복잡도가 매우 작다면 모든 작업에 무조건 동일한 엄격한 계획 단계를 강제하는 것은 불필요한 오버헤드를 발생시킵니다.

---

## 87번 문제

**1. 문제 원문**

An engineer launches Claude Code from the `services/billing/` directory inside a larger repository. The repository contains three CLAUDE.md files: one at the repository root, one at `services/billing/CLAUDE.md`, and one at `services/billing/reports/CLAUDE.md`. The engineer has not yet read or edited any files in the `services/billing/reports/` subdirectory. At the moment the session starts, which files are loaded into context?

A) Only the root CLAUDE.md loads at launch; `services/billing/` and the `reports` subdirectory file both wait until Claude reads a file there.

B) Only `services/billing/CLAUDE.md` loads, since directory-level files never combine with ancestor files unless explicitly imported first.

C) All three CLAUDE.md files load immediately, because Claude Code always preloads every CLAUDE.md found anywhere under the working directory.

D) The root and `services/billing/CLAUDE.md` load at launch; `reports/CLAUDE.md` loads later, only when Claude reads a file in that subdirectory.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: The root and `services/billing/CLAUDE.md` load at launch; `reports/CLAUDE.md` loads later, only when Claude reads a file in that subdirectory.

**정답 및 해설:**


**핵심 개념**: **Claude Code의 CLAUDE.md 컨텍스트 로딩 계층 구조 및 온디맨드 로딩 (On-Demand Loading)**
Claude Code는 세션 실행 시 작업 디렉터리(Working Directory)와 그 상위(Ancestor) 상위 디렉터리의 `CLAUDE.md` 파일들을 자동으로 병합하여 기본 컨텍스트로 로드합니다. 반면, 하위 디렉터리(Subdirectory)에 위치한 `CLAUDE.md` 파일은 세션 시작 시 즉시 로드되지 않고, 모델이 해당 하위 디렉터리 내의 파일을 접근/읽기 시작할 때 비로소 컨텍스트에 추가(On-demand)됩니다.

**문제 상황 분석:**
- 세션 시작 위치(작업 디렉터리): `services/billing/`
- 존재 파일:
  1. 루트 `CLAUDE.md` (상위 디렉터리)
  2. `services/billing/CLAUDE.md` (현재 작업 디렉터리)
  3. `services/billing/reports/CLAUDE.md` (하위 디렉터리)
- 엔지니어는 아직 `services/billing/reports/` 하위 디렉터리 내의 어떠한 파일도 탐색하거나 편집하지 않았습니다.

**D번이 정답인 이유:**
- 세션 시작 시 Claude Code는 현재 실행 위치(`services/billing/`)의 `CLAUDE.md`와 상위 경로인 루트의 `CLAUDE.md`를 함께 초기 컨텍스트로 로드합니다.
- 하위 경로인 `reports/CLAUDE.md`는 세션 시작 시점에는 로드되지 않으며, 향후 Claude가 해당 하위 디렉터리의 파일(예: `reports/` 내 파일)을 조작하거나 읽을 때 비로소 지연 로딩(Lazy Loading)됩니다.

**오답 분석:**
- Option A (오답): 현재 작업 디렉터리에 위치한 `services/billing/CLAUDE.md` 역시 실행 즉시 상위 루트 파일과 함께 로드되므로 루트만 로드된다는 설명은 틀렸습니다.
- Option B (오답): Claude Code는 상위 경로의 `CLAUDE.md` 설정들을 계층적으로 계속 병합(Combine)하므로 상위 파일과 결합되지 않는다는 설명은 오답입니다.
- Option C (오답): 작업 디렉터리 하위에 존재하는 모든 `CLAUDE.md`를 무조건 사전 로드(Preload)하지 않습니다. 하위 디렉터리의 파일은 해당 경로에 접근할 때 온디맨드로 로드됩니다.

---

## 88번 문제

**1. 문제 원문**

While in plan mode, an architect notices that Claude keeps reading files and running read-only search commands without prompting for approval on each one, even though no edits have occurred. What most plausibly explains this behavior?

A) Plan mode inherently blocks all edits and does not require approval for read operations, as the mode's read-only guarantee makes approval prompts unnecessary.

B) Plan mode has silently switched over to acceptEdits mode partway through this session, which is why operations proceed without prompts

C) Read-only commands are permanently exempt from every permission mode in Claude Code, no matter which mode is currently active

D) The architect's local settings have disabled every single permission check for the remainder of this particular session entirely

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Plan mode inherently blocks all edits and does not require approval for read operations, as the mode's read-only guarantee makes approval prompts unnecessary.

**정답 및 해설:**


**핵심 개념**: **Claude Code Plan Mode의 권한 모델 (Plan Mode Permission Model)**
Claude Code의 Plan Mode(플랜 모드)는 코드베이스를 분석하여 실행 계획(Plan)을 세우는 읽기 전용(Read-Only) 탐색 모드입니다. 이 모드에서는 모든 파일 수정 및 파괴적인 명령어가 시스템 차원에서 엄격히 차단되므로, 안전한 읽기 전용(Read-only) 조회 및 검색 작업에 대해서는 매번 승인을 묻는 프롬프트를 띄우지 않고 자동으로 진행합니다.

**문제 상황 분석:**
- 사용자가 Claude Code를 Plan Mode로 실행 중입니다.
- Claude가 승인 요청(Prompt) 없이 파일 읽기 및 읽기 전용 검색 명령을 계속 수행하고 있습니다.
- 코드 변경/수정(Edit) 작업은 단 한 건도 발생하지 않고 있습니다.

**A번이 정답인 이유:**
- Plan Mode의 설계 원칙상, 이 모드는 코드베이스를 변경하는 모든 수정 행위를 원천 차단합니다.
- 변경이 불가능한 안전한 읽기 전용 상태가 보장되기 때문에 사용자에게 매번 읽기 승인을 요청할 필요가 없으므로 프롬프트 없이 빠르게 조회가 수행됩니다.

**오답 분석:**
- Option B (오답): Plan Mode가 사용자 개입 없이 임의로 `acceptEdits` 모드로 자동 전환(silently switch)되는 동작은 존재하지 않습니다.
- Option C (오답): 일반 모드(Normal/Default mode)에서는 설정이나 위험도에 따라 읽기/실행 명령도 승인을 요구할 수 있으므로, 모든 모드에서 읽기 명령이 영구히 면제(permanently exempt)된다는 설명은 틀렸습니다.
- Option D (오답): 세션 전체의 모든 권한 검사를 완전히 끌어버린 특수한 로컬 설정 때문이 아니라, Plan Mode 자체의 기본 정식 동작 메커니즘입니다.

---

## 89번 문제

**1. 문제 원문**

During a long working session, an engineer triggers a context compaction. Afterward, they notice Claude has stopped following an instruction that was in a CLAUDE.md file located deep inside a subdirectory the engineer had already worked in earlier in the session, while an instruction from the project-root CLAUDE.md is still being followed correctly. What explains this difference in behavior?

A) Compaction only preserves instructions in the first 200 lines of a session, so the subdirectory file's later position caused it to drop

B) Root CLAUDE.md is re-read and re-injected after compaction, but nested CLAUDE.md files reload only when Claude next reads a file there

C) Compaction corrupts nested CLAUDE.md files on disk, so the subdirectory file must be re-created before its instructions work again

D) Nested CLAUDE.md files are deleted from context permanently after compaction and can only be restored by starting an entirely new session

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Root CLAUDE.md is re-read and re-injected after compaction, but nested CLAUDE.md files reload only when Claude next reads a file there

**정답 및 해설:**


**핵심 개념**: **Claude Code의 컨텍스트 압축(Compaction) 및 계층적 CLAUDE.md 재로드 메커니즘**
Claude Code에서 컨텍스트 압축(Compaction)이 발생하면 이전까지 요약/누적되었던 대화 및 임시 컨텍스트가 정리됩니다. 이때 프로젝트 루트의 `CLAUDE.md`는 시스템의 핵심 가이드라인이므로 압축 직후 자동으로 재읽기(re-read)되어 컨텍스트에 다시 주입(re-inject)됩니다. 그러나 하위 디렉터리(Subdirectory)에 존재하는 중첩된 `CLAUDE.md` 파일들은 압축 시 컨텍스트에서 제외되며, 향후 Claude가 해당 하위 디렉터리 내의 파일에 다시 접근할 때 온디맨드로 재로드(Reload)됩니다.

**문제 상황 분석:**
- 긴 세션 진행 중 컨텍스트 압축(Compaction)을 실행함.
- 세션 이전에 방문했던 하위 디렉터리의 `CLAUDE.md` 지시 사항을 Claude가 더 이상 따르지 않음.
- 프로젝트 루트의 `CLAUDE.md` 지시 사항은 압축 이후에도 여전히 정상적으로 적용됨.

**B번이 정답인 이유:**
- 컨텍스트 압축 후 프로젝트 루트의 `CLAUDE.md`는 자동으로 재주입되어 계속 적용되지만, 하위 디렉터리의 `CLAUDE.md`는 압축 과정에서 지워진 상태가 됩니다.
- 해당 하위 디렉터리 안의 파일에 Claude가 다시 접근하여 읽는 시점이 되어야만 해당 하위 `CLAUDE.md`가 다시 로드되므로, 그전까지는 지시 사항을 따르지 않는 현상이 발생합니다.

**오답 분석:**
- Option A (오답): Compaction이 세션의 처음 200줄만 보존한다는 규칙은 존재하지 않습니다.
- Option C (오답): Compaction은 메모리 상의 컨텍스트를 정리할 뿐 디스크에 저장된 실제 파일들을 손상(corrupt)시키지 않습니다.
- Option D (오답): 중첩된 `CLAUDE.md`는 영구 삭제되는 것이 아니라, 해당 디렉터리의 파일을 다시 탐색/읽을 때 온디맨드로 다시 복구(재로드)됩니다.

---

## 91번 문제

**1. 문제 원문**

An architect is designing a configuration strategy for a company rolling out Claude Code to all engineering teams. They need security and compliance instructions that every developer receives on every machine, in every repository, and that individual developers or teams cannot disable through their own settings. Which approach satisfies this requirement?

A) Commit a `CLAUDE.md` file to the root of each repository, as source control ensures every team member receives the same project-level instructions.

B) Populate each developer's personal `~/.claude/CLAUDE.md` via a one-time onboarding script, which developers can then edit as needed.

C) Place a `CLAUDE.local.md` at the root of each repository, distributed by an onboarding script and added to `.gitignore` to prevent accidental commits.

D) Deploy a `managed-settings.json` file to the system directory (e.g., `/etc/claude-code/` on Linux) using the organization's configuration management system, as it enforces policies that override developer and project settings.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Deploy a `managed-settings.json` file to the system directory (e.g., `/etc/claude-code/` on Linux) using the organization's configuration management system, as it enforces policies that override developer and project settings.

**정답 및 해설:**


**핵심 개념**: **Claude Code Enterprise/Managed Configuration (관리형 설정 및 우선순위)**
Claude Code 설정 및 정책 적용 구조에는 엄격한 우선순위(Precedence) 규칙이 존재합니다. 조직 전체 차원의 관리자 정책(Enterprise / Managed Settings)은 시스템 중앙 위치(예: Linux의 `/etc/claude-code/managed-settings.json`)에 배치되며, 사용자 개인 설정(`~/.claude/`)이나 프로젝트별 설정(`.claude/`)보다 항상 상위의 최고 우선순위를 가집니다. 이를 통해 개별 개발자나 팀이 임의로 비활성화하거나 무시할 수 없도록 중앙 통제 정책을 강제합니다.

**문제 상황 분석:**
- 모든 엔지니어링 팀의 모든 머신, 모든 리포지토리에 일관되게 보안/컴플라이언스 지침을 적용해야 합니다.
- 개발자 개인이나 팀이 자체 설정을 통해 이를 비활성화하거나 수정할 수 없도록 강제(Enforce)해야 합니다.

**D번이 정답인 이유:**
- 시스템 디렉터리(예: `/etc/claude-code/managed-settings.json`)에 배포되는 중앙 관리형 설정(`managed-settings.json`)은 최우선순위(Enterprise/Managed 수준)로 적용됩니다.
- 이는 개발자 개인 환경 설정 및 프로젝트 레벨 설정을 재정의(Override)하고 우회를 차단하므로, 회사 전체 차원의 보안/컴플라이언스 강제 요구사항을 정확히 충족시킵니다.

**오답 분석:**
- Option A (오답): 프로젝트 루트의 `CLAUDE.md`는 프로젝트 수준 설정에 불과하며, 개발자가 로컬 설정으로 우회하거나 커밋을 수정/삭제할 수 있어 중앙 강제성이 부족합니다.
- Option B (오답): 개인 홈 디렉터리의 `~/.claude/CLAUDE.md`는 개발자가 자유롭게 수정할 수 있으며 우선순위도 중앙 정책보다 낮습니다.
- Option C (오답): `CLAUDE.local.md`는 개인 로컬 전용 파일로 `.gitignore` 처리되어 추적되지 않으므로, 개발자가 손쉽게 수정하거나 삭제할 수 있어 중앙 보안 정책 강제용으로 적합하지 않습니다.

---

## 92번 문제

**1. 문제 원문**

A senior engineer says a proposed change to the checkout service is small enough that it doesn't need plan mode, but a teammate insists it does because it touches a database schema. Investigation shows the change adds one nullable column to one table and updates one model file to read it, with no other files affected and no schema decisions still open. Who has correctly assessed the situation?

A) Neither, since schema changes should bypass both plan mode and direct execution entirely and go straight to a migration tool

B) The senior engineer, since the change is confined to one table and one file with a single clear implementation, matching direct execution

C) The teammate, since any schema change is inherently architectural by nature and must always go through plan mode no matter how small it is

D) Neither, since plan mode should be the default for every change touching the checkout service given its business importance

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: The senior engineer, since the change is confined to one table and one file with a single clear implementation, matching direct execution

**정답 및 해설:**


**핵심 개념**: **Claude Code Plan Mode vs Direct Execution 판단 기준**
Claude Code에서 Plan Mode(플랜 모드)는 여러 파일에 걸친 아키텍처 변경, 모호한 구현 요구사항, 혹은 설계에 관한 미결정 사안이 있을 때 탐색과 계획 수립을 위해 사용됩니다. 반면 작업의 범위가 매우 명확하고, 추가 결정 사항이 없으며, 단일 파일 및 명확한 경로만 수정되는 작업은 사전 계획 단계 없이 바로 코드를 수정하는 Direct Execution(직접 실행)이 적합합니다.

**문제 상황 분석:**
- 변경 내용: 1개 테이블에 nullable 컬럼 1개 추가 + 이를 읽는 1개 모델 파일 수정.
- 다른 파일에는 영향 없음 (사이드 이펙트 없음).
- 아직 결정되지 않은 스키마 이슈나 불확실성 없음 (설계 완료 상태).
- 시니어 엔지니어는 직접 실행을, 동료는 'DB 스키마 변경'이라는 이유만으로 플랜 모드를 주장함.

**B번이 정답인 이유:**
- DB 스키마를 다룬다는 이유만으로 무조건 플랜 모드를 써야 하는 것은 아닙니다.
- 이번 변경 작업은 1개의 테이블과 1개의 파일에 국한된 매우 명확하고 고립된 작업이며 미결정 요소가 전혀 없습니다. 따라서 직접 실행(Direct Execution) 조건에 완벽히 부합하므로 시니어 엔지니어의 판단이 옳습니다.

**오답 분석:**
- Option A (오답): Claude Code를 통한 코드 및 마이그레이션 파일 작성 시 플랜 모드나 직접 실행을 아예 우회해야 한다는 규칙은 없습니다.
- Option C (오답): 아무리 작은 스키마 변경이라도 무조건 플랜 모드를 거쳐야 한다는 제약은 존재하지 않으며, 단순/명확한 작업은 직접 실행이 훨씬 효율적입니다.
- Option D (오답): 서비스의 비즈니스 중요도만으로 단순 컬럼 추가 작업에까지 매번 플랜 모드를 강제하는 것은 불필요한 오버헤드를 유발합니다.

---

## 93번 문제

**1. 문제 원문**

A CI job runs `claude -p "apply the lint fixes" --permission-mode acceptEdits`, but the run aborts partway through when Claude attempts to invoke a network request to fetch an updated dependency list. Why did this specific action fail to auto-approve under acceptEdits, even though file edits earlier in the same run went through without prompting?

A) acceptEdits only applies to the first tool call in a run, so while it auto-approved earlier file edits, the later network request to fetch dependency lists required interactive approval and caused the abort.

B) acceptEdits auto-approves file writes and common filesystem commands like mkdir, mv, and cp, but other shell commands and network requests require an --allowedTools entry or a permissions.allow rule.

C) Network requests are always blocked outright in print mode, meaning the attempt to fetch an updated dependency list would have been stopped regardless of acceptEdits or any other permission configuration.

D) The job needed the --bare flag alongside acceptEdits, since acceptEdits has no effect at all unless bare mode is also enabled; without --bare, the network request to fetch dependency lists required interactive approval and caused the abort.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: acceptEdits auto-approves file writes and common filesystem commands like mkdir, mv, and cp, but other shell commands and network requests require an --allowedTools entry or a permissions.allow rule.

**정답 및 해설:**


**핵심 개념**: **Claude Code 권한 모드 (`acceptEdits` Scope & CLI Permissions)**
`--permission-mode acceptEdits` 옵션은 로컬 파일 생성/수정/삭제 및 기본 파일 시스템 명령어(`mkdir`, `mv`, `cp` 등)를 대화형 프롬프트 없이 자동 승인(Auto-approve)해 줍니다. 하지만 네트워크 요청을 동반하는 커맨드나 일반 임의 쉘 명령어(Shell execution/Network requests)는 파일 수정 범주를 벗어나므로 `acceptEdits`만으로 자동 승인되지 않으며, 별도의 `--allowedTools` 명시 또는 `permissions.allow` 규칙 설정이 필요합니다.

**문제 상황 분석:**
- CI 작업에서 non-interactive 실행을 위해 `claude -p ... --permission-mode acceptEdits`를 사용했습니다.
- 파일 수정(File edits) 작업은 프롬프트 없이 자동 승인되어 정상 처리되었습니다.
- 의존성 목록을 가져오는 네트워크 요청 시도 시 대화형 프롬프트를 띄울 수 없는 CI 환경 특성상 실행이 중단(abort)되었습니다.

**B번이 정답인 이유:**
- `acceptEdits` 모드가 커버하는 자동 승인 범위는 파일 편집 및 기본 파일 시스템 동작으로 제한됩니다.
- 네트워크 요청 및 일반 임의 쉘 명령어는 추가적인 보안 위험 요소로 분류되어 `acceptEdits` 스코프에 포함되지 않으므로, `--allowedTools`나 `permissions.allow`를 통해 명시적으로 권한을 허용하지 않으면 비대화형 CI 환경에서 거부되거나 중단됩니다.

**오답 분석:**
- Option A (오답): `acceptEdits`가 첫 번째 툴 호출에만 적용된다는 규칙은 없으며, 모든 파일 편집 횟수에 상관없이 정상 작동합니다.
- Option C (오답): 프린트 모드(`-p`)라고 해서 모든 네트워크 요청이 무조건 차단되는 것은 아닙니다. 권한 정책에 따라 허용할 수 있습니다.
- Option D (오답): `acceptEdits` 옵션이 동작하기 위해 `--bare` 플래그가 필수적이라는 조건은 전적으로 거짓입니다.

---

## 94번 문제

**1. 문제 원문**

A CI pipeline needs to parse Claude's response programmatically to decide whether a build step should fail. The team wants the reply to always match a specific JSON shape, for example an object with a boolean `passed` field and an array of `issues` strings, regardless of how Claude phrases its reasoning. Which invocation achieves this?

A) `claude -p "review this diff and reply only with passed:true/false and a list of issues" --output-format text`

B) `claude -p "review this diff" --output-format json --json-schema '{"type":"object","properties":{"passed":{"type":"boolean"},"issues":{"type":"array","items":{"type":"string"}}},"required":["passed","issues"]}'`

C) `claude -p "review this diff" --output-format stream-json --verbose --include-partial-messages`

D) `claude -p "review this diff" --append-system-prompt "Always respond with valid JSON matching {passed, issues}"`

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: `claude -p "review this diff" --output-format json --json-schema '{"type":"object","properties":{"passed":{"type":"boolean"},"issues":{"type":"array","items":{"type":"string"}}},"required":["passed","issues"]}'`

**정답 및 해설:**


**핵심 개념**: **Claude CLI의 Structured Output (JSON Schema / Output Formatting)**
Claude CLI에서 모델의 답변 형태를 프로그램(CI/CD 등)에서 파싱하기 적합한 구조로 고정하려면 `--output-format json` 및 `--json-schema` 플래그를 결합하여 사용해야 합니다. JSON Schema를 보장(Structured Outputs)함으로써 LLM 답변의 자유로운 서술 방식이나 추론 문장에 상관없이 명확히 정의된 스키마 구조 형태의 JSON만을 반환하도록 강제할 수 있습니다.

**문제 상황 분석:**
- CI 파이프라인에서 빌드 성공/실패 여부를 자동화 로직으로 판단해야 함.
- 모델의 자연어 표현 방식에 영향을 받지 않고, 항상 정해진 스키마(`passed` boolean, `issues` string array)의 JSON 응답을 신뢰성 있게 수신해야 함.
- 완벽히 구조화된 JSON 출력을 보장할 수 있는 CLI 옵션 구성이 필요함.

**B번이 정답인 이유:**
- `--output-format json` 옵션을 지정하여 전체 출력 형식을 JSON으로 설정하고, `--json-schema`를 제공하여 모델이 요구사항에 정확히 부합하는 객체 구조(`passed`: boolean, `issues`: array of strings, `required`: ["passed", "issues"])를 출력하도록 스키마 차원에서 엄격하게 강제(Enforce)합니다.

**오답 분석:**
- Option A (오답): 프롬프트 텍스트에만 형식 지시를 넣고 `--output-format text`로 호출하면 모델이 자연어 수식어나 마크다운 텍스트를 포함할 가능성이 매우 높아 파싱 실패 위험이 큽니다.
- Option C (오답): `stream-json` 및 `stream` 관련 옵션은 모델 답변의 실시간 생성 이벤트 및 메타데이터 이벤트를 스트리밍받는 용도이며, 특정 데이터를 구조화된 단일 JSON 형태로 스키마 고정하는 역할을 하지 않습니다.
- Option D (오답): 시스템 프롬프트에 "valid JSON" 문구를 추가하는 것만으로는 문법적 오류나 스키마 불일치가 발생할 여지가 있으며, 스키마 검증 및 강제(Structured Output) 기능을 대체할 수 없습니다.

---

