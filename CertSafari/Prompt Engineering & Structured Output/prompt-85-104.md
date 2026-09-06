### 85번 문제

**1. 문제 원문**

A reviewer instance returns 12 findings. The architect wants only high-confidence issues auto-fixed and everything else routed to a human. Which review design supports this goal?

A) Have the reviewer instance combine all findings into one summary paragraph and let a human manually re-derive which findings seem reliable

B) Have the reviewer instance rank findings only by the severity of the underlying bug, then auto-fix the top-ranked items regardless of how certain the reviewer was

C) Have the generator instance re-run its own self-review and quietly discard any finding it personally disagrees with before a human ever sees it

D) Have the reviewer instance tag each finding with a confidence level, then auto-fix the high-confidence findings and send the low-confidence ones to a human

---

**2. 구간별 직독직해 번역**

**[QUESTION]**

**A reviewer instance**
검토자 인스턴스가

**returns 12 findings.**
12개의 발견 사항을 반환합니다.

**The architect wants**
아키텍트는 원합니다

**only high-confidence issues**
신뢰도가 높은 문제만

**auto-fixed**
자동으로 수정되고

**and everything else**
그리고 나머지 모든 사항은

**routed to a human.**
사람에게 전달되기를 (원합니다).

**Which review design**
어떤 검토 설계가

**supports this goal?**
이 목표를 지원합니까?

---

**[OPTIONS]**

**Option A)**

**Have the reviewer instance**
검토자 인스턴스로 하여금

**combine all findings**
모든 발견 사항을 통합하게 하고

**into one summary paragraph**
하나의 요약 단락으로

**and let a human**
그리고 사람이

**manually re-derive**
수동으로 다시 도출하도록 합니다

**which findings seem reliable**
어떤 발견 사항이 신뢰할 수 있어 보이는지를

---

**Option B)**

**Have the reviewer instance**
검토자 인스턴스로 하여금

**rank findings only**
발견 사항의 순위를 매기게 하고

**by the severity**
심각도에 따라서만

**of the underlying bug,**
근본적인 버그의

**then auto-fix**
그런 다음 자동으로 수정하게 합니다

**the top-ranked items**
최상위 항목들을

**regardless of**
~와 관계없이

**how certain the reviewer was**
검토자가 얼마나 확신했는지와

---

**Option C)**

**Have the generator instance**
생성자 인스턴스로 하여금

**re-run its own self-review**
자체 자체 검토를 다시 실행하게 하고

**and quietly discard**
그리고 조용히 버리도록 합니다

**any finding**
어떤 발견 사항이든

**it personally disagrees with**
자신이 개인적으로 동의하지 않는

**before a human ever sees it**
사람이 그것을 보기도 전에

---

**Option D)**

**Have the reviewer instance**
검토자 인스턴스로 하여금

**tag each finding**
각 발견 사항에 태그를 지정하게 합니다

**with a confidence level,**
신뢰도 수준을 함께 (태그 지정)

**then auto-fix**
그런 다음 자동으로 수정합니다

**the high-confidence findings**
신뢰도가 높은 발견 사항을

**and send the low-confidence ones**
그리고 신뢰도가 낮은 것들은 전달합니다

**to a human**
사람에게

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

**2. 구간별 직독직해 번역**

**[QUESTION]**

**A platform team**
플랫폼 팀이

**runs an automated code-review gate**
자동화된 코드 검토 게이트를 운영합니다

**that blocks a pull request**
풀 리퀘스트를 차단하는 (게이트)

**from merging**
병합되는 것으로부터

**until Claude returns**
Claude가 반환할 때까지

**a verdict on the diff,**
변경 사항(diff)에 대한 판정을

**typically within a few seconds.**
보통 몇 초 이내에.

**Which approach**
어떤 접근 방식을

**should they use**
그들이 사용해야 합니까

**for this workflow?**
이 워크플로우를 위해?

---

**[OPTIONS]**

**Option A)**

**The synchronous Messages API,**
동기식 Messages API,

**since the merge gate blocks**
병합 게이트가 차단되기 때문에

**on an immediate response**
즉각적인 응답에 (대기하며)

**and the Message Batches API**
그리고 Message Batches API는

**offers no guaranteed latency SLA**
보장된 지연 시간 SLA를 제공하지 않습니다

---

**Option B)**

**The Message Batches API,**
Message Batches API,

**since the 50% cost discount**
50%의 비용 할인이

**outweighs the small delay**
작은 지연보다 더 크기 때문에

**a blocking merge gate**
차단형 병합 게이트가

**would experience while waiting**
대기하는 동안 경험하게 될 (지연)

---

**Option C)**

**Either API works**
두 API 중 어느 것이든 작동합니다

**equally well here,**
여기서 똑같이 잘,

**because Message Batches results**
왜냐하면 Message Batches 결과는

**are typically available**
보통 이용 가능하기 때문입니다

**in under a minute**
1분 이내에

**for small request volumes**
작은 요청 볼륨의 경우

---

**Option D)**

**The Message Batches API,**
Message Batches API,

**since batching the diff review**
왜냐하면 변경 사항 검토를 배치 처리하는 것이

**still returns a verdict**
여전히 판정을 반환하기 때문입니다

**well within the few-second window**
몇 초라는 시간 창 내에 충분히

**merge gates require**
병합 게이트가 요구하는

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

**2. 구간별 직독직해 번역**

**[QUESTION]**

**An automated code reviewer**
자동화된 코드 검토 도구가

**flags many instances of a pattern**
어떤 패턴의 많은 사례를 플래그 표시합니다

**(a broad except clause)**
(광범위한 except 절)

**as issues,**
문제로,

**but a large fraction of those flags**
그러나 이러한 플래그 중 상당 부분이

**are on lines**
코드 줄에 있습니다

**where the pattern is intentional**
그 패턴이 의도적이고

**and acceptable,**
허용 가능한 (줄에),

**such as top-level error boundaries**
최상위 에러 경계와 같은

**that log and re-raise.**
로그를 남기고 다시 발생시키는(re-raise).

**Reviewers are starting to ignore**
검토자들이 무시하기 시작하고 있습니다

**the tool's output**
도구의 출력 결과를

**because of the false-positive rate.**
오탐율(false-positive rate) 때문에.

**What change**
어떤 변경 사항이

**would most directly reduce**
가장 직접적으로 줄일 수 있습니까

**false positives**
오탐을

**while still catching genuine issues?**
진짜 문제는 여전히 감지하면서?

