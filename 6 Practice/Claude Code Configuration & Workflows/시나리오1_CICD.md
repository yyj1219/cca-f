# 시나리오1_CICD

## 질문 1

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The review criteria live in standards/review-criteria.md so other tooling can share the file, and every CI-invoked Claude Code session must have the criteria in context from launch. How should CLAUDE.md reference the file?

**A.** Move the criteria into .claude/rules/review-criteria.md with a paths glob so the rule activates whenever the pipeline runs a review.

**설명**

Path-scoped rules load only when Claude works with files matching the glob, not unconditionally at session start. Review criteria must apply to every review regardless of which files the pull request touches, so conditional loading is the wrong fit here.

**B(정답).** Add the line @standards/review-criteria.md to the project CLAUDE.md so the file's contents expand into context at launch.

**설명**

This is the documented import mechanism: an @path reference placed in CLAUDE.md text causes the referenced file to be expanded and loaded into context at launch, keeping the source file modular and shareable while guaranteeing every session sees it.

**C.** Copy the criteria into a CLAUDE.md placed inside the standards/ subdirectory so every session inherits it automatically.

**설명**

Nested subdirectory CLAUDE.md files load on demand when Claude reads files in that subdirectory, not at session start, so a CI review session that never touches standards/ would never load the criteria. Copying the content also creates a second source of truth that drifts from the shared file.

**D.** Wrap the path in backticks as `@standards/review-criteria.md` inside CLAUDE.md so Claude Code resolves and reads the file on demand.

**설명**

Import parsing skips Markdown code spans and fenced code blocks; a path wrapped in backticks is treated as literal text and is never imported. The criteria would not enter context at all unless Claude happened to read the file itself.

### 전반적인 설명

CLAUDE.md supports an inline import syntax: writing @path/to/file directly in the file's text causes Claude Code to expand that file into context when the session launches. The mental model is textual inclusion, not lazy reference: imports exist to keep configuration modular and shareable (one canonical criteria file that other tooling can also consume), while the loaded context is exactly as if the content had been pasted in. This also means imports do not reduce context usage; everything still loads up front. Relative paths resolve relative to the file containing the import, and imports can nest recursively up to a documented depth limit.

Two details commonly trip people up. First, import parsing deliberately skips code spans and fenced code blocks, so a path wrapped in backticks stays literal text; this is the escape hatch for mentioning a path without importing it, which makes it exactly wrong when you actually want the import. Second, loading behavior differs by mechanism: root and ancestor CLAUDE.md files (and their imports) load at launch, nested subdirectory CLAUDE.md files load on demand when Claude reads files in those directories, and .claude/rules/ files with a paths glob load only when Claude works with matching files. For universal review criteria that must govern every CI run, the always-loaded surface with an import is the correct placement; conditional or on-demand surfaces would leave some reviews running without the criteria, and duplicating the content forfeits the single source of truth the shared file provides.

See Manage Claude's memory for import syntax, resolution rules, and load order, and Debug your configuration for verifying with /memory and /context what a session actually loaded.

### 도메인

Claude Code Configuration & Workflows



## 질문 2

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A CI review pass flags three findings that all trace back to one shared validation design, plus four unrelated one-line fixes in separate modules. How should these findings be fed to Claude Code for remediation?


**A(정답).** Provide the three interrelated findings in one message, then address the four unrelated fixes sequentially in separate turns.

**설명**

This matches each cluster to the right delivery pattern. Interdependent issues need to be seen together so the fix reflects one coherent design decision, while independent issues are fixed most reliably one at a time, where each change can be made and verified without interference from the others.

**B.** Group the findings by severity level and submit each tier as its own message, addressing the highest severity tier first.

**설명**

Severity determines priority, not how findings should be grouped for remediation. A severity tier can mix coupled and unrelated issues, so this grouping neither keeps interdependent findings together nor isolates independent ones.

**C.** Work through every finding one at a time in separate turns, verifying each individual fix before introducing the next one.

**설명**

Strictly sequential handling breaks the interdependent cluster apart. Fixing one coupled finding without visibility into the other two invites a local patch that conflicts with the shared validation design, forcing rework when the remaining findings surface.

**D.** Submit all seven findings together in a single message so one remediation pass resolves everything without repeating context.

**설명**

Batching everything mixes unrelated fixes into the same working set, which dilutes attention and makes it harder to verify each independent change. Only the three coupled findings benefit from being presented together; the unrelated ones gain nothing from sharing a message.

### 전반적인 설명

The deciding factor when handing multiple issues to Claude Code is coupling, not count or severity. When several findings share a root cause or interact with each other, the model needs to reason about all of them at once; presenting them together lets it design a single coherent fix rather than three local patches that step on each other. When findings are truly independent, presenting them sequentially works better: each turn has a narrow, verifiable objective, the diff is small enough to review confidently, and a mistake in one fix cannot contaminate the others.

The failure modes of the alternatives illustrate why this split exists. Dumping every finding into one message forces the model to juggle unrelated concerns in a single working set, which increases the chance that some fixes are shallow or that changes for one issue accidentally interact with another. Strictly one-at-a-time handling has the mirror-image problem: a coupled finding fixed in isolation often gets a patch that contradicts the eventual fix for its siblings, because the model never saw the shared design constraint. Severity ordering answers a different question entirely (what to fix first), and a severity tier is just as likely to contain a mix of coupled and unrelated issues as the raw list was.

