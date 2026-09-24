# 시나리오1_CICD

## 질문 1

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The review criteria live in standards/review-criteria.md so other tooling can share the file, and every CI-invoked Claude Code session must have the criteria in context from launch. How should CLAUDE.md reference the file?

**A.** Move the criteria into .claude/rules/review-criteria.md with a paths glob so the rule activates whenever the pipeline runs a review.

**설명**

경로 범위(path-scoped) 규칙은 글롭에 매칭되는 파일을 다룰 때만 로드되며, 세션 시작 시 무조건 로드되지 않는다. 리뷰 기준은 풀 리퀘스트가 어떤 파일을 건드리는지와 무관하게 모든 리뷰에 적용되어야 하므로, 조건부 로딩은 여기에 맞지 않는다.

**B(정답).** Add the line @standards/review-criteria.md to the project CLAUDE.md so the file's contents expand into context at launch.

**설명**

이것이 공식 문서에 명시된 가져오기(import) 메커니즘이다. CLAUDE.md 텍스트에 @path 참조를 넣으면 참조된 파일이 시작 시점에 확장되어 컨텍스트로 로드되며, 원본 파일을 모듈화되고 공유 가능하게 유지하면서도 모든 세션이 해당 내용을 보게 된다.

**C.** Copy the criteria into a CLAUDE.md placed inside the standards/ subdirectory so every session inherits it automatically.

**설명**

하위 디렉터리에 중첩된 CLAUDE.md 파일은 Claude가 해당 하위 디렉터리 안의 파일을 읽을 때 온디맨드로 로드되며, 세션 시작 시에는 로드되지 않는다. 따라서 standards/를 전혀 건드리지 않는 CI 리뷰 세션은 해당 기준을 로드하지 않게 된다. 내용을 복사하는 방식은 공유 파일과 점점 어긋나는 두 번째 진실의 원천(source of truth)을 만들어내기도 한다.

**D.** Wrap the path in backticks as `@standards/review-criteria.md` inside CLAUDE.md so Claude Code resolves and reads the file on demand.

**설명**

가져오기 파싱은 마크다운 코드 스팬과 펜스 코드 블록을 건너뛴다. 백틱으로 감싼 경로는 리터럴 텍스트로 취급되어 절대 임포트되지 않는다. Claude가 우연히 그 파일을 직접 읽지 않는 한, 해당 기준은 컨텍스트에 전혀 들어오지 않게 된다.

### 전반적인 설명

CLAUDE.md은 인라인 가져오기(import) 문법을 지원한다. 파일 텍스트에 직접 @path/to/file을 쓰면 세션이 시작될 때 Claude Code가 해당 파일을 컨텍스트로 확장한다. 여기서의 사고 모델은 지연 참조(lazy reference)가 아니라 텍스트 포함(textual inclusion)이다. 임포트는 설정을 모듈화되고 공유 가능하게 유지하기 위해 존재하며(다른 툴링도 함께 소비할 수 있는 하나의 정본 기준 파일), 로드된 컨텍스트는 그 내용을 그대로 붙여넣은 것과 동일하다. 이는 또한 임포트가 컨텍스트 사용량을 줄여주지 않는다는 뜻이기도 하다 — 모든 내용이 여전히 사전에 전부 로드된다. 상대 경로는 임포트를 포함한 파일을 기준으로 해석되며, 임포트는 문서화된 깊이 제한까지 재귀적으로 중첩될 수 있다.

흔히 헷갈리는 두 가지 세부사항이 있다. 첫째, 가져오기 파싱은 코드 스팬과 펜스 코드 블록을 의도적으로 건너뛰므로, 백틱으로 감싼 경로는 리터럴 텍스트로 남는다. 이는 경로를 언급만 하고 임포트하지 않기 위한 탈출구인데, 실제로 임포트를 원할 때는 정확히 반대 효과를 낸다. 둘째, 로딩 동작은 메커니즘별로 다르다. 루트 및 상위 CLAUDE.md 파일(및 그 임포트)은 시작 시 로드되고, 중첩된 하위 디렉터리 CLAUDE.md 파일은 Claude가 해당 디렉터리의 파일을 읽을 때 온디맨드로 로드되며, paths 글롭이 있는 .claude/rules/ 파일은 Claude가 매칭되는 파일을 다룰 때만 로드된다. 모든 CI 실행을 지배해야 하는 범용 리뷰 기준의 경우, 임포트를 사용한 항상 로드되는 영역이 올바른 배치이다. 조건부 또는 온디맨드 영역은 일부 리뷰를 기준 없이 실행되게 만들며, 내용을 중복하는 것은 공유 파일이 제공하는 단일 진실의 원천을 포기하는 셈이다.

가져오기 문법, 해석 규칙, 로드 순서는 Manage Claude's memory 문서를 참고하고, /memory와 /context로 세션이 실제로 무엇을 로드했는지 확인하는 방법은 Debug your configuration 문서를 참고하라.

### 도메인

Claude Code Configuration & Workflows



## 질문 2

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A CI review pass flags three findings that all trace back to one shared validation design, plus four unrelated one-line fixes in separate modules. How should these findings be fed to Claude Code for remediation?


**A(정답).** Provide the three interrelated findings in one message, then address the four unrelated fixes sequentially in separate turns.

**설명**

이는 각 클러스터를 올바른 전달 패턴에 맞춘 것이다. 서로 의존하는 이슈들은 함께 제시되어야 그 수정이 하나의 일관된 설계 결정을 반영할 수 있고, 독립적인 이슈들은 한 번에 하나씩 처리하는 것이 가장 신뢰도 높다. 이렇게 하면 각 변경을 다른 변경의 방해 없이 만들고 검증할 수 있다.

**B.** Group the findings by severity level and submit each tier as its own message, addressing the highest severity tier first.

**설명**

심각도는 우선순위를 결정할 뿐, 수정을 위해 발견 사항을 어떻게 그룹화해야 하는지를 결정하지 않는다. 심각도 등급에는 서로 결합된 이슈와 무관한 이슈가 섞여 있을 수 있으므로, 이런 그룹화는 상호 의존적인 발견 사항을 함께 두지도, 독립적인 발견 사항을 분리하지도 못한다.

**C.** Work through every finding one at a time in separate turns, verifying each individual fix before introducing the next one.

**설명**

엄격하게 순차적으로 처리하면 상호 의존적인 클러스터가 분리되어 버린다. 다른 두 발견 사항을 보지 못한 채 결합된 발견 사항 하나를 수정하면, 공유된 검증 설계와 충돌하는 지역적(local) 패치가 나올 위험이 있고, 나머지 발견 사항이 드러날 때 재작업이 강제된다.

**D.** Submit all seven findings together in a single message so one remediation pass resolves everything without repeating context.

**설명**

모든 것을 한 번에 묶으면 무관한 수정들이 같은 작업 집합에 섞여 들어가 주의가 분산되고 각각의 독립적인 변경을 검증하기 어려워진다. 함께 제시되어 이득을 보는 것은 결합된 세 가지 발견 사항뿐이며, 무관한 발견 사항들은 같은 메시지에 묶여도 얻는 것이 없다.

### 전반적인 설명

Claude Code에 여러 이슈를 넘길 때 결정 요인이 되는 것은 개수나 심각도가 아니라 결합도(coupling)이다. 여러 발견 사항이 근본 원인을 공유하거나 서로 상호작용할 때는 모델이 그것들을 한꺼번에 추론해야 하며, 함께 제시하면 서로 충돌하는 세 개의 지역적 패치 대신 하나의 일관된 수정을 설계할 수 있다. 발견 사항들이 정말로 독립적이라면 순차적으로 제시하는 것이 더 잘 작동한다. 각 턴이 좁고 검증 가능한 목표를 갖고, 디프가 자신 있게 검토할 수 있을 만큼 작아지며, 한 수정의 실수가 다른 것을 오염시키지 않는다.

