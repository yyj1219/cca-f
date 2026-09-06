# Prompt Engineering & Structured Output — 학습용 핵심 요약 노트

모의시험 104문항(01–104) 기반.

**사용법**: "문제 신호"로 지문 키워드를 잡고 → "정답 키워드"를 고르고 → "함정 키워드"는 버린다.
모든 키워드는 **보기 원문에서 그대로 뽑은 8단어 이내 조각**이다. 이것만 눈에 들어와도 정답/오답이 갈린다.

---

## 0. 5초 판별 치트시트 (Decision Cheatsheet)

| 지문에 이게 보이면 | 정답은 이 방향 |
|---|---|
| two-day turnaround / next morning (여유 있는 마감) | Message Batches API (50% 할인) |
| the merge gate blocks on an immediate response (즉시 응답 필요) | 동기식 Messages API |
| no guaranteed latency SLA (지연 보장 없음) | 배치는 실시간 용도에 부적합 |
| not guaranteed to return in submission order (순서 미보장) | `custom_id`로 매칭 |
| some requests errored / expired (일부 실패) | 실패분만 `custom_id`로 재제출 |
| 100,000 requests or 256 MB (배치 한도) | 둘 중 먼저 도달하는 쪽 |
| letters, digits, hyphens, and underscores (custom_id 규칙) | 영숫자·`-`·`_`만, 64자 이내 |
| application-supplied tool result (클라이언트 도구 왕복) | 배치에서 불가 / 서버 도구는 가능 |
| inconsistent labeling (분류 일관성 부족) | 다양한 퓨샷 예시 3~5개 |
| all five examples happen to be (예시 편중) | 예시 다양화 — 편향 원인 |
| twenty examples ... memorize (예시 과다) | 소수로 축소, 규칙이 드러나게 |
| a case confirming null is correct (값 없음) | null 반환 예시를 넣는다 |
| borderline case (경계 사례) | 근거와 함께 경계 예시 포함 |
| genuinely problematic and an acceptable instance | 대조 쌍(paired) 예시 |
| highly confident / feels significant (모호한 신뢰도 표현) | 명시적·검증 가능한 범주 기준으로 교체 |
| confidence score exceeds a fixed threshold | 함정 — 기준 자체를 명시해야 함 |
| contradicted by the code's actual control flow | 검증 가능한 모순 = 보고 대상 |
| the model may hallucinate a value (필수 필드 강제) | optional + nullable 필드 |
| does not fit any of the five categories (enum 밖) | `"other"`/`"unclear"` enum + 자유 텍스트 |
| structurally valid but semantically wrong (구조는 맞음) | 스키마 밖 — 후속 검증 로직 |
| line items do not sum to the total (산술 불일치) | calculated_total 교차 검증 |
| ISO 8601 but documents vary (형식 다양) | 스키마 완화 + 후속 파서 정규화 |
| valid JSON and nothing else (프롬프트로 JSON 요구) | 함정 — tool_use `input_schema` 사용 |
| placed under the wrong object (배치 오류) | 피드백 재시도로 해결 가능 |
| never supplied / no phone number appears (원본에 없음) | 재시도 불가 → 사람에게 이관 |
| conflicting values in the source (원본 충돌) | 플래그 + 사람 조정, 추측 금지 |
| the prior failed JSON and the original document | 재시도엔 **원본 + 실패본 + 오류 설명** 전부 |
| a shared interface used differently across files | 통합(integration) 패스 |
| syntax errors within an individual file | 파일별(per-file) 패스 |
| same session that generated the code (자기 검토) | 독립 인스턴스 — 확증 편향 |
| the generator's own summary (요약본 전달) | 원본 diff를 그대로 줘야 함 |
| 200 files / many subagents (대규모) | 워크플로 오케스트레이션 |
| only sends the prompt string (서브에이전트) | 필요한 맥락은 프롬프트에 명시 |
| must always invoke a tool (도구 강제) | `tool_choice: {"type":"any"}` |
| this one specific tool by name (특정 도구 고정) | `{"type":"tool","name":...}` |
| extended thinking + forced tool (동시 사용) | 비호환 → 확장 사고 비활성화 |
| each criterion in its own tag (섹션 혼선) | XML 태그로 경계 분리 |
| high false positive rate in one category | 그 카테고리만 일시 비활성화 |
| after changing the prompt (개선 후) | held-out 세트로 회귀 검증 |

**만능 오답 패턴 (거의 항상 함정)**

| 원문 조각 | 한국어 |
|---|---|
| Lower the temperature parameter to zero | 온도를 0으로 낮춤 |
| Increase the sampling temperature on every retry | 재시도마다 온도를 높임 |
| Increase the max_tokens parameter so the model has | 토큰 상한 증가 |
| window so it can hold the whole diff | 컨텍스트 창 확대 |
| Increase the extended thinking budget | 확장 사고 예산 증가 |
| double-check its own output carefully | 스스로 재확인하라는 지시 |
| Add a stronger system-prompt warning | 더 강한 경고문 추가 |
| only flag it when it is highly confident | 확신할 때만 지적 |
| hoping sampling variance yields a different result | 샘플링 변동에 기대 |
| Add a disclaimer banner on each result | 면책 문구 추가 |
| keep only the findings that appear in both runs | 두 실행 교집합만 채택 |
| review all 200 files sequentially in one conversation | 한 대화에서 순차 처리 |
| Remove the field / category / examples entirely | 문제 요소를 통째로 제거 |
| always / never / only / cannot ... | 절대 단정어 |

---

## 1. Message Batches API — 선택 기준 & 지연 (Batch vs Sync)

**해당 문제**: 1, 7, 10, 19, 23, 35, 61, 63, 86

### 동기식 vs 배치 대조표 (최중요)
| 축 | Messages API (동기) | Message Batches API |
|---|---|---|
| 지연 | 수 초, 블로킹 | **최대 24시간, SLA 보장 없음** |
| 비용 | 표준 | **50% 할인** |
| 용도 | 머지 게이트, 실시간 채팅 | 야간 대량 처리, 여유 마감 |
| 판별 신호 | `blocks on an immediate response` | `latency-tolerant`, `two-day turnaround` |

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| latency-tolerant | 지연 허용적 | 배치 선택의 **1순위 조건** |
| 50% cost discount | 50% 비용 할인 | 배치의 핵심 이점 |
| no guaranteed latency SLA | 지연 시간 보장 없음 | 실시간 용도 배제 근거 |
| 24-hour processing window | 24시간 처리 창 | 최악 케이스 계산의 기준 |
| worst-case budget | 최악 예산 | 간격 + 처리 + 후처리 ≤ 마감 |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| two-day turnaround comfortably absorbs the batch processing window | 2영업일 여유가 배치 처리 창을 흡수 | 1 |
| the discount lowers per-cycle spend | 할인이 주기당 지출을 낮춤 | 1 |
| latency-tolerant and the 50% cost discount scales well | 지연 허용적이고 50% 할인이 잘 확장됨 | 23 |
| the 24-hour SLA fits the team's deadline | 24시간 SLA가 팀 마감에 부합 | 23 |
| plus the 24-hour processing and the 2-hour formatting | 간격 + 24시간 처리 + 2시간 포맷팅 | 7 |
| waiting the full interval still finishes | 전체 간격 대기 문서도 24시간 안에 완료 | 19 |
| once every 6 hours, since a contract | 6시간마다 한 번, 계약서가 대기 가능 | 61 |
| finish within 24 hours before the 30-hour deadline | 30시간 마감 전 24시간 내 완료 | 61 |
| the Batches API offers no guaranteed turnaround | 배치 API는 보장된 처리 시간이 없음 | 35 |
| carries no guaranteed latency SLA | 보장된 지연 시간 SLA가 없음 | 63 |
| take up to 24 hours under heavy demand | 부하 시 최대 24시간까지 정상 소요 | 63 |
| the merge gate blocks on an immediate response | 병합 게이트는 즉시 응답에 블로킹됨 | 86 |
| Message Batches API offers no guaranteed latency SLA | 배치 API는 지연 SLA를 보장하지 않음 | 86 |
| a small, representative sample of tickets, refine | 대표 표본에 동기식 실행 후 개선 | 10 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| synchronous calls always finish faster than a queued | 병렬 동기 호출이 항상 더 빠름 | 절대 단정 |
| batches must stay under a few hundred requests | 수백 건 미만이어야 안정 처리 | 거짓 |
| require the strict ordering only sequential calls preserve | 순차 호출만이 순서를 보존 | 거짓 |
| results are typically available in under a minute | 배치 결과가 보통 1분 내 제공 | 거짓 |
| returns a verdict well within the few-second window | 수 초 안에 판정 반환 | 거짓 |
| the 50% cost discount outweighs the small delay | 할인이 작은 지연을 능가 | 잘못된 인과 |
| returns results the moment a request finishes | 요청 끝나는 즉시 결과 반환 | 거짓 |
| charges a per-token premium above standard synchronous pricing | 동기식보다 토큰당 프리미엄 부과 | 정반대 |
| already expect a short delay in chat interfaces | 고객이 채팅 지연을 이미 예상 | 잘못된 인과 |
| frequent small batches always complete faster | 잦은 작은 배치가 항상 더 빠름 | 절대 단정 |
| deadline itself defines how rarely the pipeline needs | 마감이 곧 배치 시작 빈도를 정함 | 잘못된 인과 |
| halving the processing window doubles the safety margin | 처리 창 반감이 마진을 두 배로 | 잘못된 인과 |
| batch processing window and therefore satisfies any SLA | 처리 창과 일치하므로 모든 SLA 충족 | 잘못된 인과 |
| cadence should simply mirror the length | 제출 주기를 SLA 길이와 그대로 맞춤 | 잘못된 인과 |
| absorbed by shortening the batch's own processing window | 배치 처리 창을 줄여 흡수 | 없는 동작 |
| Summarization requests inherently take longer to process | 요약 요청이 본질적으로 더 오래 걸림 | 거짓 |
| batch must be manually retrieved through the console | 콘솔에서 수동 조회해야 함 | 없는 동작 |
| corrected once the batch results come back | 배치 결과 후 포맷 문제를 잡으면 됨 | 정반대 |
| inherently less likely to contain formatting errors | 작은 배치가 본질적으로 오류가 적음 | 거짓 |