A useful mental model: one message per design decision. If three findings will be resolved by one decision about the validation layer, that is one message; four findings that each stand alone are four decisions, so they are four turns, each verified before the next begins. See Claude Code Best Practices and the Claude Code documentation for guidance on scoping and iterating on tasks.

### 도메인

Claude Code Configuration & Workflows



## 질문 3

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The CI test-generation job writes tests that ignore team testing conventions. Test files sit beside the code they test across dozens of directories. How should the conventions be configured so they load only when test files are involved?

**A.** Add the testing conventions to the root CLAUDE.md so every session, including CI runs, loads them unconditionally.

**설명**

This is incorrect because root CLAUDE.md content loads into every session regardless of task, consuming context and competing for attention even when no test files are involved. The requirement is conditional loading, which unconditional project memory does not provide.

**B.** Add a CLAUDE.md file to every directory that contains test files, duplicating the testing conventions in each one.

**설명**

This is incorrect because directory-level CLAUDE.md files are bound to specific folders, so co-located test files spread across dozens of directories would require dozens of duplicated copies. Every convention change would then need to be edited in many places, which is the maintenance problem path-scoped rules exist to avoid.

**C.** Package the conventions as a skill in .claude/skills/ so the pipeline invokes it explicitly before generating tests.

**설명**

This is incorrect because skills are on-demand mechanisms suited to task-specific workflows, and making conventions opt-in means any invocation path that skips the skill produces non-conforming tests. Conventions tied to a file type should activate automatically when matching files are touched, not depend on an explicit invocation step.

**D(정답).** Create a rule file in .claude/rules/ with paths frontmatter listing globs like **/*.test.ts and **/*.test.tsx.

**설명**

This is correct because path-specific rules with glob patterns like **/*.test.ts match test files by type in any directory, so the conventions load exactly when Claude works with matching files. It scales cleanly no matter how test files are scattered across the tree.

### 전반적인 설명

The .claude/rules/ directory is the modular alternative to a monolithic CLAUDE.md, and its key capability is conditional loading: a rule file can declare a paths field in YAML frontmatter containing glob patterns, and the rule applies only when Claude works with files matching those patterns. Globs like **/*.test.ts match by file type in any directory, which is exactly what a codebase with co-located tests needs: one rule file governs every test file no matter where it lives, and it stays out of context when the session touches nothing test-related.

The mental model is that path-scoped rules trade always-on context for relevance. Unconditional memory (root CLAUDE.md, or a rule without a paths field) loads at launch and competes for attention on every task; path-scoped rules keep that budget clean and surface conventions precisely when they matter. This matters doubly in CI, where the invocation is unattended and no developer is present to paste in missing context.

Directory-level CLAUDE.md files remain useful when a convention genuinely belongs to one folder, but they cannot span a codebase where the relevant files are identified by type rather than location; duplicating them per directory guarantees drift. Skills solve a different problem entirely: on-demand, task-specific procedures. Turning file-type conventions into an opt-in skill makes correctness depend on remembering to invoke it. See Manage Claude's memory for the rules directory, paths frontmatter, and supported glob patterns.

### 도메인

Claude Code Configuration & Workflows



## 질문 4

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline auto-remediates review findings by sending Claude Code one finding per invocation. On a PR where three findings stem from the same flawed abstraction, each fix keeps reintroducing another finding. What should change?

**A.** Run each fix in its own isolated git worktree in parallel and merge the three branches at the end.

**설명**

Isolation makes the problem worse: three fixes produced without knowledge of each other must then be reconciled at merge time, where their conflicting assumptions about the shared abstraction collide. Worktrees suit independent parallel tasks, not coupled ones.

**B(정답).** Send the three related findings in one prompt so a single coherent change resolves their shared cause.

**설명**

Issues that interact because they share a root cause must be presented together; only then can Claude design one fix that satisfies all three constraints at once. Sequential delivery hides the interactions, so each fix optimizes for one finding while violating another.

**C.** Reorder the sequential invocations by severity so the most critical of the three fixes is applied first.

**설명**

Ordering does not remove the interaction between the findings; whichever fix lands first is still made without visibility into the other two constraints. The regressions would continue regardless of sequence.

**D.** Wrap each invocation in a retry loop that re-runs the reviewer after every fix until zero findings remain.

**설명**

This automates the churn rather than curing it: each retry still sees only one finding at a time, so the loop can oscillate between fixes that undo each other. Retry loops are useful for format and validation errors, not for structurally coupled changes.

### 전반적인 설명

The symptom here is the classic signature of interacting issues fed sequentially: three findings trace back to one flawed abstraction, so any fix crafted for one finding in isolation changes the shared code in a way that re-triggers another. Claude Code can only reason about the constraints it can see; when each invocation carries a single finding, the model has no way to know that its change must simultaneously satisfy two other requirements.

The decision rule for feeding issues to Claude is driven by coupling, not count. When problems are interdependent, present them all in a single message so the model can design one coherent change that accounts for every constraint at once. When problems are independent, sequential turns are preferable because each fix is smaller, easier to review, and verifiable in isolation. This mirrors how a human engineer works: coupled defects get one refactor, unrelated defects get separate commits.

