# Practice Test 2

## 질문 1

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : Your custom agent loop built on the Messages API receives a billing-dispute response with stop_reason "tool_use" containing two tool_use blocks: get_customer and lookup_order. How should the loop return the outputs so the next iteration proceeds correctly?

**A(정답).** Execute both tools, then send a single user message with one tool_result block per call, each matched by tool_use_id.

**설명**

This is the documented protocol for parallel tool calls: every tool_use block must receive a corresponding tool_result, all returned together in the next user message and correlated by tool_use_id. Claude then sees both outputs at once and can reason over the combined data in its next turn.

**B.** Execute only the first requested tool and return its result; Claude will re-request the remaining tool on the next iteration.

**설명**

Every tool_use block in the response must be answered before the conversation can continue; returning only one result leaves an unresolved tool_use id and produces a protocol error. Claude does not automatically re-issue the dropped call.

**C.** Execute both tools, then return the results in an assistant message, since tool outputs belong to Claude's turn of the history.

**설명**

Tool results are always sent in a user message; the Messages API has no special tool role, and assistant messages are reserved for content Claude itself generated, including the tool_use requests. Placing results in an assistant message misrepresents who produced the content and breaks the alternating structure.

**D.** Execute both tools, then send two consecutive user messages, each carrying one tool_result, in the order the calls appeared.

**설명**

Splitting results across separate user messages violates the message formatting rules: tool_result blocks must immediately follow their corresponding tool_use blocks with no intervening messages. The API rejects histories where a tool_use id lacks a tool_result directly after it.

### 전반적인 설명

Claude is allowed to request several tools in a single assistant turn, and this is the default behavior: a response with stop_reason: "tool_use" can carry multiple tool_use blocks, each with its own id, name, and input. When you build the loop yourself on the Messages API, the mental model to hold is a contract: Claude emits structured requests, your harness executes them, and the conversation cannot advance until every request has been answered. Whether you run the two tools concurrently or sequentially is entirely your choice; the protocol only constrains how the results come back.

The return format has three hard rules. First, results go back as a user message, because the Messages API models tool exchange with ordinary alternating roles rather than a dedicated tool role. Second, each tool_result block must echo the originating call's id as tool_use_id, which is how Claude matches the customer record to get_customer and the order data to lookup_order when both arrive together. Third, ordering matters: tool results must immediately follow their corresponding tool_use blocks, with all tool_result blocks placed before any text in that user message. Violations surface as errors like "tool_use ids were found without tool_result blocks immediately after."

This design is why parallel calls actually save latency: independent lookups complete in one round trip instead of two, and Claude reasons over the combined evidence in a single subsequent turn. Answering only one call, splitting results across messages, or placing them in an assistant message each breaks the contract in a way the API detects rather than tolerates. See Parallel tool use and Handle tool calls for the full formatting requirements.

### 도메인

Agentic Architecture & Orchestration

## 질문 2

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A CI review job asks Claude for JSON in prose, and parsing sometimes fails. The team defines a report_findings tool whose input_schema matches the findings format. Which TWO actions should the team take? (Select TWO.)

**A.** Keep tool_choice at auto and add a firm prompt instruction to always call report_findings, since strict mode ensures the call occurs.

**설명**

This is incorrect because strict mode validates the input of tool calls that happen; it does not make a call happen. With auto, the model may still reply in plain text regardless of prompt emphasis, so invocation must be guaranteed through tool_choice, not wording.

**B(정답).** Add strict: true to the report_findings tool definition so the tool input is guaranteed to match the schema when called.

**설명**

This is correct. Enabling strict tool use activates grammar-constrained sampling, which guarantees the tool input conforms to the input_schema, preventing missing parameters, type mismatches, and malformed JSON without validate-and-retry loops. The guarantee applies to tool calls that occur, which is why it pairs with a tool_choice setting that ensures the call happens.

**C.** Remove the downstream semantic validation layer, since schema conformance now guarantees the accuracy of every extracted value.

**설명**

This is incorrect because schemas enforce structure, not truth. A finding can be perfectly schema-valid yet carry a wrong severity level or a value placed in the wrong field, so semantic checks such as cross-field consistency rules must stay in place.

**D(정답).** Set tool_choice to force the report_findings tool rather than leaving the default auto, so every run produces a tool call.

**설명**

This is correct. Under the default auto setting the model may answer in conversational text instead of calling any tool, so schema guarantees would not apply to that run. Forcing the named tool (or requiring some tool with any) ensures the structured channel is used every time.

### 전반적인 설명

Reliable structured output through tools rests on two separate guarantees, and the design must supply both. The first is input validity: adding strict: true to the tool definition turns on grammar-constrained sampling, so the model's tool input is generated to match the input_schema exactly. As the strict tool use documentation explains, this prevents missing parameters and type mismatches by construction, which is why it sits above prompt instructions, prefills, or schemas described in prose on the reliability ladder. Syntax failures like unclosed braces or trailing commentary simply cannot occur inside a tool_use block produced this way.

The second guarantee is invocation: strict mode only constrains calls that actually happen. The default tool_choice of auto leaves the model free to answer in conversational text, so a review run could still return unparseable prose. Forcing the named tool, or requiring some tool with any, closes that gap, as described in the tool use overview. Prompt emphasis cannot substitute here; instructions raise the odds of a call but never guarantee one.

What neither mechanism can do is verify semantics. A finding labeled minor when it should be critical, or a line number attached to the wrong file, satisfies every structural constraint while being wrong. Production pipelines therefore keep a validation layer for business rules and cross-field consistency even after adopting strict tool use; the structured outputs documentation frames these mechanisms as controlling shape, not truth. Removing downstream checks confuses a guaranteed schema with guaranteed accuracy.

### 도메인

Prompt Engineering & Structured Output

## 질문 3

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : The process_refund tool rejects an out-of-window refund with isError: true, errorCategory: "business", isRetryable: false, and message: "ERR_RB_221: refund_window_check failed". The agent then tells customers an unspecified internal error occurred. What change fixes the customer communication?

**A(정답).** Include a plain-language reason in the message field, such as the order being past the returns window, that the agent can relay.

**설명**

This is correct. The flags already tell the agent not to retry, but the message content is what the agent uses to talk to the customer. An internal error code gives it nothing to relay, so replacing the code with a human-readable explanation of the policy reason lets the agent communicate the refusal accurately.

**B.** Set isRetryable to true so the agent retries the call and gathers additional detail before responding to the customer.

**설명**

This is incorrect. A returns-window violation is a business rule refusal that no amount of retrying will change, so marking it retryable invites wasted calls against a deterministic rejection. Retrying also produces no additional detail; the response contains exactly what the tool put in it.

**C.** Return the policy engine's complete rejection payload, including rule identifiers and internal thresholds, so no detail is lost.

**설명**

This is incorrect. Raw internal payloads expose rule identifiers and thresholds the agent cannot usefully act on and should not repeat to a customer. The goal is not maximal detail but a message shaped for the agent's next action, which here is explaining the refusal in customer-appropriate terms.

**D.** Maintain a mapping of error codes to customer explanations in the system prompt so the agent can translate ERR_RB_221 itself.

**설명**

This is incorrect. Putting a code-to-explanation lookup table in the prompt duplicates knowledge the tool already has, consumes tokens on every turn, and drifts out of date whenever the policy engine adds or changes codes. The explanation belongs in the error response itself, at the point where the failure is known.

### 전반적인 설명

The error response in this situation already has the right control signals: isError: true marks the call as failed, and the application-level metadata (errorCategory: "business", isRetryable: false) correctly tells the agent this is a policy refusal that must not be retried. What is missing is the communication half of the contract. A business error's whole purpose is to be explained to the user, so the message field must carry a reason the agent can relay, for example that the order falls outside the returns window. With only an internal code like ERR_RB_221, the agent is forced to either invent a reason or fall back to a vague "internal error," both of which damage first-contact resolution.

The useful mental model is that a tool error message is an instruction to the model about what to do next. Anthropic's guidance is explicit that generic or opaque errors should be avoided in favor of messages that state what went wrong and what the model should try next; "Rate limit exceeded. Retry after 60 seconds" beats "failed." For transient errors the next action is a retry, so the message should support that. For business errors the next action is a conversation, so the message should be written in language suitable for the customer. Note that errorCategory and isRetryable are structured metadata your application defines, while is_error (or isError in MCP-style results) is the documented protocol-level failure flag; the two layers work together.

The alternatives all fail this contract in different ways. Prompt-side code translation tables re-create knowledge the tool already owns and go stale silently. Flipping isRetryable to true mislabels a deterministic policy rejection as recoverable, producing futile retries. Forwarding the raw policy-engine payload maximizes detail but not usefulness: internal rule identifiers are neither actionable for the agent nor appropriate to surface to a customer. See Handle tool calls for the documented error-result structure and guidance on writing informative error messages.

### 도메인

Tool Design & MCP Integration

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

## 질문 5

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A developer replies to one of the pipeline's review comments: "This warning is wrong, it keeps blocking my PRs, and it's really frustrating." The flagged finding is one the system can re-evaluate. How should the response flow be designed?

**A.** Run sentiment analysis on developer replies and hand the thread to a human whenever negativity crosses a calibrated threshold.

**설명**

Sentiment analysis is a documented unreliable proxy for whether a case actually needs human involvement; tone and complexity are largely independent. Routing on a negativity score would escalate many resolvable disputes while missing calmly worded cases that genuinely need a maintainer.

**B.** Escalate the thread to a human maintainer right away, since a frustrated developer response indicates the case exceeds the automated reviewer's scope.

**설명**

Frustration alone is not a reliable escalation trigger; it does not correlate with case complexity or with the system's ability to resolve the issue. Immediate escalation is reserved for explicit requests for a human, and here the finding is one the system can re-evaluate itself.

**C(정답).** Acknowledge the frustration, re-check the finding with the developer's input, and escalate to a human only if the developer pushes back again.

**설명**

This follows the nuanced escalation pattern: acknowledge the emotion first, then offer a concrete resolution since the task is within the system's capability, and escalate only when the person reiterates their objection. An expression of frustration is not the same as a request for a human, so the system should attempt resolution before handing off.

**D.** Dismiss the flagged finding and pass the check, since holding a disputed warning against an unhappy developer erodes trust in automated review.

**설명**

Withdrawing a finding solely because someone objects is a form of silent suppression: it hides potentially real issues and teaches developers that complaining bypasses the review. The finding should be re-evaluated on its merits, not discarded to avoid friction.

### 전반적인 설명

The escalation discipline that applies to customer-facing agents transfers directly to developer-facing automation: distinguish an expression of frustration from an explicit request for a human. Only the latter triggers immediate escalation. When someone is annoyed but the disputed task is within the system's capability, the correct sequence is to acknowledge the emotion, attempt a concrete resolution (here, re-evaluating the flagged finding against the developer's stated context), and escalate to a human maintainer only if the person reiterates their objection after that attempt.

This design exists because of a tradeoff between trust and throughput. Escalating on the first sign of irritation floods human reviewers with cases the automation could have closed, defeating the purpose of automated review. At the other extreme, dismissing a finding just because it was disputed is silent suppression: the check reports a state that was never verified, and developers learn that objecting is a shortcut past review. Re-evaluation with the new context is the middle path; it treats the pushback as information rather than as either an alarm or a veto.

Sentiment scoring looks like a principled compromise but substitutes an unreliable proxy for a clear behavioral signal. Mood does not track case complexity: a calm reply can hide a genuinely ambiguous policy question, while a heated one can accompany a finding the system can settle in one pass. The reliable signals are explicit requests for a human and reiterated objections after a resolution attempt, both of which are directly observable in the thread without any classifier.

For background on designing agent workflows with appropriate human checkpoints, see Anthropic's Building effective agents and the Claude Code GitHub Actions documentation for CI review integrations.

### 도메인

Context Management & Reliability

## 질문 6

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : QA currently reviews only cases the agent escalates; resolutions the agent completes autonomously go unreviewed. You need ongoing assurance that these unreviewed resolutions remain accurate and that novel error patterns surface early. What should you implement?

**A.** Audit every autonomous resolution for one quarter, then discontinue review once aggregate accuracy exceeds the target threshold.

**설명**

A one-time audit proves nothing about future behavior: customer behavior, policies, and request mixes shift, and an aggregate accuracy number can mask a failing issue type. Removing all measurement after the audit eliminates exactly the instrumentation needed to detect drift and new error patterns.

**B.** Have the agent self-rate its confidence on each resolution and route only the low-confidence ones to QA for human review.

**설명**

Model self-rated confidence is poorly calibrated, and the most dangerous errors are the ones the agent is confidently wrong about. Reviewing only self-flagged low-confidence cases leaves the confidently incorrect resolutions permanently unexamined.

**C.** Monitor customer complaint and case-reopen rates, treating any sustained rise in either signal as evidence that resolution quality has slipped.

**설명**

Complaints and reopens are a lagging, incomplete signal: many incorrect resolutions never generate a complaint, especially errors in the customer's favor or ones the customer does not notice. Relying on them alone means silent error patterns can grow for a long time before detection.

**D(정답).** Draw a stratified random sample of autonomous resolutions across issue types and review it on an ongoing basis to measure error rates.

**설명**

This is correct because stratified random sampling keeps measuring the exact population that no longer receives systematic review, and stratifying by issue type ensures returns, billing disputes, and account issues are each represented. Continuous sampling is a robust way to catch drift and novel error patterns that no existing flag or complaint would surface.

### 전반적인 설명

The core problem here is a measurement gap: once a class of work is fully automated and unreviewed, you lose the ability to know whether it is still being done correctly. Stratified random sampling addresses this by continuously auditing a randomly chosen slice of the supposedly safe population, with the sample stratified across segments (issue types such as returns, billing disputes, and account issues) so that a small but badly failing segment cannot hide inside a healthy average. Random selection matters because it does not depend on anyone anticipating a failure mode in advance: it is a particularly robust way to surface novel error patterns that no existing rule, flag, or classifier is watching for, even though other signals can occasionally reveal them too.

The alternatives all share the same flaw: they only look where a signal already exists. Complaint and reopen rates detect only errors customers notice and bother to report, missing silent failures such as incorrect refunds in the customer's favor; they are useful supplementary telemetry but insufficient on their own. Routing review by the agent's self-rated confidence inherits the known unreliability of self-assessment; a model is often most confident precisely on cases where it is systematically wrong, so those cases never reach a reviewer. A one-time exhaustive audit followed by discontinuing review confuses a snapshot with monitoring, and its aggregate pass threshold can conceal a segment (say, billing disputes) with a much higher error rate.

The mental model to carry into production: reducing human review does not reduce the need for measurement, it increases it, because errors now flow to customers unchecked. Anthropic's guidance on evaluating Claude-based systems emphasizes ongoing empirical measurement against representative cases rather than one-time validation; see Create strong empirical evaluations, and Anthropic's engineering write-up Building effective agents for related design guidance.

### 도메인

Context Management & Reliability

## 질문 7

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : A coordinator delegates work to an API-extraction subagent and a documentation-writing subagent. The extraction subagent hits an unrecoverable parsing failure mid-task. In a hub-and-spoke design, how should this failure be handled?

**A.** Have the extraction subagent notify the documentation subagent directly so it can adapt its plan around the missing analysis.

**설명**

Direct subagent-to-subagent communication breaks the hub-and-spoke pattern, where all inter-agent communication flows through the coordinator. Subagents also run in isolated contexts and have no channel to message siblings; only their final result returns to the parent.

**B.** Have the extraction subagent return an empty result marked successful so the workflow continues without interruption.

**설명**

Silently suppressing an error as an empty success hides the failure from the coordinator, which then cannot distinguish a genuine no-results outcome from a broken extraction step. This is a documented anti-pattern that corrupts downstream decisions.

**C.** Terminate the entire workflow immediately so no downstream subagent operates on incomplete extraction output.

**설명**

Aborting the whole workflow on a single failure is a documented anti-pattern because it discards all partial progress. The coordinator can often proceed with partial results and annotate the gap instead of losing everything.

**D(정답).** Return the error with context to the coordinator, which can retry, delegate elsewhere, or continue with partial results.

**설명**

In hub-and-spoke architecture the coordinator owns error handling and routing, so unresolvable failures flow up to it with enough context to make an informed recovery decision. This keeps the failure visible and lets the component with the broadest view of the workflow choose the response.

### 전반적인 설명

The hub-and-spoke topology assigns three responsibilities to the coordinator: task decomposition and delegation, aggregation of results, and error handling. Subagents never communicate with each other; every message, including a failure report, flows through the hub. This is not bureaucracy for its own sake: the coordinator is the only component with a view of the whole workflow, so it alone can weigh whether a failed extraction should be retried, rerouted to a different subagent, or accepted as a gap while the rest of the pipeline continues with partial results. Routing everything through one point also gives the system a single place for observability and consistent recovery logic.

This design is reinforced by how subagents actually work: each runs in an isolated context that starts fresh, and only its final message returns to the parent. A subagent therefore has no mechanism to push its error to a sibling; the sibling would never see it. The correct pattern is to return a structured error, ideally including the failure type, what was attempted, and any partial results, so the coordinator can make an intelligent decision rather than guessing.

The two remaining approaches are recognized anti-patterns. Terminating the whole workflow on one failure throws away completed work when graceful degradation with annotated coverage gaps would preserve value. Silently returning an empty result labeled as success is worse: it makes a broken step indistinguishable from a legitimate empty outcome, so the documentation subagent produces output built on missing data with no one aware anything went wrong. See Create custom subagents for how subagent context isolation and result return work in practice.

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

## 질문 9

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : In testing, the request "my order arrived broken" sometimes triggers an immediate process_refund and sometimes a lookup_order investigation first. Detailed prompt instructions have not made the behavior consistent. What change most reliably fixes this?

**A(정답).** Add 3-5 examples of ambiguous requests, each showing the chosen tool sequence with a rationale for rejecting the plausible alternative.

**설명**

This is correct because targeted few-shot examples transfer judgment that prose instructions fail to convey. Showing the chosen action alongside reasoning for why the competing action was rejected teaches the decision boundary itself, letting the model generalize to new ambiguous phrasings rather than pattern-match on wording.

