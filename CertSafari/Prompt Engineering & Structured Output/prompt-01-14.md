### 1번 문제

**1. 문제 원문**

A compliance group reviews 15,000 vendor contracts once a week and publishes a findings report two business days later. Cost per document matters because the review runs across the entire vendor catalog every cycle. How should this recurring job be built?

A) Submit the contracts as a single Message Batch each week, since the two-day turnaround comfortably absorbs the batch processing window and the discount lowers per-cycle spend

B) Submit the contracts through the synchronous Messages API one at a time, since compliance findings require the strict ordering only sequential calls preserve

C) Split the contracts across several small Message Batches submitted every few minutes, since batches must stay under a few hundred requests to process reliably

D) Submit the contracts through the synchronous Messages API in parallel threads, since parallel synchronous calls always finish faster than a queued batch job

---

**2. 구간별 직독직해 번역**

**QUESTION:**
**A compliance group reviews**
컴플라이언스 팀은 검토합니다

**15,000 vendor contracts**
15,000개의 공급업체 계약서를

**once a week**
일주일에 한 번

**and publishes a findings report**
그리고 결과 보고서를 발행합니다

**two business days later.**
영업일 기준 이틀 후에.

**Cost per document matters**
문서당 비용이 중요합니다

**because the review runs**
검토가 실행되기 때문에

**across the entire vendor catalog**
전체 공급업체 카탈로그에 걸쳐

**every cycle.**
주기마다.

**How should this recurring job**
이 반복 작업은 어떻게

**be built?**
구축되어야 합니까?

**Option A:**
**Submit the contracts**
계약서를 제출합니다

**as a single Message Batch**
단일 Message Batch로

**each week,**
매주,

**since the two-day turnaround**
이틀의 처리 시간이

**comfortably absorbs**
여유 있게 수용하기 때문에

**the batch processing window**
배치 처리 시간 창을

**and the discount lowers**
그리고 할인 혜택이 낮춰주기 때문에

**per-cycle spend**
주기당 지출을

**Option B:**
**Submit the contracts**
계약서를 제출합니다

**through the synchronous Messages API**
동기식 Messages API를 통해

**one at a time,**
한 번에 하나씩,

**since compliance findings require**
컴플라이언스 결과가 요구하기 때문에

**the strict ordering**
엄격한 순서를

**only sequential calls preserve**
순차적 호출만이 유지할 수 있는

**Option C:**
**Split the contracts**
계약서를 분할합니다

**across several small Message Batches**
여러 개의 작은 Message Batch로

**submitted every few minutes,**
몇 분마다 제출되는,

**since batches must stay**
배치가 유지되어야 하기 때문에

**under a few hundred requests**
몇 백 개 요청 미만으로

**to process reliably**
안정적으로 처리되려면

**Option D:**
**Submit the contracts**
계약서를 제출합니다

**through the synchronous Messages API**
동기식 Messages API를 통해

**in parallel threads,**
병렬 스레드로,

**since parallel synchronous calls**
병렬 동기식 호출이

**always finish faster**
항상 더 빠르게 완료되기 때문에

**than a queued batch job**
대기열에 있는 배치 작업보다

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Submit the contracts as a single Message Batch each week, since the two-day turnaround comfortably absorbs the batch processing window and the discount lowers per-cycle spend

**정답 및 해설:**

**핵심 개념**: Anthropic Message Batches API
Message Batches API는 비동기 대량 처리용 API로, 처리 완료까지 최대 24시간이 소요될 수 있지만 일반 동기식 API 대비 **50% 비용 할인** 혜택을 제공합니다. 즉각적인 응답이 필요 없는 대규모 일괄 처리에 최적화되어 있습니다.

**문제 상황 분석:**
- 매주 15,000건이라는 대량의 문서(계약서)를 일괄 검토해야 함
- 보고서 제출까지 영업일 기준 2일(48시간)의 충분한 여유 시간이 존재함 (24시간 이내 처리 창 수용 가능)
- 매 주기마다 전체 카탈로그를 처리하므로 문서당 처리 비용 절감이 매우 중요한 요구사항임

**A번이 정답인 이유:**
Message Batches API는 처리 완료까지 최대 24시간이 걸릴 수 있지만, 문제에서 2 영업일이라는 충분한 기한을 주었으므로 시간적 조건을 완벽히 충족합니다. 또한 50%의 비용 할인을 제공하므로 "문서당 비용이 중요하다"는 조건에 부합하는 가장 경제적이고 효율적인 아키텍처입니다.

**오답 분석:**

- Option B (오답): 동기식 API로 15,000건을 순차 처리하면 막대한 시간이 소요되며 비용 할인 혜택을 받지 못합니다. 또한 계약서 검토 작업 간에 엄격한 순서 보장이 필수적이지 않습니다.
- Option C (오답): Message Batches API는 수천 건 이상의 대용량 배치(최대 10,000개 이상의 요청 등)도 안정적으로 처리할 수 있도록 설계되어 있어, 굳이 몇 백 개 단위로 몇 분마다 나누어 분할 제출할 필요가 없습니다.
- Option D (오답): 병렬 동기식 호출은 속도는 빠를 수 있으나 Rate Limit(호출 제한)에 도달하기 쉽고, 무엇보다 Batch API가 제공하는 50% 비용 할인 혜택을 받을 수 없어 비용 효율성 측면에서 부적합합니다.

---

### 2번 문제

**1. 문제 원문**

An extraction pipeline for supplier contracts frequently returns null for the 'renewal_notice_period' field on contracts where that information is present but phrased unusually, such as buried in a sentence about termination rather than in a clearly labeled 'Renewal' clause. The team has already tried making the field's instruction more explicit with no improvement. What should they try next?

A) Change the field's data type from a string to a required enumerated value from a fixed set

B) Add a fallback default value of thirty days that is used whenever the field would otherwise be left null

C) Show an extraction from unusual phrasing plus a case confirming null is correct when unspecified

D) Instruct the model to scan only clauses whose heading explicitly contains the word 'renewal' or 'termination'

---

**2. 구간별 직독직해 번역**

**QUESTION:**
**An extraction pipeline**
추출 파이프라인은

**for supplier contracts**
공급업체 계약서를 위한

**frequently returns null**
자주 null을 반환합니다

**for the 'renewal_notice_period' field**
'renewal_notice_period' 필드에 대해

**on contracts where**
~한 계약서에서

**that information is present**
해당 정보가 존재하지만

**but phrased unusually,**
특이하게 표현되어 있는,

**such as buried**
묻혀 있는 것과 같이

**in a sentence about termination**
해지에 관한 문장에

**rather than in a clearly labeled**
명확하게 라벨이 붙은 대신에

**'Renewal' clause.**
'갱신' 조항에.

**The team has already tried**
팀은 이미 시도했습니다

**making the field's instruction**
필드의 지침을 만드는 것을

**more explicit**
더 명시적으로

**with no improvement.**
개선 없이.

**What should they try next?**
그들은 다음에 무엇을 시도해야 합니까?

**Option A:**
**Change the field's data type**
필드의 데이터 타입을 변경합니다

**from a string**
문자열에서

**to a required enumerated value**
필수 열거형 값으로

**from a fixed set**
고정된 세트로부터의

**Option B:**
**Add a fallback default value**
대체 기본값을 추가합니다

**of thirty days**
30일의

**that is used**
사용되는

**whenever the field**
필드가 ~할 때마다

**would otherwise be left null**
그렇지 않으면 null로 남겨질

**Option C:**
**Show an extraction**
추출 예시를 보여줍니다

**from unusual phrasing**
특이한 표현으로부터의

**plus a case**
케이스와 함께

**confirming null is correct**
null이 올바름을 확인하는

**when unspecified**
명시되지 않았을 때

**Option D:**
**Instruct the model**
모델에게 지시합니다

**to scan only clauses**
조항만 스캔하도록

**whose heading explicitly contains**
제목에 명시적으로 포함된

**the word 'renewal' or 'termination'**
'renewal' 또는 'termination'이라는 단어를

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Show an extraction from unusual phrasing plus a case confirming null is correct when unspecified

**정답 및 해설:**

**핵심 개념**: 퓨샷 프롬프팅(Few-shot Prompting) 및 예시 제공(In-context Learning)
LLM을 이용한 정보 추출 시, 단순 지시문(Zero-shot) 개선만으로 모호하거나 특이한 문맥을 제대로 다루지 못할 때는 올바른 추출 예시(Positive Example)와 추출할 정보가 없을 때 null을 반환하는 예시(Negative Example)를 함께 제공하는 퓨샷 프롬프팅이 가장 효과적인 해결책입니다.

**문제 상황 분석:**
- 계약서 내에 정보는 존재하지만 '갱신' 조항이 아닌 '해지' 관련 문장에 묻혀 있는 등 특이하게 표현된 경우 모델이 null을 반환함
- 단순히 지시문(Instruction)을 더 명시적으로 작성하는 것만으로는 성능 개선이 이루어지지 않음
- 정보가 없는 경우(null 반환)와 특이한 표현에서 정보를 추출해 내야 하는 경우를 구별하도록 모델을 학습/가이드해야 함

