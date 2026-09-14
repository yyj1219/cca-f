# Context Management & Reliability 어려운 문제

---

### 51번 문제

**1. 문제 원문**

A financial-statement extraction pipeline routes any field scored below 0.85 confidence to human review. After several months, reviewers report that many fields scored at 0.9 or higher are still wrong, and they've begun manually re-checking most extractions regardless of the score, defeating the purpose of the threshold. What is the most likely root cause?

A) Reviewers are spending too much time on each individual field, so the threshold should be raised to reduce the total number of fields sent to review.

B) The document set has grown too large for a fixed threshold to remain meaningful, so the team should switch to reviewing a fixed percentage of documents instead.

C) The 0.85 threshold was never validated against labeled ground truth to confirm that fields scoring above it are actually correct at an acceptable rate.

D) The confidence scores are being computed correctly, but reviewers lack training on how to interpret a 0.9 versus a 0.95 score.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

C번: The 0.85 threshold was never validated against labeled ground truth to confirm that fields scoring above it are actually correct at an acceptable rate.

**정답 및 해설:**

**핵심 개념:** 

AI 및 LLM 기반 추출 파이프라인에서 신뢰도 임계값 설정 시 요구되는 **신뢰도 교정 및 정답 데이터 검증(Confidence Calibration & Ground Truth Validation)** 기법입니다. 모델이 출력하는 신뢰도 점수(Confidence Score)가 실제 정답률(Accuracy)과 일치하지 않는 과신(Overconfidence) 현상이 발생할 수 있으므로, 임계값을 정하기 전에는 반드시 라벨링된 정답 데이터(Ground Truth)를 기반으로 임계값 상위 영역의 실제 정확도를 검증해야 합니다.

**문제 상황 분석:**

- 신뢰도 0.85 미만의 추출 필드만 인간의 검토(Human Review)로 넘기도록 파이프라인을 구축함.
- 몇 달 후, 0.9 이상의 높은 신뢰도 점수를 받은 필드조차 실제로는 오답인 경우가 다수 발생함.
- 신뢰도 점수를 믿을 수 없게 된 검토자들이 모든 추출 건을 일일이 수동 재확인하게 되어 신뢰도 임계값(0.85) 설정의 목적이 상실됨.

**C번이 정답인 이유:**

모델이 0.9 이상의 높은 신뢰도를 부여했음에도 오류가 다수 발생한다는 것은 모델의 신뢰도 점수가 실제 정확도와 교정(Calibration)되지 않았음을 의미합니다. 근본적인 원인은 초기 0.85라는 임계값을 설정할 때 라벨링된 정답 데이터(Labeled Ground Truth)와 대조하여 "0.85 이상의 필드가 실제로 수용 가능한 수준의 정확도를 보이는가?"를 실증적으로 검증(Validation)하지 않은 채 임의로 임계값을 설정했기 때문입니다.

**오답 분석:**
- Option A (오답): 임계값을 임의로 올리는 것은 신뢰도 평가 자체가 오염/미교정된 상황에서 문제를 해결하지 못하며, 검토로 전달되는 오류 필드를 오히려 자의적으로 줄여 시스템 품질을 악화시킵니다.
- Option B (오답): 문서 집합의 크기가 커진다고 해서 고정 임계값의 의미가 상실되는 것은 아니며, 단순 고정 비율(Fixed Percentage) 검토 전환은 고신뢰도 오답 문제를 해결해 주지 못합니다.
- Option D (오답): 검토자가 0.9와 0.95 점수의 차이를 해석하는 교육을 받지 못한 것이 문제가 아니라, 모델이 0.9 이상의 높은 신뢰도를 매긴 필드 자체가 오답(Wrong Extraction)을 포함하고 있다는 시스템적 오류가 문제입니다.

---


### 52번 문제

**1. 문제 원문**

A SaaS support agent generates a self-reported confidence score of 45% for its answer to a billing proration question, even though the retrieved documentation and account data clearly and unambiguously support that answer. Should the agent escalate based on the low confidence score?

A) No, a self-reported score isn't a reliable complexity proxy when the evidence clearly supports the answer

B) Yes, low self-reported confidence always indicates the underlying case is factually ambiguous

C) Yes, any confidence score below 50% should automatically trigger escalation to a human agent

D) No, but only because billing proration questions are categorically excluded from confidence-based escalation

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

A번: No, a self-reported score isn't a reliable complexity proxy when the evidence clearly supports the answer

**정답 및 해설:**

**핵심 개념:** 

LLM의 **자체 보고 신뢰도 점수(Self-reported Confidence Score / Verbalized Confidence)**의 불확실성과 교정(Calibration) 한계 문제입니다. LLM이 언어 형태로 서술하여 내놓는 자체 신뢰도 수치는 미교정(Uncalibrated)되어 있는 경우가 많아 실제 사실성이나 문제의 실제 복잡성(Complexity)을 대변하는 신뢰할 수 있는 대리 지표(Proxy)가 되지 못합니다. 따라서 명확한 근거(Grounding Evidence)가 확보된 상황이라면 비교정된 감점 지표만으로 이관해서는 안 됩니다.

**문제 상황 분석:**

- SaaS 지원 AI 에이전트가 청구 금액 비례 계산(Billing proration) 문의에 답을 생성함.
- 검색된 공식 문서 및 사용자 계정 데이터가 완벽하고 명확하게 해당 답변을 뒷받침함(High Factuality & Grounding).
- 그러나 에이전트가 프롬프트/자체 평가를 통해 45%라는 낮은 자체 신뢰도 점수(Self-reported confidence)를 출력함.
- 확실한 명증 데이터가 존재할 때, 이 낮은 자체 신뢰도 점수만으로 사람 상담원에게 이관(Escalation)해야 하는지 여부를 묻고 있음.

**A번이 정답인 이유:**

LLM이 스스로 "제 신뢰도는 45%입니다"라고 출력하는 자체 보고 신뢰도는 확률적으로 잘 교정되어 있지 않고(Poorly calibrated), 모델의 학업적 한계나 환각적 표현에 의해 왜곡되기 쉽습니다. 검색된 문서(Documentation)와 계정 데이터(Account Data)라는 명확하고 객관적인 정답 근거(Evidence)가 답변을 완벽히 지지하고 있다면, 모델의 불안정한 자체 평가 수치에만 의존하여 무조건 상급자로 이관할 필요가 없습니다.

**오답 분석:**
- Option B (오답): LLM의 낮은 자체 보고 신뢰도가 '항상(always)' 사실적 모호함을 나타내는 것은 아닙니다. 근거 문서가 명확함에도 수치 판단을 잘못하여 오교정된 수치를 내놓을 수 있습니다.
- Option C (오답): 근거 데이터의 가용성 및 명확성을 무시하고 단순 50% 미만 임계값으로 자동 이관을 강제하는 것은 비효율적인 시스템 설계입니다.
- Option D (오답): 청구 금액 비례 계산 질문이 신뢰도 기반 이관 정책에서 범주적으로 완전히 제외된다는 특수 규칙은 존재하지 않으며 논리적 근거가 부적절합니다.

