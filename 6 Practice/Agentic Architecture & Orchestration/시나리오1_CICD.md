# 시나리오1_CICD

## 질문 2

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : An Agent SDK application pulls data from three MCP servers that return Unix timestamps, ISO 8601 dates, and numeric status codes respectively, and its agent frequently misinterprets these mixed formats when correlating findings. What is the most reliable fix?

**A.** Register a PreToolUse hook that blocks each outgoing data-retrieval call whenever the target server does not return canonical formats.

**설명**

PreToolUse hooks fire before a tool executes and can enforce policy by allowing or blocking the call, but blocking never transforms the data a server returns. Blocking retrievals from heterogeneous servers simply prevents the agent from accessing that data, which intercepts the wrong point in the lifecycle for a result-normalization problem.

**B.** Expose a convert_formats MCP tool and instruct the agent to invoke it after each data-retrieval call it makes.

**설명**

This makes normalization contingent on the model remembering to call the extra tool on every retrieval, which is exactly the kind of probabilistic compliance the problem needs to eliminate. It also adds an extra tool-call loop for every lookup, increasing latency and token cost.

**C(정답).** Register an Agent SDK PostToolUse hook that transforms each tool result into one canonical format before the model processes it.

**설명**

This is correct because an Agent SDK PostToolUse hook intercepts a tool result after execution and applies data transformations before the model processes it. Normalization happens deterministically at a single central point, works even for third-party servers you cannot change, and never depends on the model remembering to translate values.

**D.** Document each server's timestamp and status-code conventions in the system prompt so the model translates the values.

**설명**

Prompt documentation is probabilistic guidance, not enforcement; the model may still misread a Unix timestamp as a numeric code under load or in long contexts. It also adds permanent token overhead to every request without guaranteeing consistent interpretation.

### 전반적인 설명

When an agent consumes data from multiple MCP servers, each server defines its own output conventions: one may emit Unix epoch integers, another ISO 8601 strings, another bare numeric status codes. The model then has to infer, on every turn, which convention applies to which value. That inference is probabilistic, and mixed formats sitting side by side in context is precisely where it breaks down.

The architectural answer is to move normalization out of the model's reasoning and into deterministic code. In the Claude Agent SDK, a PostToolUse hook intercepts a tool result once the tool has run and applies transformations before the model processes it. Code at that point can convert every timestamp to ISO 8601 and every status code to a labeled string, so the model only ever reasons over one canonical format. Because the transformation runs on the result rather than inside the server, it works identically for tools you own and third-party servers you cannot modify, and it lives in one place instead of being scattered across server implementations.

The other approaches each fail on a mechanism-level detail. A PreToolUse hook fires before execution and can allow or block the outgoing call, which is the right primitive for policy enforcement, but it never sees the response; blocking heterogeneous retrievals denies the agent data rather than normalizing it. System prompt documentation and an agent-invoked conversion tool both leave normalization to model compliance, which is greater than 90 percent but not 100 percent, and the tool approach additionally doubles the loop iterations for every retrieval. The general rule: use hooks when a behavior must happen every time, and prompts when flexibility is acceptable.

See the Claude Agent SDK hooks documentation and the MCP tools documentation for details on hook events and tool result handling.

### 도메인

Agentic Architecture & Orchestration



## 질문 13

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline's coordinator spawns three review subagents in parallel, each prompted only with "review this pull request." Their findings overlap heavily, nearly doubling token cost without adding review coverage. What is the most effective fix?

**A.** Run the subagents sequentially, passing each one the findings of the previous subagents so it avoids re-reporting flagged issues.

**설명**

Sequential execution sacrifices the parallelism that makes multi-subagent review fast, tripling wall-clock time. It also treats duplication as a runtime filtering problem rather than fixing the unclear task boundaries that cause it.

**B.** Add a shared log file that each subagent updates with its current focus area so the others can steer around duplicated work dynamically.

**설명**

Subagents run in isolated contexts and are designed for independent investigations, not runtime coordination through shared state. This mechanism adds fragile complexity and polling overhead when the coordinator could simply define distinct scopes up front.

**C(정답).** Have the coordinator assign each subagent one distinct review concern, such as security, test coverage, or style, in its delegation prompt.

**설명**

This is correct because subagents see only what their delegation prompt contains, so the coordinator must define non-overlapping boundaries before any work begins. Explicit partitioning removes the duplication at its source while keeping the three reviews fully parallel.

**D.** Let all three finish in parallel, then add a deduplication pass in the coordinator that merges overlapping findings before posting feedback.

**설명**

Deduplication after the fact cleans up the output, but every duplicated investigation has already been paid for in tokens and latency. The root cause, identical unscoped prompts, remains untouched, so the waste recurs on every pull request.

### 전반적인 설명

In the Claude Agent SDK, a subagent's context starts fresh: it does not inherit the parent conversation or the work of sibling agents. The only channel through which a subagent learns its assignment is the prompt the coordinator writes when spawning it. When three reviewers each receive the identical instruction "review this pull request," nothing distinguishes their scopes, so each independently investigates the full diff and the findings converge. The fix belongs where the ambiguity was created: the coordinator should partition the review space before delegating, giving each subagent an explicit, non-overlapping concern (security, test coverage, style) directly in its delegation prompt.

This design also matches how Anthropic frames parallel subagent work: it is most effective when the investigations are independent, with each agent exploring its own area and the parent synthesizing the results. Distinct scopes make the tasks genuinely independent, which preserves concurrency while eliminating wasted tokens. Scoping can be reinforced with per-agent tools restrictions and specialized system prompts in each AgentDefinition, so a style reviewer, for example, never needs the same breadth of exploration as a security reviewer.

The alternatives all treat the symptom. A post-hoc deduplication pass merges overlapping findings only after the duplicated token cost has been incurred, and it recurs on every run. Sequential execution with handed-forward findings gives up parallelism entirely and still requires the coordinator to pass prior results explicitly, since subagents cannot see each other's work. A shared coordination log asks isolated agents to perform runtime negotiation the architecture does not support well; inter-agent routing and scoping are coordinator responsibilities. See Subagents in the SDK and Create custom subagents.

### 도메인

Agentic Architecture & Orchestration



## 질문 14

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : In a pull request review pipeline, a security-review subagent completes its analysis and its findings must reach a fix-suggestion subagent. How should the findings be moved between the two subagents?

**A.** Merge the two subagents into one combined agent that reviews and proposes fixes within a single context, removing the handoff.

**설명**

This is incorrect because collapsing the pipeline into one agent discards the benefits the design exists for: separate specialized system prompts, per-agent tool restrictions, and context isolation that keeps verbose scan output out of the fix stage. The handoff cost is small compared to what centralized delegation preserves.

**B.** Have the fix-suggestion subagent repeat the security analysis itself so no findings ever need to be transferred between agents.

**설명**

This is incorrect because it duplicates the entire review inside an agent scoped for a different job, doubling cost and latency for every pull request. It also blurs the role boundaries and tool restrictions that make each subagent reliable at its own task.

**C(정답).** Have the coordinator collect the findings and include the relevant ones in the fix-suggestion subagent's delegation prompt.

**설명**

