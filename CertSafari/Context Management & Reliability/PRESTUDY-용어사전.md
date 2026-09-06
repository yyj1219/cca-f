# Context Management & Reliability — 통합 용어 사전

`PRESTUDY-*.md` 6개 파일의 용어 사전을 항목명 기준으로 통합했다.
원본 항목 210개 → 고유 용어 196개.
한 용어에 설명이 여러 개면 출처마다 서술이 달랐던 것이므로 모두 남겼다.

---

**403 Forbidden** — 서버가 요청을 거부한 HTTP 응답 코드. 봇 방지 보호에 의한 차단 등이 원인

**503 Service Unavailable** — 서버가 일시적으로 요청을 처리할 수 없다는 HTTP 상태 코드

**Access Failure**

- 접근 실패. 인증 만료, 커넥션 풀 고갈, 차단 등으로 데이터에 도달하지 못한 상태. "결과 없음"과 구분해야 함  <sub>(PRESTUDY-c-23-39.md)</sub>
- 접근 실패. 데이터가 있을 수 있는데 읽지 못한 상태(캐시 만료, 네트워크 오류 등).  <sub>(PRESTUDY-c-55-70.md)</sub>

**Agent**

- 에이전트. LLM에 도구 사용 능력과 목표를 부여한 실행 단위  <sub>(PRESTUDY-c-23-39.md)</sub>
- 에이전트. 도구를 사용해 목표를 자율적으로 수행하는 LLM 기반 시스템.  <sub>(PRESTUDY-c-55-70.md)</sub>

**Aggregate Accuracy** — 집계 정확도. 모든 필드·문서를 합쳐 계산한 단일 정확도 수치. 착시를 일으키기 쉬움

**AI-First Support** — AI 우선 지원. AI가 먼저 설명·해결을 시도하고, 미해결이거나 재요청 시 사람에게 이관하는 지원 모델.

**Annotate** — 주석 표기. 수집하지 못한 항목을 보고서에 명시적으로 표시하는 것

**annotation** — 각 값에 출처·조건을 붙여 표시하는 것

**Anti-bot Protection** — 봇 방지 보호. 자동화된 접근을 차단하는 웹사이트 보호 기능

**Anti-pattern** — 안티 패턴. 흔히 쓰이지만 해로운 설계 방식.

**Atomic Retry** — 원자적 재시도. 전부 성공하거나 전부 실패하게 묶어 재시도하는 방식. 로그 수집 등에는 불필요하게 과한 경우가 많다.

**Attention** — 어텐션(주의력). 모델이 입력의 각 부분에 얼마나 비중을 두는지를 결정하는 메커니즘.

**Blended Narrative** — 혼합 서술. 여러 개체 정보를 하나의 문장/단락으로 뭉뚱그린 형태. 모호성의 원인.

**by analogy** — 다른 조항을 유사하다는 이유로 확장 적용하는 것. 권한 밖의 위험한 해석

**Bypass Review** — 검토 우회. 고신뢰·비모호 케이스를 사람 검토 없이 자동 통과시키는 것

**Calibration** — 캘리브레이션(보정). 신뢰도 점수가 실제 정확도와 일치하는지 검증 세트로 확인하고 조정하는 작업.

**calibration** — 신뢰도 점수가 실제 정답률과 일치하도록 맞추는 것

**Case-Facts Block** — 팩트 블록. 요약 대상에서 제외하고 원문 그대로 유지하는 핵심 사실(수치, ID, 상태) 구역.

**Citation Grounding** — 인용 근거 부착. 각 주장에 출처 식별자와 원문 발췌를 함께 붙여 검증 가능하게 만드는 것

**Citations** — 인용 기능. 생성된 각 문장을 제공된 문서의 정확한 원문 구절에 연결해 클릭 검증을 가능하게 하는 기능.

**compaction** — 길어진 대화 기록을 요약으로 대체해 컨텍스트 공간을 되찾는 동작

**comparable** — 서로 비교 가능한 상태. 방법론과 범위가 같아야 성립

**Confidence Calibration** — 신뢰도 캘리브레이션 / 보정. 검증 세트로 "점수 X를 준 항목이 실제로 X 비율로 맞는지" 확인해 점수를 신뢰 가능하게 만드는 작업

