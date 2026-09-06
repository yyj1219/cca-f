### 15번 문제

**문제 원문**

A research-summarization tool extracts source citations from academic papers. Some papers cite sources inline in the body text, e.g., '(Smith, 2019)', while others rely entirely on a numbered bibliography referenced by superscript markers. The tool consistently extracts citations correctly from inline-style papers but frequently returns an empty citation list for bibliography-style papers. What should be added to the prompt to fix this?

A) A preprocessing step that strips all superscript numbers before the document reaches the prompt

B) An example each for inline and bibliography style, showing how a superscript marker traces to its entry

C) An instruction noting that citations may appear either inline in the text or in a numbered bibliography

D) A rule that rejects any paper not using inline citation style, since that format is handled reliably


---


**구간별 직독직해 번역**

**QUESTION:**

**A research-summarization tool**
연구 요약 도구는

**extracts source citations**
출처 인용을 추출합니다

**from academic papers.**
학술 논문으로부터.

**Some papers cite sources**
일부 논문은 출처를 인용합니다

**inline in the body text,**
본문 텍스트 내에 직접(inline),

**e.g., '(Smith, 2019)',**
예를 들어 '(Smith, 2019)'와 같이,

**while others rely entirely**
반면에 다른 논문들은 전적으로 의존합니다

**on a numbered bibliography**
번호가 매겨진 참고문헌 목록에

**referenced by superscript markers.**
위첨자 표시에 의해 참조되는.

**The tool consistently extracts**
이 도구는 일관되게 추출합니다

**citations correctly**
인용을 정확하게

**from inline-style papers**
본문 내 인용 형식의 논문으로부터

**but frequently returns**
하지만 자주 반환합니다

**an empty citation list**
빈 인용 목록을

**for bibliography-style papers.**
참고문헌 목록 형식의 논문에 대해서는.

**What should be added**
무엇이 추가되어야 합니까

**to the prompt to fix this?**
이 문제를 해결하기 위해 프롬프트에?


**OPTIONS:**

**A) A preprocessing step**
전처리 단계

**that strips all superscript numbers**
모든 위첨자 숫자를 제거하는

**before the document reaches the prompt**
문서가 프롬프트에 도달하기 전에


**B) An example each**
각각의 예시

**for inline and bibliography style,**
본문 내 인용 및 참고문헌 목록 형식에 대한,

**showing how a superscript marker**
위첨자 표시가 어떻게 연결되는지 보여주는

**traces to its entry**
해당 항목으로


**C) An instruction noting**
지시 사항

**that citations may appear**
인용이 나타날 수 있음을 명시하는

**either inline in the text**
텍스트 내 본문 인용으로나

**or in a numbered bibliography**
또는 번호가 매겨진 참고문헌 목록으로


**D) A rule that rejects**
거부하는 규칙

**any paper not using**
사용하지 않는 모든 논문을

**inline citation style,**
본문 내 인용 형식을,

**since that format is handled reliably**
그 형식이 안정적으로 처리되기 때문에


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: An example each for inline and bibliography style, showing how a superscript marker traces to its entry

**정답 및 해설:**

**핵심 개념**: Few-shot Prompting 및 문맥 추적 능력 강화
LLM이 복잡한 논리적 참조 구조(위첨자 숫자 $\rightarrow$ 참고문헌 목록 항목 매핑)를 이해하지 못할 때는 단순 지시문 추가보다 패턴과 매핑 과정을 보여주는 예시(Few-shot Example)를 제공하는 것이 가장 효과적입니다.

**문제 상황 분석:**
- 모델이 본문 내 텍스트 인용('(Smith, 2019)')은 잘 추출하지만 위첨자 참조 방식에서는 출처를 찾지 못하고 빈 결과를 반환함
- 위첨자 형태의 숫자는 본문의 위치와 문서 하단/끝의 참고문헌 목록 항목 간 추적(tracing) 과정이 필요함
- 단순 설명만으로는 모델이 위첨자와 참고문헌 항목 간의 추적 및 추출 패턴을 명확히 파악하기 어려움

**B번이 정답인 이유:**
Few-shot 퓨샷 프롬프팅 방식을 통해 두 스타일에 대한 구체적인 인풋-아웃풋 예시를 제공하고, 특히 위첨자 표기(예: $^{1}$)가 어떻게 하단의 참고문헌 목록 항목과 연결되어 추출되어야 하는지 시범을 보여주면 LLM의 추론 능력이 크게 향상되어 문제가 정확히 해결됩니다.

**오답 분석:**
- Option A (오답): 위첨자 숫자를 제거해 버리면 참고문헌 목록과 연결할 수 있는 유일한 식별자/고리가 사라지므로 오히려 문제가 악화됩니다.
- Option C (오답): 지시문(Instruction)만 추가하는 방식은 모델이 '위첨자를 참조하여 목록에서 실제 내용을 매핑해 추출하는 복잡한 연쇄 과정'을 수행하도록 강제하기에 부족합니다.
- Option D (오답): 특정 포맷을 사용하는 논문 전체를 거부(Reject)하는 것은 문제를 해결하는 것이 아니라 요구사항을 포기하는 회피책입니다.


---


### 16번 문제

**문제 원문**

An employment-contract extractor pulls a "salary" field that correctly matches its declared numeric type and required-field constraints, but the value is denominated in the wrong currency because the model misread an ambiguous currency symbol on a multi-currency contract. Schema validation passes without complaint. How should this be characterized?

A) As a schema violation that strict tool use should have already prevented from ever reaching the application layer at all

B) As a semantic error outside schema conformance, needing a rule that cross-checks the currency symbol against the number

C) As a token-limit truncation issue that will be resolved by simply increasing max_tokens on the next call made

D) As a refusal, since the model effectively declined to resolve the ambiguous currency symbol on the contract


---


**구간별 직독직해 번역**

**QUESTION:**

**An employment-contract extractor**
고용 계약서 추출기는

**pulls a "salary" field**
"급여" 필드를 추출합니다

**that correctly matches**
올바르게 일치하는

**its declared numeric type**
선언된 숫자 유형과

**and required-field constraints,**
필수 필드 제약 조건에,

**but the value is denominated**
하지만 값의 단위가 표기되어 있습니다

**in the wrong currency**
잘못된 통화로

**because the model misread**
모델이 잘못 읽었기 때문에

**an ambiguous currency symbol**
모호한 통화 기호를

**on a multi-currency contract.**
다중 통화 계약서에서.

**Schema validation passes**
스키마 검증은 통과합니다

**without complaint.**
오류 보고 없이.

**How should this be characterized?**
이것은 어떻게 규정되어야 합니까?


**OPTIONS:**

**A) As a schema violation**
스키마 위반으로

**that strict tool use**
엄격한 도구 사용이

**should have already prevented**
이미 방지했어야 하는

**from ever reaching the application layer at all**
애플리케이션 레이어에 전혀 도달하지 못하도록


**B) As a semantic error**
의미론적 오류로

**outside schema conformance,**
스키마 적합성을 벗어난,

**needing a rule**
규칙이 필요한

**that cross-checks the currency symbol**
통화 기호를 교차 검증하는

**against the number**
숫자와 대조하여


**C) As a token-limit truncation issue**
토큰 제한 잘림 문제로

**that will be resolved**
해결될 수 있는

**by simply increasing max_tokens**
단순히 max_tokens를 늘림으로써

**on the next call made**
다음 호출을 할 때


**D) As a refusal,**
거부(refusal)로,

**since the model effectively declined**
모델이 사실상 거부했기 때문에

**to resolve the ambiguous currency symbol**
모호한 통화 기호를 해석하는 것을

**on the contract**
계약서에 있는


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: As a semantic error outside schema conformance, needing a rule that cross-checks the currency symbol against the number

**정답 및 해설:**

**핵심 개념**: 스키마 검증(Schema Validation) vs 의미론적 오류(Semantic Error)
스키마 검증은 출력 데이터의 형식(데이터 타입, 필수 입력 여부, 숫자 범위 등)만 확인합니다. 형식이 올바르더라도 데이터의 내용 및 문맥적 의미가 잘못된 경우는 '의미론적 오류(Semantic Error)'에 해당하며, 이는 비즈니스 로직이나 교차 검증 규칙으로 해결해야 합니다.

**문제 상황 분석:**
- 급여(salary) 필드의 데이터 타입(숫자)과 필수 입력 조건 등의 구조적 스키마는 완벽히 준수됨
- 다중 통화 계약서의 모호한 통화 기호로 인해 모델이 잘못된 통화 기준의 값을 추출함
- 구조적 규격은 올바르기 때문에 스키마 검증기(Schema Validator)는 에러 없이 정상 통과함

**B번이 정답인 이유:**
추출된 데이터의 형식적 형태(숫자 타입)는 문제가 없어 스키마 검증을 통과하지만, 실제 의미(잘못된 통화 단위)가 유효하지 않은 전형적인 '의미론적 오류(Semantic Error)'입니다. 스키마 검증만으로는 이를 잡아낼 수 없으므로, 통화 기호와 금액을 상호 대조(Cross-check)하는 별도의 비즈니스 검증 규칙이 추가되어야 합니다.