---


### 53번 문제

**1. 문제 원문**

A medical-records extraction system reports 96% overall field accuracy. When an architect breaks the results down further, the 'medication dosage' field is only 81% accurate on handwritten prescription forms, while every other field and document type exceeds 97%. The team is deciding whether to reduce human review of the pipeline overall. What is the correct action?

A) Keep human review at the current level for all fields and document types until the medication-dosage field's accuracy on handwritten forms is separately investigated and improved.

B) Reduce human review for every field and document type except handwritten prescriptions in general, treating the entire document type as unreliable rather than isolating the specific field.

C) Remove human review only from the medication-dosage field on handwritten forms, since that field's absolute accuracy is still above chance level and the errors are likely evenly distributed.

D) Reduce human review across the entire pipeline uniformly, since the 96% overall figure already reflects the presence of the weaker medication-dosage field.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

A번: Keep human review at the current level for all fields and document types until the medication-dosage field's accuracy on handwritten forms is separately investigated and improved.

**정답 및 해설:**

**핵심 개념:** 

의료/금융 등 고위험 도메인(High-risk Domain)의 데이터 추출 파이프라인 설계에서 **안전 가드레일 및 세그먼트 오류 리스크 관리(Safety Guardrails & Risk-Sensitive Human-in-the-Loop)** 원칙입니다. 시스템 전체의 평균 정확도가 아무리 높더라도, 환자의 생명과 직결되는 핵심 필드('약물 용량')에서 취약한 오답률(81%)이 포착된다면, 해당 원인이 규명되고 개선될 때까지 안전한 수준의 검토 체계를 유지해야 합니다.

**문제 상황 분석:**

- 의료 기록 추출 파이프라인의 전체 정확도는 96%로 양호함.
- 세부 평가 결과, 수기 처방전의 '약물 용량(medication dosage)' 필드 정확도가 81%로 매우 낮게 떨어짐.
- 약물 용량 오류는 환자 안전에 치명적인 영향을 미칠 수 있는 고위험 위험 요소임.
- 팀이 인간의 검토(Human Review) 수위를 줄이려고 할 때 시스템 안전성을 보장하기 위한 조치를 찾아야 함.

**A번이 정답인 이유:**

의료 도메인에서 '약물 용량' 오추출은 환자의 건강 및 생명에 직접적인 위해를 가할 수 있는 치명적 오류(Critical Risk)입니다. 특정 중요 필드가 81%라는 낮고 위험한 정확도를 보이는 이상, 문제를 일으키는 하위 원인을 별도로 조사하고 모델/프롬프트를 개선하여 안전 기준에 도달할 때까지는 전체 시스템의 검토 단계를 성급히 줄이지 않고 현재의 검토 수준을 유지하는 것이 가장 안전하고 올바른 조치입니다.

**오답 분석:**
- Option B (오답): 97% 이상의 높은 정확도를 보이는 다른 모든 수기 필드까지 묶어서 '수기 처방전 전체'를 불확실한 것으로 처리하고 검토를 거두지 못하는 것은 문제를 세밀하게 다루지 못하며, 취약 필드('약물 용량')를 근본적으로 개선하지 않은 채 타 분야의 라벨링 자동화 기회를 방해하는 비효율을 낳습니다.
- Option C (오답): 81%의 낮은 정확도를 보이는 위험 필드에서 오히려 인간의 검토를 제거한다는 설명은 의료 안전 관점에서 심각한 결함입니다.
- Option D (오답): 전체 평균 96%라는 수치가 평균의 함정(Simpson's paradox)을 유발하고 있음에도 불구하고 일률적으로 검토를 줄이는 것은 고위험 의료 오류를 방치하는 위험한 접근입니다.

---


### 54번 문제

**1. 문제 원문**

A bank's monitoring system flags a conversation as having very negative sentiment because the customer used sharp language while asking the agent to reset their online banking password, a routine, fully self-service-eligible request. Should the agent escalate based on the sentiment flag?

A) No, but only because password resets are always exempt from any sentiment-based escalation rules

B) No, sentiment alone is not a reliable indicator of complexity, and the password reset is within the agent's capability

C) Yes, negative sentiment scores reliably indicate that a case is too complex for the agent to resolve

D) Yes, the negative sentiment flag should always trigger escalation regardless of the actual underlying issue difficulty

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

B번: No, sentiment alone is not a reliable indicator of complexity, and the password reset is within the agent's capability

**정답 및 해설:**

**핵심 개념:** 

고객 지원 AI 시스템 설계 시 **감정 분석 플래그(Sentiment Flag)와 문제 복잡도(Task Complexity)의 분리** 원칙입니다. 고객의 어조(Tone)나 감정이 부정적이라는 사실 단독으로는 작업의 실제 복잡성이나 해결 불가능 여부를 대변하지 못하므로, 에이전트의 수행 능력 범위 내에 있는 일상적 작업(Routine Task)이라면 감정 플래그만으로 사람에게 무조건 이관(Escalation)해서는 안 됩니다.

**문제 상황 분석:**

- 고객이 온라인 뱅킹 비밀번호 재설정을 요청하면서 날카로운 어조(Sharp language)를 사용함.
- 모니터링 시스템이 해당 대화를 '매우 부정적 감정(Very negative sentiment)'으로 자동 감지함.
- 비밀번호 재설정은 완전히 셀프서비스가 가능하고 에이전트가 쉽게 수행할 수 있는 단순 일상 업무(Routine Request)임.
- 감정 플래그만으로 이 요청을 상급자/사람 상담원에게 이관해야 하는지 여부를 묻고 있음.

**B번이 정답인 이유:**

고객의 감정 어조(Sentiment)는 단순한 감정 상태나 이전 경험에 의한 불만일 뿐, 현재 요청된 작업의 기술적 복잡성(Complexity)이나 AI 에이전트의 해결 불가능성을 의미하는 절대적인 지표가 아닙니다. 비밀번호 재설정과 같이 에이전트의 자율 처리 능력(Capability) 범주에 명확히 들어맞는 단순 업무라면, 단지 텍스트 어조가 부정적이라는 이유만으로 사람에게 이관할 이유가 없으므로 B번이 올바른 설명입니다.

**오답 분석:**
- Option A (오답): 비밀번호 재설정이라는 특정 작업이 '모든 감정 기반 이관 규칙에서 절대적으로 면제된다'는 범주적 예외 규정은 존재하지 않으므로 논리적 근거가 틀렸습니다.
- Option C (오답): 부정적 감정 점수가 '해당 케이스가 AI가 해결하기에 너무 복잡하다는 점을 신뢰도 있게 나타낸다'는 주장은 사실이 아닙니다.
- Option D (오답): 실제 문제 난이도와 관계없이 부정적 감정 플래그가 뜨면 무조건 이관해야 한다는 규칙은 AI 지원 시스템의 자동화 효율을 떨어뜨리고 비효율을 유발합니다.