**Confidence Score**

- 신뢰도 점수. 모델이 자기 출력의 확실성에 대해 스스로 매기는 0~1 사이 값  <sub>(PRESTUDY-c-23-39.md)</sub>
- 신뢰도 점수. 모델이 각 추출값에 대해 스스로 매기는 확신도 수치.  <sub>(PRESTUDY-c-55-70.md)</sub>

**confidence score** — 모델이 자기 출력에 부여한 정답 확률 추정치 (0~1)

**Confidence-based Routing** — 신뢰도 기반 라우팅. 신뢰도 점수를 기준으로 검토 여부를 자동 결정하는 것. 보정이 선행되어야 함

**conflict reporting** — 상충되는 데이터를 판단하지 않고 출처와 함께 투명하게 보고하는 것

**Consistent Numeric Scale** — 일관된 수치 척도. 모든 필드·문서에서 동일한 범위(예: 0.0~1.0)를 쓰는 것. 정량 비교의 전제.

**Contested / Uncorroborated Finding** — 이견 있는 / 미검증 발견. 단일 출처이거나 반박이 있는 정보. 별도 섹션으로 분리해 표기한다.

**context budget** — 컨텍스트 윈도우를 용도별로 나눠 배정한 계획. 초과 시 잘림이나 누락 발생

**Context Degradation** — 컨텍스트 저하. 긴 세션에서 초반에 확인한 사실이 활성 컨텍스트에서 밀려나 사라지는 현상

**Context Engineering** — 컨텍스트 엔지니어링. 무엇을 컨텍스트에 넣고 뺄지, 어떻게 배치할지를 설계하는 기술 분야.

**Context Isolation** — 컨텍스트 격리. 서브에이전트의 대량 원시 출력이 메인 컨텍스트에 섞이지 않도록 분리하는 것

**context isolation** — 서브에이전트가 별도 컨텍스트를 가져 상위 컨텍스트를 오염시키지 않는 성질

**Context Pollution**

- 컨텍스트 오염. 다시 쓸 일 없는 대량 원시 출력이 컨텍스트를 차지하는 것  <sub>(PRESTUDY-c-23-39.md)</sub>
- 컨텍스트 오염. 불필요한 정보가 컨텍스트에 쌓여 모델의 정확도와 효율을 떨어뜨리는 현상.  <sub>(PRESTUDY-c-55-70.md)</sub>

**Context Trimming / Field Extraction** — 컨텍스트 트리밍 / 필드 추출. 도구 출력에서 작업에 필요한 필드만 골라 컨텍스트에 넣는 기법.

**Context Window**

- 컨텍스트 윈도우. 모델이 한 번에 처리할 수 있는 최대 토큰 분량. 시스템 프롬프트·대화 기록·도구 출력이 모두 여기에 들어감  <sub>(PRESTUDY-c-23-39.md)</sub>
- 컨텍스트 윈도우. 모델이 한 번에 볼 수 있는 입력 범위. 토큰 단위로 유한하며 비용과 직결된다.  <sub>(PRESTUDY-c-55-70.md)</sub>

**context window** — 한 번의 모델 호출에 넣을 수 있는 토큰의 최대 크기

**coordinator** — 오케스트레이터와 동의어. 서브에이전트 결과를 받아 조정·결정

**Coordinator / Orchestrator** — 코디네이터 / 오케스트레이터. 작업을 분배하고 결과를 종합하는 상위 에이전트.

**Corroboration** — 교차 검증. 서로 독립된 여러 출처가 같은 사실을 뒷받침하는 것.

**Coverage** — 커버리지. 조사·검토가 대상 범위를 얼마나 포괄했는지. 접근 실패를 성공으로 처리하면 허위 커버리지가 보고됨

**Coverage Gap** — 결손 영역. 수집·분석되지 못한 부분. 감추지 말고 보고서에 명시한다.

**credential rotation** — 보안상 자격증명을 주기적으로 새 값으로 교체하는 관행

**Data Provenance** — 데이터 프로버넌스 / 출처 이력. 각 값이 어떤 문서의, 어느 시점 데이터에서 나왔는지를 끝까지 유지하는 것

**delegation** — 작업을 서브에이전트에게 위임하는 것

