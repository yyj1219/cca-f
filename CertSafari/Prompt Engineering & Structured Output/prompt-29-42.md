### 문제 29

**1. 문제 원문**

A utility-bill extraction pipeline has logged the following four distinct failed extractions: 1. The `meter_reading` value was extracted correctly but placed under `billing_address` instead of the `usage_details` object. 2. The `account_holder_phone` field is blank because no phone number appears anywhere on the scanned bill provided so far. 3. The `prior_year_comparison` figure is missing because it only appears in an annual letter never supplied to the pipeline. 4. The `service_address` field holds the mailing address because that is the only address printed on this particular bill. Which of these is the one most likely to be fixed by an error-feedback retry, as opposed to requiring a different source document or human escalation?

A) The `service_address` field holds the mailing address because that is the only address printed on this particular bill

B) The `prior_year_comparison` figure is missing because it only appears in an annual letter never supplied to the pipeline

C) The `account_holder_phone` field is blank because no phone number appears anywhere on the scanned bill provided so far

D) The `meter_reading` value was extracted correctly but placed under `billing_address` instead of the `usage_details` object

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**A utility-bill extraction pipeline**
공공요금 청구서 추출 파이프라인이

**has logged the following**
다음의 내용을 로그에 기록했습니다

**four distinct failed extractions:**
네 가지 서로 다른 실패한 추출 사례를:

**1. The `meter_reading` value**
1. `meter_reading` 값이

**was extracted correctly**
올바르게 추출되었지만

**but placed under `billing_address`**
`billing_address` 아래에 위치했습니다

**instead of the `usage_details` object.**
`usage_details` 객체 대신에.

**2. The `account_holder_phone` field**
2. `account_holder_phone` 필드가

**is blank**
비어 있습니다

**because no phone number appears**
전화번호가 나타나지 않기 때문에

**anywhere on the scanned bill**
스캔된 청구서 어디에도

**provided so far.**
지금까지 제공된.

**3. The `prior_year_comparison` figure**
3. `prior_year_comparison` 수치가

**is missing**
누락되었습니다

**because it only appears**
오직 나타나기 때문에

**in an annual letter**
연례 서한에만

**never supplied to the pipeline.**
파이프라인에 전혀 제공되지 않은.

**4. The `service_address` field**
4. `service_address` 필드가

**holds the mailing address**
우편 주소를 담고 있습니다

**because that is the only address**
그것이 유일한 주소이기 때문에

**printed on this particular bill.**
이 특정 청구서에 인쇄된.

**Which of these is the one**
이들 중 어느 것이 항목인가?

**most likely to be fixed**
수정될 가능성이 가장 높은

**by an error-feedback retry,**
오류 피드백 재시도(error-feedback retry)에 의해,

**as opposed to requiring**
요구하는 것과는 달리

**a different source document**
다른 원본 문서나

**or human escalation?**
사람에 의한 에스컬레이션을?

---

**OPTIONS:**

**A) The `service_address` field**
A) `service_address` 필드가

**holds the mailing address**
우편 주소를 담고 있는 것

**because that is the only address**
그것이 유일한 주소이기 때문에

**printed on this particular bill**
이 특정 청구서에 인쇄된

**B) The `prior_year_comparison` figure**
B) `prior_year_comparison` 수치가

**is missing**
누락된 것

**because it only appears**
오직 나타나기 때문에

**in an annual letter**
연례 서한에만

**never supplied to the pipeline**
파이프라인에 전혀 제공되지 않은

**C) The `account_holder_phone` field**
C) `account_holder_phone` 필드가

**is blank**
비어 있는 것

**because no phone number appears**
전화번호가 나타나지 않기 때문에

**anywhere on the scanned bill**
스캔된 청구서 어디에도

**provided so far**
지금까지 제공된

**D) The `meter_reading` value**
D) `meter_reading` 값이

**was extracted correctly**
올바르게 추출되었지만

**but placed under `billing_address`**
`billing_address` 아래에 위치한 것

**instead of the `usage_details` object**
`usage_details` 객체 대신에

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: The `meter_reading` value was extracted correctly but placed under `billing_address` instead of the `usage_details` object

**정답 및 해설:**

**핵심 개념**: LLM 기반 정보 추출 및 오류 피드백 재시도(Error-Feedback Retry)
문서에서 정보는 올바르게 인식했으나 JSON 스키마 구조나 키 위치 배치가 잘못된 구조적 오류(Formatting/Mapping Error)는 스키마 조건이나 오류 메시지를 다시 주입하는 재시도만으로 완벽히 수정 가능합니다.

**문제 상황 분석:**
- 파이프라인에서 추출 실패 원인 4가지를 분석하여 자동 재시도(Retry)로 해결 가능한 항목을 찾는 문제
- 2, 3번 항목은 데이터 원본 자체에 정보가 누락되어 다른 원본 문서가 필요함
- 1, 4번 항목은 문서 내 데이터는 존재하나 처리 방식의 차이점 파악 필요

**D번이 정답인 이유:**
- 1번 상황(`meter_reading` 계측값이 올바르게 추출되었으나 스키마 계층 구조상 잘못된 객체 아래 위치함)은 pure processing/formatting error입니다.
- 스키마 검증 오류 메시지(예: "`meter_reading`은 `usage_details` 객체 아래에 위치해야 합니다")를 LLM에 피드백으로 다시 전달하면, 새로운 문서나 사람의 개입 없이 모델 스스로 JSON 구조를 수정하여 올바른 위치에 재배치할 수 있습니다.

**오답 분석:**
- Option A (오답): 원본 청구서에 주소가 하나만 존재하여 발생한 문제로, 이것이 오류인지 정상 데이터인지 판별하기 위해 인간의 확인(Human escalation)이나 정책 기준 정의가 필요합니다.
- Option B (오답): 필요한 데이터가 연례 서한에만 존재하고 파이프라인에 입력되지 않았으므로, 다른 원본 문서(Different source document)를 제공해야만 해결됩니다.
- Option C (오답): 스캔된 문서에 전화번호 정보 자체가 없으므로, 아무리 오류 피드백 재시도를 해도 존재하지 않는 데이터를 만들어낼 수 없습니다. (다른 원본 문서 필요)

---

### 문제 30

**1. 문제 원문**

An architect wants an independent review of generated code. To reuse setup, they resume the same subagent session that just finished generating the code, then ask it to review its own diff. Does this qualify as an independent review instance?

A) No, because resuming the same session retains its full prior conversation history, the same self-review limitation independent instances avoid

B) No, because resumed sessions cannot access the codebase at all, so the reviewer would have no files to examine regardless of the retained context

C) Yes, because the Agent tool automatically strips reasoning context from a resumed session while keeping the generated files visible

D) Yes, because resuming a session always clears the model's memory of prior tool calls even though the session id stays the same

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**An architect wants**
한 아키텍트가 원합니다

**an independent review**
독립적인 검토를

**of generated code.**
생성된 코드에 대한.

**To reuse setup,**
설정을 재사용하기 위해,

**they resume**
그들은 재개합니다

**the same subagent session**
동일한 서브에이전트 세션을

**that just finished**
방금 완료한

**generating the code,**
코드를 생성하는 것을,

**then ask it**
그런 다음 요청합니다

**to review its own diff.**
자신의 변경 사항(diff)을 검토하도록.

**Does this qualify**
이것이 자격을 갖출까요?

**as an independent review instance?**
독립적인 검토 인스턴스로서?

---

**OPTIONS:**

**A) No,**
A) 아니요,

**because resuming the same session**
동일한 세션을 재개하는 것은

**retains its full**
전체를 유지하기 때문입니다

**prior conversation history,**
이전 대화 기록의,

**the same self-review limitation**
동일한 자체 검토의 한계를 (유지하면서)

**independent instances avoid**
독립된 인스턴스가 회피하는

**B) No,**
B) 아니요,

**because resumed sessions**
재개된 세션은

**cannot access the codebase**
코드베이스에 접근할 수 없기 때문입니다

**at all,**
전혀,

**so the reviewer would have**
따라서 검토자는 가지게 될 것입니다

**no files to examine**
검사할 파일을 전혀

**regardless of the retained context**
유지된 컨텍스트와 관계없이

**C) Yes,**
C) 예,

**because the Agent tool**
Agent 도구가

**automatically strips**
자동으로 제거하기 때문입니다

**reasoning context**
추론 컨텍스트를

**from a resumed session**
재개된 세션으로부터

**while keeping**
유지하는 동안

**the generated files visible**
생성된 파일을 볼 수 있도록

**D) Yes,**
D) 예,

**because resuming a session**
세션을 재개하는 것은

**always clears**
항상 지우기 때문입니다

**the model's memory**
모델의 기억을

**of prior tool calls**
이전 도구 호출에 대한

**even though the session id**
세션 ID가

**stays the same**
동일하게 유지되더라도

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: No, because resuming the same session retains its full prior conversation history, the same self-review limitation independent instances avoid

**정답 및 해설:**

**핵심 개념**: LLM 에이전트 독립성 및 대화 맥락(Session Context Isolation)
에이전트 시스템에서 완전하게 독립된 검토(Independent Review)를 수행하려면 이전 생성 과정에서의 편향(Self-confirmation bias)이나 추론 기록이 차단된 깨끗한(Fresh) 컨텍스트 상태여야 합니다. 기존 세션을 재개하는 것은 이전 대화 이력을 그대로 유지하므로 독립된 검토로 볼 수 없습니다.

**문제 상황 분석:**
- 개발자가 생성된 코드에 대해 독립적인 검토(Independent Review)를 원함
- 초기 세팅을 재사용하려는 목적으로 방금 코드를 생성한 동일한 서브에이전트 세션을 재개(Resume)함
- 생성한 에이전트 본인에게 자신의 코드 변경점(diff)을 검토하도록 요청한 상태임

