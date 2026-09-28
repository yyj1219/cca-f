# Test-MCP

MCP(Model Context Protocol) 관련 문제 모음. Test1~Test6.md에서 추출.

### 출처: Test1.md
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

### 출처: Test1.md
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

### 출처: Test1.md
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

### 출처: Test1.md
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

### 출처: Test1.md
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

### 출처: Test1.md
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

### 출처: Test2.md
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

### 출처: Test2.md
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

### 출처: Test2.md
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

### 출처: Test2.md
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

### 출처: Test2.md
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

### 출처: Test2.md
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

### 출처: Test2.md
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

### 출처: Test2.md
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

### 출처: Test3.md
## 질문 4

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : When engineers ask Claude Code debugging questions about this repository, it frequently answers from general knowledge without reading any project files, and those answers are often wrong. Which change most directly increases its tendency to investigate before answering?

**A.** Lower the sampling temperature so the decision to read files becomes deterministic rather than probabilistic.

**설명**

This is incorrect because temperature, in contexts where it is supported, is a sampling parameter that controls randomness in token selection, not the model's judgment about whether a question warrants investigation. A model inclined to answer from general knowledge will do so just as consistently at low temperature; the inclination itself must be shifted through prompt wording.

**B.** Rewrite the Read and Grep tool descriptions to clarify when each applies, since descriptions drive tool selection.

**설명**

This is incorrect because descriptions primarily resolve which tool to pick when several could apply; the failure here is that the model is not engaging tools at all, which is a propensity problem rather than a routing problem. Built-in tool descriptions are also not something a team edits as part of Claude Code configuration.

**C(정답).** Add an instruction to CLAUDE.md directing Claude to use its tools to inspect the relevant code before responding.

**설명**

This is correct because the threshold at which the model decides to call tools instead of answering directly is documented as steerable through prompt wording. An instruction such as telling Claude to investigate with tools before responding increases tool use, and CLAUDE.md provides persistent project instructions loaded for Claude Code sessions, making it the right place for a team-wide behavioral steer.

**D.** Set tool_choice to {"type": "any"} so the model must emit a tool call on every turn before it can produce an answer.

**설명**

This is incorrect because forcing a tool call on every turn is a blunt guarantee that prevents the model from ever returning a plain text answer, which breaks the normal answer-delivery step of an agent loop. It also operates at the Messages API layer rather than being the configuration surface a team uses to shape Claude Code behavior.

### 전반적인 설명

Under the default tool_choice of {"type": "auto"}, the model decides on each turn whether to call a tool or answer directly, weighing whether the request maps to a described tool capability and whether the answer is already in context. That decision boundary is not fixed: Anthropic documents that it is steerable through system prompt wording. Light instructions like "Use the tools to investigate before responding" increase tool use, stronger phrasing pushes further, and "use your judgment" language keeps behavior conservative. When an agent under-investigates, the highest-leverage fix is therefore an explicit propensity instruction, and in Claude Code the natural home for that instruction is CLAUDE.md, which serves as persistent project memory loaded at the start of Claude Code sessions, so the steer applies uniformly across the team's work in that repository.

The mental model worth internalizing is that tool behavior is shaped by the combined prompt the API assembles from tool definitions, tool configuration, and the caller's system prompt, so both tool metadata and instruction wording matter. But they solve different failure modes: descriptions and names resolve which tool gets chosen when routing is ambiguous, while prompt wording shifts whether tools get engaged at all. Rewriting Read and Grep descriptions targets the wrong failure mode here, and built-in tool descriptions are not a team-editable surface anyway. Forcing tool_choice: {"type": "any"} would guarantee a tool call on every turn, including the turn that should deliver the final text answer, trading a nuanced steering problem for a broken loop. Lowering temperature, where that sampling parameter is even supported, changes token-selection variance, not the model's judgment about when investigation is warranted. See Tool use overview and How to implement tool use.

### 도메인

Tool Design & MCP Integration

### 출처: Test3.md
## 질문 26

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : An engineer wants to test an experimental build of the team's extraction MCP server in one project only, while teammates keep loading the shared version from the project's .mcp.json. Which configuration approach achieves this?

**A.** Register the experimental server at user scope under the same name, keeping it private while remaining outside version control.

**설명**

