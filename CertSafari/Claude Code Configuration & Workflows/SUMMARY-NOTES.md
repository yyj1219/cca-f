# Claude Code Configuration & Workflows — 학습용 핵심 요약 노트

모의시험 103문항(01–103) 기반.

**사용법**: "문제 신호"로 지문 키워드를 잡고 → "정답 키워드"를 고르고 → "함정 키워드"는 버린다.
모든 키워드는 **보기 원문에서 그대로 뽑은 8단어 이내 조각**이다. 이것만 눈에 들어와도 정답/오답이 갈린다.

---

## 0. 5초 판별 치트시트 (Decision Cheatsheet)

| 지문에 이게 보이면 | 정답은 이 방향 |
|---|---|
| several viable ways to split the code (여러 대안 존재) | plan mode |
| a decision between two competing library options | plan mode |
| inconsistent query patterns / the correct idiom differs by pattern | plan mode로 survey 후 실행 |
| a stack trace points to ... one-line conditional (원인 명확) | direct execution |
| confined to one function with a clear requirement | direct execution |
| the exact new value specified in advance (CI) | direct execution |
| reading dozens of files to understand (넓은 조사) | Explore 서브에이전트 위임 |
| consume most of the main conversation's context window | Explore 서브에이전트 위임 |
| keeps consuming space ... for the rest of that session | 스킬에 `context: fork` |
| only the final recommendation surfacing back | `context: fork` |
| available across all projects, not committed (개인 전역) | `~/.claude/rules/` |
| whenever they work in a specific repository, never committed | `CLAUDE.local.md` + `.gitignore` |
| every engineer gets it automatically after `git pull` | `.claude/commands/*.md` 커밋 |
| should not appear in teammates' `/` menus | `~/.claude/skills/<name>/SKILL.md` |
| individual developers cannot disable (조직 강제) | `managed-settings.json` (시스템 경로) |
| must not depend on Claude remembering or choosing | `PreToolUse` 훅 |
| even if Claude decides ... skipping would be fine | `PreToolUse` 훅 |
| scattered across several unrelated subsystems | `.claude/rules/` + `paths` glob |
| at any subfolder depth (하위 깊이 전부) | `**` globstar |
| nested subfolders like src/components/forms/ | `*` → `**` 로 교체 |
| without duplicating those conventions | `.claude/rules/` 단일 파일 + `paths` |
| rarely-needed ... larger context footprint | 스킬로 분리 (온디맨드 로딩) |
| keeping everything loaded for every session | `.claude/rules/` 주제별 분할 |
| without affecting other teammates (본인만 제외) | `.claude/settings.local.json` |
| purely as a pointer for humans, without importing | 백틱으로 감싸기 |
| avoid maintaining the same conventions in two places | `@AGENTS.md` import |
| single source of truth ... across all ten repos | symlink into `.claude/rules/` |
| plain-English descriptions keep producing inconsistent | 구체적 입출력 예시 (few-shot) |
| ambiguous ... `03/04/25` must mean March 4 | 입출력 쌍 2~3개 제시 |
| reduce the number of correction cycles (선제) | 테스트 먼저 작성 (TDD) |
| a domain the architect has not built in before | `AskUserQuestion`으로 인터뷰 |
| both live in the same critical section (공유 로직) | 한 메시지에 함께 |
| three failing tests ... unrelated parts (한 함수 내) | 전체 출력 한 번에 + 전체 재실행 |
| two failures trace to the same store logic (연관+무관 혼재) | 연관만 묶고 무관은 분리 |
| no human is present to answer a permission prompt | `dontAsk` 모드 |
| zero ability to run arbitrary Bash | `--disallowedTools Bash` |
| hangs until the job times out, no output (CI) | `-p` 플래그 누락 |
| always match a specific JSON shape | `--output-format json --json-schema` |
| no matter which self-hosted runner picks it up | `--bare` |
| `allowed-tools: Write Edit` 로 Bash 차단 시도 | 차단 안 됨 — `disallowed-tools` 필요 |
| same name at personal and project level (스킬 충돌) | **Personal 승** |

**만능 오답 패턴 (거의 항상 함정)**

| 원문 조각 | 한국어 |
|---|---|
| Increase the temperature or creativity setting | 온도/창의성 상승 |
| Raise `--max-budget-usd` for the job | 예산 상한 증가 |
| Increase `--max-turns` on the re-run to a higher value | 턴 수 증가 |
| restart their machines / before new commands are detected | 재부팅 필요 |
| delete their local git history and re-clone | 재클론 |
| prepend each rule with all-caps modifiers like IMPORTANT | 대문자 강조 |
| more forceful language demanding that Claude get it right | 어조 강화 |
| rely on production incidents to surface failure modes | 운영 장애로 발견 |
| rely on the test suite to catch mismatched replacements later | 테스트가 잡아주겠지 |
| relying on its internal judgment ... without stating details | 세부 없이 AI 판단에 위임 |
| adding TODO comments ... then proceed to the next task | TODO 남기고 넘어감 |
| manually delete the least relevant lines from the transcript | 대화록 수동 삭제 |
| Raise the configured context window limit for the session | 컨텍스트 한도 증가 |
| rewrite the entire script from scratch using a different language | 다른 언어로 전면 재작성 |
| a generic try/except block ... skipped silently | 예외로 덮어 숨김 |
| always / never / only / must always ... | 절대 단정어 |

---

## 1. 워크플로 선택: Plan Mode vs Direct Execution

**해당 문제**: 1, 3, 12, 13, 22, 23, 24, 29, 52, 66, 81, 92, 94, 98

