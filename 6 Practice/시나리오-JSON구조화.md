# 시나리오-JSON구조화

JSON 또는 구조화된 입출력과 관련된 문제 모음. 각 도메인 폴더의 시나리오*.md에서 추출 (Test*.md 제외).

추출 기준: QUESTION/보기/설명/전반적인 설명에 json, 구조화된 입출력, 구조화된 출력, 구조화된 데이터, structured output 키워드 포함 (SCENARIO 상용구는 검사 대상에서 제외)

### 출처: Agentic Architecture & Orchestration/시나리오4_데이터추출.md
## 질문 2

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The coordinator delegates section-level extraction to subagents and an assembly agent produces the final JSON. Outputs are always schema-valid, yet nullable fields are frequently null even though the source document contains those values. Which orchestration change fixes this?

**A.** Run every extraction subagent twice on each document and merge the two result sets, keeping whichever pass returned a non-null value for each output field.

**설명**

무작정 중복 실행하면 첫 번째 패스에 누락이 있었는지 여부와 무관하게 모든 문서에서 비용이 두 배가 되며, 두 번째 패스도 특정 누락 필드를 겨냥하지 않는다. 누락 탐지(gap detection) 없이는 반복 실행이 첫 번째 실행에서 놓친 부분을 실제로 찾아낸다는 보장도, 언제 멈춰야 하는지에 대한 신호도 없다.

**B(정답).** Have the coordinator detect null fields in the assembled output, re-delegate targeted extraction for them, and re-assemble until coverage is sufficient.

**설명**

이는 반복적 정제 루프(iterative refinement loop)를 구현한 것이다. 코디네이터가 조립된 결과를 커버리지 기준과 비교 평가하고, 비어 있는 필드에 대해서만 집중적인 후속 추출을 위임한 뒤, 출력이 기준을 충족할 때까지 조립을 다시 실행한다. 단순히 결함을 기록만 하는 것이 아니라 실제로 격차를 복구하며, 첫 번째 패스가 부족했던 부분에 노력을 집중시킨다.

**C.** Append a completeness score and a list of missing fields to each output so downstream consumers know which values were not captured.

**설명**

이는 결함을 측정만 하고 그대로 내보내는 방식이다. 복구 루프 없는 탐지는 널 값을 그대로 남겨두며, 원본 문서나 추출 서브에이전트에 접근할 수 없는 다운스트림 시스템에 시정 부담을 떠넘긴다.

**D.** Change the schema to mark the frequently null fields as required so the extraction subagents are forced to populate them on the first pass.

**설명**

필드를 필수(required)로 지정한다고 해서 근본 데이터를 더 쉽게 찾을 수 있게 되는 것은 아니다. 오히려 모델이 누락을 정직하게 보고할 방법을 없애는 셈이다. 필드가 필수인데 추출기가 값을 찾지 못했다면, 가능성이 높은 결과는 여전히 스키마를 통과하는 조작된 값이며, 이는 널 값보다 더 나쁘다.

### 전반적인 설명

이 문제가 검증하는 패턴은 반복적 정제 루프(때로는 evaluator-optimizer라고도 불린다)이다. 코디네이터는 처음 조립된 출력을 최종본으로 취급하지 않고, 명시적인 품질 기준에 대비해 평가한 뒤, 부족했던 부분에 대해 표적화된 작업을 재위임하고, 기준이 충족될 때까지 조립 단계를 다시 호출한다. 핵심 요소는 검증 가능한 '충분히 좋음'의 정의(여기서는 원본에 실제로 값이 있을 때 nullable 필드가 채워져 있어야 한다는 것), 출력을 그 정의와 비교하는 누락 탐지 단계, 그리고 후속 패스가 전체를 다시 하지 않고 구체적인 누락만을 공격하도록 하는 표적화된 재위임이다.

여기서의 사고 모델은 스키마 검증과 추출 커버리지가 서로 직교(orthogonal)한다는 것이다. JSON 스키마는 형태를 보장한다. 중괄호가 닫히고, 필수 필드가 존재하며, 타입이 일치한다. 하지만 nullable 필드가 실제로 값을 가져야 했는지에 대해서는 아무것도 말해주지 않는다. 그래서 이 시스템의 실패는 검증 과정에서는 보이지 않으며, 코디네이터가 직접 실행하는 평가 단계에서 잡아내야 한다. 서브에이전트가 격리된 컨텍스트에서 동작하기 때문에, 코디네이터만이 섹션 간 조립된 결과를 비교하고 해당 패스에 필요한 문서 컨텍스트를 담아 후속 추출을 위임할 수 있는 위치에 있다.

각 대안은 특징적인 방식으로 무너진다. 필드를 필수로 지정해 스키마를 더 엄격하게 만드는 것은 이미 알려진 안티패턴이다. 필드는 실제로 항상 존재하는 경우에만 필수로 지정해야 한다. 그렇지 않으면 모델은 스키마를 만족시키기 위해 값을 지어내는 경향을 보이며, 이는 탐지 가능한 널 값을 자신 있는 오답으로 바꿔버린다. 모든 서브에이전트를 두 번 실행하는 것은 무작정 중복이다. 누락이 없던 문서에도 두 배의 비용을 치르면서, 실제로 누락이 있던 필드는 전혀 겨냥하지 않는다. 완전성 리포트를 덧붙이는 것은 복구 없는 탐지이다. 관찰 가능성(observability) 자체는 가치가 있지만, 최종적으로 전달되는 출력 자체는 전혀 바뀌지 않는다.

evaluator-optimizer 워크플로에 대한 Anthropic의 가이드는 Building Effective Agents를, 코디네이터-서브에이전트 컨텍스트에 대해서는 Create custom subagents를 참고하라.

### 출처: Agentic Architecture & Orchestration/시나리오4_데이터추출.md
## 질문 5

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : Compliance mandates that national ID numbers, all of which match your team's validated regex detector, must never appear in extraction output sent downstream. System prompt instructions to omit them still leak occasionally in testing. Which design guarantees compliance?

**A.** Set sampling temperature to zero so the model applies the omission instruction identically on every extraction run.

**설명**

온도(temperature)를 0으로 설정하면 토큰 선택이 결정론적이 되지만, 지시가 반드시 지켜지는 것은 아니다. 모델이 가장 가능성 높은 출력으로 ID 번호를 포함하기로 정했다면, 그 유출은 매번 동일하게 재현될 것이다. 컴플라이언스 요구사항은 샘플링 문제가 아니다.

**B(정답).** Run the validated detector in code on the final extraction JSON, stripping any matches before the output is sent downstream.

**설명**

이 보기가 정답이다. 코드 수준의 검사는 매 실행마다 실행되며, 요구사항이 규제하는 대상, 즉 다운스트림으로 전송되는 출력 자체를 정확히 스캔한다. 문제 지문에서 모든 규제 대상 ID가 검증된 탐지기와 일치한다고 명시했으므로, 이 스캔은 전수적이고 결정론적이다. 따라서 ID가 어디서 들어왔든, 모델이 무엇을 생성했든 관계없이 경계를 통과할 수 없다.

**C.** Add a prompt-based hook that has a small Claude model review each extraction result and reject any output containing ID numbers.

**설명**

프롬프트 기반 훅은 모델이 판단을 내리도록 하는 방식이며, 본질적으로 확률적이다. 검토를 담당하는 모델도 추출 모델이 ID를 유출할 수 있는 것과 마찬가지로 ID를 놓칠 수 있다. Anthropic은 프롬프트 훅을 판단이 필요한 결정에 사용하도록 권장하며, 매번 반드시 지켜져야 하는 규칙에는 적합하지 않다고 명시한다.

**D.** Restate the redaction rule prominently in the system prompt and exclude ID number fields from the extraction JSON schema.

**설명**

시스템 프롬프트 지시는 확률적인 준수만을 제공하며, 이는 시나리오에서 이미 실패하고 있다는 것으로 드러난다. JSON 스키마는 pattern과 같은 검증기를 사용해 문자열 내용을 제약할 수 있지만, ID 필드를 단순히 제외하는 것만으로는 스키마가 허용하는 다른 자유 텍스트 필드 안에 ID 번호가 나타나는 것을 막을 수 없다.

### 전반적인 설명

이 문제가 검증하는 경계선은 결정론적 강제(deterministic enforcement)와 확률적 준수(probabilistic compliance) 사이의 구분이다. 시스템 프롬프트, 스키마 설명, 검토 모델의 평가 기준 등 모델에게 지시로 표현된 것은 무엇이든 높은 확률로는 지켜지지만 완벽하게 지켜지지는 않는다. 규제상의 결과가 걸려 있는 규칙이라면, 강제는 모델의 결정과 무관하게 매 실행마다 동작하는 코드에 존재해야 한다. 훅과 코드 수준의 게이트가 바로 이러한 보장을 제공하기 위해 존재한다. Claude Code 훅 가이드는 훅을 모델이 선택하도록 맡기는 대신 특정 동작이 실제로 일어나도록 보장하는 결정론적 통제로 설명한다.

강제 지점의 위치도 결정론만큼 중요하다. 이 요구사항은 출력 경계를 규제하므로, 강제 지점도 그곳에 있어야 한다. 최종 추출 JSON에 대해 검증된 탐지기를 실행하는 코드 검사는, ID가 도구 결과를 통해 들어왔든, 원본 문서를 통해 들어왔든, 모델 자체의 생성 과정에서 나왔든 관계없이 출력으로 들어가는 모든 경로를 커버한다. 도구 결과에 대한 PostToolUse 훅과 같은 입력 측 변환도 유용하지만, 그것은 그 한 채널을 통해 흐르는 데이터의 깨끗함만을 보장할 뿐, 그것만으로 시스템을 떠나는 것 전체를 인증할 수는 없다. 지문에서 모든 규제 대상 ID가 탐지기와 일치한다고 명시했으므로, 출력 아티팩트를 스캔하면 삭제(redaction) 작업이 전수적이 되어 확률적 지시를 확실한 게이트로 전환시킨다.

오답들은 각각 결정론이라는 축에서 실패한다. 프롬프트 훅은 강제 경로에 다시 모델의 판단을 끌어들인다. 훅 관련 문서는 Claude 모델을 이용해 단일 턴 평가를 수행하는 prompt 핸들러와, 코드를 실행하는 command 핸들러를 구분하며, Anthropic은 프로덕션 강제에는 후자를 권장한다. ID 필드를 스키마에서 제외한다고 해서 summary나 notes 같은 허용된 자유 텍스트 필드 안에 ID가 나타나는 것을 막지는 못한다. pattern과 같은 검증기가 적용된 경우 JSON Schema가 문자열 내용을 제약할 수 있다는 사실과는 별개의 문제이다. 그리고 온도를 0으로 설정하는 것은 샘플링에서 무작위성만 제거할 뿐이다. ID 번호를 포함하기로 결정한 결정론적 모델은 매번 그 번호를 포함할 것이다.

### 출처: Agentic Architecture & Orchestration/시나리오4_데이터추출.md
## 질문 9

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The coordinator delegates each document to an extraction subagent with a fixed script: locate the header, read the summary table, then extract line items. Documents with nonstandard layouts consistently fail. How should the delegation prompts be redesigned?

**A.** Extend the delegation script with additional branching instructions that explicitly cover each newly encountered nonstandard layout variation.

**설명**

이 보기는 옳지 않다. 레이아웃을 하나씩 열거하는 것은 이길 수 없는 경쟁이다. 실제 문서들은 스크립트가 예상하지 못한 변형을 계속해서 만들어낼 것이다. 새로운 분기가 추가될수록 프롬프트는 길어지고 따라가기 어려워지지만, 근본적인 취약성은 결코 사라지지 않는다.

**B(정답).** Specify the extraction goal and what a schema-valid result must contain, letting the subagent choose how to work through each document.

**설명**

이 보기가 정답이다. 성공을 정의(목표와 완전하고 스키마에 유효한 결과를 포함하는 품질 기준)하면서, 방법은 서브에이전트에게 맡긴다. 서브에이전트는 만나는 레이아웃에 맞춰 탐색 방식을 조정할 수 있다. Anthropic의 프롬프팅 가이드는 순서가 필수적이지 않은 경우 단계를 규정하기보다는 결과를 기술하고 모델이 자신의 작업을 검증할 방법을 제공하는 쪽을 선호한다.

**C.** Send only the document and the target schema name, omitting quality criteria so nothing constrains the subagent's chosen approach.

**설명**

이 보기는 옳지 않다. 품질 기준을 제거하면 경직된 스크립트와 함께 성공적인 결과의 정의 자체도 함께 사라진다. 스키마 유효성이나 필드 완전성 같은 명시된 기준이 없으면, 서브에이전트는 자신의 추출이 완료되었는지 적절한지 판단할 방법이 없다.

**D.** Have subagents return nonstandard documents to the coordinator, which composes a tailored step sequence for each one individually.

**설명**

이 보기는 옳지 않다. 이 방식은 특이한 문서마다 코디네이터로의 왕복을 발생시켜 지연을 추가하고, 적응성을 잘못된 위치로 옮긴다. 문서를 처리하는 서브에이전트가 적응하기에 적합한 위치에 있는 구성요소이다. 코디네이터는 성공을 정의해야 하며, 문서마다 맞춤 절차를 작성해서는 안 된다.

### 전반적인 설명

이 문제는 코디네이터 프롬프트 설계의 핵심 원칙을 검증한다. 절차가 아니라 성공을 정의하라는 것이다. 코디네이터-서브에이전트 아키텍처에서 각 서브에이전트는 자신만의 격리된 컨텍스트에서 실행되며, 코디네이터의 대화 히스토리나 이전 도구 결과를 자동으로 물려받지 않는다. 서브에이전트는 AgentDefinition의 시스템 프롬프트처럼 자체적으로 구성된 지시사항을 가질 수 있지만, 작업별 콘텐츠(연구나 추출 목표, 필요한 컨텍스트, 품질 기준)는 위임 프롬프트 자체에 포함되어야 한다. 위임된 작업이 경직된 절차적 스크립트로 작성되면, 눈앞의 문서에 대해 추론할 수 있는 서브에이전트의 능력이 낭비된다. 문서를 보기도 전에 작성된 경로를 강제로 따라가게 되기 때문이다. 결정론적 파서 대신 에이전트를 추출에 사용하는 이유 자체가 문서가 다양하기 때문이다. 위임 프롬프트는 목표(이 문서에서 이 필드들을 추출하라)와 품질 기준(출력이 JSON 스키마를 검증하며, 필수 필드가 채워져 있고, 값이 원본 텍스트에 근거하고 있다)을 명시하고 서브에이전트가 헤더, 표, 특이한 레이아웃을 어떻게 탐색할지 스스로 결정하도록 함으로써 그 적응성을 보존해야 한다.

Anthropic의 프롬프팅 가이드는 이를 명시적으로 설명한다. 단계가 아니라 결과를 기술하고, 모델에게 자신의 작업을 확인할 방법을 제공하며, 순서나 완전성이 실제로 중요한 경우에만 경직된 번호 매기기 시퀀스를 사용하라는 것이다. 품질 기준은 서브에이전트의 자기 검증 목표로 작동하며, 이것이 바로 목표 지향적 프롬프트를 단순히 허용적인 것을 넘어 신뢰할 수 있게 만드는 요소이다. 한 보기처럼 기준을 완전히 없애버리면 '완료'의 정의 자체가 사라져 불완전하거나 검증되지 않은 출력을 초래한다. 스크립트를 더 많은 레이아웃을 커버하도록 확장하는 것은 취약성을 더 깊게 만들 뿐이며, 특이한 문서를 코디네이터로 돌려보내 맞춤 스크립트를 작성하게 하는 것은 동일한 절차적 경직성을 위치만 옮기면서 왕복까지 추가하는 셈이다.

서브에이전트가 무엇을 물려받는지와 위임 프롬프트가 왜 작업별 컨텍스트를 담아야 하는지는 SDK의 Subagents 문서를, 단계별 절차 대신 결과와 측정 가능한 목표를 기술하는 방법에 대해서는 Claude Code의 프롬프트 가이드를 참고하라.

### 출처: Claude Code Configuration & Workflows/시나리오1_CICD.md
## 질문 7

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The review job runs claude -p with --output-format json and --json-schema. Occasionally a run finishes with subtype success, yet the parsed envelope contains no structured_output, and the comment-posting step crashes. How should the pipeline handle these runs?

**A(정답).** Require both a success subtype and a present structured_output field before posting, and route other runs to a failure path.

**설명**

Anthropic 문서에 따르면 결과가 success 서브타입으로 끝나면서도 structured_output이 없을 수 있으므로, 견고한 자동화라면 두 조건을 모두 확인해야 한다. 이 필드가 없는 실행은 게시 단계로 넘기지 말고 실패로 처리하거나 재시도하거나 건너뛰어야 한다.

**B.** Add an instruction to the prompt telling Claude to always populate the structured_output field so it is never omitted.

**설명**

structured_output 필드는 프롬프트 수준 지침이 아니라 CLI의 검증 기계장치에 의해 채워지며, 검증은 재시도 횟수를 다 써버리고 데이터 대신 오류를 낼 수도 있다. 프롬프트 지침으로는 이 실패 모드를 없앨 수 없으므로 파이프라인에는 여전히 가드가 필요하다.

**C.** Fall back to regex-extracting findings from the result text field whenever the envelope's structured_output is missing.

**설명**

result 필드의 텍스트를 긁어오는 것은 스키마로 검증된 출력이라는 취지를 무너뜨리고, --json-schema가 애초에 제거하려는 취약성을 다시 끌어들인다. result의 텍스트는 스키마에 대해 검증된 것이 아니므로, 파싱된 결과가 형식이 잘못되거나 불완전할 수 있다.

**D.** Rely on the process exit code, since a zero exit guarantees the envelope contains a schema-valid structured_output payload.

**설명**

종료 코드는 호출 자체가 성공했는지를 알려줄 뿐, 구조화된 출력이 생성되었는지는 알려주지 않는다. 문서화된 동작은 정확히 실행이 structured_output 없이도 성공을 보고할 수 있다는 것이므로, 종료 상태만으로는 해당 필드의 존재를 보장할 수 없다.

### 전반적인 설명

Claude Code가 --output-format json과 --json-schema로 실행될 때, CLI는 모델의 최종 출력을 제공된 스키마에 대해 검증하고 불일치 시 다시 프롬프트한다. 이 검증 루프에는 제한된 재시도 예산이 있다. 그 한도 안에서 스키마에 맞는 출력이 생성되지 않으면, 실행은 사용 가능한 데이터 대신 실패 서브타입 error_max_structured_output_retries로 끝난다. 이와 별도로 Anthropic 문서는 결과가 success 서브타입을 가지면서도 structured_output을 완전히 생략할 수 있다고 명시한다. 여기서 가져야 할 사고 모델은, 스키마 강제가 보장이 아니라 명시적인 실패 채널을 가진 최선의 노력(best-effort) 메커니즘이라는 것이다. 이를 소비하는 자동화라면 반드시 가드 절이 필요하다.

인라인 PR 댓글을 게시하는 CI 파이프라인의 경우, 올바른 계약은 따라서 연결 조건(conjunctive)이어야 한다. 실행이 성공했고 structured_output 필드가 존재할 때만 진행하고, 그 외 모든 경우는 재시도나 실패 경로로 보내야 한다. 이렇게 하면 형식이 잘못되었거나 없는 발견 사항이 게시 단계에 도달하지 않고, 실패가 조용히 묻히지 않고 관찰 가능해진다. result 텍스트에 대한 정규식 대체는 이 플래그가 제공하는 검증 보장을 저버리는 것이다. 0 종료 코드를 믿는 것은 잘못된 신호를 확인하는 것인데, 성공과 구조화된 출력은 문서상 서로 분리될 수 있다고 명시되어 있기 때문이다. 그리고 프롬프트 지침으로는 검증 계층 자체가 생성하며 생성하지 않을 수도 있는 필드를 강제할 수 없다.

문서화된 엔벨로프 필드와 실패 서브타입은 Structured outputs와 Headless mode를 참고하라.

### 출처: Claude Code Configuration & Workflows/시나리오1_CICD.md
## 질문 10

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : An engineer on this team is trialing stricter draft review criteria before proposing them for the pipeline. The criteria must load only in this repository and must never reach teammates through version control. Where should the criteria live?

**A.** Put them in the project CLAUDE.md on a local branch that is never pushed.

**설명**

프로젝트 CLAUDE.md는 팀이 공유하는 표준을 위한 파일이며, 푸시하지 않은 브랜치에 수정 사항을 두는 것은 취약하다. 병합, 리베이스, 혹은 실수로 인한 푸시가 초안 기준을 모두에게 배포해버릴 수 있다. 버전 관리 규율은 개인적인 지침을 위한 공식 메커니즘이 아니다.

**B(정답).** Put them in CLAUDE.local.md at the repository root and add it to .gitignore.

**설명**

CLAUDE.local.md은 개인적이고 프로젝트에 특화된 지침을 위한 공식 위치이다. 이 저장소 안의 세션에만 로드되며, .gitignore에 추가하면 버전 관리에서 제외되어 팀원과 CI 클론이 절대 받지 않게 된다.

**C.** Put them in .claude/settings.local.json, which Claude Code keeps out of git.

**설명**

로컬 설정 파일은 사용자별, 프로젝트별로 존재하지만, 지침 텍스트가 아니라 권한과 도구 설정 같은 JSON 설정을 담는다. 리뷰 기준은 자연어 가이드이므로 설정 파일이 아니라 메모리 파일에 있어야 한다.

**D.** Put them in ~/.claude/CLAUDE.md, which is never committed to version control.

**설명**

사용자 수준 파일은 한 사용자에게 비공개이긴 하지만, 이 저장소뿐 아니라 그 사용자가 여는 모든 프로젝트에 적용된다. 기준이 이 저장소에서만 로드되어야 한다는 요구사항이 이를 배제한다.

### 전반적인 설명

Claude Code의 메모리 시스템은 지침을 두 축으로 구분한다. 어떤 프로젝트에 로드되는지, 그리고 버전 관리를 통해 이동하는지 여부이다. 사용자 수준 ~/.claude/CLAUDE.md는 비공개이지만 전역적이다. 그 사용자가 여는 모든 프로젝트에 로드된다. 프로젝트 수준 CLAUDE.md는 하나의 저장소로 범위가 좁혀지지만 공유된다. 커밋되어 모든 팀원의 세션(CI 체크아웃 포함)이 이를 로드한다. CLAUDE.local.md는 나머지 사분면을 채운다. 단일 프로젝트로 범위가 좁혀진 개인 지침으로, .gitignore에 추가하여 git에서 제외한다. 한 저장소에서 시험 중인 초안 리뷰 기준은 정확히 그 사분면에 들어맞는다.

이런 구분이 설계된 이유는 지침이 곧 컨텍스트이며, 컨텍스트는 관련 있는 곳에서만 로드되어야 한다는 것이다. 초안 기준을 사용자 수준 파일에 두면 무관한 프로젝트에도 주입되어 버린다. 공유 프로젝트 파일에 두면 아직 합의되지 않은 정책을 팀원과 파이프라인에 강제로 밀어붙이게 된다. Claude Code는 작업 디렉터리와 그 상위 디렉터리에서 CLAUDE.md와 CLAUDE.local.md를 찾아 컨텍스트로 연결(concatenate)하므로, 로컬 파일은 공유 파일을 대체하는 것이 아니라 보완한다.

설정 파일들은 병렬적이지만 별개인 체계를 따른다. .claude/settings.local.json도 마찬가지로 사용자별, 프로젝트별이지만, 자연어 가이드가 아니라 기계가 읽는 설정(권한, 도구 설정)을 담는다. 설정 계층과 메모리 계층을 혼동하는 것은 흔한 실수이다. 각각 자신만의 개인 계층과 공유 계층을 갖는다. Manage Claude's memory와 Claude Code settings를 참고하라.

### 출처: Claude Code Configuration & Workflows/시나리오2_개발가속화.md
## 질문 11

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : The review job's --json-schema declares a suggested_fix_url field with "format": "uri", yet the comment-posting step occasionally receives values that are not valid URIs even though the run reported validated output. What is the correct fix?

**A(정답).** Validate URI syntax in the pipeline, since the format keyword is accepted as an annotation, not enforced.

**설명**

이것이 정답이다. Claude Code의 스키마 검증은 format 키워드(uri나 email 등)를 어노테이션으로만 취급하며, 그 형식의 문법 규칙을 따르지 않는 값을 거부하지 않는다. 이후 댓글 게시 단계가 의존하는 문법적 보장은 파이프라인 코드에서 확인해야 한다.

**B.** Add an explicit instruction in the prompt stating that the field must contain a syntactically valid URI.

**설명**

프롬프트 지시는 형식이 올바른 값이 나올 가능성을 높이지만 이를 보장하지는 않는다. 모델은 여전히 스키마 검증을 통과하는 잘못된 형식의 URI를 낼 수 있다. 댓글을 자동으로 게시하는 파이프라인에는 확률적인 확인이 아니라 결정론적인 확인이 필요하다.

**C.** Switch the invocation to --output-format stream-json so each finding is validated as it is emitted.

**설명**

stream-json 형식은 출력이 전달되는 방식(실시간 스트리밍을 위한 줄바꿈 구분 JSON)을 바꿀 뿐, 스키마 검증이 동작하는 방식을 바꾸지는 않는다. 어떤 출력 형식을 선택하든 format 키워드는 여전히 강제되지 않는다.

**D.** Add the field to the schema's required array so malformed URIs fail validation and trigger a reprompt.

**설명**

required 배열은 그 필드가 출력에 존재하는지만 확인한다. 필드 값이 문법적으로 유효한 URI인지 검증하는 것은 전혀 하지 않으므로, 잘못된 형식의 값도 여전히 검증을 통과하게 된다.

### 전반적인 설명

Claude Code가 --output-format json과 --json-schema로 실행될 때, 출력은 structured_output으로 반환되기 전에 제공된 JSON Schema에 대해 검증된다. 이 검증은 타입, required 필드, enum, 객체 형태 같은 구조적 속성을 다룬다. format 키워드(예: "format": "uri"나 "format": "email")는 다른 경우다. 이는 받아들여지지만 어노테이션으로만 취급되므로, not-a-real-url 같은 값도 문자열이기만 하면 검증을 통과한다. 이는 JSON Schema 명세 자체를 그대로 반영한 것으로, format 검사는 검증기(validator)에게 선택 사항이며, 이것이 왜 어떤 실행이 스키마 검증을 통과한 출력이라고 정직하게 보고하면서도 다운스트림 시스템이 쓸 수 없는 값을 여전히 내놓을 수 있는지를 설명해준다.

