# 시나리오1_CICD

## 질문 1

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : An Agent SDK application pulls data from three MCP servers that return Unix timestamps, ISO 8601 dates, and numeric status codes respectively, and its agent frequently misinterprets these mixed formats when correlating findings. What is the most reliable fix?

**A.** Register a PreToolUse hook that blocks each outgoing data-retrieval call whenever the target server does not return canonical formats.

**설명**

PreToolUse 훅은 도구가 실행되기 전에 실행되며 호출을 허용하거나 차단하여 정책을 강제할 수 있지만, 차단은 서버가 반환하는 데이터를 절대 변환하지 못한다. 이질적인 서버로부터의 조회를 차단하는 것은 단순히 에이전트가 해당 데이터에 접근하지 못하게 막는 것일 뿐이며, 이는 결과 정규화 문제에 대해 생명주기상 잘못된 지점을 가로채는 것이다.

**B.** Expose a convert_formats MCP tool and instruct the agent to invoke it after each data-retrieval call it makes.

**설명**

이는 정규화가 모델이 매번 조회할 때마다 추가 도구를 호출하는 것을 기억하는지에 좌우되게 만드는데, 이는 이 문제가 제거해야 할 바로 그 종류의 확률적 준수 방식이다. 또한 매 조회마다 추가적인 도구 호출 루프가 발생하여 지연 시간과 토큰 비용이 증가한다.

**C(정답).** Register an Agent SDK PostToolUse hook that transforms each tool result into one canonical format before the model processes it.

**설명**

이것이 정답인 이유는 Agent SDK의 PostToolUse 훅이 실행 후 도구 결과를 가로채서 모델이 처리하기 전에 데이터 변환을 적용하기 때문이다. 정규화가 단일 중앙 지점에서 결정론적으로 이루어지며, 변경할 수 없는 서드파티 서버에도 동작하고, 모델이 값을 변환해야 한다는 사실을 기억할 필요가 전혀 없다.

**D.** Document each server's timestamp and status-code conventions in the system prompt so the model translates the values.

**설명**

프롬프트 문서화는 강제가 아니라 확률적인 가이드일 뿐이며, 부하가 걸리거나 긴 컨텍스트 상황에서는 모델이 여전히 Unix 타임스탬프를 숫자 코드로 잘못 읽을 수 있다. 또한 매 요청마다 영구적인 토큰 오버헤드가 추가되면서도 일관된 해석을 보장하지 못한다.

### 전반적인 설명

에이전트가 여러 MCP 서버로부터 데이터를 받을 때, 각 서버는 자체적인 출력 규칙을 정의한다. 하나는 Unix epoch 정수를 내보내고, 다른 하나는 ISO 8601 문자열을, 또 다른 하나는 단순 숫자 상태 코드를 내보낼 수 있다. 그러면 모델은 매 턴마다 어떤 값에 어떤 규칙이 적용되는지 추론해야 한다. 이 추론은 확률적이며, 여러 형식이 컨텍스트 안에 나란히 섞여 있을 때 바로 이 지점에서 오류가 발생한다.

아키텍처적으로 올바른 해답은 정규화를 모델의 추론 밖으로 빼내어 결정론적인 코드로 처리하는 것이다. Claude Agent SDK에서 PostToolUse 훅은 도구가 실행된 직후 결과를 가로채서 모델이 처리하기 전에 변환을 적용한다. 이 시점의 코드는 모든 타임스탬프를 ISO 8601로, 모든 상태 코드를 레이블이 붙은 문자열로 변환할 수 있으므로, 모델은 오직 하나의 표준 형식만 놓고 추론하게 된다. 변환이 서버 내부가 아니라 결과에 대해 실행되기 때문에, 소유한 도구와 수정할 수 없는 서드파티 서버 모두에 동일하게 동작하며, 여러 서버 구현에 흩어지지 않고 한 곳에 존재한다.

다른 접근법들은 각각 메커니즘 수준의 세부사항에서 실패한다. PreToolUse 훅은 실행 전에 실행되어 나가는 호출을 허용하거나 차단할 수 있는데, 이는 정책 강제를 위한 올바른 수단이지만 응답을 전혀 보지 못한다. 이질적인 조회를 차단하는 것은 데이터를 정규화하는 것이 아니라 에이전트에게 데이터 자체를 거부하는 것이다. 시스템 프롬프트 문서화와 에이전트가 호출하는 변환 도구는 둘 다 정규화를 모델의 준수 여부에 맡기는데, 이는 90% 이상이지만 100%는 아니며, 도구 방식은 추가로 매 조회마다 루프 반복 횟수를 두 배로 늘린다. 일반적인 규칙은 다음과 같다. 매번 반드시 일어나야 하는 동작에는 훅을 사용하고, 유연성이 허용되는 경우에는 프롬프트를 사용한다.

훅 이벤트와 도구 결과 처리에 대한 자세한 내용은 Claude Agent SDK 훅 문서와 MCP 도구 문서를 참고하라.


## 질문 2

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline's coordinator spawns three review subagents in parallel, each prompted only with "review this pull request." Their findings overlap heavily, nearly doubling token cost without adding review coverage. What is the most effective fix?

**A.** Run the subagents sequentially, passing each one the findings of the previous subagents so it avoids re-reporting flagged issues.

**설명**

순차 실행은 다중 서브에이전트 리뷰를 빠르게 만드는 병렬성을 희생시켜 실제 소요 시간을 세 배로 늘린다. 또한 중복을 런타임 필터링 문제로 취급할 뿐, 그 원인이 되는 불명확한 작업 경계 자체를 고치지 못한다.

**B.** Add a shared log file that each subagent updates with its current focus area so the others can steer around duplicated work dynamically.

**설명**

서브에이전트는 격리된 컨텍스트에서 실행되며, 공유 상태를 통한 런타임 조정이 아니라 독립적인 조사를 위해 설계된 것이다. 코디네이터가 처음부터 명확한 범위를 정의하면 될 일을, 이 메커니즘은 취약한 복잡성과 폴링 오버헤드를 더할 뿐이다.

**C(정답).** Have the coordinator assign each subagent one distinct review concern, such as security, test coverage, or style, in its delegation prompt.

**설명**

이것이 정답인 이유는 서브에이전트는 위임 프롬프트에 담긴 내용만 볼 수 있기 때문에, 코디네이터가 작업이 시작되기 전에 서로 겹치지 않는 경계를 정의해야 한다는 점이다. 명시적인 분할은 중복을 근원에서 제거하면서도 세 리뷰를 완전히 병렬로 유지한다.

**D.** Let all three finish in parallel, then add a deduplication pass in the coordinator that merges overlapping findings before posting feedback.

**설명**

사후 중복 제거는 출력을 정리해주지만, 중복된 조사에 대한 토큰과 지연 시간 비용은 이미 지불된 상태다. 근본 원인인 동일하고 범위가 정해지지 않은 프롬프트는 그대로 남아 있어, 이 낭비는 모든 풀 리퀘스트마다 반복된다.

### 전반적인 설명

Claude Agent SDK에서 서브에이전트의 컨텍스트는 항상 새롭게 시작한다. 부모 대화나 다른 형제 에이전트의 작업을 물려받지 않는다. 서브에이전트가 자신의 임무를 알 수 있는 유일한 통로는 코디네이터가 생성 시 작성한 프롬프트뿐이다. 세 명의 리뷰어가 모두 "이 풀 리퀘스트를 리뷰하라"라는 동일한 지시를 받으면 각자의 범위를 구분할 근거가 전혀 없으므로, 각각 전체 diff를 독립적으로 조사하게 되고 결과가 서로 겹치게 된다. 해결책은 모호함이 생겨난 지점에 있다. 즉 코디네이터는 위임하기 전에 리뷰 영역을 분할하여, 각 서브에이전트의 위임 프롬프트에 명시적이고 겹치지 않는 관심 영역(보안, 테스트 커버리지, 스타일)을 직접 부여해야 한다.

이 설계는 Anthropic이 병렬 서브에이전트 작업을 설명하는 방식과도 일치한다. 각 에이전트가 자신의 영역을 탐색하고 부모가 결과를 종합하는 방식으로, 조사들이 독립적일 때 가장 효과적이다. 명확히 구분된 범위는 작업을 진정으로 독립적으로 만들어, 동시성을 유지하면서도 낭비되는 토큰을 없앤다. 범위 설정은 각 AgentDefinition에서 에이전트별 도구 제한과 전문화된 시스템 프롬프트로 강화할 수 있다. 예를 들어 스타일 리뷰어는 보안 리뷰어와 동일한 범위의 탐색이 결코 필요하지 않다.

다른 대안들은 모두 증상만 다룬다. 사후 중복 제거는 이미 중복된 토큰 비용이 발생한 뒤에야 겹치는 결과를 병합하며, 이는 매 실행마다 반복된다. 이전 결과를 넘겨받는 순차 실행은 병렬성을 완전히 포기하며, 서브에이전트가 서로의 작업을 볼 수 없으므로 코디네이터가 이전 결과를 명시적으로 전달해야 한다는 요구사항도 여전히 남는다. 공유 조정 로그는 격리된 에이전트들에게 아키텍처가 잘 지원하지 않는 런타임 협상을 요구하는 것이다. 에이전트 간 라우팅과 범위 설정은 코디네이터의 책임이다. SDK의 서브에이전트 문서와 커스텀 서브에이전트 만들기 문서를 참고하라.


## 질문 3

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : In a pull request review pipeline, a security-review subagent completes its analysis and its findings must reach a fix-suggestion subagent. How should the findings be moved between the two subagents?

**A.** Merge the two subagents into one combined agent that reviews and proposes fixes within a single context, removing the handoff.

**설명**

파이프라인을 하나의 에이전트로 통합하면 이 설계가 존재하는 이유인 장점들, 즉 개별적으로 전문화된 시스템 프롬프트, 에이전트별 도구 제한, 그리고 상세한 스캔 출력을 수정 단계에서 배제하는 컨텍스트 격리를 모두 버리게 되므로 이는 틀린 답이다. 핸드오프 비용은 중앙화된 위임이 보존해주는 것에 비하면 작다.

**B.** Have the fix-suggestion subagent repeat the security analysis itself so no findings ever need to be transferred between agents.

**설명**

이는 다른 목적을 위해 범위가 정해진 에이전트 안에서 전체 리뷰를 중복 수행하게 만들어, 모든 풀 리퀘스트마다 비용과 지연 시간을 두 배로 늘리므로 틀린 답이다. 또한 각 서브에이전트를 자신의 작업에서 신뢰할 수 있게 만드는 역할 경계와 도구 제한을 흐트러뜨린다.

**C(정답).** Have the coordinator collect the findings and include the relevant ones in the fix-suggestion subagent's delegation prompt.

**설명**

이것이 정답인 이유는 서브에이전트는 최종 결과를 코디네이터에게 반환하며, 서브에이전트는 자신의 프롬프트에 명시적으로 담긴 내용만 볼 수 있기 때문이다. 결과를 코디네이터를 통해 전달하면 모든 교환이 관찰 가능하게 유지되고, 한 곳에서 오류 처리를 적용할 수 있으며, 코디네이터가 수정 제안 서브에이전트가 받는 컨텍스트를 정확히 선별할 수 있다.

