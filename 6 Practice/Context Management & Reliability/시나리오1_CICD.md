# 시나리오1_CICD

## 질문 43

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Developers have started ignoring the review comments because roughly a third are false positives. You want to auto-post only findings that are likely genuine and route the rest to a triage queue. What should you implement?


**A(정답).** Have the model output a confidence score with each finding, then tune the auto-post threshold on a labeled set of past findings marked valid or false positive.

**설명**

This is the calibration pattern: per-finding confidence scores become a usable routing signal only after thresholds are tuned against labeled ground truth. Reviewer judgments on past findings reveal where the score actually separates genuine issues from false positives, so the cutoff reflects measured behavior rather than assumption.

**B.** Apply a fixed confidence cutoff of 0.8 across all finding categories, trusting the model's self-reported scores to be consistent without any validation step.

**설명**

Raw self-reported confidence is known to be poorly calibrated, and its meaning can vary across finding categories. A fixed cutoff chosen without checking against labeled data may suppress valid findings in one category while still posting false positives in another.

**C.** Auto-post only findings the model classifies as high severity, on the assumption that severity strongly correlates with a finding being genuine.

**설명**

Severity measures how bad an issue would be if real, not how likely the finding is to be correct. A high-severity finding can still be a false positive, so filtering by severity does not address the accuracy problem developers are reacting to.

**D.** Have the same reviewing instance re-evaluate its own findings and auto-post only the ones it still endorses on a second pass.

**설명**

A model retains the reasoning that produced its findings and is unlikely to challenge its own conclusions, so self-review by the same instance filters out few false positives. This is a documented limitation of self-review; an independent signal, calibrated against labeled data, is needed instead.

### 전반적인 설명

The core problem here is routing: some findings should be posted automatically and others should be held back, but the pipeline needs a trustworthy signal to make that split. Per-finding confidence scores are the right raw signal, with one critical caveat: a model's self-reported confidence is not calibrated out of the box. A score of 0.8 does not mean the finding is correct 80% of the time, and the relationship between score and correctness can differ by finding category. The fix is calibration: collect a labeled validation set (past findings that reviewers judged valid or false positive), plot how actual precision varies with the reported score, and choose the auto-post threshold where precision meets your tolerance. This turns an unreliable subjective number into an empirically grounded routing rule, and the same labeled set lets you re-verify the threshold as prompts or models change.

The alternatives each fail on a specific point. Picking a fixed cutoff such as 0.8 uses the right signal in its known-unreliable, unvalidated form. Severity is a measure of impact, not correctness; a confidently wrong critical-severity finding is exactly the kind of false positive that erodes developer trust. And asking the same instance to re-check its own findings runs into the self-review limitation: the model still holds the reasoning context that produced the finding, so it rarely reverses itself; independent review instances or externally calibrated thresholds are the effective alternatives.

The mental model to keep is measure, then automate: define what a correct finding looks like, build a labeled evaluation set, and let measured error rates set the automation boundary, as described in Anthropic's guidance on defining success criteria and building empirical evaluations.

### 도메인

Context Management & Reliability



## 질문 44

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline's log-fetch tool returns the same generic "logs unavailable" message both when a request times out and when a job genuinely produced no logs, so Claude retries valid empty results and sometimes skips review sections after real failures. How should the tool's error handling be redesigned?


**A(정답).** Return distinct structured responses that state the failure type, the request attempted, and whether a retry is worthwhile.

**설명**

This is correct because a timeout and a legitimately empty result are semantically different outcomes that require different responses. Structured error context (failure type, what was attempted, retryability) gives the model the information it needs to retry access failures while accepting empty results as valid findings.

**B.** Return empty log content marked as a successful result so the review proceeds without retry behavior firing.

**설명**

This is the silent suppression anti-pattern: marking a failure as success hides the error entirely. The review would then treat missing logs caused by a timeout as if the job genuinely produced nothing, producing misleading feedback on the pull request.

**C.** Fail the entire pipeline run whenever the tool reports logs unavailable so incomplete reviews are never posted.

**설명**

Aborting the whole workflow on a single tool failure discards all the review work that could still complete. A better design continues with partial results and annotates the gap, rather than making one transient timeout fatal to the entire run.

**D.** Instruct Claude in the system prompt to retry any unavailable-logs message at most once before continuing the review.

**설명**