**A번이 정답인 이유:**
- 동일한 세션을 재개(`resume`)하면 이전의 대화 내용, 모델의 추론 과정, 판단 기록이 그대로 보존됩니다.
- 이전 컨텍스트가 남아있으면 에이전트는 자기가 작성한 코드에 대해 확증 편향을 가지게 되며, 이는 독립된 인스턴스를 별도로 생성하여 검토할 때 얻을 수 있는 객관성(Self-review limitation 회피)을 상실하게 만듭니다. 따라서 독립적인 검토로 인정될 수 없습니다.

**오답 분석:**
- Option B (오답): 재개된 세션이 코드베이스에 전혀 접근할 수 없다는 주장은 사실이 아닙니다. 재개된 세션도 동일하게 파일 시스템 및 코드베이스 접근 권한을 가집니다.
- Option C (오답): Agent 도구는 세션을 재개할 때 추론 컨텍스트를 자동으로 삭제하지 않으며, 이전 대화 기록 전체를 유지합니다.
- Option D (오답): 세션을 재개하더라도 이전 도구 호출 기록이나 대화 메모리는 삭제되지 않고 유지됩니다.

---

### 문제 31

**1. 문제 원문**

After a batch of 20,000 document-summarization requests finishes, the results show several requests came back with an errored result type carrying an invalid_request_error because those specific documents exceeded the model's context window. What is the most efficient way to recover?

A) Identify the errored requests by their custom_id, split only those oversized documents into smaller chunks, and resubmit just those chunked requests in a new batch

B) Resubmit the entire original batch unchanged, since the Batches API automatically retries any request that previously errored before returning final results

C) Discard the errored requests permanently, since an invalid_request_error means those documents cannot be processed through the Messages API in any form

D) Reduce max_tokens on every request in a new batch covering all 20,000 documents, since output length is what caused the original context-window errors

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**After a batch**
배치가 끝난 후

**of 20,000 document-summarization requests**
20,000건의 문서 요약 요청으로 구성된

**finishes,**
완료된 후,

**the results show**
결과는 보여줍니다

**several requests came back**
여러 요청이 돌아왔다는 것을

**with an errored result type**
오류 결과 유형을 가진 채로

**carrying an invalid_request_error**
invalid_request_error를 포함하는

**because those specific documents**
해당 특정 문서들이

**exceeded the model's context window.**
모델의 컨텍스트 창을 초과했기 때문에.

**What is the most efficient way**
가장 효율적인 방법은 무엇인가요

**to recover?**
복구하기 위한?

---

**OPTIONS:**

**A) Identify the errored requests**
A) 오류가 발생한 요청을 식별하고

**by their custom_id,**
해당 custom_id를 통해,

**split only those oversized documents**
크기가 초과된 해당 문서들만 분할하여

**into smaller chunks,**
더 작은 청크로,

**and resubmit just those chunked requests**
분할된 요청들만 다시 제출하는 것

**in a new batch**
새로운 배치로

**B) Resubmit the entire original batch**
B) 전체 원래 배치를 다시 제출하는 것

**unchanged,**
변경 없이,

**since the Batches API**
Batches API가

**automatically retries**
자동으로 재시도하기 때문에

**any request**
모든 요청을

**that previously errored**
이전에 오류가 발생했던

**before returning final results**
최종 결과를 반환하기 전에

**C) Discard the errored requests**
C) 오류가 발생한 요청을 폐기하는 것

**permanently,**
영구적으로,

**since an invalid_request_error means**
invalid_request_error는 의미하기 때문에

**those documents cannot be processed**
해당 문서들이 처리될 수 없음을

**through the Messages API**
Messages API를 통해

**in any form**
어떠한 형태로도

**D) Reduce max_tokens**
D) max_tokens를 줄이는 것

**on every request**
모든 요청에서

**in a new batch**
새로운 배치 내의

**covering all 20,000 documents,**
전체 20,000개 문서를 포함하는,

**since output length**
출력 길이가

**is what caused**
원인이기 때문에

**the original context-window errors**
원래의 컨텍스트 창 오류를 일으킨

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Identify the errored requests by their custom_id, split only those oversized documents into smaller chunks, and resubmit just those chunked requests in a new batch

**정답 및 해설:**

**핵심 개념**: Batches API 오류 처리 및 효율적인 재처리(Batch Error Recovery)
배치 처리 중 일부 요청에서 컨텍스트 크기 초과(`invalid_request_error`)가 발생한 경우, 이미 성공한 전체 배치(20,000건)를 다시 실행하는 것은 비용과 시간 측면에서 불필요합니다. 각 요청의 식별자인 `custom_id`를 통해 실패한 항목만 선별한 뒤, 문제 원인(문서 크기 초과)을 해결(청크 분할)하여 실패 항목에 대해서만 새 배치를 구성하는 것이 가장 효율적입니다.

**문제 상황 분석:**
- 20,000건의 대량 문서 요약 배치 작업 처리 완료
- 일부 문서의 길이가 모델의 컨텍스트 창(Context Window)을 초과하여 `invalid_request_error` 발생
- 이미 성공한 수만 건의 결과를 유지하면서 실패한 소수의 요청만 효율적으로 복구 및 재처리해야 함

**A번이 정답인 이유:**
- 배치 결과 파일에서 각 요청은 `custom_id`로 구별되므로, 오류가 발생한 항목만 정밀하게 추려낼 수 있습니다.
- 컨텍스트 창 초과 오류는 입력 문서가 너무 크다는 의미이므로, 해당 문서만 작게 분할(Chunking)하여 오류 원인을 해결한 뒤, 실패한 항목들에 대해서만 신규 배치를 생성하여 재요청하는 것이 가장 자원 효율적이고 정석적인 처리 방법입니다.

**오답 분석:**
- Option B (오답): `invalid_request_error`는 클라이언트의 입력 문제(컨텍스트 초과)로 발생한 4xx 계열 오류이므로 동일한 내용으로 재시도해도 똑같이 실패합니다. 또한, 전체 20,000건을 다시 실행하는 것은 비효율적입니다.
- Option C (오답): 문서를 분할하여 전처리하면 충분히 처리할 수 있으므로, 영구적으로 폐기할 필요가 없습니다.
- Option D (오답): `max_tokens`는 모델이 생성할 출력(completion)의 최대 길이 제한이며, 컨텍스트 창 초과의 주원인은 입력 문서(prompt)의 길이 때문입니다. 또한 이미 성공한 20,000건 전체를 다시 배치로 돌리는 것 역시 매우 비효율적입니다.

---

### 문제 32

**1. 문제 원문**

An architect is structuring a long review prompt that defines separate criteria for security, correctness, and style categories, each with its own inclusion rules and severity examples. Which structuring approach best helps Claude apply the right criteria to the right category without cross-contamination?

A) Write all criteria as one continuous paragraph of plain prose, trusting that clear sentence structure alone will keep the categories distinct in the model's interpretation.

B) Repeat the full text of every category's criteria at the start of each category's section, so each section is self-contained even if it duplicates content.

C) Wrap each category's criteria and examples in its own uniquely named XML tag, such as `<security_criteria>` and `<correctness_criteria>`, so the boundaries between categories are unambiguous.

D) List every category's criteria in a single unordered bullet list without headers, relying on bullet order to imply which criteria belong to which category.

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**An architect is structuring**
한 아키텍트가 구조화하고 있습니다

**a long review prompt**
긴 검토 프롬프트를

**that defines separate criteria**
별도의 기준을 정의하는

**for security, correctness,**
보안, 정확성,

**and style categories,**
그리고 스타일 범주에 대한,

**each with its own**
각각 고유의

**inclusion rules**
포함 규칙과

**and severity examples.**
심각도 예시를 가진.

**Which structuring approach**
어떤 구조화 방식이

**best helps Claude**
Claude를 가장 잘 도울까요

**apply the right criteria**
올바른 기준을 적용하도록

**to the right category**
올바른 범주에

**without cross-contamination?**
교차 오염(혼선) 없이?

---

**OPTIONS:**

**A) Write all criteria**
A) 모든 기준을 작성하는 것

**as one continuous paragraph**
하나의 연속된 단락으로

**of plain prose,**
일반 문장으로,

**trusting that clear sentence structure alone**
명확한 문장 구조만으로도 충분하다고 믿으며

**will keep the categories distinct**
범주들을 명확하게 구분해줄 것이라고

**in the model's interpretation.**
모델의 해석에서.

**B) Repeat the full text**
B) 전체 텍스트를 반복하는 것

**of every category's criteria**
모든 범주의 기준에 대한

**at the start of each category's section,**
각 범주 섹션의 시작 부분에,

**so each section is self-contained**
각 섹션이 독립적이 되도록

**even if it duplicates content.**
내용이 중복되더라도.

**C) Wrap each category's criteria**
C) 각 범주의 기준을 감싸는 것

**and examples**
및 예시들을

**in its own uniquely named XML tag,**
고유하게 이름 붙여진 XML 태그 안에,

**such as `<security_criteria>`**
`<security_criteria>`나

**and `<correctness_criteria>`,**
`<correctness_criteria>`와 같은,

**so the boundaries between categories**
범주 간의 경계가

**are unambiguous.**
명확해지도록.

**D) List every category's criteria**
D) 모든 범주의 기준을 나열하는 것

**in a single unordered bullet list**
하나의 순서 없는 글머리 기호 목록으로

**without headers,**
헤더 없이,

**relying on bullet order**
글머리 기호 순서에 의존하여

**to imply which criteria**
어떤 기준이 속하는지 암시하도록

