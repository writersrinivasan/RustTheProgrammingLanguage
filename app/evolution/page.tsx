"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { TIMELINE, WHY, WHAT, HOW, type Milestone } from "@/lib/content/evolution";

const TAG_STYLE: Record<Milestone["tag"], { dot: string; chip: string }> = {
  origin: { dot: "bg-amber-400", chip: "bg-amber-400/15 text-amber-300" },
  release: { dot: "bg-rust-400", chip: "bg-rust-500/15 text-rust-300" },
  edition: { dot: "bg-purple-400", chip: "bg-purple-500/15 text-purple-300" },
  feature: { dot: "bg-cyan-400", chip: "bg-cyan-500/15 text-cyan-300" },
  ecosystem: { dot: "bg-emerald-400", chip: "bg-emerald-500/15 text-emerald-300" },
  industry: { dot: "bg-rose-400", chip: "bg-rose-500/15 text-rose-300" },
};

const TABS = ["Why", "What", "How it evolved"] as const;

export default function EvolutionPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Why");
  const [filter, setFilter] = useState<Milestone["tag"] | "all">("all");

  return (
    <div>
      <PageHeader
        eyebrow="Why · What · How"
        title={
          <>
            How Rust <span className="text-gradient">came to be</span>
          </>
        }
        subtitle="Rust started as one engineer's frustration with crashing software and became the language that big tech, governments and kernel developers trust for safety-critical code."
      />

      <div className="mb-8 inline-flex rounded-2xl border border-white/10 bg-white/5 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${tab === t ? "bg-gradient-to-r from-rust-500 to-purple-600 text-white" : "text-white/60 hover:text-white"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Why" && (
        <div className="animate-pop grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WHY.map((w) => (
            <div key={w.title} className="glow-border rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <span className="text-4xl">{w.emoji}</span>
              <h3 className="mt-3 text-lg font-bold">{w.title}</h3>
              <p className="mt-2 text-sm text-white/65">{w.text}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "What" && (
        <div className="animate-pop overflow-hidden rounded-2xl border border-white/10">
          {WHAT.map((w, i) => (
            <div key={w.k} className={`grid gap-1 px-6 py-4 sm:grid-cols-[200px_1fr] ${i % 2 ? "bg-white/[0.02]" : "bg-white/[0.05]"}`}>
              <span className="font-semibold text-rust-300">{w.k}</span>
              <span className="text-white/75">{w.v}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "How it evolved" && (
        <div className="animate-pop grid gap-4 md:grid-cols-5">
          {HOW.map((h, i) => (
            <div key={h.step} className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-5">
              <span className="text-gradient text-3xl font-black">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 font-bold">{h.step}</h3>
              <p className="mt-2 text-sm text-white/60">{h.text}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="mb-2 mt-16 text-2xl font-extrabold sm:text-3xl">The timeline</h2>
      <div className="mb-8 flex flex-wrap gap-2">
        {(["all", ...Object.keys(TAG_STYLE)] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t as Milestone["tag"] | "all")}
            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${
              filter === t ? "bg-white text-ink-950" : "border border-white/10 text-white/60 hover:bg-white/5"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <ol className="relative ml-3 border-l-2 border-dashed border-white/10 sm:ml-6">
        {TIMELINE.filter((m) => filter === "all" || m.tag === filter).map((m) => (
          <li key={m.year + m.title} className="relative mb-8 pl-8 sm:pl-10">
            <span className={`absolute -left-[9px] top-1.5 h-4 w-4 rounded-full ring-4 ring-ink-950 ${TAG_STYLE[m.tag].dot}`} />
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.06]">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-gradient text-2xl font-black">{m.year}</span>
                <h3 className="text-lg font-bold">{m.title}</h3>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${TAG_STYLE[m.tag].chip}`}>{m.tag}</span>
              </div>
              <p className="mt-2 text-white/65">{m.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
