# 시나리오1_CICD

## 질문 1

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline's finding schema declares cve_id as a required string on every security finding. When a flagged vulnerability has no published CVE, Claude emits realistic-looking identifiers such as CVE-2023-48213. Which change prevents these fabricated values?

**A.** Add a system prompt rule stating that CVE identifiers must never be invented under any circumstances.

**설명**

프롬프트 지시는 모든 finding에 문자열 값을 요구하는 구조적 제약과 충돌한다. 스키마가 여전히 해당 필드를 요구하므로 모델은 어떤 값이든 내보내야 하고, 결과적으로 이 지시는 실패율을 낮출 뿐 완전히 없애지는 못한다.

**B(정답).** Declare cve_id with type ["string", "null"] so findings without a published CVE can report null.

**설명**

이것이 정답인 이유는, 필수 문자열 필드는 모델에게 부재를 정직하게 표현할 방법을 주지 않기 때문이다. 스키마 준수는 모델이 어떤 문자열이든 만들어내도록 강제한다. null을 허용하면 공개된 CVE가 없는 finding에 대해 모델이 스키마상 유효한 정당한 답을 낼 수 있게 되어, 값을 조작해야 하는 구조적 압박이 사라진다.

**C.** Validate each cve_id against the public CVE registry after extraction and discard entries that fail.

**설명**

사후 검증은 원인이 아니라 증상을 다루는 방식이다. 스키마는 여전히 모든 finding에 값을 강제하기 때문이다. 또한 조작된 식별자가 우연히 실제이지만 무관한 CVE와 일치할 경우 조용히 통과시켜 잘못된 데이터를 걸러내지 못한다.

**D.** Run a retry with the fabricated value and a validation error so Claude can correct the identifier.

**설명**

오류 피드백을 포함한 재시도는 형식이나 구조적 오류에는 효과적이지만, 해당 finding에 필요한 정보 자체가 존재하지 않을 때는 도움이 되지 않는다. 스키마가 바뀌지 않았으므로 여전히 문자열을 요구하고, 재시도는 결국 또 다른 조작된 식별자를 만들어낼 뿐이다.

### 전반적인 설명

Structured Outputs나 strict tool use 같은 스키마 준수 출력 메커니즘은 형태를 보장한다. 즉 필드 타입이 지켜지고 필수 필드는 항상 존재한다. 이 보장은 양날의 검이다. 필드가 필수로 지정되어 있는데 그 근거가 되는 사실이 실제로 존재하지 않을 수도 있는 경우, 모델은 궁지에 몰린다. 스키마에 맞는 값을 반드시 내보내야 하고, 그 제약을 만족시키는 유일한 방법은 값을 지어내는 것이다. 여기서의 조작은 프롬프트로 나무라서 없앨 수 있는 모델의 결함이 아니라, 스키마가 애초에 허용하지 않은 입력에 대해 설계된 대로 정확히 작동한 결과다.

해결책은 부재를 명시적으로 표현하는 것이다. Anthropic이 지원하는 JSON Schema 하위 집합에는 "type": ["string", "null"] 같은 유니온 타입이 포함되어 있어서, 필드를 필수(출력 객체에 항상 존재)로 유지하면서도 원본에 값이 없을 때는 null을 허용할 수 있다. 또는 required 목록에서 제외하여 필드를 선택적으로 만들 수도 있다. 선택적(optional)과 널 허용(nullable)은 서로 다른 설계 선택이며, 둘 다 문서화된 복잡도 제한(선택적 파라미터 24개, 유니온 타입 파라미터 16개)에 포함된다. 어느 쪽이든 모델은 데이터 누락 상황에 대해 진실한 답을 낼 수 있게 된다.

다른 접근법들은 모두 구조적 함정을 그대로 남긴다. 조작을 금지하는 프롬프트 규칙은 확률적이며, 값을 요구하는 강한 제약을 이기지 못한다. 레지스트리 사후 검증은 조회에 실패하는 조작만 잡아내며, 그럴듯한 가짜 값이 실제의 무관한 CVE와 충돌할 수 있다. 오류 피드백을 포함한 재시도는 교정 가능한 오류에는 적합한 도구이지만, 문서화된 한계가 그대로 적용된다. 재시도는 존재하지 않는 정보를 복구할 수 없으며, 바뀌지 않은 스키마는 매 시도마다 새로운 조작을 강제한다. Structured outputs와 Increase output consistency 참조.

### 도메인

Prompt Engineering & Structured Output



## 질문 2

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Metrics show naming-convention findings carry a 55% false-positive rate while security findings are over 90% accurate, yet developers have begun ignoring both. While the naming prompts are being fixed, how should the pipeline handle the naming category?

**A.** Demote naming findings to non-blocking informational comments so developers can skip them.

**설명**

노이즈성 finding은 여전히 모든 풀 리퀘스트에 나타나므로, 계속해서 개발자의 주의를 소모시키고 리뷰어의 출력을 무시하는 습관을 강화한다. 노이즈에 다른 이름을 붙이는 것만으로는 정확한 카테고리에 대한 신뢰가 무너지는 것을 막지 못한다.

**B.** Keep the naming category live and iterate on its few-shot examples against real pull requests.

**설명**

few-shot 예시는 결국 해당 카테고리를 개선하는 데 효과적인 기법이지만, 프로덕션에서 반복 개선한다는 것은 각 변경 사항을 테스트하는 동안 개발자가 계속 대부분 틀린 finding을 받게 된다는 뜻이다. 튜닝 기간 전체에 걸쳐 신뢰는 계속 떨어진다.

**C(정답).** Suspend the naming category until its rewritten prompts pass offline testing.

**설명**

노이즈성 카테고리를 즉시 제거하면 개발자가 모든 finding을 무시하도록 학습하는 것을 막을 수 있어, 정확한 보안 및 정확성 카테고리에 대한 신뢰를 보호한다. 비활성화된 카테고리의 프롬프트는 그 후 개선하고 오프라인에서 검증한 다음 다시 활성화할 수 있다.

**D.** Require a higher model-stated confidence threshold before any naming finding is reported.

**설명**

모델이 스스로 보고하는 신뢰도는 보정이 잘 되어 있지 않아서, 이를 기준으로 필터링해도 실제 finding과 오탐을 안정적으로 구분하지 못한다. 카테고리는 여전히 활성 상태로 노이즈를 발생시키고, 오탐을 만들어내는 근본적인 프롬프트 기준은 전혀 고쳐지지 않는다.

### 전반적인 설명

여기서 핵심은 오탐이 카테고리 간에 전염된다는 점이다. 개발자는 naming finding과 보안 finding에 대해 별도의 신뢰 점수를 마음속에 유지하지 않는다. 리뷰어가 말하는 것의 절반이 틀리면, 개발자는 리뷰어가 말하는 모든 것을 무시하는 법을 학습한다. 즉 오탐률 55%인 naming 카테고리는 그 자체로 가치가 낮은 것에 그치지 않고, 바로 옆에 있는 정확도 90%짜리 보안 카테고리의 가치까지 실제로 파괴한다. 신뢰는 이 시스템의 진짜 자산이며, 전체적으로 함께 떨어진다.

따라서 올바른 운영상의 조치는 노이즈성 카테고리를 파이프라인에서 빼내어 프롬프트를 개선하는 것이다. 이는 신뢰 붕괴를 즉시 멈추고, 정밀한 카테고리들의 신뢰도를 보존하며, naming 기준(무엇을 보고하고 무엇을 넘길지에 대한 명시적 규칙, 대조적인 few-shot 예시)을 다시 작성하고 오프라인에서 검증한 뒤 카테고리를 복귀시킬 여지를 만들어준다. 비활성화는 영구적인 조치가 아니라, 어디에서 반복 개선을 진행할지에 대한 단계적 결정일 뿐이다.

다른 대안들은 모두 노이즈를 개발자 눈앞에 그대로 둔다. finding을 정보성 댓글로 강등하는 것은 같은 오탐을 리뷰 화면에서 제거하지 않은 채 이름만 바꾸는 것이다. 실제 풀 리퀘스트를 대상으로 few-shot 예시를 반복 개선하는 것은 올바른 개선 기법을 잘못된 환경에서 실행하는 것이다. 중간 단계의 모든 프롬프트 버전이 자신의 오류를 실제 개발자에게 그대로 내보낸다. 모델이 스스로 밝힌 신뢰도로 필터링하는 방식은 그 신뢰도 자체가 보정이 잘 안 되어 있어서 실패한다. 필터는 많은 오탐을 그대로 통과시키고, 결함이 있는 기준은 손대지 않은 채 남는다.