**D.** Spawn both subagents in parallel in a single coordinator turn so the fix-suggestion work does not wait on the security review.

**설명**

이는 병렬 생성이 하위 작업들이 서로 독립적일 때만 적합하기 때문에 틀린 답이다. 수정 제안 서브에이전트의 입력은 보안 조사 결과이므로, 그 결과가 존재하기 전에 실행을 시작하면 작업할 근거가 아무것도 없게 된다.

### 전반적인 설명

허브-스포크 방식의 멀티 에이전트 아키텍처에서 코디네이터는 모든 에이전트 간 정보가 흐르는 단일 지점이며, 문서화된 서브에이전트 모델도 이와 일치한다. 서브에이전트는 자신의 컨텍스트에서 실행되며, 최종 결과만 부모에게 반환된다. 서브에이전트 사이에는 공유 메모리가 없으므로, 코디네이터는 다음 위임 프롬프트에 명시적으로 포함시킴으로써 데이터를 그들 사이에 이동시킨다. 이 설계는 한 번에 세 가지 이점을 제공한다. 관찰 가능성(모든 결과, 오류, 핸드오프가 한 곳에서 보이는데, 이는 사람이 실행을 지켜보지 않는 무인 CI 파이프라인에서 중요하다), 일관된 오류 처리(타임아웃된 스캐너나 잘못된 형식의 결과가 하나의 일관된 정책으로 처리됨), 정보 통제(코디네이터가 수정 제안 서브에이전트가 무엇을 보는지 정확히 결정하여, 소란스러운 스캔 출력을 중요한 결과로 다듬음).

다른 대안들은 각각 이 모델의 일부를 깨뜨린다. 두 서브에이전트를 병렬로 생성하는 것은 하위 작업이 독립적일 때만 올바른 방법이다. 여기서는 두 번째 에이전트의 전체 입력이 첫 번째 에이전트의 출력이므로 의존성이 존재하며, 작업은 코디네이터를 통해 순차적으로 처리되어야 한다. 두 에이전트를 하나의 컨텍스트로 병합하면 핸드오프는 제거되지만, 작업을 분리하는 것이 가치 있었던 이유인 전문화, 도구 제한, 컨텍스트 격리도 함께 제거된다. 수정 제안 서브에이전트 안에서 보안 분석을 다시 실행하는 것은 풀 리퀘스트마다 전체 리뷰 비용을 두 번 지불함으로써만 전달 문제를 회피하는 것이다.

가져가야 할 사고 모델은 다음과 같다. 서브에이전트는 허브에 보고하는 격리된 작업자이며, 허브는 결과가 검증되고, 라우팅되고, 다음 에이전트의 컨텍스트로 변환되는 곳이다. 서브에이전트가 격리된 컨텍스트에서 실행되고 결과를 부모 대화에 반환하는 방식에 대해서는 커스텀 서브에이전트 만들기 문서를 참고하라.


## 질문 4

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A team schedules a Claude Code job to run a security-hardening pass on an unfamiliar API service where entry points, data flows, and shared dependencies are all undocumented. How should the job's prompt structure the work?

**A.** Restrict the pass to handlers named in past incident reports, since previously exploited code is where remaining vulnerabilities are most likely to concentrate.

**설명**

낯선 서비스에서는 과거 사고 기록이 현재 위험을 나타내는 지표로서 약하다. 아직 검토되지 않은 핸들러와 문서화되지 않은 데이터 흐름에 가장 심각한 취약점이 숨어 있을 수 있기 때문이다. 이미 알려진 문제 지점으로 작업을 제한하면 아직 파악되지 않은 대부분의 공격 표면이 평가되지 않은 채로 남는다.

**B.** Apply a fixed, predefined sequence of hardening steps to every module uniformly, since consistent treatment of each file guarantees nothing in the service gets missed.

**설명**

고정된 파이프라인은 모든 단계가 사전에 알려진 예측 가능한 작업에 적합하지만, 여기서는 범위 자체가 탐색을 통해 밝혀져야 한다. 균일한 처리는 노출도가 낮은 내부 코드에도 인터넷에 노출된 핸들러와 동일한 노력을 들이게 되며, 탐색 과정에서 계획을 바꿀 만한 공유 의존성이 발견되어도 대응할 수 없다.

**C.** Have Claude patch issues as it encounters them while reading through files, letting priorities emerge naturally from whatever code the job happens to inspect first.

**설명**

마주치는 순서대로 패치하면 매핑 단계를 완전히 건너뛰게 되어, 노력이 노출도나 영향도가 아니라 읽는 순서에 따라 배분된다. 또한 나중에 발견된 공유 의존성이 초기 수정 작업이 전체 그림을 보지 못한 채 이루어졌음을 보여주면 초기 수정을 다시 해야 할 수도 있다.

**D(정답).** Map the service's entry points and data flows first, rank handlers by exposure and impact, then follow a prioritized plan that adapts as shared dependencies surface.

**설명**

이는 전체 범위가 사전에 알려지지 않은 개방형 작업에 적합한 적응형 분해 방식을 적용한 것이다. 진입점과 데이터 흐름을 매핑하면 무엇이 존재하는지 파악할 수 있고, 노출도 순위는 취약점이 가장 큰 피해를 줄 곳으로 노력을 이끌며, 적응형 계획은 여러 핸들러가 의존하는 공유 헬퍼 같은 새로운 발견 사항을 흡수한다.

### 전반적인 설명

낯선 서비스를 강화하는 것과 같은 개방형 작업은 동적 적응형 분해를 필요로 한다. 에이전트는 먼저 지형을 매핑하고(Glob과 Grep 같은 도구를 사용해 진입점, 핸들러, 데이터 흐름을 목록화), 노출도가 집중되는 곳을 파악한 다음, 작업이 진행되면서 드러나는 뜻밖의 사실들, 예를 들어 여러 핸들러가 의존하며 개별 패치보다 먼저 고쳐야 하는 공유 검증 헬퍼 같은 것을 반영하여 스스로 수정되는 우선순위 계획을 세운다. 이는 Anthropic이 문서화한 "먼저 탐색하고, 계획을 세운 뒤, 코드를 작성한다"는 워크플로우와 일치한다. 낯선 코드베이스에서 곧바로 변경을 만드는 것은 잘못된 문제를 해결할 위험이 있다. 왜냐하면 가장 중요한 결정들(어떤 핸들러가 깊은 검토를 받아야 하는지, 어떤 공유 코드를 먼저 변경해야 하는지)은 오직 탐색을 통해서만 얻을 수 있는 정보에 좌우되기 때문이다.

이와 대조되는 것은 모든 단계가 사전에 알려진 예측 가능한 작업에 적합한 고정 파이프라인(프롬프트 체이닝)이다. 구조가 문서화되지 않은 서비스는 정반대의 경우다. 범위 자체가 탐색을 통해 밝혀져야 한다. 모든 파일에 동일하게 적용되는 체크리스트는 실제로 위험이 어디에 있는지를 무시하며, 마주치는 순서대로 패치하는 것은 읽는 순서가 우선순위 설정을 대신하게 하고, 과거 사고에 범위를 한정하는 것은 알려진 이력을 현재의 공격 표면으로 착각하는 것이다. 아키텍트가 가져야 할 사고 모델은 분해 전략이 작업의 불확실성 프로파일에 맞아야 한다는 것이다. 알려진 단계에는 고정된 체인을, 새롭게 드러나는 단계에는 적응형 계획을 사용한다. 이 패턴의 기반이 되는 탐색-계획-구현 워크플로우에 대해서는 Claude Code 모범 사례를 참고하라.


## 질문 5

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The review pipeline's coordinator delegates codebase investigation to exploration subagents, instructing each to run long, highly specific search queries (full function signatures with file paths). These searches frequently return zero matches, and reviews miss affected call sites. Which prompt-design change improves coverage?

**A.** Treat empty search results as retryable failures and have the coordinator resubmit the same query to a fresh subagent instance.

**설명**

유효한 검색에서 나온 빈 결과는 실패가 아니라, 아무것도 일치하지 않았다는 정확한 정보다. 동일하게 지나치게 구체적인 쿼리를 새 인스턴스에 재제출해도 같은 빈 결과가 나올 뿐이며, 이는 정당한 빈 결과와 접근 오류를 혼동하는 것이다.

**B.** Raise each subagent's tool-call budget so it can repeat its assigned specific query more times before returning a result.

**설명**

아무것도 일치하지 않는 쿼리를 재실행하면 시도 횟수를 얼마나 늘리든 아무 결과도 나오지 않는다. 여기서 제약은 예산이 아니라, 코디네이터가 지정한 쿼리의 형태 자체가 서브에이전트가 관련 코드를 찾지 못하게 막고 있다는 점이다.

**C.** Spawn additional exploration subagents so more variations of each highly specific query can run in parallel across the codebase.

**설명**

동일한 유형의 지나치게 좁은 쿼리를 실행하는 에이전트를 더 추가하면 근본 원인을 고치지 못한 채 비용만 늘어난다. 커버리지 공백은 쿼리 전략에서 비롯된 것이지 병렬성 부족에서 오는 것이 아니며, 모든 변형에 대해 에이전트를 생성하는 것은 알려진 비효율이다.

**D(정답).** Instruct subagents to start with short, broad searches, then progressively narrow toward specific call sites based on findings.

**설명**

이는 결과가 희박한 지나치게 구체적인 쿼리에 대한 문서화된 해결책이다. 넓게 시작하면 서브에이전트가 코드베이스에 실제로 무엇이 존재하는지 파악할 수 있고, 처음부터 정확한 일치를 추측하는 대신 실제 발견 사항을 바탕으로 초점을 좁혀갈 수 있다.

### 전반적인 설명

코디네이터가 탐색 서브에이전트에게 너무 길고 너무 구체적인 쿼리를 넘기면, 서브에이전트는 검색창에 문단 전체를 입력하는 연구자처럼 행동하게 된다. 검색 공간이 거의 0건의 일치로 붕괴되고, 코드베이스의 전체 영역이 조사되지 않은 채 남는다. Anthropic은 자사의 멀티 에이전트 리서치 시스템을 구축하면서 정확히 이 실패를 겪었고, 에이전트에게 넓게 시작한 뒤 좁혀 나가도록 프롬프트하는 방식으로 해결했다. 즉, 먼저 짧고 넓은 쿼리를 던지고, 실제 지형에 무엇이 있는지 살핀 다음, 발견한 내용을 바탕으로 정밀한 대상으로 파고드는 것이다. 동일한 원칙이 리뷰 파이프라인의 코드 탐색에도 적용된다. 함수 이름에 대한 넓은 검색은 정확한 시그니처와 경로를 조합한 쿼리로는 결코 드러나지 않을 호출 지점들을 보여준다.

여기서의 사고 모델은 조사 초반의 쿼리는 확인이 아니라 발견을 위한 것이라는 점이다. 모든 서브에이전트를 초정밀 목표에 사전에 고정시키는 코디네이터는 어떤 근거도 존재하기 전에 이미 모든 커버리지 결정을 내린 것이며, 이는 위임 설계 차원에서의 좁은 분해에 해당한다. 서브에이전트가 완벽하게 실행되어도 할당 자체가 대부분의 영역을 제외했기 때문에 결과는 여전히 불완전하다.

