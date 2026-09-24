# Practice Test 3

## 질문 1

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

## 질문 2

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : Compliance mandates that national ID numbers, all of which match your team's validated regex detector, must never appear in extraction output sent downstream. System prompt instructions to omit them still leak occasionally in testing. Which design guarantees compliance?

**A.** Set sampling temperature to zero so the model applies the omission instruction identically on every extraction run.

**설명**

Zero temperature makes token selection deterministic but does not make an instruction binding; if the model's most likely output includes the ID number, it will reproduce that leak consistently. A compliance requirement is not a sampling problem.

**B(정답).** Run the validated detector in code on the final extraction JSON, stripping any matches before the output is sent downstream.

**설명**

This is correct because a code-level check executes on every run and scans exactly the artifact the mandate governs: the output sent downstream. Since the stem establishes that all regulated IDs match the validated detector, the scan is exhaustive and deterministic, so no ID can pass the boundary regardless of where it entered or what the model produced.

**C.** Add a prompt-based hook that has a small Claude model review each extraction result and reject any output containing ID numbers.

**설명**

Prompt hooks invoke a model to make a judgment, which is inherently probabilistic; the reviewing model can miss an ID number just as the extracting model can leak one. Anthropic positions prompt hooks for decisions requiring judgment, not for rules that must hold every time.

**D.** Restate the redaction rule prominently in the system prompt and exclude ID number fields from the extraction JSON schema.

**설명**

System prompt instructions provide only probabilistic compliance, which the scenario shows is already failing. While JSON schemas can constrain string content with patterns, merely excluding an ID field does not prevent an ID number from surfacing inside any free-text field the schema allows.

### 전반적인 설명

The dividing line this question tests is between deterministic enforcement and probabilistic compliance. Anything expressed as instructions to the model, whether in a system prompt, a schema description, or a reviewing model's rubric, is followed with high but not perfect reliability. When a rule carries regulatory consequences, the enforcement must live in code that executes on every run regardless of what the model decides. Hooks and code-level gates exist precisely to provide that guarantee: the Claude Code hooks guide describes hooks as deterministic control that ensures actions happen rather than relying on the model to choose them.

Placement matters as much as determinism. The mandate governs the output boundary, so the enforcement point must sit there: a code check that runs the validated detector on the final extraction JSON covers every path an ID could take into the output, whether it arrived through a tool result, the source document, or the model's own generation. An input-side transformation such as a PostToolUse hook on tool results is valuable, but it only guarantees cleanliness of data flowing through that one channel; it cannot by itself certify what leaves the system. Because the stem states every regulated ID matches the detector, scanning the outbound artifact makes the redaction exhaustive, converting a probabilistic instruction into a hard gate.

The distractors each fail on the determinism axis. A prompt hook re-introduces a model judgment into the enforcement path; the hooks reference distinguishes prompt handlers, which use a Claude model for single-turn evaluation, from command handlers that run code, and Anthropic recommends the latter for production enforcement. Excluding an ID field from the schema does not stop IDs from appearing inside allowed free-text fields such as summary or notes strings, even though JSON Schema can constrain string content when validators like patterns are applied. And zero temperature only removes randomness from sampling; a deterministic model that has decided to include the number will include it every time.

### 도메인

Agentic Architecture & Orchestration

## 질문 3

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : This team embeds the Agent SDK to automate large refactors. The main agent, configured with allowedTools of Read, Grep, and Glob, ignores repeated prompt instructions to delegate analysis work to the defined subagents. Which change enables delegation?

**A.** Rewrite each subagent's AgentDefinition description so the main agent matches tasks to them.

**설명**

Clearer descriptions improve how well tasks are matched to subagents, but matching only matters once delegation is possible. With no Task tool available, the main agent cannot spawn any subagent no matter how precise the descriptions are.

**B(정답).** Add "Task" to the main agent's allowedTools so it can spawn the defined subagents.

**설명**

Subagents are spawned through the Task tool, so a coordinator whose allowedTools omits Task has no mechanism to delegate regardless of its instructions. Adding Task restores the capability the prompt is asking the agent to use.

**C.** Add each subagent's name to the main agent's allowedTools so it can invoke them directly.

**설명**

Subagents are not invoked as tools under their own names. Delegation always flows through the Task tool, so listing subagent names in allowedTools does not create any invocation path.

**D.** Strengthen the delegation instructions in the system prompt and repeat them in CLAUDE.md.

**설명**

Prompt instructions are guidance, not capability. The agent already receives instructions to delegate; the failure is that its tool configuration provides no way to act on them, and stronger wording cannot create a missing tool.

### 전반적인 설명

In the Claude Agent SDK, delegation to subagents is not a behavior the model performs directly; it happens through a specific tool call. The coordinator emits a Task tool invocation, and the harness spawns the corresponding subagent, runs it in its own isolated context, and returns its final message. That means spawning subagents is a capability governed by allowedTools, exactly like Read or Bash. If Task is not in the list, the agent literally has no action available that results in a subagent, so it falls back to doing the work itself, which is what the team observed.

The useful mental model is a strict separation between capability configuration and prompt guidance. Prompts shape what the model tries to do; the tool list defines what it can do. When an agent consistently fails to take an action its prompt demands, the first check is whether the action is even available. This is why rewriting AgentDefinition descriptions or escalating instructions in the system prompt and CLAUDE.md cannot fix this failure: those levers tune probabilistic behavior around a capability that does not exist in the configuration. Similarly, subagents are never invoked as tools under their own names; the names and descriptions in each AgentDefinition only tell the coordinator which subagent to request when it calls Task.

Once Task is present, the coordinator can also emit multiple Task calls in a single response to run independent subagents in parallel, which is the standard pattern for fanning out analysis across a large codebase. See the official Subagents in the SDK documentation for how the Task mechanism, AgentDefinition configuration, and context isolation fit together.

### 도메인

Agentic Architecture & Orchestration

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

## 질문 5

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : While tuning extraction schemas, the agent records per-field error rates in a scratchpad file. After /compact runs mid-session, it misquotes those rates in later turns. What makes the recorded rates reliably available again?

**A.** Run compaction more frequently so each summary is produced while the recorded rates are still recent in the raw history.

**설명**

More frequent compaction intensifies the problem rather than solving it. Each summarization pass is lossy for precise numeric values, so compacting more often subjects the rates to more compression events, not fewer.

**B.** Raise the compaction threshold so summarization triggers later, keeping the rates in the uncompacted history for longer.

**설명**

Delaying compaction only postpones the loss. Once the threshold is eventually reached, the same lossy summarization condenses the precise rates into vague prose, and the scratchpad's value still depends on the agent reading it back.

**C.** Assume no further step is needed, since the agent authored the file and retains its contents internally across compaction.

**설명**

This reflects a mistaken mental model: the model has no internal memory of files it wrote. Once compaction condenses the conversation, the precise rates exist only in the file, and they reliably re-enter the agent's reasoning when the file is read back into context.

**D(정답).** Have the agent explicitly read the scratchpad file whenever it needs the exact rates, rather than relying on automatic reloading.

**설명**

This is correct because a scratchpad file is external workspace state, not model memory. The file's contents influence reasoning only when they are in the context window, so the dependable pattern is to have the agent consult the file explicitly whenever the precise figures are needed.

### 전반적인 설명

The mental model to hold here is that a scratchpad file is external state, not hidden memory. Anthropic's guidance on long-running work treats ordinary files (progress notes, JSON status files, git history) as durable state precisely because they live in the workspace and survive whatever happens to the conversation. But the model itself is stateless with respect to those files: writing a file does not implant its contents into the model, and there is no guarantee that a scratchpad's exact figures will be back in the window after the conversation is condensed. The contents matter to reasoning only when they occupy the context window, which means the agent should be directed to read the file explicitly when it needs the precise figures.

This is exactly why scratchpads pair so well with /compact. Compaction condenses the conversation into a summary so a long session can continue, but summarization is lossy for exactly the kind of information this system depends on: per-field error rates, thresholds, and other precise numbers. The division of labor is deliberate: let compaction discard verbose history, and let the file carry the facts that must survive verbatim, re-loaded on demand.

The other approaches fail against this model. Trusting the agent to remember a file it authored assumes internal memory that does not exist. Compacting more often runs the lossy compression more times, and raising the threshold merely delays a single lossy pass; neither protects numeric precision the way an explicitly re-read file does. See Manage Claude's memory and Prompt templates and variables for how Anthropic frames files and memory as context that must be loaded, not state the model retains.

### 도메인

Context Management & Reliability

## 질문 6

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : Your documentation workflow extracts function metadata into a schema. JSDoc-style files extract correctly, but files using inline comments or docstrings return null for fields the comments clearly contain, even after detailed prose instructions. What should you add?

**A(정답).** Few-shot examples pairing each comment style with the correct extracted output for the same fields.

**설명**

This is correct. When the model handles one document format well but returns nulls on others, contrasted examples showing the same fields extracted from differently structured sources teach it to recognize the pattern across formats. Extraction from varied document structures is a documented case where few-shot examples outperform prose instructions.

**B.** An emphatic instruction that the model must never return null when the information exists in the file.

**설명**

This is incorrect because the instruction names the goal without transferring the skill; the model already intends to extract present values but does not recognize them in unfamiliar comment styles. Emphasis on a rule with no operational content does not change extraction behavior.

**C.** A preprocessing step that rewrites inline comments and docstrings into JSDoc blocks before extraction.

**설명**

This is incorrect because it adds a brittle transformation layer that must itself correctly parse every comment style, which is the original problem restated. The model can generalize across formats directly once examples demonstrate the mapping, without extra machinery.

**D.** Schema changes marking every metadata field as required so the model cannot return null for them.

**설명**

This is incorrect because forbidding null does not teach the model to find values in unfamiliar formats; it removes the honest fallback. When the model fails to locate a value, a required field pressures it to fabricate a plausible-looking one, which is worse than a null.

### 전반적인 설명

This failure pattern, correct extraction from one document structure but empty or null fields from others, is the signature case for few-shot prompting. Prose instructions describe what to do, but they cannot easily convey how the same information looks when it appears in a JSDoc block versus an inline comment versus a docstring. A small set of examples that shows each format alongside its correctly populated output demonstrates the mapping itself; the model then generalizes that pattern to new files rather than merely matching the one format it already handles. This is why extraction from varied document structures is one of the situations where examples reliably beat further instruction refinement.

The distractors each miss the root cause. Marking fields as required in the schema attacks the symptom (nulls) rather than the cause (unrecognized formats), and it removes the model's legitimate way to say a value is absent; schema pressure on a value the model cannot locate is exactly the condition that produces fabricated data. A preprocessing step that normalizes all comments into JSDoc simply relocates the parsing problem into deterministic code that must handle every variant, which is fragile and unnecessary when the model can learn the variation directly. An emphatic never-return-null instruction has no operational content: the model is not choosing to withhold values, it is failing to recognize them, so intensified wording changes nothing.

A useful mental model: instructions set the objective, examples transfer the judgment. When output is inconsistent across input variations despite clear instructions, add 2 to 4 targeted examples covering the variations, including at least one for each format the pipeline must handle. See Use examples (multishot prompting) to guide Claude's behavior for official guidance on this technique.

### 도메인

Prompt Engineering & Structured Output

## 질문 7

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : The team adds a second Claude instance to review generated refactors, seeding it with the generator's full session transcript so it understands intent. The reviewer approves nearly everything, echoing the generator's justifications. What change restores effective review?

**A(정답).** Pass the reviewer only the code changes and the original task requirements, excluding the generation transcript.

**설명**

This is correct because the value of a second instance comes from context isolation, not merely from being a separate process. When the reviewer sees the generator's reasoning, it inherits the same rationalizations that led to the flaws; withholding that transcript forces an independent judgment grounded in the code and requirements alone.

**B.** Instruct the reviewer to identify at least three issues in every change it examines.

**설명**

A quota of findings manufactures noise rather than genuine scrutiny. On clean changes it forces fabricated issues, and on flawed changes it does nothing to break the reviewer's alignment with the generator's reasoning.

**C.** Upgrade the reviewer to a more capable model while keeping the full transcript available for context.

**설명**

Model capability is not the failure mode here. As long as the reviewer reads the generator's reasoning, even a stronger model tends to adopt those justifications rather than challenge them, so the confirmation bias persists.

**D.** Enable extended thinking on the reviewer so it deliberates longer over the transcript before approving.

**설명**

Longer deliberation over the same biased input does not create independence. Extended thinking gives more reasoning depth, but the reviewer is still anchored to the generator's rationale, which is what causes it to rubber-stamp the changes.

### 전반적인 설명

The reason a second Claude instance catches issues the generator missed is context isolation: the reviewer arrives without the chain of reasoning that produced the code, so it cannot inherit the rationalizations baked into that reasoning. A model that has already concluded an approach is correct will defend that conclusion; a fresh instance evaluating only the artifact and the requirements has no such commitment. This mirrors human peer review, where the author's explanation of why the code is fine is precisely what a good reviewer sets aside while reading the diff.

Seeding the reviewer with the full generation transcript quietly destroys this property. The setup still looks like a two-instance architecture, but informationally it has collapsed back into self-review: the reviewer reads why each decision was made and, predictably, echoes those justifications. The fix is to constrain the reviewer's input to the code changes plus the original task requirements (and any relevant tests or specs), which is what makes the second opinion genuinely independent.

Neither a stronger model nor extended thinking addresses this, because both operate on the same contaminated context; more capability or more deliberation over the generator's rationale still anchors the review to that rationale. Mandating a fixed number of findings per review is an anti-pattern of its own: it trades calibrated judgment for a quota, producing fabricated nitpicks on sound code without improving detection of real defects. Anthropic's guidance on multi-Claude workflows recommends having one instance write code and a separate instance verify it, precisely to keep the verifier's context clean; see Claude Code: Best practices for agentic coding.

### 도메인

Prompt Engineering & Structured Output

## 질문 8

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : A developer sets context: fork on a /deep-review skill to keep its verbose analysis out of the main session. Invoked mid-conversation with "review the changes we discussed", the fork reports finding no relevant changes. What should the developer do?

**A.** Set agent: Explore in the frontmatter so the fork runs with a richer exploration context that includes recent project state.

**설명**

