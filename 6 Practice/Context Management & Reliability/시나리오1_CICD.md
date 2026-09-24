# 시나리오1_CICD

## 질문 1

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Developers have started ignoring the review comments because roughly a third are false positives. You want to auto-post only findings that are likely genuine and route the rest to a triage queue. What should you implement?


**A(정답).** Have the model output a confidence score with each finding, then tune the auto-post threshold on a labeled set of past findings marked valid or false positive.

**설명**

이는 캘리브레이션(보정) 패턴입니다. 각 발견 항목별 신뢰도 점수는 과거 라벨링된 정답 데이터를 기준으로 임계값을 튜닝해야 비로소 유용한 라우팅 신호가 됩니다. 과거 발견 항목에 대한 리뷰어의 판정(유효/오탐)을 보면 점수가 실제로 어느 지점에서 정탐과 오탐을 구분하는지 드러나므로, 임계값이 추측이 아니라 측정된 동작을 반영하게 됩니다.

**B.** Apply a fixed confidence cutoff of 0.8 across all finding categories, trusting the model's self-reported scores to be consistent without any validation step.

**설명**

모델이 스스로 보고하는 신뢰도는 보정이 잘 되어 있지 않은 것으로 알려져 있으며, 그 의미도 발견 항목의 카테고리마다 다를 수 있습니다. 라벨링된 데이터로 검증하지 않고 고정된 임계값을 선택하면 한 카테고리에서는 유효한 발견을 억제하면서 다른 카테고리에서는 여전히 오탐을 게시하게 될 수 있습니다.

**C.** Auto-post only findings the model classifies as high severity, on the assumption that severity strongly correlates with a finding being genuine.

**설명**

심각도(severity)는 실제로 문제가 발생했을 때 얼마나 나쁜지를 나타내는 척도일 뿐, 발견 항목이 정확할 가능성을 나타내는 것이 아닙니다. 심각도가 높은 발견도 여전히 오탐일 수 있으므로, 심각도로 필터링해서는 개발자들이 반응하고 있는 정확도 문제를 해결할 수 없습니다.

**D.** Have the same reviewing instance re-evaluate its own findings and auto-post only the ones it still endorses on a second pass.

**설명**

모델은 자신이 만든 발견 항목을 도출한 추론 과정을 그대로 유지하고 있어서, 자신의 결론에 이의를 제기할 가능성이 낮습니다. 따라서 같은 인스턴스의 자기 검증(self-review)은 오탐을 걸러내는 효과가 거의 없습니다. 이는 자기 검증의 알려진 한계이며, 대신 라벨링된 데이터로 보정된 독립적인 신호가 필요합니다.

### 전반적인 설명

여기서 핵심 문제는 라우팅입니다. 일부 발견 항목은 자동으로 게시하고 일부는 보류해야 하는데, 파이프라인이 이 구분을 하려면 신뢰할 수 있는 신호가 필요합니다. 발견 항목별 신뢰도 점수는 원시 신호로서는 적절하지만, 한 가지 중요한 주의점이 있습니다. 모델이 스스로 보고하는 신뢰도는 기본적으로 보정되어 있지 않습니다. 0.8이라는 점수가 그 발견이 80% 확률로 정확하다는 의미는 아니며, 점수와 정확도의 관계는 발견 항목의 카테고리에 따라 다를 수 있습니다. 해결책은 보정입니다. 즉, 리뷰어가 유효/오탐으로 판정한 과거 발견 항목으로 라벨링된 검증 세트를 수집하고, 보고된 점수에 따라 실제 정밀도(precision)가 어떻게 달라지는지 그려본 뒤, 정밀도가 허용 기준을 만족하는 지점에서 자동 게시 임계값을 정하는 것입니다. 이렇게 하면 신뢰할 수 없는 주관적 수치가 경험적으로 근거 있는 라우팅 규칙으로 바뀌며, 동일한 라벨링 세트로 프롬프트나 모델이 바뀔 때마다 임계값을 재검증할 수 있습니다.

각 대안은 각기 다른 지점에서 실패합니다. 0.8과 같은 고정 임계값을 선택하는 것은 올바른 신호를 알려진 대로 신뢰할 수 없고 검증되지 않은 형태로 사용하는 것입니다. 심각도는 정확성이 아니라 영향의 척도이며, 자신 있게 틀린 심각도-높음 발견이야말로 개발자의 신뢰를 무너뜨리는 종류의 오탐입니다. 그리고 동일한 인스턴스에게 자신의 발견을 다시 확인하게 하는 것은 자기 검증의 한계에 부딪힙니다. 모델은 그 발견을 만들어낸 추론 맥락을 여전히 가지고 있어서 좀처럼 스스로 뒤집지 않습니다. 독립적인 리뷰 인스턴스나 외부에서 보정한 임계값이 실질적인 대안입니다.

유지해야 할 사고 모델은 "측정한 뒤 자동화하라"입니다. 올바른 발견이 무엇인지 정의하고, 라벨링된 평가 세트를 구축하고, 측정된 오류율이 자동화 경계를 정하도록 하는 것으로, 이는 Anthropic의 성공 기준 정의 및 경험적 평가 구축 가이드에서 설명하는 방식입니다.

### 도메인

Context Management & Reliability



## 질문 2

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline's log-fetch tool returns the same generic "logs unavailable" message both when a request times out and when a job genuinely produced no logs, so Claude retries valid empty results and sometimes skips review sections after real failures. How should the tool's error handling be redesigned?


**A(정답).** Return distinct structured responses that state the failure type, the request attempted, and whether a retry is worthwhile.

**설명**

이는 정답입니다. 타임아웃과 정상적으로 비어 있는 결과는 서로 다른 응답이 필요한, 의미상 서로 다른 결과이기 때문입니다. 구조화된 오류 맥락(실패 유형, 시도한 작업, 재시도 가능 여부)은 모델이 접근 실패는 재시도하고 빈 결과는 유효한 발견으로 받아들일 수 있도록 필요한 정보를 제공합니다.

**B.** Return empty log content marked as a successful result so the review proceeds without retry behavior firing.

**설명**

