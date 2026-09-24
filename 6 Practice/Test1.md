# Practice Test 1

## 질문 1

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : A single extraction pass over 60-page contract bundles produces detailed results for early sections but sparse or missing fields for later ones, and identical clause types are classified inconsistently across sections. How should the extraction be restructured?

**A.** Switch to a model with a larger context window so all sections receive adequate attention within a single pass.

**설명**

This reflects a common misconception: fitting more content into the context window does not by itself fix analysis quality. The bundle may already fit; the problem is that a single pass over a long, complex document tends to underweight some sections, producing shallow results regardless of window size.

**B.** Run the single-pass extraction three times and keep only field values that agree across at least two of the runs.

**설명**

Majority voting over runs that all share the same single-pass weakness does not restore depth for the neglected sections. Fields that were sparsely extracted in every run stay missing, and consensus can suppress correct values that appeared in only one run.

**C(정답).** Extract each section in its own focused pass, then run a separate pass to reconcile cross-section references and totals.

**설명**

This is correct because the failure pattern (uneven depth and contradictory classifications) is characteristic of single-pass analysis over very long, complex documents, where content in later or middle portions is more easily underweighted. Per-section passes help maintain more consistent depth for local fields and make missed details less likely, while a dedicated reconciliation pass handles values that span sections.

**D.** Mark every field required in the JSON schema so shallow extractions fail validation and trigger automatic retries.

**설명**

Schemas enforce structure, not extraction quality: making fields required when a section was processed shallowly pressures the model to fabricate values rather than extract them accurately. Retries against the same overloaded single pass also inherit the same underlying weakness.

### 전반적인 설명

The symptoms in this situation are characteristic of single-pass analysis over very long, complex documents: output is thorough for some portions and shallow for others, judgments become inconsistent (the same clause type handled differently in different places), and content in the middle or later portions is more easily underweighted, a risk often described as lost in the middle. The mental model to hold is that context capacity and analysis quality are separate things; a document can fit in the window and still be too large for uniformly deep single-pass extraction.

The remedy is the same decomposition pattern used for large multi-file code reviews: split the work into focused local passes, one per unit (here, per section), each with a single bounded job, followed by a separate integration pass that examines only cross-unit concerns such as references between sections, totals that must reconcile, and classification consistency. This is a form of prompt chaining, which improves accuracy and traceability because each prompt has one bounded job; it helps maintain more consistent depth across sections and makes cross-cutting analysis an explicit step rather than a side effect. See Chain complex prompts for stronger performance and Long context prompting tips.

The alternatives each miss the root cause. A larger context window addresses capacity, not the uneven quality of single-pass analysis over long documents. Majority voting across repeated single passes averages over runs that share the same systematic weakness, so persistently neglected sections never get recovered. Tightening the schema with universally required fields is actively harmful: JSON schemas guarantee output shape, not extraction quality, and forcing required values from shallowly processed sections is precisely the condition under which models fabricate plausible-looking data.

### 도메인

Prompt Engineering & Structured Output

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

## 질문 3

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : A coordinator delegates reconciliation to a subagent with the prompt 'Reconcile the extracted invoice fields against the source document.' The output contains values matching neither the extractions nor the document. What change should you make?

**A.** Enforce a strict JSON output schema on the reconciliation subagent so its returned field values stay tied to real data.

**설명**

This is incorrect because output schemas constrain the shape of a response, not the factual grounding of its values. Even a strictly enforced schema would be filled with fabricated values here, since the subagent has no access to the real extractions to draw from.

**B.** Move the reconciliation subagent to a model tier with a larger context window so both inputs fit during processing.

**설명**

This is incorrect because the failure occurs before context capacity matters: the extractions and document were never placed in the subagent's context at all. A larger window would not help when the delegation prompt contains only a reference to the data rather than the data itself.

**C.** Instruct the subagent to read the extractions from the coordinator's conversation history before performing the reconciliation.

**설명**

This is incorrect because subagents cannot access any version of the coordinator's history; no instruction changes that. The delegation prompt string is the only content that crosses the boundary, so telling the subagent to look elsewhere gives it nothing to find.

**D(정답).** Embed the complete extracted field values and the relevant source document content directly in the delegation prompt.

**설명**

This is correct. Subagents do not inherit the coordinator's conversation history; their context contains only what the delegation prompt provides. A prompt that names 'the extracted invoice fields' without embedding the actual extraction output and document content leaves the subagent with nothing real to reconcile, so passing the full data in the prompt fixes the failure.

### 전반적인 설명

The defining property of subagents in the Claude Agent SDK is context isolation. Each subagent is a separate agent instance whose conversation starts fresh; it does not inherit the parent's history, and the only content that crosses from coordinator to subagent is the delegation prompt string itself. This design is deliberate: isolation is what lets subagents explore verbose material without polluting the main conversation, and what makes parallel delegation cheap. The tradeoff is that the coordinator carries full responsibility for context transfer. A phrase like the extracted invoice fields is a pointer with no referent inside the subagent's world, and a capable model handed an instruction it cannot ground will produce fluent, plausible, ungrounded output, which is exactly the failure observed here.

The correct mental model is that findings must travel explicitly in every delegation: the coordinator should embed the complete extraction output (ideally as structured data separating values from metadata) plus the relevant document content directly in the reconciliation prompt. The other remedies miss this. Instructing the subagent to consult the parent's history cannot work because no version of that history, summarized or otherwise, is ever visible to it. A strict JSON schema governs output shape, not truthfulness; it would simply force fabricated values into a valid structure. And context window size is irrelevant when the data never entered the context in the first place. See Subagents in the SDK for how subagent context isolation works, including the note that you must include any file paths, findings, or decisions the subagent needs directly in the Agent tool's prompt.

### 도메인

Agentic Architecture & Orchestration

## 질문 4

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The system receives a request to assess how a new data privacy regulation affects the healthcare, finance, and education sectors, with one comprehensive cited report expected. How should the coordinator structure this work?

**A.** Delegate the entire request to a single search subagent so all three sectors are covered in one context and cross-sector comparisons stay consistent.

**설명**

Packing three distinct investigations into one subagent forfeits parallelism and risks attention dilution, with some sectors analyzed deeply and others shallowly. Consistency across sectors is the coordinator's job during synthesis, not a reason to avoid decomposition.

**B.** Spawn three parallel subagents whose prompts name only the assigned sector, relying on each to inherit the coordinator's conversation history for the request details.

**설명**

Non-fork subagents do not inherit the parent's conversation history; each starts with a fresh context that contains only what the delegation prompt provides. Subagents given only a sector name would lack the regulation details and reporting requirements, producing unusable findings.

**C(정답).** Split the request into three sector subtasks, run parallel subagents that each receive the full request context in their prompts, then synthesize results into one report.

**설명**

This is the correct pattern for multi-concern requests: decompose into independent items, investigate them concurrently since the sectors do not depend on each other, and pass the shared request context explicitly because subagents start with fresh context. The coordinator then merges the returned summaries into a single unified report.

**D.** Investigate the three sectors sequentially, feeding each subagent the findings from the prior sector so later analyses can build on earlier discoveries.

**설명**

The three sector investigations are independent, so sequencing them creates an artificial dependency and roughly triples end-to-end latency. Parallel delegation is the documented approach when subtasks do not depend on one another's results.

### 전반적인 설명

This question tests the standard orchestration pattern for a multi-concern request: decompose it into distinct items, investigate each in parallel, and synthesize a unified result. The three sector analyses are independent, so the coordinator should emit multiple subagent invocations in a single turn; independent workstreams then finish in roughly the time of the slowest one rather than the sum of all three. The Subagents in the SDK documentation lists parallelization as a core benefit of delegating to separate agent instances.

The mental model that makes this pattern work has two halves. First, context isolation: each subagent runs in its own conversation, so its intermediate searches and tool results never bloat the coordinator's context; only its final message returns. Second, and as a direct consequence, explicit context passing: because a non-fork subagent starts fresh, the shared context (the regulation in question, the research goal, citation requirements) must appear in every delegation prompt. This is why relying on inherited conversation history fails; the documentation is explicit that any file paths, decisions, or criteria the subagent needs must be placed directly in the prompt string.

Sequential investigation adds latency without benefit when subtasks are independent, and chaining findings between unrelated sectors invites contamination rather than insight. Delegating everything to one subagent avoids decomposition entirely, concentrating three deep investigations in a single context where attention dilutes across topics. The tradeoff the coordinator-subagent design exists to make is exactly this: pay a small cost in explicit prompt construction to gain concurrency, focused contexts, and a clean synthesis step over concise per-topic summaries. See also the Agent SDK agent loop documentation for how tool calls and results flow within each agent's own loop.

### 도메인

Agentic Architecture & Orchestration

## 질문 5

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : A nightly extraction job runs claude -p with --output-format json and --json-schema over incoming documents. The pipeline's parser reads the top-level result field and intermittently fails to obtain schema-conformant JSON. What change fixes this?

**A.** Extract the payload with jq -r '.result', since the wrapper nests the model's answer there.

**설명**

Pulling result with jq is the documented pattern for plain --output-format json runs where you want the text answer. When --json-schema is in use, the validated payload lives in structured_output, so this keeps the parser pointed at the wrong field.

**B.** Switch to --output-format stream-json so each extraction arrives as its own parseable JSON line.

**설명**

stream-json emits newline-delimited JSON for real-time streaming of events, which changes the delivery format but does not relocate the schema-validated payload. The pipeline would still need to read structured_output from the final result to get validated data.

**C.** Add a prompt instruction directing Claude to emit the schema-conformant JSON inside the result field.

**설명**

Prompt instructions cannot change where the CLI places validated output; field placement in the JSON envelope is determined by Claude Code, not by the model's prose. Relying on the prompt also reintroduces the probabilistic formatting that --json-schema exists to eliminate.

**D(정답).** Read the validated extraction payload from the structured_output field of the JSON envelope.

**설명**

This is correct because when --json-schema is supplied, the schema-validated payload is placed in the structured_output field of the JSON wrapper, not in result. The result field carries the text answer, which is why parsing it for schema-conformant JSON fails intermittently.

### 전반적인 설명

Claude Code's print mode wraps its output in a JSON envelope when invoked with --output-format json. The mental model to hold is that this envelope has distinct fields with distinct jobs: result holds the model's text answer, session metadata sits alongside it, and when --json-schema is supplied, the schema-validated payload appears in a separate structured_output field. A pipeline that parses result expecting schema-conformant data is reading the prose channel, which explains intermittent failures: sometimes the text happens to be clean JSON, sometimes it is not.

This separation is deliberate. Keeping the human-readable answer and the machine-validated payload in different fields lets Claude Code guarantee that whatever lands in structured_output has actually passed schema validation, while the model remains free to narrate in result. Two failure modes still deserve handling in automation. First, if the output repeatedly fails schema validation, the run ends with an error subtype such as error_max_structured_output_retries rather than structured data. Second, and separately, a result can carry the subtype success yet contain no structured_output field; robust pipelines should require both a successful subtype and a present structured_output before proceeding.

The distractors fail for structural reasons: jq -r '.result' is the right extraction only for plain JSON output without a schema; stream-json changes delivery to newline-delimited events without moving the validated payload; and prompt instructions cannot dictate envelope layout, since the CLI, not the model, decides where validated output is placed. See Headless mode and the CLI reference for the documented invocation pattern and output structure, and Structured outputs for the validation and retry behavior.

### 도메인

Claude Code Configuration & Workflows

## 질문 6

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline exposes scan_code (security scanning) and check_code (linting), but both tools carry the description "checks code and reports issues," and review requests are frequently misrouted. Which TWO changes most directly fix this? (Select TWO.)


**A(정답).** Rewrite check_code's description to state what it lints, its expected inputs, and when NOT to use it.

**설명**

Descriptions are the primary mechanism the model uses to select tools, so adding input expectations and explicit boundary language directly resolves ambiguous routing. Stating when not to use the tool draws the line that the current identical descriptions erase.

**B(정답).** Rename scan_code to run_security_scan and update its description to reference vulnerability detection specifically.

**설명**

Renaming the tool to reflect its actual function and rewriting its description to name its specific domain removes the semantic overlap at the point where the model makes its selection. This is the documented remedy for tools whose names and descriptions blur into each other.

**C.** Add few-shot routing examples to the review prompt showing which tool handles each request type.

**설명**

Prompt examples add token overhead and place the guidance away from where selection actually happens, since the model reads tool descriptions at decision time. The underlying descriptions remain identical, so the ambiguity persists beneath the workaround.

**D.** Merge both tools into a single analyze_code tool with a mode parameter that selects scanning or linting behavior.

**설명**

Merging the tools converts a visible selection problem into a hidden mode-selection problem inside one overloaded interface. The model must still choose correctly between the two behaviors, but now without distinct descriptions to guide the choice.

### 전반적인 설명

Claude selects tools primarily by reading their descriptions, not by inferring intent from their names or from surrounding prompt text. When two tools carry identical or near-identical descriptions, the model has no signal to distinguish them, and misrouting is the predictable result. The mental model to hold is that the tool description is the interface contract the model consults at the moment of selection; anything you want to influence that choice must live there.

The fix therefore operates on two levers at once. Renaming scan_code to something like run_security_scan and grounding its description in vulnerability detection eliminates the name-level overlap, while rewriting check_code's description to specify what it lints, what inputs it expects, and when it should not be used draws an explicit boundary between the two territories. Together these changes make each tool's purpose unambiguous without adding any new machinery.

The alternatives fall short for structural reasons. Few-shot routing examples in the prompt spend tokens teaching a distinction that the descriptions should encode directly, and the model still confronts two indistinguishable definitions at selection time. Merging the tools behind a mode parameter is an anti-pattern: it does not remove the decision, it buries it inside a single tool where descriptions can no longer guide it, which is precisely why splitting overloaded tools into purpose-specific ones is the recommended direction, not the reverse. See the tool use overview for how descriptions drive Claude's tool selection.

### 도메인

Tool Design & MCP Integration

## 질문 7

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The coordinator delegates section-level extraction to subagents and an assembly agent produces the final JSON. Outputs are always schema-valid, yet nullable fields are frequently null even though the source document contains those values. Which orchestration change fixes this?

**A.** Run every extraction subagent twice on each document and merge the two result sets, keeping whichever pass returned a non-null value for each output field.

**설명**

Blind duplication doubles cost on every document regardless of whether the first pass had gaps, and the second pass is not aimed at the specific missing fields. Without gap detection there is no guarantee the repeated run finds what the first run missed, and no signal for when to stop.

**B(정답).** Have the coordinator detect null fields in the assembled output, re-delegate targeted extraction for them, and re-assemble until coverage is sufficient.

**설명**

This implements an iterative refinement loop: the coordinator evaluates the assembled result against coverage criteria, dispatches focused follow-up extraction only for the fields that came back empty, and re-runs assembly until the output meets the bar. It repairs the gap rather than merely documenting it, and it targets effort where the first pass fell short.

**C.** Append a completeness score and a list of missing fields to each output so downstream consumers know which values were not captured.

**설명**

This measures the defect and ships it anyway. Detection without a repair loop leaves the nulls in place and pushes the remediation burden onto downstream systems that have no access to the source document or the extraction subagents.

**D.** Change the schema to mark the frequently null fields as required so the extraction subagents are forced to populate them on the first pass.

**설명**

Marking fields required does not make the underlying data easier to find; it removes the model's honest way to report a miss. When a field is required but the extractor did not locate the value, the likely outcome is a fabricated value that still validates, which is worse than a null.

### 전반적인 설명

The pattern being tested is the iterative refinement loop (sometimes called evaluator-optimizer): the coordinator does not treat the first assembled output as final, but evaluates it against explicit quality criteria, re-delegates targeted work for whatever fell short, and re-invokes the assembly step until the criteria are met. The essential ingredients are a checkable definition of "good enough" (here, nullable fields populated whenever the source actually contains the value), a gap-detection step that compares output to that definition, and targeted re-delegation so follow-up passes attack only the specific misses rather than redoing everything.

The mental model is that schema validation and extraction coverage are orthogonal. A JSON schema guarantees shape: braces close, required fields exist, types match. It says nothing about whether a nullable field should have held a value. That is why the failure in this system is invisible to validation and must be caught by an evaluation step the coordinator runs itself. Because subagents operate with isolated context, the coordinator is also the only component positioned to compare the assembled result across sections and dispatch a follow-up extraction with the document context that pass needs.

The alternatives each break in a characteristic way. Tightening the schema by marking fields required is a documented anti-pattern: a field should be required only when it is genuinely always present, otherwise the model tends to invent a value to satisfy the schema, converting a detectable null into a confident wrong answer. Running every subagent twice is blind redundancy: it pays double on documents that had no gaps and aims nothing at the fields that did. Appending a completeness report is detection without repair; observability is valuable, but it changes nothing about the delivered output.

See Anthropic's guidance on the evaluator-optimizer workflow in Building Effective Agents and on coordinator-subagent context in Create custom subagents.

### 도메인

Agentic Architecture & Orchestration

## 질문 8

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : Before calling process_refund, the agent produces a structured dispute record. Validation fails: refund_amount is 85.00 but the extracted disputed line items sum to 70.00, and order_date is not ISO 8601. What should the retry request contain?

**A.** Resubmit the original prompt with a general reminder appended to double-check amounts and date formats.

**설명**

A generic reminder is a vague instruction, not error feedback: it does not tell the model which specific values conflicted or which field violated the format. Concrete validation errors are what make retries converge quickly.

**B.** Resubmit the original prompt unchanged, relying on regeneration to produce a valid record.

**설명**

Resubmitting without any feedback makes the retry a fresh roll of the dice rather than a targeted correction. The model has no signal about what failed, so the same arithmetic and format mistakes are likely to recur.