This is incorrect because the agent field only selects which subagent configuration executes the fork; no agent choice grants access to the main conversation history. Explore actually skips CLAUDE.md and git status to keep its context small, so this change would not resolve a reference to changes discussed in the session.

**B(정답).** Keep context: fork and pass the specific files and change details to the skill explicitly as invocation arguments.

**설명**

This is correct. A skill with context: fork executes in a forked subagent whose prompt is the skill content itself, and that subagent has no access to the main conversation history. References like "the changes we discussed" point to context the fork never receives, so the relevant details must be supplied explicitly while the fork still keeps verbose output isolated.

**C.** Add allowed-tools with Read, Grep, and Bash so the fork can inspect the repository and locate the discussed changes.

**설명**

This is incorrect because omitting allowed-tools does not strip tools from a forked skill; the option restricts tool access only when it is set. The fork's problem is missing conversational context, not missing tool access, so repository inspection cannot resolve what "the changes we discussed" refers to.

**D.** Remove context: fork so the skill runs inline with the conversation and accept its full output into the main session.

**설명**

This is incorrect because it abandons the stated goal of keeping the verbose analysis out of the main session. Running inline does give the skill access to the conversation, but the thousands of lines of exploration would then accumulate in the main context, which is exactly what the fork was added to prevent.

### 전반적인 설명

The mental model for context: fork is a clean-room worker, not a window into the current session. When a skill declares context: fork, Claude Code spins up a subagent whose prompt is the skill content itself; the system prompt comes from the selected agent type (defaulting to general-purpose when no agent field is set). Crucially, that subagent has no access to the main conversation history. The isolation is exactly why the pattern works: thousands of lines of exploratory output accumulate in the fork's own context and only the distilled result returns to the main session. The tradeoff is that the fork also loses everything the main session knows, so an instruction like "the changes we discussed" is an unresolvable reference inside the fork.

The practical design implication is that forked skills must be self-contained task workflows: encode the procedure in the skill body and pass any session-specific details (file paths, branch names, the specific diff to review) explicitly as arguments. This is also why Anthropic warns against forking passive guideline content; a fork whose body is only conventions has no actionable task and returns nothing useful. Guidelines that should shape ongoing work belong inline (in CLAUDE.md or an ordinary skill), where they sit alongside the live conversation.

The other actions miss the mechanism. Removing the fork restores conversation access but floods the main session with exactly the verbose output the developer set out to isolate. Selecting the Explore agent changes which subagent configuration runs the fork, and Explore deliberately skips CLAUDE.md and git status to stay lean; no agent choice imports conversation history. And allowed-tools is a restriction you opt into; leaving it out does not disable tools, and repository inspection cannot resolve a conversational reference. See Agent Skills for the forked execution model and frontmatter reference.

### 도메인

Claude Code Configuration & Workflows

## 질문 9

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : Despite a system prompt that lists required sections and formatting rules in detail, the agent's legacy-module overviews vary: prose one run, bullets the next, sometimes with sections missing. Which change most reliably produces consistently structured overviews?

**A(정답).** Add three to four example overviews wrapped in XML tags that demonstrate the exact expected sections and structure.

**설명**

This is correct. When detailed instructions alone produce inconsistent output, well-crafted examples are the documented remedy: they show the model the exact target format rather than describing it, and Anthropic states that constraining with examples is more effective than abstract instructions for consistency. Wrapping the examples in XML tags keeps them clearly separated from the instructions.

**B.** Set the temperature to zero so the model formats every overview deterministically instead of sampling varied structures.

**설명**

Temperature affects token sampling variability, not the model's understanding of the required structure. A low temperature can make an individual response more predictable, but if the model's interpretation of the format is under-specified, it will still drift across different inputs and runs.

**C.** Rewrite the formatting instructions with stronger emphasis, marking each required section as IMPORTANT and repeating the rules at the end of the prompt.

**설명**

The scenario states that detailed instructions already exist and still produce variable output. Adding emphasis and repetition intensifies the same channel that is failing; instructions describe the format in prose, while examples demonstrate it, which is why examples are the more reliable fix here.

**D.** Prefill the assistant turn with the first section heading so the response is forced to begin in the required layout.

**설명**

Prefilling only anchors the opening tokens; it cannot keep a multi-section document consistent through its middle and end. Once past the prefilled heading, the model is back to interpreting prose instructions, so the same section-to-section drift the team is seeing would persist.

### 전반적인 설명

The failure mode here is a classic one: prose instructions describe a format, but every run the model must re-interpret that description, and interpretation varies. Few-shot examples close that gap by demonstrating the target directly. Anthropic's guidance calls examples one of the most reliable ways to steer output format, tone, and structure, and its consistency guidance is explicit that constraining with examples is more effective than abstract instructions. The recommended practice is a small set (roughly 3 to 5) of relevant, diverse examples that mirror the real use case, wrapped in <example> or <examples> tags so the model can distinguish demonstration from instruction.

The mental model: instructions define rules the model must apply; examples define a pattern the model can match and generalize from. When the two conflict in reliability, pattern-matching on concrete demonstrations wins, which is why adding emphasis or repeating the rules rarely fixes formatting drift that detailed instructions have already failed to fix. Sampling controls like temperature reduce randomness within a run but do not sharpen an under-specified format, and prefilling the assistant turn anchors only the opening tokens, leaving the rest of a multi-section document to the same variable interpretation. If the requirement were strict machine-parseable JSON rather than a consistently structured document, the right escalation would be structured outputs or tool use with a JSON schema; for human-readable overviews with a required shape, targeted examples are the documented, lowest-friction fix.

See Increase output consistency and Prompt engineering best practices.

### 도메인

Prompt Engineering & Structured Output

## 질문 10

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A weekly security audit prompt asks Claude to label each finding critical, high, medium, or low. The same vulnerability class receives different labels week to week, breaking ticket routing. Which prompt change best stabilizes classification?

**A.** Instruct the model to reason step by step about business impact before it commits to a severity level.

**설명**

This is incorrect because step-by-step reasoning over an undefined scale still produces an undefined result. Without criteria stating what each level means, the model can reason carefully and still land on a different label each run, which is the observed failure.

**B(정답).** Define each severity level with an explicit written criterion plus a short code sample illustrating it.

**설명**

This is correct because consistency requires an operational rubric: a precise criterion per level tells the model what each label means, and a concrete code sample anchors the boundary so the same vulnerability class maps to the same level every week. Examples are one of the most reliable documented ways to steer classification behavior.

**C.** Collapse the four-level scale into two levels so the model has fewer severity boundaries to distinguish.

**설명**

This is incorrect because it discards the granularity that ticket routing depends on while still leaving the remaining boundary undefined. A two-level scale with no criteria drifts just as readily as a four-level one; the problem is the missing definitions, not the number of levels.

**D.** Post-process the report so recurring finding types inherit the severity assigned in the prior week's run.

**설명**

This is incorrect because it freezes whatever label the model happened to produce first, whether right or wrong, and does nothing for finding types appearing for the first time. It patches the symptom downstream instead of giving the classifier a definition to apply.

### 전반적인 설명

Severity labels drift when they are a judgment call with no operational definition. Words like "critical" or "low" are not self-defining; without an anchor, the model resolves them differently depending on phrasing, surrounding findings, and sampling, so the same vulnerability class lands in a different bucket each week. The fix is to turn the vibe into a rubric: for each level, state a precise, testable criterion (for example, "CRITICAL: exploitable remotely without authentication") and pair it with a short code sample that sits squarely inside that level. The criterion gives the model a decision rule; the example carries the boundary in a way prose alone often fails to, which is why Anthropic documents examples as one of the most reliable ways to steer output, recommending a handful of relevant, well-structured examples, ideally wrapped in <example> tags so they are clearly separated from instructions.

This mirrors Anthropic's guidance on success criteria: "accurate" is not a specification, and a classification task needs a well-defined scale that can be tested empirically against realistic inputs. Asking the model to reason step by step adds deliberation but no decision rule, so careful reasoning over an undefined scale remains unstable. Inheriting last week's label for recurring finding types locks in whatever the model produced first and leaves novel findings just as inconsistent. Collapsing the scale to two levels removes the routing signal the tickets need while the surviving boundary is still undefined; fewer levels do not substitute for criteria.

See Prompt engineering overview and Define your success criteria and develop tests for the underlying guidance on specific, measurable criteria and example-driven prompts.

### 도메인

Prompt Engineering & Structured Output

## 질문 11

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The team uses Claude Code to generate tests for the extraction pipeline. Generated tests keep re-covering scenarios the existing suite already handles, such as missing fields and malformed dates. What change fixes this?

**A.** Run test generation in plan mode so the proposed tests are reviewed before any files are written.

**설명**

Plan mode changes when changes are committed, not what Claude knows. The proposed plan would still contain duplicate scenarios because the model has no visibility into existing coverage, so a human would just be reviewing the same redundancy.

**B.** Add the team's testing standards and fixture conventions to CLAUDE.md so generation follows established patterns.

**설명**

Standards and fixture documentation improve the style and quality of generated tests, but they say nothing about which scenarios the suite already covers. Claude would still propose duplicates because the coverage information is absent from its context.

**C(정답).** Include the existing test files in context and instruct Claude to generate tests only for uncovered scenarios.

**설명**

Claude can only avoid duplicating coverage it can actually see. Providing the current test files in context, along with an instruction to target gaps, lets generation focus on genuinely untested behavior while staying consistent with the suite's style.

**D.** Post-process the generated tests in the pipeline, dropping any whose test names match names in the existing suite.

**설명**

Name matching is brittle: two tests can cover the same scenario under different names, and different scenarios can share similar names. Filtering after the fact also wastes generation effort instead of preventing duplicates at the source.

### 전반적인 설명

Duplicate test generation is a context problem, not a workflow or filtering problem. A language model has no ambient awareness of your repository; it reasons only over what is in its context window. If the existing test files are not provided, Claude cannot know that missing-field handling or date-format edge cases are already exercised, so it will naturally propose the most obvious scenarios again. Supplying the current suite plus an explicit instruction to cover only untested behavior gives the model both the coverage map and the objective, which is exactly how Claude Code's documented test workflow is meant to operate: identify untested code, generate scaffolding for the gaps, add meaningful edge-condition cases, then run and verify.

The distractors each fix an adjacent problem. CLAUDE.md conventions raise the quality and consistency of generated tests but carry no information about coverage, so duplication persists. Name-based deduplication in the pipeline is a lossy proxy for semantic overlap: it misses same-scenario tests with different names and can wrongly discard distinct tests with similar names. Plan mode is valuable for scoping large, ambiguous changes, but it only defers execution for review; the plan itself is produced from the same coverage-blind context and would still be full of redundant tests.

The general mental model: when generated output is wrong in a way that depends on repository state, the first question is whether that state was ever shown to the model. See Claude Code Common Workflows for the recommended approach to test generation and context management.

### 도메인

Claude Code Configuration & Workflows

## 질문 12

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The match_vendor tool links extracted invoices to vendor master records. For similar names it returns multiple candidates; the pipeline currently accepts the highest similarity score, misattributing 8% of invoices to the wrong vendor. What change addresses this?

**A.** Raise the similarity threshold on match_vendor so only candidates scoring above 0.95 are accepted and lower-scoring matches are rejected automatically.

**설명**

A higher threshold is still a heuristic applied to an ambiguous signal; two vendors with nearly identical names can both score above any threshold, and legitimate matches with minor name variations get rejected. It changes where the guessing happens without adding the distinguishing information the decision actually needs.

**B.** Modify match_vendor to rank candidates internally and return only its single highest-confidence match so downstream integration receives one record.

**설명**

Collapsing multiple matches into one inside the tool hides the ambiguity entirely, so neither the model nor a reviewer ever learns that the match was uncertain. This is the entity-resolution equivalent of silent suppression: the same wrong selections happen, but they now look like confident, clean results.

**C.** Add few-shot examples to the extraction prompt demonstrating the correct vendor choice for the most common ambiguous name collisions.

**설명**

Few-shot examples improve pattern following, but they cannot supply the information missing at decision time: which of several similar master records this specific invoice belongs to. The examples cover only known collisions and leave the model guessing on every novel ambiguous pair.

**D(정답).** Disambiguate using additional identifiers extracted from the invoice, such as tax ID or remittance address, routing still-ambiguous records to human review.

**설명**

This is the correct pattern for multiple-match ambiguity: gather additional distinguishing identifiers rather than guessing among candidates. When the extra identifiers still cannot resolve the match, flagging the record for human review preserves accuracy instead of silently committing a wrong attribution to downstream systems.

### 전반적인 설명

When a lookup or matching tool returns multiple candidate matches, the failure mode to design against is heuristic selection: picking by similarity score, recency, or ranking looks decisive but is really a guess, and a fixed fraction of those guesses will be wrong. The reliable pattern is to resolve ambiguity with additional identifiers. In a conversational agent that means asking the user for another identifier; in a document extraction pipeline, the analogue is having the model pull further distinguishing fields already present in the source, such as a tax ID, remittance address, or account number, and re-matching on those. Any record that remains ambiguous after that step should be flagged as unresolved and routed to human review, because committing an uncertain match to downstream financial systems is exactly the kind of high-impact, hard-to-reverse action that warrants oversight.

The distractors each fail in an instructive way. Tightening a similarity threshold only relocates the guess: genuinely similar vendor names can both clear any cutoff, while valid matches with formatting differences get rejected. Making the tool return a single best candidate is worse still; it suppresses the ambiguity signal, so the same misattributions occur but arrive disguised as confident matches, and no one can later measure or route the uncertain cases. Few-shot examples shape how the model reasons, but they cannot inject the missing fact of which master record a given invoice belongs to, so they help only on the specific collisions demonstrated.

The underlying mental model: the model chooses among tool results based on the information in context, so when the context does not contain enough information to distinguish candidates, the fix is to add distinguishing information or escalate, never to pick. See Tool use with Claude for how tool results feed the model's next decision.

### 도메인

Context Management & Reliability

## 질문 13

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : An engineer measures that every batch the team has submitted so far finished in under an hour, and proposes routing the agent's interactive codebase-exploration requests through the Message Batches API to capture the 50% discount. How should you respond?

**A.** Approve the move but submit each interactive request as its own single-request batch so small batches complete quickly enough for live use.

**설명**

