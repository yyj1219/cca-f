# Tool Design & MCP Integration 문제 분석 모음

# 1번 문제

**1. 문제 원문**

A `submit_refund` MCP tool rejects a request because the customer's order is past the 30-day return window. The engineer designing the error response wants the agent to explain the rejection to the customer in plain language and never attempt this exact call again. Which response body best achieves this?

A) A text block plus structured content with `errorCategory: "permission"` and a description asking the customer to contact their account administrator.

B) A text block explaining the rejection, along with structured metadata including `errorCategory: "business"` to indicate a business rule violation and a description stating the order fell outside the 30-day return window.

C) A bare text block reading "Refund denied" with no structured metadata.

D) A text block plus structured content with `errorCategory: "transient"` and a description telling the agent to wait 30 seconds and resubmit.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: A text block explaining the rejection, along with structured metadata including `errorCategory: "business"` to indicate a business rule violation and a description stating the order fell outside the 30-day return window.

**정답 및 해설:**


**핵심 개념**: MCP(Model Context Protocol) 오류 처리 및 에러 카테고리 설계
MCP 기반 애플리케이션에서 AI 에러 처리 시, LLM 에이전트가 상황을 올바르게 판단(재시도 여부 결정)하고 사용자에게 명확히 전달할 수 있도록 **자연어 설명(Text Block)**과 **구조화된 에러 메타데이터(Structured Metadata)**를 함께 전달해야 합니다.

**문제 상황 분석:**
- 환불 기간(30일) 경과로 인한 거절은 변경될 수 없는 비즈니스 규칙 위반(Business Logic Violation)에 해당합니다.
- 요구사항 1: 에이전트가 고객에게 쉽게 이유를 설명할 수 있어야 함 (명확한 자연어 텍스트 블록 필요).
- 요구사항 2: 동일한 호출을 다시 시도(Retry)하지 않아야 함 (`transient`가 아닌 비재시도성 카테고리 표기 필요).

**B번이 정답인 이유:**
- **자연어 설명 제공**: 거절 사유 및 30일 경과 사실이 기재된 텍스트 블록을 포함하여 에이전트가 고객에게 상황을 명확히 안내할 수 있습니다.
- **적절한 에러 카테고리 지정**: 비즈니스 로직 위반을 뜻하는 `errorCategory: "business"`를 전달함으로써 에이전트가 동일한 입력으로 도구를 재호출해도 결과가 바뀌지 않음을 인지하고 재시도를 방지할 수 있습니다.

**오답 분석:**

- Option A (오답): `permission`은 권한 문제(액세스 거부)일 때 사용하며, 계정 관리자 연락 안내는 환불 기한 만료 문제와 부합하지 않습니다.
- Option C (오답): 메타데이터가 없는 단순 텍스트("Refund denied")는 AI 에러 판단을 위한 정보가 부족하며, 원인 파악과 적절한 후속 조치를 어렵게 만듭니다.
- Option D (오답): `transient` 카테고리는 일시적 오류(일시적 네트워크 오류 등)를 의미하므로, 에이전트가 30초 후 동일한 요청을 불필요하게 재시도하게 만듭니다.


---


# 2번 문제

**1. 문제 원문**

A coordinator dispatches the same document-indexing task to three subagents in parallel, each covering a different folder. Subagent 1 finishes cleanly. Subagent 2 hits a permission error on one file it cannot resolve locally and reports partial results plus that failure. Subagent 3's process crashes with no output at all. How should the coordinator's downstream handling differ between subagent 2 and subagent 3?

A) The coordinator should treat both subagent 2 and subagent 3 identically by discarding any partial results from subagent 2 and marking both folders for indexing as unprocessed, since neither subagent fully completed its assigned indexing task successfully.

B) The coordinator should treat both subagent 2 and subagent 3 identically by retrying files with permission errors, assuming subagent 3's crash was also due to a permission issue on some file, since that is the most common cause of non-completion in such tasks.

C) For subagent 2, the coordinator should ignore the reported permission error and mark the folder complete, since most files were indexed successfully, and for subagent 3, the coordinator should also mark its folder complete because no error was reported.

D) For subagent 2, the coordinator can use the partial results and address the specific reported permission gap; for subagent 3, lacking completed work or diagnostic detail, it must treat the entire folder as unprocessed.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**D번**: For subagent 2, the coordinator can use the partial results and address the specific reported permission gap; for subagent 3, lacking completed work or diagnostic detail, it must treat the entire folder as unprocessed.

**정답 및 해설:**  

**핵심 개념**: 멀티 에이전트 분산 처리 및 오류 핸들링 (Partial Results vs Process Crash)  
멀티 에이전트 시스템에서 병렬 작업을 수행할 때 발생한 에러의 형태(우아한 실패 보고 vs 예기치 않은 프로세스 다운)에 따라 코디네이터의 후속 처리 전략이 달라집니다. 부분적인 성과와 명확한 진단 정보가 전달된 경우 이를 활용하여 핀포인트 조치를 취하고, 진단 정보가 전혀 없이 강제 종료된 작업은 안전하게 전체 재처리를 준비해야 합니다.

**문제 상황 분석:**  
- 서브에이전트 1: 정상 완결 (추가 조치 불필요).
- 서브에이전트 2: 일부 작업 성공 후 특정 파일의 권한 문제로 실패했음을 코디네이터에게 우아하게 보고함 (부분 결과 및 명확한 오류 메타데이터 존재).
- 서브에이전트 3: 아무런 출력이나 에러 로그 없이 프로세스 자체가 래시(Crash)됨 (완료된 결과물 및 에러 진단 정보가 전무함).

**D번이 정답인 이유:**  
- **서브에이전트 2 대응**: 유효하게 처리된 부분 결과를 버리지 않고 활용하면서, 보고된 단일 권한 문제(Permission Gap)에 대해서만 권한 부여 후 재시도 등의 타겟 조치를 수행할 수 있습니다.
- **서브에이전트 3 대응**: 프로세스가 완전 다운되어 어디까지 진행되었는지 판단할 데이터나 실패 원인 진단 정보가 전혀 없으므로, 데이터 정합성을 위해 해당 폴더 전체를 미처리(Unprocessed) 상태로 간주하고 처음부터 재작업을 계획해야 합니다.

**오답 분석:**  
- Option A (오답): 서브에이전트 2가 제공한 유효한 부분 결과와 진단 정보를 무시하고 모두 버리는 것은 자원 낭비이며 비효율적입니다.
- Option B (오답): 진단 데이터가 전혀 없는 서브에이전트 3의 충돌 원인을 추측에 기반하여 "권한 문제"로 지레짐작하고 처리하는 것은 위험한 자율성 설계입니다.
- Option C (오답): 일부 파일 인덱싱 실패 및 프로세스 충돌로 인한 미완료 상태를 무시하고 폴더 전체를 "완료됨"으로 표시하면 데이터 누락 및 시스템 오작동을 유발합니다.


---


# 3번 문제

**1. 문제 원문**

An architect asks Claude Code to standardize indentation across a 900-line generated file where nearly every line's leading whitespace is inconsistent, affecting the entire file rather than a few isolated lines. Claude has already read the file once earlier and no one else has modified it since. Which approach is most appropriate for applying this change?

A) Read the file again to confirm current content, then call `Write` with the entire re-indented file content in a single call

B) Call `Glob` to match the file's own path, then rely on `Glob` 's sort-by-modification-time behavior to normalize the file's whitespace

C) Issue one `Edit` call per line of the file, each with `old_string` set to that single line's current indentation and text

D) Call `Grep` with output mode `content` to retrieve every line of the file, since retrieving lines through `Grep` also rewrites them in place

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Read the file again to confirm current content, then call `Write` with the entire re-indented file content in a single call

**정답 및 해설:**


**핵심 개념**: Claude Code SDK 도구 활용 패턴 (`Write` vs `Edit`)
파일의 극히 일부(몇 줄)를 수정할 때는 `Edit` 도구를 사용하는 것이 효율적이지만, 파일 전체 또는 대부분의 줄에 영향을 미치는 대규모 변경(들여쓰기 전체 재정렬, 전체 포맷팅 등)의 경우 전체 파일 내용을 단 한 번의 `Write` 도구 호출로 덮어쓰는 것이 안전하고 효율적입니다. 또한 파일 수정 전 현재 상태를 다시 읽어 최신성을 확인하는 것이 권장되는 도구 사용 패턴입니다.

**문제 상황 분석:**
- 900줄에 달하는 전체 파일의 거의 모든 줄에서 들여쓰기 불일치가 발생함.
- 국소적인 수정을 넘어 파일 전반(Entire File)을 다루는 전면적인 텍스트 변경 작업임.
- Claude가 이전에 읽은 적이 있지만, 안전한 덮어쓰기(`Write`) 작업을 수행하기 전에 현재 내용을 최종 확인하는 프로세스가 필요함.

**A번이 정답인 이유:**
- **전체 변경에 최적화**: 900줄 전체의 들여쓰기를 고칠 때 `Edit`을 수백 번 호출하는 것은 토큰 소비와 API 요청 면에서 극도로 비효율적입니다. 전체를 들여쓰기한 결과물로 `Write` 도구를 단 1회 호출해 덮어쓰는 것이 정석입니다.
- **최신 상태 확인**: 안전성을 위해 수정 직전 파일을 다시 읽어 상태를 확정한 후 단일 `Write` 호출로 처리하는 것이 모범 사례입니다.

**오답 분석:**

- Option B (오답): `Glob` 은 파일 시스템에서 파일/디렉토리 경로 패턴을 검색하는 검색 도구이며, 파일 내부 공백을 수정하거나 정규화하는 기능이 전혀 없습니다.
- Option C (오답): 900줄 파일의 모든 줄마다 `Edit` 도구를 개별적으로 900번 호출하는 것은 심각한 자원 낭비이며 오버헤드를 발생시킵니다.
- Option D (오답): `Grep` 은 파일 내용 내 패턴 검색용 도구일 뿐, 파일을 다시 쓰거나(rewrite in place) 변경하는 기능이 없습니다.


---


# 4번 문제

**1. 문제 원문**

A developer is writing a new tool description and wants to minimize the chance the model confuses it with an existing similar tool. Which combination of elements most reliably differentiates the tools for selection purposes?

A) Expected input format, one or two example queries the tool handles, and a note on when to prefer the other tool instead.

B) An exhaustive list of every possible parameter combination the tool accepts, without any narrative explanation of intended use.

C) The name of the engineer who implemented the tool along with its internal implementation language choice.

D) A catchy tool name paired with an emoji so it appears visually distinct within the full list of tools.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Expected input format, one or two example queries the tool handles, and a note on when to prefer the other tool instead.

**정답 및 해설:**


**핵심 개념**: LLM 도구 정의(Tool Description) 및 프롬프트 엔지니어링  
대형 언어 모델(LLM)이 수많은 도구(Tools/Functions) 중에서 올바른 도구를 선택하게 하려면, 명확한 사용 목적, 대표적인 입력 처리 예시, 그리고 유사 도구 간의 경계를 명확히 설명하는 명시적 가이드라인(Negative Guidance / Comparison Note)을 제공하는 것이 가장 효과적입니다.

**문제 상황 분석:**
- 개발자가 기존 도구와 유사한 기능을 하는 새로운 도구를 추가하고 있음.
- 모델이 두 도구의 유사성 때문에 도구 선택에 혼란을 겪을 위험이 있음.
- 모델의 도구 선택 판단력을 극대화할 수 있는 설명 구성 요소의 조합을 찾아야 함.

**A번이 정답인 이유:**
- **입력 형식 명시**: 기대하는 입력 구조를 알려주어 모델이 콘텍스트를 이해하도록 도움.
- **예시 쿼리 활용 (Few-Shot Prompting)**: 어떤 질문이나 지시가 들어왔을 때 이 도구를 써야 하는지 구체적인 유스케이스 예시를 제공함.
- **차별화 참고 사항 (Negative Guidance)**: 유사 도구 대신 이 도구를 사용해야 하는 시점(또는 반대로 다른 도구를 써야 하는 시점)을 직접 명시해 줌으로써 모델의 도구 선택 혼란을 근본적으로 방지함.

**오답 분석:**

- Option B (오답): 의도된 사용 목적에 대한 설명 없이 파라미터 조합만 나열하면 모델은 도구를 언제 호출해야 하는지 맥락을 이해하지 못합니다.
- Option C (오답): 개발자 이름이나 도구의 내부 구현 언어(Python, Rust 등)는 LLM이 사용자의 요청을 처리하기 위해 도구를 선택할 때 아무런 관련이 없는 불필요한 정보입니다.
- Option D (오답): 캐치한 이름이나 이모지는 시각적인 요소일 뿐, LLM의 의미론적 판단(Semantic Reasoning)과 도구 선택 로직 개선에는 거의 도움을 주지 못합니다.


---


# 5번 문제

**1. 문제 원문**

A developer wants to try out an experimental local MCP server that queries their personal Notion workspace. They do not want it to appear for any other teammate, and they want it available whenever they open any project on their own machine. Which configuration achieves this?

A) Add the server with user scope so the entry is written to `~/.claude.json` and loads across every project on that machine without being shared

B) Add the server with project scope so the entry is written to `.mcp.json` and stays private until the developer marks it as personal-only

C) Add the server with local scope so the entry is written to `.mcp.json` but excluded from git tracking via a `.gitignore` rule

D) Add the server directly inside `.claude/settings.json` so it inherits the personal visibility rules of local project settings

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**A번**: Add the server with user scope so the entry is written to `~/.claude.json` and loads across every project on that machine without being shared

**정답 및 해설:**


**핵심 개념**: Claude Code / MCP(Model Context Protocol) 범위 설정 (User Scope vs Project Scope)  
MCP 서버를 설정할 때, 스코프(Scope)에 따라 설정 파일의 저장 위치와 적용 영역이 달라집니다.
- **User Scope**: 사용자 홈 디렉토리의 global 설정 파일(`~/.claude.json`)에 저장되며, 팀원과 공유되지 않고 해당 개발자 머신의 **모든 프로젝트**에서 전역적으로 활성화됩니다.
- **Project Scope**: 프로젝트 루트 내 설정 파일(`.mcp.json` 등)에 저장되며, VCS(Git)를 통해 프로젝트 팀원 전체에 공유되어 적용됩니다.

**문제 상황 분석:**  
- 다른 팀원에게는 전혀 노출되지 않아야 함 (개인 전용 설정 필요).  
- 개발자의 로컬 머신에서 어떤 프로젝트를 열든 항상 사용할 수 있어야 함 (전역/글로벌 적용 필요).  
- 두 가지 조건을 동시에 만족하기 위해서는 글로벌 사용자 스코프(User Scope) 설정이 필요함.

**A번이 정답인 이유:**  
- **User Scope 적용**: `~/.claude.json` 파일에 저장되는 사용자 스코프 설정은 프로젝트 코드베이스 외부에 위치하므로 Git 등을 통해 팀원에게 공유되지 않습니다.
- **전역 로드**: 해당 머신에서 열리는 **모든 프로젝트** 전반에 전역(Global)으로 로드되므로 시나리오의 요구사항을 완벽히 충족합니다.

**오답 분석:**  
- Option B (오답): Project Scope는 프로젝트 경로 내 설정 파일(`.mcp.json`)에 저장되어 코드베이스에 포함되므로 팀원에게 공유될 가능성이 높고, 특정 프로젝트에만 국한됩니다.
- Option C (오답): `.gitignore`로 제외하더라도 특정 프로젝트 디렉토리에 묶이게 되므로, "자신의 머신에서 열리는 어떤 프로젝트에서나 사용 가능해야 한다"는 요구사항을 충족하지 못합니다.
- Option D (오답): `.claude/settings.json`은 Claude 환경 설정 파일이며, 모든 프로젝트에서 전역적으로 MCP 서버를 연동하는 표준적인 User Scope 경로(`~/.claude.json`) 설정과 부합하지 않습니다.


---


# 6번 문제

**1. 문제 원문**

A synthesis agent's job is to combine findings that a separate research agent has already gathered into a final answer. Because it shares a tool registry with the research agent, the synthesis agent also has access to a web_search tool. During testing, the synthesis agent repeatedly calls web_search mid-synthesis instead of using the findings already provided to it, producing inconsistent citations. What is the best explanation and fix for this behavior?

A) Agents tend to misuse tools outside their specialization when given access to them; web_search should be removed from the synthesis agent's tool set and left with the research agent.

B) The synthesis agent's temperature is likely too high, causing it to explore tool calls rather than follow its findings; lowering it to a more focused value like 0.2 would reduce unnecessary searches.

C) The web_search tool's description is too vague for the synthesis agent to interpret correctly; rewriting it with guidance that it is a research tool and should not be used during synthesis would prevent the extra calls.

D) The research agent is passing incomplete findings, so the synthesis agent searches for missing information; updating the research agent to include complete source lists would prevent the extra calls.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**A번**: Agents tend to misuse tools outside their specialization when given access to them; web_search should be removed from the synthesis agent's tool set and left with the research agent.

**정답 및 해설:**


**핵심 개념**: 멀티 에이전트 역할 분리 및 최소 권한 도구 노출 (Least Privilege / Tool Scoping)  
멀티 에이전트 시스템(Multi-Agent Architecture) 설계 시 각 에이전트에 필요한 도구만 선택적으로 전달(Tool Scoping)해야 합니다. 수행할 필요가 없는 도구(예: 종합 단계에서의 검색 도구)에 접근 권한이 열려 있으면 에이전트가 불필요하게 해당 도구를 호출하여 환각(Hallucination)을 일으키거나 출처의 일관성을 깨뜨릴 수 있습니다.

**문제 상황 분석:**  
- 종합(Synthesis) 에이전트의 본래 역할은 이미 조사된 데이터만 취합하는 것임.
- 공용 도구 레지스트리를 공유하다 보니 쓰지 말아야 할 `web_search` 도구가 종합 에이전트에게 노출됨.
- 에이전트가 불필요하게 `web_search`를 호출하여 일관성 없는 인용 결과를 생성하는 오작동 발생.

**A번이 정답인 이유:**  
- **최소 권한의 원칙 준수**: 에이전트에 목적에 맞지 않는 도구가 주어지면 이를 오용할 가능성이 매우 높습니다. 가장 근본적이고 철저한 해결책은 종합 에이전트의 도구 목록에서 `web_search`를 아예 제거(Scope 제거)하고, 검색 권한은 리서치 에이전트에만 한정하는 것입니다.

**오답 분석:**  
- Option B (오답): 온도를 낮춘다고 해서 불필요하게 노출된 도구에 대한 오호출을 근본적으로 막을 수 없으며, 확률적인 미봉책에 불과합니다.
- Option C (오답): 도구 설명(Description)에 "종합 시 사용하지 말 것"이라는 텍스트 지침을 넣더라도, 프롬프트 지시를 우회하거나 무시하는 LLM의 특성상 도구 자체를 차단하는 것보다 불안정합니다.
- Option D (오답): 문제의 원인은 리서치 결과의 완전성 부족이 아니라, 필요 없는 검색 도구가 종합 에이전트에 제공되었기 때문입니다.


---


# 7번 문제

**1. 문제 원문**

A support agent has both `search_web` and `fetch_webpage_results` as separate tools. Testing shows the model almost always calls `search_web`, even for tasks better suited to `fetch_webpage_results`. The system prompt contains "Always prefer searching for the most up to date information." What most likely explains the bias?

A) The fetch tool cannot be selected during parallel tool use, so it is filtered out before the model can consider it.

B) Keyword-sensitive system prompt wording creates an unintended association that overrides the more accurate tool description.

C) The search tool carries a lower internal temperature value in its schema, making it statistically favored during sampling.

D) The fetch tool's description exceeds a fixed token threshold, causing the model to systematically avoid tools of that length.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**B번**: Keyword-sensitive system prompt wording creates an unintended association that overrides the more accurate tool description.

**정답 및 해설:**


**핵심 개념**: 프롬프트 엔지니어링 및 편향(Prompt Bias / Keyword Association)  
시스템 프롬프트에 작성된 특정 키워드 문구("searching")는 모델이 도구를 선택할 때 강한 정렬 편향(Alignment Bias)을 유발할 수 있습니다. 도구 설명(Tool Description)이 아무리 정확하더라도, 상위 수준인 시스템 프롬프트의 강한 지시어와 특정 도구명(`search_web`) 간의 키워드 연관성이 도구 설명에 의한 합리적 판단을 덮어버릴(Override) 수 있습니다.

**문제 상황 분석:**  
- 에이전트에 `search_web`과 `fetch_webpage_results`라는 두 도구가 존재함.
- `fetch_webpage_results`가 더 적합한 상황에서도 모델이 지나치게 `search_web`만 선택함.
- 시스템 프롬프트에 "Always prefer **searching**..."이라는 지침이 명시되어 있어, 모델이 'searching' 키워드를 `search_web` 도구와 강력하게 연관 지어 판단 오류가 발생함.

**B번이 정답인 이유:**  
- 시스템 프롬프트 내의 "searching"이라는 키워드가 모델에게 강한 앵커링 효과(Anchoring Effect)를 일으켜, 개별 도구의 정확한 설명보다 우선하여 `search_web` 도구를 선택하도록 만든 원인입니다.

**오답 분석:**  
- Option A (오답): 특정 도구가 병렬 도구 사용 시 자동으로 필터링되어 고려 대상에서 제외되는 메커니즘은 존재하지 않습니다.
- Option C (오답): 도구 스키마 내부에는 별도의 `temperature` 설정값이 존재하지 않으며, 온도는 모델 호출 단위의 생성 파라미터입니다.
- Option D (오답): 설명 길이가 길다고 해서 모델이 해당 도구를 체계적으로 회피한다는 임계값 설정이나 동작 방식은 사실이 아닙니다.


---


# 8번 문제

**1. 문제 원문**

A team member tries to add a custom MCP server named `computer-use` to give the agent a specialized screenshot tool. What should the architect expect to happen?

A) Claude Code loads the custom server but silently strips its screenshot tool since that capability is presumed reserved for the built-in server

B) Claude Code rejects or skips the server because `computer-use` is a reserved built-in name, so the team member needs to pick a different name

C) Claude Code loads the custom server normally and simply hides the built-in server named `computer-use` for the rest of that session

D) Claude Code merges the tools from the custom server directly into the built-in server's own tool set under the shared reserved name

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**B번**: Claude Code rejects or skips the server because `computer-use` is a reserved built-in name, so the team member needs to pick a different name

**정답 및 해설:**


**핵심 개념**: Claude Code 내장 예약어(Reserved Names) 및 MCP 서버 네이밍 충돌  
Claude Code에는 시스템 내부 기능(예: `computer-use` 등)을 위해 미리 지정된 내장 MCP 서버 예약 명칭이 존재합니다. 커스텀 MCP 서버를 등록할 때 내부 예약어와 동일한 식별자 이름을 사용할 경우, 이름 충돌 방지 및 시스템 안정성을 위해 해당 서버 등록을 거부(Reject)하거나 스킵(Skip)하도록 설계되어 있습니다.

**문제 상황 분석:**  
- 팀원이 `computer-use`라는 이름의 커스텀 MCP 서버를 등록하려고 함.
- `computer-use`는 Anthropic/Claude Code 생태계에서 컴퓨터 조작 및 GUI 제어 기능 전용으로 정의된 예약된 내장 식별자(Reserved Built-in Name)임.
- 예약명을 커스텀 서버에 사용할 때 Claude Code가 이를 어떻게 처리할지 파악해야 함.

**B번이 정답인 이유:**  
- 예약된 내장 이름과 명칭 충돌이 발생하므로 Claude Code는 시스템 충돌 및 섀도잉(Shadowing) 현상을 방지하기 위해 해당 서버 구성을 거부하거나 건너뜁니다.
- 커스텀 스크린샷 도구를 정상적으로 등록 및 사용하려면 팀원이 `custom-computer-use`나 `my-screenshot-tool`처럼 예약되지 않은 다른 이름을 선택해야 합니다.

**오답 분석:**  
- Option A (오답): 서버를 로드한 뒤 도구만 일부 몰래 제거(silently strip)하는 부분적인 비정상 로드 동작을 수행하지 않습니다.
- Option C (오답): 사용자 정의 커스텀 서버가 기본 내장(Built-in) 서버의 기능을 덮어씌워 숨기는 것(Override/Hide)을 허용하지 않습니다.
- Option D (오답): 사용자 정의 커스텀 도구를 내장 서버의 내부 도구 세트로 임의 병합(Merge)하지 않으며, 네이밍이 충돌하면 로드 자체를 거부합니다.


---


# 9번 문제

**1. 문제 원문**

An architect is designing tool access for a three-agent pipeline: an intake agent, a processing agent, and a delivery agent. The intake agent occasionally needs to check processing status, which is normally a processing-agent operation. Following the principle of scoped tool access with limited cross-role tools, how should the architect handle this?

A) Give the intake agent the processing agent's full tool set, enabling it to directly perform status checks and execute any processing operation as part of its intake workflow.

B) Remove status checking from the pipeline, redesigning the three-agent workflow so the intake agent never requires a tool outside its core responsibility of accepting intakes.

C) Give the intake agent only a narrow check_status tool for that specific high-frequency need, while routing deeper processing operations through the processing agent.

D) Give the processing agent a copy of the intake agent's status check tool, so that either agent can independently perform status checks without routing through the processing agent's operations.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Give the intake agent only a narrow check_status tool for that specific high-frequency need, while routing deeper processing operations through the processing agent.

**정답 및 해설:**


**핵심 개념**: 범위 지정 도구 접근 권한 (Scoped Tool Access) 및 최소 권한의 원칙 (Principle of Least Privilege)
멀티 에이전트 아키텍처에서는 각 에이전트가 자신의 본래 역할에 필요한 최소한의 도구에만 접근할 수 있도록 도구 스코프(Scope)를 제한해야 합니다. 다른 에이전트의 역할 영역에 속하는 작업이 예외적으로 필요하더라도 전체 도구 세트를 부여하는 대신, 해당 목적에 국한된 좁은 범위(Narrow Scope)의 특정 도구만 제한적으로 허용하는 것이 보안 및 시스템 안정성 측면에서 올바른 설계입니다.

**문제 상황 분석:**
- 접수(Intake) 에이전트가 원래 처리(Processing) 에이전트의 담당 영역인 '처리 상태 확인'을 가끔 실행해야 하는 상황임.
- 범위 지정 도구 접근(Scoped tool access) 및 제한된 역할 간 도구 허용(Limited cross-role tools) 원칙을 준수해야 함.
- 에이전트에 너무 넓은 권한을 주지 않으면서 요구사항을 충족하는 아키텍처 수립 필요.

**C번이 정답인 이유:**
- 접수 에이전트에 처리 에이전트의 모든 권한을 주는 대신, 상태 조회 목적에만 국한된 읽기 전용/단일 목적의 `check_status` 도구만 최소한으로 부여합니다.
- 실제 데이터의 수정이나 깊은 처리 작업(Deeper processing operations)은 기존대로 처리 에이전트를 거치도록 유지함으로써, 최소 권한 원칙과 역할 분리(Separation of Concerns)를 완벽하게 달성합니다.

**오답 분석:**

- Option A (오답): 단지 상태 조회가 필요하다는 이유로 처리 에이전트의 전체 도구 세트(Full tool set)를 제공하는 것은 과도한 권한 부여(Over-privileging)이며, 에이전트가 예기치 않게 처리 작업을 직접 실행할 위험이 생깁니다.
- Option B (오답): 시스템에 필요한 필수 기능(상태 확인)을 아예 제거해 버리는 것은 유용성을 해치는 잘못된 접근 방식입니다.
- Option D (오답): 상태 확인 작업이 필요한 쪽은 접수 에이전트인데, 처리 에이전트에 접수 에이전트의 도구를 사본으로 넘겨주는 방식은 문제의 요구사항과 맞지 않으며 논리적으로 불필요합니다.


---


# 10번 문제

**1. 문제 원문**

A team names two tools `process_data` and `process_information`, and both share the description "Processes data provided by the user." The model routes roughly half of matching tasks to the wrong tool. What is the most likely root cause?

A) The model's context window is too small to hold both full tool definitions during a single request's generation pass, leading to ambiguous routing.

B) The user's request phrasing was too vague to reliably distinguish between the tools, so the fix belongs in the user's prompt rather than the tool definitions.

C) The near-duplicate descriptions give the model no differentiating signal, since descriptions are its main basis for choosing similar tools.

D) The tools were declared in the wrong order in the tools array, and reordering them so that the intended tool is listed first will correct the routing behavior.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: The near-duplicate descriptions give the model no differentiating signal, since descriptions are its main basis for choosing similar tools.

**정답 및 해설:**

**핵심 개념**: 도구 정의(Tool Definition) 및 설명(Description)의 구별 가치
LLM이 도구(Tool/Function Calling)를 선택할 때 가장 핵심적으로 참고하는 기준은 도구의 이름과 **설명(Description)**입니다. 기능이나 이름이 유사한 도구들이 동일하거나 거의 중복된 설명을 공유하면, 모델은 차별화된 의미적 신호(Semantic Signal)를 얻지 못해 도구 선택 시 임의에 가까운 판단(약 50%의 오류율)을 내리게 됩니다.

