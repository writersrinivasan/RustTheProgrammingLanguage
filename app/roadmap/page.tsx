"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Circle, ExternalLink, Target, Hammer, Bot } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { FOUNDATION, TRACKS } from "@/lib/content/roadmap";
import { CONCEPTS } from "@/lib/content/concepts";
import { useProgress, askAI, XP } from "@/lib/progress";

export default function RoadmapPage() {
  const { state, toggle } = useProgress();
  const [trackId, setTrackId] = useState(TRACKS[0].id);
  const track = TRACKS.find((t) => t.id === trackId)!;
  const doneCount = FOUNDATION.filter((s) => state.roadmap.includes(s.id)).length;
  const trackDone = track.steps.filter((_, i) => state.roadmap.includes(`${track.id}-${i}`)).length;

  return (
    <div>
      <PageHeader
        eyebrow="Step-by-step roadmap"
        title={
          <>
            From zero to <span className="text-gradient">production Rust</span>
          </>
        }
        subtitle="Phase 1 is the shared foundation every Rustacean needs. Phase 2 specialises by what you want to build. Tick off stages as you go — each one earns XP."
      >
        <div className="max-w-md">
          <div className="flex justify-between text-sm text-white/60">
            <span>Foundation progress</span>
            <span>
              {doneCount}/{FOUNDATION.length}
            </span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-rust-500 via-rose-500 to-purple-500 transition-all" style={{ width: `${(doneCount / FOUNDATION.length) * 100}%` }} />
          </div>
        </div>
      </PageHeader>

      <h2 className="mb-6 text-2xl font-extrabold">
        <span className="mr-2 rounded-lg bg-rust-500/20 px-2 py-1 text-base text-rust-300">Phase 1</span> The Foundation
      </h2>

      <ol className="relative space-y-5 before:absolute before:bottom-4 before:left-[19px] before:top-4 before:w-0.5 before:bg-gradient-to-b before:from-rust-500 before:via-purple-500 before:to-cyan-500">
        {FOUNDATION.map((s, i) => {
          const done = state.roadmap.includes(s.id);
          return (
            <li key={s.id} className="relative pl-14">
              <button
                onClick={() => toggle("roadmap", s.id)}
                className={`absolute left-0 top-4 grid h-10 w-10 place-items-center rounded-full border-2 font-bold transition ${
                  done ? "border-emerald-400 bg-emerald-500 text-white" : "border-white/20 bg-ink-900 text-white/70 hover:border-rust-400"
                }`}
                title={done ? "Mark incomplete" : `Mark complete (+${XP.roadmap} XP)`}
              >
                {done ? <CheckCircle2 size={20} /> : i + 1}
              </button>
              <div className={`rounded-2xl border p-5 transition ${done ? "border-emerald-500/30 bg-emerald-500/[0.05]" : "border-white/10 bg-white/[0.03]"}`}>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-bold">{s.title}</h3>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/60">{s.weeks}</span>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/40">
                      <Target size={13} /> Goals
                    </p>
                    <ul className="space-y-1 text-sm text-white/75">
                      {s.goals.map((g) => (
                        <li key={g}>• {g}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/40">
                        <Hammer size={13} /> Checkpoint project
                      </p>
                      <p className="text-sm text-white/75">{s.project}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {s.concepts.map((cid) => {
                        const c = CONCEPTS.find((x) => x.id === cid)!;
                        return (
                          <Link key={cid} href={`/learn#${cid}`} className="rounded-lg bg-rust-500/15 px-2.5 py-1 text-xs font-semibold text-rust-200 hover:bg-rust-500/25">
                            {c.emoji} {c.title}
                            {state.concepts.includes(cid) && " ✓"}
                          </Link>
                        );
                      })}
                      {s.resources.map((r) => (
                        <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1 text-xs text-white/70 hover:bg-white/10">
                          {r.label} <ExternalLink size={11} />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <h2 className="mb-2 mt-16 text-2xl font-extrabold">
        <span className="mr-2 rounded-lg bg-purple-500/20 px-2 py-1 text-base text-purple-300">Phase 2</span> Choose your track
      </h2>
      <p className="mb-6 text-white/55">Rust for your use case — the crates, steps and capstone project that matter.</p>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {TRACKS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTrackId(t.id)}
            className={`rounded-2xl border p-3 text-center transition ${
              t.id === trackId ? `border-transparent bg-gradient-to-br ${t.gradient} shadow-lg` : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]"
            }`}
          >
            <span className="text-2xl">{t.emoji}</span>
            <p className="mt-1 text-xs font-semibold leading-tight">{t.name}</p>
          </button>
        ))}
      </div>

      <div key={track.id} className="animate-pop overflow-hidden rounded-2xl border border-white/10">
        <div className={`bg-gradient-to-r ${track.gradient} p-6`}>
          <p className="text-3xl">{track.emoji}</p>
          <h3 className="mt-2 text-2xl font-extrabold">{track.name}</h3>
          <p className="mt-1 text-white/85">{track.who}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {track.crates.map((c) => (
              <a key={c} href={`https://docs.rs/${c.replace("!", "")}`} target="_blank" rel="noreferrer" className="rounded-lg bg-black/25 px-2.5 py-1 font-mono text-xs hover:bg-black/40">
                {c}
              </a>
            ))}
          </div>
        </div>
        <div className="space-y-3 bg-ink-900/80 p-6">
          <p className="text-sm text-white/50">
            {trackDone}/{track.steps.length} steps done
          </p>
          {track.steps.map((st, i) => {
            const id = `${track.id}-${i}`;
            const done = state.roadmap.includes(id);
            return (
              <button
                key={id}
                onClick={() => toggle("roadmap", id)}
                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${done ? "border-emerald-500/30 bg-emerald-500/[0.06]" : "border-white/10 hover:bg-white/[0.04]"}`}
              >
                {done ? <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-400" /> : <Circle size={20} className="mt-0.5 shrink-0 text-white/30" />}
                <span>
                  <span className="font-semibold">
                    Step {i + 1}: {st.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-white/60">{st.detail}</span>
                </span>
              </button>
            );
          })}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4">
            <span className="text-2xl">🏆</span>
            <p className="flex-1 text-sm text-amber-100">
              <b>Capstone:</b> {track.capstone}
            </p>
            <button
              onClick={() => askAI(`I'm on the "${track.name}" Rust track. Break this capstone into a week-by-week plan with the crates to use and the key Rust concepts I'll practice: ${track.capstone}`)}
              className="flex items-center gap-1.5 rounded-lg bg-purple-500/20 px-3 py-2 text-sm font-semibold text-purple-200 hover:bg-purple-500/30"
            >
              <Bot size={15} /> Plan it with AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
