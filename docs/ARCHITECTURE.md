# Architecture

Windows-first desktop app using Tauri 2, React and TypeScript. Privileged operations belong in Rust, not browser code.

## Planned layers
- Presentation: dashboard, workers, task history and provider settings.
- Application core: task lifecycle, orchestration, approvals, cancellation and audit events.
- Provider adapters: OpenAI, Gemini, Groq, Anthropic, OpenRouter, Ollama and configurable OpenAI-compatible endpoints. Support depends on endpoint, auth scheme, model and account access.
- Worker runtime: role configurations executed by a real task runner. Animation is never proof of execution.
- Security: OS credential store; never source control, browser localStorage, URLs or logs.

Every task needs a persisted state, timestamps, worker assignment and verifiable output or error. External actions require scoped permissions and approvals. Android is a later companion milestone, not part of the first Windows build.