**오답 분석:**
- Option A (오답): 숫자 형식과 필수 제약 조건이 충족되었으므로 스키마 위반(Schema violation)이 아닙니다.
- Option C (오답): 텍스트가 토큰 길이에 걸려 잘린 것(Truncation)이 아니며, `max_tokens`를 늘려도 모호한 기호의 오해석 문제가 해결되지 않습니다.
- Option D (오답): 모델은 거부(Refusal)하지 않고 요청받은 데이터를 정상적으로 생성했으나, 내용상 잘못된 값을 출력한 것입니다.


---


### 17번 문제

**문제 원문**

A function signature changes in module A, and callers in modules B and C are updated inconsistently, causing a runtime mismatch. Per-file passes each judged their own file correct in isolation and missed the mismatch. Which review step should have caught this, and why?

A) A longer per-file pass that reads both module A and module B together in one sitting rather than as two separate local passes

B) The cross-file integration pass, because it traces data flow and interface usage across files rather than analyzing each file alone

C) A second per-file pass over module A alone, since re-reading the same file twice increases the chance of noticing the signature change

D) The self-review step performed by the generator, since it still remembers why it changed the signature and can check callers from memory


---


**구간별 직독직해 번역**

**QUESTION:**

**A function signature changes**
함수 시그니처가 변경됩니다

**in module A,**
모듈 A에서,

**and callers**
그리고 호출부들이

**in modules B and C**
모듈 B와 C에 있는

**are updated inconsistently,**
비일관되게 업데이트되어,

**causing a runtime mismatch.**
런타임 불일치를 발생시킵니다.

**Per-file passes**
파일별 검토 단계들은

**each judged**
각각 판단했습니다

**their own file correct**
자기 자신의 파일이 올바르다고

**in isolation**
단독으로(격리된 상태에서)

**and missed the mismatch.**
그리고 불일치를 놓쳤습니다.

**Which review step**
어떤 검토 단계가

**should have caught this,**
이것을 잡아냈어야 했습니까,

**and why?**
그리고 그 이유는 무엇입니까?


**OPTIONS:**

**A) A longer per-file pass**
더 긴 파일별 검토 단계

**that reads both**
둘 다 읽는

**module A and module B together**
모듈 A와 모듈 B를 함께

**in one sitting**
한 번에

**rather than as two separate local passes**
두 개의 개별 로컬 검토 단계로 나누는 대신


**B) The cross-file integration pass,**
교차 파일 통합 검토 단계,

**because it traces**
추적하기 때문에

**data flow and interface usage**
데이터 흐름과 인터페이스 사용을

**across files**
여러 파일에 걸쳐

**rather than analyzing**
분석하는 대신

**each file alone**
각 파일을 단독으로


**C) A second per-file pass**
두 번째 파일별 검토 단계

**over module A alone,**
모듈 A만을 대상으로 하는,

**since re-reading the same file twice**
동일한 파일을 두 번 다시 읽는 것이

**increases the chance**
가능성을 높여주기 때문에

**of noticing the signature change**
시그니처 변경을 감지할


**D) The self-review step**
자체 검토 단계

**performed by the generator,**
생성기에 의해 수행되는,

**since it still remembers**
여전히 기억하고 있기 때문에

**why it changed the signature**
왜 시그니처를 변경했는지

**and can check callers**
그리고 호출부들을 확인할 수 있기 때문에

**from memory**
기억에 의존하여


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: The cross-file integration pass, because it traces data flow and interface usage across files rather than analyzing each file alone

**정답 및 해설:**

**핵심 개념**: 파일 간 통합 분석(Cross-file Integration Pass)
코드 검토 및 정적 분석 파이프라인에서 개별 파일 단위 분석(Per-file Pass)은 각 파일 내부의 구문 및 로컬 오류만 검증할 수 있습니다. 모듈 간 모순이나 인터페이스 불일치(Mismatch)는 여러 파일 사이의 인터페이스 호출 관계 및 데이터 흐름을 교차 검증하는 **Cross-file Integration Pass**가 필수적입니다.

**문제 상황 분석:**
- 모듈 A의 함수 시그니처가 변경되었으나, 이를 호출하는 모듈 B와 C가 제대로 반영되지 않음
- 파일 단위(Per-file) 검토 도구들은 각각의 파일 내부 기준(단독 판단)으로는 이상이 없다고 판단함
- 그 결과 파일 간 연동 지점에서 발생하는 런타임 오류(Mismatch)를 놓치게 됨

**B번이 정답인 이유:**
개별 파일만으로는 모듈 A의 변화가 모듈 B와 C에 미치는 파급 효과를 검증할 수 없습니다. 파일을 넘나들며 인터페이스의 호출 상태와 데이터 흐름을 추적(Cross-file tracing)하는 통합 검토 단계(Cross-file integration pass)만이 이러한 멀티 파일 불일치를 정확히 감지할 수 있습니다.

**오답 분석:**
- Option A (오답): 모듈 A와 B만 같이 읽는 것은 여전히 임시방편일 뿐이며, 모듈 C와의 불일치는 놓치게 되고 교차 파일 분석의 정식 메커니즘을 대체하지 못합니다.
- Option C (오답): 모듈 A를 두 번 읽는다고 해서 모듈 B, C에서의 잘못된 호출 방식이 발견되는 것은 아닙니다.
- Option D (오답): 생성기(Generator/LLM)의 메모리나 맥락에 의존하는 자체 검토는 환각(Hallucination)이나 컨텍스트 유실로 인해 신뢰할 수 없으며, 명확한 파일 간 교차 분석 단계가 요구됩니다.


---


### 18번 문제

**문제 원문**

A content-moderation prompt must decide whether borderline posts (e.g., dark sarcasm about a sensitive topic) should be escalated for human review or allowed to stand. The instructions describe general moderation policy, but the model's escalation decisions on borderline posts are inconsistent between similar sessions. The team wants to add a small number of examples that will generalize well. Which set of examples would be most effective?

A) Two to four borderline posts, each paired with the escalation decision and a brief rationale for it

B) One example of the single most extreme violation the team has ever seen, as a strong anchor

C) A restated summary of the moderation policy, broken into a numbered checklist instead of paragraphs

D) Ten or more posts that are obviously fine, giving the model abundant precedent for the common case


---


**구간별 직독직해 번역**

**QUESTION:**

**A content-moderation prompt**
콘텐츠 중재 프롬프트는

**must decide whether**
여부를 결정해야 합니다

**borderline posts**
경계선에 있는 게시물이

**(e.g., dark sarcasm**
(예: 어두운 풍자/비꼬임

**about a sensitive topic)**
민감한 주제에 대한)

**should be escalated**
이관되어야 하는지

**for human review**
사람의 검토를 위해

**or allowed to stand.**
혹은 그대로 유지되도록 허용되어야 하는지.

**The instructions describe**
지시사항은 설명하지만

**general moderation policy,**
일반적인 중재 정책을,

**but the model's escalation decisions**
모델의 이관 결정은

**on borderline posts**
경계선 게시물에 대한

**are inconsistent**
비일관적입니다

**between similar sessions.**
유사한 세션 간에.

**The team wants to add**
팀은 추가하기를 원합니다

**a small number of examples**
소수의 예시를

**that will generalize well.**
잘 일반화될 수 있는.

**Which set of examples**
어떤 예시 세트가

**would be most effective?**
가장 효과적이겠습니까?


**OPTIONS:**

**A) Two to four borderline posts,**
2~4개의 경계선 게시물,

**each paired with**
각각 결합된

**the escalation decision**
이관 결정과

**and a brief rationale for it**
그에 대한 짧은 근거/이유가


**B) One example**
하나의 예시

**of the single most extreme violation**
가장 극단적인 단 하나의 위반 사례의

**the team has ever seen,**
팀이 지금까지 본 적 있는,

**as a strong anchor**
강력한 기준점(anchor)으로서


**C) A restated summary**
재정리된 요약

**of the moderation policy,**
중재 정책의,

**broken into a numbered checklist**
번호가 매겨진 체크리스트로 나뉜

**instead of paragraphs**
줄글 단락 대신


**D) Ten or more posts**
10개 이상의 게시물

**that are obviously fine,**
명백히 문제없는,

**giving the model**
모델에게 제공하는

**abundant precedent**
풍부한 선례를

**for the common case**
흔한 사례에 대한


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Two to four borderline posts, each paired with the escalation decision and a brief rationale for it

**정답 및 해설:**

**핵심 개념**: CoT(Chain-of-Thought)를 결합한 Few-shot Prompting
LLM이 애매한 경계선 사례(Borderline case)를 일관되게 판단하도록 만들려면 단순히 결과만 제시하기보다, **판단 결과와 그 이유(Rationale)**를 함께 보여주는 퓨샷 예시를 구성해야 모델이 판정의 논리를 학습하고 일반화할 수 있습니다.

