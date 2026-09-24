# 시나리오 목록

## 시나리오 1
You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

Claude Code를 Continuous Integration/Continuous Deployment(CI/CD) 파이프라인에 통합하고 있습니다. 이 시스템은 자동화된 코드 리뷰를 수행하고, 테스트 케이스를 생성하며, 풀 리퀘스트에 피드백을 제공합니다. 실행 가능한 피드백을 제공하면서 오탐(false positive)을 최소화하는 프롬프트를 설계해야 합니다.

## 시나리오 2
You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

소프트웨어 개발 속도를 높이기 위해 Claude Code를 사용하고 있습니다. 팀은 코드 생성, 리팩토링, 디버깅, 문서화에 이를 활용합니다. 커스텀 슬래시 명령어와 CLAUDE.md 설정을 통해 개발 워크플로에 통합해야 하며, plan mode와 직접 실행(direct execution) 중 언제 무엇을 사용할지 이해해야 합니다.

## 시나리오 3
You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

Claude Agent SDK를 사용해 멀티 에이전트 리서치 시스템을 구축하고 있습니다. 코디네이터 에이전트가 전문화된 서브에이전트들에게 작업을 위임합니다: 하나는 웹을 검색하고, 하나는 문서를 분석하고, 하나는 결과를 종합하고, 하나는 보고서를 생성합니다. 이 시스템은 주제를 조사하여 출처가 인용된 포괄적인 보고서를 생성합니다.

## 시나리오 4
You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

Claude를 사용해 구조화된 데이터 추출 시스템을 구축하고 있습니다. 이 시스템은 비정형 문서에서 정보를 추출하고, JavaScript Object Notation(JSON) 스키마로 출력을 검증하며, 높은 정확도를 유지합니다. 예외 상황(edge case)을 원활하게 처리하고 후속(downstream) 시스템과 통합되어야 합니다.

## 시나리오 5
You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

Claude Agent SDK를 사용해 고객 지원 해결 에이전트를 구축하고 있습니다. 이 에이전트는 반품, 청구 분쟁, 계정 문제와 같이 모호성이 높은 요청을 처리합니다. 커스텀 Model Context Protocol(MCP) 도구(get_customer, lookup_order, process_refund, escalate_to_human)를 통해 백엔드 시스템에 접근합니다. 목표는 언제 에스컬레이션해야 하는지 판단하면서 최초 접촉 해결률(first-contact resolution) 80% 이상을 달성하는 것입니다.

## 시나리오 6
You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

Claude Agent SDK를 사용해 개발자 생산성 도구를 구축하고 있습니다. 이 에이전트는 엔지니어가 낯선 코드베이스를 탐색하고, 레거시 시스템을 이해하고, 보일러플레이트 코드를 생성하고, 반복 작업을 자동화하도록 돕습니다. 내장 도구(Read, Write, Bash, Grep, Glob)를 사용하며 Model Context Protocol(MCP) 서버와 통합됩니다.
