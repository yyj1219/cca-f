# Context Management & Reliability 문제 분석 모음

# 1. 문제

**1. 문제 원문**

A coordinator dispatches a pricing-lookup subagent against an internal catalog API. The subagent's HTTP call hangs and exceeds its timeout budget before any response arrives. A separate subagent queries the same catalog for a discontinued SKU and receives a 200 response with zero matching rows. How should the two outcomes be reported to the coordinator?

A) Report both outcomes as access failures so the coordinator retries each lookup the same fixed number of times

B) Report the timeout as an access failure eligible for retry, and the zero-row response as a valid empty result needing no retry

C) Report both outcomes as empty results, since neither subagent returned any usable pricing data for the coordinator to act upon

D) Report the timeout as a valid empty result and the zero-row response as an access failure that needs a retry

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
B번: Report the timeout as an access failure eligible for retry, and the zero-row response as a valid empty result needing no retry

**정답 및 해설:**

**핵심 개념:**
에이전트 기반 시스템(Multi-Agent Architecture)에서 서비스 응답 실패(Timeout 등 네트워크/서버 오류)와 정상적인 빈 결과(HTTP 200 OK, 0개 결과)를 구분하여 에러 처리를 설계하는 패러다임입니다. 시스템 일시적 장애는 재시도 대상(Retryable Error)으로 다루고, 데이터 부재(Empty Result)는 유효한 비즈니스 결과로 처리해야 불필요한 재시도 오버헤드를 방지할 수 있습니다.

**문제 상황 분석:**
- 첫 번째 서브에이전트는 내부 API 응답을 받지 못하고 타임아웃이 발생했습니다 (네트워크/시스템 차원의 일시적 접근 실패).
- 두 번째 서브에이전트는 단종된 상품 조회에 대해 정상(HTTP 200)으로 일치하는 데이터가 없음을 전달받았습니다 (정상적인 데이터 처리 성공 및 데이터 부재).
- 두 상황의 상이한 성격에 따라 코디네이터(Coordinator)에 대한 보고 및 재시도 메커니즘을 어떻게 다르게 적용해야 하는지 묻고 있습니다.

**B번이 정답인 이유:**
HTTP 타임아웃은 일시적인 네트워크 지연이나 서비스 부하로 인해 발생할 수 있으므로 '재시도 가능한 접근 실패(Access failure eligible for retry)'로 보고하여 코디네이터가 재요청을 시도할 수 있도록 해야 합니다. 반면, HTTP 200 응답과 함께 조회 결과가 0건(zero matching rows)으로 돌아온 것은 시스템이 정상 동작하여 "해당 상품 정보가 없음"을 명확히 확인한 것이므로 '재시도가 필요 없는 유효한 빈 결과(Valid empty result)'로 처리하는 것이 에이전트 시스템 오류 설계 표준에 부합합니다.

**오답 분석:**
- Option A (오답): 정상적으로 "데이터 없음(200 OK)"을 확인한 경우까지 접근 실패로 간주해 재시도를 수행하는 것은 불필요한 API 호출을 유발하고 비효율적입니다.
- Option C (오답): 타임아웃으로 인한 서비스 미응답을 단순 "빈 결과"로 처리하면, 일시적 오류로 인해 실제로 존재하는 데이터까지 누락된 채 로직이 진행되는 심각한 데이터 손실 문제가 발생합니다.
- Option D (오답): 타임아웃과 0개 행 응답에 대한 에러 처리 정의를 서로 반대로 적용한 잘못된 설명입니다.

---

# 2. 문제

**1. 문제 원문**

An airline support agent searches for a passenger by name and flight route to check a baggage claim. The lookup tool returns three passenger records with the same name on that route, each with a different booking reference. What should the agent do?

A) Select the record with the most recently booked flight date, since it is the most likely match for the claim

B) Ask the customer for their booking confirmation number or another identifier to pinpoint the correct record

C) Merge the relevant details from all three records to construct a single response to the baggage claim

D) Select the record with the most complete profile information, since it suggests an established customer

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
B번: Ask the customer for their booking confirmation number or another identifier to pinpoint the correct record

**정답 및 해설:**

**핵심 개념:**
에이전트 기반 지원 시스템 및 데이터 처리 흐름에서 모호성 해결(Disambiguation) 패러다임입니다. 데이터 조회 결과가 동명이인 등으로 인해 다중 레코드(Multiple Records)로 반환되어 모호한 경우, 임의로 추측하거나 데이터를 합치지 않고 사용자/고객에게 추가 식별자(Booking Ref, ID 등)를 요청하여 정확한 대상을 특정하는 것이 AI 및 인간 에이전트의 올바른 대화형 상호작용 설계 모범 사례입니다.

**문제 상황 분석:**
- 에이전트가 이름과 비행 노선으로 수하물 청구 관련 승객을 조회했습니다.
- 조회 결과, 동일 노선/동일 이름에 서로 다른 예약 번호를 가진 레코드가 3건 검색되었습니다.
- 단일 승객 및 예약 레코드를 명확히 구분할 수 없는 중복/모호성 상태가 발생했습니다.

**B번이 정답인 이유:**
결과가 다중으로 조회되어 정보가 모호할 때 AI 에이전트나 지원 담당자가 추측(Assumption)으로 특정 레코드를 선택하는 것은 타인의 수하물 정보를 잘못 처리하거나 민감 정보가 유출될 수 있는 치명적인 오류를 범하게 됩니다. 따라서 고객에게 예약 확인 번호(Booking Confirmation Number)나 추가 식별자 정보를 요청하여 정확한 레코드를 핀포인트로 특정(Pinpoint)하는 것이 최선의 해결 방식입니다.

**오답 분석:**
- Option A (오답): 가장 최근 예약 날짜라고 해서 해당 수하물 청구의 대상이라고 추정하는 것은 위험한 임의 추측 방식입니다.
- Option C (오답): 서로 다른 3개 레코드의 정보를 병합(Merge)하면 데이터 오염이 발생하고 잘못된 응답을 구성하게 됩니다.
- Option D (오답): 프로필 정보가 가장 잘 갖춰진 레코드를 임의 선택하는 것 역시 근거 없는 추측에 불과하며 잘못된 처리를 유발합니다.

---

# 3. 문제

**1. 문제 원문**

During a customer-support triage workflow, a knowledge-base subagent cannot reach its vector index because the index service returned a 429 rate-limit response. The subagent has already retried twice locally with exponential backoff and is still being rate-limited. What should the subagent do next?

A) Escalate with the failure type, the attempted queries, and partial results, since more local retries seem unlikely to help

B) Immediately fail the entire triage workflow so a human must review every ticket in the current batch manually

C) Keep retrying locally on the same backoff schedule indefinitely, since a 429 will always eventually resolve given enough retries

D) Return an empty result and mark the ticket resolved, since the knowledge base could not be reached in time

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
A번: Escalate with the failure type, the attempted queries, and partial results, since more local retries seem unlikely to help

**정답 및 해설:**

**핵심 개념:**
멀티 에이전트 오케스트레이션(Multi-Agent Orchestration) 및 분산 시스템에서의 에러 핸들링 패러다임입니다. 서브에이전트가 제한된 로컬 재시도(Exponential Backoff)를 모두 수행했음에도 장애가 지속될 경우, 무한 루프나 전체 시스템 다운을 방지하기 위해 맥락 정보(실패 유형, 시도 쿼리, 부분 결과)를 상위 오케스트레이터/코디네이터에게 에스컬레이션(Escalate)하는 것이 모범 사례입니다.

**문제 상황 분석:**
- 지식 베이스 서브에이전트가 429 Rate-limit 에러를 수신했습니다.
- 로컬에서 지수 백오프(Exponential backoff) 알고리즘으로 2회 재시도를 수행했으나 여전히 동일한 에러가 발생합니다.
- 단기적인 로컬 재시도로는 문제를 해결하기 어려운 지속적 서킷 임계 상태에 도달했습니다.

**A번이 정답인 이유:**
서브에이전트 수준에서 허용된 자체 재시도가 실패했을 때, 추가적인 무의미한 재시도를 멈추고 실패 이유(429 Rate-limit), 수행하려 했던 시도 쿼리, 그리고 지금까지 수집된 부분 결과를 상위 오케스트레이터로 에스컬레이션해야 합니다. 상위 코디네이터는 이 정보를 바탕으로 대안 경로를 탐색하거나 전체 시스템 자원을 재배치하는 등 유연하게 대응할 수 있습니다.

**오답 분석:**
- Option B (오답): 서브에이전트 하나의 단일 조회 실패로 인해 정상 처리될 수 있는 다른 티켓들을 포함한 '전체 워크플로우'를 즉시 실패시키는 것은 시스템 가용성을 과도하게 침해하는 격리 실패 패턴입니다.
- Option C (오답): 429 에러에 대해 무한히 재시도(indefinitely)하는 것은 시스템 리소스를 고갈시키고 워크플로우 전체를 무한 대기(Hang) 상태로 만드는 치명적인 설계 오류입니다.
- Option D (오답): 조회를 실패했음에도 불구하고 티켓을 '해결됨(resolved)'으로 거짓 처리하는 것은 데이터 오염 및 지원 서비스 불일치를 야기하는 잘못된 응답 처리 방식입니다.

---

# 4. 문제

**1. 문제 원문**

A retrieval-augmented pipeline uses Claude's search results feature to ground answers in a custom knowledge base of internal policy documents. The architect wants the final synthesis to retain proper source attribution comparable to what web search citations provide. What does the search results feature primarily enable in this scenario?

A) Natural citations with proper source attribution for the custom knowledge base, similar in quality to web search citations

B) Automatic conversion of all retrieved policy text into a single normalized document format before synthesis begins

C) Automatic reconciliation of any conflicting policy statements found across different internal documents in the knowledge base

D) A guarantee that every retrieved passage is the single most recent version of the relevant internal policy document

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
A번: Natural citations with proper source attribution for the custom knowledge base, similar in quality to web search citations

**정답 및 해설:**

**핵심 개념:**
Claude API의 Search Results(검색 결과 블록) 및 인용(Citations) 기능에 관한 패러다임입니다. 외부 검색 엔진 결과뿐만 아니라 RAG(검색 증강 생성) 시스템에서 검색한 커스텀 지식 베이스 데이터를 Claude의 검색 결과 컨텍스트 블록 형태(`search_results`)로 제공하면, Claude는 웹 검색 인용과 마찬가지로 원문 출처(Source Attribution)를 명확히 명시하는 자연스러운 출처 인용 문구를 생성합니다.

**문제 상황 분석:**
- RAG 파이프라인에서 내부 정책 문서 지식 베이스의 검색 데이터를 활용하고자 합니다.
- 시스템 아키텍트는 최종 답변 생성 시 웹 검색 결과의 인용 표시처럼 정확하고 자연스러운 출처 귀속(Source Attribution)이 유지되기를 원합니다.
- Claude의 `search_results` 기능을 해당 시나리오에 적용할 때 제공되는 핵심 가치를 묻고 있습니다.

**A번이 정답인 이유:**
Claude의 search_results 기능을 사용하면 내부 지식 베이스에서 검색된 문맥(Context)에 대해 모델이 답변을 합성할 때 출처 문서 및 구절을 자연스럽게 인용(Natural Citations)하고 정확히 출처를 귀속할 수 있도록 지원합니다. 이는 웹 검색 인용 기능과 동일한 수준의 정교한 인용 표시 기능을 제공합니다.

**오답 분석:**
- Option B (오답): search_results 기능은 검색된 문서 텍스트 포맷을 정규화된 포맷으로 자동 변환해 주는 포맷팅/변환 도구가 아닙니다.
- Option C (오답): 문서 간 상충하는 정책 내용을 자동으로 모순 해결/조정(Reconciliation)해 주는 알고리즘이 아닙니다.
- Option D (오답): 지식 베이스 내부 데이터의 최신 버전 여부나 버전 관리를 보장하는 것은 데이터베이스/검색 엔진의 역할이며, LLM의 search_results 기능이 이를 보장하지 않습니다.

---

# 5. 문제

**1. 문제 원문**

An architect wants to free up conversation context space after a long debugging detour, but also wants to make sure specific facts the agent uncovered, such as an exact configuration value, are not lost to summarization. Which combination of practices best achieves both goals?

A) Delete the conversation and restart from an empty session, since that is the only way to guarantee the facts remain available.

B) Avoid compacting entirely and let the session continue to accumulate context indefinitely for the rest of the exploration.

C) Write the exact facts to a durable scratchpad file first, then compact the conversation to reclaim space afterward.

D) Compact the conversation immediately without recording anything, since compaction is guaranteed to preserve every exact fact.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
C번: Write the exact facts to a durable scratchpad file first, then compact the conversation to reclaim space afterward.

**정답 및 해설:**

**핵심 개념:**
에이전트 컨텍스트 관리(Context Management) 및 메모리 압축(Compaction) 모범 사례입니다. 세션 컨텍스트가 너무 길어졌을 때 압축(Summarization/Compaction)을 수행하면 토큰 공간을 확보할 수 있지만 손실 정보가 발생할 수 있으므로, 손실되면 안 되는 핵심 데이터(정확한 설정값, 변수명 등)는 외부에 파일(Scratchpad) 형태로 선제 기록한 뒤 압축을 진행하는 패턴을 사용합니다.

**문제 상황 분석:**
- 긴 디버깅 과정으로 인해 대화 컨텍스트가 누적되어 공간을 정리해야 함.
- 에이전트가 디버깅 중 밝혀낸 특정 정보(정확한 설정값 등)가 요약 과정에서 유실될 수 있는 위험이 있음.
- 컨텍스트 공간 확보와 핵심 데이터의 정확한 보존이라는 두 가지 목적을 동시에 달성해야함.

**C번이 정답인 이유:**
대화 압축(Compaction/Summarization)은 필연적으로 불필요한 세부 정보를 생략하거나 추상화하므로 리터럴 값이나 정확한 코드/설정값 등의 텍스트 정보가 손실될 위험이 있습니다. 따라서 중요 사실을 영속성 있는 외부 스크래치패드 파일(Scratchpad file)에 먼저 기록(Durable state 저장)하여 데이터 보존을 확실히 한 뒤, 대화를 압축하여 컨텍스트 공간을 재확보하는 방식이 두 가지 목적을 완벽히 달성하는 모범 사례입니다.

**오답 분석:**
- Option A (오답): 세션을 삭제하고 빈 세션에서 시작하면 기존 세션에서 에이전트가 탐색하여 알아낸 사실들까지 모두 유실됩니다.
- Option B (오답): 압축을 완전히 회피하면 컨텍스트 길이가 한계치에 도달하여 비용 증가, 성능 저하 및 컨텍스트 초과 에러(Context Window Exceeded)가 발생합니다.
- Option D (오답): 압축 알고리즘은 모든 정확한 사실을 100% 보존한다고 보장할 수 없으므로, 사전 기록 없이 즉시 압축을 진행하면 핵심 정보가 손실됩니다.

---

# 6. 문제

**1. 문제 원문**

Late in a multi-hour exploration session, an architect asks the agent to describe the error-handling pattern in the billing service. Earlier, a subagent had discovered that the service uses a custom Result type instead of exceptions. The agent now answers that the service 'typically uses try/catch with logging,' contradicting the earlier finding. What is the most likely cause, and what should the architect have done to prevent it?

A) The agent lacked permission to read the billing service's files, so it fabricated a plausible-sounding answer instead.

B) The finding degraded out of active context over the long session; a scratchpad record would have kept the answer grounded.

C) The model experienced a technical malfunction that can only be resolved by restarting the Claude Code application entirely.

D) A network interruption corrupted the agent's understanding of the billing service partway through the session.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
B번: The finding degraded out of active context over the long session; a scratchpad record would have kept the answer grounded.

**정답 및 해설:**

**핵심 개념:**
에이전틱 시스템의 장기 세션에서의 컨텍스트 유실(Context Degradation/Loss)과 스크래치패드(Scratchpad)를 활용한 지속성 보존(Persistence) 관리 기법입니다. 긴 대화 세션이 지속되면 초기에 수집된 중요한 사실들이 Context Window 범위를 벗어나거나 요약/압축 과정에서 생략될 위험이 크므로, 핵심 발견 사항은 외부 스크래치패드에 실시간 기록하는 메모리 관리 패턴이 필요합니다.

**문제 상황 분석:**
- 몇 시간에 걸친 탐색 세션 후반부에 결제 서비스의 에러 처리 패턴에 대해 질문함.
- 세션 초반 서브에이전트가 "예외(exception) 대신 커스텀 Result 타입 사용"이라는 명확한 사실을 발견했었음.
- 그러나 후반부에서 에이전트는 일반적인 일반론("try/catch 사용")으로 잘못된 답변을 생성하여 이전 발견 사실과 모순됨.

**B번이 정답인 이유:**
수시간에 걸친 장기 세션으로 인해 초기에 발견된 구체적 사실이 활성 컨텍스트(Active Context Window) 밖으로 밀려나 유실(Degraded out)되었고, 그로 인해 모델이 근거 없는 일반론적인 환각(Hallucination) 답변을 내놓은 상황입니다. 탐색 과정에서 파악된 주요 사실을 지속성 있는 스크래치패드 파일(Scratchpad record)에 선제적으로 기록해 두었다면, 세션이 길어져도 해당 데이터를 참조하여 질문에 정확히 사실에 근거한(Grounded) 답변을 유지할 수 있었습니다.

**오답 분석:**
- Option A (오답): 권한 부족 문제가 아니라, 세션 초반에 이미 파일을 읽어서 커스텀 Result 타입임을 알아냈던 기록이 컨텍스트에서 유실된 것입니다.
- Option C (오답): 애플리케이션의 기술적 고장이 아니라 LLM 컨텍스트 윈도우 한계에 따른 자연스러운 컨텍스트 누락 현상입니다.
- Option D (오답): 네트워크 중단으로 인해 에이전트의 인지나 상태 데이터가 중간에 손상되는 것은 이 현상의 기술적 원인이 아닙니다.

---

# 7. 문제

**1. 문제 원문**

A coordinator is choosing between two error-reporting schemas for its subagents. Schema A returns a single string status like 'error' or 'ok'. Schema B returns a structured object with failure type, attempted query, partial results, and suggested alternatives. During an incident where three of eight subagents fail for different reasons, which schema lets the coordinator respond most effectively, and why?

A) Schema B, since structured objects always take priority regardless of what information they actually contain

B) Schema A, since reducing failures to just 'error' or 'ok' forces subagents to resolve problems before reporting up

C) Schema B, since the coordinator can inspect each failure's type and results to decide whether to retry or proceed

D) Schema A, since a simple string status is easier for the coordinator to parse quickly during a live incident

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
C번: Schema B, since the coordinator can inspect each failure's type and results to decide whether to retry or proceed

**정답 및 해설:**

**핵심 개념:**
멀티 에이전트 시스템(Multi-Agent Architecture)에서의 풍부한 오류 상태 보고(Rich Error Reporting) 및 정교한 에러 핸들링 설계 원칙입니다. 여러 서브에이전트가 서로 다른 원인으로 실패하는 복잡한 상황에서, 단순 상태 값만 전달하면 코디네이터가 유연한 복구 전략을 수립할 수 없습니다. 실패 유형, 부분 결과, 대안 정보 등이 포함된 구조화된 에러 객체(Structured Error Object)를 제공해야 코디네이터가 재시도(Retry), 부분 결과 활용(Partial Progress), 또는 수용/건너뛰기(Proceed)를 합리적으로 결정할 수 있습니다.