This is correct because subagents return their final results to the coordinator, and a subagent sees only what is explicitly placed in its prompt. Routing the findings through the coordinator keeps every exchange observable, lets one place apply error handling, and lets the coordinator curate exactly what context the fix-suggestion subagent receives.

**D.** Spawn both subagents in parallel in a single coordinator turn so the fix-suggestion work does not wait on the security review.

**설명**

This is incorrect because parallel spawning is appropriate only when subtasks are independent. The fix-suggestion subagent's input is the security findings, so launching it before those findings exist gives it nothing to work from.

### 전반적인 설명

In a hub-and-spoke multi-agent architecture, the coordinator is the single point through which all inter-agent information flows, and the documented subagent model matches this: a subagent runs in its own context, and only its final result returns to the parent. There is no shared memory between subagents, so the coordinator moves data between them by including it explicitly in the next delegation prompt. That design buys three things at once: observability (every result, error, and handoff is visible in one place, which matters in an unattended CI pipeline where no human watches the run), uniform error handling (a timed-out scanner or a malformed finding is handled by one consistent policy), and information control (the coordinator decides exactly what the fix-suggestion subagent sees, trimming noisy scan output to the findings that matter).

The alternatives each break part of this model. Spawning both subagents in parallel is the right move only for independent subtasks; here the second agent's entire input is the first agent's output, so a dependency exists and the work must be sequenced through the coordinator. Merging the two agents into one context removes the handoff but also removes the specialization, tool restrictions, and context isolation that made splitting the work valuable in the first place. Re-running the security analysis inside the fix-suggestion subagent avoids the transfer only by paying for the whole review twice per pull request.

The mental model to carry: subagents are isolated workers that report back to the hub, and the hub is where results are validated, routed, and turned into the next agent's context. See Create custom subagents for how subagents run in isolated contexts and return results to the parent conversation.

### 도메인

Agentic Architecture & Orchestration



## 질문 47

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A team schedules a Claude Code job to run a security-hardening pass on an unfamiliar API service where entry points, data flows, and shared dependencies are all undocumented. How should the job's prompt structure the work?

**A.** Restrict the pass to handlers named in past incident reports, since previously exploited code is where remaining vulnerabilities are most likely to concentrate.

**설명**

Past incidents are a weak proxy for current risk in an unfamiliar service, where unexamined handlers and undocumented data flows may hide the worst exposure. Restricting the pass to already-known trouble spots leaves the unmapped majority of the attack surface unassessed.

**B.** Apply a fixed, predefined sequence of hardening steps to every module uniformly, since consistent treatment of each file guarantees nothing in the service gets missed.

**설명**

A fixed pipeline suits predictable work where every step is known in advance, but here the scope itself is a discovery. Uniform treatment spends the same effort on low-exposure internals as on internet-facing handlers and cannot react when exploration reveals a shared dependency that changes the plan.

**C.** Have Claude patch issues as it encounters them while reading through files, letting priorities emerge naturally from whatever code the job happens to inspect first.

**설명**

Patching in encounter order skips the mapping step entirely, so effort is allocated by reading sequence rather than by exposure or impact. Early fixes may also need rework once a later-discovered shared dependency shows the initial changes were made without the full picture.

**D(정답).** Map the service's entry points and data flows first, rank handlers by exposure and impact, then follow a prioritized plan that adapts as shared dependencies surface.

**설명**

This applies adaptive decomposition, which fits open-ended tasks where the full scope is unknown up front. Mapping entry points and data flows establishes what exists, exposure ranking directs effort where a vulnerability hurts most, and an adaptive plan absorbs discoveries such as shared helpers that multiple handlers depend on.

### 전반적인 설명

Open-ended tasks like hardening an unfamiliar service call for dynamic adaptive decomposition: the agent first maps the terrain (using tools like Glob and Grep to inventory entry points, handlers, and data flows), identifies where exposure concentrates, and then builds a prioritized plan that revises itself as work reveals surprises, such as a shared validation helper that several handlers depend on and that must be fixed before individual patches make sense. This mirrors Anthropic's documented workflow of explore first, then plan, then code: jumping straight to producing changes in an unfamiliar codebase risks solving the wrong problem, because the decisions that matter most (which handlers deserve deep scrutiny, what shared code must change first) depend on information that only exploration produces.

The contrast is with fixed pipelines (prompt chaining), which suit predictable work where every step is known in advance. A service with undocumented structure is the opposite case: the scope itself is a discovery. A uniform checklist applied to every file ignores where risk actually sits, encounter-order patching lets reading sequence stand in for prioritization, and scoping to past incidents mistakes known history for the current attack surface. The mental model an architect should carry is that the decomposition strategy must match the task's uncertainty profile: known steps get a fixed chain, emergent steps get an adaptive plan. See Claude Code best practices for the explore-plan-implement workflow this pattern is built on.

### 도메인

Agentic Architecture & Orchestration



## 질문 4

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The review pipeline's coordinator delegates codebase investigation to exploration subagents, instructing each to run long, highly specific search queries (full function signatures with file paths). These searches frequently return zero matches, and reviews miss affected call sites. Which prompt-design change improves coverage?

**A.** Treat empty search results as retryable failures and have the coordinator resubmit the same query to a fresh subagent instance.

**설명**

An empty result from a valid search is not a failure; it is accurate information that nothing matched. Resubmitting the identical over-specific query to a new instance will produce the same empty outcome and conflates valid empty results with access errors.

**B.** Raise each subagent's tool-call budget so it can repeat its assigned specific query more times before returning a result.

**설명**

Rerunning a query that matches nothing yields nothing, no matter how many attempts are allowed. The budget is not the constraint here; the shape of the queries the coordinator prescribes is what prevents the subagents from finding relevant code.

**C.** Spawn additional exploration subagents so more variations of each highly specific query can run in parallel across the codebase.

**설명**

Adding more agents running the same class of over-narrow query multiplies cost without fixing the root cause. Coverage gaps come from the query strategy, not from insufficient parallelism, and spawning an agent for every permutation is a known inefficiency.

**D(정답).** Instruct subagents to start with short, broad searches, then progressively narrow toward specific call sites based on findings.

**설명**

This is the documented remedy for over-specific queries that return sparse results. Starting broad lets the subagent survey what actually exists in the codebase, and it can then refine its focus based on real findings instead of guessing an exact match up front.

### 전반적인 설명

When a coordinator hands exploration subagents queries that are too long and too specific, the subagents behave like a researcher who types an entire paragraph into a search box: the search space collapses to near-zero matches and whole regions of the codebase are never surveyed. Anthropic encountered exactly this failure while building its multi-agent research system and addressed it by prompting agents to start wide, then narrow down: issue short, broad queries first, inspect what the landscape actually contains, and only then drill into precise targets based on what was found. The same principle applies to code exploration in a review pipeline, where a broad search for a function name reveals call sites that an exact signature-plus-path query would never surface.

The mental model is that early queries in an investigation are for discovery, not confirmation. A coordinator that pre-commits every subagent to a hyper-specific target has effectively made all the coverage decisions before any evidence exists, which is the delegation-design equivalent of narrow decomposition: correctly executing subagents still produce incomplete results because the assignments themselves excluded most of the territory.