오답들은 모두 증상만 다룬다. 동일하게 지나치게 좁은 쿼리를 실행하는 병렬 서브에이전트를 늘리는 것은 커버리지가 아니라 비용만 늘린다. 빈 결과 쿼리를 재시도로 재제출하는 것은 정당한 빈 결과와 일시적인 접근 실패를 혼동하는 것이다. 실제로 아무것도 일치하지 않은 검색은 다시 실행해도 여전히 아무것도 일치하지 않는다. 도구 호출 예산을 늘리는 것은 실패할 수밖에 없는 쿼리를 결과를 바꾸지 못한 채 더 많이 반복하게 할 뿐이다. 근본적인 오케스트레이션 및 검색 전략 지침에 대해서는 "우리가 멀티 에이전트 리서치 시스템을 구축한 방법"과 "효과적인 에이전트 구축하기"를 참고하라.


## 질문 6

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A nightly re-review job wants to reuse yesterday's review session after a developer pushes a few new commits touching a handful of files. Most of the prior analysis remains valid. How should the job proceed?

**A(정답).** Resume the prior session, supply the list of files the new commits changed, and instruct Claude to re-read those files before reusing earlier findings.

**설명**

이것이 정답이다. 재개된 세션은 대화 이력을 복원할 뿐 파일시스템 상태를 복원하지 않으므로, 어제의 도구 결과는 이전 코드를 그대로 설명하고 있으며 아무것도 그것을 오래된 정보로 표시해주지 않는다. 변경된 파일을 명시적으로 지정하고 그 파일들을 목표로 다시 읽도록 지시하면, 오래된 증거만 정확히 교정하면서 여전히 유효한 대부분의 분석은 그대로 보존할 수 있다.

**B.** Resume the prior session with no additional input, since resumption automatically reconciles saved tool results with the current repository state.

**설명**

그런 조정 기능은 존재하지 않는다. 세션은 파일시스템이 아니라 대화를 지속시키며, 재개 시 어떤 형태의 파일 새로고침도 수행되지 않는다. 개입이 없으면 어제의 Read와 Grep 결과가 마치 최신인 것처럼 컨텍스트에 남아 있게 되어, 새 커밋이 삭제한 코드를 코멘트가 참조할 수도 있다.

**C.** Resume the prior session and compact its history first, so the outdated tool results are summarized away before the new review begins.

**설명**

압축은 대화를 요약할 뿐 저장소와 대조하여 검증하지는 않는다. 요약된 오래된 발견은 여전히 오래된 것이다. 요약은 어제의 오래된 결론을 현재 파일 내용으로 대체하는 대신 간결하게 서술된 사실로 그대로 이어갈 뿐이다.

**D.** Discard the prior session and launch a completely fresh review that re-explores the entire repository so no stale analysis can carry over.

**설명**

완전한 재탐색은 변경이 너무 광범위해서 이전 도구 결과 대부분이 무효화된 경우에 올바른 선택이지만, 여기서는 몇 개의 파일만 변경되었고 대부분의 분석은 여전히 유효하다. 세션을 폐기하는 것은 목표를 정한 재읽기가 훨씬 저렴하게 해결할 문제를 고치기 위해 전체 분석 비용을 다시 지불하는 것이다.

### 전반적인 설명

여기서 가져야 할 사고 모델은 세션이 작업공간의 스냅샷이 아니라 대화 기록이라는 것이다. 디스크에 기록되고 재개 시 복원되는 것은 대화다. 프롬프트, 모든 도구 호출, 모든 도구 결과, 모델의 응답들이다. Agent SDK 세션 문서는 이를 직접적으로 명시하며, 세션은 파일시스템이 아니라 대화를 지속시킨다고 경고한다. 따라서 재개는 롤백도 새로고침도 아니며, 정확한 메시지 이력을 다시 불러와 에이전트가 이전의 전체 컨텍스트를 가지고 이어갈 수 있게 하는 것이다.

이 설계가 재개를 가치 있게 만드는 이유는 비용이 큰 분석을 다시 할 필요가 없기 때문이지만, 동시에 오래된 정보로 인한 위험도 만들어낸다. 어제의 Read와 Grep 결과는 기록 안의 평범한 메시지일 뿐이며, 재개된 세션 안에는 그것들을 현재 저장소와 비교하는 아무 장치도 없다. Claude에게는 어제 읽은 파일이 방금 읽은 파일과 똑같이 권위 있는 것으로 보이므로, 더 이상 존재하지 않는 함수에 대해서도 자신 있게 코멘트를 남길 것이다.

따라서 오래된 정보 관리는 호출자의 몫이며, 올바른 도구는 얼마나 많이 달라졌는지에 따라 달라진다. 여기처럼 변경이 제한적일 때는 세션을 재개하고 정확히 어떤 파일이 변경되었는지 알려주어, 이전 발견을 신뢰하기 전에 그 파일들을 다시 읽도록 지시한다. 이는 무효한 증거만 정밀하게 교체하면서 나머지 분석은 그대로 유지한다. 변경이 너무 광범위해서 이전 도구 결과 대부분이 무효화된 경우에는, 대신 이전 결론을 구조화된 요약으로 준비해 새 세션을 시작한다. 아무 조치 없이 재개하는 것은 존재하지 않는 자동 조정을 가정하는 것이고, 완전히 재시작하는 것은 대부분 유효한 분석을 낭비하는 것이며, 압축은 오래된 증거를 교정하지 않고 단순히 압축할 뿐이다.


## 질문 7

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A CI pipeline delegates test-suite execution to a subagent while the coordinator continues the review. Which design decisions correctly account for the subagent's context behavior? (Choose two.)

**A(정답).** Put conventions the subagent must always follow into the project CLAUDE.md, which custom subagents load at startup.

**설명**

이것이 정답이다. 새로 시작하는 서브에이전트 컨텍스트는 비어 있지 않다. 커스텀 서브에이전트는 자신의 시스템 프롬프트, 도구 정의, 위임 프롬프트와 함께 CLAUDE.md 계층 구조를 로드하므로, 그 안에 담긴 프로젝트 전반의 규칙은 서브에이전트에게 전달된다. 내장된 Explore와 Plan 에이전트만이 CLAUDE.md를 건너뛴다.

**B.** Keep review instructions only in the main conversation's system prompt, expecting them to carry over to the subagent.

**설명**

이는 틀린 답이다. 서브에이전트는 부모의 전체 시스템 프롬프트가 아니라 자신만의 시스템 프롬프트와 환경 정보를 가지고 실행된다. 서브에이전트에게 반드시 전달되어야 하는 지시사항은 그 자신의 정의나 위임 프롬프트의 일부여야 한다.

**C(정답).** Have the subagent execute the tests within its own context and return only its final message to the parent conversation.

**설명**

이것이 정답이다. 서브에이전트의 중간 도구 호출과 결과는 자신의 컨텍스트 윈도우 안에 남으며, 부모는 도구 결과로서 최종 메시지만 받는다. 이런 방식으로 핸드오프를 설계하면 방대한 출력이 코디네이터의 컨텍스트에 쌓이는 것을 막을 수 있다.

**D.** Omit earlier tool results from the delegation prompt, since the subagent automatically sees them within the same session.

**설명**

이는 틀린 답이다. 포크되지 않은 서브에이전트는 이전 도구 결과를 포함한 부모의 대화 이력 없이 시작한다. 이전 작업에서 서브에이전트가 필요로 하는 것은 무엇이든 위임 프롬프트에 명시적으로 전달되어야 한다.

### 전반적인 설명

서브에이전트에 대한 사고 모델은 명시적인 핸드오프 채널을 갖춘 컨텍스트 격리다. 포크되지 않은 서브에이전트는 새로운 대화를 시작한다. 부모의 메시지 이력, 이전 도구 결과, 부모의 시스템 프롬프트를 전혀 보지 못한다. 부모에서 서브에이전트로 가는 유일한 채널은 위임 프롬프트 문자열이며, 서브에이전트에서 부모로 가는 유일한 채널은 서브에이전트의 최종 메시지다. 그 사이에 있는 모든 것, 모든 Bash 호출, 모든 원시 테스트 로그는 서브에이전트 자신의 컨텍스트 윈도우 안에 봉인된 채로 남는다. 이 비대칭성이 바로 이 설계의 핵심이다. 테스트를 실행하거나 코드베이스를 탐색하는 서브에이전트가 수천 토큰의 소란스러운 출력을 소비하는 동안, 메인 리뷰 대화는 간결한 요약에 대해서만 비용을 지불하게 해준다.

동시에 "새롭다"는 것이 "비어 있다"는 것을 의미하지는 않는다. 커스텀 서브에이전트의 컨텍스트는 자신의 시스템 프롬프트, Claude가 위임할 때 작성하는 작업 프롬프트, 자신의 도구 정의, 프로젝트의 CLAUDE.md 계층 구조, 그리고 git status 스냅샷으로 구성된다. 내장된 Explore와 Plan 에이전트는 조사를 저렴하게 유지하기 위해 CLAUDE.md와 git status를 건너뛰는, 문서에 명시된 예외다. 따라서 서브에이전트는 현재 대화에 대해서는 아무것도 모르지만 프로젝트의 규칙은 알고 있다.

두 가지 틀린 설계 결정은 각각 다른 방향으로 이 모델을 깨뜨린다. 세션 수준에서 도구 결과가 공유된다고 의존하는 것은 각 서브에이전트가 별개의 에이전트 인스턴스라는 점을 무시하는 것이고, 부모의 시스템 프롬프트가 전달될 것이라고 기대하는 것은 서브에이전트 자신의 맞춤 프롬프트와 코디네이터의 프롬프트를 혼동하는 것이다. CI 파이프라인에서는 이것이 실질적으로 중요하다. 서브에이전트가 반드시 지켜야 할 리뷰 관련 규칙은 그 자신의 정의에 있거나 위임 프롬프트에 다시 명시되어야 한다. SDK의 서브에이전트 문서와 커스텀 서브에이전트 만들기 문서를 참고하라.


## 질문 8

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A session has completed a thorough baseline analysis of a large pull request. The team wants to evaluate two competing review-prompt strategies from that identical baseline, with neither evaluation influencing the other. What should they do?

**A.** Create a separate git worktree for each strategy so the two evaluations run against fully isolated file trees that cannot interfere.

**설명**

워크트리는 파일시스템 상태를 격리할 뿐 대화 상태를 격리하지 않는다. 세션은 축적된 대화 이력이며, 워크트리에서 시작된 새 세션은 기준 분석에 대한 기억이 전혀 없이 시작되므로, 이 접근법은 잘못된 격리 문제를 해결하는 것이다.

**B.** Resume the analysis session sequentially for both strategies, instructing Claude to disregard the first evaluation before beginning the second one.

**설명**

같은 세션을 순차적으로 재개하면 두 평가가 하나의 공유 이력 안에 축적된다. 프롬프트 지시로는 모델이 이전 컨텍스트를 선택적으로 잊게 만들 수 없으므로, 두 번째 평가는 여전히 첫 번째 평가의 영향을 받는다.

**C(정답).** Resume the analysis session once per strategy with fork_session enabled, giving each evaluation its own copy of the baseline history.

**설명**