카테고리를 다시 구축할 때 명시적 기준과 목적에 맞는 예시가 어떻게 정밀도를 높이는지는 Anthropic의 prompt engineering 및 being clear and direct 가이드를 참조하라.

### 도메인

Prompt Engineering & Structured Output



## 질문 3

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Review findings always pass schema validation, yet the location field arrives in mixed formats ("auth.ts:42", "line 42 of src/auth.ts"), breaking the bot that posts inline PR comments. What is the most effective fix?

**A.** Force the findings tool with tool_choice so every response is generated through the schema rather than free text.

**설명**

finding은 이미 스키마 검증을 통과하고 있으므로, 구조화된 출력 자체는 이미 안정적으로 생성되고 있다. 도구 사용을 강제하는 것은 스키마가 사용되는지 여부를 바꿀 뿐, 그 안의 값이 어떻게 형식화되는지는 바꾸지 않으므로 이 불일치는 그대로 남는다.

**B(정답).** Specify the exact location convention (relative path, colon, line number) in the prompt and the field's schema description.

**설명**

정답이다. JSON 스키마는 해당 필드가 존재하고 문자열이라는 것은 보장하지만, 그 값이 따라야 할 표기 규칙(convention)은 규정하지 못한다. 정규화 규칙을 프롬프트와 필드 설명에 명시적으로 기술하면 모델에게 실행 가능한 형식 규칙을 주는 것이며, 이는 엄격한 스키마와 함께 값의 일관된 표기 규칙을 얻기 위한 문서화된 방법이다.

**C.** Add a regex pattern with minLength and maxLength constraints to the location field so nonconforming values are rejected during generation.

**설명**

minLength, maxLength 같은 문자열 제약 조건은 structured outputs가 지원하는 JSON Schema 하위 집합에 포함되지 않으며, 지원되지 않는 스키마 기능을 제출하면 400 오류가 발생할 수 있다. 이러한 제약이 지원되는 경우에도, 이는 형태만 고정할 뿐 모델에게 어떤 표기 규칙을 써야 하는지는 가르쳐주지 못한다.

**D.** Write a post-processing step that detects each location variant with regexes and rewrites it into the expected format before posting.

**설명**

이는 모델이 만들어낼 수 있는 모든 변형을 예상해야 하는 취약한 패턴 매칭으로 후단에서 증상만 처리하는 방식이다. 근본 원인, 즉 프롬프트에 명시적인 형식 규칙이 없다는 점은 그대로 남아 있어서, 새로운 변형이 나타날 때마다 이 재작성 로직은 계속 깨질 것이다.

### 전반적인 설명

이 문제는 스키마가 강제할 수 있는 것과 강제할 수 없는 것 사이의 경계를 다룬다. JSON 스키마에 대한 제약 생성은 구조를 보장한다. 즉 출력은 문법적으로 유효하고, 필수 필드가 존재하며, 타입이 일치한다. 하지만 값이 따르는 표기 규칙에 대해서는 아무것도 말해주지 않는다. 문자열로 타입이 지정된 location 필드는 auth.ts:42로도, line 42 of src/auth.ts로도 똑같이 충족된다. 다운스트림 시스템이 특정 값 형식에 의존한다면 그 기대는 의미론적인 것이며, 의미론은 다른 모든 지시사항과 같은 방식으로, 즉 프롬프트와 스키마 내 상세한 필드 설명을 통해 전달되어야 한다. Anthropic의 도구 정의 가이드는 바로 이 점을 강조하며, 형식에 민감한 파라미터, 기대되는 표기 규칙, 주의사항을 명시하는 설명을 권장하고, 필요하면 예시로 이를 보강하라고 권한다.

기억해둘 사고 모델은 다음과 같다. 구조에 대해서는 신뢰성의 사다리를 오른다(스키마는 구조적으로 구문 오류를 없앤다). 그 위에 값 표기 규칙에 대한 정규화 규칙을 층층이 쌓는다. 예를 들어 "location은 항상 상대 경로, 콜론, 줄 번호 형식이다" 또는 "날짜는 항상 ISO 8601 형식이다" 같은 규칙이다. 이런 규칙을 스키마 자체에 밀어넣으려 하면 대개 완전히 실패한다. structured outputs는 JSON Schema의 일부 하위 집합만 지원하며, minLength나 maxLength 같은 문자열 제약은 명시적으로 지원되지 않아 400 오류를 유발할 수 있다. 정규식 기반 후처리는 책임을 뒤집어서, 모델에게 원하는 하나의 형식을 알려주는 대신 코드가 모든 변형을 추측하도록 강제한다. 그리고 tool_choice로 도구 사용을 강제하는 것은 이 파이프라인에 없는 문제를 다루는 것이다. 스키마에 맞는 출력은 이미 도착하고 있고, 결함은 값 주변이 아니라 값 내부에 있다.

지원되는 스키마 하위 집합과 그 보장 내용은 Structured outputs를, 형식 기대치를 전달하는 설명 작성법은 Define tools를 참조하라.

### 도메인

Prompt Engineering & Structured Output



## 질문 4

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A CI review job asks Claude for JSON in prose, and parsing sometimes fails. The team defines a report_findings tool whose input_schema matches the findings format. Which TWO actions should the team take? (Select TWO.)

**A.** Keep tool_choice at auto and add a firm prompt instruction to always call report_findings, since strict mode ensures the call occurs.

**설명**

이는 틀렸다. strict 모드는 실제로 발생한 도구 호출의 입력을 검증할 뿐이며, 호출 자체가 일어나도록 만들지는 않는다. auto 상태에서는 프롬프트에서 강조해도 모델이 여전히 일반 텍스트로 응답할 수 있으므로, 호출이 일어나도록 보장하려면 문구가 아니라 tool_choice를 사용해야 한다.

**B(정답).** Add strict: true to the report_findings tool definition so the tool input is guaranteed to match the schema when called.

**설명**

정답이다. strict tool use를 활성화하면 문법 제약 샘플링(grammar-constrained sampling)이 작동하여, 도구 입력이 input_schema를 따르도록 보장한다. 이를 통해 검증-재시도 루프 없이도 누락된 파라미터, 타입 불일치, 형식이 깨진 JSON을 방지할 수 있다. 이 보장은 실제로 발생한 도구 호출에 적용되므로, 호출이 반드시 일어나도록 하는 tool_choice 설정과 함께 사용해야 한다.

**C.** Remove the downstream semantic validation layer, since schema conformance now guarantees the accuracy of every extracted value.

**설명**

이는 틀렸다. 스키마는 구조를 강제할 뿐 진실성을 강제하지 않기 때문이다. finding은 스키마상으로는 완벽하게 유효하면서도 잘못된 심각도 수준을 담거나 값이 잘못된 필드에 들어갈 수 있으므로, 필드 간 일관성 규칙과 같은 의미론적 검사는 그대로 유지되어야 한다.

**D(정답).** Set tool_choice to force the report_findings tool rather than leaving the default auto, so every run produces a tool call.

**설명**

정답이다. 기본값인 auto 설정에서는 모델이 어떤 도구도 호출하지 않고 대화형 텍스트로 답할 수 있으므로, 그런 실행에는 스키마 보장이 적용되지 않는다. 지정된 도구를 강제하거나(또는 any로 어떤 도구든 요구), 이렇게 하면 구조화된 채널이 매번 사용되도록 보장할 수 있다.

### 전반적인 설명

도구를 통한 신뢰할 수 있는 구조화된 출력은 두 가지 별개의 보장에 의존하며, 설계는 이 둘을 모두 제공해야 한다. 첫째는 입력 유효성이다. 도구 정의에 strict: true를 추가하면 문법 제약 샘플링이 켜지고, 모델의 도구 입력은 input_schema와 정확히 일치하도록 생성된다. strict tool use 문서가 설명하듯, 이는 누락된 파라미터와 타입 불일치를 구조적으로 방지하며, 이 때문에 신뢰성의 사다리에서 프롬프트 지시, 프리필, 또는 산문으로 기술된 스키마보다 상위에 위치한다. 닫히지 않은 중괄호나 뒤에 붙는 부연 설명 같은 구문 오류는 이런 방식으로 생성된 tool_use 블록 안에서는 애초에 발생할 수 없다.

