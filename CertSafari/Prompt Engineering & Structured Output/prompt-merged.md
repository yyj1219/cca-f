# Prompt Engineering & Structured Output 문제 분석 모음

### 1번 문제

**1. 문제 원문**

A compliance group reviews 15,000 vendor contracts once a week and publishes a findings report two business days later. Cost per document matters because the review runs across the entire vendor catalog every cycle. How should this recurring job be built?

A) Submit the contracts as a single Message Batch each week, since the two-day turnaround comfortably absorbs the batch processing window and the discount lowers per-cycle spend

B) Submit the contracts through the synchronous Messages API one at a time, since compliance findings require the strict ordering only sequential calls preserve

C) Split the contracts across several small Message Batches submitted every few minutes, since batches must stay under a few hundred requests to process reliably

D) Submit the contracts through the synchronous Messages API in parallel threads, since parallel synchronous calls always finish faster than a queued batch job

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

---

### 15번 문제

**문제 원문**

A research-summarization tool extracts source citations from academic papers. Some papers cite sources inline in the body text, e.g., '(Smith, 2019)', while others rely entirely on a numbered bibliography referenced by superscript markers. The tool consistently extracts citations correctly from inline-style papers but frequently returns an empty citation list for bibliography-style papers. What should be added to the prompt to fix this?

A) A preprocessing step that strips all superscript numbers before the document reaches the prompt

B) An example each for inline and bibliography style, showing how a superscript marker traces to its entry

C) An instruction noting that citations may appear either inline in the text or in a numbered bibliography

D) A rule that rejects any paper not using inline citation style, since that format is handled reliably


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: An example each for inline and bibliography style, showing how a superscript marker traces to its entry

**정답 및 해설:**

**핵심 개념**: Few-shot Prompting 및 문맥 추적 능력 강화
LLM이 복잡한 논리적 참조 구조(위첨자 숫자 $\rightarrow$ 참고문헌 목록 항목 매핑)를 이해하지 못할 때는 단순 지시문 추가보다 패턴과 매핑 과정을 보여주는 예시(Few-shot Example)를 제공하는 것이 가장 효과적입니다.

**문제 상황 분석:**
- 모델이 본문 내 텍스트 인용('(Smith, 2019)')은 잘 추출하지만 위첨자 참조 방식에서는 출처를 찾지 못하고 빈 결과를 반환함
- 위첨자 형태의 숫자는 본문의 위치와 문서 하단/끝의 참고문헌 목록 항목 간 추적(tracing) 과정이 필요함
- 단순 설명만으로는 모델이 위첨자와 참고문헌 항목 간의 추적 및 추출 패턴을 명확히 파악하기 어려움

**B번이 정답인 이유:**
Few-shot 퓨샷 프롬프팅 방식을 통해 두 스타일에 대한 구체적인 인풋-아웃풋 예시를 제공하고, 특히 위첨자 표기(예: $^{1}$)가 어떻게 하단의 참고문헌 목록 항목과 연결되어 추출되어야 하는지 시범을 보여주면 LLM의 추론 능력이 크게 향상되어 문제가 정확히 해결됩니다.

**오답 분석:**
- Option A (오답): 위첨자 숫자를 제거해 버리면 참고문헌 목록과 연결할 수 있는 유일한 식별자/고리가 사라지므로 오히려 문제가 악화됩니다.
- Option C (오답): 지시문(Instruction)만 추가하는 방식은 모델이 '위첨자를 참조하여 목록에서 실제 내용을 매핑해 추출하는 복잡한 연쇄 과정'을 수행하도록 강제하기에 부족합니다.
- Option D (오답): 특정 포맷을 사용하는 논문 전체를 거부(Reject)하는 것은 문제를 해결하는 것이 아니라 요구사항을 포기하는 회피책입니다.


---


### 16번 문제

**문제 원문**

An employment-contract extractor pulls a "salary" field that correctly matches its declared numeric type and required-field constraints, but the value is denominated in the wrong currency because the model misread an ambiguous currency symbol on a multi-currency contract. Schema validation passes without complaint. How should this be characterized?

A) As a schema violation that strict tool use should have already prevented from ever reaching the application layer at all

B) As a semantic error outside schema conformance, needing a rule that cross-checks the currency symbol against the number

C) As a token-limit truncation issue that will be resolved by simply increasing max_tokens on the next call made

D) As a refusal, since the model effectively declined to resolve the ambiguous currency symbol on the contract


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: As a semantic error outside schema conformance, needing a rule that cross-checks the currency symbol against the number

**정답 및 해설:**

**핵심 개념**: 스키마 검증(Schema Validation) vs 의미론적 오류(Semantic Error)
스키마 검증은 출력 데이터의 형식(데이터 타입, 필수 입력 여부, 숫자 범위 등)만 확인합니다. 형식이 올바르더라도 데이터의 내용 및 문맥적 의미가 잘못된 경우는 '의미론적 오류(Semantic Error)'에 해당하며, 이는 비즈니스 로직이나 교차 검증 규칙으로 해결해야 합니다.

**문제 상황 분석:**
- 급여(salary) 필드의 데이터 타입(숫자)과 필수 입력 조건 등의 구조적 스키마는 완벽히 준수됨
- 다중 통화 계약서의 모호한 통화 기호로 인해 모델이 잘못된 통화 기준의 값을 추출함
- 구조적 규격은 올바르기 때문에 스키마 검증기(Schema Validator)는 에러 없이 정상 통과함

**B번이 정답인 이유:**
추출된 데이터의 형식적 형태(숫자 타입)는 문제가 없어 스키마 검증을 통과하지만, 실제 의미(잘못된 통화 단위)가 유효하지 않은 전형적인 '의미론적 오류(Semantic Error)'입니다. 스키마 검증만으로는 이를 잡아낼 수 없으므로, 통화 기호와 금액을 상호 대조(Cross-check)하는 별도의 비즈니스 검증 규칙이 추가되어야 합니다.

**오답 분석:**
- Option A (오답): 숫자 형식과 필수 제약 조건이 충족되었으므로 스키마 위반(Schema violation)이 아닙니다.
- Option C (오답): 텍스트가 토큰 길이에 걸려 잘린 것(Truncation)이 아니며, `max_tokens`를 늘려도 모호한 기호의 오해석 문제가 해결되지 않습니다.
- Option D (오답): 모델은 거부(Refusal)하지 않고 요청받은 데이터를 정상적으로 생성했으나, 내용상 잘못된 값을 출력한 것입니다.


---


### 17번 문제

**문제 원문**

A function signature changes in module A, and callers in modules B and C are updated inconsistently, causing a runtime mismatch. Per-file passes each judged their own file correct in isolation and missed the mismatch. Which review step should have caught this, and why?

A) A longer per-file pass that reads both module A and module B together in one sitting rather than as two separate local passes

B) The cross-file integration pass, because it traces data flow and interface usage across files rather than analyzing each file alone

C) A second per-file pass over module A alone, since re-reading the same file twice increases the chance of noticing the signature change

D) The self-review step performed by the generator, since it still remembers why it changed the signature and can check callers from memory


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: The cross-file integration pass, because it traces data flow and interface usage across files rather than analyzing each file alone

**정답 및 해설:**

**핵심 개념**: 파일 간 통합 분석(Cross-file Integration Pass)
코드 검토 및 정적 분석 파이프라인에서 개별 파일 단위 분석(Per-file Pass)은 각 파일 내부의 구문 및 로컬 오류만 검증할 수 있습니다. 모듈 간 모순이나 인터페이스 불일치(Mismatch)는 여러 파일 사이의 인터페이스 호출 관계 및 데이터 흐름을 교차 검증하는 **Cross-file Integration Pass**가 필수적입니다.

**문제 상황 분석:**
- 모듈 A의 함수 시그니처가 변경되었으나, 이를 호출하는 모듈 B와 C가 제대로 반영되지 않음
- 파일 단위(Per-file) 검토 도구들은 각각의 파일 내부 기준(단독 판단)으로는 이상이 없다고 판단함
- 그 결과 파일 간 연동 지점에서 발생하는 런타임 오류(Mismatch)를 놓치게 됨

**B번이 정답인 이유:**
개별 파일만으로는 모듈 A의 변화가 모듈 B와 C에 미치는 파급 효과를 검증할 수 없습니다. 파일을 넘나들며 인터페이스의 호출 상태와 데이터 흐름을 추적(Cross-file tracing)하는 통합 검토 단계(Cross-file integration pass)만이 이러한 멀티 파일 불일치를 정확히 감지할 수 있습니다.

**오답 분석:**
- Option A (오답): 모듈 A와 B만 같이 읽는 것은 여전히 임시방편일 뿐이며, 모듈 C와의 불일치는 놓치게 되고 교차 파일 분석의 정식 메커니즘을 대체하지 못합니다.
- Option C (오답): 모듈 A를 두 번 읽는다고 해서 모듈 B, C에서의 잘못된 호출 방식이 발견되는 것은 아닙니다.
- Option D (오답): 생성기(Generator/LLM)의 메모리나 맥락에 의존하는 자체 검토는 환각(Hallucination)이나 컨텍스트 유실로 인해 신뢰할 수 없으며, 명확한 파일 간 교차 분석 단계가 요구됩니다.


---


### 18번 문제

**문제 원문**

A content-moderation prompt must decide whether borderline posts (e.g., dark sarcasm about a sensitive topic) should be escalated for human review or allowed to stand. The instructions describe general moderation policy, but the model's escalation decisions on borderline posts are inconsistent between similar sessions. The team wants to add a small number of examples that will generalize well. Which set of examples would be most effective?

A) Two to four borderline posts, each paired with the escalation decision and a brief rationale for it

B) One example of the single most extreme violation the team has ever seen, as a strong anchor

C) A restated summary of the moderation policy, broken into a numbered checklist instead of paragraphs

D) Ten or more posts that are obviously fine, giving the model abundant precedent for the common case


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Two to four borderline posts, each paired with the escalation decision and a brief rationale for it

**정답 및 해설:**

**핵심 개념**: CoT(Chain-of-Thought)를 결합한 Few-shot Prompting
LLM이 애매한 경계선 사례(Borderline case)를 일관되게 판단하도록 만들려면 단순히 결과만 제시하기보다, **판단 결과와 그 이유(Rationale)**를 함께 보여주는 퓨샷 예시를 구성해야 모델이 판정의 논리를 학습하고 일반화할 수 있습니다.

**문제 상황 분석:**
- 일반적인 정책 지시문은 존재하지만 모호한 경계선 사례에서 판단 불일치(Inconsistency)가 발생함
- 일반화(Generalization)가 잘 되는 소수의 예시를 프롬프트에 추가하고자 함
- 판단 기준을 명확히 제시해 모델의 추론 방향을 고정하는 기법이 필요함

**A번이 정답인 이유:**
경계선에 위치한 실제 사례 2~4개와 함께 '이관 여부' 및 '그렇게 판단한 짧은 근거(Rationale)'를 쌍으로 제공하면, 모델은 단순 패턴 기억을 넘어 **어떤 기준으로 경계선을 구분하는지** 추론 방식(Chain-of-Thought)을 학습하게 됩니다. 이는 유사한 새로운 사례에도 우수한 일반화 성능을 보여줍니다.

**오답 분석:**
- Option B (오답): 극단적인 위반 사례 1개는 경계선(Borderline)에 있는 애매한 게시물을 판별하는 데 아무런 도움이 되지 못합니다.
- Option C (오답): 정책을 체크리스트 형태의 지시문으로 바꾸는 것은 예시(Examples)가 아니며, 이미 일반 규칙만으로 판단에 실패하고 있는 상태이므로 예시 제공이 필수적입니다.
- Option D (오답): 명백히 문제가 없는 일반적인 게시물 예시는 경계선 사례의 엄격한 판별 기준을 세우는 데 도움을 주지 못합니다.


---


### 19번 문제

**문제 원문**

A data pipeline promises stakeholders that classification results for any document will be delivered no later than 48 hours after ingestion. The team plans to route documents through the Message Batches API, which can take up to 24 hours to finish a batch. What is the longest interval the team can wait between batch submission cycles while still meeting the 48-hour promise?

A) 6 hours between submissions, since frequent small batches always complete faster than the standard 24-hour processing window allows

B) 48 hours between submissions, since the deadline itself defines how rarely the pipeline needs to kick off a new batch cycle

C) 12 hours between submissions, since halving the processing window doubles the safety margin the pipeline needs against demand spikes

D) 24 hours between submissions, since a document waiting the full interval still finishes within the 24-hour batch window before the 48-hour deadline


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: 24 hours between submissions, since a document waiting the full interval still finishes within the 24-hour batch window before the 48-hour deadline

**정답 및 해설:**

**핵심 개념**: 최악의 상황(Worst-case Scenario) 대기 시간 계산
전체 허용 처리 시간 SLA(Service Level Agreement)가 $T_{\text{total}}$이고 배치 실행 시 최장 소요 시간이 $T_{\text{execution}}$일 때, 문서가 수집된 후 배치 제출까지 대기할 수 있는 최장 간격 $T_{\text{interval}}$은 $T_{\text{total}} - T_{\text{execution}}$ 공식으로 계산됩니다.

**문제 상황 분석:**
- 전체 약속된 마감 시간(SLA): 수집 후 최대 48시간
- 배치 처리 최장 소요 시간: 최대 24시간
- 어떤 문서가 들어온 직후 이전 배치가 제출되어, 다음 배치 제출까지 전체 간격을 기다려야 하는 최악의 상황(Worst-case)을 고려해야 함

**D번이 정답인 이유:**
문서가 수집된 직후 다음 배치 제출까지 최장 간격인 24시간을 대기하더라도, 그 후 배치가 제출되어 실행 완결까지 최장 24시간이 걸리면 총 소요 시간은 $24\text{시간 (대기)} + 24\text{시간 (처리)} = 48\text{시간}$이 됩니다. 따라서 48시간 약속을 완벽히 준수할 수 있는 가장 긴 배치 제출 주기 간격은 **24시간**입니다.

**오답 분석:**
- Option A (오답): 6시간은 48시간 조건을 충족하지만 "가장 긴 간격(longest interval)"이 아닙니다. 또한 '작은 배치가 항상 더 빠르다'는 전제도 보장되지 않습니다.
- Option B (오답): 48시간 간격으로 제출할 경우, 배치가 제출된 후 실행 시간(최대 24시간)이 추가되어 총 소요 시간이 최대 72시간이 될 수 있어 마감일을 위배합니다.
- Option C (오답): 12시간 역시 약속을 충족하지만, 24시간이라는 더 길면서 유효한 제출 간격이 존재하므로 최장 간격이 아닙니다.


---


### 20번 문제

**문제 원문**

A team already tried adding "only report issues you are confident about" to a noisy category and saw no improvement in precision. An architect now wants to redesign the category's scope entirely rather than continuing to tune confidence language. Which redesign reflects the correct lesson from the earlier failed attempt?

A) Rephrase the same confidence instruction using stronger emphasis, such as capitalizing key words, so the model treats the requirement as a stricter constraint.

B) Keep the confidence instruction but add a numeric percentage threshold to it, so the model has a specific number to compare its confidence against.

C) Replace the confidence instruction with a list of the specific issue types that qualify for this category, and explicitly state which related issue types should be skipped.

D) Move the confidence instruction from the system prompt into the user message instead, on the assumption that message placement was the reason it had no effect.


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Replace the confidence instruction with a list of the specific issue types that qualify for this category, and explicitly state which related issue types should be skipped.

**정답 및 해설:**

**핵심 개념**: 모호한 신뢰도 지시어(Confidence Language) 지양 및 구체적 범주화(Explicit Scoping)
LLM에게 "자신 있는 문제만 보고해라" 또는 "확신률 80% 이상만 출력해라" 같은 주관적/모호한 지시어(Confidence Language)는 모델의 교정(Calibration) 능력 한계로 인해 정밀도 향상에 거의 기여하지 못합니다. 정밀도를 높이기 위해서는 분류 기준과 제외 기준을 구체적이고 명확한 규칙(Inclusion/Exclusion criteria)으로 프롬프트에 명시해야 합니다.

**문제 상황 분석:**
- 노이즈(False Positive)가 많이 발생하는 카테고리를 정제하기 위해 "확신하는 것만 보고하라"는 지시를 추가했으나 정밀도가 개선되지 않음
- 모델에게 신뢰도에 대한 주관적 판단을 맡기는 문구(Confidence language)는 효과가 없음이 증명됨
- 카테고리의 범주(Scope) 자체를 명확히 재설계하여 근본적인 노이즈를 줄여야 하는 상황임

**C번이 정답인 이유:**
이전 실패의 핵심 교훈은 '모델에게 자율적인 신뢰도 판단을 맡기면 안 된다'는 점입니다. 따라서 모호한 신뢰도 문구를 완전히 제거하고, 이 카테고리에 정확히 해당하는 이슈 유형(Inclusion)과 제외해야 할 유사 이슈 유형(Exclusion)의 목록을 명시적으로 프롬프트에 정의해 주는 것이 가장 확실한 재설계 방안입니다.

**오답 분석:**
- Option A (오답): 단어를 대문자로 강조하는 등 표현을 강하게 바꾸는 방식 역시 여전히 모호한 '신뢰도 지시어' 범주에 머물러 있으므로 실패를 되풀이하게 됩니다.
- Option B (오답): "80% 이상"과 같이 수치화된 백분율을 제시해도, LLM 내부에서 이를 객관적으로 산출하고 비교하는 메커니즘이 없으므로 모호성이 해결되지 않습니다.
- Option D (오답): 메시지의 위치(시스템 프롬프트 vs 사용자 메시지)를 바꾸는 것은 지시어 자체가 가진 주관성과 모호함이라는 근본 원인을 해결하지 못합니다.


---


### 21번 문제

**문제 원문**

A financial-reconciliation pipeline retries an extraction ten times because the extracted transaction list never sums to the extracted statement total. Investigation reveals that the bank statement itself contains a genuine arithmetic error introduced by the issuing bank. What should the pipeline do once this is discovered?

A) Stop retrying, since the mismatch comes from an inconsistency in the source rather than a correctable extraction mistake

B) Continue retrying indefinitely, since enough attempts will eventually make the model's numbers sum correctly overall anyway

C) Switch the extraction schema to omit the statement total field so this mismatch can no longer be detected

D) Increase max_tokens on every retry, assuming the mismatch is caused by truncation before the total was written


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Stop retrying, since the mismatch comes from an inconsistency in the source rather than a correctable extraction mistake

**정답 및 해설:**

**핵심 개념**: 재시도 루프(Retry Loop)의 한계와 원본 데이터 오류(Source Data Error)
LLM 파이프라인의 재시도(Retry) 메커니즘은 추출 과정에서 발생하는 환각이나 일시적인 생성 오류를 바로잡기 위한 것입니다. 원본 문서(Source Document) 자체에 오류가 존재하는 경우, 아무리 재시도를 하더라도 모델이 정확한 추출을 수행하는 한 불일치는 결코 해결되지 않습니다.

**문제 상황 분석:**
- 추출된 거래 목록의 합계와 내역서 총액이 일치하지 않아 파이프라인이 10회 재시도를 수행함
- 원인 조사 결과, 추출 오류가 아니라 발급 은행이 작성한 원본 문서 자체에 산술 오류가 있음이 확인됨
- 모델은 원본에 기재된 숫자를 올바르게 추출하고 있으나, 원본 데이터 간의 비일관성으로 인해 검증을 통과하지 못함

**A번이 정답인 이유:**
불일치의 원인이 모델의 추출 실수가 아닌 원본 데이터의 결함(Inconsistency in the source) 때문이므로, 재시도를 반복하는 것은 컴퓨팅 자원과 비용만 낭비하게 됩니다. 따라서 즉시 재시도를 중단하고 이 오류를 원본 데이터 문제로 처리(예: 예외 처리 또는 담당자 검토로 전환)해야 합니다.

**오답 분석:**
- Option B (오답): 원본 데이터가 잘못되었는데 재시도를 계속하여 합계가 맞도록 만드는 것은, 모델에게 원본과 다른 거짓 데이터(환각)를 생성하도록 유도하는 잘못된 행위입니다.
- Option C (오답): 불일치를 감지하지 못하도록 스키마에서 총액 필드를 삭제하는 것은 데이터 검증 파이프라인의 목적 자체를 무력화하는 무책임한 방식입니다.
- Option D (오답): 출력 토큰 제한에 걸려 데이터가 잘린 것이 아니므로 `max_tokens`를 늘리는 것은 문제의 원인과 무관합니다.


---


### 22번 문제

**문제 원문**

A tax-document extractor needs a dependent's Social Security number, but the field has been physically redacted with a black marker on the scanned form supplied to the pipeline. Repeated retries with detailed error feedback still return an empty field. What does this situation illustrate?

A) A prompt-caching issue where the redacted value was cached in a prior turn and needs to be evicted before retrying

B) A limit of retries: when required information is genuinely absent from the source, feedback retries cannot recover it

C) A tool-input validation failure that will resolve itself once the model is given a strict schema for the SSN field

D) A schema syntax error that structured output enforcement should have already eliminated before it reached this layer entirely


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: A limit of retries: when required information is genuinely absent from the source, feedback retries cannot recover it

**정답 및 해설:**

**핵심 개념**: 재시도(Retry) 메커니즘의 한계와 데이터 부재(Absence of Data)
재시도 및 피드백 루프는 모델의 일시적 단순 실수나 형식을 바로잡는 데 효과적이지만, 원본 입력 데이터(Source Input) 자체에 정보가 존재하지 않는 물리적 결함 상태에서는 아무리 피드백을 주며 재시도를 거듭하더라도 없는 데이터를 만들어낼 수 없습니다.

**문제 상황 분석:**
- 스캔된 양식에서 사회보장번호(SSN)가 검은 마커로 가려져(redacted) 원본 문서에 물리적으로 정보가 존재하지 않음
- 파이프라인이 에러 피드백을 주며 재시도를 반복했으나 여전히 빈 값을 출력함
- 정보 자체가 입력값에 없으므로 재시도 루프가 무의미하게 반복되는 전형적인 상황임

**B번이 정답인 이유:**
원본 소스 문서에 필요한 정보가 근본적으로 존재하지 않는 경우(genuinely absent), 아무리 오류 피드백과 함께 재시도를 보낸다 한들 존재하지 않는 정보를 복구할 수는 없습니다. 이는 재시도 패턴이 해결할 수 없는 명확한 시스템적 한계를 보여주는 사례입니다.

**오답 분석:**
- Option A (오답): 프롬프트 캐싱의 캐시 만료/삭제(Eviction) 문제가 아니라, 입력 이미지 데이터 자체에 값이 존재하지 않는 문제입니다.
- Option C (오답): 엄격한 스키마를 부여한다 해도 원본에 가려진 숫자를 읽어낼 수는 없으므로 도구 입력 검증 문제가 아닙니다.
- Option D (오답): 스키마의 구문 에러(Syntax error)가 아니라, 추출 대상 정보의 부재로 인한 콘텐츠 수준의 한계입니다.


---


### 23번 문제

**문제 원문**

A QA team wants to generate new regression test cases for 40,000 legacy modules once per night. No developer is waiting on the output, and the team only needs the results within 24 hours for review the following day. Cost efficiency is a priority. Which approach best fits this workload?

A) The synchronous Messages API, since nightly jobs should minimize total wall-clock time by streaming each response as soon as it is generated.

B) The Message Batches API, since the workload is latency-tolerant and the 50% cost discount scales well across 40,000 requests, while the 24-hour SLA fits the team's deadline.

C) The Message Batches API, since batching is required whenever a job processes more than a few hundred requests in one run.

D) The synchronous Messages API, since running each request in sequence guarantees every test case is ready before the night's job window closes.


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: The Message Batches API, since the workload is latency-tolerant and the 50% cost discount scales well across 40,000 requests, while the 24-hour SLA fits the team's deadline.

**정답 및 해설:**

**핵심 개념**: Message Batches API & 비용 최적화(Cost Optimization)
Message Batches API는 지연 시간에 민감하지 않은(Latency-tolerant) 비동기 대량 작업에 최적화되어 있으며, 24시간 이내의 처리 SLA 조건으로 기존 동기식 API 대비 **50%의 비용 할인**을 제공합니다.

**문제 상황 분석:**
- 매일 밤 40,000개의 대량 모듈에 대한 테스트 케이스를 생성해야함
- 결과를 즉시 기다리는 개발자가 없으며, 다음 날 검토를 위한 24시간 이내의 처리 시간이 허용됨 (Latency-tolerant)
- 최우선 고려 요구사항은 '비용 효율성(Cost efficiency)'임

**B번이 정답인 이유:**
요청 건수가 40,000건으로 매우 크고, 즉각적인 응답이 필요 없는 비동기 작업이므로 Message Batches API가 완벽히 들어맞습니다. 24시간 내 처리 SLA가 팀의 요구사항(24시간 내 결과 필요)과 일치하며, 50% 할인 혜택을 통해 대규모 작업의 비용을 대폭 절감할 수 있습니다.

**오답 분석:**
- Option A (오답): 실시간 응답이 필요하지 않은 야간 작업에 동기식(Synchronous) API를 사용하면 비용 절감 기회를 놓치게 됩니다.
- Option C (오답): 배치 처리(Batching)가 수백 건 이상일 때 '의무/필수(Required)'로 강제되는 제약 조건은 존재하지 않습니다. 선택의 핵심 기준은 지연 허용 여부와 비용 할인입니다.
- Option D (오답): 40,000개의 요청을 동기식으로 순차 실행(In sequence)하면 엄청난 시간이 소요될 뿐만 아니라 네트워크 타임아웃 및 높은 비용 문제를 야기합니다.


---


### 24번 문제

**문제 원문**

A financial services firm uses a tool-based schema to extract transaction records from PDF statements, including a required amount field and a required transaction_type field. An audit later finds several instances where deposits were mislabeled as withdrawals, even though every amount and transaction_type field is present and passes schema validation. What does this best illustrate about JSON schema enforcement via tool use?

A) Schema validation confirms that required fields exist and have the correct types but it cannot verify that the values are semantically correct relative to the source document, so mislabeling errors like this can still occur.

B) This indicates that the input_schema was likely malformed, since a correctly constructed JSON schema can apply constraints that verify the relationship between amount and transaction_type, preventing such semantic mislabeling.

C) This is expected only when strict mode is disabled, because strict mode enforces that field values must satisfy the schema's semantic rules, such as ensuring transaction_type accurately reflects the amount sign, thereby preventing mislabeling.

D) The mislabeling proves that without a tool_choice that forces a specific tool invocation, the model may output transaction_type labels that diverge from the source document's content, leading to semantic inaccuracies in the extracted data.


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Schema validation confirms that required fields exist and have the correct types but it cannot verify that the values are semantically correct relative to the source document, so mislabeling errors like this can still occur.

**정답 및 해설:**

**핵심 개념**: 구문/구조 검증(Schema Validation) vs 의미론적 정확성(Semantic Accuracy)
JSON 스키마 검증은 출력 데이터의 구조적 구격(필수 필드 존재 여부, 데이터 타입, 허용된 enum 값 등)만 판별합니다. 추출된 데이터가 원본 문서의 실제 내용과 부합하는지 여부(의미론적 정확성)는 스키마 검증 범위 밖의 영역입니다.

**문제 상황 분석:**
- 필수 필드인 `amount`와 `transaction_type`이 모두 존재함
- 데이터 타입과 스키마 규칙을 충족하여 JSON Schema Validation을 에러 없이 통과함
- 하지만 원본 문서의 '입금(deposit)' 데이터가 모델에 의해 '출금(withdrawal)'으로 잘못 판독되어 추출됨

**A번이 정답인 이유:**
스키마 검증은 필드가 존재하는지, 해당 필드가 지정된 유형(예: string, number 등)에 맞는지만 체크합니다. 스키마 자체는 모델이 원본 PDF 문서를 제대로 해석하여 의미적으로 옳은 값(deposit vs withdrawal)을 추출했는지 검증할 수 없으므로, 이러한 의미론적 오라벨링(Semantic mislabeling) 오류는 스키마 통과 여부와 상관없이 발생할 수 있습니다.

**오답 분석:**
- Option B (오답): JSON 스키마는 데이터 구조적 제약을 다룰 뿐, 원본 문서 텍스트와 추출값 간의 정황상 의미적 타당성 관계까지 검증할 수 없습니다.
- Option C (오답): 스키마의 `strict mode`는 필드 누락 방지 및 정해진 스키마 구조의 엄격한 준수(구조적 강제)를 의미하며, 원본 대비 의미적 실수를 교정해 주는 기능이 아닙니다.
- Option D (오답): `tool_choice`는 도구 호출 자체를 강제하는 옵션일 뿐, 호출된 도구 내부 인자 값의 내용적 정확성을 보장하는 기능이 아닙니다.


---


### 25번 문제

**문제 원문**

A refactor touches 60 files. A single reviewer instance given the entire diff at once produces contradictory findings between files. What change to the review architecture best addresses this?

A) Ask the generator to make smaller, sequential commits, and review only the most recent commit in full each time

B) Run the same single reviewer instance twice over the full diff, and keep only findings that appear in both runs

C) Give the single reviewer instance a much larger context window so it can hold the whole diff in memory during one pass

D) Split the review into per-file passes for local issues, plus an integration pass for cross-file consistency


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Split the review into per-file passes for local issues, plus an integration pass for cross-file consistency

**정답 및 해설:**

**핵심 개념**: 분할 정복 검토 아키텍처(Divide-and-Conquer Review Architecture)
대규모 변경 사항(60개 파일)을 단일 모델 호출로 한 번에 처리하려고 하면 Attention 분산, 컨텍스트 과부하 및 주의력 저하 현상으로 인해 파일 간 모순(Contradictory findings)이나 환각이 발생합니다. 이를 방지하려면 파일별 개별 검토(Per-file passes)와 전체 일관성을 확인하는 통합 검토(Integration pass)로 역할을 계층화해야 합니다.