The distractors all treat symptoms. More parallel subagents running the same over-narrow queries scales cost, not coverage. Resubmitting an empty-result query as a retry confuses a valid empty result with a transient access failure; a search that legitimately matched nothing will match nothing again. Raising the tool-call budget lets a subagent repeat a doomed query more times without changing its outcome. See How we built our multi-agent research system and Building effective agents for the underlying orchestration and search-strategy guidance.

### 도메인

Agentic Architecture & Orchestration



## 질문 8

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A nightly re-review job wants to reuse yesterday's review session after a developer pushes a few new commits touching a handful of files. Most of the prior analysis remains valid. How should the job proceed?

**A(정답).** Resume the prior session, supply the list of files the new commits changed, and instruct Claude to re-read those files before reusing earlier findings.

**설명**

This is correct. A resumed session restores conversation history, not filesystem state, so yesterday's tool results describe the old code and nothing marks them as stale. Explicitly naming the changed files and directing targeted re-reads corrects exactly the outdated evidence while preserving the still-valid bulk of the analysis.

**B.** Resume the prior session with no additional input, since resumption automatically reconciles saved tool results with the current repository state.

**설명**

No such reconciliation exists; sessions persist the conversation, not the filesystem, and resuming performs no file refresh of any kind. Without intervention, yesterday's Read and Grep results sit in context as if current, so comments may reference code the new commits deleted.

**C.** Resume the prior session and compact its history first, so the outdated tool results are summarized away before the new review begins.

**설명**

Compaction compresses the conversation but does not verify it against the repository; a summarized stale finding is still stale. The summary would carry forward yesterday's outdated conclusions as compactly stated facts rather than replacing them with current file contents.

**D.** Discard the prior session and launch a completely fresh review that re-explores the entire repository so no stale analysis can carry over.

**설명**

Full re-exploration is the right call when changes are so extensive that most prior tool results are invalid, but here only a few files changed and most analysis remains valid. Discarding the session re-pays the entire analysis cost to fix a problem that targeted re-reads solve far more cheaply.

### 전반적인 설명

The mental model to hold here is that a session is a transcript, not a workspace snapshot. What gets written to disk and restored on resume is the conversation: the prompts, every tool call, every tool result, and the model's responses. The Agent SDK sessions documentation states this directly, warning that sessions persist the conversation, not the filesystem. Resuming is therefore neither a rollback nor a refresh; it reloads the exact message history so the agent picks up with full prior context.

This design is what makes resumption valuable, because expensive analysis does not have to be redone, but it also creates a staleness hazard. Yesterday's Read and Grep results are ordinary messages in the transcript, and nothing in the resumed session compares them against the current repository. To Claude, a file it read yesterday looks exactly as authoritative as one it read a moment ago, so it will confidently comment on functions that no longer exist.

Staleness management is therefore the caller's job, and the right tool depends on how much has drifted. When changes are limited, as here, resume and tell the session exactly which files changed, directing it to re-read them before trusting earlier findings; that surgically replaces the invalid evidence while keeping the rest of the analysis. When changes are extensive enough that most prior tool results are invalid, start a fresh session seeded with a structured summary of the earlier conclusions instead. Resuming blind assumes an automatic reconciliation that does not exist, a full restart wastes the mostly valid analysis, and compaction merely compresses the stale evidence without correcting it.

### 도메인

Agentic Architecture & Orchestration



## 질문 31

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A CI pipeline delegates test-suite execution to a subagent while the coordinator continues the review. Which design decisions correctly account for the subagent's context behavior? (Choose two.)

**A(정답).** Put conventions the subagent must always follow into the project CLAUDE.md, which custom subagents load at startup.

**설명**

This is correct: a fresh subagent context is not empty. Custom subagents load the CLAUDE.md hierarchy along with their own system prompt, tool definitions, and the delegation prompt, so project-wide conventions placed there reach the subagent; only the built-in Explore and Plan agents skip CLAUDE.md.

**B.** Keep review instructions only in the main conversation's system prompt, expecting them to carry over to the subagent.

**설명**

This is incorrect: a subagent runs its own system prompt plus environment details, not the full parent system prompt. Instructions that must reach the subagent have to be part of its own definition or the delegation prompt.

**C(정답).** Have the subagent execute the tests within its own context and return only its final message to the parent conversation.

**설명**

This is correct: a subagent's intermediate tool calls and results remain within its own context window, and the parent receives only the final message as the tool result. Designing the handoff this way keeps verbose output from accumulating in the coordinator's context.

**D.** Omit earlier tool results from the delegation prompt, since the subagent automatically sees them within the same session.

**설명**

This is incorrect: a non-fork subagent starts with no parent conversation history, including prior tool results. Anything the subagent needs from earlier work must be passed explicitly in the delegation prompt.

### 전반적인 설명

The mental model for subagents is context isolation with an explicit handoff channel. A non-fork subagent starts a fresh conversation: it never sees the parent's message history, prior tool results, or the parent's system prompt. The only parent-to-subagent channel is the delegation prompt string, and the only subagent-to-parent channel is the subagent's final message. Everything in between, every Bash call, every raw test log, stays sealed inside the subagent's own context window. This asymmetry is the entire point of the design: it lets a test-running or codebase-exploring subagent burn through thousands of tokens of noisy output while the main review conversation pays only for a concise summary.

At the same time, fresh does not mean empty. A custom subagent's context is assembled from its own system prompt, the task prompt Claude writes when delegating, its tool definitions, the project's CLAUDE.md hierarchy, and a git status snapshot. The built-in Explore and Plan agents are the documented exceptions that skip CLAUDE.md and git status to keep research cheap. So a subagent knows your project conventions even though it knows nothing about the current conversation.

The two incorrect design decisions each break the model in a different direction: relying on session-level sharing of tool results ignores that each subagent is a separate agent instance, and expecting the parent's system prompt to carry over confuses the subagent's tailored prompt with the coordinator's. In CI pipelines this matters practically: any review-specific rule the subagent must obey has to live in its own definition or be restated in the delegation prompt. See Subagents in the SDK and Create custom subagents.

### 도메인

Agentic Architecture & Orchestration



## 질문 54

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A session has completed a thorough baseline analysis of a large pull request. The team wants to evaluate two competing review-prompt strategies from that identical baseline, with neither evaluation influencing the other. What should they do?

**A.** Create a separate git worktree for each strategy so the two evaluations run against fully isolated file trees that cannot interfere.

**설명**

Worktrees isolate filesystem state, not conversation state. A session is accumulated conversation history, and a new session started in a worktree begins with no memory of the baseline analysis, so this approach solves the wrong isolation problem.

**B.** Resume the analysis session sequentially for both strategies, instructing Claude to disregard the first evaluation before beginning the second one.

**설명**

Sequential resumption of the same session accumulates both evaluations in one shared history. A prompt instruction cannot make the model selectively forget prior context, so the second evaluation is still influenced by the first.

**C(정답).** Resume the analysis session once per strategy with fork_session enabled, giving each evaluation its own copy of the baseline history.

**설명**