여기서 가져야 할 올바른 사고 모델은 2계층 계약이다. 스키마는 형태(shape)를 보장하고, 여러분의 파이프라인 코드는 의미(semantics)를 보장한다. 파싱 가능한 URI, 해석 가능한 파일 경로, diff 내의 라인 번호처럼 게시 단계가 실제로 정확성을 위해 의존하는 것은, 댓글이 게시되기 전에 코드에서 결정론적으로 확인해야 한다. 필드를 required로 표시하는 것은 존재 여부만을 단언할 뿐 문법을 단언하지는 않는다. stream-json으로 전환하는 것은 전달 메커니즘(하나의 최종 JSON 봉투 대신 줄바꿈으로 구분된 이벤트)을 바꿀 뿐, 검증이 강제하는 것을 바꾸지는 않는다. 프롬프트 지시는 유효한 값이 나올 확률을 높이지만 실패율을 0으로 만들지는 못하는데, 이것이 바로 파이프라인이 지금 겪고 있는 상황이다.

format 키워드가 강제되지 않는다는 공식적인 언급은 Headless mode 문서를, 스키마 검증과 재시도가 어떻게 동작하는지는 Structured outputs 문서를 참고하라.

### 출처: Claude Code Configuration & Workflows/시나리오4_데이터추출.md
## 질문 1

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : A nightly extraction job runs claude -p with --output-format json and --json-schema over incoming documents. The pipeline's parser reads the top-level result field and intermittently fails to obtain schema-conformant JSON. What change fixes this?

**A.** Extract the payload with jq -r '.result', since the wrapper nests the model's answer there.

**설명**

jq로 result를 추출하는 것은 스키마 없이 --output-format json만 사용해서 텍스트 답변을 얻고자 할 때의 정석적인 패턴이다. --json-schema를 사용하는 경우에는 검증된 페이로드가 structured_output에 담기므로, 이 방식은 파서가 계속 잘못된 필드를 가리키게 만든다.

**B.** 각 추출 결과가 개별적으로 파싱 가능한 JSON 줄로 도착하도록 --output-format stream-json으로 전환한다.

**설명**

stream-json은 실시간 이벤트 스트리밍을 위해 줄바꿈으로 구분된 JSON을 내보내는 방식으로, 전달 형식은 바뀌지만 스키마 검증된 페이로드의 위치는 옮기지 않는다. 파이프라인은 여전히 최종 result에서 structured_output을 읽어야 검증된 데이터를 얻을 수 있다.

**C.** Claude가 result 필드 안에 스키마에 맞는 JSON을 출력하도록 지시하는 프롬프트 지침을 추가한다.

**설명**

프롬프트 지침으로는 CLI가 검증된 출력을 어디에 배치하는지를 바꿀 수 없다. JSON 봉투 내 필드 배치는 Claude Code가 결정하는 것이며, 모델의 서술 내용이 결정하는 것이 아니다. 프롬프트에 의존하면 --json-schema가 원래 없애려던 확률적 포맷팅 문제가 다시 생긴다.

**D(정답).** JSON 봉투의 structured_output 필드에서 검증된 추출 페이로드를 읽는다.

**설명**

이것이 정답인 이유는, --json-schema가 지정되면 스키마 검증을 통과한 페이로드가 result가 아니라 JSON 래퍼의 structured_output 필드에 담기기 때문이다. result 필드는 텍스트 답변을 담고 있으며, 이 필드를 파싱해서 스키마에 맞는 JSON을 얻으려 하면 간헐적으로 실패하는 이유가 바로 여기에 있다.

### 전반적인 설명

Claude Code의 print 모드는 --output-format json으로 호출되면 출력을 JSON 봉투로 감싼다. 여기서 가져야 할 사고 모델은, 이 봉투가 서로 다른 역할을 가진 별도의 필드들로 구성되어 있다는 것이다. result에는 모델의 텍스트 답변이 담기고, 세션 메타데이터가 그 옆에 놓이며, --json-schema가 지정되면 스키마 검증된 페이로드가 별도의 structured_output 필드에 나타난다. result를 파싱하면서 스키마에 맞는 데이터를 기대하는 파이프라인은 사실 서술(prose) 채널을 읽고 있는 셈이며, 이것이 간헐적 실패를 설명한다. 어떤 때는 텍스트가 우연히 깨끗한 JSON이고, 어떤 때는 그렇지 않기 때문이다.

이러한 분리는 의도적인 설계다. 사람이 읽는 답변과 기계가 검증한 페이로드를 서로 다른 필드에 유지함으로써, Claude Code는 structured_output에 담기는 내용이 실제로 스키마 검증을 통과했다는 것을 보장하면서도, 모델이 result에서는 자유롭게 서술할 수 있게 한다. 자동화 과정에서 여전히 처리해야 할 두 가지 실패 모드가 있다. 첫째, 출력이 스키마 검증에 반복적으로 실패하면 실행은 구조화된 데이터 대신 error_max_structured_output_retries와 같은 오류 서브타입으로 종료된다. 둘째, 이와는 별개로, 결과가 success 서브타입을 가지면서도 structured_output 필드가 없는 경우도 있을 수 있다. 견고한 파이프라인이라면 진행하기 전에 성공 서브타입과 structured_output 존재 여부를 모두 확인해야 한다.

오답들은 구조적인 이유로 성립하지 않는다. jq -r '.result'는 스키마가 없는 순수 JSON 출력에서만 올바른 추출 방식이고, stream-json은 검증된 페이로드의 위치를 옮기지 않으면서 전달 방식만 줄바꿈 구분 이벤트로 바꾸며, 프롬프트 지침은 봉투 구조를 지시할 수 없다. 검증된 출력을 어디에 배치할지는 모델이 아니라 CLI가 결정하기 때문이다. 문서화된 호출 패턴과 출력 구조는 Headless mode와 CLI 레퍼런스를 참고하고, 검증 및 재시도 동작은 Structured outputs를 참고하라.

### 출처: Claude Code Configuration & Workflows/시나리오4_데이터추출.md
## 질문 7

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : A developer lists the team's sample-document fixtures in the project CLAUDE.md as @tests/fixtures/invoice.json and @tests/fixtures/receipt.json. Every session now starts with both files' full raw contents loaded into context. What change fixes this?

**A.** Trim each fixture file until the combined imported content keeps CLAUDE.md under the recommended length limit.

**설명**

이는 의도치 않은 임포트를 우회하기 위해, 테스트 스위트를 위해 존재하는 테스트 픽스처를 훼손하는 것이다. 문제는 파일이 임포트되는 것 자체이며, 파일이 너무 길다는 것이 아니다.

**B(정답).** 픽스처 경로를 백틱으로 감싸서, CLAUDE.md가 내용을 임포트하지 않고 경로만 언급하게 한다.

**설명**

CLAUDE.md에서 @path 문법은 임포트다. 참조된 파일은 실행 시점에 컨텍스트로 인라인 확장된다. 경로를 백틱으로 감싸면 단순한 언급으로 바뀌므로, Claude는 픽스처가 어디에 있는지는 알지만 그 내용이 모든 세션에 로드되지는 않는다.

**C.** 픽스처 목록을 홈 디렉터리의 사용자 수준 CLAUDE.md로 옮겨서 임포트가 프로젝트 범위 밖에서 로드되게 한다.

**설명**

사용자 수준 메모리도 모든 세션에 로드되므로, 그곳의 @path 참조 역시 픽스처 내용을 컨텍스트로 확장시킬 것이다. 게다가 이는 픽스처 문서를 공유되지 않게 만들어, 이를 필요로 하는 동료들에게 숨겨버린다.

**D.** 각 세션 시작 시 /compact를 실행하여 임포트된 픽스처 내용을 컨텍스트 윈도우에서 다시 요약해 낸다.

**설명**

압축은 대화 이력을 사후에 요약하며 세부 정보를 잃을 위험이 있다. @path 임포트가 실행 시점에 확장되는 것을 막지는 못한다. 픽스처는 매 세션마다 일단 로드된 다음, 손실이 있는 형태로 요약될 것이다.

### 전반적인 설명

CLAUDE.md에서 @path/to/file 문법은 파일 경로를 편하게 적는 방식이 아니라 임포트 지시문이다. 실행 시점에 Claude Code는 임포트된 각 파일을 컨텍스트에 인라인으로 확장하며, 임포트는 여러 단계까지 재귀적으로 이어질 수 있다. 이는 의도된 설계다. 팀이 표준을 별도 파일로 분리하면서도 자동으로 로드되도록 CLAUDE.md를 모듈화할 수 있게 해준다. 그 대가는, 맨 @ 접두사로 작성된 것은 의도했는지 여부와 무관하게 항상 로드되는 콘텐츠가 된다는 점이다.

목표가 단지 Claude에게 픽스처가 어디 있는지 알려주는 것뿐이라면, 문서화된 기법은 경로를 백틱으로 감싸는 것이다. 예를 들어 `@tests/fixtures/invoice.json`처럼 쓴다. 그러면 경로는 비활성 텍스트로 나타난다. Claude는 실제로 작업이 필요할 때 파일 도구로 그 파일을 필요 시점에 읽을 수 있으며, 모든 세션의 컨텍스트 예산에 픽스처 바이트가 소비되지 않는다.

다른 접근법들은 증상만 다룬다. 시작 이후에 압축하는 것은 원래 로드되지 않았어야 할 콘텐츠에서 세부 정보를 버리는 것이다. 목록을 사용자 수준 메모리로 옮기는 것은 파일을 여전히 임포트하면서(사용자 메모리도 모든 세션에 로드된다) 문서를 버전 관리에서 제외시켜 버린다. 픽스처를 줄이는 것은 잘못된 지시를 수용하기 위해 테스트 자산을 희생시키는 것이다. 가져가야 할 사고 모델은 다음과 같다. CLAUDE.md에서 @path는 "지금 이것을 로드하라"는 뜻이고, 백틱은 "이것은 그냥 이름이다"라는 뜻이다. Manage Claude's memory와 Claude Code best practices를 참고하라.

### 출처: Claude Code Configuration & Workflows/시나리오4_데이터추출.md
## 질문 12

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The extraction prompt includes two examples of cleanly formatted invoices, yet output still varies on invoices that omit a purchase order number or list multiple dates. Which two additions to the examples best improve consistency? (Select two.)

**A(정답).** Add an input/output pair where the source invoice omits the purchase order number and the expected output records that field as null.

**설명**

이것이 정답인 이유는, 예시가 실제로 동작이 갈리는 엣지 케이스를 다뤄야 하기 때문이다. 해당 필드가 없는 문서를, 그 필드가 null인 출력과 짝지어 보여주는 것은, 존재하지 않는 데이터를 스키마를 만족시키기 위해 조작해내는 대신 없는 상태 그대로 보고해야 한다는 것을 보여준다.

**B.** 올바르게 포맷된 출력 레코드 여러 개만 추가하고, 그 출처가 되는 원본 발췌는 생략하여 프롬프트를 더 짧게 유지한다.

**설명**

이는 틀렸다. 출력만 있는 샘플은 목표 형식은 보여주지만 변환 과정은 보여주지 못한다. 각 출력과 함께 원본 문서가 없으면, 모델은 누락되거나 상충하는 입력이 어떻게 기대되는 결과로 매핑되는지 배울 수 없다.

**C.** 깨끗하게 포맷된 송장에서 뽑아낸 예시 열 개를 더 추가하여 지배적인 추출 패턴을 강하게 강화한다.

**설명**

이는 틀렸다. 모델은 이미 깨끗한 송장은 잘 처리한다. 불일치는 필드 누락과 모호한 날짜에서 나타난다. 쉬운 케이스를 반복하는 것은 어려운 케이스를 어떻게 해결해야 하는지 보여주지 못한 채 토큰만 추가한다.

**D(정답).** 여러 날짜가 나열된 송장에 대한 입력/출력 예시 쌍을 추가하고, 출력에서 어떤 날짜를 추출해야 하는지 보여준다.

**설명**

이것이 정답인 이유는, 모호한 케이스가 바로 서술 규칙이 일관성 없이 해석되는 지점이기 때문이다. 실제로 모호한 입력이 어떻게 해소되는지를 보여주는 예시는 출력 형식뿐 아니라 판단의 경계선을 가르친다.

### 전반적인 설명

퓨샷 예시는 형식뿐 아니라 판단을 보여줌으로써 작동한다. 상세한 서술 규칙이 일관성 없는 추출을 낳을 때, 그 실패는 거의 항상 규칙이 충분히 규정하지 못하는 케이스에 집중되어 있다. 즉 원본에 단순히 없는 필드, 그리고 여러 후보 값이 한 필드를 그럴듯하게 채울 수 있는 입력이다. 해결책은 바로 그러한 판단 경계선 위에 있는 예시를 골라내는 것이다.

발주서 번호가 없는 문서를, 그 필드가 null인 출력과 짝지어 보여주는 예시는 누락된 데이터에 대한 올바른 대응이 그 부재를 그대로 보고하는 것임을 확립한다. 이는 스키마 검증 추출에서 특히 중요하다. 모든 필드를 채우도록 압박받는 모델은 값을 조작해낼 것이고, 만들어낸 발주서 번호가 담긴 문법적으로 유효한 JSON 객체는 스키마 검증은 통과하면서 하위 시스템을 조용히 오염시킨다. 여러 날짜가 있는 송장을 하나의 올바른 날짜로 해소하는 예시는, 입력이 모호할 때 어떤 값이 우선하는지를 가르치는데, 이는 출력 샘플만으로는 결코 전달할 수 없는 것이다.

오답들은 상호보완적인 이유로 실패한다. 모델이 이미 잘 처리하는 케이스의 예시를 더 쌓는 것은 애초에 문제가 아니었던 패턴을 강화하며, 커버리지 대신 중복에 컨텍스트를 소비한다. 출력만 있는 샘플은 결과의 형태는 전달하지만 입력에서 출력으로의 매핑을 끊어버린다. 모델은 올바른 레코드가 어떻게 생겼는지는 보지만, 그 옆에 어려운 원본 문서가 어떻게 생겼는지는 결코 보지 못하므로, 특히 누락과 충돌에 대한 변환 자체는 여전히 명시되지 않은 채로 남는다. 실제 실패 모드를 겨냥한 잘 선택된 입력/출력 예시 두세 개가, 이미 잘 작동하는 케이스를 겨냥한 수많은 예시보다 낫다.

효과적인 예시를 선택하는 방법에 대한 가이드는 Use examples (multishot prompting) to guide Claude's behavior를 참고하라.

### 출처: Claude Code Configuration & Workflows/시나리오6_생산성도구.md
## 질문 2

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : An engineer on this team wants Claude Code to follow their personal working preferences (for example, explaining shell commands before running them) in every repository they open, while guaranteeing teammates never receive those preferences through version control. Where should these instructions live?

**A.** In the project-level CLAUDE.md under a clearly labeled personal section.

**설명**

프로젝트 수준의 CLAUDE.md는 버전 관리에 커밋되며 모든 팀원의 세션에 로드된다. 레이블을 붙인다고 해서 가시성이 제한되는 것은 아니므로, 개인 선호 설정이 여전히 팀 전체에 전달된다.

**B.** In a gitignored CLAUDE.local.md file created in each repository.

**설명**

CLAUDE.local.md은 버전 관리에서 제외되는 개인적인 프로젝트별 지침을 위한 공식 문서화된 위치이며, 그 범위는 모든 프로젝트가 아니라 하나의 프로젝트에 한정된다. 이 방식으로는 엔지니어가 여는 모든 저장소마다 선호 설정을 다시 만들고 유지 관리해야 한다. 모든 프로젝트에 적용되어야 하는 선호 설정에는 사용자 수준 파일이 적절한 범위다.

**C.** In ~/.claude/settings.json, which applies personal configuration across all projects.

**설명**

사용자 수준의 settings.json은 범위는 맞지만 콘텐츠 유형이 맞지 않는다. 이 파일은 권한이나 도구 설정 같은 JSON 구성을 담는 곳이며, Claude가 따라야 할 자연어 지침을 담는 곳이 아니다. 행동 관련 선호 설정은 메모리 파일에 두어야 한다.

**D(정답).** In ~/.claude/CLAUDE.md in the engineer's home directory.

**설명**

사용자 수준의 CLAUDE.md는 해당 사용자에게만 적용되며 그 사람의 컴퓨터에 있는 모든 프로젝트에 걸쳐 적용되고, 버전 관리를 통해 전달되는 일이 결코 없다. 이는 팀원에게 영향을 주지 않으면서 한 엔지니어를 어디서나 따라다녀야 하는 개인 선호 설정을 위한 공식 문서화된 정확한 위치다.

### 전반적인 설명

Claude Code의 메모리 파일은 위치에 따라 범위가 정해지며, 이를 이해하는 사고 모델은 두 축으로 이루어진 격자다. 누가 그 지침을 보는가(나 혼자, 또는 팀 전체)와 어디에 적용되는가(하나의 프로젝트, 또는 모든 프로젝트)이다. ~/.claude/CLAUDE.md에 있는 사용자 수준 파일은 "나 혼자, 모든 프로젝트"에 해당하는 칸을 차지한다. 이 파일은 홈 디렉터리에 있으므로 그 컴퓨터에서 엔지니어가 시작하는 모든 세션에 로드되며, 저장소에 커밋될 수 없으므로 구조적으로 팀원이 받을 수 없다. 이 때문에 프로젝트 전체에 걸친 개인 선호 설정을 위한 올바른 위치가 된다.

격자의 나머지 칸들을 보면 다른 선택지들이 왜 맞지 않는지 알 수 있다. CLAUDE.local.md는 "나 혼자, 하나의 프로젝트" 칸에 해당한다. 개인적인 프로젝트별 지침을 담고 .gitignore를 통해 버전 관리에서 제외된다. 이 범위는 저장소에 종속된 개인 메모에는 적합하지만, 저장소별로 선호 설정을 두면 모든 프로젝트에서 중복 작성하고 동기화를 유지해야 하므로 항상 적용되어야 하는 개인 선호 설정의 취지에 맞지 않는다. 저장소 루트에 있는 프로젝트 수준 CLAUDE.md는 "팀 전체" 칸이다. 여기에 작성된 내용은 섹션에 어떤 레이블을 붙였는지와 무관하게 소스 관리를 통해 공유되므로, 팀원이 절대 봐서는 안 되는 내용을 두기에는 잘못된 위치다. 마지막으로 ~/.claude/settings.json은 사용자 범위는 공유하지만 전혀 다른 목적을 갖는다. 이 파일은 권한 규칙 같은 구조화된 설정을 담는 곳이며, Claude의 동작을 형성하는 서술형 지침을 담는 곳이 아니다.

지침 파일의 전체 계층 구조와 공유 범위에 대해서는 Claude Code 메모리(Claude Code memory) 공식 문서를, JSON 설정 파일에 무엇이 들어가야 하는지에 대해서는 Claude Code 설정(Claude Code settings) 문서를 참고하라.

### 출처: Context Management & Reliability/시나리오1_CICD.md
## 질문 5

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Per-file review subagents return findings as bare prose. The aggregator merges them into one PR comment, and developers dismiss many as false positives because verified issues and speculative pattern matches look identical. Which structured-output requirement addresses this?

**A.** Instruct the aggregation agent to independently re-run the relevant tests to verify every finding before posting the comment.

**설명**

이는 파일별 서브에이전트가 이미 수행한 작업을 중복시키고 파이프라인의 시간과 비용을 부풀립니다. 또한 집계 에이전트에게는 각 서브에이전트가 가진 파일 단위 맥락이 없으며, 문제로 제시된 것은 검증 노력의 부족이 아니라 발견 항목에 대한 메타데이터의 부족입니다.

**B.** Have each subagent attach a raw self-rated confidence score to every finding so the aggregator can rank the merged list.

**설명**

보정되지 않은 자체 평가 신뢰도는 좋지 못한 대체 지표입니다. 모델이 자신 있게 틀리는 경우가 바로 오탐으로 판명되는 발견 항목들이기 때문입니다. 순위 점수 역시 발견 항목이 어떻게 만들어졌는지에 대해서는 아무것도 알려주지 않는데, 이것이 바로 집계자와 개발자들에게 부족한 정보입니다.

**C(정답).** Require each finding to carry its detection method and supporting evidence, such as the matched pattern or the failing test output.

**설명**

이는 모든 발견 항목에 함께 전달되는 방법론적 메타데이터입니다. 이를 통해 집계자는 실행으로 검증된 문제와 정적 검사에 의한 의심 사항을 구분해서 표시할 수 있고, 개발자는 각 코멘트를 그 근거에 따라 판단할 수 있습니다. 또한 어떤 탐지 패턴이 개발자들이 무시하는 오탐을 만들어내는지 체계적으로 분석할 수 있게 해줍니다.

**D.** Have subagents discard any finding they cannot confirm by executing tests, returning only issues verified at runtime.

**설명**

이는 정당한 발견 항목을 침묵으로 억제합니다. 정적 검사로 드러난 많은 실제 문제는 테스트 실행으로는 확인할 수 없기 때문입니다. 다운스트림 에이전트가 필요로 할 수 있는 정보를 폐기하는 것은 안티패턴입니다. 해결책은 발견 항목을 필터링하는 것이 아니라 출처(provenance) 정보를 함께 주석으로 남기는 것입니다.

### 전반적인 설명

정확한 다운스트림 종합은 서브에이전트가 방법론적 메타데이터를 포함한 구조화된 발견 항목을 반환하는 데 달려 있으며, 단순한 문장으로는 부족합니다. 다단계 리뷰 파이프라인에서 실패한 테스트로 뒷받침되는 발견 항목은 코드 패턴에서 추론된 발견 항목과는 매우 다른 무게를 가지지만, 둘 다 평범한 문장으로 뭉개지고 나면 집계 단계는 이를 구별할 방법이 없습니다. 각 발견 항목이 탐지 방법과 근거(예를 들어 detected_pattern 필드나 캡처된 테스트 출력)를 포함하도록 요구하면, 집계자는 검증된 문제를 차단 대상으로, 추측성 일치는 제안으로 표시할 수 있고, 팀은 어떤 탐지 패턴이 무시되는 코멘트를 만들어내는지 분석할 수 있습니다. 이러한 피드백 루프가 실제로 오탐률을 낮추는 방법입니다.

기저의 메커니즘은 서브에이전트가 결과를 반환하는 즉시 그 맥락이 폐기된다는 점입니다. 오케스트레이팅 에이전트가 보는 정보는 오직 서브에이전트의 최종 결과뿐입니다(Agent SDK Subagents 참고). 그 최종 메시지에 데이터로 담기지 않은 출처 정보는 이후에 복원할 수 없습니다. 서브에이전트 출력에 대한 결과 스키마의 자동 강제는 존재하지 않으므로, 각 서브에이전트는 탐지 방법과 근거 필드를 포함하는 구조화된 최종 메시지를 내도록 명시적으로 지시받거나 오케스트레이션 로직으로 감싸져야 합니다. Agent SDK의 에이전트로부터 구조화된 출력을 얻는 방법에 대한 가이드는 이 경계에서 안정적으로 파싱 가능한 결과를 얻는 방법을 설명합니다.

대안들은 특징적인 이유로 실패합니다. 자체 평가 원시 신뢰도 점수는 보정이 잘 되어 있지 않습니다. 모델은 어려운 사례에서 자신 있게 틀리는 경우가 많으므로, 그 신호로 순위를 매기면 목록의 순서만 바뀔 뿐 어떤 발견 항목도 설명해주지 못합니다. 집계자가 모든 것을 다시 검증하게 하는 것은 이미 완료된 작업을 중복시키며, 서브에이전트가 가졌던 파일 단위 맥락 없이 실행됩니다. 검증되지 않은 발견 항목을 폐기하는 것은 침묵 억제입니다. 정적 분석은 어떤 테스트로도 다루지 않는 문제를 정당하게 드러내는데, 이를 버리면 종합 단계와 개발자가 정보에 기반한 판단을 내리는 데 필요한 정보를 숨기게 됩니다.

### 출처: Context Management & Reliability/시나리오2_개발가속화.md
## 질문 3

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : During an extended debugging session, the agent appends every confirmed finding to a scratchpad file, yet its later answers contradict entries it recorded hours earlier. What change makes the scratchpad effective?

**A.** Trigger /compact after each major discovery so the compacted summary stays consistent with the scratchpad entries.

**설명**

압축은 대화를 요약본으로 축소하는 것이며, 요약은 정확한 발견 사항, 숫자, 파일명 같은 정밀한 세부 정보를 누락시키는 경향이 있다. 압축을 더 자주 실행해도 에이전트가 스크래치패드를 참조하도록 만들지 못하며, 오히려 기록해둔 세부 정보의 손실을 심화시킬 수 있다.

**B.** Convert the scratchpad from free-form prose to a structured JSON format so the model can parse its recorded state more reliably.

**설명**

형식 선택은 파일이 실제로 컨텍스트에 다시 읽혀 들어갈 때에만 의미가 있는데, 여기서는 에이전트가 그 파일을 전혀 참조하지 않는다. JSON 같은 구조화된 형식은 테스트 결과처럼 구조화된 상태 정보에 권장되지만, 형식을 바꾸는 것만으로는 기록한 뒤 방치되는 파일 문제를 고칠 수 없다.

**C.** Import the scratchpad into CLAUDE.md so its contents load automatically alongside the project memory at startup.

**설명**

메모리 파일은 안정적인 관례와 지침을 위한 것이며, 계속 갱신되는 조사 로그를 위한 것이 아니다. 살아있는 스크래치패드를 가져오더라도, 에이전트가 답변할 때 최신 항목을 참조하도록 보장하지는 못한다. 새로운 발견 사항이 추론에 영향을 미치려면 파일을 명시적으로 다시 읽거나 메모리를 다시 로드해야 한다.

**D(정답).** Instruct the agent to consult the scratchpad file when answering subsequent questions instead of relying on conversation memory.

**설명**

스크래치패드는 에이전트가 다시 읽어올 때만 컨텍스트 손실에 대응할 수 있다. 발견 사항을 기록하면 컨텍스트 윈도우 밖에 영속적으로 보존되지만, 그 내용이 추론에 영향을 미치는 것은 다시 컨텍스트로 들어올 때뿐이다. 이후 질문에 답할 때 그 파일을 참조하도록 지시하면 "쓰고-읽는" 순환이 완성되어, 답변이 손실된 대화 기록이 아니라 신뢰할 수 있는 기록에서 나오게 된다.

### 전반적인 설명

스크래치패드 파일 뒤에 있는 사고 모델은, 컨텍스트 윈도우는 손실이 있는 유한한 작업 메모리이고, 파일시스템은 영속적인 외부 저장소라는 것이다. 핵심 발견 사항을 파일에 기록하면 요약과 주의력 감쇠로부터 그 내용을 보호할 수 있지만, 디스크에 있는 파일은 모델의 추론과 자동으로 연결되지 않는다. 그 내용은 다시 컨텍스트로 로드되었을 때만 답변에 영향을 준다. 따라서 스크래치패드 관행에는 두 가지 절반이 필요하다. 발견되는 즉시 기록하는 것과, 이후 질문에 답할 때 그 파일을 참조하는 것이다. 이 세션에서의 실패는 두 번째 절반이 빠진 것이므로, 해결책은 손실된 대화 메모리를 믿지 말고 스크래치패드를 참조하도록 에이전트에 지시하는 것이다. 장기 실행 작업에 대한 Anthropic 자체 가이드도 이 패턴을 따른다. 에이전트가 진행 상황과 상태를 파일에 저장하게 하고(예: progress.txt나 구조화된 상태 파일), 작업을 이어갈 때 그 파일을 명시적으로 검토하도록 하는 것이다. 자세한 내용은 Prompt templates and variables를 참고하라.