정답이다. 재개 시 포크를 사용하면 원본 이력의 복사본에서 시작하고 자체 세션 ID를 부여받는 새 세션이 생성되며, 원본은 변경되지 않은 채 남는다. 그러면 각 전략은 동일한 기준선에서 독립적으로 발전하며, 상호 오염도 없고 분석을 다시 할 필요도 없다.

**D.** Start a fresh headless run for each strategy, seeding each prompt with a manually written summary of the baseline analysis findings.

**설명**

수동으로 작성한 요약은 기준선에 대한 손실이 있는 근사치다. 전체 분석의 세부사항은 필연적으로 빠지게 되고, 두 실행이 약간 다른 틀로 서술될 수도 있다. 포크는 분석 비용을 다시 지불하지 않고도 완전히 동일한 이력을 두 분기 모두에 전달한다.

### 전반적인 설명

Claude Agent SDK에서 세션은 축적된 대화 이력이다. 즉, 모델이 작업에 대해 실무적으로 알고 있는 지식을 형성하는 프롬프트, 도구 호출, 도구 결과, 응답들이다. 세션을 재개하면 정확히 그 이력만 복원되며, 그 이상은 아니다. 파일시스템을 스냅샷하거나 복원하지 않는다. 가져야 할 사고 모델은 세션이 에이전트의 기억이고, 저장소는 별개의 관심사라는 것이다.

fork_session 옵션은 정확히 "다른 접근법을 시도해보기" 워크플로우를 위해 존재한다. 포크를 활성화한 채로 재개하면, SDK는 원본 이력의 복사본에서 시작하고 자체 세션 ID를 부여받는 새 세션을 생성하며, 원본 세션은 그대로 유지된다. 전략마다 이 작업을 반복하면 동일한 기준선을 공유하지만 이후에는 자유롭게 갈라지는 독립적인 분기들이 생긴다. 이것이 포크가 만들어내려는 트레이드오프다. 비용이 큰 분석을 복제하는 데 아무 비용도 들지 않으며, 그 대가로 각 분기의 이후 컨텍스트는 형제 분기들로부터 완전히 격리된다.

대안들은 각각 이 모델의 일부를 놓친다. 같은 세션을 두 번 순차적으로 재개하면 두 평가가 하나의 이력에 담기게 되며, 어떤 프롬프트 지시로도 모델이 이미 주어진 컨텍스트를 선택적으로 잊게 만들 수 없다. 수동 요약으로 새 실행을 준비하는 것은 가능하지만 손실이 있다. 요약은 기준선에 대한 근사치이며, 두 번 작성되므로 두 분기가 동일하게 시작한다는 보장이 없다. Git 워크트리는 CI에서 실제로 존재하는 문제인 동시 파일 접근 문제를 해결하지만, 파일 트리를 격리할 뿐 대화를 격리하지 않으므로 어느 평가에도 분석을 전달하지 못한다.

세션, 재개, 포크가 어떻게 동작하는지에 대한 자세한 내용은 Agent SDK 세션 문서를 참고하라.


## 질문 9

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Yesterday a developer named a Claude Code session ci-timeout-probe while investigating intermittent test timeouts in the pipeline. Since then, several other sessions have run in the same repository. What should the developer run today to pick that investigation back up?

**A.** Run claude --continue so Claude Code reopens the most recent session in the current directory.

**설명**

--continue 플래그는 현재 디렉터리에서 가장 최근의 대화형 세션만 다시 연다. 그 조사 이후 이 저장소에서 다른 세션들이 실행되었으므로, --continue는 그 관련 없는 대화들 중 하나를 대신 다시 열게 된다.

**B(정답).** Run claude --resume ci-timeout-probe, which restores that session's conversation context.

**설명**

--resume에 세션 이름을 전달하면 그 특정 저장된 대화가 계속 이어지며, 조사가 이미 발견한 모든 내용이 복원된다. 세션이 최근성이 아니라 이름으로 식별되므로, 그 이후 얼마나 많은 다른 세션이 실행되었는지와 무관하게 동작한다.

**C.** Run claude -p "continue the timeout investigation" to relaunch the work in non-interactive mode.

**설명**

-p 플래그는 이전 세션에 대한 기억이 전혀 없는 일회성 비대화형 실행을 시작한다. 프롬프트 텍스트는 Claude에게 계속하라고 요청하지만, 어제 대화에서 나온 어떤 것도 이용할 수 없으므로 조사는 처음부터 다시 시작하게 된다.

**D.** Run claude -n ci-timeout-probe so a session under that name loads the investigation's prior context.

**설명**

-n (또는 --name) 플래그는 시작 시 새 세션에 이름을 부여할 뿐, 기존 세션을 찾아 복원하지 않는다. 이름을 재사용하면 이전 조사의 컨텍스트가 전혀 없는 새로운 대화가 시작된다.

### 전반적인 설명

Claude Code는 각 세션을 프로젝트 디렉터리에 연결된 저장된 대화로 로컬에 저장하며, 이것이 여러 날에 걸친 조사를 실용적으로 만드는 이유다. 한 작업 세션에서 축적된 추론, 도구 결과, 가설을 다음 날 다시 만들 필요가 없다. 사고 모델은 세션이 주소 지정이 가능한 아티팩트라는 것이며, CLI는 그 안으로 다시 들어가는 두 가지 서로 다른 방법을 제공한다. claude --continue는 최근성 기반의 단축키다. 현재 디렉터리에서 가장 최근에 실행된 대화형 세션이 무엇이든 다시 연다. claude --resume <name>은 신원 기반 조회다. 이름(또는 -r 축약형과 함께 ID)으로 특정 세션을 지정하며, 인자 없이 claude --resume을 실행하면 대화형 선택 화면이 열린다.

이 구분은 정확히 이런 상황에서 중요해진다. 어제 이후 다른 것이 아무것도 실행되지 않았다면 --continue가 우연히 올바른 대화에 도달했을 것이다. 하지만 다른 세션들이 개입하면 최근성과 신원이 갈라지고, 이름 기반 조회만이 신뢰할 수 있다. 이것이 며칠에 걸칠 것으로 예상되는 조사에 대해 세션에 미리 이름을 붙이는 것이 습관으로 들일 만한 이유다. 이름은 시작 시 claude -n <name>으로, 세션 진행 중에는 /rename으로, 또는 세션 선택 화면에서 지정할 수 있다. -n은 새 세션에 이름을 부여할 뿐 재개 메커니즘이 아니라는 점에 주의해야 한다. 바로 이 때문에 이것이 유혹적이지만 틀린 답이 된다.

마찬가지로 claude -p는 완전히 다른 목적을 위해 존재한다. 파이프라인에 적합한 헤드리스 일회성 실행으로, 프로세스가 프롬프트를 읽고 결과를 출력한 뒤 세션의 연속성 없이 종료된다. Claude에게 조사를 "계속하라"고 요청하는 프롬프트는 실제로 대화 상태를 복원하는 것을 대체할 수 없다. 세션 관리 명령의 전체 목록은 공식 Claude Code 세션 문서를 참고하라.


## 질문 10

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A team captured session IDs from two Claude Code runs: one analyzed service architecture in a codebase untouched since, and one audited a module whose files were later rewritten. Which session strategy fits each follow-up?

**A(정답).** Resume the architecture session as-is; start a fresh session seeded with a summary of the audit findings for the rewritten module.

**설명**

이는 문서화된 의사결정 규칙을 올바르게 적용한 것이다. 아키텍처 세션의 컨텍스트는 아무것도 변경되지 않았기 때문에 여전히 유효하며, 재개하면 원래 조사를 다시 실행하지 않고 완료된 분석을 재사용할 수 있다. 반면 감사 세션의 도구 결과는 현재 모듈과 더 이상 일치하지 않는 파일 내용을 서술하고 있으므로, 그 유용한 결론은 요약으로 포착하여 현재 코드를 다시 읽는 새 세션에 주입해야 한다.

**B.** Start fresh sessions for both follow-ups, injecting summaries, since prior tool results cannot be trusted once any time has passed.

**설명**

이는 완전히 안전한 재개를 버리기 때문에 틀린 답이다. 아키텍처 코드베이스는 손대지 않았으므로 이전 컨텍스트는 여전히 유효하며, 이를 손실이 있는 요약으로 대체하면 세부사항이 버려지고 신뢰성 향상 없이 에이전트가 같은 발견을 다시 찾아내도록 강제하게 된다.

**C.** Resume the audit session so its detailed file reads carry over; start a fresh session with a summary for the architecture follow-up.

**설명**

이는 두 가지 측면 모두에서 의사결정 규칙을 반대로 적용한 것이다. 감사 세션의 상세한 파일 읽기 결과는 모듈이 재작성되면서 정확히 오래된 정보가 되어버린 것이며, 아키텍처 세션이야말로 컨텍스트가 여전히 정확하고 재개할 가치가 있는 쪽이다.

**D.** Resume both sessions, since restoring the full conversation history gives each follow-up complete access to what the prior run discovered.

**설명**

이는 감사 후속 작업에 대해서는 틀린 답이다. 재개는 기록된 그대로 대화 기록을 복원하며, 이제는 재작성된 코드를 서술하는 파일 읽기 결과도 포함된다. 그 오래된 증거를 다시 검증하는 아무 장치도 없으므로, 에이전트는 더 이상 모듈과 일치하지 않는 내용을 근거로 추론하게 된다.

### 전반적인 설명

이 결정의 기저에 있는 사고 모델은 Claude Code나 Agent SDK 세션이 실시간 상태가 아니라 지속된 대화 이력이라는 것이다. 세션은 프롬프트, 모든 도구 호출, 모든 도구 결과, 모든 응답을 저장한다. 세션 ID로 재개하면 그 대화 기록이 복원되어 에이전트가 멈췄던 지점에서 전체 컨텍스트를 가지고 이어갈 수 있다. 파일시스템을 스냅샷하거나, 이전 도구를 다시 실행하거나, 이전에 읽은 내용을 다시 검증하지 않는다. 그래서 재개의 안전성은 전적으로 기록된 증거가 여전히 현실을 서술하고 있는지에 좌우된다.

아키텍처 후속 작업의 경우, 코드베이스에서 아무것도 변경되지 않았으므로 대화 기록 안의 모든 파일 읽기 결과와 결론은 여전히 정확하다. 재개는 완료된 분석을 다시 찾아내는 대신 재사용하기 때문에 올바른 선택이다. 재작성된 모듈의 경우, 대화 기록은 이제 현재 코드와 더 이상 일치하지 않는 내용을 자신 있게 서술하는 내용으로 가득 차 있다. 이 경우에 대해 문서화된 패턴은 그 실행에서 실제로 중요했던 것, 즉 발견 사항과 결정들을 애플리케이션 상태로 포착하여 새 세션의 프롬프트에 전달하고, 에이전트가 권위 있는 소스를 다시 조회하도록(여기서는 현재 파일을 다시 읽도록) 하는 것이다. Anthropic의 세션 문서는 이러한 새 세션 방식이 대화 기록의 연속성에 의존하는 것보다 흔히 더 견고하다고 언급한다.