---

**[OPTIONS]**

**Option A)**

**Remove the broad except clause check**
광범위한 except 절 검사를 제거합니다

**from the rule set entirely,**
규칙 세트에서 완전히,

**since it currently produces**
그것이 현재 생성하기 때문에

**too many false positives**
너무 많은 오탐을

---

**Option B)**

**Lower the confidence threshold**
신뢰도 임계값을 낮춥니다

**so only the single highest-confidence finding**
단 하나의 가장 높은 신뢰도의 발견 사항만

**per file is reported**
파일당 보고되도록

---

**Option C)**

**Instruct the model**
모델에 지시합니다

**to only flag the pattern**
그 패턴을 플래그 표시만 하도록

**when it appears**
그것이 나타날 때

**more than three times**
3회 초과하여

**in the same file**
동일한 파일 내에서

---

**Option D)**

**Add paired examples**
쌍을 이룬 예시들을 추가합니다

**of a genuinely problematic instance**
진짜 문제가 되는 사례와

**and an acceptable instance,**
허용 가능한 사례의,

**each with the correct verdict**
각각 올바른 판정과 함께

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

**2. 구간별 직독직해 번역**

**[QUESTION]**

**A data-ingestion job**
데이터 수집 작업이

**needs to classify**
분류해야 합니다

**150,000 scanned invoices**
150,000장의 스캔된 송장을

**in one nightly run**
야간 실행 한 번으로

**using the Message Batches API.**
Message Batches API를 사용하여.

**What must the team account for**
팀은 무엇을 고려해야 합니까

**given the platform's per-batch limits?**
플랫폼의 배치당 제한 사항을 고려할 때?

---

**[OPTIONS]**

**Option A)**

**Split the 150,000 invoices**
150,000장의 송장을 나누어야 합니다

**across at least 2 batch submissions,**
최소 2개 이상의 배치 제출로,

**because a single Message Batch is capped**
왜냐하면 단일 Message Batch는 제한되기 때문입니다

**at 100,000 requests or 256 MB total payload,**
100,000개의 요청 또는 256 MB의 총 페이로드 크기로,

**whichever comes first.**
둘 중 먼저 도달하는 기준에 따라.

**(More batches may be needed**
(더 많은 배치가 필요할 수 있습니다

**if the total payload exceeds 256 MB.)**
만약 총 페이로드가 256 MB를 초과하는 경우.)

---

**Option B)**

**Divide the invoices into batches**
송장들을 배치로 나누어야 합니다

**of exactly 1,000,**
정확히 1,000개씩,

**since this is the maximum batch size**
이것이 최대 배치 크기이기 때문에

**allowed by the API**
API에 의해 허용되는

**for any data type.**
모든 데이터 유형에 대해.

---

**Option C)**

**Use the synchronous Messages API**
동기식 Messages API를 사용해야 합니다

**instead of the Batches API,**
Batches API 대신에,

**because batches are limited**
왜냐하면 배치는 제한되기 때문입니다

**to 500 requests per hour**
시간당 500개의 요청으로

**and 150,000 invoices cannot be processed overnight.**
그리고 150,000장의 송장은 야간 동안 처리될 수 없기 때문입니다.

---

**Option D)**

**Submit all 150,000 invoices**
150,000장의 송장을 모두 제출합니다

**in a single batch,**
단일 배치로,

**because the Batches API has no request limit**
왜냐하면 Batches API는 요청 제한이 없고

**and only restricts the output size of each response.**
각 응답의 출력 크기만 제한하기 때문입니다.

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

**2. 구간별 직독직해 번역**

**[QUESTION]**

**A security review assistant**
보안 검토 어시스턴트가

**extracts structured findings**
구조화된 발견 사항을 추출합니다

**from source code**
소스 코드로부터

**and developers frequently dismiss**
그리고 개발자들은 자주 기각(무시)합니다

**a large share of the findings**
발견 사항의 큰 비중을

**tied to one particular helper function**
한 특정 헬퍼 함수와 연결된

**used for input sanitization.**
입력 정제(sanitization)에 사용되는.

**The team wants to analyze**
팀은 분석하기를 원합니다

**this dismissal trend**
이 이러한 기각 경향을

**systematically over time.**
시간에 따라 체계적으로.

**What should be added**
무엇이 추가되어야 합니까

**to the structured finding schema**
구조화된 발견 사항 스키마에

**to support this analysis?**
이 이러한 분석을 지원하기 위해?

---

**[OPTIONS]**

**Option A)**

**A severity field**
심각도(severity) 필드

**that raises the priority**
우선순위를 높이는

**of every incoming finding**
들어오는 모든 발견 사항의

**regardless of which construct**
어떤 구문(construct)이

**triggered it originally**
원래 그것을 유발했는지와 관계없이

---

**Option B)**

**A detected_pattern field**
detected_pattern 필드

**naming the specific construct**
특정 구문(construct)의 이름을 지정하는

**that triggered the finding,**
발견 사항을 유발한,

**so dismissals can be grouped**
따라서 기각 건수가 그룹화될 수 있도록

**by construct**
구문(construct)별로

---

**Option C)**

**A single overall confidence score**
단일 전체 신뢰도 점수

**per finding,**
발견 사항당,

**with no record**
기록이 없는 상태로

**of which construct or rule**
어떤 구문이나 규칙이

**actually produced that finding**
실제로 그 발견 사항을 생성했는지에 대한

---

**Option D)**

**A free-text comments field**
자유 형식 텍스트 주석 필드

**where each reviewer types**
각 검토자가 입력하는

**their own reasoning for a dismissal**
기각에 대한 자신만의 이유를

**in whatever wording**
어떤 표현으로든

**feels most natural to them**
자신에게 가장 자연스럽게 느껴지는

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

**2. 구간별 직독직해 번역**

**[QUESTION]**

**An architect wants**
아키텍트는 원합니다

**a Claude-based reviewer**
Claude 기반 검토자가

**to classify findings**
발견 사항을 분류하기를

**into severity levels**
심각도 수준으로

**consistently**
일관되게

**across many pull requests**
많은 풀 리퀘스트 전반에 걸쳐

**and multiple reviewers on the team.**
그리고 팀 내 여러 검토자 전반에 걸쳐.

**Which prompt design**
어떤 프롬프트 설계가

**best achieves**
가장 잘 달성합니까

**consistent severity classification?**
일관된 심각도 분류를?

---

**[OPTIONS]**