**C(정답).** Include the source conversation and order data, the failed record, and the two specific validation errors.

**설명**

This is the retry-with-error-feedback pattern: the model sees what it produced, exactly what was wrong, and the source material it must correct against. With all three present, one or two retries typically resolve format and arithmetic inconsistencies like these.

**D.** Send only the two validation errors plus a firmer instruction to comply, omitting the failed record and source data.

**설명**

Errors alone are not enough: without the failed record the model cannot see which values it must revise, and without the source data it cannot re-ground the refund amount or line items. Firmer wording adds no operational content to guide the correction.

### 전반적인 설명

The validation-retry loop is the standard reliability pattern for structured output: the model generates, your code validates against a schema and business rules, and on failure you re-prompt with feedback. What makes the retry effective is its composition. The model needs three things: the source material (the conversation and order data) so it can re-derive correct values, the failed output so it knows what to revise, and the specific errors ("refund_amount is 85.00 but line items sum to 70.00; order_date must be ISO 8601") so the correction is targeted rather than a blind regeneration. Both errors here are the retryable kind: an arithmetic inconsistency the model can re-check and a format violation it can reformat. Retries would be pointless only if the required information were absent from the source entirely.

The mental model is that a retry without feedback is just resampling; the failure probability barely moves. Omitting the failed record or the source data leaves the model unable to locate or re-ground the offending values, and generic reminders to "double-check" are exactly the kind of vague instruction that concrete criteria and concrete errors exist to replace. In production, pair this loop with semantic self-check fields (extracting both a stated and a calculated total with a conflict flag) so discrepancies like this one are detected mechanically before a refund tool is ever invoked.

See Tool use overview and Prompt engineering overview for the mechanisms behind schema-constrained output and iterative refinement.

### 도메인

Prompt Engineering & Structured Output

## 질문 9

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : A nightly Claude Code job reviews changes to a structured extraction pipeline and posts findings to a team dashboard. Every run re-posts the same schema-validation findings, so engineers now ignore the dashboard. How should the job be redesigned?

**A.** Run the review at temperature zero so successive runs emit identical findings the dashboard can deduplicate by exact text match.

**설명**

Deterministic sampling does not guarantee identical output once the code under review changes, so exact text matching remains brittle. It also cannot distinguish a finding the team has fixed from one the model re-detected, so resolved and open issues are treated alike.

**B.** Instruct the reviewer to report only critical-severity schema violations so the dashboard receives far fewer repeated findings.

**설명**

Filtering by severity shrinks the volume of output but does not stop the remaining critical findings from being re-posted every night. It also sacrifices coverage of legitimate lower-severity issues without addressing the underlying repetition.

**C(정답).** Supply the last run's findings as context and direct the reviewer to surface only issues that are new or remain unfixed.

**설명**

This is the documented pattern for repeat reviews: giving the reviewer its own earlier findings plus an explicit delta instruction suppresses duplicates while still surfacing fresh issues and unresolved carryovers. It treats the repetition as a context design problem, which is what it is.

**D.** Have the reviewer self-rate confidence on each finding and have the posting step drop findings below a confidence threshold.

**설명**

Self-rated confidence addresses uncertainty, not repetition: a high-confidence finding will be re-detected and re-posted on every run just the same. Confidence scores from the model are also unreliable as a filtering signal, since the model can be confidently wrong.

### 전반적인 설명

Automated review jobs lose their audience fast when they repeat themselves. The underlying mechanism matters here: each CI invocation of Claude Code is a fresh, stateless run with no memory of what it reported last time, so given the same pipeline code it will naturally regenerate the same schema-validation findings night after night. The fix is to make the missing state explicit. Include the prior run's findings in the review context and instruct Claude to report only issues that are new or still unaddressed. The model can then compare the current code against its earlier findings, recognize what has been fixed, carry forward what has not, and flag anything the latest changes introduced.

This works because it lets the model do semantic deduplication. Post-processing approaches cannot: exact text matching under temperature zero breaks as soon as the code under review changes and the phrasing shifts, and neither it nor a confidence filter can tell a resolved issue from a re-detected one. A confidence threshold targets a different failure mode entirely (uncertain findings, not repeated ones), and severity filtering merely reduces how many duplicates get posted while discarding valid lower-severity coverage.

The general lesson for CI integrations is that duplicate suppression is a context management problem, not a post-processing problem. State that the model needs across invocations, such as its own prior output, must be fed back in explicitly. See Claude Code GitHub Actions and Run Claude Code programmatically for how non-interactive review runs are constructed.

### 도메인

Claude Code Configuration & Workflows

## 질문 10

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : Many customers share a phone number on family plans, so when the agent looks up an account by phone, get_customer often returns several accounts; the agent picks one and sometimes applies billing credits to the wrong household member. What should you change?

**A.** Have the agent apply the credit to the account flagged as the primary plan holder and ask the customer to confirm once the credit posts.

**설명**

The primary-holder flag is a heuristic, not identity verification, and confirming after the action is too late for financial operations. If the guess was wrong, the credit has already posted to another household member's account before anyone can object.

**B(정답).** Instruct the agent to request a distinguishing identifier (email, account number, or a recent order) before applying any account-specific change.

**설명**

This is correct because the customer is the only party with definitive knowledge of which account is theirs, so one clarifying turn resolves the ambiguity reliably. Any selection heuristic, however sophisticated, retains a nonzero chance of acting on the wrong account, which is unacceptable for financial actions like billing credits.

**C.** Modify get_customer to rank the candidate accounts and return only the single highest-scoring one so the agent never sees ambiguous results.

**설명**

Hiding the ambiguity inside the tool does not remove it; the ranking algorithm can still select the wrong household member, and now the agent has no signal that a disambiguation step is even needed. Suppressing the multiple-match condition makes wrong-account errors harder to detect, not less likely.

**D.** Route every phone lookup that returns multiple accounts to escalate_to_human so a person settles the identity question.

**설명**

Multiple matches are a routine, easily resolvable condition, not a genuine escalation trigger like an explicit request for a human or a policy gap. Escalating them wholesale consumes human capacity on cases the agent can resolve with one clarifying question and directly undermines the first-contact resolution target.

### 전반적인 설명

When a lookup by a shared attribute like a phone number returns multiple candidate accounts, the system is facing an identity ambiguity problem, and the reliable resolution is to obtain more information from the one source that actually knows the answer: the customer. Asking for a distinguishing identifier such as an email address, account number, or a recent order converts an uncertain guess into a deterministic match. The cost is a single extra conversational turn; the benefit is eliminating a class of errors (billing credits and account changes applied to the wrong household member) that are both financially damaging and corrosive to customer trust.

The mental model to hold is that heuristics estimate, identifiers verify. Picking the primary plan holder, the most recently active account, or the highest match score can be right most of the time, but an agent that takes account-specific actions on a probabilistic guess will eventually act on the wrong person's data. Moving the heuristic into the tool by returning only a top-ranked match is arguably worse than leaving it in the prompt, because it strips the agent of the very signal (multiple matches exist) that should trigger a clarification. Post-action confirmation inverts the correct ordering: verification must precede financial operations, not follow them. Escalating every multi-match case to a human is the opposite failure, treating a routine disambiguation as if it were a policy gap or an explicit request for a human, and it burns escalation capacity while dragging first-contact resolution down.

Since Claude selects and parameterizes tools based on the conversation and the tool definitions, the disambiguation rule belongs in the agent's instructions: on multiple matches, ask before acting. See the tool use overview for how tool results feed back into the model's next decision, which is exactly the point where the agent can be directed to seek clarification instead of guessing.

### 도메인

Context Management & Reliability

## 질문 11

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

## 질문 12

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : An engineer maintaining this system asks Claude Code to trace how the coordinator routes tasks. Discovery output (file listings, grep results) is rapidly consuming the main context window. What should the engineer do?


**A(정답).** Delegate the search to the Explore subagent, which holds the verbose output in its own context and returns a summary.

**설명**

This is correct. Explore is a built-in, read-only subagent optimized for searching and analyzing codebases; it runs in a separate context window, so the raw file listings and search results never enter the main conversation, and only a distilled summary comes back. This preserves the main context for the actual maintenance work.

**B.** Run /compact after each discovery phase so the accumulated search output is summarized within the same session.

**설명**

Compaction is a recovery mechanism, not an isolation mechanism: the verbose output still enters the main context first, and summarization risks dropping precise details like file paths and exact matches. Delegating discovery prevents the pollution instead of repeatedly cleaning it up.

**C.** Switch to plan mode so the investigation proceeds read-only and produces a plan instead of verbose output.

**설명**

Plan mode governs whether Claude may make changes, not where exploration output accumulates. A read-only investigation in the main session still fills the main context window with the same file listings and search results.

**D.** Use /clear once the window fills, then restate the findings gathered so far and continue the investigation.

**설명**

Clearing the conversation discards all accumulated understanding along with the noise, forcing the engineer to manually reconstruct findings each time the window fills. It treats the symptom repeatedly rather than keeping discovery output out of the main context in the first place.

### 전반적인 설명

Claude Code's Explore subagent exists for exactly this failure mode. Codebase discovery is inherently high-volume: tracing a routing path means globbing directories, grepping for call sites, and reading files whose contents will mostly never be referenced again. Because every subagent runs in its own context window, delegating the search to Explore means all of that raw output accumulates in the subagent's context, and the main conversation receives only the relevant summary. Explore is a fast, read-only agent (Write and Edit are denied), and Claude picks a documented thoroughness level (quick, medium, or very thorough) to match the task; it also skips CLAUDE.md files to keep research focused.

The mental model is prevention versus recovery. /compact and /clear act after verbose output has already flooded the main window: compaction summarizes lossily (exact numbers, paths, and details can be dropped), and clearing throws away learned context entirely. Plan mode is orthogonal; it makes the session read-only and defers edits behind an approved plan, but every byte of exploration output still lands in the main context. Delegation to a subagent is the only option that keeps the noise out of the primary conversation while retaining its useful conclusions. See Subagents in Claude Code for the built-in Explore agent and the general pattern of delegating high-volume operations so only summaries return.

### 도메인

Claude Code Configuration & Workflows

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

## 질문 15

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The team's /extract-fields skill requires a source document path and a target schema name, but engineers keep invoking the skill bare and get empty or malformed extractions. Which SKILL.md frontmatter change best addresses this?

**A.** Document the required parameters and their defaults in the skill's instruction body.

**설명**

Instruction-body documentation helps whoever opens and reads the skill file, but it is not surfaced to the engineer at the moment of invocation. Someone who runs the skill bare never encounters that documentation before the underspecified run proceeds.

**B.** Set allowed-tools so the read and extraction tools the skill relies on run without prompts.

**설명**

allowed-tools pre-approves the listed tools so Claude can use them without asking permission during the invoking turn. Smoothing tool approval does not communicate the document path and schema name the skill is missing when invoked bare.

**C.** Expand the description field so Claude can decide more precisely when the skill should be invoked.

**설명**

The description field tells Claude when a skill is relevant so it can be selected appropriately. It does not surface the arguments an engineer must supply when explicitly invoking the skill, so bare invocations continue.

**D(정답).** Add argument-hint so the skill's expected arguments are shown to engineers when they invoke it.

**설명**

This is correct because argument-hint is the frontmatter field for communicating a skill's expected arguments to users at invocation time, appearing where the skill is invoked. Surfacing the required document path and schema name right when engineers type the command directly targets the bare-invocation habit causing the bad extractions.

### 전반적인 설명

Skills defined in .claude/skills/ carry YAML frontmatter in their SKILL.md file, and each frontmatter field solves a distinct problem. The mental model worth keeping: argument-hint communicates the skill's expected inputs to users, showing what arguments an invocation should include; description tells Claude what the skill is for so it can be invoked at the right moments; and allowed-tools pre-approves listed tools so Claude can use them without permission prompts during the invoking turn, smoothing execution rather than communicating anything about arguments.

When engineers repeatedly invoke a parameterized skill bare, the failure is that the required inputs are invisible at the point of use, so argument-hint is the matching lever. It moves the fix from documentation people must remember to read into the invocation experience itself: the expected document path and schema name are displayed where the skill is invoked, so engineers see what to supply before running it. Note the boundary of the mechanism: argument-hint surfaces expectations, it does not validate arguments or block an underspecified run, so pairing it with graceful handling of missing inputs inside the skill remains good practice. Documenting parameters in the instruction body is passive and never appears at invocation time, a richer description improves when Claude chooses the skill rather than how humans parameterize it, and pre-approving tools leaves the root cause untouched, because a skill that never received its inputs produces empty results regardless of how frictionlessly its tools run.

See the official documentation on Agent Skills in Claude Code for the full set of frontmatter fields and how skills are scoped and shared.

### 도메인

Claude Code Configuration & Workflows

## 질문 16

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : You add a coordinator that delegates support subtasks to specialized subagents. A customer reports a duplicate charge, a missing loyalty discount, and unwanted auto-renewal. Logs show the coordinator spawned two subtasks, both addressing the duplicate charge; all subagents succeeded, yet the reply ignores the other issues. Which change most effectively fixes this?

**A.** Restructure the synthesis input so findings for each concern appear at the start of the aggregated context with explicit section headings.

**설명**

Position-aware input helps when the lost-in-the-middle effect causes a model to under-attend to mid-context content, but that failure mode requires the findings to exist first. No subagent ever investigated the discount or the cancellation, so there were no findings for synthesis to reorder or lose.

**B(정답).** Revise the coordinator's decomposition instructions so it enumerates every stated concern and delegates one bounded subtask per concern.

**설명**

This is correct. The logs show both subtasks targeted only the duplicate charge, meaning the coordinator's decomposition failed to cover the full scope of the customer's message. Since every subagent completed its assigned work correctly, the fix belongs at the decomposition step, where the coordinator must be directed to cover each stated concern before delegating.

**C.** Rewrite overlapping tool descriptions so discount and cancellation subtasks are routed to subagents capable of handling them.

**설명**

Fixing misrouting presupposes that subtasks for those concerns were created and sent to the wrong workers. The logs show only duplicate-charge subtasks were ever spawned, so clarifying tool descriptions cannot restore the missing coverage.

**D.** Pass the coordinator's full conversation history into each subagent's prompt so workers can see all of the customer's stated concerns.

**설명**

Context isolation is real, but it is not the failure here. Subagents are only expected to handle what the coordinator delegates to them, and the discount and cancellation concerns were never turned into subtasks at all, so richer context passing would not make any subagent address them.

### 전반적인 설명

In a hub-and-spoke (orchestrator-workers) architecture, the coordinator owns task decomposition: it reads the full request, breaks it into subtasks, delegates each one, and synthesizes the results. This design means the coordinator's decomposition defines the ceiling of what the system can cover. If a concern is never turned into a subtask, no downstream component (subagent execution, context passing, or synthesis) can recover it, because those stages only operate on work that was actually delegated. That is why the diagnostic signal here is so telling: every subagent succeeded, yet coverage is incomplete, which localizes the fault to the delegation step itself.

Anthropic documents exactly this failure mode in its multi-agent research work: when the lead agent's task descriptions are vague or poorly divided, subagents duplicate work or leave gaps, so each delegation should carry a clear objective, output format, and explicit task boundaries. In this case two subtasks both targeted the duplicate charge, an ineffective division of labor that both duplicates effort and omits two of the customer's three stated concerns. The effective fix is at the coordinator level: instruct it to decompose multi-concern messages into distinct items covering every stated issue before delegating.

The distractors all intervene downstream of decomposition. Richer context passing matters only for subtasks that exist; reordering the synthesis input can only surface findings that were gathered; and clearer tool descriptions only improve routing of subtasks that were actually created. Reading the coordinator's decomposition log, as this scenario does, is the standard way to distinguish a coverage failure from an execution failure. See How we built our multi-agent research system and Building effective agents.

### 도메인

Agentic Architecture & Orchestration

## 질문 17

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline's finding schema declares cve_id as a required string on every security finding. When a flagged vulnerability has no published CVE, Claude emits realistic-looking identifiers such as CVE-2023-48213. Which change prevents these fabricated values?

**A.** Add a system prompt rule stating that CVE identifiers must never be invented under any circumstances.

**설명**

A prompt instruction competes with a structural constraint that demands a string value on every finding. Because the schema still requires the field, the model must emit something, so the instruction can only reduce the failure rate, not eliminate it.

**B(정답).** Declare cve_id with type ["string", "null"] so findings without a published CVE can report null.

**설명**

This is correct because a required string field leaves the model no honest way to express absence; schema conformance forces it to produce some string. Allowing null gives the model a legitimate schema-valid answer for findings with no published CVE, removing the structural pressure to fabricate.

**C.** Validate each cve_id against the public CVE registry after extraction and discard entries that fail.

**설명**

Post-validation treats the symptom rather than the cause, since the schema continues to force a value on every finding. It also fails silently when a fabricated identifier happens to match a real but unrelated CVE, letting incorrect data through.

**D.** Run a retry with the fabricated value and a validation error so Claude can correct the identifier.

**설명**

Retry with error feedback works for format and structural mistakes, but it cannot help when the required information does not exist for the finding. The unchanged schema still demands a string, so the retry simply produces another invented identifier.

### 전반적인 설명

Schema-conformant output mechanisms such as Structured Outputs and strict tool use guarantee shape: field types are honored and required fields are always present. That guarantee cuts both ways. When a field is marked required but the underlying fact genuinely may not exist, the model is cornered: it must emit a schema-valid value, and the only way to satisfy the constraint is to invent one. Fabrication here is not a model defect to be scolded away in the prompt; it is the schema working exactly as designed on an input the schema never allowed for.