일괄적인 전략들은 서로 반대 방향으로 실패한다. 모든 것을 재개하면 오래된 증거를 그대로 들여오게 되고, 모든 것을 요약과 함께 재시작하면 이전 컨텍스트가 여전히 유효한 경우에 손실이 있고 낭비가 된다. 반전된 조합은 오래된 컨텍스트만 정확히 유지하고 살아남은 컨텍스트만 정확히 버리는 것이다. 압축이나 긴 컨텍스트 관리도 오래된 재개를 구제하지 못한다는 점도 주목할 만하다. 컨텍스트 윈도우는 이력과 도구 출력을 교정 없이 축적할 뿐이므로, 정확성 문제는 압축이 아니라 아키텍처적으로 해결해야 한다. 세션 이력과 컨텍스트 축적이 어떻게 동작하는지에 대해서는 Agent SDK 세션 문서와 에이전트 루프 문서를 참고하라.


## 질문 11

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : During pipeline runs, Claude occasionally posts pull request feedback through the post_review_comment tool before executing the run_tests tool, despite system prompt instructions requiring tests first. Which design guarantees the required ordering?

**A(정답).** Add a PreToolUse hook that denies post_review_comment calls until a successful run_tests result has been recorded in the session.

**설명**

PreToolUse 훅은 실행되기 전에 코드 안에서 나가는 도구 호출을 가로채므로, 선행 테스트 실행이 완료되기 전에는 리뷰 코멘트를 절대 게시할 수 없다. 이는 프로그램적인 강제이며, 프롬프트 기반 접근법으로는 제공할 수 없는 결정론적 보장을 제공한다.

**B.** State the prerequisite in the post_review_comment tool description so Claude sees the required order whenever it considers the call.

**설명**

도구 설명은 모델이 호출을 선택하고 구성하는 방식에 영향을 주지만, 여전히 모델이 따르지 않을 수도 있는 가이드로 남는다. 시스템 프롬프트 지시와 마찬가지로, 이는 신뢰도를 높여줄 뿐 순서가 강제된다는 보장은 해주지 못한다.

**C.** Move the ordering requirement to the top of the system prompt and mark it IMPORTANT so it takes priority over other instructions.

**설명**

시스템 프롬프트 지시는 확률적인 준수만 제공한다. 규칙의 중요도를 높이면 가능성은 개선되지만 실패율이 0이 되지는 않는다. 시나리오는 지시가 있음에도 순서가 이미 건너뛰어지고 있음을 보여주므로, 더 강한 어조의 프롬프트로는 그 간극을 메울 수 없다.

**D.** Scan Claude's text output for a statement that tests passed and only permit the review comment once that confirmation appears.

**설명**

완료나 상태 신호를 찾기 위해 어시스턴트의 자연어를 파싱하는 것은 문서화된 안티 패턴이다. 모델은 확인 문구를 다르게 표현할 수도 있고, 테스트가 실행되지 않았는데도 실행되었다고 주장할 수도 있고, 그 문구를 완전히 생략할 수도 있으므로, 이 검사는 강제 게이트로서 신뢰할 수 없다.

### 전반적인 설명

이 문제는 워크플로우 순서에 대한 프로그램적 강제와 프롬프트 가이드 사이의 핵심적인 구분을 테스트한다. 특정 도구 순서가 요구되고 이를 건너뛰는 것이 실제 결과를 초래할 때(여기서는 테스트 결과에 대해 검증된 적 없는 리뷰 피드백을 게시하는 것), 올바른 사고 모델은 지시사항은 모델이 보통 따르는 제안이고, 훅은 모델이 회피할 수 없는 코드라는 것이다. PreToolUse 훅은 도구 호출이 실행되기 전에 실행되며 호출을 거부할 수 있고, 그 이유를 Claude에게 되돌려주어 선행 단계를 실행하고 재시도하도록 한다. 게이트가 모델의 컨텍스트가 아니라 하네스에 존재하기 때문에, 준수율은 확률이 아니라 구조적으로 100%가 된다.

이 설계 트레이드오프는 내면화할 가치가 있다. 프롬프트와 도구 설명은 선호도, 스타일, 미묘한 판단을 위한 올바른 표면이다. 모델의 유연성을 보존해주기 때문이다. 훅은 불변 조건, 즉 전제조건, 준수 규칙, 단 한 번의 위반도 허용될 수 없는 순서 제약을 위한 올바른 표면이다. 시스템 프롬프트를 강화하거나 도구 설명을 풍부하게 만드는 것은 둘 다 그 경계선의 확률적인 쪽에서 작동하며, 바로 그곳에서 이미 실패가 발생했다. 어시스턴트의 텍스트에서 "테스트가 통과했다"와 같은 문구를 스캔하는 것은 별개의 안티 패턴이다. 이는 강제를 모델이 자신의 출력을 어떻게 표현했는지에 의존하게 만들며, 실제 테스트 실행과 단순히 주장된 실행을 구분할 수 없다. 검사가 신뢰할 수 있어야 한다면, 코드로 검증된, 기록된 run_tests 도구 결과에 근거해야 한다.

PreToolUse 훅이 도구 호출을 가로채고 차단하는 방식에 대해서는 Claude Code 훅 레퍼런스와 훅 가이드를 참고하라.


## 질문 12

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline's main agent gathers the pull request diff, then delegates to a security-review subagent with the prompt "Assess the security implications of these changes." The subagent returns generic findings that reference no actual code. What should you change?

**A.** Rewrite the subagent's system prompt with deeper security-specific expertise so it grounds its analysis in the changed code.

**설명**

전문화된 시스템 프롬프트는 분석의 품질을 높여주지만, 보안 전문성을 얼마나 더한다고 해도 서브에이전트가 전달받지 못한 diff를 분석할 수 있게 해주지는 못한다. 이 실패는 지식의 부족이 아니라 입력의 부재다.

**B.** Add Read and Grep to the subagent's allowed tools so it can retrieve the diff from the parent's conversation history.

**설명**

도구 접근으로는 이 문제를 해결할 수 없다. 서브에이전트 컨텍스트는 격리되어 있기 때문에 부모의 대화 이력을 읽을 수 있는 도구는 존재하지 않는다. Read와 Grep이 있어도, 프롬프트에 diff나 파일 경로가 없으면 서브에이전트는 어떤 변경사항을 봐야 하는지 알 수 없다.

**C(정답).** Pass the pull request diff and relevant file paths directly in the Agent tool prompt for the security-review subagent.

**설명**

이것이 정답이다. 포크되지 않은 서브에이전트는 부모의 대화 이력을 물려받지 않는다. 컨텍스트는 새롭게 시작하며, 부모가 전달하는 유일한 내용은 Agent 도구 호출 안의 프롬프트 문자열이다. "이 변경사항들"이라는 문구는 서브에이전트가 한 번도 본 적 없는 diff를 가리키므로, 위임 프롬프트에 diff를 포함시키는 것이 해결책이다.

**D.** Restructure the delegation prompt as a step-by-step review checklist that forces the subagent to cite specific code.

**설명**

프롬프트에 절차적인 구조를 더하는 것으로는 비어 있는 입력을 고칠 수 없다. 체크리스트가 얼마나 상세하든, 서브에이전트는 전달받은 적 없는 특정 코드를 인용할 수 없다.

### 전반적인 설명

여기서 가져야 할 사고 모델은 컨텍스트 격리다. 코디네이터가 Agent 도구(일부 목록이나 이전 SDK 버전에서는 Task로 표시됨)를 통해 서브에이전트를 생성하면, 그 서브에이전트는 새로운 컨텍스트 윈도우로 시작한다. 부모의 대화 이력, 도구 결과, 중간 발견 사항을 물려받지 않는다. 부모에서 자식으로 가는 유일한 채널은 도구 호출 자체에 담긴 프롬프트 문자열이다. 따라서 "이 변경사항들을 평가하라"고 말하는 위임 프롬프트는 서브에이전트가 문자 그대로 한 번도 본 적 없는 자료를 가리키게 되며, 모델은 그 공백을 그럴듯하지만 근거 없는 일반론으로 메운다.

이 격리는 결함이 아니라 의도적인 설계 트레이드오프다. 각 서브에이전트의 컨텍스트를 분리해두는 것이 리서치나 리뷰 서브에이전트가 메인 대화를 오염시키지 않으면서 방대한 탐색을 소비할 수 있게 해주며, 병렬 서브에이전트 실행을 안전하게 만들어준다. 그 격리의 대가는 명시적인 핸드오프 규율이다. 코디네이터는 diff, 관련 파일 경로, 이전 발견 사항, 작업 제약을 서브에이전트를 위해 작성하는 프롬프트에 직접 포함시켜야 한다.

오답들은 모두 비어 있는 입력이 아닌 다른 것에 작용한다. 더 날카로운 보안 시스템 프롬프트는 아무것도 없는 상태 위에 전문성만 높일 뿐이다. Read와 Grep을 부여하는 것은 도움이 되지 않는다. 어떤 도구도 부모의 대화에 접근할 수 없고, 서브에이전트는 어떤 파일이 변경되었는지조차 알지 못하기 때문이다. 프롬프트를 체크리스트로 재구성하는 것은 누락된 데이터를 추가하지 않고 절차만 더할 뿐이다. 이 CI 파이프라인에서 올바른 해결책은 diff(또는 그것에 대한 정확한 참조)를 위임 프롬프트 자체에 포함시키는 것이다.

서브에이전트의 컨텍스트 윈도우가 어떻게 동작하며 부모에서 서브에이전트로 어떤 내용이 전달되는지에 대해서는 SDK의 서브에이전트 문서를 참고하라.


## 질문 13

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The team is deciding how to decompose several automated jobs in the pipeline. Which two actions correctly apply a fixed prompt-chaining decomposition rather than dynamic adaptive decomposition? (Choose two.)

**A(정답).** Use fixed prompt chaining for a nightly documentation audit that follows a set sequence: extract public APIs, compare against published docs, list mismatches.

**설명**

이 감사의 모든 단계는 사전에 알려져 있고 중간 발견 사항에 따라 바뀌지 않으므로, 고정된 순차 파이프라인이 안정성과 재현성을 제공한다. 동적 분해는 불확실성이 전혀 없는 작업에 적응성 오버헤드를 더할 뿐이다.

**B.** Use fixed prompt chaining for investigating an unexplained coverage regression whose scope and relevant modules only become clear as evidence accumulates.

**설명**

범위가 사전에 알려지지 않고 중간 결과로부터 드러나기 때문에, 이 작업은 에이전트가 학습하는 과정에서 동적으로 하위 작업을 생성할 것을 요구한다. 여기서 고정된 파이프라인에 고정시키면 조사가 아무것도 발견되기 전에 선택된 단계들에 갇히게 된다.

**C.** Use fixed prompt chaining for diagnosing an intermittent build failure where each finding determines which logs, configs, or files to examine next.

**설명**

이는 다음 단계가 이전 단계가 드러낸 것에 좌우되는 개방형 조사이며, 이것이 동적 적응형 분해가 다루어야 할 전형적인 경우다. 증거가 존재하기 전에 작성된 고정된 스크립트는 관련 없는 단계를 자주 실행하거나 실제 원인을 놓치게 된다.

**D(정답).** Use fixed prompt chaining for a pull request review that always checks the same aspects, running per-file passes followed by a cross-file integration pass.

**설명**

이 워크플로우는 작업이 시작되기 전부터 알려진, 예측 가능하고 반복되는 구조를 가지고 있으며, 이는 정확히 고정된 프롬프트 체이닝이 설계된 목적이다. 파일별 패스 다음에 통합 패스를 두는 방식은 모든 PR에서 일관된 깊이와 재현 가능한 결과를 제공한다.