Reordering by severity, retry loops, and parallel worktrees all fail for the same underlying reason: they preserve the per-finding isolation that caused the oscillation. A retry loop in particular deserves caution as an anti-pattern here; validation-retry works well when the defect is a format or structural error the model can self-correct, but it cannot converge when successive fixes are structurally in conflict with each other.

See Claude Code Best Practices and Claude Code Common Workflows for guidance on scoping and iterating on tasks with Claude Code.

### 도메인

Claude Code Configuration & Workflows



## 질문 5

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Reviews on one engineer's laptop consistently apply the team's review criteria, but the same reviews in the CI pipeline ignore them. The criteria live only in the engineer's user-level ~/.claude/CLAUDE.md; no project CLAUDE.md contains them. What is the correct fix, and how do you confirm the scoping?

**A(정답).** Use /memory to inspect the memory file locations, then move the criteria from the user-level CLAUDE.md into the project CLAUDE.md in the repository.

**설명**

This is correct because user-level memory at ~/.claude/CLAUDE.md applies only to that user's machine and never travels through version control, so a CI runner that clones the repository has no access to it. The /memory command lists the memory file locations and lets you open and edit them, confirming the criteria sit at user scope, and relocating them to the project CLAUDE.md makes them part of the checkout every CI job receives.

**B.** Inline the full review criteria into the -p prompt string for each CI job so no memory file is a dependency at review time.

**설명**

Embedding the criteria in every pipeline script duplicates configuration and detaches it from the version the team maintains for local sessions, guaranteeing eventual divergence. CLAUDE.md exists precisely so project context loads consistently for both interactive and CI-invoked runs from a single source.

**C.** Copy the engineer's ~/.claude/CLAUDE.md into the CI runner's home directory as a pipeline setup step so the criteria load during CI reviews.

**설명**

This works mechanically but is the wrong design: the copied file is unversioned, must be maintained per runner, and silently drifts every time the engineer edits the original. Team-shared instructions belong in the project-level CLAUDE.md, which version control distributes automatically.

**D.** Add the review criteria to .claude/settings.json, which is committed and therefore applied by every CI invocation.

**설명**

The settings.json file carries permissions, tool configuration, and hooks, not prose instructions or review criteria. Placing natural-language guidance there does not feed it into the model's context; instruction content belongs in memory files such as CLAUDE.md.

### 전반적인 설명

Claude Code loads memory from a hierarchy of locations: managed policy files, the user-level ~/.claude/CLAUDE.md, project-level files (./CLAUDE.md or ./.claude/CLAUDE.md), and CLAUDE.local.md for personal, uncommitted project notes. The mental model that resolves this scenario is that only the project-level files travel with the repository. Anything at user scope shapes sessions on that one machine and nowhere else, which is exactly why criteria that work locally vanish in a pipeline: the CI runner checks out the repository, finds no project-level memory containing the criteria, and reviews without them.

The /memory command is the management entry point for this class of problem: it lists the memory file locations and lets you open, edit, and create them, so it confirms that the criteria live in a user-level file rather than in the repository. To verify which memory files a particular session actually loaded into context, /context shows the Memory files section, so comparing a local session against a CI run makes the gap visible. Once diagnosed, the fix is structural, not procedural: move the criteria into the committed project CLAUDE.md so every clone, including the CI checkout, receives them identically.

The alternatives all reintroduce the same failure in a different form. Hand-copying a home-directory file onto runners creates unversioned configuration that drifts from the source; .claude/settings.json is for permissions, tools, and hooks rather than instructional prose; and inlining criteria into each -p invocation forks the team's canonical guidance into pipeline scripts that must be updated in lockstep forever. Shared instructions have one designed home, and it is the project memory file under version control. See Manage Claude's memory and the slash commands reference.

### 도메인

Claude Code Configuration & Workflows



## 질문 6

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A pipeline stage delegates a dependency survey to the Explore subagent and also instructs it to fix the outdated import statements it finds. The survey summary comes back, but no files were changed. What is the correct adjustment?

**A.** Raise Explore's thoroughness level to very thorough so it performs edits in addition to its analysis.

**설명**

Thoroughness levels (quick, medium, very thorough) control how deeply Explore searches and analyzes, not which tools it can use. No thoroughness setting grants Explore write access; it remains read-only at every level.

**B.** Override Explore's model field to a larger model, since its default model cannot generate code patches.

**설명**

The model a subagent runs on affects capability and cost, not tool permissions. Even on the most capable model, Explore's toolset still excludes Write and Edit, so no patch it drafts could ever be applied to files.

**C(정답).** Delegate the fix work to the general-purpose subagent, since Explore is read-only and denies Write and Edit.

**설명**

This is correct because Explore is a built-in, read-only subagent optimized for searching and analyzing codebases; the Write and Edit tools are denied to it by design. When a task requires both exploration and modification, the built-in general-purpose subagent is the documented fit.

**D.** Run the survey in the main conversation instead, since file changes made inside any subagent are discarded on return.

**설명**