**문제 상황 분석:**
- 일반적인 정책 지시문은 존재하지만 모호한 경계선 사례에서 판단 불일치(Inconsistency)가 발생함
- 일반화(Generalization)가 잘 되는 소수의 예시를 프롬프트에 추가하고자 함
- 판단 기준을 명확히 제시해 모델의 추론 방향을 고정하는 기법이 필요함

**A번이 정답인 이유:**
경계선에 위치한 실제 사례 2~4개와 함께 '이관 여부' 및 '그렇게 판단한 짧은 근거(Rationale)'를 쌍으로 제공하면, 모델은 단순 패턴 기억을 넘어 **어떤 기준으로 경계선을 구분하는지** 추론 방식(Chain-of-Thought)을 학습하게 됩니다. 이는 유사한 새로운 사례에도 우수한 일반화 성능을 보여줍니다.

**오답 분석:**
- Option B (오답): 극단적인 위반 사례 1개는 경계선(Borderline)에 있는 애매한 게시물을 판별하는 데 아무런 도움이 되지 못합니다.
- Option C (오답): 정책을 체크리스트 형태의 지시문으로 바꾸는 것은 예시(Examples)가 아니며, 이미 일반 규칙만으로 판단에 실패하고 있는 상태이므로 예시 제공이 필수적입니다.
- Option D (오답): 명백히 문제가 없는 일반적인 게시물 예시는 경계선 사례의 엄격한 판별 기준을 세우는 데 도움을 주지 못합니다.


---


### 19번 문제

**문제 원문**

A data pipeline promises stakeholders that classification results for any document will be delivered no later than 48 hours after ingestion. The team plans to route documents through the Message Batches API, which can take up to 24 hours to finish a batch. What is the longest interval the team can wait between batch submission cycles while still meeting the 48-hour promise?

A) 6 hours between submissions, since frequent small batches always complete faster than the standard 24-hour processing window allows

B) 48 hours between submissions, since the deadline itself defines how rarely the pipeline needs to kick off a new batch cycle

C) 12 hours between submissions, since halving the processing window doubles the safety margin the pipeline needs against demand spikes

D) 24 hours between submissions, since a document waiting the full interval still finishes within the 24-hour batch window before the 48-hour deadline


---


**구간별 직독직해 번역**

**QUESTION:**

**A data pipeline promises**
데이터 파이프라인은 약속합니다

**stakeholders that**
이해관계자들에게 ~라고

**classification results**
분류 결과가

**for any document**
어떤 문서에 대해서든

**will be delivered**
전달될 것이라고

**no later than 48 hours**
48시간 이내에

**after ingestion.**
수집(입력)된 후.

**The team plans**
팀은 계획합니다

**to route documents**
문서들을 전송하기로

**through the Message Batches API,**
Message Batches API를 통해,

**which can take up to 24 hours**
최대 24시간이 걸릴 수 있는

**to finish a batch.**
배치를 완료하는 데.

**What is the longest interval**
가장 긴 간격은 얼마입니까

**the team can wait**
팀이 대기할 수 있는

**between batch submission cycles**
배치 제출 주기 사이에

**while still meeting**
여전히 충족하면서

**the 48-hour promise?**
48시간 약속을?


**OPTIONS:**

**A) 6 hours between submissions,**
제출 사이에 6시간,

**since frequent small batches**
빈번한 작은 배치들이

**always complete faster**
항상 더 빠르게 완료되기 때문에

**than the standard 24-hour processing window allows**
표준 24시간 처리 시간 창이 허용하는 것보다


**B) 48 hours between submissions,**
제출 사이에 48시간,

**since the deadline itself**
마감일 자체가

**defines how rarely**
얼마나 드물게 정의하기 때문에

**the pipeline needs to kick off**
파이프라인이 시작할 필요가 있는지를

**a new batch cycle**
새로운 배치 주기를


**C) 12 hours between submissions,**
제출 사이에 12시간,

**since halving the processing window**
처리 시간 창을 반으로 줄이는 것이

**doubles the safety margin**
안전 마진을 두 배로 늘려주기 때문에

**the pipeline needs**
파이프라인이 필요로 하는

**against demand spikes**
수요 급증에 대비해


**D) 24 hours between submissions,**
제출 사이에 24시간,

**since a document waiting the full interval**
전체 간격을 대기하는 문서가

**still finishes**
여전히 완료되기 때문에

**within the 24-hour batch window**
24시간 배치 시간 창 내에서

**before the 48-hour deadline**
48시간 마감일 이전에


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: 24 hours between submissions, since a document waiting the full interval still finishes within the 24-hour batch window before the 48-hour deadline

**정답 및 해설:**

**핵심 개념**: 최악의 상황(Worst-case Scenario) 대기 시간 계산
전체 허용 처리 시간 SLA(Service Level Agreement)가 $T_{\text{total}}$이고 배치 실행 시 최장 소요 시간이 $T_{\text{execution}}$일 때, 문서가 수집된 후 배치 제출까지 대기할 수 있는 최장 간격 $T_{\text{interval}}$은 $T_{\text{total}} - T_{\text{execution}}$ 공식으로 계산됩니다.

**문제 상황 분석:**
- 전체 약속된 마감 시간(SLA): 수집 후 최대 48시간
- 배치 처리 최장 소요 시간: 최대 24시간
- 어떤 문서가 들어온 직후 이전 배치가 제출되어, 다음 배치 제출까지 전체 간격을 기다려야 하는 최악의 상황(Worst-case)을 고려해야 함

**D번이 정답인 이유:**
문서가 수집된 직후 다음 배치 제출까지 최장 간격인 24시간을 대기하더라도, 그 후 배치가 제출되어 실행 완결까지 최장 24시간이 걸리면 총 소요 시간은 $24\text{시간 (대기)} + 24\text{시간 (처리)} = 48\text{시간}$이 됩니다. 따라서 48시간 약속을 완벽히 준수할 수 있는 가장 긴 배치 제출 주기 간격은 **24시간**입니다.

**오답 분석:**
- Option A (오답): 6시간은 48시간 조건을 충족하지만 "가장 긴 간격(longest interval)"이 아닙니다. 또한 '작은 배치가 항상 더 빠르다'는 전제도 보장되지 않습니다.
- Option B (오답): 48시간 간격으로 제출할 경우, 배치가 제출된 후 실행 시간(최대 24시간)이 추가되어 총 소요 시간이 최대 72시간이 될 수 있어 마감일을 위배합니다.
- Option C (오답): 12시간 역시 약속을 충족하지만, 24시간이라는 더 길면서 유효한 제출 간격이 존재하므로 최장 간격이 아닙니다.


---


### 20번 문제

**문제 원문**

A team already tried adding "only report issues you are confident about" to a noisy category and saw no improvement in precision. An architect now wants to redesign the category's scope entirely rather than continuing to tune confidence language. Which redesign reflects the correct lesson from the earlier failed attempt?

A) Rephrase the same confidence instruction using stronger emphasis, such as capitalizing key words, so the model treats the requirement as a stricter constraint.

B) Keep the confidence instruction but add a numeric percentage threshold to it, so the model has a specific number to compare its confidence against.

C) Replace the confidence instruction with a list of the specific issue types that qualify for this category, and explicitly state which related issue types should be skipped.

D) Move the confidence instruction from the system prompt into the user message instead, on the assumption that message placement was the reason it had no effect.


---


**구간별 직독직해 번역**

**QUESTION:**

**A team already tried adding**
한 팀이 이미 추가를 시도했습니다

**"only report issues**
"이슈만 보고하십시오

**you are confident about"**
당신이 확신하는"이라는 문구를

**to a noisy category**
노이즈가 많은 카테고리에

**and saw no improvement**
그리고 아무런 향상을 보지 못했습니다

**in precision.**
정밀도(precision)에서.

**An architect now wants**
아키텍터는 이제 원합니다

**to redesign the category's scope entirely**
카테고리의 범위를 전면 재설계하기를

**rather than continuing**
계속하는 대신에

**to tune confidence language.**
신뢰도 관련 문구를 조정하는 것을.

**Which redesign reflects**
어떤 재설계가 반영합니까

**the correct lesson**
올바른 교훈을

**from the earlier failed attempt?**
이전의 실패한 시도로부터의?


**OPTIONS:**

**A) Rephrase the same confidence instruction**
동일한 신뢰도 지시사항을 재구성합니다

**using stronger emphasis,**
더 강한 강조를 사용하여,

**such as capitalizing key words,**
주요 단어를 대문자로 쓰는 것과 같이,

**so the model treats the requirement**
모델이 그 요구사항을 처리하도록

**as a stricter constraint.**
더 엄격한 제약조건으로.


**B) Keep the confidence instruction**
신뢰도 지시사항을 유지하되

**but add a numeric percentage threshold**
숫자로 된 백분율 임계값을 추가합니다