The fix is to represent absence explicitly. Anthropic's supported JSON Schema subset includes union types such as "type": ["string", "null"], so a field can remain required (always present in the output object) while permitting null when the source contains no value. Alternatively, a field can be made optional by omitting it from the required list; optional and nullable are distinct design choices, and both count toward documented complexity limits (24 optional parameters and 16 union-typed parameters). Either way, the model gains a truthful answer for the missing-data case.

The other approaches all leave the structural trap intact. Prompt rules against invention are probabilistic and lose to a hard constraint that demands a value. Registry post-validation catches only fabrications that fail lookup, and a plausible fake can collide with a real, unrelated CVE. Retry with error feedback is the right tool for correctable errors, but the documented boundary applies: retries cannot recover information that is absent, and the unchanged schema will coerce a new fabrication each attempt. See Structured outputs and Increase output consistency.

### 도메인

Prompt Engineering & Structured Output

## 질문 18

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Metrics show naming-convention findings carry a 55% false-positive rate while security findings are over 90% accurate, yet developers have begun ignoring both. While the naming prompts are being fixed, how should the pipeline handle the naming category?

**A.** Demote naming findings to non-blocking informational comments so developers can skip them.

**설명**

The noisy findings still appear in every pull request, so they continue to consume attention and reinforce the habit of dismissing the reviewer's output. Relabeling the noise does not stop the erosion of trust in accurate categories.

**B.** Keep the naming category live and iterate on its few-shot examples against real pull requests.

**설명**

Few-shot examples are a sound technique for improving the category eventually, but iterating in production means developers keep receiving majority-wrong findings while each change is tested. Trust continues to degrade during the entire tuning period.

**C(정답).** Suspend the naming category until its rewritten prompts pass offline testing.

**설명**

Removing the noisy category immediately stops it from training developers to dismiss all findings, which protects trust in the accurate security and correctness categories. The prompts for the disabled category can then be improved and validated before it is re-enabled.

**D.** Require a higher model-stated confidence threshold before any naming finding is reported.

**설명**

Self-reported confidence is poorly calibrated, so filtering on it does not reliably separate true findings from false positives. The category remains live and noisy, and the underlying prompt criteria that generate the false positives are never fixed.

### 전반적인 설명

The key insight here is that false positives are contagious across categories. Developers do not maintain separate mental trust scores for naming findings versus security findings; when half of what a reviewer says is wrong, they learn to dismiss everything it says. That means a 55% false-positive naming category is not merely low-value on its own; it actively destroys the value of the 90%-accurate security category sitting next to it. Trust is the system's real asset, and it degrades as a whole.

The correct operational move is therefore to take the noisy category out of the pipeline while its prompts are improved. This immediately stops the trust erosion, preserves the credibility of the precise categories, and creates room to rewrite the naming criteria (explicit reportable-versus-skippable rules, contrasting few-shot examples) and validate them offline before the category returns. Nothing about disabling is permanent; it is a staging decision about where iteration happens.

The alternatives all keep the noise in front of developers. Demoting findings to informational comments relabels the same false positives without removing them from the review surface. Iterating on few-shot examples against live pull requests is the right improvement technique executed in the wrong environment: every intermediate prompt version ships its errors to real developers. Filtering on the model's self-stated confidence fails because that confidence is poorly calibrated, so the filter passes plenty of false positives while the flawed criteria remain untouched.

See Anthropic's guidance on prompt engineering and being clear and direct for how explicit criteria and targeted examples raise precision once the category is being rebuilt.

### 도메인

Prompt Engineering & Structured Output

## 질문 19

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The web search subagent sometimes experiences connection timeouts and sometimes runs queries that legitimately match nothing. Which TWO reporting behaviors let the coordinator respond correctly to each outcome? (Select TWO.)


**A(정답).** Return timeouts as errors carrying structured context (failure type, attempted query) so the coordinator can decide whether to retry.

**설명**

This is correct because a timeout means the search never completed, so the data may still exist. Structured error context gives the coordinator what it needs to choose between retrying, rephrasing the query, or proceeding with a coverage gap annotation.

**B(정답).** Return a query that completed with zero matches as a success carrying an empty result set, since no matches is a valid finding.

**설명**

This is correct because a search that executed successfully and found nothing conveys real information: the topic may simply lack coverage. Marking the outcome as a success with empty results lets the coordinator accept the finding rather than wasting effort on a retry decision.

**C.** Map both timeouts and zero-match queries to one uniform empty-response status so the coordinator's downstream handling stays simple.

**설명**

This conflates two semantically different outcomes. If a timeout looks identical to a legitimate empty result, the coordinator cannot know whether to retry the source or accept that no data exists, and failures are silently suppressed as facts.

**D.** Treat any empty result set as a failure and have the subagent retry with broadened queries until at least one match is returned.

**설명**

This is the reverse conflation: a successful query with zero matches is not an error. Forcing retries until something matches wastes resources and can pull in irrelevant results just to satisfy the retry loop, degrading report quality.

### 전반적인 설명

The core distinction here is between an access failure (the search never ran to completion, so the answer is unknown) and a valid empty result (the search completed and the answer is genuinely "nothing matched"). These require opposite responses from a coordinator: an access failure demands a recovery decision such as retry with backoff, a modified query, or an annotated coverage gap; an empty result is itself a finding that should flow into synthesis as-is.

Anthropic's own tooling models this distinction explicitly. For the Web search tool, an execution problem is surfaced as a web_search_tool_result whose content is an error object with a specific code such as too_many_requests or unavailable, while a successful search with no matches returns an empty content list rather than an error. For client-executed tools, the guidance is parallel: set is_error: true only when execution actually failed, and make the error message actionable (for example, "Rate limit exceeded. Retry after 60 seconds") so the model or coordinator can recover without guessing. Collapsing both outcomes into one uniform status destroys exactly the signal a recovery decision depends on, and treating every empty result as a failure invites wasteful retry loops that can only "succeed" by dragging in irrelevant matches.

The mental model for subagent design: never mark a failure as a success (silent suppression hides broken infrastructure), and never mark a success as a failure (it turns real findings into phantom errors). Propagate each outcome honestly, with enough structured context that the coordinator can act on it. See the Web search tool documentation and Handling tool calls for the documented error and empty-result shapes.

### 도메인

Context Management & Reliability

## 질문 20

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The pipeline delegates work to a parsing subagent and a validation subagent. The validation subagent frequently needs to check single extracted values against the source text and only occasionally needs a full document re-parse. How should its tool access be designed?


**A(정답).** Give it a scoped fetch_source_snippet tool for the frequent value checks and route full re-parsing through the coordinator.

**설명**

This applies the scoped tool access principle: the validation agent gets a narrow cross-role utility for its high-frequency, simple need, while the rare and complex re-parsing task is routed to the agent that specializes in it. The validation agent's tool inventory stays small and role-relevant, which keeps its tool selection reliable.

**B.** Grant it the parsing agent's complete toolset so both the frequent checks and the occasional re-parsing stay local.

**설명**

Duplicating another agent's full toolset expands the validation agent's inventory well beyond its role, which degrades tool selection reliability. Agents given tools outside their specialization tend to misuse them, so this trades a small routing cost for a persistent selection problem.

**C.** Merge the validation agent into the parsing agent so the question of cross-role tool access never arises.

**설명**

Merging the two roles removes the specialization that made each agent reliable in the first place, producing one agent with a larger combined toolset and two distinct jobs. This solves an allocation question by abandoning the architecture rather than by scoping tools appropriately.

**D.** Route both the snippet checks and the full re-parsing requests through the coordinator, keeping its toolset free of document access.

**설명**

Routing every high-frequency snippet check through the coordinator adds a delegation round trip to an operation the validation agent performs constantly. The recommended pattern is to provide limited cross-role tools for exactly these frequent simple needs, reserving coordinator routing for complex or rare operations.

### 전반적인 설명

Tool allocation in multi-agent systems is an architectural control, not a prompting problem. An agent selects tools more reliably from a small, role-relevant set than from a large catalog, and tools outside its specialization invite misuse simply by being available. The design pattern has two parts: scoped tool access (each subagent holds only the tools its role requires) and limited cross-role utilities for needs that are frequent but simple. A validation agent that constantly verifies extracted values against source text has exactly such a need, so a constrained fetch_source_snippet tool belongs in its set; a full re-parse is rare and complex, so it belongs with the parsing specialist, reached through the coordinator.

The tradeoff being managed is between routing overhead and selection reliability. Sending every snippet lookup through the coordinator would keep the validation agent's toolset pristine but would tax the system's most common operation with an unnecessary delegation hop. Conversely, copying the parsing agent's entire toolset into the validation agent eliminates the hop but bloats its inventory, and an oversized inventory is precisely what degrades tool choice. Merging the agents dissolves the specialization boundary entirely, recreating the overloaded single-agent design that subagent delegation exists to avoid. The scoped-tool-plus-narrow-utility answer keeps frequent operations cheap and rare operations correctly routed.

The same principle underlies constrained tool alternatives more broadly, such as replacing a general fetch_url with a validated load_document: capability is shaped at the interface level so undesired behavior is structurally impossible rather than merely discouraged. See Subagents in the Claude Agent SDK and How we built our multi-agent research system for how tool scoping shapes agent reliability in practice.

### 도메인

Tool Design & MCP Integration

## 질문 21

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The pipeline downloads batch results as a .jsonl file and matches each result line to its source document by line position; some extractions end up attached to the wrong records. What is the correct correlation design?


**A(정답).** Assign each request a unique custom_id derived from the document identifier at submission and match results on that field.

**설명**

This is correct. The custom_id field is developer-provided and exists precisely to correlate each batch result back to its originating request. Because result order is not guaranteed to match submission order, custom_id is the documented mechanism for reliable matching.

**B.** Poll processing_status until the batch reports ended before downloading results, since positional matching is only reliable once every request has finished.

**설명**

Waiting for processing_status to reach ended is necessary before results are available, but it does not make positional matching safe. Result order is not guaranteed to match request order even in a fully completed batch, so this leaves the mismatch bug in place.

**C.** Split each nightly run into smaller batches so that results within any single batch preserve the order of the submitted requests.

**설명**

Result ordering is not guaranteed for any batch, regardless of its size. Smaller batches add submission and polling overhead without changing the fundamental fact that positional matching is unsupported.

**D.** Sort the downloaded results file by the message id contained in each result so the lines align with the original submission order.

**설명**

The message id in a successful result is generated by the API and has no relationship to submission order, so sorting by it cannot reconstruct the original sequence. Errored, canceled, or expired results also contain no message at all, making this scheme break down on any failure.

### 전반적인 설명

The Message Batches API is a fire-and-forget asynchronous system: you submit a requests array, the batch processes over up to 24 hours, and results are eventually streamed back as a .jsonl file. The documentation is explicit that results may be returned in any order, not necessarily the order in which requests were submitted. Positional matching (line number, array index) is therefore meaningless, and applications must correlate each result back to its request explicitly.

The mechanism designed to close that gap is custom_id. Each item in the submitted requests array carries a developer-provided custom_id (unique within the batch, 1 to 64 characters of letters, digits, hyphens, and underscores) alongside its params. Every line of the results file echoes that custom_id next to its result object, so deriving the identifier from your own document key (for example doc-invoice-2024-001) gives you a durable join key between your source records and the extractions. It also makes failure handling clean: a result can be succeeded, errored, canceled, or expired, and custom_id tells you exactly which documents to fix and resubmit without reprocessing the successes.

The alternatives all misunderstand where ordering guarantees live. Sorting by message.id fails because that identifier is generated at processing time and absent from non-succeeded results. Polling processing_status until ended is required before downloading, but completeness does not create ordering. And shrinking batch size changes nothing, since no batch of any size guarantees result order. See Batch processing and the Create a Message Batch reference.

### 도메인

Prompt Engineering & Structured Output

## 질문 22

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The team adds a weekly market-brief workflow: retrieve the same five sources, summarize each, and assemble a fixed-format report. The steps never vary across runs. Which decomposition approach fits this workflow?

**A.** Run an autonomous agent loop that decides its own steps each week, stopping when it judges the brief complete.

**설명**

Autonomous agents fit open-ended problems where the number of steps cannot be predicted and a path cannot be hardcoded. A fully predictable weekly brief gains no benefit from autonomy while inheriting its higher cost and risk of compounding errors.

**B.** Handle the whole brief in a single comprehensive request so all summarization decisions share one context.

**설명**

A single large request forgoes decomposition entirely, forcing one call to juggle retrieval summaries and report assembly at once. Prompt chaining exists precisely to avoid this: splitting the work into simpler sequential calls trades a little latency for higher accuracy on each step.

**C.** Have the coordinator generate the subtask list dynamically at run time based on what the initial retrieval reveals.

**설명**

Dynamic subtask generation (the orchestrator-workers pattern) is meant for tasks whose subtasks cannot be predicted ahead of time. Here the sources, steps, and output format are identical every week, so paying the extra cost and unpredictability of dynamic decomposition buys nothing.

**D(정답).** Implement a fixed prompt chain where each step consumes the prior step's output, with programmatic gates between steps.

**설명**

This workflow decomposes cleanly into fixed, known-in-advance subtasks, which is exactly the case prompt chaining is designed for. Each call becomes simpler and more accurate, and programmatic gates between steps can verify the pipeline stays on track.

### 전반적인 설명

The core selection rule is to match the control-flow structure to the task's uncertainty profile. Anthropic distinguishes workflows, where LLM calls are orchestrated through predefined code paths, from agents, where the model dynamically directs its own process, and recommends the simplest structure that works because added agentic flexibility costs latency, money, and predictability. A weekly brief with the same five sources and the same output format has zero step uncertainty, so a prompt chain is the right fit: each step consumes the previous step's output, every call is smaller and easier to get right, and programmatic gates between steps can deterministically verify intermediate results before the pipeline continues.

The dynamic alternatives solve a different problem. The orchestrator-workers pattern exists for tasks where the required subtasks are not predefined and must be chosen per input; applying it to a fixed weekly routine adds a run-time planning step that can only reproduce, or drift from, a plan you already know. An autonomous agent loop goes further, letting the model decide when it is done, which is appropriate when the number of steps is genuinely unpredictable and you have sufficient trust in the model's decisions, not when the steps are the same every run. And collapsing everything into one comprehensive request abandons decomposition altogether, reintroducing the attention and accuracy problems that splitting the task was meant to solve.

The mental model: reserve dynamic decomposition for the research system's open-ended topic investigations, where intermediate findings determine the next subtask, and use fixed pipelines for the repeatable, templated work around them. See Building Effective Agents for Anthropic's guidance on prompt chaining, orchestrator-workers, and when each applies.

### 도메인

Agentic Architecture & Orchestration

## 질문 23

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : Compliance auditors find the agent occasionally processes refunds for orders older than 90 days, despite explicit system prompt instructions forbidding this. These refunds cannot be reversed. Which design guarantees the policy while preserving autonomous handling of in-policy refunds?

**A.** Add a PostToolUse hook that detects refunds on orders past 90 days after execution and automatically issues a compensating reversal transaction.

**설명**

PostToolUse hooks fire only after the tool has already run, so the prohibited refund executes before the hook sees it. The scenario states these refunds cannot be reversed, so after-the-fact detection cannot satisfy the compliance requirement.

**B.** Remove the process_refund tool from the agent's configured MCP tools entirely and instruct it to route every refund request to a human agent.

**설명**

Removing the tool does prevent violations, but it removes the agent's ability to process any refund at all, so in-policy refunds must also go to a human. This fails the stated requirement to keep in-policy refunds autonomous when a targeted mechanism can intercept only the violating subset of calls.

**C(정답).** Add a PreToolUse hook that blocks process_refund calls for orders past 90 days and redirects those cases to the escalate_to_human workflow.

**설명**

A PreToolUse hook runs as code before the tool executes, so a violating refund call can be stopped deterministically every time. Redirecting the blocked case to escalation preserves customer resolution while making the policy impossible for the model to bypass, and refunds within the 90-day window continue to run autonomously.

**D.** Move the 90-day rule into the process_refund tool description and reinforce it with few-shot refusal examples in the system prompt.

**설명**

Tool descriptions and few-shot examples improve the probability that the model follows the rule, but compliance remains probabilistic rather than guaranteed. The auditors' findings show that instruction-based approaches are already failing occasionally, which is exactly the failure mode this option cannot eliminate.

### 전반적인 설명

The core distinction being tested is between programmatic enforcement and prompt guidance. Instructions in a system prompt or tool description influence the model's token-by-token decisions, which makes them probabilistic: they raise compliance rates but never reach 100%. A PreToolUse hook is ordinary code that intercepts the outgoing tool call before it executes. It can inspect the arguments, compare the order date against the 90-day threshold, and deny the call while feeding a message back that steers the agent toward escalate_to_human. Because the check lives outside the model, no amount of unusual phrasing, context drift, or reasoning error can slip a violating call past it.

The mental model to hold is that hooks and prompts operate on different layers. Prompts shape what the model tries to do; hooks constrain what the system allows to happen. When a failure has financial, legal, or safety consequences and cannot be undone, the guarantee must live in the enforcement layer. Prompts remain the right tool for preferences and nuance, where flexibility matters more than certainty.

Timing is why the PostToolUse variant fails here: it observes results after execution, which is valuable for normalizing data or triggering follow-up work, but it cannot prevent an action, and the stem states these refunds are irreversible. Removing the process_refund tool from the agent's configured MCP tools is the opposite overcorrection: it achieves the guarantee by eliminating the capability entirely, which routes every refund, including in-policy ones, to a human and fails the stated requirement to keep in-policy refunds autonomous. The hook is the design that blocks precisely the violating subset while leaving normal operation untouched.

See Claude Code hooks reference and Get started with hooks for how PreToolUse interception and blocking decisions work.

### 도메인

Agentic Architecture & Orchestration

## 질문 24

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : Handling a billing dispute, the coordinator calls get_customer and lookup_order, then spawns an analysis subagent prompted "Assess refund eligibility for this dispute." The subagent responds that no customer or order data was provided. How should you fix this?

