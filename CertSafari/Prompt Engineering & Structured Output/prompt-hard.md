# Prompt Engineering & Structured Output — 고난도 선별 문제

원본: prompt-merged.md (전체 96문제 중 21문제 선별, 21%)

**선별 기준** — 아래 특징 중 하나 이상에 해당하는 문제 중, 특히 난이도가 높은 것:

- **덜 틀린 답 고르기** — 정답이 "명백히 옳은 것"이 아니라 "덜 틀린 것", 매력적인 오답이 2~3개
- **원칙이 깨지는 예외** — 외운 규칙을 그대로 적용하면 틀린다
- **유사 현상 구분** — 표면적으로 같아 보이는 두 현상, 같은 증상 다른 원인
- **복합 시나리오** — 여러 개념이 한 문제에 교차
- **근본 원인 vs 증상 완화** — 오답이 그럴듯한 완화책이고 정답은 구조적 해법
- **부분적으로만 맞는 오답** — 결론은 맞지만 근거가 틀린 선택지 등
- **길이가 단서 아님** — 정답이 가장 길고 서술적이지 않다

**재배치 안내** — 묻는 주제가 같은 것끼리 묶고, 유사 시나리오이지만 답이 다른 문제를 인접 배치했다. 괄호 안 원본 번호는 그대로다.

---

* _buried in_ : 정보가 눈에 띄지 않게 묻혀있다
* _termination_ : (계약의) 해지
* _rather than_ : ~ 대신
* _unusual phrasing_ : 특이한 표현
* _demonstrating_ : 보여주는
* _ingests_ : 수집하다
* _corpus_ : 말뭉치
* _Held-out dataset / Holdout set / Withheld dataset_ : 학습에서 제외해 평가용으로 남긴 데이터

---

# A. 추출 실패 대응 — 예시 추가 / 재시도 / 스키마 완화 / 스키마 확장

2와 43: 비정형 위치에서 null이면 두 경우를 보여주는 예시 추가. 28: 구조 오배치만 재시도로 해결. 45: 날짜 형식 불일치는 스키마 완화 + 다운스트림 파서(description 지시가 아님). 63: 값 날조는 optional + source enum.

## 1번 문제 (원본 2번)

**어려운 이유** [근본 원인 vs 증상 완화, 덜 틀린 답 고르기] — 지시문 강화가 이미 실패한 상황에서 enum 강제·기본값·헤딩 한정 검색이 모두 그럴듯한 완화책이나, 비정형 표현 예시와 null 정당 사례를 동시에 보여주는 것이 정답이다.

**1. 문제 원문**

An extraction pipeline for supplier contracts frequently returns null for the 'renewal_notice_period' field on contracts where that information is present but phrased unusually, such as **buried in(묻혀있다)** a sentence about termination rather than in a clearly labeled 'Renewal' clause. The team has already tried making the field's **instruction** more explicit **with no improvement** (지시문으로는 효과가 없었다). What should they try next?

A) Change the field's data type from a string ~~to a required enumerated~~ value from a fixed set

B) ~~Add a fallback default value~~ of thirty days that is used whenever the field would **otherwise(그렇지 않은 경우)** be left null

C) Show an extraction from unusual **phrasing(표현)** / plus / a case confirming null is correct when unspecified

D) ~~Instruct the model~~ to scan only clauses whose heading explicitly contains the word 'renewal' or 'termination'

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: C번**

**정답 및 해설:**

**핵심 개념**: 퓨샷 프롬프팅(Few-shot Prompting) 및 예시 제공(In-context Learning)
LLM을 이용한 정보 추출 시, 단순 지시문(Zero-shot) 개선만으로 모호하거나 특이한 문맥을 제대로 다루지 못할 때는 올바른 추출 예시(Positive Example)와 추출할 정보가 없을 때 null을 반환하는 예시(Negative Example)를 함께 제공하는 퓨샷 프롬프팅이 가장 효과적인 해결책입니다.

**문제 상황 분석:**
- 계약서 내에 정보는 존재하지만 '갱신' 조항이 아닌 '해지' 관련 문장에 묻혀 있는 등 특이하게 표현된 경우 모델이 null을 반환함
- 단순히 지시문(Instruction)을 더 명시적으로 작성하는 것만으로는 성능 개선이 이루어지지 않음
- 정보가 없는 경우(null 반환)와 특이한 표현에서 정보를 추출해 내야 하는 경우를 구별하도록 모델을 학습/가이드해야 함

**C번이 정답인 이유:**
지시문 변경으로 효과를 보지 못했을 때 다음 단계로 적용해야 하는 기법은 예시(Examples)를 프롬프트에 추가하는 것입니다. 특이한 문장 구조에서도 정답을 추출하는 성공 사례와, 진짜 정보가 없을 때만 null을 반환하도록 검증하는 사례를 함께 보여줌으로써 모델이 복잡한 문맥 패턴을 정확히 인식하고 판단 기준을 잡을 수 있게 됩니다.

**오답 분석:**

- Option A (오답): 데이터 타입을 열거형(Enum)으로 바꾼다고 해서 모델이 문맥 속에 숨겨진 특이한 표현을 찾아내는 능력 자체가 향상되지는 않습니다.
- Option B (오답): 추출 실패 시 무조건 30일을 기본값으로 넣는 것은 잘못된 데이터(환각/하드코딩된 값)를 오염시키는 방안이며, 추출 모델의 성능 자체를 개선하는 방법이 아닙니다.
- Option D (오답): 조항 제목에 특정 단어가 포함된 것만 스캔하도록 제한하면, 해당 제목이 없거나 예상치 못한 다른 단락에 정보가 위치한 경우 추출을 전혀 하지 못하게 되어 문제가 더욱 악화됩니다.

---

## 2번 문제 (원본 43번)

**어려운 이유** [덜 틀린 답 고르기] — Methodology 우선 검색 후 폴백(D)이 실제로 동작할 법한 대안이라 예시 제공(C)과 진짜로 경합한다.

**1. 문제 원문**

A tool extracts a paper's 'sample size' and 'statistical method' fields. Some papers place this information in a clearly labeled Methodology section, while others embed it in a sentence within the Results or Discussion section without any nearby heading. The tool reliably **extracts from labeled** Methodology sections but frequently **returns null** when the same information is **embedded elsewhere**. What is the best fix?

A) ~~Increase the model's context~~ window to ensure it reads the entire paper rather than a truncated excerpt.

B) Exclude any paper that **lacks(~가 없다)** a labeled Methodology section from the extraction pipeline.

C) Provide the model with extraction examples from both a labeled Methodology section and from an embedded sentence in Results, **demonstrating(보여주는)** how to extract the fields in both cases.

D) Configure the tool to first search the Methodology section, and only fall back to other sections if the fields are missing.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: C번**

**정답 및 해설:**

**핵심 개념:** Few-Shot 퓨샷 프롬프팅 (Diverse Example Demonstration)
LLM 기반 추출 도구가 **특정 형식이나 위치(예: 명확한 섹션 헤딩)에 편향되어 일관성이 떨어질 때**, 다양한 컨텍스트 및 예시 패턴(Few-shot examples)을 제공하면 모델의 가다듬어진 패턴 인식 능력이 대폭 향상됩니다.

**문제 상황 분석:**
- 추출 도구가 명확한 Methodology 섹션이 있는 논문에서는 정보를 잘 추출함.
- 헤딩 없이 Results나 Discussion 내부 문장에 자연어로 묻혀 있는 정보는 인식하지 못하고 `null`을 반환함.
- 문제의 원인은 모델이 헤딩 구조에만 의존하는 편향(Bias)이 생겼거나, 비구조화된 일반 문장 내 추출 예시 학습 부족 때문임.

