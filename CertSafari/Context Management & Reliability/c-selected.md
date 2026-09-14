# Context Management & Reliability 문제 분석 모음

---

* community sentiment : 커뮤니티 여론
* prose : 줄글(산문)
* service outage : 서비스중단
* regardless of whether: 명시되어 있는지 여부와 상관없이
* partway through: ~하는 중간에
* restate: 다시 말하다
* forgo: 포기하다
* citation: 인용구(문)
* excerpt: 발췌(인용)
* bibliographies: 참고문헌
* passages: 구절
* provenance: 출처
* footnote number: 각주 번호
* confidently: 확신있게, 자신있게
* eligibility: 자격
* stratified: 계층화하다
* calibration: 교정
* categorically: 범주적으로
* reliable: 믿을 수 있는
* complexity proxy: 복잡성 대리 지표
* uniformly: 일률적으로
* evenly: 균등하게
* treat: ~로 취급하다
* chance level: 우연 수준
* eliminate: 제거하다

---

### 53번 문제 (★)

**1. 문제 원문**

A medical-records extraction system reports 96% overall field accuracy. When an architect breaks the results down further, the 'medication dosage' field is only 81% accurate on handwritten prescription forms, while every other field and document type exceeds 97%. The team is deciding whether to reduce human review of the pipeline overall. What is the correct action?

A) Keep human review at the current level for all fields and document types until the medication-dosage field's accuracy on handwritten forms is separately investigated and improved.

B) Reduce human review for every field and document type except handwritten prescriptions in general, **treating the entire document type as unreliable** rather than isolating the specific field.

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

## 56번 문제

**1. 문제 원문**

In a research pipeline, a coordinator dispatches five subagents to gather sources on different aspects of a market analysis. One subagent's web-fetch tool raises an unrecoverable connection error. The coordinator's current implementation aborts the entire pipeline and discards the four completed subagent results. What is the better design?

A) Synthesize from the four completed results and use the failed subagent's error context to flag the coverage gap

B) Still abort the pipeline entirely, since a single subagent failure means the overall research quality cannot be trusted

C) Replace the failed subagent's section with fabricated but plausible content so the report shows no visible gaps

D) Re-run all five subagents from scratch, including the four that already succeeded, to keep the batch consistent

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

A번: Synthesize from the four completed results and use the failed subagent's error context to flag the coverage gap

**정답 및 해설:**

**핵심 개념:** 

멀티 에이전트 시스템(Multi-Agent System) 설계에서는 일부 서브에이전트나 도구 실행이 실패하더라도 전체 작업이 와해되지 않도록 하는 결함 허용성(Fault Tolerance)과 부분 성공 처리(Partial Success Handling)가 필수적입니다. 이미 수집된 정상 결과를 최대한 활용하고, 실패한 부분은 명확하게 결손 영역(Gap)으로 표기하여 투명성을 확보하는 것이 회복탄력성(Resiliency) 있는 에이전트 아키텍처의 모범 사례입니다.

**문제 상황 분석:**

- 코디네이터 에이전트가 5개의 서브에이전트에 각각 독립된 시장 분석 과제를 할당했습니다.
- 1개 서브에이전트의 도구에서 복구 불가능한 네트워크 연결 오류가 발생했습니다.
- 기존 시스템은 성공한 4개의 유용한 결과까지 모두 버리고 파이프라인 전체를 중단시키는 비효율성을 보이고 있습니다.

**A번이 정답인 이유:**

독립적인 서브에이전트 작업 구조에서는 1개 에이전트가 실패하더라도 이미 완료된 4개의 유효한 데이터 포인트를 활용하여 보고서를 종합하는 것이 비용 및 시간 측면에서 효율적입니다. 또한, 실패 원인과 누락된 분석 영역을 리포트에 명시적으로 기록(Flag coverage gap)함으로써 사용자에게 정확하고 투명한 정보를 제공할 수 있습니다.

**오답 분석:**
- Option B (오답): 단 1개의 서브에이전트 오류로 인해 정상적인 나머지 4개의 수집 결과를 무조건 폐기하는 것은 자원 낭비이며 결함 허용성이 결여된 안티 패턴입니다.
- Option C (오답): 존재하지 않는 내용을 그럴듯하게 환각(Hallucination)하여 지어내는 것은 AI 시스템의 환각 및 환각 조작 금지 원칙(안전성/신뢰성)에 심각하게 위배됩니다.
- Option D (오답): 네트워크 오류로 실패한 건 때문에 이미 성공적으로 완료된 4개의 서브에이전트까지 처음부터 다시 실행하는 것은 불필요한 API 비용 및 지연 시간을 발생시킵니다.

---

## 57번 문제

**1. 문제 원문**

A coordinator receives this message from a subagent: 'Query failed.' No other detail is provided. The coordinator must decide whether to retry the subagent, try an alternative subagent, or give up on that portion of the task. What is the core limitation of this message for making that decision?

A) It is missing a timestamp, and timestamps alone let a coordinator choose between retrying and escalating

B) It is too long for the coordinator to process efficiently within its available context window during a multi-agent run

C) It omits the failure type and any partial results or alternatives, leaving no basis to choose a recovery path

D) It fails to include the exact HTTP status code, which is the only detail coordinators ever really require

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

C번: It omits the failure type and any partial results or alternatives, leaving no basis to choose a recovery path

**정답 및 해설:**

**핵심 개념:** 

멀티 에이전트 오케스트레이션(Multi-Agent Orchestration) 아키텍처에서 서브에이전트의 에러 보고는 복구 전략(Recovery Strategy) 수립에 필요한 충분한 맥락(Context)을 포함해야 합니다. 에러의 원인/유형(일시적 네트워크 오류 vs 비가역적 파라미터 오류 등), 부분 성공 결과, 대체 해결책 제안 등의 정보가 포함되어야 상위 코디네이터 에이전트가 재시도(Retry), 에이전트 교체(Alternative Agent), 작업 포기(Fallback) 중 최적의 경로를 판단할 수 있습니다.

**문제 상황 분석:**

- 코디네이터 에이전트가 서브에이전트로부터 아무런 세부 정보 없이 `'Query failed.'`라는 메시지만 받았습니다.
- 코디네이터는 작업 재시도, 다른 서브에이전트 투입, 해당 작업 포기 중 하나를 결정해야 하는 상황입니다.
- 단 몇 단어로 구성된 불투명한 에러 메시지 때문에 의사결정을 내리기 위한 핵심 정보가 부재합니다.

**C번이 정답인 이유:**

단순히 "실패했다"는 메시지만으로는 이것이 일시적 오류(재시도 가능)인지, 도구 문제(대체 에이전트 필요)인지, 혹은 불가능한 요청(작업 포기)인지 판별할 수 없습니다. 실패 유형(Failure Type), 부분 수행 결과(Partial Results), 혹은 에이전트가 제안하는 대안이 모두 생략되어 있어 코디네이터가 복구 경로(Recovery Path)를 결정할 수 있는 기술적 근거가 전혀 존재하지 않습니다.

**오답 분석:**
- Option A (오답): 타임스탬프만으로는 오류의 원인이나 재시도 가능 여부를 판단할 수 없으며, 단독으로 복구 여부를 결정해주지 못합니다.
- Option B (오답): `'Query failed.'`는 단 2단어에 불과하므로 컨텍스트 창(Context Window)을 초과하거나 비효율적일 만큼 길다는 것은 사실과 반대됩니다.
- Option D (오답): 에이전트 간의 통신과 복구 판단에는 단순 HTTP 상태 코드 외에도 도구 실행 에러, 논리적 실패 등 다양한 정보가 필요하며, HTTP 상태 코드가 코디네이터에게 필요한 유일한 정보라는 설명은 틀렸습니다.

---

## 58번 문제

**1. 문제 원문**

A sales assistant queries a CRM contact-lookup tool that returns 60 fields per contact record, including internal lead-scoring metadata, marketing campaign tags, and audit timestamps, when only the contact's name, company, deal stage, and last contact date matter for drafting a follow-up email. After looking up ten contacts, the raw records dominate the context. What should the assistant do?

A) Extract only the name, company, deal stage, and last contact date from each record before adding it to context

B) Ask the CRM tool to return records in a more compact text format while still including all 60 fields

C) Look up each contact only once per session and rely on memory of the fields afterward, without keeping the raw output at all

D) Store all 60 fields from each lookup in context so the assistant has complete information available for any future question

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

A번: Extract only the name, company, deal stage, and last contact date from each record before adding it to context

**정답 및 해설:**

**핵심 개념:** 

LLM 기반 에이전트 응용 프로그램에서 프롬프트 및 컨텍스트 관리(Context Window Management)는 시스템 성능과 비용, 모델의 주의력(Attention) 유지에 결정적인 요소입니다. 도구 호출(Tool Calling)의 결과물 중 작업 달성에 필요한 핵심 필드만 필터링/추출(Context Trimming / Field Extraction)하여 컨텍스트에 삽입하면 노이즈를 줄이고 토큰 낭비를 방지할 수 있습니다.

**문제 상황 분석:**

- 영업 보조 에이전트가 팔로업 이메일 작성을 위해 CRM 조회를 수행합니다.
- 실제 작업에 필요한 정보는 '이름, 회사, 거래 단계, 마지막 연락일'의 4개 필드뿐입니다.
- 그러나 도구가 레코드당 불필요한 60개 필드를 그대로 반환하여 10건 조회 시 컨텍스트 창이 비효율적인 데이터로 가득 차는 문제가 발생했습니다.

**A번이 정답인 이유:**

도구가 반환한 전체 원본 레코드에서 작업(팔로업 이메일 작성)에 실제로 필요한 4개의 핵심 필드만 정제하여 컨텍스트에 추가하면, 토큰 사용량을 대폭 절감하고 컨텍스트 낭비를 방지하여 LLM의 연산 정확도와 응답 속도를 극대화할 수 있습니다.

**오답 분석:**
- Option B (오답): 텍스트 포맷을 압축하더라도 무의미한 60개 필드를 모두 포함한다면 컨텍스트 낭비 및 노이즈 문제를 근본적으로 해결하지 못합니다.
- Option C (오답): 원본 출력을 컨텍스트에 전혀 남기지 않고 모델의 내부 기억력에만 의존하는 것은 데이터 유실 및 환각(Hallucination) 위험을 초래합니다.
- Option D (오답): 향후 질의에 대비한다는 이유로 60개 필드를 전부 컨텍스트에 쌓아두는 것은 컨텍스트 오염(Context Pollution) 및 토큰 비용 폭증의 원인이 됩니다.

---

## 59번 문제

**1. 문제 원문**

An incident-response coordinator dispatches subagents to pull logs from four services. The subagent for the payments service reports a structured failure: 'access_failure, attempted last-15-minutes log pull, partial results: 3 of 4 pods returned data, alternative: retry against read replica.' How should the coordinator most effectively use this information?

A) Add the three pods' data to the timeline now, and separately decide whether to retry the missing pod via replica

B) Ignore the suggested read-replica alternative, since coordinators should never act on subagent suggestions

C) Discard the entire payments-service contribution until all four pods can be pulled in one atomic retry

D) Treat the structured message as equivalent to a plain 'error' status and abandon the payments-service investigation entirely

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

A번: Add the three pods' data to the timeline now, and separately decide whether to retry the missing pod via replica

**정답 및 해설:**

**핵심 개념:** 

멀티 에이전트 시스템에서 구조화된 에러 메세지(Structured Failure Report)는 부분 성공 데이터(Partial Results)와 복구 대안(Alternatives)을 명확하게 전달합니다. 코디네이터 에이전트는 이미 확보된 부분 성공 데이터는 즉시 시스템 작업에 활용하고, 실패한 나머지 부분에 대해서만 제안된 대안(Alternative)을 실행할지 독립적으로 의사결정을 내림으로써 장애 대응의 신속성과 완결성을 동시에 확보합니다.

**문제 상황 분석:**

- 장애 대응 코디네이터가 4개 서비스 로그 수집을 위해 서브에이전트들을 실행했습니다.
- 결제 서비스 서브에이전트가 4개 중 3개 파드의 로그를 수집하는 데 성공했으며, 실패 원인과 복구 대안(읽기 복제본 재시도)을 구조화된 메세지로 반환했습니다.
- 코디네이터는 이 구조화된 정보를 바탕으로 효율적인 복구 절차를 진행해야 합니다.

**A번이 정답인 이유:**