Batch size does not create a latency guarantee; even a single-request batch is processed asynchronously within the same up-to-24-hour window. This design adds batch management overhead while leaving the fundamental mismatch with blocking workloads unresolved.

**B(정답).** Keep interactive requests on the synchronous API, since batches carry no latency guarantee and can take up to 24 hours to complete.

**설명**

This is correct. Interactive requests are blocking: an engineer is waiting on the result, and while most batches do finish within an hour, the documentation guarantees only a 24-hour processing window with no latency SLA. Observed fast completion in testing cannot be relied on for a workload where a person is waiting.

**C.** Approve the move and add a polling loop that surfaces results to the engineer as soon as the batch's processing status becomes ended.

**설명**

Polling correctly detects when results are ready, but it does nothing to bound how long readiness takes. The engineer would still be exposed to a processing window of up to 24 hours with no guarantee, which is unacceptable for an interactive session.

**D.** Route requests to batch first with an automatic synchronous retry whenever a batch has not completed within a fixed timeout window.

**설명**

This hybrid guarantees the worst of both paths: every slow request waits out the timeout and then pays full synchronous price anyway, so the discount is only captured when latency happens to be low. Blocking workloads should simply stay on the synchronous API rather than gambling on batch turnaround.

### 전반적인 설명

The decision rule for the Message Batches API is not about typical performance but about guarantees. Anthropic documents that most batches finish in less than one hour, yet the only contractual bound is that processing may take up to 24 hours, after which an incomplete batch expires. There is no latency SLA at any batch size or time of day. That asymmetry is the whole design tradeoff: you trade responsiveness guarantees for a 50% cost reduction, which is why the API fits latency-tolerant work (nightly audits, bulk analysis, large evaluations) and does not fit anything a human is actively waiting on.

The proposal in this situation commits a classic reliability error: extrapolating a guarantee from observed behavior. A month of sub-hour batches tells you nothing about the batch that lands during a high-load period and takes twenty hours; an engineer mid-exploration cannot absorb that. Polling only detects completion, it does not accelerate it. Single-request batches still enter the same asynchronous queue with the same 24-hour window. A batch-first design with a synchronous fallback pays for the failed batch attempt, adds the timeout to every slow request's latency, and only realizes savings when the batch happens to be fast, making the discount unpredictable while degrading the interactive experience.

The sound architecture is a clean split by latency requirement: blocking, interactive traffic stays on synchronous Messages API calls, and only workloads that can tolerate a full-day turnaround move to batch. See Batch processing for the documented completion window and appropriate use cases.

### 도메인

Prompt Engineering & Structured Output

## 질문 14

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : The refactoring report is produced through tool_use with a strict JSON schema. Every report now parses cleanly, yet issue counts sometimes disagree with the items actually listed, and fixes occasionally appear under the wrong file path. What should the team do?

**A.** Set the sampling temperature to zero so the model assigns values to fields deterministically and counts stay consistent.

**설명**

Temperature controls variability in token selection, not correctness. A deterministic model can still consistently place a value in the wrong field or produce a count that fails to reconcile, so this does not address the semantic gap.

**B.** Switch back to prompt-based JSON output with strong formatting instructions, since tool_use is mishandling the field assignments.

**설명**

Abandoning tool_use reintroduces the syntax and parsing failures it was adopted to eliminate while doing nothing about semantic accuracy. The misassigned values come from the model's extraction, not from the tool_use mechanism itself.

**C(정답).** Add code-level semantic validation that recomputes counts against the listed items and cross-checks each fix's file path.

**설명**

This is correct because tool_use with a JSON schema guarantees syntactic and structural conformance, not the truth or internal consistency of the values; the schema enforces structure only. Semantic errors like mismatched counts or misassigned paths must be caught by validation logic in code after extraction.

**D.** Tighten the schema with stricter required-field and type constraints so the schema validator can reject misplaced or internally inconsistent values.

**설명**

A JSON schema can constrain types, requiredness, and enumerations, but tightening those constraints does not verify relationships like a count matching the number of items listed or a fix belonging to the correct file. The failures here are semantic, so stricter structural rules leave them untouched.

### 전반적인 설명

The mental model to hold here is a two-layer guarantee. Using tool_use with a JSON schema is the most reliable way to obtain structured output: the model is trained to produce input that conforms to the tool's input_schema, so braces close, required fields are present, and types match. That eliminates an entire class of failures (markdown fences, trailing commentary, malformed syntax) by construction. But the guarantee stops at shape. Tool-use schemas enforce syntax, types, and required structure; they do not guarantee semantic correctness or source-grounded consistency, such as a count that actually equals the number of items beneath it or a fix attributed to the right file.

The design consequence is that structured extraction pipelines need a second layer: code-level validation (custom validators) that recomputes derived values, cross-checks field placement against the source, and applies business rules. A useful pattern is to have the model emit self-check fields, for example extracting both a stated_total and a calculated_total so a mismatch can raise a conflict_detected flag that downstream systems can act on, often feeding a retry-with-error-feedback loop.

Tightening the schema does not address the failure, because the enforcement tool_use provides covers structure and types rather than whether values reconcile or are grounded in the source. Reverting to prompt-based JSON trades a solved problem (syntax) back for an unsolved one while leaving semantics untouched. Lowering temperature only makes the output more repeatable, and a repeatable wrong answer is still wrong. See Tool use with Claude for how schema-constrained tool input works and where its guarantees end.

### 도메인

Prompt Engineering & Structured Output

## 질문 15

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : While mapping a legacy service, the agent reports the API rate limit as contradictory (100 vs 500 requests per minute) because a wiki page and a README were written years apart. What change prevents temporal differences from surfacing as contradictions?

**A.** Have the agent average the conflicting numeric values into a single figure and note in the report that sources varied.

**설명**

Averaging fabricates a number that no source ever documented, which is worse than either original value in a technical report. It also fails to reveal that the difference is temporal rather than a true disagreement.

**B(정답).** Require each structured finding to include its source's last-updated date so differing values can be interpreted chronologically.

**설명**

Carrying publication or last-updated dates alongside each finding lets the agent and any downstream reader distinguish a genuine contradiction from a value that simply changed over time. The two rate limits become a timeline (an old limit superseded by a newer one) rather than a conflict.

**C.** Add a post-processing step that keeps whichever value was fetched most recently during the session and silently discards the other.

**설명**

Retrieval time reflects when the agent happened to read a source, not when the source's content was written, so this can keep the stale value. Silently discarding one figure also hides the disagreement instead of explaining it.

**D.** Instruct the agent to prefer the value from whichever source it judges more authoritative and omit the conflicting one.

**설명**

Authority heuristics do not resolve a temporal difference; an authoritative but outdated wiki page can still carry the superseded value. Omitting the other figure destroys the evidence that the limit changed over time.

### 전반적인 설명

When an agent aggregates findings from documentation, wikis, READMEs, and code history, the same fact often appears with different values because the sources were written at different times. Without temporal metadata, a synthesis step has no way to tell a genuine contradiction (two current sources disagree) from a temporal difference (one value superseded another). The structural fix is to require every finding in the agent's structured output to carry its source's publication or last-updated date, so downstream reasoning can order the values chronologically: "the wiki (2021) says 100, the README (2024) says 500" reads as an increase, not a conflict.

This is the same discipline as claim-source mapping for provenance: metadata that explains a value must travel as data with the value, because it cannot be reconstructed later. Approaches that pick a single number (by fetch recency, by perceived source authority, or by averaging) all discard information. Fetch time in particular is a common trap: it records when the agent read a page, not when the page's content was true. Averaging is worse still, producing a figure no source ever stated. Preserving both values with dates keeps the report honest and lets a human or coordinator reconcile deliberately.

For background on how agents should structure and pass context between steps, see How we built our multi-agent research system and Effective context engineering for AI agents.

### 도메인

Context Management & Reliability

## 질문 16

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : An Edit call on a legacy utility file fails because the anchor text is non-unique. The agent switches to Write but passes only the corrected function, wiping the rest of the file. Which step was missing?

**A.** Run the modification through Bash with sed so the file is patched in place without overwriting.

**설명**

Dropping to shell stream editing trades a controlled file operation for a fragile one that risks unintended replacements when the target text repeats. It bypasses the purpose-built file tools rather than completing the Read plus Write rewrite correctly.

**B(정답).** Read the full file first and pass the complete modified contents to Write, since Write overwrites the entire file.

**설명**

This is correct. Write creates or completely overwrites a file, so a whole-file rewrite requires loading the full contents with Read, applying the change to that complete text, and writing the whole modified version back. Skipping the Read step is exactly what caused the data loss.

**C.** Delete the duplicate occurrences of the anchor text from the file so the original Edit call matches uniquely.

**설명**

Removing other occurrences of the anchor text alters working code purely to satisfy the tool, which risks breaking the file's behavior. Better remedies are extending the anchor with surrounding context to make it unique, or performing a whole-file rewrite via Read plus Write.

**D.** Retry Edit with a shorter anchor string so the match resolves uniquely before falling back.

**설명**

Shortening the anchor text makes uniqueness worse, not better, because a shorter string matches in more places. The documented remedies for a non-unique match are providing a longer anchor with surrounding context, or using replace_all when every occurrence should change; neither involves shrinking the anchor.

### 전반적인 설명

The failure here comes from misunderstanding the contract of each file tool. Edit performs targeted modification by exact string replacement against a unique text anchor. When a match is non-unique, the documented remedies are to provide a longer old_string with surrounding context so it matches only once, or to use replace_all when every occurrence should genuinely change. When neither fits, a whole-file rewrite with Read + Write is a reliable alternative, but it is a two-step contract: Read loads the entire file, the change is applied within that complete text, and Write then replaces the file with the full modified version. Write is not a patch operation; it creates or overwrites files wholesale, which is precisely why it can serve as a reliable rewrite mechanism and precisely why calling it with only a fragment destroys everything else in the file.

The mental model to hold is that Edit and Write sit at opposite ends of a granularity spectrum. Edit is surgical and depends on the file cooperating (a unique match); Write is total and depends on the caller supplying everything the file should contain afterward. The Read step is what bridges them: it gives the agent the complete content that Write's semantics demand. The tradeoff is that the rewrite moves the whole file through context, which is why Edit remains the preferred default and Read + Write is reserved for cases where unique matching genuinely cannot be satisfied.

The alternatives fail on the same misunderstanding from different directions: deleting the duplicate occurrences mutilates working code just to satisfy the tool, a shorter anchor string only multiplies matches instead of disambiguating them, and shelling out to sed risks unintended replacements in a file with repeated text while bypassing the structured file tools the agent is designed around. See the Claude Code tools reference for the exact behavior of Read, Edit, and Write.

### 도메인

Tool Design & MCP Integration

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

## 질문 18

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : Prompts that generate module documentation include eight formatting constraints. Despite repeated emphasis, every run violates one or two of them, and which constraints slip varies. How should the workflow be restructured to reliably satisfy all constraints?

**A.** Restate the constraints at both the top and bottom of the prompt and flag the most frequently violated ones as IMPORTANT.

**설명**

Repetition and emphasis raise the priority of some rules only relative to the others, and the scenario already shows that repeated emphasis has not eliminated violations. When a single pass must satisfy many constraints simultaneously, some are dropped regardless of how they are highlighted.

**B(정답).** Chain the work: generate the documentation draft first, then run a second pass that checks each constraint and rewrites violations.

**설명**

This is the documented self-correction chaining pattern: the first call focuses on producing content, and the second call is dedicated entirely to auditing the draft against the constraint list and fixing lapses. Separating generation from verification means neither step has to juggle the full constraint load at once, which is exactly the failure mode observed.

**C.** Move all eight formatting constraints into the project CLAUDE.md file so they load automatically at the start of every session.

**설명**

CLAUDE.md is guidance, not enforcement, so its instructions remain probabilistic just like prompt instructions. Relocating the constraints changes where they are stated, not how reliably a single generation pass complies with all of them.

**D.** Enable extended thinking for the generation request so the model deliberates over the full constraint list before writing.

**설명**

Extended thinking adds reasoning depth for hard problems, but the failure here is constraint saturation in a single pass, not insufficient reasoning. It also adds token cost without providing any verification step that catches the violations that still occur.

### 전반적인 설명

This situation is the canonical trigger for prompt chaining: a single request carrying many simultaneous constraints reliably drops one or two of them, no matter how the instructions are emphasized. The mental model is that each generation pass has a limited attention budget; when producing content and policing eight rules compete in one pass, compliance becomes probabilistic. Chaining splits the job into sequential calls with distinct responsibilities: the first call produces the draft, and a second call receives that draft along with the constraint list and does nothing but audit and rewrite. Because the verification pass is not simultaneously composing content, it can check the constraints one by one, and a violation that survives is far more likely to be caught and corrected.

This is the self-correction pattern Anthropic documents for chained workflows, and it reflects why chaining remains valuable even as models handle more multistep work internally: it lets you inspect intermediate outputs and enforce a specific pipeline structure in code rather than hoping one pass gets everything right. The same shape appears elsewhere in this exam's material, such as per-file analysis followed by a cross-file integration pass, but the constraint-compliance chain is its own distinct application.

The alternatives all keep the work in a single pass. Repeating rules and marking them IMPORTANT spends an emphasis budget that only reprioritizes rules against each other. Moving the constraints into CLAUDE.md changes their delivery surface, but CLAUDE.md content is guidance the model follows probabilistically, not an enforcement mechanism. Extended thinking deepens reasoning on hard problems, yet the observed failure is not a reasoning gap; without a dedicated verification step, occasional lapses still ship. See Anthropic's prompt engineering guidance for the chaining rationale.

### 도메인

Agentic Architecture & Orchestration

## 질문 19

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The team resumes an extraction-tuning session with fork_session enabled to trial an alternative schema-guidance prompt from the established baseline. Which two practices should guide how they work with the resulting fork? (Choose two.)

**A(정답).** Resume either branch independently later, since the original session's ID and history are unchanged by the fork.

**설명**

This is correct. The fork does not mutate the source session; the original keeps its ID and history intact, and both branches can be resumed independently, which is what makes divergent exploration safe.

**B(정답).** Track the fork by its own session ID, a new session that begins from a copy of the original's conversation history.

**설명**

This is correct. Forking creates a new session that starts from a copy of the original session's accumulated history, and that new session receives its own distinct session ID so it can be tracked and resumed separately.