---


## 61번 문제

**1. 문제 원문**

A team building a resume-parsing pipeline wants Claude to output a confidence score for each extracted field so reviewers can prioritize their limited time. During prompt design, which approach best supports later calibration of these scores against a labeled validation set?

A) Instruct the model to output a textual explanation of its reasoning for each field instead of a numeric score, since qualitative reasoning is easier for reviewers to act on.

B) Instruct the model to output a single overall document-level confidence score that summarizes its certainty about the entire resume at once.

C) Instruct the model to output a confidence score only for fields it judges to be difficult to extract, omitting scores for fields it judges to be straightforward.

D) Instruct the model to output a per-field confidence score alongside each extracted value, using a consistent numeric scale across all fields and documents.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

D번: Instruct the model to output a per-field confidence score alongside each extracted value, using a consistent numeric scale across all fields and documents.

**정답 및 해설:**

**핵심 개념:** 

LLM 기반 데이터 추출 파이프라인에서 신뢰도 점수(Confidence Score)를 검증 데이터셋(Validation Set)과 비교하여 정량적으로 통계/캘리브레이션(Calibration)하려면, 일관된 수치 척도(Consistent Numeric Scale)와 모든 필드에 대한 수치화된 데이터 출력이 필수적입니다. 일관된 정량적 스케일이 보장되어야 임계값(Threshold)을 설정하거나 점수 보정 통계 모델을 적용할 수 있습니다.

**문제 상황 분석:**

- 이력서 파싱 시스템에서 검토자의 시간 절약을 위해 필드별 신뢰도 점수를 출력하고자 합니다.
- 프롬프트 설계 단계에서, 향후 라벨링된 검증 데이터셋(Labeled Validation Set)과 비교하여 신뢰도 점수를 캘리브레이션(보정)할 수 있는 최선의 방식을 찾아야 합니다.

**D번이 정답인 이유:**

모든 필드와 문서에 걸쳐 일관된 수치 스케일(예: 0.0~1.0 또는 1~10)을 사용하여 추출값과 신뢰도 점수를 1:1로 함께 출력하도록 프롬프트를 구성하면, 검증 데이터셋의 정답 유무와 신뢰도 점수 간의 수치적 상관관계를 정밀하게 분석 및 보정(Calibration)할 수 있습니다.

**오답 분석:**
- Option A (오답): 텍스트 설명(Textual Explanation)은 서술형 데이터이므로 검증 세트와 비교하여 정량적/통계적으로 점수를 보정(Calibration)하거나 자동화된 임계값 판정을 내리기 어렵습니다.
- Option B (오답): 문서 전체 단위의 단일 점수(Document-level Score)는 개별 필드 수준의 정확도를 반영하지 못하므로, 검토자가 어떤 특정 필드를 우선 검토해야 할지 판단하는 목표를 달성할 수 없습니다.
- Option C (오답): 명확하다고 판단되는 필드의 점수를 생략하면 데이터셋이 불완전해져 통계적 평가 및 일관된 캘리브레이션 체계를 구축할 수 없습니다.

---


## 64번 문제

**1. 문제 원문**

A financial-data subagent queries a market feed for a ticker's after-hours trades. The feed's cache is stale beyond its allowed threshold, so the subagent's read fails an internal freshness check and aborts. A different subagent queries a competitor's after-hours trades and legitimately finds no trades occurred that session. How should the coordinator distinguish these two 'no data' situations?

A) Report the stale-cache abort as a valid empty result, and the no-trades session as a failure needing retry

B) Escalate both as unrecoverable errors that halt processing for both tickers until a human resolves them

C) Report both as plain empty results, since neither subagent has any usable after-hours trade data for the coordinator to review

D) Report the stale-cache abort as an access failure eligible for retry, and the no-trades result as a final empty result

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

D번: Report the stale-cache abort as an access failure eligible for retry, and the no-trades result as a final empty result

**정답 및 해설:**

**핵심 개념:** 

멀티 에이전트 시스템(Multi-Agent System)의 오류 처리 및 데이터 검증 구조에서는 '시스템/데이터 접근 오류(Access/Infrastructure Failure)'와 '정상적으로 데이터가 존재하지 않는 결과(Legitimate Empty Result)'를 명확히 구별해야 합니다. 캐시 만료나 네트워크 실패 등은 시스템 차원의 일시적 오류이므로 재시도 대상(Retryable Failure)으로 분류하고, 데이터가 실제로 존재하지 않는 것은 정상적인 작업 완료 상태인 빈 결과(Final Empty Result)로 명확히 분리하여 처리합니다.

**문제 상황 분석:**

- 첫 번째 서브에이전트는 캐시 만료(Stale Cache) 및 신선도 검사 실패로 인해 조회가 중단되었습니다. 이는 데이터 수집 프로세스의 실패(시스템 오류)입니다.
- 두 번째 서브에이전트는 실제 해당 세션에 거래 내역이 없어 0건의 결과를 정상적으로 조회했습니다. 이는 유효한 비즈니스 결과(정상 빈 결과)입니다.
- 상위 코디네이터 에이전트는 겉보기엔 똑같이 '데이터가 없는' 상황이지만, 두 오류의 성격(재시도 가능 여부)을 명확히 구분하여 처리해야 합니다.

**D번이 정답인 이유:**

캐시 신선도 실패는 캐시 갱신이나 백엔드 재요청을 통해 복구될 가능성이 있는 접근/시스템 실패(Access failure eligible for retry)이므로 재시도를 수행해야 합니다. 반면 거래 미발생은 실제 시장 현황을 반영한 확정적인 빈 결과(Final empty result)이므로 작업을 성공적으로 종료하고 결과를 코디네이터에 보고해야 합니다. 이 둘을 명확히 구분하여 전달하는 것이 회복탄력성 있는 오케스트레이션 설계입니다.

**오답 분석:**
- Option A (오답): 시스템 오류(캐시 만료)를 정당한 빈 결과로 잘못 처리하고, 정상적인 조회 결과(거래 없음)를 실패로 보고하여 재시도하도록 뒤바꿔 설명했으므로 틀렸습니다.
- Option B (오답): 캐시 만료는 단순 일시적 캐시/네트워크 관련 문제로 재시도 가능성이 높으며, 사람이 개입할 때까지 전체 작업을 중단할 만큼 복구 불가능한 치명적 에러가 아닙니다.
- Option C (오답): 시스템 실패와 정당한 빈 결과를 모두 '단순 빈 결과'로 뭉뚱그리면 실제 원본 데이터가 존재함에도 캐시 오류 때문에 데이터를 유실하는 심각한 논리적 오류가 발생합니다.

