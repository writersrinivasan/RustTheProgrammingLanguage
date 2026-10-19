"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Flame } from "lucide-react";
import { useProgress } from "@/lib/progress";

const LINKS = [
  { href: "/learn", label: "Learn" },
  { href: "/nuances", label: "Nuances" },
  { href: "/evolution", label: "Evolution" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/playground", label: "Playground" },
  { href: "/industry", label: "Industry" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { xp, level, nextLevel, streak, hydrated } = useProgress();
  const pct = nextLevel ? Math.min(100, ((xp - level.min) / (nextLevel.min - level.min)) * 100) : 100;

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-rust-400 via-rose-500 to-purple-600 text-lg shadow-lg shadow-rust-500/30">
            🦀
          </span>
          <span className="text-lg">
            Rust<span className="text-gradient">Forge</span>
          </span>
        </Link>

        <div className="ml-6 hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-3">
          {hydrated && (
            <div className="hidden items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 sm:flex" title={`${xp} XP`}>
              <span className="flex items-center gap-1 text-sm text-amber-300" title="Day streak">
                <Flame size={15} /> {streak}
              </span>
              <span className="text-lg leading-none">{level.emoji}</span>
              <div className="w-28">
                <div className="flex justify-between text-[10px] uppercase tracking-wider text-white/50">
                  <span className="truncate">{level.name}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-rust-400 via-rose-500 to-purple-500 transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <span className="text-xs font-semibold text-white/70">{xp} XP</span>
            </div>
          )}
          <button className="rounded-lg p-2 text-white/70 hover:bg-white/10 lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="border-t border-white/5 px-4 py-3 lg:hidden">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-white/80 hover:bg-white/5">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