**A.** Reference the tool_use IDs of the coordinator's earlier calls in the delegation prompt so the subagent can retrieve those results.

**설명**

There is no mechanism for a subagent to look up parent tool results by tool_use ID. Those IDs correlate tool calls with tool results inside a single conversation; they do not create a cross-context retrieval channel between parent and subagent.

**B.** Add get_customer and lookup_order to the subagent's AgentDefinition allowed tools so it can access the retrieved records.

**설명**

Tool access controls what the subagent can do, not what it already knows. Even with those tools, the subagent still would not see the coordinator's earlier tool results; it would have to re-fetch everything from scratch, which duplicates work rather than passing the existing findings.

**C.** Spawn the analysis subagent in a subsequent turn so the coordinator's completed tool results are forwarded along with its history.

**설명**

No such deferred forwarding mechanism exists. The Agent tool never transfers the parent's conversation history to a normal subagent, whether during the same turn or in a later one; the delegation prompt is the only documented channel.

**D(정답).** Include the retrieved customer and order data directly in the subagent's delegation prompt.

**설명**

This is correct. A non-fork subagent starts with a fresh context window and never sees the parent's conversation history or prior tool results. The Agent tool's prompt string is the only channel for passing the coordinator's findings, so the customer and order details exist for the subagent only if they are written into that prompt.

### 전반적인 설명

The mental model to hold is that a subagent is a separate agent instance, not a continuation of the coordinator's conversation. When the coordinator emits an Agent tool call, the spawned subagent's context window starts fresh: it receives its own system prompt, tool definitions, and the delegation prompt string, but nothing from the parent's message history, including the results of get_customer and lookup_order. A prompt like "Assess refund eligibility for this dispute" refers to material the subagent has literally never seen, so it correctly reports that no data was provided.

This isolation is a deliberate tradeoff, not a limitation to work around. Keeping each subagent's intermediate tool calls and verbose outputs inside its own context prevents the coordinator's window from filling with raw records, and it forces handoffs to be explicit and inspectable. The cost is that the coordinator must curate what each subagent needs and place it directly in the prompt, ideally as structured data (customer ID, order details, dispute facts) rather than a vague back-reference. The one documented exception is a forked subagent, which inherits the parent conversation up to the branch point; ordinary invocations do not.

The distractors fail for the same underlying reason: they each imagine a hidden channel between parent and subagent that does not exist. There is no end-of-turn or next-turn history forwarding, no tool_use ID lookup across contexts, and granting the subagent the MCP tools would only let it re-fetch data at extra cost rather than deliver the coordinator's existing findings. See Subagents in the SDK and Create custom subagents for the full inheritance rules.

### 도메인

Agentic Architecture & Orchestration

## 질문 25

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : Reviewers dismiss roughly a third of the inconsistency findings produced by the document-analysis subagent, but nobody can tell which detection behaviors generate the false positives. What change best enables systematic analysis of the dismissals?


**A(정답).** Add a detected_pattern field to the finding schema recording which rule or signal triggered each flag, then group dismissed findings by that value.

**설명**

This is correct because a machine-readable pattern field on every finding lets dismissed findings be aggregated by the trigger that produced them. Once dismissals cluster around specific patterns, the team knows exactly which detection behaviors to fix or disable, turning anecdotal complaints into targeted prompt and criteria improvements.

**B.** Store the full reasoning transcript alongside each finding so an engineer can read through dismissed cases and infer common causes manually.

**설명**

Raw transcripts are unstructured, so identifying recurring causes requires slow manual reading that does not scale and cannot be aggregated or trended automatically. A structured pattern field captures the same diagnostic signal in a form queries and dashboards can use directly.

**C.** Add a self-rated confidence field to each finding and suppress low-confidence flags so reviewers only see findings the model considers reliable.

**설명**

Self-rated confidence is poorly calibrated and filtering by it hides findings rather than explaining dismissals. It does not reveal which detection behaviors cause false positives, so the underlying patterns remain undiagnosed even if fewer flags reach reviewers.

**D.** Ask reviewers to enter free-text dismissal notes in the review tool and periodically summarize the notes to spot recurring themes.

**설명**

Free-text notes shift diagnostic work onto humans and produce inconsistent, hard-to-aggregate data; reviewers often skip or abbreviate them. The finding itself already knows what triggered it, so recording the pattern at generation time is more reliable than reconstructing it from reviewer prose.

### 전반적인 설명

When humans repeatedly dismiss automated findings, the operational question is not just how many are false positives but which detection behaviors produce them. The designed answer is to make each finding carry its own diagnostic metadata: a detected_pattern field in the output schema that names the rule, heuristic, or signal that triggered the flag. Because the field is part of the structured output, every finding arrives with it populated, and dismissed findings can be grouped, counted, and trended by pattern. When one pattern accounts for most dismissals, the team has a precise target: refine the criteria for that pattern, add contrasting few-shot examples, or disable the category while it is repaired.

The mental model is that a finding should be a record, not a remark. Anthropic's structured outputs guarantee that fields defined in the JSON Schema are present and typed, so adding detected_pattern (as a string or an enum of known trigger types, listed in required and with additionalProperties set to false on the object) makes the diagnostic signal a first-class, queryable part of every finding rather than something reconstructed after the fact. See Structured outputs for the supported schema features.

The alternatives all fail the aggregation test. Self-rated confidence is weakly calibrated and suppressing flags hides symptoms without diagnosing causes. Full reasoning transcripts contain the answer in principle but only yield it through manual reading, which does not scale to hundreds of dismissals. Reviewer free-text notes depend on busy humans consistently articulating causes the generating model already knew at flag time. Structured, generation-time pattern tagging is cheaper, more consistent, and directly analyzable.

### 도메인

Prompt Engineering & Structured Output

## 질문 26

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : A synthesis agent in a multi-agent research system frequently flags differing statistics as contradictions, yet reviewers find most flagged pairs are not genuine conflicts. Subagents currently output only each value and a source name. Which structured-output requirement best supports accurate reconciliation?


**A(정답).** Require subagents to include publication or data-collection dates and methodological context alongside each claim.

**설명**

This is correct because apparent contradictions between credible sources commonly stem from different measurement dates or different methodologies rather than genuine disagreement. Carrying dates and methodological context as structured metadata gives the synthesis agent the evidence to distinguish a temporal or methodological difference from a real conflict, fixing the entire class of error at the source.

**B.** Instruct the synthesis agent to prefer the figure from whichever source it judges more authoritative and drop the other.

**설명**

This silently selects one value and discards information, which is an anti-pattern for handling differing source data. It also does nothing to reveal why the figures differ, so the underlying misinterpretation remains possible.

**C.** Add a synthesis prompt rule to interpret any pair of differing figures as a growth trend rather than a contradiction.

**설명**

This swaps one blanket assumption for another: some differing figures really are contradictions from conflicting methodologies or errors. Without dates or methodological context in the data, the synthesis agent has no basis to distinguish a trend from a genuine conflict.

**D.** Have the coordinator average conflicting numeric values into a single figure before passing them to synthesis.

**설명**

Averaging invents a number that no source ever reported, which corrupts a cited research product. It also treats every difference as a disagreement to be split, when the two figures may both be accurate for their respective contexts.

### 전반적인 설명

Multi-agent research systems compress information at every handoff, and whatever is not carried as structured metadata is effectively lost to downstream agents. A synthesis agent sees only what upstream subagents put in their outputs; if a claim arrives as a bare value plus a source name, the agent has no way to know that one figure was measured in a different year, or with a different methodology, than its counterpart. The result is a predictable failure mode: temporal and methodological differences masquerading as contradictions. Requiring subagents to emit publication or data-collection dates and methodological context with each claim gives synthesis the evidence it needs to reason correctly, for example noting that a figure from 2023 and a figure from 2024 likely reflect growth rather than disagreement.

The deeper design principle is that provenance and temporal context must travel as data, not be reconstructed later by instruction or heuristic. Anthropic's guidance on grounded, cited responses reflects the same mental model: pair content with its source metadata so downstream reasoning can attribute and qualify claims accurately (see Citations). Approaches that pick the more authoritative source, average the values, or blanket-reinterpret every difference as a trend all try to resolve ambiguity without the information that would actually resolve it. Silent selection and averaging destroy data a coordinator might need for deliberate reconciliation, and a hard-coded reinterpretation rule would mask genuine conflicts arising from methodology differences or errors. Adding the missing metadata is the only change that lets the system distinguish those cases on the merits.

### 도메인

Context Management & Reliability

## 질문 27

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The report-generation subagent attempts an Edit to update one paragraph of a drafted report, but the call fails because its anchor text appears in four separate sections of the file. What is the reliable fallback?

**A.** Have the agent delete the other occurrences of the anchor text so the remaining match is unique.

**설명**

Removing legitimate content from the report just to satisfy a tool's matching requirement corrupts the document. The other three sections presumably contain that text for a reason, and destroying them trades a tooling inconvenience for data loss.

**B.** Have the agent retry Edit with a shorter anchor string until the match resolves to one location.

**설명**

Shortening the anchor makes the match less specific, which can only produce the same number of matches or more, never fewer. It moves in exactly the wrong direction and cannot resolve the ambiguity.

**C.** Have the agent run a sed replacement through Bash, since stream editing handles repeated text.

**설명**

A sed command applied to a file with repeated text will either change every occurrence or depend on fragile positional addressing. Bash is meant for tasks the dedicated tools cannot handle, and this file modification is squarely covered by the built-in file tools.

**D(정답).** Have the agent Read the full report, apply the change, then Write the complete updated content.

**설명**

This is the documented fallback when Edit cannot satisfy its unique-match requirement. Reading the whole file and writing back the modified version bypasses text matching entirely, so the repeated anchor text no longer matters, at the cost of rewriting the entire file.

### 전반적인 설명

The Edit tool works by exact string replacement: the agent supplies a snippet of existing text as an anchor, and the tool substitutes new text at that location. This design makes edits precise and reviewable, but it carries a strict precondition: the anchor must match exactly one place in the file. Reports and other generated documents often contain repeated boilerplate (section headings, recurring citation strings, templated phrases), and when the anchor appears multiple times, Edit refuses to act rather than guess which occurrence was intended.

The standard recovery is to switch to full-file operations: use Read to load the entire file, apply the modification to the content, and use Write to save the complete updated version. Because Write overwrites the whole file, no text matching is involved and the repetition that defeated Edit is irrelevant. The trade-off is cost and blast radius: the agent must carry the full file through context and rewrite everything, which is why Edit remains the preferred tool whenever a unique anchor exists.

The other approaches fail on their own terms. A shorter anchor is strictly less specific, so it can never reduce the match count; the opposite technique (expanding the anchor with surrounding context) can sometimes work, but the reliable, documented fallback is Read plus Write. Routing the change through Bash and sed replaces a controlled file operation with stream editing that either touches every occurrence or relies on brittle line addressing. Deleting the other occurrences mutilates the document to appease the tool, which inverts the relationship between the agent and its output. See the Claude Code tools reference for the roles of Read, Edit, and Write.

### 도메인

Tool Design & MCP Integration

## 질문 28

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Your .mcp.json defines both a GitHub server and a coverage-analysis server. A teammate wants to add a pipeline step that activates each server separately as needed. How should you respond?

**A.** Explain that servers stay dormant until the system prompt references their tools by name, which triggers on-demand discovery.

**설명**

This is incorrect. Discovery is driven by the server connection, not by mentions in the system prompt. Referencing a tool name in a prompt does not trigger any connection or discovery behavior; the tools are already discovered and listed once the server connects.

**B.** Tell the teammate the agent must call a listing tool on each server mid-session to load that server's tools before it can use them.

**설명**

This is incorrect. Capability discovery, including the tools/list request, is performed by the Claude Code host when the server connects, not by the agent as an explicit mid-session step. The agent simply sees the discovered tools in its available tool set without having to fetch them itself.

**C(정답).** Explain that tools from all configured servers are discovered at connection time and available simultaneously; the agent selects among them by description.

**설명**

This is correct. When Claude Code connects to MCP servers, it sends discovery requests to each one, and the tools from every connected server become available to the agent at the same time. No activation or switching step is needed; the model chooses among the combined tool set based on tool names and descriptions.

**D.** Advise that only one server's tools can be loaded per session, so the pipeline needs to run a separate Claude Code invocation for each configured server.

**설명**

This is incorrect. There is no one-server-per-session restriction; multiple MCP servers can be configured and connected in the same session, with all their tools available together. Splitting the pipeline into separate invocations would add complexity to solve a limitation that does not exist.

### 전반적인 설명

The mental model for MCP integration in Claude Code is that the host, not the agent, owns discovery. When a session starts, Claude Code connects to every configured server (project-scoped .mcp.json and user-scoped configuration alike) and issues capability discovery requests such as tools/list, prompts/list, and resources/list against each one. The results are merged into a single tool inventory, with each tool namespaced as mcp__<server-name>__<tool-name> so a GitHub server's list_issues becomes mcp__github__list_issues. From the model's perspective there is no concept of an active server: every discovered tool sits in one flat catalog, and selection happens the same way it does for built-in tools, by reading names and descriptions.

This design is why an activation step in the pipeline is unnecessary and counterproductive. It would add orchestration logic to gate something the protocol already handles, and it would prevent the agent from combining tools across servers in one reasoning pass, for example correlating a pull request diff from the GitHub server with a coverage report from the coverage server in the same review. Servers can even update their tool lists dynamically through list_changed notifications without reconnecting.

One boundary worth keeping precise: available is not the same as permitted. Discovered MCP tools still require permission before Claude can call them; in automated CI runs this is typically handled through allowedTools entries, including wildcards like mcp__github__*. See Agent SDK MCP documentation and Claude Code MCP documentation for the discovery and permission model.

### 도메인

Tool Design & MCP Integration

## 질문 29

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : An engineer needs the backend MCP server to load for every teammate who clones the repository, while a prototype notification server should load only for that engineer. How should the two servers be configured?

**A.** Register both servers in ~/.claude.json and have each teammate copy the backend server entry into their own configuration manually.

**설명**

This makes shared infrastructure a manual replication chore: every teammate must copy the entry by hand, and configurations drift as the server definition evolves. Version-controlled .mcp.json exists precisely so team tooling arrives with the clone.

**B.** List the backend server in CLAUDE.md so it loads for every teammate, and add the prototype to the project root .mcp.json.

**설명**

CLAUDE.md provides project context and instructions to the model; it does not configure or launch MCP servers. Placing the prototype in .mcp.json also does the opposite of what is needed, sharing the experimental server with the whole team.

**C(정답).** Define the backend server in a .mcp.json file at the project root checked into version control, and register the prototype in ~/.claude.json.

**설명**

This is correct because project-scoped servers in .mcp.json are designed to be committed to version control so every contributor gets the same MCP tooling, while user-scoped entries in ~/.claude.json stay private to one engineer's account. Each server ends up visible to exactly the audience that should have it.

**D.** Define both servers in the project root .mcp.json, labeling the prototype as experimental in its description so teammates know to ignore it.

**설명**

Anything in the project .mcp.json is distributed through version control, so the prototype would load for every teammate regardless of how its description labels it. A description is documentation, not a scoping mechanism.

### 전반적인 설명

MCP server configuration in Claude Code is scoped by location, and the location determines the audience. A server defined in .mcp.json at the project root is project-scoped: the file is meant to be committed to version control, so anyone who clones the repository gets the same tool set with no manual setup. A server registered in ~/.claude.json lives in the user's home directory, is never shared through the repository, and is the right home for personal or experimental servers that should follow one engineer rather than the team.

This split is a deliberate design tradeoff. Team tooling needs a single source of truth that evolves with the codebase, which is exactly what a version-controlled file provides; personal experiments need isolation so a half-built prototype never appears in a teammate's session. The protocol even accounts for the trust implications of shared configuration: project-scoped servers from .mcp.json require user approval in interactive sessions before they run, protecting engineers from cloned repositories silently launching processes. Secrets stay out of the repository through environment-variable expansion such as ${API_TOKEN} inside .mcp.json.

The failure modes of the alternatives follow from the same model. Anything placed in the project file ships to everyone, so a description label cannot un-share a prototype. Keeping shared servers in per-user files replaces automatic distribution with manual copying that drifts. And CLAUDE.md supplies instructions and context to the model; it plays no role in MCP server registration. See Claude Code MCP documentation and the MCP quickstart for the scope reference.

### 도메인

Tool Design & MCP Integration

## 질문 30

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The report-generation subagent formats findings inconsistently: citations appear inline in some reports and as footnotes in others, and field order shifts between runs despite detailed formatting instructions. What most reliably produces a consistent format?

**A.** Set the sampling temperature to zero so the subagent renders every finding in the same deterministic layout.

**설명**

This is incorrect because temperature controls token sampling randomness, not the model's understanding of the required format. A zero temperature can still produce inline citations on one document and footnotes on another because the format itself was never demonstrated.

**B(정답).** Add three to five realistic examples in example tags showing the exact desired finding format and citation style.

**설명**

This is correct because examples are the most effective way to steer output format when instructions alone produce variable results. A small set of relevant, structured examples wrapped in example tags demonstrates the exact pattern to follow, and the model generalizes that pattern to new findings.

**C.** Restate the formatting rules in stronger imperative language at both the top and bottom of the subagent's prompt.

**설명**

This is incorrect because the instructions are already detailed and still yield inconsistent output; repeating them with more emphasis does not add operational content. Abstract format descriptions remain open to interpretation in a way that concrete demonstrations are not.

**D.** Add a post-processing step that uses regular expressions to detect each citation variant and rewrite it into canonical form.

**설명**

