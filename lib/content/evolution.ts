export type Milestone = { year: string; title: string; detail: string; tag: "origin" | "release" | "edition" | "feature" | "ecosystem" | "industry" };

export const TIMELINE: Milestone[] = [
  { year: "2006", title: "A personal project", tag: "origin", detail: "Graydon Hoare, a Mozilla engineer, starts Rust as a side project — reportedly after a broken elevator caused by a software crash. The goal: a language that's fast like C++ but safe by construction." },
  { year: "2009", title: "Mozilla sponsors Rust", tag: "origin", detail: "Mozilla begins officially sponsoring the project, seeing it as a path to a safer, parallel browser engine." },
  { year: "2010", title: "Public announcement", tag: "origin", detail: "Rust is announced publicly. The compiler, originally written in OCaml, becomes self-hosting (written in Rust, on LLVM) around 2011." },
  { year: "2012–2014", title: "The great simplification", tag: "feature", detail: "Early Rust had green threads, a GC'd pointer type (@T) and typestate. These were removed in favour of ownership, borrowing and a minimal runtime — the core idea that defines Rust today." },
  { year: "2015", title: "Rust 1.0 — stability promise", tag: "release", detail: "Released 15 May 2015 with a commitment to backward compatibility. The 6-week release train (nightly → beta → stable) begins." },
  { year: "2016", title: "“Most loved” streak begins", tag: "ecosystem", detail: "Rust tops Stack Overflow's Developer Survey as the most loved/admired language — a streak it has kept every year since." },
  { year: "2017", title: "Firefox Quantum ships Rust", tag: "industry", detail: "Stylo, Servo's parallel CSS engine written in Rust, ships in Firefox 57 — proof that Rust works at browser scale." },
  { year: "2018", title: "Rust 2018 Edition", tag: "edition", detail: "Non-Lexical Lifetimes (smarter borrow checker), a simplified module system, `dyn Trait` syntax and `async` reserved as a keyword. Editions let the language evolve without breaking old code." },
  { year: "2019", title: "async / await stabilized", tag: "feature", detail: "Rust 1.39 ships async/await, unlocking a massive ecosystem of high-performance network services (Tokio, Hyper, later Axum)." },
  { year: "2020", title: "Mozilla layoffs → community resilience", tag: "ecosystem", detail: "Mozilla lays off much of the Servo team. The community and corporate users rally to secure Rust's independent future." },
  { year: "2021", title: "Rust Foundation + 2021 Edition", tag: "edition", detail: "The Rust Foundation is founded by AWS, Google, Huawei, Microsoft and Mozilla. The 2021 edition (Rust 1.56) adds disjoint closure captures, `IntoIterator` for arrays and format-string improvements." },
  { year: "2022", title: "Rust enters the Linux kernel", tag: "industry", detail: "Linux 6.1 merges initial Rust support — the first language besides C (and assembly) accepted into the kernel. Generic Associated Types (GATs) stabilize in 1.65." },
  { year: "2023", title: "async fn in traits", tag: "feature", detail: "Rust 1.75 stabilizes `async fn` and return-position `impl Trait` in traits. Ferrocene, a safety-qualified Rust toolchain (ISO 26262 / IEC 61508), becomes available." },
  { year: "2024", title: "Memory safety becomes policy", tag: "industry", detail: "The US White House ONCD urges a move to memory-safe languages. Google reports memory-safety bugs in Android falling sharply as new code is written in memory-safe languages like Rust." },
  { year: "2025", title: "Rust 2024 Edition", tag: "edition", detail: "Rust 1.85 ships the largest edition yet: `unsafe extern` blocks, RPIT lifetime capture rules, `gen` keyword reserved, async closures, and later let-chains in `if`/`while`." },
  { year: "Today", title: "Infrastructure language of the decade", tag: "ecosystem", detail: "Rust powers cloud hypervisors, proxies, databases, OS components, browsers, CLIs, blockchains, embedded firmware and the JS/Python tooling boom (Ruff, uv, Turbopack, Rolldown)." },
];

export const WHY = [
  { emoji: "🛡️", title: "Memory safety without GC", text: "Roughly 70% of serious security bugs in large C/C++ codebases (as reported by Microsoft and Google) are memory-safety bugs. Rust eliminates entire classes — use-after-free, double free, buffer overflows, data races — at compile time." },
  { emoji: "🚀", title: "C/C++-level performance", text: "No garbage collector, no runtime, zero-cost abstractions and LLVM optimizations. Predictable latency without GC pauses." },
  { emoji: "🧵", title: "Fearless concurrency", text: "Send/Sync and ownership turn data races into compile errors, so parallel code can be refactored with confidence." },
  { emoji: "🧰", title: "World-class tooling", text: "Cargo, crates.io, rustfmt, clippy, rust-analyzer, rustdoc and helpful compiler errors are part of the default experience." },
  { emoji: "🌍", title: "Runs everywhere", text: "From microcontrollers (no_std) to browsers (WebAssembly), servers, mobile, and the Linux & Windows kernels." },
  { emoji: "🤝", title: "Welcoming community", text: "Open RFC process, code of conduct, and an emphasis on documentation (“The Book”, Rust by Example, Rustlings)." },
];

export const WHAT = [
  { k: "Paradigm", v: "Multi-paradigm: imperative, functional, generic, concurrent" },
  { k: "Typing", v: "Static, strong, inferred; algebraic data types; traits" },
  { k: "Memory", v: "Ownership & borrowing; RAII; optional reference counting" },
  { k: "Compiler", v: "rustc on LLVM (Cranelift & GCC backends in progress)" },
  { k: "Package manager", v: "Cargo + crates.io" },
  { k: "Governance", v: "Rust Project teams + RFCs; Rust Foundation for stewardship" },
  { k: "Release cadence", v: "Stable every 6 weeks; editions every ~3 years (2015, 2018, 2021, 2024)" },
];

export const HOW = [
  { step: "RFC", text: "Anyone can propose a change via an RFC (Request for Comments) on GitHub; teams discuss in the open." },
  { step: "Nightly", text: "Accepted features land behind feature gates on nightly for real-world experimentation." },
  { step: "Stabilize", text: "After a Final Comment Period, the feature is stabilized and rides the train: nightly → beta → stable." },
  { step: "Editions", text: "Breaking-ish syntax changes are opt-in per crate via editions; crates of different editions interoperate seamlessly." },
  { step: "Crater", text: "Before releases, Crater compiles and tests the entire crates.io ecosystem to catch regressions." },
];