Subagents do not discard file changes as a general rule; a general-purpose subagent with write access modifies files that persist. The failure here is specific to Explore's read-only tool restrictions, not to subagent execution in general.

### 전반적인 설명

The mental model to hold is that Claude Code's built-in subagents are specialized by tool access, not just by prompt. Explore is documented as a fast, read-only agent optimized for searching and analyzing codebases: it can discover files, grep for patterns, and read code, but Write and Edit are explicitly denied. That restriction is the point of the design. Because Explore can never mutate the repository, the main conversation can delegate broad, noisy discovery to it freely, knowing the only thing that comes back is a summary, never a side effect. In a CI pipeline this guarantee matters even more than in interactive use, since no human is watching the run.

The tradeoff is that Explore is the wrong delegate the moment the task includes making changes. For work that combines exploration with action, such as surveying imports and then fixing them, the documented fit is the built-in general-purpose subagent, which carries the tools needed to both search and edit. Splitting the work is also reasonable: Explore for the survey, then apply fixes from the main conversation or a general-purpose subagent using the returned summary.

The distractors fail on the same misconception in different forms. Thoroughness levels shape how deep the search goes, not what the agent is permitted to touch. Swapping in a larger model changes reasoning capability but not tool permissions. And subagents in general do persist file changes when they have write access; the discarded-changes theory misattributes a per-agent tool restriction to the subagent mechanism itself. See Subagents in Claude Code for the built-in agents and their tool boundaries.

### 도메인

Claude Code Configuration & Workflows


## 질문 7

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The review job runs claude -p with --output-format json and --json-schema. Occasionally a run finishes with subtype success, yet the parsed envelope contains no structured_output, and the comment-posting step crashes. How should the pipeline handle these runs?

**A(정답).** Require both a success subtype and a present structured_output field before posting, and route other runs to a failure path.

**설명**

Anthropic documents that a result can end with subtype success and still lack structured_output, so robust automation must check for both conditions. Runs without the field should be treated as failures, retried, or skipped rather than passed to the posting step.

**B.** Add an instruction to the prompt telling Claude to always populate the structured_output field so it is never omitted.

**설명**

The structured_output field is populated by the CLI's validation machinery, not by prompt-level instructions, and validation can still exhaust its retries and yield an error instead of data. A prompt instruction cannot eliminate this failure mode, so the pipeline still needs a guard.

**C.** Fall back to regex-extracting findings from the result text field whenever the envelope's structured_output is missing.

**설명**

Scraping prose from the result field defeats the purpose of schema-validated output and reintroduces the fragility that --json-schema exists to remove. Text in result has not been validated against the schema, so parsed findings may be malformed or incomplete.

**D.** Rely on the process exit code, since a zero exit guarantees the envelope contains a schema-valid structured_output payload.

**설명**

Exit codes signal whether the invocation itself succeeded, not whether structured output was produced. The documented behavior is precisely that a run can report success without structured_output, so exit status alone cannot guarantee the field is present.

### 전반적인 설명

When Claude Code runs with --output-format json and --json-schema, the CLI validates the model's final output against the supplied schema and reprompts on a mismatch. This validation loop has a bounded retry budget: if conformant output is not produced within the limit, the run ends with the failure subtype error_max_structured_output_retries rather than usable data. Separately, Anthropic documents that a result can carry the subtype success while still omitting structured_output entirely. The mental model to hold is that schema enforcement is a best-effort mechanism with an explicit failure channel, not a guarantee; any automation consuming it needs a guard clause.

For a CI pipeline that posts inline PR comments, the correct contract is therefore conjunctive: proceed only when the run succeeded and the structured_output field is present, and route everything else to a retry or failure path. This keeps malformed or absent findings from reaching the posting step and makes failures observable instead of silent. Falling back to regex over the result text abandons the validation guarantee the flag provides; trusting a zero exit code checks the wrong signal, since success and structured output are documented as separable; and prompt instructions cannot force a field that the validation layer itself produces and can decline to produce.

See Structured outputs and Headless mode for the documented envelope fields and failure subtypes.

### 도메인

Claude Code Configuration & Workflows



## 질문 8

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Your CI pipeline invokes a /pr-review skill defined at .claude/skills/pr-review/SKILL.md. During one run, the skill edited a source file to demonstrate a suggested fix. Reviews must be strictly read-only. Which change enforces this?

**A(정답).** Set allowed-tools in the SKILL.md frontmatter to Read, Grep, and Glob, omitting every write-capable tool.

**설명**

This is correct because allowed-tools is an enforced restriction on which tools the skill can invoke during execution, not a suggestion the model may ignore. Whitelisting only read-only tools means edits, file writes, and shell commands are simply unavailable to the skill, which is the guarantee an unattended CI run requires.

**B.** Add argument-hint to the frontmatter so the skill prompts for an explicit review scope before it runs.

**설명**

This is incorrect because argument-hint only prompts for missing parameters when a skill is invoked without arguments. It shapes what input the skill receives, but it does nothing to restrict which tools the skill can call during execution.

**C.** Write a prominent instruction in the SKILL.md body stating the skill must never edit or create files.

**설명**

This is incorrect because instructions in the skill body are guidance the model follows probabilistically, not an enforced boundary. The scenario already shows an edit slipped through, so a stronger prompt still leaves a nonzero failure rate in an unattended pipeline.