**문제 상황 분석:**
- 두 도구(`process_data`, `process_information`)의 이름과 역할이 매우 유사함.
- 두 도구의 설명이 "Processes data provided by the user."로 완전히 동일함.
- 모델이 두 도구 간의 구별 기준을 찾지 못해 작업을 약 50%의 확률로 무작위 배정(잘못된 도구로 라우팅)함.

**C번이 정답인 이유:**
- LLM은 도구의 설명문에서 라우팅에 필요한 의도와 입력 조건의 차이를 학습하고 선택합니다.
- 중복에 가까운 설명은 모델에게 두 도구를 구별할 신호를 전혀 주지 못하므로, 도구 설명에 각 도구만의 독자적인 역할과 차별화 포인트를 명시해 주는 것이 근본적인 해결책입니다.

**오답 분석:**

- Option A (오답): 도구 정의 2개의 텍스트는 토큰 수가 매우 적으므로 콘텍스트 창(Context Window) 한계 문제와는 무관합니다.
- Option B (오답): 두 도구의 설명이 완전히 동일한 것이 문제의 본질이므로, 문제의 원인과 수정 지점은 사용자의 프롬프트가 아닌 개발자가 작성한 도구 정의(Tool Definition)에 있습니다.
- Option D (오답): 도구 배열(Array) 내 선언 순서를 바꾼다고 해서 중복 설명으로 인한 라우팅 모호성이 해결되지 않으며, 단순히 첫 번째 도구에 편향(Bias)을 줄 뿐입니다.


---


# 11번 문제

**1. 문제 원문**

A `book_meeting_room` MCP tool fails because the requested room is already reserved for the requested time slot. The tool author wants the agent to be able to explain the conflict to the user in natural language and suggest picking a different time, without the agent needing to parse a raw exception message. Which element of the structured error response most directly enables this?

A) Returning the raw exception stack trace from the scheduling library so the agent can extract the room name using text parsing

B) A human-readable description field stating the room is already booked for that slot, separate from any machine-oriented errorCategory or isRetryable flags

C) Setting isRetryable to true so the agent automatically resubmits the identical booking request until the room becomes free on its own

D) Omitting the description field entirely, since errorCategory alone is sufficient for the agent to generate an accurate, context-specific explanation

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**B번**: A human-readable description field stating the room is already booked for that slot, separate from any machine-oriented errorCategory or isRetryable flags

**정답 및 해설:**


**핵심 개념**: MCP(Model Context Protocol) 구조화된 오류 응답 설계  
MCP 표준 에러 응답은 기계적인 제어를 위한 플래그(`errorCategory`, `isRetryable` 등)와, LLM 에이전트가 이해하고 사용자에게 전달할 수 있는 사람이 읽기 쉬운 설명 텍스트(`description` / `message`)를 분리하여 작성합니다. 명확한 자연어 메시지가 제공될 때 에이전트는 복잡한 파싱 없이 사용자에게 원인을 명확히 안내할 수 있습니다.

**문제 상황 분석:**  
- 회의실 예약 도구 실행 시 시간대 충돌로 인한 에러가 발생함.
- 에이전트가 날것의 로우(Raw) 예외 메시지나 스택 트레이스를 직접 파싱하지 않아야 함.
- 사용자에게 자연어로 상황을 설명하고 대안(다른 시간 선택)을 제시하도록 만들기 위한 에러 응답 요소를 찾아야 함.

**B번이 정답인 이유:**  
- `errorCategory`나 `isRetryable` 같은 기계 판별용 메타데이터와 구분되는 '사람이 읽기 쉬운 설명 필드(human-readable description field)'를 전달하면, 에이전트가 해당 텍스트의 맥락을 즉시 파악할 수 있습니다. 이를 바탕으로 별도의 스택 트레이스 파싱 없이 자연스럽게 사용자에게 다른 시간 선택을 유도하는 대화형 안내 문구를 생성할 수 있습니다.

**오답 분석:**  
- Option A (오답): 날것의 스택 트레이스를 반환하고 텍스트 파싱을 요구하는 것은 "raw exception message를 파싱할 필요 없이"라는 문제 조건에 직접적으로 위배됩니다.
- Option C (오답): 예약 충돌은 사용자가 시간대를 바꾸지 않는 한 동일한 요청을 무한 재시도(`isRetryable: true`)한다고 해서 해결되지 않으며, 잘못된 로직을 일으킵니다.
- Option D (오답): 구체적인 세부 사유(어떤 이유로 거절되었는지)를 포함하는 description 필드를 생략하고 대분류 카테고리만 제공하면, 에이전트가 사용자에게 맥락에 맞는 정확한 안내를 제공할 수 없습니다.


---


# 12번 문제

**1. 문제 원문**

A subagent responsible for enriching customer records calls an internal `lookup_address` tool for 50 customers. For 47 the lookup succeeds; for 3 the tool returns `isError: true` with `errorCategory: "permission"` because the subagent's credentials lack access to those records' region. The subagent cannot obtain broader credentials itself. What should it send back to the coordinator?

A) An `isError: true` result for the entire batch, discarding the 47 successful lookups because the batch as a whole did not fully complete

B) Only the 47 enriched records, silently dropping the 3 failures since local recovery attempts already reached their limit for this subagent

C) A retry loop that keeps calling `lookup_address` on the same 3 customers with the same credentials until the coordinator intervenes

D) The 47 enriched records as partial results, plus a report naming the 3 unresolved customers, the permission error encountered, and what was attempted

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: The 47 enriched records as partial results, plus a report naming the 3 unresolved customers, the permission error encountered, and what was attempted

**정답 및 해설:**


**핵심 개념**: 멀티 에이전트 오케스트레이션 및 우아한 오류 처리 (Partial Results & Error Reporting)
멀티 에이전트 시스템에서 서브에이전트가 배치(Batch) 작업을 처리하다 일부에서 오류를 마주했을 경우, 정상 처리된 부분 결과(Partial Results)를 유실하지 않고 상위 코디네이터에 전달해야 합니다. 동시에 미처리 항목과 에러 원인(`errorCategory`), 시도 내역을 명확히 보고함으로써 상위 오케스트레이터가 더 높은 권한으로 상급 조치를 취할 수 있도록 설계하는 것이 정석입니다.

**문제 상황 분석:**
- 서브에이전트가 50건 중 47건 처리 성공, 3건은 권한 부족(`permission`)으로 실패함.
- 서브에이전트는 스스로 권한을 상향할 수 없음.
- 성공한 작업의 자원 손실을 막고, 실패 원인을 코디네이터가 신속히 파악해 대응할 수 있는 가장 우아하고 실용적인 보고 방식이 필요함.

**D번이 정답인 이유:**
- **유효 작업 보존**: 성공한 47건의 결과를 파기하지 않고 부분 결과로 유용하게 전달합니다.
- **명확한 진단 정보 제공**: 해결되지 않은 3명의 고객 식별 정보, 에러 유형(`permission`), 시도 내역을 코디네이터에게 상세 보고함으로써, 코디네이터가 상위 권한을 이용해 재처리하거나 관리자에게 알릴 수 있도록 만듭니다.

**오답 분석:**

- Option A (오답): 일부 실패 때문에 성공한 47건의 결과까지 파기(`discarding`)하는 것은 심각한 자원 낭비이며 비효율적입니다.
- Option B (오답): 실패한 3건을 무단으로 누락(`silently dropping`)하면 상위 코디네이터가 데이터 누락 사실을 알지 못해 시스템 정합성 문제가 발생합니다.
- Option C (오답): 동일한 자격 증명으로 권한 에러(`permission`)가 난 항목을 무한 재시도하는 것은 무한 루프를 유발하고 리소스를 낭비합니다.


---


# 13번 문제

**1. 문제 원문**

A coordinator agent delegates tasks to a research agent, a coding agent, and a QA agent. Currently, every subagent is configured with the full union of all tools used anywhere in the pipeline, so each has around 15 tools available, and each agent's tool choice is left at {"type": "auto"} in every turn. The team reports agents occasionally reaching for tools clearly outside their remit, like the QA agent invoking a deploy tool. What combination of changes best addresses this while preserving each agent's ability to decide when to act versus respond?

A) Keep the shared 15-tool set for all subagents, but switch every subagent's tool_choice to {"type": "any"} so a tool call is always forced, ensuring subagents cannot respond without selecting a tool.

B) Restrict each subagent's tool set to only what its own role needs, and also force every subagent's tool_choice to a single named tool for all turns, such as search tool for research and test tool for QA.

C) Restrict each subagent's tool set to only what its role needs, while keeping tool_choice at {"type": "auto"} so each agent still decides per turn whether to call a tool.

D) Keep the shared 15-tool set for all subagents, but switch every subagent's tool_choice to {"type": "none"} so no subagent can call tools directly, requiring the coordinator to invoke tools on its behalf.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Restrict each subagent's tool set to only what its role needs, while keeping tool_choice at {"type": "auto"} so each agent still decides per turn whether to call a tool.

**정답 및 해설:**

**핵심 개념**: 도구 스코핑(Tool Scoping/Least Privilege) 및 `tool_choice: "auto"`  
멀티 에이전트 시스템에서 에이전트가 권한을 벗어난 도구를 오용하는 문제를 방지하는 가장 올바른 기법은 **최소 권한의 원칙(Principle of Least Privilege)**에 따라 각 에이전트 역할에 필수적인 도구만 노출되도록 제한(Restrict Tool Set)하는 것입니다. 이때 `tool_choice`를 `"auto"`로 유지해야 에이전트가 상황에 따라 도구를 호출(act)할지, 아니면 단순 자연어 응답(respond)을 생성할지 스스로 자율적으로 판단할 수 있습니다.

**문제 상황 분석:**
- 모든 서브에이전트에 15개의 전체 도구 세트가 통째로 제공되고 있음.
- QA 에이전트가 배포 도구를 호출하는 등 담당 소관(Remit)을 벗어나는 도구 오용 현상이 발생함.
- **요구사항**: 도구 오용을 방지하면서도, 각 에이전트가 턴별로 "도구를 실행할지(act) vs 대화로 응답할지(respond)" 결정하는 자율적 능력을 유지해야 함.

**C번이 정답인 이유:**
- **도구 범위 제한(Role-based Scoping)**: QA 에이전트에는 QA 도구만, 리서치 에이전트에는 리서치 도구만 제공하여 근본적으로 타 역할의 도구를 호출할 위험을 차단합니다.
- **자율성 유지(`"auto"`)**: `tool_choice`를 `{"type": "auto"}`로 유지하면 모델이 필요에 따라 도구를 호출하거나 텍스트로 바로 응답하는 동작 방식을 계속해서 자유롭게 선택할 수 있습니다.

**오답 분석:**

- Option A (오답): `{"type": "any"}`는 턴마다 무조건 아무 도구나 하나 이상 호출하도록 강제하므로, 도구를 사용하지 않고 텍스트로 응답(respond)하려는 자율적 결정을 불가능하게 만듭니다. 또한 15개 전체 도구를 유지하면 도구 오용 문제가 해결되지 않습니다.
- Option B (오답): 특정 도구 단 하나로 `tool_choice`를 고정하면 에이전트가 도구를 쓰지 않고 일반 텍스트로 응답하는 옵션이 차단되며, 다양한 도구를 상황에 맞게 선택할 수 없게 됩니다.
- Option D (오답): `{"type": "none"}`으로 설정하면 서브에이전트가 도구를 전혀 사용할 수 없어 에이전트 본연의 자율적 동작 및 도구 호출 수행 능력(act)이 상실됩니다.


---


# 14번 문제

**1. 문제 원문**

A developer is building an assistant that must force tool use on every user turn. All requests require either current data or an action, so the model must never answer directly from its own knowledge. Which tool_choice configuration matches this requirement?

A) tool_choice: {"type": "any"}, so the model must select and call at least one of the provided tools on every turn

B) tool_choice: {"type": "none"}, so the model can describe what it would do but never actually calls a tool

C) tool_choice: {"type": "tool", "name": "answer_directly"}, forcing a fixed response-generation tool each turn

D) tool_choice: {"type": "auto"}, letting the model decide per turn whether to call a tool or respond directly

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: tool_choice: {"type": "any"}, so the model must select and call at least one of the provided tools on every turn

**정답 및 해설:**

**핵심 개념**: Anthropic API / Claude `tool_choice` 파라미터 옵션  
- `{"type": "auto"}`: 모델이 상황에 따라 도구를 호출할지, 아니면 도구 없이 일반 텍스트로 바로 응답할지 자율적으로 결정합니다. (기본값)
- `{"type": "any"}`: 모델이 반드시 하나 이상의 도구를 선택하여 호출하도록 강제(Force Tool Use)합니다. 일반 텍스트로 직접 응답하는 것을 금지합니다.
- `{"type": "tool", "name": "..."}`: 지정한 특정 도구 단 하나만 고정해서 호출하도록 강제합니다.
- `{"type": "none"}`: 도구 호출을 전면 금지하며 일반 텍스트 응답만 생성하도록 합니다.

**문제 상황 분석:**
- 사용자의 모든 요청이 최신 데이터 조회나 특정 시스템 액션을 요구하는 상황임.
- 모델이 자신의 학습 지식만으로 직접 텍스트 답변을 생성하는 동작을 절대 허용해서는 안 됨.
- 매 턴마다 어떤 도구든 **최소 1개의 도구 사용을 강제**하는 `tool_choice` 설정이 필요한 상황임.

**A번이 정답인 이유:**
- `{"type": "any"}` 옵션은 제공된 전체 도구 목록 중에서 모델이 상황에 적합한 도구를 하나 선택하여 **무조건 호출하도록 강제**합니다.
- 이를 통해 모델이 자체 지식으로 직접 답변을 출력하는 경우를 방지하고, 항상 외부 데이터 조회나 액션 도구를 거치도록 보장하므로 요구사항을 정확히 충족합니다.

**오답 분석:**

- Option B (오답): `{"type": "none"}`은 도구 호출을 금지하고 텍스트 직접 응답만 허용하므로, 도구 사용을 강제해야 하는 요구사항과 정반대로 동작합니다.
- Option C (오답): `{"type": "tool", "name": "answer_directly"}` 방식은 가상의 단일 특정 도구 하나만을 강제로 호출하게 만듭니다. 다양한 최신 데이터 조회 및 액션 도구 중 상황에 맞게 선택하여 사용해야 하는 유스케이스에 부합하지 않습니다.
- Option D (오답): `{"type": "auto"}`는 모델이 도구를 사용할지, 아니면 자체 지식으로 직접 응답할지 판단을 맡기므로 모델이 도구 없이 직접 답변해 버릴 위험이 존재합니다.


---


# 15번 문제

**1. 문제 원문**

A custom MCP server dynamically adds a new tool partway through a long-running session, based on state changes on its own backend. The server sends the appropriate MCP notification for this. What should the architect expect Claude Code to do, without any manual reconnect?

A) Ignore the `list_changed` notification and continue with the initial tool set, as tools are only loaded at session start and no dynamic refresh is supported.

B) Require the user to run `/mcp` and manually select "Refresh tools" before the newly added tool becomes available, since the tool list updates only on manual refresh.

C) Disconnect from the server and silently reconnect in the background, discarding any in-flight tool calls, then rely on the reconnect to pick up the new tool list.

D) It will automatically refresh the tools from that server after receiving its `list_changed` notification, making the new tool usable without a disconnect.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: It will automatically refresh the tools from that server after receiving its `list_changed` notification, making the new tool usable without a disconnect.

**정답 및 해설:**


**핵심 개념**: MCP(Model Context Protocol) `list_changed` 알림 및 클라이언트 동적 새로고침  
MCP 사양에는 서버 측의 도구, 리소스, 프롬프트 목록에 변화가 생겼을 때 클라이언트(Claude Code 등)에 동적으로 이를 알리는 `notifications/tools/list_changed` 알림 메커니즘이 정의되어 있습니다. 이를 수신한 MCP 클라이언트는 기존 세션을 끊지 않고 해당 서버의 도구 목록을 즉시 동적으로 재조회(Refresh)하여 업데이트합니다.

**문제 상황 분석:**
- 장시간 실행되는 세션 중 MCP 서버 백엔드의 상태 변경으로 인해 새로운 도구가 동적으로 추가됨.
- 서버가 표준 MCP 알림(`notifications/tools/list_changed`)을 클라이언트로 정상 전송함.
- 클라이언트(Claude Code)가 수동 재연결이나 세션 중단 없이 이 알림을 받았을 때의 표준적인 동작 방식을 파악해야 함.

**D번이 정답인 이유:**
- Claude Code는 MCP 프로토콜 표준 알림인 `list_changed`를 수신하면 서버 연결을 유지한 채 백그라운드에서 동적으로 도구 목록을 자동 새로고침(Auto-refresh)합니다. 따라서 세션 재연결 없이 새 도구를 즉시 사용할 수 있습니다.

**오답 분석:**

- Option A (오답): MCP 프로토콜 및 Claude Code는 알림을 통한 동적 새로고침을 완벽히 지원하므로 알림을 무시한다는 설명은 틀렸습니다.
- Option B (오답): 서버가 명시적으로 `list_changed` 알림을 전송한 경우 클라이언트가 이를 감지하여 자동 처리하므로 사용자가 `/mcp` 명령어로 수동 조작할 필요가 없습니다.
- Option C (오답): 도구 목록 재조회를 위해 진행 중인 작업을 파기하거나 서버 연결을 강제로 끊었다가 재연결(Disconnect & Reconnect)하는 방식은 비효율적이며 MCP 사양에 맞지 않는 동작입니다.

---

### 16번 문제

**1. 문제 원문**

A custom MCP server dynamically adds a new tool partway through a long-running session, based on state changes on its own backend. The server sends the appropriate MCP notification for this. What should the architect expect Claude Code to do, without any manual reconnect?

A) Ignore the `list_changed` notification and continue with the initial tool set, as tools are only loaded at session start and no dynamic refresh is supported.  

B) Disconnect from the server and silently reconnect in the background, discarding any in-flight tool calls, then rely on the reconnect to pick up the new tool list.  

C) It will automatically refresh the tools from that server after receiving its `list_changed` notification, making the new tool usable without a disconnect.  

D) Require the user to run `/mcp` and manually select "Refresh tools" before the newly added tool becomes available, since the tool list updates only on manual refresh.  

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**C번**: It will automatically refresh the tools from that server after receiving its `list_changed` notification, making the new tool usable without a disconnect.

**정답 및 해설:**  
**핵심 개념**: MCP (Model Context Protocol) 및 `notifications/tools/list_changed`  
MCP 규격에서는 서버의 도구 목록이 변경되었을 때 클라이언트에 알림(Notification)을 보낼 수 있는 event 기반 알림 체계를 정의합니다. Claude Code와 같은 MCP 클라이언트는 서버로부터 `notifications/tools/list_changed` 알림을 받으면 연결을 끊지 않고 동적으로 도구 목록을 재요청(tools/list)하여 최신 상태로 갱신합니다.

**문제 상황 분석:**
- 장시간 실행되는 세션 중 MCP 서버의 백엔드 상태 변경으로 인해 신규 도구가 동적으로 추가되었습니다.
- 서버는 표준 MCP 알림인 `notifications/tools/list_changed`를 클라이언트로 전송했습니다.
- 클라이언트(Claude Code)가 수동 재연결이나 개입 없이 이 알림을 어떻게 처리하는지 묻고 있습니다.

**C번이 정답인 이유:**
MCP 표준 프로토콜 작동 방식에 따라 클라이언트는 `list_changed` 알림을 수신하면 연결을 유지한 상태에서 즉시 `tools/list` 요청을 다시 보내 새 도구 목록을 동적으로 동기화합니다. 따라서 재연결이나 사용자 개입 없이 신규 도구를 즉시 사용할 수 있습니다.

**오답 분석:**
- Option A (오답): Claude Code 및 MCP 프로토콜은 `list_changed` 알림을 무시하지 않으며 동적 새로고침을 지원합니다.
- Option B (오답): 도구 목록 변경 시 세션 재연결이나 진행 중인 도구 호출(in-flight tool calls)을 강제로 폐기할 필요가 없습니다. 연결을 유지한 채 알림/요청으로 업데이트합니다.
- Option D (오답): 서버가 알림을 전송하지 않는 특수한 상황이 아니라 알림을 올바르게 발송한 상황이므로, 사용자가 수동으로 `/mcp` 명령어를 실행할 필요가 없습니다.

<br>

---

### 17번 문제

**1. 문제 원문**

A research agent has a generic `fetch_url` tool that can retrieve content from any URL, including URLs the model hallucinates or pulls from untrusted parts of a document. This has led to the agent fetching malformed or irrelevant pages. The team wants a scoped alternative that only allows retrieval of legitimate source documents. Which change best follows the guidance on replacing generic tools with constrained alternatives?

A) Remove URL retrieval from the agent entirely and require a human to paste document contents into the conversation


B) Keep `fetch_url` but rename it to `get_document` so its purpose is clearer to the model when selecting a tool


C) Keep `fetch_url` unchanged and add a second, identical tool named `fetch_url_v2` as a fallback for failed retrievals


D) Replace `fetch_url` with a `load_document` tool that validates the URL against an allowed document source before retrieving it

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**D번**: Replace `fetch_url` with a `load_document` tool that validates the URL against an allowed document source before retrieving it

**정답 및 해설:**  
**핵심 개념**: 도구 제약 설계 (Constrained Tools / Scoped Tools)  
에이전트 디자인 패턴에서 범용성 도구(Generic Tool)는 모델의 환각(Hallucination)이나 잘못된 경로 탐색을 유발할 수 있습니다. 이를 방지하기 위해 입력을 제한하거나 허용 목록(Allowlist) 검증을 수행하는 전용/제약 도구(Constrained Alternative)로 대체하는 것이 안전하고 정확한 도구 호출을 유도하는 표준 가이드라인입니다.

**문제 상황 분석:**
- 에이전트가 사용하는 범용 `fetch_url` 도구가 임의의 URL(환각된 URL, 신뢰할 수 없는 URL 등)에 접근할 수 있는 상태입니다.
- 결과적으로 형식에 맞지 않거나 업무와 무관한 페이지를 무분별하게 불러오는 문제가 발생하고 있습니다.
- 팀은 일반 도구를 제약이 있는 대안(Constrained alternative)으로 대체하여 정당한 출처의 문서만 가져오도록 제한하길 원합니다.

**D번이 정답인 이유:**
범용 `fetch_url` 도구를 제거하고, 허용된 문서 출처(Allowed document source)인지 검증하는 로직이 포함된 `load_document` 도구로 교체하는 것이 "일반 도구를 제약 조건이 포함된 대안으로 교체"하는 지침에 정확하게 부합합니다.

**오답 분석:**
- Option A (오답): 도구 자동화를 완전히 제거하고 사용자에게 붙여넣기를 요구하는 것은 에이전트의 자동화 기능을 포기하는 접근법이며 제약된 도구 도입이 아닙니다.
- Option B (오답): 이름만 변경하는 것(Rename)은 내부 접근 제어 및 입력 검증 로직을 추가하지 않으므로 임의 URL 호출 문제를 해결하지 못합니다.
- Option C (오답): 동일한 기능의 두 번째 도구를 추가하는 것은 경계 제약(Constraint)을 부여하지 않으며 복잡도만 증가시킵니다.

<br>

---

### 18번 문제

**1. 문제 원문**

A project-scoped stdio server's `.mcp.json` entry sets `"args": ["--root", "${CLAUDE_PROJECT_DIR}"]` with no fallback value. What happens when a teammate runs Claude Code from a shell where this variable happens not to be set in their own environment?

A) It resolves correctly, since Claude Code injects `CLAUDE_PROJECT_DIR` into the spawned server's own environment, though a default like `${CLAUDE_PROJECT_DIR:-.}` remains the safer practice


B) The expansion silently becomes an empty string in this case, since Claude Code never provides a value for this variable unless a plugin explicitly sets one


C) The expansion fails outright, because `${CLAUDE_PROJECT_DIR}` can only ever be read from the invoking shell's own environment, never from a value Claude Code injects itself


D) The expansion falls back automatically to the user's home directory, since that is treated as the implicit default whenever no fallback is written in `.mcp.json`

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**A번**: It resolves correctly, since Claude Code injects `CLAUDE_PROJECT_DIR` into the spawned server's own environment, though a default like `${CLAUDE_PROJECT_DIR:-.}` remains the safer practice

**정답 및 해설:**  
**핵심 개념**: Claude Code 내장 환경 변수 주입 (Built-in Environment Variables Injection)  
Claude Code는 프로젝트 실행 환경을 정교하게 제어하기 위해 실행 시 `CLAUDE_PROJECT_DIR`와 같은 핵심 프로젝트 환경 변수를 내부적으로 자동 생성하여 자식 프로세스(MCP 서버 등)의 환경 변수로 주입합니다.

**문제 상황 분석:**
- 팀원의 로컬 OS/쉘 환경변수에는 `CLAUDE_PROJECT_DIR` 변수가 직접 정의되어 있지 않은 상태입니다.
- 프로젝트 내 `.mcp.json` 설정 파일에는 `"args": ["--root", "${CLAUDE_PROJECT_DIR}"]` 형태로 해당 변수를 참조하도록 등록되어 있습니다.
- 환경 변수 미설정 시 대체값(fallback syntax, 예: `${CLAUDE_PROJECT_DIR:-.}`)이 지정되지 않은 경우 정상 작동 여부가 질문의 핵심입니다.

**A번이 정답인 이유:**
Claude Code는 쉘 실행 환경에 해당 변수가 설정되어 있지 않더라도 프로세스를 구동할 때 프로젝트 루트 경로를 가리키는 `CLAUDE_PROJECT_DIR` 값을 자동으로 할당하여 실행 환경(spawned environment)에 주입(inject)합니다. 따라서 매개변수 치환은 올바르게 동작합니다. 다만, 시스템 환경 간 호환성을 보장하기 위해 기본값(`${CLAUDE_PROJECT_DIR:-.}`)을 작성해 두는 것이 보안 및 모범 사례(Safer practice)로 권장됩니다.

**오답 분석:**
- Option B (오답): Claude Code는 `CLAUDE_PROJECT_DIR` 값을 내장 제공하므로 플러그인 유무와 상관없이 빈 문자열로 처리되지 않습니다.
- Option C (오답): 변수를 오직 호출 쉘(Invoking shell)에서만 읽을 수 있는 것은 아니며, Claude Code가 스스로 주입한 값을 정상 수신합니다.
- Option D (오답): `.mcp.json`에서 대체 값이 없을 때 자동으로 홈 디렉터리(`~`)로 대체되는 암묵적 메커니즘은 존재하지 않습니다.

<br>

---

### 19번 문제

**1. 문제 원문**

A code-review subagent was originally scoped to Read, Grep, and Glob so it could inspect a codebase without changing it. During a refactor, an engineer also grants it Bash and a deploy_service tool because "it might be handy." Shortly after, the review agent begins running deploy_service mid-review on branches that haven't been approved. What principle explains this outcome and what is the correct fix?

A) The review agent's system prompt needs a stronger instruction telling it never to deploy, while keeping all five tools available so that it can still use Bash for code inspection but is prevented from running deploy_service.


B) The deploy_service tool's input schema is likely malformed, so the fix is to add stricter JSON schema validation on its parameters so that the agent only submits deployment requests for branches that have passed review.


C) The review agent should be given even more tools, such as advanced file-search and environment-status utilities, so that deploy_service becomes just one option among many and is therefore less likely to be selected inadvertently.


D) Tools beyond an agent's specialization tend to get misused when available, so Bash and deploy_service should be removed, restricting the review agent to the read-only tools its role requires.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**D번**: Tools beyond an agent's specialization tend to get misused when available, so Bash and deploy_service should be removed, restricting the review agent to the read-only tools its role requires.

**정답 및 해설:**  
**핵심 개념**: 최소 권한의 원칙 (Principle of Least Privilege) 및 에이전트 도구 제한 (Tool Scoping)  
에이전트 아키텍처에서는 에이전트에게 지정된 역할에 꼭 필요한 최점단 도구만 제공해야 합니다. 역할의 범위를 넘어서는 강력하거나 위험한 도구(Bash, 배포 도구 등)가 제공되면 프롬프트 지시어만으로는 오용(Misuse) 및 환각으로 인한 실행을 완벽히 차단하기 어렵습니다.

**문제 상황 분석:**
- 읽기 전용 검사 기능(Read, Grep, Glob)만 제공되던 코드 리뷰 에이전트에 불필요하게 Bash 및 `deploy_service` 도구가 추가되었습니다.
- 결과적으로 승인되지 않은 브랜치에 대해 리뷰 도중 배포 명령을 실행하는 무단/오작동 문제가 발생했습니다.
- 원인 규명 및 에이전트 설계 원칙에 따른 적절한 수정 방안을 도출해야 합니다.

**D번이 정답인 이유:**
에이전트에게 전문 역할 범위를 벗어난 도구를 부여하면 잘못 선택되어 실행될 위험이 매우 높아집니다. 프롬프트로 제약하는 것보다 도구 집합 자체에서 제거하여 읽기 전용(Read-only) 도구로만 범위를 제한(Scope)하는 것이 가장 안전하고 올바른 해결책입니다.

**오답 분석:**
- Option A (오답): 도구를 그대로 둔 채 시스템 프롬프트에 배포 금지 지시문만 강화하는 것은 모델의 환각이나 명령 오해로 인한 실행 위험을 완벽히 제거할 수 없습니다.
- Option B (오답): 스키마 검증은 입력 형태의 유효성을 검사할 뿐, 에이전트가 배포 도구 자체를 호출하려는 의도나 타이밍을 막지 못합니다.
- Option C (오답): 도구를 더 추가하면 도구 선택 공간이 복잡해져 에이전트의 오작동 및 환각 가능성이 오히려 증대됩니다.