**C번이 정답인 이유:**
지시문 변경으로 효과를 보지 못했을 때 다음 단계로 적용해야 하는 기법은 예시(Examples)를 프롬프트에 추가하는 것입니다. 특이한 문장 구조에서도 정답을 추출하는 성공 사례와, 진짜 정보가 없을 때만 null을 반환하도록 검증하는 사례를 함께 보여줌으로써 모델이 복잡한 문맥 패턴을 정확히 인식하고 판단 기준을 잡을 수 있게 됩니다.

**오답 분석:**

- Option A (오답): 데이터 타입을 열거형(Enum)으로 바꾼다고 해서 모델이 문맥 속에 숨겨진 특이한 표현을 찾아내는 능력 자체가 향상되지는 않습니다.
- Option B (오답): 추출 실패 시 무조건 30일을 기본값으로 넣는 것은 잘못된 데이터(환각/하드코딩된 값)를 오염시키는 방안이며, 추출 모델의 성능 자체를 개선하는 방법이 아닙니다.
- Option D (오답): 조항 제목에 특정 단어가 포함된 것만 스캔하도록 제한하면, 해당 제목이 없거나 예상치 못한 다른 단락에 정보가 위치한 경우 추출을 전혀 하지 못하게 되어 문제가 더욱 악화됩니다.

---

### 3번 문제

**1. 문제 원문**

A team runs per-file passes first, producing local findings for each changed file, then runs a separate integration pass over the whole changeset. What should the integration pass focus on that the per-file passes are not well suited to catch?

A) Inconsistencies in data flow and contracts between files, such as a shared interface used differently across files reviewed in isolation

B) Formatting and style issues within a single file, since per-file passes are too narrowly scoped to catch indentation or naming inconsistencies

C) Syntax errors within an individual file, since a per-file pass already checks whether that specific file compiles and contains valid syntax

D) Duplicate logic within a single file, since per-file passes read files sequentially and cannot notice repeated code blocks in the same file

---

**2. 구간별 직독직해 번역**

**QUESTION:**
**A team runs**
한 팀이 실행합니다

**per-file passes first,**
파일별 검사를 먼저,

**producing local findings**
로컬 분석 결과를 생성하며

**for each changed file,**
변경된 각 파일에 대해,

**then runs**
그 후 실행합니다

**a separate integration pass**
별도의 통합 검사를

**over the whole changeset.**
전체 변경 사항 집합(changeset)에 대해.

**What should the integration pass**
통합 검사는 무엇에

**focus on**
중점을 두어야 합니까

**that the per-file passes**
파일별 검사가

**are not well suited to catch?**
포착하기에 적합하지 않은?

**Option A:**
**Inconsistencies in data flow**
데이터 흐름의 불일치

**and contracts between files,**
및 파일 간의 계약(contract) 불일치,

**such as a shared interface**
공유 인터페이스와 같은

**used differently**
다르게 사용된

**across files reviewed in isolation**
단독으로 검토된 파일들 전체에서

**Option B:**
**Formatting and style issues**
포맷팅 및 스타일 문제

**within a single file,**
단일 파일 내의,

**since per-file passes**
파일별 검사는 ~하기 때문에

**are too narrowly scoped**
범위가 너무 좁기 때문에

**to catch indentation**
들여쓰기를 포착하기에는

**or naming inconsistencies**
또는 명명 규칙 불일치를

**Option C:**
**Syntax errors**
문법 오류

**within an individual file,**
개별 파일 내의,

**since a per-file pass**
파일별 검사는 ~하기 때문에

**already checks**
이미 확인하기 때문에

**whether that specific file compiles**
해당 특정 파일이 컴파일되는지

**and contains valid syntax**
그리고 유효한 문법을 포함하는지

**Option D:**
**Duplicate logic**
중복 로직

**within a single file,**
단일 파일 내의,

**since per-file passes**
파일별 검사는 ~하기 때문에

**read files sequentially**
파일을 순차적으로 읽기 때문에

**and cannot notice**
그리고 감지할 수 없기 때문에

**repeated code blocks**
반복되는 코드 블록을

**in the same file**
동일한 파일 내에서

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Inconsistencies in data flow and contracts between files, such as a shared interface used differently across files reviewed in isolation

**정답 및 해설:**

**핵심 개념**: 교차 파일/통합 리뷰(Cross-file / Integration Review) vs 단일 파일 리뷰(Per-file Review)
단일 파일 스코프에서는 개별 파일의 구문, 포맷팅, 로컬 로직을 검사할 수 있지만, 여러 파일에 걸친 인터페이스 호환성, 데이터 흐름, 모듈 간 계약(Contract) 등의 불일치는 전체 코드 변경 집합(Changeset)을 함께 조회하는 통합 패스에서만 정확히 포착할 수 있습니다.

**문제 상황 분석:**
- 개발 팀이 코드 리뷰/검사 파이프라인을 2단계(파일별 개별 검사 -> 전체 통합 검사)로 구성함
- 1단계(파일별 검사)는 개별 파일 단위의 분석 결과를 생성함
- 2단계(통합 검사)에서 개별 파일 단위 검사로는 놓치기 쉬운 영역을 효율적으로 포착하고자 함

**A번이 정답인 이유:**
개별 파일만 격리해서 검토(reviewed in isolation)할 때는 각 파일이 정적 타입이나 구문상 오류가 없어 보일 수 있습니다. 하지만 시스템 전체 변경 집합을 보는 통합 검사 단계에서는 파일 간 데이터 흐름의 불일치나, 공유 인터페이스가 파일마다 서로 다른 규격/의도로 쓰인 "파일 간 계약 불일치"를 효과적으로 잡아낼 수 있습니다.

**오답 분석:**

- Option B (오답): 단일 파일 내의 들여쓰기나 명명 규칙 같은 스타일/포맷팅 문제는 개별 파일 검사 단계(per-file pass)가 처리하기에 가장 적합한 항목입니다.
- Option C (오답): 단일 파일의 문법 오류나 컴파일 여부는 파일별 검사 단계에서 확인해야 할 핵심 사항이며, 전체 통합 검사의 주요 대상이 아닙니다.
- Option D (오답): 동일 파일 내의 코드 중복 역시 개별 파일 정적 분석 도구(per-file pass)가 충분히 찾아낼 수 있는 범위입니다.

---

### 4번 문제

**1. 문제 원문**

A substantial multi-file change is nearing merge. The architect wants findings that are independently reproduced and verified before they're reported, and is willing to wait several minutes and spend usage credits for that assurance. Which option best fits?

A) `/code-review ultra`, since it runs a fleet of reviewer agents that independently reproduce and verify each finding

B) `/code-review` at the default effort level, since local reviews already independently reproduce and verify every finding

C) Repeating `/code-review` three separate times in one session, and keeping only the findings that appear in all three runs

D) A single `/review <pr>` pass, since it applies the same independent verification as the cloud fleet but finishes in seconds

---

**2. 구간별 직독직해 번역**

**QUESTION:**
**A substantial multi-file change**
상당한 규모의 다중 파일 변경 사항이

**is nearing merge.**
병합(merge)을 앞두고 있습니다.

**The architect wants findings**
아키텍트는 결과를 원합니다

**that are independently reproduced**
독립적으로 재현되고

**and verified**
검증된

**before they're reported,**
보고되기 전에,

**and is willing to wait**
그리고 기다릴 의향이 있습니다

**several minutes**
몇 분 동안

**and spend usage credits**
사용 크레딧을 소비할 의향이

**for that assurance.**
그러한 확실성을 위해.

**Which option best fits?**
어떤 옵션이 가장 적합합니까?

**Option A:**
**`/code-review ultra`,**
`/code-review ultra` 명령어,

**since it runs**
실행하기 때문에

**a fleet of reviewer agents**
검토자 에이전트 군단을

**that independently reproduce**
독립적으로 재현하고

**and verify each finding**
각 결과를 검증하는

**Option B:**
**`/code-review` at the default effort level,**
기본 작업 공수 수준의 `/code-review`,

**since local reviews already**
로컬 리뷰가 이미 ~하기 때문에

**independently reproduce**
독립적으로 재현하고

**and verify every finding**
모든 결과를 검증하기 때문에

**Option C:**
**Repeating `/code-review`**
`/code-review`를 반복하는 것

**three separate times**
세 번 서로 다르게

**in one session,**
한 세션 내에서,

**and keeping only the findings**
그리고 결과만 남기는 것

**that appear in all three runs**
세 번의 실행 모두에서 나타나는

**Option D:**
**A single `/review <pr>` pass,**
단일 `/review <pr>` 실행,

**since it applies**
적용하기 때문에

**the same independent verification**
동일한 독립적 검증을

**as the cloud fleet**
클라우드 에이전트 군단과 같은

**but finishes in seconds**
하지만 몇 초 만에 완료되는

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: `/code-review ultra`, since it runs a fleet of reviewer agents that independently reproduce and verify each finding

**정답 및 해설:**

**핵심 개념**: Claude Code 리뷰 모드 및 크레딧/수행 시간 트레이드오프
Claude Code의 깊은 코드 리뷰 모드(예: `ultra` 옵션)는 병렬 에이전트 플릿(Fleet)을 실행하여 발견된 이슈나 오탐(False positive)을 독립적으로 직접 재현 및 검증합니다. 이 과정은 수 분의 시간과 더 많은 사용 크레딧(토큰)을 소모하지만 검증의 정확성을 높여줍니다.

