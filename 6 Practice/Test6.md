# Practice Test 6

## 질문 1

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The search subagent's tool calls retrieve full articles with quotes and URLs, yet the coordinator receives only a two-sentence overview from it, so the synthesis subagent produces reports without citations. What should you change?

**A.** Have the coordinator repeat the key searches itself so the detailed results land directly in its own context.

**설명**

Re-running the searches in the coordinator duplicates work the subagent already did and floods the coordinator's context with the exact verbose output that delegation was meant to keep out of it. It treats the symptom while defeating the purpose of context isolation.

**B(정답).** Instruct the search subagent to include its complete findings, key quotes, and source URLs in its final message.

**설명**

Only a subagent's final message returns to the parent; every intermediate tool call and result stays inside the subagent's isolated context and is then discarded. If the search subagent's final message is a thin overview, the detail is gone. Requiring it to emit complete findings with quotes and URLs in that final message is the only way the coordinator can ever hold and forward them.

**C.** Move the synthesis subagent to a model with a larger context window so more of the search detail fits.

**설명**

Context window size is irrelevant here because the detailed findings never reach the coordinator, so they cannot be passed to the synthesis subagent regardless of how much room it has. A larger window cannot recover information that was lost upstream.

**D.** Give the synthesis subagent a tool that reads the search subagent's conversation transcript to recover the detail.

**설명**

Subagents run in isolated conversations that are not exposed to other agents; once a subagent completes, its intermediate context is not a queryable resource. Building around a transcript-reading mechanism attempts to reach state the architecture deliberately discards.

### 전반적인 설명

The mental model to hold here is that a subagent is a separate, isolated conversation. While it works, its tool calls and their verbose results accumulate only in its own context; when it finishes, the sole artifact that survives is its final message, which returns to the parent. Everything else is discarded. This is a deliberate tradeoff: isolation keeps a research subagent's dozens of page fetches from flooding the coordinator's context, but it also means the subagent's final message is the entire handoff channel. If that message is a two-sentence overview, the quotes and URLs the subagent gathered no longer exist anywhere the coordinator can reach.

The fix therefore belongs in the search subagent's instructions: require it to output its complete findings, key quotes, and source URLs (ideally in a structured format) in its final message. The coordinator can then embed those findings directly in the synthesis subagent's prompt, which is the only channel through which a downstream subagent receives anything.

The other approaches misread the architecture. There is no mechanism for one subagent to read another's transcript; discarded intermediate context is not a queryable resource. Re-running the searches in the coordinator duplicates cost and pulls the verbose output into the very context that delegation was protecting. And enlarging the synthesis model's context window addresses capacity when the actual problem is that the data was never delivered. See Subagents in the SDK for how context isolation and the final-message return work.

### 도메인

Agentic Architecture & Orchestration

## 질문 2

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : Some extracted invoices contain line items whose sum differs from the total printed on the document, and the downstream billing integration currently ingests whichever total appears in the extraction. How do you make these inconsistencies machine-detectable before ingestion?

**A.** Encode the reconciliation as a JSON Schema rule constraining the total field to equal the sum of the line_items array, so nonconforming extractions fail during decoding.

**설명**

JSON Schema cannot express cross-field arithmetic relationships such as one field equaling the sum of an array of other fields, and structured outputs do not even support numeric constraints like minimum or multipleOf. Schemas enforce structure and types, not business logic between fields.

**B.** Run each extraction twice at different temperatures and pass a document downstream only when both runs return the same total, treating any disagreement as a conflict.

**설명**

Agreement between two runs does not establish that the total reconciles with the line items; both runs can faithfully extract the same internally inconsistent figures from the source document. This doubles cost while leaving the actual arithmetic discrepancy undetected.

**C.** Add a prompt instruction telling the model never to output a total that disagrees with the line items, relying on structured outputs to enforce the corrected value.

**설명**

This instruction pressures the model to silently alter one of the values, hiding a genuine source-data inconsistency instead of surfacing it. Structured outputs enforce schema shape only; they cannot verify that a numeric value is arithmetically consistent with other fields.

**D(정답).** Extract both the document's stated total and a model-computed line-item sum as separate schema fields with a conflict_detected boolean, then recheck the arithmetic in code.

**설명**

This is the documented self-correction pattern for inconsistent source data. Capturing stated_total and calculated_total side by side makes any discrepancy explicit in the output, the conflict_detected flag lets downstream systems route inconsistent documents automatically, and the code-level arithmetic check guards against the model miscomputing the sum itself.

### 전반적인 설명

The core mental model here is the boundary between structural guarantees and semantic correctness. Structured outputs and tool-use schemas ensure the extraction is valid, parseable JSON with the right fields and types, but nothing in that mechanism checks whether the numbers inside are mutually consistent. When the source document itself is inconsistent (line items that do not sum to the printed total), the right design is not to suppress the inconsistency but to make it visible and machine-readable.

The self-correction extraction pattern does exactly that: the schema carries stated_total (what the document says), calculated_total (the sum of the extracted line items), and a conflict_detected boolean. A discrepancy between the two totals becomes a first-class signal that downstream systems can route on, for example holding conflicted invoices for human review while clean ones flow through. Because the model can also miscompute a sum, application code should independently recompute the line-item total; this is the semantic validation layer that schemas cannot provide.

The alternatives all misplace the check. JSON Schema has no vocabulary for cross-field arithmetic, and structured outputs explicitly exclude numeric constraints, so a schema-level reconciliation rule cannot exist. Running the extraction twice tests reproducibility, not correctness: two runs will happily agree on the same inconsistent source figures. And instructing the model to never let the totals disagree invites it to fabricate agreement, destroying the very signal that flags bad source data. See Structured outputs for what schema enforcement does and does not guarantee.

### 도메인

Prompt Engineering & Structured Output

## 질문 3

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : A teammate proposes requiring plan mode for every change the team makes with Claude Code, arguing that a review step never hurts. Which exception should the team policy make for direct execution?

**A(정답).** Execute directly when the scope is clear and the resulting diff could be described in one sentence.

**설명**

This is the documented criterion for direct execution: when the scope is clear and the fix is small, plan mode only adds overhead. Fixing a typo, adding a log line, or adding one conditional are exactly the cases where asking Claude to make the change directly is the right call.

**B.** Execute directly in unfamiliar codebase areas, since exploring while editing is faster than planning first.

**설명**

Unfamiliarity with the code being modified is one of the documented signals that plan mode is most useful, not least. Plan mode allows safe exploration before committing to edits, which is precisely what an unfamiliar area calls for.

**C.** Execute directly when several viable implementation approaches exist, letting one attempt reveal which works best.

**설명**

Multiple viable approaches are a documented reason to plan first, since iterating on a plan is far cheaper than executing one approach and cleaning up after it fails. Direct execution is for changes where the approach is already obvious.

**D.** Execute directly when a change spans dozens of files but every edit follows the same mechanical pattern.

**설명**

Changes that span many files are a documented case where planning pays off, even when the edits look repetitive. Committing to a pattern across dozens of files without an approved plan risks expensive rework if the pattern turns out to be wrong.

### 전반적인 설명

Claude Code's guidance draws a clean line between when planning earns its cost and when it is pure overhead. Plan mode is a read-only investigation phase: Claude can read files and run exploratory commands, but it makes no edits until you approve a plan. That gate is valuable exactly when getting the approach wrong is expensive, which the documentation identifies as three situations: the approach is uncertain, the change spans multiple files, or you are unfamiliar with the code being modified.

For small, well-understood changes, that same gate is friction with no payoff. The Claude Code best practices state this directly: plan mode adds overhead, and for tasks with clear scope and a small fix (a typo, a log line, a renamed variable, a single missing conditional), you should ask Claude to do it directly. The practical heuristic given is that if you can describe the diff in one sentence, skip the plan. Direct execution is not a separate named mode; it simply means prompting Claude to make the change under your normal permission mode settings, still with a precise prompt and a verification step afterward.

The mistaken proposals invert this framework. Many-file changes, unfamiliar territory, and competing approaches are the canonical plan-mode triggers: repetitive edits at scale still commit you to a pattern that is costly to unwind, exploring an unknown area while editing means committing changes before understanding is established, and trying one of several approaches directly turns the codebase into the experiment. A blanket plan-everything policy fails in the other direction, taxing trivial fixes with ceremony that slows the team without reducing risk on changes that carried none.

### 도메인

Claude Code Configuration & Workflows

## 질문 4

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : While iterating on the extraction module against a pre-written test suite, Claude Code makes a failing edge-case test pass by loosening the test's assertion instead of fixing the parsing logic. What keeps the test-driven loop trustworthy?

**A(정답).** Instruct Claude that removing or editing tests is unacceptable and that failures must be fixed in the extraction code.

**설명**

This is the documented safeguard for test-driven iteration: the test suite is the fixed target, and Claude must be told explicitly that weakening or deleting tests is not allowed because doing so hides missing or buggy functionality. With that constraint in place, the only path to a green suite is correcting the extraction logic.

**B.** Regenerate the test suite after each iteration so the assertions stay aligned with the current implementation.

**설명**

Tests regenerated from the current implementation verify whatever the code happens to do, not what it should do. This dissolves the entire point of writing tests first, since the target now moves to match every defect.

**C.** Replace the executable tests with a prose specification of expected outputs in CLAUDE.md for Claude to follow.

**설명**

Prose instructions are guidance the model may follow inconsistently, while an executable test gives Claude a check it can run and a failure signal to iterate against. Removing the runnable verification loop makes convergence slower and less reliable, not more trustworthy.

**D.** Add a standing manual review step where developers re-tighten any assertions Claude loosened before merging.

**설명**

This catches the symptom after the fact but institutionalizes rework instead of preventing the behavior. It also leaves every iteration inside the loop running against a weakened suite, so intermediate failure feedback is already corrupted before review happens.

### 전반적인 설명

Test-driven iteration only works if the tests are an immovable target. The loop's value comes from an asymmetry: the suite encodes required behavior, and the implementation is the only thing allowed to change. Anthropic's guidance for long-running, iterative work is to write tests before implementation, track them structurally, and explicitly remind Claude that removing or editing tests is unacceptable, precisely because a model optimizing for a passing suite will sometimes take the shortest path, which can be weakening an assertion rather than fixing the code. Making that constraint explicit closes the shortcut and forces failures to be resolved where they belong, in the extraction logic.

The underlying mental model is that Claude Code iterates best against a verification check it can run: execute the suite, read the failures, adjust the code, repeat. Every distractor damages that loop in a different way. Regenerating tests from the implementation turns the check into a mirror of the code, so it can never detect a defect. Replacing tests with prose in CLAUDE.md swaps a runnable, binary signal for instructions the model follows probabilistically, and it removes the failure output that drives each iteration. A manual re-tightening step is purely reactive: it does not stop the weakening, and it means the automated loop was iterating against a corrupted target the whole time.

See Prompt templates and variables for the guidance on writing tests first and prohibiting test edits during long-horizon iteration, and Claude Code best practices for the broader principle of giving Claude a verification check it can run and iterate against.

### 도메인

Claude Code Configuration & Workflows

## 질문 5

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The document analysis subagent needs both a listing of all available research corpora and the ability to fetch any single document's contents by its identifier. Which MCP resource design supports these two needs?

**A.** Define a single direct resource whose payload bundles the corpus listing together with the full text of every document it contains.

**설명**

Bundling all document contents into one resource forces the agent to pull the entire corpus into context whenever it only needs the catalog or one document. This defeats the purpose of a catalog, which is to provide a lightweight map so full content is fetched selectively.

**B.** Define one templated resource where passing a reserved identifier such as 'all' returns the listing instead of a single document.

**설명**

Overloading a single templated resource with a magic identifier conflates two different reads behind one URI, making the interface ambiguous and undocumented by its own structure. Direct and templated resources exist as separate forms precisely so a static listing and parameterized item access each get a clear address.

**C(정답).** Define a direct resource at a static URI for the listing, plus a templated resource with a {doc_id} parameter for individual documents.

**설명**

This matches how the two MCP resource types divide the work: a direct resource with a fixed URI serves the stable catalog, while a templated resource with a URI parameter lets the client request any single document by ID. Both needs are met through the read-oriented resource primitive without adding tools or oversized payloads.

**D.** Define a get_document tool for the per-document reads, since MCP resources take no parameters and can only serve data at fixed static URIs.

**설명**

This rests on a false premise: MCP supports templated resources whose URIs contain parameters, such as docs://documents/{doc_id}, which the SDK parses and passes to the handler. Reaching for a tool here misuses the action-oriented primitive for what is a pure read operation.

### 전반적인 설명

MCP resources are the protocol's read primitive: application-controlled data an agent can request without performing an action, analogous to GET endpoints. They come in two forms. A direct resource lives at a static URI (for example docs://documents) and is the natural home for a stable catalog such as a listing of research corpora. A templated resource embeds parameters in its URI (for example docs://documents/{doc_id}); the server SDK parses the parameter and passes it to the handler, so the agent can address any individual item by ID. Pairing one of each gives the subagent an immediate map of what exists and precise, on-demand access to any single document, all without exploratory tool calls.

The mental model to hold is that the choice between primitives follows the operation's nature, not its complexity. Fetching a document by ID takes an argument, but it is still a read with no side effects, so it belongs on a resource rather than a get_document tool; the claim that resources cannot take parameters is simply wrong. Bundling every document's full text into one giant direct resource turns a lightweight catalog into a context flood, forcing the agent to ingest the entire corpus to answer any question. And routing the listing through a reserved 'all' identifier on the per-document template hides two distinct interfaces behind one ambiguous URI, when the protocol already provides a separate form for each.

See the official protocol documentation on MCP Resources for direct resources, resource templates, and their intended usage.

### 도메인

Tool Design & MCP Integration

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

## 질문 7

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : Final reports occasionally include claims whose citations were silently dropped, and the team cannot determine at which stage the loss happens. How should the workflow be restructured to preserve citations and identify where loss occurs?

**A.** Restate the citation requirement in every prompt in the workflow so the instruction is reinforced at every processing stage.

**설명**

Repeating an instruction across steps remains prompt guidance, which is probabilistic and can still be violated silently. Without inspectable intermediate outputs, the team still cannot detect or localize where citations are lost.

**B(정답).** Split the workflow into chained sequential calls, validating claim-to-citation mappings at each stage before the next runs.

**설명**

This is correct. Prompt chaining makes each stage's intermediate output an inspectable artifact between calls, so programmatic checks can confirm citations survive each handoff and pinpoint exactly where a mapping was lost. This turns a silent end-to-end failure into a detectable, localized one.

**C.** Give each processing step an isolated context window so later steps cannot overwrite citation data held by earlier steps.

**설명**

Context isolation does not by itself preserve citations; each step can still emit output that omits source mappings. Nothing about isolated contexts prevents loss, and it offers no mechanism for identifying where the loss occurred.

**D.** Shorten each request's input so citation mappings stay out of the middle of long contexts where model attention weakens.

**설명**

Smaller inputs can reduce lost-in-the-middle effects, but this does not give the team a way to detect or localize citation loss. Attention improvements alone still leave failures invisible until the final report.

### 전반적인 설명

Prompt chaining means breaking a task into sequential API calls where each step's output becomes the next step's input. Its architectural value is not that each individual call is somehow smarter, but that the seams between calls become observable and enforceable: after the synthesis step returns, deterministic code can verify that every claim still carries its claim-to-source mapping before the report generator is invoked. Anthropic's guidance identifies exactly this as the reason chaining remains relevant even as models handle more multistep work internally: it lets you inspect intermediate outputs and enforce a specific pipeline structure. In a monolithic end-to-end request, citation loss happens inside a single opaque generation with no place to intervene.

The mental model is a pipeline with checkpoints. Each checkpoint is a chance to validate, repair, or halt, which converts a silent quality failure into a localized, diagnosable one; if citations vanish, the failing stage is identifiable because its input and output are both on record. The tradeoff is more calls and more orchestration code, which is why chaining is chosen when intermediate verification matters and skipped when it does not.

The other approaches describe real-sounding but wrong mechanisms. Restating the citation rule in every prompt is still probabilistic instruction-following, so violations remain possible and remain invisible. Shorter per-step inputs may mitigate attention degradation in long contexts, but that neither guarantees preservation nor reveals where loss occurred. And context isolation between steps does not protect citations at all: a step can simply produce output that omits them, and isolation provides no detection point. See Anthropic's prompt engineering documentation for the current guidance on when sequential chaining is the right structure.

### 도메인

Agentic Architecture & Orchestration

## 질문 8

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The document analysis subagent devises a categorization scheme in its first delegation. A second delegation tells it to reuse that scheme, but it reports knowing no such scheme. How should the coordinator fix this?

**A(정답).** Include the categorization scheme in the second delegation prompt, or resume the earlier subagent instance.

**설명**

This is correct. Every new, non-resumed ordinary subagent invocation creates a fresh instance, so the scheme must be passed explicitly in the delegation prompt, which is the documented parent-to-subagent channel. Alternatively, resuming the earlier subagent works because a resumed subagent retains its own prior conversation, tool calls, and reasoning.

**B.** Add SendMessage to the subagent's allowed tools so its memory persists and is shared across invocations.

**설명**

This is incorrect because SendMessage enables message passing between named agents active in a session; it does not create shared or persistent memory across subagent invocations. Granting it would not give a new instance access to an earlier instance's context.

**C.** Disable automatic context compaction between delegations so the scheme is not summarized away before the second run.

**설명**

This is incorrect because no compaction occurs between subagent invocations; there is nothing to disable. The scheme was not condensed out of a persisting context, it lived in a separate instance whose history does not automatically carry into a new invocation.

