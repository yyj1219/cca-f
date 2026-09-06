# Tool Design & MCP Integration — 학습용 핵심 요약 노트

모의시험 85문항(01–85) 기반.

**사용법**: "문제 신호"로 지문 키워드를 잡고 → "정답 키워드"를 고르고 → "함정 키워드"는 버린다.
모든 키워드는 **보기 원문에서 그대로 뽑은 8단어 이내 조각**이다. 이것만 눈에 들어와도 정답/오답이 갈린다.

---

## 0. 5초 판별 치트시트 (Decision Cheatsheet)

| 지문에 이게 보이면 | 정답은 이 방향 |
|---|---|
| both share the description / near-duplicate descriptions (설명이 거의 같음) | 설명을 차별화 — 개명 + 재작성 |
| routes roughly half of tasks to the wrong tool (도구 오선택) | 입력 형식 + 예시 쿼리 + 다른 도구 안내 |
| tools clearly outside their remit (역할 밖 도구) | 그 도구를 목록에서 제거 (Least Privilege) |
| declining tool-selection accuracy as tools were added (도구 과다) | 역할별 서브에이전트 분할 (각 4–5개) |
| a generic tool the model frequently misuses (범용 도구 오용) | 제약된 도구로 교체 (검증된 입력만) |
| never attempt this exact call again (재시도 금지) | `errorCategory: "business"` + `isRetryable: false` |
| the request body is missing a required field (필수 필드 누락) | `validation` + `isRetryable: false` (transient 아님) |
| throttles requests with a 429 response (일시 장애) | `transient` + `isRetryable: true` |
| calls it using a token scoped only to read (권한 부족) | `permission` + `isRetryable: false` |
| the query executes successfully but zero tickets match (결과 0건) | `isError: false` + 빈 결과 배열 |
| a customer ID that does not exist (없는 ID) | `isError: true` + `not_found_error` |
| before the tool's handler logic even runs (핸들러 실행 전) | JSON-RPC 프로토콜 에러 (-32602) |
| must never return free-text commentary (산문 응답 금지) | `tool_choice: {"type":"any"}` |
| immediately as the very first action (첫 턴 고정) | `{"type":"tool", name}` → 이후 `auto` |
| while manual extended thinking is enabled (확장 사고) | `any`/`tool` 미지원 → `auto`/`none` |
| available whenever they open any project (모든 프로젝트) | user scope → `~/.claude.json` |
| only within the one project they're prototyping in | local scope |
| the config must be checked into the repo (팀 공유) | project scope + `${ENV_VAR}` 치환 |
| clones a team repository that includes .mcp.json | pending approval (명시적 승인) |
| affecting the entire file rather than a few lines | Read → `Write` 한 번에 |
| appears twice in the same file (중복 매칭 실패) | `Edit` + `old_string` 문맥 확대 |
| only a list of matching file paths is needed | `Glob` |
| find every place in a codebase that calls | `Grep` |
| concatenating a string literal across two lines | `Grep` + multiline 모드 |
| capture its stdout and stderr, including the stack trace | `Bash` |
| many exploratory search-tool calls just to figure out | MCP Resource로 카탈로그 노출 |

**만능 오답 패턴 (거의 항상 함정)**

| 원문 조각 | 한국어 |
|---|---|
| lowering it to a more focused value like 0.2 | 온도를 낮춤 |
| increase the model's sampling temperature | 온도를 높임 |
| raise its max_tokens limit so it has more room | 토큰 상한 증가 |
| increase the tool-call timeout on the server | 타임아웃 증가 |
| declared in the wrong order in the tools array | 배열 순서 문제 |
| sort the tools alphabetically in the tools array | 알파벳 정렬 |
| the context window is too small to hold both | 컨텍스트 부족 탓 |
| shorten the description further so the model spends less time | 설명을 더 줄임 |
| a catchy tool name paired with an emoji | 이모지로 구별 |
| ask users to specify the tool by internal ID | 매번 사용자가 ID 지정 |
| remove the capability from the pipeline entirely | 기능 자체를 제거 |
| combine both tools into one and pass a flag | 도구를 하나로 합침 |
| always / never / only / the sole ... | 절대 단정어 |

---

## 1. 도구 설명 & 이름 설계 (Tool Description & Naming)