**문제 상황 분석:**
- 대규모 multi-file 병합을 앞두고 있어 높은 검증 정확성이 요구됨
- 보고서 출력 전 발견된 이슈들이 독립적으로 재현 및 검증되어야 함
- 아키텍트는 이를 위해 몇 분의 시간 소요와 추가 크레딧 지출을 감수할 용의가 있음

**A번이 정답인 이유:**
`/code-review ultra` 옵션은 다수의 리뷰어 에이전트를 동원하여 각 이슈를 독립적으로 재현(reproduce)하고 검증(verify)하는 깊은 리뷰 프로세스를 수행합니다. 처리 시간에 몇 분이 소요되고 크레딧이 소비되지만 최고의 정확성을 보장하므로 문제의 요구사항과 완벽히 일치합니다.

**오답 분석:**

- Option B (오답): 기본(default) 노력 수준의 리뷰는 수 분 동안 다수의 에이전트를 동원하여 독립적으로 문제를 재현·검증하는 'ultra' 수준의 깊은 검증을 제공하지 않습니다.
- Option C (오답): 동일 세션에서 수동으로 3번 반복 실행하여 공통점만 남기는 방식은 비효율적이며, 에이전트 군단이 독립적으로 이슈를 재현하는 동작 원리를 대체할 수 없습니다.
- Option D (오답): 몇 초 만에 끝나는 빠른 명령어는 클라우드 플릿이 수행하는 수 분간의 독립적 이슈 재현 및 깊은 검증 작업을 동일하게 수행하지 못합니다.

---

### 5번 문제

**1. 문제 원문**

A vendor-contract extraction pipeline must extract both a "start_date" and an "end_date" and ensure the contract term is logically ordered. Occasionally the model extracts an end_date that precedes the start_date even though both individual dates are correctly read from the text. What self-correction design best supports catching and resolving this class of issue?

A) Rely on the JSON schema's type constraints alone, since both fields are already validated as proper date strings anyway

B) Remove the end_date field from the schema so an out-of-order pair can never be produced by the extractor

C) Instruct the model once, in the original prompt, to be careful with dates, and skip any comparison afterward

D) Add an ordering check after extraction, and if end_date precedes start_date, retry with that inconsistency as feedback

---

**2. 구간별 직독직해 번역**

**QUESTION:**
**A vendor-contract extraction pipeline**
공급업체 계약서 추출 파이프라인은

**must extract both**
모두 추출해야 합니다

**a "start_date" and an "end_date"**
"start_date"와 "end_date"를

**and ensure the contract term**
그리고 계약 기간이 ~하도록 보장해야 합니다

**is logically ordered.**
논리적으로 정렬되도록.

**Occasionally the model extracts**
때때로 모델은 추출합니다

**an end_date that precedes**
~보다 앞서는 end_date를

**the start_date**
start_date보다

**even though both individual dates**
두 개별 날짜가 모두 ~함에도 불구하고

**are correctly read**
정확하게 읽혔음에도 불구하고

**from the text.**
텍스트로부터.

**What self-correction design**
어떤 자기 수정(self-correction) 설계가

**best supports catching**
포착하는 것을 가장 잘 지원합니까

**and resolving this class of issue?**
그리고 이러한 종류의 문제를 해결하는 것을?

**Option A:**
**Rely on the JSON schema's**
JSON 스키마의 ~에 의존합니다

**type constraints alone,**
타입 제약 조건에만,

**since both fields**
두 필드가 모두 ~하기 때문에

**are already validated**
이미 검증되었기 때문에

**as proper date strings anyway**
어차피 올바른 날짜 문자열로

**Option B:**
**Remove the end_date field**
end_date 필드를 제거합니다

**from the schema**
스키마에서

**so an out-of-order pair**
순서가 맞지 않는 쌍이 ~하도록

**can never be produced**
절대 생성될 수 없도록

**by the extractor**
추출기에 의해

**Option C:**
**Instruct the model once,**
모델에게 한 번 지시합니다,

**in the original prompt,**
원래 프롬프트에서,

**to be careful with dates,**
날짜에 주의하라고,

**and skip any comparison**
그리고 어떤 비교도 건너끕니다

**afterward**
그 이후에는

**Option D:**
**Add an ordering check**
순서 검사(ordering check)를 추가합니다

**after extraction,**
추출 후에,

**and if end_date precedes start_date,**
그리고 end_date가 start_date보다 앞서면,

**retry with that inconsistency**
해당 불일치를 가지고 재시도합니다

**as feedback**
피드백으로

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Add an ordering check after extraction, and if end_date precedes start_date, retry with that inconsistency as feedback

**정답 및 해설:**

**핵심 개념**: Self-Correction 및 Feedback Loop 패턴
LLM을 사용한 정보 추출 과정에서 개별 필드 포맷(문자열 형태)은 정상이나 필드 간의 논리적 연관성/선후관계(Business Rules/Logic Constraint)가 위반되는 경우가 있습니다. 이를 해결하기 위해 검증 로직(Validation Check)을 통과하지 못할 경우 해당 에러/불일치 내용을 피드백 메시지로 구성하여 모델에게 재요청(Retry)하는 Self-Correction 루프 패턴을 구현합니다.

**문제 상황 분석:**
- 계약서에서 `start_date`와 `end_date`를 각각 유효한 날짜 문자열 형식으로 추출함
- 하지만 논리적으로 `end_date`가 `start_date`보다 이전 날짜로 추출되는 선후관계 오류(out-of-order)가 발생함
- 개별 문자열 타입 검증(JSON Schema)만으로는 날짜 간의 선후관계(비교 논리)를 검증할 수 없음

**D번이 정답인 이유:**
추출된 결과에 대해 코드 수준에서 날짜 순서를 비교 검사(Ordering Check)하고, 만약 `end_date`가 `start_date`보다 빠르다면 "종료일이 시작일보다 빠릅니다"라는 불일치 피드백을 프롬프트에 포함하여 다시 생성하도록 요청(Retry)하는 방식이 전형적이고 가장 효과적인 Self-Correction 메커니즘입니다.

**오답 분석:**

- Option A (오답): JSON 스키마의 타입 제약 조건(`"format": "date"`)은 형식만 검사할 뿐, 두 필드 값 간의 날짜 선후관계 비교 논리를 수행하지 못합니다.
- Option B (오답): 필수 데이터인 `end_date` 필드 자체를 스키마에서 삭제하는 것은 비즈니스 요구사항을 포기하는 잘못된 접근 방식입니다.
- Option C (오답): 프롬프트에 단순히 "날짜에 주의하라"고 지시(Zero-shot warning)하는 것만으로는 비동기적 생성 오류를 완벽히 막을 수 없으며, 후속 검증 과정을 생략하면 환각이나 논리 오류를 잡아낼 수 없습니다.

---

### 6번 문제

**1. 문제 원문**

A team is writing the "critical" severity definition for their review prompt. They want reviewers across the org to converge on the same classification for the same kind of issue. Which definition best supports that goal?

A) Critical: the change introduces a risky pattern that would make an experienced engineer feel uneasy, such as a race condition in a payment processing function that could lead to data inconsistency.

B) Critical: the change allows unauthenticated access to data that should require authorization, for example a removed permission check before a database query that returns another user's records.

C) Critical: the change touches a module that has historically caused many production incidents, for example the user authentication service that had three outages last quarter due to token validation failures.

D) Critical: the change is significantly more complex or harder to reason about than the rest of the surrounding code in the same file, such as a refactored function that now uses deeply nested callbacks that obscure the logic.

---

**2. 구간별 직독직해 번역**

**QUESTION:**
**A team is writing**
한 팀이 작성하고 있습니다

**the "critical" severity definition**
"critical"(심각) 심각도 정의를

**for their review prompt.**
그들의 검토 프롬프트를 위한.

**They want reviewers**
그들은 검토자들이 ~하기를 원합니다

**across the org**
조직 전체의

**to converge on**
하나로 수렴하기를

**the same classification**
동일한 분류로

**for the same kind of issue.**
동일한 종류의 이슈에 대해.

**Which definition**
어떤 정의가

**best supports that goal?**
그 목표를 가장 잘 지원합니까?

**Option A:**
**Critical: the change introduces**
Critical: 변경 사항이 도입함

**a risky pattern**
위험한 패턴을

**that would make**
~하게 만드는

**an experienced engineer**
경험 많은 엔지니어가

**feel uneasy,**
불안함을 느끼게,

**such as a race condition**
경쟁 상태와 같은

**in a payment processing function**
결제 처리 기능 내의

**that could lead to**
~로 이어질 수 있는

**data inconsistency.**
데이터 불일치로.

**Option B:**
**Critical: the change allows**
Critical: 변경 사항이 허용함

**unauthenticated access to data**
데이터에 대한 인증되지 않은 접근을

**that should require authorization,**
권한 부여가 필요한,

**for example a removed permission check**
예를 들어 제거된 권한 검사

**before a database query**
데이터베이스 쿼리 전의

**that returns another user's records.**
다른 사용자의 기록을 반환하는.

**Option C:**
**Critical: the change touches**
Critical: 변경 사항이 다룸

**a module that has historically caused**
역사적으로 일으켰던 모듈을

**many production incidents,**
많은 운영 장애를,