**belong to which category.**
어느 범주에.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Wrap each category's criteria and examples in its own uniquely named XML tag, such as `<security_criteria>` and `<correctness_criteria>`, so the boundaries between categories are unambiguous.

**정답 및 해설:**

**핵심 개념**: XML 태그를 활용한 프롬프트 구조화 (Structuring Prompts with XML Tags)
Claude(Anthropic) 모델은 복잡하고 길거나 여러 항목이 섞여 있는 프롬프트에서 각 요소의 역할과 경계를 명확히 구별하기 위해 XML 태그(`<tag>...</tag>`) 구조를 적극 권장합니다. XML 태그를 사용하면 모델이 문맥을 혼동(교차 오염)하지 않고 각 정보 영역을 정확히 분리하여 인식할 수 있습니다.

**문제 상황 분석:**
- 프롬프트에 보안, 정확성, 스타일 등 여러 범주의 규칙과 예시가 길게 포함되어 있음
- 범주 간의 규칙이 섞이거나 잘못 적용되는 교차 오염(Cross-contamination) 방지 필요
- Claude가 각 범주별 기준을 오차 없이 명확히 구분하여 적용할 수 있는 최선의 구조화 구조 탐색

**C번이 정답인 이유:**
- `<security_criteria>`, `<correctness_criteria>`와 같이 의미 있는 고유 XML 태그로 각 범주를 감싸면 명확한 경계(Unambiguous boundaries)가 생성됩니다.
- 이를 통해 Claude는 한 범주의 서술이나 예시가 다른 범주의 규칙에 영향을 주는 교차 오염 현상을 완벽히 차단하고 정확하게 해당 영역의 지침만 파싱하여 적용할 수 있습니다.

**오답 분석:**
- Option A (오답): 모든 내용을 단일 단락 줄글로 적으면 긴 컨텍스트 내에서 범주 간 경계가 모호해져 내용이 혼동되기 쉽습니다.
- Option B (오답): 모든 기준의 전체 텍스트를 중복해서 반복 작성하는 것은 프롬프트 토큰을 낭비할 뿐만 아니라 컨텍스트를 불필요하게 복잡하게 만들어 혼란을 유발합니다.
- Option D (오답): 헤더 없이 하나의 글머리 기호 목록에 순서대로만 나열하는 방식은 항목 간 범주 구분을 모델의 추측에 맡기게 되어 교차 오염 위험이 매우 높습니다.

---

### 문제 33

**1. 문제 원문**

A medical-intake extractor nests the patient's "date_of_birth" field under the wrong parent object in its structured output, causing schema validation to fail. The team wants the next attempt to self-correct the nesting. What should the follow-up request include?

A) The validation error code by itself, assuming the model retains full memory of the document across separate turns.

B) Only the prior failed JSON and a note instructing the model to move `date_of_birth` from `guardian` to `patient`.

C) The original intake document, the prior failed JSON, and a note that `date_of_birth` belongs under `patient` rather than `guardian`.

D) A brand-new prompt that redescribes the schema from scratch, sent without the intake document originally supplied.

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**A medical-intake extractor**
의료 접수 정보 추출기가

**nests the patient's "date_of_birth" field**
환자의 "date_of_birth" 필드를 중첩시킵니다

**under the wrong parent object**
잘못된 상위 객체 아래에

**in its structured output,**
구조화된 출력 결과에서,

**causing schema validation**
스키마 검증이

**to fail.**
실패하도록 만들면서.

**The team wants**
팀은 원합니다

**the next attempt**
다음 시도가

**to self-correct the nesting.**
중첩 구조를 자가 수정하기를.

**What should the follow-up request include?**
후속 요청에는 무엇이 포함되어야 할까요?

---

**OPTIONS:**

**A) The validation error code by itself,**
A) 검증 오류 코드 단독만을,

**assuming the model retains**
모델이 유지하고 있다고 가정하면서

**full memory of the document**
문서에 대한 완전한 기억을

**across separate turns.**
서로 다른 턴에 걸쳐.

**B) Only the prior failed JSON**
B) 이전 실패한 JSON과

**and a note instructing the model**
모델에게 지시하는 참고 사항만을

**to move `date_of_birth`**
`date_of_birth`를 이동시키도록

**from `guardian` to `patient`.**
`guardian`에서 `patient`로.

**C) The original intake document,**
C) 원본 접수 문서,

**the prior failed JSON,**
이전 실패한 JSON,

**and a note that `date_of_birth` belongs**
그리고 `date_of_birth`가 속해 있다는 참고 사항

**under `patient` rather than `guardian`.**
`guardian`이 아닌 `patient` 아래에.

**D) A brand-new prompt**
D) 완전히 새로운 프롬프트

**that redescribes the schema from scratch,**
처음부터 스키마를 다시 설명하는,

**sent without the intake document**
접수 문서 없이 전송되는

**originally supplied.**
원래 제공되었던.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: The original intake document, the prior failed JSON, and a note that `date_of_birth` belongs under `patient` rather than `guardian`.

**정답 및 해설:**

**핵심 개념**: LLM 자기 수정(Self-Correction) 및 완전한 맥락 제공(Complete Context Provision)
LLM 기반 추출 시스템에서 오류 발생 시 자기 수정을 유도할 때, 모델이 올바른 출력 구조와 정보의 정확성을 동시에 유지하려면 원본 문서, 이전 실패 출력, 그리고 구체적인 수정 지침(피드백)을 완벽한 맥락으로 함께 제공해야 합니다.

**문제 상황 분석:**
- 의료 접수 문서 추출기가 `date_of_birth` 필드를 잘못된 상위 객체 아래 배치하여 스키마 검증에 실패함
- 모델이 스스로 중첩 구조(Nesting) 오류를 수정하도록 후속 요청(Follow-up request)을 구성하려는 상황
- 자가 수정 재시도 시 어떠한 요소들이 요청에 포함되어야 하는지 최선의 구성을 묻고 있음

**C번이 정답인 이유:**
- 모델이 원본 정보의 내용(생년월일값 등)을 유실하지 않으면서 피드백을 반영하려면 **1) 원본 접수 문서**, **2) 수정할 대상이 되는 이전 실패 JSON**, **3) 구체적으로 무엇을 어떻게 수정해야 하는지에 대한 가이드 노트** 3가지가 모두 포함되어야 합니다.
- 원본 문서를 함께 제공하지 않으면 모델이 JSON 구조를 수정하는 과정에서 원래 입력 데이터 값을 잃어버리거나 환각(Hallucination)이 발생할 수 있습니다.

**오답 분석:**
- Option A (오답): stateless한 API 환경이나 독립적인 턴에서는 모델이 이전 문서의 모든 컨텍스트를 완벽하게 유지한다고 보장할 수 없으며, 단독 오류 코드만으로는 어떻게 구조를 바꿔야 하는지 명확한 가이드를 제공하지 못합니다.
- Option B (오답): 원본 문서 없이 실패한 JSON만 제공하면, 구조 수정 과정에서 모델이 원본 데이터의 컨텍스트를 상실하여 잘못된 값으로 변경하거나 검증에 필요한 다른 필드를 유실할 위험이 있습니다.
- Option D (오답): 원래 제공되었던 접수 문서 없이 처음부터 스키마만 재설명하는 프롬프트를 보내면 추출 대상 데이터 자체가 사라지므로 추출 작업 자체를 수행할 수 없습니다.

---

### 문제 34

**1. 문제 원문**

A team's automated PR-review prompt currently instructs Claude to "check that comments are accurate." The category produces a high volume of false positives on trivial phrasing nitpicks, and developers have started ignoring its output. An architect is rewriting the instruction to raise precision. Which replacement instruction best applies the principle of explicit criteria over vague instructions?

A) Ask Claude to only flag a comment when it is highly confident the comment makes a factual error about the code, such as claiming a method does not exist when it is clearly present in the codebase, and to ignore borderline cases.

B) Tell Claude to flag any comment that could plausibly be improved in clarity, completeness, or consistency with the team's style guide, such as an ambiguous phrase that might confuse a reader, and to suggest a clearer version.

C) Instruct Claude to evaluate each comment and flag only those that it deems significant enough to warrant developer attention, such as a comment that could cause a bug if misunderstood, and to ignore trivial wording differences.

D) Flag a comment only when it makes a specific claim about behavior that is contradicted by what the code actually does, such as a docstring stating a function returns None when it always returns a value.

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**A team's automated PR-review prompt**
한 팀의 자동화된 PR 검토 프롬프트는

**currently instructs Claude**
현재 Claude에게 지시합니다

**to "check that comments are accurate."**
"주석이 정확한지 확인하라"고.

**The category produces**
이 범주는 발생시킵니다

**a high volume of false positives**
대량의 거짓 양성(잘못된 지적)을

**on trivial phrasing nitpicks,**
사소한 문구 꼬투리 잡기에 대해,

**and developers have started**
그리고 개발자들은 시작했습니다

**ignoring its output.**
그 출력을 무시하기를.

**An architect is rewriting the instruction**
한 아키텍트가 지시 사항을 다시 작성하고 있습니다

**to raise precision.**
정밀도(정확도)를 높이기 위해.

**Which replacement instruction**
어떤 교체 지시 사항이

**best applies the principle**
원칙을 가장 잘 적용하는가

**of explicit criteria over vague instructions?**
모호한 지시 대신 명시적 기준을 제공한다는?

---

**OPTIONS:**

**A) Ask Claude to only flag a comment**
A) Claude에게 주석 표시(flag)만 하도록 요청하는 것

**when it is highly confident**
높은 확신이 있을 때만

**the comment makes a factual error**
주석이 사실적 오류를 범하고 있다는

**about the code,**
코드에 대해,