This is incorrect because regex normalization patches symptoms downstream rather than fixing the generation behavior. Every new citation variant the model invents requires another pattern, making the pipeline fragile and perpetually behind the failure it is compensating for.

### 전반적인 설명

Anthropic documents examples as one of the most reliable ways to steer Claude's output format, tone, and structure. When detailed prose instructions still produce variable formatting, the fix is few-shot prompting: 3 to 5 examples that are relevant (they mirror the actual use case, here a research finding rendered in the exact required layout), diverse (they cover the citation variations that actually occur, such as inline citations versus bibliography references), and structured (wrapped in <example> tags, with multiple examples inside an <examples> block, so Claude can distinguish demonstrations from instructions).

The mental model is that a format description tells the model what you want, while an example shows it; showing removes the interpretive gap that lets the model choose between inline and footnote styles on different runs. This is why Anthropic's consistency guidance pairs precise format definitions with concrete demonstrations of the desired output rather than relying on abstract rules alone.

The alternatives fall short in characteristic ways. Louder repetition of instructions that already failed adds emphasis without adding a decision rule. Temperature zero makes token selection deterministic within a run but does not teach the format, so different documents can still elicit different layouts. Regex post-processing is a brittle compensation layer: it must anticipate every variant the model might emit, and it grows without bound instead of stabilizing the source of the output.

See Prompt engineering guidance and Increase output consistency.

### 도메인

Prompt Engineering & Structured Output

## 질문 31

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : You add a verification pass that checks each drafted resolution against refund and escalation policy before it executes, routing risky drafts to a human. How should the verifier's output be designed for calibrated routing?

**A.** Return a single approve or reject verdict per draft so the routing logic stays deterministic and simple to implement.

**설명**

This is incorrect because a binary verdict discards the calibration signal routing needs. Without per-finding confidence and severity, every flagged draft is treated identically, so humans review low-risk drafts while the threshold for genuinely risky ones cannot be tuned.

**B.** Have the same session that drafted the resolution re-check it and flag anything it now judges a likely policy violation.

**설명**

This is incorrect because a model reviewing within its own generation context retains its reasoning and is less likely to challenge its own decisions. An independent verification pass without that context catches issues self-review rationalizes away.

**C.** Instruct the verifier to report only high-confidence, high-severity policy violations so routing receives an already-filtered signal.

**설명**

This is incorrect because telling the finding pass to filter itself suppresses uncertain findings before routing ever sees them, reducing recall. Claude tends to follow such instructions literally, so borderline risky drafts get silently approved.

**D(정답).** Have the verifier report every potential issue with a confidence level and severity for each, applying routing thresholds downstream.

**설명**

This is correct because separating coverage from filtering preserves both recall and routing precision. The verifier surfaces everything it notices, and each item carries a confidence and severity that a downstream step can use to decide which drafts need human eyes.

### 전반적인 설명

The design principle here is separating finding from filtering. A verification pass has two distinct jobs that pull in opposite directions: noticing everything that might be wrong (coverage) and deciding what matters enough to act on (filtering). When both jobs are collapsed into one prompt, instructions like only report high-confidence violations get followed literally: the model still investigates thoroughly, but it suppresses uncertain findings, and those never reach the routing logic at all. Anthropic's guidance for review-style harnesses is explicit on this point: ask the model to report every issue it finds, including uncertain and low-severity ones, and attach a confidence level and estimated severity to each so a downstream stage can rank and route them. See Prompting Claude Sonnet 5.

The mental model is a two-stage pipeline: stage one maximizes recall and annotates each finding with self-reported confidence and severity; stage two applies thresholds in code, where they are tunable, auditable, and consistent. For a support agent this means a draft refund flagged with a low-confidence, high-severity policy concern can still route to a human, while a low-severity formatting nitpick auto-approves. Pre-filtering inside the verifier makes those thresholds invisible and unadjustable. Same-session self-review fails differently: the model carries the reasoning that produced the draft and tends to confirm its own conclusions, which is why independent verification instances catch more subtle problems. A bare approve/reject verdict is the weakest design of all, since it throws away the graded signal that makes routing calibrated rather than all-or-nothing.

### 도메인

Prompt Engineering & Structured Output

## 질문 32

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : A parsing subagent in this pipeline sometimes fails on corrupted files, OCR timeouts, and unsupported layouts. Every failure currently returns a bare "extraction failed" status, so the coordinator can only retry blindly. Which error-reporting design enables intelligent recovery decisions?

**A.** Normalize every failure to a single retry-eligible status so the coordinator applies one uniform recovery path.

**설명**

Collapsing all failures into one status discards the very context recovery decisions depend on. A corrupted file will never succeed on retry, while a timeout might; a uniform retry path wastes resources on unrecoverable errors and misses better alternatives.

**B.** Halt the batch on the first failure and surface the raw exception to an operator for manual triage of the document.

**설명**

Terminating the whole workflow on a single failure is an anti-pattern that loses all partial progress and turns routine, recoverable errors into operator interruptions. The coordinator should continue with the remaining documents and handle or annotate the failure.

**C(정답).** Return the failure type, the step attempted, any partial extraction results, and possible alternative approaches.

**설명**

This is correct because structured error context, including which document and step failed, gives the coordinator everything it needs to choose an appropriate recovery action: retry a timeout, route a corrupted file to a different parser, or proceed with partial results while annotating the gap. Generic statuses force the coordinator to guess, while descriptive, actionable error information enables self-correction.

**D.** Return an empty extraction marked as successful so downstream validation and delivery continue without interruption.

**설명**

This is silent error suppression, a documented anti-pattern. Marking a failure as success makes the coordinator and downstream systems believe the document genuinely contained no extractable data, hiding the failure and corrupting accuracy metrics.

### 전반적인 설명

The mental model for error propagation in agentic pipelines is that an error is data for a decision, not just a stop signal. When a subagent or tool step fails, the coordinator faces a real choice: retry, switch to an alternative approach, skip the item and annotate the gap, or escalate. It can only make that choice well if the error carries enough context: the failure type (a timeout is retryable, a corrupted file is not), what was attempted, any partial results already produced, and suggested alternatives. Anthropic's guidance on handling tool results reflects the same principle at the API level: failed tool executions are returned as tool_result blocks with is_error: true, and the error content should be instructive, stating what went wrong and what to try next, rather than a bare "failed" message. See Handle tool calls and results.

The distractors map to the three classic anti-patterns. Silent suppression (empty result marked as success) conflates "the extraction broke" with "the document contained nothing," which poisons downstream accuracy measurement and hides failures from monitoring entirely. Generic normalization keeps the coordinator's code simple at the cost of the distinctions that matter; treating a permanently corrupted file the same as a transient timeout guarantees wasted retries and missed recovery paths. Halting the entire batch on one failure destroys all partial progress and escalates routine errors that the system could handle autonomously; the resilient design continues with the remaining work and reports coverage gaps.

### 도메인

Context Management & Reliability

## 질문 33

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The document analysis subagent extracts citations through a tool whose input schema is enforced. Reports still contain quotes attributed to the wrong sources and publication years placed in page-number fields. Which TWO actions should you take? (Select TWO.)

**A.** Tighten the input schema with stricter type constraints and mark more fields as required so misplaced values can no longer pass validation.

**설명**

Stricter typing and requiredness still operate only on structure. A wrong year is just as valid an integer as the right year, and marking more fields required can actually increase fabrication when information is absent from the source.

**B(정답).** Add self-check fields to the extraction schema that surface internal inconsistencies, and route flagged extractions to a review step.

**설명**

This is correct because semantic errors are invisible to schema validation. Extracting complementary fields whose values can be compared, and flagging mismatches for review, makes misattributions and transposed values machine-visible where the schema machinery cannot see them.

**C.** Audit and repair the schema definition, since these failures show malformed JSON is slipping past validation undetected.

**설명**

The extractions are syntactically valid and schema conformant; that is exactly why they passed. The problem is semantic, values that are the wrong content in the right shape, which no schema definition can express or catch.

**D(정답).** Keep schema enforcement for its structural guarantees and add a validation layer that cross-checks extracted values against the source document.

**설명**

This correctly acts on the boundary of the guarantee. Schema enforcement ensures the JSON is well formed, required fields are present, and types are correct, but it cannot verify that a year belongs in a year field or that a quote matches its cited source, so a source-grounded check is needed on top.

### 전반적인 설명

The mental model to internalize is that a JSON schema constrains the shape of output, never its meaning. When an extraction runs through tool use, Anthropic's strict tool use documentation is explicit about what is promised: correctly typed arguments, required fields present, a valid tool name, and no schema violations. Nothing in that list says the values are true, mutually consistent, or placed in the field a human would consider correct. A publication year sitting in a page-number field is a perfectly legal integer; a quote attributed to the wrong author is a perfectly legal string.

This division of labor is deliberate. Schema enforcement operates at generation time on token structure, which is cheap and deterministic; semantic correctness requires comparing output against the source material, which is a judgment the schema machinery has no access to. So a production pipeline layers the two: schemas eliminate the entire class of parsing and structural failures by construction, and a downstream validation stage handles semantics, whether by cross-checking extracted values against the document, adding self-check fields (such as extracting both a stated and a calculated value and flagging mismatches with a conflict indicator), or routing low-confidence extractions to review.

The distractors both misplace the failure. Tightening types or requiredness just draws the same structural boundary more sharply; it cannot distinguish the right integer from the wrong one, and over-requiring fields pressures the model to fabricate values when the source lacks them. And blaming malformed JSON gets the diagnosis backwards: these extractions passed validation precisely because they were structurally flawless. See Structured outputs for how the schema mechanisms fit together.

### 도메인

Prompt Engineering & Structured Output

## 질문 34

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

## 질문 35

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : The agent calls escalate_to_human on almost every billing question, even routine ones. The tool descriptions are clear and well-bounded, but the system prompt states: "billing matters are sensitive, so handle escalation with care." What should you change?

**A.** Add a hook that blocks escalate_to_human calls whenever the current conversation concerns a billing topic.

**설명**

A blanket block suppresses the symptom while breaking legitimate escalations, such as a billing customer explicitly asking for a human or a genuine policy gap. Hooks are for enforcing hard business rules, not for compensating for misleading prompt language.

**B(정답).** Revise the system prompt so the wording no longer pairs billing with escalation, letting the tool descriptions govern selection.

**설명**

This is correct because the misrouting originates in the system prompt, not the tools. The sentence verbally links the keyword billing to the concept of escalation, creating an unintended association that overrides otherwise sound tool descriptions; removing that pairing restores the descriptions as the selection signal.

**C.** Expand the escalate_to_human description with billing-specific boundary language so it outweighs the system prompt phrasing.

**설명**

The tool descriptions are already clear and well-bounded, so adding more text to them treats the wrong artifact. It sets up a tug-of-war between the description and the prompt instead of removing the conflicting association at its source.

**D.** Append a system prompt instruction that routine billing questions must be resolved directly and never escalated at first contact.

**설명**

Adding a counter-instruction leaves the original billing-escalation pairing in place, so the context now carries two conflicting signals rather than none. Patches layered over the misleading line remain probabilistic; removing the association at its source is the reliable fix.

### 전반적인 설명

Tool descriptions are the primary mechanism a model uses to select tools, but they do not operate in a vacuum: the system prompt is read alongside them on every turn, and phrasing there can create unintended keyword associations that override even well-written descriptions. A line like "billing matters are sensitive, so handle escalation with care" repeatedly co-locates the word billing with the concept of escalation, so whenever a customer message contains billing language, the model is nudged toward escalate_to_human regardless of what that tool's description says about when escalation is appropriate.

The right mental model is that tool selection is shaped by everything in context, and the debugging question is always: which artifact is actually producing the bad signal? Here the descriptions are already clear, so the fix is to rewrite the offending prompt language, for example stating that billing questions are handled through the normal resolution flow and that escalation follows the criteria in the tool's own description. This removes the conflict rather than layering compensations on top of it.

The alternatives all treat symptoms. Appending a counter-instruction leaves the billing-escalation pairing intact and stacks a contradictory rule on top of it, so the context now carries conflicting signals and behavior stays inconsistent. Enlarging the escalate_to_human description asks one context element to out-shout another, which is unreliable and adds token overhead. A hook that blocks escalation on billing topics converts a probabilistic misroute into a deterministic failure of a different kind: customers who explicitly request a human, or whose case genuinely falls outside policy, can no longer be escalated, which directly undermines the agent's escalation duties. See Tool use with Claude and Writing effective tools for agents for guidance on how descriptions and surrounding context jointly drive tool selection.

### 도메인

Tool Design & MCP Integration

## 질문 36

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The synthesis subagent's drafts frequently attribute claims to the wrong sources. Investigation shows the search and analysis subagents return findings as prose paragraphs with all consulted sources listed at the end. How should subagent outputs be restructured?


**A(정답).** Have each subagent emit structured findings that pair every claim with its source URL, document name, and publication date.

**설명**

This is correct because attribution survives synthesis only when each claim carries its own source metadata in a structured mapping. Prose with a trailing source list forces the synthesis agent to guess which source supports which claim, which is exactly the failure being observed.

**B.** Have each subagent append a deduplicated bibliography of every source it consulted to the end of its summary.

**설명**

A bibliography lists which sources were used but does not connect individual claims to specific sources. The synthesis agent still has to guess the claim-to-source mapping, so misattribution persists.

**C.** Pass the complete raw source documents to the synthesis agent so it can trace each claim back to its origin itself.

**설명**

Forwarding raw documents floods the synthesis agent's context with unprocessed material and asks it to redo the attribution work the upstream agents already performed. This inflates token usage and remains error-prone, since the model must re-match claims to sources.

**D.** Have the coordinator keep a master registry of all sources consulted and attach it to the report during final aggregation.

**설명**

A coordinator-level registry separates attribution from the claims themselves, so the final report can list sources but cannot say which source supports which statement. The mapping must travel with each claim, not sit in a detached list.

### 전반적인 설명

In a multi-agent pipeline, attribution is lost at every handoff unless it is carried in a structured claim-to-source mapping. Each subagent sees only what is passed in its prompt, and the synthesis agent cannot recover provenance that was never encoded: a prose paragraph followed by a source list gives it several claims and several sources with no reliable way to pair them. The fix is to make upstream agents emit structured records where every finding travels with its own metadata (source URL, document name, publication date), so downstream agents preserve the mapping mechanically rather than inferring it.

This mirrors Anthropic's own guidance for multi-document prompts: separate content from metadata using explicit structure, for example wrapping each document in <document> tags with distinct <document_content> and <source> subtags, so the model never has to guess which source belongs to which text. See Prompt templates and variables. Including publication dates in the structured record also prevents temporal differences between sources from being misread as contradictions during synthesis. When the pipeline uses the Messages API's document blocks, the Citations feature applies the same principle: only the document's source content is citable, while title and context carry metadata alongside it.

The alternatives all fail at the same point. A trailing bibliography and a coordinator-held registry both record which sources were used without recording what each source supports, so per-claim attribution is still guesswork. Forwarding raw documents to the synthesis agent discards the upstream agents' work, bloats the synthesis context with unprocessed material, and reintroduces the matching problem it was meant to solve.

### 도메인

Agentic Architecture & Orchestration

## 질문 37

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

## 질문 38

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : Claude Code's implementation of the citation normalizer for the report generator keeps mishandling edge cases (missing authors, duplicate DOIs) despite several rewrites of the prose specification. Which refinement approach most reliably drives progressive improvement?

**A.** Add the full citation formatting specification to CLAUDE.md so every session loads the rules automatically.

**설명**

Incorrect. CLAUDE.md ensures the rules are present in context, but they remain prose instructions that Claude may still interpret inconsistently. Persistent loading of an ambiguous specification does not provide the verification and failure feedback needed for progressive improvement.

**B.** Rewrite the specification with IMPORTANT markers on the edge-case rules so the model prioritizes them.

**설명**

Incorrect. Emphasis markers only raise priority relative to surrounding text and do not resolve the underlying ambiguity of prose rules. The scenario shows prose refinements have already failed, so more emphatic prose does not create the concrete feedback loop that drives correctness.

**C.** Switch to plan mode so the approach is reviewed and approved before any code is written.

**설명**

Incorrect. Plan mode helps scope large or architecturally ambiguous changes before execution, but the problem here is a correctness gap on specific edge cases, not an unclear implementation approach. A reviewed plan still leaves edge-case behavior unverified until something checks it.

**D(정답).** Write a test suite for expected behavior and edge cases first, then share failing test output to iterate.

**설명**

Correct. Test-driven iteration turns vague expectations into concrete, checkable targets: the tests encode the edge cases explicitly, and each failing test gives Claude precise, unambiguous feedback about what to fix next. This produces measurable convergence rather than another round of interpreting prose.

### 전반적인 설명

The recommended technique for this class of problem is test-driven iteration: before implementation, write a test suite that pins down expected behavior, the known edge cases (missing authors, duplicate DOIs), and any performance requirements. Then let Claude implement against the tests and, on each round, share the failing test output. Each failure is a precise, machine-checkable statement of what is still wrong, which is far more actionable than another paraphrase of the requirements.

The mental model is that prose specifications are interpreted while tests are verified. When repeated rewrites of a spec keep producing inconsistent edge-case handling, the bottleneck is not attention or emphasis; it is that the requirements have no executable ground truth. Tests supply that ground truth, and iterating on failures converges because progress is measurable: the failing set shrinks with each pass, and regressions are caught immediately.

The distractors each address a different problem. Emphasis markers like IMPORTANT are a budget spent relative to other instructions and cannot remove ambiguity from the rules themselves. Plan mode is valuable for large, multi-file changes or when several architectural approaches compete, but a self-contained normalizer with a correctness gap does not benefit from design-before-commitment; it benefits from verification. Loading the spec through CLAUDE.md guarantees the rules are in context every session, yet they remain guidance the model follows probabilistically, not a check that catches when it fails.