**C번이 정답인 이유:**
명확한 Methodology 섹션에서 추출하는 예시뿐만 아니라, Results/Discussion 내부 문장에서 정보를 추출하는 다양한 유형의 예시(Few-shot)를 프롬프트에 제공함으로써 모델에게 두 패턴 모두에서 필드를 식별하고 추출하는 방법을 학습시킬 수 있습니다. 이는 다양하고 엣지 있는 패턴에 대한 추출 성능을 가장 안정적으로 개선하는 방법입니다.

**오답 분석:**
- Option A (오답): 문제 원인은 잘린 텍스트 때문이 아니라 다른 위치/형태의 텍스트 패턴을 인식하지 못하는 패턴 인지 문제입니다. 컨텍스트 창 크기를 늘리는 것으로는 다양성 부족 문제를 해결하지 못합니다.
- Option B (오답): 지정된 섹션이 없다고 논문을 제외해 버리는 것은 시스템 지원 범위를 임의로 축소하는 잘못된 우회책입니다.
- Option D (오답): 본문 문제는 정보의 단순 검색 순서가 아니라, 비구조화된 문장 형태(embedded sentence)로 작성된 정보 자체를 모델이 알아채고 추출하지 못한다는 점입니다. 단순히 검색 순서를 fall back 방식으로 바꾸는 알고리즘 설정만으로는 내부 추출 실패 문제를 해결하지 못합니다.

---

## 3번 문제 (원본 28번) ★

**어려운 이유** [유사 현상 구분, 복합 시나리오] — 네 가지 실패를 "소스에 정보가 없음" vs "구조적 배치 오류"로 분류해야 하며, service_address가 우편주소인 경우도 구조 오류처럼 보여 혼동을 준다.

**1. 문제 원문**

A utility-bill extraction pipeline has logged the following four distinct failed extractions: 

1. The `meter_reading` value was extracted correctly but placed under `billing_address` instead of the `usage_details` object. 
2. The `account_holder_phone` field is blank because no phone number appears anywhere on the scanned bill provided so far. 
3. The `prior_year_comparison` figure is missing because it only appears in an annual letter never supplied to the pipeline. 
4. The `service_address` field holds the mailing address because that is the only address printed on this particular bill. 

Which of these is the one most likely to be **fixed by an error-feedback retry**, **as opposed to(~와는 반대로)** requiring a different source document or human escalation? => 재시도로 해결할 수 있는 방법

A) The `service_address` field holds the mailing address because that is the only address printed on this particular bill => "메일 주소 = 서비스 주소로 봐도 되는가?"에 대한 정답 기준이 없음

B) The `prior_year_comparison` figure is missing because it only appears in an annual letter never supplied to the pipeline => 연간 레터에만 있는 정보라서 파이프라인에는 정보 없음

C) The `account_holder_phone` field is blank because no phone number appears anywhere on the scanned bill provided so far => 청구서 어디에도 전화 번호 없음

D) The `meter_reading` value was extracted correctly but placed under `billing_address` instead of the `usage_details` object

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: D번**

**정답 및 해설:**

**핵심 개념**: LLM 기반 정보 추출 및 오류 피드백 재시도(Error-Feedback Retry)
문서에서 정보는 올바르게 인식했으나 JSON 스키마 구조나 키 위치 배치가 잘못된 구조적 오류(Formatting/Mapping Error)는 스키마 조건이나 오류 메시지를 다시 주입하는 재시도만으로 완벽히 수정 가능합니다.

**문제 상황 분석:**
- 파이프라인에서 추출 실패 원인 4가지를 분석하여 자동 재시도(Retry)로 해결 가능한 항목을 찾는 문제
- 2, 3번 항목은 데이터 원본 자체에 정보가 누락되어 다른 원본 문서가 필요함
- 1, 4번 항목은 문서 내 데이터는 존재하나 처리 방식의 차이점 파악 필요

**D번이 정답인 이유:**
- 1번 상황(`meter_reading` 계측값이 올바르게 추출되었으나 스키마 계층 구조상 잘못된 객체 아래 위치함)은 pure processing/formatting error입니다.
- 스키마 검증 오류 메시지(예: "`meter_reading`은 `usage_details` 객체 아래에 위치해야 합니다")를 LLM에 피드백으로 다시 전달하면, 새로운 문서나 사람의 개입 없이 모델 스스로 JSON 구조를 수정하여 올바른 위치에 재배치할 수 있습니다.

**오답 분석:**
- Option A (오답): 원본 청구서에 주소가 하나만 존재하여 발생한 문제로, 이것이 오류인지 정상 데이터인지 판별하기 위해 인간의 확인(Human escalation)이나 정책 기준 정의가 필요합니다.
- Option B (오답): 필요한 데이터가 연례 서한에만 존재하고 파이프라인에 입력되지 않았으므로, 다른 원본 문서(Different source document)를 제공해야만 해결됩니다.
- Option C (오답): 스캔된 문서에 전화번호 정보 자체가 없으므로, 아무리 오류 피드백 재시도를 해도 존재하지 않는 데이터를 만들어낼 수 없습니다. (다른 원본 문서 필요)

---

## 4번 문제 (원본 45번)

**어려운 이유** [덜 틀린 답 고르기, 부분적으로만 맞는 오답] — description으로 정규화를 지시하는 A가 공식 가이드처럼 들리지만, 스키마를 느슨하게 두고 다운스트림 파서로 정규화하는 것이 정답이라 두 선택지가 진짜로 경합한다.

**1. 문제 원문**

A logistics company **ingests(수집하다)** shipment confirmation emails from many different carriers. Dates appear as `03/14/2026`, `14-Mar-2026`, and `2026.03.14` depending on the carrier, but the extraction schema defines `ship_date` as a string with a strict ISO 8601 pattern. Extractions frequently fail schema validation because the source dates don't match the expected format. According to the current Anthropic official guidance, what is the most effective fix?

A) Retain the strict ISO 8601 schema constraint for `ship_date` and add an explicit `description` in the JSON schema telling Claude to parse and normalize the carrier date string to ISO 8601 format (e.g., `YYYY-MM-DD`).

B) Remove the `ship_date` field from the extraction schema and ~~infer the shipment date~~ later from other fields such as tracking number lookup or email metadata.

C) Loosen the schema to **accept any string** for `ship_date`, and add a downstream step that uses a date parser to normalize the value to ISO 8601 format before storing it in the database.

D) ~~Split `ship_date` into three fields~~ such as `ship_date_us`, `ship_date_eu`, and `ship_date_iso`, each expecting a different carrier date format, and populate only the one matching the extracted string.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: C번**

**정답 및 해설:**

**핵심 개념:** LLM 추출과 후속 정규화의 역할 분리 (Decoupling LLM Extraction & Deterministic Parsing)  
Anthropic의 공식 가이드라인에 따르면 다양한 비구조화 포맷을 가진 데이터를 추출할 때 스키마 레벨에서 엄격한 포맷 검증(Regex/Pattern)을 강제하면 스키마 유효성 검사 실패율이 높아집니다. 스키마 제약조건은 일반 문자열(`type: string`)로 완화하여 추출 성공률을 높이고, 정규화(Normalization)는 후속 애플리케이션 코드(Date Parser)에 위임하는 것이 가장 정석적인 설계입니다.

**문제 상황 분석:**
- 이메일 원본의 날짜 포맷이 운송사별로 상이함 (`03/14/2026`, `14-Mar-2026`, `2026.03.14`).
- 추출 스키마에서 `ship_date`에 엄격한 ISO 8601 패턴을 적용하여 유효성 검사 오류가 지속 발생함.
- 모델의 자연어 추출 능력과 엄격한 스키마 검증 간의 충돌로 인해 시스템 신뢰도가 저하됨.

**C번이 정답인 이유:**
`ship_date` 스키마 제약을 단순 문자열로 완화(Loosen)하면 모델이 이메일의 날짜를 실패 없이 원문 그대로 가져올 수 있습니다. 이후 데이터베이스 저장 직전 단계(Downstream)에서 검증된 날짜 파서 라이브러리를 사용해 ISO 8601 포맷으로 변환하면, 스키마 유효성 검사 실패를 원천적으로 방지하고 안전하게 정규화된 데이터를 확보할 수 있습니다.

