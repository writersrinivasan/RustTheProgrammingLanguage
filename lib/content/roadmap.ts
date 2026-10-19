export type Stage = {
  id: string;
  title: string;
  weeks: string;
  goals: string[];
  concepts: string[]; // concept ids in /learn
  project: string;
  resources: { label: string; url: string }[];
};

export const FOUNDATION: Stage[] = [
  {
    id: "f1",
    title: "Set up your forge",
    weeks: "Day 1",
    goals: ["Install via rustup", "Configure VS Code + rust-analyzer", "cargo new / run / build / check", "Read compiler errors top-down"],
    concepts: [],
    project: "Hello, Ferris! — print an ASCII crab with your name from command-line args.",
    resources: [
      { label: "rustup.rs", url: "https://rustup.rs" },
      { label: "The Book ch.1", url: "https://doc.rust-lang.org/book/ch01-00-getting-started.html" },
    ],
  },
  {
    id: "f2",
    title: "Syntax & core types",
    weeks: "Week 1",
    goals: ["Variables, mutability, shadowing", "Scalars, tuples, arrays", "Functions & expressions", "if / loop / while / for"],
    concepts: ["basics"],
    project: "Temperature converter & FizzBuzz with tests.",
    resources: [{ label: "Rustlings", url: "https://github.com/rust-lang/rustlings" }],
  },
  {
    id: "f3",
    title: "Ownership & borrowing (the big one)",
    weeks: "Week 2",
    goals: ["Moves vs copies", "& and &mut rules", "Slices: &str, &[T]", "Fight — then befriend — the borrow checker"],
    concepts: ["ownership", "borrowing"],
    project: "Word counter: read text, return the longest word as &str without cloning.",
    resources: [{ label: "The Book ch.4", url: "https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html" }],
  },
  {
    id: "f4",
    title: "Modeling data",
    weeks: "Week 3",
    goals: ["Structs + impl", "Enums with data", "match, if let, let-else", "Option instead of null"],
    concepts: ["structs-enums"],
    project: "A to-do CLI state machine: Todo { Pending, Done, Archived }.",
    resources: [{ label: "Rust by Example", url: "https://doc.rust-lang.org/rust-by-example/" }],
  },
  {
    id: "f5",
    title: "Errors, collections & iterators",
    weeks: "Week 4",
    goals: ["Result + ?", "Vec, HashMap, String APIs", "Iterator adapters & closures", "Custom error enums"],
    concepts: ["errors", "collections-iterators"],
    project: "CSV grade-book analyzer: parse lines, report averages, handle bad rows gracefully.",
    resources: [{ label: "std docs", url: "https://doc.rust-lang.org/std/" }],
  },
  {
    id: "f6",
    title: "Traits, generics & lifetimes",
    weeks: "Weeks 5–6",
    goals: ["Define/implement traits", "Generic functions & bounds", "impl Trait vs dyn Trait", "Lifetime annotations"],
    concepts: ["traits-generics", "lifetimes"],
    project: "Pluggable shape renderer: trait Shape with multiple impls + a generic total_area.",
    resources: [{ label: "The Book ch.10", url: "https://doc.rust-lang.org/book/ch10-00-generics.html" }],
  },
  {
    id: "f7",
    title: "Project structure & testing",
    weeks: "Week 7",
    goals: ["Modules & visibility", "Cargo features & workspaces", "Unit, integration & doc tests", "clippy + rustfmt in CI"],
    concepts: ["modules-cargo", "testing"],
    project: "Publish-ready library crate with docs, tests and a GitHub Actions pipeline.",
    resources: [{ label: "Cargo Book", url: "https://doc.rust-lang.org/cargo/" }],
  },
  {
    id: "f8",
    title: "Smart pointers & concurrency",
    weeks: "Weeks 8–9",
    goals: ["Box, Rc, Arc, RefCell", "Threads, channels, Mutex", "Scoped threads", "Rayon for data-parallelism"],
    concepts: ["smart-pointers", "concurrency"],
    project: "Parallel file hasher: walk a directory and hash files using a thread pool.",
    resources: [{ label: "Rust Atomics and Locks", url: "https://marabos.nl/atomics/" }],
  },
  {
    id: "f9",
    title: "Async Rust",
    weeks: "Weeks 10–11",
    goals: ["Futures & executors", "Tokio tasks, select!, join!", "Async I/O & timeouts", "Avoid blocking the runtime"],
    concepts: ["async"],
    project: "Concurrent URL health-checker with timeouts and a summary report.",
    resources: [{ label: "Tokio tutorial", url: "https://tokio.rs/tokio/tutorial" }],
  },
  {
    id: "f10",
    title: "Advanced: macros, unsafe & FFI",
    weeks: "Week 12+",
    goals: ["macro_rules! & derive macros", "Unsafe superpowers & invariants", "FFI with C / Python", "Miri, sanitizers, profiling"],
    concepts: ["macros", "unsafe-ffi"],
    project: "Wrap a C library in a safe Rust API, or expose Rust to Python with PyO3.",
    resources: [
      { label: "The Rustonomicon", url: "https://doc.rust-lang.org/nomicon/" },
      { label: "The Little Book of Rust Macros", url: "https://veykril.github.io/tlborm/" },
    ],
  },
];

