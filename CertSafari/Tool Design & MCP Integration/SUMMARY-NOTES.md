# Tool Design & MCP Integration — 학습용 핵심 요약 노트

모의시험 85문항(01–85) 기반.

**사용법**: "문제 신호"로 지문 키워드를 잡고 → "정답 키워드"를 고르고 → "함정 키워드"는 버린다.

---

## 0. 5초 판별 치트시트 (Decision Cheatsheet)

| 지문에 이게 보이면 | 정답은 이 방향 |
|---|---|
| 두 도구 설명이 거의 같음 / near-duplicate description | **설명(description)을 차별화** — 이름 변경·설명 재작성 |
| model picks wrong tool / misrouting (도구 오선택) | **설명에 입력 형식 + 예시 쿼리 + "언제 다른 도구를 쓸지"** 명시 |
| tool it shouldn't have / outside its remit (역할 밖 도구) | **그 도구를 도구 목록에서 제거** (Least Privilege) — 프롬프트 경고는 오답 |
| 15~20개 도구 / declining accuracy (도구 과다) | **역할별 서브에이전트로 분할** (각 4–5개) |
| generic tool misused / arbitrary URL·byte offset (범용 도구 오용) | **제약된 도구로 교체** (검증된 ID·화이트리스트 입력) |
| never retry / policy·rule violation (정책 위반) | **errorCategory: `business`, isRetryable: false** |
| missing required field / malformed input (필수 필드 누락) | **`validation` + isRetryable: false** (transient 아님!) |
| 429 / rate limit / timeout / 503 (일시적 장애) | **`transient` + isRetryable: true** |
| wrong token scope / lacks access (권한 부족) | **`permission` + isRetryable: false** |
| query succeeded but zero results (결과 0건) | **isError: false + 빈 배열** — 에러 아님 |
| ID does not exist (존재하지 않는 ID) | **isError: true + `not_found_error`** |
| schema type mismatch, before handler runs (핸들러 실행 전) | **JSON-RPC 프로토콜 에러** (-32602), 도구 결과 에러 아님 |
| must always call a tool (무조건 도구 호출) | **`tool_choice: {"type":"any"}`** |
| specific tool first, then free (첫 턴만 고정) | **첫 턴 `{"type":"tool","name":X}` → 이후 `auto`** |
| extended thinking + force tool (확장 사고 + 강제 호출) | **`any`/`tool` 미지원 → `auto`/`none`, 또는 adaptive thinking** |
| personal + every project on my machine (개인 + 모든 프로젝트) | **user scope → `~/.claude.json`** |
| personal + this one project only (개인 + 이 프로젝트만) | **local scope** |
| shared with team / checked into repo (팀 공유) | **project scope → `.mcp.json` + `${ENV_VAR}` 치환** |
| cloned repo, first run (클론 후 첫 실행) | **pending approval — 명시적 승인 필요** |
| entire file / nearly every line (파일 전체 변경) | **Read → `Write` 1회** |
| a few lines / one occurrence (일부 변경) | **`Edit`** — 실패하면 `old_string` 문맥을 넓힌다 |
| find files by name pattern (이름 패턴으로 파일 찾기) | **`Glob`** |
| find text inside files (내용 검색) | **`Grep`** |
| spans multiple lines (여러 줄에 걸침) | **`Grep` + multiline 모드** |
| run tests / capture stack trace (실행·출력 필요) | **`Bash`** |
| 반복 탐색 검색 과다 (repeated exploratory searches) | **MCP Resource로 카탈로그 노출** |

**만능 오답 패턴 (거의 항상 함정)**
- "temperature를 낮춘다/높인다" (도구 선택 문제의 해결책이 아님)
- "max_tokens / timeout / context window를 늘린다"
- "tools 배열의 순서를 바꾼다" (순서는 선택에 영향 없음)
- "설명을 더 짧게 만든다"
- "이모지나 눈에 띄는 이름을 붙인다"
- "사용자에게 매번 도구 이름을 직접 말하게 한다"
- "기능을 아예 제거한다" (요구사항 삭제)
- "도구를 하나로 합친다" (모호성 해소가 목적일 때는 오답)
- 존재하지 않는 메커니즘을 그럴듯하게 서술 (자동 병합, 자동 강제 실행, 스키마 내 temperature 등)

---

## 1. 도구 설명 & 이름 설계 (Tool Description & Naming)

**해당 문제**: 4, 7, 10, 21, 22, 25, 36, 37, 45, 47, 50, 56, 74, 75, 78, 79, 80, 84

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| tool description | 도구 설명 | 모델이 도구를 고르는 **주된 근거** |
| differentiating signal | 구별 신호 | 유사 도구 간 판단 기준 |
| near-duplicate descriptions | 거의 중복된 설명 | 오선택(misrouting)의 **1순위 원인** |
| expected input format | 기대 입력 형식 | 인자 오류 방지 |
| example query | 예시 쿼리 | Few-shot 효과 |
| boundary behavior | 경계 동작 | 어디까지 되고 안 되는지 |
| out of scope | 범위 밖 | "이건 이 도구가 못 함"을 명시 |
| negative guidance | 부정 지침 | "언제 다른 도구를 쓸지" 안내 |
| narrow contract | 좁은 계약 | 도구 하나 = 기능 하나 |
| keyword association | 키워드 연관 | 시스템 프롬프트 단어가 도구명과 엮여 편향 유발 |
| anchoring / override | 앵커링 / 덮어쓰기 | 프롬프트 지시가 도구 설명 판단을 이김 |