**문제 상황 분석:**
- 60개 파일에 달하는 대규모 리팩토링 변경 사항이 발생함
- 단일 LLM 인스턴스에 전체 diff를 한 번에 입력하자 파일 간 서로 모순되는 검토 결과가 출력됨
- 컨텍스트 과부하로 인해 모델이 전체 코드베이스의 일관성과 개별 파일의 정교함을 동시에 유지하지 못함

**D번이 정답인 이유:**
검토 프로세스를 2단계 분할 방식(Map-Reduce 형태)으로 전환하는 것이 가장 효과적입니다. 1단계로 각 파일의 단독 오류(Syntax, local logic)를 개별적으로 검토(Per-file passes)하여 집중도를 높이고, 2단계로 파일 간 인터페이스 및 호출 일관성을 검증하는 통합 단계(Integration pass)를 수행하면 모순된 결과를 없애고 정확도를 극대화할 수 있습니다.

**오답 분석:**
- Option A (오답): 가장 최근 커밋만 검토하면 이전 커밋에서 발생한 누적 변경 사항이나 파일 간 연동 오류를 놓치게 됩니다.
- Option B (오답): 동일한 전체 diff를 두 번 실행해도 컨텍스트 과부하라는 근본 원인이 해결되지 않아 두 번 모두 잘못되거나 무작위적인 결과가 나올 수 있습니다.
- Option C (오답): 단순히 컨텍스트 윈도우 크기를 늘리는 것은 모델의 주의력 집중(Needle in a haystack / Lost in the middle) 문제를 근본적으로 해결하지 못하며, 여전히 파일 간 모순이 발생할 확률이 높습니다.


---


### 26번 문제

**문제 원문**

An agent has both a search_docs tool and a search_code tool available. For requests that could plausibly be answered by either tool, such as 'where is the rate limit defined,' the agent picks inconsistently between them across similar sessions. The team wants the agent to make a consistent, well-reasoned choice for this class of ambiguous request. What is the most effective change?

A) Expand each tool's natural-language description with more adjectives that characterize its typical use cases.

B) Provide `input_examples` in the tool definitions that demonstrate for the same ambiguous request which tool should be selected and why.

C) Rename the two tools to be more visually distinct (e.g., `docs_lookup` and `code_search`) to reduce the chance of confusion.

D) Add a routing step that always calls search_docs first and only falls back to search_code if no results are returned.


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Provide `input_examples` in the tool definitions that demonstrate for the same ambiguous request which tool should be selected and why.

**정답 및 해설:**

**핵심 개념**: 도구 정의 내 Few-shot 예시(`input_examples`) 및 근거 제시
LLM 에이전트가 유사하거나 모호한 도구(Tool)들 사이에서 선택을 머뭇거리거나 비일관된 결정을 내릴 때, 구체적인 요청 예시와 함께 **선택 기준 및 근거(Rationale)**를 명시한 `input_examples`를 도구 정의(Tool Definition)에 포함시키는 것이 가장 명확하고 일관된 라우팅 행동을 유도합니다.

**문제 상황 분석:**
- 에이전트가 `search_docs`와 `search_code`라는 두 개의 유사 도구를 모두 보유함
- "속도 제한이 어디에 정의되어 있는가"처럼 두 도구 모두 처리할 수 있는 모호한 요청에 대해 세션마다 비일관적으로 도구를 선택함
- 팀은 이러한 모호한 요청 유형에 대해 에이전트가 일관되고 근거 있는 선택을 내리도록 개선하고자 함

**B번이 정답인 이유:**
도구 정의(Tool definition) 내에 `input_examples`를 추가하여 모호한 요청이 들어왔을 때 어떤 도구가 선택되어야 하며 그 이유(Why)가 무엇인지 시범 예시로 보여주면, 모델은 모호한 문맥 상황에서의 라우팅 판단 기준을 명확하게 학습하게 됩니다. 이는 유사 세션 간 의사결정의 일관성을 크게 향상시킵니다.

**오답 분석:**
- Option A (오답): 서술적 형용사를 많이 추가하는 것은 오히려 도구 설명(Description)을 장황하게 만들어 모델의 모호성 해소에 도움을 주지 못합니다.
- Option C (오답): 도구 이름을 명확하게 바꾸는 것은 도움이 될 수 있으나, 이미 `search_docs`와 `search_code`로 충분히 구별되는 이름이며, 이름 변경만으로는 모호한 질문('속도 제한 정의 위치')의 문맥적 라우팅 기준을 잡아주지 못합니다.
- Option D (오답): 항상 `search_docs`를 먼저 호출하게 강제하는 하드코딩 라우팅은 에이전트의 유연한 추론을 제한하며, 코드 검색이 더 적합한 상황에서도 불필요한 도구 호출 및 지연 시간을 유발합니다.


---


### 27번 문제

**문제 원문**

A customer-support routing agent must decide, for ambiguous tickets that mention both a billing and a technical keyword, whether to route to the billing queue or the technical queue. The team wants to add examples that will help the agent generalize its judgment to new ambiguous tickets it has not seen before, not just the exact tickets in the examples. What should each example include?

A) The full text of the routing policy document, repeated in full once inside each individual example

B) The ticket text, the queue chosen, and a short explanation of why it beat the other plausible queue

C) The ticket text and the queue chosen, with no explanation, so the model infers the pattern from repetition

D) A simplified, idealized ticket rather than an actual historical one, chosen because it is easier to parse quickly


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: The ticket text, the queue chosen, and a short explanation of why it beat the other plausible queue

**정답 및 해설:**

**핵심 개념**: CoT(Chain-of-Thought) 퓨샷 프롬프팅 및 근거 제공(Reasoning in Few-Shot Examples)
두 가지 이상의 해석이 가능한 모호한(Ambiguous) 문제 상황에서 LLM이 일반화된 판단력을 갖추도록 하려면, 단순히 입력과 최종 라벨(정답)만 제시하는 것보다 **결정의 원인과 근거(Rationale)**를 함께 보여주는 CoT 형태의 퓨샷 예시를 구성해야 합니다.

**문제 상황 분석:**
- 티켓에 결제(Billing)와 기술(Technical) 키워드가 모두 포함되어 라우팅 기준이 모호함
- 단순히 예시에 있는 정확한 티켓만 처리하는 것이 아니라, 처음 보는 모호한 티켓에도 판단력을 적용(Generalize)할 수 있어야 함
- 모델이 모호함을 해결하는 의사결정 추론 규칙을 학습하도록 프롬프트 예시를 설계해야함

**B번이 정답인 이유:**
입력 데이터(티켓 텍스트)와 최종 선택(대기열), 그리고 **"왜 다른 대기열 대신 이 대기열을 선택했는지"에 대한 이유/근거(Explanation)**를 제공하면, 모델은 단순 키워드 매칭을 넘어 경계선 판단 기준(의사결정 논리)을 학습합니다. 이를 통해 새로운 모호한 입력이 들어왔을 때도 근거에 기반하여 정확하게 일반화된 판단을 내릴 수 있습니다.

**오답 분석:**
- Option A (오답): 각 예시마다 동일한 전체 정책 문서를 반복적으로 넣는 것은 토큰을 크게 낭비하며, 예시를 통한 일반화 추론 효과를 주지 못합니다.
- Option C (오답): 설명 없이 입력과 라벨만 반복하면 모호한 조건에서 모델이 겉보기 패턴만 학습하거나 환각/비일관적 추론을 하게 됩니다.
- Option D (오답): 지나치게 단순화되고 이상적인 예시는 노이즈와 복잡성이 존재하는 실제 환경의 모호한 티켓 처리 능력을 키워주지 못합니다.


---


### 28번 문제

**문제 원문**

A team building a code-review assistant is deciding how granular to make the detected_pattern field on each structured finding. One option records only a broad category like "security" for every finding; another records the specific triggering construct, such as the exact function name, decorator, or regex rule that fired. Which choice better supports long-term analysis of developer dismissal patterns?

A) Neither option matters much, since dismissal rates should be analyzed through the severity field instead

B) The specific-construct option, since it lets the team isolate which exact rule causes a high dismissal rate and tune it

C) The broad-category option, since recording specific constructs would expose proprietary rule names to the team

D) The broad-category option, since fewer distinct values are easier for a dashboard to render without extra grouping logic


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: The specific-construct option, since it lets the team isolate which exact rule causes a high dismissal rate and tune it

**정답 및 해설:**

**핵심 개념**: 세분화된 메타데이터(Granular Metadata) 및 오탐(False Positive) 튜닝
코드 검토 시스템이나 AI 파이프라인에서 개발자가 시스템의 경고를 무시/기각(Dismiss)하는 원인을 장기적으로 분석하려면 메타데이터를 세분화하여 수집해야 합니다. 세분화된 정보는 높은 오탐률을 일으키는 특정 정규식이나 규칙을 정밀하게 식별(Isolate)하여 튜닝할 수 있는 피드백 루프를 제공합니다.

**문제 상황 분석:**
- 코드 검토 어시스턴트가 감지한 항목의 `detected_pattern` 필드 데이터 수준(Granularity)을 결정해야 함
- 광범위한 범주("security") vs 구체적 트리거 규칙(함수명, 데코레이터, 정규식 등) 두 가지 선택지가 존재함
- 개발자가 경고를 무시/기각(Dismissal)하는 행동 패턴을 장기적으로 분석하여 시스템을 개선하고자 함

**B번이 정답인 이유:**
개발자가 특정 경고를 지속적으로 기각(Dismiss)하는 경우, 단순히 "보안(security) 경고라서 기각했다"는 대분류 정보만으로는 어떤 규칙이 잘못되어 거짓 긍정(False Positive)을 내는지 알 수 없습니다. 특정 함수나 정규식 규칙 수준으로 세분화하여 기록하면, 높은 기각률을 유발하는 원인 규칙을 정확히 격리(Isolate)해내고 해당 정규식이나 모니터링 로직을 미세 조정(Tune)하여 검토 정확도를 개선할 수 있습니다.

**오답 분석:**
- Option A (오답): 심각도(severity) 필드만으로는 개발자가 정규식 규칙 오류로 기각했는지, 실제 위협 수준이 낮아서 기각했는지의 근본적 규칙 단위를 구분할 수 없습니다.
- Option C (오답): 내부 개발 팀에 지적 재산권 수준의 내부 규칙 이름을 숨겨야 할 이유가 없으며, 정밀 분석을 방해하는 비논리적 사유입니다.
- Option D (오답): 대시보드 렌더링 편의성 때문에 분석 데이터의 해상도(Granularity)를 포기하는 것은 잘못된 아키텍처 접근법입니다.

---

### 문제 29

**1. 문제 원문**

A utility-bill extraction pipeline has logged the following four distinct failed extractions: 1. The `meter_reading` value was extracted correctly but placed under `billing_address` instead of the `usage_details` object. 2. The `account_holder_phone` field is blank because no phone number appears anywhere on the scanned bill provided so far. 3. The `prior_year_comparison` figure is missing because it only appears in an annual letter never supplied to the pipeline. 4. The `service_address` field holds the mailing address because that is the only address printed on this particular bill. Which of these is the one most likely to be fixed by an error-feedback retry, as opposed to requiring a different source document or human escalation?

A) The `service_address` field holds the mailing address because that is the only address printed on this particular bill

B) The `prior_year_comparison` figure is missing because it only appears in an annual letter never supplied to the pipeline

C) The `account_holder_phone` field is blank because no phone number appears anywhere on the scanned bill provided so far

D) The `meter_reading` value was extracted correctly but placed under `billing_address` instead of the `usage_details` object

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

---

### 문제 43

**1. 문제 원문**

A prompt combines lengthy background context, formatting instructions, several worked examples, and the user's actual request into a single message. The model occasionally treats part of a worked example as if it were the live user request, producing an oddly literal response to sample data instead of the real query. What change would most directly resolve this confusion?

A) Move all worked examples to the end of the prompt, right after the user's actual request

B) Rewrite each example as a short bullet point instead of a full input-output pair

C) Remove the examples and describe their content in a summary paragraph up front

D) Wrap each example in its own example tag, and the whole set in an outer examples tag

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
D번: Wrap each example in its own example tag, and the whole set in an outer examples tag

정답 및 해설:

핵심 개념: XML 태그를 활용한 프롬프트 구조화 (Prompt Structuring with XML Tags)
프롬프트 내에 배경 지식, 예시(Few-shot examples), 실제 입력값 등이 혼재되어 있을 때, XML 태그(`<examples>`, `<example>`)를 사용해 구분을 명확히 해주면 각 요소의 역할(지침/예시/실제 입력)을 모델이 가장 정확하게 인지합니다.

문제 상황 분석:
- 프롬프트 하나에 긴 배경 문맥, 서식 지침, 예시 데이터, 실제 사용자 요청이 한꺼번에 작성되어 있음.
- 모델이 예시 데이터를 실제 실행해야 하는 요청으로 오인하여 예시 데이터에 대한 답을 내놓음.
- 예시 영역과 실제 요청 영역의 구조적/경계적 구분이 모호하여 발생하는 현상임.

D번이 정답인 이유:
각 예시를 `<example>...</example>` 태그로 감싸고, 전체 예시 집합을 `<examples>...</examples>` 태그로 구조화하면 프롬프트 내 구조적 경계가 명확해집니다. 이를 통해 모델은 해당 구역이 단지 참고용 예시 데이터일 뿐이며, 진짜 실행해야 하는 명령은 태그 외부의 사용자 요청이라는 것을 완벽하게 인지하게 됩니다.

오답 분석:
- Option A (오답): 예시를 실제 요청 뒤로 보낸다고 해서 예시와 요청 간의 경계가 명확해지지 않으며, 마지막에 위치한 예시를 오히려 최종 명령으로 오인할 위험이 있습니다.
- Option B (오답): 요약된 불릿 포인트로 변경하면 예시의 명확성(Few-shot 학습 효과)이 떨어질 뿐만 아니라, 텍스트 형태의 모호성이 완전히 해결되지 않습니다.
- Option C (오답): 예시를 제거하면 Few-shot 프롬프팅을 통한 출력 품질 향상 효과를 얻을 수 없게 됩니다.

---

### 문제 44

**1. 문제 원문**

A team is building a pipeline that asks Claude to read free-form support tickets and return a JSON object with fields like priority, category, and summary. Early prototypes used a prompt asking Claude to "reply with only JSON", but downstream parsing occasionally failed on malformed brackets and stray commentary text. Which approach most reliably eliminates these JSON syntax failures?

A) Append a stricter instruction to the system prompt demanding that Claude output valid JSON and nothing else, then retry the request whenever parsing fails

B) Lower the temperature parameter to 0 so that Claude's text completions become more deterministic and less prone to formatting mistakes

C) Define an extraction tool with an input_schema describing the fields, and parse the structured arguments from the resulting tool_use block instead of parsing free text

D) Ask Claude to wrap its JSON output in triple backticks and strip the backticks during post-processing before parsing the remaining text

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
C번: Define an extraction tool with an input_schema describing the fields, and parse the structured arguments from the resulting tool_use block instead of parsing free text

정답 및 해설:

핵심 개념: 도구 호출(Tool Use / Function Calling)을 통한 구조화된 데이터 추출
LLM에서 신뢰할 수 있는 JSON/구조화된 데이터를 얻는 가장 확실한 방법은 일반 텍스트 생성을 구걸하거나 지시하는 대신, 도구(Tool/Function)의 `input_schema`에 JSON 스키마를 정의하고 모델이 해당 도구를 호출하게 만들어 `tool_use` 블록의 인자를 가져오는 것입니다.

문제 상황 분석:
- 자유 형식의 텍스트 생성 시 "JSON으로만 응답하라"는 자연어 지시만으로는 문법 오류나 사족 텍스트(주석) 발생을 완전히 막을 수 없음.
- 백틱이나 재시도 로직 등의 부차적인 방법은 파싱 실패율을 낮출 수는 있어도 근본적인 구조적 보장을 제공하지 못함.
- 따라서 텍스트 파싱 방식이 아닌 API 레벨에서 보장되는 구조화된 형식 출력이 필요한 상황임.

C번이 정답인 이유:
도구(Tool)를 정의하고 필드 스키마(`input_schema`)를 명시하면, Claude API는 모델이 전달하는 파라미터가 해당 스키마 구조를 따르도록 유도하고 `tool_use` JSON 블록으로 엄격하게 반환합니다. 이를 통해 자유 텍스트 생성 시 발생하는 구문 오류(잘못된 괄호, 사족 텍스트 등)를 근본적으로 방지하고 가장 높은 신뢰도로 JSON을 추출할 수 있습니다.