### 전반적인 설명

작업 분해에 대한 의사결정 규칙은 하나의 질문에 좌우된다. 작업이 시작되기 전에 전체 단계 순서를 알 수 있는가? 프롬프트 체이닝(고정된 순차 파이프라인)은 항상 동일한 측면을 평가하는 코드 리뷰나, 항상 추출-비교-보고를 실행하는 감사처럼 구조가 예측 가능하게 반복되는 워크플로우에 적합하다. 단계를 고정하면 재현성을 얻는다. 모든 실행이 같은 경로를 따르고, 결과는 PR 간에 비교 가능하며, 각 단계는 개별적으로 회귀 테스트하고 개선할 수 있다. 같은 작업이 수백 번 실행되는 CI에서는 그 결정론적 특성이 바로 원하는 것이다.

동적 적응형 분해는 정반대의 특성을 위해 존재한다. 각 발견이 다음에 할 일을 다시 정하는 개방형 조사다. 간헐적인 빌드 실패나 원인 불명의 커버리지 회귀는 사전에 스크립트로 작성할 수 없다. 관련 로그, 설정, 모듈은 조사 중간에야 발견되기 때문이다. 그런 작업을 고정된 파이프라인으로 강제하면, 모든 우발적 상황을 미리 나열하려는 끝없이 커지는 스크립트가 되거나, 증거가 존재하기 전에 작성된 단계를 따르는 조사가 되어버린다. 아키텍트가 가져야 할 사고 모델은 구조의 예측 가능성이 패턴을 결정한다는 것이다. 예측 가능한 다측면 작업에는 고정 파이프라인을, 경로가 중간 결과로부터 드러나는 경우에는 적응형 계획을 사용한다.

고정 파이프라인 패턴에 대해서는 Anthropic의 프롬프트 체이닝 가이드와, 효과적인 에이전트 구축하기에서 다루는 워크플로우 대 에이전트 패턴에 대한 더 넓은 논의를 참고하라.


## 질문 14

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A CI pipeline needs two automated checks: a lint and type-check gate that must run after every file edit, and an assessment of whether each pull request summary is misleading. Which two implementation choices fit these needs?

**A(정답).** Enforce the lint and type-check gate with a PostToolUse command hook that runs the checks as a shell command after each edit.

**설명**

커맨드 훅은 고정된 생명주기 지점에서 코드를 결정론적으로 실행하므로, 모델이 무엇을 결정하든 관계없이 일치하는 모든 이벤트마다 게이트가 발동한다. PostToolUse는 도구 호출이 성공한 후에 발동하므로, 방금 수정된 파일에 대해 린트와 타입 체크를 수행할 올바른 지점이다.

**B(정답).** Run the misleading-summary assessment as a separate model evaluation step in the pipeline, since the check requires judgment.

**설명**

요약이 오해를 불러일으키는지 여부는 결정론적인 코드 검사로 표현할 수 없으며, 언어 수준의 판단이 필요하다. 파이프라인에서의 전용 모델 호출은 그 판단을 적용하면서 결정론적인 게이트는 훅 코드에 맡긴다.

**C.** Implement the misleading-summary assessment as a command hook that pattern-matches the summary text against flagged phrases.

**설명**

오해를 불러일으키는지 여부는 문자열이나 패턴 매칭으로 포착할 수 없는 의미론적 속성이다. 요약은 표시된 문구를 전혀 포함하지 않으면서도 완전히 오해를 불러일으킬 수 있다. 커맨드 훅은 기계적이고 코드로 표현 가능한 규칙을 위한 올바른 도구이며, 언어적 판단이 필요한 검사에는 적합하지 않다.

**D.** State both rules prominently in CLAUDE.md with emphasis markers so they load into context and shape every pipeline run.

**설명**

CLAUDE.md의 내용은 모델이 확률적으로 따르는 가이드이며, 코드로 실행되는 강제가 아니다. 강조는 다른 지시사항에 대한 상대적인 우선순위만 높일 뿐, 게이트가 실행된다는 것을 보장할 수 없으며, 이는 항상 실행되어야 하는 규칙에는 용납될 수 없다.

### 전반적인 설명

여기서 핵심적인 설계 질문은 각 요구사항을 올바른 강제 수단에 매칭시키는 것이다. Claude Code 훅은 고정된 생명주기 지점에서 실행되며 결정론적인 제어를 제공한다. 핸들러는 모델이 준수하기로 선택했기 때문이 아니라 이벤트가 발동했기 때문에 실행된다. 반대로 CLAUDE.md나 시스템 프롬프트의 지시사항은 모델이 높지만 절대 보장되지는 않는 확률로 따르는 가이드다. 규칙이 매번 실행되어야 할 때, 특히 아무도 건너뛴 검사를 알아채지 못하는 무인 CI 파이프라인에서는, 그것은 문장이 아니라 훅에 속해야 한다.

커맨드 훅은 설정된 이벤트에서 셸 명령을 실행하므로, 린터와 타입 체커를 실행하는 것과 같은 기계적이고 코드로 표현 가능한 규칙에 자연스럽게 적합하다. PostToolUse는 도구 호출이 성공한 후 발동하므로, 게이트를 그 지점에 붙이면 매 수정 후에 검사가 실행됨을 보장한다. 오해를 불러일으키는 요약 요구사항은 종류가 다르다. 이는 문장이 diff를 공정하게 나타내는지에 대한 의미론적 판단을 요구하며, 어떤 셸 명령이나 패턴 매칭으로도 계산할 수 없다. 그 검사는 파이프라인 안의 별도 단계로 구현된 모델 기반 평가에 속해야 하며, 그곳에서 Claude 호출이 요약을 실제 변경사항과 견주어 평가할 수 있다.

사고 모델은 다음과 같다. 결정론적인 규칙은 훅이 실행하는 코드에 두고, 판단이 필요한 검사는 모델 평가 단계로 라우팅하며, CLAUDE.md는 간혹 준수되지 않아도 용인되는 규칙을 위해 남겨둔다. 훅 이벤트와 커맨드 핸들러 설정에 대해서는 Claude Code 훅 가이드와 훅 레퍼런스를 참고하라.


## 질문 15

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : You have two setup tasks: comparing two false-positive-reduction prompt strategies that must each build on a completed review-failure analysis, and independently reviewing test code Claude generated earlier. Which session design fits both tasks?

**A.** Start fresh instances for every task, seeding each with a manually written summary so no prior context carries into any of the work.

**설명**

새 인스턴스는 리뷰에는 올바른 선택이지만, 프롬프트 비교에서는 전체 분석 기준선을 두 번 작성된 손실 있는 수동 요약으로 대체하게 된다. 포크는 다시 준비하는 노력이나 정확도 손실 없이 완전한 분석을 두 분기 모두에 전달한다.

**B(정답).** Fork the analysis session into two branches for the prompt comparison, and open a fresh independent instance to review the generated test code.

**설명**

이는 각 작업을 올바른 메커니즘에 매칭시킨 것이다. 포크는 분석 기준선을 다시 구축하지 않고도 두 프롬프트 시도 모두에 완전한 기준선을 제공하며, 새 인스턴스는 생성자의 추론을 물려받지 않은 채 생성된 코드를 리뷰함으로써 자기 리뷰 편향을 피한다.

**C.** Fork the generator's session to perform the review, and start fresh instances seeded with the analysis summary for each prompt strategy.

**설명**

이는 각 메커니즘을 그것을 무력화하는 작업에 배정한 것이다. 생성자의 세션을 포크하는 것은 리뷰어에게 독립적인 리뷰를 훼손하는 바로 그 추론 컨텍스트를 주는 것이며, 새로 준비된 인스턴스는 프롬프트 시도에 완전히 물려받은 기준선 대신 저하된 요약을 준다.

**D.** Fork a session for each task, since forked branches give both the comparison and the review isolated contexts that cannot influence each other.

**설명**

포크는 리뷰 작업에는 잘못된 선택이다. 포크는 생성자의 추론을 포함해 분기 지점까지의 모든 것을 물려받기 때문이다. 그 물려받은 컨텍스트는 정확히 독립적인 리뷰가 갖지 말아야 하는 것이다. 자신의 추론에 고정된 모델은 그것을 반박할 가능성이 낮기 때문이다.

### 전반적인 설명

핵심 사고 모델은 포크가 무엇을 전달하는지에 있다. fork_session은 현재 컨텍스트를 독립적인 라인들로 분기시키며, 분기 지점까지의 모든 것은 공유하고 그 이후로는 아무것도 공유하지 않는다. 그 계승이 전체 가치 제안이며, 양날의 검이다. 리뷰어가 왜 거짓 양성을 만들어내는지에 대한 완료된 분석처럼 두 탐색이 동일한 비용이 큰 기준선에서 시작해야 할 때, 포크는 정확도 손실도 비용도 없이 두 분기 모두에 완전한 분석을 전달한 다음 깔끔하게 갈라지게 한다. 작업이 이전 컨텍스트를 보지 말아야 할 때는, 그 동일한 계승이 오염이 된다.

독립적인 리뷰는 두 번째 경우의 대표적인 사례다. 코드를 생성한 모델은 그 추론을 컨텍스트에 유지하고 있어 자신의 결정을 체계적으로 의심하지 않으려는 경향이 있다. 해결책은 코드가 어떻게 만들어졌는지에 대한 기억이 전혀 없는 두 번째 인스턴스다. 생성자의 세션을 포크하면 리뷰가 벗어나야 할 바로 그 추론을 그대로 옮겨오게 되므로, 그 경우 올바른 도구는 새로운, 차가운 인스턴스다.

전부 새로 시작하는 접근법은 정반대의 이유로 비교 작업에서 실패한다. 분석을 두 개의 새 세션으로 수동 요약하는 것은 손실이 있다(숫자, 경계 사례, 미묘한 뉘앙스가 서술형 요약에서 빠진다). 그리고 포크가 무료로 제공하는 준비 작업을 중복시킨다. 원칙은 다음과 같다. 분기들이 기준선을 공유해야 할 때는 포크하고, 기준선이 전혀 없는 것이 핵심일 때는 차갑게 시작한다. 세션이 재개되고 포크되는 방식에 대해서는 Claude Agent SDK의 세션 관리 문서를, 이전 대화를 계속하고 재개하는 방법에 대해서는 Claude Code 일반 워크플로우 문서를 참고하라.


## 질문 16

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : After many turns analyzing a pull request's diff, failing tests, and design tradeoffs, you want a subagent to draft the review comment with full awareness of that discussion, without copying it all into the delegation prompt. What works?

**A(정답).** Spawn the drafting subagent as a fork of the current conversation so it inherits the discussion up to the point of delegation.

**설명**

포크된 서브에이전트는 컨텍스트 격리에 대한 문서화된 예외다. 분기 지점까지의 부모 대화를 물려받은 다음 독립적으로 갈라진다. 이는 초안 작성 에이전트에게 분석을 위임 프롬프트로 다시 직렬화할 필요 없이 완전히 인지시켜준다.

**B.** Delegate with a brief prompt like 'draft the review from our analysis,' since a subagent running in the same session can read that session's history.

**설명**