See Claude Code best practices and Common workflows for guidance on test-driven workflows with Claude Code.

### 도메인

Claude Code Configuration & Workflows

## 질문 39

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : An extraction subagent intermittently times out when calling the document parsing service, while most retried calls succeed. Which TWO error-handling behaviors should this subagent implement? (Select TWO.)


**A(정답).** When local retries are exhausted, return the failure type, what was attempted, and any partial extractions.

**설명**

Errors the subagent cannot resolve should be propagated with structured context: the failure type, the attempted operation, and partial results. This gives the coordinator the information it needs to retry differently, use partial data, or annotate a coverage gap.

**B.** Forward every timeout to the coordinator immediately so retry decisions are managed in one central place.

**설명**

Escalating every transient failure floods the coordinator with errors that local retry would resolve, adding turns and cost. Subagents are separate agent instances whose intermediate activity stays internal, so routine retry decisions belong inside the subagent, not at the coordination layer.

**C(정답).** Retry timed-out parsing calls locally with backoff before surfacing anything to the coordinator.

**설명**

Transient failures like timeouts are exactly the class of error a subagent should resolve locally with retry and backoff. Since most retried calls succeed, handling them inside the subagent avoids burdening the coordinator with failures that resolve on their own.

**D.** Return an empty extraction result marked as successful so the overall workflow continues uninterrupted.

**설명**

Marking a failure as a successful empty result is silent error suppression, a documented anti-pattern. The coordinator would treat the missing data as a valid outcome, turning a recoverable failure into misinformation in the final output.

### 전반적인 설명

Multi-agent error handling follows a layered principle: recover locally first, propagate only what cannot be resolved. Transient failures such as timeouts and momentary service unavailability are retryable by definition, so the subagent should handle them itself with backoff. This matters architecturally because each subagent in the Claude Agent SDK is a separate agent instance with its own conversation; its intermediate tool calls and retry attempts stay inside its context, and only its final message returns to the coordinator. The coordinator never sees the internal transcript, so routing every timeout upward would not give it richer visibility, only more noise and more turns.

When local recovery genuinely fails, the propagated error must carry enough structure for an intelligent decision: the failure type, what was attempted, any partial extractions gathered before the failure, and ideally alternative approaches. With that context the coordinator can retry with a modified request, proceed with partial results while annotating the gap, or escalate. A generic status stripped of context forces the coordinator to guess.

The two failing behaviors here are recognizable anti-patterns. Returning an empty result flagged as success hides the failure entirely; downstream systems consuming the extraction would treat absent data as a legitimate finding. Centralizing every retry decision inverts the design: it pays coordination cost for failures the subagent could resolve in one local retry, and it conflicts with the context isolation that makes subagents efficient. See Subagents in the Claude Agent SDK for how subagent context isolation and result reporting work.

### 도메인

Tool Design & MCP Integration

## 질문 40

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline's custom fetch_pr_diff MCP tool is described only as "Retrieves a diff." The agent passes repository URLs instead of the required numeric pull request identifier and calls it on merged PRs it cannot serve. Which fix is highest-leverage?

**A.** Rename the tool to fetch_pr_diff_by_number so the required identifier type is evident from the name alone.

**설명**

A clearer name can help, but names cannot carry input formats, examples, or scope boundaries, and the description remains the dominant selection and construction signal. A well-described tool with an ordinary name outperforms a well-named tool with a one-line description.

**B.** Keep the description minimal and return structured validation errors, letting the agent correct its inputs through repeated retry attempts.

**설명**

Structured errors are a valuable complement, but they are reactive: every malformed call still consumes a turn before correction happens. When the failure originates from an underspecified description, improving the description helps avoid the bad calls instead of paying to recover from them.

**C.** Add the input format rules and the merged-PR restriction to the pipeline's system prompt rather than to the tool itself.

**설명**

System prompt instructions can influence tool use, but the tool description is the primary and most localized signal for tool selection and argument construction. Keeping usage guidance away from the tool definition weakens the signal at the decision point and scales poorly as more tools are added.

**D(정답).** Rewrite the description to state the numeric identifier format, show an example input, and note that merged PRs are out of scope.

**설명**

This is correct because the tool description is the primary information the model reads when deciding whether and how to call a tool. Specifying the input format, an example, and the merged-PR boundary substantially reduces both malformed calls and out-of-scope calls at generation time, addressing the failure before wasted attempts occur.

### 전반적인 설명

Anthropic's documentation is explicit that the tool description is the most important factor in tool-use performance, recommending at least 3 to 4 sentences per tool and more for complex ones. A strong description covers what the tool does, when to use it and when not to, what each parameter means and what format it expects, and caveats such as what the tool cannot serve. The mental model: the model constructs every tool call from the definition it reads at that moment, so the definition is the most direct and localized place to shape both selection and argument construction. A one-line description like "Retrieves a diff" gives the model nothing to infer the identifier format from and no signal that merged pull requests are outside the tool's contract.

The alternatives each miss that leverage point. Relying on validation errors and retries treats a largely avoidable defect as a recoverable one; error metadata should exist, but as a safety net rather than the primary teaching mechanism, since each malformed call still burns a turn in the pipeline. Pushing usage rules into the system prompt can influence behavior, but it moves guidance away from the tool definition the model consults during call construction, and that approach degrades as the tool catalog grows. Renaming helps at the margin, yet a name cannot express formats, examples, or boundaries; documentation examples show a detailed description outperforming a well-chosen name paired with a sparse one.

For format-sensitive parameters like a numeric PR identifier, include concrete example inputs directly in the description and make the input_schema specify the expected parameter type and format, so the schema and prose reinforce each other. See How to implement tool use for the full best-practice guidance on writing tool descriptions.

### 도메인

Tool Design & MCP Integration

## 질문 41

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : While building the coordinator's prompts, a developer wrote the team's citation formatting and report structure conventions into ~/.claude/CLAUDE.md, but teammates report their Claude Code sessions never apply them. What should the developer do?

**A.** Add the conventions to the committed .claude/settings.json so every teammate's sessions apply them.

**설명**

This is incorrect because settings.json carries configuration such as permissions and tool settings, not prose instructions or conventions. Committing conventions there would not make Claude Code treat them as guidance the way CLAUDE.md content is treated.

**B(정답).** Move the conventions into a project-level CLAUDE.md at the repository root and commit it to version control.

**설명**

This is correct because ~/.claude/CLAUDE.md is user-level memory that applies only to that developer's machine and is never distributed through the repository. Project-level CLAUDE.md is the documented mechanism for team-shared instructions, since it travels with the repository when teammates clone or pull.

**C.** Copy the conventions into ./CLAUDE.local.md in the repository so each teammate's sessions load them automatically.

**설명**

This is incorrect because CLAUDE.local.md is intended for personal, project-specific instructions and is supposed to be kept out of version control via .gitignore. It is the wrong surface for conventions the whole team must share.

**D.** Have each teammate run /memory at the start of a session to import the developer's user-level conventions.

**설명**

This is incorrect because /memory views and edits the memory files loaded on the local machine; it cannot import another user's home-directory file. Teammates' sessions never see the developer's ~/.claude/CLAUDE.md, so there is nothing for /memory to pull in.

### 전반적인 설명

Claude Code memory is organized by scope, and the scope determines who receives it. The file at ~/.claude/CLAUDE.md is user-level memory: it lives in the developer's home directory, loads into every session that developer starts across all projects, and is documented as shared with just you. Because it sits outside the repository, git never sees it, so pushing project work does nothing to distribute it. The mental model is a two-axis split: home directory means personal, repository means shared; anything a whole team must follow has to live inside the repository where version control can carry it.

The fix is to place the citation and report conventions in a project-level CLAUDE.md (at the repository root or in .claude/CLAUDE.md) and commit it. Every teammate then loads the same conventions automatically after cloning or pulling, with no per-machine setup. The distractors each break the sharing chain: CLAUDE.local.md exists specifically for personal per-project notes and belongs in .gitignore; .claude/settings.json is a committed file, but it configures permissions and tooling rather than serving as instruction prose; and /memory is a local diagnostic and editing command for the memory files a session already loaded, not a mechanism for fetching another user's home-directory configuration.

See Manage Claude's memory for the full breakdown of memory locations and their sharing scopes, and Claude Code settings for what belongs in the JSON settings files instead.

### 도메인

Claude Code Configuration & Workflows

## 질문 42

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : Extraction requests concatenate multiple document sections into roughly 80K-token inputs. Fields from the first and last sections extract reliably, but fields present in middle sections often come back null. Which change addresses this?

**A.** Increase max_tokens so the model has sufficient output budget to populate every field defined in the extraction schema.

**설명**

The nulls are not caused by the response being truncated; the model is failing to recall middle-section content, not running out of output room. Raising the output ceiling leaves the input-processing problem untouched.

**B.** Add a system prompt instruction directing the model to give equal weight to every section regardless of its position in the input.

**설명**

Positional attention loss is a property of how the model processes long inputs, not a behavior it can switch off on request. An instruction to attend equally does not change what the model actually recalls from the middle of an 80K-token input.

**C.** Relocate the JSON schema and extraction instructions to the middle of the prompt so they sit adjacent to the sections whose fields are missed.

**설명**

This inverts the documented guidance: queries and instructions perform best at the end of the prompt, with data at the top. Burying the instructions in the middle places them in exactly the position where attention is weakest, likely degrading extraction across all sections.

**D(정답).** Restructure requests so document content sits at the top in XML-tagged sections, with Claude quoting relevant passages before extracting.

**설명**

This applies Anthropic's documented long-context techniques: longform data goes near the top of the prompt, XML tags give the model explicit structural landmarks for navigating each section, and quoting relevant passages first pulls middle-section content into the recent, well-attended part of the generation before extraction happens. Together these directly mitigate positional attention loss.

### 전반적인 설명

The failure signature here, reliable extraction from the edges of a long input with misses concentrated in the middle, is the classic lost-in-the-middle pattern. Anthropic describes the broader phenomenon as context rot: the context window is the model's working memory, and as token counts grow, accuracy and recall degrade even for content that fits comfortably within the limit. Fitting 80K tokens into the window is not the same as retrieving reliably from every position within it.

Anthropic's long-context guidance gives a concrete prescription for inputs of 20K+ tokens: place longform data near the top of the prompt, with the query and instructions at the end (a structure that improved response quality by up to 30% in Anthropic's tests on complex, multi-document inputs), and wrap each document or section in XML tags such as <document> and <document_content> so the model can distinguish content from instructions and navigate between sections. The second half of the correct approach, asking Claude to quote relevant passages before performing the task, is a documented mitigation: quoting forces the model to first locate and reproduce the supporting text, which surfaces middle-section evidence into the active generation before the structured extraction is produced.

The other approaches misdiagnose the problem. Moving the schema and instructions into the middle of the prompt puts the most important guidance in the least-attended position, the opposite of the documented ordering. A prompt instruction to weigh all sections equally asks the model to override a processing characteristic it cannot simply turn off. Raising max_tokens expands the output budget, but the nulls stem from input recall, not truncated responses.

See Context windows and Long context prompting tips.

### 도메인

Context Management & Reliability

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

## 질문 45

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : The coordinator completes a multi-turn investigation of a billing dispute, then spawns a resolution subagent that re-fetches customer data and misstates the disputed amounts. How should the coordinator hand its findings to the subagent?

**A.** Have the resolution subagent re-run get_customer and lookup_order at the start of its task to rebuild the case state from source systems.

**설명**

Re-fetching recovers raw backend records but not the investigation's conclusions, such as root cause analysis, customer-stated expectations, or decisions already made in conversation. It also duplicates tool calls and adds latency, which is exactly the wasteful behavior the coordinator should be eliminating.

**B.** Rely on the subagent automatically inheriting the coordinator's conversation history, since the Task tool spawns it within the same session.

**설명**

This fails because subagents do not inherit the parent's conversation history or prior tool results. Anything the subagent needs from earlier work must be explicitly included in its prompt, so relying on inheritance leaves the subagent without the investigation's findings.

**C.** Write the investigation findings into the project CLAUDE.md so the subagent picks them up as part of its startup context.

**설명**

CLAUDE.md is static, shared project configuration, not a channel for per-case transactional data. Mutating a version-controlled memory file for every customer dispute is an anti-pattern that pollutes shared team guidance with transient case state.

**D(정답).** Compile a structured summary of the findings (customer ID, disputed amounts, decisions made) and include it in the delegation prompt.

**설명**

This is correct because a subagent operates with an isolated context and does not automatically inherit the coordinator's conversation history or prior tool results. Findings must be explicitly passed in the delegation prompt, so a structured summary placed there is the reliable handoff mechanism.

### 전반적인 설명

In the Claude Agent SDK, a subagent is a separate agent instance with its own isolated context. It does not automatically inherit the coordinator's conversation history, prior tool results, or files the coordinator already read; intermediate work stays inside each agent, and only a final result flows back to the parent. This isolation is deliberate: it keeps verbose intermediate work out of the coordinator's context and lets specialized instructions apply cleanly, at the cost of requiring explicit handoffs. The mental model is nothing is shared unless you put it in the prompt.

That is why the correct pattern for phase transitions is to summarize the completed phase into a structured block (identifiers, amounts, decisions, constraints) and inject it directly into the next subagent's delegation prompt. The symptoms in the stem, redundant data fetching and misstated amounts, are the classic signature of a subagent spawned without that handoff.

The alternatives each break on a specific mechanism. Expecting the subagent to inherit the coordinator's session history assumes a sharing model that does not exist; the subagent starts without that history and must be given what it needs explicitly. CLAUDE.md is loaded as static project memory shared across sessions; stuffing per-customer case facts into it pollutes shared configuration with transient state that has no business persisting in version control. Re-running get_customer and lookup_order rebuilds raw records but cannot recover conversational facts and judgments the investigation produced, while doubling tool traffic.

See Subagents in the Claude Agent SDK and Claude Code subagents for how subagent context is constructed.

### 도메인

Context Management & Reliability

## 질문 46

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : A developer adds allowed-tools: Read Grep Glob to a triage skill's SKILL.md, intending to guarantee the skill can never call the process_refund tool. Which two approaches align with how these mechanisms actually behave?


**A(정답).** Enforce the guarantee with a permission deny rule on the refund tool, since deny rules take precedence over a skill's allowed-tools grant.

**설명**

This is correct. Permission rule precedence is deny, then ask, then allow, and a matching deny rule blocks a call even when an allow grant also matches. A deny rule therefore provides the enforcement that allowed-tools frontmatter cannot, because that field only pre-approves listed tools.

**B.** Rely on omitting the refund tool from the allowed-tools list to keep it blocked for as long as the skill's instructions remain loaded in context.

**설명**

This is incorrect on two counts. Omitting a tool from allowed-tools does not block it, since the field only grants pre-approval to the listed tools, and even the grant itself is scoped to the invoking turn rather than to how long the skill's instructions stay in context.

**C.** Invoke the skill once at the start of the session so its allowed-tools grant persists for every subsequent turn in that session.

**설명**

This is incorrect because the allowed-tools grant is turn-scoped: it clears when the user sends the next message. Invoking the skill again re-applies the grant for that new turn, but nothing carries forward automatically across the session.

**D(정답).** Treat allowed-tools as a turn-scoped pre-approval grant for the listed tools, and expect unlisted tools to stay callable under normal permissions.

**설명**

This is correct. The allowed-tools field is a pre-approval grant, not a restriction: it lets the skill use the listed tools without permission prompts during the invoking turn, and tools that are not listed remain available subject to the session's ordinary permission settings.

### 전반적인 설명

The key mental model is that allowed-tools in SKILL.md frontmatter is a permission grant, not a tool restriction. Listing Read Grep Glob means those tools run without permission prompts during the turn that invokes the skill; it says nothing about what else Claude may call. Unlisted tools, including MCP tools like a refund tool, remain in the available pool and are governed by the session's normal permission rules. The grant is also turn-scoped: it clears when the user sends their next message, even if the skill's instructions are still sitting in context.

When the goal is to guarantee a tool cannot be called, the correct mechanism lives in the permission system, not in the skill's grant list. Permission rules are evaluated with deny taking precedence over ask, which in turn takes precedence over allow: a matching deny rule blocks a call even when an allow grant, including a skill's allowed-tools, also matches. This division of labor is deliberate: skills get friction-free access to a few safe tools through pre-approval, while hard restrictions are declared explicitly where they cannot be bypassed by whatever a skill happens to list.

For a financially consequential action like processing refunds, deny rules (or hooks that intercept the tool call in code) provide session-wide enforcement that does not depend on which skill is active or which turn is running. See the Claude Code Skills documentation for frontmatter behavior and the permissions reference for deny, ask, and allow precedence.

### 도메인

Claude Code Configuration & Workflows

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

## 질문 48

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The web-search subagent requests retrieval of a paywalled source that licensing policy prohibits, and the fetch tool rejects the call. Which error response design lets the subagent handle this refusal correctly?

**A.** Return a successful result with an empty document body so the research workflow continues without any interruption.

**설명**

This is silent error suppression, a recognized anti-pattern. The subagent cannot distinguish a policy refusal from a source that genuinely has no content, so the final report either fabricates coverage or omits the gap without explanation.

**B.** Set errorCategory to validation and retriable to true, so the subagent adjusts the request parameters and retries the fetch.

**설명**

This mislabels a policy refusal as a fixable input problem. No reformulation of the request will make a prohibited source permissible, so the retriable flag invites futile retry loops against a rule that will always reject the call.

**C(정답).** Set errorCategory to business and retriable to false, with a plain-language note explaining the licensing restriction.

**설명**

This is correct because a policy refusal is a business error: no number of retries will ever succeed, so retriable: false stops wasted attempts. The plain-language explanation gives the subagent material it can pass to the coordinator, so the final report can honestly note why that source was excluded.

