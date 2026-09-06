# Context Management & Reliability — 학습용 핵심 요약 노트

모의시험 101문항(01–101) 기반 — 45·78·98번 제외(69번과 동일 지문, 69번 기준으로 통합).

**사용법**: "문제 신호"로 지문 키워드를 잡고 → "정답 키워드"를 고르고 → "함정 키워드"는 버린다.
모든 키워드는 **보기 원문에서 그대로 뽑은 8단어 이내 조각**이다. 이것만 눈에 들어와도 정답/오답이 갈린다.

---

## 0. 5초 판별 치트시트 (Decision Cheatsheet)

| 지문에 이게 보이면 | 정답은 이 방향 |
|---|---|
| exceeds its timeout budget before any response (타임아웃) | access failure + 재시도 가능 |
| a 200 response with zero matching rows (정상 0건) | valid empty result + 재시도 불필요 |
| returns no matching glossary terms / genuinely matches zero cases | valid empty result |
| the connection pool is exhausted / cache is stale beyond threshold | access failure (재시도 대상) |
| already retried twice locally with exponential backoff (한도 소진) | 실패 유형·시도 쿼리·부분 결과와 함께 에스컬레이션 |
| succeeds on an internal retry a second later (로컬 해결) | 코디네이터에 안 올림 |
| credentials were rotated and never propagated (지속적 실패) | 시도 내역과 함께 에스컬레이션 |
| returns an empty findings list with status 'success' (실패 은폐) | 접근 실패를 성공으로 위장 → 허위 커버리지 |
| 'Query failed.' / 'search unavailable' (맨 문자열) | 실패 유형 + 부분 결과 + 대안 누락 |
| crashes partway through, after already flagging two (부분 진행) | 부분 결과 + 실패 유형 + 미처리 범위 전부 |
| aborts the entire pipeline and discards the four completed | 완료분으로 합성 + 결손 명시 |
| the finding degraded out of active context (장기 세션 모순) | scratchpad 기록 |
| after the third summarization pass (반복 요약) | persistent facts block |
| only the user's new message along with the session ID | API는 stateless — 히스토리 재전송 |
| returns a JSON payload with 40+ fields (노이즈 필드) | 필요한 필드만 남기고 컨텍스트 투입 |
| appeared in the third of five sections in the middle | 상단 요약 front-load + 명시적 헤딩 |
| exceeds what the downstream agent can process (예산 초과) | 핵심 사실·인용·관련성 점수만 반환 |
| flood the main conversation with thousands of matched paths | 서브에이전트에 위임, 정제 목록만 회수 |
| coordination overhead disproportionate to the task (작은 조회) | 메인 에이전트가 직접 수행 |
| several agents already having completed and returned | 캐시된 결과 재사용, 나머지만 실행 |
| each investigating a different module ... concurrently | 에이전트별 고유 스크래치패드 파일 |
| omits the study's publication year (시점 불명) | 발행일·수집일 필수 필드 추가 |
| can no longer be traced to any specific source | 주장 ↔ 출처 URL + 발췌문 매핑 |
| Both sources are credible (양쪽 신뢰 가능) | 나란히 병기 + 출처 귀속 + 충돌 명시 |
| only one subagent found ... no other source corroborates | 교차검증 vs 미검증 섹션 분리 |
| 94% / 96% / 97% / 99.2% in aggregate (합산 정확도) | 문서 유형·필드별 세분화(slicing) |
| scored at 0.9 or higher are still wrong (임계값 무효) | ground truth로 캘리브레이션 |
| 0.95 correct only 78% / 0.6 correct 90% (역전) | 미보정 — 원시 점수 임계 사용 금지 |
| a new document scanner ... lower-resolution (입력 변화) | 입력 분포 이동 → 재검증 |
| one type makes up 70% of daily volume (편중) | 유형별 최소 표본 수 보장 |
| does not mention / never addresses in either direction (정책 공백) | 에스컬레이션 |
| I want a real person, not a bot (일반 서비스) | 즉시 사람에게 이관 |
| Anthropic 과금 문의 + 봇 거부 | AI-first — 설명·해결 먼저, 반복 요구 시 이관 |
| the customer has not asked to speak with a human (요구 없음) | 공감 + 직접 처리 |
| very negative sentiment / sharp language (감정만) | 감정≠복잡도 → 이관 안 함 |
| self-reported confidence score of 45% (자체 신뢰도) | 자체 점수는 복잡도 대리 지표 아님 |
| three passenger records with the same name (모호) | 추가 식별자 요청 |
| three different tool-based remediation steps ... each fails | 옵션 소진 → 사람에게 이관 |

**만능 오답 패턴 (거의 항상 함정)**

| 원문 조각 | 한국어 |
|---|---|
| Switch to a model with the largest available context window | 컨텍스트 창 큰 모델로 교체 |
| Switch to a larger model mid-session | 세션 중 큰 모델로 전환 |
| Increase the maximum output token limit for the session | 출력 토큰 상한 증가 |
| Increase the model's temperature setting | 온도 상승 |
| raise its temperature setting so summaries retain more | 온도로 원문 보존 |
| Increase the frequency of summarization passes | 요약을 더 자주 |
| Summarize the conversation less frequently | 요약을 덜 자주 |
| Ask the customer to restate / repeat on every turn | 사용자에게 재입력 요구 |
| Require the policyholder to specify ... every time | 사용자에게 매번 지정 요구 |
| Re-run all five subagents from scratch | 성공분까지 전부 재실행 |
| Discard the entire ... until all four can be pulled | 부분 성공분 폐기 |
| Continue retrying ... indefinitely | 무한 재시도 |
| Average the two figures into a single blended estimate | 두 수치 평균 |
| filling the blocked competitor's pricing with a market-trend estimate | 빈칸을 추정치로 채움 |
| fabricated but plausible content so the report shows no gaps | 그럴듯한 조작 |
| read through the entire document twice before drafting | 두 번 읽으라고 지시 |
| append a note at the very end reminding the model | 끝에 주의 문구 추가 |
| always / never / only / categorically exempt / inherently | 절대 단정어 |

---

## 1. 접근 실패 vs 유효한 빈 결과 (Access Failure vs Empty Result)

**해당 문제**: 1, 9, 27, 36, 64

### 대조표 (최중요)
| 상황 | 원문 신호 | 분류 | 재시도 |
|---|---|---|---|
| 타임아웃 | exceeds its timeout budget | access failure | **O** |
| 429 / 503 | rate-limit / transient 503 | access failure | **O** |
| 커넥션 풀 고갈 | connection pool is exhausted | access failure | **O** |
| 캐시 만료 | cache is stale beyond its threshold | access failure | **O** |
| 안티봇 403 | blocked by anti-bot protection | access failure | (제한적) |
| 인증/자격 오류 | API key expired / credentials rotated | access failure | **X** (에스컬레이션) |
| 200 + 0건 | 200 response with zero matching rows | **valid empty result** | **X** |
| 신규 언어 용어집 없음 | returns no matching glossary terms | **valid empty result** | **X** |
| 판례 0건 | genuinely matches zero cases | **valid empty result** | **X** |
| 거래 없음 | legitimately finds no trades occurred | **final empty result** | **X** |

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| access failure eligible for retry | 재시도 가능한 접근 실패 | 인프라·네트워크 계층 장애 |
| valid empty result needing no retry | 재시도 불필요한 유효 빈 결과 | 정상 수행 + 데이터 부재 |
| silently suppressed an access failure as success | 접근 실패를 성공으로 은폐 | 최악의 안티패턴 |
| conflates a completed zero-match with a connection failure | 0건 조회와 연결 실패를 혼동 | 상태 신뢰성 파괴 |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| Report the timeout as an access failure eligible for retry | 타임아웃은 재시도 가능한 접근 실패로 | 1 |
| the zero-row response as a valid empty result | 0행 응답은 유효한 빈 결과로 | 1 |
| the missing-glossary case as a valid empty result | 용어집 없음은 유효한 빈 결과 | 9 |
| the database-offline case as a retryable access failure | DB 오프라인은 재시도 가능한 접근 실패 | 9 |
| It conflates a completed zero-match search with a connection failure | 0건 검색과 연결 실패를 혼동함 | 36 |
| the latter should be a distinct access failure | 후자는 별개의 접근 실패여야 함 | 36 |
| the stale-cache abort as an access failure eligible for retry | 캐시 만료 중단은 재시도 대상 접근 실패 | 64 |
| the no-trades result as a final empty result | 거래 없음은 최종 빈 결과 | 64 |
| silently suppressed an access failure as success | 접근 실패를 조용히 성공으로 은폐 | 27 |
| so the coordinator reported false full coverage | 그래서 허위 전체 커버리지를 보고 | 27 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| Report both outcomes as access failures so the coordinator retries | 둘 다 접근 실패로 처리 | 불필요한 재시도 |
| Report both outcomes as empty results, since neither returned | 둘 다 빈 결과로 처리 | 데이터 손실 |
| Report the timeout as a valid empty result | 타임아웃을 유효한 빈 결과로 | 정반대 |
| the zero-row response as an access failure that needs a retry | 0행을 재시도 필요 실패로 | 정반대 |
| finding no matching terms means the lookup failed | 0건 = 조회 실패라는 논리 | 거짓 |
| since in each case the subagent ends up without any terms | 결과가 같으니 동일 처리 | 원인 무시 |
| It is not flawed at all, since both produced zero citations | 결과 0건이면 문제없음 | 거짓 |
| 'no results found' is too informal; formal wording would fix | 표현이 비공식적인 게 문제 | 핵심 회피 |
| the subagent should have terminated the entire workflow | 워크플로 전체를 종료 | 과도 |
| correctly avoided alarming the coordinator about a minor issue | 사소한 문제라 알리지 않음 | 은폐 정당화 |
| every subagent result should require manual verification | 매 결과를 사람이 검증 | 자동화 포기 |
| Escalate both as unrecoverable errors that halt processing | 둘 다 복구 불가로 전면 중단 | 과도 |

