# Prompt Engineering & Structured Output - 어려운 문제 선별본

원본: prompt-merged.md 에서 4가지 어려운 문제 패턴에 해당하는 문제만 발췌 (문제 번호는 원본과 동일하게 유지)

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