---

## 2. Batch 운영 — custom_id, 한도, 도구 호출 (Batch Mechanics)

**해당 문제**: 11, 31, 36, 49, 76, 88, 94

### 배치 규격 대조표
| 항목 | 값 / 규칙 |
|---|---|
| 배치당 한도 | **100,000 requests 또는 256 MB** (먼저 도달하는 쪽) |
| `custom_id` 허용 문자 | 영문자·숫자·`-`·`_` **만** |
| `custom_id` 길이 | **64자 이내** |
| 결과 순서 | **제출 순서 미보장** → `custom_id`로 매칭 |
| 부분 실패 | `errored`/`expired` 건만 골라 재제출 |
| 클라이언트 도구 | 중간 왕복 필요 → **배치 불가** |
| 서버 도구(web search) | 요청 내부에서 자동 완결 → **배치 가능** |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| custom_id values for the expired requests and resubmit | 만료 요청의 custom_id만 재제출 | 11 |
| leaving the already-succeeded requests untouched | 이미 성공한 요청은 그대로 둠 | 11 |
| Identify the errored requests by their custom_id | 오류 요청을 custom_id로 식별 | 31 |
| just those chunked requests in a new batch | 청크된 그 요청만 새 배치로 재제출 | 31 |
| not guaranteed to return in submission order | 제출 순서대로 반환 미보장 | 36 |
| match each result to its request using | 공유 custom_id로 결과를 매칭 | 36 |
| uses only letters, digits, hyphens, and underscores | 영숫자·하이픈·언더스코어만 사용 | 76 |
| staying under the 64-character limit | 64자 제한 이내 유지 | 76 |
| capped at 100,000 requests or 256 MB | 10만 건 또는 256MB 제한 | 88 |
| pause mid-processing to accept an application-supplied tool result | 처리 중 도구 결과 수용 불가 | 49 |
| resolves independently with no mid-request round trip | 중간 왕복 없이 독립 완결 | 49 |
| web search resolve automatically within the request itself | 서버 도구는 요청 내부에서 자동 완결 | 94 |
| unlike client-side tools that need an application-supplied result | 결과 제공이 필요한 클라이언트 도구와 달리 | 94 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| automatically requeue the expired requests once demand | 수요가 줄면 자동 재대기열 | 없는 동작 |
| automatically retries any request that previously errored | 오류 요청을 자동 재시도 | 없는 동작 |
| whole batch's results were discarded and none | 배치 전체 결과가 폐기됨 | 거짓 |
| batch processing cannot handle this workload at all | 만료는 처리 불가를 의미 | 절대 단정 |
| cannot be processed through the Messages API | 동기 API로도 처리 불가 | 절대 단정 |
| the point at which the API begins reordering | API가 결과 재정렬을 시작하는 지점 | 없는 동작 |
| must have contained a duplicate document | 중복 문서가 있었을 것 | 잘못된 인과 |
| polling the status endpoint longer before reading | 더 오래 폴링 | 핵심 회피 |
| since this is the maximum batch size | 1,000개가 최대 배치 크기 | 거짓 |
| batches are limited to 500 requests per hour | 시간당 500요청 제한 | 거짓 |
| the Batches API has no request limit | 요청 수 제한이 없음 | 거짓 |
| limit each conversation to a single message | 대화를 단일 메시지로 제한 | 거짓 |
| Tool definitions cannot be attached to any request | 도구 정의 첨부 불가 | 거짓 |
| silently strips tool_use content blocks from responses | tool_use 블록을 조용히 제거 | 없는 동작 |
| rejects any request that references a tool definition | 도구 참조 요청을 모두 거부 | 거짓 |
| server tools only function within streamed synchronous responses | 서버 도구는 스트리밍에서만 작동 | 거짓 |
| submits a matching synchronous request in parallel | 동일 동기 요청을 병렬 제출 | 없는 동작 |
| ingestion date and a colon-separated section label | 콜론 구분 라벨을 넣음 | 거짓 |
| spaces between each descriptive segment keep the identifier | 공백으로 가독성 유지 | 거짓 |
| output length is what caused the original context-window | 출력 길이가 컨텍스트 오류 원인 | 잘못된 인과 |

---

## 3. 퓨샷 예시 설계 (Few-shot Examples)

**해당 문제**: 2, 9, 15, 18, 27, 40, 45, 53, 60, 70, 71, 72, 87, 91, 97, 104