대안들의 실패 양상은 왜 이런 구분이 존재하는지 잘 보여준다. 모든 발견 사항을 한 메시지에 몰아넣으면 모델이 무관한 관심사들을 하나의 작업 집합에서 다뤄야 하므로, 일부 수정이 얕아지거나 한 이슈에 대한 변경이 다른 이슈와 의도치 않게 상호작용할 가능성이 커진다. 엄격하게 하나씩 처리하는 방식은 정반대의 문제를 갖는다. 결합된 발견 사항을 독립적으로 수정하면, 모델이 공유된 설계 제약을 본 적이 없기 때문에 형제 발견 사항의 최종 수정과 충돌하는 패치가 나오는 경우가 많다. 심각도 순서는 완전히 다른 질문(무엇을 먼저 고칠지)에 답하는 것이며, 심각도 등급은 원래 목록과 마찬가지로 결합된 이슈와 무관한 이슈가 섞여 있을 가능성이 높다.

유용한 사고 모델은 "설계 결정 하나당 메시지 하나"이다. 세 가지 발견 사항이 검증 레이어에 대한 하나의 결정으로 해결된다면 그것은 하나의 메시지이고, 각각 독립적으로 존재하는 네 가지 발견 사항은 네 개의 결정이므로 각각 검증을 마친 뒤 다음으로 넘어가는 네 번의 턴이 된다. 작업의 범위를 정하고 반복하는 방법에 대해서는 Claude Code Best Practices와 Claude Code 문서를 참고하라.

### 도메인

Claude Code Configuration & Workflows



## 질문 3

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The CI test-generation job writes tests that ignore team testing conventions. Test files sit beside the code they test across dozens of directories. How should the conventions be configured so they load only when test files are involved?

**A.** Add the testing conventions to the root CLAUDE.md so every session, including CI runs, loads them unconditionally.

**설명**

이것은 틀렸다. 루트 CLAUDE.md 내용은 작업 종류와 무관하게 모든 세션에 로드되어, 테스트 파일이 전혀 관련 없는 경우에도 컨텍스트를 소비하고 주의를 경쟁시킨다. 요구사항은 조건부 로딩인데, 무조건적인 프로젝트 메모리는 이를 제공하지 못한다.

**B.** Add a CLAUDE.md file to every directory that contains test files, duplicating the testing conventions in each one.

**설명**

이것은 틀렸다. 디렉터리 단위 CLAUDE.md 파일은 특정 폴더에 묶여 있으므로, 수십 개의 디렉터리에 흩어진 코로케이션 테스트 파일들을 다루려면 수십 개의 중복 사본이 필요해진다. 그러면 컨벤션이 바뀔 때마다 여러 곳을 수정해야 하는데, 이는 경로 범위 규칙이 애초에 피하려는 유지보수 문제이다.

**C.** Package the conventions as a skill in .claude/skills/ so the pipeline invokes it explicitly before generating tests.

**설명**

이것은 틀렸다. 스킬은 작업별 워크플로에 적합한 온디맨드 메커니즘이며, 컨벤션을 옵트인 방식으로 만들면 스킬을 호출하지 않는 경로에서는 규칙에 맞지 않는 테스트가 생성된다. 파일 유형에 묶인 컨벤션은 명시적 호출 단계에 의존하지 않고 매칭되는 파일이 다뤄질 때 자동으로 활성화되어야 한다.

**D(정답).** Create a rule file in .claude/rules/ with paths frontmatter listing globs like **/*.test.ts and **/*.test.tsx.

**설명**

이것이 정답이다. **/*.test.ts 같은 글롭 패턴을 가진 경로 특정 규칙은 디렉터리에 무관하게 유형별로 테스트 파일을 매칭하므로, Claude가 매칭되는 파일을 다룰 때 정확히 컨벤션이 로드된다. 테스트 파일이 트리 전체에 얼마나 흩어져 있든 깔끔하게 확장된다.

### 전반적인 설명

.claude/rules/ 디렉터리는 단일 거대 CLAUDE.md에 대한 모듈식 대안이며, 그 핵심 기능은 조건부 로딩이다. 규칙 파일은 YAML 프론트매터에 글롭 패턴을 담은 paths 필드를 선언할 수 있고, 해당 규칙은 Claude가 그 패턴에 매칭되는 파일을 다룰 때만 적용된다. **/*.test.ts 같은 글롭은 디렉터리와 무관하게 파일 유형으로 매칭되는데, 이는 코로케이션 테스트를 쓰는 코드베이스에 정확히 필요한 기능이다. 하나의 규칙 파일이 위치와 무관하게 모든 테스트 파일을 관리하고, 테스트와 무관한 세션에서는 컨텍스트에 들어오지 않는다.

여기서의 사고 모델은 경로 범위 규칙이 항상 켜져 있는 컨텍스트를 관련성(relevance)과 교환한다는 것이다. 무조건적인 메모리(루트 CLAUDE.md, 또는 paths 필드가 없는 규칙)는 시작 시 로드되어 모든 작업에서 주의를 경쟁하지만, 경로 범위 규칙은 그 예산을 깨끗하게 유지하면서 정확히 필요한 순간에 컨벤션을 드러낸다. 이는 개발자가 없어 누락된 컨텍스트를 채워 넣을 수 없는 무인 실행 환경인 CI에서 두 배로 중요하다.

디렉터리 단위 CLAUDE.md 파일은 컨벤션이 실제로 한 폴더에 속할 때는 여전히 유용하지만, 관련 파일이 위치가 아니라 유형으로 식별되는 코드베이스 전체를 다룰 수는 없다. 디렉터리별로 이를 중복시키면 결국 어긋나게(drift) 된다. 스킬은 완전히 다른 문제, 즉 온디맨드 작업별 절차를 해결한다. 파일 유형 컨벤션을 옵트인 스킬로 바꾸면 정확성이 스킬 호출을 기억하는 것에 의존하게 된다. 규칙 디렉터리, paths 프론트매터, 지원되는 글롭 패턴에 대해서는 Manage Claude's memory 문서를 참고하라.

### 도메인

Claude Code Configuration & Workflows



## 질문 4

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline auto-remediates review findings by sending Claude Code one finding per invocation. On a PR where three findings stem from the same flawed abstraction, each fix keeps reintroducing another finding. What should change?

**A.** Run each fix in its own isolated git worktree in parallel and merge the three branches at the end.

**설명**

격리는 문제를 더 악화시킨다. 서로의 존재를 모른 채 만들어진 세 개의 수정은 병합 시점에 조율해야 하는데, 이때 공유 추상화에 대한 서로 충돌하는 가정들이 부딪히게 된다. 워크트리는 결합된 작업이 아니라 독립적인 병렬 작업에 적합하다.

**B(정답).** Send the three related findings in one prompt so a single coherent change resolves their shared cause.

**설명**

근본 원인을 공유하기 때문에 서로 상호작용하는 이슈들은 함께 제시되어야 한다. 그래야만 Claude가 세 가지 제약을 한꺼번에 만족하는 하나의 수정을 설계할 수 있다. 순차적으로 전달하면 상호작용이 감춰지므로, 각 수정이 하나의 발견 사항에는 최적화되지만 다른 것을 위반하게 된다.

**C.** Reorder the sequential invocations by severity so the most critical of the three fixes is applied first.

**설명**

순서를 바꾸는 것으로는 발견 사항들 간의 상호작용이 사라지지 않는다. 어떤 수정이 먼저 적용되든 여전히 나머지 두 제약을 보지 못한 채 이루어진다. 순서와 무관하게 회귀는 계속될 것이다.

**D.** Wrap each invocation in a retry loop that re-runs the reviewer after every fix until zero findings remain.

**설명**

이는 반복적인 변경(churn)을 치유하는 것이 아니라 자동화할 뿐이다. 각 재시도는 여전히 한 번에 하나의 발견 사항만 보므로, 루프가 서로를 무효화하는 수정들 사이에서 진동할 수 있다. 재시도 루프는 형식이나 검증 오류에는 유용하지만 구조적으로 결합된 변경에는 적합하지 않다.

### 전반적인 설명

여기서 나타나는 증상은 상호작용하는 이슈들을 순차적으로 전달했을 때 나타나는 전형적인 신호이다. 세 가지 발견 사항이 하나의 결함 있는 추상화로 귀결되므로, 한 발견 사항만 보고 독립적으로 만든 수정은 공유 코드를 바꾸어 다른 발견 사항을 다시 유발하게 된다. Claude Code는 자신이 볼 수 있는 제약에 대해서만 추론할 수 있다. 각 호출이 하나의 발견 사항만 담고 있으면, 모델은 자신의 변경이 동시에 다른 두 요구사항도 만족해야 한다는 사실을 알 방법이 없다.