**C.** Expect findings produced in the fork to merge back into the original session's history automatically on completion.

**설명**

This is incorrect. Forked sessions diverge permanently after the branch point; nothing flows back into the original history automatically. If findings from a fork need to reach the original line of work, they must be passed explicitly.

**D.** Rely on the fork to snapshot the filesystem at the branch point so file edits stay isolated between the two branches.

**설명**

This is incorrect. A session is accumulated conversation history, not filesystem state, so forking copies the transcript only. Isolating or rolling back file changes requires a different mechanism, such as file checkpointing.

### 전반적인 설명

In the Claude Agent SDK, a session is the accumulated conversation: prompts, tool calls, tool results, and responses. Setting fork_session when resuming does not continue that history in place; it creates a new session that starts from a copy of the original's history and receives its own session ID. The original session's ID and transcript are untouched, and both branches can be resumed independently from that point on. This is exactly the design intent: a "try a different approach" workflow where an expensive baseline (here, tuned understanding of the document corpus and schema) is inherited by each branch without either branch contaminating the other or the source.

The two boundaries worth internalizing are what forking does not do. First, it does not snapshot or isolate filesystem state; sessions carry conversation history only, so file edits made during one branch are visible to anything else operating on the same working tree, and filesystem rollback is handled by file checkpointing rather than session mechanics. Second, there is no merge-back: divergence is permanent, so any conclusion reached in a fork that the team wants to carry forward must be explicitly passed (for example, summarized into a new prompt), consistent with the general rule that context moves between agent contexts only when you put it there.

See Sessions in the Claude Agent SDK for the documented forking and resumption behavior.

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

## 질문 21

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : A developer has scripted a fixed five-step diagnostic pipeline for investigating an intermittent production bug, but later steps often turn out to be irrelevant once early findings arrive. Which decomposition change best fits this workflow?

**A.** Extend the fixed pipeline with additional branches that cover every failure category the team has encountered so far.

**설명**

Adding branches to a fixed script is an arms race against the variety of possible failures, and the pipeline will still break on the first cause nobody anticipated. It treats the symptom (missing branches) rather than the mismatch between a fixed structure and an open-ended task.

**B(정답).** Switch to dynamic decomposition, generating the next subtasks from what each investigation step actually reveals.

**설명**

Correct. An intermittent bug investigation is an open-ended task whose useful next step depends on intermediate findings, which is exactly the situation dynamic adaptive decomposition is designed for. A fixed pipeline written before any evidence exists cannot anticipate where the investigation will lead.

**C.** Run all five pipeline steps in parallel so the irrelevant steps consume less wall-clock time overall.

**설명**

Parallel execution reduces latency but still spends effort on steps that early findings would have shown to be unnecessary, and it cannot add steps the fixed plan never included. It also discards the sequential dependency that a diagnosis often has, where one finding determines the next question.

**D.** Keep the five-step chain but reorder it so the most diagnostic checks execute before the less informative ones.

**설명**

Reordering a fixed sequence does not change its fundamental limitation: the steps were chosen before any evidence existed, so later steps can still be irrelevant to what the early findings actually show. Prompt chaining suits predictable workflows, not investigations whose path emerges from results.

### 전반적인 설명

The core selection rule for task decomposition is to match the structure of the workflow to its uncertainty profile. Prompt chaining (a fixed sequential pipeline) works when every step is knowable up front: the same review template, the same extraction stages, the same checks every time. Its value is reproducibility and stability. Dynamic adaptive decomposition works when the full scope is unknown and each step depends on what the previous step uncovered, which is the defining shape of an investigation into an intermittent bug: an early finding (say, that failures correlate with a specific deployment window) determines the next subtask, and no script written beforehand could have contained it.

The mental model is that a fixed pipeline encodes decisions made before evidence exists, while adaptive decomposition defers each decision until the evidence arrives. That is why patching the pipeline with more branches, reordering its steps, or parallelizing them all fail the same way: they keep a pre-committed plan in charge of a task whose plan should emerge from intermediate results. Extra branches chase an unbounded space of failure modes; reordering still executes steps chosen blind; parallelism only shortens wall-clock time for work that should not run at all. The tradeoff runs the other way too: applying adaptive decomposition to a genuinely predictable workflow, like a review that always checks the same aspects, pays flexibility overhead for no benefit and sacrifices reproducibility.

Anthropic's guidance on agent design draws exactly this line between workflows with predefined code paths and agents that dynamically direct their own process. See Building Effective Agents and Chain complex prompts.

### 도메인

Agentic Architecture & Orchestration

## 질문 22

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : The agent produces structured summaries of legacy modules with fields for owner, external dependencies, and entry points. Accuracy measured per module type is a consistent 96%, so the team plans to drop human review of summaries. Which remaining risk should be checked first?

**A(정답).** Break accuracy down by summary field within each module type, since one field can fail while type-level rates hold.

**설명**

This is correct because a per-type accuracy figure is still an aggregate over the fields inside each summary. A single field such as external dependencies could be wrong a large fraction of the time while the overall type-level rate stays near 96%, so field-level segmentation must be validated before removing review.

**B.** Expand the validation set so each module type has enough samples to make the 96% figure statistically significant.

**설명**

Larger samples make the per-type estimates more precise, but they do not change what is being measured. A statistically solid 96% per module type can still conceal a badly failing field, because the number remains an average across all fields in the summary.

**C.** Have the model attach a self-rated confidence score to each summary and review only the ones below a threshold.

**설명**

Raw self-reported confidence is a poorly calibrated proxy: the model can be confidently wrong on exactly the cases that matter. Without calibration against labeled data and without field-level accuracy analysis, this routing would miss systematic errors hidden inside the per-type average.

**D.** Re-run the validation on a second independent Claude instance to confirm the 96% figure is reproducible first.

**설명**

Reproducing the same aggregate measurement confirms the number is stable, not that it is informative. If the metric averages away a failing field, an independent instance will reproduce the same misleading 96%, leaving the underlying risk undetected.

### 전반적인 설명

Aggregate accuracy metrics hide failures at every level of aggregation, not just the top one. A team that segments a 96% overall figure by module type has removed one layer of masking, but each per-type number is itself an average across the individual fields in the output. A structured summary that gets the module name and owner right almost always, but gets external dependencies wrong 30% of the time, can still post a per-type accuracy in the mid-90s. The mental model is that every metric is an average over some population; before you act on it, ask what subpopulations it is blending, and keep drilling down until the segments align with the decisions the number will drive. That is why the guidance is to validate accuracy by type and by field before reducing human review, and why Anthropic's evaluation guidance stresses defining measurable, task-specific success criteria rather than trusting one global score (see Define your success criteria).

The other approaches each miss the masking mechanism. Growing the validation set improves statistical confidence in the same blended average; it makes a misleading number more precise, not more honest. Uncalibrated self-rated confidence is a known-unreliable routing signal, because models are often confidently wrong on the hardest cases; confidence scores only become useful after calibration against labeled data, and even then they complement rather than replace segment-level validation. Re-running validation on an independent instance tests reproducibility of the measurement, but a reproducible aggregate is still an aggregate; it will faithfully reproduce the same concealment. The correct sequence before automating review is always the same: segment the metric down to the granularity at which errors would actually hurt, and only then decide whether the performance is uniformly good enough to remove the human check.

### 도메인

Context Management & Reliability

## 질문 23

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : During an extended debugging session, the agent appends every confirmed finding to a scratchpad file, yet its later answers contradict entries it recorded hours earlier. What change makes the scratchpad effective?

**A.** Trigger /compact after each major discovery so the compacted summary stays consistent with the scratchpad entries.

**설명**

Compaction condenses the conversation into a summary, and summarization tends to drop precise details such as exact findings, numbers, and file names. Compacting more often does nothing to make the agent consult the scratchpad and can intensify the loss of the very details it recorded.

**B.** Convert the scratchpad from free-form prose to a structured JSON format so the model can parse its recorded state more reliably.

**설명**

Format choice matters only once the file is actually read back into context, and here the agent never consults it. Structured formats like JSON are recommended for structured state such as test results, but changing the format does not fix a file that is written and then ignored.

**C.** Import the scratchpad into CLAUDE.md so its contents load automatically alongside the project memory at startup.

**설명**

Memory files are intended for stable conventions and guidance, not a continuously updated investigation log. Importing a live scratchpad still does not ensure the agent consults the latest entries when answering; the file must be explicitly read back, or the memory reloaded, for new findings to influence reasoning.

**D(정답).** Instruct the agent to consult the scratchpad file when answering subsequent questions instead of relying on conversation memory.

**설명**

A scratchpad only counteracts context degradation if the agent reads it back; writing findings persists them outside the context window, but the content influences reasoning only when it re-enters context. Directing the agent to reference the file for later questions completes the write-then-read loop, so answers come from the authoritative record rather than degraded conversation history.

### 전반적인 설명

The mental model behind scratchpad files is that the context window is a lossy, finite working memory, while the filesystem is durable external storage. Writing key findings to a file protects them from summarization and attention decay, but a file on disk has no automatic connection to the model's reasoning: its contents only affect an answer when they are loaded back into context. A scratchpad practice therefore has two halves, record findings as they are discovered and reference the file when answering later questions. The failure in this session is the missing second half, so the fix is instructing the agent to consult the scratchpad rather than trusting its degraded conversation memory. Anthropic's own guidance for long-running work follows this pattern: have the agent save progress and state to files, then explicitly review those files (for example a progress.txt or structured state file) when continuing, as described in Prompt templates and variables.

The alternatives each miss this read-back requirement. Running /compact more often compresses history into summaries, which is exactly the operation that loses precise findings; it manages context volume but does not route the agent's answers to the authoritative record. Importing the scratchpad into CLAUDE.md misuses memory, which exists for stable conventions rather than a live investigation log, and it still leaves the read-back gap: without explicitly reading the file or reloading memory, freshly appended findings do not reach the agent's reasoning. Reformatting the file as JSON is sensible for structured state like test results, but format only matters once the file is actually read; a well-structured file that is never consulted helps no more than a prose one.

### 도메인

Context Management & Reliability

## 질문 24

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline reviews each changed file in its own focused pass, and per-file findings are now consistent. However, bugs at module boundaries, such as type mismatches between a caller and the function it invokes, are still missed. What should be added?

**A(정답).** Add a separate integration pass that analyzes cross-file concerns such as data flow and interface contracts.

**설명**

This is correct. Per-file passes are scoped to local issues by design, so cross-file defects require a dedicated pass whose explicit job is to examine interactions between the changed files. This completes the multi-pass architecture: per-file passes for local depth, an integration pass for boundary issues.

**B.** Run each per-file pass twice and promote only findings that appear in both runs to catch missed boundary bugs.

**설명**

This is incorrect because repeating a pass with the same per-file scope cannot surface issues that scope excludes; a pass that never sees both sides of a call boundary will miss the mismatch every time. Requiring agreement across runs also suppresses findings rather than adding new detection capability.

**C.** Include the full repository contents in every per-file pass so callers and callees are always reviewed together.

**설명**

This is incorrect because flooding each pass with the whole repository dilutes attention rather than focusing it, and it destroys the consistency the per-file passes achieved. Cross-file analysis needs a focused pass over the relevant interactions, not maximal context in every pass.

**D.** Merge all changed files into a single comprehensive pass so every cross-file interaction is visible at once.

**설명**

This is incorrect because it reintroduces the single-pass approach that per-file review was adopted to avoid. Analyzing many files at once causes attention dilution, producing uneven depth, missed bugs, and contradictory findings across files.

### 전반적인 설명

Multi-pass review works because each pass has a scope matched to what attention can handle well. A per-file pass gives the model a small, focused unit and asks only for local issues, which is why depth and consistency improve. But that same scoping means the model literally never examines the relationship between two files in one context, so defects that live at module boundaries (mismatched types, broken interface contracts, inconsistent assumptions about shared data) are structurally invisible to it. The fix is not more effort within the existing passes; it is a second kind of pass, an integration pass, whose explicit job is cross-file analysis: tracing data flows across the changed files and checking that callers and callees agree.

The distractors fail for instructive reasons. Merging everything back into one comprehensive pass recreates attention dilution, the original failure mode where a model given many files produces deep analysis of some and shallow commentary on others, and even contradicts itself between files. Stuffing the full repository into every per-file pass is the same mistake amplified: more context does not mean more attention, and the focused scope that made per-file findings reliable is lost. Running each per-file pass twice and keeping only agreed findings is a consensus filter; it can reduce noise in what a pass already detects, but it cannot detect what the pass's scope excludes, and it actively suppresses findings rather than adding coverage.

The mental model to carry: decompose reviews by concern, not just by size. Local correctness and cross-file integration are different questions, and each deserves a pass shaped for it. This is an application of prompt chaining, where a complex task is split into focused sequential steps; see also Claude Code best practices for structuring multi-step review workflows.

### 도메인

Prompt Engineering & Structured Output

## 질문 25

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The team adds a per-field confidence score to each extraction and plans to auto-accept high-confidence results while routing low-confidence ones to human review. What should they do before relying on these scores for routing in production?

**A.** Replace the numeric scores with a model-set route_to_human boolean so each extraction arrives with an unambiguous routing decision already made.

**설명**

Collapsing confidence into a binary flag delegates the routing judgment to the same uncalibrated self-assessment and removes the threshold the team could tune. Numeric scores validated against labeled data let routing be adjusted as accuracy targets or review capacity change; a hard-coded boolean does not.

**B.** Set the sampling temperature to zero so the reported confidence values become deterministic and consistent enough to use without further checks.

**설명**

Lowering temperature reduces run-to-run variation in the output but does nothing to ensure the confidence values reflect true accuracy. A consistently miscalibrated score is still miscalibrated; determinism is not the same as calibration.

**C.** Trust the scores as reported, since the model generates them together with the extraction and can directly assess its own field-level certainty.

**설명**

Producing a confidence value alongside an extraction does not make that value reliable; self-stated confidence can be systematically over- or under-confident. Using the raw scores for routing without checking them against labeled outcomes risks auto-accepting wrong extractions and flooding reviewers with correct ones.

**D(정답).** Validate the self-reported scores against a labeled document sample to confirm they track actual accuracy, then derive routing thresholds from that data.

**설명**