### 퓨샷 설계 대조표
| 축 | 올바른 방향 | 함정 |
|---|---|---|
| 개수 | **3~5개** | 1개만 / 컨텍스트 최대치까지 / 20개 |
| 다양성 | 레이아웃·언어·길이 **다양하게** | 전부 짧은 영문 메일 (편향) |
| 경계 | **borderline case** 포함 | 가장 극단적 사례 하나만 |
| 근거 | 판단 **이유**를 함께 | 레이블만, 설명 없이 |
| 예외 | **null 반환** 예시 포함 | 필수 필드 강제 |
| 대조 | 문제 사례 + 허용 사례 **쌍** | 한쪽만 |

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| diverse examples | 다양한 예시 | 일반화의 핵심 |
| borderline case | 경계 사례 | 판정이 갈리는 지점을 학습 |
| paired / contrasting examples | 대조 쌍 예시 | 오탐 감소에 가장 효과적 |
| rationale in examples | 예시 내 근거 | CoT 효과, 일반화 촉진 |
| example bias | 예시 편향 | 의도치 않은 패턴 학습 |
| overfitting / memorization | 과적합·암기 | 예시 과다의 부작용 |
| worked example | 완성 예시 | 출력 형식을 고정 |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| five diverse examples, each showing a snippet | 3~5개 다양한 예시 + 정확한 분류 | 97 |
| as well as one borderline case | 경계선 사례 하나도 포함 | 97 |
| five diverse examples covering distinct edge cases | 서로 다른 에지 케이스 3~5개 | 71 |
| the escalation decision and a brief rationale | 각각 이관 결정과 짧은 근거를 짝지음 | 18 |
| and a short explanation of why it beat | 왜 그것이 이겼는지에 대한 짧은 설명 | 9·27 |
| the other plausible queue | 다른 그럴듯한 대기열을 | 27 |
| a genuinely problematic instance and an acceptable instance | 문제 사례와 허용 사례의 대조 쌍 | 87 |
| examples pairing a diff with a coverage judgment | 디프와 커버리지 판단을 짝지은 예시 | 60 |
| one branch with no test, one covered indirectly | 테스트 없는 분기 + 간접 커버 분기 | 60 |
| unusual phrasing plus a case confirming null | 특이 표현 추출 + null이 옳은 사례 | 2 |
| examples pairing informal phrases with correct normalization | 비공식 표현과 정확한 정규화의 쌍 | 104 |
| one case where the field is left null | 필드를 null로 두는 사례 추가 | 104 |
| the layout types actually received, each paired with | 실제 레이아웃별 예시와 정확한 추출 | 91 |
| Methodology section and from an embedded sentence | 라벨 섹션과 삽입 문장 양쪽 예시 | 45 |
| how a superscript marker traces to its entry | 위첨자가 항목으로 이어지는 과정 제시 | 15 |
| render all four fields in the same order | 네 필드를 동일 순서로 렌더링한 예시 | 40 |
| including one low-severity case | 낮은 심각도 사례 하나 포함 | 40 |
| three to five worked examples in example tags | example 태그 안 3~5개 완성 예시 | 70 |
| show the exact field order and formatting wanted | 원하는 정확한 필드 순서와 서식 제시 | 70 |
| unintentionally taught an unrelated pattern tied to length | 길이와 엮인 무관한 패턴을 학습시킴 | 53 |
| and language; diversify them | 그리고 언어; 예시를 다양화하라 | 53 |
| Reduce the twenty examples to a small set | 20개 예시를 소수 집합으로 축소 | 72 |
| underlying decision rule visible to the model | 근본 판단 규칙이 모델에 드러남 | 72 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| Ten near-duplicate examples of the same kind | 동일 버그의 유사 예시 10개 | 다양성 없음 |
| long example showing the single most severe bug | 가장 심각한 버그 하나만 긴 예시로 | 경계 학습 불가 |
| extreme violation the team has ever seen | 팀이 본 가장 극단적 위반 사례 | 경계 학습 불가 |
| the single ticket that was hardest to triage | 가장 어려웠던 티켓 하나만 | 다양성 없음 |
| many historical tickets as the context window allows | 컨텍스트 창 최대치까지 | 과적합 |
| Keep appending every newly discovered literal pair | 새로 발견되는 쌍을 계속 추가 | 과적합 |
| at random from the archive to avoid | 편향 회피 위해 완전 무작위 선정 | 보장 불가 |
| Ten or more posts that are obviously fine | 명백히 문제없는 게시물 10개 이상 | 경계 학습 불가 |
| the label 'bug' with no further explanation | 설명 없이 'bug' 레이블만 | 근거 부재 |
| no explanation, so the model infers the pattern | 설명 없이 반복으로 패턴 추론 | 근거 부재 |
| idealized ticket rather than an actual historical one | 단순화·이상화된 티켓 | 실제 분포와 괴리 |
| repeated in full once inside each individual example | 정책 문서 전문을 예시마다 반복 | 비효율 |
| too few in number; keep them but duplicate | 개수 부족이니 복제하라 | 편향 심화 |
| is caused by unrelated model drift | 예시와 무관한 모델 드리프트 탓 | 잘못된 인과 |
| simply incompatible with document classification tasks | 문서 분류와 아예 호환 불가 | 거짓 |
| Remove the examples entirely and rely | 예시 제거하고 지시문 한 문장에 의존 | 정반대 |
| paragraph enumerating every layout variant the team can | 모든 변형을 나열한 긴 단락 | 시연 아닌 서술 |
| instruction noting that citations may appear either inline | 인용이 본문에 나올 수 있다는 지시문 | 시연 아닌 서술 |
| longer numbered list that spells out every field | 모든 필드를 나열한 더 긴 목록 | 시연 아닌 서술 |
| strips all superscript numbers before the document reaches | 위첨자를 사전 제거 | 정반대 |
| rejects any paper not using inline citation style | 인라인 인용 아닌 논문 거부 | 핵심 회피 |
| Exclude any paper that lacks a labeled Methodology | 라벨 섹션 없는 논문 제외 | 핵심 회피 |
| Preprocess every document into one canonical plain-text format | 단일 평문 형식으로 전처리 | 잘못된 인과 |
| its own output carefully against the four-field requirement | 스스로 재확인하라는 지시 | 보장 불가 |
| the model not to forget the severity field | 잊지 말라고 상기 | 핵심 회피 |
| any branch under one hundred percent line coverage | 100% 미만 분기 전부 경고 | 정반대 |
| ten lines as automatically having adequate coverage | 10줄 미만은 자동으로 충분 처리 | 절대 단정 |
| Lower the temperature parameter to zero | 온도를 0으로 낮춤 | 만능 오답 |
| Increase the max_tokens parameter so the model has | 토큰 상한 증가 | 만능 오답 |
| window to ensure it reads the entire paper | 컨텍스트 창 확대 | 잘못된 인과 |
| Reduce the number of required output fields | 필수 출력 필드 수 축소 | 핵심 회피 |

---

## 4. 구조화 출력 — 스키마 설계 (Structured Output & Schema Design)

**해당 문제**: 38, 44, 47, 56, 57, 67, 80, 89, 98, 101