**Disambiguation** — 모호성 해소. 추가 식별자를 요청하는 등으로 대상을 확정하는 절차.

**documented policy** — 문서화된 공식 지침

**downstream agent** — 파이프라인에서 앞 단계의 출력을 입력으로 받는 뒤쪽 에이전트

**Drift** — 드리프트. 시간이 지나며 데이터 분포나 모델 성능이 서서히 변하는 현상

**drop** — 파이프라인이 특정 입력(예: 서브에이전트 결과 하나)을 통째로 버리는 것

**durable / persistence** — 세션이 끝나도 남는 지속적 저장. 컨텍스트는 휘발성, 파일은 영속성

**Entity Ambiguity** — 엔티티 모호성. "그 청구", "그 금액"처럼 지시 대상이 특정되지 않는 상태.

**Error Classification** — 오류 분류. "결과 0건(정상 완료)"과 "접근 실패(연결 불가)"처럼 성격이 다른 결과를 구분해 표시하는 것

**Error Propagation** — 오류 전파. 하위에서 발생한 오류를 상위 시스템에 명시적으로 전달하는 것

**escalate (with what was attempted)** — 시도 내역을 첨부해 상위 주체에게 넘기는 것

**Escalation**

- 에스컬레이션 / 이관. AI 에이전트가 제어권을 사람 상담원에게 넘기는 것  <sub>(PRESTUDY-c-23-39.md)</sub>
- 에스컬레이션. 에이전트가 해결 불가 상황을 사람 담당자에게 맥락과 함께 이관하는 것.  <sub>(PRESTUDY-c-55-70.md)</sub>

**escalation trigger** — 에스컬레이션을 발동시키는 조건

**Explicit Criteria / Guidance** — 명시적 기준. 모델의 판단 기준을 추측에 맡기지 않고 프롬프트에 구체적으로 적어 주는 것

**Explicit Headings** — 명시적 헤딩. 섹션 제목으로 정보의 경계를 구조적으로 표시하는 것.

**explicit request** — 사용자가 말로 분명히 밝힌 요구. 효율성보다 우선

**exponential backoff** — 재시도 간격을 1s, 2s, 4s… 로 늘려 가는 재시도 전략

**Failure Mode** — 실패 모드. 시스템이 잘못되는 구체적인 양상(수치 유실, 이슈 혼동, 중간 유실 등).

**Failure Type** — 실패 유형. access_failure, timeout, validation_error 등 오류의 성격 분류.

**Fault Tolerance** — 결함 허용성. 일부 구성요소가 실패해도 전체 시스템이 계속 동작하는 성질.

**Few-shot Examples** — 퓨샷 예시. 지시문에 입출력 예시 몇 개를 함께 넣어 원하는 동작 패턴을 보여주는 기법

**Field Accuracy** — 필드 정확도. 추출 대상 항목(필드) 단위로 측정한 정답률

**first principles (recompute from)** — 근본 원리로부터 직접 재계산하는 것. 서브에이전트에겐 대개 권한 밖

**Freshness Check** — 신선도 검사. 캐시 데이터가 허용 임계값 내에 있는지 확인하는 절차.

**Front-loading** — 프런트로딩. 핵심 요약을 문서 최상단에 배치해 주의력이 강한 위치를 활용하는 기법.

**front-loading** — 핵심 요약을 프롬프트 맨 앞에 배치해 회상률을 높이는 기법

**Granular Breakdown** — 세부 분해. 정확도를 문서 유형별·필드별·조건별로 쪼개어 보는 것

**Ground Truth** — 정답 데이터. 사람이 확인한 참값. 모델 출력의 정오를 판정하는 기준

**grounded** — 후속 에이전트가 앞 단계의 실제 발견 사실 위에서 작업하는 상태

**Grounded / Groundedness** — 근거 기반. 답변이 실제로 확인된 출처나 데이터에 뿌리를 두고 있는 상태

**Grounding** — 그라운딩. 생성된 내용을 실제 근거 자료에 묶어 두는 것.

**Hallucination**

- 환각. 모델이 근거 없는 내용을 사실처럼 그럴듯하게 생성하는 것  <sub>(PRESTUDY-c-23-39.md)</sub>
- 환각. 모델이 근거 없는 내용을 사실처럼 생성하는 현상. 결손을 지어내 메우는 것은 의도적 환각이다.  <sub>(PRESTUDY-c-55-70.md)</sub>