This caps wasted retries but does not fix the root problem: the tool response still conflates two different outcomes. Claude still cannot tell whether a section should be reviewed as having no logs or flagged as a coverage gap caused by a failure.

### 전반적인 설명

The core failure here is a generic error status that collapses two semantically different outcomes into one message. A timeout is an access failure: the logs may exist, and a retry could succeed. A job with no logs is a valid empty result: the query worked and the answer is "nothing here." When both come back as "logs unavailable," the model has no basis for choosing between retrying, proceeding, or annotating a gap, so it does the wrong thing in both directions: it retries results that will never change and treats genuine failures as final answers.

The fix is to make error responses carry recovery-relevant context. Anthropic's tool-use guidance recommends returning tool failures as a tool_result with is_error: true and an informative message, and explicitly warns against generic errors like "failed"; a good error says what went wrong and what to try next. In a multi-step review workflow, that means distinguishing failure types, including what was attempted, and signaling retryability, so the agent can retry transient failures, accept empty results as findings, and continue with partial coverage while noting where a gap exists.

The alternatives each fail in a characteristic way. A prompt rule that caps retries treats the symptom while leaving the ambiguous signal in place; the model still cannot distinguish the two cases. Marking failures as empty successes is silent suppression, which turns broken tooling into false review conclusions. Aborting the whole run on any failure throws away all completable work over a single transient error, when graceful degradation with an annotated gap preserves most of the value. See Handle tool calls for the documented error-reporting pattern.

### 도메인

Context Management & Reliability



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



## 질문 44

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Per-file review subagents return findings as bare prose. The aggregator merges them into one PR comment, and developers dismiss many as false positives because verified issues and speculative pattern matches look identical. Which structured-output requirement addresses this?

**A.** Instruct the aggregation agent to independently re-run the relevant tests to verify every finding before posting the comment.

**설명**

This duplicates work the per-file subagents already performed and inflates pipeline time and cost. The aggregator also lacks each subagent's file-level context, and the problem stated is missing metadata about findings, not missing verification effort.

**B.** Have each subagent attach a raw self-rated confidence score to every finding so the aggregator can rank the merged list.

**설명**

Uncalibrated self-rated confidence is a poor proxy because the model can be confidently wrong on exactly the findings that turn out to be false positives. A ranking score also conveys nothing about how a finding was produced, which is the information the aggregator and developers are missing.

**C(정답).** Require each finding to carry its detection method and supporting evidence, such as the matched pattern or the failing test output.

**설명**

This is methodological metadata that travels with every finding, so the aggregator can label execution-verified issues differently from static-inspection suspicions and developers can judge each comment on its evidence. It also enables systematic analysis of which detection patterns produce the false positives developers dismiss.

**D.** Have subagents discard any finding they cannot confirm by executing tests, returning only issues verified at runtime.

**설명**

This silently suppresses legitimate findings, since many real issues surfaced by static inspection cannot be confirmed by running tests. Discarding information a downstream agent might need is an anti-pattern; the fix is to annotate findings with provenance, not to filter them out.

### 전반적인 설명

Accurate downstream synthesis depends on subagents returning structured findings with methodological metadata, not bare prose. In a multi-pass review pipeline, a finding backed by a failing test carries very different weight from a finding inferred from a code pattern, yet once both are flattened into plain sentences the aggregation step has no way to tell them apart. Requiring each finding to include its detection method and supporting evidence (for example, a detected_pattern field or the captured test output) lets the aggregator label verified issues as blocking, present speculative matches as suggestions, and lets the team analyze which detection patterns generate the dismissed comments; that feedback loop is how false-positive rates actually get driven down.

The underlying mechanic is that a subagent's context is discarded once it returns; the only information the orchestrating agent ever sees is the subagent's final result (see Agent SDK Subagents). Provenance that is not carried as data in that final message cannot be reconstructed later. There is no automatic enforcement of a result schema on subagent outputs, so each subagent must be explicitly instructed, or wrapped in orchestration logic, to emit a structured final message that includes the detection method and evidence fields; the Agent SDK's guidance on getting structured output from agents describes how to obtain reliably parseable results at that boundary.

The alternatives fail for characteristic reasons. Raw self-rated confidence scores are poorly calibrated; the model is often confidently wrong on the hard cases, so ranking by that signal reorders the list without explaining any finding. Having the aggregator re-verify everything duplicates completed work and runs without the per-file context the subagents had. Discarding unverified findings is silent suppression: static analysis legitimately surfaces issues that no test exercises, and dropping them hides information the synthesis step, and the developers, need to make an informed call.