---

## 2. 서브에이전트 오류 보고 & 에스컬레이션 (Error Reporting & Escalation)

**해당 문제**: 3, 7, 13, 32, 49, 56, 57, 59, 82, 85, 97

### 핵심 규칙
| 상황 | 원문 신호 | 처리 |
|---|---|---|
| 로컬 재시도로 해결됨 | succeeds on an internal retry | **위로 안 올림** |
| 로컬 재시도 한도 소진 | already retried twice ... still rate-limited | 실패 유형 + 시도 내역 + 부분 결과로 **에스컬레이션** |
| 자격 증명 문제 | credentials were rotated and never propagated | 로컬 재시도 무의미 → **에스컬레이션** |
| 부분 진행 후 충돌 | crashes partway through, after already flagging two | 부분 결과 + 실패 유형 + **미처리 범위** |
| 일부 실패, 나머지 성공 | four completed / two of three succeed | 완료분 합성 + **결손 주석** |

### 필수 에러 페이로드 4종
| 원문 | 한국어 |
|---|---|
| failure type | 실패 유형 |
| the action that was attempted | 시도했던 작업/쿼리 |
| any partial results gathered | 수집된 부분 결과 |
| alternative approaches to try next | 다음에 시도할 대안 |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| Escalate with the failure type, the attempted queries, and partial results | 실패 유형·시도 쿼리·부분 결과와 함께 에스컬레이션 | 3 |
| since more local retries seem unlikely to help | 추가 로컬 재시도가 도움될 것 같지 않으므로 | 3 |
| the coordinator can inspect each failure's type and results | 코디네이터가 유형과 결과를 검토할 수 있음 | 7 |
| to decide whether to retry or proceed | 재시도할지 진행할지 결정하려고 | 7 |
| The two vulnerabilities found, the crash's failure type | 발견한 취약점 2건 + 충돌의 실패 유형 | 13 |
| and which files were left unscanned by the tool | 그리고 미스캔 파일 목록 | 13 |
| Include the two successful comparisons and annotate | 성공한 2건 포함 + 주석 | 32 |
| that the third competitor's pricing is unavailable | 세 번째 경쟁사 가격은 이용 불가라고 | 32 |
| Failure type, the action that was attempted, any partial results | 실패 유형·시도 작업·부분 결과 | 49 |
| and alternative approaches to try next | 그리고 다음에 시도할 대안 | 49 |
| Synthesize from the four completed results | 완료된 4건으로 합성 | 56 |
| use the failed subagent's error context to flag the coverage gap | 실패 컨텍스트로 커버리지 공백 표시 | 56 |
| It omits the failure type and any partial results or alternatives | 실패 유형·부분 결과·대안을 모두 누락 | 57 |
| leaving no basis to choose a recovery path | 복구 경로 선택 근거가 없음 | 57 |
| Add the three pods' data to the timeline now | 3개 파드 데이터를 지금 타임라인에 반영 | 59 |
| and separately decide whether to retry the missing pod | 누락분 재시도는 별도로 결정 | 59 |
| Annotate coverage so readers see which sections are well-supported | 잘 뒷받침된 섹션을 알 수 있게 주석 | 82 |
| and which have gaps | 그리고 어디에 공백이 있는지 | 82 |
| The generic status hides recovery detail | 일반 상태값은 복구 정보를 숨김 | 85 |
| return failure type, what was queried, and any partial results | 실패 유형·쿼리 내용·부분 결과 반환 | 85 |
| Resolve the transient 503 locally without the coordinator | 일시적 503은 로컬에서 해결 | 97 |
| but escalate the credential failure with what was attempted | 자격 증명 실패는 시도 내역과 함께 에스컬레이션 | 97 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| Keep retrying locally on the same backoff schedule indefinitely | 동일 백오프로 무한 재시도 | 무한 루프 |
| since a 429 will always eventually resolve | 429는 언젠가 반드시 풀린다 | 절대 단정 |
| Immediately fail the entire triage workflow | 전체 워크플로를 즉시 실패 처리 | 과도 |
| Return an empty result and mark the ticket resolved | 빈 결과 반환 + 해결 처리 | 거짓 보고 |
| Nothing at all until the scan can be fully restarted | 완전 재시작 전까진 무응답 | 블로킹 |
| reported as the complete final result with no note | 미스캔 언급 없이 완료로 보고 | 은폐 |
| Only a generic failure notice, since partial findings could mislead | 일반 실패 알림만 | 정보 유실 |
| Withhold the entire report until the block can be resolved | 블록 해제까지 보고서 보류 | 마비 |
| filling the blocked competitor's pricing with a market-trend estimate | 추정치로 빈칸 채움 | 환각 |
| without any note, since two of three is close enough | 주석 없이 3자 비교로 위장 | 은폐 |
| Replace the failed subagent's section with fabricated but plausible content | 조작된 그럴듯한 내용으로 대체 | 환각 |
| Re-run all five subagents from scratch | 성공한 4건까지 재실행 | 낭비 |
| Still abort the pipeline entirely, since a single failure | 하나 실패했으니 전체 중단 | 결함 허용 결여 |
| A free-text log excerpt of the entire internal reasoning trace | 전체 추론 트레이스 원문 | 토큰 낭비 |
| A retry count and a timestamp, since the coordinator can infer | 재시도 횟수 + 타임스탬프 | 근거 부족 |
| A single numeric error code mapped to an internal lookup table | 단일 숫자 에러 코드 | 의미 부재 |
| It is missing a timestamp, and timestamps alone let a coordinator | 타임스탬프만 있으면 판단 가능 | 거짓 |
| It fails to include the exact HTTP status code | HTTP 상태 코드가 유일한 필수 | 절대 단정 |
| It is too long for the coordinator to process efficiently | 너무 길어서 문제 | 사실 반대(2단어) |
| Ignore the suggested read-replica alternative | 제안된 대안을 무시 | 유용 정보 폐기 |
| coordinators should never act on subagent suggestions | 코디네이터는 제안을 절대 안 따름 | 절대 단정 |
| Discard the entire payments-service contribution | 부분 성공분 전량 폐기 | 낭비 |
| shorten it to a bare success or failure boolean flag | 불린 플래그로 축약 | 정보 더 상실 |
| coordinators should never see subagent detail | 코디네이터는 상세를 보면 안 됨 | 절대 단정 |
| have the subagent retry silently until the auth error clears | 인증 오류를 조용히 무한 재시도 | 해결 불가 |
| Retry both failures locally and indefinitely | 둘 다 무기한 로컬 재시도 | 무한 루프 |
| subagents should never attempt any local retries at all | 로컬 재시도를 절대 금지 | 병목 |
| Escalate the transient 503 to the coordinator | 일시적 503을 위로 올림 | 불필요 |
| Append one generic disclaimer noting some unspecified sources | 모호한 일반 면책 조항 | 판단 불가 |
| Omit the two affected sections entirely | 영향받은 섹션 통째 삭제 | 범위 왜곡 |
| Present all findings as one uniform narrative with no distinction | 구분 없이 균일 서술 | 오도 |

---

## 3. 컨텍스트 손실 & 스크래치패드 (Context Degradation & Scratchpad)

**해당 문제**: 5, 6, 14, 21, 28, 30, 34, 65, 81, 84, 92