일반적인, 포크되지 않은 서브에이전트는 새로운 컨텍스트 윈도우로 시작하며 부모로부터 위임 프롬프트 문자열만 받는다. 세션의 이전 턴에 접근할 수 없으므로, "우리의 분석"을 언급하는 프롬프트는 서브에이전트가 한 번도 본 적 없는 자료를 가리키게 된다.

**C.** Have the drafting subagent run claude --resume against the main session so it loads the transcript before writing the comment.

**설명**

재개는 이전 대화를 계속하기 위한 세션 수준의 메커니즘이며, 서브에이전트가 부모의 실시간 대화 기록을 읽기 위한 채널이 아니다. 서브에이전트는 이런 방식으로 코디네이팅 대화의 이력을 불러오는 자동적인 능력이 전혀 없다.

**D.** Run /compact just before delegating so the compacted summary of the analysis is automatically carried into the subagent's fresh context.

**설명**

압축은 메인 대화 자신의 컨텍스트를 요약할 뿐, 서브에이전트가 물려받는 것을 바꾸지 않는다. 압축 후에도 포크되지 않은 서브에이전트는 여전히 새롭게 시작하므로, 압축된 요약이 자동으로 전달되는 일은 없다.

### 전반적인 설명

서브에이전트에 대한 기본 계약은 컨텍스트 격리다. 포크되지 않은 서브에이전트는 자신의 시스템 프롬프트, 부모가 작성한 위임 프롬프트, CLAUDE.md 같은 시작 자료를 담은 새로운 컨텍스트 윈도우로 시작하지만, 부모의 대화 턴은 전혀 포함하지 않는다. 부모에서 자식으로 전달되는 유일한 내용은 Agent 도구의 프롬프트 문자열이다. 이 설계는 부모의 윈도우를 가볍게 유지하고 많은 서브에이전트가 병렬로 실행될 수 있게 해주지만, 이는 서브에이전트가 필요로 하는 이전 논의는 프롬프트에 직접 작성되어야 하거나, 문서화된 하나의 예외인 현재 대화의 포크를 통해 전달되어야 함을 의미한다. 포크는 분기 지점까지의 모든 것을 물려받은 다음 독립적으로 진화한다.

여기서 축적된 분석은 여러 턴에 걸쳐 있고 수동으로 복사하는 것은 제외되므로, 포크가 적합한 메커니즘이다. 초안 작성 서브에이전트는 전체 diff 분석, 테스트 실패, 트레이드오프 논의가 이미 컨텍스트에 포함된 채로 시작한다. 대안들은 모두 컨텍스트가 어디에 존재하는지를 잘못 이해하고 있다. "우리의 분석"을 언급하는 단순한 프롬프트는 서브에이전트가 그 분석을 본 적이 없기 때문에 실패한다. /compact는 부모의 컨텍스트를 재구성할 뿐 새로운 서브에이전트로 흘러들어가지 않는다. --resume은 저장된 세션을 다시 여는 것이지, 살아있는 부모의 대화 기록을 자식 에이전트로 흘려보내는 것이 아니다.

가져가야 할 사고 모델은 다음과 같다. 서브에이전트 컨텍스트는 기본적으로 명시적이며, 포크를 통해서만 계승된다. 서브에이전트의 컨텍스트 윈도우가 무엇을 담고 담지 않는지에 대해서는 SDK의 서브에이전트 문서와 커스텀 서브에이전트 만들기 문서를 참고하라.


## 질문 17

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Three parallel review subagents analyze each pull request, and a coordinator synthesizes one PR comment. The comment describes issues only vaguely, omitting file paths and line numbers that the subagents' tool calls clearly located. What should you change?

**A.** Raise the subagents' max turns limit so they have enough tool-use rounds to capture the precise locations before their runs end.

**설명**

로그는 서브에이전트가 이미 정확한 파일과 줄을 찾아냈음을 보여주므로 조사가 중간에 끊긴 것이 아니다. 세부사항은 발견 과정이 아니라 핸드오프 과정에서 손실되며, 도구 사용 라운드를 더 추가해도 부모에게 반환되는 내용은 바뀌지 않는다.

**B.** Grant the coordinator Read and Grep tools so it can open each subagent's transcript and extract the exact file and line details before writing the comment.

**설명**

서브에이전트의 중간 도구 호출과 결과는 오직 그 자신의 격리된 대화 안에만 존재하며, 코디네이터가 파일 도구로 읽을 수 있는 어떤 대화 기록에도 존재하지 않는다. 이 접근법은 또한 코디네이터가 조사를 다시 수행하도록 유도하여 위임의 목적을 무력화한다.

**C(정답).** Instruct each subagent to include file paths and line numbers in its final structured message, since only that message returns to the coordinator.

**설명**

서브에이전트의 최종 메시지만이 도구 결과로서 부모에게 반환되며, 모든 중간 Grep과 Read 출력은 서브에이전트 자신의 대화 안에 남는다. 그 최종 메시지에 구체적인 세부사항을 요구하는 것만이 코디네이터가 이를 PR 코멘트로 종합할 수 있는 유일한 방법이다.

**D.** Run the three subagents sequentially instead of in parallel so their full transcripts accumulate in the coordinator's context before synthesis begins.

**설명**

컨텍스트 격리는 스케줄링과 무관하다. 서브에이전트가 병렬로 실행되든 하나씩 실행되든, 그들의 중간 작업은 부모의 컨텍스트에 절대 축적되지 않는다. 순차적으로 만드는 것은 코디네이터가 받는 내용을 바꾸지 않고 지연 시간만 추가할 뿐이다.

### 전반적인 설명

이 실패는 Claude Agent SDK에서 서브에이전트 컨텍스트 격리가 작동하는 방식에서 비롯된다. 각 서브에이전트는 자신만의 대화를 가진 별개의 에이전트 인스턴스로 실행된다. 모든 Grep 매치, 파일 읽기, 중간 추론 단계는 그 대화 안에 남으며, 서브에이전트의 최종 메시지만이 Agent 도구 결과로서 부모에게 반환된다. 이 설계는 의도적인 것이다. 코디네이터가 각 하위 작업의 대화 기록을 자신의 컨텍스트 윈도우에 흡수하지 않으면서도 여러 방대한 조사를 병렬로 실행할 수 있게 해준다. 그 대가는 최종 메시지가 전체 핸드오프 채널이 된다는 것이다. 종합을 위해 코디네이터가 필요로 하는 것, 예를 들어 파일 경로, 줄 번호, 심각도, 근거 등은 반드시 그 메시지에 명시적으로 작성되어야 하며, 가급적 종합 단계가 소비할 수 있는 구조화된 형식이어야 한다.

다른 접근법들은 메커니즘을 잘못 이해하고 있다. 코디네이터에게 파일 도구를 주는 것은 세부사항을 복구할 수 없다. 서브에이전트의 대화 기록은 부모가 읽을 수 있는 아티팩트가 아니기 때문이다. 중간 결과는 서브에이전트의 격리된 대화 밖에는 아예 존재하지 않는다. 서브에이전트를 순차적으로 실행하는 것은 스케줄링을 바꿀 뿐 격리를 바꾸지 않는다. 어느 쪽이든 대화 기록은 부모에게 흘러가지 않기 때문이다. 도구 사용 턴 제한을 높이는 것은 이 시스템에 존재하지 않는 발견 문제를 다루는 것이다. 서브에이전트는 이미 위치를 찾아냈고, 손실은 자식과 부모 사이의 경계에서 발생한다.

멀티 에이전트 분해에 대한 일반적인 설계 규칙은 각 서브에이전트의 최종 메시지를 계약으로 취급하는 것이다. 서브에이전트의 지시사항에 출력이 정확히 무엇을 담아야 하는지 명시하면, 코디네이터는 간결한 병렬 발견 사항들로부터 정밀하고 실행 가능한 통합 결과를 종합할 수 있다. 결과가 부모에게 되돌아가는 방식에 대해서는 SDK의 서브에이전트 문서와 Agent SDK의 에이전트 루프 문서를 참고하라.


## 질문 18

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : During automated runs, Claude sometimes inlines a CI service token into the Bash commands it constructs, which are echoed into build logs. The commands are legitimate and must still execute. Which hook design satisfies both requirements?

**A(정답).** Register a PreToolUse hook on Bash calls that returns updatedInput, rewriting the command to remove the token while echoing back the unchanged fields.

**설명**

이는 차단이 아니라 정보를 제거하는 가드레일에 대해 문서화된 패턴이다. 훅이 나가는 호출을 가로채서 비밀 정보가 실행이나 로그에 절대 도달하지 않도록 입력을 재작성하며, 정당한 명령은 여전히 실행된다. updatedInput이 전체 입력 객체를 대체하므로, 훅은 변경하지 않는 필드도 반드시 그대로 되돌려줘야 한다.

**B.** Register a PostToolUse hook on Bash calls that strips the token from the returned output before the result is added to Claude's context.

**설명**

PostToolUse는 도구가 이미 실행된 후에만 발동하므로, 토큰을 포함한 명령은 이미 실행되었고 이미 빌드 로그에 나타났다. 이후에 결과를 정리하는 것은 Claude가 보는 내용을 정화할 뿐, 컴플라이언스 요구사항이 목표로 하는 노출 자체는 막지 못한다.

**C.** Register a PreToolUse hook on Bash calls that returns a deny decision with a reason whenever the token appears, prompting Claude to reissue the command.

**설명**

거부 결정은 토큰이 실행되지 않도록 막아주지만, 정당한 명령을 멈추게 하고 Claude가 이유를 읽고 토큰이 없는 버전을 올바르게 재발급할 것에 의존하는데, 이는 확률적이다. 시나리오는 명령 자체가 여전히 실행되어야 한다고 요구하는데, 이는 입력 재작성이 보장하지만 거부는 보장하지 못한다.

**D.** Add a rule to the project CLAUDE.md instructing Claude to reference the token only through an environment variable and never inline in Bash commands.

**설명**

CLAUDE.md의 내용은 모델이 보통 따르는 가이드일 뿐, 항상 실행되는 코드가 아니므로, 특히 무인 CI 실행에서는 인라인 토큰이 간혹 새어나갈 것이다. 모든 실행에서 지켜져야 하는 컴플라이언스 규칙은 결정론적 강제를 제공하는 훅에 속해야 한다.

### 전반적인 설명

훅은 프롬프트 지시로는 제공할 수 없는 결정론적 제어 지점을 에이전트 파이프라인에 제공하며, PreToolUse 이벤트는 도구 호출이 실행되기 전에 발동하기 때문에 강제의 기본 수단이 된다. PreToolUse 콜백은 tool_name과 tool_input을 포함한 실제로 생성된 요청을 받으며, 두 가지 서로 다른 방식으로 응답할 수 있다. permissionDecision을 "deny"로 반환하여 호출을 완전히 중단시키거나, updatedInput을 반환하여 호출을 재작성해 수정된 형태로 진행되게 하는 것이다. 올바른 선택은 정책에 따라 달라진다. 동작 자체가 금지된 경우에는 거부가 올바르며, 동작 자체는 정당하지만 통과해서는 안 되는 무언가(명령 문자열 안의 비밀 정보)를 담고 있는 경우에는 입력을 재작성하는 것이 적합하다. 이는 워크플로우를 보존하면서 규칙을 강제하기 때문이다. 여기서 중요한 운영상의 세부사항 하나는, updatedInput이 전체 입력 객체를 대체하므로 훅이 변경할 의도가 없는 모든 필드도 그대로 복사해서 전달해야 한다는 것이다.

