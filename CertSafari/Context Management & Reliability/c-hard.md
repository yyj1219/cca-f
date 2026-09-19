# Context Management & Reliability — 고난도 선별 문제

원본: c-merged.md (전체 96문제 중 13문제 선별, 14%)

원본 50번 이하는 이해 완료로 판단해 제외했다.

**선별 기준** — 아래 특징 중 하나 이상에 해당하는 문제 중, 특히 난이도가 높은 것:

- **덜 틀린 답 고르기** — 정답이 "명백히 옳은 것"이 아니라 "덜 틀린 것", 매력적인 오답이 2~3개
- **원칙이 깨지는 예외** — 외운 규칙을 그대로 적용하면 틀린다
- **유사 현상 구분** — 표면적으로 같아 보이는 두 현상, 같은 증상 다른 원인
- **복합 시나리오** — 여러 개념이 한 문제에 교차
- **근본 원인 vs 증상 완화** — 오답이 그럴듯한 완화책이고 정답은 구조적 해법
- **부분적으로만 맞는 오답** — 결론은 맞지만 근거가 틀린 선택지 등
- **길이가 단서 아님** — 정답이 가장 길고 서술적이지 않다

**재배치 안내** — 묻는 주제가 같은 것끼리 묶고, 유사 시나리오이지만 답이 다른 쌍을 인접 배치했다. 괄호 안 원본 번호는 그대로다.

---

# A. 인간 에스컬레이션 — 명시적 요청 유무와 감정 어조

66 vs 86: 둘 다 "사람 연결해 달라"는 명시적 요청인데 답이 정반대. 68 vs 85: 둘 다 짜증난 고객 + 명시적 요청 없음인데 답이 미묘하게 다름. 92: 정책 침묵 시 에스컬레이션.

## 1번 문제 (원본 66번)

**어려운 이유** [원칙이 깨지는 예외, 덜 틀린 답 고르기] — 변별 기준은 "명시적 요청 여부"가 아니라 **요청 뒤의 작업이 판단·조사가 필요한가**이다. 이 문제는 요금이 정당한지 확인이 필요한 분쟁 사안이므로, 먼저 설명·해결을 시도하고 반복 요청 시에만 에스컬레이션하는 것이 정답이다.

**1. 문제 원문**

A customer contacts Anthropic support about a $45 API overage charge and says: "I don't want to discuss this with a bot, connect me to a human agent right now." The support agent has not yet reviewed the account. According to Anthropic's recommended support approach, what should the agent do?

A) Review the account's usage history and attempt to resolve the overage charge before responding to the customer's escalation request

B) Escalate the conversation to a human agent immediately, without first investigating the overage charge

C) Ask the customer to first explain why they don't want to work with an automated system before escalating

**D) Offer to explain the overage charge in detail, attempt to resolve it, and escalate to a human only if the customer repeats the request or the issue remains unresolved**

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: D번**

**정답 및 해설:**

**핵심 개념:** 
실제 규칙은 **판단이나 조사가 필요하면 LLM이 먼저 시도한다**. LLM이 먼저 계정을 확인하고 요금을 설명·해결 시도(Attempt to resolve)한 뒤, 그럼에도 고객이 반복 요청하거나 문제가 해결되지 않을 때 비로소 사람 상담원에게 이관하는 것이 올바른 흐름입니다.

**문제 상황 분석:**

- 고객이 API 초과 청구 요금에 대해 다이렉트로 사람 상담원 연결을 강력하게 요구하며 봇과의 대화를 거부했습니다.
- 지원 에이전트(AI 서포트 시스템)는 아직 계정 조사를 시작하지 않은 상태입니다.
- 요금이 정당한지 판단·조사가 필요한 사안에서 AI가 취해야 할 대응을 판단해야 합니다.

**D번이 정답인 이유:**

일반적인 CX/에스컬레이션 설계 상식입니다: 청구가 정당한지 확인·설명이 필요한 사안은 판단·조사가 필요하므로, 먼저 계정을 검토하고 설명·해결을 시도(Attempt to resolve)한 뒤, 그럼에도 고객이 반복 요청하거나 문제가 해결되지 않을 때 사람 상담원에게 이관하는 것이 합리적인 흐름입니다.

**오답 분석:**
- Option A (오답): 에스컬레이션 요청에 전혀 응답하지 않은 채 조사부터 진행하는 것은 고객과의 커뮤니케이션을 무시하므로 올바르지 않으며, 조사 후 어떻게 이관 절차를 밟는지에 대한 완전한 지원 워크플로우를 담고 있지 않습니다.
- Option B (오답): 판단·조사가 필요한 사안임에도 AI가 계정 확인이나 해결 시도를 전혀 거치지 않은 상태에서 즉시 사람 상담원에게 넘기는 것은 불필요한 인계입니다.
- Option C (오답): 봇과 대화하기 싫은 이유를 설명하라고 고객에게 요구하는 것은 고객 여정에 마찰(Friction)만 가중시키는 부적절한 대응 방식입니다.