### 대조표 (최중요)
| 신호 | 모드 | 근거 |
|---|---|---|
| 여러 대안·트레이드오프 존재 | **plan mode** | 설계 결정이 남아 있음 |
| 다중 파일 / 다중 서비스 | **plan mode** | 일관 패턴 사전 확정 필요 |
| 패턴이 파일마다 다름 | **plan mode** | 먼저 survey |
| 단일 파일 + 원인 명확 | **direct** | 탐색·설계 불필요 |
| 호출부가 이미 눈에 보임 | **direct** | 범위 완전 파악 |
| CI + 값이 사전 지정됨 | **direct** | 모호성 0 |
| 승인된 plan을 실행할 때 | **plan → 편집 모드 전환** | 재설명 없이 진행 |

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| plan mode | 계획 모드 | 읽기 전용 탐색 + 설계 제안 |
| direct execution | 직접 실행 | 계획 단계 생략, 즉시 수정 |
| well-scoped, single-file fix | 범위가 좁은 단일 파일 수정 | direct의 조건 |
| no open design question | 미결 설계 이슈 없음 | direct의 조건 |
| read-only guarantee | 읽기 전용 보장 | plan mode는 읽기 승인 불필요 |
| acceptEdits | 편집 자동 승인 모드 | 파일 쓰기 + 기본 fs 명령만 |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| Enter plan mode so Claude explores the codebase | plan mode로 코드베이스 탐색 | 1 |
| proposes a design before any edit is approved | 편집 승인 전에 설계를 제안 | 1 |
| a well-scoped, single-file fix with a clear cause | 원인이 명확한 단일 파일 수정 | 3 |
| Approve the plan and choose an option that switches | 승인 후 편집 모드로 전환 | 12 |
| so Claude proceeds directly with the approved design | 승인된 설계대로 바로 진행 | 12 |
| confined to one function with a clear, well-scoped requirement | 명확한 단일 함수 범위 | 13 |
| The full scope of the change is already known | 변경 범위가 이미 전부 파악됨 | 22 |
| leaving no exploration or design decision to make | 탐색·설계 결정이 남지 않음 | 22 |
| executed directly from the start instead of first exploring | 탐색 없이 바로 실행한 것이 원인 | 23 |
| explore both approaches and surface the infrastructure tradeoffs | 두 방식의 인프라 트레이드오프 표면화 | 24 |
| survey the inconsistent call site patterns and draft a migration | 불일치 호출 패턴 조사 후 계획 | 29 |
| then exit plan mode and execute the approved plan | plan 종료 후 승인안 실행 | 29·52 |
| compare the three caching strategies and settle on one | 세 전략 비교 후 하나로 확정 | 52 |
| a single, fully specified, well-scoped edit | 완전히 명시된 단일 수정 | 66 |
| spans multiple files, involves a real choice between two libraries | 다중 파일 + 실제 라이브러리 선택 | 81 |
| touches core session and token-handling behavior | 핵심 세션·토큰 로직을 건드림 | 81 |
| confined to a single file, has one clear implementation path | 단일 파일 + 명확한 단일 구현 경로 | 92 |
| touches no other module in the codebase | 다른 모듈에 영향 없음 | 92 |
| inherently blocks all edits and does not require approval for read | 편집 차단 + 읽기 승인 불필요 | 94 |
| confined to one table and one file | 한 테이블·한 파일에 국한 | 98 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| Skip investigation and have Claude pick one split at random | 무작위 선택 | 위험 |
| rely on integration tests to catch structural mistakes later | 테스트가 나중에 잡아줌 | 만능 오답 |
| bypassPermissions enabled so the extraction finishes | 권한 우회로 완주 | 통제 상실 |
| any production bug fix always warrants a written proposal | 모든 버그 수정에 서면 제안 | 절대 단정 |
| Split the one-line fix into a multi-phase plan | 한 줄 수정을 다단계 계획으로 | 과잉 |
| Stay in plan mode indefinitely | plan 모드에 무기한 체류 | 실제 변경 없음 |
| Enter plan mode first to explore whether other functions | 다른 함수까지 확장 탐색 | 과잉 |
| Treat the request as a multi-file migration | 단일 수정을 대규모 마이그레이션으로 | 과장 |
| Plan mode is technically incapable of a rename operation | rename에 plan 모드 사용 불가 | 거짓 |
| Renaming operations never require verification of call sites | rename은 호출부 검증 불필요 | 절대 단정 |
| Implement both approaches in parallel branches | 두 방식 모두 구현 후 비교 | 낭비 |
| based solely on which one requires fewer new files | 새 파일 수만으로 선택 | 근거 없음 |
| Apply the replacement idiom seen in the first converted file | 첫 파일 패턴을 전부에 적용 | 검증 없음 |
| Direct execution cannot make changes to more than one file | direct는 다중 파일 수정 불가 | 거짓 |
| security-related code is always exempt from direct execution | 보안 코드는 항상 예외 | 절대 단정 |
| any schema change is inherently architectural by nature | 스키마 변경은 본질적으로 아키텍처 | 절대 단정 |
| plan mode should be the default for every change | 모든 변경에 plan 기본값 | 오버헤드 |
| Plan mode has silently switched over to acceptEdits | 몰래 모드 자동 전환 | 없는 동작 |
| Read-only commands are permanently exempt from every mode | 모든 모드에서 읽기 영구 면제 | 절대 단정 |
| every requirement was already fully described | 요구사항이 이미 전부 기술됨 | 사실 아님 |

---

## 2. 서브에이전트 & 컨텍스트 격리 (`context: fork`)

**해당 문제**: 16, 31, 38, 46, 63, 84

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| `context: fork` | 컨텍스트 포크 | 서브에이전트에서 실행, 결과만 반환 |
| Explore subagent | 탐색 서브에이전트 | 넓은 조사를 격리 수행 |
| condensed summary | 축약 요약 | 메인에 전달되는 것은 요약뿐 |
| context window efficiency | 컨텍스트 효율 | 조사 출력이 메인을 오염시키지 않음 |
| does not have access to conversation's history | 대화 이력 접근 불가 | 서브에이전트는 격리됨 |
| Explore agent skips loading CLAUDE.md | Explore는 CLAUDE.md를 안 읽음 | 컨텍스트 최소화 설계 |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| the built-in Explore agent skips loading CLAUDE.md at startup | Explore는 시작 시 CLAUDE.md를 건너뜀 | 16 |
| only sees the skill content and the agent's own system prompt | 스킬 본문과 자체 시스템 프롬프트만 봄 | 16 |
| Delegate the broad investigation to an Explore subagent | 넓은 조사를 Explore에 위임 | 31 |
| to keep discovery output out of context | 탐색 출력을 컨텍스트 밖에 유지 | 31 |
| then add the field with direct execution | 이후 필드 추가는 직접 실행 | 31 |
| Set `context: fork` so the brainstorming happens in a subagent | fork로 서브에이전트에서 브레인스토밍 | 38 |
| only the returned result reaches the main conversation | 반환 결과만 메인 대화에 도달 | 38 |
| runs the searches in its own context | 자체 컨텍스트에서 검색 수행 | 46 |
| returns a condensed summary to the conversation | 축약 요약을 대화에 반환 | 46 |
| does not have access to the main conversation's history | 메인 대화 이력에 접근 불가 | 63 |
| the reference to an earlier discussion provides no actionable detail | 이전 논의 참조는 실행 가능한 정보가 없음 | 63 |
| the analysis runs in an isolated subagent | 격리된 서브에이전트에서 분석 수행 | 84 |
| only a summarized result is returned | 요약 결과만 반환 | 84 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| `context: fork` enforces strict isolation by removing project-level files | fork가 프로젝트 파일을 제거 | 원인 오인 |
| requires the `allowed-tools: Read` permission to include CLAUDE.md | Read 권한이 있어야 CLAUDE.md 로드 | 거짓 |
| conventions are only loaded when a skill is invoked without arguments | 인자 없을 때만 로드 | 거짓 |
| Set `user-invocable: false` so Claude silently runs in the background | 백그라운드 무음 실행 | 다른 기능 |
| Set `paths: **/*` so brainstorming activates automatically | 모든 파일에서 자동 활성화 | 무관 |
| `disable-model-invocation: true` so brainstorming only happens manually | 수동 호출 전용 | 컨텍스트 분리 아님 |
| paste the full grep output directly into the conversation | grep 전체 출력을 붙여넣음 | 정반대 |
| plan mode ... designed to automatically summarize all grep output | plan이 grep 출력을 요약해줌 | 없는 동작 |
| Raise the configured context window limit for the session | 컨텍스트 한도 상승 | 만능 오답 |
| Subagents cannot return text results to the main conversation | 서브에이전트는 결과 반환 불가 | 거짓 |
| The model cannot write multi-step plans | 다단계 계획 작성 불가 | 거짓 |
| `argument-hint: [directory]` so the analysis only scans one directory | 힌트로 탐색 범위 제한 | UI 전용 속성 |
| `allowed-tools: Read Grep` so ... produce shorter output | 읽기 도구로 출력 단축 | 출력 길이와 무관 |

---

## 3. CLAUDE.md 계층 & 로딩 시점

**해당 문제**: 5, 7, 17, 20, 28, 34, 37, 42, 43, 44, 59, 72, 73, 75, 76, 88, 93, 95, 97

### 로딩 시점 대조표 (최중요)
| 위치 | 로드 시점 | 비고 |
|---|---|---|
| 루트 `CLAUDE.md` | **세션 시작 (항상)** | compaction 후 재주입됨 |
| 작업 디렉터리 + 상위(ancestor) `CLAUDE.md` | **세션 시작** | 계층 병합 |
| 하위(subdirectory) `CLAUDE.md` | **그 디렉터리 파일을 읽을 때** | 온디맨드, compaction 시 소실 |
| `~/.claude/CLAUDE.md` | 세션 시작 (전역, 모든 프로젝트) | 커밋 안 됨 |
| `CLAUDE.local.md` | 세션 시작 (프로젝트 로컬) | `.gitignore` 대상 |
| `.claude/rules/*.md` (`paths` 없음) | **세션 시작 (무조건)** | 루트 CLAUDE.md와 동급 |
| `.claude/rules/*.md` (`paths` 있음) | **매칭 파일을 읽을 때** | Glob/Bash 노출만으론 미발동 |
| `.claude/skills/*/SKILL.md` 본문 | **호출될 때만** | 이후 세션 내내 잔류 |