이는 침묵 억제(silent suppression) 안티패턴입니다. 실패를 성공으로 표시하면 오류가 완전히 숨겨집니다. 그러면 리뷰는 타임아웃으로 인해 로그가 없어진 상황을 마치 작업이 실제로 아무것도 만들지 않은 것처럼 취급하게 되어, 풀 리퀘스트에 오해를 불러일으키는 피드백을 만들게 됩니다.

**C.** Fail the entire pipeline run whenever the tool reports logs unavailable so incomplete reviews are never posted.

**설명**

단일 도구 실패로 전체 워크플로를 중단시키면 계속 완료할 수 있었던 리뷰 작업까지 모두 버려집니다. 더 나은 설계는 부분적인 결과로 계속 진행하고 그 공백을 주석으로 남기는 것이며, 일시적인 타임아웃 하나가 전체 실행을 치명적으로 만들게 해서는 안 됩니다.

**D.** Instruct Claude in the system prompt to retry any unavailable-logs message at most once before continuing the review.

**설명**

이는 낭비되는 재시도를 제한하지만 근본 문제를 고치지 못합니다. 도구 응답은 여전히 두 개의 서로 다른 결과를 뒤섞어 놓고 있습니다. Claude는 여전히 어떤 섹션을 로그가 없는 것으로 리뷰해야 하는지, 아니면 실패로 인한 커버리지 공백으로 표시해야 하는지 구별할 수 없습니다.

### 전반적인 설명

여기서 핵심 실패는 서로 의미가 다른 두 결과를 하나의 메시지로 뭉뚱그리는 범용 오류 상태입니다. 타임아웃은 접근 실패입니다. 로그가 존재할 수도 있고, 재시도하면 성공할 수도 있습니다. 로그가 없는 작업은 유효한 빈 결과입니다. 조회는 정상적으로 수행되었고 답이 "여기엔 아무것도 없다"인 것입니다. 두 경우 모두 "logs unavailable"로 돌아오면 모델은 재시도할지, 진행할지, 공백을 주석으로 남길지 선택할 근거가 없어지고, 결국 양쪽 모두에서 잘못된 행동을 하게 됩니다. 결코 바뀌지 않을 결과를 재시도하고, 실제 실패를 최종 답으로 취급하는 것입니다.

해결책은 오류 응답이 복구에 필요한 맥락을 담도록 만드는 것입니다. Anthropic의 도구 사용 가이드는 도구 실패를 is_error: true와 유용한 메시지를 담은 tool_result로 반환하도록 권장하며, "failed"와 같은 범용 오류를 명시적으로 경고합니다. 좋은 오류는 무엇이 잘못되었고 다음에 무엇을 시도해야 하는지를 알려줍니다. 다단계 리뷰 워크플로에서는 실패 유형을 구분하고, 시도한 작업을 포함하며, 재시도 가능 여부를 신호로 전달해야 합니다. 그래야 에이전트가 일시적 실패는 재시도하고, 빈 결과는 발견으로 받아들이며, 공백이 있는 지점을 남긴 채 부분적인 커버리지로 계속 진행할 수 있습니다.

각 대안은 각기 특징적인 방식으로 실패합니다. 재시도를 제한하는 프롬프트 규칙은 증상만 다룰 뿐 모호한 신호는 그대로 남겨두어, 모델은 여전히 두 경우를 구별할 수 없습니다. 실패를 빈 성공으로 표시하는 것은 침묵 억제로, 고장 난 도구를 잘못된 리뷰 결론으로 바꿔버립니다. 어떤 실패든 전체 실행을 중단시키는 것은 일시적 오류 하나 때문에 완료 가능했던 모든 작업을 버리는 것으로, 공백을 주석으로 남긴 우아한 성능 저하(graceful degradation)가 대부분의 가치를 보존하는 것과 대조됩니다. 문서화된 오류 보고 패턴은 Handle tool calls를 참고하십시오.

### 도메인

Context Management & Reliability



## 질문 3

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A developer replies to one of the pipeline's review comments: "This warning is wrong, it keeps blocking my PRs, and it's really frustrating." The flagged finding is one the system can re-evaluate. How should the response flow be designed?

**A.** Run sentiment analysis on developer replies and hand the thread to a human whenever negativity crosses a calibrated threshold.

**설명**

감정 분석은 어떤 사례가 실제로 사람의 개입을 필요로 하는지 판단하는 데 있어 신뢰할 수 없는 대체 지표로 알려져 있습니다. 어조와 복잡도는 대체로 서로 독립적입니다. 부정적 감정 점수로 라우팅하면 해결 가능한 다수의 분쟁을 에스컬레이션하면서도, 실제로 담당자가 필요한 차분한 어조의 사례는 놓치게 됩니다.

**B.** Escalate the thread to a human maintainer right away, since a frustrated developer response indicates the case exceeds the automated reviewer's scope.

**설명**

좌절감만으로는 신뢰할 수 있는 에스컬레이션 트리거가 되지 못합니다. 이는 사례의 복잡도나 시스템의 문제 해결 능력과 상관관계가 없습니다. 즉시 에스컬레이션은 사람을 명시적으로 요청하는 경우를 위해 남겨두어야 하며, 여기서의 발견 항목은 시스템이 스스로 재평가할 수 있는 것입니다.

**C(정답).** Acknowledge the frustration, re-check the finding with the developer's input, and escalate to a human only if the developer pushes back again.

**설명**

이는 세분화된 에스컬레이션 패턴을 따릅니다. 먼저 감정을 인정하고, 해당 작업이 시스템의 역량 범위 안에 있으므로 구체적인 해결책을 제시하며, 상대가 이의를 다시 제기할 때만 에스컬레이션합니다. 좌절감의 표현은 사람을 요청하는 것과 같지 않으므로, 시스템은 이관하기 전에 해결을 시도해야 합니다.

**D.** Dismiss the flagged finding and pass the check, since holding a disputed warning against an unhappy developer erodes trust in automated review.

**설명**