장애 대응 프로세스에서는 신속성이 최우선입니다. 서브에이전트가 성공적으로 수집한 3개 파드의 데이터는 즉시 타임라인 분석에 활용(부분 성공 인정)하고, 누락된 1개 파드에 대해서만 제시된 읽기 복제본(Read Replica) 재시도를 할지 별도로 판단하여 집행하는 것이 가장 효율적이고 안정적인 시스템 설계 방식입니다.

**오답 분석:**
- Option B (오답): 서브에이전트가 제공하는 실행 가능한 대안(Alternative Suggestion)은 코디네이터의 빠른 복구 판단을 돕는 유용한 정보이므로 무조건 무시해야 한다는 설명은 틀렸습니다.
- Option C (오답): 4개 전체를 원자적으로 한 번에 가져올 때까지 수집된 3개 파드의 정상 데이터를 모두 버리는 것은 장애 조사를 지연시키고 불필요한 재작업을 유발하는 비효율적인 설계입니다.
- Option D (오답): 상세한 실패 원인과 부분 성공 데이터가 들어있는 구조화된 보고서를 단순 '오류' 처리하고 조사 전체를 포기하는 것은 결함 허용성(Fault Tolerance)과 에이전트 협업 원칙에 위배됩니다.

---

## 60번 문제

**1. 문제 원문**

A cloud support agent attempts three different tool-based remediation steps to fix a customer's stuck deployment, and each attempt fails to resolve the issue. No further remediation options are available to the agent. What should happen next?

A) Escalate the case to a human agent, since the agent is unable to make further meaningful progress

B) Close the case as unresolvable, without any handoff to a human agent for further troubleshooting

C) Continue retrying the same remediation steps, since repeated attempts eventually resolve most stuck deployments

D) Inform the customer the issue is resolved, since the remediation steps were the correct actions to attempt

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

A번: Escalate the case to a human agent, since the agent is unable to make further meaningful progress

**정답 및 해설:**

**핵심 개념:** 

자율형 AI 에이전트 아키텍처(Autonomous AI Agent Architecture) 설계에서 가장 중요한 원칙 중 하나는 에이전트의 한계 상황(Hand-off / Escalation Condition)을 명확히 정의하는 것입니다. 에이전트가 할당된 모든 도구 및 복구 옵션을 소진했거나 무한 루프/반복 실패에 빠졌을 때, 시스템은 스스로 종료하거나 상위 엔지니어(Human-in-the-loop / Human Agent)에게 맥락을 전달하여 이관(Escalation)해야 합니다.

**문제 상황 분석:**

- 클라우드 지원 AI 에이전트가 고객의 배포 지연/멈춤 문제를 해결하기 위해 도구 기반 복구 작업 3개를 모두 수행했습니다.
- 모든 복구 작업이 실패했고, 에이전트가 자율적으로 실행할 수 있는 추가 옵션이 존재하지 않는 상태입니다.
- AI가 자율적으로 의미 있는 진전을 만들 수 없는 단착 상태(Deadlock/Exhaustion)에 도달했습니다.

**A번이 정답인 이유:**

AI 에이전트의 자동화 범위를 벗어나거나 모든 자동 복구 옵션이 소진된 경우, 이전까지의 수행 이력 및 실패 맥락을 유지한 상태로 실제 사람 엔지니어(Human Agent)에게 사건을 이관(Escalate)하는 것이 소프트웨어 및 AI 지원 아키텍처의 표준 모범 사례(Best Practice)입니다.

**오답 분석:**
- Option B (오답): 사람 상담원에게 이관하지 않고 사건을 그냥 무작정 종결해 버리는 것은 고객 서비스 무단 중단 및 치명적인 고객 경험 저하를 일으킵니다.
- Option C (오답): 이미 실패한 동일한 조치를 무한히 재시도하는 것은 무한 루프(Infinite Loop)를 유발하고 API 토큰 및 컴퓨팅 자원을 낭비할 뿐입니다.
- Option D (오답): 문제가 해결되지 않았음에도 올바른 절차를 시도했다는 이유만으로 고객에게 문제가 해결되었다고 거짓 통보하는 것은 시스템 신뢰성을 완전히 파괴하는 심각한 오류입니다.

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

## 62번 문제

**1. 문제 원문**

A synthesis agent is drafting the final section of a multi-source research report on an emerging medical treatment. Several subagents agree on the treatment's basic mechanism of action, but only one subagent found a single small study suggesting a long-term side effect, which no other source corroborates. How should the report be structured to reflect this?

A) Merge all findings into one narrative section so the report reads smoothly without calling attention to which claims are more certain

B) Present the side-effect finding with the same confidence language as the mechanism-of-action findings to keep the tone consistent

C) Exclude the single-source side-effect finding from the report since it lacks corroboration from other subagents

D) Use separate sections that distinguish well-corroborated findings from contested ones, preserving each source's characterization

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

D번: Use separate sections that distinguish well-corroborated findings from contested ones, preserving each source's characterization

**정답 및 해설:**

**핵심 개념:** 

다중 출처 정보 종합(Multi-Source Information Synthesis) 시스템에서 에이전트는 서로 다른 출처의 정보 신뢰도와 교차 검증(Corroboration) 여부를 명확히 구분하여 전달해야 합니다. 여러 출처에서 교차 검증된 확실한 정보와 단일 출처에 불과하거나 이견이 있는(Contested/Uncorroborated) 정보를 명확히 구조적으로 분리하여 제시하는 것이 보고서의 객관성과 신뢰성을 유지하는 모범 사례입니다.

**문제 상황 분석:**

- 치료법의 기본 작용 기전은 여러 서브에이전트(다중 출처)에 의해 교차 검증되었습니다.
- 반면, 장기 부작용에 대한 내용은 단 1개의 소규모 연구에서만 발견되었으며 타 출처의 뒷받침이 없습니다.
- 이러한 정보 간의 신뢰도 및 검증 격차를 보고서 구조에 어떻게 반영할지 결정해야 합니다.

**D번이 정답인 이유:**

교차 검증이 충분히 이루어진 확실한 정보(Well-corroborated findings)와 교차 검증되지 않았거나 단일 출처에 기반한 정보(Contested / Uncorroborated findings)를 별도의 섹션으로 분리하고, 각 정보의 신뢰도 특성(Characterization)을 있는 그대로 투명하게 서술하는 것이 리서치 종합 에이전트의 올바른 보고서 구성 방식입니다.

**오답 분석:**
- Option A (오답): 신뢰도가 다른 정보들을 하나의 문단으로 뭉뚱그려 서술하는 것은 정보의 확실성 차이를 은폐하여 사용자에게 오해를 일으킵니다.
- Option B (오답): 검증되지 않은 단일 출처 부작용을 교차 검증된 작용 기전과 동일한 신뢰도 어조(Confidence language)로 작성하는 것은 정보의 가치를 왜곡하는 심각한 오류입니다.
- Option C (오답): 단일 출처라 할지라도 중요한 잠재적 리스크(부작용) 데이터를 보고서에서 완전히 임의로 삭제/제외하는 것은 데이터 누락에 해당하며 바람직하지 않습니다.

---

## 63번 문제

**1. 문제 원문**

A policyholder has two active insurance claims open in one chat: a water-damage claim (claim #C-1092, estimated $6,400, status: under review) and an auto-glass claim (claim #C-1108, estimated $310, status: approved). The assistant's single blended summary later refers to "the claim" and "the amount" when answering a follow-up, creating ambiguity about which claim is meant. What is the best fix?

A) Summarize only whichever claim was mentioned most recently and assume the other claim is no longer active

B) Merge the two claims into a single combined claim number so only one amount and status need to be tracked

C) Require the policyholder to specify which claim number they mean every time they ask a follow-up question

D) Track each claim as its own structured record with claim ID, amount, and status, kept apart from any blended narrative

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

D번: Track each claim as its own structured record with claim ID, amount, and status, kept apart from any blended narrative

**정답 및 해설:**

**핵심 개념:** 

LLM 대화 상태 관리(State Management) 및 컨텍스트 추적에서, 동일한 대화 맥락 내에 존재하는 여러 독립된 개체(Entities) 정보를 서술형 텍스트(Blended narrative) 형태로 뭉뚱그려 요약하면 개체 간 데이터 오염 및 모호성(Ambiguity)이 발생합니다. 명확한 엔티티 식별자(ID) 기반의 독립된 구조화 레코드(Structured Record)로 대화 상태를 분리 추적하는 것이 상태 왜곡을 방지하는 모범 아키텍처 방식입니다.

**문제 상황 분석:**

- 한 대화 세션 내에 수해 청구(#C-1092)와 자동차 유리 청구(#C-1108)라는 두 개의 독립된 보험 청구가 동시에 진행 중입니다.
- AI 어시스턴트가 두 청구 정보를 하나의 서술문 형태로 혼합 요약하여 보관하다 보니, 후속 대화에서 "그 청구", "그 금액"이 무엇을 지칭하는지 모호해졌습니다.
- 이러한 엔티티 모호성 문제를 해결하기 위한 올바른 데이터 추적 아키텍처를 선택해야 합니다.

**D번이 정답인 이유:**

개별 청구건의 상태, 금액, ID 정보를 서술형 텍스트에 섞지 않고, 독립된 객체/데이터 구조(Structured Record)로 분리하여 보관 및 관리하면, AI 모델이 후속 질의 처리 시 정확히 특정 청구 ID(#C-1092 또는 #C-1108)의 상태값을 정확히 참조할 수 있게 되어 모호성이 완벽히 해결됩니다.

**오답 분석:**
- Option A (오답): 가장 최근에 언급된 청구만 유지하고 이전 청구를 비활성화 상태로 임의 가정하는 것은 데이터 손실을 발생시키며, 사용자가 이전 청구에 대해 질문할 때 오류를 일으킵니다.
- Option B (오답): 서로 다른 사건인 두 개의 청구를 하나의 청구 번호로 병합하는 것은 데이터의 정합성을 파괴하는 잘못된 처리 방식입니다.
- Option C (오답): 시스템 측의 컨텍스트 관리 부실 문제를 사용자에게 매번 청구 번호를 입력하라고 요구함으로써 해결하려는 것은 매우 나쁜 사용자 경험(UX)을 제공합니다.

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

## 65번 문제

**1. 문제 원문**

An architect is about to spawn a new subagent to investigate the caching layer, but suspects a similar investigation may already have been done earlier in the exploration. What should the architect check first to avoid redundant exploration?

A) The user's personal notes taken outside the Claude Code session, since those are the only reliable record of prior work.

B) The main agent's unaided memory of the conversation from several hours ago, trusting it to recall every earlier finding.

C) The manifest or scratchpad records from earlier phases, to see whether the caching layer was already investigated.

D) Nothing; spawn the new subagent immediately regardless of what earlier phases may have already found.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

C번: The manifest or scratchpad records from earlier phases, to see whether the caching layer was already investigated.

**정답 및 해설:**

**핵심 개념:** 

멀티 에이전트 오케스트레이션 및 지속적 탐색(Exploration) 시스템에서 서브에이전트들이 이전에 수행한 탐색 결과와 작업 내역은 작업 매니페스트(Manifest)나 공유 스크래치패드(Scratchpad / Shared Memory)에 구조화된 기록으로 저장됩니다. 상위 에이전트(Architect/Coordinator)는 새로운 서브에이전트를 생성(Spawn)하기 전에 기존 스크래치패드나 매니페스트를 조회하여 동일 작업의 중복 수행을 방지해야 합니다.

**문제 상황 분석:**

- 시스템 아키텍트가 캐싱 레이어 조사를 위한 새 서브에이전트를 생성하기 직전입니다.
- 대화 및 탐색의 이전 단계에서 이미 유사한 조사가 진행되었을 가능성을 의심하고 있습니다.
- 자원 낭비와 불필요한 API 호출을 유발하는 중복 탐색을 방지하기 위한 최선의 사전 확인 조치를 결정해야 합니다.

**C번이 정답인 이유:**

이전 탐색 단계에서 서브에이전트들이 기록해 둔 매니페스트(Manifest)나 스크래치패드(Scratchpad) 기록을 확인하면, 캐싱 레이어에 대한 조사가 이미 완료되었는지 여부와 그 결과를 즉시 파악할 수 있습니다. 이를 통해 불필요한 서브에이전트 생성 및 중복 조사를 효율적으로 방지할 수 있습니다.

**오답 분석:**
- Option A (오답): Claude Code 세션 외부의 개인 메모는 에이전트 시스템 내부의 탐색 기록을 자동으로 반영하지 못하므로 1차 확인 대상이 아닙니다.
- Option B (오답): LLM 메인 에이전트의 자체 기억력(Context Window 내 단순 기억)에만 의존하는 것은 장기 세션이나 복잡한 탐색 과정에서 환각(Hallucination)이나 정보 유실의 위험이 큽니다.
- Option D (오답): 이전 단계의 수행 여부를 확인하지 않고 무조건 서브에이전트를 즉시 생성하는 것은 동일한 작업을 중복 수행하여 시간과 비용을 낭비하게 만듭니다.

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

