### 문제 43

**1. 문제 원문**

A prompt combines lengthy background context, formatting instructions, several worked examples, and the user's actual request into a single message. The model occasionally treats part of a worked example as if it were the live user request, producing an oddly literal response to sample data instead of the real query. What change would most directly resolve this confusion?

A) Move all worked examples to the end of the prompt, right after the user's actual request

B) Rewrite each example as a short bullet point instead of a full input-output pair

C) Remove the examples and describe their content in a summary paragraph up front

D) Wrap each example in its own example tag, and the whole set in an outer examples tag

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**A prompt combines**
프롬프트는 결합합니다

**lengthy background context,**
긴 배경 문맥과

**formatting instructions,**
서식 지정 지침,

**several worked examples,**
몇 가지 예시 작성 사례,

**and the user's actual request**
그리고 사용자 실제 요청을

**into a single message.**
단일 메시지로.

**The model occasionally treats**
모델은 때때로 처리합니다

**part of a worked example**
예시의 일부를

**as if it were**
마치 ~인 것처럼

**the live user request,**
실제 사용자 요청인 것처럼,

**producing an oddly literal response**
이상할 정도로 지극히 글자 그대로의 응답을 생성하면서

**to sample data**
샘플 데이터에 대하여

**instead of the real query.**
실제 질문 대신에.

**What change**
어떤 변경이

**would most directly resolve**
가장 직접적으로 해결할 것인가

**this confusion?**
이 혼란을?

---

**OPTIONS:**

**A) Move all worked examples**
모든 작성된 예시를 이동시킨다

**to the end of the prompt,**
프롬프트의 맨 끝으로,

**right after the user's actual request**
사용자의 실제 요청 바로 뒤로

---

**B) Rewrite each example**
각 예시를 다시 작성한다

**as a short bullet point**
짧은 불릿 포인트 형태로

**instead of a full input-output pair**
전체 입력-출력 쌍 대신에

---

**C) Remove the examples**
예시들을 제거하고

**and describe their content**
그 내용을 설명한다

**in a summary paragraph up front**
앞부분의 요약 단락에서

---

**D) Wrap each example**
각 예시를 감싼다

**in its own example tag,**
개별 `<example>` 태그로,

**and the whole set**
그리고 전체 세트를

**in an outer examples tag**
바깥쪽 `<examples>` 태그로

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
D번: Wrap each example in its own example tag, and the whole set in an outer examples tag

정답 및 해설:

핵심 개념: XML 태그를 활용한 프롬프트 구조화 (Prompt Structuring with XML Tags)
프롬프트 내에 배경 지식, 예시(Few-shot examples), 실제 입력값 등이 혼재되어 있을 때, XML 태그(`<examples>`, `<example>`)를 사용해 구분을 명확히 해주면 각 요소의 역할(지침/예시/실제 입력)을 모델이 가장 정확하게 인지합니다.

문제 상황 분석:
- 프롬프트 하나에 긴 배경 문맥, 서식 지침, 예시 데이터, 실제 사용자 요청이 한꺼번에 작성되어 있음.
- 모델이 예시 데이터를 실제 실행해야 하는 요청으로 오인하여 예시 데이터에 대한 답을 내놓음.
- 예시 영역과 실제 요청 영역의 구조적/경계적 구분이 모호하여 발생하는 현상임.

D번이 정답인 이유:
각 예시를 `<example>...</example>` 태그로 감싸고, 전체 예시 집합을 `<examples>...</examples>` 태그로 구조화하면 프롬프트 내 구조적 경계가 명확해집니다. 이를 통해 모델은 해당 구역이 단지 참고용 예시 데이터일 뿐이며, 진짜 실행해야 하는 명령은 태그 외부의 사용자 요청이라는 것을 완벽하게 인지하게 됩니다.

오답 분석:
- Option A (오답): 예시를 실제 요청 뒤로 보낸다고 해서 예시와 요청 간의 경계가 명확해지지 않으며, 마지막에 위치한 예시를 오히려 최종 명령으로 오인할 위험이 있습니다.
- Option B (오답): 요약된 불릿 포인트로 변경하면 예시의 명확성(Few-shot 학습 효과)이 떨어질 뿐만 아니라, 텍스트 형태의 모호성이 완전히 해결되지 않습니다.
- Option C (오답): 예시를 제거하면 Few-shot 프롬프팅을 통한 출력 품질 향상 효과를 얻을 수 없게 됩니다.

---

### 문제 44

**1. 문제 원문**

A team is building a pipeline that asks Claude to read free-form support tickets and return a JSON object with fields like priority, category, and summary. Early prototypes used a prompt asking Claude to "reply with only JSON", but downstream parsing occasionally failed on malformed brackets and stray commentary text. Which approach most reliably eliminates these JSON syntax failures?

A) Append a stricter instruction to the system prompt demanding that Claude output valid JSON and nothing else, then retry the request whenever parsing fails

B) Lower the temperature parameter to 0 so that Claude's text completions become more deterministic and less prone to formatting mistakes

C) Define an extraction tool with an input_schema describing the fields, and parse the structured arguments from the resulting tool_use block instead of parsing free text

D) Ask Claude to wrap its JSON output in triple backticks and strip the backticks during post-processing before parsing the remaining text

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**A team is building**
한 팀이 구축하고 있습니다

**a pipeline**
파이프라인을

**that asks Claude**
Claude에게 요청하는

**to read free-form support tickets**
자유 형식의 지원 티켓을 읽고

**and return a JSON object**
JSON 객체를 반환하도록

**with fields like priority,**
우선순위와 같은 필드를 가진

**category, and summary.**
카테고리, 그리고 요약.

**Early prototypes used a prompt**
초기 프로토타입은 프롬프트를 사용했습니다

**asking Claude to**
Claude에게 ~하도록 요청하는

**"reply with only JSON",**
"JSON으로만 응답하라"고,

**but downstream parsing**
하지만 하류 파싱 과정에서

**occasionally failed**
때때로 실패했습니다

**on malformed brackets**
잘못된 형식의 괄호와

**and stray commentary text.**
불필요한 주석 텍스트 때문에.

**Which approach**
어떤 접근 방식이

**most reliably eliminates**
가장 확실하게 제거하는가

**these JSON syntax failures?**
이러한 JSON 구문 오류들을?

---

**OPTIONS:**

**A) Append a stricter instruction**
더 엄격한 지침을 추가한다

**to the system prompt**
시스템 프롬프트에

**demanding that Claude output valid JSON**
Claude가 유효한 JSON을 출력하도록 요구하며

**and nothing else,**
그리고 다른 것은 출력하지 않도록,

**then retry the request**
그런 다음 요청을 재시도한다

**whenever parsing fails**
파싱이 실패할 때마다

---

**B) Lower the temperature parameter**
온도(temperature) 파라미터를 낮춘다

**to 0**
0으로

**so that Claude's text completions**
Claude의 텍스트 완성이 ~하도록

**become more deterministic**
더 결정론적이 되고

**and less prone to formatting mistakes**
서식 오류가 발생할 가능성이 줄어들도록

---

**C) Define an extraction tool**
추출 도구를 정의한다

**with an input_schema**
input_schema를 가진

**describing the fields,**
필드들을 설명하는,

**and parse the structured arguments**
그리고 구조화된 인자를 파싱한다

**from the resulting tool_use block**
결과로 나오는 tool_use 블록으로부터

**instead of parsing free text**
자유 텍스트를 파싱하는 대신

---

**D) Ask Claude to wrap**
Claude에게 감싸도록 요청한다

**its JSON output**
JSON 출력을

**in triple backticks**
세 개의 백틱으로

**and strip the backticks**
그리고 백틱을 제거한다

**during post-processing**
후처리 과정에서

**before parsing the remaining text**
남은 텍스트를 파싱하기 전에

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
C번: Define an extraction tool with an input_schema describing the fields, and parse the structured arguments from the resulting tool_use block instead of parsing free text

정답 및 해설:

핵심 개념: 도구 호출(Tool Use / Function Calling)을 통한 구조화된 데이터 추출
LLM에서 신뢰할 수 있는 JSON/구조화된 데이터를 얻는 가장 확실한 방법은 일반 텍스트 생성을 구걸하거나 지시하는 대신, 도구(Tool/Function)의 `input_schema`에 JSON 스키마를 정의하고 모델이 해당 도구를 호출하게 만들어 `tool_use` 블록의 인자를 가져오는 것입니다.

문제 상황 분석:
- 자유 형식의 텍스트 생성 시 "JSON으로만 응답하라"는 자연어 지시만으로는 문법 오류나 사족 텍스트(주석) 발생을 완전히 막을 수 없음.
- 백틱이나 재시도 로직 등의 부차적인 방법은 파싱 실패율을 낮출 수는 있어도 근본적인 구조적 보장을 제공하지 못함.
- 따라서 텍스트 파싱 방식이 아닌 API 레벨에서 보장되는 구조화된 형식 출력이 필요한 상황임.

C번이 정답인 이유:
도구(Tool)를 정의하고 필드 스키마(`input_schema`)를 명시하면, Claude API는 모델이 전달하는 파라미터가 해당 스키마 구조를 따르도록 유도하고 `tool_use` JSON 블록으로 엄격하게 반환합니다. 이를 통해 자유 텍스트 생성 시 발생하는 구문 오류(잘못된 괄호, 사족 텍스트 등)를 근본적으로 방지하고 가장 높은 신뢰도로 JSON을 추출할 수 있습니다.