### 정답 키워드 (Correct)
- **"Expected input format, one or two example queries, and a note on when to prefer the other tool instead"** (기대 입력 형식 + 예시 쿼리 1~2개 + 다른 도구를 선호할 때에 대한 메모) — 4번의 3종 세트
- **"The near-duplicate descriptions give the model no differentiating signal, since descriptions are its main basis for choosing similar tools"** (중복 설명은 구별 신호를 주지 않음; 설명이 주된 선택 근거) — 10번
- **"Rewrite the description to explain what it returns and when it beats text search"** (무엇을 반환하는지와 어떤 상황에서 텍스트 검색보다 나은지를 설명) — 21번
- **"Specify in each description the exact category of issue each tool detects, along with an example phrase"** (각 도구가 잡아내는 이슈의 정확한 범주 + 연관 예시 문구) — 22번
- **"Rename to a more specific name, such as `summarize_pasted_text`, and limit its description to pasted text only"** (더 구체적 이름으로 변경하고 설명 범위를 좁힘) — 25번
- **"Rename the general tool to reflect its remaining scope, and update its description to exclude the case the newer tool now handles"** (범용 도구를 남은 범위에 맞게 개명하고, 신규 도구가 맡은 케이스를 설명에서 제외) — 36·56번
- **"Update each tool's description to name the specific fields it returns"** (각 도구가 반환하는 구체적 필드를 설명에 명시) — 45번
- **"State explicitly that the tool returns public market data only and cannot access private account information"** (공개 시장 데이터만 반환하고 개인 계정 정보는 접근 불가임을 명시) — 47번
- **"Revise `localize_content`'s description to mention currency and culture, and state `translate_text` does direct translation only"** (한쪽엔 통화·문화까지, 다른 쪽엔 직역만이라고 명시) — 50번
- **"Expand the description to state the input format, include an example query, and note historical lookups are out of scope"** (입력 형식 + 예시 쿼리 + 과거 조회는 범위 밖임을 명시) — 74번
- **"Rewrite each description to state the expected input type and add a note on when the other tool applies"** (기대 입력 타입 명시 + 다른 도구가 적용되는 시점 메모) — 75번
- **"Establish a description template requiring tools to state output granularity, an example query, and how they differ from similar ones"** (출력 상세도 + 예시 + 유사 도구와의 차이를 요구하는 설명 템플릿 표준화) — 78번, 장기적 재발 방지책
- **"The description omits the expected input format and boundary behavior, such as which fields are valid and whether partial updates work"** (기대 입력 형식과 경계 동작 누락) — 79번
- **"Rewrite each description to state its specific trigger condition, and note explicitly when to use the other tool instead"** (고유한 트리거 조건 + 다른 도구를 쓸 시점 명시) — 80번
- **"Split the tool into `extract_data_points`, `summarize_content`, `verify_claim_against_source`, each with a narrow contract"** (좁은 계약을 가진 독립 도구들로 분할) — 84번
- **"Keyword-sensitive system prompt wording creates an unintended association that overrides the more accurate tool description"** (프롬프트의 키워드가 의도치 않은 연관을 만들어 더 정확한 도구 설명을 덮어씀) — 7번
- **"System prompts can significantly influence tool selection, and explicit instructions may override the model's assessment"** (시스템 프롬프트가 도구 선택에 큰 영향을 주고, 명시적 지시가 모델의 판단을 덮어쓸 수 있음) — 37번

### 함정 키워드 (Distractor)
- **"A catchy tool name paired with an emoji"** (캐치한 이름 + 이모지) — 시각 요소는 의미 판단에 무의미
- **"An exhaustive list of every possible parameter combination, without any narrative explanation"** (설명 없이 파라미터 조합 나열) — 언제 쓸지를 못 알려줌
- **"The name of the engineer who implemented the tool along with its implementation language"** (구현자 이름·구현 언어) — 완전 무관
- **"The tools were declared in the wrong order in the tools array; reordering will correct routing"** (배열 순서를 바꾸면 해결) — 순서는 영향 없음
- **"The context window is too small to hold both tool definitions"** (컨텍스트 윈도우가 작아서) — 원인 아님
- **"The fix belongs in the user's prompt rather than the tool definitions"** (사용자 프롬프트 탓) — 책임 전가
- **"Rename the tool to `grep`"** / **"`get_financial_data_v2`"** / **"`localize_content_v1`"** / **"a random unique string"** (이름만 바꾸기·버전 접미사·무작위 이름) — 설명을 안 고치면 무의미
- **"Remove Grep from the built-in tools entirely so the agent has no alternative"** (대안 자체를 없앰) — 과격한 기능 제거
- **"Set the permission mode to require manual approval on every call"** (매 호출 수동 승인) — 선택 정확도와 무관
- **"Shorten the description further"** (설명을 더 짧게) — 반대 방향
- **"Delete the description text and rely solely on the tool's name"** (설명 삭제하고 이름에만 의존) — 반대 방향
- **"Merge both tools into one and pass a boolean flag"** / **"add a required mode enum but leave the description unchanged"** (하나로 합치고 플래그/enum) — 설명이 그대로면 모호성 그대로
- **"Increase the priority weight in the backend routing configuration"** (백엔드 라우팅 우선순위 가중치) — 존재하지 않는 메커니즘
- **"Ask users to specify the tool by internal ID every time"** / **"hardcode which tool to call in every client"** (매번 ID 지정·클라이언트 하드코딩) — 도구 선택 자체를 포기
- **"Add a longer paragraph of promotional wording"** (홍보성 문구 추가) — 구별 신호 아님
- **"Add a short delay before the tool executes so the model reconsiders"** (실행 전 지연) — 무의미
- **"Increase the model's sampling temperature"** / **"reduce the number of tools to one"** / **"cap the tool count at two"** — 만능 오답
- **"Add a `private` boolean parameter without altering the description"** (설명은 그대로 두고 파라미터만 추가)
- **"The tool must have a malformed JSON schema, since that is the only way a tool can be excluded"** (스키마 오류가 유일한 원인) — 거짓
- **"The word 'search' in a tool's name always takes absolute priority"** (항상 절대 우선) — 절대 단정어 함정
- **"Instruct the model to always call both tools together on every issue"** (항상 둘 다 호출)
- **"Combine both endpoints into a single MCP resource, since resources are inherently immune to selection ambiguity"** (리소스는 본질적으로 모호성 면역) — 거짓

---

## 2. 도구 범위 제한 & 최소 권한 (Tool Scoping / Least Privilege)

**해당 문제**: 6, 9, 13, 17, 19, 28, 49, 51, 60, 77

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| principle of least privilege | 최소 권한 원칙 | 역할에 필요한 최소 도구만 부여 |
| scoped tool access | 범위 지정 도구 접근 | 역할별로 도구 세트를 나눔 |
| tool scoping | 도구 스코핑 | 노출 자체를 줄이는 것이 근본 해결 |
| specialization | 전문화 | 에이전트 하나 = 역할 하나 |
| cross-role tool | 역할 간 도구 | 예외적으로 필요한 좁은 도구 1개만 허용 |
| narrow tool | 좁은 도구 | `check_status`, `verify_fact` 같은 단일 목적 |
| constrained alternative | 제약된 대안 | 범용 도구를 검증된 입력만 받는 도구로 교체 |
| decision complexity | 결정 복잡도 | 도구 수가 늘수록 선택 정확도 하락 |
| single responsibility | 단일 책임 | 트리아지 에이전트는 라우팅만 |

