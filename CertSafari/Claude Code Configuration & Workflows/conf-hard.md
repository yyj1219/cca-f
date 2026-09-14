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

---

## 1번 문제 (원본 4번)

**어려운 이유** [원칙이 깨지는 예외, 덜 틀린 답 고르기] — `.claude/rules/`가 심볼릭 링크를 "일반 파일만 읽는다"고 잘못 기억하면 D를 고르게 되고, 디렉터리 링크만 된다는 A도 그럴듯해 순환 감지까지 포함한 정답을 고르기 어렵다.

**A large repository has a shared set of code-review rule files that several separate repositories across the organization should reuse verbatim, updated from one source of truth so all repositories stay in sync automatically when the source changes. An architect proposes placing symlinks inside each repository's `.claude/rules/` directory pointing back to a central rules folder maintained outside those repositories. Is this a supported way to organize rules, and what should the architect verify?**

A) It is supported only for whole symlinked directories, not individual files, so a single shared file like security.md cannot be linked alone

B) It is supported, but only when the shared rules sit in the same git repo as a submodule; symlinks to a separate repository never resolve

C) It is supported; `.claude/rules/` resolves symlinks normally with circular detection, so verify each repo's symlinks target the shared source

D) It is not supported; `.claude/rules/` only discovers regular files, so symlinked entries are silently ignored, forcing physical copies

---

**정답:**

**[C]번**: It is supported; `.claude/rules/` resolves symlinks normally with circular detection, so verify each repo's symlinks target the shared source

**정답 및 해설:**

**핵심 개념**: Claude Code의 `.claude/rules/` 디렉터리는 심볼릭 링크(symlink)를 정상적으로 지원하며, 순환 참조(circular reference) 감지 기능도 내장되어 있어 중앙에서 관리하는 공유 규칙을 각 저장소에 심볼릭 링크로 연결하는 방식이 공식적으로 지원됩니다.

**문제 상황 분석:**
- 조직 내 여러 저장소에서 단일 소스(Source of Truth)로 관리되는 코드 리뷰 규칙을 일관되게 재사용하고자 합니다.
- 각 저장소의 `.claude/rules/` 디렉터리 내부에 외부의 중앙 규칙 폴더를 가리키는 심볼릭 링크를 배치하는 접근 방식의 지원 여부를 확인해야 합니다.

**[C]번이 정답인 이유:**
Claude Code는 규칙 디렉터리(`.claude/rules/`) 탐색 시 심볼릭 링크를 정상적으로 추적 및 해결(resolve)하며, 무한 루프를 방지하기 위한 순환 감지 기능도 함께 제공합니다. 따라서 아키텍트는 각 저장소의 심볼릭 링크가 올바른 공유 소스를 정확히 가리키고 있는지 검증하는 것만으로 이 아키텍처를 안전하게 적용할 수 있습니다.

**오답 분석:**

- Option A (오답): 전체 디렉터리 링크만 지원하고 개별 파일 링크는 안 된다는 주장은 틀렸으며, **개별 파일과 폴더 모두 심볼릭 링크 연결이 가능**합니다.
- Option B (오답): 깃 서브모듈(submodule) 환경에서만 작동한다는 설명은 사실이 아니며, **표준 파일 시스템 심볼릭 링크도 정상 처리**됩니다.
- Option D (오답): `.claude/rules/`가 심볼릭 링크를 무시하고 일반 파일만 검색하므로 물리적 복사가 강제된다는 설명은 명백한 오답입니다.

---

## 2번 문제 (원본 10번)

**어려운 이유** [원칙이 깨지는 예외, 부분적으로만 맞는 오답] — `allowed-tools`가 최소 권한 제한 장치라는 상식이 정반대로 깨지며, "권한 프롬프트 사전 승인일 뿐 제한이 아니다"라는 예외를 알아야 B의 그럴듯한 모범사례 진술을 버릴 수 있다.

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

## 3번 문제 (원본 15번)

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