**Option A)**

**Instruct the model**
모델에게 지시합니다

**to assign severity**
심각도를 할당하도록

**based on how urgent**
얼마나 긴급하게 느끼는지에 기반하여

**the issue feels**
문제가 느껴지는지

**in the context of the specific pull request,**
특정 풀 리퀘스트의 맥락에서,

**considering the component's criticality,**
구성 요소의 중요도,

**recent commit history,**
최근 커밋 이력,

**and related incidents.**
그리고 관련 장애/사건을 고려하여.

---

**Option B)**

**Define each severity level**
각 심각도 수준을 정의합니다

**with a short description**
짧은 설명과 함께

**plus a concrete code example**
구체적인 코드 예시를 더하여

**illustrating what qualifies**
어떤 것에 해당하는지 보여주는

**at that level,**
해당 수준에,

**so the model has**
따라서 모델이 갖도록 합니다

**a consistent reference point**
일관된 참조 기준점을

**for every classification.**
모든 분류 작업을 위해.

---

**Option C)**

**Tell the model**
모델에게 말합니다

**to default to medium severity**
기본값을 '보통' 심각도로 지정하도록

**for every finding,**
모든 발견 사항에 대해,

**escalating or de-escalating**
(심각도를) 상향 또는 하향 조정하면서

**only when it provides**
제공하는 경우에만

**specific technical justification**
구체적인 기술적 정당화를

**referencing the team's predefined severity criteria.**
팀의 미리 정의된 심각도 기준을 참조하여.

---

**Option D)**

**Ask the model**
모델에게 요청합니다

**to compare the current finding**
현재 발견 사항을 비교하도록

**to the average severity of findings**
발견 사항들의 평균 심각도와

**from the last ten pull requests,**
지난 10개의 풀 리퀘스트로부터 나온,

**using that historical baseline**
이 이러한 과거 기준선을 사용하여

**to normalize severity assignments**
심각도 할당을 정규화하도록

**across reviews.**
검토 전체에서.

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

**2. 구간별 직독직해 번역**

**[QUESTION]**

**A document-extraction system**
문서 추출 시스템이

**pulls structured fields**
구조화된 필드를 추출합니다

**(vendor, total, line items)**
(공급업체, 총액, 품목)

**from invoices that arrive**
도착하는 송장들로부터

**in wildly different layouts:**
매우 다양한 레이아웃 형태로:

**some are tables,**
일부는 표 형식이고,

**some are plain paragraphs,**
일부는 일반 단락 형식이며,

**some split totals**
일부는 총액을 나눕니다

**across multiple currencies.**
여러 통화에 걸쳐서.

**Detailed field-by-field instructions**
상세한 필드별 지시사항도

**have not stopped the model**
모델을 막지 못했습니다

**from occasionally inventing**
때때로 만들어내는 것(환각)으로부터

**plausible-looking values**
그럴듯해 보이는 값을

**when a layout doesn't match**
레이아웃이 일치하지 않을 때

**what the team anticipated.**
팀이 예상했던 것과.

**What is the best next step?**
가장 좋은 다음 단계는 무엇입니까?

---

**[OPTIONS]**

**Option A)**

**Write a longer paragraph**
더 긴 단락을 작성합니다

**enumerating every layout variant**
모든 레이아웃 변형을 나열하는

**the team can currently think of**
팀이 현재 떠올릴 수 있는

**and its handling rule**
그리고 그 처리 규칙을

---

**Option B)**

**Add a small set of examples**
소규모 예시 세트를 추가합니다

**across the layout types**
레이아웃 유형 전반에 걸친

**actually received,**
실제로 수신된,

**each paired with**
각각 쌍을 이룬

**its correct extraction**
올바른 추출 결과와

---

**Option C)**

**Preprocess every document**
모든 문서를 전처리합니다

**into one canonical plain-text format**
하나의 표준 텍스트 형식으로

**before it reaches the prompt**
프롬프트에 도달하기 전에

---

**Option D)**

**Reduce the number of required output fields**
필수 출력 필드의 수를 줄입니다

**so there are fewer chances**
기회가 더 적어지도록

**to fabricate a value**
값을 조작(환각)할

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

**2. 구간별 직독직해 번역**

**[QUESTION]**

**An architect is designing**
아키텍트가 설계하고 있습니다

**a multi-step pipeline**
다단계 파이프라인을

**to reduce false positives**
오탐(false positives)을 줄이기 위해

**in a review category:**
특정 검토 범주에서:

**a first API call**
첫 번째 API 호출이

**generates draft findings,**
초안 발견 사항을 생성하고,

**and a second API call**
두 번째 API 호출이

**reviews each draft**
각 초안을 검토합니다

**against explicit criteria**
명시적인 기준에 비추어

**before finalizing it.**
최종 확정하기 전에.

**Why would this chained approach**
왜 이러한 연결된(체이닝) 접근 방식이

**improve precision**
정밀도(precision)를 향상시킬까요

**compared to a single-pass prompt**
단일 패스 프롬프트와 비교하여

**with the same criteria?**
동일한 기준을 가진?

---

**[OPTIONS]**

**Option A)**

**The second API call is configured**
두 번째 API 호출이 설정되어 있습니다

**to invoke a more capable model**
더 성능이 뛰어난 모델을 호출하도록

**by default,**
기본적으로,

**so the improved precision**
따라서 향상된 정밀도는

**comes purely from a model upgrade**
순수하게 모델 업그레이드에서 비롯됩니다

**between calls,**
호출 간의,

**not from the explicit two-step review process.**
명시적인 2단계 검토 프로세스가 아니라.

---

**Option B)**

**Chaining calls resets**
호출을 연결하는 것은 재설정합니다

**the model's system prompt**
모델의 시스템 프롬프트를

**after the draft generation,**
초안 생성 후에,

**which strips any prior contextual cues**
이것은 이전의 맥락적 단서를 제거합니다

**that could have biased the first pass**
첫 번째 패스에 편향을 줄 수 있었던

**toward over-flagging benign patterns**
무해한 패턴을 플래그 표시하도록 과도하게

**as findings,**
발견 사항으로,

**reducing false positives.**
오탐을 줄이면서.

---

**Option C)**

**The second pass gives the model**
두 번째 패스는 모델에게 제공합니다

**a separate opportunity**
별도의 기회를

**to check each draft finding**
각 초안 발견 사항을 확인할 (기회)

**against the explicit criteria**
명시적인 기준에 비추어