### 스키마 설계 대조표
| 문제 상황 | 올바른 설계 | 함정 |
|---|---|---|
| 값이 원본에 없을 수 있음 | **optional + nullable** | required 유지 + 프롬프트 경고 |
| enum 밖의 값이 들어옴 | **`other`/`unclear` enum + 자유 텍스트** | enum 제거 / 억지 배정 / 긴 enum 값 |
| 형식이 문서마다 다름 | **스키마 완화 + 후속 파서** | 엄격한 ISO 8601 유지 / 필드 분할 |
| 값의 출처 구분 필요 | **provenance enum** (`stated` 등) | 문자열 자리표시자 |
| JSON 보장 필요 | **tool_use `input_schema`** | 프롬프트로 "JSON만 출력" 요구 |
| 기각 사유 분석 필요 | **범주형 식별 필드** | 자유 텍스트 / severity 필드 |

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| optional, nullable field | 선택적·널 허용 필드 | 환각 방지의 정석 |
| fallback enum value | 폴백 enum 값 | 강제 배정(forced fitting) 차단 |
| input_schema enforced server-side | 서버 측 스키마 강제 | 프롬프트 요구보다 확실 |
| provenance / source enum | 출처 enum | 추정값과 명시값 구분 |
| categorical identifier | 범주형 식별자 | 집계·그룹화 가능하게 |
| oversized combined schema | 과대한 통합 스키마 | 노이즈 → 정확도 저하 |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| optional, nullable field so Claude can omit it | 선택적·nullable 필드로 생략 가능 | 80 |
| make `square_footage` optional for missing values | 누락 값에 대해 선택 항목으로 | 67 |
| add a `square_footage_source` enum that stores 'stated' | stated 등을 담는 출처 enum 추가 | 67 |
| "other" enum value alongside a separate free-text | other enum + 자유 텍스트 필드 | 98 |
| without corrupting the five known categories | 기존 5개 카테고리를 오염시키지 않음 | 98 |
| "unclear" enum value to distinguish genuinely ambiguous | 진짜 모호한 경우 구분용 unclear 추가 | 38 |
| extraction tool with an input_schema describing the fields | 필드를 기술한 input_schema로 도구 정의 | 44 |
| structured arguments from the resulting tool_use block | tool_use 블록에서 구조화 인자 파싱 | 44 |
| the API strictly enforces the input_schema server-side | API가 서버 측에서 스키마를 엄격히 강제 | 56 |
| JSON requests can still drift into invalid syntax | 프롬프트 전용 JSON은 구문 이탈 가능 | 56 |
| Loosen the schema to accept any string | ship_date에 임의 문자열 허용 | 47·57 |
| step that uses a date parser to normalize | 날짜 파서로 정규화하는 후속 단계 | 47·57 |
| detected_pattern field naming the specific construct that triggered | 유발 구문을 명시하는 필드 | 89 |
| so dismissals can be grouped by construct | 구문별로 기각을 그룹화 가능 | 89 |
| which exact rule causes a high dismissal rate | 어떤 규칙이 높은 기각률을 유발하는지 격리 | 28 |
| Three separate, document-type-specific tools with tool_choice: "any" | 문서 유형별 3개 도구 + any | 101 |
| noise and confusion of an oversized combined schema | 과대 통합 스키마의 노이즈 회피 | 101 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| Keep phone_number required and add a second required | required 유지하고 필드 추가 | 환각 유발 |
| required, and add a system prompt instruction | 필수 유지 + 프롬프트 지시 | 만능 오답 |
| a jurisdiction value from the enum on every | 매번 enum에서 강제 선택 | 정반대 |
| Remove the enum constraint entirely and let category | enum을 완전히 제거 | 집계 불가 |
| miscellaneous_unclear_ticket_type_pending_manual_review | 지나치게 긴 하드코딩 enum 값 | 비효율 |
| jurisdiction name in the enum with an "ambiguous_" | 접두사 붙여 enum 중복 | 비효율 |
| false so the model is allowed to skip | strict:false로 필드 생략 허용 | 핵심 회피 |
| indicating only whether any jurisdiction is mentioned | 언급 여부만 나타내는 불리언 | 정보 손실 |
| an enum of common area codes | 지역번호 enum으로 변경 | 핵심 회피 |
| so the model can output a placeholder | 문자열로 바꿔 자리표시자 출력 | 비효율 |
| Remove the tool definition entirely and ask Claude | 도구 정의를 완전히 제거 | 비효율 |
| Remove `square_footage` from the schema entirely | 필드를 스키마에서 제거 | 핵심 회피 |
| Remove the `ship_date` field from the extraction schema | ship_date 필드 제거 | 핵심 회피 |
| Claude output valid JSON and nothing else | JSON만 출력하라고 요구 | 보장 불가 |
| in triple backticks and strip the backticks | 백틱으로 감싸고 제거 | 핵심 회피 |
| Lower the temperature parameter to 0 | 온도를 0으로 | 잘못된 인과 |
| Both approaches produce equally reliable schema-compliant output | 두 방식이 동등하게 신뢰할 만함 | 거짓 |
| JSON-repair library must always be used afterward | JSON 복구 라이브러리가 항상 필요 | 절대 단정 |
| prompt-only approach yields more reliable schema-compliant output | 프롬프트 전용이 더 신뢰할 만함 | 정반대 |
| Retain the strict ISO 8601 schema constraint | 엄격한 ISO 8601 유지 | 정반대 |
| Split `ship_date` into three fields such as `ship_date_us` | 세 필드로 분할 | 비효율 |
| later from other fields such as tracking | 추적 번호로 배송일 추론 | 비효율 |
| which construct or rule actually produced | 유발 규칙 기록 없음 | 집계 불가 |
| field where each reviewer types their own reasoning | 자유 텍스트로 사유 기재 | 집계 불가 |
| should be analyzed through the severity field instead | severity 필드로 분석 | 핵심 회피 |
| would expose proprietary rule names to the team | 규칙 이름 노출 우려 | 잘못된 인과 |
| tool_choice: "any" forced to extract_invoice as the default | any를 기본값으로 고정 | 없는 동작 |
| one tool to be registered in the tools | 정확히 1개 등록을 요구 | 거짓 |

---

## 5. 스키마의 한계 — 의미론적 검증 (Schema vs Semantics)

**해당 문제**: 16, 24, 51, 74, 77, 93

### 검증 범위 대조표 (최중요)
| 검증 주체 | 보장하는 것 | 보장 못 하는 것 |
|---|---|---|
| JSON Schema / `strict: true` | **구조(Structural)·타입(Type) 준수** | 사실 여부, 산술 일관성, 비즈니스 타당성 |
| 후속 애플리케이션 로직 | **산술·의미·비즈니스 검증** | — |

> 시험 포인트: "구조적으로는 유효한데 값이 틀렸다" → **항상** 스키마 밖 문제, 후속 검증 로직으로.

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| syntactic validity | 구문적 유효성 | 스키마가 보장하는 범위 |
| semantic correctness | 의미론적 정확성 | 스키마 밖, 별도 검증 필요 |
| arithmetic consistency | 산술 일관성 | 합계·항목 교차 검증 |
| business plausibility | 비즈니스 타당성 | 도메인 규칙 검증 |
| calculated_total | 계산 합계 | 명시 총액과 대조하는 수단 |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| cannot verify that the values are semantically correct | 원본 대비 의미론적 정확성은 검증 못함 | 24 |
| syntactic validity but does not verify semantic correctness | 구문 유효성만 보장, 의미는 미검증 | 74 |
| such as arithmetic consistency between related fields | 관련 필드 간 산술 일관성 같은 것 | 74 |
| only guarantees structural and type conformance | 구조와 타입 준수만 보장 | 93 |
| business-plausibility checks are still needed | 비즈니스 타당성 검사가 여전히 필요 | 93 |
| a semantic error outside schema conformance | 스키마 적합성 밖의 의미론적 오류 | 16 |
| cross-checks the currency symbol against the number | 통화 기호를 숫자와 교차 검증 | 16 |
| a semantic error the schema cannot catch | 스키마가 잡을 수 없는 의미적 오류 | 77 |
| compares a calculated_total against the stated order_total | 계산 합계를 명시 총액과 비교 | 77 |
| flag records where the two figures diverge | 계산 합계와 다른 레코드를 표시 | 51 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| field values must satisfy the schema's semantic rules | strict가 의미 규칙까지 강제 | 없는 동작 |
| guarantees full business-logic correctness | 비즈니스 로직 정확성을 완전 보장 | 절대 단정 |
| re-runs the extraction against the source until values | 의미 확인까지 내부 재실행 | 없는 동작 |
| strict tool use should have already prevented | 엄격한 도구 사용이 이미 막았어야 함 | 없는 동작 |
| strict schema enforcement should already have blocked | 엄격한 스키마가 이미 차단했어야 함 | 없는 동작 |
| known to skip internal consistency checks | 강제 호출이 일관성 검사를 건너뜀 | 없는 동작 |
| the only mechanism that can prevent numeric mismatches | required가 수치 불일치를 막는 유일 수단 | 절대 단정 |
| the input_schema was likely malformed | 스키마가 잘못 구성됨 | 잘못된 인과 |
| since the two numeric fields disagree | 수치 불일치를 구문 오류로 분류 | 잘못된 인과 |
| hallucinating the schema itself at request time | 스키마 자체를 환각 | 거짓 |
| a transient sampling artifact unlikely to recur | 재발 없는 일시적 현상 | 거짓 |
| simply increasing max_tokens on the next call | max_tokens만 늘리면 해결 | 잘못된 인과 |
| tool_choice that forces a specific tool invocation | 특정 도구 강제가 없어서 | 잘못된 인과 |
| because this particular field happens to be numeric | 숫자형 필드라는 이유만으로 | 잘못된 인과 |
| declined to resolve the ambiguous currency symbol | 모델이 해석을 거부함 | 거짓 |
| Trust the printed total field exactly as extracted | 인쇄된 합계를 그대로 신뢰 | 핵심 회피 |
| Skip extracting individual line items entirely | 품목 추출을 생략 | 정반대 |
| the printed total with whatever value it judges | 판단값으로 조용히 덮어씀 | 없는 동작 |

---

## 6. 재시도 · 에스컬레이션 (Retry Loop & Human-in-the-Loop)

**해당 문제**: 5, 14, 21, 22, 29, 33, 52, 62, 79

### 재시도 가능 여부 대조표 (최중요)
| 실패 유형 | 원문 신호 | 재시도로 해결? |
|---|---|---|
| 배치·형식 오류 | `placed under the wrong object`, `purely formatting` | **가능** — 피드백 재시도 |
| 원본에 값 없음 | `no phone number appears anywhere` | **불가** — 사람에게 이관 |
| 다른 문서에만 존재 | `only appears in an annual letter never supplied` | **불가** — 다른 원본 필요 |
| 원본 데이터 충돌 | `two conflicting values in the source` | **불가** — 플래그 + 사람 조정 |
| 원본 자체 불일치 | `an inconsistency in the source` | **불가** — 추출 실수가 아님 |