## 4번 문제 (원본 24번)

**어려운 이유** [복합 시나리오, 근본 원인 vs 증상 완화] — skill frontmatter 문법 오류로 보이는 증상이 실제로는 워크스페이스 신뢰 미수락 때문이며, allowed-tools 문법·위치를 고치는 오답들이 모두 그럴듯하다.

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

## 5번 문제 (원본 39번)

**어려운 이유** [원칙이 깨지는 예외, 유사 현상 구분] — claudeMdExcludes를 프로젝트 settings.json에만 둘 수 있다는 B와 settings.local.json 개인 범위인 D의 차이가 핵심이며, "팀원에게 영향 없이"라는 제약을 놓치면 B를 고른다.

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

## 6번 문제 (원본 45번)

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

## 7번 문제 (원본 46번)

**어려운 이유** [유사 현상 구분, 원칙이 깨지는 예외] — Glob/Bash로 경로가 노출되는 것과 파일을 실제로 Read하는 것을 구분해야 하며, "경로가 등장하면 트리거"라는 직관적 규칙을 적용하면 A로 틀린다.

**1. 문제 원문**

A developer configured `.claude/rules/api-security.md` scoped with paths: `["src/api/**/*.ts"]`. During a session, Claude runs `git status` and lists the repository tree with Glob, but has not yet opened any file under `src/api/`. Based on how path-scoped rules are triggered, what should the developer expect?

* **A)** The api-security.md rule loaded as soon as Glob returned a listing that included files under src/api/, because any tool invocation surfacing a matching path counts as a trigger.
* **B)** The api-security.md rule loaded automatically the moment the session started, because all rules under .claude/rules/ are loaded unconditionally regardless of their paths frontmatter.
* **C)** The api-security.md rule has not been loaded into context yet, because path-scoped rules load when Claude reads a file matching the pattern, not merely when it uses other tools like Glob or Bash.
* **D)** The api-security.md rule will never load during this session unless the developer explicitly runs the /memory command to force path-scoped rules to activate.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: The api-security.md rule has not been loaded into context yet, because path-scoped rules load when Claude reads a file matching the pattern, not merely when it uses other tools like Glob or Bash.

**정답 및 해설:**

**핵심 개념**: 경로 범위 지정 규칙 (Path-scoped Rules)
Claude Code 프로젝트 규칙(`.claude/rules/`)에서 `paths` 메타데이터(frontmatter)를 지정하면, Claude가 해당 경로 패턴과 일치하는 파일의 내용을 읽을 때(Read File) 비로소 해당 규칙 파일이 컨텍스트에 활성화되어 로드됩니다.

**문제 상황 분석:**
- 개발자가 `src/api/**/*.ts` 경로 패턴에만 적용되는 경로 범위 규칙(`api-security.md`)을 구성했습니다.
- Claude는 세션 중 `git status` 명령을 실행하고 Glob을 사용해 디렉터리 구조 목록을 확인했습니다.
- Claude는 아직 `src/api/` 경로 내부의 특정 파일 내용을 직접 읽거나 열어보지(Read) 않았습니다.

**C번이 정답인 이유:**
Claude Code에서 `paths` 조건이 걸린 규칙은 단순 디렉터리 목록 조회(Glob)나 CLI 명령어 실행(Bash) 등으로 관련 경로가 노출되는 것만으로는 활성화되지 않습니다. Claude가 해당 경로에 일치하는 파일의 실제 내용을 직접 읽는(Read/View) 작업이 발생할 때 비로소 컨텍스트에 탑재되므로 C번이 올바른 설명입니다.

**오답 분석:**

- Option A (오답): Glob 등의 도구 결과에 경로가 포함되었다고 해서 규칙이 로드되지 않으며, 파일의 직접적인 읽기 작업이 필요합니다.
- Option B (오답): `paths` 조건이 명시되어 있지 않은 모듈/일반 규칙만 세션 시작 시 무조건 로드됩니다. 경로 범위 지정 규칙은 조건부 동적 로드 방식을 따릅니다.
- Option D (오답): `/memory` 명령어를 명시적으로 실행해야만 활성화되는 것이 아니며, 해당 파일 패턴에 접근하여 읽을 때 자동으로 동적 로드됩니다.