**in isolation,**
개별적으로(격리하여),

**catching cases**
사례들을 포착하면서

**where the first pass may have misapplied**
첫 번째 패스가 잘못 적용했을 수 있는

**the criteria**
기준을

**due to generating a large set of findings**
다량의 발견 사항을 생성함으로 인해

**in one response.**
하나의 응답 안에서.

---

**Option D)**

**Splitting the task across two calls**
두 번의 호출로 작업을 나누는 것은

**doubles the amount of context**
모델이 사용할 수 있는 맥락의 양을 두 배로 늘립니다

**available to the model**
모델에 유용한

**by exposing all draft findings**
모든 초안 발견 사항을 노출시킴으로써

**and the criteria to the second call,**
그리고 기준을 두 번째 호출에,

**which mechanically improves**
이것은 기계적으로 향상시킵니다

**classification accuracy**
분류 정확도를

**by reducing false positives.**
오탐을 줄임으로써.

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

**2. 구간별 직독직해 번역**

**[QUESTION]**

**A logistics team uses**
물류 팀이 사용합니다

**strict tool use**
엄격한 도구 사용을

**with strict: true**
`strict: true` 설정과 함께

**to extract shipment records,**
배송 기록을 추출하기 위해,

**guaranteeing that**
보장하면서

**every "quantity" field**
모든 "quantity" 필드가

**is a well-formed integer**
올바른 형식을 갖춘 정수임을

**as required by the schema.**
스키마에 의해 요구된 대로.

**An engineer asks**
한 엔지니어가 묻습니다

**whether this guarantee alone**
이 보장만으로

**is sufficient**
충분한지

**to trust the extracted quantities**
추출된 수량을 신뢰하기에

**for downstream inventory decisions.**
후속 재고 의사결정을 위해.

**What is the correct assessment?**
올바른 평가(판단)는 무엇입니까?

---

**[OPTIONS]**

**Option A)**

**No, strict validation**
아닙니다, 엄격한 검증은

**only guarantees**
오직 보장할 뿐입니다

**structural and type conformance,**
구조적 및 타입 적합성만을,

**so business-plausibility checks**
따라서 비즈니스 타당성 검사가

**are still needed**
여전히 필요합니다

---

**Option B)**

**Yes, strict tool use**
맞습니다, 엄격한 도구 사용은

**guarantees full business-logic correctness,**
전체 비즈니스 로직의 정확성을 보장합니다,

**so no further validation**
따라서 추가적인 검증이

**of quantity values**
수량 값에 대한

**is required**
요구되지 않습니다

---

**Option C)**

**Yes, because strict mode**
맞습니다, 왜냐하면 엄격한 모드는

**internally re-runs the extraction**
내부적으로 추출을 재실행하기 때문입니다

**against the source**
원본에 대하여

**until values are semantically confirmed**
값들이 의미론적으로 확인될 때까지

---

**Option D)**

**No further check is needed here,**
여기서 추가적인 검사는 필요하지 않습니다,

**but only because**
오직 ~ 때문입니다

**this particular field**
이 특정 필드가

**happens to be numeric**
우연히 숫자형이기 때문입니다

**rather than a string**
문자열이 아니라

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

**2. 구간별 직독직해 번역**

**[QUESTION]**

**A search-augmentation team wants**
검색 증강 팀이 원합니다

**each batched research request**
각 배치된 조사 요청이

**to use a server-side web search tool**
서버 측 웹 검색 도구를 사용하기를

**so Claude can look up**
Claude가 찾아볼 수 있도록

**current information**
최신 정보를

**and incorporate it**
그리고 그것을 포함할 수 있도록

**into the same response,**
동일한 응답 내에,

**without the application fetching pages**
애플리케이션이 페이지를 직접 가져오거나

**or feeding results back itself.**
결과를 스스로 다시 제공하지 않고도.

**Is this workable**
이것이 가능합니까

**within the Message Batches API?**
Message Batches API 내에서?

---

**[OPTIONS]**

**Option A)**

**No, because the Message Batches API**
아닙니다, 왜냐하면 Message Batches API는

**rejects any request**
어떤 요청이든 거부하기 때문입니다

**that references a tool definition,**
도구 정의를 참조하는,

**whether the tool executes**
도구가 실행되는지 여부와 상관없이

**on the server or on the client**
서버에서든 클라이언트에서든

---

**Option B)**

**No, because server tools**
아닙니다, 왜냐하면 서버 도구는

**only function within**
~내에서만 기능하기 때문입니다

**streamed synchronous responses**
스트리밍되는 동기식 응답 (내에서만)

**and streaming is one of the parameters**
그리고 스트리밍은 매개변수 중 하나입니다

**batch requests do not support**
배치 요청이 지원하지 않는

---

**Option C)**

**Yes, because server tools**
네 가능합니다, 왜냐하면 서버 도구는

**such as web search**
웹 검색과 같은

**resolve automatically**
자동으로 해동(처리)되기 때문입니다

**within the request itself,**
요청 자체 내부에서,

**unlike client-side tools**
클라이언트 측 도구와 달리

**that need an application-supplied result**
애플리케이션이 제공하는 결과가 필요한

---

**Option D)**

**Yes, but only if the application**
네 가능합니다, 하지만 애플리케이션이 ~하는 경우에만

**also submits a matching synchronous request**
일치하는 동기식 요청도 제출하는 (경우에만)

**in parallel**
병렬로

**so the server tool has a live connection**
서버 도구가 실시간 연결을 갖도록

**to execute against**
실행 대상에 대해

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

**2. 구간별 직독직해 번역**

**[QUESTION]**

**To save tokens,**
토큰을 절약하기 위해,

**an architect has**
아키텍트가 시킵니다

**the generator instance**
생성자 인스턴스로 하여금

**write a summary**
요약본을 작성하도록

**of its own changes**
자신이 만든 변경 사항의

**and passes that summary,**
그리고 그 요약본을 전달합니다

**not the raw diff,**
원본 차이점(raw diff)이 아닌,

**to the independent reviewer instance.**
독립된 검토자 인스턴스에.

**Why does this undermine**
왜 이것이 저해할까요

**the value of using**
사용하는 가치를

**a second instance?**
두 번째 인스턴스를?

---

**[OPTIONS]**

**Option A)**

**Token savings from summarizing**
요약으로 인한 토큰 절약은

**are negligible**
무시할 수 있는 수준입니다

**compared to the cost**
비용에 비하면

