# Claude Code Configuration & Workflows — 고난도 선별 문제

원본: conf-merged.md (전체 95문제 중 20문제 선별, 21%)

**선별 기준** — 아래 특징 중 하나 이상에 해당하는 문제 중, 특히 난이도가 높은 것:

- **덜 틀린 답 고르기** — 정답이 "명백히 옳은 것"이 아니라 "덜 틀린 것", 매력적인 오답이 2~3개
- **원칙이 깨지는 예외** — 외운 규칙을 그대로 적용하면 틀린다
- **유사 현상 구분** — 표면적으로 같아 보이는 두 현상, 같은 증상 다른 원인
- **복합 시나리오** — 여러 개념이 한 문제에 교차
- **근본 원인 vs 증상 완화** — 오답이 그럴듯한 완화책이고 정답은 구조적 해법
- **부분적으로만 맞는 오답** — 결론은 맞지만 근거가 틀린 선택지 등
- **길이가 단서 아님** — 정답이 가장 길고 서술적이지 않다

**재배치 안내** — 묻는 주제가 같은 것끼리 묶고, 유사 시나리오이지만 답이 다른 문제를 인접 배치했다. 괄호 안 원본 번호는 그대로다.

---

# A. .claude/rules/ 로딩 규칙 — paths 유무, 트리거 시점, 심링크, 우선순위

---

# B. CLAUDE.md 로딩 범위와 제외 — 답이 갈리는 쌍 39 vs 95

87: 시작 시 루트+cwd, 하위는 Read 때. 89: compaction 후 루트만 재주입. 39: 내 세션만 제외는 settings.local.json의 claudeMdExcludes. 95: 같은 요청인데 정답은 팀 B 규칙에 paths 부여(claudeMdExcludes 아님). 54: AGENTS.md는 @import.

## 6번 문제 (원본 87번)

**어려운 이유** [복합 시나리오, 유사 현상 구분] — 루트부터 시작 디렉터리까지의 조상 체인은 런치 시 로드되지만 하위 디렉터리는 지연 로드된다는 비대칭을 알아야 하며, A와 D 중 하나를 고르는 문제다.

**1. 문제 원문**

An engineer **launches** Claude Code from the `services/billing/` directory inside a larger repository. (▶ 특정 경로에서 Claude Code 시작했다고 명시했다. 문제 대충 읽으면 놓침 ◀) The repository contains three CLAUDE.md files: one at the repository root, one at `services/billing/CLAUDE.md`, and one at `services/billing/reports/CLAUDE.md`. The engineer has not yet read or edited any files in the `services/billing/reports/` subdirectory. At the moment the session starts, which files are loaded into context?

D) The root and `services/billing/CLAUDE.md` load at launch; `reports/CLAUDE.md` loads later, only when Claude reads a file in that subdirectory.

---

## 8번 문제 (원본 39번)

**어려운 이유** [원칙이 깨지는 예외, 유사 현상 구분] — claudeMdExcludes를 프로젝트 settings.json에만 둘 수 있다는 B와 settings.local.json 개인 범위인 D의 차이가 핵심이며, "팀원에게 영향 없이"라는 제약을 놓치면 B를 고른다.

**1. 문제 원문**

In a monorepo, an engineer working exclusively on `packages/web` finds that Claude Code's context is cluttered at startup with CLAUDE.md content from `packages/admin-dashboard` and several `packages/legacy-*` packages. This happens because the monorepo's root CLAUDE.md file uses import statements to load all subpackage CLAUDE.md files. The engineer wants these excluded from **their own sessions** without affecting other teammates who might work in those packages. What should they do?

~~A) Delete the CLAUDE.md files from packages/admin-dashboard and packages/legacy-* directly, since unused files should be removed from the repository~~

~~B) Add `claudeMdExcludes` patterns for those packages to the committed `.claude/settings.json` at the repository root, since exclusions can only be configured at the project scope~~

C) Ask the admin-dashboard and legacy package owners to move their CLAUDE.md files into `.claude/rules/`, since only root-level CLAUDE.md files are loaded across package boundaries

**D) Add `claudeMdExcludes` patterns for those packages to `.claude/settings.local.json`, since local settings apply only to that engineer's machine** => local 키워드가 있는 파일을 사용하는 점에 주의할 것!

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: D번**

**정답 및 해설:**

**문제 상황 분석:**
- 루트 `CLAUDE.md`에서 모든 하위 패키지의 `CLAUDE.md`를 불러와 컨텍스트가 불필요한 정보로 오염되고 있습니다.
- 엔지니어는 자신이 담당하지 않는 패키지(`admin-dashboard`, `legacy-*`)의 컨텍스트 로드를 차단하려 합니다.
- 조건: 다른 팀원들의 공유 환경이나 세션에는 영향을 주지 않고 **자신의 개발 세션에만** 제외 규칙을 적용해야 합니다.