**B.** Add examples showing only the final tool call for each request type, keeping them short so they do not dilute the system prompt.

**설명**

Bare input-to-tool-call pairs demonstrate format but not judgment. Without the reasoning that explains why one action was chosen over the plausible alternative, the model has no principle to generalize, so inconsistency on novel ambiguous requests persists even though the examples are compact.

**C.** Add ten or more examples covering every request phrasing the team has logged so the agent can match new messages to prior cases.

**설명**

This treats few-shot prompting as a lookup table rather than a teaching mechanism. Volume without targeting bloats the context, dilutes the signal of the examples that matter, and still fails on phrasings the log has never seen; a small set of examples aimed at genuine ambiguity generalizes better.

**D.** Add examples of clear-cut requests only, since ambiguous cases would teach the model conflicting patterns it cannot generalize from.

**설명**

This has the targeting backwards. Clear-cut cases are ones the model already handles; the value of few-shot examples lies precisely in demonstrating how to resolve ambiguity. Well-constructed ambiguous examples with rationale do not conflict, they show a consistent decision rule applied to hard cases.

### 전반적인 설명

The failure here is a judgment boundary problem, not a formatting problem. "My order arrived broken" is genuinely ambiguous: it could warrant an immediate refund or an investigation first, and prose rules like "investigate before refunding" describe the goal without transferring the reasoning that decides borderline cases. When detailed instructions still yield inconsistent behavior, that is the documented signal to switch from rules to demonstrations.