**for example the user authentication service**
예를 들어 사용자 인증 서비스

**that had three outages**
세 번의 중단이 있었던

**last quarter**
지난 분기에

**due to token validation failures.**
토큰 검증 실패로 인해.

**Option D:**
**Critical: the change is**
Critical: 변경 사항이 ~함

**significantly more complex**
현저히 더 복잡하거나

**or harder to reason about**
추론하기 더 어려움

**than the rest of the surrounding code**
주변의 나머지 코드보다

**in the same file,**
동일한 파일 내의,

**such as a refactored function**
리팩토링된 함수와 같은

**that now uses**
이제 사용되는

**deeply nested callbacks**
깊게 중첩된 콜백을

**that obscure the logic.**
로직을 흐리게 만드는.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Critical: the change allows unauthenticated access to data that should require authorization, for example a removed permission check before a database query that returns another user's records.

**정답 및 해설:**

**핵심 개념**: 객관적 기준 제시(Objective Evaluation Criteria) 및 프롬프트 엔지니어링
조직 내 여러 검토자(또는 LLM 에이전트)가 동일한 문제 유형에 대해 동일한 분류 결과로 수렴(converged)하게 하려면, 감정이나 주관적 기준이 아닌 **명확하고 객관적으로 검증 가능한 비즈니스/안전성 위반 기준**을 명시해야 합니다.

**문제 상황 분석:**
- 프롬프트 내에 "Critical"(심각) 단계에 대한 정의를 작성 중임
- 조직 전체의 검토자들이 동일한 문제에 대해 주관적 치우침 없이 똑같이 "Critical"로 분류할 수 있는 명확한 기준이 필요함

**B번이 정답인 이유:**
B번은 "인증이 필요한 데이터에 대한 미인증 접근 허용" 및 "타인 기록을 반환하는 DB 쿼리 전 권한 검사 누락"처럼 **객관적이고 명확하게 판별 가능한 보안 위반 기준**을 제시합니다. 검토자의 경험이나 감정과 상관없이 누구나 동일하게 'Critical'로 판단할 수 있으므로 목표에 가장 적합합니다.

**오답 분석:**

- Option A (오답): "경험 많은 엔지니어가 불안함을 느끼게 만드는(make an experienced engineer feel uneasy)"이라는 표현은 순전히 주관적인 감정에 의존하므로 검토자마다 판단이 크게 달라질 수 있습니다.
- Option C (오답): 모듈의 과거 장애 이력만으로 변경 사항 자체의 심각도를 판단하는 것은 불합리하며, 현재 코드 변경 내용의 본질적 위험도를 반영하지 못합니다.
- Option D (오답): "더 복잡하거나 추론하기 어려움(harder to reason about)" 역시 개인의 역량과 시각에 따라 다르게 느껴지는 주관적인 기준입니다.

---

### 7번 문제

**1. 문제 원문**

A batch processing pipeline must deliver classification results within 36 hours of data ingestion. The pipeline submits jobs to the Anthropic Batches API, which processes each batch in up to 24 hours (worst case). After the API completes, a mandatory 2-hour formatting step runs before the report is finalized. To guarantee the 36-hour deadline even under worst-case API timing, what is the longest allowed interval between consecutive batch submission starts?

A) At least every 12 hours, since ignoring the formatting step and matching half the deadline directly against the processing window is sufficient.

B) At least every 10 hours, since the worst-case wait until the next batch (the interval) plus the 24-hour processing and the 2-hour formatting must not exceed 36 hours.

C) At least every 2 hours, since the formatting step's fixed duration alone should dictate the entire submission cadence regardless of processing time.

D) At least every 14 hours, since the downstream formatting time can be absorbed by shortening the batch's own processing window instead of the cycle interval.

---

**2. 구간별 직독직해 번역**

**QUESTION:**
**A batch processing pipeline**
배치 처리 파이프라인은

**must deliver classification results**
분류 결과를 전달해야 합니다

**within 36 hours**
36시간 이내에

**of data ingestion.**
데이터 수집 후.

**The pipeline submits jobs**
파이프라인은 작업을 제출합니다

**to the Anthropic Batches API,**
Anthropic Batches API로,

**which processes each batch**
각 배치를 처리하는

**in up to 24 hours**
최대 24시간 내에

**(worst case).**
(최악의 경우).

**After the API completes,**
API 처리가 완료된 후,

**a mandatory 2-hour formatting step**
필수적인 2시간의 포맷팅 단계가

**runs**
실행됩니다

**before the report is finalized.**
보고서가 최종 확정되기 전에.

**To guarantee the 36-hour deadline**
36시간의 마감 기한을 보장하기 위해

**even under worst-case API timing,**
최악의 API 타이밍 상황에서도,

**what is the longest allowed interval**
허용되는 가장 긴 간격은 무엇입니까

**between consecutive batch submission starts?**
연속된 배치 제출 시작 시간 사이의?

**Option A:**
**At least every 12 hours,**
최소 12시간마다,

**since ignoring the formatting step**
포맷팅 단계를 무시하고

**and matching half the deadline**
마감 기한의 절반을 맞추는 것이

**directly against the processing window**
처리 시간 창에 직접

**is sufficient.**
충분하기 때문에.

**Option B:**
**At least every 10 hours,**
최소 10시간마다,

**since the worst-case wait**
최악의 대기 시간이

**until the next batch (the interval)**
다음 배치 제출까지의 (배치 제출 간격)

**plus the 24-hour processing**
24시간의 처리 시간 및

**and the 2-hour formatting**
2시간의 포맷팅 시간을 더한 것이

**must not exceed 36 hours.**
36시간을 초과해서는 안 되기 때문에.

**Option C:**
**At least every 2 hours,**
최소 2시간마다,

**since the formatting step's fixed duration alone**
포맷팅 단계의 고정된 소요 시간만이

**should dictate**
결정해야 하기 때문에

**the entire submission cadence**
전체 제출 주기를

**regardless of processing time.**
처리 시간과 상관없이.

**Option D:**
**At least every 14 hours,**
최소 14시간마다,

**since the downstream formatting time**
후속 포맷팅 시간이

**can be absorbed**
흡수될 수 있기 때문에

**by shortening the batch's own processing window**
배치 자체의 처리 시간 창을 줄임으로써

**instead of the cycle interval.**
주기 간격 대신.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: At least every 10 hours, since the worst-case wait until the next batch (the interval) plus the 24-hour processing and the 2-hour formatting must not exceed 36 hours.

**정답 및 해설:**

**핵심 개념**: SLA/SDR 서비스 마감 기한 계산 및 일시적 배치 주기 설계
데이터 수집 후 최종 보고서 완결까지의 총 소요 시간(SLA)은 **[최악의 다음 배치 제출 대기 시간(제출 간격) + Batches API 처리 소요 시간 + 후속 포맷팅 소요 시간]**의 합으로 산출됩니다.

**문제 상황 분석:**
- 데이터 수집 시점부터 보고서 완성까지 허용된 총 SLA 마감 기한 = **36시간**
- Batches API의 최악의 처리 소요 시간 = **24시간**
- API 완료 후 필수 포맷팅 작업 소요 시간 = **2시간**
- 데이터 수집 직후 다음 배치가 제출될 때까지 발생하는 최악의 대기 시간 = **제출 간격($I$)**

**B번이 정답인 이유:**
수집된 데이터가 배치가 막 출발한 직후 들어왔을 때 발생하는 최악의 대기 시간(간격 $I$)을 포함하여 총 소요 시간을 수식으로 세우면 다음과 같습니다.
$$\text{대기 시간}(I) + \text{API 처리}(24\text{시간}) + \text{포맷팅}(2\text{시간}) \le 36\text{시간}$$
$$I + 26 \le 36 \implies I \le 10\text{시간}$$
따라서 최악의 조건에서도 36시간 마감 기한을 완벽히 준수하기 위해서는 배치 제출 시작 간격이 최대 **10시간**(최소 10시간 주기로 실행)을 넘어서는 안 됩니다.

**오답 분석:**

- Option A (오답): 필수 2시간 포맷팅 단계를 무시하고 단순히 36시간의 절반인 12시간으로 산정한 잘못된 계산입니다. ($12 + 24 + 2 = 38\text{시간}$으로 36시간 초과)
- Option C (오답): 포맷팅 소요 시간인 2시간만 기준으로 제출 주기를 정하는 것은 API의 24시간 처리 소요 시간을 고려하지 않은 잘못된 접근법입니다.
- Option D (오답): 외부 Batches API의 최악 처리 시간 창(24시간)은 사용자가 마음대로 줄일 수 없으므로, 후속 포맷팅 시간을 API 처리 창을 줄여서 흡수한다는 설명은 비현실적이며 잘못된 계산입니다. ($14 + 24 + 2 = 40\text{시간}$으로 36시간 초과)

---

### 8번 문제

**1. 문제 원문**

An architect implements verification passes where the reviewer instance labels each finding 'high confidence' or 'low confidence.' A colleague suggests skipping the independent reviewer and instead having the generator self-report confidence on its own perceived flaws. What is the flaw in the colleague's proposal?

A) The generator cannot report confidence levels unless it is also given write access to the codebase, which defeats the purpose of a review-only pass

B) Confidence scores are not a supported output format for any Claude instance, so the generator could not attach a confidence label to its own findings