**hallucination** — 모델이 근거 없는 내용을 사실처럼 생성하는 현상

**Handoff** — 핸드오프. 작업을 다른 주체(사람 또는 다른 에이전트)에게 넘기는 행위.

**handoff** — 한 단계·에이전트에서 다음으로 결과를 넘기는 것

**headings / structured markup** — 마크다운 헤딩·XML 태그 등으로 입력을 구획해 모델의 인식을 돕는 것

**human escalation** — 사람(상담원·관리자)에게 사건을 넘기는 것

**human review** — 자동 처리하지 않고 사람이 직접 확인하는 경로

**Human-in-the-Loop** — 휴먼 인 더 루프. 사람이 판단·승인 지점으로 개입하도록 설계된 구조.

**Human-in-the-Loop (HITL)** — 사람 개입 설계. 자동화 파이프라인에 사람의 판단을 선택적으로 삽입하는 구조

**Infinite Loop** — 무한 루프. 같은 실패 조치를 반복하며 자원만 소모하는 상태.

**Information Loss / Degradation** — 정보 유실. 압축 과정에서 정확한 숫자·식별자 등 세부 사항이 사라지는 것

**injection (into prompt)** — 요약이나 사실 블록을 프롬프트에 삽입하는 것

**inversely related** — 점수가 높을수록 정확도가 낮아지는 역관계. 심각한 미스캘리브레이션

**Iterative Summarization** — 반복 요약. 요약본 위에 다시 요약을 얹는 방식. 반복할수록 세부 정보 유실이 가속됨

**jitter** — 재시도 시각을 무작위로 흩뿌려 동시 재시도 폭주를 막는 기법

**key facts / citations / relevance score** — 축약된 구조화 출력의 3요소: 핵심 사실 / 출처 인용 / 관련성 점수

**Labeled Validation Set**

- 라벨링된 검증 세트. ground truth가 붙은 데이터 묶음. 성능 측정과 임계값 설정에 사용  <sub>(PRESTUDY-c-23-39.md)</sub>
- 라벨링된 검증 세트. 정답이 부여된 평가용 데이터셋.  <sub>(PRESTUDY-c-55-70.md)</sub>

**Legitimate / Final Empty Result** — 정당한 빈 결과. 확인 결과 데이터가 실제로 존재하지 않는, 성공적으로 종료된 상태.

**local retry** — 서브에이전트가 상위에 알리지 않고 자체적으로 재시도하는 것

**Lost in the Middle**

- 긴 입력의 중간 부분 정보를 모델이 놓치는 현상. 성능이 U자 곡선을 그린다.  <sub>(PRESTUDY-c-55-70.md)</sub>
- 긴 입력의 중간에 위치한 정보를 모델이 잘 활용하지 못하는 현상  <sub>(PRESTUDY-c-87-101.md)</sub>

**main agent** — 사용자와 대화하고 전체 목표와 최종 판단을 담당하는 주 에이전트

**Main Agent / Coordinator / Orchestrator** — 메인 에이전트 / 코디네이터. 전체 작업을 계획하고 하위 작업을 분배하며 결과를 종합하는 상위 에이전트

**Manifest** — 매니페스트. 어떤 작업/영역이 이미 처리되었는지 기록한 인덱스. 중복 탐색 방지용.

**methodology** — 수치가 산출된 방법(하향식/상향식, 표본, 정의 등)

**Minimum Sample Size Floor** — 최소 샘플 수 하한선. 물량과 무관하게 세그먼트별로 보장하는 최소 표본 수.

**miscalibration** — 점수와 실제 정답률이 어긋난 상태

**Model Recency** — 모델 최신성. 사용 중인 모델 버전이 얼마나 최신인지. 운영 정확도의 강력한 예측 변수가 아님

**Needle-in-a-Haystack** — 건초더미 속 바늘 문제. 컨텍스트가 매우 길 때 그 안의 특정 사실을 정확히 찾아내는 능력이 저하되는 현상

**observed accuracy** — 검증 데이터에서 실제로 측정된 정답률

**offer to escalate** — 사람 연결을 선택지로 제시하는 것 (강제하거나 되묻는 것과 다름)