## 68번 문제

**1. 문제 원문**

A streaming service agent looks up a customer to resolve a billing question and finds two profiles sharing the same email domain and last name, consistent with a family plan. Usage data shows one profile is far more active than the other. What should the agent do?

A) Select the more active profile, since higher usage suggests it belongs to the customer who initiated contact

B) Select the profile with the earlier account creation date, since it is likely the primary plan holder

C) Merge billing details from both profiles to answer the question without confirming which one applies

D) Ask the customer for an additional identifier, such as the last four digits of the payment card on file

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

D번: Ask the customer for an additional identifier, such as the last four digits of the payment card on file

**정답 및 해설:**

**핵심 개념:** 

자율형 에이전트 및 고객 지원 AI 시스템에서 엔티티 모호성(Entity Ambiguity)이 발생하는 경우, 추측이나 휴리스틱(사용량, 생성일 등)에 의존해 임의로 계정을 결정해서는 안 됩니다. 보안, 데이터 프라이버시, 정확성을 위해 추가적인 고유 식별 정보(Disambiguation Input/Additional Identifier)를 사용자에게 명시적으로 요청하여 대상을 확실히 검증해야 합니다.

**문제 상황 분석:**

- 스트리밍 서비스 에이전트가 청구 문의를 처리하던 중 동일 성씨와 이메일 도메인을 사용하는 패밀리 플랜 프로필 2개를 발견했습니다.
- 사용량 데이터를 확인해 보니 한쪽 프로필의 활동량이 훨씬 더 높은 상태입니다.
- 두 프로필 중 어느 계정에 대한 문의인지 불확실한 모호성(Ambiguity)을 안전하게 해소하는 방안을 찾아야 합니다.

**D번이 정답인 이유:**

사용량이나 계정 생성일과 같은 간접적인 정황 정보로 고객을 추측하여 특정 계정의 청구 정보를 조회 및 전달하는 것은 개인정보 유출 및 잘못된 안내 위험을 초래합니다. 등록된 결제 카드 끝 4자리와 같은 명확한 추가 식별자(Additional Identifier)를 요구하여 문의 주체를 명확히 확인하는 것이 에이전트 설계의 표준 모범 사례입니다.

**오답 분석:**
- Option A (오답): 사용량이 많다는 이유만으로 문의를 제기한 고객의 계정이라고 단정 짓는 것은 추측에 불과하며, 사용량이 적은 부계정 소유자가 결제 문의를 했을 가능성을 배제할 수 없습니다.
- Option B (오답): 먼저 생성된 계정이 메인 계정일 확률이 높다는 휴리스틱에 의존하는 것 역시 개별 문의 주체를 정확히 식별하지 못합니다.
- Option C (오답): 확인 절차 없이 두 프로필의 청구 세부 정보를 뭉뚱그려 병합해 답변하는 것은 타인의 정보를 노출시킬 수 있어 개인정보 보호 정책 및 데이터 정합성에 심각하게 위배됩니다.

---

## 69번 문제

**1. 문제 원문**

A customer contacts Anthropic support about a $45 API overage charge and says: "I don't want to discuss this with a bot, connect me to a human agent right now." The support agent has not yet reviewed the account. According to Anthropic's recommended support approach, what should the agent do?

A) Review the account's usage history and attempt to resolve the overage charge before responding to the customer's escalation request

B) Escalate the conversation to a human agent immediately, without first investigating the overage charge

C) Ask the customer to first explain why they don't want to work with an automated system before escalating

D) Offer to explain the overage charge in detail, attempt to resolve it, and escalate to a human only if the customer repeats the request or the issue remains unresolved

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

D번: Offer to explain the overage charge in detail, attempt to resolve it, and escalate to a human only if the customer repeats the request or the issue remains unresolved

**정답 및 해설:**

**핵심 개념:** 

Anthropic의 지원 시스템(Support Architecture)은 **AI 퍼스트(AI-first) 지원 모델** 정책을 따릅니다. 모든 초기 인바운드 문의 및 상동성 요청은 먼저 자동화 지원 봇(Fin 등)이 계정을 확인하고 문제를 직접 해결하는 것을 우선적인 목표로 삼습니다. 사람 상담원(Human Escalation)으로의 이관은 AI 지원 봇이 문제 해결을 먼저 시도했음에도 불구하고, 고객이 반복해서 요청하거나 문제가 해결되지 않았을 때 비로소 진행하는 구조입니다.

**문제 상황 분석:**

- 고객이 API 초과 청구 요금에 대해 다이렉트로 사람 상담원 연결을 강력하게 요구하며 봇과의 대화를 거부했습니다.
- 지원 에이전트(AI 서포트 시스템)는 아직 계정 조사를 시작하지 않은 상태입니다.
- Anthropic의 AI-First 서포트 플로우(Recommended Support Approach)에 맞춰 AI가 취해야 할 최적의 정석적 흐름을 판단해야 합니다.

**D번이 정답인 이유:**

Anthropic 권장 지원 흐름에 따라 지원 봇은 고객의 초과 청구 요금 내역을 먼저 검토 및 설명하여 AI 차원에서 문제를 해결하려는 시도(Attempt to resolve)를 우선적으로 해야 합니다. 그리고 해당 시도 후에도 고객이 사람 연결을 지속 요청하거나 문제 해결이 불가능한 것으로 판명될 때 최종적으로 사람 상담원에게 에스컬레이션을 수행하는 것(AI-First 후 Human Fallback)이 시스템 공식 가이드라인에 부합하는 정답입니다.

**오답 분석:**
- Option A (오답): 에스컬레이션 요청에 전혀 응답하지 않은 채 조사부터 진행하는 것은 고객과의 커뮤니케이션을 무시하므로 올바르지 않으며, 조사 후 어떻게 이관 절차를 밟는지에 대한 완전한 지원 워크플로우를 담고 있지 않습니다.
- Option B (오답): Anthropic의 고객 지원은 AI-First 모델을 기반으로 하므로, AI 봇이 계정 확인 및 문제 해결 시도를 전혀 거치지 않은 상태에서 즉시 사람 상담원에게 넘기는 것은 권장 방식이 아닙니다.
- Option C (오답): 봇과 대화하기 싫은 이유를 설명하라고 고객에게 요구하는 것은 고객 여정에 마찰(Friktion)만 가중시키는 부적절한 대응 방식입니다.

---

## 70번 문제

**1. 문제 원문**

A research assistant aggregates outputs from five subagents (market sizing, competitor pricing, regulatory risk, customer sentiment, distribution channels) into one long combined document that is then passed to a synthesis step. The synthesis step's final memo omits the regulatory risk finding, which appeared in the third of five sections in the middle of the document. What is the best way to structure the aggregated input to prevent this in future runs?

A) Place a short key-findings summary at the top of the aggregated document, then present each detailed section beneath an explicit heading

B) Instruct the synthesis step to read through the entire aggregated document twice before drafting its final memo

C) Reorder the sections so the regulatory risk finding is always discussed last, since Claude retains the most recent content best

D) Split the aggregated document into two shorter documents, without adding any findings summary or section headers

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

A번: Place a short key-findings summary at the top of the aggregated document, then present each detailed section beneath an explicit heading

**정답 및 해설:**

**핵심 개념:** 

긴 컨텍스트(Long Context)를 다루는 대형 언어 모델(LLM)은 프롬프트의 중간 부분에 위치한 정보에 대한 주의력(Attention)이 떨어지는 'Lost in the Middle' 현상을 보일 수 있습니다. 이를 해결하기 위한 대표적인 프롬프트/컨텍스트 구조화 모범 사례는 최상단에 핵심 요약(Key-findings summary)을 전면 배치(Front-loading)하고, 하단에 명시적인 구분 헤딩(Explicit headings)을 사용하여 각 섹션의 정보 경계를 구조적으로 명확히 만들어 주는 것입니다.

**문제 상황 분석:**

- 5개 서브에이전트의 출력을 하나로 통합한 긴 문서가 종합(Synthesis) 에이전트로 전달되었습니다.
- 문서 중간(5개 섹션 중 3번째)에 위치했던 '규제 리스크(regulatory risk)' 내용이 최종 출력 보고서에서 누락되는 'Lost in the Middle' 오류가 발생했습니다.
- 입력 문서의 구조를 개선하여 정보 누락을 근본적으로 방지할 수 있는 최선의 설계를 선택해야 합니다.

**A번이 정답인 이유:**

문서의 맨 앞(Top)은 LLM의 Attention이 가장 강하게 작용하는 위치입니다. 따라서 문서 최상단에 전반적인 핵심 요약(Key-findings summary)을 배치하여 중요한 정보의 인지 가능성을 높이고, 본문에는 명시적 헤더(Explicit headings)를 적용하여 각 섹션의 영역을 구분해 주면 모델이 중간에 위치한 '규제 리스크' 섹션을 놓치지 않고 완벽하게 인지할 수 있습니다.

**오답 분석:**
- Option B (오답): 프롬프팅 지시사항으로 "문서를 두 번 읽으라"고 지시하는 것은 LLM의 Attention 메커니즘을 근본적으로 개선하지 못하며 단순 토큰 낭비를 초래합니다.
- Option C (오답): 누락된 섹션을 무조건 맨 뒤로 보내는 임시방편식 순서 변경은 문서 전체 구조의 논리성을 해치며, 다른 섹션이 다시 중간에 위치하게 되어 새로운 누락을 발생시킵니다.
- Option D (오답): 핵심 요약이나 섹션 헤더 없이 단순히 문서를 둘로 쪼개기만 하는 것은 각 부분 내에서의 정보 파악 구조를 개선하지 못하며, 멀티 문서 전달에 따른 관리 복잡성만 증가시킵니다.

---

# 71번 문제

**1. 문제 원문**

A customer emails a retailer's support agent: 'This is ridiculous, you sent me the wrong size AGAIN,' asking for an exchange for a plain t-shirt order under the standard 30-day exchange policy. The customer has not asked to speak with a human. How should the agent respond?

A) Escalate to a human agent right away, since the customer's tone signals a case too sensitive to resolve directly

B) Ask the customer to confirm they are not requesting a human agent before proceeding with the exchange

C) Acknowledge the customer's frustration and process the exchange now, since the request is within policy and resolvable

D) Process the exchange without commenting on the frustration, treating the emotional tone as irrelevant to the resolution

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

C번: Acknowledge the customer's frustration and process the exchange now, since the request is within policy and resolvable

**정답 및 해설:**

**핵심 개념:** 

AI 가상 상담원(AI Support Agent) 설계 시 공감적 소통(Empathy & Acknowledgement)과 자동화 해결(Automated Resolution)의 조화가 중요합니다. 고객이 감정적 불만을 표출하더라도 요청 내용이 표준 규정 내에서 즉시 해결 가능한 건이라면, 고객의 불만을 공감하며 빠르게 본 과업(교환)을 수행하는 것이 최선의 응답 전략입니다.

**문제 상황 분석:**

- 고객이 이전에 이어 다시 잘못된 사이즈가 배송되어 감정적으로 분노/좌절한 상태입니다.
- 요청 자체는 표준 30일 교환 정책에 부합하는 무지 티셔츠 교환 건으로, 단순하고 즉시 해결 가능합니다.
- 고객이 상담원(사람) 연결을 명시적으로 요구하지는 않았습니다.

**C번이 정답인 이유:**

고객 경험(CX) 측면에서 AI 에이전트는 감정적인 입력을 받았을 때 이를 단순히 무시(D번)하거나, 사람이 처리해야 한다고 지레짐작하여 에스컬레이션(A번)해서는 안 됩니다. 고객의 불만스러운 감정을 먼저 인지하고 공감을 표한 뒤(Acknowledge the frustration), 규정 내에서 해결 가능한 작업(교환)을 지체 없이 즉시 처리하는 것(Process the exchange)이 가장 효과적인 에이전트 대응 방식입니다.

**오답 분석:**
- Option A (오답): 고객이 사람 상담원 연결을 직접 요구하지 않았고, 규칙 기반으로 즉시 해결 가능한 교환 건이므로 바로 불필요하게 사람에게 이관할 필요가 없습니다.
- Option B (오답): 고객에게 굳이 불필요한 확인 절차를 거치게 만들어 불만을 가중시키고 교환 프로세스를 지연시킵니다.
- Option D (오답): 고객의 좌절감을 완전히 무시하고 차갑게 기계적으로 처리하는 것은 에이전트의 공감 능력이 부족해 보여 고객 불만을 악화시킬 수 있습니다.

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