**D.** Return the compliance engine's raw rejection payload with internal rule identifiers so no policy detail is lost.

**설명**

Internal rule identifiers and raw payloads give the model information it cannot act on and should not surface in a cited report. Error responses should tell the agent what happened and what to do next, not expose backend internals.

### 전반적인 설명

Structured error metadata exists so an agent can make the right recovery decision at the moment a tool call fails. The standard taxonomy distinguishes transient errors (retry with backoff), validation errors (fix the input and retry), business errors (a policy or rule was violated; explain, do not retry), and permission errors (escalate). A licensing prohibition is a business error by definition: the request was well formed and the service was healthy, but a rule forbids the outcome. Marking it retriable: false tells the agent that repetition is pointless, and the plain-language explanation gives it something useful to do instead, namely report the coverage gap and its cause to the coordinator so the synthesized report stays honest and complete.

Mechanically, tool failures are signaled to Claude through the documented error flags: is_error: true on a tool_result block in the Messages API, or the isError flag in MCP-style tool results. Fields like errorCategory and retriable are application-level metadata you place inside the error content; the protocol does not interpret them, but the model reads them and conditions its next action on them. This is why Anthropic's guidance warns against generic error strings such as "Operation failed": an error message should say what went wrong and what the agent should try next. See Handle tool calls for the documented error-signaling pattern.

The alternatives each break the recovery contract. Labeling the refusal a validation error tells the agent the input can be corrected, which is false and produces reformulation loops against an immovable rule. Returning an empty body as success is the silent-suppression anti-pattern: it converts a known, explainable exclusion into misinformation downstream. Dumping the compliance engine's internal payload preserves detail nobody can use; internal rule identifiers do not help the agent decide anything and risk leaking backend structure into generated output.

### 도메인

Tool Design & MCP Integration

## 질문 49

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The extraction tool returns the identical message "extraction failed" whether the document store timed out or a file uses an unsupported format. The agent keeps retrying unsupported files, wasting turns. How should the tool's error responses change?

**A.** Add a system prompt instruction telling the agent to retry every failed extraction exactly once before moving on.

**설명**

A uniform retry policy applies the same recovery strategy to failures that need different ones. A transient timeout may need more than one retry to succeed, while an unsupported format should never be retried at all, so this rule still wastes attempts and abandons recoverable work.

**B.** Wrap raw exception stack traces from the parser in the error message so the agent can infer whether to retry.

**설명**

Stack traces expose internals the model must guess at rather than a machine-recognizable retry signal, and inference from raw traces is unreliable. The retryability decision should be made by the tool author, who knows the failure semantics, and communicated explicitly.

**C(정답).** Include an errorCategory and an isRetryable flag alongside a descriptive message in each error response.

**설명**

Structured error metadata gives the agent the information it needs at decision time: a transient timeout carries isRetryable true and gets retried, while an unsupported format carries isRetryable false and the agent moves on. This directly eliminates the wasted retry attempts on failures that can never succeed.

**D.** Return unsupported-format failures as successful results with an empty extraction object so the agent stops retrying.

**설명**

Marking a failure as success is silent error suppression, a recognized anti-pattern. The agent and any downstream system now treat missing data as a legitimate empty result, turning a detectable failure into misinformation.

### 전반적인 설명

The failure mode here is a classic consequence of generic error messages: when every failure looks the same, the agent cannot distinguish a transient problem (a timeout that a retry will likely fix) from a permanent one (a file format the parser will never accept). Lacking that signal, the model falls back on guessing, and the guesses are wrong in both directions: futile retries on permanent failures and premature abandonment of recoverable ones.

The fix is to make the tool the authority on its own failure semantics. Returning structured metadata, typically an errorCategory (transient, validation, business), an isRetryable boolean, and a human-readable description, moves the retry decision from probabilistic inference to an explicit contract. The agent reads isRetryable: true on a timeout and retries with backoff; it reads isRetryable: false on an unsupported format, stops immediately, and can explain or route the document elsewhere. The descriptive message additionally enables self-correction, for example suggesting a supported format or an alternative lookup.

The alternatives all fail to carry this signal. A blanket one-retry prompt rule hard-codes a single recovery strategy across error types that need different ones. Reporting failures as successful empty results is silent suppression: it converts a visible failure into data the downstream pipeline will trust. Raw stack traces are prose the model must interpret, not a dependable signal, and they leak internals the agent should neither need nor repeat.

See MCP Tools documentation and Anthropic's tool use overview for guidance on communicating tool errors so agents can recover appropriately.

### 도메인

Tool Design & MCP Integration

## 질문 50

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : Simple lookup requests currently traverse all four subagents in order, multiplying latency and cost even when only a web search is needed. How should the coordinator be designed so each request invokes only the subagents it requires?

**A.** Mention every subagent by name in the coordinator's delegation prompts so each stage is explicitly forced rather than left to automatic matching.

**설명**

Naming a subagent explicitly bypasses automatic description matching and forces its invocation. Forcing all four by name on every request institutionalizes the full-pipeline behavior the design is trying to eliminate, rather than enabling selective delegation.

**B.** Implement a keyword-matching classifier in application code that preselects the required subagents before the coordinator receives the request.

**설명**

A keyword classifier replaces model-driven selection with a brittle hard-coded layer that must anticipate every phrasing. It adds infrastructure while discarding the coordinator's ability to reason about ambiguous or multi-part requests, which is exactly the judgment the agent architecture provides.

**C.** Keep the fixed four-stage flow but move simple requests to subagents on a faster model tier so full traversal completes more quickly.

**설명**

A faster model tier shortens each stage but still executes stages the request never needed, so cost and latency remain multiplied by unnecessary work. The problem is which subagents run, not how fast each one runs.

**D(정답).** Write distinct, specific descriptions for each subagent and prompt the coordinator to select and invoke only those whose descriptions match the request.

**설명**

This is correct because routing in the Agent SDK is description-driven: Claude decides which subagents to invoke by matching the task against each AgentDefinition description. Clear, differentiated descriptions plus a coordinator prompt framed around selecting relevant specialists let the model skip stages a request does not need.

### 전반적인 설명

In the Claude Agent SDK, the coordinator does not need a hard-coded pipeline to decide who does what. Claude routes work to subagents by matching the task against each AgentDefinition description: the description is the selection signal, and the coordinator's prompt frames the decision. When descriptions are distinct and specific ("searches the web for current sources", "analyzes provided documents"), and the coordinator is instructed to invoke only the specialists a request actually needs, a simple lookup can trigger a single Agent tool call instead of a four-stage traversal. This is dynamic selection: the model reasons about what the query requires, which is precisely the judgment an agentic coordinator exists to exercise.

The mental model is that each subagent invocation is a fresh, isolated instance with its own context and its own API cost. That is why traversing unnecessary stages is expensive: every stage repeats setup, consumes tokens, and adds latency, and the parent still has to pass context explicitly into each one. Selective delegation exists as a tradeoff against fixed pipelines: pipelines are predictable and easy to test, but they pay full cost on every request; description-driven routing pays only for the work a request demands.

The alternatives each miss this. A keyword classifier in application code re-creates a hard-coded decision tree that cannot generalize to novel phrasings and duplicates reasoning the coordinator already performs. Mentioning every subagent by name forces invocation and bypasses automatic matching, cementing the full pipeline rather than removing it. A faster model tier reduces per-stage time without reducing the number of stages, so wasted work remains wasted, just cheaper per unit.

See Subagents in the SDK for how description-based invocation, forced invocation by name, and per-subagent configuration work.

### 도메인

Agentic Architecture & Orchestration

## 질문 51

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : The repository ships a team skill at .claude/skills/summarize-ticket/ that the whole team uses on escalation cases. You want a personal variant with different formatting, keeping the shared /summarize-ticket unchanged and still invocable for you. Where does your variant belong?

**A.** In .claude/skills/summarize-ticket/SKILL.md, edited directly but left uncommitted in your working tree.

**설명**

This modifies the checked-in team skill, so you lose access to the shared behavior locally and risk committing personal changes by accident. Uncommitted edits to shared files also collide with every future update the team makes to that skill.

**B(정답).** In ~/.claude/skills/ under a new directory name, such as summarize-ticket-alt/SKILL.md.

**설명**

Personal skills live in ~/.claude/skills/ and never travel through version control, so teammates are unaffected. Using a distinct directory name avoids a name collision, which matters because a personal skill with the same name would override the project skill and hide it from you.

**C.** In .claude/skills/ under a new directory, with the frontmatter name field changed to rename it.

**설명**

The project skills directory is committed to version control, so this variant would ship to every teammate on the next pull. Additionally, for project and personal skills the slash command name comes from the directory name; the frontmatter name field only changes the display label.

**D.** In ~/.claude/skills/summarize-ticket/SKILL.md, reusing the shared skill's directory name.

**설명**

The personal location is right, but reusing the name causes a collision. Skill precedence resolves personal over project, so /summarize-ticket would now run your variant and the team's shared skill would no longer be invocable for you.

### 전반적인 설명

Claude Code resolves skills from several locations at once: personal skills in ~/.claude/skills/ apply across all of a user's projects and are never shared through version control, while project skills in .claude/skills/ are committed and reach every teammate who pulls the repository. This split is what makes personal customization safe: anything under the home directory is invisible to the team by construction, so a personal variant of a shared workflow belongs there.

Two details make the distinct directory name essential. First, for personal and project skills the slash command name is derived from the directory name, not the frontmatter name field, so renaming requires a new directory, and changing frontmatter alone accomplishes nothing at invocation time. Second, when skills at different levels share a name, precedence runs enterprise over personal over project: a personal summarize-ticket would silently shadow the team skill on your machine, so /summarize-ticket would stop running the shared version for you. A variant name such as summarize-ticket-alt gives you both commands side by side.

Editing the checked-in SKILL.md and hoping it stays uncommitted is the classic anti-pattern here: it turns a shared artifact into a divergent local fork, invites accidental commits, and conflicts with future team updates. Placing a renamed copy in .claude/skills/ fails differently, since that directory is precisely the one that propagates to teammates. See the Claude Code skills documentation for skill locations, naming, and precedence rules.

### 도메인

Claude Code Configuration & Workflows

## 질문 52

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : A nightly extraction batch completes with errored results: most are invalid_request_error failures caused by documents that exceeded the context limit, and a few are server errors. How should the team construct the retry submission?

**A.** Resubmit the entire original batch, since errored requests were not billed and reprocessing the successful requests adds no extra cost.

**설명**

Only errored, canceled, and expired requests are not billed; successfully processed requests were charged and would be charged again if resubmitted. Reprocessing the entire corpus to retry a small failed subset wastes cost and time, which is exactly what custom_id correlation avoids.

**B.** Resubmit every errored request unchanged in a new batch, since invalid_request_error failures are usually transient and resolve on retry.

**설명**

Server errors can be retried unchanged, but invalid_request_error indicates the request body itself is invalid and must be fixed before resending. A document that exceeded the context limit will fail again identically until it is chunked.

**C(정답).** Chunk the oversized documents, give each chunk a unique custom_id, and resubmit the chunks plus the server-error requests as a new batch.

**설명**

This matches the documented retry pattern: invalid_request_error results must be fixed before resending, so oversized documents are chunked, while server errors can be retried directly. Each chunk needs its own custom_id because the field must be unique within a batch, and results are matched back by custom_id.

**D.** Split each oversized document into chunks that all reuse the original custom_id so results still correlate to one source document.

**설명**

custom_id values must be unique within a Message Batch, so multiple chunks cannot share one identifier. Correlation back to the source document is handled by encoding the source and chunk index into distinct custom_id values.

### 전반적인 설명

The Message Batches API processes each request independently, so one request failing never affects the others. The per-request result types are succeeded, errored, canceled, and expired, and each result line carries the developer-supplied custom_id. Because results arrive in a streamed .jsonl file with no guaranteed ordering, custom_id is the only reliable way to map a failure back to its source document, and it is what makes selective resubmission possible: fix and resend only the failed subset, never the successes (which were already billed).

The retry itself must be differentiated by error type. Anthropic's guidance distinguishes an invalid_request_error, where the request body must be fixed before resending, from a server error, which can be retried directly. A document that blew past the context limit is in the first category: resubmitting it unchanged reproduces the same failure, so it must be chunked first. When a document is split into several chunks, each chunk becomes its own request and needs its own custom_id; the field must be unique within the batch and match a constrained pattern (1 to 64 characters of letters, digits, underscores, and hyphens). A common convention is to encode the source document ID plus a chunk index, so downstream reassembly stays deterministic.

The distractors each break one part of this model: retrying invalid requests unchanged ignores that the failure is structural, reusing one custom_id across chunks violates the uniqueness constraint, and resubmitting the whole batch pays a second time for every already-successful request. See Batch processing and Create a Message Batch for the documented behavior.

### 도메인

Prompt Engineering & Structured Output

## 질문 53

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The coordinator delegates three independent extraction passes (parties, financial terms, key dates) to dedicated subagents, dispatching one Task call per turn and waiting for each result. What change makes the passes run concurrently?

**A.** Merge the three specialized subagents into a single AgentDefinition that performs all extraction passes in one delegation.

**설명**

Collapsing the passes into one subagent removes the specialization and does not create concurrency; the single agent still performs the three extractions one after another within its own context. It also concentrates all three tasks' output in one context window, which is what the split was avoiding.

**B(정답).** Have the coordinator emit the three Task tool calls together in one response instead of one per turn.

**설명**

Claude can include multiple tool_use blocks in a single response, and the harness can execute those requests concurrently. Emitting all three Task calls in one coordinator turn is the documented mechanism for parallel subagent execution, so the three independent passes finish in roughly the time of the slowest one.

**C.** Assign each extraction subagent a lower-latency model so every individual pass completes more quickly.

**설명**

A faster model reduces the duration of each pass but does nothing to change the dispatch pattern; the coordinator still issues one Task call per turn and waits for its result. The three passes remain strictly sequential, so total latency is still the sum of the three rather than the time of the slowest one.

**D.** Return each subagent's tool result in its own user message immediately, letting the coordinator start the next pass sooner.

**설명**

This changes how results flow back, not how calls are issued, so the passes remain sequential. Anthropic's guidance is also the opposite: when multiple tool calls are made in one turn, all tool_result blocks should be returned together in a single user message, and splitting them across messages discourages the model from making parallel calls.

### 전반적인 설명

The lever for concurrency in a coordinator-subagent system is not a runtime setting but the shape of the coordinator's own response. Claude may return several tool_use blocks in a single assistant message with stop_reason: "tool_use", and when it does, the harness is free to execute those requests in parallel because the API prescribes no execution order. So the correct move is to get the coordinator to request all three extraction passes at once: three Task calls in one turn, three subagents running side by side. Since the passes are independent read-only extractions over the same contract, there is no ordering constraint that would force sequential execution. (In current SDK versions the subagent tool is named Agent, with Task retained as an alias.)

The result-handling side matters just as much: for every tool_use block the harness must return one matching tool_result keyed by tool_use_id, and all of those results belong together in the same next user message. Sending each result in its own message is explicitly called out as an anti-pattern; over time it teaches the model to stop batching its tool calls, which would undo the parallelism you are trying to create.

The distractors each miss where the bottleneck lives. A lower-latency model shortens each pass individually but leaves the end-to-end pattern sequential, so total time is still the sum of the three passes. Merging the three subagents into one AgentDefinition serializes the work inside a single context and forfeits both specialization and context isolation. And restructuring result delivery does nothing to the dispatch pattern that causes the latency. See Parallel tool use and Subagents in the SDK.

### 도메인

Agentic Architecture & Orchestration

## 질문 54

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : The team adds a weekly quality audit: every resolved refund case is checked against the same four criteria (identity verification, policy compliance, amount limits, tone), then results are combined into a summary. Which decomposition approach fits?

**A.** Have a coordinator spawn a subagent per case that iterates until it finds no remaining issues, then merge the subagent reports.

**설명**

Iterative refinement loops are for tasks where quality gaps must be discovered and repaired, such as open-ended research. A fixed checklist audit has a clear definition of done after the four checks run, so an open-ended iteration loop adds cost and nondeterminism for no gain.

**B(정답).** Use prompt chaining: run each case through the four checks in sequence, then a final pass that aggregates findings into the summary.

**설명**

The audit has a fully predictable structure: the same four criteria apply to every case, and all steps are known up front. A fixed sequential pipeline gives each check focused attention, produces inspectable intermediate outputs, and ends with a dedicated aggregation pass, which is exactly what prompt chaining is designed for.

**C.** Use dynamic adaptive decomposition, letting the agent decide at runtime which checks each case needs based on what earlier steps reveal.

**설명**

Adaptive decomposition is the right choice when the task's scope is unknown and each step depends on prior discoveries. This audit has no such uncertainty; the four criteria are fixed for every case, so runtime adaptivity adds variability and overhead without any benefit.

**D.** Send all cases and criteria in a single comprehensive request so the model can judge every case with the full audit context in view.

**설명**

Processing many cases against multiple criteria in one pass causes attention dilution: some cases get thorough treatment while others get shallow or inconsistent judgments. Splitting the work into focused steps avoids this known failure mode.

### 전반적인 설명

Prompt chaining means breaking a task into sequential calls where each step has a single focused job and its output feeds the next step. Anthropic's guidance notes that chaining remains valuable when you need to inspect intermediate outputs or enforce a specific pipeline structure, which is precisely the profile of a recurring compliance audit: every case passes through the same four checks, and auditors may need to see per-criterion results, not just the final summary. The pattern mirrors the multi-pass code review approach: local, per-item analysis first, then a separate aggregation or integration pass.