두 번째 보장은 호출이다. strict 모드는 실제로 일어난 호출만 제약한다. 기본값인 tool_choice의 auto는 모델이 대화형 텍스트로 답할 자유를 남겨두므로, 리뷰 실행이 파싱할 수 없는 산문을 반환할 수도 있다. tool use 개요에서 설명하듯, 지정된 도구를 강제하거나 any로 어떤 도구든 요구하면 이 틈을 막을 수 있다. 프롬프트로 강조하는 것은 여기서 대체 수단이 될 수 없다. 지시는 호출이 일어날 확률을 높일 뿐 결코 보장하지는 못한다.

두 메커니즘 모두 할 수 없는 것은 의미 검증이다. critical이어야 할 finding이 minor로 표시되거나, 줄 번호가 잘못된 파일에 붙는 경우는 모든 구조적 제약을 만족시키면서도 틀린 것이다. 그래서 프로덕션 파이프라인은 strict tool use를 도입한 이후에도 비즈니스 규칙과 필드 간 일관성을 위한 검증 계층을 유지한다. structured outputs 문서는 이러한 메커니즘을 형태를 통제하는 것이지 진실을 통제하는 것이 아니라고 명시한다. 다운스트림 검사를 제거하는 것은 보장된 스키마와 보장된 정확성을 혼동하는 것이다.

### 도메인

Prompt Engineering & Structured Output



## 질문 5

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Since adding three few-shot examples to the review prompt, output formatting is finally consistent, but nearly every finding is now rated critical; all three examples happened to show critical security issues. What is the right fix?

**A(정답).** Replace the examples with a diverse set spanning multiple severity levels and issue types, keeping the format identical.

**설명**

이것이 정답인 이유는 예시가 의도했든 안 했든 패턴을 가르치기 때문이다. 동질적인 critical 보안 예시 세 개는 모델에게 finding은 critical해 보인다는 것을 가르쳤다. 따라서 해결책은 다양성이다. 여러 심각도와 이슈 유형을 다루는 예시는 출력 형식은 그대로 고정하면서 전체 판단 범위를 보여준다.

**B.** Add an instruction stating that severity must be judged from the code itself, independent of the severity shown in examples.

**설명**

이는 신뢰할 수 없는 방법이다. 산문 지시가 예시가 보여주는 구체적인 패턴과 직접 경쟁하게 되는데, 시연된 패턴이 추상적인 지시를 이기는 경향이 있기 때문이다. 편향의 원천은 예시 자체이므로, 이를 논리로 반박하기보다 예시 자체를 고쳐야 한다.

**C.** Wrap each example in XML example tags so Claude treats them as format illustrations rather than content to imitate.

**설명**

예시 태그는 Claude가 예시와 지시를 구분하는 데 도움이 되며 권장되는 구조화 방식이지만, 모델이 예시의 내용을 일반화하는 것을 막지는 못한다. 모든 예시가 critical finding을 보여준다면, 태그를 씌운다고 해서 그것들이 가르치는 심각도 편향이 사라지지는 않는다.

**D.** Remove the few-shot examples and rely on detailed severity criteria in prose, since the examples are biasing outputs.

**설명**

이는 예시가 방금 달성한 형식 일관성을 버리는 것이며, 그 일관성은 이전에 산문 지시만으로는 이루지 못했던 것으로 추정된다. 문제는 예시가 존재한다는 것이 아니라 예시 세트가 너무 동질적이라는 것이며, 이는 기법 자체를 포기하지 않고도 고칠 수 있다.

### 전반적인 설명

few-shot 예시가 효과가 있는 이유는 모델이 예시로부터 일반화를 하기 때문이며, 이때 모델은 의도적으로 가르치려 한 속성뿐 아니라 예시들이 공통으로 갖는 모든 것으로부터 일반화한다. Anthropic의 multishot prompting 가이드는 이를 명확히 밝힌다. 예시는 관련성이 있어야 하고(실제 사용 사례를 반영), 구조화되어 있어야 하며(정확한 출력 형태를 시연), 그리고 결정적으로 다양해야 한다(의도하지 않은 패턴을 가르치지 않도록 다양한 경우를 다루어야 한다). 리뷰 프롬프트의 세 예시가 모두 critical 보안 이슈를 보여줄 때, 그 공통된 특성이 학습된 패턴의 일부가 되어버린다. 모델은 보고할 만한 finding은 곧 critical finding이라고 추론하게 되고, 심각도 등급은 그 값으로 몰리게 된다.

해결책은 기법은 유지하면서 예시 세트를 고치는 것이다. 형식(위치, 이슈, 심각도, 제안된 수정)은 그대로 고정한 채 심각도 수준과 이슈 범주를 다양화한 3~5개의 작은 예시 세트는 구조와 판단 경계를 모두 가르친다. 이를 상쇄하려는 산문 지시를 추가하는 것은 추상적인 규칙을 구체적으로 시연된 패턴과 맞붙이는 것이며, 시연이 이기는 경향이 있다. 예시를 <example> 태그로 감싸는 것은 예시와 지시를 구분하는 좋은 습관이지만, 태그가 그 안의 내용 편향을 무력화하지는 못한다. 예시를 완전히 제거하는 것은 예시가 제공했던 형식 일관성을 포기하는 것이며, 심각도 문제를 해결하는 대신 원래의 문제를 다시 불러온다.

기억해둘 사고 모델은, 예시 세트가 축소판 학습 신호라는 점이다. 그러므로 데이터셋을 감사하듯 우연히 생긴 규칙성을 점검해야 한다. Prompt engineering과 Increase output consistency 참조.

### 도메인

Prompt Engineering & Structured Output



## 질문 6

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline emits each review finding as JSON validated against a schema. One finding fails validation: severity contains an undefined enum value and line_number is null. You want the model to self-correct on a retry. What should the retry request contain?

**A.** Re-run the original review prompt from scratch at a lower temperature so the invalid output is not reproduced.

**설명**

처음부터 다시 실행하면 피드백 루프가 완전히 사라져서, 모델은 어떤 필드가 왜 실패했는지 전혀 알 수 없다. 온도를 낮추면 출력이 더 결정론적이 되지만 스키마 준수 방향으로 이끌지는 못하므로, 이 재시도는 목표가 없는 것이다.

**B.** Send only the validation errors together with an instruction to regenerate the finding in a schema-compliant form.

**설명**

실패한 출력이 없으면 모델은 자신이 실제로 무엇을 만들었는지 볼 수 없고, 원본 diff가 없으면 수정된 심각도나 줄 번호를 다시 근거할 대상이 없다. 재생성은 실질적으로 눈을 감고 하는 것과 같아서 같은 오류가 반복될 가능성이 높다.

**C(정답).** Include the reviewed diff, the failed finding, and the specific validation errors so the model can correct against the source.

**설명**

이것이 오류 피드백을 포함한 재시도 패턴이다. 모델은 자신이 무엇을 만들었는지, 정확히 무엇이 잘못되었는지, 그리고 수정된 값을 다시 근거할 원본 자료를 봐야 한다. 이 세 가지가 모두 있으면 보통 한두 번의 재시도로 구조 및 형식 오류가 해결된다.

**D.** Resend the failed finding with a general instruction to repair any formatting problems, omitting the error details to keep the retry small.

**설명**

구체적인 검증 오류를 생략하면 모델은 무엇이 잘못되었는지 추측해야 하고, 모호한 수정 지시는 실행 가능한 목표를 주지 않는다. 거부된 enum 값처럼 구체적인 오류 메시지가 있어야 자가 수정이 신뢰할 수 있게 된다.

### 전반적인 설명

검증-재시도 루프는 구조화된 추출과 구조화된 리뷰 출력에 대한 표준적인 신뢰성 패턴이다. 코드가 (Pydantic이나 JSON Schema 라이브러리 같은 검증기로) 모델의 JSON을 스키마에 대해 검증하고, 실패하면 세 가지를 담은 후속 요청을 보낸다. 원본 자료(여기서는 리뷰된 diff), 실패한 출력, 그리고 구체적인 검증 오류다. 각 요소는 서로 다른 역할을 한다. 실패한 출력은 모델이 실제로 무엇을 말했는지 보여주고, 오류 메시지(예: "severity value 'urgent' is not in the allowed enum")는 수정을 새로운 추측이 아니라 목표가 명확한 편집으로 바꿔주며, 원본은 모델이 올바른 줄 번호 같은 값을 지어내는 대신 다시 도출할 수 있게 해준다. 이런 종류의 형식, 구조, enum 오류는 정확히 한두 번의 피드백 기반 재시도로 보통 해결되는 범주다.