User scope is private, but it applies across all projects on the machine rather than just this one. It also sits below project scope in the precedence order, so the shared .mcp.json definition would still win in this project and the experimental build would never load here.

**B(정답).** Add the experimental server at local scope under the same name, letting it shadow the shared project definition on this machine only.

**설명**

This is correct. Local scope is stored under the current project's entry in the user's home-directory ~/.claude.json, stays private, and applies only in this project. Because local scope has higher precedence than project scope for a same-named server, the experimental build takes effect on this machine while teammates continue loading the shared .mcp.json definition.

**C.** Edit the project's .mcp.json to point at the experimental build, planning to revert the file before committing any changes.

**설명**

Editing the version-controlled team file puts experimental configuration one accidental commit away from every teammate. The scoping system exists so personal overrides never require touching the shared baseline, so this manual edit-and-revert workflow is unnecessary and risky.

**D.** Add the experimental server under a new name to .mcp.json and note in CLAUDE.md that this project should prefer the experimental tools.

**설명**

This commits experimental server configuration to the shared file, exposing every teammate to it, and then relies on probabilistic prompt guidance to steer tool selection. Scope-based shadowing solves the same problem deterministically without changing anything the team sees.

### 전반적인 설명

Claude Code resolves MCP server configuration through a strict scope precedence order: local scope wins over project scope, which wins over user scope (followed by plugin-provided servers and connectors). When the same server name appears at multiple scopes, only the highest-precedence definition is used; the definitions are never merged field by field. This design lets a developer temporarily shadow the team's shared server with a personal build, which is exactly the intended workflow for testing changes to shared tooling.