### 설정 위치 대조표
| 요구 | 위치 |
|---|---|
| 모든 프로젝트 + 개인 전용 | `~/.claude/rules/`, `~/.claude/CLAUDE.md` |
| 특정 저장소 + 개인 전용 + 커밋 금지 | `CLAUDE.local.md` + `.gitignore` |
| 팀 공유 (git으로 배포) | `.claude/` 하위 커밋 |
| 본인만 제외 설정 | `.claude/settings.local.json` |
| 조직 강제 (비활성화 불가) | `/etc/claude-code/managed-settings.json` |

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| loads at launch | 실행 시 로드 | 세션 시작 시 컨텍스트 진입 |
| on demand when Claude reads files there | 그곳 파일을 읽을 때 온디맨드 | 하위 디렉터리 방식 |
| `claudeMdExcludes` | CLAUDE.md 제외 패턴 | 로드 차단용 |
| `@AGENTS.md` import | 임포트 구문 | 단일 진실 공급원 유지 |
| import parsing skips code spans | 백틱 내부는 임포트 제외 | 사람용 포인터 표기법 |
| context compaction | 컨텍스트 압축 | 루트만 재주입 |
| `/memory` | 로드 상태 조회 | 어떤 지침 파일이 로드됐는지 확인 |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| Create `packages/api/CLAUDE.md` with the api-specific conventions | 하위 패키지에 전용 CLAUDE.md 생성 | 7 |
| loads at launch when Claude starts from packages/api | 그 디렉터리에서 시작할 때 로드 | 7 |
| or on demand when Claude reads files there | 또는 그곳 파일을 읽을 때 | 7 |
| user-level rules apply to every project | 사용자 규칙은 모든 프로젝트에 적용 | 5 |
| and load before project rules do | 프로젝트 규칙보다 먼저 로드 | 5 |
| Split each topic into its own `.claude/rules/` file | 주제별 rules 파일로 분할 | 17 |
| only enters context when Claude works on matching files | 매칭 파일 작업 시에만 컨텍스트 진입 | 17 |
| stored in the existing team members' personal CLAUDE.md files | 기존 팀원 개인 파일에 저장돼 있었음 | 28 |
| not in the project's committed CLAUDE.md | 커밋된 프로젝트 파일에는 없음 | 28 |
| Have each engineer run `/memory` and compare which files are loaded | `/memory`로 로드 파일 비교 | 37 |
| Add `claudeMdExcludes` patterns to `.claude/settings.local.json` | local 설정에 제외 패턴 추가 | 43 |
| since local settings apply only to that engineer's machine | 로컬 설정은 본인 기기에만 적용 | 43 |
| one `.claude/rules/testing.md` file using a paths glob | rules 단일 파일 + paths glob | 44·48 |
| applies by file type across the repo rather than directory structure | 디렉터리가 아닌 파일 유형으로 적용 | 44 |
| Create CLAUDE.md starting with `@AGENTS.md` as an import | `@AGENTS.md` 임포트로 시작 | 59 |
| followed by the Claude-specific instructions underneath | 그 아래에 Claude 전용 지침 | 59 |
| Wrap it in backticks as `` `@docs/legacy-notes.md` `` | 백틱으로 감싸기 | 20·34·42 |
| import parsing skips content inside code spans | 코드 스팬 내부는 임포트 파싱 제외 | 20·34·42 |
| In a CLAUDE.md file at the repository root | 저장소 루트 CLAUDE.md에 | 72 |
| Add to a `CLAUDE.local.md` file at the project root | 프로젝트 루트 CLAUDE.local.md에 추가 | 73 |
| and add it to the repository's `.gitignore` | `.gitignore`에 등록 | 73 |
| Split the content into code-style.md, testing.md, security.md | 주제별 파일로 분할 | 75 |
| leaving CLAUDE.md as a short project pointer | CLAUDE.md는 짧은 포인터로 남김 | 75 |
| its content is loaded only in the sessions where it's invoked | 호출된 세션에서만 본문 로드 | 76·88 |
| rather than in every session by default | 매 세션 기본 로드가 아니라 | 76 |
| a skill's body only loads into context when it's invoked | 스킬 본문은 호출 시에만 로드 | 88 |
| The root and services/billing/CLAUDE.md load at launch | 루트 + 작업 디렉터리 파일이 시작 시 로드 | 93 |
| reports/CLAUDE.md loads later, only when Claude reads a file there | 하위 파일은 나중에 온디맨드 | 93 |
| Root CLAUDE.md is re-read and re-injected after compaction | 압축 후 루트는 재읽기·재주입 | 95 |
| nested CLAUDE.md files reload only when Claude next reads a file there | 중첩 파일은 다시 읽을 때만 재로드 | 95 |
| Deploy a `managed-settings.json` to the system directory | 시스템 경로에 관리형 설정 배포 | 97 |
| it enforces policies that override developer and project settings | 개발자·프로젝트 설정을 재정의 | 97 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| imports referencing their own containing file take precedence | 자기 자신 임포트가 우선 | 순환 오류 |
| Paste the conventions into every developer's `~/.claude/CLAUDE.md` | 개인 파일에 수동 붙여넣기 | 중앙 관리 실패 |
| so it always loads at launch regardless of working directory | 작업 디렉터리 무관하게 항상 로드 | 조건 위배 |
| Copy the same sections into a new CLAUDE.local.md | 동일 내용을 로컬 파일에 복제 | 컨텍스트 증가 |
| Wrap the sections in HTML maintainer comments | HTML 주석으로 감싸기 | 비표준 |
| Move the entire content into a single rules file without a paths field | paths 없는 단일 파일로 이동 | 여전히 전량 로드 |
| exceeds the token limit for brand-new sessions | 신규 세션 토큰 한도 초과 | 빈 파일임 |
| Claude Code caches CLAUDE.md content per machine on first run | 머신별 캐시 후 수동 리빌드 | 없는 동작 |
| local git client is silently skipping markdown files | git이 md 파일을 건너뜀 | 거짓 |
| CLAUDE.md changes only take effect after a full reboot | 재부팅 후 적용 | 거짓 |
| instruction-following is versioned per release | 버전마다 지침 준수가 다름 | 근거 없음 |
| Delete the CLAUDE.md files ... directly | 파일 자체 삭제 | 타인 영향 |
| Add `claudeMdExcludes` to the committed `.claude/settings.json` | 커밋 설정에 추가 | 전 팀원 영향 |
| exclusions can only be configured at the project scope | 제외는 프로젝트 범위만 가능 | 거짓 |
| Rename the files to CLAUDE.local.md so they are excluded from VCS | 로컬 파일로 이름 변경 | 팀 공유 불가 |
| Consolidate the three files into a single top-level CLAUDE.md | 최상위 단일 파일로 통합 | 매 세션 낭비 |
| Manually copy the full contents of AGENTS.md into CLAUDE.md | 수동 복사 후 재복사 | 동기화 실패 |
| Claude Code silently falls back to reading AGENTS.md | CLAUDE.md 없으면 AGENTS.md 폴백 | 거짓 |
| Create a symbolic link named CLAUDE.md pointing to AGENTS.md | 심링크로 동일 내용 | 전용 지침 추가 불가 |
| Claude Code automatically strips personal values before committing | 커밋 전 개인값 자동 제거 | 없는 동작 |
| `.claude/settings.local.json` ... automatically adds to global Git excludes | 자동으로 git excludes 등록 | 거짓 + 용도 다름 |
| user-level configuration files are automatically scoped to the repository | 사용자 설정이 저장소로 스코프됨 | 거짓 |
| Add `effort: low` to the YAML frontmatter of CLAUDE.md | effort 속성으로 축약 로드 | 없는 기능 |
| loads only the alphabetically first file's content per session | 알파벳 첫 파일만 로드 | 없는 규칙 |
| commands undergo transparent compression | 커맨드는 투명 압축됨 | 없는 기능 |
| Compaction only preserves the first 200 lines of a session | 첫 200줄만 보존 | 없는 규칙 |
| Compaction corrupts nested CLAUDE.md files on disk | 압축이 디스크 파일을 손상 | 거짓 |
| deleted from context permanently after compaction | 영구 삭제 | 거짓 |
| source control ensures every team member receives the same instructions | 커밋만으로 강제됨 | 우회 가능 |