### 정답 키워드 (Correct)
- **"Agents tend to misuse tools outside their specialization when given access to them"** (전문 분야 밖 도구를 주면 오용하는 경향) — 6번의 핵심 문장
- **"web_search should be removed from the synthesis agent's tool set and left with the research agent"** (종합 에이전트에서 제거하고 리서치 에이전트에만 남김)
- **"Tools beyond an agent's specialization tend to get misused when available, so Bash and deploy_service should be removed"** (전문 영역 밖 도구는 제거) — 19번
- **"Give the intake agent only a narrow `check_status` tool for that specific high-frequency need, while routing deeper operations through the processing agent"** (고빈도 요구에만 좁은 도구 1개, 깊은 작업은 원래 담당 에이전트 경유) — 9번
- **"Give the synthesis agent a narrow `verify_fact` tool for quick single-claim checks, and refer conflicting sources to the coordinator"** (단순 확인만 좁은 도구, 충돌 해소는 코디네이터) — 51번
- **"Restrict each subagent's tool set to only what its role needs, while keeping `tool_choice` at `auto`"** (역할에 필요한 도구만 남기되 판단권은 유지) — 13번, 두 조건을 동시에 만족
- **"Split the work across specialized subagents so each one is exposed to only the 4-5 tools relevant to its own role"** (역할별 4~5개 도구만 노출되도록 분할) — 28번
- **"Each subagent now discriminates among a much smaller candidate set, which directly reduces the decision complexity"** (후보군이 작아져 결정 복잡도가 줄어듦) — 60번
- **"Replace `fetch_url` with a `load_document` tool that validates the URL against an allowed document source"** (허용된 출처를 검증하는 도구로 교체) — 17번
- **"Replace `retrieve_clause` with a `get_clause_by_id` tool that only accepts a validated clause identifier from a pre-parsed index"** (사전 파싱된 인덱스의 검증된 ID만 받는 도구로 교체) — 49번
- **"Remove `process_refund`, `reset_password`, and `close_account` so it only has `route_ticket`, matching its single core routing function"** (핵심 기능 도구만 남김) — 77번

### 함정 키워드 (Distractor)
- **"lowering temperature to a more focused value like 0.2"** (온도를 0.2로 낮춤) — 확률적 미봉책
- **"rewriting the description with guidance that it should not be used during synthesis"** (설명에 "쓰지 마라"를 적음) — 지시는 우회 가능, 제거가 정답
- **"a stronger instruction in the system prompt telling it never to deploy, while keeping all five tools"** (도구는 두고 프롬프트만 강화) — 보장 불가
- **"add stricter JSON schema validation on its parameters"** (스키마 검증 강화) — 근본 원인이 아님
- **"give the agent even more tools so the risky one becomes just one option among many"** (도구를 더 줘서 희석) — 정반대
- **"Give the intake agent the processing agent's full tool set"** (전체 도구 세트 부여) — 과도한 권한
- **"Remove status checking from the pipeline entirely"** (필요 기능 자체를 제거) — 유용성 파괴
- **"Give the processing agent a copy of the intake agent's tool"** (엉뚱한 쪽에 도구 부여)
- **"switch every subagent's `tool_choice` to `{"type":"any"}` / `{"type":"none"}` while keeping the shared 15-tool set"** (도구는 공유한 채 tool_choice만 조작) — 원인 미해결
- **"force every subagent's `tool_choice` to a single named tool for all turns"** (모든 턴을 단일 도구로 고정) — 판단 능력 상실
- **"Keep the tool unchanged and add a second agent to double-check the byte ranges"** (검증용 에이전트 추가) — 근본 해결 아님
- **"double the number of example byte-offset calls in its description"** (예시만 늘림)
- **"add a `raw_file_read` tool so it can cross-check"** (권한을 더 넓힘) — 정반대
- **"Rewrite the 18 tool descriptions to be shorter"** / **"raise `max_tokens`"** / **"sort the tools alphabetically"** — 만능 오답
- **"require a human to paste document contents into the conversation"** (사람이 직접 붙여넣기) — 자동화 포기
- **"add a second identical tool named `fetch_url_v2` as a fallback"** (동일 도구 복제) — 모호성 증가
- **"Add a human approval step before `process_refund` executes"** (승인 단계 추가) — 애초에 그 도구가 없어야 함
- **"Rename `process_refund` to `billing_queue_helper` so it's treated as a routing alias"** (이름만 바꿔 별칭 취급) — 실제 동작은 그대로
- **"The orchestrator caches tool results, eliminating the need for tool calls"** / **"reduces the total number of API calls"** / **"a smaller context window forces more careful thinking"** — 잘못된 인과

---

## 3. MCP 오류 설계 (Structured Errors)

**해당 문제**: 1, 11, 27, 29, 30, 34, 42, 46, 63, 68, 72

### 에러 카테고리 대조표 (최중요)
| errorCategory | 한국어 | isRetryable | 언제 | 대표 사례 |
|---|---|---|---|---|
| `business` | 비즈니스 규칙 위반 | **false** | 정책상 절대 안 되는 것 | 30일 환불 기간 경과, 리걸 홀드 |
| `validation` | 입력 검증 실패 | **false** | 요청이 잘못됨 → 입력을 고쳐야 함 | 필수 `sku`·`customer_id` 누락 |
| `permission` | 권한 부족 | **false** | 자격이 바뀌기 전엔 동일하게 실패 | `read` 토큰으로 `deploy` 호출 |
| `transient` | 일시적 오류 | **true** | 시간이 지나면 성공 가능 | 429 rate limit, 503, 타임아웃 |
| `not_found_error` | 대상 없음 | (false) | 존재하지 않는 ID | 없는 customer ID 조회 |

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| text block + structured metadata | 텍스트 블록 + 구조화 메타데이터 | **둘 다** 필요 — 사람용 설명 + 기계용 판단 근거 |
| human-readable description | 사람이 읽을 수 있는 설명 | 에이전트가 자연어로 설명 가능 |
| `isError: true` | 도구 실행 오류 | 도구 결과 안의 에러 |
| JSON-RPC protocol error (-32602) | 프로토콜 수준 오류 | **핸들러 실행 전** 스키마 검증 실패 |
| empty result set | 빈 결과 집합 | 에러가 **아님** → `isError: false` |
| bounded backoff | 제한된 백오프 | 에이전트가 스스로 재시도 상한 적용 |