<br>

---

### 20번 문제

**1. 문제 원문**

An architect asks Claude Code to find every place in a large monorepo that calls a function named `parseInvoice`, including calls inside a minified bundle that is gitignored but still needs to be checked. Which approach correctly locates all call sites?

A) Run Glob with the pattern `**/*parseInvoice*` to find files whose names contain the function, then treat that file list as the complete set of callers


B) Run Glob with the pattern `**/*.js` to list every JavaScript file, then judge from file names alone which ones likely reference parseInvoice


C) Run Grep across the repo for parseInvoice, then Grep the gitignored bundle's path directly, since a direct path is still searched


D) Run Grep once with the multiline flag enabled, assuming multiline mode makes Grep search gitignored files as a side effect of that flag

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**C번**: Run Grep across the repo for parseInvoice, then Grep the gitignored bundle's path directly, since a direct path is still searched

**정답 및 해설:**  
**핵심 개념**: Claude Code 도구 검색 동작 방식 (`Grep` 및 `.gitignore` 메커니즘)  
Claude Code의 `Grep` 도구(ripgrep 기반)는 기본적으로 프로젝트의 `.gitignore` 규칙을 준수하여 무시된 파일 및 디렉터리(예: `dist/`, `build/`, `node_modules/` 등)를 전체 검색 대상에서 제외합니다. 하지만 `.gitignore`에 등록된 경로라 할지라도 검색 명령어에 대상 파일이나 디렉터리 경로를 명시적으로 직접 지정하면 해당 경로 내부를 검색합니다.

**문제 상황 분석:**
- 대규모 모노레포에서 `parseInvoice` 함수가 호출되는 모든 위치를 찾아야 합니다.
- 전체 코드베이스 외에도, `.gitignore`에 등록되어 검색 기본 대상에서 제외되는 경량화된 번들(Minified bundle) 파일 내부까지 확인해야 하는 조건이 존재합니다.
- `.gitignore` 처리된 파일까지 빠짐없이 검색하기 위한 정확한 탐색 전략을 도출해야 합니다.

**C번이 정답인 이유:**
일반적인 리포지토리 전체 `Grep` 실행은 `.gitignore`에 지정된 무시 대상을 자동으로 스킵합니다. 따라서 전체 리포지토리에 대해 1차 검색을 수행한 후, `.gitignore` 처리된 번들 파일의 경로를 직접(Direct path) 지정하여 추가 `Grep`을 실행하면 제외되었던 경로까지 정확하게 검색하여 모든 호출 위치를 누락 없이 확보할 수 있습니다.

**오답 분석:**
- Option A (오답): `Glob`은 파일/디렉터리의 '이름'이나 '경로 패턴'을 검색하는 도구입니다. 코드 내부에서 함수가 호출된 내용(텍스트)을 검색하는 데 사용할 수 없으며, 파일명에 함수 이름이 포함되어 있지 않으면 찾을 수 없습니다.
- Option B (오답): `Glob`으로 자바스크립트 파일 목록만 나열한 뒤 파일명만 보고 함수 참조 여부를 추측하는 것은 실제 코드 내용을 탐색하지 못하므로 오탐 및 누락이 발생합니다.
- Option D (오답): `multiline` 옵션은 여러 줄에 걸친 문자열 패턴 검색을 지원하는 플래그일 뿐, `.gitignore` 규칙을 무시하거나 우회하는 효과를 제공하지 않습니다.

<br>

---

### 21번 문제

**1. 문제 원문**

A team built a custom MCP server exposing a `find_symbol_usages` tool that is far more accurate than text search, but the agent keeps reaching for the built-in Grep tool instead. The tool's current description is just "Finds symbol usages." What change is most likely to fix this?

A) Rename the tool from `find_symbol_usages` to `grep` so the agent recognizes it as a drop-in upgrade for its existing habit of reaching for text search  

B) Remove Grep from the list of available built-in tools entirely so the agent has no remaining alternative but to call the MCP tool for every search it runs  

C) Set the tool's permission mode to require manual approval on every single call so the agent is forced to weigh it before falling back to Grep  

D) Rewrite the description to explain what it returns and when it beats text search, such as resolving usages across renamed imports and generated code grep cannot match  

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**D번**: Rewrite the description to explain what it returns and when it beats text search, such as resolving usages across renamed imports and generated code grep cannot match

**정답 및 해설:**  
**핵심 개념**: 도구 설명 최적화 (Tool Description Optimization / Prompt Engineering for Tools)  
LLM 기반 에이전트는 도구의 이름과 설명(Description)을 읽고 어떤 상황에서 해당 도구를 호출할지 판단합니다. 도구 설명이 모호하거나 너무 단순하면 모델은 익숙한 기본 도구(예: Grep)를 선택하는 경향이 있습니다. 구체적인 반환 값, 정밀도, 차별화된 사용 시점(Use cases)을 설명에 명시하면 에이전트의 도구 선택 능력이 대폭 향상됩니다.

**문제 상황 분석:**
- 텍스트 검색보다 우수한 성능을 가진 커스텀 MCP 도구 `find_symbol_usages`를 추가했습니다.
- 그러나 에이전트는 이 도구 대신 내장 `Grep` 도구를 계속 사용합니다.
- 원인은 커스텀 도구의 설명이 "Finds symbol usages."로 너무 간소하여 모델이 Grep 대비 이점과 적절한 사용 타이밍을 판단하지 못하기 때문입니다.

**D번이 정답인 이유:**
도구 설명을 수정하여 도구가 반환하는 정보의 구체적 형태와 Grep(일반 텍스트 검색) 대비 더 우수한 사용 시점(예: 이름이 변경된 import 문, 자동 생성 코드 등의 심볼 추적)을 명확히 명시하면 에이전트가 상황에 맞는 정확한 도구를 선택하도록 유도할 수 있습니다.

**오답 분석:**
- Option A (오답): 도구 이름을 내장 도구와 동일한 `grep`으로 변경하는 것은 도구 충돌 및 혼란을 야기하며, 올바른 설계 방식이 아닙니다.
- Option B (오답): 범용 텍스트 검색에 유용한 기본 Grep 도구를 완전히 제거하는 것은 에이전트의 일반적인 탐색 및 검색 능력을 심각하게 제한합니다.
- Option C (오답): 호출 시마다 수동 승인을 요구하는 것은 인간의 개입 부담을 늘릴 뿐, 에이전트가 스스로 어떤 도구가 더 적절한지 판단하는 프롬프트/선택 로직을 개선해 주지 못합니다.

<br>

---

### 22번 문제

**1. 문제 원문**

A QA engineer notices that a coding assistant consistently picks `run_linter` instead of `run_type_checker` when a user says "check my code for issues," even though the user meant type errors. Both tools' descriptions read "Checks code for issues." What is the most targeted fix?

A) Reduce the number of code-checking tools available to the assistant to one, since offering more than one inherently causes confusion.  

B) Instruct users to say "lint" or "type check" explicitly every time, since tool descriptions cannot influence this kind of ambiguity.  

C) Specify in each description the exact category of issue each tool detects, along with an example phrase associated with each one.  

D) Merge the two tools' outputs into a single combined report and always run both regardless of what the user actually asked for.  

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**C번**: Specify in each description the exact category of issue each tool detects, along with an example phrase associated with each one.

**정답 및 해설:**  
**핵심 개념**: 도구 설명 세분화 및 예시 프롬프팅 (Tool Description Disambiguation)  
LLM 기반 에이전트는 도구의 기능 설명(Tool Description)을 기반으로 사용자의 의도에 맞는 도구를 선택합니다. 도구의 설명이 서로 동일하거나 지나치게 모호하면 모델은 임의의 도구를 무분별하게 선택하게 됩니다. 각 도구가 감지하는 문제 유형(스타일/구문 에러 vs 타입 에러)과 연관 트리거 문구를 설명에 명확히 작성하는 것이 도구 오선택을 방지하는 가장 근본적이고 정밀한 해결책입니다.

**문제 상황 분석:**
- 사용자가 "내 코드의 문제를 점검해줘"라고 입력하여 타입 에러 검사를 원하고 있습니다.
- 그러나 어시스턴트는 `run_type_checker` 대신 `run_linter`만을 계속 선택하고 있습니다.
- 그 원인은 두 도구의 설명이 모두 "Checks code for issues."로 동일하여 모델이 구별하지 못하기 때문입니다.

**C번이 정답인 이유:**
각 도구의 설명에 감지하는 문제의 정확한 카테고리(예: `run_linter`는 스타일/문법 구문 오류, `run_type_checker`는 타입 불일치/타입 오류)와 트리거가 될 수 있는 예시 문구를 명확히 명시하면, 모델이 모호한 입력에 대해서도 의도를 올바르게 판단하여 적절한 도구를 선택할 수 있게 됩니다.

**오답 분석:**
- Option A (오답): 도구 수를 하나로 줄이는 것은 타입 체크 기능이나 린트 기능 중 하나를 포기하는 것이므로 적절한 해결책이 아닙니다.
- Option B (오답): 도구 설명(Description)은 모델의 판단에 결정적인 영향을 미칩니다. 사용자에게 프롬프트 규칙을 강요하는 것은 에이전트의 사용성을 저해합니다.
- Option D (오답): 검사 목적과 무관하게 항상 두 도구를 모두 실행하는 것은 불필요한 연산 자원 및 시간 낭비를 초래합니다.

<br>

---

### 23번 문제

**1. 문제 원문**

A repository's `.mcp.json` defines a server named `analytics`, and a developer also has a server named `analytics` added with local scope on their machine pointing at a different endpoint entirely. When that developer runs Claude Code in the project, which server definition is used?

A) The project-scoped definition, because `.mcp.json` is checked into version control and therefore always overrides a developer's personal machine-level entries


B) The local-scoped definition, because local scope takes precedence over project scope when names collide, and the two entries are not merged


C) Neither definition connects, because Claude Code treats a duplicate server name across scopes as a configuration error and skips both


D) Both definitions are merged field by field, with the local entry's fields filling in whatever the project entry leaves unspecified

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**B번**: The local-scoped definition, because local scope takes precedence over project scope when names collide, and the two entries are not merged

**정답 및 해설:**  
**핵심 개념**: MCP 서버 설정 스코프 우선순위 (MCP Scope Precedence)  
Claude Code의 MCP 설정 구조에서는 개발자가 개인 로컬 환경에 맞춰 구성한 설정이 개별 개발 환경에 맞춤화될 수 있도록 **로컬 스코프(Local Scope)**에 가장 높은 우선순위를 부여합니다. 동일한 이름을 가진 MCP 서버가 여러 스코프에 중복 정의되어 이름 충돌이 발생하면, 높은 우선순위의 스코프 설정이 낮은 우선순위 설정을 전체 덮어쓰며, 필드별 부분 병합은 이루어지지 않습니다.

**문제 상황 분석:**
- 프로젝트 리포지토리의 `.mcp.json` (Project scope)에 `analytics`라는 MCP 서버가 정의되어 있습니다.
- 개발자 개인 머신의 로컬 설정 (Local scope)에도 완전히 다른 엔드포인트를 가리키는 `analytics` 서버가 등록되어 있습니다.
- 동일한 서버 이름을 가질 때 Claude Code가 어떤 스코프의 설정을 채택하는지 충돌 해결 정책을 묻고 있습니다.

**B번이 정답인 이유:**
Claude Code의 스코프 우선순위 규칙에 따라 이름 충돌(Name collision) 발생 시 **로컬 스코프(Local scope)**가 프로젝트 스코프(Project scope)보다 명확하게 우선합니다. 또한 두 설정이 부분적으로 합쳐지는 것이 아니라 로컬 스코프의 전체 정의가 단독 적용되므로 B번이 올바른 설명입니다.

**오답 분석:**
- Option A (오답): 프로젝트 스코프(`.mcp.json`)가 버전에 포함되어 있다 해서 로컬 사용자 설정을 강제로 덮어쓰지 않습니다. 오히려 개인화된 로컬 스코프가 프로젝트 설정을 재정의(Override)할 수 있도록 설계되어 있습니다.
- Option C (오답): 스코프 간 서버 이름 중복은 설정 에러로 처리되어 차단되는 것이 아니라, 우선순위 규칙에 따라 단일 설정을 선택하여 정상 작동합니다.
- Option D (오답): 두 스코프의 설정 필드들이 객체 단위로 병합(Field-by-field merge)되는 것이 아니며, 높은 우선순위 스코프의 엔트리가 전체 채택됩니다.

<br>

---

### 24번 문제

**1. 문제 원문**

A project has three MCP servers configured: a Postgres server, a Sentry server, and a Slack server, all healthy and connected. Mid-session, the agent is asked to pull a database schema, cross-reference a recent Sentry error, and post a summary to Slack in one request. What should the architect expect about tool availability for this request?

A) Tools from all three connected servers are available to the agent simultaneously, so it can call across Postgres, Sentry, and Slack tools within the same turn as needed


B) Only one MCP server can hold an active connection at any given time, so the developer must disconnect Postgres before Sentry's tools will respond to a call


C) Only the tools from the server whose name the prompt most closely matches will be loaded, so the agent must be told explicitly which server to prioritize


D) The agent must complete every Postgres tool call and receive its results before Sentry and Slack tools become selectable at all during that same turn

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**A번**: Tools from all three connected servers are available to the agent simultaneously, so it can call across Postgres, Sentry, and Slack tools within the same turn as needed

**정답 및 해설:**  
**핵심 개념**: MCP 멀티 서버 동시 연결 및 다중 도구 호출 (Multi-MCP Server Coexistence & Multi-Tool Calling)  
MCP(Model Context Protocol) 클라이언트는 복수의 MCP 서버와 동시에 세션을 유지할 수 있습니다. 각 서버가 노출하는 모든 도구들은 컨텍스트에 통합되어 에이전트에게 동시에(simultaneously) 제공되며, 모델은 단일 턴/요청 내에서도 여러 서버의 도구를 자유롭게 조합하여 연속적으로 혹은 동시에 호출할 수 있습니다.

**문제 상황 분석:**
- 현재 Postgres, Sentry, Slack이라는 3개의 MCP 서버가 모두 정상적으로 연결되어 있습니다.
- 단 한 번의 프롬프트 요청으로 "DB 스키마 조회 -> Sentry 에러 참조 -> Slack 요약 전송"이라는 다중 단계 및 다중 서버 작업을 처리해야 합니다.
- MCP 클라이언트 환경에서 이 3개 서버의 도구들이 제공되는 방식과 동작 방식을 파악하는 것이 핵심입니다.

**A번이 정답인 이유:**
연결된 모든 MCP 서버의 도구 목록은 클라이언트에 동시 노출됩니다. 따라서 에이전트는 한 번의 사용자 요청(동일한 턴) 내에서 필요에 따라 Postgres, Sentry, Slack 도구들을 제약 없이 자유롭게 순차적/다중 호출할 수 있습니다.

**오답 분석:**
- Option B (오답): MCP는 동시에 여러 서버 연결을 유지할 수 있으며, 하나의 서버만 선택적 연결을 허용한다는 제약은 존재하지 않습니다.
- Option C (오답): 프롬프트 키워드 유사도에 따라 특정 서버의 도구만 선택적으로 로드되는 것이 아니며, 연결된 모든 서버의 도구가 기본적으로 로드 및 제공됩니다.
- Option D (오답): 순차적인 작업이라 하더라도 동일 턴 내에서 다른 서버의 도구가 선택 불가능하게 블로킹되는 구조가 아닙니다. 모든 도구는 턴 시작 시점부터 이미 선택 가능한 상태로 노출되어 있습니다.

<br>

---

### 25번 문제

**1. 문제 원문**

A tool named `analyze_content`, originally built for summarizing pasted text, has its description copied almost verbatim onto a newer tool, `analyze_document`, meant for uploaded PDFs. Following the pattern of renaming a tool to eliminate overlap, what should the team do?

A) Rename `analyze_content` to a more specific name, such as `summarize_pasted_text`, and limit its description to pasted text only, while `analyze_document` handles uploaded PDFs.


B) Give both tools identical descriptions but different internal function names so backend routing can disambiguate them.


C) Delete `analyze_document` and require users to always paste document contents in as plain text from now on.


D) Add a disclaimer inside each tool's error message stating the wrong tool may have been called, shown after execution fails.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**A번**: Rename `analyze_content` to a more specific name, such as `summarize_pasted_text`, and limit its description to pasted text only, while `analyze_document` handles uploaded PDFs.

**정답 및 해설:**  
**핵심 개념**: 도구 모호성 해소 및 명명 패턴 (Tool Disambiguation & Specific Naming)  
LLM 에이전트는 도구의 **이름(Name)**과 **설명(Description)**을 바탕으로 어떤 도구를 호출할지 판단합니다. 도구의 이름이나 설명이 중복(Overlap)되면 모델이 올바른 도구를 선택하지 못하고 오호출할 가능성이 높아집니다. 역할이 명확히 구분되도록 도구의 이름을 구체화하고 설명을 명확히 한정하는 것이 권장되는 디자인 패턴입니다.

**문제 상황 분석:**
- 텍스트 요약용 기존 도구(`analyze_content`)와 PDF 처리용 신규 도구(`analyze_document`)의 설명이 거의 동일하게 복사되었습니다.
- 기능적 대상(붙여넣은 일반 텍스트 vs 업로드된 PDF 파일)이 다름에도 명칭과 설명의 중복으로 인해 LLM이 혼란을 겪을 수 있습니다.
- "중복을 제거하기 위한 도구 명명/재정의 패턴"에 부합하는 해결책을 찾아야 합니다.

**A번이 정답인 이유:**
기존 범용 도구 이름(`analyze_content`)을 목적에 맞게 구체적인 이름(`summarize_pasted_text`)으로 변경하고, 설명 또한 "붙여넣은 텍스트 처리"로 명확히 제한하여, PDF 처리 전용 도구인 `analyze_document`와 이름/설명 상의 중복 및 모호성을 완벽히 제거할 수 있습니다.

**오답 분석:**
- Option B (오답): 두 도구의 설명을 동일하게 유지하면 LLM 프롬프트 수준에서 도구 선택 모호성이 해소되지 않으므로 백엔드 라우팅 이전에 잘못된 도구가 선택됩니다.
- Option C (오답): PDF 파일 처리라는 핵심 기능을 삭제하는 것은 사용자 경험을 떨어뜨리는 잘못된 접근 방식입니다.
- Option D (오답): 도구 호출이 이미 실패한 이후 에러 메시지에 경고를 남기는 사후 처리는 에이전트의 올바른 도구 선택 능력을 사전에 개선해주지 못합니다.

<br>

---

### 26번 문제

**1. 문제 원문**

Claude Code is asked to create a brand-new configuration file, `config/feature-flags.json`, that does not yet exist anywhere in the repository, with content fully specified by the architect in the request. Which tool should Claude use to create this file?

A) Read, followed immediately by Write, on the assumption that Write always requires a preceding Read regardless of whether the target file exists


B) Write, providing the full file path and the complete specified content, since creating a brand-new file does not require a prior read


C) Bash, using a heredoc to populate the file, on the assumption that Write cannot create files that do not already exist


D) Edit, providing an old_string that matches the contents of an empty file and a new_string containing the specified content

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**B번**: Write, providing the full file path and the complete specified content, since creating a brand-new file does not require a prior read

**정답 및 해설:**  
**핵심 개념**: Claude Code 도구 역할 구분 (`Write` vs `Edit` vs `Read`)  
Claude Code의 파일 조작 도구 중 `Write` 도구는 새 파일 생성 및 파일 전체 덮어쓰기 용도로 설계되었습니다. 완전히 새로운(brand-new) 파일을 생성할 때는 사전에 파일 내용이나 경로를 `Read`할 필요가 없으며, 전체 파일 경로와 파일에 들어갈 전체 내용만 `Write` 도구에 전달하여 즉시 파일을 생성합니다.

**문제 상황 분석:**
- 리포지토리 상에 존재하지 않는 완전히 새로운 설정 파일(`config/feature-flags.json`)을 생성하는 요청입니다.
- 파일에 들어갈 내용이 사용자/아키텍트 요청에 완전히 명시되어 있습니다.
- 사전에 파일 읽기(Read)가 필요한지, 어떤 파일 작성 전용 도구(Write/Edit/Bash)를 사용해야 하는지가 핵심입니다.

**B번이 정답인 이유:**
존재하지 않는 완전히 새로운 파일을 생성할 때는 사전 `Read` 호출 없이 `Write` 도구에 전체 파일 경로와 내용을 전달하는 것이 올바른 도구 사용 표준입니다. 기존 파일의 일부를 수정하는 경우에는 `Edit`(또는 사전 `Read` 후 작업)이 권장되지만, 신규 파일 생성 시에는 `Write`가 독립적으로 바로 수행됩니다.

**오답 분석:**
- Option A (오답): 대상 파일이 존재하지 않는 신규 생성의 경우, 사전에 `Read` 도구를 호출할 필요가 없으며 이는 불필요한 도구 호출 턴을 낭비하게 됩니다.
- Option C (오답): `Write` 도구는 이미 존재하지 않는 신규 파일을 문제없이 생성할 수 있습니다. 셸 명령어(`Bash`)로 파일 작성을 대체하는 것은 불필요한 셸 부작용을 일으킬 수 있으므로 권장되지 않습니다.
- Option D (오답): `Edit` 도구는 기존 파일 내 특정 텍스트 구간(`old_string`)을 찾아 `new_string`으로 치환할 때 사용되는 도구이며, 존재하지 않는 신규 파일 생성용 도구가 아닙니다.

<br>

---

### 27번 문제

**1. 문제 원문**

An MCP server exposes `update_inventory`. When the request body is missing the required `sku` field, the server currently returns `isError: true` with `errorCategory: "transient"` and `isRetryable: true`. An agent retries the exact same malformed request repeatedly and never succeeds. What is wrong with this error classification?

A) `isRetryable` should remain true because validation errors are inherently transient once the missing field is eventually supplied by a later, unrelated request


B) The categorization is correct as written, since the agent's repeated retries are the expected and desired behavior for any error carrying `isRetryable: true`


C) The tool should have used a JSON-RPC protocol-level error instead of a tool result, since any error involving a missing field must always be surfaced at the protocol layer


D) A missing required field is a validation error, not a transient one, so marking it retryable causes the agent to resend an identically malformed request instead of correcting the input

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**D번**: A missing required field is a validation error, not a transient one, so marking it retryable causes the agent to resend an identically malformed request instead of correcting the input

**정답 및 해설:**  
**핵심 개념**: MCP 에러 분류 및 재시도 메커니즘 (Error Classification & Retry Logic)  
MCP 및 에이전트 시스템에서 에러는 네트워크 타임아웃, 일시적 일시 정지 등과 같은 **일시적 에러(Transient Error)**와, 잘못된 요청 파라미터나 누락된 필수 필드 등과 같은 **유효성/입력 에러(Validation Error / Permanent Error)**로 구분됩니다. 유효성 에러를 일시적 에러로 잘못 분류하고 `isRetryable: true`로 설정하면, 에이전트는 입력을 수정하지 않은 채 똑같이 잘못된 요청을 무한히 재시도하는 무한 루프에 빠지게 됩니다.

**문제 상황 분석:**
- `update_inventory` 도구 실행 시 필수 값인 `sku` 필드가 누락되는 입력 오류가 발생했습니다.
- 서버가 이를 일시적 에러(`transient`)로 분류하고 `isRetryable: true`를 반환했습니다.
- 에이전트는 이 응답을 받고 입력값을 수정하는 대신 동일한 페이로드를 반복 재시도하여 계속 실패하는 문제가 발생했습니다.

**D번이 정답인 이유:**
필수 필드 누락은 일시적인 네트워크 장애가 아닌 클라이언트의 **입력 검증 에러(Validation error)**입니다. 재시도 가능(`isRetryable: true`)으로 응답하면 에이전트는 단순 재시도(Retry)로 해결될 것이라 판단하여 잘못된 요청을 그대로 재전송하게 되므로, 이를 잘못된 에러 분류로 올바르게 지적한 D번이 정답입니다.

**오답 분석:**
- Option A (오답): 나중에 다른 관련 없는 요청이 필드를 제공한다고 해서 이전 잘못된 요청이 자동으로 해결되지 않습니다. 유효성 에러는 일시적 에러가 아닙니다.
- Option B (오답): 에이전트가 실패할 것이 명확한 요청을 무한 반복 재시도하는 것은 잘못된 분류로 인해 발생한 부작용이며, 정상적인 동작이 아닙니다.
- Option C (오답): 도구가 정상적으로 수신되어 인자(Argument) 수준에서 유효성 검사가 실패한 경우, 이는 JSON-RPC 프로토콜 자체의 파싱 실패가 아니라 도구 실행 결과(Tool result) 내의 응답 오류로 처리되는 것이 일반적입니다.

<br>

---

### 28번 문제

**1. 문제 원문**

A team builds a single agent that handles research, drafting, fact-checking, and formatting for a report-generation pipeline. The agent is given all 18 tools used across these functions. Reviewers notice it frequently picks a plausible-but-wrong tool, or stalls comparing similar options, even though each individual tool works correctly in isolation. Which change is most likely to fix the selection accuracy problem?

A) Rewrite the 18 tool descriptions to be shorter so the model spends less time reading each one before deciding


B) Keep the single agent but raise its max_tokens limit so it has more room to reason through the tool list


C) Split the work across specialized subagents so each one is exposed to only the 4-5 tools relevant to its own role


D) Sort the 18 tools alphabetically in the tools array so the model scans them in a consistent order

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**C번**: Split the work across specialized subagents so each one is exposed to only the 4-5 tools relevant to its own role

**정답 및 해설:**  
**핵심 개념**: 서브에이전트 분할 및 도구 범위 제한 (Subagent Architecture & Tool Scoping)  
단일 에이전트에 너무 많은 도구(약 10~20개 이상)를 노출하면 컨텍스트 혼란, 유사 도구 간의 오선택(Plausible-but-wrong tool selection), 추론 지연이 발생합니다. 각 역할(리서치, 작성, 검증 등)에 특화된 서브에이전트로 분할하고 각 서브에이전트에 필드에 맞는 최소한의 도구(4~5개)만 노출하면 도구 선택의 정확도와 성능이 극대화됩니다.

**문제 상황 분석:**
- 하나의 에이전트가 보고서 생성 파이프라인의 모든 단계(조사, 작성, 검증, 포맷팅)를 담당합니다.
- 전체 18개에 달하는 과도하게 많은 도구가 단일 에이전트에 한꺼번에 부여되었습니다.
- 각 도구 자체는 정상 작동하지만, 도구 선택 옵션이 너무 많아 그럴듯하지만 잘못된 도구를 선택하거나 비교 추론하느라 지연되는 문제가 발생합니다.

**C번이 정답인 이유:**
작업을 전문화된 서브에이전트(Specialized subagents)로 분할하고, 각 서브에이전트가 본인의 역할에 필요한 4~5개의 도구에만 접근하도록 제한하면 모델이 선택해야 하는 옵션의 범위가 줄어들어 도구 선택 정확도 문제를 근본적으로 해결할 수 있습니다.

**오답 분석:**
- Option A (오답): 도구 설명을 무작정 단축하면 필수 정보가 누락되어 모델이 도구의 역할을 오해할 위험이 높아지며, 도구 개수 과다로 인한 혼란을 해결하지 못합니다.
- Option B (오답): `max_tokens`를 늘리는 것은 생성할 수 있는 응답 길이를 늘려줄 뿐, 18개의 도구 후보 중 올바른 도구를 식별하는 인지적/선택적 정확도를 높여주지 못합니다.
- Option D (오답): 도구 목록을 알파벳순으로 정렬하는 것은 도구 간의 기능적 모호성이나 과도한 도구 수로 인한 인지 과부하 문제를 해결하는 데 아무런 도움이 되지 않습니다.

<br>

---

### 29번 문제

**1. 문제 원문**

A `charge_card` MCP tool receives a request with an amount field formatted as `"$45.00"` instead of a numeric type as specified by its input schema. Before the tool's handler logic even runs, how does the MCP client typically surface this failure, and how should that differ from the tool later reporting a declined charge?

A) The malformed argument triggers a JSON-RPC protocol error from schema validation before the tool executes, while a declined charge is reported inside the tool result with `isError:true`.


B) The client silently coerces the malformed argument to a number before invocation, so neither a schema validation error nor a declined charge occurs; the handler receives a valid amount, and any decline is a business result.


C) Both failures are reported inside a tool result with `isError:true`, because protocol errors are reserved for unknown tool names; all other issues, like malformed arguments or declined charges, appear as tool-level errors.


D) Both failures are reported identically as JSON-RPC protocol errors with code -32602 (Invalid params), because the client validates the request against the schema before calling the tool handler.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**A번**: The malformed argument triggers a JSON-RPC protocol error from schema validation before the tool executes, while a declined charge is reported inside the tool result with `isError:true`.