Correct. Forking on resume creates a new session that starts from a copy of the original history and receives its own session ID, while the original remains unchanged. Each strategy then evolves independently from the identical baseline, with no cross-contamination and no need to redo the analysis.

**D.** Start a fresh headless run for each strategy, seeding each prompt with a manually written summary of the baseline analysis findings.

**설명**

A hand-written summary is a lossy approximation of the baseline: details from the full analysis are inevitably dropped, and the two runs may receive slightly different framings. Forking carries the complete, identical history into both branches without re-paying the analysis cost.

### 전반적인 설명

A session in the Claude Agent SDK is accumulated conversation history: the prompts, tool calls, tool results, and responses that give the model its working knowledge of a task. Resuming a session restores exactly that history, nothing more; it does not snapshot or restore the filesystem. The mental model to hold is that the session is the agent's memory, and the repository is a separate concern.

The fork_session option exists precisely for "try a different approach" workflows. When you resume with forking enabled, the SDK creates a new session that begins from a copy of the original history and assigns it its own session ID, leaving the original session untouched. Repeating this once per strategy yields independent branches that share an identical baseline but diverge freely afterward. This is the tradeoff forking is designed to make: you pay nothing to duplicate the expensive analysis, and in exchange each branch's subsequent context is fully isolated from its siblings.

The alternatives each miss part of that model. Resuming the same session twice in sequence puts both evaluations in one history, and no prompt instruction can make a model selectively forget context it has already been given. Seeding fresh runs with a manual summary is workable but lossy: the summary is an approximation of the baseline, written twice, with no guarantee the two branches start identically. Git worktrees solve a real problem in CI, concurrent file access, but they isolate the file tree, not the conversation, so they do nothing to carry the analysis into either evaluation.

For details on how sessions, resumption, and forking behave, see the Agent SDK sessions documentation.

### 도메인

Agentic Architecture & Orchestration



## 질문 17

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Yesterday a developer named a Claude Code session ci-timeout-probe while investigating intermittent test timeouts in the pipeline. Since then, several other sessions have run in the same repository. What should the developer run today to pick that investigation back up?

**A.** Run claude --continue so Claude Code reopens the most recent session in the current directory.

**설명**

The --continue flag reopens only the most recent interactive session in the current directory. Because other sessions have run in this repository since the investigation, --continue would reopen one of those unrelated conversations instead.

**B(정답).** Run claude --resume ci-timeout-probe, which restores that session's conversation context.

**설명**

Passing a session name to --resume continues that specific saved conversation, restoring everything the investigation had already discovered. This works regardless of how many other sessions have run since, because the session is identified by its name rather than recency.

**C.** Run claude -p "continue the timeout investigation" to relaunch the work in non-interactive mode.

**설명**

The -p flag starts a one-shot non-interactive run with no memory of any prior session. The prompt text asks Claude to continue, but nothing from yesterday's conversation is available to it, so the investigation would start from zero.

**D.** Run claude -n ci-timeout-probe so a session under that name loads the investigation's prior context.

**설명**

The -n (or --name) flag assigns a name to a new session at startup; it does not look up or restore an existing session. Reusing the name would start a fresh conversation with none of the prior investigation's context.

### 전반적인 설명

Claude Code stores each session locally as a saved conversation tied to a project directory, which is what makes multi-day investigations practical: the accumulated reasoning, tool results, and hypotheses from one work session do not have to be rebuilt the next day. The mental model is that a session is an addressable artifact, and the CLI gives you two different ways to get back into one. claude --continue is a recency shortcut: it reopens whatever interactive session ran most recently in the current directory. claude --resume <name> is an identity lookup: it targets a specific session by its name (or ID with the -r short form), and running claude --resume with no argument opens an interactive picker.

The distinction matters exactly in situations like this one. If nothing else had run since yesterday, --continue would happen to land on the right conversation; once other sessions intervene, recency and identity diverge, and only the named lookup is reliable. This is why naming sessions up front is a habit worth building for any investigation expected to span days: names can be assigned at startup with claude -n <name>, mid-session with /rename, or from the session picker. Note that -n only assigns a name to a new session; it is not a resumption mechanism, which is what makes it a tempting but wrong answer here.

Similarly, claude -p exists for a completely different purpose: headless, one-shot runs suited to pipelines, where the process reads a prompt, prints a result, and exits with no session continuity. A prompt asking Claude to "continue" an investigation cannot substitute for actually restoring the conversation state. See the official Claude Code sessions documentation for the full set of session management commands.

### 도메인

Agentic Architecture & Orchestration



## 질문 20

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A team captured session IDs from two Claude Code runs: one analyzed service architecture in a codebase untouched since, and one audited a module whose files were later rewritten. Which session strategy fits each follow-up?

**A(정답).** Resume the architecture session as-is; start a fresh session seeded with a summary of the audit findings for the rewritten module.

**설명**

This applies the documented decision rule correctly. The architecture session's context is still valid because nothing changed, so resuming reuses the completed analysis without rerunning the original investigation, while the audit session's tool results describe file contents that no longer match the current module, so its useful conclusions should be captured as a summary and injected into a fresh session that re-reads the current code.

**B.** Start fresh sessions for both follow-ups, injecting summaries, since prior tool results cannot be trusted once any time has passed.

**설명**

This is incorrect because it discards a resumption that is perfectly safe. The architecture codebase is untouched, so its prior context is still valid; replacing it with a lossy summary throws away detail and forces the agent to rediscover the same findings for no reliability gain.

**C.** Resume the audit session so its detailed file reads carry over; start a fresh session with a summary for the architecture follow-up.

**설명**

This inverts the decision rule on both counts. The audit session's detailed file reads are exactly what went stale when the module was rewritten, while the architecture session is the one whose context remains accurate and worth resuming.

**D.** Resume both sessions, since restoring the full conversation history gives each follow-up complete access to what the prior run discovered.

**설명**

This is incorrect for the audit follow-up. Resuming restores the transcript exactly as recorded, including file reads that now describe rewritten code, and nothing revalidates that stale evidence, so the agent would reason over content that no longer matches the module.

### 전반적인 설명

The mental model behind this decision is that a Claude Code or Agent SDK session is persisted conversation history, not live state. It stores the prompt, every tool call, every tool result, and every response; resuming by session ID restores that transcript so the agent picks up with full context from where it left off. It does not snapshot the filesystem, re-run earlier tools, or revalidate anything previously read. That makes the safety of resumption entirely a function of whether the recorded evidence still describes reality.

For the architecture follow-up, nothing in the codebase changed, so every file read and conclusion in the transcript remains accurate; resuming is the correct move because it reuses completed analysis instead of rediscovering it. For the rewritten module, the transcript is now full of confidently stated file contents that no longer match the current code. The documented pattern for that case is to capture what actually mattered from the run, such as findings and decisions, as application state and pass it into a fresh session's prompt, letting the agent re-query authoritative sources (here, re-reading the current files). Anthropic's session documentation notes this fresh-session approach is often more robust than relying on transcript continuity.

The blanket strategies fail in opposite directions: resuming everything imports stale evidence, while restarting everything with summaries is lossy and wasteful when the prior context is still valid. The inverted pairing keeps exactly the context that went stale and discards exactly the context that survived. Note also that compaction or long-context management would not rescue a stale resume; the context window accumulates history and tool outputs without correcting them, so accuracy problems must be solved architecturally, not by compression. See Agent SDK Sessions and The Agent Loop for how session history and context accumulation behave.