Effective few-shot design for ambiguity has two properties. First, targeting: a small number of examples (Anthropic's docs recommend 3-5 for best results, noting that a handful of well-chosen examples outperforms bulk coverage) aimed specifically at the requests where the agent wavers. Second, visible reasoning: each example pairs the chosen tool sequence with a rationale explaining why the plausible alternative was rejected, for instance "call lookup_order first because 'broken' may describe shipping damage requiring order details, so refunding immediately risks the wrong resolution." The rationale is what lets the model generalize the rule to phrasings it has never seen, instead of memorizing surface patterns. Anthropic's docs also recommend keeping examples relevant, diverse, and structured (wrapped in <example> tags) so they cover edge cases without teaching accidental correlations.

The alternatives each miss one of these properties. Logging-driven bulk examples optimize coverage of past phrasings while degrading attention and failing on novel ones. Clear-cut-only examples spend the example budget where the model needs no help. Bare tool-call pairs lock in a format while omitting the judgment, which is the actual thing being taught. See Anthropic's prompt engineering guidance on examples and Increase output consistency.

### 도메인

Prompt Engineering & Structured Output

## 질문 10

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : You define a billing-investigation subagent with an AgentDefinition. It needs to read customer and order data, but must be structurally unable to call process_refund. Which configuration achieves this guarantee?

**A.** State in the subagent's description that it is a read-only billing investigator so refund work is never routed to it.

**설명**

The description field guides when Claude delegates to the subagent; it does not constrain what the subagent can do once invoked. Even if routing is accurate, the subagent would still hold process_refund in its tool set and could call it.

**B(정답).** Set the subagent's tools field to list only get_customer and lookup_order, leaving process_refund out of its tool set.

**설명**

The tools field in AgentDefinition restricts availability: when it is specified, the subagent gets only the listed tools. A tool that is not listed simply does not exist in the subagent's session, so process_refund can never be invoked regardless of what the model attempts.

**C.** Remove process_refund from the top-level allowedTools list so any attempt to invoke it is rejected automatically.

**설명**

allowedTools controls auto-approval, not availability. A tool absent from allowedTools can still be called; the request simply falls through to the permission mode or a canUseTool handler, so this does not structurally prevent the call.

**D.** Add an instruction to the subagent's prompt stating that it must never call process_refund under any circumstances.

**설명**

Prompt instructions provide probabilistic compliance, not a guarantee. The model still has the tool available and could invoke it despite the instruction, which is exactly the failure mode configuration-level restrictions exist to eliminate.

### 전반적인 설명

An AgentDefinition has two required fields, description and prompt, plus optional configuration such as tools. Each of these plays a different role in the architecture: the description drives routing (Claude decides when to delegate based on it), the prompt drives behavior (how the subagent approaches its work), and the tools field drives capability (what actions are physically possible). Only the last of these is an enforcement mechanism. When tools is specified, the subagent receives exactly those tools and nothing else; a tool left off the list is not present in the subagent's session at all, so there is no call to intercept and no permission decision to make. If tools is omitted, the subagent inherits every tool available to subagents, which is why explicit restriction matters for anything with financial consequences like refund processing.

A common confusion is between AgentDefinition.tools and the top-level allowedTools option. The names suggest similar behavior, but allowedTools is an auto-approval list: matching tools run without a permission prompt, while unlisted tools remain callable and simply fall through to the permission mode or a canUseTool callback. It never removes a tool from the model's reach. Prompt instructions and description wording are weaker still; both are natural-language guidance the model usually honors but can miss, which the exam materials characterize as probabilistic compliance versus the deterministic guarantee of configuration and code. The mental model to carry: when a rule must hold every time, take the capability away or gate it in code; when a rule is a preference, put it in the prompt.

See Subagents in the SDK for AgentDefinition fields and tool inheritance, and SDK permissions for the distinction between availability restriction and auto-approval.

### 도메인

Agentic Architecture & Orchestration

## 질문 11

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : A pipeline extracts metadata from legacy service manifests. The schema marks deprecation_date as required, but many older manifests never record one, and the model fills the field with plausible dates. Which change prevents the fabrication?

**A.** Add a system prompt rule stating that the model must never output a deprecation date that does not appear in the manifest text.

**설명**

A prompt instruction cannot override a schema that structurally requires a value; when the manifest lacks a date, the model must still emit something schema-valid. Instructions reduce the odds of fabrication at best, while the required-field constraint continues to force it.

**B(정답).** Declare deprecation_date nullable with type ["string", "null"] and omit it from required so the model can return null for missing dates.

**설명**

This is correct because a required field with no null option leaves the model no honest way to report absence, so it manufactures a schema-valid value. Making the field nullable and optional gives the model a legitimate representation of a missing date, removing the structural pressure to fabricate.

**C.** Add a pattern constraint restricting deprecation_date to the manifests' ISO date format so fabricated values fail schema validation.

**설명**

Fabricated dates are typically well-formed, so a format pattern accepts them just as readily as genuine ones. Tightening the format constrains the shape of the value without creating any legal way to express that the date is absent, so the fabrication pressure remains.

**D.** Re-run each affected extraction with the fabricated date and a correction instruction included in the retry prompt.

**설명**

Retry with error feedback works for format and structural mistakes, not for information that is simply absent from the source. The manifest contains no deprecation date to re-ground against, and the schema still demands a value, so the retry can only produce another fabrication.

### 전반적인 설명

A schema does more than describe the output; it defines the entire space of answers the model is permitted to give. With Structured Outputs, required fields are guaranteed to be present with their declared types, and that guarantee cuts both ways: when a source document genuinely lacks a required value, the model cannot leave the field out, so the only schema-legal move is to invent something plausible. The fabrication is driven by the schema's design, not by careless generation. The mental model to carry is that every real-world state of the source, including "this information does not exist here," needs a legal representation in the schema.

Anthropic's supported JSON Schema subset provides exactly that representation: union types such as "type": ["string", "null"] let a field carry an explicit null, and leaving a field out of the required list makes it optional. These are distinct design choices: a required-but-nullable field forces the key to appear while permitting a truthful null, whereas an optional field may be omitted entirely. Either way, the model gains an honest answer for absent data, which is the documented prevention for this failure mode.

The other approaches attack symptoms. A format pattern only tightens the shape of the value, and invented dates are syntactically indistinguishable from real ones. Retry with error feedback is powerful for correctable errors, but it is documented as ineffective when the information is absent from the source; there is nothing in the manifest for the correction to re-ground against. And a prompt rule against guessing pits a probabilistic instruction against a hard structural constraint that demands a value; the constraint wins often enough to keep fabricated dates flowing downstream. See Structured outputs for the supported nullable and optional field mechanisms, and Increase output consistency for when to rely on schema enforcement over prompt-only techniques.

### 도메인

Prompt Engineering & Structured Output

## 질문 12

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : Two research subagents return dated findings on a CI vendor's job concurrency limit: a source published in 2023 states 20 jobs, and a source published in 2025 states 60. The synthesis step currently flags this as an unresolved contradiction. How should the final report handle these values?

**A.** Exclude the metric from the report and record a coverage gap until a third source confirms one of the two values.

**설명**

Coverage gap annotations are for information the system could not obtain, not for information it obtained twice. Withholding a metric that the dates already explain reduces the report's usefulness and misrepresents a temporal difference as missing data.

**B(정답).** Present the 2025 figure as current and the 2023 figure as historical, with dates showing a likely change over time.

**설명**

This is the correct temporal interpretation: the publication dates were captured precisely so a difference between an older and a newer source can be read as a probable change in the vendor's limit rather than a factual contradiction. Preserving both values with their dates keeps the report transparent while still giving readers the current figure.

**C.** Escalate the discrepancy to a human reviewer, since two credible sources disagree on a factual value the report depends on.

**설명**

Escalation is warranted for genuine conflicts that the system cannot interpret, but here the dates already explain the discrepancy as a change over time. Routing a resolvable temporal difference to a human wastes reviewer capacity on a case the metadata resolves.

**D.** Drop the 2023 figure from the report entirely, since a newer publication always supersedes an older one on the same fact.

**설명**

Silently discarding the older value throws away information the dates were collected to preserve; recency is interpretive context, not an automatic override rule. Removing the historical figure also hides the fact that the limit changed, which can matter for older configurations or cached assumptions.

### 전반적인 설명

The entire reason to require publication or data collection dates in subagent structured outputs is to enable this moment: when two figures for the same fact differ, dates let downstream synthesis distinguish a temporal difference (the value changed between measurements) from a genuine contradiction (two sources disagree about the same moment in time). A 2023 source reporting 20 and a 2025 source reporting 60 is most plausibly a vendor raising its limit, so the correct rendering presents the newer figure as current while retaining the older one, with dates, as historical context. Without dates, the same pair of numbers would be indistinguishable from an unresolvable conflict.

The mental model is that dates are interpretive metadata, not a tiebreaker. Automatically discarding the older value treats recency as an override rule and silently destroys provenance; the report should let readers see that the value moved. Escalating to a human spends scarce review attention on a case the metadata already resolves, and excluding the metric as a coverage gap misclassifies successfully retrieved (if evolving) information as missing. Escalation and gap annotations remain the right tools when sources of similar vintage genuinely disagree or when data truly could not be obtained.

Architecturally, this handling has to be designed in at the subagent boundary. Subagents run in their own context windows and return condensed summaries rather than raw evidence, so any date that is not carried in the structured output is unavailable to the coordinator and synthesis stages later; see Subagents for how these isolated contexts and their return values work. Requiring dates in the output schema is what makes correct temporal interpretation possible at synthesis time.

### 도메인

Context Management & Reliability

## 질문 13

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : A developer asks Claude Code to "refactor the PaymentValidator", but Grep locates three unrelated classes with that name in different modules. In past sessions Claude guessed and edited the wrong one. Which behavior should the team establish?

**A.** Add a CLAUDE.md rule telling Claude Code to select the class with the most recent commit history.

**설명**

This is incorrect because commit recency is a heuristic with no reliable relationship to which class the developer actually meant. Codifying a guess in CLAUDE.md makes the wrong-target failure systematic rather than eliminating it.

**B.** Apply the refactoring to all three matching classes so the intended one is always covered.

**설명**

This is incorrect because the classes are unrelated, so modifying all three introduces unwanted changes into two modules to avoid asking one question. It replaces a targeting error with guaranteed collateral edits that must be reviewed and reverted.

**C(정답).** Have Claude Code request a clarifying identifier, such as the file path or owning module, before making any edits.

**설명**

This is correct because when a lookup returns multiple plausible matches, the person making the request holds the definitive answer about which one they meant. One clarifying question costs a single conversational turn and eliminates the entire class of wrong-target edits that heuristic selection produces.

**D.** Have Claude Code rate its confidence in each candidate and proceed automatically when it exceeds a threshold.

**설명**

This is incorrect because self-reported confidence is a poorly calibrated proxy: the model can be confidently wrong precisely on the ambiguous cases where the check matters most. It automates the same guessing behavior behind a numerical veneer.

### 전반적인 설명

This situation is the code-workflow version of a general reliability principle: when a search or lookup returns multiple plausible matches, the correct move is to ask for an additional identifier, not to pick one by heuristic. The requester (here, the developer) has definitive knowledge of which target they meant, so one clarifying exchange resolves the ambiguity with certainty, whereas any automated tiebreaker (recency, reference counts, self-rated confidence) merely converts uncertainty into a percentage of silently wrong edits.

The mental model to hold is that ambiguity is information the agent should surface, not noise it should suppress. Editing the wrong class is far more expensive than a clarifying turn: the change may pass unnoticed into review, break an unrelated module, and erode trust in the tool. Heuristic selection also fails invisibly; nothing in the transcript signals that a guess occurred, so the error surfaces only when the wrong behavior ships.

The distractors illustrate three common anti-patterns. A recency rule in CLAUDE.md institutionalizes a guess; CLAUDE.md is guidance for behavior, and the right behavior to encode is "ask when matches are ambiguous," not "apply this tiebreaker." Editing every match trades a targeting error for guaranteed unwanted changes in unrelated code. Confidence-threshold gating relies on self-reported confidence, which is known to be poorly calibrated: the model is often most confidently wrong on exactly the ambiguous cases the gate exists to catch.

See Claude Code Best Practices and the Claude Code documentation for guidance on steering Claude Code interactively and course-correcting before edits are made.

### 도메인

Context Management & Reliability

## 질문 14

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : During automated reviews of large pull requests, each call to the pipeline's fetch_pr_details MCP tool returns 50+ metadata fields, but the review only needs the diff, changed file paths, and author notes. The context window fills before big reviews finish. Which change is most effective?

**A.** Compact the conversation between file reviews so the accumulated tool output is condensed into summaries as the session proceeds.

**설명**

This is incorrect because compaction treats the symptom after the bloat has already entered context, and summarization is lossy: precise details such as file paths and diff hunks can be condensed away. Trimming outputs before they accumulate is the structural fix.

**B(정답).** Add a PostToolUse hook that trims each fetch_pr_details result to the review-relevant fields before it enters context.

**설명**

This is correct because it stops context bloat at its source: verbose tool outputs are reduced to the handful of fields the review actually uses before they ever occupy the window. The full review can then complete without the irrelevant metadata accumulating turn after turn.

**C.** Instruct Claude in the review prompt to disregard any metadata fields that are not relevant to evaluating the code changes.

**설명**

This is incorrect because an instruction to ignore fields does not remove them from the context window; every irrelevant field still consumes tokens on each call. The window fills at the same rate whether or not the model attends to the extra data.

**D.** Raise max_tokens on each request so the model has additional room to work through the accumulated pull request metadata.

**설명**

This is incorrect because max_tokens governs the length of the model's output, not the size of the input context. The verbose tool results still consume the same input tokens, so the window fills just as quickly.

### 전반적인 설명

Tool outputs accumulate in context disproportionately to their relevance: a lookup that returns 50+ fields when only a few matter wastes tokens on every single call, and in an agentic loop those results are re-sent with the full conversation history on each subsequent request. The compounding cost is why the right place to intervene is at the point where results enter context, not after they have accumulated.

A PostToolUse hook is the mechanism designed for exactly this: it intercepts a tool's result after execution and lets your code transform it, keeping only the diff, changed file paths, and author notes before the model ever sees it. This is deterministic (code runs on every call), preserves precision (the retained fields pass through verbatim rather than being paraphrased), and scales with review size because the per-call footprint stays small.

The alternatives fail for distinct reasons. A prompt instruction to ignore irrelevant fields changes attention, not token consumption; the metadata still occupies the window. Mid-session compaction is a relief valve, not a design: it acts only after bloat has entered context, and its summarization can condense away the exact identifiers a code review depends on. Raising max_tokens only expands the response budget; it does nothing about input volume. The general principle for production agents is to shape what enters context at the source, and reserve compaction for situations where accumulation was unavoidable.

See Claude Code hooks reference and Effective context engineering for AI agents.

### 도메인

Context Management & Reliability

## 질문 15

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : In pilot testing, a same-session self-review step approves drafts containing subtle policy misapplications; the agent's reasoning shows it considered and dismissed each concern during generation. What change most directly addresses this limitation?

**A(정답).** Route each draft, along with the case data, to a separate Claude instance that lacks the generation session's reasoning.

**설명**

This is correct. A fresh instance that never saw the generator's reasoning is not anchored to the justifications that shaped the flawed draft, so it evaluates the resolution against the case data on its own merits. Anthropic guidance recommends using a separate instance or fresh context to review generated work for exactly this kind of independence.

**B.** Add stronger self-critique instructions telling the same session to challenge its own conclusions before responding.

**설명**

This is incorrect. The failure described is structural: the session retains the reasoning that justified each decision, so it tends to re-confirm rather than challenge those decisions. Stronger wording does not remove the shared-context anchoring baked into the session.

**C.** Generate two drafts within the same session and release a response only when both drafts reach matching conclusions.

**설명**

This is incorrect. Both drafts are produced from the same conversation history and the same reasoning context, so they are likely to agree on exactly the misapplications that context rationalized. Agreement between correlated attempts is not independent verification.

**D.** Enable extended thinking during the generation turn so the agent deliberates more thoroughly before finalizing each draft.

**설명**

This is incorrect. Deeper deliberation still happens inside the same reasoning trajectory that produced the errors, so the agent remains anchored to the same conclusions it already dismissed concerns about. More thinking within one context does not supply an independent perspective.

### 전반적인 설명

The failure mode here is a known weakness of self-review: a model that generated an answer retains the reasoning context that produced it, including the moments where it considered a concern and talked itself out of it. When that same session is asked to review the output, it tends to re-walk the same justifications rather than genuinely re-examine them. This mirrors author blindness in human code review, and it is consistent with the observed behavior where the agent's reasoning trace shows a concern being raised and dismissed while the self-review step still approves the draft.

The more effective architecture is an independent review instance: a second Claude call that receives the draft resolution and the underlying case data, but none of the generator's reasoning. Because its context carries no prior commitments, it must evaluate the draft against the evidence from scratch, which reduces shared-context anchoring and makes it more likely to catch subtle policy misapplications. Anthropic's guidance on Claude workflows supports having a separate instance or fresh context verify generated work. The tradeoff is an extra inference call per resolution, which is usually cheap relative to the cost of a wrong refund or misstated policy.

The distractors all fail for the same underlying reason: they keep verification inside the contaminated context. Extended thinking deepens deliberation along the same trajectory; self-critique instructions ask the biased party to police itself; and generating two drafts in one session produces correlated outputs whose agreement proves consistency, not correctness. Independence of context, not intensity of effort, is what breaks the confirmation loop.

See Claude Code Best Practices, which recommends having a separate instance review generated work, and Chain complex prompts for structuring verification as a distinct step.

### 도메인

Prompt Engineering & Structured Output

## 질문 16

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : An engineer must swap a deprecated messaging library across roughly 50 files of an unfamiliar legacy service; two integration approaches with different infrastructure needs are both viable. How should the work begin in Claude Code?

**A.** Use direct execution with /compact after each batch of files to keep the growing context from derailing the migration.

**설명**

Compaction manages context size during a long session, but it does nothing to resolve which of the two approaches to take or to build understanding of the unfamiliar code before edits start. Summarization can also drop precise details, which adds risk rather than reducing it on a wide migration.

**B.** Begin direct execution on a small subset of files and let the emerging changes reveal which integration approach fits.

**설명**

This defers the architectural decision until code is already written, which risks discovering mid-migration that the chosen approach conflicts with the infrastructure requirements. Reworking partially migrated files is far more expensive than iterating on a plan before execution.

**C.** Write a detailed upfront prompt specifying every file to change, then run in direct execution against that specification.

**설명**

This assumes the engineer already understands the legacy codebase well enough to enumerate every change, which the situation contradicts. Without exploration, the specification is likely to miss call sites and dependencies, and it still leaves the choice between the two approaches unexamined.

**D(정답).** Enter plan mode so Claude explores the codebase read-only and proposes an approach for approval before any edits.

**설명**

This is correct because the task hits every trigger for planning: a large file count, an unfamiliar codebase, and multiple viable approaches with different infrastructure consequences. Plan mode lets Claude research safely without making changes and hands the engineer a plan to review, so the approach decision is made deliberately before any code is committed.

### 전반적인 설명

Claude Code's plan mode is a permission mode designed for exactly this shape of work: Claude can read files and explore the codebase, but source edits are blocked until the user approves a proposed plan. The mental model is research and propose, then execute. Anthropic's recommended workflow is explore, plan, implement, commit: enter plan mode, let Claude answer questions and map dependencies without side effects, review the implementation plan it produces, then approve the plan to switch into execution.

The decision framework hinges on three signals, all present here: the change spans many files, the codebase is unfamiliar, and there are competing approaches whose infrastructure implications must be weighed before code is written. Iterating on a plan is fast and cheap; iterating on a half-finished 50-file migration is neither. Conversely, plan mode adds unnecessary overhead for small, well-understood changes such as a single-file fix, which is why the framework is a genuine tradeoff rather than a rule to always plan.

The distractors each fail a different way. Executing incrementally to "discover" the approach turns the architectural decision into sunk-cost rework. A detailed upfront specification presumes knowledge of the legacy code that the engineer does not have, and skips the approach comparison entirely. /compact is a context-management tool for long sessions; it neither explores the codebase nor evaluates alternatives, so it addresses a different problem. See Permission modes and Claude Code best practices for the documented guidance on when planning pays off.

### 도메인

Claude Code Configuration & Workflows

## 질문 17

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : A developer implements the $500 refund cap as a PostToolUse hook that inspects each process_refund call and records a policy violation when the amount exceeds the limit. In testing, over-limit refunds still execute against the backend. How should enforcement be corrected?

**A.** Add the $500 cap to the process_refund tool description and its input schema so the model refuses over-limit amounts when constructing the call.

**설명**

Tool descriptions and schemas are guidance the model reads, so they improve compliance only probabilistically. A rule with irreversible financial consequences needs code-level enforcement that no sampled output can bypass, which schema hints cannot provide.

**B.** Keep the PostToolUse hook but have it rewrite the tool result to report failure, prompting the model to retry the case through escalate_to_human.

**설명**

Rewriting the result only changes what the model believes happened; the real refund has already been issued against the backend. Masking a completed financial transaction as a failure creates an inconsistency between the agent's context and actual system state.

**C(정답).** Move the check into a PreToolUse interception hook that denies over-limit process_refund calls before execution and routes the case to escalate_to_human.

**설명**

PreToolUse hooks fire before a tool call executes, so they can deterministically deny the call and redirect the case to the human escalation workflow. This is the only lifecycle point where a policy-violating refund can be prevented rather than merely observed.

**D.** Keep the PostToolUse hook but have it return a blocking exit code so the refund transaction is cancelled once the violation is detected.

**설명**

A PostToolUse hook runs only after the tool has already executed, so by the time it fires the refund has been processed by the backend. A blocking signal at that point can feed information back to the model, but it cannot undo or cancel the completed action.

### 전반적인 설명

The flaw here is not that a hook was used, but where in the tool lifecycle it was placed. Hooks in the Claude Agent SDK and Claude Code fire at fixed points around tool execution: a PreToolUse hook runs before the tool call is dispatched and can allow, deny, or modify it, while a PostToolUse hook runs only after the tool has already executed successfully. That timing difference determines what each hook can guarantee. Pre-execution interception can stop a policy-violating process_refund call from ever reaching the backend and redirect the case to escalate_to_human; post-execution hooks can transform or annotate results and feed feedback back to the model, but they observe a completed action.

The mental model an architect should hold is that enforcement must sit upstream of the irreversible event. A refund is a financial side effect: once the backend commits it, no exit code, blocked signal, or rewritten tool result reverses it. Returning a blocking code from PostToolUse or faking a failure result only changes what the model sees next, and faking failure is actively harmful because the agent's context now contradicts real system state, which can lead it to issue a second refund. Schema and description changes are the softest option of all: they shape the model's behavior probabilistically, which is appropriate for preferences and formatting but not for compliance rules where a single miss has financial consequences.

The general rule this question exercises: use PostToolUse for observation and normalization of results, and PreToolUse for anything that must never happen. See the Claude Code hooks reference and the hooks guide for the lifecycle events and their blocking semantics.

### 도메인

Agentic Architecture & Orchestration

## 질문 18

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : Two days ago you ran a long named session that analyzed twelve files while diagnosing a race condition. Since then a teammate modified two of those files; the rest of the analysis remains valid. What should you do when continuing the work?

**A(정답).** Resume the session and name the two modified files, directing Claude to re-read them before relying on its earlier analysis.

**설명**

This is correct because a session persists conversation history, not the filesystem, so the old contents of the two files still sit in the restored context. Explicitly naming the changed files and directing a re-read corrects the stale evidence while keeping the still-valid analysis of the other ten files.

**B.** Resume the session and immediately run /compact so summarization removes the outdated file contents from the restored history.

**설명**

Compaction compresses the conversation to save context space; it does not know which file contents are outdated or replace them with current versions. A summary built on stale reads simply carries the stale conclusions forward in condensed form.

**C.** Discard the session and start a fresh one, because modifying any previously read file invalidates the entire resumed context.

**설명**

Starting fresh is the right call when tool results have gone substantially stale, but here only two of twelve files changed and the rest of the analysis remains valid. Discarding the session throws away useful investigation context that a targeted re-read instruction would have preserved.

**D.** Resume the session without extra instructions, since resumption restores a filesystem snapshot that refreshes stale file reads.

**설명**

This is incorrect because sessions store the conversation, not a filesystem snapshot. File contents enter context only when Claude reads them, so the earlier read results for the modified files remain in history exactly as they were.

### 전반적인 설명

The mental model to hold here is that a session is conversation history, not a filesystem snapshot. When you resume, the SDK restores the prompt, every tool call, every tool result, and every response exactly as they were recorded. File contents enter that history only at the moment Claude reads them, so editing a file afterward does not retroactively update the earlier read result. A resumed session therefore contains the two modified files as they looked two days ago, presented with the same confidence as everything else in context.

Because only a small fraction of the analyzed files changed, the documented tradeoff between resuming and starting fresh favors resumption: most of the prior investigation is still valid and expensive to rebuild. The reliable pattern is to inform the agent about the drift: name the changed files in the resumption prompt and instruct Claude to re-read them before building on its earlier conclusions. This surgically replaces the stale evidence while preserving the rest of the context. The reverse case, where substantial portions of the analyzed code have changed, is when discarding the session and seeding a new one with a structured summary becomes the better choice.

The other approaches fail on mechanism. Relying on an automatic refresh assumes a filesystem snapshot that sessions do not maintain. Running /compact compresses history but has no way to distinguish current from outdated file contents, so it condenses the stale reads rather than correcting them. See Sessions in the Agent SDK for what session persistence actually stores, and Prompt caching for why editing files does not refresh earlier reads in context.

### 도메인

Agentic Architecture & Orchestration

## 질문 19

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : An engineer on this team wants Claude Code to follow their personal working preferences (for example, explaining shell commands before running them) in every repository they open, while guaranteeing teammates never receive those preferences through version control. Where should these instructions live?

**A.** In the project-level CLAUDE.md under a clearly labeled personal section.

**설명**

The project-level CLAUDE.md is committed to version control and loaded by every teammate's sessions. A label does not scope visibility, so the personal preferences would still ship to the whole team.

**B.** In a gitignored CLAUDE.local.md file created in each repository.

**설명**

CLAUDE.local.md is the documented place for personal project-specific instructions kept out of version control, so its scope is one project, not all of them. The preferences would need to be recreated and maintained in every repository the engineer opens; for preferences that should apply across all projects, the user-level file is the right scope.

**C.** In ~/.claude/settings.json, which applies personal configuration across all projects.

**설명**

The user-level settings.json has the right scope but the wrong content type: it carries JSON configuration such as permissions and tool settings, not natural-language instructions for Claude to follow. Behavioral preferences belong in a memory file.

**D(정답).** In ~/.claude/CLAUDE.md in the engineer's home directory.

**설명**

The user-level CLAUDE.md applies to that user alone across all projects on their machine, and it never travels through version control. This is exactly the documented home for personal preferences that should follow one engineer everywhere without affecting teammates.

### 전반적인 설명

Claude Code's memory files are scoped by location, and the mental model is a two-axis grid: who sees the instructions (just you, or the team) and where they apply (one project, or everywhere). The user-level file at ~/.claude/CLAUDE.md occupies the "just you, all projects" cell: it lives in the home directory, so it is loaded into every session that engineer starts on that machine, and it can never be committed to a repository, so teammates are structurally incapable of receiving it. That makes it the correct home for cross-project personal preferences.

The other cells of the grid explain why the remaining choices miss. CLAUDE.local.md covers the "just you, one project" cell: it holds personal project-specific instructions and is kept out of version control via .gitignore. That scope is right for repo-bound personal notes, but preferences placed per repository would have to be duplicated and kept in sync across every project, which defeats the point of an always-on personal preference. The project-level CLAUDE.md at the repository root is the "whole team" cell; anything written there is shared through source control regardless of how a section is labeled, so it is the wrong surface for content teammates should never see. Finally, ~/.claude/settings.json shares the user scope but serves a different purpose entirely: it holds structured configuration such as permission rules, not prose instructions that shape Claude's behavior.

See the official documentation on Claude Code memory for the full hierarchy of instruction files and their sharing scopes, and Claude Code settings for what belongs in the JSON settings files instead.

### 도메인

Claude Code Configuration & Workflows

## 질문 20

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : A developer refactoring the agent's escalation logic enters plan mode and notices Claude running git log and grep shell commands before any plan has been presented. What should the developer do?

**A.** Move the work into a temporary git worktree so any edits Claude stages during planning stay isolated until approval.

**설명**

Plan mode does not stage edits anywhere; it defers making edits entirely until approval, so there is nothing to isolate. Worktrees are a separate mechanism for running parallel sessions on one codebase, not part of how plan mode operates.

**B(정답).** Continue planning; exploratory reads and shell commands are expected, and source edits wait until the plan is approved.

**설명**

This matches what plan mode actually restricts. It is an analysis-first mode: Claude can research the codebase, read files, and run shell commands to explore, but source edits are withheld until the user approves the proposed plan, so no intervention is needed.

**C.** Block all tool calls for the rest of the planning phase so the plan is produced only from context already in the session.

**설명**

The value of plan mode comes precisely from active exploration: reading files and running commands to understand the codebase before proposing changes. Forbidding all tool use would produce a plan based on guesswork rather than evidence.

**D.** Interrupt the session and re-enter plan mode, since running shell commands means the session has dropped out of plan mode.

**설명**

Plan mode is not defined by a fixed allow-list that excludes shell commands. Commands may run during planning as part of exploration, so seeing one does not mean the session left plan mode, and restarting it discards useful investigation.

### 전반적인 설명

Plan mode is best understood as an edit gate, not a tool lockdown. While it is active, Claude Code still investigates the codebase freely: it reads files, searches with grep, inspects git history, and can run shell commands as part of that research. What it withholds is modification of source files, which happens only after the user reviews and approves the proposed plan. Seeing exploratory commands run during planning is therefore expected behavior, not a sign the mode has been bypassed, so the right move is simply to let the investigation continue.

This design reflects the tradeoff plan mode exists to make. A useful plan for something like reworking escalation logic requires real evidence about how the code actually behaves, so exploration must stay cheap and unrestricted; the expensive, hard-to-undo step is writing changes, so that is the step placed behind approval. Approval is also the transition point: accepting the plan exits plan mode and moves the session into a permission mode where editing can proceed, either automatically or with per-edit review.

The alternative responses fail in characteristic ways. Restarting the session on the assumption that shell commands signal an exit from plan mode misreads normal exploration as a mode violation, and blocking all tool use would force Claude to plan from stale or absent context, undermining the entire purpose of designing before committing. Reaching for a worktree confuses plan mode with the separate parallel-session workflow; plan mode never stages edits anywhere, it simply defers them. See Permission modes for the documented behavior.

### 도메인

Claude Code Configuration & Workflows

## 질문 21

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

## 질문 22

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Since adding three few-shot examples to the review prompt, output formatting is finally consistent, but nearly every finding is now rated critical; all three examples happened to show critical security issues. What is the right fix?

**A(정답).** Replace the examples with a diverse set spanning multiple severity levels and issue types, keeping the format identical.

**설명**

This is correct because examples teach patterns, intended or not. Three homogeneous critical-security examples taught the model that findings look critical, so the fix is diversity: examples that cover different severities and issue types demonstrate the full decision space while still locking the output format.

**B.** Add an instruction stating that severity must be judged from the code itself, independent of the severity shown in examples.

**설명**

This is unreliable because a prose instruction is competing directly against a concrete pattern the examples demonstrate, and demonstrated patterns tend to dominate abstract instructions. The examples themselves are the source of the bias and should be corrected rather than argued against.

**C.** Wrap each example in XML example tags so Claude treats them as format illustrations rather than content to imitate.

**설명**

Example tags help Claude distinguish examples from instructions and are a recommended structuring practice, but they do not stop the model from generalizing the content of the examples. If every example shows a critical finding, tagging them does not remove the severity skew they teach.

**D.** Remove the few-shot examples and rely on detailed severity criteria in prose, since the examples are biasing outputs.

**설명**

This throws away the format consistency the examples just achieved, which prose instructions had presumably failed to deliver before. The problem is not that examples exist; it is that the example set is too homogeneous, which is fixable without abandoning the technique.

### 전반적인 설명

Few-shot examples work because the model generalizes from them, and it generalizes from everything they have in common, not only the properties you intended to teach. Anthropic's guidance on multishot prompting makes this explicit: examples should be relevant (mirroring the real use case), structured (demonstrating the exact output shape), and critically diverse, covering varied cases without teaching unintended patterns. When all three examples in a review prompt show critical security issues, the shared trait becomes part of the learned pattern: the model infers that reportable findings are critical findings, and severity ratings collapse toward that value.

The remedy is to keep the technique and fix the example set. A small set of 3 to 5 examples that holds the format constant (location, issue, severity, suggested fix) while varying severity levels and issue categories teaches both the structure and the judgment boundary. Adding a countervailing prose instruction pits an abstract rule against a concrete demonstrated pattern, and demonstrations tend to win. Wrapping examples in <example> tags is good hygiene for separating examples from instructions, but tags do not neutralize the content skew inside them. Removing the examples entirely surrenders the formatting consistency they delivered, solving the severity problem by reintroducing the original one.

The mental model to carry: an example set is a training signal in miniature, so audit it for accidental regularities the same way you would audit a dataset. See Prompt engineering and Increase output consistency.

### 도메인

Prompt Engineering & Structured Output

## 질문 23

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : A nightly pipeline job invokes Claude Code to scaffold boilerplate modules, but the job hangs indefinitely waiting for input no human will provide. Which two invocation changes prevent the hang? (Select two.)

**A(정답).** Run the invocation with the -p flag so the prompt is processed non-interactively and the process exits.

**설명**

The -p (or --print) flag is the documented way to run Claude Code non-interactively: it processes the prompt, writes the result to stdout, and exits without waiting for user input. This directly removes the interactive session that causes the job to hang.

**B.** Add --output-format json, which switches Claude Code into non-interactive mode for automated environments.

**설명**

The --output-format flag controls how results are emitted, which is useful for parsing output in a pipeline, but it does not change the execution mode. Without -p the session remains interactive and the job still hangs.

**C.** Pass the prompt as a positional argument to claude, which runs the command without entering an interactive session.

**설명**

Running claude with a quoted prompt but no -p flag starts an interactive session seeded with that prompt, so the process still waits for further input. Only the -p or --print flag makes the run non-interactive.

**D(정답).** Pre-approve the tools the job needs with --allowedTools so tool calls never pause for a permission prompt.

**설명**

Even in print mode, tool calls that would normally prompt for permission can stall a run that has no human to answer. Listing the required tools with --allowedTools auto-approves them so the pipeline proceeds unattended.

### 전반적인 설명

Claude Code has two fundamentally different execution modes, and CI failures like this one almost always come from confusing them. Running claude "some prompt" starts an interactive session with that prompt as the opening message; the process then waits for the next turn, which in a pipeline means waiting forever. Running claude -p "some prompt" (equivalently --print) runs in headless mode: the prompt is processed, the result goes to stdout, and the process exits. That flag, not the presence of a prompt argument, is what makes a run script-safe.

The flag alone is necessary but not sufficient for unattended runs. Tool invocations that would normally trigger a permission prompt still need a resolution path, so headless invocations are typically paired with --allowedTools to auto-approve the specific tools the job requires (note that this means "run these without prompting," not "restrict the run to these tools"). The mental model is two separate gates: -p removes the conversational wait, and permission configuration removes the approval wait; a hang can come from either gate being left closed.

Output formatting is orthogonal to both gates. --output-format json makes results machine-parseable, which matters once the pipeline needs to consume findings, but it has no effect on whether the process waits for input. See Headless mode and the CLI reference for the documented invocation patterns.

### 도메인

Claude Code Configuration & Workflows

## 질문 24

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : After the system prompt was updated to instruct the agent to "process every customer issue to full resolution," logs show it initiating process_refund on billing disputes where customers only want a charge explained. What is the most direct fix?

**A.** Use tool_choice to force get_customer as the first tool call in every session so a refund cannot be the agent's opening action.

**설명**

Forcing a specific first tool only controls the opening call; the agent can still initiate an unwanted refund on any later turn. It also adds rigidity to every conversation instead of removing the prompt wording that causes the bias.

**B.** Lower the sampling temperature so the agent applies its tool selection logic more consistently across billing conversations.

**설명**

Temperature affects randomness in token selection, not the semantic association driving this misrouting. A lower temperature would make the agent apply the same biased selection more consistently, not more correctly.

**C(정답).** Reword the system prompt instruction so it no longer echoes the tool name, for example "resolve every customer issue to full resolution".

**설명**

This is correct because the word "process" in the mission statement creates an unintended keyword association with the process_refund tool, biasing selection toward it. Since the misrouting appeared immediately after this wording change, removing the echoed keyword addresses the root cause directly.

**D.** Expand the process_refund description with additional boundary language listing the billing situations where issuing a refund is not appropriate.

**설명**

The behavior regressed immediately after the prompt update, so the newly introduced wording is the most direct place to intervene. Adding boundary language compensates for the bias rather than removing the keyword association the prompt change created.

### 전반적인 설명

When tools are supplied to the Messages API, Anthropic assembles a special system prompt that combines the tool definitions, the tool configuration, and your own system prompt. The model therefore selects tools based on the interplay between prompt wording and tool metadata, not on tool descriptions alone. An instruction whose vocabulary overlaps a tool name, such as "process every customer issue" alongside a tool named process_refund, quietly nudges the model toward that tool even when the request calls for something else. The misrouting appearing immediately after the prompt update points squarely at the new wording as the root cause.

The mental model to carry: tool selection is steered by every piece of text the model sees at selection time. Anthropic documents that system prompt wording shifts the tool-triggering boundary; light phrasing like "use your judgment" keeps behavior conservative, while stronger action-oriented language increases tool use. Keyword echoes are a subtler version of the same effect, so auditing prompt vocabulary against tool names is a standard debugging step when misrouting appears without any tool changes.

The alternatives all miss the cause. Expanding the refund tool's description adds tokens to counteract a bias the prompt update introduced, rather than removing the echoed keyword itself; when a regression follows a specific wording change, editing that wording is the most direct first fix. Temperature governs sampling randomness, not semantic associations, so lowering it does not correct a systematic pull toward one tool. Forcing get_customer first via tool_choice constrains only the opening action and leaves later turns free to trigger the same unwanted refund calls, while imposing an unnecessary fixed step on every session. See Tool use overview and How to implement tool use.

### 도메인

Tool Design & MCP Integration

## 질문 25

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : A coordinator agent delegates refactoring investigations (usage scans, dependency traces) to several subagents. You are auditing how subagent failures reach the coordinator. Which TWO reporting behaviors are anti-patterns to eliminate? (Select TWO.)

**A(정답).** Halting the entire investigation as soon as any single subagent reports an unrecoverable failure.

**설명**

Terminating the whole workflow on one failure is an anti-pattern because it discards the valid findings of every other subagent. The coordinator should continue with the results it has and record where coverage is incomplete.

**B(정답).** Returning an empty result set marked as successful when a subagent's dependency scan fails midway.

**설명**

This is silent error suppression, a documented anti-pattern. The coordinator sees a clean success with no matches and concludes the code has no dependencies, turning a failure into misinformation that corrupts downstream refactoring decisions.

**C.** Reporting a genuinely empty match set as a successful result, distinct from a failed access attempt.

**설명**

This is correct behavior, not an anti-pattern. A search that ran successfully and found nothing is a valid result; conflating it with an access failure would trigger pointless retries or false alarms, so the two must stay distinguishable.

**D.** Proceeding with results from the remaining subagents while annotating the resulting coverage gap.

**설명**

This is the recommended coordinator response to a propagated failure, not an anti-pattern. Continuing with partial results while documenting what is missing preserves useful work and keeps the final output honest about its gaps.

### 전반적인 설명

Because each subagent runs as a separate agent instance with its own conversation, the coordinator never sees the internal retries or tool calls; only the subagent's final message comes back. That isolation is why the accuracy of the failure report matters so much: the report is the coordinator's entire window into what happened. See Subagents in the Claude Agent SDK for how this context boundary works.

Two behaviors break this contract. Silent suppression, returning a failure as a success with empty results, converts an error into false data: a dependency scan that died midway looks identical to a module with no dependents, and the coordinator will plan a refactor around that fiction. Terminating the whole workflow on a single failure is the opposite extreme: it throws away every completed investigation because one branch failed, when the correct move is to proceed with partial results and annotate the coverage gap.

The two non-anti-patterns are the pillars of healthy propagation. Distinguishing a valid empty result (the query ran, nothing matched) from an access failure (the query never completed) tells the coordinator whether a retry decision is even relevant. And continuing with partial results plus an explicit gap annotation keeps the system productive and honest at the same time: the final report can state what was verified and what was not, rather than pretending to completeness or delivering nothing.

### 도메인

Tool Design & MCP Integration

## 질문 26

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : Explore subagents return prose summaries such as "the retry helper is duplicated in three modules," and the main session must re-run discovery just to locate that code before editing. What change fixes this?

**A.** Have subagents return their complete exploration transcripts so no location details are lost during summarization.

**설명**

Returning full transcripts preserves locations but defeats the purpose of delegation, which is to keep verbose discovery output out of the main context. The main session would absorb all the bulk the subagent was meant to isolate, degrading it over long tasks.

**B.** Keep exploration in the main session and rely on /compact so discovered locations remain in the conversation.

**설명**

Compaction summarizes history, and summarization is precisely the step that tends to drop precise details like file paths and line numbers. This abandons context isolation while still exposing the findings to the lossy compression that caused the problem.

**C(정답).** Require each subagent finding to be returned as a structured entry that includes the file path and line range it refers to.

**설명**

This is correct because the failure is missing source-location metadata, not missing findings. When subagents attach the file path and line range to every claim, the main session can act on findings directly without repeating the discovery work that delegation was supposed to isolate.

**D.** Instruct the main agent to independently confirm each summarized finding with Grep and Read before making any edit.

**설명**

This re-runs in the main session the exact exploration that was delegated to keep verbose output out of the main context. It treats the symptom (unlocatable findings) by duplicating work and refilling the context window instead of fixing the subagent output contract.

### 전반적인 설명

Subagent delegation trades detail for context economy: the subagent does verbose exploration in its own context and hands back a distilled result. That trade only works if the distilled result carries the metadata a downstream consumer needs to act. For codebase investigation, the actionable metadata is the source location: file path, line range, and ideally the symbol name. A prose claim like "the retry helper is duplicated in three modules" is a finding without an address, so the main session must rediscover what the subagent already found, paying the exploration cost twice.

The structural fix is an output contract: require subagents to emit structured findings where every claim is paired with its location metadata. This mirrors the general provenance principle Anthropic recommends when grounding responses in source material, where content is paired with source identifiers so downstream steps can attribute and verify claims rather than reconstruct them; see Citations for how claim-to-source pairing supports verifiable outputs.

The alternatives fail for structural reasons. Re-verifying every finding with Grep and Read in the main session duplicates the delegated work and refills the main context with the discovery noise delegation exists to exclude. Returning complete transcripts preserves locations but abandons compression entirely, so the main window bloats and degrades. Keeping exploration in the main session with /compact is worse still: compaction is summarization, and summarization is the mechanism that reliably strips precise details such as paths and line numbers. Only changing what subagents are required to output fixes the problem at its source while keeping the context benefits of delegation.

### 도메인

Context Management & Reliability

## 질문 27

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : Mid-task, the agent hits a legacy database migration decision it cannot resolve autonomously and must escalate to a senior engineer. Engineers receiving escalations have no access to the agent's session transcript. What should the escalation contain?

**A(정답).** Include a structured summary of the affected modules, the analysis completed so far, the blocking question, and a recommended next step.

**설명**

This is correct because the receiving engineer has no transcript, so the handoff must be self-contained. A structured summary transfers the investigation's state, findings, the specific decision needed, and a recommendation, letting the engineer act without redoing the agent's work.

**B.** Include an urgency rating and an estimate of the task's remaining complexity, so the engineer can slot the escalation into their workload.

**설명**

Priority metadata helps with scheduling but conveys nothing about the actual state of the investigation. Without the findings, the blocking question, and a recommendation, the engineer still must start over.

**C.** Send only the original task description, so the engineer investigates from scratch without being anchored by the agent's earlier conclusions.

**설명**

This discards all completed investigation in the name of unbiased fresh eyes, forcing the engineer to repeat hours of exploration. The handoff should carry findings forward, not throw them away.

**D.** Send the complete raw output of every Read, Grep, and Bash call the agent executed, so the engineer has all the evidence gathered.

**설명**

This transfers unprocessed noise rather than case state. The engineer would have to re-derive the analysis from verbose tool output, which defeats the purpose of the agent having done the investigation in the first place.

### 전반적인 설명

When an agent escalates work to a human who cannot see the conversation transcript, the handoff itself is the only channel through which the investigation's state can survive. A structured handoff summary exists precisely for this: it captures the identifying context (which modules and systems are involved), the root cause analysis or findings accumulated so far, the specific decision or blocker that triggered the escalation, and the agent's recommended action. The receiving engineer can then make one informed decision instead of re-running an investigation that may have taken the agent dozens of tool calls to complete.

The mental model is that escalation is a context transfer problem, not just a routing problem. An agent's session context (tool results, reasoning, intermediate conclusions) is invisible outside the session, so anything not explicitly compiled into the handoff effectively ceases to exist for the human. This is the same principle that governs subagent delegation in the Claude Agent SDK: context never transfers implicitly, so whoever hands off work must package what the recipient needs. Dumping raw tool output fails because it transfers evidence without the analysis, leaving the human to redo the synthesis. Sending only the original task, or only priority metadata, fails in the opposite direction: the investigation's value is discarded entirely and the engineer starts from zero.

In practice, teams often define the handoff as a fixed schema (task context, findings, blocking question, recommendation) so escalations are consistent and machine-checkable. Anthropic's guidance on agent design emphasizes this kind of explicit state transfer at boundaries; see Building Effective Agents and the Claude Agent SDK overview.

### 도메인

Agentic Architecture & Orchestration

## 질문 28

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : Quarterly quality audits show the agent's resolutions are 96% correct overall, and leadership wants to end manual spot-checks of resolved cases. What should the team verify before agreeing?

**A.** Extend the audit window to collect a much larger sample so the 96% aggregate estimate reaches statistical significance.

**설명**

A larger sample makes the aggregate estimate more precise, but a precise aggregate can still conceal weak segments. The problem is not the confidence interval around 96%; it is that a single overall number cannot reveal category-level variation.

**B(정답).** Segment the accuracy figure by issue category and confirm performance is consistent across billing disputes, account issues, and returns.

**설명**

This is the correct safeguard because an aggregate score can hide severe failures in a minority segment. If returns dominate case volume, a 96% overall figure could coexist with a much lower accuracy on billing disputes, and only per-segment analysis exposes that before oversight is removed.

**C.** Benchmark the 96% figure against the measured accuracy of the human agents themselves and end spot-checks once the agent scores higher.

**설명**

Beating human accuracy on average does not address the risk that the average is masking a poorly performing case type. Both the agent and the humans could look fine in aggregate while the agent fails badly on one specific category the comparison never isolates.

**D.** Verify that the agent's self-rated confidence exceeded a calibrated threshold on every case included in the audit sample.

**설명**

Model self-rated confidence is an unreliable proxy for actual correctness; the model can be confidently wrong precisely on the hard cases. It does not substitute for measuring accuracy separately across the issue categories the agent actually handles.

### 전반적인 설명

The core risk here is that an aggregate accuracy metric averages over whatever case mix happens to arrive. A support agent handling returns, billing disputes, and account issues could resolve routine returns almost perfectly while mishandling a large fraction of billing disputes, and the blended number would still look excellent if returns dominate the volume. Removing human spot-checks on the strength of that blended number would leave the weakest category completely unmonitored, which is exactly where errors carry the highest cost.

The right mental model is that accuracy is only meaningful relative to a defined segment. Anthropic's evaluation guidance stresses defining measurable, task-specific success criteria and building evaluations against them rather than trusting a single global score; see Define your success criteria and Create strong empirical evaluations. In practice that means breaking results down by issue category (and, for extraction-style outputs, by field) and confirming the performance floor across every segment before reducing oversight.

The alternatives fail for characteristic reasons. Benchmarking against human accuracy compares two aggregates, so the same masking problem applies to both sides of the comparison. Growing the sample size tightens the confidence interval around the overall number without ever decomposing it, so a precise 96% can still hide a failing category. Self-rated confidence is a known unreliable proxy: models are often confidently wrong on difficult cases, so gating oversight removal on confidence scores misses exactly the errors that matter most. Segmented validation, ideally paired with ongoing sampling after the change, is the defensible precondition.

### 도메인

Context Management & Reliability

## 질문 29

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : A changelog-generation subagent currently inherits all 20 tools available in the session: the built-ins plus everything from three connected MCP servers. Logs show it frequently calls the wrong tool. Which change most directly improves its tool selection reliability?

**A(정답).** Restrict the subagent's tools field to the handful of tools its changelog task actually requires.

**설명**

This is correct because tool selection reliability degrades as the number of available tools grows, and scoping the subagent's tool list is an architectural control. Choosing among a few role-relevant tools is far more reliable than choosing among 20, and tools outside the subagent's specialization cannot be misused if they are never granted.

**B.** Prefix each MCP tool's name with its server name so related tools are visually grouped in the catalog.

**설명**

This is incorrect because renaming reorganizes the same 20-tool catalog without reducing decision complexity. Tool selection is driven primarily by descriptions, and grouping by server does not tell the model which tools are relevant to the changelog task.

**C.** Add an initial routing tool that the subagent must call first to learn which tool fits each step.

**설명**

This is incorrect because it adds a selection step to solve a selection problem; the subagent must still correctly choose to call the router, and every subsequent call still happens against the full inventory. It introduces latency and a new failure point without shrinking the choice space.

**D.** Expand the subagent's system prompt with a section warning it away from the tools it should not use.

**설명**

This is incorrect because prompt instructions are probabilistic guidance layered on top of an oversized inventory. The irrelevant tools remain available and continue to compete for selection, so occasional wrong-tool calls will persist despite the warnings.

### 전반적인 설명

The number of tools an agent can see is itself a design decision, not a fixed given. As a tool catalog grows, every tool definition competes for the model's attention at selection time, and the probability of misrouting rises: an agent choosing among a few role-relevant tools performs markedly better than one choosing among 20, and tools outside its specialization tend to get misused precisely because they are available. Anthropic's documentation reflects the same mental model, noting that selection accuracy drops as large tool libraries accumulate and recommending that only the small set of tools actually needed for a request be loaded into context; see the Tool search tool documentation.

In Claude Code, a subagent's definition includes a tools field for exactly this purpose. Scoping it to the changelog task (for example Read, Grep, and a git-history tool) removes the irrelevant options from the decision entirely, which is a deterministic fix: a tool that is not granted can never be selected. The tradeoff is a small loss of flexibility, but a single-purpose subagent rarely needs breadth.

The alternatives all leave the oversized inventory in place. Prompt warnings are probabilistic and must fight the catalog on every turn. Prefixing names reshuffles the same choices without reducing their count, and selection is driven by descriptions more than names anyway. A routing tool relocates the selection problem instead of solving it, since the router itself must be chosen correctly and the full catalog remains exposed afterward.

### 도메인

Tool Design & MCP Integration

## 질문 30

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : An MCP server the agent relies on returns 40+ fields per response when only five are relevant, bloating context and confusing the model. The server is third-party and cannot be changed. Which mechanism trims each result before the model processes it?

**A.** Register a PreToolUse hook that rewrites the outgoing tool call so the server returns only the fields the agent needs.

**설명**

PreToolUse hooks fire before execution and can modify or block the outgoing call, but they cannot touch the result. A third-party server that always returns 40+ fields will still return them regardless of how the request is shaped, so the verbose payload still reaches the model unfiltered.

**B.** Define a separate trim_fields tool that the agent calls after each retrieval to reduce the result to relevant fields.

**설명**

This depends on the model remembering to call the extra tool, adding a loop iteration and a failure mode on every retrieval. Worse, the verbose result has already been appended to context by the time the trimming tool runs, so the context bloat is not avoided.

**C.** Add a system prompt instruction directing the agent to ignore irrelevant fields in that tool's responses when reasoning.

**설명**

Prompt instructions provide only probabilistic compliance, and the full 40-field payload still enters the context window, consuming tokens and diluting attention. The instruction changes how the model tries to read the noise; it does not remove the noise.

**D(정답).** Register a PostToolUse hook that intercepts the tool's result and passes only the relevant fields through to the agent.

**설명**

PostToolUse hooks run after a tool completes successfully and can replace the tool output before Claude sees it. This transforms every result deterministically in code, works for third-party MCP tools you cannot modify, and keeps irrelevant fields out of context entirely.

### 전반적인 설명

The mental model to hold is that everything a tool returns is appended to the conversation history, and that history is the only channel through which the model sees the world. If a tool dumps 40 fields when 5 matter, the other 35 are not merely wasted tokens; they compete for attention and can mislead reasoning. The Agent SDK's hook system exists to give you deterministic, code-level interception points around this flow: PreToolUse fires before a call executes (where you block or rewrite the outgoing request), and PostToolUse fires immediately after a tool completes successfully (where you inspect and reshape the result before the model consumes it).

For this problem, a PostToolUse hook is the designed answer. The hook receives the tool name, the original input, and the tool response, and can return hookSpecificOutput.updatedToolOutput to replace what Claude sees; the replacement must match the tool's output shape. Because the hook runs in your harness rather than in the model, it works identically for third-party MCP servers you cannot modify, and it fires on every call with no reliance on the model's cooperation. Note the boundary: PostToolUse only changes what the model sees, not what happened; the tool has already executed, so side effects are unaffected.

The alternatives each miss the interception point. A PreToolUse hook shapes the request, but a server that unconditionally returns a verbose payload will still return it. A system prompt instruction is probabilistic guidance layered on top of context that is already polluted. A dedicated trimming tool inverts the ordering: the verbose result lands in context first, then the model must remember to clean up after it, adding latency and a per-call failure mode.

See the Agent SDK hooks documentation and the Claude Code hooks reference for the full event schema and output fields.

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

## 질문 32

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : A developer keeps a custom slash command for database migrations in a file at ~/.claude/commands/db-migrate.md, so teammates cannot invoke it. What change makes the command available to everyone who clones the repository?

**A.** Add an @import in the project CLAUDE.md pointing at the file's home directory path.

**설명**

The @path import syntax modularizes CLAUDE.md content, not command definitions, so this would not register a slash command. It would also reference a path in one developer's home directory, which does not exist on teammates' machines.

**B.** Have each teammate copy the file into their own ~/.claude/commands/ directory.

**설명**

Manual copying works once but leaves the command unmanaged: every future improvement must be re-copied by every teammate, and new hires never receive it. Hand-distributed configuration inevitably drifts, which is exactly what version-controlled project scope prevents.

**C.** Paste the command's prompt body into the project CLAUDE.md under a # Commands heading.

**설명**

CLAUDE.md carries always-loaded project context and conventions; it is not a mechanism for defining slash commands. Text placed there would load into every session as instructions but would not create an invocable command.

**D(정답).** Move the command file into .claude/commands/ in the repository and commit it.

**설명**

This is correct because command scope is determined by file location: files in .claude/commands/ within the repository are project-scoped and travel with version control, so every teammate who clones or pulls the repository gets the command automatically. The same markdown file continues to define the command's behavior once relocated.

### 전반적인 설명

Claude Code resolves custom slash commands by file location, and location is what determines who can use them. A markdown file in ~/.claude/commands/ is user-scoped: it follows one person across all their projects and is never committed to version control. The same file placed in .claude/commands/ inside the repository becomes project-scoped: it ships with the codebase, so anyone who clones or pulls the repository can immediately invoke it. In both locations the markdown file itself is the command definition; moving it changes who sees the command, not what the command does.

The mental model is that shareability should ride on the same mechanism the team already uses to share everything else: git. Copying files between home directories reproduces the command once but breaks the update path; every revision creates silent divergence across machines. Pasting the prompt into CLAUDE.md confuses two different surfaces: CLAUDE.md holds always-loaded context and conventions, while command files define on-demand invocations. Similarly, @path imports exist to keep CLAUDE.md itself modular; they do not register commands, and a path into one user's home directory is meaningless on any other machine.

Note that .claude/commands/ is the legacy command format and remains supported; current Anthropic guidance also offers Agent Skills at .claude/skills/<name>/SKILL.md, which follow the same project-versus-user scoping logic. See Slash commands for details.

### 도메인

Claude Code Configuration & Workflows

## 질문 33

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : The agent must invoke record_task as its first action on every request, but runs sometimes begin with a Grep call or a plain-text reply instead. Which tool_choice setting on the first request guarantees the required first step?

**A(정답).** Force the record_task tool with {"type": "tool", "name": "record_task"} on the initial request.

**설명**

Forcing a specific named tool is the only tool_choice option that guarantees a particular tool runs. The API compels the model to emit a tool_use block for record_task, eliminating both the plain-text replies and the wrong-tool starts, after which subsequent requests can return to auto.

**B.** Add a firm system prompt rule that record_task must always precede any other tool call.

**설명**

Prompt instructions influence behavior probabilistically; they raise the odds of compliance but cannot guarantee the ordering. The scenario already shows the model skipping the step, and a guarantee requires an API-level constraint rather than stronger wording.

**C.** Strengthen the record_task description to state it runs before all other tools in every session.

**설명**

Descriptions guide tool selection when the model is deciding among tools, but under the default auto setting the model may still respond in plain text or reach for a different tool first. A description improves selection quality; it does not enforce an execution order.

**D.** Set tool_choice to {"type": "any"} on the initial request so a tool call is guaranteed.

**설명**

The any setting guarantees that some tool is called, but the model still chooses which one. Since Grep and other built-in tools remain in the catalog, runs could still begin with a search instead of record_task, which is exactly one of the observed failures.

### 전반적인 설명

The tool_choice parameter gives the harness three levels of control over tool invocation. auto (the default when tools are provided) lets Claude decide whether to call any tool at all, which is why runs can open with a plain-text reply. any tightens this to "a tool must be called" but leaves the choice of which tool to the model, so a Grep-first run is still possible. Only the forced form, {"type": "tool", "name": "record_task"}, pins both decisions: a tool will be called, and it will be that tool. This is the documented mechanism for guaranteeing execution order, such as ensuring a logging or metadata-extraction step runs before anything else.

The mental model is that prompts and tool descriptions shape a probability distribution, while tool_choice constrains the output space itself. When a step is mandatory (compliance logging, identity verification, a required first extraction), the constraint belongs at the API level; wording changes merely make skipping less likely. One tradeoff to know: when tool_choice is any or a forced tool, the API prefills the assistant message to compel tool use, so the model will not produce natural-language preamble before the tool call. That is acceptable for a silent bookkeeping step like record_task, and the loop can switch back to auto on subsequent turns so the agent regains full flexibility.

See the official guidance on implementing tool use for the full tool_choice semantics, including the forced-tool syntax and its interaction with response text.

### 도메인

Tool Design & MCP Integration

## 질문 34

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : The agent extracts a structured dispute record before calling lookup_order. The purchase_date field always passes schema validation, yet values arrive as "yesterday", "early last week", or "03/04/2025", and order lookups fail or return the wrong orders. What is the most effective fix?

**A.** Tighten the schema by adding minLength and maxLength constraints so malformed date strings are rejected at validation.

**설명**

Structured outputs support only a subset of JSON Schema, and string constraints such as minLength and maxLength are unsupported, so this schema can produce a request error rather than enforcement. Even if length were enforceable, it cannot convert a relative expression like "yesterday" into an absolute date.

**B.** Post-process the extracted dates with a natural-language date-parsing library that converts whatever text the model returned.

**설명**

A parsing library operates on the extracted string in isolation and lacks the conversational context the model has, so vague references like "early last week" and ambiguous numeric formats like 03/04/2025 parse unreliably. Having the model normalize during extraction, where it can see the whole conversation, is more accurate than repairing output afterward.

**C(정답).** Add prompt normalization rules: resolve relative dates against the current date provided in context and output ISO 8601.

**설명**

This is correct because a schema can only enforce that the field is a string of the right shape; converting "yesterday" or "early last week" into an absolute date is a semantic transformation only the model can perform, and it needs both an explicit rule and a reference date to do it consistently. Normalization rules stated in the prompt alongside the schema close exactly this gap.

**D.** Set the sampling temperature to zero so the model formats the date field identically on every extraction.

**설명**

Temperature controls randomness in token selection; it does not define which date convention the model should follow. Without stated normalization rules the model will still echo whatever format the customer used, just more deterministically.

### 전반적인 설명

The core distinction here is between what a schema guarantees and what it cannot express. A JSON schema attached to a structured output or tool definition constrains shape: the field will be present, it will be a string, the JSON will be syntactically valid. It says nothing about meaning: whether "yesterday" has been resolved to an absolute date, whether 03/04/2025 is April 3rd or March 4th, or whether the value is in a format lookup_order can filter on. That semantic layer belongs in the prompt: state the target convention (ISO 8601, YYYY-MM-DD), give the model the current date to resolve relative references against, and specify a disambiguation rule for ambiguous numeric formats. Repeating the rule in the field's schema description and showing an example mapping ("yesterday" becomes a computed absolute date) reinforces it, which matches Anthropic's guidance to explain format-sensitive parameters in detail in tool definitions.

Trying to push the fix into the schema fails twice over. First, structured outputs support only a subset of JSON Schema; string constraints such as minLength and maxLength are unsupported and can trigger a 400 error. Second, validation, even where it works, only rejects; it does not teach the model how to transform relative language into a date. Post-processing with a date library moves the problem to a component that never saw the conversation, so it must guess at references the model could have resolved directly. And temperature adjustments change sampling variance, not conventions: a model with no stated rule at temperature zero simply mirrors the customer's phrasing consistently. The mental model to carry: schemas enforce structure, prompts carry normalization semantics, and reliable pipelines use both together.

### 도메인

Prompt Engineering & Structured Output

## 질문 35

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : A read-only dispute-analysis subagent, added to summarize billing disputes before resolution work begins, has started calling process_refund on its own. Refund execution belongs to the main resolution flow. What is the correct fix?

**A.** Have the coordinator inspect each analysis subagent transcript after the fact and reverse any refunds it issued.

**설명**

This is reactive cleanup rather than prevention: the refund has already executed against a backend system by the time the transcript is reviewed. Financial actions should be structurally impossible for agents whose role does not include them, not undone afterward.

**B.** Expand the process_refund description to state it is reserved for the resolution flow, keeping all subagents' toolsets identical.

**설명**

Descriptions guide which tool the model selects among available options, but they do not prevent an agent from calling a tool it holds. Keeping identical toolsets across subagents leaves the misuse possible and ignores the principle of scoping tools by role.

**C(정답).** Remove process_refund from the analysis subagent's toolset, leaving it only the lookup tools its role requires.

**설명**

Scoping tool access to the role is the architectural fix: a tool the subagent does not have cannot be misused. Agents with tools outside their specialization tend to invoke them precisely because they are available, so removing the tool eliminates the failure mode deterministically.

**D.** Add a rule to the analysis subagent's system prompt stating that it must never call process_refund itself.

**설명**

Prompt instructions are probabilistic; the subagent may still call an available tool under certain conditions. Since the tool is not needed for the analysis role at all, removing it from the toolset is the reliable control, not asking the model to ignore it.

### 전반적인 설명

The governing principle here is scoped tool access: each subagent should hold only the tools its role actually requires, plus at most a small set of cross-role utilities for genuinely high-frequency needs. An analysis subagent whose job is to read and summarize has no legitimate use for process_refund, so the tool simply should not be in its inventory. This works because tool availability is an architectural control, not a behavioral suggestion; a call that cannot be constructed cannot be made, which matters most when the action has financial consequences.

The deeper mental model is that agents tend to misuse tools outside their specialization because they are available. Every tool in the catalog is a candidate at selection time, and models occasionally reach for one that seems locally helpful even when the system design routes that action elsewhere. Prompt rules forbidding a call and description text reserving a tool for another flow both operate on the probabilistic layer: they reduce the misuse rate but cannot drive it to zero, since the model still sees the tool as callable. Post-hoc coordinator review is worse still for irreversible or externally visible actions, because the refund has already hit the backend before anyone inspects the transcript.

In the Claude Agent SDK, this scoping is expressed directly: each subagent's definition specifies its tool restrictions, so the resolution flow can retain process_refund while the analysis subagent is limited to get_customer and lookup_order. See Subagents in the Claude Agent SDK and Claude Code subagents for how per-agent tool grants are configured.

### 도메인

Tool Design & MCP Integration

## 질문 36

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : In testing, the agent occasionally issues refunds without first verifying the customer through get_customer, despite explicit system prompt instructions requiring the sequence. Compliance policy mandates that verification precede every refund. What enforcement design guarantees this ordering?

**A(정답).** Add a PreToolUse hook that blocks process_refund calls until get_customer has returned a verified customer ID in the session.

**설명**

A PreToolUse hook intercepts the outgoing tool call before it executes, so a refund without prior identity verification can never run. This is programmatic enforcement in code, which provides the deterministic guarantee a compliance mandate requires.

**B.** Add few-shot examples to the system prompt demonstrating the get_customer then process_refund sequence for typical refund cases.

**설명**

Few-shot examples improve the likelihood that the model follows the sequence, but prompt-based guidance remains probabilistic. The scenario already shows that prompt instructions alone are being skipped occasionally, and a compliance mandate cannot tolerate a nonzero failure rate.

**C.** Rewrite the process_refund tool description to state that identity verification via get_customer must always be completed first.

**설명**

Tool descriptions influence how the model selects and uses tools, but they are still instructions the model may not follow in every case. Like other prompt-level guidance, this raises compliance rates without guaranteeing them, so an unverified refund can still slip through.

**D.** Add a PostToolUse hook on process_refund that checks whether a verified customer ID was obtained and flags any refund issued without one.

**설명**

PostToolUse fires only after the tool has already executed successfully, so the unverified refund has already been processed by the time the check runs. It can detect and report violations but cannot prevent them, which fails the mandate that verification precede every refund.

### 전반적인 설명

This question tests the core enforcement decision in agentic architecture: when a business rule must never be violated, the rule belongs in code, not in the prompt. Everything the model reads, including system prompt instructions, few-shot examples, and tool descriptions, shapes token probabilities. These techniques can push compliance well above 90 percent, but they remain probabilistic: on some fraction of runs the model will skip the step, exactly as the testing data here shows. A compliance mandate that verification precede every refund is a 100 percent requirement, and no amount of prompt tuning converts a probabilistic mechanism into a guarantee.

A PreToolUse hook is the right mechanism because of where it sits in the agent lifecycle: it intercepts the tool call after the model requests it but before your code executes it. The hook can inspect session state, confirm that get_customer has returned a verified ID, and block or redirect the process_refund call if the precondition is unmet. The model physically cannot cause an unverified refund because the violating call never reaches the backend. This is what Anthropic's documentation calls deterministic control: the check runs on every single invocation regardless of what the model decided. By contrast, a PostToolUse hook fires only after a tool completes, which makes it the right place for result normalization or audit logging, but too late for prevention; a financial transaction that has already executed cannot be un-executed by a hook.

The practical mental model: prompts and tool descriptions are for preferences, nuance, and behaviors where occasional deviation is acceptable; hooks are for rules whose violation carries financial, legal, or safety consequences. See the Claude Code hooks guide and the hooks reference for lifecycle events and blocking behavior.

### 도메인

Agentic Architecture & Orchestration

## 질문 37

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : You are writing the escalation section of the agent's system prompt and must define behavior for two openings: an explicit demand for a human, and an angry complaint with no such demand. Which rule pair is correct?

**A.** Escalate immediately in both situations, since anger and a human request both signal lost confidence in automated handling.

**설명**

Frustration by itself is not an escalation trigger; many angry customers are satisfied when the agent acknowledges the emotion and resolves the issue quickly. Escalating every negative opening would collapse first-contact resolution well below the 80% target for cases squarely within the agent's capability.

**B.** Apply a sentiment threshold to both situations, escalating whenever measured negativity exceeds a calibrated level regardless of wording.

**설명**

Sentiment analysis is an unreliable proxy for whether escalation is warranted, since customer mood does not correlate with case complexity or with the customer's actual preference. It also risks ignoring a calmly worded but explicit request for a human, which must always be honored.

**C(정답).** Escalate at once on an explicit request for a human; for frustration without such a request, acknowledge it and offer a resolution first.

**설명**

This is the correct pairing of the two patterns. An explicit request for a human is a first-class trigger that must be honored immediately, while frustration alone is handled by acknowledging the emotion, offering a concrete resolution, and escalating only if the customer then insists on a person.

**D.** Acknowledge the emotion and offer one resolution attempt in both situations, escalating only if the customer restates the demand afterward.

**설명**

Applying the acknowledge-then-resolve pattern to an explicit human request forces the customer to repeat a demand they already stated clearly. Overriding a stated preference in order to attempt resolution damages trust regardless of how solvable the issue looks.

### 전반적인 설명

Escalation design separates who decides from how hard the case is. When a customer explicitly asks for a human, the decision has already been made by the customer; the agent's job is to honor it immediately by calling escalate_to_human, not to demonstrate capability first. Attempting resolution, or even investigating "for a better handoff," continues work on a case the customer explicitly closed to the agent, and that erodes trust even when the underlying issue is trivially resolvable.

Frustration without an explicit request is a different signal entirely. The documented pattern there is nuanced: acknowledge the emotion, then offer a concrete resolution, and escalate only if the customer reiterates that they want a person. This preserves first-contact resolution on the large population of angry-but-resolvable cases while still respecting the customer's judgment the moment it is stated. The reliable triggers are behavioral and explicit: a stated request for a human, a policy gap or exception, or genuine inability to make progress.

Proxies like sentiment scores or the model's self-rated confidence are poor substitutes because they measure mood or self-perception, not case complexity or customer intent. A sentiment threshold both over-escalates (angry customers with routine issues) and under-escalates (a calm, polite "please connect me to a person" may score as neutral). Explicit criteria in the system prompt, ideally reinforced with few-shot examples showing when to escalate versus resolve, give the agent a decision boundary it can actually apply. See Anthropic's customer support agent guide for the recommended human-handoff patterns.

### 도메인

Context Management & Reliability

## 질문 38

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : After splitting a 600-line project CLAUDE.md into topic files under .claude/rules/, sessions still load every rule, including database migration conventions needed only when editing files under db/migrations. What change makes that rule load conditionally?

**A.** List the migrations rule file in claudeMdExcludes so it is skipped at launch and picked up when relevant.

**설명**

The claudeMdExcludes setting permanently excludes matching memory files from loading; it does not defer them until a matching file is edited. Excluding the rule would mean the migration conventions are never applied at all.

**B(정답).** Add YAML frontmatter with a paths field matching db/migrations glob patterns to the migrations rule file.

**설명**

Path-scoped rules are the documented mechanism for conditional loading: a rule with a paths field in its YAML frontmatter applies only when Claude works with files matching those glob patterns. This is exactly what keeps rarely relevant conventions out of sessions that never touch migration files.

**C.** Reference the migrations file from CLAUDE.md with an @import so its content is pulled in only on demand.

**설명**

Imports organize content across files, but imported files are expanded and loaded into context at launch, not lazily. Using @import would produce the same unconditional loading the team is trying to eliminate.

**D.** Move the migrations rule file into a db/ subdirectory under .claude/rules/ so it applies only in that area.

**설명**

Subdirectories under .claude/rules/ are supported purely for organization; all Markdown files are discovered recursively and directory placement does not scope when a rule loads. Without a paths field, the rule still loads unconditionally at launch.

### 전반적인 설명

Splitting a large CLAUDE.md into topic files under .claude/rules/ improves maintainability, but it does not by itself change what loads. A rule file without a paths field loads unconditionally at launch, with the same priority as .claude/CLAUDE.md. The context savings come from a second, separate step: adding YAML frontmatter with a paths field containing glob patterns (for example paths: ["db/migrations/**/*"]). A path-scoped rule enters context only when Claude works with files matching those patterns, which is why the documentation recommends this approach when project instructions grow large.

The mental model worth internalizing is that Claude Code has two distinct axes for instructions: where content lives (one file versus many topic files, organized however you like, including subdirectories that are discovered recursively) and when content loads (unconditionally at launch versus conditionally on path match). Only the paths frontmatter moves a rule to the conditional side. Directory placement inside .claude/rules/ affects organization only; @import statements are expanded into context at launch, so they organize without deferring; and claudeMdExcludes removes files from loading entirely rather than deferring them, so an excluded rule would simply never apply.

See Manage Claude's memory for the rules directory, path-scoped frontmatter, and import behavior, and Working with large codebases for how path-scoped rules compare with per-directory CLAUDE.md files in bigger repositories.

### 도메인

Claude Code Configuration & Workflows

## 질문 39

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : A nightly job submits thousands of documentation-generation requests as one Message Batch, one request per source file. When designing the custom_id scheme for these requests, which TWO design decisions are correct? (Select TWO.)

**A.** Use each file's full repository path, slashes included, as its custom_id, since any UTF-8 string up to 256 characters is accepted.

**설명**

This is incorrect. A custom_id is limited to 1 to 64 characters and may only contain letters, digits, hyphens, and underscores. Raw file paths containing slashes would be rejected, so paths must be encoded or mapped to a compliant identifier.

**B(정답).** Generate the identifier in your own code at submission time and use it to map each returned result back to its source file.

**설명**

This is correct. The custom_id is developer-provided in each request's wrapper and appears alongside the result object when results are retrieved, letting you map each output to its source file. It is distinct from the server-generated message identifier inside a successful result.

**C.** Omit custom_id on each request and rely on the API to generate one automatically in the batch creation response for later matching.

**설명**

This is incorrect. The custom_id is a required, developer-provided field on each request item in the batch; the API does not invent identifiers on your behalf. Correlation only works because your code chose the value and can map it back to the source file.

**D(정답).** Assign each request a custom_id that is unique within the batch, so no two requests in one submission share a value.

**설명**

This is correct. The Message Batches API requires custom_id values to be unique within a batch; duplicates within the same submission would make it impossible to unambiguously correlate each result back to its originating request.

### 전반적인 설명

The Message Batches API wraps each individual Messages request in exactly two fields: custom_id and params. The custom_id is the correlation key you supply at submission; when the batch ends, the results endpoint streams a .jsonl file where every line carries that same custom_id next to its result object. Because results are not guaranteed to arrive in submission order, this field is the only reliable way to attach each output back to the file that produced it.

Two properties make the scheme work. First, uniqueness within the batch: if two requests shared a value, a result line would be ambiguous, so the API requires each custom_id in a submission to be distinct. Second, developer ownership: the value is chosen by your code, not generated by the service, which is precisely why it can encode something meaningful to your pipeline (a file hash, a database key, a sanitized path). It is not the same thing as the API-generated message.id inside a successful result; that identifier is created server-side and tells you nothing about which source file the request came from.

The format is also constrained: 1 to 64 characters matching ^[a-zA-Z0-9_-]{1,64}$. Slashes, spaces, and other punctuation are rejected, so a naive plan to use raw repository paths as identifiers fails; teams typically hash the path or maintain a lookup table from a compliant ID to the original file. See Batch processing and the Create a Message Batch API reference for the field constraints and result-correlation workflow.

### 도메인

Prompt Engineering & Structured Output

## 질문 40

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline emits each review finding as JSON validated against a schema. One finding fails validation: severity contains an undefined enum value and line_number is null. You want the model to self-correct on a retry. What should the retry request contain?

**A.** Re-run the original review prompt from scratch at a lower temperature so the invalid output is not reproduced.

**설명**

A fresh re-run discards the feedback loop entirely; the model never learns which fields failed or why. Lower temperature makes output more deterministic but does not steer it toward schema compliance, so the retry is untargeted.

**B.** Send only the validation errors together with an instruction to regenerate the finding in a schema-compliant form.

**설명**

Without the failed output, the model cannot see what it actually produced, and without the source diff it has nothing to re-ground the corrected severity or line number against. The regeneration is effectively blind, so the same errors are likely to recur.

**C(정답).** Include the reviewed diff, the failed finding, and the specific validation errors so the model can correct against the source.

**설명**

This is the retry-with-error-feedback pattern: the model needs to see what it produced, exactly what was wrong with it, and the source material to re-ground corrected values against. With all three present, one or two retries typically resolve structural and format failures.

**D.** Resend the failed finding with a general instruction to repair any formatting problems, omitting the error details to keep the retry small.

**설명**

Omitting the specific validation errors forces the model to guess what was wrong, and a vague repair instruction gives it no operable target. Concrete error messages such as the rejected enum value are what make self-correction reliable.

### 전반적인 설명

The validation-retry loop is the standard reliability pattern for structured extraction and structured review output: your code validates the model's JSON against the schema (with a validator such as Pydantic or a JSON Schema library), and on failure it sends a follow-up request containing three things: the original source material (here, the reviewed diff), the failed output, and the specific validation errors. Each element does distinct work. The failed output shows the model what it actually said; the error messages (for example, "severity value 'urgent' is not in the allowed enum") turn correction into a targeted edit rather than a fresh guess; and the source lets the model re-derive values like the correct line number instead of inventing them. Format, structural, and enum errors of this kind are exactly the class that one or two feedback-driven retries usually fix.

Sending only the errors, or only the failed output with a vague "fix the formatting" instruction, removes one leg of that tripod: the model either cannot see its mistake or cannot ground the fix, so retries churn. Re-running the original prompt from scratch abandons feedback altogether; temperature governs sampling variability, not schema adherence, so the same failure mode remains just as available. The complementary boundary to remember is that retries only help when the problem is in the output, not the input: if the required information is genuinely absent from the source, no amount of error feedback will produce it, and the correct move is to make the field nullable or route the case for human handling rather than retry.

See Tool use with Claude for how schema-constrained output and its validation boundaries work in practice.

### 도메인

Prompt Engineering & Structured Output

## 질문 41

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : Your team's documentation pipeline runs Claude Code non-interactively with a validation-retry loop that resends each failed extraction along with its specific validation errors. The source documents never contain owner_team; that field is recorded only in a separate service catalog that is not included in the prompt or tool context. Which change to the retry policy is correct?

**A.** Stop retrying summary strings that exceed the maximum length allowed by the validation rules, and truncate those entries in a post-processing step before downstream delivery.

**설명**

An over-length summary is a formatting problem the model can fix by condensing text it already produced, so it belongs in the retry loop. Blind truncation risks cutting off meaning mid-sentence, whereas feeding back the specific length error gives the model a concrete, actionable correction target.

**B(정답).** Stop retrying blank owner_team values and instead supply the service catalog data as context so the model can ground the field in provided information.

**설명**

This is the correct policy change. Retrying cannot succeed when the required information is absent from the provided context; no amount of error feedback lets the model produce data it was never given, and pressure to satisfy the field risks fabricated values. Supplying the catalog data as context or through an integration fixes the root cause.

**C.** Stop retrying dates emitted as MM/DD/YYYY where the schema requires ISO 8601, and route those extractions to a manual reformatting queue for human correction instead.

**설명**

Format mismatches are the classic retryable failure, so removing them from the loop is wrong. When the retry prompt includes the failed output and the specific error, the model has everything it needs to reformat the date, and one or two retries typically resolve this class of issue.

**D.** Stop retrying extractions whose parameters array is nested under the wrong parent object, and regenerate those documents from scratch with a fresh prompt and no error context.

**설명**

Structural errors like a misplaced array are correctable on retry, so they should stay in the loop. Regenerating from scratch discards the error feedback that makes corrections targeted; the source content and the validation error together tell the model exactly what to restructure.

### 전반적인 설명

The mental model for validation-retry loops is simple: a retry can only succeed if everything needed for the correction is already in front of the model. When the retry prompt contains the source material, the failed output, and the concrete validation error, failures like wrong date formats, misplaced structures, and over-length strings are self-correctable, and one or two retries typically resolve them. The loop works because the model is re-grounding against information it possesses.

Missing owner_team values break that precondition. The ownership data lives only in an external service catalog that never enters the context, so every retry re-runs the same impossibility. Worse, repeatedly demanding a value the model cannot know creates pressure to fabricate one; Anthropic's hallucination guidance recommends letting the model say it lacks sufficient information and restricting it to provided documents precisely because models will otherwise generate plausible-looking but ungrounded content. The right remediations are structural: include a catalog export in the prompt (Anthropic's document-grounding guidance covers wrapping source documents so the model can draw on them), fetch the data through a tool, or make the field nullable so absence is expressed honestly.

