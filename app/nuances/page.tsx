"use client";

import { useState } from "react";
import { Eye, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import CodeBlock from "@/components/CodeBlock";
import { NUANCES, type Nuance } from "@/lib/content/nuances";
import { useProgress, XP } from "@/lib/progress";

const CAT_COLORS: Record<Nuance["category"], string> = {
  Ownership: "from-rust-500 to-amber-400",
  Types: "from-sky-500 to-cyan-400",
  Strings: "from-emerald-500 to-lime-400",
  Traits: "from-purple-500 to-fuchsia-400",
  Runtime: "from-rose-500 to-pink-400",
  Concurrency: "from-yellow-400 to-orange-400",
  Patterns: "from-indigo-500 to-violet-400",
};

const inline = (t: string) =>
  t.split(/(`[^`]+`)/g).map((p, i) =>
    p.startsWith("`") ? (
      <code key={i} className="rounded bg-white/10 px-1 font-mono text-[0.85em] text-rust-200">
        {p.slice(1, -1)}
      </code>
    ) : (
      p
    )
  );

export default function NuancesPage() {
  const [cat, setCat] = useState<"All" | Nuance["category"]>("All");
  const cats = ["All", ...Object.keys(CAT_COLORS)] as ("All" | Nuance["category"])[];
  const list = NUANCES.filter((n) => cat === "All" || n.category === cat);
  const { state } = useProgress();

  return (
    <div>
      <PageHeader
        eyebrow="Nuances of Rust"
        title={
          <>
            The <span className="text-gradient">surprising corners</span> of Rust
          </>
        }
        subtitle="Gotchas that trip up even experienced developers. Predict the outcome, reveal the explanation, and run both the broken and the fixed versions."
      >
        <p className="text-sm text-white/50">
          Revealed {state.nuances.length}/{NUANCES.length} · +{XP.nuance} XP each
        </p>
      </PageHeader>

      <div className="mb-6 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              cat === c ? "bg-white text-ink-950" : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {list.map((n) => (
          <NuanceCard key={n.id} n={n} />
        ))}
      </div>
    </div>
  );
}

function NuanceCard({ n }: { n: Nuance }) {
  const { state, toggle } = useProgress();
  const revealed = state.nuances.includes(n.id);
  const [show, setShow] = useState(false);
  const open = show || revealed;

  return (
    <div id={n.id} className="scroll-mt-24 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className={`h-1.5 bg-gradient-to-r ${CAT_COLORS[n.category]}`} />
      <div className="space-y-4 p-6">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <span className={`bg-gradient-to-r ${CAT_COLORS[n.category]} bg-clip-text text-xs font-bold uppercase tracking-wider text-transparent`}>{n.category}</span>
            <h3 className="mt-1 text-xl font-bold">{inline(n.title)}</h3>
          </div>
          {revealed && <CheckCircle2 className="shrink-0 text-emerald-400" size={20} />}
        </div>
        <p className="text-white/70">😮 {inline(n.surprise)}</p>
        {n.wrong && <CodeBlock code={n.wrong} title="✗ surprising / broken" tone="bad" />}
        {!open ? (
          <button
            onClick={() => {
              setShow(true);
              toggle("nuances", n.id, true);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-3 text-sm font-semibold text-white/70 hover:border-rust-400/50 hover:text-white"
          >
            <Eye size={16} /> Predict, then reveal the idiomatic way
          </button>
        ) : (
          <div className="animate-pop space-y-4">
            <CodeBlock code={n.right} title="✓ idiomatic" tone="good" />
            <p className="rounded-xl bg-white/5 p-4 text-sm text-white/75">
              <b className="text-white">Why: </b>
              {inline(n.why)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