**오답 분석:**
- Option A (오답): 스키마 `description`에 정규화 지침을 제공하더라도, 엄격한 패턴 검증 규칙을 유지하면 모델이 비구조화 데이터를 인코딩하는 과정에서 여전히 스키마 유효성 검사 실패가 자주 발생합니다.

---

## 5번 문제 (원본 63번)

**어려운 이유** [복합 시나리오, 덜 틀린 답 고르기] — 두 가지 스키마 변경을 동시에 요구하며, "N/A 문자열로 두고 필수 유지"(A)와 optional + source enum(B)이 데이터 품질 관점에서 실제로 경합한다.

**1. 문제 원문**

A real estate platform extracts property listings from scraped web pages using a single `describe_property` tool. The `square_footage` field is defined as a required number, but many older listings state size only in vague prose like "spacious with room to grow" and never give a numeric figure. Extraction logs show the model consistently inventing plausible square footage values for these listings. Which two schema changes together best resolve this while preserving **data quality for downstream reports**?

A) Keep `square_footage` ~~required~~, but change its type to string so the model can output a placeholder like "unspecified" or "N/A" instead of fabricating a number, ensuring the field is always present. => 할루시네이션 유발

B) You can make `square_footage` **optional** for missing values and add a `square_footage_source` enum that stores 'stated', 'estimated', or 'unknown' so reports can separate confirmed from absent values.

C) Keep `square_footage` required, and ~~add a system prompt instruction~~ (e.g., "Do not guess; output 'N/A' for missing data") and a configuration flag to require manual review of any numeric output.

D) ~~Remove `square_footage` from the schema entirely~~, and rely on a separate keyword-search script to scan raw listing text for numeric patterns and inject the first match into a staging column for reports.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: B번**

**정답 및 해설:**

**핵심 개념:**
LLM 정보 추출 시스템의 환각(Hallucination) 방지 및 스키마 설계 모범 사례(Schema Design Best Practice)입니다. 원본 데이터에 특정 값이 누락되어 있을 때, 해당 필드를 필수(required) 수치 타입으로 지정하면 모델은 스키마 검증 실패를 피하기 위해 임의의 값을 지어내는 환각 현상을 일으킵니다. 이를 방지하려면 필드를 선택 항목(optional)으로 전환하고 메타데이터(출처/신뢰도 enum)를 함께 정의하는 스키마 개편이 필요합니다.

**문제 상황 분석:**
- 원본 웹페이지에 면적 수치가 없고 모호한 텍스트만 존재합니다.
- 추출 스키마에서 `square_footage`가 필수(required) 숫자(number) 타입으로 정의되어 있어, Claude가 스키마 형식을 맞추려고 그럴듯한 숫자를 지어내고(환각) 있습니다.
- 후속 다운스트림 리포트의 데이터 품질(숫자 타입 유지 및 실제 수치 유무 구분)을 보장하는 최적의 스키마 변경 방법 2가지를 조합해야 합니다.

**B번이 정답인 이유:**
1. **`square_footage`를 optional로 변경**: 누락된 데이터에 대해 모델이 억지로 숫자를 지어내지 않고 필드를 생략하거나 `null`로 반환할 수 있게 하여 환각을 근본적으로 차단합니다.
2. **`square_footage_source` enum 필드 추가**: `'stated'`(명시됨), `'estimated'`(추정됨), `'unknown'`(알 수 없음) 등의 출처 메타데이터 필드를 추가함으로써 다운스트림 리포팅 시스템이 실제 확인된 값과 누락/추정 데이터를 명확히 분리하여 집계할 수 있게 해줍니다.

**오답 분석:**
- Option A (오답): 숫자형 데이터를 다루는 필드를 문자열(`string`)로 변경하고 `"N/A"`나 `"unspecified"` 같은 자리표시자 텍스트를 채우게 만들면, 후속 리포트 시스템에서 해당 필드를 숫자형으로 계산/수학적 연산(평균 계산 등)을 할 때 유형 오류가 발생하여 데이터 품질이 저하됩니다.
- Option C (오답): 숫자 타입으로 정의된 필수 필드에 `"N/A"`라는 문자열을 출력하라는 지시를 내리면 JSON 스키마 타입 검증 오류(Type Validation Error)가 발생합니다. 또한 모든 숫자 출력에 대해 수동 검토를 거치게 하는 것은 자동화 파이프라인의 효율성을 저해합니다.
- Option D (오답): 스키마에서 필드를 완전히 제거하고 단순 정규표현식/키워드 스크립트에 의존하는 것은 모호한 서술문 문맥을 처리하지 못하며 LLM을 통한 정보 추출의 이점을 포기(abandonment)하는 잘못된 아키텍처입니다.

---

# B. few-shot 예시 설계 — 다양화, 축소, 대비 쌍

50: 예시가 무관한 패턴을 가르치면 다양화. 68: 20개 리터럴 쌍은 규칙이 보이도록 축소. 56과 82: 오탐 줄이기는 문제/정상 대비 쌍 예시.

## 6번 문제 (원본 50번)

**어려운 이유** [유사 현상 구분, 근본 원인 vs 증상 완화] — few-shot이 길이·언어라는 무관한 패턴을 학습시킨 회귀를, 모델 드리프트나 예시 수 부족이라는 유사 증상과 구분해야 한다.

**1. 문제 원문**

A team adds five few-shot examples to a document-classification prompt to fix inconsistent labeling. All five examples happen to be English-language emails under 100 words. After deployment, the model performs well on similar short English emails but starts mislabeling longer documents and documents in other languages that it previously handled correctly under the old, example-free prompt. What is the most likely cause, and what should the team do?

A) The examples unintentionally taught an unrelated pattern tied to length and language; diversify them

B) The five examples are too few in number; keep them but duplicate each one three times

C) The regression is unrelated to the examples and is caused by unrelated model drift

D) Few-shot examples are simply incompatible with document classification tasks, so remove them entirely

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: A번**

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

## 7번 문제 (원본 68번)

**어려운 이유** [원칙이 깨지는 예외] — "예시는 많을수록 좋다"는 통념과 반대로, 20개를 소수로 줄여 결정 규칙이 드러나게 하는 것이 정답이다.

**1. 문제 원문**

A team built a classification prompt with twenty exact input-output pairs, one for every edge case they had personally encountered in their historical data. The prompt performs well on those twenty inputs but degrades noticeably whenever a customer submits a new input that is similar to, but not identical to, one of the twenty. What change would best help the model generalize its judgment to these novel-but-similar inputs?

A) Remove the examples entirely and rely on a single instruction sentence describing the desired behavior

B) Keep appending every newly discovered literal pair to the prompt so every past case is eventually represented

C) Increase the max_tokens parameter so the model has more room to reason before each classification

D) Reduce the twenty examples to a small set that makes the underlying decision rule visible to the model

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: D번**

**정답 및 해설:**

**핵심 개념:** 프롬프트 엔지니어링에서의 암기(Overfitting/Memorization) 방지 및 일반화(Generalization) 성능 최적화입니다. 지나치게 많은 개별 예시는 모델이 패턴을 이해하는 대신 입출력 형태를 단순히 암기하게 만듭니다.

**문제 상황 분석:**
- 개발 팀이 과거 데이터의 모든 예외 케이스를 커버하기 위해 20개에 달하는 입출력 쌍을 예시로 작성함.
- 동일한 20개 입력에 대해서는 잘 작동하지만, 조금이라도 변형된 신규 유사 입력이 들어오면 성능이 크게 저하됨 (암기 현상 발생).
- 유사하지만 새로운 입력 패턴에도 올바르게 반응할 수 있도록 모델의 '일반화 능력'을 향상시켜야 함.

