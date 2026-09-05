# 1번 문제

**1. 문제 원문**

A `submit_refund` MCP tool rejects a request because the customer's order is past the 30-day return window. The engineer designing the error response wants the agent to explain the rejection to the customer in plain language and never attempt this exact call again. Which response body best achieves this?

A) A text block plus structured content with `errorCategory: "permission"` and a description asking the customer to contact their account administrator.

B) A text block explaining the rejection, along with structured metadata including `errorCategory: "business"` to indicate a business rule violation and a description stating the order fell outside the 30-day return window.

C) A bare text block reading "Refund denied" with no structured metadata.

D) A text block plus structured content with `errorCategory: "transient"` and a description telling the agent to wait 30 seconds and resubmit.

---

**2. 구간별 직독직해 번역**

**QUESTION / SCENARIO:**

**A submit_refund MCP tool**
`submit_refund` MCP 도구가

**rejects a request**
요청을 거부합니다

**because the customer's order**
고객의 주문이

**is past the 30-day return window.**
30일 환불 가능 기간을 지났기 때문에.

**The engineer designing the error response**
오류 응답을 설계하는 엔지니어는

**wants the agent to explain**
에이전트가 설명하기를 원합니다

**the rejection to the customer**
고객에게 거절 사유를

**in plain language**
쉬운 언어로(명확한 일반 문장으로)

**and never attempt**
그리고 결코 시도하지 않기를

**this exact call again.**
이 동일한 호출을 다시.

**Which response body**
어떤 응답 본문이

**best achieves this?**
이를 가장 잘 달성합니까?

---

**OPTIONS:**

**A)**
**A text block**
텍스트 블록과

**plus structured content with**
다음이 포함된 구조화된 콘텐츠:

**errorCategory: "permission"**
오류 카테고리: "permission" 및

**and a description asking the customer**
고객에게 요청하는 설명

**to contact their account administrator.**
계정 관리자에게 연락하도록.

**B)**
**A text block explaining the rejection,**
거절 사유를 설명하는 텍스트 블록과,

**along with structured metadata including**
다음을 포함하는 구조화된 메타데이터:

**errorCategory: "business"**
비즈니스 규칙 위반을 나타내는

**to indicate a business rule violation**
오류 카테고리: "business" 및

**and a description stating**
다음 내용을 명시하는 설명:

**the order fell outside**
주문이 벗어났다는 것

**the 30-day return window.**
30일 환불 가능 기간을.

**C)**
**A bare text block reading "Refund denied"**
"Refund denied"라고만 적힌 단순 텍스트 블록

**with no structured metadata.**
구조화된 메타데이터 없이.

**D)**
**A text block**
텍스트 블록과

**plus structured content with**
다음이 포함된 구조화된 콘텐츠:

**errorCategory: "transient"**
오류 카테고리: "transient" 및

**and a description telling the agent**
에이전트에게 지시하는 설명

**to wait 30 seconds and resubmit.**
30초 동안 기다린 후 재전송하도록.

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
Option A (오답): `permission`은 권한 문제(액세스 거부)일 때 사용하며, 계정 관리자 연락 안내는 환불 기한 만료 문제와 부합하지 않습니다.
Option C (오답): 메타데이터가 없는 단순 텍스트("Refund denied")는 AI 에러 판단을 위한 정보가 부족하며, 원인 파악과 적절한 후속 조치를 어렵게 만듭니다.
Option D (오답): `transient` 카테고리는 일시적 오류(일시적 네트워크 오류 등)를 의미하므로, 에이전트가 30초 후 동일한 요청을 불필요하게 재시도하게 만듭니다.


---


# 2번 문제

**1. 문제 원문**

A coordinator dispatches the same document-indexing task to three subagents in parallel, each covering a different folder. Subagent 1 finishes cleanly. Subagent 2 hits a permission error on one file it cannot resolve locally and reports partial results plus that failure. Subagent 3's process crashes with no output at all. How should the coordinator's downstream handling differ between subagent 2 and subagent 3?

A) The coordinator should treat both subagent 2 and subagent 3 identically by discarding any partial results from subagent 2 and marking both folders for indexing as unprocessed, since neither subagent fully completed its assigned indexing task successfully.

B) The coordinator should treat both subagent 2 and subagent 3 identically by retrying files with permission errors, assuming subagent 3's crash was also due to a permission issue on some file, since that is the most common cause of non-completion in such tasks.

C) For subagent 2, the coordinator should ignore the reported permission error and mark the folder complete, since most files were indexed successfully, and for subagent 3, the coordinator should also mark its folder complete because no error was reported.

D) For subagent 2, the coordinator can use the partial results and address the specific reported permission gap; for subagent 3, lacking completed work or diagnostic detail, it must treat the entire folder as unprocessed.

---

**2. 구간별 직독직해 번역**

**QUESTION / SCENARIO:**

**A coordinator dispatches**  
코디네이터가 보냅니다  

**the same document-indexing task**  
동일한 문서 인덱싱 작업을  

**to three subagents in parallel,**  
세 개의 서브에이전트에게 병렬로,  

**each covering a different folder.**  
각각 서로 다른 폴더를 담당하면서.  

**Subagent 1 finishes cleanly.**  
서브에이전트 1은 정상적으로 완료합니다.  

**Subagent 2 hits a permission error**  
서브에이전트 2는 권한 오류에 도달합니다  

**on one file**  
한 파일에서  

**it cannot resolve locally**  
자체적으로 해결할 수 없는  

**and reports partial results**  
그리고 부분 결과와  

**plus that failure.**  
해당 실패 내용을 보고합니다.  

**Subagent 3's process crashes**  
서브에이전트 3의 프로세스는 충돌(다운)됩니다  

**with no output at all.**  
출력이 전혀 없는 상태로.  

**How should the coordinator's**  
코디네이터의  

**downstream handling differ**  
후속 처리가 어떻게 달라져야 합니까  

**between subagent 2 and subagent 3?**  
서브에이전트 2와 서브에이전트 3 사이에?  

---

**OPTIONS:**

**A)**  
**The coordinator should treat**  
코디네이터는 처리해야 합니다  

**both subagent 2 and subagent 3 identically**  
서브에이전트 2와 3 모두를 동일하게  

**by discarding any partial results**  
부분 결과를 모두 폐기함으로써  

**from subagent 2**  
서브에이전트 2로부터 나온  

**and marking both folders for indexing**  
그리고 인덱싱을 위한 두 폴더 모두를  

**as unprocessed,**  
미처리 상태로 표시함으로써,  

**since neither subagent fully completed**  
어느 서브에이전트도 완전히 완료하지 못했기 때문에  

**its assigned indexing task successfully.**  
할당된 인덱싱 작업을 성공적으로.  

**B)**  
**The coordinator should treat**  
코디네이터는 처리해야 합니다  

**both subagent 2 and subagent 3 identically**  
서브에이전트 2와 3 모두를 동일하게  

**by retrying files with permission errors,**  
권한 오류가 있는 파일들을 재시도함으로써,  

**assuming subagent 3's crash**  
서브에이전트 3의 충돌 역시  

**was also due to a permission issue**  
권한 문제 때문이었다고 가정하면서  

**on some file,**  
어떤 파일에서의,  

**since that is the most common cause**  
그것이 가장 흔한 원인이기 때문에  

**of non-completion in such tasks.**  
이러한 작업의 미완료에 대한.  

**C)**  
**For subagent 2,**  
서브에이전트 2의 경우,  

**the coordinator should ignore**  
코디네이터는 무시해야 합니다  