**of running a second instance,**
두 번째 인스턴스를 실행하는 것의,

**so the summarization step**
따라서 요약 단계는

**provides no benefit either way**
어느 쪽이든 이점을 제공하지 않습니다

---

**Option B)**

**A reviewer instance**
검토자 인스턴스는

**can only produce useful findings**
유용한 발견 사항을 생성할 수만 있습니다

**when it has access**
접근 권한이 있을 때에만

**to the generator's extended thinking trace,**
생성자의 확장된 사고 트레이스(extended thinking trace)에,

**and summaries never include that trace**
그리고 요약본은 그 트레이스를 결코 포함하지 않습니다

---

**Option C)**

**The summary reflects**
요약본은 반영합니다

**the generator's own framing**
생성자 자체의 관점(프레이밍)을

**of its decisions,**
자신의 결정에 대한,

**so the reviewer evaluates that account**
따라서 검토자는 그 설명(요약본)을 평가하게 됩니다

**instead of examining**
검증하는 대신에

**the actual code fresh**
실제 코드를 새롭게(독립적으로)

---

**Option D)**

**Passing a summary instead of the diff**
diff 대신 요약본을 전달하는 것은

**exceeds the maximum prompt length**
최대 프롬프트 길이를 초과합니다

**the Agent tool supports,**
에이전트 도구가 지원하는,

**so the reviewer instance**
따라서 검토자 인스턴스는

**would fail to start**
시작하는 데 실패할 것입니다

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

**2. 구간별 직독직해 번역**

**[QUESTION]**

**A team runs**  
한 팀이 실행합니다  

**per-file passes first,**  
파일별 패스(검토)를 먼저,  

**producing local findings**  
국소적(로컬) 발견 사항을 생성하면서  

**for each changed file,**  
변경된 각 파일에 대해,  

**then runs**  
그런 다음 실행합니다  

**a separate integration pass**  
별도의 통합 패스를  

**over the whole changeset.**  
전체 변경 사항 세트(changeset)에 대해.  

**What should the integration pass**  
통합 패스는 무엇에  

**focus on**  
중점을 두어야 합니까  

**that the per-file passes**  
파일별 패스가  

**are not well suited to catch?**  
포착하기에 적합하지 않은?  

---

**[OPTIONS]**

**Option A)**

**Syntax errors**  
구문 오류  

**within an individual file,**  
개별 파일 내의,  

**since a per-file pass**  
파일별 패스가  

**already checks**  
이미 검사하기 때문에  

**whether that specific file compiles**  
해당 특정 파일이 컴파일되는지  

**and contains valid syntax**  
그리고 유효한 구문을 포함하는지를  

---

**Option B)**

**Duplicate logic**  
중복된 로직  

**within a single file,**  
단일 파일 내의,  

**since per-file passes**  
파일별 패스가  

**read files sequentially**  
파일을 순차적으로 읽고  

**and cannot notice**
알아차릴 수 없기 때문에  

**repeated code blocks**  
반복되는 코드 블록을  

**in the same file**  
동일한 파일 내에서  

---

**Option C)**

**Inconsistencies in data flow**  
데이터 흐름에서의 불일치  

**and contracts between files,**  
그리고 파일 간의 계약(인터페이스/서약)에서의 (불일치),  

**such as a shared interface**  
공유 인터페이스와 같은  

**used differently**  
다르게 사용되는  

**across files**  
여러 파일들에 걸쳐  

**reviewed in isolation**  
격리되어 검토된  

---

**Option D)**

**Formatting and style issues**  
포맷팅 및 스타일 문제  

**within a single file,**  
단일 파일 내의,  

**since per-file passes**  
파일별 패스가  

**are too narrowly scoped**
범위가 너무 좁게 설정되어 있기 때문에  

**to catch indentation**  
들여쓰기를 포착하기에는  

**or naming inconsistencies**  
또는 명명 규칙 불일치를  

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

**2. 구간별 직독직해 번역**

**[QUESTION]**

**An architect wants**
아키텍트는 원합니다

**to improve consistency**
일관성을 향상시키기를

**in how a review prompt classifies**
검토 프롬프트가 분류하는 방식에서

**findings as "bug" versus "style,"**
발견 사항을 "버그" 대 "스타일"로,

**and decides to add**
그리고 추가하기로 결정합니다

**a small set of worked examples**
소규모의 풀이 예시 세트를

**to the prompt**
프롬프트에

**in addition to the written criteria.**
서면 기준에 더하여.

**Which set of examples**
어떤 예시 세트가

**best supports this goal?**
이 목표를 가장 잘 지원합니까?

---

**[OPTIONS]**

**Option A)**

**One long example**
하나의 긴 예시

**showing the single most severe bug**
가장 심각한 단 하나의 버그를 보여주는

**the team has ever found in production,**
팀이 프로덕션에서 발견했던 것 중,

**described in exhaustive detail**
철저하고 상세하게 설명된

**to anchor the model's sense of scale**
모델의 규모 감각을 고정하고

**and establish a clear benchmark**
명확한 기준점을 세우기 위해

**for bug severity.**
버그 심각도에 대한.

---

**Option B)**

**Three to five diverse examples,**
3~5개의 다양성 있는 예시들,

**each showing a snippet**
각각 코드 스니펫을 보여주는

**plus the correct classification**
올바른 분류 및

**and a short reason,**
짧은 이유(추론)와 함께,

**covering both clear bugs**
명확한 버그와

**and clear style issues**
명확한 스타일 문제뿐만 아니라

**as well as one borderline case.**
하나의 경계선(모호한) 사례까지 다루는.

---

**Option C)**

**A single worked example**
단 하나의 풀이 예시

**containing only a code snippet**
코드 스니펫과

**and the label 'bug'**
'bug' 레이블만 포함하는

**with no further explanation,**
추가적인 설명 없이,

**so the model must derive**
따라서 모델이 도출해야만 하도록

**the bug-versus-style distinction**
버그 대 스타일 구분을

**purely from the example.**
순수하게 예시로부터.

---

**Option D)**

**Ten near-duplicate examples**
10개의 거의 중복된 예시들

**of the same kind of off-by-one bug,**
동일한 종류의 off-by-one 버그에 대한,

**each with slight variations**
각각 약간의 변형이 있는

**in context and severity,**
맥락과 심각도에 있어,

**so the model learns**
따라서 모델이 학습하도록

**to recognize the pattern**
패턴을 인식하는 법을

