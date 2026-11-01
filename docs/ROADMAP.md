# Roadmap

## Milestone 0 — foundation
- [x] Tauri 2 + React + TypeScript skeleton
- [x] Command-center UI shell
- [x] Minimal Rust command bridge
- [ ] Windows build verified in CI

## Milestone 1 — providers
- [ ] OS credential-store integration
- [ ] Provider adapter interface and connection tests
- [ ] OpenAI, Gemini, Groq, Anthropic, OpenRouter and Ollama adapters
- [ ] Custom OpenAI-compatible endpoint/model/auth settings

## Milestone 2 — worker runtime
- [ ] Task queue, cancellation and persisted history
- [ ] Worker-to-model assignment and bounded delegation
- [ ] Streaming, retries, timeout and error handling
- [ ] Approval gates for file, shell, browser and messaging actions

## Milestone 3 — specialist workers
- [ ] Research, coding and Windows operator
- [ ] Telegram, trading research/news and student-management integrations

## Milestone 4 — release
- [ ] Signed Windows installer
- [ ] Android companion APK after desktop core stabilizes

No feature is marked complete until implemented and tested.