### 도메인

Agentic Architecture & Orchestration



## 질문 40

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : During pipeline runs, Claude occasionally posts pull request feedback through the post_review_comment tool before executing the run_tests tool, despite system prompt instructions requiring tests first. Which design guarantees the required ordering?

**A(정답).** Add a PreToolUse hook that denies post_review_comment calls until a successful run_tests result has been recorded in the session.

**설명**

A PreToolUse hook intercepts the outgoing tool call in code before it executes, so a review comment can never be posted until the prerequisite test run has completed. This is programmatic enforcement, which provides the deterministic guarantee that prompt-based approaches cannot.

**B.** State the prerequisite in the post_review_comment tool description so Claude sees the required order whenever it considers the call.

**설명**

Tool descriptions influence how the model selects and constructs calls, but they remain guidance the model can still fail to follow. Like system prompt instructions, this improves reliability without guaranteeing the sequence is enforced.

**C.** Move the ordering requirement to the top of the system prompt and mark it IMPORTANT so it takes priority over other instructions.

**설명**

System prompt instructions provide only probabilistic compliance; raising the rule's prominence improves the odds but leaves a nonzero failure rate. The scenario shows the ordering is already being skipped despite instructions, so more emphatic prompting does not close the gap.

**D.** Scan Claude's text output for a statement that tests passed and only permit the review comment once that confirmation appears.

**설명**

Parsing the assistant's natural language for a completion or status signal is a documented anti-pattern. The model may phrase confirmation differently, claim tests ran when they did not, or omit the statement entirely, so this check is unreliable as an enforcement gate.

### 전반적인 설명

This question tests the core distinction between programmatic enforcement and prompt guidance for workflow ordering. When a specific tool sequence is required and skipping it has real consequences (here, posting review feedback that was never validated against test results), the correct mental model is that instructions are suggestions the model usually follows, while hooks are code the model cannot bypass. A PreToolUse hook runs before a tool call executes and can deny the call, feeding the reason back to Claude so it runs the prerequisite step and retries. Because the gate lives in the harness rather than in the model's context, compliance is 100% by construction, not by probability.

The design tradeoff is worth internalizing: prompts and tool descriptions are the right surface for preferences, style, and nuanced judgment, because they preserve the model's flexibility. Hooks are the right surface for invariants: preconditions, compliance rules, and ordering constraints where a single violation is unacceptable. Strengthening the system prompt or enriching the tool description both operate on the probabilistic side of that line, which is exactly where the failure already occurred. Scanning the assistant's text for a phrase like "tests passed" is a separate anti-pattern: it makes enforcement depend on how the model chose to word its output, and it cannot distinguish a genuine test run from a claimed one. If the check must be trustworthy, it should key off the recorded run_tests tool result, verified in code.

See Claude Code hooks reference and the hooks guide for how PreToolUse hooks intercept and block tool calls.

### 도메인

Agentic Architecture & Orchestration



## 질문 58

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline's main agent gathers the pull request diff, then delegates to a security-review subagent with the prompt "Assess the security implications of these changes." The subagent returns generic findings that reference no actual code. What should you change?

**A.** Rewrite the subagent's system prompt with deeper security-specific expertise so it grounds its analysis in the changed code.

**설명**

A specialized system prompt improves the quality of analysis, but no amount of security expertise lets the subagent analyze a diff that was never provided to it. The failure is missing input, not missing knowledge.

**B.** Add Read and Grep to the subagent's allowed tools so it can retrieve the diff from the parent's conversation history.

**설명**

Tool access does not solve this: there is no tool that reads the parent's conversation history, because subagent contexts are isolated. Even with Read and Grep, the subagent would not know which changes to look at without the diff or file paths in its prompt.

**C(정답).** Pass the pull request diff and relevant file paths directly in the Agent tool prompt for the security-review subagent.

**설명**

This is correct. A non-fork subagent does not inherit the parent's conversation history; its context starts fresh, and the only content the parent passes is the prompt string in the Agent tool call. The phrase "these changes" refers to a diff the subagent has never seen, so embedding the diff in the delegation prompt is the fix.

**D.** Restructure the delegation prompt as a step-by-step review checklist that forces the subagent to cite specific code.

**설명**

Adding procedural structure to the prompt does not fix an empty input. The subagent cannot cite specific code it has never received, no matter how detailed the checklist is.

### 전반적인 설명

The mental model to hold here is context isolation: when a coordinator spawns a subagent through the Agent tool (shown as Task in some listings and older SDK versions), that subagent begins with a fresh context window. It does not inherit the parent's conversation history, tool results, or intermediate findings. The only channel from parent to child is the prompt string in the tool call itself. A delegation prompt that says "assess these changes" therefore refers to material the subagent has literally never seen, and the model fills the gap with plausible but ungrounded generalities.

This isolation is a deliberate design tradeoff, not a bug. Keeping each subagent's context separate is what lets a research or review subagent burn through verbose exploration without polluting the main conversation, and it is what makes parallel subagent execution safe. The price of that isolation is an explicit handoff discipline: the coordinator must include the diff, relevant file paths, prior findings, and task constraints directly in the prompt it writes for the subagent.

The distractors all act on something other than the empty input. A sharper security system prompt raises expertise over nothing; granting Read and Grep does not help because no tool can reach into the parent's conversation, and the subagent would not even know which files changed; and restructuring the prompt as a checklist adds procedure without adding the missing data. The correct fix in this CI pipeline is to embed the diff (or precise pointers to it) in the delegation prompt itself.

See Subagents in the SDK for how subagent context windows work and what content passes from parent to subagent.

### 도메인

Agentic Architecture & Orchestration



## 질문 2

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The team is deciding how to decompose several automated jobs in the pipeline. Which two actions correctly apply a fixed prompt-chaining decomposition rather than dynamic adaptive decomposition? (Choose two.)

**A(정답).** Use fixed prompt chaining for a nightly documentation audit that follows a set sequence: extract public APIs, compare against published docs, list mismatches.

**설명**

Every step of this audit is known in advance and does not change based on intermediate findings, so a fixed sequential pipeline provides stability and reproducibility. Dynamic decomposition would add adaptivity overhead to a task with no uncertainty.

**B.** Use fixed prompt chaining for investigating an unexplained coverage regression whose scope and relevant modules only become clear as evidence accumulates.

**설명**

Because the scope is unknown up front and emerges from intermediate results, this task requires the agent to generate subtasks dynamically as it learns. Committing to a fixed pipeline here would lock the investigation into steps chosen before anything was discovered.

**C.** Use fixed prompt chaining for diagnosing an intermittent build failure where each finding determines which logs, configs, or files to examine next.

**설명**

This is an open-ended investigation where the next step depends on what the previous step revealed, which is the defining case for dynamic adaptive decomposition. A fixed script written before the evidence exists would frequently run irrelevant steps or miss the actual cause.

**D(정답).** Use fixed prompt chaining for a pull request review that always checks the same aspects, running per-file passes followed by a cross-file integration pass.