**해당 문제**: 4, 7, 10, 21, 22, 25, 36, 37, 45, 47, 50, 56, 74, 75, 78, 79, 80, 84

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| tool description | 도구 설명 | 모델이 도구를 고르는 **주된 근거** |
| differentiating signal | 구별 신호 | 유사 도구 간 판단 기준 |
| near-duplicate descriptions | 거의 중복된 설명 | 오선택의 **1순위 원인** |
| expected input format | 기대 입력 형식 | 인자 오류 방지 |
| example query | 예시 쿼리 | Few-shot 효과 |
| boundary behavior | 경계 동작 | 어디까지 되고 안 되는지 |
| out of scope | 범위 밖 | "이건 이 도구가 못 함"을 명시 |
| narrow contract | 좁은 계약 | 도구 하나 = 기능 하나 |
| keyword association | 키워드 연관 | 프롬프트 단어가 도구명과 엮여 편향 |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| one or two example queries the tool handles | 도구가 처리하는 예시 쿼리 1~2개 | 4 |
| a note on when to prefer the other tool | 언제 다른 도구를 선호할지에 대한 메모 | 4 |
| give the model no differentiating signal | 모델에게 구별 신호를 주지 않음 | 10 |
| descriptions are its main basis for choosing similar tools | 설명이 유사 도구 선택의 주된 근거 | 10 |
| explain what it returns and when it beats text search | 무엇을 반환하고 언제 텍스트 검색보다 나은지 설명 | 21 |
| the exact category of issue each tool detects | 각 도구가 잡아내는 정확한 이슈 범주 | 22 |
| an example phrase associated with each one | 각각에 연관된 예시 문구 | 22 |
| rename to a more specific name, such as summarize_pasted_text | 더 구체적 이름으로 개명 | 25 |
| limit its description to pasted text only | 설명을 붙여넣은 텍스트로만 한정 | 25 |
| rename the general tool to reflect its remaining scope | 범용 도구를 남은 범위에 맞게 개명 | 36·56 |
| exclude the case the newer tool now handles | 신규 도구가 맡은 케이스를 제외 | 36·56 |
| name the specific fields it returns | 반환하는 구체적 필드를 명시 | 45 |
| such as display name versus roles and access scopes | 표시명 vs 역할·접근 범위처럼 | 45 |
| returns public market data only | 공개 시장 데이터만 반환 | 47 |
| cannot access private account or user-specific information | 개인 계정·사용자별 정보는 접근 불가 | 47 |
| state that translate_text does direct translation only | 한쪽은 직역만 수행함을 명시 | 50 |
| mention currency and culture | 통화와 문화까지 조정함을 언급 | 50 |
| state the input format, include an example query | 입력 형식 명시 + 예시 쿼리 포함 | 74 |
| note historical lookups are out of scope | 과거 조회는 범위 밖임을 명시 | 74 |
| state the expected input type | 기대 입력 타입을 명시 | 75 |
| add a note on when the other tool applies | 다른 도구가 적용되는 시점 메모 추가 | 75 |
| establish a description template requiring tools to state | 도구 설명 템플릿을 표준으로 수립 | 78 |
| state output granularity, an example query | 출력 상세도 + 예시 쿼리 명시 | 78 |
| how they differ from similar ones | 유사 도구와 어떻게 다른지 | 78 |
| omits the expected input format and boundary behavior | 기대 입력 형식과 경계 동작을 누락 | 79 |
| which fields are valid and whether partial updates work | 어떤 필드가 유효한지·부분 수정 가능 여부 | 79 |
| state its specific trigger condition | 고유한 실행 트리거 조건을 명시 | 80 |
| note explicitly when to use the other tool instead | 언제 다른 도구를 쓸지 명시적으로 기재 | 80 |
| split the tool into three, each with a narrow contract | 좁은 계약을 가진 셋으로 분할 | 84 |
| creates an unintended association | 의도치 않은 연관을 만들어냄 | 7 |
| overrides the more accurate tool description | 더 정확한 도구 설명을 덮어씀 | 7 |
| explicit instructions may override the model's assessment | 명시적 지시가 모델 판단을 덮어쓸 수 있음 | 37 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| a catchy tool name paired with an emoji | 캐치한 이름 + 이모지 | 시각 요소는 판단과 무관 |
| so it appears visually distinct within the tool list | 목록에서 시각적으로 구별되도록 | 의미 판단 아님 |
| an exhaustive list of every possible parameter combination | 가능한 모든 파라미터 조합 나열 | 언제 쓸지 없음 |
| without any narrative explanation of intended use | 의도된 사용에 대한 서술 설명 없이 | 맥락 부재 |
| the name of the engineer who implemented the tool | 도구를 구현한 엔지니어 이름 | 완전 무관 |
| its internal implementation language choice | 내부 구현 언어 선택 | 완전 무관 |
| declared in the wrong order in the tools array | tools 배열에 잘못된 순서로 선언 | 순서는 영향 없음 |
| the context window is too small to hold both | 두 정의를 담기엔 컨텍스트가 작음 | 원인 아님 |
| the fix belongs in the user's prompt | 해결책은 사용자 프롬프트에 있음 | 책임 전가 |
| rename the tool from find_symbol_usages to grep | 이름만 grep으로 변경 | 설명 미수정 |
| so the agent recognizes it as a drop-in upgrade | 대체 업그레이드로 인식하도록 | 근거 없음 |
| rename both to have identical names with a version suffix | 버전 숫자 접미사만 다르게 | 구별 안 됨 |
| change the tool's name to a random unique string | 무작위 고유 문자열로 개명 | 의미 상실 |
| remove Grep from the built-in tools entirely | 내장 Grep을 아예 제거 | 과격한 기능 제거 |
| set the permission mode to require manual approval | 매 호출 수동 승인 요구 | 선택 정확도와 무관 |
| shorten the description further so the model spends less time | 설명을 더 짧게 | 정반대 방향 |
| delete the description text from both tools | 두 도구의 설명 텍스트 삭제 | 정반대 방향 |
| rely entirely on tool names for disambiguation | 이름만으로 구별하도록 | 정반대 방향 |
| merge both tools and let the model pass a boolean flag | 하나로 합치고 불린 플래그 | 모호성 유지 |
| add a required mode enum but leave the description unchanged | mode enum 추가하되 설명은 그대로 | 핵심 미해결 |
| increase the priority weight in the backend routing configuration | 백엔드 라우팅 가중치 상승 | 존재하지 않는 기능 |
| without touching either tool's description | 어느 설명도 건드리지 않고 | 핵심 회피 |
| ask users to specify which tool by internal ID | 사용자가 내부 ID로 지정 | 도구 선택 포기 |
| instruct every client to hardcode which tool to call | 클라이언트가 호출 도구 하드코딩 | 도구 선택 포기 |
| add a longer paragraph of promotional wording | 더 긴 홍보성 문단 추가 | 구별 신호 아님 |
| add a short delay before escalate_ticket executes | 실행 전 짧은 지연 추가 | 무의미 |
| increase the model's sampling temperature | 샘플링 온도 상승 | 만능 오답 |
| cap the number of tools available at two | 도구를 2개로 제한 | 문제 회피 |
| add a private boolean parameter without altering the description | 설명 수정 없이 파라미터만 추가 | 핵심 미해결 |
| the only way a tool can be excluded from selection | 도구가 배제되는 유일한 방법 | 절대 단정 |
| always takes absolute priority over any other tool | 다른 도구보다 항상 절대 우선 | 절대 단정 |
| always call both tools together on every issue | 매번 두 도구를 함께 호출 | 낭비 |
| resources are inherently immune to selection ambiguity | 리소스는 본질적으로 모호성 면역 | 거짓 |

---

## 2. 도구 범위 제한 & 최소 권한 (Tool Scoping / Least Privilege)