---


## 66번 문제

**1. 문제 원문**

A team is stratifying its ongoing sampling of high-confidence extractions across five document types that appear in very different volumes: one type makes up 70% of daily volume, and the other four each make up roughly 7.5%. If the team samples strictly in proportion to volume, what risk does this introduce, and how should the sampling plan address it?

A) Pure volume-proportional sampling has no drawback here, since sampling proportional to volume always produces the statistically optimal allocation for detecting errors in every segment.

B) Pure volume-proportional sampling would under-sample the four low-volume document types, so the plan should also ensure a minimum sample size per document type regardless of its share of volume.

C) Pure volume-proportional sampling would over-sample the high-volume document type unnecessarily, so the team should exclude it from sampling entirely and focus only on the four smaller types.

D) Pure volume-proportional sampling is only a concern if the four low-volume document types are processed by a different prompt template than the high-volume type.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

B번: Pure volume-proportional sampling would under-sample the four low-volume document types, so the plan should also ensure a minimum sample size per document type regardless of its share of volume.

**정답 및 해설:**

**핵심 개념:** 

LLM 기반 데이터 추출 및 품질 평가 파이프라인에서 계층별 모니터링을 수행할 때, 발생 빈도가 낮은 세그먼트(Low-volume segments)는 순수 볼륨 비례 샘플링(Volume-proportional sampling) 적용 시 추출되는 샘플 수가 극히 적어져 통계적으로 유의미한 오류율 평가나 모니터링이 불가능해집니다. 따라서 볼륨 비율에 맞추어 샘플링하더라도, 각 카테고리/문서 유형별로 최소 샘플 수(Minimum Sample Size Floor)를 강제하는 층화 무작위 추출(Stratified Sampling with Minimum Floor) 설계를 적용해야 합니다.

**문제 상황 분석:**

- 5개 문서 유형 중 1개 유형이 전체 일일 데이터의 70%를 차지하는 쏠림 현상이 존재합니다.
- 나머지 4개 유형은 각각 7.5%로 수량이 매우 적습니다.
- 순수 비례 방식으로만 샘플을 뽑을 경우, 소량 발생 문서 유형은 샘플 수가 턱없이 부족하여 추출 오류나 성능 저하를 감지하기 어려워집니다.

**B번이 정답인 이유:**

단순 볼륨 비례 방식을 적용하면 수량이 적은 4가지 문서 유형의 샘플 수가 부족해지는 과소 샘플링(Under-sampling) 문제가 발생합니다. 전체적인 비율을 반영하더라도, 각 문서 유형마다 통계적 신뢰도를 담보할 수 있는 최소 샘플 수(Minimum sample size per document type)를 하한선으로 설정하여 추출하도록 샘플링 플랜을 설계하는 것이 표준적인 품질 보증 방식입니다.

**오답 분석:**
- Option A (오답): 순수 비례 샘플링은 소량 세그먼트의 오류 감지력을 떨어뜨리므로 아무런 단점이 없다는 설명은 통계적으로 틀렸습니다.
- Option C (오답): 70%를 차지하는 대량 발생 문서 유형에서 발생하는 오류가 전체 시스템 품질에 미치는 영향이 가장 크므로, 이를 샘플링 대상에서 완전히 제외하는 것은 잘못된 접근입니다.
- Option D (오답): 프롬프트 템플릿의 동일 여부와 상관없이, 문서 포맷이나 데이터 분포 차이에 의해 에러가 발생할 수 있으므로 소량 발생 세그먼트의 과소 샘플링 문제는 프롬프트와 무관하게 항상 고려해야 합니다.

---


## 67번 문제

**1. 문제 원문**

A team is redesigning a multi-day customer-support assistant that currently relies only on rolling summarization of the transcript and unfiltered tool outputs, and has been losing exact figures, mixing up simultaneous issues, and missing details from lengthy middle sections of aggregated reports. Which combination of changes would most directly address all of these failure modes together?

A) Switch to the model with the largest context window and stop summarizing at all, while keeping the current tool-output and aggregation structure unchanged

B) Maintain a case-facts block, keep separate records per active issue, trim tool outputs to relevant fields, and lead aggregated input with headed key findings

C) Summarize the transcript more frequently, keep all raw tool output for completeness, and add a closing reminder to double-check earlier sections

D) Ask customers to restate key details periodically, forward full subagent reasoning chains unchanged, and rely on default handling of long documents

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

B번: Maintain a case-facts block, keep separate records per active issue, trim tool outputs to relevant fields, and lead aggregated input with headed key findings

**정답 및 해설:**

**핵심 개념:** 

복잡하고 장기적인 대화 및 멀티 에이전트 시스템에서 발생하는 컨텍스트 손실(Loss of precision), 엔티티/이슈 혼동(Entity confusion), 그리고 긴 컨텍스트의 중간 부분 정보 유실 현상(Lost in the Middle)을 해결하려면 체계적인 컨텍스트 엔지니어링 기법들이 복합적으로 적용되어야 합니다. 구조화된 팩트 블록 유지, 개체별 상태 분리, 도구 출력의 불필요한 필드 제거(Trimming), 중요 정보의 프롬프트 상단 배치(Front-loading with headers)가 이에 해당합니다.

**문제 상황 분석:**

1. **정확한 수치 유실 (Losing exact figures):** 순환 요약(Rolling summarization) 시 숫자가 압축되거나 왜곡되는 문제.
2. **동시 이슈 혼동 (Mixing up simultaneous issues):** 여러 이슈가 하나의 서술형 텍스트에 섞여 상태 추적이 모호해지는 문제.
3. **긴 보고서 중간 정보 유실 (Missing details from middle sections):** LLM이 프롬프트의 중간 부분에 위치한 정보를 잘 인지하지 못하는 'Lost in the Middle' 문제 및 불필요한 도구 출력으로 인한 컨텍스트 오염 문제.

**B번이 정답인 이유:**

- **Maintain a case-facts block:** 요약 시 수치가 왜곡되지 않도록 변하지 않는 핵심 팩트(수치, ID 등)를 별도의 구조화된 블록으로 고정 관리하여 '수치 유실'을 방지합니다.
- **Keep separate records per active issue:** 이슈별 레코드를 분리 추적하여 '동시 이슈 혼동'을 방지합니다.
- **Trim tool outputs to relevant fields:** 도구 출력에서 불필요한 노이즈를 제거하여 컨텍스트 낭비 및 오염을 줄입니다.
- **Lead aggregated input with headed key findings:** 중요한 요약/결과를 명확한 헤더와 함께 프롬프트의 앞부분(Leading position)에 배치하여 '중간 섹션 정보 유실(Lost in the Middle)' 현상을 극복합니다.

이 조합은 문제에서 제시된 3가지 실패 모드(Failure Modes)를 1:1로 정확히 맞춤 해결합니다.