The other proposed changes pull retryable failures out of the loop and replace self-correction with inferior mechanisms: manual reformatting queues add human toil for a fix the model performs reliably, regeneration without error context discards the feedback that makes retries targeted, and post-processing truncation can destroy meaning the model would have preserved by condensing. Distinguishing these two classes, format and structural errors versus absent information, is what keeps a retry budget from being burned on failures that can never converge.

### 도메인

Prompt Engineering & Structured Output

## 질문 42

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : An engineer's multi-day investigation of a legacy payments module spans several sessions. Each new session begins with a fresh context window, so the agent repeats hours of file discovery every time. Which practice best eliminates this rediscovery?

**A.** Run /compact before ending each session so the compacted summary is carried forward into the next session's context.

**설명**

The /compact command condenses the current conversation so an ongoing session can continue; it does not transfer state into future sessions. A new session still begins with a fresh context window, so the compacted summary is not available there.

**B.** Copy every discovered class, dependency, and code path into the project CLAUDE.md so it loads automatically at startup.

**설명**

CLAUDE.md is meant for stable project conventions and guidance that should apply to every session, and every line in it competes for attention. Dumping investigation-specific findings there bloats the context of all future sessions and degrades how reliably the important rules are followed.

**C(정답).** Have the agent record key findings in a scratchpad file as it works, then read that file at the start of each new session.