**orchestrator** — 여러 서브에이전트를 실행·조율하고 결과를 모으는 상위 주체

**outdated figure** — 더 최신 자료가 있음에도 인용된 낡은 수치

**Outlier** — 이상치. 다수와 어긋나는 값. 다만 시점·출처가 다른 정당한 데이터를 이상치로 오인해 버리면 안 됨

**output schema** — 서브에이전트가 반환해야 할 출력의 정해진 구조

**Overconfidence** — 과잉 확신. 실제 정답률보다 높은 신뢰도를 스스로 부여하는 경향

**overconfidence / underconfidence** — 과신(점수 > 실제) / 과소평가(점수 < 실제)

**Partial Failure** — 부분 실패. 병렬 실행된 작업 중 일부만 실패한 상황

**Partial Success / Partial Results** — 부분 성공 / 부분 결과. 일부만 완료된 작업의 유효한 산출물. 버리지 말고 활용한다.

**Per-statement Reference** — 문장별 참조. 문서 단위 목록이 아니라 문장 단위로 붙는 출처 표시.

**Persistent Case-Facts Block** — 지속성 사건 데이터 블록. 주문번호·금액·기한 등 절대 잃으면 안 되는 정밀 정보를 요약 대상에서 분리해 매 프롬프트에 그대로 주입하는 고정 블록

**persistent facts block** — 절대 잃으면 안 되는 사실을 요약 밖에 구조화해 두고 매 프롬프트에 재주입하는 영역

**Persistent Memory** — 지속성 메모리. 세션 컨텍스트와 무관하게 유지되는 저장 공간

**policy coverage** — 정책이 해당 사안을 명시적으로 다루고 있는 정도

**policy silence** — 정책이 해당 상황을 전혀 다루지 않는 공백 상태. "금지"와 다름

**propagation** — 교체된 자격증명·설정이 각 환경에 실제로 반영·전파되는 것

**prorated** — 일할 계산. 사용 기간에 비례해 금액을 나누어 산정

**publication date** — 자료의 발행 일자. 최신성 판단의 근거

**QA Sampling** — 품질 보증 샘플링. 남은 검토 용량으로 고신뢰 항목을 소규모 무작위 검사해 시스템 열화를 감시하는 것

**raw score** — 재보정을 거치지 않은 모델의 원시 점수

**raw transcript** — 에이전트 실행의 원본 대화록 전체. 그대로 넘기면 토큰 폭발

**Read Replica** — 읽기 복제본. 읽기 전용으로 운영되는 데이터베이스 사본. 기본 경로 실패 시 대안이 된다.

**reasoning narrative** — 에이전트의 단계별 추론 서술. 대개 상위에는 불필요

**recalibration** — Platt scaling, isotonic regression 등으로 점수를 실제 확률에 맞게 사후 보정하는 것

**reclaim (context space)** — 컨텍스트 공간을 다시 확보하는 것

**reconciliation** — 상충 데이터를 조정해 하나로 정리하는 작업. 코디네이터의 역할

**Recovery Path / Recovery Strategy** — 복구 경로 / 복구 전략. 재시도, 대체 에이전트 투입, 포기 중 무엇을 택할지의 계획.

**Redundant Exploration** — 중복 탐색. 이미 조사한 영역을 다시 조사해 비용과 시간을 낭비하는 것.

**Regulated Workflow** — 규제 워크플로. 법적·규제적 요구사항이 적용되어 정확성과 감사 추적이 필수인 업무

**reliability diagram** — 신뢰도 구간별 실제 정답률을 그린 보정 상태 진단 그래프

**Resiliency** — 회복탄력성. 장애 이후에도 유용한 결과를 내고 복구할 수 있는 능력.

**Result Caching** — 결과 캐싱. 이미 완료된 에이전트의 결과를 저장해 재개 시 재계산 없이 재사용하는 것

**Resume** — 재개. 일시 정지된 워크플로를 다시 이어서 실행하는 것

**Retry** — 재시도. 일시적 장애에 대비해 같은 요청을 다시 시도하는 것. 소진 후에도 실패하면 상위에 오류를 보고

**retry budget** — 최대 재시도 횟수·시간의 상한