---

## 4. `.claude/rules/` & paths Glob 패턴

**해당 문제**: 4, 10, 14, 15, 21, 25, 47, 48, 50, 54, 65, 67, 68, 77, 82, 83, 87, 96, 103

### Glob 패턴 대조표 (최중요)
| 패턴 | 매칭 범위 |
|---|---|
| `src/api/*.ts` | `src/api/` **바로 아래**만 |
| `src/api/**/*.ts` | `src/api/` 하위 **모든 깊이** |
| `**/*.test.tsx` | 저장소 **전체**의 해당 확장자 (루트 포함) |
| `src/**/*.test.tsx` | `src/` 하위만 — 루트 `tests/`는 **누락** |
| `src/**/*.{ts,tsx}` | 중괄호 확장 — 두 확장자를 **한 줄**로 |
| `**/migrations/**` | 여러 서브시스템에 흩어진 파일 |

### 문법 규칙
| 항목 | 올바른 형태 |
|---|---|
| 키 이름 | `paths:` (`include:` 아님) |
| 값 형태 | **YAML 배열** (`- "..."`), 문자열 단독 아님 |
| 하위 디렉터리 배치 | `.claude/rules/frontend/react.md` — **재귀 탐색됨** |
| symlink | `.claude/rules/`에서 **정상 해결 + 순환 감지** |
| symlink 체크아웃 | 상대 경로 패턴이 **정상 매칭됨** |

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| path-scoped rule | 경로 범위 규칙 | `paths` 있는 조건부 규칙 |
| unconditional rule | 무조건 규칙 | `paths` 없음 → 시작 시 로드 |
| brace expansion | 중괄호 확장 | `{ts,tsx}` 한 줄 처리 |
| recursive discovery | 재귀 탐색 | 하위 폴더의 `.md`도 발견됨 |
| circular detection | 순환 감지 | symlink 무한 루프 방지 |
| `InstructionsLoaded` hook | 지침 로드 훅 | 무엇이 언제 왜 로드됐는지 로깅 |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| `.claude/rules/` resolves symlinks normally with circular detection | symlink 정상 해결 + 순환 감지 | 4·10·21 |
| verify each repo's symlinks target the shared source | 각 링크가 공유 원본을 가리키는지 검증 | 4·10·21 |
| `paths: - "src/api/**/*.ts"` | api 하위 전체 깊이 매칭 | 14 |
| it targets files by pattern tree-wide rather than one directory | 한 디렉터리가 아닌 트리 전체를 패턴으로 | 15 |
| `src/components/*.tsx` only matches files directly inside | 단일 별표는 직하위만 매칭 | 25 |
| changing it to `src/components/**/*.tsx` would match at any depth | `**`로 바꾸면 임의 깊이 매칭 | 25 |
| YAML frontmatter `paths: ["src/api/**/*"]` | YAML 프론트매터에 glob 배열 | 47 |
| so it only enters context when Claude reads a matching file | 매칭 파일을 읽을 때만 진입 | 47 |
| loads whenever Claude reads a file matching that pattern anywhere | 저장소 어디서든 매칭 시 로드 | 48 |
| path-scoped rules load when Claude reads a file matching the pattern | 파일을 읽을 때 로드됨 | 50 |
| not merely when it uses other tools like Glob or Bash | Glob·Bash 사용만으로는 안 됨 | 50 |
| Use the `InstructionsLoaded` hook to log which files are loaded | 훅으로 로드 파일 로깅 | 54 |
| when they load, and why | 언제·왜 로드됐는지 | 54 |
| symlink it into each repository's `.claude/rules/` directory | 각 저장소 rules에 심링크 | 65 |
| matches path-scoped rules even when reached through a symlinked path | 심링크 경유에도 정상 매칭 | 67 |
| all `.md` files under `.claude/rules/` are discovered recursively | rules 하위 md는 재귀 탐색됨 | 68 |
| `**/*.test.tsx` | 위치 무관 전체 매칭 | 77 |
| `src/**/*.{ts,tsx}` 와 `lib/**/*.ts` | 중괄호 확장으로 2줄 | 82 |
| User-level rules load before project rules | 사용자 규칙이 먼저 로드 | 83 |
| but load order does not guarantee deterministic conflict resolution | 순서가 충돌 해결을 보장하지 않음 | 83 |
| conflicting guidance should be removed rather than relying on precedence | 우선순위 의존 말고 충돌 제거 | 83 |
| `paths:` 하위에 `- "terraform/**/*"` 배열 | 배열 형태 + globstar | 87 |
| omitting the `paths` field makes the rule unconditional | paths 생략 = 무조건 규칙 | 96 |
| loads at launch with the same priority as `.claude/CLAUDE.md` | 시작 시 CLAUDE.md와 동급 로드 | 96 |
| include a `paths` frontmatter key with glob patterns scoped to team-b | 팀B 규칙에 paths 지정 | 103 |
| Path-scoped rules only load when Claude works on matching files | 매칭 작업 시에만 로드됨 | 103 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| only discovers regular files, so symlinked entries are silently ignored | symlink를 무시함 | 거짓 |
| supported only for whole symlinked directories, not individual files | 디렉터리 링크만 가능 | 거짓 |
| only when the shared rules sit in the same git repo as a submodule | 서브모듈 한정 | 거짓 |
| path-scoped rules can only match a single exact directory | 단일 디렉터리만 매칭 | 거짓 |
| the only option is duplicating the same CLAUDE.md manually | 수동 복제만이 유일 | 거짓 |
| directory files always take precedence over rules | 디렉터리 파일이 항상 우선 | 절대 단정 |
| stop matching once a project exceeds a certain number of files | 파일 수 초과 시 매칭 중단 | 없는 규칙 |
| missing a leading forward slash before `src/components` | 앞 슬래시 누락이 원인 | 거짓 |
| `.tsx` files require a separate paths entry using brace expansion | tsx는 중괄호 확장 필수 | 거짓 |
| its location alone scopes it to that one directory | 위치만으로 스코프됨 | 거짓 |
| the literal string `"src/api"` with no glob wildcard | 와일드카드 없는 리터럴 | 재귀 안 됨 |
| Claude Code infers scoping from filename prefixes | 파일명 접두사로 범위 추론 | 없는 기능 |
| `claudeMdExcludes` ... causes Claude to load the conventions only when excluded | 제외 설정이 로드를 유발 | 정반대 |
| loaded as soon as Glob returned a listing | Glob 목록만으로 로드됨 | 거짓 |
| all rules under `.claude/rules/` are loaded unconditionally regardless of paths | paths 무시하고 전부 로드 | 거짓 |
| unless the developer explicitly runs the `/memory` command | `/memory` 실행해야 활성화 | 거짓 |
| Run the `/init` command ... regenerates every rules file | init이 규칙을 재생성 | 없는 동작 |
| Delete and recreate without a `paths` field | paths 제거로 우회 | 진단이 아님 |
| a scheduled workflow that copies the checklist nightly | 야간 복사 스케줄러 | 지연 + 커밋 오염 |
| deployed only to the security team's own machines | 보안팀 기기에만 배포 | 대상 누락 |
| path-scoped rules only evaluate against the canonical filesystem path | 정규 경로만 평가 | 거짓 |
| symlinked roots require an explicit absolute pattern | 절대 경로 패턴 필요 | 거짓 |
| subdirectories under `.claude/rules/` are reserved for skills and commands | 하위 폴더는 스킬·커맨드 전용 | 거짓 |
| rules in subdirectories load unconditionally without respecting paths | 하위 폴더 규칙은 paths 무시 | 거짓 |
| only ever scans the top level of `.claude/rules/` | 최상위만 스캔 | 거짓 |
| `**/__tests__/*.tsx` | 특정 폴더명만 매칭 | 범위 누락 |
| `paths: "terraform/**/*"` (문자열 단독) | 배열 아닌 문자열 | 문법 오류 |
| `include: - "terraform/**/*"` | include 키 사용 | 없는 키 |
| project-level rules always take higher priority because more specific | 프로젝트가 항상 우선 | 보장 없음 |
| User-level rules are ignored whenever a project defines a same-named file | 동명 시 사용자 규칙 무시 | 거짓 |
| Set `autoMemoryEnabled` to false | 자동 메모리 비활성화 | 무관한 설정 |
| `claudeMdExcludes` entry pointing to `packages/team-b/.claude/rules/**` | rules를 excludes로 차단 | 대상이 CLAUDE.md뿐 |