### 재시도 시 전달할 것 (3종 세트)
| 구성 요소 | 원문 |
|---|---|
| 원본 문서 | `The original intake document` |
| 실패한 출력 | `the prior failed JSON` |
| 무엇이 왜 틀렸는지 | `a note` naming the required format |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| extracted correctly but placed under `billing_address` instead | 올바르게 추출됐으나 잘못된 위치에 배치 | 29 |
| Retry with feedback naming the required format | 요구 포맷을 명시한 피드백과 재시도 | 62 |
| already present and this is purely formatting | 날짜는 이미 존재, 순수 포맷 문제 | 62 |
| retry with that inconsistency as feedback | 불일치를 피드백으로 재시도 | 5 |
| the prior failed JSON, and a note | 원본 + 실패 JSON + 노트 | 33 |
| the original PDF plus the prior failed JSON | 원본 PDF와 실패 JSON 재전송 | 52 |
| state that `invoice_number` is required but was omitted | 필수 필드 누락을 명시 | 52 |
| absent from the source rather than a structural | 구조적 실패가 아닌 실제 부재 | 14 |
| the source, feedback retries cannot recover | 원본에 없으면 재시도로 복구 불가 | 22 |
| source rather than a correctable extraction mistake | 수정 가능한 실수가 아닌 원본 불일치 | 21 |
| set a conflict_detected boolean to true | 충돌 플래그를 true로 설정 | 79 |
| record for human reconciliation rather than guessing | 추측 대신 사람 조정으로 라우팅 | 79 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| eventually make the model's numbers sum correctly | 충분히 시도하면 합계가 맞음 | 보장 불가 |
| sampling variance yields a different result this time | 샘플링 변동에 기대 | 보장 불가 |
| Increase the sampling temperature on every retry | 재시도마다 온도 상승 | 만능 오답 |
| progressively more detailed schema instructions | 점점 더 상세한 스키마 지침 | 핵심 회피 |
| expecting greater capability to recover the missing value | 더 큰 모델이 복구하리라 기대 | 보장 불가 |
| once the model is given a strict schema | 엄격한 스키마면 저절로 해결 | 보장 불가 |
| redacted value was cached in a prior turn | 가려진 값이 캐시되어 있음 | 없는 동작 |
| structured output enforcement should have already eliminated | 구조화 출력이 이미 제거했어야 함 | 없는 동작 |
| Send only the validation error text by itself | 검증 오류 텍스트만 단독 전송 | 맥락 부족 |
| naming the missing field or the earlier attempt | 누락 필드·이전 시도 미명시 | 맥락 부족 |
| the prior failed JSON and a note instructing | 실패 JSON과 노트만 | 원본 누락 |
| the model retains full memory of the document | 모델이 문서를 기억한다고 가정 | 거짓 |
| sent without the intake document originally supplied | 원본 문서 없이 전송 | 정반대 |
| Average the two conflicting values together | 충돌 값을 평균 냄 | 없는 동작 |
| quietly discard the later conflicting value | 나중 값을 조용히 폐기 | 핵심 회피 |
| since it sits within a more detailed section | 더 상세한 섹션에 있으므로 | 잘못된 인과 |
| omit the statement total field so this mismatch | 필드를 빼서 감지 불가하게 함 | 핵심 회피 |
| assuming the mismatch is caused by truncation | 잘림이 원인이라 가정 | 잘못된 인과 |
| the JSON schema's type constraints alone | 스키마 타입 제약만으로 | 보장 불가 |
| Instruct the model once, in the original prompt | 최초에 한 번 주의하라고 지시 | 보장 불가 |
| Remove the end_date field from the schema | end_date 필드 제거 | 핵심 회피 |
| a semantic error needing a calculated-value cross-check | 계산값 교차 검증이 필요한 오류 | 잘못된 인과 |
| Abandon structured extraction for this field entirely | 구조화 추출을 완전히 포기 | 핵심 회피 |
| unrecoverable and escalate straight to a human reviewer | 곧바로 사람에게 이관 | 비효율 |

---

## 7. 명시적 기준 vs 모호한 신뢰도 (Explicit Criteria vs Confidence)

**해당 문제**: 6, 12, 20, 34, 46, 50, 54, 55, 69, 90

### 기준 작성 대조표 (최중요)
| 나쁜 기준 (전부 함정) | 좋은 기준 |
|---|---|
| `highly confident` (매우 확신할 때) | `contradicts its declared type` (선언 타입과 모순) |
| `feel uneasy` (불안하게 느껴지면) | `allows unauthenticated access` (미인증 접근 허용) |
| `deems significant enough` (충분히 중요하다면) | `breaks existing behavior` (기존 동작을 깸) |
| `confidence score exceeds 0.9` (점수 임계값) | 보고 대상 + **스킵 대상**을 함께 명시 |
| `looks like` a security issue | `names specific, checkable conditions` |

> 시험 포인트: **신뢰도 표현·점수 임계값은 거의 항상 오답.** 모델이 쓰던 판단을 그대로 쓰기 때문.

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| specific, checkable conditions | 구체적·검증 가능한 조건 | 정답 기준의 조건 |
| categorical criteria | 범주적 기준 | 점수가 아닌 유형으로 |
| explicitly state which to skip | 스킵 대상 명시 | 포함/제외 **양쪽** 필요 |
| open-ended judgment | 개방적 주관 판단 | 오탐의 원인 |
| no concrete rule for what to report | 구체적 규칙 부재 | 모호한 문구의 본질 |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| unauthenticated access to data that should require authorization | 권한 필요 데이터에 미인증 접근 허용 | 6 |
| correctness bug that breaks existing behavior | 보안 취약점 또는 동작을 깨는 버그 | 12·50 |
| deviations from a file's established local conventions | 포맷 선호·로컬 관례 이탈은 스킵 | 12·50 |
| declared type, documented contract, or an explicit precondition | 선언 타입·문서 규약·전제와 모순 | 54 |
| list of the specific issue types that qualify | 해당하는 구체적 이슈 유형 목록 | 20 |
| state which related issue types should be skipped | 스킵할 이슈 유형을 명시 | 20 |
| specific claim about behavior that is contradicted by | 실제 동작과 모순되는 구체적 주장 | 34 |
| a docstring stating a function returns None | None 반환이라 적힌 독스트링 | 34 |
| a specific, checkable claim about caching behavior | 캐싱 동작에 대한 검증 가능한 주장 | 46 |
| the code's actual control flow directly contradicts | 실제 제어 흐름이 직접 모순 | 46 |
| specific, checkable conditions that define a security issue | 검증 가능한 구체적 조건을 명시 | 69 |
| an open-ended judgment about what 'looks like' | 개방적 주관 판단에 의존 | 69 |
| no concrete rule for what to report | 보고 기준의 구체적 규칙이 없음 | 55 |
| still applies the same underlying judgment that produced | 이전과 동일한 내재적 판단을 적용 | 55 |
| concrete code example illustrating what qualifies | 짧은 정의 + 구체적 코드 예시 | 90 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| would make an experienced engineer feel uneasy | 숙련 엔지니어를 불안하게 만듦 | 주관적 |
| harder to reason about than the rest | 주변보다 추론하기 어려움 | 주관적 |
| flag a comment when it is highly confident | 매우 확신할 때만 지적 | 보장 불가 |
| flag only those that it deems significant enough | 충분히 중요하다고 판단하는 것만 | 보장 불가 |
| being a real bug is above a threshold | 확신이 임계값을 넘을 때 | 핵심 회피 |
| confidence score exceeds a fixed threshold of 0.9 | 내부 신뢰도 0.9 초과 | 핵심 회피 |
| first pass's confidence score exceeds a fixed threshold | 1차 신뢰도가 임계값 초과 | 핵심 회피 |
| report naming issues when its confidence exceeds 90% | 확신 90% 초과 시에만 보고 | 보장 불가 |
| be willing to bet that a senior engineer | 시니어가 동의할 것에 걸 수 있다면 | 주관적 |
| code looks unusual compared to typical patterns | 주변 코드가 특이해 보이면 | 보장 불가 |
| how urgent the issue feels in the context | 얼마나 긴급하게 느껴지는지 | 보장 불가 |
| comment that could plausibly be improved in clarity | 개선 여지가 있는 모든 주석 | 만능 오답 |
| the model classifies as a subjective personal taste | 주관적 취향으로 분류된 것 스킵 | 보장 불가 |
| current finding to the average severity of findings | 최근 평균 심각도와 비교 | 보장 불가 |
| default to medium severity for every finding | 전부 기본 medium으로 | 핵심 회피 |
| module that has historically caused many production incidents | 과거 장애가 많던 모듈 | 잘못된 인과 |
| deviates from the team's officially documented style guide | 스타일 이탈을 모두 보고 | 정반대 |
| using stronger emphasis, such as capitalizing key words | 대문자 강조 | 핵심 회피 |
| add a numeric percentage threshold to it | 숫자 임계값 추가 | 보장 불가 |
| placement was the reason it had no effect | 배치가 무효의 원인 | 잘못된 인과 |
| output length, which expands the set of tokens | 출력 길이가 토큰 집합을 확장 | 잘못된 인과 |
| conflicts with the model's safety training | 안전 학습과 충돌 | 거짓 |
| tokens the model is trained to parse | 학습된 토큰 집합에 없음 | 없는 동작 |
| docstrings describe intent rather than guaranteed behavior | 독스트링은 의도를 기술 | 거짓 |
| single-use functions are exempt from this criterion | 단일 사용 함수는 면제 | 없는 동작 |
| excluded from comment-accuracy review by definition | 구현 세부는 정의상 제외 | 절대 단정 |
| focus on those patterns and miss other risks | 그 패턴만 보고 다른 위험을 놓침 | 핵심 회피 |
| allows the model to capture a wider range | 포괄적 문구가 더 넓게 포착 | 정반대 |
| as both ultimately rely on the model's general | 둘은 기능적으로 동일 | 거짓 |