누군가가 이의를 제기했다는 이유만으로 발견 항목을 철회하는 것은 침묵 억제의 한 형태입니다. 이는 실제로 존재할 수 있는 문제를 숨기고, 개발자들에게 불만을 제기하면 리뷰를 우회할 수 있다는 것을 학습시킵니다. 발견 항목은 마찰을 피하기 위해 폐기할 것이 아니라 그 자체의 타당성에 따라 재평가해야 합니다.

### 전반적인 설명

고객 대응 에이전트에 적용되는 에스컬레이션 원칙은 개발자 대응 자동화에도 그대로 적용됩니다. 좌절감의 표현과 사람을 명시적으로 요청하는 것을 구별해야 하며, 후자만이 즉시 에스컬레이션을 유발합니다. 누군가 짜증이 났지만 해당 분쟁 작업이 시스템의 역량 범위 안에 있다면, 올바른 순서는 감정을 인정하고, 구체적인 해결을 시도(여기서는 개발자가 제시한 맥락에 따라 표시된 발견 항목을 재평가하는 것)한 뒤, 그 시도 이후에도 상대가 이의를 반복할 때만 사람 담당자에게 에스컬레이션하는 것입니다.

이러한 설계는 신뢰와 처리량 사이의 트레이드오프 때문에 존재합니다. 짜증의 첫 신호에서 바로 에스컬레이션하면 자동화가 해결할 수 있었던 사례들로 사람 리뷰어가 넘쳐나게 되어, 자동화 리뷰의 목적 자체를 무너뜨립니다. 반대 극단으로, 단지 이의가 제기되었다는 이유만으로 발견 항목을 폐기하는 것은 침묵 억제입니다. 체크가 실제로 검증되지 않은 상태를 보고하게 되고, 개발자들은 이의를 제기하는 것이 리뷰를 건너뛰는 지름길이라는 것을 학습합니다. 새로운 맥락으로 재평가하는 것이 중간 경로이며, 이는 반발을 경보나 거부권이 아니라 정보로 취급합니다.

감정 점수화는 원칙에 입각한 절충안처럼 보이지만, 명확한 행동 신호를 신뢰할 수 없는 대체 지표로 바꿔치기하는 것에 불과합니다. 감정 상태는 사례의 복잡도를 추적하지 못합니다. 차분한 답변 뒤에 실제로 모호한 정책 문제가 숨어 있을 수도 있고, 격한 답변이 시스템이 한 번에 해결할 수 있는 발견 항목과 함께 나타날 수도 있습니다. 신뢰할 수 있는 신호는 사람에 대한 명시적 요청과, 해결 시도 이후에 반복되는 이의 제기이며, 둘 다 어떤 분류기 없이도 대화 내용에서 직접 관찰할 수 있습니다.

적절한 사람 확인 지점을 갖춘 에이전트 워크플로 설계에 대한 배경 지식은 Anthropic의 Building effective agents와 CI 리뷰 통합을 위한 Claude Code GitHub Actions 문서를 참고하십시오.

### 도메인

Context Management & Reliability



## 질문 4

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : During automated reviews of large pull requests, each call to the pipeline's fetch_pr_details MCP tool returns 50+ metadata fields, but the review only needs the diff, changed file paths, and author notes. The context window fills before big reviews finish. Which change is most effective?

**A.** Compact the conversation between file reviews so the accumulated tool output is condensed into summaries as the session proceeds.

**설명**

이는 틀렸습니다. 압축(compaction)은 이미 비대해진 내용이 컨텍스트에 들어온 뒤 증상을 다루는 것이며, 요약은 손실이 있는 처리입니다. 파일 경로나 diff 조각 같은 정밀한 세부 정보가 요약 과정에서 누락될 수 있습니다. 결과가 누적되기 전에 미리 다듬는 것이 근본적인 해결책입니다.

**B(정답).** Add a PostToolUse hook that trims each fetch_pr_details result to the review-relevant fields before it enters context.

**설명**

이는 정답입니다. 컨텍스트 비대화를 그 근원에서 막기 때문입니다. 방대한 도구 출력이 컨텍스트 윈도우를 차지하기 전에, 리뷰가 실제로 사용하는 몇 개의 필드로 줄어듭니다. 그러면 관련 없는 메타데이터가 턴마다 누적되지 않으면서 전체 리뷰를 완료할 수 있습니다.

**C.** Instruct Claude in the review prompt to disregard any metadata fields that are not relevant to evaluating the code changes.

**설명**

이는 틀렸습니다. 필드를 무시하라는 지시는 그 필드를 컨텍스트 윈도우에서 제거하지 않기 때문입니다. 관련 없는 필드는 여전히 매 호출마다 토큰을 소비합니다. 모델이 추가 데이터에 주의를 기울이든 말든 윈도우는 같은 속도로 차게 됩니다.

**D.** Raise max_tokens on each request so the model has additional room to work through the accumulated pull request metadata.

**설명**

이는 틀렸습니다. max_tokens는 모델의 출력 길이를 제어하는 것이며 입력 컨텍스트의 크기와는 무관합니다. 방대한 도구 결과는 여전히 동일한 입력 토큰을 소비하므로 윈도우는 똑같이 빠르게 채워집니다.

### 전반적인 설명

도구 출력은 그 관련성에 비해 불균형하게 컨텍스트에 누적됩니다. 몇 개만 필요한데 50개 이상의 필드를 반환하는 조회는 매 호출마다 토큰을 낭비하며, 에이전트 루프에서는 그 결과가 전체 대화 히스토리와 함께 이후의 모든 요청마다 다시 전송됩니다. 이렇게 누적되는 비용 때문에, 개입해야 할 올바른 지점은 결과가 컨텍스트에 들어오는 시점이지, 이미 누적된 이후가 아닙니다.

PostToolUse 훅은 바로 이 문제를 위해 설계된 메커니즘입니다. 도구 실행 후 그 결과를 가로채서 코드가 이를 변환할 수 있게 하며, 모델이 보기 전에 diff, 변경된 파일 경로, 작성자 노트만 남길 수 있습니다. 이는 결정적(deterministic)입니다(코드가 매 호출마다 실행됨). 또한 정밀도를 보존합니다(남겨진 필드는 요약되지 않고 그대로 전달됨). 그리고 리뷰 규모에 따라 확장됩니다(호출당 크기가 작게 유지되기 때문입니다).