**in different codebases.**
서로 다른 코드베이스에서.

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

**2. 구간별 직독직해 번역**

**[QUESTION]**

**A ticket-classification schema**
티켓 분류 스키마가

**has a category field**
카테고리 필드를 가지고 있습니다

**defined as an enum**
열거형(enum)으로 정의된

**of five known categories:**
5개의 알려진 카테고리로 이루어진:

**billing, technical, shipping, account, and refund.**
청구, 기술, 배송, 계정, 환불.

**After deployment,**
배포 후에,

**roughly 8% of real tickets**
실제 티켓의 약 8%가

**don't cleanly fit**
깔끔하게 맞지 않으며

**any of these categories,**
이 카테고리 중 어느 것에도,

**and the model is observed**
그리고 모델이 ~하는 것이 관찰됩니다

**forcing them into**
그것들을 강제로 집어넣는 것이

**the closest (often incorrect)**
가장 가까운 (흔히 잘못된)

**enum value.**
enum 값으로.

**Which schema change**
어떤 스키마 변경이

**best addresses this?**
이 문제를 가장 잘 해결합니까?

---

**[OPTIONS]**

**Option A)**

**Lower the required strictness**
요구되는 엄격함을 낮춥니다

**of the tool**
도구의

**by setting strict: false**
`strict: false`를 설정함으로써

**so the model is allowed**
따라서 모델이 허용되도록

**to skip the category field**
카테고리 필드를 건너뛰는 것이

**for edge cases**
엣지 케이스에 대해

---

**Option B)**

**Remove the enum constraint entirely**
enum 제약 조건을 완전히 제거합니다

**and let category be**
그리고 카테고리가 ~가 되도록 합니다

**an unconstrained free-text string**
제약 없는 자유 형식 텍스트 문자열이

**so the model can write**
따라서 모델이 쓸 수 있도록

**anything that seems to fit**
적합해 보이는 것은 무엇이든

---

**Option C)**

**Add an "other" enum value**
"other" enum 값을 추가합니다

**alongside a separate**
별도의 ~와 함께

**free-text detail field**
자유 형식 텍스트 세부정보 필드 (와 함께)

**so ambiguous tickets**
따라서 모호한 티켓들이

**can be captured**
포착될 수 있도록

**without corrupting**
손상시키지 않고

**the five known categories**
5개의 알려진 카테고리를

---

**Option D)**

**Add a sixth hardcoded category**
여섯 번째 하드코딩된 카테고리를 추가합니다

**called miscellaneous_unclear_ticket_type_pending_manual_review**
`miscellaneous_unclear_ticket_type_pending_manual_review`라 불리는

**to the existing enum list**
기존 enum 목록에

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

**2. 구간별 직독직해 번역**

**[QUESTION]**

**A compliance team needs**
컴플라이언스 팀이 필요로 합니다

**an audit trail**
감사 흔적(감사 기록)을

**proving that every processed document**
처리된 모든 문서가 ~했음을 증명하는

**produced a structured tool call,**
구조화된 도구 호출을 생성했음을,

**with no possibility**
가능성이 전혀 없이

**of the model instead returning**
모델이 대신 반환할 (가능성)

**a plain-text response**
일반 텍스트 응답을

**that silently skips extraction.**
추출 과정을 조용히 건너뛰는.

**The current implementation uses**
현재 구현 방식은 사용합니다

**tool_choice: {"type": "auto"}**
`tool_choice: {"type": "auto"}` 설정을

**with a single extract_record tool,**
단일 `extract_record` 도구와 함께,

**and spot checks reveal**
그리고 표본 점검 결과 밝혀졌습니다

**some documents produced**
일부 문서가 생성했다는 점이

**only a text response**
일반 텍스트 응답만을

**with no tool_use block at all.**
`tool_use` 블록이 전혀 없이.

**What change**
어떤 변경 사항이

**directly fixes**
직접적으로 해결합니까

**this compliance gap?**
이 이러한 컴플라이언스 공백을?

---

**[OPTIONS]**

**Option A)**

**Add a stronger system-prompt warning**
더 강력한 시스템 프롬프트 경고를 추가합니다

**that instructs Claude to always invoke**
Claude에게 항상 호출하도록 지시하는

**the extract_record tool,**
`extract_record` 도구를,

**emphasizing that plain-text responses**
일반 텍스트 응답이 ~임을 강조하면서

**violate compliance,**
컴플라이언스를 위반한다는 점을,

**while leaving tool_choice set to auto.**
`tool_choice`를 `auto`로 설정해 둔 채로.

---

**Option B)**

**Change tool_choice to {"type": "any"}**
`tool_choice`를 `{"type": "any"}`로 변경합니다

**(or force the specific tool by name)**
(또는 이름으로 특정 도구를 강제함)

**so Claude must always invoke**
따라서 Claude가 항상 호출해야만 하도록

**a tool on every request**
모든 요청에서 도구를

**instead of being able to respond**
응답할 수 있는 대신에

**with plain text.**
일반 텍스트로.

---

**Option C)**

**Increase max_tokens on the request**
요청의 `max_tokens`를 늘립니다

**to a high value such as 4096**
4096과 같은 높은 값으로

**so Claude has enough room**
따라서 Claude가 충분한 여유 공간을 갖도록

**to always complete**
항상 완료할 수 있는 (공간)

**the extract_record tool call**
`extract_record` 도구 호출을

**instead of truncating early**
조기에 잘려나가는 대신에

**with only plain text.**
일반 텍스트만으로.

---

**Option D)**

**Switch the extract_record tool's input_schema fields**
`extract_record` 도구의 `input_schema` 필드들을 전환합니다

**such as record_id and content**
`record_id` 및 `content`와 같은

**from optional to required**
선택 사항(optional)에서 필수 사항(required)으로

**so the model must invoke the tool**
따라서 모델이 도구를 호출해야만 하도록

**to provide values for every document.**
모든 문서에 대해 값을 제공하기 위해.

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

**2. 구간별 직독직해 번역**

**[QUESTION]**

**A pipeline first needs Claude**
파이프라인은 먼저 Claude가 ~하기를 필요로 합니다

**to run extract_metadata**
extract_metadata를 실행하기를

**on an uploaded document**
업로드된 문서에 대해

**before any enrichment**
어떠한 데이터 보강(enrichment)이나

**or summarization steps proceed.**
요약 단계가 진행되기 전에.

**Other tools such as**
~와 같은 다른 도구들도