---

## 8. 리뷰 아키텍처 — 파일별 vs 통합 (Per-file vs Integration Pass)

**해당 문제**: 3, 13, 17, 25, 39, 82, 96

### 패스 역할 대조표
| 패스 | 잡는 것 | 못 잡는 것 |
|---|---|---|
| per-file (파일별) | 구문 오류, 스타일, 국소 로직 | 파일 간 인터페이스·데이터 흐름 |
| integration (통합) | **공유 인터페이스 불일치, 계약 위반** | (파일별이 담당하는 국소 이슈) |

> 대규모 diff = **파일별 + 통합** 둘 다. 한쪽만 고르는 보기는 오답.

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| interface used differently across files reviewed in isolation | 격리 검토된 파일 간 공유 인터페이스 불일치 | 3·96 |
| Inconsistencies in data flow and contracts between files | 파일 간 데이터 흐름·계약 불일치 | 96 |
| traces data flow and interface usage across files | 파일 간 데이터 흐름과 인터페이스 사용 추적 | 17 |
| one recommendation based on the actual data flow | 두 파일을 함께 보고 단일 권고 도출 | 13 |
| examines both files together and produces one recommendation | 두 파일을 함께 검토해 하나의 권고안 | 39 |
| plus an integration pass for cross-file consistency | 파일별 + 통합 패스 | 25 |
| passes for local issues, plus an integration pass | 파일별 패스 더하기 통합 패스 | 82 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| too narrowly scoped to catch indentation | 들여쓰기를 잡기엔 범위가 좁음 | 정반대 |
| already checks whether that specific file compiles | 파일별이 이미 컴파일을 확인 | 핵심 회피 |
| sequentially and cannot notice repeated code blocks | 순차 읽기로 중복을 못 봄 | 거짓 |
| Syntax errors within an individual file | 개별 파일 내 구문 오류 | 통합 패스 소관 아님 |
| and module B together in one sitting | 두 모듈만 함께 읽음 | 핵심 회피 |
| file twice increases the chance of noticing | 두 번 읽으면 발견 확률 상승 | 잘못된 인과 |
| Merging the two files into one before review | 검토 전 파일 병합 | 핵심 회피 |
| recommendation is worded with higher confidence language | 더 확신에 찬 표현을 채택 | 보장 불가 |
| original generator to arbitrate between the two | 원 생성기에게 중재 요청 | 핵심 회피 |
| on why it wrote the code that way | 왜 그렇게 썼는지 맥락이 있으므로 | 잘못된 인과 |
| still remembers why it changed the signature | 시그니처 변경 이유를 기억하므로 | 보장 불가 |
| the most recent commit in full each time | 최신 커밋만 전체 검토 | 핵심 회피 |
| window so it can hold the whole diff | 컨텍스트 창 확대 | 보장 불가 |
| keep only findings that appear in both runs | 두 실행 교집합만 유지 | 비효율 |

---

## 9. 생성자–검증자 분리 & 세션 격리 (Generator–Evaluator Separation)

**해당 문제**: 4, 8, 30, 37, 42, 58, 73, 78, 81, 84, 92, 95

### 분리 원칙 대조표
| 상황 | 올바른 설계 | 함정 |
|---|---|---|
| 자기 코드 검토 | **별도 인스턴스, 이력 접근 없음** | 같은 세션에서 재검토 |
| 검증자에게 줄 입력 | **원본 diff 그대로** | 생성자가 만든 요약본 |
| 서브에이전트 맥락 | **prompt 문자열에 명시** | 부모 이력이 자동 상속된다고 가정 |
| 검토 전용 에이전트 도구 | **Read, Grep, Glob만** | Edit/Write/Bash 포함, tools 미설정 |
| 대규모(200파일) | **워크플로 오케스트레이션** | 한 대화에서 순차 처리 |

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| confirmation bias | 확증 편향 | 자기 검토가 실패하는 이유 |
| generator's own framing | 생성자 자신의 프레이밍 | 요약본 전달의 위험 |
| session context isolation | 세션 컨텍스트 격리 | 서브에이전트 기본 성질 |
| least privilege tools | 최소 권한 도구 | 읽기 전용으로 제한 |
| prompt chaining | 프롬프트 체이닝 | 생성 후 개별 검증 |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| no access to the generation session's history | 이력 접근 없는 독립 인스턴스 | 81 |
| in the same session that generated the code | 코드를 생성한 동일 세션에서 산출 | 8 |
| it inherits the same blind spots as self-review | 자기 검토와 동일한 맹점을 물려받음 | 8 |
| in the same session that produced the code | 코드를 만든 동일 세션에서 실행 | 84 |
| it retains the reasoning that justified those decisions | 결정을 정당화한 추론을 유지 | 84 |
| session where it already committed to its design | 설계를 확정한 동일 세션 안에 있음 | 78 |
| less likely to question choices it just justified | 방금 정당화한 선택을 의심하기 어려움 | 78 |
| retains its full prior conversation history | 세션 재개는 이전 이력 전체를 유지 | 30 |
| reflects the generator's own framing of its decisions | 생성자 자신의 프레이밍을 반영 | 95 |
| instead of examining the actual code fresh | 실제 코드 대신 그 설명을 평가 | 95 |
| prompt plus the Agent tool's prompt string | 자체 시스템 프롬프트 + prompt 문자열 | 58 |
| but not the parent's history or tool results | 부모 이력·도구 결과는 받지 않음 | 58 |
| the Agent tool's prompt string to the subagent | prompt 문자열만 전달 | 37 |
| must be written explicitly into that prompt | 프롬프트에 명시적으로 작성해야 함 | 37 |
| Glob, omitting Edit, Write, and Bash | 읽기 전용만, 쓰기 도구 제외 | 73 |
| runs a script coordinating many subagents | 다수 서브에이전트를 조율하는 워크플로 | 42 |
| draft finding against the explicit criteria in isolation | 각 초안을 기준에 맞춰 개별 검증 | 92 |
| criteria due to generating a large set | 대량 생성 탓에 기준을 잘못 적용 | 92 |
| reviewer agents that independently reproduce and verify | 독립적으로 재현·검증하는 에이전트 플릿 | 4 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| Add stricter self-review instructions to the system prompt | 더 엄격한 자가 검토 지시 | 핵심 회피 |
| twice in a row within the same session | 동일 세션에서 두 번 검토 | 편향 유지 |
| extended thinking budget for the self-review step | 자가 검토 예산 증가 | 만능 오답 |
| Increase the generator's own extended thinking effort | 생성기의 사고 노력 증가 | 잘못된 인과 |
| lacks access to the files it just wrote | 방금 쓴 파일에 접근 불가 | 거짓 |
| phrased as a command rather than a question | 명령문으로 표현되어 있음 | 잘못된 인과 |
| disabled by default, so it never allocates | 확장 추론이 기본 비활성 | 잘못된 인과 |
| a token budget that is too small | 토큰 예산이 너무 작음 | 거짓 |
| Extended thinking disables tool use during reflection | 성찰 중 도구 사용 비활성화 | 없는 동작 |
| scrutiny per issue stays roughly the same | 이슈당 검토 깊이가 그대로 | 거짓 |
| also given write access to the codebase | 쓰기 권한이 없으면 안 됨 | 거짓 |
| supported output format for any Claude instance | 지원되지 않는 출력 형식 | 없는 동작 |
| when a single instance reviews a single file | 단일 파일에만 작동 | 거짓 |
| resumed sessions cannot access the codebase at all | 재개 세션은 코드베이스 접근 불가 | 거짓 |
| automatically strips reasoning context from a resumed session | 추론 컨텍스트를 자동 제거 | 없는 동작 |
| resuming a session always clears the model's memory | 재개는 항상 메모리를 지움 | 절대 단정 |
| automatically receives the parent's entire conversation transcript | 부모 전체 대화를 자동 수신 | 없는 동작 |
| reasoning trace but not the actual code files | 부모 추론 기록을 상속 | 없는 동작 |
| shares the same context window as the parent | 부모와 컨텍스트 창 공유 | 거짓 |
| receiving any information at all from the parent | 어떤 정보도 못 받음 | 절대 단정 |
| silently blocks it from being told which files | 파일 정보 전달을 차단 | 없는 동작 |
| first be resumed with a prior session id | 이전 세션 id로 재개해야 함 | 정반대 |
| Grant the subagent Bash access only | Bash만 부여 | 정반대 |
| unset so the subagent inherits every tool | tools 미설정으로 전체 상속 | 보장 불가 |
| Edit and Write access but set permission mode | 쓰기 부여 후 승인 모드로 통제 | 보장 불가 |
| access to the generator's extended thinking trace | 생성자 추론 기록이 있어야만 유용 | 절대 단정 |
| from summarizing are negligible compared to the cost | 요약 절감이 무시할 수준 | 핵심 회피 |
| the maximum prompt length the Agent tool supports | 최대 프롬프트 길이 초과 | 정반대 |
| 200 files sequentially within one long-running conversation | 한 대화에서 200파일 순차 검토 | 비효율 |
| sample of 20 files and extrapolate those findings | 20개 표본으로 외삽 | 보장 불가 |
| invoke a more capable model by default | 기본적으로 더 우수한 모델 호출 | 거짓 |
| model's system prompt after the draft generation | 초안 후 시스템 프롬프트 재설정 | 없는 동작 |
| the amount of context available to the model | 컨텍스트를 두 배로 | 잘못된 인과 |
| already independently reproduce and verify every finding | 로컬 리뷰가 이미 독립 검증 | 거짓 |
| as the cloud fleet but finishes in seconds | 클라우드와 같은 검증을 몇 초에 | 보장 불가 |