오류만 보내거나, 실패한 출력만 보내고 모호하게 "형식을 고쳐라"라고 지시하면 이 삼각대의 한 다리가 빠지는 셈이다. 모델은 자신의 실수를 볼 수 없거나 수정을 근거할 수 없어서 재시도가 헛돌게 된다. 원래 프롬프트를 처음부터 다시 실행하는 것은 피드백을 완전히 포기하는 것이다. 온도는 샘플링의 변동성을 조절할 뿐 스키마 준수를 조절하지 않으므로 같은 실패 모드가 그대로 남아 있다. 함께 기억해야 할 경계는, 재시도는 문제가 출력에 있을 때만 도움이 되며 입력에 있을 때는 도움이 되지 않는다는 점이다. 필요한 정보가 원본에 실제로 없다면 아무리 오류 피드백을 줘도 그것을 만들어낼 수 없으며, 이런 경우 올바른 조치는 재시도가 아니라 해당 필드를 널 허용으로 만들거나 사람이 처리하도록 넘기는 것이다.

스키마 제약 출력과 그 검증 경계가 실제로 어떻게 작동하는지는 Tool use with Claude를 참조하라.

### 도메인

Prompt Engineering & Structured Output



## 질문 7

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A weekly security audit prompt asks Claude to label each finding critical, high, medium, or low. The same vulnerability class receives different labels week to week, breaking ticket routing. Which prompt change best stabilizes classification?

**A.** Instruct the model to reason step by step about business impact before it commits to a severity level.

**설명**

이는 틀렸다. 정의되지 않은 척도에 대해 단계별로 추론해도 여전히 정의되지 않은 결과가 나온다. 각 레벨이 무엇을 의미하는지에 대한 기준이 없으면, 모델은 신중하게 추론하더라도 매 실행마다 다른 레이블에 도달할 수 있으며, 이것이 바로 관찰된 실패다.

**B(정답).** Define each severity level with an explicit written criterion plus a short code sample illustrating it.

**설명**

이것이 정답인 이유는 일관성을 위해서는 실행 가능한 루브릭이 필요하기 때문이다. 각 레벨에 대한 정확한 기준은 모델에게 각 레이블이 무엇을 의미하는지 알려주고, 구체적인 코드 예시는 그 경계를 고정시켜서 동일한 취약점 유형이 매주 같은 레벨로 매핑되도록 한다. 예시는 분류 동작을 조종하는 가장 신뢰할 수 있는 문서화된 방법 중 하나다.

**C.** Collapse the four-level scale into two levels so the model has fewer severity boundaries to distinguish.

**설명**

이는 틀렸다. 티켓 라우팅이 의존하는 세밀함을 버리면서도 남은 경계는 여전히 정의되지 않은 상태로 남기 때문이다. 기준이 없는 두 단계 척도는 네 단계 척도만큼이나 쉽게 흔들린다. 문제는 레벨의 수가 아니라 정의가 없다는 것이다.

**D.** Post-process the report so recurring finding types inherit the severity assigned in the prior week's run.

**설명**

이는 틀렸다. 모델이 맞았든 틀렸든 처음에 우연히 만들어낸 레이블을 그대로 고정시켜버리고, 처음 등장하는 finding 유형에는 아무 도움도 되지 않는다. 분류기에게 적용할 정의를 주는 대신 후단에서 증상만 처리하는 방식이다.

### 전반적인 설명

심각도 레이블은 운영상의 정의가 없는 판단에 맡겨질 때 흔들린다. "critical"이나 "low" 같은 단어는 스스로 정의되지 않는다. 고정점이 없으면 모델은 문구, 주변 finding, 샘플링에 따라 이를 다르게 해석하므로, 동일한 취약점 유형이 매주 다른 범주에 들어가게 된다. 해결책은 느낌을 루브릭으로 바꾸는 것이다. 각 레벨에 대해 정확하고 검증 가능한 기준(예: "CRITICAL: 인증 없이 원격으로 악용 가능")을 명시하고, 그 레벨에 정확히 부합하는 짧은 코드 예시를 함께 제시한다. 기준은 모델에게 결정 규칙을 주고, 예시는 산문만으로는 흔히 전달하지 못하는 방식으로 경계를 전달한다. 이것이 바로 Anthropic이 예시를 출력을 조종하는 가장 신뢰할 수 있는 방법 중 하나로 문서화하고, 소수의 관련성 있고 잘 구조화된 예시를(가능하면 <example> 태그로 감싸 지시와 명확히 분리해서) 권장하는 이유다.

이는 Anthropic의 성공 기준에 대한 가이드와도 일치한다. "정확함"은 명세가 아니며, 분류 작업에는 실제와 같은 입력에 대해 경험적으로 테스트할 수 있는 잘 정의된 척도가 필요하다. 모델에게 단계별로 추론하라고 요청하는 것은 숙고를 더할 뿐 결정 규칙을 더하지 않으므로, 정의되지 않은 척도에 대한 신중한 추론은 여전히 불안정하다. 반복되는 finding 유형에 대해 전주의 레이블을 물려받는 방식은 모델이 처음에 만들어낸 결과를 그대로 고정시키고, 새로 등장하는 finding에 대해서는 여전히 일관성이 없다. 척도를 두 단계로 줄이는 것은 티켓에 필요한 라우팅 신호를 없애면서도 남아 있는 경계는 여전히 정의되지 않은 채로 둔다. 레벨을 줄이는 것이 기준을 대체하지는 못한다.

구체적이고 측정 가능한 기준과 예시 기반 프롬프트에 관한 근본적인 가이드는 Prompt engineering overview와 Define your success criteria and develop tests를 참조하라.

### 도메인

Prompt Engineering & Structured Output



## 질문 8

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline reviews each changed file in its own focused pass, and per-file findings are now consistent. However, bugs at module boundaries, such as type mismatches between a caller and the function it invokes, are still missed. What should be added?

**A(정답).** Add a separate integration pass that analyzes cross-file concerns such as data flow and interface contracts.

**설명**

정답이다. 파일별 패스는 설계상 로컬 이슈에 범위가 한정되어 있으므로, 파일 간 결함은 변경된 파일들 간의 상호작용을 살펴보는 것을 명시적 목적으로 하는 전담 패스가 필요하다. 이것이 다중 패스 아키텍처를 완성한다. 파일별 패스는 로컬 깊이를 위한 것이고, 통합 패스는 경계 이슈를 위한 것이다.

**B.** Run each per-file pass twice and promote only findings that appear in both runs to catch missed boundary bugs.

**설명**

이는 틀렸다. 동일한 파일별 범위로 패스를 반복해도 그 범위가 배제하는 이슈는 드러날 수 없다. 호출 경계의 양쪽을 결코 함께 보지 않는 패스는 그 불일치를 매번 놓칠 것이다. 두 실행 간 일치를 요구하는 것 역시 새로운 탐지 능력을 추가하는 것이 아니라 finding을 억누르는 것이다.

**C.** Include the full repository contents in every per-file pass so callers and callees are always reviewed together.

**설명**

이는 틀렸다. 각 패스에 저장소 전체를 쏟아붓는 것은 주의를 집중시키는 것이 아니라 희석시키며, 파일별 패스가 달성한 일관성을 파괴한다. 파일 간 분석에는 관련된 상호작용에 초점을 맞춘 패스가 필요하며, 매 패스마다 최대한의 컨텍스트를 주는 것이 아니다.

**D.** Merge all changed files into a single comprehensive pass so every cross-file interaction is visible at once.

**설명**

이는 틀렸다. 파일별 리뷰를 채택한 이유였던 단일 패스 방식을 다시 도입하는 것이기 때문이다. 여러 파일을 한 번에 분석하면 주의 희석이 발생하여 깊이가 불균등해지고, 버그를 놓치고, 파일 간에 서로 모순되는 finding이 나온다.

### 전반적인 설명

