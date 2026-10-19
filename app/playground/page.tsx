"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { OnMount } from "@monaco-editor/react";
import {
  Play, FlaskConical, RotateCcw, Lightbulb, KeyRound, Loader2, CheckCircle2, XCircle, AlertTriangle, Bug, Sparkles,
  Bot, Terminal, ListChecks, NotebookPen, ChevronDown, ExternalLink, Wand2, Settings2,
} from "lucide-react";
import { CHALLENGES, SCRATCH_CODE, type Challenge } from "@/lib/content/challenges";
import { parseDiagnostics, parseTests, codeTips, type Diagnostic, type TestResult } from "@/lib/diagnostics";
import { useProgress, askAI, XP } from "@/lib/progress";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center text-white/40">
      <Loader2 className="animate-spin" />
    </div>
  ),
});

type RunResult = { success: boolean; stdout: string; stderr: string; exitDetail?: string; elapsedMs?: number; error?: string; kind: "run" | "test" };
type Tab = "output" | "tests" | "notes";

const DIFF_COLORS = { Easy: "text-emerald-300 bg-emerald-500/15", Medium: "text-amber-300 bg-amber-500/15", Hard: "text-rose-300 bg-rose-500/15" };
const JOURNAL_KEY = "rustforge:mistakes";

function wrapTests(code: string, tests: string) {
  return `${code}\n\n#[cfg(test)]\nmod rustforge_tests {\n    #![allow(unused_imports)]\n    use super::*;\n${tests}\n}\n`;
}

function md(text: string) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) =>
    p.startsWith("**") ? (
      <b key={i} className="text-white">{p.slice(2, -2)}</b>
    ) : p.startsWith("`") ? (
      <code key={i} className="rounded bg-white/10 px-1 font-mono text-[0.85em] text-rust-200">{p.slice(1, -1)}</code>
    ) : (
      p
    )
  );
}