다른 대안들은 모두 이 "다시 읽기" 요구사항을 놓치고 있다. /compact를 더 자주 실행하는 것은 히스토리를 요약본으로 압축하는데, 이는 정확한 발견 사항을 잃어버리는 바로 그 연산이다. 컨텍스트 용량은 관리되지만 에이전트의 답변을 신뢰할 수 있는 기록으로 연결시키지는 못한다. 스크래치패드를 CLAUDE.md로 가져오는 것은 메모리를 잘못 사용하는 것이다. 메모리는 살아있는 조사 로그가 아니라 안정적인 관례를 위해 존재하며, 여전히 "다시 읽기" 공백을 남긴다. 파일을 명시적으로 읽거나 메모리를 다시 로드하지 않으면, 새로 추가된 발견 사항은 에이전트의 추론에 도달하지 못한다. 파일을 JSON으로 재구성하는 것은 테스트 결과 같은 구조화된 상태에는 합리적이지만, 형식은 파일이 실제로 읽힐 때만 의미가 있다. 잘 구조화되었지만 전혀 참조되지 않는 파일은 서술형 파일과 마찬가지로 도움이 되지 않는다.

### 출처: Context Management & Reliability/시나리오4_데이터추출.md
## 질문 2

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : Extraction requests concatenate multiple document sections into roughly 80K-token inputs. Fields from the first and last sections extract reliably, but fields present in middle sections often come back null. Which change addresses this?

**A.** Increase max_tokens so the model has sufficient output budget to populate every field defined in the extraction schema.

**설명**

null 값은 응답이 잘려서 발생하는 것이 아니다. 모델은 출력 공간이 부족한 것이 아니라 중간 섹션의 내용을 제대로 회상하지 못하고 있는 것이다. 출력 상한선을 높여도 입력 처리 문제는 그대로 남는다.

**B.** Add a system prompt instruction directing the model to give equal weight to every section regardless of its position in the input.

**설명**

위치에 따른 주의력 손실은 모델이 긴 입력을 처리하는 방식에 내재된 특성이며, 요청에 따라 켜고 끌 수 있는 동작이 아니다. 모든 섹션에 동일한 주의를 기울이라는 지시는 80K 토큰 입력의 중간 부분에서 모델이 실제로 회상하는 내용을 바꾸지 못한다.

**C.** Relocate the JSON schema and extraction instructions to the middle of the prompt so they sit adjacent to the sections whose fields are missed.

**설명**

이는 문서화된 가이드라인을 정반대로 뒤집은 것이다. 질의와 지시사항은 프롬프트 끝부분에, 데이터는 상단에 배치하는 것이 가장 효과적이다. 지시사항을 중간에 묻어버리면 주의력이 가장 약한 위치에 배치되는 것이므로, 모든 섹션에 걸쳐 추출 품질이 저하될 가능성이 높다.

**D(정답).** Restructure requests so document content sits at the top in XML-tagged sections, with Claude quoting relevant passages before extracting.

**설명**

이는 Anthropic이 문서화한 긴 컨텍스트 기법을 적용한 것이다. 장문의 데이터는 프롬프트 상단 근처에 배치하고, XML 태그는 모델이 각 섹션을 탐색할 수 있는 명확한 구조적 표지를 제공하며, 관련 구절을 먼저 인용하게 하면 추출이 이루어지기 전에 중간 섹션의 내용이 생성 과정에서 최근에 잘 주목받는 위치로 옮겨진다. 이 요소들이 결합되어 위치에 따른 주의력 손실을 직접적으로 완화한다.

### 전반적인 설명

여기서 나타나는 실패 양상, 즉 긴 입력의 양쪽 끝은 안정적으로 추출되지만 누락이 중간 부분에 집중되는 현상은 전형적인 "중간 실종(lost-in-the-middle)" 패턴이다. Anthropic은 이러한 더 넓은 현상을 컨텍스트 부패(context rot)라고 설명한다. 컨텍스트 윈도우는 모델의 작업 기억이며, 토큰 수가 늘어날수록 한도 안에 충분히 들어가는 내용이라도 정확도와 회상률이 저하된다. 80K 토큰을 윈도우에 담을 수 있다는 것과, 그 안의 모든 위치에서 안정적으로 정보를 회수할 수 있다는 것은 별개의 문제다.

Anthropic의 긴 컨텍스트 가이드는 20K+ 토큰 입력에 대해 구체적인 처방을 제시한다. 장문 데이터는 프롬프트 상단 근처에 배치하고, 질의와 지시사항은 끝에 배치한다(이 구조는 복잡한 다중 문서 입력에 대한 Anthropic의 테스트에서 응답 품질을 최대 30%까지 개선했다). 그리고 각 문서나 섹션을 <document>, <document_content> 같은 XML 태그로 감싸서 모델이 내용과 지시사항을 구분하고 섹션 간을 탐색할 수 있게 한다. 정답 접근 방식의 나머지 절반, 즉 작업 수행 전에 Claude에게 관련 구절을 인용하도록 요청하는 것은 문서화된 완화 기법이다. 인용은 모델이 먼저 근거 텍스트를 찾아 재현하도록 강제하며, 이를 통해 구조화된 추출이 생성되기 전에 중간 섹션의 증거가 활성 생성 과정으로 표면화된다.

다른 접근 방식들은 문제를 잘못 진단한 것이다. 스키마와 지시사항을 프롬프트 중간으로 옮기는 것은 가장 중요한 지침을 가장 주목받지 못하는 위치에 두는 것으로, 문서화된 순서와 정반대다. 모든 섹션에 동일한 비중을 두라는 프롬프트 지시는 모델이 단순히 끌 수 없는 처리 특성을 무시하라고 요구하는 것이다. max_tokens를 높이는 것은 출력 예산을 늘리는 것일 뿐이며, null 값은 응답이 잘려서가 아니라 입력 회상 문제에서 비롯된다.

Context windows와 Long context prompting tips를 참고하라.

### 출처: Context Management & Reliability/시나리오4_데이터추출.md
## 질문 3

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : While tuning extraction schemas, the agent records per-field error rates in a scratchpad file. After /compact runs mid-session, it misquotes those rates in later turns. What makes the recorded rates reliably available again?

**A.** Run compaction more frequently so each summary is produced while the recorded rates are still recent in the raw history.

**설명**

압축을 더 자주 실행하면 문제가 완화되기보다 오히려 심화된다. 각 요약 과정은 정밀한 숫자 값에 대해 손실이 발생하므로, 압축을 더 자주 실행하면 해당 수치가 압축 과정에 더 적게 아니라 더 많이 노출된다.

**B.** Raise the compaction threshold so summarization triggers later, keeping the rates in the uncompacted history for longer.

**설명**

압축을 지연시키는 것은 손실을 뒤로 미루는 것일 뿐이다. 결국 임계값에 도달하면 동일하게 손실이 발생하는 요약 과정이 정밀한 수치를 모호한 문장으로 압축해버리며, 스크래치패드의 가치는 여전히 에이전트가 그것을 다시 읽어들이는지에 달려 있다.

**C.** Assume no further step is needed, since the agent authored the file and retains its contents internally across compaction.

**설명**

이는 잘못된 사고 모델을 반영한다. 모델은 자신이 작성한 파일에 대한 내부 기억을 갖고 있지 않다. 압축이 대화를 축약하면 정밀한 수치는 오직 파일 안에만 존재하게 되며, 그 파일이 컨텍스트로 다시 읽혀 들어올 때만 에이전트의 추론에 안정적으로 다시 반영된다.

**D(정답).** Have the agent explicitly read the scratchpad file whenever it needs the exact rates, rather than relying on automatic reloading.

**설명**

이것이 정답인 이유는 스크래치패드 파일이 모델의 기억이 아니라 외부 작업 공간 상태이기 때문이다. 파일 내용은 컨텍스트 윈도우에 들어와 있을 때만 추론에 영향을 미치므로, 신뢰할 수 있는 패턴은 정밀한 수치가 필요할 때마다 에이전트가 명시적으로 해당 파일을 참조하도록 하는 것이다.

### 전반적인 설명

여기서 가져야 할 사고 모델은, 스크래치패드 파일은 숨겨진 기억이 아니라 외부 상태라는 것이다. Anthropic의 장기 작업 가이드는 일반 파일(진행 노트, JSON 상태 파일, git 기록)을 지속적인 상태로 취급하는데, 이는 정확히 이러한 파일들이 작업 공간에 존재하며 대화에 어떤 일이 일어나든 살아남기 때문이다. 그러나 모델 자체는 이러한 파일들에 대해 상태를 갖지 않는다. 파일을 작성하는 것이 그 내용을 모델에 심어주지는 않으며, 대화가 압축된 후에 스크래치패드의 정확한 수치가 다시 윈도우에 들어와 있을 것이라는 보장은 없다. 그 내용은 컨텍스트 윈도우를 차지할 때만 추론에 영향을 미치므로, 정밀한 수치가 필요할 때 에이전트가 명시적으로 파일을 읽도록 지시해야 한다.

이것이 바로 스크래치패드가 /compact와 잘 어울리는 이유다. 압축은 긴 세션이 계속될 수 있도록 대화를 요약으로 축약하지만, 요약 과정은 이 시스템이 의존하는 종류의 정보, 즉 필드별 오류율, 임계값, 기타 정밀한 수치에 대해서는 손실이 발생한다. 이러한 역할 분담은 의도적인 것이다. 압축은 장황한 기록을 버리게 하고, 파일은 그대로 보존되어야 하는 사실들을 담아 필요할 때 다시 불러오게 한다.

다른 접근 방식들은 이 모델에 반한다. 에이전트가 자신이 작성한 파일을 기억할 것이라고 신뢰하는 것은 존재하지 않는 내부 기억을 전제로 한다. 압축을 더 자주 실행하면 손실이 발생하는 압축 과정을 더 여러 번 거치게 되고, 임계값을 높이면 손실이 발생하는 한 차례의 과정을 단지 지연시킬 뿐이다. 둘 다 명시적으로 다시 읽은 파일만큼 수치의 정밀도를 보호하지 못한다. Anthropic이 파일과 기억을 모델이 유지하는 상태가 아니라 반드시 불러와야 하는 컨텍스트로 규정하는 방식에 대해서는 Manage Claude's memory와 Prompt templates and variables를 참고하라.

### 출처: Context Management & Reliability/시나리오4_데이터추출.md
## 질문 7

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The system consolidates field values extracted from several documents into one record, but auditors cannot trace a disputed value back to its source because the merge step outputs only final values. What is the structural fix?

**A.** Attach the complete list of input document names to each consolidated record so reviewers know which documents were processed.

**설명**

문서 목록은 출처 표시가 아니라 참고 문헌 목록에 불과하다. 어떤 문서를 읽었는지는 알려주지만, 개별 필드 값을 그것을 제공한 문서에 결부시키지는 않으므로 분쟁 대상 값을 여전히 그 출처까지 추적할 수 없다.

**B.** Have Claude reconstruct source attributions after merging by matching each consolidated value back against the original documents.

**설명**

사후 재구성은 신뢰할 수 없다. 동일한 값이 여러 문서에 나타날 수 있고, 추출 과정에서 값이 정규화되었을 수도 있으며, 모델이 그럴듯하지만 잘못된 방식으로 값을 틀린 출처와 매칭할 수도 있다. 출처 정보는 사라진 후에 재구성하는 것이 아니라 추출 시점에 보존되어야 한다.

**C.** Limit the pipeline to a single consolidation pass so attribution has fewer opportunities to be dropped.

**설명**

압축 단계 수를 줄이는 것은 출처 정보가 제거될 수 있는 횟수만 줄일 뿐이다. 남아 있는 단계도 출처 연결이 구조화된 데이터로 운반되지 않으면 여전히 그것을 버리게 된다. 실패의 원인은 파이프라인의 단계 수가 아니라 파이프라인이 보존하는 내용에 있다.

**D(정답).** Require each extraction output to include structured value-to-source mappings that the merge step preserves in the consolidated record.

**설명**

이것이 정답인 이유는 출처 정보가 각 값과 함께 구조화된 데이터로 이동할 때만 통합 과정에서 살아남기 때문이다. 추출된 모든 값이 출처 문서와 근거 구절을 함께 지니고 있으면, 병합 단계는 그 매핑 정보를 그대로 이어받을 수 있으며, 통합된 레코드의 분쟁 대상 필드는 정확히 어느 문서에서 왔는지 추적할 수 있다.

### 전반적인 설명

출처 정보 손실은 프롬프트 작성의 문제가 아니라 집계 과정의 구조적 특성이다. 여러 추출 결과가 압축되거나 병합될 때마다, 명시적 데이터로 표현되지 않은 정보는 모두 사라진다. 최종 필드 값을 만들어내라고 요청받은 병합 단계는 정확히 그 결과만 만들어내며, 각 값과 그 값이 유래한 문서 사이의 연결은 조용히 사라진다. 여기서의 사고 모델은, 출처 정보는 부가적인 설명이 아니라 데이터라는 것이다. 값과 출처의 매핑이 모든 중간 출력의 필수 구성 요소로 취급되지 않으면, 어떤 다운스트림 단계도 그것을 되살릴 수 없다.

따라서 신뢰할 수 있는 설계는 각 추출 단계가 구조화된 연관 정보(값, 출처 문서명, 근거 구절, 가능하다면 날짜까지)를 출력하도록 요구하며, 통합 단계를 포함한 모든 다운스트림 단계가 그 매핑 정보를 단순한 값으로 평탄화하지 않고 보존하도록 요구한다. 이는 Anthropic이 다중 에이전트 연구 종합 작업에 대해 설명하는 것과 동일한 원칙이다. 주장-출처 매핑은 결합 과정을 거치면서도 유지되어야 최종 출력이 익명의 사실이 아니라 출처가 표시된 사실들을 병합할 수 있다. 이는 출처들이 서로 다른 내용을 말할 때도 도움이 된다. 두 출처 표시된 값 사이의 충돌을 조용한 선택으로 해결하는 대신 의도적으로 드러내고 조정할 수 있기 때문이다.

다른 선택지들은 각각 특징적인 방식으로 실패한다. 병합 후에 출처 정보를 재구성하는 것은 모델이 어떤 문서가 특정 값을 제공했는지 추측하게 만드는데, 이는 특히 정규화 과정에서 값의 표기 형태가 바뀐 뒤에는 확신에 찬 오매칭을 초래하기 쉽다. 모든 입력 문서를 나열하는 것은 커버리지 정보를 제공할 뿐, 특정 값을 특정 출처에 결부시키지 않으므로 분쟁 대상 필드에 대한 감사는 여전히 막혀 있다. 파이프라인을 단일 과정으로 축소하는 것은 출처 정보가 사라질 수 있는 지점의 수를 줄일 뿐이며, 매핑이 구조화되어 있지 않으면 남아 있는 그 한 과정에서도 여전히 정보가 사라진다. 구조화된 출력이 처리 단계를 거치면서도 메타데이터를 온전히 유지하는 방법에 대해서는 How we built our multi-agent research system과 Tool use with Claude를 참고하라.

### 출처: Context Management & Reliability/시나리오4_데이터추출.md
## 질문 8

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The extraction schema already records each document's publication date, yet downstream reconciliation still flags contradictions: two reports published the same month state different values for one metric because one republishes a figure measured two years earlier. What schema change fixes this?

**A.** Add a rule that keeps only the value from the most recently published document and silently discards the other one.

**설명**

이는 하나의 값을 임의로 선택하는 것으로, 상충하는 통계 처리에 대해 문서화된 안티패턴이다. 발행 최신성도 여기서는 잘못된 신호다. 최신 문서가 이전에 측정된 값을 재게재할 수 있으므로, 이 규칙은 오래된 수치를 남기게 될 수 있다.

**B(정답).** Add a field capturing the as-of or collection date of each extracted figure, distinct from the document's publication date.

**설명**

이것이 정답인 이유는 이 모순이 문서가 발행된 시점이 아니라 수치가 측정된 시점에서 비롯되기 때문이다. 각 수치의 수집일 또는 기준일을 포착하면 다운스트림 시스템이 두 값이 실제 충돌이 아니라 서로 다른 시점을 나타낸다는 것을 인식할 수 있다.

**C.** Tighten validation to reject any extraction whose figures differ from values already stored for the same metric.

**설명**

이는 모든 시간적 차이를 오류로 취급하여 정당한 최신 측정값까지 버리게 된다. 동일한 지표의 값은 시간이 지남에 따라 변화하는 것이 당연하므로, 값이 다른 추출을 거부하면 그러한 변화를 추적하는 파이프라인의 기능이 무너진다.

**D.** Add a conflict_detected boolean so downstream systems can see that the two extracted values disagree with each other.

**설명**

충돌 플래그는 불일치가 존재한다는 사실만 기록할 뿐 이를 해석할 정보는 전혀 제공하지 않는다. 측정 날짜가 없으면 다운스트림 시스템은 여전히 시간적 차이와 진짜 모순을 구분할 수 없으므로, 잘못된 충돌 보고가 계속된다.

### 전반적인 설명

여기서의 실패는 시간 관련 메타데이터에서 미묘하지만 중요한 구분에서 비롯된다. 문서의 발행일은 그 문서가 공개된 시점을 알려주는 반면, 수치의 수집일(또는 기준일)은 실제 측정이 이루어진 시점을 알려준다. 연간 요약 보고서, 보도자료, 재게재된 리포트는 발행일보다 훨씬 이전에 측정된 수치를 흔히 포함하므로, 같은 달에 발행된 두 문서가 서로 다른 연도의 값을 정당하게 보고할 수 있다. 스키마가 발행일만 포착한다면 다운스트림 로직은 두 값이 서로 다른 시점을 나타낸다는 것을 알 방법이 없으며, 시간적 차이를 모순으로 잘못 해석하게 된다.

구조적인 해결책은 추출 도구의 input_schema에서 각 추출된 수치에 대해 기준일 또는 수집일을 필드로 요구하는 것이다. 이는 Claude로 신뢰할 수 있는 구조화된 출력을 얻기 위한 표준 메커니즘이다. 이 필드를 추가하면 원본 문서가 측정 날짜를 명시하거나 암시할 때마다 모델이 그것을 표면화하도록 유도하며, 이 필드를 nullable로 만들면 날짜가 생략된 문서에서 모델이 값을 억지로 만들어내지 않고도 처리할 수 있다. 스키마 기반 도구 사용은 JSON의 문법적 유효성을 보장하지만 의미적 정확성까지 보장하지는 않으므로, 다운스트림 검증 로직은 여전히 필요하다. 그러면 조정(reconciliation) 과정에서 값을 시간순으로 정렬하고, 차이를 상충하는 데이터가 아니라 시간에 따른 변화(예를 들어 두 측정 시점 사이의 성장)로 해석할 수 있다.

다른 선택지들은 각기 특징적인 이유로 실패한다. 가장 최근에 발행된 값만 유지하는 것은 상충하는 통계에 대한 안티패턴인 임의 선택이며, 실제로는 새 문서가 오래된 데이터를 재게재할 때 오래된 측정값을 그대로 보존하는 결과를 낳을 수 있다. 단순한 conflict_detected 플래그는 불일치를 알리기만 할 뿐, 이를 해결하는 데 필요한 날짜 맥락은 제공하지 않는다. 저장된 값과 다른 추출을 거부하는 것은 정상적인 시간적 변화를 오류로 취급하여 변화하는 지표를 추적하는 시스템의 능력을 파괴한다.

스키마 기반 구조화된 출력에 대해서는 Tool use with Claude를, 집계 과정에서 출처 및 시간 관련 메타데이터를 보존하는 Anthropic의 가이드에 대해서는 How we built our multi-agent research system을 참고하라.

### 출처: Context Management & Reliability/시나리오5_고객지원.md
## 질문 6

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : During sessions where a customer raises several issues, the agent sometimes applies one issue's refund amount to a different issue's order once earlier turns have been summarized. How should per-issue transactional data be maintained?

**A(정답).** Keep each issue's order ID, amount, and status in a structured facts block outside the summarized history, updated as issues progress.

**설명**

이는 긴 세션 전반에서 정밀한 트랜잭션 데이터를 보존하기 위한 문서화된 패턴이다. 모든 프롬프트에 포함되는 구조화된 블록은 요약의 대상이 되지 않으므로, 몇 개의 턴이 압축되더라도 금액과 주문 ID는 올바른 이슈에 계속 결부되어 있다.

**B.** Raise the token threshold that triggers summarization so more complete turns remain in context before any compression occurs.

**설명**

임계값을 높이는 것은 요약이 정밀한 세부 사항을 훼손하는 시점을 늦출 뿐이다. 여러 이슈를 다루는 세션은 결국 그 임계값을 넘어서게 된다. 실패 양상은 그대로 남아있고, 단지 더 긴 세션으로 미뤄질 뿐이다.

**C.** Rewrite the summarization prompt to instruct that every order ID, dollar amount, and issue status be preserved verbatim in each summary.

**설명**

요약은 본질적으로 손실이 있고 확률적이다. 요약 프롬프트에 모든 수치를 그대로 유지하라고 지시하면 누락을 줄일 수는 있지만 없앨 수는 없으며, 요약 단계가 반복될수록 손실이 누적된다. 중요한 사실은 요약 품질에 의존하지 말고 요약된 이력의 바깥에 존재해야 한다.

**D.** Re-invoke lookup_order for every referenced order at the start of each turn so amounts always come from the backend, never from history.

**설명**

재조회는 백엔드의 원시 필드를 복구하지만, 매 턴마다 방대한 다중 필드 결과를 컨텍스트에 다시 주입하여 루프와 비대화를 초래한다. 또한 어떤 금액이 어떤 이슈에 합의되었는지, 고객이 무엇을 말했는지와 같은 대화 수준의 사실은 복구할 수 없는데, 이것이 바로 잃어버린 결부 관계다.

### 전반적인 설명

여기서 근본 원인은 점진적 요약의 함정이다. 이전 턴들이 압축될 때, 정밀한 트랜잭션 값(주문 ID, 금액, 상태)이 가장 먼저 모호한 표현으로 흐려지며, 특정 금액과 특정 이슈 사이의 연관 관계가 사라진다. 여러 이슈를 다루는 세션에서는 바로 이 연관 관계가 전부라고 할 수 있는데, 같은 고객이 동시에 여러 주문과 수치를 가지고 있기 때문이다.

신뢰할 수 있는 설계는 지속적인 사례 사실(case facts) 블록이다. 이슈별로(주문 ID, 금액, 상태, 합의된 해결책) 구조화된 레코드를 별도의 컨텍스트 레이어에 두고, 새로운 사실이 나타날 때마다 갱신하며, 대화 이력이 어떻게 압축되든 상관없이 모든 프롬프트에 포함시킨다. 이 블록은 절대 요약되지 않으므로, 세션이 얼마나 길어지든 정밀성이 유지된다. Anthropic의 memory tool은 바로 이런 종류의 상태를 활성 컨텍스트 윈도우 바깥에 지속시키기 위한 문서화된 메커니즘이며, 애플리케이션이 저장소를 직접 제어한다. 또한 structured outputs를 사용하면 이런 블록을 채울 스키마 검증된 이슈별 레코드를 생성할 수 있다.

각 대안은 모두 증상만 공격한다. 요약 프롬프트를 강화하는 방법은 중요한 데이터를 여전히 손실 가능한 경로에 남겨둔다. 지침이 잘 작성된 요약기라도 간혹 수치를 빠뜨리거나 잘못 귀속시키며, 요약 단계가 반복될수록 위험이 누적된다. 매 턴마다 주문을 재조회하는 방법은 백엔드의 진실을 복구하지만 방대한 다중 필드 결과로 컨텍스트를 채우며, 고객이 어떤 이슈에 대해 어떤 환불 금액을 받아들였는지와 같은 대화상의 사실은 여전히 재구성할 수 없다. 요약 임계값을 높이는 것은 절벽을 단순히 뒤로 미루는 것일 뿐이다. 가져야 할 사고 모델은, 정확해야 하는 것은 요약이 그것을 살려낼 수 있는지에 절대 의존해서는 안 된다는 것이다.

### 출처: Context Management & Reliability/시나리오5_고객지원.md
## 질문 7

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : The agent escalates "data inconsistency" cases whenever the store credit figure in its case facts block differs from a fresh get_customer result after a mid-session refund posts. Which change prevents this misinterpretation?

**A.** Store only one value per field in the case facts block, overwriting on each update so conflicting entries never coexist.

**설명**

암묵적인 덮어쓰기는 시간적 측면을 표현하지 않고 숨겨버린다. 에이전트는 환불 전 잔액이 얼마였는지에 대한 기록을 잃게 되는데, 이는 변경 사항을 고객에게 설명하고 세션 중 취해진 조치를 감사하는 데 필요하다.

**B.** Route every detected value discrepancy to escalate_to_human, since disagreeing financial figures suggest backend integrity issues.

**설명**

모든 불일치를 에스컬레이션하는 것은 정상적인 상태 전환을 결함으로 취급하는 것이며, 이는 상담원에게 일상적인 사례가 쏟아지게 만들어 최초 접촉 해결률 목표를 훼손한다. 여기서의 불일치는 환불 이후 예상되는 정상적인 동작이며, 백엔드 무결성 문제가 아니다.

**C.** Instruct the agent in the system prompt to always adopt whichever amount appeared later in the conversation when two figures disagree.

**설명**

일괄적인 최신성 규칙은 해석 메커니즘이 아니라 하나의 휴리스틱일 뿐이다. 이력이 요약되고 나면 대화상의 위치는 신뢰할 수 없게 되며, 나중에 언급된 값을 무조건 선호하는 방식은 실제로 조사나 에스컬레이션이 필요한 진짜 데이터 충돌마저 조용히 무시해버릴 수 있다.

**D(정답).** Record a capture timestamp alongside each fact in the case facts block so a later value is read as superseding the earlier one.

**설명**

이 방법이 정답인 이유는, 두 수치가 서로 충돌하는 것이 아니라 상태 변경 전과 후에 찍힌 동일 계정의 스냅숏이기 때문이다. 구조화된 사실에 수집 시각을 함께 기록하면 에이전트가 그 차이를 시간순으로 해석할 수 있게 되어, 환불이 잔액을 갱신한 것일 뿐 모순된 데이터가 드러난 것이 아니라는 것을 인식할 수 있다.