> 참고: Claude Platform Docs의 "Customer support agent" 가이드에는 에스컬레이션 정확도(escalation accuracy) 목표치 같은 평가 지표만 있을 뿐, "명시적 요청 시 즉시 에스컬레이션" 같은 절차 규정은 명시되어 있지 않다. 즉 이 문제의 근거는 Anthropic 공식 정책이라기보다 일반적인 지원 설계 원칙에 가깝다.

---

## 2번 문제 (원본 86번)

**어려운 이유** [원칙이 깨지는 예외, 유사 현상 구분] — 1번(66번)과 표면적으로 동일한 "명시적 사람 요청" 상황인데 답이 정반대다. 차이는 요청 뒤 작업의 성격에 있다: 이 문제의 비밀번호 재설정은 판단·조사가 전혀 필요 없는 **즉시 처리 가능한 단순 작업**이므로, "먼저 시도해보고" 식의 완충 없이 요청 그대로 즉시 에스컬레이션하는 것이 정답이다.

**1. 문제 원문**

A brokerage customer messages support: 'I want a real person, not a bot,' regarding a routine request to reset their account password. The agent has not yet attempted any troubleshooting. What is the appropriate response?

**A) Escalate to a human agent right away, honoring the request without first attempting to resolve it**

B) Ask the customer to explain why a human agent is preferred before deciding how to proceed

C) Offer to reset the password immediately and escalate only if the customer repeats the request afterward

D) Walk the customer through the password reset steps first, since the process is quick and routine

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: A번**

**정답 및 해설:**

**핵심 개념:** 

1번 문제(요금 분쟁)와 같은 규칙(**판단이나 조사가 필요하면 LLM이 먼저 시도한다**)으로 비교하면 명확해집니다. 1번은 요금이 정당한지 판단·조사가 필요해서 이 규칙이 적용됐지만, 이 문제의 비밀번호 재설정은 판단할 것도 조사할 것도 없는 단순 작업이라 애초에 규칙이 적용될 대상이 아닙니다. LLM이 먼저 시도해야 할 이유(판단·조사 필요성)가 없는데도 굳이 먼저 처리해보겠다고 나서는 것은 사용자의 명시적 의사를 우회하는 불필요한 행동이 됩니다. 그래서 "먼저 시도" 단계 없이 사용자의 요청을 그대로 존중해 즉시 에스컬레이션하는 것이 맞습니다.

**문제 상황 분석:**

- 증권사 고객이 비밀번호 재설정이라는 일반적이고 간단한 요청을 하였음.
- 고객이 메시지로 "봇이 아닌 실제 사람을 원한다('I want a real person, not a bot')"라고 명시적으로 표현함.
- 어시스턴트가 아직 어떠한 문제 해결도 시도하지 않은 상태에서 최선의 조치를 결정해야 함.

**A번이 정답인 이유:**

요청된 작업(비밀번호 재설정)이 판단·조사 없이 즉시 처리 가능한 단순 작업이라면, AI가 자체적으로 먼저 처리를 시도하거나 설득하려 들 이유가 없습니다. 그런 상황에서 사용자가 '사람'과의 대화를 직접 지목해 요구했다면, 굳이 먼저 나서지 말고 요구사항을 즉시 받아들여 사람 상담원에게 이관(Escalate)하는 것이 합리적인 대응입니다.

**오답 분석:**
- Option B (오답): 왜 사람을 선호하는지 이유를 묻고 따지는 것은 이미 불만을 표시한 고객에게 불필요한 마찰과 거부감을 유발합니다.
- Option C (오답): 고객이 명시적으로 사람을 원한다고 요구했음에도 이를 무시하고 AI가 먼저 처리를 제안하는 것은 사용자의 직접적인 의사를 위반하는 응답입니다.
- Option D (오답): 절차가 간단하다는 이유로 고객의 사람 상담원 연결 요청을 무시하고 단계 안내를 강행하는 것은 고객 경험(UX) 관점에서 가장 자제해야 할 거부적 태도입니다.

---

# B. 추출 파이프라인 — 검토 라우팅·신뢰도·샘플링

51/73: 검토를 언제 유지·강화하는가. 95: 신뢰도 점수를 라우팅에 쓸 수 있는가. 63: 샘플링 설계.

