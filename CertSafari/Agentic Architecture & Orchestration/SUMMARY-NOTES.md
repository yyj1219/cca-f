# Agentic Architecture & Orchestration — 학습용 핵심 요약 노트

모의시험 93문항(01–50, 61–70, 81–114) 기반. 51–60, 71–80번은 원본 파일에 문항이 없고, 86번은 출제 오류로 삭제되었습니다.

**사용법**: "문제 신호"로 지문 키워드를 잡고 → "정답 키워드"를 고르고 → "함정 키워드"는 버린다.

---

## 0. 5초 판별 치트시트 (Decision Cheatsheet)

| 지문에 이게 보이면 | 정답은 이 방향 |
|---|---|
| guarantee / never / must / always / every time (보장·절대) | **Hook (결정론적)** — 프롬프트 강화는 오답 |
| irreversible / financial / compliance (비가역·금전·규제) | **PreToolUse hook + deny 또는 ask** |
| cannot be known ahead of time / vague / depends on findings (미리 알 수 없음) | **Dynamic orchestrator (동적)** |
| same steps every time / never branch (항상 같은 순서) | **Prompt chain (고정 체인)** |
| independent / none depend on another (서로 독립) | **Parallel 병렬 실행 후 synthesize** |
| never modify / read-only (수정 금지) | **tools 배열을 읽기 전용으로 제한** |
| subagent doesn't know X (서브에이전트가 모름) | **컨텍스트 격리 — 프롬프트에 명시적 전달** |
| different machine / fresh container (다른 머신·새 컨테이너) | **transcript 없음 → 결과를 새 프롬프트에 주입** |
| stale / rewritten file (오래된·변경된 파일) | **재읽기 지시 또는 새 세션 + 요약 주입** |
| two independent explorations (두 갈래 독립 탐색) | **fork_session** |
| tool output 형식 제각각 (출력 형식 불일치) | **PostToolUse hook + updatedToolOutput** |
| tool input 정규화·덮어쓰기 (입력 정규화) | **PreToolUse hook + updatedInput** |

**만능 오답 패턴 (거의 항상 함정)**
- "prompt를 더 강하게/반복해서 쓴다" (system prompt 강화)
- "temperature를 낮춘다"
- "더 큰 모델로 바꾼다"
- "maxTurns를 늘린다"
- "timeout을 늘린다"
- "always / never / all / only" 같은 절대 단정어가 들어간 보기
- 문제와 무관한 파라미터를 만능 해결책처럼 제시하는 보기

---

## 1. 에이전트 루프 & Messages API (Agent Loop)

**해당 문제**: 1, 5, 19 / 6·12·13·16(21-40) / 64, 68 / 83, 99, 111

### 핵심 개념
| 원문 | 한국어 | 의미 |
|---|---|---|
| `stop_reason` | 정지 이유 | 루프 제어의 **유일한 공식 신호** |
| `end_turn` | 턴 종료 | 도구 요청 없이 완료 → **루프 종료** |
| `tool_use` | 도구 사용 | 도구 실행 후 결과 넣고 **루프 계속** |
| `tool_result` | 도구 결과 | **user role 메시지**에 담아 append |
| `tool_use_id` | 도구 호출 ID | 각 결과를 원래 호출에 **1:1 매핑** |
| `is_error: true` | 오류 표시 | 실패해도 **중단 말고 모델에게 전달** |
| agentic loop | 에이전틱 루프 | 요청→도구→결과→재요청 반복 |

### 정답 키워드 (Correct)
| 원문 키워드 | 한국어 |
|---|---|
| stop_reason directly reports whether Claude finished its turn | stop_reason이 턴 완료 여부를 직접 보고 |
| which is the documented signal | 이것이 문서화된 신호 |
| a new user-role message appended after the assistant | assistant 메시지 뒤 새 user 메시지로 |
| matching each result to its own tool_use_id | 각 결과를 자기 tool_use_id에 매핑 |
| append a separate tool_result block for each | 각각에 별도 tool_result 블록 추가 |
| send the full updated conversation back to Claude | 갱신된 전체 대화를 Claude에 재전송 |
| let Claude see the failure and decide next | Claude가 실패를 보고 다음을 결정 |
| such as retrying with different arguments | 다른 인자로 재시도하는 등 |
| end_turn is a valid immediate completion | end_turn은 유효한 즉시 완료 |
| whenever Claude can answer without needing a tool | 도구 없이 답할 수 있을 때 |
| a final response with no further tool request | 추가 도구 요청 없는 최종 응답 |
| the tool_result was never added to the context | tool_result가 컨텍스트에 추가되지 않음 |
| no record the file was already read | 모델에 파일을 읽은 기록이 없음 |
| the application must execute each requested tool | 애플리케이션이 요청된 각 도구를 실행 |
| the API never runs client-side tools itself | API는 클라이언트 측 도구를 실행하지 않음 |
| cut the loop off while stop_reason is tool_use | stop_reason이 tool_use인데 루프를 끊음 |
| bundles built-in tools and runs the loop internally | 내장 도구 포함, 루프를 내부 실행 |