**D.** Add context: fork to the frontmatter so the skill runs in an isolated subagent separate from the main session.

**설명**

This is incorrect because context: fork addresses context pollution, not capability. It keeps verbose skill output out of the main conversation, but a forked skill can still attempt whatever tool calls the model chooses, including editing files.

### 전반적인 설명

The key distinction this situation tests is between instructions and configuration-level enforcement in a skill. The markdown body of a SKILL.md is a prompt the model works from: it follows it with high but not perfect reliability. The allowed-tools frontmatter field is different in kind; it restricts which tools are available to the skill while it runs, so an Edit, Write, or Bash call attempted by the review skill is structurally unavailable rather than merely discouraged. For an unattended CI run, where no human is watching to catch a stray edit, that structural guarantee is what makes the design sound. The crucial detail is to whitelist only read-only tools (Read, Grep, Glob) and omit every mutation path, including shell access; allowing Bash would reopen file modification through commands even with Edit and Write excluded.

The other frontmatter options solve different problems. context: fork runs a skill in an isolated subagent context so verbose exploration does not crowd the main session; it changes where output accumulates, not what tool calls can go through. argument-hint improves invocation ergonomics by prompting for required parameters when the skill is called bare; it has no bearing on tool execution. Reaching for either here confuses isolation or input handling with an enforced boundary.

A useful mental model: put desired behavior in the skill body, and put boundaries you must guarantee in configuration such as allowed-tools (or hooks, for rules that must hold across every tool call in a session). Skills live at .claude/skills/<name>/SKILL.md for project scope (shared through version control, which is how the CI checkout receives them) or ~/.claude/skills/ for personal use. See the Claude Code slash commands documentation for how skills are defined and configured.

### 도메인

Claude Code Configuration & Workflows



## 질문 9

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : CI-generated tests keep ignoring the team's fixture library, and review comments apply inconsistent criteria across pull requests. Which two configuration decisions address this? (Select two.)

**A.** Place the standards in each engineer's ~/.claude/CLAUDE.md so the conventions follow whoever triggered the pipeline build.

**설명**

This is incorrect because user-level CLAUDE.md applies only to that user's local environment and is never shared through version control. A CI runner does not inherit any engineer's home-directory configuration, so the pipeline would still run without the standards.

**B(정답).** Keep the CLAUDE.md content concise and focused, since every run reads it and long files reduce how reliably rules are followed.

**설명**

This is correct because CLAUDE.md is read on every run and its content consumes context. Anthropic recommends keeping the file concise (roughly under 200 lines per file); a lean file both controls cost and improves how consistently each rule is followed.

**C(정답).** Document testing standards, fixture conventions, and review criteria in a repository-root CLAUDE.md committed to version control.

**설명**

This is correct because a repository-root CLAUDE.md is the documented mechanism for giving CI-invoked Claude Code project context. It travels with the repository, so every pipeline run loads the same standards, fixture documentation, and review criteria.

**D.** List the pipeline's required tool permissions inside CLAUDE.md so reviews are guided and authorized from a single file.

**설명**

This is incorrect because CLAUDE.md provides instructions and context, not permission grants. Tool access in automated runs must be configured through allowed tools, permission rules, or the action configuration; nothing written in CLAUDE.md can authorize a tool.

### 전반적인 설명

When Claude Code runs inside a pipeline, it has none of the tacit knowledge a human reviewer carries: it does not know the fixture library exists, what the team considers a valuable test, or which review findings matter. The repository-root CLAUDE.md is the channel for that knowledge. Because it is committed with the code, every CI invocation, every teammate, and every automation trigger loads the identical project context, which is exactly what makes generated tests use shared fixtures and makes review criteria consistent across pull requests. Anthropic's GitHub Actions documentation explicitly recommends defining code style guidelines, review criteria, and preferred patterns there.

The second lever is discipline about size. CLAUDE.md is read at the start of every run, so its contents are a recurring context cost, and every line competes with every other line for the model's attention: a bloated file makes each individual rule less reliably followed. The memory documentation recommends keeping each file concise, targeting under 200 lines, and splitting or importing supporting material rather than accumulating a monolith.

The two rejected choices fail on scope and on mechanism. User-level configuration in ~/.claude/CLAUDE.md belongs to one person's machine; a CI runner never sees it, and even among teammates it guarantees drift because it is unshared. And CLAUDE.md is guidance, not enforcement: it cannot grant or restrict tool access. In automation, permissions come from allowed-tools configuration, permission rules, or the action setup, as covered in the headless mode documentation. The useful mental model is that CLAUDE.md tells Claude what good looks like, while permissions and hooks decide what Claude is allowed to do.

### 도메인

Claude Code Configuration & Workflows


## 질문 10

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : An engineer on this team is trialing stricter draft review criteria before proposing them for the pipeline. The criteria must load only in this repository and must never reach teammates through version control. Where should the criteria live?

**A.** Put them in the project CLAUDE.md on a local branch that is never pushed.

**설명**

The project CLAUDE.md is the file intended for team-shared standards, and parking edits on an unpushed branch is fragile: a merge, rebase, or accidental push would ship the draft criteria to everyone. Version control discipline is not the documented mechanism for personal instructions.