**the reported permission error**  
보고된 권한 오류를  

**and mark the folder complete,**  
그리고 해당 폴더를 완료됨으로 표시해야 합니다,  

**since most files were indexed successfully,**  
대부분의 파일이 성공적으로 인덱싱되었으므로,  

**and for subagent 3,**  
그리고 서브에이전트 3의 경우,  

**the coordinator should also mark**  
코디네이터는 역시 표시해야 합니다  

**its folder complete**  
해당 폴더를 완료됨으로  

**because no error was reported.**  
어떤 오류도 보고되지 않았기 때문에.  

**D)**  
**For subagent 2,**  
서브에이전트 2의 경우,  

**the coordinator can use the partial results**  
코디네이터는 부분 결과를 사용할 수 있고  

**and address the specific reported permission gap;**  
보고된 특정 권한 문제를 해결할 수 있습니다;  

**for subagent 3,**  
서브에이전트 3의 경우,  

**lacking completed work or diagnostic detail,**  
완료된 작업이나 진단 상세 정보가 부족하므로,  

**it must treat the entire folder as unprocessed.**  
전체 폴더를 미처리 상태로 취급해야 합니다.  

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
Option A (오답): 서브에이전트 2가 제공한 유효한 부분 결과와 진단 정보를 무시하고 모두 버리는 것은 자원 낭비이며 비효율적입니다.
Option B (오답): 진단 데이터가 전혀 없는 서브에이전트 3의 충돌 원인을 추측에 기반하여 "권한 문제"로 지레짐작하고 처리하는 것은 위험한 자율성 설계입니다.
Option C (오답): 일부 파일 인덱싱 실패 및 프로세스 충돌로 인한 미완료 상태를 무시하고 폴더 전체를 "완료됨"으로 표시하면 데이터 누락 및 시스템 오작동을 유발합니다.


---


# 3번 문제

**1. 문제 원문**

An architect asks Claude Code to standardize indentation across a 900-line generated file where nearly every line's leading whitespace is inconsistent, affecting the entire file rather than a few isolated lines. Claude has already read the file once earlier and no one else has modified it since. Which approach is most appropriate for applying this change?

A) Read the file again to confirm current content, then call `Write` with the entire re-indented file content in a single call

B) Call `Glob` to match the file's own path, then rely on `Glob` 's sort-by-modification-time behavior to normalize the file's whitespace

C) Issue one `Edit` call per line of the file, each with `old_string` set to that single line's current indentation and text

D) Call `Grep` with output mode `content` to retrieve every line of the file, since retrieving lines through `Grep` also rewrites them in place

---

**2. 구간별 직독직해 번역**

**QUESTION / SCENARIO:**

**An architect asks**
한 아키텍트가 요청합니다

**Claude Code to standardize**
Claude Code가 표준화하도록

**indentation across a 900-line generated file**
900줄짜리 생성된 파일 전반의 들여쓰기를

**where nearly every line's leading whitespace**
거의 모든 줄의 선두 공백이

**is inconsistent,**
일치하지 않고,

**affecting the entire file**
파일 전체에 영향을 미치는

**rather than a few isolated lines.**
몇몇 고립된 줄이 아니라.

**Claude has already read**
Claude는 이미 읽었습니다

**the file once earlier**
이전에 그 파일을 한 번

**and no one else**
그리고 다른 어느 누구도

**has modified it since.**
그 이후로 그것을 수정하지 않았습니다.

**Which approach**
어떤 접근 방식이

**is most appropriate**
가장 적절합니까

**for applying this change?**
이 변경 사항을 적용하는 데?

---

**OPTIONS:**

**A)**
**Read the file again**
파일을 다시 읽어

**to confirm current content,**
현재 내용을 확인한 후,

**then call Write**
`Write` 도구를 호출하는 것

**with the entire re-indented file content**
들여쓰기가 다시 적용된 전체 파일 내용과 함께

**in a single call**
단 한 번의 호출로.

**B)**
**Call Glob**
`Glob` 도구를 호출하여

**to match the file's own path,**
파일 자체의 경로를 매칭하고,

**then rely on Glob's**
그런 다음 `Glob` 의

**sort-by-modification-time behavior**
수정 시간 기준 정렬 동작에 의존하여

**to normalize the file's whitespace**
파일의 공백을 정규화하는 것.

**C)**
**Issue one Edit call**
한 번의 `Edit` 호출을 발행하는 것

**per line of the file,**
파일의 각 줄마다,

**each with old_string set to**
각각 `old_string` 이 설정된 상태로

**that single line's current indentation and text**
해당 단일 줄의 현재 들여쓰기 및 텍스트로.

**D)**
**Call Grep**
`Grep` 도구를 호출하는 것

**with output mode content**
출력 모드를 `content` 로 지정하여

**to retrieve every line of the file,**
파일의 모든 줄을 가져오기 위해,

**since retrieving lines through Grep**
`Grep` 을 통해 줄을 가져오는 것이

**also rewrites them in place**
제자리에서 그 줄들을 다시 쓰기도 하므로.

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
Option B (오답): `Glob` 은 파일 시스템에서 파일/디렉토리 경로 패턴을 검색하는 검색 도구이며, 파일 내부 공백을 수정하거나 정규화하는 기능이 전혀 없습니다.
Option C (오답): 900줄 파일의 모든 줄마다 `Edit` 도구를 개별적으로 900번 호출하는 것은 심각한 자원 낭비이며 오버헤드를 발생시킵니다.
Option D (오답): `Grep` 은 파일 내용 내 패턴 검색용 도구일 뿐, 파일을 다시 쓰거나(rewrite in place) 변경하는 기능이 없습니다.


---


# 4번 문제

**1. 문제 원문**

A developer is writing a new tool description and wants to minimize the chance the model confuses it with an existing similar tool. Which combination of elements most reliably differentiates the tools for selection purposes?

A) Expected input format, one or two example queries the tool handles, and a note on when to prefer the other tool instead.

B) An exhaustive list of every possible parameter combination the tool accepts, without any narrative explanation of intended use.

C) The name of the engineer who implemented the tool along with its internal implementation language choice.

D) A catchy tool name paired with an emoji so it appears visually distinct within the full list of tools.

---

**2. 구간별 직독직해 번역**

**QUESTION / SCENARIO:**

**A developer is writing**
한 개발자가 작성하고 있습니다

**a new tool description**
새로운 도구 설명을

**and wants to minimize**
그리고 최소화하고자 합니다

**the chance the model confuses it**
모델이 그것을 혼동할 가능성을

**with an existing similar tool.**
기존의 유사한 도구와.

**Which combination of elements**
어떤 요소의 조합이

**most reliably differentiates**
가장 확실하게 구별지어 줍니까

**the tools for selection purposes?**
도구 선택 목적으로 도구들을?

---

**OPTIONS:**

**A)**
**Expected input format,**
예상되는 입력 형식,

**one or two example queries**
한두 개의 예시 쿼리

**the tool handles,**
도구가 처리하는,

**and a note on when**
그리고 ~일 때에 대한 참고 사항

**to prefer the other tool instead.**
대신 다른 도구를 선호해야 할 때.

**B)**
**An exhaustive list**
소모적이고 망라적인 목록

**of every possible parameter combination**
가능한 모든 매개변수 조합의

**the tool accepts,**
도구가 허용하는,

**without any narrative explanation**
서술적 설명 없이

**of intended use.**
의도된 사용 목적에 대한.

**C)**
**The name of the engineer**
엔지니어의 이름

**who implemented the tool**
도구를 구현한

**along with its internal**
내부적인 선택과 함께

