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

**어려운 이유** [원칙이 깨지는 예외, 덜 틀린 답 고르기] — 2번(86번)과 똑같이 "사람 연결해 달라"는 명시적 요청인데 답이 정반대라 혼란스럽다. 실제 변별 기준은 "명시적 요청 여부"가 아니라 **요청 뒤의 작업이 판단·조사가 필요한가**이다. 이 문제는 요금이 정당한지 확인이 필요한 분쟁 사안이므로, 먼저 설명·해결을 시도하고 반복 요청 시에만 에스컬레이션하는 것이 정답이다.

**1. 문제 원문**

A customer contacts Anthropic support about a $45 API overage charge and says: "I don't want to discuss this with a bot, connect me to a human agent right now." The support agent has not yet reviewed the account. According to Anthropic's recommended support approach, what should the agent do?

> (문제 원문의 "Anthropic's recommended support approach"라는 표현은 실제 공식 문서에 근거한 것이 아니라 출제자가 만든 가상의 전제이다 — 아래 해설 참고.)

A) Review the account's usage history and attempt to resolve the overage charge before responding to the customer's escalation request

B) Escalate the conversation to a human agent immediately, without first investigating the overage charge

C) Ask the customer to first explain why they don't want to work with an automated system before escalating

**D) Offer to explain the overage charge in detail, attempt to resolve it, and escalate to a human only if the customer repeats the request or the issue remains unresolved**

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: D번**

**정답 및 해설:**

**핵심 개념:** 

"명시적으로 사람 연결을 요청하면 무조건 즉시 에스컬레이션"이라는 단순 규칙은 이 문제 세트 전체를 관통하지 않습니다(2번 문제 참고: 같은 명시적 요청인데 답이 다름). 실제 규칙은 **판단이나 조사가 필요하면 LLM이 먼저 시도한다**입니다. 이 문제의 요금 분쟁은 청구가 정당한지 확인·설명이 필요한 사안, 즉 판단·조사가 필요한 사안이므로 이 규칙이 적용됩니다: LLM이 먼저 계정을 확인하고 요금을 설명·해결 시도(Attempt to resolve)한 뒤, 그럼에도 고객이 반복 요청하거나 문제가 해결되지 않을 때 비로소 사람 상담원에게 이관하는 것이 올바른 흐름입니다.

**문제 상황 분석:**

- 고객이 API 초과 청구 요금에 대해 다이렉트로 사람 상담원 연결을 강력하게 요구하며 봇과의 대화를 거부했습니다.
- 지원 에이전트(AI 서포트 시스템)는 아직 계정 조사를 시작하지 않은 상태입니다.
- 요금이 정당한지 판단·조사가 필요한 사안에서 AI가 취해야 할 대응을 판단해야 합니다.

**D번이 정답인 이유:**

이 문제 세트가 기대하는 것은 Anthropic이 문서로 공표한 특정 절차가 아니라, 일반적인 CX/에스컬레이션 설계 상식입니다: 청구가 정당한지 확인·설명이 필요한 사안은 판단·조사가 필요하므로, 먼저 계정을 검토하고 설명·해결을 시도(Attempt to resolve)한 뒤, 그럼에도 고객이 반복 요청하거나 문제가 해결되지 않을 때 사람 상담원에게 이관하는 것이 합리적인 흐름입니다.

**오답 분석:**
- Option A (오답): 에스컬레이션 요청에 전혀 응답하지 않은 채 조사부터 진행하는 것은 고객과의 커뮤니케이션을 무시하므로 올바르지 않으며, 조사 후 어떻게 이관 절차를 밟는지에 대한 완전한 지원 워크플로우를 담고 있지 않습니다.
- Option B (오답): 판단·조사가 필요한 사안임에도 AI가 계정 확인이나 해결 시도를 전혀 거치지 않은 상태에서 즉시 사람 상담원에게 넘기는 것은 불필요한 인계입니다.
- Option C (오답): 봇과 대화하기 싫은 이유를 설명하라고 고객에게 요구하는 것은 고객 여정에 마찰(Friction)만 가중시키는 부적절한 대응 방식입니다.

> 참고: Claude Platform Docs의 "Customer support agent" 가이드에는 에스컬레이션 정확도(escalation accuracy) 목표치 같은 평가 지표만 있을 뿐, "명시적 요청 시 즉시 에스컬레이션" 같은 절차 규정은 명시되어 있지 않다. 즉 이 문제의 근거는 Anthropic 공식 정책이라기보다 일반적인 지원 설계 원칙에 가깝다.

---

## 2번 문제 (원본 86번)