다중 패스 리뷰가 효과적인 이유는 각 패스의 범위가 주의력이 잘 다룰 수 있는 범위에 맞춰져 있기 때문이다. 파일별 패스는 모델에게 작고 집중된 단위를 주고 로컬 이슈만 요청하므로, 깊이와 일관성이 향상된다. 하지만 그와 같은 범위 설정은 모델이 한 컨텍스트 안에서 두 파일 간의 관계를 결코 살펴보지 않는다는 뜻이기도 하다. 그래서 모듈 경계에 존재하는 결함(타입 불일치, 깨진 인터페이스 계약, 공유 데이터에 대한 일관되지 않은 가정)은 구조적으로 모델에게 보이지 않는다. 해결책은 기존 패스 내에서 더 많은 노력을 기울이는 것이 아니라, 파일 간 분석을 명시적 목적으로 하는 두 번째 종류의 패스, 즉 통합 패스를 추가하는 것이다. 이는 변경된 파일들 전체에 걸쳐 데이터 흐름을 추적하고 호출자와 피호출자가 서로 맞는지 확인하는 패스다.

오답들은 시사적인 이유로 틀렸다. 모든 것을 하나의 종합 패스로 다시 합치는 것은 주의 희석이라는 원래의 실패 모드를 재현한다. 여러 파일을 받은 모델이 일부는 깊이 분석하고 일부는 얕게 언급하며, 심지어 파일 간에 서로 모순되기까지 하는 현상이다. 파일별 패스마다 저장소 전체를 채워넣는 것은 같은 실수를 증폭시킨 것이다. 더 많은 컨텍스트가 더 많은 주의를 의미하지는 않으며, 파일별 finding을 신뢰할 수 있게 만들었던 집중된 범위가 사라진다. 파일별 패스를 두 번 실행하고 일치하는 finding만 유지하는 것은 합의 필터다. 이는 패스가 이미 탐지하는 것 안에서 노이즈를 줄일 수 있지만, 그 패스의 범위가 배제하는 것은 탐지할 수 없으며, 커버리지를 추가하기는커녕 오히려 finding을 적극적으로 억누른다.

기억해둘 사고 모델은, 리뷰를 크기가 아니라 관심사에 따라 분해하라는 것이다. 로컬 정확성과 파일 간 통합은 서로 다른 질문이며, 각각은 그에 맞게 형성된 패스가 필요하다. 이는 복잡한 작업을 집중된 순차적 단계로 나누는 prompt chaining의 한 응용이다. 다단계 리뷰 워크플로우를 구성하는 방법은 Claude Code best practices도 참조하라.

### 도메인

Prompt Engineering & Structured Output



## 질문 9

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Validation flags review summaries whose total_findings value does not equal the sum of the per-severity counts. The full diff and all findings were in the original prompt. How should the pipeline handle these failures?

**A.** Retry with a fresh prompt that omits the failed summary and the validation error so the model is not anchored to its earlier mistake.

**설명**

실패한 출력과 오류를 감추는 것은 재시도를 효과적으로 만드는 요소를 정확히 제거하는 것이다. 자신이 무엇을 만들었고 무엇이 잘못되었는지 보지 못하면, 모델은 그 불일치를 다시 반복할 가능성이 그대로 남는다. 오류 피드백이 재시도를 목표가 명확한 수정으로 만들어주는 요소다.

**B(정답).** Retry automatically, sending back the failed summary and the specific count discrepancy, since everything needed to correct it is already in the input.

**설명**

이런 산술적 불일치는 교정 가능하다. 모델은 이미 자신의 집계를 다시 확인하는 데 필요한 모든 정보를 갖고 있기 때문이다. 실패한 출력과 구체적인 불일치를 포함한 재시도는 모델에게 눈을 감고 다시 시도하는 것이 아니라 목표가 명확한 수정 작업을 준다.

**C.** Route these runs straight to human review without retrying, since arithmetic inconsistencies signal that required information is absent from the source.

**설명**

이는 실패를 잘못 분류한 것이다. 재시도는 필요한 정보가 제공된 입력에 없을 때 효과가 없지만, 여기서는 diff와 finding이 모두 프롬프트 안에 있다. 모델은 합계를 다시 세고 맞출 수 있으므로, 사람이 개입하기 전에 자동 재시도가 적절하다.

**D.** Rerun the request unchanged at a lower sampling temperature, since numeric inconsistencies come from randomness rather than correctable output errors.

**설명**

온도를 낮추는 것은 토큰 샘플링을 바꿀 뿐 모델의 산술적 조정 능력을 바꾸지 않는다. 오류 피드백 없이 변경되지 않은 요청은 무엇을 고쳐야 하는지에 대한 신호를 전혀 주지 않으므로, 온도가 0이더라도 같은 불일치가 재발할 수 있다.

### 전반적인 설명

여기서 핵심 판단은 해결책을 고르기 전에 실패를 분류하는 것이다. 오류 피드백을 포함한 재시도는 모델이 수정된 답을 만드는 데 필요한 모든 것을 이미 갖고 있을 때 성공하는 애플리케이션 수준의 검증 패턴이다. 형식 불일치(잘못된 표기법의 날짜), 구조적 오류(잘못된 필드에 들어간 값), 산술적 불일치(부분의 합과 맞지 않는 명시된 총합) 같은 경우가 그렇다. 이런 모든 경우에서 수정은 제공된 입력에서 도출 가능하므로, 원본 자료, 실패한 출력, 구체적인 검증 오류를 포함한 재시도는 모델에게 구체적이고 목표가 명확한 작업을 준다. 이는 Anthropic의 일반적인 프롬프트 작성 가이드가 강조하는 반복적 개선의 원칙과 같다. 재시도가 실패하는 것은 오직 빠진 요소가 애초에 제공된 적 없는 정보일 때뿐이다. 그런 경우 해결책은 다시 프롬프트를 던지는 것이 아니라 원본을 제공하거나 검색하는 것이다.

이는 또한 스키마 강제가 보장하는 것의 경계를 보여준다. 스키마에 맞는 요약도 의미적으로는 틀릴 수 있다. total_findings가 존재하고 타입이 올바르다는 것은 그것이 심각도별 집계와 맞는지에 대해서는 아무것도 말해주지 않는다. 그래서 파이프라인은 구조적 보장에 의미적 검증 계층을 결합하며, 명시된 값과 계산된 값을 함께 추출하는 패턴이 존재하는 이유도 이 때문이다. 이렇게 하면 불일치를 기계가 탐지할 수 있게 되어 재시도 루프에 투입할 수 있다. 스키마 준수가 다루는 것과 다루지 않는 것은 Structured outputs를 참조하라.

다른 접근법들은 각각 이 메커니즘을 깨뜨린다. 즉시 에스컬레이션하는 것은 스스로 교정 가능한 산술 오류를 데이터가 없는 것처럼 취급하여, 자동화가 잘 처리할 수 있는 실패에 사람의 시간을 낭비한다. 오류 없이 새로운 프롬프트를 던지는 것은 재시도를 목표가 명확하게 만드는 피드백을 버리는 것이며, 재시도는 수정이 아니라 도박이 되어버린다. 온도를 낮추는 것은 샘플링 편차를 다룰 뿐 조정 오류 자체를 다루지 않으며, 변경되지 않은 요청은 무엇이 잘못되었는지에 대한 신호를 전혀 전달하지 않는다. 근거가 정말로 없는 경우에는 Reduce hallucinations에 따라 재시도가 아니라 원본 자료를 제공하는 것이 올바른 조치다. 하지만 여기서는 근거가 처음부터 계속 존재했다.

### 도메인

Prompt Engineering & Structured Output



## 질문 10

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The system extracts benchmark timings from PR descriptions into a schema. Authors write durations in diverse informal notations, and your enumerated normalization rules keep missing new variants, so the field returns null. What best handles notations you have not seen yet?

**A.** Add a regex post-processing step that parses timing strings from the raw text whenever the extraction returns null.

**설명**

이는 틀렸다. 정규식 대체 방안도 규칙 목록과 같은 열거 문제를 가지고 있다. 예상한 패턴만 매칭한다는 것이다. 이는 추출 자체를 개선하지 않고 후단에서 증상만 처리하며, 같은 새로운 표기법을 조용히 놓칠 것이다.

**B(정답).** Add few-shot examples mapping informal timing phrases to normalized extractions, letting the model generalize to unseen notations.

**설명**

이것이 정답인 이유는 few-shot 예시가 특정 문자열 형태를 열거하는 것이 아니라 추출-정규화 패턴 자체를 시연하기 때문이다. 모델은 시연된 패턴을 예시에 없는 표기법에도 일반화하며, 이것이 바로 규칙 목록이 다룰 수 없는 실패 모드다.

**C.** Make the timing field required and non-nullable in the JSON schema so a null extraction is rejected as invalid.