---

## 5. Skills / Commands: 위치·우선순위·frontmatter

**해당 문제**: 9, 11, 26, 35, 51, 58, 61, 74, 79, 84, 85, 91

### 우선순위 (최중요)
```
Enterprise  >  Personal (~/.claude/skills/)  >  Project (.claude/skills/)  >  Plugins
```
→ 동명 충돌 시 **개인(Personal) 스킬이 프로젝트 스킬을 오버라이드**. 병합도 에러도 아님.

### frontmatter 대조표
| 속성 | 실제 동작 | 착각하기 쉬운 것 |
|---|---|---|
| `allowed-tools` | 나열 도구의 **승인 프롬프트 생략** | 도구 제한 ❌ |
| `disallowed-tools` | 도구를 **풀에서 제거** | 실제 차단 수단 |
| `context: fork` | 서브에이전트 실행, 요약만 반환 | — |
| `disable-model-invocation: true` | 모델 자동 호출 금지, 수동만 | 컨텍스트 분리 ❌ |
| `argument-hint: [x]` | 자동완성 **플레이스홀더 표시** | 검증 ❌ |
| `arguments:` | **존재하지 않는 필드** | — |

### 배치 위치 대조표
| 요구 | 위치 |
|---|---|
| 팀 전체가 `git pull`로 자동 획득 | `.claude/commands/<name>.md` 커밋 |
| 본인만, 팀 메뉴에 안 보임, PR 제외 | `~/.claude/skills/<name>/SKILL.md` |
| 공유 스킬을 본인만 다르게 (같은 이름 유지) | `~/.claude/skills/<same-name>/SKILL.md` |
| 레거시 개인 커맨드 경로 | `~/.claude/commands/<name>.md` (현행 권장 아님) |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| a skill with the same name at the personal level overrides | 동명 개인 스킬이 오버라이드 | 9·51·85 |
| The `allowed-tools` field bypasses user permission prompts | allowed-tools는 승인 프롬프트를 우회할 뿐 | 11 |
| but does not restrict which tools are available | 사용 가능한 도구를 제한하지 않음 | 11 |
| other tools like Bash can still be invoked | Bash 등은 여전히 호출 가능 | 11 |
| The project's workspace trust dialog has not yet been accepted | 워크스페이스 신뢰를 수락하지 않음 | 26 |
| so the `allowed-tools` grant has not taken effect | 사전 승인이 효력 없음 | 26 |
| Save it to `.claude/commands/release-notes.md` inside the project | 프로젝트 커맨드 디렉터리에 저장 | 35 |
| commit that file so it distributes through version control | 커밋해 버전 관리로 배포 | 35 |
| Create `~/.claude/skills/commit/SKILL.md` as a personal copy | 같은 이름으로 개인 사본 생성 | 58 |
| to locally override the project skill for this developer only | 본인만 로컬 오버라이드 | 58 |
| saved under `~/.claude/commands/lint-report.md`, which lives outside the repository | 저장소 밖이라 버전 관리 안 됨 | 61 |
| In `~/.claude/skills/my-standup/SKILL.md`, a personal skill not committed | 커밋되지 않는 개인 스킬 | 74 |
| Adding `disallowed-tools: Bash` removes Bash from Claude's pool | disallowed-tools로 풀에서 제거 | 79 |
| `argument-hint: [issue-number]`, which displays a placeholder | 자동완성 플레이스홀더 표시 | 91 |
| without changing how the skill executes | 실행 방식은 바뀌지 않음 | 91 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| project-scoped skills always take priority over personal ones | 프로젝트가 항상 우선 | 정반대 |
| Both skills execute in sequence ... merges same-named skills | 동명 스킬 병합 실행 | 없는 동작 |
| Neither executes, and Claude Code reports a naming conflict error | 충돌 에러로 중단 | 없는 동작 |
| effectively restrict the skill to only file write operations | 파일 쓰기로 실질 제한됨 | 거짓 |
| the recommended method to limit a skill's capabilities | 권장 제한 방법 | 거짓 |
| automatically sandboxes the skill, disabling all tools except file operations | 자동 샌드박스 | 거짓 |
| must be listed under `arguments` rather than `allowed-tools` | arguments에 기재해야 함 | 없는 필드 |
| `allowed-tools` only applies to skills stored in `~/.claude/skills/` | 개인 스킬에만 적용 | 거짓 |
| `allowed-tools` only takes effect for skills that run in a forked subagent | fork 스킬에서만 유효 | 거짓 |
| add that file to `.gitignore` so local changes stay conflict-free | gitignore 처리 | 배포 불가 |
| have each engineer copy the file to their own directory | 각자 수동 복사 | 요구 위배 |
| rely on the change remaining uncommitted | 커밋 안 한 채 방치 | 유실 위험 |
| Create a differently named skill, such as commit-verbose | 다른 이름으로 생성 | 같은 `/commit` 요구 위배 |
| slash commands only activate after the CI pipeline runs | CI 실행 후 활성화 | 거짓 |
| requires a separate enterprise license to share | 공유에 엔터프라이즈 라이선스 필요 | 거짓 |
| a leading underscore in the filename so teammates' clients skip it | 언더스코어로 무시 처리 | 없는 규칙 |
| add a note in the PR description asking reviewers to ignore | PR에 무시 요청 | 비효율 |
| `allowed-tools` only constrains tools invoked directly by the user | 사용자 직접 호출만 제한 | 거짓 |
| set `model: inherit` to override autonomous tool selection | model로 도구 선택 재정의 | 없는 동작 |
| `allowed-tools` is evaluated only after the skill finishes | 스킬 종료 후 평가 | 거짓 |
| requires trailing wildcards, such as `Write*` and `Edit*` | 후행 와일드카드 필수 | 없는 규칙 |
| `arguments: issue-number`, which validates the typed value is numeric | 숫자 검증 수행 | 없는 필드 |
| `description: ...` which Claude reads aloud to the user | 설명을 소리 내어 읽음 | 없는 동작 |
| `~/.claude/commands/my-standup.md` (legacy 경로) | 레거시 커맨드 경로 | 현행 권장 아님 |

---

## 6. Hooks & 결정론적 강제 (Enforcement)

**해당 문제**: 54, 80, 86, 88, 97