**such as claiming a method does not exist**
메서드가 존재하지 않는다고 주장하는 것과 같이

**when it is clearly present in the codebase,**
코드베이스에 분명히 존재할 때,

**and to ignore borderline cases.**
그리고 모호한 사례는 무시하도록.

**B) Tell Claude to flag any comment**
B) Claude에게 어떤 주석이든 표시하도록 말하는 것

**that could plausibly be improved**
그럴듯하게 개선될 수 있는

**in clarity, completeness,**
명확성, 완전성,

**or consistency with the team's style guide,**
또는 팀의 스타일 가이드와의 일관성 면에서,

**such as an ambiguous phrase**
모호한 문구와 같은

**that might confuse a reader,**
독자를 혼란스럽게 할 수 있는,

**and to suggest a clearer version.**
그리고 더 명확한 버전을 제안하도록.

**C) Instruct Claude to evaluate each comment**
C) Claude에게 각 주석을 평가하도록 지시하는 것

**and flag only those**
그리고 해당하는 것만 표시하도록

**that it deems significant enough**
충분히 중요하다고 판단하는

**to warrant developer attention,**
개발자의 주의를 끌 만큼,

**such as a comment that could cause a bug**
버그를 유발할 수 있는 주석과 같은

**if misunderstood,**
오해될 경우,

**and to ignore trivial wording differences.**
그리고 사소한 표현 차이는 무시하도록.

**D) Flag a comment only when**
D) ~할 때만 주석을 표시하는 것

**it makes a specific claim about behavior**
동작에 대한 구체적인 주장을 펼칠 때만

**that is contradicted**
모순되는 (주장)

**by what the code actually does,**
코드가 실제로 수행하는 작업과,

**such as a docstring stating**
독스트링(docstring)이 명시하는 것과 같이

**a function returns None**
함수가 None을 반환한다고

**when it always returns a value.**
항상 값을 반환함에도 불구하고.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Flag a comment only when it makes a specific claim about behavior that is contradicted by what the code actually does, such as a docstring stating a function returns None when it always returns a value.

**정답 및 해설:**

**핵심 개념**: 명시적 기준 기반 프롬프트 엔지니어링 (Explicit Criteria vs. Vague Instructions)
프롬프트에서 거짓 양성(False Positive)을 줄이고 정밀도(Precision)를 높이기 위해서는 "주관적 판단(높은 확신, 중요한 것 등)"을 유도하는 모호한 표현을 피하고, 모델이 코드가 실제 수행하는 행동과 주석문 사이의 객관적이고 모순되는 사실 관계(Factual Contradiction)만을 검증할 수 있도록 명확하고 검증 가능한 조건(Explicit Criteria)을 제시해야 합니다.

**문제 상황 분석:**
- "주석이 정확한지 확인하라"는 기존 지시가 너무 모호하여 사소한 문구 표현 방식에 대해 불필요한 지적(거짓 양성)을 남발함
- 개발자들이 피드백을 무시하기 시작하여, 검토의 정밀도를 높이기 위한 지시 재작성이 필요함
- 모호한 지시어를 제거하고 명확하고 구체적인 조건을 제공하는 가장 적절한 구문을 찾아야 함

**D번이 정답인 이유:**
- D번은 주석을 지적해야 하는 조건을 **"코드가 실제 수행하는 동작과 주석의 구체적인 주장이 직접적으로 모순될 때"**로 명확히 한정(Explicit Criteria)합니다.
- 특히 `docstring`에 함수가 `None`을 반환한다고 적혀 있으나 실제로 항상 값을 반환하는 경우처럼 **객관적이고 명확하게 판별 가능한 예시**를 제공함으로써, 모델이 주관적으로 문구를 꼬투리 잡지 않고 정밀하게 오작동/오류 주석만 찾아내도록 유도합니다.

**오답 분석:**
- Option A (오답): "highly confident(높은 확신이 있을 때)" 및 "borderline cases(모호한 사례)"라는 단어 자체가 모델 기준에서 매우 주관적이고 모호한 지시어(Vague Instructions)입니다.
- Option B (오답): 명확성, 완전성, 스타일 가이드 개선 가능성 등 주관적인 요소까지 모두 지적하도록 하여 오탐률(False Positive)을 오히려 극대화하는 방식입니다.
- Option C (오답): "deems significant enough(충분히 중요하다고 판단하는)" 및 "trivial wording differences(사소한 표현 차이)" 역시 모델이 무엇이 중요하고 사소한지 스스로 판단해야 하는 모호한 기준입니다.

---

### 문제 35

**1. 문제 원문**

A support team is building a live chat assistant that must answer customers while they are actively typing in a conversation. An engineer proposes routing every chat turn through the Message Batches API to cut token costs. What is the most accurate assessment of this proposal?

A) It is suitable, because customers already expect a short delay in chat interfaces, which matches the pacing the Batches API provides

B) It is unsuitable, because live chat needs an immediate response and the Batches API offers no guaranteed turnaround, so answers could arrive far too late

C) It is suitable, because the Batches API returns results the moment a request finishes rather than waiting for a fixed processing window to elapse

D) It is unsuitable, because the Batches API charges a per-token premium above standard synchronous pricing that live chat's request volume cannot justify

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**A support team is building**  
한 지원 팀이 구축하고 있습니다  

**a live chat assistant**  
라이브 채팅 어시스턴트를  

**that must answer customers**  
고객에게 응답해야 하는  

**while they are actively typing**  
그들이 활발히 입력하는 동안  

**in a conversation.**  
대화 속에서.  

**An engineer proposes**  
한 엔지니어가 제안합니다  

**routing every chat turn**  
모든 채팅 턴을 라우팅하는 것을  

**through the Message Batches API**  
Message Batches API를 통해  

**to cut token costs.**  
토큰 비용을 절감하기 위해.  

**What is the most accurate assessment**  
가장 정확한 평가 방식은 무엇인가요  

**of this proposal?**  
이 제안에 대한?  

---

**OPTIONS:**

**A) It is suitable,**  
A) 적합합니다,  

**because customers already expect**  
고객들이 이미 예상하기 때문에  

**a short delay in chat interfaces,**  
채팅 인터페이스에서의 짧은 지연을,  

**which matches the pacing**  
이는 속도감과 부합합니다  

**the Batches API provides**  
Batches API가 제공하는  

**B) It is unsuitable,**  
B) 부적합합니다,  

**because live chat needs**  
라이브 채팅은 필요로 하기 때문에  

**an immediate response**  
즉각적인 응답을  

**and the Batches API offers**  
그리고 Batches API는 제공하므로  

**no guaranteed turnaround,**
보장된 처리 시간을 제공하지 않으므로,  

**so answers could arrive**  
따라서 답변이 도착할 수 있습니다  

**far too late**  
너무 늦게  

**C) It is suitable,**  
C) 적합합니다,  

**because the Batches API returns results**  
Batches API가 결과를 반환하기 때문에  

**the moment a request finishes**  
요청이 완료되는 즉시  

**rather than waiting**  
기다리는 대신  

**for a fixed processing window to elapse**  
고정된 처리 시간이 지나기를  

**D) It is unsuitable,**  
D) 부적합합니다,  

**because the Batches API charges**  
Batches API가 부과하기 때문에  

**a per-token premium**  
토큰당 프리미엄(추가 비용)을  

**above standard synchronous pricing**  
표준 동기식 가격 책정보다 높게  

**that live chat's request volume**  
라이브 채팅의 요청량이  

**cannot justify**  
정당화할 수 없는  

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: It is unsuitable, because live chat needs an immediate response and the Batches API offers no guaranteed turnaround, so answers could arrive far too late

**정답 및 해설:**

**핵심 개념**: Message Batches API의 특성 및 유스케이스 (Batch Processing vs. Real-Time Interaction)  
Message Batches API는 비동기적으로 대량의 요청을 처리할 때 50%의 가격 할인을 제공하지만, 결과 처리 완료까지 수 분에서 최대 24시간이 소요될 수 있어 실시간성이 필요한 대화형 애플리케이션에는 적합하지 않습니다.

**문제 상황 분석:**
- 개발 팀이 고객과 실시간 대화를 주고받는 라이브 채팅 어시스턴트를 개발 중임
- 비용 절감을 목적으로 실시간 대화 턴(turn)을 Message Batches API로 처리하려는 제안이 제출됨
- 실시간 라이브 채팅의 요구사항(실시간성)과 Batches API의 특성(비동기 지연 처리) 간의 적합성을 평가해야 함

**B번이 정답인 이유:**
- 라이브 채팅 어시스턴트는 고객의 질문에 즉각적인 응답(Low Latency/Real-time response)을 제공해야 합니다.
- Batches API는 대량 데이터 처리를 위한 비동기 서비스로, 요청 처리에 대한 즉각적인 반환 시간(Guaranteed turnaround time)을 보장하지 않으므로, 답변이 수 분에서 수 시간 뒤에 도착하여 실시간 대화가 불가능해집니다.

**오답 분석:**
- Option A (오답): Batches API의 처리 지연은 실시간 라이브 채팅 인터페이스에서 고객이 수용할 수 있는 수 초 이내의 짧은 지연 수준을 훨씬 초과합니다.
- Option C (오답): 요청이 끝나는 대로 결과를 얻을 수 있다 하더라도 비동기 배치 특성상 비동기 큐에서 대기하는 시간이 존재하므로 실시간 대화에 적합하다는 결론은 오답입니다.
- Option D (오답): Batches API는 표준 동기식 호출에 비해 프리미엄이 붙는 것이 아니라 오히려 50% 할인된 가격을 제공합니다. 따라서 부적합한 이유는 가격이 아니라 '지연 시간(Latency)' 때문입니다.

