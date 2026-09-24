# Practice Test 4

## 질문 1

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The extraction tool returns the message "Operation failed" both when a document genuinely contains no line items and when the document parser times out. The agent retries empty documents endlessly and abandons timed-out ones. What is the correct fix?

**A.** Retry all failures inside the tool itself and return an empty list once retries are exhausted, so the agent always receives a result.

**설명**

Returning an empty list after exhausted retries is silent error suppression: the agent cannot tell a document with no line items from a document that was never successfully parsed. Downstream systems would then record missing data as legitimately absent, corrupting extraction accuracy.

**B.** Add a system prompt rule instructing the agent to retry any extraction failure at most twice before moving to the next document.

**설명**

A uniform retry cap treats both situations identically, so the agent still wastes attempts on documents that legitimately have no line items and still gives up on timeouts that a later retry would resolve. Prompt guidance cannot compensate for a tool response that carries no information about the cause.

**C.** Append a retry-count field to the "Operation failed" message so the agent can track attempts and stop after a fixed threshold.

**설명**

Counting attempts limits the damage but does not tell the agent whether retrying makes sense at all. The core defect, that the response conflates a valid empty result with an access failure, remains, so recovery behavior stays disconnected from the actual cause.

**D(정답).** Return a successful result with an empty list when no line items exist, and a transient, retryable error when the parser times out.

**설명**

This is correct because the two situations require opposite handling: a document with no line items is a valid empty result and should be reported as success, while a parser timeout is a transient access failure that should be flagged as an error worth retrying. Separating them at the tool interface gives the agent the signal it needs to stop retrying empty documents and start retrying timeouts.

### 전반적인 설명

This situation combines two distinct problems that a generic error message conflates. A document that contains no line items is not a failure at all: the tool ran correctly and found nothing, so the honest response is a successful result with empty data. A parser timeout is an access failure: the tool never got a chance to examine the document, so the data may well exist and a retry is worthwhile. When both conditions surface as the identical string "Operation failed", the agent has no basis for choosing between retrying and moving on, which is exactly why its behavior inverts (retrying valid emptiness, abandoning recoverable timeouts).

The mental model to hold is that tool responses are the agent's only window into what happened at execution time. Anthropic's guidance is explicit that error content should say what went wrong and what Claude should try next, rather than a bare "failed"; for genuine failures, structured metadata such as an errorCategory of transient and isRetryable: true makes the recovery decision computable instead of guessed. Equally important is the boundary of what counts as an error: marking valid empty results as failures is as damaging as marking failures as success, because both misstate reality to the agent.

The remaining approaches all leave the conflation in place. Absorbing retries inside the tool and emitting an empty list turns unparsed documents into apparently empty ones, an anti-pattern that converts failure into misinformation for downstream systems. A blanket prompt rule capping retries applies one policy to two situations that need opposite policies. A retry counter bounds wasted effort without ever telling the agent whether effort is warranted.

See Handle tool calls for the documented pattern of returning informative, actionable error content instead of generic failure strings.

### 도메인

Tool Design & MCP Integration

## 질문 2

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : Logs show the coordinator dispatched three search subagents with the identical prompt "research the impact of remote work." Their outputs heavily overlap on productivity studies, while labor policy and real estate effects go uncovered. Which change fixes both problems?

**A.** Increase the number of parallel search subagents so that more angles of the topic are covered across independent runs.

**설명**

Spawning more subagents with the same vague prompt multiplies the failure rather than fixing it: each new agent still lacks boundaries, so they tend to converge on the same prominent subtopics. Coverage improves through deliberate partitioning of the research space, not through headcount.

**B.** Add a coordinator deduplication pass that merges overlapping subagent findings before they reach the synthesis subagent.

**설명**

Deduplication only treats one symptom after tokens have already been spent on redundant work. It does nothing about the coverage gaps, since merging overlapping productivity findings cannot produce the labor policy and real estate research that no subagent performed.

**C(정답).** Give each search subagent a distinct objective with explicit task boundaries and guidance on which sources and subtopics to cover.

**설명**

This is correct because the root cause is vague, undifferentiated delegation: identical prompts give subagents no way to divide the research space, so they gravitate to the same prominent subtopic while other areas go untouched. Detailed task descriptions with distinct objectives and boundaries prevent both duplication and coverage gaps before any work begins.

**D.** Have subagents share their current focus areas with each other during execution so they can avoid investigating the same subtopics.

**설명**

Runtime focus-sharing is a reactive workaround: agents would negotiate a division of labor mid-flight that the coordinator should have established clearly at delegation time. It adds coordination overhead without guaranteeing that neglected subtopics like labor policy or real estate actually get assigned to anyone.

### 전반적인 설명

In an orchestrator-workers architecture, the coordinator is not just a dispatcher; it is the component responsible for dividing a broad research topic into distinct, well-bounded subtasks. Each subagent starts from the delegation prompt it receives, so that prompt is the primary lever that separates one worker's effort from another's. When every subagent gets the same vague instruction, nothing partitions the research space: each agent independently picks the most salient thread (here, productivity studies), producing near-duplicate output while entire subtopics go unresearched.

Anthropic documented exactly this failure mode while building its own multi-agent research system: a broad instruction like "research the semiconductor shortage" led subagents to duplicate work on the same angle while other aspects went uncovered. The remedy is that the lead agent should give each subagent a clear objective, an output format, guidance on tools and sources, and explicit task boundaries. This front-loads the division of labor into the delegation itself, which is the one channel the coordinator fully controls.

The distractors each miss the root cause. A deduplication pass discards redundant findings after the cost is paid and cannot conjure missing coverage. Adding more identically prompted subagents scales the duplication, since nothing steers them apart. Peer-to-peer focus sharing, even where a mechanism for it exists, is reactive: it asks agents to repair an unclear division of labor mid-run instead of the coordinator defining crisp, non-overlapping assignments up front, and it still does not ensure that unassigned subtopics get covered. See How we built our multi-agent research system and Building effective agents.

### 도메인

Agentic Architecture & Orchestration

## 질문 3

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : A developer copies a team's draft-report project skill to ~/.claude/skills/draft-report/ to customize it personally. They want to invoke their variant as /report-helper while leaving the team's /draft-report command untouched. What should they do?

**A.** Restart Claude Code so the session re-reads the frontmatter and registers /report-helper as the command.

**설명**

This is incorrect. Skill directories are watched during local sessions, so changes are picked up without a restart in the normal case. More fundamentally, no restart would make /report-helper work, because the frontmatter name never becomes the command name for personal skills.

**B(정답).** Rename the personal skill directory to ~/.claude/skills/report-helper/, keeping SKILL.md inside it.

**설명**

This is correct. The slash command for personal and project skills is derived from the skill's directory name, so a directory named report-helper produces /report-helper. Renaming also removes the name collision in which the personal draft-report skill would override the team's project skill of the same name.

**C.** Move the variant into the project's .claude/skills/report-helper/ directory so the new command is recognized.

**설명**

This is incorrect. Placing the variant in project scope defeats the purpose of a personal customization, since project skills can be committed to version control and would then appear for teammates. Personal workflows belong under ~/.claude/skills/ with a distinct directory name.

**D.** Set name: report-helper in the SKILL.md frontmatter, which changes the command that invokes the skill.

**설명**

This is incorrect. For personal and project skills, the frontmatter name field changes only the display label, not the invocable command. The command would remain /draft-report, and the personal skill would continue to shadow the team's project skill because personal skills take precedence in name conflicts.

### 전반적인 설명

Claude Code skills are directories containing a SKILL.md file, and for both personal skills (~/.claude/skills/) and project skills (.claude/skills/) the invocable slash command is derived from the directory name, not from any frontmatter field. A skill at ~/.claude/skills/report-helper/SKILL.md is invoked as /report-helper; the frontmatter name field changes only the display label and never participates in command resolution.

The directory name matters twice here. Beyond controlling the command, it also governs conflict resolution: when skills at different levels share a name, precedence runs enterprise over personal over project. A personal draft-report skill would therefore silently override the team's project skill, which is exactly why the documented pattern for personal variants is to give them a distinct directory name rather than reusing the shared one.

The other actions miss the mechanism. Editing frontmatter renames the label while leaving both the command and the shadowing problem in place. Restarting is unnecessary because skill directories are watched during local sessions (a restart is needed only if the top-level skills directory did not exist when the session started), and a restart cannot turn a display label into a command. Moving the variant into project scope makes the command work but puts a personal workflow where it can be committed and shared, affecting the very teammates the customization was meant to avoid. See the Claude Code skills documentation for command naming and precedence rules.

### 도메인

Claude Code Configuration & Workflows

## 질문 4

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : The team adds a same-session self-review step in which the agent re-examines its own refund decisions before executing them. The step reliably fixes formatting and completeness gaps but almost never overturns a questionable refund decision. What architectural change best addresses this limitation?

**A.** Run the same-session review pass at a lower sampling temperature so the second look applies more conservative judgment to each decision.

**설명**

Temperature governs token sampling variability, not whether the model challenges its prior conclusions. A review conducted inside the same session still sees and defers to the reasoning that produced the decision regardless of sampling settings.

**B.** Grant the review step direct access to the MCP lookup tools so it can re-verify the customer and order data behind each refund decision.

**설명**

The failure is not missing data; the same-session review already has the customer and order details in context. Re-fetching the same facts does not counteract the bias toward confirming conclusions the model has already reasoned its way to.

**C(정답).** Route questionable refund decisions to an independent review instance that starts without the generator's reasoning context.

**설명**

This is correct. A same-session review retains all the reasoning that led to the original decision, so the model treats those conclusions as established rather than re-deriving the judgment. An independent instance without that generation context brings fresh eyes, mirroring human peer review, and is far more likely to challenge a questionable decision.

**D.** Trigger context compaction before the review step so the summarized history frees the agent to reconsider its earlier refund reasoning.

**설명**

Compaction summarizes history to manage the context budget; it is not a reliable way to strip out the decision rationale, and the summary typically preserves the conclusions the review would need to question. Isolation is achieved by running the review in a separate instance, not by lossy summarization inside the same session.

### 전반적인 설명

The pattern described is the documented self-review limitation: when a model reviews output within the same session that generated it, its context window still contains the full chain of reasoning that led to the decision. From the model's perspective, those conclusions are already justified, so the review pass tends to confirm rather than re-derive them. This is why same-session self-critique works well for mechanical checks (missing fields, formatting, completeness against a rubric) but rarely reverses a judgment call such as a borderline refund: catching a formatting gap requires no contradiction of prior reasoning, while overturning the decision does.

The useful mental model is that self-review inside one session is closer to an author proofreading their own draft than to peer review. It shares the author's assumptions. That is also why remedies applied inside the same session do not move the needle: lowering temperature changes sampling noise, not the anchoring to prior reasoning; compaction summarizes the history rather than reliably removing the rationale; and extra tool access re-fetches facts the review already has. The problem is the presence of the generation context itself, so the fix is structural: send the decision to a reviewer that never saw that context.

Architecturally, this is why review pipelines route drafts to an independent instance that starts without the generator's reasoning, mirroring how human peer review works. Anthropic's guidance on agent design covers this evaluator pattern in Building Effective Agents, and Subagents describes how separate contexts provide exactly this kind of isolation.

### 도메인

Prompt Engineering & Structured Output

## 질문 5

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : Despite a CLAUDE.md rule stating "never push directly to main," logs show Claude Code occasionally pushed to main during long autonomous refactoring sessions. The team needs this rule to hold on every run. What should they implement?

**A.** Package the rule into an Agent Skill whose description triggers whenever Claude performs git operations.

**설명**

Skills are still instructions the model reads and follows, so they inherit the same probabilistic compliance as CLAUDE.md. Scoping the rule to git tasks improves relevance but does not make it impossible to violate.

**B.** Move the rule to the top of CLAUDE.md, mark it IMPORTANT, and restate it in every session's first prompt.

**설명**

Emphasis and repetition raise the rule's priority relative to other instructions, but CLAUDE.md remains guidance the model follows probabilistically. The scenario shows prompt instructions already failed occasionally, and this change only shifts the odds rather than eliminating the failure mode.

**C(정답).** Add a PreToolUse hook that inspects Bash commands and rejects any push targeting the main branch.

**설명**

This is correct because a PreToolUse hook executes as code before the tool call runs, so a violating push can never execute regardless of what the model intends. Hooks provide the deterministic guarantee that instruction-based approaches cannot.

**D.** Require every session to run in plan mode so proposed git operations are reviewed before execution.

**설명**

Plan mode is a read-only research phase, and once the team approves a plan and execution begins, nothing in plan mode prevents a later push to main. It also imposes heavy friction on all work to address one rule and still depends on a human catching the issue.

### 전반적인 설명

This question tests the core distinction between prompt guidance and programmatic enforcement. Anything expressed as natural-language instruction, whether in CLAUDE.md, a skill, or the session prompt, competes for the model's attention with every other instruction in context, and compliance is probabilistic: usually followed, occasionally not. When a rule has real consequences (protecting the main branch, financial thresholds, identity verification before sensitive operations), "usually" is not an acceptable guarantee, and the observed occasional violations in production are exactly the expected failure signature of instruction-based enforcement.

A PreToolUse hook changes the enforcement model entirely. It is code that fires before every matching tool call; the hook can inspect the Bash command and, by returning a deny decision or exiting with code 2, block the call so it never executes. The model cannot skip, forget, or reinterpret a hook, which is why the mental model is: instructions are requests, hooks are gates. The engineering tradeoff is that hooks are rigid and require maintenance, so they should be reserved for the small set of rules where any violation is unacceptable, while CLAUDE.md and skills carry conventions and preferences where flexibility matters.

Strengthening the CLAUDE.md rule or moving it into an Agent Skill keeps enforcement on the instruction side of that line, so a non-zero failure rate persists. Mandating plan mode adds a human review step for planning, but plan mode is read-only research; it does not intercept commands once execution begins, and it trades one probabilistic safeguard (model compliance) for another (human vigilance).

See Claude Code hooks reference and Get started with Claude Code hooks for how PreToolUse matchers and blocking decisions work.

### 도메인

Agentic Architecture & Orchestration

## 질문 6

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : Your legal team requires that the web search subagent never fetch content from a list of embargoed domains. In testing, system prompt instructions still allow an occasional fetch to slip through. What enforcement design guarantees compliance?

**A.** Add few-shot examples of refusing embargoed-domain requests and instruct the subagent to verify each URL against the list before fetching.

**설명**

Few-shot examples and self-verification instructions are still prompt guidance: the model applies them probabilistically, and nothing in the pipeline stops a violating call it produces anyway. These techniques can lower the violation rate, but they cannot provide the guarantee a compliance requirement demands.

**B.** Add the embargoed domain list to the fetch tool's description and restate the restriction in bold at the top of the subagent's system prompt.

**설명**

Tool descriptions and system prompt instructions are guidance the model follows probabilistically, not code that executes. The scenario already shows prompt-based instructions letting occasional violations through, and adding emphasis reduces the failure rate without eliminating it.

**C(정답).** Register a PreToolUse hook that inspects each fetch call's tool input and returns a deny decision with a reason when the URL matches an embargoed domain.

**설명**

This is correct because PreToolUse fires before the tool executes, so the hook can inspect tool_name and tool_input and return a deny permission decision, guaranteeing the embargoed fetch never runs. Including a reason with the denial tells the model why the call was blocked so it can adjust its approach. Code-level interception provides the deterministic guarantee that prompt instructions cannot.

**D.** Register a PostToolUse hook that scans each fetch call's returned content and strips any material from embargoed domains before the model consumes it.

**설명**

PostToolUse runs only after the tool has already executed successfully, so the fetch to the embargoed domain has already happened by the time the hook fires. Stripping content afterward may hide the data from the model, but it cannot prevent the prohibited request itself, which is what the compliance rule demands.

### 전반적인 설명

This question tests the core distinction between programmatic enforcement and prompt guidance. In the Claude Agent SDK, hooks are code that runs at fixed points in the agent lifecycle. A PreToolUse hook fires when the model requests a tool call but before your harness executes it. The callback receives the request details, including tool_name and tool_input, and can return a permissionDecision such as "allow", "deny", "ask", or "defer", along with a permissionDecisionReason that is fed back to the model when a call is denied. Because this check executes as code on every matching call, a violating fetch can never reach the network; the guarantee is deterministic, which is what compliance and legal requirements demand.

The mental model is a pipeline: the model proposes an action, the hook adjudicates it, and only then does the harness execute it. PostToolUse sits on the other side of execution, which makes it the right place to log, trim, or normalize results the model will consume, but structurally incapable of preventing an action that has already run. Prompt-based approaches (tool descriptions, emphasized instructions, few-shot examples, self-verification steps) shape the model's behavior and are valuable for reducing violation frequency, but they remain probabilistic; the scenario's testing evidence shows exactly that residual failure mode. Asking the model to check its own URLs adds another instruction it usually follows, not a gate it cannot bypass.

The general rule: when a violation has legal, financial, or safety consequences, enforce it in a hook; when the rule is a preference or a nuance, prompts are appropriate. See the Agent SDK hooks documentation for the PreToolUse event, its input fields, and the permission decision output shape.

### 도메인

Agentic Architecture & Orchestration

## 질문 7

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : process_refund rejects a request with isError: true, errorCategory: "business", retriable: false, and the message "Order 8841 is outside the 30-day returns window; no automatic refund is possible." What should the agent do next in the conversation?

**A.** Invoke escalate_to_human immediately with the error details, since the refund cannot be completed autonomously.

**설명**

A clear, well-explained policy refusal is within the agent's scope to communicate; escalation triggers are explicit customer requests, policy gaps, or inability to make progress. Handing off silently before the customer has even heard the reason adds load to human agents and hurts first-contact resolution.

**B.** Retry process_refund once with slightly adjusted request parameters in case the returns-window check produced a false rejection.

**설명**

The retriable: false flag exists precisely to prevent this. A policy violation is not an input problem; no reformulation of the parameters will move the order back inside the returns window, so retrying wastes a turn and a tool call.

**C.** Tell the customer a temporary system issue blocked the refund and suggest they contact support again later.

**설명**

This misrepresents a deliberate policy refusal as a transient failure, which is exactly the confusion the errorCategory field eliminates. It also invites the customer to retry a request that will always be refused, guaranteeing a repeat contact.

**D(정답).** Relay the returns-window explanation to the customer and offer escalation if they want an exception reviewed.

**설명**

This is the behavior the error was designed to enable. A business error with retriable: false and a customer-friendly message tells the agent the refusal is final at the tool level, so the correct move is to explain the policy to the customer and surface the remaining path forward, which preserves first-contact resolution.

### 전반적인 설명

Structured error metadata is a two-sided contract: the tool author encodes the decision, and the agent must act on it correctly. The errorCategory tells the agent what kind of failure occurred, and for a business error the pairing of retriable: false with a plain-language message means: do not attempt the call again, and use this text to inform the customer. The agent's job at that point is conversational, not operational; it relays the policy reason and presents whatever legitimate paths remain, such as offering to escalate if the customer wants an exception considered.

It is worth understanding what the flag actually is. retriable is not a field Anthropic's platform enforces; the documented protocol-level signal is is_error on the tool result (or isError in MCP-style results). Fields like errorCategory and retriable are application-level metadata carried inside the result content, and they work because the model reads them and reasons about them. That is why the accompanying message matters so much: Anthropic's guidance on handling tool calls explicitly recommends error messages that state what went wrong and what to do next, rather than terse failures the model must guess about.

The wrong moves each break the contract in a different way. Retrying a non-retryable business refusal treats a policy decision as noise and can never succeed. Reporting the refusal as a temporary system issue is worse than unhelpful: it converts accurate information into misinformation and sets the customer up for a futile second contact. Escalating immediately, without first explaining the outcome, skips the communication step the error message was written to support; escalation belongs where policy is ambiguous, the customer asks for a human, or the agent genuinely cannot proceed, none of which applies to a clearly explained refusal.

### 도메인

Tool Design & MCP Integration

## 질문 8

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : During sessions where a customer raises several issues, the agent sometimes applies one issue's refund amount to a different issue's order once earlier turns have been summarized. How should per-issue transactional data be maintained?

**A(정답).** Keep each issue's order ID, amount, and status in a structured facts block outside the summarized history, updated as issues progress.

**설명**

This is the documented pattern for preserving precise transactional data across long sessions. A structured block included in every prompt is never subject to summarization, so amounts and order IDs stay bound to the correct issue no matter how many turns are compressed.

**B.** Raise the token threshold that triggers summarization so more complete turns remain in context before any compression occurs.

**설명**