**translate_text and summarize_document**
translate_text 및 summarize_document

**are also registered**
함께 등록되어 있습니다

**on the same request,**
동일한 요청에,

**and the team is worried**
그리고 팀은 우려하고 있습니다

**Claude might call**
Claude가 호출할지도 모른다고

**one of those first.**
그것들 중 하나를 먼저.

**Which tool_choice setting**
어떤 tool_choice 설정이

**guarantees extract_metadata runs**
extract_metadata가 실행되는 것을 보장합니까

**on this turn?**
이번 턴에서?

---

**[OPTIONS]**

**Option A)**

**tool_choice: {"type": "any"}**
`tool_choice: {"type": "any"}`

---

**Option B)**

**tool_choice: {"type": "tool", "name": "extract_metadata"}**
`tool_choice: {"type": "tool", "name": "extract_metadata"}`

---

**Option C)**

**tool_choice: {"type": "none"}**
`tool_choice: {"type": "none"}`

---

**Option D)**

**tool_choice: {"type": "auto"}**
`tool_choice: {"type": "auto"}`

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

**2. 구간별 직독직해 번역**

**[QUESTION]**

**An engineering team is deciding**
엔지니어링 팀이 결정하고 있습니다

**whether to expose one single extract_document tool**
단일 extract_document 도구 하나를 노출할지

**with a very large schema**
매우 큰 스키마를 가진

**covering invoices, receipts, and purchase orders**
송장, 영수증, 구매 주문서를 포함하는

**in one combined structure,**
하나의 결합된 구조 안에,

**or three separate smaller tools**
아니면 세 개의 별도 소형 도구들을 (노출할지)

**(extract_invoice, extract_receipt, extract_purchase_order)**
(extract_invoice, extract_receipt, extract_purchase_order)

**selected via tool_choice: "any"**
tool_choice: "any"를 통해 선택되는

**based on document content.**
문서 내용에 기반하여.

**Users upload one document at a time**
사용자는 한 번에 하나의 문서를 업로드하며

**and document type varies per upload.**
문서 유형은 업로드마다 다릅니다.

**Which design better matches**
어떤 설계가 더 잘 부합합니까

**the intended use of tool_choice: "any"**
tool_choice: "any"의 의도된 사용 목적에

**for extraction?**
추출 작업을 위한?

---

**[OPTIONS]**

**Option A)**

**Three separate, document-type-specific tools,**
세 개의 별도의 문서 유형별 전용 도구들,

**but with tool_choice: "any" forced**
하지만 tool_choice: "any"가 강제된

**to extract_invoice as the default**
기본값으로 extract_invoice에,

**since invoices dominate uploads,**
송장이 업로드의 대부분을 차지하기 때문에,

**ensuring the tool always handles**
도구가 항상 처리하도록 보장하면서

**the most common case correctly and reliably.**
가장 흔한 사례를 정확하고 신뢰성 있게.

---

**Option B)**

**One combined extraction tool**
하나의 결합된 추출 도구

**with a single schema for all document types,**
모든 문서 유형에 대한 단일 스키마를 가진,

**because tool_choice: "any" requires**
왜냐하면 tool_choice: "any"는 요구하기 때문입니다

**exactly one tool to be registered**
정확히 하나의 도구만 등록될 것을

**in the tools array**
tools 배열에

**for the model to invoke the extraction logic**
모델이 추출 로직을 호출하도록 하기 위해

**correctly and clearly.**
정확하고 명확하게.

---

**Option C)**

**Three separate, document-type-specific tools**
세 개의 별도의 문서 유형별 전용 도구들

**with tool_choice: "any",**
tool_choice: "any" 설정과 함께,

**so Claude selects the schema**
따라서 Claude가 스키마를 선택합니다

**matching the actual document**
실제 문서와 일치하는 (스키마를)

**avoiding the noise and confusion**
노이즈와 혼란을 피하면서

**of an oversized combined schema.**
지나치게 큰 결합 스키마의.

---

**Option D)**

**One combined extraction tool**
하나의 결합된 추출 도구

**with a unified schema**
통합 스키마를 가진

**for invoices, receipts, and purchase orders,**
송장, 영수증, 구매 주문서를 위한,

**where tool_choice: "any" selects that single tool**
여기서 tool_choice: "any"는 그 단일 도구를 선택하고

**and ensures consistent field naming**
일관된 필드 명명 규칙을 보장합니다

**across all document types**
모든 문서 유형에 걸쳐

**without schema conflicts.**
스키마 충돌 없이.

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

**2. 구간별 직독직해 번역**

**[QUESTION]**

**The "performance suggestions" category**
"성능 제안(performance suggestions)" 카테고리가

**in a code-review tool**
코드 검토 도구 내의

**has a 70% false positive rate,**
70%의 오탐율(false positive rate)을 보이며,

**and developers have stopped reading**
그리고 개발자들은 읽는 것을 중단했습니다

**any findings from the tool at all,**
도구로부터 나온 그 어떠한 발견 사항도 완전히,

**including from well-performing categories.**
성능이 좋은 카테고리에서 나온 것을 포함하여.

**The team needs to restore trust quickly**
팀은 신뢰를 신속하게 회복해야 합니다

**while a better prompt for that category**
해당 카테고리를 위한 더 나은 프롬프트가

**is developed over the following weeks.**
수주에 걸쳐 개발되는 동안.

**What is the recommended immediate action?**
권장되는 즉각적인 조치는 무엇입니까?

---

**[OPTIONS]**

**Option A)**

**Temporarily disable**
일시적으로 비활성화합니다

**the performance-suggestions category**
성능 제안 카테고리를

**so developers see only the accurate categories,**
따라서 개발자들이 정확한 카테고리만 보도록,

**while iterating on that category's prompt separately**
해당 카테고리의 프롬프트를 별도로 개선하는 동안

**before re-enabling it.**
그것을 다시 활성화하기 전에.

---

**Option B)**

**Merge the performance-suggestions category**
성능 제안 카테고리를 병합합니다

**into the correctness category**
정확성(correctness) 카테고리로

**so that developers reviewing correctness findings**
따라서 정확성 발견 사항을 검토하는 개발자들이

**also encounter performance suggestions,**
성능 제안도 접하게 되도록,

**gradually rebuilding trust**
신뢰를 점진적으로 다시 구축하면서

**through repeated exposure.**
반복적인 노출을 통해.

---

**Option C)**

**Add a disclaimer banner**
면책 조항 배너를 추가합니다