**D번이 정답인 이유:**
과도한 수(20개)의 예시는 모델이 문제의 근본 원리와 규칙을 파악하는 대신 주어진 예시를 암기하도록 유도하여 과적합(Overfitting)을 일으킵니다. 따라서 예시의 개수를 소수(3~5개 수준)로 축소하고, 분류의 근본적인 판단 기준과 논리 규칙(Decision Rule)이 명확히 드러나도록 정제된 예시를 제시하는 것이 모델의 일반화(Generalization) 능력을 극대화하는 모범 사례입니다.

**오답 분석:**
- Option A (오답): 예시를 완전히 삭제하는 것(Zero-shot)은 규칙이 복잡하거나 예외 케이스가 존재하는 분류 문제에서 모델의 정확도와 응답 일관성을 떨어뜨립니다.
- Option B (오답): 새로운 사례가 나올 때마다 무제한으로 예시를 추가하는 것은 과적합을 심화시키고, 프롬프트의 토큰 비용 증가 및 지연 시간을 유발하며 "Lost in the Middle" 현상으로 성능이 더 악화됩니다.
- Option C (오답): `max_tokens` 파라미터는 모델이 생성할 수 있는 최대 출력 토큰 길이를 제한하는 설정일 뿐이며, 프롬프트의 과적합 문제나 분류 판단의 일반화 능력을 개선하지 못합니다.

---

## 8번 문제 (원본 56번)

**어려운 이유** [덜 틀린 답 고르기, 근본 원인 vs 증상 완화] — 통합 테스트로 간접 커버된 분기라는 미묘한 판단 기준을 예시로 전달해야 하는데, 커버리지 도구 실행(B)이 더 "확실한" 해법처럼 보인다.

**1. 문제 원문**

A pull-request review agent is meant to flag branches (conditional paths) that lack test coverage. In practice it inconsistently flags newly introduced branches that are already exercised indirectly by an existing integration test, producing noisy false positives that erode reviewer trust. Detailed instructions about 'coverage' have not resolved the inconsistency. What should the team add to the prompt?

A) A couple of examples pairing a diff with a coverage judgment: one branch with no test, one covered indirectly

B) A requirement to run the full test suite and flag any branch under one hundred percent line coverage

C) A rule treating any file changed by fewer than ten lines as automatically having adequate coverage

D) An instruction to flag every new conditional branch in a diff regardless of the surrounding test suite entirely

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: A번**

**정답 및 해설:**

**핵심 개념:**
퓨샷 프롬프팅(Few-Shot Prompting / In-Context Learning)을 활용한 복잡한 판단 기준의 명확화입니다. 텍스트 지시(Zero-shot instruction)만으로 모호하거나 미묘한 에지 케이스(예: 간접 커버리지 판단)를 모델이 제대로 구분하지 못할 때는 구체적인 입력-출력 예시(Few-shot Examples)를 제공하는 것이 가장 효과적입니다.

**문제 상황 분석:**
- PR 검토 에이전트가 테스트 커버리지가 부족한 코드 분기를 판별하는 역할을 수행합니다.
- 기존 통합 테스트에 의해 간접적으로 테스트되는 새 분기에 대해 오탐(False Positive) 경고를 일관성 없이 발생시켜 신뢰도를 저하시키고 있습니다.
- '커버리지'에 대한 구체적인 서술형 지시사항을 프롬프트에 추가했음에도 일관성 문제가 해결되지 않는 상황입니다.

**A번이 정답인 이유:**
Anthropic 프롬프트 엔지니어링 가이드라인에 따르면, 모호한 개념("간접적으로 테스트됨"과 "테스트되지 않음")을 모델에 학습시킬 때 구체적인 지시어(Instruction)만으로는 한계가 있습니다. 실제 코드 변경사항(Diff)과 이에 대한 올바른 커버리지 판단 결과가 쌍을 이루는 예시(Examples)를 프롬프트에 직접 제공하는 퓨샷 기술을 적용하면, Claude가 패턴을 명확히 파악하여 비일관적인 경고 문제를 가장 효과적으로 해결할 수 있습니다.

**오답 분석:**
- Option B (오답): 전체 테스트 수트를 무조건 실행하고 100% 미만 커버리지를 모두 경고하는 것은 검토 노이즈(False Positive)를 오히려 크게 증가시키고 실행 비용/시간을 극대화합니다.
- Option C (오답): 10줄 미만 변경 파일을 무조건 안전하다고 간주하는 임의적 하드코딩 규칙은 실제 커버리지가 누락된 중요한 버그 경로를 놓치게 만듭니다.
- Option D (오답): 주변 테스트 상황을 무시하고 모든 조건부 분기를 무조건 경고하는 것은 간접 커버리지 분기까지 모두 경고 대상으로 만들어 문제의 원인인 오탐을 극대화합니다.

---

## 9번 문제 (원본 82번)

**어려운 이유** [근본 원인 vs 증상 완화, 덜 틀린 답 고르기] — 규칙 제거·임계값 조정·빈도 기준이 모두 FP를 줄이긴 하지만 진짜 이슈도 놓치며, 허용 사례와 문제 사례를 쌍으로 보여주는 것만이 둘 다 만족한다.

**1. 문제 원문**

An automated code reviewer flags many instances of a pattern (a broad except clause) as issues, but a large fraction of those flags are on lines where the pattern is intentional and acceptable, such as top-level error boundaries that log and re-raise. Reviewers are starting to ignore the tool's output because of the false-positive rate. What change would most directly reduce false positives while still catching genuine issues?

A) Remove the broad except clause check from the rule set entirely, since it currently produces too many false positives

B) Lower the confidence threshold so only the single highest-confidence finding per file is reported

C) Instruct the model to only flag the pattern when it appears more than three times in the same file

D) Add paired examples of a genuinely problematic instance and an acceptable instance, each with the correct verdict

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: D번**

**정답 및 해설:**

**핵심 개념:** 프롬프트 엔지니어링의 퓨샷 프롬프팅(Few-shot Prompting) 및 대비되는 예시(Contrasting Examples / Paired Examples) 활용법입니다. LLM 기반 코드 검토 도구에서 문맥적 미묘함(예: 동일한 패턴이라도 의도적인 경우와 잘못된 경우)을 구분하지 못할 때, 긍정 예시(Acceptable)와 부정 예시(Problematic)를 짝 지어 제공하는 것이 오탐(False Positive)을 줄이는 가장 효과적인 방법입니다.

**문제 상황 분석:**
- 코드 검토 도구가 `broad except clause`(예: `except Exception:`) 패턴을 무조건 문제로 플래그 표시하여 오탐율이 높습니다.
- 최상위 에러 경계에서 로깅 후 다시 에러를 던지는(`log and re-raise`) 것처럼 의도적이고 허용되는 구문까지 문제로 감지하고 있습니다.
- 오탐이 너무 많아 검토자들이 도구의 결과를 무시하기 시작했으며, 목표는 "진짜 문제(Genuine issues)는 계속 잡으면서 오탐을 줄이는 것"입니다.

**D번이 정답인 이유:**
`broad except clause` 자체가 100% 오류는 아닙니다. 문맥에 따라 문제가 되는 경우(예: 에러를 무시하고 넘어가버리는 구문)와 허용 가능한 경우(예: 최상위 에러 경계에서 로깅 후 re-raise)가 나뉩니다. 모델에게 문제가 되는 사례와 허용되는 사례를 정답(Verdict)과 함께 대조적인 쌍(Paired Examples)으로 프롬프트에 작성해 주면, 모델이 두 경우의 경계 조건을 명확히 학습하여 진짜 문제는 잡고 허용 가능한 구문은 스킵하는 고도화된 판단을 내릴 수 있습니다.