**오답 분석:**
- Option A (오답): 컨텍스트 창만 늘리고 구조 개선 없이 요약을 중단하면 컨텍스트 오염과 노이즈가 폭증하여 'Lost in the Middle' 현상이 더욱 심화됩니다.
- Option C (오답): 요약을 더 자주 하고 날것의 도구 출력을 모두 유지하는 것은 컨텍스트 오염을 가속화하며, 끝부분에 다시 확인하라는 문구만 추가하는 것으로는 수치 유실이나 이슈 혼동을 해결할 수 없습니다.
- Option D (오답): 사용자에게 데이터를 다시 입력하라고 요구하는 것은 매우 나쁜 UX이며, 가공되지 않은 추론 사슬 전체를 그대로 전달하는 것은 컨텍스트 낭비와 노이즈를 초래합니다.

---


# 72번 문제

**1. 문제 원문**

A travel-booking assistant developer wants to cut latency by sending only the user's latest message plus a one-sentence rolling summary on each API call, rather than the full prior turns. Ten turns into a session, the customer says "book the same seat type I mentioned earlier," but the assistant no longer has access to that detail because it was dropped from the rolling summary. What is the underlying issue?

A) The API treats each request as stateless, so any turn left out of the message history sent with it is unavailable to the model

B) The model's built-in conversational memory should have retained the seat preference across calls without it being resent

C) The customer should have repeated the seat preference on every subsequent turn to guarantee it stays available

D) The rolling summary approach fails only because it was one sentence long; a two- or three-sentence summary would retain the seat type

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

A번: The API treats each request as stateless, so any turn left out of the message history sent with it is unavailable to the model

**정답 및 해설:**

**핵심 개념:** 

LLM API(Claude API 등)는 근본적으로 상태를 저장하지 않는 무상태(Stateless) 프로토콜입니다. 모델은 서버 측에 이전 대화 맥락을 저장하지 않으므로, 개발자가 요청(Request)을 보낼 때 `messages` 배열에 포함하여 함께 전달한 정보에만 접근할 수 있습니다.

**문제 상황 분석:**

- 개발자가 API 호출 지연 시간(Latency) 및 토큰 비용을 줄이기 위해 이전 대화 기록 전체 대신 최신 메시지와 한 문장 요약본만 전달하는 방식을 채택했습니다.
- 대화 진행 중 고객이 이전에 언급했던 좌석 등급을 참조("아까 말한 동일한 좌석 등급")했지만, 순환 요약(Rolling Summary) 과정에서 해당 세부 정보가 압축되어 누락되었습니다.
- 모델이 과거 대화 내용을 기억하지 못해 응답할 수 없는 문제가 발생했습니다.

**A번이 정답인 이유:**

대형 언어 모델 API는 요청 간 대화 상태를 유지하지 않는 Stateless 특성을 가집니다. 따라서 클라이언트가 API를 호출할 때 메시지 히스토리(`messages` 파라미터)에서 생략하거나 누락시킨 모든 정보는 모델 관점에서 존재하지 않는 정보가 됩니다. 정보 손실이 발생하는 순환 요약 전략을 사용하면서 무상태 API에 필요한 맥락을 충분히 제공하지 못한 것이 이 문제의 근본 원인입니다.

**오답 분석:**
- Option B (오답): LLM API에는 호출 간 자동으로 대화 맥락을 기억해 주는 내장 메모리(Built-in conversational memory)가 존재하지 않으며, 전적으로 무상태(Stateless)로 동작합니다.
- Option C (오답): 사용자에게 매 번화마다 선호도를 반복하라고 요구하는 것은 올바른 대화형 UX 및 시스템 설계 모범 사례가 아닙니다. 시스템(애플리케이션) 차원에서 맥락을 관리해야 합니다.
- Option D (오답): 문장 수를 2~3문장으로 늘리는 것은 일시적인 완화책이 될 수 있지만, 요약(Summarization) 기법 자체가 가진 비정형 정보의 손실 위험을 근본적으로 해결하지 못하며, API의 무상태성이라는 근본 원인을 설명하지 못합니다.

---


# 76번 문제

**1. 문제 원문**

A legal-document review pipeline processes contracts where, in some cases, two clauses on different pages state contradictory terms for the same provision (for example, differing renewal notice periods). The model extracts a single value for the field without flagging the contradiction. What review-routing behavior should the team implement for this scenario?

A) Have the model detect when source values conflict across the document and route those specific extractions to human review, even if its confidence in the single value it chose is high.

B) Average the two conflicting values from the document to produce a single extracted number that falls between them, then route that averaged value through normal processing.

C) Extract only the value from whichever page appears first in the document, since earlier clauses are conventionally assumed to take precedence in contract structure.

D) Trust the model's single extracted value whenever its reported confidence score is above the routing threshold, since the score already accounts for any conflicting source text.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

A번: Have the model detect when source values conflict across the document and route those specific extractions to human review, even if its confidence in the single value it chose is high.

**정답 및 해설:**

**핵심 개념:** 

HITL(Human-in-the-Loop) 및 위험 기반 검토 라우팅(Risk-based Review Routing) 시스템 설계에 관한 문제입니다. 문서 내부의 모순(In-document Contradiction)은 모델이 높은 신뢰도를 보이더라도 법적 위험성이 매우 크므로, 모순 감지 시 자동으로 담당자(Human Reviewer)에게 이관(Escalation)하도록 파이프라인을 구축해야 합니다.

**문제 상황 분석:**

- 계약서 검토 파이프라인에서 동일한 항목(예: 갱신 통지 기간)에 대해 서로 다른 페이지에 상충하는 조항이 존재하는 케이스가 발생하고 있습니다.
- 모델은 내부 모순을 경고(Flagging)하지 않고 단 하나의 값만 자의적으로 추출하여 통과시키고 있습니다.
- 이러한 모순 및 모호성으로 인한 법적 리스크를 방지하기 위해 어떤 검토 라우팅 규칙을 적용해야 하는지 묻고 있습니다.

**A번이 정답인 이유:**

문서 내 정보 간에 모순(Conflict)이 발생하는 상황은 고위험 비즈니스/법률 파이프라인에서 전형적인 HITL(Human-in-the-Loop) 적용 대상입니다. 모델이 임의로 하나의 값을 선택하여 높은 신뢰도 점수를 부여하더라도, 원본 데이터 상의 충돌 조건 자체를 감지(Conflict Detection)하고 이를 사람이 직접 확인 및 판단하도록 이관(Route to human review)하는 것이 시스템 안정성과 위험 관리 측면에서 가장 올바른 모범 사례입니다.