### 함정 키워드 (Distractor)
| 원문 키워드 | 한국어 | 왜 틀렸나 |
|---|---|---|
| the final text block is non-empty | 마지막 텍스트 블록이 비어있지 않음 | 도구 호출 중에도 텍스트 발생 |
| treated as the only reliable indicator | 유일하게 신뢰할 지표로 취급 | 신뢰 불가 |
| through the total count of content blocks | 콘텐츠 블록 총 개수를 통해 | 완료 신호 아님 |
| stop_reason and text emptiness always change together | stop_reason과 텍스트 유무가 항상 함께 변함 | 거짓 |
| as metadata on the HTTP request headers | HTTP 요청 헤더의 메타데이터로 | 틀림 |
| in a separate system-role message before the prompt | 프롬프트 앞 별도 system 메시지에 | 틀림 |
| inside that same assistant-role message, replacing it | 같은 assistant 메시지 안에 넣어 대체 | 틀림 |
| Claude executes them internally on Anthropic's servers | Anthropic 서버에서 내부적으로 실행 | 거짓 |
| only if the application registers a webhook URL | 애플리케이션이 웹훅 URL을 등록해야만 | 없는 기능 |
| automatically executes any tool whose name matches | 이름이 일치하는 도구를 자동 실행 | 없음 |
| is_error becomes the sole termination signal | is_error가 유일한 종료 신호가 됨 | 아님 |
| error tool_results reset that tool's rate limits | 에러 결과가 그 도구의 rate limit 초기화 | 거짓 |
| the context window silently resets | 컨텍스트 윈도우가 조용히 초기화됨 | 없는 동작 |
| automatically clears tool_use blocks from history | 이력에서 tool_use 블록을 자동 삭제 | 없는 동작 |
| the API enforces a hard limit of five | API가 자체 5회 하드 제한을 강제 | 거짓 |
| Client SDK cannot return stop_reason at all | Client SDK는 stop_reason을 아예 반환 못함 | 거짓 |
| both SDKs need identical amounts of loop code | 두 SDK 모두 동일한 양의 루프 코드 필요 | 거짓 |

### Client SDK vs Agent SDK (99번)
- 정답: **"Agent SDK bundles built-in tools and runs the agentic loop internally, while the Client SDK requires manually inspecting stop_reason"** (Agent SDK는 내장 도구 + 루프 자체 제공 / Client SDK는 직접 stop_reason 확인 후 루프 작성)
- 함정: "Client SDK cannot return stop_reason at all" (아예 반환 못함 — 거짓), "both need an identical amount of custom loop code" (동일한 양의 코드 필요 — 거짓)

---

## 2. Hooks — 결정론적 제어 (Deterministic Guardrails)

**해당 문제**: 6, 7, 17, 18 / 1·2·3·4·17·18(21-40) / 48, 61, 65 / 81, 85, 88, 96, 98, 102, 104, 107, 113

### 훅 종류와 용도 (반드시 암기)
| 원문 | 한국어 | 언제 쓰나 |
|---|---|---|
| **PreToolUse** | 도구 실행 **전** | 차단(deny), 승인 요청(ask), **입력 정규화·덮어쓰기(updatedInput)** |
| **PostToolUse** | 도구 실행 **후** | **출력 정규화(updatedToolOutput)**, 결과 형식 통일 |
| **SubagentStop** | 서브에이전트 종료 시 | 완료 감지 및 **결과 집계(aggregate)** |
| **UserPromptSubmit** | 사용자 입력 제출 시 | 프롬프트 전처리 |
| **SessionStart** | 세션 시작 시 | 초기 컨텍스트 주입 |
| **Notification** | 권한 프롬프트 등 | 결과 정보는 담지 못함 |

### permissionDecision 3종
| 값 | 한국어 | 언제 |
|---|---|---|
| `deny` | 거부 | 절대 안 되는 것 (정책 위반, 검증 실패) |
| `ask` | 사람에게 확인 요청 | **비가역 작업 + 인간 검토 필요** (예: $500~$1000 환불) |
| `allow` | 허용 | 저위험·읽기 전용 작업 |