오답 분석:
- Option A (오답): 시스템 프롬프트를 더 엄격하게 작성하고 재시도(Retry)하는 방식은 비용과 지연시간(Latency)을 증가시키며, 구문 오류의 근본적 발생을 막지 못합니다.
- Option B (오답): `temperature`를 0으로 설정하면 출력이 더 결정론적(deterministic)으로 바뀌어 변동성은 줄어들지만, JSON 구문 오류나 서문/후문 텍스트 작성을 완전히 차단하는 기술적 보장책이 되지 못합니다.
- Option D (오답): 백틱(```)으로 감싸는 규칙을 추가하더라도 여전히 자유 텍스트 생성 방식에 의존하므로 내부 JSON의 괄호 누락이나 문법 오류를 완벽히 해결할 수 없습니다.

---

### 문제 45

**1. 문제 원문**

A tool extracts a paper's 'sample size' and 'statistical method' fields. Some papers place this information in a clearly labeled Methodology section, while others embed it in a sentence within the Results or Discussion section without any nearby heading. The tool reliably extracts from labeled Methodology sections but frequently returns null when the same information is embedded elsewhere. What is the best fix?

A) Increase the model's context window to ensure it reads the entire paper rather than a truncated excerpt.

B) Exclude any paper that lacks a labeled Methodology section from the extraction pipeline.

C) Provide the model with extraction examples from both a labeled Methodology section and from an embedded sentence in Results, demonstrating how to extract the fields in both cases.

D) Configure the tool to first search the Methodology section, and only fall back to other sections if the fields are missing.

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
C번: Provide the model with extraction examples from both a labeled Methodology section and from an embedded sentence in Results, demonstrating how to extract the fields in both cases.

정답 및 해설:

핵심 개념: Few-Shot 퓨샷 프롬프팅 (Diverse Example Demonstration)
LLM 기반 추출 도구가 특정 형식이나 위치(예: 명확한 섹션 헤딩)에 편향되어 일관성이 떨어질 때, 다양한 컨텍스트 및 예시 패턴(Few-shot examples)을 제공하면 모델의 가다듬어진 패턴 인식 능력이 대폭 향상됩니다.

문제 상황 분석:
- 추출 도구가 명확한 Methodology 섹션이 있는 논문에서는 정보를 잘 추출함.
- 헤딩 없이 Results나 Discussion 내부 문장에 자연어로 묻혀 있는 정보는 인식하지 못하고 `null`을 반환함.
- 문제의 원인은 모델이 헤딩 구조에만 의존하는 편향(Bias)이 생겼거나, 비구조화된 일반 문장 내 추출 예시 학습 부족 때문임.

C번이 정답인 이유:
명확한 Methodology 섹션에서 추출하는 예시뿐만 아니라, Results/Discussion 내부 문장에서 정보를 추출하는 다양한 유형의 예시(Few-shot)를 프롬프트에 제공함으로써 모델에게 두 패턴 모두에서 필드를 식별하고 추출하는 방법을 학습시킬 수 있습니다. 이는 다양하고 엣지 있는 패턴에 대한 추출 성능을 가장 안정적으로 개선하는 방법입니다.

오답 분석:
- Option A (오답): 문제 원인은 잘린 텍스트 때문이 아니라 다른 위치/형태의 텍스트 패턴을 인식하지 못하는 패턴 인지 문제입니다. 컨텍스트 창 크기를 늘리는 것으로는 다양성 부족 문제를 해결하지 못합니다.
- Option B (오답): 지정된 섹션이 없다고 논문을 제외해 버리는 것은 시스템 지원 범위를 임의로 축소하는 잘못된 우회책입니다.
- Option D (오답): 본문 문제는 정보의 단순 검색 순서가 아니라, 비구조화된 문장 형태(embedded sentence)로 작성된 정보 자체를 모델이 알아채고 추출하지 못한다는 점입니다. 단순히 검색 순서를 fall back 방식으로 바꾸는 알고리즘 설정만으로는 내부 추출 실패 문제를 해결하지 못합니다.

---

### 문제 46

**1. 문제 원문**

A reviewer flags a docstring that says "returns the cached value if present, otherwise fetches from the API," but the function under review always calls the API regardless of a cache. Under an explicit-criteria rule that only flags comments contradicted by actual code behavior, should this finding be reported?

A) No, because docstrings describe intent rather than guaranteed behavior, so a mismatch with the current implementation is not a reportable contradiction.

B) Yes, but only if the function is called from more than one place in the codebase, since single-use functions are exempt from this criterion.

C) Yes, because the docstring makes a specific, checkable claim about caching behavior that the code's actual control flow directly contradicts.

D) No, because caching behavior is an implementation detail, and implementation details are excluded from comment-accuracy review by definition.

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
C번: Yes, because the docstring makes a specific, checkable claim about caching behavior that the code's actual control flow directly contradicts.

정답 및 해설:

핵심 개념: 코드 주석 정확도 및 명확한 검토 기준 (Code Comment Accuracy & Explicit Review Criteria)  
자동화된 코드 검토 시스템이나 규칙 기반 리뷰어는 "실제 코드 동작과 직접적으로 모순되는 주석"만을 지적하도록 명시적 규칙을 적용합니다. 주석에 기재된 명확한 동작 설명이 코드의 실제 제어 흐름(Control Flow)과 일치하지 않는 경우, 이는 명백한 보고 대상 오류에 해당합니다.

문제 상황 분석:
- 독스트링은 "캐시가 있으면 캐시 값을 반환하고, 없으면 API를 호출한다"고 명시함.
- 그러나 실제 작성된 코드는 캐시 존재 여부를 확인하지 않고 항상 API를 호출함.
- 검토 규정은 "실제 코드 동작과 모순(contradict)되는 주석만 지적한다"는 명확한 기준(explicit-criteria rule)을 따르고 있음.

C번이 정답인 이유:
독스트링에 작성된 설명은 "캐싱 조건부 동작"이라는 구체적이고 코드상에서 검증 가능한(checkable) 내용을 담고 있습니다. 하지만 실제 코드의 제어 흐름은 캐시 확인 없이 항상 API를 호출하므로 독스트링의 내용과 직접적으로 충돌하며 모순됩니다. 따라서 주어진 명확한 검토 규칙에 따라 이 지적 사항은 보고(reported)되어야 합니다.

오답 분석:
- Option A (오답): 독스트링이 의도를 나타낸다 하더라도, 명시된 조건부 캐싱 동작과 실제 항상 API를 호출하는 구현 간의 직접적인 모순은 규칙상 명백한 지적 대상입니다.
- Option B (오답): 함수가 코드베이스에서 호출되는 횟수(단일 사용 여부)는 주석-코드 모순 여부를 판단하는 기준에 해당하지 않습니다.
- Option D (오답): 독스트링에 특정 캐싱 제어 흐름을 명시적으로 서술해 두었다면 이는 단순 구현 세부 사항을 넘어 외부 호출자가 기대하는 함수의 동작 계약(Contract)에 해당하므로, 실제 코드와 다를 경우 지적 대상입니다.

---

### 문제 47

**1. 문제 원문**

A logistics company ingests shipment confirmation emails from many different carriers. Dates appear as `03/14/2026`, `14-Mar-2026`, and `2026.03.14` depending on the carrier, but the extraction schema defines `ship_date` as a string with a strict ISO 8601 pattern. Extractions frequently fail schema validation because the source dates don't match the expected format. According to the current Anthropic official guidance, what is the most effective fix?

A) Retain the strict ISO 8601 schema constraint for `ship_date` and add an explicit `description` in the JSON schema telling Claude to parse and normalize the carrier date string to ISO 8601 format (e.g., `YYYY-MM-DD`).

B) Remove the `ship_date` field from the extraction schema and infer the shipment date later from other fields such as tracking number lookup or email metadata.

C) Loosen the schema to accept any string for `ship_date`, and add a downstream step that uses a date parser to normalize the value to ISO 8601 format before storing it in the database.

D) Split `ship_date` into three fields such as `ship_date_us`, `ship_date_eu`, and `ship_date_iso`, each expecting a different carrier date format, and populate only the one matching the extracted string.

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
C번: Loosen the schema to accept any string for `ship_date`, and add a downstream step that uses a date parser to normalize the value to ISO 8601 format before storing it in the database.

정답 및 해설:

핵심 개념: LLM 추출과 후속 정규화의 역할 분리 (Decoupling LLM Extraction & Deterministic Parsing)  
Anthropic의 공식 가이드라인에 따르면 다양한 비구조화 포맷을 가진 데이터를 추출할 때 스키마 레벨에서 엄격한 포맷 검증(Regex/Pattern)을 강제하면 스키마 유효성 검사 실패율이 높아집니다. 스키마 제약조건은 일반 문자열(`type: string`)로 완화하여 추출 성공률을 높이고, 정규화(Normalization)는 후속 애플리케이션 코드(Date Parser)에 위임하는 것이 가장 정석적인 설계입니다.

문제 상황 분석:
- 이메일 원본의 날짜 포맷이 운송사별로 상이함 (`03/14/2026`, `14-Mar-2026`, `2026.03.14`).
- 추출 스키마에서 `ship_date`에 엄격한 ISO 8601 패턴을 적용하여 유효성 검사 오류가 지속 발생함.
- 모델의 자연어 추출 능력과 엄격한 스키마 검증 간의 충돌로 인해 시스템 신뢰도가 저하됨.

C번이 정답인 이유:
`ship_date` 스키마 제약을 단순 문자열로 완화(Loosen)하면 모델이 이메일의 날짜를 실패 없이 원문 그대로 가져올 수 있습니다. 이후 데이터베이스 저장 직전 단계(Downstream)에서 검증된 날짜 파서 라이브러리를 사용해 ISO 8601 포맷으로 변환하면, 스키마 유효성 검사 실패를 원천적으로 방지하고 안전하게 정규화된 데이터를 확보할 수 있습니다.

오답 분석:
- Option A (오답): 스키마 `description`에 정규화 지침을 제공하더라도, 엄격한 패턴 검증 규칙을 유지하면 모델이 비구조화 데이터를 인코딩하는 과정에서 여전히 스키마 유효성 검사 실패가 자주 발생합니다.
- Option B (오답): 이메일 본문에 존재하는 핵심 데이터(`ship_date`) 추출을 포기하고 외부 조회나 메타데이터에 의존하는 것은 불필요한 복잡성을 유발하고 본래의 추출 목적을 달성하지 못합니다.
- Option D (오답): 날짜 포맷별로 필드를 무분별하게 나누는 것은 데이터베이스 구조와 데이터 모델을 불필요하게 파편화하며 유지보수를 매우 어렵게 만듭니다.

---

### 문제 48

**1. 문제 원문**

The "performance suggestions" category in a code-review tool has a 70% false positive rate, and developers have stopped reading any findings from the tool at all, including from well-performing categories. The team needs to restore trust quickly while a better prompt for that category is developed over the following weeks. What is the recommended immediate action?

A) Temporarily disable the performance-suggestions category so developers see only the accurate categories, while iterating on that category's prompt separately before re-enabling it.

B) Lower the overall severity label on every performance finding to "informational" so that developers see them as advisory notes and can continue reviewing other accurate categories while the prompt is iterated on.

C) Merge the performance-suggestions category into the correctness category so that developers reviewing correctness findings also encounter performance suggestions, gradually rebuilding trust through repeated exposure.

D) Add a disclaimer banner on each code-review result indicating that certain categories have lower precision, so that developers can apply their own filtering criteria when reviewing findings across the project.

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
A번: Temporarily disable the performance-suggestions category so developers see only the accurate categories, while iterating on that category's prompt separately before re-enabling it.

정답 및 해설:

핵심 개념: 개발자 경험(DX) 및 AI 경고 피로도(Alert Fatigue) 관리  
AI 기반 개발 도구에서 높은 오탐률(70%)은 시스템 전체에 대한 "경고 피로도"를 유발하고 도구 자체에 대한 신뢰를 무너뜨립니다. 신뢰를 신속히 회복하기 위해서는 문제가 되는 알림 출처를 즉시 차단하고, 프롬프트 개선 작업이 완료된 후 재활성화하는 조치가 필요합니다.

문제 상황 분석:
- 코드 리뷰 도구의 특정 카테고리("성능 제안") 오탐률이 70%에 달함.
- 경고 피로도로 인해 개발자들이 올바르게 작동하는 다른 카테고리의 결과까지 완전히 무시하기 시작함.
- 향후 몇 주간 프롬프트를 개선할 예정인 상황에서, 개발자들의 신뢰를 즉시 회복할 수 있는 조치가 필요함.

A번이 정답인 이유:
문제가 되는 카테고리를 일시적으로 비활성화하면 개발자는 높은 정확도를 유지하는 나머지 카테고리의 결과만 보게 되므로 경고 피로도가 즉시 해소되고 도구에 대한 전체적인 신뢰를 빠르게 회복할 수 있습니다. 그동안 오탐률이 높은 프롬프트를 별도 환경에서 테스트 및 개선한 후 검증이 완료되었을 때 재활성화하는 것이 AI 품질 관리의 정석적인 절차입니다.

오답 분석:
- Option B (오답): 심각도를 "정보성"으로 낮추더라도 노이즈(오탐) 결과가 계속 출력되므로 개발자가 다른 카테고리 결과를 무시하는 행동을 멈추게 하지 못합니다.
- Option C (오답): 오탐률이 높은 결과를 잘 작동하는 "정확성" 카테고리에 섞어버리면, 정확성 카테고리에 대한 신뢰까지 함께 떨어뜨려 도구 전체를 더 오염시킵니다.
- Option D (오답): 면책 배너를 추가하고 필터링 책임을 개발자에게 넘기는 것은 개발자의 피로도를 전혀 줄여주지 못하며 도구 무시 현상을 해결할 수 없습니다.

---

### 문제 49

**1. 문제 원문**

An agent workflow needs Claude to request a database-lookup tool, receive the tool's result, and then reason over that result before producing a final answer, all within one logical exchange. A developer wants to run this exchange through the Message Batches API to save on cost. What is the key limitation that rules this out?

A) Batch requests limit each conversation to a single message, so a tool_use block and its follow-up reasoning cannot appear in one batched exchange, since each conversation must be self-contained.

B) Tool definitions cannot be attached to any request submitted through the Message Batches API, so the model never has the option to request a database-lookup tool during processing.

C) A single batch request cannot pause mid-processing to accept an application-supplied tool result, since each request resolves independently with no mid-request round trip.

D) The Message Batches API silently strips tool_use content blocks from responses, so the application never learns which tool the model wanted to call, leaving it unable to supply the required result.

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
C번: A single batch request cannot pause mid-processing to accept an application-supplied tool result, since each request resolves independently with no mid-request round trip.

정답 및 해설:

핵심 개념: Message Batches API의 비동기적 특성 및 도구 호출 루프 (Message Batches API & Tool Use Loop)  
Anthropic의 Message Batches API는 비동기식(Asynchronous) 대량 요청 처리 API로, 50%의 비용 절감을 제공하지만 단일 네트워크 요청 내에서 실시간 왕복(Round-trip) 통신을 지원하지 않습니다. 에이전트의 도구 실행 워크플로는 [모델의 도구 호출 요청 -> 애플리케이션의 도구 실행 및 결과 반환 -> 모델의 후속 추론]이라는 동기적 다단계 피드백 루프가 필수적입니다.

문제 상황 분석:
- 에이전트 워크플로가 단일 교환 내에서 도구 실행 및 결과 수신, 최종 추론까지 완결되기를 요구함.
- 개발자가 비용 절감을 위해 이를 단일 Message Batches API 요청으로 처리하고자 함.
- 배치 처리의 구조상 실시간 중단 및 외부 결과 수신이 불가능하다는 제약 조건이 발생함.

C번이 정답인 이유:
단일 배치 API 요청은 독립적이고 단방향으로 실행됩니다. 처리 중간에 일시 정지(Pause)하여 외부 애플리케이션이 실행한 도구 결과(`tool_result`)를 전달받아 실행을 재개하는 '중간 왕복 통신'이 불가능하므로, 이러한 연속적인 에이전트 인터랙션을 단일 배치 요청 내에서 처리할 수 없습니다.

오답 분석:
- Option A (오답): 배치 요청에는 이전 대화 내역을 담은 여러 개의 메시지(`messages` 배열)를 포함할 수 있으므로 메시지 개수가 단 하나로 제한된다는 설명은 거짓입니다.
- Option B (오답): Message Batches API에서도 `tools` 파라미터를 사용하여 도구 정의를 정상적으로 첨부할 수 있습니다.
- Option D (오답): Batch API 응답에도 `tool_use` 블록이 정상적으로 포함되어 반환되며, 이를 임의로 무단 제거(strip)하지 않습니다.

---

### 문제 50

**1. 문제 원문**

An architect is redesigning review criteria for an internal Claude-based code review agent. The goal is to ensure that critical issues—such as security vulnerabilities and correctness bugs—are never missed, while avoiding noise from subjective preferences. The architect wants to define which issues should always be reported versus always skipped, rather than relying on the model's confidence to decide. Which pair of instructions correctly demonstrates this approach?

A) Report every change that deviates from the team's officially documented style guide; skip any change the model classifies as a subjective personal taste preference, even if it affects readability.

B) Report any finding where the model's internal confidence score exceeds a fixed threshold of 0.9; skip any finding where the confidence score is below that threshold, treating all categories uniformly.

C) Report a finding only after a second independent review pass confirms that the first pass's confidence score exceeds a fixed threshold; skip any finding where the passes disagree or the score is not duplicated.

D) Report any change that introduces a security vulnerability or a correctness bug that breaks existing behavior; skip formatting preferences and deviations from a file's established local conventions.

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
D번: Report any change that introduces a security vulnerability or a correctness bug that breaks existing behavior; skip formatting preferences and deviations from a file's established local conventions.

정답 및 해설:

핵심 개념: 명확한 범주 기반 프롬프트 지침 설계 (Category-Based Explicit Instructions vs. Confidence Thresholds)  
LLM 코드 리뷰 시스템에서 모델의 불확실한 신뢰도 점수(Confidence Score)에 의존하는 대신, 보고해야 할 중요 이슈(보안, 동작 버그)와 무시해야 할 노이즈(서식, 스타일 선호)의 범주를 프롬프트 상에 명시적 기준(Explicit Criteria)으로 직접 정의하는 것이 노이즈를 줄이고 정확도를 높이는 핵심 프롬프트 공학 기법입니다.

문제 상황 분석:
- AI 코드 리뷰어가 보안 취약점이나 올바름 버그 같은 치명적 문제는 절대 놓치지 않아야 함.
- 동시에 주관적 스타일 차이로 인한 소음(Noise)은 방지해야 함.
- 모델의 내부 신뢰도 점수에 판단을 맡기지 않고, "항상 보고할 항목"과 "항상 무시할 항목"을 프롬프트 레벨에서 명확히 분리하여 지시하고자 함.

D번이 정답인 이유:
D번 지침은 "보안 취약점 및 기존 동작을 망가뜨리는 버그"는 명확히 보고하도록 지시하고, "서식 선호도 및 스타일/관례 차이"는 건너뛰도록 범주별 행동 기준을 구체적으로 제시합니다. 이는 문제에서 요구한 '모델 신뢰도 수치에 의존하지 않고 명확히 보고/스킵 대상을 정하는 접근 방식'과 정확히 일치합니다.

오답 분석:
- Option A (오답): 스타일 가이드 위반을 모두 보고하는 것은 주관적인 스타일 노이즈를 유발하여 문제의 목적인 '주관적 선호도로 인한 소음 방지'에 위배됩니다.
- Option B (오답): 문제 조건에서 모델의 신뢰도 점수(Confidence score)에 의존하지 않기로 했으나, B번은 0.9라는 임계값 수치에 의존하므로 조건에 반합니다.
- Option C (오답): C번 역시 2차 패스 검증을 도입했을 뿐 근본적으로 모델의 신뢰도 점수(Confidence score) 수치에 의존하므로 문제의 요구 조건과 맞지 않습니다.

---

### 문제 51

**1. 문제 원문**

A retail receipt-extraction system reads scanned receipts and populates a "total" field. Occasionally the printed total is smudged and misread, producing a plausible but wrong number that still passes schema validation. What extraction design best catches this class of error before it reaches downstream accounting?

A) Skip extracting individual line items entirely so the pipeline runs faster and only returns the printed total field

B) Extract each line-item price plus the printed total, compute a calculated_total, and flag records where the two figures diverge

C) Trust the printed total field exactly as extracted, since it is the field accounting actually consumes further downstream anyway

D) Have the model silently overwrite the printed total with whatever value it judges most plausible before it responds

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
B번: Extract each line-item price plus the printed total, compute a calculated_total, and flag records where the two figures diverge

정답 및 해설:

핵심 개념: 교차 검증 및 산술 일치성 검사를 통한 데이터 추출 검증 (Cross-Validation & Mathematical Consistency Check)  
OCR 및 LLM 기반 문서 추출 파이프라인에서 텍스트 번짐/오염으로 인해 그럴듯한 오류(Plausible Error)가 스키마 검증(타입/형식 검사)을 통과하는 경우, 하위 품목(Line items)의 합계와 인쇄된 합계 금액을 비교하는 등의 교차 검증 검사를 도입하는 것이 최선의 모범 사례입니다.

문제 상황 분석:
- 영수증 스캔본의 "total" 문자가 번져서 잘못 추출되지만, 수치 형식 자체는 유효하여 기본 스키마 검증을 통과함.
- 후속 회계 시스템으로 잘못된 데이터가 유입되는 것을 방지하기 위한 구조적 추출 검증 설계가 필요함.
- 단순 형식 검사 외에 실제 수치 데이터의 정확성을 판단할 수 있는 메커니즘이 필요함.

B번이 정답인 이유:
개별 품목 가격(Line-item prices)을 함께 추출하여 합산한 값(`calculated_total`)과 추출된 인쇄 합계(`printed total`)를 비교하면, 텍스트 오염으로 인한 수치 오류 발생 시 두 값이 일치하지 않게 됩니다. 이 차이(Divergence)를 감지하여 불일치 레코드에 플래그를 지정함으로써 후속 회계 데이터 오염을 가장 확실하게 방지할 수 있습니다.

오답 분석:
- Option A (오답): 개별 품목 추출을 건너뛰면 비교 검증할 수 있는 수단이 사라지므로 잘못된 합계 금액이 그대로 회계 시스템으로 넘어가게 됩니다.
- Option C (오답): 잘못 추출된 값을 그대로 신뢰하고 사용하는 것은 문제 상황을 방치하는 잘못된 설계입니다.
- Option D (오답): 모델이 자의적으로 값을 변경(Overwrite)하여 반환하게 하면 원본과의 대조 및 이상 탐지(Audit Trail)가 불가능해지며, 또 다른 오탐을 유발할 수 있습니다.

---

### 문제 52

**1. 문제 원문**

An invoice-extraction pipeline returns structured JSON that is missing the required `invoice_number` field, even though the number is clearly printed on the source PDF. The team wants to retry the extraction with targeted feedback so the model can correct the omission. Which retry design is most likely to succeed?

A) Send only the validation error text by itself, without re-attaching the source PDF or the earlier failed output from the first pass

B) Discard the whole conversation and resend the unchanged original prompt, hoping sampling variance yields a different result this time

C) Rewrite the system prompt with new wording and resend it with the PDF, without naming the missing field or the earlier attempt

D) Resend the original PDF plus the prior failed JSON, and state that `invoice_number` is required but was omitted from that attempt

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
D번: Resend the original PDF plus the prior failed JSON, and state that `invoice_number` is required but was omitted from that attempt

정답 및 해설:

핵심 개념: 대상화된 피드백을 통한 멀티턴 재시도 패턴 (Targeted Feedback & Stateful Retry Loop)  
LLM 데이터 추출 중 필수 필드 누락 오류가 발생했을 때, 모델에게 정정을 요청하려면 **(1) 원본 컨텍스트(PDF)**, **(2) 이전 시도의 생성 결과(실패한 JSON)**, **(3) 구체적인 오류 원인 및 피드백(필수 필드 누락 명시)**을 대화 내역(Context)에 모두 유지하여 제공해야 합니다.

문제 상황 분석:
- PDF 원본에는 송장 번호가 존재하지만, 추출된 JSON 결과에서 `invoice_number` 필드가 누락됨.
- 단순 재시도가 아닌 타겟팅된 피드백(Targeted feedback)을 전달하여 정정하도록 유도하고자 함.
- 모델이 원본 문서와 이전 생성 결과, 피드백을 조합하여 부족한 점을 보완하도록 대화 구성을 설계해야 함.

D번이 정답인 이유:
D번은 모델이 판독해야 할 원본 데이터(PDF)와 모델 자신이 이전에 출력했던 실패 결과(prior failed JSON), 그리고 무엇이 잘못되었는지에 대한 명확한 지적(`invoice_number`가 필수인데 누락되었음)을 모두 포함합니다. 모델은 이 완전한 맥락을 바탕으로 기존 출력의 오류를 파악하고, 원본 문서에서 누락된 필드만 정확히 찾아내어 완전한 JSON을 재생성할 수 있게 됩니다.

오답 분석:
- Option A (오답): 원본 PDF와 이전 출력을 제외하고 오류 메시지만 보내면, 모델은 무엇을 검토하고 어떤 JSON 구조에서 필드를 수정해야 하는지 참조 대상을 잃게 됩니다.
- Option B (오답): 단순히 동일한 프롬프트를 재전송하는 것은 피드백(Targeted feedback)을 주지 않으며 무작위 확률(Sampling)에만 의존하므로 오류가 반복될 확률이 높습니다.
- Option C (오답): 누락된 필드명을 알려주지 않고 시스템 프롬프트 문구만 바꾼다면, 모델은 특정 필드가 빠졌다는 사실을 알지 못해 동일한 누락 문제를 계속 일으킬 수 있습니다.

---

### 문제 53

**1. 문제 원문**

A team adds five few-shot examples to a document-classification prompt to fix inconsistent labeling. All five examples happen to be English-language emails under 100 words. After deployment, the model performs well on similar short English emails but starts mislabeling longer documents and documents in other languages that it previously handled correctly under the old, example-free prompt. What is the most likely cause, and what should the team do?

A) The examples unintentionally taught an unrelated pattern tied to length and language; diversify them

B) The five examples are too few in number; keep them but duplicate each one three times

C) The regression is unrelated to the examples and is caused by unrelated model drift

D) Few-shot examples are simply incompatible with document classification tasks, so remove them entirely

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
A번: The examples unintentionally taught an unrelated pattern tied to length and language; diversify them

정답 및 해설:

핵심 개념: 퓨샷 예시 편향(Few-Shot Example Bias) 및 예시 다양화(Example Diversity)  
LLM에 퓨샷 예시를 제공할 때 모든 예시가 특정 형식(예: 짧은 길이, 특정 언어)에 치우쳐 있으면, 모델은 지시사항과 무관한 spurious pattern(의도치 않은 연관 패턴)을 학습하여 해당 규격에 맞지 않는 입력 전체에 성능 저하(Regression)를 일으킵니다.

문제 상황 분석:
- 불일치 레이블링을 바로잡고자 5개의 퓨샷 예시를 프롬프트에 도입함.
- 제공된 5개 예시가 모두 '100단어 미만의 짧은 영어 이메일'로 단일한 유형임.
- 예시 도입 후 짧은 영어 이메일은 잘 분류하지만, 긴 문서나 타 언어 문서 분류 성능이 떨어짐.

A번이 정답인 이유:
편향된 예시 집합은 모델에게 "이 작업은 짧은 영어 텍스트에만 적용된다"는 의도치 않은 서브 패턴을 유도합니다. 따라서 문제 원인은 예시의 편향성 때문이며, 해결책은 다양한 길이, 다양한 언어, 다양한 문서 형태를 포함하도록 퓨샷 예시를 다양화(Diversify)하는 것입니다.

오답 분석:
- Option B (오답): 동일한 편향된 예시를 단순히 3번씩 복제하는 것은 프롬프트 토큰만 낭비할 뿐 편향성 문제를 오히려 강화시킵니다.
- Option C (오답): 이전 프롬프트에서 잘 동작하던 긴 문서/타 언어 분류가 예시 추가 직후 실패하므로, 이는 프롬프트 편향에 의한 명백한 성능 저하이며 무관한 모델 드리프트가 아닙니다.
- Option D (오답): 퓨샷 프롬프팅은 문서 분류 작업의 정확도와 레이블 일관성을 높이는 가장 강력한 기법 중 하나이므로, 호환되지 않는다는 설명은 거짓입니다.

---

### 문제 54

**1. 문제 원문**

A reviewer prompt currently says: "Only surface issues you are very sure about." An architect wants to replace confidence-based filtering with categorical criteria for a bug-detection category specifically. Which rewrite achieves that goal?

A) Report an issue only when a variable, argument, or return value is used in a way that contradicts its declared type, documented contract, or an explicit precondition stated elsewhere in the code.

B) Report an issue whenever your certainty about it being a real bug is above a threshold you judge to be reasonably high for this kind of codebase, calibrated against the defect density you expect for the subsystem.

C) Report an issue whenever the surrounding code looks unusual compared to typical patterns you have seen in similar production systems, focusing on deviations from standard naming conventions and control flow idioms.

D) Report an issue only if you would personally be willing to bet that a senior engineer on the team would agree it is a genuine problem, after reviewing the code against the team's implicit quality standards and typical bug histories.

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
A번: Report an issue only when a variable, argument, or return value is used in a way that contradicts its declared type, documented contract, or an explicit precondition stated elsewhere in the code.

정답 및 해설:

핵심 개념: 신뢰도 수치(Confidence) 대비 명시적/범주적 규칙(Categorical Criteria) 전환  
LLM 코드 리뷰 프롬프트에서 "확신하는 경우에만 보고하라(very sure about)"와 같은 주관적/신뢰도 기반 필터링은 오탐을 막기 어렵습니다. 이를 개선하기 위해서는 타입 모순, 명시적 규약 위반, 코드 내 전제 조건 불일치처럼 코드 구조상 직접 검증 가능하고 명확하게 정의된 범주적 기준(Categorical Criteria)을 부여해야 합니다.

문제 상황 분석:
- 기존 프롬프트는 "매우 확신하는 이슈만 보고하라"는 주관적 신뢰도(Confidence-based) 필터에 의존함.
- 버그 탐지 카테고리에 대해 이러한 불확실한 기준을 대체하고자 함.
- 모델의 확신/주관적 판단이 아닌, 객관적이고 명확한 규칙 기반의 범주적 기준(Categorical Criteria)으로 프롬프트를 재작성해야 함.

A번이 정답인 이유:
A번 지침은 '변수/인자/반환값이 선언된 타입, 문서화된 규약, 또는 코드상 명시된 전제 조건과 직접 모순될 때'라는 객관적이고 코드 레벨에서 검증 가능한 범주적 기준(Categorical Criteria)을 제시합니다. 주관적인 확신도나 임계값에 의존하지 않고 명확한 모순 발생 여부만을 판단하게 하므로 문제를 완벽히 해결합니다.

오답 분석:
- Option B (오답): '버그라는 확신(certainty)이 임계값(threshold)을 초과할 때'라는 설명은 여전히 주관적인 신뢰도/확신도에 의존하는 방식이므로 교체하려는 대상의 기존 방식과 동일합니다.
- Option C (오답): '주변 코드가 특이해 보일 때(looks unusual)' 및 스타일/명명 규칙 위반을 보고하도록 하는 것은 주관적 느낌에 의존하며, 버그 탐지가 아닌 코드 스타일 지적(노이즈)에 해당합니다.
- Option D (오답): '시니어 엔지니어가 동의할 것이라고 내기할 수 있는 경우'나 '암묵적 품질 기준(implicit standards)' 역시 모델의 주관적 추측과 주관적 신뢰도에 의존하므로 명시적 범주 기준이 아닙니다.

---

### 문제 55

**1. 문제 원문**

A prompt engineer tries to fix a noisy security-findings category by adding the line "only report high-confidence findings" to the system prompt. After a week of testing, the false positive rate is essentially unchanged. What is the most likely explanation for why this change failed to improve precision?

A) General confidence language gives the model no concrete rule for what to report, so it still applies the same underlying judgment that produced the false positives before the change.

B) Adding any qualifier to a system prompt increases output length, which expands the set of tokens the evaluator inspects and independently raises the chance that a finding is miscategorized as high severity.

C) High-confidence phrasing conflicts with the model's safety training, which is designed to avoid under-reporting risks, causing it to over-report findings as a cautionary default across a wider range of inputs.

D) The word "confidence" is not in the set of tokens the model is trained to parse for output constraints, so the instruction is treated as decorative text and ignored, leaving the original behavior unchanged.

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
A번: General confidence language gives the model no concrete rule for what to report, so it still applies the same underlying judgment that produced the false positives before the change.

정답 및 해설:

핵심 개념: 모호한 신뢰도 지침 vs 명시적/범주적 규칙 (Vague Confidence Phrasing vs. Explicit Criteria)  
LLM에 "신뢰도가 높은 항목만 보고하라(high-confidence findings)"와 같이 주관적이고 추상적인 문구를 제공하면 모델은 스스로 무엇이 '신뢰도가 높은지' 객관적으로 판단할 수 없습니다. 결국 이전과 동일한 내재적 판단 기준을 적용하게 되므로 오탐률(False Positive Rate) 감소 및 정밀도 개선에 실패하게 됩니다.

문제 상황 분석:
- 보안 지적 사항 카테고리에서 오탐(False positive)이 많이 발생함.
- 프롬프트 엔지니어가 "only report high-confidence findings"라는 한 줄을 시스템 프롬프트에 추가함.
- 일주일간 테스트했지만 오탐률에 변화가 없었으며 정밀도가 개선되지 않음.

A번이 정답인 이유:
"high-confidence"라는 일반적이고 모호한 단어는 무엇을 보고하고 무엇을 스킵해야 하는지에 대한 구체적이고 객관적인 기준(Explicit/Categorical Criteria)을 모델에게 제공하지 못합니다. 모델은 '높은 신뢰도'의 정의를 알 수 없어 기존과 동일한 방식으로 오탐 가능성이 있는 지적 사항들을 그대로 출력하므로 정밀도 개선에 실패합니다.

오답 분석:
- Option B (오답): 프롬프트에 수식어를 추가하는 것이 출력 길이를 불필요하게 늘려 심각도 오분류 확률을 직접적으로 높인다는 주장은 기술적 근거가 없는 오답입니다.
- Option C (오답): 주관적인 신뢰도 문구가 모델의 안전 학습(Safety training)과 직접적으로 충돌하여 예방 조치로 지적 사항을 과다 보고하게 된다는 해석은 사실이 아닙니다.
- Option D (오답): LLM은 어휘 집합 내의 모든 일반 단어를 파싱할 수 있으며, "confidence"라는 특정 단어가 제약 조건 토큰 집합에서 제외되어 무시된다는 설명은 LLM 작동 방식에 대한 잘못된 설명입니다.

---

### 문제 56

**1. 문제 원문**

A developer is choosing between prompting Claude to "return only a JSON object matching this format" versus defining a tool with an input_schema and letting Claude populate it via tool_use, with strict enforcement enabled. Both approaches are tested against the same messy scanned-document corpus. Which outcome should the developer expect regarding guaranteed schema compliance?

A) The tool_use approach reliably produces schema-compliant structured data because the API strictly enforces the input_schema server-side when strict tool use is enabled, while prompt-only JSON requests can still drift into invalid syntax or missing fields.

B) Both approaches produce equally reliable schema-compliant output because the language model interprets the format specification identically in each case, generating token sequences that conform to the JSON structure with equal consistency.

C) Neither approach can guarantee valid structured output when processing messy scanned documents, so a separate JSON-repair library must always be used afterward to correct syntax errors and missing fields, regardless of which method is chosen.

D) The prompt-only approach yields more reliable schema-compliant output because it avoids the additional system-prompt instructions introduced by tool definitions, allowing the model to focus directly on the JSON format constraints.

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
A번: The tool_use approach reliably produces schema-compliant structured data because the API strictly enforces the input_schema server-side when strict tool use is enabled, while prompt-only JSON requests can still drift into invalid syntax or missing fields.

정답 및 해설:

핵심 개념: 도구 호출(Tool Use / Strict Tool Use) vs 자연어 프롬프팅 방식의 스키마 준수  
Claude API에서 구조화된 데이터(JSON)를 추출할 때 단순 자연어 지시("JSON으로만 답하라")는 텍스트 완성 방식에 의존하므로 구문 오류나 필드 누락이 발생할 수 있습니다. 반면, `strict: true` 옵션이 적용된 `tool_use` 방식은 API 및 서버 레벨에서 JSON 스키마 기반 출력 디코딩을 강제하므로 스키마 준수를 완벽히 보장합니다.

문제 상황 분석:
- 지저분한 스캔 문서 데이터셋에서 구조화된 JSON을 추출해야 함.
- 방식 1: 단순 프롬프팅("JSON 형식으로만 반환해라").
- 방식 2: `input_schema`와 엄격한 적용(strict enforcement)을 설정한 `tool_use` 방식.
- 보장된 스키마 준수(Guaranteed schema compliance) 측면에서 예상되는 결과를 찾는 문제임.

A번이 정답인 이유:
`strict tool use`(구조화된 출력 강제) 기능이 활성화되면 Anthropic API는 서버 측에서 디코딩 알고리즘을 통해 정의된 `input_schema`를 완벽히 준수하는 형태의 토큰만 생성되도록 강제합니다. 따라서 구문 오류나 필수 필드 누락이 근본적으로 차단됩니다. 반면 프롬프트만 사용하는 방식은 언어 모델의 확률적 텍스트 생성에만 의존하므로 여전히 문법 오류나 사족 텍스트가 포함될 가능성이 있습니다.

오답 분석:
- Option B (오답): 단순 프롬프팅과 엄격한 도구 호출 규격 적용은 일관성과 신뢰도 측면에서 동일하지 않으며, 도구 호출 방식이 훨씬 월등한 신뢰도를 제공합니다.
- Option C (오답): `strict tool use` 방식을 사용할 경우 API 차원에서 문법 검증이 보장되므로 별도의 JSON 복구(JSON-repair) 라이브러리를 필수적으로 사용할 필요가 없습니다.
- Option D (오답): 프롬프트 전용 방식이 도구 정의 방식보다 더 신뢰할 수 있다는 설명은 사실과 반대입니다.

---

### 57번 문제

**1. 문제 원문**

A logistics company ingests shipment confirmation emails from many different carriers. Dates appear as `03/14/2026`, `14-Mar-2026`, and `2026.03.14` depending on the carrier, but the extraction schema defines `ship_date` as a string with a strict ISO 8601 pattern. Extractions frequently fail schema validation because the source dates don't match the expected format. According to the current Anthropic official guidance, what is the most effective fix?

A) Loosen the schema to accept any string for `ship_date`, and add a downstream step that uses a date parser to normalize the value to ISO 8601 format before storing it in the database.

B) Remove the `ship_date` field from the extraction schema and infer the shipment date later from other fields such as tracking number lookup or email metadata.

C) Retain the strict ISO 8601 schema constraint for `ship_date` and add an explicit `description` in the JSON schema telling Claude to parse and normalize the carrier date string to ISO 8601 format (e.g., `YYYY-MM-DD`).

D) Split `ship_date` into three fields such as `ship_date_us`, `ship_date_eu`, and `ship_date_iso`, each expecting a different carrier date format, and populate only the one matching the extracted string.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
A번: Loosen the schema to accept any string for `ship_date`, and add a downstream step that uses a date parser to normalize the value to ISO 8601 format before storing it in the database.

**정답 및 해설:**

**핵심 개념:**
LLM을 활용한 정보 추출(Information Extraction) 시스템 설계 시 스키마 제약과 후속 처리(Downstream Processing)의 역할 분담에 관한 모범 사례입니다. 비구조화된 다양한 포맷의 데이터를 추출할 때 스키마 레벨에서 과도하게 엄격한 패턴 제약을 걸면 검증 실패(Validation Failure)가 발생하므로 추출 단계와 정규화 단계를 분리해야 합니다.

**문제 상황 분석:**
- 운송업체마다 이메일 내 날짜 포맷(`03/14/2026`, `14-Mar-2026`, `2026.03.14` 등)이 다르게 입력되고 있습니다.
- 추출 스키마에서 `ship_date`에 엄격한 ISO 8601 패턴 제약을 설정해 두어 스키마 검증 실패가 빈번하게 발생합니다.
- Anthropic 공식 가이드에 부합하는 가장 안정적이고 효과적인 해결 방법을 찾고 있습니다.

**A번이 정답인 이유:**
Anthropic 공식 문서 및 LLM 시스템 설계 모범 사례에 따르면, 비구조화된 다량의 포맷 데이터를 추출할 때는 LLM 추출 단계에서 스키마 제약을 단순 문자열(`type: string`)로 완화하여 원본 데이터를 안정적으로 추출하는 것이 권장됩니다. 추출 이후, 확정적(deterministic)이고 신뢰할 수 있는 후속 애플리케이션 코드(Downstream Date Parser)를 통해 ISO 8601 형식으로 정규화(Normalization)하여 데이터베이스에 저장하는 것이 시스템의 안정성과 성공률을 극대화하는 모범적인 접근 방식입니다.

**오답 분석:**
- Option B (오답): 핵심 정보인 배송 날짜 필드 자체를 추출 스키마에서 제거하는 것은 비효율적이며, 운송장 번호 조회나 메타데이터 추론에 의존하는 것은 불필요한 복잡성과 외부 API 호출 비용을 발생시킵니다.
- Option C (오답): JSON 스키마 내의 엄격한 정규표현식(Regex)이나 ISO 8601 패턴 제약이 유지되면, Claude가 원본 문자열을 정확히 인지하더라도 스키마 검증 단계(Schema Validation)에서 거부되어 오류가 지속 발생합니다.
- Option D (오답): 날짜 포맷마다 필드(`ship_date_us`, `ship_date_eu` 등)를 분할하는 방식은 스키마 구조를 불필요하게 복잡하게 만들고, 새로운 포맷이 추가될 때마다 스키마를 계속 수정해야 하므로 유지보수성이 크게 떨어집니다.

---

### 58번 문제

**1. 문제 원문**

An architect defines a 'code-reviewer' subagent and invokes it from the main agent immediately after code generation. Which statement accurately describes what context the reviewer subagent starts with?

A) The subagent starts with its own system prompt plus the Agent tool's prompt string, but not the parent's history or tool results

B) The subagent inherits the parent's reasoning trace but not the actual code files, so the parent must re-describe the implementation in prose

C) The subagent automatically receives the parent's entire conversation transcript, including every tool call and result from the generation phase

D) The subagent shares the same context window as the parent, so any file the parent read during generation is already visible to the subagent

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
A번: The subagent starts with its own system prompt plus the Agent tool's prompt string, but not the parent's history or tool results

**정답 및 해설:**

**핵심 개념:**
Anthropic 에이전트 아키텍처(Agentic Architecture) 및 Claude Agentic 워크플로에서 서브에이전트(Subagent)의 컨텍스트 격리(Context Isolation) 원칙에 대한 문제입니다. 서브에이전트는 독자적인 컨텍스트 창(Clean Context)을 가지고 실행되어 부모 에이전트의 대화 이력 오염을 방지합니다.

**문제 상황 분석:**
- 메인 에이전트(Parent Agent)가 코드를 생성한 직후 'code-reviewer' 서브에이전트를 호출합니다.
- 서브에이전트가 생성될 때 초기화되는 컨텍스트(Context) 범위에 대한 정확한 동작을 파악해야 합니다.
- 서브에이전트 호출 시 부모의 컨텍스트가 자동으로 전달되는지, 혹은 독립된 컨텍스트로 시작되는지가 핵심 구분 요소입니다.

**A번이 정답인 이유:**
Anthropic의 멀티 에이전트/서브에이전트 설계 모범 사례에 따르면, 서브에이전트는 토큰 낭비 방지 및 불필요한 노이즈 차단을 위해 독립된 컨텍스트 창을 새로 생성하여 시작합니다. 서브에이전트가 실행될 때 보유하는 컨텍스트는 서브에이전트 고유의 system prompt와 부모 에이전트가 Agent 도구 호출 시 전달한 입력 프롬프트(prompt string)뿐이며, 부모 에이전트의 이전 대화 히스토리나 다른 도구 실행 결과는 자동으로 상속되지 않습니다.

**오답 분석:**
- Option B (오답): 서브에이전트는 부모의 추론 기록(Reasoning trace)을 자동으로 상속받지 않습니다.
- Option C (오답): 서브에이전트는 부모의 전체 대화 기록 및 모든 도구 호출/결과를 자동으로 전달받지 않습니다. (독립된 컨텍스트로 시작함)
- Option D (오답): 서브에이전트는 부모와 동일한 컨텍스트 창을 공유하지 않으며 별도의 컨텍스트 창을 할당받습니다.

---

### 59번 문제

**1. 문제 원문**

A document-processing service receives files that could be invoices, resumes, or contracts, but the type is not known ahead of time. The service defines three separate extraction tools (`extract_invoice`, `extract_resume`, `extract_contract`) and needs Claude to always call exactly one of them so the pipeline never falls back to plain text. Which `tool_choice` configuration should be used?

A) Omit the `tools` parameter and instruct Claude in the system prompt to always respond using one of the three named JSON shapes

B) Set `tool_choice` to `{"type": "tool", "name": "extract_invoice"}` so the same extraction tool always runs regardless of document type

C) Set `tool_choice` to `{"type": "auto"}` so Claude evaluates the document and decides whether calling a tool is appropriate

D) Set `tool_choice` to `{"type": "any"}` so Claude must call one of the three tools but can pick whichever matches the document

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: Set `tool_choice` to `{"type": "any"}` so Claude must call one of the three tools but can pick whichever matches the document

**정답 및 해설:**

**핵심 개념:**
Anthropic Claude API의 `tool_choice` 파라미터 조작에 관한 문제입니다. Claude에게 도구 사용을 강제하면서도 복수의 도구 옵션 중 문서 유형에 적합한 도구를 모델 스스로 선택하게 만들려면 `{"type": "any"}` 옵션을 지정해야 합니다.

**문제 상황 분석:**
- 입력 파일이 송장, 이력서, 계약서 중 하나이지만 사전 유형 분류가 불가능한 상황입니다.
- 제공된 도구는 `extract_invoice`, `extract_resume`, `extract_contract` 총 3개입니다.
- 파이프라인 안전성을 위해 일반 텍스트 응답으로 이탈하는 것을 방지하고, 제공된 3개의 도구 중 정확히 하나를 **강제로 호출(Forced tool use)**하게 만들어야 합니다.

**D번이 정답인 이유:**
`tool_choice: {"type": "any"}` 설정은 Claude가 제공된 도구 목록(`tools`) 중에서 **반드시 하나 이상의 도구를 호출하도록 강제**합니다. 동시에 특정한 도구 하나만을 고정하는 것이 아니라, 정의된 도구들 중 어떤 도구를 사용할지 모델이 전달된 입력(문서 내용)을 분석하여 자유롭게 판단할 수 있게 해줍니다. 따라서 일반 텍스트 응답 방지와 유연한 도구 선택이라는 요구사항을 완벽히 충족합니다.

**오답 분석:**
- Option A (오답): `tools` 파라미터를 아예 제거하면 Claude API의 도구 호출(Tool Use) 기능을 사용할 수 없으며, 프롬프트 지시만으로는 모델이 일반 텍스트나 잘못된 형식으로 응답하는 것을 보장하여 막을 수 없습니다.
- Option B (오답): `{"type": "tool", "name": "extract_invoice"}` 설정은 문서 내용이 이력서나 계약서이더라도 무조건 `extract_invoice` 도구만 강제로 호출하므로 잘못된 도구가 실행됩니다.
- Option C (오답): `{"type": "auto"}`는 Claude API의 기본 동작으로, 모델이 도구를 호출할지 아니면 일반 텍스트로 응답할지를 스스로 결정합니다. 따라서 파이프라인이 일반 텍스트 응답으로 이탈할 가능성이 존재합니다.

---

### 60번 문제

**1. 문제 원문**

A pull-request review agent is meant to flag branches (conditional paths) that lack test coverage. In practice it inconsistently flags newly introduced branches that are already exercised indirectly by an existing integration test, producing noisy false positives that erode reviewer trust. Detailed instructions about 'coverage' have not resolved the inconsistency. What should the team add to the prompt?

A) A couple of examples pairing a diff with a coverage judgment: one branch with no test, one covered indirectly

B) A requirement to run the full test suite and flag any branch under one hundred percent line coverage

C) A rule treating any file changed by fewer than ten lines as automatically having adequate coverage

D) An instruction to flag every new conditional branch in a diff regardless of the surrounding test suite entirely

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
A번: A couple of examples pairing a diff with a coverage judgment: one branch with no test, one covered indirectly

**정답 및 해설:**

**핵심 개념:**
퓨샷 프롬프팅(Few-Shot Prompting / In-Context Learning)을 활용한 복잡한 판단 기준의 명확화입니다. 텍스트 지시(Zero-shot instruction)만으로 모호하거나 미묘한 에지 케이스(예: 간접 커버리지 판단)를 모델이 제대로 구분하지 못할 때는 구체적인 입력-출력 예시(Few-shot Examples)를 제공하는 것이 가장 효과적입니다.

**문제 상황 분석:**
- PR 검토 에이전트가 테스트 커버리지가 부족한 코드 분기를 판별하는 역할을 수행합니다.
- 기존 통합 테스트에 의해 간접적으로 테스트되는 새 분기에 대해 거짓 양성(False Positive) 경고를 일관성 없이 발생시켜 신뢰도를 저하시키고 있습니다.
- '커버리지'에 대한 구체적인 서술형 지시사항을 프롬프트에 추가했음에도 일관성 문제가 해결되지 않는 상황입니다.

**A번이 정답인 이유:**
Anthropic 프롬프트 엔지니어링 가이드라인에 따르면, 모호한 개념("간접적으로 테스트됨"과 "테스트되지 않음")을 모델에 학습시킬 때 구체적인 지시어(Instruction)만으로는 한계가 있습니다. 실제 코드 변경사항(Diff)과 이에 대한 올바른 커버리지 판단 결과가 쌍을 이루는 예시(Examples)를 프롬프트에 직접 제공하는 퓨샷 기술을 적용하면, Claude가 패턴을 명확히 파악하여 비일관적인 경고 문제를 가장 효과적으로 해결할 수 있습니다.

**오답 분석:**
- Option B (오답): 전체 테스트 수트를 무조건 실행하고 100% 미만 커버리지를 모두 경고하는 것은 검토 노이즈(False Positive)를 오히려 크게 증가시키고 실행 비용/시간을 극대화합니다.
- Option C (오답): 10줄 미만 변경 파일을 무조건 안전하다고 간주하는 임의적 하드코딩 규칙은 실제 커버리지가 누락된 중요한 버그 경로를 놓치게 만듭니다.
- Option D (오답): 주변 테스트 상황을 무시하고 모든 조건부 분기를 무조건 경고하는 것은 간접 커버리지 분기까지 모두 경고 대상으로 만들어 문제의 원인인 거짓 양성을 극대화합니다.

---

### 61번 문제

**1. 문제 원문**

A legal-review pipeline must guarantee that every submitted contract receives a result within 30 hours of arrival, using the Message Batches API's up-to-24-hour processing window. How often must the pipeline start a new batch submission cycle to guarantee this SLA in the worst case?

A) At least once every 6 hours, since a contract can wait up to that interval before inclusion and still finish within 24 hours before the 30-hour deadline

B) At least once every 24 hours, since that matches the batch processing window and therefore satisfies any SLA built on top of it

C) At least once every 30 hours, since the submission cadence should simply mirror the length of the SLA the pipeline promises

D) At least once every 18 hours, since leaving extra headroom beyond the minimum required interval better protects an already generous SLA

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
A번: At least once every 6 hours, since a contract can wait up to that interval before inclusion and still finish within 24 hours before the 30-hour deadline

**정답 및 해설:**

**핵심 개념:**
Anthropic Message Batches API의 최악 시간 계산 및 SLA(Service Level Agreement) 설계 공식입니다. 전체 대기 시간은 '다음 배치 제출까지의 대기 시간(Accumulation/Ingestion Delay)'과 '배치 처리 시간(Processing Window)'의 합으로 결정됩니다.

**문제 상황 분석:**
- 전체 SLA 목표시간: 도착 후 최대 30시간 이내 결과 제공
- Message Batches API의 최대 처리 시간: 최대 24시간
- 최악의 경우(Worst Case): 어떤 계약서가 이전 배치 제출 직후에 도착하여 다음 배치가 제출될 때까지 최대 주깃값만큼 대기하고, 해당 배치가 최대 처리 시간인 24시간을 풀로 채워 처리되는 상황입니다.

**A번이 정답인 이유:**
최악의 대기 시간을 수식으로 표현하면 다음과 같습니다.
$$\text{최대 소요 시간} = \text{배치 제출 주기}(T) + \text{배치 최대 처리 시간}(24\text{시간}) \le 30\text{시간}$$
$$T + 24 \le 30 \implies T \le 6\text{시간}$$
따라서 다음 배치 제출 주기는 최소 6시간마다 한 번씩 시작되어야 합니다. 계약서가 이전 배치를 놓치고 최대 6시간 동안 대기하더라도, 배치 처리 시간 최대 24시간을 더하면 $6 + 24 = 30$시간으로 보장된 SLA 마감 시한을 완벽히 준수할 수 있습니다.

**오답 분석:**
- Option B (오답): 24시간 주기로 제출할 경우, 최악의 대기 시간은 $24\text{시간}(\text{대기}) + 24\text{시간}(\text{처리}) = 48\text{시간}$이 되어 30시간 SLA를 초과합니다.
- Option C (오답): 30시간 주기로 제출할 경우, 최악의 대기 시간은 $30\text{시간}(\text{대기}) + 24\text{시간}(\text{처리}) = 54\text{시간}$이 되어 SLA를 크게 위반합니다.
- Option D (오답): 18시간 주기로 제출할 경우, 최악의 대기 시간은 $18 + 24 = 42$시간이 되어 30시간 SLA를 초과하게 됩니다.

---

### 62번 문제

**1. 문제 원문**

An HR onboarding pipeline extracts a "start_date" field, but the model returns it in "DD/MM/YYYY" order while the schema requires "YYYY-MM-DD". The form clearly shows the actual date; only the field's formatting is wrong. What is the appropriate response?

A) Treat this as a semantic error needing a calculated-value cross-check rather than a simple formatting retry

B) Retry with feedback naming the required format, since the underlying date is already present and this is purely formatting

C) Abandon structured extraction for this field entirely and store the date only as free text from now on

D) Treat this as unrecoverable and escalate straight to a human reviewer without ever attempting a corrective retry first here

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
B번: Retry with feedback naming the required format, since the underlying date is already present and this is purely formatting

**정답 및 해설:**

**핵심 개념:**
LLM 시스템의 스키마 검증 실패 시 오류 복구 패턴(Self-Correction via Feedback)입니다. 추출하려는 원본 데이터의 의미적 내용(Semantic Date)이 올바르고 단순 포맷 미스매치가 발생한 경우, 필요한 포맷을 교정 피드백으로 명시하여 모델에 재요청(Retry)하는 것이 가장 적절한 처리 방식입니다.

**문제 상황 분석:**
- HR 온보딩 입력 양식에 날짜 데이터 자체는 올바르게 들어있습니다.
- 모델이 추출한 값은 `DD/MM/YYYY` 형식이고, 목표 스키마의 요구 포맷은 `YYYY-MM-DD`입니다.
- 정보의 부재나 로직상의 의미적 오류가 아닌, 순수한 단순 표기/포맷 형식의 오류 상황입니다.

**B번이 정답인 이유:**
원본 날짜 데이터가 원본에 존재하고 단순히 포맷 표현 방식만 차이가 나는 오류는 교정 재시도(Corrective Retry)로 손쉽게 해결할 수 있습니다. 스키마 검증기(Validator)에서 발생한 에러 메시지("형식이 YYYY-MM-DD이어야 함")를 Claude에게 피드백으로 전달하여 재요청하면, 모델이 전달받은 포맷 지침을 바탕으로 올바른 정규화 형식(`YYYY-MM-DD`)으로 즉시 바로잡아 응답할 수 있습니다.

**오답 분석:**
- Option A (오답): 날짜 자체의 값이 잘못된 것이 아니라 서식만 틀린 것이므로, 계산 값 교차 검증이 필요한 의미론적 오류(Semantic Error)가 아닙니다.
- Option C (오답): 단지 포맷 오류라는 이유만으로 구조화 데이터 추출(Structured Extraction)을 완전히 포기하고 자유 텍스트로 저장하는 것은 데이터 파이프라인 설계를 저해합니다.
- Option D (오답): 단순 포맷 오류를 복구 불가능한 문제로 판단하여 사람의 개입(Human-in-the-loop)으로 곧바로 이관하는 것은 불필요한 인적 리소스 소모를 야기하며, 자동화 교정 재시도를 먼저 시도해야 합니다.

---

### 63번 문제

**1. 문제 원문**

An operations lead argues that because most Message Batches finish processing in under an hour, the team can safely promise customers a fixed 90-minute turnaround for a nightly summarization job. A colleague pushes back on this plan. What is the strongest technical objection to the promise?

A) The Batches API carries no guaranteed latency SLA, so a batch can legitimately take up to 24 hours under heavy demand, making a fixed 90-minute promise unreliable

B) The Batches API caps total daily throughput per workspace, so a 90-minute promise would only be broken once the workspace exceeds its allotted request volume

C) Summarization requests inherently take longer to process than other request types, so 90 minutes is too short a window regardless of typical batch completion times

D) Fixed turnaround promises are incompatible with the Batches API because every batch must be manually retrieved through the console rather than through automated polling

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
A번: The Batches API carries no guaranteed latency SLA, so a batch can legitimately take up to 24 hours under heavy demand, making a fixed 90-minute promise unreliable

**정답 및 해설:**

**핵심 개념:**
Anthropic Message Batches API의 처리 시간 처리 모델 및 SLA(Service Level Agreement) 사양입니다. Message Batches API는 비동기식 대량 처리를 통해 비용을 50% 절감하는 대신, 지연 시간(Latency)에 대한 짧은 완료 시간을 보장하지 않고 최대 24시간 내 처리를 목표로 설계되었습니다.

**문제 상황 분석:**
- 운영 팀장은 평소 배치가 1시간 이내로 완료된다는 관측 데이터만을 근거로 고객에게 "90분 이내 처리 완료"라는 고정 SLA를 약속하자고 제안합니다.
- 동료는 이 약속의 위험성을 지적하며 기술적으로 반대하려 합니다.
- 시스템 서비스 수준 계약(SLA) 측면에서 Batches API가 제공하는 공식 명세와의 충돌점을 찾는 것이 핵심입니다.

**A번이 정답인 이유:**
Anthropic 공식 문서에 따르면 Message Batches API는 최단 처리 시간이나 짧은 완료 시간을 보장(Guarantee)하는 SLA를 제공하지 않습니다. 대다수의 작업이 통상 1시간 내외로 일찍 끝난다 하더라도, 트래픽 폭주나 서버 부하 상황에서는 공식 처리 기한인 최대 24시간까지 소요되는 것이 시스템상 정상 동작(Legitimate Behavior)입니다. 따라서 90분과 같은 짧은 고정 완성 시간을 고객에게 약속하는 것은 서비스 장애로 직결될 수 있으므로 기술적으로 가장 강력한 반대 근거가 됩니다.

**오답 분석:**
- Option B (오답): 워크스페이스별 요청량 제한(Rate Limit) 문제보다, 배치 API 자체의 비동기적 지연 시간 무보장 특성이 90분 SLA 약속을 이행하지 못하게 만드는 근본적인 원인입니다.
- Option C (오답): 요약 요청이라고 해서 모델 내부적으로 배치 처리 창(Window) 자체를 수 시간 이상 지연시키지는 않으며, 문제의 핵심은 요청 유형이 아닌 Batches API의 latency 보장 여부입니다.
- Option D (오답): Message Batches API는 콘솔 수동 조회뿐만 아니라 API 요청을 통한 자동화된 폴링(Polling)이나 웹훅/결과 조회가 완전히 지원됩니다.

---

### 64번 문제

**1. 문제 원문**

Over several months, a code-review assistant's structured findings include a `detected_pattern` field, and the team aggregates dismissal rates by pattern value. They discover that findings tagged with `detected_pattern` "decorator-wrapped test fixture" are dismissed over 90% of the time. What is the primary value this feedback loop provides?

A) It pinpoints one over-triggering pattern so the detection rule can be tuned or suppressed for that construct specifically

B) It confirms that developers dismiss findings at random and that the review process should therefore be discontinued entirely

C) It proves the extraction tool's JSON schema itself has a syntax defect that must be patched before the next release

D) It lets the team automatically close every future finding across all categories without any developer review at all

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
A번: It pinpoints one over-triggering pattern so the detection rule can be tuned or suppressed for that construct specifically

**정답 및 해설:**

**핵심 개념:**  
AI 코드 리뷰 어시스턴트 모니터링 및 피드백 루프(Feedback Loop) 모범 사례입니다. 구조화된 필드 데이터를 기반으로 기각률(Dismissal Rate)을 집계하면 과도한 오탐(False Positive / Over-triggering) 패턴을 파악하여 탐지 규칙을 정밀하게 미세 조정(Tuning)하거나 억제(Suppression)할 수 있습니다.

**문제 상황 분석:**  
- AI 기반 코드 검토 도구가 탐지 패턴별로 결과를 출력하고 있습니다.
- 특정 패턴("decorator-wrapped test fixture")의 기각률이 90% 이상으로 매우 높게 관측되었습니다.
- 이러한 피드백 루프 데이터를 활용하여 시스템을 개선하는 가장 직접적인 기술적 목적을 찾아야 합니다.

**A번이 정답인 이유:**  
90% 이상의 높은 기각률은 해당 규칙이 개발자에게 실질적인 유효성을 제공하지 못하고 오탐(False Positive)을 남발하고 있음을 의미합니다. 구조화된 데이터 모니터링 피드백 루프를 통해 이와 같이 과도하게 트리거되는 특정 패턴을 명확히 식별(Pinpoint)해냄으로써, 프롬프트나 탐지 규칙을 해당 코드 구조에 맞게 수정(Tune)하거나 불필요한 알림을 차단(Suppress)하여 노이즈를 줄이고 검토 신뢰도를 높일 수 있습니다.

**오답 분석:**  
- Option B (오답): 개발자들이 무작위로 기각하는 것이 아니라 특정 패턴에만 기각률이 90% 이상 집중된 상황이므로 검토 프로세스 전체를 중단할 이유가 없습니다.
- Option C (오답): 높은 기각률은 AI 판단 규칙의 도메인 적합성 문제이지, JSON 스키마 자체의 구문 에러(Syntax Defect)와는 무관합니다.
- Option D (오답): 특정 카테고리의 오탐을 발견했다고 해서 모든 카테고리의 향후 결과를 개발자 검토 없이 자동으로 종결(Close)하는 것은 위험한 일반화 오류입니다.

---

### 65번 문제

**1. 문제 원문**

A support-automation platform routes incoming tickets to one of several extraction tools depending on ticket type: bug_report, feature_request, or billing_issue. The routing logic currently inspects keywords in the ticket text with regex before choosing which single tool to force via tool_choice, but the regex misclassifies many tickets, leading to the wrong tool being forced. What is a better architecture using tool_choice?

A) Force each of the three tools in three separate parallel requests per ticket, then keep whichever single response happens to return without an error

B) Keep the regex-based routing exactly as-is, but improve the accuracy of the regex patterns since tool_choice cannot influence which tool Claude ultimately calls

C) Register all three tools and set tool_choice to {"type": "auto"} so Claude can choose to skip calling a tool for tickets that seem too ambiguous to classify

D) Register all three extraction tools in the same request and set tool_choice to {"type": "any"}, letting Claude read the ticket and select the correct tool itself

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: Register all three extraction tools in the same request and set tool_choice to {"type": "any"}, letting Claude read the ticket and select the correct tool itself

**정답 및 해설:**

**핵심 개념:**
Claude API의 `tool_choice` 파라미터 제어 및 라우팅 패턴 설계입니다. 외부 정규표현식(Regex) 기반 분류기의 오류를 방지하고, 모델이 문맥(Semantic Context)을 직접 이해하여 여러 도구 옵션 중 반드시 하나를 선택하도록 강제하는 방법입니다.

**문제 상황 분석:**
- 시스템이 티켓을 `bug_report`, `feature_request`, `billing_issue` 중 하나의 extraction tool로 라우팅해야 합니다.
- 기존의 사전 정규표현식(Regex) 방식은 키워드 매칭 오류로 인해 잘못된 도구를 강제 전달하는 오작동이 빈번합니다.
- 단순 텍스트로 탈출하지 않으면서도(추출 필수), Claude가 티켓의 문맥을 분석하여 올바른 도구를 스스로 선택하도록 만드는 아키텍처 개선이 필요합니다.

**D번이 정답인 이유:**
단일 요청 내에 세 가지 도구를 모두 제공(`tools`)하고, `tool_choice`를 `{"type": "any"}`로 설정하면 Claude는 일반 텍스트 응답을 출력하는 대신 **제공된 도구 목록 중 하나를 무조건 호출**해야 합니다. 이를 통해 Claude의 자연어 이해 능력을 활용하여 정규표현식의 분류 오류를 완벽히 대체함과 동시에 반드시 추출 도구가 실행되도록 강제할 수 있습니다.

**오답 분석:**
- Option A (오답): 모든 티켓에 대해 3개의 병렬 API 요청을 보내는 것은 불필요한 토큰 비용과 컴퓨팅 리소스를 3배로 낭비하게 만듭니다.
- Option B (오답): 정규표현식 패턴 개선은 취약한 키워드 매칭 한계를 근본적으로 해결하지 못하며, `tool_choice`가 호출 도구에 영향을 줄 수 없다는 설명도 기술적으로 거짓입니다.
- Option C (오답): `{"type": "auto"}`는 Claude가 도구를 호출하지 않고 일반 텍스트 응답으로 돌아갈(fallback) 가능성을 열어두기 때문에, 항상 추출 도구가 실행되어야 하는 자동화 파이프라인에는 적합하지 않습니다.

---

### 66번 문제

**1. 문제 원문**

A team building a resume-parsing tool wants to guarantee that structured candidate data is extracted via a `parse_resume` tool on the current turn. They also want to know whether Claude can include natural-language reasoning about ambiguous resume sections before that tool call. Which `tool_choice` configuration should be used to guarantee the `parse_resume` call, and what does Anthropic documentation state about natural-language commentary before a forced tool call?

A) `tool_choice: {"type": "auto"}`, combined with an explicit user-message instruction to use the `parse_resume` tool and share any relevant reasoning as text

B) `tool_choice: {"type": "tool", "name": "parse_resume"}`, because this is the documented way to force the specific tool; the trade-off is that forced tool use suppresses natural-language text before the tool call

C) `tool_choice: {"type": "any"}`, because `any` allows Claude to freely mix natural-language commentary with the forced tool call in the same response

D) `tool_choice: {"type": "none"}`, so Claude can freely decide in text whether to also produce a `parse_resume` tool call afterward

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
B번: `tool_choice: {"type": "tool", "name": "parse_resume"}`, because this is the documented way to force the specific tool; the trade-off is that forced tool use suppresses natural-language text before the tool call

**정답 및 해설:**

**핵심 개념:**  
Anthropic Claude API의 `tool_choice` 파라미터 동작 방식 및 강제 도구 사용(Forced Tool Use) 시 트레이드오프입니다. 특정 도구를 명시적으로 지정하여 실행을 보장할 수 있지만, 도구가 강제될 경우 도구 호출 전 작성되는 일반 자연어 텍스트 생성이 억제(Suppression)되는 특성이 있습니다.

**문제 상황 분석:**  
- 이력서 파싱 서비스에서 현재 턴에 `parse_resume`이라는 특정 도구가 반드시 호출되도록 보장해야 합니다.
- 동시에 도구 호출 전 모호한 이력서 영역에 대한 자연어 추론/해설을 포함할 수 있는지 여부를 공식 문서 기준으로 확인하려 합니다.
- 특정 도구 강제 제어 파라미터 구성법과 해당 기능 사용 시 발생하는 동작 제약 조건을 파악해야 합니다.

**B번이 정답인 이유:**  
Anthropic 공식 문서에 따르면 특정 단일 도구의 호출을 보장하려면 `tool_choice: {"type": "tool", "name": "parse_resume"}` 형태로 지정해야 합니다. 또한 공식 문서에는 특정한 도구가 강제로 설정될 경우, 모델은 도구 호출 전 서술형 자연어 텍스트(Natural-language text/commentary)를 함께 출력하는 대신 곧바로 도구 호출(Tool call)에 필요한 JSON 객체만 생성하도록 유도 및 억제된다고 명시되어 있습니다. 따라서 B번이 기술적 사양과 공식 문서 지침을 정확히 설명합니다.

**오답 분석:**  
- Option A (오답): `{"type": "auto"}`는 모델이 도구를 호출할지 일반 텍스트로 응답할지 스스로 판단하게 만들므로, 사용자 프롬프트에 지시를 추가하더라도 API 수준에서 특정 도구 호출을 100% 보장하지 못합니다.
- Option C (오답): `{"type": "any"}`는 전체 도구 중 하나를 호출하도록 강제하지만 어떤 도구가 실행될지 지정하지 못하며, 강제 도구 사용 시 자연어 해설 생성을 자유롭게 혼용할 수 있다는 설명 역시 오답입니다.
- Option D (오답): `{"type": "none"}`은 도구 호출을 완전히 비활성화(Disable)하는 설정이므로 `parse_resume` 도구가 실행되지 않습니다.

---

### 67번 문제

**1. 문제 원문**

A real estate platform extracts property listings from scraped web pages using a single `describe_property` tool. The `square_footage` field is defined as a required number, but many older listings state size only in vague prose like "spacious with room to grow" and never give a numeric figure. Extraction logs show the model consistently inventing plausible square footage values for these listings. Which two schema changes together best resolve this while preserving data quality for downstream reports?

A) Keep `square_footage` required, but change its type to string so the model can output a placeholder like "unspecified" or "N/A" instead of fabricating a number, ensuring the field is always present.

B) You can make `square_footage` optional for missing values and add a `square_footage_source` enum that stores 'stated', 'estimated', or 'unknown' so reports can separate confirmed from absent values.

C) Keep `square_footage` required, and add a system prompt instruction (e.g., "Do not guess; output 'N/A' for missing data") and a configuration flag to require manual review of any numeric output.

D) Remove `square_footage` from the schema entirely, and rely on a separate keyword-search script to scan raw listing text for numeric patterns and inject the first match into a staging column for reports.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
B번: You can make `square_footage` optional for missing values and add a `square_footage_source` enum that stores 'stated', 'estimated', or 'unknown' so reports can separate confirmed from absent values.

**정답 및 해설:**

**핵심 개념:**
LLM 정보 추출 시스템의 환각(Hallucination) 방지 및 스키마 설계 모범 사례(Schema Design Best Practice)입니다. 원본 데이터에 특정 값이 누락되어 있을 때, 해당 필드를 필수(required) 수치 타입으로 지정하면 모델은 스키마 검증 실패를 피하기 위해 임의의 값을 지어내는 환각 현상을 일으킵니다. 이를 방지하려면 필드를 선택 항목(optional)으로 전환하고 메타데이터(출처/신뢰도 enum)를 함께 정의하는 스키마 개편이 필요합니다.

**문제 상황 분석:**
- 원본 웹페이지에 면적 수치가 없고 모호한 텍스트만 존재합니다.
- 추출 스키마에서 `square_footage`가 필수(required) 숫자(number) 타입으로 정의되어 있어, Claude가 스키마 형식을 맞추려고 그럴듯한 숫자를 지어내고(환각) 있습니다.
- 후속 다운스트림 리포트의 데이터 품질(숫자 타입 유지 및 실제 수치 유무 구분)을 보장하는 최적의 스키마 변경 방법 2가지를 조합해야 합니다.

**B번이 정답인 이유:**
1. **`square_footage`를 optional로 변경**: 누락된 데이터에 대해 모델이 억지로 숫자를 지어내지 않고 필드를 생략하거나 `null`로 반환할 수 있게 하여 환각을 근본적으로 차단합니다.
2. **`square_footage_source` enum 필드 추가**: `'stated'`(명시됨), `'estimated'`(추정됨), `'unknown'`(알 수 없음) 등의 출처 메타데이터 필드를 추가함으로써 다운스트림 리포팅 시스템이 실제 확인된 값과 누락/추정 데이터를 명확히 분리하여 집계할 수 있게 해줍니다.

**오답 분석:**
- Option A (오답): 숫자형 데이터를 다루는 필드를 문자열(`string`)로 변경하고 `"N/A"`나 `"unspecified"` 같은 자리표시자 텍스트를 채우게 만들면, 후속 리포트 시스템에서 해당 필드를 숫자형으로 계산/수학적 연산(평균 계산 등)을 할 때 유형 오류가 발생하여 데이터 품질이 저하됩니다.
- Option C (오답): 숫자 타입으로 정의된 필수 필드에 `"N/A"`라는 문자열을 출력하라는 지시를 내리면 JSON 스키마 타입 검증 오류(Type Validation Error)가 발생합니다. 또한 모든 숫자 출력에 대해 수동 검토를 거치게 하는 것은 자동화 파이프라인의 효율성을 저해합니다.
- Option D (오답): 스키마에서 필드를 완전히 제거하고 단순 정규표현식/키워드 스크립트에 의존하는 것은 모호한 서술문 문맥을 처리하지 못하며 LLM을 통한 정보 추출의 이점을 포기(abandonment)하는 잘못된 아키텍처입니다.

---

### 68번 문제

**1. 문제 원문**

A code-review assistant reports findings in three categories: security, correctness, and style. The style category has a 60% false positive rate while security and correctness are both above 90% precision. Developers say they now distrust every finding the tool produces, including the security ones. Which explanation best accounts for this reaction?

A) Developers are miscounting the false positive rate because they are including security findings that were later fixed, leading them to distrust the tool's accuracy, even for security findings.

B) Security and correctness findings are inherently harder to verify than style findings, so developers assume the reported precision figures cannot be trusted, since they are often harder to verify.

C) The tool's overall accuracy score is mathematically dominated by the style category, so the reported precision numbers for security are actually inflated, eroding trust in the tool's accuracy.

D) A single category with a high false positive rate can undermine confidence in the tool's accurate categories, because developers experience all findings as coming from one undifferentiated source.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: A single category with a high false positive rate can undermine confidence in the tool's accurate categories, because developers experience all findings as coming from one undifferentiated source.

**정답 및 해설:**

**핵심 개념:**
AI 에이전트 및 자동화 도구 도입 시 발생하는 사용자 경험(UX) 및 피로도(Alert Fatigue / Trust Erosion) 심리학에 관한 개념입니다. 사용자는 시스템이 출력하는 결과를 카테고리별로 분리해서 인식하기보다, 하나의 '통합된 출처(Single Undifferentiated Source)'에서 나온 출력물로 인식합니다.

**문제 상황 분석:**
- 보안(Security) 및 정확성(Correctness) 카테고리는 90% 이상의 매우 높은 정밀도(Precision)를 보입니다.
- 반면, 스타일(Style) 카테고리는 60%라는 높은 오탐률(False Positive Rate)을 나타냅니다.
- 개발자들은 정밀도가 높은 보안 알림까지 포함하여 도구 전체의 결과를 불신하고 배척하는 현상이 발생했습니다.

**D번이 정답인 이유:**
개발자(사용자) 관점에서는 AI 도구가 제공하는 모든 결과물이 "동일한 하나의 AI 리뷰어"에서 생성된 것으로 체감됩니다. 높은 오탐률을 가진 단 하나의 카테고리(스타일)가 전체적인 도구의 신뢰도를 잠식하여, 실제로는 정밀도가 높은 다른 카테고리(보안, 정확성)의 경고까지 무시하게 만드는 전형적인 신뢰 훼손(Trust Erosion) 현상을 정확히 설명합니다.

**오답 분석:**
- Option A (오답): 개발자가 수정된 이슈를 포함해 오탐률을 잘못 계산했다는 것은 사용자 심리적 불신의 근본적인 아키텍처/경험적 원인을 설명하지 못합니다.
- Option B (오답): 보안 및 정확성 이슈의 검증 난이도가 높아서 보고된 정밀도 수치 자체를 불신한다는 주장은 문제에서 제시된 "스타일 카테고리의 60% 오탐률이 유발한 전체적 불신"이라는 맥락과 부합하지 않습니다.
- Option C (오답): 전체 정확도 점수가 수학적으로 부풀려졌다는 주장은 가설일 뿐이며, 개별 카테고리의 실제 정밀도 수치(보안 > 90%)가 거짓임을 증명하는 설명이 아닙니다.

---

### 69번 문제

**1. 문제 원문**

An architect is comparing two candidate prompts for a security-findings category before choosing one for production. Prompt X says: "Flag anything that looks like it could be a security risk." Prompt Y says: "Flag code that writes user-supplied input directly into a SQL query string without parameterization, or that stores a plaintext password." Which statement correctly evaluates the two prompts with respect to reducing false positives?

A) Prompt Y is worse because its specific examples of SQL injection and plaintext passwords will cause the model to focus on those patterns and miss other risks, leading to more false negatives.

B) Prompt X is preferable because its broad phrasing allows the model to capture a wider range of security threats, including subtle logic flaws and misconfigurations that Prompt Y's specific list might miss.

C) The two prompts are functionally equivalent, as both ultimately rely on the model's general security knowledge to determine what constitutes a risk, making the specific wording irrelevant to false-positive rates.

D) Prompt Y is preferable because it names specific, checkable conditions that define a security issue, while Prompt X relies on an open-ended judgment about what 'looks like' a risk.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: Prompt Y is preferable because it names specific, checkable conditions that define a security issue, while Prompt X relies on an open-ended judgment about what 'looks like' a risk.

**정답 및 해설:**

**핵심 개념:**
Anthropic 프롬프트 엔지니어링 가이드라인에서의 '명확성 및 구체성(Clarity and Specificity)' 원칙입니다. 개방적이고 모호한 판단 지시("위험해 보이는 것")는 모델의 주관적 추론 폭을 넓혀 무수한 거짓 양성(False Positives, 오탐)을 유발합니다. 반면, 명확하고 검증 가능한 명시적 기준(SQL 인젝션, 평문 비밀번호 저장 등)을 정의하는 프롬프트는 판단 기준을 고정시켜 오탐을 크게 줄입니다.

**문제 상황 분석:**
- 프롬프트 X: "보안 위험처럼 보이는 것은 무엇이든 표시하라" (모호하고 개방적인 지시)
- 프롬프트 Y: "매개변수화 없이 사용자 입력을 SQL 쿼리에 직접 쓰거나 평문 패스워드를 저장하는 코드를 표시하라" (구체적이고 검증 가능한 지시)
- 평가 기준: 오탐률(False Positive Rate)을 낮추는 관점에서 어떤 평가가 옳은지 파악해야 합니다.

**D번이 정답인 이유:**
오탐(False Positive)을 줄이는 가장 결정적인 요소는 지시문의 구체성입니다. 프롬프트 X처럼 모호한 어조로 지시할 경우, 모델은 조금이라도 의심스럽거나 평범한 코드 구문까지 전부 위험으로 판단하여 과도한 오탐 알림을 발생시킵니다. 반면 프롬프트 Y는 명확하게 검증 가능한 조건(Checkable Conditions)을 명시하므로, 조건에 부합하지 않는 일반 코드를 잘못 감지하는 오탐 현상을 효과적으로 억제할 수 있어 더 바람직합니다.

**오답 분석:**
- Option A (오답): 질문의 핵심 평가 기준은 '오탐 줄이기(Reducing False Positives)'입니다. 프롬프트 Y가 미탐(False Negative)을 늘릴 수 있다는 주장은 질문이 요구하는 '오탐 감소 효과'에 대한 적절한 프롬프트 평가가 아닙니다.
- Option B (오답): 포괄적인 문구(Prompt X)는 위험 탐지 범위를 넓힐 수 있지만, 그 반대급부로 엄청난 양의 오탐(False Positive)을 양산하므로 "오탐 줄이기" 목적에 정반대되는 접근 방식입니다.
- Option C (오답): 프롬프트의 구체성은 모델의 판단 범위와 오탐률에 매우 결정적인 영향을 미치므로, 두 프롬프트가 기능적으로 동일하다는 설명은 틀렸습니다.

---

### 70번 문제

**1. 문제 원문**

A team's code-review assistant prompt already spells out an exhaustive, itemized rubric for flagging issues, but reviewers still receive inconsistently formatted findings across runs: some list severity before location, others omit the suggested fix entirely. The team wants the most effective fix for this output-consistency problem. What should they do?

A) Rewrite the rubric as an even longer numbered list that spells out every field, its position, and its formatting rule in detail

B) Split the prompt into two calls: one that generates findings and a second that reformats them into the target schema

C) Add three to five worked examples in example tags that each show the exact field order and formatting wanted

D) Lower the temperature parameter to zero so the same tokens are sampled deterministically across every single run

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
C번: Add three to five worked examples in example tags that each show the exact field order and formatting wanted

**정답 및 해설:**

**핵심 개념:**
Anthropic 프롬프트 엔지니어링 가이드라인에서의 퓨샷 프롬프팅(Few-Shot Prompting) 및 XML 태그 활용 모범 사례입니다. 서술형 자연어 지침(Instruction/Rubric)을 아무리 상세히 늘려 적더라도 모델의 출력 구조 일관성(Output Consistency)을 완벽히 강제하기는 어렵습니다. 정확한 입출력 형식 예시(Worked Examples)를 명시적인 태그로 감싸 제공하는 것이 출력 포맷 완벽 준수를 위한 가장 강력하고 효과적인 방법입니다.

**문제 상황 분석:**
- 이미 상세하고 항목화된 지침(exhaustive, itemized rubric)을 작성하여 제공하고 있습니다.
- 그럼에도 실행할 때마다 필드 순서가 바뀌거나 특정 필드가 누락되는 출력 형식의 비일관성 문제(Output Inconsistency)가 발생하고 있습니다.
- 서술형 지시문 추가 이상의 효과적이고 구조화된 포맷 고정 해결책이 필요합니다.

**C번이 정답인 이유:**
Anthropic 공식 문서에 따르면, 모델이 특정 출력 서식(필드 순서, 필수 구조 등)을 일관되게 따르도록 만드는 가장 검증된 기법은 `<example>` 또는 `<examples>` 태그 내에 원하는 포맷이 완벽히 반영된 예시 3~5개를 직접 제공(Few-shot Examples)하는 것입니다. 모델은 지침문보다 제시된 예시의 구조적 패턴을 직관적으로 학습하여 항상 동일한 형태와 순서로 응답을 생성하게 됩니다.

**오답 분석:**
- Option A (오답): 이미 항목화된 지침이 존재하는 상황에서 서술문/번호 목록을 더 길게 늘려 쓰는 것은 모델의 컨텍스트를 과도하게 늘리고 지침 준수율을 오히려 떨어뜨릴 수 있습니다.
- Option B (오답): 단순 포맷 고정을 위해 전체 추론 과정과 API 호출을 2단계(Two-call)로 분할하는 것은 불필요한 API 비용 및 지연 시간(Latency)을 대폭 증가시키는 과도한 설계(Over-engineering)입니다.
- Option D (오답): `temperature`를 0으로 설정하면 동일한 입력에 대해 샘플링의 무작위성은 줄어들지만, 코드가 달라져 입력이 변할 경우 여전히 지침을 벗어나 무작위 포맷으로 출력될 수 있으므로 포맷 일관성의 근본적인 해결책이 되지 못합니다.

---

### 71번 문제

**1. 문제 원문**

A team is adding few-shot examples to a ticket-triage prompt to fix inconsistent priority assignments. They have dozens of historical tickets available and are deciding how many to include and how to select them. Which approach best follows effective few-shot practice while avoiding new failure modes?

A) Select only the single ticket that was hardest to triage historically as the key lesson

B) Include as many historical tickets as the context window allows for maximum reliability

C) Select three to five diverse examples covering distinct edge cases relevant to triage

D) Select examples entirely at random from the archive to avoid any selection bias

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
C번: Select three to five diverse examples covering distinct edge cases relevant to triage

**정답 및 해설:**

**핵심 개념:** 프롬프트 엔지니어링의 퓨샷 러닝(Few-Shot Learning) 모범 사례입니다. 적절한 개수(보통 3~5개)의 다채롭고 대표성 있는 예시를 제공하여 모델이 작업의 패턴과 경계 조건(Edge Cases)을 명확히 이해하도록 돕는 프롬프트 디자인 기술입니다.

**문제 상황 분석:**
- 개발 팀이 티켓 분류 프롬프트의 불일치 문제를 해결하기 위해 과거 티켓 데이터를 활용하여 퓨샷 예시를 추가하려 함.
- 활용 가능한 과거 데이터는 수십 개가 존재함.
- 모델의 성능을 향상시키면서 과적합, 토큰 낭비, 새로운 실패 유형 발생 등의 부작용을 최소화하는 최적의 예시 선정 방식을 찾아야 함.

**C번이 정답인 이유:**
퓨샷 프롬프팅(Few-Shot Prompting)의 모범 사례는 모델에게 명확한 패턴을 학습시킬 수 있는 3~5개의 대표적이고 다양한 예시(Diverse Examples)를 선별하는 것입니다. 특히 분류 작업에서는 모호하거나 다루기 힘든 예외 케이스(Edge Cases)를 균형 있게 포함함으로써, 모델이 모호한 상황에서도 올바른 우선순위를 판단하도록 유도할 수 있습니다. 예시의 개수가 너무 적지도, 과도하게 많지도 않아 토큰 비용 효율성과 신뢰성을 모두 확보할 수 있는 기술적으로 완벽한 접근법입니다.

**오답 분석:**
- Option A (오답): 단 1개의 가장 어려운 예시만 제공하는 것(One-Shot)은 모델이 일반적인 패턴을 학습하기에 부족하며, 특정 극단적인 사례에 편향(Overfitting)되어 오히려 일반적인 티켓 분류 시 오류가 발생할 수 있습니다.
- Option B (오답): 컨텍스트 창이 허용하는 한 최대한 많은 예시를 넣으면 컨텍스트 과부하, 비용 및 지연 시간(Latency) 증가, 그리고 컨텍스트 중간에 위치한 정보에 집중하지 못하는 "Lost in the Middle" 현상 등의 failure mode가 발생합니다.
- Option D (오답): 무작위 추출은 불균형한 분포를 초래하거나 중요한 예외 케이스 및 핵심 클래스를 누락시킬 수 있으며, 품질이 낮거나 모호한 데이터가 예시로 포함되어 프롬프트 성능을 저하시킬 수 있습니다.

---

### 72번 문제

**1. 문제 원문**

A team built a classification prompt with twenty exact input-output pairs, one for every edge case they had personally encountered in their historical data. The prompt performs well on those twenty inputs but degrades noticeably whenever a customer submits a new input that is similar to, but not identical to, one of the twenty. What change would best help the model generalize its judgment to these novel-but-similar inputs?

A) Remove the examples entirely and rely on a single instruction sentence describing the desired behavior

B) Keep appending every newly discovered literal pair to the prompt so every past case is eventually represented

C) Increase the max_tokens parameter so the model has more room to reason before each classification

D) Reduce the twenty examples to a small set that makes the underlying decision rule visible to the model

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: Reduce the twenty examples to a small set that makes the underlying decision rule visible to the model

**정답 및 해설:**

**핵심 개념:** 프롬프트 엔지니어링에서의 암기(Overfitting/Memorization) 방지 및 일반화(Generalization) 성능 최적화입니다. 지나치게 많은 개별 예시는 모델이 패턴을 이해하는 대신 입출력 형태를 단순히 암기하게 만듭니다.

**문제 상황 분석:**
- 개발 팀이 과거 데이터의 모든 예외 케이스를 커버하기 위해 20개에 달하는 입출력 쌍을 예시로 작성함.
- 동일한 20개 입력에 대해서는 잘 작동하지만, 조금이라도 변형된 신규 유사 입력이 들어오면 성능이 크게 저하됨 (암기 현상 발생).
- 유사하지만 새로운 입력 패턴에도 올바르게 반응할 수 있도록 모델의 '일반화 능력'을 향상시켜야 함.

**D번이 정답인 이유:**
과도한 수(20개)의 예시는 모델이 문제의 근본 원리와 규칙을 파악하는 대신 주어진 예시를 암기하도록 유도하여 과적합(Overfitting)을 일으킵니다. 따라서 예시의 개수를 소수(3~5개 수준)로 축소하고, 분류의 근본적인 판단 기준과 논리 규칙(Decision Rule)이 명확히 드러나도록 정제된 예시를 제시하는 것이 모델의 일반화(Generalization) 능력을 극대화하는 모범 사례입니다.

**오답 분석:**
- Option A (오답): 예시를 완전히 삭제하는 것(Zero-shot)은 규칙이 복잡하거나 예외 케이스가 존재하는 분류 문제에서 모델의 정확도와 응답 일관성을 떨어뜨립니다.
- Option B (오답): 새로운 사례가 나올 때마다 무제한으로 예시를 추가하는 것은 과적합을 심화시키고, 프롬프트의 토큰 비용 증가 및 지연 시간을 유발하며 "Lost in the Middle" 현상으로 성능이 더 악화됩니다.
- Option C (오답): `max_tokens` 파라미터는 모델이 생성할 수 있는 최대 출력 토큰 길이를 제한하는 설정일 뿐이며, 프롬프트의 과적합 문제나 분류 판단의 일반화 능력을 개선하지 못합니다.

---

### 73번 문제

**1. 문제 원문**

An architect wants a review subagent that can analyze generated code but must never modify it. How should the subagent be configured?

A) Grant the subagent Bash access only, since Bash can be used to read file contents without needing dedicated Read or Grep tools

B) Restrict the subagent's tools field to read-only tools like Read, Grep, and Glob, omitting Edit, Write, and Bash

C) Leave the tools field unset so the subagent inherits every tool from the parent, then instruct it in the prompt not to use Edit or Write

D) Grant the subagent Edit and Write access but set permission mode to require manual approval for every edit it proposes

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
B번: Restrict the subagent's tools field to read-only tools like Read, Grep, and Glob, omitting Edit, Write, and Bash

**정답 및 해설:**

**핵심 개념:** Claude Code / AI 에이전트 시스템 architecture의 도구 권한 최소화 및 에이전트 도구 구성(Tool Scope Restriction) 보안 원칙입니다. 시스템 상에서 파일 변경을 원천적으로 차단하기 위해 읽기 전용 툴만 포함하도록 명시적으로 설정합니다.

**문제 상황 분석:**
- 개발자가 생성된 코드를 분석/리뷰하는 서브에이전트를 생성하고자 함.
- 서브에이전트는 코드를 절대 수정해서는 안 되는 강력한 제약 조건을 가짐.
- 프롬프트에만 의존하거나 우회 가능한 위험 없이, 하드 제어(Hard Control) 수준에서 완전한 읽기 전용 모드를 구현해야 함.

**B번이 정답인 이유:**
서브에이전트 설정의 `tools` 필드에서 파일 수정 기능을 가진 `Edit`, `Write`뿐만 아니라, 명령어 실행을 통해 파일 시스템을 변경할 가능성이 있는 `Bash` 권한까지 완전히 제외하는 것입니다. 읽기 전용 도구(`Read`, `Grep`, `Glob`)만 `tools` 목록에 포함하도록 제한함으로써, 에이전트가 의도치 않게 코드베이스를 수정하는 행위를 하드웨어/시스템 스키마 레벨에서 원천 차단할 수 있습니다.

**오답 분석:**
- Option A (오답): `Bash` 권한만 부여할 경우, 모델이 `rm`, `sed`, `echo >` 등의 Shell 명령어를 통해 파일 내용을 얼마든지 수정할 수 있게 되므로 '절대 수정 불가' 제약을 위반하게 됩니다.
- Option C (오답): 프롬프트 지시어(Soft Constraint)에만 의존하여 수정 도구 사용을 금지하는 방식은 프롬프트 탈옥이나 모델의 지시 불이행 시 파일을 수정할 위험이 여전히 존재하는 취약한 방식입니다.
- Option D (오답): 수정 권한을 주고 수동 승인을 받는 방식은 수정 동작 자체를 하드 차단하는 것이 아니며, 사용자에게 불필요한 수동 승인 피로감을 주므로 완벽한 차단 구성 방식이 아닙니다.

---

### 74번 문제

**1. 문제 원문**

An architect is reviewing a schema-enforced invoice extraction tool. The tool_use response consistently returns syntactically valid JSON with the correct field types, yet a downstream finance audit finds that individual line-item amounts frequently fail to sum to the reported invoice total. What should the architect conclude about the current design?

A) The tool_choice must be set to auto instead of a forced tool, since forced tool calls are known to skip internal consistency checks on numeric fields

B) The model is very likely hallucinating the schema itself at request time, so the input_schema needs to be resent with every single follow-up message

C) The JSON schema enforced by tool use guarantees syntactic validity but does not verify semantic correctness such as arithmetic consistency between related fields

D) The schema must be missing a required field constraint, since required fields are the only mechanism that can prevent numeric mismatches between line items and totals

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
C번: The JSON schema enforced by tool use guarantees syntactic validity but does not verify semantic correctness such as arithmetic consistency between related fields

**정답 및 해설:**

**핵심 개념:** JSON 스키마 기반 구조화된 데이터 추출(Structured Data Extraction)의 한계와 검증 범위입니다. 스키마 제약은 구문(Type, Required 여부 등)만 보장할 뿐, 논리적/산술적 의미(Semantic Validity)까지 보장하지 않습니다.

**문제 상황 분석:**
- 청구서 데이터 추출 도구가 올바른 타입의 JSON 규격을 일관되게 생성하고 있음 (구문적 정상).
- 하지만 추출된 개별 품목(line-item) 금액의 합이 청구서 총액(total)과 일치하지 않는 문제가 발생함.
- 도구 사용(tool_use) 시 적용되는 JSON 스키마의 기술적 검증 한계를 올바르게 진단해야 함.

**C번이 정답인 이유:**
LLM의 tool_use 또는 Structured Outputs 기능에 전달되는 JSON Schema는 데이터 타입(`string`, `number` 등) 및 필드 존재 유무와 같은 구문적 유효성(Syntactic Validity)만을 기계적으로 강제합니다. 개별 항목의 합이 총액과 일치하는지와 같은 연산 법칙이나 필드 간의 논리적 일관성, 즉 의미적 정확성(Semantic Correctness)은 스키마 자체로 검증할 수 없습니다. 따라서 이러한 비즈니스 로직 및 산술 검증은 후속 애플리케이션 코드(Downstream Validation)에서 별도로 처리해야 합니다.

**오답 분석:**
- Option A (오답): `tool_choice`를 `auto`나 강제 지정(`tool`)으로 바꾸는 것과 숫자 필드의 산술 일관성 검사 여부는 아무런 관련이 없습니다.
- Option B (오답): 응답이 올바른 타입의 유효한 JSON을 반환하고 있으므로 모델이 스키마 자체를 환각(hallucination)하여 잘못 해석하는 상황이 아닙니다.
- Option D (오답): `required` 속성은 필수 필드의 존재 여부만 제약할 뿐, 개별 항목과 총액 간의 숫자 불일치를 방지하는 계산 검증 기능은 제공하지 못합니다.

---

### 75번 문제

**1. 문제 원문**

After temporarily disabling a high false-positive "performance suggestions" category and rewriting its criteria with specific, checkable rules, an architect must decide when it is safe to re-enable the category for the whole team. What is the most appropriate validation step before re-enabling it broadly?

A) Re-enable the category immediately after the new criteria are added to the repository, because the explicit rules themselves demonstrate improved precision without needing any further validation against historic pull requests.

B) Ask a single senior engineer to review the new criteria against a small set of past pull requests that triggered false positives, and authorize re-enabling if the criteria appear sound based on that manual check.

C) Re-enable the category only for pull requests opened by the engineer who reported the false positives, as a limited pilot to verify the criteria, while keeping it disabled for all other contributors.

D) Run the rewritten prompt against a held-out set of past pull requests with known findings, and confirm its false positive rate has dropped to an acceptable level before re-enabling it for everyone.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: Run the rewritten prompt against a held-out set of past pull requests with known findings, and confirm its false positive rate has dropped to an acceptable level before re-enabling it for everyone.

**정답 및 해설:**

**핵심 개념:** 프롬프트 평가 및 회귀 테스트(Prompt Evaluation & Regression Testing) 모범 사례입니다. AI 프롬프트의 품질을 개선하거나 수정한 후에는 결과를 정량적으로 검증하기 위해 미리 별도로 격리해 둔 검증용 데이터셋(Held-out dataset / Gold standard dataset)을 기반으로 자동화된 벤치마크 테스트를 거쳐야 합니다.

**문제 상황 분석:**
- 코드 리뷰 또는 정적 분석 에이전트의 "성능 제안" 카테고리가 높은 거짓 양성(False Positive)을 발생시켜 임시 비활성화됨.
- 아키텍트가 해당 카테고리의 판단 기준 프롬프트를 명확하고 검증 가능한 규칙으로 수정함.
- 전체 팀에 배포(Re-enable)하기 전, 오탐율이 실제로 줄어들었는지 안전하게 검증하는 가장 정석적인 품질 관리(QA) 절차를 찾아야 함.

**D번이 정답인 이유:**
프롬프트 변경 사항을 배포하기 전에는 결과가 이미 수집되어 있는 과거 실제 데이터셋(Held-out Dataset)을 대상으로 수정된 프롬프트를 실행하여 정량 지표(False Positive Rate)를 측정해야 합니다. 오탐율이 목표치 이하로 감소했음을 객관적인 데이터로 확인한 후 전체 배포를 진행하는 것이 프롬프트 회귀 테스트(Regression Testing)의 모범 사례입니다.

**오답 분석:**
- Option A (오답): 아무런 실제 테스트나 검증 없이 명시적 규칙을 썼다는 이유만으로 즉시 배포하는 것은 맹목적인 추측이며, 실제 운영 환경에서 예기치 못한 Side-effect나 다른 유형의 오탐을 일으킬 수 있습니다.
- Option B (오답): 엔지니어 한 명의 주관적인 수동 눈단속(Manual Check)과 소수 편향 데이터에 의존하는 방식은 정량적인 평가 수치가 부족하며 검증의 객관성과 신뢰성을 담보할 수 없습니다.
- Option C (오답): 오류를 리포트한 특정 개발자의 PR에만 한정하여 활성화하는 라이브 프로덕션 파일럿 방식은 불완전하며, 데이터 샘플의 다양성을 반영하지 못하고 해당 개발자에게 테스트 부담을 전가합니다.

---

### 76번 문제

**1. 문제 원문**

A developer is assembling a batch of translation requests and needs to assign each one an identifier that the Message Batches API will accept and later use to correlate a result with its original request. Which identifier is valid for this purpose?

A) doc-2026-report_final, since it uses only letters, digits, hyphens, and underscores, staying under the 64-character limit

B) doc/2026/report:final, since embedding the ingestion date and a colon-separated section label makes the request easier to trace during a later audit

C) doc#2026#report#final#v2, since separating each descriptive segment with a distinct punctuation mark avoids any ambiguity about where one part ends

D) doc 2026 report final v2, since spaces between each descriptive segment keep the identifier readable when scanning a long results file by eye

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
A번: doc-2026-report_final, since it uses only letters, digits, hyphens, and underscores, staying under the 64-character limit

**정답 및 해설:**

**핵심 개념:** Anthropic Message Batches API의 `custom_id` 식별자 제약 조건 규칙입니다. 각 요청을 식별하는 `custom_id`는 영문자, 숫자, 하이픈(`-`), 언더스코어(`_`)만 허용하며 최대 길이 제약이 있습니다.

**문제 상황 분석:**
- 개발자가 Anthropic Message Batches API를 사용해 대량의 번역 요청을 배치로 처리하려고 함.
- 각 요청 결과를 원본 요청과 매핑하기 위해 사용자 지정 식별자(`custom_id`)를 부여해야 함.
- API 규격상 유효한(Valid) 문자와 길이 제한 조건을 만족하는 식별자를 찾아야 함.

**A번이 정답인 이유:**
Anthropic의 Message Batches API 사양에 따르면, 개별 요청의 `custom_id`는 알파벳 영문자(a-z, A-Z), 숫자(0-9), 하이픈(`-`), 언더스코어(`_`) 조합으로만 구성되어야 하며, 최대 글자 수 제한(64자 이내)을 준수해야 합니다. `doc-2026-report_final`은 특수문자 없이 해당 문자 집합과 길이 제한을 완벽하게 충족하므로 유효한 식별자입니다.

**오답 분석:**
- Option B (오답): 슬래시(`/`) 및 콜론(`:`)은 API에서 허용하지 않는 금지된 특수문자이므로 요청 처리 시 유효성 검사 에러(Validation Error)가 발생합니다.
- Option C (오답): 샵/우물정 기호(`#`)는 식별자 규격에서 지원하지 않는 특수문자이므로 거부됩니다.
- Option D (오답): 공백문자(Space)는 `custom_id`에 포함될 수 없는 유효하지 않은 문자입니다.

---

### 77번 문제

**1. 문제 원문**

A purchase-order extractor uses a strict JSON schema, so every response has correctly typed fields and no missing keys. On one order, the extracted line-item amounts sum to $940 while the extracted "order_total" field reads $980. Both values are individually valid against the schema. How should this discrepancy be classified and handled?

A) As a transient sampling artifact unlikely to recur, so no additional application-level check is really needed here