**문제 상황 분석:**
- 8개의 서브에이전트 중 3개가 **서로 다른 이유**로 실패했습니다.
- 스키마 A는 단순 문자열('error'/'ok')만 반환하여 실패의 세부 원인이나 부분 진행 상태를 전혀 알 수 없습니다.
- 스키마 B는 실패 유형, 시도한 쿼리, 부분 결과, 대안 정보를 지닌 구조화된 객체를 반환합니다.

**C번이 정답인 이유:**
서로 다른 원인으로 다수의 에이전트가 실패할 때, 코디네이터가 적절한 복구 작업을 수행하려면 진단에 필요한 구체적인 정보가 필요합니다. 스키마 B를 사용하면 코디네이터가 각 실패의 고유한 원인과 수집된 부분 결과를 검사하여 해당 작업을 재시도할지, 대안 쿼리를 실행할지, 아니면 부분 데이터를 가지고 계속 진행할지를 동적으로 판단할 수 있으므로 가장 효과적입니다.

**오답 분석:**
- Option A (오답): 스키마 B가 우수한 이유는 단순 구조화 객체라는 형태 때문이 아니라, **그 객체 안에 담긴 구체적이고 진단 가능한 정보(실패 유형, 부분 결과 등)** 덕분입니다.
- Option B (오답): 에러 메시지를 단순화한다고 해서 서브에이전트가 스스로 문제를 해결할 수 있는 능력이 생기지 않으며, 상위 보고 시 정보 유실만 유발합니다.
- Option D (오답): 단순 파싱 편의성보다 에러 복구 및 의사결정에 필요한 정보의 질과 완성도가 멀티 에이전트 오케스트레이션에서 훨씬 중요합니다.

---

# 8. 문제

**1. 문제 원문**

A customer-onboarding pipeline extracts identity fields from submitted documents and uses a calibrated confidence threshold to decide which extractions bypass human review. A new document scanner is deployed that produces slightly lower-resolution images than before. What is the correct response to this change from a review-workflow design perspective?

A) Automatically lower the confidence threshold by a fixed amount whenever any hardware change is deployed, since lower image quality always reduces model confidence by a predictable margin.

B) Disable the confidence threshold and route all extractions from the new scanner to human review permanently, since any hardware change should be assumed to make automation unsafe going forward.

C) Treat the new scanner output as a potential shift in the input population and re-validate accuracy and confidence calibration on a sample of documents captured with it before trusting the existing threshold.

D) Continue using the existing calibrated threshold unchanged, since confidence thresholds are calibrated against the model's behavior and are independent of image quality or scanning hardware.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
C번: Treat the new scanner output as a potential shift in the input population and re-validate accuracy and confidence calibration on a sample of documents captured with it before trusting the existing threshold.

**정답 및 해설:**

**핵심 개념:**
머신러닝/AI 데이터 파이프라인에서의 데이터 드리프트(Data Drift / Input Population Shift) 및 신뢰도 보정(Confidence Calibration) 관리 패러다임입니다. 입력을 수집하는 하드웨어나 환경이 변경되면 입력 데이터의 분포(Distribution)가 변하므로, 기존 신뢰도 점수가 실제 예측 정확도와 일치하지 않는 미보정(Uncalibrated) 상태가 발생할 수 있습니다. 따라서 새로운 데이터 샘플로 신뢰도 임계값과 정확도를 재검증하는 검토 워크플로우 설계가 필요합니다.

**문제 상황 분석:**
- 문서 신원 추출 파이프라인에서 신뢰도 임계값을 기반으로 수동 검토(Human Review) 건너뜀 여부를 결정함.
- 해상도가 낮은 새 문서 스캐너가 도입되어 입력 이미지 품질 환경에 변화가 발생함.
- 이러한 데이터 수집 하드웨어 변경 시 기존 신뢰도 임계값을 다루는 올바른 검토 워크플로우 대응 방안을 묻고 있음.

**C번이 정답인 이유:**
스캐너 장비의 변경(해상도 저하)은 AI 모델에 들어가는 입력 데이터 모집단의 변화(Input Population Shift)를 의미합니다. 신뢰도 점수는 특정 입력 분포 및 품질 조건에서 보정(Calibrated)된 것이므로, 입력 데이터 환경이 바뀌면 동일한 신뢰도 점수라도 실제 정확도가 낮아질 수 있습니다. 따라서 기존 임계값을 그대로 신뢰하기 전에, 새 스캐너로 촬영된 문서 샘플을 통해 모델의 추출 정확도와 신뢰도 점수 간의 보정 상태를 재검증(Re-validate)하는 것이 모범적인 시스템 설계 방식입니다.

**오답 분석:**
- Option A (오답): 해상도 저하가 모델 신뢰도에 미치는 영향은 정량적으로 상이하므로 무조건 고정된 수치만큼 임계값을 낮추는 것은 근거 없는 자의적 대응입니다.
- Option B (오답): 하드웨어 변경이 있다고 해서 자동화 시스템 전체를 영구적으로 포기하고 100% 수동 검토로 전환하는 것은 시스템 가용성과 효율성을 침해합니다.
- Option D (오답): 신뢰도 점수와 실제 모델 정확도의 관계는 입력 데이터 품질 및 하드웨어 성능에 직접적인 영향을 받으므로, 기존 임계값을 검증 없이 그대로 계속 사용하는 것은 오추출 데이터가 수동 검토를 통과하는 위험을 초래합니다.

---

# 9. 문제

**1. 문제 원문**

A translation subagent is asked to localize a product description into a language for which no glossary entry exists in the terminology database. The lookup completes successfully but returns no matching glossary terms, which is expected for a newly supported language. How should this be distinguished from a scenario where the terminology database itself is offline?

A) Report the missing-glossary case as a valid empty result, and the database-offline case as a retryable access failure

B) Skip reporting either case separately, since the coordinator can translate regardless of glossary availability

C) Report both cases the same way, since in each case the subagent ends up without any glossary terms to work with at all

D) Report the missing-glossary case as an access failure, since finding no matching terms means the lookup failed

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
A번: Report the missing-glossary case as a valid empty result, and the database-offline case as a retryable access failure

**정답 및 해설:**

**핵심 개념:**
에이전트 기반 시스템(Multi-Agent System)에서 서비스/접근 실패(Access Failure)와 유효한 빈 결과(Valid Empty Result)를 구분하여 처리하는 상태 전달 설계 원칙입니다. 정상 동작 결과로 반환된 데이터의 부재(HTTP 200 OK, Empty Array)는 비즈니스적 정상 응답인 반면, 인프라 장애나 오프라인 상태는 시스템 예외(Transient Failure)로 취급하여 재시도 메커니즘을 적용해야 합니다.

**문제 상황 분석:**
- 번역 서브에이전트가 용어 데이터베이스에서 신규 언어용 용어집을 조회함.
- 조회 자체는 성공했으나 일치하는 용어가 없음(정상적인 Empty Result).
- 이를 데이터베이스 자체가 다운되어 응답할 수 없는 서버 오프라인 상황(Access Failure)과 구분하여 상위 코디네이터에 보고하는 모범 방안을 묻고 있음.

**A번이 정답인 이유:**
용어집 조회가 성공적으로 실행되었지만 해당 언어의 용어 데이터가 없는 것은 데이터 처리 관점에서 유효한 성공 응답(Valid empty result)입니다. 반면, 용어 데이터베이스가 오프라인이 되어 접속할 수 없는 것은 일시적 네트워크/인프라 장애이므로 재시도가 가능한 접근 실패(Retryable access failure)로 분류해야 합니다. 두 상태를 명확히 구분하여 전달해야 코디네이터가 불필요한 재시도를 방지하거나 적절한 오류 복구 로직을 실행할 수 있습니다.

**오답 분석:**
- Option B (오답): 용어집 존재 여부와 데이터베이스 장애 여부를 무시하고 보고를 생략하면, 시스템 장애 상태에서도 오답을 출력하거나 데이터가 누락될 수 있어 위험합니다.
- Option C (오답): 결과적으로 용어집이 없다는 이유로 두 상황을 동일하게 처리하면 데이터베이스가 다시 정상화되었을 때 재시도를 통해 데이터를 가져올 기회를 상실하게 됩니다.
- Option D (오답): 신규 언어에 대해 데이터가 0건 반환된 정상 조회 결과를 접근 실패(Access failure)로 처리하면 불필요한 재시도 및 오류 알람이 발생합니다.

---

# 10. 문제

**1. 문제 원문**

A financial-advisory assistant lets users resume a previous session using a session ID. A developer implements resumption by sending only the user's new message along with the session ID, assuming the API will look up the prior conversation automatically. Users report the assistant "forgets" earlier discussed risk tolerance and investment goals when they resume. What is the most direct explanation and fix?

A) The assistant should ask users to restate their risk tolerance and goals immediately after resuming, since this is unavoidable

B) The model should be swapped for one with a larger context window so it can recall the earlier session automatically

C) The message history from the earlier session must be resolved into the request; a session ID alone does not supply prior turns to the model

D) The developer should shorten new messages so there is more room for the model to recall earlier details on its own

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
C번: The message history from the earlier session must be resolved into the request; a session ID alone does not supply prior turns to the model

**정답 및 해설:**

**핵심 개념:**
LLM API의 무상태성(Stateless Architecture) 및 대화 문맥 관리(Conversation History Handling) 원칙입니다. Claude API를 포함한 표준 LLM API 서버는 기본적으로 무상태(Stateless)로 동작하므로, 클라이언트 측에서 세션 ID만 전달한다고 해서 서버가 자동으로 이전 대화 이력을 조회하거나 유지해주지 않습니다. 따라서 이전 대화 내역(`messages` 배열)을 애플리케이션의 데이터베이스 등에서 조회하여 매 API 요청 시 함께 전달해야 합니다.

**문제 상황 분석:**
- 개발자는 세션 ID만 API로 전송하면 백엔드/API가 이전 대화 기록을 알아서 불러올 것이라고 잘못 가정함.
- 결과적으로 새로운 메시지만 전달되었기 때문에 모델은 이전 세션에서 주고받은 위험 감수 성향이나 투자 목표 문맥을 전달받지 못함.
- 사용자는 재개된 세션에서 어시스턴트가 과거 대화 내용을 기억하지 못하는 문제를 겪음.

**C번이 정답인 이유:**
LLM API는 상태를 저장하지 않으므로, 커스텀 세션 ID를 보낸다고 해서 모델이 과거 대화 히스토리를 자동으로 찾아오지 않습니다. 클라이언트/애플리케이션 레이어에서 세션 ID에 해당하는 이전 메시지 기록(Message History)을 DB에서 검색(Resolve)한 후, 이를 API 요청의 `messages` 배열에 포함시켜 전송해야만 모델이 이전 대화 문맥을 파악할 수 있습니다.

**오답 분석:**
- Option A (오답): 애플리케이션에서 대화 히스토리를 저장하고 요청 시 다시 전달하면 완벽히 해결되는 문제이므로 사용자에게 매번 재입력을 요구할 필요가 없습니다.
- Option B (오답): 컨텍스트 윈도우 크기의 문제가 아니라 요청 시 대화 이력 데이터 자체가 모델로 전달되지 않은 것이 원인입니다.
- Option D (오답): 새 메시지의 길이를 줄인다고 해서 API로 보내지도 않은 과거 기록을 모델이 스스로 회상할 수 있는 것은 아닙니다.

---

# 11. 문제

**1. 문제 원문**

An insurance-claims extraction pipeline processes auto, home, and health claims. The team has a labeled evaluation dataset covering all three types but has only computed an aggregate accuracy figure across the entire dataset. Before deciding whether to reduce human review for health claims specifically, what is the most direct way to proceed?

A) Ask the extraction model to retrospectively estimate its accuracy per document type from its confidence scores, and then use those self-reported figures for health claims instead of obtaining a labeled ground-truth dataset.

B) Increase the aggregate sample size by adding more documents from auto, home, and health claims equally until the combined confidence interval narrows sufficiently to infer that the health-claims segment also meets the required accuracy threshold.

C) Compute accuracy separately for the health-claims examples in the existing evaluation set, and only reduce review if that segment's accuracy independently meets the required bar.

D) Assume that the health-claims extraction accuracy mirrors the combined aggregate accuracy, because the pipeline uses the same prompt and model across document types, so the overall figure serves as a reliable proxy for the health-claims segment.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
C번: Compute accuracy separately for the health-claims examples in the existing evaluation set, and only reduce review if that segment's accuracy independently meets the required bar.

**정답 및 해설:**

**핵심 개념:**
AI/LLM 시스템에서의 하위 세그먼트 평가(Sub-group Evaluation / Sliced Metrics) 모범 사례입니다. 전체 데이터셋의 합산 정확도(Aggregate Accuracy)는 특정 문서 유형(예: 건강 보험)의 실제 성능을 은폐하거나 심각하게 왜곡할 수 있습니다. 이미 레이블이 지정된 평가 데이터셋이 존재하는 경우, 전체 합산값을 신뢰하는 대신 해당 세그먼트의 데이터만 슬라이싱(Slicing)하여 독립적인 정확도를 측정하는 것이 가장 직접적이고 정교한 검증 방식입니다.

**문제 상황 분석:**
- 파이프라인이 자동차, 주택, 건강 보험 청구 문서를 처리하고 있음.
- 팀은 세 가지 유형을 모두 포함하는 정답(Labeled) 평가 데이터셋을 이미 가지고 있지만, 전체 합산 정확도만 계산해 둔 상태임.
- 특히 위험도가 높거나 특수한 '건강 보험 청구' 문서에 대해 수동 검토(Human Review) 비율을 줄일지 결정해야 함.

**C번이 정답인 이유:**
팀은 이미 세 가지 문서 유형을 포함하는 레이블링된 평가 데이터셋을 가지고 있습니다. 건강 보험 청구 문서 추출의 수동 검토를 줄여도 되는지 안전하게 결정하기 위한 가장 직접적이고 효과적인 방법은, 기존 평가 데이터셋에서 건강 보험 청구 데이터만 따로 분리(Slice)하여 해당 세그먼트의 정확도를 독립적으로 계산(Compute accuracy separately)하는 것입니다. 이 수치가 요구되는 기준을 충족할 때만 수동 검토 비율을 축소하는 것이 안전하고 정확한 에이전틱 평가 절차입니다.

**오답 분석:**
- Option A (오답): 정답(Ground-truth) 데이터셋이 이미 존재하는 상황에서 이를 활용하지 않고 모델 스스로의 신뢰도 점수에 의존하여 정확도를 추정하는 것은 모델의 환각이나 과신(Overconfidence) 문제를 간과하는 잘못된 방식입니다.
- Option B (오답): 기존 데이터셋에서 이미 슬라이싱 평가가 가능한데 불필요하게 전체 샘플 크기를 늘리는 것은 낭비이며, 합산 신뢰 구간을 좁힌다고 해서 하위 세그먼트의 편향이나 낮은 정확도가 자동으로 검증되지 않습니다.
- Option D (오답): 동일한 프롬프트와 모델을 사용하더라도 문서의 복잡도, 서식, 어휘 등이 다르므로 성능은 문서 유형별로 크게 다를 수 있습니다. 전체 합산 지표를 하위 세그먼트의 대리 지표로 단순 가정하는 것은 심각한 위험을 초래합니다.

---

# 12. 문제

**1. 문제 원문**

A subagent researching climate data reports a sea-level rise figure from a study, but its structured output omits the study's publication year. When the coordinator merges this with a more recent study reporting a different figure, it cannot tell whether the discrepancy reflects a real disagreement or simply the passage of time between studies. What is the most direct fix to the subagent's output contract?

A) Add a required field capturing the total word count of the source study so the coordinator can judge its depth

B) Add a required field asking the subagent to guess how the figure might have changed since publication

C) Add a required field listing the study's funding source so the coordinator can assess potential bias

D) Add a required field for the publication or data-collection date next to every extracted figure

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: Add a required field for the publication or data-collection date next to every extracted figure

**정답 및 해설:**

**핵심 개념:**
에이전트 간 데이터 전달 시 인터페이스 정밀성(Output Contract & Schema Design)에 대한 모범 사례입니다. 서브에이전트가 수집한 데이터를 코디네이터가 병합 및 평가할 때 맥락적 불확실성을 없애기 위해서는, 모든 추출된 사실/수치 메타데이터(예: 출판일, 데이터 수집 시점)를 필수 필드(`required`)로 정의하는 명확한 스키마 계약(Output Contract)이 필요합니다.

**문제 상황 분석:**
- 서브에이전트가 연구의 해수면 상승 수치를 보고하지만, 출력 스키마에서 '출판 연도'가 누락됨.
- 코디네이터가 다른 최신 연구 결과와 병합할 때, 데이터의 차이가 시점 변화 때문인지 실제 과학적 견해차 때문인지 판별하지 못함.
- 출력 스키마 계약(Output Contract) 측면에서 이 모호함을 해결할 가장 직접적인 수정책을 찾아야 함.

**D번이 정답인 이유:**
코디네이터가 수치 간 불일치의 원인(시점 차이 vs 연구 간 견해차)을 정확히 판별하지 못하는 근본적인 원인은 추출된 데이터의 '시점 메타데이터' 누락 때문입니다. 따라서 서브에이전트의 출력 계약(JSON Schema 등)에 추출된 모든 수치 항목 옆에 출판일 또는 데이터 수집 날짜(`publication or data-collection date`)를 필수 필드로 지정하는 것이 가장 직접적이고 정교한 해결책입니다.

**오답 분석:**
- Option A (오답): 원본 연구의 전체 단어 수(Word count)는 시점 차이로 인한 수치 불일치를 분석하는 데 아무런 도움을 주지 못합니다.
- Option B (오답): 에이전트에게 수치의 변화 가능성을 추측(Guess)하게 만드는 것은 근거 없는 환각(Hallucination)을 유발하며, 시스템의 데이터 정밀도를 떨어뜨립니다.
- Option C (오답): 자금 출처(Funding source)는 연구 편향성을 평가할 수는 있지만, 수치 차이가 시간의 경과 때문인지 판별하는 시점 모호성 문제를 해결하지는 못합니다.

---

# 13. 문제

**1. 문제 원문**

A code-review coordinator dispatches a security-scanning subagent and a style-checking subagent in parallel. The security subagent's static-analysis tool crashes partway through, after already flagging two vulnerabilities in files it processed before the crash. What should the subagent send to the coordinator?

A) Nothing at all until the scan can be fully restarted and completed without any interruption whatsoever

B) The two vulnerabilities found, reported as the complete final result with no note about unscanned files

C) The two vulnerabilities found, the crash's failure type, and which files were left unscanned by the tool

D) Only a generic failure notice, since including partial findings could give a false sense of completeness

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
C번: The two vulnerabilities found, the crash's failure type, and which files were left unscanned by the tool

**정답 및 해설:**

**핵심 개념:**
멀티 에이전트 시스템(Multi-Agent Architecture)에서의 풍부한 장애 보고 및 부분 진행 결과 전달(Rich Error Reporting & Partial Progress Reporting) 원칙입니다. 서브에이전트에 비정상적 장애가 발생한 경우, 수집된 기존 진단 결과(Partial Results), 실패 원인(Failure Type), 그리고 처리되지 못한 남은 작업 항목(Unprocessed Scope)을 구조화된 객체 형태로 상위 코디네이터에 전달해야 코디네이터가 후속 재시도나 대체 작업을 유연하게 오케스트레이션할 수 있습니다.