오답 분석:
- Option A (오답): 시스템 프롬프트를 더 엄격하게 작성하고 재시도(Retry)하는 방식은 비용과 지연시간(Latency)을 증가시키며, 구문 오류의 근본적 발생을 막지 못합니다.
- Option B (오답): `temperature`를 0으로 설정하면 출력이 더 결정론적(deterministic)으로 바뀌어 변동성은 줄어들지만, JSON 구문 오류나 서문/후문 텍스트 작성을 완전히 차단하는 기술적 보장책이 되지 못합니다.
- Option D (오답): 백틱(```)으로 감싸는 규칙을 추가하더라도 여전히 자유 텍스트 생성 방식에 의존하므로 내부 JSON의 괄호 누락이나 문법 오류를 완벽히 해결할 수 없습니다.

---

### 문제 45

**1. 문제 원문**

A tool extracts a paper's 'sample size' and 'statistical method' fields. Some papers place this information in a clearly labeled Methodology section, while others embed it in a sentence within the Results or Discussion section without any nearby heading. The tool reliably extracts from labeled Methodology sections but frequently returns null when the same information is embedded elsewhere. What is the best fix?

A) Increase the model's context window to ensure it reads the entire paper rather than a truncated excerpt.

B) Exclude any paper that lacks a labeled Methodology section from the extraction pipeline.

C) Provide the model with extraction examples from both a labeled Methodology section and from an embedded sentence in Results, demonstrating how to extract the fields in both cases.

D) Configure the tool to first search the Methodology section, and only fall back to other sections if the fields are missing.

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**A tool extracts**
도구가 추출합니다

**a paper's 'sample size'**
논문의 '표본 크기'와

**and 'statistical method' fields.**
'통계적 방법' 필드를.

**Some papers place**
일부 논문은 배치합니다

**this information**
이 정보를

**in a clearly labeled**
명확하게 레이블이 지정된

**Methodology section,**
Methodology(연구 방법론) 섹션에,

**while others embed it**
반면에 다른 논문들은 이를 포함시킵니다

**in a sentence**
문장 내에

**within the Results**
Results(결과) 또는

**or Discussion section**
Discussion(고찰) 섹션 안의

**without any nearby heading.**
인근에 헤딩(제목)이 전혀 없이.

**The tool reliably extracts**
그 도구는 신뢰성 있게 추출합니다

**from labeled Methodology sections**
레이블이 지정된 Methodology 섹션에서는

**but frequently returns null**
하지만 자주 null(빈 값)을 반환합니다

**when the same information**
동일한 정보가

**is embedded elsewhere.**
다른 곳에 포함되어 있을 때.

**What is the best fix?**
가장 좋은 해결책은 무엇인가?

---

**OPTIONS:**

**A) Increase the model's context window**
모델의 컨텍스트 창을 늘린다

**to ensure it reads**
모델이 반드시 읽도록

**the entire paper**
논문 전체를

**rather than a truncated excerpt.**
잘려진 발췌본 대신에.

---

**B) Exclude any paper**
모든 논문을 제외한다

**that lacks a labeled Methodology section**
레이블이 지정된 Methodology 섹션이 없는

**from the extraction pipeline.**
추출 파이프라인에서.

---

**C) Provide the model**
모델에게 제공한다

**with extraction examples**
추출 예시들을

**from both a labeled Methodology section**
레이블이 지정된 Methodology 섹션과

**and from an embedded sentence in Results,**
Results 내의 문장 형태 모두로부터의,

**demonstrating how to extract the fields**
필드를 추출하는 방법을 보여주면서

**in both cases.**
두 경우 모두에서.

---

**D) Configure the tool**
도구를 설정한다

**to first search the Methodology section,**
먼저 Methodology 섹션을 검색하도록,

**and only fall back to other sections**
그리고 다른 섹션으로 대체하도록(폴백)

**if the fields are missing.**
필드가 누락된 경우에만.

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
C번: Provide the model with extraction examples from both a labeled Methodology section and from an embedded sentence in Results, demonstrating how to extract the fields in both cases.

정답 및 해설:

핵심 개념: Few-Shot 퓨샷 프롬프팅 (Diverse Example Demonstration)
LLM 기반 추출 도구가 특정 형식이나 위치(예: 명확한 섹션 헤딩)에 편향되어 일관성이 떨어질 때, 다양한 컨텍스트 및 예시 패턴(Few-shot examples)을 제공하면 모델의 가다듬어진 패턴 인식 능력이 대폭 향상됩니다.

문제 상황 분석:
- 추출 도구가 명확한 Methodology 섹션이 있는 논문에서는 정보를 잘 추출함.
- 헤딩 없이 Results나 Discussion 내부 문장에 자연어로 묻혀 있는 정보는 인식하지 못하고 `null`을 반환함.
- 문제의 원인은 모델이 헤딩 구조에만 의존하는 편향(Bias)이 생겼거나, 비구조화된 일반 문장 내 추출 예시 학습 부족 때문임.

C번이 정답인 이유:
명확한 Methodology 섹션에서 추출하는 예시뿐만 아니라, Results/Discussion 내부 문장에서 정보를 추출하는 다양한 유형의 예시(Few-shot)를 프롬프트에 제공함으로써 모델에게 두 패턴 모두에서 필드를 식별하고 추출하는 방법을 학습시킬 수 있습니다. 이는 다양하고 엣지 있는 패턴에 대한 추출 성능을 가장 안정적으로 개선하는 방법입니다.

오답 분석:
- Option A (오답): 문제 원인은 잘린 텍스트 때문이 아니라 다른 위치/형태의 텍스트 패턴을 인식하지 못하는 패턴 인지 문제입니다. 컨텍스트 창 크기를 늘리는 것으로는 다양성 부족 문제를 해결하지 못합니다.
- Option B (오답): 지정된 섹션이 없다고 논문을 제외해 버리는 것은 시스템 지원 범위를 임의로 축소하는 잘못된 우회책입니다.
- Option D (오답): 본문 문제는 정보의 단순 검색 순서가 아니라, 비구조화된 문장 형태(embedded sentence)로 작성된 정보 자체를 모델이 알아채고 추출하지 못한다는 점입니다. 단순히 검색 순서를 fall back 방식으로 바꾸는 알고리즘 설정만으로는 내부 추출 실패 문제를 해결하지 못합니다.

---

### 문제 46

**1. 문제 원문**

A reviewer flags a docstring that says "returns the cached value if present, otherwise fetches from the API," but the function under review always calls the API regardless of a cache. Under an explicit-criteria rule that only flags comments contradicted by actual code behavior, should this finding be reported?

A) No, because docstrings describe intent rather than guaranteed behavior, so a mismatch with the current implementation is not a reportable contradiction.

B) Yes, but only if the function is called from more than one place in the codebase, since single-use functions are exempt from this criterion.

C) Yes, because the docstring makes a specific, checkable claim about caching behavior that the code's actual control flow directly contradicts.

D) No, because caching behavior is an implementation detail, and implementation details are excluded from comment-accuracy review by definition.

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**A reviewer flags**  
검토자가 지적합니다  

**a docstring that says**  
~라고 적힌 독스트링(docstring)을  

**"returns the cached value if present,**  
"캐시된 값이 존재하면 해당 값을 반환하고,  

**otherwise fetches from the API,"**  
그렇지 않으면 API에서 가져온다"는,  

**but the function under review**  
하지만 검토 중인 함수는  

**always calls the API**  
항상 API를 호출합니다  

**regardless of a cache.**  
캐시의 여부와 상관없이.  

**Under an explicit-criteria rule**  
명확한 기준 규칙 하에서  

**that only flags comments**  
주석만을 지적하도록 하는  

**contradicted by actual code behavior,**  
실제 코드 동작과 모순되는,  

**should this finding be reported?**  
이 지적 사항은 보고되어야 합니까?  

---

**OPTIONS:**

**A) No, because docstrings describe intent**  
아닙니다, 독스트링은 의도를 설명하기 때문에  

**rather than guaranteed behavior,**  
보장된 동작보다는,  

**so a mismatch**  
따라서 불일치는  

**with the current implementation**  
현재 구현과의  

**is not a reportable contradiction.**  
보고 대상인 모순이 아닙니다.  

---

**B) Yes, but only if the function**  
예, 하지만 해당 함수가  

**is called from more than one place**  
두 곳 이상에서 호출되는 경우에만,  

**in the codebase,**  
코드베이스 내에서,  

**since single-use functions**  
단일 사용 함수는 ~하기 때문입니다  

**are exempt from this criterion.**  
이 기준에서 면제되기 때문입니다.  

---

**C) Yes, because the docstring makes**  
예, 독스트링이 작성되어 있기 때문입니다  

**a specific, checkable claim**  
구체적이고 검증 가능한 주장을  

**about caching behavior**  
캐싱 동작에 대해  

**that the code's actual control flow**  
코드의 실제 제어 흐름이  

**directly contradicts.**  
직접적으로 모순되는.  

---

**D) No, because caching behavior**  
아닙니다, 캐싱 동작은 ~이기 때문입니다  

**is an implementation detail,**  
구현 세부 사항이며,  

**and implementation details are excluded**  
구현 세부 사항은 제외되기 때문입니다  

**from comment-accuracy review**  
주석 정확도 검토에서  

**by definition.**  
정의상.  

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
C번: Yes, because the docstring makes a specific, checkable claim about caching behavior that the code's actual control flow directly contradicts.

정답 및 해설:

핵심 개념: 코드 주석 정확도 및 명확한 검토 기준 (Code Comment Accuracy & Explicit Review Criteria)  
자동화된 코드 검토 시스템이나 규칙 기반 리뷰어는 "실제 코드 동작과 직접적으로 모순되는 주석"만을 지적하도록 명시적 규칙을 적용합니다. 주석에 기재된 명확한 동작 설명이 코드의 실제 제어 흐름(Control Flow)과 일치하지 않는 경우, 이는 명백한 보고 대상 오류에 해당합니다.

문제 상황 분석:
- 독스트링은 "캐시가 있으면 캐시 값을 반환하고, 없으면 API를 호출한다"고 명시함.
- 그러나 실제 작성된 코드는 캐시 존재 여부를 확인하지 않고 항상 API를 호출함.
- 검토 규정은 "실제 코드 동작과 모순(contradict)되는 주석만 지적한다"는 명확한 기준(explicit-criteria rule)을 따르고 있음.

C번이 정답인 이유:
독스트링에 작성된 설명은 "캐싱 조건부 동작"이라는 구체적이고 코드상에서 검증 가능한(checkable) 내용을 담고 있습니다. 하지만 실제 코드의 제어 흐름은 캐시 확인 없이 항상 API를 호출하므로 독스트링의 내용과 직접적으로 충돌하며 모순됩니다. 따라서 주어진 명확한 검토 규칙에 따라 이 지적 사항은 보고(reported)되어야 합니다.

오답 분석:
- Option A (오답): 독스트링이 의도를 나타낸다 하더라도, 명시된 조건부 캐싱 동작과 실제 항상 API를 호출하는 구현 간의 직접적인 모순은 규칙상 명백한 지적 대상입니다.
- Option B (오답): 함수가 코드베이스에서 호출되는 횟수(단일 사용 여부)는 주석-코드 모순 여부를 판단하는 기준에 해당하지 않습니다.
- Option D (오답): 독스트링에 특정 캐싱 제어 흐름을 명시적으로 서술해 두었다면 이는 단순 구현 세부 사항을 넘어 외부 호출자가 기대하는 함수의 동작 계약(Contract)에 해당하므로, 실제 코드와 다를 경우 지적 대상입니다.

---

### 문제 47

**1. 문제 원문**

A logistics company ingests shipment confirmation emails from many different carriers. Dates appear as `03/14/2026`, `14-Mar-2026`, and `2026.03.14` depending on the carrier, but the extraction schema defines `ship_date` as a string with a strict ISO 8601 pattern. Extractions frequently fail schema validation because the source dates don't match the expected format. According to the current Anthropic official guidance, what is the most effective fix?

A) Retain the strict ISO 8601 schema constraint for `ship_date` and add an explicit `description` in the JSON schema telling Claude to parse and normalize the carrier date string to ISO 8601 format (e.g., `YYYY-MM-DD`).

B) Remove the `ship_date` field from the extraction schema and infer the shipment date later from other fields such as tracking number lookup or email metadata.

C) Loosen the schema to accept any string for `ship_date`, and add a downstream step that uses a date parser to normalize the value to ISO 8601 format before storing it in the database.

D) Split `ship_date` into three fields such as `ship_date_us`, `ship_date_eu`, and `ship_date_iso`, each expecting a different carrier date format, and populate only the one matching the extracted string.

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**A logistics company ingests**  
한 물류 회사가 수집합니다  

**shipment confirmation emails**  
배송 확인 이메일을  

**from many different carriers.**  
여러 다양한 운송사로부터.  

**Dates appear as**  
날짜는 ~로 표시됩니다  

**`03/14/2026`, `14-Mar-2026`, and `2026.03.14`**  
`03/14/2026`, `14-Mar-2026`, 그리고 `2026.03.14`로  

**depending on the carrier,**  
운송사에 따라,  

**but the extraction schema defines**  
하지만 추출 스키마는 정의합니다  

**`ship_date` as a string**  
`ship_date`를 문자열로  

**with a strict ISO 8601 pattern.**  
엄격한 ISO 8601 패턴을 가진.  

**Extractions frequently fail**  
추출이 자주 실패합니다  

**schema validation**  
스키마 유효성 검사에서  

**because the source dates**  
원본 날짜가 ~하기 때문에  

**don't match the expected format.**  
예상되는 형식과 일치하지 않기 때문에.  

**According to the current**  
최신 ~에 따르면  

**Anthropic official guidance,**  
Anthropic 공식 가이드라인에,  

**what is the most effective fix?**  
가장 효과적인 해결책은 무엇인가?  

---

**OPTIONS:**

**A) Retain the strict ISO 8601**  
엄격한 ISO 8601을 유지한다  

**schema constraint for `ship_date`**  
`ship_date`에 대한 스키마 제약 조건으로  

**and add an explicit `description`**  
그리고 명시적인 `description`을 추가한다  

**in the JSON schema**  
JSON 스키마 내에  

**telling Claude to parse and normalize**  
Claude에게 파싱하고 정규화하도록 알려주는  

**the carrier date string**  
운송사 날짜 문자열을  

**to ISO 8601 format (e.g., `YYYY-MM-DD`).**  
ISO 8601 형식(예: `YYYY-MM-DD`)으로.  

---

**B) Remove the `ship_date` field**  
`ship_date` 필드를 제거한다  

**from the extraction schema**  
추출 스키마에서  

**and infer the shipment date later**  
그리고 배송 날짜를 나중에 추론한다  

**from other fields**  
다른 필드들로부터  

**such as tracking number lookup**  
운송장 번호 조회나  

**or email metadata.**  
이메일 메타데이터와 같은.  

---

**C) Loosen the schema**  
스키마를 완화한다  

**to accept any string for `ship_date`,**  
`ship_date`에 어떤 문자열이든 허용하도록,  

**and add a downstream step**  
그리고 하류(후속) 단계를 추가한다  

**that uses a date parser**  
날짜 파서를 사용하는  

**to normalize the value to ISO 8601 format**  
값을 ISO 8601 형식으로 정규화하기 위해  

**before storing it in the database.**  
데이터베이스에 저장하기 전에.  

---

**D) Split `ship_date`**  
`ship_date`를 분할한다  

**into three fields**  
세 개의 필드로  

**such as `ship_date_us`, `ship_date_eu`, and `ship_date_iso`,**  
`ship_date_us`, `ship_date_eu`, `ship_date_iso`와 같은,  

**each expecting a different carrier date format,**  
각각 서로 다른 운송사 날짜 형식을 기대하는,  

**and populate only the one**  
그리고 하나만 채운다  

**matching the extracted string.**  
추출된 문자열과 일치하는.  

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
C번: Loosen the schema to accept any string for `ship_date`, and add a downstream step that uses a date parser to normalize the value to ISO 8601 format before storing it in the database.

정답 및 해설:

핵심 개념: LLM 추출과 후속 정규화의 역할 분리 (Decoupling LLM Extraction & Deterministic Parsing)  
Anthropic의 공식 가이드라인에 따르면 다양한 비구조화 포맷을 가진 데이터를 추출할 때 스키마 레벨에서 엄격한 포맷 검증(Regex/Pattern)을 강제하면 스키마 유효성 검사 실패율이 높아집니다. 스키마 제약조건은 일반 문자열(`type: string`)로 완화하여 추출 성공률을 높이고, 정규화(Normalization)는 후속 애플리케이션 코드(Date Parser)에 위임하는 것이 가장 정석적인 설계입니다.

문제 상황 분석:
- 이메일 원본의 날짜 포맷이 운송사별로 상이함 (`03/14/2026`, `14-Mar-2026`, `2026.03.14`).
- 추출 스키마에서 `ship_date`에 엄격한 ISO 8601 패턴을 적용하여 유효성 검사 오류가 지속 발생함.
- 모델의 자연어 추출 능력과 엄격한 스키마 검증 간의 충돌로 인해 시스템 신뢰도가 저하됨.

C번이 정답인 이유:
`ship_date` 스키마 제약을 단순 문자열로 완화(Loosen)하면 모델이 이메일의 날짜를 실패 없이 원문 그대로 가져올 수 있습니다. 이후 데이터베이스 저장 직전 단계(Downstream)에서 검증된 날짜 파서 라이브러리를 사용해 ISO 8601 포맷으로 변환하면, 스키마 유효성 검사 실패를 원천적으로 방지하고 안전하게 정규화된 데이터를 확보할 수 있습니다.

오답 분석:
- Option A (오답): 스키마 `description`에 정규화 지침을 제공하더라도, 엄격한 패턴 검증 규칙을 유지하면 모델이 비구조화 데이터를 인코딩하는 과정에서 여전히 스키마 유효성 검사 실패가 자주 발생합니다.
- Option B (오답): 이메일 본문에 존재하는 핵심 데이터(`ship_date`) 추출을 포기하고 외부 조회나 메타데이터에 의존하는 것은 불필요한 복잡성을 유발하고 본래의 추출 목적을 달성하지 못합니다.
- Option D (오답): 날짜 포맷별로 필드를 무분별하게 나누는 것은 데이터베이스 구조와 데이터 모델을 불필요하게 파편화하며 유지보수를 매우 어렵게 만듭니다.

---

### 문제 48

**1. 문제 원문**

The "performance suggestions" category in a code-review tool has a 70% false positive rate, and developers have stopped reading any findings from the tool at all, including from well-performing categories. The team needs to restore trust quickly while a better prompt for that category is developed over the following weeks. What is the recommended immediate action?

A) Temporarily disable the performance-suggestions category so developers see only the accurate categories, while iterating on that category's prompt separately before re-enabling it.

B) Lower the overall severity label on every performance finding to "informational" so that developers see them as advisory notes and can continue reviewing other accurate categories while the prompt is iterated on.

C) Merge the performance-suggestions category into the correctness category so that developers reviewing correctness findings also encounter performance suggestions, gradually rebuilding trust through repeated exposure.

D) Add a disclaimer banner on each code-review result indicating that certain categories have lower precision, so that developers can apply their own filtering criteria when reviewing findings across the project.

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**The "performance suggestions" category**  
"성능 제안" 카테고리는  

**in a code-review tool**  
코드 리뷰 도구의  

**has a 70% false positive rate,**  
70%의 오탐률(false positive rate)을 가지며,  

**and developers have stopped reading**  
개발자들은 읽는 것을 중단했습니다  

**any findings from the tool at all,**  
도구의 어떤 지적 사항도 전혀,  

**including from well-performing categories.**  
성능이 좋은 카테고리에서 나온 것을 포함하여.  

**The team needs to restore trust quickly**  
팀은 신뢰를 신속하게 회복해야 합니다  

**while a better prompt for that category**  
해당 카테고리를 위한 더 나은 프롬프트가  

**is developed over the following weeks.**  
다음 몇 주 동안 개발되는 동안.  

**What is the recommended immediate action?**  
권장되는 즉각적인 조치는 무엇입니까?  

---

**OPTIONS:**

**A) Temporarily disable**  
일시적으로 비활성화한다  

**the performance-suggestions category**  
성능 제안 카테고리를  

**so developers see only the accurate categories,**  
개발자들이 정확한 카테고리만 볼 수 있도록,  

**while iterating on that category's prompt separately**  
해당 카테고리의 프롬프트를 별도로 개선(반복)하는 동안  

**before re-enabling it.**  
다시 활성화하기 전에.  

---

**B) Lower the overall severity label**  
전체 심각도 레이블을 낮춘다  

**on every performance finding**  
모든 성능 지적 사항의  

**to "informational"**  
"정보성(informational)"으로  

**so that developers see them as advisory notes**  
개발자들이 이를 자문용 참고 사항으로 보고  

**and can continue reviewing**  
계속 검토할 수 있도록  

**other accurate categories**  
다른 정확한 카테고리들을  

**while the prompt is iterated on.**  
프롬프트가 개선되는 동안.  

---

**C) Merge the performance-suggestions category**  
성능 제안 카테고리를 병합한다  

**into the correctness category**  
정확성(correctness) 카테고리로  

**so that developers reviewing correctness findings**  
정확성 지적 사항을 검토하는 개발자들이  

**also encounter performance suggestions,**  
성능 제안도 함께 마주치게 하여,  

**gradually rebuilding trust**  
신뢰를 점진적으로 재구축하도록  

**through repeated exposure.**  
반복적인 노출을 통해.  

---

**D) Add a disclaimer banner**  
면책 배너(알림)를 추가한다  

**on each code-review result**  
각 코드 리뷰 결과에  

**indicating that certain categories**  
특정 카테고리가 ~임을 나타내는  

**have lower precision,**  
더 낮은 정밀도를 가지고 있음을,  

**so that developers can apply**  
개발자들이 적용할 수 있도록  

**their own filtering criteria**  
그들만의 필터링 기준을  

**when reviewing findings across the project.**  
프로젝트 전반의 지적 사항을 검토할 때.  

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
A번: Temporarily disable the performance-suggestions category so developers see only the accurate categories, while iterating on that category's prompt separately before re-enabling it.

정답 및 해설:

핵심 개념: 개발자 경험(DX) 및 AI 경고 피로도(Alert Fatigue) 관리  
AI 기반 개발 도구에서 높은 오탐률(70%)은 시스템 전체에 대한 "경고 피로도"를 유발하고 도구 자체에 대한 신뢰를 무너뜨립니다. 신뢰를 신속히 회복하기 위해서는 문제가 되는 알림 출처를 즉시 차단하고, 프롬프트 개선 작업이 완료된 후 재활성화하는 조치가 필요합니다.

문제 상황 분석:
- 코드 리뷰 도구의 특정 카테고리("성능 제안") 오탐률이 70%에 달함.
- 경고 피로도로 인해 개발자들이 올바르게 작동하는 다른 카테고리의 결과까지 완전히 무시하기 시작함.
- 향후 몇 주간 프롬프트를 개선할 예정인 상황에서, 개발자들의 신뢰를 즉시 회복할 수 있는 조치가 필요함.

A번이 정답인 이유:
문제가 되는 카테고리를 일시적으로 비활성화하면 개발자는 높은 정확도를 유지하는 나머지 카테고리의 결과만 보게 되므로 경고 피로도가 즉시 해소되고 도구에 대한 전체적인 신뢰를 빠르게 회복할 수 있습니다. 그동안 오탐률이 높은 프롬프트를 별도 환경에서 테스트 및 개선한 후 검증이 완료되었을 때 재활성화하는 것이 AI 품질 관리의 정석적인 절차입니다.

오답 분석:
- Option B (오답): 심각도를 "정보성"으로 낮추더라도 노이즈(오탐) 결과가 계속 출력되므로 개발자가 다른 카테고리 결과를 무시하는 행동을 멈추게 하지 못합니다.
- Option C (오답): 오탐률이 높은 결과를 잘 작동하는 "정확성" 카테고리에 섞어버리면, 정확성 카테고리에 대한 신뢰까지 함께 떨어뜨려 도구 전체를 더 오염시킵니다.
- Option D (오답): 면책 배너를 추가하고 필터링 책임을 개발자에게 넘기는 것은 개발자의 피로도를 전혀 줄여주지 못하며 도구 무시 현상을 해결할 수 없습니다.

---

### 문제 49

**1. 문제 원문**

An agent workflow needs Claude to request a database-lookup tool, receive the tool's result, and then reason over that result before producing a final answer, all within one logical exchange. A developer wants to run this exchange through the Message Batches API to save on cost. What is the key limitation that rules this out?

A) Batch requests limit each conversation to a single message, so a tool_use block and its follow-up reasoning cannot appear in one batched exchange, since each conversation must be self-contained.

B) Tool definitions cannot be attached to any request submitted through the Message Batches API, so the model never has the option to request a database-lookup tool during processing.

C) A single batch request cannot pause mid-processing to accept an application-supplied tool result, since each request resolves independently with no mid-request round trip.

D) The Message Batches API silently strips tool_use content blocks from responses, so the application never learns which tool the model wanted to call, leaving it unable to supply the required result.

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**An agent workflow needs**  
에이전트 워크플로는 요구합니다  

**Claude to request**  
Claude가 요청하기를  

**a database-lookup tool,**  
데이터베이스 조회 도구를,  

**receive the tool's result,**  
도구의 결과를 수신하기를,  

**and then reason over that result**  
그런 다음 그 결과에 대해 추론하기를  

**before producing a final answer,**  
최종 답변을 생성하기 전에,  

**all within one logical exchange.**  
이 모든 것을 하나의 논리적 교환 내에서.  

**A developer wants to run**  
한 개발자가 실행하기를 원합니다  

**this exchange**  
이 교환 과정을  

**through the Message Batches API**  
Message Batches API를 통해  

**to save on cost.**  
비용을 절감하기 위해.  

**What is the key limitation**  
주요 제약 사항은 무엇인가  

**that rules this out?**  
이것을 불가능하게 만드는?  

---

**OPTIONS:**

**A) Batch requests limit**  
배치 요청은 제한합니다  

**each conversation to a single message,**  
각 대화를 단일 메시지로,  

**so a tool_use block**  
따라서 tool_use 블록과  

**and its follow-up reasoning**  
그에 따른 후속 추론은  

**cannot appear in one batched exchange,**  
하나의 배치 교환 내에 나타날 수 없습니다,  

**since each conversation must be self-contained.**  
각 대화는 자체 완결적이어야 하기 때문에.  

---

**B) Tool definitions cannot be attached**  
도구 정의는 첨부될 수 없습니다  

**to any request submitted**  
제출된 어떤 요청에도  

**through the Message Batches API,**  
Message Batches API를 통해,  

**so the model never has the option**  
따라서 모델은 옵션을 전혀 갖지 못합니다  

**to request a database-lookup tool**  
데이터베이스 조회 도구를 요청할  

**during processing.**  
처리 도중에.  

---

**C) A single batch request cannot pause**  
단일 배치 요청은 일시 정지될 수 없습니다  

**mid-processing**  
처리 중간에  

**to accept an application-supplied tool result,**  
애플리케이션이 제공하는 도구 결과를 수락하기 위해,  

**since each request resolves independently**  
각 요청은 독립적으로 해결되기 때문에  

**with no mid-request round trip.**  
요청 중간의 왕복(round trip) 없이.  

---

**D) The Message Batches API silently strips**  
Message Batches API는 자동으로(조용히) 제거합니다  

**tool_use content blocks from responses,**  
응답에서 tool_use 콘텐츠 블록을,  

**so the application never learns**  
따라서 애플리케이션은 결코 알지 못합니다  

**which tool the model wanted to call,**  
모델이 어떤 도구를 호출하고 싶어 했는지,  

**leaving it unable to supply**  
제공할 수 없는 상태로 만들면서  

**the required result.**  
필요한 결과를.  

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
C번: A single batch request cannot pause mid-processing to accept an application-supplied tool result, since each request resolves independently with no mid-request round trip.

정답 및 해설:

핵심 개념: Message Batches API의 비동기적 특성 및 도구 호출 루프 (Message Batches API & Tool Use Loop)  
Anthropic의 Message Batches API는 비동기식(Asynchronous) 대량 요청 처리 API로, 50%의 비용 절감을 제공하지만 단일 네트워크 요청 내에서 실시간 왕복(Round-trip) 통신을 지원하지 않습니다. 에이전트의 도구 실행 워크플로는 [모델의 도구 호출 요청 -> 애플리케이션의 도구 실행 및 결과 반환 -> 모델의 후속 추론]이라는 동기적 다단계 피드백 루프가 필수적입니다.

문제 상황 분석:
- 에이전트 워크플로가 단일 교환 내에서 도구 실행 및 결과 수신, 최종 추론까지 완결되기를 요구함.
- 개발자가 비용 절감을 위해 이를 단일 Message Batches API 요청으로 처리하고자 함.
- 배치 처리의 구조상 실시간 중단 및 외부 결과 수신이 불가능하다는 제약 조건이 발생함.

C번이 정답인 이유:
단일 배치 API 요청은 독립적이고 단방향으로 실행됩니다. 처리 중간에 일시 정지(Pause)하여 외부 애플리케이션이 실행한 도구 결과(`tool_result`)를 전달받아 실행을 재개하는 '중간 왕복 통신'이 불가능하므로, 이러한 연속적인 에이전트 인터랙션을 단일 배치 요청 내에서 처리할 수 없습니다.

오답 분석:
- Option A (오답): 배치 요청에는 이전 대화 내역을 담은 여러 개의 메시지(`messages` 배열)를 포함할 수 있으므로 메시지 개수가 단 하나로 제한된다는 설명은 거짓입니다.
- Option B (오답): Message Batches API에서도 `tools` 파라미터를 사용하여 도구 정의를 정상적으로 첨부할 수 있습니다.
- Option D (오답): Batch API 응답에도 `tool_use` 블록이 정상적으로 포함되어 반환되며, 이를 임의로 무단 제거(strip)하지 않습니다.

---

### 문제 50

**1. 문제 원문**

An architect is redesigning review criteria for an internal Claude-based code review agent. The goal is to ensure that critical issues—such as security vulnerabilities and correctness bugs—are never missed, while avoiding noise from subjective preferences. The architect wants to define which issues should always be reported versus always skipped, rather than relying on the model's confidence to decide. Which pair of instructions correctly demonstrates this approach?

A) Report every change that deviates from the team's officially documented style guide; skip any change the model classifies as a subjective personal taste preference, even if it affects readability.

B) Report any finding where the model's internal confidence score exceeds a fixed threshold of 0.9; skip any finding where the confidence score is below that threshold, treating all categories uniformly.

C) Report a finding only after a second independent review pass confirms that the first pass's confidence score exceeds a fixed threshold; skip any finding where the passes disagree or the score is not duplicated.

D) Report any change that introduces a security vulnerability or a correctness bug that breaks existing behavior; skip formatting preferences and deviations from a file's established local conventions.

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**An architect is redesigning**  
한 아키텍트가 재설계하고 있습니다  

**review criteria**  
검토 기준을  

**for an internal Claude-based**  
사내 Claude 기반의  

**code review agent.**  
코드 리뷰 에이전트를 위한.  

**The goal is to ensure**  
목표는 반드시 보장하는 것입니다  

**that critical issues—**  
치명적인 문제들이—  

**such as security vulnerabilities**  
보안 취약점과  

**and correctness bugs—**  
정확성 버그와 같은—  

**are never missed,**  
절대 누락되지 않도록,  

**while avoiding noise**  
노이즈를 피하면서  

**from subjective preferences.**  
주관적인 선호도로 인한.  

**The architect wants to define**  
아키텍트는 정의하기를 원합니다  

**which issues should always be reported**  
어떤 문제가 항상 보고되어야 하는지  

**versus always skipped,**  
반면에 어떤 문제가 항상 건너뛰어져야 하는지를,  

**rather than relying on**  
~에 의존하기보다는  

**the model's confidence to decide.**  
결정하기 위해 모델의 신뢰도(confidence)에.  

**Which pair of instructions**  
어떤 지침 쌍이  

**correctly demonstrates**  
올바르게 보여주는가  

**this approach?**  
이러한 접근 방식을?  

---

**OPTIONS:**

**A) Report every change**  
모든 변경 사항을 보고한다  

**that deviates from the team's**  
팀의 기준에서 벗어나는  

**officially documented style guide;**  
공식 문서화된 스타일 가이드에서;  

**skip any change**  
모든 변경 사항을 건너뛴다  

**the model classifies**  
모델이 분류하는  

**as a subjective personal taste preference,**  
주관적인 개인 취향 선호도로,  

**even if it affects readability.**  
가독성에 영향을 미치더라도.  

---

**B) Report any finding**  
모든 지적 사항을 보고한다  

**where the model's internal confidence score**  
모델의 내부 신뢰도 점수가  

**exceeds a fixed threshold of 0.9;**  
0.9라는 고정된 임계값을 초과하는;  

**skip any finding**  
모든 지적 사항을 건너뛴다  

**where the confidence score**  
신뢰도 점수가  

**is below that threshold,**  
그 임계값 미만인,  

**treating all categories uniformly.**  
모든 카테고리를 균일하게 다루면서.  

---

**C) Report a finding only after**  
~한 후에만 지적 사항을 보고한다  

**a second independent review pass**  
두 번째 독립적인 검토 패스가  

**confirms that the first pass's**  
첫 번째 패스의 점수가 ~임을 확인한  

**confidence score exceeds a fixed threshold;**  
신뢰도 점수가 고정된 임계값을 초과함을;  

**skip any finding**  
모든 지적 사항을 건너뛴다  

**where the passes disagree**  
패스 간 의견이 불일치하거나  

**or the score is not duplicated.**  
점수가 중복(재현)되지 않는.  

---

**D) Report any change**  
모든 변경 사항을 보고한다  

**that introduces a security vulnerability**  
보안 취약점을 유발하거나  

**or a correctness bug**  
또는 정확성 버그를 유발하는  

**that breaks existing behavior;**  
기존 동작을 망가뜨리는;  

**skip formatting preferences**  
서식 선호도와  

**and deviations from a file's**  
파일의 기존 규칙에서 벗어난  

**established local conventions.**  
소규모 관례들을 건너뛴다.  

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
D번: Report any change that introduces a security vulnerability or a correctness bug that breaks existing behavior; skip formatting preferences and deviations from a file's established local conventions.

정답 및 해설:

핵심 개념: 명확한 범주 기반 프롬프트 지침 설계 (Category-Based Explicit Instructions vs. Confidence Thresholds)  
LLM 코드 리뷰 시스템에서 모델의 불확실한 신뢰도 점수(Confidence Score)에 의존하는 대신, 보고해야 할 중요 이슈(보안, 동작 버그)와 무시해야 할 노이즈(서식, 스타일 선호)의 범주를 프롬프트 상에 명시적 기준(Explicit Criteria)으로 직접 정의하는 것이 노이즈를 줄이고 정확도를 높이는 핵심 프롬프트 공학 기법입니다.

문제 상황 분석:
- AI 코드 리뷰어가 보안 취약점이나 올바름 버그 같은 치명적 문제는 절대 놓치지 않아야 함.
- 동시에 주관적 스타일 차이로 인한 소음(Noise)은 방지해야 함.
- 모델의 내부 신뢰도 점수에 판단을 맡기지 않고, "항상 보고할 항목"과 "항상 무시할 항목"을 프롬프트 레벨에서 명확히 분리하여 지시하고자 함.

D번이 정답인 이유:
D번 지침은 "보안 취약점 및 기존 동작을 망가뜨리는 버그"는 명확히 보고하도록 지시하고, "서식 선호도 및 스타일/관례 차이"는 건너뛰도록 범주별 행동 기준을 구체적으로 제시합니다. 이는 문제에서 요구한 '모델 신뢰도 수치에 의존하지 않고 명확히 보고/스킵 대상을 정하는 접근 방식'과 정확히 일치합니다.

오답 분석:
- Option A (오답): 스타일 가이드 위반을 모두 보고하는 것은 주관적인 스타일 노이즈를 유발하여 문제의 목적인 '주관적 선호도로 인한 소음 방지'에 위배됩니다.
- Option B (오답): 문제 조건에서 모델의 신뢰도 점수(Confidence score)에 의존하지 않기로 했으나, B번은 0.9라는 임계값 수치에 의존하므로 조건에 반합니다.
- Option C (오답): C번 역시 2차 패스 검증을 도입했을 뿐 근본적으로 모델의 신뢰도 점수(Confidence score) 수치에 의존하므로 문제의 요구 조건과 맞지 않습니다.

---

### 문제 51

**1. 문제 원문**

A retail receipt-extraction system reads scanned receipts and populates a "total" field. Occasionally the printed total is smudged and misread, producing a plausible but wrong number that still passes schema validation. What extraction design best catches this class of error before it reaches downstream accounting?

A) Skip extracting individual line items entirely so the pipeline runs faster and only returns the printed total field

B) Extract each line-item price plus the printed total, compute a calculated_total, and flag records where the two figures diverge

C) Trust the printed total field exactly as extracted, since it is the field accounting actually consumes further downstream anyway

D) Have the model silently overwrite the printed total with whatever value it judges most plausible before it responds

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**A retail receipt-extraction system**  
소매 영수증 추출 시스템이  

**reads scanned receipts**  
스캔된 영수증을 읽고  

**and populates a "total" field.**  
"total(합계)" 필드를 채웁니다.  

**Occasionally the printed total**  
때때로 인쇄된 합계 금액이  

**is smudged and misread,**  
번지거나 잘못 읽혀,  

**producing a plausible**  
그럴듯하지만  

**but wrong number**  
잘못된 숫자를 생성하여  

**that still passes schema validation.**  
여전히 스키마 검증을 통과합니다.  

**What extraction design**  
어떤 추출 설계가  

**best catches this class of error**  
이러한 유형의 오류를 가장 잘 찾아내는가  

**before it reaches downstream accounting?**  
후속 회계 시스템에 도달하기 전에?  

---

**OPTIONS:**

**A) Skip extracting individual line items entirely**  
개별 개별 품목(line item) 추출을 완전히 건너뛴다  

**so the pipeline runs faster**  
파이프라인이 더 빠르게 실행되고  

**and only returns the printed total field**  
인쇄된 합계 필드만 반환하도록  

---

**B) Extract each line-item price**  
각 품목의 가격을 추출하고  

**plus the printed total,**  
인쇄된 합계와 함께,  

**compute a calculated_total,**  
계산된 합계(calculated_total)를 산출하여,  

**and flag records**  
레코드에 플래그를 지정한다  

**where the two figures diverge**  
두 수치가 일치하지 않는 경우  

---

**C) Trust the printed total field**  
인쇄된 합계 필드를 신뢰한다  

**exactly as extracted,**  
추출된 그대로,  

**since it is the field**  
어차피 ~한 필드이기 때문에  

**accounting actually consumes**  
회계 시스템이 실제로 사용하는  

**further downstream anyway**  
더 후속 파이프라인에서  

---

**D) Have the model silently overwrite**  
모델이 알리지 않고 덮어쓰도록 한다  

**the printed total**  
인쇄된 합계 금액을  

**with whatever value**  
어떤 값이든 간에  

**it judges most plausible**  
가장 그럴듯하다고 판단하는 값으로  

**before it responds**  
응답하기 전에  

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
B번: Extract each line-item price plus the printed total, compute a calculated_total, and flag records where the two figures diverge

정답 및 해설:

핵심 개념: 교차 검증 및 산술 일치성 검사를 통한 데이터 추출 검증 (Cross-Validation & Mathematical Consistency Check)  
OCR 및 LLM 기반 문서 추출 파이프라인에서 텍스트 번짐/오염으로 인해 그럴듯한 오류(Plausible Error)가 스키마 검증(타입/형식 검사)을 통과하는 경우, 하위 품목(Line items)의 합계와 인쇄된 합계 금액을 비교하는 등의 교차 검증 검사를 도입하는 것이 최선의 모범 사례입니다.

문제 상황 분석:
- 영수증 스캔본의 "total" 문자가 번져서 잘못 추출되지만, 수치 형식 자체는 유효하여 기본 스키마 검증을 통과함.
- 후속 회계 시스템으로 잘못된 데이터가 유입되는 것을 방지하기 위한 구조적 추출 검증 설계가 필요함.
- 단순 형식 검사 외에 실제 수치 데이터의 정확성을 판단할 수 있는 메커니즘이 필요함.

B번이 정답인 이유:
개별 품목 가격(Line-item prices)을 함께 추출하여 합산한 값(`calculated_total`)과 추출된 인쇄 합계(`printed total`)를 비교하면, 텍스트 오염으로 인한 수치 오류 발생 시 두 값이 일치하지 않게 됩니다. 이 차이(Divergence)를 감지하여 불일치 레코드에 플래그를 지정함으로써 후속 회계 데이터 오염을 가장 확실하게 방지할 수 있습니다.

오답 분석:
- Option A (오답): 개별 품목 추출을 건너뛰면 비교 검증할 수 있는 수단이 사라지므로 잘못된 합계 금액이 그대로 회계 시스템으로 넘어가게 됩니다.
- Option C (오답): 잘못 추출된 값을 그대로 신뢰하고 사용하는 것은 문제 상황을 방치하는 잘못된 설계입니다.
- Option D (오답): 모델이 자의적으로 값을 변경(Overwrite)하여 반환하게 하면 원본과의 대조 및 이상 탐지(Audit Trail)가 불가능해지며, 또 다른 오탐을 유발할 수 있습니다.

---

### 문제 52

**1. 문제 원문**

An invoice-extraction pipeline returns structured JSON that is missing the required `invoice_number` field, even though the number is clearly printed on the source PDF. The team wants to retry the extraction with targeted feedback so the model can correct the omission. Which retry design is most likely to succeed?

A) Send only the validation error text by itself, without re-attaching the source PDF or the earlier failed output from the first pass

B) Discard the whole conversation and resend the unchanged original prompt, hoping sampling variance yields a different result this time

C) Rewrite the system prompt with new wording and resend it with the PDF, without naming the missing field or the earlier attempt

D) Resend the original PDF plus the prior failed JSON, and state that `invoice_number` is required but was omitted from that attempt

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**An invoice-extraction pipeline**  
송장 추출 파이프라인이  

**returns structured JSON**  
구조화된 JSON을 반환합니다  

**that is missing**  
누락되어 있는  

**the required `invoice_number` field,**  
필수 `invoice_number` 필드가,  

**even though the number**  
비록 그 번호가  

**is clearly printed**  
명확히 인쇄되어 있음에도  

**on the source PDF.**  
원본 PDF에.  

**The team wants to retry**  
팀은 재시도하기를 원합니다  

**the extraction**  
추출을  

**with targeted feedback**  
타겟팅된(표적화된) 피드백과 함께  

**so the model can correct**  
모델이 수정할 수 있도록  

**the omission.**  
누락을.  

**Which retry design**  
어떤 재시도 설계가  

**is most likely to succeed?**  
성공할 가능성이 가장 높은가?  

---

**OPTIONS:**

**A) Send only the validation error text**  
유효성 검사 오류 텍스트만 보낸다  

**by itself,**  
단독으로,  

**without re-attaching the source PDF**  
원본 PDF를 다시 첨부하지 않고  

**or the earlier failed output**  
또는 이전의 실패한 출력을  

**from the first pass**  
첫 번째 패스로부터의.  

---

**B) Discard the whole conversation**  
전체 대화를 폐기하고  

**and resend the unchanged original prompt,**  
변경되지 않은 원본 프롬프트를 다시 전송한다,  

**hoping sampling variance**  
샘플링 분산(가변성)이  

**yields a different result this time**  
이번에는 다른 결과를 생성하기를 바라며  

---

**C) Rewrite the system prompt**  
시스템 프롬프트를 다시 작성한다  

**with new wording**  
새로운 문구로  

**and resend it with the PDF,**  
그리고 이를 PDF와 함께 다시 전송한다,  

**without naming the missing field**  
누락된 필드를 명시하지 않고  

**or the earlier attempt**  
또는 이전 시도를.  

---

**D) Resend the original PDF**  
원본 PDF를 다시 전송한다  

**plus the prior failed JSON,**  
이전의 실패한 JSON과 함께,  

**and state that `invoice_number`**  
그리고 `invoice_number`가  

**is required**  
필수사항이지만  

**but was omitted from that attempt**  
해당 시도에서 누락되었음을 분명히 밝힌다  

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
D번: Resend the original PDF plus the prior failed JSON, and state that `invoice_number` is required but was omitted from that attempt

정답 및 해설:

핵심 개념: 대상화된 피드백을 통한 멀티턴 재시도 패턴 (Targeted Feedback & Stateful Retry Loop)  
LLM 데이터 추출 중 필수 필드 누락 오류가 발생했을 때, 모델에게 정정을 요청하려면 **(1) 원본 컨텍스트(PDF)**, **(2) 이전 시도의 생성 결과(실패한 JSON)**, **(3) 구체적인 오류 원인 및 피드백(필수 필드 누락 명시)**을 대화 내역(Context)에 모두 유지하여 제공해야 합니다.

문제 상황 분석:
- PDF 원본에는 송장 번호가 존재하지만, 추출된 JSON 결과에서 `invoice_number` 필드가 누락됨.
- 단순 재시도가 아닌 타겟팅된 피드백(Targeted feedback)을 전달하여 정정하도록 유도하고자 함.
- 모델이 원본 문서와 이전 생성 결과, 피드백을 조합하여 부족한 점을 보완하도록 대화 구성을 설계해야 함.

D번이 정답인 이유:
D번은 모델이 판독해야 할 원본 데이터(PDF)와 모델 자신이 이전에 출력했던 실패 결과(prior failed JSON), 그리고 무엇이 잘못되었는지에 대한 명확한 지적(`invoice_number`가 필수인데 누락되었음)을 모두 포함합니다. 모델은 이 완전한 맥락을 바탕으로 기존 출력의 오류를 파악하고, 원본 문서에서 누락된 필드만 정확히 찾아내어 완전한 JSON을 재생성할 수 있게 됩니다.

오답 분석:
- Option A (오답): 원본 PDF와 이전 출력을 제외하고 오류 메시지만 보내면, 모델은 무엇을 검토하고 어떤 JSON 구조에서 필드를 수정해야 하는지 참조 대상을 잃게 됩니다.
- Option B (오답): 단순히 동일한 프롬프트를 재전송하는 것은 피드백(Targeted feedback)을 주지 않으며 무작위 확률(Sampling)에만 의존하므로 오류가 반복될 확률이 높습니다.
- Option C (오답): 누락된 필드명을 알려주지 않고 시스템 프롬프트 문구만 바꾼다면, 모델은 특정 필드가 빠졌다는 사실을 알지 못해 동일한 누락 문제를 계속 일으킬 수 있습니다.

---

### 문제 53

**1. 문제 원문**

A team adds five few-shot examples to a document-classification prompt to fix inconsistent labeling. All five examples happen to be English-language emails under 100 words. After deployment, the model performs well on similar short English emails but starts mislabeling longer documents and documents in other languages that it previously handled correctly under the old, example-free prompt. What is the most likely cause, and what should the team do?

A) The examples unintentionally taught an unrelated pattern tied to length and language; diversify them

B) The five examples are too few in number; keep them but duplicate each one three times

C) The regression is unrelated to the examples and is caused by unrelated model drift

D) Few-shot examples are simply incompatible with document classification tasks, so remove them entirely

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**A team adds**  
한 팀이 추가합니다  

**five few-shot examples**  
5개의 퓨샷(few-shot) 예시를  

**to a document-classification prompt**  
문서 분류 프롬프트에  

**to fix inconsistent labeling.**  
불일치하는 레이블링을 수정하기 위해.  

**All five examples happen to be**  
5개의 예시 모두가 우연히 ~입니다  

**English-language emails**  
영어 이메일  

**under 100 words.**  
100단어 미만의.  

**After deployment,**  
배포 후에,  

**the model performs well**  
모델은 잘 작동합니다  

**on similar short English emails**  
유사한 짧은 영어 이메일에서는  

**but starts mislabeling**  
하지만 잘못 레이블링하기 시작합니다  

**longer documents**  
더 긴 문서와  

**and documents in other languages**  
다른 언어로 된 문서들을  

**that it previously handled correctly**  
이전에 정확하게 처리했던  

**under the old, example-free prompt.**  
예시가 없던 이전 프롬프트에서.  

**What is the most likely cause,**  
가장 유력한 원인은 무엇이며,  

**and what should the team do?**  
팀은 무엇을 해야 하는가?  

---

**OPTIONS:**

**A) The examples unintentionally taught**  
예시들이 의도치 않게 학습시켰습니다  

**an unrelated pattern**  
관련 없는 패턴을  

**tied to length and language;**  
길이 및 언어와 결합된;  

**diversify them**  
예시들을 다양화하라  

---

**B) The five examples are too few in number;**  
5개의 예시는 수가 너무 적습니다;  

**keep them**  
그것들을 유지하되  

**but duplicate each one three times**  
각 예시를 3번씩 복제하라  

---

**C) The regression is unrelated to the examples**  
이 성능 저하는 예시들과 관련이 없으며  

**and is caused by unrelated model drift**  
관련 없는 모델 드리프트(model drift)에 의해 발생합니다  

---

**D) Few-shot examples are simply incompatible**  
퓨샷 예시는 단지 호환되지 않습니다  

**with document classification tasks,**  
문서 분류 작업과,  

**so remove them entirely**  
따라서 그것들을 완전히 제거하라  

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
A번: The examples unintentionally taught an unrelated pattern tied to length and language; diversify them

정답 및 해설:

핵심 개념: 퓨샷 예시 편향(Few-Shot Example Bias) 및 예시 다양화(Example Diversity)  
LLM에 퓨샷 예시를 제공할 때 모든 예시가 특정 형식(예: 짧은 길이, 특정 언어)에 치우쳐 있으면, 모델은 지시사항과 무관한 spurious pattern(의도치 않은 연관 패턴)을 학습하여 해당 규격에 맞지 않는 입력 전체에 성능 저하(Regression)를 일으킵니다.

문제 상황 분석:
- 불일치 레이블링을 바로잡고자 5개의 퓨샷 예시를 프롬프트에 도입함.
- 제공된 5개 예시가 모두 '100단어 미만의 짧은 영어 이메일'로 단일한 유형임.
- 예시 도입 후 짧은 영어 이메일은 잘 분류하지만, 긴 문서나 타 언어 문서 분류 성능이 떨어짐.

A번이 정답인 이유:
편향된 예시 집합은 모델에게 "이 작업은 짧은 영어 텍스트에만 적용된다"는 의도치 않은 서브 패턴을 유도합니다. 따라서 문제 원인은 예시의 편향성 때문이며, 해결책은 다양한 길이, 다양한 언어, 다양한 문서 형태를 포함하도록 퓨샷 예시를 다양화(Diversify)하는 것입니다.

오답 분석:
- Option B (오답): 동일한 편향된 예시를 단순히 3번씩 복제하는 것은 프롬프트 토큰만 낭비할 뿐 편향성 문제를 오히려 강화시킵니다.
- Option C (오답): 이전 프롬프트에서 잘 동작하던 긴 문서/타 언어 분류가 예시 추가 직후 실패하므로, 이는 프롬프트 편향에 의한 명백한 성능 저하이며 무관한 모델 드리프트가 아닙니다.
- Option D (오답): 퓨샷 프롬프팅은 문서 분류 작업의 정확도와 레이블 일관성을 높이는 가장 강력한 기법 중 하나이므로, 호환되지 않는다는 설명은 거짓입니다.

---

### 문제 54

**1. 문제 원문**

A reviewer prompt currently says: "Only surface issues you are very sure about." An architect wants to replace confidence-based filtering with categorical criteria for a bug-detection category specifically. Which rewrite achieves that goal?

A) Report an issue only when a variable, argument, or return value is used in a way that contradicts its declared type, documented contract, or an explicit precondition stated elsewhere in the code.

B) Report an issue whenever your certainty about it being a real bug is above a threshold you judge to be reasonably high for this kind of codebase, calibrated against the defect density you expect for the subsystem.

C) Report an issue whenever the surrounding code looks unusual compared to typical patterns you have seen in similar production systems, focusing on deviations from standard naming conventions and control flow idioms.

D) Report an issue only if you would personally be willing to bet that a senior engineer on the team would agree it is a genuine problem, after reviewing the code against the team's implicit quality standards and typical bug histories.

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**A reviewer prompt**  
검토자 프롬프트는  

**currently says:**  
현재 다음과 같이 작성되어 있습니다:  

**"Only surface issues**  
"이슈만을 표면화(보고)하라  

**you are very sure about."**  
당신이 매우 확신하는."  

**An architect wants to replace**  
한 아키텍트가 교체하기를 원합니다  

**confidence-based filtering**  
신뢰도 기반의 필터링을  

**with categorical criteria**  
명시적/범주적 기준(categorical criteria)으로  

**for a bug-detection category specifically.**  
특히 버그 탐지 카테고리에 대해.  

**Which rewrite**  
어떤 재작성(개선안)이  

**achieves that goal?**  
그 목표를 달성하는가?  

---

**OPTIONS:**

**A) Report an issue only when**  
오직 ~할 때만 이슈를 보고하라  

**a variable, argument, or return value**  
변수, 인자, 또는 반환값이  

**is used in a way**  
방식으로 사용될 때  

**that contradicts its declared type,**  
선언된 타입과 모순되는,  

**documented contract,**  
문서화된 계약(규약)과,  

**or an explicit precondition**  
또는 명시적 전제 조건과  

**stated elsewhere in the code.**  
코드 다른 곳에 명시된.  

---

**B) Report an issue whenever**  
~할 때마다 이슈를 보고하라  

**your certainty about it being a real bug**  
그것이 실제 버그라는 당신의 확신이  

**is above a threshold**  
임계값을 초과할 때  

**you judge to be reasonably high**  
당신이 상당히 높다고 판단하는  

**for this kind of codebase,**  
이러한 종류의 코드베이스에 대해,  

**calibrated against the defect density**  
결함 밀도에 맞춰 보정된  

**you expect for the subsystem.**  
당신이 해당 서브시스템에 대해 기대하는.  

---

**C) Report an issue whenever**  
~할 때마다 이슈를 보고하라  

**the surrounding code looks unusual**  
주변 코드가 특이해 보일 때  

**compared to typical patterns**  
전형적인 패턴과 비교하여  

**you have seen in similar production systems,**  
유사한 프로덕션 시스템에서 당신이 보았던,  

**focusing on deviations**  
벗어난 점에 집중하면서  

**from standard naming conventions**  
표준 명명 규칙과  

**and control flow idioms.**  
제어 흐름 관용구로부터.  

---

**D) Report an issue only if**  
오직 ~인 경우에만 이슈를 보고하라  

**you would personally be willing to bet**  
당신이 개인적으로 장담(내기)할 수 있는 경우에만  

**that a senior engineer on the team**  
팀의 시니어 엔지니어가  

**would agree it is a genuine problem,**  
그것이 진짜 문제라는 것에 동의할 것이라고,  

**after reviewing the code**  
코드를 검토한 후에  

**against the team's implicit quality standards**  
팀의 암묵적인 품질 기준과  

**and typical bug histories.**  
전형적인 버그 이력에 비추어.  

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
A번: Report an issue only when a variable, argument, or return value is used in a way that contradicts its declared type, documented contract, or an explicit precondition stated elsewhere in the code.

정답 및 해설:

핵심 개념: 신뢰도 수치(Confidence) 대비 명시적/범주적 규칙(Categorical Criteria) 전환  
LLM 코드 리뷰 프롬프트에서 "확신하는 경우에만 보고하라(very sure about)"와 같은 주관적/신뢰도 기반 필터링은 오탐을 막기 어렵습니다. 이를 개선하기 위해서는 타입 모순, 명시적 규약 위반, 코드 내 전제 조건 불일치처럼 코드 구조상 직접 검증 가능하고 명확하게 정의된 범주적 기준(Categorical Criteria)을 부여해야 합니다.

문제 상황 분석:
- 기존 프롬프트는 "매우 확신하는 이슈만 보고하라"는 주관적 신뢰도(Confidence-based) 필터에 의존함.
- 버그 탐지 카테고리에 대해 이러한 불확실한 기준을 대체하고자 함.
- 모델의 확신/주관적 판단이 아닌, 객관적이고 명확한 규칙 기반의 범주적 기준(Categorical Criteria)으로 프롬프트를 재작성해야 함.

A번이 정답인 이유:
A번 지침은 '변수/인자/반환값이 선언된 타입, 문서화된 규약, 또는 코드상 명시된 전제 조건과 직접 모순될 때'라는 객관적이고 코드 레벨에서 검증 가능한 범주적 기준(Categorical Criteria)을 제시합니다. 주관적인 확신도나 임계값에 의존하지 않고 명확한 모순 발생 여부만을 판단하게 하므로 문제를 완벽히 해결합니다.

오답 분석:
- Option B (오답): '버그라는 확신(certainty)이 임계값(threshold)을 초과할 때'라는 설명은 여전히 주관적인 신뢰도/확신도에 의존하는 방식이므로 교체하려는 대상의 기존 방식과 동일합니다.
- Option C (오답): '주변 코드가 특이해 보일 때(looks unusual)' 및 스타일/명명 규칙 위반을 보고하도록 하는 것은 주관적 느낌에 의존하며, 버그 탐지가 아닌 코드 스타일 지적(노이즈)에 해당합니다.
- Option D (오답): '시니어 엔지니어가 동의할 것이라고 내기할 수 있는 경우'나 '암묵적 품질 기준(implicit standards)' 역시 모델의 주관적 추측과 주관적 신뢰도에 의존하므로 명시적 범주 기준이 아닙니다.

---

### 문제 55

**1. 문제 원문**

A prompt engineer tries to fix a noisy security-findings category by adding the line "only report high-confidence findings" to the system prompt. After a week of testing, the false positive rate is essentially unchanged. What is the most likely explanation for why this change failed to improve precision?

A) General confidence language gives the model no concrete rule for what to report, so it still applies the same underlying judgment that produced the false positives before the change.

B) Adding any qualifier to a system prompt increases output length, which expands the set of tokens the evaluator inspects and independently raises the chance that a finding is miscategorized as high severity.

C) High-confidence phrasing conflicts with the model's safety training, which is designed to avoid under-reporting risks, causing it to over-report findings as a cautionary default across a wider range of inputs.

D) The word "confidence" is not in the set of tokens the model is trained to parse for output constraints, so the instruction is treated as decorative text and ignored, leaving the original behavior unchanged.

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**A prompt engineer tries to fix**  
프롬프트 엔지니어가 수정하려고 시도합니다  

**a noisy security-findings category**  
노이즈가 많은 보안 지적 사항 카테고리를  

**by adding the line**  
줄을 추가함으로써  

**"only report high-confidence findings"**  
"신뢰도가 높은 지적 사항만 보고하라"는  

**to the system prompt.**  
시스템 프롬프트에.  

**After a week of testing,**  
일주일간의 테스트 후,  

**the false positive rate**  
오탐률(false positive rate)은  

**is essentially unchanged.**  
본질적으로 변하지 않았습니다.  

**What is the most likely explanation**  
가장 유력한 설명은 무엇인가  

**for why this change failed**  
이 변경이 실패한 이유에 대한  

**to improve precision?**  
정밀도(precision)를 개선하는 데?  

---

**OPTIONS:**

**A) General confidence language**  
일반적인 신뢰도 언어는  

**gives the model no concrete rule**  
모델에게 구체적인 규칙을 제공하지 않습니다  

**for what to report,**  
무엇을 보고해야 하는지에 대해,  

**so it still applies**  
따라서 여전히 적용합니다  

**the same underlying judgment**  
동일한 근본적인 판단을  

**that produced the false positives**  
오탐을 발생시켰던  

**before the change.**  
변경 이전에.  

---

**B) Adding any qualifier**  
어떤 수식어를 추가하는 것이든  

**to a system prompt**  
시스템 프롬프트에  

**increases output length,**  
출력 길이를 증가시키며,  

**which expands the set of tokens**  
이는 토큰 집합을 확장합니다  

**the evaluator inspects**  
평가자가 검사하는  

**and independently raises the chance**  
그리고 독립적으로 가능성을 높입니다  

**that a finding is miscategorized**  
지적 사항이 잘못 분류될  

**as high severity.**  
높은 심각도로.  

---

**C) High-confidence phrasing conflicts**  
높은 신뢰도 문구는 충돌합니다  

**with the model's safety training,**  
모델의 안전 학습과,  

**which is designed to avoid**  
피하도록 설계된  

**under-reporting risks,**  
위험 보고 누락(under-reporting)을,  

**causing it to over-report findings**  
결과적으로 지적 사항을 과다 보고하게 만들면서  

**as a precautionary default**  
예방적 기본값으로서  

**across a wider range of inputs.**  
더 광범위한 입력에 대해.  

---

**D) The word "confidence"**  
"confidence"라는 단어는  

**is not in the set of tokens**  
토큰 집합에 포함되어 있지 않습니다  

**the model is trained to parse**  
모델이 파싱하도록 학습된  

**for output constraints,**  
출력 제약 조건을 위해,  

**so the instruction is treated**  
따라서 그 지침은 처리됩니다  

**as decorative text and ignored,**  
장식용 텍스트로 취급되어 무시되며,  

**leaving the original behavior unchanged.**  
기존 동작을 변경 없이 그대로 유지하면서.  

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
A번: General confidence language gives the model no concrete rule for what to report, so it still applies the same underlying judgment that produced the false positives before the change.

정답 및 해설:

핵심 개념: 모호한 신뢰도 지침 vs 명시적/범주적 규칙 (Vague Confidence Phrasing vs. Explicit Criteria)  
LLM에 "신뢰도가 높은 항목만 보고하라(high-confidence findings)"와 같이 주관적이고 추상적인 문구를 제공하면 모델은 스스로 무엇이 '신뢰도가 높은지' 객관적으로 판단할 수 없습니다. 결국 이전과 동일한 내재적 판단 기준을 적용하게 되므로 오탐률(False Positive Rate) 감소 및 정밀도 개선에 실패하게 됩니다.

문제 상황 분석:
- 보안 지적 사항 카테고리에서 오탐(False positive)이 많이 발생함.
- 프롬프트 엔지니어가 "only report high-confidence findings"라는 한 줄을 시스템 프롬프트에 추가함.
- 일주일간 테스트했지만 오탐률에 변화가 없었으며 정밀도가 개선되지 않음.

A번이 정답인 이유:
"high-confidence"라는 일반적이고 모호한 단어는 무엇을 보고하고 무엇을 스킵해야 하는지에 대한 구체적이고 객관적인 기준(Explicit/Categorical Criteria)을 모델에게 제공하지 못합니다. 모델은 '높은 신뢰도'의 정의를 알 수 없어 기존과 동일한 방식으로 오탐 가능성이 있는 지적 사항들을 그대로 출력하므로 정밀도 개선에 실패합니다.

오답 분석:
- Option B (오답): 프롬프트에 수식어를 추가하는 것이 출력 길이를 불필요하게 늘려 심각도 오분류 확률을 직접적으로 높인다는 주장은 기술적 근거가 없는 오답입니다.
- Option C (오답): 주관적인 신뢰도 문구가 모델의 안전 학습(Safety training)과 직접적으로 충돌하여 예방 조치로 지적 사항을 과다 보고하게 된다는 해석은 사실이 아닙니다.
- Option D (오답): LLM은 어휘 집합 내의 모든 일반 단어를 파싱할 수 있으며, "confidence"라는 특정 단어가 제약 조건 토큰 집합에서 제외되어 무시된다는 설명은 LLM 작동 방식에 대한 잘못된 설명입니다.

---

### 문제 56

**1. 문제 원문**

A developer is choosing between prompting Claude to "return only a JSON object matching this format" versus defining a tool with an input_schema and letting Claude populate it via tool_use, with strict enforcement enabled. Both approaches are tested against the same messy scanned-document corpus. Which outcome should the developer expect regarding guaranteed schema compliance?

A) The tool_use approach reliably produces schema-compliant structured data because the API strictly enforces the input_schema server-side when strict tool use is enabled, while prompt-only JSON requests can still drift into invalid syntax or missing fields.

B) Both approaches produce equally reliable schema-compliant output because the language model interprets the format specification identically in each case, generating token sequences that conform to the JSON structure with equal consistency.

C) Neither approach can guarantee valid structured output when processing messy scanned documents, so a separate JSON-repair library must always be used afterward to correct syntax errors and missing fields, regardless of which method is chosen.

D) The prompt-only approach yields more reliable schema-compliant output because it avoids the additional system-prompt instructions introduced by tool definitions, allowing the model to focus directly on the JSON format constraints.

---

**2. 구간별 직독직해 번역**

**QUESTION:**

**A developer is choosing**  
한 개발자가 선택하고 있습니다  

**between prompting Claude**  
Claude에게 프롬프트를 주는 것과  

**to "return only a JSON object**  
"오직 JSON 객체만 반환하라"고  

**matching this format"**  
이 형식에 맞춰서  

**versus defining a tool**  
도구(tool)를 정의하는 것 사이에서  

**with an input_schema**  
input_schema를 가진  

**and letting Claude populate it**  
그리고 Claude가 이를 채우도록 하는 것  

**via tool_use,**  
tool_use를 통해,  

**with strict enforcement enabled.**  
엄격한 적용(strict enforcement)이 활성화된 상태로.  

**Both approaches are tested**  
두 접근 방식 모두 테스트됩니다  

**against the same messy scanned-document corpus.**  
동일한 지저분한 스캔 문서 코퍼스에 대해.  

**Which outcome**  
어떤 결과를  

**should the developer expect**  
개발자가 예상해야 하는가  

**regarding guaranteed schema compliance?**  
보장된 스키마 준수와 관련하여?  

---

**OPTIONS:**

**A) The tool_use approach**  
tool_use 접근 방식은  

**reliably produces**  
신뢰성 있게 생성합니다  

**schema-compliant structured data**  
스키마를 준수하는 구조화된 데이터를  

**because the API strictly enforces**  
API가 엄격하게 강제하기 때문에  

**the input_schema server-side**  
서버 측에서 input_schema를  

**when strict tool use is enabled,**  
엄격한 도구 사용이 활성화되었을 때,  

**while prompt-only JSON requests**  
반면에 프롬프트 전용 JSON 요청은  

**can still drift**  
여전히 벗어날 수 있습니다  

**into invalid syntax or missing fields.**  
유효하지 않은 구문이나 누락된 필드로.  

---

**B) Both approaches produce**  
두 접근 방식 모두 생성합니다  

**equally reliable schema-compliant output**  
동일하게 신뢰할 수 있는 스키마 준수 출력을  

**because the language model interprets**  
언어 모델이 해석하기 때문에  

**the format specification identically**  
형식 명세를 동일하게  

**in each case,**  
각 경우에서,  

**generating token sequences**  
토큰 시퀀스를 생성하면서  

**that conform to the JSON structure**  
JSON 구조에 부합하는  

**with equal consistency.**  
동일한 일관성으로.  

---

**C) Neither approach can guarantee**  
어떤 접근 방식도 보장할 수 없습니다  

**valid structured output**  
유효한 구조화된 출력을  

**when processing messy scanned documents,**  
지저분한 스캔 문서를 처리할 때,  

**so a separate JSON-repair library**  
따라서 별도의 JSON 복구 라이브러리를  

**must always be used afterward**  
나중에 항상 사용해야 합니다  

**to correct syntax errors and missing fields,**  
구문 오류와 누락된 필드를 수정하기 위해,  

**regardless of which method is chosen.**  
어떤 방법이 선택되든 관계없이.  

---

**D) The prompt-only approach yields**  
프롬프트 전용 접근 방식이 산출합니다  

**more reliable schema-compliant output**  
더 신뢰할 수 있는 스키마 준수 출력을  

**because it avoids**  
피하기 때문에  

**the additional system-prompt instructions**  
추가적인 시스템 프롬프트 지침을  

**introduced by tool definitions,**  
도구 정의에 의해 도입되는,  

**allowing the model to focus directly**  
모델이 직접 집중할 수 있게 하면서  

**on the JSON format constraints.**  
JSON 형식 제약 조건에.  

---

**3. 정답 및 해설 (Answer & Explanation)**

정답:
A번: The tool_use approach reliably produces schema-compliant structured data because the API strictly enforces the input_schema server-side when strict tool use is enabled, while prompt-only JSON requests can still drift into invalid syntax or missing fields.

정답 및 해설:

핵심 개념: 도구 호출(Tool Use / Strict Tool Use) vs 자연어 프롬프팅 방식의 스키마 준수  
Claude API에서 구조화된 데이터(JSON)를 추출할 때 단순 자연어 지시("JSON으로만 답하라")는 텍스트 완성 방식에 의존하므로 구문 오류나 필드 누락이 발생할 수 있습니다. 반면, `strict: true` 옵션이 적용된 `tool_use` 방식은 API 및 서버 레벨에서 JSON 스키마 기반 출력 디코딩을 강제하므로 스키마 준수를 완벽히 보장합니다.

문제 상황 분석:
- 지저분한 스캔 문서 데이터셋에서 구조화된 JSON을 추출해야 함.
- 방식 1: 단순 프롬프팅("JSON 형식으로만 반환해라").
- 방식 2: `input_schema`와 엄격한 적용(strict enforcement)을 설정한 `tool_use` 방식.
- 보장된 스키마 준수(Guaranteed schema compliance) 측면에서 예상되는 결과를 찾는 문제임.

A번이 정답인 이유:
`strict tool use`(구조화된 출력 강제) 기능이 활성화되면 Anthropic API는 서버 측에서 디코딩 알고리즘을 통해 정의된 `input_schema`를 완벽히 준수하는 형태의 토큰만 생성되도록 강제합니다. 따라서 구문 오류나 필수 필드 누락이 근본적으로 차단됩니다. 반면 프롬프트만 사용하는 방식은 언어 모델의 확률적 텍스트 생성에만 의존하므로 여전히 문법 오류나 사족 텍스트가 포함될 가능성이 있습니다.

오답 분석:
- Option B (오답): 단순 프롬프팅과 엄격한 도구 호출 규격 적용은 일관성과 신뢰도 측면에서 동일하지 않으며, 도구 호출 방식이 훨씬 월등한 신뢰도를 제공합니다.
- Option C (오답): `strict tool use` 방식을 사용할 경우 API 차원에서 문법 검증이 보장되므로 별도의 JSON 복구(JSON-repair) 라이브러리를 필수적으로 사용할 필요가 없습니다.
- Option D (오답): 프롬프트 전용 방식이 도구 정의 방식보다 더 신뢰할 수 있다는 설명은 사실과 반대입니다.