대안들은 각기 다른 이유로 실패합니다. 관련 없는 필드를 무시하라는 프롬프트 지시는 주의(attention)를 바꿀 뿐 토큰 소비를 바꾸지 않습니다. 메타데이터는 여전히 윈도우를 차지합니다. 세션 중간의 압축은 설계가 아니라 안전 밸브에 불과합니다. 비대화가 컨텍스트에 이미 들어온 뒤에야 작동하며, 그 요약 과정에서 코드 리뷰가 의존하는 정확한 식별자가 누락될 수 있습니다. max_tokens를 늘리는 것은 응답 예산만 확장할 뿐 입력량에는 아무런 영향을 주지 않습니다. 프로덕션 에이전트를 위한 일반 원칙은 컨텍스트에 들어오는 내용을 근원에서 형성하고, 압축은 누적이 불가피했던 상황을 위해 남겨두는 것입니다.

Claude Code hooks reference와 Effective context engineering for AI agents를 참고하십시오.

### 도메인

Context Management & Reliability



## 질문 5

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : Per-file review subagents return findings as bare prose. The aggregator merges them into one PR comment, and developers dismiss many as false positives because verified issues and speculative pattern matches look identical. Which structured-output requirement addresses this?

**A.** Instruct the aggregation agent to independently re-run the relevant tests to verify every finding before posting the comment.

**설명**

이는 파일별 서브에이전트가 이미 수행한 작업을 중복시키고 파이프라인의 시간과 비용을 부풀립니다. 또한 집계 에이전트에게는 각 서브에이전트가 가진 파일 단위 맥락이 없으며, 문제로 제시된 것은 검증 노력의 부족이 아니라 발견 항목에 대한 메타데이터의 부족입니다.

**B.** Have each subagent attach a raw self-rated confidence score to every finding so the aggregator can rank the merged list.

**설명**

보정되지 않은 자체 평가 신뢰도는 좋지 못한 대체 지표입니다. 모델이 자신 있게 틀리는 경우가 바로 오탐으로 판명되는 발견 항목들이기 때문입니다. 순위 점수 역시 발견 항목이 어떻게 만들어졌는지에 대해서는 아무것도 알려주지 않는데, 이것이 바로 집계자와 개발자들에게 부족한 정보입니다.

**C(정답).** Require each finding to carry its detection method and supporting evidence, such as the matched pattern or the failing test output.

**설명**

이는 모든 발견 항목에 함께 전달되는 방법론적 메타데이터입니다. 이를 통해 집계자는 실행으로 검증된 문제와 정적 검사에 의한 의심 사항을 구분해서 표시할 수 있고, 개발자는 각 코멘트를 그 근거에 따라 판단할 수 있습니다. 또한 어떤 탐지 패턴이 개발자들이 무시하는 오탐을 만들어내는지 체계적으로 분석할 수 있게 해줍니다.

**D.** Have subagents discard any finding they cannot confirm by executing tests, returning only issues verified at runtime.

**설명**

이는 정당한 발견 항목을 침묵으로 억제합니다. 정적 검사로 드러난 많은 실제 문제는 테스트 실행으로는 확인할 수 없기 때문입니다. 다운스트림 에이전트가 필요로 할 수 있는 정보를 폐기하는 것은 안티패턴입니다. 해결책은 발견 항목을 필터링하는 것이 아니라 출처(provenance) 정보를 함께 주석으로 남기는 것입니다.

### 전반적인 설명

정확한 다운스트림 종합은 서브에이전트가 방법론적 메타데이터를 포함한 구조화된 발견 항목을 반환하는 데 달려 있으며, 단순한 문장으로는 부족합니다. 다단계 리뷰 파이프라인에서 실패한 테스트로 뒷받침되는 발견 항목은 코드 패턴에서 추론된 발견 항목과는 매우 다른 무게를 가지지만, 둘 다 평범한 문장으로 뭉개지고 나면 집계 단계는 이를 구별할 방법이 없습니다. 각 발견 항목이 탐지 방법과 근거(예를 들어 detected_pattern 필드나 캡처된 테스트 출력)를 포함하도록 요구하면, 집계자는 검증된 문제를 차단 대상으로, 추측성 일치는 제안으로 표시할 수 있고, 팀은 어떤 탐지 패턴이 무시되는 코멘트를 만들어내는지 분석할 수 있습니다. 이러한 피드백 루프가 실제로 오탐률을 낮추는 방법입니다.

기저의 메커니즘은 서브에이전트가 결과를 반환하는 즉시 그 맥락이 폐기된다는 점입니다. 오케스트레이팅 에이전트가 보는 정보는 오직 서브에이전트의 최종 결과뿐입니다(Agent SDK Subagents 참고). 그 최종 메시지에 데이터로 담기지 않은 출처 정보는 이후에 복원할 수 없습니다. 서브에이전트 출력에 대한 결과 스키마의 자동 강제는 존재하지 않으므로, 각 서브에이전트는 탐지 방법과 근거 필드를 포함하는 구조화된 최종 메시지를 내도록 명시적으로 지시받거나 오케스트레이션 로직으로 감싸져야 합니다. Agent SDK의 에이전트로부터 구조화된 출력을 얻는 방법에 대한 가이드는 이 경계에서 안정적으로 파싱 가능한 결과를 얻는 방법을 설명합니다.

대안들은 특징적인 이유로 실패합니다. 자체 평가 원시 신뢰도 점수는 보정이 잘 되어 있지 않습니다. 모델은 어려운 사례에서 자신 있게 틀리는 경우가 많으므로, 그 신호로 순위를 매기면 목록의 순서만 바뀔 뿐 어떤 발견 항목도 설명해주지 못합니다. 집계자가 모든 것을 다시 검증하게 하는 것은 이미 완료된 작업을 중복시키며, 서브에이전트가 가졌던 파일 단위 맥락 없이 실행됩니다. 검증되지 않은 발견 항목을 폐기하는 것은 침묵 억제입니다. 정적 분석은 어떤 테스트로도 다루지 않는 문제를 정당하게 드러내는데, 이를 버리면 종합 단계와 개발자가 정보에 기반한 판단을 내리는 데 필요한 정보를 숨기게 됩니다.

