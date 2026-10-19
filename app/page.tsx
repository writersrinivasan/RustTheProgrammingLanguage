"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Bug, History, Map, FlaskConical, Factory, Bot, Trophy } from "lucide-react";
import { useProgress, LEVELS } from "@/lib/progress";
import { CONCEPTS } from "@/lib/content/concepts";
import { CHALLENGES } from "@/lib/content/challenges";
import { FOUNDATION } from "@/lib/content/roadmap";
import { NUANCES } from "@/lib/content/nuances";
import { highlight } from "@/components/CodeBlock";
import { askAI } from "@/lib/progress";

const SECTIONS = [
  { href: "/learn", icon: BookOpen, title: "The In & Out of Rust", text: "15 interactive lessons from variables to unsafe — each with runnable code and quizzes.", grad: "from-rust-500 to-amber-400" },
  { href: "/nuances", icon: Bug, title: "Nuances & Gotchas", text: "The surprising corners: String vs &str, drop order, overflow, Send/Sync and more.", grad: "from-rose-500 to-pink-400" },
  { href: "/evolution", icon: History, title: "Why · What · How", text: "From Graydon's side project to the Linux kernel — how Rust evolved and why.", grad: "from-purple-500 to-fuchsia-400" },
  { href: "/roadmap", icon: Map, title: "Your Roadmap", text: "A 12-week foundation plus tracks for backend, systems, embedded, Wasm, data & more.", grad: "from-sky-500 to-cyan-400" },
  { href: "/playground", icon: FlaskConical, title: "Playground & Challenges", text: "Real compiler, hidden test cases, and side-by-side notes that explain your mistakes.", grad: "from-emerald-500 to-teal-400" },
  { href: "/industry", icon: Factory, title: "Rust in Industry", text: "How AWS, Cloudflare, Discord, Microsoft, Google and others use Rust in production.", grad: "from-amber-500 to-yellow-300" },
];

const HERO_CODE = `fn main() {
    let crab = String::from("Ferris");
    let greet = |who: &str| format!("Hello, {who}! 🦀");

    // borrow, don't move
    println!("{}", greet(&crab));

    let langs = ["C", "C++", "Rust"];
    let safe: Vec<_> = langs.iter()
        .filter(|l| **l == "Rust")
        .collect();
    println!("memory safe & fast: {safe:?}");
}`;