**B(정답).** Put them in CLAUDE.local.md at the repository root and add it to .gitignore.

**설명**

CLAUDE.local.md is the documented location for personal, project-specific instructions. It loads for sessions in this repository only, and adding it to .gitignore keeps it out of version control so teammates and CI clones never receive it.

**C.** Put them in .claude/settings.local.json, which Claude Code keeps out of git.

**설명**

The local settings file is per-user and per-project, but it carries JSON configuration such as permissions and tool settings, not instruction prose. Review criteria are natural-language guidance and belong in a memory file, not a settings file.

**D.** Put them in ~/.claude/CLAUDE.md, which is never committed to version control.

**설명**

The user-level file is indeed private to one user, but it applies across every project that user opens, not just this repository. The requirement that the criteria load only in this repository rules it out.

### 전반적인 설명

Claude Code's memory system distinguishes instructions along two axes: which projects they load in and whether they travel through version control. The user-level ~/.claude/CLAUDE.md is private but global: it loads in every project that user opens. The project-level CLAUDE.md is scoped to one repository but shared: it is committed and every teammate's sessions (including CI checkouts) load it. CLAUDE.local.md fills the remaining quadrant: personal instructions scoped to a single project, kept out of git by adding it to .gitignore. Draft review criteria being trialed in one repository fit that quadrant exactly.

The design reason for this split is that instructions are context, and context should load only where it is relevant. Putting the draft criteria in the user-level file would inject them into unrelated projects; putting them in the shared project file would push an unvetted policy onto teammates and the pipeline before it has been agreed. Claude Code discovers CLAUDE.md and CLAUDE.local.md from the working directory and its ancestors and concatenates them into context, so the local file supplements the shared one rather than replacing it.

The settings files follow a parallel but separate scheme: .claude/settings.local.json is likewise per-user and per-project, but it holds machine-readable configuration (permissions, tool settings), not natural-language guidance. Confusing the settings hierarchy with the memory hierarchy is a common mistake; each has its own personal and shared tiers. See Manage Claude's memory and Claude Code settings.

### 도메인

Claude Code Configuration & Workflows



## 질문 11

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A pipeline stage has Claude Code implement a diff-annotation utility, but each regeneration drifts from the specified behavior in different ways. Which workflow most reliably converges the implementation on the required behavior?

**A.** Have Claude generate the implementation and its own tests in the same run, so the tests are guaranteed to match the produced code.

**설명**

Tests written after the code by the same session tend to describe what the code already does rather than what the specification requires. They will pass even when the implementation deviates from the intended behavior, so they provide no convergence pressure.

**B.** Rewrite the specification prose in greater detail after each regeneration, restating the requirements Claude missed the previous time.

**설명**

Prose specifications remain open to interpretation no matter how detailed they get, which is why the behavior drifts in the first place. Without an executable check, there is no objective signal telling Claude which parts of its output are wrong.

**C.** Lower the sampling temperature for the generation step so successive regenerations produce more consistent implementations.

**설명**

Reducing temperature makes output more repeatable, but a consistently wrong implementation is still wrong. The problem is that the requirements are underspecified as a verifiable target, not that generation is too variable.

**D(정답).** Write tests encoding the required behavior first, then have Claude implement against them, feeding failures back until the suite passes.

**설명**

This is test-driven iteration: the tests turn the specification into a verification check Claude can run, read, and fix against. Each failure gives concrete, unambiguous feedback, so successive iterations converge instead of drifting.

### 전반적인 설명

The most reliable way to make Claude Code converge on a precise behavioral target is to give it a verification check it can run itself. Writing the test suite before implementation turns the specification into executable ground truth: Claude implements, runs the tests, reads the failures, and fixes them, repeating until everything passes. This is the documented test-driven iteration pattern, and it works because a failing assertion is unambiguous feedback in a way that prose never is. Anthropic's guidance for bug fixing follows the same logic: ask Claude to write a failing test that reproduces the issue first, then fix it.

The mental model is that an agentic loop needs an objective success signal to steer by. Restating requirements in longer prose leaves the success criterion in natural language, where interpretation can shift on every regeneration; that is exactly the drift being observed. Having Claude author tests alongside the code in the same run inverts the direction of truth: the tests end up describing whatever the code happens to do, so they pass without verifying the specification. Lowering temperature addresses variance, not correctness; it makes the utility fail the spec the same way every time rather than converging on it.

In a CI context this pattern also composes well: the pre-written suite becomes the pipeline's gate, and any regeneration that does not pass it is rejected mechanically rather than by human inspection. See Claude Code best practices and the common workflows guide for the documented write-tests-first and fix-failures iteration loop.

### 도메인

Claude Code Configuration & Workflows



## 질문 12

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline invokes a /coverage-audit skill that scans the repository for untested modules before generating tests. Its multi-thousand-line exploration transcript persists in the session and crowds out the pull request diff. What change addresses this?

**A.** Set allowed-tools in the skill's SKILL.md frontmatter to Read, Grep, and Glob so the audit produces less exploratory output.

**설명**

This is incorrect because allowed-tools restricts which tools a skill may invoke, which is a security and safety boundary. Read, Grep, and Glob are exactly the tools a repository scan uses, so this restriction does nothing to keep the exploration transcript out of the main session.