**to it,**
그것에,

**so the model has a specific number**
모델이 구체적인 숫자를 가지도록

**to compare its confidence against.**
자신의 신뢰도와 비교할 수 있는.


**C) Replace the confidence instruction**
신뢰도 지시사항을 대체합니다

**with a list of the specific issue types**
구체적인 이슈 유형 목록으로

**that qualify for this category,**
이 카테고리에 해당하는,

**and explicitly state**
그리고 명시적으로 서술합니다

**which related issue types**
어떤 관련 이슈 유형이

**should be skipped.**
건너뛰어져야 하는지.


**D) Move the confidence instruction**
신뢰도 지시사항을 이동합니다

**from the system prompt**
시스템 프롬프트로부터

**into the user message instead,**
대신 사용자 메시지 내부로,

**on the assumption that**
~라는 가정하에

**message placement was the reason**
메시지 배치가 원인이었다는

**it had no effect.**
그것이 효과가 없었던.


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**C번**: Replace the confidence instruction with a list of the specific issue types that qualify for this category, and explicitly state which related issue types should be skipped.

**정답 및 해설:**

**핵심 개념**: 모호한 신뢰도 지시어(Confidence Language) 지양 및 구체적 범주화(Explicit Scoping)
LLM에게 "자신 있는 문제만 보고해라" 또는 "확신률 80% 이상만 출력해라" 같은 주관적/모호한 지시어(Confidence Language)는 모델의 교정(Calibration) 능력 한계로 인해 정밀도 향상에 거의 기여하지 못합니다. 정밀도를 높이기 위해서는 분류 기준과 제외 기준을 구체적이고 명확한 규칙(Inclusion/Exclusion criteria)으로 프롬프트에 명시해야 합니다.

**문제 상황 분석:**
- 노이즈(False Positive)가 많이 발생하는 카테고리를 정제하기 위해 "확신하는 것만 보고하라"는 지시를 추가했으나 정밀도가 개선되지 않음
- 모델에게 신뢰도에 대한 주관적 판단을 맡기는 문구(Confidence language)는 효과가 없음이 증명됨
- 카테고리의 범주(Scope) 자체를 명확히 재설계하여 근본적인 노이즈를 줄여야 하는 상황임

**C번이 정답인 이유:**
이전 실패의 핵심 교훈은 '모델에게 자율적인 신뢰도 판단을 맡기면 안 된다'는 점입니다. 따라서 모호한 신뢰도 문구를 완전히 제거하고, 이 카테고리에 정확히 해당하는 이슈 유형(Inclusion)과 제외해야 할 유사 이슈 유형(Exclusion)의 목록을 명시적으로 프롬프트에 정의해 주는 것이 가장 확실한 재설계 방안입니다.

**오답 분석:**
- Option A (오답): 단어를 대문자로 강조하는 등 표현을 강하게 바꾸는 방식 역시 여전히 모호한 '신뢰도 지시어' 범주에 머물러 있으므로 실패를 되풀이하게 됩니다.
- Option B (오답): "80% 이상"과 같이 수치화된 백분율을 제시해도, LLM 내부에서 이를 객관적으로 산출하고 비교하는 메커니즘이 없으므로 모호성이 해결되지 않습니다.
- Option D (오답): 메시지의 위치(시스템 프롬프트 vs 사용자 메시지)를 바꾸는 것은 지시어 자체가 가진 주관성과 모호함이라는 근본 원인을 해결하지 못합니다.


---


### 21번 문제

**문제 원문**

A financial-reconciliation pipeline retries an extraction ten times because the extracted transaction list never sums to the extracted statement total. Investigation reveals that the bank statement itself contains a genuine arithmetic error introduced by the issuing bank. What should the pipeline do once this is discovered?

A) Stop retrying, since the mismatch comes from an inconsistency in the source rather than a correctable extraction mistake

B) Continue retrying indefinitely, since enough attempts will eventually make the model's numbers sum correctly overall anyway

C) Switch the extraction schema to omit the statement total field so this mismatch can no longer be detected

D) Increase max_tokens on every retry, assuming the mismatch is caused by truncation before the total was written


---


**구간별 직독직해 번역**

**QUESTION:**

**A financial-reconciliation pipeline**
재무 대조 파이프라인이

**retries an extraction**
추출을 재시도합니다

**ten times**
10번 동안

**because the extracted transaction list**
추출된 거래 내역 목록이

**never sums to**
결코 합산되지 않기 때문에

**the extracted statement total.**
추출된 내역서 총액과.

**Investigation reveals that**
조사 결과 밝혀졌습니다

**the bank statement itself**
은행 내역서 자체가

**contains a genuine arithmetic error**
실제 산술 오류를 포함하고 있다는 것이

**introduced by the issuing bank.**
발급 은행에 의해 발생한.

**What should the pipeline do**
파이프라인은 무엇을 해야 합니까

**once this is discovered?**
이것이 발견된 후에는?


**OPTIONS:**

**A) Stop retrying,**
재시도를 중단합니다,

**since the mismatch comes from**
불일치가 연유하기 때문에

**an inconsistency in the source**
원본 데이터 자체의 불일치에서

**rather than a correctable extraction mistake**
수정 가능한 추출 오류가 아니라


**B) Continue retrying indefinitely,**
무기한으로 재시도를 계속합니다,

**since enough attempts**
충분한 시도가

**will eventually make**
결국 만들 것이기 때문에

**the model's numbers sum correctly**
모델의 숫자들이 올바르게 합산되도록

**overall anyway**
어쨌든 전반적으로


**C) Switch the extraction schema**
추출 스키마를 변경합니다

**to omit the statement total field**
내역서 총액 필드를 생략하도록

**so this mismatch**
이 불일치가

**can no longer be detected**
더 이상 감지될 수 없도록


**D) Increase max_tokens**
max_tokens를 늘립니다

**on every retry,**
매 재시도마다,

**assuming the mismatch is caused**
불일치가 원인이라고 가정하여

**by truncation**
잘림(truncation)에 의한

**before the total was written**
총액이 작성되기 전에


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Stop retrying, since the mismatch comes from an inconsistency in the source rather than a correctable extraction mistake

**정답 및 해설:**

**핵심 개념**: 재시도 루프(Retry Loop)의 한계와 원본 데이터 오류(Source Data Error)
LLM 파이프라인의 재시도(Retry) 메커니즘은 추출 과정에서 발생하는 환각이나 일시적인 생성 오류를 바로잡기 위한 것입니다. 원본 문서(Source Document) 자체에 오류가 존재하는 경우, 아무리 재시도를 하더라도 모델이 정확한 추출을 수행하는 한 불일치는 결코 해결되지 않습니다.

**문제 상황 분석:**
- 추출된 거래 목록의 합계와 내역서 총액이 일치하지 않아 파이프라인이 10회 재시도를 수행함
- 원인 조사 결과, 추출 오류가 아니라 발급 은행이 작성한 원본 문서 자체에 산술 오류가 있음이 확인됨
- 모델은 원본에 기재된 숫자를 올바르게 추출하고 있으나, 원본 데이터 간의 비일관성으로 인해 검증을 통과하지 못함

**A번이 정답인 이유:**
불일치의 원인이 모델의 추출 실수가 아닌 원본 데이터의 결함(Inconsistency in the source) 때문이므로, 재시도를 반복하는 것은 컴퓨팅 자원과 비용만 낭비하게 됩니다. 따라서 즉시 재시도를 중단하고 이 오류를 원본 데이터 문제로 처리(예: 예외 처리 또는 담당자 검토로 전환)해야 합니다.

**오답 분석:**
- Option B (오답): 원본 데이터가 잘못되었는데 재시도를 계속하여 합계가 맞도록 만드는 것은, 모델에게 원본과 다른 거짓 데이터(환각)를 생성하도록 유도하는 잘못된 행위입니다.
- Option C (오답): 불일치를 감지하지 못하도록 스키마에서 총액 필드를 삭제하는 것은 데이터 검증 파이프라인의 목적 자체를 무력화하는 무책임한 방식입니다.
- Option D (오답): 출력 토큰 제한에 걸려 데이터가 잘린 것이 아니므로 `max_tokens`를 늘리는 것은 문제의 원인과 무관합니다.


---


### 22번 문제

**문제 원문**

A tax-document extractor needs a dependent's Social Security number, but the field has been physically redacted with a black marker on the scanned form supplied to the pipeline. Repeated retries with detailed error feedback still return an empty field. What does this situation illustrate?

A) A prompt-caching issue where the redacted value was cached in a prior turn and needs to be evicted before retrying

B) A limit of retries: when required information is genuinely absent from the source, feedback retries cannot recover it

C) A tool-input validation failure that will resolve itself once the model is given a strict schema for the SSN field

D) A schema syntax error that structured output enforcement should have already eliminated before it reached this layer entirely


---


**구간별 직독직해 번역**

**QUESTION:**