**설명**

This is the correct pattern for persisting knowledge across context boundaries. A scratchpad file lives in the workspace as ordinary external state, so a fresh session can load the distilled findings in one read instead of re-running hours of discovery.

**D.** Prompt the agent at session start to recall its earlier discoveries, since prior tool results remain accessible to the model.

**설명**

Claude has no memory between sessions; prior tool results exist only in the conversation history of the session that produced them. Asking a fresh session to recall them invites fabricated answers based on typical patterns rather than actual findings.

### 전반적인 설명

The mental model that decides this question is that Claude is stateless: each new Claude Code session starts with a fresh context window, and nothing from a prior conversation survives unless your workflow deliberately externalizes it. Knowledge crosses session boundaries only through artifacts that get loaded back in, such as CLAUDE.md memory files, or ordinary files in the workspace that the agent reads on request. A scratchpad file exploits exactly this: as the agent traces classes, dependencies, and call sites, it appends the distilled findings to a file such as investigation-scratchpad.md. That file persists not because the model remembers it but because it is external state on disk; the next session reads it in seconds and resumes from established facts instead of re-running discovery. Anthropic documents this pattern for work spanning multiple context windows, recommending explicit state files (structured JSON for status, freeform notes for progress, git for checkpoints) that a fresh session reviews on startup.