---

## 10. tool_choice & Extended Thinking

**해당 문제**: 26, 59, 65, 66, 83, 99, 100, 101, 103

### tool_choice 대조표 (최중요)
| 설정 | 동작 | 문제 신호 |
|---|---|---|
| `{"type":"auto"}` | 모델이 호출 여부 자율 결정 | 기본값 — 평문 응답 가능 |
| `{"type":"any"}` | **반드시 하나 호출**, 어느 것인지는 자율 | `must always invoke a tool`, 유형별 라우팅 |
| `{"type":"tool","name":...}` | **지정한 그 도구만** 강제 | `this one specific tool` |
| `{"type":"none"}` | 도구 호출 금지 | — |

> **Extended Thinking 제약**: 확장 사고는 `auto`/`none`에서만 가능. `any`/`tool`과 **동시 사용 불가** → 요구사항이 강제 호출이면 **확장 사고를 끈다**.
> 강제 도구 사용은 도구 호출 **이전의 자연어 텍스트를 억제**한다.

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| Change tool_choice to {"type": "any"} (or force | any로 변경 또는 이름으로 강제 | 99 |
| must always invoke a tool on every request | 매 요청 도구 강제, 평문 불가 | 99 |
| the three tools but can pick whichever | 셋 중 하나 필수, 선택은 자유 | 59 |
| {"type": "any"}, letting Claude read the ticket | any 설정 후 Claude가 판단 | 65 |
| Three separate, document-type-specific tools with tool_choice: "any" | 유형별 3개 도구 + any | 101 |
| tool_choice: {"type": "tool", "name": "extract_metadata"} | 특정 도구 이름 지정 강제 | 100 |
| documented way to force the specific tool | 특정 도구를 강제하는 문서화된 방법 | 66 |
| suppresses natural-language text before the tool call | 강제 사용은 호출 전 자연어를 억제 | 66 |
| because forced tool selections are incompatible | 강제 선택과 비호환이므로 확장 사고 끔 | 83·103 |
| which tool should be selected and why | 모호 요청에 어떤 도구를 왜 고를지 시연 | 26 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| `any` is explicitly designed to support extended thinking | any가 확장 사고 지원용으로 설계됨 | 거짓 |
| `thinking_mode: "extended"` field directly inside the tool's `input_schema` | 스키마에 thinking_mode 추가 | 없는 동작 |
| since extended thinking is only compatible | auto로 전환 | 보장 불가 |
| while leaving tool_choice set to auto | auto인 채 경고문만 강화 | 보장 불가 |
| max_tokens on the request to a high value | max_tokens 증가 | 잘못된 인과 |
| so the model must invoke the tool | 필드를 required로 바꿔 호출 강제 | 잘못된 인과 |
| Omit the `tools` parameter and instruct Claude | tools 생략하고 프롬프트로 지시 | 보장 불가 |
| extraction tool always runs regardless of document type | 유형 무관 동일 도구만 실행 | 정반대 |
| Claude can choose to skip calling a tool | 호출을 건너뛸 수 있게 함 | 보장 불가 |
| decides whether calling a tool is appropriate | 호출 여부를 스스로 결정 | 보장 불가 |
| tool_choice cannot influence which tool Claude ultimately calls | tool_choice가 영향을 못 줌 | 거짓 |
| freely mix natural-language commentary with the forced | 강제 호출과 해설을 자유롭게 혼합 | 거짓 |
| combined with an explicit user-message instruction to use | 사용자 메시지 지시를 결합 | 보장 불가 |
| three separate parallel requests per ticket | 티켓당 3개 병렬 요청 | 비효율 |
| search_docs first and only falls back to search_code | 항상 한쪽을 먼저 호출 | 비효율 |
| adjectives that characterize its typical use cases | 형용사를 더 추가 | 비효율 |
| the two tools to be more visually distinct | 시각적으로 구별되게 개명 | 핵심 회피 |

---

## 11. XML 태그 프롬프트 구조화 (Prompt Structuring)

**해당 문제**: 32, 43

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| uniquely named XML tag, such as `<security_criteria>` | 고유 명명 XML 태그로 각 섹션 분리 | 32 |
| Wrap each example in its own example tag | 각 예시를 자체 example 태그로 감쌈 | 43 |
| whole set in an outer examples tag | 전체를 외부 examples 태그로 | 43 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| sentence structure alone will keep the categories distinct | 문장 구조만으로 구별되리라 믿음 | 보장 불가 |
| bullet order to imply which criteria belong | 글머리 순서에 의존 | 보장 불가 |
| self-contained even if it duplicates content | 중복되더라도 자족적이도록 | 비효율 |
| worked examples to the end of the prompt | 예시를 프롬프트 끝으로 이동 | 핵심 회피 |
| Rewrite each example as a short bullet point | 예시를 짧은 글머리로 축약 | 비효율 |
| examples and describe their content in a summary | 예시 제거하고 요약으로 서술 | 정반대 |

---

## 12. 오탐 관리 · 신뢰 · 평가 (False Positives, Trust & Evaluation)

**해당 문제**: 28, 41, 48, 64, 68, 75, 85, 102

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| alert fatigue | 알림 피로 | 오탐 누적 → 전체 무시 |
| undifferentiated source | 미분화된 출처 | 한 카테고리 오탐이 전체 신뢰를 훼손 |
| held-out set | 보류 평가셋 | 프롬프트 변경 후 회귀 검증 |
| dismissal rate | 기각률 | 규칙 튜닝의 신호 |
| confidence-based routing | 신뢰도 기반 분기 | 고신뢰 자동화 + 저신뢰 사람 검토 |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| so developers see only the accurate categories | 문제 카테고리만 일시 비활성화 | 102 |
| Temporarily disable the performance-suggestions category | 성능 제안 카테고리 일시 비활성화 | 48 |
| iterating on that category's prompt separately before re-enabling | 재활성화 전 별도로 프롬프트 개선 | 48 |
| high false positive rate can undermine confidence | 한 카테고리 오탐이 신뢰를 훼손 | 68 |
| all findings as coming from one undifferentiated source | 모든 결과를 하나의 출처로 체감 | 68 |
| pinpoints one over-triggering pattern so the detection rule | 과도 트리거 패턴을 특정 | 64 |
| tuned or suppressed for that construct specifically | 그 구문에 한해 조정·억제 | 64 |
| which exact rule causes a high dismissal rate | 높은 기각률의 규칙을 격리 | 28 |
| set of past pull requests with known findings | 결과가 알려진 보류 세트로 검증 | 75 |
| rate has dropped to an acceptable level | 오탐률이 수용 수준까지 하락했는지 확인 | 75 |
| with a confidence level, then auto-fix the high-confidence | 신뢰도 태깅 후 고신뢰 자동 수정 | 85 |
| local style variations and flag only deviations | 기존 로컬 변형은 무시, 이탈만 지적 | 41 |
| though it cannot eliminate all false positives | 모든 오탐을 제거할 수는 없음 | 41 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| Add a disclaimer banner on each code-review result | 면책 배너 추가 | 핵심 회피 |
| severity label on every performance finding to "informational" | 심각도를 informational로 하향 | 핵심 회피 |
| Merge the performance-suggestions category into the correctness category | 정확성 카테고리에 병합 | 정반대 |
| because they are including security findings | 오탐률을 잘못 계산 | 핵심 회피 |
| inherently harder to verify than style findings | 본질적으로 검증이 더 어려움 | 거짓 |
| mathematically dominated by the style category | 수학적으로 스타일이 지배 | 잘못된 인과 |
| developers dismiss findings at random | 무작위로 기각 | 거짓 |
| JSON schema itself has a syntax defect | 스키마 자체에 구문 결함 | 잘못된 인과 |
| automatically close every future finding across all categories | 향후 결과를 전부 자동 종결 | 절대 단정 |
| explicit rules themselves demonstrate improved precision without needing | 규칙 자체가 정밀도 향상을 입증 | 잘못된 인과 |
| single senior engineer to review the new criteria | 한 명이 수동 검토 | 보장 불가 |
| pull requests opened by the engineer who reported | 보고자의 PR에만 활성화 | 핵심 회피 |
| combine all findings into one summary paragraph | 전부 한 단락으로 합침 | 비효율 |
| only by the severity of the underlying bug | 심각도만으로 순위 | 핵심 회피 |
| quietly discard any finding it personally disagrees with | 동의하지 않는 것을 폐기 | 정반대 |
| Skip all naming-related findings across the entire codebase | 명명 관련 지적을 모두 스킵 | 핵심 회피 |
| dashboard to render without extra grouping logic | 대시보드 렌더링이 쉬움 | 비효율 |

---

## 13. 반복 출제 문항 (동일/거의 동일)

| 내용 | 문항 | 정답 요지 |
|---|---|---|
| `ship_date` 형식 다양 → 스키마 완화 + 후속 파서 | **47, 57** | 임의 문자열 허용 + 날짜 파서 정규화 |
| 성능 제안 카테고리 오탐 → 일시 비활성화 | **48, 102** | 해당 카테고리만 끄고 별도 개선 후 재배포 |
| 파일별 + 통합 패스 병행 | **25, 82** | per-file + integration 둘 다 |
| 공유 인터페이스 불일치는 통합 패스 | **3, 96** | 격리 검토로는 못 잡음 |
| 두 파일 권고 충돌 → 통합 패스가 중재 | **13, 39** | 함께 보고 단일 권고 도출 |
| 티켓 라우팅 예시에 근거 포함 | **9, 27** | 왜 그 대기열을 골랐는지 설명 |
| 보고/스킵 범주 명시 (신뢰도 임계값 아님) | **12, 50** | 보안·정확성은 보고, 포맷·로컬 관례는 스킵 |
| 확장 사고 + 강제 도구 = 비호환 | **83, 103** | 확장 사고를 비활성화 |
| 동일 세션 자기 검토 편향 | **8, 78, 81, 84** | 이력 없는 독립 인스턴스 |
| 재시도 불가 = 원본에 값 없음 | **14, 21, 22** | 사람에게 이관 |
| 재시도엔 원본 + 실패본 + 오류 설명 | **33, 52** | 셋 다 전달 |
| enum 밖 값 → 폴백 enum + 자유 텍스트 | **38, 98** | other/unclear 추가 |
| 스키마는 구문만, 의미는 후속 검증 | **16, 24, 74, 77, 93** | 산술·비즈니스 검증 별도 |
| 합계 불일치 → calculated_total 교차 검증 | **51, 77** | 두 수치 대조 후 플래그 |
| 배치 지연 SLA 무보장 | **35, 63, 86** | 실시간 용도 부적합 |
| 배치 SLA 역산 (간격 + 24h) | **7, 19, 61** | 최악 케이스가 마감 안에 들어와야 |
| 실패분만 custom_id로 재제출 | **11, 31** | 성공분은 건드리지 않음 |
| 퓨샷 3~5개 + 다양성 + 경계 사례 | **71, 97** | 개수와 다양성 둘 다 |
| 퓨샷 완성 예시로 출력 형식 고정 | **40, 70** | 필드 순서까지 보여줌 |
| null 반환 예시 포함 | **2, 104** | 값 없을 때를 시연 |
| 서브에이전트는 prompt만 받음 | **37, 58** | 맥락을 명시적으로 작성 |
| 도구 강제 호출 | **59, 65, 99, 100, 101** | `any` (자율 선택) vs `tool` (특정 고정) |
| 기각률 분석용 범주형 필드 | **28, 64, 89** | 어떤 규칙·구문이 유발했는지 기록 |

---

## 14. 시험 직전 30초 복습

1. **여유 마감 + 대량 = 배치(50% 할인)**. **즉시 응답이 필요 = 동기**. 배치는 **지연 SLA 무보장**.
2. **배치 역산**: 제출 간격 + 24시간 + 후처리 ≤ 마감. **결과는 순서 미보장 → `custom_id`로 매칭**, 실패분만 재제출.
3. **배치 한도 = 100,000건 또는 256MB**. `custom_id` = 영숫자·`-`·`_`, 64자. **클라이언트 도구는 배치 불가, 서버 도구는 가능**.
4. **퓨샷은 3~5개 + 다양성 + 경계 사례 + 근거**. 예시 편중 = 편향, 20개 = 암기. **null 사례와 대조 쌍을 넣는다**.
5. **`highly confident`·신뢰도 점수 임계값은 거의 항상 오답**. 검증 가능한 범주 기준 + **스킵 대상까지** 명시.
6. **값이 없을 수 있으면 optional+nullable**, **enum 밖이면 `other`/`unclear` + 자유 텍스트**. 필수 강제 = 환각.
7. **스키마는 구조·타입만 보장**. 산술·의미·비즈니스는 **후속 검증 로직**. "구조는 맞는데 값이 틀림" = 스키마 밖.
8. **배치·형식 오류는 피드백 재시도로 해결**. **원본에 없거나 충돌하면 재시도 불가 → 사람에게**. 재시도엔 **원본+실패본+오류 설명** 전부.
9. **파일 간 인터페이스·데이터 흐름 = 통합 패스**, 파일 내 구문 = 파일별 패스. 대규모는 **둘 다**.
10. **자기 검토는 확증 편향** → 이력 없는 독립 인스턴스에 **원본 diff 그대로**. 서브에이전트는 **prompt만 받으므로** 맥락을 명시. 검토 전용은 **읽기 전용 도구만**.
11. **도구 강제 = `any`**(선택은 자율) / **특정 고정 = `{"type":"tool","name"}`**. **확장 사고는 `any`·`tool`과 비호환** → 강제가 요구면 확장 사고를 끈다.