export default function Home() {
  const { state, xp, level, nextLevel, streak, hydrated } = useProgress();
  const [day, setDay] = useState(0);
  useEffect(() => setDay(new Date().getDate()), []);
  const fact = NUANCES[day % NUANCES.length];

  const stats = [
    { label: "Lessons", done: state.concepts.length, total: CONCEPTS.length, color: "from-rust-500 to-amber-400" },
    { label: "Challenges", done: state.challenges.length, total: CHALLENGES.length, color: "from-emerald-500 to-teal-400" },
    { label: "Roadmap stages", done: state.roadmap.filter((r) => r.startsWith("f")).length, total: FOUNDATION.length, color: "from-sky-500 to-cyan-400" },
    { label: "Nuances", done: state.nuances.length, total: NUANCES.length, color: "from-rose-500 to-pink-400" },
  ];

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 px-6 py-12 sm:px-12 sm:py-16">
        <div className="grid-lines absolute inset-0" aria-hidden />
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-rust-500/30 blur-3xl" aria-hidden />
        <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-purple-600/25 blur-3xl" aria-hidden />
        <div className="absolute bottom-0 left-1/2 h-60 w-60 rounded-full bg-cyan-500/15 blur-3xl" aria-hidden />

        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-rust-400/30 bg-rust-500/10 px-3 py-1 text-xs font-semibold text-rust-200">
              🦀 The end-to-end Rust learning portal
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Forge your <span className="text-gradient">Rust</span> superpowers.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/65">
              Learn the language that is fast, memory-safe and fearless — through lessons, gotchas, history, guided roadmaps, a real compiler playground with tests, and an AI tutor that speaks only Rust.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/roadmap" className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-rust-500 via-rose-500 to-purple-600 px-5 py-3 font-semibold shadow-lg shadow-rust-600/30 transition hover:brightness-110">
                Start the journey <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </Link>
              <Link href="/playground" className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-semibold transition hover:bg-white/10">
                Open Playground
              </Link>
              <button onClick={() => askAI("What makes Rust different from C++ and Go? Give me a crisp overview.")} className="flex items-center gap-2 rounded-xl border border-purple-400/30 bg-purple-500/10 px-5 py-3 font-semibold text-purple-200 transition hover:bg-purple-500/20">
                <Bot size={18} /> Ask Ferris AI
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="animate-float absolute -right-2 -top-8 text-6xl drop-shadow-2xl sm:text-7xl" aria-hidden>
              🦀
            </div>
            <div className="glass overflow-hidden rounded-2xl shadow-2xl shadow-black/50">
              <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-rose-500" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="ml-3 font-mono text-xs text-white/40">src/main.rs</span>
              </div>
              <pre className="code-block !rounded-none !border-0 !bg-transparent">{highlight(HERO_CODE)}</pre>
              <div className="border-t border-white/5 bg-black/30 px-4 py-3 font-mono text-xs text-emerald-300">
                <p>Hello, Ferris! 🦀</p>
                <p>memory safe &amp; fast: [&quot;Rust&quot;]</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ["0", "garbage collector pauses"],
            ["~70%", "of big C/C++ CVEs are memory bugs"],
            ["2015", "Rust 1.0 released"],
            ["#1", "most admired language, yearly"],
          ].map(([n, l]) => (
            <div key={l} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-gradient text-3xl font-extrabold">{n}</p>
              <p className="mt-1 text-xs text-white/50">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Progress dashboard */}
      {hydrated && (
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-600/20 via-ink-900 to-rust-600/20 p-6 lg:col-span-1">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/50">
              <Trophy size={16} /> Your forge
            </p>
            <div className="mt-4 flex items-center gap-4">
              <span className="text-5xl">{level.emoji}</span>
              <div>
                <p className="text-xl font-bold">{level.name}</p>
                <p className="text-sm text-white/50">
                  {xp} XP {nextLevel ? `· ${nextLevel.min - xp} to ${nextLevel.name}` : "· max level!"}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-amber-200">🔥 {streak}-day streak</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {LEVELS.map((l) => (
                <span key={l.name} title={l.name} className={`grid h-8 w-8 place-items-center rounded-lg text-base ${xp >= l.min ? "bg-white/15" : "bg-white/5 opacity-30 grayscale"}`}>
                  {l.emoji}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-baseline justify-between">
                  <p className="font-semibold">{s.label}</p>
                  <p className="text-sm text-white/50">
                    {s.done}/{s.total}
                  </p>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full rounded-full bg-gradient-to-r ${s.color} transition-all`} style={{ width: `${(s.done / s.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sections */}
      <section>
        <h2 className="text-2xl font-extrabold sm:text-3xl">Everything you need, in one forge</h2>
        <p className="mt-2 text-white/55">Pick a door. Every path earns XP.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((s) => (
            <Link key={s.href} href={s.href} className="glow-border group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:bg-white/[0.06]">
              <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${s.grad} opacity-20 blur-2xl transition group-hover:opacity-40`} />
              <span className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${s.grad} shadow-lg`}>
                <s.icon size={22} />
              </span>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-white/60">{s.text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-rust-300">
                Explore <ArrowRight size={14} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Nuance of the day */}
      <section className="grid gap-6 rounded-2xl border border-white/10 bg-gradient-to-r from-rose-600/15 via-ink-900 to-cyan-600/15 p-6 sm:p-8 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-300">Nuance of the day</p>
          <h3 className="mt-2 text-2xl font-bold">{fact.title}</h3>
          <p className="mt-3 text-white/65">{fact.surprise}</p>
          <p className="mt-3 text-sm text-white/50">{fact.why}</p>
          <Link href={`/nuances#${fact.id}`} className="mt-5 inline-flex items-center gap-1 font-semibold text-rose-300">
            See all nuances <ArrowRight size={14} />
          </Link>
        </div>
        <pre className="code-block self-center">{highlight(fact.right)}</pre>
      </section>
    </div>
  );
}