### 대조표
| 목적 | 도구 |
|---|---|
| 압축 전 손실 방지 | **scratchpad 파일 선기록 → 그 다음 compact** |
| 장기 세션 사실 유지 | 구체적 사실(클래스명·경로·메커니즘)을 scratchpad에 기록 |
| 크래시 후 재개 | 알려진 위치로 상태 export + **manifest** 로드 |
| 병렬 서브에이전트 | **에이전트별 고유 파일명** → 종료 후 취합 |
| 중복 탐색 방지 | 새 spawn 전에 manifest/scratchpad 먼저 조회 |

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| degraded out of active context | 활성 컨텍스트 밖으로 밀려남 | 장기 세션 모순의 원인 |
| durable scratchpad file | 지속성 스크래치패드 파일 | 압축·유실에 견디는 외부 메모리 |
| manifest of agent states | 에이전트 상태 매니페스트 | 재개 시 로드 대상 |
| cached results are reused | 캐시된 결과 재사용 | 같은 세션 내 재개 동작 |
| race condition / overwritten | 경쟁 조건·덮어쓰기 | 공유 파일 동시 기록의 위험 |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| Write the exact facts to a durable scratchpad file first | 정확한 사실을 먼저 지속성 파일에 기록 | 5 |
| then compact the conversation to reclaim space afterward | 그 다음 압축해 공간 회수 | 5 |
| Persist the key findings from the current phase to a scratchpad | 현 단계 핵심 결과를 스크래치패드에 영속화 | 92 |
| and only then compact the conversation to reclaim space | 그러고 나서야 압축 | 92 |
| The finding degraded out of active context over the long session | 장기 세션 동안 활성 컨텍스트에서 밀려남 | 6·28 |
| a scratchpad record would have kept the answer grounded | 스크래치패드 기록이 답을 근거 있게 유지했을 것 | 6·28 |
| record concrete findings, such as exact class names, in a scratchpad | 정확한 클래스명 같은 구체적 사실을 기록 | 84 |
| and consult it before answering | 답변 전에 그것을 참조 | 84 |
| Concrete facts such as exact class names, file paths | 정확한 클래스명·파일 경로 같은 구체적 사실 | 34 |
| and discovered mechanisms, recorded as they are found | 발견된 메커니즘을 발견 즉시 기록 | 34 |
| Load the manifest of agent states | 에이전트 상태 매니페스트를 로드 | 14 |
| skip re-running the three completed agents | 완료된 3개는 재실행 생략 | 14 |
| inject their findings into the remaining prompts | 그 결과를 남은 프롬프트에 주입 | 14 |
| Each agent exports its state to a known file location | 각 에이전트가 알려진 위치로 상태를 export | 21 |
| the coordinator loads a manifest of agent states on resume | 재개 시 코디네이터가 매니페스트를 로드 | 21 |
| Their cached results are reused | 캐시된 결과가 재사용됨 | 30 |
| only the remaining, not-yet-completed agents run live | 미완료 에이전트만 실제 실행 | 30 |
| The manifest or scratchpad records from earlier phases | 이전 단계의 매니페스트나 스크래치패드 기록 | 65 |
| to see whether the caching layer was already investigated | 이미 조사됐는지 확인하려고 | 65 |
| Give each subagent its own uniquely named scratchpad file | 서브에이전트마다 고유 파일명 부여 | 81 |
| aggregate all files only after all subagents have finished | 전원 종료 후에만 파일들을 취합 | 81 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| Compact the conversation immediately without recording anything | 아무것도 기록 않고 즉시 압축 | 유실 |
| since compaction is guaranteed to preserve every exact fact | 압축이 모든 사실을 보존한다고 보장 | 거짓 |
| Delete the conversation and restart from an empty session | 대화 삭제 후 빈 세션 시작 | 전량 유실 |
| since that is the only way to guarantee the facts remain | 그것만이 유일한 보장 수단 | 절대 단정 |
| Avoid compacting entirely and let the session accumulate indefinitely | 압축을 아예 회피하고 무한 누적 | 한계 도달 |
| The agent lacked permission to read the billing service's files | 파일 읽기 권한 부족 | 원인 아님 |
| A network interruption corrupted the agent's understanding | 네트워크 중단이 이해를 손상 | 기술적으로 틀림 |
| a technical malfunction that can only be resolved by restarting | 앱 재시작만이 해결책인 고장 | 원인 아님 |
| Increase the maximum output token limit for the session | 출력 토큰 상한 증가 | recall과 무관 |
| Switch to a larger model mid-session, since added parameter count | 큰 모델로 전환하면 recall 회복 | 거짓 |
| re-read the entire repository from scratch every time | 매번 전체 리포지토리 재탐색 | 극도로 비효율 |
| Only a timestamp of when each exploration step occurred | 실행 시각만 기록 | 정보 없음 |
| A single vague note such as 'explored the codebase and things look fine' | 모호한 한 줄 메모 | 구체성 없음 |
| The complete raw contents of every file the agent opened | 열어본 파일 원문 전체 복사 | 목적 정반대 |
| Discard the three completed agents' exported findings | 완료된 결과를 폐기 | 낭비 |
| ask the user to describe what those agents had found from memory | 사용자 기억에 의존해 재입력 | 부적절 |
| Wait indefinitely for the crashed agents to resume on their own | 스스로 복구되길 무기한 대기 | 데드락 |
| Re-run all five agents completely from scratch | 5개 전부 처음부터 재실행 | 낭비 |
| Rely on the conversation history staying in context indefinitely | 대화 기록이 영구히 남는다고 전제 | 거짓 |
| keep its state only in its own memory during execution | 상태를 인메모리로만 유지 | 크래시 시 전량 소실 |
| The run can only be resumed by exiting and starting a new installation | 재설치해야만 재개 가능 | 거짓 |
| All previously completed results are discarded and cannot be resumed | 재개 자체가 불가능 | 거짓 |
| The user's personal notes taken outside the session | 세션 밖 개인 메모 | 시스템 기록 아님 |
| The main agent's unaided memory of the conversation | 메인 에이전트의 순수 기억 | 유실 위험 |
| Nothing; spawn the new subagent immediately regardless | 확인 없이 즉시 spawn | 중복 수행 |
| all subagents write ... to one single shared scratchpad file | 하나의 공유 파일에 동시 기록 | 경쟁 조건 |
| every subagent overwrite the same fixed scratchpad filename | 고정 파일명을 계속 덮어씀 | 덮어쓰기 |
| Skip scratchpad files entirely and report findings verbally | 스크래치패드 생략, 구두 보고만 | 유실 |

---

## 4. 대화 상태 관리 & 요약 손실 (Conversation State & Summarization Loss)

**해당 문제**: 10, 18, 31, 41, 63, 67, 72, 101

### 대조표
| 실패 모드 | 원문 신호 | 해법 |
|---|---|---|
| 정확한 수치 유실 | after the third summarization pass | **persistent facts block** (요약 밖) |
| 동시 이슈 혼동 | 'the claim' and 'the amount' ambiguous | **이슈별 독립 구조화 레코드** |
| 이전 턴 소실 | only the session ID / one-sentence rolling summary | API는 **stateless** — 히스토리 재전송 |
| 중간 정보 누락 | in the middle of the aggregated text | **front-load 요약 + 헤딩** |
| 도구 출력 범람 | 40+ fields / 60 fields per record | **필드 트리밍** |

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| persistent case-facts block | 지속적 케이스 팩트 블록 | 매 프롬프트에 포함, 요약과 분리 |
| separate structured records per issue | 이슈별 독립 구조화 레코드 | 엔티티 혼동 방지 |
| stateless | 무상태 | 보낸 messages만 모델이 봄 |
| progressively generalized or dropped | 점진적으로 일반화·누락됨 | 반복 요약의 필연적 결과 |
| summarization optimizes for brevity over specific values | 요약은 구체값보다 간결성을 우선 | 수치 유실의 이유 |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| Track the order number, exact refund amount, and stated deadline | 주문번호·정확한 환불액·명시된 기한을 추적 | 31 |
| in a persistent case-facts block included in every prompt | 매 프롬프트에 포함되는 지속적 팩트 블록으로 | 31 |
| Maintain a persistent facts block listing the specific allergy | 구체적 알레르기를 담은 지속 팩트 블록 유지 | 101 |
| included in every prompt outside the summary | 요약 밖에서 매 프롬프트에 포함 | 101 |
| Maintain separate structured records per issue | 이슈별로 독립된 구조화 레코드 유지 | 18 |
| log invoice number and amount ... start time and status | 청구는 번호·금액, 장애는 시작시각·상태 | 18 |
| Track each claim as its own structured record with claim ID | 청구마다 ID를 가진 독립 레코드로 추적 | 63 |
| kept apart from any blended narrative | 혼합 서술과 분리해서 | 63 |
| The message history from the earlier session must be resolved | 이전 세션의 메시지 이력을 요청에 반영해야 함 | 10 |
| a session ID alone does not supply prior turns | 세션 ID만으로는 이전 턴이 제공되지 않음 | 10 |
| The API treats each request as stateless | API는 각 요청을 무상태로 취급 | 72 |
| any turn left out of the message history sent is unavailable | 함께 보내지 않은 턴은 모델이 못 봄 | 72 |
| They are progressively generalized or dropped from the summary | 요약에서 점진적으로 일반화되거나 누락됨 | 41 |
| since summarization optimizes for brevity over specific values | 요약은 구체값보다 간결성을 최적화하므로 | 41 |
| Maintain a case-facts block, keep separate records per active issue | 팩트 블록 유지 + 활성 이슈별 레코드 분리 | 67 |
| trim tool outputs to relevant fields | 도구 출력을 관련 필드로 축소 | 67 |
| and lead aggregated input with headed key findings | 취합 입력을 헤딩 붙은 핵심 결과로 시작 | 67 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| Increase the frequency of summarization passes | 요약 빈도를 늘림 | 유실 가속 |
| Summarize the conversation less frequently | 요약을 덜 자주 | 시점만 미룸 |
| Switch to a model with the largest available context window | 최대 컨텍스트 모델로 교체 | 근본 해결 아님 |
| so the transaction history never needs summarizing | 요약이 아예 불필요해지도록 | 거짓 |
| Have the customer restate the order number ... every new turn | 매 턴 고객이 재진술 | 나쁜 UX |
| Require the policyholder to specify which claim number every time | 매번 청구 번호를 지정하게 함 | 나쁜 UX |
| Ask the patient to confirm their allergy one final time | 마지막에 알레르기를 재확인 | 근본 해결 아님 |
| Summarize only the most recent issue ... treat earlier as resolved | 최근 이슈만 요약, 이전은 해결 처리 | 데이터 손실 |
| add issue-type labels ... to each mention of an amount or time | 언급마다 이슈 라벨만 붙임 | 복잡도만 증가 |
| Ask the customer to hold the outage issue until the dispute is resolved | 장애 문의를 보류시킴 | 부적절 |
| Merge the two claims into a single combined claim number | 두 청구를 한 번호로 병합 | 정합성 파괴 |
| The model's built-in conversational memory should have retained | 내장 대화 메모리가 유지했어야 함 | 그런 기능 없음 |
| The customer should have repeated the seat preference every turn | 고객이 매 턴 반복해야 함 | 나쁜 UX |
| fails only because it was one sentence long | 한 문장이라서 실패한 것 | 근본 원인 아님 |
| They remain exactly as stated indefinitely | 수치는 영구히 그대로 유지됨 | 거짓 |
| since summarization only condenses narrative language | 요약은 서술만 압축, 숫자는 안 건드림 | 거짓 |
| They become more accurate over time as the model notices errors | 반복하면 더 정확해짐 | 거짓 |
| automatically moved into a separate memory store | 자동으로 별도 메모리로 이동 | 없는 동작 |
| stop summarizing at all, while keeping the current structure | 구조 개선 없이 요약만 중단 | 오염 폭증 |
| keep all raw tool output for completeness | 완전성을 위해 원본 출력 전부 유지 | 오염 |
| forward full subagent reasoning chains unchanged | 추론 사슬 전체를 그대로 전달 | 낭비 |