---

### 문제 36

**1. 문제 원문**

An engineer submits a batch of 5,000 requests in a fixed order and, when results come back, zips the results array with the original input list by position, assuming the first result corresponds to the first request submitted. QA later finds several summaries attached to the wrong source document. What is the root cause and correct fix?

A) The results file was read before the batch fully finished processing, so the fix is polling the status endpoint longer before reading any result content

B) The batch contained more than 1,000 requests, which is the point at which the API begins reordering results, so the fix is capping every batch at 1,000 requests

C) Batch results are not guaranteed to return in submission order, so the engineer must match each result to its request using the shared custom_id rather than list position

D) The original request list must have contained a duplicate document, so the fix is deduplicating inputs before submission rather than changing how results are matched

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**An engineer submits**
한 엔지니어가 제출합니다

**a batch of 5,000 requests**
5,000개 요청의 배치를

**in a fixed order**
고정된 순서로

**and, when results come back,**
그리고, 결과가 돌아올 때,

**zips the results array**
결과 배열을 묶습니다(zip)

**with the original input list**
원래의 입력 목록과

**by position,**
위치(순서)별로,

**assuming the first result**
첫 번째 결과가

**corresponds to**
부합한다고 가정하면서

**the first request submitted.**
제출된 첫 번째 요청에.

**QA later finds**
QA가 나중에 발견합니다

**several summaries attached**
몇몇 요약본이 첨부된 것을

**to the wrong source document.**
잘못된 원본 문서에.

**What is the root cause**
근본 원인은 무엇이며

**and correct fix?**
올바른 해결책은 무엇인가요?

---

**OPTIONS:**

**A) The results file was read**
A) 결과 파일을 읽었습니다

**before the batch fully finished processing,**
배치 처리가 완전히 끝나기 전에,

**so the fix is polling**
따라서 해결책은 폴링하는 것입니다

**the status endpoint longer**
상태 엔드포인트를 더 길게

**before reading any result content**
어떠한 결과 내용도 읽기 전에

**B) The batch contained**
B) 배치가 포함했습니다

**more than 1,000 requests,**
1,000개 이상의 요청을,

**which is the point**
그리고 그것은 시점입니다

**at which the API begins**
API가 시작하는

**reordering results,**
결과의 순서를 변경하기,

**so the fix is capping**
따라서 해결책은 제한하는 것입니다

**every batch at 1,000 requests**
모든 배치를 1,000개 요청으로

**C) Batch results are not guaranteed**
C) 배치 결과는 보장되지 않습니다

**to return in submission order,**
제출 순서대로 반환되는 것이,

**so the engineer must match**
따라서 엔지니어는 매칭해야 합니다

**each result to its request**
각 결과와 해당 요청을

**using the shared `custom_id`**
공유된 `custom_id`를 사용하여

**rather than list position**
목록의 위치(순서) 대신에

**D) The original request list**
D) 원래의 요청 목록이

**must have contained**
포함했음에 틀림없습니다

**a duplicate document,**
중복된 문서를,

**so the fix is deduplicating inputs**
따라서 해결책은 입력을 중복 제거하는 것입니다

**before submission**
제출 전에

**rather than changing**
변경하는 대신에

**how results are matched**
결과가 매칭되는 방식을

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Batch results are not guaranteed to return in submission order, so the engineer must match each result to its request using the shared custom_id rather than list position

**정답 및 해설:**

**핵심 개념**: Batches API 비동기 처리 및 `custom_id` 식별자 매칭
Batches API는 대량의 요청을 병렬 및 비동기적으로 처리하므로, 결과 파일 내의 반환 순서가 요청을 보낸 원래 순서와 일치한다는 보장이 없습니다. 따라서 인덱스(순서) 기반의 zip 방식은 매칭 오류를 발생시키며, 요청 시 지정한 고유 식별자인 `custom_id`를 기준으로 결과를 매칭해야 합니다.

**문제 상황 분석:**
- 엔지니어가 5,000건의 비동기 배치 요청을 보내고 반환된 결과를 배열 순서(인덱스)대로 입력 문서와 1:1로 묶음(zip)
- 검수(QA) 과정에서 요약문이 서로 다른 원본 문서에 잘못 매핑되는 현상 발생
- 비동기 대량 처리 환경에서 결과 데이터의 매칭 오류 원인과 올바른 매칭 방식을 파악해야 함

**C번이 정답인 이유:**
- Batches API는 내부적으로 최적의 입출력 성능을 내기 위해 병렬로 작업을 처리하므로 completion이 완료된 순서대로 결과 파일에 기록되거나 무작위 순서로 반환될 수 있습니다.
- 배열의 위치(`position`)에 의존하면 문서와 결과가 엇갈리는 정렬 오류(Mismatch)가 반드시 발생하므로, 요청 작성 시 각 항목에 부여한 고유 키인 `custom_id`를 통해 결과와 원본 데이터를 식별·매칭해야 합니다.

**오답 분석:**
- Option A (오답): 배치가 완료되지 않은 상태라면 결과 파일 생성이 아직 완료되지 않았거나 처리 불완전 에러가 발생하며, 문서와 요약문이 엇갈려 묶이는 식의 매칭 오류와는 무관합니다.
- Option B (오답): 1,000개 요청이라는 임계값에 의해 API가 순서를 변경하기 시작한다는 기준은 존재하지 않으며, 요청 건수와 관계없이 배치 결과의 순서는 보장되지 않습니다.
- Option D (오답): 원본 문서의 중복 여부가 문제의 본질이 아니며, 입력 중복을 제거하더라도 비동기 처리 특성상 순서 불일치 문제가 해결되지 않습니다.

---

### 문제 37

**1. 문제 원문**

An architect invokes a review subagent immediately after code generation, but the subagent's summary reveals it doesn't know which files changed or why. What is the most likely cause?

A) The subagent was defined with a model override, which prevents it from receiving any information at all from the parent regardless of the prompt

B) The subagent's tools field was left unset, which by default silently blocks it from being told which files to review at all

C) The parent only sends the Agent tool's prompt string to the subagent, so file paths and context must be written explicitly into that prompt

D) The review subagent must first be resumed with a prior session id before it can access any information about the current changeset

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**An architect invokes**
한 아키텍트가 호출합니다

**a review subagent**
검토 서브에이전트를

**immediately after code generation,**
코드 생성 직후에,

**but the subagent's summary reveals**
그러나 서브에이전트의 요약은 밝혀냅니다

**it doesn't know**
그것이 알지 못한다는 것을

**which files changed or why.**
어떤 파일이 변경되었는지 또는 왜 변경되었는지.

**What is the most likely cause?**
가장 가능성이 높은 원인은 무엇인가요?

---

**OPTIONS:**

**A) The subagent was defined**
A) 서브에이전트가 정의되었습니다

**with a model override,**
모델 오버라이드(override)와 함께,

**which prevents it from receiving**
그리고 이것은 그것이 받는 것을 막습니다

**any information at all**
어떠한 정보도 전혀

**from the parent**
상위(parent)에이전트로부터

**regardless of the prompt**
프롬프트와 관계없이

**B) The subagent's tools field**
B) 서브에이전트의 tools 필드가

**was left unset,**
설정되지 않은 채로 남겨졌습니다,

**which by default silently blocks it**
그리고 이것은 기본적으로 암묵적으로 차단합니다

**from being told**
전달받는 것을

**which files to review at all**
검토할 파일이 무엇인지 전혀

**C) The parent only sends**
C) 상위 에이전트는 전달할 뿐입니다

**the Agent tool's prompt string**
Agent 도구의 프롬프트 문자열만

**to the subagent,**
서브에이전트에게,

**so file paths and context**
따라서 파일 경로와 컨텍스트가

**must be written explicitly**
명시적으로 작성되어야 합니다

**into that prompt**
해당 프롬프트 내에

**D) The review subagent must first be resumed**
D) 검토 서브에이전트가 먼저 재개되어야 합니다

**with a prior session id**
이전 세션 ID를 사용하여

**before it can access**
접근할 수 있기 전에

**any information about the current changeset**
현재 변경 사항 세트에 대한 어떠한 정보에든

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: The parent only sends the Agent tool's prompt string to the subagent, so file paths and context must be written explicitly into that prompt

**정답 및 해설:**

**핵심 개념**: 서브에이전트 입출력 전달 및 격리성 (Subagent Context Isolation)
새로운 서브에이전트를 호출(Invoke)할 때 상위(Parent) 에이전트의 대화 내역이나 컨텍스트가 자동으로 공유되지 않습니다. 상위 에이전트가 서브에이전트에게 정보를 제공하려면 호출 시 전달하는 `prompt` 문자열 내에 변경된 파일 경로, 변경 이유, 요구사항 등 필요한 제반 컨텍스트를 명시적으로 작성해 전달해야 합니다.

**문제 상황 분석:**
- 코드를 생성한 직후, 검토를 위해 서브에이전트를 호출함
- 서브에이전트의 출력 결과를 보니 어떤 파일이 왜 변경되었는지 인지하지 못하고 있음
- 상위 에이전트와 서브에이전트 간 컨텍스트 전달 방식의 특성을 오해하여 발생한 원인을 찾아야 함

**C번이 정답인 이유:**
- 서브에이전트는 완전히 격리된 별도의 컨텍스트 상태로 새로 실행됩니다.
- 상위 에이전트가 Agent 도구를 통해 서브에이전트를 호출할 때 자동으로 상위 에이전트의 전체 작업 이력이나 파일 변경 로그가 전송되지 않으며, 오직 `prompt` 매개변수에 전달된 텍스트만 수신합니다.
- 따라서 어떤 파일이 변경되었고 무엇을 검토해야 하는지 상위 에이전트가 `prompt` 인자 문자열 속에 명시적으로 적어서 넘겨주어야만 서브에이전트가 이를 인식할 수 있습니다.