**Retryable Failure** — 재시도 가능 실패. 일시적 원인이라 다시 시도하면 성공할 수 있는 오류.

**Risk-Based Routing** — 리스크 기반 라우팅. 제한된 검토 용량을 오류 가능성이 높은 항목에 우선 배분하는 전략

**Rolling Summarization** — 롤링 요약. 긴 대화의 앞부분을 주기적으로 요약해 대체하는 기법. 손실 압축이라 수치·ID가 유실되기 쉽다.

**routing threshold** — 자동 처리와 사람 검토를 가르는 신뢰도 기준값

**running summary** — 대화가 진행되는 동안 몇 턴마다 갱신되는 누적 요약

**Sample Size** — 표본 크기. 측정에 사용된 데이터 건수. 필요조건이지만 분포 편향과 라벨 품질을 대체하지 못함

**Scratchpad**

- 스크래치패드. 에이전트가 발견한 사실을 컨텍스트 밖 파일에 기록해 두는 외부 메모리  <sub>(PRESTUDY-c-23-39.md)</sub>
- 스크래치패드. 에이전트들이 중간 결과를 기록·공유하는 컨텍스트 외부의 작업 공간.  <sub>(PRESTUDY-c-55-70.md)</sub>

**scratchpad file** — 발견 사항을 적어 두는 작업용 별도 파일

**Segment / Stratum** — 세그먼트 / 층. 층화의 단위가 되는 하위 집단(예: 문서 유형).

**Self-reported Confidence** — 자기 보고 신뢰도. 모델 스스로 매긴 점수. 검증 전에는 신뢰할 수 없음

**Self-service-eligible** — 셀프서비스 처리 가능. 고객이 스스로 처리할 수 있을 만큼 단순한 요청

**Sentiment Analysis** — 감정 분석. 텍스트의 정서적 톤을 점수화하는 기법. 문제의 복잡도 지표로 쓰면 안 됨

**separation of concerns** — 역할 분리. 서브는 수집·보고, 코디네이터는 조정·결정

**Silent Failure / Silent Suppression** — 조용한 실패 / 무언의 은폐. 실제로는 실패했는데 성공으로 보고해 상위 시스템이 오판하게 만드는 것

**source metadata** — 데이터의 출처, 발행일, 방법론, 범위 등 부가 정보

**Spawn**

- 스폰. 서브에이전트를 생성해 작업을 위임하는 것  <sub>(PRESTUDY-c-23-39.md)</sub>
- 스폰. 새로운 서브에이전트를 생성·실행하는 행위.  <sub>(PRESTUDY-c-55-70.md)</sub>

**Stale Cache** — 오래된 캐시. 허용 기한을 넘겨 신선하지 않은 캐시 데이터.

**state management** — 대화·작업 상태를 어디에 어떤 형태로 보관할지 설계하는 것

**State Persistence** — 상태 지속성. 실행 상태를 보존해 중단 후에도 이어갈 수 있게 하는 메커니즘

**Status Reporting** — 상태 보고. 작업 결과를 success/error 등으로 정확히 표기해 반환하는 것

**step count** — 처리에 필요한 단계 수. 그 자체로는 에스컬레이션 사유가 아님

**Stratified Sampling** — 층화 추출. 모집단을 의미 있는 하위 집단으로 나눠 각각에서 샘플을 뽑는 방법.

**stratified sampling** — 문서 유형 등 하위 집단별로 나누어 표본을 뽑는 검증 기법

**Structured Failure Report** — 구조화된 실패 보고. 실패 유형·시도 내역·부분 결과·대안을 규격화해 전달하는 오류 보고.

**Structured Output Schema** — 구조화된 출력 스키마. 에이전트가 반환하는 JSON 등의 필드 구조를 미리 정의한 것

**Structured Record** — 구조화 레코드. 개체 하나를 ID를 키로 하는 독립된 데이터 구조로 보관하는 방식.

**Subagent**

- 서브에이전트. 코디네이터가 특정 작업을 위해 생성하는, 자기만의 독립 컨텍스트를 가진 하위 에이전트  <sub>(PRESTUDY-c-23-39.md)</sub>
- 서브에이전트. 좁은 하위 작업을 담당하며 자체 컨텍스트를 갖는 하위 에이전트.  <sub>(PRESTUDY-c-55-70.md)</sub>