B) As a schema syntax error, since the two numeric fields disagree with each other despite both matching their declared types here

C) As a semantic error the schema cannot catch, requiring a check that compares a calculated_total against the stated order_total

D) As a tool-input validation failure that strict schema enforcement should already have blocked before it was returned

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
C번: As a semantic error the schema cannot catch, requiring a check that compares a calculated_total against the stated order_total

**정답 및 해설:**

**핵심 개념:** JSON 스키마 기반 구조화된 데이터 추출(Structured Data Extraction)의 의미적 오류(Semantic Error) 검증입니다. JSON 스키마는 데이터의 구문적 타입(Syntactic Validity)만 보장하므로, 산술적/논리적 일관성 검사는 후속 애플리케이션 검증 로직에 위임해야 합니다.

**문제 상황 분석:**
- 구매 주문서 추출기가 엄격한 JSON 스키마를 사용하여 데이터 타입 및 필수 키 규격을 모두 충족함.
- 그러나 추출된 개별 품목의 합($940)과 주문 총액 필드($980) 간에 산술적 불일치가 발생함.
- 스키마 수준에서는 두 수치 모두 유효한 숫자(number) 타입이므로 시스템 오류 없이 통과함.

**C번이 정답인 이유:**
JSON 스키마는 데이터 구조와 타입 형태(Syntactic Validity)만을 강제할 수 있으며, 서로 다른 두 필드 간의 산술 계산 관계나 비즈니스 로직(Semantic Correctness)을 검증할 수 없습니다. 따라서 이러한 불일치는 스키마가 잡아낼 수 없는 '의미적 오류(semantic error)'로 분류해야 하며, 애플리케이션 코드 레벨에서 개별 항목의 계산된 합계(`calculated_total`)와 문서의 총액(`order_total`)을 비교·검증하는 후속 로직(Downstream Logic)을 추가하여 처리해야 합니다.