### 대조표
| 수단 | 성격 | 보장 |
|---|---|---|
| `CLAUDE.md` 지침 | 컨텍스트 (확률적) | Claude 판단으로 생략 가능 |
| `PreToolUse` 훅 | 코드 레벨 검사·차단 | **100% 결정론적** |
| `managed-settings.json` | 조직 정책 최상위 | 개발자·프로젝트 설정 **재정의** |
| `InstructionsLoaded` 훅 | 진단 로깅 | 무엇이 언제 왜 로드됐는지 |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| a `PreToolUse` hook that inspects Bash tool inputs | Bash 입력을 검사하는 훅 | 80 |
| blocks any direct commit to `main` | main 직접 커밋을 차단 | 80 |
| returns a message instructing the user to open a pull request | PR을 열도록 안내 메시지 반환 | 80 |
| CLAUDE.md is context that shapes behavior | CLAUDE.md는 행동을 형성하는 컨텍스트 | 86 |
| but is not a hard enforcement layer Claude is guaranteed to obey | 준수가 보장되는 강제 계층이 아님 | 86 |
| Implement it as a settings-based control such as a PreToolUse hook | 설정 기반 제어로 구현 | 86 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| commands run automatically before every user message | 커맨드가 매 메시지마다 자동 실행 | 거짓 |
| skills only load when manually typed | 수동 입력 시에만 로드되므로 강제됨 | 강제력 아님 |
| that file is always loaded and applies as a universal standard | 항상 로드되니 보편 표준이 됨 | 보장 불가 |
| managed policy is the sole CLAUDE.md tier Claude cannot override | 오버라이드 불가 CLAUDE.md 계층 | 없는 계층 |
| CLAUDE.md content carries the same enforcement guarantee | 기술적 통제와 동일한 보장 | 거짓 |
| repetition across the hierarchy is what converts guidance into enforcement | 반복이 강제로 전환됨 | 거짓 |
| a `PreToolUse` hook that runs the deployment steps before any tool | 훅으로 절차를 실행 | 용도 오인 |
| a subagent definition under `.claude/agents/` | 서브에이전트 정의로 이동 | 절차 지침엔 스킬이 적합 |

---

## 7. CLI 플래그 & 비대화형(CI) 실행

**해당 문제**: 2, 19, 32, 33, 39, 49, 56, 64, 69, 70, 78, 100, 101

### 플래그 대조표 (최중요)
| 플래그 / 모드 | 동작 |
|---|---|
| `-p` / `--print` | 비대화형 1회 실행. **없으면 CI에서 무한 대기** |
| `--output-format json` | `result` + `total_cost_usd` + 모델별 비용 **기본 포함** |
| `--json-schema` | 스키마 강제. **잘못된 스키마 → 즉시 에러 종료** |
| `--allowedTools "Bash(cmd*)"` | 끝의 `*` = **접두사 매칭** (`migrate-cleanup`도 통과) |
| `--disallowedTools Bash` | Bash를 명시적으로 차단 |
| `--permission-mode acceptEdits` | 파일 쓰기 + `mkdir`/`mv`/`cp`만 자동 승인. **네트워크·일반 셸 ❌** |
| `--permission-mode dontAsk` | allow 규칙·읽기 전용 외 **프롬프트 없이 거부** |
| `--bare` | 작업/홈 디렉터리 **자동 탐지 전면 차단** (훅·MCP·설정) |
| stdin 파이프 | **10MB 상한**, 초과 시 에러 종료 |

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| prefix matching | 접두사 매칭 | 후행 `*`의 실제 의미 |
| auto-discovery | 자동 탐지 | `--bare`가 차단하는 대상 |
| reproducibility | 재현성 | 러너 무관 동일 동작 |
| structured output | 구조화 출력 | 스키마로 형태 고정 |
| prior review findings | 이전 리뷰 결과 | 중복 방지용 컨텍스트 주입 |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| The JSON response body already includes `total_cost_usd` | 응답에 이미 비용이 포함됨 | 2 |
| along with a per-model cost breakdown alongside the result field | 모델별 비용 내역도 함께 | 2 |
| unifies prompt inputs and aligns with the Claude Code CLI | 프롬프트 입력 통합 + CLI 정렬 | 19 |
| using a single `prompt` parameter and a `claude_args` array | 단일 prompt + claude_args 배열 | 19 |
| while auto-detecting the execution mode | 실행 모드 자동 감지 | 19 |
| The trailing asterisk triggers prefix matching | 후행 별표가 접두사 매칭을 유발 | 32 |
| matches any command that starts with 'npm run migrate' | 그 접두사로 시작하는 모든 명령 매칭 | 32 |
| Set the permission mode to `dontAsk` | dontAsk 모드 설정 | 33 |
| denies anything not covered by permissions.allow rules | allow 규칙 밖은 거부 | 33 |
| or the built-in read-only command set without prompting | 내장 읽기 전용 외엔 프롬프트 없이 | 33 |
| Include the prior review findings in the new run's context | 이전 결과를 새 실행 컨텍스트에 포함 | 39 |
| only report findings not already present in those prior findings | 기존에 없는 것만 보고하도록 지시 | 39 |
| Invoke claude with `--bare` in print mode | print 모드에서 --bare 사용 | 49 |
| so nothing is auto-discovered from the working directory or home | 작업·홈 디렉터리 자동 탐지 없음 | 49 |
| exits with an error stating the value is not a valid JSON Schema | 유효하지 않은 스키마로 에러 종료 | 56 |
| along with the validator's diagnostic, instead of producing any output | 검증기 진단과 함께, 출력 없이 | 56 |
| Pass the existing test files into Claude's context | 기존 테스트 파일을 컨텍스트에 전달 | 64 |
| so generation is scoped against what is already covered | 이미 커버된 범위를 기준으로 생성 | 64 |
| Adding `--disallowedTools Bash` is the explicit way to block | 명시적 Bash 차단 방법 | 69 |
| because piping alone does not remove the default tool access | 파이프만으론 기본 권한이 제거되지 않음 | 69 |
| exceeded the 10MB cap on piped stdin | 파이프 stdin 10MB 상한 초과 | 70 |
| invoked claude without the `-p` flag | -p 플래그 없이 호출 | 78 |
| started in interactive mode and sat waiting for terminal input | 대화형으로 시작해 입력 대기 | 78 |
| auto-approves file writes and common filesystem commands like mkdir, mv, cp | 파일 쓰기 + 기본 fs 명령만 자동 승인 | 100 |
| other shell commands and network requests require an --allowedTools entry | 그 외엔 명시적 허용 필요 | 100 |
| `--output-format json --json-schema '{...}'` | JSON 출력 + 스키마 강제 | 101 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| Cost data only appears when stream-json and --verbose are both set | 특정 조합에서만 비용 노출 | 거짓 |
| only available by separately querying the usage dashboard | 대시보드 별도 조회 | 거짓 |
| written to a local `.claude/usage.log` file | 로컬 로그 파일 파싱 | 없는 파일 |
| renamed to `prompt_text`, `instructions`, `execution_mode` | 단순 개명 | 거짓 |
| requires all configuration in a single `config.yml` | config.yml 강제 | 거짓 |
| acceptEdits was implicitly enabled alongside --allowedTools | acceptEdits 암묵 활성화 | 거짓 |
| matched using regular expression alternation by default | 정규식 교차 매칭 | 거짓 |
| The --bare flag was omitted, causing a permissive default | bare 누락이 범위를 넓힘 | 무관 |
| Set --max-turns to 1, limiting Claude to one tool call | 턴 1개로 제한 | 차단 아님 |
| rely on the default interactive permission prompt ... short timeout | 프롬프트 + 타임아웃 의존 | 무한 대기 위험 |
| Add `--no-session-persistence` so each run starts with no memory | 세션 기억 제거 | 정반대 |
| Switch `--output-format` from json to stream-json so the bot streams | 스트리밍으로 전환 | 로직 미추가 |
| pipe the event stream through a filter that discards hook events | 출력 후처리 필터 | 부작용은 이미 발생 |
| provide a pre-recorded session file created in a clean environment | 사전 녹화 세션 사용 | 자동 로드 차단 안 됨 |
| silently falls back to unstructured plain-text output | 무음 평문 폴백 | 거짓 |
| returns an empty structured_output object with no fields | 빈 객체 반환 | 거짓 |
| retries up to three times using --max-retries | 재시도 | 문법 오류는 대상 아님 |
| Raise `--max-budget-usd` so Claude can afford a larger suite | 예산 상향 | 만능 오답 |
| Running the script through npm ... strips Bash tool access | npm 경유로 권한 제거 | 거짓 |
| Piping the diff via stdin ... so no Bash permission is needed | 파이프면 권한 불필요 | 거짓 |
| The double-quoted prompt string itself tells Claude not to use Bash | 프롬프트 문구가 차단 | 보장 불가 |
| contained non-UTF8 bytes, which -p mode rejects outright | 비UTF8이라 즉시 거부 | 원인 아님 |
| Piped stdin is only accepted when --input-format stream-json is set | 평문 파이프 미지원 | 거짓 |
| The redirect operator `>` is not supported when combined with -p | `>` 와 -p 조합 불가 | 거짓 |
| checked out the repository with a shallow clone depth | shallow clone이 원인 | 에러 종료지 hang 아님 |
| forgot to set ANTHROPIC_API_KEY as a masked secret | 마스킹 누락으로 인증 루프 | 거짓 |
| Node.js version is older than what the claude binary requires | Node 버전 미달로 대기 | 즉시 종료됨 |
| acceptEdits only applies to the first tool call in a run | 첫 호출에만 적용 | 없는 규칙 |
| Network requests are always blocked outright in print mode | print 모드는 네트워크 전면 차단 | 절대 단정 |
| acceptEdits has no effect at all unless bare mode is also enabled | bare 없으면 무효 | 거짓 |
| reply only with passed:true/false ... `--output-format text` | 프롬프트 지시 + text | 파싱 실패 위험 |
| `--append-system-prompt "Always respond with valid JSON"` | 시스템 프롬프트로 JSON 요구 | 강제력 없음 |