---

## 5. 컨텍스트 예산 & 서브에이전트 위임 (Context Budget & Delegation)

**해당 문제**: 16, 19, 20, 23, 46, 58, 70, 75, 88, 91, 93, 94

### 대조표
| 상황 | 원문 신호 | 처리 |
|---|---|---|
| 방대한 탐색 출력 | flood the main conversation with thousands of paths | **서브에이전트 위임**, 정제 결과만 회수 |
| 작고 표적화된 조회 | coordination overhead disproportionate | **메인 에이전트가 직접** |
| 역할 분담 | exhaustive searches vs synthesizing strategy | 탐색=서브, **합성=메인** |
| 도구 출력 40~60필드 | only 5 fields matter | **필요 필드만 추출 후 투입** |
| 하위 출력이 예산 초과 | forcing it to drop some findings | **핵심 사실·인용·관련성 점수만** |
| 중간 섹션 누락 | in the middle of the document | **상단 요약 + 명시적 헤딩** |
| 단계 간 인계 | phase 1 → phase 2 | **간결한 요약을 주입** (원본 transcript 아님) |

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| bounded question | 범위가 정해진 질문 | 위임 프롬프트의 필수 요건 |
| distilled summary | 정제된 요약 | 서브에이전트 반환 형식 |
| leaving the raw output isolated in its own context | 원본 출력을 자기 컨텍스트에 격리 | 위임의 핵심 이점 |
| Lost in the Middle | 중간 정보 유실 | 긴 문서 중앙부 주의력 저하 |
| key facts, citations, and a relevance score | 핵심 사실·인용·관련성 점수 | 압축된 출력 계약 |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| Delegate a subagent with the bounded question of tracing refund flow | 범위가 정해진 질문으로 서브에이전트에 위임 | 16 |
| and report a distilled summary | 그리고 정제된 요약을 보고 | 16 |
| Spawn a subagent to search for test files and return only the list | 서브에이전트가 목록만 반환하도록 | 23 |
| leaving the raw output isolated in its own context | 원본 출력은 자기 컨텍스트에 격리 | 23 |
| Have the main agent search and read the relevant file directly | 메인 에이전트가 직접 검색·읽기 | 19 |
| the lookup is small and targeted enough | 조회가 충분히 작고 표적화되어 있으므로 | 19 |
| 'Trace refund flow dependencies across payments, ledger, and notifications' | 구체적 대상을 명시한 지시 | 20 |
| and summarize what you find | 찾은 것을 요약하라 | 20 |
| Delegate the exhaustive searches that generate verbose output | 장황한 출력을 내는 탐색을 위임 | 93 |
| and let the main agent synthesize their summaries | 메인 에이전트는 요약을 종합 | 93 |
| Keep only the order status, purchase date, item, amount | 상태·구매일·품목·금액만 유지 | 46 |
| before the result enters context | 결과가 컨텍스트에 들어가기 전에 | 46 |
| Extract only the name, company, deal stage, and last contact date | 이름·회사·거래단계·최종접촉일만 추출 | 58 |
| Have each subagent output only its key facts, supporting citations | 핵심 사실과 근거 인용만 출력 | 75 |
| and a relevance score, dropping the exploratory narrative | 관련성 점수 포함, 탐색 서술은 제거 | 75 |
| return only key facts, citations, and relevance scores | 핵심 사실·인용·관련성 점수만 반환 | 88 |
| instead of their full reasoning narratives | 전체 추론 서술 대신 | 88 |
| Place a short key-findings summary at the top | 상단에 짧은 핵심 결과 요약 배치 | 70 |
| then present each detailed section beneath an explicit heading | 상세는 명시적 헤딩 아래에 | 70 |
| Open the aggregated input with a brief summary of each root cause | 각 근본 원인 요약으로 시작 | 91 |
| then present detailed notes under clear headings | 상세 노트는 명확한 헤딩 아래 | 91 |
| Synthesize the phase 1 findings into a concise summary | 1단계 결과를 간결한 요약으로 종합 | 94 |
| and inject that summary into each phase 2 subagent's prompt | 그 요약을 2단계 프롬프트에 주입 | 94 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| open every file in the three services one at a time | 세 서비스의 모든 파일을 하나씩 열기 | 컨텍스트 고갈 |
| Read every file in the repository sequentially | 리포지토리 전체를 순차 읽기 | 5만 파일 |
| keep the entire raw output in the conversation | 원본 출력 전부를 대화에 유지 | 문제 방치 |
| Ask the user to manually paste the list of test file paths | 사용자가 목록을 붙여넣게 함 | 자동화 포기 |
| Spawn a subagent with no specific instructions at all | 지침 없이 서브에이전트 생성 | 방향 상실 |
| 'Look around the codebase for a while and report anything interesting' | 둘러보고 흥미로운 걸 보고 | 모호 |
| the full, unsummarized contents of every single file you open | 열어본 파일의 요약되지 않은 전체 내용 | 위임 목적 위배 |
| Disable all direct tool use in the main agent | 메인 에이전트의 직접 도구 사용 금지 | 레이턴시 폭증 |
| Always spawn a subagent regardless of task size | 작업 크기와 무관하게 항상 위임 | 안티패턴 |
| Spawn several subagents in parallel ... redundantly | 중복 병렬 생성으로 교차 확인 | 오버헤드 |
| Delegate the high-level synthesis ... to a subagent | 고수준 합성을 서브에 위임 | 역할 반대 |
| Have the main agent perform the exhaustive searches itself | 메인이 전수 탐색을 직접 | 오버플로 |
| Truncate each payload to a fixed character length | 고정 글자 수로 잘라냄 | 필수 필드 손실 |
| Cache the full raw JSON payload from each lookup | 원본 페이로드 전체 캐싱 | 컨텍스트 문제 그대로 |
| Run every raw payload through a separate summarization call | 별도 요약 호출로 축소 | 불필요한 비용 |
| Store all 60 fields ... for any future question | 향후 대비 60필드 전부 저장 | 오염 |
| return records in a more compact text format ... all 60 fields | 포맷만 압축, 필드는 전부 | 근본 해결 아님 |
| Look up each contact only once and rely on memory afterward | 기억에만 의존 | 환각 위험 |
| Instruct the synthesis step to read the document twice | 두 번 읽으라고 지시 | 토큰 낭비 |
| Reorder the sections so the finding is always discussed last | 항상 마지막으로 순서 변경 | 미봉책 |
| Split the aggregated document into two shorter documents | 요약·헤딩 없이 둘로 분할 | 구조 개선 없음 |
| Combine all four services' notes into a single unbroken paragraph | 하나의 끊김 없는 단락으로 통합 | 더 악화 |
| Append a note at the very end reminding the model | 끝에 주의 문구 추가 | 구조적 해결 아님 |
| Investigate the services in a different order each time | 매번 조사 순서를 바꿈 | 미봉책 |
| forward only the first four subagents' output | 앞 4개만 전달 | 정보 누락 |
| inform the summary-writing agent that the analysis is complete | 분석이 완료됐다고 알림 | 거짓 |
| skip ahead and read the last two ... then work backward | 뒤에서부터 읽기 | 앞이 잘림 |
| Increase the number of subagents ... equally long narratives | 에이전트 수만 늘리고 서술은 그대로 | 총량 증가 |
| Have the drafting agent read the outputs in two passes | 두 번에 나눠 읽기 | 한계 그대로 |
| Forward the complete raw transcripts of every phase 1 subagent | 1단계 원본 대화록 전부 전달 | 토큰 낭비 |
| Start phase 2 subagents with no reference to phase 1 | 1단계 참조 없이 시작 | 중복 탐색 |
| Wait until a phase 2 subagent asks a clarifying question | 질문할 때까지 대기 | 수동적 |

---

## 6. 출처 추적성 & 메타데이터 계약 (Provenance & Output Contract)

**해당 문제**: 4, 12, 39, 40, 55, 73, 74, 77, 79, 80, 87