**어려운 이유** [원칙이 깨지는 예외, 유사 현상 구분] — 1번(66번)과 표면적으로 동일한 "명시적 사람 요청" 상황인데 답이 정반대다. 차이는 요청 뒤 작업의 성격에 있다: 이 문제의 비밀번호 재설정은 판단·조사가 전혀 필요 없는 **즉시 처리 가능한 단순 작업**이므로, "먼저 시도해보고" 식의 완충 없이 요청 그대로 즉시 에스컬레이션하는 것이 정답이다. C(먼저 처리 후 반복 시 에스컬레이션)가 1번의 정답 패턴을 그대로 끌고 와 매력적으로 보이지만, 여기서는 그 패턴이 깨진다.

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

이 역시 Anthropic이 문서로 규정한 절차라기보다 일반적인 CX 설계 상식으로 이해하는 것이 정확합니다: 요청된 작업(비밀번호 재설정)이 판단·조사 없이 즉시 처리 가능한 단순 작업이라면, AI가 자체적으로 먼저 처리를 시도하거나 설득하려 들 이유가 없습니다. 그런 상황에서 사용자가 '사람'과의 대화를 직접 지목해 요구했다면, 굳이 먼저 나서지 말고 요구사항을 즉시 받아들여 사람 상담원에게 이관(Escalate)하는 것이 합리적인 대응입니다.

**오답 분석:**
- Option B (오답): 왜 사람을 선호하는지 이유를 묻고 따지는 것은 이미 불만을 표시한 고객에게 불필요한 마찰과 거부감을 유발합니다.
- Option C (오답): 고객이 명시적으로 사람을 원한다고 요구했음에도 이를 무시하고 AI가 먼저 처리를 제안하는 것은 사용자의 직접적인 의사를 위반하는 응답입니다.
- Option D (오답): 절차가 간단하다는 이유로 고객의 사람 상담원 연결 요청을 무시하고 단계 안내를 강행하는 것은 고객 경험(UX) 관점에서 가장 자제해야 할 거부적 태도입니다.

---

## 3번 문제 (원본 68번)

**어려운 이유** [덜 틀린 답 고르기] — 정책 내 해결(C)과 감정 무시 처리(D)가 결론이 같아, 좌절 인정 여부라는 미세한 차이로만 갈린다. 4번(85번)과 짝을 이루는 문제로, 둘 다 "명시적 요청 없음 + 감정적 어조 + 즉시 처리 가능"이라는 같은 구조이지만 정답의 형태가 다르다(3번은 처리만, 4번은 처리+에스컬레이션 옵션 제시) — 차이는 **도메인 민감도**(일반 소매 vs 의료)에서 온다.

**1. 문제 원문**

A customer emails a retailer's support agent: 'This is ridiculous, you sent me the wrong size AGAIN,' asking for an exchange for a plain t-shirt order under the standard 30-day exchange policy. The customer has not asked to speak with a human. How should the agent respond?

A) Escalate to a human agent right away, since the customer's tone signals a case too sensitive to resolve directly

B) Ask the customer to confirm they are not requesting a human agent before proceeding with the exchange

C) Acknowledge the customer's frustration and process the exchange now, since the request is within policy and resolvable

D) Process the exchange without commenting on the frustration, treating the emotional tone as irrelevant to the resolution

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: C번**

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

## 4번 문제 (원본 85번)

**어려운 이유** [덜 틀린 답 고르기] — 68번과 표면적으로 같은 구조("명시적 요청 없음 + 감정적 어조 + 즉시 처리 가능")지만 정답이 "직접 처리"가 아니라 "직접 처리 + 에스컬레이션 옵션 제시"다. 68번식 규칙을 기계적으로 적용하면 틀린다. 차이를 만드는 변수는 **도메인 민감도**다: 68번은 일반 소매(티셔츠 교환)이지만 이 문제는 헬스케어(환자 대상)라서, 임상적 긴급성이 없더라도 환자가 언제든 사람에게 넘어갈 수 있는 선택지를 항상 열어두는 조치가 추가된다.

**1. 문제 원문**

A patient messages a healthcare scheduling assistant in a clearly irritated tone about needing to reschedule a routine appointment with no clinical urgency. The assistant can complete the rescheduling directly, and the patient has not asked to speak with a staff member. What should the assistant do?

A) Reschedule the appointment without acknowledging the tone, treating it as unrelated to completing the request directly.

B) Ask the patient to confirm they don't want to speak with a staff member before proceeding with the reschedule.

C) Escalate to a staff member immediately, since the irritated tone suggests the situation needs human handling.