**해당 문제**: 6, 9, 13, 17, 19, 28, 49, 51, 60, 77

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| principle of least privilege | 최소 권한 원칙 | 역할에 필요한 최소 도구만 부여 |
| scoped tool access | 범위 지정 도구 접근 | 역할별 도구 세트 분리 |
| specialization | 전문화 | 에이전트 하나 = 역할 하나 |
| limited cross-role tools | 제한된 역할 간 도구 | 좁은 도구 1개만 예외 허용 |
| constrained alternative | 제약된 대안 | 검증된 입력만 받는 도구 |
| decision complexity | 결정 복잡도 | 도구 수 ↑ → 선택 정확도 ↓ |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| agents tend to misuse tools outside their specialization | 전문 분야 밖 도구는 오용되는 경향 | 6 |
| when given access to them | 접근 권한이 주어지면 | 6 |
| tools beyond an agent's specialization tend to get misused | 전문 영역 밖 도구는 오용됨 | 19 |
| should be removed from the synthesis agent's tool set | 해당 에이전트의 도구 세트에서 제거 | 6 |
| restricting the review agent to the read-only tools | 읽기 전용 도구로 제한 | 19 |
| only a narrow check_status tool for that specific need | 그 요구에만 국한된 좁은 check_status 도구 | 9 |
| while routing deeper operations through the processing agent | 깊은 작업은 원 담당 에이전트 경유 | 9 |
| a narrow verify_fact tool for quick single-claim checks | 단일 주장 확인용 좁은 verify_fact 도구 | 51 |
| refer cases with conflicting sources to the coordinator | 출처가 충돌하면 코디네이터에 위임 | 51 |
| restrict each subagent's tool set to only what its role needs | 역할에 필요한 도구만 남김 | 13 |
| while keeping tool_choice at auto | tool_choice는 auto로 유지 | 13 |
| exposed to only the 4-5 tools relevant to its role | 역할 관련 4~5개 도구만 노출 | 28 |
| discriminates among a much smaller candidate set | 훨씬 작은 후보군에서 판별 | 60 |
| directly reduces the decision complexity | 결정 복잡도를 직접 감소시킴 | 60 |
| validates the URL against an allowed document source | URL을 허용된 문서 출처와 대조 검증 | 17 |
| only accepts a validated clause identifier | 검증된 조항 식별자만 수용 | 49 |
| from a pre-parsed clause index | 사전 파싱된 조항 인덱스에서 | 49 |
| so it only has route_ticket | route_ticket만 남기도록 | 77 |
| matching its single core routing function | 단일 핵심 라우팅 기능에 부합 | 77 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| lowering it to a more focused value like 0.2 | 0.2 같은 값으로 온도 낮춤 | 확률적 미봉책 |
| rewriting it with guidance that it should not be used | 쓰지 말라는 지침을 설명에 기재 | 지시는 우회 가능 |
| a stronger instruction telling it never to deploy | 절대 배포 말라는 강한 지시 | 보장 불가 |
| while keeping all five tools available | 다섯 도구를 모두 남긴 채 | 원인 미제거 |
| add stricter JSON schema validation on its parameters | 파라미터에 더 엄격한 스키마 검증 | 근본 원인 아님 |
| should be given even more tools | 도구를 더 많이 부여해야 함 | 정반대 |
| so it becomes just one option among many | 여럿 중 하나가 되도록 희석 | 정반대 |
| give the intake agent the processing agent's full tool set | 전체 도구 세트를 부여 | 과도한 권한 |
| remove status checking from the pipeline | 상태 확인을 파이프라인에서 제거 | 유용성 파괴 |
| give the processing agent a copy of the tool | 엉뚱한 쪽에 도구 사본 부여 | 요구와 불일치 |
| keep the shared 15-tool set for all subagents | 15개 공유 세트를 그대로 유지 | 원인 미해결 |
| force every subagent's tool_choice to a single named tool | 모든 턴을 단일 도구로 고정 | 판단력 상실 |
| add a second agent to double-check the byte ranges | 검증용 에이전트 추가 | 근본 해결 아님 |
| double the number of example byte-offset calls | 예시 호출 수를 두 배로 | 무의미 |
| also adding a raw_file_read tool so it can cross-check | 대조용 파일 직접 읽기 추가 | 권한 확대 |
| require a human to paste document contents | 사람이 문서 내용을 붙여넣게 함 | 자동화 포기 |
| add a second, identical tool named fetch_url_v2 | 동일한 도구 v2를 추가 | 모호성 증가 |
| add a human approval step before process_refund executes | 실행 전 사람 승인 단계 추가 | 애초에 없어야 함 |
| so the agent treats it as a routing alias | 라우팅 별칭으로 취급하도록 | 실제 동작은 그대로 |
| caches tool results across subagents | 서브에이전트 간 결과 캐싱 | 잘못된 인과 |
| reduces the total number of API calls | API 호출 총량을 감소 | 잘못된 인과 |
| a smaller context window forces more careful thinking | 작은 컨텍스트가 신중함을 강제 | 잘못된 인과 |

---

## 3. MCP 오류 설계 (Structured Errors)

**해당 문제**: 1, 11, 27, 29, 30, 31, 34, 42, 46, 63, 68, 72