**D번이 정답인 이유:**
`.claude/settings.local.json`은 개인 로컬 환경 전용 설정 파일입니다. 여기에 `claudeMdExcludes` 패턴(예: `["packages/admin-dashboard/**", "packages/legacy-*/**"]`)을 명시하면, 해당 엔지니어의 로컬 실행 환경에서만 지정된 경로의 `CLAUDE.md` 로드가 차단되며 타 팀원의 설정에는 아무런 영향을 주지 않습니다.

**오답 분석:**

- Option C (오답): 파일을 다른 디렉터리로 이동시키는 것은 팀 차원의 구조 변경을 수반하며, 로컬 환경만 격리하려는 목적에 부합하지 않습니다.
- Option D (정답): 개인 환경 전용 설정 파일인 `.claude/settings.local.json`에 제외 패턴을 기재합니다.

---

## 9번 문제 (원본 95번)

**어려운 이유** [원칙이 깨지는 예외, 덜 틀린 답 고르기] — D는 path-scoped 규칙 동작을 정확히 서술하지만 타팀 파일을 수정해야 하고 발견 자체는 막지 못해, 결론 방향이 맞아 보이는 오답을 걸러야 한다.

**1. 문제 원문**

In a monorepo, Team A's rules live under `packages/team-a/.claude/rules/` and Team B's rules live under `packages/team-b/.claude/rules/`. An engineer on Team A working exclusively in `packages/team-a/` wants to avoid Team B's rules entering context while still letting Team A's own path-scoped rules load conditionally as normal. What should the engineer configure?

~~A) Delete the `paths` frontmatter from every rule in `packages/team-a/.claude/rules/` so those rules load unconditionally at launch, which the engineer hopes also stops `packages/team-b/.claude/rules/` files from ever being discovered.~~

B) Add a `claudeMdExcludes` entry in **settings** pointing to `packages/team-b/.claude/rules/**`, which skips Team B's rules files without affecting how Team A's path-scoped rules conditionally load based on their own paths frontmatter.

~~C) Set `autoMemoryEnabled` to false in the engineer's local project settings, which the engineer expects stops Claude Code from discovering any `.claude/rules/` directory located outside the current package.~~

D) Ensure that all rule files in `packages/team-b/.claude/rules/` include a `paths` frontmatter key with glob patterns scoped to `packages/team-b/`. Path-scoped rules only load when Claude works on matching files, so Team B's rules will not be triggered while the engineer works exclusively in `packages/team-a/`.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: D번**

**정답 및 해설:**

**문제 상황 분석:**
- 모노레포 환경에서 팀 A의 엔지니어는 `packages/team-a/` 내부 파일만 전적으로 수정 및 작성 중입니다.
- 팀 B의 규칙이 컨텍스트를 불필요하게 차지하는 것을 방지하고자 합니다.
- 팀 A 자체의 조건부 규칙(path-scoped rules)은 의도대로 정상 로드되어야 합니다.

**D번이 정답인 이유:**
- `claudeMdExcludes`는 "절대 작업하지 않는 디렉터리"를 위해 settings.json에 설정하는 정적 제외 목록이며, 작업별로 켜고 끄는 스위치가 아닙니다.
- `paths` 프론트매터는 rules 파일 자체에 들어가 커밋되므로, 저장소를 클론하는 모두에게 한 번에 적용됩니다. 
- `paths`는 규칙 파일 자신이 적용 범위를 선언하므로 Team B가 디렉터리 구조를 바꿔도 함께 갱신되지만, `claudeMdExcludes`는 Team A 쪽 설정에 경로가 따로 박혀 있어 구조가 바뀌면 경고 없이 조용히 무력화됩니다. 그래서 `paths` 사용을 더 추천합니다.
- 팀 B의 규칙 파일들에 `paths: ["packages/team-b/**"]` 형태의 경로 범위를 프론트매터로 지정해 두면, Claude Code는 엔지니어가 `packages/team-b/` 하위 파일에 접근할 때만 해당 규칙을 로드합니다.

**오답 분석:**
- Option B (오답): `claudeMdExcludes` 항목은 특정 **`CLAUDE.md` 파일들의 로딩을 예외 처리/건너뛰기** 위해 settings.json에 제공되는 설정 필드입니다.
- Option C (오답): `autoMemoryEnabled`는 AI의 자동 기억/학습 기능(`MEMORY.md`)에 관한 설정일 뿐이며, 작업 영역 외부의 `.claude/rules/` 디렉터리 탐색 및 스캔을 제한하는 설정이 아닙니다.

---

# C. 스킬 — allowed-tools의 의미, 컨텍스트 비용, fork, 개인 오버라이드