**B(정답).** Add context: fork to the skill's SKILL.md frontmatter so the audit runs in an isolated subagent and returns a summary.

**설명**

This is correct because context: fork runs the skill in a forked subagent context: the skill content becomes the subagent's prompt, the verbose exploration happens in that isolated context, and only a summarized result returns to the main conversation. The diff under review is never crowded out because the transcript never enters the main session.

**C.** Instruct the pipeline to run /compact immediately after the skill completes so the accumulated audit output is summarized.

**설명**

This is incorrect because /compact is a recovery step, not a prevention mechanism: the verbose output still floods the session first, and summarization risks dropping precise details such as the specific untested modules or line references the review needs. Isolating the output at the source is the designed solution.

**D.** Move the audit instructions into the project CLAUDE.md so they load once per session instead of on every invocation.

**설명**

This is incorrect because CLAUDE.md content is always loaded into every session, which increases baseline context consumption rather than reducing it. The problem is not where the instructions live but where the skill's verbose runtime output accumulates.

### 전반적인 설명

Skills invoked normally run inside the main conversation: the rendered SKILL.md content and everything the skill does, including every tool result from its exploration, enters the session and persists across later turns. For a skill whose whole job is broad discovery, such as scanning a repository for coverage gaps, that transcript can dwarf the task the session actually exists for, in this case reviewing a pull request diff.

context: fork is the frontmatter mechanism designed for exactly this. Setting context: fork in SKILL.md runs the skill in a forked subagent: the skill body becomes the subagent's prompt, the verbose work happens in that isolated context, and only a summarized result flows back to the main conversation. The tradeoff to understand is that the forked subagent does not see the main conversation history, so the skill's instructions must be self-contained; the isolation that protects the main context is the same isolation that cuts the skill off from it. This also means context: fork only makes sense for skills with explicit instructions, not for passive guidelines.

The distractors each act on the wrong lever. Running /compact summarizes the conversation after the damage is done and can lose exact details during summarization. allowed-tools constrains what a skill may invoke; read-only exploration tools are precisely what generates the volume here. Moving instructions into CLAUDE.md makes them always-loaded, adding permanent context cost without touching runtime output. See Agent Skills and Subagents for the isolation model and when to prefer it over the main conversation.

### 도메인

Claude Code Configuration & Workflows



## 질문 13

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A pipeline step invokes claude "review this diff for security issues" and the job hangs until the CI timeout kills it. What change makes this invocation work in the automated pipeline?

**A(정답).** Add the -p flag so Claude Code processes the prompt, prints the result, and exits.

**설명**

The -p (or --print) flag runs Claude Code in non-interactive mode: it executes the given prompt, writes the result to stdout, and exits without waiting for user input. This is the documented way to run Claude Code in automated pipelines, which is exactly why the interactive invocation hangs.

**B.** Add the --bg flag so the review runs as a background task detached from the terminal.

**설명**

Backgrounding does not convert the run into a print-and-exit execution, and the non-interactive mode documentation states that --bg is rejected in that context. The supported mechanism for pipeline runs is the -p flag.

**C.** Pipe the string yes into the command so any interactive prompts are auto-confirmed.

**설명**

Feeding canned confirmations into an interactive session is a fragile workaround, not the supported automation path. Non-interactive mode does read stdin, but it is meant to receive content to process alongside a -p prompt, not simulated keypresses for an interactive UI.

**D.** Append --output-format json so the run emits machine-readable output and terminates.

**설명**

The --output-format flag controls the shape of the output in print mode; it does not by itself switch the CLI out of interactive mode. Without -p, the session still waits for interactive input and the job continues to hang.

### 전반적인 설명

Claude Code has two fundamentally different execution modes. The default is an interactive session that opens a prompt and waits for a human, which is why a bare claude "..." invocation in CI stalls until the runner's timeout kills it. The -p (or --print) flag switches to non-interactive mode (historically called headless mode): the CLI takes the prompt, runs it to completion, prints the result to stdout, and exits. That process model is what a pipeline needs, because CI steps are judged by exit codes and captured output, not by a terminal conversation; a successful -p run exits 0 and failures return a non-zero code.

Non-interactive mode also behaves like a normal Unix command: it reads piped stdin (for example cat diff.txt | claude -p "review this") and composes with companion flags such as --output-format json for machine-readable results, --allowedTools to pre-approve tools, and --max-turns to bound agentic loops. The key mental model is that these companion flags refine a print-mode run; none of them creates one. --output-format only changes how output is serialized, piping confirmations into an interactive UI is brittle scripting against a human interface, and --bg is explicitly rejected by non-interactive mode rather than being a substitute for it.

See Run Claude Code non-interactively and the CLI reference for the full flag set and scripting patterns.

### 도메인

Claude Code Configuration & Workflows



## 질문 14

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A team adds context: fork to a /severity-triage skill to keep its verbose analysis out of the main session, but the skill now ignores findings established earlier in the session. What should they change while keeping the isolation?

**A.** Remove context: fork from the frontmatter so the skill runs with the full session history again.

**설명**

This is incorrect for the stated goal. Removing the fork would restore visibility into the session, but it also puts the skill's verbose analysis back into the main conversation, which is exactly the pollution the team adopted context: fork to prevent.

