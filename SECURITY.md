# Security policy

- Never commit API keys, tokens, passwords, .env files or personal data.
- Provider secrets must be stored through an operating-system credential facility from Rust, never browser localStorage/sessionStorage.
- Redact authorization headers and secrets from logs.
- Use least-privilege worker permissions. File, shell, browser, Telegram and trading actions require explicit scopes and approval.
- Treat model output, webpages, files and tool results as untrusted input. Never execute generated commands without policy checks and user approval.
- A pasted key alone does not guarantee provider support; endpoint, authentication, model availability and API format must match.