# 73번 문제

**1. 문제 원문**

A market-research pipeline dispatches five research subagents, each of which reads several documents and returns a free-form paragraph summary to a coordinator agent. When the coordinator assembles the final report, reviewers find that several claims can no longer be traced to any specific source. Which change to the subagent output contract would best prevent this loss of provenance?

A) Require each subagent to limit its paragraph to three sentences so the coordinator can quote it directly

B) Require each subagent to append a bibliography of all documents it consulted at the end of its free-form paragraph

C) Require each subagent to raise its temperature setting so summaries retain more of the original document wording

D) Require each subagent to pair every claim with its source URL or document name and a supporting excerpt

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

D번: Require each subagent to pair every claim with its source URL or document name and a supporting excerpt

**정답 및 해설:**

**핵심 개념:** 

멀티 에이전트 시스템(Multi-Agent System)에서 정보의 출처 추적성(Provenance/Traceability)을 유지하려면, 서브에이전트가 생성하는 출력 데이터 계약(Output Contract) 구조에 각 주장(Claim)과 출처(Source/URL/Document), 그리고 이를 뒷받침하는 근거 발췌문(Supporting Excerpt)을 명시적으로 매핑하도록 강제해야 합니다.

**문제 상황 분석:**

- 5개의 서브에이전트가 문서를 읽고 '자유 형식의 문단 요약(Free-form paragraph summary)'으로 코디네이터에게 전달하고 있습니다.
- 코디네이터가 최종 보고서로 취합하는 과정에서 특정 주장의 근거 출처를 찾을 수 없는 출처 손실(Loss of provenance) 문제가 발생했습니다.
- 출처 손실을 방지하기 위해 서브에이전트의 출력 인터페이스/계약(Output contract)을 어떻게 수정해야 하는지 묻고 있습니다.

**D번이 정답인 이유:**

자유 형식의 텍스트 요약은 요약 및 재구성 과정에서 개별 정보 단위와 출처 간의 연결고리가 끊어지기 쉽습니다. 따라서 각 서브에이전트가 내놓는 모든 주장(Claim)마다 출처 문서명/URL과 더불어 이를 증명하는 원문 발췌문(Excerpt)을 1:1로 짝지어(Pair) 전달하도록 출력 스키마/계약을 변경하는 것이 근본적으로 정보의 출처를 명확히 추적할 수 있는 가장 확실한 모범 사례입니다.

**오답 분석:**
- Option A (오답): 문장 수를 제한한다고 해서 개별 주장에 대한 출처 정보가 명시되는 것은 아니므로 출처 손실 문제를 해결할 수 없습니다.
- Option B (오답): 문단 끝에 단순히 참조한 전체 문서 목록(Bibliography)만 덧붙이는 방식은, 문단 내의 '어떤 구체적 주장'이 '어떤 문서'에서 나왔는지 1:1로 추적하기 어렵습니다.
- Option C (오답): Temperature(온도) 설정을 높이면 모델의 무작위성(Creativity)이 증가하여 오히려 원문 표현 보존율이 떨어지고 환각(Hallucination) 위험이 커집니다.

---

# 74번 문제

**1. 문제 원문**

An orchestrator dispatches three research subagents to gather competitor pricing information; each returns only a plain-text paragraph of conclusions with no indication of which source or date the pricing came from. When two subagents report conflicting prices, the orchestrator cannot tell which is current. What change to the subagent output requirements would prevent this?

A) Require each subagent to assign a confidence score to its conclusion without citing where the information came from

B) Require each subagent to attach metadata such as source location and retrieval date in a structured format (e.g., JSON) alongside every reported fact

C) Require each subagent to write a longer, more detailed paragraph explaining its reasoning process for each price found

D) Require the orchestrator to average together the conflicting prices reported by the three subagents

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

B번: Require each subagent to attach metadata such as source location and retrieval date in a structured format (e.g., JSON) alongside every reported fact

**정답 및 해설:**

**핵심 개념:** 

멀티 에이전트 시스템(Multi-Agent Architecture)에서 오케스트레이터가 서브에이전트들의 결과를 정확히 검증하고 합성(Synthesis)하려면, 단순 비구조화 텍스트가 아닌 메타데이터(출처, 검색 날짜 등)가 포함된 구조화된 데이터 계약(Structured Data Contract, 예: JSON)을 통해 데이터를 전달받아야 합니다.

**문제 상황 분석:**

- 3개의 서브에이전트가 경쟁사 가격 정보를 수집하여 출처 및 날짜 정보 없이 단순 비구조화 텍스트(Plain-text)로 결과를 반환했습니다.
- 두 서브에이전트가 서로 다른 가격을 보고했을 때, 오케스트레이터는 정보의 수집 시점(Recency)이나 출처를 파악할 방법이 없어 어떤 가격이 최신 정보인지 판단할 수 없습니다.
- 이러한 정보의 최신성/출처 불분명 문제를 근본적으로 해결하기 위한 서브에이전트 출력 요구사항 변경책을 묻고 있습니다.

**B번이 정답인 이유:**

오케스트레이터가 데이터의 상충(Conflict)을 해결하고 최신 정보를 식별하려면, 서브에이전트가 수집한 모든 사실(Fact) 항목마다 출처 URL/위치와 데이터 수집/검색 날짜(Retrieval Date) 등의 메타데이터를 JSON과 같은 구조화된 형태로 함께 전달하도록 포맷을 강제해야 합니다. 이를 통해 오케스트레이터는 메타데이터의 날짜 값을 프로그램적으로 비교하여 가장 최근 데이터를 정확히 선택할 수 있습니다.

**오답 분석:**
- Option A (오답): 출처와 수집 날짜 없이 환각(Hallucination) 위험이 있는 신뢰도 점수만 부여하는 것은 최신 정보인지 여부를 판단하는 데 도움이 되지 않습니다.
- Option C (오답): 서브에이전트가 더 긴 텍스트로 추론 과정을 설명하더라도 비구조화된 텍스트 특성상 오케스트레이터가 날짜 데이터를 정확히 파싱하여 정렬/비교하기 어렵습니다.
- Option D (오답): 과거 가격과 현재 가격이 상충할 때 이를 단순히 평균 내는 것은 데이터의 정확도를 완전히 심각하게 왜곡하는 잘못된 접근입니다.

---

# 75번 문제

**1. 문제 원문**

A finance team's orchestrator runs six analyst subagents, each producing several paragraphs of exploratory reasoning before stating a conclusion, to build a single executive summary. The summary-writing agent has a strict context budget and currently truncates the last two subagents' output entirely because the first four already filled its budget. What change addresses this?

A) Have each subagent output only its key facts, supporting citations, and a relevance score, dropping the exploratory narrative

B) Have the orchestrator forward only the first four subagents' output and inform the summary-writing agent that the analysis is complete

C) Instruct the summary-writing agent to skip ahead and read the last two subagents' output first, then work backward

D) Increase the number of analyst subagents so each covers a smaller slice of the analysis in equally long reasoning narratives

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

A번: Have each subagent output only its key facts, supporting citations, and a relevance score, dropping the exploratory narrative

**정답 및 해설:**

**핵심 개념:** 

멀티 에이전트 아키텍처(Multi-Agent Architecture)에서 취합 역할을 담당하는 에이전트(Summary-Writing Agent)의 컨텍스트 윈도우(Context Window) 한계를 관리하려면, 서브에이전트들이 생성하는 중간 출력(Intermediate Output)의 정보 밀도를 높여야 합니다. 불필요한 장문의 탐색적 추론 과정을 제거하고 핵심 사실 및 메타데이터만 구조화하여 전달하는 것이 컨텍스트 효율화의 핵심입니다.

**문제 상황 분석:**

- 6개의 분석가 서브에이전트가 각각 결론을 내기 전에 여러 문단의 장문 탐색적 추론(Exploratory Reasoning)을 출력하고 있습니다.
- 요약 작성 에이전트는 제한된 컨텍스트 예산(Strict Context Budget) 때문에 앞선 4개 에이전트의 출력만으로 용량이 채워져, 마지막 2개 에이전트의 출력이 완전히 잘려 나가는(Truncate) 정보 손실이 발생하고 있습니다.
- 모든 서브에이전트의 분석 결과를 누락 없이 종합하면서 컨텍스트 예산 오버플로우를 방지하는 해결책을 구해야 합니다.

**A번이 정답인 이유:**

상위 취합 에이전트에 필요한 정보는 서브에이전트의 장문 추론 과정 전체가 아니라 최종 핵심 결과와 근거입니다. 서브에이전트의 출력 계약(Output Contract)을 변경하여 장문의 탐색적 서술(Exploratory Narrative)을 절삭(Drop)하고, 핵심 사실(Key Facts), 인용 근거(Citations), 연관성 점수(Relevance Score) 등 밀도 높은 핵심 데이터만 반환하도록 설정하면, 요약 에이전트의 컨텍스트 예산 내에서 6개 서브에이전트 전체의 결과를 성공적으로 수집 및 종합할 수 있습니다.

**오답 분석:**
- Option B (오답): 마지막 두 에이전트의 데이터를 의도적으로 버리는 방식은 6개 영역 중 일부 분석 결과를 누락시키므로 완성도 높은 요약 보고서를 만들 수 없습니다.
- Option C (오답): 순서를 뒤바꿔 읽더라도 앞쪽 에이전트의 출력이 대신 잘려 나가게 될 뿐, 전체 컨텍스트 용량 초과 및 정보 잘림 문제를 해결하지 못합니다.
- Option D (오답): 에이전트 수를 늘리고 여전히 장문의 추론 서술을 유지한다면 전체 컨텍스트 토큰 양이 오히려 증가하여 문제가 더욱 악화됩니다.

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

# 77번 문제

**1. 문제 원문**

A long-running research agent uses server-side context compaction (`context_management` with beta header `compact-2026-01-12`) to keep an extended multi-turn investigation within the context window. After several rounds of compaction, the architect notices that citations linking earlier findings to their original source documents have disappeared from the working context, even though the findings themselves survived. What is the most likely cause of this gap?

A) The compaction step condensed earlier turns without explicitly preserving claim-source mappings alongside the findings

B) The model's context window silently shrank between turns, causing the oldest citations to be truncated regardless of compaction

C) Compaction only operates on tool results and never touches any text the model itself generated, including citations

D) Citations are stored in a separate ephemeral cache that is cleared automatically once a conversation exceeds a fixed number of turns

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

A번: The compaction step condensed earlier turns without explicitly preserving claim-source mappings alongside the findings

**정답 및 해설:**

**핵심 개념:** 

서버 측 컨텍스트 압축(Server-side Context Compaction) 기법은 대화 내역이 컨텍스트 한계에 도달했을 때 이전 메시지들을 요약하여 토큰을 절약합니다. 그러나 압축 알고리즘에 핵심 사실과 출처 간 매핑(Claim-Source Mapping)을 보존하도록 프롬프트/설정이 명시되어 있지 않으면, 요약 과정에서 출처 URL, 문서명 등의 미세한 인용 정보가 생략되고 핵심 사실만 남는 정보 손실이 발생할 수 있습니다.

**문제 상황 분석:**

- 리서치 에이전트가 컨텍스트 윈도우를 유지하기 위해 `context_management` 기반 서버 측 압축 기능을 사용 중입니다.
- 여러 번의 압축을 거친 뒤, 조사 사실/결과(Findings) 자체는 컨텍스트에 남아있으나 원본 문서와 연결되는 인용 정보(Citations)만 사라진 현상이 발생했습니다.
- 원본 출처 인용 정보가 누락된 이유를 기술적으로 파악해야 합니다.

**A번이 정답인 이유:**

컨텍스트 압축(Compaction)은 과거 메시지를 요약하여 중요한 정보 위주로 압축하는 과정입니다. 요약 프롬프트나 압축 규칙에서 각 결과에 대한 출처 인용(Claim-Source Mapping)을 명시적으로 유지하도록 지시하지 않으면, 요약 모델은 출처 세부 정보(URL, 인용문, 문서 ID 등)를 불필요한 부연 설명으로 판단하여 절삭하고 주요 사실만 축약하여 남기게 됩니다.