### 정답 키워드 (Correct)
| 원문 키워드 | 한국어 |
|---|---|
| enforces the rule entirely outside of model generation | 모델 생성 과정 밖에서 규칙을 강제 |
| cannot be bypassed by unusual phrasing or injection | 특이한 표현이나 주입으로 우회 불가 |
| deterministically enforces on every matching tool call | 매칭되는 모든 도구 호출에 결정론적 강제 |
| the prompt only influences the likelihood | 프롬프트는 가능성에만 영향 |
| registered in application code separate from the prompt | 프롬프트와 분리된 애플리케이션 코드에 등록 |
| a prompt edit cannot silently remove the enforcement | 프롬프트 수정으로 강제력이 사라지지 않음 |
| returns permissionDecision "deny" with a reason | 이유와 함께 deny 반환 |
| whenever the amount exceeds $500 | 금액이 $500를 초과할 때마다 |
| permissionDecision "ask" so it is surfaced for approval | 승인용으로 노출되도록 ask 반환 |
| a single PreToolUse hook that normalizes then checks | 정규화 후 검증하는 단일 PreToolUse 훅 |
| returning an updatedInput with the normalized value | 정규화된 값을 담은 updatedInput 반환 |
| updatedInput that overwrites the tool's customer_id argument | 도구의 customer_id 인자를 덮어쓰는 updatedInput |
| returns hookSpecificOutput.updatedToolOutput | updatedToolOutput으로 반환 |
| rewritten into one consistent format | 하나의 일관된 형식으로 재작성 |
| replaces output for all tools, built-in and MCP | 내장과 MCP 도구 모두의 출력을 교체 |
| catch the timeout and return permissionDecision "deny" | 타임아웃을 잡아 deny 반환 |
| the second operates on the first hook's output | 두 번째 훅이 첫 훅의 출력에서 동작 |
| inside the callback by reading tool_input | 콜백 안에서 tool_input을 읽어 |
| since matchers only filter by tool name | matcher는 도구 이름만 필터하므로 |
| inspect the explicit verification result in the parameters | 파라미터의 명시적 검증 결과를 확인 |
| instead of relying on a separate boolean flag | 별도 불리언 플래그에 의존하는 대신 |
| prompt instructions have a non-zero failure rate | 프롬프트 지시는 실패율이 0이 아님 |
| the regex matcher is unanchored | 정규식 matcher에 앵커가 없음 |
| anchor the regex with ^ and $ | 정규식을 ^와 $로 고정 |

### 함정 키워드 (Distractor)
| 원문 키워드 | 한국어 | 왜 틀렸나 |
|---|---|---|
| state the rule three times using varied phrasings | 임계값 규칙을 다양한 표현으로 세 번 진술 | 확률적, 보장 불가 |
| lower the model's temperature to 0.1 | 모델 temperature를 0.1로 낮춤 | 결정론 아님 |
| repeats the requirement twice and adds "must" | 요구사항을 두 번 반복하고 must 추가 | 프롬프트 강화 함정 |
| a larger context window to retain the instruction | 지시를 유지하도록 더 큰 컨텍스트 윈도우 | 무관 |
| a PostToolUse hook writing to an audit log | 감사 로그에 기록하는 PostToolUse 훅 | 이미 실행된 뒤 |
| triggers a post-hoc review process | 사후 검토 프로세스를 트리거 | 차단 실패 |
| return "allow" since the outage isn't their fault | 장애는 고객 잘못이 아니므로 allow 반환 | Fail-Open, 보안 붕괴 |
| increase the hook's timeout to several hours | 훅 타임아웃을 몇 시간으로 증가 | 해결 아님 |
| remove the hook entirely during the outage | 장애 동안 훅을 완전히 제거 | 강제력 포기 |
| a regex in the matcher string, category=restricted | matcher 문자열에 category=restricted 같은 정규식 | 인자는 필터 못함 |
| a second matcher field called argument_matcher | argument_matcher라는 두 번째 필드 | 존재하지 않음 |
| updatedInput automatically propagates between PreToolUse hooks | updatedInput이 훅 간에 자동 전파됨 | 보장 안 됨 |
| executes hooks in alphabetical order by name | SDK가 훅을 이름 알파벳순으로 실행 | 지어낸 규칙 |
| declared using the same HookMatcher timeout value | 동일한 HookMatcher 타임아웃 값으로 선언 | 지어낸 규칙 |
| both hooks must share the same tool_use_id | 두 훅이 같은 tool_use_id를 공유해야 함 | 지어낸 규칙 |
| regex matchers are automatically anchored to match exactly | 정규식 matcher가 자동으로 정확히 앵커됨 | 거짓 |
| reverse the transaction if the flag is invalid | 플래그가 무효면 거래를 되돌림 | 비가역 작업에 부적절 |
| replace the model with a more capable one | 더 크고 유능한 모델로 교체 | 결정론 아님 |
| updatedMCPToolOutput is intended for cross-tool replacement | updatedMCPToolOutput이 교차 도구 교체용 | MCP 전용 |

### MCP matcher 정규식 (17·18번(21-40), 48번, 113번)
| 패턴 | 의미 | 판정 |
|---|---|---|
| `mcp__billing__.*` / `mcp__billing__*` | billing 서버의 **모든 도구** | ✅ 정답 |
| `mcp__billing__(issue_refund\|void_authorization\|apply_credit)` | 특정 3개 도구만 | ✅ 정답 |
| `mcp__billing` | 접두사만 (도구 구분 못함) | ❌ 함정 |
| `^mcp__` | 모든 MCP 서버 (inventory까지 매칭) | ❌ 함정 |
| `billing` | 앵커 없음, 아무 데나 매칭 | ❌ 함정 |
| `/refund/` | 앵커 없음 → `issue_refund_note`도 매칭 | ❌ 함정 |
| `/^refund$/` | 정확히 `refund`만 | ✅ 정답 |