**오답 분석:**
- Option A (오답): 불일치 현상은 모델의 환각이나 산술 능력 한계로 인해 지속해서 발생할 수 있으므로 무시해서는 안 되며, 애플리케이션 레벨의 검사가 반드시 필요합니다.
- Option B (오답): 두 필드 모두 선언된 타입(number)을 준수했으므로 JSON 스키마 구문 에러(Syntax error)가 아닙니다.
- Option D (오답): 엄격한 JSON 스키마 유효성 검사는 구문 규칙만 판별하므로 필드 간의 수치 계산 불일치를 차단할 수 있는 기전이 아닙니다.

---

### 78번 문제

**1. 문제 원문**

A generator instance is instructed: 'Before you finish, re-read your changes and point out any mistakes.' The team observes this rarely surfaces issues that a fresh reviewer later finds. What best explains this?

A) The instruction is phrased as a command rather than a question, and rephrasing it as a question would make the model more critical of its own output

B) The generator lacks access to the files it just wrote, so it cannot literally re-read the changes it is being asked to critique

C) The generator's extended thinking is disabled by default, so it never allocates any reasoning tokens to the re-read step at all

D) The generator is still in the session where it already committed to its design decisions, so it is less likely to question choices it just justified

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: The generator is still in the session where it already committed to its design decisions, so it is less likely to question choices it just justified