**오답 분석:**
- Option A (오답): `model` 오버라이드는 실행할 LLM 모델 종류(예: Claude Haiku, Sonnet 등)를 변경하는 설정일 뿐, 상위 에이전트와의 프롬프트 전달을 막지 않습니다.
- Option B (오답): `tools` 필드가 비어 있으면 도구 사용 권한이 제한될 수는 있지만, 프롬프트를 통해 검토 대상 파일 정보를 텍스트로 전달받는 것 자체를 차단하지는 않습니다.
- Option D (오답): 독립적이고 깨끗한 검토를 수행하려면 이전 세션을 재개(`resume`)하는 것이 아니라, 새 세션 호출 시 프롬프트에 변경 사항(changeset) 정보를 명시적으로 전달하는 것이 올바른 방법입니다.

---

### 문제 38

**1. 문제 원문**

A contract-review tool extracts a `governing_law` field indicating which jurisdiction's law applies to a contract. In practice, some contracts state this explicitly, some imply it ambiguously across two jurisdictions, and some never mention it at all. The current enum only lists specific jurisdiction names, forcing the model to guess in ambiguous cases. How should the schema be revised?

A) Change `governing_law` to a boolean field indicating only whether any jurisdiction is mentioned in the contract text

B) Duplicate every jurisdiction name in the enum with an "ambiguous_" prefix so each jurisdiction has an ambiguous counterpart value

C) Add an "unclear" enum value to distinguish genuinely ambiguous or unstated cases from confidently identified jurisdictions

D) Set `tool_choice` to `{"type": "any"}` so the model is forced to pick a jurisdiction value from the enum on every single contract

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**A contract-review tool extracts**
계약서 검토 도구가 추출합니다

**a `governing_law` field**
`governing_law` 필드를

**indicating which jurisdiction's law**
어느 사법권의 법률이

**applies to a contract.**
계약에 적용되는지를 나타내는.

**In practice,**
실제로는,

**some contracts state this explicitly,**
일부 계약서는 이를 명시적으로 기술하고,

**some imply it ambiguously**
일부는 이를 모호하게 암시하며

**across two jurisdictions,**
두 사법권에 걸쳐,

**and some never mention it**
그리고 일부는 전혀 언급하지 않습니다

**at all.**
전혀.

**The current enum**
현재의 enum(열거형)은

**only lists specific jurisdiction names,**
구체적인 사법권 이름만 나열하므로,

**forcing the model to guess**
모델이 추측하도록 강제합니다

**in ambiguous cases.**
모호한 사례에서.

**How should the schema**
스키마가 어떻게

**be revised?**
수정되어야 할까요?

---

**OPTIONS:**

**A) Change `governing_law`**
A) `governing_law`를 변경하는 것

**to a boolean field**
불리언(boolean) 필드로

**indicating only whether**
여부만을 나타내는

**any jurisdiction is mentioned**
어떠한 사법권이라도 언급되었는지

**in the contract text**
계약서 텍스트에

**B) Duplicate every jurisdiction name**
B) 모든 사법권 이름을 복제하는 것

**in the enum**
enum 내에서

**with an "ambiguous_" prefix**
"ambiguous_" 접두사와 함께

**so each jurisdiction has**
각 사법권이 가지도록

**an ambiguous counterpart value**
모호한 대응 값을

**C) Add an "unclear" enum value**
C) "unclear" enum 값을 추가하는 것

**to distinguish genuinely ambiguous**
진짜로 모호하거나

**or unstated cases**
명시되지 않은 사례를 구분하기 위해

**from confidently identified jurisdictions**
확실하게 식별된 사법권과

**D) Set `tool_choice`**
D) `tool_choice`를 설정하는 것

**to `{"type": "any"}`**
`{"type": "any"}`로

**so the model is forced**
모델이 강제되도록

**to pick a jurisdiction value**
사법권 값을 선택하도록

**from the enum**
enum에서

**on every single contract**
모든 단일 계약서마다

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Add an "unclear" enum value to distinguish genuinely ambiguous or unstated cases from confidently identified jurisdictions

**정답 및 해설:**

**핵심 개념**: LLM 환각(Hallucination) 방지를 위한 스키마 설계 및 Fallback Enum Value
LLM 기반 정형 데이터 추출 시, 문서 내 정보가 없거나 모호함에도 정해진 특정 값 중 하나만 선택하도록 강제하면 모델은 추측(Hallucination)하여 억지로 값을 채우게 됩니다. 이를 방지하기 위해 enum 목록에 `"unclear"` 또는 `"unknown"`과 같은 예외/모호성 처리 값을 명시적으로 포함시키는 스키마 설계 기법이 필요합니다.

**문제 상황 분석:**
- 계약서에서 준거법(`governing_law`)을 다룰 때 명시적이지 않거나 모호하거나 언급이 없는 케이스가 다수 존재함
- 기존 enum에는 구체적인 사법권 이름만 존재하여, 정보가 불확실할 때 모델이 억지로 특정 사법권을 찍어서 답해야 하는 문제 발생
- 모델의 환각과 찍기(Guessing)를 방지하고 정확도를 높이기 위한 스키마 개편 방안 탐색

**C번이 정답인 이유:**
- enum 값에 `"unclear"`(또나 `"unknown"`)를 추가하면, 모델은 판단이 불확실하거나 입력 문서에 정보가 없을 때 억지로 사법권 하나를 찍지 않고 안전하게 `"unclear"`를 선택할 수 있습니다.
- 이로써 확실하게 식별된 사법권 데이터와 정보 불능/모호 상태 데이터를 깔끔하게 분리할 수 있어 추출 파이프라인의 신뢰성을 극대화합니다.

**오답 분석:**
- Option A (오답): 불리언 타입으로 바꾸면 어떤 사법권인지에 대한 구체적인 정보 자체를 추출할 수 없게 되어 유용성이 크게 떨어집니다.
- Option B (오답): 모든 사법권에 접두사를 붙여 값을 2배로 늘리는 것은 불필요하게 복잡하며, 아예 언급조차 없는 케이스를 제대로 표현하지 못합니다.
- Option D (오답): `tool_choice`를 설정해 강제로 enum 중 하나를 고르게 만들면, 데이터가 없는 경우에도 모델이 억지로 찍도록 강제하므로 환각 및 오추출 문제를 더 심화시킵니다.

---

### 문제 39

**1. 문제 원문**

Per-file passes on two interdependent files each recommend a different fix for what turns out to be the same underlying data-flow issue, and the two recommendations conflict. What architectural step should resolve this rather than picking one per-file recommendation at random?

A) Re-running each per-file pass a second time and keeping whichever recommendation is worded with higher confidence language

B) Merging the two files into one before review so a single per-file pass can cover both without needing an integration step

C) Asking the original generator to arbitrate between the two recommendations, since it has full context on why it wrote the code that way

D) A separate cross-file integration pass that examines both files together and produces one recommendation based on the actual data flow

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**Per-file passes**
파일별 검토 단계가

**on two interdependent files**
상호 의존적인 두 파일에 대한

**each recommend**
각각 추천합니다

**a different fix**
서로 다른 수정안을

**for what turns out to be**
결국 밝혀진 것에 대해

**the same underlying data-flow issue,**
동일한 근본적인 데이터 흐름 문제로,

**and the two recommendations conflict.**
그리고 그 두 추천안은 충돌합니다.

**What architectural step**
어떤 구조적 단계가

**should resolve this**
이를 해결해야 할까요

**rather than picking**
선택하는 대신

**one per-file recommendation**
하나의 파일별 추천안을

**at random?**
무작위로?

---

**OPTIONS:**

**A) Re-running each per-file pass**
A) 각 파일별 검토 단계를 재실행하고

**a second time**
두 번째로

**and keeping whichever recommendation**
어느 추천안이든 채택하는 것

**is worded**
표현된

**with higher confidence language**
더 높은 확신의 언어로

**B) Merging the two files into one**
B) 두 파일을 하나로 병합하는 것

**before review**
검토 전에

**so a single per-file pass**
단일 파일별 검토 단계가

**can cover both**
두 파일 모두를 다룰 수 있도록

**without needing an integration step**
통합 단계가 필요 없이

**C) Asking the original generator**
C) 원래의 생성기(코드 생성 에이전트)에게 요청하는 것

**to arbitrate**
중재하도록

**between the two recommendations,**
두 추천안 사이에서,

**since it has full context**
전체 맥락을 가지고 있기 때문에

**on why it wrote the code**
왜 코드를 작성했는지에 대한

**that way**
그런 방식으로

**D) A separate cross-file integration pass**
D) 별도의 교차 파일 통합 단계

**that examines both files together**
두 파일을 함께 검사하고

**and produces one recommendation**
하나의 추천안을 생성하는

**based on the actual data flow**
실제 데이터 흐름에 기반하여

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: A separate cross-file integration pass that examines both files together and produces one recommendation based on the actual data flow

**정답 및 해설:**

**핵심 개념**: 파일 간 상호작용 검수 및 Cross-File Analysis (교차 파일 통합 분석)
개별 파일 단위(Per-file) 분석은 파일 간의 상호작용이나 전체적인 데이터 흐름(Data-flow) 맥락을 완벽히 파악하기 어렵습니다. 서로 의존성이 있는 파일 간에 권고 사항이 충돌할 경우, 별도의 교차 파일(Cross-file) 통합 분석 단계를 두어 두 파일을 함께 조망하고 전체 데이터 흐름 관점에서 단일화된 수정안을 도출해야 합니다.