**on each code-review result**
각 코드 검토 결과에

**indicating that certain categories**
특정 카테고리가 ~임을 나타내는

**have lower precision,**
더 낮은 정밀도를 가지고 있다는 점을,

**so that developers can apply**
따라서 개발자들이 적용할 수 있도록

**their own filtering criteria**
자신들만의 필터링 기준을

**when reviewing findings across the project.**
프로젝트 전체에 걸쳐 발견 사항을 검토할 때.

---

**Option D)**

**Lower the overall severity label**
전체 심각도 레이블을 낮춥니다

**on every performance finding**
모든 성능 발견 사항에 대한

**to "informational"**
"정보성(informational)"으로

**so that developers see them**
따라서 개발자들이 그것들을 보도록

**as advisory notes**
조언성 메모로

**and can continue reviewing**
그리고 계속 검토할 수 있도록

**other accurate categories**
다른 정확한 카테고리들을

**while the prompt is iterated on.**
프롬프트가 개선되는 동안.

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

**2. 구간별 직독직해 번역**

**[QUESTION]**

**A developer building**
개발자가 구축 중입니다

**a metadata-tagging pipeline**
메타데이터 태깅 파이프라인을

**registers a single `tag_document` tool**
단일 `tag_document` 도구를 등록하고

**and sets `tool_choice`**
`tool_choice`를 설정합니다

**to `{"type": "tool", "name": "tag_document"}`**
`{"type": "tool", "name": "tag_document"}`로

**to ensure every input document is tagged.**
모든 입력 문서가 태그되도록 보장하기 위해.

**They also want Claude to use**
그들은 또한 Claude가 사용하기를 원합니다

**extended thinking**
확장된 사고(extended thinking)를

**to reason carefully**
신중하게 추론하기 위해

**before tagging ambiguous documents.**
모호한 문서에 태그를 지정하기 전에.

**During testing,**
테스트 중에,

**requests combining extended thinking**
확장된 사고를 결합한 요청이

**with this `tool_choice` setting**
이 `tool_choice` 설정과

**return an error.**
오류를 반환합니다.

**What should the developer do**
개발자는 무엇을 해야 합니까

**to resolve this?**
이 문제를 해결하기 위해?

---

**[OPTIONS]**

**Option A)**

**Switch `tool_choice` to `{"type": "any"}`,**
`tool_choice`를 `{"type": "any"}`로 전환합니다,

**since `any` is explicitly designed**
`any`는 명시적으로 설계되었기 때문에

**to support extended thinking**
확장된 사고를 지원하도록

**while `auto` and forced-tool modes**
반면 `auto` 및 강제 도구 모드는

**are the ones that are incompatible**
호환되지 않는 모드인 반면에

---

**Option B)**

**Keep `tool_choice` forced to `tag_document`**
`tool_choice`를 `tag_document`에 강제된 상태로 유지하고

**and disable extended thinking for the request,**
해당 요청에 대해 확장된 사고를 비활성화합니다,

**because forced tool selections**
왜냐하면 강제 도구 선택은

**are incompatible with extended thinking**
확장된 사고와 호환되지 않기 때문에

---

**Option C)**

**Keep `tool_choice` forced to `tag_document`,**
`tool_choice`를 `tag_document`에 강제된 상태로 유지하고,

**and add a top-level `thinking_mode: "extended"` field**
최상위 `thinking_mode: "extended"` 필드를 추가합니다

**directly inside the tool's `input_schema`**
도구의 `input_schema` 내부 바로 안에

**to bypass the restriction**
제약을 우회하기 위해

---

**Option D)**

**Switch `tool_choice` to `{"type": "auto"}`,**
`tool_choice`를 `{"type": "auto"}`로 전환합니다,

**since extended thinking is only compatible**
왜냐하면 확장된 사고는 오직 호환되기 때문입니다

**with `auto` (or `none`)**
`auto` (또는 `none`)와만

**and is not supported**
그리고 지원되지 않습니다

**alongside forced tool selections**
강제 도구 선택과 함께는

**like `any` or a named tool**
`any` 또는 지정된 도구와 같은

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

**2. 구간별 직독직해 번역**

**[QUESTION]**

**An extraction pipeline**
추출 파이프라인이

**pulls dosage fields**
복용량 필드를 추출합니다

**from clinical intake notes.**
임상 접수 기록으로부터.

**Patients often describe amounts**
환자들은 흔히 양을 설명합니다

**informally,**
비공식적으로(비정형 표현으로),

**such as 'a couple tablets'**
'알약 두어 개' 또는

**or 'about half a cup,'**
'반 컵 정도'와 같이,

**and the model sometimes fabricates**
그리고 모델은 때때로 조작(환각)합니다

**a precise numeric value**
정확한 수치 값을

**where the source text**
원본 텍스트가

**is genuinely vague.**
진짜로 모호한 부분에서.

**The team wants to reduce**
팀은 줄이기를 원합니다

**this fabrication**
이 이러한 지어냄(환각)을

**without discarding**
버리지 않고

**informal-but-usable descriptions.**
비공식적이지만 사용 가능한 설명을.

**What is the most effective**
가장 효과적인

**prompt change?**
프롬프트 변경 사항은 무엇입니까?

**Select the single best answer.**
단 하나의 최선의 답을 선택하십시오.

---

**[OPTIONS]**

**Option A)**

**Add a post-processing step**
후처리 단계를 추가합니다

**that rejects any value**
어떤 값이든 거부하는

**failing to match**
일치하지 않는

**a strict numeric regular expression**
엄격한 숫자 정규 표현식과

---

**Option B)**

**Instruct the model**
모델에게 지시합니다

**to always convert informal quantities**
비공식적 수량을 항상 변환하도록

**into metric units**
미터법 단위로

**for consistency**
일관성을 위해

**across all patient records**
모든 환자 기록 전반에 걸쳐

---

**Option C)**

**Change the schema**
스키마를 변경합니다

**so every dosage field**
모든 복용량 필드가

**is marked required,**
필수(required)로 표시되도록,

**forcing the model**
모델이 강제로 ~하도록 하면서

**to populate a value**
값을 채워 넣도록

---

**Option D)**

**Add examples**
예시들을 추가합니다

**pairing informal phrases**
비공식 표현을 짝 지은

**with correct normalization,**
올바른 정규화 표현과,

**plus one case**
그리고 하나의 사례를 더하여

**where the field is left null**
필드가 null로 남겨지는

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