**implementation language choice.**
구현 언어 선택에 대한.

**D)**
**A catchy tool name**
기억하기 쉬운 도구 이름

**paired with an emoji**
이모지와 쌍을 이룬

**so it appears visually distinct**
시각적으로 구별되어 보이도록

**within the full list of tools.**
전체 도구 목록 내에서.

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
Option B (오답): 의도된 사용 목적에 대한 설명 없이 파라미터 조합만 나열하면 모델은 도구를 언제 호출해야 하는지 맥락을 이해하지 못합니다.
Option C (오답): 개발자 이름이나 도구의 내부 구현 언어(Python, Rust 등)는 LLM이 사용자의 요청을 처리하기 위해 도구를 선택할 때 아무런 관련이 없는 불필요한 정보입니다.
Option D (오답): 캐치한 이름이나 이모지는 시각적인 요소일 뿐, LLM의 의미론적 판단(Semantic Reasoning)과 도구 선택 로직 개선에는 거의 도움을 주지 못합니다.


---


# 5번 문제

**1. 문제 원문**

A developer wants to try out an experimental local MCP server that queries their personal Notion workspace. They do not want it to appear for any other teammate, and they want it available whenever they open any project on their own machine. Which configuration achieves this?

A) Add the server with user scope so the entry is written to `~/.claude.json` and loads across every project on that machine without being shared

B) Add the server with project scope so the entry is written to `.mcp.json` and stays private until the developer marks it as personal-only

C) Add the server with local scope so the entry is written to `.mcp.json` but excluded from git tracking via a `.gitignore` rule

D) Add the server directly inside `.claude/settings.json` so it inherits the personal visibility rules of local project settings

---

**2. 구간별 직독직해 번역**

**QUESTION / SCENARIO:**

**A developer wants to try out**  
한 개발자가 시도해 보기를 원합니다  

**an experimental local MCP server**  
실험적인 로컬 MCP 서버를  

**that queries their personal Notion workspace.**  
개인 Notion 워크스페이스를 조회하는.  

**They do not want it to appear**  
그들은 이것이 표시되는 것을 원하지 않습니다  

**for any other teammate,**  
다른 어떤 팀원에게도,  

**and they want it available**  
그리고 이것이 사용 가능하기를 원합니다  

**whenever they open any project**  
어떤 프로젝트를 열 때마다  

**on their own machine.**  
자신의 로컬 머신에서.  

**Which configuration achieves this?**  
어떤 설정이 이것을 달성합니까?  

---

**OPTIONS:**

**A)**  
**Add the server with user scope**  
사용자 스코프(User Scope)로 서버를 추가하여  

**so the entry is written to `~/.claude.json`**  
항목이 `~/.claude.json`에 기록되도록 하고  

**and loads across every project**  
모든 프로젝트 전반에서 로드되도록 하는 것  

**on that machine**  
해당 머신의  

**without being shared**  
공유되지 않고.  

**B)**  
**Add the server with project scope**  
프로젝트 스코프(Project Scope)로 서버를 추가하여  

**so the entry is written to `.mcp.json`**  
항목이 `.mcp.json`에 기록되도록 하고  

**and stays private**  
비공개로 유지되도록 하는 것  

**until the developer marks it**  
개발자가 그것을 표시할 때까지  

**as personal-only**  
개인 전용으로.  

**C)**  
**Add the server with local scope**  
로컬 스코프(Local Scope)로 서버를 추가하여  

**so the entry is written to `.mcp.json`**  
항목이 `.mcp.json`에 기록되도록 하고  

**but excluded from git tracking**  
하지만 Git 추적에서 제외되도록 하는 것  

**via a `.gitignore` rule**  
`.gitignore` 규칙을 통해.  

**D)**  
**Add the server directly inside `.claude/settings.json`**  
`.claude/settings.json` 내부에 직접 서버를 추가하여  

**so it inherits the personal visibility rules**  
개인 가시성 규칙을 상속받도록 하는 것  

**of local project settings**  
로컬 프로젝트 설정의.  

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
Option B (오답): Project Scope는 프로젝트 경로 내 설정 파일(`.mcp.json`)에 저장되어 코드베이스에 포함되므로 팀원에게 공유될 가능성이 높고, 특정 프로젝트에만 국한됩니다.
Option C (오답): `.gitignore`로 제외하더라도 특정 프로젝트 디렉토리에 묶이게 되므로, "자신의 머신에서 열리는 어떤 프로젝트에서나 사용 가능해야 한다"는 요구사항을 충족하지 못합니다.
Option D (오답): `.claude/settings.json`은 Claude 환경 설정 파일이며, 모든 프로젝트에서 전역적으로 MCP 서버를 연동하는 표준적인 User Scope 경로(`~/.claude.json`) 설정과 부합하지 않습니다.


---


# 6번 문제

**1. 문제 원문**

A synthesis agent's job is to combine findings that a separate research agent has already gathered into a final answer. Because it shares a tool registry with the research agent, the synthesis agent also has access to a web_search tool. During testing, the synthesis agent repeatedly calls web_search mid-synthesis instead of using the findings already provided to it, producing inconsistent citations. What is the best explanation and fix for this behavior?

A) Agents tend to misuse tools outside their specialization when given access to them; web_search should be removed from the synthesis agent's tool set and left with the research agent.

B) The synthesis agent's temperature is likely too high, causing it to explore tool calls rather than follow its findings; lowering it to a more focused value like 0.2 would reduce unnecessary searches.

C) The web_search tool's description is too vague for the synthesis agent to interpret correctly; rewriting it with guidance that it is a research tool and should not be used during synthesis would prevent the extra calls.

D) The research agent is passing incomplete findings, so the synthesis agent searches for missing information; updating the research agent to include complete source lists would prevent the extra calls.

---

**2. 구간별 직독직해 번역**

**QUESTION / SCENARIO:**

**A synthesis agent's job is**  
종합(Synthesis) 에이전트의 역할은  

**to combine findings**  
조사 결과들을 결합하여  

**that a separate research agent**  
별도의 리서치 에이전트가  

**has already gathered**  
이미 수집한  

**into a final answer.**  
최종 답변으로 만드는 것입니다.  

**Because it shares**  
공유하고 있기 때문에  

**a tool registry**  
도구 레지스트리를  

**with the research agent,**  
리서치 에이전트와,  

**the synthesis agent also has access**  
종합 에이전트 역시 접근 권한을 가집니다  

**to a web_search tool.**  
`web_search` 도구에.  

**During testing,**  
테스트하는 동안,  

**the synthesis agent repeatedly calls**  
종합 에이전트가 반복적으로 호출합니다  

**web_search mid-synthesis**  
종합 과정 중간에 `web_search`를  

**instead of using the findings**  
결과들을 사용하는 대신  

**already provided to it,**  
이미 자신에게 제공된,  

**producing inconsistent citations.**  
일관되지 않은 인용을 만들어내면서.  

**What is the best explanation**  
가장 적절한 설명과  

**and fix for this behavior?**  
이 동작에 대한 해결책은 무엇입니까?  

---

**OPTIONS:**

**A)**  
**Agents tend to misuse tools**  
에이전트는 도구를 오용하는 경향이 있습니다  

**outside their specialization**  
자신의 전문 분야 외의  

**when given access to them;**  
접근 권한이 주어질 때;  

**web_search should be removed**  
`web_search`를 제거해야 합니다  

**from the synthesis agent's tool set**  
종합 에이전트의 도구 세트에서  

**and left with the research agent.**  
그리고 리서치 에이전트에게만 남겨두어야 합니다.  