**문제 상황 분석:**
- 상호 의존적인 두 파일에 대해 파일별(Per-file)로 검토 패스를 실행함
- 알고 보니 두 파일의 문제는 동일한 근본 데이터 흐름 문제였으나, 파일별 분석으로 인해 서로 충돌하는 수정안이 도출됨
- 무작위로 하나를 선택하지 않고 이 구조적 충돌을 올바르게 해결하기 위한 건축적/설계적 해결책을 찾아야 함

**D번이 정답인 이유:**
- 파일 개별 분석 수준에서는 타 파일과의 연계성이 차단되므로 전체적인 데이터 흐름을 오해할 수 있습니다.
- 파일 단위 분석 후, 여러 파일에 걸쳐 발생하는 의존성 및 충돌을 통합하여 심사하는 **별도의 교차 파일 통합 단계(Cross-file integration pass)**를 추가하면 전체 데이터 흐름을 한눈에 파악하여 하나의 일관된 권고안을 도출할 수 있습니다.

**오답 분석:**
- Option A (오답): 단순히 검토를 재실행하고 모델이 표현한 "확신의 정도(Confidence language)"에 의존하는 것은 확증 편향 및 환각을 유발하며 문제의 근본 원인(파일 간 맥락 부재)을 해결하지 못합니다.
- Option B (오답): 검토를 위해 원본 소스 코드 파일 두 개를 하나로 병합하는 것은 코드베이스의 구조와 아키텍처를 훼손하는 부적절한 방식입니다.
- Option C (오답): 코드를 생성했던 원본 생성기에게 중재를 맡기더라도, 그 생성기 역시 이전 생성 맥락에서의 편향(Self-review bias)을 가질 수 있으며 파일 간 상호작용 문제를 통합 검수하기에는 적합하지 않습니다.

---

### 문제 40

**1. 문제 원문**

A security-scanning assistant is supposed to report findings with four consistent fields: location, issue, severity, and suggested fix. Written instructions specify these four fields, but outputs still vary: some findings omit severity, others merge the issue and fix into one sentence. What is the most effective way to lock in the desired structure?

A) Ask the model to double-check its own output carefully against the four-field requirement before returning it

B) Add a note at the end of the instructions reminding the model not to forget the severity field

C) Provide worked examples that render all four fields in the same order, including one low-severity case

D) Increase the output token limit so the model has room to include every field without truncation

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**A security-scanning assistant**  
보안 스캐닝 어시스턴트가  

**is supposed to report findings**  
발견 사항을 보고하기로 되어 있습니다  

**with four consistent fields:**  
4개의 일관된 필드로:  

**location, issue, severity,**  
위치, 문제, 심각도,  

**and suggested fix.**  
그리고 제안된 수정 사항.  

**Written instructions specify**  
지시문에 작성된 내용은 명시하고 있습니다  

**these four fields,**  
이 4가지 필드를,  

**but outputs still vary:**  
하지만 출력 결과는 여전히 다릅니다:  

**some findings omit severity,**  
일부 발견 사항은 심각도를 누락하고,  

**others merge the issue and fix**  
다른 것들은 문제와 수정 사항을 병합합니다  

**into one sentence.**  
한 문장으로.  

**What is the most effective way**  
가장 효과적인 방법은 무엇인가요  

**to lock in the desired structure?**  
원하는 구조를 확정(고정)하기 위한?  

---

**OPTIONS:**

**A) Ask the model**  
A) 모델에게 요청하는 것  

**to double-check its own output carefully**  
자신의 출력을 주의 깊게 다시 확인하도록  

**against the four-field requirement**  
4개 필드 요구사항에 맞추어  

**before returning it**  
반환하기 전에  

**B) Add a note**  
B) 메모를 추가하는 것  

**at the end of the instructions**  
지시문 끝에  

**reminding the model**  
모델에게 상기시키는  

**not to forget the severity field**  
심각도 필드를 잊지 말라고  

**C) Provide worked examples**  
C) 모범 예시(Few-shot examples)를 제공하는 것  

**that render all four fields**  
4개 필드를 모두 표현하는  

**in the same order,**  
동일한 순서로,  

**including one low-severity case**  
낮은 심각도 사례를 포함하여  

**D) Increase the output token limit**  
D) 출력 토큰 제한을 늘리는 것  

**so the model has room**  
모델이 공간을 확보할 수 있도록  

**to include every field**  
모든 필드를 포함할  

**without truncation**  
짤림(truncation) 없이  

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Provide worked examples that render all four fields in the same order, including one low-severity case

**정답 및 해설:**

**핵심 개념**: 퓨샷 프롬프팅 및 출력 형식의 일관성 (Few-Shot Prompting for Structured Output)  
LLM에 텍스트 지시사항(Zero-Shot)만 줄 경우, 원하는 포맷이나 필수 필드가 생략되거나 합쳐지는 등 일관성이 떨어질 수 있습니다. 원하는 출력 형태와 정렬 방식이 완벽히 적용된 예시(Worked Examples/Few-Shot)를 프롬프트에 제공하면 모델이 형식을 패턴화하여 일관되고 구조화된 결과를 보장합니다.

**문제 상황 분석:**
- 보안 스캐닝 어시스턴트에 4개 필드(`location`, `issue`, `severity`, `suggested fix`)를 요구하도록 지시문 작성을 완료함
- 텍스트 설명에도 불구하고 심각도 필드가 누락되거나, 문제와 수정안이 한 문장으로 뭉쳐지는 등 출력 형식이 계속 불일치함
- 출력을 일관된 구조로 고정(Lock in)하기 위한 가장 효과적인 프롬프트 개선안을 찾아야 함

**C번이 정답인 이유:**
- 모델은 텍스트 설명보다 실제 완성된 예시(Worked Examples)의 패턴을 수용하고 모방하는 능력이 뛰어납니다.
- 4개 필드가 모두 동일한 순서로 정렬된 예시를 포함시키고, 특히 누락되기 쉬운 `low-severity`(낮은 심각도) 예시까지 명시해주면, 모델은 모든 조건에서 4가지 필드를 빠짐없이 동일한 일관된 형식으로 출력하게 됩니다.

**오답 분석:**
- Option A (오답): "스스로 검토하라"는 일반적인 재확인 요구 지시문(텍스트 추상 지시)만으로는 출력 구조의 패턴 및 필드 누락을 근본적으로 고정하기 어렵습니다.
- Option B (오답): 지시문 끝에 심각도 필드를 잊지 말라는 문구를 덧붙여도(Zero-shot 튜닝), 필드가 뭉치거나 구조가 흐트러지는 포맷 문제 전체를 완전히 통제할 수 없습니다.
- Option D (오답): 출력 토큰 한도가 부족해서 생긴 잘림 현상이 아니라 포맷 지시 불이행 문제이므로, 토큰 제한을 늘리는 것은 해결책이 될 수 없습니다.

---

### 문제 41

**1. 문제 원문**

A code review agent flags a helper function because its naming does not match the dominant naming convention in the file. However, the file already contains legacy functions with several naming styles, and the helper function's name is consistent with one of those legacy styles but not with the project's canonical naming standard. The architect is using a subagent-based code review workflow and wants a criterion that reduces this kind of false positive without suppressing genuine naming defects. Which criterion best addresses this failure mode?

A) Skip all naming-related findings across the entire codebase regardless of context, treating naming style as advisory, and focus the review exclusively on validating the code's logic and error handling.

B) Report the naming inconsistency but flag it as low severity in the findings list and include the local style variations that are already present in the file to provide context for the review.

C) Dedicate a subagent to naming review with an isolated context window, a custom system prompt that instructs it to ignore pre-existing local style variations and flag only deviations from the project's canonical naming standard, and least-privilege tool access. This reduces false positives by focusing the review on the canonical standard, though it cannot eliminate all false positives.

D) Ask the model to only report naming issues when its confidence exceeds 90% based on comparing the usage against standard library conventions and the project's own style guide.

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**A code review agent flags**
코드 검토 에이전트가 지적합니다

**a helper function**
헬퍼 함수를

**because its naming**
그 이름 지정이

**does not match**
일치하지 않기 때문에

**the dominant naming convention**
우세한 이름 지정 컨벤션과

**in the file.**
파일 내의.

**However, the file already contains**
하지만, 그 파일은 이미 포함하고 있습니다

**legacy functions**
레거시 함수들을

**with several naming styles,**
여러 이름 지정 스타일을 가진,

**and the helper function's name**
그리고 그 헬퍼 함수의 이름은

**is consistent with**
일관성이 있습니다

**one of those legacy styles**
그러한 레거시 스타일 중 하나와

**but not with the project's**
프로젝트의 ~와는 불일치하지만

**canonical naming standard.**
표준 이름 지정 기준.

**The architect is using**
아키텍트는 사용하고 있습니다

**a subagent-based code review workflow**
서브에이전트 기반 코드 검토 워크플로를

**and wants a criterion**
그리고 기준을 원합니다

**that reduces this kind of false positive**
이러한 종류의 거짓 양성(오탐)을 줄이는

**without suppressing**
억제(차단)하지 않으면서

**genuine naming defects.**
진짜 이름 지정 결함을.

**Which criterion**
어떤 기준이

**best addresses**
가장 잘 해결합니까

**this failure mode?**
이 오류 패턴을?

---

**OPTIONS:**

**A) Skip all naming-related findings**
A) 모든 이름 지정 관련 발견 사항을 건너뛰는 것

**across the entire codebase**
전체 코드베이스에 걸쳐

**regardless of context,**
맥락에 관계없이,

**treating naming style as advisory,**
이름 지정 스타일을 권고 사항으로 취급하고,

**and focus the review exclusively**
그리고 검토를 오직 집중하는 것