**오답 분석:**
- Option A (오답): 규칙을 완전히 제거하면 오탐은 사라지지만 진짜 문제(Genuine issues)도 전혀 잡지 못하므로 요구사항을 만족하지 못합니다.
- Option B (오답): 가장 높은 신뢰도의 항목 1개만 보고하면 한 파일에 존재하는 여러 진짜 문제를 놓치게 됩니다.
- Option C (오답): 패턴이 동일 파일에 3회 이상 등장해야만 감지하도록 임의의 횟수 제약을 두는 것은 버그의 심각성이나 허용 가능 여부와 아무런 논리적 관련이 없습니다.

---

# C. 리뷰 오탐 줄이기 — confidence 언어 대신 명시 기준, 그 다음 단계

52: confidence 문구가 실패하는 이유. 20: 명시적 이슈 목록으로 교체. 44: 명시 기준 적용 예(docstring 모순은 보고). 39: 전용 서브에이전트. 87: 2단계 체인의 이점. 71: 재활성화 전 held-out 검증.

## 10번 문제 (원본 52번)

**어려운 이유** [부분적으로만 맞는 오답] — 세 오답 모두 "왜 실패했는가"에 그럴듯한 메커니즘 설명을 붙였고, 특히 D의 "토큰으로 파싱되지 않아 무시" 논리가 결론은 맞고 이유가 틀린 전형이다.

**1. 문제 원문**

A prompt engineer tries to fix a noisy security-findings category by adding the line "only report high-confidence findings" to the system prompt. After a week of testing, the false positive rate is essentially unchanged. What is the most likely explanation for why this change failed to improve precision?

A) **General confidence language gives the model no concrete rule** for what to report, so it still applies the same underlying judgment that produced the false positives before the change.

B) Adding any qualifier to a system prompt increases ~~output length, which expands the set of tokens~~ the evaluator inspects and independently raises the chance that a finding is miscategorized as high severity.

C) ~~High-confidence phrasing conflicts with the model's safety training~~, which is designed to avoid under-reporting risks, causing it to over-report findings as a cautionary default across a wider range of inputs.

D) ~~The word "confidence" is not in the set of tokens~~ the model is trained to parse for output constraints, so the instruction is treated as decorative text and ignored, leaving the original behavior unchanged.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: A번**

**정답 및 해설:**

**핵심 개념:** 모호한 신뢰도 지침 vs 명시적/범주적 규칙 (Vague Confidence Phrasing vs. Explicit Criteria)  
LLM에 "신뢰도가 높은 항목만 보고하라(high-confidence findings)"와 같이 주관적이고 추상적인 문구를 제공하면 모델은 스스로 무엇이 '신뢰도가 높은지' 객관적으로 판단할 수 없습니다. 결국 이전과 동일한 내재적 판단 기준을 적용하게 되므로 오탐률(False Positive Rate) 감소 및 정밀도 개선에 실패하게 됩니다.

**문제 상황 분석:**
- 보안 지적 사항 카테고리에서 오탐(False positive)이 많이 발생함.
- 프롬프트 엔지니어가 "only report high-confidence findings"라는 한 줄을 시스템 프롬프트에 추가함.
- 일주일간 테스트했지만 오탐률에 변화가 없었으며 정밀도가 개선되지 않음.

**A번이 정답인 이유:**
"high-confidence"라는 일반적이고 모호한 단어는 무엇을 보고하고 무엇을 스킵해야 하는지에 대한 구체적이고 객관적인 기준(Explicit/Categorical Criteria)을 모델에게 제공하지 못합니다. 모델은 '높은 신뢰도'의 정의를 알 수 없어 기존과 동일한 방식으로 오탐 가능성이 있는 지적 사항들을 그대로 출력하므로 정밀도 개선에 실패합니다.

**오답 분석:**
- Option B (오답): 프롬프트에 수식어를 추가하는 것이 출력 길이를 불필요하게 늘려 심각도 오분류 확률을 직접적으로 높인다는 주장은 기술적 근거가 없는 오답입니다.
- Option C (오답): 주관적인 신뢰도 문구가 모델의 안전 학습(Safety training)과 직접적으로 충돌하여 예방 조치로 지적 사항을 과다 보고하게 된다는 해석은 사실이 아닙니다.
- Option D (오답): LLM은 어휘 집합 내의 모든 일반 단어를 파싱할 수 있으며, "confidence"라는 특정 단어가 제약 조건 토큰 집합에서 제외되어 무시된다는 설명은 LLM 작동 방식에 대한 잘못된 설명입니다.

---

## 11번 문제 (원본 20번)

**어려운 이유** [근본 원인 vs 증상 완화] — 이미 실패한 confidence 문구를 대문자 강조·수치 임계값·배치 이동으로 손보는 세 오답이 모두 자연스럽지만, 카테고리 범위 자체를 재정의하는 것만이 교훈에 맞다.

**문제 원문**

A team already tried adding "only report issues you are confident about" to a noisy category and saw no improvement in precision. An architect now wants to redesign the category's scope entirely rather than continuing to tune confidence language. Which redesign reflects the correct lesson from the earlier failed attempt?

A) Rephrase the same confidence instruction ~~using stronger emphasis~~, such as capitalizing key words, so the model treats the requirement as a stricter constraint.

B) Keep the confidence instruction but ~~add a numeric percentage threshold~~ to it, so the model has a specific number to compare its confidence against.

C) Replace the confidence instruction with a list of the specific issue types that **qualify(해당하다)** for this category, and explicitly state which related issue types should be skipped.

D) Move the confidence instruction ~~from the system prompt into the user message~~ instead, on the assumption that message placement was the reason it had no effect.

---

**정답 및 해설 (Answer & Explanation)**

**정답: C번**

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

## 12번 문제 (원본 44번)

**어려운 이유** [원칙이 깨지는 예외] — "주관적 판단은 보고하지 않는다"는 학습된 규칙을 적용하면 docstring을 의도 표현으로 보고 넘어가기 쉬우나, 여기서는 검증 가능한 모순이라 보고해야 한다.

**1. 문제 원문**

A reviewer **flags(지적하다)** a docstring that says "returns the cached value if present, otherwise fetches from the API," but the function under review always calls the API **regardless of(~에 상관없이)** a cache. Under an explicit-criteria rule that only **flags(지적하다)** comments **contradicted by(~와 모순되는)** actual code **behavior(동작)**, should this finding be reported? => 프롬프트로 명시적 기준 규칙을 위반하는 건 지적하라고 지시했다. 이런 기준을 준 상태에서, docstring과 실제 코드가 다르면 지적이 되어야 하는가?

A) No, because docstrings describe **intent(의도)** rather than guaranteed behavior, so a mismatch with the current implementation is not a reportable **contradiction(모순)**.

B) Yes, but only if the function is called from more than one place in the codebase, since single-use functions are **exempt(제외되다)** from this criterion.

C) Yes, because the docstring makes a **specific(구체적)**, **checkable(확인 가능한)** **claim(주장)** about caching behavior that the code's actual control flow directly **contradicts(모순시키는)**.

D) No, because caching behavior is an implementation detail, and implementation details are excluded from comment-**accuracy(정확성)** review by definition.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: C번**

**정답 및 해설:**

**핵심 개념:**
- 프롬프트로 명시적 기준을 줬으면, "이 정도는 넘어가도 되지 않을까" 하는 일반적 직관(주관적 판단)을 적용하지 말고, **주어진 기준에 실제로 해당하는지만 판단해서 규칙대로 지적해야 한다**.

**문제 상황 분석:**
- 독스트링은 "캐시가 있으면 캐시 값을 반환하고, 없으면 API를 호출한다"고 명시함.
- 그러나 실제 작성된 코드는 캐시 존재 여부를 확인하지 않고 항상 API를 호출함.
- 검토 규정은 "실제 코드 동작과 모순(contradict)되는 주석만 지적한다"는 명확한 기준(explicit-criteria rule)을 따르고 있음.