**정답 및 해설:**  
**핵심 개념**: 프로토콜 수준 에러(Protocol Errors) vs 도구 실행 결과 에러(Tool Execution Errors)  
MCP(Model Context Protocol) 시스템에서 에러는 명확히 두 개의 계층으로 구분됩니다.  
1. **프로토콜 수준 에러 (JSON-RPC Protocol Error)**: 도구 호출 전, 입력 스키마 위반(타입 불일치, 필드 누락, JSON 파싱 실패 등)이 발생할 때 반환됩니다. (예: `-32602 Invalid params`) 핸들러 로직이 실행되지 않습니다.  
2. **도구/비즈니스 수준 에러 (Tool Result Error)**: 도구 핸들러 로직은 정상적으로 구동되었으나, 외부 결제 거절/잔액 부족 등 업무 로직상 실패가 발생했을 때 반환됩니다. 이는 도구 실행 결과(`tool result`) 내에 `isError: true` 항목으로 포함되어 전달됩니다.

**문제 상황 분석:**
- `charge_card` 도구의 스키마는 숫자 타입을 요구하나, 문자열 `"$45.00"` 형태의 잘못된 인자가 입력되었습니다.
- 도구의 실행 로직(핸들러)이 동작하기 전 단계에서 스키마 검증 실패가 발생합니다.
- 스키마 검증 실패 방식과 결제 거절(도구 내부의 비즈니스 결과) 실패 표출 방식 간의 차이를 묻고 있습니다.

**A번이 정답인 이유:**
형식이 잘못된 인자(Malformed argument)는 스키마 검증 단계에서 도구 핸들러 실행 전에 **JSON-RPC 프로토콜 에러**를 유발합니다. 반면 도구가 정상 호출된 후 카드사 응답 등에 의해 발생하는 결제 거절(Declined charge)은 도구 실행 응답(`tool result`) 객체 내부에서 **`isError: true`** 상태로 반환됩니다. 두 에러의 발생 시점과 표출 형태를 정확히 구분하고 있습니다.

**오답 분석:**
- Option B (오답): MCP 클라이언트는 잘못된 데이터 타입을 수동으로 암묵적 타입 변환(Silent coercion)하지 않고 엄격한 스키마 검증을 수행합니다.
- Option C (오답): 프로토콜 에러는 알 수 없는 도구 이름뿐만 아니라 잘못된 파라미터 규격(Invalid params)에도 적용됩니다. 따라서 두 에러가 모두 도구 수준 에러로 반환되지 않습니다.
- Option D (오답): 카드 결제 거절은 비즈니스 로직 실행 결과이므로, 스키마 검증 실패에 사용하는 JSON-RPC 프로토콜 에러 코드(-32602)로 반환되지 않습니다.

<br>

---

### 30번 문제

**1. 문제 원문**

A `search_tickets` MCP tool queries a support database for tickets matching a filter. For a particular customer, the query executes successfully but zero tickets match. The tool currently returns `isError: true` with the text "No tickets found," and the coordinating agent responds to the user by apologizing for a system failure. What is the correct fix?

A) Keep `isError: true` but change errorCategory to transient so the agent automatically retries the identical search until a ticket eventually appears


B) Keep `isError: true` and add isRetryable false, since an empty result set should be treated the same as any other failed tool invocation


C) Return `isError: false` but omit the results array entirely, letting the agent infer from the missing field that the search matched nothing


D) Return `isError: false` with structured content showing an empty results array, since a successful query with no matches is not a tool execution error

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**  
**D번**: Return `isError: false` with structured content showing an empty results array, since a successful query with no matches is not a tool execution error

**정답 및 해설:**  
**핵심 개념**: MCP 도구 에러 처리 vs 빈 검색 결과 (Tool Errors vs Empty Results)  
MCP(Model Context Protocol) 및 에이전트 개발에서 도구 실행 에러(`isError: true`)는 데이터베이스 연결 실패, 권한 오류, 구문 오류 등 도구 수행 자체의 시스템적 결함이 발생했을 때만 사용해야 합니다. 쿼리가 정상 실행되어 조건에 맞는 데이터가 0건 조회된 것은 정상적인 실행 결과(Success)이며, 이때는 `isError: false`와 함께 빈 배열(`[]`) 형태의 구조화된 데이터(Structured content)를 반환해야 에이전트가 시스템 에러로 오해하지 않고 사용자에게 정확한 검색 결과를 안내할 수 있습니다.

**문제 상황 분석:**
- `search_tickets` 쿼리는 성공적으로 실행되었으나 조건에 맞는 티켓이 없어 결과가 0건 나왔습니다.
- 도구가 결과가 없음을 사유로 `isError: true`를 반환했습니다.
- 이를 수신한 에이전트는 시스템 장애가 발생한 것으로 판단하여 사용자에게 불필요한 사과 응답을 제공하는 문제가 발생했습니다.

**D번이 정답인 이유:**
검색 결과가 없는 것은 도구 실행 에러가 아닙니다. 따라서 `isError: false`를 반환하고 응답 내에 빈 배열(`"results": []`)을 구조화하여 명시해 주는 것이 올바른 도구 응답 설계입니다. 이를 통해 에이전트는 시스템 장애가 아닌 "조건에 일치하는 티켓이 없음"이라는 정상적인 검색 결과를 올바르게 인식하고 응답하게 됩니다.

**오답 분석:**
- Option A (오답): 일치하는 데이터가 없는 정상 응답 상태를 일시적 에러(`transient`)로 변경하면, 무의미하게 동일한 검색을 반복 재시도하는 낭비가 발생합니다.
- Option B (오답): 정상적인 빈 결과를 여전히 에러(`isError: true`)로 처리하는 것은 문제의 원인을 해결하지 못하며 에이전트가 지속적으로 장애로 인식하게 만듭니다.
- Option C (오답): 배열 자체를 생략해 버리면 에이전트가 결과를 해석할 때 스키마 불일치로 또 다른 에러나 환각을 일으킬 수 있으며, 검색 결과가 비어 있음을 나타내는 올바른 스키마 표현은 빈 배열(`[]`)을 명시하는 것입니다.

---

### 31번 문제

**1. 문제 원문**

A `cancel_subscription` MCP tool rejects a cancellation because the account is locked in a legal hold, a policy condition that will not change no matter how the request is retried or reformatted. The engineer must choose between labeling this a validation error or a business error. Which choice is correct, and why?

A) Validation error, because any rejection after initial schema checks indicates the input, when checked against account state, does not pass full system validation.

B) Business error, because the legal hold check occurs in a separate service after request validation, so the rejection is a business rule violation, not a schema issue.

C) It is a business error because the request itself is well-formed and the rejection stems from a policy rule about the account's state rather than malformed input.

D) Validation fails because the account ID in the request is the specific field that, when evaluated against the account's legal hold status, causes the rejection.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: It is a business error because the request itself is well-formed and the rejection stems from a policy rule about the account's state rather than malformed input.

**정답 및 해설:**

**핵심 개념**: 
검증 에러(Validation Error)는 전달된 데이터/입력의 형식, 구조, 필드 누락 등 스키마(Schema) 차원의 결함을 의미하며, 비즈니스 에러(Business/Domain Error)는 입력 형식 자체는 정상(Well-formed)이지만 도메인 정책, 계정 상태, 비즈니스 규칙 위반으로 인해 요청을 처리할 수 없는 경우 발생합니다.

**문제 상황 분석:**
- 클라이언트가 보낸 구독 취소 요청 메시지는 형식이나 데이터 타입 측면에서 완벽한 상태(Well-formed)입니다.
- 계정이 '법적 보류(Legal hold)' 상태에 있어 정책상 취소가 불가능한 시스템/비즈니스 제약이 존재합니다.
- 입력값의 형식을 재구성(reformat)하거나 재시도(retry)하더라도 비즈니스 정책 조건이 바뀌지 않는 한 해결되지 않습니다.

**C번이 정답인 이유:**
요청 문맥 및 스키마 관점에서 입력값 형태 자체는 정상적이지만, 시스템의 비즈니스 정책(계정 상태가 법적 보류)에 의해 거부된 것이므로 '비즈니스 에러(Business error)'로 분류하는 것이 정확합니다. C번은 입력 데이터의 결함(Malformed input)이 아닌 계정 상태 정책(Policy rule)이 원인임을 명확히 설명합니다.

**오답 분석:**
- **Option A (오답)**: 시스템 상태 체크 과정에서 거부된다고 해서 이를 유효성 검증(Validation) 에러로 분류하는 것은 에러의 본질(입력 오류 vs 도메인 정책 위반)을 혼동한 설명입니다.
- **Option B (오답)**: 비즈니스 에러로 분류한 결론은 맞지만, 이유로서 '별도의 서비스에서 실행되기 때문'이라는 구조적/실행 위치 조건은 에러의 개념적 원인 분류 표준이 아닙니다.
- **Option D (오답)**: 계정 ID 필드가 법적 보류 상태와 평가된다는 이유로 이를 검증 실패(Validation fails)로 규정하는 것은 잘못되었습니다. 필드의 형식적 유효성과 데이터가 가리키는 대상의 상태 정책 위반은 엄격히 구분됩니다.

---

### 32번 문제

**1. 문제 원문**

Claude Code is fixing a bug and wants to reproduce it first by running the project's test suite and capturing the failing stack trace before making any code changes. Which tool should Claude use to run the suite and view its output?

A) Grep, to search the codebase for the word test and treat matching file names as evidence that the suite has already passed

B) Bash, to invoke the project's test runner command and capture its stdout and stderr, including the stack trace, in the result

C) Read, to open the test runner's configuration file and infer the current pass or fail status of the suite from its settings