**오답 분석:**
- Option B (오답): 서로 다른 법적 기간(예: 30일 vs 60일)을 단순 수학적 평균(45일)을 내어 처리하는 것은 계약서의 실제 의도를 완전히 왜곡하는 심각한 오류입니다.
- Option C (오답): 앞쪽 페이지의 조항이 무조건 우선권을 가진다고 단정할 수 없으며(특약 사항이나 후순위 조항이 앞서는 경우도 있음), 모순을 임의로 무시해서는 안 됩니다.
- Option D (오답): 모델의 신뢰도 점수(Confidence Score)는 입력 문서 내부의 모순 관계나 법적 환각을 완벽히 보장해주지 못하므로, 높은 점수만 믿고 충돌을 방치하면 안 됩니다.

---


# 79번 문제

**1. 문제 원문**

A synthesis agent combines a subagent finding that unemployment in a region is '5.1%' with another subagent finding that it is '6.3%'. The coordinator initially treats this as a contradiction requiring reconciliation, but on closer inspection the two figures come from reports published fourteen months apart. What structural change to subagent output would prevent this kind of false contradiction going forward?

A) Require every subagent to phrase all extracted figures as approximate ranges rather than exact percentages

B) Require every subagent to include the publication or data-collection date alongside each figure it extracts

C) Require every subagent to discard any figure that is more than six months old before passing it to the coordinator

D) Require every subagent to convert all statistics into a rolling twelve-month average before reporting them

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

B번: Require every subagent to include the publication or data-collection date alongside each figure it extracts

**정답 및 해설:**

**핵심 개념:** 

멀티 에이전트 오케스트레이션(Multi-Agent Orchestration) 아키텍처에서 서브에이전트 간 수집된 데이터의 모순을 정확히 판별하려면, 메타데이터(발행일, 데이터 수집 시점 등)를 데이터와 함께 구조화하여 전달하는 데이터 계약(Data Contract) 설계가 필수적입니다. 시간 흐름에 따른 단순 수치 변화를 실제 정보 충돌(Contradiction)로 오인하는 허위 모순(False Contradiction) 문제는 메타데이터 파싱을 통해 방지할 수 있습니다.

**문제 상황 분석:**

- 한 서브에이전트는 실업률 5.1%, 다른 서브에이전트는 6.3%라는 결과를 코디네이터/종합 에이전트에 제출했습니다.
- 코디네이터는 두 수치를 서로 충돌하는 정보(Contradiction)로 판단했으나, 검토 결과 14개월의 시차가 있는 서로 다른 시점의 보고서에서 추출된 데이터였습니다.
- 동일한 지표라도 시점에 따라 값이 달라질 수 있는데, 출력에 시점 정보가 빠져 있어 잘못된 모순으로 감지되는 문제를 방지할 방안을 찾아야 합니다.

**B번이 정답인 이유:**

서브에이전트의 출력 구조(Output Schema)에 추출 수치와 함께 **발행일 또는 데이터 수집 날짜(Publication or data-collection date)**를 메타데이터 항목으로 반드시 포함하도록 강제하면, 코디네이터 에이전트는 두 수치가 서로 다른 시점의 데이터임을 즉시 파악할 수 있습니다. 이를 통해 서로 다른 시점의 데이터 변화를 정보 모순으로 잘못 판단하는 오류를 근본적으로 방지할 수 있습니다.

**오답 분석:**
- Option A (오답): 정확한 수치 대신 범위를 사용하는 것은 시점 차이로 인한 수치 변화 문제를 해결하지 못하며, 데이터의 정밀도를 손상시킵니다.
- Option C (오답): 6개월 이전 데이터를 무조건 폐기하는 것은 과거 트렌드 분석이나 시계열 비교 분석 자체를 불가능하게 만드는 오버엔지니어링(Over-engineering)입니다.
- Option D (오답): 서브에이전트가 통계 데이터를 임의로 이동 평균으로 변환하면 원본 데이터의 정확한 시점별 값이 손실되며 환각(Hallucination) 및 데이터 왜곡을 유발할 수 있습니다.

---


# 86번 문제

**1. 문제 원문**

A tax-form processing team wants to determine whether it's safe to reduce human review specifically for the 'filing status' field, which currently sits at 99.2% aggregate accuracy. Before making that decision, what additional analysis should the team perform to ensure this specific reduction is safe?

A) Break down the filing-status field's accuracy further by document type and by any known edge-case conditions (such as amended returns or joint filings with differing last names) to confirm no sub-segment falls well below the aggregate.

B) Survey reviewers about their confidence in reviewing the filing-status field across different document types and edge cases (such as amended returns or joint filings), and reduce review only if a majority report low concern about that field.

C) Confirm that the filing-status field has the lowest average character length of any field on the form, by inspecting a sample of completed forms, since shorter fields are generally understood to be easier for models to extract correctly.

D) Compare the filing-status field's 99.2% aggregate accuracy against the average accuracy of all other fields on the form, such as by computing the overall mean accuracy, and reduce review if it falls above the median of all other fields.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

A번: Break down the filing-status field's accuracy further by document type and by any known edge-case conditions (such as amended returns or joint filings with differing last names) to confirm no sub-segment falls well below the aggregate.

**정답 및 해설:**

**핵심 개념:** 

AI 및 자동화 시스템의 성능 평가 시 심프슨의 역설(Simpson's Paradox)이나 평균의 착시(Aggregate Fallacy)를 경계해야 합니다. 전체 종합 정확도(Aggregate Accuracy)가 매우 높더라도, 특정 하위 그룹(Sub-segment)이나 엣지 케이스(Edge Cases)에서는 치명적으로 낮은 정확도를 보일 수 있으므로 사람의 검토(Human Review)를 줄이기 전 슬라이스 분석(Sliced Analysis) 및 엣지 케이스 세분화 검증이 필수적입니다.

**문제 상황 분석:**

- 세무 양식 처리 팀이 '신고 상태' 필드의 높은 종합 정확도(99.2%)를 근거로 사람의 검토 비중을 줄이려(Automation / HITL Reduction) 합니다.
- 전체 데이터의 평균 수치만 믿고 검토를 즉각 축소할 경우, 복잡한 예외 문서(수정 신고, 성이 다른 부부의 공동 신고 등)에서 대량의 추출 오류가 방치될 위험이 있습니다.
- 안전한 검토 축소 결정을 내리기 위해 선행되어야 하는 기술적 검증 분석 방법을 선택해야 합니다.

**A번이 정답인 이유:**

99.2%라는 높은 종합 정확도는 흔하고 단순한 표준 문서 케이스가 대부분을 차지하여 만들어진 왜곡일 수 있습니다. 따라서 문서 유형별, 그리고 특정 조건(수정 신고, 다른 성씨의 공동 신고 등)의 엣지 케이스별로 정확도를 하위 세그먼트(Sub-segment) 단위로 세분화(Break down)하여 분석해야 합니다. 특정 하위 구간의 정확도가 종합 평균보다 크게 떨어지는 '숨겨진 취약점'이 없는지 검증하는 것이 시스템 안정성을 담보하는 올바른 평가 방법입니다.

**오답 분석:**
- Option B (오답): 인간 검토자의 주관적인 느낌이나 신뢰도 설문조사(Survey)는 정량적이고 객관적인 AI 추출 성능 평가 기준이 될 수 없습니다.
- Option C (오답): 텍스트의 길이가 짧다고 해서 LLM/OCR 모델의 추출정확도 및 법적 맥락 이해도가 무조건 높아지는 것은 아니며, 단답형 필드라도 맥락적 판단이 필요한 엣지 케이스가 다수 존재합니다.
- Option D (오답): 다른 필드들의 평균값/중앙값과 단순 비교하는 것은 '신고 상태' 필드 내에 존재하는 특정 하위 세그먼트의 오류 위험(예: 수정 신고 시의 오류)을 전혀 걸러내지 못합니다.

---


## 96번 문제

**1. 문제 원문**

A retail customer asks a support agent to match a lower price they found on a competitor's website. The store's documented policy only describes price adjustments when the store's own website lowers a price within 14 days of purchase; it does not mention competitor pricing at all. How should the agent proceed?

A) Ask the customer to submit the competitor's listing as proof before independently approving the match

