"use client";

import { useState } from "react";
import { AlertTriangle, Wrench, TrendingUp, Bot } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { USE_CASES, type UseCase } from "@/lib/content/industry";
import { askAI } from "@/lib/progress";

const DOMAIN_GRAD: Record<UseCase["domain"], string> = {
  Cloud: "from-sky-500 to-indigo-500",
  Networking: "from-orange-500 to-amber-400",
  "OS & Systems": "from-slate-400 to-zinc-500",
  Browsers: "from-rust-500 to-rose-500",
  "Dev Tools": "from-emerald-500 to-teal-400",
  Data: "from-cyan-500 to-blue-500",
  Security: "from-purple-500 to-fuchsia-500",
  "Fintech & Web3": "from-yellow-400 to-orange-500",
  Embedded: "from-lime-500 to-green-500",
};

const PATTERNS = [
  { emoji: "🔁", title: "Rewrite the hot path", text: "Teams rarely rewrite everything. They move the CPU- or latency-critical service (a proxy, a cache, a parser) to Rust first." },
  { emoji: "🧱", title: "Shared core, many shells", text: "One Rust core compiled for iOS, Android, desktop and Wasm, wrapped with native UIs." },
  { emoji: "🛡️", title: "New code in memory-safe languages", text: "Instead of rewriting legacy C/C++, write new components in Rust — vulnerability rates drop as the share of new safe code grows." },
  { emoji: "🐍", title: "Accelerate Python/JS", text: "Native extensions via PyO3 / napi-rs give 10–100× speedups without changing the user-facing language." },
];

export default function IndustryPage() {
  const domains = ["All", ...Object.keys(DOMAIN_GRAD)] as ("All" | UseCase["domain"])[];
  const [domain, setDomain] = useState<(typeof domains)[number]>("All");
  const list = USE_CASES.filter((u) => domain === "All" || u.domain === domain);

  return (
    <div>
      <PageHeader
        eyebrow="Rust in industry"
        title={
          <>
            Where Rust <span className="text-gradient">runs the world</span>
          </>
        }
        subtitle="Real-world case studies: the problem each team faced, why they chose Rust, and what happened. Use them as blueprints for your own projects and interviews."
      />

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PATTERNS.map((p) => (
          <div key={p.title} className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-5">
            <span className="text-3xl">{p.emoji}</span>
            <h3 className="mt-2 font-bold">{p.title}</h3>
            <p className="mt-1 text-sm text-white/60">{p.text}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {domains.map((d) => (
          <button
            key={d}
            onClick={() => setDomain(d)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${domain === d ? "bg-white text-ink-950" : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"}`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {list.map((u) => (
          <div key={u.company + u.product} className="glow-border group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <div className={`flex items-center gap-3 bg-gradient-to-r ${DOMAIN_GRAD[u.domain]} p-4`}>
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-black/25 text-2xl">{u.emoji}</span>
              <div className="min-w-0">
                <p className="truncate font-extrabold">{u.company}</p>
                <p className="truncate text-sm text-white/85">{u.product}</p>
              </div>
            </div>
            <div className="flex flex-1 flex-col space-y-3 p-5 text-sm">
              <p className="flex gap-2 text-white/70">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-300" />
                <span>
                  <b className="text-white">Problem: </b>
                  {u.problem}
                </span>
              </p>
              <p className="flex gap-2 text-white/70">
                <Wrench size={16} className="mt-0.5 shrink-0 text-rust-300" />
                <span>
                  <b className="text-white">Why Rust: </b>
                  {u.whyRust}
                </span>
              </p>
              <p className="flex gap-2 text-white/70">
                <TrendingUp size={16} className="mt-0.5 shrink-0 text-emerald-300" />
                <span>
                  <b className="text-white">Outcome: </b>
                  {u.outcome}
                </span>
              </p>
              <div className="flex-1" />
              <button
                onClick={() => askAI(`Explain the Rust architecture behind ${u.company}'s ${u.product}: which Rust features and crates make this kind of system possible, and show a tiny illustrative Rust snippet of the core idea.`)}
                className="flex items-center gap-1.5 self-start rounded-lg bg-purple-500/15 px-3 py-1.5 text-xs font-semibold text-purple-200 opacity-80 transition hover:bg-purple-500/25 group-hover:opacity-100"
              >
                <Bot size={14} /> How would this look in Rust?
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-white/35">
        Case studies summarised from public engineering blogs and talks by each organisation. Figures are approximate and as reported publicly.
      </p>
    </div>
  );
}