**D.** Instruct the second invocation to retrieve the scheme from the first run's intermediate tool results.

**설명**

This is incorrect because intermediate tool calls and results stay inside the subagent instance that produced them and are not available to a new instance. A fresh invocation has no channel through which to look up another run's tool results.

### 전반적인 설명

In the Claude Agent SDK, a subagent is not a long-lived worker with continuous memory; it is an instance created per invocation. Each new, non-resumed ordinary Agent tool call spawns a fresh instance whose context contains its own system prompt, the delegation prompt, its tool definitions, and startup material such as project CLAUDE.md, but nothing from any earlier run of the same agent type (resumed subagents and forks are the documented exceptions). Referring to "your established scheme" in a second delegation therefore points at material that, from the new instance's perspective, never existed.

The mental model is that a subagent's identity lives in its AgentDefinition (description, system prompt, tool restrictions), while its working state lives in a per-invocation context. Ordinary new invocations do not automatically carry over any prior subagent history; only an explicitly resumed subagent retains its own prior conversation, tool calls, and reasoning, and a forked subagent is a separate exception in that it inherits the parent conversation rather than starting fresh. This isolation is deliberate: it keeps verbose exploration out of the parent conversation and lets many instances run in parallel, at the cost of requiring the coordinator to carry state between runs. Two remedies fit this failure: include the categorization scheme explicitly in the second delegation prompt (the prompt string is the documented parent-to-subagent channel), or ask Claude to resume the earlier subagent.

The other actions misread the mechanism. There is no automatic compaction between subagent invocations, so there is nothing to disable; the prior context simply is not carried forward. SendMessage supports inter-agent messaging within a session, not cross-invocation memory. And intermediate tool results stay inside the instance that produced them, so a new invocation has no way to retrieve them. See Subagents in the SDK and Create custom subagents.

### 도메인

Agentic Architecture & Orchestration

## 질문 9

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Engineers trigger test-case generation on demand from a pull request comment and expect results within a few minutes. A teammate proposes moving this workload to the Message Batches API for the 50% savings. What should you do?

**A.** Move it to the Batch API and split each generation request into several smaller batch requests so processing completes faster.

**설명**

Splitting a request into smaller batch requests does not buy a faster completion time; the 24-hour window and absence of a latency SLA apply regardless of batch size. The workload remains unsuitable for asynchronous processing.

**B.** Move it to the Batch API and poll aggressively for completion, since small batches submitted during work hours typically finish within minutes.

**설명**

Polling frequency does not change processing time, and there is no guarantee that batches complete quickly at any hour or at any batch size. A request could still take many hours, leaving the engineer blocked.

**C(정답).** Keep this workload on synchronous calls because engineers wait for the results and batch processing carries no latency guarantee.

**설명**

This is correct. On-demand test generation is a blocking workload: an engineer is actively waiting for output, and the Message Batches API can take up to 24 hours with no latency SLA, so the discount cannot be safely captured here.

**D.** Move it to the Batch API with a synchronous fallback that re-runs any request still unfinished after ten minutes.

**설명**

A fallback re-run pays for the same work twice whenever the batch is slow, which erodes the savings the migration was meant to capture. It also adds complexity while still delaying the engineer by the fallback window on every slow request.

### 전반적인 설명

The Message Batches API trades latency for cost: you get a 50% discount in exchange for asynchronous processing that can take up to 24 hours with no guaranteed latency SLA. That tradeoff is the entire decision rule. The right mental model is to classify each workload as blocking (a human or pipeline gate is waiting on the result) or non-blocking (the result is consumed later, such as an overnight report or a weekly audit). Blocking workloads stay on the synchronous API; non-blocking ones are candidates for batching.

Developer-triggered test generation is blocking despite sounding like background work: the engineer who typed the command is waiting to see the suggested tests before proceeding. Because batch completion time is unbounded up to the window, no amount of aggressive polling, off-peak submission, or splitting into smaller batch requests makes the latency predictable; those tactics change how you observe or package the work, not how fast the service processes it. A synchronous fallback after a timeout is a particularly costly anti-pattern, since every slow batch means paying for the same request twice, undoing the savings and adding failure modes.

Where batching genuinely fits in this pipeline is scheduled, latency-tolerant analysis: nightly test generation over recently changed modules, weekly security audits, or overnight technical-debt reports. Those workloads have deadlines measured in hours, so the 24-hour window is acceptable and the discount is real. See Batch processing for the API's guarantees and limitations.

### 도메인

Prompt Engineering & Structured Output

## 질문 10

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pull request review step has the agent list every YAML manifest with a Glob call using **/*.yaml. The results include generated files under the gitignored dist/ directory, and the review flags them. What is the correct fix?

**A.** Fix the repository's .gitignore entries, since Glob only returns files from ignored directories when the ignore rules are malformed.

**설명**

This diagnosis is backwards: Glob does not consult .gitignore by default, so it returns ignored files even when the ignore rules are perfectly correct. Editing .gitignore will change what git tracks but will not change what Glob matches.

**B.** Replace Glob with Grep for the listing step, since Grep is the tool for locating files by name pattern and it skips ignored paths.

**설명**

Grep does skip gitignored files, but its purpose is searching inside file contents for patterns like function names or error strings, not enumerating files by name. Using it as the primary file-discovery mechanism swaps the tools into each other's territory.

**C.** Instruct the agent to drop the trailing entries of each result, since Glob orders ignored files after tracked ones.

**설명**

Glob sorts its results by modification time, not by tracked-versus-ignored status, so there is no positional boundary the agent could cut on. Recently regenerated dist/ files would in fact tend to appear early, making this heuristic actively misleading.

**D(정답).** Scope the pattern to source directories, such as config/**/*.yaml, because Glob matches gitignored paths by default.

**설명**

Glob performs pure path pattern matching and does not respect .gitignore by default, so generated files in dist/ are legitimate matches for a repo-wide pattern. Narrowing the pattern to the directories that actually hold source manifests removes the noise at the point where the search is defined.

### 전반적인 설명

The mental model for Glob is that it is a pure path pattern matcher: it walks the file tree and returns every path whose name matches the pattern, with no awareness of what git considers tracked, ignored, or generated. By default it therefore surfaces gitignored artifacts like build output in dist/ alongside real source files. This is a deliberate design choice; an agent sometimes needs to find generated or untracked files, so the tool does not silently filter them. Notably, this default differs from Grep, which skips gitignored files when searching contents, so the two tools can give an agent inconsistent views of the same repository if the difference is not accounted for.