**문제 상황 분석:**
- 병렬 처리 중 보안 스캐닝 서브에이전트의 정적 분석 도구가 중단(Crash)되었습니다.
- 충돌 발생 전 이미 2개의 보안 취약점을 발견한 상태였습니다.
- 충돌 이후 남은 파일들은 스캔되지 못한 상태입니다.

**C번이 정답인 이유:**
서브에이전트는 작업이 일부만 완료되고 중단된 경우, 이미 찾아낸 의미 있는 부분 결과(발견된 취약점 2개)와 함께 장애 진단 정보(충돌 실패 유형), 그리고 스캔이 누락된 구체적 대상(스캔되지 않은 파일 목록)을 명확히 전달해야 합니다. 이를 전달받은 코디네이터는 스캔되지 않은 파일에 대해서만 재시도를 명령하거나, 이미 발견된 취약점에 대해 조치를 취하는 등 정교한 에러 복구 전략을 수립할 수 있습니다.

**오답 분석:**
- Option A (오답): 완전히 성공할 때까지 무응답으로 대기하면 전체 코디네이터 파이프라인의 블로킹(Blocking)과 타임아웃을 유발합니다.
- Option B (오답): 스캔이 중단되었음에도 전체가 완료된 정상 결과인 것처럼 보고하면, 스캔되지 않은 파일에 숨겨진 취약점을 놓치게 되는 치명적인 보안 위험이 발생합니다.
- Option D (오답): 이미 유의미하게 찾아낸 2개의 취약점 데이터까지 모두 버리고 단순 실패 알림만 보내는 것은 정보 유실이며 효율적이지 못합니다.

---

# 14. 문제

**1. 문제 원문**

A coordinator process orchestrating five exploration subagents crashes after three of them finished and exported their findings to known file locations. The coordinator restarts. Following a structured state persistence design, what should it do?

A) Discard the three completed agents' exported findings and ask the user to describe what those agents had found from memory.

B) Wait indefinitely for the crashed agents to resume on their own without taking any action to reload prior state.

C) Re-run all five agents completely from scratch, discarding the exported findings from the three that already completed before the crash.

D) Load the manifest of agent states, skip re-running the three completed agents, and inject their findings into the remaining prompts.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: Load the manifest of agent states, skip re-running the three completed agents, and inject their findings into the remaining prompts.

**정답 및 해설:**

**핵심 개념:**
멀티 에이전트 시스템(Multi-Agent Architecture)에서의 상태 지속성(State Persistence) 및 결함 허용(Fault Tolerance/Checkpointing) 설계 원칙입니다. 장시간 수행되는 복잡한 에스컬레이션/탐색 작업 중 코디네이터가 장애로 다운되었을 때, 이전에 이미 완료되어 파일로 영속화(Persisted)된 서브에이전트의 상태 및 결과물을 매니페스트(Manifest)를 통해 복원하면 중복 작업 및 비용을 최소화할 수 있습니다.

**문제 상황 분석:**
- 5개의 탐색 서브에이전트 중 3개가 완료되어 지정된 파일 경로에 탐색 결과물을 저장(Export)함.
- 이후 코디네이터 프로세스가 갑자기 다운(Crash)된 후 재시작됨.
- 이미 보존된 상태(State Persistence)를 활용하여 재시작 시 어떤 작업 흐름을 거쳐야 하는지 묻고 있음.

**D번이 정답인 이유:**
구조화된 상태 지속성(State Persistence) 설계의 핵심 목적은 장애 발생 시 완료된 작업의 상태를 복원(Checkpointed State)하여 중복 자원 소모를 방지하는 것입니다. 재시작된 코디네이터는 에이전트 상태 매니페스트(State Manifest)를 로드하여 이미 정상 종료된 3개 에이전트의 실행을 건너뛰고(Skip), 그들이 파일에 보존해 둔 결과값을 읽어와 남은 서브에이전트의 프롬프트 컨텍스트에 주입(Inject)함으로써 효율적으로 하위 작업을 이어받아 수행할 수 있습니다.

**오답 분석:**
- Option A (오답): 이미 디스크 파일로 저장되어 보존된 결과물을 버리고 사용자 기억에 의존해 재입력을 요구하는 것은 상태 지속성 시스템의 기본 원칙에 어긋납니다.
- Option B (오답): 코디네이터가 이전 상태 로드나 복구 조치를 취하지 않은 채 비정상 종료된 서브에이전트가 스스로 복구되기를 무기한 대기하는 것은 데드락(Deadlock)과 시스템 교착을 유발합니다.
- Option C (오답): 기존에 이미 완수되어 파일로 저장된 3개 에이전트의 작업을 모두 무시하고 처음부터 전체 5개 에이전트를 다시 실행하는 것은 극심한 API 토큰 낭비와 시간 지연을 발생시킵니다.

---

# 15. 문제

**1. 문제 원문**

An Anthropic customer support agent is assisting a consumer-tier user (Claude Pro) who is disputing an unauthorized charge. The user cannot provide their account number or phone number, and the system shows multiple similar accounts. According to Anthropic's official documentation, how should the agent verify the customer's identity to proceed?

A) Request the user to submit a government-issued photo ID and a live selfie through Anthropic's third-party verification platform, Persona, to confirm their identity and account ownership.

B) Ask the user to provide their account number or the PIN on file to confirm which account is theirs.

C) Ask the user general questions about their service plan and infer the correct account from the answers.

D) Proceed with the account that has the most recent billing activity, assuming it reflects the active dispute.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
A번: Request the user to submit a government-issued photo ID and a live selfie through Anthropic's third-party verification platform, Persona, to confirm their identity and account ownership.

**정답 및 해설:**

**핵심 개념:**
Anthropic 서비스의 고객 신원 확인(Customer Identity Verification & Account Ownership) 및 보안 규정입니다. 계정 번호, 전화번호 등 일차적 식별 정보가 미비하고 다수의 유사 계정이 검색되어 신원이 불분명할 경우, 금융/결제 이의 제기 처리를 위해 제3자 신원 인증 플랫폼(Persona)을 통한 공식 사진 신분증(ID) 및 셀카 검증 절차를 거쳐야 합니다.

**문제 상황 분석:**
- Claude Pro(소비자 티어) 사용자가 무단 결제 건에 대해 이의를 제기함.
- 사용자가 계정 번호나 전화번호를 제공할 수 없으며, 시스템상으로 동명이인 등의 유사 계정이 여러 개 검색됨.
- 신원이 명확히 특정되지 않은 상태에서 결제 및 계정 소유권을 확인하기 위한 공식 Anthropic 절차를 찾아야 함.

**A번이 정답인 이유:**
Anthropic의 공식 지침에 따르면, 계정 번호나 등록 정보 부족으로 본인 확인이 불가능하거나 다중 계정이 탐지되어 소유권이 불명확할 때 고객 지원 에이전트는 제3자 신원 확인 서비스 파트너인 **Persona**를 활용합니다. 사용자에게 정부 발급 신분증(Government-issued photo ID)과 라이브 셀카 사진 제출을 요청하여 본인 확인 및 계정 소유권을 안전하게 검증한 후 후속 결제 이의 제기 절차를 진행해야 합니다.

**오답 분석:**
- Option B (오답): 문제 시나리오에서 이미 사용자가 계정 번호를 제공할 수 없다고 명시되어 있으므로 이를 다시 요구하는 것은 해결책이 될 수 없습니다.
- Option C (오답): 일반적인 서비스 요금제 질문에 대한 답변으로 올바른 계정을 추론(Infer)하는 방식은 결제 및 금융 데이터 처리 시 심각한 보안 및 개인정보 위반을 유발합니다.
- Option D (오답): 가장 최근에 결제된 계정이라고 임의로 가정(Assuming)하고 처리하는 것은 타인의 계정을 잘못 수정하거나 환불하는 치명적인 오류를 초래합니다.

---

# 16. 문제

**1. 문제 원문**

An architect needs to understand how a refund flow touches the payments, ledger, and notification services before proposing a redesign. The main agent should stay focused on synthesizing the redesign proposal rather than tracing every function call itself. How should the architect structure this investigation?

A) Spawn a subagent with no specific instructions at all and simply let it independently decide which parts of the codebase are relevant to refunds.

B) Have the main agent open every file in the three services one at a time and keep each file's full contents in the conversation.

C) Delegate a subagent with the bounded question of tracing refund flow dependencies across the three services and report a distilled summary.

D) Ask the main agent to guess at the refund flow's dependencies based on similar flows it recalls from other codebases.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
C번: Delegate a subagent with the bounded question of tracing refund flow dependencies across the three services and report a distilled summary.

**정답 및 해설:**

**핵심 개념:**
에이전틱 아키텍처(Agentic Architecture)에서의 하위 작업 위임(Subagent Delegation) 및 컨텍스트 경계(Context Window Management) 관리 패턴입니다. 메인 에이전트는 고차원적인 분석 및 제안서 종합(Synthesis)에 집중하도록 하고, 세부적인 코드 탐색 및 파일 조회 작업은 명확한 질문 범위(Bounded Context)를 가진 서브에이전트에게 위임하여 핵심 요약 정보만 보고받게 설계하는 것이 모범 사례입니다.

**문제 상황 분석:**
- 아키텍트가 결제, 원장, 알림 서비스에 걸쳐 있는 환불 로직을 분석하고자 함.
- 메인 에이전트는 고차원적인 재설계 제안서 종합 작성을 담당해야 하며, 지루하고 긴 코드 호출 추적(Function Tracing) 과정으로 인해 메인 컨텍스트가 오염되는 것을 방지해야 함.
- 메인 에이전트의 컨텍스트 윈도우 효율성을 극대화하기 위한 작업 분담 및 서브에이전트 활용 구성을 찾아야 함.

**C번이 정답인 이유:**
세부적인 코드베이스 탐색 작업을 명확한 경계(Bounded question: 3개 서비스 간 환불 의존성 추적)를 지닌 서브에이전트에게 위임하고, 수집된 결과를 요약본(Distilled summary) 형태로 전달받아 메인 에이전트에 주입하는 방식이 가장 바람직합니다. 이를 통해 메인 에이전트는 방대한 소스코드 텍스트로 컨텍스트 윈도우가 가득 차는 현상(Context Bloat)을 막고 재설계 제안 종합이라는 핵심 과제에 집중할 수 있습니다.

**오답 분석:**
- Option A (오답): 서브에이전트에 명확한 지침이나 범위(Instruction) 없이 작업을 위임하면 탐색 방향을 잃고 비효율적이거나 불필요한 API 비용이 대량 발생합니다.
- Option B (오답): 3개 서비스의 모든 파일을 메인 에이전트 대화 창에 한 번에 하나씩 계속 열어두는 것은 컨텍스트 공간을 순식간에 고갈시키며 비용 증가 및 모델의 기억력 저하(Degradation)를 초래합니다.
- Option D (오답): 정확한 코드베이스를 탐색하지 않고 타 프로젝트 경험에 의존해 추측(Guess)하게 만드는 것은 근거 없는 환각(Hallucination) 및 잘못된 설계 제안을 유발합니다.

---

# 17. 문제

**1. 문제 원문**

A synthesis agent is finalizing a report that combines a subagent's structured findings about a software library's API surface with a subagent's narrative summary of community sentiment about the library. The draft currently renders the API findings as flowing prose paragraphs. What change would improve this section?

A) Render both the API findings and sentiment summary as a shared table with columns for finding type and source subagent

B) Render the API findings as a structured list of methods, parameters, and behaviors, keeping the sentiment summary as prose

C) Convert the community sentiment summary into a structured list of methods and parameters to match the API section's tone

D) Merge the API findings and sentiment summary into one continuous paragraph so the report reads as a unified narrative

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
B번: Render the API findings as a structured list of methods, parameters, and behaviors, keeping the sentiment summary as prose

**정답 및 해설:**

**핵심 개념:**
에이전트 출력물의 가독성 및 데이터 성격별 서식 구조화(Structural Scaffolding & Formatting Alignment) 모범 사례입니다. 메서드, 파라미터 등 정량적·기술적 명세 데이터(API Surface)는 리스트나 표 등의 구조화된 형식(Structured List/Table)을 사용할 때 가독성과 전달력이 극대화되는 반면, 정성적인 의견 및 여론 분석(Community Sentiment)은 맥락과 흐름을 담은 줄글(Narrative Prose) 형식이 가장 적합합니다.

**문제 상황 분석:**
- 종합 에이전트가 기술적 API 명세 데이터(구조화된 정보)와 커뮤니티 여론 요약(서사적 정보)을 하나의 보고서로 통합하고 있음.
- 현재 초안은 기술적인 API 명세 항목까지 빽빽한 줄글(Flowing prose paragraphs)로 렌더링하고 있어 가독성이 떨어짐.
- 서로 다른 성격의 두 데이터를 각각의 특성에 맞게 가장 효과적으로 서식화하는 방법을 찾아야 함.

**B번이 정답인 이유:**
메서드, 파라미터, 동작 방식과 같은 정교한 API 기술 명세는 줄글로 풀어서 쓰면 가독성이 떨어지므로, 항목별 리스트(Structured list of methods, parameters, and behaviors)로 표현하여 한눈에 파악(Scannability)할 수 있도록 만드는 것이 올바릅니다. 한편, 정성적인 커뮤니티 여론은 전체적인 맥락과 뉘앙스를 유지하기 위해 기존의 서사적 줄글 형태(Prose)를 유지하는 것이 각 데이터의 특성을 모두 살리는 최선의 보고서 작성 방식입니다.

**오답 분석:**
- Option A (오답): 서사적 맥락을 담고 있는 감정/여론 요약까지 출처 에이전트 라벨을 붙인 테이블 포맷으로 강제 변환하면 정성적 데이터의 맥락적 전달력이 손상됩니다.
- Option C (오답): 감정 요약 내용에 존재하지도 않는 '메서드 및 파라미터 리스트' 형식을 적용하려는 것은 데이터의 본질에 어긋나는 부적절한 변환입니다.
- Option D (오답): 기술 명세와 여론 요약을 하나의 긴 줄글 단락으로 합치는 것은 문제 상황에서 언급된 가독성 저하 문제를 더 악화시키는 방식입니다.


### 18번 문제

**1. 문제 원문**

A SaaS support chat has a customer raise a billing dispute (invoice #4821, $89.00 overcharge) and, later in the same conversation, a service outage affecting their workspace (incident started 2:15 PM, status: unresolved). The agent's single running narrative summary blends both threads, and a later reply about "the amount" ambiguously could refer to either issue. What should the agent do to avoid this ambiguity in future multi-issue sessions?

A) Maintain separate structured records per issue: log invoice number and amount for billing dispute, start time and status for outage.

B) Summarize only the most recent issue, such as the outage, and treat earlier issues like the billing dispute as resolved once a new topic arises.

C) Continue using one summary but add issue-type labels: "billing" for amounts, "outage" for times and statuses, to each mention of an amount or time.

D) Ask the customer to hold the outage issue until the billing dispute for invoice #4821 is fully resolved, to keep the session focused.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
A번: Maintain separate structured records per issue: log invoice number and amount for billing dispute, start time and status for outage.

**정답 및 해설:**

**핵심 개념:** 대화 맥락 관리(Context Management) 및 다중 이슈 추적(Multi-Issue Tracking) 설계. 복잡한 AI 상담 세션에서 서로 다른 성격의 데이터(청구 vs 장애)를 단일 텍스트 서술(Narrative)로 관리하면 맥락 혼동 및 모호성(Ambiguity)이 발생하므로, 이슈별 스키마를 분리하여 구조화된 데이터(Structured Records)로 관리해야 합니다.

**문제 상황 분석:**
- 하나의 고객 대화 세션 내에서 청구 분쟁($89.00 초과 청구)과 서비스 중단(오후 2:15 시작)이라는 두 가지 서로 다른 이슈가 발생함.
- 에이전트가 단일 서술형 문장으로 요약을 작성하면서 "금액(the amount)"이라는 표현이 어떤 이슈를 지칭하는지 모호해짐.
- 향후 다중 이슈 세션에서 이러한 정보 혼선을 방지하기 위한 시스템적/절차적 해결책이 필요함.

**A번이 정답인 이유:**
이슈마다 필요한 핵심 속성(청구: 청구서 번호, 금액 / 중단: 시작 시간, 해결 상태)이 상이합니다. 단일 텍스트 요약에 모든 맥락을 섞어 쓰지 않고, 이슈별로 독립된 구조화된 기록(Structured Key-Value 또는 별도 데이터 스키마)을 유지하면 각 이슈의 상태와 데이터가 완벽히 분리되어 모호성을 완전히 제거할 수 있습니다.

**오답 분석:**
- Option B (오답): 새로운 이슈가 나왔다고 해서 미해결된 이전 청구 분쟁 이슈를 강제로 "해결됨" 처리하는 것은 고객 지원 프로세스상 치명적인 오류를 야기합니다.
- Option C (오답): 단일 서술형 요약을 계속 유지하면서 단어마다 라벨만 붙이는 방식은 텍스트 복잡도를 높이고, 이슈가 추가될수록 맥락 오염(Context Contamination) 및 가독성 저하를 유발합니다.
- Option D (오답): 장애(Outage)와 같은 긴급한 기술 문제를 청구 문제가 해결될 때까지 보류하라고 고객에게 요구하는 것은 올바른 에이전트/지원 시스템의 대응 방식이 아닙니다.

---

### 19번 문제

**1. 문제 원문**

An architect needs to quickly locate the single function that computes a discount rate in a small module before making one edit. Spawning a subagent for this lookup would add coordination overhead disproportionate to the task. What should the architect do instead?

A) Disable all direct tool use in the main agent so that every lookup, however small, must go through delegation.

B) Have the main agent search and read the relevant file directly within its existing permitted and isolated context, because the lookup is small and targeted enough that subagent coordination overhead is not warranted.

C) Always spawn a subagent regardless of task size, since delegation is universally preferable for any exploration step.

D) Spawn several subagents in parallel to search for the same function redundantly, to cross-check each other's answers.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
B번: Have the main agent search and read the relevant file directly within its existing permitted and isolated context, because the lookup is small and targeted enough that subagent coordination overhead is not warranted.

**정답 및 해설:**

**핵심 개념:** 에이전트 아키텍처 설계(Agentic Architecture Design) 및 서브에이전트 위임 효율성(Subagent Delegation Efficiency).
에이전트 시스템에서 서브에이전트를 생성하고(Spawn), 프롬프트/컨텍스트를 전달하고, 결과를 다시 취합하는 과정에는 상당한 토큰 비용과 시간 오버헤드(Coordination Overhead)가 발생합니다. 따라서 범위가 넓은 탐색이나 독립적인 대규모 작업에는 위임(Delegation)이 유리하지만, 작고 명확한 단일 조회/수정 작업은 메인 에이전트가 직접 수행하는 것이 효율적입니다.

**문제 상황 분석:**
- 아키텍트는 작은 모듈 내에서 할인율을 계산하는 단 하나의 함수를 찾아 한 번 수정해야 합니다.
- 이 짧은 조회를 위해 서브에이전트를 생성하는 것은 작업의 크기에 비해 조율 오버헤드(Coordination Overhead)가 비효율적으로 큽니다.
- 따라서 위임 오버헤드를 줄이면서 효율적으로 목적을 달성할 수 있는 방안을 찾아야 합니다.