The mental model is that each scope serves a different audience: the project-level .mcp.json at the repository root is checked into version control and defines the team baseline; local scope (stored under the current project's entry in ~/.claude.json) is private to one user and one project, making it the recommended home for experimental configurations; and user scope is private but applies across every project on the machine. Because local outranks project, the engineer's experimental extraction server takes effect only on their machine and only in this project, and teammates continue to load the shared definition from .mcp.json, unaffected.

The alternatives all break one of these boundaries. Editing the committed .mcp.json makes a personal experiment the team's problem the moment the revert is forgotten. User scope fails twice: it leaks the experiment into every other project, and its lower precedence means the project definition still wins where the test was intended to run. Renaming the server inside the shared file and steering selection through CLAUDE.md commits experimental infrastructure to the repository and substitutes prompt guidance for a deterministic configuration mechanism. See the Claude Code MCP documentation for the full precedence rules and scope descriptions.

### 도메인

Tool Design & MCP Integration

### 출처: Test3.md
## 질문 33

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : Your team's MCP tool for querying the internal package registry returns the string "Error occurred" for both expired credentials and brief registry outages. The agent retries credential failures repeatedly and gives up during outages. What should the tool do on failure instead?

**A.** Return a successful result with an empty payload during outages, letting the agent continue without interruption.

**설명**

Marking a failure as success is silent error suppression, a recognized anti-pattern. The agent would treat the empty payload as a valid answer (for example, concluding a package does not exist), turning a recoverable outage into misinformation.

**B.** Keep the same generic message and add a system prompt rule to retry every failed call twice before escalating.

**설명**

A blanket retry policy applies one recovery strategy to error types that require different ones: retrying an expired-credential failure is futile, while two retries may be too few or unnecessary for outages. The problem is missing information at the tool boundary, and prompt rules cannot supply it.

**C(정답).** Return an errorCategory field (transient or permission), an isRetryable boolean, and a brief plain-language message.

**설명**

This is correct because structured error metadata gives the agent the signal it needs at decision time: transient errors with isRetryable true get retried with backoff, while permission errors with isRetryable false get escalated instead of hammered. The human-readable message lets the agent explain or act on the failure appropriately.

**D.** Return the registry client's raw stack trace and internal exception details, so no diagnostic information is lost.

**설명**

A raw stack trace exposes internals the model cannot reliably interpret and still fails to classify the error as retryable or not. Volume of detail is not the same as decision-relevant structure; the agent needs a category and retryability signal, not implementation internals.

### 전반적인 설명

An agent's recovery behavior is only as good as the information its tools return. When every failure collapses into one opaque string, the model has no basis for choosing between retrying, changing its approach, or escalating, so it guesses, and it guesses wrong in both directions here. The fix is to make the tool's error response carry the decision-relevant facts: an errorCategory that classifies the failure (transient for outages and timeouts, validation for bad input, permission for access problems, business for policy refusals), an isRetryable boolean that directly answers the retry question, and a human-readable message the agent can act on or relay.

The mental model is that each category maps to a distinct recovery action: transient errors are retried with backoff, validation errors prompt the agent to fix its input, permission errors are escalated to a human, and business errors are explained rather than retried. In this situation, an expired credential is a permission failure (isRetryable false, escalate to whoever manages the token), while a brief registry outage is transient (isRetryable true, retry). With that metadata, the agent's current behavior inverts to the correct one.

The alternatives all miss the tool boundary as the point of leverage. Dumping a raw stack trace adds volume without classification and leaks internals the model should not repeat. A prompt-level rule to retry everything twice hard-codes one strategy across error types that need different ones. Returning an empty success during outages is silent suppression: the agent will treat missing data as a true answer, which is worse than a visible failure. MCP additionally provides the isError flag so failures are protocol-visible rather than prose the model must infer from; the structured body then tells it what to do next. See the MCP documentation on Tools for error handling guidance.

### 도메인

Tool Design & MCP Integration

### 출처: Test3.md
## 질문 35

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A pull request modifies a shared helper function that several wrapper modules re-export under different names. The review agent must locate every call site to judge the change's blast radius. Which investigation approach is correct?

**A.** Read every file under the source tree in sequence and assemble a complete call graph before evaluating the change.

**설명**

Exhaustive reading burns the context window on files that never touch the helper, degrading the analysis before it starts. Targeted content search finds the relevant files at a fraction of the cost.

**B.** Glob with a pattern derived from the helper function's name to find all files that reference it, then Read each match.

**설명**

Glob matches file names and paths against patterns; it does not look inside file contents. A function referenced inside a file named something unrelated would never be found, so this approach swaps the tools' roles.

**C.** Grep the codebase for the helper function's original name, since every wrapper ultimately delegates to that one implementation.

**설명**

Callers that import a wrapper's re-exported alias never mention the original name in their code. Searching only the original identifier finds direct usages but silently misses every call site that goes through a renamed export, understating the change's impact.

**D(정답).** Read the wrapper modules to enumerate every exported name, then Grep file contents for each of those names across the codebase.

**설명**

This is the correct tracing pattern for wrapped functions. Wrapper modules create aliases, so callers may reference any of the exported names; enumerating them first and then content-searching for each one is the only way to find all call sites.

### 전반적인 설명

Wrapper modules break the assumption that one function has one name. When a helper is re-exported (often under aliases), the codebase contains call sites that reference the wrapper's exported names, not the original identifier. The reliable tracing workflow therefore has two phases: first Read the wrapper modules to build the full list of names under which the function is visible, then Grep file contents for each of those names. Only after the alias inventory is complete does a content search actually cover every path to the implementation.

The mental model behind the tool split matters here. Grep searches inside files (identifiers, imports, error strings) and is the right tool once you know which names to look for; Glob matches file paths against patterns and cannot see references buried in file contents, so deriving a Glob pattern from a function name confuses the two tools' territories. Note also that Grep defaults to returning file paths only; switching to content mode (or following up with Read) shows the exact matching lines when the agent needs to inspect individual call sites.

Searching only the original name is the subtler trap: it feels sufficient because all wrappers delegate to that implementation, but delegation happens at runtime, not in the source text the search examines. Code that imports an alias contains only the alias. And reading every file to build a call graph is the anti-pattern incremental investigation exists to avoid; it spends the context budget indiscriminately instead of letting search narrow the field first. See the Claude Code tools reference for the Grep and Glob semantics that underpin this workflow.

### 도메인

Tool Design & MCP Integration

### 출처: Test3.md
## 질문 39

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : A Glob call with the pattern **/*.ts across the legacy monorepo returns a truncation flag indicating the 100-file cap was reached. The agent needs a complete list of TypeScript files in the payments service. What should it do next?

**A(정답).** Re-run Glob with a narrower pattern scoped to the payments subtree, such as services/payments/**/*.ts.

**설명**

This is the designed response to truncation: the flag exists precisely to tell the agent its pattern matched too broadly. Scoping the pattern to the relevant subtree brings the match set under the cap and yields the complete list the agent actually needs.

**B.** Treat the returned files as sufficient, since Glob sorts by modification time and the newest 100 cover active code.

**설명**

Modification-time ordering makes recently touched files appear first, but recency is not completeness. In a legacy monorepo, payments files that have not changed recently could be excluded entirely, leaving the agent with a silently incomplete inventory.

**C.** Switch to Grep with the same pattern, since content search is not subject to the 100-file result cap.

**설명**

Grep searches inside file contents, so it is the wrong tool for enumerating files by extension. Applying a path pattern like **/*.ts to a content-search tool misuses the tool boundary rather than fixing the overly broad match.

**D.** Re-run the same broad Glob pattern, expecting the second pass to return the next batch of matching files.

**설명**

Glob has no mechanism for returning different batches of matches across successive calls; repeating the identical overly broad pattern simply reproduces the same truncated result. The documented remedy for hitting the cap is to narrow the search pattern.

### 전반적인 설명

The Glob tool matches files by path pattern (name, extension, directory) using standard glob syntax, including ** for recursive matching. Its results are sorted by modification time and capped at 100 files; when the cap is hit, the tool includes a truncation flag in the result. That flag is not an error, it is a signal designed to prompt exactly one behavior: narrow the pattern so the match set fits within the cap. Scoping the search from **/*.ts down to services/payments/**/*.ts converts an over-broad, truncated result into a complete one for the subtree that matters.

The mental model to hold is that the cap protects the agent's context from being flooded by enormous file listings, while the truncation flag preserves honesty about incompleteness. Any strategy that ignores the flag risks silent data loss: relying on modification-time ordering assumes the newest 100 files are the relevant ones, which fails badly in legacy code where critical files may be years old. There is no pagination mechanism in Glob, so re-running the identical pattern reproduces the identical truncated result. And Grep sits on the other side of a clean division of labor: Grep searches what is inside files, Glob matches what files are called; enumerating files by extension is squarely Glob's territory.

See the Claude Code tools reference for Glob's pattern syntax, result ordering, and truncation behavior.

### 도메인

Tool Design & MCP Integration

### 출처: Test3.md
## 질문 42

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The review agent keeps misrouting style nitpicks to flag_security_issue instead of flag_style_issue. Both tool descriptions have already been rewritten twice with explicit boundaries and example inputs, yet the misrouting rate is unchanged. What should you do next?

**A(정답).** Audit the system prompt for wording that associates one issue category with a particular tool, and neutralize any such phrasing.

**설명**

When descriptions are already explicit and repeated rewrites do not change the misrouting rate, the selection bias is likely coming from elsewhere in the context. System prompt wording, such as language framing every finding as a potential security concern, can create keyword associations that override well-written tool descriptions, so reviewing and neutralizing that wording targets the actual root cause.

**B.** Rewrite both descriptions a third time, embedding few-shot examples of past misrouted issues in each one.

**설명**

The situation establishes that two rounds of description improvements produced no change, which is strong evidence the descriptions are not the failure point. A third rewrite adds token overhead while leaving the real source of the bias untouched.

**C.** Merge the two tools into a single flag_issue tool that takes a category parameter, so the model never selects between them.

**설명**

Merging tools converts a visible selection decision into a hidden mode decision inside one overloaded tool, which descriptions are worse at guiding. This is a recognized anti-pattern that relocates the misclassification rather than resolving it.

**D.** Use tool_choice to force flag_style_issue whenever the changed files are formatting or documentation only.

**설명**

Forced tool selection exists to guarantee a required step or execution order, not to substitute for per-issue classification. A file-type heuristic in the harness cannot judge issue categories within mixed diffs and would misfire whenever a formatting change also carries a genuine security implication.

### 전반적인 설명

Tool descriptions are the primary selection mechanism, but they are not the only text the model weighs when choosing a tool. Everything in context participates in selection, and the system prompt sits above the tool definitions in influence. A single instruction like "security is the top priority in every review" can create a keyword-level association that pulls borderline findings toward the security tool, no matter how carefully the two descriptions draw their boundaries.

The diagnostic logic here is about evidence: two rounds of description improvements with zero movement in the misrouting rate strongly suggests the descriptions are not the failure point. The next place to look is the system prompt, scanning for keyword-sensitive instructions that pair a topic, priority, or category with one tool's territory. Neutralizing that phrasing (for example, instructing the agent to classify each finding by its actual category rather than emphasizing one category) lets the well-written descriptions govern selection again.

The alternatives each miss this. Collapsing the tools into one with a category parameter buries the same classification decision where descriptions can no longer guide it, a documented anti-pattern for overloaded tools. Forcing a tool with tool_choice is designed to guarantee a specific step or ordering, not to perform per-issue routing; a file-path heuristic cannot classify the content of findings. And a third description rewrite spends effort and tokens on the one component the evidence has already exonerated.

See Implement tool use for Anthropic's guidance on tool definitions and how surrounding context affects tool selection.

### 도메인

Tool Design & MCP Integration

### 출처: Test3.md
## 질문 48

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : A custom MCP tool runs static analysis file by file during an automated documentation task. Occasionally a single file fails to parse. How should the tool report that failure so the overall run stays reliable?

**A.** Terminate the entire documentation run on the first parse failure so no output is ever produced from incomplete analysis.

**설명**

Halting the whole workflow over one file discards all the valid analysis already completed. A single unparseable file does not invalidate the documentation generated for every other file, so this trades a small gap for total loss of progress.

**B.** Retry parsing the failing file repeatedly inside the tool until it succeeds, keeping the failure invisible to the model.

**설명**

A file that fails to parse due to a syntax problem will not succeed on retry, so unbounded retries just burn time and can hang the run. Retries help transient failures like timeouts, not deterministic parse errors, and hiding the failure from the model removes its ability to adapt.

**C.** Return an empty analysis result marked as successful so the run proceeds smoothly without interrupting the remaining files.

**설명**

This is the silent suppression anti-pattern. Claude will treat the empty result as a genuine finding that the file contains nothing noteworthy, producing documentation with an invisible gap that no one knows to check.

**D(정답).** Return an error naming the file and the parse failure, so Claude continues with the remaining files and notes the gap.

**설명**

This is correct because it neither hides the failure nor sacrifices the rest of the run. Claude receives accurate information about what failed and why, can proceed with the files that succeeded, and can annotate the documentation to show which file was not covered.

### 전반적인 설명

Error propagation in agentic workflows rests on one principle: the model can only make good decisions about information it actually receives. When a tool encounters a failure it cannot resolve, the correct behavior is to return an honest, descriptive error (in MCP, a tool result flagged with isError) that identifies what failed and why, while allowing the rest of the workflow to continue. Claude can then reason about the failure: skip the file, try an alternative approach, or annotate the final documentation so the coverage gap is visible rather than hidden.

The two classic anti-patterns sit at opposite extremes. Silent suppression, returning an empty result marked as success, corrupts the model's world view: an empty analysis reads as "this file has nothing to document," which is a factual claim, not a graceful degradation. Terminating the entire run on one failure is the opposite failure mode: it treats a local, recoverable problem as globally fatal and throws away every valid result already produced. Unbounded internal retries are a third trap; retrying makes sense only for transient errors such as timeouts, whereas a deterministic parse error will fail identically every attempt, so the retry loop just stalls the run while still hiding the problem.

The mental model to carry: distinguish error categories, recover locally only where recovery is plausible, and surface everything else as structured, accurate context so the agent (or a human) decides how to proceed with partial results. See Implement tool use and MCP tools for how error results are communicated back to the model.

### 도메인

Context Management & Reliability

### 출처: Test3.md
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

### 출처: Test3.md
## 질문 52

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : An engineer adds a remote MCP server to the project's .mcp.json, giving the entry a name and a url field but nothing else. On startup, Claude Code skips the server and reports a configuration error. What change fixes this?

**A.** Add a command field launching a local proxy process, since project-scoped entries must define one.

**설명**

This is incorrect. Only stdio server entries require a command to launch a local process; an HTTP entry connects directly to its url. Introducing a proxy process adds unnecessary infrastructure to work around a one-field configuration mistake.

**B(정답).** Add "type": "http" to the server entry so the url is interpreted as a remote endpoint.

**설명**

This is correct. Claude Code treats entries that lack a type field as stdio servers, which are launched via a command; a url with no type is a configuration error and the server is skipped. Declaring the entry as an HTTP server tells Claude Code to connect to the URL as a remote endpoint.

**C.** Move the entry to ~/.claude.json, because remote servers can only be configured at user scope.

**설명**

This is incorrect. Remote HTTP servers are fully supported in project-scoped .mcp.json, which is exactly where a shared team server belongs. The scope of the file has nothing to do with why the entry is being skipped.

**D.** Wrap the url value in ${...} environment variable expansion so it resolves at startup.

**설명**

This is incorrect. Environment variable expansion in .mcp.json exists to keep secrets like tokens out of version control, not to make a url field valid. The entry fails because its transport type is undeclared, not because of how the URL is written.

### 전반적인 설명

Claude Code's .mcp.json supports two fundamentally different kinds of server entries, and the type field is how it tells them apart. A stdio server is a local process that Claude Code launches itself, so its entry needs a command (and usually args). An HTTP server is a remote endpoint Claude Code connects to over the network, so its entry needs "type": "http" and a url. Because stdio is the assumed default when no type is present, an entry containing only a url looks to Claude Code like a stdio server with no command to run; it cannot start such a server, so it skips the entry and reports the misconfiguration.

The mental model to keep is that the type field selects the transport, and the transport determines which other fields are meaningful. Adding a command to front the remote server with a proxy would technically produce a launchable stdio entry, but it solves the wrong problem and adds a process every teammate must have installed. Moving the entry to ~/.claude.json changes who sees the server (personal rather than shared through version control) without changing how the entry is parsed. Environment variable expansion such as ${GITHUB_TOKEN} is a secret-management feature for keeping credentials out of the committed file; it does not alter transport interpretation.

See Connect Claude Code to tools via MCP for the project-scope configuration format and examples of both stdio and HTTP server entries.

### 도메인

Tool Design & MCP Integration

### 출처: Test3.md
## 질문 55

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The review MCP server's url must come from a REVIEW_API_URL variable that CI exports, but developer machines that have not set the variable should fall back to a staging endpoint. How should the shared .mcp.json express this?

**A.** Write the url as ${REVIEW_API_URL} alone and add a setup step requiring every developer to export the staging endpoint manually.

**설명**

A bare placeholder works only when the variable is actually set; on a machine where it is missing, Claude Code loads the config with a missing-variable warning and leaves the literal ${REVIEW_API_URL} text in the field, breaking the server at connection time. It also makes the fallback depend on a manual step every developer must remember, when the ${VAR:-default} form handles it automatically in the shared file.

**B.** Maintain a second .mcp.json with the staging URL hard-coded and have a setup script copy the correct variant into place per environment.

**설명**

Duplicating the configuration file creates drift between the variants and adds a scripted copy step that every environment must run correctly. Environment variable expansion with a default value solves the same problem inside one version-controlled file with no extra machinery.

**C(정답).** Write the url as ${REVIEW_API_URL:-https://staging.internal/api} so environments without the variable resolve to the staging endpoint.

**설명**

Claude Code supports the ${VAR:-default} expansion syntax in .mcp.json fields such as url: when the variable is set it expands to its value, and when unset it expands to the supplied default. A single checked-in file therefore serves both CI, which exports the production URL, and developer machines, which fall back to staging.

**D.** Hard-code the CI endpoint in the shared .mcp.json and have each developer define a staging copy of the server in ~/.claude.json.

**설명**

User-scoped configuration in ~/.claude.json is meant for personal and experimental servers, not as a fallback channel for shared team tooling. Every developer would have to maintain a duplicate server definition by hand, and those copies drift from the project file; a placeholder with a default expresses the fallback in one version-controlled file.

### 전반적인 설명

Claude Code performs environment variable expansion when it reads .mcp.json, and the syntax supports exactly two placeholder forms: ${VAR}, which expands to the value of the variable, and ${VAR:-default}, which expands to the variable when it is set and to the literal default otherwise. Expansion works in the command, args, env, url, and headers fields. The design goal is that one file can be committed to version control and shared across every contributor and CI runner, while machine-specific values (endpoints, paths) and secrets (tokens) stay in each environment rather than in the repository.

The ${VAR:-default} form is precisely the mechanism for the situation here: CI exports REVIEW_API_URL and gets the production endpoint, while a developer machine with nothing exported resolves the same placeholder to the staging URL. It is worth internalizing what happens when a plain ${VAR} reference has no value and no default: Claude Code does not fail to parse the file and does not substitute an empty string. It loads the configuration, surfaces a missing-variable warning for that server in claude mcp list, and uses the unexpanded ${VAR} text as-is, which typically breaks that server at connection time. That behavior is why the default syntax, not manual per-developer setup, is the correct way to make a config degrade gracefully.

The distractors fail in practice: a bare placeholder leaves the fallback dependent on a manual export step that any developer can forget; pushing a duplicate staging server into each developer's ~/.claude.json misuses user-scoped configuration for shared tooling and multiplies the definitions to keep in sync; and keeping two hard-coded file variants swapped by a script reintroduces exactly the configuration drift that placeholder expansion was designed to eliminate. See Connect Claude Code to tools via MCP for the expansion syntax and supported fields.

### 도메인

Tool Design & MCP Integration

### 출처: Test3.md
## 질문 59

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : A teammate is designing an MCP server that exposes the team's internal service registry: service names, endpoint schemas, and owning teams. Agents read this inventory but never modify anything. How should the server expose it?

**A.** Skip the MCP server for this data and paste the registry into the project CLAUDE.md so every session loads it.

**설명**

Hard-coding a live inventory into CLAUDE.md goes stale the moment a service is added or an owner changes, and it burdens every request with the full registry whether or not the task touches it. A resource serves the current data on demand instead.

**B.** Expose it through a get_service_registry tool, since tool calls are how agents typically pull data from servers.

**설명**

Tools are the MCP primitive for actions the server performs, analogous to POST endpoints. Wrapping read-only reference data in a tool works mechanically but misuses the primitive; the protocol provides resources precisely so agents can obtain contextual data without framing every read as an action.

**C(정답).** Expose the registry as MCP resources, since resources are the protocol's primitive for data that agents read.

**설명**

Resources are the MCP primitive designed for exposing readable data, analogous to GET endpoints. A service registry that agents consult but never change is exactly the content-catalog use case resources exist for, giving agents an immediate map of what is available without action semantics.

**D.** Expose it as an MCP prompt template so the full registry is injected into every agent conversation automatically.

**설명**

MCP prompts are reusable prompt templates, such as a code review workflow or an analysis outline. They are not a channel for publishing data catalogs, and forcing the entire registry into every conversation would waste context regardless of whether the task needs it.

### 전반적인 설명

The Model Context Protocol defines three primitives with distinct jobs: resources expose data for reading (like GET endpoints), tools perform actions (like POST endpoints), and prompts package reusable templates. A service registry that agents consult but never mutate maps cleanly onto resources: the server publishes the catalog, and agents read it directly to learn what services, schemas, and owners exist before doing any real work.

The design rationale matters more than the taxonomy. When reference data lives behind a tool, the model must decide to call an action just to find out what exists, and every read consumes a tool-selection decision plus a round trip framed as doing something. Resources remove that friction: they act as a content catalog, giving the agent an immediate map of available data so exploratory calls (listing services, probing for schemas) never happen. This is the same reason MCP resources are the recommended way to surface documentation hierarchies, database schemas, and issue summaries.

The remaining approaches each fail on the primitive's intent. A get_service_registry tool duplicates what resources already provide while attaching action semantics to a pure read. An MCP prompt is a template for how to work, not a pipe for what data exists. And pasting the registry into CLAUDE.md trades a live source of truth for a static copy that drifts as services change, while inflating the context of every session with data most tasks never need. See MCP Resources and Claude Code MCP documentation.

### 도메인

Tool Design & MCP Integration

### 출처: Test4.md
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

### 출처: Test4.md
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

### 출처: Test4.md
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

### 출처: Test4.md
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

### 출처: Test4.md
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

### 출처: Test4.md
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

### 출처: Test4.md
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

### 출처: Test4.md
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

### 출처: Test4.md
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

### 출처: Test5.md
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

### 출처: Test5.md
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

### 출처: Test5.md
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

### 출처: Test5.md
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

### 출처: Test5.md
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

### 출처: Test5.md
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

### 출처: Test5.md
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

### 출처: Test5.md
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

### 출처: Test5.md
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

### 출처: Test5.md
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

### 출처: Test5.md
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

### 출처: Test6.md
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

### 출처: Test6.md
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

### 출처: Test6.md
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

### 출처: Test6.md
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

### 출처: Test6.md
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

### 출처: Test6.md
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

### 출처: Test6.md
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

### 출처: Test6.md
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

### 출처: Test6.md
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