**B)**  
**The synthesis agent's temperature**  
종합 에이전트의 온도가  

**is likely too high,**  
너무 높을 가능성이 있습니다,  

**causing it to explore tool calls**  
도구 호출을 탐색하게 만들면서  

**rather than follow its findings;**  
자신의 결과들을 따르기보다;  

**lowering it to a more focused value**  
더 집중된 값으로 이것을 낮추는 것은  

**like 0.2**  
0.2와 같은  

**would reduce unnecessary searches.**  
불필요한 검색을 줄여줄 것입니다.  

**C)**  
**The web_search tool's description**  
`web_search` 도구의 설명이  

**is too vague**  
너무 모호합니다  

**for the synthesis agent to interpret correctly;**  
종합 에이전트가 올바르게 해석하기에는;  

**rewriting it with guidance**  
지침과 함께 이것을 다시 작성하는 것은  

**that it is a research tool**  
이것이 리서치 도구이며  

**and should not be used during synthesis**  
종합 중에는 사용되어서는 안 된다는  

**would prevent the extra calls.**  
추가 호출을 방지할 것입니다.  

**D)**  
**The research agent is passing**  
리서치 에이전트가 전달하고 있습니다  

**incomplete findings,**  
불완전한 조사 결과를,  

**so the synthesis agent searches**  
그래서 종합 에이전트가 검색하는 것입니다  

**for missing information;**  
누락된 정보를 위해;  

**updating the research agent**  
리서치 에이전트를 업데이트하여  

**to include complete source lists**  
완벽한 출처 목록을 포함하도록 하는 것이  

**would prevent the extra calls.**  
추가 호출을 방지할 것입니다.  

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
Option B (오답): 온도를 낮춘다고 해서 불필요하게 노출된 도구에 대한 오호출을 근본적으로 막을 수 없으며, 확률적인 미봉책에 불과합니다.
Option C (오답): 도구 설명(Description)에 "종합 시 사용하지 말 것"이라는 텍스트 지침을 넣더라도, 프롬프트 지시를 우회하거나 무시하는 LLM의 특성상 도구 자체를 차단하는 것보다 불안정합니다.
Option D (오답): 문제의 원인은 리서치 결과의 완전성 부족이 아니라, 필요 없는 검색 도구가 종합 에이전트에 제공되었기 때문입니다.


---


# 7번 문제

**1. 문제 원문**

A support agent has both `search_web` and `fetch_webpage_results` as separate tools. Testing shows the model almost always calls `search_web`, even for tasks better suited to `fetch_webpage_results`. The system prompt contains "Always prefer searching for the most up to date information." What most likely explains the bias?

A) The fetch tool cannot be selected during parallel tool use, so it is filtered out before the model can consider it.

B) Keyword-sensitive system prompt wording creates an unintended association that overrides the more accurate tool description.

C) The search tool carries a lower internal temperature value in its schema, making it statistically favored during sampling.

D) The fetch tool's description exceeds a fixed token threshold, causing the model to systematically avoid tools of that length.

---

**2. 구간별 직독직해 번역**

**QUESTION / SCENARIO:**

**A support agent has**  
지원 에이전트가 가지고 있습니다  

**both search_web and fetch_webpage_results**  
`search_web`과 `fetch_webpage_results` 모두를  

**as separate tools.**  
별도의 도구로.  

**Testing shows**  
테스트 결과는 보여줍니다  

**the model almost always calls search_web,**  
모델이 거의 항상 `search_web`을 호출한다는 것을,  

**even for tasks**  
심지어 작업에 대해서도  

**better suited to fetch_webpage_results.**  
`fetch_webpage_results`에 더 적합한.  

**The system prompt contains**  
시스템 프롬프트에는 포함되어 있습니다  

**"Always prefer searching**  
"항상 검색하는 것을 선호하라  

**for the most up to date information."**  
가장 최신 정보를 얻기 위해."  

**What most likely explains**  
무엇이 가장 잘 설명합니까  

**the bias?**  
이 편향을?  

---

**OPTIONS:**

**A)**  
**The fetch tool cannot be selected**  
패치 도구는 선택될 수 없습니다  

**during parallel tool use,**  
병렬 도구 사용 중에,  

**so it is filtered out**  
따라서 필터링되어 제외됩니다  

**before the model can consider it.**  
모델이 이것을 고려하기도 전에.  

**B)**  
**Keyword-sensitive system prompt wording**  
키워드에 민감한 시스템 프롬프트 문구가  

**creates an unintended association**  
의도치 않은 연관성을 형성합니다  

**that overrides**  
우선하여 적용되는 (무력화하는)  

**the more accurate tool description.**  
더 정확한 도구 설명을.  

**C)**  
**The search tool carries**  
검색 도구가 가지고 있습니다  

**a lower internal temperature value**  
더 낮은 내부 온도(temperature) 값을  

**in its schema,**  
자신의 스키마에,  

**making it statistically favored**  
이것을 통계적으로 더 선호되게 만들면서  

**during sampling.**  
샘플링 과정 동안.  

**D)**  
**The fetch tool's description**  
패치 도구의 설명이  

**exceeds a fixed token threshold,**  
고정된 토큰 임계값을 초과합니다,  

**causing the model to systematically avoid**  
모델이 체계적으로 피하게 만들면서  

**tools of that length.**  
해당 길이의 도구들을.  

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
Option A (오답): 특정 도구가 병렬 도구 사용 시 자동으로 필터링되어 고려 대상에서 제외되는 메커니즘은 존재하지 않습니다.
Option C (오답): 도구 스키마 내부에는 별도의 `temperature` 설정값이 존재하지 않으며, 온도는 모델 호출 단위의 생성 파라미터입니다.
Option D (오답): 설명 길이가 길다고 해서 모델이 해당 도구를 체계적으로 회피한다는 임계값 설정이나 동작 방식은 사실이 아닙니다.


---


# 8번 문제

**1. 문제 원문**

A team member tries to add a custom MCP server named `computer-use` to give the agent a specialized screenshot tool. What should the architect expect to happen?

A) Claude Code loads the custom server but silently strips its screenshot tool since that capability is presumed reserved for the built-in server

B) Claude Code rejects or skips the server because `computer-use` is a reserved built-in name, so the team member needs to pick a different name

C) Claude Code loads the custom server normally and simply hides the built-in server named `computer-use` for the rest of that session

D) Claude Code merges the tools from the custom server directly into the built-in server's own tool set under the shared reserved name

---

**2. 구간별 직독직해 번역**

**QUESTION / SCENARIO:**

**A team member tries to add**  
한 팀원이 추가하려고 시도합니다  

**a custom MCP server**  
커스텀 MCP 서버를  

**named `computer-use`**  
`computer-use`라는 이름의  

**to give the agent**  
에이전트에게 제공하기 위해  

**a specialized screenshot tool.**  
특화된 스크린샷 도구를.  

**What should the architect expect**  
아키텍트는 무엇이 일어날 것으로 예상해야 합니까  

**to happen?**  
어떤 일이 벌어질지에 대해?  

---

**OPTIONS:**

**A)**  
**Claude Code loads the custom server**  
Claude Code가 커스텀 서버를 로드하지만  

**but silently strips its screenshot tool**  
스크린샷 도구를 알리지 않고 제거합니다  

**since that capability is presumed reserved**  
해당 기능이 예약되어 있다고 간주되기 때문에  

**for the built-in server**  
내장(Built-in) 서버 전용으로.  

**B)**  
**Claude Code rejects or skips the server**  
Claude Code가 해당 서버를 거부하거나 건너뜁니다  