### 정답 키워드 (Correct)
- **"structured metadata including `errorCategory: "business"` to indicate a business rule violation, plus a description stating the order fell outside the 30-day return window"** (비즈니스 규칙 위반 카테고리 + 기간 초과 설명) — 1번
- **"A human-readable description field ... separate from any machine-oriented `errorCategory` or `isRetryable` flags"** (기계용 플래그와 별개로 사람이 읽을 설명 필드) — 11번
- **"A missing required field is a validation error, not a transient one, so marking it retryable causes the agent to resend an identically malformed request"** (필수 필드 누락은 검증 오류이지 일시적 오류가 아님) — 27번
- **"`isRetryable` should be `false`. Retrying the same request will not succeed; the agent must correct the input before retrying"** (같은 요청 재시도는 성공 못 함, 입력을 고쳐야 함) — 63번
- **"The malformed argument triggers a JSON-RPC protocol error from schema validation before the tool executes, while a declined charge is reported inside the tool result with `isError:true`"** (스키마 오류=프로토콜 에러 / 승인 거절=도구 결과 에러) — 29번, 두 계층 구분
- **"Return `isError: false` with structured content showing an empty results array, since a successful query with no matches is not a tool execution error"** (매칭 0건은 실행 오류가 아님) — 30번
- **"The zero-orders case returns `isError:false` with an empty array; the nonexistent-ID case returns `isError:true` with `not_found_error`"** (0건 vs 존재하지 않음의 구분) — 34번
- **"The result carries no structured metadata distinguishing transient from non-retryable failures, so the agent has no basis for deciding whether retrying is worthwhile"** (재시도 판단 근거가 없음) — 42번
- **"`errorCategory: "permission"` with `isRetryable: false`, since resubmitting with the same token will fail identically until the caller's scope changes"** (스코프가 바뀌기 전엔 동일하게 실패) — 46번
- **"A uniform generic message gives the agent no basis for choosing among retrying, adjusting input, or escalating"** (재시도·입력 수정·에스컬레이션 중 무엇을 할지 판단 불가) — 68번
- **"`errorCategory: "transient"`, `isRetryable: true`, and a description noting the warehouse is rate-limiting, letting the agent apply its own bounded backoff strategy"** (에이전트가 자체 백오프 상한 적용) — 72번
- **"It is a business error because the request itself is well-formed and the rejection stems from a policy rule about the account's state rather than malformed input"** (요청은 정상, 계정 상태 정책이 원인) — 31번

### 함정 키워드 (Distractor)
- **"`errorCategory: "transient"` and a description telling the agent to wait 30 seconds and resubmit"** (30초 후 재전송) — 절대 성공 못 할 요청을 반복시킴
- **"`errorCategory: "permission"` and asking the customer to contact their account administrator"** (관리자에게 연락) — 기간 만료와 무관
- **"A bare text block reading "Refund denied" with no structured metadata"** (메타데이터 없는 맨 텍스트) — 판단 근거 없음
- **"Returning the raw exception stack trace so the agent can extract the room name using text parsing"** (스택 트레이스를 텍스트 파싱) — 에이전트에게 파싱을 시키면 안 됨
- **"Setting `isRetryable` to true so the agent automatically resubmits until the room becomes free"** (방이 빌 때까지 재제출)
- **"Omitting the description field entirely, since `errorCategory` alone is sufficient"** (카테고리만으로 충분) — 자연어 설명 필요
- **"`isRetryable` should remain true because validation errors are inherently transient"** (검증 오류는 본질적으로 일시적) — 거짓
- **"The categorization is correct as written, since repeated retries are the expected behavior"** (그대로가 맞다)
- **"any error involving a missing field must always be surfaced at the protocol layer"** (필드 누락은 항상 프로토콜 계층) — 절대 단정어 함정
- **"MCP tool responses only define `isError`; there is no standard `errorCategory` or `isRetryable` field"** (커스텀 필드라 무시될 것) — 63번의 그럴듯한 함정
- **"The client silently coerces the malformed argument to a number"** (클라이언트가 몰래 형변환) — 없는 동작
- **"Both failures are reported identically as JSON-RPC errors with code -32602"** / **"Both are reported inside a tool result with `isError:true`"** (두 실패를 동일 처리) — 계층 구분이 핵심
- **"change errorCategory to transient so the agent retries until a ticket eventually appears"** (티켓이 생길 때까지 재시도)
- **"Return `isError: false` but omit the results array entirely, letting the agent infer from the missing field"** (필드를 빼서 추론하게 함) — 추론 강요
- **"the agent's context window ran out of space to store the error text"** (컨텍스트 부족) — 잘못된 원인
- **"The tool set `isError` to true instead of false, which signals unlimited retries"** (true가 무제한 재시도 신호) — 거짓
- **"returning a constant error string pushes the block beyond the MCP protocol's maximum content length"** / **"the spec requires a machine-parseable stack trace"** — 존재하지 않는 규격
- **"`errorCategory: "business"` ... since restricting deploy access is functionally the same as a refund window"** (권한을 비즈니스로 분류) — 46번의 근접 오답
- **"`errorCategory: "validation"`, `isRetryable: true`, since the token is a malformed input field"** (토큰을 입력 형식 문제로) — 잘못된 분류

---

## 4. 서브에이전트 오류 보고 & 에스컬레이션 (Error Propagation)

**해당 문제**: 2, 12, 38, 62, 65

### 핵심 규칙
| 상황 | 한국어 | 처리 |
|---|---|---|
| local retry succeeded | 로컬 재시도로 해결됨 | **성공으로 보고** — 위로 올리지 않음 |
| retry limit exhausted | 재시도 한도 소진 | **실패를 코디네이터에 전파** + 카테고리·미완료 내역 명시 |
| partial results + reported error | 부분 결과 + 오류 보고 | **부분 결과 활용 + 특정 문제만 조치** |
| process crash, no output | 프로세스 충돌, 출력 없음 | **전체 미처리로 간주하고 재작업** |