**MCP 도구 이름 규칙**: `mcp__<서버명>__<도구명>` (밑줄 **2개**씩)

**주의 (102번)**: "`allow` + `updatedInput`으로 환불을 no-op으로 바꿔치기"는 보통 우회처럼 보이지만, **재시도 루프 차단**을 묻는 102번에서는 정답입니다. 지문이 "denied 후 모델이 계속 재시도한다"를 문제 삼는지 확인하세요.

---

## 3. 작업 분해 패턴 (Task Decomposition Patterns)

**해당 문제**: 13, 14, 15, 16, 20 / 5·7·9·14·20(21-40) / 41, 42, 46, 50, 62, 70 / 90, 91

### 패턴 선택 기준 ★ 가장 자주 나오는 축
| 패턴 (원문) | 한국어 | 선택 조건 (지문 신호) |
|---|---|---|
| **Prompt Chaining** | 프롬프트 체이닝 | steps **never branch**, same order every time (항상 같은 고정 순서) |
| **Parallelization** | 병렬화 | subtasks are **independent** (서로 의존 없음) |
| **Orchestrator-Workers / Dynamic Orchestration** | 동적 오케스트레이션 | **cannot be known ahead of time**, depends on what earlier steps uncover |
| **Map-Reduce / Divide and Conquer** | 분할 정복 | 항목이 너무 많아 **attention dilution** (주의력 희석) |
| **Routing** | 라우팅 | 요청마다 복잡도가 달라 필요한 것만 호출 |

### 정답 키워드 (Correct)
| 원문 키워드 | 한국어 |
|---|---|
| a fixed prompt chain, steps never branch | 단계가 분기하지 않으므로 고정 체인 |
| adaptive decomposition based on findings | 발견 내용에 기반한 적응형 분해 |
| generates and prioritizes new investigation subtasks | 새 조사 하위작업을 생성·우선순위화 |
| based on what each prior step uncovers | 각 이전 단계가 밝혀낸 것에 근거 |
| the subtasks are independent, so parallelization improves efficiency | 하위작업이 독립적이라 병렬화가 효율을 높임 |
| investigate concurrently rather than one after another | 순차 대신 동시에 조사 |
| combine the findings into one synthesized reply | 결과를 하나의 종합 답변으로 결합 |
| a per-file local analysis pass on each file | 파일마다 개별 로컬 분석 패스 |
| then a separate cross-file integration pass | 그다음 별도의 파일 간 통합 패스 |
| the first pass already dilutes attention across files | 첫 패스가 이미 파일 전반에 주의력을 희석 |
| a checkpoint between each stage | 각 단계 사이의 체크포인트 |
| so a malformed draft can be caught | 잘못된 초안을 잡아낼 수 있도록 |
| decomposes cleanly into fixed, predictable subtasks | 고정되고 예측 가능한 하위작업으로 깔끔히 분해 |
| predictability without delegation overhead | 위임 오버헤드 없는 예측 가능성 |
| adds unnecessary complexity and latency without improving | 개선 없이 불필요한 복잡도와 지연만 추가 |
| decomposed the query too narrowly | 쿼리를 너무 좁게 분해함 |
| the subtasks left broad areas uncovered | 하위작업이 넓은 영역을 다루지 못함 |
| rewrite around the research goal and quality bar | 목표와 품질 기준 중심으로 프롬프트 재작성 |
| rather than a fixed step sequence | 고정된 단계 순서 대신 |
| lets the model adapt its action to findings | 모델이 발견에 맞춰 행동을 조정 |
| a lightweight classification prompt returning structured JSON | 구조화 JSON을 반환하는 경량 분류 프롬프트 |
| dynamically invoke only the subagents listed | 나열된 서브에이전트만 동적으로 호출 |
| the steps cannot be predicted upfront | 단계를 사전에 예측할 수 없음 |

### 함정 키워드 (Distractor)
| 원문 키워드 | 한국어 | 왜 틀렸나 |
|---|---|---|
| dynamic decomposition is always the safer default | 동적 분해가 항상 더 안전한 기본값 | always는 오답 신호 |
| always produces better results than any fixed order | 어떤 고정 순서보다 항상 더 나은 결과 | 절대 단정 |
| any financial workflow must follow one predetermined sequence | 금융 워크플로는 정해진 한 순서를 따라야 함 | 거짓 |
| let the model silently skip unnecessary rules | 모델이 불필요하다 판단한 규칙을 조용히 생략 | 컴플라이언스 위반 |
| an even more granular ten-step sequence | 훨씬 더 세분화된 10단계 순서 | over-specification |
| to remove ambiguity entirely | 모호성을 완전히 제거하려고 | 과잉 명세 |
| a step to double-check the date already extracted | 이미 추출한 날짜를 재확인하는 단계 추가 | 근본 원인 미해결 |
| increase the article count from five to six | 필요 기사 수를 5개에서 6개로 증가 | 숫자 조정 함정 |
| ask the customer to submit two separate tickets | 고객에게 티켓 두 개를 따로 제출하게 함 | 사용자에게 부담 전가 |
| randomize the file order before each run | 실행마다 파일 순서를 무작위화 | 희석 미해결 |
| raise the review prompt's sampling temperature | 리뷰 프롬프트의 샘플링 temperature 상승 | 희석 미해결 |
| a longer prompt defining an integration bug | 통합 버그를 정의하는 더 긴 시스템 프롬프트 | 구조 문제를 덮음 |
| audits always follow the same three fixed steps | 감사는 항상 같은 3단계를 따름 | 미지의 조사에 부적합 |
| determine exploitability from the CVE description alone | CVE 설명만으로 악용 가능성 판단 | 코드 미검사 |
| skip the address change silently | 주소 변경을 조용히 생략 | 다중 의도 실패 |
| a new session with no memory of it | 티켓 기억이 없는 새 세션을 시작 | 맥락 손실 |