**because `computer-use` is a reserved built-in name,**  
`computer-use`는 예약된 내장 이름이기 때문에,  

**so the team member needs to pick**  
따라서 팀원은 선택해야 합니다  

**a different name**  
다른 이름을.  

**C)**  
**Claude Code loads the custom server normally**  
Claude Code가 커스텀 서버를 정상적으로 로드하고  

**and simply hides the built-in server**  
내장 서버를 단순히 숨깁니다  

**named `computer-use`**  
`computer-use`라는 이름의  

**for the rest of that session**  
해당 세션의 남은 시간 동안.  

**D)**  
**Claude Code merges the tools**  
Claude Code가 도구들을 병합합니다  

**from the custom server**  
커스텀 서버로부터 온  

**directly into the built-in server's own tool set**  
내장 서버의 자체 도구 세트에 직접  

**under the shared reserved name**  
공유된 예약 이름 아래에서.  

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
Option A (오답): 서버를 로드한 뒤 도구만 일부 몰래 제거(silently strip)하는 부분적인 비정상 로드 동작을 수행하지 않습니다.
Option C (오답): 사용자 정의 커스텀 서버가 기본 내장(Built-in) 서버의 기능을 덮어씌워 숨기는 것(Override/Hide)을 허용하지 않습니다.
Option D (오답): 사용자 정의 커스텀 도구를 내장 서버의 내부 도구 세트로 임의 병합(Merge)하지 않으며, 네이밍이 충돌하면 로드 자체를 거부합니다.


---


# 9번 문제

**1. 문제 원문**

An architect is designing tool access for a three-agent pipeline: an intake agent, a processing agent, and a delivery agent. The intake agent occasionally needs to check processing status, which is normally a processing-agent operation. Following the principle of scoped tool access with limited cross-role tools, how should the architect handle this?

A) Give the intake agent the processing agent's full tool set, enabling it to directly perform status checks and execute any processing operation as part of its intake workflow.

B) Remove status checking from the pipeline, redesigning the three-agent workflow so the intake agent never requires a tool outside its core responsibility of accepting intakes.

C) Give the intake agent only a narrow check_status tool for that specific high-frequency need, while routing deeper processing operations through the processing agent.

D) Give the processing agent a copy of the intake agent's status check tool, so that either agent can independently perform status checks without routing through the processing agent's operations.

---

**2. 구간별 직독직해 번역**

**QUESTION / SCENARIO:**

**An architect is designing**
한 아키텍트가 설계하고 있습니다

**tool access**
도구 접근 권한을

**for a three-agent pipeline:**
3개 에이전트 파이프라인을 위한:

**an intake agent,**
접수(intake) 에이전트,

**a processing agent,**
처리(processing) 에이전트,

**and a delivery agent.**
그리고 전달(delivery) 에이전트.

**The intake agent**
접수 에이전트는

**occasionally needs to check**
가끔 확인해야 합니다

**processing status,**
처리 상태를,

**which is normally**
그리고 이것은 보통

**a processing-agent operation.**
처리 에이전트의 작업입니다.

**Following the principle**
원칙을 따라서

**of scoped tool access**
범위가 지정된 도구 접근(scoped tool access)과

**with limited cross-role tools,**
제한된 역할 간 도구(cross-role tools)의,

**how should the architect**
아키텍트는 어떻게

**handle this?**
이것을 처리해야 합니까?

---

**OPTIONS:**

**A)**
**Give the intake agent**
접수 에이전트에게 제공하는 것

**the processing agent's full tool set,**
처리 에이전트의 전체 도구 세트를,

**enabling it to directly perform**
직접 수행할 수 있게 하면서

**status checks**
상태 확인을

**and execute any processing operation**
그리고 어떠한 처리 작업이든 실행할 수 있게

**as part of its intake workflow.**
접수 워크플로의 일부로서.

**B)**
**Remove status checking**
상태 확인 기능을 제거하는 것

**from the pipeline,**
파이프라인에서,

**redesigning the three-agent workflow**
3개 에이전트 워크플로를 재설계하여

**so the intake agent never requires**
접수 에이전트가 전혀 필요로 하지 않도록

**a tool outside its core responsibility**
핵심 책임 범위 밖의 도구를

**of accepting intakes.**
접수를 받는.

**C)**
**Give the intake agent**
접수 에이전트에게 제공하는 것

**only a narrow check_status tool**
범위가 좁은(한정된) `check_status` 도구만

**for that specific high-frequency need,**
해당 특정 빈번한 요구를 위해,

**while routing deeper processing operations**
더 깊은 처리 작업들은 라우팅하면서

**through the processing agent.**
처리 에이전트를 통해.

**D)**
**Give the processing agent**
처리 에이전트에게 제공하는 것

**a copy of the intake agent's**
접수 에이전트의 사본을

**status check tool,**
상태 확인 도구의,

**so that either agent**
두 에이전트 중 어느 쪽이든

**can independently perform**
독립적으로 수행할 수 있도록

**status checks**
상태 확인을

**without routing through**
 거치지 않고

**the processing agent's operations.**
처리 에이전트의 작업을.

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
Option A (오답): 단지 상태 조회가 필요하다는 이유로 처리 에이전트의 전체 도구 세트(Full tool set)를 제공하는 것은 과도한 권한 부여(Over-privileging)이며, 에이전트가 예기치 않게 처리 작업을 직접 실행할 위험이 생깁니다.
Option B (오답): 시스템에 필요한 필수 기능(상태 확인)을 아예 제거해 버리는 것은 유용성을 해치는 잘못된 접근 방식입니다.
Option D (오답): 상태 확인 작업이 필요한 쪽은 접수 에이전트인데, 처리 에이전트에 접수 에이전트의 도구를 사본으로 넘겨주는 방식은 문제의 요구사항과 맞지 않으며 논리적으로 불필요합니다.


---


# 10번 문제

**1. 문제 원문**

A team names two tools `process_data` and `process_information`, and both share the description "Processes data provided by the user." The model routes roughly half of matching tasks to the wrong tool. What is the most likely root cause?

A) The model's context window is too small to hold both full tool definitions during a single request's generation pass, leading to ambiguous routing.

B) The user's request phrasing was too vague to reliably distinguish between the tools, so the fix belongs in the user's prompt rather than the tool definitions.

C) The near-duplicate descriptions give the model no differentiating signal, since descriptions are its main basis for choosing similar tools.

D) The tools were declared in the wrong order in the tools array, and reordering them so that the intended tool is listed first will correct the routing behavior.

---

**2. 구간별 직독직해 번역**

**QUESTION / SCENARIO:**

**A team names two tools**
한 팀이 두 도구의 이름을 지정합니다

**process_data and process_information,**
`process_data` 및 `process_information`으로,

**and both share the description**
그리고 두 도구 모두 설명을 공유합니다

**"Processes data provided by the user."**
"사용자가 제공한 데이터를 처리합니다"라는.

**The model routes**
모델이 라우팅합니다(잘못 보냅니다)

**roughly half of matching tasks**
해당되는 작업의 거의 절반을

**to the wrong tool.**
잘못된 도구로.

**What is the most likely root cause?**
가장 가능성 높은 근본 원인은 무엇입니까?

---

**OPTIONS:**

**A)**
**The model's context window**
모델의 콘텍스트 창이

**is too small to hold**
수용하기에 너무 작습니다

**both full tool definitions**
두 도구 정의 전체를

**during a single request's generation pass,**
단일 요청의 생성 패스 동안,

**leading to ambiguous routing.**
모호한 라우팅으로 이어지면서.