<br>

---

## 8번 문제 (원본 53번)

**어려운 이유** [원칙이 깨지는 예외] — 9번에서 익힌 "프로젝트 스킬이 개인 스킬보다 우선"과 충돌해 보이는 상황이라, 동일 이름 개인 스킬로 로컬 오버라이드가 가능한지 판단이 흔들리고 D(다른 이름)도 안전해 보인다.

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

## 9번 문제 (원본 54번)

**어려운 이유** [덜 틀린 답 고르기, 부분적으로만 맞는 오답] — AGENTS.md 자동 폴백(C)과 심볼릭 링크(D) 모두 "중복 유지 회피"라는 결론 방향은 맞지만 Claude 전용 지시를 덧붙일 수 없거나 동작 전제가 틀려, @import가 최선임을 가려야 한다.

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

## 10번 문제 (원본 62번)

**어려운 이유** [원칙이 깨지는 예외] — 경로 매칭은 OS의 정규(canonical) 경로 기준이라는 일반 상식을 적용하면 B로 틀리며, 심볼릭 경로도 함께 매칭된다는 예외를 알아야 한다.

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

## 11번 문제 (원본 64번)

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

## 12번 문제 (원본 71번)

**어려운 이유** [복합 시나리오, 덜 틀린 답 고르기] — "스킬 본문은 한 번 로드되면 세션 내내 남는다"는 단서가 스킬 선택을 망설이게 만들지만, 그래도 매 세션 상시 로드보다 낫다는 상대 비교를 해야 한다.

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

## 13번 문제 (원본 74번)

**어려운 이유** [유사 현상 구분, 부분적으로만 맞는 오답] — allowed-tools가 실패한 이유(사전 승인일 뿐)와 해결책(disallowed-tools)을 둘 다 맞혀야 하며, context: fork로 샌드박스된다는 B가 겉보기에 설득력 있다.

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

## 14번 문제 (원본 78번)

**어려운 이유** [덜 틀린 답 고르기, 원칙이 깨지는 예외] — "더 구체적인 프로젝트 범위가 우선"이라는 계층 우선순위 상식을 적용하면 A를 고르지만, 로드 순서가 충돌 해소를 보장하지 않는다는 점이 정답이다.

**1. 문제 원문**

A developer has both a personal rule at `~/.claude/rules/formatting.md` (no `paths` field) and their team's project rule at `./.claude/rules/formatting.md` (no `paths` field) with conflicting formatting guidance. Both load unconditionally. According to Claude Code memory documentation, how should the developer understand load order and conflict resolution?

A) User-level rules load before project rules, and when they conflict, project-level rules always take higher priority because they are more specific.

B) Project rules load before user-level rules, so the personal `formatting.md` takes higher priority over the team's shared guidance.

C) User-level rules under `~/.claude/rules/` are ignored whenever a project also defines a same-named rules file, so only the project's `formatting.md` loads.

D) User-level rules load before project rules, but load order does not guarantee deterministic conflict resolution. When two unconditional rules conflict, Claude may choose one arbitrarily, so conflicting guidance should be removed rather than relying on precedence.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: User-level rules load before project rules, but load order does not guarantee deterministic conflict resolution. When two unconditional rules conflict, Claude may choose one arbitrarily, so conflicting guidance should be removed rather than relying on precedence.

**정답 및 해설:**

**핵심 개념**: Claude Code의 메모리 로드 순서 및 모호한 규칙의 비결정론적 선택
Claude Code는 사용자 레벨 규칙(`~/.claude/rules/`)을 프로젝트 레벨 규칙(`./.claude/rules/`)보다 먼저 로드합니다. 그러나 조건(`paths` 필드)이 지정되지 않은 두 무조건적 규칙이 모순/충돌하는 경우, 순서에 따라 확정적인 오버라이드가 일어나는 것이 아니라 Claude가 무작위/임의로(Arbitrarily) 어느 한쪽을 선택하게 됩니다.