Because the tool is doing exactly what it was asked, the fix belongs in the request: scope the pattern to the directories where source manifests actually live, such as config/**/*.yaml, rather than sweeping the whole tree with **/*.yaml. Precise patterns also keep results well under the 100-file cap and reduce irrelevant context entering the review.

The distractors each rest on a wrong model of the tool. Repairing .gitignore assumes Glob consults it, which it does not by default. Swapping in Grep misassigns roles: Grep searches inside files, and while it does honor ignore rules, it is not the file-discovery primitive. Trimming trailing results assumes an ordering guarantee that does not exist; Glob sorts by modification time, so freshly built artifacts often lead the list rather than trail it. See the Claude Code tools reference for the documented behavior of Glob and Grep.

### 도메인

Tool Design & MCP Integration

## 질문 11

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : You are defining the conditions under which the coordinator should stop autonomous work and hand a research request to a human operator. Which TWO escalation rules are appropriate? (Select TWO.)

**A(정답).** Escalate when the request concerns a topic category the system's operating guidelines do not address or permit.

**설명**

A gap in policy or guidelines is a correct escalation trigger. When the rules governing the system are silent on a specific request, the agent should not improvise a judgment call; a human must decide how to proceed.

**B(정답).** Escalate when retries, reformulated queries, and alternative sources have all failed to produce meaningful progress.

**설명**

Inability to make meaningful progress after reasonable recovery attempts is a first-class escalation trigger. Once local recovery options are exhausted, continued autonomous looping wastes tokens and delays a resolution only a human can provide.

**C.** Escalate when the synthesis agent's self-rated confidence in its draft findings falls below a preset numeric threshold.

**설명**

Self-reported confidence is an unreliable proxy for actual case difficulty because models are often confidently wrong precisely on hard cases. Thresholding on this signal produces both missed escalations and unnecessary ones.

**D.** Escalate when the research task requires coordinating all four specialized subagents at once, indicating unusual complexity.

**설명**

Structural complexity, such as how many subagents a task needs, is what the system was built to handle and is not by itself a reason to involve a human. Escalation keys on progress and policy coverage, not on how much orchestration a task requires.

### 전반적인 설명

Sound escalation design rests on observable, rule-based triggers rather than proxies. The three reliable triggers are an explicit human request, a policy gap (the governing rules are silent or ambiguous for this specific request), and inability to make meaningful progress after reasonable recovery attempts. The last two apply directly here: if the coordinator has exhausted retries, query reformulations, and alternative sources without advancing the research, further autonomy only burns tokens; and if a request falls into territory the system's guidelines never address, an autonomous agent improvising a decision substitutes model judgment for a governance decision that belongs to a human.

The mental model is that escalation triggers should be things the harness or the agent can verify, not things the model must estimate. Self-rated confidence fails this test: a model's confidence is poorly calibrated on exactly the cases where escalation matters most, so it is confidently wrong on hard problems and a numeric threshold on that signal routes cases essentially at random. Similarly, raw structural complexity (needing all subagents, many tool calls, a long plan) describes the work the system was designed to perform; treating it as an escalation signal would push routine, in-scope research to humans and defeat the purpose of building the multi-agent system in the first place.

In practice, these triggers are encoded as explicit criteria in the coordinator's system prompt, often with few-shot examples showing when to escalate versus continue, and the handoff itself carries a structured summary of what was attempted and any partial results so the human does not restart from zero. See Anthropic's guidance in Building Effective Agents and the Claude Agent SDK overview.

### 도메인

Context Management & Reliability

## 질문 12

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The extraction schema labels each contract clause with an enum of six clause types. On genuinely ambiguous clauses, the model still commits to one of the six types, and downstream teams act on wrong labels. Which change best fixes this?

**A.** Set the sampling temperature to zero so the model selects each clause type deterministically.

**설명**

This is incorrect because determinism does not create correctness; a temperature of zero makes the model repeat the same forced choice, not avoid it. The problem is that the schema offers no valid answer for ambiguous clauses, which no sampling setting can fix.

**B.** Run the classification twice for each clause and accept a label only when both runs return the same value.

**설명**

This is incorrect because agreement between two runs does not mean the label is right; the model can consistently pick the same wrong type for an ambiguous clause. It doubles cost and still provides no way to represent genuine ambiguity in the output.

**C.** Instruct the model in the prompt to assign a clause type only when it is highly confident in the label.

**설명**

This is incorrect because the schema still requires one of the six types, so the model has no legitimate way to express uncertainty regardless of what the prompt says. Confidence-based prose instructions are also vague and produce inconsistent behavior; the structural constraint wins over the instruction.

**D(정답).** Add an "unclear" value to the clause-type enum so the model can flag ambiguous clauses for human review.

**설명**

This is correct because a closed enum of only real categories forces the model to choose one even when the clause does not clearly fit any of them. An "unclear" value gives the model an honest escape hatch, and those extractions can be routed to human review instead of being acted on as confident labels.

### 전반적인 설명

Enum fields in an extraction schema are a forced-choice mechanism: when the request completes normally and the field is required, schema enforcement constrains the model to emit one of the listed values (Anthropic documents exceptions such as refusals, max_tokens truncation, and occasional capitalization differences in string enum values, so compliance is guaranteed in most cases rather than absolutely). That constraint is exactly why enum design matters. If every value in the list represents a definite category, the schema itself leaves no honest answer for a clause that does not clearly belong anywhere, so the model does what the structure demands and picks the closest match, which reads downstream as a confident classification.

The designed remedy is to make uncertainty a first-class value. Adding "unclear" to the enum gives the model a legitimate output for ambiguous cases, and it turns ambiguity into a machine-visible signal that the pipeline can route to human review instead of silently mislabeling. This is the same design principle as pairing an "other" value with a free-text detail field for inputs outside the known categories: the schema should be able to represent every truthful state of the source data, not just the convenient ones. Note that while standard JSON Schema allows any JSON value in an enum, Anthropic's structured outputs feature specifically restricts enum values to strings, numbers, booleans, and nulls, and Anthropic advises comparing string enum values case-insensitively since capitalization is not strictly guaranteed.

The other approaches fail because they leave the structural constraint in place. Prompt instructions to "only classify when confident" collide with a schema that demands a value, and vague confidence language is unreliable even without that conflict. Running the classification twice measures consistency, not correctness, and a forced wrong choice is often stable across runs. Temperature zero likewise changes how tokens are sampled, not whether the schema permits an honest answer. See Structured outputs for schema and enum constraints.

### 도메인

Prompt Engineering & Structured Output

## 질문 13

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The document analysis subagent defines one extraction tool per source type. Under the default tool_choice, it sometimes replies with a prose summary instead of calling any tool, breaking the coordinator's structured handoff. Which change guarantees structured output?

**A.** Set tool_choice to "none" and instruct the subagent to emit JSON matching one of the schemas in its text reply.

**설명**

The "none" mode prevents tool use entirely, pushing the output back into free text. JSON embedded in prose loses the schema enforcement that tool use provides, reintroducing markdown fences, commentary, and syntax errors downstream.

**B(정답).** Set tool_choice to "any" so a tool call is required while the subagent still picks the schema that fits each source.

**설명**

The "any" mode compels the model to call one of the provided tools while leaving the selection among them to the model. This eliminates prose replies by construction and preserves the per-source-type schema choice, which is exactly what an unknown document mix requires.

**C.** Keep tool_choice on "auto" and add emphatic prompt instructions requiring the subagent to always invoke one of its tools.

**설명**

Under "auto" the model retains the option to answer in text, and prompt emphasis only improves the odds of a tool call rather than guaranteeing one. The occasional prose reply would remain possible, so the structured handoff stays unreliable.

**D.** Force tool_choice to a single named extraction tool and apply that schema uniformly to every document the subagent receives.

**설명**

Forced tool selection guarantees a tool call, but it pins every document to one schema. Since sources vary by type, documents that do not match the forced schema would be extracted into the wrong structure, trading one failure mode for another.

### 전반적인 설명

The tool_choice parameter is the mechanism that determines whether the model may, must, or must not call a tool. It has four documented modes: auto (the default when tools are provided) lets the model decide between text and a tool call; any requires the model to call one of the provided tools but does not dictate which; tool forces one named tool; and none blocks tool use entirely. The failure in this situation, an occasional prose summary, is precisely the behavior auto permits, so the fix is a mode change rather than a prompt change.

For a subagent holding several extraction tools against documents of unknown type, any is the designed fit: the mandatory tool call means the output always arrives as schema-conformant tool input the coordinator can parse, while the freedom to choose among tools lets the model match each source to the appropriate schema. This is why guaranteed structure and flexible schema selection are not in tension; the mode was built to provide both at once.

The alternatives each break one side of that pairing. Forcing a single named tool welds every document to one schema, which is correct only when the document population is homogeneous or a specific extraction must run first. Staying on auto with stronger wording keeps the text-reply escape hatch open, because instructions influence probability rather than enforce a contract. And none abandons the tool-use channel altogether, returning to free-text JSON with all of its parsing fragility. See How to implement tool use for the full behavior of each mode.

### 도메인

Prompt Engineering & Structured Output

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

## 질문 15

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : An extraction subagent exhausts its local retries against the parsing service midway through a document batch, and the coordinator must now plan recovery. How should the subagent make its failure context available to the coordinator?

**A.** Configure the Agent tool to stream the subagent's intermediate tool results to the parent as they occur.

**설명**

Incorrect. The Agent tool does not forward a subagent's intermediate tool results to the parent as they occur, and there is no configuration that makes it do so. Intermediate activity remains within the subagent's context; the parent sees only the final result of the delegation.

**B.** Have the MCP server report each failed tool call directly to the coordinator over its own connection.

**설명**

Incorrect. MCP servers respond to the agent that called them; they have no side channel for pushing failure reports to a different agent. Error information travels only through tool results inside the calling subagent's conversation.

**C(정답).** Compile the failure type, the calls it attempted, and any partial extractions into its final message.

**설명**

Correct. Each subagent runs in its own isolated context, and only its final message returns to the parent. If the subagent does not deliberately compile the failure type, what it attempted, and its partial extractions into that final message, the coordinator has nothing to base recovery on.

**D.** Rely on the coordinator automatically receiving the subagent's full conversation transcript on completion.

**설명**

Incorrect. Subagents isolate their context by design: intermediate tool calls, tool results, and retry attempts stay inside the subagent's own conversation. The coordinator never receives the internal transcript, only the final message.

### 전반적인 설명

The keystone here is subagent context isolation. In the Claude Agent SDK, each subagent is a separate agent instance with its own conversation. Every tool call it makes, every error it receives, and every local retry it performs happens inside that private context. When the subagent finishes, only its final message is returned to the parent through the Agent tool. This design keeps the coordinator's context clean, sparing it dozens of verbose intermediate tool outputs, but it places a hard obligation on the subagent: anything the coordinator needs to know must be written into that final message.

For error propagation, this means the correct pattern is two-layered. First, the subagent attempts local recovery for transient failures (retry with backoff). Second, when recovery fails, it composes a structured report in its final message: the failure type, the calls it attempted, any partial extractions completed before the failure, and possible alternatives. The coordinator can then make an informed decision, such as re-delegating the remaining documents or proceeding with partial coverage annotated as a gap.

The distractors all imagine channels that do not exist. The coordinator does not automatically receive the subagent's transcript; the Agent tool does not stream intermediate tool results to the parent; and an MCP server has no independent connection through which it could report failures to an agent that never called it. Believing in any of these phantom channels leads teams to omit failure context from the final message, leaving the coordinator blind. See Subagents in the Claude Agent SDK for how subagent context isolation and result return work.

### 도메인

Tool Design & MCP Integration

## 질문 16

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : A pipeline script the team wrote forces extraction by setting tool_choice to {"type": "tool", "name": "extract_metadata"} before any enrichment step. The API response comes back with stop_reason "tool_use". What must the script do so enrichment can proceed?

**A.** Parse the extracted metadata out of the response's leading text block and pass those values into the enrichment prompt.

**설명**

This is incorrect because with a forced tool_choice the API prefills the assistant turn to produce tool use, so there is no natural-language text preceding the call. The extracted data lives in the tool_use block's input field, not in prose.

**B.** Resend the same request with tool_choice switched to the enrichment tool so the API chains both tool calls in order.

**설명**

This is incorrect because tool_choice constrains only a single response's tool selection; it cannot sequence a multi-step workflow. Resending without executing extract_metadata and returning its tool_result would also discard the pending tool call the conversation history expects.

**C.** Wait for the API to run extract_metadata on Anthropic's side and return the enrichment output within the same response.

**설명**

This is incorrect because client-defined tools are never executed by the API. Claude only emits a structured request to call the tool; the application is responsible for executing it and returning the result.

**D(정답).** Run the tool with the tool_use block's input, return a tool_result with the matching id, then continue to enrichment.

**설명**

This is correct because forcing a tool only shapes the model's response; it does not execute anything. The application must parse the tool_use block, run extract_metadata itself, send back a tool_result referencing the tool_use id, and then continue the loop into enrichment.

### 전반적인 설명

The mental model to hold here is that tool_choice is a constraint on what the model says, not an orchestration mechanism for what your system does. Forcing {"type": "tool", "name": "extract_metadata"} guarantees the response contains a tool_use block for that tool, and the response arrives with stop_reason: "tool_use". At that point the API's job is done. Your application must read the block's id, name, and input, execute the extraction logic itself, and append a tool_result block that references the tool_use_id in the next user message. Only then can the loop continue to enrichment, typically with tool_choice relaxed to auto so the model can select among enrichment tools. This division of labor is deliberate: the model stays a pure text-and-structure generator while your code retains full control over side effects, error handling, and sequencing.

The distractors each break this contract. Expecting the API to run the tool server-side confuses client tools with the model's own output; nothing executes automatically. Immediately resending with tool_choice pointed at the enrichment tool skips the pending tool call entirely, and tool-result formatting is strict; results must follow the assistant's tool-use message, so leaving it unanswered breaks the conversation structure. Looking for the metadata in a text block fails because when tool_choice is any or tool, the assistant turn is prefilled to force tool use, so no explanatory prose precedes the call; the structured data is the input of the tool_use block.

See How tool use works for the client-side agentic loop and Handle tool calls for parsing tool_use blocks and returning tool_result blocks correctly.

### 도메인

Prompt Engineering & Structured Output

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

## 질문 19

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : The team has defined custom subagents, but Claude sometimes delegates quick, iterative single-file edits to them, adding latency, while verbose test-suite runs stay in the main conversation and fill its context. What principle should govern when work is delegated?

**A.** Route by scope: send any task touching more than one file to a subagent and keep single-file changes in the main conversation regardless of output volume.

**설명**

File count is a poor proxy for the real criteria, which are output verbosity, self-containment, and the need for shared context. A multi-file refactor with tight iterative feedback belongs in the main conversation, while a single-file task that dumps thousands of lines of test output belongs in a subagent.

**B(정답).** Send self-contained, verbose-output tasks to subagents that return summaries; keep iterative work that shares context in the main conversation.

**설명**

This matches the documented decision rule. Subagents are ideal when a task produces verbose output the main context does not need and can be returned as a summary, while the main conversation is better for work requiring frequent back-and-forth or shared context, since a non-fork subagent starts fresh and must regather context.

**C.** Keep all work in the main conversation and run /compact after verbose steps, since results returned by subagents lose detail the main agent needs later.

**설명**

Compaction summarizes after the verbose output has already consumed the window and risks dropping important details, whereas a subagent keeps the noise out of the main context entirely. Subagent summaries losing needed detail is manageable by instructing what to report; it is not a reason to avoid delegation for verbose, self-contained work.

**D.** Delegate all tasks to subagents so the main conversation stays minimal, since context isolation always outweighs the cost of a fresh subagent start.

**설명**

Isolation is not free: a non-fork subagent starts with no parent conversation and needs time to gather context, so delegating quick iterative edits adds latency without benefit. The documentation explicitly recommends the main conversation for tasks needing frequent back-and-forth or fast, targeted changes.

### 전반적인 설명

The mental model here is that a subagent is a separate agent instance with its own context window. Its intermediate tool calls and verbose results stay inside that isolated context; only the final message returns to the parent. That design exists precisely so that noisy, self-contained work (running a test suite, exploring dozens of files, processing logs) does not accumulate in the main conversation. The tradeoff is that a non-fork subagent starts fresh: it does not inherit the parent conversation, so it needs time to gather context and cannot participate in iterative back-and-forth. This gives a clean selection rule: delegate when the work is self-contained and produces output you will not reference again, and stay in the main conversation when phases share significant context, when you are making quick targeted changes, or when latency matters.

The distractors each break this rule in a characteristic way. Delegating everything ignores the fresh-context startup cost and cripples iterative workflows. Keeping everything in one conversation and compacting afterward pays the context cost first and then applies a lossy summarization on top of it, when the whole point of a subagent is that the noise never enters the main window. Routing by file count substitutes an arbitrary structural heuristic for the actual decision variables of verbosity, self-containment, and shared context.

See the Subagents in the SDK documentation for the context isolation model, what subagents do and do not inherit, and the guidance on choosing between subagents and the main conversation.

### 도메인

Agentic Architecture & Orchestration

## 질문 20

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : The review job's --json-schema declares a suggested_fix_url field with "format": "uri", yet the comment-posting step occasionally receives values that are not valid URIs even though the run reported validated output. What is the correct fix?

**A(정답).** Validate URI syntax in the pipeline, since the format keyword is accepted as an annotation, not enforced.

**설명**

This is correct because Claude Code's schema validation treats the format keyword (such as uri or email) as an annotation only; it does not reject values that fail the format's syntax rules. Any syntax guarantee the downstream posting step depends on must be checked in pipeline code.

**B.** Add an explicit instruction in the prompt stating that the field must contain a syntactically valid URI.

**설명**

Prompt instructions raise the likelihood of well-formed values but provide no guarantee; the model can still emit a malformed URI that passes schema validation. A pipeline that posts comments automatically needs a deterministic check, not a probabilistic one.

**C.** Switch the invocation to --output-format stream-json so each finding is validated as it is emitted.

**설명**

The stream-json format changes how output is delivered (newline-delimited JSON for real-time streaming), not how schema validation works. The format keyword remains unenforced regardless of the output format chosen.

**D.** Add the field to the schema's required array so malformed URIs fail validation and trigger a reprompt.

**설명**

The required array only checks that the field is present in the output. It does nothing to verify the field's value is a syntactically valid URI, so malformed values would still pass validation.

### 전반적인 설명

When Claude Code runs with --output-format json and --json-schema, the output is validated against the supplied JSON Schema before it is returned as structured_output. That validation covers structural properties: types, required fields, enums, and object shape. The format keyword (for example "format": "uri" or "format": "email") is a different case: it is accepted but treated as an annotation, meaning a value like not-a-real-url passes validation as long as it is a string. This mirrors the JSON Schema specification itself, where format assertion is optional for validators, and it explains why a run can honestly report schema-validated output while still delivering values a downstream system cannot use.

The right mental model is a two-layer contract: the schema guarantees shape, and your pipeline code guarantees semantics. Anything the posting step actually depends on for correctness, such as a parsable URI, a resolvable file path, or a line number within the diff, needs a deterministic check in code before the comment is posted. Marking the field required only asserts presence, not syntax. Switching to stream-json changes the delivery mechanism (newline-delimited events instead of one final JSON envelope) without changing what validation enforces. Prompt instructions improve the odds of valid values but keep a nonzero failure rate, which is exactly what the pipeline is already experiencing.

See Headless mode for the documented note that format keywords are not enforced, and Structured outputs for how schema validation and retries behave.

### 도메인

Claude Code Configuration & Workflows

## 질문 21

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : Claude requests two extraction tools in a single response. The loop replies with one user message containing a text summary followed by both tool_result blocks, and the API rejects the request, citing tool_use ids without matching tool_result blocks. What resolves the error?

**A.** Send the results back in a message with role tool so the API can pair each output with its originating call.

**설명**

Anthropic's Messages API has no special tool or function role; tool use is integrated into ordinary user and assistant messages. Tool results are returned as tool_result content blocks inside a user message, paired to calls via tool_use_id, not via a dedicated role.

**B.** Merge both outputs into a single tool_result block whose content lists each tool's output in order.

**설명**

Each tool_result block answers exactly one tool call through its tool_use_id, which must match the id of the corresponding tool_use block. Combining two outputs into one block leaves the second tool_use id unanswered, so the same error would persist.

**C(정답).** Move both tool_result blocks to the start of the user message, placing any text content after them.

**설명**

Within a user message that returns tool results, all tool_result blocks must come before any text content, and each result must immediately follow the assistant turn containing its tool_use block. Reordering the message so the results lead and the summary trails satisfies the API's placement rules and clears the error.

**D.** Split the reply into two consecutive user messages, one tool_result per message, keeping the summary separate.

**설명**

All tool_result blocks answering a single assistant turn must appear in the user message immediately following that turn. Splitting them across two user messages means the second result no longer immediately follows its tool_use block, which violates the same placement rule the error describes.

### 전반적인 설명

When Claude emits stop_reason: "tool_use", it can request several tools in one assistant turn, and the harness is responsible for executing them and returning outputs in a way the API can pair back to the requests. The pairing mechanism has two parts: each tool_result block carries a tool_use_id that must match the id of its tool_use block, and the results must sit in the user message that immediately follows the assistant turn that made the requests. Within that user message, all tool_result blocks must come before any text content. Violating either rule produces errors like the one in this scenario, where tool_use ids are found without tool_result blocks immediately after.

The mental model is that tool results are not free-form narration; they are structured continuations of a request-response contract embedded in the normal message alternation. That is why the fix is purely a reordering: keep the summary text if it is useful, but place it after the results. It also explains why the other approaches fail. Anthropic deliberately avoids a separate tool role (unlike some other APIs), keeping everything in user and assistant messages; a single merged tool_result cannot reference two ids, so one call stays unanswered; and splitting results across two user messages breaks the adjacency requirement for the second result.

See Handle tool calls for the placement and pairing rules, and How tool use works for the overall request-execute-return cycle that drives the agent loop.

### 도메인

Agentic Architecture & Orchestration

## 질문 22

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The extraction schema already records each document's publication date, yet downstream reconciliation still flags contradictions: two reports published the same month state different values for one metric because one republishes a figure measured two years earlier. What schema change fixes this?

**A.** Add a rule that keeps only the value from the most recently published document and silently discards the other one.

**설명**

This arbitrarily selects one value, which is the documented anti-pattern for handling conflicting statistics. Publication recency is also the wrong signal here, since a newer document can republish an older measurement, so this rule can keep the stale figure.

**B(정답).** Add a field capturing the as-of or collection date of each extracted figure, distinct from the document's publication date.

**설명**

This is correct because the contradiction arises from when the figures were measured, not when the documents were published. Capturing the collection or as-of date for each figure lets downstream systems recognize that the two values describe different points in time rather than a genuine conflict.

**C.** Tighten validation to reject any extraction whose figures differ from values already stored for the same metric.

**설명**

This treats every temporal difference as an error and would discard legitimate newer measurements. Values for the same metric are expected to change over time, so rejecting differing extractions breaks the pipeline's ability to track that evolution.

**D.** Add a conflict_detected boolean so downstream systems can see that the two extracted values disagree with each other.

**설명**

A conflict flag records that a disagreement exists but provides no information for interpreting it. Without the measurement dates, downstream systems still cannot tell a temporal difference from a true contradiction, so the false conflict reports continue.

### 전반적인 설명

The failure here is a subtle but important distinction in temporal metadata: a document's publication date tells you when the document was released, while a figure's collection date (or as-of date) tells you when the underlying measurement was taken. Annual summaries, press releases, and republished reports routinely carry figures measured long before publication, so two documents published in the same month can legitimately report values from different years. If the schema only captures publication dates, downstream logic has no way to see that the two values describe different moments, and it misreads a temporal difference as a contradiction.

The structural fix is to require the as-of or collection date as a field on each extracted figure in the extraction tool's input_schema, the standard mechanism for reliable structured output with Claude. Adding the field prompts the model to surface the measurement date whenever the source document states or implies one, and making the field nullable handles documents that omit it without forcing the model to fabricate a value. Schema-driven tool use guarantees syntactic validity of the JSON, but not semantic correctness, so downstream validation logic remains necessary. Reconciliation can then order values chronologically and interpret a difference as change over time (for example, growth between two measurement dates) rather than as conflicting data.

The alternatives fail for characteristic reasons. Keeping only the most recently published value is arbitrary selection, the anti-pattern for conflicting statistics, and it can actually preserve the older measurement when a new document republishes stale data. A bare conflict_detected flag announces a disagreement without the date context needed to resolve it. Rejecting extractions that differ from stored values treats normal temporal drift as an error and destroys the system's ability to track metrics that change.

See Tool use with Claude for schema-driven structured output and How we built our multi-agent research system for Anthropic's guidance on preserving source and temporal metadata through aggregation.

### 도메인

Context Management & Reliability

## 질문 23

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : Claude Code is implementing a caching layer in a domain your team knows poorly. A test suite exists, and the first run reports several failures. Which two refinement practices fit this situation? (Select TWO.)

**A(정답).** Feed the failing test output back to Claude and iterate, letting each cycle apply fixes and re-run the suite to verify progress.

**설명**

This is correct because test-driven iteration is the documented feedback loop: runnable tests give Claude a concrete, verifiable target, and sharing failures each cycle guides progressive improvement until the suite passes. Each iteration preserves what already works and repairs what does not.

**B(정답).** Use the interview pattern before implementing so Claude asks questions that surface considerations like cache invalidation and failure modes.

**설명**

This is correct because the interview pattern is designed for unfamiliar domains: having Claude pose questions surfaces design considerations the team did not anticipate before code is written. It reduces the chance the implementation optimizes for the wrong assumptions.

**C.** Discard the current implementation after each failing run and regenerate it from scratch so earlier flawed reasoning does not carry over.

**설명**

This abandons progressive improvement, which is the core of test-driven iteration. Regenerating from scratch throws away the parts of the implementation the tests already validate and gives up the compounding benefit of correcting specific failures.

**D.** Relax the failing assertions so the suite passes now, then restore the original expectations once the implementation stabilizes.

**설명**

This weakens the very signal that makes test-driven iteration work. Loosened assertions let incorrect behavior pass unnoticed, and the deferred re-tightening often never happens, leaving the caching layer unverified against its real requirements.

### 전반적인 설명

Test-driven iteration with Claude Code has two dimensions worth internalizing: how you prepare before implementation, and how you feed failures back afterward. In an unfamiliar domain, the preparation step matters most. The interview pattern inverts the usual flow: instead of specifying everything up front, you ask Claude to interview you about the design. For a caching layer, that conversation naturally surfaces questions about invalidation strategy, stale reads, eviction under memory pressure, and behavior when the backing store is unavailable, considerations a team new to the domain often does not think to specify. Those answers then become concrete test cases before a line of implementation exists.

On the feedback side, the mechanism that makes iteration effective is a runnable check. A test suite gives Claude an objective, machine-verifiable definition of correct behavior, so each cycle is grounded: share the failure output, let Claude propose a fix, re-run the suite, and repeat. Failures caused by format or logic errors respond well to this loop because the failing test states exactly what was expected, and passing tests lock in behavior that later cycles must not break.

Both distractors sabotage that loop from opposite directions. Relaxing assertions to get a green suite destroys the feedback signal itself; the tests exist to encode expected behavior, and loosening them means the implementation is no longer being measured against the real requirements. Regenerating the implementation from scratch after every failing run discards the behavior the passing tests have already locked in and forfeits the whole point of iterating, which is that each cycle preserves what works and repairs what does not. See Claude Code Best Practices and the Claude Code common workflows documentation for the test-driven development workflow.

### 도메인

Claude Code Configuration & Workflows

## 질문 24

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : An engineer prototypes an experimental PDF-parsing MCP server and adds it to the project's .mcp.json. After the next pull, teammates hit connection errors for a server only the engineer runs. How should this server be configured?

**A.** Keep the entry in .mcp.json but gate it behind an environment variable that teammates leave unset.

**설명**

Environment variable expansion in .mcp.json substitutes values such as tokens into a server's configuration; it is not a mechanism for conditionally enabling or disabling a server. Teammates would still receive the entry and Claude Code would still attempt to connect to it.

**B.** Register the server in CLAUDE.md instead so it is documented but not automatically connected.

**설명**

CLAUDE.md provides project context and instructions to the model; it does not configure MCP servers, so the server would simply stop working for the engineer. Documentation is not a substitute for placing the configuration in the correct scope.

**C.** Add the entry to .mcp.json with a comment marking it as experimental so teammates know to ignore it.

**설명**

Standard JSON does not support comments, and even an annotation would not change behavior: Claude Code connects to every server configured in .mcp.json regardless of intent. Teammates would continue to see connection failures for a server they do not run.

**D(정답).** Move the server entry to ~/.claude.json so it applies only to the engineer's own environment.

**설명**

This is correct because ~/.claude.json holds user-scoped server configuration that is not shared through version control. Personal and experimental servers belong there, while .mcp.json at the project root is reserved for tooling every teammate should receive.

### 전반적인 설명

Claude Code separates MCP server configuration by scope, and scope follows audience. The project root file .mcp.json is designed to be checked into version control, so every entry in it is a promise to the whole team: each contributor's Claude Code instance will discover and attempt to connect to that server. That makes it the right home for shared, stable integrations, and exactly the wrong home for a prototype that runs on one machine. User-scoped configuration in ~/.claude.json lives in the engineer's home directory, is never committed, and follows only that user, which is why personal and experimental servers belong there.

The mental model is that scope placement is an architectural decision about who consumes a tool, not a labeling problem. Approaches that keep the entry in the shared file, whether by annotating it or by leaving an environment variable unset, misunderstand what the file does: every configured server is connected at startup, and ${VAR} expansion exists to substitute secrets like tokens into a configuration, not to toggle a server on or off. Moving the entry to CLAUDE.md fails in the other direction, since that file supplies project context to the model and plays no role in MCP server configuration. When the parser matures into shared team infrastructure, the entry can graduate into .mcp.json deliberately, with any credentials referenced through environment variable expansion.

See Connect Claude Code to tools via MCP for the scope options and configuration file locations.

### 도메인

Tool Design & MCP Integration

## 질문 25

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : A team's CLAUDE.md states that files under src/generated must never be edited by hand, yet Claude Code still occasionally modifies them during long refactoring sessions. Which change guarantees the rule is enforced on every run?

**A.** Add few-shot examples to the system prompt showing correct refusals whenever a proposed change would touch a file under the generated directory.

**설명**

Few-shot examples improve the odds that the model declines such edits, but they remain prompt-level guidance and cannot guarantee compliance on every run. They are suited to shaping nuanced behavior, not to enforcing a rule that must never be violated.

**B.** Run every session in plan mode so each proposed edit to a generated file is reviewed and approved by the team before execution begins.

**설명**

Plan mode is a workflow choice for scoping work in a read-only phase, not an enforcement mechanism for the execution that follows. Once the team approves a plan and execution begins, nothing in plan mode prevents an edit to a generated file from being carried out.

**C.** Move the rule to the very top of the project CLAUDE.md, mark it IMPORTANT, and restate the same prohibition in the user-level memory file as well.

**설명**

CLAUDE.md content is guidance the model follows probabilistically, and emphasis only raises a rule's priority relative to quieter instructions around it. Even a prominently placed rule retains a non-zero failure rate, which the observed occasional edits already demonstrate.

**D(정답).** Add a PreToolUse hook that blocks all file-modifying tool calls (Edit, MultiEdit, Write, and Bash) whenever they target paths under src/generated.

**설명**

A PreToolUse hook runs as code before the tool call executes, and by matching every tool capable of changing files, including shell commands, it closes each path by which a generated file could be modified. This converts probabilistic instruction-following into a deterministic guarantee, which is exactly what an always-hold rule requires.

### 전반적인 설명

This is the core enforcement distinction in agentic system design: hooks are code that runs; CLAUDE.md, system prompts, and few-shot examples are instructions the model follows. Instructions provide probabilistic compliance, typically high but never 100%, because every line in a memory file competes with every other line for the model's attention, and long sessions with heavy context are precisely where a single rule is most likely to slip. A PreToolUse hook sits outside the model entirely: it intercepts the outgoing tool call, inspects it, and can refuse it before anything touches the filesystem. The violating edit is not discouraged; it is made impossible. One detail matters for the guarantee to hold: the hook's matcher must cover every file-modifying path, not just Edit and Write, because MultiEdit and shell writes issued through Bash can change files too. A hook that watches only some of those tools leaves the rule enforceable in principle but bypassable in practice.

The mental model to carry into architecture decisions is a two-tier one. Use prompt-level guidance (CLAUDE.md rules, few-shot examples, phrasing improvements) for preferences, conventions, and behaviors where flexibility and nuance matter and an occasional miss is tolerable. Use programmatic enforcement (hooks, preconditions in your harness) whenever a failure has real consequences, such as protected files, refund thresholds, or identity verification before financial operations. The scenario's own evidence, a documented rule that is still occasionally violated, is the signature of a hard rule placed on the wrong surface.

The distractors all stay on the instruction tier or misapply a mode. Stronger emphasis in CLAUDE.md and few-shot refusal examples both raise the probability of compliance without eliminating the failure mode. Plan mode is read-only while planning, but it governs how work is scoped, not what execution may do afterward; an approved plan can still be carried out with an edit the reviewers did not anticipate. See the Claude Code hooks documentation and the memory (CLAUDE.md) documentation for how each surface behaves.

### 도메인

Agentic Architecture & Orchestration

## 질문 26

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The coordinator receives a broad research topic in a domain the team has never covered; the relevant subtopics and useful source types are unknown in advance. How should the coordinator decompose the research work?

**A(정답).** Run an initial scoping pass to map the topic's subareas, then build a prioritized delegation plan that is revised as subagent findings arrive.

**설명**

This is the correct pattern for open-ended investigation: map the terrain first, prioritize delegations by expected value, and let intermediate findings reshape the plan. Dynamic adaptive decomposition is designed for exactly this situation, where the full scope cannot be known up front.

**B.** Assign the entire topic to a single general research subagent and let its raw output determine the report's structure and coverage.

**설명**

This abandons decomposition entirely rather than choosing a strategy for it. A single subagent working an entire broad topic accumulates verbose context, dilutes attention across subareas, and gives the coordinator no ability to prioritize, parallelize, or fill gaps.

**C.** Spawn one subagent per guessed subtopic in a single parallel batch, then synthesize whatever coverage those initial guesses happen to produce.

**설명**

Parallel spawning is efficient, but committing all delegations to unverified guesses locks the coverage decision in before any evidence exists. Without a scoping step or a mechanism to revise the plan, wrong guesses become permanent gaps in the final report.

**D.** Delegate against a fixed set of standard research categories, running the same predefined subagent sequence the system applies to every topic.

**설명**

A fixed prompt-chained pipeline suits predictable, repeatable work such as a review that always checks the same aspects. An unfamiliar topic with unknown subtopics will not reliably fit predefined categories, so this approach produces coverage gaps whenever the topic diverges from the template.

### 전반적인 설명

Choosing a decomposition strategy starts with one question: is the task's structure known in advance? A recurring review with fixed aspects fits prompt chaining, a predetermined sequence of focused passes. An unfamiliar research topic is the opposite case: the subtopics themselves are unknowns, so the right pattern is dynamic adaptive decomposition. The mental model is exploration before commitment: an initial scoping pass maps the topic's structure, the coordinator builds a prioritized plan from that map, and each round of subagent findings can add, drop, or reorder subtasks. This is why the plan must stay revisable; a topic's most important thread often only becomes visible after the first delegations return.

The distractors each break a different part of this model. A fixed category template imports prompt chaining into a task whose structure it cannot predict, so anything outside the template is silently missed. Spawning a full parallel batch of guessed subtopics preserves parallelism but freezes coverage decisions at the moment of least information, with no correction loop. Handing the whole topic to one subagent avoids the decomposition decision altogether, sacrificing the context isolation and parallel execution that are the reasons a multi-agent architecture exists. Note that dynamic decomposition still uses parallelism; the difference is that parallel delegations are issued from an informed, evolving plan rather than a one-shot guess.

For how Anthropic applies this pattern in a production research system, see How we built our multi-agent research system, and for the delegation mechanics, see Subagents in the SDK.

### 도메인

Agentic Architecture & Orchestration

## 질문 27

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : A stack trace shows the pipeline's date normalizer rejects two-digit years, and the fix is one added conditional in a single function. A teammate asks whether to enter plan mode in Claude Code before making this change. What do you advise?

**A.** Delegate to an Explore subagent to survey the codebase before touching the normalizer function.

**설명**

This is incorrect because the Explore subagent exists to isolate verbose discovery output during multi-phase tasks on large or unfamiliar codebases. Here the stack trace has already localized the defect to one function, so there is no discovery phase to isolate.

**B.** Enter plan mode first, because any edit to validation logic deserves a reviewed plan before changes land.

**설명**

This is incorrect because plan mode is reserved for uncertain approaches, multi-file changes, or unfamiliar code, not applied categorically to a whole class of files. A one-line conditional with a known cause gains nothing from a planning phase and simply slows the fix down.

**C.** Start in plan mode and approve the plan immediately, so the fix still inherits the safety of a review step.

**설명**

This is incorrect because approving a plan without genuinely reviewing it provides no real safety benefit; it only adds ceremony to a trivial change. The review step is valuable when there are competing approaches or broad impact to evaluate, neither of which applies to a one-conditional fix.

**D(정답).** Use direct execution, since the change is scoped to one function and the approach is already clear.

**설명**

This is correct because direct execution is the appropriate choice for small, well-understood changes with a clear scope, such as adding a single conditional to one function identified by a stack trace. Plan mode would add overhead without improving the outcome for a fix this narrow.

### 전반적인 설명

The plan mode versus direct execution decision is about matching process weight to uncertainty. Plan mode puts Claude Code into a read-only research posture: it explores files and proposes an implementation plan, and edits are blocked until the plan is approved. That is valuable when the approach is uncertain, the change spans many files, or the code is unfamiliar, because iterating on a plan is far cheaper than cleaning up a wrong implementation. Anthropic's guidance is explicit that planning adds overhead, and that clear, small-scope fixes should simply be done directly; a useful heuristic is that if the diff can be described in one sentence, you can skip the plan.

In this situation the diagnosis is already complete: the stack trace names the function, the failure mode is understood, and the remedy is one conditional. There is no ambiguity for a plan to resolve, so direct execution gets the fix in faster without sacrificing anything. Blanket rules like always plan for validation code misapply the framework, because the trigger for planning is uncertainty and breadth, not the subsystem being edited. Approving a plan without reading it is worse than skipping planning, since it keeps the cost while discarding the benefit. Likewise, the Explore subagent solves a context problem (keeping verbose discovery output out of the main conversation during long multi-phase work), which does not exist when the defect is already localized.

See Claude Code best practices for the guidance on when to plan versus execute directly, and Permission modes for how plan mode behaves before a plan is approved.

### 도메인

Claude Code Configuration & Workflows

## 질문 28

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : Your team wants some Claude Code generated refactors to merge without human review while riskier changes are reviewed. Which routing design should you recommend as most reliable?

**A.** Have the model report a fine-grained percentage confidence and auto-merge changes above a precisely tuned cutoff.

**설명**

This is incorrect. Increasing the granularity of the scale does not fix the underlying problem, which is that the number is not calibrated against actual outcomes. A miscalibrated percentage is no more trustworthy than a miscalibrated integer.

**B.** Average the model's self-rating across several repeated runs and auto-merge when the smoothed mean is high.

**설명**

This is incorrect. While sampled outputs can vary, reproducibility is not the core defect. Even a perfectly stable averaged self-rating would still be unreliable, because the model's stated confidence does not correspond to the true likelihood that the change is correct.

**C.** Have the model self-rate each refactor on a 1 to 10 scale and auto-merge only changes it rates 9 or above.

**설명**

This is incorrect. A strict threshold still routes on an uncalibrated signal, so confidently wrong changes with a self-rating of 9 or 10 would still merge unreviewed. Threshold placement cannot repair a signal that does not correspond to actual correctness.

**D(정답).** Gate unreviewed merges on objective checks such as passing tests and type checks rather than any self-rated score.

**설명**

This is correct. A model's self-reported confidence does not reliably track the actual difficulty or risk of a change, and it tends to be most confidently wrong on subtle, hard cases. Routing on objective, checkable signals like passing tests keeps oversight on the changes that need it most.

### 전반적인 설명

The mental model to hold here is that a language model's self-reported confidence is just another generated token sequence, not a measurement. Nothing in generation forces the number to correlate with the true probability that the output is correct, and in practice the correlation is poor: models are frequently confidently wrong on subtle or hard cases, which is exactly the population a review gate exists to catch. Routing on raw self-ratings therefore inverts the safeguard, waving through the risky changes while the model happily assigns them high scores.

Sound alternatives replace the subjective proxy with signals that are either objective or calibrated. Objective, checkable gates (tests passing, type checks, lint, scope of the diff) can be enforced deterministically, for example through Claude Code hooks, which run as code rather than as instructions the model might not follow. Where confidence scores are genuinely useful, as in extraction pipelines, they must first be calibrated against a labeled validation set so thresholds reflect measured error rates rather than the model's mood. Anthropic's customer support guidance makes the same point about escalation: reliable routing comes from explicit criteria and tracked outcomes, not from proxies like sentiment or self-rated certainty.

The rejected designs each adjust a secondary property while leaving the flawed signal in charge. A strict 9-or-above cutoff still merges the confidently wrong changes that score 9 or 10; switching to a percentage adds precision to an uncalibrated number; and averaging repeated runs stabilizes a rating that is dangerous even when stable. The proposal fails on validity, not on threshold placement, precision, or reproducibility.

### 도메인

Context Management & Reliability

## 질문 29

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The team's custom extraction MCP server now exposes an additional redact_pii tool. An engineer proposes tearing down and re-establishing every live agent connection so sessions can pick it up. What alternative does MCP provide?

**A(정답).** Have the server send a list_changed notification so connected sessions refresh their tool inventory without reconnecting.

**설명**

This is correct because MCP supports list_changed notifications, which let a connected server announce that its tools, prompts, or resources have changed. The client then re-runs capability discovery and updates the available tool set with no disconnect or reconnect required.

**B.** Restart every running session, since tool discovery happens exactly once when a server connects and cannot change afterward.

**설명**

This is incorrect because discovery at connection time is the initial mechanism, not the only one. The protocol's list_changed notification exists precisely so a server can update its capabilities during an active connection, making forced restarts unnecessary.

**C.** Append the new tool's name and input schema to each agent's system prompt so the model learns it exists mid-session.

**설명**

This is incorrect because describing a tool in prose does not register it with the client; the agent still cannot invoke a tool that was never surfaced through protocol-level discovery. Tool availability is established by the MCP capability exchange, not by prompt text.

**D.** Add an entry for the new tool to .mcp.json, since the configuration file controls which individual tools each server exposes.

**설명**

This is incorrect because .mcp.json configures servers (their command, transport, and environment), not individual tools. The tools a server exposes are reported by the server itself through discovery requests, so no per-tool configuration entry exists to add.

### 전반적인 설명

The mental model to hold is that MCP tool availability is a live capability exchange, not a static registration. When a client such as Claude Code or an Agent SDK harness connects to a server, it issues discovery requests (tools/list, prompts/list, resources/list) and builds its tool inventory from the responses. Because the server is the source of truth for what it offers, the protocol also defines list_changed notifications: a connected server can announce that its tools have changed, prompting the client to re-discover and update the inventory in place. If a refresh attempt fails, the client keeps the previously discovered capabilities until a later refresh succeeds, so sessions degrade gracefully rather than losing tools.

This design is why tearing down live connections is the wrong instinct: reconnecting works mechanically, but it discards session continuity to solve a problem the protocol already handles. It also explains why the two distractor mechanisms fail. Prompt text can describe a tool, but the model can only call tools the client has actually registered through discovery, so prose alone changes nothing. And .mcp.json operates one level up: it declares which servers exist and how to launch them, while each server's tool list is entirely the server's own report. For an extraction system whose custom server evolves frequently (new redaction, validation, or normalization tools), relying on dynamic discovery keeps long-running sessions current without operational churn.

See Claude Code MCP documentation and the Agent SDK MCP guide for details on discovery and dynamic capability updates.

### 도메인

Tool Design & MCP Integration

## 질문 30

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : Analysts send visibly frustrated messages about extraction errors the assistant could correct itself, without asking for a human. A teammate proposes routing any message scoring above a frustration threshold to the data team. Which escalation design is sounder?

**A.** Route every disputed extraction to the data team on the analyst's first complaint so frustrated users never have to keep interacting with the assistant.

**설명**

Escalating on the first expression of dissatisfaction treats frustration as if it were a request for a human, which it is not. This forfeits resolutions the assistant is fully capable of delivering and floods the data team with cases that needed only an acknowledgment and a fix.

**B.** Keep the sentiment threshold but calibrate it against labeled historical analyst messages so frustration scores route cases more accurately.

**설명**

Calibration does not fix the underlying problem: sentiment is an unreliable proxy for whether a case actually needs a human. An analyst's tone does not correlate with case complexity, so even a well-tuned threshold escalates resolvable issues and misses genuine escalation triggers.

**C.** Have the assistant self-rate its confidence on each disputed case and hand off to the data team whenever the rating falls below a set threshold.

**설명**

Model self-rated confidence is poorly calibrated: the model can be confidently wrong on exactly the hard cases where escalation matters. A confidence threshold therefore substitutes another unreliable proxy for the clear signal the design should key on, the analyst's own explicit request.

**D(정답).** Acknowledge the frustration, offer a correction the assistant can make, and escalate promptly if the analyst then explicitly asks for human review.

**설명**

This is the correct pattern when frustration arrives without any request for a human: acknowledge the emotion, propose a concrete fix, and hand off the moment the analyst explicitly asks for a person. It preserves first-contact resolution while still honoring any explicit escalation request immediately when it is made.

### 전반적인 설명

The escalation question here is really a question about signals: what evidence tells the system a case has left the assistant's competence? Two candidate signals in the options, sentiment scores and model self-rated confidence, are both documented as unreliable proxies. An analyst's tone tells you how annoyed they are, not how hard the case is; routine extraction errors often produce the angriest messages precisely because they are obviously wrong. Self-rated confidence fails for a subtler reason: the model retains the reasoning that produced the error, so it tends to be confidently wrong on exactly the cases that most need a second look.

The reliable signals are behavioral and explicit. An explicit request for a human is a first-class trigger and is honored immediately whenever it appears, whether in the first message or later in the exchange. In this scenario no such request has been made: the messages express frustration about an issue within the assistant's capability. The designed flow for that situation is to acknowledge the emotion first, then offer a concrete resolution, and escalate the moment the analyst explicitly asks for a person. This ordering matters. Acknowledging frustration defuses the interaction; offering a fix protects the resolution rate the system exists to achieve; treating any explicit request as an immediate trigger ensures the handoff happens as soon as the user has clearly asked for it. A first expression of dissatisfaction is not the same thing as a request for a human, and conflating the two is what makes both threshold-based designs over-escalate.

Escalating every dispute on first contact fails in the other direction: it turns the human reviewers into the default path, which defeats the purpose of an automated correction loop and burns limited reviewer capacity on cases the assistant could close in one exchange. Anthropic's guidance on agent design consistently favors simple, explicit decision criteria over inferred proxies; see Building Effective Agents for the broader principle of grounding agent behavior in clear, checkable rules rather than model self-assessment.

### 도메인

Context Management & Reliability

## 질문 31

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

## 질문 32

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The extraction prompt contains four few-shot examples, all drawn from a single supplier's invoice layout. Accuracy is high on that layout, but values land in the wrong fields on documents with other structures. What change best fixes this?

**A.** Add a prose instruction stating that layouts vary and the example layout should not be assumed elsewhere.

**설명**

This names the goal without transferring the judgment; the model is told layouts differ but is still shown only one. Abstract instructions are documented as less effective than demonstrations for shaping output behavior, so the examples themselves must carry the variation.

**B.** Add fifteen more examples from the same supplier's invoices so the extraction pattern is reinforced.

**설명**

Adding more examples from the identical layout strengthens the unintended layout-specific pattern instead of breaking it. The failure is overfitting to one structure, and more of the same structure deepens that overfit while bloating the prompt.

**C.** Expand the prompt into an exhaustive catalog with one example per layout the system may ever encounter.

**설명**

This treats few-shot prompting as case matching rather than generalization, and it is infeasible because unstructured documents arrive in layouts that cannot be enumerated in advance. A small, well-chosen diverse set lets the model extrapolate to structures it has never seen.

**D(정답).** Replace the set with a few examples spanning varied document structures so the extraction logic generalizes.

**설명**

Diverse examples covering different structures teach the model what to extract rather than where a specific layout places it. Anthropic's guidance is that examples should be relevant and diverse enough that the model does not pick up unintended patterns, which is exactly what a single-layout example set creates.

### 전반적인 설명

Few-shot examples do double duty: they demonstrate the desired output, but they also implicitly teach every regularity they share. When all four examples come from one supplier's layout, the shared layout becomes part of the learned pattern, so the model binds fields to positions in that layout rather than to the semantic content it should be extracting. Anthropic's guidance on multishot prompting makes this explicit: examples should be relevant, diverse, and cover edge cases precisely so the model does not pick up unintended patterns. Swapping the homogeneous set for a handful of examples drawn from structurally different documents removes the spurious signal and leaves only the intended one, letting the extraction logic transfer to layouts the prompt never showed.

The distractors fail in instructive ways. Piling on more same-supplier examples reinforces the overfit rather than curing it; example count is not the lever, example variety is. A prose disclaimer that layouts vary states the goal without demonstrating it, and Anthropic documents that concrete examples of desired behavior are more effective than abstract instructions for shaping output. An exhaustive per-layout catalog misunderstands the mechanism entirely: the value of few-shot prompting is that Claude generalizes from a small set, so you do not need, and for genuinely unstructured input cannot build, a case-matching table of every format. Keep the set small (roughly 3 to 5 examples), make each one structurally distinct, and wrap them in <example> tags so they are clearly separated from instructions. See Anthropic's prompt engineering documentation for the full guidance on crafting effective examples.

### 도메인

Prompt Engineering & Structured Output

## 질문 33

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : You fork a session after a completed baseline document analysis so two branches can each develop a candidate extraction schema, writing schema files into the project directory. How do you keep the branches from interfering with each other?

**A.** Fork the session and rely on the fork to snapshot the project files at the branch point, keeping each branch's schema edits separate.

**설명**

Forking does not snapshot or copy files. It duplicates conversation context only, so any file the analysis touched remains a single shared copy that both branches can modify and observe.

**B.** Fork the session and let each fork's automatically created git worktree give it an independent copy of the project's file tree.

**설명**

Worktrees do provide independent file trees for parallel work, but they are a separate mechanism you must set up; forking a session does not create them automatically. A fork by itself leaves both branches on the same working directory.

**C(정답).** Fork the session for the shared analysis context, and give each branch its own worktree or output path for its schema files.

**설명**

This is correct because a fork duplicates the session's conversation history at the branch point, but sessions persist conversation history, not filesystem state. Both branches read and write the same project files by default, so you must separate their file output yourself with a mechanism like worktrees or distinct output paths.

**D.** Fork the session and use its file checkpoint at the branch point to roll back schema edits the other branch makes when needed.

**설명**

File rollback is the job of file checkpointing, which is distinct from session forking. A fork carries no file-state checkpoint, so neither branch gains any ability to undo the other's edits.

### 전반적인 설명

The mental model to hold is that a session is accumulated conversation history: the original prompt, tool calls, tool results, and responses, which the SDK writes to disk so it can be resumed or forked later. When you fork, both branches inherit that history up to the branch point and then diverge as independent conversations. What a fork emphatically does not do is duplicate or sandbox the filesystem. Sessions persist conversation history, not filesystem state, so two forked branches that both write schema files into the same project directory are editing one shared set of files, and each branch will see (and can be confused by) the other's changes.

This division of labor is deliberate. Forking exists to make reasoning divergence cheap: you pay for the baseline analysis once and explore two extraction-schema designs from the same context. Keeping files divergent is a different problem with different tools: file checkpointing supports rolling files back, and worktrees give parallel sessions genuinely independent file trees. An architect comparing two schema approaches that both materialize files should therefore fork the session for the shared context and pair each branch with its own worktree or output path for the artifacts.

The distractors each attribute a file-isolation capability to forking that belongs elsewhere: an automatic file snapshot does not happen, worktrees are not created implicitly by a fork, and rollback comes from checkpointing rather than from the fork itself. See Session Management in the Agent SDK for how sessions, resuming, and forking behave.

### 도메인

Agentic Architecture & Orchestration

## 질문 34

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Claude often calls the wrong one of two review tools, flag_style_issue and flag_security_issue, which carry near-identical descriptions; enabling strict tool use did not stop the misrouting. What should the team change next?

**A.** Add input_examples to both tool definitions, since strict enforcement does not take effect until each tool includes examples.

**설명**

This is incorrect. The input_examples field is an optional aid for showing Claude how to structure valid inputs; it is not a prerequisite for strict enforcement. The premise is wrong, and examples of input structure do not resolve the overlap between the two descriptions.

**B.** Validate the tool results the pipeline returns to the model against each tool's schema before sending them back to Claude.

**설명**

This is incorrect and reverses the direction of the guarantee. Strict tool use validates the inputs Claude produces when calling a tool, ensuring they match the declared schema. Validating results the harness returns does nothing to change which tool Claude selects.

**C.** Set tool_choice to force a specific named tool on each request, since strict enforcement only applies when selection is forced.

**설명**

This is incorrect. Strict tool use applies to the tool calls Claude generates regardless of whether tool selection is automatic or forced, so the setting was already in effect. Forcing a single tool also removes Claude's ability to route between the two review tools, which the pipeline needs.

**D(정답).** Rewrite both tool descriptions with boundary language stating when to use each tool, keeping strict tool use for schema enforcement.

**설명**

This is correct. Strict tool use enforces that generated inputs conform to the schema and that the named tool exists, which is a syntactic guarantee; it does not influence which of two semantically overlapping tools Claude picks. Selection is driven by the tool descriptions, so differentiating them with clear when-to-use boundaries addresses the actual failure.

### 전반적인 설명

This failure is semantic misrouting, not malformed output, and the two problems are fixed by different mechanisms. Strict tool use guarantees that every tool call Claude emits names a real tool from the available set and carries inputs that validate against that tool's input_schema. It closes off failure modes like wrong parameter types, omitted required fields, and invented parameters. What it cannot do is decide, between two tools whose descriptions read almost identically, which one the request actually calls for. In this case the wrong-tool calls were already schema-valid, which is exactly the signature of a selection problem rather than a formatting problem.

The mental model to hold is that Claude routes among tools primarily by reading their descriptions. Anthropic's troubleshooting guidance lists description ambiguity as the likely cause when Claude calls tool A where tool B was wanted, and the documented fix is to sharpen each description so it differentiates the tools by when to use them, not only what they do; detailed descriptions are called out as by far the most important factor in tool performance. So the remedy lives in the tool definitions themselves: give the style tool and the security tool descriptions that carve out non-overlapping territory.

The alternative actions rest on misreadings of the feature's boundaries. Strict enforcement is not gated on a forced tool_choice, and forcing one tool would break routing entirely; strict mode constrains model-generated inputs, not the results a harness returns; and input_examples is an optional field for clarifying complex input structure, not a precondition for strict mode. Knowing precisely what each mechanism guarantees, and what it leaves untouched, is what lets an architect apply the right fix to the right failure. See Strict tool use, Troubleshooting tool use, and Implement tool use.

### 도메인

Tool Design & MCP Integration

## 질문 35

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

## 질문 36

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The team plans an overnight Message Batches API run that generates review findings for 8,000 legacy files. Reprocessing poor results would be costly. What should happen before the full batch is submitted?

**A(정답).** Iterate the prompt on a representative sample that includes edge cases, refining until outputs consistently pass validation.

**설명**

This is the documented approach: refine the prompt against a small sample that mirrors the real distribution, including edge cases, before committing to large-scale processing. Problems are found and fixed cheaply on a handful of files instead of being paid for 8,000 times.

**B.** Submit the full batch, then use custom_id to identify failed requests and resubmit only those with a corrected prompt.

**설명**

custom_id correlation is the right tool for handling the residual failures a batch produces, but it is reactive. Using it as the primary strategy means paying for a full run with an unvalidated prompt, and quality problems often return as successful but wrong results that custom_id alone will not surface.

**C.** Verify the prompt works on a few of the simplest files first, since success there confirms it will generalize to the rest.

**설명**

Testing only easy cases gives false confidence; the failures that force resubmission come from edge cases such as unusual formats, oversized files, or ambiguous content. A sample must mirror the real distribution of inputs, not just its easiest slice.

**D.** Submit the full batch immediately and rely on retry-with-error-feedback loops to fix any outputs failing validation.

**설명**

Retry-with-error-feedback is a per-item correction mechanism, not a substitute for a sound prompt. A systematic prompt flaw would produce failures across most of the 8,000 files, multiplying cost and delay when the flaw could have been caught on a sample first.

### 전반적인 설명

Batch processing changes the economics of prompt mistakes. With the synchronous API, a flawed prompt shows up on the next response and you fix it immediately. With the Message Batches API, a submission can take up to 24 hours to complete, there is no way to adjust the prompt mid-flight, and every request in the batch is billed whether its output is useful or not. A systematic prompt defect therefore does not cost one bad response; it costs 8,000 of them plus a day of latency. The rational workflow is to spend a small amount of synchronous iteration up front: draw a representative sample, run the prompt, validate the outputs, refine, and only then submit at scale.

What makes a sample useful is that it mirrors production traffic. Anthropic's evaluation guidance emphasizes covering the real-world distribution and deliberately including edge cases: malformed or unusual inputs, overly long content, and ambiguous cases. In a legacy codebase, those edge cases (generated files, unconventional formatting, enormous files near context limits) are precisely where a batch run fails or degrades. A sample of only the simplest files validates nothing about the inputs that actually cause resubmission.

The two reactive strategies are complements, not alternatives. custom_id correlation is exactly how you should handle the residual failures a well-tested batch still produces: identify the failed requests, fix their specific cause (for example, chunking oversized files), and resubmit only that subset. Retry-with-error-feedback likewise repairs individual validation failures. Neither addresses a prompt that is wrong for the whole corpus, and a bad prompt frequently returns successful requests containing low-quality findings, which no failure-status mechanism will flag. Sample-first refinement is what keeps those mechanisms handling exceptions rather than the norm.

See Create strong empirical evaluations, Prompt engineering overview, and Message Batches.

### 도메인

Prompt Engineering & Structured Output

## 질문 37

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A single-pass review of a 16-file pull request flags a pattern as a bug in one file yet approves identical code in another, even though the entire PR fits within the context window. Which change addresses the root cause?

**A.** Add a prompt instruction requiring the model to apply identical judgment to identical patterns across all files.

**설명**

The model is not choosing to judge inconsistently; its attention is spread too thin across 16 files to sustain uniform depth. An instruction cannot compensate for a structural overload, so the contradictory findings will persist.

**B.** Run the full-PR review three times and report only findings that appear in a majority of the runs.

**설명**

Majority voting over repeated diluted passes suppresses real bugs that any single inconsistent run happens to miss, and it triples cost. It filters the noise statistically without fixing the attention dilution that produces the inconsistency in the first place.

**C.** Switch to a model with a larger context window, since contradictory findings indicate the files are being truncated before review.

**설명**

The stem states the entire PR already fits within the context window, so truncation is not occurring. Attention quality across many files, not raw context capacity, is what degrades in a single wide pass, and a bigger window does not restore it.

**D(정답).** Restructure into focused per-file passes, since attention dilution rather than context capacity causes the inconsistency.

**설명**

Contradictory findings on identical code within one pass are a symptom of attention dilution: when the model processes many files at once, analysis depth varies from file to file. Per-file review passes give each file consistent, focused attention, which is the structural fix for this failure mode.

### 전반적인 설명

When a review pass covers many files at once, the failure mode is attention dilution: some files get deep analysis while others receive shallow treatment, obvious bugs slip through, and the same pattern is judged differently in different files within the same response. The telltale diagnostic in this situation is that the PR already fits in the context window, so the problem is not capacity, it is how attention is distributed across a large, heterogeneous input.

The effective mental model is that context window size bounds what the model can see, while task decomposition governs how well it reasons about what it sees. The remedy is multi-pass review: run a focused pass per file for local issues, ensuring every file gets consistent depth, and follow with a separate integration pass for cross-file concerns. This is the same principle behind chaining complex prompts: each focused step performs better than one sprawling step.

The alternatives all miss the mechanism. A larger-context model solves a truncation problem the scenario does not have; more room does not sharpen attention over content that already fits. Majority voting across three diluted runs is expensive noise filtering that discards genuine findings any single run misses. And a prompt instruction to "judge consistently" names the desired outcome without changing the overloaded structure that prevents it; instructions cannot substitute for decomposition when the input itself exceeds what one pass can analyze uniformly.

### 도메인

Prompt Engineering & Structured Output

## 질문 38

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : The team's MCP code-search tool returns an empty result list both when the search index times out and when a query genuinely matches nothing. Claude retries fruitless no-match queries and abandons transient outages. What is the correct fix?

**A.** Mark every empty response as a retryable error so Claude re-issues the query in both situations until results appear.

**설명**

Valid empty results are successful queries, not failures, so labeling them as retryable errors invites endless re-querying of searches that will never return matches. This trades one form of wasted retries for another instead of distinguishing the two conditions.

**B.** Retry timeouts inside the tool and return an empty list once retries are exhausted, so Claude only ever receives results.

**설명**

Local retry for transient failures is reasonable, but converting an exhausted failure into an empty success is silent error suppression. The agent would conclude the code does not exist when the index was actually unreachable, turning a recoverable failure into misinformation.

**C(정답).** Report timeouts as errors flagged retryable, and return no-match queries as successful results with an empty match list.

**설명**

This is correct because access failures and valid empty results are fundamentally different conditions. A timeout is a retryable error the agent should attempt again, while a query with no matches is a successful outcome the agent should accept and move on from. Encoding each condition accurately lets the agent make the right recovery decision in both cases.

**D.** Instruct Claude in the system prompt to retry any empty result twice before concluding that no matching code exists.

**설명**

This bakes wasted retries into every legitimately empty query and still gives the agent no way to recognize a timeout. Prompt guidance cannot recover the distinction the tool's response format has already destroyed; the fix belongs at the tool interface.

### 전반적인 설명

The core issue is that the tool has collapsed two semantically opposite conditions into one indistinguishable response. An access failure (the index timed out) means the query never actually ran, so retrying is sensible; a valid empty result (the query ran and matched nothing) is a successful operation whose answer happens to be "none." When both arrive as an empty list, the agent has no signal to decide between retrying and accepting, so it inevitably does the wrong thing some of the time.

The fix is to encode each condition truthfully at the protocol level. MCP provides the isError flag for communicating tool failures, and the tool can additionally include its own structured metadata in the error content, such as an error category and a retryability indicator, telling the agent whether another attempt could plausibly succeed. (Retryability is a tool-defined convention in the response body, not a field the protocol itself mandates.) A timeout should therefore surface as an error marked retryable, while a genuinely empty search should return as a normal successful result containing zero matches. The agent can then retry outages, accept empty answers, and stop burning turns on queries that will never match.

The tempting alternatives all fail the same test: they still hide information the agent needs at decision time. Suppressing exhausted failures behind an empty success turns outages into false negatives about the codebase. Prompt instructions to retry empty results penalize every legitimate no-match query while doing nothing to identify timeouts. Marking all empty responses as retryable errors mislabels successful queries and simply relocates the wasted retries. The general principle is that recovery behavior is only as good as the error information the tool exposes; tools should describe what actually happened and let the agent choose the response.

See MCP Tools and Anthropic's guidance on implementing tool use for the error-signaling patterns involved.

### 도메인

Tool Design & MCP Integration

## 질문 39

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : A developer's extraction loop terminates as soon as a response contains a text block. Runs that mix explanatory text with tool calls end prematurely, leaving tool requests unexecuted. Which termination logic fixes this?

**A.** Stop only when a response contains no tool_use blocks and its text includes a phrase confirming the extraction is finished.

**설명**

Parsing natural language for a completion phrase is a documented anti-pattern; the model may finish without emitting the expected phrase or emit similar wording mid-task. The absence of tool_use blocks is already communicated reliably through stop_reason.

**B.** Run the loop for a fixed iteration count matching the expected number of tool calls per document, then take the last response as final.

**설명**

Iteration caps are a safety valve against runaway loops, not the primary stopping mechanism. Documents needing fewer calls waste iterations, and documents needing more get cut off mid-task with unexecuted tool requests, which is the same failure being fixed.

**C(정답).** Keep executing requested tools and returning tool_result blocks while stop_reason is "tool_use", ending the loop when stop_reason is "end_turn".

**설명**

This is the documented agentic loop contract. stop_reason is the API's explicit structured signal: "tool_use" means Claude expects tool results back before it can finish, and "end_turn" means Claude has completed its response, regardless of whether text blocks appeared along the way.

**D.** Terminate once the accumulated assistant text parses as JSON that validates against the extraction schema, treating validation success as completion.

**설명**

This substitutes content inspection for the API's structured signal. Intermediate text could coincidentally validate before Claude has finished its tool-assisted work, and validating output is a separate concern from deciding whether the model has more actions to take.

### 전반적인 설명

The Claude Messages API communicates loop state through the stop_reason field, not through the shape or wording of the response content. A single assistant message can legitimately contain both text blocks (reasoning, commentary) and tool_use blocks, which is exactly why any termination rule based on "the response contains text" fails: the presence of text says nothing about whether Claude has finished. The designed contract is simple: while stop_reason is "tool_use", execute each requested tool, append tool_result blocks (matched by tool_use_id) in a new user message, and call the API again; when stop_reason is "end_turn", Claude has finished and the loop exits.

The mental model to hold is that this is model-driven control flow. Claude decides at each step whether it needs another tool or is ready to answer, and it signals that decision through a structured field your code can branch on deterministically. Heuristics that inspect content, such as parsing for completion phrases, checking whether output validates against a schema, or counting iterations, all reintroduce guesswork into a decision the API already answers explicitly. Iteration caps still have a place, but only as a safety net against stuck loops, never as the primary exit condition; a cap tuned to "expected" tool calls truncates documents that legitimately need more lookups.

In an extraction pipeline this matters doubly: schema validation belongs after the loop completes, as a quality gate on the final output, while stop_reason governs whether there is a final output yet. Conflating the two produces exactly the premature-termination bug described. See How tool use works for the canonical loop and Handle tool calls for tool_result formatting requirements.

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

## 질문 41

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : A custom MCP tool resolves internal service names to API endpoints for code generation. On multiple matches it silently returns the most recently deployed service, and Claude sometimes generates client code against the wrong one. How should the tool handle multiple matches?

**A(정답).** Return every matching service with distinguishing metadata, letting Claude ask the developer which service is intended.

**설명**

This is correct because ambiguity must be surfaced, not hidden inside the tool. When Claude sees all candidates with distinguishing details, it can request clarification from the developer, who has definitive knowledge of which service the code should target.

**B.** Attach a confidence score to the auto-selected match and have Claude proceed without asking whenever the score clears a tuned threshold.

**설명**

This is incorrect because confidence scoring is an unreliable proxy for actual ambiguity; the cases where the heuristic is confidently wrong slip straight through. It also keeps the single-match design that hides the alternatives from Claude.

**C.** Add a CLAUDE.md rule instructing Claude to verify the generated client code against the target service's schema after each generation.

**설명**

This is incorrect because post-generation verification catches schema mismatches, not identity mistakes; a client generated against the wrong service can still validate cleanly against that service's own schema. It also relies on probabilistic instruction following rather than fixing the tool interface that suppresses the ambiguity.

**D.** Refine the ranking heuristic to weight repository activity and ownership signals alongside deployment recency before selecting one match.

**설명**

This is incorrect because a smarter heuristic is still a guess. No ranking signal can reliably infer developer intent, so wrong selections continue silently; the model never even sees that other candidates existed.

### 전반적인 설명

The core principle here is that ambiguity should be resolved by the party who actually knows the answer, which is the developer, not by a heuristic buried inside a tool. A lookup tool that collapses multiple matches into one "most likely" result performs silent heuristic selection: the model receives a single confident-looking answer and has no signal that alternatives existed, so it cannot possibly know to ask. Returning all matches with distinguishing metadata (owning team, repository, environment) moves the ambiguity into the model's context, where the reliable pattern applies: enumerate the candidates and request a clarifying identifier before acting.

This is fundamentally a tool interface design decision. Tools shape what the model can perceive; a tool that hides uncertainty makes the downstream agent overconfident by construction, while a tool that exposes it lets the agent behave correctly. The same design tradeoff appears in structured error responses, where a generic status hides the context needed for recovery.

Improving the ranking heuristic just makes the guess more sophisticated while keeping errors invisible. Confidence-threshold autonomy fails for the same reason self-rated confidence fails as an escalation trigger: the system is confidently wrong precisely on the hard cases. A CLAUDE.md verification rule is both probabilistic (guidance, not enforcement) and checks the wrong property, since code generated for the wrong service can be internally consistent with that service. See Connect Claude Code to tools via MCP and Tool use with Claude for guidance on designing tool interfaces that support reliable agent behavior.

### 도메인

Context Management & Reliability

## 질문 42

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The extraction prompt includes two examples of cleanly formatted invoices, yet output still varies on invoices that omit a purchase order number or list multiple dates. Which two additions to the examples best improve consistency? (Select two.)

**A(정답).** Add an input/output pair where the source invoice omits the purchase order number and the expected output records that field as null.

**설명**

This is correct because examples must cover the edge cases where behavior actually diverges. Showing a document that lacks the field, paired with an output containing null, demonstrates that absent data should be reported as absent rather than fabricated to satisfy the schema.

**B.** Append several correctly formatted output records on their own, keeping the prompt shorter by omitting the source excerpts they came from.

**설명**

This is incorrect because output-only samples show the target format but not the transformation. Without the source document alongside each output, the model cannot learn how missing or conflicting inputs map to the expected result.

**C.** Add ten more examples drawn from cleanly formatted invoices so the dominant extraction pattern is strongly reinforced.

**설명**

This is incorrect because the model already handles clean invoices; the inconsistency appears on missing fields and ambiguous dates. Repeating the easy case adds tokens without demonstrating how the hard cases should be resolved.

**D(정답).** Add an input/output pair for an invoice listing multiple dates, with the output demonstrating which date should be extracted.

**설명**

This is correct because ambiguous cases are where prose rules get interpreted inconsistently. An example that shows the resolution of a genuinely ambiguous input teaches the decision boundary, not just the output format.

### 전반적인 설명

Few-shot examples work by demonstrating judgment, not just format. When detailed prose rules produce inconsistent extraction, the failure is almost always concentrated in cases the rules underdetermine: fields that are simply absent from the source, and inputs where more than one candidate value could plausibly fill a field. The fix is to select examples that sit exactly on those decision boundaries.

A pair showing a document with no purchase order number, mapped to an output where that field is null, establishes that the correct response to missing data is to report its absence. This matters doubly in schema-validated extraction: a model pressured to populate every field will fabricate values, and a syntactically valid JSON object with an invented PO number passes schema validation while silently corrupting downstream systems. A pair showing an invoice with multiple dates, resolved to the single correct one, teaches which value wins when the input is ambiguous, something no output sample can convey on its own.

The distractors fail for complementary reasons. Piling on more examples of the case the model already handles reinforces a pattern that was never the problem, spending context on redundancy instead of coverage. Output-only samples communicate the shape of the result but sever the input-to-output mapping; the model sees what a correct record looks like without ever seeing what a difficult source document looks like next to it, so the transformation itself, especially for gaps and conflicts, remains unspecified. Two or three well-chosen input/output pairs targeting the actual failure modes outperform many pairs targeting the cases that already work.

See Use examples (multishot prompting) to guide Claude's behavior for guidance on selecting effective examples.

### 도메인

Claude Code Configuration & Workflows

## 질문 43

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The document-analysis subagent's structured output requests fail immediately with 400 errors citing a recursive $ref and a minimum constraint in the JSON schema. Identical retries fail the same way. What is the correct fix?

**A.** Raise max_tokens on the retried requests so the model has enough room to satisfy every schema constraint.

**설명**

This is incorrect because raising max_tokens addresses truncated responses that ended with a max_tokens stop reason. A 400 rejection happens before any tokens are generated, so output length is irrelevant.

**B.** Add exponential backoff between retries so the request succeeds once the transient service error clears.

**설명**

This is incorrect because a 400 error caused by unsupported schema features is deterministic, not transient. No amount of waiting changes the outcome; the same invalid request will be rejected every time.

**C(정답).** Rewrite the schema without the unsupported features and enforce the numeric bound in validation code.

**설명**

This is correct because a 400 error signals an invalid request, not a bad model output. Recursive $ref and numerical constraints like minimum are unsupported by structured outputs, so the schema itself must change, and bounds checking moves to application-side validation after the response arrives.

**D.** Resend each failed request with the 400 error text appended to the prompt so the model can self-correct.

**설명**

This is incorrect because retry-with-error-feedback fixes flaws in the model's output, and here the model never produced any output. The request is rejected before generation, so there is nothing for the model to correct.

### 전반적인 설명

The core skill here is classifying a failure before choosing a remedy. Retry-with-feedback loops work when the model produced output that is fixable: a malformed field, a count that does not reconcile, a value in the wrong place. In those cases the model generated something, your code found the defect, and the error message gives the model what it needs to correct itself. A 400 error is a fundamentally different failure class: the API rejected the request before the model ever ran. The problem lives in your request payload, so no retry, backoff, or prompt adjustment can change the outcome.

Anthropic's Structured outputs documentation lists JSON Schema features that are not supported, including recursive schemas, external $ref, numerical constraints such as minimum, and string constraints such as minLength; using them produces a 400 error with details. The design tradeoff is deliberate: structured outputs constrain token sampling to guarantee schema conformance, and only a subset of JSON Schema can be enforced that way efficiently. The practical pattern is to keep the schema within the supported subset so the API guarantees shape, then enforce fine-grained value constraints (ranges, lengths, formats) in your own validation layer after the response arrives.

Exponential backoff belongs to transient errors like timeouts or overload responses, not deterministic request rejections. Feeding the error back to the model presumes a model output exists to be corrected, which it does not here. Raising max_tokens is the documented remedy for responses truncated with a max_tokens stop reason, a failure that occurs after generation starts, not before the request is accepted.

### 도메인

Prompt Engineering & Structured Output

## 질문 44

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : The team's MCP server exposes a cross-repository code search tool described only as "Searches code." Claude Code consistently uses the built-in Grep tool instead, missing matches that live in other repositories. What is the highest-leverage fix?

**A.** Rename the tool with a service prefix like codesearch_query while leaving its current one-line description in place.

**설명**

A clearer name helps, but the model selects tools primarily based on descriptions rather than names. Leaving a one-line description in place preserves the root cause: the model still has no way to know the tool covers repositories Grep cannot reach.

**B(정답).** Rewrite the description to cover what the tool searches, when to use it instead of Grep, and its input format.

**설명**

This is correct because tool descriptions are the primary mechanism the model uses to select tools, and Anthropic identifies them as by far the most important factor in tool performance. A description that states the cross-repository scope, the boundary against Grep, and expected inputs gives the model the information it needs at selection time.

**C.** Remove Grep from the session's allowed tools so the MCP search tool becomes the only content-search option.

**설명**

Removing Grep eliminates a capability the agent legitimately needs for fast local content searches within the current repository. It forces every search through the MCP tool rather than fixing the underdocumented interface that caused the misrouting.

**D.** Add a CLAUDE.md instruction telling Claude to always prefer the MCP search tool over built-in Grep for searches.

**설명**

This moves the selection guidance away from where the model actually reads it when choosing tools, which is the tool description itself. A blanket preference rule is also wrong for cases where Grep is the right choice, such as searching only the current working tree.

### 전반적인 설명

When Claude decides which tool to invoke, it works from the user's request and each tool's description. Anthropic's documentation calls detailed descriptions by far the most important factor in tool performance and recommends at least 3 to 4 sentences covering what the tool does, when it should and should not be used, what its parameters mean, and its limitations. A description like "Searches code" is the documented anti-pattern: it leaves the model unable to distinguish this tool from the built-in Grep tool, so it defaults to the familiar built-in option and silently misses cross-repository results.

This pattern is especially common when an MCP tool overlaps functionally with a built-in tool. The remedy is to strengthen the MCP tool's description so it advertises the concrete advantage built-in tools cannot provide, in this case indexed search across every repository rather than just the local working tree, along with explicit boundary language about when to reach for it instead of Grep. That places the deciding information exactly where the model reads it at selection time.

The alternatives all miss the root cause. A CLAUDE.md preference rule is probabilistic guidance living outside the selection surface, and an unconditional preference would be wrong whenever a local Grep is genuinely appropriate. Removing Grep sacrifices a capability the agent needs for ordinary in-repo work. Renaming can reduce ambiguity between overlapping tools, but names are secondary to descriptions; a well-described tool with a mediocre name is selected more reliably than a well-named tool with a one-line description.

See Implement tool use for description best practices and Tool use overview for how Claude selects tools.

### 도메인

Tool Design & MCP Integration

## 질문 45

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : Prose-style docs extract correctly into your metadata schema, but Markdown-table docs return null for fields the tables plainly contain. You are adding few-shot examples to the extraction prompt. Which TWO practices make the examples effective? (Select TWO.)

**A.** Add as many example documents as the context window allows so every possible table variant is represented.

**설명**

Flooding the prompt with examples bloats context and dilutes the signal of the examples that address the actual failure. The model generalizes from a few well-chosen demonstrations; exhaustive coverage is unnecessary and counterproductive.

**B.** Use abstract placeholder documents in the examples so the model generalizes rather than overfitting to project content.

**설명**

Abstract placeholders strip out the concrete structural details, such as real table layouts and field placements, that make examples transfer to actual documents. Realistic cases are what teach the model to parse the formats it is failing on.

**C(정답).** Use three to five targeted examples that concentrate on the document formats currently producing nulls.

**설명**

Few-shot prompting works best with a small, targeted set aimed at the cases the model gets wrong. Concentrating a handful of examples on the failing table format keeps the corrective signal strong instead of diluting it across formats that already work.

**D(정답).** Include a real table-formatted document from the repository paired with its fully populated extraction in the target schema.

**설명**

The failure is format-specific: the model handles prose but not tables, so an example must show a table source alongside the correct populated output. A realistic repository document carries the exact structural cues the model needs to learn how table cells map to schema fields.

### 전반적인 설명

When extraction succeeds on one document structure and returns null on another, the model is not missing instructions; it is missing a demonstration of how that structure maps onto the schema. Few-shot examples work because they transfer judgment that prose descriptions cannot: showing a Markdown table paired with its correctly populated extraction teaches the model, by pattern, that a table row is a data source just like a sentence is. This is why the strongest examples are realistic, drawn from the repository's actual documents, and paired with output in the exact target schema. Abstract placeholders discard precisely the structural detail (column headers, cell alignment, field placement) that the model is failing to interpret.

Quantity matters less than targeting. A small set of three to five examples aimed at the failing format gives the model a clear corrective pattern, while packing the prompt with every conceivable variant dilutes that signal and consumes context without improving generalization; models extrapolate from a small set of well-chosen demonstrations rather than requiring exhaustive coverage. The right mental model is that examples are a scarce, high-leverage resource: spend them on the ambiguous or failing cases, not on cases the model already handles.

For guidance on constructing effective example sets, see Use examples (multishot prompting) to guide Claude's behavior.

### 도메인

Prompt Engineering & Structured Output

## 질문 46

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : Tests Claude Code generates for the coordinator and subagent modules re-implement fixture setup by hand and invoke the wrong test runner. The project CLAUDE.md testing section is a 300-line framework tutorial. How should the section be revised?

**A(정답).** Replace the tutorial with concise instructions: the preferred test runner, the fixture library location, and what makes a test valuable.

**설명**

This matches the documented guidance for CLAUDE.md content: testing instructions and preferred test runners belong there, while long tutorials do not. A concise section keeps the file under the recommended size so the runner command and fixture location are reliably followed rather than buried.

**B.** Move all testing guidance into a slash command that developers invoke immediately before requesting test generation.

**설명**

This makes always-relevant standards opt-in, so any session where the command is forgotten generates tests with no knowledge of the runner or fixtures. Universal conventions belong in always-loaded context, not an on-demand invocation.

**C.** Extend the tutorial with additional worked examples and framework reference material so the model has more fixture usage context.

**설명**

Growing an already bloated section makes adherence worse, not better. Every line in CLAUDE.md competes for attention, and Anthropic recommends keeping each file concise (under roughly 200 lines) and excluding tutorial-style content.

**D.** Add a PreToolUse hook that blocks writes of any test file that does not import from the shared fixture library.

**설명**

A PreToolUse hook can deterministically block a non-conforming write, but it supplies none of the missing knowledge, so the model would still not know where the fixtures live or which runner to use. Hooks enforce hard policies; they are not a substitute for documenting standards the model needs to follow.

### 전반적인 설명

The mental model here is that CLAUDE.md is context, not a manual. Its contents load into every session and every line competes with every other line for the model's attention, which is why Anthropic recommends keeping each file concise, targeting under roughly 200 lines. The documented best practice is to include testing instructions and preferred test runners while explicitly excluding long tutorials, self-evident practices, and details Claude can infer from the code itself. A 300-line framework tutorial is the failure mode this guidance exists to prevent: the two facts that would actually fix the symptoms (which runner to invoke and where the fixture library lives) are drowned in material that adds nothing.

The effective revision states exactly what generation currently gets wrong: the runner command, the fixture location, and criteria for a valuable test, ideally phrased as a runnable pass/fail check the model can execute and iterate against. Adding more tutorial content deepens the attention problem rather than solving it. Relocating the guidance to a slash command converts an always-relevant standard into an opt-in step that fails silently whenever someone forgets it. A PreToolUse hook that blocks non-conforming test writes is enforcement, not education; it can stop bad output from landing, but the model still lacks the information needed to produce good output, so generation quality does not improve. Hooks are the right surface only when a policy must hold regardless of what the model was told.

See Claude Code best practices for what belongs in CLAUDE.md, Manage Claude's memory for size guidance and how memory files load, and Hooks for when deterministic enforcement is the right tool.

### 도메인

Claude Code Configuration & Workflows

## 질문 47

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : A custom slash command instructs Claude to report findings as location, issue, severity, and suggested fix, and includes three examples written with placeholder pseudocode (foo, bar). On the team's real TypeScript files, output format still drifts. What should change?

**A(정답).** Replace the placeholder examples with realistic snippets drawn from the team's actual codebase.

**설명**

This is correct because effective few-shot examples must be relevant, meaning they closely mirror the actual inputs the model will see. Abstract foo/bar pseudocode demonstrates the format only weakly; examples built from real project code transfer the pattern to real review inputs far more reliably.

**B.** Restate the four-field format requirement in capitalized, emphasized instructions placed above the examples.

**설명**

Stronger emphasis on abstract instructions does not fix the underlying problem. Examples that demonstrate the desired output are documented as more effective than restated instructions, so the fix lies in improving the examples, not intensifying the prose.

**C.** Increase the number of examples to ten or more so every possible finding type is demonstrated.

**설명**

Quantity does not compensate for irrelevance. Anthropic recommends roughly three to five well-crafted examples, and ten or more placeholder examples would bloat the prompt while still failing to mirror the real inputs the command processes.

**D.** Move the output format definition into the project CLAUDE.md so it loads at the start of every session.

**설명**

CLAUDE.md provides project guidance but is still textual instruction competing for attention, not a demonstration of the pattern. Relocating the same abstract format rules changes where they load, not how well the model can match them to real code.

### 전반적인 설명

Few-shot examples work by giving the model a concrete pattern to imitate, and that mechanism only fires when the examples resemble the inputs the model will actually receive. Anthropic's guidance calls for examples that are relevant (closely mirroring the real use case), diverse (covering edge cases), and structured (wrapped in <example> tags so they are distinguishable from instructions). Placeholder pseudocode with foo and bar satisfies none of the relevance criterion: the model sees a toy pattern, then faces real TypeScript with imports, generics, and project conventions, and the demonstrated mapping from code to a location, issue, severity, and suggested-fix record does not carry over cleanly.

The mental model to hold is that examples teach by analogy, not by rule. The closer the example inputs sit to production inputs, the shorter the analogical leap and the more consistently the output format holds. This is why realistic snippets from the team's own codebase outperform abstractions: they show the exact judgment of turning this kind of code into this kind of finding.

The alternatives each miss that mechanism. Piling on ten or more examples inflates context while every one of them remains unrepresentative; the recommended count is 3-5 well-chosen examples. Capitalizing the format instructions intensifies prose that has already proven weaker than demonstration, since providing examples of the desired output is documented as more effective than abstract format directives. Moving the rules into CLAUDE.md changes the delivery surface but the content is still instruction text, and CLAUDE.md guidance competes with everything else in context rather than demonstrating the pattern. See Prompt engineering and Increase output consistency.

### 도메인

Prompt Engineering & Structured Output

## 질문 48

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : The team needs Claude Code to work with Jira issues and with an internal, company-specific release-approval workflow. Which TWO integration decisions follow the recommended MCP approach? (Select TWO.)

**A(정답).** Connect an existing Atlassian MCP server for the Jira integration.

**설명**

This is correct because Jira is a standard integration for which an existing MCP server is already available. Adopting one avoids building and maintaining duplicate integration code and gets the team working immediately.

**B.** Write a custom Jira MCP server so tool names and descriptions match the team's conventions.

**설명**

This is over-engineering for a standard integration. Existing Jira servers already expose well-tested tools, and rebuilding them just to rename tools creates ongoing maintenance work without meaningful benefit.

**C(정답).** Build a custom MCP server for the internal release-approval workflow.

**설명**

This is correct because the release-approval system is unique to this company, so no existing server will cover it. Custom MCP servers are exactly the right investment for team-specific workflows that off-the-shelf servers cannot cover.

**D.** Document the internal system's REST endpoints in CLAUDE.md so Claude invokes them through Bash with curl.

**설명**

CLAUDE.md provides project context, not a tool interface. Driving an approval system through ad hoc curl commands gives the agent no structured tool contract, no input schema, and no reliable error signaling, which is precisely what MCP tools provide.

### 전반적인 설명

The guiding principle for MCP integrations is buy before build: for standard SaaS systems such as Jira, GitHub, or Slack, existing MCP servers already implement the connection, tool definitions, and error handling, and are maintained as those services evolve. The Model Context Protocol exists precisely to solve the N-by-M integration problem; every team writing its own Jira server recreates the duplication the protocol was designed to eliminate. Custom server development is reserved for capabilities no one else could have built, such as an internal release-approval workflow whose API, data model, and business rules are unique to the company.

The two distractors fail at opposite ends of this decision. Rebuilding a Jira server to control naming conventions trades a working, maintained integration for a permanent maintenance burden with marginal payoff; if tool selection needs tuning, description quality can usually be addressed without owning the whole server. Documenting internal endpoints in CLAUDE.md and relying on Bash with curl misuses a context file as an integration mechanism: the agent gets no inputSchema to constrain its calls, no structured tool result, and no isError signal to reason about failures, so reliability suffers exactly where an approval workflow needs it most.

The practical decision rule an architect should carry: standard integration, adopt an existing server; unique team workflow, build a custom one; never substitute prose instructions and shell commands for a proper tool interface. See Connect Claude Code to tools via MCP for how MCP servers are configured and discovered in Claude Code.

### 도메인

Tool Design & MCP Integration

## 질문 49

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The codebase is a monorepo where each subagent lives in its own package with a package-level CLAUDE.md, and shared standards files sit in a top-level standards/ directory. How should maintainers pull only the standards relevant to their subagent into their package's CLAUDE.md?

**A.** Consolidate all standards files into the root CLAUDE.md so every package inherits the complete set through the additive loading hierarchy.

**설명**

The root CLAUDE.md loads for every session anywhere in the repository, so every package would carry every standard regardless of relevance. This defeats the goal of selective inclusion and wastes context on instructions that do not apply to the subagent being worked on.

**B.** List each needed standards file's path wrapped in backticks in the package's CLAUDE.md so Claude opens it on demand during the session.

**설명**

Backticks do the opposite of importing: import parsing skips Markdown code spans and fenced code blocks, so a backticked path is treated as literal text and never imported. Merely mentioning a path this way does not cause the file to be opened; actual imports are expanded when the containing CLAUDE.md is loaded.

**C.** Copy the text of each relevant standards file directly into every package's CLAUDE.md so no package depends on files outside its own directory.

**설명**

Duplicating standards text creates drift: every edit to a shared standard must be manually propagated to each copy, and the copies inevitably diverge. Imports keep a single source of truth while still letting each package select what applies.

**D(정답).** Add @path imports (for example @../../standards/citations.md) in each package's CLAUDE.md, referencing only the standards files that package needs.

**설명**

This is the documented mechanism: @path imports inside a CLAUDE.md expand the referenced files into context, and relative paths resolve from the importing file's location. Each package maintainer selects exactly the standards that apply to their subagent while the standards themselves stay in one authoritative location.

### 전반적인 설명

Claude Code's @path import syntax lets a CLAUDE.md pull in other files, which are expanded and loaded into context alongside the file that references them. In a monorepo, this pairs naturally with per-package CLAUDE.md files: shared standards live once in a central directory, and each package's maintainers, who know which conventions actually govern their code, import only those. A detail worth internalizing is that relative import paths resolve from the file containing the import, not from the working directory, so @../../standards/citations.md in a package file is interpreted from that package's location.

Two boundaries matter. First, imports are an organization mechanism, not a context-reduction mechanism: imported files are expanded whenever the CLAUDE.md that references them is loaded, and their content occupies the context window, so the win here is maintainability and selectivity, not token savings. Second, import parsing skips code spans and fenced blocks, which means a path wrapped in backticks is deliberately left as literal text; that feature exists so documentation can mention paths without triggering imports, and it is why the backtick approach fails as an inclusion mechanism. Imports can also recurse, but only to a maximum depth of four hops.

Copying standards text into each package trades one authoritative file for many diverging copies, and hoisting everything into the root CLAUDE.md abandons selectivity entirely, since the loading hierarchy is additive and the root file reaches every session. See Manage Claude's memory for import syntax and resolution rules, and Claude Code in large codebases for the per-package pattern.

### 도메인

Claude Code Configuration & Workflows

## 질문 50

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

## 질문 51

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The team is structuring the extraction pipeline as a coordinator with specialized subagents for metadata extraction, table parsing, and schema validation. Which two responsibilities belong to the coordinator in this hub-and-spoke design? (Select two.)

**A.** Maintain a shared conversation history that all subagents read, so each one automatically sees what earlier extraction steps produced.

**설명**

Subagents operate with isolated context and do not share a conversation history. There is no shared memory to maintain; anything a subagent needs must be placed explicitly into the prompt the coordinator sends when delegating.

**B(정답).** Aggregate the outputs returned by the subagents and validate the combined result before emitting the final structured record.

**설명**

Result aggregation and validation are coordinator responsibilities. Because every subagent returns its output to the hub, the coordinator is the single point where partial results can be combined, checked for consistency, and assembled into the final record.

**C(정답).** Decompose each incoming document into subtasks and dynamically select which subagents to invoke based on the document's characteristics.

**설명**

Task decomposition and dynamic subagent selection are core coordinator duties in a hub-and-spoke design. The coordinator examines the incoming work, breaks it into focused subtasks, and decides which specialized workers are needed for each one.

**D.** Allow each subagent to decide which peer subagent should process its output next, so routing adapts dynamically to document content.

**설명**

In a hub-and-spoke topology, subagents never route work to one another; all communication flows through the coordinator. Letting workers choose their own successors turns the design into an uncontrolled peer-to-peer flow and removes the hub's control over the pipeline.

### 전반적인 설명

In a hub-and-spoke multi-agent architecture, the coordinator is not just a dispatcher; it owns the whole lifecycle of the work. On the way in, it performs task decomposition, splitting a document into focused subtasks, and dynamic subagent selection, choosing which specialists to invoke for this particular input (a scanned invoice may need table parsing, a contract may not). On the way out, it performs result aggregation and validation: since every worker reports back to the hub, the coordinator is the only component that sees all partial results and can reconcile them into a single validated record before it reaches downstream systems.

The mental model that makes this design work is that subagents are isolated workers. Each runs in its own context window, receives only what its delegation prompt contains, and returns only its final message to the parent. There is no shared conversation history for peers to read, and no channel for one subagent to hand work directly to another. That isolation is the tradeoff the architecture makes deliberately: it costs some explicit context passing, but it buys clean context windows, parallelizable subtasks, and one place to observe and control the entire flow.

The incorrect choices break exactly these guarantees. Peer-to-peer routing, where a subagent picks its own successor, removes the hub's control over sequencing and makes the pipeline impossible to observe or debug from a single point. A shared history that subagents "automatically see" simply does not exist; assuming it leads to synthesis or validation steps that operate on empty inputs. See Create custom subagents and Subagents in the SDK for how subagent context isolation and delegation work.

### 도메인

Agentic Architecture & Orchestration

## 질문 52

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : A team's CLAUDE.md instructs Claude to run the full test suite before pushing a release, yet in testing Claude occasionally pushes before the tests have completed. Which design guarantees the push cannot execute until the test prerequisite is satisfied?

**A.** Add few-shot examples to the system prompt demonstrating the correct test-then-push sequence for prior release workflows.

**설명**

Few-shot examples improve the likelihood that the model follows the sequence, but like any prompt technique they provide probabilistic compliance rather than a guarantee. An occasional premature push can still slip through, which the scenario shows is unacceptable for this rule.

**B(정답).** Implement a PreToolUse hook that intercepts outgoing push commands and blocks them until a successful test run has been verified.

**설명**

A PreToolUse hook runs as code before the tool call executes, so a push attempted without a completed test run can be stopped deterministically. This is the correct surface for a hard prerequisite: enforcement happens in code, not in instructions the model may or may not follow.

**C.** Rewrite the ordering rule in CLAUDE.md with IMPORTANT emphasis and restate it in the system prompt at the start of every session.

**설명**

CLAUDE.md and system prompt instructions are guidance the model follows probabilistically, not enforcement code, so a premature push remains possible. Emphasis raises the rule's priority relative to other instructions but can never make compliance guaranteed.

**D.** Convert the enforcement to a PostToolUse hook that inspects the executed command and reports any violation back to Claude.

**설명**

PostToolUse hooks fire only after the tool has already run, so by the time the hook inspects the command the push has happened. They are suited to feedback and transformation, not prevention.

### 전반적인 설명

This scenario is the canonical hooks versus prompts decision. Instructions in CLAUDE.md or the system prompt are things Claude follows; hooks are code that runs. When a workflow ordering rule carries real consequences, such as releasing untested code, the rule needs a deterministic guarantee, and only programmatic enforcement provides one. A PreToolUse hook sits in front of every matching tool call, so it can check whether the prerequisite (a completed, passing test run) has been satisfied and refuse to let the push proceed otherwise. The violating action can never execute, no matter what the model's context contains.

The mental model worth internalizing is that prompt-based approaches, however well phrased, shift probabilities rather than set boundaries. Adding IMPORTANT emphasis or few-shot examples of the test-then-push sequence raises compliance rates, and both are appropriate for preferences and formatting conventions, but each leaves a non-zero failure rate. The scenario itself demonstrates this: the rule is already written down, and Claude still occasionally skips it. Fixing that by writing it down more emphatically treats a compliance problem as a phrasing problem.

Timing also matters. A PostToolUse hook is the right tool for normalizing or auditing results, but it fires after the tool has executed; it can tell Claude a premature push happened, which is detection, not prevention. The general principle for architects: put hard rules with financial, legal, or safety consequences in pre-execution hooks or programmatic preconditions, and reserve prompt guidance for behavior where flexibility is acceptable.

See the official Claude Code hooks documentation for how PreToolUse hooks intercept and block tool calls.

### 도메인

Agentic Architecture & Orchestration

## 질문 53

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : Partway through a long research run, the coordinator starts investigating follow-up questions itself, loading full source documents into its own context; its later delegation and aggregation decisions become noticeably inconsistent. What should change?

**A.** Route follow-up questions to the synthesis agent directly, since it already processed the relevant documents during its analysis pass.

**설명**

Subagents operate with isolated contexts and do not retain material between delegations unless it is explicitly passed in their prompts, so the synthesis agent does not simply hold the documents. Routing around the coordinator also breaks the hub-and-spoke pattern that gives the system observability and uniform error handling.

**B(정답).** Spawn a subagent for each follow-up question and have it return a concise summary, keeping the coordinator's context for orchestration.

**설명**

This is the designed pattern for protecting the coordinator's context: verbose investigation happens in an isolated subagent context, and only a distilled summary returns to the coordinator. The coordinator's window stays reserved for task decomposition, delegation, and aggregation, which restores consistent orchestration decisions.

**C.** Have the coordinator compress its accumulated document content into brief notes after answering each follow-up question.

**설명**

Repeated in-place compression is the progressive summarization trap: each pass dilutes precise findings, and orchestration state gets compressed along with document content. It manages the bloat after it has already entered the coordinator's context instead of keeping it out.

**D.** Instruct the coordinator to trim each source document to relevant excerpts before loading it into its own context for investigation.

**설명**

Trimming reduces per-document bulk but leaves the coordinator doing detail-level investigation itself, so excerpts still accumulate across many follow-up questions. The root problem is that investigation content and orchestration state share one context, and trimming only slows the degradation rather than isolating the two roles.

### 전반적인 설명

In a coordinator and subagent architecture, the coordinator's context window is a scarce resource that should hold orchestration state: the research plan, what has been delegated, what came back, and what remains. When the coordinator starts performing investigations itself, verbose source material crowds out that state, and the model begins making inconsistent delegation and aggregation decisions, a classic symptom of context degradation.

The structural fix is delegation: spawn a subagent with a narrow, specific question and require it to return a concise, structured summary. Because each subagent runs in its own isolated context, the full documents it reads never enter the coordinator's window; only the distilled answer does. This is why the pattern scales, since the coordinator can commission many deep investigations while retaining roughly one line of context per result. The tradeoff is that subagents inherit nothing automatically, so the coordinator must include the necessary background explicitly in each delegation prompt.

The alternatives all keep investigation inside the coordinator. Trimming documents to excerpts reduces bulk per question but still mixes detail work with orchestration, and the excerpts accumulate over a long run. Repeatedly compressing the coordinator's own history is progressive summarization, which erodes precise findings and orchestration state with every pass. Sending follow-ups straight to the synthesis agent assumes shared memory that does not exist between isolated subagent contexts, and bypassing the coordinator sacrifices the central observability and error handling that the hub-and-spoke design provides.

See Subagents in the Claude Agent SDK and Anthropic's engineering write-up on building a multi-agent research system.

### 도메인

Context Management & Reliability

## 질문 54

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : CLAUDE.md instructs Claude to always run the test suite before finishing a task, yet some sessions still end with failing or unrun tests. Which change guarantees a turn cannot end this way?

**A.** Create an Agent Skill whose description triggers after code edits, documenting the required test-and-verify procedure.

**설명**

A skill packages a procedure as instructions the model follows, and whether it is invoked at all depends on the model matching the description. Both steps are probabilistic, so a skill cannot guarantee that no turn ends with failing tests.

**B.** Move the testing instruction to the top of CLAUDE.md and mark it IMPORTANT so it takes priority over the other guidance.

**설명**

Emphasis and placement raise a rule's priority only relative to other instructions in the file; compliance remains probabilistic. CLAUDE.md is guidance the model follows, not enforced configuration, so occasional skipped test runs can still occur.

**C.** Add a PostToolUse hook on the Edit tool that reminds Claude in its feedback to run the tests before finishing the task.

**설명**

PostToolUse runs after the Edit call has already completed, so it cannot gate final turn completion or guarantee tests pass before Claude stops. A reminder injected after edits remains prompt-level guidance the model may not act on; the deterministic gate requires a blocking lifecycle decision at the turn-completion control point.

**D(정답).** Add a Stop hook that runs the test suite and exits with code 2 on failure, blocking turn completion until the tests pass.

**설명**

A Stop hook fires when Claude attempts to end its turn, and exiting with code 2 is the documented blocking signal: the turn cannot complete, and the stderr output is fed back to Claude so it can fix the failures. Because the hook is code that runs on every turn end, the guarantee is deterministic rather than dependent on the model remembering an instruction.

### 전반적인 설명

This question turns on the core architectural distinction between prompt instructions, which produce probabilistic compliance, and hooks, which are code executed at fixed lifecycle points and therefore provide deterministic guarantees. Every line in CLAUDE.md competes with every other instruction for the model's attention, so even a well-placed, emphasized rule can occasionally be skipped. When a rule must never be skipped, it belongs in code, not in prose.

The Stop event is the right control point here because it fires precisely when Claude wants to end its turn. A command hook registered on that event can run the test suite and, if tests fail, exit with code 2, the documented blocking signal. The turn is refused, and the hook's stderr output is returned to Claude as context, which typically prompts it to read the failure and fix the code unprompted. Note the exit-code semantics: only code 2 blocks; exit 0 continues normally, and most other nonzero codes are logged as non-blocking errors, so a hook that exits 1 on failure would silently fail to enforce anything.

The distractors all keep the enforcement on the wrong side of the line. Strengthening CLAUDE.md and adding a skill both leave the rule as instructions the model interprets; a PostToolUse hook runs after the tool call has completed, so while it can feed feedback back into context, it cannot undo the call or gate the end of the turn. The mental model to carry into production: hooks watch and gate the loop deterministically, while prompts shape what the model attempts. See Claude Code hooks for lifecycle events and exit-code behavior, and Claude Code permissions for why enforcement lives in Claude Code rather than in the model.

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

## 질문 56

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : A refactoring task begins with a discovery phase that lists hundreds of call sites with surrounding context, filling the main context window before the design and implementation phases even start. Which approach best preserves context for the later phases?

**A.** Split the work across separate sessions, recording discovered call sites in CLAUDE.md so each new session reloads the findings at startup.

**설명**

CLAUDE.md is meant for durable project conventions, not for staging hundreds of task-specific call sites, and everything written there loads into every future session's context. This approach fragments the task and eventually bloats every conversation with discovery data.

**B.** Enable plan mode for the discovery phase, since read-only exploration keeps its findings out of the conversation context.

**설명**

Plan mode restricts Claude to read-only research and produces a plan for approval, but the exploration output it generates still accumulates in the main conversation. It controls whether changes are made, not where verbose discovery output lands.

**C(정답).** Delegate the discovery phase to the Explore subagent, which searches in its own context and returns a summary to the main conversation.

**설명**

This is correct. Explore is the built-in read-only subagent for file discovery and code search; it does its verbose work in a separate context window and hands back only a concise summary, so the main conversation keeps its capacity for the design and implementation phases.

**D.** Run discovery in the main conversation and invoke /compact after each batch of files to keep the context window from overflowing.

**설명**

Compaction summarizes history after the verbose output has already consumed the main context, and repeated summarization risks dropping specific call-site details the later phases depend on. It manages the symptom rather than keeping discovery output out of the main conversation in the first place.

### 전반적인 설명

The Explore subagent exists for exactly this situation. It is a fast, read-only agent built into Claude Code for file discovery, code search, and codebase exploration, and like all subagents it operates in its own context window. The hundreds of call-site listings land in that isolated context; only the distilled summary crosses back into the main conversation. The main session therefore arrives at the design and implementation phases with its context budget largely intact, which is where retained context matters most for consistency.

The mental model is a division of labor between contexts: delegate any high-volume side operation (broad searches, log processing, test output) to a subagent whose transcript you will never need again, and keep the main conversation for the decisions and edits that build on each other. This is fundamentally different from compensating after the fact. Running /compact repeatedly summarizes history that has already consumed the window, and each summarization pass can silently drop the precise details discovery was meant to capture. Stashing findings in CLAUDE.md misuses an always-loaded conventions file as a scratchpad, inflating every future session. Plan mode changes what Claude is allowed to do (research without edits), not where its verbose output accumulates; exploration in plan mode still fills the main context.

See Subagents in Claude Code for how Explore and the general subagent delegation pattern keep exploration results out of the main conversation.

### 도메인

Claude Code Configuration & Workflows

## 질문 57

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The document analysis subagent uses a nullable-field extraction schema, yet on papers that omit sample sizes it fabricates plausible numbers despite a prompt instruction to return null for absent values. Which addition most effectively reduces these fabrications?

**A.** Restate the null instruction in capital letters at both the beginning and the end of the extraction prompt.

**설명**

The stem establishes that a prose instruction to return null is already present and is not being followed reliably. Emphasizing the same instruction more loudly does not transfer the judgment; when detailed instructions fail to convey a behavior, demonstrating that behavior through examples is the documented next step.

**B.** Set the sampling temperature to zero so the extraction becomes deterministic and stops inventing values.

**설명**

Temperature controls how token selection is sampled, not whether the model grounds its answer in the source document. A zero temperature makes the fabricated numbers more repeatable across runs; it does not make them any less fabricated.

**C(정답).** Include examples where the correct extraction returns null for a missing field, alongside examples where the value is present.

**설명**

Few-shot examples reduce hallucination in extraction when they demonstrate the edge case the model gets wrong, not just the happy path. Showing a document that lacks a sample size paired with an output of null teaches the model that null is a legitimate, expected answer, making the honest behavior part of the demonstrated pattern rather than a prose rule competing with the pattern.

**D.** Add several more examples of fully populated extractions so the model sees the complete desired output format repeatedly.

**설명**

Examples showing only documents where every field has a value reinforce the very pattern causing the fabrication: the model learns that correct outputs always contain a number in every field. Anthropic's guidance is that examples should be diverse and cover edge cases, and missing data is exactly the edge case these examples fail to demonstrate.

### 전반적인 설명

Few-shot examples work because they demonstrate a decision pattern the model can imitate, and the model imitates everything the examples have in common. If every example shows an extraction where all fields carry concrete values, the implicit lesson is that a correct output always has a value in every slot, and that lesson can override a prose instruction to return null. This is why Anthropic's guidance stresses that examples should be relevant and diverse: they should mirror the real input distribution, including its edge cases, rather than only the happy path. Pairing a document that genuinely lacks a sample size with an output containing null makes honest absence part of the demonstrated format, which is the mechanism that actually reduces fabrication here.

The nullable schema is a necessary precondition (a required field would leave the model no honest answer at all), but permission to return null is not the same as a demonstrated habit of doing so. The remaining fixes attack the wrong layer: lowering temperature changes sampling variability, not grounding, so invented values simply become consistent invented values; and shouting the existing instruction adds emphasis without adding operational content, when the stem already shows that prose alone has not carried the boundary. Note the limit of the guarantee as well: well-chosen examples significantly reduce hallucination in extraction, but Anthropic is explicit that such techniques mitigate rather than eliminate it, so downstream validation still has a role.

See Prompt engineering best practices for example-selection guidance and Reduce hallucinations for the broader grounding toolkit.

### 도메인

Prompt Engineering & Structured Output

## 질문 58

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The web-search subagent's search tool fails in two distinct ways: callers sometimes pass a date filter in the wrong format, and the search backend occasionally times out. Which TWO error responses are correctly designed? (Select TWO.)

**A(정답).** Return the malformed date filter failure with errorCategory "validation", isRetryable true, and a message stating the expected format, such as YYYY-MM-DD.

**설명**

A wrong input format is a validation error: the agent caused it and can fix it. Marking it retryable and spelling out the expected format gives the agent exactly what it needs to correct the parameter and try again.

**B.** Return the backend timeout with errorCategory "validation", isRetryable false, and a message asking the agent to reformulate the search query.

**설명**

A timeout says nothing about the query being wrong, so classifying it as validation misleads the agent into rewriting a perfectly valid request. Marking it non-retryable also blocks the retry that would likely succeed once the service recovers.

**C(정답).** Return the backend timeout with errorCategory "transient", isRetryable true, and a message noting the search service is temporarily unavailable.

**설명**

A timeout is a temporary access failure, not a problem with the request itself. Categorizing it as transient and retryable tells the agent the same call may succeed shortly, so a retry with backoff is the right recovery.

**D.** Return the malformed date filter failure with errorCategory "permission", isRetryable false, and a message instructing the agent to escalate immediately.

**설명**

A bad date format is not an access problem, and labeling it permission with retryable false routes a self-correctable input mistake into escalation. The agent would abandon a query it could have fixed in one retry.

### 전반적인 설명

The value of structured error metadata comes from the mapping between error category and recovery behavior, not merely from having the fields present. Each category encodes a different instruction to the agent: transient means the world is temporarily broken, so retry the same call (ideally with backoff); validation means the request is broken, so fix the input and retry; business means policy forbids the action, so explain rather than retry; permission means access is denied, so escalate. If a tool assigns the wrong category, the agent executes the wrong recovery strategy even though the response is fully structured.

Here the two failure modes map cleanly. A malformed date filter is a validation error and is retryable precisely because the agent controls the input; pairing it with a message that names the expected format ("Expected YYYY-MM-DD") turns the error into a teaching signal the model can act on in its next call. A backend timeout is a transient error: the request was valid and may succeed moments later, so isRetryable: true is the honest signal. Note also the related distinction the tool must preserve: a timeout is an access failure, not an empty result, and should never be reported as a successful query with no matches.

The incorrect pairings each cross-wire category and behavior. Treating a format mistake as a permission failure sends a one-retry fix down the escalation path, wasting the coordinator's attention on something the subagent could resolve locally. Treating a timeout as a non-retryable validation error prompts the agent to rewrite a correct query and forfeits the retry that transient failures are defined by. See MCP Tools for the protocol's error-reporting pattern and Implement tool use for guidance on returning errors the model can recover from.

### 도메인

Tool Design & MCP Integration

## 질문 59

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : While the team's shared MCP servers are declared in the project's .mcp.json, one developer is prototyping an experimental citation-verification MCP server for this project that teammates should not receive yet. How should this server be configured?

**A.** In the project's .mcp.json, since MCP servers must be declared there for Claude Code to discover their tools.

**설명**

Project-level .mcp.json is not the only place servers can be declared; local-scoped and user-scoped servers registered in ~/.claude.json also have their tools discovered on connection. Putting an experimental server in the project file would distribute it to every contributor through version control.

**B(정답).** As a local-scoped MCP server stored in the developer's ~/.claude.json, keeping it private and out of the repository.

**설명**

Local scope is the default and is intended for personal development servers, experimental configurations, and servers with credentials not meant for version control. The entry lives in the developer's ~/.claude.json under the current project's path, so it stays private to them and teammates continue to see only the shared servers from the project's .mcp.json.

**C.** In the project's .mcp.json, after adding that file to .gitignore so the experimental entry never reaches teammates.

**설명**

Ignoring .mcp.json would stop the team's shared servers from being distributed through version control, breaking the file's core purpose. The scoping mechanism already separates private servers from team servers without sacrificing the shared configuration.

**D.** In CLAUDE.md, adding the server's launch command so it starts only for developers whose context loads that file.

**설명**

CLAUDE.md provides project context and instructions to the model; it does not configure or launch MCP servers. Server registration happens through .mcp.json for project scope or ~/.claude.json for local and user scopes.

### 전반적인 설명

MCP server configuration in Claude Code follows an audience-based scoping model, and it is important to distinguish the scope of a server from the file that stores it. A project-scoped server is declared in .mcp.json at the repository root and committed to version control, so every contributor automatically gets the team's shared servers, with secrets kept out via environment variable expansion such as ${GITHUB_TOKEN}. Two other scopes are both stored in the developer's ~/.claude.json and are never shared: local scope, the default, keeps a server private to the developer within the current project, which is exactly what personal development servers, experimental configurations, and credential-bearing entries need; user scope is also private but makes a server available across all of the developer's projects. Once connected, tools from servers in every scope are discovered and available simultaneously.

The mental model is to choose the scope by asking who should receive the server and where it applies. A citation-verification prototype tied to this project has an audience of one, so local scope fits until it is proven and ready to graduate into .mcp.json for the whole team; user scope would be the alternative only if the developer wanted the server in every project they work on. Claiming that servers must be declared in the project file ignores the private scopes entirely. Adding .mcp.json to .gitignore would solve the isolation problem by destroying the distribution mechanism the team's shared servers depend on. And CLAUDE.md is a context file that shapes the model's instructions; it plays no role in registering or launching MCP servers.

See Connect Claude Code to tools via MCP for the configuration scopes and their intended uses.

### 도메인

Tool Design & MCP Integration

## 질문 60

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : This team's internal script saves API-based debugging conversations to disk for resumption the next day. A teammate claims the model's earlier replies cannot be replayed in a new request. How should the script restore a saved conversation?

**A.** Restore only the saved user turns to the messages array, omitting the assistant replies since only the user's inputs need to be resupplied.

**설명**

Omitting the assistant replies discards half the conversation: the model would see the user's questions with no record of what it previously answered, breaking coherence. Prior assistant turns must be included in the history for the model to build on its earlier responses.

**B.** Send a fresh summary of the prior session instead, because the API rejects assistant messages that it did not generate in the current exchange.

**설명**

The API does not reject application-supplied assistant messages; the documentation explicitly permits synthetic assistant turns in the input. Substituting a summary needlessly loses the precise details, such as exact code snippets and error messages, that the saved transcript preserves.

**C.** Collapse the saved transcript into one user message, since assistant turns can only be authored by the model within a single live session.

**설명**

Assistant turns can be supplied directly by the application; they are not restricted to a live session. Flattening the transcript into a single user message discards the alternating role structure the model is trained on, which is both unnecessary and a worse representation of the dialogue.

**D(정답).** Replay the saved user and assistant turns in the messages array, since the API treats supplied history as the conversation regardless of origin.

**설명**

This is correct because the Messages API is stateless: each request stands alone, and the conversation is whatever the messages array contains. Assistant turns do not need to be genuine outputs from a live session; the application can supply them, and the model reasons over them as its own prior replies.

### 전반적인 설명

The mental model to hold is that the Messages API is stateless: there is no session, no server-side memory, and no identifier that links one call to the next. A conversation is an illusion the application constructs by sending the accumulated messages array with every request. A direct consequence is that the history you send does not have to be a verbatim replay of a live exchange: the documentation notes that earlier turns can be genuine prior Claude outputs or synthetic assistant messages supplied by your code. Persisting a transcript to disk and replaying it the next day is therefore a fully supported pattern; from the model's perspective, the replayed conversation is indistinguishable from one that never paused.

This design is deliberate. Statelessness makes every request self-contained and reproducible, and it hands the application full control over what the model sees, enabling patterns like trimming stale turns, injecting a case-facts block, or resuming from storage. The cost of that control is the obligation to resend history yourself.

The other approaches misread this contract. Restoring only the user turns strips out the model's own prior answers, so the resumed session cannot build on what was already said. Collapsing the transcript into one user message throws away the alternating user/assistant structure the model is trained around, for no benefit. And summarizing because replayed assistant messages would supposedly be rejected solves a problem that does not exist while sacrificing the exact code snippets and error details a debugging session depends on. See Working with messages and the Messages API reference.

### 도메인

Context Management & Reliability