### 정답 키워드 (Correct)
- **"For subagent 2, use the partial results and address the specific reported permission gap; for subagent 3, lacking completed work or diagnostic detail, treat the entire folder as unprocessed"** (부분 결과는 살리고, 진단 정보 없는 충돌은 전체 재처리) — 2번
- **"The 47 enriched records as partial results, plus a report naming the 3 unresolved customers, the permission error encountered, and what was attempted"** (부분 결과 + 미해결 대상 + 오류 + 시도 내역) — 12번
- **"A success result summarizing the completed migration, since the transient failures were resolved locally and never needed to surface above the subagent"** (로컬에서 해결된 일시적 실패는 위로 안 올림) — 38·65번
- **"Stop retrying and propagate the failure to the coordinator, noting the `errorCategory`, that timeouts persisted across the allowed local attempts, and what text remained untranslated"** (재시도 중단 + 카테고리·지속 여부·미완료 범위 보고) — 62번

### 함정 키워드 (Distractor)
- **"treat both identically by discarding any partial results"** (부분 결과를 버리고 동일 처리) — 자원 낭비
- **"assuming subagent 3's crash was also due to a permission issue, since that is the most common cause"** (진단 없이 원인 추측) — 위험한 추정
- **"ignore the reported error and mark the folder complete, since most files were indexed"** (대부분 됐으니 완료 표시) — 데이터 누락
- **"An `isError: true` result for the entire batch, discarding the 47 successful lookups"** (배치 전체를 실패 처리)
- **"silently dropping the 3 failures"** (실패를 조용히 누락) — 은폐
- **"A retry loop that keeps calling with the same credentials until the coordinator intervenes"** / **"Continue retrying indefinitely, resetting the retry count"** (무한 재시도)
- **"Silently return a fabricated translation using a cached fallback"** (조작된 결과 반환) — 최악
- **"Immediately reclassify the error as a permission failure"** (타임아웃을 권한 오류로 재분류) — 잘못된 분류
- **"An escalation asking the coordinator to obtain new database credentials"** (해결된 일을 굳이 에스컬레이션)
- **"A partial-results payload omitting the load step entirely since it initially failed twice"** (성공한 단계를 누락)

---

## 5. tool_choice 제어

**해당 문제**: 13, 14, 33, 41, 43, 53, 59

### 값 대조표
| 값 | 한국어 | 동작 |
|---|---|---|
| `{"type":"auto"}` | 자동 (기본값) | 모델이 턴마다 도구 호출 여부를 스스로 결정 |
| `{"type":"any"}` | 아무거나 (강제) | **반드시 도구 중 하나를 호출** — 산문 응답 금지 |
| `{"type":"tool","name":X}` | 특정 도구 강제 | 지정한 그 도구를 호출 |
| `{"type":"none"}` | 호출 금지 | 도구를 전혀 호출하지 않음 |

**확장 사고(extended thinking) 제약**: manual extended thinking 활성 시 `any`와 `tool` **미지원** → `auto`/`none`만 가능. 강제 호출이 필요하면 **adaptive thinking으로 이전**하거나 manual thinking을 끈다.

### 정답 키워드 (Correct)
- **"`{"type":"any"}`, so the model must select and call at least one of the provided tools on every turn"** (매 턴 최소 하나는 반드시 호출) — 14번
- **"`{"type":"any"}`, since it requires the model to call one of the provided tools rather than reply in prose"** (산문 대신 도구 호출을 요구) — 43번
- **"`{"type":"any"}`, which requires the model to call one of the provided tools without pinning it to a specific one"** (특정 도구로 고정하지 않으면서 호출은 강제) — 59번, "내용에 따라 다른 태그"가 조건일 때 핵심
- **"`{"type":"tool","name":"create_profile"}` for the first turn only, then switch to `auto` for subsequent turns"** (첫 턴만 고정, 이후 자율) — 33번
- **"Set `tool_choice` to `{"type":"tool","name":"extract_metadata"}` on the turn where metadata is needed, then let the model choose with `auto` or `any` afterward"** (선행 도구를 강제한 뒤 자율로) — 41번
- **"Restrict each subagent's tool set to only what its role needs, while keeping `tool_choice` at `auto`"** (도구는 줄이되 판단권은 유지) — 13번
- **"When manual extended thinking is enabled, `any` and `tool` are not supported; set `auto` or `none`. To force a tool call while using thinking, migrate to adaptive thinking, or disable manual extended thinking"** — 53번

### 함정 키워드 (Distractor)
- **"`{"type":"none"}`, since it disables prose generation and forces structured output"** (none이 구조화 출력을 강제) — 정반대
- **"`{"type":"auto"}`, since it is the default and applies whenever any tools are present"** (기본값이니까 충분) — 산문 응답 가능하므로 보장 안 됨
- **"`{"type":"tool","name":"answer_directly"}`, forcing a fixed response-generation tool"** (고정 응답 도구 강제)
- **"`{"type":"tool","name":"tag_normal"}`, which forces the same tag every time regardless of content"** (내용과 무관하게 같은 태그) — 조건 위배
- **"Leaving `tool_choice` unset while adding a system prompt instruction to 'always respond with a tool call'"** (프롬프트로 지시) — 보장 불가
- **"Order `create_profile` first in the `tools` array and leave `tool_choice` at `auto`"** (배열 순서로 순서 보장) — 순서는 보장 아님
- **"Use `{"type":"none"}` for the first turn so the model cannot call any tool, then switch to `auto`"** (첫 턴에 호출 금지) — 요구사항과 정반대
- **"`{"type":"any"}` for the entire conversation ... relying on its training to choose `extract_metadata` first"** (훈련에 의존) — 보장 없음
- **"Remove the enrichment tools on the first turn and re-add them later"** (도구 목록을 턴마다 갈아끼움) — tool_choice로 될 일을 복잡하게
- **"Add a detailed description stating they require metadata fields, and keep `tool_choice` at `auto`"** (설명만으로 순서 보장) — "guarantee"가 조건이면 오답
- **"extended thinking disables all `tool_choice` options; remove all tools"** / **"`any` requires at least two tools"** / **"`any` is deprecated; replace with `{"type":"forced"}`"** — 존재하지 않는 규칙