**A tax-document extractor**
세무 서류 추출기는

**needs a dependent's**
부양가족의 필요로 합니다

**Social Security number,**
사회보장번호(SSN)를,

**but the field**
하지만 해당 필드는

**has been physically redacted**
물리적으로 수정(블라인드/가림)되었습니다

**with a black marker**
검은색 마커로

**on the scanned form**
스캔된 서식에서

**supplied to the pipeline.**
파이프라인에 제공된.

**Repeated retries**
반복된 재시도들은

**with detailed error feedback**
상세한 오류 피드백을 포함한

**still return**
여전히 반환합니다

**an empty field.**
빈 필드를.

**What does this situation**
이 상황은 무엇을

**illustrate?**
보여줍니까?


**OPTIONS:**

**A) A prompt-caching issue**
프롬프트 캐싱 문제

**where the redacted value**
수정된(가려진) 값이

**was cached in a prior turn**
이전 턴에 캐시되어

**and needs to be evicted**
제거될 필요가 있는

**before retrying**
재시도하기 전에


**B) A limit of retries:**
재시도의 한계:

**when required information**
필요한 정보가

**is genuinely absent**
진짜로 부재할 때

**from the source,**
원본 데이터로부터,

**feedback retries**
피드백 재시도는

**cannot recover it**
그것을 복구할 수 없다는 것


**C) A tool-input validation failure**
도구 입력 검증 실패

**that will resolve itself**
자체적으로 해결될

**once the model is given**
모델에 제공되면

**a strict schema**
엄격한 스키마가

**for the SSN field**
SSN 필드에 대한


**D) A schema syntax error**
스키마 구문 오류

**that structured output enforcement**
구조화된 출력 강제가

**should have already eliminated**
이미 제거했어야 하는

**before it reached**
도달하기 전에

**this layer entirely**
이 레이어에 완전히


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: A limit of retries: when required information is genuinely absent from the source, feedback retries cannot recover it

**정답 및 해설:**

**핵심 개념**: 재시도(Retry) 메커니즘의 한계와 데이터 부재(Absence of Data)
재시도 및 피드백 루프는 모델의 일시적 단순 실수나 형식을 바로잡는 데 효과적이지만, 원본 입력 데이터(Source Input) 자체에 정보가 존재하지 않는 물리적 결함 상태에서는 아무리 피드백을 주며 재시도를 거듭하더라도 없는 데이터를 만들어낼 수 없습니다.

**문제 상황 분석:**
- 스캔된 양식에서 사회보장번호(SSN)가 검은 마커로 가려져(redacted) 원본 문서에 물리적으로 정보가 존재하지 않음
- 파이프라인이 에러 피드백을 주며 재시도를 반복했으나 여전히 빈 값을 출력함
- 정보 자체가 입력값에 없으므로 재시도 루프가 무의미하게 반복되는 전형적인 상황임

**B번이 정답인 이유:**
원본 소스 문서에 필요한 정보가 근본적으로 존재하지 않는 경우(genuinely absent), 아무리 오류 피드백과 함께 재시도를 보낸다 한들 존재하지 않는 정보를 복구할 수는 없습니다. 이는 재시도 패턴이 해결할 수 없는 명확한 시스템적 한계를 보여주는 사례입니다.

**오답 분석:**
- Option A (오답): 프롬프트 캐싱의 캐시 만료/삭제(Eviction) 문제가 아니라, 입력 이미지 데이터 자체에 값이 존재하지 않는 문제입니다.
- Option C (오답): 엄격한 스키마를 부여한다 해도 원본에 가려진 숫자를 읽어낼 수는 없으므로 도구 입력 검증 문제가 아닙니다.
- Option D (오답): 스키마의 구문 에러(Syntax error)가 아니라, 추출 대상 정보의 부재로 인한 콘텐츠 수준의 한계입니다.


---


### 23번 문제

**문제 원문**

A QA team wants to generate new regression test cases for 40,000 legacy modules once per night. No developer is waiting on the output, and the team only needs the results within 24 hours for review the following day. Cost efficiency is a priority. Which approach best fits this workload?

A) The synchronous Messages API, since nightly jobs should minimize total wall-clock time by streaming each response as soon as it is generated.

B) The Message Batches API, since the workload is latency-tolerant and the 50% cost discount scales well across 40,000 requests, while the 24-hour SLA fits the team's deadline.

C) The Message Batches API, since batching is required whenever a job processes more than a few hundred requests in one run.

D) The synchronous Messages API, since running each request in sequence guarantees every test case is ready before the night's job window closes.


---


**구간별 직독직해 번역**

**QUESTION:**

**A QA team wants**
QA 팀이 원합니다

**to generate new**
새로 생성하기를

**regression test cases**
회귀 테스트 케이스들을

**for 40,000 legacy modules**
40,000개의 레거시 모듈에 대해

**once per night.**
하룻밤에 한 번씩.

**No developer is waiting**
어떤 개발자도 기다리지 않고 있으며

**on the output,**
출력 결과를,

**and the team only needs**
팀은 그저 필요로 할 뿐입니다

**the results within 24 hours**
24시간 이내의 결과를

**for review the following day.**
다음 날 검토를 위한.

**Cost efficiency**
비용 효율성이

**is a priority.**
우선순위입니다.

**Which approach**
어떤 접근 방식이

**best fits this workload?**
이 워크로드에 가장 적합합니까?


**OPTIONS:**

**A) The synchronous Messages API,**
동기식 Messages API,

**since nightly jobs**
야간 작업이 ~해야 하기 때문에

**should minimize total wall-clock time**
총 소요 시간을 최솟화해야

**by streaming each response**
각 응답을 스트리밍함으로써

**as soon as it is generated.**
생성되는 즉시.


**B) The Message Batches API,**
Message Batches API,

**since the workload**
워크로드가 ~하기 때문에

**is latency-tolerant**
지연 시간에 관대하고(지연을 허용하고)

**and the 50% cost discount**
50% 비용 할인이

**scales well**
효율적으로 적용되기 때문에

**across 40,000 requests,**
40,000개의 요청 전반에 걸쳐,

**while the 24-hour SLA**
반면에 24시간 SLA가

**fits the team's deadline.**
팀의 마감 기한에 부합하는 동안.


**C) The Message Batches API,**
Message Batches API,

**since batching is required**
배치 처리가 필수적이기 때문에

**whenever a job processes**
작업이 처리할 때마다

**more than a few hundred requests**
수백 개 이상의 요청을

**in one run.**
한 번의 실행에서.


**D) The synchronous Messages API,**
동기식 Messages API,

**since running each request**
각 요청을 실행하는 것이

**in sequence guarantees**
순차적으로 보장하기 때문에

**every test case is ready**
모든 테스트 케이스가 준비되는 것을

**before the night's job window closes.**
밤의 작업 시간 창이 닫히기 전에.


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: The Message Batches API, since the workload is latency-tolerant and the 50% cost discount scales well across 40,000 requests, while the 24-hour SLA fits the team's deadline.

**정답 및 해설:**

**핵심 개념**: Message Batches API & 비용 최적화(Cost Optimization)
Message Batches API는 지연 시간에 민감하지 않은(Latency-tolerant) 비동기 대량 작업에 최적화되어 있으며, 24시간 이내의 처리 SLA 조건으로 기존 동기식 API 대비 **50%의 비용 할인**을 제공합니다.

**문제 상황 분석:**
- 매일 밤 40,000개의 대량 모듈에 대한 테스트 케이스를 생성해야함
- 결과를 즉시 기다리는 개발자가 없으며, 다음 날 검토를 위한 24시간 이내의 처리 시간이 허용됨 (Latency-tolerant)
- 최우선 고려 요구사항은 '비용 효율성(Cost efficiency)'임

**B번이 정답인 이유:**
요청 건수가 40,000건으로 매우 크고, 즉각적인 응답이 필요 없는 비동기 작업이므로 Message Batches API가 완벽히 들어맞습니다. 24시간 내 처리 SLA가 팀의 요구사항(24시간 내 결과 필요)과 일치하며, 50% 할인 혜택을 통해 대규모 작업의 비용을 대폭 절감할 수 있습니다.

**오답 분석:**
- Option A (오답): 실시간 응답이 필요하지 않은 야간 작업에 동기식(Synchronous) API를 사용하면 비용 절감 기회를 놓치게 됩니다.
- Option C (오답): 배치 처리(Batching)가 수백 건 이상일 때 '의무/필수(Required)'로 강제되는 제약 조건은 존재하지 않습니다. 선택의 핵심 기준은 지연 허용 여부와 비용 할인입니다.
- Option D (오답): 40,000개의 요청을 동기식으로 순차 실행(In sequence)하면 엄청난 시간이 소요될 뿐만 아니라 네트워크 타임아웃 및 높은 비용 문제를 야기합니다.


---


### 24번 문제

**문제 원문**