**설명**

이는 틀렸다. 스키마를 제약하는 것은 모델에게 익숙하지 않은 표기법을 해석하는 법을 가르치지 않으며, 실패를 정직하게 보고할 방법만 없앨 뿐이다. 모델이 표기법을 파싱할 수 없을 때 null이 아닌 값을 강제하는 것은 조작된 타이밍 값을 부추기며, 이는 탐지 가능한 null보다 더 나쁘다.

**D.** Expand the prompt's normalization rule list to exhaustively enumerate every timing notation observed across the pipeline's historical runs.

**설명**

이는 틀렸다. 실패의 정확한 원인은 새로운 변형이 계속 나타난다는 것인데, 규칙 목록은 이미 본 표기법만 다룰 수 있다. 작성자가 자유롭게 쓴 비정형 문구는 규칙 기반 열거로 앞서가기에는 너무 다양하므로, 다음에 보지 못한 변형이 나오면 null이 계속될 것이다.

### 전반적인 설명

이 상황은 규칙 열거보다 few-shot 프롬프트가 필요한 전형적인 사례다. 산문 규칙과 정규식은 외연적이다. 즉 작성자가 이미 본 문자열 형태만 정확히 다룬다. 사람이 자유롭게 쓴 값(기간, 수량, 자유 텍스트로 쓰인 날짜)은 사실상 끝이 없으므로, 어떤 열거형 목록도 데이터보다 영원히 뒤처진다. few-shot 예시는 다르게 작동한다. 몇 가지 다양한 문구를 올바르게 정규화된 추출값과 함께 보여줌으로써 적용되는 판단 자체를 시연하고, 모델은 예시를 단순히 반복하는 것이 아니라 그 패턴을 한 번도 본 적 없는 표기법에도 일반화한다. 이것이 상세한 지시만으로는 다양한 구조의 문서에서 일관성 없거나 비어 있는 추출이 계속 발생할 때 few-shot 프롬프트가 문서화된 해결책인 이유다.

기억해둘 사고 모델은, 스키마와 필드 제약은 출력의 형태를 규정할 뿐, 모델이 원본을 해석하는 능력을 규정하지 않는다는 것이다. 필드를 필수이면서 널 불가능으로 만드는 것은 해석 능력을 더해주지 않는다. 오히려 null이라는 정직한 답을 없애고 조작된 값을 유도하는데, 이는 정보가 없을 수 있을 때 널 허용 필드가 모범 사례가 되는 이유와 같은 실패다. 마찬가지로 정규식 대체 방안은 열거 문제를 후처리로 옮길 뿐 추출 품질 자체를 고치지 못한다. 진정으로 다른 표기법을 다루는 소수의(3~5개) 관련성 있고 다양한 예시를, 명시하고 싶은 정규화 규칙(예: 초는 항상 정수로 출력)과 함께 짝지어야 한다. 그러면 예시가 일반화를 담당하고 프롬프트는 출력 규칙을 고정한다.

Claude의 동작을 안내하는 예시 사용법(multishot prompting)과 스키마 설계 및 구조화된 추출 가이드는 Structured outputs를 참조하라.

### 도메인

Prompt Engineering & Structured Output



## 질문 11

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Each finding includes a numeric confidence field that a merge gate compares against a 0.7 threshold. Outputs always validate against the JSON schema, but values arrive on mixed scales: 0.85 in one run, 85 in the next. What is the most effective fix?

**A(정답).** State the scale (decimal fraction, 0.0 to 1.0) in the prompt and the field description, and range-check values in code.

**설명**

스키마는 confidence가 숫자라는 것은 강제할 수 있지만, 그 숫자가 어떤 스케일을 써야 하는지는 전달하지 못한다. 프롬프트와 필드 설명에 명시적인 정규화 규칙을 넣으면 모델에게 기대되는 표기 규칙을 알려주게 되고, 클라이언트 측 범위 검사가 남아 있는 이상치를 잡아낸다. 이는 증상을 처리하는 것이 아니라 모호함을 그 원천에서 해결하는 방식이다.

**B.** Post-process each output by dividing any confidence value greater than 1 by 100 before the merge gate evaluates it.

**설명**

이 휴리스틱은 모호함을 고치지 않고 증상만 처리한다. 1.5처럼 실제로 잘못 보정된 값이나, 90을 의미하는 0.9 같은 백분율은 조용히 잘못 처리될 것이다. 후단의 수정 로직은 모델에게 처음부터 기대되는 스케일을 알려주는 것에 비해 취약하다.

**C.** Change the field to a string enum of low, medium, and high so the model cannot emit values on the wrong scale.

**설명**

숫자 필드를 거친 레이블로 바꾸는 것은 병합 게이트의 0.7 임계값이 의존하는 세밀함을 파괴하여, 다운스트림 계약을 다시 설계해야 하게 만든다. 문제는 숫자 타입 자체가 아니라 명시되지 않은 스케일 규칙이다.

**D.** Add minimum: 0 and maximum: 1 constraints to the JSON schema so out-of-range values are rejected during generation.

**설명**

structured outputs는 JSON Schema의 일부 하위 집합만 지원하며, minimum과 maximum 같은 숫자 제약은 지원되지 않는 기능에 속한다. 이를 포함하면 범위를 강제하는 대신 400 오류가 발생할 수 있다. 스케일 규칙은 대신 프롬프트 텍스트와 필드 설명을 통해 전달해야 한다.

### 전반적인 설명

이 실패는 스키마가 보장하는 것과 보장할 수 없는 것 사이의 경계에 정확히 놓여 있다. number 타입을 가진 JSON 스키마는 모든 추출이 문법적으로 유효한 숫자 confidence 값을 담도록 보장하지만, 그 숫자가 어떤 스케일(0에서 1까지의 분수인지 0에서 100까지의 백분율인지)을 사용하는지는 스키마가 표현할 방법이 없는 의미론적 규칙이다. Anthropic의 Structured outputs 문서는 JSON Schema의 일부 하위 집합만 지원된다고 명시하고 있다. minimum, maximum 같은 숫자 제약은 지원되지 않으며, 지원되지 않는 기능은 400 오류를 유발할 수 있다. 따라서 자연스러워 보이는 스키마 수준의 해결책조차 사용할 수 없다. 이 규칙은 프롬프트와 필드 설명을 통해 전달되어야 한다.

올바른 사고 모델은 계층적인 것이다. 제약 디코딩은 구조와 타입을 고정하고, 프롬프트 수준의 정규화 규칙은 표기 규칙(스케일, 단위, 날짜 형식, 표준 식별자)을 고정하며, 애플리케이션 코드는 앞의 두 계층이 보장하지 못하는 것을 검증한다. 도구 정의 가이드도 형식에 민감한 파라미터에 대해 같은 점을 강조한다. 의미, 동작, 기대되는 형식을 설명하는 상세한 설명이 모델을 조종하는 요소이며, 예시가 이를 보강한다. "confidence는 0.0에서 1.0 사이의 십진 분수이며, 0.85는 85%의 확신을 의미한다"와 같은 문장은 모델에게 따라야 할 명확한 규칙을 주고, 파이프라인의 저렴한 범위 검사가 나머지를 잡아낸다.

대안들은 각각 한 계층을 놓친다. 100으로 나누는 후처리는 의도를 추측하며 예외 상황을 조용히 손상시킨다. 숫자를 low/medium/high enum으로 바꾸는 것은 신호 자체를 없애버려서 모호함을 해결한다. 병합 게이트의 숫자 임계값은 더 이상 비교할 대상이 없어진다. 모델이 읽을 수 있는 곳에 규칙을 명시하고 검증으로 보강하는 것만이 다운스트림 계약을 깨뜨리지 않으면서 스케일 혼재 문제를 해결한다.

### 도메인

Prompt Engineering & Structured Output



## 질문 12

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A nightly test-generation batch finishes with most results succeeded, but several hundred entries in the results file carry the result type expired. What should the pipeline do to complete the run?

**A.** Resubmit the full original batch and reconcile duplicates afterward by keeping the earliest result for each custom_id.

**설명**

배치 내 각 요청은 독립적으로 처리되므로, 성공한 요청을 다시 실행할 필요는 없다. 전체를 다시 제출하면 이미 완료된 작업에 대해 다시 비용을 지불하게 되고, 다운스트림에 불필요한 중복 제거 단계를 추가하게 된다.