Correct. A model's self-reported confidence is a useful signal but is not guaranteed to be well calibrated out of the box. Measuring the scores against ground-truth labels shows whether high confidence actually corresponds to high accuracy and lets the team set thresholds that produce the intended auto-accept and human-review split.

### 전반적인 설명

Self-reported confidence enables calibrated review routing: extractions the model is sure about flow straight to downstream systems, while uncertain ones go to a human. The word calibrated is doing the real work in that pattern. A confidence score is only useful for routing if it actually predicts correctness, and language models' self-assessments are not guaranteed to do so; they can cluster near the top of the scale or vary by field type. The engineering step that makes the pattern safe is empirical: run the extractor over a labeled sample, compare each reported confidence against whether the field was actually correct, and choose thresholds where the observed error rate meets your accuracy target. Stratifying that sample across document types keeps the thresholds honest for the hard cases, not just the easy ones.

This mirrors Anthropic's broader guidance on separating finding from filtering: have the model report its output together with a confidence signal, and put the judgment about what to accept, rank, or escalate in a downstream stage you control, rather than inside the model's own head. See Prompting Claude Sonnet 5 for the recommended pattern of attaching confidence levels to findings so a verification or filtering stage can rank them.

The alternatives each break the pattern. Trusting raw scores assumes calibration that has never been measured. A model-set route_to_human boolean moves the routing decision into the uncalibrated self-assessment and eliminates the tunable threshold, so the team cannot trade review load against accuracy. Zero temperature makes outputs more repeatable but cannot correct a score that is consistently wrong about its own reliability.

### 도메인

Prompt Engineering & Structured Output

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

## 질문 27

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : A developer spent yesterday iterating on validation prompts for the extraction pipeline in a Claude Code session they named extraction-edge-cases. Several unrelated sessions have since run in the same directory. What should the developer run to continue that specific work?

**A.** claude -p "continue refining the extraction validation prompts" to pick up the prior work.

**설명**

The -p flag runs a fresh non-interactive query with no memory of yesterday's session. The prompt text asks to continue, but there is no prior context loaded for Claude to continue from.

**B(정답).** claude --resume extraction-edge-cases, restoring that session's conversation and state.

**설명**

The --resume flag targets a specific prior session by name or ID and restores its full conversation history, including tool calls and results. Because it resolves the exact name, it is unaffected by other sessions run since.

**C.** claude --continue, which reopens the most recent Claude Code session in the current directory.

**설명**

The --continue flag resumes only the most recent interactive session in the current directory. Since several unrelated sessions have run since, it would reopen one of those instead of the named extraction session.

**D.** A new interactive session in the same directory, relying on CLAUDE.md to restore the prior context.

**설명**

CLAUDE.md carries project conventions and standing instructions, not the discovered findings and conversation state of a specific investigation. A fresh session would not know what was learned yesterday.

### 전반적인 설명

Claude Code persists sessions, and the --resume flag (short alias -r) is the mechanism for continuing a specific prior conversation: it accepts a session ID or a name (assigned with --name at launch or /rename during a session) and restores the saved conversation, including the full history of tool calls and results plus state such as the model and permission mode. Naming sessions is exactly what makes multi-day investigations practical: the name is a stable handle that survives however many other sessions run in between.

This is the key distinction from --continue, which is a convenience for reopening whichever interactive session was most recent in the current directory. The two commands answer different questions: "pick up where I just left off" versus "pick up a particular thread of work." In this situation, unrelated sessions have run since yesterday, so --continue would land on the wrong conversation. Also worth knowing: claude --resume <name> resolves an exact name match across the repository and its worktrees, and if the name is ambiguous it opens the session picker pre-filled with the name.

The remaining approaches share a flaw: they start with empty context. A -p invocation is a one-shot non-interactive run with no session memory, and a fresh interactive session loads CLAUDE.md, which holds durable project guidance rather than the specific reasoning, tool results, and conclusions accumulated during yesterday's prompt-tuning work. Restating an instruction to "continue" does not conjure the missing context. See the Claude Code CLI reference and the sessions documentation for the full resumption behavior.

### 도메인

Agentic Architecture & Orchestration

## 질문 28

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : After single-pass extraction over transaction bundles (invoice, purchase order, delivery note) showed uneven depth across documents, the team is moving to a multi-pass design. Which TWO statements reflect sound multi-pass architecture? (Select TWO.)

**A.** Run the combined single pass three times and keep only findings or fields that agree across a majority of runs.

**설명**

This is incorrect as the primary architecture because majority voting over inconsistent combined runs can suppress real signal: a field extracted correctly in only one run gets discarded. Comparing multiple runs can serve as auxiliary verification, but it does not replace focused per-document extraction plus a separate integration pass.

**B(정답).** Expect that simply loading all documents into a larger context window will not reliably fix the uneven analysis depth.

**설명**

This is correct because uneven depth stems largely from attention dilution when many documents are processed in one pass, and adding context capacity does not reliably restore consistent per-document attention. Focused per-document passes address the quality problem directly rather than relying on capacity alone.

**C.** Drop the integration pass, since schema validation on each per-document extraction already guarantees consistency across the bundle.

**설명**

This is incorrect because JSON schema validation only guarantees the structure of each individual extraction. It cannot detect semantic inconsistencies between documents, such as totals that disagree across the invoice and purchase order, which is exactly what the integration pass checks.

**D(정답).** Scope the integration pass to cross-document checks, such as reconciling an amount one document references in another.

**설명**

This is correct because the integration pass exists to catch relationships that no single-document pass can see, such as a purchase order total that the invoice references. Keeping field-level extraction in the per-document passes preserves the consistent depth that motivated the split.

### 전반적인 설명

The mental model behind multi-pass design is that a language model has finite attention per pass, not just a finite context window. When several documents are analyzed together, that attention tends to spread unevenly: some documents receive deep treatment while others get sparse fields, and identical patterns are judged differently in different places. This is attention dilution, and it is primarily a quality problem rather than a capacity problem; simply increasing context capacity does not reliably fix long-context quality issues, so loading the same bundle into a larger window is not a dependable substitute for focused passes.

The fix is a division of labor. Per-document passes handle local extraction, giving every document the model's full focus and consistent depth. A separate integration pass then handles what only a cross-document view can catch: an invoice total that must match the purchase order, a delivery quantity referenced by a line item, or contradictory dates between documents. Scoping the integration pass to these cross-document relationships, rather than re-extracting everything, keeps each pass focused on the analysis it is uniquely positioned to do. This is the same prompt chaining principle Anthropic recommends for decomposing complex tasks into focused sequential steps.

The distractors fail for instructive reasons. Repeating the combined pass and taking a majority vote has a legitimate cousin in Best-of-N comparison, which can be useful as an auxiliary verification technique, but as the core architecture it averages over noise without restoring consistent per-document attention, and correct extractions that appear in only one run get discarded. And relying on schema validation confuses structural guarantees with semantic ones: a schema ensures each extraction is well-formed JSON with the right fields, but it has no visibility into whether values across documents in a bundle actually agree. Cross-document consistency requires a pass that sees the documents in relation to each other.

### 도메인

Prompt Engineering & Structured Output

## 질문 29

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : The agent reviews 15-file pull requests using a two-pass structure, but each per-file analysis runs sequentially in the main conversation; by the final cross-file integration pass, accumulated file contents and findings have visibly degraded output quality. How should the review be restructured?

**A.** Have the integration pass re-read every changed file with the Read tool so it works from source code instead of accumulated findings.

**설명**

Reloading all 15 files puts the full volume of raw content back into a single context, which recreates the exact overload the two-pass structure was meant to avoid. The integration pass should reason over distilled per-file findings, not the complete sources.

**B(정답).** Delegate each per-file analysis to a parallel subagent that returns structured findings, then run the integration pass over only those findings.

**설명**

Subagents run in isolated contexts, so verbose file contents and intermediate reasoning stay inside each subagent while only concise structured findings return to the parent. The integration pass then operates on a compact, focused input, and parallel spawning also shortens total review time.

**C.** Insert a summarization step after every third file that condenses the conversation so far before the next per-file analysis begins.

**설명**

Progressive summarization is lossy and tends to blur precise findings such as line references, specific patterns, and exact identifiers that the integration pass needs. It also keeps the review sequential, so it fixes neither the quality nor the latency problem at its root.

**D.** Switch the integration pass to a model with a larger context window so all accumulated file contents fit comfortably within its limits.

**설명**

Fitting more tokens does not restore attention quality; the degradation comes from processing large volumes of low-relevance material, not from exceeding a hard limit. A larger window carries the same dilution problem at a higher cost.

### 전반적인 설명

The per-file-then-integration pattern only delivers its benefit if the two passes are also separated at the context level. Running every local analysis in one long main conversation means the integration pass inherits everything: raw file contents, tool outputs, and intermediate reasoning. That is precisely the attention dilution the pattern exists to prevent, just relocated to the final step.

Subagents in the Claude Agent SDK are the natural implementation. Each per-file analysis runs in its own isolated context, so dozens of Read results and exploratory notes never touch the parent conversation; only the subagent's final message returns. Having each subagent emit structured findings (file, issue, location, severity) gives the integration pass a compact, uniform input focused entirely on cross-file concerns such as inconsistent types and circular dependencies. Because the per-file analyses are independent, they can be spawned as parallel Task calls in a single coordinator turn, cutting wall-clock time to roughly the slowest file rather than the sum of all of them.

The alternatives each miss the mechanism. A larger context window changes capacity, not attention behavior over long low-relevance input. Periodic summarization is lossy where reviews can least afford it, in exact locations and identifiers, and preserves the sequential bottleneck. Re-reading all files in the integration pass simply rebuilds the overloaded single context the decomposition was designed to eliminate.

See Subagents in the SDK for how context isolation and parallel subagent execution work in the Claude Agent SDK.

### 도메인

Agentic Architecture & Orchestration

## 질문 30

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : This team's automated PR review re-runs whenever new commits are pushed, and each re-run already receives the prior findings so it posts only deltas. An engineer proposes shrinking what each re-run examines to cut latency. Which review scope is correct?

**A.** Review only the diff of the commits pushed since the previous review ran.

**설명**

This is incorrect because an incremental-only diff misses issues that arise from how new commits interact with code changed earlier in the PR. A new commit can break an invariant introduced three commits ago without the newest diff showing anything suspicious on its own.

**B.** Review only the files that carried findings in the previous review.

**설명**

This is incorrect because it makes the review blind to new issues in any file the previous pass considered clean. New commits routinely introduce problems in files that had no prior findings, so this scope trades away exactly the coverage a re-review exists to provide.

**C(정답).** Review the full cumulative PR diff on every re-run.

**설명**

This is correct because duplicate suppression is already handled by the prior findings supplied in context, so the diff scope must stay complete. New commits can interact with earlier changes, and only a full-diff review can catch those interactions and confirm which prior findings were actually resolved.

**D.** Review the newest commit's diff plus any files it touches that earlier commits also modified.

**설명**

This is incorrect because cross-commit interactions are not limited to files that were edited more than once. A new commit can change the behavior of code added earlier in a file it never touches, for example by altering a shared interface or caller, so this heuristic still leaves coverage gaps.

### 전반적인 설명

The key mental model is that re-review noise and re-review coverage are controlled by two independent levers. Noise is a context design problem: you suppress duplicate comments by feeding the reviewer its own prior findings and instructing it to report only new or still-unaddressed issues. Coverage is a scope problem: the reviewer can only flag what it reads. In the described setup the noise lever is already in place, so narrowing the diff would sacrifice coverage to solve a problem that no longer exists.

Reviewing the full cumulative diff on every re-run is what makes delta reporting trustworthy. Changes in a pull request are not independent: a later commit can violate an assumption introduced by an earlier one, undo a fix, or change a shared interface that earlier code depends on. Only a reviewer that sees the whole change set can detect those interactions, and only a reviewer that re-examines everything can verify that a prior finding was genuinely resolved rather than merely absent from the latest commit's diff.

Each narrowing strategy fails on the same axis. An incremental-only diff hides cross-commit effects entirely. Restricting the pass to previously flagged files means new defects in clean files go unreviewed. The hybrid heuristic of adding files touched by multiple commits only catches interactions that happen to overlap in the same file, missing behavioral coupling through callers, interfaces, or configuration. The correct trade is to keep the review scope complete and let the prior-findings context, not a reduced diff, keep the output quiet.

See Claude Code GitHub Actions for running automated reviews in CI.

### 도메인

Claude Code Configuration & Workflows

## 질문 31

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : Extractions of recipe-style documents mishandle informal quantities like "a splash of vinegar" or "two handfuls of rice", sometimes inventing precise values, even though the prompt already contains detailed prose conversion rules. What most effectively improves accuracy on these inputs?

**A.** Set the sampling temperature to zero so the extraction stops inventing numeric values it cannot find in the text.

**설명**

Temperature controls randomness in token selection, not whether the model grounds values in the source, so a deterministic model can still produce the same fabricated conversion every time. Lowering it makes an incorrect conversion more repeatable rather than preventing fabrication.

**B.** Expand the prose rules into an exhaustive lookup table that enumerates every possible informal unit and its exact conversion.

**설명**

Informal measurement language is open-ended, so no lookup table can enumerate every phrasing writers might use. Documents will keep introducing expressions outside the table, and the model will be back to guessing on exactly the inputs that matter.

**C.** Constrain the amount field with a strict numeric type and a required flag so only concrete quantities pass validation.

**설명**

Making the field strictly numeric and required is an anti-pattern here: when the source only offers an informal phrase, a required concrete value pressures the model to fabricate a number to satisfy the schema. Schemas enforce structure, not the honesty of the values inside it.

**D(정답).** Add a few targeted examples that map informal phrases to approximate amounts with precision markers across document formats.

**설명**

This is correct because informal measurements are too diverse for exhaustive rules, but a handful of examples demonstrates the judgment pattern: capture the original phrase, produce an approximate value, and flag it as approximate. The model then generalizes that pattern to informal phrasings it has never seen, which is exactly where few-shot prompting outperforms prose instructions.

### 전반적인 설명

