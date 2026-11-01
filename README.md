# KEVIN AI TEST

A local-first AI worker desktop command center. Windows is the first delivery target; Android is planned after the desktop core is stable.

## Current state
Initial Tauri 2 + React + TypeScript shell and minimal Rust bridge. Provider connections, secure credential storage, task execution and worker orchestration are not implemented yet. The UI intentionally labels these as pending.

## Requirements
- Node.js 22+
- Rust stable toolchain
- Windows 10/11 for installer builds

## Run
    npm install
    npm run tauri dev

Frontend-only preview: npm run dev

## Build Windows installer
    npm install
    npm run tauri build

Installers are generated under src-tauri/target/release/bundle/ after a successful Windows build.

Never commit API keys. See SECURITY.md, docs/ARCHITECTURE.md and docs/ROADMAP.md.