**B(정답).** Filter the results file for expired entries by custom_id and resubmit only those requests, unchanged, in a new batch.

**설명**

이것이 정답인 이유는 expired가 해당 요청들이 처리를 위해 전송되기 전에 24시간 배치 창이 닫혔다는 뜻이기 때문이다. 요청 본문 자체는 문제가 없다. custom_id가 각 결과를 원본 요청에 연결해주므로, 파이프라인은 expired된 부분만 정확히 골라내어 성공한 요청은 건드리지 않고 그대로 재제출할 수 있다.

**C.** Keep polling the original batch, since expired requests stay queued and are processed automatically in a later window.

**설명**

배치가 만료 시점에 도달하면 전송되지 않은 요청은 expired 결과 유형으로 확정되며 그 배치 안에서 다시는 처리되지 않는다. 자동 재시도 메커니즘은 없으므로 클라이언트가 새 배치로 다시 제출해야 한다.

**D.** Rewrite the request bodies of the expired entries before resubmitting, since expiration signals the requests were malformed.

**설명**

만료는 요청 내용에 문제가 있다는 신호가 아니다. 이는 단지 요청이 전송되기 전에 24시간 처리 창이 지나버렸다는 뜻일 뿐이다. 형식이 잘못된 내용은 invalid_request_error와 함께 errored 결과로 나타나며, 이는 재제출 전에 수정이 필요한 다른 결과 유형이다.

### 전반적인 설명

Message Batch의 모든 요청은 네 가지 결과 유형(succeeded, errored, canceled, expired) 중 하나로 귀결된다. 이 구분은 각 유형이 서로 다른 복구 조치를 요구하기 때문에 운영상 중요하다. expired는 구체적으로 그 요청이 모델에 전송되기도 전에 배치가 24시간 처리 창에 도달했다는 뜻이다. 요청 자체에는 아무 문제가 없었고, 단지 실행되지 않았을 뿐이다. 따라서 올바른 복구는 기계적이다. custom_id로 expired된 항목을 식별하고, 그 요청들만 수정 없이 새 배치로 재제출하는 것이다. Anthropic은 또한 errored, canceled, expired 요청에는 과금되지 않는다고 문서화하고 있으므로, 재시도는 실제로 다시 해야 하는 작업에 대해서만 비용을 지불한다.

기억해야 할 사고 모델은, 배치는 전부 성공 또는 전부 실패의 트랜잭션이 아니라는 것이다. 요청은 독립적으로 처리되므로, 일부 요청의 실패나 만료가 다른 요청의 결과를 무효화하지 않는다. 이것이 바로 custom_id가 연관 키로 존재하는 이유다. 결과는 제출 순서를 따른다는 보장이 없는 .jsonl 스트림으로 도착하므로, 결과와 원본 문서 사이의 모든 매핑은 위치가 아니라 custom_id를 통해 이루어진다.

이것을 errored 유형과 대조해보면, 그 경우에는 처리 방식이 오류 종류에 따라 갈린다. invalid_request_error는 재전송 전에 요청 본문을 고쳐야 한다는 뜻이고(예: 컨텍스트 한도를 초과한 문서를 청크로 나누기), 서버 오류는 바로 재시도할 수 있다. expired된 요청 본문을 다시 작성하는 것은 이 두 범주를 혼동하는 것이다. 배치 전체를 재제출하는 것은 독립성 보장을 버리고 이미 완료된 작업을 다시 처리하는 것이며, 원본 배치를 계속 기다리는 것은 확정(finalization)을 잘못 이해한 것이다. expired된 요청은 그 배치 안에서 최종 상태이며 나중에 다시 처리되지 않는다. Batch processing과 Retrieving Message Batch results를 참조하라.

### 도메인

Prompt Engineering & Structured Output



## 질문 13

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Engineers trigger test-case generation on demand from a pull request comment and expect results within a few minutes. A teammate proposes moving this workload to the Message Batches API for the 50% savings. What should you do?

**A.** Move it to the Batch API and split each generation request into several smaller batch requests so processing completes faster.

**설명**

요청을 더 작은 배치 요청으로 나눈다고 완료 시간이 빨라지지는 않는다. 24시간 창과 지연 시간 SLA가 없다는 점은 배치 크기와 무관하게 적용된다. 이 워크로드는 여전히 비동기 처리에 적합하지 않다.

**B.** Move it to the Batch API and poll aggressively for completion, since small batches submitted during work hours typically finish within minutes.

**설명**

폴링 빈도는 처리 시간을 바꾸지 않으며, 어떤 시간대나 어떤 배치 크기에서도 배치가 빠르게 완료된다는 보장은 없다. 요청은 여전히 몇 시간이 걸릴 수 있어 엔지니어가 계속 대기하게 될 수 있다.

**C(정답).** Keep this workload on synchronous calls because engineers wait for the results and batch processing carries no latency guarantee.

**설명**

정답이다. 요청 시점에 실행되는 테스트 생성은 차단형(blocking) 워크로드다. 엔지니어가 실제로 출력을 기다리고 있는데, Message Batches API는 지연 시간 SLA 없이 최대 24시간이 걸릴 수 있으므로, 이 경우에는 할인을 안전하게 취할 수 없다.

**D.** Move it to the Batch API with a synchronous fallback that re-runs any request still unfinished after ten minutes.

**설명**

폴백 재실행은 배치가 느릴 때마다 같은 작업에 대해 두 번 비용을 지불하게 되어, 이 이전을 통해 얻으려던 절감 효과를 갉아먹는다. 또한 복잡성을 더하면서도 느린 요청마다 폴백 대기 시간만큼 엔지니어를 여전히 지연시킨다.

### 전반적인 설명

Message Batches API는 지연 시간을 비용과 교환한다. 지연 시간 SLA 보장 없이 최대 24시간이 걸릴 수 있는 비동기 처리를 받는 대신 50% 할인을 얻는다. 이 트레이드오프가 결정 규칙의 전부다. 올바른 사고 모델은 각 워크로드를 차단형(사람이나 파이프라인의 게이트가 결과를 기다리고 있음)과 비차단형(결과가 나중에 소비됨, 예를 들어 야간 리포트나 주간 감사)으로 분류하는 것이다. 차단형 워크로드는 동기 API에 두고, 비차단형 워크로드는 배치의 후보가 된다.

개발자가 트리거하는 테스트 생성은 백그라운드 작업처럼 들리지만 실제로는 차단형이다. 명령을 입력한 엔지니어는 다음 단계로 넘어가기 전에 제안된 테스트를 보기 위해 기다리고 있다. 배치 완료 시간은 그 창 안에서 상한이 없기 때문에, 아무리 적극적으로 폴링하거나, 업무 시간 외에 제출하거나, 더 작은 배치 요청으로 나눈다 해도 지연 시간을 예측 가능하게 만들지 못한다. 이러한 전술들은 작업을 관찰하거나 포장하는 방식을 바꿀 뿐, 서비스가 얼마나 빨리 처리하는지는 바꾸지 못한다. 타임아웃 후 동기 폴백은 특히 비용이 큰 안티패턴이다. 배치가 느릴 때마다 같은 요청에 대해 두 번 비용을 지불하게 되어 절감 효과를 무효화하고 새로운 실패 모드를 추가한다.

이 파이프라인에서 배치가 실제로 적합한 곳은 예약되고 지연에 관용적인 분석이다. 최근 변경된 모듈에 대한 야간 테스트 생성, 주간 보안 감사, 야간 기술 부채 리포트 같은 경우다. 이런 워크로드는 마감 기한이 몇 시간 단위로 여유가 있으므로 24시간 창이 허용 가능하고 할인도 실제로 의미가 있다. API의 보장과 한계는 Batch processing을 참조하라.

### 도메인

Prompt Engineering & Structured Output



## 질문 14

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The team plans an overnight Message Batches API run that generates review findings for 8,000 legacy files. Reprocessing poor results would be costly. What should happen before the full batch is submitted?

**A(정답).** Iterate the prompt on a representative sample that includes edge cases, refining until outputs consistently pass validation.

**설명**

이는 문서화된 접근법이다. 대규모 처리에 나서기 전에, 엣지 케이스를 포함하여 실제 분포를 반영하는 작은 샘플에 대해 프롬프트를 개선하는 것이다. 문제를 몇 개의 파일에서 저렴하게 찾아 고치는 것이지, 8,000번 비용을 지불하며 찾는 것이 아니다.

**B.** Submit the full batch, then use custom_id to identify failed requests and resubmit only those with a corrected prompt.