---

## 8. 프롬프팅 기법: Few-shot · TDD · 인터뷰

**해당 문제**: 6, 18, 30, 36, 40, 41, 53, 55, 57, 62, 64, 89, 99, 102

### 상황별 처방 대조표
| 증상 | 처방 |
|---|---|
| 모호한 변환 규칙이 일관되지 않음 | **구체적 입출력 쌍 2~3개** (few-shot) |
| 엣지 케이스마다 결과가 다름 | 케이스별 **입력 + 기대 출력** 예시 |
| 사후 수정 주기를 줄이고 싶음 | **테스트 먼저** 작성 후 실패 공유 |
| 경험 없는 도메인, 숨은 고려사항 도출 | **`AskUserQuestion`으로 인터뷰** |
| 인터뷰 후 구현 단계 | **독립 스펙 작성 → 새 세션에서 구현** |

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| few-shot / concrete example | 구체적 예시 | 산문 설명보다 강력 |
| test-driven iteration pattern | 테스트 주도 반복 | 테스트 → 구현 → 실패 공유 |
| `AskUserQuestion` | 역인터뷰 도구 | 엣지 케이스·트레이드오프 도출 |
| self-contained spec | 독립 명세서 | 대화록 대신 남기는 산출물 |
| fresh session | 새 세션 | 편향·노이즈 제거 |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| write a test suite covering the expected throttling behavior first | 기대 동작을 담은 테스트 먼저 | 6·99 |
| then implement, iterating by sharing test failures | 이후 구현, 실패 공유로 반복 | 6·99 |
| ask it to interview the architect using the AskUserQuestion tool | AskUserQuestion으로 인터뷰 요청 | 18·57·102 |
| exploring technical implementation, edge cases, and tradeoffs | 구현·엣지 케이스·트레이드오프 탐색 | 18·102 |
| focusing on failure modes and tradeoffs rather than obvious questions | 뻔한 질문 말고 실패 모드에 집중 | 57 |
| Continue answering until ranking, filtering, and failure-mode are covered | 모든 항목이 커버될 때까지 답변 | 30 |
| have Claude write a complete self-contained spec naming files and interfaces | 파일·인터페이스를 명시한 독립 스펙 작성 | 30 |
| start a fresh session focused only on implementing that spec | 새 세션에서 스펙 구현만 집중 | 30 |
| Provide a specific test case showing a record with a null field | null 필드 레코드의 구체적 케이스 제시 | 36 |
| and the expected output record with an empty string | 기대 출력까지 함께 | 36 |
| Provide 2-3 example input strings, each paired with the exact output | 정확한 출력이 짝지어진 예시 2~3개 | 40 |
| so the ambiguous format resolves to a concrete rule | 모호한 형식이 구체 규칙으로 확정 | 40 |
| Write a test suite first that encodes the banker's rounding behavior | 반올림 동작을 담은 테스트 선작성 | 41 |
| Supply a small set of concrete input/output examples, one per edge case | 엣지 케이스별 입출력 예시 소수 | 53 |
| so each ambiguous case has an unambiguous target output | 모호한 케이스마다 명확한 목표 출력 | 53 |
| Provide 2-3 concrete input/output pairs covering domestic, international | 국내·국제·내선을 커버하는 입출력 쌍 | 55 |
| so Claude can infer the exact rule from examples alone, not prose | 산문이 아닌 예시로 규칙을 추론 | 55 |
| so "concise" is anchored to a concrete example | 추상어를 구체 예시에 고정 | 62 |
| including one row with an empty cell and one with a quoted comma | 빈 셀·따옴표 쉼표 행을 포함 | 89 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| implement the rate limiter first, then write a matching test suite | 구현 먼저, 테스트 나중 | TDD 아님 |
| manually verify by running sample requests, without automated tests | 수동 검증 | 반복 주기 안 줄어듦 |
| describe the algorithm in a design document ... without writing tests | 설계 문서만, 테스트 없음 | TDD 아님 |
| Search for an open-source editor and replicate its architecture | 오픈소스 아키텍처 복제 | 고유 요구 미반영 |
| Write a complete technical specification personally | 혼자 전체 명세 작성 | 미경험 도메인 |
| use every bug found through manual testing as the primary source | 버그로 설계 고려사항 도출 | 사후 대응 |
| relying on the conversation transcript as the sole record | 대화록만을 기록으로 의존 | 스펙 부재 |
| Answer only the first two or three questions | 두세 개만 답하고 진행 | 가정 남발 |
| letting it infer the required parameters from the schema alone | 스키마만으로 추론 | 비즈니스 로직 누락 |
| Tell Claude the script has a bug involving null values | 필드·기대값 없이 버그만 언급 | 모호 |
| a generic try/except block so any record is skipped silently | 예외로 무음 스킵 | 데이터 손실 은폐 |
| Ask Claude to throw an exception whenever an ambiguous format | 모호하면 예외 발생 | 기능 요구 위배 |
| more forceful language demanding "get the dates right this time" | 강한 어조만 추가 | 효과 없음 |
| ask Claude to use its best judgment | 최선의 판단에 위임 | 불확실성 증가 |
| Describe the rules in a single long paragraph of prose | 긴 산문 한 문단 | 경계 조건 오해 |
| whatever rounding order seems most common in e-commerce | 업계 통념대로 추측 | 수정 주기 증가 |
| Increase the temperature or creativity setting | 온도 상승 | 만능 오답 |
| three separate reformatting functions, one for each edge case | 케이스별 함수 분리 | 호출부에 복잡도 전가 |
| Schedule a full team design review meeting | 전체 설계 리뷰 회의 | 오버헤드 조건 위배 |
| prepend each rule with all-caps modifiers like IMPORTANT and MUST | 대문자 강조 | 모호성 해소 못 함 |
| exhaustive prose detail rather than examples | 예시 없는 상세 산문 | 모호성 잔존 |
| a stop sequence to truncate any further text | 중단 시퀀스로 절단 | 문장 파손 |
| Remove the word 'concise' and let the model determine the length | 모델이 알아서 결정 | 일관성 악화 |
| adding TODO comments for any edge cases it cannot resolve | TODO 남기고 진행 | 미완성 |
| select the most popular CSV parsing library and rely on its defaults | 인기 라이브러리 기본 동작 의존 | 고유 요구 미충족 |