C) Confidence scoring only works when a single instance reviews a single file, so it cannot be applied across a multi-file change regardless of which instance produces it

D) Self-reported confidence from the generator is produced in the same session that generated the code, so it inherits the same blind spots as self-review

---

**2. 구간별 직독직해 번역**

**QUESTION:**
**An architect implements**
아키텍트가 구현합니다

**verification passes**
검증 단계를

**where the reviewer instance labels**
검토자 인스턴스가 라벨을 붙이는

**each finding**
각 결과에 대해

**'high confidence' or 'low confidence.'**
'높은 신뢰도' 또는 '낮은 신뢰도'라고.

**A colleague suggests**
동료가 제안합니다

**skipping the independent reviewer**
독립적인 검토자를 건너뛰고

**and instead having the generator**
대신 생성기(generator)가 ~하도록 하는 것을

**self-report confidence**
신뢰도를 스스로 보고하도록

**on its own perceived flaws.**
자신이 인지한 결함에 대해.

**What is the flaw**
결함(문제점)은 무엇입니까

**in the colleague's proposal?**
동료의 제안에서?

**Option A:**
**The generator cannot report**
생성기는 보고할 수 없습니다

**confidence levels**
신뢰도 수준을

**unless it is also given**
~가 제공되지 않는 한

**write access to the codebase,**
코드베이스에 대한 쓰기 권한이,

**which defeats the purpose**
이는 목적을 훼손합니다

**of a review-only pass**
검토 전용 단계의

**Option B:**
**Confidence scores are not**
신뢰도 점수는 ~가 아닙니다

**a supported output format**
지원되는 출력 형식이

**for any Claude instance,**
어떤 Claude 인스턴스에 대해서도,

**so the generator could not attach**
따라서 생성기는 첨부할 수 없습니다

**a confidence label**
신뢰도 라벨을

**to its own findings**
자신의 결과에

**Option C:**
**Confidence scoring only works**
신뢰도 점수 측정은 ~에만 작동합니다

**when a single instance**
단일 인스턴스가

**reviews a single file,**
단일 파일을 검토할 때만,

**so it cannot be applied**
따라서 적용될 수 없습니다

**across a multi-file change**
다중 파일 변경 사항 전체에

**regardless of which instance**
어떤 인스턴스가 ~하든 상관없이

**produces it**
것을 생성하든

**Option D:**
**Self-reported confidence**
자발적으로 보고된 신뢰도는

**from the generator**
생성기로부터의

**is produced in the same session**
동일한 세션에서 생성됩니다

**that generated the code,**
코드를 생성한 것과,

**so it inherits**
따라서 물려받습니다

**the same blind spots**
동일한 맹점(blind spots)을

**as self-review**
셀프 리뷰와 같은

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Self-reported confidence from the generator is produced in the same session that generated the code, so it inherits the same blind spots as self-review

**정답 및 해설:**

**핵심 개념**: 생성기-검토자 분리 (Generator-Verifier Separation) 및 셀프 리뷰의 맹점
LLM이나 AI 에이전트 시스템에서 코드를 생성한 동일한 모델/컨텍스트 세션에 스스로 오류 및 신뢰도를 검토하게(Self-review) 하면, 생성 시 발생했던 편향, 잘못된 가정, 착오 등의 맹점(Blind spots)을 그대로 유지한 채 스스로의 오류를 제대로 잡아내지 못합니다. 따라서 효과적인 검증을 위해서는 독자적인 컨텍스트를 가진 별도의 독립된 검토자(Independent Reviewer) 인스턴스를 두어야 합니다.

**문제 상황 분석:**
- 기존 시스템: 독립된 검토자 인스턴스가 생성된 결과물에 대해 높은/낮은 신뢰도 라벨을 부여함
- 동료의 제안: 별도의 검토자를 생략하고, 코드를 만든 생성기(Generator)가 스스로 결함과 신뢰도를 판단하여 보고하게 하자고 제안함
- 질문: 이 제안이 가진 근본적인 논리적 결함/문제점을 묻고 있음

**D번이 정답인 이유:**
코드를 작성한 동일한 세션(생성기)에서 신뢰도를 스스로 평가하게 하면, 코드를 만들 때 가졌던 오개념이나 놓친 조건(Blind spots)을 검증 단계에서도 똑같이 놓치게 됩니다. 이는 자기 검토(Self-review)의 한계를 그대로 답습하므로 검증의 신뢰성을 확보할 수 없습니다.

**오답 분석:**

- Option A (오답): 신뢰도 보고나 검토 작업은 조회/분석 작업이므로 코드베이스에 대한 쓰기 권한(Write access)이 필수 조건이 아닙니다.
- Option B (오답): Claude 인스턴스는 프롬프트 지시나 Structured Outputs(JSON 등)를 통해 신뢰도 점수나 라벨을 얼마든지 생성할 수 있습니다.
- Option C (오답): 신뢰도 측정 기능이 단일 파일 검토 시에만 작동한다는 제한은 기술적으로 존재하지 않으며, 멀티 파일에서도 얼마든지 적용 가능합니다.

---

### 9번 문제

**1. 문제 원문**

A customer-support routing agent must decide, for ambiguous tickets that mention both a billing and a technical keyword, whether to route to the billing queue or the technical queue. The team wants to add examples that will help the agent generalize its judgment to new ambiguous tickets it has not seen before, not just the exact tickets in the examples. What should each example include?

A) A simplified, idealized ticket rather than an actual historical one, chosen because it is easier to parse quickly

B) The full text of the routing policy document, repeated in full once inside each individual example

C) The ticket text and the queue chosen, with no explanation, so the model infers the pattern from repetition

D) The ticket text, the queue chosen, and a short explanation of why it beat the other plausible queue

---

**2. 구간별 직독직해 번역**

**QUESTION:**
**A customer-support routing agent**
고객 지원 라우팅 에이전트는

**must decide,**
결정해야 합니다,

**for ambiguous tickets**
모호한 티켓에 대해

**that mention both**
둘 다 언급하는

**a billing and a technical keyword,**
청구 및 기술 키워드를,

**whether to route**
라우팅할지 여부를

**to the billing queue**
청구 대기열로

**or the technical queue.**
또는 기술 대기열로.

**The team wants to add examples**
팀은 예시를 추가하고자 합니다

**that will help the agent**
에이전트를 도와줄

**generalize its judgment**
판단을 일반화하도록

**to new ambiguous tickets**
새로운 모호한 티켓에

**it has not seen before,**
이전에 본 적 없는,

**not just the exact tickets**
정확히 동일한 티켓뿐만 아니라

**in the examples.**
예시에 있는.

**What should each example include?**
각 예시는 무엇을 포함해야 합니까?

**Option A:**
**A simplified, idealized ticket**
단순화되고 이상적인 티켓

**rather than an actual historical one,**
실제 과거 데이터가 아닌,

**chosen because**
선택된

**it is easier to parse quickly**
빠르게 구문 분석하기 쉽기 때문에

**Option B:**
**The full text of the routing policy document,**
라우팅 정책 문서의 전문,

**repeated in full once**
한 번 전체 반복되는

**inside each individual example**
각 개별 예시 내부마다

**Option C:**
**The ticket text and the queue chosen,**
티켓 텍스트와 선택된 대기열,

**with no explanation,**
설명 없이,

**so the model infers**
모델이 추론하도록

**the pattern from repetition**
반복으로부터 패턴을

**Option D:**
**The ticket text, the queue chosen,**
티켓 텍스트, 선택된 대기열,

**and a short explanation**
그리고 짧은 설명

**of why it beat**
왜 이것이 우위에 섰는지에 대한

**the other plausible queue**
다른 그럴듯한 대기열보다

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: The ticket text, the queue chosen, and a short explanation of why it beat the other plausible queue

**정답 및 해설:**

**핵심 개념**: 생각의 사슬(Chain-of-Thought, CoT) 프롬프팅 및 근거 제공
LLM 프롬프트에 퓨샷(Few-shot) 예시를 제공할 때, 단순한 입·출력(Input-Output) 쌍만 제공하는 것보다 판단의 이유와 논리적 근거(Explanation / Reasoning)를 함께 제공할 때 모델이 경계 조건 및 모호한 상황에 대한 판단 기준을 훨씬 잘 일반화(Generalization)합니다.

**문제 상황 분석:**
- 티켓에 '청구'와 '기술' 키워드가 둘 다 포함되어 있어 라우팅 대상이 모호함
- 단순 예시 암기가 아닌, 보지 못한 새로운 모호한 티켓에 대해서도 올바른 판단을 내리는 일반화(Generalization) 능력이 필요함
- 모호함이 존재하는 두 선택지 중 왜 특정 대기열이 최종 선택되었는지 판단 원리를 전달해야 함

**D번이 정답인 이유:**
티켓 텍스트와 최종 선택된 대기열뿐만 아니라, **"왜 다른 가능한 대기열 대신 이 대기열이 선택되었는지"에 대한 핵심 이유/설명**을 예시에 포함하면 모델은 라우팅 결정 뒤에 숨은 규칙과 상충 해결(Disambiguation) 논리를 학습할 수 있어 새로운 미지의 데이터에 대해 높은 정확도로 판단을 일반화합니다.

**오답 분석:**

