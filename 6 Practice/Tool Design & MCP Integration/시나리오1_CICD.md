# 시나리오1_CICD

## 질문 1

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



## 질문 2

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



## 질문 3

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



## 질문 4

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



## 질문 5

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



## 질문 6

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



## 질문 7

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



## 질문 8

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



## 질문 9

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



## 질문 10

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



## 질문 11

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



## 질문 12

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



## 질문 13

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