### 에러 카테고리 대조표 (최중요)
| errorCategory | 한국어 | isRetryable | 대표 사례 |
|---|---|---|---|
| `business` | 비즈니스 규칙 위반 | **false** | 30일 환불 기간 경과, 리걸 홀드 |
| `validation` | 입력 검증 실패 | **false** | 필수 `sku`·`customer_id` 누락 |
| `permission` | 권한 부족 | **false** | `read` 토큰으로 `deploy` 호출 |
| `transient` | 일시적 오류 | **true** | 429 rate limit, 503, 타임아웃 |
| `not_found_error` | 대상 없음 | (false) | 존재하지 않는 customer ID |

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| text block + structured metadata | 텍스트 블록 + 구조화 메타데이터 | **둘 다** 필요 |
| human-readable description | 사람이 읽을 수 있는 설명 | 자연어 설명을 가능케 함 |
| `isError: true` | 도구 실행 오류 | 도구 결과 안의 에러 |
| JSON-RPC protocol error (-32602) | 프로토콜 수준 오류 | **핸들러 실행 전** 스키마 검증 |
| empty result set | 빈 결과 집합 | 에러가 **아님** |
| bounded backoff | 제한된 백오프 | 에이전트가 스스로 상한 적용 |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| structured metadata including errorCategory "business" | business 카테고리를 포함한 구조화 메타데이터 | 1 |
| to indicate a business rule violation | 비즈니스 규칙 위반을 나타내기 위해 | 1 |
| a human-readable description field stating the room is booked | 사람이 읽을 수 있는 설명 필드 | 11 |
| separate from any machine-oriented errorCategory or isRetryable flags | 기계용 플래그와는 별개로 | 11 |
| a validation error, not a transient one | 일시적 오류가 아닌 검증 오류 | 27 |
| causes the agent to resend an identically malformed request | 동일하게 잘못된 요청을 재전송하게 함 | 27 |
| retrying the same request will not succeed | 같은 요청 재시도는 성공하지 못함 | 63 |
| the agent must correct the input before retrying | 재시도 전에 입력을 수정해야 함 | 63 |
| a JSON-RPC protocol error from schema validation | 스키마 검증에서 나온 프로토콜 에러 | 29 |
| before the tool executes | 도구가 실행되기 전에 | 29 |
| a declined charge is reported inside the tool result | 승인 거절은 도구 결과 안에서 보고 | 29 |
| a successful query with no matches is not an error | 매칭 없는 성공 쿼리는 오류가 아님 | 30 |
| structured content showing an empty results array | 빈 결과 배열을 담은 구조화 콘텐츠 | 30 |
| the zero-orders case returns isError:false with an empty array | 0건은 isError:false + 빈 배열 | 34 |
| the nonexistent-ID case returns errorCategory not_found_error | 없는 ID는 not_found_error | 34 |
| carries no structured metadata distinguishing transient from non-retryable | 일시적/비재시도를 구분할 메타데이터 없음 | 42 |
| no basis for deciding whether retrying is worthwhile | 재시도할 가치가 있는지 판단할 근거 없음 | 42 |
| resubmitting with the same token will fail identically | 같은 토큰으로 재제출하면 동일하게 실패 | 46 |
| until the caller's scope changes | 호출자의 스코프가 바뀌기 전까지 | 46 |
| no basis for choosing among retrying, adjusting input, or escalating | 재시도·입력 수정·에스컬레이션 중 선택 불가 | 68 |
| letting the agent apply its own bounded backoff strategy | 에이전트가 자체 제한 백오프 전략 적용 | 72 |
| the request itself is well-formed | 요청 자체는 형식이 올바름 | 31 |
| a policy rule about the account's state | 계정 상태에 관한 정책 규칙 | 31 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| telling the agent to wait 30 seconds and resubmit | 30초 기다린 후 재전송하라고 지시 | 영원히 실패할 요청 반복 |
| a description asking the customer to contact their administrator | 관리자에게 연락하라는 설명 | 상황과 무관 |
| a bare text block reading "Refund denied" | "환불 거부"라고만 적힌 맨 텍스트 | 판단 근거 없음 |
| with no structured metadata | 구조화 메타데이터 없이 | 판단 근거 없음 |
| returning the raw exception stack trace | 원시 예외 스택 트레이스 반환 | 파싱을 강요 |
| so the agent can extract it using text parsing | 텍스트 파싱으로 추출하도록 | 파싱을 강요 |
| until the room becomes free on its own | 방이 저절로 빌 때까지 | 무한 재시도 |
| omitting the description field entirely | 설명 필드를 전부 생략 | 자연어 설명 필요 |
| errorCategory alone is sufficient for the agent | 카테고리만으로 충분함 | 거짓 |
| validation errors are inherently transient | 검증 오류는 본질적으로 일시적임 | 거짓 |
| the categorization is correct as written | 작성된 그대로가 올바름 | 오분류 방치 |
| repeated retries are the expected and desired behavior | 반복 재시도가 기대되는 동작 | 오분류 방치 |
| must always be surfaced at the protocol layer | 항상 프로토콜 계층에서 드러나야 함 | 절대 단정 |
| there is no standard errorCategory or isRetryable field | 표준 필드가 아니라 무시될 수 있음 | 그럴듯한 함정 |
| the client silently coerces the malformed argument to a number | 클라이언트가 몰래 숫자로 형변환 | 없는 동작 |
| both failures are reported identically as JSON-RPC errors | 두 실패를 동일한 프로토콜 에러로 | 계층 구분 실패 |
| protocol errors are reserved for unknown tool names | 프로토콜 에러는 미지의 도구명 전용 | 거짓 |
| change errorCategory to transient so the agent automatically retries | 자동 재시도하도록 transient로 변경 | 무한 재시도 |
| until a ticket eventually appears | 티켓이 결국 생길 때까지 | 무한 재시도 |
| omit the results array entirely, letting the agent infer | 결과 배열을 생략하고 추론하게 함 | 추론 강요 |
| the context window ran out of space to store the error | 오류 저장 공간이 부족했음 | 잘못된 원인 |
| signals to the agent that unlimited retries are correct | 무제한 재시도가 옳다는 신호 | 거짓 |
| pushes the block beyond the maximum content length | 최대 콘텐츠 길이를 초과함 | 없는 규격 |
| the specification requires a machine-parseable stack trace | 규격이 스택 트레이스를 요구함 | 없는 규격 |
| functionally the same kind of policy rule as a refund window | 환불 기간과 기능적으로 같은 정책 규칙 | 근접 오답 |
| the token itself is a malformed input field | 토큰 자체가 잘못된 입력 필드임 | 잘못된 분류 |
| a retry with backoff can resolve it | 백오프 재시도로 해결 가능 | 잘못된 분류 |
| any rejection after initial schema checks indicates the input | 스키마 검사 후 거절은 입력 문제 | 잘못된 분류 |

---

## 4. 서브에이전트 오류 보고 & 에스컬레이션 (Error Propagation)

**해당 문제**: 2, 12, 38, 62, 65

### 핵심 규칙
| 상황 | 한국어 | 처리 |
|---|---|---|
| resolved locally | 로컬에서 해결됨 | **성공으로 보고** — 위로 안 올림 |
| retry limit exhausted | 재시도 한도 소진 | **실패 전파** + 카테고리·미완료 범위 |
| partial results + reported error | 부분 결과 + 오류 보고 | **부분 결과 활용** + 핀포인트 조치 |
| crashes with no output at all | 출력 없이 충돌 | **전체 미처리로 간주** |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| the coordinator can use the partial results | 코디네이터는 부분 결과를 활용할 수 있음 | 2 |
| address the specific reported permission gap | 보고된 특정 권한 문제만 조치 | 2 |
| lacking completed work or diagnostic detail | 완료된 작업도 진단 정보도 없음 | 2 |
| must treat the entire folder as unprocessed | 폴더 전체를 미처리로 간주해야 함 | 2 |
| the 47 enriched records as partial results | 47건을 부분 결과로 | 12 |
| plus a report naming the 3 unresolved customers | 미해결 3건을 명시한 보고 추가 | 12 |
| the permission error encountered, and what was attempted | 발생한 권한 오류와 시도 내역 | 12 |
| the transient failures were resolved locally | 일시적 실패가 로컬에서 해결됨 | 38·65 |
| never needed to surface above the subagent | 서브에이전트 위로 올릴 필요가 없었음 | 38·65 |
| stop retrying and propagate the failure to the coordinator | 재시도를 멈추고 실패를 코디네이터에 전파 | 62 |
| that timeouts persisted across the allowed local attempts | 허용된 로컬 시도 내내 타임아웃 지속 | 62 |
| and what text remained untranslated | 미번역으로 남은 텍스트 범위 | 62 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| treat both subagent 2 and subagent 3 identically | 둘을 동일하게 처리 | 상황 차이 무시 |
| discarding any partial results from subagent 2 | 부분 결과를 폐기 | 자원 낭비 |
| assuming subagent 3's crash was also due to permission | 충돌 원인도 권한 문제라고 가정 | 위험한 추측 |
| since that is the most common cause | 그것이 가장 흔한 원인이므로 | 근거 없는 추정 |
| ignore the reported permission error and mark it complete | 보고된 오류를 무시하고 완료 표시 | 데이터 누락 |
| since most files were indexed successfully | 대부분 성공적으로 인덱싱됐으므로 | 데이터 누락 |
| an isError: true result for the entire batch | 배치 전체를 오류 결과로 | 성공분 폐기 |
| silently dropping the 3 failures | 실패 3건을 조용히 누락 | 은폐 |
| keeps calling with the same credentials | 같은 자격 증명으로 계속 호출 | 무한 재시도 |
| continue retrying indefinitely at the subagent level | 서브에이전트에서 무한정 재시도 | 한도 없음 |
| logging each attempt and resetting the retry count | 시도를 기록하고 횟수를 초기화 | 한도 무력화 |
| silently return a fabricated translation | 조작된 번역을 조용히 반환 | 최악의 선택 |
| using a cached fallback response from a prior call | 이전 호출의 캐시된 대체 응답 사용 | 결과 조작 |
| immediately reclassify the error as a permission failure | 즉시 권한 실패로 재분류 | 잘못된 분류 |
| an escalation asking for new database credentials | 새 DB 자격 요청 에스컬레이션 | 불필요한 에스컬레이션 |
| omitting the load step entirely since it initially failed | 처음 실패했으므로 load 단계 생략 | 성공분 누락 |