- Option A (오답): 너무 지나치게 정제되고 단순화된 이상적 예시는 실제 현업에서 들어오는 복잡하고 모호한 티켓을 처리하는 일반화 능력을 키워주지 못합니다.
- Option B (오답): 각 예시마다 정책 문서 전체를 중복해서 포함하는 것은 문맥 창(Context Window)과 토큰을 심각하게 남용하며 비효율적입니다. (정책 문서는 시스템 프롬프트 상단에 한 번만 작성하는 것이 바람직함)
- Option C (오답): 설명 없는 입출력 조합만 반복 제시하면 복잡하고 경계선에 있는(Edge-case) 모호한 문제에서 모델이 잘못된 패턴이나 표면적인 키워드 매칭만 학습할 위험이 있습니다.

---

### 10번 문제

**1. 문제 원문**

Before submitting 80,000 support tickets to a batch job that extracts structured fields from each one, a team wants to reduce the odds of an expensive resubmission cycle caused by a poorly tuned prompt. What is the most effective step to take first?

A) Submit the full 80,000-ticket batch immediately, since any formatting issues can be caught and corrected once the batch results come back

B) Run the extraction prompt synchronously against a small, representative sample of tickets, refine it until output quality is high, then submit the full 80,000-ticket batch

C) Increase max_tokens across the entire 80,000-ticket batch so that longer completions leave less room for the extraction format to be cut off

D) Split the 80,000 tickets into two batches of equal size submitted back to back, since smaller batches are inherently less likely to contain formatting errors

---

**2. 구간별 직독직해 번역**

**QUESTION:**
**Before submitting**
제출하기 전에

**80,000 support tickets**
80,000개의 지원 티켓을

**to a batch job**
배치 작업에

**that extracts structured fields**
구조화된 필드를 추출하는

**from each one,**
각각으로부터,

**a team wants to reduce**
한 팀이 줄이기를 원합니다

**the odds of an expensive**
비용이 많이 드는 위험을

**resubmission cycle**
재제출 주기의

**caused by a poorly tuned prompt.**
잘못 튜닝된 프롬프트로 인해 발생하는.

**What is the most effective step**
가장 효과적인 단계는 무엇입니까

**to take first?**
먼저 취해야 할?

**Option A:**
**Submit the full 80,000-ticket batch**
전체 80,000개 티켓 배치를 제출합니다

**immediately,**
즉시,

**since any formatting issues**
어떤 포맷팅 문제든 ~하기 때문에

**can be caught and corrected**
포착되고 수정될 수 있기 때문에

**once the batch results come back**
배치 결과가 돌아오면

**Option B:**
**Run the extraction prompt**
추출 프롬프트를 실행합니다

**synchronously**
동기적으로

**against a small, representative sample**
작고 대표적인 샘플에 대해

**of tickets,**
티켓의,

**refine it**
프롬프트를 다듬습니다

**until output quality is high,**
출력 품질이 높아질 때까지,

**then submit**
그 후 제출합니다

**the full 80,000-ticket batch**
전체 80,000개 티켓 배치를

**Option C:**
**Increase max_tokens**
max_tokens를 늘립니다

**across the entire 80,000-ticket batch**
전체 80,000개 티켓 배치 전반에 걸쳐

**so that longer completions**
더 긴 완성이 ~하도록

**leave less room**
여지를 줄이도록

**for the extraction format**
추출 포맷이

**to be cut off**
잘려 나갈

**Option D:**
**Split the 80,000 tickets**
80,000개 티켓을 분할합니다

**into two batches of equal size**
동일한 크기의 두 배치로

**submitted back to back,**
연속해서 제출되는,

**since smaller batches**
더 작은 배치가 ~하기 때문에

**are inherently less likely to contain**
본질적으로 포함할 가능성이 더 적기 때문에

**formatting errors**
포맷팅 오류를

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Run the extraction prompt synchronously against a small, representative sample of tickets, refine it until output quality is high, then submit the full 80,000-ticket batch

**정답 및 해설:**

**핵심 개념**: 프롬프트 검증 및 대규모 배치 처리 모범 사례 (Prompt Evaluation & Batch Validation)
대규모 데이터셋(80,000건 등)을 Batch API로 처리하기 전에, 대표성 있는 소규모 표본(Representative Sample)에 대해 동기식(Synchronous)으로 프롬프트를 테스트 및 다듬는 과정(Iterative Refinement)을 거치는 것이 프롬프트 결함으로 인한 대규모 재처리 비용 및 시간 낭비를 방지하는 표준 모범 사례입니다.

**문제 상황 분석:**
- 80,000건에 달하는 대용량 지원 티켓 데이터셋을 Batch API로 처리하려 함
- 프롬프트 튜닝 미흡 시 전체 데이터셋에 대해 비싼 재처리 비용과 시간이 소요되는 위험이 존재함
- 배치 제출 전 이 리스크를 사전에 예방하기 위한 가장 효과적인 첫 번째 단계를 찾아야 함

**B번이 정답인 이유:**
대규모 배치 작업을 실행하기 전, 대표성을 띤 적은 수의 데이터 샘플을 대상으로 동기식 API 호출을 통해 프롬프트의 출력 품질, 데이터 구조화 형태, 예외 케이스 처리 여부 등을 신속히 검증하고 프롬프트를 수정/개선한 뒤 전체 배치를 실행하는 것이 불필요한 비용 지출을 막는 가장 정석적인 방법입니다.

**오답 분석:**

- Option A (오답): 프롬프트 검증 없이 80,000건 전체를 즉시 제출하는 것은 프롬프트에 오류가 있을 경우 전체 비용을 낭비하고 재작업을 유발하므로 문제의 의도와 정반대되는 접근입니다.
- Option C (오답): `max_tokens`를 무작정 늘리는 것은 토큰 소비량을 증가시킬 뿐, 프롬프트의 지시 불이행이나 파싱/포맷팅 구조 오류 등의 본질적인 프롬프트 품질 문제를 해결해 주지 못합니다.
- Option D (오답): 데이터 크기를 단순히 반으로 나눈다고 해서 검증되지 않은 프롬프트의 포맷팅 오류나 정제되지 않은 지시문 문제가 사라지지 않습니다.

---

### 11번 문제

**1. 문제 원문**

A demand spike causes a submitted batch to reach its 24-hour expiration before a subset of requests could be sent to the model, and those requests come back with an expired result type. The team is not billed for them. What should happen next?

A) Wait for the original batch to automatically requeue the expired requests once demand on the platform decreases, since expired requests remain pending

B) Switch every future submission for this workload to the synchronous Messages API, since an expiration means batch processing cannot handle this workload at all

C) Resubmit the full original batch again in its entirety, since expiration means the whole batch's results were discarded and none of it can be trusted

D) Collect the custom_id values for the expired requests and resubmit only those as a new batch, leaving the already-succeeded requests untouched

---

**2. 구간별 직독직해 번역**

**QUESTION:**
**A demand spike causes**
수요 급증은 발생시킵니다

**a submitted batch**
제출된 배치가

**to reach its 24-hour expiration**
24시간 만료 시간에 도달하도록

**before a subset of requests**
요청의 일부가

**could be sent to the model,**
모델로 전송될 수 있기 전에,

**and those requests come back**
그리고 해당 요청들은 돌아옵니다

**with an expired result type.**
만료된(expired) 결과 타입으로.

**The team is not billed**
팀에게는 청구되지 않습니다

**for them.**
그 요청들에 대해.

**What should happen next?**
다음에 어떤 조치를 취해야 합니까?

**Option A:**
**Wait for the original batch**
원래 배치를 기다립니다

**to automatically requeue**
자동으로 재대기열에 추가하기를

**the expired requests**
만료된 요청들을

**once demand on the platform decreases,**
플랫폼의 수요가 감소하면,

**since expired requests**
만료된 요청은 ~하기 때문에

**remain pending**
보류 상태로 남아있기 때문에

**Option B:**
**Switch every future submission**
향후 모든 제출을 전환합니다

**for this workload**
이 워크로드에 대한

**to the synchronous Messages API,**
동기식 Messages API로,

**since an expiration means**
만료는 ~를 의미하기 때문에

**batch processing cannot handle**
배치 처리가 처리할 수 없음을

**this workload at all**
이 워크로드를 전혀

**Option C:**
**Resubmit the full original batch**
원래 배치 전체를 재제출합니다

**again in its entirety,**
다시 통째로,

**since expiration means**
만료는 ~를 의미하기 때문에

**the whole batch's results**
전체 배치의 결과가

**were discarded**
폐기되었음을

**and none of it can be trusted**
그리고 어떤 것도 신뢰할 수 없음을

**Option D:**
**Collect the custom_id values**
custom_id 값들을 수집합니다

**for the expired requests**
만료된 요청들에 대한

**and resubmit only those**
그리고 그 요청들만 재제출합니다

**as a new batch,**
새로운 배치로,

**leaving the already-succeeded requests**
이미 성공한 요청들은 ~한 채로 남겨두고

**untouched**
건드리지 않은 채로

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Collect the custom_id values for the expired requests and resubmit only those as a new batch, leaving the already-succeeded requests untouched

**정답 및 해설:**