### 도메인

Context Management & Reliability



## 질문 50

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A pull request review step queries a vulnerability database through an MCP tool. Some reviews report "no vulnerabilities found" when the database actually timed out, letting flawed code merge. How should the tool report these two outcomes?

**A(정답).** Report timeouts as errors with actionable context and zero-match queries as successful results, so retries and approvals stay distinct.

**설명**

This is correct because a timeout and a genuinely clean query are semantically different outcomes that require different responses: a timeout should trigger a retry decision, while a valid empty result is an informative finding. Keeping them distinct in the tool's error reporting lets the review workflow decide correctly instead of conflating failure with a clean bill of health.

**B.** Standardize both outcomes to a single "scan unavailable" status so the review workflow's error handling stays simple and uniform.

**설명**

Generic statuses hide the context needed for recovery decisions; the workflow cannot tell whether to retry, use an alternative source, or accept a valid empty result. Worse, this also converts successful zero-match queries into apparent failures, discarding a legitimate and informative finding.

**C.** Fail the entire pipeline run whenever the database times out, since an incomplete security review must never reach developers.

**설명**

Aborting a whole workflow on a single tool failure is an anti-pattern that discards all completed review work. A better design propagates the error with context so the workflow can retry, proceed with partial results, or annotate the coverage gap.

**D.** Return an empty findings list marked as success when the database times out, so the review degrades gracefully instead of blocking.

**설명**

This is the silent suppression anti-pattern: a failure dressed up as a fact. It is exactly the behavior producing the current bug, where flawed code merges because a timeout was indistinguishable from a clean scan.

### 전반적인 설명

The core distinction here is between an access failure (the query could not run: timeout, service error) and a valid empty result (the query ran successfully and legitimately found nothing). These look superficially similar, an absence of findings, but they mean opposite things: one says "we do not know" and the other says "we checked and it is clean." Any reporting design that collapses them forces downstream logic to guess, which in a security review means flawed code can merge on the strength of a scan that never actually completed.

The mechanism for keeping them distinct exists at the protocol level. When an MCP tool call fails to execute, the result should be reported as an error result (the isError flag in the MCP protocol) plus an actionable message describing what failed, such as the timeout and the query attempted. A successful query with zero matches is returned as a normal, non-error result; an empty result is a perfectly valid shape and must not be assumed to mean failure. The same principle applies to client-side tools in the Messages API, where a failed execution is returned as a tool_result block with is_error: true while a valid empty result carries no error flag. See Handle tool calls for how error results are represented and why error messages should be specific rather than generic.

The three rejected designs each map to a documented anti-pattern. Marking a timeout as success with empty content is silent suppression: the failure disappears and the review asserts something it never verified. Collapsing everything into one "scan unavailable" status strips the context a recovery decision needs and additionally misreports clean scans as outages. Failing the entire pipeline on one timeout throws away all partial review work when a retry or an annotated coverage gap would preserve it. Resilient error reporting is layered and honest: distinguish outcome types, attach actionable context, and let the layer with broader visibility decide how to recover.

### 도메인

Context Management & Reliability



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



## 질문 6

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : During an automated review run, the custom test-runner tool crashes mid-execution. You are designing how the harness reports this failure back to Claude so the review can continue intelligently. What should the harness do?

**A(정답).** Return a tool_result block with is_error set to true, containing what went wrong and a suggested next step.

**설명**

This is the documented mechanism for tool failures: the result block references the original tool call, the is_error flag signals failure explicitly, and actionable content tells the model what happened and how to adapt. Claude can then reason about retrying, working around the failure, or noting the gap in its review.

**B.** Return an empty tool_result marked successful so the review proceeds as if the runner found no issues.

**설명**

This is silent suppression, a known anti-pattern. The model would treat a crashed test run as a clean one and could approve code whose tests never actually executed, which is worse than an interrupted review.

**C.** Terminate the review run immediately and surface the raw exception in the pipeline logs for human triage.

**설명**

Aborting the whole workflow on a single tool failure discards all review work already completed and removes any chance for the model to recover. A raw exception in logs also gives the model no information at all, since the conversation simply ends.