---

## 5. tool_choice 제어

**해당 문제**: 13, 14, 33, 41, 43, 53, 59

### 값 대조표
| 값 | 한국어 | 동작 |
|---|---|---|
| `{"type":"auto"}` | 자동 (기본값) | 턴마다 호출 여부를 모델이 결정 |
| `{"type":"any"}` | 아무거나 (강제) | **반드시 하나는 호출**, 산문 응답 금지 |
| `{"type":"tool","name":X}` | 특정 도구 강제 | 지정한 그 도구를 호출 |
| `{"type":"none"}` | 호출 금지 | 도구를 전혀 호출하지 않음 |

**확장 사고 제약**: manual extended thinking 시 `any`·`tool` **미지원** → `auto`/`none`만 가능. 강제 호출이 필요하면 **adaptive thinking으로 이전**하거나 manual thinking을 끈다.

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| the model must select and call at least one tool | 최소 하나의 도구를 반드시 선택·호출 | 14 |
| it requires the model to call one of the provided tools | 제공된 도구 중 하나를 호출하도록 요구 | 43 |
| rather than reply in prose | 산문으로 답하는 대신 | 43 |
| without pinning it to a specific one | 특정 도구 하나로 고정하지 않고 | 59 |
| for the first turn only, then switch to auto | 첫 턴에만, 이후 auto로 전환 | 33 |
| on the turn where metadata is needed | 메타데이터가 필요한 그 턴에 | 41 |
| then let the model choose with auto or any afterward | 이후에는 auto나 any로 모델이 선택 | 41 |
| restrict the tool set to only what its role needs | 역할에 필요한 도구만으로 제한 | 13 |
| so each agent still decides per turn | 각 에이전트가 여전히 턴마다 결정 | 13 |
| any and tool are not supported | any와 tool은 지원되지 않음 | 53 |
| migrate to adaptive thinking, or disable manual extended thinking | adaptive thinking으로 이전하거나 manual을 끔 | 53 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| none, since it disables prose generation | none이 산문 생성을 비활성화하므로 | 정반대 |
| forces structured output by default | 기본적으로 구조화 출력을 강제 | 거짓 |
| auto, since it is the default and applies whenever tools are present | 기본값이고 도구가 있으면 적용되므로 | 산문 응답 가능 |
| forcing a fixed response-generation tool each turn | 매 턴 고정 응답 도구를 강제 | 요구와 불일치 |
| forces the same tag every time regardless of content | 내용과 무관하게 매번 같은 태그 강제 | 조건 위배 |
| leaving tool_choice unset while adding a system prompt instruction | 미설정 + 프롬프트 지시 추가 | 보장 불가 |
| a system prompt instruction to always respond with a tool call | 항상 도구 호출로 답하라는 지시 | 보장 불가 |
| order create_profile first in the tools array | 배열에서 첫 번째로 배치 | 순서는 보장이 아님 |
| use none for the first turn so it cannot call any tool | 첫 턴에 아무 도구도 못 부르게 | 요구와 정반대 |
| relying on its training to choose extract_metadata first | 훈련에 의존해 먼저 선택하길 기대 | 보장 없음 |
| remove the enrichment tools on the first turn | 첫 턴에 보강 도구들을 제거 | 과도하게 복잡 |
| then re-add them for subsequent turns | 이후 턴에 다시 추가 | 과도하게 복잡 |
| keep tool_choice set to auto throughout the conversation | 대화 내내 auto 유지 | guarantee 조건 위배 |
| extended thinking disables all tool_choice options | 확장 사고가 모든 옵션을 비활성화 | 거짓 |
| any requires at least two tools to be defined | any는 도구 2개 이상을 요구 | 없는 규칙 |
| any is deprecated; replace it with forced | any는 폐기됨, forced로 교체 | 없는 값 |

---

## 6. MCP 설정 스코프 & 보안

**해당 문제**: 5, 8, 15, 16, 18, 23, 24, 35, 40, 44, 54, 64, 67, 70, 71, 76, 81, 82

### 스코프 대조표 (최중요)
| 스코프 | 한국어 | 저장 위치 | 공유 | 적용 범위 |
|---|---|---|---|---|
| **local** | 로컬 | `~/.claude.json`의 **그 프로젝트 경로 아래** | 안 됨 | **그 프로젝트만** |
| **user** | 사용자 | `~/.claude.json` | 안 됨 | **그 머신의 모든 프로젝트** |
| **project** | 프로젝트 | `.mcp.json` (git 커밋) | **팀 공유** | 그 프로젝트 |