### 전반적인 설명

같은 필드에 대한 두 개의 다른 값이 모순이 되는 것은, 그 값들이 같은 시점을 나타낼 때뿐이다. 세션 중간에 환불이 처리되면 스토어 크레딧 잔액은 정당하게 변경되므로, 이전에 기록된 사실과 새로 조회한 도구 결과는 설계상 서로 다르게 나타난다. 여기서의 실패는 백엔드 데이터에 있는 것이 아니라, 에이전트의 컨텍스트가 그것을 표현하는 방식에 있다. 사례 사실 블록에 있는 단순한 숫자는 그것이 언제 참이었는지에 대한 표시를 전혀 담고 있지 않으므로, 에이전트는 상태 변화와 충돌을 구분할 방법이 없다.

해결책은 시간을 구조화된 출력의 1급 요소로 만드는 것이다. 각 사실에 수집 시각을 함께 기록하면 에이전트가 시간순으로 추론할 수 있게 된다. 즉 더 새로운 스냅숏이 이전 것을 대체하며, 이전 값은 감사 기록으로 계속 사용할 수 있다(고객이 환불 이전 금액을 언급할 때 유용하다). 이는 여러 출처를 종합하는 리서치에서 발행일과 수집일이 시간적 차이를 모순된 주장으로 잘못 해석하지 않도록 방지하는 것과 같은 원리이며, 여기서는 세션 내 도구 데이터에 적용된 것이다.

각 대안은 각기 특징적인 방식으로 실패한다. 나중에 언급된 값을 선호하는 프롬프트 규칙은 대화상의 순서에 의존하는데, 이는 요약이 이루어지면 신뢰도가 떨어지며, 주의가 필요한 진짜 충돌마저 감출 수 있다. 필드를 덮어써서 하나의 값만 남기는 방법은 불일치를 해석하는 대신 억누르는 것이며, 변경 사항을 설명하는 데 필요한 이력을 파괴한다. 모든 불일치를 에스컬레이션하는 것은 일상적이고 예상되는 상태 전환을 인적 업무로 전환시켜, 높은 최초 접촉 해결률 목표에 정면으로 반한다. 견실한 컨텍스트 엔지니어링이란 모델이 올바르게 추론할 수 있도록 윈도우에 들어가는 내용을 구조화하는 것이며, 필요한 정보를 제거하거나 순서만 바꾸는 것이 아니다. Effective context engineering for AI agents와 Context windows를 참고하라.

### 출처: Context Management & Reliability/시나리오5_고객지원.md
## 질문 9

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : Escalation handoffs currently arrive as one long prose paragraph in which refund amounts, the dispute narrative, and the actions already attempted are interleaved, and receiving human agents report misreading amounts and repeating steps. How should the handoff output be formatted?

**A.** Emit the complete handoff as one strict JSON object so every field is parsed consistently by any consumer.

**설명**

이 인계 문서를 소비하는 것은 직접 읽는 사람 상담원이며, 원시 JSON 덩어리는 잘 표현된 혼합 형식보다 사람이 훑어보기 어렵다. 엄격한 JSON은 기계 간 인계에는 유용하지만, 여러 콘텐츠 유형이 혼합된 내용의 사람 가독성 문제는 해결하지 못한다.

**B.** Instruct the agent to remove all formatting so the handoff reads as continuous plain natural language.

**설명**

이는 현재의 실패 양상을 그대로 유지한다. 일반 문장은 금액을 잘못 읽고 완료된 단계를 놓치게 만드는 바로 그 형식이다. Anthropic의 형식 지정 가이드는 모든 곳에서 구조를 없애라고 권장하지 않는다. 항목이 진정으로 개별적일 때는 목록과 표가 여전히 적절하다.

**C.** Present the entire handoff as one uniform table so every fact occupies a labeled row for quick scanning.

**설명**

모든 내용을 하나의 표에 억지로 넣으면 서사적 맥락이 좁은 셀 안에 눌려버려, 설명적인 문장이 필요한 분쟁 배경이 왜곡된다. 여기서 근본 문제는 일률적인 형식 그 자체이며, 하나의 일률적 형식을 다른 일률적 형식으로 바꾼다고 해서 해결되지 않는다.

**D(정답).** Render refund figures as a table, the dispute background as prose, and the attempted actions as a structured list.

**설명**

이 방법이 정답인 이유는, 콘텐츠 유형마다 자연스러운 표현 방식이 있기 때문이다. 숫자로 된 금융 데이터는 표로 볼 때 가장 정확하게 훑어볼 수 있고, 서사적 맥락은 일반 문장으로 읽는 것이 가장 좋으며, 개별적으로 완료된 조치는 목록에 속한다. 형식을 콘텐츠 유형에 맞추면 금액이 문장 속에 묻히거나 단계가 누락되는 것을 방지할 수 있다.

### 전반적인 설명

여기서 설명된 실패는 일률적 형식 종합 문제다. 서로 다른 유형의 콘텐츠(수치, 서사, 개별 조치)가 하나의 표현 방식으로 눌려버렸고, 각 콘텐츠 유형은 각기 다른 방식으로 피해를 입었다. 문장 중간에 삽입된 금액은 잘못 읽기 쉽고, 문장 형태로 작성된 일련의 시도된 조치는 놓치기 쉬워 상담원이 이미 한 작업을 반복하게 된다. 신뢰할 수 있는 설계 원칙은 콘텐츠 유형에 따라 표현 방식을 달리하는 것이다. 금융 데이터는 표로, 설명적인 배경은 일반 문장으로, 기술적이거나 절차적인 사항은 구조화된 목록으로 표현한다.

이것이 효과적인 이유는 형식이 단순한 장식이 아니라, 독자가 정보를 찾고 검증하는 방식 자체이기 때문이다. 표는 모든 수치에 라벨이 붙은 위치를 부여하므로, 89.99달러의 환불액이 문단 속에 숨을 수 없다. 목록은 각 시도된 조치를 개별적으로 확인 가능한 항목으로 만든다. 일반 문장은 사건들 사이의 관계가 훑어보기보다 더 중요한 분쟁의 인과적 서사를 전달하는 데 여전히 적합한 수단이다. Anthropic의 프롬프팅 가이드도 이를 뒷받침한다. 모델이 알맞은 표현 방식을 스스로 추론할 것이라고 가정하기보다, 원하는 출력 형식을 명시적으로 지정하고, 항목이 개별적이거나 순서가 중요할 때는 목록을 사용하며, 형식을 목적에 맞춰야 한다. 특히 Anthropic 자체의 형식 지정 가이드도 모든 곳에서 구조를 없애라고 권장하지 않는다는 점이 눈에 띈다. 마크다운을 최소화하라는 예시에서도 진정으로 개별적인 항목에는 목록을 여전히 허용한다.

일률적인 대안들은 모두 예측 가능한 방식으로 실패한다. 하나의 거대한 표는 서사를 셀 안에 억지로 밀어 넣어 인과적 맥락을 잃게 만든다. 원시 JSON 객체는 명시된 소비자가 대화 기록에 접근할 수 없는 사람 상담원, 즉 읽기 쉽고 자기 완결적인 요약이 필요한 상담원인 상황에서 기계 파싱에 최적화된 방식이다. 형식이 전혀 없는 일반 문장은 단순히 보고된 실패를 그대로 재현할 뿐이다. 출력 형식을 명시적으로 제어하는 방법에 대해서는 Prompt templates and variables를, 출력 형식을 정밀하게 정의하는 방법에 대해서는 Increase output consistency를 참고하라.

### 출처: Context Management & Reliability/시나리오6_생산성도구.md
## 질문 1

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : Two research subagents return dated findings on a CI vendor's job concurrency limit: a source published in 2023 states 20 jobs, and a source published in 2025 states 60. The synthesis step currently flags this as an unresolved contradiction. How should the final report handle these values?

**A.** Exclude the metric from the report and record a coverage gap until a third source confirms one of the two values.

**설명**

커버리지 갭 표시는 시스템이 확보하지 못한 정보에 사용하는 것이며, 두 번 확보한 정보에 사용하는 것이 아니다. 날짜만으로 이미 설명되는 지표를 보류하는 것은 보고서의 유용성을 떨어뜨리고, 시간적 차이를 누락된 데이터인 것처럼 왜곡한다.

**B(정답).** Present the 2025 figure as current and the 2023 figure as historical, with dates showing a likely change over time.

**설명**

이것이 올바른 시간적 해석이다. 발행 날짜를 수집한 이유는 오래된 소스와 최신 소스 간의 차이를 사실적 모순이 아니라 벤더의 제한값이 변경되었을 가능성으로 읽을 수 있게 하기 위함이다. 두 값을 날짜와 함께 보존하면 보고서의 투명성을 유지하면서도 독자에게 현재 값을 제공할 수 있다.

**C.** Escalate the discrepancy to a human reviewer, since two credible sources disagree on a factual value the report depends on.

**설명**

에스컬레이션은 시스템이 해석할 수 없는 진짜 충돌에 대해서는 타당하지만, 이 경우에는 날짜가 이미 그 차이를 시간에 따른 변화로 설명해준다. 해결 가능한 시간적 차이를 사람에게 넘기는 것은 메타데이터로 이미 해결된 사안에 검토자 역량을 낭비하는 것이다.

**D.** Drop the 2023 figure from the report entirely, since a newer publication always supersedes an older one on the same fact.

**설명**

오래된 값을 조용히 버리는 것은 날짜를 수집한 목적 자체인 정보 보존을 무너뜨린다. 최신성은 해석을 돕는 맥락일 뿐, 자동으로 우선하는 규칙이 아니다. 과거 값을 제거하면 제한값이 변경되었다는 사실 자체도 숨겨지는데, 이는 오래된 구성이나 캐시된 가정에서 중요할 수 있다.

### 전반적인 설명

서브에이전트의 구조화된 출력에 발행일 또는 데이터 수집일을 요구하는 근본적인 이유는 바로 이런 순간을 위해서다. 동일한 사실에 대한 두 값이 다를 때, 날짜가 있으면 이후의 종합(synthesis) 단계에서 시간적 차이(측정 사이에 값이 변경됨)와 진짜 모순(두 소스가 같은 시점에 대해 서로 다르게 말함)을 구분할 수 있다. 2023년 소스가 20을, 2025년 소스가 60을 보고한 것은 벤더가 제한값을 높였을 가능성이 가장 크므로, 올바른 표현 방식은 최신 값을 현재값으로 제시하면서 이전 값도 날짜와 함께 과거 맥락으로 유지하는 것이다. 날짜가 없다면 이 두 숫자는 해결 불가능한 충돌과 구분할 수 없다.

여기서의 핵심 사고방식은 날짜가 결정을 내리는 기준(타이브레이커)이 아니라 해석을 돕는 메타데이터라는 것이다. 오래된 값을 자동으로 버리는 것은 최신성을 우선 규칙으로 취급하여 출처 정보를 조용히 파괴하는 것이며, 보고서는 독자가 값이 변화했음을 볼 수 있게 해야 한다. 사람에게 에스컬레이션하는 것은 메타데이터로 이미 해결된 사안에 귀중한 검토 자원을 낭비하는 것이며, 지표를 커버리지 갭으로 제외하는 것은 (변화하긴 했지만) 성공적으로 확보한 정보를 누락된 것으로 잘못 분류하는 것이다. 에스컬레이션과 갭 표시는 비슷한 시기의 소스들이 진짜로 의견이 다르거나 데이터를 실제로 확보하지 못했을 때에는 여전히 올바른 도구다.

아키텍처 관점에서 이러한 처리는 서브에이전트 경계에서 미리 설계되어야 한다. 서브에이전트는 각자의 컨텍스트 윈도우 안에서 실행되며 원본 증거가 아닌 압축된 요약을 반환하므로, 구조화된 출력에 담기지 않은 날짜는 이후의 코디네이터와 종합 단계에서 사용할 수 없다. 이러한 격리된 컨텍스트와 그 반환값이 어떻게 동작하는지는 서브에이전트 관련 문서를 참고하라. 출력 스키마에 날짜를 필수로 요구하는 것이 바로 종합 시점에서 올바른 시간적 해석을 가능하게 하는 요소다.

### 출처: Context Management & Reliability/시나리오6_생산성도구.md
## 질문 2

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : An engineer's multi-day investigation of a legacy payments module spans several sessions. Each new session begins with a fresh context window, so the agent repeats hours of file discovery every time. Which practice best eliminates this rediscovery?

**A.** Run /compact before ending each session so the compacted summary is carried forward into the next session's context.

**설명**

/compact 명령은 진행 중인 세션이 계속될 수 있도록 현재 대화를 압축하는 것일 뿐, 상태를 이후 세션으로 넘겨주지 않는다. 새 세션은 여전히 새로운 컨텍스트 윈도우로 시작하므로 압축된 요약은 그곳에서 사용할 수 없다.

**B.** Copy every discovered class, dependency, and code path into the project CLAUDE.md so it loads automatically at startup.

**설명**

CLAUDE.md는 모든 세션에 적용되어야 할 안정적인 프로젝트 규칙과 가이드를 위한 곳이며, 그 안의 모든 줄은 주의력을 다투게 된다. 조사에 특화된 결과물을 그곳에 쏟아 넣으면 이후 모든 세션의 컨텍스트가 비대해지고 중요한 규칙이 지켜지는 신뢰도가 떨어진다.

**C(정답).** Have the agent record key findings in a scratchpad file as it works, then read that file at the start of each new session.

**설명**

이것이 컨텍스트 경계를 넘어 지식을 유지하는 올바른 패턴이다. 스크래치패드 파일은 워크스페이스 안의 일반적인 외부 상태로 존재하므로, 새 세션은 몇 시간 걸릴 탐색을 다시 수행하는 대신 단 한 번의 읽기로 정제된 결과를 불러올 수 있다.

**D.** Prompt the agent at session start to recall its earlier discoveries, since prior tool results remain accessible to the model.

**설명**

Claude는 세션 간 메모리가 없다. 이전 도구 실행 결과는 그것을 만들어낸 세션의 대화 기록 안에만 존재한다. 새 세션에 그것을 회상하라고 요청하면 실제 발견 내용이 아니라 전형적인 패턴에 기반한 허구적인 답변을 유도하게 된다.

### 전반적인 설명

이 문제를 결정짓는 사고방식은 Claude가 상태를 갖지 않는다(stateless)는 것이다. 새로운 Claude Code 세션은 매번 새로운 컨텍스트 윈도우로 시작하며, 워크플로가 의도적으로 외부화하지 않는 한 이전 대화의 어떤 것도 남지 않는다. 지식이 세션 경계를 넘는 유일한 방법은 CLAUDE.md 메모리 파일처럼 다시 불러올 수 있는 산출물이나, 에이전트가 요청 시 읽는 워크스페이스의 일반 파일을 통하는 것뿐이다. 스크래치패드 파일은 바로 이 점을 활용한다. 에이전트가 클래스, 의존성, 호출 경로를 추적하면서 정제된 결과를 investigation-scratchpad.md 같은 파일에 덧붙여 나간다. 이 파일은 모델이 기억해서가 아니라 디스크상의 외부 상태이기 때문에 유지되며, 다음 세션은 이를 몇 초 만에 읽어 확립된 사실에서부터 다시 시작할 수 있어 탐색을 재실행할 필요가 없다. Anthropic은 여러 컨텍스트 윈도우에 걸친 작업에 대해 이 패턴을 문서화하고 있으며, 새 세션이 시작 시 검토할 명시적 상태 파일(상태용 구조화 JSON, 진행 상황용 자유 형식 노트, 체크포인트용 git)을 권장한다.

다른 대안들은 각각 상태가 실제로 어디에 존재하는지를 오해하고 있다. /compact는 세션 내부의 임시 해소 장치로, 하나의 긴 세션이 계속될 수 있도록 실행 중인 대화를 요약하지만, 그 요약은 해당 세션의 컨텍스트에 속하며 새 세션이 시작되면 사라진다. 작업 특화적 발견 내용을 CLAUDE.md에 채워 넣는 것은 지속적인 프로젝트 규칙을 위한 공간을 잘못 사용하는 것이다. 메모리 파일은 모든 세션에 로드되므로, 파일이 커지면 이후 모든 컨텍스트가 비대해지고 정작 중요한 규칙에 대한 주의력이 희석된다. 그리고 새 세션에 이전 발견 내용을 회상하도록 요청하는 것은 존재하지 않는 숨겨진 모델 메모리를 전제하는 것이며, 그 결과로 특정 코드베이스가 아닌 일반적인 패턴에서 나온 확신에 찬 답변이 나올 가능성이 크다.

문서화된 패턴에 대해서는 Claude의 메모리 관리 및 외부 상태 파일에 관한 프롬프트 엔지니어링 가이드를 참고하라.

### 출처: Context Management & Reliability/시나리오6_생산성도구.md
## 질문 3

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : While mapping a legacy service, the agent reports the API rate limit as contradictory (100 vs 500 requests per minute) because a wiki page and a README were written years apart. What change prevents temporal differences from surfacing as contradictions?

**A.** Have the agent average the conflicting numeric values into a single figure and note in the report that sources varied.

**설명**

값을 평균 내는 것은 어떤 소스도 문서화한 적 없는 숫자를 만들어내는 것으로, 기술 보고서에서는 두 원본 값 중 어느 것보다도 나쁘다. 또한 이 차이가 진짜 불일치가 아니라 시간적인 것임을 전혀 드러내지 못한다.

**B(정답).** Require each structured finding to include its source's last-updated date so differing values can be interpreted chronologically.

**설명**

각 결과물에 발행일 또는 최종 수정일을 함께 기록하면 에이전트와 이후 독자가 진짜 모순과 시간이 지나며 단순히 변경된 값을 구분할 수 있다. 두 속도 제한값은 충돌이 아니라 타임라인(예전 제한값이 새 값으로 대체됨)으로 이해된다.

**C.** Add a post-processing step that keeps whichever value was fetched most recently during the session and silently discards the other.

**설명**

가져온 시점은 에이전트가 그 소스를 언제 읽었는지를 반영할 뿐, 소스의 내용이 언제 작성되었는지를 반영하지 않으므로 오래된 값을 남길 수도 있다. 또한 하나의 값을 조용히 버리는 것은 불일치를 설명하는 대신 숨기는 것이다.

**D.** Instruct the agent to prefer the value from whichever source it judges more authoritative and omit the conflicting one.

**설명**

권위성에 기반한 판단은 시간적 차이를 해결하지 못한다. 권위 있지만 오래된 위키 페이지가 대체된 값을 여전히 담고 있을 수 있다. 다른 값을 생략하면 제한값이 시간이 지나며 변경되었다는 증거 자체가 사라진다.

### 전반적인 설명

에이전트가 문서, 위키, README, 코드 히스토리에서 결과를 종합할 때, 소스가 서로 다른 시점에 작성되었기 때문에 같은 사실에 대해 서로 다른 값이 나타나는 경우가 많다. 시간적 메타데이터가 없으면 종합 단계는 진짜 모순(현재 유효한 두 소스가 서로 다르게 말함)과 시간적 차이(하나의 값이 다른 값으로 대체됨)를 구분할 방법이 없다. 구조적인 해결책은 에이전트의 구조화된 출력에 담긴 모든 결과물에 소스의 발행일 또는 최종 수정일을 필수로 포함시키는 것이다. 그러면 이후의 추론이 값을 시간순으로 정렬할 수 있어, "위키(2021년)는 100이라 하고 README(2024년)는 500이라 한다"는 충돌이 아니라 증가로 읽힌다.

이는 출처 추적을 위한 주장-소스 매핑과 같은 원칙이다. 값을 설명하는 메타데이터는 값과 함께 데이터로 전달되어야 하며, 나중에 재구성할 수 없기 때문이다. 하나의 숫자만 선택하는 방식(가져온 시점 기준, 인지된 소스 권위 기준, 평균 기준)은 모두 정보를 버린다. 특히 가져온 시점은 흔한 함정으로, 이는 에이전트가 페이지를 읽은 시점을 기록할 뿐 그 페이지 내용이 사실이었던 시점을 기록하지 않는다. 평균은 더 나쁘다. 어떤 소스도 말한 적 없는 수치를 만들어낸다. 두 값을 날짜와 함께 보존하면 보고서가 정직하게 유지되고, 사람이나 코디네이터가 의도적으로 조정할 수 있다.

에이전트가 단계 사이에서 컨텍스트를 구조화하고 전달하는 방법에 대한 배경은 다중 에이전트 리서치 시스템 구축 사례와 AI 에이전트를 위한 효과적인 컨텍스트 엔지니어링 자료를 참고하라.

### 출처: Prompt Engineering & Structured Output/시나리오1_CICD.md
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

### 출처: Prompt Engineering & Structured Output/시나리오1_CICD.md
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

### 출처: Prompt Engineering & Structured Output/시나리오1_CICD.md
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

### 출처: Prompt Engineering & Structured Output/시나리오1_CICD.md
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

### 출처: Prompt Engineering & Structured Output/시나리오1_CICD.md
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

### 출처: Prompt Engineering & Structured Output/시나리오1_CICD.md
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

### 출처: Prompt Engineering & Structured Output/시나리오1_CICD.md
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

### 출처: Prompt Engineering & Structured Output/시나리오2_개발가속화.md
## 질문 5

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : The refactoring report is produced through tool_use with a strict JSON schema. Every report now parses cleanly, yet issue counts sometimes disagree with the items actually listed, and fixes occasionally appear under the wrong file path. What should the team do?

**A.** Set the sampling temperature to zero so the model assigns values to fields deterministically and counts stay consistent.

**설명**

온도는 토큰 선택의 변동성을 제어할 뿐 정확성을 제어하지는 않는다. 결정론적인 모델도 값을 계속해서 잘못된 필드에 배치하거나 서로 맞지 않는 개수를 만들어낼 수 있으므로, 이는 의미적 격차를 해결하지 못한다.

**B.** Switch back to prompt-based JSON output with strong formatting instructions, since tool_use is mishandling the field assignments.

**설명**

tool_use를 포기하는 것은 그것을 도입한 목적인 구문 및 파싱 실패를 다시 불러들이면서도 의미적 정확성에는 아무런 도움이 되지 않는다. 잘못 배치된 값은 모델의 추출 과정에서 발생한 것이며, tool_use 메커니즘 자체의 문제가 아니다.

**C(정답).** Add code-level semantic validation that recomputes counts against the listed items and cross-checks each fix's file path.

**설명**

이는 올바른 답이다. JSON 스키마와 함께 사용하는 tool_use는 구문적, 구조적 준수만을 보장할 뿐 값의 진위나 내부 일관성을 보장하지는 않는다. 스키마는 구조만 강제한다. 개수 불일치나 잘못된 경로 배치와 같은 의미적 오류는 추출 이후 코드 내 검증 로직으로 잡아내야 한다.

**D.** Tighten the schema with stricter required-field and type constraints so the schema validator can reject misplaced or internally inconsistent values.

**설명**

JSON 스키마는 타입, 필수 여부, 열거값을 제약할 수 있지만, 이러한 제약을 강화한다고 해서 개수가 나열된 항목 수와 일치하는지, 수정 사항이 올바른 파일에 속하는지와 같은 관계를 검증할 수는 없다. 여기서의 실패는 의미적인 것이므로, 더 엄격한 구조 규칙으로는 해결되지 않는다.

### 전반적인 설명

여기서 유지해야 할 사고 모델은 두 층으로 이루어진 보장이다. JSON 스키마와 함께 tool_use를 사용하는 것은 구조화된 출력을 얻는 가장 신뢰할 수 있는 방법이다. 모델은 도구의 input_schema를 따르는 입력을 생성하도록 학습되어 있으므로, 중괄호가 제대로 닫히고, 필수 필드가 존재하며, 타입이 일치한다. 이는 (마크다운 펜스, 부가 설명, 손상된 구문 같은) 실패 클래스 전체를 원천적으로 제거한다. 하지만 그 보장은 형태에서 멈춘다. tool_use 스키마는 구문, 타입, 필수 구조를 강제하지만, 어떤 개수가 그 아래 나열된 항목 수와 실제로 일치하는지, 수정 사항이 올바른 파일에 귀속되는지와 같은 의미적 정확성이나 소스에 근거한 일관성은 보장하지 않는다.

이러한 설계에서 나오는 결론은, 구조화된 추출 파이프라인에는 두 번째 층이 필요하다는 것이다. 파생된 값을 재계산하고, 필드 배치를 소스와 대조하며, 비즈니스 규칙을 적용하는 코드 수준의 검증(커스텀 검증기)이 그것이다. 유용한 패턴은 모델이 자체 점검용 필드를 함께 출력하도록 하는 것이다. 예를 들어 stated_total과 calculated_total을 모두 추출하게 하면, 둘이 불일치할 때 conflict_detected 플래그를 발생시켜 후속 시스템이 대응할 수 있게 하고, 이는 보통 오류 피드백을 동반한 재시도 루프로 이어진다.

스키마를 더 엄격하게 만드는 것은 이 실패를 해결하지 못한다. tool_use가 제공하는 강제력은 구조와 타입을 다루는 것이지, 값들이 서로 맞는지나 소스에 근거하고 있는지를 다루는 것이 아니기 때문이다. 프롬프트 기반 JSON으로 되돌아가는 것은 이미 해결된 문제(구문)를 다시 미해결 상태로 되돌리면서 의미적 문제는 그대로 남겨두는 것이다. 온도를 낮추는 것은 출력을 더 반복 가능하게 만들 뿐이며, 반복 가능한 오답도 여전히 오답이다. 스키마로 제약된 도구 입력이 어떻게 동작하고 그 보장이 어디서 끝나는지에 대해서는 Tool use with Claude를 참고하라.

### 출처: Prompt Engineering & Structured Output/시나리오2_개발가속화.md
## 질문 7

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : Your CI step validates Claude Code's refactor summaries against a JSON schema, and a downstream parser fails whenever a key is absent. The required string field ticket_id gets fabricated when no tracking ticket exists. What schema change is correct?

**A.** Keep ticket_id as a required string and add a strongly worded prompt instruction forbidding invented ticket identifiers.

**설명**

프롬프트 지시로는 구조적 모순을 해결할 수 없다. 스키마는 여전히 모든 출력에 문자열 값을 요구하므로, 티켓이 없을 때 모델은 지시를 따르면서도 스키마를 만족시킬 방법이 없다. 조작은 스키마 때문에 생기는 것이며, 스키마를 바꾸어야만 그 압박이 제거된다.

**B.** Keep the schema unchanged and instruct the model to write the sentinel value NONE into ticket_id when no ticket exists.

**설명**

센티널 문자열은 안티패턴이다. 스키마가 아니라 지시 준수에 의존하며, 모든 소비자가 특별히 처리해야 하는 매직 값으로 필드의 타입을 오염시키고, NONE처럼 유효해 보이는 문자열은 실제 데이터와 혼동될 수 있다. JSON은 이미 부재를 명시적으로 표현하기 위한 null을 갖고 있다.