---

## 6. MCP 설정 스코프 & 보안

**해당 문제**: 5, 18, 23, 40, 64, 67, 71, 81

### 스코프 대조표 (최중요)
| 스코프 | 한국어 | 저장 위치 | 공유 | 적용 범위 |
|---|---|---|---|---|
| **local** | 로컬 | `~/.claude.json` 내 **그 프로젝트 경로 아래** | 공유 안 됨 | **그 프로젝트만** |
| **user** | 사용자 | `~/.claude.json` | 공유 안 됨 | **그 머신의 모든 프로젝트** |
| **project** | 프로젝트 | `.mcp.json` (git 커밋) | **팀 공유** | 그 프로젝트 |

**우선순위**: 이름 충돌 시 **local > project**. 병합되지 않고 하나가 이긴다.

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| `${VAR}` | 환경 변수 치환 | 비밀값을 커밋하지 않고 각자 환경에서 주입 |
| `${VAR:-default}` | 기본값 치환 | 변수 미설정 시 default 문자열 사용 |
| `CLAUDE_PROJECT_DIR` | 프로젝트 디렉터리 | Claude Code가 **스폰된 서버 환경에 직접 주입** |
| pending approval | 승인 대기 | 클론한 `.mcp.json` 서버는 명시적 승인 필요 |
| `headersHelper` | 헤더 헬퍼 | 연결마다 스크립트를 실행해 **stdout으로 헤더 JSON** 생성 |
| `alwaysLoad: true` | 항상 로드 | 해당 서버 도구를 세션 시작 시 컨텍스트에 로드 |
| reserved built-in name | 예약된 내장 이름 | `computer-use` 등은 커스텀 서버명으로 못 씀 |
| `list_changed` | 목록 변경 알림 | 서버가 도구 추가 시 보내는 MCP 알림 → 자동 새로고침 |

### 정답 키워드 (Correct)
- **"user scope so the entry is written to `~/.claude.json` and loads across every project on that machine without being shared"** (모든 프로젝트 + 비공유) — 5·40번
- **"Local scope, since it stores the entry under that specific project's path in `~/.claude.json` and stays private"** (그 프로젝트 한정 + 개인 전용) — 71번
- **"project scope in `.mcp.json`, and set the header to `Authorization: Bearer ${GITHUB_TOKEN}` so each teammate's environment supplies the value"** (프로젝트 스코프 + 환경 변수 치환) — 67번
- **"The local-scoped definition, because local scope takes precedence over project scope when names collide, and the two entries are not merged"** (local이 우선, 병합 안 됨) — 23번
- **"It resolves correctly, since Claude Code injects `CLAUDE_PROJECT_DIR` into the spawned server's own environment, though a default like `${CLAUDE_PROJECT_DIR:-.}` remains safer practice"** (주입되므로 동작하지만 기본값이 더 안전) — 18번
- **"The literal string `us-east-1`, because the `${VAR:-default}` syntax falls back to the default when the variable is not set"** — 64번
- **"It appears as pending approval, because project-scoped servers from `.mcp.json` require the contributor to explicitly approve them"** (승인 대기 상태) — 81번
- **"Claude Code rejects or skips the server because `computer-use` is a reserved built-in name"** (예약어 충돌로 거부/스킵) — 8번
- **"Configure `headersHelper` to run a script that generates the token and writes the resulting header JSON to stdout on each connection"** (연결마다 스크립트 실행 → stdout 헤더) — 70·82번
- **"Set `alwaysLoad: true` on that server's entry so its tools load into context at session start instead of being deferred behind tool search"** — 35번
- **"It will automatically refresh the tools from that server after receiving its `list_changed` notification, making the new tool usable without a disconnect"** (재연결 없이 자동 갱신) — 15·16번
- **"Tools from all three connected servers are available simultaneously, so it can call across them within the same turn"** (여러 MCP 서버 도구 동시 사용 가능) — 24번
- **"Type an `@` mention in the prescribed form, such as `@docs:file://api/authentication`"** (@멘션으로 리소스 인라인 참조) — 44번
- **"Have the MCP server expose an issue-summary catalog as an MCP resource, so the agent can see available issues up front"** (탐색 검색 대신 리소스 카탈로그) — 54번
- **"Adopt an existing community or vendor Jira MCP server for the standard integration, and reserve custom server work for the team-specific pipeline"** (표준은 기성품, 사내 전용만 커스텀) — 76번

### 함정 키워드 (Distractor)
- **"project scope so the entry is written to `.mcp.json` and stays private until the developer marks it as personal-only"** (프로젝트 스코프인데 개인 전용) — 존재하지 않는 옵션
- **"local scope so the entry is written to `.mcp.json` but excluded via `.gitignore`"** (local이 .mcp.json에 기록) — 위치가 틀림 + 프로젝트에 묶임
- **"Add the server directly inside `.claude/settings.json`"** (settings.json에 MCP 서버 정의) — 표준 경로 아님
- **"The project-scoped definition, because `.mcp.json` is checked into version control and therefore always overrides"** (버전 관리되니 항상 우선) — 반대
- **"Both definitions are merged field by field"** / **"Neither connects, because a duplicate name is a configuration error"** (병합·양쪽 실패) — 거짓
- **"The expansion silently becomes an empty string, since Claude Code never provides a value"** / **"can only ever be read from the invoking shell"** / **"falls back automatically to the home directory"** — 18번의 오답 3종
- **"An empty string, because Claude Code always expands an unset variable to blank"** / **"A parse failure"** / **"The literal text `${API_REGION:-us-east-1}`, because default expansion only applies inside the `env` block"** — 64번의 오답 3종
- **"paste each teammate's literal token value into the shared header field before committing"** (실제 토큰을 커밋) — 보안 사고
- **"add `.mcp.json` to `.gitignore` so the repository never contains the config"** (설정 파일 자체를 제외) — 공유 목적 파괴
- **"have every teammate individually edit their own copy to insert their personal token"** (각자 직접 토큰 삽입) — 유출 위험
- **"It connects immediately and silently, because checking into `.mcp.json` is implicit approval"** (묵시적 승인) — 보안 설계 위배
- **"It is renamed automatically with a numeric suffix"** / **"It fails to load, because project-scoped servers only activate for the teammate who added them"** — 없는 동작
- **"Enterprise scope, since managed configuration is the only mechanism that restricts a server to a single project"** (엔터프라이즈 스코프) — 목적이 다름
- **"loads the custom server but silently strips its screenshot tool"** / **"hides the built-in server"** / **"merges the tools into the built-in server's tool set"** — 8번의 오답 3종
- **"Ignore the `list_changed` notification, as tools are only loaded at session start"** / **"Require the user to run `/mcp` and manually select Refresh tools"** / **"Disconnect and silently reconnect, discarding in-flight calls"** — 15·16번의 오답
- **"Only one MCP server can hold an active connection at any given time"** / **"Only the tools from the server whose name the prompt matches will be loaded"** / **"must complete every Postgres call before Sentry tools become selectable"** — 24번의 오답
- **"Increase `MAX_MCP_OUTPUT_TOKENS` for just that server"** / **"Set `ENABLE_TOOL_SEARCH=false` globally"** / **"Move that server from project scope to user scope so its tools are prioritized"** — 35번의 오답
- **"Configure a static `headers` entry with the token hardcoded, then rotate manually"** (정적 헤더 + 수동 로테이션) — 매 연결 갱신 요구에 부적합
- **"Configure the `oauth` block with `authServerMetadataUrl` pointed at the internal Kerberos realm"** (OAuth 블록으로 Kerberos) — OAuth 서버가 없다고 명시됨
- **"Add a `resources` field naming the document inside `.mcp.json`"** / **"Call `list_resources` manually and paste the raw JSON"** / **"Ask the agent to 'open the docs server' and trust it infers"** — 44번의 오답
- **"Add several more search-related tools"** / **"Increase the tool-call timeout"** / **"Switch transport from stdio to HTTP so queries complete faster"** — 54번의 오답
- **"Skip MCP for both and give the agent direct Bash access to curl the API"** / **"Build custom servers for both, since only in-house servers can be trusted"** — 76번의 오답