Claude에게 이슈를 전달하는 방식을 결정하는 규칙은 개수가 아니라 결합도이다. 문제들이 상호 의존적일 때는 모두 하나의 메시지에 담아 제시해야, 모델이 모든 제약을 한꺼번에 고려하는 일관된 하나의 변경을 설계할 수 있다. 문제들이 독립적일 때는 순차적인 턴이 더 낫다. 각 수정이 더 작고, 검토하기 쉬우며, 독립적으로 검증할 수 있기 때문이다. 이는 인간 엔지니어가 일하는 방식과 유사하다. 결합된 결함은 하나의 리팩터로 처리하고, 무관한 결함은 별도의 커밋으로 처리한다.

심각도별 재정렬, 재시도 루프, 병렬 워크트리는 모두 동일한 근본 이유로 실패한다. 오실레이션을 유발한 발견 사항별 격리를 그대로 유지하기 때문이다. 특히 재시도 루프는 여기서 안티패턴으로 주의할 필요가 있다. 검증-재시도는 결함이 모델이 스스로 고칠 수 있는 형식이나 구조적 오류일 때는 잘 작동하지만, 연속된 수정들이 구조적으로 서로 충돌할 때는 수렴할 수 없다.

Claude Code로 작업의 범위를 정하고 반복하는 방법에 대해서는 Claude Code Best Practices와 Claude Code Common Workflows를 참고하라.

### 도메인

Claude Code Configuration & Workflows



## 질문 5

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Reviews on one engineer's laptop consistently apply the team's review criteria, but the same reviews in the CI pipeline ignore them. The criteria live only in the engineer's user-level ~/.claude/CLAUDE.md; no project CLAUDE.md contains them. What is the correct fix, and how do you confirm the scoping?

**A(정답).** Use /memory to inspect the memory file locations, then move the criteria from the user-level CLAUDE.md into the project CLAUDE.md in the repository.

**설명**

이것이 정답이다. ~/.claude/CLAUDE.md에 있는 사용자 수준 메모리는 그 사용자의 머신에만 적용되며 절대 버전 관리를 통해 전달되지 않으므로, 저장소를 클론하는 CI 러너는 여기에 접근할 수 없다. /memory 명령은 메모리 파일 위치를 나열하고 열고 편집할 수 있게 해주므로, 기준이 사용자 범위에 있음을 확인할 수 있고, 이를 프로젝트 CLAUDE.md로 옮기면 모든 CI 작업이 받는 체크아웃의 일부가 된다.

**B.** Inline the full review criteria into the -p prompt string for each CI job so no memory file is a dependency at review time.

**설명**

모든 파이프라인 스크립트에 기준을 직접 넣으면 설정이 중복되고, 팀이 로컬 세션용으로 유지 관리하는 버전과 분리되어 결국 서로 어긋나게 된다. CLAUDE.md는 정확히 이런 문제를 피하기 위해 존재한다. 하나의 원천에서 대화형 실행과 CI 실행 모두에 프로젝트 컨텍스트가 일관되게 로드되도록 하는 것이다.

**C.** Copy the engineer's ~/.claude/CLAUDE.md into the CI runner's home directory as a pipeline setup step so the criteria load during CI reviews.

**설명**

기계적으로는 작동하지만 설계상 잘못됐다. 복사된 파일은 버전 관리가 되지 않고, 러너마다 별도로 유지 관리해야 하며, 엔지니어가 원본을 수정할 때마다 눈에 띄지 않게 어긋나게 된다. 팀이 공유하는 지침은 버전 관리로 자동 배포되는 프로젝트 수준 CLAUDE.md에 있어야 한다.

**D.** Add the review criteria to .claude/settings.json, which is committed and therefore applied by every CI invocation.

**설명**

settings.json 파일은 권한, 도구 설정, 훅을 담는 것이며 자연어 지침이나 리뷰 기준을 담는 것이 아니다. 자연어 가이드를 그곳에 넣어도 모델의 컨텍스트로 전달되지 않는다. 지침 내용은 CLAUDE.md 같은 메모리 파일에 있어야 한다.

### 전반적인 설명

Claude Code는 여러 위치의 계층 구조에서 메모리를 로드한다. 관리형 정책 파일, 사용자 수준의 ~/.claude/CLAUDE.md, 프로젝트 수준 파일(./CLAUDE.md 또는 ./.claude/CLAUDE.md), 그리고 개인적이고 커밋되지 않는 프로젝트 노트를 위한 CLAUDE.local.md이다. 이 시나리오를 푸는 사고 모델은 프로젝트 수준 파일만이 저장소와 함께 이동한다는 것이다. 사용자 범위에 있는 무언가는 그 한 대의 머신에서의 세션만 형성하고 다른 곳에는 전혀 영향을 주지 않는다. 이것이 바로 로컬에서는 작동하는 기준이 파이프라인에서는 사라지는 이유이다. CI 러너는 저장소를 체크아웃하고, 그 기준을 담은 프로젝트 수준 메모리를 찾지 못하며, 기준 없이 리뷰를 수행한다.

/memory 명령은 이런 종류의 문제를 관리하는 진입점이다. 메모리 파일 위치를 나열하고 열고 편집하고 생성할 수 있게 해주므로, 기준이 저장소가 아니라 사용자 수준 파일에 있다는 것을 확인해준다. 특정 세션이 실제로 컨텍스트에 무엇을 로드했는지 확인하려면 /context가 Memory files 섹션을 보여주므로, 로컬 세션과 CI 실행을 비교하면 그 차이가 드러난다. 진단이 끝나면 해결책은 절차적인 것이 아니라 구조적인 것이다. 기준을 커밋된 프로젝트 CLAUDE.md로 옮겨서, CI 체크아웃을 포함한 모든 클론이 동일하게 그것을 받도록 하는 것이다.

대안들은 모두 같은 실패를 다른 형태로 다시 끌고 온다. 홈 디렉터리 파일을 러너에 수동으로 복사하면 원본과 어긋나는 버전 관리 안 된 설정이 생긴다. .claude/settings.json은 지침용 텍스트가 아니라 권한, 도구, 훅을 위한 것이다. 그리고 각 -p 호출에 기준을 인라인으로 넣으면 팀의 정본 가이드가 파이프라인 스크립트로 갈라져 나가 영원히 발맞춰 갱신해야 한다. 공유 지침에는 설계상 정해진 하나의 자리가 있으며, 그것이 바로 버전 관리 하의 프로젝트 메모리 파일이다. Manage Claude's memory와 슬래시 커맨드 레퍼런스를 참고하라.

### 도메인

Claude Code Configuration & Workflows



## 질문 6

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A pipeline stage delegates a dependency survey to the Explore subagent and also instructs it to fix the outdated import statements it finds. The survey summary comes back, but no files were changed. What is the correct adjustment?

**A.** Raise Explore's thoroughness level to very thorough so it performs edits in addition to its analysis.

**설명**

철저함(thoroughness) 수준(quick, medium, very thorough)은 Explore가 얼마나 깊이 검색하고 분석하는지를 제어할 뿐, 어떤 도구를 사용할 수 있는지를 제어하지 않는다. 어떤 철저함 설정도 Explore에 쓰기 권한을 부여하지 않으며, 모든 수준에서 읽기 전용으로 유지된다.

**B.** Override Explore's model field to a larger model, since its default model cannot generate code patches.

**설명**

서브에이전트가 어떤 모델에서 실행되는지는 능력과 비용에 영향을 줄 뿐, 도구 권한에는 영향을 주지 않는다. 가장 능력이 뛰어난 모델에서 실행되더라도 Explore의 도구 목록은 여전히 Write와 Edit을 제외하므로, Explore가 초안으로 만든 패치는 파일에 절대 적용될 수 없다.

**C(정답).** Delegate the fix work to the general-purpose subagent, since Explore is read-only and denies Write and Edit.

**설명**

이것이 정답이다. Explore는 코드베이스 검색과 분석에 최적화된 내장 읽기 전용 서브에이전트이며, Write와 Edit 도구는 설계상 거부되어 있다. 작업이 탐색과 수정을 모두 필요로 할 때는, 문서에 명시된 적합한 선택이 내장 general-purpose 서브에이전트이다.