**B)**
**The user's request phrasing**
사용자의 요청 문구가

**was too vague**
너무 모호했습니다

**to reliably distinguish**
확실하게 구별하기에는

**between the tools,**
도구들 사이를,

**so the fix belongs**
따라서 수정 사항은 속합니다

**in the user's prompt**
사용자의 프롬프트에

**rather than the tool definitions.**
도구 정의보다는.

**C)**
**The near-duplicate descriptions**
거의 중복된 설명이

**give the model no differentiating signal,**
모델에게 어떠한 차별화 신호도 제공하지 않습니다,

**since descriptions are its main basis**
설명이 그것의 주요 기준이기 때문에

**for choosing similar tools.**
유사한 도구를 선택하는.

**D)**
**The tools were declared**
도구들이 선언되었습니다

**in the wrong order**
잘못된 순서로

**in the tools array,**
도구 배열 내에서,

**and reordering them**
그리고 그것들의 순서를 재조정하는 것이

**so that the intended tool is listed first**
의도한 도구가 먼저 나열되도록

**will correct the routing behavior.**
라우팅 동작을 바로잡을 것입니다.

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
Option A (오답): 도구 정의 2개의 텍스트는 토큰 수가 매우 적으므로 콘텍스트 창(Context Window) 한계 문제와는 무관합니다.
Option B (오답): 두 도구의 설명이 완전히 동일한 것이 문제의 본질이므로, 문제의 원인과 수정 지점은 사용자의 프롬프트가 아닌 개발자가 작성한 도구 정의(Tool Definition)에 있습니다.
Option D (오답): 도구 배열(Array) 내 선언 순서를 바꾼다고 해서 중복 설명으로 인한 라우팅 모호성이 해결되지 않으며, 단순히 첫 번째 도구에 편향(Bias)을 줄 뿐입니다.


---


# 11번 문제

**1. 문제 원문**

A `book_meeting_room` MCP tool fails because the requested room is already reserved for the requested time slot. The tool author wants the agent to be able to explain the conflict to the user in natural language and suggest picking a different time, without the agent needing to parse a raw exception message. Which element of the structured error response most directly enables this?

A) Returning the raw exception stack trace from the scheduling library so the agent can extract the room name using text parsing

B) A human-readable description field stating the room is already booked for that slot, separate from any machine-oriented errorCategory or isRetryable flags

C) Setting isRetryable to true so the agent automatically resubmits the identical booking request until the room becomes free on its own

D) Omitting the description field entirely, since errorCategory alone is sufficient for the agent to generate an accurate, context-specific explanation

---

**2. 구간별 직독직해 번역**

**QUESTION / SCENARIO:**

**A book_meeting_room MCP tool fails**  
`book_meeting_room` MCP 도구가 실패합니다  

**because the requested room**  
요청된 회의실이  

**is already reserved**  
이미 예약되어 있기 때문에  

**for the requested time slot.**  
요청된 시간대에.  

**The tool author wants**  
도구 작성자는 원합니다  

**the agent to be able to explain**  
에이전트가 설명할 수 있기를  

**the conflict to the user**  
사용자에게 예약 충돌을  

**in natural language**  
자연어로  

**and suggest picking a different time,**  
그리고 다른 시간을 선택하도록 제안하기를,  

**without the agent needing to parse**  
에이전트가 파싱할 필요 없이  

**a raw exception message.**  
날것의 예외 메시지를.  

**Which element**  
어떤 요소가  

**of the structured error response**  
구조화된 오류 응답의  

**most directly enables this?**  
이를 가장 직접적으로 가능하게 합니까?  

---

**OPTIONS:**

**A)**  
**Returning the raw exception stack trace**  
날것의 예외 스택 트레이스를 반환하는 것  

**from the scheduling library**  
스케줄링 라이브러리로부터  

**so the agent can extract the room name**  
에이전트가 회의실 이름을 추출할 수 있도록  

**using text parsing**  
텍스트 파싱을 사용하여.  

**B)**  
**A human-readable description field**  
리가 읽을 수 있는(사람이 이해하기 쉬운) 설명 필드  

**stating the room is already booked**  
회의실이 이미 해당 시간대에 예약되었다고 명시하는  

**for that slot,**  
,  

**separate from any machine-oriented**  
기계 지향적인 것과 분리되어  

**errorCategory or isRetryable flags**  
`errorCategory` 또는 `isRetryable` 플래그와 같은.  

**C)**  
**Setting isRetryable to true**  
`isRetryable`을 true로 설정하는 것  

**so the agent automatically resubmits**  
에이전트가 자동으로 재전송하도록  

**the identical booking request**  
동일한 예약 요청을  

**until the room becomes free**  
회의실이 비게 될 때까지  

**on its own**  
스스로.  

**D)**  
**Omitting the description field entirely,**  
설명 필드를 완전히 생략하는 것,  

**since errorCategory alone is sufficient**  
`errorCategory`만으로도 충분하므로  

**for the agent to generate**  
에이전트가 생성하기에  

**an accurate, context-specific explanation**  
정확하고 맥락에 맞는 설명을.  

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
Option A (오답): 날것의 스택 트레이스를 반환하고 텍스트 파싱을 요구하는 것은 "raw exception message를 파싱할 필요 없이"라는 문제 조건에 직접적으로 위배됩니다.
Option C (오답): 예약 충돌은 사용자가 시간대를 바꾸지 않는 한 동일한 요청을 무한 재시도(`isRetryable: true`)한다고 해서 해결되지 않으며, 잘못된 로직을 일으킵니다.
Option D (오답): 구체적인 세부 사유(어떤 이유로 거절되었는지)를 포함하는 description 필드를 생략하고 대분류 카테고리만 제공하면, 에이전트가 사용자에게 맥락에 맞는 정확한 안내를 제공할 수 없습니다.


---


# 12번 문제

**1. 문제 원문**

A subagent responsible for enriching customer records calls an internal `lookup_address` tool for 50 customers. For 47 the lookup succeeds; for 3 the tool returns `isError: true` with `errorCategory: "permission"` because the subagent's credentials lack access to those records' region. The subagent cannot obtain broader credentials itself. What should it send back to the coordinator?

A) An `isError: true` result for the entire batch, discarding the 47 successful lookups because the batch as a whole did not fully complete

B) Only the 47 enriched records, silently dropping the 3 failures since local recovery attempts already reached their limit for this subagent

C) A retry loop that keeps calling `lookup_address` on the same 3 customers with the same credentials until the coordinator intervenes

D) The 47 enriched records as partial results, plus a report naming the 3 unresolved customers, the permission error encountered, and what was attempted

---

**2. 구간별 직독직해 번역**

**QUESTION / SCENARIO:**

**A subagent responsible**
담당하는 서브에이전트가

**for enriching customer records**
고객 기록을 보강하는 것을

**calls an internal lookup_address tool**
내부 `lookup_address` 도구를 호출합니다

**for 50 customers.**
50명의 고객에 대해.

**For 47**
47명에 대해서는

**the lookup succeeds;**
조회가 성공합니다;

**for 3 the tool returns**
3명에 대해서는 도구가 반환합니다

**isError: true**
`isError: true`를

**with errorCategory: "permission"**
오류 카테고리: "permission"과 함께

**because the subagent's credentials**
서브에이전트의 자격 증명이

**lack access**
접근 권한이 부족하기 때문에

**to those records' region.**
해당 기록들의 지역에 대한.

**The subagent cannot obtain**
서브에이전트는 얻을 수 없습니다

**broader credentials itself.**
더 광범위한 자격 증명을 스스로.