The alternatives each misunderstand where state actually lives. /compact is an in-session relief valve: it summarizes the running conversation so a single long session can continue, but the summary is part of that session's context and vanishes when a new session starts. Stuffing task-specific discoveries into CLAUDE.md abuses a surface meant for durable project conventions; memory files load into every session, so the file bloats all future contexts and dilutes attention on the rules that matter. And prompting a fresh session to recall earlier discoveries assumes hidden model memory that does not exist; the likely outcome is confident answers drawn from generic patterns rather than the specific codebase.

See Manage Claude's memory and prompt engineering guidance on external state files for the documented patterns.

### 도메인

Context Management & Reliability

## 질문 43

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : The team wants a shared ticketing MCP server available to every engineer on the project, but the server needs an API token that must never be committed. Which TWO configuration steps are correct? (Select TWO.)

**A(정답).** Add the server entry to .mcp.json at the project root and check that file into version control.

**설명**

Project-scoped MCP configuration lives in .mcp.json at the repository root, and committing it is the designed distribution mechanism: every contributor who pulls the repo gets the same server definition automatically. This is exactly the scope intended for shared team tooling.

**B.** Have each engineer add the server to ~/.claude.json and follow setup steps documented in the team wiki.

**설명**

The user-level ~/.claude.json file is for personal and experimental servers that stay with one individual. Replicating a shared server manually through wiki instructions means configuration drifts as the server definition changes, defeating the purpose of a version-controlled team configuration.

**C.** Paste each engineer's token value directly into the committed .mcp.json since the repository is private.

**설명**

Committing a live credential is a security anti-pattern regardless of repository visibility: the secret persists in git history, is exposed to anyone with repo access, and cannot vary per engineer. Environment variable expansion exists precisely to avoid this.

**D(정답).** Reference the token in the env block as ${TICKETS_TOKEN}, expanded from each engineer's environment.

**설명**

.mcp.json supports environment variable expansion, so the committed file contains only a placeholder while each engineer supplies the actual secret through their own environment. This keeps credentials out of version control while the shared configuration remains fully functional.

### 전반적인 설명

MCP server configuration in Claude Code follows a scoping model that maps directly onto the intended audience of the server. A server the whole team should share belongs in project scope: a .mcp.json file at the repository root, checked into version control, so the configuration travels with the codebase itself. A server only one person is experimenting with belongs in user scope (~/.claude.json), which never touches the repository. Choosing the right scope is not cosmetic; it determines whether teammates get the tooling automatically on clone or must reconstruct it by hand.

The tension in shared configuration is that useful servers usually need credentials, and version control is exactly where credentials must not go. The mechanism that resolves this is environment variable expansion: the committed file references ${TICKETS_TOKEN}, and Claude Code substitutes each engineer's own value at load time. The structure of the configuration is shared; the secret is not. This also means each person can hold a token scoped to their own permissions rather than everyone sharing one credential.

Hardcoding the token into the committed file breaks this separation: the secret lands in git history permanently, and a private repository is a weak boundary that changes with access grants, forks, and CI mirrors. Pushing the server into each engineer's ~/.claude.json with wiki instructions inverts the scoping model: shared infrastructure becomes a manual, drift-prone chore, and any change to the server definition requires every engineer to notice and update their own file. See Connect Claude Code to tools via MCP for the scope and configuration details.

### 도메인

Tool Design & MCP Integration

## 질문 44

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : The agent requests a Grep search across a legacy repository, and the harness executes it successfully. What must the harness do so the model can read the search results and choose its next action?

**A.** Send the output back in a dedicated tool role message, keeping tool results separate from ordinary user and assistant content in the history.

**설명**

This is incorrect because Claude's Messages API has no separate tool or function role. Tool interactions are integrated into the existing structure: tool_use blocks appear in assistant messages and tool_result blocks appear in user messages.

**B.** Attach the output to the Grep tool's definition metadata so the model reads it when it re-evaluates the available tools on its next pass.

**설명**

This is incorrect because tool definitions are static declarations of a tool's name, description, and input schema. Runtime results are never stored on definitions; they travel through the conversation history as tool_result content blocks.

**C.** Do nothing extra, since the API runs the requested Grep call server-side and automatically injects its output into the model's context.

**설명**

This is incorrect because the Messages API does not execute client tools. Claude only emits a structured request with stop_reason of tool_use; the calling application is responsible for running the tool and returning the result in a follow-up request.

**D(정답).** Append a tool_result block referencing the tool_use ID in a user message and send the updated history in the next request.

**설명**

This is correct because the API never sees tool execution; the harness must package the output as a tool_result block whose tool_use_id matches the original request, place it in a user message, and resend the full conversation. Only through this growing message history does the model observe what the tool returned.

### 전반적인 설명

The mental model to hold is that Claude is stateless and never executes client tools itself. When the model decides a tool is needed, the response arrives with stop_reason: "tool_use" and one or more tool_use content blocks containing an id, the tool name, and the input arguments. At that point the API's job is done; everything else belongs to your harness.