**핵심 개념**: Anthropic Batch API 만료(Expiration) 및 부분 실패 처리
Batch API 작업이 24시간 제한 시간에 도달하여 만료(Expired)되면, 만료되기 직전까지 정상적으로 완료된 요청의 결과는 정상적으로 반환 및 저장됩니다. 시스템은 만료되어 처리되지 못한 요청에 대해서만 `expired` 상태를 반환하며 비용을 청구하지 않습니다. 따라서 전체 배치를 처음부터 재실행할 필요 없이, 만료된 요청만 필터링하여 재제출하는 것이 원칙입니다.

**문제 상황 분석:**
- 일시적인 수요 급증으로 제출된 배치의 일부 요청이 24시간 만료 시간 내에 처리되지 못함
- 성공한 요청들은 이미 처리가 완료되었고, 처리되지 못한 일부 요청만 `expired` 상태로 청구 없이 반환됨
- 이미 성공한 작업 결과를 낭비하지 않고 실패(만료)한 항목만 효율적으로 처리할 대책이 필요함

**D번이 정답인 이유:**
Batch API는 요청마다 고유한 `custom_id`를 부여하여 결과를 식별합니다. 이미 성공한 요청 결과는 그대로 유지 및 활용하고, `expired` 결과 상태를 받은 요청의 `custom_id` 목록만 추출하여 이들만 새로운 배치로 다시 제출(Resubmit)하는 것이 비용과 처리 시간을 최소화하는 가장 효율적이고 올바른 방법입니다.

**오답 분석:**

- Option A (오답): 만료된 배치 및 요청은 최종 종료 상태(Terminal State)가 되므로, 수요가 줄어든다고 해서 시스템이 자동으로 재대기열(Requeue)에 넣어주지 않습니다.
- Option B (오답): 24시간 만료는 트래픽 증가에 따른 일시적 현상이므로 워크로드 전체를 더 비싸고 속도가 제한적인 동기식 API로 전환할 필요가 없습니다.
- Option C (오답): 성공한 요청의 결과는 폐기되지 않고 정상 유지됩니다. 전체 배치를 통째로 재제출하면 이미 성공한 요청까지 중복 실행되어 불필요한 비용과 시간이 발생합니다.

---

### 12번 문제

**1. 문제 원문**

An architect is redesigning review criteria for an internal Claude-based code review agent. The goal is to ensure that critical issues—such as security vulnerabilities and correctness bugs—are never missed, while avoiding noise from subjective preferences. The architect wants to define which issues should always be reported versus always skipped, rather than relying on the model's confidence to decide. Which pair of instructions correctly demonstrates this approach?

A) Report any change that introduces a security vulnerability or a correctness bug that breaks existing behavior; skip formatting preferences and deviations from a file's established local conventions.

B) Report a finding only after a second independent review pass confirms that the first pass's confidence score exceeds a fixed threshold; skip any finding where the passes disagree or the score is not duplicated.

C) Report every change that deviates from the team's officially documented style guide; skip any change the model classifies as a subjective personal taste preference, even if it affects readability.

D) Report any finding where the model's internal confidence score exceeds a fixed threshold of 0.9; skip any finding where the confidence score is below that threshold, treating all categories uniformly.

---

**2. 구간별 직독직해 번역**

**QUESTION:**
**An architect is redesigning**
아키텍트가 재설계하고 있습니다

**review criteria**
검토 기준을

**for an internal Claude-based**
내부 Claude 기반의

**code review agent.**
코드 리뷰 에이전트를 위한.

**The goal is to ensure**
목표는 ~를 보장하는 것입니다

**that critical issues—**
치명적인 이슈가—

**such as security vulnerabilities**
보안 취약점과 같은

**and correctness bugs—**
그리고 정확성 버그와 같은—

**are never missed,**
절대 누락되지 않도록 하는 것,

**while avoiding noise**
잡음(노이즈)을 피하면서

**from subjective preferences.**
주관적인 선호도로 인한.

**The architect wants to define**
아키텍트는 정의하기를 원합니다

**which issues should always be reported**
어떤 이슈가 항상 보고되어야 하는지

**versus always skipped,**
반면에 항상 건너뛰어야 하는지는,

**rather than relying**
의존하기보다

**on the model's confidence to decide.**
결정하기 위해 모델의 신뢰도에.

**Which pair of instructions**
어떤 지침 쌍이

**correctly demonstrates**
정확히 보여줍니까

**this approach?**
이러한 접근 방식을?

**Option A:**
**Report any change**
모든 변경 사항을 보고합니다

**that introduces a security vulnerability**
보안 취약점을 도입하거나

**or a correctness bug**
또는 정확성 버그를 도입하는

**that breaks existing behavior;**
기존 동작을 깨뜨리는;

**skip formatting preferences**
포맷팅 선호도를 건너끕니다

**and deviations**
그리고 벗어난 사항들을

**from a file's established local conventions.**
파일의 기존 로컬 컨벤션으로부터.

**Option B:**
**Report a finding**
결과를 보고합니다

**only after a second independent review pass**
두 번째 독립적인 검토 패스가 ~한 후에만

**confirms that the first pass's**
첫 번째 패스의 ~를 확인한 후에만

**confidence score exceeds**
신뢰도 점수가 초과함을

**a fixed threshold;**
고정된 임계값을;

**skip any finding**
모든 결과를 건너끕니다

**where the passes disagree**
패스가 일치하지 않거나

**or the score is not duplicated.**
점수가 중복(재현)되지 않는 경우.

**Option C:**
**Report every change**
모든 변경 사항을 보고합니다

**that deviates from the team's**
팀의 ~에서 벗어나는

**officially documented style guide;**
공식적으로 문서화된 스타일 가이드에서;

**skip any change**
모든 변경 사항을 건너끕니다

**the model classifies**
모델이 분류하는

**as a subjective personal taste preference,**
주관적인 개인 취향 선호도로,

**even if it affects readability.**
가독성에 영향을 미치더라도.

**Option D:**
**Report any finding**
모든 결과를 보고합니다

**where the model's internal confidence score**
모델의 내부 신뢰도 점수가 ~인 경우

**exceeds a fixed threshold of 0.9;**
0.9라는 고정된 임계값을 초과하는;

**skip any finding**
모든 결과를 건너끕니다

**where the confidence score**
신뢰도 점수가 ~인 경우

**is below that threshold,**
해당 임계값 미만인,

**treating all categories uniformly.**
모든 범주를 동일하게 다루면서.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Report any change that introduces a security vulnerability or a correctness bug that breaks existing behavior; skip formatting preferences and deviations from a file's established local conventions.

**정답 및 해설:**

**핵심 개념**: 명시적 리뷰 카테고리 정의 (Explicit Review Categorization)
AI 코드 리뷰 에이전트를 구축할 때 확률적인 신뢰도 점수(Confidence Score)에 의존하는 대신, **"반드시 보고할 명확한 이슈 항목(보안, 동작 버그)"**과 **"제외할 항목(주관적 스타일, 단순 포맷팅)"**을 프롬프트에 직접 명시적 정책으로 정의하면 노이즈를 효과적으로 줄이고 중요한 이슈의 누락을 막을 수 있습니다.

**문제 상황 분석:**
- 보안 취약점 및 동작 버그와 같은 치명적인 이슈는 절대 누락되지 않아야 함
- 주관적인 선호도나 단순 코딩 스타일로 인한 불필요한 알림(Noise)을 방지하고자 함
- 모델이 계산한 신뢰도 점수에 의존하기보다는, 어떤 이슈를 보고하고 건너뛸지 명시적인 지침 규정을 원함

**A번이 정답인 이유:**
A번 지침은 보고 대상(보안 취약점, 기존 동작을 깨뜨리는 버그)과 스킵 대상(포맷팅 선호도, 로컬 스타일 컨벤션 이탈)을 비즈니스 논리와 명확한 범주로 직접 정의했습니다. 이는 모델의 확률적 신뢰도 점수에 의존하지 않고 리뷰어 에이전트의 판단 기준을 수렴시키는 가장 확실한 프롬프트 구성 방식입니다.

**오답 분석:**

- Option B (오답): 문제가 명시한 "모델의 신뢰도 점수에 의존하지 않는다"는 조건을 위반하고, 신뢰도 점수 및 검토 간 일치 여부에만 판단을 의존하고 있습니다.
- Option C (오답): 주관적 스타일을 줄이는 것이 목적임에도 문서화된 스타일 가이드 위반을 모두 보고하게 하여 오히려 포맷팅 관련 노이즈를 과도하게 발생시킵니다.
- Option D (오답): 문제에서 피하고자 했던 "모델의 내부 신뢰도 점수(0.9 임계값)"에 전적으로 의존하는 방식이므로 조건에 맞지 않습니다.

---

### 13번 문제

**1. 문제 원문**

Per-file passes on two interdependent files each recommend a different fix for what turns out to be the same underlying data-flow issue, and the two recommendations conflict. What architectural step should resolve this rather than picking one per-file recommendation at random?

A) Merging the two files into one before review so a single per-file pass can cover both without needing an integration step

B) A separate cross-file integration pass that examines both files together and produces one recommendation based on the actual data flow

C) Re-running each per-file pass a second time and keeping whichever recommendation is worded with higher confidence language

D) Asking the original generator to arbitrate between the two recommendations, since it has full context on why it wrote the code that way

---

**2. 구간별 직독직해 번역**