## 4. 서브에이전트 & 코디네이터 (Subagents & Coordination)

**해당 문제**: 2, 4, 8, 9, 11 / 8·15·19(21-40) / 43, 44, 45, 47, 69 / 87, 93, 94, 95, 97, 100, 101, 106, 108, 109, 110, 112, 114

### 핵심 개념
| 원문 | 한국어 | 핵심 |
|---|---|---|
| **Task tool** | Task 도구 | 서브에이전트 호출 도구. `allowedTools`에 없으면 매번 권한 프롬프트 |
| **description field** | 설명 필드 | **자동 위임(라우팅)의 트리거 신호** — 모호하면 위임 안 됨 |
| **prompt field** | 프롬프트 필드 | 서브에이전트의 **영구 시스템 프롬프트** (전문성 정의) |
| **per-call prompt** | 호출별 프롬프트 | 그 실행의 **구체적 작업 내용** |
| **tools array** | 도구 배열 | 권한 제한 수단 — **최소 권한 원칙** |
| **Context isolation** | 컨텍스트 격리 | 서브에이전트는 부모·형제 맥락을 **자동 상속하지 않음** |
| **Hub-and-Spoke** | 허브 앤 스포크 | 모든 통신을 코디네이터 경유 → 로깅·재시도·오류처리 중앙화 |
| **Agent Teams** | 에이전트 팀 | 에이전트 간 **직접 메시징** + 다중 세션 중앙 관리 |
| **Nesting depth** | 중첩 깊이 | **최대 5단계** (메인 에이전트를 1단계로 포함) |

### 정답 키워드 (Correct)
| 원문 키워드 | 한국어 |
|---|---|
| emit all three Task calls within one response | 한 응답 안에서 Task 호출 3개를 발행 |
| instead of spreading them across separate turns | 여러 턴에 나눠 보내는 대신 |
| agent teams, which support inter-agent messaging | 에이전트 간 메시징을 지원하는 에이전트 팀 |
| centralized management of multiple coordinating sessions | 여러 세션의 중앙 집중 관리 |
| SubagentStop fires on subagent completion | 서브에이전트 완료 시 SubagentStop 발화 |
| lets the coordinator aggregate each subagent's results | 코디네이터가 각 결과를 집계하게 함 |
| centralize error handling, logging, and retry policy | 오류처리·로깅·재시도 정책을 중앙화 |
| route all inter-subagent communication through the coordinator | 모든 에이전트 간 통신을 코디네이터 경유 |
| structured entries that separate content from metadata | 내용과 메타데이터를 분리한 구조화 항목 |
| source URL, document name, and page number | 출처 URL, 문서명, 페이지 번호 등 |
| matches the query against each subagent's description field | 쿼리를 각 서브에이전트의 description과 매칭 |
| delegates automatically when a match is found | 매칭되면 자동으로 위임 |
| the description field is vague or missing | description 필드가 모호하거나 누락됨 |
| no trigger signal for when it applies | 언제 적용할지 트리거 신호가 없음 |
| Task is not listed in allowedTools | allowedTools에 Task가 없음 |
| set tools to ["Read", "Grep"] on the definition | 정의의 tools를 Read, Grep으로 설정 |
| inherits only the listed read tools | 나열된 읽기 도구만 상속 |
| omit it from final-summarizer's definition | final-summarizer 정의에서는 제외 |
| each invocation starts a fresh context | 각 호출이 새 컨텍스트로 시작 |
| unless a specific prior agent is explicitly resumed | 특정 이전 에이전트를 명시적으로 재개하지 않는 한 |
| subagents never automatically inherit parent or sibling context | 서브에이전트는 부모·형제 맥락을 자동 상속하지 않음 |
| include the complete findings directly in the prompt | 전체 결과를 프롬프트에 직접 포함 |
| AgentDefinition.prompt sets the persistent system prompt | AgentDefinition.prompt가 영구 시스템 프롬프트 설정 |
| the per-call prompt supplies the specific task details | 호출별 프롬프트가 구체적 작업 내용 제공 |
| nest up to a maximum five levels deep | 최대 5단계 깊이까지 중첩 |
| including the main agent as the first level | 메인 에이전트를 1단계로 포함 |
| evaluate the synthesis output for gaps | 종합 출력의 누락을 평가 |
| re-delegate targeted queries before re-invoking synthesis | 재종합 전에 표적 쿼리를 재위임 |
| move orchestration into a script outside the conversation | 오케스트레이션을 대화 밖 스크립트로 이동 |
| presents the conflicting reports with references to sources | 상충 보고를 출처와 함께 제시 |
| the partial text output the subagent already produced | 서브에이전트가 이미 생성한 부분 텍스트 |
| along with a note that it didn't finish | 완료하지 못했다는 표시와 함께 |
| subagents must inherit coordinator-level deny rules | 서브에이전트는 코디네이터 거부 규칙을 상속 |
| the prompt alone is not a guaranteed invocation | 프롬프트만으로는 호출이 보장되지 않음 |
| required structured fields for customer details | 고객 정보에 대한 필수 구조화 필드 |
| root cause analysis and a recommended action | 근본 원인 분석과 권장 조치 |