Informal measurements are a classic case where few-shot prompting beats prose instructions. Phrases like "a pinch", "a splash", or "two handfuls" form an open-ended vocabulary, so no rule list or lookup table can cover them all. What the model actually needs is not more rules but a demonstrated judgment pattern: preserve the original wording, estimate an approximate amount, and mark the result as approximate (for example, an output containing original_text, an estimated value, and a precision field). Given a small set of such examples (Anthropic recommends 3 to 5 for best results) spanning varied document formats, the model generalizes the pattern to unseen phrasings rather than merely repeating the examples, which is precisely the mechanism by which few-shot examples reduce hallucinated values in extraction tasks.

Anthropic's guidance on example-driven prompting recommends examples that are relevant, diverse, and structured: they should mirror the real use case and deliberately cover edge cases, which is exactly what informal quantities and mixed document layouts are. Note the boundary of the claim, though: examples improve accuracy and consistency but do not eliminate hallucination, so validation of extracted values remains worthwhile, as covered in Anthropic's hallucination-reduction guidance.

The distractors each miss the failure mode. An exhaustive conversion table chases an unbounded input space and still leaves the model unguided on novel phrasings. Reaching for temperature misdiagnoses the problem: the parameter only shapes randomness in token selection and does not make outputs source-grounded, so a fabricated value simply becomes a repeatable fabricated value. And tightening the schema to a required strict numeric field makes things worse: when the document offers no concrete number, a required field removes the model's honest option and invites fabrication, which is why schema design guidance favors nullable or approximate-friendly fields when source data may be informal or absent.

### 도메인

Prompt Engineering & Structured Output

## 질문 32

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : A migration script Claude generated keeps crashing on rows where the email column is null. Prose instructions such as "handle missing values gracefully" have not fixed the behavior across several revisions. What refinement technique should you apply next?

**A(정답).** Provide two or three concrete test cases showing sample input rows containing nulls and the exact expected output for each.

**설명**

Concrete input/output examples are the most effective way to communicate an expected transformation when prose descriptions keep being interpreted inconsistently. Showing a null email row alongside the exact result you expect removes the ambiguity that vague phrases like "gracefully" leave open.

**B.** Lower the sampling temperature so the generated script handles nulls the same way on every regeneration attempt.

**설명**

Temperature affects variability, not correctness. A more deterministic generation would simply produce the same wrong null handling consistently, because the model still has no specification of what the right output looks like.

**C.** Switch to plan mode so Claude proposes and you approve its null-handling approach before it rewrites the migration script.

**설명**

Plan mode is valuable for large changes with architectural implications or multiple viable approaches, not for clarifying an underspecified edge-case behavior. A plan built from the same vague instruction will encode the same ambiguity, just earlier in the workflow.

**D.** Restate the null-handling requirement in stronger prose, marking it IMPORTANT at the top of the prompt so it cannot be missed.

**설명**

The problem is not that the instruction is being overlooked; it is that "handle missing values gracefully" is ambiguous about what the correct behavior actually is. Emphasis raises priority but adds no specification, so the interpretation problem remains.

### 전반적인 설명

This is the core insight behind iterative refinement: when detailed prose instructions produce inconsistent or wrong behavior on edge cases, the highest-leverage fix is to replace descriptions with demonstrations. A phrase like "handle missing values gracefully" admits many readings: skip the row, substitute a default, write an audit entry, raise a typed error. The model must pick one, and different generations pick differently. Two or three concrete test cases (an input row with a null email, the exact expected output row or error) collapse that space of interpretations to a single verifiable behavior. Anthropic's guidance on prompt examples and templates describes multishot examples as the reliable way to steer output behavior, and its evaluation guidance explicitly calls for factoring in edge cases such as missing or malformed input data.

The examples also become a regression check: once written down, they can be run against the revised script, and Anthropic's common workflows guidance recommends exactly this loop of specifying edge-condition cases, running them, and fixing failures. The distractors all miss the diagnosis. Bolding the requirement spends emphasis budget without adding a specification. Plan mode is a scoping tool for large, multi-approach changes; it front-loads review but cannot resolve an ambiguity the instruction never settled. Lowering temperature trades wrong-and-varied for wrong-and-consistent, since determinism does not supply the missing definition of correct behavior.

### 도메인

Claude Code Configuration & Workflows

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

## 질문 34

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : Your automated review prompt tells Claude to "only report findings you are confident about," yet noisy, inconsistent findings persist. Which TWO changes reflect effective criteria-based review design? (Select TWO.)

**A.** Have the model attach a self-rated confidence score to every finding and automatically suppress any finding whose score falls below a tuned numeric threshold.

**설명**

This is incorrect because self-stated confidence is poorly calibrated, so a numeric threshold filters on an unreliable signal. It automates the same confidence-based approach that is already failing rather than defining what actually counts as a reportable issue.

**B.** Reword the instruction to demand absolute certainty, directing the model to report an issue only when it is completely sure the issue is genuine.

**설명**

This is incorrect because intensifying vague language adds no operational content. "Completely sure" is just as subjective as "confident," so the model still lacks concrete boundaries between reportable and skippable findings.

**C(정답).** Define paths and finding types the review should skip, such as generated files, lockfiles, and issues that CI checks already enforce.

**설명**

This is correct because scoping out generated code, lockfiles, and CI-enforced checks removes whole classes of low-value findings at the source. Anthropic's review guidance documents these as examples of content to skip or de-emphasize in review instructions.

**D(정답).** Name reportable categories (behavior-contradicting bugs, security flaws) and skip categories (minor style, accepted local patterns) in the review prompt.

**설명**

This is correct because explicit categorical criteria, stated directly in the review instructions, give the model an operable decision rule for what to report and what to ignore. Confidence wording is subjective and interpreted differently on every run, while named categories with boundaries are testable and consistent.

### 전반적인 설명

The core insight is that confidence is not a review policy. Instructions like "only report high-confidence findings" ask the model to filter on a subjective, internal signal that it cannot state or apply consistently; the same borderline finding can pass the filter one run and fail it the next. What actually moves precision is replacing that vibe with an operational definition: name the categories that must be reported (bugs where behavior contradicts intent, security vulnerabilities) and the categories that must be skipped (minor style preferences, patterns the codebase has deliberately accepted). A categorical rule is something the model can match against; a confidence rule is something it can only guess at.

Scoping is the second lever. Anthropic's Code Review documentation explicitly recommends listing paths, branches, and categories where the reviewer should post nothing, and calls out generated code, lockfiles, vendored dependencies, and checks already enforced by CI as things to exclude. These exclusions eliminate entire families of noise structurally, before any judgment call is needed, which is far more reliable than hoping a confidence filter suppresses them case by case. Notably, Code Review's default posture already embodies this philosophy: it focuses on correctness bugs, not formatting preferences.

The two rejected approaches fail for the same underlying reason. A self-rated confidence score with a suppression threshold merely mechanizes an uncalibrated signal; the model's stated confidence correlates only loosely with whether a finding is real, so tuning the threshold trades one noise profile for another. Demanding "absolute certainty" intensifies wording without adding any decision boundary, which is exactly the failure mode of vague instructions that Anthropic's prompting best practices warn against: be clear, direct, and specific, because specificity is what transfers.

### 도메인

Prompt Engineering & Structured Output

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

## 질문 36

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Validation flags review summaries whose total_findings value does not equal the sum of the per-severity counts. The full diff and all findings were in the original prompt. How should the pipeline handle these failures?

**A.** Retry with a fresh prompt that omits the failed summary and the validation error so the model is not anchored to its earlier mistake.

**설명**

Withholding the failed output and the error removes exactly what makes retries effective. Without seeing what it produced and what was wrong with it, the model is just as likely to repeat the inconsistency; error feedback is what turns a retry into a targeted correction.

**B(정답).** Retry automatically, sending back the failed summary and the specific count discrepancy, since everything needed to correct it is already in the input.

**설명**

Arithmetic inconsistencies like this are correctable because the model already has every piece of information it needs to re-check its own counts. A retry that includes the failed output and the concrete discrepancy gives the model a targeted correction task rather than a blind second attempt.

**C.** Route these runs straight to human review without retrying, since arithmetic inconsistencies signal that required information is absent from the source.

**설명**

This misclassifies the failure. Retries are ineffective when the needed information is absent from the provided input, but here the diff and the findings are all in the prompt; the model can recount and reconcile the totals, so automatic retry is appropriate before any human involvement.

**D.** Rerun the request unchanged at a lower sampling temperature, since numeric inconsistencies come from randomness rather than correctable output errors.

**설명**

Lowering temperature changes token sampling, not the model's arithmetic reconciliation. An unchanged request with no error feedback gives the model no signal about what to fix, so the same inconsistency can recur even at temperature zero.

### 전반적인 설명

The core judgment here is classifying the failure before choosing a remedy. Retry-with-error-feedback is an application-level validation pattern that succeeds when the model already possesses everything it needs to produce a corrected answer: format mismatches (a date in the wrong notation), structural errors (a value in the wrong field), and arithmetic inconsistencies (a stated total that does not match the sum of its parts). In all these cases the correction is derivable from the provided input, so a retry containing the original material, the failed output, and the specific validation error gives the model a concrete, targeted task; this is the same iterative-refinement principle behind Anthropic's general prompting guidance. Retries fail only when the missing ingredient is information that was never provided; then the fix is to supply or retrieve the source, not to re-prompt.

This also reflects the boundary of what schema enforcement guarantees. A schema-conformant summary can still be semantically wrong: total_findings being present and correctly typed says nothing about whether it reconciles with the per-severity counts. That is why pipelines pair structural guarantees with a semantic validation layer, and why patterns like extracting both a stated and a calculated value exist, making discrepancies machine-detectable so they can feed the retry loop. See Structured outputs for what schema conformance does and does not cover.

The other approaches each break the mechanism. Escalating immediately treats a self-correctable arithmetic error as if the data were absent, burning human time on failures automation handles well. A fresh prompt without the error discards the feedback that makes retries targeted; the retry becomes a coin flip rather than a correction. Lowering temperature addresses sampling variance, not the reconciliation error itself, and an unchanged request carries no signal about what went wrong. When grounding truly is missing, the right move is providing the source material rather than retrying, per Reduce hallucinations; here, the grounding was present all along.

### 도메인

Prompt Engineering & Structured Output

## 질문 37

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The extraction pipeline's date normalizer regresses with each revision: fixing one reported format breaks previously handled edge cases, and a latency requirement on large documents goes unchecked. Which refinement approach improves the implementation most reliably?

**A.** Lower the sampling temperature to zero so repeated implementation attempts interpret the written normalization rule identically on each run.

**설명**

Temperature affects variability in token selection, not correctness of an implementation. A deterministic run can consistently produce code that fails the same edge cases and misses the latency requirement, and nothing in the loop would surface those failures.

**B.** Describe each newly discovered failure in prose after it occurs and ask Claude to patch the code without revalidating previously fixed scenarios.

**설명**

Patching one reported failure at a time without revalidating earlier scenarios is exactly the regression cycle the team is already experiencing. Without a suite that re-checks all prior cases, each fix can undo previous ones, and the latency requirement is never exercised at all.

**C(정답).** Write tests for expected normalizations, edge cases, and the latency target before implementing, then share failing test output to guide each revision.

**설명**

Test-driven iteration is the reliable technique for progressive improvement: a suite built before implementation captures expected behavior, edge cases, and performance requirements, and each revision is guided by concrete failing output. Because the full suite re-runs every time, a fix for one format cannot silently break previously handled cases.

**D.** Rewrite the normalization rule in prose with IMPORTANT markers and stronger emphasis so the model prioritizes it consistently on every implementation attempt.

**설명**

Emphasis raises a rule's priority relative to quieter instructions around it, but it does not verify the resulting implementation or catch regressions. An emphasized prose rule still leaves edge cases and the latency target unchecked after each revision.

### 전반적인 설명

When each revision fixes one failure while breaking others, the missing piece is a verification harness, not a better-worded rule. The technique for this situation is test-driven iteration: before implementation, build a test suite that encodes expected behavior (representative date strings and their ISO 8601 results), edge cases (two-digit years, ambiguous day/month order, missing components), and non-functional requirements such as the latency target on large documents. Then iterate by sharing the failing test output with Claude and letting each revision be judged against the full suite.

The mental model: prose describes intent, but tests define done. Because the entire suite runs on every iteration, regressions become visible immediately instead of surfacing later as new bug reports, and a performance requirement expressed as a test is actually checked rather than merely stated. The failing output itself is high-quality feedback: it tells the model precisely which input produced which wrong result, which is far more actionable than a prose complaint.

The alternatives each leave the regression loop intact. Reporting one failure at a time and patching without revalidation is the anti-pattern already causing the churn; nothing guards previously fixed cases. Emphasis markers like IMPORTANT spend attention budget to raise a rule's priority but verify nothing about the code that results. Zero temperature makes repeated attempts more deterministic without making them correct; a deterministic implementation can fail the same edge cases every single run.

See Claude Code common workflows and Prompt engineering overview.

### 도메인

Claude Code Configuration & Workflows

## 질문 38

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : A session has produced a detailed analysis of why extraction fails on edge-case invoices. The team now wants to trial a strict-schema fix and a lenient-schema fix separately, with each attempt building on that analysis but neither influencing the other. What should they do?

**A.** Start two new sessions and paste a written summary of the failure analysis into each one as its opening message.

**설명**

A manually written summary is lossy: nuances of the failure analysis, specific document examples, and intermediate observations get compressed or dropped. Forking transfers the complete analysis context into both branches without any manual re-summarization, so this approach pays an unnecessary fidelity cost.

**B.** Test both fixes in one session sequentially, instructing Claude to disregard the first fix before evaluating the second.

**설명**

Context cannot be selectively forgotten on instruction; everything about the first fix remains in the conversation and can bias the evaluation of the second. Sequential testing in one session directly violates the requirement that neither exploration influences the other.

**C.** Run /compact after the analysis so the condensed context can support evaluating both schema fixes in the same session.

**설명**

Compaction compresses history within a single session; it does not create separate lines of work. Both fixes would still be evaluated in one shared context, so the second evaluation is contaminated by the first, and details of the analysis may be lost in the summary.

**D(정답).** Create two branches from the analysis session with fork_session and develop each schema fix in its own branch.

**설명**

Forking creates independent branches that both inherit the full analysis up to the branch point and then diverge without sharing anything afterward. This gives each schema fix the complete failure analysis as its baseline while guaranteeing the explorations stay isolated from each other.