---

## 7. Claude Code 파일 도구 (Read / Write / Edit / Grep / Glob / Bash)

**해당 문제**: 3, 20, 26, 32, 39, 48, 52, 55, 57, 58, 61, 66, 69, 73, 83, 85

### 도구 선택 대조표 (최중요)
| 목적 | 한국어 | 도구 |
|---|---|---|
| find files **by name pattern** | 이름 패턴으로 파일 찾기 | **Glob** (`**/*.test.tsx`) |
| find text **inside** files | 파일 내용 검색 | **Grep** |
| text spanning line breaks | 줄바꿈을 넘는 텍스트 | **Grep + multiline** |
| create a brand-new file | 새 파일 생성 | **Write** (사전 Read 불필요) |
| overwrite an existing file | 기존 파일 덮어쓰기 | **Read 먼저 → Write** |
| whole-file / nearly every line | 파일 전체·거의 모든 줄 | **Read → Write 1회** |
| a few isolated lines | 일부 줄만 | **Edit** |
| run a command, see output | 명령 실행·출력 확인 | **Bash** |

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| read-before-edit check | 편집 전 읽기 검증 | 안전장치. 디스크에서 파일이 바뀌면 Edit 실패 |
| unique `old_string` | 고유한 old_string | 중복 매칭 시 실패 → **주변 문맥을 넓혀** 유일하게 |
| `replace_all` | 전체 치환 | 모든 occurrence를 바꿀 때만 |
| gitignored file | git 무시 파일 | Grep 기본 검색 제외 → **경로를 직접 지정**하면 검색됨 |
| incremental exploration | 점진적 탐색 | CLAUDE.md/AGENTS.md → Grep → 호출 체인 따라 부분 읽기 |

### 정답 키워드 (Correct)
- **"Read the file again to confirm current content, then call `Write` with the entire re-indented file content in a single call"** (전체 재작성은 Write 1회) — 3번
- **"Read the file to load its full contents, then call `Write` with the complete restructured file content back over that same path"** — 55번
- **"`Write`, providing the full file path and the complete specified content, since creating a brand-new file does not require a prior read"** (새 파일은 사전 Read 불필요) — 26번
- **"Read the existing file first, since `Write` requires it to have been read in this conversation before overwriting an existing file"** (기존 파일 덮어쓰기는 사전 Read 필수) — 83번
- **"Widen `old_string` to include enough surrounding context to uniquely identify the intended occurrence, then retry `Edit`"** (문맥을 넓혀 유일하게) — 48번
- **"Include the surrounding JSON key and adjacent structure, such as the `"version":` prefix and its line, so the string becomes unique to that field"** — 39번
- **"The file changed on disk since Claude's earlier read, so the read-before-edit check fails; Claude should re-read it and retry `Edit`"** — 66번
- **"Run `Grep` across the repo, then `Grep` the gitignored bundle's path directly, since a direct path is still searched"** (직접 경로 지정하면 gitignore도 검색됨) — 20번
- **"Run `Grep` with output mode `content` and a glob scope to list every file and line, then review that list before editing"** — 52번
- **"`Glob`, using patterns such as `**/*.test.tsx`, `**/*.spec.tsx`, and `**/*Test.tsx`"** — 69번
- **"Use `Glob` to list component files and test files separately by their naming pattern, then compare the two path lists for gaps"** (경로 목록 비교, 파일 읽기 없이) — 57번
- **"Re-run `Grep` with multiline mode enabled so the pattern can match text that spans across the line boundary"** — 73번
- **"Run `Grep` scoped to Python files with `type` set to `py`, and enable multiline mode so wrapped class headers are matched"** — 85번
- **"`Bash`, to invoke the project's test runner command and capture its stdout and stderr, including the stack trace"** — 32번
- **"Read `dateUtils.ts` first to identify every exported name including aliases, then `Grep` for each exported name across the codebase"** (별칭까지 파악 후 각각 검색) — 58번
- **"Start by reading CLAUDE.md or AGENTS.md if they exist, then use `Grep` to locate the route handler and its imports, and read files incrementally along the call chain"** — 61번