**B번이 정답인 이유:**
작업의 규모가 작고 대상이 명확한 경우, 메인 에이전트가 부여된 권한 및 컨텍스트 내에서 직접 파일 검색/읽기 도구(Grep, Read File 등)를 사용하는 것이 서브에이전트 생성에 따른 프롬프트 복사, 생성 및 결과 파싱 오버헤드를 방지하는 가장 최적의 아키텍처 패턴입니다.

**오답 분석:**
- Option A (오답): 메인 에이전트의 직접 도구 사용을 비활성화하면 단순한 탐색 작업조차 불필요한 위임을 거치게 되어 시스템 전체의 레이턴시와 토큰 비용이 폭증합니다.
- Option C (오답): 작업의 크기와 무관하게 항상 서브에이전트를 생성하는 것은 자원 낭비이며 비효율적인 설계 모범 사례(Antipattern)입니다.
- Option D (오답): 단일 함수 조회를 위해 병렬로 여러 서브에이전트를 중복 생성하는 것은 자원 오버헤드를 극대화하는 잘못된 대응 방식입니다.

---

### 20번 문제

**1. 문제 원문**

An architect is about to delegate a codebase investigation to a subagent and is deciding how to phrase the instruction. Which instruction best supports getting a targeted, high-quality summary back without still burdening the main agent's context?

A) Give the subagent no instructions at all and let it infer the goal from the main conversation's git status.

B) 'Report back the full, unsummarized contents of every single file you happen to open during the investigation.'

C) 'Trace refund flow dependencies across payments, ledger, and notifications, and summarize what you find.'

D) 'Look around the codebase for a while and report back anything you happen to find interesting.'

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
C번: 'Trace refund flow dependencies across payments, ledger, and notifications, and summarize what you find.'

**정답 및 해설:**

**핵심 개념:** 서브에이전트 위임(Subagent Delegation) 및 컨텍스트 관리(Context Window Optimization).
서브에이전트에게 작업을 위임할 때는 조사 대상과 목적을 구체적이고 명확하게(Targeted Prompting) 지정해야 합니다. 또한, 서브에이전트가 탐색한 방대한 원본 데이터를 모두 메인 에이전트에 반환하면 컨텍스트 오염 및 비용 증가가 발생하므로, 핵심 결과만 요약하여 반환하도록 지시하는 것이 최적의 프롬프트 모범 사례입니다.

**문제 상황 분석:**
- 메인 에이전트의 컨텍스트 창(Context Window)에 불필요한 부담을 주지 않아야 함.
- 코드베이스 조사 결과로서 정밀하고 고품질의 요약(Targeted, High-Quality Summary)을 받아야 함.
- 서브에이전트가 목적에 맞는 명확한 가이드라인을 가지고 조사 업무를 수행하도록 프롬프트를 구성해야 함.

**C번이 정답인 이유:**
조사할 특정 도메인 범위('환불 흐름 의존성: 결제, 원장, 알림')를 구체적으로 명시함과 동시에, 불필요한 전체 코드 내용을 넘기지 않고 발견된 핵심 내용을 '요약하여 보고(summarize what you find)'하도록 명확히 지시하고 있습니다. 이를 통해 서브에이전트의 불필요한 탐색을 줄이고 메인 에이전트의 컨텍스트 공간을 효율적으로 보존할 수 있습니다.

**오답 분석:**
- Option A (오답): 지시사항을 전혀 제공하지 않고 git 상태만으로 목적을 추론하게 만들면 비결정적 동작 및 작업 실패 가능성이 높아집니다.
- Option B (오답): 열어본 모든 파일의 요약되지 않은 전체 내용을 반환하도록 지시하는 것은 메인 에이전트의 컨텍스트 오버헤드를 극대화하므로 서브에이전트를 사용하는 목적에 정면으로 위배됩니다.
- Option D (오답): "잠시 둘러보고 흥미로운 것을 보고하라"는 모호하고 광범위한 지시로, 무의미한 탐색 토큰을 소모하고 불명확한 결과를 반환하게 됩니다.

---

### 21번 문제

**1. 문제 원문**

An architect is designing a multi-agent system that explores a large codebase over a run that may take hours and could be interrupted by a process crash. They want the run to resume cleanly rather than restart from zero. How should the system be structured to support this?

A) Rely on the conversation history staying in context indefinitely, since the coordinator will always remember every agent's progress unaided.

B) Restart the entire exploration from the beginning any time the process is interrupted, since partial progress cannot be recovered.

C) Have each agent keep its state only in its own memory during execution, without writing anything the coordinator can read later.

D) Each agent exports its state to a known file location as it progresses, and the coordinator loads a manifest of agent states on resume.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: Each agent exports its state to a known file location as it progresses, and the coordinator loads a manifest of agent states on resume.

**정답 및 해설:**

**핵심 개념:** 에이전트 상태 영속성(State Persistence) 및 재개 가능 아키텍처(Resumable System Architecture).
장시간 실행되는 멀티 에이전트 시스템에서는 프로세스 충돌(Crash), 시스템 중단, 인프라 장애 시 작업 손실을 방지하기 위해 각 에이전트의 상태(State)와 진행 상황(Progress)을 디스크나 외부 저장소에 지속적으로 체크포인팅(Checkpointing)해야 합니다.

**문제 상황 분석:**
- 대규모 코드베이스를 탐색하는 작업이 수 시간 동안 지속될 수 있으며, 프로세스 충돌로 중단될 위험이 있음.
- 시스템 재시작 시 처음부터 작업을 다시 실행하는 비용을 방지하고, 중단된 시점부터 정상적으로 재개(Clean Resume)해야 함.
- 이를 보장하기 위한 시스템 상태 저장 및 복구(State Management & Recovery) 패턴이 필요함.

**D번이 정답인 이유:**
각 에이전트가 작업을 진행함에 따라 자신의 현재 상태를 미리 정해진 파일 위치(영속적 저장소)에 지속적으로 기록(Export)하고, 코디네이터가 시스템 재개 시 각 에이전트의 상태가 담긴 매니페스트(Manifest)를 로드하여 중단된 위치부터 작업을 계속 이어나가게 하는 구조가 복구 가능한 멀티 에이전트 아키텍처의 모범 사례입니다.

**오답 분석:**
- Option A (오답): 프로세스가 충돌하면 인메모리 컨텍스트와 대화 기록은 모두 소실되므로, 대화 기록이 컨텍스트에 영구히 남아있을 것이라고 전제하는 것은 잘못된 접근입니다.
- Option B (오답): 프로세스가 중단될 때마다 처음부터 다시 시작하도록 설계하면 수 시간의 작업 비용과 토큰이 낭비되며 문제 요구사항(Clean Resume)에 정면으로 반합니다.
- Option C (오답): 상태를 휘발성 메모리에만 유지하고 지속성 저장소에 기록하지 않으면 프로세스 다운 시 모든 데이터가 손실되어 재개가 불가능해집니다.

---

### 22번 문제

**1. 문제 원문**

An insurance customer asks whether their policy covers a rental car while their electric vehicle's battery is being replaced under a separate manufacturer recall. The policy documentation addresses rental reimbursement only for collision and comprehensive claims, and does not mention manufacturer recall repairs. What should the agent do?

A) Deny rental reimbursement, since the recall repair is not listed among the covered claim types

B) Approve rental reimbursement, since recall repairs are similar enough in nature to comprehensive collision claims

C) Direct the customer to the manufacturer, since the recall is the underlying cause of the repair

D) Escalate the question, since the policy documentation does not address this specific recall-related scenario

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: Escalate the question, since the policy documentation does not address this specific recall-related scenario

**정답 및 해설:**

**핵심 개념:** AI 에이전트의 안전한 환각 방지 및 에스컬레이션(Escalation) 패턴.
AI 지원 시스템이나 지식 기반(RAG) 에이전트가 주어진 컨텍스트(약관, 지식베이스 등)에 명시되어 있지 않은 모호하거나 미다뤄진 시나리오를 만났을 때, 임의로 유권해석을 내리거나 판단을 내조(Hallucination/Omission Error)하지 않고 안전하게 관리자나 인간 전문가에게 에스컬레이션하는 안전 가이드라인입니다.

**문제 상황 분석:**
- 고객은 전기차 제조사 리콜 수리 동안 렌터카 비용 보장이 가능한지 문의함.
- 제공된 보험 약관 문서에는 '충돌(Collision)' 및 '종합(Comprehensive)' 청구에 대한 렌터카 보장만 언급되어 있으며, '제조사 리콜 수리'에 대한 보장 유무는 전혀 언급되어 있지 않음(기재 생략/지식 공백 상태).
- 에이전트가 스스로 보장 여부를 거절하거나 승인하는 유권해석을 내리기에는 정책적 명확성이 부족한 상황임.

**D번이 정답인 이유:**
약관 문서에 특정 리콜 관련 시나리오가 명시적으로 명시되어 있지 않은 경우, AI 에이전트가 지식베이스에 없는 내용을 임의로 단정 지어 승인/거절을 결정하거나 타사로 고객을 넘겨버리면 법적·운영상 위험이 발생합니다. 따라서 지식의 공백이나 예외적 시나리오가 발생했을 때 가장 안전하고 적절한 조치는 해당 문의를 상급 부서나 인간 상담사에게 이관(Escalate)하는 것입니다.

**오답 분석:**
- Option A (오답): 약관에 명시되지 않았다고 해서 에이전트가 단독으로 거절을 단정 짓는 것은, 약관의 미비점이나 회사 차원의 예외적 보장 방침이 있을 수 있으므로 성급한 자의적 판단입니다.
- Option B (오답): 리콜 수리가 종합/충돌 청구와 유사하다는 임의 추론(환각)을 바탕으로 보장을 승인하는 것은 심각한 운영 및 금융 리스크를 야기합니다.
- Option C (오답): 자사 보험의 보장 가능 여부에 대한 명확한 확인 없이 고객을 바로 제조사로 안내하여 책임을 회피하는 것은 올바른 고객 응대 절차가 아닙니다.

---

### 23번 문제

**1. 문제 원문**

A main agent is coordinating exploration of a repository with over 50,000 files and needs a complete list of every test file before planning a coverage audit. Running the search directly would flood the main conversation with thousands of matched paths it will not need again. What best keeps the main agent's context focused on high-level coordination while still producing the list?

A) Spawn a subagent to search for test files and return only the consolidated list, leaving the raw output isolated in its own context.

B) Read every file in the repository sequentially in the main agent to identify which ones are tests by inspecting their contents.

C) Ask the user to manually paste the list of test file paths into the conversation before continuing with the audit.

D) Run the search directly in the main agent and keep the entire raw output in the conversation in case it needs to be referenced again later.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
A번: Spawn a subagent to search for test files and return only the consolidated list, leaving the raw output isolated in its own context.

**정답 및 해설:**

**핵심 개념:** 멀티 에이전트 아키텍처(Subagent Spawning) 및 컨텍스트 윈도우 효율화(Context Window Optimization). 대규모 출력이 발생하는 작업은 독립된 서브에이전트에게 위임하여 메인 에이전트의 컨텍스트 오염을 방지합니다.

**문제 상황 분석:**
- 50,000개 이상의 파일이 포함된 대형 리포지토리에서 모든 테스트 파일 목록 추출이 필요함
- 메인 에이전트에서 직접 검색 작업을 실행할 경우 수천 줄의 raw 검색 결과가 메인 대화 컨텍스트에 포함되어 컨텍스트 낭비 및 오염 발생
- 메인 에이전트가 고수준의 계획 및 조정(High-level Coordination)에 집중할 수 있도록 컨텍스트를 깔끔하게 유지해야 함

**A번이 정답인 이유:**
서브에이전트(Subagent)를 격리된 컨텍스트 공간에서 실행하면, 수천 개의 검색 결과 처리 등 토큰 소비가 많은 작업을 서브에이전트 내부에서 마칠 수 있습니다. 서브에이전트는 최종 요약/정리된 결과(테스트 파일 목록)만 메인 에이전트에 반환하므로, 메인 에이전트는 중요한 조율 작업에 집중하면서 컨텍스트 윈도우를 효율적으로 보존할 수 있습니다.

**오답 분석:**
- Option B (오답): 50,000개 파일의 내용을 순차적으로 읽는 것은 극심한 성능 저하, 과도한 API 토큰 비용, 컨텍스트 초과(Context Overflow) 문제를 일으킵니다.
- Option C (오답): 자율적인 에이전트 시스템 설계에 어긋나며, 수천 개 파일 목록을 사용자가 수동으로 붙여넣도록 하는 것은 비효율적이고 불필요한 사용자 개입을 요구합니다.
- Option D (오답): 문제에서 지적한 "메인 대화 컨텍스트 오염 및 낭비" 문제를 전혀 해결하지 못하고 그대로 방치하는 방식입니다.

---

### 24번 문제

**1. 문제 원문**

A vendor pitches a document-processing tool that claims '99% accuracy, no human review needed.' Before adopting it for a regulated workflow, an architect wants to stress-test this claim using the same rigor the team applies to its own Claude-based pipelines. Which question is most important to ask the vendor?

A) Can you provide a written guarantee that the 99% figure will not decline over time, so the team has contractual recourse if accuracy drops after deployment?

B) Can you provide the accuracy breakdown by document type and field, along with the labeled validation methodology used to produce the 99% figure, rather than just the aggregate number?

C) Can you confirm the tool uses the newest available model version, since model recency is the strongest predictor of whether an accuracy claim will hold up in production?

D) Can you confirm the 99% figure was measured on a sample of at least ten thousand documents, since larger sample sizes are the primary determinant of a metric's trustworthiness?

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
B번: Can you provide the accuracy breakdown by document type and field, along with the labeled validation methodology used to produce the 99% figure, rather than just the aggregate number?

**정답 및 해설:**

**핵심 개념:** AI 모델 검증 및 평가(Model Evaluation & Validation), 필드별/문서별 세부 평가(Granular Accuracy Breakdown), 데이터 불균형 및 벤치마크 편향 방지.

**문제 상황 분석:**
- 벤더가 규제 대상(Regulated) 워크플로에 적용할 문서 처리 AI 도구를 제안하며 "99% 정확도, 사람 검토 불필요"라는 단일 지표를 주장함.
- 아키텍트는 자체 Claude 기반 파이프라인에 적용하는 엄격한 엔지니어링 표준을 기준으로 이 주장을 검증하려 함.
- 규제 워크플로에서는 단일 집계 수치(Aggregate Number)보다 특정 핵심 필드(예: 주민등록번호, 금액, 계약 조건 등)의 치명적 오류 여부와 정밀한 검증 방법론이 훨씬 중요함.

**B번이 정답인 이유:**
AI 파이프라인 검증에서 단일 합산 정확도(Aggregate Accuracy)는 착시를 일으키기 쉽습니다. 예를 들어, 쉬운 텍스트 라벨이 99개이고 중요 수치 필드가 1개일 때 후자를 틀려도 전체 정확도는 99%로 표기될 수 있습니다. 규제 워크플로에서는 문서 유형별, 필드별 세부 정확도 분해(Granular Breakdown)와 Ground Truth 라벨링 검증 방법론을 확인하는 것이 기술적 검증의 핵심입니다.

**오답 분석:**
- Option A (오답): 서면 보증이나 계약적 구제는 기술적/엔지니어링 차원의 검증(Stress-testing)이 아닌 법적/비즈니스적 보호 장치에 불과합니다.
- Option C (오답): 모델의 최신성(Recency)이 운영 환경에서의 정확성을 보장하는 가장 강력한 예측 변수가 아니며, 최신 모델이라도 도메인 맞춤 검증 없이는 실패할 수 있습니다.
- Option D (오답): 단순히 샘플 수(10,000개)만 늘린다고 해서 데이터의 분포, 필드별 난이도, 라벨 품질 문제가 해결되지 않으므로 수치 신뢰성의 유일한 결정 요인이 될 수 없습니다.

---

### 25번 문제

**1. 문제 원문**

A bank's monitoring system flags a conversation as having very negative sentiment because the customer used sharp language while asking the agent to reset their online banking password, a routine, fully self-service-eligible request. Should the agent escalate based on the sentiment flag?

A) Yes, negative sentiment scores reliably indicate that a case is too complex for the agent to resolve

B) No, sentiment alone is not a reliable indicator of complexity, and the password reset is within the agent's capability

C) Yes, the negative sentiment flag should always trigger escalation regardless of the actual underlying issue difficulty

D) No, but only because password resets are always exempt from any sentiment-based escalation rules

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
B번: No, sentiment alone is not a reliable indicator of complexity, and the password reset is within the agent's capability

**정답 및 해설:**

**핵심 개념:** AI 감정 분석(Sentiment Analysis) 지표의 한계 및 에스컬레이션(Escalation) 판단 로직. 감정 지표는 문제의 복잡도나 기술적 해결 가능 여부와 직접적인 연관이 없으므로, 작업의 실행 가능성 및 난이도를 종합적으로 판단해야 합니다.

**문제 상황 분석:**
- 고객이 날카로운 어조(Sharp Language)를 사용함에 따라 모니터링 시스템이 '매우 부정적인 감정(Very negative sentiment)'으로 대화를 플래그 처리함.
- 그러나 고객의 요청 사항은 '온라인 뱅킹 비밀번호 재설정'으로, 매우 일상적이고 셀프서비스 처리까지 가능한 단순 작업임.
- 감정 분석 결과만으로 에이전트/상담원이 상급자나 타 부서로 문제를 이관(Escalate)해야 하는지 여부를 판단해야 함.

**B번이 정답인 이유:**
고객의 감정(Sentiment) 상태와 요청된 문제의 기술적 복잡도(Complexity)는 별개의 요소입니다. 단순히 어조나 태도가 부정적이라고 해서 문제 자체가 복잡하거나 에이전트가 해결할 수 없는 수준인 것은 아닙니다. 비밀번호 재설정은 에이전트의 권한 및 능력 범위 내에 있는 명확한 표준 요청이므로, 단지 감정 플래그가 떴다는 이유만으로 불필요한 이관(Escalation)을 수행해서는 안 됩니다.

**오답 분석:**
- Option A (오답): 부정적인 감정 점수가 높은 문제 복잡도를 보장하지 않으므로, 이를 신뢰할 수 있는 지표로 보고 이관하는 것은 잘못된 판단입니다.
- Option C (오답): 문제의 난이도와 무관하게 감정 플래그만으로 조건 없이 이관을 수행하면 불필요한 이관 비용이 발생하고 상담 프로세스가 비효율적으로 변합니다.
- Option D (오답): 비밀번호 재설정이라는 특정 항목이 감정 기반 이관 규칙에서 무조건 예외 처리되는 일괄적인 면제 규칙이 존재하는 것은 아닙니다. 이관을 하지 않는 이유는 작업 자체가 상담원 역량 범위 내의 일상적 업무이기 때문입니다.

---

### 26번 문제

**1. 문제 원문**

An airline customer is annoyed about being assigned a middle seat and messages support. The agent offers to move them to an aisle seat directly. The customer replies: 'No, I said I want to talk to an actual person about this.' What should the agent do now?

A) Ask the customer to clarify why the automated resolution is not acceptable before escalating further

