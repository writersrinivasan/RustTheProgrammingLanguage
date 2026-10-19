"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { useProgress, XP } from "@/lib/progress";

export type QuizQ = { id: string; q: string; options: string[]; answer: number; why: string };

export default function Quiz({ questions }: { questions: QuizQ[] }) {
  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <QuizItem key={q.id} q={q} n={i + 1} />
      ))}
    </div>
  );
}

function QuizItem({ q, n }: { q: QuizQ; n: number }) {
  const { state, answerQuiz } = useProgress();
  const [picked, setPicked] = useState<number | null>(null);
  const solved = state.quizzes[q.id];
  const done = picked !== null;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="font-semibold">
        <span className="mr-2 text-rust-300">Q{n}.</span>
        {q.q}
        {solved && (
          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] text-emerald-300">
            <Sparkles size={11} /> +{XP.quiz} XP
          </span>
        )}
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {q.options.map((opt, i) => {
          const isAnswer = i === q.answer;
          const isPicked = picked === i;
          let cls = "border-white/10 hover:border-white/30 hover:bg-white/5";
          if (done && isAnswer) cls = "border-emerald-400/60 bg-emerald-500/10";
          else if (done && isPicked) cls = "border-rose-400/60 bg-rose-500/10";
          return (
            <button
              key={i}
              disabled={done}
              onClick={() => {
                setPicked(i);
                answerQuiz(q.id, isAnswer);
              }}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${cls}`}
            >
              {done && isAnswer && <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />}
              {done && isPicked && !isAnswer && <XCircle size={16} className="shrink-0 text-rose-400" />}
              <span className="font-mono text-[13px]">{opt}</span>
            </button>
          );
        })}
      </div>
      {done && (
        <div className="animate-pop mt-3 rounded-lg bg-white/5 p-3 text-sm text-white/75">
          <b className={picked === q.answer ? "text-emerald-300" : "text-rose-300"}>
            {picked === q.answer ? "Correct! " : "Not quite. "}
          </b>
          {q.why}
          {picked !== q.answer && (
            <button onClick={() => setPicked(null)} className="ml-2 text-rust-300 underline">
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