**D.** Run the survey in the main conversation instead, since file changes made inside any subagent are discarded on return.

**설명**

서브에이전트가 파일 변경을 버리는 것은 일반적인 규칙이 아니다. 쓰기 권한이 있는 general-purpose 서브에이전트는 지속되는 파일 수정을 수행한다. 여기서의 실패는 서브에이전트 실행 자체가 아니라 Explore의 읽기 전용 도구 제한에 국한된 문제이다.

### 전반적인 설명

여기서 가져야 할 사고 모델은, Claude Code의 내장 서브에이전트들이 프롬프트뿐 아니라 도구 접근 권한으로 특화되어 있다는 것이다. Explore는 코드베이스 검색과 분석에 최적화된 빠른 읽기 전용 에이전트로 문서화되어 있다. 파일을 찾고, 패턴을 grep하고, 코드를 읽을 수 있지만 Write와 Edit은 명시적으로 거부된다. 그 제한이 바로 설계의 핵심이다. Explore가 저장소를 절대 변경할 수 없기 때문에, 메인 대화는 광범위하고 시끄러운 탐색 작업을 마음 놓고 위임할 수 있다. 돌아오는 것은 오직 요약뿐, 어떤 부작용도 없다는 것을 알기 때문이다. CI 파이프라인에서는 사람이 실행을 지켜보지 않으므로 이 보장이 대화형 사용보다 훨씬 더 중요하다.

트레이드오프는 작업에 변경이 포함되는 순간 Explore가 잘못된 위임 대상이 된다는 것이다. 임포트를 조사한 뒤 고치는 것처럼 탐색과 행동이 결합된 작업에는, 검색과 편집에 필요한 도구를 모두 갖춘 내장 general-purpose 서브에이전트가 문서상 적합한 선택이다. 작업을 나누는 것도 합리적이다. 조사는 Explore가 담당하고, 반환된 요약을 이용해 메인 대화나 general-purpose 서브에이전트가 수정을 적용하는 방식이다.

오답들은 모두 같은 오해를 다른 형태로 드러낸다. 철저함 수준은 검색이 얼마나 깊이 이루어지는지를 정할 뿐, 에이전트가 무엇을 건드릴 수 있는지를 정하지 않는다. 더 큰 모델로 교체하는 것은 추론 능력을 바꿀 뿐 도구 권한을 바꾸지 않는다. 그리고 서브에이전트는 일반적으로 쓰기 권한이 있으면 파일 변경을 지속시킨다. "변경사항이 버려진다"는 이론은 에이전트별 도구 제한을 서브에이전트 메커니즘 자체의 문제로 잘못 돌리는 것이다. 내장 에이전트와 그 도구 경계에 대해서는 Subagents in Claude Code를 참고하라.

### 도메인

Claude Code Configuration & Workflows


## 질문 7

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The review job runs claude -p with --output-format json and --json-schema. Occasionally a run finishes with subtype success, yet the parsed envelope contains no structured_output, and the comment-posting step crashes. How should the pipeline handle these runs?

**A(정답).** Require both a success subtype and a present structured_output field before posting, and route other runs to a failure path.

**설명**

Anthropic 문서에 따르면 결과가 success 서브타입으로 끝나면서도 structured_output이 없을 수 있으므로, 견고한 자동화라면 두 조건을 모두 확인해야 한다. 이 필드가 없는 실행은 게시 단계로 넘기지 말고 실패로 처리하거나 재시도하거나 건너뛰어야 한다.

**B.** Add an instruction to the prompt telling Claude to always populate the structured_output field so it is never omitted.

**설명**

structured_output 필드는 프롬프트 수준 지침이 아니라 CLI의 검증 기계장치에 의해 채워지며, 검증은 재시도 횟수를 다 써버리고 데이터 대신 오류를 낼 수도 있다. 프롬프트 지침으로는 이 실패 모드를 없앨 수 없으므로 파이프라인에는 여전히 가드가 필요하다.

**C.** Fall back to regex-extracting findings from the result text field whenever the envelope's structured_output is missing.

**설명**

result 필드의 텍스트를 긁어오는 것은 스키마로 검증된 출력이라는 취지를 무너뜨리고, --json-schema가 애초에 제거하려는 취약성을 다시 끌어들인다. result의 텍스트는 스키마에 대해 검증된 것이 아니므로, 파싱된 결과가 형식이 잘못되거나 불완전할 수 있다.

**D.** Rely on the process exit code, since a zero exit guarantees the envelope contains a schema-valid structured_output payload.

**설명**

종료 코드는 호출 자체가 성공했는지를 알려줄 뿐, 구조화된 출력이 생성되었는지는 알려주지 않는다. 문서화된 동작은 정확히 실행이 structured_output 없이도 성공을 보고할 수 있다는 것이므로, 종료 상태만으로는 해당 필드의 존재를 보장할 수 없다.

### 전반적인 설명

Claude Code가 --output-format json과 --json-schema로 실행될 때, CLI는 모델의 최종 출력을 제공된 스키마에 대해 검증하고 불일치 시 다시 프롬프트한다. 이 검증 루프에는 제한된 재시도 예산이 있다. 그 한도 안에서 스키마에 맞는 출력이 생성되지 않으면, 실행은 사용 가능한 데이터 대신 실패 서브타입 error_max_structured_output_retries로 끝난다. 이와 별도로 Anthropic 문서는 결과가 success 서브타입을 가지면서도 structured_output을 완전히 생략할 수 있다고 명시한다. 여기서 가져야 할 사고 모델은, 스키마 강제가 보장이 아니라 명시적인 실패 채널을 가진 최선의 노력(best-effort) 메커니즘이라는 것이다. 이를 소비하는 자동화라면 반드시 가드 절이 필요하다.

인라인 PR 댓글을 게시하는 CI 파이프라인의 경우, 올바른 계약은 따라서 연결 조건(conjunctive)이어야 한다. 실행이 성공했고 structured_output 필드가 존재할 때만 진행하고, 그 외 모든 경우는 재시도나 실패 경로로 보내야 한다. 이렇게 하면 형식이 잘못되었거나 없는 발견 사항이 게시 단계에 도달하지 않고, 실패가 조용히 묻히지 않고 관찰 가능해진다. result 텍스트에 대한 정규식 대체는 이 플래그가 제공하는 검증 보장을 저버리는 것이다. 0 종료 코드를 믿는 것은 잘못된 신호를 확인하는 것인데, 성공과 구조화된 출력은 문서상 서로 분리될 수 있다고 명시되어 있기 때문이다. 그리고 프롬프트 지침으로는 검증 계층 자체가 생성하며 생성하지 않을 수도 있는 필드를 강제할 수 없다.

문서화된 엔벨로프 필드와 실패 서브타입은 Structured outputs와 Headless mode를 참고하라.

### 도메인

Claude Code Configuration & Workflows



## 질문 8

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Your CI pipeline invokes a /pr-review skill defined at .claude/skills/pr-review/SKILL.md. During one run, the skill edited a source file to demonstrate a suggested fix. Reviews must be strictly read-only. Which change enforces this?

**A(정답).** Set allowed-tools in the SKILL.md frontmatter to Read, Grep, and Glob, omitting every write-capable tool.

**설명**

이것이 정답이다. allowed-tools는 스킬이 실행 중 호출할 수 있는 도구를 강제로 제한하는 것이며, 모델이 무시할 수 있는 제안이 아니다. 읽기 전용 도구만 화이트리스트에 올리면 편집, 파일 쓰기, 셸 명령이 스킬에서 단순히 사용 불가능해지는데, 이는 무인 CI 실행에 필요한 보장이다.

**B.** Add argument-hint to the frontmatter so the skill prompts for an explicit review scope before it runs.

**설명**

이것은 틀렸다. argument-hint는 스킬이 인자 없이 호출될 때 누락된 매개변수를 물어보는 역할만 한다. 스킬이 어떤 입력을 받는지를 형성할 뿐, 실행 중 어떤 도구를 호출할 수 있는지를 제한하는 데는 아무 역할도 하지 않는다.

**C.** Write a prominent instruction in the SKILL.md body stating the skill must never edit or create files.

**설명**