D) Glob, to list all files matching **/*.test.* and treat the presence of test files as confirmation that the suite runs cleanly

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Bash, to invoke the project's test runner command and capture its stdout and stderr, including the stack trace, in the result

**정답 및 해설:**

**핵심 개념**: 
Claude Code 환경에서 `Bash` 도구는 터미널 명령어를 실행하고 그 결과로 나오는 표준 출력(`stdout`)과 표준 에러(`stderr`)를 캡처하는 데 사용됩니다. 외부 명령어(예: `npm test`, `pytest` 등 테스트 러너)를 직접 실행하여 실제 오류 발생 현상 및 스택 트레이스를 확인하기 위해서는 Shell 명령을 실행할 수 있는 `Bash` 도구가 필수적입니다.

**문제 상황 분석:**
- Claude Code가 코드를 수정하기 전, 버그를 재현하고 오류 원인을 확인하려 합니다.
- 이를 위해 프로젝트의 테스트 스위트를 직접 실행(run)하고 출력 결과(스택 트레이스)를 수집해야 합니다.
- 파일 검색, 파일 읽기 등의 단순 조회용 도구로는 시스템 명령어를 직접 실행하거나 실행 결과를 얻어올 수 없습니다.

**B번이 정답인 이유:**
`Bash` 도구는 프로젝트에 설정된 테스트 러너 명령어(예: `pytest`, `jest`, `cargo test` 등)를 실제로 실행(invoke)하고, 이 과정에서 출력되는 스택 트레이스를 포함한 `stdout`과 `stderr` 결과를 받아올 수 있는 유일한 도구입니다.

**오답 분석:**
- **Option A (오답)**: `Grep`은 텍스트 패턴을 검색하는 도구일 뿐, 명령어를 실행하거나 테스트 결과를 얻을 수 없습니다. 또한 파일 이름 존재 여부를 테스트 통과 증거로 간주한다는 설명 역시 부적절합니다.
- **Option C (오답)**: `Read`는 파일을 읽는 도구입니다. 설정 파일의 내용을 읽는 것만으로는 실제 테스트 실행 결과나 에러 발생 시의 스택 트레이스를 알 수 없습니다.
- **Option D (오답)**: `Glob`은 패턴에 맞는 파일 목록을 찾는 도구입니다. 테스트 파일이 존재하는지 확인하는 것과 실제 테스트를 실행하여 버그를 재현하는 것은 무관합니다.

---

### 33번 문제

**1. 문제 원문**

An onboarding agent walks a new user through account setup and needs to call `create_profile` immediately as the very first action of the conversation, before considering any other tool such as `send_welcome_email` or `assign_default_settings`. After that first call, the agent should freely decide among the remaining tools based on what the user says. What is the best way to configure this?

A) Order `create_profile` first in the `tools` array and leave `tool_choice` at `{"type": "auto"}` for the whole conversation

B) Use `tool_choice: {"type": "none"}` for the first turn so the model cannot call any tool, then switch to `{"type": "auto"}` afterward

C) Use `tool_choice: {"type": "any"}` for the entire conversation so the model is always forced to pick from `create_profile`, `send_welcome_email`, and `assign_default_settings`

D) Use `tool_choice: {"type": "tool", "name": "create_profile"}` for the first turn only, then switch to `tool_choice: {"type": "auto"}` for subsequent turns

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Use `tool_choice: {"type": "tool", "name": "create_profile"}` for the first turn only, then switch to `tool_choice: {"type": "auto"}` for subsequent turns

**정답 및 해설:**

**핵심 개념**: 
Anthropic Claude API의 `tool_choice` 파라미터는 모델의 도구 호출 동작을 정밀하게 제어합니다. 특정 도구를 무조건 강제로 실행하게 하려면 `{"type": "tool", "name": "<tool_name>"}`을 지정하며, 이후 턴에서 모델이 대화 흐름에 따라 도구 사용 여부 및 종류를 자율적으로 판단하게 하려면 `{"type": "auto"}`로 변경해야 합니다.

**문제 상황 분석:**
- 첫 턴에서는 다른 도구보다 `create_profile` 도구가 무조건 최우선으로 실행되어야 하는 명확한 제약 조건이 존재합니다.
- 첫 호출이 완료된 이후 턴부터는 사용자의 입력 내용에 따라 남아있는 도구들을 자율적/자유롭게 선택하여 사용할 수 있어야 합니다.
- 따라서 턴(Turn)의 진행 상태에 따라 `tool_choice` 설정을 동적으로 변경해주는 전략이 필요합니다.

**D번이 정답인 이유:**
첫 턴에서는 `tool_choice`를 `{"type": "tool", "name": "create_profile"}`로 지정하여 모델이 다른 도구나 일반 텍스트 응답 대신 무조건 `create_profile` 도구를 호출하도록 강제합니다. 그 후 두 번째 턴부터는 `tool_choice: {"type": "auto"}`로 변경함으로써 모델이 상황에 맞게 도구를 호출하거나 응답하도록 자율성을 부여하는 것이 완벽한 해결책입니다.

**오답 분석:**
- **Option A (오답)**: `tools` 배열 내의 순서는 모델의 자율적 선택(`auto`)에 강제력을 제공하지 않습니다. 모델이 첫 턴에 다른 도구를 선택하거나 텍스트 응답만 보낼 위험이 있습니다.
- **Option B (오답)**: `{"type": "none"}`은 첫 턴에 모델이 어떠한 도구도 호출하지 못하도록 금지하므로, 첫 동작으로 `create_profile`을 실행해야 하는 요구사항에 정반대됩니다.
- **Option C (오답)**: `{"type": "any"}`는 목록 내의 무작위 도구를 반드시 하나 호출하도록 강제하지만, 특정 도구(`create_profile`)만을 지정하여 강제할 수 없으며, 전체 대화 동안 적용하면 이후 턴에서 자율적 판단을 방해합니다.

---

### 34번 문제

**1. 문제 원문**

A `get_customer_orders` MCP tool is called for a customer who exists in the system but has placed zero orders. Separately, the same tool is called with a customer ID that does not exist in the database at all. How should these two outcomes be reported so the agent can respond correctly in each case?

A) Both cases return `isError:true` with `errorCategory` `transient`, and the agent should schedule periodic retries for these calls to account for possible delayed order placement or customer record creation.

B) The zero-orders case returns `isError:false` with an empty order array; the nonexistent-ID case returns `isError:true` with `errorCategory` `not_found_error` and a description that the customer ID was not found.

C) The zero-orders case returns `isError:true` with `errorCategory` `suspicious` and a description noting the empty result; the nonexistent-ID case returns `isError:false` with an empty `orders` array, treating the missing ID as an empty result.

D) Both cases return `isError:false` with an empty `orders` array, and the agent should proceed without error handling for both scenarios, as the tool correctly reports the absence of orders in each case.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: The zero-orders case returns `isError:false` with an empty order array; the nonexistent-ID case returns `isError:true` with `errorCategory` `not_found_error` and a description that the customer ID was not found.

**정답 및 해설:**

**핵심 개념**: 
MCP(Model Context Protocol) 도구의 응답 설계 시, 성공적인 리소스 조회 결과가 단지 빈 집합(empty set)인 경우와 조회 대상 리소스 자체가 존재하지 않는 리소스 조회 실패(Not Found)를 구분해야 합니다. 정상적인 데이터 처리 결과는 성공(`isError:false`)으로 응답하고, 조회 리소스 미존재는 에러(`isError:true`) 및 명확한 에러 카테고리(`not_found_error`)를 반환해야 에러 대처를 정확히 할 수 있습니다.

**문제 상황 분석:**
- 케이스 1: 존재하는 고객이지만 주문 내역이 없음 $\rightarrow$ 시스템 및 고객 조회는 정상 성공했으나 데이터 목록만 비어 있는 정상 응답 상태입니다.
- 케이스 2: 데이터베이스에 입력된 고객 ID 자체가 존재하지 않음 $\rightarrow$ 요청한 대상(Resource)을 찾을 수 없는 명백한 조회 에러 상태입니다.
- 두 상황을 구분 없이 동일하게 처리하면 에러 핸들링 및 사용자에 대한 응답 유효성이 떨어지게 됩니다.

**B번이 정답인 이유:**
존재하는 고객의 주문 0건 케이스는 조회가 정상적으로 완료된 것이므로 `isError:false`와 함께 빈 배열(`[]`)을 반환해야 합니다. 반면, 데이터베이스에 존재하지 않는 고객 ID 케이스는 리소스를 찾을 수 없는 오류 상황이므로 `isError:true`, `errorCategory: not_found_error` 및 오류 상세 설명을 반환하는 것이 시스템 및 에이전트 설계 표준에 부합합니다.

**오답 분석:**
- **Option A (오답)**: 두 케이스 모두 에러(`isError:true`) 및 일시적 오류(`transient`)로 처리하고 재시도를 수행하는 것은 잘못된 오류 분류이자 불필요한 네트워크 재요청을 유발합니다.
- **Option C (오답)**: 정상 조회된 빈 결과를 의심스러운 오류(`suspicious`)로 간주하고, 존재하지 않는 리소스 조회를 성공(`isError:false`)으로 처리하는 것은 두 케이스의 의미를 반대로 뒤바꾼 설명입니다.
- **Option D (오답)**: 존재하지 않는 고객 ID 조회를 정상 응답으로 간주하여 빈 배열로 반환하면, 에러를 감추게 되므로 에러 핸들링이 불가능해집니다.

---

### 35번 문제

**1. 문제 원문**

A team has ten MCP servers connected, but one small internal server exposes two tools that Claude needs on nearly every single turn, and the team has noticed occasional delay while tool search resolves them. What configuration change addresses this for just that one server?

A) Increase `MAX_MCP_OUTPUT_TOKENS` for just that server so its tool responses return noticeably faster once a call is actually made

B) Set `alwaysLoad: true` on that server's entry so its tools load into context at session start instead of being deferred behind tool search

C) Set `ENABLE_TOOL_SEARCH=false` globally so every server's tools load upfront and none are deferred behind a search step

D) Move that server's entry from project scope to user scope so its tools are prioritized ahead of the other nine connected servers

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Set `alwaysLoad: true` on that server's entry so its tools load into context at session start instead of being deferred behind tool search

**정답 및 해설:**


**핵심 개념**: 
MCP(Model Context Protocol) 환경에서 연결된 서버나 도구가 많아지면 컨텍스트 및 토큰 효율성을 위해 도구 탐색(Tool Search) 단계가 개입하여 필요할 때 동적으로 도구를 탐색 및 지연 로딩(Deferred loading)합니다. 그러나 특정 서버의 도구를 거의 매 턴마다 사용하는 경우, 해당 서버 설정 항목에 `alwaysLoad: true` 옵션을 지정하면 세션 개시 시점에 도구 정의가 컨텍스트에 즉시 로드되어 탐색 단계로 인한 지연을 없애줍니다.

**문제 상황 분석:**
- 총 10개의 MCP 서버가 연결되어 있어 기본적으로 도구 탐색(Tool Search) 레이어가 동작 중입니다.
- 특정 1개 내부 서버의 도구 2개는 거의 모든 대화 턴마다 계속 사용됩니다.
- 도구가 필요할 때마다 동적 도구 탐색이 수행되어 지연(Delay)이 발생하므로, 오직 해당 서버에 대해서만 도구를 상시 로드하도록 설정해야 합니다.

**B번이 정답인 이유:**
해당 서버의 구성 항목에 `alwaysLoad: true`를 지정하면, 해당 서버의 도구들이 세션 시작 시 컨텍스트에 사전에 즉시 포함됩니다. 이로 인해 매 턴마다 발생하던 도구 탐색(Tool Search) 지연을 회피할 수 있으며, 질문에서 요구한 "오직 그 하나의 서버에 대해서만(for just that one server)" 제약을 정확히 충족합니다.

**오답 분석:**
- **Option A (오답)**: `MAX_MCP_OUTPUT_TOKENS`는 도구 응답 결과의 토큰 수 제한을 설정하는 값으로, 도구 호출 전 도구를 검색/해석하는 지연 문제 및 로딩 시점과는 아무런 관련이 없습니다.
- **Option C (오답)**: `ENABLE_TOOL_SEARCH=false`를 전역(globally)으로 설정하면 10개 서버 전체의 도구 탐색이 비활성화되어 컨텍스트 낭비 및 관리 부담이 커집니다. 문제에서는 "오직 그 하나의 서버"만 변경할 것을 요구했습니다.
- **Option D (오답)**: 스코프 변경(Project $\rightarrow$ User)은 설정 적용 범위와 공유 방식에 관한 것일 뿐, 도구를 세션 개시 시 컨텍스트에 상시 로드하여 탐색 지연을 제거하는 동작 제어 옵션이 아닙니다.

---

### 36번 문제

**1. 문제 원문**

A tool named `analyze_content` was originally built to summarize any pasted content, including emails and internal notes, but its description was never updated after a web-specific successor tool was introduced. The model now sometimes calls the general tool for web-only tasks. What is the recommended remediation?

A) Leave both tools with their original names, but ask users to specify which tool they want by internal ID every time.

B) Rename the general tool to reflect its remaining scope, and update its description to exclude the case the newer tool now handles.

C) Increase the priority weight of the newer tool in the backend routing configuration without touching either tool's description.

D) Delete the description text from both tools so the model relies entirely on tool names for disambiguation.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Rename the general tool to reflect its remaining scope, and update its description to exclude the case the newer tool now handles.

**정답 및 해설:**

**핵심 개념**: 
LLM의 도구 사용(Tool Use / Function Calling)에서 모델은 도구의 이름(Name)과 설명(Description)을 가장 중요한 맥락 지표로 활용합니다. 도구 기능의 범위(Scope)가 변경되거나 후속 전문 도구가 추가된 경우, 기존 도구의 설명과 이름을 업데이트하여 역할 중복 및 모호성을 제거해야 모델이 정확한 도구를 선택합니다.

**문제 상황 분석:**
- 기존 `analyze_content` 도구는 웹 콘텐츠를 포함한 범용 콘텐츠 요약용으로 설계되었습니다.
- 웹 전용 후속 도구가 새로 추가되었으나, 기존 범용 도구의 설명이 업데이트되지 않았습니다.
- 이로 인해 모델이 웹 전용 작업 처리 시 새로운 웹 전용 도구 대신 기존 범용 도구를 오호출(Hallucination / Misrouting)하는 현상이 발생하고 있습니다.

**B번이 정답인 이유:**
기존 범용 도구의 이름을 현재 역할 범위에 맞게 변경하고, 설명을 업데이트하여 새로운 도구가 전담하는 웹 관련 처리 케이스를 명시적으로 제외(Exclude)시키는 것이 모호성을 제거하는 가장 표준적이고 확실한 해결책입니다.

**오답 분석:**
- **Option A (오답)**: 매번 내부 ID로 사용할 도구를 명시하도록 사용자에게 요구하는 것은 에이전트의 자율적 도구 호출 기능을 저해하며 심각한 UX 저하를 초래합니다.
- **Option C (오답)**: 백엔드 라우팅 가중치를 조절하는 방식은 LLM 프롬프트 수준에서의 도구 설명 모호성을 근본적으로 해결하지 못합니다.
- **Option D (오답)**: 설명 텍스트를 삭제하면 모델이 도구의 역할과 입력 규칙을 파악할 수 없게 되어 올바른 도구 선택이 불가능해집니다.

---

### 37번 문제

**1. 문제 원문**

A team observes that adding 'If in doubt, use the search tool' to the system prompt caused the model to call `search_web` even when the `lookup_internal_docs` tool was more appropriate. What does this scenario illustrate?

A) System prompts can significantly influence tool selection, and explicit instructions may override the model's assessment of which tool is most appropriate.

B) System prompts have no measurable effect on tool selection; the behavior must be caused by a defect in the model.

C) The word 'search' appearing anywhere in a tool's name always takes absolute priority over any other tool regardless of prompt content.

D) The `lookup_internal_docs` tool must have a malformed JSON schema, since that is the only way a tool can be excluded from selection.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: System prompts can significantly influence tool selection, and explicit instructions may override the model's assessment of which tool is most appropriate.

**정답 및 해설:**

**핵심 개념**: 
LLM의 도구 선택(Tool Selection) 과정에서 시스템 프롬프트(System Prompt)에 포함된 지시사항은 모델의 의사결정에 결정적인 영향을 미칩니다. 프롬프트에 명시된 지시나 편향(Bias) 문구는 도구의 개별 설명이나 맥락적 적합성에 대한 모델 자체의 가치 평가보다 우선시되어 적용될 수 있습니다.

**문제 상황 분석:**
- 시스템 프롬프트에 'If in doubt, use the search tool(확신이 없으면 검색 도구를 사용하라)'이라는 강한 지시 지침을 추가함.
- 그 결과, 내부 문서를 먼저 확인하는 `lookup_internal_docs` 도구가 상황상 더 적합함에도 불구하고 모델이 프롬프트의 지침을 따라 `search_web`을 오호출함.
- 지시 문구 하나가 모델의 추론 및 도구 선택 판단 알고리즘을 덮어쓰는(Override) 지배적인 영향력을 나타냄.

**A번이 정답인 이유:**
시스템 프롬프트는 모델의 도구 선택 동작에 강력한 영향을 미치며, 명시적으로 주어진 프롬프트 지침은 모델이 본래 판단했을 최선의 도구 선택 기준보다 우선하여 작용함을 정확히 설명하고 있습니다.

**오답 분석:**
- **Option B (오답)**: 시스템 프롬프트가 도구 선택에 아무런 영향이 없으며 모델의 결함 때문이라는 주장은 거짓입니다. 프롬프트는 모델의 행동 제어에 핵심적 역할을 합니다.
- **Option C (오답)**: 'search'라는 단어의 포함 여부만으로 무조건 절대적 우선순위가 정해진다는 것은 프롬프트의 지침(지시어) 역할을 무시한 자의적인 해석입니다.
- **Option D (오답)**: 도구가 선택에서 제외되는 이유가 JSON 스키마 오류 때문이라는 것은 단정적 오류이며, 이 시나리오는 스키마 결함이 아닌 프롬프트 지시어에 의한 의사결정 편향 현상을 보여줍니다.

---

### 38번 문제

**1. 문제 원문**

A coordinator agent delegates a three-step data migration to a subagent: extract, transform, and load, but the load step fails twice on a database connection reset, a known transient condition, before finally succeeding on the third attempt inside the subagent's own execution. What should the subagent report back to the coordinator?

A) An `isError: true` result describing both connection resets in detail, so the coordinator can decide independently whether the migration should be retried

B) A success result summarizing the completed migration, since the transient failures were resolved locally and never needed to surface above the subagent

C) An escalation asking the coordinator to obtain new database credentials, since two consecutive connection resets indicate the credentials have expired

D) A partial-results payload listing only the extract and transform steps as done, omitting the load step entirely since it initially failed twice

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: A success result summarizing the completed migration, since the transient failures were resolved locally and never needed to surface above the subagent

**정답 및 해설:**

**핵심 개념**: 
계층적 에이전트 구조(Hierarchical Agent Architecture) 및 서브에이전트 패턴에서, 서브에이전트는 위임받은 작업을 자체적으로 관리하고 복구하는 캡슐화(Encapsulation) 책임을 가집니다. 일시적 오류(Transient Fault)가 서브에이전트 내부 재시도 로직을 통해 최종 해결되어 전체 작업이 완수되었다면, 상위 코디네이터에게는 불필요한 오류 메시지 대신 **성공 결과**만 보고하는 것이 올바른 설계입니다.

**문제 상황 분석:**
- 상위 코디네이터가 서브에이전트에게 3단계 데이터 마이그레이션(추출 $\rightarrow$ 변환 $\rightarrow$ 로드)을 위임함.
- 마지막 '로드' 단계에서 일시적인 연결 재설정(Transient Condition)으로 2회 실패가 발생했으나, 서브에이전트 내부에서 3번째 시도 만에 최종 성공함.
- 전체 태스크 관점에서는 3단계가 모두 최종 성공적으로 완료된 상태임.

**B번이 정답인 이유:**
일시적인 장애는 서브에이전트 수준에서 이미 성공적으로 복구(Resolved locally)되어 전체 마이그레이션 과업이 완성되었으므로, 코디네이터에게는 최종 작업의 성공 결과만 상위로 보고하는 것이 계층적 위임 구조 및 카오스 차단(Fault Containment) 원칙에 부합합니다.

**오답 분석:**
- **Option A (오답)**: 이미 내부 재시도로 최종 성공했음에도 불구하고 `isError: true`를 반환하면 상위 코디네이터가 불필요하게 전체 태스크를 재시도하거나 에러 처리를 수행하여 중복 작업 및 시스템 혼란을 유발합니다.
- **Option C (오답)**: 연결 재설정이 일시적 오류(Transient Condition)라고 문제에 명시되어 있고 세 번째에 성공했으므로, 자격 증명 만료로 단정 짓고 자격 증명을 재요청하는 것은 잘못된 진단입니다.
- **Option D (오답)**: 세 번째 시도에서 '로드' 단계가 최종 성공했음에도 불구하고 처음에 실패했다는 이유로 결과를 누락하거나 부분 성공으로만 보고하는 것은 데이터 상태 불일치를 일으킵니다.

---

### 39번 문제

**1. 문제 원문**

Claude Code needs to update a version string inside a nested JSON field in `package.json`, where the same string coincidentally also appears as a substring inside an unrelated dependency name elsewhere in the file. Claude wants Edit to target only the version field. Which `old_string` design correctly ensures the edit applies to the intended location only?

A) Use only the bare version string as `old_string`, since Edit automatically infers which occurrence is semantically the version field

B) Use a regular expression in `old_string` that matches the version field specifically, since Edit interprets `old_string` as regex when quotes are present

C) Set `replace_all` to true so every occurrence of the version string throughout the whole file is updated to the same new value

D) Include the surrounding JSON key and adjacent structure, such as the `"version":` prefix and its line, so the string becomes unique to that field

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Include the surrounding JSON key and adjacent structure, such as the `"version":` prefix and its line, so the string becomes unique to that field

**정답 및 해설:**

**핵심 개념**: 
Claude Code의 `Edit` 도구(파일 텍스트 교체 도구)는 파일 내에서 교체 대상인 `old_string`을 정확히 찾아 대체합니다. 파일 내에 동일한 문자열이 여러 곳 존재할 경우, 교체 대상이 모호해져 잘못된 위치가 변경되거나 교체 실패가 발생할 수 있습니다. 이를 방지하기 위해서는 주변의 키, 문맥 코드, 줄(Line) 등 주변 구조(Surrounding Context)를 `old_string`에 함께 포함시켜 파일 내에서 고유(Unique)하게 식별되도록 설계해야 합니다.

**문제 상황 분석:**
- `package.json` 파일 내에 교체하고자 하는 버전 문자열이 존재합니다.
- 동일한 문자열이 상관없는 다른 의존성(dependency) 이름의 일부로도 우연히 포함되어 있습니다.
- 교체 대상의 유일성이 확보되지 않으면 의도치 않은 다른 의존성 이름까지 함께 변경되는 문제가 발생할 수 있습니다.

**D번이 정답인 이유:**
`"version": "1.0.0"`과 같이 단순히 버전 값만 지정하지 않고 주변의 JSON 키(`"version":`)와 해당 라인의 고유한 문맥/구조를 `old_string`에 함께 포함함으로써, 파일 전체에서 오직 변경하려는 특정 버전 필드만 고유하게 타겟팅(Unique match)되도록 확실히 보장할 수 있습니다.

**오답 분석:**
- **Option A (오답)**: Edit 도구는 파일 내 문맥이나 의미(Semantics)를 스스로 추론하여 교체해 주지 않으며, 완전히 일치하는 텍스트 검색 방식을 사용합니다.
- **Option B (오답)**: Claude Code의 Edit 도구는 `old_string`을 정규식(Regex)으로 해석하지 않고 리터럴 텍스트(Literal text)로 처리합니다.
- **Option C (오답)**: `replace_all: true`로 설정하면 의존성 이름에 포함된 무관한 위치의 동일 문자열까지 모두 원치 않는 새 값으로 바뀌는 사이드 이펙트(Side effect)가 발생합니다.

---

### 40번 문제

**1. 문제 원문**

A developer wants to try out an experimental local MCP server that queries their personal Notion workspace. They do not want it to appear for any other teammate, and they want it available whenever they open any project on their own machine. Which configuration achieves this?

A) Add the server with local scope so the entry is written to .mcp.json but excluded from git tracking via a .gitignore rule

B) Add the server directly inside .claude/settings.json so it inherits the personal visibility rules of local project settings

C) Add the server with project scope so the entry is written to .mcp.json and stays private until the developer marks it as personal-only

D) Add the server with user scope so the entry is written to ~/.claude.json and loads across every project on that machine without being shared

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Add the server with user scope so the entry is written to ~/.claude.json and loads across every project on that machine without being shared

**정답 및 해설:**

**핵심 개념**: 
Claude Code의 MCP(Model Context Protocol) 서버 설정 스코프는 **User Scope**와 **Project Scope**로 나뉩니다.
* **User Scope**: 사용자 홈 디렉터리의 `~/.claude.json` 파일에 저장되며, 해당 머신에서 여는 **모든 프로젝트**에 전역 적용되고 프로젝트 Git 리포지토리에 공유되지 않아 개인 전용으로 유지됩니다.
* **Project Scope**: 프로젝트 루트의 `.mcp.json` 파일에 저장되며, 해당 프로젝트 내에서만 적용되고 팀원들과 공유(Git 커밋)하기 위한 스코프입니다.

**문제 상황 분석:**
- 개발자가 개인 Notion 워크스페이스에 접근하는 실험적 MCP 서버를 설정하려 함.
- 다른 팀원에게 노출되지 않아야 함 (Git 등을 통해 공유 금지).
- 특정 프로젝트에 국한되지 않고, **자신의 머신에서 어떤 프로젝트를 열든(any project)** 항상 사용할 수 있어야 함.

**D번이 정답인 이유:**
사용자 스코프(User Scope)를 사용하면 설정이 개발자 개인의 홈 디렉터리(`~/.claude.json`)에 기록됩니다. 따라서 프로젝트 리포지토리를 통해 팀원에게 공유되지 않으면서, 해당 개발자 머신의 모든 프로젝트에 전역으로 로드되는 요구사항을 완벽히 충족합니다.

**오답 분석:**
- **Option A (오답)**: `.mcp.json`은 프로젝트 수준 스코프이며, `.gitignore`로 제외하더라도 개별 프로젝트 범위에만 국한되므로 "어떤 프로젝트에서나 사용 가능해야 한다"는 요구사항을 만족하지 못합니다.
- **Option B (오답)**: `.claude/settings.json`은 프로젝트 전용 설정 파일이며 MCP 서버를 사용자 전역 스코프로 등록하는 올바른 위치나 방식이 아닙니다.
- **Option C (오답)**: 프로젝트 스코프(`.mcp.json`)는 팀원 공유 목적으로 사용되며, 모든 프로젝트에서 전역 적용되지 않습니다.

---

### 41번 문제

**1. 문제 원문**

A document-processing agent has both an `extract_metadata` tool and several enrichment tools (`add_tags`, `link_related`, `generate_summary`). The enrichment tools depend on fields that only `extract_metadata` produces, and in early tests the model sometimes calls an enrichment tool first with guessed values. What is the recommended way to guarantee correct ordering for this first step?

A) Remove the enrichment tools from the agent's tool list on the first turn and only provide `extract_metadata`, then after `extract_metadata` returns, re-add `add_tags`, `link_related`, and `generate_summary` for subsequent turns.

B) Set `tool_choice` to `{"type": "tool", "name": "extract_metadata"}` on the turn where metadata is needed, then let the model choose from the enrichment tools with `auto` or `any` on subsequent turns.

C) Set `tool_choice` to `{"type": "any"}` for the entire conversation, so the model must select a tool on every turn, relying on its training to choose `extract_metadata` first when metadata is absent.

D) Add a detailed description to each enrichment tool stating that they require metadata fields only `extract_metadata` can provide, and keep `tool_choice` set to `auto` throughout the conversation.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Set `tool_choice` to `{"type": "tool", "name": "extract_metadata"}` on the turn where metadata is needed, then let the model choose from the enrichment tools with `auto` or `any` on subsequent turns.

**정답 및 해설:**


**핵심 개념**: 
Claude API의 `tool_choice` 파라미터는 에이전트의 도구 호출 실행 순서를 제어(Tool Use Control)할 때 가장 효과적인 메커니즘입니다. 특정 단계에서 선행되어야 하는 선결 조건 도구가 존재하는 경우, 해당 턴에서 `tool_choice: {"type": "tool", "name": "<tool_name>"}`으로 명시하면 모델이 값 추측(Guessing)이나 다른 도구의 오호출 없이 **해당 특정 도구를 무조건 최우선으로 호출하도록 결정론적으로 강제(Guarantee/Enforce)**할 수 있습니다.

**문제 상황 분석:**
- 에이전트에 메타데이터 추출 도구(`extract_metadata`)와 데이터 보강 도구들(`add_tags` 등)이 존재함.
- 보강 도구들은 `extract_metadata`가 생성한 결과 데이터에 절대적으로 의존함.
- 프롬프트/자율성에 맡길 경우, 첫 턴에서 모델이 값을 임의로 추측하여 보강 도구를 먼저 호출하는 순서 오류(Ordering Issue)가 발생함.
- 첫 단계에서 메타데이터 추출 도구가 반드시 가장 먼저 실행되도록 선결 실행 보장이 필요한 상황임.

**B번이 정답인 이유:**
첫 번째 턴(또는 메타데이터가 필요한 턴)에서 API 요청 시 `tool_choice`를 `{"type": "tool", "name": "extract_metadata"}`로 지정하면, 모델은 다른 어떤 행동도 하지 않고 무조건 해당 도구를 가장 먼저 실행합니다. 그 후 실행 결과가 돌아온 다음 턴부터는 `tool_choice`를 `auto` 또는 `any`로 전환하여 자율적으로 보강 도구를 선택하게 하므로 실행 순서를 100% 보장하는 가장 정석적이고 명확한 솔루션입니다.

**오답 분석:**
- **Option A (오답)**: 턴마다 API에 전달하는 도구 정의(`tools` 배열) 자체를 삭제하고 재등록하는 방식은 유연성이 떨어지며, 도구 정의를 매번 변경하는 것은 권장되는 도구 제어 방식이 아닙니다. API 레벨에서는 `tool_choice`를 통해 이를 제어하는 것이 표준입니다.
- **Option C (오답)**: `tool_choice: {"type": "any"}`는 목록 중 '아무 도구나 하나 선택'하라는 의미일 뿐, `extract_metadata`를 특정하여 강제하지 못하므로 추측값에 의한 오류 호출 문제를 해결하지 못합니다.
- **Option D (오답)**: 도구 설명(Description)에 의존조건을 적는 것은 확률적인 가이드라인일 뿐이며, 모델이 값 추측으로 첫 턴에 보강 도구를 호출하는 현상을 완전히(100%) 보장하여 방지할 수 없습니다.

---

### 42번 문제

**1. 문제 원문**

An MCP server's `create_invoice` tool calls a downstream billing API that returns a 503 while the service is deploying. The tool wraps this in a result with `isError: true` and a text block reading only "Operation failed." The agent retries the same call five times in a row, each time failing the same way, before giving up. What is the most direct cause of the wasted retries?

A) The result carries no structured metadata distinguishing transient from non-retryable failures. The agent thus has no basis for deciding whether retrying is worthwhile.

B) The downstream billing API returned an HTTP status code rather than a JSON-RPC error object, so the MCP client could not parse the response and defaulted to retrying repeatedly.

C) The agent's context window ran out of space to store the error text, so it could not remember that the same request had just failed and therefore repeated the call as if it were a new attempt.

D) The tool set `isError` to true instead of false, which signals to the agent that unlimited retries are the correct response and prevents it from recognizing that the error is transient.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: The result carries no structured metadata distinguishing transient from non-retryable failures. The agent thus has no basis for deciding whether retrying is worthwhile.

**정답 및 해설:**

**핵심 개념**: 
MCP(Model Context Protocol) 및 에이전트 기반 오류 처리에서, 도구가 오류를 반환할 때 단지 "Operation failed."와 같은 모호한 불투명(opaque) 텍스트만 전달하면 에러의 본질(일시적 장애 vs 재시도 불가능한 영구 장애)을 식별할 수 없습니다. 에러의 범주(errorCategory, retryability 등)에 대한 **구조화된 메타데이터(Structured Metadata)**가 없으면 에이전트는 합리적인 재시도 전략을 결정할 수 없어 불필요한 반복 재시도를 수행하게 됩니다.

**문제 상황 분석:**
- 503 Service Unavailable 오류(배포 중 일시 장애)가 발생했으나, 도구는 구체적 메타데이터 없이 단순 "Operation failed." 텍스트와 `isError: true`만 반환함.
- 에이전트는 원인 파악 및 일시적 오류 여부, 재시도 가능 여부를 판단할 구조화된 정보가 없음.
- 그 결과 판단 근거 부족으로 포기할 때까지 동일한 무의미한 재시도를 5회 연속 반복하여 자원을 낭비함.

**A번이 정답인 이유:**
반환된 결과에 에러가 일시적(transient)인지 재시도 불가능(non-retryable)한지를 구분해 주는 구조화된 메타데이터가 전혀 포함되어 있지 않기 때문에, 에이전트가 재시도 여부 및 전략을 판단할 근거가 부족하여 무의미한 재시도를 반복한 것이 가장 직접적인 원인입니다.

**오답 분석:**
- **Option B (오답)**: 다운스트림 HTTP 코드 수신 여부보다, MCP 도구가 클라이언트/에이전트에 래핑하여 전달한 응답 결과의 메타데이터 부재가 원인입니다. MCP 클라이언트의 파싱 오류나 기본 재시도 동작 문제가 아닙니다.
- **Option C (오답)**: "Operation failed."라는 단문 에러 텍스트 하나로 컨텍스트 윈도우가 가득 차서 이전 실패 기록을 기억하지 못했다는 주장은 현실적이지 않습니다.
- **Option D (오답)**: 오류가 발생했을 때 `isError`를 `true`로 설정하는 것은 정상입니다. `isError: true` 자체가 무제한 재시도를 의미하거나 일시적 오류 인식을 막는 것은 아닙니다.

---

### 43번 문제

**1. 문제 원문**

A data-pipeline monitoring agent must always respond with a structured action (`acknowledge_alert`, `escalate_alert`, or `suppress_alert`) for every incoming alert, since downstream automation parses only tool calls and cannot handle free-text replies. Which `tool_choice` value directly guarantees the model will not return plain conversational text?

A) `{"type": "any"}`, since it requires the model to call one of the provided tools rather than reply in prose

B) Leaving `tool_choice` unset while adding a system prompt instruction to "always respond with a tool call"

C) `{"type": "auto"}`, since it is the default and applies whenever any tools are present in the request

D) `{"type": "none"}`, since it disables prose generation and forces structured output by default

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: `{"type": "any"}`, since it requires the model to call one of the provided tools rather than reply in prose

**정답 및 해설:**

**핵심 개념**: 
Anthropic Claude API에서 `tool_choice` 파라미터 옵션 중 `{"type": "any"}`는 모델이 일반 대화형 텍스트(prose)만으로 응답하는 것을 금지하고, 제공된 도구 목록 중 **최소 하나 이상의 도구를 반드시 호출하도록 결정론적으로 강제**하는 설정입니다.

**문제 상황 분석:**
- 하위 자동화 파이프라인 시스템은 모델의 도구 호출(Tool call) 데이터만 파싱할 수 있고, 일반 대화 텍스트는 처리하지 못함.
- 모델이 일반 텍스트 응답을 출력하는 상황을 100% 방지하고, 세 가지 도구 중 하나를 반드시 실행하도록 강제해야 함.
- 따라서 API 차원에서 도구 호출을 필수화하는 `tool_choice` 설정이 필요한 상황임.

**A번이 정답인 이유:**
`tool_choice`를 `{"type": "any"}`로 지정하면 모델은 일반 텍스트 형태의 응답을 출력할 수 없고, 정의된 도구들(`acknowledge_alert`, `escalate_alert`, `suppress_alert`) 중 하나를 반드시 선택하여 호출하도록 보장됩니다.

**오답 분석:**
- **Option B (오답)**: 시스템 프롬프트에 지시사항을 작성하는 것은 확률적 가이드라인일 뿐, 모델이 일반 텍스트 응답을 출력하지 않도록 API 수준에서 100% 보장해주지 못합니다.
- **Option C (오답)**: `{"type": "auto"}`는 기본 설정값으로, 모델이 자율적으로 도구 호출 여부나 일반 텍스트 응답 여부를 선택하므로 대화 텍스트 응답을 차단하지 못합니다.
- **Option D (오답)**: `{"type": "none"}`은 도구 호출을 **완전히 금지**하고 오직 일반 대화 텍스트만 생성하도록 만드는 설정이므로 요구사항에 직접적으로 반대됩니다.

---

### 44번 문제

**1. 문제 원문**

A connected MCP server named `docs` exposes a resource for the authentication guide. A developer wants to have Claude directly analyze that specific document as part of their prompt, the same way they would reference a local file. What is the correct way to do this?

A) Add a `resources` field naming the document inside `.mcp.json` so it loads automatically into context at the start of every session

B) Call the server's `list_resources` tool manually first, then paste the raw JSON result from that call directly into the next prompt

C) Ask the agent in plain language to "open the docs server" and trust that it infers which specific resource is relevant without any reference syntax

D) Type an `@` mention in the prescribed form, such as `@docs:file://api/authentication`, to reference that exact resource inline in the prompt

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Type an `@` mention in the prescribed form, such as `@docs:file://api/authentication`, to reference that exact resource inline in the prompt

**정답 및 해설:**

**핵심 개념**: 
Claude Code 인터페이스 및 MCP(Model Context Protocol) 리소스 참조(Resource Mentions) 기능에서는 프롬프트 내에서 인라인으로 외부 MCP 서버의 리소스나 로컬 파일을 직접 지정하기 위해 `@` 멘션 구문을 사용합니다. MCP 리소스의 경우 `@<server_name>:<resource_uri>` 형태(예: `@docs:file://api/authentication`)로 작성하여 프롬프트 실행 시 해당 리소스의 데이터를 직접 컨텍스트에 포함시킬 수 있습니다.

**문제 상황 분석:**
- `docs`라는 MCP 서버가 인증 가이드 문서 리소스를 제공하고 있음.
- 개발자는 로컬 파일(`@filename`)을 참조할 때와 마찬가지로, 특정 MCP 리소스를 프롬프트 작성 시 인라인으로 Claude에게 전달하여 직접 분석하게 만들고자 함.
- MCP 리소스를 명시적으로 타겟팅하여 프롬프트 맥락으로 가져올 수 있는 올바른 CLI/프롬프트 구문이 필요함.

**D번이 정답인 이유:**
Claude CLI/인터페이스에서는 `@` 구문(At-mention)을 사용하여 파일이나 MCP 리소스를 인라인 참조합니다. MCP 서버의 리소스는 `@server_name:resource_uri` 형태(예: `@docs:file://api/authentication`)로 프롬프트에 직접 작성함으로써 해당 문서의 내용이 직접 프롬프트 맥락으로 로드되어 분석되도록 처리할 수 있습니다.

**오답 분석:**
- **Option A (오답)**: `.mcp.json` 파일은 MCP 서버 연결 및 환경 설정용 구성 파일이며, 특정 리소스 문서를 상시 로드하기 위해 내부 필드 형태로 작성하는 구조가 아닙니다.
- **Option B (오답)**: `list_resources`를 수동 호출하여 출력된 RAW JSON 결과를 사용자가 직접 복사-붙여넣기하는 방식은 에이전트 프롬프트 참조 시스템을 제대로 활용하지 않는 수동적이며 비효율적인 방식입니다.
- **Option C (오답)**: 구체적인 참조 구문 없이 자연어로만 요구하면 모델이 수많은 리소스 중 사용자가 원하는 정확한 리소스를 단번에 식별하지 못하거나 엉뚱한 리소스를 가져올 수 있습니다.

---

### 45번 문제

**1. 문제 원문**

An MCP server exposes `get_user_profile` and `get_user_permissions` with identical one-line descriptions: "Returns user account information." Client agents integrating this server report frequent misrouting when asked for either a display name or an access level. As the MCP server author, what is the most effective fix?

A) Combine both endpoints into a single MCP resource instead of a tool, since resources are inherently immune to selection ambiguity.

B) Add authentication scopes to the MCP server configuration, since permission errors are the actual cause of the reported misrouting.

C) Instruct every client application connecting to the server to hardcode which tool to call for each intent, bypassing tool selection.

D) Update each tool's description to name the specific fields it returns, such as display name versus roles and access scopes.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Update each tool's description to name the specific fields it returns, such as display name versus roles and access scopes.

**정답 및 해설:**

**핵심 개념**: 
LLM 기반 에이전트는 도구의 **이름(Name)**과 **설명(Description)**을 바탕으로 사용자의 요청 의도에 적합한 도구를 판단하고 선택(Tool Routing)합니다. 두 도구의 설명이 완전히 동일하거나 모호할 경우, 모델은 두 도구 간의 기능적 차이를 구별할 수 없어 오호출(Misrouting)을 일으킵니다. 이를 해결하기 위해서는 각 도구가 구체적으로 어떤 반환값/필드를 제공하는지 설명을 명확하고 구체적으로 갱신해야 합니다.

**문제 상황 분석:**
- `get_user_profile`과 `get_user_permissions` 두 도구 모두 설명이 "Returns user account information."으로 완전히 동일함.
- 사용자가 표시 이름(Display name)이나 접근 권한 수준(Access level)을 요청할 때 에이전트가 어떤 도구를 호출해야 할지 구분하지 못함.
- 동일하고 모호한 도구 설명으로 인해 도구 선택 과정에서 라우팅 오류가 지속적으로 발생함.

**D번이 정답인 이유:**
각 도구의 설명(Description)에 '표시 이름'을 반환하는지, 아니면 '역할 및 접근 권한 스코프'를 반환하는지와 같이 구체적인 데이터 필드와 역할을 명시적으로 기술하면 모델이 프롬프트를 해석할 때 모호성 없이 올바른 도구를 정확히 라우팅하여 호출할 수 있습니다.

**오답 분석:**
- **Option A (오답)**: 도구(Tool)를 리소스(Resource)로 변경한다고 해서 모호성이 자동으로 해결되지 않으며, 서버 동작 방식을 잘못 변경하는 해결책입니다.
- **Option B (오답)**: 라우팅 오류의 원인은 인증/권한 부족 문제가 아니라 동일한 도구 설명으로 인한 LLM의 판별 불능입니다.
- **Option C (오답)**: 모든 클라이언트 코드에서 도구 호출을 하드코딩하라고 요구하는 것은 LLM의 동적 도구 선택 기능 및 에이전트 아키텍처를 무력화하는 잘못된 설계 방식입니다.

---

# 46번 문제

**1. 문제 원문**

A `deploy_service` MCP tool requires an API token scoped to the `deploy` role. An agent calls it using a token scoped only to `read`. The server returns `isError: true` with generic text "Operation failed." Under a structured error design, how should this failure be categorized and handled differently from a network timeout on the same tool?

A) As `errorCategory: "business"` with `isRetryable: false`, since restricting deploy access is functionally the same kind of policy rule as a refund window

B) As `errorCategory: "permission"` with `isRetryable: false`, since resubmitting with the same token will fail identically until the caller's scope changes

C) As `errorCategory: "transient"` with `isRetryable: true`, since both permission failures and timeouts stem from the deploy service being temporarily unreachable

D) As `errorCategory: "validation"` with `isRetryable: true`, since the token itself is a malformed input field that a retry with backoff can resolve

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: As `errorCategory: "permission"` with `isRetryable: false`, since resubmitting with the same token will fail identically until the caller's scope changes

**정답 및 해설:**

**핵심 개념**: 에러의 구조화(Structured Error Design) 및 재시도 가능 여부(Retryability)
시스템 및 API 설계에서 에러는 실패 원인에 따라 카테고리화됩니다. 권한 부족(Permission/Authorization) 실패는 클라이언트의 권한(Scope)이 변경되지 않는 한 동일한 요청을 반복해도 무조건 실패하므로 `isRetryable: false`로 설정해야 합니다. 반면 네트워크 타임아웃 등 일시적 문제(Transient Error)는 재시도(`isRetryable: true`)가 가능합니다.

**문제 상황 분석:**
- `deploy_service` 도구는 `deploy` 권한(scope)을 가진 API 토큰이 필요함
- 에이전트는 `read` 권한만 가진 토큰으로 요청하여 서버에서 실패를 반환받음
- 권한 범위가 부족하여 발생한 실패를 네트워크 타임아웃과 구분하여 적절히 분류 및 처리해야 함

**B번이 정답인 이유:**
요청 실패의 근본 원인은 토큰의 권한 부족(`read` vs `deploy`)입니다. 따라서 에러 범주는 `permission`이 맞습니다. 또한, 권한 범위(Scope)를 수정하지 않고 동일한 토큰으로 요청을 다시 보낸다고 해서 성공할 가능성은 0%이므로, 재시도가 불가능함(`isRetryable: false`)을 명시하여 불필요한 네트워크 재요청을 방지해야 합니다.

**오답 분석:**
- **Option A (오답)**: 비즈니스 로직 정책(예: 환불 기간 초과)과 접근 권한(Authorization/IAM)은 명확히 다릅니다. 이 문제는 비즈니스 규칙이 아닌 IAM 권한 범주의 문제입니다.
- **Option C (오답)**: 권한 부족은 일시적 문제(`transient`)가 아니며, 서버가 접근 불가 상태인 것도 아닙니다. 똑같이 재시도한다고 해서 해결되지 않으므로 `isRetryable: true` 설정은 잘못되었습니다.
- **Option D (오답)**: 토큰의 형식이 깨진(malformed) 입력 검증 오류(`validation`)가 아니라 권한 부족 오류입니다. 또한 지연 후 재시도(backoff retry)로 해결될 수 있는 문제가 아닙니다.

---

# 47번 문제

**1. 문제 원문**

A tool intended only for retrieving publicly available stock prices is described as "Gets financial data." Occasionally, the model calls it hoping to retrieve a user's private account balance, which it cannot do. What description change best sets the correct boundary?

A) State explicitly that the tool returns public market data only and cannot access private account or user-specific information.

B) Add a `private` boolean parameter to the input schema without altering any of the existing description text.

C) Rename the tool to `get_financial_data_v2` so the model recognizes it as an updated, more capable version.

D) Remove all wording from the description and rely solely on the tool's name to communicate its scope to the model.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: State explicitly that the tool returns public market data only and cannot access private account or user-specific information.

**정답 및 해설:**

**핵심 개념**: 도구 설명 정의(Tool Description Design) 및 프롬프트 엔지니어링
LLM 기반 에이전트 도구(Tool/Function Calling)에서 도구의 `description`(설명)은 모델이 언제, 어떤 목적으로 도구를 호출해야 할지 결정하는 핵심 지침입니다. 범주가 너무 광범위하거나 모호하면 모델이 환각(Hallucination) 또는 오용을 일으키므로, 허용되는 기능과 불가능한 기능을 명확히(Negative Constraint) 지정해야 합니다.

**문제 상황 분석:**
- 기존 도구 설명("Gets financial data")이 너무 모호하고 광범위함
- 모델이 '개인 계좌 잔액 조회'도 이 도구로 가능할 것이라 오인하여 잘못 호출함
- 도구의 실제 기능 한계(공개 주가 정보만 가능, 개인 계좌 접근 불가)를 모델에게 명확히 전달할 명확한 설명 수정이 필요함

**A번이 정답인 이유:**
모델의 오용을 막는 가장 확실한 방법은 도구 설명란에 도구가 제공하는 정보의 범위(공개 시장 데이터 전용)와 불가능한 작업(개인 계좌 및 사용자 정보 접근 불가)을 명시적(Explicit)으로 서술하는 것입니다. 명확한 경계(Boundary) 설정은 모델의 환각 호출을 방지합니다.

**오답 분석:**
- **Option B (오답)**: 설명 텍스트를 수정하지 않고 입력 스키마에 `private` 매개변수만 추가하는 것은 모델의 오해를 해결해주지 못하며, 오히려 개인 데이터를 조회할 수 있다는 착각을 강화할 수 있습니다.
- **Option C (오답)**: 도구 이름을 버전업 형태(`v2`)로 바꾸는 것은 모델에게 '더 강력한 기능이 추가되었다'는 오해를 불러일으켜 개인 정보 조회를 더 자주 시도하게 만들 수 있습니다.
- **Option D (오답)**: 설명 문구를 모두 제거하고 이름에만 의존하는 것은 모델에게 제공되는 맥락을 완전히 없애는 것이므로 오호출 위험성을 극대화합니다.

---

# 48번 문제

**1. 문제 원문**

A developer wants Claude Code to update a deprecated log statement `logger.warn("legacy-path")` that appears twice in the same file, in two different functions, where only one of the two occurrences should change. Claude issues an Edit call with old_string set to exactly that log statement and the call fails. What is the correct next step?

A) Call Write with only the new log line as content, expecting Write to merge that single line into the correct spot in the existing file

B) Set replace_all to true on the same Edit call so both occurrences update identically, then manually revert whichever one should have stayed

C) Switch to Grep with the multiline flag to rewrite the matching line directly, since Grep can modify file contents once a match is found

D) Widen old_string to include enough surrounding context to uniquely identify the intended occurrence, then retry Edit with that string

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Widen old_string to include enough surrounding context to uniquely identify the intended occurrence, then retry Edit with that string

**정답 및 해설:**

**핵심 개념**: Claude Code의 Edit 도구 동작 원리 (Uniqueness & Context Matching)
Claude Code의 `Edit` 도구는 파일 내에서 교체하고자 하는 대상 문자열(`old_string`)이 **단 하나만 존재(Unique)**할 때 안전하게 치환을 수행합니다. 만약 동일한 문자열이 파일 내에 여러 번 등장하는데 어떤 것을 바꿀지 고유하게 식별되지 않으면, 오작동을 방지하기 위해 Edit 호출이 실패합니다.

**문제 상황 분석:**
- `logger.warn("legacy-path")` 구문이 동일 파일 내에 2번 존재함
- 두 위치 중 단 1곳만 변경해야 하는 상황임
- Claude가 정확히 해당 로그 구문만 `old_string`으로 전달하여 중복으로 인해 Edit 도구가 실패함

**D번이 정답인 이유:**
동일한 문자열이 여러 곳에 존재하여 구분이 불가능할 때는, 변경하고자 하는 위치 주변의 코드(함수 선언부, 이전/다음 줄의 코드 등)를 `old_string`에 함께 포함시켜(**Widen**) 파일 내에서 대상 문자열이 유일(Unique)하게 식별되도록 context를 확장한 뒤 Edit을 재시도해야 합니다.

**오답 분석:**
- **Option A (오답)**: `Write` 도구는 파일 전체를 덮어쓰는 도구입니다. 단일 줄만 전달한다고 해서 기존 파일의 특정 위치에 자동으로 병합(Merge)해주지 않으며 파일 전체가 손상될 수 있습니다.
- **Option B (오답)**: 문제가 의도한 바는 2개 중 1개만 변경하는 것인데, `replace_all: true`로 두 곳 모두 바꾼 뒤 수동으로 되돌리는 방식은 비효율적이고 비정상적인 우회 방법입니다.
- **Option C (오답)**: `Grep`은 파일 내용을 검색(Search)하기 위한 도구일 뿐, 파일의 내용을 직접 수정(Modify)할 수 있는 기능을 가지고 있지 않습니다.

---

# 49번 문제

**1. 문제 원문**

A legal-document analysis agent has a single `retrieve_clause` tool that can pull arbitrary text ranges from any uploaded file by byte offset, which the model frequently misuses to grab unrelated or malformed spans. The team wants to replace it with a constrained alternative that only ever returns whole, well-defined clauses. Which redesign best follows the pattern of replacing a generic tool with a constrained one?

A) Keep `retrieve_clause` unchanged and add a second agent whose only job is to double-check the byte ranges after retrieval

B) Keep `retrieve_clause` but double the number of example byte-offset calls in its description so the model learns better offsets

C) Replace `retrieve_clause` with a `get_clause_by_id` tool that only accepts a validated clause identifier from a pre-parsed clause index

D) Give the agent broader access by also adding a `raw_file_read` tool so it can cross-check offsets against the full document

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Replace `retrieve_clause` with a `get_clause_by_id` tool that only accepts a validated clause identifier from a pre-parsed clause index

**정답 및 해설:**

**핵심 개념**: 제약된 도구 인터페이스 설계 (Constrained Tool Design)
LLM 기반 에이전트 시스템에서 임의의 인자(예: 임의의 바이트 범위, 자유 형식 SQL 문 등)를 받는 범용적이고 유연한(Generic) 도구는 모델의 예측 불가능한 오용 및 환각을 유발하기 쉽습니다. 이를 미리 정의되고 검증된 구조(구조화된 식별자, 사전 처리된 인덱스)만 허용하는 제약된(Constrained) 도구로 교체하는 것은 에이전트의 신뢰성을 극대화하는 핵심 아키텍처 패턴입니다.

**문제 상황 분석:**
- 기존 `retrieve_clause` 도구는 바이트 오프셋 기반으로 임의의 텍스트 범위를 잘라오도록 되어 있어 generic함
- LLM이 오프셋 계산을 실수하여 무관하거나 자려진 텍스트 구간(malformed spans)을 가져오는 오용이 빈번함
- 이를 방지하기 위해 완전하고 검증된 조항(clause)만을 안전하게 가져올 수 있는 constrained 형태의 도구 재설계가 필요함

**C번이 정답인 이유:**
바이트 오프셋 지정과 같은 임의의 파라미터 입력을 제거하고, 문서 파싱 단계에서 미리 정제된 조항 인덱스(pre-parsed index)의 유효한 ID만을 입력받는 `get_clause_by_id` 도구로 교체하는 것이 가장 확실하고 구조적인 제약(Constraint)을 거는 방법입니다. 이를 통해 모델은 잘못된 오프셋 계산을 할 여지 자체가 차단됩니다.

**오답 분석:**
- **Option A (오답)**: 문제가 있는 범용 도구를 그대로 둔 채 교체 검증용 2차 에이전트를 추가하는 것은 시스템 복잡도와 토큰 비용만 증가시킬 뿐, 근본적인 도구 인터페이스의 결함을 해결하지 못합니다.
- **Option B (오답)**: 도구 설명란에 프롬프트 예시(Few-shot)만 늘리는 방식은 LLM의 바이트 오프셋 실수라는 근본적 한계를 완벽히 통제할 수 없으며, 제약된 도구로의 교체 패턴이 아닙니다.
- **Option D (오답)**: 원시 파일 읽기 도구(`raw_file_read`)를 추가하여 에이전트에게 더 넓은 권한을 주는 것은 문제의 의도인 '도구 제약(Constrained Tooling)'과 완전히 반대되는 접근입니다.

---

# 50번 문제

**1. 문제 원문**

An agent has both `translate_text` and `localize_content`, where the latter also adjusts currency, dates, and cultural references beyond direct translation. Both descriptions currently read "Converts text between languages." Which fix best restores reliable routing?

A) Revise `localize_content`'s description to mention currency and culture, and state `translate_text` does direct translation only.

B) Rename `translate_text` to `localize_content_v1` so the model treats it as a deprecated but still valid alternative.

C) Merge both tools into one and let the model pass a boolean localization flag, keeping the merged description as short as possible.

D) Remove `translate_text` from the toolset entirely so only `localize_content` remains for any language task at all.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Revise `localize_content`'s description to mention currency and culture, and state `translate_text` does direct translation only.

**정답 및 해설:**

**핵심 개념**: 도구 서묘(Tool Description) 차별화 및 명확한 도구 라우팅(Tool Routing)
LLM 에이전트가 여러 도구 중 적절한 도구를 선택(Routing)할 때 가장 중요한 기준은 각 도구의 `description`(설명)입니다. 서로 다른 역할을 수행하는 두 도구의 설명이 동일하다면, 모델은 어떤 도구를 호출해야 할지 구분하지 못해 혼란(Ambiguity)을 겪습니다. 각 도구의 고유 기능과 한계를 명시적으로 구분하여 작성해야 신뢰성 높은 라우팅이 가능해집니다.

**문제 상황 분석:**
- `translate_text`는 단순 직역 도구이고, `localize_content`는 통화·날짜·문화적 표현까지 변환하는 현지화 도구임
- 두 도구의 기능적 차이가 분명함에도, 설명문이 동일하게 "Converts text between languages."로 등록되어 있음
- 설명의 중복으로 인해 LLM이 요청 맥락에 맞는 적절한 도구를 라우팅하지 못하는 문제가 발생함

**A번이 정답인 이유:**
`localize_content` 설명에 통화 및 문화적 차이 조율 기능(Currency and Culture)을 명시하고, `translate_text` 설명에는 단순 직역 전용(Direct translation only)임을 명확히 서술함으로써 두 도구 간의 경계를 뚜렷하게 분리할 수 있습니다. 이를 통해 모델은 사용자 요청에 따라 정확한 도구를 라우팅하게 됩니다.

**오답 분석:**
- **Option B (오답)**: 이름을 `v1`로 변경하는 것은 도구의 구체적인 역할 차이를 설명해주지 못하며, 모델이 오래된 버전으로 오인하게 만들어 불필요한 혼란을 초래합니다.
- **Option C (오답)**: 도구를 통합하고 설명을 최대로 줄이는 것은 플래그 전달 실패나 설명 부족으로 인한 오작동 위험을 높이며, 라우팅을 명확히 개선하는 방법이 아닙니다.
- **Option D (오답)**: 단순 번역만 필요한 작업과 문화적 현지화가 필요한 작업은 처리 비용이나 목적이 다를 수 있는데, 단순 번역 도구를 무작정 삭제하는 것은 올바른 해결책이 아닙니다.

---

# 51번 문제

**1. 문제 원문**

A synthesis agent frequently needs to confirm a single numeric claim (e.g. a statistic cited in a source) before including it in a final answer, but it is not equipped to resolve deeper factual disputes between conflicting sources. Following the guidance on scoped cross-role tools for high-frequency needs, how should the team design this?

A) Give the synthesis agent no verification tools at all, and require every numeric claim to be manually checked by the coordinator before inclusion in the final answer, regardless of complexity.

B) Give the synthesis agent a narrow verify_fact tool for quick single-claim checks, and have it refer cases with conflicting sources to the coordinator for deeper resolution.

C) Give the synthesis agent the full research agent tool set, enabling it to independently verify any numeric claim and resolve source discrepancies without coordinator intervention.

D) Give the coordinator agent a verify_fact tool but not the synthesis agent, so that the synthesis agent must send every numeric claim to the coordinator for verification and wait for the result.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Give the synthesis agent a narrow verify_fact tool for quick single-claim checks, and have it refer cases with conflicting sources to the coordinator for deeper resolution.

**정답 및 해설:**

**핵심 개념**: 역할 분담 및 범위 제한 도구(Scoped Cross-Role Tools) 설계  
멀티 에이전트 아키텍처에서 특정 역할의 에이전트가 다른 역할의 기능 일부를 **자주(High-frequency)** 수행해야 하는 경우, 전체 도구 세트 권한을 부여하지 않고 **필요에 맞게 범위가 제한된(Scoped/Narrow) 도구**만 제공하는 것이 권장됩니다. 복잡하거나 충돌이 발생하는 깊은 조율 작업은 원래 담당 에이전트(Coordinator/Research Agent)에게 위임하도록 설계합니다.

**문제 상황 분석:**
- 종합 에이전트(Synthesis agent)는 출처의 단일 숫자 통계치를 확인하는 작업을 매우 자주(Frequently) 수행해야 함
- 그러나 종합 에이전트는 출처 간 충돌이나 복잡한 사실 관계 분쟁을 해결할 수 있는 기능 및 역량이 없음
- 빈번한 단일 검증 요구사항을 처리하면서도 에이전트의 역할 범위를 초과하지 않도록 도구를 디자인해야 함

**B번이 정답인 이유:**
종합 에이전트에 단순하고 빠른 단일 수치 확인만을 수행하는 제한된 `verify_fact` 도구만 부여하고, 출처 간 정보가 충돌하는 복잡한 케이스만 조정자(Coordinator)에게 에스컬레이션(Refer)하도록 설계하는 것이 '범위 제한 cross-role 도구'의 올바른 적용 원칙입니다.

**오답 분석:**
- **Option A (오답)**: 복잡성에 상관없이 단순 수치 확인까지 매번 조정자가 수동으로 검토하게 만드는 것은 병목 현상을 일으키며 자주 발생하는 요구사항(High-frequency)을 효율적으로 처리하지 못합니다.
- **Option C (오답)**: 전체 리서치 도구 세트(Full tool set)를 모두 주는 것은 단일 역할 원칙(Principle of Least Privilege/Scoped Tooling)에 위배되며, 에이전트의 복잡도를 불필요하게 높입니다.
- **Option D (오답)**: 단순 검증조차 종합 에이전트가 직접 수행하지 못하고 매번 조정자에게 보내야 하므로 불필요한 에이전트 간 통신 비용과 지연(Latency)이 발생합니다.

---

# 52번 문제

**1. 문제 원문**

Claude Code is asked to rename an environment variable from `API_TIMEOUT_MS` to `REQUEST_TIMEOUT_MS` everywhere it is referenced across a codebase of several hundred files, with each occurrence sitting in different surrounding code. Which approach best discovers the full scope of the change before applying it?

A) Run Grep with output mode content and a glob scope to list every file and line referencing API_TIMEOUT_MS, then review that list before editing

B) Run Bash to open every file in an interactive editor, since a variable rename of this kind must be reviewed visually rather than located programmatically

C) Run Write on the project's environment configuration file first, then rely on Claude to infer other affected files from that one change afterward

D) Run Glob with the pattern **/API_TIMEOUT_MS to locate files whose names contain the variable, then edit only those matching files

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Run Grep with output mode content and a glob scope to list every file and line referencing API_TIMEOUT_MS, then review that list before editing