export type Track = {
  id: string;
  name: string;
  emoji: string;
  gradient: string;
  who: string;
  crates: string[];
  steps: { title: string; detail: string }[];
  capstone: string;
};

export const TRACKS: Track[] = [
  {
    id: "backend",
    name: "Backend & APIs",
    emoji: "🌐",
    gradient: "from-sky-500 to-indigo-500",
    who: "Web/backend devs coming from Node, Go, Java or Python.",
    crates: ["tokio", "axum", "serde", "sqlx", "tower", "tracing", "reqwest"],
    steps: [
      { title: "Serde everywhere", detail: "Derive Serialize/Deserialize, JSON ↔ structs, validation." },
      { title: "Axum routing & extractors", detail: "Path, Query, Json, State; shared app state with Arc." },
      { title: "Database with sqlx", detail: "Compile-time checked SQL, pools, migrations, transactions." },
      { title: "Middleware with tower", detail: "Auth, CORS, rate limiting, timeouts, tracing spans." },
      { title: "Errors as responses", detail: "Implement IntoResponse for your error enum." },
      { title: "Ship it", detail: "Multi-stage Docker build, distroless image, health checks, metrics." },
    ],
    capstone: "A URL shortener / task API with JWT auth, Postgres, OpenAPI docs and load tests.",
  },
  {
    id: "systems",
    name: "Systems & CLI tools",
    emoji: "🖥️",
    gradient: "from-rust-500 to-amber-500",
    who: "C/C++ developers, DevOps and tooling engineers.",
    crates: ["clap", "anyhow", "thiserror", "walkdir", "rayon", "indicatif", "crossterm"],
    steps: [
      { title: "Argument parsing", detail: "clap derive API, subcommands, env-var fallbacks." },
      { title: "Files & processes", detail: "std::fs, BufReader, std::process::Command, exit codes." },
      { title: "Errors for humans", detail: "anyhow::Context for rich error chains." },
      { title: "Performance", detail: "Profiling with perf/flamegraph, rayon parallelism, avoiding allocations." },
      { title: "Cross-compile & release", detail: "cargo-dist / cross, static musl binaries, Homebrew taps." },
    ],
    capstone: "Build your own `grep`/`ripgrep-lite` with parallel search, colours and benchmarks.",
  },
  {
    id: "embedded",
    name: "Embedded & IoT",
    emoji: "🔌",
    gradient: "from-emerald-500 to-lime-500",
    who: "Firmware engineers and hardware hobbyists.",
    crates: ["embedded-hal", "embassy", "probe-rs", "defmt", "heapless", "rtic"],
    steps: [
      { title: "no_std fundamentals", detail: "core vs alloc vs std, panic handlers, memory.x linker scripts." },
      { title: "HAL & PACs", detail: "Peripheral Access Crates, embedded-hal traits, type-state pins." },
      { title: "Async on bare metal", detail: "Embassy executors, timers, interrupts without an RTOS." },
      { title: "Flash & debug", detail: "probe-rs, defmt logging, RTT." },
      { title: "Safety", detail: "Critical sections, static allocation with heapless." },
    ],
    capstone: "A sensor node (e.g. RP2040/ESP32) that reads temperature and publishes over Wi-Fi/BLE.",
  },
  {
    id: "wasm",
    name: "WebAssembly & Frontend",
    emoji: "🕸️",
    gradient: "from-violet-500 to-fuchsia-500",
    who: "Frontend devs needing speed, or full-stack Rust fans.",
    crates: ["wasm-bindgen", "wasm-pack", "web-sys", "leptos", "yew", "dioxus", "trunk"],
    steps: [
      { title: "Rust → Wasm basics", detail: "wasm32 target, wasm-bindgen exports, JS interop." },
      { title: "Hot paths in Wasm", detail: "Image processing, parsing, crypto called from a JS app." },
      { title: "Full-stack frameworks", detail: "Leptos / Dioxus signals, SSR + hydration." },
      { title: "Size & speed", detail: "wasm-opt, lto, opt-level='z', avoiding panics/formatting bloat." },
    ],
    capstone: "A browser image-filter app with Rust/Wasm doing the pixel work.",
  },
  {
    id: "data",
    name: "Data, ML & Python interop",
    emoji: "📊",
    gradient: "from-cyan-500 to-teal-500",
    who: "Data engineers and ML practitioners.",
    crates: ["polars", "arrow", "datafusion", "pyo3", "maturin", "candle", "ndarray"],
    steps: [
      { title: "DataFrames", detail: "Polars lazy API, expressions, query optimization." },
      { title: "Arrow & DataFusion", detail: "Columnar memory, SQL query engines." },
      { title: "Speed up Python", detail: "PyO3 + maturin to ship native Python extensions." },
      { title: "Inference", detail: "Candle / ort for running models without Python." },
    ],
    capstone: "A Python package with a Rust core that parses and aggregates large log files 50× faster.",
  },
  {
    id: "gamedev",
    name: "Game Development",
    emoji: "🎮",
    gradient: "from-pink-500 to-rose-500",
    who: "Game devs and creative coders.",
    crates: ["bevy", "macroquad", "wgpu", "rapier", "glam"],
    steps: [
      { title: "ECS thinking", detail: "Entities, Components, Systems, Resources in Bevy." },
      { title: "Rendering", detail: "Sprites, cameras, shaders; wgpu under the hood." },
      { title: "Physics & input", detail: "Rapier physics, input mapping, collisions." },
      { title: "Ship to web", detail: "Compile your game to Wasm and host it." },
    ],
    capstone: "A 2D arcade game with physics, sound and a WebAssembly build.",
  },
  {
    id: "blockchain",
    name: "Blockchain & Security",
    emoji: "⛓️",
    gradient: "from-amber-500 to-orange-600",
    who: "Smart contract and security engineers.",
    crates: ["anchor-lang", "solana-program", "ink!", "ring", "rustls", "ed25519-dalek"],
    steps: [
      { title: "Crypto primitives", detail: "Hashing, signatures, constant-time comparisons." },
      { title: "Smart contracts", detail: "Solana programs with Anchor; Substrate/ink! on Polkadot." },
      { title: "Security mindset", detail: "Fuzzing with cargo-fuzz, auditing unsafe, supply-chain (cargo-audit, cargo-deny)." },
    ],
    capstone: "An on-chain escrow program with full test coverage and a fuzzing harness.",
  },
];