**오답 분석:**
- Option B (오답): API 호출 중에 모델의 컨텍스트 윈도우 크기가 자동으로 줄어드는 동작은 존재하지 않습니다.
- Option C (오답): 서버 측 컨텍스트 압축 기능은 도구 결과뿐만 아니라 대화 내역 전체(모델 출력 포함)를 대상으로 동작합니다.
- Option D (오답): Claude API에는 인용 정보만을 별도로 저장하고 대화 차례 수에 따라 자동 삭제하는 임시 캐시 메커니즘이 없습니다.

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

# 80번 문제

**1. 문제 원문**

A coordinator agent receives structured claim-source mappings from four subagents researching the same topic from different angles. During merging, several claims are near-duplicates reported by multiple subagents with slightly different wording, and the supporting source citations are not identical across the reports. What is the best way to merge these without losing provenance?

A) Rewrite the duplicate claims into a single new sentence that references none of the original subagents' citations

B) Keep only the version of the claim reported by the subagent that produced its output first, discarding the duplicates

C) Consolidate the duplicates into one entry while retaining the full set of source citations that support it

D) Delete all but one occurrence of the claim and drop its source citations, since the claim is now well established

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

C번: Consolidate the duplicates into one entry while retaining the full set of source citations that support it

**정답 및 해설:**

**핵심 개념:** 

멀티 에이전트 시스템(Multi-Agent System)의 정보 종합(Data Synthesis & Merging) 과정에서 가장 중요한 원칙은 출처 추적성(Provenance/Traceability)의 유지입니다. 여러 서브에이전트가 동일하거나 유사한 내용의 주장(Claim)을 각기 다른 출처 문헌을 근거로 제시했을 때, 해당 주장들을 하나로 합치더라도 출처 목록(Source Citations)은 유실 없이 모두 병합·유지(Consolidate)해야 합니다.

**문제 상황 분석:**

- 4개의 서브에이전트가 하나의 주제를 조사하여 구조화된 주장-출처 매핑(Claim-Source Mapping) 데이터를 코디네이터 에이전트에 제출했습니다.
- 병합 과정에서 표현은 약간 다르지만 내용상 거의 동일한 중복 주장들이 발견되었으며, 각 서브에이전트가 제시한 뒷받침 출처 인용 정보도 서로 다릅니다.
- 출처 정보(Provenance)의 손실 없이 이 중복 데이터들을 통합 병합하는 모범 사례를 찾아야 합니다.

**C번이 정답인 이유:**

정보의 신뢰성과 검증 가능성을 담보하는 출처 추적성(Provenance)을 보존하려면, 내용이 같은 중복 주장들을 하나의 대표 엔트리로 통합(Consolidate)하되 각 서브에이전트가 수집했던 모든 출처 인용 목록(Full set of source citations)을 합집합 형태로 보존하여 연결해 주어야 합니다. 이를 통해 데이터의 중복은 제거하면서도 각 주장을 뒷받침하는 다양한 근거 문헌들을 모두 추적 가능한 상태로 유지할 수 있습니다.

**오답 분석:**
- Option A (오답): 인용 정보를 모두 빼고 문장을 재작성하면 출처 추적성(Provenance)이 완전히 손실됩니다.
- Option B (오답): 가장 먼저 출력된 에이전트의 결과만 남기고 나머지 중복을 버리면, 다른 에이전트들이 찾아낸 소중한 출처 인용 정보들이 폐기되어 정보의 풍부함과 추적성이 크게 훼손됩니다.
- Option D (오답): 주장이 충분히 입증되었다는 이유로 출처 인용 정보를 삭제하는 것은 정보 검증 파이프라인에서 출처 손실을 유발하는 치명적인 오류입니다.

---

# 81번 문제

**1. 문제 원문**

Several subagents are running concurrently, each investigating a different module of a large codebase and recording findings as they go. The architect must prevent one subagent's findings from being overwritten by another before the coordinator can reliably aggregate the results. Which scratchpad convention best achieves this?

A) Skip scratchpad files entirely and have each subagent only report findings verbally in its final response.

B) Have all subagents write their findings to one single shared scratchpad file at the same time as they each discover them.

C) Have every subagent overwrite the same fixed scratchpad filename each time it records a newly discovered finding.

D) Give each subagent its own uniquely named scratchpad file, e.g., one per module, and have the coordinator aggregate all files only after all subagents have finished their investigations.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

D번: Give each subagent its own uniquely named scratchpad file, e.g., one per module, and have the coordinator aggregate all files only after all subagents have finished their investigations.

**정답 및 해설:**

**핵심 개념:** 

동시성(Concurrency) 환경의 멀티 에이전트 시스템에서 상태 및 메모리를 관리할 때 발생하는 경쟁 조건(Race Condition)과 데이터 덮어쓰기(Race/Overwrite Bug)를 방지하기 위해서는 격리된 스크래치패드(Isolated Scratchpad) 컨벤션을 사용해야 합니다.

**문제 상황 분석:**

- 여러 서브에이전트가 대규모 코드베이스의 서로 다른 모듈을 동시에(Concurrently) 조사하고 있습니다.
- 코디네이터가 최종 결과를 수집하기 전에 한 에이전트의 결과가 다른 에이전트에 의해 덮어씌워지는(Overwrite) 위험을 차단해야 합니다.
- 병렬 처리 환경에서 안전하게 데이터를 기록하고 취합할 수 있는 스크래치패드 운용 규칙을 구해야 합니다.

**D번이 정답인 이유:**

동시 실행되는 에이전트 환경에서 덮어쓰기 문제를 방지하는 가장 안전한 아키텍처 패턴은 각 서브에이전트에 고유한 이름의 파일/공간(예: 모듈별 독립 스크래치패드 파일)을 할당하는 격리(Isolation) 전략입니다. 모든 서브에이전트가 조사를 마친 후 코디네이터가 고유 파일들을 한 번에 집계(Aggregate)함으로써 데이터 경합 및 덮어쓰기 오류 없이 안정적으로 조사 결과를 통합할 수 있습니다.

**오답 분석:**
- Option A (오답): 작업 중 스크래치패드를 생략하고 최종 텍스트 응답으로만 보고하면, 긴 조사 과정에서 중간 작업 공간이 없어 컨텍스트 한계나 복잡한 조사 과정에서의 정보 유실이 발생할 수 있습니다.
- Option B (오답): 병렬 실행 중인 모든 에이전트가 하나의 단일 공유 파일에 동시에 기록하려고 하면 전형적인 경합 상태(Race Condition)가 발생하여 데이터가 깨지거나 덮어씌워집니다.
- Option C (오답): 모든 에이전트가 고정된 동일 파일명을 덮어쓰도록 하면 이전 에이전트가 기록한 조사 결과가 즉시 삭제되어 문제 상황이 그대로 발생합니다.

---

# 82번 문제

**1. 문제 원문**

A synthesis-stage coordinator combines findings from six research subagents into a final report. Two subagents lost access to their assigned sources partway through. Which output structure best communicates the reliability of the final report to a downstream reader?

A) Annotate coverage so readers see which sections are well-supported by completed sources and which have gaps

B) Append one generic disclaimer noting that some unspecified sources may have been unavailable overall

C) Present all findings as one uniform narrative with no distinction between complete and partial-source sections

D) Omit the two affected sections entirely so the reader only sees content from fully successful subagents

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

A번: Annotate coverage so readers see which sections are well-supported by completed sources and which have gaps

**정답 및 해설:**

**핵심 개념:** 

멀티 에이전트 시스템에서 부분적 실패(Partial Failure)가 발생했을 때 최종 출력물의 신뢰성과 투명성(Transparency & Trust)을 유지하려면, 수집된 정보의 커버리지와 정보 공백(Gaps)을 세분화하여 주석(Annotation) 및 메타데이터로 명시하는 구조적 표현 방식이 필수적입니다.

**문제 상황 분석:**

- 6개의 서브에이전트 중 2개가 작업 중간에 할당된 출처에 대한 접근 권한을 잃어 부분적인 정보만 수집했습니다.
- 종합 담당 에이전트(Coordinator)가 이를 최종 보고서로 병합할 때 후속 독자(Downstream Reader)에게 시스템의 신뢰도를 가장 잘 전달할 수 있는 출력 구조를 선택해야 합니다.

**A번이 정답인 이유:**

일부 에이전트의 데이터 수집 실패로 인해 정보 불균형이 발생한 경우, 결과를 단순히 감추거나 전체를 삭제하는 대신 **어느 영역이 충실히 조사되었고 어느 영역에 정보 공백(Gaps)이 존재하는지 명확히 섹션별로 주석(Annotate coverage)을 달아주는 방식**이 최선의 모범 사례입니다. 독자는 보고서의 완성도와 한계를 정확히 파악하고 데이터 기반의 의사결정을 내릴 수 있습니다.

**오답 분석:**
- Option B (오답): 구체적이지 않은 모호하고 일반적인 면책 조항(Generic disclaimer) 하나만 덧붙이는 것은 독자가 실제로 어떤 정보가 유효하고 부족한지 판단하는 데 도움을 주지 못합니다.
- Option C (오답): 정보가 완벽한 섹션과 불완전한 섹션을 구분 없이 동일한 톤으로 서술하는 것은 독자를 교란하고 불완전한 정보를 무비판적으로 받아들이게 만듭니다.
- Option D (오답): 수집 실패한 2개 섹션을 통째로 삭제해 버리면 보고서의 주제 범위 자체가 왜곡되거나 중요한 항목에 대한 조사 시도 여부조차 알 수 없게 됩니다.

---

# 83번 문제

**1. 문제 원문**

A synthesis agent is producing a final report that combines a subagent's stock price and revenue trend findings with a subagent's qualitative summary of recent news coverage about the same company. Both are converted into the same bulleted list format in the draft report. What change would most improve how this content is rendered?

A) Convert the news coverage into the same bulleted list format as the financial figures so the whole report has one consistent style

B) Combine the figures and news coverage into a single bulleted list that interleaves numbers and narrative sentences item by item

C) Render the financial figures as a table and keep the news coverage as prose, matching each content type to its natural format

D) Convert the financial figures into prose paragraphs so they read alongside the news coverage without a jarring format change

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

C번: Render the financial figures as a table and keep the news coverage as prose, matching each content type to its natural format

**정답 및 해설:**

**핵심 개념:** 

멀티 에이전트 시스템 및 문서 합성(Synthesis) 단계에서 보고서 UX/UI 설계 모범 사례에 관한 문제입니다. 정량적/시계열 데이터(주가, 매출 추세)는 표(Table)로 정렬하여 가독성을 높이고, 정성적 데이터(뉴스 요약, 서술)는 자연스러운 문단/서술문(Prose)으로 표현하여 각 콘텐츠 속성에 최적화된 포맷팅을 적용해야 합니다.

**문제 상황 분석:**

- 종합 에이전트가 정량적 재무 데이터(주가, 매출 추세)와 정성적 데이터(뉴스 요약)를 하나의 보고서로 합성하고 있습니다.
- 현재 초안에서는 서로 다른 성격의 두 데이터가 모두 일괄적으로 글머리 기호 목록(Bulleted List)으로 작성되어 있습니다.
- 가독성과 정보 전달력을 극대화하기 위해 어떤 렌더링 구조 변경이 필요한지 구해야 합니다.

**C번이 정답인 이유:**

수치 및 비교/추세 형태의 구조화된 데이터는 **표(Table)** 형태로 표시할 때 데이터 간 비교와 스캔(Scannability)이 가장 용이합니다. 반면, 컨텍스트와 흐름이 중요한 질적 요약 데이터는 **서술문(Prose)** 형태로 유지할 때 가장 자연스럽게 읽힙니다. 따라서 각 정보의 속성에 적합한 고유 포맷을 일치시키는 것(Matching each content type to its natural format)이 최종 출력물의 품질과 독자 전달력을 향상시키는 최선책입니다.

**오답 분석:**
- Option A (오답): 이미 초안에서 적용하여 가독성이 저하된 일률적 글머리 기호 방식을 그대로 유지하자고 주장하므로 오답입니다.
- Option B (오답): 숫자와 서술형 문장을 하나의 목록 내에서 항목별로 교대로 섞는 방식은 데이터 시각화 흐름을 방해하여 독자에게 더욱 큰 혼란을 줍니다.
- Option D (오답): 정량적 재무 데이터를 서술형 문단으로 변환하면 수치 비교 및 핵심 지표 파악이 훨씬 어려워집니다.

---

# 84번 문제

**1. 문제 원문**

An architect has been running a single Claude Code session for several hours exploring a large monorepo. Early on, the agent correctly identified that OrderService extends a custom TransactionalBase class with a distinctive retry mechanism. Hours later, asked about OrderService again, the agent describes it as 'typically extending a standard base controller with default error handling,' ignoring its earlier finding. What should the architect do going forward to prevent this?