The selection rule to internalize is that the workflow's uncertainty profile chooses the decomposition strategy. When all steps are known up front and identical across inputs, a fixed pipeline delivers reproducibility, consistent depth per check, and easy regression testing of each stage. Dynamic adaptive decomposition earns its overhead only when the next step genuinely depends on what the previous step discovered, such as an open-ended investigation. Applying it here trades determinism for flexibility the task never uses.

The other approaches fail on mechanics. A single comprehensive request over many cases and criteria suffers attention dilution: the model handles some cases deeply and others superficially, and can flag a pattern in one case while approving identical behavior in another. A per-case subagent that iterates "until no issues remain" imports an iterative-refinement loop into a task with a fixed completion condition; the checklist itself defines done, so the loop only adds cost and an ill-defined stopping problem. See Anthropic's prompt engineering guidance for the documented role of chaining in structured pipelines.

### 도메인

Agentic Architecture & Orchestration

## 질문 55

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : You are about to implement the agent's billing-dispute workflow. On past features, specs written up front kept missing failure modes nobody anticipated, such as chargebacks and partial refunds. Which technique best surfaces these considerations before implementation starts?

**A.** Provide two or three concrete input and output examples demonstrating how representative disputes should be resolved.

**설명**

Concrete examples are the right technique when a known transformation is being described inconsistently in prose. They communicate patterns you already understand; they cannot reveal edge cases and failure modes you have not yet anticipated, which is the stated problem here.

**B.** Use plan mode so Claude explores the existing codebase read-only and hands you an implementation plan to approve before any code is written.

**설명**

Plan mode is valuable for safe exploration and reviewing an approach before execution, but the plan reflects what Claude can discover in the code and your prompt. It does not systematically question the developer to draw out requirements and failure modes that exist only in the developer's head or the business domain.

**C(정답).** Ask Claude to interview you about edge cases, concerns, and tradeoffs, capturing the decisions in a spec before coding.

**설명**

This is the interview pattern: Claude asks questions that probe technical implementation, edge cases, and tradeoffs, surfacing considerations the developer had not thought of. The answers are consolidated into a written spec, which is exactly the remedy when up-front specs keep missing unanticipated failure modes.

**D.** Write a more exhaustive upfront specification yourself, enumerating every billing edge case your team can identify.

**설명**

A longer solo spec is bounded by what the team already knows to write down, and the stem says exactly that approach has been missing failure modes. It does not add a mechanism for surfacing considerations outside the team's current awareness.

### 전반적인 설명

The interview pattern inverts the usual prompting direction: instead of the developer trying to enumerate every requirement, Claude asks the questions. Anthropic documents this as let Claude interview you: start a larger feature with a minimal prompt and instruct Claude to interview you (using its built-in AskUserQuestion tool) about technical implementation, UX, edge cases, concerns, and tradeoffs, pushing it to dig into the hard parts rather than ask only obvious questions. The end state is a written spec such as SPEC.md; Anthropic then recommends starting a fresh session so implementation runs on clean context focused on execution.

The mental model is that a domain like billing disputes has failure modes (chargebacks, partial refunds, mid-cycle cancellations) that live in the business domain, not in the codebase. A developer writing a spec alone can only capture what they already know to consider, which is precisely why past specs kept missing things. A structured interview lets the model's breadth of pattern knowledge probe for scenarios the developer never raised, and each answer becomes a recorded design decision.

The other techniques solve adjacent but different problems. Plan mode gives safe, read-only exploration and a reviewable plan, but it derives the plan from the code and the prompt as given; it does not systematically elicit unstated requirements from the developer. Few-shot input/output examples are the best tool when a known transformation is described inconsistently in prose, not when the gap is unknown edge cases. And a more exhaustive solo spec simply doubles down on the approach the scenario says has already failed.

See Claude Code best practices and the tools reference for the documented interview workflow and the AskUserQuestion tool.

### 도메인

Claude Code Configuration & Workflows

## 질문 56

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The web search subagent's queries to one news archive intermittently time out; an immediate retry usually succeeds, but occasionally the archive stays down for an entire task. How should the subagent handle these timeouts?

**A.** Keep retrying the archive inside the subagent until the request eventually succeeds, so the coordinator only ever receives complete result sets.

**설명**

Unbounded retries are a documented anti-pattern: when the archive stays down for an entire task, the subagent stalls the workflow while burning latency and resources. After a small number of local attempts, unresolvable errors must be propagated to the coordinator with context.

**B.** Forward every timeout to the coordinator as it occurs, keeping all retry and recovery decisions centralized so error handling stays uniform and fully observable.

**설명**

Escalating every transient failure floods the coordinator with routine recovery work it cannot handle better than the subagent can. The scenario states an immediate retry usually succeeds, so these timeouts should be resolved locally and only unresolvable failures should be propagated.

**C.** Return the results gathered from the other sources under a success status, letting synthesis proceed without interrupting the research workflow.

**설명**

Marking a failed source as success is silent suppression: the coordinator and synthesis agent believe the archive was covered when it was not, so the report's coverage gap goes unannotated. Failures must be reported honestly, even alongside partial results.

**D(정답).** Retry timed-out queries locally with backoff, and if the archive stays down, escalate the failure to the coordinator with attempted queries and partial results.

**설명**

This is the correct layered design: transient timeouts are usually fixable with a local retry, so the subagent handles them without involving the coordinator. Only failures it cannot resolve are propagated, and they carry what was attempted plus any partial results so the coordinator can make an informed recovery decision.

### 전반적인 설명

The guiding principle for error handling in multi-agent systems is to handle errors at the lowest level capable of resolving them. Transient failures such as timeouts are, by definition, likely to succeed on retry, so the subagent should attempt local recovery (one or two retries with backoff) before involving anyone else. This keeps the coordinator focused on decisions only it can make, rather than acting as a dispatcher for routine retries.

When local recovery fails, the propagated error must be structured and informative: the failure type, the queries that were attempted, any partial results collected before the failure, and ideally alternative approaches. With that context, the coordinator can choose to retry later, delegate to a different source, or proceed with partial results and annotate the coverage gap in the final report. In the Claude Agent SDK, this behavior is something you design into the subagent's prompt and tool handlers; for custom tools, catching failures and returning a composed error result (rather than letting a bare exception surface) lets you include exactly this actionable context while the agent loop continues.

The distractors map to known anti-patterns: escalating every timeout centralizes work the subagent can resolve itself; unbounded internal retries stall the workflow when the outage is not transient; and returning a success status for a failed source is silent suppression, which hides the failure from the coordinator and produces a report whose coverage gaps nobody can see. See Custom Tools in the Agent SDK and Subagents in the Agent SDK for the documented error-result and subagent design patterns.

### 도메인

Context Management & Reliability

## 질문 57

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : The lookup_order tool returns the identical message "Operation failed" whether the backend timed out, the order ID was malformed, or the order belongs to a different account. The agent's recovery behavior is erratic: it sometimes retries and sometimes gives up, with no relation to the actual cause. What should you change?


**A(정답).** Return distinct error responses that state the cause, whether a retry makes sense, and what the agent should try next.

**설명**

This is correct because the agent's recovery decision depends entirely on information carried in the tool result. A timeout warrants a retry, a malformed ID warrants correcting the input, and a cross-account order warrants asking the customer for verification or escalating; only a descriptive error that distinguishes these cases lets the agent pick the right path.

**B.** Add exponential-backoff retry logic in the harness so every failed lookup_order call is retried before the agent ever sees the failure.

**설명**

Blanket retries only help transient failures such as timeouts. Retrying a malformed order ID or a cross-account access refusal wastes attempts on calls that will always fail, and the agent still receives no information to correct its input or escalate appropriately.

**C.** Write system prompt rules describing how the agent should respond to each possible lookup_order failure mode.

**설명**

Instructions describing per-cause behavior are useless when every failure arrives as the same uniform string, because the agent cannot tell which failure mode actually occurred. The missing signal is in the tool result, not in the prompt.

**D.** Route every lookup_order failure straight to escalate_to_human so a person handles the ambiguity.

**설명**

Escalating all failures sacrifices the first-contact resolution target for issues the agent could resolve itself, such as retrying a transient timeout or asking the customer to confirm an order number. Escalation should be reserved for failures the agent genuinely cannot recover from.

### 전반적인 설명

An agent's recovery logic is only as good as the information its tools give it. When a tool call fails, the model reasons about what to do next from the tool_result content it receives; a uniform string like "Operation failed" collapses fundamentally different situations (a transient backend timeout, a fixable input problem, an access refusal) into one indistinguishable signal. The erratic behavior in the stem is the predictable consequence: the model is forced to guess, so its choices look random relative to the actual cause.

Anthropic's guidance is explicit on this point: return tool errors as tool_result blocks with is_error: true, and make the error content say what went wrong and what Claude should try next, for example "Rate limit exceeded. Retry after 60 seconds" rather than a bare "failed". Structured metadata such as an error category and a retryability indicator turns recovery into an informed decision: retry transient failures, correct invalid inputs, and escalate or verify identity on access problems.

The alternatives all fail because they act on the wrong layer. Harness-level blanket retries apply one strategy to error types that need three different ones, and still leave the agent blind. Prompt rules keyed to failure modes cannot work when the tool output never reveals the mode. Escalating every failure trades away first-contact resolution on problems that are well within the agent's ability to fix once it can see what actually happened.

See Handle tool calls and errors for the documented error-response patterns.

### 도메인

Tool Design & MCP Integration

## 질문 58

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Review findings always pass schema validation, yet the location field arrives in mixed formats ("auth.ts:42", "line 42 of src/auth.ts"), breaking the bot that posts inline PR comments. What is the most effective fix?

**A.** Force the findings tool with tool_choice so every response is generated through the schema rather than free text.

**설명**

The findings already pass schema validation, so structured output is already being produced reliably. Forcing the tool changes whether the schema is used, not how values inside it are formatted, so the inconsistency would persist unchanged.

**B(정답).** Specify the exact location convention (relative path, colon, line number) in the prompt and the field's schema description.

**설명**

Correct. A JSON schema guarantees that the field exists and is a string, but it does not dictate the convention the value follows. Stating the normalization rule explicitly in the prompt and the field description gives the model an operable formatting rule, which is the documented way to get consistent value conventions alongside a strict schema.

**C.** Add a regex pattern with minLength and maxLength constraints to the location field so nonconforming values are rejected during generation.

**설명**

String constraints such as minLength and maxLength are not part of the JSON Schema subset supported by structured outputs, and submitting unsupported schema features can produce a 400 error. Even where constraints are supported, they pin down shape rather than teaching the model which convention to use.

**D.** Write a post-processing step that detects each location variant with regexes and rewrites it into the expected format before posting.

**설명**

This patches symptoms downstream with fragile pattern matching that must anticipate every variant the model might produce. It leaves the root cause, the absence of an explicit formatting rule in the prompt, unaddressed, so new variants will keep breaking the rewriter.

### 전반적인 설명

This question is about the boundary between what a schema enforces and what it cannot. Constrained generation against a JSON schema guarantees structure: the output is syntactically valid, required fields are present, and types match. It says nothing about the convention a value follows: a location field typed as string is equally satisfied by auth.ts:42 and by line 42 of src/auth.ts. When downstream systems depend on a specific value format, that expectation is semantic, and semantics must be communicated the way any instruction is: through the prompt and through detailed field descriptions in the schema. Anthropic's tool-definition guidance emphasizes exactly this, recommending descriptions that spell out format-sensitive parameters, expected conventions, and caveats, optionally reinforced with examples.

The mental model to carry: climb the reliability ladder for structure (schemas eliminate syntax errors by construction), then layer normalization rules on top for value conventions, such as "locations are always relative path, colon, line number" or "dates are always ISO 8601". Trying to push those rules into the schema itself often fails outright: structured outputs support only a subset of JSON Schema, and string constraints like minLength and maxLength are explicitly unsupported and can trigger a 400 error. Regex-based post-processing inverts the responsibility, forcing your code to guess every variant instead of telling the model the one format you want. And forcing the tool via tool_choice addresses a problem the pipeline does not have, since schema-conformant output is already arriving; the defect lives inside the values, not around them.

See Structured outputs for the supported schema subset and its guarantees, and Define tools for guidance on writing descriptions that convey format expectations.

### 도메인

Prompt Engineering & Structured Output

## 질문 59

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The extraction pipeline defines a lookup_reference tool that Claude calls mid-extraction to resolve entity codes found in a document. Claude returns stop_reason "tool_use" and the application executes the lookup. How should the result be delivered so Claude can continue?

**A.** Send the output back as a plain text block in the next user message so Claude reads the lookup result as ordinary conversational input rather than a tool_result.

**설명**

A plain text user message leaves the pending tool_use block unanswered, and the API requires every tool_use to be immediately followed by a matching tool_result in the next message. The request would fail with an error about tool_use ids found without tool_result blocks, so the text never reaches the model.

**B(정답).** Append the assistant message containing the tool_use block, then a user message with a tool_result block carrying the matching tool_use_id, and call the API again.

**설명**

This is the documented pattern: the assistant's tool_use message and a user message containing the tool_result (identified by tool_use_id) are both added to the message history, and the next API call lets Claude reason over the output. The growing conversation history is the only channel through which the model sees tool output.

**C.** Append a user message that opens with a text block explaining the lookup outcome, followed by the tool_result block carrying the matching tool_use_id.

**설명**

The tool_result content and tool_use_id are correct here, but the placement is not: within a user message, all tool_result blocks must come before any text blocks. Violating this ordering rule can cause the API to reject the request, so this delivery is unreliable.

**D.** Attach the output to the lookup_reference tool definition so the model re-reads the updated definition and result on its next inference pass.

**설명**

Tool definitions are static declarations of a tool's name, description, and input schema; they are not a channel for runtime results. The model only sees execution output through tool_result blocks in the message history.

### 전반적인 설명

Claude never executes client-defined tools itself. When it decides a tool is needed, it stops generating with stop_reason: "tool_use" and emits a tool_use block describing the call; the application (the harness) runs the operation. Getting the output back to the model is entirely the harness's job, and there is exactly one mechanism for it: the conversation history. The harness appends the assistant message containing the tool_use block, then a user message containing a tool_result block whose tool_use_id matches the id of the original call, and sends the full history in the next request. See How tool use works and Build a tool-using agent.

The API's placement rules explain why the distractors fail. Each tool_result must immediately follow its corresponding tool_use in the message history, and within a user message all tool_result blocks must precede any text (see Handle tool calls). Sending the output as plain text leaves the pending tool_use unanswered, which triggers errors such as "tool_use ids were found without tool_result blocks immediately after"; placing a text block ahead of the tool_result in the same user message violates the intra-message ordering rule. Tool definitions, meanwhile, are static contracts (name, description, input schema) that shape how the model selects and constructs calls; they carry no runtime data.

The right mental model for an extraction pipeline like this one is that the message history is the agent's memory. Every iteration of the loop re-sends the accumulated history, and each appended tool_result is new evidence the model incorporates on its next pass. That statefulness is an illusion the harness constructs, which is precisely what gives the developer full control over what the model does and does not see.

### 도메인

Agentic Architecture & Orchestration

## 질문 60

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : Alongside live conversations, the team runs a nightly audit that re-scores every resolved ticket for policy compliance. To capture the Message Batches API's 50% discount, how should these two workloads be split across APIs?

**A.** Submit live conversations as batches with a synchronous fallback triggered whenever a batch has not completed within a few minutes.

**설명**

This design pays for a batch submission and then often re-pays synchronously, adding complexity and delay without reliable savings. Because there is no latency guarantee, the fallback is likely to fire frequently, meaning the live workload effectively remains synchronous with extra machinery bolted on.

**B.** Submit both workloads as batches, since most batches finish in under an hour and polling can surface results quickly.

**설명**

Although most batches do complete in under an hour, there is no latency SLA and processing can take up to 24 hours. A customer in a live conversation cannot wait on a window with no guarantee, so live interactions must stay synchronous regardless of typical batch speed.

**C(정답).** Submit the nightly ticket audit as a batch and keep live customer conversations on synchronous Messages API calls.

**설명**

This is correct because the nightly audit is latency-tolerant and non-blocking, so it fits comfortably within the batch API's up-to-24-hour processing window and earns the 50% discount. Live conversations have a customer actively waiting, which makes them blocking workloads that require synchronous responses.

**D.** Keep both workloads synchronous, because batch results can return out of input order and cannot be reliably matched to tickets.

**설명**

Batch results can indeed arrive out of input order, but the API provides the custom_id field specifically so each result can be correlated back to its originating request. Ordering is a solved problem and is not a reason to forgo the 50% savings on the nightly audit.

### 전반적인 설명

The Message Batches API trades latency for cost: requests are processed asynchronously, most batches finish within an hour, but processing can take up to 24 hours with no latency SLA, in exchange for a 50% discount versus standard pricing. The decision rule is therefore about who is waiting. A nightly compliance audit of already-resolved tickets is the textbook batch profile: it is an offline, non-blocking workload that nobody waits on, so it can tolerate asynchronous completion, and its volume makes the discount meaningful. A live support conversation is the opposite profile: the customer is waiting on every turn, so it must use synchronous Messages API calls.

The out-of-order objection misunderstands the API's design: each request in a batch carries a custom_id (1 to 64 characters) precisely so results, which arrive in a .jsonl file when the batch reaches processing_status: "ended", can be mapped back to their source tickets. A hybrid batch-plus-fallback scheme for live traffic is an anti-pattern: since there is no completion guarantee at any horizon, the synchronous fallback tends to become the real path, and the architecture pays batch submission costs plus synchronous costs plus added latency. Betting live traffic on the typical sub-hour completion time confuses a common outcome with a guarantee; the tail of the distribution is a full day.

See the official guide to Batch processing for the documented use cases, latency characteristics, and custom_id correlation mechanics.

### 도메인

Prompt Engineering & Structured Output