## 6번 문제 (원본 51번)

**어려운 이유** [덜 틀린 답 고르기, 원칙이 깨지는 예외] — "세그먼트별로 판단하라"는 원칙을 기계적으로 적용하면 B(문서 유형 단위 격리)가 매력적이나, 조사 전까지 전면 유지가 정답인 보수적 예외다.

**1. 문제 원문**

A medical-records extraction system reports 96% overall field accuracy. When an architect breaks the results down further, the 'medication dosage' field is only 81% accurate on handwritten prescription forms, while every other field and document type exceeds 97%. The team is deciding whether to reduce human review of the pipeline overall. What is the correct action?

A) Keep human review at the current level for all fields and document types **until the medication-dosage field's accuracy on handwritten forms is separately investigated and improved**.

B) Reduce human review for every field and document type except handwritten prescriptions in general, treating the entire document type as unreliable rather than isolating the specific field.

C) Remove human review only from the medication-dosage field on handwritten forms, since that field's absolute accuracy is still above chance level and the errors are likely evenly distributed.

D) Reduce human review across the entire pipeline uniformly, since the 96% overall figure already reflects the presence of the weaker medication-dosage field.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: A번**

**정답 및 해설:**

**핵심 개념:** 

시스템 전체의 평균 정확도가 아무리 높더라도, 환자의 생명과 직결되는 핵심 필드('약물 용량')에서 취약한 오답률(81%)이 포착된다면, 해당 **원인이 규명되고 개선될 때까지 안전한 수준의 검토 체계를 유지**해야 합니다.

**문제 상황 분석:**

- 의료 기록 추출 파이프라인의 전체 정확도는 96%로 양호함.
- 세부 평가 결과, 수기 처방전의 '약물 용량(medication dosage)' 필드 정확도가 81%로 매우 낮게 떨어짐.
- 약물 용량 오류는 환자 안전에 치명적인 영향을 미칠 수 있는 고위험 위험 요소임.
- 팀이 인간의 검토(Human Review) 수위를 줄이려고 할 때 시스템 안전성을 보장하기 위한 조치를 찾아야 함.

**A번이 정답인 이유:**

의료 도메인에서 '약물 용량' 오추출은 환자의 건강 및 생명에 직접적인 위해를 가할 수 있는 치명적 오류(Critical Risk)입니다. 특정 중요 필드가 81%라는 낮고 위험한 정확도를 보이는 이상, 문제를 일으키는 하위 원인을 별도로 조사하고 모델/프롬프트를 개선하여 **안전 기준에 도달할 때까지는 전체 시스템의 검토 단계를 성급히 줄이지 않고 현재의 검토 수준을 유지**하는 것이 가장 안전하고 올바른 조치입니다.

---

## 7번 문제 (원본 73번)

**어려운 이유** [근본 원인 vs 증상 완화, 유사 현상 구분] — 높은 신뢰도 점수라는 정상 신호 뒤에 문서 내부 모순이라는 별개 원인이 숨어 있어, 점수 기반 라우팅(D)을 신뢰하는 함정이 크다.

**1. 문제 원문**

A legal-document review pipeline processes contracts where, in some cases, two clauses on different pages state contradictory terms for the same provision (for example, differing renewal notice periods). The model extracts a single value for the field without flagging the **contradiction(모순)**. What review-routing behavior should the team implement for this scenario?

A) Have the model detect when source values conflict across the document and route those specific extractions **to human review**, even if its confidence in the single value it chose is high.

B) Average the two conflicting values from the document to produce a single extracted number that falls between them, then route that averaged value through normal processing.

C) Extract only the value from whichever page appears first in the document, since earlier clauses are conventionally assumed to take precedence in contract structure.

D) Trust the model's single extracted value whenever its reported confidence score is above the routing threshold, since the score already accounts for any conflicting source text.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: A번**

**정답 및 해설:**

**핵심 개념:** 

문서 내부의 모순(In-document Contradiction)은 모델이 높은 신뢰도를 보이더라도 법적 위험성이 매우 크므로, 모순 감지 시 자동으로 담당자(Human Reviewer)에게 이관(Escalation)하도록 파이프라인을 구축해야 합니다.

**문제 상황 분석:**

- 계약서 검토 파이프라인에서 동일한 항목(예: 갱신 통지 기간)에 대해 서로 다른 페이지에 상충하는 조항이 존재하는 케이스가 발생하고 있습니다.
- 모델은 내부 모순을 경고(Flagging)하지 않고 단 하나의 값만 자의적으로 추출하여 통과시키고 있습니다.
- 이러한 모순 및 모호성으로 인한 법적 리스크를 방지하기 위해 어떤 검토 라우팅 규칙을 적용해야 하는지 묻고 있습니다.