이것은 틀렸다. 스킬 본문에 있는 지침은 모델이 확률적으로 따르는 가이드일 뿐, 강제되는 경계가 아니다. 시나리오에서 이미 편집이 새어 나간 사례를 보여주었으므로, 더 강한 프롬프트를 써도 무인 파이프라인에서 실패율이 0이 되지는 않는다.

**D.** Add context: fork to the frontmatter so the skill runs in an isolated subagent separate from the main session.

**설명**

이것은 틀렸다. context: fork는 능력이 아니라 컨텍스트 오염 문제를 다룬다. 장황한 스킬 출력이 메인 대화에 들어오지 않게 해주지만, 포크된 스킬도 모델이 선택하는 어떤 도구 호출이든 시도할 수 있으며, 파일 편집도 포함된다.

### 전반적인 설명

이 상황이 검증하는 핵심 구분은 스킬 안에서의 지침과 설정 수준 강제 사이의 차이이다. SKILL.md의 마크다운 본문은 모델이 참고하여 작업하는 프롬프트이며, 높지만 완벽하지 않은 신뢰도로 따른다. allowed-tools 프론트매터 필드는 종류가 다르다. 스킬이 실행되는 동안 어떤 도구를 사용할 수 있는지를 제한하므로, 리뷰 스킬이 시도하는 Edit, Write, Bash 호출은 단념하게 되는 것이 아니라 구조적으로 사용 불가능해진다. 사람이 지켜보다가 어긋난 편집을 잡아낼 수 없는 무인 CI 실행에서는, 그런 구조적 보장이 설계를 견고하게 만드는 요소이다. 핵심 세부사항은 읽기 전용 도구(Read, Grep, Glob)만 화이트리스트에 올리고 셸 접근을 포함한 모든 변경 경로를 제외하는 것이다. Bash를 허용하면 Edit과 Write가 제외되어 있어도 명령을 통한 파일 수정이 다시 열리게 된다.

다른 프론트매터 옵션들은 서로 다른 문제를 해결한다. context: fork는 스킬을 격리된 서브에이전트 컨텍스트에서 실행하여 장황한 탐색이 메인 세션을 어지럽히지 않도록 한다. 이는 출력이 어디에 쌓이는지를 바꿀 뿐, 어떤 도구 호출이 통과되는지에는 관여하지 않는다. argument-hint는 스킬이 인자 없이 호출될 때 필요한 매개변수를 물어봄으로써 호출 편의성을 개선한다. 도구 실행과는 무관하다. 여기서 둘 중 하나를 선택하는 것은 격리나 입력 처리를 강제된 경계로 착각하는 것이다.

유용한 사고 모델은 다음과 같다. 원하는 동작은 스킬 본문에 두고, 반드시 보장해야 하는 경계는 allowed-tools 같은 설정(또는 세션의 모든 도구 호출에 걸쳐 유지되어야 하는 규칙이라면 훅)에 둔다. 스킬은 프로젝트 범위라면 .claude/skills/<name>/SKILL.md에 있고(버전 관리를 통해 공유되며, 이것이 CI 체크아웃이 받는 방식이다), 개인 용도라면 ~/.claude/skills/에 있다. 스킬이 어떻게 정의되고 설정되는지는 Claude Code 슬래시 커맨드 문서를 참고하라.

### 도메인

Claude Code Configuration & Workflows



## 질문 9

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : CI-generated tests keep ignoring the team's fixture library, and review comments apply inconsistent criteria across pull requests. Which two configuration decisions address this? (Select two.)

**A.** Place the standards in each engineer's ~/.claude/CLAUDE.md so the conventions follow whoever triggered the pipeline build.

**설명**

이것은 틀렸다. 사용자 수준 CLAUDE.md는 그 사용자의 로컬 환경에만 적용되며 버전 관리를 통해 절대 공유되지 않는다. CI 러너는 어떤 엔지니어의 홈 디렉터리 설정도 물려받지 않으므로, 파이프라인은 여전히 표준 없이 실행될 것이다.

**B(정답).** Keep the CLAUDE.md content concise and focused, since every run reads it and long files reduce how reliably rules are followed.

**설명**

이것이 정답이다. CLAUDE.md는 매 실행마다 읽히고 그 내용이 컨텍스트를 소비한다. Anthropic은 파일을 간결하게 유지할 것을 권장한다(파일당 약 200줄 미만). 간결한 파일은 비용을 통제하면서도 각 규칙이 얼마나 일관되게 지켜지는지를 개선한다.

**C(정답).** Document testing standards, fixture conventions, and review criteria in a repository-root CLAUDE.md committed to version control.

**설명**

이것이 정답이다. 저장소 루트의 CLAUDE.md는 CI에서 호출되는 Claude Code에 프로젝트 컨텍스트를 제공하는 공식 메커니즘이다. 저장소와 함께 이동하므로, 모든 파이프라인 실행이 동일한 표준, 픽스처 문서, 리뷰 기준을 로드한다.

**D.** List the pipeline's required tool permissions inside CLAUDE.md so reviews are guided and authorized from a single file.

**설명**

이것은 틀렸다. CLAUDE.md는 지침과 컨텍스트를 제공할 뿐, 권한을 부여하지 않는다. 자동화된 실행에서의 도구 접근은 허용된 도구, 권한 규칙, 혹은 액션 설정을 통해 구성해야 한다. CLAUDE.md에 무엇을 적어도 도구를 승인할 수 없다.

### 전반적인 설명

Claude Code가 파이프라인 안에서 실행될 때는 인간 리뷰어가 가진 암묵적 지식이 전혀 없다. 픽스처 라이브러리가 존재한다는 것도, 팀이 무엇을 가치 있는 테스트로 여기는지도, 어떤 리뷰 발견 사항이 중요한지도 모른다. 저장소 루트의 CLAUDE.md는 그런 지식을 전달하는 채널이다. 코드와 함께 커밋되므로, 모든 CI 호출, 모든 팀원, 모든 자동화 트리거가 동일한 프로젝트 컨텍스트를 로드한다. 이것이 바로 생성된 테스트가 공유 픽스처를 사용하게 하고 풀 리퀘스트마다 리뷰 기준이 일관되게 만드는 요인이다. Anthropic의 GitHub Actions 문서는 코드 스타일 가이드라인, 리뷰 기준, 선호하는 패턴을 그곳에 정의할 것을 명시적으로 권장한다.

두 번째 레버는 크기에 대한 규율이다. CLAUDE.md는 매 실행 시작 시 읽히므로 그 내용은 반복되는 컨텍스트 비용이며, 모든 줄이 모델의 주의를 두고 다른 모든 줄과 경쟁한다. 부풀려진 파일은 개별 규칙이 덜 신뢰성 있게 지켜지게 만든다. 메모리 문서는 각 파일을 간결하게 유지하고, 200줄 미만을 목표로 하며, 단일 거대 파일을 쌓기보다는 보조 자료를 분할하거나 임포트하도록 권장한다.

거부된 두 선택지는 범위와 메커니즘 모두에서 실패한다. ~/.claude/CLAUDE.md의 사용자 수준 설정은 한 사람의 머신에 속한다. CI 러너는 이를 절대 보지 못하고, 팀원들 사이에서도 공유되지 않기 때문에 결국 어긋나게 된다. 그리고 CLAUDE.md는 가이드일 뿐 강제가 아니다. 도구 접근을 부여하거나 제한할 수 없다. 자동화에서 권한은 헤드리스 모드 문서에서 다루는 allowed-tools 설정, 권한 규칙, 또는 액션 설정에서 나온다. 유용한 사고 모델은, CLAUDE.md가 Claude에게 무엇이 좋은 결과인지를 말해주는 반면, 권한과 훅이 Claude가 무엇을 하도록 허용되는지를 결정한다는 것이다.

### 도메인

Claude Code Configuration & Workflows


## 질문 10

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : An engineer on this team is trialing stricter draft review criteria before proposing them for the pipeline. The criteria must load only in this repository and must never reach teammates through version control. Where should the criteria live?

**A.** Put them in the project CLAUDE.md on a local branch that is never pushed.

**설명**

프로젝트 CLAUDE.md는 팀이 공유하는 표준을 위한 파일이며, 푸시하지 않은 브랜치에 수정 사항을 두는 것은 취약하다. 병합, 리베이스, 혹은 실수로 인한 푸시가 초안 기준을 모두에게 배포해버릴 수 있다. 버전 관리 규율은 개인적인 지침을 위한 공식 메커니즘이 아니다.