export default function PlaygroundPage() {
  const { state, toggle } = useProgress();
  const [mode, setMode] = useState<"challenge" | "scratch">("challenge");
  const [challenge, setChallenge] = useState<Challenge>(CHALLENGES[0]);
  const [code, setCode] = useState(CHALLENGES[0].starter);
  const [running, setRunning] = useState<false | "run" | "test">(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [tab, setTab] = useState<Tab>("output");
  const [hintsShown, setHintsShown] = useState(0);
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [celebrate, setCelebrate] = useState(false);
  const [journal, setJournal] = useState<Record<string, number>>({});
  const [edition, setEdition] = useState<"2021" | "2024">("2024");
  const [buildMode, setBuildMode] = useState<"debug" | "release">("debug");
  const [showSettings, setShowSettings] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);
  const runRef = useRef<(kind: "run" | "test") => void>(() => {});

  const storageKey = mode === "scratch" ? "rustforge:code:scratch" : `rustforge:code:${challenge.id}`;

  // initial load: lesson hand-off or saved state
  useEffect(() => {
    try {
      setJournal(JSON.parse(localStorage.getItem(JOURNAL_KEY) ?? "{}"));
      const params = new URLSearchParams(window.location.search);
      const handoff = localStorage.getItem("rustforge:playground:load");
      if (params.get("from") === "lesson" && handoff) {
        localStorage.removeItem("rustforge:playground:load");
        setMode("scratch");
        setCode(handoff);
        localStorage.setItem("rustforge:code:scratch", handoff);
        history.replaceState(null, "", "/playground");
        return;
      }
      const saved = localStorage.getItem(`rustforge:code:${CHALLENGES[0].id}`);
      if (saved) setCode(saved);
    } catch {}
  }, []);

  // persist code
  useEffect(() => {
    const t = setTimeout(() => {
      try { localStorage.setItem(storageKey, code); } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [code, storageKey]);

  const loadChallenge = (c: Challenge) => {
    setMode("challenge");
    setChallenge(c);
    setHintsShown(0);
    setResult(null);
    setPickerOpen(false);
    let saved: string | null = null;
    try { saved = localStorage.getItem(`rustforge:code:${c.id}`); } catch {}
    setCode(saved ?? c.starter);
  };

  const loadScratch = () => {
    setMode("scratch");
    setResult(null);
    let saved: string | null = null;
    try { saved = localStorage.getItem("rustforge:code:scratch"); } catch {}
    setCode(saved ?? SCRATCH_CODE);
  };

  const userLines = code.split("\n").length;

  const diagnostics = useMemo<Diagnostic[]>(() => {
    if (!result || result.error) return [];
    return parseDiagnostics(result.stderr, result.stdout).map((d) =>
      d.line && (d.line > userLines || d.line < 1) ? { ...d, line: undefined, message: `${d.message} (inside hidden tests)` } : d
    );
  }, [result, userLines]);

  const tips = useMemo(() => codeTips(code), [code]);
  const tests = useMemo(() => (result?.kind === "test" ? parseTests(result.stdout) : null), [result]);

  // editor markers
  useEffect(() => {
    const monaco = monacoRef.current;
    const model = editorRef.current?.getModel();
    if (!monaco || !model) return;
    const markers = [...diagnostics, ...tips]
      .filter((d) => d.line)
      .map((d) => ({
        startLineNumber: d.line!,
        endLineNumber: d.line!,
        startColumn: d.col ?? 1,
        endColumn: model.getLineMaxColumn(Math.min(d.line!, model.getLineCount())),
        message: `${d.code ? `[${d.code}] ` : ""}${d.title}: ${d.message}`,
        severity:
          d.severity === "error" || d.severity === "panic"
            ? monaco.MarkerSeverity.Error
            : d.severity === "warning"
              ? monaco.MarkerSeverity.Warning
              : monaco.MarkerSeverity.Info,
      }));
    monaco.editor.setModelMarkers(model, "rustforge", markers);
  }, [diagnostics, tips]);

  const recordMistakes = (diags: Diagnostic[]) => {
    const errs = diags.filter((d) => d.severity === "error" || d.severity === "panic");
    if (!errs.length) return;
    setJournal((j) => {
      const next = { ...j };
      for (const d of errs) {
        const k = d.code ? `${d.code} · ${d.title}` : d.title;
        next[k] = (next[k] ?? 0) + 1;
      }
      try { localStorage.setItem(JOURNAL_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const run = useCallback(
    async (kind: "run" | "test") => {
      if (running) return;
      const isTest = kind === "test" && mode === "challenge";
      setRunning(kind);
      setTab(isTest ? "tests" : "output");
      try {
        const res = await fetch("/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: isTest ? wrapTests(code, challenge.tests) : code,
            tests: isTest,
            edition,
            mode: buildMode,
          }),
        });
        const data = await res.json();
        const r: RunResult = res.ok ? { ...data, kind: isTest ? "test" : "run" } : { success: false, stdout: "", stderr: "", error: data.error, kind };
        setResult(r);
        if (!r.error) {
          const diags = parseDiagnostics(r.stderr, r.stdout);
          recordMistakes(diags);
          if (diags.some((d) => d.severity === "error")) setTab("notes");
        }
        if (isTest && !r.error) {
          const parsed = parseTests(r.stdout);
          const passed = parsed.results.length > 0 && parsed.results.every((t) => t.status === "ok");
          if (passed) {
            if (!state.challenges.includes(challenge.id)) {
              setCelebrate(true);
              setTimeout(() => setCelebrate(false), 2600);
            }
            toggle("challenges", challenge.id, true);
          } else {
            setAttempts((a) => ({ ...a, [challenge.id]: (a[challenge.id] ?? 0) + 1 }));
          }
        }
      } catch {
        setResult({ success: false, stdout: "", stderr: "", error: "Network error — is the dev server running?", kind });
      } finally {
        setRunning(false);
      }
    },
    [running, mode, code, challenge, edition, buildMode, state.challenges, toggle]
  );
  runRef.current = run;

  const onMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    monaco.editor.defineTheme("rustforge", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "ff7ab2" },
        { token: "string", foreground: "fcd34d" },
        { token: "number", foreground: "fb923c" },
        { token: "comment", foreground: "6b6890", fontStyle: "italic" },
        { token: "type", foreground: "5eead4" },
      ],
      colors: {
        "editor.background": "#0b0a14",
        "editor.lineHighlightBackground": "#1a1730",
        "editorLineNumber.foreground": "#4a4670",
        "editorLineNumber.activeForeground": "#ff7038",
        "editor.selectionBackground": "#fe4a1140",
        "editorCursor.foreground": "#ff7038",
      },
    });
    monaco.editor.setTheme("rustforge");
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runRef.current("run"));
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => runRef.current("test"));
  };

  const jumpTo = (line?: number) => {
    if (!line || !editorRef.current) return;
    editorRef.current.revealLineInCenter(line);
    editorRef.current.setPosition({ lineNumber: line, column: 1 });
    editorRef.current.focus();
  };

  const explainWithAI = (d?: Diagnostic) => {
    const errText = d
      ? `${d.code ? `error[${d.code}]` : d.severity}: ${d.message}${d.line ? ` (line ${d.line})` : ""}`
      : (result?.stderr ?? "").split("\n").filter((l) => !/^\s*(Compiling|Finished|Running)/.test(l)).join("\n").slice(0, 2500);
    askAI(
      `I'm practicing Rust in the playground${mode === "challenge" ? ` (challenge: "${challenge.title}")` : ""}. Explain this compiler/runtime message in simple terms, why Rust enforces it, and how to fix my code — guide me with hints before giving the full fix.\n\nMessage:\n${errText}\n\nMy code:\n\`\`\`rust\n${code.slice(0, 5000)}\n\`\`\``
    );
  };

  const reviewWithAI = () =>
    askAI(`Review my Rust code like a senior Rustacean: point out non-idiomatic patterns, unnecessary clones/unwraps, and suggest improvements.\n\n\`\`\`rust\n${code.slice(0, 6000)}\n\`\`\``);

  const errors = diagnostics.filter((d) => d.severity === "error" || d.severity === "panic");
  const warnings = diagnostics.filter((d) => d.severity === "warning");
  const notesCount = diagnostics.length + tips.length;
  const solved = state.challenges.includes(challenge.id);
  const failedAttempts = attempts[challenge.id] ?? 0;
  const cleanOutput = (result?.stderr ?? "")
    .split("\n")
    .filter((l) => !/^\s*(Compiling playground|Finished|Running)/.test(l))
    .join("\n")
    .trim();

  return (
    <div className="relative">
      {celebrate && <Celebration />}

      {/* Top bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
          <button onClick={() => loadChallenge(challenge)} className={`rounded-lg px-4 py-1.5 text-sm font-semibold ${mode === "challenge" ? "bg-gradient-to-r from-rust-500 to-rose-500" : "text-white/60"}`}>
            🎯 Challenges
          </button>
          <button onClick={loadScratch} className={`rounded-lg px-4 py-1.5 text-sm font-semibold ${mode === "scratch" ? "bg-gradient-to-r from-purple-500 to-cyan-500" : "text-white/60"}`}>
            🧪 Scratchpad
          </button>
        </div>

        {mode === "challenge" && (
          <div className="relative">
            <button onClick={() => setPickerOpen((o) => !o)} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold hover:bg-white/10">
              {challenge.emoji} {challenge.title} <ChevronDown size={14} />
            </button>
            {pickerOpen && (
              <div className="absolute left-0 top-full z-30 mt-2 w-80 overflow-hidden rounded-xl border border-white/10 bg-ink-800 shadow-2xl">
                {CHALLENGES.map((c, i) => (
                  <button key={c.id} onClick={() => loadChallenge(c)} className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-white/5 ${c.id === challenge.id ? "bg-white/5" : ""}`}>
                    <span className="w-5 text-white/30">{i + 1}</span>
                    <span>{c.emoji}</span>
                    <span className="flex-1 truncate">{c.title}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${DIFF_COLORS[c.difficulty]}`}>{c.difficulty}</span>
                    {state.challenges.includes(c.id) && <CheckCircle2 size={14} className="text-emerald-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <span className="text-sm text-white/40">
          {state.challenges.length}/{CHALLENGES.length} solved
        </span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <button onClick={() => setShowSettings((s) => !s)} className="rounded-xl border border-white/10 p-2 text-white/60 hover:bg-white/5" title="Build settings">
              <Settings2 size={18} />
            </button>
            {showSettings && (
              <div className="absolute right-0 top-full z-30 mt-2 w-56 space-y-3 rounded-xl border border-white/10 bg-ink-800 p-4 text-sm shadow-2xl">
                <label className="block">
                  <span className="text-xs text-white/50">Edition</span>
                  <select value={edition} onChange={(e) => setEdition(e.target.value as "2021" | "2024")} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5">
                    <option value="2024">2024</option>
                    <option value="2021">2021</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs text-white/50">Build</span>
                  <select value={buildMode} onChange={(e) => setBuildMode(e.target.value as "debug" | "release")} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5">
                    <option value="debug">Debug (overflow checks)</option>
                    <option value="release">Release (optimized)</option>
                  </select>
                </label>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              if (mode === "challenge") setCode(challenge.starter);
              else setCode(SCRATCH_CODE);
              setResult(null);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/5"
          >
            <RotateCcw size={15} /> Reset
          </button>
          <button onClick={reviewWithAI} className="flex items-center gap-1.5 rounded-xl border border-purple-400/30 bg-purple-500/10 px-3 py-2 text-sm font-semibold text-purple-200 hover:bg-purple-500/20">
            <Wand2 size={15} /> AI review
          </button>
          <button
            onClick={() => run("run")}
            disabled={!!running}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15 disabled:opacity-50"
            title="Ctrl/⌘ + Enter"
          >
            {running === "run" ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />} Run
          </button>
          {mode === "challenge" && (
            <button
              onClick={() => run("test")}
              disabled={!!running}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              title="Ctrl/⌘ + Shift + Enter"
            >
              {running === "test" ? <Loader2 size={15} className="animate-spin" /> : <FlaskConical size={15} />} Run Tests
            </button>
          )}
        </div>
      </div>

      <div className={`grid gap-4 ${mode === "challenge" ? "xl:grid-cols-[300px_1fr_420px]" : "xl:grid-cols-[1fr_440px]"}`}>
        {/* Brief */}
        {mode === "challenge" && (
          <aside className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 xl:max-h-[calc(100vh-11rem)] xl:overflow-y-auto">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{challenge.emoji}</span>
              <div>
                <h2 className="font-bold leading-tight">{challenge.title}</h2>
                <div className="mt-1 flex gap-2">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${DIFF_COLORS[challenge.difficulty]}`}>{challenge.difficulty}</span>
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-white/60">{challenge.topic}</span>
                </div>
              </div>
            </div>
            {solved && (
              <p className="flex items-center gap-2 rounded-lg bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-300">
                <CheckCircle2 size={16} /> Solved · +{XP.challenge} XP
              </p>
            )}
            <p className="text-sm leading-relaxed text-white/75">{md(challenge.description)}</p>

            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/55">
              <p className="mb-1 font-semibold text-white/70">How it works</p>
              <p>
                <b>Run</b> executes <code className="text-rust-200">main</code>. <b>Run Tests</b> compiles your code with hidden unit tests via <code className="text-rust-200">cargo test</code>. Mistakes show up in the <b>Notes</b> panel with plain-English explanations.
              </p>
            </div>

            <div className="space-y-2">
              {challenge.hints.slice(0, hintsShown).map((h, i) => (
                <p key={i} className="animate-pop flex gap-2 rounded-lg border border-amber-400/20 bg-amber-400/10 p-3 text-sm text-amber-100">
                  <Lightbulb size={15} className="mt-0.5 shrink-0 text-amber-300" />
                  <span>{md(h)}</span>
                </p>
              ))}
              {hintsShown < challenge.hints.length && (
                <button onClick={() => setHintsShown((h) => h + 1)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-amber-400/30 py-2 text-sm text-amber-200 hover:bg-amber-400/10">
                  <Lightbulb size={15} /> Show hint {hintsShown + 1}/{challenge.hints.length}
                </button>
              )}
              <button
                onClick={() => {
                  if (failedAttempts >= 2 || solved || confirm("Peek at the solution? Try a couple of test runs first — struggling is where learning happens!")) {
                    setCode(challenge.solution);
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 py-2 text-sm text-white/50 hover:bg-white/5"
              >
                <KeyRound size={15} /> {failedAttempts >= 2 || solved ? "Show solution" : `Solution (unlocks after 2 attempts · ${failedAttempts}/2)`}
              </button>
            </div>
          </aside>
        )}

        {/* Editor */}
        <div className="flex min-h-[460px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0a14] xl:h-[calc(100vh-11rem)]">
          <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2 text-xs text-white/40">
            <span className="h-2.5 w-2.5 rounded-full bg-rust-500" />
            <span className="font-mono">src/main.rs</span>
            <span className="ml-auto">
              Rust {edition} · {buildMode} · ⌘/Ctrl+Enter to run
            </span>
          </div>
          <div className="min-h-[420px] flex-1">
            <Editor
              height="100%"
              language="rust"
              value={code}
              onChange={(v) => setCode(v ?? "")}
              onMount={onMount}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "var(--font-jetbrains), monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 14 },
                tabSize: 4,
                renderLineHighlight: "all",
                smoothScrolling: true,
                cursorBlinking: "smooth",
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Right panel */}
        <div className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] xl:h-[calc(100vh-11rem)]">
          <div className="flex border-b border-white/10">
            {([
              ["output", "Output", Terminal, null],
              ...(mode === "challenge" ? [["tests", "Tests", ListChecks, tests ? `${tests.results.filter((t) => t.status === "ok").length}/${tests.results.length}` : null]] : []),
              ["notes", "Notes", NotebookPen, notesCount || null],
            ] as [Tab, string, typeof Terminal, string | number | null][]).map(([id, label, Icon, badge]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-3 py-3 text-sm font-semibold transition ${
                  tab === id ? "border-rust-400 text-white" : "border-transparent text-white/50 hover:text-white"
                }`}
              >
                <Icon size={15} /> {label}
                {badge !== null && (
                  <span className={`rounded-full px-1.5 text-[10px] ${id === "notes" && errors.length ? "bg-rose-500 text-white" : "bg-white/15"}`}>{badge}</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {running && (
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Loader2 size={16} className="animate-spin" /> Compiling on the Rust Playground…
              </div>
            )}

            {!running && tab === "output" && (
              <OutputView result={result} cleanStderr={cleanOutput} errors={errors.length} onExplain={() => explainWithAI()} />
            )}

            {!running && tab === "tests" && <TestsView tests={tests} result={result} onRun={() => run("test")} errors={errors.length} goNotes={() => setTab("notes")} />}

            {!running && tab === "notes" && (
              <div className="space-y-3">
                {notesCount === 0 && (
                  <p className="rounded-xl border border-dashed border-white/15 p-4 text-sm text-white/50">
                    No notes yet. When you make a mistake, explanations appear here side by side with your code — click a note to jump to the line.
                  </p>
                )}
                {[...errors, ...warnings].map((d, i) => (
                  <NoteCard key={`d${i}`} d={d} onJump={() => jumpTo(d.line)} onExplain={() => explainWithAI(d)} />
                ))}
                {tips.length > 0 && <p className="pt-2 text-xs font-bold uppercase tracking-wider text-cyan-300/70">Coach tips · idioms</p>}
                {tips.map((d, i) => (
                  <NoteCard key={`t${i}`} d={d} onJump={() => jumpTo(d.line)} />
                ))}
                <MistakeJournal journal={journal} onClear={() => { setJournal({}); try { localStorage.removeItem(JOURNAL_KEY); } catch {} }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OutputView({ result, cleanStderr, errors, onExplain }: { result: RunResult | null; cleanStderr: string; errors: number; onExplain: () => void }) {
  if (!result)
    return (
      <div className="space-y-2 text-sm text-white/50">
        <p>Press <b className="text-white">Run</b> to compile & execute your program with the real Rust compiler.</p>
        <p className="text-xs">Powered by play.rust-lang.org — the top 100 crates (tokio, serde, rand, regex…) are available.</p>
      </div>
    );
  if (result.error) return <p className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-200">⚠️ {result.error}</p>;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs">
        {result.success ? (
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-300"><CheckCircle2 size={12} /> Success</span>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 font-semibold text-rose-300"><XCircle size={12} /> {errors ? "Failed" : result.exitDetail ?? "Failed"}</span>
        )}
        {result.elapsedMs && <span className="text-white/40">{(result.elapsedMs / 1000).toFixed(1)}s</span>}
        {!result.success && (
          <button onClick={onExplain} className="ml-auto flex items-center gap-1 rounded-lg bg-purple-500/15 px-2 py-1 font-semibold text-purple-200 hover:bg-purple-500/25">
            <Bot size={12} /> Explain with AI
          </button>
        )}
      </div>
      {result.stdout && (
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-white/40">stdout</p>
          <pre className="code-block !text-emerald-200">{result.stdout}</pre>
        </div>
      )}
      {cleanStderr && (
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-white/40">compiler / stderr</p>
          <pre className="code-block !text-[12px] !text-white/70">{cleanStderr}</pre>
        </div>
      )}
      {!result.stdout && !cleanStderr && <p className="text-sm text-white/50">(no output)</p>}
    </div>
  );
}

function TestsView({ tests, result, onRun, errors, goNotes }: { tests: { results: TestResult[]; summary?: string } | null; result: RunResult | null; onRun: () => void; errors: number; goNotes: () => void }) {
  if (!tests || !result || result.kind !== "test")
    return (
      <div className="space-y-3 text-sm text-white/55">
        <p>Hidden unit tests check your solution. Press <b className="text-white">Run Tests</b> (⌘/Ctrl+Shift+Enter).</p>
        <button onClick={onRun} className="flex items-center gap-2 rounded-lg bg-emerald-500/15 px-3 py-2 font-semibold text-emerald-300 hover:bg-emerald-500/25">
          <FlaskConical size={15} /> Run tests now
        </button>
      </div>
    );
  if (errors && tests.results.length === 0)
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm">
        <p className="font-semibold text-rose-200">Your code didn&apos;t compile, so tests couldn&apos;t run.</p>
        <button onClick={goNotes} className="mt-2 text-rose-200 underline">See the {errors} error note{errors > 1 ? "s" : ""} →</button>
      </div>
    );
  const passed = tests.results.filter((t) => t.status === "ok").length;
  const all = passed === tests.results.length && passed > 0;
  return (
    <div className="space-y-3">
      <div className={`rounded-xl p-4 ${all ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20" : "bg-rose-500/10"}`}>
        <p className="text-lg font-bold">{all ? "🎉 All tests passed!" : `${passed}/${tests.results.length} tests passing`}</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div className={`h-full rounded-full ${all ? "bg-emerald-400" : "bg-gradient-to-r from-rose-500 to-amber-400"}`} style={{ width: `${(passed / Math.max(1, tests.results.length)) * 100}%` }} />
        </div>
      </div>
      {tests.results.map((t) => (
        <div key={t.name} className={`rounded-xl border p-3 ${t.status === "ok" ? "border-emerald-500/25 bg-emerald-500/[0.05]" : "border-rose-500/30 bg-rose-500/[0.07]"}`}>
          <p className="flex items-center gap-2 text-sm font-semibold">
            {t.status === "ok" ? <CheckCircle2 size={16} className="text-emerald-400" /> : <XCircle size={16} className="text-rose-400" />}
            {t.name.replace(/^rustforge_tests::/, "").replace(/_/g, " ")}
          </p>
          {t.detail && <pre className="code-block mt-2 !p-2.5 !text-[11.5px] !text-rose-100/80">{t.detail.replace(/thread '.*?' \(\d+\) panicked at /, "panicked at ").replace(/thread '.*?' panicked at /, "panicked at ")}</pre>}
        </div>
      ))}
      {tests.summary && <p className="font-mono text-xs text-white/40">{tests.summary}</p>}
    </div>
  );
}

function NoteCard({ d, onJump, onExplain }: { d: Diagnostic; onJump: () => void; onExplain?: () => void }) {
  const style = {
    error: { box: "border-rose-500/30 bg-rose-500/[0.07]", icon: <XCircle size={16} className="text-rose-400" />, label: "text-rose-300" },
    panic: { box: "border-orange-500/30 bg-orange-500/[0.07]", icon: <Bug size={16} className="text-orange-400" />, label: "text-orange-300" },
    warning: { box: "border-amber-500/25 bg-amber-500/[0.06]", icon: <AlertTriangle size={16} className="text-amber-400" />, label: "text-amber-300" },
    tip: { box: "border-cyan-500/25 bg-cyan-500/[0.05]", icon: <Sparkles size={16} className="text-cyan-300" />, label: "text-cyan-300" },
  }[d.severity];
  return (
    <div className={`animate-pop rounded-xl border p-3.5 ${style.box}`}>
      <div className="flex flex-wrap items-center gap-2">
        {style.icon}
        <p className={`font-bold ${style.label}`}>{d.title}</p>
        {d.code && (
          <a href={`https://doc.rust-lang.org/error_codes/${d.code}.html`} target="_blank" rel="noreferrer" className="flex items-center gap-0.5 rounded bg-white/10 px-1.5 font-mono text-[11px] text-white/70 hover:bg-white/20">
            {d.code} <ExternalLink size={10} />
          </a>
        )}
        {d.line && (
          <button onClick={onJump} className="ml-auto rounded bg-white/10 px-1.5 font-mono text-[11px] text-white/70 hover:bg-white/20">
            line {d.line} ↗
          </button>
        )}
      </div>
      <p className="mt-1.5 font-mono text-[12px] text-white/55">{d.message}</p>
      <p className="mt-2 text-sm text-white/80">{md(d.explain)}</p>
      {d.fix && (
        <p className="mt-2 rounded-lg bg-black/25 p-2 text-sm text-emerald-200">
          <b>Fix: </b>
          {md(d.fix)}
        </p>
      )}
      {onExplain && (
        <button onClick={onExplain} className="mt-2 flex items-center gap-1 text-xs font-semibold text-purple-300 hover:text-purple-200">
          <Bot size={13} /> Ask Ferris AI about this
        </button>
      )}
    </div>
  );
}

function MistakeJournal({ journal, onClear }: { journal: Record<string, number>; onClear: () => void }) {
  const entries = Object.entries(journal).sort((a, b) => b[1] - a[1]).slice(0, 6);
  if (!entries.length) return null;
  const max = entries[0][1];
  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center">
        <p className="text-xs font-bold uppercase tracking-wider text-white/50">📒 Your mistake journal</p>
        <button onClick={onClear} className="ml-auto text-[11px] text-white/30 hover:text-white/60">clear</button>
      </div>
      <p className="mt-1 text-xs text-white/40">The errors you hit most often. These are the concepts to review.</p>
      <div className="mt-3 space-y-2">
        {entries.map(([k, n]) => (
          <div key={k}>
            <div className="flex justify-between text-xs">
              <span className="text-white/75">{k}</span>
              <span className="text-white/40">×{n}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400" style={{ width: `${(n / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Celebration() {
  const pieces = Array.from({ length: 28 }, (_, i) => i);
  const emojis = ["🦀", "🎉", "⭐", "🔥", "✨", "🧡"];
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <style>{`@keyframes fall{0%{transform:translateY(-10vh) rotate(0)}100%{transform:translateY(110vh) rotate(540deg)}}`}</style>
      {pieces.map((i) => (
        <span
          key={i}
          className="absolute text-2xl"
          style={{ left: `${(i * 37) % 100}%`, top: 0, animation: `fall ${1.6 + (i % 5) * 0.25}s ease-in ${(i % 7) * 0.08}s forwards` }}
        >
          {emojis[i % emojis.length]}
        </span>
      ))}
      <div className="animate-pop absolute left-1/2 top-1/3 -translate-x-1/2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-5 text-center shadow-2xl">
        <p className="text-2xl font-extrabold">Challenge solved! 🦀</p>
        <p className="text-white/85">+{XP.challenge} XP</p>
      </div>
    </div>
  );
}