**우선순위**: 이름 충돌 시 **local > project**. 병합되지 않고 하나가 이긴다.

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| `${VAR}` | 환경 변수 치환 | 비밀값 커밋 없이 각자 환경에서 주입 |
| `${VAR:-default}` | 기본값 치환 | 변수 미설정 시 default 문자열 사용 |
| `CLAUDE_PROJECT_DIR` | 프로젝트 디렉터리 | Claude Code가 스폰된 서버 환경에 **직접 주입** |
| pending approval | 승인 대기 | 클론한 `.mcp.json` 서버는 명시적 승인 필요 |
| `headersHelper` | 헤더 헬퍼 | 연결마다 스크립트 실행 → **stdout 헤더 JSON** |
| `alwaysLoad: true` | 항상 로드 | 세션 시작 시 컨텍스트에 로드 |
| reserved built-in name | 예약된 내장 이름 | `computer-use` 등은 사용 불가 |
| `list_changed` | 목록 변경 알림 | 자동 새로고침 트리거 |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| user scope so the entry is written to ~/.claude.json | user 스코프 → ~/.claude.json에 기록 | 5·40 |
| loads across every project on that machine | 그 머신의 모든 프로젝트에서 로드 | 5·40 |
| without being shared | 공유되지 않으면서 | 5·40 |
| local scope, since it stores it under that project's path | local 스코프 — 그 프로젝트 경로 아래 저장 | 71 |
| and stays private to the individual who added it | 추가한 개인에게만 비공개로 유지 | 71 |
| set the header to Authorization: Bearer ${GITHUB_TOKEN} | 헤더를 환경 변수 치환으로 설정 | 67 |
| so each teammate's environment supplies the value at connection | 각 팀원 환경이 연결 시 값을 제공 | 67 |
| local scope takes precedence over project scope when names collide | 이름 충돌 시 local이 project보다 우선 | 23 |
| and the two entries are not merged | 두 항목은 병합되지 않음 | 23 |
| Claude Code injects it into the spawned server's environment | 스폰된 서버 환경에 직접 주입함 | 18 |
| though a default like ${CLAUDE_PROJECT_DIR:-.} remains safer | 기본값을 쓰는 편이 더 안전하지만 | 18 |
| the ${VAR:-default} syntax falls back to the default | 변수 미설정 시 기본값으로 폴백 | 64 |
| it appears as pending approval | 승인 대기 상태로 표시됨 | 81 |
| require the contributor to explicitly approve them | 기여자의 명시적 승인을 요구 | 81 |
| because computer-use is a reserved built-in name | computer-use는 예약된 내장 이름이므로 | 8 |
| Claude Code rejects or skips the server | 서버를 거부하거나 건너뜀 | 8 |
| a script that generates the token | 토큰을 생성하는 스크립트 | 70·82 |
| writes the resulting header JSON to stdout | 결과 헤더 JSON을 stdout으로 출력 | 70·82 |
| set alwaysLoad: true on that server's entry | 그 서버 항목에 alwaysLoad: true 설정 | 35 |
| so its tools load into context at session start | 세션 시작 시 컨텍스트에 로드되도록 | 35 |
| automatically refresh the tools after receiving list_changed | list_changed 수신 후 도구 자동 새로고침 | 15·16 |
| making the new tool usable without a disconnect | 연결 해제 없이 신규 도구 사용 가능 | 15·16 |
| tools from all three servers are available simultaneously | 세 서버의 도구를 동시에 사용 가능 | 24 |
| within the same turn as needed | 같은 턴 안에서 필요한 대로 | 24 |
| type an @ mention in the prescribed form | 규정된 형식의 @멘션을 입력 | 44 |
| expose an issue-summary catalog as an MCP resource | 이슈 요약 카탈로그를 MCP 리소스로 노출 | 54 |
| so the agent can see available issues up front | 에이전트가 미리 전체를 파악하도록 | 54 |
| adopt an existing community or vendor Jira MCP server | 기존 커뮤니티·벤더 서버를 채택 | 76 |
| reserve custom server work for the team-specific pipeline | 커스텀 작업은 사내 전용 파이프라인에만 | 76 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| stays private until the developer marks it as personal-only | 개인 전용 표시 전까지 비공개 | 존재하지 않는 옵션 |
| local scope so the entry is written to .mcp.json | local인데 .mcp.json에 기록 | 저장 위치 오류 |
| but excluded from git tracking via a .gitignore rule | gitignore로 git 추적 제외 | 프로젝트에 묶임 |
| add the server directly inside .claude/settings.json | settings.json에 직접 추가 | 표준 경로 아님 |
| because .mcp.json is checked into version control | 버전 관리에 포함되므로 | 우선순위 반대 |
| and therefore always overrides personal entries | 그러므로 항상 개인 항목을 덮어씀 | 거짓 |
| both definitions are merged field by field | 두 정의가 필드별로 병합됨 | 거짓 |
| treats a duplicate server name as a configuration error | 중복 이름을 설정 오류로 처리 | 거짓 |
| the expansion silently becomes an empty string | 치환이 조용히 빈 문자열이 됨 | 거짓 |
| can only ever be read from the invoking shell | 호출 셸에서만 읽을 수 있음 | 거짓 |
| falls back automatically to the user's home directory | 자동으로 홈 디렉터리로 폴백 | 거짓 |
| requires every referenced variable to be set | 참조된 모든 변수의 설정을 요구 | 거짓 |
| default-value expansion only applies inside the env block | 기본값 치환은 env 블록에서만 적용 | 거짓 |
| paste each teammate's literal token value before committing | 실제 토큰 값을 붙여넣고 커밋 | 보안 사고 |
| add .mcp.json to .gitignore | 설정 파일 자체를 git에서 제외 | 공유 목적 파괴 |
| have every teammate individually edit their own copy | 팀원이 각자 사본을 직접 수정 | 유출 위험 |
| it connects immediately and silently | 즉시 조용히 연결됨 | 보안 설계 위배 |
| checking a server into .mcp.json is implicit approval | 커밋 자체가 묵시적 승인 | 거짓 |
| it is renamed automatically with a numeric suffix | 숫자 접미사로 자동 개명됨 | 없는 동작 |
| project-scoped servers only activate for the teammate who added them | 추가한 팀원만 활성화됨 | 거짓 |
| enterprise scope, since managed configuration is the only mechanism | 엔터프라이즈 스코프만이 유일한 수단 | 목적 불일치 |
| loads the server but silently strips its screenshot tool | 로드하되 도구를 몰래 제거 | 없는 동작 |
| simply hides the built-in server for that session | 내장 서버를 그 세션 동안 숨김 | 없는 동작 |
| merges the tools into the built-in server's tool set | 내장 서버의 도구 세트에 병합 | 없는 동작 |
| tools are only loaded at session start | 도구는 세션 시작 시에만 로드됨 | 거짓 |
| require the user to run /mcp and manually select refresh | 수동으로 새로고침을 선택해야 함 | 거짓 |
| disconnect and silently reconnect, discarding in-flight tool calls | 재연결하며 진행 중 호출 폐기 | 없는 동작 |
| only one MCP server can hold an active connection | 서버 하나만 활성 연결 유지 가능 | 거짓 |
| only the tools from the server whose name matches | 이름이 맞는 서버의 도구만 로드 | 거짓 |
| before Sentry and Slack tools become selectable | 그 후에야 다른 도구가 선택 가능 | 거짓 |
| increase MAX_MCP_OUTPUT_TOKENS for just that server | 그 서버의 출력 토큰 상한만 증가 | 무관 |
| set ENABLE_TOOL_SEARCH=false globally | 전역으로 도구 검색 비활성화 | 과잉 조치 |
| move that server from project scope to user scope | 스코프를 옮겨 우선순위를 높임 | 없는 동작 |
| a static headers entry with the token hardcoded | 토큰이 하드코딩된 정적 헤더 | 매 연결 갱신 불가 |
| rotate the config file manually whenever it expires | 만료될 때마다 수동 로테이션 | 요구 불충족 |
| the oauth block with authServerMetadataUrl pointed at Kerberos | OAuth 블록을 Kerberos 렐름으로 | OAuth 서버 없음 |
| add a resources field naming the document inside .mcp.json | .mcp.json에 resources 필드 추가 | 없는 설정 |
| paste the raw JSON result directly into the next prompt | 원시 JSON을 다음 프롬프트에 붙여넣기 | 비효율 |
| trust that it infers which resource is relevant | 어떤 리소스인지 알아서 추론하리라 신뢰 | 불확실 |
| add several more search-related tools to the server | 검색 관련 도구를 더 추가 | 문제 악화 |
| switch the transport from stdio to HTTP | 전송을 stdio에서 HTTP로 전환 | 무관 |
| give the agent direct Bash access to curl the API | Bash로 API를 직접 curl | MCP 회피 |
| since only in-house servers can be trusted | 사내 서버만 신뢰할 수 있으므로 | 절대 단정 |