### 필수 출력 계약 (Output Contract)
| 원문 | 한국어 | 왜 필요 |
|---|---|---|
| the claim text | 주장 본문 | 기본 |
| the source URL or document name | 출처 URL·문서명 | 재귀속 가능 |
| a relevant excerpt supporting the claim | 근거 발췌문 | 원문 재조회 없이 검증 |
| publication or data-collection date | 발행일·데이터 수집일 | 시점 차이 vs 실제 모순 구분 |
| methodological context | 방법론 맥락 | 비교 가능성 판단 |

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| provenance / traceability | 출처 추적성 | 합성 후에도 근거 추적 가능 |
| false contradiction | 허위 모순 | 시점 차이를 실제 충돌로 오인 |
| claim-source mappings | 주장–출처 매핑 | 압축 시 명시적으로 보존해야 함 |
| citations feature | 인용 기능 | 문장 단위 정확한 원문 구절 근거 |
| search results feature | 검색 결과 기능 | 커스텀 KB에 웹검색급 출처 귀속 |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| The claim text, the source URL or document name it came from | 주장 + 출처 URL·문서명 | 39 |
| and a relevant excerpt supporting the claim | 그리고 근거가 되는 발췌문 | 39 |
| pair every claim with its source URL or document name | 모든 주장을 출처와 짝지음 | 73 |
| and a supporting excerpt | 그리고 뒷받침 발췌문 | 73 |
| Add a required field for the publication or data-collection date | 발행일·수집일을 필수 필드로 추가 | 12 |
| next to every extracted figure | 추출된 모든 수치 옆에 | 12 |
| include the publication or data-collection date alongside each figure | 각 수치와 함께 발행일 포함 | 79 |
| include the source's publication date and methodological context | 출처의 발행일과 방법론 맥락을 포함 | 87 |
| attach metadata such as source location and retrieval date | 출처 위치와 수집 날짜 같은 메타데이터 첨부 | 74 |
| in a structured format (e.g., JSON) alongside every reported fact | 보고되는 모든 사실 옆에 구조화 형식으로 | 74 |
| carry forward each claim's source and date metadata | 각 주장의 출처·날짜 메타데이터를 이월 | 40 |
| from subagent outputs into the report | 서브에이전트 출력에서 보고서로 | 40 |
| Consolidate the duplicates into one entry | 중복을 하나의 항목으로 통합 | 80 |
| while retaining the full set of source citations | 출처 인용 전체를 유지한 채 | 80 |
| The compaction step condensed earlier turns | 압축 단계가 이전 턴을 축약함 | 77 |
| without explicitly preserving claim-source mappings | 주장–출처 매핑을 명시적으로 보존하지 않고 | 77 |
| Citations ground each statement in exact source passages | 각 문장을 정확한 원문 구절에 근거시킴 | 55 |
| producing verifiable per-statement references | 문장 단위로 검증 가능한 참조 생성 | 55 |
| Natural citations with proper source attribution | 적절한 출처 귀속을 갖춘 자연스러운 인용 | 4 |
| similar in quality to web search citations | 웹 검색 인용과 유사한 품질로 | 4 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| a short paraphrase of the surrounding paragraph | 주변 문단의 짧은 의역 | 재귀속 불가 |
| without naming the specific source document | 구체적 출처 문서명 없이 | 추적 불가 |
| the name of the subagent that produced it | 생산한 서브에이전트 이름 | 재조회 필요 |
| a numeric confidence score assigned by the subagent | 서브에이전트 자체 신뢰도 점수 | 검증 근거 아님 |
| append a bibliography of all documents it consulted | 참조 문서 목록만 말미에 첨부 | 1:1 추적 불가 |
| limit its paragraph to three sentences | 문단을 세 문장으로 제한 | 출처 미해결 |
| raise its temperature setting so summaries retain more wording | 온도를 올려 원문 보존 | 정반대 |
| a required field capturing the total word count | 전체 단어 수 필드 | 무관 |
| a required field listing the study's funding source | 자금 출처 필드 | 시점 문제 미해결 |
| asking the subagent to guess how the figure might have changed | 수치 변화를 추측하게 함 | 환각 |
| phrase all extracted figures as approximate ranges | 모든 수치를 근사 범위로 | 정밀도 손실 |
| discard any figure that is more than six months old | 6개월 초과 수치 폐기 | 시계열 불가 |
| convert all statistics into a rolling twelve-month average | 12개월 이동평균으로 변환 | 원본 왜곡 |
| report a single average figure computed across all sources | 모든 출처의 평균 하나 | 왜곡 |
| always prefer whichever figure the subagents reported as the highest | 항상 가장 높은 수치 선택 | 근거 없음 |
| describe in more detail its reasoning process | 검색 추론 과정을 더 상세히 | 초점 이탈 |
| write a longer, more detailed paragraph explaining its reasoning | 더 긴 추론 설명 문단 | 파싱 불가 |
| assign a confidence score ... without citing where it came from | 출처 없이 신뢰도만 | 판단 불가 |
| Rewrite the duplicate claims into a single new sentence | 중복을 새 문장으로 재작성 | 인용 소실 |
| that references none of the original subagents' citations | 원 인용을 전혀 참조하지 않는 | 추적성 상실 |
| Keep only the version reported by the subagent that finished first | 먼저 끝난 것만 유지 | 인용 폐기 |
| drop its source citations, since the claim is now well established | 충분히 입증됐으니 인용 삭제 | 치명적 |
| write in a more formal register so the report appears authoritative | 격식 있는 문체로 | 추적성 무관 |
| shorten the report further so reviewers can read quickly | 보고서를 더 줄임 | 생략 심화 |
| add a general disclaimer stating sources are available upon request | 요청 시 출처 제공 면책 조항 | 본문 추적 불가 |
| The model's context window silently shrank between turns | 컨텍스트 창이 조용히 축소됨 | 없는 동작 |
| Compaction only operates on tool results | 압축은 도구 결과만 대상 | 거짓 |
| Citations are stored in a separate ephemeral cache | 인용은 별도 임시 캐시에 저장 | 없는 메커니즘 |
| Citations eliminate the need to track publication dates | 인용이 발행일 추적을 대체 | 거짓 |
| Citations remove the need for subagents to read source documents | 인용이 문서 읽기를 대체 | 거짓 |
| guarantee that conflicting statistics will be automatically reconciled | 충돌 통계를 자동 조정 | 없는 기능 |
| Automatic reconciliation of any conflicting policy statements | 상충 정책의 자동 조정 | 없는 기능 |
| A guarantee that every retrieved passage is the most recent version | 최신 버전임을 보장 | 없는 기능 |

---

## 7. 충돌·불확실성 합성 & 렌더링 (Conflict Synthesis & Rendering)

**해당 문제**: 17, 33, 43, 44, 62, 83, 95

### 대조표
| 상황 | 원문 신호 | 처리 |
|---|---|---|
| 신뢰 가능한 두 수치 충돌 | Both sources are credible | 나란히 병기 + 출처 귀속 + **충돌 명시** |
| 시점이 다른 두 수치 | a filing from a different fiscal quarter | 각각 **날짜 붙은 별개 데이터 포인트** |
| 교차검증 vs 단일 출처 | no other source corroborates | **섹션 분리** + 서술 차등화 |
| 증거 무게 차이 | every appellate court vs one lower-court opinion | **증거 무게별 섹션** + 다른 서술 |
| 스프레드시트 불일치 | two spreadsheets report different totals | **둘 다 주석 달아 상위에 인계** |
| 정량 vs 정성 데이터 | API surface vs community sentiment | 표/리스트 vs **산문**, 각각 자연스러운 형식 |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| Present both figures side by side, attributed to their sources | 두 수치를 출처와 함께 나란히 제시 | 43 |
| and note that the values conflict | 그리고 값이 충돌한다고 명시 | 43 |
| Present the stable ratio as well established | 안정적 비율은 확립된 것으로 제시 | 33 |
| and the higher one as a distinct, dated data point | 높은 쪽은 날짜가 붙은 별개 데이터로 | 33 |
| not an outlier to discard | 폐기할 이상치가 아니라 | 33 |
| Use separate sections that distinguish well-corroborated findings | 교차검증된 결과를 구분하는 별도 섹션 | 62 |
| from contested ones, preserving each source's characterization | 이견 있는 것과 분리, 각 출처의 특성 보존 | 62 |
| Separate the claims into sections labeled by evidentiary weight | 증거 무게별로 라벨링된 섹션으로 분리 | 44 |
| describing the precedent and single-opinion claim differently | 판례와 단일 의견 주장을 다르게 서술 | 44 |
| Include both values with clear annotation of which spreadsheet | 어느 스프레드시트인지 명확히 주석해 둘 다 포함 | 95 |
| leaving reconciliation to the coordinator | 조정은 코디네이터에게 맡김 | 95 |
| Render the API findings as a structured list of methods | API 결과를 메서드 구조화 리스트로 | 17 |
| keeping the sentiment summary as prose | 여론 요약은 산문으로 유지 | 17 |
| Render the financial figures as a table and keep the news as prose | 재무 수치는 표, 뉴스는 산문 | 83 |
| matching each content type to its natural format | 각 콘텐츠를 자연스러운 형식에 맞춤 | 83 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| Average the two figures into a single blended estimate | 두 수치를 평균낸 단일 추정치 | 없는 숫자 생성 |
| Report only the average of all five ratios | 5개 비율의 평균만 보고 | 무의미 |
| analyst estimates are generally more rigorous than press releases | 분석가 보고서가 항상 더 엄밀 | 절대 단정 |
| since it comes directly from the company rather than a third party | 회사 직접 발표라서 | 절대 단정 |
| presumed to reflect the most recently filed quarter | 최근 분기일 것으로 추정 | 근거 없는 가정 |
| Discard the higher ratio as noise since it disagrees with the majority | 다수결로 노이즈 처리 | 유의미 정보 폐기 |
| Merge all findings into one narrative section | 하나의 서술 섹션으로 통합 | 확실성 차이 은폐 |
| without calling attention to which claims are more certain | 어느 주장이 더 확실한지 밝히지 않고 | 오도 |
| the same confidence language as the mechanism-of-action findings | 검증된 결과와 동일한 확신 어조 | 왜곡 |
| Exclude the single-source side-effect finding | 단일 출처 부작용 결과 제외 | 데이터 누락 |
| Move the single-opinion claim to an appendix | 단일 의견을 부록으로 이동 | 맥락 은폐 |
| without any accompanying language indicating its limited support | 제한적 근거임을 밝히지 않고 | 오도 |
| add a footnote number to each, without changing how confidently | 각주만 붙이고 확신 수준은 그대로 | 오해 유발 |
| Rephrase both claims using identical hedging language | 양쪽에 동일한 완곡 표현 | 확립된 근거 격하 |
| Omit the operating expense figure entirely | 영업비용 수치를 전부 생략 | 정보 유실 |
| Recompute the operating expense total itself from first principles | 원리부터 직접 재계산 | 권한 초과 |
| Report only the value from the more recent file modification timestamp | 수정 시각이 최근인 쪽만 보고 | 근거 없는 가정 |
| Render both as a shared table with columns for finding type | 둘 다 공통 표로 렌더링 | 정성 데이터 손상 |
| Convert the community sentiment summary into a structured list | 여론 요약을 메서드 리스트로 변환 | 본질 어긋남 |
| Merge the API findings and sentiment into one continuous paragraph | 하나의 긴 단락으로 통합 | 가독성 악화 |
| Combine the figures and news into a single interleaved list | 숫자와 서술을 교대로 섞은 목록 | 혼란 가중 |
| Convert the financial figures into prose paragraphs | 재무 수치를 산문 문단으로 | 비교 어려움 |