A financial services firm uses a tool-based schema to extract transaction records from PDF statements, including a required amount field and a required transaction_type field. An audit later finds several instances where deposits were mislabeled as withdrawals, even though every amount and transaction_type field is present and passes schema validation. What does this best illustrate about JSON schema enforcement via tool use?

A) Schema validation confirms that required fields exist and have the correct types but it cannot verify that the values are semantically correct relative to the source document, so mislabeling errors like this can still occur.

B) This indicates that the input_schema was likely malformed, since a correctly constructed JSON schema can apply constraints that verify the relationship between amount and transaction_type, preventing such semantic mislabeling.

C) This is expected only when strict mode is disabled, because strict mode enforces that field values must satisfy the schema's semantic rules, such as ensuring transaction_type accurately reflects the amount sign, thereby preventing mislabeling.

D) The mislabeling proves that without a tool_choice that forces a specific tool invocation, the model may output transaction_type labels that diverge from the source document's content, leading to semantic inaccuracies in the extracted data.


---


**구간별 직독직해 번역**

**QUESTION:**

**A financial services firm uses**
한 금융 서비스 회사가 사용합니다

**a tool-based schema**
도구 기반 스키마를

**to extract transaction records**
거래 기록을 추출하기 위해

**from PDF statements,**
PDF 내역서로부터,

**including a required amount field**
필수 amount(금액) 필드와

**and a required transaction_type field.**
필수 transaction_type(거래 유형) 필드를 포함하여.

**An audit later finds**
감사 결과 나중에 발견됩니다

**several instances**
수많은 사례들이

**where deposits were mislabeled**
입금이 잘못 라벨링된

**as withdrawals,**
출금으로,

**even though every amount**
모든 amount 필드와

**and transaction_type field**
transaction_type 필드가

**is present**
존재하고

**and passes schema validation.**
스키마 검증을 통과했음에도 불구하고.

**What does this best illustrate**
이것은 무엇을 가장 잘 보여줍니까

**about JSON schema enforcement**
JSON 스키마 강제 적용에 대해

**via tool use?**
도구 사용을 통한?


**OPTIONS:**

**A) Schema validation confirms**
스키마 검증은 확인합니다

**that required fields exist**
필수 필드가 존재하고

**and have the correct types**
올바른 유형을 가지고 있음을

**but it cannot verify**
하지만 검증할 수는 없습니다

**that the values are semantically correct**
값들이 의미론적으로 올바른지

**relative to the source document,**
원본 문서와 비교하여,

**so mislabeling errors like this**
따라서 이와 같은 오라벨링 오류는

**can still occur.**
여전히 발생할 수 있습니다.


**B) This indicates that**
이것은 나타냅니다

**the input_schema was likely malformed,**
input_schema가 잘못 형성되었을 가능성을,

**since a correctly constructed JSON schema**
올바르게 구성된 JSON 스키마는 ~할 수 있기 때문에

**can apply constraints**
제약 조건을 적용할 수

**that verify the relationship**
관계를 검증하는

**between amount and transaction_type,**
amount와 transaction_type 사이의,

**preventing such semantic mislabeling.**
이러한 의미론적 오라벨링을 방지하면서.


**C) This is expected only**
이것은 오직 예상됩니다

**when strict mode is disabled,**
엄격 모드(strict mode)가 비활성화되었을 때만,

**because strict mode enforces**
엄격 모드가 강제하기 때문에

**that field values must satisfy**
필드 값이 만족해야 함을

**the schema's semantic rules,**
스키마의 의미론적 규칙을,

**such as ensuring transaction_type**
transaction_type이 확실히 ~하도록 하는 것과 같은

**accurately reflects the amount sign,**
금액 부호를 정확히 반영하도록,

**thereby preventing mislabeling.**
그로 인해 오라벨링을 방지하면서.


**D) The mislabeling proves that**
오라벨링은 증명합니다

**without a tool_choice**
tool_choice가 없이는

**that forces a specific tool invocation,**
특정 도구 호출을 강제하는,

**the model may output**
모델이 출력할 수 있음을

**transaction_type labels**
transaction_type 라벨을

**that diverge from**
~와 일치하지 않는(벗어나는)

**the source document's content,**
원본 문서의 내용과,

**leading to semantic inaccuracies**
의미론적 부정확성으로 이어지면서

**in the extracted data.**
추출된 데이터에서.


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**A번**: Schema validation confirms that required fields exist and have the correct types but it cannot verify that the values are semantically correct relative to the source document, so mislabeling errors like this can still occur.

**정답 및 해설:**

**핵심 개념**: 구문/구조 검증(Schema Validation) vs 의미론적 정확성(Semantic Accuracy)
JSON 스키마 검증은 출력 데이터의 구조적 구격(필수 필드 존재 여부, 데이터 타입, 허용된 enum 값 등)만 판별합니다. 추출된 데이터가 원본 문서의 실제 내용과 부합하는지 여부(의미론적 정확성)는 스키마 검증 범위 밖의 영역입니다.

**문제 상황 분석:**
- 필수 필드인 `amount`와 `transaction_type`이 모두 존재함
- 데이터 타입과 스키마 규칙을 충족하여 JSON Schema Validation을 에러 없이 통과함
- 하지만 원본 문서의 '입금(deposit)' 데이터가 모델에 의해 '출금(withdrawal)'으로 잘못 판독되어 추출됨

**A번이 정답인 이유:**
스키마 검증은 필드가 존재하는지, 해당 필드가 지정된 유형(예: string, number 등)에 맞는지만 체크합니다. 스키마 자체는 모델이 원본 PDF 문서를 제대로 해석하여 의미적으로 옳은 값(deposit vs withdrawal)을 추출했는지 검증할 수 없으므로, 이러한 의미론적 오라벨링(Semantic mislabeling) 오류는 스키마 통과 여부와 상관없이 발생할 수 있습니다.

**오답 분석:**
- Option B (오답): JSON 스키마는 데이터 구조적 제약을 다룰 뿐, 원본 문서 텍스트와 추출값 간의 정황상 의미적 타당성 관계까지 검증할 수 없습니다.
- Option C (오답): 스키마의 `strict mode`는 필드 누락 방지 및 정해진 스키마 구조의 엄격한 준수(구조적 강제)를 의미하며, 원본 대비 의미적 실수를 교정해 주는 기능이 아닙니다.
- Option D (오답): `tool_choice`는 도구 호출 자체를 강제하는 옵션일 뿐, 호출된 도구 내부 인자 값의 내용적 정확성을 보장하는 기능이 아닙니다.


---


### 25번 문제

**문제 원문**

A refactor touches 60 files. A single reviewer instance given the entire diff at once produces contradictory findings between files. What change to the review architecture best addresses this?

A) Ask the generator to make smaller, sequential commits, and review only the most recent commit in full each time

B) Run the same single reviewer instance twice over the full diff, and keep only findings that appear in both runs

C) Give the single reviewer instance a much larger context window so it can hold the whole diff in memory during one pass

D) Split the review into per-file passes for local issues, plus an integration pass for cross-file consistency


---


**구간별 직독직해 번역**

**QUESTION:**

**A refactor touches**
리팩토링이 영향을 미칩니다

**60 files.**
60개의 파일에.

**A single reviewer instance**
단일 검토자 인스턴스가

**given the entire diff**
전체 변경 사항(diff)을 전달받았을 때

**at once**
한 번에

**produces contradictory findings**
모순된 검토 결과를 생성합니다

**between files.**
파일들 간에.

**What change**
어떤 변경이

**to the review architecture**
검토 아키텍처에 대한

**best addresses this?**
이 문제를 가장 잘 해결합니까?


**OPTIONS:**

**A) Ask the generator**
생성기에 요청합니다

**to make smaller,**
더 작고,

**sequential commits,**
순차적인 커밋을 만들도록,

**and review only**
그리고 오직 검토하도록

**the most recent commit**
가장 최근의 커밋만

**in full each time**
매번 전체적으로


**B) Run the same**
동일하게 실행합니다

**single reviewer instance twice**
단일 검토자 인스턴스를 두 번

**over the full diff,**
전체 변경 사항에 대해,

**and keep only findings**
그리고 검토 결과만 유지합니다

**that appear in both runs**
두 번의 실행 모두에서 나타나는


**C) Give the single reviewer instance**
단일 검토자 인스턴스에 제공합니다

**a much larger context window**
훨씬 더 큰 컨텍스트 창을

**so it can hold**
유지할 수 있도록

**the whole diff in memory**
전체 변경 사항을 메모리에

**during one pass**
한 번의 검토 과정 동안


**D) Split the review**
검토를 분할합니다

**into per-file passes**
파일별 검토 단계로

**for local issues,**
로컬 이슈(파일 내부 문제)를 위해,

**plus an integration pass**
통합 검토 단계를 더하여

**for cross-file consistency**
파일 간 일관성을 위한


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**D번**: Split the review into per-file passes for local issues, plus an integration pass for cross-file consistency

**정답 및 해설:**