**C번이 정답인 이유:**
독스트링에 작성된 설명은 "캐싱 조건부 동작"이라는 구체적이고 코드상에서 검증 가능한(checkable) 내용을 담고 있습니다. 하지만 실제 코드의 제어 흐름은 캐시 확인 없이 항상 API를 호출하므로 독스트링의 내용과 직접적으로 충돌하며 모순됩니다. 따라서 주어진 명확한 검토 규칙에 따라 이 지적 사항은 보고(reported)되어야 합니다.

**오답 분석:**
- Option A (오답): 독스트링이 의도를 나타낸다 하더라도, 명시된 조건부 캐싱 동작과 실제 항상 API를 호출하는 구현 간의 직접적인 모순은 규칙상 명백한 지적 대상입니다.
- Option B (오답): 함수가 코드베이스에서 호출되는 횟수(단일 사용 여부)는 주석-코드 모순 여부를 판단하는 기준에 해당하지 않습니다.
- Option D (오답): 독스트링에 특정 캐싱 제어 흐름을 명시적으로 서술해 두었다면 이는 단순 구현 세부 사항을 넘어 외부 호출자가 기대하는 함수의 동작 계약(Contract)에 해당하므로, 실제 코드와 다를 경우 지적 대상입니다.

---

## 13번 문제 (원본 39번) ★

**어려운 이유** [길이가 단서 아님, 덜 틀린 답 고르기] — 정답이 가장 긴 옵션이라 오히려 역함정처럼 보이고, "낮은 심각도로 보고" 같은 절충안이 실무적으로 매우 그럴듯하다.

**1. 문제 원문**

A code review agent **flags(지적하다)** a helper function because its naming does not match the dominant naming convention in the file. However, the file already contains legacy functions with several naming styles, and the helper function's name is consistent with one of those legacy styles but not with the project's canonical naming standard. The architect is using a subagent-based code review workflow and wants a **criterion(기준)** that **reduces(!!) this kind of false positive** without **suppressing(억제하다, 놓치다)** **genuine(진정한)** naming defects. Which criterion best addresses this failure mode?

A) ~~Skip all naming-related findings~~ across the entire codebase **regardless of(~에 상관없이)** context, treating naming style as advisory, and focus the review exclusively on validating the code's logic and error handling.

B) Report the naming **inconsistency(불일치)** but flag it as low **severity(심각도)** in the findings list and include the local style **variations(변형)** that are already present in the file to provide context for the review. => 심각도를 낮춰도 오탐을 줄이지 못 하고 그대로 계속된다.

C) Dedicate a subagent to naming review with an isolated context window, a custom system prompt that instructs it to ignore pre-existing local style variations and flag only **deviations(편차)** from the project's canonical naming standard, and least-privilege tool access. This **reduces false positives** by focusing the review on the canonical standard, though it cannot **eliminate(제거하다)** all false positives. => 검토를 표준명명규칙에 집중시켜서 오탐을 줄인다, 비록 모든 오탐을 완전히 없앨 수는 없지만 (한계까지 정직하게 인정하는 모습)

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: C번**

**정답 및 해설:**

**핵심 개념**: 서브에이전트 역할 격리 및 시스템 프롬프트를 통한 오탐 차단 (Subagent Isolation & Standard-driven Prompts)

**문제 상황 분석:**
- 검토 에이전트가 헬퍼 함수의 이름을 지적함 (해당 파일 내 주요 컨벤션과 다르다는 이유)
- 하지만 그 파일에는 이미 다양한 이름 스타일을 가진 레거시 함수들이 존재하며, 헬퍼 함수는 그중 한 레거시 스타일을 따른 것일 뿐임 (프로젝트 전역 표준과는 일치하지 않음)
- 진성 이름 결함은 잡아내면서, 파일 내 레거시 파편화 때문에 일어나는 모호한 오탐(False positive)만 선택적으로 줄일 수 있는 서브에이전트 설계 기준이 필요함

**C번이 정답인 이유:**
- 전용 서브에이전트(Dedicated subagent)에 **격리된 컨텍스트**와 **명확한 커스텀 시스템 프롬프트**를 부여하는 것이 핵심입니다.
- 시스템 프롬프트를 통해 "파일 내부의 기존 로컬 스타일 혼용에惑(혹)하지 말고, 오직 프로젝트 중앙 표준 기준(Canonical naming standard)에서 벗어난 진성 위반만 검출하라"고 명확히 제한함으로써 레거시 혼재로 인한 오탐을 대폭 감소시킬 수 있습니다.

**오답 분석:**
- Option B (오답): 오탐 메시지 자체를 없애지 않고 단순히 낮은 심각도로 계속 보고하는 방식은 개발자의 알림 피로도(Notification fatigue)를 해결하지 못합니다.

---

## 14번 문제 (원본 87번) ★

**어려운 이유** [부분적으로만 맞는 오답] — 체이닝이 정밀도를 높인다는 결론은 네 선택지 모두 같고, "시스템 프롬프트 리셋", "컨텍스트 2배" 같은 그럴듯하지만 틀린 메커니즘을 걸러내야 한다.

**1. 문제 원문**

An architect is designing a multi-step pipeline to **reduce false positives** in a review category: a first API call generates draft findings, and a second API call reviews each draft against explicit criteria before finalizing it. Why would this **chained approach improve precision** compared to a single-pass prompt with the same criteria?

B) Chaining calls **resets the model's system prompt** after the **draft(초안)** generation, which **strips(제거하다)** any prior **contextual cues(맥락적 단서들)** / that / could have biased (편향시켰을 수 있다) / the first pass / toward over-flagging (~쪽으로 과도하게 지적하도록) / **benign(무해한)** patterns / as findings (지적 사항으로) / , reducing false positives. => 그 단서들은 → 첫 번째 패스를 편향시켰을 수 있었다 → (어느 쪽으로?) 무해한 패턴을 지적 사항으로 과잉 표시하는 쪽으로 → (그걸 제거하니) 오탐이 줄어든다

C) The second pass gives the model a separate opportunity to check each draft finding against the explicit criteria in isolation, catching cases where the first pass / may have misapplied (잘못 적용했을 수도 있다) / the criteria / due to generating (생성한 것 때문에) / a large set of findings in one response. => 첫 번째 패스가 → 기준을 잘못 적용했을 수도 있다 → (왜냐하면) 하나의 응답 안에서 → 대량의 지적 사항을 생성했기 때문에

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: C번**

**정답 및 해설:**

**핵심 개념:** 프롬프트 체이닝(Prompt Chaining) 및 multi-pass 검증 패턴입니다. 단일 생성 패스(Single-pass)에서 LLM은 다량의 결과를 동시에 탐색·생성하느라 인지적 부담(Cognitive load)이 커져 검토 기준을 놓치거나 잘못 적용(False Positive 유발)하기 쉽습니다. 생성을 담당하는 1차 호출과 검증을 담당하는 2차 호출로 분리하면 각 초안을 집중적·개별적으로 검증할 수 있어 정밀도(Precision)가 대폭 향상됩니다.

**문제 상황 분석:**
- 첫 번째 API 호출: 검토 대상 코드/문서에서 초안 발견 사항(Draft findings)을 탐색하여 생성.
- 두 번째 API 호출: 생성된 초안 항목들을 명시적 검토 기준에 맞춰 개별적으로 재검토 및 정제.
- 동일한 기준을 단일 프롬프트(Single-pass)로 전달하는 것보다 위와 같이 체이닝(Chaining) 파이프라인으로 구성할 때 정밀도가 높아지는 이유를 묻는 문제입니다.

**C번이 정답인 이유:**
단일 패스 생성 시에는 한 번의 응답 출력에서 수많은 후보 항목을 찾아내고 정형화하느라 모델이 복잡한 기준 조건을 완벽히 적용하지 못하고 오탐(False Positive)을 남길 수 있습니다. 반면, 2차 검토 패스를 별도로 두면 이미 뽑혀 나온 초안 목록 하나하나에 집중하여 검토 기준 준수 여부만 독립적으로(in isolation) 엄격히 평가할 수 있습니다. 그 결과, 1차 작업 시 과도하게 잡혔던 부적절한 플래그들이 걸러져 정밀도가 명확히 향상됩니다.