---

## 7. Claude Code 파일 도구 (Read / Write / Edit / Grep / Glob / Bash)

**해당 문제**: 3, 20, 26, 32, 39, 48, 52, 55, 57, 58, 61, 66, 69, 73, 83, 85

### 도구 선택 대조표 (최중요)
| 목적 | 한국어 | 도구 |
|---|---|---|
| find files by name pattern | 이름 패턴으로 파일 찾기 | **Glob** |
| find text inside files | 파일 내용 검색 | **Grep** |
| text spanning line breaks | 줄바꿈을 넘는 텍스트 | **Grep + multiline** |
| create a brand-new file | 새 파일 생성 | **Write** (사전 Read 불필요) |
| overwrite an existing file | 기존 파일 덮어쓰기 | **Read → Write** |
| affecting nearly every line | 거의 모든 줄에 영향 | **Read → Write 1회** |
| a few isolated lines | 일부 줄만 | **Edit** |
| run a command, see its output | 명령 실행·출력 확인 | **Bash** |

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| read-before-edit check | 편집 전 읽기 검증 | 디스크에서 파일이 바뀌면 Edit 실패 |
| unique `old_string` | 고유한 old_string | 중복 매칭 시 문맥을 넓혀 유일하게 |
| `replace_all` | 전체 치환 | 모든 occurrence를 바꿀 때만 |
| gitignored file | git 무시 파일 | **경로를 직접 지정**하면 검색됨 |
| incremental exploration | 점진적 탐색 | CLAUDE.md → Grep → 부분 읽기 |