B) Approve the competitor price match by analogy to the store's own-site adjustment provision instead

C) Escalate the request, since the documented policy is silent on competitor price matching entirely

D) Decline the request, since the policy's own-site provision implies competitor price matches are not permitted

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

C번: Escalate the request, since the documented policy is silent on competitor price matching entirely

**정답 및 해설:**

**핵심 개념:** 

AI 에이전트의 정책 준수(Policy Compliance) 및 예외 상황에서의 에스컬레이션(Human Escalation / Policy Ambiguity Resolution). AI 에이전트는 문서화된 지침(Documented Policy)에 명시되지 않은 불확실하거나 정의되지 않은 예외 케이스에 대해 임의로 해석하거나 거절/승인하지 않고, 상위 권한자(Human Manager / Escalation Path)에게 결정을 이관해야 합니다.

**문제 상황 분석:**

- 고객이 경쟁사 웹사이트에서 더 저렴한 가격을 보고 동일 가격 매칭(Price Match)을 요구함.
- 매장의 공식 지침 문서에는 "자사 웹사이트에서 14일 이내 가격 인하 시 조정 가능"만 명시되어 있고, 경쟁사 가격 매칭에 대해서는 완전히 언급이 없음(Silent).
- 명확한 지침이 누락된 모호한 상황에서 에이전트가 취해야 할 올바른 조치를 결정해야 함.

**C번이 정답인 이유:**

지침 문서에 명시되지 않은 시나리오(Policy Silence / Edge Cases)에 직면했을 때, AI 시스템이 자체적으로 유연하게 자사 규정을 확장해 적용(Analogy)하거나, 지침이 없다는 이유로 임의로 거부/승인하는 판단을 내리는 것은 자율성 및 규정 관리 측면에서 위험합니다. 규정이 다루지 않는 공백 상황에서는 상위 관리자나 담당자에게 사건을 이관(Escalate)하여 올바른 판단을 받도록 처리하는 것이 최선의 운영 표준입니다.

**오답 분석:**
- Option A (오답): 지침에 언급조차 없는 사항을 에이전트가 독자적으로 판단하여 증거를 제출받고 승인하는 것은 권한을 넘어서는 독단적 행동입니다.
- Option B (오답): 자사 웹사이트 가격 조정 조항을 비유적으로 확장(Analogy) 해석하여 임의로 승인하는 것은 환각이나 오판을 초래할 수 있습니다.
- Option D (오답): 명시되어 있지 않은 사항을 자의적으로 "금지된 것으로 간주(Implies not permitted)"하여 거절하는 것 역시 규정에 없는 자의적 해석에 해당합니다.

---


## 97번 문제

**1. 문제 원문**

A log-analysis subagent's query to a metrics store fails once with a transient 503, then succeeds on an internal retry a second later. A separate subagent's query to the same store fails repeatedly for two minutes because the store's credentials were rotated and never propagated to the subagent's environment. How should each situation be handled?

A) Resolve the transient 503 locally without the coordinator, but escalate the credential failure with what was attempted

B) Escalate the transient 503 to the coordinator but retry the credential failure locally until the rotation eventually completes

C) Retry both failures locally and indefinitely by the subagent until one of them eventually succeeds on its own

D) Escalate both failures to the coordinator immediately, since subagents should never attempt any local retries at all

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

A번: Resolve the transient 503 locally without the coordinator, but escalate the credential failure with what was attempted

**정답 및 해설:**

**핵심 개념:** 

분산 멀티 에이전트 아키텍처의 오류 처리 및 에스컬레이션 전략(Error Handling & Escalation Pattern). 일시적인 일시적 실패(Transient Errors, 예: 503 Service Unavailable)는 하위 에이전트 수준에서 로컬 재시도(Local Retry)로 스스로 해결하고, 자격 증명 누락/만료와 같은 지속적·치명적 실패(Non-transient / Systematic Failures)는 시도 내역 정보와 함께 상위 조율자(Coordinator/Orchestrator)에게 이관(Escalate)해야 합니다.

**문제 상황 분석:**

- **상황 1:** 503 일시적 오류 발생 후 1초 뒤 하위 에이전트 내부 재시도로 정상 성공함.
- **상황 2:** 인증 정보(Credentials) 로테이션 미반영으로 인해 2분간 지속적으로 오류가 발생함.
- 두 서로 다른 유형의 오류에 대한 하위 에이전트와 코디네이터 간의 책임 분담 방식을 결정해야 함.

**A번이 정답인 이유:**

네트워크 순간 정체 등으로 발생하는 일시적(Transient) 오류는 상위 코디네이터에게 보고하지 않고 하위 에이전트가 자체 재시도(Local Retry)로 신속히 해결하는 것이 시스템 오버헤드를 줄이는 올바른 방식입니다. 반면, 인증 자격 증명 미전파처럼 하위 에이전트가 스스로 해결할 수 없고 지속되는 문제(Unresolvable/Systematic Failure)는 기존에 무엇을 시도했는지에 대한 맥락(What was attempted)을 첨부하여 상위 코디네이터에게 이관(Escalate)함으로써 시스템 차원의 조치가 이루어지도록 해야 합니다.

**오답 분석:**
- Option B (오답): 일시적인 503 에러는 코디네이터에 이관할 필요가 없으며, 자격 증명 오류는 환경 설정 문제이므로 로컬에서 무한 재시도한다고 해결되지 않습니다.
- Option C (오답): 오류 원인과 관계없이 무기한(Indefinitely) 로컬 재시도를 수행하는 것은 시스템 자원을 낭비하고 데드락이나 Infinite Loop를 유발합니다.
- Option D (오답): 하위 에이전트가 일시적 오류에 대한 로컬 재시도를 전혀 하지 못하게 막고 무조건 즉시 이관하도록 만들면 코디네이터에 과도한 병목 현상이 발생합니다.