**문제 상황 분석:**

* 사용자 규칙(`~/.claude/rules/formatting.md`)과 프로젝트 규칙(`./.claude/rules/formatting.md`)이 동시에 존재함
* 두 규칙 모두 `paths` 조건이 없어 프롬프트 컨텍스트에 무조건(Unconditionally) 함께 로드됨
* 두 지침이 서로 충돌할 때 로드 순서 및 디버깅 가이드라인을 바르게 이해하고 있어야 함

**D번이 정답인 이유:**
사용자 레벨 규칙이 프로젝트 레벨 규칙보다 먼저 로드되는 것은 사실이지만, 문서에서는 로드 순서가 충돌에 대한 결정론적(Deterministic) 해결을 보장하지 않는다고 밝히고 있습니다. 동일한 동작에 대해 두 파일이 상충되는 지침을 제공할 경우 Claude는 임의로 하나를 선택할 수 있으므로, 우선순위에 의존하기보다는 충돌하는 지침 자체를 찾아 제거하는 것이 공식 권장사항입니다.

**오답 분석:**

- Option A (오답): 사용자 레벨이 먼저 로드되는 것은 맞지만, `paths` 필드가 없는 무조건적인 규칙 충돌 시 프로젝트 레벨이 결정론적으로 무조건 우선권을 가진다고 보장할 수 없습니다. (Claude가 자의적으로 지침을 선택함)
- Option B (오답): 로드 순서(사용자 → 프로젝트) 설명이 반대로 되었을 뿐만 아니라, 개인 규칙이 공유 지침보다 무조건 우선한다는 내용도 잘못되었습니다.
- Option C (오답): 같은 이름의 프로젝트 규칙이 존재하더라도 사용자 레벨 규칙이 무시되거나 완전히 덮어씌워지지 않고 둘 다 컨텍스트로 로드됩니다.

---

## 15번 문제 (원본 82번)

**어려운 이유** [덜 틀린 답 고르기] — `.claude/agents/` 서브에이전트도 "호출될 때만 로드"라는 점에서 A가 실질적으로 맞는 방향이라, 절차적 체크리스트에는 스킬이 적합하다는 미세한 구분으로 갈린다.

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

## 16번 문제 (원본 87번)

**어려운 이유** [복합 시나리오, 유사 현상 구분] — 루트부터 시작 디렉터리까지의 조상 체인은 런치 시 로드되지만 하위 디렉터리는 지연 로드된다는 비대칭을 알아야 하며, A와 D 중 하나를 고르는 문제다.

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

## 17번 문제 (원본 88번)

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

## 18번 문제 (원본 89번)

**어려운 이유** [유사 현상 구분, 근본 원인 vs 증상 완화] — 압축 후 루트 지시는 유지되고 중첩 지시만 사라지는 동일한 증상에 대해, 파일 손상/영구 삭제 같은 설명과 "재주입 대상 차이"라는 실제 메커니즘을 구분해야 한다.

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

## 19번 문제 (원본 90번)

**어려운 이유** [덜 틀린 답 고르기, 부분적으로만 맞는 오답] — paths 생략 시 `**/*` 기본값으로 동작한다는 A는 "항상 적용"이라는 결론이 거의 맞아 보이지만 로드 시점이 다르며, 무조건 런치 로드라는 C와 미세하게 갈린다.

**1. 문제 원문**

A team places `.claude/rules/general-style.md` in the repo without adding a `paths` field to its YAML frontmatter, alongside a separate `.claude/rules/api.md` that does declare `paths: ["src/api/**/*.ts"]`. How will Claude Code treat `general-style.md` compared to `api.md`?