### 도메인

Context Management & Reliability



## 질문 6

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : A pull request review step queries a vulnerability database through an MCP tool. Some reviews report "no vulnerabilities found" when the database actually timed out, letting flawed code merge. How should the tool report these two outcomes?

**A(정답).** Report timeouts as errors with actionable context and zero-match queries as successful results, so retries and approvals stay distinct.

**설명**

이는 정답입니다. 타임아웃과 실제로 깨끗한 조회는 서로 다른 응답이 필요한, 의미상 서로 다른 결과이기 때문입니다. 타임아웃은 재시도 결정을 유발해야 하고, 유효한 빈 결과는 그 자체로 유의미한 발견입니다. 도구의 오류 보고에서 이 둘을 구분해두면 리뷰 워크플로가 실패와 깨끗한 결과를 뒤섞지 않고 올바르게 판단할 수 있습니다.

**B.** Standardize both outcomes to a single "scan unavailable" status so the review workflow's error handling stays simple and uniform.

**설명**

범용 상태는 복구 결정에 필요한 맥락을 숨깁니다. 워크플로는 재시도할지, 다른 소스를 사용할지, 유효한 빈 결과를 받아들일지 판단할 수 없습니다. 더 나쁜 것은, 성공적인 매치-없음 조회까지도 겉보기 실패로 바꿔버려서 정당하고 유의미한 발견을 폐기하게 된다는 점입니다.

**C.** Fail the entire pipeline run whenever the database times out, since an incomplete security review must never reach developers.

**설명**

단일 도구 실패로 전체 워크플로를 중단시키는 것은 완료된 모든 리뷰 작업을 버리는 안티패턴입니다. 더 나은 설계는 맥락을 담아 오류를 전파해서 워크플로가 재시도하거나, 부분적인 결과로 진행하거나, 커버리지 공백을 주석으로 남길 수 있게 하는 것입니다.

**D.** Return an empty findings list marked as success when the database times out, so the review degrades gracefully instead of blocking.

**설명**

이는 침묵 억제 안티패턴으로, 실패를 사실처럼 꾸며놓은 것입니다. 이는 정확히 지금의 버그를 만들어내는 행동으로, 타임아웃이 깨끗한 스캔과 구별되지 않아서 결함 있는 코드가 병합되는 상황입니다.

### 전반적인 설명

여기서 핵심 구분은 접근 실패(조회가 실행되지 못함: 타임아웃, 서비스 오류)와 유효한 빈 결과(조회가 성공적으로 실행되었고 정당하게 아무것도 찾지 못함) 사이의 차이입니다. 둘은 표면적으로는 비슷해 보입니다. 발견 항목이 없다는 점에서요. 하지만 의미는 정반대입니다. 하나는 "우리는 모른다"이고 다른 하나는 "확인했고 깨끗하다"입니다. 이 둘을 뭉뚱그리는 어떤 보고 설계든 다운스트림 로직이 추측하도록 강요하게 되고, 보안 리뷰에서는 결함 있는 코드가 실제로는 완료되지 않은 스캔의 힘을 빌려 병합될 수 있다는 의미가 됩니다.

이 둘을 구분해 유지하는 메커니즘은 프로토콜 수준에 존재합니다. MCP 도구 호출이 실행에 실패하면 그 결과는 오류 결과(MCP 프로토콜의 isError 플래그)와 함께, 타임아웃이나 시도한 조회 등 무엇이 실패했는지 설명하는 실행 가능한 메시지로 보고해야 합니다. 매치가 0건인 성공적인 조회는 정상적인, 오류가 아닌 결과로 반환됩니다. 빈 결과는 완전히 유효한 형태이며 실패를 의미한다고 가정해서는 안 됩니다. 동일한 원칙이 Messages API의 클라이언트 측 도구에도 적용되어, 실패한 실행은 is_error: true를 가진 tool_result 블록으로 반환되고 유효한 빈 결과는 오류 플래그를 갖지 않습니다. 오류 결과가 어떻게 표현되는지, 그리고 오류 메시지가 왜 범용적이지 않고 구체적이어야 하는지는 Handle tool calls를 참고하십시오.

거부된 세 가지 설계는 각각 문서화된 안티패턴에 해당합니다. 타임아웃을 빈 콘텐츠와 함께 성공으로 표시하는 것은 침묵 억제입니다. 실패가 사라지고 리뷰는 결코 검증한 적 없는 것을 단언하게 됩니다. 모든 것을 하나의 "scan unavailable" 상태로 뭉뚱그리는 것은 복구 결정에 필요한 맥락을 없애버리는 동시에 깨끗한 스캔을 장애처럼 잘못 보고합니다. 하나의 타임아웃으로 전체 파이프라인을 실패시키는 것은 재시도나 주석 처리된 커버리지 공백으로 보존할 수 있었던 모든 부분적 리뷰 작업을 버리는 것입니다. 견고한 오류 보고는 계층화되고 정직해야 합니다. 결과 유형을 구분하고, 실행 가능한 맥락을 첨부하며, 더 넓은 시야를 가진 계층이 복구 방법을 결정하도록 해야 합니다.

### 도메인

Context Management & Reliability



## 질문 7

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline's dependency-check tool returns is_error: true whenever a vulnerability lookup succeeds but matches nothing. Claude retries these clean lookups and posts "security check unavailable" comments on pull requests. What change fixes the tool's interface?

**A(정답).** Return zero-match lookups as normal successful results stating no vulnerabilities were found, reserving is_error: true for execution failures such as timeouts.

**설명**

조회가 완료되었지만 아무것도 매치되지 않는 것은 실패가 아니라 유효하고 유의미한 결과이므로 정상적인 도구 결과에 속해야 합니다. is_error: true를 실제 실행 실패를 위해 남겨두면 모델에게 정확한 신호를 주게 되어, 깨끗한 조회를 재시도하는 것을 멈추고 체크를 이용 불가로 보고하는 것도 멈추게 됩니다.