**What should it send back**
서브에이전트는 무엇을 되돌려 보내야 합니까

**to the coordinator?**
코디네이터에게?

---

**OPTIONS:**

**A)**
**An isError: true result**
`isError: true` 결과를

**for the entire batch,**
전체 배치 작업에 대해,

**discarding the 47 successful lookups**
성공한 47개의 조회를 폐기하면서

**because the batch as a whole**
배치 전체가

**did not fully complete**
완전하게 완료되지 않았기 때문에.

**B)**
**Only the 47 enriched records,**
보강된 47개의 기록만,

**silently dropping the 3 failures**
3개의 실패를 알리지 않고 삭제하면서

**since local recovery attempts**
로컬 복구 시도가

**already reached their limit**
이미 한계에 도달했기 때문에

**for this subagent**
이 서브에이전트에 대해.

**C)**
**A retry loop**
재시도 루프를

**that keeps calling lookup_address**
`lookup_address`를 계속 호출하는

**on the same 3 customers**
동일한 3명의 고객에 대해

**with the same credentials**
동일한 자격 증명으로

**until the coordinator intervenes**
코디네이터가 개입할 때까지.

**D)**
**The 47 enriched records as partial results,**
부분 결과로서 보강된 47개의 기록,

**plus a report naming**
그리고 지목하는 보고서를 함께

**the 3 unresolved customers,**
해결되지 않은 3명의 고객,

**the permission error encountered,**
마주친 권한 오류,

**and what was attempted**
그리고 시도되었던 내용을.

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
Option A (오답): 일부 실패 때문에 성공한 47건의 결과까지 파기(`discarding`)하는 것은 심각한 자원 낭비이며 비효율적입니다.
Option B (오답): 실패한 3건을 무단으로 누락(`silently dropping`)하면 상위 코디네이터가 데이터 누락 사실을 알지 못해 시스템 정합성 문제가 발생합니다.
Option C (오답): 동일한 자격 증명으로 권한 에러(`permission`)가 난 항목을 무한 재시도하는 것은 무한 루프를 유발하고 리소스를 낭비합니다.


---


# 13번 문제

**1. 문제 원문**

A coordinator agent delegates tasks to a research agent, a coding agent, and a QA agent. Currently, every subagent is configured with the full union of all tools used anywhere in the pipeline, so each has around 15 tools available, and each agent's tool choice is left at {"type": "auto"} in every turn. The team reports agents occasionally reaching for tools clearly outside their remit, like the QA agent invoking a deploy tool. What combination of changes best addresses this while preserving each agent's ability to decide when to act versus respond?

A) Keep the shared 15-tool set for all subagents, but switch every subagent's tool_choice to {"type": "any"} so a tool call is always forced, ensuring subagents cannot respond without selecting a tool.

B) Restrict each subagent's tool set to only what its own role needs, and also force every subagent's tool_choice to a single named tool for all turns, such as search tool for research and test tool for QA.

C) Restrict each subagent's tool set to only what its role needs, while keeping tool_choice at {"type": "auto"} so each agent still decides per turn whether to call a tool.

D) Keep the shared 15-tool set for all subagents, but switch every subagent's tool_choice to {"type": "none"} so no subagent can call tools directly, requiring the coordinator to invoke tools on its behalf.

---

**2. 구간별 직독직해 번역**

**QUESTION / SCENARIO:**

**A coordinator agent delegates**
코디네이터 에이전트가 위임합니다

**tasks to a research agent,**
작업들을 리서치 에이전트,

**a coding agent, and a QA agent.**
코딩 에이전트, 그리고 QA 에이전트에게.

**Currently, every subagent is configured**
현재, 모든 서브에이전트가 설정되어 있습니다

**with the full union of all tools**
모든 도구의 전체 합집합으로

**used anywhere in the pipeline,**
파이프라인 어디서든 사용되는,

**so each has around 15 tools available,**
그래서 각자 약 15개의 도구를 사용할 수 있으며,

**and each agent's tool choice**
그리고 각 에이전트의 도구 선택(tool choice)은

**is left at {"type": "auto"}**
{"type": "auto"} 상태로 유지됩니다

**in every turn.**
매 턴마다.

**The team reports agents**
팀은 에이전트들이 ~하고 있다고 보고합니다

**occasionally reaching for tools**
가끔 도구에 손을 대는 현상을

**clearly outside their remit,**
자신의 소관(권한)을 명확히 벗어난,

**like the QA agent invoking a deploy tool.**
QA 에이전트가 배포 도구를 호출하는 것과 같이.

**What combination of changes**
어떤 변경 사항의 조합이

**best addresses this**
이 문제를 가장 잘 해결합니까

**while preserving each agent's ability**
각 에이전트의 능력을 유지하면서

**to decide when to act versus respond?**
행동할지(도구 호출) 또는 응답할지(텍스트)를 결정하는?

---

**OPTIONS:**

**A)**
**Keep the shared 15-tool set**
공유된 15개 도구 세트를 유지합니다

**for all subagents,**
모든 서브에이전트에 대해,

**but switch every subagent's tool_choice**
하지만 모든 서브에이전트의 tool_choice를 변경합니다

**to {"type": "any"}**
{"type": "any"}로

**so a tool call is always forced,**
도구 호출이 항상 강제되도록 하여,

**ensuring subagents cannot respond**
서브에이전트가 응답할 수 없도록 보장하면서

**without selecting a tool.**
도구를 선택하지 않고서는.

**B)**
**Restrict each subagent's tool set**
각 서브에이전트의 도구 세트를 제한합니다

**to only what its own role needs,**
자신의 역할이 필요로 하는 것으로만,

**and also force every subagent's tool_choice**
그리고 모든 서브에이전트의 tool_choice를 강제합니다

**to a single named tool for all turns,**
모든 턴 동안 단일 지정 도구로,

**such as search tool for research**
리서치를 위한 검색 도구 및

**and test tool for QA.**
QA를 위한 테스트 도구와 같이.

**C)**
**Restrict each subagent's tool set**
각 서브에이전트의 도구 세트를 제한합니다

**to only what its role needs,**
자신의 역할이 필요로 하는 것으로만,

**while keeping tool_choice at {"type": "auto"}**
tool_choice는 {"type": "auto"} 상태로 유지하면서

**so each agent still decides per turn**
각 에이전트가 턴마다 여전히 결정할 수 있도록

**whether to call a tool.**
도구를 호출할지 여부를.

**D)**
**Keep the shared 15-tool set**
공유된 15개 도구 세트를 유지합니다

**for all subagents,**
모든 서브에이전트에 대해,

**but switch every subagent's tool_choice**
하지만 모든 서브에이전트의 tool_choice를 변경합니다

**to {"type": "none"}**
{"type": "none"}으로

**so no subagent can call tools directly,**
어떤 서브에이전트도 직접 도구를 호출할 수 없도록 하여,

**requiring the coordinator**
코디네이터가 요구되도록 하면서

**to invoke tools on its behalf.**
대신 도구를 호출해 주는 것이.

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
Option A (오답): `{"type": "any"}`는 턴마다 무조건 아무 도구나 하나 이상 호출하도록 강제하므로, 도구를 사용하지 않고 텍스트로 응답(respond)하려는 자율적 결정을 불가능하게 만듭니다. 또한 15개 전체 도구를 유지하면 도구 오용 문제가 해결되지 않습니다.
Option B (오답): 특정 도구 단 하나로 `tool_choice`를 고정하면 에이전트가 도구를 쓰지 않고 일반 텍스트로 응답하는 옵션이 차단되며, 다양한 도구를 상황에 맞게 선택할 수 없게 됩니다.
Option D (오답): `{"type": "none"}`으로 설정하면 서브에이전트가 도구를 전혀 사용할 수 없어 에이전트 본연의 자율적 동작 및 도구 호출 수행 능력(act)이 상실됩니다.