10과 74: allowed-tools는 사전 승인일 뿐 제한 아님(제한은 disallowed-tools). 24: 워크스페이스 trust 전에는 grant 미적용. 71과 82: 가끔 쓰는 내용은 CLAUDE.md 대신 스킬. 15: fork+Explore는 CLAUDE.md 미로드. 53: ~/.claude/skills 동명 스킬로 개인 오버라이드.

---

## 13번 문제 (원본 24번)

**어려운 이유** [복합 시나리오, 근본 원인 vs 증상 완화] — skill frontmatter 문법 오류로 보이는 증상이 실제로는 워크스페이스 신뢰 미수락 때문이며, allowed-tools 문법·위치를 고치는 오답들이 모두 그럴듯하다.

**1. 문제 원문**

A contractor clones a repository containing a project skill at `.claude/skills/publish/SKILL.md` with `allowed-tools: Bash(npm publish *)` in its frontmatter. On first opening the project in Claude Code, a workspace trust dialog appears, but the contractor dismisses it without accepting. Invoking the skill still prompts for approval before running `npm publish`. What is the most likely explanation?

* _regardless of_ : ~에 상관없이
* _rather than_ : ~ 대신

~~A) The `npm publish` command must be listed under `arguments` rather than `allowed-tools` before Claude Code will treat it as pre-approved.~~

~~B) The `allowed-tools` field only applies to skills stored in `~/.claude/skills/`, so project-scoped skills always require manual approval regardless of trust.~~

~~C) The skill's frontmatter is missing a `context: fork` declaration, and `allowed-tools` only takes effect for skills that run in a forked subagent.~~

**D) The project's workspace trust dialog has not yet been accepted, so the `allowed-tools` grant from the checked-in project skill has not taken effect.**

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: D번**

**정답 및 해설:**

**문제 상황 분석:**
- 개발자가 프로젝트 스킬(`.claude/skills/publish/SKILL.md`)에 `allowed-tools: Bash(npm publish *)`를 명시함.
- 프로젝트 최초 진입 시 프롬프트된 **Workspace Trust Dialog**를 수락하지 않고 닫음(Dismiss).
- 스킬 실행 시 `npm publish`에 대한 자동 승인이 적용되지 않고 여전히 사용자 승인 창이 노출됨.

**D번이 정답인 이유:**
워크스페이스 신뢰를 수락하지 않으면 프로젝트에 포함된 스킬의 `allowed-tools` 사전 승인 권한 부여가 활성화되지 않습니다. 사용자가 해당 워크스페이스를 신뢰(Trust)한다는 명시적 승인을 하기 전까지는 보안을 위해 모든 명령어가 **수동 승인 모드**로 동작하게 됩니다.

**오답 분석:**

- Option A (오답): 명령어 자동 승인은 `allowed-tools` 프론트매터에 정의하는 것이 올바른 규칙이며, `arguments`에 적는 것은 잘못된 문법입니다.
- Option B (오답): `allowed-tools`는 전역 스킬(`~/.claude/skills/`)뿐만 아니라 프로젝트 범위 스킬(`.claude/skills/`)에도 적용 가능합니다. 단, 프로젝트 스킬은 워크스페이스 신뢰가 전제되어야 합니다.
- Option C (오답): `allowed-tools` 기능이 오직 `context: fork` 서브에이전트 스킬에서만 동작한다는 설명은 사실이 아닙니다.

---

## 15번 문제 (원본 82번)

**어려운 이유** [덜 틀린 답 고르기] — `.claude/agents/` 서브에이전트도 "호출될 때만 로드"라는 점에서 A가 실질적으로 맞는 방향이라, 절차적 체크리스트에는 스킬이 적합하다는 미세한 구분으로 갈린다.

**1. 문제 원문**

An engineer keeps pasting the same eight-step deployment checklist **into chat** whenever they ask Claude to help ship a release, and the same steps have started to also **live(존재하다)** as a **growing(점점 커지는)** section in the project's `CLAUDE.md`. They want the procedure available on demand without it consuming context on every single turn of every session. What should they do?

A) Move the checklist into a subagent definition under `.claude/agents/` with the deployment steps, since subagents load conditionally only when invoked, keeping the main session focused on the current task.

D) Move the checklist into a `deploy-checklist` skill under `.claude/skills/`, since a skill's body only loads into context when it's invoked, unlike `CLAUDE.md` content which loads every session.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: D번**

**정답 및 해설:**

**핵심 개념**: Custom Skills의 온디맨드(On-demand) 컨텍스트 로딩
`CLAUDE.md`에 작성된 내용은 모든 세션의 매 턴마다 기본 컨텍스트로 로드되어 지속적으로 토큰을 소비합니다. 반면, `.claude/skills/` 하위에 작성된 커스텀 스킬은 평소에는 메타데이터만 상주하다가 사용자가 해당 스킬을 명시적으로 호출(Invoke)할 때에만 본문(Body) 내용을 컨텍스트로 로드하는 온디맨드 구조를 가집니다.