**정답 및 해설:**

**핵심 개념**: 코드베이스 검색 및 탐색 도구(Grep vs Glob)의 역할 분담  
Claude Code 도구 생태계에서 `Grep`은 파일 **내부 텍스트 내용(Content)**을 패턴으로 검색할 때 사용하며, `Glob`은 **파일 경로/이름(Filename/Path)** 패턴으로 파일 목록을 찾을 때 사용합니다. 코드 전체에서 특정 변수명이 언급된 위치를 탐색할 때는 `Grep`을 사용하여 영향 범위를 사전에 파악하는 것이 표준적인 접근법입니다.

**문제 상황 분석:**
- 수백 개의 파일에 걸쳐 환경 변수 `API_TIMEOUT_MS`가 참조되고 있음
- 각 참조 지점의 주변 코드가 서로 다름
- 변경 작업(Edit)을 적용하기 전에 영향받는 전체 범위(파일 및 정확한 줄 위치)를 완벽히 파악해야 함

**A번이 정답인 이유:**
`Grep` 도구에 검색 대상 패턴(`API_TIMEOUT_MS`)과 출력 모드(`content`)를 지정하여 실행하면, 코드베이스 전체에서 해당 변수를 참조하는 모든 파일과 해당 줄(Line) 번호/내용을 수집할 수 있습니다. 이를 통해 변경을 적용하기 전 영향 범위를 명확히 검토(Review)할 수 있으므로 최선의 접근법입니다.

**오답 분석:**
- **Option B (오답)**: Bash로 대화형 에디터를 여는 것은 에이전트 환경에서 비효율적일 뿐만 아니라 자동화 및 정확한 검색 목적에 맞지 않습니다.
- **Option C (오답)**: 하나의 파일만 먼저 수정한 뒤 모델의 '추론'에만 의존해 나머지 파일을 찾는 방식은 수백 개 파일 중 일부 참조를 누락(Missing reference)시키는 치명적인 결과를 가져올 수 있습니다.
- **Option D (오답)**: `Glob`은 **파일 이름** 패턴을 일치시키는 도구입니다. 변수명이 파일 이름에 포함되어 있지 않고 파일 내용 속에 포함되어 있는 일반적인 상황에서는 `Glob`으로 참조 위치를 찾을 수 없습니다.

---

# 53번 문제

**1. 문제 원문**

A team is building an agent that uses manual extended thinking (`thinking: {"type": "enabled"}`) to reason before acting, and they want to force it to always call a tool rather than answer directly. They set `tool_choice` to `{"type": "any"}` while manual extended thinking is enabled, and the request fails. What is the correct explanation and recommended remedy?

A) The request failed because extended thinking disables all `tool_choice` options; to fix this, remove all tools from the request and let the model output its reasoning steps as text before acting.

B) The request failed because `{"type": "any"}` requires at least two tools to be defined; adding a second tool, such as a calculator, resolves the incompatibility with extended thinking.

C) The request failed because `{"type": "any"}` is deprecated; replace it with `{"type": "forced"}` and specify a tool name like `search` to satisfy the forced tool choice requirement.

D) When manual extended thinking is enabled, the `tool_choice` values `{"type": "any"}` and `{"type": "tool", ...}` are not supported; set it to `{"type": "auto"}` or `{"type": "none"}` instead. To force a tool call while still using thinking, migrate to adaptive thinking (supported on newer models), or disable manual extended thinking.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: When manual extended thinking is enabled, the `tool_choice` values `{"type": "any"}` and `{"type": "tool", ...}` are not supported; set it to `{"type": "auto"}` or `{"type": "none"}` instead. To force a tool call while still using thinking, migrate to adaptive thinking (supported on newer models), or disable manual extended thinking.

**정답 및 해설:**

**핵심 개념**: Anthropic Claude API의 Extended Thinking과 Tool Choice 제한사항  
Anthropic API에서 수동 확장 사고(Manual Extended Thinking, `thinking: {"type": "enabled"}`) 기능을 사용할 때, 도구 호출을 강제하는 `tool_choice: {"type": "any"}` 또는 특정 도구를 지정하는 `tool_choice: {"type": "tool", "name": "..."}` 옵션은 서로 비호환되어 API 레벨에서 에러를 반환합니다. 수동 사고 모드에서는 `auto` 또는 `none`만 지원됩니다.

**문제 상황 분석:**
- 개발팀이 사고 과정(Extended Thinking)을 거친 후 반드시 도구를 호출하도록 `tool_choice: {"type": "any"}` 설정
- 수동 확장 사고(`type: "enabled"`)가 활성화된 상태에서 도구 강제 제약조건(`any` / `tool`)을 함께 적용함
- 두 파라미터 간의 제약조건 충돌로 인해 API 요청 실패 발생

**D번이 정답인 이유:**
수동 확장 사고(Manual Extended Thinking)를 사용할 때 Anthropic API 사상 `tool_choice`는 `auto` 및 `none`만 허용됩니다. 따라서 강제 도구 호출(`any`, `tool`)을 적용하면 안 되며, 만약 사고 과정과 도구 강제 호출을 함께 사용해야 한다면 지원하는 적응형 사고(Adaptive Thinking) 모드로 전환하거나 수동 확장 사고 기능을 비활성화해야 합니다.

**오답 분석:**
- **Option A (오답)**: 확장 사고가 모든 `tool_choice` 옵션을 비활성화하는 것은 아닙니다. `auto` 및 `none` 설정은 정상 지원됩니다.
- **Option B (오답)**: `{"type": "any"}`는 단 1개의 도구만 정의되어 있어도 올바르게 동작하는 옵션이며, 도구 개수의 문제가 아닙니다.
- **Option C (오답)**: Anthropic API에서 `{"type": "any"}`는 정상적인 파라미터이며, `{"type": "forced"}`라는 값은 존재하지 않습니다.

---

# 54번 문제

**1. 문제 원문**

An agent working against a large issue tracker keeps issuing many exploratory search-tool calls just to figure out which issues exist before it can act on any of them. The team wants to cut down on this exploratory overhead. What MCP capability addresses this directly?

A) Add several more search-related tools to the server so the agent can use targeted queries to find relevant issues directly and avoid unnecessary exploratory searches.

B) Increase the tool-call timeout on the issue tracker server so that each search call retrieves more issues and the agent gets a complete view with fewer queries.

C) Switch the issue tracker server's transport from stdio to HTTP so that each query completes faster, and the agent can gather all necessary information with fewer calls.

D) Have the MCP server expose an issue-summary catalog as an MCP resource, so the agent can see available issues up front without needing any repeated searches.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Have the MCP server expose an issue-summary catalog as an MCP resource, so the agent can see available issues up front without needing any repeated searches.

**정답 및 해설:**

**핵심 개념**: MCP 리소스(Resource) vs 도구(Tool)
Model Context Protocol(MCP)에서 **Tool**은 상태를 변경하거나 동적인 탐색/연산을 수행하는 행동 기반 기능인 반면, **Resource**는 컨텍스트나 읽기 전용 데이터(문서, 목록, 상태 요약 등)를 모델에 사전에 제공하는 메커니즘입니다. 에이전트가 무슨 데이터가 있는지 파악하기 위해 반복적으로 검색 도구를 호출하는 오버헤드를 줄이려면, 해당 목록 데이터를 MCP 리소스로 노출하여 프롬프트 컨텍스트에 즉시 주입해 주는 것이 올바른 설계 패턴입니다.

**문제 상황 분석:**
- 에이전트가 어떤 이슈가 있는지 파악(전체 현황 확인)하기 위해 반복적으로 검색 도구(`search-tool`)를 실행함
- 반복적인 도구 호출로 인해 탐색 오버헤드(토큰 소모, 지연 시간)가 과도하게 발생함
- 검색 도구를 여러 번 실행하지 않고도 이용 가능한 전체 이슈 목록/요약을 사전에 파악할 수 있는 MCP 기본 역량이 필요함

**D번이 정답인 이유:**
MCP의 **Resource** 사상을 활용하여 이슈 요약 카탈로그를 리소스로 노출하면, 에이전트는 반복적인 검색 도구 호출 없이도 초기 컨텍스트 상에서 존재하는 이슈 목록을 즉시 파악(up front)할 수 있습니다. 이는 탐색적 도구 호출 오버헤드를 직접적으로 제거하는 가장 효과적인 방법입니다.

**오답 분석:**
- **Option A (오답)**: 검색 관련 도구를 더 추가하는 것은 여전히 도구 호출을 통한 탐색 방식에 의존하므로 탐색 오버헤드를 근본적으로 해결하지 못하며 오히려 모델의 도구 선택 혼란만 야기합니다.
- **Option B (오답)**: 타임아웃 시간을 늘리는 것은 단일 호출의 대기 시간을 늘릴 뿐, 에이전트가 사전에 전체 목록을 파악하여 탐색 호출 횟수를 줄이는 것과는 직접적인 관련이 없습니다.
- **Option C (오답)**: 전송 계층(Transport)을 stdio에서 HTTP로 바꾸는 것은 통신 방식의 차이일 뿐, 호출 단위의 응답 속도가 약간 빨라질 수는 있어도 반복적인 탐색 호출 구조 자체를 없애주지 못합니다.

---

# 55번 문제

**1. 문제 원문**

Claude needs to reorganize a file by moving several scattered `export` statements into one grouped block near the top. Which tool sequence should Claude use?

A) Issue one `Edit` call per export statement, each targeting a short unique snippet, relying on the accumulated edits to produce the new grouped layout.

B) Call `Glob` for the file's own path to confirm it exists, then call `Edit` with `old_string` set to the whole file's text and `new_string` as the new version.

C) Read the file to load its full contents, then call `Write` with the complete restructured file content back over that same path.

D) Call `Grep` with output mode `content` to retrieve the matching export lines, treating the returned text as already written back to the file.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Read the file to load its full contents, then call `Write` with the complete restructured file content back over that same path.

**정답 및 해설:**

**핵심 개념**: 파일 대규모 재구성을 위한 `Edit` vs `Write` 도구 선택 기준  
Claude Code 도구 세트에서 `Edit` 도구는 파일의 **일부 구간(부분 수정)**을 고유한 `old_string`을 기반으로 안전하게 치환할 때 적합합니다. 반면 파일 전체에 걸쳐 코드를 대대적으로 이동하거나 레이아웃을 완전히 재구성(Restructure/Reorganize)할 때는, 여러 번의 부분 수정보다 파일 전체 내용을 읽어온 후 **`Write` 도구로 전체 내용을 덮어쓰는 것**이 훨씬 안정적이고 오류를 최소화할 수 있습니다.

**문제 상황 분석:**
- 파일 전체에 여기저기 흩어져 있는 `export` 구문들을 파일 상단으로 모으는 대대적인 구조 변경 작업임
- 파일 전체의 여러 줄이 동시에 삭제 및 이동되는 광범위한 변화가 발생함
- 이 상황에서 가장 적절하고 효율적인 파일 수정 도구 사용 패턴을 찾아야 함

**C번이 정답인 이유:**
파일의 전체 구조를 재배치할 때 여러 개의 부분 `Edit`을 연쇄적으로 수행하면 코드 오프셋이 달라지거나 인접 코드가 꼬여 에러가 발생하기 쉽습니다. 따라서 먼저 파일 내용을 읽어온 뒤, 재구성된 전체 코드를 `Write` 도구를 통해 동일한 경로에 통째로 새로 작성(Overwriting)하는 방식이 모범 사례(Best Practice)입니다.

**오답 분석:**
- **Option A (오답)**: 흩어진 각 구문마다 `Edit`을 여러 번 연속으로 호출하면 중간 과정에서 고유 문자열 일치가 깨지거나 코드가 꼬일 위험이 매우 큽니다.
- **Option B (오답)**: 단일 파일의 존재 여부를 확인하기 위해 `Glob`을 호출하는 것은 불필요하며, `Edit`의 `old_string`에 파일 전체 텍스트를 넣는 것은 `Edit` 도구의 취지에도 맞지 않으며 `Write` 도구를 사용하는 것이 올바른 방법입니다.
- **Option D (오답)**: `Grep`은 단순 파일 내용 검색 도구일 뿐, 파일에 데이터를 다시 쓰거나(Write) 수정하는 기능이 전혀 없습니다.

---

# 56번 문제

**1. 문제 원문**

A tool named `analyze_content` was originally built to summarize any pasted content, including emails and internal notes, but its description was never updated after a web-specific successor tool was introduced. The model now sometimes calls the general tool for web-only tasks. What is the recommended remediation?

A) Leave both tools with their original names, but ask users to specify which tool they want by internal ID every time.

B) Delete the description text from both tools so the model relies entirely on tool names for disambiguation.

C) Increase the priority weight of the newer tool in the backend routing configuration without touching either tool's description.

D) Rename the general tool to reflect its remaining scope, and update its description to exclude the case the newer tool now handles.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Rename the general tool to reflect its remaining scope, and update its description to exclude the case the newer tool now handles.

**정답 및 해설:**

**핵심 개념**: 도구 설명 및 이름의 명확화(Tool Name & Description Disambiguation)
LLM 기반 에이전트 시스템에서 새로운 전용 도구(Dedicated/Successor Tool)가 추가되면 기존 범용 도구의 역할 범위가 축소되거나 명확해져야 합니다. 기존 도구의 이름과 설명(`description`)을 변경하지 않고 그대로 두면 모델이 기능이 중복되는 도구 사이에서 혼란을 느끼고 잘못된 도구를 호출(Bad Routing)하게 됩니다. 따라서 기존 도구의 이름과 설명을 최신 역할 범위에 맞게 업데이트(범위 제외 명시)해 주는 것이 명확한 도구 분격 및 해결책입니다.

**문제 상황 분석:**
- `analyze_content`라는 범용 도구가 웹 문서, 이메일, 메모 등 모든 텍스트 요약을 담당함
- 이후 '웹 전용' 요약 도구가 새롭게 도입되었으나, 기존 범용 도구의 설명이 업데이트되지 않음
- 모델이 웹 관련 작업이 들어왔을 때 신규 웹 전용 도구 대신 기존 범용 도구를 오호출하는 문제가 발생함

**D번이 정답인 이유:**
기존 범용 도구의 이름을 축소된 축에 맞게 변경하고, 설명(Description)에 "새로운 도구가 담당하는 웹 관련 작업은 제외함"을 명시적으로 작성(Negative Constraint)함으로써, 모델이 두 도구 간의 명확한 역할 경계를 구분하고 정확하게 라우팅할 수 있게 됩니다.

**오답 분석:**
- **Option A (오답)**: 시스템 내부 문제(도구 명세 모호성)를 해결하지 않고 매번 사용자에게 내부 ID를 지정하라고 요구하는 것은 UX 관점에서 잘못된 설계 방식입니다.
- **Option B (오답)**: 설명을 아예 삭제하면 모델이 도구의 역할과 인자 형태를 파악할 수 있는 유일한 맥락을 잃게 되어 오작동 위험이 크게 증가합니다.
- **Option C (오답)**: 도구 설명 및 이름을 명확히 수정하지 않고 백엔드 라우팅 가중치만 조절하는 것은 프롬프트/도구 정의 레벨에서의 모호성을 근본적으로 해결하지 못합니다.

---

# 57번 문제

**1. 문제 원문**

An architect asks Claude Code to count how many files in the `src/components` directory tree currently have no matching test file at all, as a first step in planning test coverage work. Assume that the project follows a consistent and reliable naming convention that pairs each component file with its corresponding test file (for example, `Button.tsx` is tested by `Button.test.tsx`). Which approach most directly answers this without unnecessary file reads?

A) Use Grep to search each component file's own contents for the word test, and count the files where that word never appears

B) Use Glob to list component files and test files separately by their naming pattern, then compare the two path lists for gaps

C) Use Read to open every file under src/components and manually inspect each one for an associated describe block before counting

D) Use Bash to run the full test suite and count how many components report zero assertions executed against them

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Use Glob to list component files and test files separately by their naming pattern, then compare the two path lists for gaps

**정답 및 해설:**

**핵심 개념**: 파일 탐색 도구(`Glob`)의 효율적 활용 및 불필요한 I/O 방지  
Claude Code의 `Glob` 도구는 파일의 내용(Content)을 읽지 않고, 파일 경로 및 이름(Filename/Path)의 패턴만을 빠르게 일치시켜 파일 목록을 수집합니다. 파일 명명 규칙(Naming Convention)이 명확히 정립되어 있는 환경에서 파일 존재 여부나 차이(Gap)를 파악할 때 `Glob`을 활용하면 불필요한 파일 읽기(Read/I/O)나 토큰 소모 없이 빠르게 결과를 도출할 수 있습니다.