B) Proceed to change the seat assignment and inform the customer of the change without further discussion

C) Escalate the conversation to a human agent now, since the customer has reiterated their preference for one

D) Repeat the offer to fix the seat assignment, since the request is simple and within the agent's capability

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
C번: Escalate the conversation to a human agent now, since the customer has reiterated their preference for one

**정답 및 해설:**

**핵심 개념:** AI 에이전트의 상담 이관(Human Escalation / Human-in-the-Loop) 가이드라인. 고객이 상담원(사람)과의 대화를 명시적으로 거듭 요청하는 경우, AI는 추가 설득이나 작업 강행을 멈추고 즉시 사람 상담원에게 제어권을 넘겨야 합니다.

**문제 상황 분석:**
- 고객이 중간 좌석 배정에 불만을 갖고 고객 지원에 문의함.
- AI 에이전트가 통로 좌석으로 변경해 주겠다고 제안했으나, 고객은 이를 거부하고 "실제 사람과 이야기하고 싶다"고 재차 강조함.
- 고객의 명시적 이관 요청 요구에 대해 AI 에이전트가 취해야 할 최선의 행동을 결정해야 함.

**C번이 정답인 이유:**
AI 상담 시스템 설계의 핵심 원칙 중 하나는 고객이 상담원(사람) 연결을 명시적으로 요구할 때 이를 방해하지 않고 신속히 이관(Escalation)하는 것입니다. 자율적인 문제 해결 능력이 있는 작업이라도 고객이 사람과의 대화를 지속적으로 강력히 원할 때는 AI가 고집스럽게 프로세스를 이어가지 않고 즉시 사람 상담원에게 전달해야 고객 경험 저하와 불만을 방지할 수 있습니다.

**오답 분석:**
- Option A (오답): 고객에게 왜 자동 해결을 거부하는지 반문하며 밝혀달라고 요구하는 것은 이미 짜증이 난 고객의 불만을 크게 악화시키는 불필요한 마찰을 유발합니다.
- Option B (오답): 고객의 거부 의사와 사람 연결 요청을 무시하고 좌석 변경을 일방적으로 강행하는 것은 고객 지시 위반이자 거부감을 유발하는 조치입니다.
- Option D (오답): 아무리 요청 과제가 단순하고 AI의 처리 가능 범위 내에 있다 하더라도, 사람 연결을 거듭 요구하는 고객에게 동일한 AI 제안을 반복하는 것은 고객을 더 좌절하게 만듭니다.

---

### 27번 문제

**1. 문제 원문**

A regulatory-filings subagent cannot reach its data provider because the provider's API key expired. Instead of surfacing the failure, the subagent returns an empty findings list with status 'success' so the pipeline continues cleanly. The coordinator later synthesizes a report claiming full regulatory coverage. What went wrong?

A) The subagent correctly avoided alarming the coordinator about a minor credential issue that would resolve on the next scheduled data run

B) The coordinator is at fault for trusting subagent output; every subagent result should require manual verification instead

C) The subagent should have terminated the entire multi-agent workflow rather than letting any other subagents keep running

D) The subagent silently suppressed an access failure as success, so the coordinator reported false full coverage instead of a real gap

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: The subagent silently suppressed an access failure as success, so the coordinator reported false full coverage instead of a real gap

**정답 및 해설:**

**핵심 개념:** 에이전트 오류 전파(Error Propagation) 및 상태 보고(Status Reporting), 멀티 에이전트 오케스트레이션에서의 조용한 실패(Silent Failure) 방지 원칙.

**문제 상황 분석:**
- 데이터 제공자의 API 키 만료로 인해 서브에이전트가 실제 데이터를 수집하지 못함.
- 서브에이전트가 오류를 상위 에이전트(Coordinator)에 명시적으로 전달하지 않고, 결과 목록을 비워둔 채 상태값을 'success'로 조용히 은폐(Silent Suppression)함.
- 그 결과, 코디네이터는 실패나 데이터 누락 사실을 알지 못한 채 데이터가 없는 것을 '규제 항목에 이상 없음(Full Coverage)'으로 잘못 해석하여 왜곡된 보고서를 작성함.

**D번이 정답인 이유:**
서브에이전트가 API 접근 실패라는 명확한 오류 상황을 발생시켰음에도 이를 정상 처리(`status: 'success'`)된 것처럼 은폐했기 때문에 파이프라인의 환각(Hallucination) 및 오보를 유발했습니다. 에이전트 시스템 설계에서 장애나 데이터 누락은 명시적인 오류 코드나 상태값으로 적절히 상위 시스템에 노출되어야만 코디네이터가 올바른 판단(예: 빈 데이터와 접근 불가 상태의 구분)을 할 수 있습니다.

**오답 분석:**
- Option A (오답): API 키 만료로 인한 데이터 미수집은 규제 보고서의 정확성을 근본적으로 훼손하는 심각한 오류이므로 "사소한 문제"로 무시하고 넘어가는 것이 정당화될 수 없습니다.
- Option B (오답): 서브에이전트의 모든 출력을 사람이 매번 수동 검증해야 한다면 자동화 에이전트 시스템 구축 목적에 위배되며, 근본적 원인은 잘못된 상태값을 반환한 서브에이전트에 있습니다.
- Option C (오답): 단일 서브에이전트의 인프라 실패가 발생했다고 해서 전체 멀티 에이전트 시스템 전체를 즉시 강제 종료(Terminate)시키는 것은 과도하며, 에러를 상위 코디네이터에게 알리고 부분 재시도나 대체 로직을 수행하는 것이 바람직합니다.

---

### 28번 문제

**1. 문제 원문**

Late in a multi-hour exploration session, an architect asks the agent to describe the error-handling pattern in the billing service. Earlier, a subagent had discovered that the service uses a custom Result type instead of exceptions. The agent now answers that the service 'typically uses try/catch with logging,' contradicting the earlier finding. What is the most likely cause, and what should the architect have done to prevent it?

A) The model experienced a technical malfunction that can only be resolved by restarting the Claude Code application entirely.

B) The agent lacked permission to read the billing service's files, so it fabricated a plausible-sounding answer instead.

C) A network interruption corrupted the agent's understanding of the billing service partway through the session.

D) The finding degraded out of active context over the long session; a scratchpad record would have kept the answer grounded.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: The finding degraded out of active context over the long session; a scratchpad record would have kept the answer grounded.

**정답 및 해설:**

**핵심 개념:** 컨텍스트 윈도우 유실(Context Degradation/Loss) 및 스크래치패드/지속성 메모리(Scratchpad / Persistent Memory) 활용 패턴. 장시간 대화 세션에서는 이전 대화 내역이 컨텍스트 한계로 인해 누락되므로, 중요한 사실을 스크래치패드나 노트 파일에 명시적으로 기록해 두어야 근거 있는 답변을 유지할 수 있습니다.

**문제 상황 분석:**
- 수시간에 걸쳐 진행된 장기 탐색 세션 후반부에 문제 발생
- 세션 초반 서브에이전트가 "청구 서비스는 예외 처리 대신 커스텀 Result 타입을 사용함"을 발견함
- 장시간 세션 진행 후 메인 에이전트가 이 사실을 잊어버리고 "try/catch 구조를 사용한다"라며 이전에 발견한 사실과 상충되는 일반적인 환각(Hallucination) 답변을 생성함

**D번이 정답인 이유:**
대규모 언어 모델(LLM) 기반 에이전트는 세션이 길어짐에 따라 컨텍스트 윈도우의 제한이나 절단(Truncation)으로 인해 세션 초반의 구체적인 발견 사항을 잃어버리게 됩니다(Context Degradation). 탐색 과정에서 수집된 핵심 발견 사항을 지속적인 외부 메모리 역할인 스크래치패드(Scratchpad)나 전용 문서/파일에 즉시 기록해 두면, 에이전트가 긴 세션 동안에도 항상 검증된 정보에 기반하여(Grounded) 정확한 답변을 유지할 수 있습니다.

**오답 분석:**
- Option A (오답): 애플리케이션 전체 재시작이 필요한 내부 오류가 아니라, 단순 컨텍스트 유실로 인한 전형적인 환각 현상입니다.
- Option B (오답): 권한 부족 문제가 아니며, 세션 초반에는 서브에이전트가 성공적으로 파일에 접근하여 정확한 정보를 발견했었습니다.
- Option C (오답): 네트워크 중단이 에이전트의 상태나 이해를 세션 도중 '손상(Corrupt)'시킨다는 설명은 기술적으로 타당하지 않습니다.

---

### 29번 문제

**1. 문제 원문**

A logistics company's bill-of-lading extraction pipeline shows 94% field accuracy in aggregate. A new architect discovers that the 'weight' field is correct only 70% of the time specifically when the source document's units are ambiguous (for example, a number with no unit label present). All other conditions for the weight field exceed 95%. What review policy should be applied to the weight field going forward?

A) Leave the weight field's review policy unchanged for all documents, since the field's blended 94% aggregate accuracy across the pipeline already meets the general accuracy bar.

B) Increase the model's temperature setting when extracting the weight field so it generates a wider range of candidate values for reviewers to choose from.

C) Remove the weight field from automated extraction entirely and require full manual entry for every bill of lading, regardless of whether units are specified.

D) Route the weight field to human review whenever the source document does not clearly specify units, while allowing high-confidence, unambiguous cases to bypass review.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: Route the weight field to human review whenever the source document does not clearly specify units, while allowing high-confidence, unambiguous cases to bypass review.

**정답 및 해설:**

**핵심 개념:** 선택적 사람 개입 및 인간-인공지능 협업 패턴(Human-in-the-Loop & Targeted Routing). 시스템의 전반적인 효율성을 유지하면서 특정 모호한 조건에서 발생하는 에러 위험만 선별적으로 차단하는 운영 정책 설계입니다.

**문제 상황 분석:**
- 전체 파이프라인의 합산 정확도는 94%로 높지만, 원본 문서에 단위가 명시되지 않은 모호한 경우에 '무게' 필드 정확도가 70%로 급격히 하락함.
- 단위가 명확한 일반 상황에서는 95% 이상의 높은 정확도를 보임.
- 자동화의 효율성을 유지하면서 불확실한 모호 조건에서의 오류를 방지하기 위한 최선의 검토 정책(Review Policy)을 결정해야 함.

**D번이 정답인 이유:**
단위가 명시되지 않은 불확실한(Ambiguous) 조건만 선별하여 사람의 검토(Human Review)로 보류/라우팅하고, 단위가 명확하여 신뢰도가 높은 대다수 케이스는 사람이 검토하지 않고 즉시 자동 통과(Bypass)시키는 것이 효율성과 정확성을 동시에 확보하는 가장 이상적인 Human-in-the-Loop 설계입니다.

**오답 분석:**
- Option A (오답): 전체 합산 정확도(94%) 착시에 속아 모호한 문서에서 발생하는 30%의 높은 오류율을 방치하는 것은 위험한 방임적 조치입니다.
- Option B (오답): Temperature를 올리면 생성의 무작위성(Randomness)이 증가하여 추출의 정확도가 더욱 떨어지고 잘못된 후보값만 양산하게 됩니다.
- Option C (오답): 95% 이상의 높은 정확도를 보이는 모호하지 않은 정상 문서들까지 포함하여 모든 문서의 무게 필드를 전면 수동 입력으로 전환하는 것은 과도한 인력 낭비이자 자동화 시스템 도입 목적을 훼손합니다.

---

### 30번 문제

**1. 문제 원문**

A large multi-agent exploration run is paused partway through, with several agents already having completed and returned results. The architect resumes the run within the same session. What happens to the agents that had already completed?

A) Every agent, including the ones that already completed, is re-run from the beginning of the workflow.

B) The run can only be resumed by exiting and starting an entirely new Claude Code installation on the machine.

C) All previously completed results are discarded and the run cannot be resumed at all after being paused.

D) Their cached results are reused, and only the remaining, not-yet-completed agents run live.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: Their cached results are reused, and only the remaining, not-yet-completed agents run live.

**정답 및 해설:**

**핵심 개념:** 멀티 에이전트 실행 재개(Resume Execution) 및 캐싱 메커니즘(Result Caching). 동일한 세션 내에서 중단된 워크플로를 재개할 때, 에이전트 시스템은 이미 성공적으로 수행된 하위 작업의 결과를 캐싱하여 불필요한 재계산 및 토큰 소비를 방지합니다.

**문제 상황 분석:**
- 대규모 멀티 에이전트 탐색 워크플로가 실행되는 도중 일시 정지(Pause)됨.
- 전체 에이전트 중 일부는 이미 작업을 완수하고 반환된 결과를 가지고 있음.
- 아키텍터가 동일한 세션 내에서 작업을 다시 재개(Resume)할 때, 이미 성공적으로 완수된 에이전트들의 처리 방식에 대해 묻고 있음.

**D번이 정답인 이유:**
에이전트 오케스트레이션 엔진은 동일한 세션 내에서 재개 시 상태 저장 및 캐싱(State Persistence & Caching) 메커니즘을 적극 활용합니다. 이미 완료되어 결과가 반환된 에이전트 작업은 캐시된 결과를 재사용(Reuse)하여 무駄한 API 호출과 시간/비용 낭비를 막고, 아직 완료되지 않은 미처리 에이전트만 선별하여 실제 연산을 재개합니다.

**오답 분석:**
- Option A (오답): 이미 완료된 작업까지 처음부터 무조건 재실행하는 것은 컴퓨팅 자원과 토큰을 극심하게 낭비하는 비효율적인 방식입니다.
- Option C (오답): 이전 완료 결과를 모두 폐기하거나 일시 정지 후 재개가 불가능하다는 설명은 상태 관리 시스템의 동작 원리에 위배됩니다.
- Option B (오답): 애플리케이션 설치 자체를 다시 하거나 새로 시작해야만 재개할 수 있다는 것은 기술적으로 타당하지 않은 자원 낭비성 조치입니다.

---

### 31번 문제

**1. 문제 원문**

A billing support agent has been summarizing a lengthy chat every few turns to keep the prompt short. After the third summarization pass, the running summary reads "the customer wants a refund soon and mentioned an order from last month," even though the original messages contained an exact order number, a refund amount of $214.88, and a customer-stated deadline of the 15th. Which practice best addresses this failure mode going forward?

A) Increase the frequency of summarization passes so numeric details are refreshed more often before they are dropped

B) Have the customer restate the order number, refund amount, and deadline at the start of every new conversation turn

C) Track the order number, exact refund amount, and stated deadline in a persistent case-facts block included in every prompt

D) Switch to a model with the largest available context window so the transaction history never needs summarizing

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
C번: Track the order number, exact refund amount, and stated deadline in a persistent case-facts block included in every prompt

**정답 및 해설:**

**핵심 개념:** 상태 보존 구조(State Persistence) 및 대화 요약에서의 정보 손실 방지(Preventing Information Loss in Summarization). 반복적인 대화 요약(Iterative Summarization) 시 정밀한 수치나 식별자(주문 번호, 금액, 날짜 등)가 유실되는 문제(Information Degradation)를 막기 위해, 핵심 사실 관계(Case-Facts)를 별도의 고정 블록으로 상태 저장하고 매 프롬프트마다 주입하는 패턴입니다.

**문제 상황 분석:**
- 긴 대화 맥락을 축소하기 위해 반복적으로 요약(Summarization Pass)을 실행함.
- 연쇄적인 요약 과정에서 주문 번호, 환불 금액($214.88), 마감일(15일)과 같은 중요하고 정확한 세부 정보가 사라지고 추상적인 문장("지난달 주문 환불 요청")으로 퇴화함.
- 이와 같은 수치/식별자 정보 유실을 근본적으로 방지할 수 있는 시스템 설계 조치를 찾아야 함.

**C번이 정답인 이유:**
대화 요약 알고리즘은 텍스트를 압축하는 과정에서 세부적인 숫자나 특수 식별자를 생략하는 경향이 있습니다. 따라서 절대 누락되어서는 안 되는 정밀 정보(주문 번호, 금액, 마감일 등)는 요약 대상 텍스트에 포함시키지 않고, 시스템 프롬프트나 맥락 내의 고정적인 "지속성 사건 데이터 블록(Persistent Case-Facts Block)"에 별도로 격리하여 매 턴마다 유지되도록 구조화하는 것이 가장 효과적인 해결책입니다.

**오답 분석:**
- Option A (오답): 요약 주기를 더 자주 반복하더라도 압축 알고리즘 자체가 세부 수치를 생략하는 특성을 가지므로 정보 유실 현상을 피할 수 없으며, 오히려 요약 횟수가 늘어날수록 유실이 가속화될 수 있습니다.
- Option B (오답): 시스템 측면의 핵심 정보 보존 실패를 사용자에게 매 턴마다 다시 입력하도록 요구하는 것은 매우 왜곡된 사용자 경험(UX)을 제공합니다.
- Option D (오답): 컨텍스트 윈도우 크기를 늘리는 것만으로는 긴 대화 세션에서 발생하는 토큰 비용 증가, 응답 지연 시간 증가, 맥락 내부에서의 정보 검색 능력 저하(Needle-In-A-Haystack 문제)를 근본적으로 해결하지 못하며 요약 기법의 필요성을 완전히 대체할 수 없습니다.

---

### 32번 문제

**1. 문제 원문**

A competitive-intelligence coordinator asks three subagents to gather pricing pages from three competitor websites. One competitor's site returns a 403 because the subagent's fetch was blocked by anti-bot protection after two local retry attempts. The other two subagents succeed. When the coordinator synthesizes the final comparison report, what should it do about the blocked competitor?

A) Include the two successful comparisons and annotate that the third competitor's pricing is unavailable

B) Withhold the entire report until the anti-bot block can somehow be resolved, however long that may take

C) Present a full three-way comparison, filling the blocked competitor's pricing with a market-trend estimate

D) Present a full three-way comparison without any note, since two of three competitors is close enough

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
A번: Include the two successful comparisons and annotate that the third competitor's pricing is unavailable

**정답 및 해설:**

**핵심 개념:** 부분적 실패 처리(Partial Failure Handling) 및 에이전트 투명성(Agent Transparency/Groundedness). 분산된 멀티 에이전트 시스템에서 일부 데이터 수집 실패가 발생하더라도, 정상 수집된 결과는 보고하되 수집 실패 항목을 명시하여 환각(Hallucination)이나 거짓 정보 작성을 차단해야 합니다.

**문제 상황 분석:**
- 경쟁 정보 코디네이터가 3개의 경쟁사 웹사이트 스크래핑을 위해 서브에이전트 3개를 병렬로 호출함.
- 2개 서브에이전트는 정상 수집되었으나, 1개는 봇 방지 기능(Anti-bot Protection)으로 인해 403 Forbidden 오류가 발생하고 재시도 후에도 최종 실패함.
- 코디네이터가 최종 보고서를 합성할 때 차단된 데이터에 대한 올바른 처리 방식을 결정해야 함.

**A번이 정답인 이유:**
멀티 에이전트 시스템에서 외부 리소스 차단으로 인한 부분 실패(Partial Failure)가 발생한 경우, 사용 가능한 성공 데이터만으로 보고서를 합성하되 실패한 항목은 "데이터 수집 불가(Unavailable)"로 명확히 주석을 달아 전달(Annotate)하는 것이 올바른 디자인 패턴입니다. 이는 사용자에게 시스템의 정확한 진행 상황을 투명하게 알리면서도 무단 추측(환각)을 방지합니다.