---


## 99번 문제

**1. 문제 원문**

A utility company customer needs a multi-step billing correction involving a meter re-read, a prorated credit, and a plan adjustment. Every step is explicitly detailed in the documented billing policy, and the agent has tools to execute each step. Should the agent escalate this case simply because it involves several steps?

A) Yes, any case requiring more than one corrective action should be escalated regardless of policy coverage

B) No, but only because billing corrections are categorically exempt from any complexity-based escalation rule entirely

C) No, the case should be resolved directly; step count alone is not an escalation trigger when policy fully covers it

D) Yes, multi-step cases are inherently too complex for an agent to execute reliably without human oversight

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

C번: No, the case should be resolved directly; step count alone is not an escalation trigger when policy fully covers it

**정답 및 해설:**

**핵심 개념:** 

AI 에이전트의 에스컬레이션 기준(Human Escalation Triggers & Policy Coverage). AI 에이전트가 처리할 수 있는 도구(Tool)가 구비되어 있고, 명확히 정의된 문서화 정책(Documented Policy) 내에 모든 절차가 포함되어 있다면 작업 단계의 수(Step Count)가 많다는 이유만으로 사람에게 이관(Escalate)해서는 안 되며 자율적으로 직접 처리해야 합니다.

**문제 상황 분석:**

- 유틸리티 회사 고객이 계량기 재측정, 일할 크레딧 지급, 요금제 조정이라는 다단계 청구 정정을 요청함.
- 모든 단계가 문서화된 청구 정책에 명시적으로 안내되어 있으며, 에이전트가 각 단계를 실행할 적절한 도구를 갖추고 있음.
- 단순히 작업 단계가 여러 개라는 이유로 사람에게 이관해야 하는지 여부를 판단해야 함.

**C번이 정답인 이유:**

AI 에이전트 시스템 설계에서 사람으로의 이관(Escalate)이 발동되는 핵심 원인은 '정책의 모호함', '도구 및 권한의 부재', 또는 '지침에 규정되지 않은 예외 상황'입니다. 수행해야 할 단계의 수(Step Count)가 여러 개라는 사실 자체는 에스컬레이션 트리거가 될 수 없습니다. 정책이 과정을 명확히 규정하고 있고 에이전트에게 이를 실행할 도구가 모두 준비되어 있다면, 에이전트는 이관하지 않고 직접 건을 완결(Resolve directly)하는 것이 올바른 처리 원칙입니다.

**오답 분석:**
- Option A (오답): 정책에 명시되어 있고 실행 도구가 존재함에도 둘 이상의 조치가 필요하다고 무조건 이관하는 것은 에이전트 자동화의 목적을 저해합니다.
- Option B (오답): 청구 정정 업무 자체가 복잡성 이관 규칙에서 절대적으로 면제된다는 식의 절대적 범주화 논리는 잘못된 접근입니다.
- Option D (오답): 에이전트는 적절한 도구와 명확한 정책 지침이 제공된다면 다단계 작업도 신뢰성 있게 실행할 수 있으므로 사람의 감독이 필수적이라는 주장은 오답입니다.

---


## 100번 문제

**1. 문제 원문**

During calibration, a team finds that fields the model scores at 0.95 confidence are correct only 78% of the time, while fields scored at 0.6 confidence are correct 90% of the time. What does this pattern indicate, and what should the team do?

A) The model's confidence scores are miscalibrated and inversely related to actual correctness for these ranges, so the team should not use the raw scores directly to set a simple 'route below X' threshold without further investigation.

B) This pattern is expected behavior for well-calibrated models, since lower scores naturally correspond to higher observed accuracy on any validation set, and the team should therefore continue using the raw confidence scores as a routing threshold without any recalibration.

C) The validation set is too small to draw any conclusion about field-level confidence calibration, so the team should discard field-level confidence scoring entirely and rely only on document-type stratified sampling, redirecting all fields to human review.

D) The 0.6-confidence fields must belong to an easier field type, so the team should raise the routing threshold to 0.96, effectively routing all fields with scores below 0.96 to human review without adjusting the model's calibration.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

A번: The model's confidence scores are miscalibrated and inversely related to actual correctness for these ranges, so the team should not use the raw scores directly to set a simple 'route below X' threshold without further investigation.

**정답 및 해설:**

**핵심 개념:** 

모델 신뢰도 보정(Model Confidence Calibration) 및 라우팅 임계값 설정(Routing Thresholds). 이상적인 캘리브레이션 모델에서는 신뢰도 점수(Confidence Score)와 실제 정답률(Observed Accuracy)이 비례 관계를 나타내야 합니다. 높은 신뢰도(예: 0.95)에서 낮은 정확도(78%)를 보이고 낮은 신뢰도(예: 0.6)에서 높은 정확도(90%)를 보이는 역전 현상은 심각한 미스캘리브레이션(Miscalibration) 상태를 의미하며, 원시 점수를 그대로 임계값 기반 라우팅에 사용해서는 안 됩니다.

**문제 상황 분석:**

- 신뢰도 0.95로 예측된 필드의 실제 정답률은 78%에 불과함 (과신, Overconfidence).
- 신뢰도 0.6으로 예측된 필드의 실제 정답률은 90%에 달함 (저평가, Underconfidence).
- 신뢰도 점수와 실제 정답률 사이에 '역관계(Inversely related)'가 발생하는 심각한 보정 오류가 관찰됨.

**A번이 정답인 이유:**

모델 신뢰도 점수는 실제 정답 확률을 반영해야 합니다. 질문에 제시된 현상은 신뢰도와 정확도가 완벽히 거꾸로 작용하는 Miscalibration의 대표적인 케이스입니다. 이러한 상황에서 원시 점수(Raw Score)를 기준으로 "신뢰도 X 미만은 사람이 검토(Human Review)하도록 라우팅한다"는 식의 단순 임계값 규칙을 적용하면 잘못된 라우팅과 품질 저하가 발생합니다. 따라서 원시 점수를 바로 사용하지 않고 추가 조사 및 재보정을 거쳐야 한다는 A번이 가장 타당합니다.

**오답 분석:**
- Option B (오답): 낮은 신뢰도 점수가 높은 정확도에 대응하는 것은 결코 '잘 보정된 모델'의 정상 동작(Expected behavior)이 아닙니다.
- Option C (오답): 필드 수준 신뢰도 점수 체계 자체를 완전히 폐기하고 모든 필드를 사람 검토로 넘기는 것은 자동화 시스템의 이점을 전혀 활용하지 못하는 과도한 조치입니다.
- Option D (오답): 모델의 신뢰도 보정 조정을 거치지 않은 채 임계값을 0.96으로 무작정 상향하는 것은 역전 현상의 근본 원인을 해결하지 못하며 비효율적인 검토 비용을 초래합니다.
