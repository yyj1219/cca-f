# 시나리오1_CICD

## 질문 1

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



## 질문 2

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



## 질문 3

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



## 질문 4

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



## 질문 5

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



## 질문 6

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



## 질문 7

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



## 질문 8

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



## 질문 9

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



## 질문 10

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



## 질문 11

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



## 질문 12

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



## 질문 13

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



## 질문 14

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



## 질문 15

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