**오답 분석:**
- Option B (오답): 해제 여부가 불확실하고 장시간 소요될 수 있는 블록 문제 때문에 성공한 데이터까지 포함된 전체 보고서 출력을 기약 없이 보류하는 것은 전체 워크플로를 마비시키는 잘못된 설계입니다.
- Option C (오답): 실측 데이터를 가져오지 못했음에도 "시장 동향 추정치"로 빈칸을 임의로 채우는 것은 거짓 정보(Hallucination)를 제공하는 심각한 왜곡 행위입니다.
- Option D (오답): 3자 비교 보고서로 위장하면서 데이터 누락 사실을 주석이나 참고 표시 없이 숨기는 것은 보고서의 신뢰성과 투명성을 크게 훼손합니다.

---

### 33번 문제

**1. 문제 원문**

A due-diligence pipeline dispatches five subagents to review different regulatory filings for the same company. Four subagents independently report that the company's debt-to-equity ratio is stable, while one subagent, using a filing from a different fiscal quarter, reports a much higher ratio. The synthesis agent must decide how to characterize this in the final report. What is the best approach?

A) Report only the average of all five ratios as the company's representative debt-to-equity figure for this quarter

B) Report the higher ratio as the current figure since it is presumed to reflect the most recently filed quarter

C) Discard the higher ratio as noise since it disagrees with the majority of the subagent reports on this filing

D) Present the stable ratio as well established and the higher one as a distinct, dated data point, not an outlier to discard

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: Present the stable ratio as well established and the higher one as a distinct, dated data point, not an outlier to discard

**정답 및 해설:**

**핵심 개념:** 멀티 에이전트 결과 종합(Multi-Agent Synthesis) 및 데이터 보존성(Data Provenance/Contextual Grounding). 서로 다른 출처/시점의 서브에이전트 보고 결과를 종합할 때는 단순히 평균을 내거나 무단 삭제하지 않고, 각 데이터의 시점(Date)과 맥락(Context)을 명시하여 투명하게 전달해야 합니다.

**문제 상황 분석:**
- 동일 회사에 대해 5개 서브에이전트가 서로 다른 공시 서류를 검토함.
- 4개 서브에이전트는 안정적인 부채비율을 보고한 반면, 1개 서브에이전트는 다른 회계 분기 서류를 사용하여 훨씬 높은 부채비율을 보고함.
- 서로 다른 시점(Fiscal Quarter)의 데이터가 혼재되어 있을 때, 종합 에이전트(Synthesis Agent)가 정보를 오손하지 않고 보고하는 최선의 방식을 찾아야 함.

**D번이 정답인 이유:**
서로 다른 분기의 보고서에서 추출된 수치는 단순히 오류(Noise)나 무시해야 할 이상값(Outlier)이 아닙니다. 회사의 재무 상태가 해당 분기에 실제로 변화했을 가능성이 있으므로, 종합 에이전트는 다수가 지지하는 안정적 수치와 함께 다른 분기에 해당하는 수치를 별도의 시점 정보(Dated data point)로 명시하여 보고해야 합니다. 이를 통해 데이터의 출처와 시점(Context)을 완벽히 보존하는 사실 기반(Grounded) 보고서를 작성할 수 있습니다.

**오답 분석:**
- Option A (오답): 서로 다른 회계 분기의 부채비율을 무작정 평균을 내는 것은 산술적/재무적으로 의미가 없으며, 데이터의 시점별 선명도를 파괴합니다.
- Option B (오답): 서브에이전트가 검토한 문서의 정확한 작성 시점을 검증하지 않고 단지 수치가 높다는 이유로 "가장 최근 분기일 것"이라고 단정/추정하여 대표 수치로 올리는 것은 근거 없는 환각(Assumed Fact)을 유발합니다.
- Option C (오답): 수치가 일치하지 않는 이유가 "다른 회계 분기 문서 사용" 때문인데, 이를 단순히 다수결 원칙에 따라 노이즈로 무시하고 폐기하는 것은 유의미한 재무 정보 변화를 놓치게 만드는 잘못된 정보 제거입니다.

---

### 34번 문제

**1. 문제 원문**

An architect is setting conventions for what agents should write into scratchpad files during a large codebase exploration. Which content best serves the goal of counteracting context degradation on later questions?

A) Only a timestamp of when each exploration step occurred, without any description of what was found.

B) Concrete facts such as exact class names, file paths, and discovered mechanisms, recorded as they are found.

C) A single vague note such as 'explored the codebase and things generally look fine,' without further detail.

D) The complete raw contents of every file the agent opened during the investigation, copied in full into the scratchpad.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
B번: Concrete facts such as exact class names, file paths, and discovered mechanisms, recorded as they are found.

**정답 및 해설:**

**핵심 개념:** 스크래치패드(Scratchpad) 메모리 패턴 및 컨텍스트 저하(Context Degradation) 방지. 대규모 세션에서 모델의 컨텍스트 한계로 발생하는 정보 유실을 막기 위해, 핵심 사실 관계(클래스명, 파일 경로, 메커니즘 등)를 구체적으로 즉시 기록하여 지속성 메모리로 활용하는 디자인 패턴입니다.

**문제 상황 분석:**
- 대규모 코드베이스 탐색 작업은 대화 세션이 길어지면서 이전 탐색 결과가 대화 맥락 밖으로 밀려나는 컨텍스트 저하(Context Degradation)를 유발함.
- 아키텍터는 에이전트가 스크래치패드(Scratchpad) 파일에 기록해야 할 작성 규칙(Convention)을 정의하고자 함.
- 이후의 질문에서도 에이전트가 정확한 근거를 바탕으로 답변할 수 있도록 돕는 가장 효과적인 스크래치패드 기록 방식이 무엇인지 판단해야 함.

**B번이 정답인 이유:**
스크래치패드는 에이전트의 외부 지속성 메모리 역할을 합니다. 대화 맥락이 길어져 세션 초반의 구체적인 탐색 정보가 소실되더라도, 스크래치패드에 "정확한 클래스 이름, 파일 경로, 구현 메커니즘"과 같은 구체적인 사실(Concrete facts)이 기록되어 있다면 에이전트는 이를 참조하여 언제든 근거 명확한(Grounded) 답변을 제공할 수 있습니다.

**오답 분석:**
- Option A (오답): 무엇을 발견했는지에 대한 설명 없이 단순 실행 시각(Timestamp)만 기록하는 것은 탐색 결과 복원에 아무런 정보적 도움을 주지 못합니다.
- Option C (오답): "전반적으로 괜찮아 보인다"와 같은 모호하고 개괄적인 메모는 구체적인 코드 탐색 정보나 기술적 사실관계를 담지 못해 컨텍스트 저하 문제를 해결하지 못합니다.
- Option D (오답): 열어본 모든 파일의 원본 텍스트 전체를 스크래치패드에 복사해 넣으면 스크래치패드 자체가 불필요하게 거대해져 컨텍스트 창을 순식간에 고갈시키므로, 스크래치패드를 활용하는 목적(압축된 핵심 사실 유지)에 직접적으로 반합니다.

---

### 35번 문제

**1. 문제 원문**

An architect asks Claude to output a confidence score from 0 to 1 for each extracted field in a structured JSON response. Before using these scores to decide which fields skip human review, what step should the architect take to make the scores trustworthy for routing decisions?

A) Instruct the model to always output scores above 0.9 for fields it extracted successfully, since a consistently high score indicates the extraction pipeline is functioning correctly.

B) Average each field's confidence score with the scores of neighboring fields in the same document to smooth out any single-field scoring noise before applying a threshold.

C) Replace numeric confidence scores with a categorical high/medium/low label, since categorical labels are inherently easier for a model to estimate accurately than continuous scores.

D) Calibrate review thresholds against a labeled validation set, checking whether fields the model scores highly are actually correct at the rate that score implies before trusting it for routing.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: Calibrate review thresholds against a labeled validation set, checking whether fields the model scores highly are actually correct at the rate that score implies before trusting it for routing.

**정답 및 해설:**

**핵심 개념:** 신뢰도 캘리브레이션(Confidence Calibration) 및 신뢰도 기반 라우팅(Confidence-based Routing). LLM이 자체 출력하는 신뢰도 점수(Self-reported Confidence Score)는 과잉 확신(Overconfidence)이 자주 포함되므로, 검증 세트(Validation Set)를 통한 정밀한 보정이 필수적입니다.

**문제 상황 분석:**
- 아키텍터가 Claude의 각 추출 필드별 신뢰도 점수(0~1)를 사용하여 '사람의 검토 스킵 여부'를 자동 결정하는 라우팅 시스템을 구축하고자 함.
- 대규모 언어 모델(LLM)이 스스로 제시하는 신뢰도 점수는 절대적인 실제 정확도 수치와 직접 일치하지 않을 수 있음(예: 모델이 0.99의 점수를 부여했으나 실제 정확도는 80%에 불과할 수 있음).
- 이 신뢰도 점수를 실제 자동화 워크플로의 라우팅 기준으로 신뢰하기 위해 사전에 수행해야 할 엔지니어링 검증 단계를 찾아야 함.

**D번이 정답인 이유:**
LLM의 자체 평가 점수를 오토메이션 및 검토 생략(Bypass) 기준으로 사용하려면, 정답 라벨이 지정된 검증 데이터셋(Labeled Validation Set)에 대해 모델의 신뢰도 점수 분포와 실제 추출 정확도를 비교/측정하는 **캘리브레이션(Calibration)** 작업이 필수적입니다. 모델이 0.95 이상의 점수를 준 필드가 실제 검증 세트에서 몇 %의 정확도를 보이는지 임계값(Threshold)을 실측 보정해야만 안정적인 자동화 라우팅을 구현할 수 있습니다.

**오답 분석:**
- Option A (오답): 모델에게 무조건 0.9 이상의 점수를 출력하도록 프롬프트로 강제하는 것은 신뢰도 지표의 기능을 완전히 마비시키며, 잘못 추출된 데이터까지 검토를 건너뛰게 만드는 치명적인 위험을 유발합니다.
- Option B (오답): 서류 내 인접 필드의 점수를 수학적으로 평균 내는 것은 특정 필드(예: 중요 금액 필드)의 개별적인 오류나 불확실성을 가려버리는 부작용을 낳습니다.
- Option C (오답): 단순 수치를 범주형(High/Medium/Low) 라벨로 바꾸더라도 모델이 스스로의 확신을 과대평가하는 환각/편향 본질은 바뀌지 않으므로, 캘리브레이션 없이 라벨 자체를 무조건 신뢰할 수는 없습니다.

---

### 36번 문제

**1. 문제 원문**

A legal-research subagent searches a case-law database for precedents matching a narrow fact pattern. The database responds successfully but the search genuinely matches zero cases. Separately, the same subagent's next query fails because the database connection pool is exhausted and refuses new connections. The subagent reports both outcomes as 'no results found.' Why is this reporting flawed, and what should change?

A) It is flawed because the subagent should have terminated the entire workflow once the pool was exhausted

B) It conflates a completed zero-match search with a connection failure; the latter should be a distinct access failure

C) It is not flawed at all, since both queries ultimately produced zero usable case citations for the coordinator to review

D) It is flawed only because 'no results found' is too informal; formal legal wording would fix the issue

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
B번: It conflates a completed zero-match search with a connection failure; the latter should be a distinct access failure

**정답 및 해설:**

**핵심 개념:** 에이전트 시스템의 오류 분류 및 상태 보고(Error Classification & Status Reporting). 시스템의 성공적인 '결과 없음(Zero-match)'과 시스템 인프라 장애로 인한 '연결 실패(System/Access Failure)'를 명확히 구분하여 처리하지 않으면, 상위 에이전트가 오판하거나 비즈니스 논리에 치명적인 오류가 발생합니다.

**문제 상황 분석:**
- 첫 번째 쿼리: DB 검색이 성공적으로 수행되었으나 판례 조건이 맞아떨어지는 데이터가 실제 0건임 (유효한 결과 0건).
- 두 번째 쿼리: DB 커넥션 풀 고갈로 데이터베이스 접근 자체가 거부됨 (인프라 장애/접근 실패).
- 서브에이전트가 두 가지 상황 모두를 단순 'no results found(결과 없음)'라는 상태로 동일하게 반환함.

**B번이 정답인 이유:**
'조건에 맞는 데이터가 실제로 존재하지 않는 것(Zero-match)'과 '기술적 문제로 데이터를 조회하지 못한 것(Connection Failure)'은 완전히 다른 의미를 가집니다. 이를 동일한 'no results found' 상태로 반환하면 코디네이터 에이전트는 "해당 판례가 존재하지 않는다"고 오해하게 됩니다. 따라서 연결 실패는 명확히 구분되는 '접근 실패(Access Failure / Infrastructure Error)'로 반환되어 재시도나 에러 처리가 가능하도록 설계해야 합니다.

**오답 분석:**
- Option A (오답): 서브에이전트 단에서 커넥션 에러 하나로 전체 멀티 에이전트 워크플로를 즉시 무조건 종료시키는 것은 과도하며, 적절한 에러 반환 및 재시도/이관 전략이 우선되어야 합니다.
- Option C (오답): 최종 인용 결과가 0건으로 동일하다고 해서 성공적인 0건 조회와 시스템 오류 조회를 같은 결과로 취급하는 것은 시스템 상태 신뢰성을 크게 해칩니다.
- Option D (오답): 본 문제의 핵심은 문구의 법률적 공식성 여부(Wordings)가 아니라, 기술적인 시스템 상태값(State/Error Code)의 왜곡 및 혼동 문제입니다.

---

### 37번 문제

**1. 문제 원문**

A team is designing the system prompt for a support agent and wants Claude to reliably distinguish between cases that should be escalated and cases it can resolve autonomously. Which approach best achieves this?

A) Rely on the agent's general training to infer appropriate escalation behavior without adding specific guidance

B) Instruct the agent to escalate whenever the customer's message contains any negative language or urgency

C) Add explicit escalation criteria plus few-shot examples showing both escalation and resolution cases

D) Instruct the agent to escalate whenever its own self-reported confidence falls below a fixed threshold

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
C번: Add explicit escalation criteria plus few-shot examples showing both escalation and resolution cases

**정답 및 해설:**

**핵심 개념:** 프롬프트 엔지니어링(Prompt Engineering)의 명시적 지침(Explicit Guidance) 및 퓨샷 예시(Few-shot Examples) 패턴. AI 에이전트가 복잡한 비즈니스 로직(이관 여부 판단 등)을 일관되고 신뢰성 있게 수행하도록 하려면 명확한 판단 기준과 함께 긍정/부정(해결/이관) 사례를 균형 있게 예시로 제공해야 합니다.

**문제 상황 분석:**
- 고객 지원 에이전트용 시스템 프롬프트를 구축하는 상황임.
- 상담 건이 '사람에게 이관(Escalate)해야 할 건'인지, 'AI가 자율 해결(Autonomous Resolution)할 건'인지 정확히 구분해야 함.
- 모델의 분기 판단 정확도와 신뢰성을 극대화하기 위한 최선의 시스템 프롬프트 작성 방식을 결정해야 함.

**C번이 정답인 이유:**
LLM이 특정 경계(Boundary)를 정밀하게 분류하도록 유도할 때 가장 효과적인 방법은 시스템 프롬프트에 **명시적인 분류 기준(Explicit Criteria)**을 정의하고, 이관 케이스와 자율 해결 케이스 모두를 담은 **대조적인 퓨샷 예시(Few-shot Examples)**를 함께 제공하는 것입니다. 이 방식은 모델의 모호성을 제거하고 의도한 분류 패턴을 신뢰성 있게 정착시킵니다.

**오답 분석:**
- Option A (오답): 명시적 구체 지침 없이 모델의 기본 사전 학습(General Training)에만 의존하는 것은 불일치와 환각, 비즈니스 규칙 위반을 야기합니다.
- Option B (오답): 단순한 부정적 언어나 긴급성 단어 포함 여부만으로 이관하는 규칙은 너무 과도하여(Over-escalation), 단순 요청이나 약간 짜증이 난 고객의 요청까지 모조리 이관시켜 상담원 부담을 가중시킵니다.
- Option D (오답): LLM의 자체 보고 신뢰도(Self-reported Confidence)는 과잉 확신(Overconfidence) 편향이 심하여 보정(Calibration) 없이 고정 임계값의 이관 기준으로 직접 신뢰할 수 없습니다.

---

### 38번 문제

**1. 문제 원문**

A reviewer team has capacity to manually check only 8% of the extractions produced daily by a Claude-based intake pipeline. Extractions vary in model-reported confidence, and some source documents contain contradictory values for the same field across pages. How should the team prioritize which extractions receive human review?

A) Review a fixed random 8% of all extractions each day, regardless of confidence score or document characteristics, to maintain a statistically representative sample that catches errors uniformly.

B) Review whichever extractions were processed first each day, since earlier documents are statistically more likely to contain the fields reviewers care about, and defer later extractions to conserve capacity.

C) Review only the extractions with the highest confidence scores, using all available review capacity on the extractions most likely to be trusted downstream, and forgo review of lower-confidence extractions.

D) Route low-confidence extractions and documents with ambiguous or contradictory source values to review first, using remaining capacity for a smaller random sample of high-confidence cases.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
D번: Route low-confidence extractions and documents with ambiguous or contradictory source values to review first, using remaining capacity for a smaller random sample of high-confidence cases.

**정답 및 해설:**

**핵심 개념:** 리스크 기반 사람 검토 라우팅(Risk-Based Human-in-the-Loop Routing) 및 품질 보증 샘플링(QA Sampling). 검토 리소스가 제한적일 때(8%), 오류 발생 가능성이 높은 모호/모순 데이터 및 저신뢰도 항목을 우선 검토하고 남은 자원으로 고신뢰도 데이터의 무작위 검수(Quality Control)를 병행하는 기법입니다.

**문제 상황 분석:**
- 매일 생성되는 추출 데이터 중 오직 8%만 사람이 수동 검토할 수 있는 리소스 제한이 존재함.
- 데이터 추출 결과는 모델 신뢰도 점수가 제각각이며, 원본 문서 페이지 간 동일 필드 내용이 상충/모순(Contradictory values)되는 높은 위험 요소를 포함함.
- 제한된 8%의 검토 용량을 가장 효율적으로 활용하여 오류 발생 위험을 최소화할 수 있는 우선순위 지정 정책을 수립해야 함.

**D번이 정답인 이유:**
오류 발생 가능성이 높은 "낮은 신뢰도 점수 데이터" 및 "페이지 간 값 상충/모순이 존재하는 불확실 문서"를 최우선으로 검토(Risk-based Routing)하는 것이 리스크 관리 측면에서 가장 효과적입니다. 또한, 남은 자원을 활용해 모델이 높은 신뢰도를 부여한 데이터 중 일부를 무작위 샘플링(Random Sampling)하여 검수함으로써 모델의 과등 신뢰(Overconfidence) 오류를 사전에 차단하는 완벽한 Human-in-the-Loop 가이드라인을 제공합니다.