**설명**

This workflow has a predictable, repeating structure known before any work begins, which is exactly what fixed prompt chaining is designed for. Per-file passes followed by an integration pass give consistent depth and reproducible results on every PR.

### 전반적인 설명

The decision rule for task decomposition turns on one question: is the full sequence of steps knowable before any work begins? Prompt chaining (a fixed sequential pipeline) fits workflows whose structure repeats predictably, such as a code review that always evaluates the same aspects or an audit that always runs extract, compare, report. Fixing the steps buys reproducibility: every run follows the same path, results are comparable across PRs, and each individual step can be regression-tested and improved in isolation. In CI, where the same job runs hundreds of times, that determinism is exactly what you want.

Dynamic adaptive decomposition exists for the opposite profile: open-ended investigations where each finding reshapes what to do next. Diagnosing an intermittent build failure or an unexplained coverage regression cannot be scripted in advance, because the relevant logs, configs, and modules are only discovered mid-investigation. Forcing such work through a fixed pipeline means either an ever-growing script that tries to pre-enumerate every contingency, or an investigation that follows steps written before the evidence existed. The mental model an architect should carry: predictability of structure decides the pattern; fixed pipelines for predictable multi-aspect work, adaptive plans where the path emerges from intermediate results.

For the fixed-pipeline pattern, see Anthropic's guidance on chaining prompts and the broader discussion of workflow versus agent patterns in Building effective agents.

### 도메인

Agentic Architecture & Orchestration



## 질문 6

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A CI pipeline needs two automated checks: a lint and type-check gate that must run after every file edit, and an assessment of whether each pull request summary is misleading. Which two implementation choices fit these needs?

**A(정답).** Enforce the lint and type-check gate with a PostToolUse command hook that runs the checks as a shell command after each edit.

**설명**

Command hooks execute code deterministically at a fixed lifecycle point, so the gate fires on every matching event regardless of what the model decides. PostToolUse fires after a successful tool call, making it the right point to lint and type-check freshly edited files.

**B(정답).** Run the misleading-summary assessment as a separate model evaluation step in the pipeline, since the check requires judgment.

**설명**

Whether a summary is misleading cannot be expressed as a deterministic code check; it requires language-level judgment. A dedicated model call in the pipeline applies that judgment while leaving the deterministic gate to hook code.

**C.** Implement the misleading-summary assessment as a command hook that pattern-matches the summary text against flagged phrases.

**설명**

Misleadingness is a semantic property that string or pattern matching cannot capture; a summary can be entirely misleading while containing no flagged phrase. Command hooks are the right tool for mechanical, code-expressible rules, not for checks that need language judgment.

**D.** State both rules prominently in CLAUDE.md with emphasis markers so they load into context and shape every pipeline run.

**설명**

CLAUDE.md content is guidance the model follows probabilistically, not enforcement that runs as code. Emphasis raises priority only relative to other instructions and cannot guarantee the gate executes, which is unacceptable for a rule that must always run.

### 전반적인 설명

The core design question here is matching each requirement to the right enforcement surface. Claude Code hooks run at fixed lifecycle points and provide deterministic control: the handler executes because the event fired, not because the model chose to comply. Instructions in CLAUDE.md or a system prompt, by contrast, are guidance the model follows with high but never guaranteed probability. When a rule must run on every single execution, especially in an unattended CI pipeline where no human will notice a skipped check, it belongs in a hook, not in prose.

A command hook runs a shell command at the configured event, making it the natural fit for mechanical, code-expressible rules like running a linter and type checker. PostToolUse fires after a successful tool call, so attaching the gate there guarantees the checks run after every edit. The misleading-summary requirement is different in kind: it demands semantic judgment about whether prose fairly represents a diff, which no shell command or pattern match can compute. That check belongs in a model-backed evaluation, implemented as its own step in the pipeline, where a Claude call can weigh the summary against the actual changes.

The mental model: put deterministic rules in code that hooks execute, route judgment calls to a model evaluation step, and keep CLAUDE.md for conventions where occasional non-compliance is tolerable. See the Claude Code hooks guide and the hooks reference for hook events and command handler configuration.

### 도메인

Agentic Architecture & Orchestration



## 질문 15

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : You have two setup tasks: comparing two false-positive-reduction prompt strategies that must each build on a completed review-failure analysis, and independently reviewing test code Claude generated earlier. Which session design fits both tasks?

**A.** Start fresh instances for every task, seeding each with a manually written summary so no prior context carries into any of the work.

**설명**

Fresh instances are right for the review, but for the prompt comparison this replaces the full analysis baseline with a lossy manual summary written twice. Forking carries the complete analysis into both branches with no re-seeding effort or fidelity loss.

**B(정답).** Fork the analysis session into two branches for the prompt comparison, and open a fresh independent instance to review the generated test code.

**설명**

This matches each task to the right mechanism. Forking gives both prompt trials the full analysis baseline without re-establishing it, while a fresh instance reviews the generated code without inheriting the generator's reasoning, avoiding the self-review bias.

**C.** Fork the generator's session to perform the review, and start fresh instances seeded with the analysis summary for each prompt strategy.

**설명**

This assigns each mechanism to the task that defeats it. Forking the generator's session gives the reviewer the very reasoning context that undermines independent review, while fresh seeded instances give the prompt trials a degraded summary instead of the full inherited baseline.

**D.** Fork a session for each task, since forked branches give both the comparison and the review isolated contexts that cannot influence each other.

**설명**

Forking is wrong for the review task because a fork inherits everything up to the branch point, including the generator's reasoning. That inherited context is exactly what an independent review must not have, since a model anchored to its own reasoning is less likely to challenge it.

### 전반적인 설명

The core mental model is what a fork carries: fork_session branches the current context into independent lines that share everything up to the split point and nothing after it. That inheritance is the whole value proposition, and it cuts both ways. When two explorations should start from the same expensive baseline, such as a completed analysis of why the reviewer produces false positives, forking hands both branches the full analysis at zero cost and with no fidelity loss, then lets them diverge cleanly. When a task must not see prior context, that same inheritance becomes contamination.

Independent review is the canonical case of the second kind. A model that generated code retains its reasoning in context and is systematically less likely to question its own decisions; the fix is a second instance with no memory of how the code was built. Forking the generator's session would transplant exactly the reasoning the review needs to escape, so the right tool there is a fresh, cold instance.

The all-fresh approach fails the comparison task for the opposite reason: manually summarizing the analysis into two new sessions is lossy (numbers, edge cases, and nuance drop out of prose summaries) and duplicates setup work that forking makes free. The rule of thumb: fork when branches should share a baseline, start cold when the point is to have no baseline at all. See Session Management in the Claude Agent SDK for how sessions are resumed and forked, and Claude Code common workflows for continuing and resuming prior conversations.

### 도메인

Agentic Architecture & Orchestration



## 질문 17

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : After many turns analyzing a pull request's diff, failing tests, and design tradeoffs, you want a subagent to draft the review comment with full awareness of that discussion, without copying it all into the delegation prompt. What works?

**A(정답).** Spawn the drafting subagent as a fork of the current conversation so it inherits the discussion up to the point of delegation.