---

## 9. 피드백 전달 방식 (버그 보고 그룹핑)

**해당 문제**: 27, 45, 60, 71, 90

### 판단 규칙 (최중요)
| 관계 | 전달 방식 |
|---|---|
| **같은 로직·임계 영역을 공유**하는 결함들 | **한 메시지에 함께** (수정이 서로 영향) |
| 원인이 다르지만 한 함수 내 독립 지점 | 전체 출력을 한 번에 주고 일괄 검증 |
| 혼합 (연관 2 + 무관 1) | 연관된 것만 묶고, 무관한 것은 분리 |
| 코드 작성 세션에서 셀프 리뷰 | 편향 유지 — 독립 세션에서 리뷰 |

> 기본값은 **한 번에 전부 주고 일괄 검증**이다. 정보를 쪼개거나 숨기는 보기는 거의 항상 오답.
> 다만 **연관/무관이 명확히 섞이면**(71·90) 연관된 것만 묶고 무관한 것은 분리하는 쪽이 정답이다.

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| Describe both bugs together in one message | 두 버그를 한 메시지에 함께 기술 | 27 |
| since a fix for the shared critical section will alter the locking constraints | 공유 임계 영역 수정이 락 제약을 바꾸므로 | 27 |
| retains the reasoning and assumptions used while writing the code | 작성 당시 추론·전제를 그대로 유지 | 45 |
| tends to re-apply the same blind spots | 동일한 사각지대를 재적용 | 45 |
| Share the full test output for all three failures in one message | 세 실패의 전체 출력을 한 메시지에 | 60 |
| verify the result by rerunning the entire test suite | 전체 테스트 재실행으로 검증 | 60 |
| Report the two deduplication-store failures together | 같은 스토어 로직의 두 실패를 함께 | 71 |
| since they interact through the same store logic | 같은 스토어 로직으로 상호작용하므로 | 71 |
| report the malformed-JSON failure separately | 무관한 실패는 별도로 보고 | 71 |
| Describe the retry backoff and job-locking interaction in one message | 타이머를 공유하는 둘을 한 메시지에 | 90 |
| separately note the log-level fix as an unrelated change | 로그 레벨은 무관한 변경으로 분리 | 90 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| get its full fix merged with tests, then later file the concurrency bug | 하나씩 병합 후 나중에 별도 이슈 | 회귀 위험 |
| without mentioning the shared critical section | 공유 임계 영역 언급 없이 | 핵심 누락 |
| Ask Claude to randomly choose one of the two bugs | 무작위로 하나 선택 | 비결정론적 |
| defer the stale-read bug to a future sprint | 다음 스프린트로 유예 | 무결성 파괴 |
| runs out of available context window tokens by the time review begins | 리뷰 시점에 토큰 소진 | 근본 이유 아님 |
| caches tool call results per session, causing stale file contents | 세션별 캐시로 오래된 내용 재사용 | 거짓 |
| The --print flag disables the Read tool after the first turn | print가 Read를 비활성화 | 거짓 |
| Report the null check issue first because it is a runtime crash risk | 크래시 위험을 먼저 | 정보 은폐 |
| Ask Claude to guess which failure is the root cause | 근본 원인을 추측하게 함 | 환각 유발 |
| Report all three failures individually in separate messages | 셋 모두 개별 분리 | 연관 로직 분리 |
| Wait until all three tests pass or fail consistently across several runs | 여러 번 재실행 후 대기 | 불필요한 지연 |
| Combine all three items into a single inseparable change | 셋을 분리 불가한 하나로 | 잘못된 결합 |
| while intentionally leaving out the fact that they are coupled | 결합 사실을 의도적으로 누락 | 핵심 은폐 |

---

## 10. 반복 출제 문항 (동일/거의 동일)

| 내용 | 문항 | 정답 요지 |
|---|---|---|
| `.claude/rules/` symlink 지원 여부 | **4, 10, 21** | 지원 + 순환 감지, 링크 타깃 검증 |
| `CLAUDE.md`에서 `@path` 임포트 회피 | **20, 34, 42** | 백틱으로 감싸기 (code span 제외) |
| 동명 스킬 우선순위 (personal vs project) | **9, 51, 85** | **Personal 승** |
| rate limiter TDD 접근 | **6, 99** | 테스트 먼저 → 구현 → 실패 공유 |
| 실시간 협업 편집기 사전 도출 | **18, 102** | `AskUserQuestion` 인터뷰 |
| `*.test.*` 규칙 단일화 | **44, 48, 77** | `.claude/rules/` + `**/*.test.*` glob |
| 온디맨드 로딩으로 세션 비용 절감 | **76, 88** | 스킬로 분리 |
| 단일 함수/파일 수정 = direct execution | **3, 13, 22, 66, 92, 98** | 탐색·설계 불필요 |
| 넓은 조사 → 서브에이전트 위임 | **31, 46** | Explore가 요약만 반환 |
| `context: fork`로 컨텍스트 격리 | **38, 84** | 서브에이전트 실행 + 요약 반환 |
| `allowed-tools`는 제한이 아님 | **11, 79** | 승인 생략일 뿐, `disallowed-tools` 필요 |
| few-shot 입출력 예시로 모호성 해소 | **36, 40, 53, 55, 62, 89** | 구체적 입출력 쌍 제시 |

---

## 11. 시험 직전 30초 복습

1. **여러 대안·다중 파일·미결 설계 = plan mode / 단일 파일 + 원인 명확 = direct execution.** 스키마 변경이라도 작으면 direct.
2. **넓은 조사는 Explore 서브에이전트, 긴 출력이 세션에 남으면 `context: fork`.** 서브에이전트는 메인 대화 이력을 **못 본다**.
3. **로딩 시점**: 루트+상위 CLAUDE.md와 `paths` 없는 rules = 시작 시 / 하위 CLAUDE.md와 `paths` 있는 rules = **그 파일을 읽을 때**. Glob·Bash 노출만으론 안 된다. compaction 후 루트만 재주입.
4. **`*` = 직하위 / `**` = 임의 깊이 / `{ts,tsx}` = 중괄호 확장.** `paths`는 **배열**, 키 이름은 `include`가 아니라 `paths`.
5. **위치 결정**: 모든 프로젝트+개인 = `~/.claude/` / 이 저장소+개인 = `CLAUDE.local.md`+gitignore / 팀 배포 = `.claude/` 커밋 / 나만 제외 = `settings.local.json` / 조직 강제 = `managed-settings.json`.
6. **스킬 충돌은 Personal이 이긴다.** `allowed-tools`는 **승인 생략**일 뿐 차단이 아니다 — 차단은 `disallowed-tools`. `argument-hint`는 표시 전용.
7. **"Claude가 기억/선택하는 것에 의존하면 안 됨" = `PreToolUse` 훅.** CLAUDE.md는 컨텍스트지 강제 계층이 아니다.
8. **CI**: `-p` 없으면 hang / `acceptEdits`는 파일·기본 fs만 (네트워크 ❌) / 사람 없으면 `dontAsk` / 러너 격리는 `--bare` / `Bash(cmd*)`의 `*`는 접두사 매칭 / stdin 10MB.
9. **모호한 규칙 = 입출력 예시 2~3개. 수정 주기 감소 = 테스트 먼저. 미경험 도메인 = `AskUserQuestion` 인터뷰 → 독립 스펙 → 새 세션.**
10. **테스트 실패는 전체 출력을 한 번에 주고 전체 재실행으로 검증. 같은 로직을 공유하면 반드시 한 메시지에, 연관/무관이 섞이면 연관된 것만 묶는다.** 온도·예산·턴 수·재부팅·재클론·대문자 강조는 **거의 항상 오답**.