### 전반적인 설명

fork_session exists precisely for this pattern: divergent exploration from a shared baseline. A fork produces independent branches that each carry the full conversation up to the branch point, including every finding from the failure analysis, and then evolve separately. Neither branch ever sees what happens in the other, so the strict-schema and lenient-schema trials can be compared cleanly, and the expensive analysis work is paid for exactly once rather than redone or re-summarized for each attempt.

The mental model is a tree, not a tape. A single session is a linear tape: everything stays in context, and an instruction to "disregard" earlier content does not remove it, because the model still attends to those tokens. /compact operates on that same tape by summarizing and replacing history; it reduces token usage but neither removes the first experiment's influence nor creates a second line of work, and its summarization can drop precise details such as the specific invoice patterns that triggered failures. Seeding two brand-new sessions with a pasted summary does achieve isolation, but only by substituting a lossy, manually authored approximation for the actual analysis, and it requires setting up that baseline twice. Forking gets both properties at once: full-fidelity shared context and strict isolation after the split.

See Session Management in the Claude Agent SDK for how sessions are resumed and forked, and Create custom subagents for related context-isolation mechanisms.

### 도메인

Agentic Architecture & Orchestration

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

## 질문 41

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : An engineer proposes letting the codebase-exploration subagents send their results directly to one another instead of returning everything through the coordinator. Which two hub-and-spoke design rules should you defend to keep the benefits this change would sacrifice? (Select two.)

**A.** Preserve coordinator-mediated handoffs so independent subagents can run concurrently, since direct exchanges force strictly sequential execution.

**설명**

This is incorrect because parallelism comes from the coordinator spawning multiple subagents at once, and that capability is unaffected by how results are later passed around. Direct communication does not inherently force sequential execution.

**B.** Keep all results flowing through the coordinator to stop the subagents' isolated context windows from merging into a shared memory.

**설명**

This is incorrect because context isolation is a property of each subagent instance, not of the communication topology. Passing data between agents, by any route, does not merge their context windows into shared memory.

**C(정답).** Have the coordinator curate each downstream subagent's prompt, deciding exactly what information each worker receives for its task.

**설명**

This is correct because in hub-and-spoke, the coordinator curates and filters what goes into each subagent's prompt. Direct exchanges bypass that curation, so a subagent may receive irrelevant or excessive data the coordinator would have trimmed.

**D(정답).** Route every subagent result back through the coordinator so all inter-agent interactions can be observed, logged, and debugged from one point.

**설명**

This is correct because routing all communication through the coordinator gives one place to monitor the entire system. With direct subagent-to-subagent exchanges, some interactions happen outside the coordinator's view, making failures and misroutings harder to trace.

### 전반적인 설명

In a hub-and-spoke multi-agent design, the coordinator is not just a task dispatcher; it is the sole channel for inter-agent communication. Every result a subagent produces returns to the coordinator, and everything a subagent knows arrives through the prompt the coordinator writes for it. This buys two things that direct subagent-to-subagent messaging gives up: centralized observability, because all traffic passes one point where it can be logged, inspected, and debugged, and information routing control, because the coordinator decides which findings, in what form and at what level of detail, each downstream agent actually needs.

The mental model worth internalizing is that subagents are isolated workers: each runs in its own context window and sees only what its delegation prompt contains. That isolation is intrinsic to how subagent instances work, so letting agents pass data directly would not merge their contexts into shared memory; it would simply move the handoff out of the coordinator's sight. Likewise, concurrency is a scheduling property: the coordinator achieves parallelism by spawning multiple subagents in one turn, and nothing about the communication path between agents forces sequential execution.

The tradeoff hub-and-spoke makes is deliberate: routing everything through one hub adds a hop of latency and some token overhead, but in exchange the system gains uniform oversight and a single place to reason about what each worker was told. For production systems where you need to audit why an agent behaved as it did, that visibility is usually worth the cost. See the Claude Code subagents documentation for how subagent context isolation and delegation work.

### 도메인

Agentic Architecture & Orchestration

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

## 질문 43

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : A team's CI pipeline uses a Claude Code job to draft updates to their document extraction schemas, and they are now designing the review stage that runs before merge. How should the review stage obtain its findings?

**A.** Continue in the drafting session but prompt it with a strict reviewer persona to critique the diff line by line.

**설명**

A persona instruction is prompt-level guidance layered on top of contaminated context. The session still carries the rationale that produced the change, so it remains predisposed to accept its own decisions regardless of the persona.

**B.** Continue in the drafting session with extended thinking enabled so it reasons more deeply before reporting findings.

**설명**

Extended thinking increases reasoning depth but does not remove the drafting context that biases the review. Deeper reasoning over the same anchored context tends to elaborate the original justifications rather than challenge them.

**C(정답).** Launch a clean Claude Code instance with fresh context to review the diff, separate from the session that drafted the change.

**설명**

This is correct because the drafting session retains the reasoning that produced the change, which biases it toward its own decisions. A fresh, independent instance evaluates the diff on its own merits and catches issues the original session rationalizes away.

**D.** Resume the drafting session for the review after running /compact so the summarized history no longer carries the drafting rationale.

**설명**

Compaction summarizes prior history to free context space, but the summary still preserves the session's reasoning and decisions. The reviewer remains anchored to its own choices, so the bias persists.

### 전반적인 설명

The mental model here is session context isolation. Everything a Claude Code session did to produce a change (the exploration, the tradeoffs it weighed, the justifications it settled on) remains in its context. When that same session is asked to review the result, it is not evaluating unfamiliar code; it is re-reading the change alongside the reasoning that convinced it the change was right. That makes it systematically less likely to challenge its own decisions, which produces conspicuously gentle reviews. Anthropic's documented pattern is a separate writer session and a separate reviewer session: a fresh context is not biased toward code it just wrote, so it applies its standards to the diff on its own terms.

The distractors all try to fix a context problem without removing the context. /compact replaces the transcript with a summary, but that summary still encodes the session's decisions, so the anchoring survives compaction. A stricter reviewer persona is an instruction competing against the accumulated rationale already in the window; it changes tone, not independence. Extended thinking buys more reasoning depth, but more reasoning over the same anchored context typically re-derives the original justifications rather than surfacing their flaws. Independence is a property of what is in the reviewer's context, not of how hard or how sternly it thinks.

In practice, this principle drives CI design: the review job should invoke a clean Claude Code instance against the diff rather than reusing whatever session produced the change. See Claude Code Best Practices and Common Workflows for the writer/reviewer separation pattern.

### 도메인

Claude Code Configuration & Workflows

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

## 질문 45

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : The team wants the agent to interview an engineer about requirements and edge cases before automating a legacy-system task. Using the Agent SDK, how does the agent's clarifying question actually reach your application?

**A.** Configure a PreToolUse hook that intercepts the AskUserQuestion call and returns the engineer's answer as the hook's output.

**설명**

Hooks exist to validate, block, or react to tool calls; they are not the channel for supplying a user's answer to a clarifying question. The Agent SDK routes AskUserQuestion to the application through the can_use_tool callback, which pauses execution until the app responds.

**B(정답).** Handle the AskUserQuestion tool call in the can_use_tool callback, which pauses execution until your application returns the answer.

**설명**

This is how the Agent SDK surfaces clarifying questions. Claude requests user input through the AskUserQuestion tool, which triggers the can_use_tool callback and pauses execution until the application supplies a response, letting your app render the question however it chooses.

**C.** Read the question from a plain text block in the assistant's final message, then send the answer as the next user turn in a new query.

**설명**

Clarifying questions do not arrive as prose in a final message that the application must parse. They arrive as a structured AskUserQuestion tool invocation that pauses the run through the can_use_tool callback, so no message parsing or new query is needed.

**D.** Expose a custom MCP tool for questions, since the SDK's built-in tools cannot request input from the user mid-run.

**설명**

Building a custom question tool reinvents capability the platform already provides. AskUserQuestion is a built-in tool designed exactly for gathering requirements and clarifying ambiguity, and the SDK routes it to your application through the can_use_tool callback.

### 전반적인 설명

The interview pattern asks Claude to question the developer before implementing, surfacing edge cases, tradeoffs, and constraints that a one-shot prompt would miss. In Claude Code and the Agent SDK, the mechanism behind this pattern is the built-in AskUserQuestion tool, which Claude uses to pose multiple-choice clarifying questions when requirements are ambiguous.

In an Agent SDK application there is no terminal for Claude to print to, so the SDK is designed around a callback contract: Claude requests user input in exactly two documented situations, tool permission requests and clarifying questions via AskUserQuestion, and both trigger the canUseTool / can_use_tool callback. Execution pauses until the application returns a response. This design keeps the SDK headless and embeddable; your application decides whether the question appears in a web form, a chat widget, or a CLI prompt, then feeds the answer back so the agent can continue with the engineer's input incorporated.

The other approaches misread this contract. Parsing a text block out of a final message assumes the agent finishes its turn and hands the question back as prose, when in fact the run is suspended mid-turn awaiting the callback's response. A PreToolUse hook is a mechanism for validating, modifying, or blocking tool calls before they run, not the documented channel for answering a clarifying question. And a custom MCP question tool duplicates a capability the platform ships natively, adding maintenance burden without gaining anything.

See Handling user input in the Agent SDK and Claude Code best practices for the documented interview workflow.

### 도메인

Claude Code Configuration & Workflows

## 질문 46

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : The agent's PostToolUse hook on Bash detects credentials in command output and returns decision "block" with a redaction notice, yet the model still quotes the leaked values in later responses. What change makes the redaction effective?

**A.** Have the hook return the redaction notice in additionalContext so the model reads it instead of the raw output.

**설명**

additionalContext appends information alongside the tool result; it does not replace or remove the original output. The credentials would still sit in context next to the notice, so the model could continue to quote them.

**B(정답).** Have the hook return hookSpecificOutput with updatedToolOutput so redacted text replaces the tool result the model sees.

**설명**

In a PostToolUse hook, updatedToolOutput is the mechanism that replaces the tool output before Claude processes it. This is exactly what redaction requires: the model never sees the original credential values, only the sanitized version.

**C.** Move the redaction logic into a PreToolUse hook that inspects the command string and denies execution when it looks risky.

**설명**

A PreToolUse hook runs before the tool executes, so it can only see the command, not its output; credentials that appear in output cannot be detected at that point. Denying execution also breaks legitimate commands rather than sanitizing their results.

**D.** Add a system prompt instruction directing the model to disregard any credential values that appear in tool results.

**설명**

Prompt instructions provide only probabilistic compliance, and the sensitive values still enter the context window where the model can attend to them. A guarantee that the model never sees the credentials requires code-level transformation, not guidance.

### 전반적인 설명

The behavior in this scenario follows directly from how PostToolUse output fields work. Returning decision: "block" from a PostToolUse hook does not hide or replace the tool result; it attaches the hook's reason alongside the original output, which Claude still receives in full. That design makes sense for the common case, where the goal is to flag a problem while keeping the evidence visible, but it is the wrong instrument for redaction, where the whole point is that the model must never process the original content.

The field built for transformation is hookSpecificOutput.updatedToolOutput. When a PostToolUse hook returns it, the replacement becomes the tool result Claude sees, so a hook can strip credentials, trim noisy fields, or normalize formats deterministically, with no reliance on the model cooperating. Two boundaries are worth internalizing: the replacement must match the tool's output shape, since built-in tools return structured objects rather than plain strings, and PostToolUse cannot undo side effects, because the tool has already executed; the command ran and its real output was produced, so updatedToolOutput only changes what enters the model's context. Preventing an action outright is PreToolUse territory, but PreToolUse fires before any output exists, which is why it cannot solve an output-redaction problem.

The mental model an architect should carry: PreToolUse governs whether and how a tool call happens, PostToolUse governs what the model learns from it, and additionalContext supplements while updatedToolOutput substitutes. Prompt-level instructions to "ignore" sensitive values are the weakest option of all, since the data has already landed in context and compliance is probabilistic. See Agent SDK Hooks and Claude Code Hooks Reference.

### 도메인

Agentic Architecture & Orchestration

## 질문 47

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : During long codebase explorations, the agent often emits progress narration such as "I've located the config loaders" in the same response as its tool calls. A developer's hand-rolled loop, built directly on the Messages API, terminates whenever a response contains text, cutting investigations short. What is the correct termination design?

**A.** Terminate when a response contains a text block longer than a set threshold, since substantive narration marks a finished analysis.

**설명**

This is a variant of the same anti-pattern the developer already has: inferring completion from text content. The model routinely produces lengthy reasoning or progress narration mid-task alongside tool calls, so a length threshold would still end investigations early.

**B.** Instruct the agent to append a unique sentinel phrase when the task is complete and terminate whenever that phrase appears in the output.

**설명**

Parsing assistant text for a completion signal is a documented anti-pattern, even with a distinctive sentinel. The model may emit or omit the phrase inconsistently, and this replaces a deterministic structured field with a probabilistic natural language convention.

**C(정답).** Keep looping while stop_reason is tool_use, treat end_turn as normal completion, and handle any other stop reason as a separate case.

**설명**

The stop_reason field is the structured signal designed for loop control: tool_use means the model expects tool results back, and end_turn means it finished normally, while other values like max_tokens need their own handling rather than being treated as success. Because a single response can contain both narration text and tool_use blocks, keying the loop off stop_reason rather than content presence fixes the premature exits.

**D.** Set a generous fixed iteration cap and treat reaching the cap as the completion signal for the exploration.

**설명**

Iteration caps are safety valves against runaway loops, not completion signals. Reaching a cap should be surfaced as an error or truncation condition rather than success, and a cap sized for one investigation will truncate a longer one or waste turns on a shorter one.

### 전반적인 설명

A hand-rolled agentic loop on the Messages API has a designed, structural termination mechanism. Each API response carries a stop_reason: while it is tool_use, the model has requested tools and is waiting for their results, so the harness executes them, appends the results to the conversation, and calls the model again. When it is end_turn, the model has finished normally and produced its final answer. Any other value, such as max_tokens or stop_sequence, also exits the tool loop, but signals a condition that needs its own handling rather than being treated as successful completion. The Claude Agent SDK encodes the same principle in its managed loop: it continues through tool-use round trips until Claude produces a response with no tool calls, then reports the outcome through ResultMessage.subtype, distinguishing success from error states. In neither design does the presence, absence, or content of assistant text participate in the decision.