**B.** Add a review prompt instruction telling Claude to treat this tool's error results as clean outcomes whenever the message mentions no vulnerabilities.

**설명**

이는 고장 난 인터페이스를 확률적인 프롬프트 패치로 덮어 가리는 것이며, 도구는 여전히 상충되는 신호를 계속 보냅니다. 또한 모델에게 메시지 텍스트를 근거로 오류 플래그를 재해석하도록 가르치는데, 이는 취약하며 같은 도구에서 발생하는 실제 실패에 대한 오류 처리를 약화시킵니다.

**C.** Have the tool retry each zero-match lookup internally with backoff before returning the error, so transient database issues resolve without Claude's involvement.

**설명**

이는 결과를 잘못 진단하는 것입니다. 매치 없이 성공한 조회는 일시적 실패가 아니므로, 이를 재시도하면 시간을 낭비할 뿐 여전히 똑같이 오해를 불러일으키는 오류가 반환됩니다. 백오프를 통한 내부 재시도는 타임아웃이나 서비스 오류에 적합하며, 유효한 빈 결과에는 적합하지 않습니다.

**D.** Remove the is_error flag from every response, including genuine timeouts, so tool problems never interrupt the automated review.

**설명**

이는 침묵 억제입니다. 실제 접근 실패가 이제 깨끗한 스캔과 동일하게 보이게 되어, 타임아웃된 취약점 체크가 발견 항목이 없는 풀 리퀘스트처럼 읽히게 됩니다. 이는 눈에 보이던 도구 문제를 거짓 음성(false negative)으로 바꾸는 것으로, 보안 관련 리뷰 게이트에서는 더 나쁜 결과입니다.

### 전반적인 설명

클라이언트 tool_result의 is_error 필드는 실행 채널을 나타내는 것이며, 데이터의 내용을 나타내는 것이 아닙니다. Anthropic의 가이드는 실행이 실제로 실패했을 때(네트워크 문제, API 실패, 타임아웃)만 is_error: true를 설정하도록 안내합니다. 완료까지 실행되었고 단지 아무것도 찾지 못한 조회는 성공한 결과이며, 이를 빈 콘텐츠나 최소한의 콘텐츠를 담은 정상 결과로 반환하는 것이 그 결과에 대해 문서화된 형태입니다. 이 사고 모델은 이 플래그가 모델에게 단 하나의 질문에 답한다는 것입니다. 이 결과를 발견 항목으로 신뢰할 수 있는가, 아니면 결과를 얻으려는 시도 자체가 실패했는가? 매치가 0건인 취약점 조회는 하나의 발견 항목입니다. 의존성이 깨끗하다는 것입니다.

이 두 방향을 혼동하면 대칭적인 실패 양상이 나타납니다. 이 도구처럼 유효한 빈 결과를 오류로 표시하면 모델은 깨끗한 결과를 고장 난 도구로 취급하게 됩니다. 절대 다른 결과를 반환하지 않을 조회를 재시도하고, 실제로는 통과했음에도 체크를 이용 불가로 보고합니다. 오류 신호를 완전히 제거하는 것은 문제를 뒤집습니다. 실제 접근 실패가 깨끗한 스캔으로 위장하게 되고, 보안 체크에서 이는 병합된 풀 리퀘스트에 대한 침묵의 거짓 음성을 의미합니다. 잘못 표시된 오류를 재해석하라는 프롬프트 수준의 지시는 인터페이스가 계속 거짓을 말하도록 방치하고 취약한 메시지 텍스트 매칭에 의존하며, 내부 재시도는 존재하지 않는 일시적 결함을 가정합니다.

여기서 도출되는 설계 규칙은 결정적으로(deterministic) 동작할 수 있는 도구 인터페이스 단계에서 결과의 의미를 인코딩하고, 모델이 다운스트림에서 이를 보정하도록 요구하지 않는 것입니다. 결과가 실제로 오류라면, 그 플래그에 실행 가능한 메시지(예를 들어 레이트 리밋에 대한 재시도 힌트)를 함께 담아 에이전트가 재시도, 적응, 또는 실패 노출 중에서 선택할 수 있도록 해야 합니다. is_error의 의미와 오류 메시지 가이드는 Handle tool calls를 참고하고, Anthropic 자체 도구가 매치 없음 성공과 실행 오류를 어떻게 다르게 표현하는지는 Web search tool을 참고하십시오.

### 도메인

Context Management & Reliability



## 질문 8

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The review job resolves each pull request to its tracker ticket via an MCP lookup by feature name. Some lookups return multiple plausible tickets, and guessing has produced reviews against the wrong acceptance criteria. How should multiple matches be handled?

**A.** Review the diff against the acceptance criteria of every candidate ticket and combine all findings in one report.

**설명**

PR이 구현하지 않은 티켓의 기준으로 리뷰하면 근거 없는 발견 항목이 생겨서, 파이프라인이 최소화하려는 오탐률을 직접적으로 부풀립니다. 이는 어떤 티켓이 적용되는지 해결하는 대신 올바른 리뷰를 노이즈 속에 묻어버립니다.

**B(정답).** Post PR feedback flagging the ambiguous match, request the exact ticket ID from the author, and defer the criteria check.

**설명**

이는 정답입니다. 여러 매치 사이의 모호함은 답을 실제로 알고 있는 사람, 즉 PR 작성자로부터 확정적인 식별자를 얻어서 해결해야 하기 때문입니다. 비대화형 파이프라인에서는 리뷰 출력 자체가 그 요청을 전달하는 채널이 되며, 체크를 뒤로 미루는 것은 잘못된 기준으로 리뷰하는 것을 방지합니다.

**C.** Rank the candidate tickets by textual similarity to the PR description and review against the highest-scoring match.

**설명**

유사도 순위는 방법으로 치장된 휴리스틱 추측일 뿐이며, 여전히 확정적인 근거 없이 후보 하나를 선택하게 됩니다. 유사도 신호가 오도될 때마다 이 변경을 촉발한 잘못된 티켓 리뷰가 계속될 것입니다.

**D.** Have Claude rate its confidence in each candidate and proceed with the review whenever the rating clears a threshold.

**설명**