**오답 분석:**
- Option B (오답): 프롬프트 체이닝이 시스템 프롬프트를 재설정하여 이전 맥락을 지워주기 때문이라는 설명은 아키텍처 관점에서 정밀도 향상의 본질적인 이유(개별 항목에 대한 별도 검증 및 정제 기회 제공)가 아닙니다.

---

## 15번 문제 (원본 71번) ★

**어려운 이유** [덜 틀린 답 고르기] — 시니어 엔지니어의 과거 PR 수동 검토(B)가 현실적으로 충분해 보이지만, held-out 세트로 FP율을 측정하는 정량 검증만이 정답이다.

**1. 문제 원문**

After temporarily disabling a high false-positive "performance suggestions" category and rewriting its criteria with specific, checkable rules, an architect must decide when it is safe to re-enable the category for the whole team. What is the most appropriate validation step before re-enabling it broadly?

C) Re-enable the category only for pull requests opened by the engineer who reported the false positives, as a limited pilot to verify the criteria, while keeping it disabled for all other contributors. => 특정 개발자에 의존하면 샘플의 다양성을 담보할 수 없다.

D) Run the rewritten prompt against a **held-out set(과거의 실제 데이터셋)** of past pull requests with known findings, and confirm its false positive rate has dropped to an acceptable level before re-enabling it for everyone.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: D번**

**정답 및 해설:**

**핵심 개념:** 프롬프트 평가 모범 사례입니다. AI 프롬프트의 품질을 개선하거나 수정한 후에는 결과를 정량적으로 검증하기 위해 미리 별도로 격리해 둔 검증용 데이터셋(Held-out dataset / Gold standard dataset)을 기반으로 자동화된 벤치마크 테스트를 거쳐야 합니다.

**문제 상황 분석:**
- 코드 리뷰 또는 정적 분석 에이전트의 "성능 제안" 카테고리가 높은 오탐(False Positive)을 발생시켜 임시 비활성화됨.
- 아키텍트가 해당 카테고리의 판단 기준 프롬프트를 명확하고 검증 가능한 규칙으로 수정함.
- 전체 팀에 배포(Re-enable)하기 전, 오탐율이 실제로 줄어들었는지 안전하게 검증하는 가장 정석적인 품질 관리(QA) 절차를 찾아야 함.

**D번이 정답인 이유:**
프롬프트 변경 사항을 배포하기 전에는 결과가 이미 수집되어 있는 과거 실제 데이터셋(Held-out Dataset)을 대상으로 수정된 프롬프트를 실행하여 정량 지표(False Positive Rate)를 측정해야 합니다. 오탐율이 목표치 이하로 감소했음을 객관적인 데이터로 확인한 후 전체 배포를 진행하는 것이 프롬프트 회귀 테스트(Regression Testing)의 모범 사례입니다.

**오답 분석:**
- Option C (오답): 오류를 리포트한 특정 개발자의 PR에만 한정하여 활성화하는 라이브 프로덕션 파일럿 방식은 불완전하며, 데이터 샘플의 다양성을 반영하지 못하고 해당 개발자에게 테스트 부담을 전가합니다.

**평가/검증 목적 데이터셋:**
- Held-out dataset / Holdout set — 학습에서 제외해 평가용으로 남긴 데이터
- Withheld dataset — "보류/유보해둔" 데이터, held-out과 거의 동의어
- Split-off set — train/test split 과정에서 "떼어낸" 부분임을 강조
- Evaluation set — 평가용 데이터셋 (일반적 표현)
- Validation set — 튜닝 단계에서 쓰는 검증용 데이터
- Curated dataset — 사람이 직접 선별/검수한 데이터셋 (품질 보증 뉘앙스)
- Labeled/Annotated dataset — 사람이 정답 레이블을 달아둔 데이터셋

**Gold standard 계열 (정답/기준이 확실한 데이터):**
- Gold standard dataset — 가장 신뢰할 수 있는 정답으로 간주되는 데이터셋
- Ground truth — 실제 정답, 참값 (예: "compared against ground truth")

**말뭉치/데이터셋:**
- scanned-document corpus - 스캔된 문서 말뭉치

---

# D. tool_choice — 강제 호출의 부작용과 설계

62: 특정 도구 강제는 앞선 텍스트 억제. 78: 강제 + extended thinking 오류는 thinking 비활성(auto 전환 아님). 95: any + 유형별 도구 3개.

## 16번 문제 (원본 62번)

**어려운 이유** [원칙이 깨지는 예외, 복합 시나리오] — 특정 도구 강제 방법은 쉽지만, 강제 도구 호출 시 앞선 자연어 텍스트가 억제된다는 문서상 트레이드오프를 함께 알아야 풀린다.

**1. 문제 원문**

A team building a resume-parsing tool wants to guarantee that structured candidate data is extracted via a `parse_resume` tool on the current turn. They also want to know whether Claude can include natural-language reasoning about ambiguous resume sections before that tool call. Which `tool_choice` configuration should be used to guarantee the `parse_resume` call, and what does Anthropic documentation state about **natural-language commentary before a forced tool call**?

B) `tool_choice: {"type": "tool", "name": "parse_resume"}`, because this is the documented way to force the specific tool; the trade-off is that forced tool use **suppresses(억제하다)** natural-language text before the tool call

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: B번**

**정답 및 해설:**

**핵심 개념:**  
Anthropic Claude API의 `tool_choice` 파라미터 동작 방식 및 강제 도구 사용(Forced Tool Use) 시 트레이드오프입니다. 특정 도구를 명시적으로 지정하여 실행을 보장할 수 있지만, 도구가 강제될 경우 도구 호출 전 작성되는 일반 자연어 텍스트 생성이 억제(Suppression)되는 특성이 있습니다.

**문제 상황 분석:**  
- 이력서 파싱 서비스에서 현재 턴에 `parse_resume`이라는 특정 도구가 반드시 호출되도록 보장해야 합니다.
- 동시에 도구 호출 전 모호한 이력서 영역에 대한 자연어 추론/해설을 포함할 수 있는지 여부를 공식 문서 기준으로 확인하려 합니다.
- 특정 도구 강제 제어 파라미터 구성법과 해당 기능 사용 시 발생하는 동작 제약 조건을 파악해야 합니다.

**B번이 정답인 이유:**  
Anthropic 공식 문서에 따르면 특정 단일 도구의 호출을 보장하려면 `tool_choice: {"type": "tool", "name": "parse_resume"}` 형태로 지정해야 합니다. 또한 공식 문서에는 **특정한 도구가 강제로 설정될 경우**, 모델은 도구 호출 전 서술형 자연어 텍스트(Natural-language text/commentary)를 함께 출력하는 대신 곧바로 **도구 호출(Tool call)에 필요한 JSON 객체만 생성하도록 유도 및 억제된다**고 명시되어 있습니다. 따라서 B번이 기술적 사양과 공식 문서 지침을 정확히 설명합니다.

---

## 17번 문제 (원본 95번) ★

**어려운 이유** [덜 틀린 답 고르기, 부분적으로만 맞는 오답] — 통합 스키마의 일관된 필드 네이밍 이점(D)이 실무적으로 설득력 있어, tool_choice "any"의 설계 의도(타입별 도구 선택)와 정면으로 경합한다.

**1. 문제 원문**

An engineering team is deciding whether to expose one single extract_document tool with a very large schema covering invoices, receipts, and purchase orders in one combined structure, or three separate smaller tools (extract_invoice, extract_receipt, extract_purchase_order) selected via tool_choice: "any" based on document content. Users upload one document at a time and document type varies per upload. Which design better matches the intended use of tool_choice: "any" for extraction? => "어떤 설계가 추출(extraction) 작업에서 tool_choice: "any"의 의도된 사용 방식에 더 잘 부합할까요?"