**정답 및 해설:**

**핵심 개념:** LLM 에이전트 시스템 architecture의 확증 편향(Confirmation Bias) 및 생성자-검증자 분리(Generator-Evaluator Separation) 원칙입니다. 동일한 대화 맥락(Context Window) 내에서 모델에게 자신의 출력을 스스로 검토하게 하면 이전에 생성한 로직을 그대로 비판 없이 수용하는 경향이 발생합니다.

**문제 상황 분석:**
- 생성기(Generator) 역할을 하는 LLM에게 코드나 응답을 작성하게 한 뒤, 동일한 인스턴스/세션 내에서 "마무리하기 전에 정정할 실수가 있는지 검토하라"고 지시함.
- 동일 세션 검토는 성능이 떨어지며, 새로운 리뷰어 에이전트(Fresh Reviewer)가 나중에 발견하는 오류를 잡지 못함.
- 왜 단일 인스턴스 내에서의 Self-Correction/Self-Review가 한계를 갖는지 그 원인을 찾아야 함.

**D번이 정답인 이유:**
LLM은 자신이 이전 토큰으로 생성하고 정당화한 설계 결정과 논리 구조에 대해 동일한 컨텍스트 세션 내에서 확증 편향(Self-Consistency Bias)을 가집니다. 이미 확정하여 출력한 내용에 대해 동일한 세션에서 스스로 비판적 질문을 던지기 어렵기 때문에, 효과적인 코드 리뷰나 검증을 위해서는 완전히 독립된 사상을 가진 별도의 검증자 인스턴스(Fresh Evaluator/Reviewer Subagent)로 분리하여 검증해야 합니다.

**오답 분석:**
- Option A (오답): 명령문 대신 질문 형태로 프롬프트를 바꾼다고 해서 동일 세션에 존재하는 모델의 self-bias나 확증 편향이 기술적으로 해결되지 않습니다.
- Option B (오답): 생성기 에이전트는 작성된 파일 내용이나 이전 출력 토큰에 컨텍스트로 직접 접근할 수 있으므로 파일 접근 권한 부재가 원인이 아닙니다.
- Option C (오답): 확장 추론(extended thinking)의 비활성화 여부와 상관없이, 원인 본질은 추론 토큰 부족이 아닌 동일 컨텍스트 맥락에서의 생성자 편향에 있습니다.

---

### 79번 문제

**1. 문제 원문**

A lease-extraction tool processes a residential lease that states a monthly rent of $1,800 in the summary clause on page 1 but $1,850 in the payment schedule on page 4. Both values extract cleanly and both are individually valid numbers. What should the extraction output do with this discrepancy?

A) Extract only the payment-schedule figure from page four, since it sits within a more detailed section of the lease

B) Average the two conflicting values together and return that single mean figure as the extracted monthly rent amount

C) Extract both rent values, set a conflict_detected boolean to true, and route the record for human reconciliation rather than guessing

D) Extract only the first rent figure found on page one of the lease, and quietly discard the later conflicting value found on page four

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
C번: Extract both rent values, set a conflict_detected boolean to true, and route the record for human reconciliation rather than guessing

**정답 및 해설:**

**핵심 개념:** 정보 추출(Information Extraction) 시스템 및 LLM 에이전트 설계에서의 데이터 모호성/충돌 처리 모범 사례(Human-in-the-Loop & Fallback Strategy)입니다. 원본 문서 내 데이터 간에 명확한 충돌이 발생할 경우, 모델이 임의로 추측하거나 데이터를 손실시키는 대신 충돌 플래그를 생성하고 검토자(Human Reviewer)에게 에스컬레이션해야 합니다.

**문제 상황 분석:**
- 1페이지의 요약 조항에는 월세가 $1,800로, 4페이지의 지급 일정표에는 $1,850로 상충되게 기술되어 있음.
- 두 수치 모두 구문적으로 완벽히 추출 가능한 유효한 숫자 데이터임.
- AI 모델이나 시스템이 임의로 비즈니스적 판단을 내리지 않고, 신뢰성을 높이기 위한 올바른 예외 처리 방식을 선택해야 함.

**C번이 정답인 이유:**
LLM이나 정보 추출 시스템이 원본 문서 자체의 논리적 충돌을 마주했을 때, 둘 중 하나의 값을 임의로 선택하거나 계산하여 답을 "추측(Guessing)"하는 것은 심각한 환각(Hallucination) 및 데이터 왜곡을 유발할 수 있습니다. 가장 안전하고 모범적인 시스템 설계 방식은 충돌하는 정보 양쪽을 모두 수집한 뒤, `conflict_detected: true`와 같은 플래그를 설정하여 사람이 직접 확인하고 조정(Human Reconciliation)할 수 있도록 시스템 흐름을 제어하는 것입니다.

**오답 분석:**
- Option A (오답): 더 상세한 섹션이라는 이유만으로 시스템이 임의로 4페이지 값을 선택하는 것은 비즈니스적 추측에 불과하며, 법적/계약적 위험을 초래합니다.
- Option B (오답): 두 임대료의 평균($1,825)을 구하는 것은 문서의 원본 데이터 어디에도 존재하지 않는 가짜 데이터를 생성하는 환각(Hallucination) 행위입니다.
- Option D (오답): 먼저 발견된 값만 취하고 나중의 충돌 값을 묵인한 채 삭제(quietly discard)하는 것은 정보 손실을 야기하며 데이터 검증의 신뢰성을 완전히 떨어뜨립니다.

---

### 80번 문제

**1. 문제 원문**

A team is designing a schema to extract a customer's phone number from scanned support emails. Many older emails in the corpus never mention a phone number at all. In an early version, phone_number was marked as a required string field, and the team noticed Claude sometimes fabricated plausible-looking numbers to satisfy the schema. What is the best fix?

A) Remove the tool definition entirely and ask Claude in plain prose to only include a phone number if it is confident one was found

B) Make phone_number an optional, nullable field so Claude can omit it or return null when the source document contains no phone number

C) Keep phone_number required but change its type from string to an enum of common area codes so the model has fewer values to guess from

D) Keep phone_number required and add a second required field called phone_number_confidence so low-confidence guesses can be filtered out later

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
B번: Make phone_number an optional, nullable field so Claude can omit it or return null when the source document contains no phone number

**정답 및 해설:**

**핵심 개념:** 구조화된 데이터 추출(Structured Data Extraction)에서의 스키마 설계 모범 사례입니다. 존재하지 않을 수 있는 정보에 대해 스키마 필드를 `required`로 강제하면 모델이 스키마 조건 충족을 위해 가짜 데이터(환각, Hallucination)를 생성하게 되므로, 선택적(Optional) 및 Nullable 필드로 설계해야 합니다.

**문제 상황 분석:**
- 이메일 데이터 중 상당수는 전화번호 정보가 포함되어 있지 않음.
- 초기 스키마 설계에서 `phone_number` 필드를 `required` 속성으로 지정함.
- Claude는 스키마의 필수 요구 조건을 충족하기 위해 존재하지 않는 전화번호를 그럴듯하게 지어내는 환각 현상을 일으킴.

**B번이 정답인 이유:**
원본 데이터에 정보가 부재할 가능성이 있는 속성을 `required` 필드로 지정하면 LLM은 유효성 검사 규칙을 통과하기 위해 가짜 데이터를 지어내도록 강요받게 됩니다. 해당 필드를 `optional` 및 `nullable`(`type: ["string", "null"]`)로 정의하면, 원본 문서에 관련 정보가 없을 때 모델이 안전하게 값을 생략하거나 `null`을 반환할 수 있어 환각을 효과적으로 방지할 수 있습니다.

**오답 분석:**
- Option A (오답): 구조화된 출력(Tool use / JSON Schema)을 완전히 제거하면 데이터 추출의 정교함과 후속 애플리케이션 파싱의 안정성이 현저히 떨어집니다.
- Option C (오답): 필드를 여전히 `required`로 유지한 채 `enum` 타입으로 변경하는 것은 모델이 가짜 지역 번호를 선택하도록 강요할 뿐이며, 전화번호가 없는 이메일 문제를 해결하지 못합니다.
- Option D (오답): 필드를 `required`로 유지하면 모델이 여전히 가짜 번호를 생성해야 하며, 신뢰도 필드를 추가하는 것은 불필요하게 스키마를 복잡하게 만들고 원인(필수 필드 제약)을 해결하지 못합니다.

---

### 81번 문제

**1. 문제 원문**

A team built a pipeline where the same Claude instance that generates code is then asked, within the same conversation, to 'review your own work for bugs before finishing.' QA later finds subtle issues the model missed during that self-review step. Which architectural change is most effective at catching those issues going forward?

A) Add stricter self-review instructions to the system prompt so the model scrutinizes its own prior decisions more carefully

B) Ask the same instance to review the code twice in a row within the same session before returning results

C) Increase the extended thinking budget for the self-review step so the model reasons longer before finishing

D) Spawn a second, independent Claude instance with no access to the generation session's history to review the code fresh

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: Spawn a second, independent Claude instance with no access to the generation session's history to review the code fresh

**정답 및 해설:**

**핵심 개념:** AI 에이전트 시스템 architecture의 생성자-검증자 분리(Generator-Evaluator Separation) 원칙 및 Self-Consistency / Confirmation Bias(확증 편향) 극복입니다. 단일 세션에서 모델에게 스스로의 결과를 검토하게 하면 이전 문맥에 의한 편향이 발생하므로, 컨텍스트가 완전히 격리된 별도의 검증자 인스턴스를 두는 것이 정석입니다.

**문제 상황 분석:**
- 코드 생성과 자가 검토(Self-review)를 동일한 Claude 인스턴스 및 대화 세션 내에서 수행하도록 파이프라인을 구축함.
- 자가 검토 단계를 거쳤음에도 불구하고 미세한 버그나 결함을 모델이 감지하지 못하고 놓침.
- 동일 맥락 내에서의 자가 검토 한계를 극복하고, 버그 감지율을 높이기 위한 구조적(Architectural) 해결책을 찾아야 함.

**D번이 정답인 이유:**
동일한 대화 세션 안에서 코드를 생성한 모델에게 자신의 코드를 리뷰하도록 하면, 모델은 자신이 생성할 때 사용한 논리와 합리화 과정에 갇혀 버그를 제대로 찾아내지 못하는 확증 편향(Self-Consistency Bias)을 보입니다. 이를 해결하는 가장 효과적인 아키텍처적 개선책은 코드 생성 세션의 히스토리에 접근할 수 없는 독립된 두 번째 Claude 인스턴스(Reviewer Subagent)를 생성하여 백지 상태(Fresh Context)에서 코드를 객관적으로 검증하도록 역할을 분리(Separation of Concerns)하는 것입니다.

**오답 분석:**
- Option A (오답): 시스템 프롬프트에 더 엄격한 자가 검토 명령을 추가하더라도 동일 세션 내에 존재하는 모델 본연의 확증 편향 및 편향된 컨텍스트 맥락을 지울 수 없으므로 근본적인 해결책이 되지 못합니다.
- Option B (오답): 동일 세션 내에서 코드를 두 번 연속으로 리뷰하게 하는 것 역시 동일한 컨텍스트 내에서의 반복일 뿐이며 편향을 심화시킬 수 있습니다.
- Option C (오답): 확장 추론(Extended Thinking) 예산을 늘리는 것은 개별 추론 깊이를 더할 수는 있으나, 이전 생성이 유효하다고 전제하는 편향된 대화 히스토리 자체가 존재하는 한 근본적인 편향 문제를 원천적으로 해결하지는 못합니다.

---

### 82번 문제

**1. 문제 원문**

A refactor touches 60 files. A single reviewer instance given the entire diff at once produces contradictory findings between files. What change to the review architecture best addresses this?

A) Ask the generator to make smaller, sequential commits, and review only the most recent commit in full each time

B) Give the single reviewer instance a much larger context window so it can hold the whole diff in memory during one pass

C) Run the same single reviewer instance twice over the full diff, and keep only findings that appear in both runs

D) Split the review into per-file passes for local issues, plus an integration pass for cross-file consistency

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: Split the review into per-file passes for local issues, plus an integration pass for cross-file consistency

**정답 및 해설:**

**핵심 개념:** 대규모 컨텍스트 및 분산 에이전트 코드 리뷰 아키텍처(Multi-pass Review Architecture) 모범 사례입니다. 엄청난 분량의 diff를 단일 인스턴스에 한꺼번에 전달하면 컨텍스트 과부하로 인해 모순된 결과나 환각이 발생하므로, 파일별 세부 검토(Per-file Pass)와 전체 통합 검토(Integration Pass) 단계로 분리하여 처리합니다.

**문제 상황 분석:**
- 60개에 달하는 다량의 파일 리팩토링 diff를 단일 리뷰어 AI 인스턴스에 통째로 입력함.
- 대용량 입력으로 인해 모델이 파일 간 분석에서 서로 모순되는 지적 사항(contradictory findings)을 남김.
- 방대한 코드베이스 리뷰 시 일관성과 분석 정확도를 확보하기 위한 최적의 시스템 설계 구조를 선택해야 함.

**D번이 정답인 이유:**
대규모 코드 diff를 한꺼번에 분석하려 하면 모델의 주의력(Attention)이 분산되어 파일 간 모순이나 누락이 발생합니다. 최적의 에이전트 설계는 계층적 리뷰 방식(Map-Reduce 형태)을 적용하는 것입니다. 각 파일 내부의 구문 및 국소적 버그는 파일별 독립 패스(per-file pass)로 나눠 세밀하게 분석(Map)하고, 이후 전체 파일 간 인터페이스 및 연결 일관성은 통합 패스(integration pass)로 검토(Reduce)함으로써 복잡도를 효과적으로 분산시키고 정확도를 끌어올릴 수 있습니다.

**오답 분석:**
- Option A (오답): 이전 커밋 정보를 무시하고 가장 최근 커밋만 검토하면 60개 파일 전체에 걸친 전체 리팩토링의 맥락과 변경 사항을 놓치게 됩니다.
- Option B (오답): 컨텍스트 창(Context Window)의 크기를 단순히 늘린다고 해도 컨텍스트 분량 증가에 따른 정보주의력 저하(Lost in the Middle 현상 및 환각)를 막을 수 없어 모순 문제를 해결하지 못합니다.
- Option C (오답): 거대한 전체 diff에 대해 거듭 실행을 반복하더라도 단일 패스의 컨텍스트 과부하 문제 자체가 해결되지 않으므로 논리적 모순을 없앨 수 없으며 비용만 두 배로 낭비됩니다.

---

### 83번 문제

**1. 문제 원문**

A developer building a metadata-tagging pipeline registers a single `tag_document` tool and sets `tool_choice` to `{"type": "tool", "name": "tag_document"}` to ensure every input document is tagged. They also want Claude to use extended thinking to reason carefully before tagging ambiguous documents. During testing, requests combining extended thinking with this `tool_choice` setting return an error. What should the developer do to resolve this?

A) Keep `tool_choice` forced to `tag_document` and disable extended thinking for the request, because forced tool selections are incompatible with extended thinking

B) Switch `tool_choice` to `{"type": "auto"}`, since extended thinking is only compatible with `auto` (or `none`) and is not supported alongside forced tool selections like `any` or a named tool

C) Keep `tool_choice` forced to `tag_document`, and add a top-level `thinking_mode: "extended"` field directly inside the tool's `input_schema` to bypass the restriction

D) Switch `tool_choice` to `{"type": "any"}`, since `any` is explicitly designed to support extended thinking while `auto` and forced-tool modes are the ones that are incompatible

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
A번: Keep `tool_choice` forced to `tag_document` and disable extended thinking for the request, because forced tool selections are incompatible with extended thinking

**정답 및 해설:**

**핵심 개념:** Anthropic Claude API의 Extended Thinking(확장 추론) 기능과 Forced Tool Selection(도구 강제 호출) 간의 API 제약 조건 및 시스템 요구사항 충족 설계입니다.

**문제 상황 분석:**
- 개발자가 모든 입력 문서에 반드시 태그가 부여되도록 `tool_choice: {"type": "tool", "name": "tag_document"}` 설정을 사용하여 도구 호출을 강제함.
- 동시 처리를 위해 Extended Thinking을 활성화했으나 API 호환성 오류가 발생함.
- 파이프라인의 핵심 요구사항(모든 문서 필수 태깅 보장)을 훼손하지 않으면서 API 에러를 해결해야 함.

**A번이 정답인 이유:**
Anthropic Claude API 사양에 따르면 Extended Thinking 기능은 `tool_choice`가 `auto` 또는 `none`일 때만 호환됩니다. `{"type": "tool", "name": "tag_document"}`와 같은 강제 지정(Forced Tool Selection)이나 `any` 지정 방식은 Extended Thinking과 함께 사용할 수 없어 API 에러가 유발됩니다.
이때 파이프라인의 핵심 요구사항인 '모든 문서의 필수 태깅 보장'을 유지하려면, 도구 강제 설정을 건드리지 않고 해당 API 요청에서 Extended Thinking을 비활성화하는 것이 시스템 제약 조건을 충족시키는 유일한 정답입니다.

**오답 분석:**
- Option B (오답): `tool_choice`를 `auto`로 변경하면 API 에러는 해소되지만, Claude가 도구를 호출하지 않고 일반 텍스트 응답을 반환할 수 있어 파이프라인의 필수 요구사항(모든 문서 필수 태깅)을 보장할 수 없게 됩니다.
- Option C (오답): `input_schema` 내부에 `thinking_mode` 필드를 추가한다고 해서 API 레벨의 매개변수 호환성 제약을 우회할 수 없으며, 존재하지 않는 잘못된 스키마 속성입니다.
- Option D (오답): `any` 모드 역시 특정 도구 집합 호출을 강제하는 Forced Tool Selection의 일종이므로 Extended Thinking과 호환되지 않으며 에러가 발생합니다.

---

### 84번 문제

**1. 문제 원문**

An engineer configures the generation session with a high extended thinking effort and instructs the model to reflect deeply on flaws before submitting its code. Bugs still slip through review. Why is extended thinking insufficient as a substitute for an independent review instance here?

A) Extended thinking is capped at a token budget that is too small to cover a second full pass over the generated code

B) Extended thinking still runs in the same session that produced the code, so it retains the reasoning that justified those decisions

C) Extended thinking disables tool use during reflection, so the model cannot re-read the files it just wrote to check them

D) Extended thinking spends more tokens on reasoning, but the depth of scrutiny per issue stays roughly the same during the reflection step

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
B번: Extended thinking still runs in the same session that produced the code, so it retains the reasoning that justified those decisions

**정답 및 해설:**

**핵심 개념:** AI 에이전트 시스템 architecture의 생성자-검증자 분리(Generator-Evaluator Separation) 원칙 및 확증 편향(Confirmation Bias) 극복입니다. 단일 대화 맥락 내에서는 모델이 자신의 이전 논리를 정당화하려는 성향이 유지되므로 독립된 리뷰어 인스턴스가 필요합니다.

**문제 상황 분석:**
- 엔지니어가 코드 생성 세션의 확장 추론(Extended Thinking) 노력을 최대로 높이고, 스스로 버그와 결함을 깊이 되돌아보도록 프롬프트를 구성함.
- 그럼에도 불구하고 미세한 버그나 결함을 잡아내지 못하고 리뷰 단계에서 누락됨.
- 확장 추론 기능만으로는 독립된 검증자 인스턴스(Independent Reviewer Instance)를 대체할 수 없는 근본적인 아키텍처적 원인을 찾아야 함.

**B번이 정답인 이유:**
동일한 세션 내에서 수행되는 확장 추론은 코드를 작성할 때 형성된 대화 맥락(Context)과 추론 가정(Assumptions)을 그대로 공유합니다. 모델이 코드를 생성하면서 이미 가졌던 논리와 자기 정당화(Self-Justification) 프레임에 갇혀 있기 때문에, 아무리 생각하는 토큰을 늘려도(High effort) 자신의 오류를 객관적으로 포착하기 어렵습니다. 따라서 동일 세션에서의 자가 성찰(Self-reflection)은 편향을 완전히 탈피하지 못하며, 이전 대화 이력이 없는 완전히 독립된 리뷰어 인스턴스(Fresh Context Reviewer)로 분리해야만 정밀한 검증이 가능합니다.

**오답 분석:**
- Option A (오답): 확장 추론의 토큰 예산이 부족해서 버그를 놓치는 것이 아니며, 예산을 극대화하더라도 동일 세션 내의 확증 편향 문제는 해결되지 않습니다.
- Option C (오답): 확장 추론 중에 도구 사용이 원천 차단되는 것이 아니며, 본질적인 원인은 도구 사용 여부가 아니라 세션 간 컨텍스트 미분리로 인한 자가 편향에 있습니다.
- Option D (오답): 확장 추론은 추론 깊이와 면밀함을 크게 높여주지만, 이슈 검토의 기술적 깊이가 부족한 것이 아니라 동일 세션 내의 확증 편향이 문제의 본질입니다.

---

### 85번 문제

**1. 문제 원문**

A reviewer instance returns 12 findings. The architect wants only high-confidence issues auto-fixed and everything else routed to a human. Which review design supports this goal?

A) Have the reviewer instance combine all findings into one summary paragraph and let a human manually re-derive which findings seem reliable

B) Have the reviewer instance rank findings only by the severity of the underlying bug, then auto-fix the top-ranked items regardless of how certain the reviewer was

C) Have the generator instance re-run its own self-review and quietly discard any finding it personally disagrees with before a human ever sees it

D) Have the reviewer instance tag each finding with a confidence level, then auto-fix the high-confidence findings and send the low-confidence ones to a human

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: Have the reviewer instance tag each finding with a confidence level, then auto-fix the high-confidence findings and send the low-confidence ones to a human

**정답 및 해설:**

**핵심 개념:** AI 신뢰도 점수 기반 분기 처리(Confidence-based Routing) 및 Human-in-the-Loop(HITL) 설계 패턴입니다. AI 모델이 도출한 결과에 신뢰도 수준(Confidence Level)을 부여하고, 높은 신뢰도의 작업은 자동화(Auto-fix)하며 신뢰도가 낮거나 불확실한 작업은 사람의 검토(Human Review)로 분기시키는 모범 사례입니다.

**문제 상황 분석:**
- 검토자(Reviewer) 인스턴스가 총 12개의 발견 사항(Findings)을 도출한 상황입니다.
- 아키텍트는 확신도가 높은(High-confidence) 이슈에 대해서만 자동 수정을 수행하고자 합니다.
- 불확실하거나 신뢰도가 낮은 나머지 이슈들은 모두 사람이 직접 검토하도록 전달하는 자동화/사람 협업 흐름을 구축하고자 합니다.

**D번이 정답인 이유:**
검토자 인스턴스가 각 발견 사항에 대해 자체적인 신뢰도 수준(Confidence level)을 메타데이터로 태깅하게 만들면, 시스템은 정량적 기준에 따라 자동으로 분기할 수 있습니다. 높은 신뢰도를 가진 항목은 안전하게 파이프라인에서 자동 수정(Auto-fix)을 진행하고, 신뢰도가 낮아 오탐(False Positive) 가능성이 있는 항목은 사람 검토자에게 라우팅(Human-in-the-Loop)함으로써 아키텍트가 요구한 시스템 설계 목표를 완벽히 달성합니다.

**오답 분석:**
- Option A (오답): 모든 발견 사항을 하나의 텍스트 단락으로 합치면 신뢰도를 개별 파싱하기 어렵고, 사람이 일일이 수동으로 판단을 재도출해야 하므로 자동 수정 목표에 위배되고 비효율적입니다.
- Option B (오답): 신뢰도(Certainty)를 무시하고 버그의 심각도(Severity)만으로 상위 항목을 자동 수정할 경우, 모델이 잘못 판단한 오탐 이슈가 시스템에 그대로 자동 반영되어 심각한 오류나 사이드 이펙트를 유발할 수 있습니다.
- Option C (오답): 생성자(Generator)가 스스로의 검토 결과를 무단으로 버리게 되면(Quietly discard) 사람에게 검토 기회조차 제공하지 않으므로, 나머지 항목을 사람에게 전달(Route to a human)한다는 요구사항에 완전히 어긋납니다.

---

### 86번 문제

**1. 문제 원문**

A platform team runs an automated code-review gate that blocks a pull request from merging until Claude returns a verdict on the diff, typically within a few seconds. Which approach should they use for this workflow?

A) The synchronous Messages API, since the merge gate blocks on an immediate response and the Message Batches API offers no guaranteed latency SLA

B) The Message Batches API, since the 50% cost discount outweighs the small delay a blocking merge gate would experience while waiting

C) Either API works equally well here, because Message Batches results are typically available in under a minute for small request volumes

D) The Message Batches API, since batching the diff review still returns a verdict well within the few-second window merge gates require

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
A번: The synchronous Messages API, since the merge gate blocks on an immediate response and the Message Batches API offers no guaranteed latency SLA

**정답 및 해설:**

**핵심 개념:** Anthropic Claude API의 동기식 Messages API와 비동기식 Message Batches API의 사용 목적 차이입니다. 동기식 Messages API는 수 초 이내의 즉각적인 실시간 응답이 필요한 블로킹(Blocking) 작업에 적합하며, Message Batches API는 최대 24시간 이내 처리를 목표로 하는 대량 비동기/배치 작업(50% 비용 할인 제공)에 사용됩니다.

**문제 상황 분석:**
- 플랫폼 팀은 풀 리퀘스트(PR) 병합을 차단하고 검토 결과를 기다리는 자동화된 CI/CD 게이트를 운영합니다.
- 이 워크플로우는 보통 몇 초(a few seconds) 이내의 즉각적인 판정 응답을 요구합니다.
- 지연 시간에 민감하며 실시간성이 보장되어야 하는 블로킹(Blocking) 시스템입니다.

**A번이 정답인 이유:**
병합 게이트(Merge gate)는 PR 병합을 막아두고 실시간으로 결과를 기다리는 대표적인 블로킹 워크플로우입니다. 이러한 실시간성 요구사항(수 초 이내 응답)을 충족하려면 동기식(Synchronous) Messages API를 사용해야 합니다. Message Batches API는 비용이 50% 절감되는 장점이 있지만 처리 완료에 대한 엄격한 지연 시간 SLA(Latency SLA, 보통 최대 24시간 내 처리)를 보장하지 않으므로, 개발자 피드백 루프가 정체될 수 있어 배치 API를 사용할 수 없습니다.

**오답 분석:**
- Option B (오답): 50% 비용 할인이 제공되더라도 지연 시간에 민감한 블로킹 병합 게이트에서는 수 분~수 시간의 대기 지연이 개발 생산성을 심각하게 저해하므로 배치 API가 동기식 API를 대체할 수 없습니다.
- Option C (오답): Message Batches API는 수 초 내 응답을 보장하지 않으며, 처리 시간이 대기열 상황에 따라 변동되므로 두 API가 동일하게 잘 작동한다는 설명은 거짓입니다.
- Option D (오답): Message Batches API는 수 초(few-second window) 내에 결과를 반환하도록 설계되지 않았으며, 비동기 대량 처리용이므로 이 요구사항에 맞지 않습니다.

---

### 87번 문제

**1. 문제 원문**

An automated code reviewer flags many instances of a pattern (a broad except clause) as issues, but a large fraction of those flags are on lines where the pattern is intentional and acceptable, such as top-level error boundaries that log and re-raise. Reviewers are starting to ignore the tool's output because of the false-positive rate. What change would most directly reduce false positives while still catching genuine issues?