**A번이 정답인 이유:**

문서 내 정보 간에 모순(Conflict)이 발생하는 상황은 고위험 비즈니스/법률 파이프라인에서 전형적인 HITL(Human-in-the-Loop) 적용 대상입니다. 원본 데이터 상의 충돌 조건 자체를 감지(Conflict Detection)하고 이를 사람이 직접 확인 및 판단하도록 이관(Route to human review)하는 것이 시스템 안정성과 위험 관리 측면에서 가장 올바른 모범 사례입니다.

---

## 8번 문제 (원본 95번)

**어려운 이유** [부분적으로만 맞는 오답, 근본 원인 vs 증상 완화] — D는 "임계값을 신뢰하지 말라"는 방향은 맞지만 임계값만 올리는 증상 완화라, 역보정 자체를 지적하는 A와 갈린다.

**1. 문제 원문**

During calibration, a team finds that fields the model scores at 0.95 confidence are correct only 78% of the time, while fields scored at 0.6 confidence are correct 90% of the time. What does this pattern indicate, and what should the team do?

A) The model's confidence scores are miscalibrated and inversely related to actual correctness for these ranges, so the team should **not use the raw scores directly** to set a simple 'route below X' threshold **without further investigation**.

B) This pattern is expected behavior for well-calibrated models, since lower scores naturally correspond to higher observed accuracy on any validation set, and the team should therefore continue using the raw confidence scores as a routing threshold without any recalibration.

C) The validation set is too small to draw any conclusion about field-level confidence calibration, so the team should discard field-level confidence scoring entirely and rely only on document-type stratified sampling, redirecting all fields to human review.

D) The 0.6-confidence fields must belong to an easier field type, so the team should raise the routing threshold to 0.96, effectively routing all fields with scores below 0.96 to human review without adjusting the model's calibration.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: A번**

**정답 및 해설:**

**핵심 개념:** 

높은 신뢰도(예: 0.95)에서 낮은 정확도(78%)를 보이고 낮은 신뢰도(예: 0.6)에서 높은 정확도(90%)를 보이는 역전 현상은 심각한 미스캘리브레이션(Miscalibration) 상태를 의미하며, 원시 점수를 그대로 임계값 기반 라우팅에 사용해서는 안 됩니다.

**문제 상황 분석:**

- 신뢰도 0.95로 예측된 필드의 실제 정답률은 78%에 불과함 (과신, Overconfidence).
- 신뢰도 0.6으로 예측된 필드의 실제 정답률은 90%에 달함 (저평가, Underconfidence).
- 신뢰도 점수와 실제 정답률 사이에 '역관계(Inversely related)'가 발생하는 심각한 보정 오류가 관찰됨.

**A번이 정답인 이유:**

모델 신뢰도 점수는 실제 정답 확률을 반영해야 합니다. 질문에 제시된 현상은 신뢰도와 정확도가 완벽히 거꾸로 작용하는 Miscalibration의 대표적인 케이스입니다. 이러한 상황에서 원시 점수(Raw Score)를 기준으로 "신뢰도 X 미만은 사람이 검토(Human Review)하도록 라우팅한다"는 식의 단순 임계값 규칙을 적용하면 잘못된 라우팅과 품질 저하가 발생합니다. 따라서 원시 점수를 바로 사용하지 않고 추가 조사 및 재보정을 거쳐야 한다는 A번이 가장 타당합니다.

---

## 9번 문제 (원본 63번)

**어려운 이유** [부분적으로만 맞는 오답, 덜 틀린 답 고르기] — C도 "비례 샘플링이 문제"라는 방향은 맞지만 고volume 유형을 아예 제외하자는 과잉 처방이라, 최소 표본 보장이라는 정답과 혼동된다.

**1. 문제 원문**

A team is stratifying its ongoing sampling of high-confidence extractions across five document types that appear in very different volumes: one type makes up 70% of daily volume, and the other four each make up roughly 7.5%. If the team samples strictly in proportion to volume, what risk does this introduce, and how should the sampling plan address it?

A) Pure volume-proportional sampling has no drawback here, since sampling proportional to volume always produces the statistically optimal allocation for detecting errors in every segment.

B) Pure volume-proportional sampling would under-sample the four low-volume document types, so the plan should also **ensure a minimum sample size** per document type regardless of its share of volume.

C) Pure volume-proportional sampling would over-sample the high-volume document type unnecessarily, so the team should exclude it from sampling entirely and focus only on the four smaller types.