**B(정답).** Put them in CLAUDE.local.md at the repository root and add it to .gitignore.

**설명**

CLAUDE.local.md은 개인적이고 프로젝트에 특화된 지침을 위한 공식 위치이다. 이 저장소 안의 세션에만 로드되며, .gitignore에 추가하면 버전 관리에서 제외되어 팀원과 CI 클론이 절대 받지 않게 된다.

**C.** Put them in .claude/settings.local.json, which Claude Code keeps out of git.

**설명**

로컬 설정 파일은 사용자별, 프로젝트별로 존재하지만, 지침 텍스트가 아니라 권한과 도구 설정 같은 JSON 설정을 담는다. 리뷰 기준은 자연어 가이드이므로 설정 파일이 아니라 메모리 파일에 있어야 한다.

**D.** Put them in ~/.claude/CLAUDE.md, which is never committed to version control.

**설명**

사용자 수준 파일은 한 사용자에게 비공개이긴 하지만, 이 저장소뿐 아니라 그 사용자가 여는 모든 프로젝트에 적용된다. 기준이 이 저장소에서만 로드되어야 한다는 요구사항이 이를 배제한다.

### 전반적인 설명

Claude Code의 메모리 시스템은 지침을 두 축으로 구분한다. 어떤 프로젝트에 로드되는지, 그리고 버전 관리를 통해 이동하는지 여부이다. 사용자 수준 ~/.claude/CLAUDE.md는 비공개이지만 전역적이다. 그 사용자가 여는 모든 프로젝트에 로드된다. 프로젝트 수준 CLAUDE.md는 하나의 저장소로 범위가 좁혀지지만 공유된다. 커밋되어 모든 팀원의 세션(CI 체크아웃 포함)이 이를 로드한다. CLAUDE.local.md는 나머지 사분면을 채운다. 단일 프로젝트로 범위가 좁혀진 개인 지침으로, .gitignore에 추가하여 git에서 제외한다. 한 저장소에서 시험 중인 초안 리뷰 기준은 정확히 그 사분면에 들어맞는다.

이런 구분이 설계된 이유는 지침이 곧 컨텍스트이며, 컨텍스트는 관련 있는 곳에서만 로드되어야 한다는 것이다. 초안 기준을 사용자 수준 파일에 두면 무관한 프로젝트에도 주입되어 버린다. 공유 프로젝트 파일에 두면 아직 합의되지 않은 정책을 팀원과 파이프라인에 강제로 밀어붙이게 된다. Claude Code는 작업 디렉터리와 그 상위 디렉터리에서 CLAUDE.md와 CLAUDE.local.md를 찾아 컨텍스트로 연결(concatenate)하므로, 로컬 파일은 공유 파일을 대체하는 것이 아니라 보완한다.

설정 파일들은 병렬적이지만 별개인 체계를 따른다. .claude/settings.local.json도 마찬가지로 사용자별, 프로젝트별이지만, 자연어 가이드가 아니라 기계가 읽는 설정(권한, 도구 설정)을 담는다. 설정 계층과 메모리 계층을 혼동하는 것은 흔한 실수이다. 각각 자신만의 개인 계층과 공유 계층을 갖는다. Manage Claude's memory와 Claude Code settings를 참고하라.

### 도메인

Claude Code Configuration & Workflows



## 질문 11

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A pipeline stage has Claude Code implement a diff-annotation utility, but each regeneration drifts from the specified behavior in different ways. Which workflow most reliably converges the implementation on the required behavior?

**A.** Have Claude generate the implementation and its own tests in the same run, so the tests are guaranteed to match the produced code.

**설명**

동일한 세션에서 코드 작성 후에 만들어진 테스트는, 사양이 요구하는 것보다는 코드가 이미 하고 있는 행동을 그대로 기술하는 경향이 있다. 구현이 의도된 동작에서 벗어나 있어도 그런 테스트는 통과하므로, 수렴을 위한 압력을 전혀 제공하지 못한다.

**B.** Rewrite the specification prose in greater detail after each regeneration, restating the requirements Claude missed the previous time.

**설명**

텍스트로 된 사양은 얼마나 자세해지든 여전히 해석의 여지가 남는데, 그것이 바로 처음부터 동작이 어긋나는 이유이다. 실행 가능한 점검이 없으면, Claude의 출력 중 어느 부분이 잘못됐는지 알려주는 객관적인 신호가 존재하지 않는다.

**C.** Lower the sampling temperature for the generation step so successive regenerations produce more consistent implementations.

**설명**

온도를 낮추면 출력이 더 반복 가능해지지만, 일관되게 틀린 구현은 여전히 틀린 것이다. 문제는 생성이 너무 변동성이 크다는 것이 아니라, 요구사항이 검증 가능한 목표로서 충분히 명세되지 않았다는 것이다.

**D(정답).** Write tests encoding the required behavior first, then have Claude implement against them, feeding failures back until the suite passes.

**설명**

이것은 테스트 주도 반복(test-driven iteration)이다. 테스트는 사양을 Claude가 실행하고 읽고 그에 맞춰 고칠 수 있는 검증 점검으로 바꿔준다. 각 실패는 구체적이고 명확한 피드백을 제공하므로, 반복이 어긋나지 않고 수렴하게 된다.

### 전반적인 설명

Claude Code가 정확한 동작 목표로 수렴하게 만드는 가장 신뢰할 수 있는 방법은, 스스로 실행할 수 있는 검증 점검을 주는 것이다. 구현 전에 테스트 스위트를 작성하면 사양이 실행 가능한 정답(ground truth)으로 바뀐다. Claude는 구현하고, 테스트를 실행하고, 실패를 읽고, 고치는 과정을 모든 테스트가 통과할 때까지 반복한다. 이것이 공식 문서에 나온 테스트 주도 반복 패턴이며, 실패한 어서션이 텍스트로는 결코 얻을 수 없는 명확한 피드백이기 때문에 잘 작동한다. 버그 수정에 대한 Anthropic의 가이드도 같은 논리를 따른다. 먼저 문제를 재현하는 실패하는 테스트를 작성하도록 Claude에게 요청한 다음 수정하라는 것이다.

여기서의 사고 모델은, 에이전틱 루프가 방향을 잡기 위한 객관적인 성공 신호를 필요로 한다는 것이다. 요구사항을 더 긴 텍스트로 다시 서술하는 것은 성공 기준을 자연어에 남겨두는 것이며, 그러면 재생성마다 해석이 바뀔 수 있다. 이것이 바로 관찰되고 있는 어긋남 현상이다. Claude가 같은 실행에서 코드와 함께 테스트를 작성하게 하면 진실의 방향이 뒤집힌다. 테스트가 결국 코드가 실제로 하는 행동을 기술하게 되어, 사양을 검증하지 않고도 통과해버린다. 온도를 낮추는 것은 변동성을 다룰 뿐 정확성을 다루지 않는다. 유틸리티가 사양에 수렴하는 것이 아니라, 매번 동일한 방식으로 사양을 어기게 만들 뿐이다.

CI 맥락에서는 이 패턴도 잘 조합된다. 사전에 작성된 스위트가 파이프라인의 관문이 되며, 이를 통과하지 못하는 재생성은 사람이 검사하는 것이 아니라 기계적으로 거부된다. 테스트 먼저 작성 후 실패를 고치는 반복 루프에 대해서는 Claude Code best practices와 common workflows 가이드를 참고하라.

### 도메인

Claude Code Configuration & Workflows



## 질문 12

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline invokes a /coverage-audit skill that scans the repository for untested modules before generating tests. Its multi-thousand-line exploration transcript persists in the session and crowds out the pull request diff. What change addresses this?

**A.** Set allowed-tools in the skill's SKILL.md frontmatter to Read, Grep, and Glob so the audit produces less exploratory output.

**설명**

이것은 틀렸다. allowed-tools는 스킬이 호출할 수 있는 도구를 제한하는 것으로, 이는 보안 및 안전 경계이다. Read, Grep, Glob은 저장소 스캔이 실제로 사용하는 도구들이므로, 이 제한은 탐색 기록이 메인 세션에 들어오지 않게 막는 데 아무 역할도 하지 못한다.