### 함정 키워드 (Distractor)
- **"Issue one `Edit` call per line of the file"** (줄마다 Edit 호출) — 900회 호출, 극도로 비효율
- **"Call `Glob` to match the file's own path, then rely on its sort-by-modification-time behavior to normalize whitespace"** (Glob이 공백을 정규화) — Glob은 검색 전용
- **"Call `Grep` with output mode `content` ... since retrieving lines through `Grep` also rewrites them in place"** (Grep이 파일을 다시 씀) — Grep은 읽기 전용
- **"Switch to `Grep` with the multiline flag to rewrite the matching line directly, since `Grep` can modify file contents"** — 같은 함정
- **"Run `Grep` with the multiline flag, assuming multiline mode makes `Grep` search gitignored files as a side effect"** (multiline이 gitignore를 뚫음) — 무관한 기능 결합
- **"Re-run `Grep` with output mode `count` instead of `content`, since count mode searches more thoroughly"** / **"output mode `files_with_matches` only, on the assumption it searches more thoroughly"** — 출력 모드는 검색 깊이와 무관
- **"Run `Glob` with the pattern `**/*parseInvoice*` and treat that file list as the complete set of callers"** / **"`**/API_TIMEOUT_MS`"** / **"`**/dateUtils*`"** (파일명으로 호출부를 찾음) — 이름과 내용은 다름
- **"judge from file names alone which ones likely reference the function"** (파일명만 보고 추측)
- **"Use a regular expression in `old_string`, since `Edit` interprets it as regex when quotes are present"** (Edit이 정규식 해석) — 거짓
- **"Use only the bare version string, since `Edit` automatically infers which occurrence is semantically the version field"** (자동 의미 추론) — 없음
- **"Set `replace_all` to true so every occurrence updates, then manually revert whichever one should have stayed"** (전부 바꾸고 되돌리기) — 하나만 바꿔야 하는 요구 위배
- **"Call `Write` with only the new log line as content, expecting `Write` to merge that single line"** (Write가 병합) — Write는 전체 덮어쓰기
- **"`Edit`, providing an `old_string` that matches the contents of an empty file"** (빈 파일에 Edit) — 새 파일은 Write
- **"Delete the file first using `Bash`, since `Write` can only create files that do not already exist"** — 거짓
- **"Nothing extra is required, since `Write` can overwrite any existing file at any time"** — 안전장치 무시
- **"Run `Grep` against the file to confirm its contents, since `Grep` results satisfy the same prior-access requirement as `Read`"** (Grep이 Read를 대신) — 거짓
- **"`old_string` must have contained an unescaped regex metacharacter, so escape every character"** / **"`Edit` calls always fail on the second attempt within a session"** — 없는 규칙
- **"discard the file and recreate it from scratch using `Write`"** (파일을 버리고 새로 생성) — 위험
- **"Use `Read` to open every file under `src` up front"** / **"read every returned file to visually check"** / **"open every file in an interactive editor"** — 컨텍스트 낭비
- **"`Read`, pointed at the project root so it returns a recursive listing"** (Read가 디렉터리 재귀 목록) — 아님
- **"a full-text word count across the repository, reading the files with the highest counts"** (단어 수가 많은 파일이 핵심 로직) — 근거 없음
- **"`Glob` sorted by modification time, then read the twenty most recently modified files"** (최근 수정 = 관련) — 근거 없음
- **"Use `Grep` to search each component file for the word `test`"** (파일 내용에 'test'가 있는지) — 명명 규칙 문제인데 내용 검색
- **"Run the full test suite and count how many components report zero assertions"** (테스트 실행으로 커버리지 파악) — 과한 비용
- **"a single `Grep` for the literal `formatDate`, assuming any caller using the alias `fmt` will also match"** (별칭도 같이 매칭될 것) — 거짓
- **"count how many times the word `export` appears, then read only files exceeding a threshold"** (임의 임계값)
- **"Run `Grep` once per file using `Bash`, on the assumption `Grep` cannot be scoped to one language repo-wide"** — 거짓

---

## 8. 반복 출제 문항 (동일/거의 동일)

같은 내용이 여러 번 나온다. 한 번만 확실히 잡으면 여러 문제를 먹는다.

| 내용 | 문항 | 정답 요지 |
|---|---|---|
| 개인 전용 + 모든 프로젝트 MCP | **5, 40** | user scope → `~/.claude.json` |
| `list_changed` 자동 새로고침 | **15, 16** | 재연결 없이 자동 갱신 |
| `analyze_content` 개명 + 설명 갱신 | **25, 36, 56, 75** | 이름 구체화 + 설명 범위 축소 |
| 마이그레이션 로컬 재시도 후 성공 | **38, 65** | 성공으로 보고, 에스컬레이션 안 함 |
| Kerberos 토큰 매 연결 발급 | **70, 82** | `headersHelper` + stdout 헤더 JSON |
| 필수 필드 누락의 재시도 오분류 | **27, 63** | validation + `isRetryable: false` |
| Grep multiline 필요 | **73, 85** | multiline 모드 활성화 |
| `tool_choice: any` 강제 호출 | **14, 43, 59** | `{"type":"any"}` |

---

## 9. 시험 직전 30초 복습

1. **도구를 잘못 고른다** → 설명을 고친다. **못 쓰게 해야 한다** → 도구를 뺀다.
2. **재시도해도 절대 안 되는 것**(정책·검증·권한) = `isRetryable: false`. **기다리면 되는 것**(429·503·타임아웃) = `transient` + `true`.
3. **결과 0건 ≠ 에러**. **없는 ID = 에러**(`not_found_error`).
4. **스키마 위반은 핸들러 실행 전 프로토콜 에러**, 비즈니스 거절은 도구 결과 안의 `isError`.
5. **텍스트 블록(사람용) + 구조화 메타데이터(기계용)** — 항상 둘 다.
6. **반드시 호출** = `any`. **첫 턴만 특정 도구** = `tool` → 이후 `auto`. **확장 사고 중엔 `any`/`tool` 불가**.
7. **내 머신 전체** = user / **이 프로젝트만 나만** = local / **팀 공유** = project + `${ENV}`. 충돌 시 **local 승**.
8. **이름으로 찾기** = Glob / **내용으로 찾기** = Grep / **줄 넘어감** = multiline / **실행** = Bash.
9. **파일 전체** = Read→Write / **일부** = Edit(실패하면 문맥 확대) / **새 파일** = Write 바로 / **덮어쓰기** = Read 먼저.
10. **로컬에서 해결된 실패는 위로 안 올린다. 한도 소진 실패는 카테고리와 미완료 범위를 붙여 올린다. 부분 결과는 버리지 않는다.**