**문제 상황 분석:**

* 배포 시에만 드물게 쓰이는 8단계 체크리스트가 `CLAUDE.md`에 포함되어 있어 매 세션마다 불필요한 컨텍스트 토큰 소비가 발생함
* 엔지니어가 채팅에 매번 직접 붙여넣는 수고를 줄이고 필요할 때만 불러와 쓰고 싶어 함
* 매 턴마다 토큰을 차지하지 않으면서 필요 시에만 로드하는 메커니즘을 적용해야 함

**A번이 정답이 아닌 이유:**
엔지니어는 Claude가 자기 세션 안에서 그 절차를 따라 작업하기를 원하지, 별도 인스턴스에 배포를 위임하고 요약만 받으려는 게 아닙니다. Subagent에 절차를 넣으면 실제 실행 주체가 분리되면서 메인 세션은 그 단계들을 직접 보지 못합니다.

**D번이 정답인 이유:**
체크리스트를 `.claude/skills/deploy-checklist`와 같이 커스텀 스킬로 분리하면, 평소 세션에서는 메인 컨텍스트를 전혀 압박하지 않습니다. 실제 배포 작업이 필요한 시점에 사용자가 스킬을 호출할 때만 스킬의 본문이 컨텍스트로 로드되므로, 컨텍스트 효율성과 재사용성을 동시에 확보하는 가장 정석적인 방법입니다.

---

## 16번 문제 (원본 15번)

**어려운 이유** [유사 현상 구분, 덜 틀린 답 고르기] — `context: fork`의 격리 탓이라는 A와 Explore 에이전트가 CLAUDE.md를 안 읽는다는 C가 증상은 동일해, 원인이 fork가 아니라 특정 내장 에이전트의 시작 컨텍스트라는 점을 구분해야 한다.

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

## 17번 문제 (원본 53번)

**어려운 이유** [원칙이 깨지는 예외] — 9번에서 익힌 "프로젝트 스킬이 개인 스킬보다 우선"과 충돌해 보이는 상황이라, 동일 이름 개인 스킬로 로컬 오버라이드가 가능한지 판단이 흔들리고 D(다른 이름)도 안전해 보인다.

**1. 문제 원문**

A project ships a shared `.claude/skills/commit/SKILL.md` skill that writes commit messages in a style one developer finds too terse for their own habits. The developer wants a personal richer version of that skill while continuing to invoke the same `/commit` slash command themselves. Teammates should continue to see the original project skill when they run `/commit`. What should they do?

* A) Edit `.claude/skills/commit/SKILL.md` with the richer commit guidelines, and rely on the change remaining uncommitted so only the developer's local experience uses it, while teammates' copies are unaffected.
* B) Create `~/.claude/skills/commit/SKILL.md` as a personal copy with the same name to locally override the project skill for this developer only, leaving the shared project skill unchanged for teammates.
* C) Add `disable-model-invocation: true` to the shared `.claude/skills/commit/SKILL.md` so that it no longer generates output and only the developer's personal instructions apply.
* D) Create a differently named skill, such as `~/.claude/skills/commit-verbose/SKILL.md`, so it's invoked separately and the shared project skill remains untouched for teammates.

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

---

# D. 헤드리스 실행과 권한 모드

45: 재현성은 --bare. 64: Bash 차단은 --disallowedTools. 88: plan mode는 읽기에 승인 불필요.

## 18번 문제 (원본 45번)

**어려운 이유** [덜 틀린 답 고르기, 근본 원인 vs 증상 완화] — stream-json 필터링·max-turns 제한은 출력을 후처리하는 증상 완화일 뿐이고, 자동 탐색 자체를 끄는 `--bare`를 알아야 재현성 요구를 만족한다.

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

## 19번 문제 (원본 64번)

**어려운 이유** [유사 현상 구분, 부분적으로만 맞는 오답] — stdin 파이프로 내용이 전달되니 Bash 권한이 불필요하다는 C는 "입력 경로"에 대해서는 참이지만 세션 중 Bash 호출 가능성 제거라는 요구를 만족하지 못해, 맞는 말과 정답을 구분해야 한다.

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

## 20번 문제 (원본 88번)

**어려운 이유** [부분적으로만 맞는 오답, 유사 현상 구분] — C의 "읽기 전용 명령은 모든 권한 모드에서 영구 면제"는 결론은 유사하지만 과잉 일반화이고, plan mode 자체의 읽기 전용 보장이 원인이라는 A와 구분해야 한다.

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