**B(정답).** Add context: fork to the skill's SKILL.md frontmatter so the audit runs in an isolated subagent and returns a summary.

**설명**

이것이 정답이다. context: fork는 스킬을 포크된 서브에이전트 컨텍스트에서 실행한다. 스킬 내용이 서브에이전트의 프롬프트가 되고, 장황한 탐색은 그 격리된 컨텍스트 안에서 이루어지며, 요약된 결과만 메인 대화로 돌아온다. 탐색 기록이 메인 세션에 전혀 들어오지 않으므로 검토 중인 디프가 밀려나지 않는다.

**C.** Instruct the pipeline to run /compact immediately after the skill completes so the accumulated audit output is summarized.

**설명**

이것은 틀렸다. /compact는 예방 메커니즘이 아니라 복구 단계이다. 장황한 출력이 먼저 세션을 가득 채우고, 요약 과정에서 리뷰에 필요한 구체적인 미검증 모듈이나 줄 참조 같은 정밀한 세부사항이 손실될 위험이 있다. 출처에서 출력을 격리하는 것이 설계된 해결책이다.

**D.** Move the audit instructions into the project CLAUDE.md so they load once per session instead of on every invocation.

**설명**

이것은 틀렸다. CLAUDE.md 내용은 항상 모든 세션에 로드되므로, 오히려 기본 컨텍스트 소비를 줄이는 것이 아니라 늘린다. 문제는 지침이 어디에 있는지가 아니라 스킬의 장황한 실행 출력이 어디에 쌓이는지이다.

### 전반적인 설명

일반적으로 호출된 스킬은 메인 대화 안에서 실행된다. 렌더링된 SKILL.md 내용과 스킬이 하는 모든 일, 즉 탐색에서 나온 모든 도구 결과가 세션에 들어오고 이후 턴에도 계속 남는다. 저장소를 스캔하여 커버리지 격차를 찾는 것처럼 전체 임무가 광범위한 발견 작업인 스킬의 경우, 그 기록이 세션이 실제로 존재하는 목적(여기서는 풀 리퀘스트 디프 검토)을 압도할 수 있다.

context: fork는 정확히 이를 위해 설계된 프론트매터 메커니즘이다. SKILL.md에서 context: fork를 설정하면 스킬이 포크된 서브에이전트에서 실행된다. 스킬 본문이 서브에이전트의 프롬프트가 되고, 장황한 작업은 그 격리된 컨텍스트 안에서 이루어지며, 요약된 결과만 메인 대화로 흘러 들어온다. 이해해야 할 트레이드오프는, 포크된 서브에이전트가 메인 대화 기록을 보지 못하므로 스킬의 지침이 자체 완결적이어야 한다는 것이다. 메인 컨텍스트를 보호하는 그 격리가 스킬을 메인 컨텍스트로부터 차단하는 것과 동일한 격리이다. 이는 또한 context: fork가 소극적인 가이드라인이 아니라 명시적인 지침을 가진 스킬에서만 의미가 있다는 뜻이기도 하다.

오답들은 각각 잘못된 레버를 조작한다. /compact를 실행하는 것은 이미 피해가 발생한 후에 대화를 요약하는 것이며, 요약 과정에서 정확한 세부사항을 잃을 수 있다. allowed-tools는 스킬이 호출할 수 있는 것을 제한하는데, 여기서 물량을 만들어내는 것은 정확히 읽기 전용 탐색 도구들이다. 지침을 CLAUDE.md로 옮기면 항상 로드되게 만들어, 실행 시 출력에는 손도 대지 않으면서 영구적인 컨텍스트 비용만 추가하게 된다. 격리 모델과 메인 대화보다 이를 선호해야 할 때에 대해서는 Agent Skills와 Subagents를 참고하라.

### 도메인

Claude Code Configuration & Workflows



## 질문 13

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A pipeline step invokes claude "review this diff for security issues" and the job hangs until the CI timeout kills it. What change makes this invocation work in the automated pipeline?

**A(정답).** Add the -p flag so Claude Code processes the prompt, prints the result, and exits.

**설명**

-p(또는 --print) 플래그는 Claude Code를 비대화형 모드로 실행한다. 주어진 프롬프트를 실행하고, 결과를 stdout에 쓰고, 사용자 입력을 기다리지 않고 종료한다. 이것이 자동화된 파이프라인에서 Claude Code를 실행하는 공식 방법이며, 바로 그래서 대화형 호출이 멈춰버리는 것이다.

**B.** Add the --bg flag so the review runs as a background task detached from the terminal.

**설명**

백그라운드 실행은 그 실행을 출력 후 종료(print-and-exit) 방식으로 바꿔주지 않으며, 비대화형 모드 문서는 그 맥락에서 --bg가 거부된다고 명시한다. 파이프라인 실행을 위해 지원되는 메커니즘은 -p 플래그이다.

**C.** Pipe the string yes into the command so any interactive prompts are auto-confirmed.

**설명**

정해진 확인 입력을 대화형 세션에 흘려넣는 것은 취약한 임시 조치일 뿐, 지원되는 자동화 경로가 아니다. 비대화형 모드도 stdin을 읽기는 하지만, 이는 -p 프롬프트와 함께 처리할 내용을 받기 위한 것이지, 대화형 UI를 위한 모의 키 입력을 받기 위한 것이 아니다.

**D.** Append --output-format json so the run emits machine-readable output and terminates.

**설명**

--output-format 플래그는 프린트 모드에서 출력의 형태를 제어할 뿐, 그것만으로 CLI를 대화형 모드에서 벗어나게 하지는 않는다. -p 없이는 세션이 여전히 대화형 입력을 기다리며, 작업은 계속 멈춘 채로 남는다.

### 전반적인 설명

Claude Code에는 근본적으로 다른 두 가지 실행 모드가 있다. 기본값은 프롬프트를 열고 사람을 기다리는 대화형 세션이며, 이것이 바로 CI에서 맨몸의 claude "..." 호출이 러너의 타임아웃에 죽을 때까지 멈춰있는 이유이다. -p(또는 --print) 플래그는 비대화형 모드(과거에는 headless 모드라고 불림)로 전환한다. CLI가 프롬프트를 받아 완료까지 실행하고, 결과를 stdout에 출력하고 종료한다. 이 프로세스 모델이 파이프라인에 필요한 것인데, CI 단계는 터미널 대화가 아니라 종료 코드와 캡처된 출력으로 평가되기 때문이다. 성공한 -p 실행은 종료 코드 0을 반환하고, 실패는 0이 아닌 코드를 반환한다.

비대화형 모드는 일반적인 유닉스 명령처럼 동작하기도 한다. 파이프로 전달된 stdin을 읽고(예: cat diff.txt | claude -p "review this"), 기계가 읽을 수 있는 결과를 위한 --output-format json, 도구를 사전 승인하는 --allowedTools, 에이전틱 루프를 제한하는 --max-turns 같은 동반 플래그들과 함께 조합된다. 핵심 사고 모델은, 이런 동반 플래그들이 프린트 모드 실행을 다듬어줄 뿐이며 그중 어느 것도 프린트 모드 실행을 만들어내지는 않는다는 것이다. --output-format은 출력이 직렬화되는 방식만 바꾸고, 대화형 UI에 확인 입력을 파이프로 흘려넣는 것은 사람을 위한 인터페이스에 대한 취약한 스크립팅이며, --bg는 비대화형 모드의 대체물이 아니라 명시적으로 거부되는 대상이다.

전체 플래그 목록과 스크립팅 패턴은 Run Claude Code non-interactively와 CLI 레퍼런스를 참고하라.

### 도메인

Claude Code Configuration & Workflows



## 질문 14

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A team adds context: fork to a /severity-triage skill to keep its verbose analysis out of the main session, but the skill now ignores findings established earlier in the session. What should they change while keeping the isolation?

**A.** Remove context: fork from the frontmatter so the skill runs with the full session history again.

**설명**

이것은 명시된 목표에 맞지 않는다. 포크를 제거하면 세션에 대한 가시성은 회복되지만, 스킬의 장황한 분석도 다시 메인 대화로 들어오게 되는데, 이는 정확히 팀이 context: fork를 도입하여 막고자 했던 오염이다.

**B.** Expand the skill's allowed-tools list so the forked subagent can read the session's transcript.

**설명**