---

## 8. 정확도 평가 & 신뢰도 캘리브레이션 (Accuracy Evaluation & Calibration)

**해당 문제**: 8, 11, 24, 29, 35, 38, 42, 47, 48, 51, 53, 61, 66, 76, 86, 100

### 대조표 (최중요)
| 문제 신호 | 정답 방향 |
|---|---|
| 94% / 96% / 97% / 99.2% in aggregate | **문서 유형·필드별로 쪼개서(slice) 확인** |
| 81% on handwritten prescription forms (고위험 세그먼트) | 원인 규명·개선 전까지 **검토 수준 유지** |
| 70% when units are ambiguous (조건부 저하) | 그 **조건에만** 사람 검토 라우팅 |
| scored 0.9 or higher are still wrong | 임계값이 **ground truth로 검증된 적 없음** |
| 0.95 → 78% / 0.6 → 90% (역전) | **미보정** — 원시 점수 임계 사용 금지 |
| a new document scanner ... lower-resolution | **입력 분포 이동** → 표본으로 재검증 |
| initial validation already proved it works | 초기 검증은 **그 시점 분포만** 측정 |
| one type makes up 70% of daily volume | 볼륨 비례 + **유형별 최소 표본 수** 보장 |
| only 8% capacity for review | 저신뢰도·모순 문서 우선 + **나머지로 무작위 표본** |
| two clauses ... state contradictory terms | 모순 감지 시 **신뢰도 높아도** 사람 검토 |

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| aggregate accuracy | 합산 정확도 | 세그먼트 문제를 숨김 (평균의 함정) |
| break down by document type and field | 문서 유형·필드별 분해 | 슬라이스 분석 |
| labeled ground truth / validation set | 라벨링된 정답 데이터 | 캘리브레이션의 전제 |
| calibrate review thresholds | 검토 임계값 보정 | 점수 ↔ 실제 정답률 일치 확인 |
| stratified random sample | 층화 무작위 표본 | 유형·필드 걸쳐 정기 추출 |
| minimum sample size per document type | 유형별 최소 표본 수 | 소량 세그먼트 과소표집 방지 |
| shift in the input population | 입력 모집단 이동 | 하드웨어·환경 변화 시 |
| self-report / self-estimate | 자기 보고 | 과신 편향 — 신뢰 불가 |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| Break down accuracy by document type and field | 문서 유형·필드별로 정확도 분해 | 47 |
| to check whether any segment performs far worse than the aggregate | 합산보다 훨씬 나쁜 세그먼트가 있는지 확인 | 47 |
| Compute accuracy separately for the health-claims examples | 건강 청구 사례만 따로 정확도 계산 | 11 |
| only reduce review if that segment independently meets the bar | 그 세그먼트가 독립적으로 기준을 충족할 때만 | 11 |
| Break down the filing-status field's accuracy further by document type | 필드 정확도를 문서 유형별로 더 분해 | 86 |
| and by any known edge-case conditions | 그리고 알려진 엣지 케이스 조건별로 | 86 |
| the accuracy breakdown by document type and field | 문서 유형·필드별 정확도 분해 | 24 |
| along with the labeled validation methodology used | 사용된 라벨링 검증 방법론과 함께 | 24 |
| Keep human review at the current level for all fields | 모든 필드의 검토 수준을 현행 유지 | 53 |
| until the medication-dosage field's accuracy is separately investigated | 약물 용량 필드가 별도로 규명될 때까지 | 53 |
| Route the weight field to human review whenever units are unclear | 단위가 불명확할 때 무게 필드를 검토로 | 29 |
| while allowing high-confidence, unambiguous cases to bypass review | 고신뢰·명확한 건은 검토 우회 허용 | 29 |
| Calibrate review thresholds against a labeled validation set | 라벨링된 검증 세트로 임계값 보정 | 35 |
| checking whether fields the model scores highly are actually correct | 고득점 필드가 실제로 맞는지 확인 | 35 |
| The 0.85 threshold was never validated against labeled ground truth | 0.85 임계값이 정답 데이터로 검증된 적 없음 | 51 |
| confidence scores are miscalibrated and inversely related to correctness | 신뢰도가 미보정이고 정확도와 역관계 | 100 |
| should not use the raw scores directly to set a threshold | 원시 점수로 임계값을 바로 설정하면 안 됨 | 100 |
| a per-field confidence score alongside each extracted value | 추출값마다 필드별 신뢰도 점수 | 61 |
| using a consistent numeric scale across all fields and documents | 모든 필드·문서에 걸쳐 일관된 수치 척도로 | 61 |
| Treat the new scanner output as a potential shift in the input population | 새 스캐너 출력을 입력 모집단 이동으로 간주 | 8 |
| re-validate accuracy and confidence calibration on a sample | 표본으로 정확도·신뢰도 보정 재검증 | 8 |
| Initial validation only measures performance on the population at that time | 초기 검증은 그 시점 모집단만 측정 | 42 |
| ongoing stratified sampling is needed to detect later shifts | 이후 변화 감지를 위해 지속 층화 표집 필요 | 42 |
| Draw a stratified random sample of high-confidence extractions | 고신뢰 추출의 층화 무작위 표본 추출 | 48 |
| on a recurring basis, and compare against the validated baseline | 정기적으로, 검증된 기준선과 비교 | 48 |
| would under-sample the four low-volume document types | 소량 문서 유형 4개가 과소표집됨 | 66 |
| ensure a minimum sample size per document type | 문서 유형별 최소 표본 수를 보장 | 66 |
| Route low-confidence extractions and documents with contradictory values first | 저신뢰·모순값 문서를 우선 검토 | 38 |
| using remaining capacity for a smaller random sample | 남은 여력은 소규모 무작위 표본에 | 38 |
| detect when source values conflict across the document | 문서 전반의 값 충돌을 감지 | 76 |
| even if its confidence in the single value it chose is high | 선택한 값의 신뢰도가 높더라도 | 76 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| Assume that the accuracy mirrors the combined aggregate | 세그먼트가 합산과 같다고 가정 | 평균의 함정 |
| because the pipeline uses the same prompt and model | 같은 프롬프트·모델을 쓰므로 | 근거 안 됨 |
| the field's blended 94% aggregate already meets the bar | 합산 94%면 충분함 | 방치 |
| Increase the aggregate sample size ... until the interval narrows | 표본만 늘려 구간을 좁힘 | 세그먼트 미검증 |
| sampling more document types, so the figure is more significant | 유형을 더 뽑아 합산 유의성 확보 | 분리 안 됨 |
| Re-run the same evaluation set a second time | 같은 세트를 한 번 더 실행 | 사각지대 그대로 |
| Ask the model to self-report its own estimated accuracy | 모델에게 자체 정확도 추정 요청 | 과신 편향 |
| retrospectively estimate its accuracy from its confidence scores | 신뢰도 점수로 소급 추정 | 정답 데이터 무시 |
| Instruct the model to always output scores above 0.9 | 항상 0.9 이상 출력하도록 지시 | 지표 무력화 |
| Average each field's score with neighboring fields | 인접 필드 점수와 평균 | 개별 오류 은폐 |
| Replace numeric scores with a categorical high/medium/low label | 범주형 라벨로 대체 | 과신 본질 불변 |
| categorical labels are inherently easier to estimate accurately | 범주형이 본질적으로 더 정확 | 거짓 |
| a single overall document-level confidence score | 문서 전체 단일 점수 | 필드 우선순위 불가 |
| a confidence score only for fields it judges difficult | 어렵다고 판단한 필드만 점수 | 데이터 불완전 |
| a textual explanation of its reasoning instead of a numeric score | 수치 대신 서술 설명 | 정량 보정 불가 |
| raise the routing threshold to 0.96 | 임계값을 0.96으로 상향 | 근본 원인 미해결 |
| expected behavior for well-calibrated models | 잘 보정된 모델의 정상 동작 | 거짓 |
| The validation set is too small to draw any conclusion | 검증 세트가 너무 작음 | 과도한 폐기 |
| discard field-level confidence scoring entirely | 필드 신뢰도 체계를 전면 폐기 | 과도 |
| Reviewers lack training on how to interpret 0.9 versus 0.95 | 검토자 교육 부족 | 원인 아님 |
| The document set has grown too large for a fixed threshold | 문서가 많아져 임계값이 무의미해짐 | 원인 아님 |
| Automatically lower the confidence threshold by a fixed amount | 고정 폭으로 임계값 자동 하향 | 자의적 |
| lower image quality always reduces confidence by a predictable margin | 화질 저하가 예측 가능한 폭으로 감소 | 절대 단정 |
| Continue using the existing calibrated threshold unchanged | 기존 임계값 그대로 사용 | 위험 |
| confidence thresholds are independent of image quality | 임계값은 화질과 무관 | 거짓 |
| route all extractions from the new scanner to human review permanently | 새 스캐너 전부를 영구 수동 검토 | 과도 |
| the model's performance inevitably degrades ... like mechanical components | 부품처럼 마모되어 성능 저하 | 잘못된 비유 |
| would violate a regulation requiring continuous sampling | 지속 표집을 강제하는 규정 위반 | 가상의 규정 |
| the essential evidence that auditors and regulators require | 감사관이 요구하는 필수 증거 | 본질 아님 |
| Review a fixed random 8% of all extractions each day | 매일 무작위 고정 8% 검토 | 고위험 누락 |
| Review only the extractions with the highest confidence scores | 최고 신뢰도만 검토 | 정반대 |
| Review whichever extractions were processed first each day | 처리 순서대로 검토 | 비논리 |
| Sample extractions in proportion to how quickly each type is processed | 처리 속도에 비례해 표집 | 통계적 무관 |
| Review every extraction produced during the first hour of each day | 매일 첫 한 시간만 전수 검토 | 시간대 편향 |
| extractions that reviewers happen to flag during ad hoc spot checks | 비정기 스팟 점검에서 걸린 것 | 대표성 없음 |
| over-sample the high-volume type ... exclude it entirely | 대량 유형을 표집에서 제외 | 영향 최대인데 제외 |
| sampling proportional to volume always produces the optimal allocation | 볼륨 비례가 항상 최적 | 절대 단정 |
| only a concern if processed by a different prompt template | 프롬프트가 다를 때만 문제 | 무관 |
| Remove human review only from the medication-dosage field | 가장 취약한 필드의 검토를 제거 | 정반대 |
| since that field's accuracy is still above chance level | 우연 수준보다는 높으므로 | 위험 |
| Reduce human review across the entire pipeline uniformly | 전 파이프라인 일률 축소 | 평균의 함정 |
| Increase the model's temperature setting when extracting | 추출 시 온도 상승 | 정확도 저하 |
| Remove the weight field from automated extraction entirely | 무게 필드를 자동화에서 전면 제외 | 과도 |
| Average the two conflicting values to produce a single number | 충돌하는 두 값의 평균 | 의도 왜곡 |
| Extract only the value from whichever page appears first | 앞 페이지 값만 추출 | 근거 없는 관례 |
| Trust the model's single value whenever its confidence is above threshold | 임계값만 넘으면 신뢰 | 모순 방치 |
| the score already accounts for any conflicting source text | 점수가 모순을 이미 반영함 | 거짓 |
| a written guarantee that the 99% figure will not decline | 수치 미하락 서면 보증 | 기술 검증 아님 |
| Confirm the tool uses the newest available model version | 최신 모델 버전 사용 확인 | 예측 변수 아님 |
| measured on a sample of at least ten thousand documents | 최소 1만 건 표본이면 됨 | 크기가 유일 기준 아님 |
| Survey reviewers about their confidence in reviewing the field | 검토자 설문 | 주관적 |
| the lowest average character length of any field | 필드 중 평균 글자 수가 최소 | 무관 |
| Compare against the average accuracy of all other fields | 다른 필드 평균과 비교 | 하위 세그먼트 미검출 |