**QUESTION:**
**Per-file passes**
파일별 검사가

**on two interdependent files**
상호 의존적인 두 파일에 대한

**each recommend**
각각 권장합니다

**a different fix**
서로 다른 수정안을

**for what turns out to be**
~인 것으로 밝혀진 문제에 대해

**the same underlying data-flow issue,**
동일한 근본적인 데이터 흐름 문제,

**and the two recommendations conflict.**
그리고 두 권장 사항은 충돌합니다.

**What architectural step**
어떤 아키텍처 단계가

**should resolve this**
이것을 해결해야 합니까

**rather than picking**
선택하는 대신

**one per-file recommendation**
하나의 파일별 권장 사항을

**at random?**
무작위로?

**Option A:**
**Merging the two files**
두 파일을 병합하는 것

**into one before review**
검토 전에 하나로

**so a single per-file pass**
단일 파일별 검사가 ~하도록

**can cover both**
둘 다 다룰 수 있도록

**without needing**
필요 없이

**an integration step**
통합 단계가

**Option B:**
**A separate cross-file integration pass**
별도의 교차 파일(Cross-file) 통합 검사

**that examines both files together**
두 파일을 함께 조사하는

**and produces one recommendation**
그리고 하나의 권장 사항을 생성하는

**based on the actual data flow**
실제 데이터 흐름에 기반하여

**Option C:**
**Re-running each per-file pass**
각 파일별 검사를 재실행하는 것

**a second time**
두 번째로

**and keeping whichever recommendation**
그리고 권장 사항을 유지하는 것

**is worded**
표현된

**with higher confidence language**
더 높은 신뢰도의 언어로

**Option D:**
**Asking the original generator**
원래 생성기(Generator)에게 요청하는 것

**to arbitrate**
중재하도록

**between the two recommendations,**
두 권장 사항 사이에서,

**since it has full context**
전체 맥락을 가지고 있기 때문에

**on why it wrote the code**
왜 코드를 작성했는지에 대한

**that way**
그런 방식으로

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: A separate cross-file integration pass that examines both files together and produces one recommendation based on the actual data flow

**정답 및 해설:**

**핵심 개념**: 교차 파일 통합 검사 (Cross-file Integration Pass)
개별 파일(Per-file) 스코프에서 리뷰를 진행하면 전체 시스템이나 모듈 간 연결 고리를 보지 못해 상호 충돌하는 수정안을 제시할 수 있습니다. 상호 의존적인 파일 간 데이터 흐름 문제나 모듈 간 계약 불일치는 여러 파일을 한 번에 종합적으로 분석하는 **교차 파일 통합 검사 단계**를 거쳐 단일하고 일관된 권장안을 도출해야 합니다.

**문제 상황 분석:**
- 상호 의존적인 두 파일에 대해 파일별 개별 검사를 수행함
- 동일한 데이터 흐름 문제에 대해 두 검사 결과가 서로 모순되고 충돌하는 수정안을 제안함
- 개별 검사의 충돌을 무작위로 선택하지 않고 아키텍처적으로 해결할 방안이 필요함

**B번이 정답인 이유:**
개별 파일 수준에서는 각 파일 내부만 보기 때문에 전체 데이터 흐름을 오해하고 충돌하는 수정안을 낼 수 있습니다. 두 파일을 함께 조회하고 전체적인 데이터 흐름을 종합 검토하는 별도의 **교차 파일 통합 검사(Cross-file integration pass)**를 추가하면, 전체 문맥에 부합하는 일관된 단일 솔루션을 제시하여 충돌을 근본적으로 해결할 수 있습니다.

**오답 분석:**

- Option A (오답): 리뷰 검사를 위해 소스 코드 파일 구조 자체를 병합하는 것은 소프트웨어 아키텍처 및 모듈화 원칙을 훼손하는 부적절한 대처 방식입니다.
- Option C (오답): 프롬프트 표현상의 신뢰도 문구(Confidence language) 높낮이로 정답을 선택하는 것은 환각(Hallucination)에 취약하며 정합성을 보장하지 못합니다.
- Option D (오답): 코드를 처음 작성한 생성기 세션은 동일한 맹점(Blind spot)을 가지고 있을 가능성이 높으므로, 충돌하는 리뷰 결과를 객관적으로 중재하는 주체로 적합하지 않습니다.

---

### 14번 문제

**1. 문제 원문**

A reimbursement pipeline extracts a required "project_code" field from scanned expense reports. On one submission, the employee left the project code blank on the physical form, so it does not appear anywhere in the scanned image. After three retries with error feedback, the field is still empty. What should the pipeline do next?

A) Keep retrying while adding progressively more detailed schema instructions about how the project_code field should be structured and formatted

B) Switch to a larger model and resend the identical prompt, expecting greater capability to recover the missing value

C) Increase the sampling temperature on every retry so the model becomes more likely to locate the missing value in the scan

D) Stop retrying and route the record to a human, since the code is genuinely absent from the source rather than a structural failure

---

**2. 구간별 직독직해 번역**

**QUESTION:**
**A reimbursement pipeline extracts**
경비 환급 파이프라인은 추출합니다

**a required "project_code" field**
필수 "project_code" 필드를

**from scanned expense reports.**
스캔된 경비 보고서로부터.

**On one submission,**
한 제출 건에서,

**the employee left**
직원이 남겨두었습니다

**the project code blank**
프로젝트 코드를 빈칸으로

**on the physical form,**
실물 서식 상에,

**so it does not appear**
따라서 나타나지 않습니다

**anywhere in the scanned image.**
스캔된 이미지의 어디에도.

**After three retries**
세 번의 재시도 후에도

**with error feedback,**
에러 피드백을 동반한,

**the field is still empty.**
해당 필드는 여전히 비어 있습니다.

**What should the pipeline do next?**
파이프라인은 다음에 무엇을 해야 합니까?

**Option A:**
**Keep retrying**
계속 재시도합니다

**while adding progressively**
점진적으로 추가하면서

**more detailed schema instructions**
더 상세한 스키마 지침을

**about how the project_code field**
project_code 필드가 어떻게

**should be structured and formatted**
구조화되고 포맷팅되어야 하는지에 대한

**Option B:**
**Switch to a larger model**
더 큰 모델로 전환합니다

**and resend the identical prompt,**
그리고 동일한 프롬프트를 재전송합니다,

**expecting greater capability**
더 뛰어난 능력을 기대하며

**to recover the missing value**
누락된 값을 복구할 수 있는

**Option C:**
**Increase the sampling temperature**
샘플링 온도를 올립니다

**on every retry**
재시도할 때마다

**so the model becomes more likely**
모델이 ~할 가능성이 더 높아지도록

**to locate the missing value**
누락된 값을 찾아낼

**in the scan**
스캔 내에서

**Option D:**
**Stop retrying**
재시도를 중지합니다

**and route the record**
그리고 기록을 라우팅합니다

**to a human,**
사람(담당자)에게,

**since the code is genuinely absent**
코드가 진정으로 존재하지 않기 때문에

**from the source**
원본 문서에

**rather than a structural failure**
구조적 오류라기보다는

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Stop retrying and route the record to a human, since the code is genuinely absent from the source rather than a structural failure

**정답 및 해설:**

**핵심 개념**: 재시도 한계 처리(Retry Limit & Human-in-the-Loop) 및 원본 데이터 부재(Missing Data)
AI 파이프라인 구축 시 추출 실패에 따른 Self-Correction(재시도) 루프는 한계(Maximum Retries)가 있어야 합니다. 에러 피드백을 포함한 재시도 후에도 데이터가 추출되지 않는 이유가 단순 파싱/포맷 오류가 아니라 **원본 데이터 자체의 부재(Genuinely Absent Data)** 때문일 때는, 무한 재시도나 환각(Hallucination) 유발을 막고 수동 검토(Human-in-the-Loop)로 이관해야 합니다.

**문제 상황 분석:**
- 직원 실물 서식에 프로젝트 코드가 누락되어 스캔 이미지에 데이터가 완전히 존재하지 않음
- 에러 피드백을 제공하며 3회 재시도를 수행했으나 필드가 여전히 비어 있음
- 문제 원인이 프롬프트나 스키마 포맷 오류가 아닌, 입력 데이터의 근본적인 부재(Missing Source Data)임

**D번이 정답인 이유:**
원본 데이터 자체가 없어서 발생하는 실패는 프롬프트 수정이나 재시도로 해결할 수 없습니다. 계속 재시도하면 모델이 거짓 데이터를 지어내는 환각(Hallucination) 현상이 발생할 수 있으므로, 재시도를 중단하고 담당자(Human)에게 예외 건으로 라우팅하는 것이 올바른 파이프라인 설계 방식입니다.

**오답 분석:**

- Option A (오답): 원본 이미지에 데이터가 존재하지 않으므로, 스키마 지침을 아무리 구체적으로 다듬어도 데이터가 새로 생겨나지 않습니다.
- Option B (오답): 모델의 크기를 키운다고 해서 존재하지 않는 텍스트를 복구할 수는 없으며, 존재하지 않는 값을 지어낼(환각) 위험만 커집니다.
- Option C (오답): Temperature(온도)를 높이면 모델의 출력 무작위성이 커져 없는 프로젝트 코드를 지어낼 확률만 높아집니다.