### 함정 키워드 (Distractor)
| 원문 키워드 | 한국어 | 왜 틀렸나 |
|---|---|---|
| merge them into a single AgentDefinition | 하나의 AgentDefinition으로 병합 | 병렬성 상실 |
| set persistSession to false on each call | 각 호출에 persistSession을 false로 | 병렬성과 무관 |
| increase maxTurns so they can each finish faster | 각자 더 빨리 끝나도록 maxTurns 증가 | 병렬 아님 |
| appear to overlap more in wall-clock time | 실제 시간상 더 겹쳐 보이게 | 진짜 병렬 아님 |
| assign one subagent to monitor the others' retries | 한 서브에이전트가 나머지의 재시도를 감시 | 허브 앤 스포크 위반 |
| copying the identical code into each subagent's prompt | 동일 코드를 각 서브에이전트 프롬프트에 복사 | 중앙화 아님 |
| direct write access to a shared database | 각 서브에이전트에 DB 직접 쓰기 권한 부여 | 가시성 상실 |
| poll a shared task queue directly | 공유 작업 큐를 직접 폴링 | 실패 가시성 없음 |
| notify the coordinator only after completion | 완료 후에만 코디네이터에 통보 | 실패 가시성 없음 |
| requires the query to include the exact name | 쿼리에 정확한 이름이 포함되어야 함 | 거짓 |
| invokes them in the fixed order defined | 정의된 고정 순서대로 호출 | 거짓 |
| always invokes every defined subagent and discards output | 항상 모든 서브에이전트를 호출하고 결과를 버림 | 거짓 |
| rely on the description field to signal read-only | 읽기 전용임을 description으로 알림 | 강제력 없음 |
| instruct in the prompt never to call Edit | 프롬프트로 Edit 호출 금지를 지시 | 확률적, 보장 불가 |
| lower the model tier to be less capable | 덜 유능하도록 모델 등급을 낮춤 | 넌센스 |
| background execution grants the ability to spawn subagents | 백그라운드 실행이 생성 권한을 부여 | 거짓 |
| only larger models are capable of nested delegation | 큰 모델만 중첩 위임이 가능 | 거짓 |
| nesting is unlimited with the Agent tool | Agent 도구만 있으면 중첩 무제한 | 5단계 제한 |
| all subagents share one combined context window | 모든 서브에이전트가 하나의 컨텍스트를 공유 | 거짓 |
| subagent definitions cache their reasoning across calls | 서브에이전트 정의가 호출 간 추론을 캐싱 | 거짓 |
| increase maxTurns so it can rediscover the sources | 출처를 재발견하도록 maxTurns 증가 | 낭비 |
| a larger model so it infers the context | 맥락을 추론하도록 더 큰 모델로 전환 | 격리 미해결 |
| grant the same search tools to re-run queries | 쿼리 재실행을 위해 같은 검색 도구 부여 | 중복 작업 |
| whichever sub-agent returned first takes precedence | 먼저 응답한 서브에이전트가 우선 | 거짓 |
| the conflicting results should be discarded | 상충하는 결과는 폐기해야 함 | 거짓 |
| independently grants access regardless of deny rules | 거부 규칙과 무관하게 독립적으로 권한 부여 | 거짓 |
| all five subagents in parallel every ticket | 모든 티켓에 5개 서브에이전트를 병렬 실행 | 호출 자체가 문제 |
| remove the coordinator entirely | 코디네이터를 완전히 제거 | 패턴 파괴 |
| increase the coordinator's maxTurns to accommodate more | 더 많은 호출을 위해 maxTurns 증가 | 대규모에 부적합 |
| see the attached conversation transcript for details | 자세한 내용은 첨부된 대화 기록 참조 | 접근 불가 |
| use your judgment on what discount is appropriate | 어떤 할인이 적절한지 알아서 판단 | 구조화 실패 |
| increase its maximum character limit | 최대 글자수 제한을 늘림 | 구조화 아님 |