**C(정답).** Keep ticket_id in the required list but change its type to ["string", "null"] so the model returns null when no ticket exists.

**설명**

이는 올바른 답이다. optional과 nullable은 서로 다른 스키마 선택이다. 필드를 필수로 유지하면 후속 파서에게 키가 항상 존재함을 보장하고, null 타입은 모델에게 그럴듯한 티켓 ID를 조작하는 대신 부재를 정직하게 표현할 방법을 제공한다.

**D.** Remove ticket_id from the required list so the model can omit the field entirely whenever a refactor has no tracking ticket.

**설명**

필드를 optional로 만들면 조작은 멈추지만, 출력 객체에서 키가 아예 없을 수 있게 되며 이는 후속 파서가 허용할 수 없는 상황이다. 명시된 제약 조건은 키가 없으면 역직렬화가 깨진다는 것이므로, 부재는 필드를 생략하는 것이 아니라 명시적인 null로 표현해야 한다.

### 전반적인 설명

여기서 근본 원인은 모델에게 정직하게 행동할 방법을 남겨두지 않는 스키마다. ticket_id가 필수 문자열일 때, 스키마를 준수하는 모든 출력은 그것에 대한 문자열 값을 포함해야 한다. 티켓이 없는 리팩터의 경우 스키마를 만족시키는 유일한 방법은 값을 조작해내는 것이다. 지나치게 엄격한 스키마 아래에서의 조작은 모델의 버그가 아니라 스키마가 작성된 그대로 동작하는 것이므로, 수정은 지시가 아니라 구조적인 방식이어야 한다.

핵심적인 설계 구분은 optional 필드와 nullable 필드의 차이다. optional 필드(required에서 제외됨)는 출력 객체에서 완전히 생략될 수 있다. nullable 필드(["string", "null"]과 같은 유니온 타입)는 반드시 나타나야 하지만 null 값을 가질 수 있다. Anthropic이 지원하는 JSON Schema 하위 집합에는 null 타입과 이러한 타입 유니온이 포함되어 있는데, 이는 정확히 부재를 명시적으로 표현할 수 있도록 하기 위함이다. 이 파이프라인의 파서는 키가 없을 때 오류를 내므로, 올바른 형태는 필수이면서 nullable한 것이다. 즉 모든 요약에 키가 존재하고, null은 명확하게 티켓이 없음을 의미한다. 참고로, 구조화된 출력은 대부분의 경우 응답을 스키마에 맞게 제약하지만, 문서화된 예외(예를 들어 거부 응답이나 최대 토큰 잘림)가 존재하므로 후속 검증은 여전히 가치가 있다.

대안들은 각자의 기준에서 실패한다. 필드를 required에서 제외하는 것은 조작을 없애는 대신 키 누락 문제를 초래하여, 명시된 역직렬화 계약을 깨뜨린다. 프롬프트 지시는 모델이 어차피 만족시켜야 하는 엄격한 구조적 요구 사항과 지침을 서로 충돌시키는 것이다. NONE과 같은 센티널 문자열은 정상 범위 내의 값에 범위 밖의 의미를 몰래 끼워넣는 것으로, null이 정확히 이 목적을 위해 이미 존재하는데도 모든 소비자가 이를 특별 처리하도록 강제한다.

지원되는 스키마 기능과 가이드에 대해서는 Structured Outputs와 Increase output consistency를 참고하라.

### 출처: Prompt Engineering & Structured Output/시나리오2_개발가속화.md
## 질문 8

**SCENARIO** : You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

**QUESTION** : The team's automation that extracts structured refactoring findings previously requested JSON in plain text; it now defines an extraction tool with an enforced input schema. Which downstream post-processing step can be safely retired?

**A.** Retire the validator that confirms each severity label matches the seriousness of the described issue.

**설명**

스키마 enum은 심각도를 허용된 값으로 제한할 수 있지만, 선택된 라벨이 설명된 이슈에 적절한지는 판단할 수 없다. 필드 간의 의미적 일관성은 스키마 강제가 보장하는 범위 밖에 있으므로, 이 검증기는 여전히 필요하다.

**B.** Retire the entire validation layer, since schema-conformant extractions are guaranteed to be accurate.

**설명**

이는 보장 범위를 과장한 것이다. 스키마 준수는 올바른 구조, 타입, 필수 필드를 보장할 뿐 사실적 정확성이나 값의 내부 일관성을 보장하지 않으므로, 모든 검증을 제거하면 의미적 오류가 검증되지 않은 채로 후속 단계로 흘러가게 된다.

**C.** Retire the check that confirms each finding's file path and line number exist in the repository.

**설명**

이 검사는 의미적 정확성을 검증하는 것이다. 값이 실제 위치를 가리키는지 여부다. 스키마는 경로가 문자열이고 줄 번호가 정수라는 것만 강제할 수 있으며, 참조된 위치가 실제로 존재하는지는 확인할 수 없으므로 이 검증은 계속 남아 있어야 한다.

**D(정답).** Retire the repair logic that stripped markdown fences and re-parsed malformed JSON before ingestion.

**설명**

이는 올바른 답이다. 스키마로 강제된 tool_use는 구문적으로 유효하고 스키마를 준수하는 JSON을 구조적으로 보장한다. 손상된 구문, 불필요한 설명, 마크다운 펜스는 바로 tool_use 채널이 제거하는 실패 유형이므로, 복구 및 재파싱 코드는 더 이상 잡아낼 것이 없다.

### 전반적인 설명

여기서 유용한 사고 모델은 경계선이다. 스키마로 강제된 구조화된 출력은 Claude가 생성하는 것의 형태를 제약할 뿐, 그 안에 담긴 값의 의미를 제약하지는 않는다. 출력이 input_schema에 대해 검증된 도구 입력으로 도착하면(또는 Anthropic의 구조화된 출력 기능을 통해), 형식이 올바른 JSON, 올바르게 타입이 지정된 필드, 모든 필수 속성이 존재함을 얻게 된다. 이는 자유 텍스트 시대를 위해 만들어진 방어 기법(펜스 제거, 구문 복구, 재파싱 재시도) 전체가 죽은 코드가 된다는 뜻이다. 그것이 막으려던 실패는 더 이상 발생할 수 없다. 출력이 구조적으로 스키마에 맞게 만들어지기 때문이다.

바뀌지 않는 것은 경계선의 의미적인 쪽에 있는 모든 것이다. strict tool use에서 Anthropic이 문서화하는 보장은 스키마 준수다. 유효한 도구 이름, 올바른 타입, 필수 필드 누락 없음이다. 이 보장에는 파일 경로가 실제 파일을 가리키는지, 줄 번호가 diff 범위 내에 있는지, 심각도 라벨이 설명된 이슈에 맞는지에 대한 내용은 전혀 없다. 이런 것들은 값과 실제 세계 사이의 관계이며, 오직 코드 수준의 검증만이 확인할 수 있다. 위치 존재 여부 검사나 심각도 일관성 검증기를 폐기하면 그럴듯하지만 잘못된 추출 결과를 조용히 통과시키게 되며, 검증 계층 전체를 폐기하는 것은 구조적 보장을 정확성 보장으로 착각하는 것이다.

이러한 구분 뒤에 있는 설계 의도는 명확하다. 제약된 생성은 문법을 저렴하고 결정론적으로 강제할 수 있지만, 콘텐츠의 정확성은 원본 자료에 의존하며 스키마가 표현할 수 없는 검증 로직을 필요로 한다. 아키텍처적으로 올바른 방향은 스키마 강제를 도입한 후 구문 복구 코드는 삭제하고, 의미적 검증은 유지하거나 오히려 강화하는 것이다.

### 출처: Prompt Engineering & Structured Output/시나리오3_리서치시스템.md
## 질문 1

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : Reviewers dismiss roughly a third of the inconsistency findings produced by the document-analysis subagent, but nobody can tell which detection behaviors generate the false positives. What change best enables systematic analysis of the dismissals?


**A(정답).** Add a detected_pattern field to the finding schema recording which rule or signal triggered each flag, then group dismissed findings by that value.

**설명**

이 답이 정답인 이유는, 모든 finding에 기계 판독이 가능한 패턴 필드를 붙이면 기각된 finding들을 그 원인이 된 트리거별로 집계할 수 있기 때문이다. 기각 사례가 특정 패턴을 중심으로 모이기 시작하면, 팀은 어떤 탐지 로직을 고쳐야 하는지 또는 비활성화해야 하는지를 정확히 알 수 있게 되며, 이는 막연한 불만을 프롬프트와 판정 기준을 목표로 개선하는 작업으로 전환시킨다.

**B.** Store the full reasoning transcript alongside each finding so an engineer can read through dismissed cases and infer common causes manually.

**설명**

원본 트랜스크립트는 구조화되어 있지 않기 때문에, 반복되는 원인을 파악하려면 느린 수동 검토가 필요하며 이는 규모가 커지면 감당할 수 없고 자동으로 집계하거나 추이를 분석할 수도 없다. 구조화된 패턴 필드는 동일한 진단 신호를 쿼리와 대시보드가 바로 활용할 수 있는 형태로 포착한다.

**C.** Add a self-rated confidence field to each finding and suppress low-confidence flags so reviewers only see findings the model considers reliable.

**설명**

모델이 자체 평가한 신뢰도는 보정이 제대로 되어 있지 않으며, 이를 기준으로 필터링하면 기각 원인을 설명하는 대신 finding을 그냥 숨겨버리게 된다. 어떤 탐지 로직이 오탐을 유발하는지 드러내지 못하므로, 리뷰어에게 도달하는 플래그 수가 줄어들더라도 근본 패턴은 여전히 진단되지 않은 채로 남는다.

**D.** Ask reviewers to enter free-text dismissal notes in the review tool and periodically summarize the notes to spot recurring themes.

**설명**

자유 텍스트 메모는 진단 작업을 사람에게 떠넘기며, 일관성이 없고 집계하기 어려운 데이터를 만들어낸다. 게다가 리뷰어들은 흔히 메모 작성을 건너뛰거나 축약해버린다. finding 자체는 이미 무엇이 자신을 트리거했는지 알고 있으므로, 생성 시점에 패턴을 기록하는 것이 리뷰어의 서술문으로부터 사후에 재구성하는 것보다 훨씬 신뢰할 수 있다.

### 전반적인 설명

사람이 자동화된 finding을 반복적으로 기각할 때 실질적으로 중요한 질문은 오탐이 몇 건인지가 아니라 어떤 탐지 로직이 그것들을 만들어내는가이다. 설계상의 해답은 각 finding이 자체 진단 메타데이터를 갖도록 하는 것이다. 즉, 어떤 규칙, 휴리스틱, 신호가 플래그를 촉발했는지를 명시하는 detected_pattern 필드를 출력 스키마에 두는 것이다. 이 필드가 구조화된 출력의 일부이므로 모든 finding에는 이 값이 채워진 채로 도착하며, 기각된 finding들을 패턴별로 그룹화하고 개수를 세고 추이를 볼 수 있게 된다. 특정 패턴이 기각의 대부분을 차지한다면, 팀은 정확한 목표를 갖게 된다. 그 패턴의 판정 기준을 개선하거나, 대조되는 few-shot 예시를 추가하거나, 수정이 완료될 때까지 해당 카테고리를 비활성화할 수 있다.

여기서 지켜야 할 사고 모델은 finding이 단순한 발언이 아니라 하나의 레코드여야 한다는 것이다. Anthropic의 구조화된 출력은 JSON Schema에 정의된 필드가 반드시 존재하고 타입이 지정되도록 보장한다. 따라서 detected_pattern을 (문자열이나 알려진 트리거 유형의 열거형으로) 추가하고 required 목록에 포함시키며 객체에 additionalProperties를 false로 설정하면, 이 진단 신호는 사후에 재구성해야 하는 것이 아니라 모든 finding에서 처음부터 조회 가능한 일급 요소가 된다. 지원되는 스키마 기능은 Structured outputs 문서를 참고하라.

다른 대안들은 모두 집계 테스트를 통과하지 못한다. 자체 평가 신뢰도는 보정이 약하며, 플래그를 억제하는 것은 원인을 진단하지 않고 증상만 숨긴다. 전체 추론 트랜스크립트는 원리상 답을 담고 있지만 오직 수동 검토를 통해서만 그 답을 얻을 수 있으며, 이는 수백 건의 기각 사례로 확장되지 않는다. 리뷰어의 자유 텍스트 메모는 바쁜 사람들이 생성 모델이 플래그를 발생시킨 시점에 이미 알고 있던 원인을 일관되게 명시적으로 서술해줄 것을 전제로 한다. 구조화된, 생성 시점의 패턴 태깅이 더 저렴하고 더 일관되며 곧바로 분석 가능하다.

### 출처: Prompt Engineering & Structured Output/시나리오3_리서치시스템.md
## 질문 3

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The document analysis subagent extracts citations through a tool whose input schema is enforced. Reports still contain quotes attributed to the wrong sources and publication years placed in page-number fields. Which TWO actions should you take? (Select TWO.)

**A.** Tighten the input schema with stricter type constraints and mark more fields as required so misplaced values can no longer pass validation.

**설명**

더 엄격한 타입 지정과 필수 항목 지정은 여전히 구조 수준에서만 작동한다. 잘못된 연도도 올바른 연도와 마찬가지로 유효한 정수이며, 더 많은 필드를 필수로 지정하면 원본 자료에 정보가 없을 때 오히려 값을 조작(fabrication)할 가능성이 커질 수 있다.

**B(정답).** Add self-check fields to the extraction schema that surface internal inconsistencies, and route flagged extractions to a review step.

**설명**

이 답이 정답인 이유는, 의미적 오류는 스키마 검증으로는 보이지 않기 때문이다. 값을 서로 비교할 수 있는 상호 보완적인 필드들을 추출하고, 불일치가 있으면 리뷰용으로 플래그를 지정하면, 스키마 메커니즘이 볼 수 없는 오귀속이나 값 전치 오류를 기계가 인식할 수 있는 형태로 드러낼 수 있다.

**C.** Audit and repair the schema definition, since these failures show malformed JSON is slipping past validation undetected.

**설명**

해당 추출 결과는 문법적으로 유효하고 스키마에 부합한다. 바로 그렇기 때문에 검증을 통과한 것이다. 문제는 의미적인 것으로, 형태는 맞지만 내용이 잘못된 값이며, 이는 어떤 스키마 정의로도 표현하거나 잡아낼 수 없다.

**D(정답).** Keep schema enforcement for its structural guarantees and add a validation layer that cross-checks extracted values against the source document.

**설명**

이 답은 보장 범위의 경계를 정확히 짚고 있어 정답이다. 스키마 강제(enforcement)는 JSON이 올바른 형태이고, 필수 필드가 존재하며, 타입이 올바른지를 보장하지만, 연도가 실제로 연도 필드에 들어있는지, 또는 인용문이 그 출처와 일치하는지를 검증할 수는 없다. 따라서 그 위에 원본 자료에 근거한 검증 단계가 필요하다.

### 전반적인 설명

여기서 내재화해야 할 사고 모델은, JSON 스키마는 출력의 형태(shape)만 제약할 뿐 그 의미는 결코 제약하지 않는다는 것이다. 추출이 tool use를 통해 이루어질 때, Anthropic의 strict tool use 문서는 무엇이 보장되는지를 명확히 밝히고 있다. 즉 올바른 타입의 인자, 필수 필드의 존재, 유효한 도구 이름, 스키마 위반 없음이다. 이 목록의 어디에도 값이 참인지, 서로 일관되는지, 또는 사람이 보기에 올바른 필드에 들어있는지는 언급되지 않는다. 페이지 번호 필드에 출판 연도가 들어있어도 그것은 완전히 유효한 정수이며, 잘못된 저자에게 귀속된 인용문도 완전히 유효한 문자열이다.

이러한 역할 분담은 의도된 것이다. 스키마 강제는 생성 시점에 토큰 구조에 대해 작동하며, 이는 저렴하고 결정적이다. 반면 의미적 정확성은 출력을 원본 자료와 비교해야 하는 판단이며, 이는 스키마 메커니즘이 접근할 수 없는 영역이다. 따라서 프로덕션 파이프라인은 이 둘을 계층화한다. 스키마는 파싱 및 구조적 오류를 원천적으로 제거하고, 그 아래 다운스트림 검증 단계가 의미를 다룬다. 이는 추출된 값을 문서와 대조하거나, 자체 검증 필드를 추가하거나(예를 들어 명시된 값과 계산된 값을 모두 추출하여 불일치가 있으면 충돌 표시로 플래그를 지정하는 방식), 신뢰도가 낮은 추출을 리뷰로 라우팅하는 방식으로 이루어질 수 있다.

두 오답은 모두 실패의 위치를 잘못 짚고 있다. 타입이나 필수 항목을 더 엄격하게 만드는 것은 동일한 구조적 경계를 더 뚜렷하게 그릴 뿐이며, 올바른 정수와 잘못된 정수를 구분하지 못하고, 필드를 과도하게 필수로 지정하면 원본에 값이 없을 때 모델이 값을 조작하도록 압박할 수 있다. 그리고 잘못된 형식의 JSON을 탓하는 것은 진단을 거꾸로 하는 것이다. 이 추출 결과들은 구조적으로 완벽했기 때문에 정확히 검증을 통과한 것이다. 스키마 메커니즘들이 어떻게 맞물리는지는 Structured outputs 문서를 참고하라.

### 출처: Prompt Engineering & Structured Output/시나리오3_리서치시스템.md
## 질문 4

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The document analysis subagent must run extract_metadata as its first action on every document, yet it sometimes jumps straight to other extraction tools. Which tool_choice configuration guarantees the required first call?

**A.** Set tool_choice to {"type": "any"} so the model is required to call one of the provided extraction tools.

**설명**

any 설정은 어떤 도구든 호출하도록 강제하지만, 어느 도구를 호출할지는 모델의 선택에 맡긴다. 구조화된 출력은 보장하지만 extract_metadata가 구체적으로 첫 번째로 호출되는 도구라는 것은 보장하지 않으며, 이는 바로 관찰되고 있는 실패 양상 그 자체다.

**B.** Keep tool_choice at {"type": "auto"} and add a system prompt rule stating extract_metadata must always run first.

**설명**

auto 상태에서는 모델이 도구를 호출할지 여부 자체를 스스로 결정하며, 프롬프트 지시문은 행동에 영향을 줄 뿐 이를 보장하지는 않는다. 이는 순서 요구사항을 확률적인 상태로 남겨두므로, 서브에이전트는 여전히 간혹 메타데이터 단계를 건너뛸 수 있다.

**C.** Place extract_metadata first in the tools array so the model preferentially selects the leading tool.

**설명**

tools 배열 안의 도구 정의 순서는 문서화된 선택 메커니즘이 아니다. 모델은 도구의 설명과 작업 내용을 기반으로 도구를 선택하므로, 정의 순서를 바꾸는 것은 어느 도구가 먼저 실행될지에 대해 아무런 보장도 제공하지 않는다.

**D(정답).** Set tool_choice to {"type": "tool", "name": "extract_metadata"} on the first request for each document.

**설명**

강제 도구 선택은 모델이 여러 도구 중에서 고르거나 텍스트로 답하는 대신 지정된 도구를 호출하도록 강제한다. 이는 메타데이터 추출과 같은 특정 추출 작업이 이후 단계보다 먼저 실행되도록 보장하는, 문서화된 메커니즘이다.

### 전반적인 설명

tool_choice 파라미터는 단계적으로 강도가 높아지는 세 가지 모드를 가지며, 각각은 서로 다른 보장으로 이어진다. auto(도구가 제공될 때의 기본값)는 모델이 매 턴마다 도구를 호출할지 아니면 평범한 텍스트로 응답할지를 스스로 결정하게 한다. any는 텍스트 전용 응답이라는 선택지를 없앤다. 모델은 제공된 도구 중 하나를 반드시 호출해야 하지만, 어느 도구를 호출할지는 여전히 스스로 고른다. {"type": "tool", "name": "..."}로 표현되는 강제 선택은 두 가지 자유도를 모두 제거한다. 모델은 정확히 지정된 그 도구를 호출해야 한다. 다른 분석이나 보강 작업보다 먼저 메타데이터 추출을 실행해야 하는 것처럼 특정 행동을 첫 단계로 요구해야 할 때는, 강제 선택만이 그 요구사항을 선호가 아닌 확고한 제약으로 만들어준다.

여기서 유지해야 할 사고 모델은, 프롬프트는 유도할 뿐이고 tool_choice는 제약한다는 것이다. tool_choice가 any나 tool일 때 API는 어시스턴트 메시지를 사전에 채워 도구 사용을 강제하므로, 이 보장은 지시 따르기에 의존하지 않고 구조적으로 성립한다. auto 상태에서의 시스템 프롬프트 규칙은 올바른 첫 호출이 일어날 확률을 높일 수는 있지만 실패 양상을 완전히 없애지는 못하며, tools 배열 안의 정의 순서는 아무런 문서화된 선택 의미를 갖지 않는다. 여기서 any를 선택하면 다른 문제(대화형 응답이 새어나오는 것)는 해결되지만, 모델이 여전히 다른 추출 도구로 시작할 수 있으므로 순서 문제는 그대로 남는다.

다단계 파이프라인에서 흔히 쓰이는 패턴은 첫 호출을 강제한 뒤 제약을 완화하는 것이다. 강제된 도구로 첫 요청을 보내고, 그 결과를 반환받은 다음, 이후 요청들은 auto나 any로 전환하여 모델이 남은 도구들 중에서 자유롭게 선택할 수 있게 한다. 각 모드의 전체 동작은 Define tools and control Claude's output과 tool use 개요 문서를 참고하라.

### 출처: Prompt Engineering & Structured Output/시나리오3_리서치시스템.md
## 질문 5

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The document-analysis subagent's findings already carry a detected_pattern field, but it is a free-form string and nearly every value is unique prose, so dismissed findings cannot be grouped for false-positive analysis. What schema change makes aggregation reliable?

**A.** Add a prompt instruction telling the model to reuse identical wording whenever it applies the same detection pattern.

**설명**

표현에 관한 프롬프트 지시문은 확률적이며 동일한 문자열을 보장할 수 없다. 특히 이전 표현에 대한 기억을 공유하지 않는 별개의 서브에이전트 호출들 사이에서는 더욱 그렇다. 작은 표현 차이만 있어도 그룹이 여전히 쪼개져 집계가 불안정해진다.

**B.** Keep the free-form values and run a second Claude pass that clusters the strings into categories after each batch.

**설명**

사후 클러스터링은 비용과 지연시간을 추가시키며, 그 그룹화 결과는 비결정적이어서 배치마다 카테고리 경계가 흔들릴 수 있다. 값을 스키마 수준에서 제약하면 사후에 복구를 시도하는 대신 안정적이고 검증된 카테고리를 얻을 수 있다.

**C.** Make detected_pattern nullable so the model populates it only when it can name a well-defined pattern.

**설명**

null 허용은 원본 정보가 실제로 존재하지 않을 수 있는 경우에 적합한 도구이지만, 여기서는 각 finding의 트리거가 항상 존재한다. null을 허용하면 분석이 의존하는 바로 그 필드의 커버리지가 줄어들 뿐, 채워진 값들이 더 일관되게 되는 것은 아니다.

**D(정답).** Constrain detected_pattern to an enum of known pattern categories plus an "other" value with a detail string.

**설명**

열거형(enum)은 모든 finding을 고정된 패턴 카테고리 집합 중 하나로 제약하므로, 수천 건의 finding에 걸쳐 기각 사례를 집계하고 비교할 수 있다. 상세 문자열을 함께 갖는 "other" 값은 분류 체계를 확장 가능하게 유지시켜, 집계를 깨뜨리지 않으면서도 진정으로 새로운 패턴을 포착할 수 있게 한다.

### 전반적인 설명

detected_pattern 필드의 목적은 오탐을 기계가 분석할 수 있게 만드는 것이다. 개발자가 finding을 기각할 때, 그 기각들을 패턴별로 그룹화하여 어떤 탐지 로직이 잡음을 만들어내고 있는지 발견할 수 있게 된다. 이 분석은 그 필드의 값들이 작고 안정적인 카테고리 집합을 이룰 때만 작동한다. 자유 텍스트 문자열은 이 목적을 무너뜨리는데, 모델이 매 호출마다 동일한 근본 패턴을 서로 다르게 표현하기 때문이다. 그러면 각 값이 하나짜리 그룹이 되어버려 아무런 신호도 드러나지 않는다.

이를 강제하기에 적절한 곳은 스키마다. 구조화된 출력은 스키마가 표현하는 것만을 제약한다. 즉 스키마에 표현된 필드만 보장되며, 스키마로 제약된 객체는 additionalProperties를 false로 설정해야 한다. 바로 이런 이유로 범주적 제약은 프롬프트가 아니라 스키마에 두어야 한다. detected_pattern에 열거형을 적용하면 이 필드는 고정된 어휘 집합이 되어, 모든 finding이 개수를 세고 추이를 보고 비교할 수 있는 알려진 카테고리 중 하나에 속하게 된다. 열거형에 "other" 값과 자유 텍스트 상세 필드를 함께 두는 것은 표준적인 확장 패턴이다. 알려진 패턴들은 깔끔하게 집계되고, 새로운 패턴들은 잘못된 카테고리로 조용히 강제되는 대신 나중에 열거형에 승격시키기 위해 포착된다.

다른 대안들은 모두 근본 원인을 그대로 남겨둔다. 표현을 재사용하라는 프롬프트 지시문은 확률적이며, 독립적인 서브에이전트 호출들은 이전 표현에 대한 기억이 없다. 두 번째 클러스터링 패스는 비용이 크고 실행마다 카테고리 경계가 흔들린다. 필드를 null 허용으로 만드는 것은 다른 실패 양상(원본 데이터가 없을 때의 값 조작)을 다루는 것이며, 여기서는 전체 피드백 루프가 의존하는 필드의 커버리지를 그냥 잃게 될 뿐이다. 지원되는 스키마 구성 요소는 Structured outputs 문서를 참고하라.

### 출처: Prompt Engineering & Structured Output/시나리오3_리서치시스템.md
## 질문 8

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The report subagent's structured extractions intermittently fail JSON parsing. Logs show each failing response ends mid-object and carries stop_reason "max_tokens". How should the pipeline handle these failures?

**A(정답).** Retry the affected requests with a higher max_tokens value, since the output was truncated rather than malformed by the model.

**설명**

이 답이 정답이다. stop_reason이 max_tokens라는 것은 생성이 출력 토큰 상한에 의해 잘려나갔다는 뜻이며, 따라서 JSON은 잘못 형성된 것이 아니라 불완전한 것이다. 문서화된 해결 방법은 max_tokens를 더 크게 설정하여 재시도함으로써 모델이 객체를 끝까지 완성할 수 있게 하는 것이다.