**문제 상황 분석:**
- `src/components` 하위에 대응하는 테스트 파일이 없는 컴포넌트 파일의 수량을 파악해야 함
- 프로젝트는 `[Name].tsx`와 `[Name].test.tsx`라는 일관되고 신뢰할 수 있는 명명 규칙을 따르고 있음
- 조건으로 "불필요한 파일 읽기 없이(without unnecessary file reads)" 가장 직접적으로 답할 수 있는 방식을 요구함

**B번이 정답인 이유:**
명명 규칙이 정해져 있으므로, `Glob`을 사용하여 컴포넌트 파일 목록(`*.tsx`)과 테스트 파일 목록(`*.test.tsx`)을 파일 이름을 기준으로 각각 추출한 뒤 두 경로 목록을 비교하기만 하면 됩니다. 이 방식은 파일 내부 콘텐츠를 전혀 읽을 필요가 없어 I/O 오버헤드와 토큰 소비를 최소화하면서 문제를 해결할 수 있습니다.

**오답 분석:**
- **Option A (오답)**: `Grep`은 파일 '내부 콘텐츠'를 검색하는 도구입니다. 컴포넌트 파일 내용 안에 'test'라는 단어가 포함되어 있는지 여부와 테스트 파일 존재 여부는 관련이 없으며, 불필요하게 파일 내용을 읽게 됩니다.
- **Option C (오답)**: `Read` 도구로 디렉토리 내 모든 파일을 하나씩 다 열어보는 것은 문제에서 제시한 "불필요한 파일 읽기를 하지 않는다"는 조건에 정면으로 위배되며 토큰 및 시간 낭비가 매우 심합니다.
- **Option D (오답)**: 전체 테스트 수트를 실행(`Bash`)하는 것은 파일 존재 유무만 확인하면 되는 단순한 작업에 비해 무겁고 느리며, 존재하지 않는 테스트 파일에 대한 어설션 실행 결과를 추적하는 것은 문제의 요구사항에서 벗어납니다.

---

# 58번 문제

**1. 문제 원문**

A module `dateUtils.ts` re-exports several functions under different names, such as `export { formatDate as fmt, parseDate as pd }`. Claude needs to find every caller of either the original or the re-exported names before it can safely rename the underlying `formatDate` function. Which approach correctly accounts for the re-exports?

A) Run Glob for `**/dateUtils*` to find files related to date utilities, then assume every caller also lives inside a file matching that same pattern

B) Read dateUtils.ts first to identify every exported name including aliases, then Grep for each exported name across the codebase

C) Run Bash to count how many times the word export appears in the repository, then read only the files where that count exceeds a fixed threshold

D) Run a single Grep search for the literal string formatDate, assuming any caller that uses the alias fmt will also match that same pattern

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Read dateUtils.ts first to identify every exported name including aliases, then Grep for each exported name across the codebase

**정답 및 해설:**

**핵심 개념**: 코드 리팩토링 시 심볼 파악 및 코드베이스 검색(`Read` -> `Grep`)  
함수 이름을 리팩토링/변경할 때, 해당 함수가 다른 이름(Alias/Re-export)으로 재정의되어 사용 중이라면 단일 원본 이름 검색만으로는 호출 지점(Caller)을 모두 찾아낼 수 없습니다. 따라서 모듈 파일을 먼저 읽어 별칭을 식별한 뒤, 식별된 모든 이름들에 대해 코드베이스 전체를 검색하는 단계별 접근 방식이 필수적입니다.

**문제 상황 분석:**
- `formatDate` 함수가 `dateUtils.ts` 내에서 `fmt`라는 별칭(alias)으로 re-export되어 있음
- 외부 코드에서는 `formatDate`뿐만 아니라 `fmt`라는 이름으로 해당 함수를 호출하고 있을 가능성이 있음
- 안전한 함수명 변경을 위해 모든 실제 호출 지점(Caller)을 누락 없이 파악해야 함

**B번이 정답인 이유:**
먼저 `Read` 도구로 `dateUtils.ts` 파일의 내용을 확인하여 `formatDate`가 `fmt`로 re-export되었음을 파악한 후, `formatDate`와 `fmt` 두 이름 모두에 대해 `Grep` 검색을 수행해야 코드베이스 전체에서 호출되는 모든 위치를 완벽하게 추적할 수 있습니다.

**오답 분석:**
- **Option A (오답)**: `Glob`은 파일 경로만 검색하므로 파일 내부에서 함수를 호출하는 지점을 찾을 수 없으며, 호출자가 반드시 동일한 파일명 패턴 내에만 존재한다는 가정은 잘못되었습니다.
- **Option C (오답)**: export 단어의 등장 횟수를 기준으로 임계값을 적용하는 방식은 호출 지점을 탐색하는 것과 전혀 무관한 잘못된 접근 방식입니다.
- **Option D (오답)**: `formatDate` 문자열만 단일 Grep으로 검색하면, 별칭인 `fmt`로 호출하고 있는 위치를 모두 놓치게(Miss) 되므로 리팩토링 시 런타임 에러가 발생할 수 있습니다.

---

# 59번 문제

**1. 문제 원문**

A classification subagent must always emit a structured label using one of its provided tools (e.g. `tag_urgent`, `tag_normal`, `tag_spam`) and must never return free-text commentary instead of a call, though which specific tag applies depends on the message content. Which tool_choice setting guarantees this behavior?

A) `tool_choice: {"type": "any"}`, which requires the model to call one of the provided tools without pinning it to a specific one

B) `tool_choice: {"type": "auto"}`, which lets the model decide whether calling a tag tool or replying in prose better fits the message

C) `tool_choice: {"type": "none"}`, which stops the model from calling any tag tool and relies on prompt wording instead

D) `tool_choice: {"type": "tool", "name": "tag_normal"}`, which forces the same tag every time regardless of message content

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: `tool_choice: {"type": "any"}`, which requires the model to call one of the provided tools without pinning it to a specific one

**정답 및 해설:**

**핵심 개념**: Anthropic Claude API의 `tool_choice` 제어 방식  
`tool_choice` 파라미터는 모델이 도구를 사용할 방식을 제어합니다. `type: "any"` 옵션은 모델이 자유 텍스트 응답을 출력하는 것을 금지하고, 정의된 도구들 중 **최소 하나 이상을 반드시 호출하도록 강제(Required Tool Calling)**합니다. 특정한 하나의 도구 이름만 지정하지 않기 때문에 모델이 내용에 맞는 도구를 자유롭게 선택할 수 있습니다.

**문제 상황 분석:**
- 에이전트는 일반 텍스트 응답 없이 반드시 도구를 사용하여 구조화된 레이블을 반환해야 함
- 상황/메시지 내용에 따라 호출할 도구(`tag_urgent`, `tag_normal`, `tag_spam`)가 달라짐
- 즉, '특정 도구 1개로의 고정'이 아닌 '제공된 도구 중 하나를 무조건 호출'하도록 설정해야 함

**A번이 정답인 이유:**
`{"type": "any"}` 설정은 모델이 일반 텍스트 형태의 답변을 출력하는 것을 차단하고 제공된 도구 목록 중 상황에 알맞은 도구 1개를 반드시 선택하여 호출하도록 강제하므로 요구사항을 정확히 만족시킵니다.

**오답 분석:**
- **Option B (오답)**: `{"type": "auto"}`는 도구를 호출할지, 일반 텍스트로 답변할지를 모델이 자율적으로 판단하므로 도구 호출을 항상 보장(Guarantee)하지 못합니다.
- **Option C (오답)**: `{"type": "none"}`은 모든 도구 호출을 금지하고 텍스트 응답만 생성하도록 만듭니다.
- **Option D (오답)**: `{"type": "tool", "name": "tag_normal"}`은 메시지 내용과 무관하게 오직 `tag_normal` 도구만 강제로 호출하도록 고정하므로 내용에 따라 알맞은 태그를 선택해야 하는 조건에 위배됩니다.

---

# 60번 문제

**1. 문제 원문**

A single generalist agent handling an entire content pipeline (research, outline, draft, edit, publish) has 20 tools and shows declining tool-selection accuracy as more tools were added over time. The architect proposes splitting it into five specialized subagents, each scoped to roughly 4 tools for its stage, coordinated by a lightweight orchestrator. What is the main reliability benefit of this redesign, based on the relationship between tool count and selection accuracy?

A) The orchestrator caches tool results across subagents, which eliminates the need for most subagents to make tool calls at all

B) Splitting into subagents reduces the total number of API calls made across the whole pipeline, which is the main source of the earlier selection errors

C) Each subagent now discriminates among a much smaller candidate set, which directly reduces the decision complexity that was degrading tool selection at 20 tools

D) Each subagent now runs on a smaller context window, which forces the model to think more carefully before selecting a tool

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Each subagent now discriminates among a much smaller candidate set, which directly reduces the decision complexity that was degrading tool selection at 20 tools

**정답 및 해설:**

**핵심 개념**: 도구 개수와 도구 선택 정확도(Tool-Selection Accuracy)의 관계  
LLM 기반 에이전트 시스템에서 단일 에이전트에 제공되는 도구의 개수(Tool Count)가 늘어날수록 모델이 평가해야 하는 스키마와 설명(Description)의 양이 많아져 **의사결정 복잡성(Decision Complexity)**이 급격히 증가합니다. 도구가 약 10~20개를 넘어가면 적절한 도구를 라우팅하고 정확한 인자를 추출하는 정확도가 눈에 띄게 저하됩니다. 이를 단계별 서브에이전트로 나누어 각 에이전트가 처리하는 도구 후보군을 소수로 제한(Scoping)하는 것이 시스템 신뢰성을 높이는 핵심 아키텍처 패턴입니다.

**문제 상황 분석:**
- 1개의 범용 에이전트가 20개의 도구를 가지면서 도구 선택 정확도가 저하되는 문제 발생
- 파라미터/도구 스키마의 수와 모호성 증가로 인해 모델의 도구 라우팅 오작동 증가
- 해결책으로 5개의 전용 서브에이전트에 각각 약 4개의 도구만 할당하도록 멀티 에이전트 아키텍처로 변경함

**C번이 정답인 이유:**
단일 에이전트가 고려해야 하는 도구가 20개에서 각 서브에이전트당 4개로 대폭 줄어듦에 따라, 모델이 도구를 비교·선택할 때 거쳐야 하는 후보군 집합(Candidate Set)의 크기가 크게 감소합니다. 이는 의사결정 복잡성을 직접적으로 낮춰주어 도구 선택 정확도와 신뢰성을 획기적으로 개선합니다.

**오답 분석:**
- **Option A (오답)**: 오케스트레이터의 결과 캐싱은 응답 속도 향상이나 비용 절감 요소일 수 있으나, 도구 선택 정확도 저하 문제를 다루는 핵심 신뢰성 이점이 아니며 도구 호출 자체를 없애주지도 않습니다.
- **Option B (오답)**: 에이전트를 여러 개로 분할하고 오케스트레이션을 거치면 오케스트레이터 및 서브에이전트 간의 통신이 추가되어 총 API 호출 수가 오히려 증가하거나 유지됩니다. API 호출 횟수 자체가 도구 선택 오류의 원인이 아닙니다.
- **Option D (오답)**: 컨텍스트 윈도우 크기가 작아진다고 해서 모델이 더 신중하게 생각(Think carefully)하도록 강제되는 것은 아니며, 본 문제의 핵심 원인은 컨텍스트 크기가 아닌 도구 후보군의 복잡성입니다.

---

# 61번 문제

**1. 문제 원문**

A newly onboarded architect asks Claude Code to trace how a login request flows from the HTTP route handler through to the database call, in a codebase Claude has not explored yet. To build this understanding efficiently while keeping context usage low, what is the best incremental strategy?

A) Start by reading CLAUDE.md or AGENTS.md if they exist to gain high-level architecture context, then use Grep to locate the route handler and its imports, and read files incrementally along the call chain.

B) Use Bash to run a full-text word count across the repository and read the files with the highest counts, on the assumption larger files hold core business logic.

C) Use Read to open every file under the src directory up front, building a complete mental model of the whole codebase before looking for the login flow specifically.

D) Use Glob to list every file in the repository sorted by modification time, then read the twenty most recently modified files on the assumption they relate to login.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Start by reading CLAUDE.md or AGENTS.md if they exist to gain high-level architecture context, then use Grep to locate the route handler and its imports, and read files incrementally along the call chain.

**정답 및 해설:**

**핵심 개념**: 컨텍스트 윈도우 효율적 코드 탐색(Context Window Efficient Exploration)

**문제 상황 분석:**
- 새로운 아키텍트가 아직 Claude가 읽어보지 않은 프로젝트에서 로그인 흐름 추적을 요청함.
- 목적은 코드베이스를 효율적으로 이해하면서 토큰 사용량을 최소한으로 유지하는 것임.
- 무작위 파일 열람이나 전체 파일 일괄 로딩을 피하고 필요한 경로만 점진적으로 파악해야 함.

**A번이 정답인 이유:**
- 프로젝트 설정 문서(`CLAUDE.md` 등)를 먼저 읽어 전체 아키텍처를 파악합니다.
- `Grep` 도구로 라우트 핸들러 위치를 검색한 뒤 호출 체인을 따라 필요한 파일만 순차적으로 읽어 토큰 소모를 방지합니다.

**오답 분석:**
- Option A 외 오답들(B, C, D)은 대용량 파일 가정, 전체 파일 일괄 오픈, 무작위 최근 수정 파일 열람 등으로 컨텍스트 낭비 및 비효율성을 초래하므로 오답입니다.

---

# 62번 문제

**1. 문제 원문**

A subagent handling document translation calls a `translate_text` tool that fails with a connection timeout on the first attempt. The subagent's local retry policy allows up to 2 automatic retries for transient errors before escalating. The second retry also times out. What should the subagent do next?

A) Silently return a fabricated translation to the coordinator, using a cached fallback response from a prior successful call to avoid workflow interruption, despite the translate_text tool timeouts.

B) Stop retrying and propagate the failure to the coordinator, noting the errorCategory, that timeouts persisted across the allowed local attempts, and what text remained untranslated.

C) Continue retrying indefinitely at the subagent level, logging each attempt and resetting the retry count, ensuring that transient errors like timeouts are never escalated to the coordinator.

D) Immediately reclassify the error as a permission failure and propagate it to the coordinator, including the permission flag and that repeated timeouts indicate an access-control issue, while aborting further retries.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Stop retrying and propagate the failure to the coordinator, noting the errorCategory, that timeouts persisted across the allowed local attempts, and what text remained untranslated.

**정답 및 해설:**

**핵심 개념**: 서브에이전트 오류 상격 및 재시도 제한(Subagent Error Escalation & Retry Limits)

**문제 상황 분석:**
- 첫 실패 후 2회의 로컬 자동 재시도를 수행함.
- 두 번째 재시도까지 모두 시간 초과되어 로컬 재시도 한도에 도달함.
- 추가적인 로컬 시도로 해결할 수 없는 지속적 오류 상태임.

**B번이 정답인 이유:**
- 재시도 한계를 초과했으므로 재시도를 중단하고 상위 코디네이터에게 실패를 전파해야 합니다.
- 코디네이터가 적절한 후속 조치를 취할 수 있도록 오류 카테고리, 지속된 타임아웃, 미번역 텍스트 등의 상세 정보를 함께 전달합니다.

**오답 분석:**
- Option A, C, D는 각각 조작된 데이터 반환, 무한 루프 야기, 잘못된 오류 재분류 등으로 시스템 결함을 초래하므로 오답입니다.

---

# 63번 문제

**1. 문제 원문**

A team is reviewing an MCP tool's error contract before launch. The current design returns `isError: true` with additional custom fields `errorCategory: "validation"` and `isRetryable: true` whenever the caller omits a required `customer_id` argument, on the reasoning that the agent might supply it correctly on a later attempt within the same conversation. What is the primary flaw in this retry guidance?

A) The `errorCategory` should be set to `'transient'` instead of `'validation'` because the error can be resolved later by the agent, implying a temporary condition.

B) The flaw is that `isRetryable` should be `false`. A missing required argument is a validation error, which means the request is malformed. Retrying the same request will not succeed; the agent must correct the input before retrying. Setting `isRetryable` to `true` misleads the agent into thinking the same request can be retried as-is.

C) The error contract includes fields that are not part of the MCP specification. MCP tool responses only define `isError` to indicate an error; there is no standard `errorCategory` or `isRetryable` field, so consumers may ignore these custom fields and miss the intended recovery guidance.

D) The `isError` field should be set to `false` because the tool can still return a result when the `customer_id` is missing, making the invocation technically successful.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: The flaw is that `isRetryable` should be `false`. A missing required argument is a validation error, which means the request is malformed. Retrying the same request will not succeed; the agent must correct the input before retrying. Setting `isRetryable` to `true` misleads the agent into thinking the same request can be retried as-is.

**정답 및 해설:**

**핵심 개념**: API 오류 계약 및 재시도 의미론(API Error Contract & Retry Semantics)

**문제 상황 분석:**
- 필수 인자 누락으로 인한 유효성 오류(`validation`)가 발생함.
- 에이전트가 나중에 값을 채울 수 있다는 이유로 `isRetryable: true`로 설정함.
- 인자 수정 없이 동일한 요청을 그대로 재시도하게 만드는 모순이 발생함.

**B번이 정답인 이유:**
- 필수 인자 누락은 잘못된 형식의 요청이므로 동일한 요청을 그대로 재시도해도 성공하지 않습니다.
- 따라서 `isRetryable`은 `false`여야 하며, 에이전트가 입력을 수정하여 재요청하도록 유도해야 합니다.

**오답 분석:**
- Option A, C, D는 오류 카테고리를 임의로 바꾸거나 규정 해석을 오인한 설명이므로 오답입니다.

---

# 64번 문제

**1. 문제 원문**

A shared `.mcp.json` points a stdio server's `args` at `${API_REGION:-us-east-1}`. On a machine where the `API_REGION` environment variable is unset, what value does Claude Code pass to the server?

A) An empty string, because Claude Code always expands an unset variable to blank rather than substituting the trailing default text

B) The literal string `us-east-1`, because the `${VAR:-default}` syntax falls back to the default when the variable is not set

C) A parse failure, because Claude Code requires every referenced environment variable to be set even when a default is supplied

D) The literal text `${API_REGION:-us-east-1}`, because default-value expansion only applies inside the `env` block and not in `args`

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: The literal string `us-east-1`, because the `${VAR:-default}` syntax falls back to the default when the variable is not set

**정답 및 해설:**

**핵심 개념**: 환경 변수 치환 및 기본값 설정(Environment Variable Substitution & Default Values)

**문제 상황 분석:**
- 설정 파일 내 인자에 `${API_REGION:-us-east-1}` 구문이 지정됨.
- 시스템 환경에 `API_REGION` 변수가 설정되어 있지 않은 상태임.
- 기본값 대체 구문 평가 결과가 어떻게 반영되는지 확인해야 함.

**B번이 정답인 이유:**
- `${VAR:-default}` 문법은 환경 변수가 없을 때 지정된 기본값(`us-east-1`)으로 대체되도록 동작합니다.
- 따라서 변수가 미설정된 머신에서도 기본값 문자열이 정상 전달됩니다.

**오답 분석:**
- Option A, C, D는 기본값 대체 기능을 무시하거나 잘못된 제한을 가정하므로 오답입니다.

---

# 65번 문제

**1. 문제 원문**

A coordinator agent delegates a three-step data migration to a subagent: extract, transform, and load, but the load step fails twice on a database connection reset, a known transient condition, before finally succeeding on the third attempt inside the subagent's own execution. What should the subagent report back to the coordinator?

A) An escalation asking the coordinator to obtain new database credentials, since two consecutive connection resets indicate the credentials have expired

B) An `isError: true` result describing both connection resets in detail, so the coordinator can decide independently whether the migration should be retried

C) A partial-results payload listing only the extract and transform steps as done, omitting the load step entirely since it initially failed twice

D) A success result summarizing the completed migration, since the transient failures were resolved locally and never needed to surface above the subagent

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: A success result summarizing the completed migration, since the transient failures were resolved locally and never needed to surface above the subagent

**정답 및 해설:**

**핵심 개념**: 로컬 일시적 오류 처리 및 서브에이전트 캡슐화(Local Transient Error Handling & Subagent Encapsulation)

**문제 상황 분석:**
- 적재 단계에서 DB 연결 리셋(일시적 오류)이 발생했으나 서브에이전트 자체 재시도로 성공함.
- 상위 코디네이터에게 전달할 최종 보고 방식을 결정해야 함.

**D번이 정답인 이유:**
- 내부의 일시적 오류가 로컬에서 이미 해결되었으므로 상위 계층에 실패를 전파할 필요가 없습니다.
- 마이그레이션이 최종 완료되었음을 알리는 성공 결과만 요약해 보고하는 것이 올바릅니다.

**오답 분석:**
- Option A, B, C는 불필요한 에스컬레이션, 오류 보고, 단계 누락 등을 유발하므로 오답입니다.

---

# 66번 문제

**1. 문제 원문**

A teammate manually edited a shared config file in a separate editor after Claude Code had already read it earlier in the session. Claude now attempts an Edit call against that file using a string it saw during its earlier read, and the call fails. What is the most likely reason, and the correct recovery step?

A) The `old_string` must have contained an unescaped regex metacharacter, so Claude should escape every character in `old_string` and retry the identical call

B) Edit failed because the file was read more than one tool call ago, so Claude should discard the file and recreate it from scratch using Write

C) The file changed on disk since Claude's earlier read, so the read-before-edit check fails; Claude should re-read it and retry Edit against updated text

D) Edit calls always fail on the second attempt within a session, so Claude should switch permanently to Bash-based text replacement for the rest of the session

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: The file changed on disk since Claude's earlier read, so the read-before-edit check fails; Claude should re-read it and retry Edit against updated text

**정답 및 해설:**

**핵심 개념**: 편집 전 읽기 검증 및 동시성 제어(Read-Before-Edit Verification & Concurrency Control)

**문제 상황 분석:**
- 동료가 수동으로 파일을 수정하여 디스크 상의 내용이 변경됨.
- Claude Code가 과거에 읽었던 낡은 문자열을 기준으로 수정(Edit)을 시도하여 검증에 실패함.

**C번이 정답인 이유:**
- 디스크 파일 변경으로 인해 편집 전 무결성 검사가 실패하므로, 파일을 다시 읽은 뒤 업데이트된 텍스트를 대상으로 수정 작업을 재시도해야 합니다.

**오답 분석:**
- Option A, B, D는 정규식 문제 가정, 불필요한 파일 재생성, 잘못된 세션 동작 가정 등을 담고 있어 오답입니다.

---

# 67번 문제

**1. 문제 원문**

An architect is rolling out a GitHub MCP server for the whole engineering team. Every teammate has their own GitHub personal access token, and the config must be checked into the repo without ever committing a real secret. How should the architect configure this?

A) Add the server with project scope in `.mcp.json`, and set the header to `Authorization: Bearer ${GITHUB_TOKEN}` so each teammate's environment supplies the value at connection

B) Add the server with local scope, then have every teammate individually edit their own copy of `.mcp.json` to insert their personal token in place of a placeholder

C) Add the server with project scope, then add `.mcp.json` to `.gitignore` so the checked-in repository never actually contains the shared server configuration file

D) Add the server with user scope in `~/.claude.json`, and paste each teammate's literal token value into the shared header field before committing that file to the repo

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Add the server with project scope in `.mcp.json`, and set the header to `Authorization: Bearer ${GITHUB_TOKEN}` so each teammate's environment supplies the value at connection

**정답 및 해설:**

**핵심 개념**: MCP 설정에서의 안전한 환경 변수 치환(Secure Environment Variable Substitution in MCP Config)

**문제 상황 분석:**
- 팀 전체가 사용할 GitHub MCP 설정을 저장소에 커밋해야 함.
- 팀원 각자의 개별 토큰이 필요하며 시크릿을 절대 노출해서는 안 됨.

**A번이 정답인 이유:**
- `.mcp.json`에 프로젝트 범위로 설정하되 헤더 값에 환경 변수(`${GITHUB_TOKEN}`)를 사용합니다.
- 저장소에는 시크릿 대신 변수 참조만 커밋되고, 연결 시점에 각 팀원의 로컬 환경 값이 동적으로 주입됩니다.

**오답 분석:**
- Option B, C, D는 개별 수동 편집 강제, 설정 파일 무단 제외, 리터럴 시크릿 커밋 등의 결함이 있어 오답입니다.

---

# 68번 문제

**1. 문제 원문**

A platform team is designing error responses for a fleet of internal MCP tools. One engineer proposes that every tool failure, regardless of cause, return the same generic text "Operation failed" with `isError: true`, arguing this keeps the interface simple for tool authors. What is the strongest architectural objection to this proposal?

A) Returning a constant error string for every failure adds metadata overhead that pushes the total block size beyond the MCP protocol's maximum content length, so the server rejects the tool result as non-compliant.

B) A uniform generic message gives the agent no basis for choosing among retrying, adjusting input, or escalating, so it cannot make an appropriate recovery decision for each failure.

C) Uniform error text prevents the server from ever setting isError:true because the MCP specification requires a unique diagnostic string to accompany the flag for each failure, so the tool cannot activate the error state.

D) The MCP specification requires every isError:true result to include a machine-parseable stack trace, so a generic text response without that structured data violates the protocol and is rejected by the platform.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: A uniform generic message gives the agent no basis for choosing among retrying, adjusting input, or escalating, so it cannot make an appropriate recovery decision for each failure.

**정답 및 해설:**

**핵심 개념**: AI 에이전트 오류 복구 및 유익한 오류 피드백(AI Agent Error Recovery & Informative Error Feedback)

**문제 상황 분석:**
- 모든 도구 실패에 동일한 텍스트("Operation failed")를 반환하자고 제안함.
- 에이전트가 오류의 원인을 진단할 수 없는 구조적 문제점이 발생함.

**B번이 정답인 이유:**
- 동일한 메시지만 반환되면 에이전트는 재시도, 입력 수정, 에스컬레이션 중 어떤 복구 조치를 취해야 할지 판단할 수 없습니다.

**오답 분석:**
- Option A, C, D는 프로토콜 길이 제한이나 가상의 필수 스택 트레이스 규칙 등을 잘못 가정했으므로 오답입니다.

---

# 69번 문제

**1. 문제 원문**

An architect asks Claude Code to identify every React test file in a codebase where naming mixes `.test.tsx`, `.spec.tsx`, and older files simply ending in `Test.tsx`, spread across many nested feature directories. Only a list of matching file paths is needed, with no content inspection. Which tool is the most direct fit?

A) Read, pointed at the project root directory so it returns a recursive listing of every file that exists below it

B) Grep, using output mode files_with_matches and a regex that matches the word test anywhere inside a file's contents

C) Glob, using patterns such as `**/*.test.tsx`, `**/*.spec.tsx`, and `**/*Test.tsx` to match the naming conventions directly

D) Bash, using a recursive directory listing command and then manually reading every returned file to check its extension

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Glob, using patterns such as `**/*.test.tsx`, `**/*.spec.tsx`, and `**/*Test.tsx` to match the naming conventions directly

**정답 및 해설:**

**핵심 개념**: Glob을 통한 파일 패턴 매칭 및 검색(File Matching & Pattern Discovery via Glob)

**문제 상황 분석:**
- 다양한 명명 패턴을 가진 테스트 파일들이 분산되어 있음.
- 파일 내용 검사 없이 일치하는 파일 경로 리스트만 필요함.

**C번이 정답인 이유:**
- `Glob` 도구는 파일 경로 패턴(예: `**/*.test.tsx`)을 활용해 디렉토리 구조 전반에서 특정 확장자나 이름 규칙을 가진 파일들을 가장 정확하고 빠르게 찾아낼 수 있습니다.

**오답 분석:**
- Option A, B, D는 내용 읽기용 도구 사용, 콘텐츠 내부 검색 도구 사용, 수동 Bash 명령어 조합 등으로 비효율적이므로 오답입니다.

---

# 70번 문제

**1. 문제 원문**

An internal MCP server requires a Kerberos-derived token that must be freshly minted for every connection, and no OAuth authorization server is involved. According to Anthropic documentation, which approach is most accurate for handling this authentication scheme?

A) Configure a static `headers` entry with the token value hardcoded, then rotate the config file manually whenever the token expires.

B) Configure `headersHelper` to run a script that generates the token and writes the resulting header JSON to stdout on each connection.

C) Configure the `oauth` block with `authServerMetadataUrl` pointed at the internal Kerberos realm so Claude Code discovers the flow automatically.

D) Do not attempt to configure Kerberos directly in Claude Code MCP authentication; use an intermediary service that authenticates via Kerberos and then uses Anthropic-supported credentials such as API keys or OAuth tokens.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Configure `headersHelper` to run a script that generates the token and writes the resulting header JSON to stdout on each connection.

**정답 및 해설:**

**핵심 개념**: MCP 설정에서 `headersHelper`를 이용한 동적 헤더 생성(Dynamic Header Generation via `headersHelper` in MCP)