## 5. 세션 관리 (Session Management)

**해당 문제**: 3, 10, 12 / 10·11(21-40) / 49, 66, 67 / 82, 84, 89, 92, 103, 105

### 핵심 개념
| 원문 | 한국어 | 핵심 |
|---|---|---|
| **resume** | 재개 | 같은 히스토리에 **이어붙임** (순차 누적) |
| **fork / fork_session** | 분기 | **독립된 브랜치** 생성, 원본 보존 |
| **/fork** | 포크 명령 | 터미널 안에서 대화 복사본으로 전환 |
| **transcript** | 트랜스크립트 | 세션 기록 **파일**, 로컬 디스크에 저장 |
| **working directory** | 작업 디렉터리 | 세션이 **바인딩되는 위치** — 다르면 못 찾음 |
| **session name** | 세션 이름 | `/rename` 또는 시작 시 지정 → `--resume <name>` |
| **/clear** | 컨텍스트 비우기 | 히스토리 삭제 |
| **/compact** | 압축 | 히스토리를 요약으로 대체 |

### 정답 키워드 (Correct)
| 원문 키워드 | 한국어 |
|---|---|
| transcript only exists on the original machine | 트랜스크립트가 원래 머신에만 존재 |
| was never copied to the new worker | 새 워커로 복사되지 않음 |
| ran from the same working directory | 동일한 작업 디렉터리에서 실행했는지 |
| run /fork with an optional name | 이름을 지정할 수 있는 /fork 실행 |
| a copy of the conversation so far | 지금까지의 대화 복사본 |
| resuming twice appends both to one shared history | 두 번 재개하면 하나의 이력에 둘 다 추가 |
| forking gives two independent branches | 포크는 두 개의 독립 브랜치를 제공 |
| resume twice with fork_session set | fork_session을 설정해 두 번 재개 |
| producing two branches from the shared baseline | 공유 베이스라인에서 두 브랜치 생성 |
| sessions persist the conversation history | 세션은 대화 이력을 보존 |
| not a snapshot of the filesystem | 파일시스템 스냅샷은 아님 |
| resume the session's ID with a higher max_turns | 더 높은 max_turns로 세션 ID를 재개 |
| claude --resume payment-retry-bug | 이름으로 그 세션을 직접 재개 |
| give the session a descriptive name at startup | 시작 시 세션에 설명적 이름 부여 |
| or via /rename to resume it later | 또는 /rename으로 나중에 재개 가능하게 |
| claude -p --resume --output-format json | 비대화형으로 재개하고 JSON 출력 |
| track each user's captured session ID | 각 사용자의 세션 ID를 기록·추적 |
| capture the key results as application state | 핵심 결과를 애플리케이션 상태로 저장 |
| pass them into a new session's opening prompt | 새 세션의 첫 프롬프트에 전달 |
| inject the already-prepared structured summary | 이미 준비된 구조화 요약을 주입 |
| explicitly tell the agent the file changed | 파일이 변경되었음을 에이전트에 명시적으로 알림 |
| prompting it to re-read that file | 그 파일을 다시 읽도록 유도 |

### 함정 키워드 (Distractor)
| 원문 키워드 | 한국어 | 왜 틀렸나 |
|---|---|---|
| CI workers are restricted from resuming any session | CI 워커는 어떤 세션도 재개할 수 없음 | 거짓 |
| the session name was too long to match | 세션 이름이 너무 길어 매칭 실패 | 거짓 |
| fork_session prevents cross-machine resumption entirely | fork_session이 머신 간 재개를 완전히 막음 | 거짓 |
| the prompt text matched the original exactly | 프롬프트 텍스트가 원본과 정확히 일치 | 거짓 |
| run /clear to empty context and begin | /clear로 컨텍스트를 비우고 시작 | 분기 아님, 원본 손실 |
| /compact to replace history with a summary | /compact로 이력을 요약으로 대체 | 파일 재읽기 안 함 |
| select the same session again to duplicate it | 같은 세션을 다시 선택해 복제 | 복제 안 됨 |
| resume called only once per session id | 세션 ID당 재개는 한 번만 가능 | 거짓 |
| resuming quietly discards all prior tool results | 재개 시 이전 도구 결과를 조용히 폐기 | 거짓 |
| a correct resume would restore the file contents | 올바른 재개라면 파일 내용도 복원 | 거짓 |
| fork_session was required to preserve the earlier state | 이전 상태 보존에 fork_session이 필요했음 | 거짓 |
| a turn limit indicates the approach was flawed | 턴 제한은 접근이 잘못됐음을 의미 | 분석 낭비 |
| rerun the original prompt from scratch | 원래 프롬프트를 처음부터 다시 실행 | 분석 낭비 |
| paste yesterday's terminal scrollback as the first prompt | 어제 스크롤백을 첫 프롬프트로 붙여넣기 | 비효율 |
| manually scroll to find it in the picker | 피커에서 수동으로 스크롤해 세션을 찾음 | 직접적이지 않음 |
| rely on the default auto-generated display name | 자동 생성된 기본 표시 이름에 의존 | 기억 불가 |
| note the raw session ID in a spreadsheet | 원본 세션 ID를 스프레드시트에 기록 | 사람이 읽기 어려움 |
| keep every session running continuously | 모든 세션을 계속 실행 상태로 유지 | 비현실적 |
| pass continue_conversation on every incoming request | 들어오는 모든 요청에 continue를 전달 | 사용자 구분 불가 |
| set fork_session=True on every request | 모든 요청에 fork_session을 True로 설정 | 이어가기 아님 |
| the session picker for a backend service | 백엔드 서비스가 세션 피커에 의존 | 비대화형 불가 |
| expect the transcript to be found automatically | 트랜스크립트가 자동으로 발견되길 기대 | 디스크 없음 |
| rely on claude --continue in the next container | 다음 컨테이너에서 claude --continue에 의존 | 로컬 세션 없음 |
| trust its cached understanding of the file | 파일에 대한 캐시된 이해를 신뢰 | 파일 최신화 안 됨 |
| since resumption restores full context | 재개가 전체 컨텍스트를 복원하므로 | 파일은 아님 |
| continue exploration from its unmodified stale history | 수정되지 않은 오래된 이력에서 탐색을 계속 | 오염 유지 |
| issue /clear right after resuming | 재개 직후 /clear를 실행 | 재개 의미 없음 |