다른 선택지들은 타이밍이나 보장의 측면에서 실패한다. PostToolUse는 도구 호출이 성공한 후에 실행되므로 결과를 정규화하거나 다듬는 데 유용하지만, 그때는 이미 명령이 실행되었고 토큰이 이미 로그에 기록된 상태다. 사후 정리로는 그 노출을 되돌릴 수 없다. 거부하고서 Claude가 토큰 없이 재시도하기를 바라는 것은 결정론적 요구사항을 확률적인 것으로 바꾸어버리며, 팀이 명시적으로 실행해야 하는 명령을 막아버린다. CLAUDE.md 가이드는 행동을 형성하지만 컨텍스트 안의 다른 모든 것과 경쟁한다. 무인 CI 실행에서는 모델이 간혹 무시하는 지시사항이 바로 훅이 존재하는 이유가 되는 실패 양상이다. 사고 모델은 다음과 같다. 프롬프트와 메모리 파일은 선호도를 표현하고, PreToolUse 훅은 규칙을 강제하며, PreToolUse 안에서도 deny는 동작을 멈추고 updatedInput은 그것을 정화한다. 훅 이벤트와 출력 형식에 대해서는 Agent SDK 훅 문서를 참고하라.


## 질문 19

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A teammate proposes that the security-scan and style-check subagents pass their findings directly to the report subagent instead of returning them to the coordinator. How should you respond to this proposal?

**A.** Accept the direct handoff, since removing the coordinator hop batches results into fewer requests, lowering token cost and shortening the pipeline's run time.

**설명**

중앙 라우팅은 비용이나 지연 시간 때문에 유지되거나 제거되는 것이 아니다. 각 서브에이전트는 여전히 자신만의 토큰 사용량을 가진 별개의 에이전트 인스턴스로 실행되며, 실제로 허브가 제공하는 것은 관찰 가능성과 통제다. 효율성을 중심으로 이 결정을 바라보는 것은 이 토폴로지가 존재하는 이유를 놓치는 것이다.

**B.** Reject the change because parallel execution requires every delegation to originate from one coordinator turn, so direct handoffs would force the scanners to run sequentially.

**설명**

코디네이터의 한 응답에서 여러 위임 호출을 내보내는 것이 병렬성을 달성하는 방법이지만, 이는 서브에이전트가 어떻게 생성되는지에 관한 것이며 이후에 결과가 어떻게 라우팅되는지와는 무관하다. 결과 라우팅은 스캐너가 동시에 실행되는지 여부를 결정하지 않는다.

**C.** Reject the change on the grounds that subagents run with isolated memory and only the coordinator can perform the serialization needed to move findings between them.

**설명**

서브에이전트가 격리된 컨텍스트를 갖는 것은 사실이지만, 코디네이터에게만 특별한 직렬화 능력이 있는 것은 아니다. 결과는 어느 경우든 프롬프트나 메시지 안의 텍스트로 전달된다. 허브를 통해 라우팅하는 진짜 이유는 관찰 가능성과 통제된 정보 흐름이며, 기술적인 직렬화 장벽 때문이 아니다.

**D(정답).** Keep routing all findings through the coordinator so every exchange stays observable, failures are handled in one place, and it decides what each downstream subagent receives.

**설명**

이것이 정답인 이유는 허브-스포크 라우팅이 정확히 이 세 가지 특성을 위해 권장되는 설계이기 때문이다. 코디네이터는 모든 에이전트 간 트래픽을 보고, 하나의 일관된 오류 처리 및 복구 정책을 적용하며, 각 서브에이전트에게 전달되는 정확한 컨텍스트를 선별한다. 기술적으로 가능하더라도 동료 간 직접 핸드오프는 감사 추적을 분산시키고 복구 로직을 여러 에이전트에 흩어놓는다.

### 전반적인 설명

Claude Agent SDK 위에 구축된 멀티 에이전트 시스템은 일반적으로 허브-스포크 토폴로지를 따른다. 코디네이터가 작업을 분해하고, Agent 도구를 통해 서브에이전트를 생성함으로써 작업을 위임하고, 결과를 집계한다. 모든 것을 허브를 통해 라우팅하는 것은 엄격한 기술적 제약이 아니라 의도적인 설계 선택이다. Claude Code는 실제로 SendMessage나 형제 로스터 같은 이름 있는 에이전트 간의 직접 통신 메커니즘을 문서화하고 있다. 문제는 이 파이프라인에 직접 핸드오프가 적합한지 여부인데, 여기서는 그렇지 않다. 코디네이터를 통한 추가 경유는 무인으로 실행되는 CI 파이프라인에서 중요한 세 가지를 얻게 해준다. 관찰 가능성(모든 결과와 오류가 하나의 지점을 거치므로, 실패한 보안 스캔이 동료에게 조용히 흡수되지 않고 눈에 보인다), 일관된 오류 처리(코디네이터가 하나의 일관된 정책을 사용해 재시도하거나, 대체하거나, 부분적인 결과로 진행할 수 있다), 통제된 정보 흐름(코디네이터가 각 하위 에이전트의 프롬프트에 정확히 무엇이 담기는지 결정하는데, 이는 서브에이전트가 격리된 컨텍스트에서 시작하여 명시적으로 전달받은 것만 볼 수 있기 때문에 중요하다).

가져야 할 사고 모델은 서브에이전트가 새로운 에이전트 인스턴스라는 것이다. 부모의 대화를 물려받지 않으며, 일반적인 위임에서는 최종 메시지가 자신을 생성한 에이전트에게 반환된다. 컨텍스트는 매 위임마다 명시적으로 구성되어야 하므로, 코디네이터가 그 컨텍스트를 선별하는 자연스러운 장소가 된다. 직접 메시지를 통해 동료들 사이에 핸드오프를 분산시키면 감사 추적과 복구 로직이 모두 분산된다. 오답들은 이점을 잘못 귀속시킨다. 중앙 라우팅은 토큰 비용이나 지연 시간을 줄이지 않으며(오히려 경유를 추가한다), 코디네이터만의 배타적인 직렬화 능력은 없다(결과는 어느 경우든 텍스트로 이동한다), 그리고 병렬성은 생성 시점에 Agent 도구 호출이 어떻게 발동되는지에 의해 결정되며, 이후에 결과가 어떻게 반환되는지와는 무관하다.

서브에이전트 컨텍스트 격리, 위임, 에이전트 간 메시징이 작동하는 방식에 대해서는 SDK의 서브에이전트 문서와 커스텀 서브에이전트 만들기 문서를 참고하라.


## 질문 20

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A coordinator delegates style, security, and test-coverage reviews to three independent subagents, but each review starts only after the previous one finishes, tripling wall-clock time. What change makes the three reviews run concurrently?

**A.** Return each subagent's tool_result in its own separate user message the moment it completes, so the coordinator issues the next Task call sooner.

**설명**

문서는 개별 도구 결과를 별도의 사용자 메시지로 보내지 말라고 명시적으로 경고한다. 각 tool_use 블록은 대응하는 tool_result를 받아야 하며, 모든 결과는 하나의 메시지에 함께 묶여야 한다. 이 접근법은 또한 생성을 여전히 순차적으로 남겨둔다. 각 리뷰가 여전히 각자의 턴에서 요청되기 때문이다.

**B(정답).** Prompt the coordinator to request all three subagent Task calls in one response, execute them concurrently, and return the results together.

**설명**

병렬 서브에이전트 실행은 턴마다 하나씩이 아니라 하나의 코디네이터 응답에서 여러 서브에이전트 도구 호출을 내보냄으로써 표현된다. 그러면 하네스가 독립적인 리뷰들을 동시에 실행하고, 대응하는 모든 tool_result 블록을 다음 메시지에 함께 반환한다.

**C.** Run the coordinator on a lower-latency model so it issues each successive Task call with less delay between the three reviews.

**설명**

더 빠른 코디네이터는 턴 사이의 간격을 줄여주지만 리뷰들은 여전히 하나씩 순차적으로 실행된다. 전체 시간은 가장 느린 리뷰의 소요 시간이 아니라 대략 세 리뷰의 합계로 남는다.

**D.** Buffer Task calls across successive coordinator turns in the harness, then dispatch the queued calls to all three subagents at once.

**설명**

코디네이터는 이전 도구 호출의 결과가 반환되기 전까지는 다음 턴을 생성할 수 없으므로, 함께 발송할 수 있는 별도 턴들의 호출 대기열이 결코 쌓이지 않는다. 순차적인 턴은 본질적으로 순차적인 생성을 강제하는데, 이것이 바로 고쳐야 할 문제다.

### 전반적인 설명

병렬 서브에이전트 생성은 와이어 포맷 차원의 패턴이다. 코디네이터는 stop_reason: "tool_use"를 가진 하나의 어시스턴트 응답 안에서 여러 서브에이전트 tool_use 블록을 내보낸다. 런타임은 그 호출들에 대한 실행 순서를 규정하지 않으므로, 하네스는 자유롭게 동시 실행할 수 있으며, 이는 세 리뷰가 독립적이고 서로의 출력에 의존하지 않기 때문에 여기서 안전하다. 그러면 동시성이 지연 시간을 세 개의 합계가 아니라 가장 느린 리뷰로 제한한다. 현재 SDK에서 서브에이전트 도구는 Agent라는 이름을 가지며 Task는 별칭으로 허용되지만, 패턴은 어느 이름으로든 동일하다.

이 패턴의 나머지 절반은 결과를 올바르게 반환하는 것이다. 모든 tool_use 블록은 자신의 tool_use_id를 참조하는 정확히 하나의 대응하는 tool_result를 받아야 하며, 그 모든 결과 블록들은 다음의 단일 사용자 메시지 안에 함께 있어야 한다. Anthropic은 결과를 별도의 사용자 메시지로 분할하는 것이 잘못되었으며 이는 실질적으로 모델이 병렬 호출을 내보내지 않도록 학습시키는 것이라고 명시적으로 경고한다. 이것이 각 리뷰의 결과를 자신만의 메시지로 반환하는 것이 순차적인 행동을 치유하기는커녕 오히려 굳혀버리는 이유다.

오답들은 구조적으로 실패한다. 턴을 넘나들며 호출을 버퍼링하는 것은 불가능하다. 코디네이터는 다음 턴을 생성하기 전에 각 도구 결과를 기다려야 하므로, 턴을 넘나드는 대기열은 결코 축적되지 않는다. 코디네이터의 모델을 빠르게 만드는 것은 핸드오프 간격을 줄여주지만 리뷰들은 여전히 엄격하게 순차적으로 남는다. 오직 호출이 발동되는 지점을 턴마다 하나에서 응답마다 여러 개로 바꾸는 것만이 실제로 동시성을 만들어낸다.

하나의 응답에 여러 tool_use 블록을 넣는 것과 그룹화된 tool_result 요구사항에 대해서는 병렬 도구 사용 문서를, 서브에이전트가 격리된 인스턴스로서 병렬로 실행되는 방식에 대해서는 SDK의 서브에이전트 문서를 참고하라.