**D.** Send the error details as a standalone plain-text user message instead of a tool_result block.

**설명**

Tool failures must be communicated inside the tool_result block that answers the corresponding tool_use block, not as out-of-band text. Breaking that pairing can produce API validation errors and leaves the tool call unresolved from the model's perspective.

### 전반적인 설명

In an agentic loop, the conversation history is the only channel through which Claude learns what its tools did, and that includes what they failed to do. The API defines a specific structure for this: a failed execution is reported as a tool_result block carrying the matching tool_use_id with "is_error": true. The flag tells the model unambiguously that the call did not succeed, while the block's content should be instructive rather than a bare status: state what went wrong and what to try next (retry after a delay, run a narrower test target, skip and annotate). That is what turns a crash into a recoverable event; the model can adjust its plan instead of guessing.

The alternatives each break this contract in a characteristic way. Marking the failure as a successful empty result is silent suppression: the model believes the tests ran clean, which in a CI review can mean approving unverified code. Killing the entire run treats one transient failure as fatal, discarding partial progress that a structured error would have preserved. And injecting the error as free-standing text violates the required pairing between tool_use and tool_result blocks; results must immediately follow their corresponding tool calls in the message history, and misordered or missing results can trigger 400-level validation errors.

The mental model to keep: error handling in agent systems is a communication design problem. Every failure message should carry enough context for the next decision-maker, whether that is the model itself or a coordinator, to choose among retry, workaround, or graceful degradation. See Handle tool calls for the documented result format and guidance on writing actionable error content.

### 도메인

Context Management & Reliability



## 질문 18

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline crashes after its per-file analysis stages complete. On restart, the manifest correctly marks those stages completed, yet the cross-file integration stage must redo their analysis because each stage's state file records only a status flag. What design change fixes this?

**A.** Re-run every stage from the beginning after any crash so the integration pass always works from freshly generated analysis.

**설명**

Discarding all completed work on any failure is a recognized anti-pattern; it doubles cost and latency and defeats the purpose of persisting state at all. Crash recovery should preserve and reuse the completed stages' results, not regenerate them.

**B.** Increase manifest granularity to track sub-steps within each stage so restarts can pick up partway through an interrupted stage.

**설명**

Finer-grained progress tracking addresses a different problem: resuming inside a partially finished stage. The failure described is that completed stages' outputs are missing, and no amount of status granularity restores the analysis content the integration stage needs.

**C.** Use --resume on restart to restore the crashed session's conversation context so the integration stage can access earlier analysis.

**설명**

Session resumption depends on local session data that an ephemeral CI runner typically does not retain across job restarts, and even when available it restores a conversation, not a machine-readable artifact for a separate pipeline stage. Structured state files at a known location are the reliable recovery mechanism here.

**D(정답).** Have each stage export its structured findings to the known state location so downstream stages load those results on resume.

**설명**

This is correct because a manifest can only tell the coordinator which stages to skip; the skipped stages' outputs must also survive the crash. Persisting structured findings alongside status makes resumed downstream stages able to consume prior work instead of regenerating it.

### 전반적인 설명

Structured state persistence has two parts that are easy to conflate. The manifest is an orchestration index: it tells the coordinator which stages are completed, in_progress, or not_started, so it knows what to skip on resume. The state files each stage exports are the data payload: the structured findings, coverage notes, and gaps that downstream stages actually consume. Because Claude is stateless between invocations, anything a later stage needs must exist as an explicit artifact; a status flag proves work happened but carries none of its output. Recovery only works when both layers are persisted, which is why the fix is to write each stage's structured findings to the known state location, not just its completion status.

The alternatives each miss this distinction. Resuming the crashed session assumes conversation history survives the crash and is reachable from the CI runner, and even a restored transcript is not a structured artifact a separate pipeline stage can load. Tracking sub-steps refines where to restart but restores nothing that was lost. Re-running everything is the abort-and-redo anti-pattern: it trades away exactly the cost and time savings that state persistence exists to provide.

The mental model to carry into any Claude-based pipeline: treat each stage like a checkpointed batch job. Export state to a known location as work completes, keep a manifest of per-stage status, and on resume have the coordinator read the manifest, load completed stages' outputs, and re-dispatch only unfinished work. See the Claude Code overview and headless mode documentation for running Claude Code non-interactively in CI, where this pattern applies.

### 도메인

Context Management & Reliability