**설명**

A forked subagent is the documented exception to context isolation: it inherits the parent conversation up to the branch point, then diverges independently. This gives the drafting agent full awareness of the analysis without re-serializing it into the delegation prompt.

**B.** Delegate with a brief prompt like 'draft the review from our analysis,' since a subagent running in the same session can read that session's history.

**설명**

A normal, non-fork subagent starts with a fresh context window and receives only the delegation prompt string from the parent. It has no access to the session's earlier turns, so a prompt that refers to 'our analysis' points at material the subagent has never seen.

**C.** Have the drafting subagent run claude --resume against the main session so it loads the transcript before writing the comment.

**설명**

Resumption is a session-level mechanism for continuing a prior conversation, not a channel for a subagent to read its parent's live transcript. A subagent has no automatic ability to load the coordinating conversation's history this way.

**D.** Run /compact just before delegating so the compacted summary of the analysis is automatically carried into the subagent's fresh context.

**설명**

Compaction summarizes the main conversation's own context; it does not change what a subagent inherits. A non-fork subagent still starts fresh after compaction, so the compacted summary never reaches it automatically.

### 전반적인 설명

The default contract for subagents is context isolation: a non-fork subagent begins with a fresh context window containing its own system prompt, the delegation prompt the parent wrote, and startup material like CLAUDE.md, but none of the parent's conversation turns. The only content that transfers from parent to child is the Agent tool's prompt string. This design keeps the parent's window lean and lets many subagents run in parallel, but it means any prior discussion a subagent needs must either be written into its prompt or delivered through the one documented exception: a fork of the current conversation, which inherits everything up to the branch point and then evolves independently.

Here the accumulated analysis spans many turns and hand-copying it is ruled out, so forking is the mechanism that fits: the drafting subagent starts with the full diff analysis, test failures, and tradeoff discussion already in context. The alternatives all misunderstand where context lives. A bare prompt referencing 'our analysis' fails because the subagent never saw that analysis; /compact reshapes the parent's context but does not flow into a fresh subagent; and --resume reopens saved sessions rather than piping a live parent transcript into a child agent.

The mental model worth keeping: subagent context is explicit by default, inherited only by forking. See Subagents in the SDK and Create custom subagents for what a subagent's context window does and does not contain.

### 도메인

Agentic Architecture & Orchestration



## 질문 14

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Three parallel review subagents analyze each pull request, and a coordinator synthesizes one PR comment. The comment describes issues only vaguely, omitting file paths and line numbers that the subagents' tool calls clearly located. What should you change?

**A.** Raise the subagents' max turns limit so they have enough tool-use rounds to capture the precise locations before their runs end.

**설명**

The logs show the subagents already located the exact files and lines, so the investigation was not cut short. The details are lost at the handoff, not during discovery, and adding more tool-use rounds does not change what returns to the parent.

**B.** Grant the coordinator Read and Grep tools so it can open each subagent's transcript and extract the exact file and line details before writing the comment.

**설명**

A subagent's intermediate tool calls and results exist only inside its own isolated conversation, not in any transcript the coordinator can read with file tools. This approach also invites the coordinator to redo the investigation, defeating the purpose of delegation.

**C(정답).** Instruct each subagent to include file paths and line numbers in its final structured message, since only that message returns to the coordinator.

**설명**

Only a subagent's final message is returned to the parent as the tool result; all intermediate Grep and Read output stays inside the subagent's own conversation. Requiring the concrete details in that final message is the only way the coordinator can synthesize them into the PR comment.

**D.** Run the three subagents sequentially instead of in parallel so their full transcripts accumulate in the coordinator's context before synthesis begins.

**설명**

Context isolation is independent of scheduling: whether subagents run in parallel or one at a time, their intermediate work never accumulates in the parent's context. Sequencing them only adds latency without changing what the coordinator receives.

### 전반적인 설명

This failure comes from how subagent context isolation works in the Claude Agent SDK. Each subagent runs as a separate agent instance with its own conversation: every Grep match, file read, and intermediate reasoning step stays inside that conversation, and only the subagent's final message is returned to the parent as the Agent tool result. This design is deliberate; it lets a coordinator run several verbose investigations in parallel without absorbing every subtask transcript into its own context window. The tradeoff is that the final message becomes the entire handoff channel: anything the coordinator needs for synthesis, such as file paths, line numbers, severity, and rationale, must be explicitly written into that message, ideally in a structured format the synthesis step can consume.

The other approaches misunderstand the mechanism. Giving the coordinator file tools cannot recover the details because subagent transcripts are not artifacts the parent can read; the intermediate results simply do not exist outside the subagent's isolated conversation. Running the subagents sequentially changes scheduling but not isolation, since transcripts never flow to the parent either way. Raising the tool-use turn limit addresses a discovery problem the system does not have; the subagents already found the locations, and the loss happens at the boundary between child and parent.

The general design rule for multi-agent decomposition: treat each subagent's final message as a contract. Specify in the subagent's instructions exactly what the output must contain, and the coordinator can then synthesize a precise, actionable unified result from concise parallel findings. See Subagents in the SDK and the Agent SDK agent loop for how results flow back to the parent.

### 도메인

Agentic Architecture & Orchestration



## 질문 17

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : During automated runs, Claude sometimes inlines a CI service token into the Bash commands it constructs, which are echoed into build logs. The commands are legitimate and must still execute. Which hook design satisfies both requirements?

**A(정답).** Register a PreToolUse hook on Bash calls that returns updatedInput, rewriting the command to remove the token while echoing back the unchanged fields.

**설명**

This is the documented pattern for guardrails that redact rather than block: the hook intercepts the outgoing call, rewrites the input so the secret never reaches execution or logs, and the legitimate command still runs. Because updatedInput replaces the entire input object, the hook must echo back any fields it is not changing.

**B.** Register a PostToolUse hook on Bash calls that strips the token from the returned output before the result is added to Claude's context.

**설명**

PostToolUse fires only after the tool has already executed, so the command containing the token has already run and already appeared in the build logs. Scrubbing the result afterward sanitizes what Claude sees but does not prevent the exposure the compliance requirement targets.

**C.** Register a PreToolUse hook on Bash calls that returns a deny decision with a reason whenever the token appears, prompting Claude to reissue the command.

**설명**

A deny decision does keep the token out of execution, but it halts a legitimate command and relies on Claude reading the reason and correctly reissuing a token-free version, which is probabilistic. The scenario requires the command itself to still run, which rewriting the input guarantees and denial does not.

**D.** Add a rule to the project CLAUDE.md instructing Claude to reference the token only through an environment variable and never inline in Bash commands.

**설명**

CLAUDE.md content is guidance the model usually follows, not code that always runs, so an occasional inlined token will still slip through, especially on unattended CI runs. Compliance rules that must hold on every execution belong in hooks, which provide deterministic enforcement.

### 전반적인 설명