**B.** Mark the affected documents unrecoverable, since the incomplete fields indicate the information is absent from the source material.

**설명**

원본 자료에 정보가 없는 것은 전형적인 재시도 불가능 사례이지만, 이 진단은 해당 로그에는 맞지 않는다. 응답은 토큰 제한에 의해 객체 중간에서 잘려나간 것이며, 이는 원본 문서에 해당 데이터가 있는지 여부와는 아무 관련이 없다.

**C.** Add a system prompt instruction requiring the model to always close every brace and never emit partial JSON objects.

**설명**

프롬프트 지시문은 하드 토큰 상한을 무시할 수 없다. max_tokens에 도달하면 모델이 무엇을 생성하도록 지시받았는지와 관계없이 생성은 스트림 중간에서 멈춘다. 해결책은 요청 설정을 바꾸는 것이며, 더 강한 문구가 아니다.

**D.** Resend the truncated output together with the JSON parse error so the model can self-correct the syntax on the next attempt.

**설명**

오류 피드백을 포함한 재시도는 모델이 답할 여유가 있었는데도 저지른 실수, 예를 들어 잘못된 필드 배치나 형식 오류를 고치는 데 적합하다. 여기서는 모델이 문법상의 실수를 한 것이 아니라 출력 토큰이 부족했던 것이며, 동일한 상한 아래에서 피드백 재시도를 하더라도 또다시 잘려나갈 것이다.

### 전반적인 설명

추출이 왜 실패했는지 진단하는 것은 올바른 재시도 전략을 선택하기 위한 전제 조건이며, stop_reason이 그 핵심 진단 신호다. max_tokens 값은 모델이 설정된 출력 상한에 도달하여 생성이 스트림 중간에서 잘려나갔음을 의미한다. 이는 사실 모델의 오류가 전혀 아니다. 모델은 완전히 유효한 JSON을 생성하고 있었을 수도 있고, 다만 그것이 잘려나간 것일 수 있다. 문서화된 해결 방법은 더 높은 max_tokens 한도로 재시도하여 전체 객체가 출력될 수 있게 하는 것이다.

이는 흔히 알려진 두 가지 재시도 범주 사이에 위치한다. 오류 피드백을 포함한 재시도(실패한 출력과 구체적인 검증 오류를 함께 다시 보내는 것)는 모델이 수정 가능한 실수를 저질렀고 수정에 필요한 모든 것이 이미 프롬프트 안에 있을 때 효과적이다. 형식 불일치나 잘못 배치된 필드는 이 방식에 잘 반응한다. 재시도 불가는 필요한 정보가 제공된 원본 자료에 없을 때 적용되는데, 아무리 재시도해도 없는 사실을 만들어낼 수는 없기 때문이다. 잘림(truncation)은 세 번째 범주로, 재시도가 가능하지만 오직 요청 자체가 바뀔 때만 그렇다. 동일한 상한 아래에서 오류 피드백을 다시 보내면 똑같이 잘려나갈 뿐이며, 중괄호를 닫으라는 프롬프트 지시문은 하드 샘플링 제한 앞에서 무력하다. 원본에 데이터가 없다고 결론내리는 것은 신호를 완전히 잘못 읽는 것인데, 잘림은 추출 품질이 아니라 출력 채널에서 발생한 것이기 때문이다.

검증-재시도 루프를 위한 실용적인 핵심은, 재시도 페이로드를 결정하기 전에 실패 신호에 따라 분기하는 것이다. stop_reason이 "max_tokens"인 파싱 오류는 한도를 높여 재실행하고, 완전한 응답에 대한 의미적 또는 구조적 검증 오류는 오류 피드백 재시도를 하며, 제공된 자료에 값이 실제로 존재하지 않는 필드는 재시도하지 않고 플래그를 지정한다. max_tokens로 인한 잘림 처리에 대해서는 Structured outputs 문서를, 실제 문제가 원본 근거 부족인 경우의 가이드는 Reduce hallucinations 문서를 참고하라.

### 출처: Prompt Engineering & Structured Output/시나리오3_리서치시스템.md
## 질문 10

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The document analysis subagent defines one extraction tool per source type. Under the default tool_choice, it sometimes replies with a prose summary instead of calling any tool, breaking the coordinator's structured handoff. Which change guarantees structured output?

**A.** Set tool_choice to "none" and instruct the subagent to emit JSON matching one of the schemas in its text reply.

**설명**

"none" 모드는 도구 사용을 완전히 막아버려 출력을 다시 자유 텍스트로 되돌린다. 서술문 안에 담긴 JSON은 tool use가 제공하는 스키마 강제를 잃어버리며, 마크다운 코드 펜스, 주석, 문법 오류가 다운스트림에서 다시 나타나게 된다.

**B(정답).** Set tool_choice to "any" so a tool call is required while the subagent still picks the schema that fits each source.

**설명**

"any" 모드는 모델이 제공된 도구 중 하나를 반드시 호출하도록 강제하면서도, 그중 어느 것을 선택할지는 모델에게 맡긴다. 이는 구조적으로 서술형 응답을 없애면서도 출처 유형별 스키마 선택을 유지시켜주며, 이는 정확히 알 수 없는 문서 혼합이 요구하는 바다.

**C.** Keep tool_choice on "auto" and add emphatic prompt instructions requiring the subagent to always invoke one of its tools.

**설명**

"auto" 상태에서는 모델이 여전히 텍스트로 응답할 수 있는 선택지를 갖고 있으며, 프롬프트 강조는 도구 호출이 일어날 확률을 높일 뿐 이를 보장하지는 않는다. 간간이 서술형 응답이 나올 가능성이 남아있어, 구조화된 전달은 여전히 신뢰할 수 없는 상태로 남는다.

**D.** Force tool_choice to a single named extraction tool and apply that schema uniformly to every document the subagent receives.

**설명**

강제 도구 선택은 도구 호출을 보장하지만, 모든 문서를 하나의 스키마에 고정시켜버린다. 출처가 유형별로 다양하므로, 강제된 스키마와 맞지 않는 문서는 잘못된 구조로 추출될 것이며, 이는 하나의 실패 양상을 다른 실패 양상으로 바꾸는 것에 불과하다.

### 전반적인 설명

tool_choice 파라미터는 모델이 도구를 호출할 수 있는지, 반드시 호출해야 하는지, 혹은 호출할 수 없는지를 결정하는 메커니즘이다. 문서화된 모드는 네 가지다. auto(도구가 제공될 때의 기본값)는 모델이 텍스트 응답과 도구 호출 사이에서 스스로 결정하게 한다. any는 모델이 제공된 도구 중 하나를 반드시 호출하도록 요구하지만 어느 것을 호출할지는 지정하지 않는다. tool은 지정된 하나의 도구를 강제한다. none은 도구 사용을 완전히 막는다. 여기서의 실패, 즉 간간이 나타나는 서술형 요약은 정확히 auto가 허용하는 동작이므로, 해결책은 프롬프트 변경이 아니라 모드 변경이다.

알 수 없는 유형의 문서를 다루는 여러 추출 도구를 가진 서브에이전트에게는 any가 설계상 적합한 선택이다. 필수 도구 호출은 출력이 항상 coordinator가 파싱할 수 있는 스키마에 부합하는 도구 입력으로 도착함을 의미하며, 도구들 사이에서 선택할 수 있는 자유는 모델이 각 출처를 적절한 스키마에 맞출 수 있게 해준다. 이것이 바로 보장된 구조와 유연한 스키마 선택이 서로 충돌하지 않는 이유다. 이 모드는 원래부터 둘 다를 동시에 제공하도록 만들어졌다.

각 대안은 이 조합의 한쪽을 깨뜨린다. 하나의 지정된 도구를 강제하는 것은 모든 문서를 하나의 스키마에 용접해버리는데, 이는 문서 집단이 동일한 유형일 때나 특정 추출이 먼저 실행되어야 할 때만 올바르다. auto를 유지하면서 문구만 강하게 하는 것은 텍스트 응답이라는 탈출구를 계속 열어두는데, 지시문은 확률에 영향을 줄 뿐 계약을 강제하지는 않기 때문이다. 그리고 none은 tool use 채널 자체를 완전히 포기하고, 파싱의 모든 취약성을 가진 자유 텍스트 JSON으로 되돌아간다. 각 모드의 전체 동작은 How to implement tool use 문서를 참고하라.

### 출처: Prompt Engineering & Structured Output/시나리오3_리서치시스템.md
## 질문 11

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : The document-analysis subagent's structured output requests fail immediately with 400 errors citing a recursive $ref and a minimum constraint in the JSON schema. Identical retries fail the same way. What is the correct fix?

**A.** Raise max_tokens on the retried requests so the model has enough room to satisfy every schema constraint.

**설명**

이 답은 틀렸다. max_tokens를 높이는 것은 max_tokens라는 stop reason으로 끝난, 잘려나간 응답을 다루는 방법이다. 400 오류는 어떤 토큰이 생성되기도 전에 발생하므로, 출력 길이는 관련이 없다.

**B.** Add exponential backoff between retries so the request succeeds once the transient service error clears.

**설명**

이 답은 틀렸다. 지원되지 않는 스키마 기능으로 인한 400 오류는 일시적인 것이 아니라 결정적이다. 아무리 기다려도 결과는 바뀌지 않으며, 동일한 유효하지 않은 요청은 매번 거부될 것이다.

**C(정답).** Rewrite the schema without the unsupported features and enforce the numeric bound in validation code.

**설명**

이 답이 정답인 이유는, 400 오류는 잘못된 모델 출력이 아니라 유효하지 않은 요청을 나타내기 때문이다. 재귀적인 $ref와 minimum 같은 수치 제약은 구조화된 출력에서 지원되지 않으므로, 스키마 자체를 바꿔야 하며, 경계값 검사는 응답을 받은 후 애플리케이션 측 검증으로 옮겨야 한다.

**D.** Resend each failed request with the 400 error text appended to the prompt so the model can self-correct.

**설명**

이 답은 틀렸다. 오류 피드백을 포함한 재시도는 모델 출력의 결함을 고치는 방법인데, 여기서는 모델이 아예 어떤 출력도 만들어내지 않았다. 요청은 생성이 시작되기 전에 거부되므로, 모델이 수정할 대상이 아무것도 없다.

### 전반적인 설명

여기서 핵심적인 역량은 해결책을 선택하기 전에 실패를 올바르게 분류하는 것이다. 오류 피드백을 포함한 재시도 루프는 모델이 만들어낸 출력에 고칠 수 있는 결함이 있을 때 작동한다. 잘못된 형식의 필드, 서로 맞지 않는 개수, 잘못된 위치의 값 등이다. 이런 경우 모델은 무언가를 생성했고, 여러분의 코드가 결함을 찾아냈으며, 오류 메시지는 모델이 스스로 수정하는 데 필요한 정보를 제공한다. 400 오류는 근본적으로 다른 실패 범주다. API는 모델이 실행되기도 전에 요청을 거부한 것이다. 문제는 요청 페이로드 안에 있으므로, 어떤 재시도나 백오프, 프롬프트 조정으로도 결과를 바꿀 수 없다.

Anthropic의 Structured outputs 문서는 지원되지 않는 JSON Schema 기능들을 나열하고 있는데, 재귀 스키마, 외부 $ref, minimum 같은 수치 제약, minLength 같은 문자열 제약이 여기에 포함된다. 이러한 기능을 사용하면 세부 내용과 함께 400 오류가 발생한다. 이러한 설계상의 트레이드오프는 의도된 것이다. 구조화된 출력은 스키마 준수를 보장하기 위해 토큰 샘플링을 제약하는데, 이 방식으로 효율적으로 강제할 수 있는 것은 JSON Schema의 일부에 한정된다. 실용적인 패턴은 스키마를 지원되는 범위 안에 두어 API가 형태를 보장하게 하고, 세밀한 값 제약(범위, 길이, 형식)은 응답을 받은 후 자체 검증 계층에서 강제하는 것이다.

지수 백오프는 타임아웃이나 과부하 응답 같은 일시적 오류에 적합한 것이며, 결정적인 요청 거부에는 맞지 않는다. 오류를 모델에게 다시 피드백하는 것은 수정할 모델 출력이 존재한다는 것을 전제로 하는데, 여기서는 그런 출력이 없다. max_tokens를 높이는 것은 max_tokens라는 stop reason으로 잘려나간 응답에 대한 문서화된 해결책이며, 이는 생성이 시작된 이후에 발생하는 실패이지 요청이 수락되기 전에 발생하는 실패가 아니다.

### 출처: Prompt Engineering & Structured Output/시나리오4_데이터추출.md
## 질문 1

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : A single extraction pass over 60-page contract bundles produces detailed results for early sections but sparse or missing fields for later ones, and identical clause types are classified inconsistently across sections. How should the extraction be restructured?

**A.** Switch to a model with a larger context window so all sections receive adequate attention within a single pass.

**설명**

이는 흔한 오해다. 컨텍스트 윈도우에 더 많은 콘텐츠를 담는 것만으로는 분석 품질이 개선되지 않는다. 묶음 문서는 이미 윈도우에 들어갈 수도 있으며, 실제 문제는 길고 복잡한 문서를 한 번의 패스로 처리할 때 일부 섹션의 가중치가 낮아지는 경향이 있다는 것이다. 이로 인해 윈도우 크기와 무관하게 결과가 얕아진다.

**B.** Run the single-pass extraction three times and keep only field values that agree across at least two of the runs.

**설명**

동일한 단일 패스의 약점을 공유하는 실행 결과들에 대해 다수결을 적용해도 소외된 섹션의 깊이는 회복되지 않는다. 모든 실행에서 희소하게 추출된 필드는 여전히 누락되며, 합의(consensus) 방식은 단 한 번의 실행에서만 나타난 올바른 값을 오히려 걸러낼 수 있다.

**C(정답).** Extract each section in its own focused pass, then run a separate pass to reconcile cross-section references and totals.

**설명**

정답이다. 깊이가 불균일하고 분류가 상충되는 이 실패 패턴은 매우 길고 복잡한 문서에 대한 단일 패스 분석에서 흔히 나타나는 특징이며, 중간이나 후반부의 내용일수록 가중치가 낮아지기 쉽다. 섹션별 패스는 국지적 필드에 대해 더 일관된 깊이를 유지하도록 도와 세부 사항 누락 가능성을 줄이며, 별도의 조정(reconciliation) 패스는 여러 섹션에 걸친 값을 처리한다.

**D.** Mark every field required in the JSON schema so shallow extractions fail validation and trigger automatic retries.

**설명**

스키마는 구조를 강제할 뿐 추출 품질을 보장하지는 않는다. 섹션이 얕게 처리된 상태에서 필드를 필수로 지정하면 모델은 정확하게 추출하는 대신 값을 지어내도록 압박받는다. 동일하게 과부하된 단일 패스에 대한 재시도 역시 같은 근본적 약점을 그대로 물려받는다.

### 전반적인 설명

이 상황의 증상은 매우 길고 복잡한 문서에 대한 단일 패스 분석의 특징적인 양상이다. 일부 부분에서는 결과가 철저하지만 다른 부분에서는 얕아지고, 판단이 일관되지 않아지며(같은 조항 유형이 위치에 따라 다르게 처리됨), 중간이나 후반부의 내용일수록 가중치가 낮아지기 쉬운데, 이는 흔히 "lost in the middle" 위험이라고 불린다. 여기서 유지해야 할 사고 모델은 컨텍스트 용량과 분석 품질이 서로 별개라는 것이다. 문서가 윈도우에 들어가더라도, 균일하게 깊은 단일 패스 추출을 하기에는 여전히 너무 클 수 있다.

해결책은 대규모 다중 파일 코드 리뷰에 사용되는 것과 동일한 분해 패턴이다. 작업을 단위별(여기서는 섹션별)로 집중된 로컬 패스들로 나누고, 각 패스는 하나의 한정된 임무만 수행하도록 하며, 이후 별도의 통합 패스에서 섹션 간 참조, 반드시 일치해야 하는 합계, 분류 일관성 등 단위 간(cross-unit) 문제만을 검토한다. 이는 프롬프트 체이닝(prompt chaining)의 한 형태로, 각 프롬프트가 하나의 한정된 임무만 가지므로 정확도와 추적 가능성이 향상된다. 이는 섹션 간 더 일관된 깊이를 유지하도록 도와주며, 단위를 넘나드는 분석을 부수 효과가 아닌 명시적 단계로 만들어준다. 더 강력한 성능을 위해 복잡한 프롬프트를 체이닝하는 방법과 긴 컨텍스트 프롬프팅 팁을 참고하라.

대안들은 모두 근본 원인을 놓치고 있다. 더 큰 컨텍스트 윈도우는 용량 문제를 다룰 뿐, 긴 문서에 대한 단일 패스 분석의 불균일한 품질 문제는 해결하지 못한다. 반복된 단일 패스에 대한 다수결은 동일한 체계적 약점을 공유하는 실행들의 평균을 내는 것이므로, 지속적으로 소외된 섹션은 결코 회복되지 않는다. 모든 필드를 필수로 지정해 스키마를 강화하는 것은 오히려 해롭다. JSON 스키마는 출력 형태를 보장할 뿐 추출 품질을 보장하지 않으며, 얕게 처리된 섹션에서 필수 값을 강제하는 것은 정확히 모델이 그럴듯해 보이는 데이터를 지어내는 조건을 만드는 것이다.

### 출처: Prompt Engineering & Structured Output/시나리오4_데이터추출.md
## 질문 5

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : After single-pass extraction over transaction bundles (invoice, purchase order, delivery note) showed uneven depth across documents, the team is moving to a multi-pass design. Which TWO statements reflect sound multi-pass architecture? (Select TWO.)

**A.** Run the combined single pass three times and keep only findings or fields that agree across a majority of runs.

**설명**

이는 주된 아키텍처로는 적절하지 않다. 일관되지 않은 결합 실행들에 대해 다수결을 적용하면 실제 신호를 억제할 수 있다. 단 한 번의 실행에서만 올바르게 추출된 필드는 버려지게 된다. 여러 실행을 비교하는 것은 보조적인 검증 수단으로는 쓸 수 있지만, 문서별 집중 추출과 별도의 통합 패스를 대체하지는 못한다.

**B(정답).** Expect that simply loading all documents into a larger context window will not reliably fix the uneven analysis depth.

**설명**

이는 정답이다. 불균일한 깊이는 주로 여러 문서를 한 번의 패스로 처리할 때 발생하는 주의력 분산(attention dilution)에서 비롯되며, 컨텍스트 용량을 늘리는 것만으로는 문서별로 일관된 주의력을 안정적으로 회복시킬 수 없다. 문서별로 집중된 패스는 용량에만 의존하는 대신 품질 문제를 직접적으로 다룬다.

**C.** Drop the integration pass, since schema validation on each per-document extraction already guarantees consistency across the bundle.

**설명**

이는 오답이다. JSON 스키마 검증은 각 개별 추출의 구조만을 보장할 뿐이다. 송장과 구매 주문서 간 합계가 일치하지 않는 것과 같은 문서 간 의미적 불일치는 감지할 수 없으며, 이것이 바로 통합 패스가 확인하는 대상이다.

**D(정답).** Scope the integration pass to cross-document checks, such as reconciling an amount one document references in another.

**설명**

이는 정답이다. 통합 패스는 단일 문서 패스에서는 볼 수 없는 관계, 예를 들어 송장이 참조하는 구매 주문서 합계와 같은 것을 포착하기 위해 존재한다. 필드 단위 추출을 문서별 패스에 유지하면 분리를 하게 된 이유인 일관된 깊이가 보존된다.

### 전반적인 설명

다중 패스 설계의 근간이 되는 사고 모델은, 언어 모델이 단지 유한한 컨텍스트 윈도우만 가지는 것이 아니라 패스당 유한한 주의력(attention)을 가진다는 것이다. 여러 문서를 함께 분석하면 그 주의력은 불균일하게 분산되는 경향이 있다. 일부 문서는 깊이 처리되지만 다른 문서는 필드가 희소해지고, 동일한 패턴이 위치에 따라 다르게 판단된다. 이것이 주의력 분산(attention dilution)이며, 이는 근본적으로 용량 문제가 아니라 품질 문제다. 컨텍스트 용량을 늘리는 것만으로는 긴 컨텍스트에서의 품질 문제가 안정적으로 해결되지 않으므로, 같은 묶음을 더 큰 윈도우에 넣는 것은 집중된 패스를 대체할 신뢰할 만한 방법이 아니다.

해결책은 작업의 분담이다. 문서별 패스는 국지적 추출을 담당하며, 모든 문서에 모델의 온전한 주의력과 일관된 깊이를 부여한다. 별도의 통합 패스는 문서 간 관점에서만 포착할 수 있는 것들, 즉 구매 주문서와 일치해야 하는 송장 합계, 항목이 참조하는 배송 수량, 문서 간 상충되는 날짜 등을 다룬다. 모든 것을 다시 추출하는 대신 통합 패스의 범위를 이러한 문서 간 관계로 한정하면, 각 패스가 자신이 가장 잘 수행할 수 있는 분석에 집중할 수 있다. 이는 복잡한 작업을 집중된 순차 단계들로 분해하라는 Anthropic의 프롬프트 체이닝 원칙과 동일하다.

오답들은 각각 시사점이 있는 이유로 틀렸다. 결합 패스를 반복해서 다수결을 취하는 방식은 Best-of-N 비교라는 정당한 사촌 기법을 가지고 있으며, 이는 보조적인 검증 기법으로는 유용할 수 있다. 그러나 핵심 아키텍처로 사용하면 일관된 문서별 주의력을 회복시키지 못한 채 잡음을 평균 내는 것에 불과하며, 단 한 번의 실행에서만 나타난 올바른 추출은 버려지게 된다. 그리고 스키마 검증에 의존하는 것은 구조적 보장과 의미적 보장을 혼동하는 것이다. 스키마는 각 추출이 올바른 필드를 가진 형식이 맞는 JSON임을 보장하지만, 묶음 내 문서들 간에 값이 실제로 일치하는지에 대해서는 아무런 가시성이 없다. 문서 간 일관성을 확인하려면 문서들을 서로 연관지어 보는 패스가 필요하다.

### 출처: Prompt Engineering & Structured Output/시나리오4_데이터추출.md
## 질문 7

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The extraction schema's document_category field uses a closed enum of eight values. When unfamiliar document types arrive, the model shoehorns them into the nearest existing value, corrupting downstream routing. What schema change addresses this?

**A(정답).** Add an "other" enum value paired with a free-text detail field that records the actual category.

**설명**

이는 확장 가능한 분류 패턴이다. 폐쇄형 enum은 여전히 8개의 알려진 카테고리에 대한 통제된 어휘를 보장하면서, "other"는 그 밖의 무언가에 대해 모델에게 정직한 선택지를 제공한다. 세부 문자열은 문서가 실제로 무엇인지를 담아내므로, 새로운 카테고리가 조용히 잘못 분류되는 대신 눈에 보이게 된다.

**B.** Replace the enum with an unconstrained string field so the model can name any category it encounters.

**설명**

enum을 제거하면 다운스트림 라우팅이 의존하는 통제된 어휘가 무너진다. 모델은 같은 유형에 대해 "invoice", "Invoice", "billing document"처럼 일관되지 않은 레이블을 만들어낼 것이다. 목표는 보장된 값 집합을 포기하지 않으면서 확장성을 확보하는 것이다.

**C.** Instruct the model in the prompt to choose the closest existing enum value whenever a document type is ambiguous.

**설명**

가장 가까운 기존 값을 선택하는 것은 정확히 이미 발생하고 있는 실패 그 자체이며, 이를 명시적으로 지시하는 것은 오분류를 제도화하는 것에 불과하다. 스키마는 어휘 밖의 유형에 대해 정당한 출구를 제공해야 하며, 이는 프롬프트 지시만으로는 제공할 수 없다.

**D.** Expand the enum with every new category observed so far and redeploy the schema after each addition.

**설명**

관찰된 모든 카테고리를 나열하는 것은 끝없는 유지보수 부담을 만들며, 다음에 처음 보는 문서 유형이 도착하는 순간 다시 실패한다. 폐쇄형 목록은 아무리 길어도 개방형 입력 분포를 예상할 수 없다.

### 전반적인 설명

JSON 스키마의 enum은 하나의 계약이다. 모델은 나열된 값 중 하나를 내놓아야 하며, 다운스트림 시스템은 별도의 정규화 로직 없이 그 어휘를 신뢰할 수 있다. 여기서 트레이드오프는 enum이 폐쇄형이지만 실제 문서 스트림은 개방형이라는 점이다. 스키마가 어휘 밖의 입력에 대해 정직한 답을 제공하지 못하면, 모델은 거부하지 않고 그중 가장 덜 잘못된 값을 골라 제약을 만족시키는데, 이는 구조적으로는 유효하지만 의미적으로는 오염된 결과다. 이는 필수 필드가 지어낸 값을 강제하는 것과 같은 계열의 실패다. 스키마가 "위 어느 것도 아님"이라고 말할 정당한 방법을 남겨두지 않는 것이다.

"other"와 세부 문자열을 결합한 패턴은 이 긴장을 해소한다. enum은 알려진 카테고리에 대한 보장을 유지하고, "other"는 모델에게 진실한 도피구를 제공하며, 자유 텍스트 세부 필드는 문서가 실제로 무엇인지를 기록한다. 이 세부 필드는 또한 운영상의 피드백 채널이 되기도 한다. "other"에 무엇이 몰리는지 검토하면 어떤 카테고리가 enum으로 승격될 자격을 얻었는지 알 수 있으므로, 어휘 확장은 스키마 재배포가 아니라 근거에 의해 이루어진다. 관련 기법으로는 진짜로 애매한 경우를 위해 "unclear" 값을 추가하는 것이 있는데, 이는 "어휘 밖"과 "확신 있게 분류할 수 없음"을 구분해준다.

enum을 자유 형식 문자열로 바꾸는 것은 한 가지 실패를 다른 실패로 바꾸는 것일 뿐이다. 이제 라우팅은 모델이 일관되지 않게 지어내는 레이블에 의존하게 된다. 관찰된 카테고리를 계속 추가하는 방식도 격차를 결코 좁히지 못한다. 다음에 등장하는 새로운 유형이 항상 먼저 오분류되기 때문이다. 그리고 모델에게 가장 가까운 값을 고르도록 지시하는 것은 스키마 변경으로 없애려던 그 억지 끼워맞추기를 그대로 규정해버리는 것이다. 입력 스키마가 모델 출력을 어떻게 제약하는지에 대해서는 Tool use with Claude를 참고하라.

### 출처: Prompt Engineering & Structured Output/시나리오4_데이터추출.md
## 질문 10

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : Some extracted invoices contain line items whose sum differs from the total printed on the document, and the downstream billing integration currently ingests whichever total appears in the extraction. How do you make these inconsistencies machine-detectable before ingestion?