Raising the threshold only delays the point at which summarization erodes precise details; multi-issue sessions will still eventually cross it. The failure mode remains intact, just postponed to longer sessions.

**C.** Rewrite the summarization prompt to instruct that every order ID, dollar amount, and issue status be preserved verbatim in each summary.

**설명**

Summarization is inherently lossy and probabilistic; instructing the summarizer to keep every figure verbatim reduces but does not eliminate omissions, and repeated summarization passes compound the loss. Critical facts should live outside the summarized history, not depend on summary quality.

**D.** Re-invoke lookup_order for every referenced order at the start of each turn so amounts always come from the backend, never from history.

**설명**

Refetching restores raw backend fields but re-injects verbose multi-field results into context each turn, adding loops and bloat. It also cannot recover conversation-level facts such as which amount was agreed for which issue or what the customer stated, which is exactly the binding that was lost.

### 전반적인 설명

The root cause here is the progressive summarization trap: when older turns are condensed, precise transactional values (order IDs, dollar amounts, statuses) are the first details to blur into vague phrasing, and the association between a specific amount and a specific issue is lost. In a multi-issue session that association is the whole game, because the same customer has several concurrent orders and figures in play.

The reliable design is a persistent case facts block: a structured record per issue (order ID, amount, status, agreed resolution) that lives in a separate context layer, is updated whenever a new fact emerges, and is included in every prompt regardless of how the conversation history is compressed. Because this block is never summarized, precision survives arbitrarily long sessions. Anthropic's memory tool is the documented mechanism for persisting exactly this kind of state outside the active context window, with the application controlling the backing store, and structured outputs can produce the schema-validated per-issue records that populate such a block.

The alternatives all attack symptoms. Hardening the summarization prompt keeps critical data on the lossy path; even a well-instructed summarizer occasionally drops or misattributes a figure, and each summarization pass compounds the risk. Refetching orders every turn restores backend truth but floods context with verbose multi-field results and still cannot reconstruct conversational facts, such as which refund figure the customer accepted for which issue. Raising the summarization threshold merely moves the cliff; the mental model to adopt is that anything that must stay exact should never depend on summarization surviving it.

### 도메인

Context Management & Reliability

## 질문 9

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The coordinator delegates each document to an extraction subagent with a fixed script: locate the header, read the summary table, then extract line items. Documents with nonstandard layouts consistently fail. How should the delegation prompts be redesigned?

**A.** Extend the delegation script with additional branching instructions that explicitly cover each newly encountered nonstandard layout variation.

**설명**

This is incorrect because enumerating layouts is an unwinnable arms race: real-world documents will keep producing variations the script does not anticipate. Each new branch also makes the prompt longer and harder to follow, without ever removing the underlying brittleness.

**B(정답).** Specify the extraction goal and what a schema-valid result must contain, letting the subagent choose how to work through each document.

**설명**

This is correct because it defines success (the goal and quality criteria, including a complete, schema-valid result) while leaving the method to the subagent, which can adapt its navigation to whatever layout it encounters. Anthropic's prompting guidance favors describing the outcome and giving the model a way to verify its work rather than prescribing steps when order is not essential.

**C.** Send only the document and the target schema name, omitting quality criteria so nothing constrains the subagent's chosen approach.

**설명**

This is incorrect because removing quality criteria discards the definition of a successful result along with the rigid script. Without stated criteria such as schema validity and field completeness, the subagent has no way to judge whether its extraction is done or adequate.

**D.** Have subagents return nonstandard documents to the coordinator, which composes a tailored step sequence for each one individually.

**설명**

This is incorrect because it turns every unusual document into a coordinator round trip, adding latency and moving the adaptability to the wrong place. The subagent processing the document is the component positioned to adapt; the coordinator should define success, not author bespoke procedures per document.

### 전반적인 설명

This question tests the core principle of coordinator prompt design: define success, not procedure. In a coordinator-subagent architecture, each subagent runs in its own isolated context and does not automatically inherit the coordinator's conversation history or prior tool results. A subagent may carry its own configured instructions, such as the system prompt in its AgentDefinition, but the task-specific content (the research or extraction goal, needed context, and quality criteria) must be included in the delegated prompt itself. If that delegated task is written as a rigid procedural script, the subagent's ability to reason about the document in front of it is wasted, because it is forced down a path written before the document was ever seen. The reason to use an agent for extraction at all, rather than a deterministic parser, is that documents vary; the delegation prompt should preserve that adaptability by stating the goal (extract these fields from this document) and the quality criteria (output validates against the JSON schema, required fields are populated, values are grounded in the source text), then letting the subagent decide how to navigate headers, tables, and unusual layouts.

Anthropic's prompting guidance makes this explicit: describe the outcome rather than the steps, give the model a way to check its own work, and reserve rigid numbered sequences for cases where order or completeness genuinely matters. Quality criteria act as the subagent's self-verification target, which is what makes the goal-oriented prompt reliable rather than merely permissive; dropping the criteria entirely, as one option does, removes the definition of done and invites incomplete or unvalidated output. Expanding the script to cover more layouts just deepens the brittleness, and routing odd documents back to the coordinator for custom scripts relocates the same procedural rigidity while adding round trips.

See Subagents in the SDK for what subagents inherit and why delegated prompts must carry task-specific context, and the Claude Code prompt guidance on describing outcomes and measurable targets instead of step-by-step procedures.

### 도메인

Agentic Architecture & Orchestration

## 질문 10

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The document analysis subagent must run extract_metadata as its first action on every document, yet it sometimes jumps straight to other extraction tools. Which tool_choice configuration guarantees the required first call?

**A.** Set tool_choice to {"type": "any"} so the model is required to call one of the provided extraction tools.

**설명**

The any setting forces some tool call but leaves the choice of which tool to the model. It guarantees structured output but does not guarantee that extract_metadata specifically is the first tool invoked, which is exactly the failure being observed.

**B.** Keep tool_choice at {"type": "auto"} and add a system prompt rule stating extract_metadata must always run first.

**설명**

Under auto, the model decides whether to call any tool at all, and prompt instructions influence but do not guarantee behavior. This leaves the sequencing requirement probabilistic, so the subagent can still skip the metadata step occasionally.

**C.** Place extract_metadata first in the tools array so the model preferentially selects the leading tool.

**설명**

The order of tool definitions in the tools array is not a documented selection mechanism. The model chooses tools based on their descriptions and the task, so reordering definitions provides no guarantee about which tool runs first.

**D(정답).** Set tool_choice to {"type": "tool", "name": "extract_metadata"} on the first request for each document.

**설명**

Forced tool selection compels the model to call the named tool rather than choosing among tools or answering in text. This is the documented mechanism for guaranteeing that a specific extraction, such as metadata extraction, runs before subsequent steps.

### 전반적인 설명

The tool_choice parameter has three progressively stronger modes, and each maps to a different guarantee. auto (the default when tools are provided) lets the model decide on each turn whether to call a tool or respond in plain text. any removes the option of a text-only reply: the model must call one of the provided tools, but it still picks which one. Forced selection, written as {"type": "tool", "name": "..."}, removes both degrees of freedom: the model must call exactly that named tool. When the requirement is a specific first action, such as running metadata extraction before any other analysis or enrichment, only forced selection turns the requirement into a hard constraint rather than a preference.

The mental model worth keeping is that prompts steer, tool_choice constrains. When tool_choice is any or tool, the API prefills the assistant message to force tool use, which is why the guarantee holds by construction instead of depending on instruction following. A system prompt rule under auto can raise the odds of the right first call but cannot eliminate the failure mode, and the ordering of definitions in the tools array carries no documented selection semantics at all. Choosing any here would fix a different problem (conversational replies leaking through) while leaving the sequencing problem intact, since the model could still open with a different extraction tool.

In a multi-step pipeline, a common pattern is to force the first call and then relax the constraint: send the first request with the forced tool, return its result, and switch subsequent requests to auto or any so the model can select among the remaining tools freely. See Define tools and control Claude's output and the tool use overview for the full behavior of each mode.

### 도메인

Prompt Engineering & Structured Output

## 질문 11

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The system's single process_document tool exposes an operation enum (extract_entities, summarize_tables, classify_document). Logs show frequent wrong-operation calls, and each operation returns a differently shaped payload that breaks downstream schema validation. Which redesign fixes both problems?

**A.** Set tool_choice to force process_document on every request so the model always calls the tool instead of answering in text.

**설명**

Forcing the tool with tool_choice guarantees a call happens but has no influence on which operation value the model supplies inside the call. The misrouting and the inconsistent payload shapes both persist unchanged.

**B(정답).** Split it into three purpose-specific tools, each with its own description, its own input_schema, and one consistent result shape.

**설명**

Separate tools move the operation decision into the tool-selection step, where distinct names and descriptions guide the model, and each tool's input_schema describes exactly one operation's inputs. Because each tool then returns a single consistent payload shape, the downstream system can validate each result against an operation-specific output schema, fixing both failures at their source.

**C.** Keep the single tool and expand its description with detailed selection criteria and examples for each operation value.

**설명**

A richer description may reduce some confusion, but the operation choice remains buried inside a single parameter rather than surfaced as a tool selection, and the tool still returns three incompatible payload shapes. The downstream validation problem is not solved at all.

**D.** Add an auto value to the operation enum so the tool itself infers the intended operation from the document at runtime.

**설명**

Auto-detection pushes the ambiguity one layer deeper instead of resolving it; the tool must now guess intent from content, and wrong guesses become harder to diagnose. It also does nothing about the mismatched output shapes that break validation.

### 전반적인 설명