**문제 상황 분석:**
- 매 연결마다 새로 발급되어야 하는 Kerberos 파생 토큰이 필요함.
- OAuth 서버가 관여하지 않아 일반적인 OAuth 흐름 사용이 불가함.

**B번이 정답인 이유:**
- `headersHelper`는 연결 시마다 스크립트를 실행하여 동적으로 인증 헤더를 생성하고 stdout으로 전달하도록 공식 지원되는 메커니즘입니다.

**오답 분석:**
- Option A, C, D는 수동 교체, 부적절한 OAuth 블록 사용, 불필요한 중계 서비스 도입 등을 요구하므로 오답입니다.

---

# 71번 문제

**1. 문제 원문**

An architect is deciding how to scope a brand-new, still-unstable MCP server that only they should use, only within the one project they're actively prototyping in, without exposing it to teammates or to their other projects on the same machine. Which scope satisfies all of these constraints?

A) Project scope, since it stores the entry in .mcp.json and is intended to be shared with the whole team once committed

B) User scope, since it stores the entry in ~/.claude.json and makes it available across every project that individual works on

C) Local scope, since it stores the entry under that specific project's path in ~/.claude.json and stays private to the individual who added it

D) Enterprise scope, since managed configuration is the only mechanism that restricts a server to a single named project

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Local scope, since it stores the entry under that specific project's path in ~/.claude.json and stays private to the individual who added it

**정답 및 해설:**

**핵심 개념**: MCP 설정 범위(MCP Configuration Scopes: Project, User, Local)

**문제 상황 분석:**
- 아키텍트 본인만 사용해야 하며 팀원에게 노출되면 안 됨.
- 특정 프로토타이핑 프로젝트 내에서만 동작하고 타 프로젝트에 영향을 주지 않아야 함.

**C번이 정답인 이유:**
- 로컬 범위(Local scope)는 특정 프로젝트 경로와 연계해 사용자 전역 설정 파일(`~/.claude.json`)에 저장되므로 원격 저장소에 커밋되지 않습니다.
- 오직 해당 프로젝트를 작업하는 개인의 환경에서만 비공개로 유지되어 모든 제약 조건을 만족합니다.

**오답 분석:**
- Option A, B, D는 팀 공유용 프로젝트 범위, 전역 사용자 범위, 무관한 엔터프라이즈 범위 등을 설명하므로 오답입니다.

---

# 72번 문제

**1. 문제 원문**

A `run_report` MCP tool depends on a data warehouse that occasionally throttles requests with a 429 response. The tool author wants the agent to back off and retry automatically, but only up to a sensible limit, rather than retrying forever or giving up immediately. Which structured error response best supports this behavior?

A) `errorCategory: "permission"`, `isRetryable: false`, and a description stating the report requires elevated warehouse access to proceed

B) `errorCategory: "validation"`, `isRetryable: true`, and a description asking the agent to reduce the report's date range before resubmitting the identical query

C) No errorCategory or isRetryable field at all, relying on the phrase "try again later" in the text block to convey the retry semantics

D) `errorCategory: "transient"`, `isRetryable: true`, and a description noting the warehouse is rate-limiting requests, letting the agent apply its own bounded backoff strategy

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: `errorCategory: "transient"`, `isRetryable: true`, and a description noting the warehouse is rate-limiting requests, letting the agent apply its own bounded backoff strategy

**정답 및 해설:**

**핵심 개념**: MCP 도구의 일시적 오류 처리 및 속도 제한(Transient Error Handling and Rate Limiting in MCP Tools)

**문제 상황 분석:**
- 429(Too Many Requests) 응답으로 인해 속도 제한이 가끔 발생함.
- 에이전트가 무한 재시도 대신 합리적인 한도 내에서 지연(backoff)을 두고 자동 재시도해야 함.

**D번이 정답인 이유:**
- `errorCategory: "transient"`는 일시적 장애임을 나타내고, `isRetryable: true`는 재시도 가능함을 알려줍니다.
- 속도 제한 상황을 설명하여 에이전트가 자체적인 제한된 백오프 전략을 적용할 수 있게 지원합니다.

**오답 분석:**
- Option A, B, C는 권한 오류 설정, 검증 오류 설정, 구조화된 필드 누락 등으로 오답입니다.

---

# 73번 문제

**1. 문제 원문**

An architect wants Claude Code to find every place in a codebase that throws an error containing the phrase "insufficient permissions", including messages built by concatenating a string literal across two lines with a plus sign. A single-line search pattern is not catching the split-line cases. What should Claude do?

A) Re-run Glob with the recursive `**` pattern to search deeper into subdirectories where the missed messages might be hiding

B) Re-run Grep with output mode count instead of content, since count mode is described as searching more thoroughly than content mode

C) Switch to Read on every file in the repository so the full text of each file is visible instead of only matching lines

D) Re-run Grep with multiline mode enabled so the pattern can match text that spans across the line boundary

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Re-run Grep with multiline mode enabled so the pattern can match text that spans across the line boundary

**정답 및 해설:**

**핵심 개념**: 코드베이스에서의 멀티라인 Grep 검색(Multiline Grep Search in Codebases)

**문제 상황 분석:**
- 에러 메시지가 더하기 기호(+)로 두 줄에 걸쳐 분할(Split-line) 작성되어 있음.
- 일반 단일 라인 검색으로는 줄 바꿈으로 인해 끊어진 케이스를 감지하지 못함.

**D번이 정답인 이유:**
- `Grep` 도구의 멀티라인 모드를 활성화하면 줄 바꿈 경계를 넘어가는 패턴 검색이 가능해지므로 분할된 문자열도 정확히 탐색할 수 있습니다.

**오답 분석:**
- Option A, B, C는 파일 경로 검색용 Glob 사용, count 모드 오인, 전체 파일 Read로 인한 토큰 낭비 등을 유발하므로 오답입니다.

---

# 74번 문제

**1. 문제 원문**

A tool's description reads only "Get weather for a location." Users report the model sometimes garbles multi-word city names and invokes this tool when the user actually wants a historical climate report. What change would most directly reduce these failures?

A) Move all input validation into the tool's runtime error handler instead of describing constraints up front.

B) Shorten the description further so the model spends less time interpreting it before invoking the tool.

C) Expand the description to state the input format, include an example query, and note historical lookups are out of scope.

D) Change the tool's name to a random unique string so it no longer semantically collides with any other tool at all.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Expand the description to state the input format, include an example query, and note historical lookups are out of scope.

**정답 및 해설:**

**핵심 개념**: 도구 설명 최적화 및 명확화(Tool Description Optimization & Disambiguation)

**문제 상황 분석:**
- 설명이 너무 단순하여 멀티워드 도시 이름 인자를 왜곡하는 문제가 발생함.
- 역사적 기후 보고서 요청 시에도 이 실시간 날씨 도구가 잘못 호출되는 의미적 혼동이 생김.

**C번이 정답인 이유:**
- 입력 형식을 정의하고 예시 쿼리를 제공하면 인자 왜곡을 방지할 수 있습니다.
- 역사적 조회가 범위 외임을 명시함으로써 잘못된 도구 호출을 직접 차단할 수 있습니다.

**오답 분석:**
- Option A, B, D는 런타임으로 검증 미루기, 설명 단축, 무작위 이름 변경 등으로 문제를 악화시키므로 오답입니다.

---

# 75번 문제

**1. 문제 원문**

Two tools, `analyze_content` (summarizes pasted text) and `analyze_document` (summarizes uploaded documents), share nearly identical one-line descriptions. Users report the model frequently calls `analyze_document` for pasted web article text instead of `analyze_content`. What is the most effective fix?

A) Rewrite each description to state the expected input type and add a note on when the other tool applies.

B) Add a longer paragraph of promotional wording to `analyze_document` describing it as the more capable option.

C) Remove `analyze_content` entirely from the tool list so the model always falls back to `analyze_document` for every case.

D) Increase the model's sampling temperature so it selects a more varied set of tools during response generation.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Rewrite each description to state the expected input type and add a note on when the other tool applies.

**정답 및 해설:**

**핵심 개념**: 도구 설명 명확화 및 구별(Tool Description Disambiguation)

**문제 상황 분석:**
- 두 도구의 설명이 너무 유사해 모델이 명확히 구분하지 못함.
- 붙여넣은 텍스트를 입력했음에도 파일 업로드용 도구를 빈번하게 호출하는 오작동이 발생함.

**A번이 정답인 이유:**
- 각 도구 설명에 구체적인 입력 형태와 상호 배타적인 사용 조건을 명시함으로써 모델이 문맥에 맞는 올바른 도구를 정확히 선택하도록 유도할 수 있습니다.

**오답 분석:**
- Option B, C, D는 홍보 문구 추가, 필수 도구 삭제, 샘플링 온도 증가 등으로 오작동을 심화시키므로 오답입니다.

---

# 76번 문제

**1. 문제 원문**

An architect is scoping the tool integration work for a new project. The team needs to connect Claude Code to their Jira instance for standard issue read/write operations, and separately needs a way to trigger their in-house deployment pipeline, which has no public equivalent. How should the architect approach these two needs?

A) Skip MCP for both needs and instead give the agent direct Bash access to curl the Jira API and run the deployment scripts by hand

B) Build custom MCP servers for both Jira and the deployment pipeline, since only in-house servers can be trusted with production credentials

C) Adopt an existing community or vendor Jira MCP server for the standard integration, and reserve custom server work for the team-specific pipeline

D) Adopt a community MCP server for the deployment pipeline, since third-party servers already understand internal tooling, and build a custom one for Jira instead

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Adopt an existing community or vendor Jira MCP server for the standard integration, and reserve custom server work for the team-specific pipeline

**정답 및 해설:**

**핵심 개념**: Model Context Protocol(MCP)은 AI 모델이 외부 도구와 통신하게 해주는 개방형 표준 프로토콜로, 표준화된 서비스는 기존 오픈소스/벤더 제공 서버를 활용하고 사내 전용 시스템은 커스텀 서버로 확장하는 것이 효율적인 아키텍처 방식입니다.

**문제 상황 분석:**
- Claude Code를 Jira 및 사내 배포 파이프라인과 연동해야 함
- Jira는 대중적인 표준 이슈 읽기/쓰기 작업임
- 배포 파이프라인은 외부 공개 대안이 없는 사내 독자 시스템임

**C번이 정답인 이유:**
Jira와 같은 범용 서비스는 이미 제작된 커뮤니티/벤더 MCP 서버를 재사용하고, 독자적인 사내 배포 파이프라인에만 커스텀 MCP 서버 구축을 집중하는 것이 개발 효율성과 유지보수성 측면에서 가장 합리적인 접근법입니다.

**오답 분석:**

- Option A (오답): MCP를 쓰지 않고 직접 Bash와 curl을 사용하게 하는 것은 보안 및 자동화 관점에서 부적절합니다.
- Option B (오답): 이미 잘 만들어진 표준 Jira MCP 서버가 있음에도 불필요하게 처음부터 커스텀 서버를 만들 이유가 없습니다.
- Option D (오답): 외부 커뮤니티 서버는 사내 독자적인 배포 파이프라인을 알 수 없습니다.


# 77번 문제

**1. 문제 원문**

An architect is evaluating a customer-support triage agent whose only job is to read an incoming ticket and route it to billing, technical, or account-management queues. The agent currently has route_ticket, plus process_refund, reset_password, and close_account tools "in case they're needed later." Logs show the agent occasionally calls process_refund directly instead of routing the ticket to billing. What is the most appropriate fix?

A) Leave all four tools in place but add a system prompt line that forces refunds to go through billing first, so the triage agent only calls process_refund after routing.

B) Add a human approval step before process_refund executes so the triage agent can still invoke it but only after manual confirmation, preventing direct automated refunds.

C) Remove process_refund, reset_password, and close_account from the triage agent so it only has route_ticket, matching its single core routing function.

D) Rename process_refund to billing_queue_helper so the triage agent treats it as a routing alias rather than a direct action, avoiding unintended refund calls.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Remove process_refund, reset_password, and close_account from the triage agent so it only has route_ticket, matching its single core routing function.

**정답 및 해설:**

**핵심 개념**: AI 에이전트 설계 시 단일 책임 원칙(Single Responsibility Principle) 및 최소 권한 원칙을 적용하여, 역할에 불필요한 도구를 제공하지 않고 오직 필요한 최소한의 도구만 부여해야 오작동을 방지할 수 있습니다.

**문제 상황 분석:**
- 분류 에이전트의 유일한 역할은 들어오는 티켓을 적절한 큐로 라우팅하는 것임
- 혹시 몰라 추가해둔 환불/비밀번호 초기화 등의 실행 도구들로 인해, 에이전트가 직접 환불 함수를 호출하는 오작동 발생

**C번이 정답인 이유:**
에이전트 본연의 라우팅 업무 외의 실행 도구들을 제거하고 오직 `route_ticket` 도구만 남겨두는 것이 오작동을 차단하는 가장 확실하고 근본적인 설계적 해결책입니다.

**오답 분석:**

- Option A (오답): 프롬프트로 제어하려 해도 LLM의 우회 가능성이 남으며, 불필요한 도구를 계속 노출하는 원인이 해결되지 않습니다.
- Option B (오답): 승인 단계를 추가해도 라우팅 에이전트가 환불 도구를 호출하려고 시도하는 문제 자체가 사라지지 않습니다.
- Option D (오답): 도구 이름 변경은 임시방편일 뿐이며 에이전트에 혼란을 야기할 수 있습니다.


# 78번 문제

**1. 문제 원문**

A finance agent has generate_summary_report and generate_detailed_report, both described only as "Generates a report for the given account." An analyst asks for "a quick overview," and the model sometimes invokes the detailed variant instead. What long-term fix best prevents this pattern from recurring on new tools?

A) Establish a description template requiring tools to state output granularity, an example query, and how they differ from similar ones.

B) Rename both tools to have identical names distinguished only by a numeric version suffix, so a routing layer disambiguates them.

C) Cap the number of tools available to the agent at two, so the model always faces a simple binary choice between them.

D) Require the analyst to always type the exact internal tool name into every request instead of relying on the model to choose.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Establish a description template requiring tools to state output granularity, an example query, and how they differ from similar ones.

**정답 및 해설:**

**핵심 개념**: AI 에이전트의 도구 선택(Tool Selection) 정확도를 높이기 위해, 출력의 상세 수준, 사용 예시, 다른 도구와의 차이점을 포함하는 표준화된 도구 설명 템플릿 작성이 필수적입니다.

**문제 상황 분석:**
- 요약 보고서와 상세 보고서 도구의 설명이 동일하여 모호함
- 사용자가 간단한 개요를 요청했을 때 상세 보고서가 잘못 호출되는 현상 발생

**A번이 정답인 이유:**
도구 설명(Description)에 출력 상세도, 사용 예시, 타 도구와의 차이점을 명시하도록 템플릿화하는 것이 향후 추가될 새 도구들에 대해서도 문제 재발을 막는 근본적인 장기 해결책입니다.

**오답 분석:**

- Option B (오답): 동일 이름에 버전 번호만 붙이면 모델의 도구 구분 능력이 더 떨어집니다.
- Option C (오답): 사용 가능 도구를 2개로 제한하는 것은 실제 비즈니스 환경에서 확장성이 없는 제약입니다.
- Option D (오답): 사용자에게 내부 도구명을 직접 치게 하는 것은 자연어 처리 에이전트 도입 목적에 맞지 않습니다.


# 79번 문제

**1. 문제 원문**

A tool description reads "Updates a customer record with given fields." In practice, the model frequently passes fields that don't exist on the schema, and it's unclear whether partial updates are supported. What documentation gap explains this failure mode?

A) The description omits the expected input format and boundary behavior, such as which fields are valid and whether partial updates work.

B) The customer record tool was declared after read-only tools, causing the model to deprioritize it and pass fields not defined in the schema.

C) The tool's JSON schema uses camelCase field names, which conflicts with the model's snake_case training, causing invalid field passing.

D) The model cannot reliably handle optional parameters, so the documentation must require every field to be marked required, such as all fields being mandatory.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: The description omits the expected input format and boundary behavior, such as which fields are valid and whether partial updates work.

**정답 및 해설:**

**핵심 개념**: 도구 스키마 및 문서 정의 시 예상 입력 형식과 경계 조건(어떤 필드가 허용되는지, 부분 수정이 가능한지 등)을 명확히 문서화하지 않으면 LLM이 잘못된 인수를 생성하는 실패 모드가 발생합니다.

**문제 상황 분석:**
- 설명이 너무 간략해서 허용되는 필드 범위나 부분 업데이트 동작 여부를 알 수 없음
- 모델이 스키마에 없는 유효하지 않은 필드를 임의로 넘기는 현상 발생

**A번이 정답인 이유:**
문서에 허용 가능한 입력 필드 목록 및 부분 업데이트 가능 여부 등 '입력 형식 및 경계 동작'에 대한 명확한 기술이 누락된 것이 현상의 원인입니다.

**오답 분석:**

- Option B (오답): 도구 선언 순서는 스키마에 없는 필드를 생성하는 문제와 직접적인 상관이 없습니다.
- Option C (오답): 변수명 표기법(camelCase/snake_case) 문제로 존재하지 않는 필드를 지어내는 현상을 설명할 수 없습니다.
- Option D (오답): 모든 필드를 필수(required)로 강제하는 것은 부분 업데이트 기능을 원천 차단하므로 올바른 표준 접근법이 아닙니다.


# 80번 문제

**1. 문제 원문**

Two tools, create_ticket and escalate_ticket, both include the phrase "handles customer issues" in their descriptions. The model regularly calls create_ticket for cases that should instead be escalated. Which revision best resolves the ambiguity?

A) Combine both tools' functionality into create_ticket and pass an escalate flag, without changing any description text.

B) Add a short delay before escalate_ticket executes so the model has more time to reconsider which tool it selected.

C) Instruct the model, in the system prompt, to always call both tools together on every customer issue regardless of context.

D) Rewrite each description to state its specific trigger condition, and note explicitly when to use the other tool instead.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Rewrite each description to state its specific trigger condition, and note explicitly when to use the other tool instead.

**정답 및 해설:**

**핵심 개념**: 여러 도구가 유사한 설명을 가질 때 발생하는 모호성(Ambiguity)을 해결하기 위해, 각 도구 설명에 고유한 실행 트리거 조건과 타 도구 사용 시점을 명확히 기재해야 합니다.

**문제 상황 분석:**
- `create_ticket`과 `escalate_ticket` 설명에 중복되는 개괄적 문구가 포함됨
- 모델이 에스컬레이션 대상 건임에도 일반 티켓 생성 도구를 호출함

**D번이 정답인 이유:**
각 도구가 호출되어야 하는 구체적인 조건과, 다른 도구를 사용해야 하는 예외 조건을 설명에 명시하는 것이 모델의 잘못된 도구 선택을 예방하는 가장 정확한 해결책입니다.

**오답 분석:**

- Option A (오답): 설명을 수정하지 않고 플래그만 추가하면 모델은 플래그 설정 기준을 알 수 없습니다.
- Option B (오답): 실행 지연 시간 추가는 AI의 의사결정 모호성 개선과 아무 관련이 없습니다.
- Option C (오답): 모든 상황에서 두 도구를 동시 호출하게 하는 것은 자원 낭비이며 부작용을 낳습니다.


# 81번 문제

**1. 문제 원문**

A contributor clones a team repository that includes a checked-in .mcp.json defining a deploy-tools server. They open the project in Claude Code for the first time and run claude mcp list. What should they expect to see for deploy-tools before they take any further action?

A) It connects immediately and silently, because checking a server into .mcp.json is itself treated as implicit approval from every contributor who clones the repo

B) It is renamed automatically with a numeric suffix, because Claude Code assumes any newly cloned .mcp.json server name conflicts with an existing one

C) It fails to load at all, because project-scoped servers only activate for the teammate who originally added them via claude mcp add --scope project

D) It appears as pending approval, because project-scoped servers from .mcp.json require the contributor to explicitly approve them before Claude Code connects

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: It appears as pending approval, because project-scoped servers from .mcp.json require the contributor to explicitly approve them before Claude Code connects

**정답 및 해설:**

**핵심 개념**: Claude Code의 프로젝트 레벨 MCP 설정(`.mcp.json`)은 악성 스크립트의 자동 실행을 방지하기 위해, 저장소를 처음 클론한 사용자에게 명시적인 승인(Approval)을 요구하도록 보안 설계가 되어 있습니다.

**문제 상황 분석:**
- 저장소에 포함된 `.mcp.json`에 `deploy-tools` MCP 서버가 등록되어 있음
- 해당 프로젝트를 클론한 사용자가 Claude Code에서 최초로 상태를 확인하는 상황

**D번이 정답인 이유:**
외부에서 클론된 프로젝트 범위의 MCP 서버는 무단 실행으로 인한 보안 위협을 막기 위해 사용자가 승인하기 전까지 **pending approval(승인 대기)** 상태로 표시됩니다.

**오답 분석:**

- Option A (오답): 클론했다는 이유로 자동 승인되어 즉시 연결되는 것은 보안 정책상 금지됩니다.
- Option B (오답): 이름 충돌을 무조건 가정하여 자동으로 접미사를 붙여 변경하지 않습니다.
- Option C (오답): 최초 작성자 외 팀원도 사용할 수 있으며, 다만 사용 전 명시적 승인 단계가 필요할 뿐입니다.


# 82번 문제

**1. 문제 원문**

An internal MCP server requires a Kerberos-derived token that must be freshly minted for every connection, and no OAuth authorization server is involved. According to Anthropic documentation, which approach is most accurate for handling this authentication scheme?

A) Configure a static headers entry with the token value hardcoded, then rotate the config file manually whenever the token expires.

B) Configure the oauth block with authServerMetadataUrl pointed at the internal Kerberos realm so Claude Code discovers the flow automatically.

C) Configure headersHelper to run a script that generates the token and writes the resulting header JSON to stdout on each connection.

D) Do not attempt to configure Kerberos directly in Claude Code MCP authentication; use an intermediary service that authenticates via Kerberos and then uses Anthropic-supported credentials such as API keys or OAuth tokens.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Configure headersHelper to run a script that generates the token and writes the resulting header JSON to stdout on each connection.

**정답 및 해설:**

**핵심 개념**: 동적 동반 토큰/인증 헤더가 매 연결 시 새로 생성되어야 할 경우, Claude Code는 `headersHelper` 설정을 통해 외부 스크립트를 실행하고 그 결과를 `stdout`으로 받아와 헤더로 적용하는 방식을 지원합니다.

**문제 상황 분석:**
- 매 연결마다 새로 발급되어야 하는 Kerberos 기반 토큰
- 별도의 OAuth 서버가 없음

**C번이 정답인 이유:**
Anthropic 공식 가이드에 따라, 매번 동적으로 변하는 인증 헤더 생성을 위해 `headersHelper`에 스크립트를 지정하여 연결 시마다 최신 토큰 JSON을 `stdout`으로 출력받아 사용하는 것이 올바른 구성법입니다.

**오답 분석:**

- Option A (오답): 매 연결마다 새로 뽑아야 하므로 정적 파일 하드코딩 및 수동 교체는 불가능합니다.
- Option B (오답): OAuth 구조가 없으므로 oauth 블록을 적용할 수 없습니다.
- Option D (오답): 중개 서버 구축 없이 `headersHelper` 기능으로 직접 해결이 가능합니다.


# 83번 문제

**1. 문제 원문**

Claude Code needs to overwrite an existing configuration file, settings.local.json, with an updated version generated in response to the architect's request. Claude has not read this file at any point earlier in the current conversation. What must Claude do before the Write call will succeed?

A) Run Grep against the file to confirm its current contents, since Grep results satisfy the same prior-access requirement that Read would

B) Read the existing file first, since Write requires it to have been read in this conversation before overwriting an existing file

C) Delete the file first using Bash, since Write can only create files that do not already exist and cannot overwrite one directly

D) Nothing extra is required, since Write can overwrite any existing file at any time regardless of whether it has been read in the conversation

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Read the existing file first, since Write requires it to have been read in this conversation before overwriting an existing file

**정답 및 해설:**

**핵심 개념**: Claude Code의 안전장치(Safety Guardrail) 중 하나로, 기존 파일의 원본 유실이나 잘못된 수정 방지를 위해 파일 덮어쓰기(`Write`) 작업 전 대화 세션 내에서 해당 파일에 대한 사전 읽기(`Read`)를 강제합니다.

**문제 상황 분석:**
- 기존 파일 `settings.local.json`을 수정하여 덮어쓰려 함
- 대화 시작 후 해당 파일을 한 번도 읽지 않음

**B번이 정답인 이유:**
Claude Code 시스템은 존재 중인 파일 덮어쓰기 전에 선행 `Read` 호출을 필수 요구조건(Prior-access requirement)으로 지정하고 있으므로, 먼저 파일을 읽어야만 Write가 수행됩니다.

**오답 분석:**

- Option A (오답): Grep으로 내용을 확인하는 것은 정식 Read 호출 조건으로 인정되지 않습니다.
- Option C (오답): 파일 삭제 후 생성이 아니라 기존 파일 덮어쓰기 기능이 지원되며, 읽기 조건만 충족하면 됩니다.
- Option D (오답): 사전 읽기 없이 바로 덮어쓰는 것은 덮어쓰기 안전 정책에 위배됩니다.


# 84번 문제

**1. 문제 원문**

A single tool, analyze_document, extracts data points, produces summaries, and verifies claims against a source. Users report it inconsistently performs only one of these behaviors for ambiguous requests. Which redesign best addresses this?

A) Split the tool into extract_data_points, summarize_content, and verify_claim_against_source, each with a narrow contract.

B) Merge the tool with unrelated tools into one larger tool so the model faces fewer total choices overall.

C) Add a required mode enum parameter to the existing tool, but leave its single overarching description unchanged.

D) Keep the single tool but instruct the model, in the system prompt, to always call it three separate times per request.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Split the tool into extract_data_points, summarize_content, and verify_claim_against_source, each with a narrow contract.

**정답 및 해설:**

**핵심 개념**: 거대하고 다기능을 가진 모놀리식 도구(Monolithic Tool)는 AI에게 실행 혼란을 일으키므로, 명확하고 단일화된 기능 범위(Narrow contract)를 지닌 독립적 도구들로 분할 설계해야 합니다.

**문제 상황 분석:**
- `analyze_document` 도구가 추출, 요약, 검증 3가지 역할을 한꺼번에 맡음
- 모호한 사용자 요청 시 일부 기능만 무작위로 수행하는 문제 발생

**A번이 정답인 이유:**
세 가지 동작을 각각 별개의 전용 도구로 나누고 각 도구의 명세를 명확하게 제한함으로써, AI가 요청 목적에 맞게 필요한 도구만 정확히 선택하여 실행하도록 보장합니다.

**오답 분석:**

- Option B (오답): 더 큰 도구로 합치는 것은 모호성과 복잡도를 한층 더 높입니다.
- Option C (오답): mode 매개변수를 추가하더라도 통틀어 놓은 설명을 고치지 않으면 여전히 판단 혼란을 줍니다.
- Option D (오답): 요청마다 무조건 3번씩 호출을 강제하는 것은 심각한 자원 오남용 및 비효율을 초래합니다.


# 85번 문제

**1. 문제 원문**

Claude Code needs to find all Python files that define a class inheriting from BaseHandler, in a codebase where class definitions may span multiple lines when the base class list is long, such as class OrderHandler(\n BaseHandler, LoggingMixin\n):. A single-line Grep search for BaseHandler only catches some of these definitions. What is the most direct fix?

A) Run Grep scoped to Python files with the type parameter set to py, and enable multiline mode so wrapped class headers are matched

B) Run Glob with the pattern **/*.py to list every Python file, then read each file completely to visually check for BaseHandler

C) Run Grep with output mode files_with_matches only, on the assumption that this mode searches content more thoroughly than content mode does

D) Run Grep once per file using Bash to invoke it individually on each path, on the assumption that Grep cannot be scoped to one language repo-wide

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Run Grep scoped to Python files with the type parameter set to py, and enable multiline mode so wrapped class headers are matched

**정답 및 해설:**

**핵심 개념**: 정규식 및 코드 탐색 도구(Grep)에서 개행문자가 포함된 문맥(Multi-line) 검색을 수행할 때는 멀티라인 옵션(`multiline mode`)을 활성화하고 대상 확장자 범위(`type=py`)를 한정해야 검색 누락을 막을 수 있습니다.

**문제 상황 분석:**
- 상속 클래스 목록이 길어 개행(`\n`)되어 작성된 구문 존재
- 일반 단일 행 Grep 키워드 검색으로는 개행된 패턴 매칭 누락 발생

**A번이 정답인 이유:**
`type`을 `py`로 지정해 파이썬 대상 파일로 범위를 축소하고 `multiline mode`를 켜서 줄바꿈이 일어난 클래스 선언부까지 정확히 캡처하도록 설정하는 것이 해결책입니다.

**오답 분석:**

- Option B (오답): 모든 파이썬 파일을 전부 읽어서 일일이 확인하는 것은 매우 비효율적인 자원 소모 방식입니다.
- Option C (오답): `files_with_matches` 모드는 출력 형태(파일명만 출력)의 차이일 뿐 개행 매칭 문제를 해결하지 못합니다.
- Option D (오답): Grep은 언어별 범위 지정 및 전체 탐색을 지원하므로 파일별 개별 스크립트 호출은 잘못된 방법입니다.
