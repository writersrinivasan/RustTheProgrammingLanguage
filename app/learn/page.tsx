"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Lightbulb, Bot, ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import CodeBlock from "@/components/CodeBlock";
import Quiz from "@/components/Quiz";
import { CONCEPTS } from "@/lib/content/concepts";
import { useProgress, askAI, XP } from "@/lib/progress";

const LEVEL_COLORS = {
  Beginner: "bg-emerald-500/15 text-emerald-300",
  Intermediate: "bg-amber-500/15 text-amber-300",
  Advanced: "bg-rose-500/15 text-rose-300",
};

function Inline({ text }: { text: string }) {
  // render `code` spans inside prose
  return (
    <>
      {text.split(/(`[^`]+`)/g).map((part, i) =>
        part.startsWith("`") ? (
          <code key={i} className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-rust-200">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function LearnPage() {
  const { state, toggle } = useProgress();
  const [activeId, setActiveId] = useState(CONCEPTS[0].id);

  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.slice(1);
      if (CONCEPTS.some((c) => c.id === h)) setActiveId(h);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const idx = CONCEPTS.findIndex((c) => c.id === activeId);
  const c = CONCEPTS[idx];
  const done = state.concepts.includes(c.id);

  const go = (id: string) => {
    setActiveId(id);
    history.replaceState(null, "", `#${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <PageHeader
        eyebrow="The in & out of Rust"
        title={
          <>
            Learn Rust <span className="text-gradient">concept by concept</span>
          </>
        }
        subtitle="Every lesson has an analogy, runnable examples (hit “Try it” to open them in the Playground), key takeaways and a quiz. Complete lessons to earn XP."
      />

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            {CONCEPTS.map((k, i) => {
              const isDone = state.concepts.includes(k.id);
              const active = k.id === activeId;
              return (
                <button
                  key={k.id}
                  onClick={() => go(k.id)}
                  className={`flex shrink-0 items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                    active ? "border-rust-400/50 bg-rust-500/10" : "border-transparent hover:bg-white/5"
                  }`}
                >
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${k.gradient} text-base`}>{k.emoji}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {i + 1}. {k.title}
                    </span>
                    <span className="text-[11px] text-white/40">{k.level}</span>
                  </span>
                  {isDone ? <CheckCircle2 size={16} className="shrink-0 text-emerald-400" /> : <Circle size={16} className="shrink-0 text-white/20" />}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Lesson */}
        <article key={c.id} className="animate-pop min-w-0 space-y-8">
          <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.gradient} p-[1px]`}>
            <div className="rounded-2xl bg-ink-900/90 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-4xl">{c.emoji}</span>
                <h2 className="text-2xl font-extrabold sm:text-3xl">{c.title}</h2>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${LEVEL_COLORS[c.level]}`}>{c.level}</span>
              </div>
              <p className="mt-4 text-lg text-white/75">
                <Inline text={c.summary} />
              </p>
              <div className="mt-5 flex gap-3 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                <Lightbulb size={18} className="mt-0.5 shrink-0 text-amber-300" />
                <p>
                  <b>Analogy: </b>
                  <Inline text={c.analogy} />
                </p>
              </div>
            </div>
          </div>

          {c.sections.map((s) => (
            <section key={s.heading} className="space-y-3">
              <h3 className="text-xl font-bold">{s.heading}</h3>
              <p className="text-white/70">
                <Inline text={s.body} />
              </p>
              {s.code && <CodeBlock code={s.code} title="main.rs" />}
            </section>
          ))}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="text-lg font-bold">🔑 Key takeaways</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {c.keyPoints.map((k) => (
                <li key={k} className="flex gap-2 text-sm text-white/75">
                  <span className="text-rust-400">▸</span>
                  <span>
                    <Inline text={k} />
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-3 text-lg font-bold">🧠 Check yourself</h3>
            <Quiz questions={c.quiz} />
          </section>

          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-ink-800 to-ink-900 p-4">
            <button
              onClick={() => toggle("concepts", c.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold transition ${
                done ? "bg-emerald-500/20 text-emerald-300" : "bg-gradient-to-r from-rust-500 to-rose-500 text-white"
              }`}
            >
              <CheckCircle2 size={18} /> {done ? "Completed" : `Mark complete (+${XP.concept} XP)`}
            </button>
            <button
              onClick={() => askAI(`I'm studying "${c.title}" in Rust. Give me a deeper explanation with one more example and the most common mistake beginners make.`)}
              className="flex items-center gap-2 rounded-xl border border-purple-400/30 bg-purple-500/10 px-4 py-2.5 font-semibold text-purple-200 hover:bg-purple-500/20"
            >
              <Bot size={18} /> Go deeper with AI
            </button>
            <div className="ml-auto flex gap-2">
              {idx > 0 && (
                <button onClick={() => go(CONCEPTS[idx - 1].id)} className="flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2.5 text-sm hover:bg-white/5">
                  <ChevronLeft size={16} /> Prev
                </button>
              )}
              {idx < CONCEPTS.length - 1 && (
                <button onClick={() => go(CONCEPTS[idx + 1].id)} className="flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2.5 text-sm hover:bg-white/5">
                  Next <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
