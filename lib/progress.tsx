"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type ProgressState = {
  concepts: string[];
  quizzes: Record<string, boolean>; // quizId -> answered correctly
  challenges: string[];
  roadmap: string[];
  nuances: string[];
  days: string[]; // ISO dates with activity, for streaks
};

const EMPTY: ProgressState = { concepts: [], quizzes: {}, challenges: [], roadmap: [], nuances: [], days: [] };
const KEY = "rustforge:progress:v1";

export const XP = { concept: 50, quiz: 20, challenge: 120, roadmap: 30, nuance: 10 } as const;

export const LEVELS = [
  { min: 0, name: "Hatchling Crab", emoji: "🥚" },
  { min: 150, name: "Borrow Apprentice", emoji: "🦀" },
  { min: 450, name: "Lifetime Wrangler", emoji: "⏳" },
  { min: 900, name: "Trait Artisan", emoji: "🧩" },
  { min: 1600, name: "Fearless Concurrent", emoji: "⚡" },
  { min: 2600, name: "Unsafe Whisperer", emoji: "🔮" },
  { min: 4000, name: "Ferris Grandmaster", emoji: "👑" },
];

type Ctx = {
  state: ProgressState;
  xp: number;
  level: (typeof LEVELS)[number];
  nextLevel: (typeof LEVELS)[number] | null;
  streak: number;
  toggle: (kind: "concepts" | "challenges" | "roadmap" | "nuances", id: string, value?: boolean) => void;
  answerQuiz: (id: string, correct: boolean) => void;
  reset: () => void;
  hydrated: boolean;
};

const ProgressContext = createContext<Ctx | null>(null);

const today = () => new Date().toISOString().slice(0, 10);

function computeStreak(days: string[]) {
  const set = new Set(days);
  let streak = 0;
  const d = new Date();
  // allow streak to continue if today has no activity yet
  if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  while (set.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...EMPTY, ...JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  const touchDay = (s: ProgressState): ProgressState =>
    s.days.includes(today()) ? s : { ...s, days: [...s.days, today()].slice(-120) };

  const toggle = useCallback<Ctx["toggle"]>((kind, id, value) => {
    setState((s) => {
      const has = s[kind].includes(id);
      const want = value ?? !has;
      if (want === has) return s;
      const list = want ? [...s[kind], id] : s[kind].filter((x) => x !== id);
      return touchDay({ ...s, [kind]: list });
    });
  }, []);

  const answerQuiz = useCallback((id: string, correct: boolean) => {
    setState((s) => {
      if (s.quizzes[id]) return s; // once correct, stays correct
      return touchDay({ ...s, quizzes: { ...s.quizzes, [id]: correct } });
    });
  }, []);

  const reset = useCallback(() => setState(EMPTY), []);

  const value = useMemo<Ctx>(() => {
    const xp =
      state.concepts.length * XP.concept +
      Object.values(state.quizzes).filter(Boolean).length * XP.quiz +
      state.challenges.length * XP.challenge +
      state.roadmap.length * XP.roadmap +
      state.nuances.length * XP.nuance;
    let idx = 0;
    LEVELS.forEach((l, i) => {
      if (xp >= l.min) idx = i;
    });
    return {
      state,
      xp,
      level: LEVELS[idx],
      nextLevel: LEVELS[idx + 1] ?? null,
      streak: computeStreak(state.days),
      toggle,
      answerQuiz,
      reset,
      hydrated,
    };
  }, [state, toggle, answerQuiz, reset, hydrated]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside ProgressProvider");
  return ctx;
}

/** Send code to the playground page. */
export function openInPlayground(code: string) {
  try {
    localStorage.setItem("rustforge:playground:load", code);
  } catch {}
  window.location.href = "/playground?from=lesson";
}

/** Ask the global AI assistant a question. */
export function askAI(prompt: string) {
  window.dispatchEvent(new CustomEvent("rustforge:ask", { detail: prompt }));
}