**A.** Encode the reconciliation as a JSON Schema rule constraining the total field to equal the sum of the line_items array, so nonconforming extractions fail during decoding.

**설명**

JSON 스키마는 한 필드가 다른 필드들의 배열 합과 같아야 한다는 것과 같은 필드 간 산술 관계를 표현할 수 없으며, 구조화된 출력은 minimum이나 multipleOf 같은 숫자 제약조건조차 지원하지 않는다. 스키마는 구조와 타입을 강제할 뿐, 필드 간의 비즈니스 로직은 강제하지 못한다.

**B.** Run each extraction twice at different temperatures and pass a document downstream only when both runs return the same total, treating any disagreement as a conflict.

**설명**

두 실행 간의 일치는 총액이 항목들과 실제로 맞는지를 증명하지 못한다. 두 실행 모두 원본 문서에서 내부적으로 일관되지 않은 동일한 수치를 충실하게 추출할 수 있다. 이는 비용을 두 배로 만들면서도 실제 산술 불일치는 그대로 감지되지 않은 채로 남긴다.

**C.** Add a prompt instruction telling the model never to output a total that disagrees with the line items, relying on structured outputs to enforce the corrected value.

**설명**

이 지시는 모델이 값 중 하나를 조용히 바꾸도록 압박하여, 진짜 원본 데이터의 불일치를 드러내는 대신 감추게 만든다. 구조화된 출력은 스키마의 형태만 강제할 뿐, 숫자 값이 다른 필드와 산술적으로 일치하는지는 검증하지 못한다.

**D(정답).** Extract both the document's stated total and a model-computed line-item sum as separate schema fields with a conflict_detected boolean, then recheck the arithmetic in code.

**설명**

이는 일관되지 않은 원본 데이터를 위해 문서화된 자기 교정(self-correction) 패턴이다. stated_total과 calculated_total을 나란히 담아두면 출력에서 불일치가 명시적으로 드러나고, conflict_detected 플래그는 다운스트림 시스템이 일관되지 않은 문서를 자동으로 라우팅할 수 있게 하며, 코드 수준의 산술 검사는 모델이 합계 계산 자체를 잘못하는 경우를 막아준다.

### 전반적인 설명

여기서 핵심 사고 모델은 구조적 보장과 의미적 정확성 사이의 경계다. 구조화된 출력과 tool-use 스키마는 추출 결과가 올바른 필드와 타입을 가진 유효하고 파싱 가능한 JSON임을 보장하지만, 이 메커니즘의 어떤 부분도 그 안의 숫자들이 서로 일치하는지를 검사하지 않는다. 원본 문서 자체가 일관되지 않은 경우(항목들의 합이 인쇄된 총액과 맞지 않는 경우), 올바른 설계는 그 불일치를 감추는 것이 아니라 눈에 보이고 기계가 읽을 수 있게 만드는 것이다.

자기 교정 추출 패턴이 정확히 이를 수행한다. 스키마는 stated_total(문서에 적힌 값), calculated_total(추출된 항목들의 합), conflict_detected 불리언을 담는다. 두 총액 간의 불일치는 다운스트림 시스템이 라우팅에 활용할 수 있는 일급(first-class) 신호가 된다. 예를 들어 충돌이 있는 송장은 사람의 검토를 위해 보류하고, 문제가 없는 것은 그대로 흘러가게 할 수 있다. 모델 역시 합계를 잘못 계산할 수 있으므로, 애플리케이션 코드는 항목 합계를 독립적으로 재계산해야 한다. 이것이 바로 스키마가 제공할 수 없는 의미적 검증 계층이다.

대안들은 모두 검사를 잘못된 위치에 두고 있다. JSON 스키마는 필드 간 산술 관계를 표현할 어휘가 없고, 구조화된 출력은 숫자 제약조건을 명시적으로 제외하므로, 스키마 수준의 조정(reconciliation) 규칙은 존재할 수 없다. 추출을 두 번 실행하는 것은 재현성을 테스트할 뿐 정확성을 테스트하지 못한다. 두 실행은 동일하게 일관되지 않은 원본 수치에 대해 기꺼이 서로 일치할 것이다. 그리고 모델에게 총액이 결코 불일치하지 않도록 하라고 지시하는 것은 모델이 일치를 지어내도록 유도하는 것이며, 이는 나쁜 원본 데이터를 알려주는 바로 그 신호를 없애버리는 것이다. 스키마 강제가 무엇을 보장하고 무엇을 보장하지 않는지에 대해서는 Structured outputs를 참고하라.

### 출처: Prompt Engineering & Structured Output/시나리오4_데이터추출.md
## 질문 11

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The extraction schema labels each contract clause with an enum of six clause types. On genuinely ambiguous clauses, the model still commits to one of the six types, and downstream teams act on wrong labels. Which change best fixes this?

**A.** Set the sampling temperature to zero so the model selects each clause type deterministically.

**설명**

이는 오답이다. 결정론적이라는 것이 정확성을 만들어내지는 않는다. temperature를 0으로 설정하면 모델은 강제된 선택을 피하는 것이 아니라 동일하게 반복할 뿐이다. 문제는 스키마가 애매한 조항에 대해 유효한 답을 제공하지 않는다는 것이며, 어떤 샘플링 설정으로도 이를 고칠 수 없다.

**B.** Run the classification twice for each clause and accept a label only when both runs return the same value.

**설명**

이는 오답이다. 두 실행 간의 일치가 레이블이 맞다는 것을 의미하지는 않는다. 모델은 애매한 조항에 대해 동일하게 잘못된 유형을 일관되게 선택할 수 있다. 이는 비용을 두 배로 만들면서도 출력에서 진짜 애매함을 표현할 방법은 여전히 제공하지 못한다.

**C.** Instruct the model in the prompt to assign a clause type only when it is highly confident in the label.

**설명**

이는 오답이다. 스키마는 여전히 6가지 유형 중 하나를 요구하므로, 프롬프트가 무엇을 말하든 모델은 불확실성을 표현할 정당한 방법이 없다. 신뢰도 기반의 산문식 지시 역시 모호하여 일관되지 않은 행동을 낳는다. 결국 구조적 제약이 지시를 압도한다.

**D(정답).** Add an "unclear" value to the clause-type enum so the model can flag ambiguous clauses for human review.

**설명**

이는 정답이다. 실제 카테고리만으로 구성된 폐쇄형 enum은 조항이 그중 어느 것에도 명확히 해당하지 않을 때조차 모델이 하나를 선택하도록 강제한다. "unclear" 값은 모델에게 정직한 도피구를 제공하며, 이렇게 추출된 항목은 확신 있는 레이블로 처리되는 대신 인간 검토로 라우팅될 수 있다.

### 전반적인 설명

추출 스키마의 enum 필드는 강제 선택(forced-choice) 메커니즘이다. 요청이 정상적으로 완료되고 필드가 필수인 경우, 스키마 강제는 모델이 나열된 값 중 하나를 내놓도록 제약한다(Anthropic은 거부, max_tokens에 의한 잘림, 문자열 enum 값의 대소문자 차이 같은 예외를 문서화하고 있으므로, 준수가 절대적이라기보다는 대부분의 경우에 보장된다). 바로 이 제약 때문에 enum 설계가 중요하다. 목록의 모든 값이 확정된 카테고리를 나타낸다면, 조항이 어디에도 명확히 속하지 않을 때 스키마 자체는 정직한 답을 남겨두지 않으므로, 모델은 구조가 요구하는 대로 가장 가까운 값을 고르게 되고, 이는 다운스트림에서 확신 있는 분류로 읽히게 된다.

이에 대해 설계된 해결책은 불확실성을 일급 값으로 만드는 것이다. enum에 "unclear"를 추가하면 애매한 경우에 대해 모델에게 정당한 출력을 제공하며, 애매함을 조용한 오분류 대신 파이프라인이 인간 검토로 라우팅할 수 있는 기계가 인식 가능한 신호로 바꾼다. 이는 알려진 카테고리 밖의 입력에 대해 "other" 값과 자유 텍스트 세부 필드를 짝짓는 것과 동일한 설계 원칙이다. 스키마는 편리한 상태만이 아니라 원본 데이터의 모든 진실한 상태를 표현할 수 있어야 한다. 참고로 표준 JSON 스키마는 enum에 어떤 JSON 값이든 허용하지만, Anthropic의 구조화된 출력 기능은 enum 값을 문자열, 숫자, 불리언, null로 특별히 제한하며, Anthropic은 대소문자가 엄격히 보장되지 않으므로 문자열 enum 값을 대소문자 구분 없이 비교하도록 권고한다.

다른 접근법들은 구조적 제약을 그대로 둔 채로 실패한다. "확신이 있을 때만 분류하라"는 프롬프트 지시는 값을 요구하는 스키마와 충돌하며, 신뢰도 관련 모호한 표현은 그런 충돌이 없어도 신뢰할 수 없다. 분류를 두 번 실행하는 것은 정확성이 아니라 일관성을 측정할 뿐이며, 강제된 잘못된 선택은 실행 간에 흔히 안정적으로 유지된다. temperature를 0으로 하는 것도 마찬가지로 토큰이 샘플링되는 방식만 바꿀 뿐, 스키마가 정직한 답을 허용하는지 여부는 바꾸지 못한다. 스키마와 enum 제약에 대해서는 Structured outputs를 참고하라.

### 출처: Prompt Engineering & Structured Output/시나리오5_고객지원.md
## 질문 1

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : Before calling process_refund, the agent produces a structured dispute record. Validation fails: refund_amount is 85.00 but the extracted disputed line items sum to 70.00, and order_date is not ISO 8601. What should the retry request contain?

**A.** Resubmit the original prompt with a general reminder appended to double-check amounts and date formats.

**설명**

일반적인 리마인더는 오류 피드백이 아니라 모호한 지시일 뿐이다. 구체적으로 어떤 값이 충돌했는지, 어떤 필드가 형식을 위반했는지 알려주지 않는다. 재시도가 빠르게 수렴하려면 구체적인 검증 오류가 필요하다.

**B.** Resubmit the original prompt unchanged, relying on regeneration to produce a valid record.

**설명**

아무런 피드백 없이 재제출하면 재시도가 표적화된 수정이 아니라 다시 한번 무작위로 시도하는 것에 불과해진다. 모델은 무엇이 잘못되었는지에 대한 신호가 전혀 없으므로 동일한 산술 오류와 형식 오류가 다시 발생할 가능성이 높다.

**C(정답).** Include the source conversation and order data, the failed record, and the two specific validation errors.

**설명**

이것은 오류 피드백을 포함한 재시도 패턴이다. 모델은 자신이 생성한 결과, 정확히 무엇이 잘못되었는지, 그리고 수정 시 참조해야 할 원본 자료를 모두 확인할 수 있다. 이 세 가지가 모두 제공되면 보통 한두 번의 재시도로 이런 형식 및 산술 불일치를 해결할 수 있다.

**D.** Send only the two validation errors plus a firmer instruction to comply, omitting the failed record and source data.

**설명**

오류만으로는 충분하지 않다. 실패한 결과물이 없으면 모델은 어떤 값을 수정해야 하는지 알 수 없고, 원본 데이터가 없으면 환불 금액이나 항목 내역을 다시 근거로 삼을 수 없다. 더 강한 어조의 지시는 수정을 이끌어낼 실질적인 정보를 추가로 제공하지 않는다.

### 전반적인 설명

검증-재시도 루프는 구조화된 출력에 대한 표준적인 신뢰성 패턴이다. 모델이 생성하고, 코드가 스키마와 비즈니스 규칙에 따라 검증하며, 실패하면 피드백과 함께 다시 프롬프트를 보낸다. 재시도를 효과적으로 만드는 것은 그 구성 요소다. 모델에는 세 가지가 필요하다. 올바른 값을 다시 도출할 수 있게 해주는 원본 자료(대화 내용과 주문 데이터), 무엇을 수정해야 하는지 알 수 있게 해주는 실패한 결과물, 그리고 맹목적인 재생성이 아니라 표적화된 수정이 되도록 하는 구체적인 오류("refund_amount는 85.00이지만 항목 합계는 70.00입니다. order_date는 ISO 8601 형식이어야 합니다")다. 여기서 두 오류 모두 재시도로 해결 가능한 종류다. 모델이 다시 확인할 수 있는 산술 불일치와 다시 포맷할 수 있는 형식 위반이다. 필요한 정보가 원본 자료에 전혀 없는 경우에만 재시도가 무의미해진다.

핵심 개념은 피드백 없는 재시도는 단순한 재추출일 뿐이며 실패 확률이 거의 변하지 않는다는 것이다. 실패한 결과물이나 원본 데이터를 빼면 모델이 문제가 되는 값을 찾거나 다시 근거를 세울 수 없게 되며, "다시 확인하라"는 식의 일반적인 리마인더는 구체적인 기준과 구체적인 오류가 대체하고자 하는 바로 그 모호한 지시에 해당한다. 실무에서는 이 루프를 의미론적 자체 검증 필드(명시된 합계와 계산된 합계를 함께 추출하고 충돌 플래그를 두는 방식)와 결합해, 이런 불일치를 환불 도구가 호출되기 전에 기계적으로 탐지하도록 하는 것이 좋다.

스키마 제약 출력과 반복적 개선의 메커니즘에 대해서는 Tool use overview와 Prompt engineering overview를 참고하라.

### 출처: Prompt Engineering & Structured Output/시나리오5_고객지원.md
## 질문 6

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : The agent extracts a structured dispute record before calling lookup_order. The purchase_date field always passes schema validation, yet values arrive as "yesterday", "early last week", or "03/04/2025", and order lookups fail or return the wrong orders. What is the most effective fix?

**A.** Tighten the schema by adding minLength and maxLength constraints so malformed date strings are rejected at validation.

**설명**

구조화된 출력은 JSON Schema의 일부만 지원하며, minLength와 maxLength 같은 문자열 제약은 지원되지 않으므로 이 스키마는 강제 효과 없이 요청 오류만 발생시킬 수 있다. 길이를 제약할 수 있다 해도 "yesterday" 같은 상대적 표현을 절대 날짜로 변환할 수는 없다.

**B.** Post-process the extracted dates with a natural-language date-parsing library that converts whatever text the model returned.

**설명**

파싱 라이브러리는 추출된 문자열만 독립적으로 처리하며 모델이 가진 대화 맥락이 없으므로, "early last week" 같은 모호한 표현이나 03/04/2025 같은 모호한 숫자 형식은 신뢰성 있게 파싱되지 않는다. 전체 대화를 볼 수 있는 추출 시점에 모델이 정규화하도록 하는 것이 결과물을 이후에 수정하는 것보다 더 정확하다.

**C(정답).** Add prompt normalization rules: resolve relative dates against the current date provided in context and output ISO 8601.

**설명**

이것이 정답이다. 스키마는 필드가 올바른 형태의 문자열인지만 강제할 수 있다. "yesterday"나 "early last week"를 절대 날짜로 변환하는 것은 모델만 수행할 수 있는 의미론적 변환이며, 이를 일관되게 수행하려면 명시적인 규칙과 기준 날짜가 모두 필요하다. 스키마와 함께 프롬프트에 명시된 정규화 규칙이 바로 이 공백을 메운다.

**D.** Set the sampling temperature to zero so the model formats the date field identically on every extraction.

**설명**

온도(temperature)는 토큰 선택의 무작위성을 제어할 뿐, 모델이 따라야 할 날짜 표기 규칙을 정의하지는 않는다. 명시된 정규화 규칙이 없으면 모델은 고객이 사용한 형식을 그대로 반복할 것이고, 단지 그 반복이 더 결정적일 뿐이다.

### 전반적인 설명

여기서 핵심 구분은 스키마가 보장하는 것과 표현할 수 없는 것 사이의 차이다. 구조화된 출력이나 도구 정의에 붙은 JSON 스키마는 형태를 제약한다. 필드가 존재할 것, 문자열일 것, JSON이 문법적으로 유효할 것 등이다. 의미에 대해서는 아무것도 말해주지 않는다. "yesterday"가 절대 날짜로 해석되었는지, 03/04/2025가 4월 3일인지 3월 4일인지, 값이 lookup_order가 필터링할 수 있는 형식인지 여부는 알 수 없다. 이 의미론적 계층은 프롬프트에 속한다. 목표 표기법(ISO 8601, YYYY-MM-DD)을 명시하고, 상대적 표현을 해석할 기준이 되는 현재 날짜를 모델에 제공하며, 모호한 숫자 형식에 대한 명확화 규칙을 지정해야 한다. 필드의 스키마 설명에 규칙을 반복해 적고 예시 매핑("yesterday"가 계산된 절대 날짜가 되는 예)을 보여주면 이를 강화할 수 있으며, 이는 도구 정의에서 형식에 민감한 파라미터를 자세히 설명하라는 Anthropic의 가이드와도 일치한다.

이 수정을 스키마 쪽으로 밀어넣으려는 시도는 두 가지 이유로 실패한다. 첫째, 구조화된 출력은 JSON Schema의 일부만 지원한다. minLength, maxLength 같은 문자열 제약은 지원되지 않으며 400 오류를 유발할 수 있다. 둘째, 검증이 작동하더라도 그것은 거부만 할 뿐, 상대적 표현을 날짜로 변환하는 방법을 모델에 가르쳐주지 않는다. 날짜 라이브러리로 후처리하는 방법은 문제를 대화를 전혀 보지 못한 구성 요소로 옮기는 것이므로, 모델이 직접 해석할 수 있었던 표현을 추측해야 하게 된다. 그리고 온도 조정은 표기 규칙이 아니라 샘플링 분산을 바꾸는 것이다. 명시된 규칙이 없는 모델은 온도가 0이어도 고객의 표현을 그대로, 단지 더 일관되게 반영할 뿐이다. 기억해야 할 핵심 개념은 스키마는 구조를 강제하고, 프롬프트는 정규화 의미론을 담당하며, 신뢰할 수 있는 파이프라인은 이 둘을 함께 사용한다는 것이다.

### 출처: Prompt Engineering & Structured Output/시나리오5_고객지원.md
## 질문 8

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : You define three triage tools, one per request category (returns, billing, account), and set tool_choice to "any" so intake always yields structured output. Billing disputes are occasionally triaged through the returns tool. What is the right fix?

**A.** Set tool_choice to "none" on the first turn so the model states the category in text before a structured tool call is compelled.

**설명**

"none" 모드는 어떤 도구 사용도 막아버리므로, 첫 턴이 구조화된 출력이 아니라 자유 텍스트를 생성하게 되어 인테이크(intake) 설계 자체가 무너진다. 프롬프트 형식의 사전 분류도 이후의 도구 선택을 고정시키지 않으므로, 다음 턴에서 잘못된 라우팅이 여전히 발생할 수 있다.

**B.** Force a single named triage tool with tool_choice type "tool" so misclassification between schemas can no longer occur on any request.

**설명**

단일한 이름 있는 도구를 강제하면 모든 요청을 하나의 스키마로 라우팅함으로써 선택 오류를 제거할 뿐이다. 요청이 실제로 세 가지 범주에 걸쳐 있으므로, 반품과 계정 문제는 강제된 스키마에 억지로 끼워 맞춰지게 되어, 간헐적인 오분류가 체계적인 오분류로 바뀌게 된다.

**C.** Change tool_choice to "auto" so the model deliberates over the request before committing itself to one of the triage tools.

**설명**

"auto" 모드는 숙고 과정을 추가하지 않는다. 단지 모델이 도구를 호출하는 대신 일반 텍스트로 응답하는 것을 허용할 뿐이다. 이는 인테이크가 항상 구조화된 출력을 생성한다는 보장을 희생시키면서도, 모델이 범주를 구분하는 능력은 전혀 개선하지 못한다.

**D(정답).** Sharpen the tool descriptions to separate the categories, since "any" compels a tool call but leaves the choice of tool to the model.

**설명**

이것이 정답이다. tool_choice "any"는 제공된 도구 중 하나가 호출된다는 것만 보장할 뿐, 어떤 도구가 호출될지에는 영향을 주지 않는다. 도구 선택은 도구 정의 자체에 의해 결정되므로, 범주 경계를 명확히 구분하는 설명이야말로 구조화된 출력 보장을 유지하면서 스키마 간 오분류를 고치는 메커니즘이다.

### 전반적인 설명

tool_choice 파라미터에는 문서화된 네 가지 모드가 있으며, 각각 서로 다른 질문에 답한다. auto(도구가 제공되었을 때의 기본값)는 모델이 도구를 호출할지 여부 자체를 결정하게 한다. any는 모델이 제공된 도구 중 하나를 반드시 호출하도록 요구하지만, 그중 무엇을 선택할지는 의도적으로 모델에 맡긴다. {"type": "tool", "name": ...}는 호출을 하나의 이름 있는 도구로 고정한다. none은 도구 사용을 완전히 막는다. 핵심 개념은 두 축으로 이루어진 결정이라는 것이다. 하나의 축은 도구 호출이 일어날지를 제어하고, 다른 축은 어떤 도구가 호출될지를 제어한다. any는 첫 번째 축만 고정하는데, 이것이 바로 여러 개의 추출 스키마가 존재하고 요청 유형을 사전에 알 수 없을 때 올바른 설정인 이유다.

any가 설정되면, "어떤 도구가 호출되는가"라는 두 번째 축은 도구 정의에 의해 결정된다. description 필드는 모델의 주된 선택 신호다. 트리아지 도구의 설명이 모호하거나 서로 겹치면, 모델은 billing dispute와 returns 같은 인접한 범주를 혼동한다. 이 문제의 해법은 각 도구가 무엇을 다루는지, 무엇을 다루지 않는지, 언제 인접 도구보다 우선되어야 하는지를 명시하는 도구 정의에 있는 것이지, 이미 제 역할을 다하고 있는 tool_choice 설정에 있는 것이 아니다.

오답들은 각각 한 축을 깨뜨려 다른 축을 억지로 메우려 한다. 단일한 이름 있는 도구를 강제하는 것은 간헐적인 오분류를 세 범주 중 두 범주에 대한 확실한 스키마 불일치로 바꾸는 것이다. auto나 none으로 전환하는 것은 이 설계의 목적이었던 구조화된 출력 보장을 포기하는 것이며, 어느 모드도 모델이 범주를 구분하는 능력을 향상시키지 못한다. 각 모드의 문서화된 동작과 도구 설명 작성 가이드에 대해서는 Implement tool use와 tool use overview를 참고하라.

### 출처: Prompt Engineering & Structured Output/시나리오5_고객지원.md
## 질문 10

**SCENARIO** : You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

**QUESTION** : Human support staff dismiss roughly a third of the agent's escalations as unnecessary, but case-by-case transcript review has not revealed why. What change makes the dismissal problem systematically analyzable?

**A.** Add a prompt instruction telling the agent to escalate only when genuinely necessary and to avoid borderline cases.

**설명**

이것은 틀렸다. "필요할 때만 에스컬레이션하라" 같은 모호한 지침은 주관적이며 일관되지 않은 동작을 낳는다. 팀이 어떤 에스컬레이션 트리거가 문제인지도 모르는 상태에서 수정을 시도하는 것이므로, 이는 기각 패턴을 분석 가능하게 만들 수 없다.

**B.** Ask reviewing staff to leave free-text notes on each dismissed escalation and read them in a weekly retrospective.

**설명**

이것은 틀렸다. 자유 텍스트 메모는 비정형적이고 검토자마다 일관성이 없어 집계가 수동적이고 신뢰할 수 없게 된다. 이는 기계가 기록한 트리거가 아니라 증상에 대한 사람의 의견을 담을 뿐이므로, 체계적인 패턴 분석은 여전히 손에 잡히지 않는다.

**C(정답).** Add a detected_pattern field recording the trigger for each escalation, then aggregate dismissal rates by pattern.

**설명**

이것이 정답이다. 각 에스컬레이션을 유발한 요청 특성을 구조화된 필드로 기록하면 각 기각이 그룹화하고 집계할 수 있는 데이터 포인트가 된다. 패턴별 기각률을 집계하면 정확히 어떤 트리거가 불필요한 에스컬레이션을 유발하는지 드러나므로, 추측이 아니라 가장 문제가 되는 요인을 표적으로 프롬프트를 수정할 수 있다.

**D.** Have the agent attach a self-rated confidence score to each escalation and suppress those below a fixed threshold.

**설명**

이것은 틀렸다. 자체 평가 신뢰도는 보정이 잘 되어 있지 않으며, 억제는 에스컬레이션을 설명하는 것이 아니라 걸러낼 뿐이다. 신뢰도가 낮은 에스컬레이션을 자동으로 버리는 것은 실제로 사람이 필요한 경우까지 숨길 위험이 있으며, 이는 에스컬레이션 경로가 존재하는 목적과 상충한다.

### 전반적인 설명

여기서의 근본적인 설계 원칙은 구조화된 발견 항목이 결정 자체뿐 아니라 그 결정이 발생한 이유도 함께 담아야 한다는 것이다. detected_pattern 필드는 에스컬레이션 스키마에 애플리케이션 차원에서 추가하는 것으로, 에이전트가 에스컬레이션할 때 어떤 요청 특성이 그 결정을 유발했는지(예: 정책 상한에 가까운 환불 금액, 모호한 주문 상태, 명백한 고객의 불만 표현 등) 기록한다. 이제 모든 에스컬레이션이 기계가 읽을 수 있는 트리거를 갖게 되므로, 기각은 더 이상 일화가 아니라 그룹화할 수 있는 행(row)이 된다. 한 패턴으로 유발된 에스컬레이션이 70%의 비율로 기각되는 반면 다른 패턴은 5%만 기각된다면, 프롬프트 기준을 어디에서 강화해야 하는지 정확히 알 수 있고, 정확한 트리거는 그대로 둘 수 있다.

이는 피드백 루프의 사고 방식이다. 먼저 출력을 계측하고, 측정된 증거를 바탕으로 동작을 바꾸는 것이다. 다른 대안들은 모두 이 계측 단계를 건너뛴다. "필요할 때만 에스컬레이션하라"는 모호한 지시는 전형적인 모호한 기준 안티패턴이며, 맹목적이고 일관성 없이 행동을 바꾼다. 검토자의 자유 텍스트 메모는 에이전트의 실제 트리거가 아니라 사람의 인상을 기록하며, 비정형 텍스트는 실질적인 규모에서 집계에 저항한다. 자체 평가 신뢰도 임계값은 에스컬레이션을 진단하기보다 걸러내며, 신뢰도가 낮은 에스컬레이션을 자동으로 억제하는 것은 에스컬레이션 경로가 제공해야 할 안전장치를 조용히 제거한다.

기술적으로는, 발견 항목이 이미 JSON 스키마(엄격한 도구 사용이든 API의 구조화된 출력 지원이든)를 통해 출력되고 있다면 이런 필드를 추가하는 것은 간단하다. 그 필드는 스키마에 하나의 필수 속성으로 더해지고 생성 시점에 채워진다. 이런 필드의 형태를 스키마가 어떻게 보장하는지는 Structured outputs를 참고하되, 스키마는 구조를 보장할 뿐이고 그 필드의 진단적 가치는 후속 집계에서 나온다는 점을 기억해야 한다.