A) `general-style.md` loads only when Claude opens a file matching a default wildcard of `"**/*"`, functioning identically to `api.md` but with a broader glob pattern applied automatically.

B) `general-style.md` is ignored entirely because every file placed in `.claude/rules/` requires a `paths` field to be recognized before Claude Code will load it, while `api.md` loads correctly at launch as configured.

C) `general-style.md` loads at launch with the same priority as `.claude/CLAUDE.md`, since omitting the `paths` field makes the rule unconditional, while `api.md` only loads when Claude reads a matching file.

D) `general-style.md` and `api.md` both load only when Claude edits a file located inside the `.claude/rules/` directory itself, since rules files are scoped to their own containing directory by default.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: `general-style.md` loads at launch with the same priority as `.claude/CLAUDE.md`, since omitting the `paths` field makes the rule unconditional, while `api.md` only loads when Claude reads a matching file.

**정답 및 해설:**

**핵심 개념**: **Claude Code `.claude/rules/` 모듈식 규칙 및 경로 필터링 (Path-Scoped Rules)**
Claude Code에서는 프로젝트 가이드라인을 분할하여 관리하기 위해 `.claude/rules/*.md` 경로에 규칙 파일을 추가할 수 있습니다. 
- YAML 프론트매터에 `paths` 필드가 없으면 해당 규칙은 프로젝트 전체에 적용되는 무조건적 규칙(Unconditional Rule)이 되어 세션 시작 시(Launch) 프로젝트 루트 `CLAUDE.md`와 동일한 기본 컨텍스트로 로드됩니다.
- 반면 `paths: [...]` 필드가 지정되어 있으면 경로 조건부 규칙(Path-Scoped Rule)이 되어, Claude가 해당 패턴에 일치하는 파일(예: `src/api/**/*.ts`)을 읽을 때 비로소 컨텍스트에 동적으로 주입됩니다.

**문제 상황 분석:**
- `general-style.md` 파일은 YAML 프론트매터에 `paths` 필드가 생략(omitted)되어 있습니다.
- `api.md` 파일은 `paths: ["src/api/**/*.ts"]`로 특정 파일 경로가 지정되어 있습니다.
- 두 파일이 로드되는 시점과 방식의 차이를 묻고 있습니다.

**C번이 정답인 이유:**
- `paths` 필드를 명시하지 않은 `general-style.md`는 조건 없는 일반 규칙으로 처리되어 실행 초기(at launch)에 `.claude/CLAUDE.md`와 함께 기본 컨텍스트로 로드됩니다.
- 경로 필터가 명시된 `api.md`는 온디맨드 규칙으로 처리되어 지정된 경로(`src/api/**/*.ts`)에 해당하는 파일에 접근하여 읽을 때만 조건부로 로드되므로 C번의 설명이 완벽히 부합합니다.

**오답 분석:**
- Option A (오답): `paths`가 생략되었다고 해서 글로브 패턴(`"**/*"`) 조건부 로딩으로 전환되어 파일이 열릴 때까지 대기하는 것이 아니라, 시작 시 무조건 로드됩니다.
- Option B (오답): `.claude/rules/` 디렉터리 내의 파일에서 `paths` 필드는 필수(required) 항목이 아닙니다. 생략할 경우 전역/무조건 규칙으로 정상 동작합니다.
- Option D (오답): 규칙 파일이 `.claude/rules/` 디렉터리 내부 파일에 국한되어 적용된다는 스코프 규칙은 존재하지 않습니다.

---

## 20번 문제 (원본 95번)

**어려운 이유** [원칙이 깨지는 예외, 덜 틀린 답 고르기] — D는 path-scoped 규칙 동작을 정확히 서술하지만 타팀 파일을 수정해야 하고 발견 자체는 막지 못해, 결론 방향이 맞아 보이는 오답을 걸러야 한다.

**1. 문제 원문**