**subagent** — 좁은 하위 작업을 자기 컨텍스트에서 수행하는 하위 실행 단위

**Summarization / Summarization Pass** — 요약 / 요약 단계. 긴 대화를 압축해 프롬프트를 짧게 유지하는 기법

**summarization drift / lossy compression** — 요약을 반복할수록 구체적 사실이 점점 흐려지는 정보 손실 현상

**synthesis (step)** — 여러 결과를 하나의 답·문서로 통합하는 단계

**Synthesis Agent** — 종합 에이전트. 여러 서브에이전트의 결과를 모아 최종 산출물을 작성하는 에이전트

**Synthesis Step** — 종합 단계. 여러 서브에이전트 결과를 하나의 최종 산출물로 합치는 단계.

**System Prompt** — 시스템 프롬프트. 대화 시작 전 모델에게 주어지는 역할·제약·판단 기준 지침

**systematic / non-transient failure** — 환경이 바뀌지 않으면 계속 실패하는 구조적 오류 (예: 잘못된 자격증명)

**TAM (Total Addressable Market)** — 총 유효 시장. 제품이 이론상 도달 가능한 시장 전체 규모

**Targeted / Selective Routing** — 선택적 라우팅. 오류 위험이 높은 조건에 해당하는 건만 골라 사람 검토로 보내고 나머지는 자동 통과시키는 정책

**Temperature** — 온도. 출력의 무작위성을 조절하는 파라미터. 낮으면 일관·결정적, 높으면 다양·창의적. 정보 추출에는 낮게 설정

**Threshold**

- 임계값. 검토를 건너뛸지 여부를 가르는 기준선  <sub>(PRESTUDY-c-23-39.md)</sub>
- 임계값. 이 점수 미만은 사람이 검토한다는 식의 자동 판정 기준선.  <sub>(PRESTUDY-c-55-70.md)</sub>

**Token**

- 토큰. 모델이 텍스트를 처리하는 최소 단위이자 과금 단위. 대략 단어 조각 하나  <sub>(PRESTUDY-c-23-39.md)</sub>
- 토큰. 모델이 텍스트를 처리하는 최소 단위. 과금과 길이 제한의 기준.  <sub>(PRESTUDY-c-55-70.md)</sub>

**token** — 모델이 처리하는 텍스트의 최소 단위. 비용·속도·용량이 모두 토큰 수에 비례

**tone acknowledgment** — 사용자의 감정·어조를 인지하고 언급하는 것

**Tool Calling / Function Calling** — 도구 호출. 모델이 외부 함수를 호출하도록 요청하고 그 결과를 받아 이어가는 방식.

**transient error** — 일시적 오류. 재시도하면 성공할 가능성이 높음 (예: 503, 타임아웃)

**Transparency** — 투명성. 시스템이 무엇을 확인했고 무엇을 확인하지 못했는지 사용자에게 정확히 알리는 것

**Truncation** — 절단. 컨텍스트 한계를 넘어 오래된 내용이 잘려 나가는 것

**truncation** — 예산 초과로 입력의 일부가 잘려 나가는 것

**Under-sampling** — 과소 샘플링. 특정 세그먼트에서 통계적으로 부족한 수의 샘플만 뽑히는 문제.

**Validation Methodology** — 검증 방법론. 정확도 수치를 어떻게 측정했는지에 대한 절차와 기준

**validation set** — 모델 성능·보정 상태를 측정하는 데 쓰는 별도 데이터 집합

**verbose output** — 파일 덤프, 로그, grep 결과처럼 부피만 크고 정보 밀도는 낮은 출력

**Volume-proportional Sampling** — 볼륨 비례 샘플링. 물량 비율대로 샘플 수를 배분하는 방식. 소량 세그먼트를 과소 샘플링한다.

**Well-calibrated** — 잘 보정된. 0.9라고 말한 항목이 실제로 약 90% 맞는 상태

**well-calibrated** — 0.9라고 한 예측이 실제로 약 90% 맞는 상태

**Zero-match** — 제로 매치. 검색이 정상 수행되었으나 조건에 맞는 결과가 실제로 0건인 상태

**Zero-shot** — 제로샷. 예시 없이 지시문만으로 작업을 수행시키는 방식