---

## 9. 고객 응대 & 에스컬레이션 판단 (Support Agent Escalation)

**해당 문제**: 2, 15, 22, 25, 26, 37, 50, 52, 54, 60, 68, 69, 71, 89, 90, 96, 99

### 대조표 (최중요)
| 지문 신호 | 이관? | 근거 |
|---|---|---|
| I want a real person, not a bot (일반 서비스) | **즉시 이관** | 명시적 요구 존중 |
| I said I want to talk to an actual person (재차 요구) | **즉시 이관** | 반복 요구 |
| Anthropic 과금 문의 + "봇 말고 사람" | **먼저 설명·해결 시도** | AI-first — 반복 요구·미해결 시에만 이관 |
| the customer has not asked to speak with a human + 정책 내 해결 가능 | **이관 X** | 공감 + 직접 처리 |
| documented policy does not address / is silent on | **이관 O** | 정책 공백 |
| never addresses in either direction (허용도 금지도 없음) | **이관 O** | 정책 공백 |
| three remediation steps ... each fails, no options left | **이관 O** | 옵션 소진 |
| very negative sentiment / sharp language 뿐 | **이관 X** | 감정 ≠ 복잡도 |
| self-reported confidence 45% + 근거는 명확 | **이관 X** | 자체 점수 ≠ 복잡도 |
| multi-step but every step is explicitly detailed in policy | **이관 X** | 단계 수 ≠ 트리거 |
| multiple similar accounts / three records with same name | **이관 X, 추가 식별자 요청** | 모호성 해소 |

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| explicit escalation request | 명시적 이관 요청 | 조사·설득 없이 즉시 이행 |
| policy is silent on | 정책이 침묵함 | 임의 해석 금지 → 이관 |
| sentiment alone is not a reliable indicator of complexity | 감정만으론 복잡도 판단 불가 | 감정≠난이도 |
| self-reported score isn't a reliable complexity proxy | 자체 점수는 복잡도 대리 지표 아님 | 미보정 |
| step count alone is not an escalation trigger | 단계 수만으론 이관 트리거 아님 | 정책 커버 시 직접 처리 |
| additional identifier | 추가 식별자 | 모호한 레코드 특정 |
| explicit escalation criteria plus few-shot examples | 명시적 기준 + few-shot 예시 | 이관 판단 프롬프트 설계 |

> **69번 — Anthropic 과금 문의 + "봇 말고 사람 연결해줘"**
> Anthropic 지원은 **AI-first** 모델이다. 고객이 사람을 요구해도 먼저 과금을 상세히 설명하고 해결을 시도한 뒤,
> **고객이 요구를 반복하거나 문제가 미해결로 남을 때에 한해** 사람 상담원에게 이관한다.
> 일반 서비스 지문(90번 등)의 "즉시 이관"과 **반대 방향**이니, Anthropic 지문인지 먼저 확인할 것.

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| Offer to explain the overage charge in detail, attempt to resolve it | 과금을 상세히 설명하고 해결을 시도 | 69 |
| escalate to a human only if the customer repeats the request | 고객이 요구를 반복할 때만 사람에게 이관 | 69 |
| or the issue remains unresolved | 또는 문제가 미해결로 남을 때 | 69 |
| Escalate to a human agent right away, honoring the request | 요청을 존중해 즉시 이관 | 90 |
| without first attempting to resolve it | 먼저 해결을 시도하지 않고 | 90 |
| Escalate the conversation to a human agent now | 지금 사람에게 이관 | 26 |
| since the customer has reiterated their preference | 고객이 선호를 재차 밝혔으므로 | 26 |
| Escalate the question, since the policy documentation does not address | 정책 문서가 다루지 않으므로 이관 | 22 |
| Escalate the request, since documented policy neither permits nor prohibits | 허용도 금지도 없으므로 이관 | 50 |
| Escalate the request, since the documented policy is silent | 문서화된 정책이 침묵하므로 이관 | 96 |
| Escalate the case to a human agent | 사람 상담원에게 이관 | 60 |
| since the agent is unable to make further meaningful progress | 더 이상 진전을 낼 수 없으므로 | 60 |
| Acknowledge the customer's frustration and process the exchange now | 좌절감에 공감하고 지금 교환 처리 | 71 |
| since the request is within policy and resolvable | 요청이 정책 내이고 해결 가능하므로 | 71 |
| Acknowledge the patient's frustration, signal it can be handled right away | 공감 + 즉시 처리 가능함을 알림 | 89 |
| and also offer to escalate to a staff member if preferred | 원하면 직원 연결도 제안 | 89 |
| sentiment alone is not a reliable indicator of complexity | 감정만으론 복잡도의 신뢰 지표가 아님 | 25·54 |
| and the password reset is within the agent's capability | 비밀번호 재설정은 처리 범위 내 | 25·54 |
| a self-reported score isn't a reliable complexity proxy | 자체 보고 점수는 신뢰할 복잡도 대리 지표 아님 | 52 |
| when the evidence clearly supports the answer | 근거가 답을 명확히 뒷받침할 때 | 52 |
| step count alone is not an escalation trigger | 단계 수만으론 이관 트리거가 아님 | 99 |
| when policy fully covers it | 정책이 완전히 커버할 때 | 99 |
| Ask the customer for their booking confirmation number | 고객에게 예약 확인 번호 요청 | 2 |
| or another identifier to pinpoint the correct record | 또는 정확한 레코드를 특정할 식별자 | 2 |
| Ask the customer for an additional identifier | 추가 식별자를 요청 | 68 |
| such as the last four digits of the payment card | 결제 카드 뒷 4자리 같은 | 68 |
| submit a government-issued photo ID and a live selfie | 사진 신분증과 실시간 셀카 제출 | 15 |
| through Anthropic's third-party verification platform, Persona | Persona를 통해 | 15 |
| Add explicit escalation criteria plus few-shot examples | 명시적 이관 기준 + few-shot 예시 추가 | 37 |
| showing both escalation and resolution cases | 이관·해결 사례 양쪽을 보여주는 | 37 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| Ask the customer to first explain why they don't want a bot | 봇을 싫어하는 이유부터 설명하게 함 | 마찰 유발 |
| Ask the customer to clarify why the automated resolution is not acceptable | 자동 해결이 왜 안 되는지 묻기 | 마찰 유발 |
| Ask the customer to confirm they are not requesting a human | 사람을 원하지 않는지 재확인 | 불필요 절차 |
| Ask the patient to confirm they don't want to speak with staff | 직원 연결을 원치 않는지 확인 | 불필요 절차 |
| Ask the customer to explain why a human agent is preferred | 왜 사람을 원하는지 설명 요구 | 마찰 유발 |
| Review the account's usage history ... before responding | 응답 전에 계정 이력부터 검토 | 이관 요청에 무응답 |
| Escalate to a human agent immediately, without first investigating | 조사 없이 즉시 이관 | 69: AI-first 위배 |
| Walk the customer through the password reset steps first | 재설정 절차부터 안내 | 요청 무시 |
| Offer to reset the password immediately and escalate only if repeated | 먼저 처리 제안, 반복 시에만 이관 | 명시적 요구 위반 |
| Proceed to change the seat assignment ... without further discussion | 논의 없이 좌석 변경 강행 | 지시 위반 |
| Repeat the offer to fix the seat assignment | 동일 제안을 반복 | 좌절 가중 |
| Escalate to a human agent right away, since the customer's tone | 어조만 보고 즉시 이관 | 요구 없음 |
| Escalate to a staff member immediately, since the irritated tone | 짜증난 어조라 즉시 이관 | 자원 낭비 |
| Process the exchange without commenting on the frustration | 좌절감 언급 없이 처리 | 공감 결여 |
| Reschedule the appointment without acknowledging the tone | 어조를 인정하지 않고 처리 | 공감 결여 |
| negative sentiment scores reliably indicate a case is too complex | 부정 감정이 복잡도를 신뢰성 있게 표시 | 거짓 |
| the negative sentiment flag should always trigger escalation | 감정 플래그면 항상 이관 | 절대 단정 |
| low self-reported confidence always indicates factual ambiguity | 낮은 자체 신뢰도 = 항상 모호 | 절대 단정 |
| any confidence score below 50% should automatically trigger escalation | 50% 미만이면 자동 이관 | 근거 무시 |
| but only because password resets are always exempt | 비밀번호 재설정은 항상 면제라서 | 잘못된 근거 |
| but only because billing proration questions are categorically excluded | 비례 계산은 범주적으로 제외라서 | 없는 규칙 |
| but only because billing corrections are categorically exempt | 청구 정정은 범주적 면제라서 | 없는 규칙 |
| any case requiring more than one corrective action should be escalated | 두 단계 이상이면 무조건 이관 | 자동화 저해 |
| multi-step cases are inherently too complex for an agent | 다단계는 본질적으로 너무 복잡 | 거짓 |
| Deny rental reimbursement, since it is not listed among covered types | 목록에 없으니 거절 | 자의적 판단 |
| Approve rental reimbursement, since recall repairs are similar enough | 유사하니 승인 | 유추 환각 |
| Direct the customer to the manufacturer | 제조사로 안내 | 책임 회피 |
| Deny the fare adjustment, since undocumented should default to disallowed | 미문서화는 기본 거절 | 자의적 규칙 |
| Apply the fare adjustment, since neither code's terms forbid combining | 금지 조항이 없으니 승인 | 위험한 논리 |
| Ask the customer to select only one promotional code | 코드 하나만 고르게 함 | 없는 조치 강요 |
| Decline the request, since the provision implies not permitted | 조항이 금지를 함의한다고 해석 | 자의적 해석 |
| Approve the competitor price match by analogy | 유추로 경쟁사 가격 매칭 승인 | 환각 |
| Ask the customer to submit the competitor's listing as proof | 증거 제출받고 독자 승인 | 권한 초과 |
| Close the case as unresolvable, without any handoff | 인계 없이 해결 불가로 종결 | 서비스 중단 |
| Continue retrying the same remediation steps | 동일 조치를 계속 재시도 | 무한 루프 |
| Inform the customer the issue is resolved | 해결됐다고 통보 | 거짓 보고 |
| Select the record with the most recently booked flight date | 최근 예약 건을 선택 | 추측 |
| Select the record with the most complete profile information | 프로필이 가장 완전한 건 선택 | 추측 |
| Merge the relevant details from all three records | 세 레코드 정보를 병합 | 데이터 오염 |
| Select the more active profile, since higher usage suggests | 사용량 많은 프로필 선택 | 추측 |
| Select the profile with the earlier account creation date | 먼저 생성된 계정 선택 | 휴리스틱 |
| Merge billing details from both profiles | 두 프로필 청구 정보 병합 | 개인정보 위험 |
| Ask the user to provide their account number or the PIN | 계정 번호·PIN 요청 | 이미 불가하다고 명시됨 |
| Ask general questions about their service plan and infer | 요금제 질문으로 계정 추론 | 보안 위반 |
| Proceed with the account that has the most recent billing activity | 최근 결제 계정으로 진행 | 임의 가정 |
| Rely on the agent's general training to infer escalation behavior | 일반 학습에 의존해 이관 판단 | 불일치 |
| escalate whenever the message contains any negative language | 부정 표현만 있으면 이관 | 과잉 이관 |
| escalate whenever its self-reported confidence falls below a threshold | 자체 신뢰도 임계 미만이면 이관 | 과신 편향 |