That last point is what breaks the developer's current design. Responses are lists of content blocks, and a mid-task response frequently mixes text blocks (progress narration, reasoning) with tool_use blocks. Treating any text as a completion indicator, whether by presence, length, or a sentinel phrase, converts a deterministic protocol field into a probabilistic guess about natural language, which is exactly the anti-pattern class to avoid. Sentinel phrases fail when the model paraphrases, forgets, or emits the phrase early; length thresholds fail because thorough agents narrate as they work.

Iteration caps deserve a place in the design, but only as a safety net against runaway loops, never as the primary stopping mechanism. The Agent SDK makes this distinction explicit: hitting max_turns returns a result with the error_max_turns subtype, an error state distinct from success. A well-built loop therefore checks the structured signal for normal completion, routes non-success stop conditions to error handling, and keeps a cap only to bound cost and latency in failure cases. See The Agent Loop in the Claude Agent SDK for the canonical loop lifecycle and termination states.

### 도메인

Agentic Architecture & Orchestration

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

## 질문 49

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : A developer finished designing a multi-service restructuring in plan mode and has iterated on the proposed plan until it looks right. No source files have changed yet. How should implementation proceed?

**A(정답).** Approve the plan, which exits plan mode, then have Claude implement and verify against it.

**설명**

This is the documented explore, plan, implement workflow. Approving the plan exits plan mode and changes the session's permission mode, and Claude then executes the work while checking its edits against the plan it produced.

**B.** Start a fresh session in direct execution mode and paste in a summary of the planned changes.

**설명**

Restarting discards the exploration context the planning session accumulated and forces Claude to work from a lossy summary. The designed workflow keeps the same session, exiting plan mode by approving the plan.

**C.** Switch to bypassPermissions mode so implementation edits proceed without any approval prompts.

**설명**

Bypassing permissions skips all safety checks and is only appropriate inside an isolated container or virtual machine. Exiting plan mode is done by approving the plan, which does not require abandoning permission checks entirely.

**D.** Stay in plan mode and instruct Claude to begin implementing now that the plan is settled.

**설명**

Plan mode is a research-and-propose mode in which edits to source files remain blocked until the user approves the plan. Instructing Claude to implement while still in plan mode will not produce file changes.

### 전반적인 설명

Plan mode is one half of a deliberate two-phase workflow, not a mode a task lives in forever. In plan mode Claude can read files and explore the codebase, but it does not edit source files; its output is a proposed implementation plan for the user to review. The mental model is explore, plan, implement, commit: use plan mode while the approach is uncertain, iterate on the plan (which is far cheaper than iterating on wrong code), and then approve the plan. Approval is the documented exit mechanism: it takes the session out of plan mode and changes its permission mode, after which Claude implements and verifies its work against the plan it wrote. Pressing Shift+Tab is the other way to switch modes, and Ctrl+G even lets you edit the proposed plan in your editor before Claude proceeds.

The tradeoff this design makes is intentional: edits stay blocked during planning so a large architectural change like a service restructuring cannot start mutating files before a human has agreed on the approach. That is exactly why asking Claude to implement while still in plan mode goes nowhere, and why jumping to bypassPermissions is an anti-pattern; it trades away all approval checks when the workflow only needs a mode transition. Starting a fresh session throws away the exploration context that made the plan good in the first place, replacing it with a summary that loses detail. See Permission modes and Claude Code best practices for the full workflow.

### 도메인

Claude Code Configuration & Workflows

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

## 질문 51

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

## 질문 53

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The extract_invoice_fields tool has a thorough input_schema with detailed field-level descriptions, but its tool description is just "Extracts invoice data." The agent routinely calls it on receipts and purchase orders it cannot parse. What is the highest-leverage fix?

**A.** List the supported document types in the system prompt and keep the tool description minimal to reduce token overhead.

**설명**

Tool descriptions are what the model consults at selection time, so moving applicability guidance into the system prompt separates the signal from the decision it needs to inform. Minimal descriptions are precisely what causes unreliable selection when tools have scope limits the model cannot see.

**B(정답).** Expand the description to state that the tool handles invoices only and does not accept receipts or purchase orders.

**설명**

The tool description is the primary signal the model reads when deciding whether to call a tool, and a detailed input_schema cannot substitute for it. Adding explicit applicability boundaries (invoices in scope, receipts and purchase orders out of scope) addresses the misuse at the point where the selection decision is actually made.

**C.** Tighten the input_schema by adding a required document_type enum so calls with unsupported document types fail validation.

**설명**

The schema governs the shape of arguments after the model has already decided to call the tool; it does not guide the selection decision itself. This change only makes the wrong calls fail loudly rather than preventing the model from making them in the first place.

**D.** Return a structured validation error with isRetryable set to true whenever a non-invoice document is submitted.

**설명**

Structured errors are valuable for recovery, but this approach is purely reactive: the agent still misroutes every receipt and purchase order, then burns additional turns discovering the failure. Marking the error retryable is also misleading, since retrying an unsupported document type cannot succeed.

### 전반적인 설명

Anthropic's documented guidance is unambiguous: the tool description is the single most important factor in tool-use performance. The model decides whether and when to invoke a tool by reading its description, not by studying its schema. A strong description explains what the tool does, when to use it and when not to, and what it does not handle or return; Anthropic recommends at least three to four sentences per tool, more for complex ones. A one-liner like "Extracts invoice data" gives the model no way to know that receipts and purchase orders fall outside the tool's scope, so it reaches for the tool whenever any financial document appears.

The useful mental model is a two-stage pipeline: selection happens by reading descriptions, and argument construction happens against the input_schema. Field-level schema detail improves the second stage but is invisible to the first, which is why a meticulously specified schema coexists with chronic misrouting here. Tightening the schema with a required enum only converts silent misuse into loud failures; the wasted calls remain. Moving the guidance into the system prompt strands it far from where the model evaluates tools, and returning validation errors teaches the agent by trial and error, spending turns on calls that better documentation would have prevented (while an isRetryable: true flag wrongly invites retries of a request that can never succeed).

The general lesson for extraction systems with several similar tools is to state applicability boundaries directly in each description, so scope decisions are resolved before the first call rather than after the first failure. See How to implement tool use for Anthropic's contrast between strong and weak tool descriptions.

### 도메인

Tool Design & MCP Integration

## 질문 54

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : During an interactive Claude Code session, an engineer used plan mode to investigate a legacy scheduler, and Claude produced a sound implementation plan. The engineer typed "exit plan mode and implement this" in chat, but Claude's edit attempts remain blocked. What should the engineer do?

**A(정답).** Switch out of plan mode with Shift+Tab, then have Claude execute the approved plan.

**설명**

Plan mode is a permission mode enforced by Claude Code itself, so only the user can change it, using controls like Shift+Tab in an interactive session. Once the engineer exits plan mode, Claude can carry out the plan it already produced, keeping all the investigation context intact.

**B.** Repeat the instruction with stronger, more explicit wording so Claude changes the mode itself.

**설명**

Asking Claude in chat to change permission modes does not change the mode, no matter how the request is phrased. Mode enforcement lives in the harness, outside the model's control, precisely so instructions cannot override it.

**C.** Add a CLAUDE.md rule stating that file edits are permitted once Claude has presented a plan.

**설명**

CLAUDE.md provides guidance the model reads, not enforced configuration, so it cannot grant write access that the active permission mode blocks. Plan mode's read-only restriction is applied by Claude Code regardless of what project instructions say.

**D.** Start a fresh session and paste the plan in, since a session's permission mode is fixed at launch.

**설명**

Permission modes are not fixed at launch; in an interactive session the user can cycle modes with Shift+Tab. Restarting also discards the investigation context accumulated during planning, which is exactly what the plan-then-execute workflow is meant to preserve.

### 전반적인 설명

The plan-then-execute workflow depends on understanding what plan mode actually is: a permission mode enforced by the Claude Code harness, not a behavioral instruction the model follows. In plan mode, Claude is limited to read-only investigation (Read, Grep, Glob) and cannot edit files, and that restriction is applied by the tool layer regardless of what the conversation says. This separation is deliberate: instructions in chat or CLAUDE.md are probabilistic guidance, while permission modes are deterministic enforcement, so a mode cannot be talked off by anyone, including Claude itself.

The consequence is that the transition from investigation to implementation is a user action. In an interactive Claude Code session the engineer exits plan mode with Shift+Tab (a session can also be started in plan mode with claude --permission-mode plan, or planning can be applied to a single prompt with /plan), then directs Claude to execute the plan it produced. Because the same session continues, all the context gathered during exploration carries directly into implementation, which is the core value of combining the two modes.

The failed alternatives each misunderstand the enforcement boundary. Rephrasing the chat request cannot work because the model has no authority over its own permission mode. A CLAUDE.md rule cannot grant access the harness is blocking, since memory files are guidance rather than configuration. Starting a fresh session would eventually work but rests on a false premise (modes are changeable mid-session) and needlessly discards the accumulated investigation context. See Permission modes for the documented mode controls.

### 도메인

Claude Code Configuration & Workflows

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

## 질문 56

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : Your project CLAUDE.md tells Claude to ignore the generated/ directory during analysis. When a developer delegates codebase research to the built-in Explore subagent, its findings repeatedly reference generated files. What is the correct fix?

**A(정답).** Restate the exclusion rule in the delegation prompt, because the Explore subagent skips CLAUDE.md files.

**설명**

This is correct because the built-in Explore and Plan subagents deliberately skip CLAUDE.md files and the parent session's git status to keep research fast and inexpensive. The delegation prompt is the channel through which any rule that must reach the subagent has to be passed explicitly.

**B.** Move the rule to the user-level CLAUDE.md at ~/.claude so it applies globally rather than per project.

**설명**

Changing which memory location holds the rule does not help, because Explore skips the entire CLAUDE.md hierarchy, including user-level files. The rule would still never enter the subagent's context.

**C.** Mark the rule as IMPORTANT in the project CLAUDE.md so it carries into the subagent's isolated context.

**설명**

Emphasis only affects how a rule competes for attention among content that is actually loaded. Since Explore does not load CLAUDE.md at all, no amount of emphasis in that file can reach it.

**D.** Have the parent session filter references to generated/ out of Explore's findings after the subagent returns.

**설명**

Post-hoc filtering treats the symptom rather than the cause. Explore still spends its search effort on generated files and may ground its conclusions in them, so cleaning the returned summary does not produce reliable research; the exclusion must reach the subagent before it searches.

### 전반적인 설명

Subagents in Claude Code run in isolated context windows, but the contents of that context vary by agent type. Most built-in and custom subagents load the full CLAUDE.md hierarchy and a git status snapshot at startup. The built-in Explore and Plan subagents are the documented exception: they skip both, by design, so that fast, read-only research does not pay the token cost of project memory it usually does not need. Anthropic also states there is no frontmatter field or per-agent setting to change which agents skip them, so this behavior cannot be reconfigured away.

The mental model to carry is that the delegation prompt is the reliable parent-to-subagent channel. The main conversation reads Explore's results with full CLAUDE.md context, so most project rules never need to reach the subagent itself; but when a rule genuinely governs the subagent's own behavior, such as which directories to skip while searching, the documentation's guidance is to restate it in the prompt you give Claude when delegating. Filtering the findings after the subagent returns fails because the research was already conducted over the excluded files, and relocating the rule to a different memory location or amplifying it with emphasis both fail for the same underlying reason: content that is never loaded into a context cannot influence the agent operating in it.

See Create custom subagents and Subagents in the SDK for the full breakdown of what each subagent type loads at startup.

### 도메인

Agentic Architecture & Orchestration

## 질문 57

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : A batch run extracting data from 500 documents crashes after several hours, and every restart reprocesses all documents from the beginning, doubling cost and delaying downstream delivery. Which design change enables reliable crash recovery?

**A.** Resume the prior Claude session so the model's conversation context restores which documents were already processed.

**설명**

This is incorrect because conversation context is not a durable progress ledger; after a crash the session state may be incomplete or stale, and the model cannot reliably reconstruct which of hundreds of documents finished. Resuming sessions is for continuing investigation context, not for transactional recovery of batch progress.

**B.** Wrap the entire run in a retry loop with exponential backoff that restarts processing from the first document whenever a crash occurs.

**설명**

This is incorrect because restarting from the first document is exactly the wasteful behavior the team is trying to eliminate. Backoff helps with transient failures on individual calls, but without persisted progress every retry repeats all completed work.

**C.** Rely on prompt caching so previously processed documents are cached and skipped automatically when the pipeline restarts.

**설명**

This is incorrect because prompt caching reduces the cost of repeated identical prompt prefixes with a short time-to-live; it does not record which documents were completed or skip any work. The pipeline would still re-invoke the model for every document after a restart.

**D(정답).** Have each stage export completed document IDs and results to a known location, and load a manifest on restart to resume unfinished work.

**설명**

This is correct because structured state persistence makes progress durable outside the model's context: each stage writes what it has completed to a known location, and a manifest tells the restarted run exactly which items remain. Recovery then costs only the unfinished work rather than a full rerun.

### 전반적인 설명

Crash recovery in long-running agent pipelines depends on structured state persistence: each agent or stage exports its state (completed items, key results, coverage) to a known location as it works, and a manifest records the status of every unit of work. On restart, the coordinator loads the manifest, sees which documents are completed, in_progress, or not_started, and dispatches only the remainder. The mental model is that a model invocation is stateless and ephemeral, so any progress you want to survive a process crash must live in durable storage your own code controls; the tradeoff is a small amount of bookkeeping per item in exchange for recovery cost that is proportional to the unfinished work, not the whole run.

Resuming a prior session addresses a different problem: it restores conversational context for continued interactive work, and even there stale results are a known hazard. It gives no transactional guarantee about which of 500 documents finished. A retry loop that restarts from the first document treats the whole run as one atomic unit, which is precisely why cost doubles; retries belong at the level of individual transient failures, not the entire batch. Prompt caching is a cost and latency optimization for repeated prompt prefixes with a short time-to-live; it stores no record of completed work and cannot skip any document. See Building effective agents and the Claude Agent SDK overview for patterns on managing durable state around stateless model calls.

### 도메인

Context Management & Reliability

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

## 질문 60

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