**핵심 개념**: 분할 정복 검토 아키텍처(Divide-and-Conquer Review Architecture)
대규모 변경 사항(60개 파일)을 단일 모델 호출로 한 번에 처리하려고 하면 Attention 분산, 컨텍스트 과부하 및 주의력 저하 현상으로 인해 파일 간 모순(Contradictory findings)이나 환각이 발생합니다. 이를 방지하려면 파일별 개별 검토(Per-file passes)와 전체 일관성을 확인하는 통합 검토(Integration pass)로 역할을 계층화해야 합니다.

**문제 상황 분석:**
- 60개 파일에 달하는 대규모 리팩토링 변경 사항이 발생함
- 단일 LLM 인스턴스에 전체 diff를 한 번에 입력하자 파일 간 서로 모순되는 검토 결과가 출력됨
- 컨텍스트 과부하로 인해 모델이 전체 코드베이스의 일관성과 개별 파일의 정교함을 동시에 유지하지 못함

**D번이 정답인 이유:**
검토 프로세스를 2단계 분할 방식(Map-Reduce 형태)으로 전환하는 것이 가장 효과적입니다. 1단계로 각 파일의 단독 오류(Syntax, local logic)를 개별적으로 검토(Per-file passes)하여 집중도를 높이고, 2단계로 파일 간 인터페이스 및 호출 일관성을 검증하는 통합 단계(Integration pass)를 수행하면 모순된 결과를 없애고 정확도를 극대화할 수 있습니다.

**오답 분석:**
- Option A (오답): 가장 최근 커밋만 검토하면 이전 커밋에서 발생한 누적 변경 사항이나 파일 간 연동 오류를 놓치게 됩니다.
- Option B (오답): 동일한 전체 diff를 두 번 실행해도 컨텍스트 과부하라는 근본 원인이 해결되지 않아 두 번 모두 잘못되거나 무작위적인 결과가 나올 수 있습니다.
- Option C (오답): 단순히 컨텍스트 윈도우 크기를 늘리는 것은 모델의 주의력 집중(Needle in a haystack / Lost in the middle) 문제를 근본적으로 해결하지 못하며, 여전히 파일 간 모순이 발생할 확률이 높습니다.


---


### 26번 문제

**문제 원문**

An agent has both a search_docs tool and a search_code tool available. For requests that could plausibly be answered by either tool, such as 'where is the rate limit defined,' the agent picks inconsistently between them across similar sessions. The team wants the agent to make a consistent, well-reasoned choice for this class of ambiguous request. What is the most effective change?

A) Expand each tool's natural-language description with more adjectives that characterize its typical use cases.

B) Provide `input_examples` in the tool definitions that demonstrate for the same ambiguous request which tool should be selected and why.

C) Rename the two tools to be more visually distinct (e.g., `docs_lookup` and `code_search`) to reduce the chance of confusion.

D) Add a routing step that always calls search_docs first and only falls back to search_code if no results are returned.


---


**구간별 직독직해 번역**

**QUESTION:**

**An agent has**
에이전트는 가지고 있습니다

**both a search_docs tool**
search_docs 도구와

**and a search_code tool available.**
search_code 도구 모두를 사용할 수 있도록.

**For requests**
요청들에 대해

**that could plausibly be answered**
타당하게 답변될 수 있는

**by either tool,**
두 도구 중 어느 쪽으로든,

**such as 'where is the rate limit defined,'**
'속도 제한이 어디에 정의되어 있습니까'와 같은,

**the agent picks inconsistently**
에이전트는 비일관되게 선택합니다

**between them**
그 둘 사이에서

**across similar sessions.**
유사한 세션들 전반에 걸쳐.

**The team wants the agent**
팀은 에이전트가 ~하기를 원합니다

**to make a consistent,**
일관되고,

**well-reasoned choice**
잘 추론된 선택을 하기를

**for this class of ambiguous request.**
이러한 종류의 모호한 요청에 대해.

**What is the most effective change?**
가장 효과적인 변경 사항은 무엇입니까?


**OPTIONS:**

**A) Expand each tool's**
각 도구의 ~를 확장합니다

**natural-language description**
자연어 설명을

**with more adjectives**
더 많은 형용사를 사용하여

**that characterize**
특징짓는

**its typical use cases.**
그것의 일반적인 사용 사례를.


**B) Provide `input_examples`**
`input_examples`를 제공합니다

**in the tool definitions**
도구 정의 내에

**that demonstrate**
입증하는(보여주는)

**for the same ambiguous request**
동일한 모호한 요청에 대해

**which tool should be selected**
어떤 도구가 선택되어야 하는지와

**and why.**
그 이유를.


**C) Rename the two tools**
두 도구의 이름을 변경합니다

**to be more visually distinct**
시각적으로 더 구별되도록

**(e.g., `docs_lookup` and `code_search`)**
(예: `docs_lookup` 및 `code_search`로)

**to reduce the chance of confusion.**
혼란의 가능성을 줄이기 위해.


**D) Add a routing step**
라우팅 단계를 추가합니다

**that always calls search_docs first**
항상 search_docs를 먼저 호출하고

**and only falls back to search_code**
search_code로만 대체(fallback)하는

**if no results are returned.**
아무런 결과도 반환되지 않는 경우에.


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: Provide `input_examples` in the tool definitions that demonstrate for the same ambiguous request which tool should be selected and why.

**정답 및 해설:**

**핵심 개념**: 도구 정의 내 Few-shot 예시(`input_examples`) 및 근거 제시
LLM 에이전트가 유사하거나 모호한 도구(Tool)들 사이에서 선택을 머뭇거리거나 비일관된 결정을 내릴 때, 구체적인 요청 예시와 함께 **선택 기준 및 근거(Rationale)**를 명시한 `input_examples`를 도구 정의(Tool Definition)에 포함시키는 것이 가장 명확하고 일관된 라우팅 행동을 유도합니다.

**문제 상황 분석:**
- 에이전트가 `search_docs`와 `search_code`라는 두 개의 유사 도구를 모두 보유함
- "속도 제한이 어디에 정의되어 있는가"처럼 두 도구 모두 처리할 수 있는 모호한 요청에 대해 세션마다 비일관적으로 도구를 선택함
- 팀은 이러한 모호한 요청 유형에 대해 에이전트가 일관되고 근거 있는 선택을 내리도록 개선하고자 함

**B번이 정답인 이유:**
도구 정의(Tool definition) 내에 `input_examples`를 추가하여 모호한 요청이 들어왔을 때 어떤 도구가 선택되어야 하며 그 이유(Why)가 무엇인지 시범 예시로 보여주면, 모델은 모호한 문맥 상황에서의 라우팅 판단 기준을 명확하게 학습하게 됩니다. 이는 유사 세션 간 의사결정의 일관성을 크게 향상시킵니다.

**오답 분석:**
- Option A (오답): 서술적 형용사를 많이 추가하는 것은 오히려 도구 설명(Description)을 장황하게 만들어 모델의 모호성 해소에 도움을 주지 못합니다.
- Option C (오답): 도구 이름을 명확하게 바꾸는 것은 도움이 될 수 있으나, 이미 `search_docs`와 `search_code`로 충분히 구별되는 이름이며, 이름 변경만으로는 모호한 질문('속도 제한 정의 위치')의 문맥적 라우팅 기준을 잡아주지 못합니다.
- Option D (오답): 항상 `search_docs`를 먼저 호출하게 강제하는 하드코딩 라우팅은 에이전트의 유연한 추론을 제한하며, 코드 검색이 더 적합한 상황에서도 불필요한 도구 호출 및 지연 시간을 유발합니다.


---


### 27번 문제

**문제 원문**

A customer-support routing agent must decide, for ambiguous tickets that mention both a billing and a technical keyword, whether to route to the billing queue or the technical queue. The team wants to add examples that will help the agent generalize its judgment to new ambiguous tickets it has not seen before, not just the exact tickets in the examples. What should each example include?

A) The full text of the routing policy document, repeated in full once inside each individual example

B) The ticket text, the queue chosen, and a short explanation of why it beat the other plausible queue

C) The ticket text and the queue chosen, with no explanation, so the model infers the pattern from repetition

D) A simplified, idealized ticket rather than an actual historical one, chosen because it is easier to parse quickly


---


**구간별 직독직해 번역**

**QUESTION:**

**A customer-support routing agent**
고객 지원 라우팅 에이전트는

**must decide,**
결정해야 합니다,

**for ambiguous tickets**
모호한 티켓에 대해

**that mention both**
둘 다 언급하는

**a billing**
결제 키워드와

**and a technical keyword,**
기술 키워드를,

**whether to route**
라우팅할지 여부를

**to the billing queue**
결제 대기열로

**or the technical queue.**
또는 기술 대기열로.

**The team wants to add examples**
팀은 예시를 추가하고 싶어 합니다

**that will help the agent**
에이전트에게 도움이 될

**generalize its judgment**
판단을 일반화하는 데

**to new ambiguous tickets**
새로운 모호한 티켓으로