The model selects and constructs tool calls from three things it can see: the tool name, the description, and the input_schema (a JSON Schema describing the tool's input parameters). When three genuinely different operations hide behind one tool with a mode parameter, the decision that matters (which operation to perform) is removed from the selection surface where those signals operate. The model picks the tool easily, then guesses at the enum value with far weaker guidance, which is exactly the wrong-operation pattern in the logs.

Splitting into extract_entities, summarize_tables, and classify_document turns that hidden parameter choice into a visible tool choice, where each name and description can draw a clear boundary. Just as importantly for an extraction pipeline, each tool now owns a single contract: a focused input_schema for that operation's inputs, and one payload shape it returns. Note that input_schema governs inputs only; the application still validates each tool's returned payload, but with per-tool contracts it can check each result against a separate, operation-specific output JSON Schema instead of one schema trying to cover three incompatible result shapes. That eliminates the structural mismatch rather than papering over it.

Consolidating related operations behind a shared parameter is a reasonable design when the operations share one contract and the model routes among them reliably. The stem shows neither condition holds here: routing is failing and the payload shapes diverge, which is the case where purpose-specific tools earn their keep. Expanding the single tool's description improves documentation of a structure that stays ambiguous and leaves the shape problem untouched. An auto operation value just relocates the guess into the tool. Forcing the call with tool_choice controls whether a tool is called, not which operation value the model writes into its input, so it changes nothing about either failure. See the tool use overview for how tool definitions (name, description, input_schema) drive the model's tool selection and input construction.

### 도메인

Tool Design & MCP Integration

## 질문 12

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : An analyst flags an extracted invoice total as incorrect. The assistant acknowledges the concern and offers a corrected re-extraction. The analyst replies: "No, I want someone on the data team to check this." What should the assistant do next?

**A(정답).** Route the case to human review immediately, without attempting another automated correction first.

**설명**

Once a resolution has been offered and the analyst reiterates a preference for a human, that reiteration becomes an explicit request that must be honored immediately. Continuing automated attempts at this point overrides a stated preference and damages trust.

**B.** Run the corrected re-extraction and present the result, escalating only if the analyst rejects the output again.

**설명**

The nuanced escalation pattern allows one resolution attempt, which the assistant already made. Performing another automated pass after the analyst has restated their preference for a human continues working a case the analyst has closed to automation.

**C.** Ask the analyst to identify which specific fields look wrong before deciding whether human review is needed.

**설명**

Gathering more detail is investigation, and the analyst has already declined further automated handling. Treating the escalation as conditional on additional diagnostics delays a request that should be honored without further qualification.

**D.** Score the frustration level of the reply and escalate only if it crosses a configured sentiment threshold.

**설명**

Sentiment analysis is an unreliable proxy for escalation decisions, and it is unnecessary here because the analyst has stated the preference in plain words. Gating an explicit request behind a mood metric can suppress escalations that should happen unconditionally.

### 전반적인 설명

The escalation pattern being tested here is the nuanced, staged one: when a user expresses dissatisfaction about an issue that is within the system's capability, the right first move is to acknowledge the concern and offer a resolution, exactly what the assistant did by proposing a corrected re-extraction. A first expression of frustration is not the same as a request for a human, so escalating at that point would be premature.

The stage changes the moment the user responds to the offered resolution by reiterating a preference for a human. That reiteration converts the situation into an explicit request, and explicit requests are a first-class escalation trigger that is honored immediately, with no further automated attempts, diagnostics, or qualification. Running another re-extraction, or asking the analyst to enumerate the wrong fields first, both continue automated handling of a case the user has just closed to automation; even well-intentioned extra work at this point reads as the system overriding a stated preference.

Sentiment scoring fails for a deeper reason: mood is a proxy, and proxies are only useful when the underlying signal is ambiguous. Here the signal could not be clearer, so introducing a threshold adds a failure mode (a calm but firm request scoring below the cutoff) without adding any information. Well-designed escalation logic keys off explicit criteria, not inferred emotional state or model self-confidence, both of which correlate poorly with when escalation is actually warranted.

When the handoff happens, it should carry a structured summary (the disputed field, the document, the original and corrected values, and what the assistant attempted) so the human reviewer can act without restarting the investigation. For background on designing these human-in-the-loop boundaries in agentic systems, see Anthropic's Building effective agents and the Claude Agent SDK overview.

### 도메인

Context Management & Reliability

## 질문 13

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : A new intake adds complex contract packets whose relevant sections, amendments, and cross-references vary unpredictably from document to document; the extraction work needed only becomes clear after an initial read. Which decomposition approach fits this intake?

**A(정답).** Have the model analyze each document first, then generate the extraction subtasks dynamically based on what that analysis reveals.

**설명**

This is dynamic adaptive decomposition, the documented fit when required subtasks cannot be predicted ahead of time. An initial analysis pass lets the system choose the extraction steps each specific document actually needs, rather than forcing every document through steps designed before its structure was known.

**B.** Enumerate every document structure seen so far and build a fixed chain with a dedicated extraction step per structural variant.

**설명**

A fixed chain assumes the subtasks are known in advance, which the intake's unpredictable structures contradict. Enumerating variants is an arms race the pipeline loses the first time a packet arrives with a structure nobody anticipated.

**C.** Send packets with unpredictable structure to human reviewers, keeping automated extraction only for documents that match known templates.

**설명**

Escalating all irregular documents abandons automation for exactly the workload the system was built to handle. Adaptive decomposition lets the model handle structural variety autonomously; human review should be reserved for genuine judgment calls, not routine variability.

**D.** Extract each packet in one comprehensive request so every field is captured with the entire document in view at once.

**설명**

A single monolithic pass asks one call to simultaneously discover structure and extract data, which dilutes attention across long, heterogeneous content. Decomposition exists precisely to avoid this; the question is only whether the steps are fixed or adaptive.

### 전반적인 설명

Anthropic's guidance on agent design separates approaches by how much of the control flow is decided in advance. Prompt chaining is the fixed sequential pipeline: it works when a task can be "easily and cleanly decomposed into fixed subtasks," with each call consuming the prior call's output and optional programmatic gates between steps. Its whole value proposition rests on knowing the steps before the input arrives. When the required subtasks depend on what each specific document contains, that precondition fails, and the documented alternative is dynamic decomposition: an initial pass examines the input and the system generates the subtasks it actually needs, the pattern Anthropic describes as orchestrator-workers, where subtasks are not predefined but chosen based on the specific input.

The mental model an architect should carry is a spectrum of predictability. Fully predictable steps get a fixed chain, which is cheaper, faster, and easier to regression-test. Steps that emerge from intermediate findings get adaptive decomposition, accepting extra cost and latency in exchange for handling inputs no pre-written pipeline anticipated. Enumerating every structural variant into an ever-growing fixed chain tries to buy adaptivity with maintenance effort and still breaks on the next novel packet. A single comprehensive extraction request avoids decomposition entirely, overloading one call with discovery and extraction at once. Routing all irregular documents to humans concedes the core workload; human review belongs where judgment, not structural variety, is the obstacle.

See Building Effective Agents for the full comparison of prompt chaining, orchestrator-workers, and when to accept agentic complexity.

### 도메인

Agentic Architecture & Orchestration

## 질문 14

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : A billing-dispute investigation is delegated to a subagent. Its custom lookup_order MCP tool fails, returning application-level error metadata your team designed: errorCategory "permission" and isRetryable false, because the account record is restricted. How should the subagent handle this failure?

**A.** Reformulate the request with alternate search parameters, since a differently shaped query may route around the restriction.

**설명**

Reformulating input is the appropriate response when the metadata indicates an input problem the agent can fix. The restriction applies to the account record itself, so rephrasing the query cannot resolve it, and attempting to route around an access control would be improper even if it worked.

**B.** Retry the lookup_order call several times with exponential backoff in case the account restriction clears during the session.

**설명**

Retry with backoff is the local recovery pattern for failures the tool marks as transient and retryable, such as timeouts. This error is explicitly flagged isRetryable false, so retrying wastes tool calls and delays the coordinator's recovery decision.

**C.** Call escalate_to_human directly from within the subagent so the human handoff begins before the coordinator is informed.

**설명**

Escalation decisions belong to the coordinator, which holds the full case context and handles errors uniformly across the system. A subagent that escalates on its own bypasses that central control point and cannot compile a self-contained handoff covering the whole case.

**D(정답).** Report the unresolved failure in its final message to the coordinator, including the error category and the attempted lookup.

**설명**

Correct. The tool's own metadata marks this failure as non-retryable, and an access restriction is outside the subagent's ability to resolve locally, so the right move is to propagate it. Because only a subagent's final message reaches the coordinator, that message must carry the error category and what was attempted so the coordinator can decide on escalation or an alternative path.

### 전반적인 설명

The core judgment here is matching recovery behavior to the error metadata your own tools return. Fields like errorCategory and isRetryable are not part of the MCP protocol or the Claude Agent SDK; for tool execution failures, MCP's tool result can carry isError: true, while protocol-level errors are handled separately as MCP/JSON-RPC errors. Well-designed tools add application-level metadata on top of that flag precisely so the agent can choose a recovery strategy: retry failures the tool marks as transient and retryable, correct input when the tool indicates a fixable request problem, and stop retrying when the tool says the failure will not clear. An access restriction flagged isRetryable: false is the kind of failure a subagent cannot resolve locally, so the pattern is to propagate it upward rather than burn attempts on it.

How that propagation happens is shaped by subagent context isolation. Each subagent runs as a separate agent instance with its own conversation: its intermediate tool calls, retries, and errors stay inside its context, and only its final message returns to the coordinator. This design keeps the coordinator's context clean, but it means the coordinator sees nothing the subagent does not deliberately report. If the final message omits the error category and the attempted lookup, the failure is effectively invisible, and the coordinator cannot choose between escalating, trying another data path, or proceeding with annotated coverage gaps.

The distractors each misapply a valid pattern. Backoff retries suit failures the tool marks as transient, not access denials; reformulating parameters treats an access-control refusal as a fixable input problem; and having the subagent invoke escalate_to_human itself hands an architectural decision to the component with the least context, undermining the coordinator's role as the single point where errors are observed and handled uniformly. See Subagents in the Claude Agent SDK for how subagent isolation and final-message reporting work.

### 도메인

Tool Design & MCP Integration

## 질문 15

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : The project's .mcp.json connects five MCP servers, exposing roughly 25 tools in every session, although most coding tasks touch only the GitHub server. Claude increasingly picks the wrong tool during refactoring work. What is the highest-leverage fix?

**A(정답).** Trim the project's .mcp.json to servers the workflow uses, moving rarely needed ones to users' ~/.claude.json.

**설명**

Tools from every connected MCP server are discovered at connection time and available simultaneously, so the full 25-tool catalog is in play on each selection decision. Reducing the connected servers shrinks the decision space directly, which is the architectural control for unreliable tool selection; personal or occasionally used servers belong in user-level configuration.

**B.** Run every refactoring task in plan mode so a developer reviews tool choices before any execution happens.

**설명**

Plan mode adds a human checkpoint but does nothing to make selection more reliable; developers end up catching the same wrong choices repeatedly. It treats the symptom with review overhead instead of removing the cause.

**C.** Add a CLAUDE.md section mapping each common task type to the specific server tools Claude should choose.

**설명**

Prompt-level guidance is probabilistic: it asks instructions to overcome a decision space that remains just as large. The oversized inventory is the root cause, and configuration can remove it outright rather than argue against it.

**D.** Create a slash command Claude runs first in each session, returning the recommended tool for the requested task.

**설명**

This adds a routing step to solve a selection problem, and the routing step's output must itself be followed correctly across the same oversized catalog. It layers indirection on top of the real issue rather than shrinking the inventory the model chooses from.

### 전반적인 설명

When Claude Code connects to MCP servers, every tool from every connected server is discovered and made available at once. The model's tool selection is a single decision over that combined catalog, and reliability degrades as the catalog grows: more overlapping descriptions, more near-miss candidates, more ways to misroute. Anthropic's documentation acknowledges this directly, noting that selection accuracy falls off with large tool libraries and that very large catalogs need dedicated mitigations such as on-demand tool loading (see the Tool search tool documentation).

The mental model to hold is that tool inventory is an architectural control, not a prompting concern. If most sessions only need one server's tools, the fix is to make the configuration reflect that: keep shared, workflow-critical servers in the project's .mcp.json (versioned and distributed to the team), and move rarely used or personal servers to ~/.claude.json, where individual developers can enable them without inflating everyone else's tool catalog. This is the same scoping principle that governs subagent tool allocation: a model choosing among a handful of relevant tools is far more reliable than one choosing among dozens.

The alternatives all leave the decision space untouched. CLAUDE.md guidance asks instructions to win a fight against inventory, which works only probabilistically. Plan mode inserts human review, which catches errors after the model has already made them and scales poorly. A routing slash command adds a selection step to fix a selection problem; the model must still act correctly over the same 25 tools once the recommendation comes back. Shrinking what is connected removes the failure mode instead of policing it.

### 도메인

Tool Design & MCP Integration

## 질문 16

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The document-analysis subagent's findings already carry a detected_pattern field, but it is a free-form string and nearly every value is unique prose, so dismissed findings cannot be grouped for false-positive analysis. What schema change makes aggregation reliable?

**A.** Add a prompt instruction telling the model to reuse identical wording whenever it applies the same detection pattern.

**설명**

Prompt instructions about wording are probabilistic and cannot guarantee identical strings, especially across separate subagent invocations that share no memory of earlier phrasings. Small wording variations would still fragment the groups, leaving aggregation unreliable.

**B.** Keep the free-form values and run a second Claude pass that clusters the strings into categories after each batch.

**설명**

Post-hoc clustering adds cost and latency, and its groupings are nondeterministic, so category boundaries can drift between batches. Constraining the values at the schema level yields stable, validated categories instead of trying to recover them after the fact.

**C.** Make detected_pattern nullable so the model populates it only when it can name a well-defined pattern.

**설명**

Nullability is the right tool when source information may be genuinely absent, but here the trigger for each finding always exists. Allowing null reduces coverage of the very field the analysis depends on without making the populated values any more consistent.

**D(정답).** Constrain detected_pattern to an enum of known pattern categories plus an "other" value with a detail string.

**설명**

An enum constrains every finding to one of a fixed set of pattern categories, so dismissals can be counted and compared across thousands of findings. The "other" value with a companion detail string keeps the categorization extensible, capturing genuinely novel patterns without breaking aggregation.

### 전반적인 설명

The purpose of a detected_pattern field is to make false positives machine-analyzable: when developers dismiss findings, you group the dismissals by pattern and discover which detection behaviors are producing noise. That analysis only works if the field's values form a small, stable set of categories. A free-form string defeats the purpose because the model phrases the same underlying pattern differently on every call; each value becomes a group of one, and no signal emerges.

The schema is the right place to enforce this. Structured output constrains only what the schema expresses: only fields represented in the schema are guaranteed, and for schema-constrained objects additionalProperties must be set to false. That is exactly why categorical constraints belong in the schema rather than the prompt. An enum on detected_pattern turns the field into a fixed vocabulary, so every finding lands in one of a known set of buckets that can be counted, trended, and compared. Pairing the enum with an "other" value plus a free-text detail field is the standard extensibility pattern: known patterns aggregate cleanly, while novel ones are captured for later promotion into the enum instead of being silently forced into a wrong category.

The alternatives all leave the root cause in place. Prompt instructions to reuse wording are probabilistic, and independent subagent calls have no memory of prior phrasings. A second clustering pass is expensive and its category boundaries drift between runs. Making the field nullable addresses a different failure mode (fabrication when source data is absent) and here would simply lose coverage of the field the whole feedback loop depends on. See Structured outputs for the supported schema constructs.

### 도메인

Prompt Engineering & Structured Output

## 질문 17

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : A developer lists the team's sample-document fixtures in the project CLAUDE.md as @tests/fixtures/invoice.json and @tests/fixtures/receipt.json. Every session now starts with both files' full raw contents loaded into context. What change fixes this?

**A.** Trim each fixture file until the combined imported content keeps CLAUDE.md under the recommended length limit.

**설명**

This mutilates test fixtures that exist to serve the test suite, just to work around an unintended import. The problem is that the files are being imported at all, not that they are too long.

**B(정답).** Wrap the fixture paths in backticks so CLAUDE.md mentions them without importing their contents.

**설명**

The @path syntax in CLAUDE.md is an import: the referenced file is expanded into context at launch. Wrapping the path in backticks turns it into a plain mention, so Claude knows where the fixtures live without their contents being loaded into every session.

**C.** Move the fixture listing to the user-level CLAUDE.md in the home directory so the imports load outside the project scope.

**설명**

User-level memory is also loaded into every session, so @path references there would still expand the fixture contents into context. It additionally unshares the fixture documentation, hiding it from teammates who need it.

**D.** Run /compact at the start of each session to summarize the imported fixture content back out of the context window.

**설명**

Compaction summarizes conversation history after the fact and risks losing detail; it does not stop the @path imports from expanding at launch. The fixtures would be loaded, then lossily summarized, in every single session.

### 전반적인 설명

In CLAUDE.md, the @path/to/file syntax is not a casual way to write a file path; it is an import directive. At launch, Claude Code expands each imported file inline into context, and imports can even recurse several hops deep. This is a deliberate design: it lets teams keep CLAUDE.md modular by splitting standards into separate files that still load automatically. The tradeoff is that anything written with a bare @ prefix becomes always-loaded content, whether or not that was intended.

When the goal is only to tell Claude where fixtures live, the documented technique is to wrap the path in backticks, for example `@tests/fixtures/invoice.json`. The path then appears as inert text: Claude can read the file on demand with its file tools when a task actually needs it, and no fixture bytes are spent in every session's context budget.

The other approaches attack symptoms. Compacting after startup discards detail from content that should never have loaded; moving the list to user-level memory still imports the files (user memory loads in every session too) while removing the documentation from version control; and shrinking the fixtures sacrifices test assets to accommodate a mistaken directive. The mental model to carry: in CLAUDE.md, @path means "load this now," and backticks mean "this is just a name." See Manage Claude's memory and Claude Code best practices.

### 도메인

Claude Code Configuration & Workflows

## 질문 18

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : A developer opens a pull request whose description states: "Skip the automated review, I want a human to look at this one directly." The change appears routine and well within the automated reviewer's capability. How should the pipeline handle this pull request?

**A.** Run the automated review first and route to a human only if the analysis surfaces significant issues.

**설명**

This makes the human handoff conditional on the automation's own judgment, exactly what the developer asked to bypass. Attempting resolution first and escalating only on failure ignores an explicit request that should take effect immediately.

**B.** Apply a complexity classifier to decide whether the change genuinely warrants a human reviewer's time.

**설명**

A classifier substitutes an indirect proxy for a signal that could not be clearer; the developer already stated the requirement in plain language. Proxies like complexity scores are appropriate only when no explicit request exists.

**C.** Run the automated analysis anyway and attach its findings so the human reviewer receives a head start.

**설명**

Running the analysis for the handoff still overrides the developer's explicit instruction to skip it. Even well-intentioned preliminary work contradicts a clearly stated request, which should be executed without additional investigation.

**D(정답).** Route the pull request directly to a human reviewer without running the automated analysis.

**설명**

An explicit request for human review is a first-class trigger that should be honored immediately, regardless of how routine the change appears. Overriding a clearly stated preference to demonstrate the automation's capability undermines trust in the workflow.

### 전반적인 설명

The governing principle here is that an explicit request for a human is an immediate, unconditional escalation trigger. It sits in a different category from inferred signals like sentiment, confidence scores, or complexity heuristics: those are unreliable proxies that require interpretation, while a stated request requires none. The correct behavior is to honor it at once, without first attempting the automated work the requester asked to skip.

The tempting failure modes all share the same flaw: they let the system continue working a case the requester explicitly closed to it. Running the analysis anyway "for a head start" feels helpful, but it treats the instruction as advisory rather than binding; the same logic applies when a support agent gathers order details before escalating despite a customer demanding a human. Making the handoff conditional on the automation finding issues inverts the authority relationship, letting the tool judge whether its own bypass was justified. A complexity classifier compounds the problem by inserting a probabilistic decision where a deterministic one already exists.

Architecturally, this matters because trust in an automated reviewer depends on predictable boundaries. Anthropic's guidance on building support automation frames Claude as handling portions of a workflow while deliberately routing other interactions to humans, and recommends treating "user requests a human" as a distinct interaction branch with its own test cases rather than an incidental edge case. The same design discipline applies to CI review bots: the explicit-opt-out path should be designed, tested, and honored deterministically. See Customer support agent for the pattern of defining ideal interactions and their escalation branches up front.

### 도메인

Context Management & Reliability

## 질문 19

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The document analysis subagent attaches calibrated confidence scores to extracted claims, and high-confidence claims now bypass human fact-checking. How should the team continue detecting novel error patterns among the claims that skip review?

**A(정답).** Apply stratified random sampling to high-confidence claims and measure error rates in the sample on an ongoing basis.

**설명**

This is correct because stratified random sampling keeps measurement running on the exact population that no longer receives review. It surfaces novel error patterns, such as those introduced by changing source formats, that confidence scores calibrated on past data cannot anticipate.

**B.** Raise the confidence threshold for bypassing review so a smaller share of claims skips the fact-checking step.

**설명**

Tightening the threshold shrinks the automated population but provides no measurement of the claims that still bypass review. Novel error patterns in that remaining high-confidence set stay invisible, and the threshold change sacrifices efficiency without adding detection.

**C.** Track the aggregate accuracy metric across all claims and investigate only when it drops below the validated baseline.

**설명**

Aggregate accuracy can mask concentrated failures in specific source types or fields, so a novel error pattern in one segment may never move the overall number. It also detects problems only after they have grown large enough to shift the average.

**D.** Route only the claims the model itself flags as uncertain to human reviewers, since errors concentrate in those cases.

**설명**

Self-flagged uncertainty misses exactly the failure mode at issue: claims the model is confidently wrong about. Novel error patterns typically appear in high-confidence output where the model does not know it is failing, so this routing leaves them unmeasured.

### 전반적인 설명

Confidence calibration answers the question "how likely is this extraction to be right, based on the errors we have seen before?" It says nothing about errors the validation set never contained. When high-confidence claims stop receiving human review, the system loses its only channel for discovering novel error patterns: failure modes introduced by new source formats, shifting document structures, or edge cases the calibration data did not cover. The mental model is that automation removes a sensor, and something must replace it.

Stratified random sampling is that replacement. By drawing a random sample from the high-confidence population (stratified so that every source type and field segment is represented, not just the most common ones) and reviewing it, the team keeps a continuous, unbiased estimate of the true error rate in the exact claims that skip review. Because the sample is random rather than triaged by any model signal, it catches errors the model is confidently wrong about, which is precisely where novel patterns hide. Stratification matters because a rare source type can fail badly while contributing too few claims to move an unstratified sample.

The alternatives each break down on this point. Aggregate accuracy is a lagging, diluted signal: a 97% overall figure can conceal a badly failing segment, and by the time the average moves, the damage is done. Routing only self-flagged uncertain claims trusts the model to know when it is wrong, which is the assumption that fails during a novel error pattern. Raising the bypass threshold merely shrinks the unmonitored population without measuring it; whatever still passes remains a blind spot.

Anthropic's guidance on evaluation emphasizes continuous, empirical measurement against representative cases rather than trusting model self-assessment; see Create strong empirical evaluations.

### 도메인

Context Management & Reliability

## 질문 20

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : Two subagents researching a legacy module report different default values for the same timeout setting, each drawn from a different internal document. How should their findings reach the main agent that is drafting the documentation?

**A.** Have each subagent apply credibility heuristics to select the single most likely value and return only that one, keeping the handoff record concise.

**설명**

This is incorrect because arbitrarily choosing one value at the subagent level destroys information the main agent needs. The discrepancy itself is a meaningful finding, and once a subagent silently drops one value, neither the conflict nor the losing source can be recovered downstream.

**B.** Have the main agent automatically adopt the value from whichever source document was modified most recently and silently discard the older finding.

**설명**

This is incorrect because recency alone does not establish correctness, and silently discarding the older value hides the conflict from anyone reviewing the documentation. Dates are useful metadata for interpreting differences, but they should inform reconciliation, not trigger automatic deletion of one source's claim.

**C(정답).** Return both values in a structured record that flags the conflict and attributes each to its source, deferring reconciliation to the main agent.

**설명**

This is correct because conflicting values from credible sources should be preserved with attribution to their source documents rather than resolved arbitrarily at the subagent level. The main agent has the broader context needed to reconcile the discrepancy, and the structured record keeps the claim-to-source mapping intact through the handoff.

**D.** Re-run both subagents against a shared prompt instructing them to cross-check each other until they converge on one agreed value.

**설명**

This is incorrect because the disagreement originates in the source documents, not in the subagents' reasoning, so repeated runs cannot make genuinely conflicting sources agree. It also wastes tokens and latency while still failing to surface the conflict with proper attribution.

### 전반적인 설명

When multiple agents gather information from different sources, the handoff format determines whether attribution and disagreement survive aggregation. The reliable pattern is a structured record that keeps content and metadata as separate, paired fields: each value travels with its source document name and, ideally, a date or revision marker. Anthropic's prompting guidance reflects the same principle for multi-document inputs, recommending that document content and source metadata be kept in distinct, clearly delimited fields (for example a <document_content> element alongside a <source> element) so the model never has to guess which metadata belongs to which content. See Prompt templates and variables for this structure.

Conflicting values deserve special handling within that structure. A subagent that discovers two credible sources disagreeing should annotate the conflict and attribute each value rather than pick a winner, because the reconciliation decision belongs to the coordinating agent, which sees the whole task. This division of labor is why the pattern works: subagents are collectors with narrow views, while the main agent holds the cross-source context needed to judge whether one document is stale, whether the difference is temporal (a value that legitimately changed over time), or whether the documentation should flag the inconsistency for the team to fix.

The rejected approaches all collapse information too early. Subagent-level credibility guesses and automatic recency rules both make an irreversible choice with a partial view, and re-running agents until they converge misdiagnoses a source-level disagreement as an agent-level inconsistency, burning tokens without producing a trustworthy answer.

### 도메인

Agentic Architecture & Orchestration

## 질문 21

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : Before beginning deep analysis, the document analysis subagent must identify which of several hundred downloaded source files mention the phrase "randomized controlled trial" anywhere in their text. Which tool selection accomplishes this correctly?

**A(정답).** Invoke Grep with the phrase as the pattern, scoped to the corpus directory.

**설명**

Grep is the built-in tool for searching file contents with regular expressions. Its default files_with_matches output mode returns the matching file paths, which is exactly the list of candidate files the subagent needs before reading anything in full.

**B.** Invoke Glob with a wildcard pattern containing the phrase to find the files.

**설명**

Glob matches file names and paths against patterns; it never inspects what is inside a file. Since the phrase appears in the documents' text rather than their filenames, Glob cannot locate these files.

**C.** Read each downloaded file in full and check its contents for the phrase.

**설명**

Reading hundreds of files in full would consume the context window on content that is mostly irrelevant. A content search should narrow the set first so Read is spent only on files that actually matter.

**D.** Run a recursive shell grep through Bash, since it handles large directories.

**설명**

A shell grep can find the phrase mechanically, but it bypasses the purpose-built Grep tool, which is ripgrep-backed, read-only, and returns results in a structured form the agent consumes directly. Bash should be reserved for tasks the dedicated tools cannot perform.

### 전반적인 설명

The dividing line between the two built-in search tools is where the pattern is matched. Grep searches inside files: it runs a regular expression over file contents, which makes it the right tool for locating identifiers, error messages, imports, or, as here, a specific phrase buried in document text. Glob matches file names and paths (patterns like **/*.md), so it can only answer questions about what files exist, never what they contain. A useful mental model: Glob answers "which files are there?", Grep answers "which files say this?".

Grep is ripgrep-backed and accepts a pattern, an optional path to scope the search, an optional glob filter to restrict which files are scanned, and an output_mode. The default mode, files_with_matches, returns the matching file paths (in the Agent SDK structure, a files collection plus a count), which is precisely the pre-filtering step this task calls for; content mode can then surface the actual matching lines when needed. Because Grep is a read-only tool, it requires no permission approval within the working directory, so subagents can use it freely during investigation.

This search-first, read-selectively pattern is also the core context-efficiency discipline: exhaustively Reading a corpus burns the context window on irrelevant material, while a single Grep call reduces hundreds of candidates to the handful worth loading. Falling back to a shell grep via Bash works mechanically, but it trades a structured, permission-free tool for command output the agent must parse from text, and it routes through Bash permission handling unnecessarily. See the Claude Code tools reference and the Agent SDK Python reference for the Grep tool's inputs and output modes.

### 도메인

Tool Design & MCP Integration

## 질문 22

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The document analysis subagent's fetch_document MCP tool returns the full raw page payload plus 30+ crawl and encoding metadata fields per call, and the subagent exhausts its context before completing multi-document analyses. What is the most effective change?

**A.** Add a system prompt instruction telling the subagent to disregard crawl and encoding metadata when reasoning about documents.

**설명**

Instructing the model to ignore fields does not remove them from context; every irrelevant field still consumes tokens in each tool result. The context window fills at exactly the same rate, so the exhaustion problem is untouched.

**B(정답).** Modify fetch_document to return only the fields the analysis needs, such as title, publication date, and relevant text sections.

**설명**

This is correct because it removes irrelevant bulk at the source, before it ever enters the subagent's context. Trimming the tool's response to analysis-relevant fields directly stops the disproportionate token accumulation that is exhausting the window.

**C.** Move the subagent to a model with a larger context window so more documents fit before the limit is reached.

**설명**

A larger window only postpones the same failure at higher cost, and long contexts padded with irrelevant fields still degrade attention to the content that matters. The root cause, verbose tool output entering context, remains in place.

**D.** Have the coordinator summarize the subagent's accumulated results after each document so the history stays compact.

**설명**

Coordinator-side summarization happens after the verbose payloads have already flooded the subagent's own context, so it does not prevent the mid-analysis exhaustion. Summarization also risks losing precise details like dates and figures that citation-quality research depends on.

### 전반적인 설명

Tool results accumulate in context disproportionately to their relevance: a fetch that returns a raw payload plus dozens of crawl and encoding fields spends tokens on data the model will never use, and in a multi-document analysis loop that waste compounds with every call. The right mental model is that the context window is a shared budget, and every tool response makes a withdrawal whether or not its contents matter. The highest-leverage fix therefore sits at the tool interface itself: design fetch_document to return a lean, purpose-shaped payload (title, publication date, author, relevant text) so irrelevant bytes never enter context at all.

Fixing the tool's contract is preferable to downstream mitigations because it is deterministic and applies to every call. A prompt instruction to ignore metadata changes nothing about token consumption; the fields still occupy the window and still dilute attention. Swapping in a larger context window defers the failure rather than removing it, and long noisy contexts still suffer degraded recall of mid-window content. Coordinator-side summarization operates one layer too late, after the subagent's own window has already been flooded, and lossy compression is a poor trade for a research system whose value depends on preserving exact dates, figures, and attributions.

This principle, returning high-signal structured results instead of raw dumps, is a core context engineering practice for agents: shape what enters the window rather than trying to manage bloat after the fact. See Anthropic's guidance on effective context engineering for AI agents and on writing effective tools for agents.

### 도메인

Context Management & Reliability

## 질문 23

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : A developer forked an escalation-analysis session to trial two prompt revisions separately. In the first branch they discover lookup_order returns ambiguous status codes, a fact both trials need. What should they do?

**A.** Add Task to the second branch's allowedTools so it can query its sibling branch for post-fork findings on demand.

**설명**

The Task tool spawns subagents; it is not a channel for one session branch to query another. Even with Task available, forked branches do not exchange context after they diverge.

**B(정답).** Explicitly inject the discovery into the second branch's context, since forked branches share nothing after the split point.

**설명**

This is correct. Forked sessions inherit everything up to the moment of the fork and then evolve as fully independent lines. Anything learned in one branch after divergence must be carried over explicitly if the other branch needs it.

**C.** Run /compact in the first branch so the compacted summary containing the discovery syncs across to the sibling branch.

**설명**

Compaction summarizes context within a single session; it has no cross-branch propagation effect. Running /compact in one branch changes nothing about what a sibling branch can see.

**D.** Proceed without changes in the second branch, relying on the live shared fork baseline to surface the discovery automatically.

**설명**

There is no live shared baseline after the fork. Branches share context only up to the branch point and then diverge in complete isolation, so a post-fork discovery never appears in the sibling automatically.

### 전반적인 설명

fork_session exists to let you explore divergent approaches from a shared baseline: both branches inherit the complete conversation up to the branch point, so the cost of the original investigation is paid once, and each branch then evolves in complete isolation. That isolation is the feature, not a defect. It guarantees that trialing one prompt revision cannot contaminate the evaluation of the other, which is exactly what you want when comparing alternatives fairly.

The flip side of that guarantee is the situation in this question: a fact discovered in one branch after the split, such as lookup_order returning ambiguous status codes, is invisible to the sibling branch. There is no live shared context, no synchronization command, and no tool that lets branches query each other. If a post-fork discovery matters to both explorations, the practical options are to state it explicitly in the other branch or to fold it into the baseline and fork again from the updated analysis.

The distractors each attach the fix to the wrong mechanism. /compact compresses history inside one session and propagates nothing across branches. Waiting on a live shared baseline mistakes fork isolation for ongoing synchronization; only pre-fork context is shared. And the Task tool spawns subagents within a session; it is not an inter-branch communication channel. See Session Management in the Agent SDK and Create custom subagents for how session forking and context isolation work.

### 도메인

Agentic Architecture & Orchestration

## 질문 24

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : A Claude Code session rewrote the agent's escalation logic, and your team set up a separate session to review the diff before merge. A teammate wants to paste the writer session's transcript into the reviewer for background. What should the reviewer receive?

**A.** Resume a copy of the writer session so the reviewer inherits the full investigation context.

**설명**

This is incorrect because resuming or branching from the writer session copies its entire conversation history, including all the reasoning that produced the change. That makes the so-called reviewer effectively the same biased session under a different name.

**B.** Add a short note in which the writer session summarizes its own reasoning to the reviewer's context.

**설명**

This is incorrect because a summary of the writer's rationale still transmits the writer's framing and justifications into the reviewer's context, just in compressed form. The anchoring effect the independent review is meant to avoid gets reintroduced, only with fewer words.

**C.** Share the writer session's full transcript so the reviewer understands the rationale behind each change.

**설명**

This is incorrect because importing the writer's transcript hands the reviewer the same reasoning that biased the original session toward its own decisions. The reviewer would tend to accept the writer's justifications instead of independently questioning whether the code is actually correct.

**D(정답).** Provide the diff and standard project context, deliberately excluding the writer session's transcript.

**설명**

This is correct because the value of an independent review comes from the reviewer not being anchored to the reasoning that produced the code. The reviewer evaluates the change on its own merits using the diff and normal project context, which is exactly the separation the fresh-context pattern exists to create.

### 전반적인 설명

The reason a separate review session catches issues the writing session misses is not that a second instance is smarter; it is that the second instance has clean context. A session that generated code carries the full chain of reasoning that led to each decision, so when asked to review, it tends to re-derive the same conclusions and endorse its own choices. Anthropic's guidance for multi-instance workflows is explicit that a reviewer with fresh context is not biased toward code it just wrote, which is why the documented pattern separates the writer session from the reviewer session.

That benefit is destroyed the moment the writer's reasoning is copied back in. Pasting the full transcript, injecting a rationale summary written by the writer itself, or resuming a copy of the writer session all transmit the original framing into the reviewer's context; the reviewer then evaluates the justification rather than the code. The right input is the artifact itself: the diff, plus the project context the reviewer would normally load anyway (CLAUDE.md conventions, relevant standards). If the reviewer genuinely needs intent, express it as a neutral statement of requirements, not as the writer's own defense of its implementation.

Keep the boundary in mind: independence mitigates self-review bias, it does not guarantee every defect is found, and the reviewer still needs enough project context to apply the team's standards. See Claude Code Best Practices and Common Workflows for the multi-session write-then-review pattern.

### 도메인

Claude Code Configuration & Workflows

## 질문 25

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : Despite a detailed prose description of the escalation handoff format in the system prompt, the agent produces inconsistent summaries: some omit customer context, others skip the order timeline. What change most effectively fixes this?

**A(정답).** Add two or three sample requests, each paired with the exact handoff summary it should produce.

**설명**

Concrete input/output examples are the most effective way to communicate an expected transformation when prose descriptions are interpreted inconsistently. A few paired examples demonstrate the format unambiguously, including which elements must always appear.

**B.** Lower the sampling temperature so the agent renders the summary format more deterministically.

**설명**

Temperature controls token sampling variability, not the model's interpretation of ambiguous instructions. A low-temperature model still produces whatever format it inferred from the prose, so the inconsistency across different requests persists.

**C.** Rewrite the prose description with more precise wording and flag the critical format rules as IMPORTANT.

**설명**

The prose description is already detailed, and the problem is inconsistent interpretation rather than missing rules. Emphasis markers raise priority only relative to surrounding text and still leave the format open to varied readings that examples would eliminate.

**D.** Add a check that rejects summaries below a minimum length and prompts the agent to regenerate them.

**설명**

A length threshold cannot detect which sections are missing; a summary can be long yet still omit the customer context or order timeline. Validation can serve as a guardrail once the format is checkable, but rejecting output does not show the model what a correct summary contains the way paired examples do.

### 전반적인 설명

When detailed natural language instructions still yield inconsistent output, the highest-leverage fix is usually not more prose; it is few-shot examples. Two or three concrete pairs, each showing an incoming request and the exact handoff summary it should produce, communicate the transformation unambiguously: which sections are mandatory, how they are ordered, and how much detail each carries. Examples demonstrate judgment, not just rules, which is why they outperform ever-longer descriptions that the model must still interpret.

The mental model here is that prose describes a distribution of acceptable outputs, and the model samples from its own reading of that distribution on every request. Examples collapse that distribution: the model pattern-matches new inputs against the demonstrated pairs instead of re-deriving the format each time. This is the same reason few-shot prompting improves consistency in extraction and classification tasks.

The alternatives each miss the actual failure mode. Adding emphasis to prose competes for attention against every other instruction without removing the ambiguity. Lowering temperature makes each individual generation more deterministic but does nothing about the model interpreting the format differently across different customer requests. A minimum-length check is a poor proxy for completeness: it cannot tell which required sections are absent, so nonconforming summaries pass whenever they are merely long enough. Validation and regeneration can be a useful guardrail once the handoff has a checkable structure with required fields, but on its own it never communicates the expected content and ordering; the examples do that directly and prevent the failures in the first place.

See Use examples (multishot prompting) to guide Claude's behavior for guidance on constructing effective example sets.

### 도메인

Claude Code Configuration & Workflows

## 질문 26

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The web-search subagent's results in a completed session's transcript reference sources that change frequently. Days later, the team must regenerate the report on separate infrastructure. Which approach carries the research forward most robustly?

**A.** Set continue_conversation to true on the new infrastructure so the run picks up the most recent conversation automatically.

**설명**

The continue option targets the most recent session for the current environment, which is the wrong selection mechanism when work moves to different infrastructure where that session history does not exist locally. Even if the session were reachable, continuing it would restore the stale tool results rather than a curated summary.

**B.** Copy the stored session transcript files to the new infrastructure and resume the original session by its captured session ID.

**설명**

Moving session files and resuming can work, but it is the weaker choice here. Resuming restores the entire prior context, including raw web-search results that reference fast-changing sources, and the documentation notes that capturing results as application state for a fresh session is often more robust than shipping transcript files across hosts.

**C(정답).** Capture the synthesized findings, decisions, and citations as application state and pass them into a fresh session's prompt.

**설명**

This is the documented fresh-session pattern: extract the durable outputs of prior work (findings, decisions, citations) and inject them into a new session. It avoids restoring stale raw tool results and does not depend on moving session files between hosts, which the documentation notes is often less robust than carrying application state.

**D.** Resume the session and rely on automatic context compaction to condense the stale history into a summary before report generation.

**설명**

Compaction runs automatically when the context window approaches its limit; it is not a mechanism you invoke to sanitize a resumed session. Even when it occurs, it summarizes stale tool results rather than refreshing them, so a compacted version of outdated web data is still outdated.

### 전반적인 설명

An Agent SDK session is persisted conversation history, not live state: it contains the prompt, every tool call, every tool result, and every response. Resuming a session restores all of that context exactly as it was recorded; it does not re-run tools or refresh anything. That mental model drives the resume-versus-fresh decision. When prior tool results are still valid, resuming is efficient because the agent picks up with full context. When those results describe a world that has moved on, such as web sources that change frequently, resuming re-injects outdated evidence and invites the model to reason from it as if it were current.

For this situation, Anthropic's documentation describes the more robust pattern explicitly: capture what you actually need from the prior run (analysis output, decisions, citations) as application state, then pass it into a fresh session's prompt. This keeps the conclusions while discarding the stale raw tool outputs, and it removes any dependency on transporting session files between environments; the docs note this is often more robust than moving transcript files around across hosts, even though such portability can be made to work.

The other approaches fail on this decision, not on feasibility. Copying transcripts and resuming by session ID restores the full stale evidence trail. Relying on automatic compaction misunderstands the mechanism: compaction triggers when the context window nears its limit and summarizes history, so a compacted stale finding is still a stale finding. And continue_conversation is a targeting shortcut for the most recent local conversation, not a way to hand work to new infrastructure. See Agent SDK Sessions and The Agent Loop.

### 도메인

Agentic Architecture & Orchestration

## 질문 27

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : The agent escalates "data inconsistency" cases whenever the store credit figure in its case facts block differs from a fresh get_customer result after a mid-session refund posts. Which change prevents this misinterpretation?

**A.** Store only one value per field in the case facts block, overwriting on each update so conflicting entries never coexist.

**설명**

Silent overwriting hides the temporal dimension instead of representing it. The agent loses the record of what the balance was before the refund, which it needs to explain the change to the customer and to audit the actions taken during the session.

**B.** Route every detected value discrepancy to escalate_to_human, since disagreeing financial figures suggest backend integrity issues.

**설명**

Escalating every discrepancy treats a normal state transition as a fault, which would flood human agents with routine cases and undermine the first-contact resolution target. The discrepancy here is expected behavior after a refund, not a backend integrity problem.

**C.** Instruct the agent in the system prompt to always adopt whichever amount appeared later in the conversation when two figures disagree.

**설명**

A blanket recency rule is a heuristic, not an interpretation mechanism. Once history is summarized, conversational position becomes unreliable, and blindly preferring the later mention would also silently override genuine data conflicts that actually warrant investigation or escalation.

**D(정답).** Record a capture timestamp alongside each fact in the case facts block so a later value is read as superseding the earlier one.

**설명**

This is correct because the two figures are not in conflict; they are snapshots of the same account taken before and after a state change. Attaching collection timestamps to structured facts lets the agent interpret the difference chronologically, recognizing that the refund updated the balance rather than exposing contradictory data.

### 전반적인 설명

Two different values for the same field are only a contradiction if they describe the same moment in time. When a refund posts mid-session, the store credit balance legitimately changes, so a fact captured earlier and a fresh tool result will disagree by design. The failure here is not in the backend data but in how the agent's context represents it: a bare number in the case facts block carries no indication of when it was true, so the agent has no way to distinguish a state change from a conflict.

The fix is to make time a first-class part of structured outputs. Recording a capture timestamp with each fact lets the agent reason chronologically: the newer snapshot supersedes the older one, and the older value remains available as an audit trail (useful when the customer references the pre-refund amount). This is the same principle that governs multi-source research synthesis, where publication and collection dates prevent temporal differences from being misread as contradictory claims; here it is applied to within-session tool data.

The alternatives each fail in a characteristic way. A prompt rule to prefer the value mentioned later relies on conversational ordering, which degrades under summarization and would also mask genuine conflicts that deserve attention. Overwriting fields so only one value exists suppresses the discrepancy rather than interpreting it, destroying the history the agent needs to explain the change. Escalating every discrepancy converts routine, expected transitions into human workload, directly working against a high first-contact resolution target. Sound context engineering means structuring what enters the window so the model can reason correctly, not stripping or ordering away the information it needs; see Effective context engineering for AI agents and Context windows.

### 도메인

Context Management & Reliability

## 질문 28

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : A coordinator issues a second, new (non-resumed) Agent tool invocation of its billing-analysis subagent, prompted "Continue the discrepancy analysis you started earlier." The subagent reports that no prior analysis exists. How should the coordinator fix this new delegation?

**A.** Pass the first invocation's tool use ID in the second call so the SDK routes it to the same instance.

**설명**

This is incorrect because tool use IDs are not a routing mechanism. They pair a tool call with its result within the conversation; continuing a prior subagent's work is done by resuming it, not by reusing tool use IDs, and this scenario specifies a new invocation.

**B(정답).** Include the first invocation's findings directly in the second delegation prompt.

**설명**

This is correct. A new, non-resumed Agent tool call spawns a separate subagent instance whose context contains only the delegation prompt. Since that instance has never seen the earlier work, the coordinator must restate the first invocation's findings explicitly in the second prompt.

**C.** Increase the subagent's context window so the earlier analysis is not evicted between the two calls.

**설명**

This is incorrect because the two invocations never share a context window at all. A new, non-resumed call is a fresh instance regardless of how much context the first one consumed, so window size and eviction within the first instance are not the cause.

**D.** Add an instruction to the subagent's system prompt telling it to retain its analysis for later invocations.

**설명**

This is incorrect because prompt wording cannot make a new, non-resumed instance see a previous instance's findings. Retaining a subagent's history across calls is achieved by resuming that subagent, not by instructions written into its system prompt.

### 전반적인 설명

The mental model to hold is that a new, non-resumed subagent invocation is a stateless worker. Each such Agent tool call spawns a fresh instance of that subagent type with a fresh context window. The only content that crosses the boundary going in is the delegation prompt string, and what comes back is the subagent's final message along with metadata such as the agent ID that can be used to resume it later. Intermediate tool calls, reasoning, and findings from a prior invocation do not reach a new instance, so a prompt like "continue the analysis you started" points at history the new instance has never contained.

This design is deliberate. Context isolation is what lets a subagent churn through verbose investigation without polluting the coordinator's window, and it is what makes parallel spawning safe. The tradeoff is that the coordinator owns the handoff: if a new invocation needs the first one's conclusions, the coordinator must carry those conclusions in its own conversation and paste them into the next delegation prompt, ideally in a structured form that separates findings from metadata. The SDK does offer a second path: resuming an existing subagent, which restores its full conversation history including previous tool calls and reasoning. The scenario specifies a new, non-resumed delegation, however, so explicit context passing is the fix.

The distractors all imagine mechanisms that do not apply here. Tool use IDs pair calls with results rather than reattaching a call to a live instance; a system prompt instruction to "remember" cannot substitute for resuming; and a larger context window is irrelevant when the two calls never share a window. See Subagents in the SDK and Create custom subagents for how subagent context is constructed, what it inherits, and how resuming works.

### 도메인

Agentic Architecture & Orchestration

## 질문 29

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : Your CI step validates Claude Code's refactor summaries against a JSON schema, and a downstream parser fails whenever a key is absent. The required string field ticket_id gets fabricated when no tracking ticket exists. What schema change is correct?

**A.** Keep ticket_id as a required string and add a strongly worded prompt instruction forbidding invented ticket identifiers.

**설명**

A prompt instruction cannot resolve a structural contradiction: the schema still demands a string value on every output, so when no ticket exists the model has no schema-valid way to comply with the instruction. Fabrication is caused by the schema, and only a schema change removes the pressure.

**B.** Keep the schema unchanged and instruct the model to write the sentinel value NONE into ticket_id when no ticket exists.

**설명**

Sentinel strings are an anti-pattern: they rely on instruction-following rather than the schema, they pollute the field's type with a magic value every consumer must special-case, and a valid-looking string like NONE can be confused with real data. JSON already has null to express absence explicitly.

**C(정답).** Keep ticket_id in the required list but change its type to ["string", "null"] so the model returns null when no ticket exists.

**설명**

This is correct because optional and nullable are distinct schema choices: keeping the field required guarantees the key is always present for the downstream parser, while the null type gives the model an honest way to represent absence instead of inventing a plausible ticket ID.

**D.** Remove ticket_id from the required list so the model can omit the field entirely whenever a refactor has no tracking ticket.

**설명**

Making the field optional does stop fabrication, but it allows the key to be absent from the output object, which the downstream parser cannot tolerate. The stated constraint is that missing keys break deserialization, so absence must be expressed as an explicit null, not an omitted field.

### 전반적인 설명

The root cause here is a schema that leaves the model no truthful move. When ticket_id is a required string, every schema-compliant output must contain a string value for it; on refactors with no ticket, the only way to satisfy the schema is to invent one. Fabrication under a too-strict schema is not a model bug, it is the schema working as written, so the fix must be structural rather than instructional.

The key design distinction is between optional and nullable fields. An optional field (omitted from required) may be left out of the output object entirely; a nullable field (a union type such as ["string", "null"]) must appear but may carry null. Anthropic's supported JSON Schema subset includes the null type and such type unions precisely so absence can be represented explicitly. Because this pipeline's parser errors on missing keys, the right shape is required but nullable: the key is present on every summary, and null unambiguously means no ticket. Note that structured output constrains responses to the schema in most cases, though documented exceptions exist (for example refusals or max-token truncation), so downstream validation remains worthwhile.

The alternatives fail on their own terms. Dropping the field from required trades fabrication for missing keys, breaking the stated deserialization contract. A prompt instruction pits guidance against a hard structural requirement the model must satisfy anyway. A sentinel string like NONE smuggles an out-of-band meaning into an in-band value, forcing every consumer to special-case it when null already exists for exactly this purpose.

See Structured Outputs and Increase output consistency for the supported schema features and guidance.

### 도메인

Prompt Engineering & Structured Output

## 질문 30

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : A developer built a personal changelog-drafting MCP server and wants it available in every repository they work in on their machine, without any teammate receiving it. How should the server be registered?

**A.** Add it to each repository's .mcp.json and tell teammates to decline it at the project-server approval prompt.

**설명**

A .mcp.json file at the project root is meant to be committed, so this ships the personal server to everyone who clones each repository. The approval prompt is a consent safeguard against repository-supplied processes, not a mechanism for opting teammates out of tooling that should never have been shared.

**B.** Define it in .claude/settings.local.json in each repository so the configuration stays out of version control.

**설명**

The .claude/settings.local.json file holds local Claude Code settings and is not the documented location for MCP server definitions. Even the MCP local scope stores its server entries in the home-directory ~/.claude.json, not in this project file.

**C.** Add it at local scope in each repository, repeating the registration whenever a new project is cloned.

**설명**

Local scope is private and also stored in ~/.claude.json, but it is active only in the project where it was added. Meeting the requirement of availability in every repository would demand a fresh registration per project, which user scope accomplishes with a single command.

**D(정답).** Register it once at user scope so it is stored in ~/.claude.json and loads across all projects.

**설명**

This is correct. User scope stores the server in ~/.claude.json, which is private to the developer's account and never shared through version control, while making the server available in every project on that machine. One registration satisfies both the cross-project and the privacy requirement.

### 전반적인 설명

Claude Code resolves MCP server configuration by scope, and the scope you choose is really a statement about audience and reach. A user-scoped server lives in ~/.claude.json in your home directory: it follows your account across every project on the machine but stays invisible to teammates, which is exactly the combination a personal utility used everywhere requires. A project-scoped server lives in .mcp.json at the repository root and is meant to be committed, so anyone who clones the project inherits it; that is the right home for shared team tooling and the wrong one for a private helper. Local scope, the default for claude mcp add, is also stored in ~/.claude.json but applies only to the project where it was added, making it suited to per-project experiments or credential-bearing servers rather than a utility needed in every repository.

Because a committed .mcp.json lets a cloned repository define processes that run on a developer's machine, Claude Code asks each user to approve project-scoped servers in interactive sessions before using them. That prompt exists for consent; relying on it so teammates can reject a personal server misuses the safeguard and clutters the shared file. Repeating a local-scope registration in every repository technically preserves privacy but recreates by hand what user scope provides once. And .claude/settings.local.json governs local Claude Code settings; it is not where MCP servers are defined, a distinction the documentation calls out explicitly. See Connect Claude Code to tools via MCP for scope behavior and the MCP quickstart for adding servers at each scope.

### 도메인

Tool Design & MCP Integration

## 질문 31

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The extraction schema's document_category field uses a closed enum of eight values. When unfamiliar document types arrive, the model shoehorns them into the nearest existing value, corrupting downstream routing. What schema change addresses this?

**A(정답).** Add an "other" enum value paired with a free-text detail field that records the actual category.

**설명**

This is the extensible categorization pattern: the closed enum still guarantees a controlled vocabulary for the eight known categories, while "other" gives the model an honest choice for anything outside them. The detail string captures what the document actually is, so new categories become visible instead of being silently misfiled.

**B.** Replace the enum with an unconstrained string field so the model can name any category it encounters.

**설명**

Removing the enum destroys the controlled vocabulary that downstream routing depends on; the model would produce inconsistent labels like "invoice", "Invoice", and "billing document" for the same type. The goal is extensibility without giving up the guaranteed value set.

**C.** Instruct the model in the prompt to choose the closest existing enum value whenever a document type is ambiguous.

**설명**

Choosing the nearest existing value is precisely the failure already occurring; instructing it explicitly institutionalizes the misclassification. The schema must offer a legitimate outlet for out-of-vocabulary types, which a prompt instruction alone cannot provide.

**D.** Expand the enum with every new category observed so far and redeploy the schema after each addition.

**설명**

Enumerating every observed category creates a maintenance treadmill and still fails the moment the next unseen document type arrives. A closed list, however long, cannot anticipate an open-ended input distribution.

### 전반적인 설명

A JSON schema enum is a contract: the model must emit one of the listed values, and downstream systems can rely on that vocabulary without normalization logic. The tradeoff is that an enum is closed, while real-world document streams are open. When the schema offers no honest answer for an out-of-vocabulary input, the model does not refuse; it satisfies the constraint by picking the least-wrong value, which is structurally valid and semantically corrupt. This is the same failure family as required fields forcing fabricated values: the schema leaves no legitimate way to say "none of the above."

The "other" plus detail string pattern resolves the tension. The enum keeps its guarantees for the known categories, "other" gives the model a truthful escape hatch, and the free-text detail field records what the document actually is. That detail field also becomes an operational feedback channel: reviewing what lands in "other" tells you which categories have earned promotion into the enum, so vocabulary growth is driven by evidence rather than schema redeployments. A related technique adds an "unclear" value for genuinely ambiguous cases, distinguishing "outside the vocabulary" from "cannot confidently classify."

Dropping the enum for a free-form string trades one failure for another, since routing now depends on labels the model invents inconsistently. Continuously appending observed categories never closes the gap, because the next novel type always misroutes first. And prompting the model to pick the closest match simply codifies the shoehorning the schema change is meant to eliminate. See Tool use with Claude for how input schemas constrain model output.

### 도메인

Prompt Engineering & Structured Output

## 질문 32

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : An agent tracing a re-exported utility Greps for each exported name, but the results list only file paths, so it cannot tell import statements apart from actual call sites. What is the correct next step?

**A.** Fall back to Bash running grep -rn, since the built-in Grep tool is limited to reporting file paths.

**설명**

The premise is wrong: the built-in Grep tool is not limited to file paths, it simply defaults to that mode. Dropping to shell grep abandons a purpose-built tool whose structured output the agent consumes, and the -r flag also ignores gitignore handling the built-in tool provides.

**B(정답).** Re-run Grep in content output mode so each match returns the matching line with its file and line number.

**설명**

Grep defaults to a files_with_matches mode that returns only the paths of files containing the pattern. Switching to content mode returns the matching lines themselves along with file and line numbers, which is exactly what is needed to distinguish imports from real call sites.

**C.** Wrap the search pattern in wildcards such as .*name.* so Grep returns entire matching lines instead of paths.

**설명**

The regex pattern controls what text is matched, not how results are reported. Broadening the pattern with wildcards leaves the output mode unchanged, so the tool would still return only file paths.

**D.** Switch to Glob with the exported name as the pattern, since Glob reports richer detail about each match than Grep.

**설명**

Glob matches file names and paths against patterns; it never inspects file contents, so an exported symbol name is not something Glob can search for. It also returns no line-level detail of any kind.

### 전반적인 설명

The built-in Grep tool, which is backed by ripgrep, has more than one way of reporting results. Its default, files_with_matches, answers the question "which files contain this pattern?" by returning file paths only. That default is a deliberate economy: for many searches, knowing where a symbol lives is enough, and returning every matching line for a common identifier would flood the context window. When the task requires inspecting the matches themselves, such as separating an import statement from an actual invocation of a re-exported function, the agent should request content mode, which returns each matching line together with its file and line number. An alternative documented pattern is to keep the path list and follow up with Read on the relevant files, but re-running the search in content mode gets the call-site evidence in a single step.

The mental model worth keeping is that a search has two independent axes: what to match (the regex pattern) and what to report (the output mode). Widening the pattern with wildcards changes only the first axis, so the output stays a list of paths. Reaching for Glob confuses the axes entirely; Glob matches file names and paths against patterns and never looks inside files, so it cannot locate a symbol at all. Falling back to grep -rn in Bash works mechanically but rests on a false belief about the built-in tool's limits and gives up its structured results and default gitignore-aware filtering.

See the Claude Code tools reference for the Grep tool's output modes and its relationship to Glob and Read.

### 도메인

Tool Design & MCP Integration

## 질문 33

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : In pilot runs, subagents keep surfacing significant angles the coordinator's upfront topic decomposition never anticipated, such as a pending regulation, and those angles are never researched. Which change fixes this?

**A.** Expand the initial decomposition prompt with a much longer checklist of candidate subtopics so unexpected angles are covered before research begins.

**설명**

A longer upfront checklist is an arms race against topics that are by definition unanticipated; no fixed list written before research starts can enumerate what only the research will reveal. It also bloats every run with subtasks that are irrelevant to most topics.

**B(정답).** Have the coordinator evaluate intermediate findings between delegation rounds and generate new subtasks targeting what those findings reveal.

**설명**

This is adaptive decomposition: the plan updates as evidence arrives, so discoveries made mid-research become new investigation subtasks. The coordinator retains ownership of the plan while the plan itself evolves, which is exactly what open-ended research requires.

**C.** Instruct the synthesis subagent to fill in unanticipated angles from its own general knowledge when composing the final report.

**설명**

Padding the report with uninvestigated general knowledge undermines the system's stated purpose of producing cited, researched findings. The gap is in investigation coverage, and only new research subtasks can close it with sourced material.

**D.** Give each subagent a broader mandate to independently pursue any related angle it encounters during its own assigned task.

**설명**

Uncoordinated scope expansion causes duplicated effort and inconsistent coverage, and a discovery made by one subagent still cannot trigger investigation by a differently specialized agent. Subagents have isolated context, so cross-cutting follow-up must flow through the coordinator.

### 전반적인 설명

Open-ended research is the canonical case for dynamic adaptive decomposition: the full scope of an unfamiliar topic is unknowable before investigation starts, so the plan must be allowed to change as evidence arrives. The mental model is a loop, not a pipeline. The coordinator decomposes what it knows, delegates, then treats the returned findings as input to a fresh planning step: does anything discovered warrant a new subtask? Anthropic documents this pattern as chaining subagents, where each subagent completes its task, returns results, and Claude passes relevant context into the next delegation, letting later subtasks be shaped by earlier discoveries. See Create custom subagents.

The reason the loop must live in the coordinator, rather than in individual workers, is context isolation. Each subagent sees only what its prompt contains and returns only its final summary, so a regulation discovered by the web search agent is invisible to every other agent unless the coordinator routes it into a new delegation. Broadening each worker's mandate cannot substitute for this, and it sacrifices the specialization and non-overlapping coverage that made the decomposition useful in the first place. For orchestration that grows beyond what one conversation can coordinate, Anthropic also documents dynamic workflows, where a script holds the loop and branching so only final answers reach Claude's context.

The remaining options fail on principle rather than execution. A bigger upfront checklist is still a fixed pipeline, appropriate for predictable, template-like work but structurally unable to cover discoveries that only emerge mid-investigation. And having synthesis invent coverage from general knowledge converts a research gap into an uncited claim, which is worse than reporting the gap: for a cited research product, findings must trace back to investigated sources.

### 도메인

Agentic Architecture & Orchestration

## 질문 34

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The extraction prompt instructs Claude to "only extract values you are highly confident about," yet fields are still populated with guessed values from ambiguous passages. What change most improves extraction precision?

**A.** Rewrite the instruction as "extract a value only when you are absolutely certain it appears in the document".

**설명**

This intensifies a subjective instruction without adding any operational content. "Absolutely certain" is just as uninterpretable as "highly confident," so the model's extraction behavior remains inconsistent.

**B(정답).** Replace the confidence wording with explicit rules defining when a field may be populated and when it must be null.

**설명**

This is correct because specific, testable criteria give the model an operable decision rule, such as populating a date field only when the document explicitly labels the date and returning null otherwise. Vague confidence language has no operational content, so the model interprets it inconsistently across documents.

**C.** Have the model attach a self-rated confidence score to each extracted field and discard values below a fixed threshold.

**설명**

Self-reported confidence scores are poorly calibrated, so thresholding on them filters values unreliably rather than fixing the judgment that produced them. The model still lacks a concrete rule for when a field should be populated at all.

**D.** Lower the sampling temperature so the model stops committing to values it cannot verify in the source.

**설명**

Temperature affects how deterministically tokens are sampled, not the model's judgment about whether a value is actually supported by the document. A model with a vague decision rule will make the same speculative extractions more consistently, not less often.

### 전반적인 설명

Instructions like be conservative or only report high-confidence findings fail because they are subjective: the model has no way to translate them into a repeatable decision. Each document triggers a fresh interpretation of what "highly confident" means, which is exactly why the guessing persists despite the instruction. The fix is to convert the intent into explicit categorical criteria: state precisely which conditions permit a field to be populated (for example, the value is explicitly stated or labeled in the source) and which require null (the value would have to be inferred, or the passage is ambiguous). That turns a vibe into a rubric the model can apply consistently, and it pairs naturally with a nullable schema that gives the model a legitimate way to say a value is absent.

The distractors each miss the mechanism. Intensifying the wording ("absolutely certain") adds emphasis to an instruction that still contains no testable boundary. Self-rated confidence scores are known to be poorly calibrated, so filtering on them reorders noise rather than reducing it; they can be useful as a routing signal, but not as a substitute for a decision rule. Lowering temperature changes sampling determinism, not judgment: an unanchored extraction policy simply becomes reproducibly wrong.

The general mental model: precision problems in model output are almost always specification problems, not sampling or emphasis problems. See Anthropic's guidance on being clear and direct, which recommends replacing subjective qualifiers with concrete, checkable instructions.

### 도메인

Prompt Engineering & Structured Output

## 질문 35

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The system consolidates field values extracted from several documents into one record, but auditors cannot trace a disputed value back to its source because the merge step outputs only final values. What is the structural fix?

**A.** Attach the complete list of input document names to each consolidated record so reviewers know which documents were processed.

**설명**

A document list is a bibliography, not attribution. It tells auditors what was read but does not bind any individual field value to the document that supplied it, so a disputed value still cannot be traced to its source.

**B.** Have Claude reconstruct source attributions after merging by matching each consolidated value back against the original documents.

**설명**

Post-hoc reconstruction is unreliable: the same value may appear in multiple documents, values may have been normalized during extraction, and the model can plausibly but incorrectly match a value to the wrong source. Attribution must be preserved at extraction time, not rebuilt after it has been lost.

**C.** Limit the pipeline to a single consolidation pass so attribution has fewer opportunities to be dropped.

**설명**

Reducing the number of compression steps only reduces how many times attribution can be stripped; the remaining pass still discards source links if they are not carried as structured data. The failure is in what the pipeline preserves, not in how many stages it has.

**D(정답).** Require each extraction output to include structured value-to-source mappings that the merge step preserves in the consolidated record.

**설명**

This is correct because provenance survives consolidation only when it travels as structured data alongside each value. When every extracted value carries its source document and supporting excerpt, the merge step can carry those mappings forward, so any disputed field in the consolidated record can be traced to the exact document it came from.

### 전반적인 설명

Attribution loss is a structural property of aggregation, not a prompting problem. Every time outputs from multiple extractions are compressed or merged, any information that is not represented as explicit data gets dropped: a merge step asked to produce final field values will produce exactly that, and the link between each value and its originating document silently disappears. The mental model is that provenance is data, not commentary: if a value-to-source mapping is not a first-class part of every intermediate output, no downstream stage can recover it.

The reliable design therefore requires each extraction to emit structured associations (value, source document name, supporting excerpt, and ideally a date) and requires every downstream stage, including the consolidation step, to preserve those mappings rather than flatten them into bare values. This is the same principle Anthropic describes for multi-agent research synthesis: claim-source mappings must be carried through combination so the final output merges attributed facts rather than anonymous ones. It also pays off when sources disagree, because a conflict between two attributed values can be surfaced and reconciled deliberately instead of being resolved by silent selection.

The alternatives fail in characteristic ways. Reconstructing attribution after the merge asks the model to guess which document supplied a value, which invites confident but wrong matches, especially after normalization changes the value's surface form. Listing every input document provides coverage information without binding any specific value to any specific source, so audits still stall on disputed fields. Collapsing the pipeline into a single pass merely reduces the number of places attribution can be lost; the surviving pass still loses it unless the mappings are structural. See How we built our multi-agent research system and Tool use with Claude for how structured outputs keep metadata intact across processing stages.

### 도메인

Context Management & Reliability

## 질문 36

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : The agent's refund eligibility logic accepts requests dated outside the 30-day return window because one date comparison is missing. You know the exact file and the single conditional required, and you have chosen direct execution. How should you frame the request to Claude Code?

**A.** Switch to plan mode first so Claude can research the refund flow and produce an approach for review before writing the conditional.

**설명**

This adds overhead the task does not need. Plan mode earns its cost when the approach is uncertain or the change spans many files; for a single known conditional whose diff can be described in one sentence, the documented guidance is to skip planning and ask for the fix directly.

**B(정답).** Reference the exact file and function, describe the missing comparison, and state what correct rejection behavior looks like.

**설명**

This is correct because direct execution still benefits from a precisely scoped request. Anthropic's guidance is to reference specific files and constraints and, for bugs, to describe the symptom, the likely location, and what fixed looks like, which lets Claude implement the change immediately without exploratory detours.

**C.** Prompt broadly to improve date handling in the refund flow and let Claude explore the codebase to locate the change itself.

**설명**

A vague prompt discards the knowledge you already have, forcing Claude to explore and risking a broader change than intended. When the file and fix are known, stating them directly is both faster and more reliable than open-ended discovery.

**D.** Expand the request to validate every date field in the refund flow so the single session covers related risks at once.

**설명**

This inflates a well-scoped one-conditional fix into a multi-site change with uncertain scope, which is exactly the profile that would call for planning rather than direct execution. Bundling speculative work into a targeted fix also makes the resulting diff harder to review.

### 전반적인 설명

Claude Code's plan mode and direct requests sit on a spectrum of ceremony, and the deciding variable is how well the change is already understood. Anthropic's best-practices guidance is explicit: planning pays off when the approach is uncertain, the change spans multiple files, or the code is unfamiliar, but it adds overhead for small, clear changes. The rule of thumb in the documentation is that if the diff can be described in one sentence, you should skip the plan and ask for the change directly. A missing date comparison in a known function is squarely in that category.

Choosing direct execution does not mean choosing a vague prompt. The same guidance tells you to make even direct fixes precisely scoped: name the specific file, describe the symptom (requests outside the 30-day window being accepted), and state what fixed behavior looks like (those requests are rejected). That specificity is what lets Claude go straight to the edit instead of burning turns rediscovering context you already hold. It also keeps the diff minimal and reviewable, which matters for a change touching refund eligibility.

The distractors illustrate the two failure directions. Routing a one-line conditional through plan mode is ceremony without benefit; broadening the prompt, either by asking vaguely about date handling or by bundling in validation of every date field, converts a well-understood change into an uncertain one, which is the very condition under which planning would then become appropriate. Direct execution works precisely because the scope stays as narrow as your understanding. See Claude Code best practices and Permission modes.

### 도메인

Claude Code Configuration & Workflows

## 질문 37

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : An Agent SDK harness receives a coordinator response containing three tool_use blocks, each spawning a read-only code analysis subagent; the coordinator states it will delegate file edits after reviewing the findings. How should the harness handle this batch?

**A.** Execute the three calls strictly in the order the tool_use blocks appear, because the model emitted them in the sequence it expects them to complete.

**설명**

This is incorrect because the documentation states the runtime does not require tool calls to execute in the order they appear. Forcing sequential execution throws away the latency benefit of parallelism for three independent analysis tasks.

**B.** Execute one call, return its result immediately, and wait for the model to re-issue the remaining calls so each runs with fresh context.

**설명**

This is incorrect because it collapses a parallel batch back into one call per turn, multiplying latency and API round trips. It also means returning tool results in separate messages, which the documentation warns against because it discourages future parallel tool use.

**C.** Run the three calls concurrently but return each tool_result in its own user message the moment its subagent finishes, so the coordinator sees results sooner.

**설명**

This is incorrect because the documentation explicitly warns against sending separate user messages for separate tool results. Drip-feeding results this way breaks the expected turn structure and teaches the model away from batching parallel tool calls in the future.

**D(정답).** Run the three analysis calls concurrently and return all three tool_result blocks together in the next user message.

**설명**

This is correct because the API does not prescribe an execution order for multiple tool calls in one response, and independent read-only work is safe to run in parallel. Returning every matched tool_result together in a single user message follows the documented pattern, after which the coordinator can spawn the editing subagent with the findings explicitly included in its prompt.

### 전반적인 설명

When Claude returns a response with stop_reason: "tool_use", that response can contain multiple tool_use blocks at once. A critical design point that follows is that the API is silent on execution order: it hands the harness a batch of requested calls and leaves scheduling entirely to your code. You may run them concurrently, sequentially, or in a mixed strategy, and the right choice depends on the nature of each call, not on the order the blocks happen to appear in the response. Independent, read-only work (searching, analyzing, summarizing) is the ideal candidate for concurrent execution because no call can corrupt another's inputs.

The second half of the pattern is how results go back. For every tool_use block, the harness must return exactly one tool_result referencing its tool_use_id, and all of those tool_result blocks belong together in a single next user message. The documentation explicitly calls out sending separate user messages for separate results as an anti-pattern: it not only adds round trips, it teaches the model away from batching calls in future turns.

The dependent editing step belongs to a later turn for a reason. Subagents are isolated instances that see only what their spawning prompt contains, so an editing subagent can act on the analysis findings only after those findings have returned to the coordinator and the coordinator has written them explicitly into a new delegation. Serializing the analyses wastes the latency win parallel dispatch exists to provide, and drip-feeding results, whether one call per turn or one message per result, degrades both throughput and the model's batching behavior over time.

See Parallel tool use and Subagents in the SDK for the documented behavior.

### 도메인

Agentic Architecture & Orchestration

## 질문 38

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : The team's automation that extracts structured refactoring findings previously requested JSON in plain text; it now defines an extraction tool with an enforced input schema. Which downstream post-processing step can be safely retired?

**A.** Retire the validator that confirms each severity label matches the seriousness of the described issue.

**설명**

A schema enum can restrict severity to allowed values, but it cannot judge whether the chosen label is appropriate for the issue described. Semantic consistency between fields is outside what schema enforcement guarantees, so this validator is still needed.

**B.** Retire the entire validation layer, since schema-conformant extractions are guaranteed to be accurate.

**설명**

This overstates the guarantee. Schema conformance ensures correct structure, types, and required fields, not factual accuracy or internal consistency of the values, so removing all validation would let semantic errors flow downstream unchecked.

**C.** Retire the check that confirms each finding's file path and line number exist in the repository.

**설명**

This check verifies semantic correctness: whether the values point at real locations. A schema can only enforce that a path is a string and a line number is an integer; it cannot confirm the referenced location exists, so this validation must remain.

**D(정답).** Retire the repair logic that stripped markdown fences and re-parsed malformed JSON before ingestion.

**설명**

This is correct because schema-enforced tool use guarantees syntactically valid, schema-conformant JSON by construction. Malformed syntax, stray commentary, and markdown fences are exactly the failure modes the tool_use channel eliminates, so repair-and-reparse code no longer has anything to catch.

### 전반적인 설명

The useful mental model is a boundary line: schema-enforced structured output constrains the shape of what Claude produces, not the meaning of the values inside it. When output arrives as tool input validated against an input_schema (or via Anthropic's structured outputs feature), you get well-formed JSON, correctly typed fields, and all required properties present. That means an entire class of defenses built for the free-text era, fence stripping, syntax repair, re-parse retries, becomes dead code: the failure it guarded against can no longer occur, because the output is schema-valid by construction.

What does not change is everything on the semantic side of the line. With strict tool use, Anthropic documents the guarantee as schema compliance: valid tool names, correct types, no missing required fields. Nothing in that guarantee says a file path points at a real file, a line number falls inside the diff, or a severity label fits the issue it describes. Those are relationships between values and the world, which only code-level validation can check. Retiring the location-existence check or the severity-consistency validator would silently admit plausible but wrong extractions, and retiring the whole validation layer treats a structural guarantee as if it were an accuracy guarantee.

The design intent behind this split is deliberate: constrained generation can enforce grammar cheaply and deterministically, while correctness of content depends on the source material and requires verification logic the schema cannot express. Architecturally, the right move after adopting schema enforcement is to delete syntax-repair code and keep, or strengthen, semantic validation.

### 도메인

Prompt Engineering & Structured Output

## 질문 39

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The team's /extract-record skill declares an argument-hint listing the expected document path and schema name. Engineers still occasionally pass a schema name that does not exist, and the extraction fails downstream. What is the correct fix?

**A.** Enable context: fork in the frontmatter so an invalid schema name fails inside an isolated subagent rather than the main session.

**설명**

The context: fork option isolates a skill's verbose output from the main conversation. It changes where the failure happens, not whether it happens; the bad schema name still produces a failed extraction.

**B(정답).** Keep the hint as guidance and add a schema-name validation step to the skill's instructions, since argument-hint only displays expected arguments.

**설명**

This is correct because argument-hint is display metadata: it shows engineers what arguments the skill expects but performs no checking of the values actually supplied. Catching a nonexistent schema name requires a validation step in the skill's own procedure or in surrounding code.

**C.** Set allowed-tools in the SKILL.md frontmatter so the skill can only reach schemas that are registered in the project configuration.

**설명**

The allowed-tools field restricts which tools a skill may invoke during execution; it does not constrain or validate the arguments passed to the skill. A wrong schema name would still flow into the skill unchanged.

**D.** Rewrite the argument-hint to enumerate every valid schema name so invocations passing an unknown name are rejected before the skill runs.

**설명**

This misattributes enforcement power to argument-hint. Even if the hint listed every valid schema, it would remain informational; nothing in the hint mechanism inspects or rejects the values an engineer actually supplies.

### 전반적인 설명

A useful mental model for SKILL.md frontmatter is to separate its fields into two families. Some fields are display metadata that shape how a skill is discovered and invoked: the description tells Claude when the skill applies, and argument-hint shows developers what arguments the skill expects at invocation time. Other fields are execution controls that actually constrain what happens when the skill runs: allowed-tools bounds which tools the skill may call, and context: fork isolates its work in a subagent. Nothing in the display family enforces anything; nothing in the execution family validates argument values.

That is why the failure here persists. argument-hint improves the odds that an engineer supplies the right arguments, but it never inspects what was typed, so a plausible-looking yet nonexistent schema name sails through. Validation of argument values has to live where behavior is defined: instruct the skill to verify the schema name against the project's registered schemas before extracting, and fail with a clear message when it does not resolve. For guarantees stronger than instructions, the same check can run in code, for example as a hook, but the essential correction is recognizing that a hint is not a gate.

The distractors each stretch a real frontmatter field past its documented boundary: enumerating schemas in the hint still rejects nothing, allowed-tools governs tool access rather than argument content, and context: fork relocates a failure without preventing it. See Agent Skills and Slash commands for the frontmatter reference.

### 도메인

Claude Code Configuration & Workflows

## 질문 40

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : Subagent prompt templates in this system live as *.prompt.md files scattered across a dozen packages. Conventions for writing these templates should load automatically whenever one is edited. What is the most maintainable configuration?

**A.** Add a CLAUDE.md beside the templates in every package directory, keeping each copy synchronized as conventions change.

**설명**

Subdirectory CLAUDE.md files are directory-bound and loaded by traversal, so covering a dozen scattered locations means a dozen duplicated files. Every convention change must then be replicated everywhere, which is exactly the maintenance burden path-scoped rules avoid.

**B.** Put the template conventions in the root CLAUDE.md so they are present in every session regardless of the task.

**설명**

Root CLAUDE.md content loads into every session, so the conventions would consume context even when no template is touched. Anthropic guidance recommends moving instructions that only matter for a subset of files into path-scoped rules to reduce always-loaded noise.

**C(정답).** Add a .claude/rules/ file with a paths frontmatter glob matching **/*.prompt.md so the conventions load for those files.

**설명**

This is correct because path-scoped rules in .claude/rules/ activate based on glob patterns, loading only when Claude works with matching files regardless of where they sit in the tree. One centrally maintained file covers every scattered template without duplicating content or loading it into unrelated sessions.

**D.** Package the conventions as a skill in .claude/skills/ that developers invoke before editing any template file.

**설명**

Skills are on-demand workflows, so the conventions would apply only when someone remembers to invoke the skill. A convention that must hold whenever a matching file is edited needs automatic loading, which path-scoped rules provide and skills do not.

### 전반적인 설명

The deciding factor here is where the files live versus how the mechanism activates. Subdirectory CLAUDE.md files are discovered by directory traversal: Claude Code loads them when it works inside that directory's subtree. That model fits conventions owned by a single folder, but it breaks down when the same convention applies to files scattered across many packages, because you would need one copy per location and every copy drifts independently.

Path-scoped rules in .claude/rules/ invert the model: a single Markdown file declares a paths glob in YAML frontmatter (for example **/*.prompt.md), and the rule activates whenever Claude works with a matching file, wherever it sits in the tree. The rule is maintained in exactly one place, and because it loads conditionally rather than at launch, it does not tax the context window of sessions that never touch a template. Anthropic's monorepo guidance frames this tradeoff directly: use per-directory CLAUDE.md when directory owners maintain conventions alongside their code, and path-scoped rules when the same rule applies to many scattered paths.

The other approaches misuse their mechanisms. Loading everything through the root CLAUDE.md works but makes the conventions unconditional, adding context to every session; the docs recommend moving narrowly relevant instructions into path-scoped rules for exactly this reason. A skill makes the conventions opt-in, which is the wrong contract for something that must always apply when a matching file is edited; skills are designed for on-demand task workflows, not ambient conventions. See Manage Claude's memory and Working with large codebases.

### 도메인

Claude Code Configuration & Workflows

## 질문 41

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The coordinator currently retries every subagent report that contains no results, so queries that succeeded but matched nothing are re-run repeatedly alongside genuine timeouts. Which change stops the wasted retries without losing information?

**A.** Cap the coordinator at two retries per query for any no-result report, bounding the wasted cycles regardless of outcome type.

**설명**

A retry cap limits the cost of the bug but does not fix it: valid empty results still trigger retries, and the underlying conflation of access failures with successful zero-match queries remains. The coordinator still cannot tell whether a query found nothing or the search infrastructure failed.

**B.** Filter zero-result reports out before they reach the coordinator so they can never trigger the retry logic.

**설명**

Suppressing these reports is an anti-pattern: the coordinator loses the information that a query was run and legitimately found nothing, so it cannot distinguish an uncovered subtopic from one that was never investigated. The retry waste stops, but at the cost of accurate coverage tracking.

**C.** Have the subagent automatically broaden any query that returns zero matches until at least one result comes back.

**설명**

Forcing broader queries until something matches manufactures relevance rather than reporting reality; a zero-match result may accurately mean no sources exist for that subtopic. This behavior would pollute the research with tangential material and hide genuine coverage gaps from the coordinator.

**D(정답).** Retry only reports flagged as access failures, and record successful zero-match queries as findings that feed coverage annotations.

**설명**

This is correct because a timeout and a zero-match result are semantically different outcomes: only the access failure warrants a retry decision, while a successful query with no matches is itself an informative finding. Recording zero-match outcomes lets the synthesis stage annotate genuine coverage gaps instead of the system endlessly re-running queries that already produced their answer.

### 전반적인 설명

The core distinction being tested is between an access failure (a timeout or service error, where the query never completed) and a valid empty result (a query that completed successfully and matched nothing). These are different outcomes that demand different responses: an access failure poses a retry decision, because the data may exist and the system simply failed to reach it, while a zero-match result is a completed measurement. Retrying it re-asks a question that has already been answered, and treating it as a failure hides useful information from downstream stages.

Anthropic's own tool interfaces encode this separation. The Web search tool represents an execution error as a distinct error object in the tool result, whereas a search that succeeds with no matches returns an empty content list; the two shapes are deliberately not interchangeable. Likewise, for client tools, handling tool calls reserves is_error: true for genuine execution failures, keeping the empty-result shape separate. A well-designed coordinator should mirror that contract: route error-flagged reports into retry or alternative-approach logic, and route successful zero-match reports into the research record, where the synthesis stage can annotate which subtopics simply have no available sources.

The distractors each fail this test. Capping retries bounds the waste without curing the misclassification. Auto-broadening queries until something matches fabricates relevance and erases the finding that nothing exists. Filtering the reports out is silent suppression: the wasted retries stop, but the coordinator can no longer distinguish an investigated-but-empty subtopic from one that was never searched, degrading the honesty of the final cited report.

### 도메인

Context Management & Reliability

## 질문 42

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : You define three triage tools, one per request category (returns, billing, account), and set tool_choice to "any" so intake always yields structured output. Billing disputes are occasionally triaged through the returns tool. What is the right fix?

**A.** Set tool_choice to "none" on the first turn so the model states the category in text before a structured tool call is compelled.

**설명**

The "none" mode prevents any tool use, so the first turn would produce free text rather than structured output, defeating the intake design. A prose pre-classification also does not bind the subsequent tool selection, so the misrouting can still occur on the following turn.

**B.** Force a single named triage tool with tool_choice type "tool" so misclassification between schemas can no longer occur on any request.

**설명**

Forcing one named tool eliminates selection errors only by routing every request through one schema. Since requests genuinely span three categories, returns and account issues would be shoehorned into whichever schema is forced, replacing occasional misclassification with systematic misclassification.

**C.** Change tool_choice to "auto" so the model deliberates over the request before committing itself to one of the triage tools.

**설명**

The "auto" mode does not add deliberation; it simply permits the model to respond with plain text instead of calling a tool. This sacrifices the guarantee that intake always produces structured output while doing nothing to improve how the model distinguishes the categories.

**D(정답).** Sharpen the tool descriptions to separate the categories, since "any" compels a tool call but leaves the choice of tool to the model.

**설명**

This is correct because tool_choice "any" only guarantees that some provided tool is called; it does not influence which one. Tool selection is driven by the tool definitions themselves, so descriptions with clear category boundaries are the mechanism for fixing cross-schema misclassification while keeping the structured-output guarantee.

### 전반적인 설명

The tool_choice parameter has four documented modes, and each answers a different question. auto (the default when tools are provided) lets the model decide whether to call a tool at all; any requires the model to call some provided tool but deliberately leaves the selection among them to the model; {"type": "tool", "name": ...} pins the call to one named tool; and none blocks tool use entirely. The mental model is a two-axis decision: one axis controls whether a tool call happens, the other controls which tool. any locks only the first axis, which is exactly why it is the right setting when several extraction schemas exist and the request type is unknown up front.

Once any is set, the second axis, which tool gets called, is governed by the tool definitions. The description field is the model's primary selection signal: when triage tools have vague or overlapping descriptions, the model confuses adjacent categories such as billing disputes and returns. The fix belongs in the definitions, stating what each tool covers, what it does not, and when to prefer it over its neighbors, not in the tool_choice setting, which is already doing its job.

The distractors each break one axis to patch the other. Forcing a single named tool trades occasional misrouting for a guaranteed schema mismatch on two of the three categories. Switching to auto or none surrenders the structured-output guarantee that motivated the design, and neither mode makes the model any better at telling the categories apart. See Implement tool use and the tool use overview for the documented behavior of each mode and guidance on writing tool descriptions.

### 도메인

Prompt Engineering & Structured Output

## 질문 43

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The document analysis subagent must extract cited claims into a uniform structure, but source documents vary: some use inline author-year citations, others use numbered bibliography references. Detailed extraction instructions still produce inconsistent handling across these formats. What is the most effective fix?

**A.** Restate the citation-handling rules at the end of the prompt and mark them IMPORTANT so the subagent cannot overlook them.

**설명**

Emphasis raises the priority of an instruction relative to quieter rules, but it does not make an abstract rule easier to apply. The inconsistency here comes from the model interpreting the rules differently across document structures, not from ignoring them.

**B(정답).** Add few-shot examples showing correct extraction from inline-citation documents and from bibliography-style documents.

**설명**

This is correct because examples covering each document structure demonstrate the extraction judgment directly, which is more effective than abstract instructions when detailed rules alone produce inconsistent results. The model generalizes the demonstrated handling to new documents of either style.

**C.** Add a preprocessing step that converts every source into a single normalized citation format before the subagent extracts claims.

**설명**

Reliably converting arbitrary citation styles is itself the same interpretation problem the extraction step already faces, so this adds a fragile pipeline stage without solving the underlying inconsistency. It also risks losing citation detail the report generator needs.

**D.** Set the subagent's sampling temperature to zero so extraction rules are applied deterministically across all documents.

**설명**

Lower temperature reduces run-to-run randomness on the same input but does not teach the model how to handle structurally different documents. The variation here is driven by differing source formats, which temperature does not address.

### 전반적인 설명

This failure pattern, where detailed instructions produce reasonable output on some inputs but inconsistent output across structurally different inputs, is the classic signal to reach for few-shot examples. Anthropic documents examples as one of the most reliable ways to steer output format and structure, and explicitly notes that constraining behavior with examples is more effective than abstract instructions for consistency. The reason is that prose rules describe a policy the model must interpret, while a worked example transfers the judgment itself: showing an inline author-year citation mapped to the target structure, alongside a numbered bibliography reference mapped to the same structure, teaches the decision boundary the model then generalizes to novel documents.

Good examples for this purpose should mirror the real use case and be diverse enough to cover the variation you actually see; wrapping each in <example> tags keeps them cleanly separated from instructions. For extraction across varied document layouts, one targeted example per structural pattern is far more valuable than more paragraphs of rules.

The alternatives each miss the mechanism. Emphasis markers like IMPORTANT reallocate attention among instructions but cannot make a vague rule operational across formats. A normalization preprocessor just relocates the interpretation problem upstream and adds a lossy, fragile stage. Temperature zero makes token selection deterministic per input; it does nothing about inputs that differ structurally, which is where the inconsistency originates. See Prompt engineering best practices and Increase output consistency.

### 도메인

Prompt Engineering & Structured Output

## 질문 44

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : Your next task migrates roughly 60 files off a legacy ORM, and the team is split between an incremental adapter layer and a direct rewrite. How should you structure the Claude Code workflow?

**A.** Use direct execution a few files at a time, switching to plan mode only if the changes begin to conflict.

**설명**

This is incorrect because it is reactive: by the time conflicts surface, edits have already been made under an unvalidated strategy and must be unwound. For work with architectural implications, planning belongs before the first edit, not after problems appear.

**B.** Start in direct execution with detailed upfront instructions that fully specify the adapter layer design.

**설명**

This is incorrect because it presupposes the adapter layer is the right strategy before anyone has explored the codebase, which is exactly the open question. Detailed instructions cannot substitute for investigation when the team has not yet resolved which approach fits the actual dependency structure.

**C.** Enable extended thinking during direct execution so the model reasons through the strategy choice while editing.

**설명**

This is incorrect because extended thinking deepens reasoning on a given step but does not change the workflow: Claude is still committing edits while the fundamental approach is undecided. It also gives the team no plan artifact to review before dozens of files change.

**D(정답).** Begin in plan mode so Claude explores the codebase and compares the two strategies, then execute the approved plan.

**설명**

This is correct because the task has both hallmarks that call for plan mode: a large multi-file change and multiple viable approaches. Plan mode lets Claude read and explore without editing, produce a plan you can evaluate against both strategies, and only then move to implementation, which is far cheaper than reworking a 60-file change that went down the wrong path.

### 전반적인 설명

Plan mode is a Claude Code permission mode that separates exploration from implementation: Claude can read files and run investigation commands, but it makes no edits until you approve the plan it proposes. The mental model is a design review built into the workflow; the cost of the extra step is small, and it pays off whenever committing to the wrong approach would be expensive to unwind. That is exactly the profile here: roughly 60 files affected and two genuinely viable strategies (adapter layer versus direct rewrite) that need to be weighed against what exploration of the codebase actually reveals.

The decision framework is driven by scope and certainty. Direct execution suits changes whose diff you could describe in a sentence, such as a single-file fix with a clear stack trace. Plan mode suits large-scale changes, unfamiliar code, architectural decisions, and situations with competing approaches. The typical flow combines both: plan first, review and iterate on the plan (iterating on a plan is much faster than cleaning up after a misdirected run), then approve and let Claude execute.

Front-loading a fully specified adapter design skips the investigation that should decide between the strategies. Executing incrementally and planning only when conflicts appear means paying for rework the plan would have prevented. Extended thinking improves reasoning depth within a step but does not defer edits or produce a reviewable plan, so it does not address the workflow problem. See Permission modes for how plan mode constrains actions before approval.

### 도메인

Claude Code Configuration & Workflows

## 질문 45

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : While the agent updates a JSON schema configuration file, an Edit call fails because the anchor text appears in four identical field definitions. Which TWO approaches correctly complete the modification? (Select TWO.)

**A.** Retry Edit with a regular expression pattern crafted so it matches only the intended one of the four occurrences.

**설명**

Edit performs exact string replacement, not regex or fuzzy matching. A regular expression in old_string would be treated as literal text and would not match anything in the file, so the call would still fail.

**B.** Call Write with only the modified snippet and rely on the tool to merge it into the existing file contents.

**설명**

Write creates new files or completely overwrites existing ones; it performs no merging. Writing only the snippet would replace the entire schema file with that fragment, destroying the rest of its contents.

**C(정답).** Use Read to load the full file contents, then Write the complete modified version back.

**설명**

This is the documented fallback when Edit cannot satisfy its uniqueness requirement. Reading the whole file and writing the full modified content bypasses text matching entirely, so repetitive file structure no longer blocks the change.

**D(정답).** Retry Edit with a longer old_string that includes enough surrounding context to isolate the target occurrence.

**설명**

Edit's uniqueness check can be satisfied by expanding the old_string to include neighboring lines that distinguish the intended occurrence from the identical ones. This keeps the change targeted and avoids rewriting the entire file.

### 전반적인 설명

The Edit tool works by exact string replacement: it takes an old_string and a new_string, and the old_string must appear exactly once in the file. This design makes edits safe and predictable, since the tool never guesses which occurrence you meant, but it also means files with repetitive structure (identical field definitions, boilerplate blocks, generated schemas) can defeat the match. When that happens, there are two documented paths forward.

The first is to make the match unambiguous: retry Edit with a longer old_string that pulls in enough surrounding context (adjacent keys, comments, or lines) to pin down a single occurrence. The second is the full-file fallback: use Read to load the entire file, apply the change to the content, and use Write to save the complete modified version. The fallback is more reliable because it sidesteps matching altogether, at the cost of handling the whole file rather than a targeted span.

The distractors misunderstand the tools' contracts. Edit does not accept regular expressions; even whitespace and indentation differences break its literal matching, so a regex pattern would simply fail to match. And Write does not merge: it creates or fully overwrites a file, so writing only a snippet would obliterate the rest of the schema. See the Claude Code tools reference for the precise behavior of Read, Edit, and Write.

### 도메인

Tool Design & MCP Integration

## 질문 46

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : A customer message raises a defective-item refund, a duplicate billing charge, and a shipping address change. Logs show the agent resolves each concern in a separate sequential pass, calling get_customer again at the start of every pass. Which redesign best reduces loop count while protecting first-contact resolution?

**A.** Add a caching layer inside the MCP server so repeated get_customer calls return instantly without hitting the backend systems.

**설명**

Caching makes the redundant lookups cheaper for the backend, but every repeated call still occupies a tool-use round trip in the agent loop, so loop count and latency barely change. It treats the symptom of redundant fetching without restructuring the sequential investigation that causes it.

**B(정답).** Fetch customer context once, split the message into three concerns, investigate them in parallel against that shared data, then reply with one combined resolution.

**설명**

This redesign applies task decomposition: split the request into distinct items, reuse a single retrieval of shared customer context across all investigations, run the independent read-only lookups concurrently, and synthesize one unified response. It removes both the redundant get_customer calls and the sequential investigation passes that inflate loop count, while still resolving everything in one contact; any state-changing actions such as the refund or address update are still executed sequentially rather than in parallel.

**C.** Resolve only the highest-priority concern in this session and ask the customer to open separate requests for the remaining two items.

**설명**

Deferring concerns the customer already stated adds contacts and directly harms the first-contact resolution target. The agent is capable of handling all three items; declining to do so trades a workflow inefficiency for a worse customer outcome.

**D.** Create a composite get_customer_with_history tool that bundles profile, order, and billing data so each sequential investigation completes in one backend call.

**설명**

A composite tool reduces the number of calls per pass but leaves the sequential pass-per-concern structure untouched, so the agent still runs three investigation cycles end to end. It also creates a bloated tool that returns far more data than most requests need, adding context noise without fixing the workflow shape.

### 전반적인 설명

The mental model for a request like this has three parts: decompose the message into distinct items, share context that all items need (the customer record is fetched once, not once per concern), and investigate in parallel before synthesizing a single unified reply. Each part attacks a different inefficiency: decomposition prevents the agent from blending concerns, shared context eliminates redundant tool calls, parallelism collapses three sequential investigation cycles into overlapping ones, and synthesis keeps the customer experience to one complete answer, protecting first-contact resolution. This is not a single named pattern in the documentation, but it is consistent with documented task decomposition and with how the Agent SDK actually executes tools.

The parallelism has an important boundary. Within the Agent SDK agent loop, read-only tools can execute concurrently, and a single assistant turn can request multiple independent lookups at once, so investigations against the already-fetched customer context genuinely overlap in time. State-modifying tools, by contrast, run sequentially, so actions like processing the refund or updating the shipping address should follow the investigations rather than run alongside them. For larger decompositions, subagents extend the same idea with context isolation, though for three lookups against shared data, parallel tool calls within the main loop suffice.

The distractors each fix the wrong layer. A composite tool and a caching layer both optimize the cost of the redundant fetches while leaving the sequential pass-per-concern structure, and its loop count, intact; a cached call still consumes a full round trip through the loop. Deferring two of the three concerns to future sessions removes the inefficiency by removing the work, which sacrifices the resolution target the system exists to hit.

### 도메인

Agentic Architecture & Orchestration

## 질문 47

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : The team must migrate the codebase from Moment.js to a modern date library, touching roughly 60 files with several viable replacement strategies. How should plan mode and direct execution be combined for this task?

**A.** Remain in plan mode for the entire migration so each proposed change is reviewed and approved before Claude applies it.

**설명**

Plan mode blocks source edits until a plan is approved; Claude investigates and proposes, it does not implement changes. Staying in plan mode for the whole task means the migration is never actually implemented, since plan mode is not a per-edit review gate.

**B(정답).** Explore call sites and design the approach in plan mode, then approve the plan and switch to direct execution to implement it.

**설명**

This is the recommended combined workflow: plan mode allows investigation while blocking source edits, producing a reviewable design when scale and competing approaches make upfront thinking valuable, and direct execution then carries out the approved plan efficiently. Each mode is used for the phase it was built for.

**C.** Toggle into plan mode before each individual file's change, then back to direct execution to apply that single change.

**설명**

Per-file mode toggling fragments the design into 60 disconnected micro-plans and adds ceremony to every edit. The value of plan mode here is a single coherent migration design covering all files, produced once before implementation begins.

**D.** Start in direct execution with detailed upfront instructions specifying the replacement API calls for every affected file.

**설명**

Writing exhaustive upfront instructions assumes the engineer already understands every call site and has already chosen among the viable strategies. For a 60-file migration with competing approaches, skipping investigation risks committing to a flawed approach and expensive rework.

### 전반적인 설명

A large library migration hits every criterion for planning before executing: dozens of affected files, multiple viable replacement strategies, and the need to understand existing usage patterns before committing. The idiomatic workflow is a two-phase combination. In plan mode, Claude performs read-only investigation, inspecting files and searching the codebase to map call sites, while source edits are blocked until the plan is approved; the output is an implementation plan the engineer reviews. Then the session switches to direct execution, where Claude carries out the approved plan across the codebase. Iterating on a plan is far cheaper than letting Claude run unplanned and cleaning up afterward.

The mental model to hold is that plan mode is a permission mode, a safety boundary that prevents implementation changes until approval, not a per-edit approval mechanism. That is why staying in plan mode for the whole migration produces no implementation at all, and why toggling modes around every single file misapplies a whole-task design tool as an edit gate. Going straight to direct execution with prescriptive upfront instructions fails differently: it presumes the exploration has already happened, which the presence of several viable strategies contradicts. Investigation first, approval, then execution is the pattern that keeps a 60-file change coherent and cheap to correct.

See Permission modes for how plan mode constrains a session and how to move between modes.

### 도메인

Claude Code Configuration & Workflows

## 질문 48

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : Your verification pass outputs only a bare numeric confidence score (0 to 100) per extracted field. Scores cluster between 70 and 85 regardless of actual field accuracy, making routing thresholds useless. Which prompt change best fixes this?

**A.** Run the verification pass three times per document and use the average of the scores for each field.

**설명**

This is incorrect. Averaging repeated runs reduces run-to-run noise, but if every run produces scores in the same narrow band, the average sits in that same band. The problem is that the scores carry no signal about accuracy, and repetition cannot create signal that the elicitation never captured.

**B.** Instruct the verifier to avoid middle-range values and commit each field to a clearly high or a clearly low score.

**설명**

This is incorrect. Forcing scores away from the middle spreads the numbers without adding any information about which fields are actually right or wrong. The resulting extreme scores are just as uncalibrated as the clustered ones, so routing decisions based on them would be arbitrary.

**C(정답).** Require the verifier to state specific evidence for and against each field's correctness before assigning the score.

**설명**

This is correct. When a model is asked for only a number, scores tend to default to safe middling values with no grounding. Requiring articulated evidence first forces the score to reflect an actual assessment of the extraction, producing differentiated values that track field accuracy and can support routing thresholds.

**D.** Add a post-processing step that linearly rescales the clustered scores so they span the full 0 to 100 range.

**설명**

This is incorrect. Rescaling stretches the numbers cosmetically but preserves their ordering and their lack of correlation with actual correctness. A field scored 72 and a field scored 78 that are equally likely to be wrong remain indistinguishable in any meaningful sense after rescaling.

### 전반적인 설명

Self-reported confidence is only useful for routing when the score is grounded in an actual assessment. Asked for a bare number, a model tends to emit safe, middling values: there is nothing in the generation process that forces it to weigh evidence before committing to a score. The fix is structural, not numerical: require the verifier to articulate specific evidence for and against each field's correctness first, then assign the score. The reasoning acts as a scaffold; the number that follows it reflects what the model actually found, which is what makes thresholds like "auto-accept above 90, route to human below 60" meaningful.

This mirrors Anthropic's documented pattern for review-style harnesses: report each finding together with a confidence level and supporting detail so a downstream stage can rank and route, rather than relying on an unanchored number. See Prompting Claude Sonnet 5 for the recommendation to attach confidence to findings and keep filtering decisions downstream.

The other approaches manipulate the numbers without adding information. Forbidding middle values forces artificial polarization; the extremes are no better correlated with accuracy than the clustered scores were. Averaging repeated runs converges toward the same narrow band, because sampling variance is not the problem; missing signal is. Post-hoc linear rescaling spreads the distribution visually while preserving exactly the ordering that failed to distinguish correct fields from incorrect ones. A useful mental model: calibration problems are fixed at elicitation time (how the score is produced) or by validation against labeled data, never by arithmetic on scores that never encoded accuracy in the first place.

### 도메인

Prompt Engineering & Structured Output

## 질문 49

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : A design review of the search subagent's result cache has already enumerated its expected behavior, the edge cases, and a latency target. Which refinement technique best ensures Claude's implementation satisfies all of them?

**A.** Provide two or three concrete input and output examples and let Claude infer the remaining caching rules from the pattern.

**설명**

This is incorrect because a handful of examples communicates a transformation pattern but cannot encode a full set of edge cases or a latency target, and it offers no mechanism to verify the implementation against them. It leaves most of the enumerated requirements unchecked.

**B.** Have Claude interview you with clarifying questions to surface design considerations the team has not yet anticipated.

**설명**

This is incorrect because the interview pattern is for unfamiliar domains where requirements have not yet been discovered. Here the design review has already enumerated the behavior, edge cases, and latency target, so discovery is complete and the need is verification.

**C.** Implement directly from the design review notes and have Claude fix problems as they surface reactively in later production usage.

**설명**

This is incorrect because it discards the advantage of already knowing the requirements: nothing verifies the implementation against them before it ships. Defects in invalidation or latency then surface reactively in usage, where they are costlier to trace than a failing test.

**D(정답).** Write tests encoding the enumerated behavior, edge cases, and latency target before implementing, then iterate by sharing failures.

**설명**

This is correct because test-driven iteration is the designed technique when requirements are already known: encode the expected behavior, edge cases, and performance target as tests first, then let failing tests guide progressive improvement. Each shared failure gives Claude a concrete, verifiable gap to close.

### 전반적인 설명

Iterative refinement with Claude offers several techniques, and the right one depends on what you already know. When a design review has produced a concrete list of expected behavior, edge cases, and a performance requirement, test-driven iteration fits: write the test suite before implementation, have Claude implement against it, and then iterate by sharing the failing tests. A failing test is the highest-quality feedback you can give a model, because it states precisely what the code does, what it should do, and how success will be checked; each round of shared failures narrows the gap without ambiguity.

The other techniques solve different problems. The interview pattern, where Claude asks questions to surface considerations you have not anticipated, belongs at the discovery stage of an unfamiliar domain; here the design review has already done that work. Concrete input/output examples shine when you understand a transformation but prose descriptions get interpreted inconsistently; they cannot carry a latency target or a long tail of edge cases, and they verify nothing. Implementing directly and fixing issues as they appear in usage abandons verification entirely, converting known requirements back into surprises. The techniques also compose: a team often interviews to discover requirements, encodes them as tests, then implements and iterates on failures; this scenario simply starts at the second step.

See Claude Code common workflows and Claude Code best practices for guidance on test-first development loops with Claude.

### 도메인

Claude Code Configuration & Workflows

## 질문 50

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : After running /compact partway through a long debugging session, Claude starts describing the exact rate limit and migration date it discovered earlier as vague approximations. Which practice best protects these precise details for the rest of the session?

**A.** Run /compact more frequently in smaller increments so each summary covers fewer turns and retains more detail.

**설명**

Compacting more often multiplies the number of lossy compression passes applied to the history. Each pass risks condensing exact numbers and dates into vaguer language, so this intensifies the failure mode rather than preventing it.

**B.** Instruct Claude in CLAUDE.md to restate every previously discovered number verbatim in each of its responses to keep them in recent context.

**설명**

Restating all figures in every response bloats output tokens and accelerates context consumption, and the restatements themselves eventually get summarized. It treats the symptom while making the underlying context pressure worse.

**C.** Stop using /compact and let the session continue until the context window fills, since summarization is the source of the loss.

**설명**

Avoiding compaction only defers the problem: once the window saturates, responses degrade and the session cannot continue productively. It removes a useful tool without providing any mechanism that preserves precise facts.

**D(정답).** Record exact values, dates, and constraints in a scratchpad file as they are discovered, and have Claude consult it after compaction.

**설명**

This is the correct approach because a scratchpad file lives outside the conversation history, so compaction cannot dilute it. Precise figures survive verbatim, and the agent can reread them on demand instead of relying on a lossy summary.

### 전반적인 설명

Summarization is inherently lossy in a predictable way: prose compression preserves gist but discards precision. Exact figures such as 100 requests per minute or a specific migration date tend to be condensed into phrases like "a rate limit was noted," and every additional summarization pass dilutes them further. This is the progressive summarization trap, and it applies equally to Claude Code's /compact command, which compresses the running conversation into a summary so an extended session can continue.

The reliable countermeasure is to move precise facts out of the summarizable history entirely. A scratchpad file that the agent updates as it discovers exact values, versions, thresholds, and dates gives those facts a durable home on disk; after compaction (or even in a brand-new session), the agent reads the file and quotes the values verbatim rather than reconstructing them from a degraded summary. This mirrors the persistent case-facts pattern used in long support conversations: critical transactional details are stored in a structure that is never summarized.

The alternatives fail for structural reasons. Compacting more often adds compression events, each of which is another opportunity for numbers to blur. Forcing the model to restate every figure in every response inflates output and context usage, and those restatements are still subject to future summarization. Refusing to compact simply postpones degradation until the window fills, at which point the session stalls anyway. Externalizing the facts is the only option that makes them independent of how the conversation history is managed.

See Claude Code slash commands and Manage Claude's memory for how compaction and persistent files fit into long sessions.

### 도메인

Context Management & Reliability

## 질문 51

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : A team keeps JSON-schema validation conventions for extraction parsers that sit in many directories. They want the conventions applied automatically when parser files are edited, without loading them into every session. Which two configuration decisions should they make?

**A.** Consolidate the conventions into the root project CLAUDE.md so they are guaranteed to be present in every session.

**설명**

This is incorrect. Root CLAUDE.md content loads in every session regardless of task, which is exactly the always-on context cost the team wants to avoid; the conventions would consume tokens even when no parser file is being touched.

**B.** Duplicate a directory-level CLAUDE.md into every directory that contains parser code so the conventions load wherever parsers live.

**설명**

This is incorrect. Copying the same content into many directory-level CLAUDE.md files creates a maintenance burden and guarantees drift as copies diverge; a single path-scoped rule in .claude/rules/ covers all matching files from one place.

**C(정답).** Create a rule file in .claude/rules/ with a paths glob in its YAML frontmatter that matches the parser files wherever they live.

**설명**

This is correct. Path-scoped rules are file-match-oriented: the glob pattern in the paths frontmatter determines activation, so a convention applies to matching files scattered across any number of directories while staying out of unrelated sessions.

**D(정답).** Declare an explicit paths field in the rule's frontmatter, since a rule file without one loads unconditionally at session start.

**설명**

This is correct. Merely placing a file in .claude/rules/ does not make it conditional; without a paths field the rule loads at launch with the same standing as .claude/CLAUDE.md content. Path scoping comes from the frontmatter, not the directory location.

### 전반적인 설명

The .claude/rules/ directory exists to break a monolithic CLAUDE.md into focused topic files, and its distinguishing capability is path scoping: a rule file may carry YAML frontmatter with a paths field containing glob patterns such as **/*.test.ts or src/**/*.{ts,tsx}. A rule with such a field becomes relevant when Claude works with a file matching the pattern, which makes it the right home for conventions that apply to a kind of file (parsers, schemas, tests) rather than a place in the tree. That is the tradeoff the mechanism makes: instead of paying context cost for every convention in every session, matching-by-pattern loads instructions only where they earn their tokens.

Two mistakes are easy to make. First, location alone confers nothing: a file in .claude/rules/ without a paths field loads unconditionally at launch, exactly like content in the project's .claude/CLAUDE.md, so an engineer who forgets the frontmatter has simply split their always-on context into more files. Second, the plausible alternatives both fail the stated goals: duplicating directory-level CLAUDE.md files across every parser folder scatters one convention into many copies that must be kept in sync by hand, while consolidating everything into the root CLAUDE.md loads the conventions into every session whether or not a parser file is involved. When one convention must govern scattered files, the centralized path-scoped rule is the fit; when a directory owner maintains purely local conventions, the directory-level CLAUDE.md is.

See Manage Claude's memory and Working with large codebases for the documented loading behavior and guidance on choosing between the two mechanisms.

### 도메인

Claude Code Configuration & Workflows

## 질문 52

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : You add a refinement loop: the coordinator evaluates each draft resolution for completeness and re-delegates investigation for any flagged gaps. In testing, policy-ambiguous disputes cycle indefinitely because re-investigation never closes the evaluator's flagged gaps. How should you bound this loop?

**A.** Raise the tool-call budget for each re-delegated investigation so the subagents eventually surface the missing information.

**설명**

A larger tool-call budget helps only when the information exists but was not yet found. The stem states the gaps stem from policy ambiguity, so additional searching cannot close them and the loop still cycles.

**B.** Relax the evaluator's completeness criteria on each pass so drafts eventually satisfy the check and the loop terminates.

**설명**

Progressively loosening the definition of completeness guarantees termination by degrading quality, which defeats the purpose of the evaluation stage. The loop would end by declaring incomplete resolutions complete rather than by resolving or escalating them.

**C.** Disable the completeness evaluation for dispute cases and return the first draft resolution directly to the customer.

**설명**

Removing the evaluation stage eliminates the cycling by eliminating the quality control that catches incomplete resolutions. First-draft answers on high-ambiguity disputes are exactly the cases most likely to miss concerns and hurt first-contact resolution.

**D(정답).** Cap refinement iterations, and if gaps persist at the cap, escalate to a human with a summary of the unresolved gaps.

**설명**

An iteration cap turns an unbounded evaluate-and-re-delegate cycle into a bounded one, and escalation is the correct exit when the gap reflects missing or ambiguous policy that no amount of re-investigation can resolve. Passing a structured summary of what remains unresolved gives the human a self-contained handoff instead of forcing the case to restart.

### 전반적인 설명

An iterative refinement loop is a quality mechanism: an evaluator checks output against completeness criteria, work is re-delegated for the specific gaps found, and the output is regenerated until the criteria pass. Like the core agentic loop, it needs a principled termination design. The happy path ends when the evaluator confirms coverage is sufficient; the unhappy path needs a bounded exit, because some gaps are unresolvable by the agent. When company policy is silent or ambiguous about a dispute, no re-delegated investigation can produce the missing answer, so an uncapped loop will cycle forever, burning tokens on identical findings.

The right design treats the iteration cap as a safety valve and pairs it with a meaningful fallback: hitting the cap with open gaps is itself an escalation trigger. Handing the case to a human with a structured summary of what was resolved and what remains open preserves the completed investigation and matches the system's stated goal of knowing when to escalate. This mirrors the broader structured handoff pattern, where the receiving human lacks the transcript and needs a self-contained account of the case state.

The distractors each break the loop in the wrong place. Enlarging the investigation budget assumes the gap is a search problem when it is a policy problem. Relaxing criteria per pass makes the evaluator converge on approving incomplete work, so the loop terminates by lying about quality. Removing evaluation entirely abandons the refinement pattern and ships unchecked first drafts on the hardest cases. See Anthropic's guidance on the evaluator-optimizer workflow in Building Effective Agents and delegation mechanics in the Agent SDK subagents documentation.

### 도메인

Agentic Architecture & Orchestration

## 질문 53

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : Two MCP tools with the generic names search_info and find_content, one searching the team wiki and one searching the codebase, both carry the description "Searches for relevant information," and Claude Code frequently picks the wrong one. Which TWO changes most directly fix the misrouting? (Select TWO.)

**A(정답).** Rename the tools to reflect their distinct sources, for example wiki_search_pages and repo_search_code.

**설명**

The current names, search_info and find_content, are as generic and interchangeable as the shared description. Meaningful, source-prefixed names eliminate that semantic overlap; Anthropic recommends this kind of namespacing (for example github_list_prs) precisely because it makes tool selection unambiguous.

**B(정답).** Rewrite each description with boundary language stating when to use that tool rather than the other.

**설명**

Descriptions are the primary mechanism the model uses to select tools, and Anthropic's documented fix for wrong-tool selection is to sharpen descriptions and differentiate tools by when to use them, not only what they do. Boundary language directly resolves the overlap causing the confusion.

**C.** Enable strict tool use so each emitted tool call is guaranteed to validate against its input schema.

**설명**

Strict tool use guarantees that tool inputs are schema-valid and tool names are real, addressing malformed calls rather than semantic selection. It ensures the chosen call is well-formed but does nothing to help Claude choose between two tools with identical descriptions.

**D.** Keep both descriptions minimal and put the routing guidance into CLAUDE.md so it loads with every request.

**설명**

Moving selection guidance away from the tool definitions leaves the descriptions, which are what the model weighs at selection time, as ambiguous as before. Context-file instructions can supplement but cannot substitute for distinct descriptions on overlapping tools.

### 전반적인 설명

Claude's tool routing is description-driven: at each step the model compares the request against the name and description of every available tool and picks the one that appears to match. When two tools carry generic names like search_info and find_content and share a description like "Searches for relevant information," the model has literally no signal distinguishing them, so misrouting is not a model failure but an interface failure. Anthropic's troubleshooting guidance for "Claude calls tool A when you wanted tool B" names description ambiguity as the likely cause, and the fix is to differentiate tools by when to use them, not merely what they do.

The two effective changes attack the overlap at its source. Boundary language in each description ("use this for wiki pages and internal documentation; do not use it to search source code") gives the model a decision rule it can apply at selection time. Renaming with source-based prefixes such as wiki_search_pages and repo_search_code reinforces the same distinction in the other field the model reads, a pattern Anthropic explicitly recommends as tool libraries grow.

The other approaches miss the mechanism. Strict tool use guarantees schema-valid inputs and valid tool names; it hardens the syntax of whichever call the model makes but has no bearing on which of two semantically overlapping tools it chooses. Parking routing rules in CLAUDE.md while keeping descriptions minimal moves the guidance away from the surface the model consults during selection; descriptions remain the highest-leverage design surface, and Anthropic calls detailed descriptions by far the most important factor in tool performance.

See Troubleshooting tool use, Implement tool use, and Strict tool use.

### 도메인

Tool Design & MCP Integration

## 질문 54

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : This team's re-review job already includes prior findings in context and asks Claude to report only new or unresolved issues. Developers have dismissed several findings as accepted risks, yet every re-run re-flags those items as unaddressed. What should change?

**A.** Post-process the reviewer's output in the pipeline and suppress any finding whose text matches a previously dismissed review comment.

**설명**

This is incorrect because text matching is brittle: the model phrases the same finding differently across runs, so suppression misses re-worded duplicates. It also cannot tell a re-detected dismissed issue apart from a genuinely new instance of the same problem elsewhere, hiding real findings.

**B.** Exclude the files that contain previously dismissed findings from the diff supplied to subsequent re-review runs.

**설명**

This is incorrect because removing whole files from the review scope creates blind spots. New commits can introduce genuine issues in those same files, and the reviewer would never see them.

**C(정답).** Add each prior finding's disposition, including dismissals, to the context and instruct Claude to treat dismissed items as resolved.

**설명**

This is correct because the reviewer can only distinguish an unresolved finding from a dismissed one if the dismissal decision is part of its context. Findings supplied without their disposition, such as an accepted-risk dismissal, all look unaddressed, so carrying resolution status alongside the findings lets the delta instruction work as intended.

**D.** Raise the reviewer's minimum severity threshold for reporting so that accepted-risk findings fall below the reporting bar.

**설명**

This is incorrect because severity is orthogonal to acceptance. Dismissed findings can be high severity issues the team consciously accepted, so they would still clear a raised threshold, while legitimate new findings of lower severity would be suppressed.

### 전반적인 설명

Re-review quality in a CI pipeline is fundamentally a context design problem: the model has no memory between runs, so its behavior on each invocation is determined entirely by what the pipeline places in its context. Passing the prior findings tells the reviewer what has already been raised, but a finding without its disposition is indistinguishable from an open one. If a developer marked an item as accepted risk, that decision must travel into the next run's context along with the finding itself, paired with an explicit instruction to treat dismissed items as resolved. The reviewer then reports only genuinely new issues and carryovers the team has not yet addressed or dismissed.

The distractors fail for instructive reasons. Suppressing output in the pipeline by matching finding text is mechanical deduplication applied to generative output: the model rewords the same observation across runs, so matches are unreliable, and the filter cannot distinguish a re-detection of a dismissed issue from a new occurrence of the same defect class in different code. Excluding files from the diff trades duplicate noise for coverage gaps, since later commits can introduce real problems in exactly those files. Raising the minimum severity for reporting conflates how serious an issue is with whether the team has chosen to accept it; the two are independent dimensions, so a stricter bar still re-flags high severity items the team deliberately accepted while silencing legitimate new findings of lower severity.

The general principle is that anything the reviewer must reason about, including prior findings, their resolutions, and team decisions, has to be supplied as input on every run rather than reconstructed by pipeline heuristics after the fact. See Claude Code GitHub Actions and Run Claude Code programmatically for guidance on driving Claude Code in automated pipelines.

### 도메인

Claude Code Configuration & Workflows

## 질문 55

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The system routes documents it cannot extract confidently to human reviewers, and those reviewers have no access to the model's processing transcript. What should each escalation record contain so a reviewer can resolve the case without redoing the work?

**A.** Send only the document identifier and the original source file, so reviewers form an independent judgment without anchoring on the system's prior analysis.

**설명**

This discards all completed work in the name of fresh eyes and forces the reviewer to re-extract the document from scratch. The point of escalation is to transfer case state, not to restart the investigation.

**B.** Forward the complete raw model output from every extraction pass, so reviewers can inspect all the evidence the system gathered.

**설명**

Dumping unprocessed intermediate output transfers noise rather than case state, leaving the reviewer to redo the synthesis the system already performed. A structured summary of findings and the identified conflict is far more actionable than raw transcripts.

**C(정답).** Include a self-contained record with the document identifier, the fields extracted so far, the detected conflict or ambiguity, and a recommended resolution.

**설명**

This is correct because the reviewer lacks the transcript, so the escalation must transfer the full case state on its own. Including the identifier, partial extraction, root cause of the escalation, and a recommendation lets the human resolve the case without repeating the analysis.

**D.** Provide an overall confidence score and an urgency rating, so reviewers can prioritize which escalated documents to handle first.

**설명**

Confidence and urgency support triage ordering but convey nothing about what the system found or why it escalated. A reviewer receiving only these values must still rebuild the entire case before resolving it.

### 전반적인 설명

Escalation handoffs exist to transfer case state, not just to flag that a problem occurred. When the receiving human has no visibility into the model's session, the escalation record is the only channel through which the completed work survives the handoff. A well-designed record therefore carries four things: an identifier linking back to the source document, the partial results already produced (fields extracted and validated so far), a root cause statement explaining precisely why the system stopped (for example, two conflicting totals in the source, or a required field genuinely absent), and a recommended action the reviewer can accept or override. This is the same structured handoff discipline used when a support agent escalates a billing dispute: the human should never have to start over.

In practice, teams implement this by modeling the escalation itself as a tool or structured output with an explicit JSON schema, so the model is required to populate every field rather than emitting a free-text apology. Anthropic's tool-use guidance emphasizes that a tool's input_schema defines the exact parameters the model must supply, and that a detailed description of when and how to use the tool is the single biggest driver of reliable invocation; see How to implement tool use. Defining fields such as document_id, extracted_fields, escalation_reason, and recommended_resolution makes the handoff machine-checkable and consistent across cases.

The alternatives each fail the self-containment test. Sending only the identifier and source file throws away the extraction work to avoid anchoring, which trades a small bias risk for guaranteed duplicated effort. Forwarding every raw model output transfers volume instead of insight, pushing the synthesis burden onto the human. Confidence and urgency scores are useful routing metadata, but metadata about a case is not the case itself; a reviewer still needs the findings, the conflict, and a proposed next step to act.

### 도메인

Agentic Architecture & Orchestration

## 질문 56

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : Deprecation extraction returns null for replacement_api when the value sits in unusual comment positions; some files genuinely lack a replacement. Which TWO additions best fix the false nulls while preserving correct ones? (Select TWO.)

**A(정답).** A few-shot example showing a file with no replacement mentioned anywhere, whose extraction correctly returns null.

**설명**

Correct. Without a genuine-absence example, teaching the model to hunt harder for values risks converting correct nulls into fabricated ones. Contrasting a present-but-unusual case with a truly absent case teaches the decision boundary, not just one side of it.

**B.** A rule that any null replacement_api automatically triggers a retry with a stricter instruction to locate the missing value.

**설명**

Incorrect. Retries help with format and structural errors, but they are ineffective when the information is genuinely absent from the source, and here many nulls are legitimate. Blanket retries on null would pressure the model toward fabricating values in files that truly lack a replacement.

**C(정답).** A few-shot example showing a replacement noted in an atypical comment position, with the correctly populated extraction.

**설명**

Correct. The false nulls come from the model failing to recognize values outside the standard position, and an example demonstrating extraction from an atypical placement teaches it to search beyond the expected location. Few-shot examples generalize, so one well-chosen case covers similar nonstandard placements.

**D.** A schema change marking replacement_api as a required field so the extraction output can never omit the value.

**설명**

Incorrect. Requiring a field that is sometimes genuinely absent forces the model to invent plausible-looking values to satisfy the schema. The documented guidance is the opposite: keep fields optional or nullable when the source may not contain the information.

### 전반적인 설명

This failure has two distinct modes that must be separated before fixing anything: false nulls (the value is present but in a nonstandard position the model does not check) and true nulls (the file genuinely lacks a replacement). Any fix that only attacks the first mode risks breaking the second, which is why the effective few-shot set is a contrasting pair: one example demonstrating extraction from an atypical placement, and one demonstrating that returning null is the correct output when nothing is there. Together they carry a judgment boundary that prose instructions struggle to convey, and the model generalizes the pattern to placements it has never seen rather than merely memorizing the examples.

The distractors fail on opposite sides of that boundary. An automatic retry on every null treats absence as an error to be corrected, but retry-with-feedback only works for format, structural, and arithmetic problems; when the information simply is not in the source, a stricter retry pushes the model toward guessing. Marking replacement_api as required does the same damage at the schema level: a required field on possibly-absent information leaves the model no honest answer, which is exactly the condition under which fabricated, plausible-looking values appear. The schema-design rule is to keep such fields optional or nullable, then use examples to sharpen when null is and is not appropriate.

The broader mental model: schemas control the shape of output, examples transfer the judgment applied within that shape, and retries repair only errors the source document can actually resolve. See Use examples (multishot prompting) and Tool use overview for the underlying techniques.

### 도메인

Prompt Engineering & Structured Output

## 질문 57

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : Automatic description-based matching routes most delegations correctly, but team policy requires the test-generation subagent to run on every refactoring request, and logs show it is sometimes skipped. How should routing be handled for these requests?

**A(정답).** Reference the test-generation subagent by name in the prompt for refactoring requests, bypassing automatic description matching.

**설명**

Mentioning a subagent explicitly by name overrides the automatic description-based selection, so the delegation goes to that subagent for the requests where policy demands it. This gives deterministic routing for the mandated case while leaving description-driven matching in place for everything else.

**B.** Broaden the test-generation subagent's description so automatic matching selects it for every category of incoming request.

**설명**

Broadening the description makes it overlap with other subagents, which degrades routing quality across the whole system rather than improving it. It also still relies on probabilistic matching, so the subagent can continue to be skipped on some refactoring requests.

**C.** Move the test-generation subagent to the first position in the agents configuration so it takes precedence in matching.

**설명**

Definition order in the agents configuration is not a documented selection signal; Claude chooses subagents based on the task and each subagent's description. Reordering the list therefore does nothing to guarantee invocation for refactoring requests.

**D.** Set the test-generation subagent's background field to false so it must complete before the coordinator ends its turn.

**설명**

The background field controls whether an already-issued invocation runs asynchronously or synchronously; it has no effect on whether the subagent is selected in the first place. A subagent that was never invoked cannot be forced to run by changing its execution mode.

### 전반적인 설명

By default, Claude decides when to invoke subagents automatically, matching the task against each subagent's description. This is what makes dynamic selection work: a well-described set of subagents lets the coordinator invoke only the specialists a given request actually needs, instead of pushing every request through a fixed pipeline. But automatic matching is a probabilistic mechanism, and the documentation provides an explicit override for cases where a specific subagent must handle the work: mention the subagent by name in the prompt, which bypasses the automatic matching entirely. The right mental model is a hybrid router: description-driven selection for the general case, explicit naming for the paths where policy or correctness demands a particular specialist.

Broadening the subagent's description is the tempting wrong move; it trades a targeted fix for system-wide damage, because vague or overlapping descriptions are precisely what cause misrouting between similar subagents, and the invocation still depends on matching that can miss. Ordering in the agents configuration is not a routing signal at all, so putting the subagent first changes nothing. The background field only governs whether an invocation runs asynchronously or synchronously once Claude has already issued the Agent tool call; it cannot make an invocation happen.

See Subagents in the SDK for how automatic invocation works, how explicit naming forces a specific subagent, and the fields available on an AgentDefinition.

### 도메인

Agentic Architecture & Orchestration

## 질문 58

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : During extraction, Claude returns stop_reason "tool_use" with two tool_use blocks requesting different document lookups. Which two statements correctly describe how the results must be returned in the next request? (Select TWO.)

**A(정답).** Place both tool_result blocks inside a single user-role message, since the Messages API has no dedicated tool role.

**설명**

This is correct. Tool results are integrated into the standard message structure: assistant messages carry tool_use blocks and user messages carry tool_result blocks. There is no separate tool or function role, so both results travel back as content of a user message.

**B.** Order the tool_result blocks to match the order of the tool_use blocks, since the API pairs results with requests by position.

**설명**

This is incorrect. Results are matched to requests through the tool_use_id field, not by position in the content array. Relying on ordering instead of explicit IDs is a misunderstanding of how the pairing mechanism works.

**C.** Send each result as a separate assistant-role message so the model treats the outputs as part of its own prior turn.

**설명**

This is incorrect. Tool results are not assistant content; they represent information supplied back to the model by the application. Placing them in assistant messages misrepresents the conversation structure and violates the API's expected role pattern.

**D(정답).** Set each tool_result block's tool_use_id to the id of the tool_use block it answers, so each result pairs with its request.

**설명**

This is correct. Every tool_use block carries a unique id, and the corresponding tool_result must reference that id in its tool_use_id field. This linkage is what lets the model reliably associate each output with the specific call it made, especially when several tools run in one turn.

### 전반적인 설명

Client-side tool use in the Messages API is a two-request loop. When Claude decides it needs a tool, it ends its turn with stop_reason: "tool_use" and one or more tool_use content blocks, each carrying a unique id, the tool name, and the input arguments. The API never executes anything itself; your harness runs the tools and sends the outputs back so the model can continue reasoning.

Two structural rules govern that return trip. First, tool outputs go back as tool_result content blocks inside a user-role message: unlike some other LLM APIs, Claude's Messages API has no dedicated tool or function role, so tooling is woven into the existing alternating user/assistant structure. Second, each tool_result must set tool_use_id to the id of the tool_use block it answers. This explicit linkage is what makes parallel tool calls safe: when the model requests two lookups in one turn, the IDs, not the ordering of blocks, tell it which output belongs to which request. When multiple results are returned, they belong in a single user message rather than being spread across turns.

The mental model to hold is that the growing message history is the model's only memory. The assistant message containing the tool_use blocks and the user message containing the matching tool_result blocks must both appear in the next request, because the model re-reads the full transcript on every inference pass. Sending results as assistant messages, or depending on positional order for pairing, breaks the contract the API defines. See Tool use overview and Handle tool calls for the documented message structure.

### 도메인

Agentic Architecture & Orchestration

## 질문 59

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : An engineer proposes routing the support agent's entire multi-turn, tool-driven resolution loop through the Message Batches API for a latency-tolerant email ticket queue, accepting slower replies in exchange for the 50% discount. What should you recommend?

**A.** Adopt batches but attach ticket sequence metadata to every request, since results returned out of order cannot otherwise be reassembled.

**설명**

Ordering is already a solved correlation problem: each batch request carries a custom_id that maps every result back to its source. Adding sequence metadata does nothing about the real barrier, which is that tool results cannot be fed back mid-request for continued turns.

**B.** Adopt the proposal unchanged, since the email queue's tolerance for slow replies satisfies the only requirement batch processing imposes.

**설명**

Latency tolerance is necessary but not sufficient for batch adoption. Each unit of work must also fit within a single request-response exchange, and the agent's tool-driven loop does not; adopting the proposal would leave every conversation stalled at its first tool_use response.

**C(정답).** Keep the resolution loop on synchronous calls, since each batch request yields one response and cannot return tool results for continued turns.

**설명**

This is correct. The Message Batches API processes each request as a single fire-and-forget Messages call, with no mechanism to intercept a tool_use response, execute the MCP tool, and return the result so the model can continue. The agent's resolution flow depends on multiple tool request and response rounds, so it must stay on the synchronous API regardless of how latency-tolerant the queue is.

**D.** Strip the MCP tool definitions from each batch request, since the Message Batches API rejects any request that declares tools.

**설명**

Batch requests accept the same core Messages API parameters, including tool definitions, so there is nothing to strip. The actual gap is that a requested tool cannot be executed during processing and handed back for another turn, and removing the tools would also cripple the agent's ability to resolve tickets.

### 전반적인 설명

The mental model to hold is that a batch request is a single, self-contained Messages API call submitted for asynchronous processing: the request goes in, and one response eventually comes out in a results file. There is no harness in the middle. In a normal agentic loop, your code inspects each response, sees a tool_use stop, executes the MCP tool (such as lookup_order or process_refund), appends the result to the conversation, and calls the model again. The Message Batches API offers no hook for that interception, so a multi-turn tool-calling workflow cannot complete within one batch request. This limitation is orthogonal to latency: even a queue that could happily wait a full day still cannot run the loop, which is why the sound recommendation keeps the loop synchronous.

This is why the batch-versus-synchronous decision has two independent gates. First, is the workload non-blocking and latency-tolerant (batches usually finish in under an hour but can take up to 24 hours with no SLA)? Second, does each unit of work fit in a single request-response exchange? Nightly audits and bulk extractions pass both gates; an interactive tool-driven resolution flow fails the second one no matter how patient the customer is.

The distractors reflect common half-knowledge. Tool definitions are perfectly valid in batch request parameters; it is mid-request tool execution that has no place to happen. And while results are returned out of input order, the required custom_id field exists precisely to correlate each result back to its originating request, so ordering never blocks batch use. See the Message Batches documentation for the asynchronous processing model, latency characteristics, and result correlation.

### 도메인

Prompt Engineering & Structured Output

## 질문 60

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The synthesis subagent exposes two output tools, record_finding and record_conflict, and must call one of them every turn, yet it occasionally replies with conversational text instead. Which configuration change fixes this?

**A(정답).** Set tool_choice to {"type": "any"} so the model must call one of the provided tools.

**설명**

The any mode forces the model to call some tool from the provided set while still letting it choose which one, so the subagent can pick record_finding or record_conflict as the content requires. This is the API-level guarantee that eliminates plain-text responses on turns where a tool call is mandatory.

**B.** Keep tool_choice at "auto" and add few-shot examples that demonstrate a tool call on each turn.

**설명**

Few-shot examples can improve the rate of tool calling, but auto still permits a text-only response whenever the model judges it appropriate. The failure mode is reduced, not removed, and the examples add token overhead for a guarantee the API can provide directly.

**C.** Set tool_choice to {"type": "tool", "name": "record_finding"} on every request to the subagent.

**설명**

Forcing a specific named tool guarantees a tool call, but it removes the model's ability to choose record_conflict when sources disagree. Conflicting findings would be shoehorned into record_finding, corrupting the data instead of fixing the problem.

**D.** Add a system prompt rule telling the model to always respond with a tool call, never plain text.

**설명**

Prompt instructions are probabilistic guidance, not enforcement. Under auto tool choice the model retains the option to answer in text, so occasional plain-text replies will continue; the API's tool_choice parameter exists precisely to make the guarantee that prompts cannot.

### 전반적인 설명

The tool_choice parameter is the API's enforcement mechanism for whether and how tools get called, and each mode makes a different guarantee. auto (the default when tools are provided) leaves the decision entirely to the model, which is why prompt rules and few-shot examples can only shift probabilities: the model always retains a legal text-only path. {"type": "any"} removes that path, requiring the model to call one of the provided tools while preserving its judgment about which one. Mechanically, when tool_choice is any or tool, the API pre-fills the assistant message to force tool use, so a conversational reply is not merely discouraged but structurally impossible on that turn.

The distinction between any and forced selection with {"type": "tool", "name": ...} matters here: forcing record_finding would guarantee a call but destroy the routing decision between findings and conflicts, which is exactly the information the subagent must supply. Use forced selection when a specific tool must run (for example, a mandatory first extraction step), and any when a tool call is required but the choice among tools is meaningful.

One boundary worth knowing: forced tool use is not universally available. With manual extended thinking enabled, any and tool return an error (only auto and none are supported), and certain models reject forced tool use outright, so verify support for your configuration. See Implement tool use for the full behavior of each mode.

### 도메인

Tool Design & MCP Integration