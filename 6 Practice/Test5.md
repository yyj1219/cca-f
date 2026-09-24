# Practice Test 5

## 질문 1

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : The agent scans legacy modules and flags "risky code" for engineers to review. Despite the prompt instruction "only flag genuinely risky code," flags are noisy and vary between runs on identical modules. What prompt change most improves accuracy?

**A.** Limit each run to fewer legacy modules so the agent can examine the remaining ones more thoroughly.

**설명**

The problem is an undefined decision boundary, not insufficient attention per module. Scanning less code with the same vague standard produces the same inconsistent judgments, just over a smaller surface.

**B.** Have the agent attach a self-rated confidence score to each flag so engineers can filter out the weak ones.

**설명**

Self-reported confidence is poorly calibrated, so filtering on it reorders the noise rather than removing it. Engineers still have to triage inconsistent findings, and the underlying judgment remains unanchored.

**C(정답).** Define explicit criteria naming the specific code conditions to flag and the patterns to leave unreported.

**설명**

Vague terms like "genuinely risky" get interpreted differently on every run. Naming the concrete conditions that qualify as flaggable, and the patterns that do not, gives the model an operable decision rule, which is what actually reduces noise and run-to-run variance.

**D.** Strengthen the instruction to say the agent must be absolutely certain before it ever reports a finding.

**설명**

Intensifying a subjective instruction adds emphasis without adding operational content. "Absolutely certain" is just as open to interpretation as "genuinely risky," so the inconsistency persists.

### 전반적인 설명

Instructions like "only flag genuinely risky code" fail because they carry no operational content: the model has nothing to test a candidate finding against, so it re-interprets the phrase on every run. The reliable fix is to convert the vague goal into explicit, checkable criteria, for example "flag a function only if it dereferences a value that can be null on a reachable path" alongside a matching skip list such as "do not flag stylistic duplication or commented-out code." This turns a vibe into a rubric the model can apply the same way every time, which is why explicit criteria consistently outperform stronger adjectives.

Anthropic's guidance reflects this: Claude responds best to clear, explicit instructions with precise output constraints rather than intent it must infer, and effective prompt work starts from specific, measurable success criteria rather than subjective wording. See Claude prompting best practices and Define success criteria.

The alternatives each miss the root cause. Escalating to "absolutely certain" swaps one subjective threshold for another; the model still has no rule to apply. Self-rated confidence scores are poorly calibrated, so sorting or filtering by them shuffles noisy findings instead of eliminating them. And shrinking the scan scope assumes the errors come from attention limits, when they actually come from an undefined decision boundary; the same faulty judgment applied to fewer modules yields the same inconsistency.

### 도메인

Prompt Engineering & Structured Output

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

## 질문 3

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

## 질문 4

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The synthesis subagent frequently needs quick single-fact checks while writing, but its role includes no search tools. A teammate proposes granting it the web-search agent's full eight-tool search set. What is the better design?

**A.** Delegate every individual fact check through the coordinator to the web-search agent as a separate task.

**설명**

This is incorrect because it turns a high-frequency, simple lookup into a full delegation round trip each time. The recommended pattern reserves coordinator routing for complex verifications and handles frequent simple needs with a limited cross-role tool.

**B.** Grant the full eight-tool search set, adding system prompt rules restricting its use to quick fact checks only.

**설명**

This is incorrect because prompt instructions are probabilistic guidance layered over an inventory problem. Tools outside an agent's specialization tend to be misused precisely because they are available, and eight extra tools increase selection complexity for every decision the agent makes.

**C(정답).** Give the synthesis agent a single scoped verify_fact tool and route complex verifications through the coordinator.

**설명**

This is correct because it satisfies the high-frequency need with one purpose-built cross-role tool while keeping the synthesis agent's inventory small. Selection reliability stays high, and rare complex verifications still flow through the coordinator to the specialist.

**D.** Merge the synthesis and web-search agents into a single agent so all the needed tools live in one place.

**설명**

This is incorrect because merging two specializations produces one agent with a larger combined tool set and a broader role, which is exactly the condition that degrades tool selection. It abandons the scoping that made each agent reliable.

### 전반적인 설명

The size of an agent's tool inventory is an architectural control on its reliability. Every tool definition an agent carries adds to the decision space it must navigate on each turn, and selection accuracy drops as that space grows; Anthropic's documentation notes that the ability to choose correctly degrades once too many tools are exposed at once, which is why techniques like the tool search tool exist to load only the few tools a request actually needs. The mental model is a budget: an agent chooses well among a handful of role-relevant tools and poorly among a sprawling catalog, and tools outside its specialization invite misuse simply by being present.

The tension in this situation is that strict role scoping collides with a real cross-role need. The designed compromise is a limited cross-role utility: a single, narrowly scoped tool such as verify_fact that covers the frequent simple case, while complex verification work continues to route through the coordinator to the web-search specialist. The synthesis agent's inventory grows by one constrained tool rather than eight general ones, so its selection behavior barely changes.

The alternatives each break something. Importing the entire search toolset and policing it with prompt rules asks probabilistic instructions to compensate for a structural problem, and the misuse pattern typically persists. Forcing every quick fact check through a coordinator delegation preserves purity at the cost of latency and coordination overhead on the system's most frequent operation. Merging the two agents concentrates tools and responsibilities into one broader agent, recreating the oversized-catalog problem the specialization was built to avoid.

### 도메인

Tool Design & MCP Integration

## 질문 5

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : The agent occasionally runs Bash commands that modify files outside the project directory even though the system prompt forbids this. Which two changes guarantee the prohibited commands cannot execute? (Select two.)

**A.** Move the restriction into the project CLAUDE.md and mark it IMPORTANT so it loads into context at the start of every session.

**설명**

CLAUDE.md content is guidance the model reads, not an enforcement mechanism, so it shapes attempted behavior probabilistically. Emphasis markers raise a rule's priority relative to other instructions but cannot make compliance certain, and the documentation is explicit that prompt text and CLAUDE.md do not enforce tool access.

**B(정답).** Register a PreToolUse hook that inspects Bash tool input and denies commands targeting paths outside the project directory.

**설명**

A PreToolUse hook runs after the model constructs the tool parameters and before the tool call is processed, and it can deny the call outright. Because the hook is code executing in the agent's lifecycle rather than an instruction the model chooses to follow, the prohibited command can never run, which is a deterministic guarantee.

**C(정답).** Configure a permission deny rule for the prohibited Bash command patterns, enforced by Claude Code rather than by the model.

**설명**

Permission rules are enforced by the harness itself, not by the model's compliance, so a deny rule stops a matching Bash call regardless of what the model attempts. Deny rules are still evaluated even when other mechanisms would allow the call, making this a code-level guarantee rather than a probabilistic one.

**D.** Add few-shot examples to the system prompt demonstrating correct refusals of commands that reach outside the project directory.

**설명**

Few-shot examples improve the likelihood that the model follows the rule, but the mechanism remains probabilistic: the model can still emit a violating command under some conditions. Since the scenario already shows prompt instructions being violated, adding more prompt content does not provide the required guarantee.

### 전반적인 설명

The core distinction being tested is between instructions the model follows and code the harness executes. A system prompt, CLAUDE.md rule, or few-shot example can only influence what Claude attempts; the model samples its next action, so compliance is probabilistic, often above 90 percent but never 100. Enforcement mechanisms, by contrast, sit outside the model entirely: a PreToolUse hook intercepts a tool call after the parameters are generated and before anything executes, and can allow, deny, ask, or even modify the input. Permission rules work the same way, evaluated by Claude Code itself rather than left to the model's judgment. Anthropic's permissions documentation states this directly: permissions are enforced by Claude Code, not the model, and to actually revoke access you use permission rules, permission modes, or a PreToolUse hook, not prompt text.

The right mental model is layered defense. Prompt guidance reduces how often the agent even tries a prohibited action, which keeps the interaction smooth; hooks and permission rules are the hard boundary that catches the residual failures. When the consequence of a violation is real damage (writing outside the project, destructive shell commands, financial actions), the boundary must be deterministic. Note also the interaction between the two enforcement layers: hook decisions do not bypass permission rules, deny rules are still evaluated, and when multiple mechanisms apply the most restrictive outcome wins, so combining them only tightens the guarantee.

The two prompt-based options fail for the same underlying reason: they add tokens that compete for attention rather than adding a gate. The scenario itself demonstrates that prompt instructions are already being violated, so strengthening the instruction changes the failure rate, not the failure mode. See Hooks and Permissions for the enforcement mechanics.

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

## 질문 7

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : An engineer reviewing agent-generated boilerplate finds five issues: three are interdependent (a shared interface change plus two call sites that must change with it) and two are unrelated formatting problems. How should the feedback be delivered?

**A.** Start a fresh session for each issue so no fix is influenced by context accumulated while handling the others.

**설명**

A fresh session per issue discards the shared context the interdependent fixes rely on and forces repeated re-exploration of the codebase. Context accumulated during related fixes is an asset here, not contamination.

**B.** Send one issue per message in strict priority order so each fix stays small, isolated, and easy to verify before moving on.

**설명**

Strictly sequential feedback works for independent issues but breaks down for interacting ones. Fixing the interface change without seeing the dependent call-site fixes invites a solution that must be reworked when the related issues arrive.

**C.** Combine all five issues into a single message so the agent resolves everything in one pass and conserves turns.

**설명**

Bundling independent issues with an interdependent change set dilutes attention and makes it harder to verify which fix caused which change. Batching is justified by interaction between fixes, not by a desire to save turns.

**D(정답).** Describe the three interdependent fixes together in one detailed message, then address the unrelated issues in later turns.

**설명**

This matches the decision rule for iterative refinement: fixes that interact must be presented together so the agent can design one coherent change, while independent issues are handled sequentially so each iteration stays focused and easy to verify.

### 전반적인 설명

Iterative refinement with an agent has a simple dividing line: interdependent issues go in one detailed message; independent issues go sequentially. When fixes interact, such as an interface change that forces coordinated edits at its call sites, the agent needs to see the whole constraint set at once to produce a single coherent design. Delivered one at a time, each partial fix is made without knowledge of the constraints the next message will add, so early fixes get reworked or the pieces end up inconsistent.

Independent issues invert the tradeoff. Nothing about a formatting fix depends on anything else, so packing it into the same message as a multi-part change only dilutes attention across unrelated concerns and muddies verification. Handling such issues in separate turns keeps each iteration small, reviewable, and easy to confirm before moving on.

The distractors each over-apply one half of the rule. Batching everything treats a turn count as the cost to minimize, when the real cost is rework from incoherent changes and lost verifiability. Strictly sequential delivery is right for the two formatting fixes but wrong for the three that interact. Fresh sessions per issue misdiagnose useful shared context as contamination; session isolation is valuable when a session reviews its own output, not when related fixes need common understanding of the codebase. See Claude Code best practices for guidance on structuring feedback and iteration with an agentic workflow.

### 도메인

Claude Code Configuration & Workflows

## 질문 8

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : A long dispute-investigation session from yesterday analyzed a dozen orders. Overnight, a billing correction updated the records for two of those orders; nothing else changed. Which two actions correctly continue the investigation? (Select two.)

**A.** Resume the saved session as-is and let the agent notice the corrected records automatically the next time it touches those orders in the backend.

**설명**

Resuming performs no re-validation of prior tool results; the recorded order data re-enters context as if it were still current. The agent may never re-query those two orders and would keep reasoning from stale figures.

**B(정답).** After resuming, direct the agent to re-query only the two corrected orders and keep the remaining validated tool results as current context.

**설명**

Targeted re-query refreshes only the records that actually changed while preserving the bulk of the investigation's still-valid context. This avoids the cost of full re-exploration when most prior analysis remains accurate.

**C.** Start a new session seeded with a structured summary of yesterday's conclusions, then re-query the backend for every order in the dispute.

**설명**

Starting fresh with an injected summary is the right pattern when most prior tool results have gone stale, such as after a sweeping migration. Here only two records changed, so discarding the session re-pays the entire investigation cost and loses detailed evidence that is still valid.

**D(정답).** Resume the saved session and explicitly name the two corrected order records, since sessions store conversation history, not backend state.

**설명**

A saved session is a transcript of prompts, tool calls, tool results, and responses; resuming replays yesterday's evidence exactly as recorded. Because nothing re-validates old tool results on resume, the agent will not know two orders changed unless the update is stated explicitly, which lets it correct exactly the stale entries.

### 전반적인 설명

The mental model that decides this situation is what a session actually is. In the Claude Agent SDK, a session is a persisted conversation history: the prompts, tool calls, tool results, and responses, written to disk so work can be picked up later. The documentation is explicit that sessions persist the conversation, not the filesystem or backend state. Resuming is therefore a replay of what the agent saw, not a snapshot of what the world currently looks like. See Agent SDK sessions.

This has two practical consequences. First, nothing re-validates old tool results on resume: a lookup_order response captured yesterday re-enters context exactly as recorded, and the model treats it as current fact. Second, the decision between resuming and starting fresh turns on how much of that recorded evidence is still valid. When only a bounded, known set of records changed, the efficient move is to resume, explicitly name what changed, and direct the agent to re-fetch just those records; the rest of the investigation's context, including verified identity, root-cause reasoning, and unaffected order data, continues to earn its keep. Only when a sweeping change invalidates most stored tool results does the reliable move flip to a fresh session seeded with a structured summary.

The distractors fail on the same underlying mechanism. Starting a new session here discards a mostly valid investigation and forces the agent to rediscover everything for the sake of two records; it is the right tool for the wrong situation. Resuming as-is assumes an automatic staleness check that does not exist: the agent has no signal that two entries in its transcript no longer match the backend and may never re-touch them. The architect's job is to match the recovery strategy to the scope of the drift, and for a two-record correction that means informing the resumed session and re-analyzing only what changed.

### 도메인

Agentic Architecture & Orchestration

## 질문 9

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : During multi-turn testing, the agent loses track of details customers provided two turns earlier. Logs show each API request contains only the system prompt and the newest user message. What change restores conversational coherence?

**A(정답).** Include all prior user and assistant turns, along with tool results, in the messages array of every request.

**설명**

The Messages API is stateless, so Claude has no memory of earlier API calls; conversational continuity exists only if the application resends the accumulated history. Passing every prior turn, including assistant replies and tool results, is the designed mechanism for multi-turn coherence.

**B.** Reference the previous response's message ID in each new request so the API links the turns into one session.

**설명**

The Messages API has no session or message-ID linking mechanism; each POST to /v1/messages is fully independent. The only way earlier turns influence a response is by including them in the messages array of the current request.

**C.** Add cache_control breakpoints to earlier turns so the API retains the conversation server-side between calls.

**설명**

Prompt caching reduces cost and latency for repeated prompt prefixes, but it does not create server-side conversational state. A cached prefix still has to be sent in the request; caching is a performance optimization, not a memory mechanism.

**D.** Move key customer details into the system prompt at session start so they persist across subsequent calls.

**설명**

Nothing set at session start persists on the server; the system prompt only applies to requests that actually include it. Even if resent every time, a static system prompt cannot capture details that emerge turn by turn during the conversation.

### 전반적인 설명

The core mental model here is that Claude's Messages API is stateless: every call to POST /v1/messages is an independent request, and the model generates the next message based solely on what that request contains. There is no session ID, no server-side transcript, and no automatic memory of earlier calls. The illusion of an ongoing conversation is created entirely by the application layer, which accumulates the alternating user and assistant turns (including tool_result content) and resends the full history in the messages array on each request. When logs show only the newest user message being sent, the agent is not "forgetting"; it literally never received the earlier turns.

This design is deliberate: statelessness keeps the API simple and horizontally scalable, and it gives the application full control over what the model sees, enabling techniques like trimming verbose tool outputs, maintaining a persistent case-facts block, or injecting synthetic assistant messages. The cost of that control is that history management is your responsibility.

The common misconceptions here are worth internalizing. Prompt caching (cache_control) speeds up and discounts the processing of a repeated prefix, but the prefix must still be sent with each request; it stores no conversational state. There is no message-ID or session-linking parameter in the API, so referencing a prior response cannot reconstruct context. And a system prompt set "at session start" has no persistence either; it only affects requests that include it, and it cannot hold details that surface mid-conversation. See Working with Messages and the Messages API reference for how multi-turn requests are structured.

### 도메인

Context Management & Reliability

## 질문 10

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : Human support staff dismiss roughly a third of the agent's escalations as unnecessary, but case-by-case transcript review has not revealed why. What change makes the dismissal problem systematically analyzable?

**A.** Add a prompt instruction telling the agent to escalate only when genuinely necessary and to avoid borderline cases.

**설명**

This is incorrect because vague guidance like escalate only when necessary is subjective and produces inconsistent behavior. It attempts a fix before the team even knows which escalation triggers are the problem, so it cannot make the dismissal pattern analyzable.

**B.** Ask reviewing staff to leave free-text notes on each dismissed escalation and read them in a weekly retrospective.

**설명**

This is incorrect because free-text notes are unstructured and inconsistent across reviewers, making aggregation manual and unreliable. It captures human opinions about symptoms rather than the machine-recorded trigger, so systematic pattern analysis remains out of reach.

**C(정답).** Add a detected_pattern field recording the trigger for each escalation, then aggregate dismissal rates by pattern.

**설명**

This is correct because recording the request characteristic that triggered each escalation as a structured field turns each dismissal into a data point that can be grouped and counted. Aggregating dismissal rates per pattern reveals exactly which triggers produce unnecessary escalations, so prompt fixes can target the worst offenders instead of guessing.

**D.** Have the agent attach a self-rated confidence score to each escalation and suppress those below a fixed threshold.

**설명**

This is incorrect because self-rated confidence is poorly calibrated and suppression filters escalations rather than explaining them. Automatically discarding low-confidence escalations also risks hiding cases that genuinely need a human, which conflicts with the escalation goal.

### 전반적인 설명