A) Remove the broad except clause check from the rule set entirely, since it currently produces too many false positives

B) Lower the confidence threshold so only the single highest-confidence finding per file is reported

C) Instruct the model to only flag the pattern when it appears more than three times in the same file

D) Add paired examples of a genuinely problematic instance and an acceptable instance, each with the correct verdict

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: Add paired examples of a genuinely problematic instance and an acceptable instance, each with the correct verdict

**정답 및 해설:**

**핵심 개념:** 프롬프트 엔지니어링의 퓨샷 프롬프팅(Few-shot Prompting) 및 대비되는 예시(Contrasting Examples / Paired Examples) 활용법입니다. LLM 기반 코드 검토 도구에서 문맥적 미묘함(예: 동일한 패턴이라도 의도적인 경우와 잘못된 경우)을 구분하지 못할 때, 긍정 예시(Acceptable)와 부정 예시(Problematic)를 짝 지어 제공하는 것이 오탐(False Positive)을 줄이는 가장 효과적인 방법입니다.

**문제 상황 분석:**
- 코드 검토 도구가 `broad except clause`(예: `except Exception:`) 패턴을 무조건 문제로 플래그 표시하여 오탐율이 높습니다.
- 최상위 에러 경계에서 로깅 후 다시 에러를 던지는(`log and re-raise`) 것처럼 의도적이고 허용되는 구문까지 문제로 감지하고 있습니다.
- 오탐이 너무 많아 검토자들이 도구의 결과를 무시하기 시작했으며, 목표는 "진짜 문제(Genuine issues)는 계속 잡으면서 오탐을 줄이는 것"입니다.

**D번이 정답인 이유:**
`broad except clause` 자체가 100% 오류는 아닙니다. 문맥에 따라 문제가 되는 경우(예: 에러를 무시하고 넘어가버리는 구문)와 허용 가능한 경우(예: 최상위 에러 경계에서 로깅 후 re-raise)가 나뉩니다. 모델에게 문제가 되는 사례와 허용되는 사례를 정답(Verdict)과 함께 대조적인 쌍(Paired Examples)으로 프롬프트에 작성해 주면, 모델이 두 경우의 경계 조건을 명확히 학습하여 진짜 문제는 잡고 허용 가능한 구문은 스킵하는 고도화된 판단을 내릴 수 있습니다.

**오답 분석:**
- Option A (오답): 규칙을 완전히 제거하면 오탐은 사라지지만 진짜 문제(Genuine issues)도 전혀 잡지 못하므로 요구사항을 만족하지 못합니다.
- Option B (오답): 가장 높은 신뢰도의 항목 1개만 보고하면 한 파일에 존재하는 여러 진짜 문제를 놓치게 됩니다.
- Option C (오답): 패턴이 동일 파일에 3회 이상 등장해야만 감지하도록 임의의 횟수 제약을 두는 것은 버그의 심각성이나 허용 가능 여부와 아무런 논리적 관련이 없습니다.

---

### 88번 문제

**1. 문제 원문**

A data-ingestion job needs to classify 150,000 scanned invoices in one nightly run using the Message Batches API. What must the team account for given the platform's per-batch limits?

A) Split the 150,000 invoices across at least 2 batch submissions, because a single Message Batch is capped at 100,000 requests or 256 MB total payload, whichever comes first. (More batches may be needed if the total payload exceeds 256 MB.)

B) Divide the invoices into batches of exactly 1,000, since this is the maximum batch size allowed by the API for any data type.

C) Use the synchronous Messages API instead of the Batches API, because batches are limited to 500 requests per hour and 150,000 invoices cannot be processed overnight.

D) Submit all 150,000 invoices in a single batch, because the Batches API has no request limit and only restricts the output size of each response.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
A번: Split the 150,000 invoices across at least 2 batch submissions, because a single Message Batch is capped at 100,000 requests or 256 MB total payload, whichever comes first. (More batches may be needed if the total payload exceeds 256 MB.)

**정답 및 해설:**

**핵심 개념:** Anthropic Claude Message Batches API의 단일 배치 제한 사항(Per-batch Limits) 규격입니다. 단일 배치 생성 요청은 **최대 100,000개의 요청(Requests)** 또는 **최대 256MB의 페이로드(Payload) 크기** 중 먼저 도달하는 한계에 의해 제한됩니다.

**문제 상황 분석:**
- 야간 일괄 처리(Batch Job) 방식으로 스캔된 송장 150,000장을 분류해야 합니다.
- 전체 처리량(150,000건)이 단일 배치 최대 허용 수량인 100,000건을 초과합니다.
- 플랫폼의 배치당 제한 규칙(Per-batch Limits)을 준수하도록 요청을 분할하여 제출하는 시스템 설계가 필요합니다.

**A번이 정답인 이유:**
Anthropic 공식 문서 기준, Message Batches API의 단일 배치당 최대 한계는 **100,000 Requests** 및 **256 MB Total Payload**입니다. 150,000건의 송장은 개수 기준으로 최소 2개 이상의 배치(예: 100,000건 + 50,000건)로 나누어 제출해야 합니다. 스캔된 이미지 데이터나 텍스트 크기 합계가 256MB를 초과하는 경우 추가적인 분할이 필요할 수 있으므로, A번 설명이 제약 조건과 대응 방안을 정확히 기술하고 있습니다.

**오답 분석:**
- Option B (오답): API의 배치 크기 제한은 1,000개가 아니라 100,000개입니다.
- Option C (오답): Batches API의 시간당 요청 제한이 500개라는 설명은 허구이며, 야간 대량 처리(150,000건)에 동기식 API를 사용하는 것은 부적절합니다.
- Option D (오답): Batches API에는 요청 수(100,000개) 및 용량(256MB)에 대한 엄격한 단일 배치 제한이 존재하므로 150,000건을 단일 배치로 제출할 수 없습니다.

---

### 89번 문제

**1. 문제 원문**

A security review assistant extracts structured findings from source code and developers frequently dismiss a large share of the findings tied to one particular helper function used for input sanitization. The team wants to analyze this dismissal trend systematically over time. What should be added to the structured finding schema to support this analysis?

A) A severity field that raises the priority of every incoming finding regardless of which construct triggered it originally

B) A detected_pattern field naming the specific construct that triggered the finding, so dismissals can be grouped by construct

C) A single overall confidence score per finding, with no record of which construct or rule actually produced that finding

D) A free-text comments field where each reviewer types their own reasoning for a dismissal in whatever wording feels most natural to them

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
B번: A detected_pattern field naming the specific construct that triggered the finding, so dismissals can be grouped by construct

**정답 및 해설:**

**핵심 개념:** 구조화된 데이터 출력 스키마 설계(Structured Output Schema Design) 및 분석 가능성(Observability & Telemetry) 확보 규칙입니다. 특정 코드 패턴이나 구문에서 발생하는 AI/보안 도구의 기각(Dismissal) 패턴을 시간에 따라 체계적으로 집계·분석하려면, 스키마에 어떤 구문/규칙이 해당 발견 사항을 유발했는지 식별할 수 있는 범주형 필드(Categorical Identifier)가 포함되어야 합니다.

**문제 상황 분석:**
- 입력 정제용 헬퍼 함수 관련 보안 경고를 개발자들이 빈번하게 기각(Dismiss)하고 있습니다.
- 팀은 어떤 구문/함수 패턴에서 기각이 발생하는지 시간에 따라 체계적/정량적으로 분석하고자 합니다.
- 이를 지원하기 위해 구조화된 발견 사항 스키마(Structured finding schema)에 새로 추가해야 하는 필드를 찾는 문제입니다.

**B번이 정답인 이유:**
발견 사항 스키마에 경고를 유발한 구문/패턴을 명시하는 `detected_pattern` 필드를 추가하면, 데이터베이스 및 데이터 분석 엔진에서 `GROUP BY detected_pattern`과 같은 통계 쿼리를 쉽게 수행할 수 있습니다. 이를 통해 입력 정제 헬퍼 함수와 같이 특정 패턴에서 기각율이 높다는 점을 정량적·체계적으로 식별하고 개선할 수 있으므로 문제 요구사항에 완벽히 부합합니다.

**오답 분석:**
- Option A (오답): 원래 유발된 구문과 관계없이 모든 경고의 우선순위/심각도를 높이는 것은 오탐으로 인한 개발자의 피로도(Alert Fatigue)를 가중시키며, 기각 경향 분석과 아무런 관련이 없습니다.
- Option C (오답): 발견 사항을 유발한 규칙이나 구문에 대한 기록을 남기지 않으면, 어떤 특정 함수나 패턴에서 기각이 자주 발생하는지 집계하거나 원인을 추적할 수 없습니다.
- Option D (오답): 비구조화된 자유 형식 텍스트(Free-text) 형태의 주석은 작성자마다 표현 방식이 제각각이므로 시간에 따른 통계 집계 및 체계적인 그룹화 분석(Systematic Analysis)을 수행하기에 부적합합니다.

---

### 90번 문제

**1. 문제 원문**

An architect wants a Claude-based reviewer to classify findings into severity levels consistently across many pull requests and multiple reviewers on the team. Which prompt design best achieves consistent severity classification?

A) Instruct the model to assign severity based on how urgent the issue feels in the context of the specific pull request, considering the component's criticality, recent commit history, and related incidents.

B) Define each severity level with a short description plus a concrete code example illustrating what qualifies at that level, so the model has a consistent reference point for every classification.

C) Tell the model to default to medium severity for every finding, escalating or de-escalating only when it provides specific technical justification referencing the team's predefined severity criteria.

D) Ask the model to compare the current finding to the average severity of findings from the last ten pull requests, using that historical baseline to normalize severity assignments across reviews.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
B번: Define each severity level with a short description plus a concrete code example illustrating what qualifies at that level, so the model has a consistent reference point for every classification.

**정답 및 해설:**

**핵심 개념:** 프롬프트 엔지니어링의 일관성 및 명확성 확보 패턴(In-context Examples & Clear Reference Criteria)입니다. LLM이 다수의 입력(PR)과 여러 사용자에 걸쳐 주관성 없이 일관된 분류 결과를 내놓도록 하려면 각 범주(Severity level)에 대한 명확한 정의문과 구체적인 코드 예시(Few-shot examples)를 참조 기준점(Reference point)으로 제공하는 것이 모범 사례입니다.

**문제 상황 분석:**
- 다양한 개발자가 제출하는 수많은 PR에서 Claude 기반 검토자가 코드 문제의 심각도(Severity)를 일관되게 분류해야 합니다.
- 주관적인 판단이나 맥락별 변동성을 줄이고 일관된 분류(Consistent classification) 기준을 제공할 수 있는 프롬프트 설계 전략을 찾는 문제입니다.

**B번이 정답인 이유:**
각 심각도 수준(예: Critical, High, Medium, Low)에 대해 짧은 설명과 해당 등급에 일치하는 구체적인 코드 예시를 함께 프롬프트에 명시(Few-shot prompting)해 두면, 모델은 모든 검토 수행 시 항상 동일한 명확한 참조 기준점(Reference Point)을 가지고 코드를 평가합니다. 이는 주관성을 배제하고 다수의 PR 전체에 걸쳐 고도로 일관된 심각도 판정을 보장합니다.

**오답 분석:**
- Option A (오답): '얼마나 긴급하게 느껴지는가(how urgent the issue feels)'와 같은 주관적 감정이나 모호한 요소에 의존하게 만들면 검토할 때마다 판단 기준이 흔들려 분류의 일관성이 크게 저하됩니다.
- Option C (오답): 모든 문제의 기본값을 Medium으로 설정하는 편향(Bias)을 강제하면 실제로 Critical하거나 Low한 이슈에 대해 불필요한 추론 거침 현상이 발생하며, 명확한 등급별 기준 예시가 없기 때문에 일관성을 확보하는 근본적인 해결책이 되지 못합니다.
- Option D (오답): 최근 10개 PR의 발견 사항 평균 심각도와 비교하게 만드는 방식은 과거 PR들의 코드 품질 구성에 따라 기준선(Baseline) 자체가 계속 변동되므로, 절대적이고 일관된 분류 기준을 유지할 수 없습니다.

---

### 91번 문제

**1. 문제 원문**

A document-extraction system pulls structured fields (vendor, total, line items) from invoices that arrive in wildly different layouts: some are tables, some are plain paragraphs, some split totals across multiple currencies. Detailed field-by-field instructions have not stopped the model from occasionally inventing plausible-looking values when a layout doesn't match what the team anticipated. What is the best next step?

A) Write a longer paragraph enumerating every layout variant the team can currently think of and its handling rule

B) Add a small set of examples across the layout types actually received, each paired with its correct extraction

C) Preprocess every document into one canonical plain-text format before it reaches the prompt

D) Reduce the number of required output fields so there are fewer chances to fabricate a value

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
B번: Add a small set of examples across the layout types actually received, each paired with its correct extraction

**정답 및 해설:**

**핵심 개념:** 프롬프트 엔지니어링의 퓨샷 프롬프팅(Few-shot Prompting / In-context Learning)과 다양성 있는 예시 제공 패턴입니다. 규칙/지시사항(Instruction)만으로 엣지 케이스나 예외 레이아웃 처리에 한계가 있을 때, 실제 들어오는 레이아웃 패턴별 입-출력 쌍 예시를 프롬프트에 포함시키는 것이 모델의 환각(Hallucination) 및 지시 불이행을 방지하는 가장 확실한 방법입니다.

**문제 상황 분석:**
- 표, 일반 텍스트, 다중 통화 등 수신되는 송장의 레이아웃 형태가 매우 다양합니다.
- 상세한 필드별 지시사항(Instructions)을 작성했음에도 불구하고, 예상치 못한 레이아웃이 입력되면 모델이 그럴듯한 거짓 값(Plausible-looking values)을 생성하는 환각 현상이 발생합니다.
- 지시사항 강화만으로는 한계에 다다른 상황에서 환각을 줄이고 정확한 필드 추출을 달성하기 위한 프롬프트 개선 방안을 찾는 문제입니다.

**B번이 정답인 이유:**
텍스트로 된 지시사항(Zero-shot instruction)을 길게 늘려 쓰는 것보다, 실제 시스템에 입력되는 다양한 형태(표, 일반 단락, 다중 통화 등)의 레이아웃 원본과 정확한 추출 결과값을 쌍으로 묶어 다채로운 예시 세트(Few-shot examples)로 제공하는 것이 모델의 패턴 인식 능력을 극적으로 향상시킵니다. 모델은 이러한 다원화된 예시를 통해 구조가 생소하더라도 무엇을 추출하고 무엇을 건너뛰어야 하는지 명확한 문맥을 파악하게 되어 환각을 방지할 수 있습니다.

**오답 분석:**
- Option A (오답): 서술식 지시사항을 더 길게 작성하여 모든 레이아웃 규칙을 나열하는 방식은 프롬프트 복잡성만 높이고 모델이 핵심 규칙을 놓치거나 무시할 위험(Instruction drift)을 키웁니다.
- Option C (오답): 표나 복잡한 서식 구조를 가진 문서를 무리하게 일괄 평문(Plain-text)으로 전처리하면 레이아웃이 가진 공간적/구조적 정보가 손실되어 오히려 추출 정확도가 떨어집니다.
- Option D (오답): 필요한 출력 필드 수를 줄이는 것은 비즈니스 요구사항을 훼손하는 임시방편일 뿐, 모델의 환각이나 레이아웃 대응 능력 저해라는 근본적인 원인을 해결하지 못합니다.

---

### 92번 문제

**1. 문제 원문**

An architect is designing a multi-step pipeline to reduce false positives in a review category: a first API call generates draft findings, and a second API call reviews each draft against explicit criteria before finalizing it. Why would this chained approach improve precision compared to a single-pass prompt with the same criteria?

A) The second API call is configured to invoke a more capable model by default, so the improved precision comes purely from a model upgrade between calls, not from the explicit two-step review process.

B) Chaining calls resets the model's system prompt after the draft generation, which strips any prior contextual cues that could have biased the first pass toward over-flagging benign patterns as findings, reducing false positives.

C) The second pass gives the model a separate opportunity to check each draft finding against the explicit criteria in isolation, catching cases where the first pass may have misapplied the criteria due to generating a large set of findings in one response.

D) Splitting the task across two calls doubles the amount of context available to the model by exposing all draft findings and the criteria to the second call, which mechanically improves classification accuracy by reducing false positives.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
C번: The second pass gives the model a separate opportunity to check each draft finding against the explicit criteria in isolation, catching cases where the first pass may have misapplied the criteria due to generating a large set of findings in one response.

**정답 및 해설:**

**핵심 개념:** 프롬프트 체이닝(Prompt Chaining) 및 multi-pass 검증 패턴입니다. 단일 생성 패스(Single-pass)에서 LLM은 다량의 결과를 동시에 탐색·생성하느라 인지적 부담(Cognitive load)이 커져 검토 기준을 놓치거나 잘못 적용(False Positive 유발)하기 쉽습니다. 생성을 담당하는 1차 호출과 검증을 담당하는 2차 호출로 분리하면 각 초안을 집중적·개별적으로 검증할 수 있어 정밀도(Precision)가 대폭 향상됩니다.

**문제 상황 분석:**
- 첫 번째 API 호출: 검토 대상 코드/문서에서 초안 발견 사항(Draft findings)을 탐색하여 생성.
- 두 번째 API 호출: 생성된 초안 항목들을 명시적 검토 기준에 맞춰 개별적으로 재검토 및 정제.
- 동일한 기준을 단일 프롬프트(Single-pass)로 전달하는 것보다 위와 같이 체이닝(Chaining) 파이프라인으로 구성할 때 정밀도가 높아지는 이유를 묻는 문제입니다.

**C번이 정답인 이유:**
단일 패스 생성 시에는 한 번의 응답 출력에서 수많은 후보 항목을 찾아내고 정형화하느라 모델이 복잡한 기준 조건을 완벽히 적용하지 못하고 오탐(False Positive)을 남길 수 있습니다. 반면, 2차 검토 패스를 별도로 두면 이미 뽑혀 나온 초안 목록 하나하나에 집중하여 검토 기준 준수 여부만 독립적으로(in isolation) 엄격히 평가할 수 있습니다. 그 결과, 1차 작업 시 과도하게 잡혔던 부적절한 플래그들이 걸러져 정밀도가 명확히 향상됩니다.

**오답 분석:**
- Option A (오답): 2단계 검토 프로세스는 동일한 모델을 사용하더라도 파이프라인의 구조적 이점(작업 분리 및 검증)에 의해 정밀도가 향상되는 것이며, 두 번째 호출에서 더 높은 성능의 모델을 쓰는 것이 기본값(by default)이라는 설명은 사실이 아닙니다.
- Option B (오답): 프롬프트 체이닝이 시스템 프롬프트를 재설정하여 이전 맥락을 지워주기 때문이라는 설명은 아키텍처 관점에서 정밀도 향상의 본질적인 이유(개별 항목에 대한 별도 검증 및 정제 기회 제공)가 아닙니다.
- Option D (오답): 호출을 둘로 나누는 것이 모델이 활용 가능한 콘텍스트 양을 기계적으로 두 배로 늘려주는 것은 아니며, 단지 정보를 노출한다고 해서 정확도가 자동으로 향상되는 것은 아닙니다.

---

### 93번 문제

**1. 문제 원문**

A logistics team uses strict tool use with `strict: true` to extract shipment records, guaranteeing that every "quantity" field is a well-formed integer as required by the schema. An engineer asks whether this guarantee alone is sufficient to trust the extracted quantities for downstream inventory decisions. What is the correct assessment?

A) No, strict validation only guarantees structural and type conformance, so business-plausibility checks are still needed

B) Yes, strict tool use guarantees full business-logic correctness, so no further validation of quantity values is required

C) Yes, because strict mode internally re-runs the extraction against the source until values are semantically confirmed

D) No further check is needed here, but only because this particular field happens to be numeric rather than a string

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
A번: No, strict validation only guarantees structural and type conformance, so business-plausibility checks are still needed

**정답 및 해설:**

**핵심 개념:** Structured Output / Strict Tool Use (`strict: true`)의 역할 범위와 비즈니스 검증(Business Validation)의 분리입니다. API 스키마 검증(`strict: true`)은 출력 데이터의 **구조(Structural) 및 데이터 타입(Type Conformance)**을 문법적으로 강제할 뿐, 추출된 데이터가 사실(Fact)인지 또는 비즈니스 로직상 타당한 값(Business Plausibility)인지는 보장하지 않습니다.

**문제 상황 분석:**
- 물류 팀이 `strict: true` 옵션을 사용하여 배송 기록의 "quantity" 필드가 올바른 정수(Integer) 형태임을 보장받고 있습니다.
- 엔지니어가 이러한 스키마 수준의 보장만으로 후속 재고 시스템(Downstream inventory decisions)에서 이 값을 그대로 믿고 사용할 수 있는지 문의했습니다.
- 스키마 레벨 검증과 비즈니스 타당성 검증의 차이를 이해하고 있는지 평가하는 문제입니다.

**A번이 정답인 이유:**
`strict: true`는 LLM이 정의된 JSON Schema 형식(예: `quantity`가 `integer` 타입이라는 점)을 100% 준수하여 출력하도록 강제합니다. 하지만 문법적으로 유효한 정수(예: `-99999` 또는 현실적으로 불가능한 수량 `1,000,000`)가 들어오더라도 스키마 검증은 통과합니다. 데이터의 실제 도메인 타당성(음수 불가, 재고 한도 내 존재 여부 등)을 검증하는 비즈니스 타당성 체크(Business-plausibility checks)는 애플리케이션 코드 단에서 별도로 수행해야 하므로 A번이 올바른 설명입니다.

**오답 분석:**
- Option B (오답): Strict tool use는 문법적/구조적 규칙만 준수시킬 뿐, 비즈니스 로직의 정답성(Business-logic correctness)까지 보장할 수 없습니다.
- Option C (오답): 엄격 모드(`strict: true`)는 내부적으로 의미론적 검증을 위해 추출을 재실행하는 메커니즘이 아닙니다.
- Option D (오답): 데이터 타입이 숫자형이라는 이유만으로 비즈니스 검사가 면제되는 것은 아니며, 잘못된 수량이 시스템에 반영되는 위험을 막을 수 없습니다.

---

### 94번 문제

**1. 문제 원문**

A search-augmentation team wants each batched research request to use a server-side web search tool so Claude can look up current information and incorporate it into the same response, without the application fetching pages or feeding results back itself. Is this workable within the Message Batches API?

A) No, because the Message Batches API rejects any request that references a tool definition, whether the tool executes on the server or on the client

B) No, because server tools only function within streamed synchronous responses and streaming is one of the parameters batch requests do not support

C) Yes, because server tools such as web search resolve automatically within the request itself, unlike client-side tools that need an application-supplied result

D) Yes, but only if the application also submits a matching synchronous request in parallel so the server tool has a live connection to execute against

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
C번: Yes, because server tools such as web search resolve automatically within the request itself, unlike client-side tools that need an application-supplied result

**정답 및 해설:**

**핵심 개념:** Anthropic Claude Message Batches API와 서버 측 도구(Server-side Tools / Built-in Tools, 예: Web Search)의 연동 동작 방식입니다. 클라이언트 측 도구(Client-side Tool Use)는 모델이 `tool_use`를 출력하면 애플리케이션이 이를 실행한 후 `tool_result`를 다단계 왕복(Multi-turn)으로 전달해야 하므로 비동기 배치 구조에서 처리가 어렵습니다. 반면, 서버 측 웹 검색 도구는 Anthropic 서버 내부에서 검색 실행 및 결과 수집이 단일 요청 패스 내에서 자동으로 자급자족(Self-contained/Automated resolution) 처리되므로 Message Batches API 내에서 완벽하게 동작합니다.

**문제 상황 분석:**
- 검색 증강 팀이 Message Batches API를 사용하여 대량의 조사 요청을 일괄 처리하고자 합니다.
- 클라이언트 애플리케이션이 웹 페이지를 직접 스크래핑하거나 결과를 다시 모델에 피드백(Multi-turn loop)하지 않고, 모델 스스로 서버 측 웹 검색 도구(Server-side web search tool)를 사용하여 최신 정보를 수집하고 최종 응답을 완성하기를 원합니다.
- 이러한 서버 측 도구 사용 패턴이 비동기 방식인 Message Batches API 환경에서 지원 가능한지 판단하는 문제입니다.

**C번이 정답인 이유:**
서버 측 도구(예: Anthropic 제공 웹 검색)는 서버 내부에서 도구 호출, 검색 수행, 결과 통합 및 최종 응답 작성이 하나의 단일 API 요청 수명주기 안에서 자체적으로 완결(Self-contained)되어 자동 처리됩니다. 애플리케이션과의 중간 왕복 개입이 불필요하므로, 비동기로 백그라운드 처리되는 Message Batches API 내에서도 개별 요청으로 서버 측 도구를 지정하여 일괄 실행하는 것이 완전히 가능합니다.

**오답 분석:**
- Option A (오답): Message Batches API는 도구 정의(Tool definitions) 사용을 거부하지 않으며, 도구 사용 매개변수를 정상적으로 지원합니다.
- Option B (오답): 서버 측 도구가 스트리밍되는 동기 응답에서만 작동한다는 설명은 사실이 아니며, 비동기 배치 처리에서도 단일 요청 내부 완료 방식으로 문제없이 동작합니다.
- Option D (오답): 비동기 배치 요청을 처리하기 위해 클라이언트가 실시간 동기식 요청을 병렬로 유지하거나 연결을 열어둘 필요가 전혀 없습니다.

---

### 95번 문제

**1. 문제 원문**

To save tokens, an architect has the generator instance write a summary of its own changes and passes that summary, not the raw diff, to the independent reviewer instance. Why does this undermine the value of using a second instance?

A) Token savings from summarizing are negligible compared to the cost of running a second instance, so the summarization step provides no benefit either way

B) A reviewer instance can only produce useful findings when it has access to the generator's extended thinking trace, and summaries never include that trace

C) The summary reflects the generator's own framing of its decisions, so the reviewer evaluates that account instead of examining the actual code fresh

D) Passing a summary instead of the diff exceeds the maximum prompt length the Agent tool supports, so the reviewer instance would fail to start

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
C번: The summary reflects the generator's own framing of its decisions, so the reviewer evaluates that account instead of examining the actual code fresh

**정답 및 해설:**

**핵심 개념:** 독립적 다중 인스턴스 검증 패턴(Independent Multi-instance Review Pattern) 및 원본 데이터 수신(Raw Context Integrity) 원칙입니다. 생성자(Generator)와 검토자(Reviewer)를 분리하는 핵심 목적은 편향되지 않은 시각에서 실제 코드 원본(Raw diff)을 독립적으로 검증하기 위함입니다. 생성자가 직접 작성한 요약본을 전달받으면 검토자가 생성자의 고정관념이나 주관적 프레이밍(Self-framing)에 갇히게 되어 2차 검토자 배치의 이점이 무력화됩니다.

**문제 상황 분석:**
- 아키텍트가 토큰 절약을 목적으로 생성자(Generator) 인스턴스가 직접 자신의 코드 변경 사항을 요약하도록 했습니다.
- 검토자(Reviewer) 인스턴스에는 실제 코드 원본(Raw diff)을 주지 않고, 생성자가 요약한 내용만 넘겨주었습니다.
- 왜 이러한 설계 방식이 2차 검토 인스턴스를 두는 본래의 가치와 목적을 저해하는지 이유를 묻는 문제입니다.

**C번이 정답인 이유:**
검토자 인스턴스가 최상의 독립 검증 효과를 내려면 원본 코드(`raw diff`)를 직접 보고 새로운 시각에서 오류를 탐지해야 합니다. 하지만 생성자가 직접 요약한 텍스트를 전달받게 되면, 검토자는 실제 코드가 아니라 생성자의 자기 합리화 및 주관적 프레이밍이 개입된 설명글을 평가하게 됩니다. 생성자가 놓친 오류나 오해한 비즈니스 로직이 요약문에서 누락될 수 있으므로, 검토자는 생성자의 편향(Bias)을 그대로 답습하게 되어 독립적 2차 검토자 배치의 이점이 사라집니다.

**오답 분석:**
- Option A (오답): 토큰 절약 자체의 비용 효율성 문제가 핵심이 아니라, 검토자의 교차 검증 객관성 손실이 아키텍처 관점의 진짜 위험 요소입니다.
- Option B (오답): 검토자 인스턴스는 실제 소스 코드/diff 원본에 접근해야 검증을 수행할 수 있는 것이지, 생성자의 `extended thinking trace`(사고 과정 트레이스)가 필수적인 요구사항은 아닙니다.
- Option D (오답): raw diff 대신 요약본을 전달하면 오히려 텍스트 길이는 대폭 줄어듭니다. 프롬프트 길이가 초과하여 에이전트 시작이 실패한다는 설명은 사실과 반대입니다.

---

### 96번 문제

**1. 문제 원문**

A team runs per-file passes first, producing local findings for each changed file, then runs a separate integration pass over the whole changeset. What should the integration pass focus on that the per-file passes are not well suited to catch?

A) Syntax errors within an individual file, since a per-file pass already checks whether that specific file compiles and contains valid syntax

B) Duplicate logic within a single file, since per-file passes read files sequentially and cannot notice repeated code blocks in the same file

C) Inconsistencies in data flow and contracts between files, such as a shared interface used differently across files reviewed in isolation

D) Formatting and style issues within a single file, since per-file passes are too narrowly scoped to catch indentation or naming inconsistencies

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
C번: Inconsistencies in data flow and contracts between files, such as a shared interface used differently across files reviewed in isolation

**정답 및 해설:**