### 출처: Prompt Engineering & Structured Output/시나리오6_생산성도구.md
## 질문 1 (기출)

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : A pipeline extracts metadata from legacy service manifests. The schema marks deprecation_date as required, but many older manifests never record one, and the model fills the field with plausible dates. Which change prevents the fabrication?

**A.** Add a system prompt rule stating that the model must never output a deprecation date that does not appear in the manifest text.

**설명**

프롬프트 지시는 값을 구조적으로 요구하는 스키마를 무력화할 수 없다. 매니페스트에 날짜가 없어도 모델은 여전히 스키마에 유효한 무언가를 내놓아야 한다. 지시는 잘해야 조작 가능성을 낮추는 정도이며, required 필드 제약은 계속해서 그것을 강제한다.

**B(정답).** Declare deprecation_date nullable with type ["string", "null"] and omit it from required so the model can return null for missing dates.

**설명**

이 답이 정답인 이유는, null 옵션이 없는 required 필드는 모델이 값의 부재를 정직하게 보고할 방법을 남기지 않아 스키마에 맞는 값을 만들어내게 만들기 때문이다. 필드를 nullable이면서 선택적으로 만들면 모델에게 날짜 누락을 정당하게 표현할 방법이 생기고, 조작을 유발하는 구조적 압박이 제거된다.

**C.** Add a pattern constraint restricting deprecation_date to the manifests' ISO date format so fabricated values fail schema validation.

**설명**

조작된 날짜는 보통 형식이 올바르기 때문에, 패턴 제약은 실제 날짜와 마찬가지로 조작된 날짜도 그대로 통과시킨다. 형식을 강화해도 값의 형태만 제한할 뿐, 날짜가 없다는 것을 표현할 정당한 방법은 여전히 없으므로 조작 압박은 그대로 남는다.

**D.** Re-run each affected extraction with the fabricated date and a correction instruction included in the retry prompt.

**설명**

오류 피드백을 활용한 재시도는 형식이나 구조적 실수에는 효과가 있지만, 소스에 아예 존재하지 않는 정보에는 효과가 없다. 매니페스트에는 근거로 삼을 폐기 예정일이 없고 스키마는 여전히 값을 요구하므로, 재시도는 또 다른 조작을 낳을 수밖에 없다.

### 전반적인 설명

스키마는 단순히 출력의 형태를 기술하는 것을 넘어, 모델이 낼 수 있는 답변의 전체 공간을 정의한다. Structured Outputs를 사용하면 required 필드는 선언된 타입으로 반드시 존재하도록 보장되는데, 이 보장은 양날의 검이다. 소스 문서에 실제로 필요한 값이 없을 때 모델은 그 필드를 비워둘 수 없으므로, 스키마상 유일하게 합법적인 방법은 그럴듯한 값을 지어내는 것뿐이다. 이 조작은 부주의한 생성 때문이 아니라 스키마 설계 자체에서 비롯된다. 여기서 가져가야 할 사고 모델은, "이 정보는 여기에 존재하지 않는다"를 포함한 소스의 모든 실제 상태가 스키마 안에서 합법적으로 표현될 수 있어야 한다는 것이다.

Anthropic이 지원하는 JSON Schema 하위 집합은 바로 그런 표현 방법을 제공한다. "type": ["string", "null"]과 같은 union 타입을 사용하면 필드에 명시적으로 null을 담을 수 있고, required 목록에서 필드를 제외하면 그 필드는 선택적이 된다. 이 둘은 서로 다른 설계 선택이다. required이면서 nullable인 필드는 키는 반드시 존재하게 하면서 진실한 null 값은 허용하는 반면, 선택적 필드는 완전히 생략될 수 있다. 어느 쪽이든 모델은 데이터가 없을 때 정직하게 답할 방법을 얻게 되며, 이는 이 실패 유형에 대해 문서화된 예방책이다.

다른 접근법들은 증상만 건드릴 뿐이다. 형식 패턴은 값의 형태만 조일 뿐이며, 지어낸 날짜는 구문상 실제 날짜와 구별되지 않는다. 오류 피드백을 통한 재시도는 수정 가능한 오류에는 강력하지만, 정보가 소스에 아예 없는 경우에는 효과가 없다고 문서에 명시되어 있다. 수정이 근거로 삼을 것이 매니페스트에 전혀 없기 때문이다. 추측을 금지하는 프롬프트 규칙은 값을 요구하는 확고한 구조적 제약과 확률적 지시를 맞세우는 셈인데, 결국 제약이 이겨서 조작된 날짜가 계속 흘러나가게 된다. 지원되는 nullable 및 선택적 필드 메커니즘은 Structured outputs 문서를, 프롬프트 전용 기법 대신 스키마 강제에 의존해야 하는 시점은 Increase output consistency 문서를 참고하라.

### 출처: Prompt Engineering & Structured Output/시나리오6_생산성도구.md
## 질문 5

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : Despite a system prompt that lists required sections and formatting rules in detail, the agent's legacy-module overviews vary: prose one run, bullets the next, sometimes with sections missing. Which change most reliably produces consistently structured overviews?

**A(정답).** Add three to four example overviews wrapped in XML tags that demonstrate the exact expected sections and structure.

**설명**

이 답이 정답이다. 상세한 지시만으로는 일관되지 않은 출력이 나올 때, 잘 구성된 예시는 문서상 권장되는 해결책이다. 목표 형식을 설명하는 대신 모델에게 정확히 보여주기 때문이며, Anthropic은 일관성 확보에 있어 예시로 제약을 두는 것이 추상적인 지시보다 더 효과적이라고 명시하고 있다. 예시를 XML 태그로 감싸면 지시와 명확히 구분된다.

**B.** Set the temperature to zero so the model formats every overview deterministically instead of sampling varied structures.

**설명**

temperature는 토큰 샘플링의 변동성에 영향을 줄 뿐, 모델이 요구되는 구조를 이해하는 방식에는 영향을 주지 않는다. 낮은 temperature는 개별 응답을 더 예측 가능하게 만들 수 있지만, 형식에 대한 모델의 해석이 충분히 구체화되지 않았다면 입력과 실행마다 여전히 흔들리게 된다.

**C.** Rewrite the formatting instructions with stronger emphasis, marking each required section as IMPORTANT and repeating the rules at the end of the prompt.

**설명**

시나리오는 이미 상세한 지시가 존재하는데도 출력이 여전히 일정하지 않다고 명시하고 있다. 강조와 반복을 추가하는 것은 이미 실패하고 있는 동일한 채널을 강화하는 것일 뿐이다. 지시는 형식을 문장으로 설명하지만 예시는 그것을 직접 보여주며, 이것이 바로 예시가 여기서 더 신뢰할 수 있는 해결책인 이유다.

**D.** Prefill the assistant turn with the first section heading so the response is forced to begin in the required layout.

**설명**

프리필은 시작 토큰만 고정할 뿐, 여러 섹션으로 구성된 문서를 중간과 끝까지 일관되게 유지하지는 못한다. 프리필된 제목을 지나면 모델은 다시 문장 지시를 해석하는 상태로 돌아가므로, 팀이 겪고 있는 섹션 간의 흔들림이 그대로 이어지게 된다.

### 전반적인 설명

여기서 실패 유형은 전형적이다. 문장 지시는 형식을 설명하지만, 매 실행마다 모델은 그 설명을 다시 해석해야 하고 그 해석은 매번 달라진다. Few-shot 예시는 목표를 직접 시연함으로써 이 간극을 메운다. Anthropic의 가이드는 예시를 출력 형식, 어조, 구조를 조정하는 가장 신뢰할 수 있는 방법 중 하나로 꼽으며, 일관성에 관한 가이드에서는 예시로 제약을 두는 것이 추상적인 지시보다 더 효과적이라고 명시적으로 밝히고 있다. 권장되는 방식은 실제 사용 사례를 반영하는 관련성 있고 다양한 소수(대략 3~5개)의 예시를 <example> 또는 <examples> 태그로 감싸, 모델이 시연과 지시를 구분할 수 있도록 하는 것이다.

여기서의 사고 모델은 다음과 같다. 지시는 모델이 적용해야 할 규칙을 정의하고, 예시는 모델이 매칭하고 일반화할 수 있는 패턴을 정의한다. 신뢰성 측면에서 둘이 충돌할 때는 구체적인 시연에 대한 패턴 매칭이 이긴다. 이것이 바로 상세한 지시가 이미 고치지 못한 형식 흔들림을, 강조를 더하거나 규칙을 반복하는 것으로는 거의 고칠 수 없는 이유다. temperature 같은 샘플링 조절 장치는 한 번의 실행 내에서 무작위성을 줄일 뿐, 충분히 구체화되지 않은 형식을 명확하게 만들지는 못한다. 어시스턴트 턴을 프리필하는 것도 시작 토큰만 고정할 뿐, 여러 섹션으로 구성된 문서의 나머지 부분은 여전히 동일하게 가변적인 해석에 맡겨진다. 요구사항이 사람이 읽는 일관된 구조의 문서가 아니라 기계가 엄격하게 파싱해야 하는 JSON이라면, 올바른 대응은 구조화된 출력(structured outputs)이나 JSON 스키마를 사용하는 tool use로 넘어가는 것이다. 필요한 형태를 갖춘 사람이 읽는 개요 문서라면, 목표를 겨냥한 예시가 문서상 권장되는, 가장 마찰이 적은 해결책이다.

See Increase output consistency and Prompt engineering best practices.

### 출처: Prompt Engineering & Structured Output/시나리오6_생산성도구.md
## 질문 8

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : This team's agent runs a validation-retry loop: when a structured extraction fails schema or business-rule validation, the failure is fed back for self-correction. Retry budgets are being exhausted on failures that never resolve. Which retry-policy change should the team make?

**A(정답).** Bypass retries when the required information is simply not present in the source file being analyzed.

**설명**

이 답이 정답인 이유는 자기 수정이 모델이 자신의 출력을 소스에 다시 근거하여 검토하는 데 의존하기 때문이다. 소스 파일에 원래부터 그 정보가 없었다면 아무리 재시도해도 그 정보를 만들어낼 수 없으므로, 이 루프는 수렴하지 못한 채 예산만 소모한다. 이런 경우는 null 처리나 에스컬레이션 경로로 보내야 한다.

**B.** Bypass retries when per-item counts fail to sum to the stated total reported elsewhere in the file.

**설명**

산술적 불일치는 재시도로 해결 가능한 유형이다. 오류 피드백에 불일치 내용이 명확히 적혀 있으면 모델이 소스와 개별 값을 다시 대조 검토할 수 있기 때문이다. 이런 경우는 보정된 첫 시도에서 해결되는 경우가 많으므로, 재시도를 건너뛰는 것은 이 패턴의 강점을 낭비하는 것이다.

**C.** Bypass retries when a date field arrives in a format the schema's pattern constraint rejects.

**설명**

형식 오류는 재시도로 해결 가능한 전형적인 실패 유형이므로, 여기서 재시도를 건너뛰는 것은 쉽게 얻을 수 있는 성과를 버리는 것이다. 재시도 프롬프트에 구체적인 검증 오류가 포함되어 있으면 모델은 소스에서 이미 찾아낸 값을 다시 형식화할 수 있으며, 이런 문제는 대개 한두 번의 시도 안에 해결된다.

**D.** Bypass retries when a value was placed under the wrong field name in an otherwise valid structure.

**설명**

값이 잘못된 위치에 놓이는 것과 같은 구조적 오류는 재시도로 해결 가능하므로 루프 안에 그대로 두어야 한다. 재시도 요청에 소스, 실패한 추출 결과, 그리고 구체적인 오류가 포함되어 있으면 모델은 다음 시도에서 값을 올바른 필드로 재배치할 수 있다.

### 전반적인 설명

검증-재시도 패턴이 효과적인 이유는 검증 실패를 목표가 명확한 수정 작업으로 바꾸어주기 때문이다. 모델은 추출 대상이었던 소스, 자신이 만들어낸 출력, 그리고 거부된 패턴이나 맞지 않는 합계와 같은 구체적인 오류를 받는다. 이 세 가지가 모두 주어지면 모델은 문제가 된 값을 소스에 다시 근거하여 수정할 수 있으며, 이것이 바로 형식 오류, 구조적 오류(값이 잘못된 필드에 들어간 경우), 산술적 불일치가 대개 한두 번의 재시도로 해결되는 이유다.

이 패턴의 한계는 정보의 가용성에 있다. 재시도는 모델이 볼 수 있는 자료 안에 정답이 존재할 때만 도움이 된다. 필요한 정보가 소스 파일에 없거나, 제공되지 않은 외부 문서에만 존재한다면, 재시도할 때마다 동일하게 불가능한 작업이 반복된다. 모델은 다시 실패하거나, 더 나쁘게는 스키마를 만족시키기 위해 그럴듯한 값을 조작해낸다. 설계자는 재시도에 앞서 검증 실패를 분류해야 한다. 재시도로 해결 가능한 실패는 시도 횟수에 제한을 둔 오류 피드백 루프로 보내고, 정보 부재로 인한 실패는 null 결과, 선택적/nullable 필드, 또는 사람이 검토하는 대기열로 즉시 보내야 한다. 이러한 분류는 또한 진정으로 선택적인 데이터를 스키마에서 nullable로 만들어야 하는 이유이기도 하다. 그렇게 해야 모델이 조작을 강요받는 대신 부재를 정직하게 보고할 방법을 갖게 된다.

JSON Schema 검증이 에이전트 출력과 어떻게 통합되는지는 Agent SDK structured outputs 문서를 참고하라.

### 출처: Prompt Engineering & Structured Output/시나리오6_생산성도구.md
## 질문 9

**SCENARIO** : You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

**QUESTION** : The agent's structured code findings are supposed to carry a detected_pattern annotation, requested through prompt instructions, but many findings omit it and false-positive aggregation keeps breaking. What change guarantees the annotation appears in every finding?

**A.** Lower the sampling temperature to zero so the model emits the annotation deterministically each run.

**설명**

temperature는 토큰 샘플링의 변동성을 조절할 뿐, 스키마 준수를 보장하지 않는다. temperature를 0으로 설정하면 출력이 더 반복 가능해지지만, 스키마가 요구하지 않는 필드를 포함해야 한다는 구조적 의무를 만들어내지는 못한다.

**B.** Set additionalProperties to true on the finding object so the annotation field is always permitted.

**설명**

추가 속성을 허용하는 것은 어떤 필드가 반드시 나타나야 한다는 것을 요구하지 않으므로, 누락은 계속될 것이다. 게다가 Anthropic이 지원하는 JSON Schema 하위 집합에서는 스키마로 제약되는 객체에 대해 additionalProperties가 false여야 하므로, 이 설정 자체가 지원되지 않는다.

**C.** Restate the annotation instruction in the system prompt and again at the start of every user turn.

**설명**

프롬프트 지시는 모델이 그 필드를 포함할 가능성을 높여주지만 여전히 확률적일 뿐, 모든 발견 항목에 필드가 존재함을 보장하지 못한다. 시나리오에서 나타난 간헐적인 누락은, 이 경우 지시를 강조하는 것만으로는 충분하지 않다는 직접적인 증거다.

**D(정답).** Define detected_pattern in each finding's JSON schema and include it in the required list.

**설명**

Structured output는 스키마 자체에 표현된 필드에 대해서만 보장을 제공한다. detected_pattern을 스키마 필드로 만들고 required로 지정하면 스키마를 따르는 모든 발견 항목이 그 값을 반드시 가지게 되며, 이는 프롬프트 지시만으로는 제공할 수 없는 정확한 보장이다.

### 전반적인 설명

여기서 가져가야 할 사고 모델은, structured output이 Claude가 만들어내는 결과물의 형태를 강제하지만, 그 강제는 스키마가 실제로 선언한 필드에 대해서만 적용된다는 것이다. 발견 항목 스키마가 detected_pattern을 정의하고 이를 required 목록에 넣으면, 스키마를 따르는 모든 추출 결과는 그 값을 반드시 가져야 한다. 모델이 단순히 그것을 빠뜨릴 수 있는 실행은 없다. 문장으로만 요청된 것은 이 보장 밖에 있다. 모델은 보통 이를 따르지만 그 준수는 확률적이며, 이것이 바로 이 어노테이션이 간헐적으로 나타났던 정확한 이유다.

이 구분은 이 필드가 지원하려는 오탐(false-positive) 워크플로에서 중요하다. detected_pattern별로 기각된 발견 항목을 집계하는 작업은 모든 레코드에 그 필드가 존재해야만 제대로 동작한다. 데이터에 공백이 있으면 분석이 우연히 어노테이션된 탐지 행동 쪽으로 조용히 편향된다. 이 필드를 지시에서 스키마로 옮기면, 최선을 다하는 수준의 어노테이션이 신뢰할 수 있는 분석 차원으로 바뀐다.

오답들은 각각 특징적인 이유로 실패한다. 지시를 더 강조해서 반복하는 것은 구조적인 문제를 프롬프트의 압박으로 풀려는 전형적인 패턴이며, 실패율을 줄일 뿐 없애지는 못한다. additionalProperties를 true로 설정하는 것은 필드를 허용하는 것과 요구하는 것을 혼동한 것이며, 문서화된 스키마 하위 집합은 어떤 경우든 제약된 객체에 대해 additionalProperties가 false여야 한다고 요구한다. temperature 조정은 샘플링의 무작위성을 다스릴 뿐 구조적 의무를 다스리지 않으므로, 결정론적 디코더라 해도 선택적 필드를 결정론적으로 빠뜨릴 수 있다. 스키마로 선언된 필드, required, additionalProperties가 어떻게 상호작용하는지는 Structured outputs 문서를 참고하라.

### 출처: Tool Design & MCP Integration/시나리오3_리서치시스템.md
## 질문 4

**SCENARIO** : You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

**QUESTION** : An agent tracing a re-exported utility Greps for each exported name, but the results list only file paths, so it cannot tell import statements apart from actual call sites. What is the correct next step?

**A.** Fall back to Bash running grep -rn, since the built-in Grep tool is limited to reporting file paths.

**설명**

전제 자체가 틀렸다. 내장 Grep 도구는 파일 경로만 반환하도록 제한되어 있지 않으며, 단지 기본값이 그 모드일 뿐이다. 셸 grep으로 내려가는 것은 에이전트가 소비하는 구조화된 출력을 제공하는 전용 도구를 버리는 것이며, -r 플래그는 내장 도구가 제공하는 gitignore 처리도 무시한다.

**B(정답).** Re-run Grep in content output mode so each match returns the matching line with its file and line number.

**설명**

Grep은 기본적으로 패턴을 포함한 파일의 경로만 반환하는 files_with_matches 모드로 동작한다. content 모드로 전환하면 파일명과 줄 번호와 함께 매칭된 줄 자체를 반환하는데, 이것이 바로 import문과 실제 호출 지점을 구분하는 데 필요한 정보다.

**C.** Wrap the search pattern in wildcards such as .*name.* so Grep returns entire matching lines instead of paths.

**설명**

정규식 패턴은 어떤 텍스트가 매칭되는지를 제어할 뿐, 결과가 어떻게 보고되는지는 제어하지 않는다. 와일드카드로 패턴을 넓혀도 출력 모드는 바뀌지 않으므로 도구는 여전히 파일 경로만 반환한다.

**D.** Switch to Glob with the exported name as the pattern, since Glob reports richer detail about each match than Grep.

**설명**

Glob은 파일명과 경로를 패턴과 매칭시킬 뿐 파일 내용을 절대 들여다보지 않으므로, export된 심볼 이름은 Glob이 검색할 수 있는 대상이 아니다. 또한 어떤 형태로든 줄 단위 세부정보를 반환하지 않는다.

### 전반적인 설명

ripgrep 기반의 내장 Grep 도구는 결과를 보고하는 방식이 하나가 아니다. 기본값인 files_with_matches는 "이 패턴을 포함한 파일은 무엇인가?"라는 질문에 파일 경로만 반환해 답한다. 이 기본값은 의도적인 절약이다. 많은 검색에서는 심볼이 어디에 있는지 아는 것만으로 충분하며, 흔한 식별자에 대해 매칭되는 모든 줄을 반환하면 컨텍스트 윈도우가 넘칠 것이다. re-export된 함수의 import문과 실제 호출을 구분하는 것처럼 매칭 자체를 살펴봐야 하는 작업이라면, 에이전트는 content 모드를 요청해야 하며, 이는 각 매칭 줄을 파일명 및 줄 번호와 함께 반환한다. 또 다른 문서화된 방법은 경로 목록을 유지한 채 관련 파일에 대해 Read를 후속으로 실행하는 것이지만, content 모드로 검색을 재실행하면 호출 지점 증거를 한 단계로 얻을 수 있다.

유지할 만한 사고 모델은, 검색에는 두 개의 독립적인 축이 있다는 것이다. 무엇을 매칭할지(정규식 패턴)와 무엇을 보고할지(출력 모드)다. 와일드카드로 패턴을 넓히는 것은 첫 번째 축만 바꾸므로 출력은 여전히 경로 목록으로 남는다. Glob을 쓰는 것은 두 축을 완전히 혼동하는 것이다. Glob은 파일명과 경로를 패턴과 매칭시킬 뿐 파일 내부를 절대 들여다보지 않으므로 심볼을 전혀 찾을 수 없다. Bash에서 grep -rn으로 대체하는 것은 기계적으로는 동작하지만, 내장 도구의 한계에 대한 잘못된 믿음에 근거한 것이며 구조화된 결과와 기본으로 제공되는 gitignore 인식 필터링을 포기하는 것이다.

Grep 도구의 출력 모드와 Glob 및 Read와의 관계에 대해서는 Claude Code 도구 레퍼런스를 참고하라.

### 출처: Tool Design & MCP Integration/시나리오4_데이터추출.md
## 질문 7

**SCENARIO** : You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

**QUESTION** : The system's single process_document tool exposes an operation enum (extract_entities, summarize_tables, classify_document). Logs show frequent wrong-operation calls, and each operation returns a differently shaped payload that breaks downstream schema validation. Which redesign fixes both problems?

**A.** Set tool_choice to force process_document on every request so the model always calls the tool instead of answering in text.

**설명**

tool_choice로 도구 호출을 강제하면 호출이 일어나는 것은 보장되지만, 모델이 호출 안에 어떤 operation 값을 채워 넣는지에는 아무런 영향을 미치지 않는다. 잘못된 라우팅과 일관되지 않은 페이로드 형태는 둘 다 그대로 남는다.

**B(정답).** Split it into three purpose-specific tools, each with its own description, its own input_schema, and one consistent result shape.

**설명**

별도의 도구로 분리하면 operation 결정이 도구 선택 단계로 옮겨지고, 그 단계에서는 서로 다른 이름과 설명이 모델을 안내한다. 각 도구의 input_schema는 정확히 하나의 operation에 대한 입력만 기술한다. 각 도구가 이제 하나의 일관된 페이로드 형태를 반환하므로, 다운스트림 시스템은 각 결과를 operation별 출력 스키마에 대해 검증할 수 있게 되어 두 가지 실패 모두를 근원에서 해결한다.

**C.** Keep the single tool and expand its description with detailed selection criteria and examples for each operation value.

**설명**

더 풍부한 설명이 혼동을 일부 줄일 수는 있지만, operation 선택은 도구 선택으로 드러나지 않고 여전히 단일 파라미터 안에 묻혀 있으며, 도구는 여전히 서로 호환되지 않는 세 가지 페이로드 형태를 반환한다. 다운스트림 검증 문제는 전혀 해결되지 않는다.

**D.** Add an auto value to the operation enum so the tool itself infers the intended operation from the document at runtime.

**설명**

자동 감지는 모호함을 해결하는 것이 아니라 한 단계 더 깊이 밀어넣을 뿐이다. 이제 도구가 콘텐츠로부터 의도를 추측해야 하고, 잘못된 추측은 진단하기가 더 어려워진다. 또한 검증을 깨뜨리는 불일치한 출력 형태에 대해서도 아무런 조치가 되지 않는다.

### 전반적인 설명

모델은 자신이 볼 수 있는 세 가지 정보, 즉 도구 이름, 설명, input_schema(도구의 입력 파라미터를 기술하는 JSON Schema)로부터 도구 호출을 선택하고 구성한다. 실제로 서로 다른 세 가지 operation이 mode 파라미터를 가진 하나의 도구 뒤에 숨어 있으면, 정작 중요한 결정(어떤 operation을 수행할지)이 이러한 신호가 작동하는 선택 표면에서 제거되어 버린다. 모델은 도구 선택은 쉽게 해내지만, 훨씬 약한 안내만으로 enum 값을 추측하게 되며, 이것이 바로 로그에 나타난 잘못된 operation 패턴이다.

extract_entities, summarize_tables, classify_document로 분리하면 숨겨져 있던 파라미터 선택이 눈에 보이는 도구 선택으로 바뀌고, 각 이름과 설명이 명확한 경계를 그릴 수 있게 된다. 추출 파이프라인에서 마찬가지로 중요한 점은, 각 도구가 이제 하나의 계약을 소유한다는 것이다. 해당 operation의 입력에 집중된 input_schema와, 도구가 반환하는 하나의 페이로드 형태다. input_schema는 입력만을 규율한다는 점에 유의해야 한다. 애플리케이션은 여전히 각 도구가 반환하는 페이로드를 검증하지만, 도구별 계약이 있으면 세 가지 호환되지 않는 결과 형태를 하나의 스키마로 커버하려 하는 대신, 각 결과를 별도의 operation별 출력 JSON Schema에 대해 검사할 수 있다. 이는 구조적 불일치를 미봉책으로 덮는 것이 아니라 근본적으로 제거하는 것이다.

관련 operation들을 공유 파라미터 뒤로 통합하는 것은 그 operation들이 하나의 계약을 공유하고 모델이 이들 사이를 신뢰성 있게 라우팅할 때는 합리적인 설계다. 이 문제의 시나리오는 두 조건 모두 성립하지 않음을 보여준다. 라우팅이 실패하고 있고 페이로드 형태가 서로 다르므로, 이는 목적별 전용 도구가 제 값어치를 하는 경우다. 단일 도구의 설명을 확장하는 것은 여전히 모호한 구조에 대한 문서화를 개선할 뿐 형태 문제는 그대로 남긴다. auto operation 값은 추측을 도구 안으로 옮겨놓을 뿐이다. tool_choice로 호출을 강제하는 것은 도구가 호출되는지 여부를 제어할 뿐, 모델이 입력에 어떤 operation 값을 쓰는지는 제어하지 않으므로, 두 실패 중 어느 것도 바꾸지 못한다. 도구 정의(이름, 설명, input_schema)가 모델의 도구 선택과 입력 구성을 어떻게 이끄는지는 tool use overview를 참고하라.