**오답 분석:**
- Option A (오답): 무작위 8% 샘플링만 수행할 경우, 이미 명확히 식별된 "페이지 간 모순 데이터"나 "저신뢰도 데이터" 등 고위험 오류 데이터가 검토를 받지 못하고 통과될 위험이 매우 큽니다.
- Option B (오답): 처리 시각 순서에 따라 선착순으로 검토하는 것은 데이터의 위험도나 오류 가능성을 전혀 고려하지 않는 비논리적인 방식입니다.
- Option C (오답): 신뢰도 점수가 가장 높은 데이터만 검토하고 낮은 신뢰도 데이터를 방치하는 것은 잘못 추출되었을 가능성이 가장 높은 데이터를 검토에서 제외하므로 시스템 전체의 정확도를 크게 해칩니다.

---

### 39번 문제

**1. 문제 원문**

An architect is designing the output schema for research subagents that will feed a downstream synthesis agent producing a due-diligence report. The architect wants downstream agents to be able to verify and re-attribute every claim without re-reading the original documents. What should each subagent's structured output include for every extracted claim?

A) The claim text and a short paraphrase of the surrounding paragraph, without naming the specific source document

B) The claim text, the source URL or document name it came from, and a relevant excerpt supporting the claim

C) The claim text and the name of the subagent that produced it, so the coordinator knows which subagent to re-query if needed

D) The claim text and a numeric confidence score assigned by the subagent based on its own judgment of source reliability

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**
B번: The claim text, the source URL or document name it came from, and a relevant excerpt supporting the claim

**정답 및 해설:**

**핵심 개념:** 데이터 출처 명시(Data Provenance / Citation Grounding) 및 멀티 에이전트 정보 전달 패턴. 후속 에이전트가 원본 문서를 일일이 다시 로드하거나 읽지 않고도 사실관계를 검증하고 최종 보고서에 정확히 인용할 수 있도록, 출처 식별자(URL/문서명)와 핵심 발췌문(Relevant Excerpt)을 구조화된 출력 스키마에 포함해야 합니다.

**문제 상황 분석:**
- 조사(Research) 서브에이전트가 수집한 데이터를 종합(Synthesis) 에이전트가 전달받아 실사 보고서를 작성하는 오케스트레이션 구조임.
- 후속 에이전트가 토큰과 시간을 낭비해가며 원본 문서를 재조회하지 않아야 함.
- 동시에 추출된 모든 주장에 대해 검증(Verify)과 근거 출처 인용(Re-attribute)을 수행할 수 있도록 서브에이전트의 출력 스키마(Output Schema)를 설계해야 함.

**B번이 정답인 이유:**
후속 에이전트가 원본 파일/문서를 다시 파싱하지 않으면서도 주장의 사실 여부를 검증하고 인용 표시를 남기려면, 스키마에 **① 주장의 원문 내용(Claim Text)**, **② 구체적인 출처 식별자(Source URL/Document Name)**, **③ 해당 주장의 근거가 되는 원본의 직접 발췌 구절(Relevant Excerpt)**이 반드시 포함되어야 합니다. 이를 통해 정보의 가공 과정에서 환각을 방지하고 근거성(Groundedness)을 완벽히 보장할 수 있습니다.

**오답 분석:**
- Option A (오답): 구체적인 원본 문서 이름을 밝히지 않고 의역(Paraphrase)만 제공하면 출처 재지정(Re-attribution)이 불가능해지며, 2차 의역으로 인한 사실 왜곡 위험이 커집니다.
- Option C (오답): 서브에이전트의 이름만 포함하면, 검증이 필요할 때마다 서브에이전트를 다시 호출(Re-query)해야 하므로 "원본 문서나 서브에이전트를 재조회하지 않고 검증한다"는 목표에 직접적으로 반합니다.
- Option D (오답): 에이전트가 자체 부여한 수치 신뢰도 점수(Confidence Score)만으로는 해당 주장이 실제로 맞는지 직접 검증하거나 최종 보고서에 원본 출처를 인용할 수 있는 근거를 제공하지 못합니다.

---

### 40번 문제

**1. 문제 원문**

An architect reviews a synthesis agent's prompt and finds that it instructs the agent to 'write a concise unified summary of all subagent findings.' Reports produced under this prompt read smoothly but reviewers can no longer tell which subagent, document, or date each specific claim traces back to. Which prompt revision most directly addresses this problem?

A) Instruct the synthesis agent to write in a more formal register so the report appears more authoritative to reviewers

B) Instruct the synthesis agent to carry forward each claim's source and date metadata from subagent outputs into the report

C) Instruct the synthesis agent to shorten the report further so that reviewers can read through it more quickly

D) Instruct the synthesis agent to add a general disclaimer at the end stating that sources are available upon request

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

B번: Instruct the synthesis agent to carry forward each claim's source and date metadata from subagent outputs into the report

**정답 및 해설:**

**핵심 개념:** 

멀티 에이전트(Multi-agent) 시스템 구축 시 하위 에이전트(Subagent)들의 정보를 취합(Synthesis)하는 과정에서 출처, 작성일, 담당 에이전트 등의 메타데이터가 손실되는 현상(Information Loss)을 방지하는 프롬프트 공학 기법입니다. 데이터 출처 추적성(Provenance/Traceability)을 보장하기 위해서는 요약 프롬프트에 메타데이터 유지 명령을 명시해야 합니다.

**문제 상황 분석:**

- 합성 에이전트가 하위 에이전트의 결과를 지나치게 간결하게 요약하면서 출처 및 날짜 정보가 누락됨.
- 보고서 문맥은 매끄러우나 검토자가 특정 주장(Claim)의 근거 문서, 담당 하위 에이전트, 기준 날짜를 추적할 수 없음.
- 추적 가능성(Traceability) 상실 문제를 직접적으로 해결하기 위한 프롬프트 수정 방안이 필요함.

**B번이 정답인 이유:**

문제의 핵심 원인은 하위 에이전트가 생성한 개별 결과물에 포함되어 있던 출처(Source) 및 날짜(Date) 등의 메타데이터가 합성(Synthesis) 단계에서 생략되었기 때문입니다. 프롬프트에 하위 에이전트의 출력에 포함된 메타데이터를 최종 보고서까지 유지하여 전달(Carry forward)하도록 지시하는 것이 출처 추적성 상실 문제를 직접적이고 명확하게 해결하는 방법입니다.

**오답 분석:**
- Option A (오답): 문체를 격식 있게 바꾸는 것(Formal register)은 보고서의 톤앤매너만 변경할 뿐, 누락된 출처 및 날짜 데이터 추적 문제를 해결하지 못합니다.
- Option C (오답): 보고서를 더 줄이는 것은 오히려 정보 생략을 심화시켜 추적성을 더욱 악화시킬 수 있습니다.
- Option D (오답): '요청 시 출처 제공'이라는 면책 조항은 보고서 본문 내에서 각 주장에 대한 직접적인 출처 추적을 가능하게 해주지 않으므로 근본적인 해결책이 아닙니다.

---

### 41번 문제

**1. 문제 원문**

A support team relies solely on repeated summarization of long chats to keep prompts short, without any separate structured tracking of transactional details. Over many support sessions, what is the most likely consequence for exact figures such as amounts, dates, and order numbers mentioned early in a conversation?

A) They become more accurate over time as the model has more opportunities to notice and correct any errors in the original figures

B) They remain exactly as stated indefinitely, since summarization only condenses narrative language and never affects numeric values

C) They are progressively generalized or dropped from the summary, since summarization optimizes for brevity over specific values

D) They are automatically moved into a separate memory store by the summarization process without any additional configuration

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

C번: They are progressively generalized or dropped from the summary, since summarization optimizes for brevity over specific values

**정답 및 해설:**

**핵심 개념:** 

LLM 기반 대화 시스템에서 컨텍스트 윈도우(Context Window)를 절약하기 위해 **반복적인 요약(Iterative Summarization)**만 사용하는 경우, 압축이 거듭될수록 구체적인 트랜잭션 데이터(금액, 날짜, ID 등)가 손실되거나 추상화(Generalization)되는 정보 왜곡 및 누락 현상이 발생합니다. 이를 방지하기 위해서는 핵심 수치 정보를 별도의 구조화된 데이터(Structured Memory State)로 추적·관리해야 합니다.

**문제 상황 분석:**

- 지원 팀은 긴 대화의 프롬프트를 줄이기 위해 반복적인 요약 기법에만 의존하고 있음.
- 거래 세부 정보(금액, 날짜, 주문 번호 등)를 별도로 관리하는 구조화된 시스템이 없음.
- 여러 단계의 대화 압축 및 요약 과정을 거칠 때 대화 초반의 구체적인 수치 데이터에 미치는 영향을 묻고 있음.

**C번이 정답인 이유:**

요약 프롬프트는 텍스트 전체의 핵심 맥락과 의미를 간결하게 압축하는 데 최적화되어 있습니다. 요약이 반복될수록 모델은 구체적인 수치(예: "주문번호 #12345", "2026년 3월 14일 $150.00 결제")를 중요한 맥락으로 유지하기보다 "이전 주문 결제 문제"와 같이 일반화하거나 아예 생략(Drop)하는 경향을 보입니다. 따라서 구체적인 수치들은 점차 손실되게 됩니다.

**오답 분석:**
- Option A (오답): 반복 요약이 원본 수치의 오류를 스스로 찾아내어 더 정확하게 교정해주지 않습니다. 오히려 환각(Hallucination)이나 정보 변형이 생길 위험이 높아집니다.
- Option B (오답): 요약 과정은 텍스트의 종류를 가리지 않으며, 숫자 값 역시 요약 과정에서 손실되거나 바뀔 수 있습니다.
- Option D (오답): 추가 설정 없이는 요약 프로세스가 특정 수치만을 감지하여 별도의 외부 메모리 저장소로 자동 분리·이동시켜 주지 않습니다.

---

### 42번 문제

**1. 문제 원문**

A team runs an initial validation showing 95% accuracy across all document types and removes human review for high-confidence extractions. A stakeholder proposes stopping ongoing sampling altogether, arguing that the initial validation already proved the pipeline works. What is the strongest argument against permanently stopping sampling after initial validation?

A) Sampling should continue indefinitely because the extraction model's performance inevitably degrades over time due to accumulated data drift, much like mechanical components wear out, making periodic checks essential to catch hidden accuracy drops.

B) Initial validation only measures performance on the document population and conditions present at that time, and ongoing stratified sampling is needed to detect later shifts in error rates or new failure patterns as inputs change.

C) Stopping sampling would violate a regulation that requires continuous sampling at a prescribed rate for all automated extraction systems, and without such sampling the pipeline would be non-compliant even if its initial performance appeared satisfactory.

D) Ongoing sampling provides the essential evidence that auditors and regulators require to confirm the pipeline operates within acceptable error bounds, and without it the organization may face compliance findings regardless of the initial validation.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

B번: Initial validation only measures performance on the document population and conditions present at that time, and ongoing stratified sampling is needed to detect later shifts in error rates or new failure patterns as inputs change.

**정답 및 해설:**

**핵심 개념:** 

프로덕션 환경의 AI/ML 추출 파이프라인에서 입력 데이터의 분포 변화(Data Drift, Concept Drift, Document Distribution Shift)에 대응하기 위한 지속적인 모니터링 및 모니터링 샘플링 전략(Ongoing Sampling / Stratified Sampling)의 필요성입니다. 초기 검증(Initial Validation)은 고정된 시점의 정적 테스트에 불과하므로 데이터 변동성 추적을 위한 지속적인 검증 체계가 필수적입니다.

**문제 상황 분석:**

- 초기 검증에서 95% 정확도를 달성하여 신뢰도 높은 데이터 추출에 대해 사람의 검토(Human-in-the-loop)를 제거함.
- 이해관계자가 초기 검증 성공을 이유로 향후 수행될 지속적 샘플링(Ongoing sampling)을 전면 중단하자고 주장함.
- 초기 검증 후 지속적 샘플링을 중단해서는 안 되는 가장 기술적이고 정당한 논거를 찾아야 함.

**B번이 정답인 이유:**

초기 검증(Initial Validation)은 해당 검증을 수행한 시점의 특정 문서 모집단 및 환경 조건(Static Snapshot)만을 반영합니다. 프로덕션 환경에서는 시간이 지남에 따라 입력 문서의 양식, 서식, 스캔 품질, 폰트, 수신 채널 등이 계속 변화합니다(Input/Distribution Drift). 이에 따라 새로운 에러 패턴이나 오류율의 증가가 발생할 수 있으므로, 지속적인 층화 샘플링(Ongoing Stratified Sampling)을 수행해야만 시스템의 성능 저하나 새로운 예외 상황을 즉각 감지하고 모니터링할 수 있습니다.

**오답 분석:**
- Option A (오답): 소프트웨어/AI 모델은 물리적인 부품처럼 자연적으로 '마모(wear out)'되어 성능이 저하되는 것이 아닙니다. 성능 변화의 원인은 모델 자체의 마모가 아니라 외부 입력 데이터 및 환경의 변화(Drift)입니다.
- Option C (오답): 모든 자동 추출 시스템에 대해 특정 비율의 지속적 샘플링을 일률적으로 강제하는 일반적인 범용 법적 규정(Universal Regulation)은 존재하지 않으며, 기술적 타당성보다는 가상의 규정을 전제로 한 오답입니다.
- Option D (오답): 모든 산업군 및 AI 유스케이스가 감사관(Auditor)이나 규제 기관(Regulator)의 지속적 샘플링 규제 대상인 것은 아닙니다. 규제 준수 측면보다 데이터 및 입력 변화 감지라는 시스템 엔지니어링 측면의 원인이 훨씬 본질적이고 일반적인 거부 논거입니다.

---

### 43번 문제

**1. 문제 원문**

During a competitive-intelligence synthesis, two subagents report different figures for a competitor's annual revenue: one cites a press release stating $420 million, the other cites an analyst report stating $460 million. Both sources are credible. How should the synthesis agent handle this discrepancy in the final report?

A) Present both figures side by side, attributed to their sources, and note that the values conflict

B) Report the analyst report's figure since analyst estimates are generally considered more rigorous than press releases

C) Report the press release's figure since it comes directly from the company rather than a third party

D) Average the two figures into a single blended estimate so the report presents one consistent number

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

A번: Present both figures side by side, attributed to their sources, and note that the values conflict

**정답 및 해설:**

**핵심 개념:** 

멀티 에이전트 시스템에서 정보 합성(Synthesis)을 담당하는 합성 에이전트는 상충되는 신뢰성 있는 정보가 입력될 경우, 인위적으로 하나를 선택하거나 임의로 결합(환각/자가 임의 보정)해서는 안 되며, 각 출처와 수치 및 충돌 사실을 명확하게 투명하게 보고(Transparency & Attribution)해야 합니다.

**문제 상황 분석:**

- 경쟁사 정보 분석(Competitive Intelligence) 과정에서 두 하위 에이전트가 서로 다른 연간 매출액($420M vs $460M)을 수집함.
- 두 출처(보도 자료 vs 분석가 보고서) 모두 신뢰 가능한(Credible) 정보원임.
- 합성 에이전트가 최종 보고서를 작성할 때 이 수치 불일치(Discrepancy)를 처리하는 가장 올바른 방법을 찾아야 함.

**A번이 정답인 이유:**

둘 다 신뢰할 수 있는 출처에서 도출된 상충 정보가 존재할 때, AI 에이전트가 자체적으로 하나의 출처만 자의적으로 선택하거나 임의로 왜곡해서는 안 됩니다. 각 수치를 해당 출처(Attribution)와 함께 병렬로 명시하고 수치 간 충돌/불일치가 존재함을 최종 사용자(검토자)에게 명확하게 알려주는 것(Side-by-side presentation with conflict notification)이 데이터 무결성과 투명성을 지키는 가장 올바른 처리 방식입니다.

**오답 분석:**
- Option B (오답): 분석가 보고서가 보도 자료보다 무조건 우수하다고 단정할 수 없으며, 에이전트가 자의적으로 하나의 정보만 채택하고 다른 정보를 은폐하는 것은 편향과 정보 손실을 야기합니다.
- Option C (오답): 기업 자체 발표 자료가 3자 분석보다 항상 정확하다고 단정할 수 없으며, 마찬가지로 에이전트가 다른 신뢰 출처의 정보를 임의로 버리는 오답입니다.
- Option D (오답): 서로 다른 두 수치를 임의로 평균 내어($440M) 단일 수치로 제공하는 것은 실제 데이터에 존재하지 않는 가상의 숫자를 만들어내는 환각(Hallucination) 및 데이터 왜곡 행위입니다.

---

### 44번 문제

**1. 문제 원문**

A legal research assistant built on Claude synthesizes findings from three case-law subagents. One subagent flags that a particular precedent has been cited approvingly by every appellate court that has reviewed it, while another flags a claim that appears in only one lower-court opinion and has not been tested elsewhere. Both claims are currently presented in the same paragraph with identical phrasing. What revision best serves the report's users?

A) Move the single-opinion claim to an appendix without any accompanying language indicating its limited support

B) Separate the claims into sections labeled by evidentiary weight, describing the precedent and single-opinion claim differently

C) Leave both claims in the same paragraph but add a footnote number to each, without changing how confidently either is described

D) Rephrase both claims using identical hedging language such as 'courts have suggested' so neither appears more authoritative

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

B번: Separate the claims into sections labeled by evidentiary weight, describing the precedent and single-opinion claim differently

**정답 및 해설:**

**핵심 개념:** 

복수의 AI 에이전트(Subagents)가 수집한 정보를 합성(Synthesis)할 때, 각 정보의 증거 가치(Evidentiary Weight) 및 신뢰도 수준이 서로 다르다면 이를 동일한 어조로 나열해서는 안 됩니다. 명확한 섹션 구별과 차별화된 표현을 통해 정보의 증거 중량과 법적 신뢰성 차이를 투명하게 전달해야 사용자에게 오해를 주지 않는 양질의 보고서를 제공할 수 있습니다.

**문제 상황 분석:**

- 항소법원 전원이 인정한 확고한 판례와 단 하나의 하급심 판결에만 존재하는 검증되지 않은 주장이 존재함.
- 현재 보고서에는 이 두 가지 주장이 동일한 단락에 완전히 동일한 어조/문구(Identical phrasing)로 작성되어 정보의 중량 차이가 왜곡되고 있음.
- 보고서 이용자(법률 전문가 등)가 정보의 신뢰도와 증거 능력을 올바르게 파악할 수 있도록 프롬프트/합성 로직을 수정해야 함.

**B번이 정답인 이유:**

증거 가치가 완전히 다른 두 법적 주장(모든 항소법원이 인정한 판례 vs 검증되지 않은 하급심 판결 1건)을 증거 중량(Evidentiary weight)에 따라 섹션별로 분리하고, 각 정보의 법적 권위와 신뢰도 수준에 맞춰 다르게 서술(Describing differently)하는 것이 사용자에게 가장 명확하고 정확한 정보를 제공하는 직관적인 수정 방식입니다.

**오답 분석:**
- Option A (오답): 제한적인 근거라는 설명도 없이 부록으로 숨기는 것은 사용자가 정보의 맥락을 오인하게 만들 수 있습니다.
- Option C (오답): 단순 각주 번호만 붙이고 서술 방식의 확신 수준(Confidence)을 바꾸지 않으면 사용자는 두 주장의 가치를 동일한 비중으로 오해할 수 있습니다.
- Option D (오답): 두 주장 모두에 동일한 완곡 표현을 써서 권위 수준을 같게 만드는 것은 법적 가치가 훨씬 높은 확고한 판례의 신뢰성을 인위적으로 낮추는 정보 왜곡입니다.