In a monorepo, Team A's rules live under `packages/team-a/.claude/rules/` and Team B's rules live under `packages/team-b/.claude/rules/`. An engineer on Team A working exclusively in `packages/team-a/` wants to avoid Team B's rules entering context while still letting Team A's own path-scoped rules load conditionally as normal. What should the engineer configure?

A) Delete the `paths` frontmatter from every rule in `packages/team-a/.claude/rules/` so those rules load unconditionally at launch, which the engineer hopes also stops `packages/team-b/.claude/rules/` files from ever being discovered.

B) Add a `claudeMdExcludes` entry in settings pointing to `packages/team-b/.claude/rules/**`, which skips Team B's rules files without affecting how Team A's path-scoped rules conditionally load based on their own paths frontmatter.

C) Set `autoMemoryEnabled` to false in the engineer's local project settings, which the engineer expects stops Claude Code from discovering any `.claude/rules/` directory located outside the current package.

D) Ensure that all rule files in `packages/team-b/.claude/rules/` include a `paths` frontmatter key with glob patterns scoped to `packages/team-b/`. Path-scoped rules only load when Claude works on matching files, so Team B's rules will not be triggered while the engineer works exclusively in `packages/team-a/`.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Ensure that all rule files in `packages/team-b/.claude/rules/` include a `paths` frontmatter key with glob patterns scoped to `packages/team-b/`. Path-scoped rules only load when Claude works on matching files, so Team B's rules will not be triggered while the engineer works exclusively in `packages/team-a/`.

**정답 및 해설:**

**핵심 개념**: **Claude Code의 경로 기반 규칙 (Path-Scoped Rules) 및 프론트매터 메커니즘**
Claude Code에서 `.claude/rules/*.md` 내에 존재하는 규칙 파일들은 YAML 프론트매터의 `paths` 글로브 패턴에 따라 동작합니다. `paths` 속성이 올바르게 지정된 규칙은 Claude가 해당 경로 패턴에 일치하는 파일(Read/Edit 등)을 조작하거나 탐색할 때만 컨텍스트에 동적으로 로드됩니다.

**문제 상황 분석:**
- 모노레포 환경에서 팀 A의 엔지니어는 `packages/team-a/` 내부 파일만 전적으로 수정 및 작성 중입니다.
- 팀 B의 규칙이 컨텍스트를 불필요하게 차지하는 것을 방지하고자 합니다.
- 팀 A 자체의 조건부 규칙(path-scoped rules)은 의도대로 정상 로드되어야 합니다.

**D번이 정답인 이유:**
- 팀 B의 규칙 파일들에 `paths: ["packages/team-b/**"]` 형태의 경로 범위를 프론트매터로 지정해 두면, Claude Code는 엔지니어가 `packages/team-b/` 하위 파일에 접근할 때만 해당 규칙을 로드합니다.
- 팀 A 엔지니어가 `packages/team-a/`에서만 작업하는 동안에는 팀 B의 파일 경로에 일치(Match)하지 않으므로, 팀 B의 규칙들이 컨텍스트로 진입하지 않게 되며, 팀 A 고유의 경로 범위 규칙은 원래대로 정상 조건부 로드됩니다.

**오답 분석:**
- Option A (오답): 팀 A 규칙에서 `paths` 프론트매터를 삭제하면 해당 규칙들이 시작 시 무조건(전역) 로드되는 규칙으로 변경될 뿐이며, 팀 B 규칙 파일의 탐색 및 로딩을 차단하지 못합니다.
- Option B (오답): `claudeMdExcludes` 항목은 특정 `CLAUDE.md` 파일들의 로딩을 예외 처리/건너뛰기 위해 제공되는 설정 필드이며, `.claude/rules/*.md` 마크다운 규칙 파일들을 제외하는 공식 지원 방식이 아닙니다.
- Option C (오답): `autoMemoryEnabled`는 AI의 자동 기억/학습 기능(`MEMORY.md`)에 관한 설정일 뿐이며, 작업 영역 외부의 `.claude/rules/` 디렉터리 탐색 및 스캔을 제한하는 설정이 아닙니다.

---