### 67번 — 설정 파일이 바뀐 뒤 세션 이어가기 (공식 문서 검증 완료)

**정답**: "Resume the session and explicitly tell the agent the configuration file changed, prompting it to re-read that file"
(세션을 재개하고, 설정 파일이 변경되었음을 명시적으로 알려 재읽기를 유도한다)

**왜 재개가 맞는가**
- 파일은 매 도구 호출마다 새로 읽습니다 ([Common workflows](https://code.claude.com/docs/en/common-workflows)) — *"Claude reads files fresh on each tool call, so it sees edits you make in another application the next time it reads that file."* 따라서 "재개하면 옛 캐시가 남아 새 내용과 충돌한다"는 논리는 성립하지 않습니다.
- 재개는 도구 호출과 결과를 포함한 **전체 이력**을 복원하므로 ([Manage sessions](https://code.claude.com/docs/en/sessions)) 문제가 요구한 "accumulated reasoning 보존"을 가장 잘 만족합니다.
- 반대로 요약본을 새 세션에 넣는 방식은 문서가 손실을 명시합니다 — *"whatever the summary leaves out is no longer in Claude's context."*

**함정 보기 2개**
- **"캐시된 이해를 그대로 신뢰"** — 재개가 파일 내용까지 최신화해주지는 않으므로, 변경 사실을 알려주지 않으면 옛 내용으로 추론합니다.
- **"재개 직후 /compact"** — 압축은 대화 이력을 요약할 뿐, 디스크의 파일을 새로 읽지 않습니다.

> 참고: 동일 지문에 "새 세션 + 요약"을 정답으로 제시하던 86번은 출제 오류로 확인되어 원본에서 삭제되었습니다.

---

## 6. 자주 반복되는 중복 문제 (Duplicates — 무료 점수)

같은 문제가 보기 순서만 바꿔 재출제됩니다. 정답 **내용**으로 기억하세요.

| 내용 | 출현 위치 |
|---|---|
| 프로덕션 인시던트 조사 → **dynamic orchestrator** | 16번, 46번 |
| MCP billing 서버 matcher → **`mcp__billing__.*`** | 17번(21-40), 48번 |
| doc-reviewer 읽기 전용 → **tools를 Read/Grep으로 제한** | 43번, 47번 |
| 블로그 outline→prose→proofread → **체크포인트 있는 prompt chain** | 50번, 70번 |
| endpoint-finder 두 번 호출 시 메모리 없음 → **정상 동작 (컨텍스트 격리)** | 45번, 114번 |
| 서브에이전트 중첩 깊이 → **최대 5단계** | 95번, 106번 |
| 40개 파일 PR → **파일별 분석 후 통합 패스** | 20번(21-40), 91번 |
| 다중 의도 티켓 → **분해 후 병렬 조사 → 종합** | 14번, 41번 |


---

## 7. 최종 점검 5문장

1. **보장이 필요하면 Hook**, 유도만 하면 프롬프트 — "guarantee / never / must"는 곧 훅이다.
2. **미리 알 수 없으면 동적**, 항상 같으면 고정 체인, 서로 독립이면 병렬.
3. **서브에이전트는 아무것도 상속하지 않는다** — 필요한 건 프롬프트에 명시적으로 넣는다.
4. **세션은 대화 기록일 뿐** — 파일도, 다른 머신도, 새 컨테이너도 따라오지 않는다.
5. **temperature·모델 크기·maxTurns·timeout을 올리자는 보기는 거의 항상 오답이다.**