**it has not seen before,**
이전에 본 적 없는,

**not just the exact tickets**
단순히 정확한 티켓만이 아니라

**in the examples.**
예시 속에 있는.

**What should each example include?**
각 예시는 무엇을 포함해야 합니까?


**OPTIONS:**

**A) The full text**
전체 텍스트

**of the routing policy document,**
라우팅 정책 문서의,

**repeated in full once**
한 번 전체 반복된

**inside each individual example**
각 개별 예시 내부에서


**B) The ticket text,**
티켓 텍스트,

**the queue chosen,**
선택된 대기열,

**and a short explanation**
그리고 짧은 설명

**of why it beat**
그것이 왜 이겼는지에 대한

**the other plausible queue**
다른 그럴듯한 대기열을


**C) The ticket text**
티켓 텍스트와

**and the queue chosen,**
선택된 대기열,

**with no explanation,**
설명 없이,

**so the model infers**
모델이 추론하도록

**the pattern from repetition**
반복으로부터 패턴을


**D) A simplified, idealized ticket**
단순화되고 이상적인 티켓

**rather than an actual historical one,**
실제 이력상의 티켓보다는,

**chosen because**
선택된

**it is easier to parse quickly**
빠르게 구문 분석하기 더 쉽기 때문에


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: The ticket text, the queue chosen, and a short explanation of why it beat the other plausible queue

**정답 및 해설:**

**핵심 개념**: CoT(Chain-of-Thought) 퓨샷 프롬프팅 및 근거 제공(Reasoning in Few-Shot Examples)
두 가지 이상의 해석이 가능한 모호한(Ambiguous) 문제 상황에서 LLM이 일반화된 판단력을 갖추도록 하려면, 단순히 입력과 최종 라벨(정답)만 제시하는 것보다 **결정의 원인과 근거(Rationale)**를 함께 보여주는 CoT 형태의 퓨샷 예시를 구성해야 합니다.

**문제 상황 분석:**
- 티켓에 결제(Billing)와 기술(Technical) 키워드가 모두 포함되어 라우팅 기준이 모호함
- 단순히 예시에 있는 정확한 티켓만 처리하는 것이 아니라, 처음 보는 모호한 티켓에도 판단력을 적용(Generalize)할 수 있어야 함
- 모델이 모호함을 해결하는 의사결정 추론 규칙을 학습하도록 프롬프트 예시를 설계해야함

**B번이 정답인 이유:**
입력 데이터(티켓 텍스트)와 최종 선택(대기열), 그리고 **"왜 다른 대기열 대신 이 대기열을 선택했는지"에 대한 이유/근거(Explanation)**를 제공하면, 모델은 단순 키워드 매칭을 넘어 경계선 판단 기준(의사결정 논리)을 학습합니다. 이를 통해 새로운 모호한 입력이 들어왔을 때도 근거에 기반하여 정확하게 일반화된 판단을 내릴 수 있습니다.

**오답 분석:**
- Option A (오답): 각 예시마다 동일한 전체 정책 문서를 반복적으로 넣는 것은 토큰을 크게 낭비하며, 예시를 통한 일반화 추론 효과를 주지 못합니다.
- Option C (오답): 설명 없이 입력과 라벨만 반복하면 모호한 조건에서 모델이 겉보기 패턴만 학습하거나 환각/비일관적 추론을 하게 됩니다.
- Option D (오답): 지나치게 단순화되고 이상적인 예시는 노이즈와 복잡성이 존재하는 실제 환경의 모호한 티켓 처리 능력을 키워주지 못합니다.


---


### 28번 문제

**문제 원문**

A team building a code-review assistant is deciding how granular to make the detected_pattern field on each structured finding. One option records only a broad category like "security" for every finding; another records the specific triggering construct, such as the exact function name, decorator, or regex rule that fired. Which choice better supports long-term analysis of developer dismissal patterns?

A) Neither option matters much, since dismissal rates should be analyzed through the severity field instead

B) The specific-construct option, since it lets the team isolate which exact rule causes a high dismissal rate and tune it

C) The broad-category option, since recording specific constructs would expose proprietary rule names to the team

D) The broad-category option, since fewer distinct values are easier for a dashboard to render without extra grouping logic


---


**구간별 직독직해 번역**

**QUESTION:**

**A team building**
팀이

**a code-review assistant**
코드 검토 어시스턴트를 개발하는

**is deciding**
결정하려 합니다

**how granular to make**
얼마나 세분화할지를

**the detected_pattern field**
detected_pattern 필드를

**on each structured finding.**
각 구조화된 발견 항목의.

**One option records**
한 옵션은 기록합니다

**only a broad category**
광범위한 범주만을

**like "security"**
"security(보안)"와 같은

**for every finding;**
모든 발견 항목에 대해;

**another records**
다른 옵션은 기록합니다

**the specific triggering construct,**
특정 트리거 구성을,

**such as the exact function name,**
정확한 함수 이름,

**decorator,**
데코레이터,

**or regex rule that fired.**
또는 실행된 정규식 규칙과 같은.

**Which choice**
어떤 선택이

**better supports**
더 잘 지원합니까

**long-term analysis**
장기적인 분석을

**of developer dismissal patterns?**
개발자의 기각(Dismissal) 패턴에 대한?


**OPTIONS:**

**A) Neither option matters much,**
두 옵션 모두 그다지 중요하지 않습니다,

**since dismissal rates**
기각률은 ~해야 하기 때문에

**should be analyzed**
분석되어야

**through the severity field instead**
대신 심각도(severity) 필드를 통해


**B) The specific-construct option,**
구체적 구성 요소 기록 옵션,

**since it lets the team isolate**
팀이 격리(분리)할 수 있게 해주기 때문에

**which exact rule**
어떤 정확한 규칙이

**causes a high dismissal rate**
높은 기각률을 일으키는지

**and tune it**
그리고 그것을 튜닝할 수 있게


**C) The broad-category option,**
광범위한 범주 기록 옵션,

**since recording specific constructs**
구체적인 구성을 기록하는 것이 ~하기 때문에

**would expose**
노출시킬 것이기 때문에

**proprietary rule names**
자사 소유의 규칙 이름을

**to the team**
팀에게


**D) The broad-category option,**
광범위한 범주 기록 옵션,

**since fewer distinct values**
더 적은 종류의 고유 값이 ~하기 때문에

**are easier**
더 쉽기 때문에

**for a dashboard to render**
대시보드가 렌더링하기에

**without extra grouping logic**
별도의 그룹화 로직 없이


---


**정답 및 해설 (Answer & Explanation)**

**정답:**

**B번**: The specific-construct option, since it lets the team isolate which exact rule causes a high dismissal rate and tune it

**정답 및 해설:**

**핵심 개념**: 세분화된 메타데이터(Granular Metadata) 및 오탐(False Positive) 튜닝
코드 검토 시스템이나 AI 파이프라인에서 개발자가 시스템의 경고를 무시/기각(Dismiss)하는 원인을 장기적으로 분석하려면 메타데이터를 세분화하여 수집해야 합니다. 세분화된 정보는 높은 오탐률을 일으키는 특정 정규식이나 규칙을 정밀하게 식별(Isolate)하여 튜닝할 수 있는 피드백 루프를 제공합니다.

**문제 상황 분석:**
- 코드 검토 어시스턴트가 감지한 항목의 `detected_pattern` 필드 데이터 수준(Granularity)을 결정해야 함
- 광범위한 범주("security") vs 구체적 트리거 규칙(함수명, 데코레이터, 정규식 등) 두 가지 선택지가 존재함
- 개발자가 경고를 무시/기각(Dismissal)하는 행동 패턴을 장기적으로 분석하여 시스템을 개선하고자 함

**B번이 정답인 이유:**
개발자가 특정 경고를 지속적으로 기각(Dismiss)하는 경우, 단순히 "보안(security) 경고라서 기각했다"는 대분류 정보만으로는 어떤 규칙이 잘못되어 거짓 긍정(False Positive)을 내는지 알 수 없습니다. 특정 함수나 정규식 규칙 수준으로 세분화하여 기록하면, 높은 기각률을 유발하는 원인 규칙을 정확히 격리(Isolate)해내고 해당 정규식이나 모니터링 로직을 미세 조정(Tune)하여 검토 정확도를 개선할 수 있습니다.

**오답 분석:**
- Option A (오답): 심각도(severity) 필드만으로는 개발자가 정규식 규칙 오류로 기각했는지, 실제 위협 수준이 낮아서 기각했는지의 근본적 규칙 단위를 구분할 수 없습니다.
- Option C (오답): 내부 개발 팀에 지적 재산권 수준의 내부 규칙 이름을 숨겨야 할 이유가 없으며, 정밀 분석을 방해하는 비논리적 사유입니다.
- Option D (오답): 대시보드 렌더링 편의성 때문에 분석 데이터의 해상도(Granularity)를 포기하는 것은 잘못된 아키텍처 접근법입니다.