**핵심 개념:** 파일별 검토(Per-file Pass)와 전체 통합 검토(Integration Pass)의 계층적 역할 분담 패턴입니다. 개별 파일 단위 검토는 각 파일의 문법, 스타일, 국소적 함수 로직을 분석하는 데 최적화되어 있으나, 여러 파일 간의 상호작용, 데이터 흐름, 인터페이스 규격(Contract) 준수 여부 등 전체 시스템 맥락(Global Context)이 필요한 영역을 포착하기 어렵습니다.

**문제 상황 분석:**
- 1단계: 개별 변경 파일 단위로 독립적인 `per-file pass`를 먼저 수행하여 로컬 문제를 탐지합니다.
- 2단계: 전체 변경 사항(Whole changeset)을 대상으로 별도의 `integration pass`를 수행합니다.
- 파일별 검토에서는 놓치기 쉬우나 전체 통합 검토에서 집중적으로 탐지해야 하는 핵심 대상이 무엇인지 묻는 문제입니다.

**C번이 정답인 이유:**
개별 파일이 각각 격리된 상태(in isolation)로 검토될 때, 모델은 파일 내부의 국소적 오류는 잡을 수 있지만, A 파일에서 변경한 인터페이스 규약이 B 파일의 호출부와 일치하는지, 또는 여러 파일 간 데이터 전달 흐름(Data flow)에 모순이 없는지는 판단할 수 없습니다. 따라서 전체 변경 세트(Whole changeset)를 한꺼번에 시야에 담는 통합 패스(Integration pass)는 모듈/파일 간 데이터 흐름의 불일치 및 인터페이스 계약 위반 문제를 포착하는 데 집중해야 합니다.

**오답 분석:**
- Option A (오답): 단일 파일 내부의 구문 오류(Syntax errors)는 파일별 패스(`per-file pass`)가 가장 잘 잡아내는 국소적 영역이므로, 통합 패스의 주된 목적이 아닙니다.
- Option B (오답): 단일 파일 내의 로직 중복은 파일별 패스에서도 충분히 탐지 가능합니다.
- Option D (오답): 들여쓰기나 명명 규칙 등 단일 파일 내부의 스타일 문제 역시 파일별 패스 수준에서 손쉽게 포착할 수 있는 문제입니다.

---

### 97번 문제

**1. 문제 원문**

An architect wants to improve consistency in how a review prompt classifies findings as "bug" versus "style," and decides to add a small set of worked examples to the prompt in addition to the written criteria. Which set of examples best supports this goal?

A) One long example showing the single most severe bug the team has ever found in production, described in exhaustive detail to anchor the model's sense of scale and establish a clear benchmark for bug severity.

B) Three to five diverse examples, each showing a snippet plus the correct classification and a short reason, covering both clear bugs and clear style issues as well as one borderline case.

C) A single worked example containing only a code snippet and the label 'bug' with no further explanation, so the model must derive the bug-versus-style distinction purely from the example.

D) Ten near-duplicate examples of the same kind of off-by-one bug, each with slight variations in context and severity, so the model learns to recognize the pattern in different codebases.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
B번: Three to five diverse examples, each showing a snippet plus the correct classification and a short reason, covering both clear bugs and clear style issues as well as one borderline case.

**정답 및 해설:**

**핵심 개념:** 프롬프트 엔지니어링의 퓨샷 프롬프팅(Few-shot Prompting / In-context Learning) 모범 사례입니다. LLM의 분류 판단 일관성을 높이기 위해서는 소수의 다양성 있는 예시(Diverse examples)에 올바른 답(Label)과 단편적인 이유(Reasoning)를 포함시키고, 극단적 사례뿐만 아니라 판정이 모호한 경계선 사례(Borderline case)까지 함께 커버하는 것이 최상의 판단 기준선(Reference baseline)을 제공합니다.

**문제 상황 분석:**
- 검토 프롬프트가 코드 문제점을 "버그(bug)"와 "스타일(style)"로 분류할 때 일관성이 떨어지는 상황입니다.
- 기존의 텍스트 기준 지침에 더해, 프롬프트에 예시(Worked examples)를 추가하여 분류 정확도와 일관성을 극대화하고자 합니다.
- 가장 효과적이고 균형 잡힌 퓨샷 예시 세트 구성을 찾는 문제입니다.

**B번이 정답인 이유:**
3~5개 정도의 적절한 개수로 구성된 다채로운 예시 세트는 컨텍스트 창을 과도하게 차지하지 않으면서도 강력한 학습 효과를 냅니다. 각 예시마다 코드 스니펫, 올바른 분류 결과, 그리고 **그렇게 분류한 이유(Short reason)**를 함께 제시하면 모델은 판단 패턴을 훨씬 더 정확히 파악합니다. 또한, 명확한 버그/스타일 항목뿐만 아니라 경계선 사례(Borderline case)까지 포함하면 모델이 애매한 상황에서도 기준에 맞춰 일관되게 판단할 수 있는 가이드라인을 갖추게 됩니다.

**오답 분석:**
- Option A (오답): 프로덕션의 가장 심각한 버그 1개만 아주 길게 보여주면 모델이 그 극단적인 사례에 편향(Anchor)되어 비교적 작은 버그나 스타일 문제를 놓치게 되며, 다양성 부족으로 전체 분류 기준을 정립하지 못합니다.
- Option C (오답): 이유 설명(Reasoning) 없이 코드와 'bug' 레이블만 딸랑 제공하면 모델이 어떤 요소 때문에 버그로 분류했는지 문맥적 기준을 추론하기 어렵습니다.
- Option D (오답): 동일한 종류의 off-by-one 버그 예시만 10개 반복 제공하면 특정 패턴에 과적합(Overfitting)되어 스타일 문제나 다른 형태의 버그를 분류하는 능력은 향상되지 않습니다.

---

### 98번 문제

**1. 문제 원문**

A ticket-classification schema has a category field defined as an enum of five known categories: billing, technical, shipping, account, and refund. After deployment, roughly 8% of real tickets don't cleanly fit any of these categories, and the model is observed forcing them into the closest (often incorrect) enum value. Which schema change best addresses this?

A) Lower the required strictness of the tool by setting strict: false so the model is allowed to skip the category field for edge cases

B) Remove the enum constraint entirely and let category be an unconstrained free-text string so the model can write anything that seems to fit

C) Add an "other" enum value alongside a separate free-text detail field so ambiguous tickets can be captured without corrupting the five known categories

D) Add a sixth hardcoded category called miscellaneous_unclear_ticket_type_pending_manual_review to the existing enum list

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
C번: Add an "other" enum value alongside a separate free-text detail field so ambiguous tickets can be captured without corrupting the five known categories

**정답 및 해설:**

**핵심 개념:** 구조화된 출력(Structured Output) 스키마 설계 및 예외 처리 패턴(Fallback / "Other" Pattern)입니다. 폐쇄형 열거형(Closed Enum)으로 카테고리를 분류할 때 예상치 못한 모호한 데이터가 들어오면 모델은 억지로 기존 enum 값 중 하나에 할당하는 환각/강제 맞춤(Forced Fitting) 현상을 보입니다. 이를 방지하려면 예외 범주(`other`)와 세부 내용을 수집하는 자유 텍스트 필드를 함께 배치하는 것이 모범 사례입니다.

**문제 상황 분석:**
- 고객 문의 티켓 분류 시스템에서 카테고리 필드가 5개 enum 값(`billing`, `technical`, `shipping`, `account`, `refund`)으로 제한되어 있습니다.
- 실제 데이터의 약 8%는 기존 5개 카테고리에 명확히 들어맞지 않습니다.
- 모델이 오분류(Incorrect enum allocation)를 저지르며 억지로 가장 가까운 범주에 할당하는 문제를 해결할 스키마 개선 방안을 찾는 문제입니다.

**C번이 정답인 이유:**
기존 5개 카테고리의 정확성을 훼손하지 않으면서 8%의 모호한 티켓을 안전하게 수집하려면, enum에 `"other"` 항목을 추가하고 구체적인 이유나 내용을 적을 수 있는 별도의 자유 텍스트 필드(예: `other_reason_details`)를 스키마에 포함하는 설계가 가장 적절합니다. 이렇게 하면 모호한 입력이 들어왔을 때 모델이 기존 카테고리를 오염시키지 않고 `"other"`로 안전하게 분류한 뒤 세부 정보를 수집할 수 있습니다.

**오답 분석:**
- Option A (오답): `strict: false` 설정으로 필수 필드를 생략 가능하게 만든다고 해서 모호한 티켓 문제가 해결되지 않으며, 데이터 구조의 불완전성을 초래합니다.
- Option B (오답): enum 제약을 완전히 제거하고 자유 형식 텍스트로 바꾸면 기존에 잘 구분되던 92%의 정상 티켓 데이터에 대한 통계 및 후속 자동화 처리가 불가능해집니다.
- Option D (오답): 과도하게 길고 지나치게 구체적인 하드코딩 enum 값을 추가하는 것은 스키마 설계를 지저분하게 만들며, 모호한 티켓에 대한 유연한 세부 정보 수집 기능을 제공하지 못합니다.

---

### 99번 문제

**1. 문제 원문**

A compliance team needs an audit trail proving that every processed document produced a structured tool call, with no possibility of the model instead returning a plain-text response that silently skips extraction. The current implementation uses tool_choice: {"type": "auto"} with a single extract_record tool, and spot checks reveal some documents produced only a text response with no tool_use block at all. What change directly fixes this compliance gap?

A) Add a stronger system-prompt warning that instructs Claude to always invoke the extract_record tool, emphasizing that plain-text responses violate compliance, while leaving tool_choice set to auto.

B) Change tool_choice to {"type": "any"} (or force the specific tool by name) so Claude must always invoke a tool on every request instead of being able to respond with plain text.

C) Increase max_tokens on the request to a high value such as 4096 so Claude has enough room to always complete the extract_record tool call instead of truncating early with only plain text.

D) Switch the extract_record tool's input_schema fields such as record_id and content from optional to required so the model must invoke the tool to provide values for every document.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
B번: Change tool_choice to {"type": "any"} (or force the specific tool by name) so Claude must always invoke a tool on every request instead of being able to respond with plain text.

**정답 및 해설:**

**핵심 개념:** Claude API의 도구 선택 제어 매개변수(`tool_choice`) 및 강제 도구 호출(Forced Tool Calling) 기능입니다. 기본값인 `tool_choice: {"type": "auto"}`는 모델이 자연어 텍스트 응답과 도구 호출 여부를 스스로 결정하도록 맡기므로, 도구 호출 없이 텍스트만 응답할 가능성이 항상 존재합니다. 도구 호출을 100% 강제하고 텍스트 전용 응답 가능성을 원천 차단하려면 `tool_choice: {"type": "any"}` 또는 `tool_choice: {"type": "tool", "name": "extract_record"}`를 설정해야 합니다.

**문제 상황 분석:**
- 컴플라이언스 규정상 모든 처리 대상 문서가 예외 없이 구조화된 도구 호출(`extract_record`)을 생성해야 하는 엄격한 감사 트레일(Audit trail) 요구사항이 존재합니다.
- 현재는 `tool_choice: {"type": "auto"}`로 설정되어 있어, 표본 점검 시 일부 문서에 대해 모델이 도구 호출 블록(`tool_use`)을 생성하지 않고 일반 텍스트로 응답하여 추출을 건너뛰는 현상이 발생했습니다.
- 모델이 텍스트로 탈출하는 것을 막고 도구 호출을 시스템 차원에서 강제할 수 있는 구체적인 해결책을 찾는 문제입니다.

**B번이 정답인 이유:**
`tool_choice` 매개변수에 `{"type": "any"}`를 제공하면 Claude는 제공된 도구 목록 중 최소 하나 이상을 반드시 호출하도록 API 수준에서 강제됩니다. 또한 특정 도구인 `{"type": "tool", "name": "extract_record"}`를 명시하면 해당 도구의 호출이 보장됩니다. 이를 통해 모델이 자율적으로 일반 텍스트 응답을 반환할 수 있는 여지(Plain-text response bypass)를 완전히 제거하여 컴플라이언스 공백을 확실하게 메울 수 있습니다.

**오답 분석:**
- Option A (오답): 시스템 프롬프트에 아무리 강력한 지시문이나 경고를 추가하더라도 `tool_choice`가 `auto`로 설정되어 있는 한 확률적 모델 특성상 일반 텍스트 응답을 반환할 가능성이 완전히 사라지지 않습니다 (확률적 소프트 제약에 불과함).
- Option C (오답): `max_tokens`를 늘리는 것은 출력 길이 제한을 완화할 뿐, 모델이 도구를 호출할지 텍스트로 응답할지에 대한 의사결정 방식 자체를 강제하지 못합니다.
- Option D (오답): `input_schema` 내부의 필드를 `required`로 정의하는 것은 도구가 **호출되었을 때** 해당 매개변수들이 필수라는 의미이지, 모델이 도구 자체를 호출하도록 강제하는 역할은 수행하지 않습니다.

---

### 100번 문제

**1. 문제 원문**

A pipeline first needs Claude to run extract_metadata on an uploaded document before any enrichment or summarization steps proceed. Other tools such as translate_text and summarize_document are also registered on the same request, and the team is worried Claude might call one of those first. Which tool_choice setting guarantees extract_metadata runs on this turn?

A) tool_choice: {"type": "any"}

B) tool_choice: {"type": "tool", "name": "extract_metadata"}

C) tool_choice: {"type": "none"}

D) tool_choice: {"type": "auto"}

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
B번: tool_choice: {"type": "tool", "name": "extract_metadata"}

**정답 및 해설:**

**핵심 개념:** Claude API의 특정 도구 강제 호출(Forced Specific Tool Calling) 매개변수 설정입니다. 요청에 여러 개의 도구가 등록되어 있더라도 특정 턴에서 반드시 지정된 특정 도구 하나만을 호출하도록 강제하려면 `tool_choice: {"type": "tool", "name": "tool_name"}` 형태의 명시적 도구 지정을 사용해야 합니다.

**문제 상황 분석:**
- 파이프라인 상에서 문서 보강 및 요약에 앞서 `extract_metadata` 도구가 최우선으로 실행되어야 하는 순서 제약이 있습니다.
- 동일한 API 요청 내에 `translate_text`, `summarize_document` 등 다수의 도구가 함께 전달되어 있습니다.
- 이번 턴에서 Claude가 다른 도구를 호출하지 않고 반드시 `extract_metadata` 도구만 즉시 실행하도록 보장하는 `tool_choice` 설정을 찾는 문제입니다.

**B번이 정답인 이유:**
`tool_choice: {"type": "tool", "name": "extract_metadata"}` 설정을 사용하면, 모델은 등록된 다른 도구들이나 일반 텍스트 응답을 선택할 수 없으며, 반드시 지정된 `extract_metadata` 도구만을 호출하도록 API 수준에서 강제됩니다. 이를 통해 파이프라인의 실행 순서 의존성을 완벽하게 보장할 수 있습니다.

**오답 분석:**
- Option A (오답): `{"type": "any"}`는 등록된 도구 중 "아무거나 하나 이상"을 호출하도록 강제할 뿐, 특정 도구(`extract_metadata`)의 실행을 보장하지 않으므로 다른 도구가 먼저 호출될 수 있습니다.
- Option C (오답): `{"type": "none"}`은 모든 도구 호출을 금지하고 모델이 오직 일반 자연어 텍스트로만 응답하도록 강제합니다.
- Option D (오답): `{"type": "auto"}`는 모델이 도구 호출 여부와 호출할 도구를 자율적으로 결정하는 기본값(Default)이므로, 다른 도구를 먼저 호출하거나 텍스트로 응답할 가능성이 존재합니다.

---

### 101번 문제

**1. 문제 원문**

An engineering team is deciding whether to expose one single extract_document tool with a very large schema covering invoices, receipts, and purchase orders in one combined structure, or three separate smaller tools (extract_invoice, extract_receipt, extract_purchase_order) selected via tool_choice: "any" based on document content. Users upload one document at a time and document type varies per upload. Which design better matches the intended use of tool_choice: "any" for extraction?

A) Three separate, document-type-specific tools, but with tool_choice: "any" forced to extract_invoice as the default since invoices dominate uploads, ensuring the tool always handles the most common case correctly and reliably.

B) One combined extraction tool with a single schema for all document types, because tool_choice: "any" requires exactly one tool to be registered in the tools array for the model to invoke the extraction logic correctly and clearly.

C) Three separate, document-type-specific tools with tool_choice: "any", so Claude selects the schema matching the actual document avoiding the noise and confusion of an oversized combined schema.

D) One combined extraction tool with a unified schema for invoices, receipts, and purchase orders, where tool_choice: "any" selects that single tool and ensures consistent field naming across all document types without schema conflicts.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
C번: Three separate, document-type-specific tools with tool_choice: "any", so Claude selects the schema matching the actual document avoiding the noise and confusion of an oversized combined schema.

**정답 및 해설:**

**핵심 개념:** 도구 정의 및 스키마 모듈화 패턴(Tool Schema Modularization)과 `tool_choice: {"type": "any"}`의 활용 모범 사례입니다. `tool_choice: {"type": "any"}` 설정은 모델에게 "제공된 도구 목록 중 하나 이상을 반드시 호출하라"고 강제하면서도, **어떤 도구를 선택할지는 모델이 컨텍스트(문서 내용)를 판단하여 자율적으로 결정**하도록 위임합니다. 하나의 거대하고 복잡한 통합 스키마(Monolithic Schema) 대신 특화된 소형 스키마 여러 개를 제공하는 것이 프롬프트 노이즈를 줄이고 추출 정확도를 향상시킵니다.

**문제 상황 분석:**
- 송장, 영수증, 구매 주문서 등 업로드되는 문서의 종류가 다양하며, 한 번에 한 문서씩 들어옵니다.
- 선택지 설계안 1: 3가지 문서 형태를 모두 다루는 거대 통합 도구 1개 배치.
- 선택지 설계안 2: 문서 종류별로 특화된 소형 도구 3개를 배치하고 `tool_choice: "any"`로 호출을 강제.
- `tool_choice: "any"`의 의도된 설계 목적과 API 베스트 프랙티스에 완벽히 부합하는 방안을 찾는 문제입니다.

**C번이 정답인 이유:**
모든 필드를 포함하는 거대한 단일 스키마를 제공하면 스키마 내부의 수많은 선택적(Optional) 필드와 조건부 필드로 인해 모델이 노이즈를 겪고 환각이나 잘못된 필드 추출을 일으킬 위험이 높아집니다. 반면, 문서 종류별로 명확하고 간결한 스키마를 가진 3개의 도구(`extract_invoice`, `extract_receipt`, `extract_purchase_order`)를 등록하고 `tool_choice: {"type": "any"}`를 주면, Claude는 도구 호출을 강제받는 동시에 입력된 문서 내용을 분석하여 가장 적합한 도구를 스스로 선택합니다. 이는 스키마 복잡성을 낮추고 추출 정확도를 극대화하는 `tool_choice: "any"`의 올바른 활용 방식입니다.

**오답 분석:**
- Option A (오답): `tool_choice: "any"`는 특정 도구 하나(`extract_invoice`)만을 고정하여 강제하는 매개변수가 아니며, 그렇게 구현하면 영수증이나 구매 주문서가 입력되었을 때 오분류 및 추출 실패가 발생합니다.
- Option B (오답): `tool_choice: "any"`를 사용할 때 `tools` 배열에 반드시 1개의 도구만 등록되어야 한다는 제약 조건은 전혀 없으며, 여러 개 도구 중 하나를 선택하도록 유도하는 데 자주 쓰입니다.
- Option D (오답): 거대한 통합 스키마 1개를 사용하는 것은 스키마 충돌은 줄일 수 있어도 모델에게 불필요한 스키마 노이즈를 다량 제공하게 되므로, 소형 모듈화 도구들에 `tool_choice: "any"`를 적용하는 방식보다 우수한 설계가 아닙니다.

---

### 102번 문제

**1. 문제 원문**

The "performance suggestions" category in a code-review tool has a 70% false positive rate, and developers have stopped reading any findings from the tool at all, including from well-performing categories. The team needs to restore trust quickly while a better prompt for that category is developed over the following weeks. What is the recommended immediate action?

A) Temporarily disable the performance-suggestions category so developers see only the accurate categories, while iterating on that category's prompt separately before re-enabling it.

B) Merge the performance-suggestions category into the correctness category so that developers reviewing correctness findings also encounter performance suggestions, gradually rebuilding trust through repeated exposure.

C) Add a disclaimer banner on each code-review result indicating that certain categories have lower precision, so that developers can apply their own filtering criteria when reviewing findings across the project.

D) Lower the overall severity label on every performance finding to "informational" so that developers see them as advisory notes and can continue reviewing other accurate categories while the prompt is iterated on.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
A번: Temporarily disable the performance-suggestions category so developers see only the accurate categories, while iterating on that category's prompt separately before re-enabling it.

**정답 및 해설:**

**핵심 개념:** AI 제품 작업 흐름에서의 알림 피로(Alert Fatigue) 방지 및 신뢰 관리(Trust & Observability Management) 베스트 프랙티스입니다. 특정 카테고리의 노이즈(오탐율)가 과도하게 높을 경우 전체 AI 시스템에 대한 사용자 신뢰도가 무너집니다. 이를 방지하려면 문제가 되는 카테고리를 즉시 격리/비활성화하고, 별도의 환경에서 프롬프트를 개선한 후 재배포해야 합니다.

**문제 상황 분석:**
- 코드 검토 도구의 "performance suggestions" 카테고리 오탐율이 70%에 달하여 경고 피로(Alert Fatigue)가 발생했습니다.
- 이로 인해 개발자들이 정상적으로 작동하는 다른 카테고리의 검토 결과까지 전부 무시하게 되어 시스템 전체의 신뢰가 상실되었습니다.
- 프롬프트를 재설계하는 수주일 동안 신뢰를 신속하게 회복하기 위해 취해야 할 즉각적인 최선의 대응책을 찾는 문제입니다.

**A번이 정답인 이유:**
신뢰 회복의 핵심은 사용자에게 고품질의 신뢰할 수 있는 출력만 지속적으로 노출하는 것입니다. 오탐율이 높은 카테고리를 일시적으로 비활성화(Disable)하면 개발자는 신뢰성이 높은 카테고리의 결과만 보게 되므로 시스템 전반에 대한 거부감을 즉시 해소할 수 있습니다. 그동안 오프라인 환경에서 해당 카테고리의 프롬프트를 안전하게 반복 개선(Iterate)한 뒤 다시 활성화하는 것이 가장 정석적이고 효과적인 제품 관리 및 엔지니어링 접근 방식입니다.

**오답 분석:**
- Option B (오답): 오탐율이 높은 카테고리를 다른 정상 카테고리(Correctness)에 병합하면 정상 카테고리까지 신뢰도가 떨어지게 만들어 문제를 악화시킵니다.
- Option C (오답): 면책 배너를 띄우고 사용자에게 알아서 필터링하도록 책임을 전가하면 개발자의 피로도가 줄어들지 않으며 무시 현상이 지속됩니다.
- Option D (오답): 심각도를 "informational"로 낮추더라도 70%의 오탐 노이즈 자체가 개발자에게 노출되는 것은 변함없으므로, 개발자들이 결과를 건너뛰는 근본적인 원인을 해결하지 못합니다.

---

### 103번 문제

**1. 문제 원문**

A developer building a metadata-tagging pipeline registers a single `tag_document` tool and sets `tool_choice` to `{"type": "tool", "name": "tag_document"}` to ensure every input document is tagged. They also want Claude to use extended thinking to reason carefully before tagging ambiguous documents. During testing, requests combining extended thinking with this `tool_choice` setting return an error. What should the developer do to resolve this?

A) Switch `tool_choice` to `{"type": "any"}`, since `any` is explicitly designed to support extended thinking while `auto` and forced-tool modes are the ones that are incompatible

B) Keep `tool_choice` forced to `tag_document` and disable extended thinking for the request, because forced tool selections are incompatible with extended thinking

C) Keep `tool_choice` forced to `tag_document`, and add a top-level `thinking_mode: "extended"` field directly inside the tool's `input_schema` to bypass the restriction

D) Switch `tool_choice` to `{"type": "auto"}`, since extended thinking is only compatible with `auto` (or `none`) and is not supported alongside forced tool selections like `any` or a named tool

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
B번: Keep `tool_choice` forced to `tag_document` and disable extended thinking for the request, because forced tool selections are incompatible with extended thinking

**정답 및 해설:**

**핵심 개념:** Claude API의 Extended Thinking(`thinking`)과 Forced Tool Selection(`tool_choice`) 제약 규칙입니다. Claude API에서 확장된 사고(Extended Thinking)는 `tool_choice`가 `auto` 또는 `none`일 때만 사용할 수 있으며, 강제 도구 선택(`type: "tool"` 또는 `type: "any"`)과 동시에 사용하면 API 유효성 검사 오류(Validation Error)가 발생합니다.

**문제 상황 분석:**
- 개발자는 파이프라인에서 모든 입력 문서가 예외 없이 태그되도록 `tool_choice: {"type": "tool", "name": "tag_document"}`로 도구 호출을 강제했습니다.
- 동시에 모호한 문서 처리를 위해 `extended thinking`을 함께 사용하고자 하였으나 API 검증 에러가 발생했습니다.
- 시스템의 최우선 목적(모든 문서에 대해 `tag_document` 도구 호출 강제 보장)을 유지하면서 이 기술적 충돌을 올바르게 해결하는 방법을 찾는 문제입니다.

**B번이 정답인 이유:**
요구사항의 핵심 제약인 "모든 입력 문서가 반드시 태그되어야 함(Ensure every input document is tagged)"을 달성하기 위해서는 `tool_choice`를 `tag_document`로 강제하는 설정이 필수적입니다. Claude API 제약상 강제 도구 선택(Forced tool selection)과 확장된 사고(Extended thinking)는 상호 호환되지 않으므로, 도구 호출 강제성을 유지하기 위해서는 요청에서 `extended thinking`을 비활성화하는 것이 올바른 해결책입니다.

**오답 분석:**
- Option A (오답): `any` 모드 역시 강제 도구 선택(Forced tool selection)의 일종이므로 Extended Thinking과 호환되지 않으며 에러가 발생합니다.
- Option C (오답): 도구의 `input_schema` 내부에 `thinking_mode` 필드를 추가하는 것은 API 사양에 없는 잘못된 구조이며 제약을 우회할 수 없습니다.
- Option D (오답): `tool_choice`를 `auto`로 전환하면 Extended Thinking을 사용할 수는 있지만, 모델이 자율적으로 텍스트 응답을 반환하여 도구 호출을 건너뛸 가능성이 생기므로 "모든 문서의 태깅 보장"이라는 최우선 파이프라인 요구사항을 위배하게 됩니다.

---

### 104번 문제

**1. 문제 원문**

An extraction pipeline pulls dosage fields from clinical intake notes. Patients often describe amounts informally, such as 'a couple tablets' or 'about half a cup,' and the model sometimes fabricates a precise numeric value where the source text is genuinely vague. The team wants to reduce this fabrication without discarding informal-but-usable descriptions. What is the most effective prompt change? Select the single best answer.

A) Add a post-processing step that rejects any value failing to match a strict numeric regular expression

B) Instruct the model to always convert informal quantities into metric units for consistency across all patient records

C) Change the schema so every dosage field is marked required, forcing the model to populate a value

D) Add examples pairing informal phrases with correct normalization, plus one case where the field is left null

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: Add examples pairing informal phrases with correct normalization, plus one case where the field is left null

**정답 및 해설:**

**핵심 개념:** 프롬프트 엔지니어링의 퓨샷 예시 제공(In-context Few-shot Examples) 및 예외 처리(Null/Fallback Handling) 패턴입니다. 비정형/모호한 표현에서 정보 손실 없이 정규화를 수행하면서 완벽한 환각(Fabrication)을 방지하려면, 정상적인 정규화 사례뿐만 아니라 정보가 전혀 없거나 모호하여 값을 채울 수 없을 때 `null`을 반환하는 예시를 프롬프트에 명시하는 것이 모범 사례입니다.

**문제 상황 분석:**
- 환자가 임상 기록에 작성한 비공식적 표현('알약 두어 개', '반 컵 정도')을 추출하는 시스템입니다.
- 원본 텍스트가 모호할 때 모델이 정확한 수치(예: '2.0', '100ml')를 임의로 지어내는 환각(Fabrication) 현상이 발생하고 있습니다.
- 비공식적이지만 유용한 정보를 무작정 버리지 않으면서, 근거 없는 수치 지어냄만 효과적으로 억제하기 위한 프롬프트 개선안을 찾는 문제입니다.

**D번이 정답인 이유:**
모델에게 비공식적 표현을 유용한 형식으로 변환하는 정규화 예시(예: 'a couple tablets' → 비정형 정규화 텍스트)와 함께, 정보를 추정할 수 없는 완벽한 모호 상황에서는 필드를 `null`로 비워두도록 하는 예시(Null Case Example)를 함께 제공하면 모델은 억지로 정확한 수치를 지어내지(Fabrication) 않게 됩니다. 이는 사용 가능한 텍스트 정보는 보존하면서 환각만 선택적으로 줄이는 가장 정교하고 효과적인 프롬프트 엔지니어링 접근 방식입니다.

**오답 분석:**
- Option A (오답): 엄격한 정규식(Numeric Regex)으로 후처리에서 거부해 버리면 '알약 두어 개'와 같은 비공식적이지만 활용 가치가 있는 비수치형 정보까지 전부 버려지게(Discard) 되므로 문제 요구사항에 위배됩니다.
- Option B (오답): 모호한 비공식적 양을 무조건 미터법 단위(Metric units)로 변환하도록 강제하면, 모델이 임의의 변환 숫자를 만들어내어 환각 문제가 더 가중됩니다.
- Option C (오답): 필드를 필수(`required`)로 강제 설정하면, 정보가 부족하거나 없는 경우에도 모델이 스키마 검증을 통과하기 위해 억지로 거짓 값을 생성하게 되므로 환각 현상을 오히려 악화시킵니다.