The underlying design principle is that structured findings should carry not just the decision but the reason the decision fired. A detected_pattern field is an application-defined addition to your escalation schema: when the agent escalates, it records which request characteristic triggered the decision (for example, a refund amount near the policy cap, ambiguous order status, or explicit customer frustration). Because every escalation now carries a machine-readable trigger, dismissals stop being anecdotes and become rows you can group: if escalations triggered by one pattern are dismissed 70% of the time while another pattern is dismissed 5% of the time, you know precisely where the prompt criteria need tightening, and you can leave the accurate triggers alone.

This is the feedback-loop mental model: instrument the output first, then change behavior based on measured evidence. The alternatives all skip the instrumentation step. A vague instruction to escalate only when necessary is the classic vague-criteria anti-pattern; it changes behavior blindly and inconsistently. Free-text reviewer notes record human impressions rather than the agent's actual trigger, and unstructured prose resists aggregation at any real volume. Self-rated confidence thresholds filter escalations rather than diagnose them, and auto-suppressing low-confidence escalations quietly removes the safety valve the escalation path exists to provide.

Mechanically, adding such a field is straightforward when findings are already emitted through a JSON schema, whether via strict tool use or the API's structured output support: the field becomes one more required property in the schema, populated at generation time. See Structured outputs for how schemas guarantee the shape of such fields, keeping in mind that the schema guarantees structure while the field's diagnostic value comes from your downstream aggregation.

### 도메인

Prompt Engineering & Structured Output

## 질문 11

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The web search tools return Unix timestamps while the document analysis tools return ISO 8601 strings, and subagents misread the mix when correlating source dates. A hook will normalize them. Which lifecycle event should host the transformation?

**A.** Host the transformation in a PreToolUse hook, which fires before each tool executes, earlier in the agent lifecycle.

**설명**

PreToolUse sees only the outgoing tool call and its input arguments; the heterogeneous result data does not exist yet at that point. It is the right event for blocking or modifying calls, not for transforming what tools return.

**B(정답).** Host the transformation in a PostToolUse hook, which fires after each tool executes and before the model consumes the result.

**설명**

PostToolUse is the interception point for tool results: it fires after the tool executes and can transform the returned data before it is appended to context. Normalizing there means the model only ever sees one canonical date format, so misinterpretation cannot occur during reasoning.

**C.** Host the transformation in a SubagentStop hook, which fires when a subagent finishes its delegated work.

**설명**

SubagentStop fires only when a subagent completes, and by that point the subagent has already reasoned over the raw mixed formats on every iteration of its own loop. Placing the transformation there is too late to prevent misinterpretation during the investigation itself.

**D.** Host the transformation in a Stop hook, which fires when the agent is about to end its turn.

**설명**

Stop fires at the very end of a turn, after the model has already consumed every raw tool output during its reasoning. A transformation attached there arrives too late to prevent conclusions the agent already drew from misread timestamps.

### 전반적인 설명

The mental model for hooks is a timeline around each tool call: PreToolUse fires before execution and sees the outgoing call (tool name and input arguments), while PostToolUse fires after execution and sees the result the tool produced. Data normalization is inherently a result-side problem: the Unix timestamps and ISO 8601 strings only come into existence once the tool has run. A PostToolUse hook therefore sits at exactly the right point to convert every result into one canonical format before it is appended to the conversation, which means the model never encounters the inconsistency at all. This is deterministic code, not an instruction the model might skip, and it works even for third-party MCP servers whose output formats you cannot change.

Timing is why the later events fail here. An agent misinterprets mixed formats while it reasons, on every loop iteration where a raw tool result lands in context. SubagentStop and Stop fire after that reasoning is complete: by then a subagent may have already correlated two sources incorrectly because one date looked like an integer and another like a string. A normalization step attached to those events runs only after the damage is done. Placing a fix upstream of model consumption, rather than downstream of model output, is the general principle behind PostToolUse transformations such as date normalization, status-code translation, and trimming verbose fields.

See the Claude Code hooks reference and the Claude Agent SDK documentation for the full list of hook events and their firing points.

### 도메인

Agentic Architecture & Orchestration

## 질문 12

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline's post_review_comment MCP tool fails on pull requests opened from forks because the CI token lacks write access; the tool returns only "Operation failed," and the agent retries until the job times out. What should the tool return instead?

**A.** A successful result with empty content so the agent stops retrying and proceeds with the rest of the review.

**설명**

This is silent error suppression, a documented anti-pattern. The retries stop, but the agent now believes the comment was posted, so review feedback is dropped without anyone knowing and the underlying access problem is never surfaced or fixed.

**B(정답).** A permission-category error, isRetryable: false, and a message stating the CI token cannot write to fork pull requests.

**설명**

This is correct because a permission failure is non-retryable by nature: no number of retries will grant the token write access. Categorizing the error and flagging it as non-retryable stops the futile retry loop, and the descriptive message lets the agent surface an actionable explanation, such as reporting the issue in the job output, instead of guessing.

**C.** The git provider's raw HTTP 403 response body in full so that no diagnostic detail is lost in translation.

**설명**

Raw provider payloads are not the interface the agent needs; they mix internal detail with the actual signal and give no explicit guidance on retryability. The agent may still misinterpret the failure, and the response can expose internals that do not belong in tool results.

**D.** A transient-category error with isRetryable: true so the agent spaces retries with exponential backoff before giving up.

**설명**

This mislabels a permanent access problem as a temporary one. Backoff only helps when a later attempt can succeed; a token that lacks write access will fail every attempt, so this design still wastes pipeline time before ultimately failing.

### 전반적인 설명

The core problem with a uniform Operation failed response is that it collapses several failure modes that demand different recovery behaviors into a single indistinguishable signal. A transient outage should be retried; bad input should be corrected; a permission failure, like a CI token that cannot write to fork pull requests, should never be retried, because the condition will not change between attempts. When the tool hides the category, the agent falls back on guessing, which is exactly what produces retry loops that burn the job's time budget.

Anthropic's guidance is to make tool errors informative and actionable: say what went wrong and what the model should do next, rather than returning a bare failure string. Structured metadata such as an error category and an isRetryable flag turns recovery into a decision the agent can make deterministically from the result itself. For a permission error, isRetryable: false immediately ends the retry loop, and the human-readable message gives the agent something useful to do instead: annotate the pull request run output so a maintainer can fix the token scope. The mental model is that the tool result is the only channel through which the agent perceives the outside world; whatever nuance the tool omits, the agent cannot act on.

The alternatives each break this contract in a different way. Marking the failure transient with backoff just slows down a loop that can never succeed. Returning an empty success suppresses the error entirely, so feedback silently disappears and the misconfiguration goes undetected. Dumping the raw HTTP 403 body preserves detail but delivers it in a form with no explicit retryability signal, leaving interpretation to chance. See Handle tool calls and errors for the documented pattern of returning descriptive, recovery-oriented error content with is_error: true.

### 도메인

Tool Design & MCP Integration

## 질문 13

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : The agent renames legacy database columns to your new API field scheme. Its prompt contains a prose casing rule plus several correctly formatted sample field names, yet acronyms and mixed-case legacy names still convert inconsistently. Which prompt change is most effective?

**A.** Instruct the agent to pause and ask a clarifying question whenever it encounters a name it considers ambiguous.

**설명**

Incorrect. The interview pattern is valuable for surfacing unknown design considerations, but the desired mapping here is already fully known to the team. Turning a deterministic transformation into a series of clarification round-trips adds latency without teaching the pattern.

**B(정답).** Replace the output-only samples with two or three input/output pairs covering the acronym and mixed-case names.

**설명**

Correct. Output-only samples show what good results look like but not how a tricky input maps to its result. Paired input/output examples that include the exact ambiguous forms demonstrate the transformation itself, which is what the model needs to apply the rule consistently.

**C.** Extend the prose rule with an exhaustive written enumeration of every casing edge case in the legacy schema.

**설명**

Incorrect. The scenario already shows that prose descriptions of the rule are being interpreted inconsistently; making the prose longer multiplies the text the model must interpret without removing the ambiguity. Concrete demonstrations communicate transformations more reliably than expanded natural-language rules.

**D.** Add IMPORTANT emphasis to the casing rule and instruct the agent to apply the naming convention strictly to every column.

**설명**

Incorrect. Emphasis raises the priority of an instruction relative to other instructions, but it does not resolve what the instruction means for inputs the prose never disambiguates. The failures come from an underspecified rule, not from the rule being ignored.

### 전반적인 설명

When a transformation is described in prose and the results come out inconsistent, the underlying problem is usually that natural language underspecifies the mapping: the model must guess how the rule applies to inputs the description never explicitly covers, and it guesses differently each time. Concrete input/output examples close that gap because they demonstrate the transformation directly. Two or three pairs are typically enough, provided they are chosen deliberately: the highest-value examples are the ones covering exactly the cases that currently fail, such as acronyms and mixed-case identifiers in a renaming task.