Hooks give an agent pipeline a deterministic control point that prompt instructions cannot provide, and the PreToolUse event is the enforcement primitive because it fires before the tool call executes. A PreToolUse callback receives the actual generated request, including tool_name and tool_input, and can respond in two distinct ways: return a permissionDecision of "deny" to stop the call outright, or return updatedInput to rewrite the call so it proceeds in a modified form. The right choice depends on the policy. When the action itself is forbidden, denial is correct; when the action is legitimate but carries something that must not pass through (a secret in a command string), rewriting the input is the fit, because it enforces the rule while preserving the workflow. One operational detail matters here: updatedInput replaces the whole input object, so the hook must copy forward every field it does not intend to change.

The other options fail on timing or guarantee. PostToolUse runs after a successful tool call, which makes it useful for normalizing or trimming results, but by then the command has executed and the token has already been written to the logs; a post-hoc scrub cannot undo the exposure. Denying and hoping Claude retries without the token converts a deterministic requirement into a probabilistic one and blocks commands the team explicitly needs to run. CLAUDE.md guidance shapes behavior but competes with everything else in context; on unattended CI runs, an instruction the model occasionally ignores is exactly the failure mode hooks exist to close. The mental model: prompts and memory files express preferences, PreToolUse hooks enforce rules, and within PreToolUse, deny stops an action while updatedInput sanitizes it. See the Agent SDK hooks documentation for the hook events and output shapes.

### 도메인

Agentic Architecture & Orchestration



## 질문 40

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A teammate proposes that the security-scan and style-check subagents pass their findings directly to the report subagent instead of returning them to the coordinator. How should you respond to this proposal?

**A.** Accept the direct handoff, since removing the coordinator hop batches results into fewer requests, lowering token cost and shortening the pipeline's run time.

**설명**

Central routing is not retained or removed for cost or latency reasons; each subagent still runs as its own agent instance with its own token usage, and observability and control are what the hub actually provides. Framing the decision around efficiency misses why the topology exists.

**B.** Reject the change because parallel execution requires every delegation to originate from one coordinator turn, so direct handoffs would force the scanners to run sequentially.

**설명**

Emitting multiple delegation calls in one coordinator response is how parallelism is achieved, but that concerns how subagents are spawned, not how results are routed afterward. Result routing does not determine whether the scanners run concurrently.

**C.** Reject the change on the grounds that subagents run with isolated memory and only the coordinator can perform the serialization needed to move findings between them.

**설명**

While subagents do have isolated context, there is no special serialization capability unique to the coordinator; findings are passed as text in prompts or messages either way. The real reason to route through the hub is observability and controlled information flow, not a technical serialization barrier.

**D(정답).** Keep routing all findings through the coordinator so every exchange stays observable, failures are handled in one place, and it decides what each downstream subagent receives.

**설명**

This is correct because hub-and-spoke routing is the recommended design for exactly these three properties: the coordinator sees all inter-agent traffic, applies one consistent error-handling and recovery policy, and curates the exact context passed to each subagent. Direct peer handoffs, even where technically possible, fragment the audit trail and scatter recovery logic across agents.

### 전반적인 설명

Multi-agent systems built on the Claude Agent SDK typically follow a hub-and-spoke topology: a coordinator decomposes the task, delegates work by spawning subagents through the Agent tool, and aggregates results. Routing everything through the hub is a deliberate design choice, not a hard technical limitation: Claude Code does document mechanisms for direct communication between named agents, such as SendMessage and sibling rosters. The question is whether direct handoffs serve this pipeline, and here they do not. The extra hop through the coordinator buys three things that matter in a CI pipeline running unattended: observability (every result and error passes through one point, so a failed security scan is visible rather than silently absorbed by a peer), uniform error handling (the coordinator can retry, substitute, or proceed with partial results using one consistent policy), and controlled information flow (the coordinator decides exactly what each downstream agent's prompt contains, which matters because subagents start in isolated context and see only what is explicitly passed to them).

The mental model to hold is that a subagent is a fresh agent instance: it does not inherit the parent's conversation, and in ordinary delegation its final message returns to the agent that spawned it. Because context must be assembled explicitly for every delegation, the coordinator is the natural place to curate that context; scattering handoffs across peers via direct messaging fragments both the audit trail and the recovery logic. The distractors misattribute the benefit: central routing does not reduce token cost or latency (it adds a hop), there is no serialization capability exclusive to the coordinator (findings travel as text either way), and parallelism is determined by how Agent tool calls are emitted at spawn time, not by how results are returned afterward.

See Subagents in the SDK and Create custom subagents for how subagent context isolation, delegation, and inter-agent messaging work.

### 도메인

Agentic Architecture & Orchestration



## 질문 55

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A coordinator delegates style, security, and test-coverage reviews to three independent subagents, but each review starts only after the previous one finishes, tripling wall-clock time. What change makes the three reviews run concurrently?

**A.** Return each subagent's tool_result in its own separate user message the moment it completes, so the coordinator issues the next Task call sooner.

**설명**

The documentation explicitly warns against sending separate user messages for separate tool results; each tool_use block should get a matching tool_result, with all results grouped in one message. This approach also leaves spawning sequential, since each review is still requested in its own turn.

**B(정답).** Prompt the coordinator to request all three subagent Task calls in one response, execute them concurrently, and return the results together.

**설명**

Parallel subagent execution is expressed by emitting multiple subagent tool calls in a single coordinator response rather than one per turn. The harness then runs the independent reviews concurrently and returns all matching tool_result blocks together in the next message.

**C.** Run the coordinator on a lower-latency model so it issues each successive Task call with less delay between the three reviews.

**설명**

A faster coordinator shortens the gaps between turns but the reviews still execute one after another. The total time remains roughly the sum of the three reviews rather than the duration of the slowest one.

**D.** Buffer Task calls across successive coordinator turns in the harness, then dispatch the queued calls to all three subagents at once.

**설명**

The coordinator cannot produce its next turn until the previous tool call's result is returned, so there is never a queue of calls from separate turns to dispatch together. Sequential turns inherently force sequential spawning, which is the problem being fixed.

### 전반적인 설명

Parallel subagent spawning is a wire-format pattern: the coordinator emits multiple subagent tool_use blocks in a single assistant response with stop_reason: "tool_use". The runtime does not prescribe an execution order for those calls, so the harness is free to run them concurrently, which is safe here because the three reviews are independent and do not depend on each other's output. Concurrency then bounds latency by the slowest review instead of the sum of all three. In the current SDK the subagent tool is named Agent, with Task accepted as an alias, but the pattern is identical under either name.

The second half of the pattern is returning results correctly: every tool_use block must receive exactly one matching tool_result referencing its tool_use_id, and all of those result blocks belong together in the single next user message. Anthropic explicitly warns that splitting results across separate user messages is incorrect and effectively teaches the model away from issuing parallel calls, which is why returning each review's result in its own message would entrench the sequential behavior rather than cure it.

The distractors fail structurally. Buffering calls across turns is impossible because the coordinator blocks on each tool result before producing its next turn, so a cross-turn queue never accumulates. Speeding up the coordinator's model trims the handoff gaps but leaves the reviews strictly sequential. Only changing where the calls are emitted, from one call per turn to several calls per response, actually creates the concurrency.

See Parallel tool use for multiple tool_use blocks in one response and the grouped tool_result requirement, and Subagents in the SDK for how subagents run in parallel as isolated instances.

### 도메인

Agentic Architecture & Orchestration