A) Ask the agent to re-read the entire repository from scratch every time a question about a previously discovered class comes up.

B) Have the agent record concrete findings, such as exact class names, in a scratchpad file and consult it before answering.

C) Increase the maximum output token limit for the session so the agent has more room to describe the class in full detail each time it is asked.

D) Switch to a larger model mid-session, since added parameter count restores recall of facts discovered earlier in the transcript.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

B번: Have the agent record concrete findings, such as exact class names, in a scratchpad file and consult it before answering.

**정답 및 해설:**

**핵심 개념:** 

장시간 진행되는 Claude Code 또는 LLM 대화 세션에서는 대화 내역(Context)이 누적되거나 컨텍스트 윈도우 압축(Compaction/Truncation)이 일어나면서 초기에 탐색한 구체적 정보(클래스명, 독자적 로직 등)가 유실되거나 환각(Hallucination)으로 대체될 수 있습니다. 이를 방지하는 대표적인 패턴은 지속성 있는 외부 메모리 역할을 하는 **스크래치패드(Scratchpad) 파일 사용**입니다.

**문제 상황 분석:**

- 아키텍트가 수시간 동안 단일 Claude Code 세션으로 대규모 모노레포를 탐색했습니다.
- 에이전트가 초반에는 `OrderService`가 커스텀 `TransactionalBase` 클래스를 상속한다는 사실을 정확히 파악했습니다.
- 시간이 지난 후 다시 질문했을 때, 컨텍스트 밀림/유실 현상으로 인해 일반적인 기본 컨트롤러를 상속한다는 일반론적인 오답(환각)을 출력했습니다.
- 장기 세션에서 발견된 주요 사실(Fact)의 망각을 방지하는 모범 대처 방안을 찾아야 합니다.

**B번이 정답인 이유:**

에이전트가 대화 중간중간 발견한 구체적이고 중요한 정보(정확한 클래스명, 상속 구조, 특이 로직 등)를 스크래치패드 파일(예: `notes.md` 또는 `.claudecodescratchpad`)에 지속적으로 기록(Record)하고, 향후 답변을 작성하기 전에 해당 파일의 기록을 먼저 확인(Consult)하도록 규칙을 세우면 컨텍스트 윈도우가 압축되거나 길어져도 핵심 지식을 유실 없이 정확하게 유지할 수 있습니다.

**오답 분석:**
- Option A (오답): 이전 발견 지식을 얻을 때마다 수시간 분량의 전체 모노레포를 처음부터 재탐색하는 것은 비효율적이며 토큰 비용 및 지연 시간을 극도로 증가시킵니다.
- Option C (오답): 최대 출력 토큰 제한(Max Output Tokens)은 모델이 한 번에 생성할 수 있는 답변의 길이 한계를 늘려줄 뿐, 컨텍스트에 수용되거나 누락된 과거 입력 기억(Recall) 능력을 회복시켜 주지 못합니다.
- Option D (오답): 더 큰 모델로 전환하더라도 컨텍스트 압축 과정에서 이미 잘려 나갔거나 묻힌 과거의 구체적 사실을 자동으로 복원해주지 못하며, 모델 파라미터 수 증가가 밀려난 대화 기록의 recall을 보장해주지는 않습니다.

---

# 85번 문제

**1. 문제 원문**

A document-search subagent hits an authentication error against a knowledge base and simply returns the string 'search unavailable' to the coordinator. The coordinator has no other information to act on. What is the primary problem with this design, and what should replace it?

A) The generic status is too verbose for the coordinator to parse; shorten it to a bare success or failure boolean flag

B) The generic status hides recovery detail; the subagent should return failure type, what was queried, and any partial results

C) The generic status is fine since coordinators should never see subagent detail; log the auth error only in the subagent trace

D) The generic status correctly shields the coordinator; have the subagent retry silently until the auth error clears

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

B번: The generic status hides recovery detail; the subagent should return failure type, what was queried, and any partial results

**정답 및 해설:**

**핵심 개념:** 

멀티 에이전트 시스템(Multi-Agent Architecture)의 예외 처리 및 오류 복구(Error Handling & Recovery) 설계 모범 사례에 관한 문제입니다. 서브에이전트에서 오류가 발생했을 때 일반적인 텍스트 메시지만 전달하면 상위 오케스트레이터/코디네이터가 오류의 원인을 파악하거나 대체 경로(Fall back)를 선택할 수 없습니다. 따라서 실패 유형(Failure Type), 실행된 쿼리(Queried Content), 부분 결과(Partial Results) 등의 구조화된 진단 메타데이터를 반환해야 합니다.

**문제 상황 분석:**

- 문서 검색 서브에이전트가 지식 베이스 접근 중 '인증 오류(Authentication Error)'를 경험했습니다.
- 에이전트는 코디네이터에게 단순히 `'search unavailable'`이라는 모호한 텍스트 문자열만 반환했습니다.
- 코디네이터는 오류의 구체적인 원인(인증 실패인지, 네트워크 타임아웃인지, 검색어가 잘못되었는지)을 알 수 없어 후속 복구 조치를 취하지 못하고 있습니다.

**B번이 정답인 이유:**

지나치게 모호한 상태 응답(`'search unavailable'`)은 코디네이터가 에러를 복구하고 재시도하거나 다른 대체 서브에이전트를 호출하는 판단을 내리지 못하게 만듭니다(Hides recovery detail). 올바른 시스템 설계에서는 서브에이전트가 **실패의 구체적 유형(Failure Type: e.g., AUTH_ERROR), 당시 실행하려 했던 쿼리 정보(What was queried), 그리고 유효한 경우 부분적 검색 결과(Partial results)**를 구조화된 형태(JSON 등)로 전달해야만 코디네이터가 적절한 자격 증명 갱신, 쿼리 수정, 또는 사용자 알림 등의 유연한 복구 전략을 실행할 수 있습니다.

**오답 분석:**
- Option A (오답): 단순 boolean 플래그(`true`/`false`)로 변경하면 실패의 원인 및 맥락 정보가 더 더욱 상실되어 복구가 불가능해집니다.
- Option C (오답): 코디네이터가 오류 원인을 알지 못하면 시스템 전체가 복구 불능 상태에 빠지므로, 추적 로그에만 오류를 기록하고 코디네이터에게 정보를 숨기는 것은 잘못된 디자인 패턴입니다.
- Option D (오답): 인증 오류(Authentication Error)는 자격 증명이 수정되지 않는 한 단순 무한 재시도(Silent Retry)로 해결되지 않으며, 무한 루프나 토큰/컴퓨팅 자원 낭비를 초래합니다.

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

## 87번 문제

**1. 문제 원문**

Three market-research subagents each report a total addressable market figure for the same industry, but none includes the publication date or methodology of the source they used. The synthesis step cannot tell whether the figures are comparable or which is most current, and the final report cites an outdated figure. What subagent output requirement would have prevented this?

A) Require each subagent to report a single average figure computed across all of the sources it found

B) Require the synthesis step to always prefer whichever figure the subagents reported as the highest

C) Require each subagent to include the source's publication date and methodological context alongside its reported figure

D) Require each subagent to describe in more detail its reasoning process for how it searched for information

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

C번: Require each subagent to include the source's publication date and methodological context alongside its reported figure

**정답 및 해설:**

**핵심 개념:** 

멀티 에이전트 시스템(Multi-Agent Architecture)에서 하위 에이전트(Subagent)의 출력 표준화 및 출처 메타데이터(Publication Date, Methodology 등) 전달의 중요성. 종합 에이전트가 정확한 판단 및 비교 분석을 수행하기 위해서는 하위 에이전트가 데이터 본문과 함께 정량적/정성적 맥락(Context) 메타데이터를 함께 전달해야 합니다.

**문제 상황 분석:**

- 3개의 시장 조사 하위 에이전트가 동일 산업의 총 유효 시장(TAM) 수치를 보고했지만, 출처의 발행 일자 및 연구 방법론을 명시하지 않았음.
- 메타데이터 부재로 인해 종합(Synthesis) 단계에서 데이터 간의 비교 가능성 및 최신성 여부를 판별하지 못함.
- 결과적으로 종합 단계에서 오래된(Outdated) 수치를 최종 보고서에 인용하는 오류가 발생함.

**C번이 정답인 이유:**

문제의 핵심 원인은 하위 에이전트가 수출한 데이터에 "발행 일자(Publication Date)"와 "방법론적 맥락(Methodological Context)"이라는 필수 메타데이터가 누락되었기 때문입니다. 하위 에이전트의 출력 요구사항으로 수치 데이터뿐만 아니라 출처의 발행 일자와 방법론을 함께 제출하도록 제약하면, 종합 단계에서 수치들의 최신성과 비교 가능성을 정확히 검증하여 최신 데이터 및 신뢰할 수 있는 수치를 선택할 수 있습니다.

**오답 분석:**
- Option A (오답): 서로 다른 시점과 방법론으로 산출된 수치들을 단순히 평균 내는 것은 데이터의 왜곡을 심화시키며 최신성을 보장하지 못합니다.
- Option B (오답): 가장 높은 수치를 선택하는 규칙은 데이터의 정확성 및 최신성 판단과 무관하며, 편향되거나 잘못된 수치를 채택할 위험을 높입니다.
- Option D (오답): 에이전트 자체의 "검색 추론 과정"보다는 찾은 "데이터 원본의 출처 정보(발행일, 방법론)"를 제공하는 것이 종합 단계의 수치 비교에 직접적인 도움이 됩니다.

---

## 88번 문제

**1. 문제 원문**

A legal-research orchestrator combines the outputs of eight subagents, each of which returns several paragraphs of step-by-step reasoning plus their conclusion. The combined output exceeds what the downstream drafting agent can process within its allotted context budget, forcing it to drop some subagent findings entirely before drafting. What change addresses this?

A) Instruct the orchestrator to forward only the subagent outputs that arrive first, discarding later ones

B) Increase the number of subagents so each one covers a narrower topic while still returning full reasoning chains

C) Have the drafting agent read the subagent outputs in two passes to catch findings it missed the first time

D) Modify the subagents to return only key facts, citations, and relevance scores instead of their full reasoning narratives

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

D번: Modify the subagents to return only key facts, citations, and relevance scores instead of their full reasoning narratives

**정답 및 해설:**

**핵심 개념:** 

멀티 에이전트 오케스트레이션(Multi-Agent Orchestration) 및 컨텍스트 예산 관리(Context Window / Token Budget Management). 하위 에이전트가 생성하는 비정형 긴 추론 텍스트(Reasoning Narrative)를 방대하게 결합할 경우 후속(Downstream) 에이전트의 컨텍스트 용량을 초과하므로, 하위 에이전트의 출력 스키마를 축약된 구조화 정보(핵심 사실, 인용, 관련성 점수 등)로 제한하는 '출력 최적화'가 필수적입니다.

**문제 상황 분석:**

- 오케스트레이터가 8개의 법률 조사 하위 에이전트의 출력을 합쳐 후속 작성 에이전트로 전달함.
- 각 하위 에이전트가 전체 단계별 추론 과정(여러 단락)과 결론을 모두 출력하여 전체 토큰량이 극도로 늘어남.
- 후속 작성 에이전트의 할당된 컨텍스트 예산(Context Budget)을 초과함에 따라 일부 하위 에이전트의 결과가 완전히 누락(Drop)되는 현상이 발생함.

**D번이 정답인 이유:**

컨텍스트 윈도우 초과로 인한 정보 손실을 막는 가장 근본적인 해결책은 각 하위 에이전트가 생성하는 출력의 토큰 밀도를 최적화하는 것입니다. 장문의 추론 서술(Full Reasoning Narratives) 대신 작성에 필요한 핵심 사실(Key Facts), 인용 문헌(Citations), 관련성 점수(Relevance Scores)와 같은 정제된 정보만 반환하도록 하위 에이전트를 수정하면, 전체 토큰 소비량을 획기적으로 줄여 컨텍스트 예산 내에서 8개 에이전트의 모든 조사 결과를 유실 없이 전달할 수 있습니다.

**오답 분석:**
- Option A (오답): 나중에 도착한 하위 에이전트의 조사를 완전히 폐기(Discard)하는 것은 유용한 법률 분석 정보를 유실시키므로 적절한 해결책이 아닙니다.
- Option B (오답): 에이전트 수를 늘려도 여전히 긴 전체 추론 사슬(Full Reasoning Chains)을 반환한다면 결합된 전체 토큰량은 줄어들지 않거나 오히려 증가하여 컨텍스트 초과 문제를 악화시킵니다.
- Option C (오답): 작성 에이전트가 두 번 나누어 읽는다(Two passes) 해도, 단일 호출 시 한 번에 수용할 수 있는 입력 컨텍스트 한계 및 아키텍처 구조 자체의 한계를 해결해주지 못하며 정보를 부분적으로 누락하게 됩니다.