The distinction that decides this question is between samples of desired output and paired demonstrations of the mapping. A list of correctly formatted field names tells the model what the destination looks like but nothing about how a given legacy name travels there; an Input: HTTP_url → Output: httpUrl pair encodes the decision itself. This is why few-shot pairs outperform both longer prose (more text to interpret, same ambiguity) and emphasis markers like IMPORTANT (which raise an instruction's priority but cannot disambiguate it). The interview pattern, where Claude asks clarifying questions, belongs to a different problem: surfacing design considerations the developer has not yet decided, not executing a mapping the team already knows.

See Use examples (multishot prompting) and the broader Prompt engineering overview for guidance on selecting examples that cover edge cases rather than only typical inputs.

### 도메인

Claude Code Configuration & Workflows

## 질문 14

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline's dependency-check tool returns is_error: true whenever a vulnerability lookup succeeds but matches nothing. Claude retries these clean lookups and posts "security check unavailable" comments on pull requests. What change fixes the tool's interface?

**A(정답).** Return zero-match lookups as normal successful results stating no vulnerabilities were found, reserving is_error: true for execution failures such as timeouts.

**설명**

A lookup that completes and matches nothing is a valid, informative outcome, not a failure, so it belongs in a normal tool result. Reserving is_error: true for actual execution failures gives the model an accurate signal, so it stops retrying clean lookups and stops reporting the check as unavailable.

**B.** Add a review prompt instruction telling Claude to treat this tool's error results as clean outcomes whenever the message mentions no vulnerabilities.

**설명**

This papers over a broken interface with a probabilistic prompt patch while the tool keeps sending a contradictory signal. It also teaches the model to reinterpret error flags by message text, which is brittle and undermines error handling for genuine failures from the same tool.

**C.** Have the tool retry each zero-match lookup internally with backoff before returning the error, so transient database issues resolve without Claude's involvement.

**설명**

This misdiagnoses the outcome: a query that succeeded with no matches is not a transient failure, so retrying it wastes time and still returns the same misleading error. Internal retry with backoff is appropriate for timeouts and service errors, not for valid empty results.

**D.** Remove the is_error flag from every response, including genuine timeouts, so tool problems never interrupt the automated review.

**설명**

This is silent suppression: real access failures would now look identical to clean scans, so a timed-out vulnerability check would read as a pull request with no findings. That converts visible tool problems into false negatives, which is worse for a security-relevant review gate.

### 전반적인 설명

The is_error field on a client tool_result describes the execution channel, not the content of the data. Anthropic's guidance is to set is_error: true only when execution actually failed (network problems, API failures, timeouts); a query that ran to completion and simply found nothing is a successful result, and returning it as a normal result, even with empty or minimal content, is the documented shape for that outcome. The mental model is that the flag answers one question for the model: can I trust this result as a finding, or did the attempt to get it break? A zero-match vulnerability lookup is a finding: the dependencies are clean.

Conflating the two directions produces symmetric failure modes. Marking valid empty results as errors, as this tool does, makes the model treat clean outcomes as broken tooling: it retries lookups that will never return anything different and reports the check as unavailable when it in fact passed. Stripping error signaling entirely inverts the problem: genuine access failures masquerade as clean scans, which for a security check means silent false negatives on merged pull requests. Prompt-level instructions to reinterpret the mislabeled errors leave the interface lying and depend on fragile message-text matching, and internal retries assume a transient fault where none exists.

The design rule that follows: encode outcome semantics at the tool interface, where they are deterministic, rather than asking the model to compensate downstream. When a result genuinely is an error, pair the flag with an actionable message (for example, a retry hint for rate limits) so the agent can choose between retrying, adapting, or surfacing the failure. See Handle tool calls for the is_error semantics and error-message guidance, and Web search tool for how Anthropic's own tools represent no-match successes differently from execution errors.

### 도메인

Context Management & Reliability

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

## 질문 16

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : A subagent asked to find all callers of a deprecated helper gets zero Grep matches. It currently retries the identical search several times, then reports a generic search failure to the coordinator. What is the correct behavior?

**A(정답).** Report the zero-match outcome as a successful result stating that no callers were found.

**설명**

A Grep search that executes successfully and matches nothing is a valid empty result, not a failure. The subagent should report it as a legitimate finding, since the absence of callers is exactly the answer the coordinator needs for a deprecation task.

**B.** Pass the raw zero-match output upward flagged with isError so the coordinator can decide how to proceed.

**설명**

Setting an error flag on a successful query misinforms the coordinator, which will treat a correct finding as a breakdown and attempt recovery. The error channel should be used only when the tool actually failed to execute.

**C.** Return the empty result to the coordinator with a structured error marked transient and isRetryable true.

**설명**

Labeling a valid empty result as a transient, retryable error invites the coordinator to rerun a search that already produced the correct answer. The transient category is reserved for access failures like timeouts and service unavailability.

**D.** Retry locally with progressively broader Grep patterns and backoff, then report failure if still empty.

**설명**

Local retry with backoff is the right response to transient access failures such as timeouts, not to a search that completed successfully. Broadening the pattern also changes the question being asked, so the result would no longer answer the coordinator's original request.

### 전반적인 설명

Reliable error propagation depends on a distinction that trips up many designs: an access failure (a timeout, a service outage, a permission block) is fundamentally different from a valid empty result (a query that ran to completion and simply matched nothing). The first is a problem to recover from; the second is an answer. For a deprecation task, zero callers is arguably the best possible finding, since it means the helper can be removed. A subagent that retries a successful empty search wastes tool-call budget on a non-problem, and one that reports it as a failure corrupts the coordinator's picture of the codebase.

This matters more in a subagent architecture because of context isolation: a subagent runs in its own conversation, and only its final message reaches the coordinator. The coordinator never sees the internal Grep calls or retries, so whatever the subagent chooses to report becomes the coordinator's entire view of what happened. Misclassifying an empty result as an error in that final message can cascade into pointless reruns or an unnecessary escalation.

The sound division of labor is: handle genuinely transient failures locally with retry and backoff; when a failure cannot be resolved, propagate structured context (failure type, what was attempted, partial results); and when a query succeeds with no matches, report exactly that as a successful outcome. Broadening the search pattern, marking the result isError, or categorizing it as transient all treat a correct answer as a malfunction. See the Claude Agent SDK subagents documentation for how subagent results flow back to the parent agent.

### 도메인

Tool Design & MCP Integration

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

## 질문 18

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : To retrieve return and billing policies, the agent was given a generic fetch_url tool. Logs show it fetching internal admin pages and unrelated third-party sites, producing inconsistent policy answers. Which redesign most reliably prevents this misuse?

**A.** Add system prompt instructions stating that fetch_url must only retrieve pages from the policy knowledge base.

**설명**

Prompt instructions are probabilistic guidance, not enforcement. As long as the tool can accept any URL, the agent retains the capability to misuse it, and the misuse will recur under some conditions.

**B.** Add harness-level filtering that blocks fetch_url calls to known admin and third-party domains.

**설명**

A blocklist is reactive: it only stops destinations someone has already anticipated, and new unrelated sites will slip through. It also leaves the agent attempting calls that get rejected instead of removing the temptation from the interface.

**C.** Expand fetch_url's description with explicit guidance on which URLs it should and should not retrieve.

**설명**

Better descriptions improve tool selection when the model must choose among tools, but they do not restrict what a general-purpose tool can do once called. The tool still accepts arbitrary URLs, so misuse remains possible.

**D(정답).** Replace fetch_url with a get_policy_article tool that accepts only knowledge base article identifiers.

**설명**

This is correct because constraining the tool's interface makes the undesired behavior impossible rather than merely discouraged. A tool that accepts only policy article identifiers cannot fetch admin pages or third-party sites, fixing the root cause at the capability level.

### 전반적인 설명

The underlying principle here is constraining capability at the tool interface rather than trying to steer behavior after the fact. An agent's effective permissions are defined by what its tools can accept, not by what its prompt says it should do. A generic fetch_url tool grants the ability to retrieve anything on the network, so the agent will eventually exercise that ability in ways the designer never intended; the fact that it is available is precisely why it gets misused. Replacing the generic tool with a purpose-built one, such as get_policy_article keyed to knowledge base identifiers, applies the principle of least privilege: the invalid action is no longer expressible through the interface, so no amount of model variance can produce it.

This is why the alternatives fall short in characteristic ways. Prompt instructions and richer descriptions are probabilistic controls: they shift the odds but leave the capability intact, which is unacceptable when consistency of policy answers directly affects first-contact resolution. A domain blocklist is enumerative: it must anticipate every bad destination in advance, and anything not yet listed passes through. The constrained-tool pattern inverts the problem, defining the small set of valid inputs instead of the unbounded set of invalid ones. The same pattern appears throughout well-designed agent systems, for example replacing open-ended query tools with parameterized lookups.

See Anthropic's guidance on Writing tools for agents and the MCP tools documentation for how narrow, well-scoped tool contracts improve agent reliability.

### 도메인

Tool Design & MCP Integration

## 질문 19

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : Late in a multi-hour research run, the coordinator begins citing generic industry figures instead of the specific statistics its subagents returned earlier, and its answers grow inconsistent. Each subagent currently returns its full raw output into the coordinator's context. Which change addresses this?

**A.** Add a system prompt instruction telling the coordinator to cite only specific figures from the session history.

**설명**

An instruction cannot restore attention to details buried in a saturated context. The coordinator is drifting to typical patterns because the signal has degraded, and telling it to behave otherwise does not change what its context can reliably surface.

**B(정답).** Have subagents return distilled structured summaries so the coordinator retains only coordination-level context.

**설명**

This is correct because the degradation stems from the coordinator's context filling with verbose raw subagent output, which is the documented cause of context rot. Returning distilled summaries keeps the coordinator's window focused on coordination, so the specific findings it needs remain a reliable signal.

**C.** Increase max_tokens on each coordinator request so it can restate the earlier statistics in every response.

**설명**

The max_tokens parameter governs output length, not how well the model recalls information from a bloated input context. Restating statistics in responses also adds more bulk to the accumulating history, worsening the problem.

**D.** Switch the coordinator to a model with a larger context window while continuing to accumulate raw outputs.

**설명**

A larger window only delays the same degradation at higher cost, since accuracy and recall still decline as token count grows. It does not fix the underlying problem of unfiltered raw output crowding the coordinator's context.

### 전반적인 설명

The failure described here is context rot: as the token count in a session grows, a model's accuracy and recall over that context degrade, and it starts answering from general priors ("typical industry figures") rather than the specific facts it was actually given. The key design insight is that more context is not automatically better; what matters is curating what occupies the window.

In a coordinator-subagent architecture, the coordinator's context should hold coordination-level state: which tasks were delegated, what each subagent concluded, and what remains open. When subagents dump full raw output (page content, reasoning traces, dozens of low-relevance fields) into the coordinator, that window fills with material disproportionate to its relevance, and the precise statistics the coordinator later needs become a weak signal in a noisy input. Requiring subagents to return distilled, structured summaries fixes this at the source: verbose exploration stays isolated in each subagent's own context, and only the essential findings cross the boundary.

The alternatives fail for characteristic reasons. A larger context window postpones the same rot at higher cost, because degradation is a function of accumulated tokens, not a hard cutoff. A prompt instruction to cite specific figures asks for a behavior the degraded context can no longer support; the model cannot reliably attend to details that are drowned out. And max_tokens controls response length only; it has no effect on recall from the input, and longer responses simply add more bulk to the growing history.

See Context windows and Effective context engineering for AI agents for the underlying guidance on curating context in agentic systems.

### 도메인

Context Management & Reliability

## 질문 20

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : Escalation handoffs currently arrive as one long prose paragraph in which refund amounts, the dispute narrative, and the actions already attempted are interleaved, and receiving human agents report misreading amounts and repeating steps. How should the handoff output be formatted?

**A.** Emit the complete handoff as one strict JSON object so every field is parsed consistently by any consumer.

**설명**

The consumers of this handoff are human agents reading it directly, and a raw JSON blob is harder for people to scan than well-rendered mixed formats. Strict JSON is valuable for machine-to-machine handoffs, but it does not address human readability of mixed content types.

**B.** Instruct the agent to remove all formatting so the handoff reads as continuous plain natural language.

**설명**

This preserves the current failure mode: prose is exactly the format in which amounts get misread and completed steps get missed. Anthropic's formatting guidance does not recommend banning structure everywhere; lists and tables remain appropriate when items are genuinely discrete.

**C.** Present the entire handoff as one uniform table so every fact occupies a labeled row for quick scanning.

**설명**

Forcing all content into a single table flattens narrative context into cramped cells, which distorts the dispute background that needs explanatory prose. Uniform formatting is the root problem here; swapping one uniform format for another does not fix it.

**D(정답).** Render refund figures as a table, the dispute background as prose, and the attempted actions as a structured list.

**설명**

This is correct because content types have natural renderings: numeric financial data is most accurately scanned in a table, narrative context reads best as prose, and discrete completed actions belong in a list. Matching the format to the content type prevents amounts from being buried in sentences and steps from being overlooked.

### 전반적인 설명

The failure described here is a uniform-format synthesis problem: heterogeneous content (numbers, narrative, and discrete actions) was flattened into a single rendering, and each content type suffered in a different way. Amounts embedded mid-sentence are easy to misread; a sequence of attempted actions written as prose is easy to skip, so human agents repeat work. The reliable design principle is to render by content type: financial data as tables, explanatory background as prose, and technical or procedural findings as structured lists.

This works because format is not decoration; it is how a reader locates and verifies information. A table gives every figure a labeled position, so a $89.99 refund cannot hide inside a paragraph. A list makes each attempted action a discrete, checkable item. Prose remains the right vehicle for the causal story of the dispute, where relationships between events matter more than scannability. Anthropic's prompting guidance supports this: rather than assuming the model will infer the right rendering, you should explicitly specify the desired output format, use lists when items are discrete or order matters, and match format to purpose. Notably, Anthropic's own formatting guidance does not endorse stripping structure everywhere; even its minimize-markdown examples still permit lists for genuinely discrete items.

The uniform alternatives all fail in predictable ways. One giant table forces narrative into cells where causal context is lost. A raw JSON object optimizes for machine parsing when the stated consumer is a human agent without transcript access, who needs a readable, self-contained summary. Plain unformatted prose simply re-creates the reported failure. See Prompt templates and variables for Anthropic's guidance on explicitly controlling output format, and Increase output consistency for defining output formats precisely.

### 도메인

Context Management & Reliability

## 질문 21

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : The coordinator investigates a billing dispute using several tools, then delegates response drafting to a subagent, passing all findings as one prose paragraph mixing amounts, dates, and order numbers. Drafts frequently attribute charges to the wrong orders. What should you change?

**A.** Grant the drafting subagent the lookup_order tool and instruct it to re-fetch order details rather than use the paragraph.

**설명**

Re-fetching duplicates work the coordinator already completed and adds latency and token cost to every delegation. It also does not fix the handoff design; any findings that still arrive as blended prose remain vulnerable to misattribution.

**B(정답).** Restructure the handoff so each finding is passed as structured data pairing every value with its order ID and source tool.

**설명**

This is correct because prose that blends values from multiple tools loses the association between each fact and its metadata. A structured format that explicitly pairs each amount and date with its order ID and originating tool preserves those associations, so the subagent cannot easily cross-wire them.

**C.** Add a system prompt instruction telling the drafting subagent to verify each amount's attribution before writing the draft.

**설명**

A verification instruction is probabilistic guidance layered on top of an ambiguous input. If the paragraph itself does not preserve which amount belongs to which order, the subagent has no reliable basis for verification, so errors persist.

**D.** Condense the coordinator's paragraph to a shorter summary containing only the disputed amounts before delegating the draft.

**설명**

Summarizing removes context rather than organizing it, and compression tends to strip exactly the identifying details, such as order numbers and dates, that the draft needs. The problem is the loss of value-to-metadata associations, not the volume of the handoff.

### 전반적인 설명

In the Claude Agent SDK, a subagent starts with an isolated context: it sees only what the coordinator puts in its delegation prompt, and its intermediate work never mixes with the parent's history. That makes the handoff prompt the single channel carrying the investigation forward, so how findings are formatted in that prompt determines what the subagent can reliably do with them. A prose paragraph that interleaves amounts, dates, and order numbers from several tools forces the model to reconstruct which value belongs to which entity from sentence structure alone; under that ambiguity, cross-attribution errors are predictable.

The documented practice is to use structured data formats that separate content from metadata when passing context between agents: each finding travels as a unit that explicitly binds the value to its order ID, source tool, and any relevant dates. The subagent then never has to infer associations, because they are stated. This is the same provenance discipline that multi-agent research systems use when passing claim-to-source mappings into synthesis.

The alternatives each miss the root cause. Re-fetching via lookup_order pays twice for data the coordinator already holds and leaves the handoff format broken. A verify-before-drafting instruction is probabilistic prompt guidance applied to an input that lacks the information needed for verification. Summarizing shrinks the paragraph but compression typically discards identifying metadata first, making misattribution more likely, not less. See Subagents in the SDK for how subagent context isolation works and why everything a subagent needs must be included in its prompt.

### 도메인

Agentic Architecture & Orchestration

## 질문 22

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : A report-generation skill's SKILL.md declares allowed-tools: Write. Files are written without prompts on the invoking turn, but after the user's next message, Write calls prompt again. How should the team handle pre-approval on later turns?

**A.** Rewrite the allowed-tools field as a YAML list rather than a plain string, which makes the grant persist across subsequent turns.

**설명**

This is incorrect. The allowed-tools field accepts a space-separated string, a comma-separated string, or a YAML list, and all forms behave identically. No syntax makes the grant outlive the invoking turn; the turn scoping is inherent to the mechanism.

**B(정답).** Re-invoke the skill on each turn that writes report files, since the allowed-tools grant clears when the user sends the next message.

**설명**

This is correct. The pre-approval granted by allowed-tools applies only to the turn in which the skill runs; when the user sends the next message, the grant clears, so Write reverts to its normal permission behavior. Invoking the skill again re-applies the grant for that new turn.

**C.** Approve each Write prompt manually, since Write requires interactive confirmation on every call and cannot be pre-approved through frontmatter.

**설명**

This is incorrect. Write does require permission by default, but allowed-tools in skill frontmatter is exactly the mechanism that pre-approves it, which is why no prompts appeared on the invoking turn. The scenario itself demonstrates that pre-approval worked.

**D.** Keep the skill's instructions loaded in the conversation after execution so the permission grant stays active on follow-up turns.

**설명**

This is incorrect. Skill instructions can remain in the conversation context after the invoking turn, yet the permission grant still clears when the user sends the next message. The grant's lifetime is tied to the turn, not to whether the instructions are still in context.

### 전반적인 설명

The allowed-tools field in SKILL.md frontmatter is a turn-scoped pre-approval grant: it lets Claude use the listed tools without asking permission during the turn that invokes the skill, and nothing longer. When the user sends the next message, the grant clears, even though the skill's instructions may still be sitting in context. Invoking the skill again re-applies the grant for that new turn. This design keeps the elevated permission tightly bound to the moment the skill's workflow is actually running, rather than leaving a standing exemption in the session.

It also helps to keep the mental model straight about what allowed-tools is and is not. It is not a restriction: tools you leave off the list remain callable under the session's normal permission settings, and it does not override deny or ask rules, which take precedence. If you need to remove tools while a skill is active, disallowed-tools is the field for that, and its restriction likewise clears on the next user message. Tools like Read, Grep, and Glob do not require permission by default, so listing them changes little; the grant matters most for tools like Write, Edit, and Bash that normally prompt.

The distractors each misdirect the fix: Write can absolutely be pre-approved (the prompt-free first turn proves it), so falling back to manual approval gives up a working mechanism; the accepted syntaxes for allowed-tools (space-separated, comma-separated, or YAML list) are functionally equivalent, so switching forms changes nothing; and the grant's expiry is independent of whether the skill's instructions remain loaded, so keeping them in context does not extend it. See the Claude Code Skills documentation and the tools reference for the frontmatter behavior and which tools require permission.

### 도메인

Claude Code Configuration & Workflows

## 질문 23

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The coordinator session has just finished an extensive baseline analysis of gathered sources. You want to evaluate two competing synthesis strategies independently, each building on that same analysis without influencing the other. Which approach fits?

**A.** Spawn two synthesis subagents in one turn, relying on each to inherit the coordinator's conversation history.

**설명**

Subagents run in isolated contexts and do not inherit the parent conversation; anything they need must be passed explicitly in their prompts. Relying on inheritance would give both subagents an empty view of the analysis.

**B.** Run the first strategy, then instruct the model to disregard it entirely before running the second in the same session.

**설명**

A model cannot selectively forget content that remains in its context window; the first strategy's reasoning and outputs stay in the conversation history. The second strategy would inevitably be influenced by what came before, defeating the goal of independent evaluation.

**C(정답).** Fork the session at the analysis point, producing two independent branches that each inherit the baseline context.

**설명**

Forking is the designed mechanism for divergent exploration: both branches carry the full conversation history up to the branch point, then evolve separately. Each synthesis strategy starts from the complete analysis without re-running it or summarizing it by hand, and neither branch can contaminate the other.

**D.** Launch two new sessions and paste a hand-written recap of the analysis into each as the opening prompt.

**설명**

A manual recap is a lossy approximation of the analysis, and it must be prepared and injected twice. Forking transfers the complete baseline context into both branches without summarization loss or duplicated setup effort.

### 전반적인 설명

In the Claude Agent SDK, a session is the accumulated conversation history: the original prompt, tool calls, tool results, and responses. The SDK persists sessions to disk automatically, which is what makes them resumable and, crucially here, forkable. Forking a session creates an independent branch that shares everything up to the branch point and then diverges on its own. That is exactly the shape of an A/B exploration: one analysis phase, two divergent continuations that each inherit the copied history. The analysis never has to be recomputed or manually summarized, and neither branch sees the other's work. Forking is not free in token terms, though: each branch still resends its full inherited context on subsequent requests, so token costs apply to both branches, with prompt caching potentially reducing them.

The mental model worth holding is that context cannot be selectively edited within a running conversation. Asking the model to disregard the first strategy does not remove it from the context window; every token of that first exploration remains available and continues to shape generation. Similarly, subagents spawned via the Task tool run with isolated context; they inherit nothing from the coordinator's history, so relying on inheritance hands each synthesis worker an empty slate. Manually recapping the analysis into two fresh sessions works in principle but is a lossy summary prepared twice, discarding detail the fork would have preserved verbatim.

One boundary to keep in mind: sessions persist conversation history, not filesystem state. Forking gives both branches the same knowledge, but it does not snapshot or isolate files; parallel branches that edit code need worktrees for file isolation. For synthesis-strategy comparison, where the divergence is in reasoning rather than file edits, forking alone is sufficient. See Agent SDK Sessions for the continue, resume, and fork options.

### 도메인

Agentic Architecture & Orchestration

## 질문 24

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The team is adding a verification stage that checks the generated report for unsupported claims before publication. Which TWO design choices correctly account for how session context affects review quality? (Select TWO.)

**A(정답).** Restrict same-session self-review to mechanical checks such as formatting drift and incomplete citations.

**설명**

This is correct. A same-session review step inherits the reasoning behind the report and rarely overturns conclusions it already justified, so it should be limited to mechanical problems rather than substantive claim verification. This scoping reflects the core limitation of self-review.

**B(정답).** Run the verification in a second instance that receives the report and cited sources but not the generation reasoning.

**설명**

This is correct. An independent instance starts with no attachment to the decisions made during generation, so it evaluates each claim against the evidence on its own merits, which is why fresh-context review catches subtle issues that self-review rationalizes away.

**C.** Supply the independent reviewer with the generator's full reasoning trace so it can better detect flawed conclusions.

**설명**

This is incorrect. Importing the generator's reasoning trace reintroduces exactly the anchoring that independence was meant to remove; the reviewer is then primed to accept the same justifications rather than evaluate claims freshly.

**D.** Enable extended thinking during report generation to obtain the fresh-perspective benefit of a separate reviewer.

**설명**

This is incorrect. Extended thinking deepens deliberation within the same reasoning context, so the model is still reasoning from and toward its own conclusions. It does not provide the outside perspective that a context-free reviewer supplies.

### 전반적인 설명

The key mental model here is confirmation bias by context. A model reviewing output in the same session still holds every intermediate judgment it made while generating that output: which sources it trusted, which interpretations it chose, which claims it decided were adequately supported. Asking it to re-check the result is asking it to argue against reasoning that is literally still in its context window. In practice, same-session self-review is good at catching mechanical problems (missing sections, formatting drift, incomplete citations) but rarely reverses a substantive judgment, because the justification for that judgment is already part of what the model conditions on.

An independent review instance breaks this loop by construction. It receives the report and the source evidence, but none of the generation reasoning, so every claim must stand or fall on what the reviewer can verify itself. This mirrors human peer review, where the reviewer's value comes precisely from not having authored the rationalizations. It also explains why handing the reviewer the generator's full reasoning trace is counterproductive: the trace primes the reviewer with the same justifications, collapsing the independence that made the second instance useful. Similarly, extended thinking during generation only lets the model deliberate longer inside its own frame; more depth in the same context is not a substitute for a different context.

For this system, the practical design is to run verification as a separate instance (for example, a distinct subagent invocation) that sees the report and cited sources but not the synthesis agent's transcript. See Building Effective Agents and the Claude Agent SDK subagents documentation for guidance on isolating context between agents.

### 도메인

Prompt Engineering & Structured Output

## 질문 25

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The system extracts benchmark timings from PR descriptions into a schema. Authors write durations in diverse informal notations, and your enumerated normalization rules keep missing new variants, so the field returns null. What best handles notations you have not seen yet?

**A.** Add a regex post-processing step that parses timing strings from the raw text whenever the extraction returns null.

**설명**

This is incorrect because a regex fallback has the same enumeration problem as the rule list: it only matches patterns you anticipated. It patches symptoms downstream instead of improving the extraction itself, and it will silently miss the same novel notations.

**B(정답).** Add few-shot examples mapping informal timing phrases to normalized extractions, letting the model generalize to unseen notations.

**설명**

This is correct because few-shot examples demonstrate the extraction-and-normalization pattern rather than enumerating specific string forms. The model generalizes the demonstrated pattern to notations not shown in the examples, which is exactly the failure mode rule lists cannot cover.

**C.** Make the timing field required and non-nullable in the JSON schema so a null extraction is rejected as invalid.

**설명**

This is incorrect because constraining the schema does not teach the model how to interpret unfamiliar notations; it only removes the honest way to report failure. Forcing a non-null value when the model cannot parse the notation encourages fabricated timings, which is worse than a detectable null.

**D.** Expand the prompt's normalization rule list to exhaustively enumerate every timing notation observed across the pipeline's historical runs.

**설명**

This is incorrect because the failure is precisely that new variants keep appearing; a rule list can only cover notations already seen. Informal, author-written phrasing is too diverse for rule-based enumeration to stay ahead of, so nulls would continue on the next unseen variant.

### 전반적인 설명

This situation is a textbook case for few-shot prompting over rule enumeration. Prose rules and regexes are extensional: they cover exactly the string forms their author has already seen. Informal, human-written values (durations, quantities, dates written in free text) are effectively open-ended, so any enumerated list is permanently behind the data. Few-shot examples work differently: by showing a handful of varied phrases paired with their correctly normalized extractions, they demonstrate the judgment being applied, and the model generalizes that pattern to notations it has never seen rather than merely repeating the examples. This is why few-shot prompting is the documented remedy when detailed instructions alone keep producing inconsistent or empty extractions from documents with varied structures.

The mental model worth keeping: schemas and field constraints govern the shape of the output, not the model's ability to interpret the source. Making the field required and non-nullable does not add interpretive skill; it removes null as an honest answer and invites fabricated values, the same failure that makes nullable fields a best practice when information may be absent. Likewise, a regex fallback relocates the enumeration problem to post-processing without fixing extraction quality. Pair a small set of relevant, diverse examples (3-5 covering genuinely different notations) with any normalization conventions you do want stated (for example, always emit seconds as an integer), so the examples carry the generalization and the prompt pins the output convention.

See Use examples (multishot prompting) to guide Claude's behavior and Structured outputs for schema design and structured extraction guidance.

### 도메인

Prompt Engineering & Structured Output

## 질문 26

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : The MCP server's search_symbols tool is backed by a cross-repository code index, yet the agent nearly always picks built-in Grep instead, missing matches that live outside the current repository. What change most reliably corrects this selection behavior?

**A.** Set tool_choice to force search_symbols so every search request is guaranteed to route through the indexed backend instead of Grep.

**설명**

Forcing a specific tool via tool_choice compels that tool on the affected requests regardless of whether an indexed search is appropriate, which is far too blunt for an agent that also reads, edits, and runs commands. It is a mechanism for guaranteeing execution order, not for fixing routine tool selection.

**B(정답).** Rewrite the search_symbols description to state the concrete advantages of the index, such as cross-repository results, that Grep cannot provide.

**설명**

Tool descriptions are the primary mechanism the model uses to choose between tools, and agents tend to prefer built-in tools when an MCP tool's description does not distinguish it. Explicitly stating what the index returns that Grep cannot, and when to prefer it, gives the model the selection signal it currently lacks.

**C.** Remove Grep from the agent's toolset so that search_symbols becomes the only available option for locating code across repositories.

**설명**

Grep is still the right tool for content searches within the current repository, so removing it degrades the agent's core exploration workflow. This trades a selection problem for a capability gap instead of fixing the missing description signal.

**D.** Add a system prompt rule telling the agent to always call search_symbols first and to fall back to Grep only when the index finds nothing.

**설명**

Selection guidance placed in the system prompt is weaker than guidance in the tool description, because descriptions are what the model reads at selection time. A blanket call-order rule also forces indexed searches even when a local Grep is the better fit.

### 전반적인 설명

When an MCP tool and a built-in tool overlap in function, the model resolves the choice the same way it resolves every tool selection: by reading the tool descriptions. Anthropic's guidance is that the description is the single most important factor in tool performance; it should state what the tool does, when to use it (and when not to), and what it does or does not return. A search_symbols description that reads like a generic search tool gives the model no reason to prefer it over the familiar built-in Grep, so the agent defaults to Grep and silently loses cross-repository coverage.

The documented remedy is to strengthen the MCP tool's description with the concrete advantages built-in tools cannot provide: here, that the tool queries an index spanning multiple repositories, returns resolved symbol references rather than raw text matches, and should be preferred whenever the answer may live outside the current checkout. That boundary language turns an ambiguous overlap into a clean division of labor, which is exactly the situation Grep-style content search and index-backed search should occupy.

The alternatives each miss where selection actually happens. Deleting Grep removes a tool the agent legitimately needs for in-repo content searches. A system prompt ordering rule moves guidance away from the descriptions the model consults at selection time and imposes a rigid call order that is often wrong. Forcing the tool with tool_choice is designed to guarantee a specific call, such as a mandatory first extraction step, not to arbitrate everyday routing between overlapping tools. See How to implement tool use for the description best practices.

### 도메인

Tool Design & MCP Integration

## 질문 27

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The MCP tool query_code_index returns cross-repository symbol references with coverage data, yet the review agent keeps choosing Grep instead. Its current description is "Searches code." Which TWO changes most directly fix this? (Select TWO.)

**A(정답).** Highlight the concrete advantages built-in search cannot provide, such as cross-repository symbol resolution and coverage data.

**설명**

Agents tend to prefer familiar built-in tools when an MCP tool's description gives no reason to choose otherwise. Explicitly naming the unique data and capabilities that Grep cannot match gives the model a selection signal at exactly the moment it decides which tool to call.

**B.** Keep the tool description brief and state the routing guidance in the pipeline's system prompt, where the agent reads it every run.

**설명**

Tool descriptions are what the model consults at selection time, so moving the guidance elsewhere weakens the signal where it matters most. System prompt wording can also create unintended associations with tools rather than reliably steering selection.

**C(정답).** Document the tool's input formats and expected output, with example queries showing the searches it should handle.

**설명**

Descriptions are the primary mechanism the model uses to select tools, and a two-word description leaves the tool's territory undefined. Input formats, output contracts, and example queries make the tool's applicability concrete so the model can match review tasks to it reliably.

**D.** Remove Grep from the review agent's allowed tools so indexed search becomes the only way to locate code references.

**설명**

This forces the choice rather than fixing the selection signal, and it breaks legitimate uses of Grep such as scanning the checked-out pull request for local patterns. The tool is being underused because its description is empty, not because the alternative exists.

### 전반적인 설명

When a Claude Code agent has both built-in tools and MCP tools with overlapping purposes, it will often default to the built-in tool it knows well, especially when the MCP tool's description gives it nothing to weigh. The tool description is the primary selection mechanism: the model reads descriptions, not implementations, when deciding which tool fits a task. A description like "Searches code" is functionally indistinguishable from what Grep already does, so from the model's perspective there is no reason to prefer the indexed tool.

The fix is to make the description carry the decision. First, state the concrete advantages the MCP tool has over built-in alternatives: cross-repository symbol resolution and attached coverage data are capabilities Grep, which searches only the local checkout's file contents, cannot replicate. Second, document input formats, output shape, and example queries so the model can recognize which review tasks map onto the tool. Together these give the model both a reason to select the tool and a clear picture of when it applies.

Removing Grep entirely is a blunt architectural move that solves a description problem by deleting capability; the agent still needs local content search for tasks like scanning a pull request diff, and constraining inventory does not teach the model when the indexed tool is appropriate. Relocating the guidance to the system prompt moves the signal away from where selection happens; guidance embedded in the tool definition travels with the tool and is evaluated at the moment of choice, while system prompt wording can even create unintended tool associations.

See Anthropic's tool use implementation guidance for description best practices and MCP tools for how servers expose tool definitions to clients.

### 도메인

Tool Design & MCP Integration

## 질문 28

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Each finding includes a numeric confidence field that a merge gate compares against a 0.7 threshold. Outputs always validate against the JSON schema, but values arrive on mixed scales: 0.85 in one run, 85 in the next. What is the most effective fix?

**A(정답).** State the scale (decimal fraction, 0.0 to 1.0) in the prompt and the field description, and range-check values in code.

**설명**

A schema can enforce that confidence is a number, but it cannot convey which scale the number should use. An explicit normalization rule in the prompt and field description tells the model the expected convention, and a client-side range check catches any remaining outliers. This addresses the ambiguity at its source rather than patching symptoms.

**B.** Post-process each output by dividing any confidence value greater than 1 by 100 before the merge gate evaluates it.

**설명**

This heuristic patches the symptom without fixing the ambiguity: a genuine but miscalibrated value like 1.5, or a percentage like 0.9 meaning 90, would be silently mishandled. Repair logic downstream is fragile compared with telling the model the expected scale up front.

**C.** Change the field to a string enum of low, medium, and high so the model cannot emit values on the wrong scale.

**설명**

Replacing the numeric field with coarse labels destroys the granularity the merge gate's 0.7 threshold depends on, forcing a redesign of the downstream contract. The problem is an unstated scale convention, not the numeric type itself.

**D.** Add minimum: 0 and maximum: 1 constraints to the JSON schema so out-of-range values are rejected during generation.

**설명**

Structured outputs support only a subset of JSON Schema, and numerical constraints such as minimum and maximum are among the unsupported features; including them can produce a 400 error rather than enforce the range. The scale convention has to be communicated through prompt text and field descriptions instead.

### 전반적인 설명

This failure sits exactly on the boundary between what a schema guarantees and what it cannot. A JSON schema with a number type ensures every extraction carries a syntactically valid numeric confidence value, but which scale that number uses (a 0 to 1 fraction versus a 0 to 100 percentage) is a semantic convention the schema has no way to express. Anthropic's Structured outputs documentation is explicit that only a subset of JSON Schema is supported: numerical constraints such as minimum and maximum are unsupported, and unsupported features can produce a 400 error. So even the natural-seeming schema-level fix is unavailable; the convention must travel through the prompt and the field's description.

The right mental model is a layered one: constrained decoding pins down structure and types; prompt-level normalization rules pin down conventions (scales, units, date formats, canonical identifiers); and application code validates what neither layer can guarantee. The tool definition guidance makes the same point for format-sensitive parameters: detailed descriptions explaining meaning, behavior, and expected formats are what steer the model, and examples reinforce them. A statement like "confidence is a decimal fraction between 0.0 and 1.0, where 0.85 means 85% confident" gives the model an unambiguous convention to follow, and a cheap range check in the pipeline catches stragglers.

The alternatives each miss a layer. Divide-by-100 post-processing guesses at intent and silently corrupts edge cases. Swapping the number for a low/medium/high enum removes the ambiguity by removing the signal: the merge gate's numeric threshold no longer has anything to compare. Only stating the convention where the model can read it, backed by validation, fixes the mixed-scale behavior without breaking the downstream contract.

### 도메인

Prompt Engineering & Structured Output

## 질문 29

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : To assess a refactor of the harness's refund wrapper, Claude Code runs Grep with the pattern process_refund( to find call sites; the tool rejects the pattern and returns a diagnostic error. What is the correct next step?

**A.** Report the wrapper as unused, since the tool returned no matching lines for the pattern.

**설명**

The tool did not return zero matches; it rejected the pattern before any search ran. Treating a validation error as an empty result silently converts a failed search into a false conclusion about the codebase.

**B(정답).** Escape the parenthesis in the pattern, since Grep interprets input as ripgrep regex, then rerun the search.

**설명**

Grep is built on ripgrep and treats the pattern as a regular expression, so an unescaped opening parenthesis is an invalid group. Escaping the metacharacter (process_refund\() makes the pattern valid and finds the literal call sites, which is exactly the correction the diagnostic error enables.

**C.** Switch the search to Glob, which matches literal strings without applying any regex interpretation.

**설명**

Glob matches file names and paths against patterns; it does not search file contents at all, so it cannot locate call sites of a function. Swapping tools would abandon the content search rather than fix the pattern.

**D.** Rerun the identical search, since a rejected pattern indicates a transient tool failure that a retry will clear.

**설명**

A rejected pattern is a validation problem with the input, not a transient failure of the tool. Retrying the same malformed regex will fail identically; the fix is to correct the pattern, which is why the error includes ripgrep diagnostics.

### 전반적인 설명

Claude Code's Grep tool is built on ripgrep, which means every pattern is parsed as a ripgrep regular expression, not as a literal string and not as POSIX grep syntax. Characters like (, ), ., and * are regex metacharacters, so a search for a call expression such as process_refund( contains an unclosed group and is rejected outright. This is by design: when a pattern, glob, or type input is invalid, the tool returns an error carrying the ripgrep diagnostic, giving the model exactly the information it needs to self-correct, escape the metacharacter (process_refund\(), and retry. That feedback loop is the same principle behind structured tool errors generally: descriptive failures enable recovery, generic ones do not.

The distinction between a rejected pattern and an empty result matters. A validation error means the search never executed, so concluding the function is unused would fabricate a finding from a failure; and retrying the identical pattern treats a deterministic input problem as if it were a timeout. Switching to Glob misunderstands the tool boundary entirely: Glob matches file paths against name patterns, while only Grep inspects file contents, so a usage trace has no substitute for a corrected Grep pattern. See the Claude Code tools reference for the regex semantics and error behavior of the built-in search tools.

### 도메인

Tool Design & MCP Integration

## 질문 30

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : PDF summarization requests are consistently routed to the web-search subagent's summarize_page tool instead of the document agent's summarize_document tool. Both tools carry the description "Summarizes the provided content," and the coordinator's system prompt refers to every research source as a "page." Which TWO changes most directly fix the misrouting? (Select TWO.)

**A(정답).** Revise the coordinator's system prompt so it no longer calls every research source a "page."

**설명**

System prompt wording creates associations the model carries into tool selection. Calling every source a page nudges the coordinator toward the page-named tool even for local documents, so removing that biased vocabulary directly attacks one root cause of the misrouting.

**B(정답).** Expand each description with input formats and examples: a URL for summarize_page, a document ID for summarize_document.

**설명**

Descriptions are the primary mechanism the model uses to choose tools, and two identical one-liners give it nothing to choose on. Stating each tool's input format with concrete examples marks out distinct territory for each tool and resolves the overlap.

**C.** Enable strict tool use so every tool call is validated against the defined schemas and tool names before execution.

**설명**

Strict tool use guarantees that tool inputs conform to the schema and that the tool name is one of the available tools. It does not help the model decide which of two semantically overlapping tools is appropriate, so the misrouting would continue with well-formed but wrong calls.

**D.** Move summarize_document ahead of summarize_page in the tool catalog, since models weight tools listed earlier more heavily.

**설명**

Ordering in the tool list is not a dependable selection mechanism, and relying on position leaves the actual ambiguity in place. The model still sees two tools with identical descriptions and a prompt biased toward one of them.

### 전반적인 설명

Claude routes tool calls based on what it reads at selection time: the tool descriptions and the surrounding conversation, including the system prompt. When two tools share an identical description like "Summarizes the provided content," the model has no textual basis for distinguishing them, so selection degrades to whatever incidental signals remain. Here one of those signals is actively harmful: a system prompt that calls every source a "page" builds an association with the page-named tool, pulling even PDF requests toward summarize_page.

The fix therefore has two halves. First, remove the misleading prompt vocabulary; system prompt wording can create unintended associations with tools, and eliminating the bias stops the coordinator from being steered toward the wrong choice. Second, give the descriptions the differentiating detail Anthropic calls the single most important factor in tool performance: what each tool expects as input, with concrete examples (a URL versus a document ID), so each tool's territory is explicit. Anthropic's troubleshooting guidance identifies description ambiguity as the likely cause when Claude calls tool A while you wanted tool B, and the documented remedy is sharpening descriptions, not adding enforcement machinery.

Strict tool use solves a different problem: it guarantees schema-valid inputs and valid tool names, catching malformed calls, but a semantically wrong tool choice is still a perfectly valid call. Reordering the catalog gambles on positional effects that are not a documented or reliable selection mechanism; the ambiguity that causes the misrouting remains untouched. See How to implement tool use, Troubleshooting tool use, and Strict tool use.

### 도메인

Tool Design & MCP Integration

## 질문 31

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The report-generation subagent must change the phrase "preliminary findings" to "validated findings" in exactly one section of a report file, but that phrase appears in four sections. How should the Edit call be constructed?

**A.** Skip Edit and call Write with only the corrected paragraph, letting Write locate the matching section and merge it in place.

**설명**

Write is a full-file operation that creates a file or completely overwrites an existing one with the provided content. It performs no locating or merging, so calling it with only a paragraph would destroy the rest of the report.

**B.** Pass the phrase alone as the old_string, since Edit applies the replacement to the first occurrence it encounters.

**설명**

Edit does not fall back to the first occurrence; by default a non-unique old_string causes the edit to fail rather than silently pick one match. Relying on positional behavior that the tool does not have would leave the file unchanged and the call failed.

**C.** Write the old_string as a regular expression anchored to the section heading so Edit matches only that section.

**설명**

Edit performs exact string matching, including whitespace and indentation; it does not interpret old_string as a regular expression. A regex pattern would be treated as literal text and would fail to match anything in the file.

**D(정답).** Provide an old_string that includes enough surrounding text from the target section to make the match unique in the file.

**설명**

Edit requires the old_string to match uniquely in the file by default. Expanding the old_string with adjacent lines or context from the intended section disambiguates the four occurrences and guarantees only the desired one changes. This is the documented way to target one instance of repeated text.

### 전반적인 설명

The Edit tool performs exact string replacement: it takes an old_string and a new_string, requires the old string to match the file contents exactly (including whitespace and indentation), and by default requires that match to be unique. This uniqueness rule is a deliberate safety design: an ambiguous match could change the wrong location, so the tool refuses to guess. When the text you want to change appears multiple times, the primary remedy is to extend old_string with enough surrounding context (adjacent lines, the section heading, distinctive nearby wording) so that exactly one match remains.

The mental model worth holding is a clean division of labor: Edit makes precise, surgical changes anchored by unique text, while Write replaces a file's entire contents. Write never merges or appends; whatever content it receives becomes the entire file, which is why sending it a single paragraph would erase the rest of the report. And Edit is not a pattern engine; regular expressions passed as old_string are matched literally and simply fail. If a file's structure is so repetitive that no reasonable amount of context produces a unique anchor, one possible strategy is to read the full file and use Write to output the complete modified version, leaning on Write's overwrite semantics at the cost of rewriting everything.

See the Claude Code tools reference for the documented behavior of Read, Write, and Edit.

### 도메인

Tool Design & MCP Integration

## 질문 32

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : Documents analyzed in earlier agent sessions are sometimes revised before those sessions are resumed. Which two practices are sound for handling resumed sessions after such file changes?

**A.** Resume without any annotation, relying on the session to detect changed documents on disk and re-read them automatically on restore.

**설명**

No automatic re-verification of prior tool results happens on resume. The restored history keeps the original read results, which is exactly why changed files must be flagged explicitly or re-read.

**B(정답).** Explicitly tell the agent which documents were revised and instruct it to re-read them before relying on its earlier analysis.

**설명**

A session persists the conversation, not the filesystem, so tool results captured before the revisions remain in history exactly as they were. Flagging the changed files and forcing a re-read ensures the agent does not reason over outdated content.

**C(정답).** Start a new session seeded with a structured summary of prior conclusions if most prior tool results now describe outdated content.

**설명**

When the bulk of the restored evidence is stale, resuming carries a history full of misleading tool results. Preserving the validated conclusions in a fresh session avoids the agent blending old and new document states.

**D.** Rely on prompt caching to invalidate the affected cache segments so the earlier read results refresh once the documents change.

**설명**

Prompt caching reuses unchanged context prefixes to avoid reprocessing; it has no per-file freshness mechanism. Editing files in the repository does not refresh earlier file reads in the conversation.

### 전반적인 설명

The mental model that makes these decisions easy is that a Claude Agent SDK session is conversation history, not a filesystem snapshot. The persisted session contains the prompt, every tool call, every tool result, and every response. File contents enter that history only at the moment the agent reads them, so revising a document afterward does not retroactively rewrite the earlier read result; the old content sits in history as if it were still true. This is why the Sessions documentation frames resumption as picking up prior context, and why an architect must treat that context as a record of what was seen, not of what currently exists.

This design is a deliberate tradeoff: replaying stored history makes resumption cheap and lets the agent build on completed analysis instead of re-exploring, but it puts the burden of freshness on you. The practical rules follow directly. When a few analyzed files changed, resume and explicitly tell the agent which files were revised so it re-reads them before relying on earlier findings. When most of the tool results are stale, resumption is unreliable no matter how carefully you annotate it; the better move is a new session seeded with a structured summary of the validated conclusions, keeping the insight while discarding the outdated evidence.

The two incorrect practices each depend on a freshness guarantee that no mechanism provides. There is no automatic change detection that re-reads modified files and patches the restored history on resume. And prompt caching is orthogonal to freshness entirely: as the prompt caching documentation explains, it exists to avoid reprocessing unchanged context prefixes across requests; editing repository files does not invalidate or refresh earlier file reads in the conversation. Confusing cache behavior with content currency is a common way stale-context bugs slip into resumed multi-agent workflows.

### 도메인

Agentic Architecture & Orchestration

## 질문 33

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : A one-line bug in the report subagent's citation renderer has a clear stack trace, and you understand the fix. You want Claude Code to apply the edit without per-change approval prompts, reviewing the diff afterward. Which permission mode fits?

**A.** Use don't ask mode, which runs only pre-approved tools automatically and silently denies everything else.

**설명**

Don't ask mode auto-denies any tool that has not been explicitly pre-approved, which suits unattended CI pipelines that must never hang on a prompt. In an interactive fix session it would block edits rather than streamline them.

**B.** Use plan mode, which has Claude explore the code and propose the fix before any source file is modified.

**설명**

Plan mode is read-only until a plan is approved, which adds a review step before the change rather than after it. For a small, well-understood fix with a clear stack trace, the documentation says planning adds overhead without benefit.

**C(정답).** Use accept edits mode, which auto-approves file edits in the working directory for after-the-fact review.

**설명**

This is correct because acceptEdits is the documented mode for letting Claude create and edit files, plus run common filesystem commands, without inline approval. It matches a well-understood, clearly scoped fix where the developer prefers to review the resulting diff rather than gate each edit.

**D.** Use bypass permissions mode, which skips every permission check so the edit lands with no gating at all.

**설명**

Bypass permissions removes all permission checks, not just edit approvals, and is recommended only inside isolated containers or virtual machines. It is far broader than needed to skip approval prompts on a scoped one-line fix.

### 전반적인 설명

Claude Code's permission modes exist to let you decide once how much friction each category of action should carry, instead of answering a prompt for every operation. Accept edits (acceptEdits) auto-approves file creation and edits in the working directory, along with common filesystem commands such as mkdir, mv, and rm, while leaving other actions subject to normal permission checks. That profile matches direct execution of a well-understood change: the risk is low, the scope is clear, and the meaningful review happens on the resulting diff, not on each keystroke-level edit.

The other modes make different tradeoffs. Plan mode keeps Claude read-only until you approve a proposed plan; the best-practices guidance reserves it for uncertain approaches, multi-file changes, or unfamiliar code, and explicitly says to skip planning when the diff can be described in one sentence. Don't ask mode is designed for unattended pipelines: anything not pre-approved is auto-denied without a prompt, so an interactive session would see edits blocked rather than accelerated. Bypass permissions disables all checks entirely, which trades away every safety boundary to solve a problem that acceptEdits already solves narrowly, and Anthropic advises running it only in isolated environments.

Whichever mode you choose, direct execution should still end with verification: ask Claude to run the relevant tests and show the output rather than assert success. See Permission modes and Claude Code best practices.

### 도메인

Claude Code Configuration & Workflows

## 질문 34

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : The team's agent extracts API metadata (endpoints, parameters, return types) from legacy modules, and aggregate extraction accuracy measures 96%. Leadership wants to remove the human review step for these extractions. What should the team verify first?

**A.** Rely on the agent's self-rated confidence scores, reviewing only outputs it flags as uncertain.

**설명**

Uncalibrated self-reported confidence is an unreliable proxy; the model can be confidently wrong, so this approach misses exactly the errors that matter most. Confidence scores become useful only after calibration against labeled data, and they still do not validate segment-level accuracy.

**B.** Rerun the evaluation on a larger sample and confirm the overall score remains stable at scale.

**설명**

A larger sample makes the aggregate estimate more precise, but it is still an aggregate. A stable 96% overall can coexist with a 40% error rate on a minority module type, so this does not answer the question automation depends on.

**C.** Confirm the aggregate score exceeds the accuracy that human reviewers achieve on the same outputs.

**설명**

Beating human accuracy on average does not address the core risk: the average can mask a segment where the agent fails badly. The comparison still relies on the same aggregate number that hides distributional problems.

**D(정답).** Segment accuracy by module type and extracted field to confirm performance holds in every segment.

**설명**

This is correct because an aggregate score can hide severe failures in specific segments, such as one legacy language or one hard-to-parse field. Automation is only defensible once accuracy has been validated per document type and per field, not just overall.

### 전반적인 설명

An aggregate accuracy metric is a weighted average across everything the system processes, so it is dominated by whatever segments are most common. A 96% overall score is entirely compatible with, say, 40% errors on extractions from one legacy language or on one particularly ambiguous field, as long as that segment is a small share of the volume. Removing human review is a risk decision about the worst segment, not the average one, which is why the prerequisite is to segment accuracy by document type and by field and confirm performance is consistent everywhere before reducing oversight.

This reflects how Anthropic frames evaluation generally: production use cases need multidimensional, task-specific measurement tied to the real-world input distribution, including edge cases, rather than a single global pass rate. For extractions with known golden answers, code-based grading (exact match per field) makes segment-level analysis cheap to run continuously. See Define your success criteria.

The alternatives each fail the same way. Comparing the aggregate to human reviewer accuracy still reasons from the number that hides the problem. Routing on the model's raw self-rated confidence trusts a known-unreliable signal; models are often confidently wrong, and confidence only becomes actionable after calibration against a labeled validation set. Enlarging the sample tightens the confidence interval around the aggregate without ever revealing how accuracy is distributed across segments.

### 도메인

Context Management & Reliability

## 질문 35

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : A nightly job runs the coordinator non-interactively with claude -p and logs each run's JSON output. One run produced an incomplete report, and an engineer wants to reopen that exact session interactively, but it does not appear in the session picker. How can they resume it?

**A(정답).** Pass the session ID captured from the run's JSON output to claude --resume.

**설명**

This is correct because sessions created with claude -p are excluded from the session picker and from claude --continue, but they remain resumable by passing their session ID to claude --resume. The JSON output from the headless run is where that ID is captured.

**B.** Assign the session a name with /rename in a fresh session, then resume by that name.

**설명**

This fails because /rename renames the session it is run inside, not a different prior session. Opening a fresh session and renaming it does nothing to make the headless run's conversation reachable.

**C.** Run claude --continue in the project directory to reopen the most recent session.

**설명**

This does not work because claude --continue resumes the most recent interactive session in the current directory, and sessions created with claude -p are explicitly excluded from it. It would reopen some other interactive session or nothing relevant.

**D.** Rerun claude -p with the same prompt so the CLI restores the prior session's saved state.

**설명**

This starts an entirely new session rather than restoring the previous one. Repeating the same prompt does not link the new run to the earlier session's conversation history or tool results.

### 전반적인 설명

Claude Code persists every session, but not every session is equally discoverable. Sessions launched non-interactively with claude -p (or through the Agent SDK) are deliberately excluded from the interactive session picker and from claude --continue, because automated runs would otherwise clutter the picker and make --continue unpredictable in directories where pipelines run frequently. The escape hatch is direct addressing: claude --resume accepts either a session name or a session ID, and a headless run's ID is available in its JSON output. Capturing that ID as part of the pipeline is the standard pattern for making automated runs auditable, since it lets an engineer reopen the exact conversation, including all tool calls and results, to diagnose what the coordinator actually did.

The mental model to hold is that discovery mechanisms (--continue, the /resume picker) and the resumption mechanism (--resume with an explicit identifier) are separate layers. --continue is a convenience that resolves to the most recent interactive session in the current directory, so it cannot reach a -p session at all. /rename operates only on the session currently open, so it offers no way to label a past headless run after the fact. Rerunning the same prompt creates a brand-new session with no connection to the earlier one; saved state is tied to a session identity, not to prompt text.

See Sessions and the CLI reference for the documented behavior of --resume, --continue, and headless session handling.

### 도메인

Agentic Architecture & Orchestration

## 질문 36

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : While mapping a legacy service before a refactor, the agent must choose among its built-in tools for several investigation tasks. For which TWO tasks is Grep the correct selection? (Select TWO.)

**A.** Load the complete contents of the main service module for detailed analysis.

**설명**

Retrieving a full file for analysis is a whole-file operation, which is what Read is for. Grep returns pattern matches, not complete file contents suitable for line-by-line understanding.

**B.** Enumerate every migration file matching the path pattern db/migrations/**/*.sql.

**설명**

This task matches files by their path and extension, not by what they contain. Glob is the tool for discovering files by name pattern, so using Grep here misapplies a content-search tool to a path-matching problem.

**C(정답).** Identify which files emit the log message 'connection pool exhausted'.

**설명**

A log message string lives inside file contents, not in file names or paths. Grep searches within files for patterns like error messages and strings, so it directly answers where the message originates.

**D(정답).** Find every call site of the deprecated authorize_request function in the codebase.

**설명**

Function calls are text inside source files, so locating callers is a content search. Grep is the tool designed to match patterns within file contents, making it the correct choice for tracing where an identifier is used.

### 전반적인 설명

The dividing line among Claude Code's investigation tools is what is being searched. Grep searches patterns in file contents: function names, log strings, imports, error messages. Glob matches files by name and path patterns such as db/migrations/**/*.sql. Read loads a full file once you already know which file matters. Keeping these boundaries straight is what lets an agent explore a codebase incrementally instead of loading everything into context.

Both correct tasks here are content questions. Callers of authorize_request are occurrences of that identifier inside source files; the origin of a log message is the place its string literal appears in code. Neither is answerable from file names alone, so Grep is the right tool for each. The mental model many engineers find useful is that Grep looks inside files while Glob looks at their surface: their names, extensions, and directory locations.

The distractors each belong to a different tool's territory. Enumerating SQL migration files by path pattern is exactly the file-discovery job Glob performs, and expressing it through Grep would either fail or require awkward workarounds. Loading a module in full is a Read operation; Grep would return only scattered matching lines, not the coherent file the analysis needs. Choosing the purpose-built tool for each step also keeps the agent's context spend efficient: search narrows the field, and reading is reserved for the files that matter.

See the Claude Code tools reference for the documented responsibilities of Grep, Glob, and Read.

### 도메인

Tool Design & MCP Integration

## 질문 37

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : You are implementing the loop that drives this agent's tool execution against the Messages API. Which two implementation choices correctly follow the agentic loop protocol? (Select two.)

**A(정답).** Continue the loop while each response's stop_reason is tool_use, and present the final answer once a response returns end_turn.

**설명**

This is the documented control flow: tool_use means Claude has requested tools and expects their results back, while end_turn means Claude finished its response naturally. Keying the loop on stop_reason is the designed termination mechanism.

**B.** Return tool outputs as plain text in the next user message, since Claude can read the backend data without any special block structure.

**설명**

The protocol requires tool outputs to be sent as tool_result content blocks whose tool_use_id matches the prior tool_use block. Plain text in a user message leaves the tool_use requests without matching results, which produces API errors rather than continued reasoning.

**C.** Treat the presence of a text content block in a response as the completion signal, since Claude only writes prose after finishing its tool calls.

**설명**

A single assistant response can contain both text blocks and tool_use blocks mid-task, so text presence is not a reliable completion signal. Checking content instead of stop_reason is a documented anti-pattern in agent loop design.

**D(정답).** Resend the full message history, including the assistant message that contained the tool_use blocks, in each follow-up request.

**설명**

The API is stateless, so every follow-up must carry the original messages, Claude's assistant response with its tool_use blocks, and the new message with tool results. Omitting the assistant tool_use message breaks the required pairing between tool calls and results.

### 전반적인 설명

The agentic loop is a contract between your application and the model. Claude never executes your MCP tools itself; it emits a structured request and halts with stop_reason: "tool_use", signaling that it expects your harness to run the tools and send the outputs back. When Claude has everything it needs and finishes reasoning, it returns stop_reason: "end_turn", which is the only reliable signal that the loop should terminate and the final reply should be surfaced to the customer. This is why the loop keys on stop_reason rather than on anything in the response text.

Equally important is that the Messages API is stateless: nothing persists between calls. Each iteration must resend the entire conversation, including the assistant message that carried the tool_use blocks, followed by a user message containing the matching tool_result blocks. The growing history is the only channel through which Claude ever sees what a tool returned, and dropping the assistant turn severs the pairing the protocol requires.

The two rejected choices reflect common misconceptions. Parsing responses for text as a completion signal fails because Claude routinely emits explanatory text alongside tool calls in the same turn; content inspection is an explicit anti-pattern. And tool outputs cannot travel as bare prose: the protocol requires tool_result content blocks in a user message, each matched to its request by tool_use_id and placed immediately after the corresponding tool_use. Sending plain text instead leaves the tool calls unresolved and triggers API errors. See How tool use works, Handle tool calls, and Handling stop reasons.

### 도메인

Agentic Architecture & Orchestration

## 질문 38

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

## 질문 39

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The report subagent's structured extractions intermittently fail JSON parsing. Logs show each failing response ends mid-object and carries stop_reason "max_tokens". How should the pipeline handle these failures?

**A(정답).** Retry the affected requests with a higher max_tokens value, since the output was truncated rather than malformed by the model.

**설명**

This is correct. A stop_reason of max_tokens means generation was cut off by the output token cap, so the JSON is incomplete, not incorrectly formed. The documented remedy is to retry with a larger max_tokens so the model can finish the object.

**B.** Mark the affected documents unrecoverable, since the incomplete fields indicate the information is absent from the source material.

**설명**

Absent source information is the classic non-retryable case, but that diagnosis does not fit these logs. The response was cut off mid-object by the token limit, which says nothing about whether the source documents contain the data.

**C.** Add a system prompt instruction requiring the model to always close every brace and never emit partial JSON objects.

**설명**

Prompt instructions cannot override a hard token cap; when max_tokens is reached, generation stops mid-stream regardless of what the model was instructed to produce. The fix is a request configuration change, not stronger wording.

**D.** Resend the truncated output together with the JSON parse error so the model can self-correct the syntax on the next attempt.

**설명**

Retry-with-error-feedback fixes mistakes the model made when it had room to answer, such as wrong field placement or format errors. Here the model did not make a syntax mistake; it ran out of output tokens, and a feedback retry under the same cap will be truncated again.

### 전반적인 설명

Diagnosing why an extraction failed is a prerequisite for choosing the right retry strategy, and stop_reason is the primary diagnostic signal. A value of max_tokens means the model hit the configured output cap and generation was truncated mid-stream. That is not a model error at all: the model may have been producing perfectly valid JSON that simply got cut off. The documented remedy is to retry with a higher max_tokens limit so the full object can be emitted.

This sits between the two familiar retry categories. Retry-with-error-feedback (resending the failed output plus the specific validation error) works when the model made a correctable mistake and everything needed for the fix is already in the prompt; format mismatches and misplaced fields respond well to it. No-retry applies when the required information is absent from the provided source, because no number of retries can conjure missing facts. Truncation is a third category: retryable, but only if the request itself changes. Resending error feedback under the same cap reproduces the truncation, and prompt instructions about closing braces are powerless against a hard sampling limit. Concluding the source lacks the data misreads the signal entirely, since the cutoff happened in the output channel, not in extraction quality.

The practical takeaway for a validation-retry loop: branch on the failure signal before deciding the retry payload. Parse errors with stop_reason: "max_tokens" get a re-run with a raised limit; semantic or structural validation errors on complete responses get error-feedback retries; fields whose values genuinely do not exist in the provided material get flagged rather than retried. See Structured outputs for the documented handling of max_tokens cutoffs and Reduce hallucinations for guidance when the real gap is missing source grounding.

### 도메인

Prompt Engineering & Structured Output

## 질문 40

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : The agent extracts endpoint metadata from legacy services; extractions with high calibrated confidence auto-commit while engineers review the rest. You need ongoing assurance that auto-committed extractions stay accurate and that novel error patterns surface. What should you implement?

**A(정답).** Audit an ongoing stratified random sample of the auto-committed extractions and measure error rates per segment.

**설명**

This is correct because the auto-committed stream is exactly where confidently wrong extractions hide, and only direct, ongoing sampling of that population measures its true error rate. Stratifying the sample across segments ensures rare service types are represented, which is how novel error patterns are detected early.

**B.** Monitor engineer-filed bug reports against the auto-committed metadata and treat report volume as the error signal.

**설명**

Bug reports are a lagging, biased signal: they only surface errors that happen to cause visible downstream problems and that an engineer bothers to file. Silent inaccuracies in rarely touched metadata never generate reports, so error rates and novel patterns go undetected.

**C.** Add a second-pass self-evaluation step and review only the auto-committed extractions the agent flags as doubtful.

**설명**

Self-flagged doubt is an unreliable proxy because the model is precisely most confident on the errors this design needs to catch. Reviewing only what the model itself questions systematically misses confidently wrong extractions and provides no unbiased error-rate measurement.

**D.** Raise the confidence threshold for auto-commit so more borderline extractions route to engineer review.

**설명**

Raising the threshold shifts more work to humans but leaves the remaining auto-committed population completely unmeasured. Extractions above any threshold can still be confidently wrong, and no threshold change produces an error-rate measurement or surfaces new failure patterns.

### 전반적인 설명

Confidence-based routing creates a blind spot by design: the extractions that skip human review are the ones the model was most sure about, and models can be confidently wrong. Once a high-confidence stream flows straight into commits, the only way to know its actual quality is to keep measuring it directly. Stratified random sampling does this: draw an ongoing random sample from the auto-committed population, review it, and compute error rates. Stratifying by segment (service type, extraction field, document structure) matters because errors rarely distribute uniformly; a purely uniform random sample can go months without including the rare segment where a new failure mode is concentrating, while a stratified design guarantees every segment contributes review coverage and drift or novel patterns surface early.

The alternatives all fail the same test: none of them measures the unreviewed population. Tightening the auto-commit threshold merely relocates the boundary; whatever remains above the line is still unaudited. A self-evaluation pass inherits the original problem, since the model's own doubt is the signal that already failed to flag these errors, so reviewing only self-flagged items skips exactly the confidently wrong cases. Downstream bug reports detect only errors that cause visible, attributable breakage, which makes them a lagging and heavily biased instrument rather than an error-rate measurement.

The general principle is that automation decisions must be paired with continuous, unbiased measurement of the automated path, not just gating on the model's self-assessment. See Anthropic's guidance on defining success criteria and building effective agents for the broader practice of grounding reliability claims in empirical evaluation.

### 도메인

Context Management & Reliability

## 질문 41

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : A nightly batch classifies 5,000 resolved support transcripts for quality auditing. When the batch ends, 120 entries in the results file carry a result type of errored. How should the pipeline recover the missing classifications?

**A.** Resubmit the entire 5,000-transcript batch as a new submission and deduplicate the classifications after both result files arrive.

**설명**

Resubmitting the whole batch reprocesses thousands of already-successful requests, paying for them a second time and creating duplicate outputs that must then be reconciled. Selective resubmission of only the failed requests is the documented failure-handling pattern.

**B.** Use the batch's request_counts metadata to determine which transcripts failed and queue those entries for resubmission.

**설명**

The request_counts field on the batch object is aggregate metadata: it reports how many requests succeeded, errored, or expired, but not which ones. Identifying individual failures requires reading the results file and using each entry's custom_id.

**C(정답).** Filter the results file for errored entries, map each one's custom_id back to its transcript, and resubmit only those requests.

**설명**

This is correct. Every result line, including errored ones, carries the developer-assigned custom_id, so the pipeline can identify exactly which transcripts failed and build a new batch containing only those 120 requests. This avoids paying again for the 4,880 successful classifications.

**D.** Read the message id inside each errored result to identify the affected transcripts, then rerun those through the synchronous API.

**설명**

An errored result contains an error object and no Message, so there is no message id to read. Even for successful results, the model-generated message id has no relationship to your source transcripts; the developer-provided custom_id is the correlation mechanism.

### 전반적인 설명

The Message Batches API is deliberately fire-and-forget: you submit a requests array, poll until processing_status becomes ended, and then download a .jsonl results file. Because the API has no knowledge of your domain objects, the contract for tying results back to your data is the custom_id you supply on each request. Every line in the results file, whatever its outcome, echoes that custom_id alongside a result object whose type is one of succeeded, errored, canceled, or expired.

That design makes partial failure cheap to handle. The recovery workflow is to filter the results file for non-succeeded entries, resolve each custom_id to its source transcript, and submit a fresh batch containing only those requests. You retain the 50% batch discount, pay only for the 120 retries, and never touch the successful results.

The other approaches misread what each artifact provides. Resubmitting the full batch reprocesses everything and forces a deduplication step downstream. The model-generated message id lives inside a successful succeeded result's Message and does not exist at all for errored entries; it identifies a response, not your transcript. And request_counts is batch-level telemetry, useful for monitoring progress, but it only counts outcomes; it cannot name the individual requests that failed.

See Batch processing for the failure-handling workflow and result types, and the Create a Message Batch reference for how custom_id is defined on each request.

### 도메인

Prompt Engineering & Structured Output

## 질문 42

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : The agent automates database schema migrations. Policy requires that a backup snapshot completes before any migration command runs through Bash, but with prompt instructions alone, testing shows the agent occasionally skips the backup. How do you guarantee the ordering?

**A.** Set the sampling temperature to zero so the agent applies the documented migration sequence deterministically on every run.

**설명**

Temperature controls token sampling, not policy enforcement; a greedy decode can still produce a plan that omits the backup step. Making generation deterministic does not make an instruction binding, so this addresses the wrong layer of the system.

**B.** Move the ordering rule to the top of the system prompt and restate it inside both tools' descriptions using mandatory language.

**설명**

Prompt placement and emphasis raise the likelihood of compliance but remain probabilistic; the testing already shows the agent sometimes skips the backup under instruction alone. A rule that must hold on every run cannot rely on the model choosing to follow it.

**C.** Add few-shot examples to the system prompt demonstrating the backup-then-migrate sequence across representative migration scenarios.

**설명**

Few-shot examples improve the model's tendency to follow a pattern, but they do not create a hard constraint. An occasional skipped backup would still be possible, and any nonzero failure rate is unacceptable when the downside is an unrecoverable migration.

**D(정답).** Add a PreToolUse hook that blocks migration commands until the backup tool has reported success, forcing the backup to run first.

**설명**

A PreToolUse hook intercepts the outgoing Bash call in code before it executes, so a migration can never run without a completed backup. This converts the ordering rule from a probabilistic instruction into a deterministic guarantee, which is exactly what a policy with data-loss consequences requires.

### 전반적인 설명

This question tests the core distinction between programmatic enforcement and prompt-based guidance for workflow ordering. Instructions in a system prompt, tool descriptions, or few-shot examples all operate through the same channel: they influence what the model is likely to generate. That influence can push compliance above 90%, but it can never reach a guarantee, because every generation is a fresh probabilistic decision. A PreToolUse hook operates through a different channel entirely: it is code that runs before the tool call executes, so it can inspect the requested Bash command, check whether the backup prerequisite has completed, and block or redirect the call. The violating action physically cannot happen, regardless of what the model decided.

The mental model to carry into production design is a two-tier one. Use prompts for preferences, style, and flexible judgment, where occasional deviation is tolerable and adaptability is valuable. Use hooks or programmatic preconditions whenever a rule has financial, legal, or data-integrity consequences, such as identity verification before refunds or backups before destructive migrations. The scenario's own evidence (the agent occasionally skips the backup despite instructions) is the classic signal that the rule has been placed on the wrong tier.

The temperature suggestion is a common trap worth understanding: temperature zero makes token selection deterministic, but the model can deterministically produce a non-compliant sequence. Compliance failures are not sampling noise, so tuning sampling parameters cannot fix them. See the Claude Code hooks documentation for how PreToolUse hooks intercept and block tool calls before execution.

### 도메인

Agentic Architecture & Orchestration

## 질문 43

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : While iterating on the agent's prompt and tool handling, testing surfaces several defect pairs. Which actions correctly apply the batching rule for presenting issues to Claude? (Select two.)

**A(정답).** Present the escalation threshold and the refund approval check together in one message, since both misread the same policy clause and correcting one changes what the other must do.

**설명**

These two defects interact: both stem from one misread policy clause, and a fix to either alters the correct behavior of the other. Interacting issues must be presented together so Claude can produce one coherent change that satisfies both constraints at once.

**B.** Batch the verbose logging statement in one tool wrapper with the stale docstring in another into a single message, since combining them saves iteration turns even though the files are unrelated.

**설명**

Saving turns is not the criterion for batching; interdependence is. These changes touch unrelated files with no interaction between them, so sequential handling keeps each fix simple to verify and avoids mixing unrelated edits in one diff.

**C(정답).** Give Claude the lookup_order output format and the process_refund input parsing in a single message, since they disagree on order ID structure and fixing either alone breaks the handoff.

**설명**

These defects are coupled through a shared contract: the order ID format must change on both sides simultaneously or the handoff between the tools breaks. Presenting them in one message lets Claude reconcile the two sides in a single consistent fix.

**D.** Combine the typo in the agent's greeting template and the incorrect currency symbol in refund confirmations into one message, since both are quick text fixes in customer-facing output.

**설명**

These are independent cosmetic fixes with no shared logic, so fixing one has no effect on the other. Independent issues are better handled sequentially, where each fix can be applied and verified in isolation without diluting attention across unrelated changes.

### 전반적인 설명

The decision rule for feeding issues to Claude is interdependence, not convenience. When defects interact, meaning a fix to one changes what a correct fix to the other looks like, they must arrive in a single message. Given only one issue at a time, Claude optimizes locally: it corrects the escalation threshold without knowing the refund approval check reads the same policy clause, or changes lookup_order's output format without adjusting process_refund's parsing, and each fix silently invalidates or conflicts with the next. Presenting the coupled issues together lets the model reason about the shared constraint (one policy interpretation, one order ID contract) and emit a single coherent change.

Independent issues invert the tradeoff. A greeting typo and a currency symbol, or a logging statement and a stale docstring, share no logic, so nothing is gained by combining them, and something is lost: a batched prompt spreads attention across unrelated edits, produces a diff that is harder to review, and makes it harder to tell which change caused a regression. Sequential turns keep each fix small, verifiable in isolation, and easy to accept or roll back on its own.

A useful mental model: batch by root cause and contract, not by count or file proximity. If two fixes must land together to leave the system consistent, they are one task; if either could ship alone without breaking anything, they are separate tasks. This mirrors broader iterative-refinement guidance for Claude Code: scope each request so the model can hold the full set of interacting constraints in view, and no more. See Claude Code Best Practices and the Claude Code documentation.

### 도메인

Claude Code Configuration & Workflows

## 질문 44

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The review job resolves each pull request to its tracker ticket via an MCP lookup by feature name. Some lookups return multiple plausible tickets, and guessing has produced reviews against the wrong acceptance criteria. How should multiple matches be handled?

**A.** Review the diff against the acceptance criteria of every candidate ticket and combine all findings in one report.

**설명**

Reviewing against criteria from tickets the PR does not implement generates spurious findings, directly inflating the false positive rate the pipeline is designed to minimize. It buries the correct review in noise instead of resolving which ticket applies.

**B(정답).** Post PR feedback flagging the ambiguous match, request the exact ticket ID from the author, and defer the criteria check.

**설명**

This is correct because ambiguity between multiple matches should be resolved by obtaining a definitive identifier from the person who has it, the PR author. In a non-interactive pipeline, the review output itself is the channel for that request, and deferring the check prevents reviewing against wrong criteria.

**C.** Rank the candidate tickets by textual similarity to the PR description and review against the highest-scoring match.

**설명**

Similarity ranking is a heuristic guess dressed up as a method; it still selects one candidate without definitive evidence. The wrong-ticket reviews that motivated the change would continue whenever the similarity signal is misleading.

**D.** Have Claude rate its confidence in each candidate and proceed with the review whenever the rating clears a threshold.

**설명**

Model self-rated confidence is an unreliable proxy: the model can be confidently wrong, and its scores are poorly calibrated. Proceeding above a threshold automates the same guessing behavior rather than resolving the ambiguity.

### 전반적인 설명

When a lookup returns multiple plausible matches, the reliable resolution is always to obtain an additional definitive identifier from whoever actually knows the answer, never to select a candidate by heuristic. In an interactive session that means asking the user mid-conversation; in a headless CI run, where the agent cannot pause for input, the equivalent channel is the run's own output: post the ambiguity as PR feedback, ask the author to supply the exact ticket ID, and defer the acceptance-criteria check until the identifier arrives. The author has ground-truth knowledge of which ticket the PR implements, so one extra round trip eliminates the entire class of wrong-ticket reviews.

The distractors all keep guessing, just with more machinery. Textual similarity ranking is a probabilistic proxy that fails exactly when ticket titles overlap, which is when the ambiguity arises in the first place. Confidence self-ratings are poorly calibrated; a model tends to be confidently wrong on precisely the hard cases, so a threshold does not separate correct matches from incorrect ones. Reviewing against every candidate's criteria trades a wrong review for a noisy one: findings derived from unimplemented tickets are false positives by construction, undermining the pipeline's stated goal of actionable, low-noise feedback.

The general mental model: heuristic disambiguation converts uncertainty into silent errors, while explicit clarification converts it into one visible, cheap interaction. Design agents, interactive or automated, so that ambiguity surfaces as a request for the missing identifier rather than being absorbed by a guess. See Connect Claude Code to tools via MCP and Building Effective Agents for guidance on tool integration and reliable agent behavior.

### 도메인

Context Management & Reliability

## 질문 45

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

## 질문 46

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : Midway through an open-ended task to add tests across a legacy module, the agent discovers that many target files are build-generated from templates, invalidating part of its prioritized plan. What should the workflow do next?

**A(정답).** Regenerate the remaining subtasks based on the discovery, redirecting test work to the template sources rather than the generated files.

**설명**

This is the defining behavior of dynamic adaptive decomposition: subtasks are produced and revised based on intermediate findings, not locked in after the initial mapping pass. The discovery that files are generated changes what work is meaningful, so the plan should adapt immediately and target the templates.

**B.** Pause and escalate to an engineer, since encountering conditions the initial plan did not anticipate signals the task exceeds agent scope.

**설명**

Deviations from an initial plan are expected in adaptive workflows, not evidence the task is beyond the agent. Escalating on every unanticipated finding removes the adaptability that justifies using an agent for open-ended work in the first place.

**C.** Finish executing the original plan as written, then schedule a second cleanup pass to repair any work performed against generated files.

**설명**

Continuing a plan that a discovery has invalidated treats an adaptive investigation like a fixed pipeline. Work written against generated files will be overwritten at the next build, so this approach knowingly spends effort that must be redone.

**D.** Abort the run and restart with a longer upfront mapping phase so the initial plan accounts for build-generated files this time.

**설명**

Open-ended tasks cannot be fully mapped in advance; surprises like generated files are exactly why dynamic decomposition exists. Restarting discards valid completed work and still cannot guarantee the next mapping pass anticipates every condition.

### 전반적인 설명

Fixed pipelines and adaptive decomposition differ in where the plan lives. In prompt chaining, the sequence of steps is defined in code before the run starts, which works when a task decomposes cleanly into known subtasks. In dynamic adaptive decomposition, the model itself generates subtasks, and critically, it keeps regenerating them as intermediate results arrive. The plan is a living artifact: map the terrain, prioritize, act, and fold each discovery back into the remaining work. Anthropic's guidance draws exactly this line between workflows, which follow predefined code paths, and agents, which dynamically direct their own process based on what tool results reveal.

Discovering that target files are build-generated is a canonical mid-run finding: it does not mean the task failed or the mapping was negligent, it means the environment supplied ground truth the agent could not have known before reading the code. The correct response is to fold that fact into the plan, retargeting effort at the template sources. Completing the original plan wastes work on files the build will overwrite; restarting with a bigger upfront mapping phase misunderstands why adaptive decomposition is used at all, since legacy codebases reliably hide conditions no single mapping pass will catch; and escalating on every plan deviation converts routine adaptation into human toil, eroding the productivity gain the agent exists to provide. Escalation belongs to genuine blockers, such as policy gaps or decisions with irreversible impact, not to ordinary discoveries.

The mental model: choose the fixed chain when you can write the steps down before running anything, and choose adaptive decomposition when the next step depends on what the last one revealed. Then let it actually adapt. See Anthropic's Building Effective Agents for the workflow-versus-agent framework and the orchestration patterns behind it.

### 도메인

Agentic Architecture & Orchestration

## 질문 47

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : A scheduled CI job kicks off a headless research report with claude -p, but runs still stall because the invocation configures an MCP permission prompt tool that no host answers in CI. What change lets the job complete unattended?

**A(정답).** Add --permission-prompts none so the run skips the permission host and denies any action that would have prompted.

**설명**

This flag tells Claude Code not to consult or wait on a configured permission host, so the run never blocks on an approval nobody will give. Actions that would have required a prompt are denied instead of hanging, letting the job finish deterministically.

**B.** Drop the -p flag so the session's interactive interface can surface and resolve the approval prompts.

**설명**

Removing -p starts an interactive session, which is exactly what a CI job cannot support: there is no human at the terminal to respond. The job would hang on interactive input instead of on the permission host.

**C.** Pipe a continuous stream of yes responses into the process's standard input so every approval request is answered automatically.

**설명**

Permission requests routed to a permission prompt tool are answered by that host, not by reading the process's standard input. Piping text into stdin does not satisfy the approval flow, and blanket auto-approval would be an unsafe pattern even if it worked.

**D.** Add --output-format json so the run emits machine-readable results instead of pausing for approval input.

**설명**

The output format only controls how results are serialized once the run produces them. It has no effect on the permission flow, so the run still waits on the unanswered permission host.

### 전반적인 설명

The -p (--print) flag makes Claude Code run non-interactively, but it is not by itself a complete unattended-execution strategy. Permission handling is a separate layer: when an invocation configures a permission host, such as an MCP --permission-prompt-tool or an Agent SDK canUseTool callback, any tool call that needs approval is routed to that host, and the run waits for its answer. In CI there is nothing behind that host to respond, so the run stalls even though the session itself is headless.

The flag --permission-prompts none exists for exactly this situation: it tells Claude Code not to consult or wait on the permission host at all, and any promptable action that cannot be resolved another way is denied rather than left pending. That trades some capability (denied actions) for a guarantee the pipeline actually values: the job always terminates. Note the flag requires a recent Claude Code version (v2.1.259 or later). The right mental model is a layered pipeline setup: -p handles the interactivity of the session, tool pre-approval flags such as --allowedTools handle which calls never prompt, and --permission-prompts none handles what happens to anything that would still prompt.

The other approaches fail because they target the wrong layer. Piping affirmative text into stdin never reaches a permission host, since approvals do not flow through standard input. Changing the output format only affects result serialization, not the approval flow. Removing -p makes matters worse by reintroducing an interactive session in an environment with no human to drive it. See Headless mode and the CLI reference for the full unattended-run configuration.

### 도메인

Claude Code Configuration & Workflows

## 질문 48

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : The repository's CLAUDE.md mixes conventions for MCP tool-handler code in src/tools/, conventions for test files scattered throughout the tree, and deployment notes. You want each convention set loaded only when matching files are being worked on. What should you do?

**A.** Keep one CLAUDE.md and use @import statements to pull each convention set in from separate topic files.

**설명**

Imports organize content into separate files, but everything imported is expanded and loaded at launch. This improves maintainability without achieving conditional loading, so all convention sets still occupy context in every session.

**B(정답).** Move each convention set into its own .claude/rules/ file with paths glob frontmatter matching relevant files.

**설명**

This is correct because rule files in .claude/rules/ can declare a paths field in YAML frontmatter, and such rules load only when Claude works with files matching the glob patterns. This gives conditional loading per topic, keeping irrelevant conventions out of context.

**C.** Add a CLAUDE.md inside src/tools/ and inside each directory that contains test files or deployment scripts.

**설명**

Directory-level CLAUDE.md files are bound to their directory, which fails for test files scattered across many locations; you would need a copy in every directory containing tests. Glob-scoped rules apply by file type regardless of location, making them the better fit here.

**D.** Convert each convention set into a slash command that developers run when they start work in that area.

**설명**

Slash commands are opt-in prompt templates, so the conventions apply only when someone remembers to invoke the command. Conventions that should automatically govern work on matching files need a mechanism that loads without manual invocation.

### 전반적인 설명

The .claude/rules/ directory is the modular alternative to a monolithic CLAUDE.md, and its key lever is the paths field in YAML frontmatter. A rule with paths: ["src/tools/**/*"] or paths: ["**/*.test.ts"] loads only when Claude works with files matching those globs, while a rule without paths loads unconditionally at launch with the same priority as .claude/CLAUDE.md. The mental model: everything that loads unconditionally competes for attention in every session, so conditional loading is not just a token optimization; it also makes each rule more likely to be followed when it actually applies.

Glob-scoped rules also solve the location problem that directory-level CLAUDE.md files cannot. A directory CLAUDE.md governs one folder, which works for conventions tied to a single area but breaks down for file types spread across the tree, such as test files co-located with the code they test. A pattern like **/*.test.ts covers them all from one rule file. Note that Claude Code discovers rule files recursively under .claude/rules/, so the rules themselves can be organized into subdirectories by topic.

The distractors each miss the conditional-loading requirement. The @import syntax modularizes the source files, but imported content is expanded inline at launch, so context usage is unchanged. Slash commands make conventions opt-in, which is appropriate for occasional workflows but not for standards that should govern every edit to matching files. See Manage Claude's memory for the full behavior of rules and path scoping.

### 도메인

Claude Code Configuration & Workflows

## 질문 49

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : A multi-hour research run crashes after the web search and document analysis subagents complete but before synthesis starts. You want to resume without redoing finished work. Which recovery design should you implement?

**A.** Resume the coordinator under a named session with the resume flag, relying on the restored session context to make the completed subagents' outputs available to the synthesis agent.

**설명**

Session resumption restores conversational context for a single session, but it does not give the coordinator a reliable record of which phases completed or a structured store of subagent findings. Recovery that depends on whatever happened to be in the session at crash time is fragile compared to explicit state exports and a manifest.

**B.** Persist the coordinator's full conversation transcript to disk after every turn, then replay the entire message history on resume so all agents regain their prior working context.

**설명**

Subagents run with isolated context and do not read the coordinator's history, so replaying the coordinator transcript does not restore their state. It also reloads verbose intermediate output wholesale instead of the distilled findings the remaining agents actually need.

**C.** Configure each subagent to write its raw tool outputs in full to shared files, so on resume the synthesis agent can reconstruct all prior work by reading everything back into context.

**설명**

Dumping raw tool outputs preserves data but not usable state: the synthesis agent would ingest bulky search pages and analysis traces, bloating its context with content disproportionate to relevance. It also gives the coordinator no completion record, so it cannot decide what to skip versus rerun.

**D(정답).** Have each subagent export structured state to a known location; on resume, the coordinator loads a manifest to identify completed phases and injects those findings into remaining agents' prompts.

**설명**

This is the structured state persistence pattern for crash recovery. Each agent writes its status and key findings to a known location, and a manifest tells the coordinator exactly which phases finished, so it can skip completed work and pass prior findings explicitly into the prompts of the agents that still need to run.

### 전반적인 설명

Crash recovery in a coordinator-subagent system works because state is made explicit and structured rather than left implicit in conversation history. Each agent exports a state file to a known location containing its status, key findings, coverage, and gaps, and a small manifest records which phases are completed, in_progress, or not_started. On resume, the coordinator reads the manifest, skips finished phases, and injects the exported findings directly into the prompts of the agents that still need to run. This last step matters because subagents have isolated context: nothing exists for a subagent unless it is placed in its prompt, so recovery must deliver prior findings explicitly.

The alternatives fail for reasons that reveal the same mental model. Replaying the coordinator's transcript restores a conversation, not agent state, and subagents never see that history anyway. Session resumption is designed for continuing interactive work, not for reconstructing a multi-phase pipeline; it carries no completion record and risks acting on stale context. Writing raw tool outputs in full trades one failure for another: the data survives, but the synthesis agent must swallow tens of thousands of tokens of unfiltered content, reproducing the context bloat that structured summaries exist to prevent.

The design tradeoff is a small amount of discipline at each phase boundary (exporting a compact, structured summary) in exchange for cheap, deterministic recovery and cleaner handoffs even when nothing crashes. See Subagents in the Claude Agent SDK and Anthropic's engineering write-up on building a multi-agent research system, which discusses durable state and resumption in long-running agent workflows.

### 도메인

Context Management & Reliability

## 질문 50

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : The coordinator must run three independent read-only codebase investigations plus one boilerplate-generation task that depends on all three sets of findings. How should it schedule these four subagent delegations?

**A(정답).** Emit the three investigation Task calls in one response, then delegate the generation task in a later turn with the findings included.

**설명**

This is correct because the three investigations are independent and read-only, so emitting their Task calls in a single coordinator response lets them run concurrently. The generation task depends on their outputs, so it must be delegated afterward with the findings passed explicitly in its prompt, since subagents do not inherit the coordinator's context.

**B.** Emit all four Task calls in a single response so the investigations and the generation task all execute concurrently from the start.

**설명**

This ignores the dependency: the generation subagent would start with no findings to consume because subagents run in isolated contexts and receive only what their prompt contains. Parallel spawning is only appropriate for tasks that are actually independent of one another.

**C.** Spawn the generation subagent first and let it launch the three investigation subagents itself, consuming their results directly.

**설명**

Nesting the investigations inside the generation subagent buries the orchestration where the coordinator can no longer observe or recover from failures, violating the hub-and-spoke pattern. The generation agent still has to wait for all three results, so this adds indirection without improving concurrency.

**D.** Delegate each of the four tasks in its own coordinator turn so results arrive in a guaranteed, predictable order.

**설명**

Fully sequential delegation sacrifices the concurrency available for the three independent investigations, roughly tripling that phase's latency. Ordering only matters for the dependent generation step; the independent work gains nothing from being serialized.

### 전반적인 설명

Parallel subagent execution in the Claude Agent SDK works through the tool-use protocol: a coordinator can include multiple tool_use blocks in a single response with stop_reason: "tool_use", and the harness may execute them concurrently. The runtime does not prescribe an execution order for multiple tool calls, which is precisely why the architect must decide what is safe to parallelize. The documented rule of thumb is that independent, read-only work (like exploring different parts of a codebase) is safe to run concurrently, while work with ordering or data dependencies should be scheduled sequentially. That gives the correct shape here: fan out the three investigations in one turn, collect their results, then delegate generation.

A second constraint reinforces the two-phase structure: context isolation. Each subagent starts with a fresh context and sees only what its prompt contains, so a generation subagent spawned alongside the investigations would have nothing to build from; the coordinator must gather the findings and include them explicitly in the generation subagent's prompt. Fully sequential delegation is safe but wastes the parallelism the independent investigations permit, and nesting the investigations inside the generation subagent moves orchestration out of the coordinator, sacrificing the observability and error handling that make the hub-and-spoke pattern work.

Note that in current SDK versions the subagent-spawning tool is named Agent, with Task retained as a compatible alias. See Parallel tool use and Subagents in the SDK.

### 도메인

Agentic Architecture & Orchestration

## 질문 51

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : This team's agent runs a validation-retry loop: when a structured extraction fails schema or business-rule validation, the failure is fed back for self-correction. Retry budgets are being exhausted on failures that never resolve. Which retry-policy change should the team make?

**A(정답).** Bypass retries when the required information is simply not present in the source file being analyzed.

**설명**

This is correct because self-correction depends on the model re-grounding its output against the source. When the source file never contained the information, no number of retries can produce it, so the loop burns budget without converging; these cases should be routed to a null or escalation path instead.

**B.** Bypass retries when per-item counts fail to sum to the stated total reported elsewhere in the file.

**설명**

Arithmetic inconsistencies are retryable because the model can re-check the individual values against the source when the discrepancy is spelled out in the error feedback. These often resolve on the first corrected pass, so bypassing them wastes the pattern's strength.

**C.** Bypass retries when a date field arrives in a format the schema's pattern constraint rejects.

**설명**

Format errors are the canonical retryable failure, so skipping retries here discards easy wins. When the retry prompt includes the specific validation error, the model can reformat the value it already located in the source, and such issues typically resolve within one or two attempts.

**D.** Bypass retries when a value was placed under the wrong field name in an otherwise valid structure.

**설명**

Structural errors like misplaced values are retryable, so they should stay in the loop. With the source, the failed extraction, and the specific error in the retry request, the model can relocate the value to the correct field on the next attempt.

### 전반적인 설명

The validation-retry pattern works because it turns a validation failure into a targeted correction task: the model receives the source it extracted from, the output it produced, and a concrete error such as a rejected pattern or a mismatched sum. Given all three, it can re-ground the offending value against the source and fix it, which is why format errors, structural errors (values in the wrong field), and arithmetic inconsistencies typically resolve in one or two retries.

The boundary of the pattern is information availability. Retrying only helps when the correct answer exists in the material the model can see. If the required information is absent from the source file, or lives in an external document that was never provided, every retry replays the same impossible task; the model either fails again or, worse, fabricates a plausible value to satisfy the schema. An architect should classify validation failures before retrying: retryable failures get the error-feedback loop with a bounded attempt budget, while absent-information failures should short-circuit to a null result, an optional/nullable field, or a human review queue. This classification is also why schemas should make genuinely optional data nullable, giving the model an honest way to report absence rather than being pressured into invention.

See Agent SDK structured outputs for how JSON Schema validation integrates with agent output.

### 도메인

Prompt Engineering & Structured Output

## 질문 52

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A nightly test-generation batch finishes with most results succeeded, but several hundred entries in the results file carry the result type expired. What should the pipeline do to complete the run?

**A.** Resubmit the full original batch and reconcile duplicates afterward by keeping the earliest result for each custom_id.

**설명**

Each request in a batch is processed independently, so the successful requests do not need to be rerun. Resubmitting everything pays again for work that already completed and adds an unnecessary deduplication step downstream.

**B(정답).** Filter the results file for expired entries by custom_id and resubmit only those requests, unchanged, in a new batch.

**설명**

This is correct because expired means the 24-hour batch window closed before those requests were sent for processing; the request bodies themselves are fine. Since custom_id links each result back to its source request, the pipeline can isolate exactly the expired subset and resubmit it as-is without touching the successful requests.

**C.** Keep polling the original batch, since expired requests stay queued and are processed automatically in a later window.

**설명**

Once a batch reaches its expiration, unsent requests are finalized with the expired result type and will never be processed within that batch. There is no automatic retry mechanism; the client must resubmit them in a new batch.

**D.** Rewrite the request bodies of the expired entries before resubmitting, since expiration signals the requests were malformed.

**설명**

Expiration does not indicate a problem with the request content; it only means the 24-hour processing window elapsed before the request was sent. Malformed content surfaces as an errored result with an invalid_request_error, which is a different result type requiring a fix before resubmission.

### 전반적인 설명

Every request in a Message Batch resolves to one of four result types: succeeded, errored, canceled, or expired. The distinction matters operationally because each type prescribes a different recovery action. Expired specifically means the batch reached its 24-hour processing window before that request was ever sent to the model: nothing about the request was wrong, it simply never ran. The correct recovery is therefore mechanical: identify the expired entries by custom_id, and resubmit exactly those requests, unmodified, as a new batch. Anthropic also documents that errored, canceled, and expired requests are not billed, so the retry only pays for the work that actually needs redoing.

The mental model to hold is that a batch is not an all-or-nothing transaction. Requests are processed independently, so the failure or expiration of some requests never invalidates the results of others; that is precisely why custom_id exists as the correlation key. Results arrive as a .jsonl stream that is not guaranteed to follow submission order, so all mapping between outcomes and source documents flows through custom_id rather than position.

Contrast this with the errored type: there, the handling branches by error class. An invalid_request_error means the request body must be fixed (for example, chunking a document that exceeded the context limit) before resending, while a server error can be retried directly. Rewriting expired request bodies confuses these two categories. Resubmitting the entire batch discards the independence guarantee and reprocesses completed work, and waiting on the original batch misunderstands finalization: an expired request is terminal within its batch and will not be picked up later. See Batch processing and Retrieving Message Batch results.

### 도메인

Prompt Engineering & Structured Output

## 질문 53

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : The repository for this agent keeps orchestration code at the root and the MCP tool implementations under tools/. Strict TypeScript standards must apply everywhere, while error-handling conventions apply only to the tool code. Where should each set of instructions live?

**A.** Put the error-handling conventions in the project root CLAUDE.md and the TypeScript standards in a CLAUDE.md inside the tools/ directory.

**설명**

This inverts the hierarchy. The universal TypeScript standards would only surface when working under tools/, and the tools-only error-handling conventions would load into every session across the repository, adding irrelevant context.

**B(정답).** Put the TypeScript standards in the project root CLAUDE.md and the error-handling conventions in a CLAUDE.md inside the tools/ directory.

**설명**

This matches each convention to the correct level of the hierarchy. Project-level CLAUDE.md loads for every session in the repository, so universal standards always apply, while a directory-level CLAUDE.md scopes the error-handling conventions to work in tools/ without cluttering unrelated sessions.

**C.** Put the TypeScript standards in each developer's ~/.claude/CLAUDE.md and the error-handling conventions in the project root CLAUDE.md.

**설명**

User-level CLAUDE.md files are personal and never travel through version control, so team-wide standards placed there drift or go missing for new teammates. It also elevates directory-specific conventions to project scope, loading them where they do not apply.

**D.** Put both sets in the project root CLAUDE.md, using section headings that state which directory each set of conventions applies to.

**설명**

A root CLAUDE.md loads in full for every session, so the tool-specific conventions would occupy context even when unrelated code is being edited. Headings are prose the model must interpret rather than a scoping mechanism, which is less reliable than placing the conventions at the correct level.

### 전반적인 설명

Claude Code memory is layered: user-level (~/.claude/CLAUDE.md) holds one person's preferences across all projects and is never shared through version control; project-level (a root CLAUDE.md or .claude/CLAUDE.md) is checked in and loads for every session in the repository; directory-level CLAUDE.md files in subdirectories add conventions that apply when working in that part of the tree. The mental model is broad-to-specific: each level narrows scope without repeating what the levels above already say.

The design tradeoff behind the hierarchy is context economy versus coverage. Everything in the root file is loaded into every conversation, and every line competes with every other line for the model's attention, so instructions that matter only in one area dilute the ones that matter everywhere. Placing the TypeScript standards at project level guarantees they shape all work, while a tools/CLAUDE.md keeps the error-handling conventions attached to the code they govern. Remember that CLAUDE.md is guidance the model follows, not enforced configuration; if a rule must be impossible to skip, a hook is the right surface.

The other placements each break one of these properties: inverting the levels makes universal standards conditional and local conventions global; a single monolithic root file loads tool-specific rules into unrelated sessions and relies on headings the model must interpret; and user-level placement unshares team standards entirely, which is the classic cause of a new teammate's sessions ignoring conventions. See Manage Claude's memory for the full hierarchy.

### 도메인

Claude Code Configuration & Workflows

## 질문 54

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : The agent's structured code findings are supposed to carry a detected_pattern annotation, requested through prompt instructions, but many findings omit it and false-positive aggregation keeps breaking. What change guarantees the annotation appears in every finding?

**A.** Lower the sampling temperature to zero so the model emits the annotation deterministically each run.

**설명**

Temperature controls token sampling variability, not schema compliance. A zero temperature makes outputs more repeatable but does not create any structural obligation to include a field the schema does not require.

**B.** Set additionalProperties to true on the finding object so the annotation field is always permitted.

**설명**

Permitting extra properties does not require any field to appear, so omissions would continue. Additionally, Anthropic's supported JSON Schema subset requires additionalProperties to be false for schema-constrained objects, so this configuration is not supported.

**C.** Restate the annotation instruction in the system prompt and again at the start of every user turn.

**설명**

Prompt instructions improve the odds that the model includes the field but remain probabilistic; they cannot guarantee presence on every finding. The intermittent omissions in the scenario are the direct evidence that instruction emphasis is insufficient here.

**D(정답).** Define detected_pattern in each finding's JSON schema and include it in the required list.

**설명**

Structured output only guarantees fields that are represented in the schema itself. Making detected_pattern a schema field and marking it required means every conforming finding must carry the value, which is exactly the guarantee prompt instructions alone cannot provide.

### 전반적인 설명

The mental model to hold is that structured output enforces the shape of what Claude produces, and only for fields the schema actually declares. When a finding schema defines detected_pattern and lists it under required, every extraction that conforms to the schema must carry the value; there is no run where the model can simply forget it. Anything requested only in prose sits outside that guarantee: the model usually complies, but compliance is probabilistic, which is precisely why the annotation was arriving intermittently.

This distinction matters for the false-positive workflow the field exists to support. Aggregating dismissed findings by detected_pattern only works if the field is present on every record; gaps in the data silently bias the analysis toward whichever detection behaviors happened to get annotated. Moving the field from instruction to schema turns a best-effort annotation into a dependable analytic dimension.

The distractors fail for characteristic reasons. Repeating the instruction with more emphasis is the classic pattern of trying to solve a structural problem with prompt pressure; it narrows the failure rate without eliminating it. Setting additionalProperties to true confuses permitting a field with requiring it, and the documented schema subset requires additionalProperties to be false for constrained objects in any case. Temperature adjustments govern sampling randomness, not structural obligations, so a deterministic decoder can still deterministically omit an optional field. See Structured outputs for how schema-declared fields, required, and additionalProperties interact.

### 도메인

Prompt Engineering & Structured Output

## 질문 55

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : A teammate sets context: fork on a skill whose entire body is a list of API-convention guidelines, hoping to save main-session tokens. Invocations now complete but return nothing useful. What is the correct fix?

**A.** Expand allowed-tools so the forked subagent can read the codebase and gather the context it lacks.

**설명**

Tool access is not the constraint here; the subagent has no instruction telling it what to accomplish with any tools. Widening allowed-tools cannot turn passive convention text into an actionable prompt.

**B(정답).** Remove context: fork so the guideline content loads inline; forking suits skills that define an explicit task.

**설명**

In a forked skill, the SKILL.md content becomes the prompt that drives the subagent. A body containing only passive guidelines gives the subagent no actionable task, so it produces no meaningful output. Guideline content should run inline so Claude applies it alongside the conversation.

**C.** Set the agent frontmatter field to Explore so the fork runs with a leaner built-in subagent configuration.

**설명**

The agent field only selects which subagent configuration executes the fork; it does not change what the skill body asks the subagent to do. A guideline-only body still contains no task for any agent type, so the output remains empty.

**D.** Add an argument-hint entry so invocations prompt for the missing parameters before the fork starts.

**설명**

argument-hint prompts developers for arguments when a skill is invoked bare, which helps parameterized workflows. The failure here is not missing arguments; the skill body itself contains no task for the forked subagent to perform.

### 전반적인 설명

The mental model for context: fork is that it changes what the skill body is. An ordinary skill loads its content inline, where Claude reads it alongside the live conversation and applies it as guidance. A forked skill instead spins up a subagent whose entire prompt is the SKILL.md content, with no access to the main conversation history. That isolation is the feature: verbose intermediate work stays in the subagent, and only its result returns to the main session.

The tradeoff is that the body must therefore be an explicit task. Anthropic's documentation warns that forking a skill containing only passive guidance, such as "use these API conventions", hands the subagent nothing actionable, so the fork returns no meaningful output. Passive conventions belong in a non-forked skill that loads inline, or in project memory like CLAUDE.md, where they shape work already happening in context; forking is for self-contained workflows like analysis or generation tasks.

The distractors each adjust a real frontmatter mechanism that cannot address this failure. Choosing a different agent type changes the executing subagent's configuration, not the emptiness of its task. argument-hint solves bare invocations that lack parameters, and allowed-tools bounds what a skill may invoke; neither converts guidance prose into a runnable prompt. See Agent Skills in Claude Code for the forked-skill execution model.

### 도메인

Claude Code Configuration & Workflows

## 질문 56

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : Logs show the agent spends several exploratory tool calls each session probing which return policies and escalation categories exist before working the actual request. Which TWO changes correctly use MCP resources to remove this discovery overhead? (Select TWO.)

**A.** Convert process_refund into an MCP resource so its refund-processing logic is available as readable reference data.

**설명**

Processing a refund is an action with side effects, and MCP separates the primitives deliberately: tools perform actions, resources expose data for reading. Turning an action into a resource misuses the protocol and would leave the agent unable to actually execute refunds through it.

**B(정답).** Expose the return-policy catalog (policy names, eligibility windows, covered categories) as a readable MCP resource.

**설명**

A policy catalog is data the agent needs to read, not an action to perform, which is exactly what MCP resources are designed to expose. Publishing it as a resource gives the agent an immediate map of available policies without spending tool calls on discovery.

**C(정답).** Publish the escalation-category taxonomy and its category descriptions as an MCP resource read at session start.

**설명**

The set of valid escalation categories is reference context, so it belongs in the resource primitive rather than behind exploratory tool calls. Reading the taxonomy once at session start replaces repeated probing with a single lookup.

**D.** Paste the full policy catalog and escalation taxonomy into the agent's system prompt so lookups are never needed.

**설명**

Hard-coding the inventory into the prompt goes stale the moment policies or categories change, reintroducing the ambiguity the catalogs were meant to remove. It also inflates every request with static text that a resource could serve on demand.

### 전반적인 설명

The Model Context Protocol splits server capabilities into distinct primitives on purpose. Resources are application-controlled data exposed for reading, comparable to GET endpoints: file contents, database schemas, policy catalogs, task summaries. Tools are model-controlled functions that take actions, comparable to POST endpoints: executing a query, processing a refund. The mental model is that resources tell the agent what exists, while tools let it do something about it.

This division exists to solve exactly the problem in this situation: without a catalog, an agent must spend its budget on exploratory calls just to learn what data and categories are available, burning turns and context before real work begins. Exposing the return-policy catalog and the escalation taxonomy as resources turns discovery into a single read, so the agent starts every session already knowing the terrain, which directly supports a first-contact resolution target.

Repurposing process_refund as a resource inverts the primitives: refund processing has side effects and must remain a tool, since resources cannot execute actions. Hard-coding the catalogs into the system prompt appears to eliminate lookups, but it freezes a snapshot that drifts from reality as policies change; a resource stays current because the server serves the live inventory on each read. See MCP Resources and MCP Tools for the primitive definitions.

### 도메인

Tool Design & MCP Integration

## 질문 57

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The team wants to move its weekly re-analysis of the archived document corpus to the Message Batches API, with the synthesized report due Monday mornings. Which TWO design decisions are correct? (Select TWO.)

**A(정답).** Submit the batch at least 24 hours before the Monday deadline, since processing carries no latency guarantee inside the 24-hour window.

**설명**

Batches can take up to 24 hours to complete and Anthropic provides no latency SLA, so meeting a hard deadline requires backing the submission time off by the full processing window. This is the documented way to plan batch cadence against a delivery commitment.

**B.** Have the synthesis subagent consume results incrementally as each document's analysis streams back before the whole batch completes.

**설명**

The Message Batches API does not stream individual results as they finish; results become accessible when all requests in the batch complete or after 24 hours, and are retrieved as a results file. A synthesis stage cannot be designed around per-document incremental delivery.

**C(정답).** Map each result back to its source document using the custom_id assigned at submission, since results can arrive out of input order.

**설명**

Batch results are not guaranteed to come back in submission order, so positional matching is unreliable. The custom_id field on each request is the documented mechanism for correlating every result with the document that produced it.

**D.** Schedule submission for overnight low-traffic hours, when batches are documented to finish within one hour, so a morning deadline is safe.

**설명**

Although most batches finish in under an hour, Anthropic documents no completion guarantee at any time of day; a batch may take up to 24 hours regardless of when it is submitted. Planning a same-morning deadline around a one-hour assumption risks missing the report entirely.

### 전반적인 설명

A weekly corpus re-analysis is exactly the profile the Message Batches API is designed for: a large volume of independent requests, no one waiting on an immediate answer, and a 50% cost reduction as the reward for tolerating asynchrony. The tradeoff the API makes is explicit: you give up any latency guarantee (most batches finish in under an hour, but the documented bound is up to 24 hours, after which unfinished work expires) in exchange for the discount. That asymmetry drives the two design decisions here.

First, deadline planning must assume the worst-case window. If the report is due Monday at 09:00, the batch must be submitted no later than Sunday at 09:00; anything tighter is betting the deadline on typical rather than guaranteed behavior. Submitting during quiet hours does not change this: there is no documented time-of-day completion guarantee. Second, correlation must be explicit. Batch results can return out of input order, so each request's custom_id is the designed mechanism for mapping an analysis back to its source document, and it also enables resubmitting only the requests that failed rather than the whole corpus.

The incremental-consumption design fails because batches are not a stream: results are retrieved as a single .jsonl file once the batch reaches its processing_status: "ended" state (or the 24-hour limit passes), and clients poll for that state rather than receiving per-request pushes. A downstream synthesis stage should therefore be triggered on batch completion, not woven into partial delivery. See Batch processing for the documented latency behavior, result handling, and custom_id semantics.

### 도메인

Prompt Engineering & Structured Output

## 질문 58

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : Your refinement loop re-delegates investigation whenever the evaluator flags gaps in a draft resolution, but the re-delegated subagents return generic findings and second drafts repeat the same omissions. Which two changes fix the loop? (Select two.)

**A(정답).** Pass the evaluator's specific gap descriptions along with prior investigation findings in each re-delegation prompt.

**설명**

Subagents run with isolated context and see only what their prompt contains. Unless the flagged gaps and the findings gathered so far are explicitly included, the re-delegated subagent has no idea what is missing and can only produce generic output.

**B.** Give the investigation subagents shared access to the coordinator's conversation history so they can see the flagged gaps.

**설명**

No such shared-history mechanism exists; subagents do not inherit the coordinator's conversation and cannot browse it. The only channel for conveying the flagged gaps is explicit inclusion in the subagent's prompt.

**C(정답).** Re-run synthesis over the combined original and newly gathered findings, then re-evaluate the merged draft for completeness.

**설명**

A refinement loop only converges if the new findings are actually merged into a fresh draft and that draft is checked again against the completeness criteria. Without re-synthesis and re-evaluation, targeted investigation results never reach the customer-facing resolution.

**D.** Have the evaluator fill the flagged gaps itself from general policy knowledge, skipping a second investigation round.

**설명**

Gaps in a support resolution concern customer-specific facts such as order status and billing records, which must come from tool calls against backend systems. Padding them from general knowledge produces ungrounded, potentially incorrect commitments to the customer.

### 전반적인 설명

An iterative refinement loop has three moving parts: an evaluator that compares the draft against explicit completeness criteria, targeted re-delegation that dispatches follow-up work aimed at the specific gaps, and a re-synthesis step that folds the new findings into a fresh draft before evaluating again. The failure described here, generic follow-up findings and repeated omissions, points at breaks in the second and third parts.

The re-delegation break comes from a core property of subagents in the Claude Agent SDK: each subagent runs in its own isolated context and receives nothing from the coordinator except the prompt it is given. A mental model that helps: if the coordinator did not put it in the prompt, it does not exist for that subagent. So a re-delegation prompt must carry the evaluator's concrete gap descriptions plus the relevant findings already gathered; only then can the subagent aim its tool calls at what is actually missing. This isolation is a deliberate design tradeoff, keeping verbose investigation out of the coordinator's context window at the cost of requiring explicit handoffs. The distractor proposing shared access to the coordinator's history imagines a mechanism the architecture intentionally does not provide.

The re-synthesis break is subtler: even perfect follow-up findings change nothing unless the coordinator re-invokes synthesis over the combined old and new material and re-checks the merged draft. Detection without a repair-and-recheck cycle is measurement, not refinement. Letting the evaluator invent content to fill gaps is worse still, because support resolutions depend on customer-specific facts (order state, billing records, refund eligibility) that only backend tools can verify; fabricated policy details directly threaten first-contact resolution quality.

See Create custom subagents and Anthropic's Building effective agents for the context-isolation model and the evaluator-optimizer loop pattern.

### 도메인

Agentic Architecture & Orchestration

## 질문 59

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : The agent aggregates raw Grep and Read output from 12 modules into a roughly 100K-token synthesis input. Findings from modules in the middle of the aggregate are consistently missing from the final overview. Which TWO changes counteract this? (Select TWO.)

**A.** Route synthesis to a model with a larger context window so the entire 100K-token aggregate fits with substantial headroom remaining.

**설명**

The aggregate already fits in the context window; the failure is degraded recall from middle positions, not truncation. Fitting content within the window, even with headroom, does not guarantee reliable retrieval from every position, so this change does not address the observed omissions.

**B.** Rotate the order of module sections between runs so no single module always occupies the middle position of the aggregate.

**설명**

Rotation only changes which modules are missed on a given run; some modules still sit in the weakly attended middle every time. It distributes the failure across runs rather than eliminating it, so any individual overview remains incomplete.

**C(정답).** Place a digest of key findings at the start of the aggregate and label each module's details with an explicit section heading.

**설명**

Putting a key-findings digest at the beginning positions critical information where models attend most reliably, and explicit section headings give the model structural anchors for navigating mid-input content. This directly mitigates the tendency to miss material buried in the middle of long inputs.

**D(정답).** Have investigation subagents return condensed structured findings rather than raw Grep and Read output before synthesis.

**설명**

This attacks the problem at its source: recall degrades as input token count grows, so replacing raw exploration dumps with distilled structured findings shrinks the aggregate to a size the model processes reliably. Less low-relevance bulk in the middle means fewer findings positioned where attention is weakest.

### 전반적인 설명

Anthropic describes long-context degradation as context rot: the context window is the model's working memory, but more context is not automatically better, and accuracy and recall degrade as token count grows. Layered on top of that is a positional bias, often called the lost-in-the-middle effect: content at the beginning and end of a long input is processed more reliably than content in the middle. A 100K-token aggregate of raw Grep and Read output triggers both failure modes at once: the input is large, and most of it is low-relevance bulk that pushes genuine findings into the weakly attended middle.

The effective response works on both dimensions. Reducing volume at the source, by having investigation subagents return condensed structured findings rather than raw tool output, shrinks the input so less material sits in degraded positions at all; this is generally preferable to compressing after the fact, because the subagent still has full fidelity when it decides what matters. Position-aware ordering then exploits the bias rather than fighting it: a key-findings digest at the start lands the most important claims in the most reliably processed region, and explicit section headings give the model structural signposts that improve attention to detailed content deeper in the input.

The other approaches misdiagnose the failure. A larger context window addresses truncation, but nothing here was truncated; degraded middle recall persists regardless of headroom. Rotating section order merely randomizes which modules are dropped on each run, so every individual synthesis remains incomplete. See Context windows and Anthropic's long-context prompting guidance for the underlying behavior and structuring techniques.

### 도메인

Context Management & Reliability

## 질문 60

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : The agent extracts order IDs reliably from plain requests but often selects the wrong one in forwarded threads and pasted receipts that quote IDs from earlier orders. Detailed instructions have not helped. What is the most effective change?

**A.** Lower the sampling temperature so the agent processes every message format in a deterministic, uniform way.

**설명**

Temperature affects how varied token selection is, not whether the model knows how to pick the relevant identifier inside an unfamiliar document structure. A lower temperature makes the same format-dependent mistakes more repeatable, not more correct.

**B(정답).** Add a few targeted examples showing which order ID to extract from each message format, with brief rationale for each.

**설명**

Few-shot examples are the documented remedy when detailed instructions fail to produce consistent handling of varied input structures. Showing a forwarded thread and a pasted receipt with the correct ID chosen among the quoted ones, plus the reasoning, teaches the model the judgment for each structure, and it generalizes to new format variations rather than merely repeating the examples.

**C.** Add a preprocessing step that uses regular expressions to pull order identifiers from messages before the agent reads them.

**설명**

Regular expressions can surface every string that matches the order ID format, but the forwarded threads and receipts quote several IDs from earlier orders. Deciding which one the customer is actually asking about is a semantic judgment about the message, which pattern matching cannot make.

**D.** Rewrite the instruction with stronger emphasis, telling the agent to scan the entire message for identifiers before acting.

**설명**

Intensifying prose instructions adds emphasis without adding operational content. The stem states that detailed instructions already failed, and stronger wording does not demonstrate how to tell the customer's current order ID apart from IDs quoted from earlier orders, so the inconsistency persists.

### 전반적인 설명

This is the classic case where few-shot prompting outperforms further instruction refinement. When inputs arrive in structurally different forms (a plain sentence, a forwarded email with quoted headers, a pasted receipt table), the difficulty is not that the model lacks a rule; it is that no prose rule can enumerate where the relevant value sits in each structure or which of several quoted candidates is the one the customer means. A small set of 2-4 examples, one per format, each showing the input, the correct extraction, and a short rationale, demonstrates the judgment directly. The model then generalizes the pattern to formats it has not seen, which is precisely the documented strength of examples for extraction from varied document structures.

The mental model to carry: instructions describe behavior in the abstract, while examples enact it. When detailed instructions already exist and output is still inconsistent across input shapes, adding more or louder instructions rarely moves the needle, because emphasis carries no new information about what correct handling looks like. Sampling temperature is similarly beside the point: it controls output variability, not the model's understanding of which order ID in a quoted thread is relevant. And regex preprocessing solves only half the problem here: a pattern can surface every candidate ID in a message, but it cannot decide which of several quoted IDs matches the customer's current request; that disambiguation is exactly the judgment the examples teach.

See Use examples (multishot prompting) to guide Claude's behavior for guidance on structuring effective examples.

### 도메인

Prompt Engineering & Structured Output