---

## 10. 반복 출제 문항 (동일/거의 동일)

| 내용 | 문항 | 정답 요지 |
|---|---|---|
| 은행 비밀번호 재설정 + 부정 감정 플래그 | **25, 54** | 감정≠복잡도, 이관 안 함 |
| billing service 커스텀 Result 타입 망각 | **6, 28** | 컨텍스트 유실 → scratchpad |
| 압축 전 사실 선기록 | **5, 92** | scratchpad 먼저 → 그다음 compact |
| 에이전트 상태 export + manifest 재개 | **14, 21, 30** | 완료분 재사용, 미완료만 실행 |
| 접근 실패 vs 유효 빈 결과 구분 | **1, 9, 36, 64** | 인프라 실패=재시도 / 0건=정상 |
| 맨 문자열 에러 보고의 한계 | **57, 85** | 실패 유형·부분 결과·대안 누락 |
| 서브에이전트 출력에 출처·발췌 필수 | **39, 73** | 주장 ↔ 출처 URL + 발췌문 |
| 수치 옆에 발행일·수집일 필수 | **12, 74, 79, 87** | 시점 메타데이터로 허위 모순 방지 |
| 하위 출력이 컨텍스트 예산 초과 | **75, 88** | 핵심 사실·인용·관련성 점수만 |
| 중간 섹션 누락 (Lost in the Middle) | **70, 91** | 상단 요약 front-load + 헤딩 |
| 도구 출력 필드 과다 | **46, 58** | 필요한 필드만 남겨 투입 |
| 반복 요약으로 수치 유실 | **31, 41, 101** | persistent facts block |
| 동일 세션 내 복수 이슈 혼동 | **18, 63** | 이슈별 독립 구조화 레코드 |
| API stateless — 히스토리 미전송 | **10, 72** | messages에 이전 턴 포함 필수 |
| 합산 정확도의 함정 | **11, 24, 47, 53, 86** | 문서 유형·필드별 슬라이스 |
| 신뢰도 임계값 미검증 | **35, 51, 100** | ground truth로 캘리브레이션 |
| 정책 공백 → 이관 | **22, 50, 96** | 임의 해석 금지 |
| 부분 실패 후 합성 | **32, 56, 82** | 완료분 사용 + 공백 주석 |
| 정량 vs 정성 데이터 렌더링 | **17, 83** | 표/리스트 vs 산문 |

---

## 11. 시험 직전 30초 복습

1. **타임아웃·429·503·커넥션풀·캐시만료 = access failure(재시도). 200+0건·용어집 0건·거래 없음 = valid empty result(재시도 X).** 인증/자격 실패는 접근 실패지만 재시도 무의미 → 에스컬레이션.
2. **로컬에서 풀렸으면 안 올린다. 한도 소진·자격 문제면 [실패 유형 + 시도 내역 + 부분 결과 + 대안] 4종을 붙여 올린다.** 맨 문자열('Query failed.')은 항상 오답 지문.
3. **부분 결과는 절대 버리지 않는다.** 완료분으로 합성하고 공백을 **주석으로 명시**한다. 전량 재실행·전체 중단·조작 채우기는 전부 함정.
4. **압축 전에 scratchpad에 먼저 쓴다.** 장기 세션 모순 = 컨텍스트 유실 → scratchpad. 큰 모델·출력 토큰 증가는 recall을 복구하지 못한다.
5. **크래시 재개 = manifest 로드 + 완료분 skip.** 병렬 서브에이전트는 **에이전트별 고유 파일**, 종료 후 취합.
6. **반복 요약은 수치를 지운다 → persistent facts block(요약 밖). 동시 이슈는 이슈별 독립 레코드.** API는 stateless — 세션 ID만으론 이전 턴이 안 온다.
7. **장황한 탐색은 위임하고 요약만 받는다. 작은 조회는 직접 한다.** 탐색=서브, **합성=메인**. 하위 출력은 핵심 사실·인용·관련성 점수까지만.
8. **중간 정보 누락 = 상단에 핵심 요약 front-load + 명시적 헤딩.** "두 번 읽어라", "끝에 주의 문구"는 함정.
9. **모든 주장에 [출처 URL/문서명 + 발췌문 + 발행일]을 붙인다.** 평균 내기·범위 변환·오래된 것 폐기·인용 삭제는 전부 오답. 충돌은 **나란히 병기 + 출처 귀속 + 충돌 명시**.
10. **합산 정확도는 항상 쪼개서 본다(문서 유형·필드·엣지 케이스). 신뢰도 점수는 ground truth로 보정하기 전엔 임계값으로 쓰지 않는다.** 자기 보고 정확도·온도 조정·표본 크기만 늘리기는 함정.
11. **일반 서비스에서 "사람 연결해줘" = 즉시 이관. 단 Anthropic 과금 문의는 AI-first — 설명·해결 먼저, 반복 요구·미해결 시 이관. 요구 없이 감정만 나쁘면 = 공감 + 직접 처리. 정책이 침묵하면 = 이관. 옵션 소진이면 = 이관. 단계 수·감정·자체 신뢰도 점수는 이관 트리거가 아니다.** 레코드가 모호하면 추측 말고 **추가 식별자를 요청**한다.