D) Pure volume-proportional sampling is only a concern if the four low-volume document types are processed by a different prompt template than the high-volume type.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: B번**

**정답 및 해설:**

**핵심 개념:** 

LLM 기반 데이터 추출 및 품질 평가 파이프라인에서 계층별 모니터링을 수행할 때, 발생 빈도가 낮은 세그먼트(Low-volume segments)는 순수 볼륨 비례 샘플링(Volume-proportional sampling) 적용 시 추출되는 샘플 수가 극히 적어져 통계적으로 유의미한 오류율 평가나 모니터링이 불가능해집니다. 따라서 볼륨 비율에 맞추어 샘플링하더라도, 각 카테고리/문서 유형별로 최소 샘플 수(Minimum Sample Size Floor)를 강제하는 층화 무작위 추출(Stratified Sampling with Minimum Floor) 설계를 적용해야 합니다.

**문제 상황 분석:**

- 5개 문서 유형 중 1개 유형이 전체 일일 데이터의 70%를 차지하는 쏠림 현상이 존재합니다.
- 나머지 4개 유형은 각각 7.5%로 수량이 매우 적습니다.
- 순수 비례 방식으로만 샘플을 뽑을 경우, 소량 발생 문서 유형은 샘플 수가 턱없이 부족하여 추출 오류나 성능 저하를 감지하기 어려워집니다.

**B번이 정답인 이유:**

최소 샘플 수(Minimum sample size per document type)를 하한선으로 설정하여 추출하도록 샘플링 플랜을 설계하는 것이 표준적인 품질 보증 방식입니다.

---

# D. 출처(Provenance) 보존 — 압축과 병합

74: 압축 시 claim-source 매핑 손실. 76: 병합 시 인용 집합 보존.

## 12번 문제 (원본 74번)

**어려운 이유** [유사 현상 구분] — 인용만 사라지고 findings는 남은 증상을 컨텍스트 윈도우 축소나 캐시 만료 같은 유사 원인과 구분해, compaction이 claim-source 매핑을 보존하지 않은 것임을 짚어야 한다.

**1. 문제 원문**

A long-running research agent uses server-side context compaction (`context_management` with beta header `compact-2026-01-12`) to keep an extended multi-turn investigation within the context window. After several rounds of compaction, the architect notices that citations linking earlier findings to their original source documents have disappeared from the working context, even though the findings themselves survived. What is the most likely cause of this gap?

A) The compaction step condensed earlier turns without explicitly preserving claim-source mappings alongside the findings

B) The model's context window silently **shrank(줄어들었다)** between turns, causing the oldest citations to be truncated regardless of compaction

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: A번**

**정답 및 해설:**

**문제 상황 분석:**

- 리서치 에이전트가 컨텍스트 윈도우를 유지하기 위해 `context_management` 기반 서버 측 압축 기능을 사용 중입니다.
- 여러 번의 압축을 거친 뒤, 조사 사실/결과(Findings) 자체는 컨텍스트에 남아있으나 원본 문서와 연결되는 인용 정보(Citations)만 사라진 현상이 발생했습니다.
- 원본 출처 인용 정보가 누락된 이유를 기술적으로 파악해야 합니다.

**A번이 정답인 이유:**

컨텍스트 압축(Compaction)은 과거 메시지를 요약하여 중요한 정보 위주로 압축하는 과정입니다. 요약 프롬프트나 압축 규칙에서 각 결과에 대한 출처 인용(Claim-Source Mapping)을 명시적으로 유지하도록 지시하지 않으면, 요약 모델은 출처 세부 정보(URL, 인용문, 문서 ID 등)를 불필요한 부연 설명으로 판단하여 절삭하고 주요 사실만 축약하여 남기게 됩니다.

**오답 분석:**
- Option B (오답): API 호출 중에 모델의 컨텍스트 윈도우 크기가 자동으로 줄어드는 동작은 존재하지 않습니다.

---

## 13번 문제 (원본 76번)

**어려운 이유** [덜 틀린 답 고르기] — 중복 병합 시 인용을 어디까지 남길지에서 "하나만 남기기"류 선택지가 실무적으로 그럴듯해, 인용 전체 집합 보존이라는 요건과 경합한다.

**1. 문제 원문**

A coordinator agent receives structured claim-source mappings from four subagents researching the same topic from different angles. During merging, several claims are near-duplicates reported by multiple subagents with slightly different wording, and the supporting source citations are not **identical(동일한)** across the reports. What is the best way to merge these without losing provenance?

C) **Consolidate(합치다)** the duplicates into one entry **while((동시에) ~하면서)** retaining the full set of source citations that support it

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: C번**