---

## 89번 문제

**1. 문제 원문**

A patient messages a healthcare scheduling assistant in a clearly irritated tone about needing to reschedule a routine appointment with no clinical urgency. The assistant can complete the rescheduling directly, and the patient has not asked to speak with a staff member. What should the assistant do?

A) Reschedule the appointment without acknowledging the tone, treating it as unrelated to completing the request directly.

B) Ask the patient to confirm they don't want to speak with a staff member before proceeding with the reschedule.

C) Escalate to a staff member immediately, since the irritated tone suggests the situation needs human handling.

D) Acknowledge the patient's frustration, signal that the rescheduling can be handled right away, and also offer to escalate to a staff member if the patient prefers.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

D번: Acknowledge the patient's frustration, signal that the rescheduling can be handled right away, and also offer to escalate to a staff member if the patient prefers.

**정답 및 해설:**

**핵심 개념:** 

대화형 AI 어시스턴트(AI Agent)의 감정 공감(Empathy/Tone Acknowledgment), 작업 수행 및 인간 에스컬레이션(Human Escalation) 제공에 관한 모범 사례. AI는 고객의 감정적 불편을 인지·공감(Acknowledge)함과 동시에 본인이 직접 수행 가능한 요청을 효율적으로 처리할 준비가 되었음을 알리고, 필요한 경우 인간 직원 연결 옵션(Offer to escalate)을 자율적 선택권으로 제시하는 균형 잡힌 커뮤니케이션 스타일을 취해야 합니다.

**문제 상황 분석:**

- 환자가 정기 예약 변경 문제로 짜증이 난 어조(Irritated tone)로 메시지를 보냄 (임상적 긴급성 없음).
- AI 어시스턴트는 예약 변경 작업을 시스템상 직접 처리할 능력이 있음.
- 환자가 상담 직원과의 연결을 명시적으로 요구하지는 않은 상태임.

**D번이 정답인 이유:**

대화형 AI 시스템 커뮤니케이션 설계 관점에서, 사용자(환자)의 감정을 무시하지 않고 공감적 어조로 먼저 인지(Acknowledge)하는 것이 중요합니다. 또한 임상적 긴급성이 없고 본인이 직접 수행 가능한 작업을 신속히 처리할 수 있음을 안내하여 유저 편의성을 높여야 합니다. 이와 동시에, 짜증이 난 사용자가 원할 경우 언제든 사람이 처리하는 에스컬레이션 경로(Human Escalation Path)를 제공함으로써 환자의 선택권을 보장하는 D번 조치가 가장 이상적이고 정교한 답변입니다.

**오답 분석:**
- Option A (오답): 환자의 감정 상태나 어조를 완전히 무시하고 불친절하게 로봇처럼 요청만 처리하는 것은 사용자 경험(UX) 측면에서 유저의 불만을 더욱 가중시킬 수 있습니다.
- Option B (오답): 불필요하게 묻는 과정을 추가하여 환자가 원하지도 않은 불필요한 절차적 불확실성을 더하게 되므로 비효율적입니다.
- Option C (오답): 임상적 긴급성이 없고 AI가 직접 처리할 수 있으며 환자가 직원 연결을 요청하지 않았음에도 무작위로 직원에게 이관(Escalate)하는 것은 무분별하게 인적 자원을 소모하고 원스톱 처리를 지연시킵니다.

---

## 90번 문제

**1. 문제 원문**

A brokerage customer messages support: 'I want a real person, not a bot,' regarding a routine request to reset their account password. The agent has not yet attempted any troubleshooting. What is the appropriate response?

A) Escalate to a human agent right away, honoring the request without first attempting to resolve it

B) Ask the customer to explain why a human agent is preferred before deciding how to proceed

C) Offer to reset the password immediately and escalate only if the customer repeats the request afterward

D) Walk the customer through the password reset steps first, since the process is quick and routine

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

A번: Escalate to a human agent right away, honoring the request without first attempting to resolve it

**정답 및 해설:**

**핵심 개념:** 

고객 지원 AI 어시스턴트(AI Agent)의 사용자 의사 존중(User Preference/Intent Respect) 및 인간 상담원 에스컬레이션(Human Escalation) 원칙. 사용자가 "사람 상담원(Human/Real Person)"과의 연결을 명시적·직접적으로 요구하는 경우, 작업의 단순성이나 AI의 처리 가능 여부와 상관없이 사용자의 선택을 즉시 존중하여 에스컬레이션을 수행해야 합니다.

**문제 상황 분석:**

- 증권사 고객이 비밀번호 재설정이라는 일반적이고 간단한 요청을 하였음.
- 고객이 메시지로 "봇이 아닌 실제 사람을 원한다('I want a real person, not a bot')"라고 명시적으로 표현함.
- 어시스턴트가 아직 어떠한 문제 해결도 시도하지 않은 상태에서 최선의 조치를 결정해야 함.

**A번이 정답인 이유:**

고객 지원 및 대화형 AI 시스템 가이드라인의 최우선 규칙 중 하나는 사용자가 명확하게 사람 상담원 연결을 요청할 때 이를 거부하거나 우회하려 하지 않는 것입니다. 비록 요청된 작업(비밀번호 재설정)이 단순하고 자동화 처리가 가능할지라도, 사용자가 '사람'과의 대화를 직접 지목하여 요구한 경우 AI가 자체적으로 처리를 시도하거나 설득하려 들지 않고, 요구사항을 즉시 받아들여 사람 상담원에게 이관(Escalate)하는 것이 올바른 대응 방식입니다.

**오답 분석:**
- Option B (오답): 왜 사람을 선호하는지 이유를 묻고 따지는 것은 이미 불만을 표시한 고객에게 불필요한 마찰과 거부감을 유발합니다.
- Option C (오답): 고객이 명시적으로 사람을 원한다고 요구했음에도 이를 무시하고 AI가 먼저 처리를 제안하는 것은 사용자의 직접적인 의사를 위반하는 응답입니다.
- Option D (오답): 절차가 간단하다는 이유로 고객의 사람 상담원 연결 요청을 무시하고 단계 안내를 강행하는 것은 고객 경험(UX) 관점에서 가장 자제해야 할 거부적 태도입니다.

---

## 91번 문제

**1. 문제 원문**

An SRE assistant aggregates logs and root-cause notes from four different services into one long postmortem draft, arranged in the order the services were investigated. The final postmortem consistently omits the root cause identified from the second service investigated, which sits in the middle of the aggregated text. What should the assistant change about how it structures the aggregated input?

A) Combine all four services' notes into a single unbroken paragraph to reduce the total document length

B) Append a note at the very end of the document reminding the model to check the middle sections carefully

C) Investigate the services in a different order each time so the root cause is not always found by the second service

D) Open the aggregated input with a brief summary of each service's root cause, then present detailed notes under clear headings

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

D번: Open the aggregated input with a brief summary of each service's root cause, then present detailed notes under clear headings

**정답 및 해설:**

**핵심 개념:** 

LLM의 "Lost in the Middle" 현상 완화 및 프롬프트 구조화(Prompt Structuring & Context Priming). 긴 컨텍스트 윈도우 내에서 중간에 위치한 정보일수록 모델의 정보 인지율과 회상률(Recall)이 저하되는 경향이 있습니다. 이를 극복하기 위해 주요 핵심 정보 요약(Summary)을 프롬프트 최상단(Front-loading)에 위치시키고, 상세 본문은 명확한 헤딩(Headings) 및 구조화된 마크다운을 적용해 명시도를 높여야 합니다.

**문제 상황 분석:**

- SRE 어시스턴트가 4개 서비스의 로그와 메모를 긴 단일 텍스트 형태로 연결하여 입력으로 사용함.
- 텍스트 중간(Middle)에 위치한 "두 번째 서비스의 근본 원인" 정보가 결과물에서 지속적으로 누락(Omit)되는 문제 발생.
- 모델이 긴 맥락 중앙의 정보에 주목하지 못하는 'Lost in the Middle' 현상에 직면함.

**D번이 정답인 이유:**

대형 언어 모델(LLM)은 입력 컨텍스트의 맨 앞(Beginning)과 맨 뒤(End) 정보를 가장 잘 인지하고, 중간 섹션의 정보는 주의(Attention) 손실로 인해 놓치기 쉽습니다. 입력 데이터의 최상단에 각 서비스의 근본 원인 핵심 요약(Brief summary)을 먼저 배치(Front-loading)하고, 명확한 헤딩(Headings) 구분을 적용하여 문맥 구조를 체계화하면 모델의 정보 회상 능력이 대폭 향상되어 중간에 위치한 정보가 누락되는 현상을 완벽히 해결할 수 있습니다.

**오답 분석:**
- Option A (오답): 모든 문단을 줄바꿈 없이 하나의 단락(Single unbroken paragraph)으로 합치면 구분이 더욱 불분명해져 모델이 중간 정보를 파악하기 더 어려워집니다.
- Option B (오답): 문서 끝에 "중간 섹션을 주의 깊게 보라"는 단순 주의문 문구를 추가하는 것만으로는 구조적인 Context Attention 누락을 근본적으로 해결하지 못합니다.
- Option C (오답): 조사 순서를 매번 임의로 바꾸는 것은 근본 원인을 수집하는 문제 구조 자체를 개선하지 못하며, 우연히 중간에 위치하는 다른 서비스의 원인이 다시 누락되는 미봉책에 불과합니다.

---

## 92번 문제

**1. 문제 원문**

During a long exploration session, an architect notices the context window filling with verbose file dumps and command output from the current phase, and the key findings from that phase have not yet been written anywhere durable. The architect wants to reclaim context space before continuing. What should they do first?

A) Immediately compact the conversation without recording anything, trusting the details stay accessible afterward.

B) Persist the key findings from the current phase to a scratchpad file, and only then compact the conversation to reclaim space.

C) End the current session entirely and start a brand new one with no reference to any prior exploration work at all.

D) Continue exploring without compacting anything or recording findings until the session eventually runs entirely out of context space.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

B번: Persist the key findings from the current phase to a scratchpad file, and only then compact the conversation to reclaim space.

**정답 및 해설:**

**핵심 개념:** 

컨텍스트 윈도우 관리 및 정보 영속성(Context Window Management & Data Persistence). 세션 압축(Compacting/Summarization) 시 장황한 파일 덤프나 출력 데이터의 상세 정보가 손실(Information Loss)될 수 있으므로, 압축을 실행하기 전에 핵심 결과물을 외부 지속성 파일(Scratchpad / Documentation)에 먼저 저장하는 것이 필수적인 개발 모범 사례입니다.

**문제 상황 분석:**

- 긴 탐색 세션 중 파일 덤프 및 명령어 출력으로 인해 컨텍스트 윈도우가 가득 차는 현상 발생.
- 현재 단계에서 얻은 중요 조사 및 발견 사항(Key findings)이 외부 파일이나 저장소에 아직 기록되지 않음.
- 컨텍스트 공간을 재확보(Reclaim)하기 위해 대화 압축 등의 조치가 필요한 상황.

**B번이 정답인 이유:**

대화를 압축(Compact)하거나 컨텍스트를 정리할 때 AI 모델은 과거 메시지의 디테일을 요약하면서 핵심 정보를 누락할 위험이 있습니다. 따라서 컨텍스트 공간을 재확보하기 전, 현재 단계에서 파악한 중요한 결과물을 스크래치패드 파일(Scratchpad File)이나 지속 가능한 파일 형태(Durable Persistence)로 먼저 기록한 뒤에 대화를 압축해야 정보 손실 없이 안전하게 작업을 이어나갈 수 있습니다.

**오답 분석:**
- Option A (오답): 아무것도 기록하지 않고 대화를 압축해 버리면 핵심 세부 정보가 손실되어 압축 이후 다시 복구하거나 참고하기 어려워집니다.
- Option C (오답): 이전 탐색 작업 결과를 전혀 참고하지 않은 채 세션을 종료해 버리면 지금까지 진행한 탐색 데이터가 모두 유실되고 작업 효율성이 저하됩니다.
- Option D (오답): 컨텍스트 공간이 완전히 고갈될 때까지 방치하는 것은 AI의 환각(Hallucination) 유발 및 응답 성능 저하로 이어져 작업을 정상적으로 진행할 수 없게 만듭니다.

---

## 93번 문제