### 정답 키워드 (Correct)
| 원문 조각 (8단어 이내) | 한국어 | 문항 |
|---|---|---|
| call Write with the entire re-indented content in a single call | 재정렬된 전체 내용을 한 번의 Write로 | 3 |
| read the file again to confirm current content | 현재 내용 확인을 위해 다시 읽기 | 3 |
| call Write with the complete restructured file content | 재구성된 전체 파일 내용으로 Write | 55 |
| since creating a brand-new file does not require a prior read | 새 파일 생성은 사전 읽기가 불필요하므로 | 26 |
| Write requires it to have been read in this conversation | 이 대화에서 먼저 읽혀 있어야 함 | 83 |
| widen old_string to include enough surrounding context | 충분한 주변 문맥을 포함하도록 확대 | 48 |
| to uniquely identify the intended occurrence | 의도한 위치를 유일하게 식별하려고 | 48 |
| include the surrounding JSON key and adjacent structure | 주변 JSON 키와 인접 구조를 포함 | 39 |
| so the string becomes unique to that field | 문자열이 그 필드에서만 유일해지도록 | 39 |
| the file changed on disk since Claude's earlier read | 이전 읽기 이후 디스크에서 파일이 변경됨 | 66 |
| re-read it and retry Edit against updated text | 다시 읽고 갱신된 텍스트로 Edit 재시도 | 66 |
| then Grep the gitignored bundle's path directly | gitignore된 번들 경로를 직접 Grep | 20 |
| since a direct path is still searched | 직접 경로는 여전히 검색되므로 | 20 |
| Grep with output mode content and a glob scope | content 출력 모드 + glob 범위로 Grep | 52 |
| then review that list before editing | 편집 전에 그 목록을 검토 | 52 |
| patterns such as **/*.test.tsx, **/*.spec.tsx, **/*Test.tsx | 명명 규칙별 패턴들 | 69 |
| list component and test files separately by naming pattern | 명명 규칙으로 각각 나열 | 57 |
| then compare the two path lists for gaps | 두 경로 목록의 빈틈을 비교 | 57 |
| re-run Grep with multiline mode enabled | 멀티라인 모드를 켜고 Grep 재실행 | 73 |
| so the pattern can match across the line boundary | 패턴이 줄 경계를 넘어 매칭되도록 | 73 |
| with the type parameter set to py, and multiline enabled | type=py + 멀티라인 활성화 | 85 |
| Bash, to invoke the project's test runner command | 프로젝트 테스트 러너를 Bash로 실행 | 32 |
| capture its stdout and stderr, including the stack trace | 스택 트레이스 포함 출력 캡처 | 32 |
| read dateUtils.ts first to identify every exported name | 먼저 읽어 모든 export 이름 파악 | 58 |
| including aliases, then Grep for each exported name | 별칭 포함, 각 이름을 Grep | 58 |
| start by reading CLAUDE.md or AGENTS.md if they exist | 있으면 CLAUDE.md·AGENTS.md부터 읽기 | 61 |
| read files incrementally along the call chain | 호출 체인을 따라 점진적으로 읽기 | 61 |

### 함정 키워드 (Distractor)
| 원문 조각 (8단어 이내) | 한국어 | 왜 오답 |
|---|---|---|
| issue one Edit call per line of the file | 파일의 줄마다 Edit 호출 | 900회 호출, 극도로 비효율 |
| rely on Glob's sort-by-modification-time behavior | Glob의 수정 시각 정렬에 의존 | Glob은 검색 전용 |
| since retrieving lines through Grep also rewrites them | Grep이 줄을 다시 쓰기도 하므로 | Grep은 읽기 전용 |
| since Grep can modify file contents once a match is found | 매치되면 Grep이 내용을 수정 가능 | 거짓 |
| assuming multiline mode makes Grep search gitignored files | multiline이 gitignore 파일도 검색하게 함 | 무관한 기능 결합 |
| since count mode searches more thoroughly than content mode | count 모드가 더 철저히 검색하므로 | 거짓 |
| on the assumption that this mode searches more thoroughly | 이 모드가 더 철저하다는 가정 | 거짓 |
| run Glob with the pattern **/*parseInvoice* | 함수명이 든 파일명 패턴으로 검색 | 파일명≠내용 |
| then treat that file list as the complete set of callers | 그 목록을 호출부 전체로 간주 | 누락 발생 |
| judge from file names alone which ones likely reference it | 파일명만으로 참조 여부를 판단 | 추측 |
| since Edit interprets old_string as regex when quotes are present | 따옴표가 있으면 정규식으로 해석 | 거짓 |
| since Edit automatically infers which occurrence is the version | 어느 위치가 버전인지 자동 추론 | 없는 기능 |
| then manually revert whichever one should have stayed | 남았어야 할 쪽을 수동으로 되돌림 | 요구 위배 |
| expecting Write to merge that single line into the file | Write가 한 줄을 병합해 주길 기대 | Write는 전체 덮어쓰기 |
| an old_string that matches the contents of an empty file | 빈 파일 내용에 매칭되는 old_string | 새 파일은 Write |
| since Write can only create files that do not already exist | Write는 없는 파일만 생성 가능 | 거짓 |
| since Grep results satisfy the same prior-access requirement | Grep이 Read의 사전 접근 요건을 충족 | 거짓 |
| old_string must have contained an unescaped regex metacharacter | 이스케이프 안 된 메타문자가 있었을 것 | 없는 규칙 |
| Edit calls always fail on the second attempt in a session | 세션 내 두 번째 시도는 항상 실패 | 없는 규칙 |
| discard the file and recreate it from scratch | 파일을 버리고 처음부터 다시 생성 | 위험 |
| use Read to open every file under the src directory | src 아래 모든 파일을 열기 | 컨텍스트 낭비 |
| then read each file completely to check for BaseHandler | 각 파일을 전부 읽어 확인 | 컨텍스트 낭비 |
| open every file in an interactive editor | 대화형 편집기로 모든 파일 열기 | 불가능·비효율 |
| pointed at the project root so it returns a recursive listing | 루트를 가리켜 재귀 목록을 반환 | Read 기능 아님 |
| read the files with the highest word counts | 단어 수가 가장 많은 파일을 읽기 | 근거 없음 |
| read the twenty most recently modified files | 최근 수정된 20개 파일을 읽기 | 근거 없음 |
| search each component file's contents for the word test | 각 파일 내용에서 'test' 단어 검색 | 명명 규칙 문제인데 내용 검색 |
| count how many components report zero assertions | 어서션 0건 컴포넌트를 집계 | 과도한 비용 |
| assuming any caller that uses the alias will also match | 별칭 사용 호출부도 함께 매칭될 것 | 거짓 |
| read only the files where that count exceeds a threshold | 임계값 초과 파일만 읽기 | 임의 기준 |
| assuming Grep cannot be scoped to one language repo-wide | Grep이 언어 범위 지정을 못 한다고 가정 | 거짓 |

---

## 8. 반복 출제 문항 (동일/거의 동일)

| 내용 | 문항 | 정답 요지 |
|---|---|---|
| 개인 전용 + 모든 프로젝트 MCP | **5, 40** | user scope → `~/.claude.json` |
| `list_changed` 자동 새로고침 | **15, 16** | 재연결 없이 자동 갱신 |
| `analyze_content` 개명 + 설명 갱신 | **25, 36, 56, 75** | 이름 구체화 + 설명 범위 축소 |
| 마이그레이션 로컬 재시도 후 성공 | **38, 65** | 성공 보고, 에스컬레이션 없음 |
| Kerberos 매 연결 토큰 발급 | **70, 82** | `headersHelper` + stdout 헤더 JSON |
| 필수 필드 누락의 재시도 오분류 | **27, 63** | validation + `isRetryable: false` |
| Grep multiline 필요 | **73, 85** | multiline 모드 활성화 |
| 강제 도구 호출 | **14, 43, 59** | `{"type":"any"}` |

---

## 9. 시험 직전 30초 복습

1. **도구를 잘못 고른다** → 설명을 고친다. **못 쓰게 해야 한다** → 도구를 뺀다.
2. **재시도해도 안 되는 것**(policy·validation·permission) = `isRetryable: false`. **기다리면 되는 것**(429·503·timeout) = `transient` + `true`.
3. **zero results ≠ error**. **nonexistent ID = error**(`not_found_error`).
4. **before the tool executes** = JSON-RPC 프로토콜 에러 / 비즈니스 거절 = 도구 결과 안의 `isError`.
5. **text block + structured metadata** — 항상 둘 다.
6. **must always call a tool** = `any` / **the very first action** = `tool` → 이후 `auto` / **extended thinking 중엔** `any`·`tool` 불가.
7. **any project on that machine** = user / **only within one project, private** = local / **checked into the repo** = project + `${ENV}`. 충돌 시 **local 승**.
8. **by name pattern** = Glob / **inside files** = Grep / **across the line boundary** = multiline / **stdout and stderr** = Bash.
9. **the entire file** = Read→Write / **a few lines** = Edit(실패 시 문맥 확대) / **brand-new file** = Write 바로 / **overwrite** = Read 먼저.
10. **resolved locally는 위로 올리지 않는다. 한도 소진은 카테고리와 미완료 범위를 붙여 올린다. partial results는 버리지 않는다.**