**on validating the code's logic**
코도의 로직 검증에

**and error handling.**
및 오류 처리에.

**B) Report the naming inconsistency**
B) 이름 지정 불일치를 보고하지만

**but flag it as low severity**
발견 사항 목록에서 낮은 심각도로 표시하고

**in the findings list**
발견 사항 목록에

**and include the local style variations**
그리고 로컬 스타일 변형들을 포함하는 것

**that are already present in the file**
파일 내에 이미 존재하는

**to provide context for the review.**
검토에 대한 맥락을 제공하기 위해.

**C) Dedicate a subagent to naming review**
C) 이름 지정 검토에 전용 서브에이전트를 배정하는 것

**with an isolated context window,**
격리된 컨텍스트 창을 가진,

**a custom system prompt**
맞춤형 시스템 프롬프트와 함께

**that instructs it to ignore**
무시하도록 지시하는

**pre-existing local style variations**
기존에 존재하던 로컬 스타일 변형들을

**and flag only deviations**
그리고 이탈(위반)만을 지적하도록

**from the project's canonical naming standard,**
프로젝트의 표준 이름 지정 기준으로부터의,

**and least-privilege tool access.**
그리고 최소 권한 도구 접근을 가진.

**This reduces false positives**
이것은 거짓 양성을 줄여줍니다

**by focusing the review**
검토를 집중시킴으로써

**on the canonical standard,**
표준 기준에,

**though it cannot eliminate**
제거할 수는 없을지라도

**all false positives.**
모든 거짓 양성을.

**D) Ask the model to only report**
D) 모델에게 보고만 하도록 요청하는 것

**naming issues**
이름 지정 문제들을

**when its confidence exceeds 90%**
신뢰도가 90%를 초과할 때만

**based on comparing the usage**
사용법을 비교한 것에 기반하여

**against standard library conventions**
표준 라이브러리 컨벤션과

**and the project's own style guide.**
그리고 프로젝트 자체 스타일 가이드에.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Dedicate a subagent to naming review with an isolated context window, a custom system prompt that instructs it to ignore pre-existing local style variations and flag only deviations from the project's canonical naming standard, and least-privilege tool access. This reduces false positives by focusing the review on the canonical standard, though it cannot eliminate all false positives.

**정답 및 해설:**

**핵심 개념**: 서브에이전트 역할 격리 및 시스템 프롬프트를 통한 거짓 양성 차단 (Subagent Isolation & Standard-driven Prompts)
코드베이스 내에 혼재하는 기존 레거시 코드 스타일로 인해 발생하는 오탐(False Positive)을 줄이기 위해서는, 해당 작업만을 전담하는 서브에이전트에 독립된 컨텍스트 창을 부여하고, "기존 레거시 스타일 파편화에 인접하여 맞춰 쓴 코드는 노이즈로 보고 무시하되, 오직 프로젝트의 중앙 표준 가이드라인(Canonical standard) 위반만 지적하라"는 명확한 시스템 프롬프트를 주입해야 합니다.

**문제 상황 분석:**
- 검토 에이전트가 헬퍼 함수의 이름을 지적함 (해당 파일 내 주요 컨벤션과 다르다는 이유)
- 하지만 그 파일에는 이미 다양한 이름 스타일을 가진 레거시 함수들이 존재하며, 헬퍼 함수는 그중 한 레거시 스타일을 따른 것일 뿐임 (프로젝트 전역 표준과는 일치하지 않음)
- 진성 이름 결함은 잡아내면서, 파일 내 레거시 파편화 때문에 일어나는 모호한 오탐(False positive)만 선택적으로 줄일 수 있는 서브에이전트 설계 기준이 필요함

**C번이 정답인 이유:**
- 전용 서브에이전트(Dedicated subagent)에 **격리된 컨텍스트**와 **명확한 커스텀 시스템 프롬프트**를 부여하는 것이 핵심입니다.
- 시스템 프롬프트를 통해 "파일 내부의 기존 로컬 스타일 혼용에惑(혹)하지 말고, 오직 프로젝트 중앙 표준 기준(Canonical naming standard)에서 벗어난 진성 위반만 검출하라"고 명확히 제한함으로써 레거시 혼재로 인한 오탐을 대폭 감소시킬 수 있습니다.

**오답 분석:**
- Option A (오답): 오탐을 줄이겠다고 코드베이스 전체의 이름 검토 지적을 아예 건너뛰는(Skip) 것은 진짜 명명 결함(Genuine naming defects)까지 놓치게 되므로 부적절합니다.
- Option B (오답): 오탐 메시지 자체를 없애지 않고 단순히 낮은 심각도로 계속 보고하는 방식은 개발자의 알림 피로도(Notification fatigue)를 해결하지 못합니다.
- Option D (오답): "신뢰도 90% 초과"와 같은 수치 조건은 LLM 모델 자체의 주관적이고 불확실한 확신도 산출 방식에 의존하므로, 표준 위반 판단 기준을 명확히 제어하지 못합니다.

---

### 문제 42

**1. 문제 원문**

A large migration changes 200 files, more than can reasonably be delegated turn-by-turn from a single conversation. What best fits scaling per-file review passes to this volume?

A) Increase the generator's own extended thinking effort so it reviews all 200 files itself before returning control to the architect

B) Move orchestration into a workflow tool that runs a script coordinating many subagents, instead of turn-by-turn delegation

C) Reduce the review to a random sample of 20 files and extrapolate those findings across all the remaining changed files

D) Ask a single subagent to review all 200 files sequentially within one long-running conversation so results stay consistent

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**A large migration changes**
대규모 마이그레이션이 변경합니다

**200 files,**
200개의 파일을,

**more than can reasonably be delegated**
합리적으로 위임될 수 있는 것보다 많은

**turn-by-turn**
턴 바이 턴(순차적 대화) 방식으로

**from a single conversation.**
단일 대화로부터.

**What best fits**
무엇이 가장 잘 부합합니까

**scaling per-file review passes**
파일별 검토 패스 확장에

**to this volume?**
이 정도의 규모에?

---

**OPTIONS:**

**A) Increase the generator's own**
A) 생성기 자체의 ~를 늘리는 것

**extended thinking effort**
확장된 생각(extended thinking) 노력을

**so it reviews**
그것이 검토하도록

**all 200 files itself**
200개 파일 전체를 직접

**before returning control**
제어권을 반환하기 전에

**to the architect**
아키텍트에게

**B) Move orchestration**
B) 오케스트레이션을 이동시키는 것

**into a workflow tool**
워크플로 도구로

**that runs a script**
스크립트를 실행하는

**coordinating many subagents,**
수많은 서브에이전트들을 조율하는,

**instead of turn-by-turn delegation**
턴 바이 턴 방식의 위임 대신에

**C) Reduce the review**
C) 검토를 줄이는 것

**to a random sample of 20 files**
20개 파일의 무작위 샘플로

**and extrapolate those findings**
그리고 그러한 발견 사항을 추정 적용하는 것

**across all the remaining changed files**
나머지 모든 변경된 파일들에 대해

**D) Ask a single subagent**
D) 단일 서브에이전트에게 요청하는 것

**to review all 200 files sequentially**
200개 파일 전체를 순차적으로 검토하도록

**within one long-running conversation**
오래 실행되는 하나의 대화 내에서

**so results stay consistent**
결과가 일관되게 유지되도록

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Move orchestration into a workflow tool that runs a script coordinating many subagents, instead of turn-by-turn delegation

**정답 및 해설:**

**핵심 개념**: 에이전트 오케스트레이션 및 스케일아웃 (Workflow-based Multi-agent Orchestration)
대규모 파일(200개 등)을 단일 대화 턴이나 수동 위임 방식으로 검토하는 것은 컨텍스트 창(Context Window) 오버플로, 컨텍스트 유실, 엄청난 지연 시간을 유발합니다. 이처럼 대량의 파일별 독립 작업을 확장할 때는 외부 스크립트나 워크플로 엔진을 사용해 다수의 서브에이전트를 동시/병렬적으로 오케스트레이션하는 것이 대규모 검토 패스 스케일링의 정석입니다.

**문제 상황 분석:**
- 마이그레이션 작업으로 인해 총 200개의 대량 파일이 변경됨
- 한 번의 대화 세션에서 턴 바이 턴(turn-by-turn)으로 처리할 수 있는 범위를 훨씬 초과함
- 이 규모의 파일별(per-file) 검토 작업을 병렬적이고 효율적으로 확장(Scale)하기 위한 시스템 설계 방안 필요

**B번이 정답인 이유:**
- 대화형 인터페이스(Turn-by-turn)를 통한 위임은 처리량(Throughput) 한계와 컨텍스트 누적 문제를 야기합니다.
- 외부 워크플로 도구 및 프로그래밍 스크립트를 도입하여 수많은 서브에이전트를 동시적으로 구동·조율(Orchestration)하면 200개 파일 전체를 효율적으로 분산 검토할 수 있습니다.

**오답 분석:**
- Option A (오답): Extended thinking(생각 시간)을 늘린다고 해서 단일 모델/단일 턴이 갖는 컨텍스트 한계와 200개 파일 전체의 상세 분석 과부하 문제를 해결할 수는 없습니다.
- Option C (오답): 일부(20개)만 샘플링하여 나머지를 추정하는 방식은 검토하지 않은 180개 파일에 존재하는 독립적인 결함이나 버그를 놓치게 되므로 대규모 코드 검토의 목적에 어긋납니다.
- Option D (오답): 하나의 장기 실행 대화 세션에서 200개 파일을 순차 검토하면 컨텍스트 창 초과, 환각 증상 발생 및 극심한 성능 저하가 발생합니다.