---

### 46번 문제

**1. 문제 원문**

A returns-processing agent calls an order-lookup tool that returns a JSON payload with 40+ fields (shipping carrier metadata, internal warehouse codes, marketing tags, etc.) for every order it checks, and after a dozen lookups the raw payloads dominate the context window even though only 5 fields (order status, purchase date, item, amount, return-window deadline) matter for return eligibility. What should the agent do before adding each lookup result to context?

A) Truncate each payload to a fixed character length, regardless of which specific fields fall inside that cutoff limit

B) Cache the full raw JSON payload from each lookup so it can be reused later without recalling the tool again

C) Run every raw payload through a separate summarization call to shrink it before it is added to context

D) Keep only the order status, purchase date, item, amount, and return-window deadline before the result enters context

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

D번: Keep only the order status, purchase date, item, amount, and return-window deadline before the result enters context

**정답 및 해설:**

**핵심 개념:** 

LLM 기반 에이전트 시스템에서 도구(Tool) 호출 결과 중 작업 수행에 불필요한 노이즈 데이터(Unnecessary Metadata)를 필터링하여 컨텍스트 윈도우(Context Window) 소비를 극소화하는 **컨텍스트 창 효율화 및 필드 추출(Context Window Optimization & Field Filtering)** 패턴입니다. 도구 호출 결과를 프롬프트에 넣기 전, 비즈니스 로직에 필수적인 핵심 정보 필드만 선택적으로 남기는 전처리(Pre-processing) 작업이 가장 효율적입니다.

**문제 상황 분석:**

- 반품 처리 에이전트가 주문 조회 도구를 호출할 때마다 40개 이상의 필드가 포함된 거대한 JSON 페이로드를 수신함.
- 실제 반품 자격 판정에 필요한 정보는 단 5개 필드(주문 상태, 구매 일자, 품목, 금액, 반품 기한)에 불과함.
- 수차례의 조회 반복으로 불필요한 메타데이터가 컨텍스트 윈도우를 낭비 및 고갈시키고 있음.

**D번이 정답인 이유:**

도구 호출 결과가 컨텍스트 메모리에 진입하기 전 애플리케이션 또는 에이전트 전처리 단계에서, 실제 반품 자격 판단에 필요한 5가지 핵심 필드만 정제(Filtering/Pruning)하여 저장하는 방식이 가장 안전하고 효율적입니다. 이를 통해 컨텍스트 윈도우 오버헤드를 대폭 줄이고 모델의 토큰 비용과 추론 정확도를 최적화할 수 있습니다.

**오답 분석:**
- Option A (오답): 단순히 고정된 글자 수로 잘라내면 JSON 구문이 손상되거나, 뒤쪽에 위치한 필수 5개 필드가 잘려 나가 중요한 판단 정보를 잃게 됩니다.
- Option B (오답): 전체 원본 페이로드를 캐싱하더라도 이를 컨텍스트 내에 계속 유지하는 문제 자체를 해결하지 못하므로 컨텍스트 고갈 문제를 방지할 수 없습니다.
- Option C (오답): 단순히 필드를 지우면 되는 작업을 처리하기 위해 추가적인 LLM 요약 호출(Summarization Call)을 실행하는 것은 불필요한 API 비용과 지연 시간(Latency)을 유발하는 지극히 비효율적인 방식입니다.

---

### 47번 문제

**1. 문제 원문**

An invoice-extraction pipeline built on Claude reports 97% overall field accuracy across all document types, and the team is preparing to remove human review for any extraction above a fixed confidence threshold. Before doing so, an architect wants to confirm the 97% figure isn't hiding a problem. What is the most important check to run first?

A) Re-run the same evaluation set through the model a second time, using identical configurations, and confirm the overall accuracy score stays within one percentage point of 97%.

B) Increase the size of the evaluation set by sampling more document types, so the 97% aggregate figure is computed from a larger and therefore more statistically significant sample.

C) Break down accuracy by document type and field to check whether any segment, such as handwritten receipts or a specific vendor's layout, performs far worse than the aggregate.

D) Ask the model to self-report its own estimated accuracy by examining a sample of its outputs, such as a subset of invoices, and compare that self-estimate against the measured 97%.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

C번: Break down accuracy by document type and field to check whether any segment, such as handwritten receipts or a specific vendor's layout, performs far worse than the aggregate.

**정답 및 해설:**

**핵심 개념:** 

AI 평가 및 모니터링 모범 사례 중 하나인 **세그먼트별 성능 세분화 평가(Stratified Evaluation / Granular Performance Breakdown)**입니다. 높은 전체 평균 정확도(Aggregate Accuracy)에 도과할 경우, 데이터 불균형으로 인해 특정 하위 집단(특정 문서 양식, 수필 데이터, 필수 필드 등)의 치명적인 오류 발생율이 가려질 위험(Simpson's Paradox 및 평균의 함정)이 있습니다.

**문제 상황 분석:**

- Claude 기반 송장 추출 시스템이 전체 문서를 통틀어 97%의 높은 전체 필드 정확도를 달성함.
- 신뢰도 임계값을 넘는 건에 대해 사람의 검토(Human review) 과정을 완전히 제거(Automation)할 준비를 함.
- 전체 평점 97%가 특정 도메인이나 필드의 심각한 결함을 가리고 있지 않은지 사전 검증하는 가장 중요한 단계를 찾아야 함.

**C번이 정답인 이유:**

전체 평균 정확도(Aggregate accuracy)가 97%로 매우 높더라도, 데이터 세트의 비중이 큰 정형화된 문서(예: 표준 전자 송장)의 높은 성적이 비중이 적거나 까다로운 하위 세그먼트(예: 손글씨 영수증, 비표준 해외 서식, 중요 필드인 Total Amount 등)의 심각한 오류(예: 50% 미만의 낮은 정확도)를 가릴 수 있습니다. 따라서 사람의 검토 과정을 완전히 제거하기 전, **문서 유형(Document Type) 및 필드(Field) 단위로 정확도를 세분화(Break down)**하여 치명적인 사각지대가 없는지 확인하는 것이 최우선 과제입니다.

**오답 분석:**
- Option A (오답): 동일한 평가 세트로 동일한 설정을 단순히 반복 실행하는 것은 이미 평균의 함정에 빠져 있는 집계 지표의 사각지대를 찾아내지 못합니다.
- Option B (오답): 전체 집계 지표를 유지한 채 샘플 크기만 늘리는 것은 특정 카테고리나 세부 필드의 성능 저하 문제를 분리해내지 못합니다.
- Option D (오답): LLM에게 자신의 출력 결과 및 추정 정확도를 스스로 평가(Self-report)하도록 요청하는 것은 환각(Hallucination) 및 과신(Overconfidence) 편향을 유발하므로 객관적인 평가 수단이 될 수 없습니다.

---

### 48번 문제

**1. 문제 원문**

A team is designing an ongoing quality-monitoring process for a document-extraction pipeline that has already passed initial validation and moved most high-confidence extractions out of human review. They want to detect new failure modes that didn't appear during initial testing, without re-reviewing every extraction. Which sampling approach best fits this goal?

A) Draw a stratified random sample of high-confidence extractions across document types and fields on a recurring basis, and compare observed error rates against the validated baseline.

B) Sample extractions in proportion to how quickly each document type is processed, and use the resulting error counts to monitor for unexpected shifts in extraction accuracy across types.

C) Review every extraction produced during the first hour of each day across all document types and fields, and compare those error rates against the established baseline to detect emerging failure modes.

D) Review only the extractions that reviewers happen to flag as suspicious while performing unrelated ad hoc spot checks during slow periods, and use those flags to trigger targeted audits for new failure modes.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

A번: Draw a stratified random sample of high-confidence extractions across document types and fields on a recurring basis, and compare observed error rates against the validated baseline.

**정답 및 해설:**

**핵심 개념:** 

프로덕션 AI 문서 추출 파이프라인의 **지속적 품질 모니터링(Ongoing Quality Monitoring)** 및 **층화 무작위 샘플링(Stratified Random Sampling)** 기법입니다. 사람의 검토가 생략되는 고신뢰도(High-confidence) 추출 영역에서 발생하는 데이터 드리프트(Data Drift) 및 미지의 오류 패턴을 감지하려면, 정기적으로 문서 유형 및 필드별로 균등하게 표본을 추출하여 검증된 베이스라인과 비교해야 합니다.

**문제 상황 분석:**

- 문서 추출 파이프라인이 초기 검증을 통과하여 높은 신뢰도의 추출 건은 사람의 검토(Human Review) 없이 자동 처리 중임.
- 전수 검사를 하지 않고도 초기 테스트에서 발견되지 않았던 새로운 오류 모드(Failure Modes)나 성능 하락을 지속 감지해야 함.
- 이 목표에 가장 적합한 통계적 및 엔지니어링 모범 사례(Best Practice) 샘플링 방식을 찾아야 함.

**A번이 정답인 이유:**

사람의 검토에서 제외된 고신뢰도 추출물들 내에서 발생할 수 있는 숨겨진 오류(Silent Failures)나 데이터 분포 변화를 효과적으로 감지하려면, **문서 유형(Document Types) 및 주요 필드(Fields)별로 층화(Stratified)된 무작위 표본**을 정기적으로 추출해야 합니다. 이를 기존 베이스라인 오류율과 비교하면 특정 카테고리나 필드에서 나타나는 새로운 오류 패턴을 편향 없이 정확하게 포착할 수 있습니다.

**오답 분석:**
- Option B (오답): 처리 속도(Processing Speed)에 비례하여 샘플링하는 것은 문서의 복잡성, 유형별 비중, 중요도 등 실제 추출 품질 측정 기준과 아무런 통계적 연관성이 없으므로 편향을 유발합니다.
- Option C (오답): 매일 첫 한 시간(First hour) 데이터만 추출하는 시간대별 샘플링(Time-based sampling)은 시간대별 데이터 특성 편향(예: 아침 시간에 특정 공급업체 문서만 집중 수신되는 현상 등)에 취약합니다.
- Option D (오답): 한가한 시간에 임의로 수행하는 비정기적 스팟 점검(Ad hoc spot check)은 비체계적이며, 통계적 대표성이 전혀 없어서 시스템적인 오류 모드를 안정적으로 감지할 수 없습니다.

---

### 49번 문제

**1. 문제 원문**

A team is designing the error payload that subagents return to a coordinator when a tool call fails. Which set of fields best supports intelligent coordinator recovery decisions?

A) Failure type, the action that was attempted, any partial results gathered, and alternative approaches to try next

B) A free-text log excerpt of the subagent's entire internal reasoning trace leading right up to the failure

C) A retry count and a timestamp, since the coordinator can infer the rest from prior attempts alone

D) A single numeric error code mapped to an internal lookup table that only the platform team is allowed to maintain

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

A번: Failure type, the action that was attempted, any partial results gathered, and alternative approaches to try next

**정답 및 해설:**

**핵심 개념:** 

멀티 에이전트 오케스트레이션 Architecture에서 하위 에이전트(Subagent)의 도구 호출 실패 시 코디네이터(Coordinator Agent)가 상황을 파악하고 대체 경로를 선택하거나 오류를 복구(Self-correction & Recovery)할 수 있도록 돕는 에러 페이로드(Error Payload) 설계 구조입니다. 단순한 에러 코드 이상으로 실패의 원인, 시도했던 작업, 부분 결과, 대안 접근법 등 풍부한 컨텍스트(Context-rich Error Payload)를 구조화하여 제공해야 코디네이터가 지능적인 복구 결정을 내릴 수 있습니다.

**문제 상황 분석:**

- 하위 에이전트가 도구(Tool) 호출에 실패했을 때 코디네이터에게 에러 메시지/페이로드를 반환해야 함.
- 코디네이터가 실패 상황을 인지하고 이를 우회하거나 복구(Recovery)하기 위한 최선의 판단을 내리도록 지원해야 함.
- 코디네이터의 지능적인 의사결정(Intelligent Recovery Decisions)에 가장 유용한 필드 구성을 찾아야 함.

**A번이 정답인 이유:**

코디네이터 에이전트가 지능적으로 복구 전략을 수립하기 위해서는 ① 무슨 종류의 오류가 났는지(`Failure type`), ② 어떤 도구/동작을 시도했는지(`action attempted`), ③ 완전히 실패하기 전까지 유효했던 정보는 무엇인지(`partial results`), ④ 하위 에이전트 시각에서 추천하는 다음 대안은 무엇인지(`alternative approaches`)를 명확하게 전달받아야 합니다. 이 정보들이 조합될 때 코디네이터는 재시도, 다른 도구로의 전환, 사용자 개입 요청 등 최적의 복구 동작을 결정할 수 있습니다.

**오답 분석:**
- Option B (오답): 비구조화된 내부 추론 트레이스 전체(Free-text log trace)를 넘기면 토큰 소비가 과다해지고 코디네이터가 핵심 오류 이유를 정확히 파악하기 어려워집니다.
- Option C (오답): 단순 재시도 횟수와 시간 정보만으로는 왜 도구가 실패했는지와 어떤 대안을 적용해야 할지 추론할 수 없습니다.
- Option D (오답): 인간 엔지니어용인 단일 숫자 에러 코드는 LLM 기반 코디네이터가 의미적(Semantic) 맥락을 이해하고 적절한 우회책을 판단하는 데 한계가 있습니다.

---

### 50번 문제

**1. 문제 원문**

A rideshare customer asks for a fare adjustment based on stacking two promotional codes together, a combination the promotions policy documentation never addresses in either direction. The customer is calm and not asking for a human agent. What should the agent do?

A) Deny the fare adjustment, since undocumented combinations should default to being disallowed

B) Ask the customer to select only one promotional code, then apply that single code's discount

C) Apply the fare adjustment, since neither code's terms explicitly forbid combining it with another

D) Escalate the request, since documented policy neither permits nor prohibits stacking these codes

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

D번: Escalate the request, since documented policy neither permits nor prohibits stacking these codes

**정답 및 해설:**

**핵심 개념:** 

AI 고객 지원 에이전트(Customer Support Agent) 및 거버넌스 프레임워크의 **정책 공백 시 이관 처리(Policy Ambiguity & Escalation Protocol)** 규칙입니다. 명확히 규정되지 않은 정책적 모호성(Ambiguous Policy / Edge Case)에 직면했을 때, AI 시스템이 자체적인 추측이나 임의 판단으로 유불리를 정하지 않고 상급 관리자 또는 인간 상담원에게 안전하게 이관(Escalate)하는 시스템 설계 원칙을 다룹니다.

**문제 상황 분석:**

- 고객이 두 개의 프로모션 코드를 중복 적용(Stacking)하여 요금을 조정해 달라고 요청함.
- 공식 프로모션 정책 문서에는 해당 코드 조합의 중복 허용 여부에 대해 어떠한 규정도 명시되어 있지 않음(Policy Edge Case).
- 고객은 감정적으로 화가 나 있지 않고 calm 상태이며, 먼저 사람 상담원을 연결해달라고 요청하지 않았음.

**D번이 정답인 이유:**

AI 에이전트는 명확한 가이드라인이나 정책이 수립되어 있지 않은 공백 상태(Policy Gap)에서 임의로 승인하거나 거절 결정을 내릴 권한(Autonomous Decision)이 없습니다. 비록 고객이 인간 상담원을 직접 요구하지 않았더라도, 시스템 정책상 허용/금지 여부가 모호한 경계 조건(Ambiguous Condition)에서는 예외를 자의적으로 해석하지 않고 관리자 또는 담당 부서(Human/Supervisor)로 이관(Escalate)하여 올바른 정책적 판단을 받도록 조치하는 것이 가장 안전한 응대 모범 사례입니다.

**오답 분석:**
- Option A (오답): 문서화되지 않은 요청을 무조건 거부하는 임의의 규칙(Defaulting to Disallowed)을 AI가 독단적으로 적용하는 것은 고객 만족도를 저해하고 자의적 정책을 창작하는 위험이 있습니다.
- Option B (오답): 에이전트가 자체적으로 중복을 금지하고 단일 코드만 선택하라고 안내하는 것 역시 가이드라인에 명시되지 않은 조치를 모델이 스스로 판단하여 고객에게 강요하는 오류입니다.
- Option C (오답): "명시적 금지 조항이 없으니 승인한다"는 논리는 AI가 위험한 환각(Hallucination)이나 회사에 재정적 손실을 유발할 수 있는 자의적 정책 승인 권한을 행사하는 것이므로 안전 가이드라인에 위배됩니다.

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

## 55번 문제

**1. 문제 원문**

An architect is choosing between Claude's citations feature and having subagents manually append plain-text bibliographies to their outputs, for a multi-source synthesis pipeline that must let end users click through to the exact passage supporting each generated statement. Which factor most favors using the citations feature?

A) Citations ground each statement in exact source passages, producing verifiable per-statement references rather than a general list of sources

B) Citations eliminate the need to track publication dates because the feature timestamps every generated statement automatically

C) Citations remove the need for subagents to read source documents at all, since the feature retrieves relevant passages automatically

D) Citations guarantee that conflicting statistics from different sources will be automatically reconciled into a single agreed value

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

A번: Citations ground each statement in exact source passages, producing verifiable per-statement references rather than a general list of sources

**정답 및 해설:**

**핵심 개념:** 

Claude의 Citation(인용) 기능은 모델이 답변을 생성할 때 제공된 컨텍스트(문서) 내의 정확한 원문 구절(exact source passages)을 하이라이팅하거나 참조 포인터로 연결해 주는 기능입니다. 단순한 문서 단위의 출처 목록이 아니라, 생성된 각 문장(statement) 단위로 검증 가능한 출처 정보를 제공하여 근거(Grounding)의 신뢰성을 극대화합니다.

**문제 상황 분석:**

- 시스템 아키텍트는 다중 출처 정보 합성 파이프라인을 구축 중입니다.
- 최종 사용자가 생성된 각 문장을 뒷받침하는 정확한 원문 구절로 직접 클릭해서 이동(click through)할 수 있어야 합니다.
- 서브에이전트가 단순 텍스트 참고문헌을 덧붙이는 방식과 Claude의 내장 Citation 기능을 비교 및 선택해야 합니다.

**A번이 정답인 이유:**

Claude의 Citations 기능은 단순 참고문헌(General list of sources)을 출력하는 것을 넘어, 생성된 문장 단위로 원문의 정확한 위치/구절을 세밀하게 매핑해 줍니다. 따라서 "각 생성 문장이 원문의 어느 구절에 기반하는가"를 사용자가 직접 클릭하여 검증할 수 있도록 만드는 요구사항에 가장 부합합니다.

**오답 분석:**
- Option B (오답): Citations 기능은 생성된 문장에 대해 원문 참조 포인터를 제공하는 것이지, 각 문장에 자동으로 발행일 타임스탬프를 부여하는 기능이 아닙니다.
- Option C (오답): Citations 기능은 프롬프트로 제공된 문서 내에서 인용 위치를 매핑하는 것이지, 서브에이전트가 문서를 읽는 과정 자체를 대체하거나 별도의 RAG 검색을 자동으로 수행해 주는 기능이 아닙니다.
- Option D (오답): 서로 다른 출처 간의 통계적 충돌이나 모순을 자동으로 단일 값으로 합의/조정(reconcile)해 주는 기능은 제공하지 않습니다.

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