---


# 14번 문제

**1. 문제 원문**

A developer is building an assistant that must force tool use on every user turn. All requests require either current data or an action, so the model must never answer directly from its own knowledge. Which tool_choice configuration matches this requirement?

A) tool_choice: {"type": "any"}, so the model must select and call at least one of the provided tools on every turn

B) tool_choice: {"type": "none"}, so the model can describe what it would do but never actually calls a tool

C) tool_choice: {"type": "tool", "name": "answer_directly"}, forcing a fixed response-generation tool each turn

D) tool_choice: {"type": "auto"}, letting the model decide per turn whether to call a tool or respond directly

---

**2. 구간별 직독직해 번역**

**QUESTION / SCENARIO:**

**A developer is building**  
한 개발자가 구축하고 있습니다  

**an assistant**  
어시스턴트를  

**that must force tool use**  
도구 사용을 강제해야 하는  

**on every user turn.**  
사용자의 매 턴마다.  

**All requests require**  
모든 요청은 요구합니다  

**either current data**  
최신 데이터나  

**or an action,**  
또는 작업 수행을,  

**so the model must never answer**  
따라서 모델은 결코 답변해서는 안 됩니다  

**directly from its own knowledge.**  
자체의 지식으로부터 직접.  

**Which tool_choice configuration**  
어떤 tool_choice 설정이  

**matches this requirement?**  
이 요구사항에 부합합니까?  

---

**OPTIONS:**

**A)**  
**tool_choice: {"type": "any"},**  
tool_choice: {"type": "any"},  

**so the model must select**  
따라서 모델은 선택해야만 합니다  

**and call at least one**  
그리고 최소 하나를 호출해야 합니다  

**of the provided tools**  
제공된 도구들 중  

**on every turn**  
매 턴마다.  

**B)**  
**tool_choice: {"type": "none"},**  
tool_choice: {"type": "none"},  

**so the model can describe**  
따라서 모델은 설명할 수 있습니다  

**what it would do**  
무엇을 할 것인지를  

**but never actually calls a tool**  
하지만 결코 실제로 도구를 호출하지는 않습니다.  

**C)**  
**tool_choice: {"type": "tool", "name": "answer_directly"},**  
tool_choice: {"type": "tool", "name": "answer_directly"},  

**forcing a fixed response-generation tool**  
고정된 응답 생성 도구를 강제하면서  

**each turn**  
매 턴마다.  

**D)**  
**tool_choice: {"type": "auto"},**  
tool_choice: {"type": "auto"},  

**letting the model decide per turn**  
모델이 턴마다 결정하도록 허용하면서  

**whether to call a tool**  
도구를 호출할지  

**or respond directly**  
또는 직접 응답할지를.  

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
Option B (오답): `{"type": "none"}`은 도구 호출을 금지하고 텍스트 직접 응답만 허용하므로, 도구 사용을 강제해야 하는 요구사항과 정반대로 동작합니다.
Option C (오답): `{"type": "tool", "name": "answer_directly"}` 방식은 가상의 단일 특정 도구 하나만을 강제로 호출하게 만듭니다. 다양한 최신 데이터 조회 및 액션 도구 중 상황에 맞게 선택하여 사용해야 하는 유스케이스에 부합하지 않습니다.
Option D (오답): `{"type": "auto"}`는 모델이 도구를 사용할지, 아니면 자체 지식으로 직접 응답할지 판단을 맡기므로 모델이 도구 없이 직접 답변해 버릴 위험이 존재합니다.


---


# 15번 문제

**1. 문제 원문**

A custom MCP server dynamically adds a new tool partway through a long-running session, based on state changes on its own backend. The server sends the appropriate MCP notification for this. What should the architect expect Claude Code to do, without any manual reconnect?

A) Ignore the `list_changed` notification and continue with the initial tool set, as tools are only loaded at session start and no dynamic refresh is supported.

B) Require the user to run `/mcp` and manually select "Refresh tools" before the newly added tool becomes available, since the tool list updates only on manual refresh.

C) Disconnect from the server and silently reconnect in the background, discarding any in-flight tool calls, then rely on the reconnect to pick up the new tool list.

D) It will automatically refresh the tools from that server after receiving its `list_changed` notification, making the new tool usable without a disconnect.

---

**2. 구간별 직독직해 번역**

**QUESTION / SCENARIO:**

**A custom MCP server**
커스텀 MCP 서버가

**dynamically adds a new tool**
동적으로 새 도구를 추가합니다

**partway through a long-running session,**
장시간 실행되는 세션 중간에,

**based on state changes**
상태 변화에 기반하여

**on its own backend.**
자신의 백엔드에서의.

**The server sends**
서버는 전송합니다

**the appropriate MCP notification for this.**
이를 위한 적절한 MCP 알림을.

**What should the architect expect**
아키텍트는 무엇을 기대해야 합니까

**Claude Code to do,**
Claude Code가 수행할 것으로,

**without any manual reconnect?**
수동 재연결 없이?

---

**OPTIONS:**

**A)**
**Ignore the list_changed notification**
`list_changed` 알림을 무시하고

**and continue with the initial tool set,**
초기 도구 세트로 계속 진행하는 것,

**as tools are only loaded**
도구는 오직 로드되기 때문에

**at session start**
세션 시작 시에만

**and no dynamic refresh is supported.**
그리고 동적 새로고침이 지원되지 않으므로.

**B)**
**Require the user to run /mcp**
사용자가 `/mcp`를 실행하도록 요구하고

**and manually select "Refresh tools"**
수동으로 "Refresh tools"를 선택하도록 하는 것

**before the newly added tool**
새롭게 추가된 도구가

**becomes available,**
사용 가능해지기 전에,

**since the tool list updates**
도구 목록 업데이트는 오직

**only on manual refresh.**
수동 새로고침 시에만 이루어지므로.

**C)**
**Disconnect from the server**
서버와의 연결을 끊고

**and silently reconnect in the background,**
백그라운드에서 알리지 않고 재연결하는 것,

**discarding any in-flight tool calls,**
진행 중인 모든 도구 호출을 파기하면서,

**then rely on the reconnect**
그런 다음 재연결에 의존하는 것

**to pick up the new tool list.**
새 도구 목록을 가져오기 위해.

**D)**
**It will automatically refresh the tools**
도구들을 자동으로 새로고침할 것입니다

**from that server**
해당 서버로부터

**after receiving its list_changed notification,**
`list_changed` 알림을 받은 후,

**making the new tool usable**
새 도구를 사용 가능하게 만들면서

**without a disconnect.**
연결 끊기 없이.

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
Option A (오답): MCP 프로토콜 및 Claude Code는 알림을 통한 동적 새로고침을 완벽히 지원하므로 알림을 무시한다는 설명은 틀렸습니다.
Option B (오답): 서버가 명시적으로 `list_changed` 알림을 전송한 경우 클라이언트가 이를 감지하여 자동 처리하므로 사용자가 `/mcp` 명령어로 수동 조작할 필요가 없습니다.
Option C (오답): 도구 목록 재조회를 위해 진행 중인 작업을 파기하거나 서버 연결을 강제로 끊었다가 재연결(Disconnect & Reconnect)하는 방식은 비효율적이며 MCP 사양에 맞지 않는 동작입니다.