모델의 자체 평가 신뢰도는 신뢰할 수 없는 대체 지표입니다. 모델은 자신 있게 틀릴 수 있고, 그 점수는 보정이 잘 되어 있지 않습니다. 임계값을 넘으면 진행하는 것은 모호함을 해결하는 대신 같은 추측 행동을 자동화하는 것에 불과합니다.

### 전반적인 설명

조회가 여러 개의 그럴듯한 매치를 반환할 때, 신뢰할 수 있는 해결책은 항상 실제로 답을 아는 사람으로부터 추가적인 확정 식별자를 얻는 것이며, 휴리스틱으로 후보를 선택하는 것이 아닙니다. 대화형 세션에서는 대화 중간에 사용자에게 물어보는 것을 의미하고, 에이전트가 입력을 위해 멈출 수 없는 헤드리스 CI 실행에서는 그와 동등한 채널이 실행 자체의 출력입니다. 즉, 모호함을 PR 피드백으로 게시하고, 작성자에게 정확한 티켓 ID를 요청하고, 식별자가 도착할 때까지 승인 기준 체크를 뒤로 미루는 것입니다. 작성자는 PR이 어떤 티켓을 구현하는지에 대한 확실한 지식을 갖고 있으므로, 한 번의 추가 왕복으로 잘못된 티켓 리뷰라는 오류 유형 전체를 없앨 수 있습니다.

오답 보기들은 모두 더 많은 장치를 덧붙인 채 여전히 추측을 계속합니다. 텍스트 유사도 순위는 티켓 제목이 겹칠 때 정확히 실패하는 확률적 대체 지표인데, 그 겹침이 바로 모호함이 발생하는 원인입니다. 신뢰도 자체 평가는 보정이 잘 되어 있지 않습니다. 모델은 바로 어려운 사례에서 자신 있게 틀리는 경향이 있으므로, 임계값으로는 올바른 매치와 잘못된 매치를 구분할 수 없습니다. 모든 후보의 기준으로 리뷰하는 것은 잘못된 리뷰를 노이즈 많은 리뷰로 바꿔치기할 뿐입니다. 구현되지 않은 티켓에서 파생된 발견 항목은 구조적으로 오탐이며, 이는 파이프라인이 목표로 하는 실행 가능하고 노이즈가 적은 피드백이라는 목표를 훼손합니다.

일반적인 사고 모델은 이렇습니다. 휴리스틱을 이용한 모호함 해소는 불확실성을 침묵의 오류로 바꾸는 반면, 명시적인 확인 요청은 그것을 눈에 보이고 비용이 적게 드는 하나의 상호작용으로 바꿉니다. 대화형이든 자동화된 것이든 에이전트를 설계할 때는 모호함이 추측에 흡수되지 않고 누락된 식별자에 대한 요청으로 드러나도록 해야 합니다. 도구 통합과 신뢰할 수 있는 에이전트 동작에 대한 가이드는 Connect Claude Code to tools via MCP와 Building Effective Agents를 참고하십시오.

### 도메인

Context Management & Reliability



## 질문 9

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : During an automated review run, the custom test-runner tool crashes mid-execution. You are designing how the harness reports this failure back to Claude so the review can continue intelligently. What should the harness do?

**A(정답).** Return a tool_result block with is_error set to true, containing what went wrong and a suggested next step.

**설명**

이는 도구 실패에 대해 문서화된 메커니즘입니다. 결과 블록은 원래 도구 호출을 참조하고, is_error 플래그가 실패를 명시적으로 신호하며, 실행 가능한 콘텐츠가 모델에게 무슨 일이 일어났고 어떻게 대응해야 하는지 알려줍니다. 그러면 Claude는 재시도, 실패 회피, 또는 리뷰에서 공백을 명시하는 것에 대해 판단할 수 있습니다.

**B.** Return an empty tool_result marked successful so the review proceeds as if the runner found no issues.

**설명**

이는 잘 알려진 안티패턴인 침묵 억제입니다. 모델은 크래시가 발생한 테스트 실행을 깨끗한 실행으로 취급하게 되어, 실제로 실행된 적 없는 테스트를 가진 코드를 승인할 수 있습니다. 이는 중단된 리뷰보다 더 나쁩니다.

**C.** Terminate the review run immediately and surface the raw exception in the pipeline logs for human triage.

**설명**

단일 도구 실패로 전체 워크플로를 중단시키면 이미 완료된 모든 리뷰 작업이 버려지고 모델이 복구할 기회가 사라집니다. 로그에 남은 원시 예외 역시 모델에게 아무런 정보도 주지 못합니다. 대화가 그대로 끝나버리기 때문입니다.

**D.** Send the error details as a standalone plain-text user message instead of a tool_result block.

**설명**

도구 실패는 해당 tool_use 블록에 대응하는 tool_result 블록 안에서 전달되어야 하며, 채널 밖의 텍스트로 전달해서는 안 됩니다. 이 짝을 깨뜨리면 API 검증 오류가 발생할 수 있고, 모델의 관점에서는 도구 호출이 해결되지 않은 상태로 남게 됩니다.

### 전반적인 설명

에이전트 루프에서 대화 히스토리는 Claude가 자신의 도구가 무엇을 했는지 알 수 있는 유일한 채널이며, 이는 도구가 실패한 경우도 포함합니다. API는 이를 위한 특정 구조를 정의합니다. 실패한 실행은 해당하는 tool_use_id를 담은 tool_result 블록으로 "is_error": true와 함께 보고됩니다. 이 플래그는 모델에게 호출이 성공하지 못했음을 명확히 알려주며, 블록의 콘텐츠는 단순한 상태 표시가 아니라 유용한 정보여야 합니다. 무엇이 잘못되었고 다음에 무엇을 시도해야 하는지(지연 후 재시도, 더 좁은 테스트 대상 실행, 건너뛰고 주석 남기기 등)를 명시해야 합니다. 이것이 크래시를 복구 가능한 사건으로 바꾸는 방법이며, 모델은 추측하는 대신 계획을 조정할 수 있습니다.