**설명**

custom_id 연관은 배치가 만들어내는 잔여 실패를 처리하는 올바른 도구이지만, 이는 사후 대응적인 방법이다. 이를 주된 전략으로 쓰는 것은 검증되지 않은 프롬프트로 전체 실행 비용을 지불하는 것이며, 품질 문제는 종종 성공했지만 틀린 결과로 돌아오는데, 이는 custom_id만으로는 드러나지 않는다.

**C.** Verify the prompt works on a few of the simplest files first, since success there confirms it will generalize to the rest.

**설명**

쉬운 케이스만 테스트하면 잘못된 확신을 준다. 재제출을 요구하게 되는 실패는 특이한 형식, 과도하게 큰 파일, 모호한 내용 같은 엣지 케이스에서 나온다. 샘플은 가장 쉬운 부분만이 아니라 입력의 실제 분포를 반영해야 한다.

**D.** Submit the full batch immediately and rely on retry-with-error-feedback loops to fix any outputs failing validation.

**설명**

오류 피드백을 포함한 재시도는 항목별 수정 메커니즘이지, 견고한 프롬프트를 대체할 수는 없다. 체계적인 프롬프트 결함은 8,000개 파일 대부분에서 실패를 만들어낼 것이며, 그 결함은 미리 샘플에서 잡아낼 수 있었던 것을 비용과 지연으로 곱해서 키운다.

### 전반적인 설명

배치 처리는 프롬프트 실수의 경제성을 바꾼다. 동기 API에서는 결함이 있는 프롬프트가 다음 응답에서 바로 드러나므로 즉시 고칠 수 있다. Message Batches API에서는 제출이 완료되는 데 최대 24시간이 걸릴 수 있고, 진행 중에 프롬프트를 조정할 방법이 없으며, 배치 안의 모든 요청은 출력이 유용한지 여부와 관계없이 과금된다. 따라서 체계적인 프롬프트 결함은 잘못된 응답 하나의 비용이 아니라, 8,000개의 비용과 하루치 지연을 합친 비용이 든다. 합리적인 워크플로우는 미리 소량의 동기적 반복 개선을 하는 것이다. 대표성 있는 샘플을 뽑아 프롬프트를 실행하고, 출력을 검증하고, 개선한 다음, 그 뒤에야 대규모로 제출하는 것이다.

샘플을 유용하게 만드는 것은 프로덕션 트래픽을 반영한다는 점이다. Anthropic의 평가 가이드는 실제 세계의 분포를 포괄하고 엣지 케이스를 의도적으로 포함해야 한다고 강조한다. 형식이 잘못되었거나 특이한 입력, 지나치게 긴 내용, 모호한 경우 등이다. 레거시 코드베이스에서는 이러한 엣지 케이스(생성된 파일, 관례를 벗어난 형식, 컨텍스트 한도에 가까운 거대한 파일)가 정확히 배치 실행이 실패하거나 품질이 떨어지는 지점이다. 가장 단순한 파일만으로 구성된 샘플은 실제로 재제출을 유발하는 입력에 대해서는 아무것도 검증하지 못한다.

두 가지 사후 대응 전략은 대안이 아니라 상호 보완적인 방법이다. custom_id 연관은 잘 검증된 배치에서도 여전히 발생하는 잔여 실패를 처리하는 정확한 방법이다. 실패한 요청을 식별하고, 구체적인 원인(예: 지나치게 큰 파일을 청크로 나누기)을 고친 다음, 그 하위 집합만 재제출하는 것이다. 오류 피드백을 포함한 재시도도 마찬가지로 개별 검증 실패를 수정한다. 둘 다 전체 코퍼스에 대해 잘못된 프롬프트 문제는 다루지 못하며, 나쁜 프롬프트는 흔히 낮은 품질의 finding을 담은 성공 요청으로 돌아오는데, 이는 어떤 실패 상태 메커니즘으로도 드러나지 않는다. 샘플을 먼저 개선하는 방식이 바로 이런 메커니즘들이 예외를 다루는 데 쓰이도록, 즉 일반적인 상황이 아니라 예외적인 경우에만 쓰이도록 유지해준다.

Create strong empirical evaluations, Prompt engineering overview, Message Batches를 참조하라.

### 도메인

Prompt Engineering & Structured Output



## 질문 15

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A single-pass review of a 16-file pull request flags a pattern as a bug in one file yet approves identical code in another, even though the entire PR fits within the context window. Which change addresses the root cause?

**A.** Add a prompt instruction requiring the model to apply identical judgment to identical patterns across all files.

**설명**

모델이 일관성 없이 판단하기로 선택한 것이 아니다. 16개 파일에 걸쳐 주의가 너무 얇게 퍼져서 균일한 깊이를 유지할 수 없는 것이다. 지시로는 구조적인 과부하를 보완할 수 없으므로, 모순된 finding은 그대로 남는다.

**B.** Run the full-PR review three times and report only findings that appear in a majority of the runs.

**설명**

희석된 패스를 반복해서 다수결로 판단하면, 어느 한 번의 불일치하는 실행이 우연히 놓친 실제 버그가 억제되며 비용은 3배가 된다. 이는 애초에 불일치를 만들어내는 주의 희석을 고치지 않고 통계적으로 노이즈를 걸러낼 뿐이다.

**C.** Switch to a model with a larger context window, since contradictory findings indicate the files are being truncated before review.

**설명**

문제 설명에는 이미 전체 PR이 컨텍스트 윈도우 안에 들어간다고 명시되어 있으므로, 잘림(truncation)은 일어나지 않고 있다. 한 번의 넓은 패스에서 저하되는 것은 원시적인 컨텍스트 용량이 아니라 여러 파일에 걸친 주의의 질이며, 더 큰 윈도우가 이를 복원하지 못한다.

**D(정답).** Restructure into focused per-file passes, since attention dilution rather than context capacity causes the inconsistency.

**설명**

한 패스 안에서 동일한 코드에 대해 모순된 finding이 나오는 것은 주의 희석의 증상이다. 모델이 여러 파일을 한꺼번에 처리하면 분석 깊이가 파일마다 달라진다. 파일별 리뷰 패스는 각 파일에 일관되고 집중된 주의를 주며, 이는 이 실패 모드에 대한 구조적인 해결책이다.

### 전반적인 설명

리뷰 패스가 여러 파일을 한꺼번에 다룰 때 나타나는 실패 모드는 주의 희석이다. 일부 파일은 깊이 있게 분석되고 다른 파일은 얕게 다뤄지며, 명백한 버그를 놓치고, 같은 응답 안에서도 같은 패턴이 서로 다른 파일에서 다르게 판단된다. 이 상황에서의 결정적인 진단은 PR이 이미 컨텍스트 윈도우에 들어간다는 점이며, 따라서 문제는 용량이 아니라 크고 이질적인 입력에 걸쳐 주의가 어떻게 분배되는가이다.

효과적인 사고 모델은, 컨텍스트 윈도우 크기는 모델이 볼 수 있는 것의 한계를 정하고, 작업 분해는 모델이 본 것에 대해 얼마나 잘 추론하는지를 좌우한다는 것이다. 해결책은 다중 패스 리뷰다. 파일마다 로컬 이슈에 집중된 패스를 실행하여 모든 파일이 일관된 깊이를 얻도록 하고, 그 뒤에 파일 간 문제를 위한 별도의 통합 패스를 진행한다. 이는 복잡한 프롬프트를 체이닝하는 것과 같은 원리다. 집중된 각 단계가 하나의 방만한 단계보다 더 잘 수행된다.

대안들은 모두 그 메커니즘을 놓친다. 더 큰 컨텍스트를 가진 모델은 이 시나리오에 없는 잘림 문제를 해결하는 것이다. 이미 다 들어가는 내용에 대해 더 많은 공간이 주의를 더 선명하게 만들어주지는 않는다. 세 번의 희석된 실행에 대한 다수결은 어느 한 번의 실행이 놓치는 진짜 finding을 버리는 값비싼 노이즈 필터링이다. 그리고 "일관되게 판단하라"는 프롬프트 지시는 원하는 결과의 이름을 붙일 뿐, 그것을 가로막는 과부하된 구조를 바꾸지는 못한다. 입력 자체가 한 패스가 균일하게 분석할 수 있는 범위를 넘어설 때는 지시가 분해를 대체할 수 없다.

### 도메인

Prompt Engineering & Structured Output