이것은 틀렸다. allowed-tools 필드는 스킬이 호출할 수 있는 도구를 관리할 뿐, 어떤 대화 컨텍스트를 받는지는 관리하지 않는다. 어떤 도구 부여로도 메인 대화 기록이 포크된 서브에이전트에 복원되지 않는다. 포크의 격리는 도구 제한이 아니라 컨텍스트 경계이기 때문이다.

**C.** Record the session's findings in the project CLAUDE.md so the skill loads them automatically.

**설명**

이것은 틀렸다. CLAUDE.md는 하나의 리뷰 세션 중에 생성된 상태가 아니라, 지속적이고 항상 관련 있는 프로젝트 가이드를 담는다. 세션마다 달라지는 임시적인 발견 사항을 공유 프로젝트 설정에 적는 것은 그 용도를 오용하는 것이며 즉시 낡은 정보가 되어버린다.

**D(정답).** Pass the established review findings explicitly as input when invoking the forked skill.

**설명**

이것이 정답이다. context: fork를 가진 스킬은 프롬프트가 스킬 내용 자체인 격리된 서브에이전트에서 실행된다. 서브에이전트는 메인 대화 기록을 물려받지 않는다. 호출 시점에 발견 사항을 명시적으로 전달하면, 팀이 원했던 격리를 유지하면서도 포크에 필요한 세션 상태를 제공할 수 있다.

### 전반적인 설명

context: fork 프론트매터 필드는 컨텍스트 공유를 컨텍스트 위생(hygiene)과 교환한다. 스킬이 일반적으로 호출되면, 렌더링된 SKILL.md 내용과 스킬이 만들어내는 모든 것이 메인 대화에 들어와서 이후 턴에도 계속 남지만, 스킬 또한 세션이 이미 논의한 모든 것을 볼 수 있다. 스킬이 포크되면, 프롬프트가 스킬 내용 자체인 서브에이전트로 실행된다. 장황한 탐색은 메인 세션 밖에 머물고 요약된 결과만 돌아오지만, 서브에이전트는 메인 대화 기록에 접근할 수 없다. 바로 이것이 여기서 발생한 실패이다. 스킬은 이전에 대화 기록 안에 있던 발견 사항에 의존했는데, 포크 이후에는 그 발견 사항들이 단순히 보이지 않게 된 것이다.

여기서의 사고 모델은, 포킹이 양방향으로 작동하는 격리 경계라는 것이다. 스킬의 잡음으로부터 메인 세션을 보호하는 동시에, 세션에 축적된 상태로부터 스킬을 차단한다. 이 설계가 의미하는 바는, 포크된 스킬은 자체 완결적이어야 한다는 것이다. 즉, 트리아지할 발견 사항 같은 필요한 입력은 컨텍스트에서 추정되지 않고 호출 시점에 명시적으로 전달되어야 한다. 어떤 작업이 여러 단계에 걸쳐 진짜로 공유 컨텍스트가 필요하거나 세션과 자주 주고받아야 한다면, 공식 가이드는 그것을 포크하지 말고 메인 대화 안에 두라고 안내한다.

다른 해결책들은 메커니즘을 놓치거나 목표를 희생시킨다. 도구 접근은 allowed-tools가 관리하며, 어떤 도구 부여로도 대화 기록이 포크에 다시 붙지 않는다. context: fork를 제거하는 것은 팀이 없애려 했던 오염을 그대로 다시 끌어들인다. 그리고 세션별 발견 사항은 CLAUDE.md가 담도록 만들어진 지속적인 프로젝트 가이드가 아니라 임시 상태이다. 포크된 스킬 실행과 서브에이전트 컨텍스트 격리가 어떻게 작동하는지는 Agent Skills와 Subagents를 참고하라.

### 도메인

Claude Code Configuration & Workflows



## 질문 15

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Review conventions for the payments service apply only to files inside that service's directory, and the owning team wants to maintain the conventions alongside the code they change. Where should these conventions live?

**A.** In a file under the central .claude/rules/ directory with a paths glob that matches the payments directory tree.

**설명**

경로 범위 규칙도 정상적으로 로드되긴 하겠지만, 가이드는 경로 범위 규칙을 여러 위치에 흩어진 파일들에 적용되는 컨벤션을 위해 남겨둔다. 컨벤션이 단일 디렉터리에 속하고 그 소유 팀이 코드 옆에 함께 유지하고 싶어한다면, 하위 디렉터리 CLAUDE.md가 소유권과 내용을 함께 배치해준다.

**B.** In each payments engineer's ~/.claude/CLAUDE.md so their sessions consistently apply the conventions.

**설명**

사용자 수준 파일은 개인적이며 버전 관리를 통해 절대 이동하지 않으므로, CI 호출과 다른 팀원들은 그 컨벤션을 받지 못한다. 공유 컨벤션은 세션과 파이프라인 실행 전반에 일관되게 적용되려면 저장소 안에 있어야 한다.

**C(정답).** In a CLAUDE.md file inside the payments service directory, loaded on demand when Claude works on files there.

**설명**

하위 디렉터리 CLAUDE.md는 컨벤션이 하나의 디렉터리에 묶여 있고 그 디렉터리의 소유자가 코드와 함께 컨벤션을 유지 관리할 때 공식적으로 적합한 방식이다. Claude Code는 해당 하위 트리 안의 파일을 읽을 때 중첩된 CLAUDE.md 파일을 온디맨드로 로드하므로, 컨벤션이 정확히 필요한 곳에만 적용되고 다른 곳에는 로드되지 않는다.

**D.** Appended to the root CLAUDE.md so every review session loads them regardless of which files are under review.

**설명**

루트 CLAUDE.md 내용은 모든 세션에 로드되므로, 하나의 서비스에만 관련된 컨벤션이 무관한 코드를 리뷰하는 동안에도 컨텍스트를 소비하게 된다. 대규모 프로젝트에 대한 가이드는, 코드베이스의 한 부분에만 중요한 지침을 항상 로드되는 루트 파일 밖으로 옮기라는 것이다.

### 전반적인 설명

Claude Code는 코드베이스의 일부에 컨벤션을 범위 지정하기 위한 두 가지 저장소 공유 메커니즘을 제공하며, 이들은 서로 다른 형태의 문제에 최적화되어 있다. 하위 디렉터리 CLAUDE.md는 디렉터리 순회로 발견된다. Claude가 그 하위 트리 안의 파일을 읽을 때 온디맨드로 로드되며, 자신이 관리하는 코드 옆에 물리적으로 위치하므로, 그 디렉터리를 소유한 팀이 코드를 바꾸는 것과 같은 풀 리퀘스트에서 자연스럽게 검토하고 갱신하게 된다. .claude/rules/의 경로 범위 규칙은 YAML paths 글롭을 사용하며 Claude가 트리 어디에서든 매칭되는 파일을 다룰 때 로드된다. 이는 중앙 규칙 영역에 속하며, 저장소 전체에 코로케이션된 테스트 파일처럼 하나의 컨벤션이 여러 디렉터리에 흩어진 파일 유형이나 패턴을 따라가야 할 때 빛을 발한다.

문제의 지문은 첫 번째 형태를 설명한다. 단일 디렉터리에 묶여 있고 그 디렉터리의 소유자가 유지 관리하는 컨벤션이다. Anthropic의 모노레포 가이드는 정확히 이 경계를 긋는데, 디렉터리 소유자가 코드와 함께 컨벤션을 유지 관리할 때는 디렉터리별 CLAUDE.md를, 같은 규칙이 여러 흩어진 경로에 적용될 때는 경로 범위 규칙을 권장한다. 내용을 루트 CLAUDE.md에 두면 무관한 서비스에 대한 리뷰를 포함한 모든 세션에 로드되는데, 이는 두 메커니즘 모두가 애초에 피하려는 컨텍스트 비대화이다. 사용자 수준 ~/.claude/CLAUDE.md는 버전 관리가 전혀 되지 않아 CI 실행과 팀원들에게 보이지 않으므로, 공유 및 자동화 용도로는 완전히 실패한다.

디렉터리별 방식과 경로 범위 방식의 비교는 Large codebases를, CLAUDE.md 파일과 .claude/rules/가 어떻게 로드되는지는 Memory 문서를 참고하라.

### 도메인

Claude Code Configuration & Workflows