각 대안은 특징적인 방식으로 이 계약을 어깁니다. 실패를 성공적인 빈 결과로 표시하는 것은 침묵 억제입니다. 모델은 테스트가 깨끗하게 실행되었다고 믿게 되며, CI 리뷰에서 이는 검증되지 않은 코드를 승인하는 것을 의미할 수 있습니다. 전체 실행을 중단시키는 것은 하나의 일시적 실패를 치명적인 것으로 취급하여, 구조화된 오류라면 보존할 수 있었던 부분적 진행 상황을 버립니다. 그리고 오류를 별도의 텍스트로 주입하는 것은 tool_use와 tool_result 블록 사이에 요구되는 짝맞춤을 위반합니다. 결과는 메시지 히스토리에서 해당하는 도구 호출 바로 뒤에 와야 하며, 순서가 잘못되거나 결과가 없으면 400번대 검증 오류가 발생할 수 있습니다.

유지해야 할 사고 모델은 에이전트 시스템에서의 오류 처리는 커뮤니케이션 설계 문제라는 것입니다. 모든 실패 메시지는 다음 의사결정자(모델 자신이든 코디네이터든)가 재시도, 우회, 또는 우아한 성능 저하 중에서 선택할 수 있을 만큼 충분한 맥락을 담아야 합니다. 문서화된 결과 형식과 실행 가능한 오류 콘텐츠 작성 가이드는 Handle tool calls를 참고하십시오.

### 도메인

Context Management & Reliability



## 질문 10

**SCENARIO** : You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

**QUESTION** : The pipeline crashes after its per-file analysis stages complete. On restart, the manifest correctly marks those stages completed, yet the cross-file integration stage must redo their analysis because each stage's state file records only a status flag. What design change fixes this?

**A.** Re-run every stage from the beginning after any crash so the integration pass always works from freshly generated analysis.

**설명**

어떤 실패든 완료된 모든 작업을 폐기하는 것은 잘 알려진 안티패턴입니다. 비용과 지연 시간이 두 배가 되고, 애초에 상태를 유지하는 목적 자체를 무너뜨립니다. 크래시 복구는 완료된 단계의 결과를 재생성하는 것이 아니라 보존하고 재사용해야 합니다.

**B.** Increase manifest granularity to track sub-steps within each stage so restarts can pick up partway through an interrupted stage.

**설명**

더 세밀한 진행 상황 추적은 다른 문제를 다룹니다. 즉, 부분적으로 완료된 단계 내부에서 재개하는 문제입니다. 여기서 설명된 실패는 완료된 단계들의 출력이 없어졌다는 것이며, 상태 세분화를 얼마나 늘리든 통합 단계가 필요로 하는 분석 내용을 복원하지는 못합니다.

**C.** Use --resume on restart to restore the crashed session's conversation context so the integration stage can access earlier analysis.

**설명**

세션 재개는 일시적인 CI 러너가 보통 작업 재시작 사이에 유지하지 않는 로컬 세션 데이터에 의존하며, 그것이 가능하더라도 복원되는 것은 대화이지, 별도의 파이프라인 단계가 사용할 수 있는 기계가 읽을 수 있는 산출물이 아닙니다. 알려진 위치에 있는 구조화된 상태 파일이 여기서 신뢰할 수 있는 복구 메커니즘입니다.

**D(정답).** Have each stage export its structured findings to the known state location so downstream stages load those results on resume.

**설명**

이는 정답입니다. 매니페스트는 코디네이터에게 어떤 단계를 건너뛸지만 알려줄 수 있을 뿐, 건너뛴 단계의 출력물 또한 크래시를 견디고 살아남아야 하기 때문입니다. 상태와 함께 구조화된 발견 항목을 유지하면, 재개된 다운스트림 단계가 이전 작업을 재생성하지 않고 그대로 사용할 수 있게 됩니다.

### 전반적인 설명

구조화된 상태 유지에는 혼동하기 쉬운 두 가지 구성 요소가 있습니다. 매니페스트는 오케스트레이션 인덱스로, 코디네이터에게 어떤 단계가 completed, in_progress, not_started 상태인지 알려주어 재개 시 무엇을 건너뛸지 알게 해줍니다. 각 단계가 내보내는 상태 파일은 데이터 페이로드로, 다운스트림 단계가 실제로 사용하는 구조화된 발견 항목, 커버리지 노트, 공백 정보입니다. Claude는 호출 사이에 상태를 유지하지 않으므로, 이후 단계가 필요로 하는 모든 것은 명시적인 산출물로 존재해야 합니다. 상태 플래그는 작업이 일어났다는 것을 증명할 뿐 그 출력물은 전혀 담고 있지 않습니다. 복구는 두 계층이 모두 유지될 때만 작동하며, 이것이 바로 완료 상태뿐 아니라 각 단계의 구조화된 발견 항목을 알려진 상태 위치에 기록해야 하는 이유입니다.

각 대안은 이 구분을 놓칩니다. 크래시된 세션을 재개하는 것은 대화 히스토리가 크래시를 견디고 CI 러너에서 접근 가능하다고 가정하며, 복원된 트랜스크립트조차 별도의 파이프라인 단계가 로드할 수 있는 구조화된 산출물이 아닙니다. 하위 단계를 추적하는 것은 어디서 재시작할지를 다듬을 뿐, 잃어버린 것을 복원하지는 못합니다. 모든 것을 재실행하는 것은 중단-후-재실행 안티패턴으로, 상태 유지가 제공하기 위해 존재하는 정확히 그 비용과 시간 절감을 포기하는 것입니다.

Claude 기반 파이프라인에서 지녀야 할 사고 모델은 각 단계를 체크포인트가 있는 배치 작업처럼 취급하는 것입니다. 작업이 완료될 때마다 알려진 위치에 상태를 내보내고, 단계별 상태의 매니페스트를 유지하며, 재개 시 코디네이터가 매니페스트를 읽고 완료된 단계의 출력을 로드하며 완료되지 않은 작업만 다시 실행하도록 하십시오. CI에서 Claude Code를 비대화식으로 실행하는 이 패턴에 대해서는 Claude Code overview와 headless mode 문서를 참고하십시오.

### 도메인

Context Management & Reliability