The harness executes the tool, then constructs a tool_result block whose tool_use_id matches the id from the original request, places that block inside a user message, and sends the entire updated conversation back in the next API call. That growing message history is the only channel through which the model learns what a tool returned; the ID linkage is what lets it pair each result with the correct request when several tools were called in one turn. This design keeps the protocol simple: there is no special tool role (a common habit carried over from other providers' APIs), no server-side execution of your tools, and no runtime data attached to tool definitions, which remain static schemas.

The tradeoff is that your loop bears responsibility for state: if you forget to append the result or resend the history, the model has no memory of the tool ever running. See Tool use overview and Handle tool calls for the full request-response cycle.

### 도메인

Agentic Architecture & Orchestration

## 질문 45

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : Prose rules telling the agent whether a legacy code pattern is safe to auto-modernize keep failing on patterns the rules never anticipated. How should the team change the prompt so the judgment transfers to unanticipated patterns?

**A.** Add the examples once in a calibration session so the model's learned behavior persists and future sessions handle new patterns.

**설명**

This is incorrect because prompt content does not train the model or persist across sessions. Few-shot examples influence behavior only while they are present in the context of a request; they are a prompting technique, not a weight update.

**B.** Add an example for every known legacy pattern so the model can match each incoming case to its nearest documented example.

**설명**

This is incorrect because it treats examples as a lookup table. Few-shot prompting works through generalization from a small set of diverse, well-reasoned examples, not through exhaustive nearest-match coverage, and piling on examples for every known pattern bloats context without addressing unanticipated cases.

**C(정답).** Add contrasting safe and unsafe examples with reasoning shown, so the model generalizes the decision boundary to novel patterns.

**설명**

This is correct. Few-shot examples that contrast safe and unsafe cases and explain why each decision was made teach a decision boundary, not a list of cases. The model applies that demonstrated judgment to novel patterns, which is exactly why examples outperform prose on unanticipated inputs.

**D.** Remove the prose rules and rely on well-chosen examples alone, since demonstrations fully replace explicit decision criteria.

**설명**

This is incorrect because examples complement explicit criteria rather than replace them. Effective prompts combine clear rules with demonstrations; removing the criteria would discard the operational definitions that anchor what the examples illustrate.

### 전반적인 설명

A common misreading of few-shot prompting is that examples act like a case table the model consults for exact or near matches. That is not how the technique works. A small set of 3 to 5 contrasting examples, each showing the input, the decision, and the reasoning behind it, demonstrates a judgment boundary. The model abstracts that boundary and applies it to inputs the examples never depicted; Anthropic's guidance emphasizes making examples relevant and diverse precisely so the model picks up the intended pattern rather than incidental surface features.

This is why few-shot examples are the documented remedy when detailed prose instructions produce inconsistent results: prose names the goal, while worked examples transfer the judgment. Showing the desired output and decision is more effective than abstract instructions for consistency, per Increase output consistency.

The other approaches each fail on the mechanism. Exhaustive coverage of known patterns treats examples as retrieval keys and still leaves novel patterns unhandled, while diluting the signal of the examples that matter. Prompt examples do not persist beyond the request; nothing about the model's weights or future sessions changes. And examples do not supersede explicit criteria; the strongest prompts pair concrete rules (which patterns are auto-modernizable, which require review) with demonstrations that show the rules applied in ambiguous territory. See the prompt engineering overview and prompt templates and variables for how examples fit alongside instructions in a well-structured prompt.

### 도메인

Prompt Engineering & Structured Output

## 질문 46

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : During each pull request review, the agent spends several tool calls listing available lint rule sets, database schemas, and API documentation pages before it examines any code. Which design change best reduces this discovery overhead?

**A(정답).** Publish the lint rule index, schema listings, and documentation hierarchy as MCP resources the agent reads directly.

**설명**

MCP resources are the protocol's designed primitive for exposing readable contextual data such as schemas, documentation, and indexes. The agent can read the catalog directly instead of reconstructing it through repeated exploratory tool calls, which reduces discovery overhead at the start of each review.

**B.** Raise the per-review tool-call budget so the discovery phase can complete before the review's turn limit is reached.

**설명**

Increasing the budget pays for the inefficiency instead of removing it. Every review still burns calls and context on rediscovering the same catalogs, which slows the pipeline and leaves less context for the actual code analysis.

**C.** Hard-code the current lint rules, schema names, and documentation index into CLAUDE.md so they load with every session.

**설명**

Static content in CLAUDE.md goes stale the moment lint rules, schemas, or documentation change, reintroducing incorrect reviews. It also inflates every request with catalog data regardless of whether that review needs it.

**D.** Add a list_available_inventory tool that the agent must call once per review to fetch the full catalog in one response.

**설명**

This rebuilds as a bespoke tool what MCP resources already provide as a first-class primitive for exposing readable data. It also adds another tool to the selection space, when resources are the protocol's designed mechanism for surfacing this kind of catalog.

### 전반적인 설명

The Model Context Protocol defines two complementary primitives for connecting agents to backend systems: tools, which perform actions the way POST endpoints do, and resources, which expose data for reading the way GET endpoints do. Content catalogs such as lint rule indexes, database schemas, and documentation hierarchies are exactly the kind of contextual data resources exist to expose: instead of probing for what exists through a sequence of exploratory tool calls at the start of every review, the agent can read the catalog as a resource, cutting discovery down substantially.

The mental model is that anything an agent repeatedly probes for before doing real work is a candidate for a resource. How fresh the catalog is depends on how the server implements the resource, but keeping it current becomes a server-side concern rather than a prompt-maintenance chore; that is the key advantage over baking an inventory into CLAUDE.md, which drifts out of date and adds token weight to every session whether or not the catalog is needed. Wrapping the same capability in a custom inventory tool works mechanically, but it duplicates a protocol primitive and enlarges the tool list the model must choose among, which itself degrades selection reliability. Simply raising the tool-call budget is the weakest option: it subsidizes wasted calls in a CI context where latency and context space directly affect review quality and throughput.

In a CI/CD pipeline this matters doubly, because every token spent rediscovering static catalogs is context unavailable for analyzing the diff, and every extra round trip lengthens the feedback loop on the pull request. See MCP Resources and Connect Claude Code to tools via MCP.

### 도메인

Tool Design & MCP Integration

## 질문 47

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : A documentation subagent's prompt concatenates code excerpts from twelve files, with all file paths listed together at the end. Its generated docs often attribute behavior to the wrong files. How should the handoff be restructured?

**A.** Number the excerpts sequentially and rely on their order matching the order of the appended file path list.

**설명**

Positional correspondence is fragile: the model must count and align two separated sequences across a long prompt, and any reordering or omission silently corrupts every subsequent mapping. It leaves attribution implicit rather than explicit.

**B(정답).** Wrap each excerpt in a delimited block, such as XML tags, pairing the code content with a separate subtag holding its file path.

**설명**

This is correct because it structurally binds each piece of content to its own metadata at the point where they enter the downstream agent's context. The model no longer has to infer which path belongs to which excerpt, so attribution survives regardless of prompt length or excerpt ordering.

**C.** Add a system prompt instruction telling the subagent to verify every attribution against the path list before writing documentation.

**설명**

Prompt instructions provide probabilistic compliance, and the underlying input still forces the model to reconstruct the excerpt-to-path mapping on its own. Asking it to be careful does not give it the structural association it lacks.

**D.** Move the file path list to the top of the prompt so the model processes the mapping before reading any of the excerpts.

**설명**

Relocating the list changes where the mapping sits but keeps content and metadata physically separated, so the model must still mentally join a detached list to a dozen excerpts. Positional attention effects do not fix a structural association problem.

### 전반적인 설명

When one agent hands context to another, the receiving agent sees only what is in its prompt, and it sees it exactly as formatted. If content (the code excerpts) and metadata (the file paths) arrive as two disconnected chunks, the model has to reconstruct the association itself, and across a dozen excerpts that reconstruction fails often enough to produce systematic misattribution. The fix is structural, not instructional: give each excerpt its own delimited block that carries both the content and its source together, for example a <document> wrapper containing <document_content> and <source> subtags. This is the pattern Anthropic recommends for multi-document prompts, because explicit delimiters make the boundary between content, metadata, and instructions unambiguous to the model. See Prompt templates and variables.

The mental model worth internalizing: an association that exists only in the author's head (excerpt three goes with path three) is not an association the model receives. Structured formats convert implicit relationships into explicit ones. That is why moving the path list to the top of the prompt does not help; primacy effects influence what gets attended to, but the mapping is still detached and must be inferred. Numbering excerpts and relying on list order is the same implicit-mapping problem with extra fragility, since one skipped or reordered item shifts every attribution after it. And a system prompt instruction to double-check attributions is prompt guidance, which improves odds without changing the fact that the input never stated which path belongs to which excerpt.

The same principle scales up: when Claude supports source-grounded output natively, documents are supplied as individual content blocks with their own source and metadata fields, as described in Citations. Whether you use built-in citations or hand-rolled XML blocks, the design rule is identical: keep every unit of content physically co-located with its provenance so attribution never depends on the model's inference.

### 도메인

Agentic Architecture & Orchestration

## 질문 48

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

## 질문 49

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : Last week an engineer's session traced how feature flags propagate through a checkout service. A framework migration has since restructured most of the modules that session read. What is the reliable way to continue the investigation?

**A(정답).** Start a new session seeded with a structured summary of the confirmed propagation findings, leaving the outdated tool results behind.

**설명**

When the files a session read have been substantially restructured, the durable conclusions should be carried forward deliberately while the stale raw evidence is discarded. A new session opens with a fresh context window, so nothing in it contradicts the current state of the codebase.

**B.** Resume the prior session and rely on Claude Code's automatic context management to have already dropped the older tool outputs.

**설명**

Automatic context management clears older tool outputs only as the window fills; it is an overflow mechanism, not a staleness detector. There is no guarantee the obsolete observations have been removed, and any that were summarized still assert facts about code that no longer exists.

**C.** Resume the prior session after adding a CLAUDE.md note describing the migration so the loaded guidance corrects the stale observations.

**설명**

CLAUDE.md content is guidance the model weighs alongside everything else in context; it does not remove or rewrite the obsolete tool results the resumed transcript restores. The model is left holding a note that files changed next to detailed observations asserting the old structure, and it may reason from either.

**D.** Fork the prior session so a new branch inherits the full investigation context while the original stays intact for reference.

**설명**

Forking copies the existing history, including every stale Read and Grep output, into the new branch; it changes nothing about the evidence itself. Forking is designed for exploring divergent approaches from a still-valid baseline, not for repairing a baseline that no longer matches reality.

### 전반적인 설명

A session in Claude Code is not a snapshot of the codebase; it is the accumulated conversation: the prompts, every tool call, every tool result, and every response. Resuming replays that record, so last week's Read and Grep outputs re-enter context exactly as recorded, and the model has no mechanism for knowing they describe modules a migration has since restructured. It will reason from them as confidently as from anything else in its window.

The useful mental model splits conclusions from evidence. The propagation findings (the conclusions) remain valuable and are cheap to carry forward. The raw tool results (the evidence) are now false and are also the bulkiest part of the history. Starting fresh gives a clean context window, and seeding it with a structured summary transfers exactly the conclusions worth keeping: a curated handoff rather than a transcript replay.

The alternatives each preserve the bad evidence in a different way. A fork duplicates the full history, stale outputs included, into the new branch; it exists for divergent exploration from a valid baseline, not for cleaning one. A CLAUDE.md note adds guidance but leaves the contradictory observations in place, competing for the model's attention. Trusting automatic context management misreads its purpose: Claude Code clears older tool outputs when the window fills, not when files change, so nothing guarantees the obsolete results are gone. See Sessions in the Agent SDK and How Claude Code works for how session history, forking, and fresh context windows behave.

### 도메인

Agentic Architecture & Orchestration

## 질문 50

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : A pull request touches 16 files. A single review pass over all of them produces detailed feedback on the first few files, shallow comments on the rest, and identical code patterns judged differently across files. How should this review be restructured?

**A.** Run the identical full-PR review three separate times and report only the findings that appear in at least two of the runs.

**설명**

Consensus filtering across inconsistent passes suppresses real issues, since a genuine bug detected in only one dilute pass would be discarded. It also triples cost without fixing why each individual pass is shallow and contradictory.

**B(정답).** Chain the review: analyze each file individually for local issues, then run a separate pass over cross-file interactions.

**설명**

This prompt chaining structure addresses the root cause, which is attention dilution when one pass must cover many files. Per-file passes guarantee consistent depth on local issues, and a dedicated integration pass catches cross-file problems like inconsistent types or mismatched contracts.

**C.** Move the review to a model tier with a larger context window so all 16 files can be evaluated together in one pass.

**설명**

The symptoms described are not caused by content failing to fit in the context window; they come from attention being spread too thin across many files in a single pass. A larger window lets more text fit but does not improve the consistency or depth of attention.

**D.** Enable extended thinking for the review pass so the model deliberates more thoroughly before commenting on each of the 16 files.

**설명**

Extended thinking adds reasoning depth to a single task but does not change the fact that one pass must divide attention across 16 files. The inconsistency stems from task structure, not insufficient deliberation, so the same dilution pattern persists.

### 전반적인 설명

Single-pass review of a large changeset fails in a characteristic way: the model gives deep analysis to some files and superficial treatment to others, and it applies standards inconsistently, flagging a pattern in one file while approving identical code elsewhere. The underlying mechanism is attention dilution: when one inference pass must reason about many files at once, no individual file receives sustained focus, and judgments made early in the input do not reliably carry through to later files.

The fix is a prompt chaining structure that matches the shape of the work. Reviews have two distinct kinds of findings: local issues visible within a single file, and integration issues visible only across files, such as inconsistent types, circular dependencies, or mismatched data flows. Chaining the review into per-file passes followed by a separate cross-file integration pass gives each concern a focused context. Each per-file pass reviews one file with full attention, producing consistent depth; the integration pass then works from those findings plus the cross-file relationships. Chaining also lets you inspect intermediate outputs, so per-file findings can be validated or logged before the integration step consumes them. Anthropic's prompting guidance describes exactly this rationale for breaking a task into sequential calls: it remains valuable when you need to inspect intermediate outputs or enforce a specific pipeline structure (see Anthropic prompt engineering documentation).

The alternatives all misdiagnose the problem. A larger context window addresses capacity, not attention quality; the files already fit, they just are not all processed with equal care. Majority voting across three inconsistent passes discards real findings that only surfaced once and triples cost. Extended thinking deepens reasoning within a pass but leaves the structural problem, one pass spread across 16 files, untouched. The engineering instinct to internalize is: when output quality varies with position in the input, restructure the task, do not just add compute.

### 도메인

Agentic Architecture & Orchestration

## 질문 51

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : After repeated Edit failures on generated boilerplate files containing duplicated code blocks, a teammate proposes that Claude Code should use Read followed by Write for every file modification going forward. What guidance is correct?

**A(정답).** Keep Edit as the default for targeted changes; use Read plus Write only when a unique match cannot be found.

**설명**

This is the documented division of labor: Edit is preferred for modifying existing files because it makes precise, targeted changes, and Read plus Write is the reliable fallback specifically when repetitive file structure defeats Edit's unique-match requirement. Making the fallback the default gives up precision on the majority of edits that Edit handles fine.

**B.** Adopt the proposal, since overwriting the full file with Write eliminates match failures with no meaningful downside.

**설명**

Read plus Write does avoid match failures, but the claim of no downside is wrong. Writing a file requires the model to reproduce the entire content, which costs more tokens and risks introducing unintended changes in the untouched portions, so it should remain a fallback rather than the standard path.

**C.** Remove Edit from the agent's allowed tools so every modification goes through Write, the more reliable operation.

**설명**

Removing Edit entirely forces full-file rewrites even for one-line changes where Edit succeeds without issue. Write is not inherently more reliable; it simply does not depend on anchor matching, and it trades that dependency for the risk of regenerating whole files incorrectly.

**D.** Standardize on Bash with sed for files containing repeated blocks, since stream editing handles duplicates better.

**설명**

Falling back to shell stream editing bypasses the purpose-built file tools and their structured, reviewable output. The documented fallback for a failed unique match is Read plus Write, not sed, which is fragile for multi-line code changes and harder to verify.

### 전반적인 설명

Claude Code's Edit tool works by exact string replacement: it locates an anchor snippet in the file and swaps it for new text. That mechanism gives it precision and efficiency (only the changed region is produced), but it carries a hard precondition: the anchor must match at exactly one location. Boilerplate and generated files, which repeat the same blocks many times, are precisely where that precondition breaks.

The designed response to that failure is a fallback, not a wholesale replacement of the tool. When a unique match cannot be found, the agent uses Read to load the complete file and Write to emit the fully modified version. Because Write overwrites the entire file, it has no dependency on anchor uniqueness at all, which is exactly why it succeeds where Edit cannot. The cost is symmetric to the benefit: the model must reproduce every line of the file, which consumes more tokens and creates opportunities to subtly alter content that was never meant to change. That tradeoff is why Edit remains the preferred tool for routine modifications and Read plus Write is reserved for the cases that defeat it.

Stripping Edit from the tool set, or standardizing on Bash with sed, both misread the situation as a defective tool rather than an unmet precondition. Shell stream editing in particular abandons the structured, purpose-built file operations for a mechanism that is fragile with multi-line code and harder to review. The right mental model is a ladder: reach for the precise tool first, and drop to the full-file operation only when the file's structure forces it. See the Claude Code tools reference for the roles of Read, Edit, and Write.

### 도메인

Tool Design & MCP Integration

## 질문 52

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : While maintaining the agent's codebase in Claude Code, a stack trace pinpoints an off-by-one error in the parser that handles lookup_order results; the fix is confined to one function you understand well. How should you carry out this change?

**A.** Delegate the investigation to an Explore subagent so discovery output stays out of the main context.

**설명**

The Explore subagent exists to isolate verbose discovery output during large multi-phase tasks. A stack trace has already localized this bug to one function, so there is no discovery phase whose output needs isolating.

**B.** Split the work into a planning phase for investigation and a separate execution phase for the edit.

**설명**

Combining plan mode for discovery with direct execution for implementation is the right pattern for large migrations or architecturally significant work. Applying a two-phase workflow to a localized, already-diagnosed bug adds ceremony with no benefit.

**C(정답).** Ask Claude to make the fix directly, then run the relevant tests to confirm the behavior.

**설명**

A single-function bug with a clear stack trace is exactly the kind of well-scoped, well-understood change where direct execution is appropriate. Skipping the planning overhead is recommended for small clear fixes, and verifying with tests keeps the direct path safe.

**D.** Enter plan mode so Claude explores the codebase and produces a plan you approve before editing.

**설명**

Plan mode is valuable when the approach is uncertain, the change spans many files, or the code is unfamiliar. For a well-understood single-function fix it adds review overhead without reducing risk in any meaningful way.

### 전반적인 설명

The plan-versus-direct decision hinges on how much uncertainty the task carries. Plan mode earns its overhead when the approach is uncertain, the change spans multiple files, or the codebase is unfamiliar: in those cases Claude explores in read-only fashion and hands you a plan to review, and iterating on a plan is far cheaper than cleaning up a wrong implementation. When a stack trace has already localized a bug to one function you understand, none of those conditions hold. Anthropic's guidance is explicit: for clear, small-scope changes, ask Claude to make the change directly; if the diff can be described in one sentence, skip the plan.

Direct execution does not mean skipping rigor. A precise prompt (the symptom, the location, what fixed looks like) plus a verification step, such as running the relevant tests and showing their output, gives you the same confidence a plan review would, at a fraction of the cost. Note also that direct execution is workflow guidance rather than a named mode; the documented permission modes (default, acceptEdits, plan, and others) govern what Claude may do without asking, not whether a plan is produced.

The distractors misapply heavier machinery: plan mode taxes a trivial fix with ceremony, the Explore subagent solves a context-pollution problem this task does not have (its job is to keep verbose discovery output out of the main window during multi-phase work), and a two-phase plan-then-execute flow is the pattern for large migrations, not for a bug that is already diagnosed. See Claude Code best practices and Permission modes.

### 도메인

Claude Code Configuration & Workflows

## 질문 53

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline's automated reviews use a GitHub MCP server that requires a personal access token. The server configuration must reach every contributor and CI runner through version control. How should the token be handled?

**A(정답).** Reference the token as ${GITHUB_TOKEN} in the project .mcp.json and export the variable in CI and on developer machines.

**설명**

This is the documented pattern: .mcp.json supports environment variable expansion such as ${GITHUB_TOKEN}, so the shared config can be committed while each environment supplies its own secret. The CI system injects the token as a pipeline variable, and developers set it locally, so no credential ever enters version control.

**B.** Configure the server and its token in ~/.claude.json on each contributor machine and CI runner, documenting the setup steps.

**설명**

The user-level ~/.claude.json is for personal and experimental servers, not shared team infrastructure. Requiring every contributor and runner to replicate the configuration manually causes drift and abandons the version-control distribution the team needs.

**C.** Paste the token directly into the project .mcp.json, since the repository is private and only contributors can read it.

**설명**

Committing a live credential to version control is a security anti-pattern regardless of repository visibility. The token would persist in git history, be exposed to every current and future contributor, and require history rewriting to rotate safely.

**D.** Store the token in CLAUDE.md so it is loaded into context on every session and available whenever the server needs it.

**설명**

CLAUDE.md provides project instructions to the model, not server configuration, so the MCP server would never receive the credential this way. It would also place a secret in a committed file and expose it in model context on every request.

### 전반적인 설명

Claude Code's project-level .mcp.json exists to let a team distribute MCP server configuration through version control: it lives at the repository root and is checked in like any other config file. That creates an obvious tension with credentials, and environment variable expansion is the mechanism designed to resolve it. A placeholder such as ${GITHUB_TOKEN} is committed instead of the secret, and Claude Code expands it at runtime from the environment. Expansion works in the command, args, env, url, and headers fields, and a ${VAR:-default} form supplies a fallback when a variable is unset.

This design fits CI/CD particularly well: the pipeline injects the token as a protected pipeline variable, developers export it locally, and the single committed file works identically in both places. Rotating the credential means updating the environment, not rewriting git history.

The alternatives each break one side of the requirement. Hard-coding the token satisfies sharing but leaks the secret into the repository permanently. Moving the server into ~/.claude.json keeps the secret out of the repo but sacrifices version-controlled distribution; that file is scoped for personal, experimental servers, and per-machine manual setup drifts out of sync. CLAUDE.md is a context file for instructing the model; it plays no role in MCP server configuration, so a token placed there would both fail to configure anything and be committed and surfaced in context.

See Claude Code MCP documentation for the expansion syntax and supported fields, and the Agent SDK MCP documentation for examples using ${API_KEY}-style placeholders.

### 도메인

Tool Design & MCP Integration

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

## 질문 55

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : While reviewing a plan Claude produced for a multi-file refactor, a developer notices the plan omits a shared utility module the change must also update. What should the developer do at the approval prompt?

**A(정답).** Keep planning and point out the missing module so the plan is revised before any edits begin.

**설명**

The approval prompt explicitly offers a keep-planning choice for exactly this situation. Revising the plan while no edits have been made is far cheaper than correcting executed changes, which is the core value plan mode provides.

**B.** Approve the plan in auto mode, since Claude's earlier exploration will surface the module during execution.

**설명**

Auto mode executes the approved plan without per-edit oversight, and there is no guarantee Claude rediscovers scope the plan itself missed. The plan defines what will be implemented, so a gap in the plan tends to become a gap in the result.

**C.** Exit plan mode with Shift+Tab and direct Claude to implement the refactor with the module included.

**설명**

Leaving plan mode without an approved plan abandons the review checkpoint and moves a large multi-file change to direct execution. That forfeits the design-before-commitment safety that made plan mode the right choice for this task in the first place.

**D.** Approve the plan with manual edit review and correct the omission as the affected edits appear.

**설명**

Manual review lets the developer inspect each edit, but the flaw here is in the plan's scope, not in individual diffs. Approving a plan known to be incomplete guarantees rework once the missing module's changes surface mid-execution.

### 전반적인 설명

Plan mode exists to separate design from commitment. While active, Claude Code researches the codebase and drafts an implementation plan but does not edit source files; only when the developer approves the plan does the session transition to an executing permission mode. The approval prompt is therefore a deliberate decision point, and it offers three paths: approve and run in auto mode, approve with manual review of each edit, or keep planning.

The mental model is that a plan is a cheap, editable artifact while executed changes are expensive to unwind. When a review of the plan reveals a scope gap, such as a shared module the refactor must touch, the correct move is to stay in plan mode and have Claude revise the plan. A few extra planning turns cost seconds; discovering the gap mid-execution costs a partially completed refactor, inconsistent call sites, and cleanup work across many files.

The alternatives all trade a known plan defect for downstream repair. Approving with manual edit review inspects diffs one at a time, which catches implementation mistakes but not an omission baked into the plan's scope. Approving in auto mode compounds the problem by removing per-edit oversight entirely. Exiting plan mode with Shift+Tab and switching to direct execution discards the checkpoint altogether, which is exactly the wrong direction for a large, multi-file change.

See the official documentation on permission modes for how plan mode, the approval choices, and mode transitions work.

### 도메인

Claude Code Configuration & Workflows

## 질문 56

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : The team's automated review pass over Claude-generated refactors is prompted to "only report findings you are highly confident about." Precision looks good, but real defects now slip through unreported. What change best restores recall while keeping noise manageable?

**A.** Run the conservative review pass three times per change and report the union of findings across the runs.

**설명**

Repeated sampling of a pass that is instructed to suppress low-confidence findings recovers only what randomly clears the same bar. It multiplies cost while leaving the systematic suppression instruction in place, so the class of findings the prompt tells the model to withhold remains largely unreported.

**B.** Keep self-filtering in the prompt but lower the bar from "highly confident" to "reasonably confident" findings.

**설명**

This keeps the same flawed design of vague, in-prompt self-filtering; it only shifts the suppression bar. Terms like reasonably confident have no operational meaning, so the model still interprets the cutoff inconsistently and continues to suppress an unpredictable set of real defects.

**C.** Add a prompt instruction telling the model to prioritize recall over precision when deciding what to report.

**설명**

This is a vague directive with no operational content, the same failure mode as the original conservatism instruction. Abstract goals like prioritize recall do not tell the model which findings to include or exclude, so output remains inconsistent rather than calibrated.

**D(정답).** Report every finding with a self-rated confidence level, moving the confidence threshold into a downstream filter step.

**설명**

This is correct because it separates finding from filtering: the review pass optimizes for coverage, self-reported confidence makes each finding rankable, and the threshold is applied deterministically downstream. Recall is restored without flooding developers, since low-confidence findings are filtered or routed rather than shown raw.

### 전반적인 설명

Instructions like "only report high-confidence findings" are followed literally: the model may investigate thoroughly but suppress everything below its interpretation of the bar. That trades recall for precision inside a single, unobservable step, which is exactly the wrong place to make the trade when defects escaping into merged code is the failure you care about.

The documented pattern is to separate finding from filtering. The finding pass is told its job is coverage: report every issue, including uncertain and low-severity ones, and attach a self-reported confidence level (and severity) to each. A downstream verification or filter stage then applies explicit thresholds, so calibrated routing decisions (auto-surface, deduplicate, or drop) are made in code you control and can tune, instead of inside the model's opaque judgment. Because every finding is emitted with a confidence score, you can also measure calibration over time and adjust thresholds empirically.

The alternatives all leave filtering embedded in the prompt. Rewording the bar to "reasonably confident" or adding "prioritize recall" swaps one vague, non-operational instruction for another; the model still cannot map words like reasonably or prioritize to a consistent decision rule. Re-running the conservative pass and taking the union recovers only findings that randomly clear the same suppression bar, at three times the cost. See Prompting Claude Sonnet 5 for Anthropic's guidance on keeping the finding stage focused on coverage and moving confidence filtering downstream.

### 도메인

Prompt Engineering & Structured Output

## 질문 57

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : The team commits to delivering batch-generated codebase analysis reports within 30 hours of an engineer's request, using the Message Batches API. Which TWO statements about batch submission cadence are accurate? (Select TWO.)

**A(정답).** Requests must be submitted within 6 hours of arrival, since batch processing alone can consume 24 of the 30 hours.

**설명**

This is correct. With a worst-case processing window of 24 hours and no latency SLA, the only controllable slack is the time between a request arriving and its batch being submitted, which is 30 minus 24, or 6 hours.

**B(정답).** Submitting accumulated requests every 4 hours caps the worst case at 28 hours: 4 of accumulation plus 24 of processing.

**설명**

This is correct. A request that arrives just after a submission waits at most 4 hours for the next batch, and adding the 24-hour worst-case processing window gives 28 hours, which leaves a 2-hour margin against the 30-hour commitment.

**C.** Submitting batches overnight shortens processing time enough that a 12-hour accumulation window still meets the commitment.

**설명**

This is incorrect. Anthropic provides no latency guarantee and documents no faster processing during off-peak hours, so a 12-hour accumulation plus a worst-case 24-hour processing window yields 36 hours, breaching the commitment.

**D.** Accumulating requests into one daily batch is safe because most batches complete far sooner than the 24-hour maximum.

**설명**

This is incorrect. SLA planning must use the worst-case bound, not typical behavior; a request could wait nearly 24 hours for the daily submission and then take up to 24 more hours to process, for a worst case near 48 hours.

### 전반적인 설명

The Message Batches API trades latency for cost: it offers a 50% discount but processes requests asynchronously with a window of up to 24 hours and no latency SLA. That design choice means any delivery commitment built on top of batching must be planned around the worst case, not the average case. The mental model is simple arithmetic: submission window = external SLA - 24 hours. A 30-hour commitment leaves at most 6 hours between a request arriving and its batch being submitted.

A fixed submission cadence turns that budget into an operational schedule. Submitting every 4 hours means the unluckiest request (one arriving just after a submission) waits 4 hours plus up to 24 hours of processing, totaling 28 hours and preserving margin. Any cadence up to 6 hours works; a 4-hour cycle simply builds in headroom for retries or resubmissions of failed requests.

The failing approaches share one flaw: they substitute optimism for the guaranteed bound. There is no documented off-peak speedup, so an overnight submission still faces the full 24-hour window, and a 12-hour accumulation pushes the worst case to 36 hours. Likewise, planning around "most batches finish early" ignores that a daily cadence exposes some requests to nearly 48 hours end to end; the commitment is broken exactly on the requests you cannot predict. See Batch processing for the documented processing window and asynchronous model.

### 도메인

Prompt Engineering & Structured Output

## 질문 58

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : You are using Claude Code to implement the refund eligibility logic that gates process_refund calls. You want a test-driven workflow that produces progressive improvement across iterations. Which two practices should you adopt? (Select TWO.)

**A.** After each failing run, rewrite the prose specification in greater detail instead of pasting the raw failing test output back into the session.

**설명**

Incorrect. Sharing the actual test failures is the driving signal in test-driven iteration; failures pinpoint exactly which behavior diverged. Repeatedly elaborating prose reintroduces the ambiguity that tests were written to eliminate.

**B.** Have Claude generate the test suite after the implementation is complete, confirming its own code passes each case.

**설명**

Incorrect. Writing tests after the fact inverts the workflow: the tests tend to encode whatever the implementation already does, including its bugs. Tests authored before implementation define the target independently of the code that must meet it.

**C(정답).** When a run produces several interdependent failures, share them together in one message so fixes account for their interactions.

**설명**

Correct. Interdependent issues should be presented together because fixing them one at a time invites solutions that break each other. Batching related failures lets Claude reason about their interactions and produce a coherent fix; only independent issues benefit from sequential feedback.

**D(정답).** Build the test set before implementation, covering expected behavior, edge cases like expired return windows, and performance requirements.

**설명**

Correct. Test-driven iteration starts with a test suite written before any code exists, and a useful suite spans expected behavior, edge cases, and performance requirements. The tests then serve as an objective, checkable definition of done that failures can be measured against.

### 전반적인 설명

Test-driven iteration with Claude Code has two moving parts: what the tests contain, and how failures are fed back. The test set is written before implementation and should define the full contract: expected behavior for normal cases, edge cases (an expired return window, a partial refund, an order with no matching customer), and any performance requirements the logic must meet. Because the suite exists before the code, it acts as an unambiguous specification; each iteration is then driven by sharing concrete failure output rather than by rewriting prose, and the failing assertions tell Claude precisely which behavior diverged and by how much.

How failures are batched matters. When several failures are interdependent (fixing one changes the behavior another depends on), present them together in a single message so the fix can account for their interactions. Sequential, one-at-a-time feedback is appropriate only for independent issues; applied to coupled ones, it produces oscillation where each fix regresses the last.

The two rejected practices fail for complementary reasons. Elaborating the prose specification after every failure discards the strongest signal available (the raw failure output) and returns to the ambiguity that motivated writing tests in the first place. Generating the suite after implementation makes the tests descriptive rather than prescriptive: they tend to ratify whatever the code already does, bugs included, and a session confirming its own work carries the same self-validation bias that makes independent verification valuable elsewhere.

See Anthropic's guidance on test-driven workflows in Claude Code: Best practices for agentic coding and the workflow patterns in Common workflows.

### 도메인

Claude Code Configuration & Workflows

## 질문 59

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline's .mcp.json configures three MCP servers: GitHub, Jira, and a coverage analyzer. Which TWO configuration steps should the team take so the servers' tools are usable in unattended review runs? (Select TWO.)

**A.** Defer each server's connection until the model first requests one of its tools, so tool catalogs load lazily on demand.

**설명**

This is not how MCP discovery works. Servers are connected up front and Claude Code issues discovery requests such as tools/list once a server connects, so tool catalogs are gathered at connection time rather than at first use. There is no lazy per-request connection mode to configure.

**B(정답).** Write permission rules using the namespaced form mcp____, which keeps same-named tools distinct.

**설명**

This is the right approach. Claude Code prefixes every MCP tool with its server name, for example mcp__github__list_issues, so permission rules must use that namespaced form, and tools from different servers never collide even when the underlying names are identical. The namespacing also enables wildcard patterns like mcp__github__* in permission settings.

**C(정답).** Pre-approve the tools the pipeline needs through allowedTools entries, since unattended runs cannot answer interactive prompts.

**설명**

This is the right approach. Availability and permission are separate concerns: discovery makes tools visible to the model, but MCP tools need explicit approval before Claude can call them. In a headless CI run there is no human to approve prompts, so allowedTools (or wildcard patterns) must grant the calls in advance.

**D.** Rename any tools that share a name across servers so Claude Code does not merge them into one deduplicated definition.

**설명**

This step is unnecessary because no merging occurs; server-name prefixes keep every tool distinct regardless of name overlap. Each server's tools remain independently addressable and independently permissioned without any renaming.

### 전반적인 설명

When Claude Code starts a session, it connects to every configured MCP server and runs capability discovery, sending requests such as tools/list, prompts/list, and resources/list to each server as it connects. The result is a single combined catalog: tools from all connected servers are available simultaneously, and the model selects among them based on their names and descriptions. There is no lazy, on-demand connection triggered by the model's first request, and there is no merging of similarly named tools.

Two mechanisms make this combined catalog workable. First, namespacing: every MCP tool is exposed as mcp__<server-name>__<tool-name>, so a github server's list_issues becomes mcp__github__list_issues, and a second server exposing its own list_issues would never collide with it. Second, the separation of available from permitted: discovery only makes tools visible. Before Claude can actually invoke an MCP tool, permission must be granted, either interactively or through configuration such as allowedTools, which supports wildcards like mcp__github__* to auto-approve everything from one server. That separation matters most in CI, where runs are unattended and any tool not pre-approved simply cannot be called.

This design trades a small amount of upfront connection work for predictability: the agent begins every turn knowing its full toolset, and operators control exactly which subset it may exercise. See MCP in the Agent SDK and Connect Claude Code to tools via MCP for the discovery, naming, and permission details.

### 도메인

Tool Design & MCP Integration

## 질문 60

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