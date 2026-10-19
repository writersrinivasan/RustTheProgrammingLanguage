# RustForge: Learn Rust, End to End 🦀

A colourful, interactive Rust learning portal built with Next.js 15, React 19 and Tailwind CSS 4.

## Features
- **Learn** (`/learn`): 15 concept lessons with analogies, runnable examples, takeaways, quizzes and XP.
- **Nuances** (`/nuances`): 18 gotchas, each with broken and idiomatic code you predict and then reveal.
- **Evolution** (`/evolution`): why Rust exists, what it is, how it evolves (RFCs, editions), plus a timeline.
- **Roadmap** (`/roadmap`): a 10-stage foundation and 7 developer tracks (backend, systems, embedded, Wasm, data, gamedev, blockchain).
- **Playground** (`/playground`): Monaco editor, real compilation through play.rust-lang.org, 11 challenges with hidden unit tests, side-by-side mistake notes, inline error markers, coach tips, a mistake journal and AI explanations.
- **Industry** (`/industry`): case studies from AWS, Cloudflare, Discord, Microsoft, Google, Linux and others.
- **Ferris AI**: a BYOK Groq assistant, available on every page, that answers **only Rust** questions (topic classifier plus a locked system prompt).

## Run
```bash
npm install
npm run dev   # http://localhost:3000
```
Click **Ask Ferris AI**, paste your Groq key (from https://console.groq.com/keys), then click **Verify & save**.
The key stays in your browser's storage. It is passed to Groq through `/api/chat` on each request and is never stored on the server.

Progress (XP, levels, streaks) is saved in `localStorage`.