B) One combined extraction tool with a single schema for all document types, because **tool_choice: "any" requires exactly one tool to be registered** in the tools array for the model to invoke the extraction logic correctly and clearly. => 하나로 통합한 도구는 무조건 아님

C) Three separate, document-type-specific tools with tool_choice: "any", so Claude selects the schema matching the actual document avoiding the noise and confusion of an oversized combined schema. => tool_choice: "any"를 사용하는 세 개의 별도 문서 유형별 도구를 두어, 지나치게 큰 통합 스키마의 노이즈와 혼란을 피하면서 Claude가 실제 문서와 일치하는 스키마를 선택하도록 합니다.

D) One combined extraction tool with a **unified(공통)** schema for invoices, receipts, and purchase orders, where tool_choice: "any" selects that single tool and ensures consistent field naming across all document types without schema conflicts. => 하나로 통합한 도구는 무조건 아님

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: C번**

**정답 및 해설:**

**핵심 개념:** 도구 정의 및 스키마 모듈화 패턴(Tool Schema Modularization)과 `tool_choice: {"type": "any"}`의 활용 모범 사례입니다. `tool_choice: {"type": "any"}` 설정은 모델에게 "제공된 도구 목록 중 하나 이상을 반드시 호출하라"고 강제하면서도, **어떤 도구를 선택할지는 모델이 컨텍스트(문서 내용)를 판단하여 자율적으로 결정**하도록 위임합니다. 하나의 거대하고 복잡한 통합 스키마(Monolithic Schema) 대신 특화된 소형 스키마 여러 개를 제공하는 것이 프롬프트 노이즈를 줄이고 추출 정확도를 향상시킵니다.

**문제 상황 분석:**
- 송장, 영수증, 구매 주문서 등 업로드되는 문서의 종류가 다양하며, 한 번에 한 문서씩 들어옵니다.
- 선택지 설계안 1: 3가지 문서 형태를 모두 다루는 거대 통합 도구 1개 배치.
- 선택지 설계안 2: 문서 종류별로 특화된 소형 도구 3개를 배치하고 `tool_choice: "any"`로 호출을 강제.
- **`tool_choice: "any"`의 의도된 설계 목적과 API 베스트 프랙티스**에 완벽히 부합하는 방안을 찾는 문제입니다.

**C번이 정답인 이유:**
모든 필드를 포함하는 거대한 단일 스키마를 제공하면 스키마 내부의 수많은 선택적(Optional) 필드와 조건부 필드로 인해 모델이 노이즈를 겪고 환각이나 잘못된 필드 추출을 일으킬 위험이 높아집니다. 반면, 문서 종류별로 명확하고 간결한 스키마를 가진 3개의 도구(`extract_invoice`, `extract_receipt`, `extract_purchase_order`)를 등록하고 `tool_choice: {"type": "any"}`를 주면, Claude는 도구 호출을 강제받는 동시에 입력된 문서 내용을 분석하여 가장 적합한 도구를 스스로 선택합니다. 이는 스키마 복잡성을 낮추고 추출 정확도를 극대화하는 `tool_choice: "any"`의 올바른 활용 방식입니다.

**오답 분석:**
- Option B (오답): `tool_choice: "any"`를 사용할 때 `tools` 배열에 반드시 1개의 도구만 등록되어야 한다는 제약 조건은 전혀 없으며, 여러 개 도구 중 하나를 선택하도록 유도하는 데 자주 쓰입니다.
- Option D (오답): 거대한 통합 스키마 1개를 사용하는 것은 스키마 충돌은 줄일 수 있어도 모델에게 불필요한 스키마 노이즈를 다량 제공하게 되므로, 소형 모듈화 도구들에 `tool_choice: "any"`를 적용하는 방식보다 우수한 설계가 아닙니다.

---

# E. Message Batches API — 제약과 스케줄

47: 클라이언트 도구 결과 왕복 불가. 89: 서버 도구(web search)는 가능. 7: 마감 역산 제출 주기.

---

## 20번 문제 (원본 7번)

**어려운 이유** [복합 시나리오, 부분적으로만 맞는 오답] — 24시간 처리 + 2시간 포매팅을 36시간에서 빼는 계산을 요구하며, 12시간·14시간 오답이 각각 "절반"과 "포매팅 흡수"라는 그럴듯한 논리를 붙여 산수 실수를 유도한다.

**1. 문제 원문**

A batch processing pipeline must deliver classification results within 36 hours of data ingestion. The pipeline submits jobs to the Anthropic Batches API, which processes each batch in up to 24 hours (worst case). After the API completes, a mandatory 2-hour formatting step runs before the report is finalized. To guarantee the 36-hour deadline even under worst-case API timing, what is the longest allowed interval between consecutive batch submission starts?

A) At least every 12 hours, since ignoring the formatting step and matching half the deadline directly against the processing window is sufficient.

B) At least every 10 hours, since the worst-case wait until the next batch (the interval) plus the 24-hour processing and the 2-hour formatting must not exceed 36 hours.

C) At least every 2 hours, since the formatting step's fixed duration alone should dictate the entire submission cadence regardless of processing time.

D) At least every 14 hours, since the downstream formatting time can be absorbed by shortening the batch's own processing window instead of the cycle interval.

---

**3. 정답 및 해설 (Answer & Explanation)**

**정답: B번**

**정답 및 해설:**

**핵심 개념**: SLA/SDR 서비스 마감 기한 계산 및 일시적 배치 주기 설계
데이터 수집 후 최종 보고서 완결까지의 총 소요 시간(SLA)은 **[최악의 다음 배치 제출 대기 시간(제출 간격) + Batches API 처리 소요 시간 + 후속 포맷팅 소요 시간]**의 합으로 산출됩니다.

**문제 상황 분석:**
- 데이터 수집 시점부터 보고서 완성까지 허용된 총 SLA 마감 기한 = **36시간**
- Batches API의 최악의 처리 소요 시간 = **24시간**
- API 완료 후 필수 포맷팅 작업 소요 시간 = **2시간**
- 데이터 수집 직후 다음 배치가 제출될 때까지 발생하는 최악의 대기 시간 = **제출 간격($I$)**

**B번이 정답인 이유:**
수집된 데이터가 배치가 막 출발한 직후 들어왔을 때 발생하는 최악의 대기 시간(간격 $I$)을 포함하여 총 소요 시간을 수식으로 세우면 다음과 같습니다.
$$\text{대기 시간}(I) + \text{API 처리}(24\text{시간}) + \text{포맷팅}(2\text{시간}) \le 36\text{시간}$$
$$I + 26 \le 36 \implies I \le 10\text{시간}$$
따라서 최악의 조건에서도 36시간 마감 기한을 완벽히 준수하기 위해서는 배치 제출 시작 간격이 최대 **10시간**(최소 10시간 주기로 실행)을 넘어서는 안 됩니다.

**오답 분석:**

- Option A (오답): 필수 2시간 포맷팅 단계를 무시하고 단순히 36시간의 절반인 12시간으로 산정한 잘못된 계산입니다. ($12 + 24 + 2 = 38\text{시간}$으로 36시간 초과)
- Option C (오답): 포맷팅 소요 시간인 2시간만 기준으로 제출 주기를 정하는 것은 API의 24시간 처리 소요 시간을 고려하지 않은 잘못된 접근법입니다.
- Option D (오답): 외부 Batches API의 최악 처리 시간 창(24시간)은 사용자가 마음대로 줄일 수 없으므로, 후속 포맷팅 시간을 API 처리 창을 줄여서 흡수한다는 설명은 비현실적이며 잘못된 계산입니다. ($14 + 24 + 2 = 40\text{시간}$으로 36시간 초과)

---