D) Acknowledge the patient's frustration, signal that the rescheduling can be handled right away, and also offer to escalate to a staff member if the patient prefers.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: D번**

**정답 및 해설:**

**핵심 개념:** 

3번 문제(68번, 소매 교환)와 뼈대는 같지만, 이 문제는 **헬스케어라는 고민감도 도메인**이라는 점이 답을 바꿉니다. 일반 도메인에서는 공감 표현 후 즉시 처리로 충분하지만, 환자를 상대하는 상황에서는 짜증 난 어조 뒤에 임상 이슈나 더 복잡한 우려가 숨어 있을 가능성을 배제할 수 없으므로, AI가 직접 처리할 수 있음을 알리면서도 사람 상담원에게 넘어갈 수 있는 선택지를 함께 열어두는 것이 안전한 설계입니다. 즉 "요청이 없으면 그냥 처리"가 아니라 "요청이 없어도 도메인이 민감하면 선택지를 제시"가 이 문제의 규칙입니다.

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

## 5번 문제 (원본 92번)

**어려운 이유** [덜 틀린 답 고르기, 부분적으로만 맞는 오답] — 자사 사이트 한정 조항이 경쟁사 매칭 불허를 "함의"한다는 D가 법리적으로 그럴듯하지만, 정책 침묵은 거절 근거가 아니라 에스컬레이션 사유다.

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

---

# B. 추출 파이프라인 — 검토 라우팅·신뢰도·샘플링

51/73: 검토를 언제 유지·강화하는가. 95: 신뢰도 점수를 라우팅에 쓸 수 있는가. 63: 샘플링 설계.

## 6번 문제 (원본 51번)

**어려운 이유** [덜 틀린 답 고르기, 원칙이 깨지는 예외] — "세그먼트별로 판단하라"는 원칙을 기계적으로 적용하면 B(문서 유형 단위 격리)가 매력적이나, 조사 전까지 전면 유지가 정답인 보수적 예외다.

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

## 7번 문제 (원본 73번)

**어려운 이유** [근본 원인 vs 증상 완화, 유사 현상 구분] — 높은 신뢰도 점수라는 정상 신호 뒤에 문서 내부 모순이라는 별개 원인이 숨어 있어, 점수 기반 라우팅(D)을 신뢰하는 함정이 크다.

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

## 8번 문제 (원본 95번)

**어려운 이유** [부분적으로만 맞는 오답, 근본 원인 vs 증상 완화] — D는 "임계값을 신뢰하지 말라"는 방향은 맞지만 임계값만 올리는 증상 완화라, 역보정 자체를 지적하는 A와 갈린다.

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

## 9번 문제 (원본 63번)

**어려운 이유** [부분적으로만 맞는 오답, 덜 틀린 답 고르기] — C도 "비례 샘플링이 문제"라는 방향은 맞지만 고volume 유형을 아예 제외하자는 과잉 처방이라, 최소 표본 보장이라는 정답과 혼동된다.

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

---

# C. 멀티에이전트 오류 처리 — 재시도 vs 확정 결과 vs 에스컬레이션

61: 접근 실패와 정당한 빈 결과 구분. 93: 일시적 실패와 구조적 실패 구분.

## 10번 문제 (원본 61번)

**어려운 이유** [유사 현상 구분] — 신선도 검사 실패로 인한 abort는 "성공 응답인데 데이터 없음"처럼 보여 유효한 빈 결과(A)로 오인되기 쉬운, 접근 실패와 빈 결과의 경계 사례다.

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

## 11번 문제 (원본 93번)

**어려운 이유** [유사 현상 구분, 원칙이 깨지는 예외] — 같은 스토어의 두 실패가 표면상 동일하나 일시적 503은 로컬 해결, 자격증명 실패는 재시도로 절대 해소되지 않는 구조적 실패라는 비대칭을 구분해야 한다.

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

---

# D. 출처(Provenance) 보존 — 압축과 병합

74: 압축 시 claim-source 매핑 손실. 76: 병합 시 인용 집합 보존.

## 12번 문제 (원본 74번)

**어려운 이유** [유사 현상 구분] — 인용만 사라지고 findings는 남은 증상을 컨텍스트 윈도우 축소나 캐시 만료 같은 유사 원인과 구분해, compaction이 claim-source 매핑을 보존하지 않은 것임을 짚어야 한다.

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

## 13번 문제 (원본 76번)

**어려운 이유** [덜 틀린 답 고르기] — 중복 병합 시 인용을 어디까지 남길지에서 "하나만 남기기"류 선택지가 실무적으로 그럴듯해, 인용 전체 집합 보존이라는 요건과 경합한다.

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