**B.** Expand the skill's allowed-tools list so the forked subagent can read the session's transcript.

**설명**

This is incorrect. The allowed-tools field governs which tools a skill may invoke, not what conversational context it receives. No tool grant restores the main conversation history to a forked subagent, because the fork's isolation is a context boundary rather than a tool restriction.

**C.** Record the session's findings in the project CLAUDE.md so the skill loads them automatically.

**설명**

This is incorrect. CLAUDE.md carries persistent, always-relevant project guidance, not state generated during one review session. Writing transient per-session findings into shared project configuration misuses that surface and would go stale immediately.

**D(정답).** Pass the established review findings explicitly as input when invoking the forked skill.

**설명**

This is correct. A skill with context: fork runs in an isolated subagent whose prompt is the skill content itself; the subagent does not inherit the main conversation history. Supplying the findings explicitly at invocation gives the fork the session state it needs while preserving the isolation the team wanted.

### 전반적인 설명

The context: fork frontmatter field trades context sharing for context hygiene. When a skill is invoked normally, its rendered SKILL.md content and everything the skill produces enter the main conversation and persist across later turns, but the skill also sees everything the session has already discussed. When the skill is forked, it runs as a subagent whose prompt is the skill content itself: verbose exploration stays out of the main session and only a summarized result returns, but the subagent does not have access to the main conversation history. That is exactly the failure here; the skill previously leaned on findings sitting in the transcript, and after forking those findings are simply not visible to it.

The mental model is that forking is an isolation boundary in both directions. It protects the main session from the skill's noise, and it cuts the skill off from the session's accumulated state. The design implication is that a forked skill must be self-contained: whatever inputs it needs, such as the findings to triage, must be passed explicitly at invocation rather than assumed from context. If a task genuinely needs shared context across phases or frequent back-and-forth with the session, official guidance is to keep it in the main conversation rather than fork it.

The other fixes miss the mechanism or sacrifice the goal. Tool access is governed by allowed-tools and no tool grant re-attaches conversation history to a fork; removing context: fork reintroduces the very pollution the team set out to eliminate; and per-session findings are transient state, not the persistent project guidance CLAUDE.md is meant to hold. See Agent Skills and Subagents for how forked skill execution and subagent context isolation work.

### 도메인

Claude Code Configuration & Workflows



## 질문 15

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Review conventions for the payments service apply only to files inside that service's directory, and the owning team wants to maintain the conventions alongside the code they change. Where should these conventions live?

**A.** In a file under the central .claude/rules/ directory with a paths glob that matches the payments directory tree.

**설명**

A path-scoped rule would load correctly, but the guidance reserves path-scoped rules for conventions that apply to files scattered across many locations. When the conventions belong to a single directory and its owning team wants to maintain them next to the code, a subdirectory CLAUDE.md keeps ownership and content co-located.

**B.** In each payments engineer's ~/.claude/CLAUDE.md so their sessions consistently apply the conventions.

**설명**

User-level files are personal and never travel through version control, so CI invocations and other teammates would not receive the conventions. Shared conventions must live in the repository to apply consistently across sessions and pipeline runs.

**C(정답).** In a CLAUDE.md file inside the payments service directory, loaded on demand when Claude works on files there.

**설명**

A subdirectory CLAUDE.md is the documented fit when conventions are tied to one directory and the directory's owners maintain them alongside their code. Claude Code loads nested CLAUDE.md files on demand when it reads files in that subtree, so the conventions apply exactly where they matter without loading elsewhere.

**D.** Appended to the root CLAUDE.md so every review session loads them regardless of which files are under review.

**설명**

Root CLAUDE.md content loads in every session, so conventions relevant to one service would consume context during reviews of unrelated code. The guidance for large projects is to move instructions that matter for only one part of the codebase out of the always-loaded root file.

### 전반적인 설명

Claude Code offers two repository-shared mechanisms for scoping conventions to a portion of a codebase, and they are optimized for different shapes of problem. A subdirectory CLAUDE.md is discovered by directory traversal: it is loaded on demand when Claude reads files in that subtree, and it lives physically next to the code it governs, so the team that owns the directory naturally reviews and updates it in the same pull requests that change the code. A path-scoped rule in .claude/rules/ uses a YAML paths glob and loads when Claude works with matching files anywhere in the tree; it belongs in the central rules area and shines when one convention must follow a file type or pattern scattered across many directories, such as test files co-located throughout a repository.

The stem describes the first shape: conventions bound to a single directory, maintained by that directory's owners. Anthropic's monorepo guidance draws exactly this line, recommending per-directory CLAUDE.md when directory owners maintain conventions alongside their code and path-scoped rules when the same rule applies to many scattered paths. Putting the content in the root CLAUDE.md would load it into every session, including reviews of unrelated services, which is the context bloat both mechanisms exist to avoid. A user-level ~/.claude/CLAUDE.md fails outright for shared and automated use, since it is never version controlled and would be invisible to CI runs and to teammates.

See Large codebases for the per-directory versus path-scoped comparison and Memory for how CLAUDE.md files and .claude/rules/ load.

### 도메인

Claude Code Configuration & Workflows