**1. 문제 원문**

An architect is exploring a 200,000-line codebase to produce a high-level dependency map for a migration plan. Some tasks involve exhaustively searching many directories and generating large volumes of matched output; other tasks involve synthesizing an overall migration strategy from what was found. How should responsibility be split between the main agent and subagents?

A) Delegate the high-level synthesis of the migration strategy to a subagent while the main agent performs the exhaustive searches.

B) Have the main agent perform the exhaustive multi-directory searches itself so it retains every matched result in its own context.

C) Avoid any delegation and keep the entire investigation, including all search output, within a single agent's context throughout.

D) Delegate the exhaustive searches that generate verbose output to subagents, and let the main agent synthesize their summaries.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

D번: Delegate the exhaustive searches that generate verbose output to subagents, and let the main agent synthesize their summaries.

**정답 및 해설:**

**핵심 개념:** 

멀티 에이전트 패턴(Subagent Delegation Pattern) 및 메인 에이전트의 컨텍스트 관리(Context Budget Management). 대규모 탐색/검색 시 발생하는 방대한 토큰(Verbose Output)을 메인 에이전트에 쌓아두면 오버헤드와 정보 누락(Lost in the middle)이 발생합니다. 하위 에이전트에게 덤프성 탐색 작업을 위임하고 정제된 요약(Summary)만 오케스트레이터/메인 에이전트에 전달하는 분할 방식이 최선의 아키텍처 패턴입니다.

**문제 상황 분석:**

- 20만 줄 분량의 대규모 코드베이스에서 마이그레이션 전략을 수립하기 위한 탐색을 진행함.
- 여러 디렉토리의 단순/철저 검색(Exhaustive Searches)은 대량의 장황한 매칭 출력(Verbose Output)을 유발함.
- 메인 에이전트는 검색 결과들을 통합 및 분석하여 전체 마이그레이션 전략을 종합(Synthesis)해야 함.

**D번이 정답인 이유:**

메인 에이전트가 장황한 로그 및 대량의 파일 검색 출력을 직접 실행하고 유지하게 되면 메인 에이전트의 컨텍스트 윈도우가 불필요한 토큰으로 가득 차게 되며, 고수준의 전략 수립 성능이 크게 저하됩니다. 대량의 탐색 작업을 하위 에이전트(Subagents)들에게 위임하여 분산 처리하게 하고, 메인 에이전트는 하위 에이전트들이 도출해 낸 정제된 요약 결과(Summaries)만 받아 전략 종합에 집중하도록 책임을 분할하는 것이 올바른 디자인 패턴입니다.

**오답 분석:**
- Option A (오답): 역할이 거꾸로 바뀌었습니다. 토큰 소모가 큰 저수준의 검색 작업을 하위 에이전트에 위임하고, 메인 에이전트가 고수준의 전체 마이그레이션 전략을 종합해야 합니다.
- Option B (오답): 메인 에이전트가 모든 검색 출력을 직접 보유하도록 만들면 컨텍스트 오버플로우가 유발되어 시스템 성능 및 정확도가 크게 떨어집니다.
- Option C (오답): 위임을 피하고 단일 에이전트 내에서 모든 출력을 관리하면 컨텍스트 예산 한계를 빠르게 초과하며 정보 손실이 발생합니다.

---

## 94번 문제

**1. 문제 원문**

Phase 1 of a codebase exploration used several subagents to map the authentication module's structure. The architect is now ready to start phase 2, spawning subagents to investigate how other services integrate with authentication. What should happen between the two phases to keep phase 2 grounded in phase 1's discoveries?

A) Forward the complete raw transcripts of every phase 1 subagent directly into each phase 2 subagent's initial prompt.

B) Synthesize the phase 1 findings into a concise summary and inject that summary into each phase 2 subagent's initial prompt.

C) Start phase 2 subagents with no reference to phase 1 and let them rediscover the authentication module's structure independently.

D) Wait until a phase 2 subagent asks a clarifying question before providing any information about the authentication module.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

B번: Synthesize the phase 1 findings into a concise summary and inject that summary into each phase 2 subagent's initial prompt.

**정답 및 해설:**

**핵심 개념:** 

단계별 멀티 에이전트 핸드오프(Sequential Multi-Agent Handoff & Context Synthesis). 다단계 에이전트 워크플로우에서 이전 단계의 결과물을 다음 단계 에이전트에 전달할 때는 전체 실행 대화록(Raw Transcript)을 그대로 넘겨 컨텍스트 윈도우를 낭비하지 않고, 핵심 발견 사항을 간결하게 종합·요약(Concise Summary)하여 프롬프트로 주입하는 것이 컨텍스트 절약 및 맥락 유지의 최적 모범 사례입니다.

**문제 상황 분석:**

- 1단계에서 여러 하위 에이전트가 인증 모듈의 구조를 성공적으로 탐색 및 분석함.
- 2단계에서는 타 서비스와 인증 모듈의 연동 관계를 분석하는 새로운 하위 에이전트들을 실행하려 함.
- 1단계에서 알아낸 정보를 2단계 에이전트들이 정확히 인지한 상태에서(Grounded) 탐색을 이어가도록 단계를 연결해야 함.

**B번이 정답인 이유:**

2단계 에이전트들이 1단계 탐색 결과를 바탕으로 작업을 시작할 수 있도록 하려면, 1단계에서 얻은 주요 결과물을 간결하게 요약(Synthesize into a concise summary)한 뒤 이를 2단계 하위 에이전트의 초기 프롬프트(Initial Prompt)에 주입해 주어야 합니다. 이렇게 하면 토큰 낭비를 최소화하면서도 필요한 핵심 배경지식을 완벽히 전달할 수 있습니다.

**오답 분석:**
- Option A (오답): 1단계 하위 에이전트들의 모든 원본 대화록(Raw Transcripts)을 그대로 주입하면 엄청난 양의 불필요한 토큰이 2단계 에이전트의 컨텍스트 윈도우를 차지하여 비용과 연산 오버헤드를 유발하고 주의 집중력(Attention)을 저하시킵니다.
- Option C (오답): 1단계 결과를 전혀 전달하지 않으면 2단계 에이전트들이 동일한 인증 모듈 구조를 중복하여 다시 탐색해야 하므로 심각한 자원 낭비가 발생합니다.
- Option D (오답): 하위 에이전트가 질문을 할 때까지 무작정 기다리는 수동적 방식은 초기 작업 수행 시 잘못된 가정(Hallucination)을 바탕으로 탐색을 진행하게 만들어 작업 효율을 극도로 떨어뜨립니다.

---

## 95번 문제

**1. 문제 원문**

A document-analysis subagent is reviewing internal financial filings and finds that two spreadsheets report different totals for the same quarter's operating expenses. The subagent's task is to hand its findings off to a coordinator before final synthesis occurs. What should the subagent do with the conflicting values it found?

A) Omit the operating expense figure entirely from its output since the two spreadsheets disagree with each other

B) Recompute the operating expense total itself from first principles so the coordinator receives one authoritative number

C) Include both values with clear annotation of which spreadsheet each came from, leaving reconciliation to the coordinator

D) Report only the value from the spreadsheet with the more recent file modification timestamp, omitting the other

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

C번: Include both values with clear annotation of which spreadsheet each came from, leaving reconciliation to the coordinator

**정답 및 해설:**

**핵심 개념:** 

멀티 에이전트 아키텍처에서의 책임 분리(Separation of Concerns) 및 충돌 보고(Conflict Reporting). 서브에이전트(Subagent)의 핵심 역할은 충돌하는 데이터가 발견되었을 때 독자적으로 판단하여 정보를 삭제하거나 자의적으로 통합하는 것이 아니라, 출처 정보(Annotation)와 함께 상충되는 데이터를 투명하게 수집하여 상위 에이전트(Coordinator/Orchestrator)에 인계하는 것입니다.

**문제 상황 분석:**

- 문서 분석 하위 에이전트가 동일 분기 영업 비용에 대해 서로 다른 수치를 보고하는 두 개의 스프레드시트를 발견함.
- 하위 에이전트의 명확한 역할은 최종 종합 단계 전에 결과를 코디네이터(Coordinator)에게 전달하는 것임.
- 발견된 상충되는 수치(Conflicting values)를 하위 에이전트 수준에서 어떻게 처리해야 하는지가 핵심 문제임.

**C번이 정답인 이유:**

하위 에이전트(Subagent)는 데이터를 수집 및 1차 분석하고 출처를 기록하는 역할을 담당하며, 상충되는 데이터의 최종 조정 및 의사결정(Reconciliation & Synthesis)은 상위 조율자(Coordinator) 에이전트의 역할입니다. 따라서 하위 에이전트는 두 수치를 모두 기록하고, 각각 어느 파일에서 유래했는지 명확한 출처 주석(Clear annotation)을 달아 코디네이터가 판단할 수 있도록 전달해야 합니다.

**오답 분석:**
- Option A (오답): 불일치가 발생했다고 해서 중요 재무 데이터를 완전히 누락하는 것은 필요한 정보의 유실을 초과 유발합니다.
- Option B (오답): 하위 에이전트가 부여된 권한을 넘어 임의로 데이터를 재계산하여 단일 수치로 만드는 것은 환각(Hallucination)이나 잘못된 정보 왜곡을 초과 초래할 수 있습니다.
- Option D (오답): 단순히 파일 수정 시간(Timestamp)만을 기준으로 임의로 한 쪽 수치를 버리는 것은 검증되지 않은 가정을 바탕으로 한 위험한 데이터 손실 조치입니다.

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

---

## 101번 문제

**1. 문제 원문**

A clinic intake assistant summarizes a long patient conversation every few exchanges. After several rounds, the running summary says "patient has some allergies and wants an appointment soon," even though the original messages specified a penicillin allergy and a requested appointment date of the 22nd. What should the assistant do differently?

A) End every single conversation by asking the patient to confirm their allergy and requested appointment date one final time

B) Maintain a persistent facts block listing the specific allergy and requested date, included in every prompt outside the summary

C) Store the full unsummarized transcript for later manual review by clinic staff instead of using any summary

D) Summarize the conversation less frequently so the allergy and date have more turns before being condensed

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

B번: Maintain a persistent facts block listing the specific allergy and requested date, included in every prompt outside the summary

**정답 및 해설:**

**핵심 개념:** 

상태 유지 및 대화형 메모리 관리(State Management & Persistent Facts Block). 지속적인 대화 축약(Iterative Summarization) 과정에서는 페니실린 알레르기, 특정 날짜와 같은 세부적인 임상 데이터가 반복 요약 과정에서 일반화되거나 정보 손실(Information Loss)이 발생하기 쉽습니다. 이를 방지하기 위해 일반 요약 영역과 분리된 별도의 영속성 데이터 영역(Persistent State/Facts Block)을 두어 중요 정보를 프롬프트 내에 항상 유지해야 합니다.

**문제 상황 분석:**

- 접수 어시스턴트가 매 턴마다 환자와의 대화를 요약(Running Summary)함.
- 당초 환자는 "페니실린 알레르기"와 "22일 예약"이라는 구체적이고 중요한 정보를 제공함.
- 수차례의 지속적 요약 단계를 거치면서 "몇몇 알레르기", "곧 예약"처럼 중요 사실 정보가 모호하게 유실·왜곡됨.

**B번이 정답인 이유:**

대화 요약(Summarization) 기법은 토큰 절약에 유용하지만, 반복 추출 시 디테일이 탈락하는 단점이 있습니다. 의료 정보와 같이 절대로 손실되어서는 안 되는 구조화된 핵심 사실(Specific Facts)은 반복해서 요약되는 대화 텍스트(Summary context)에 맡기지 않고, 별도의 구조화된 **영속적 팩트 블록(Persistent Facts Block)**에 저장하여 매 프롬프트 실행 시 요약문 바깥에 독립된 맥락으로 계속 주입(Inject)하는 방식으로 설계해야 정밀도를 유지할 수 있습니다.

**오답 분석:**
- Option A (오답): 사용자에게 계속 재확인을 요청하는 것은 대화 UX를 크게 저해하며, 시스템 내부적인 정보 손실 문제를 근본적으로 해결하지 못합니다.
- Option C (오답): 요약 기능을 아예 폐기하고 전체 원본 대화록을 저장해 사람이 일일이 검토하게 하는 것은 AI 접수 어시스턴트 자동화의 도입 목적에 부합하지 않습니다.
- Option D (오답): 요약 빈도를 낮추는 것은 압축 시점만 미룰 뿐, 결국 축약이 일어나는 순간 정보가 유실되는 근본 원인을 해결하지 못합니다.
