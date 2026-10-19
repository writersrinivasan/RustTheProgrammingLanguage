"use client";

import { useState } from "react";
import { Check, Copy, Play } from "lucide-react";
import { openInPlayground } from "@/lib/progress";

const KEYWORDS = new Set(
  "as async await break const continue crate dyn else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while".split(" ")
);
const TYPES = new Set(
  "i8 i16 i32 i64 i128 isize u8 u16 u32 u64 u128 usize f32 f64 bool char str String Vec Option Result Box Rc Arc RefCell Cell Mutex RwLock HashMap HashSet BTreeMap Some None Ok Err".split(" ")
);

const TOKEN_RE =
  /(\/\/[^\n]*)|("(?:\\.|[^"\\])*")|('(?:\\.|[^'\\])'|b'(?:\\.|[^'\\])')|('[a-z_]\w*)|(\b\d[\d_]*(?:\.\d+)?(?:[iuf](?:8|16|32|64|128|size))?\b)|(\b[a-z_]\w*!)|(\b[A-Za-z_]\w*\b)/g;

export function highlight(code: string) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(code))) {
    if (m.index > last) out.push(code.slice(last, m.index));
    const [text, com, str, chr, life, num, mac, word] = m;
    let cls = "";
    if (com) cls = "tok-com";
    else if (str || chr) cls = "tok-str";
    else if (life) cls = "tok-life";
    else if (num) cls = "tok-num";
    else if (mac) cls = "tok-mac";
    else if (word && KEYWORDS.has(word)) cls = "tok-kw";
    else if (word && (TYPES.has(word) || /^[A-Z]/.test(word))) cls = "tok-ty";
    out.push(cls ? <span key={i++} className={cls}>{text}</span> : text);
    last = m.index + text.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export default function CodeBlock({
  code,
  title,
  runnable = true,
  tone = "neutral",
}: {
  code: string;
  title?: string;
  runnable?: boolean;
  tone?: "neutral" | "bad" | "good";
}) {
  const [copied, setCopied] = useState(false);
  const ring =
    tone === "bad" ? "border-rose-500/40" : tone === "good" ? "border-emerald-500/40" : "border-white/10";
  const label =
    tone === "bad" ? "text-rose-300 bg-rose-500/10" : tone === "good" ? "text-emerald-300 bg-emerald-500/10" : "text-white/50 bg-white/5";

  return (
    <div className={`overflow-hidden rounded-xl border ${ring} bg-[#0b0a14]`}>
      <div className="flex items-center gap-2 border-b border-white/5 px-3 py-1.5">
        <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${label}`}>{title ?? "rust"}</span>
        <div className="ml-auto flex gap-1">
          <button
            onClick={() => {
              navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
            className="rounded-md p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
            aria-label="Copy code"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          {runnable && (
            <button
              onClick={() => openInPlayground(code)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-rust-300 hover:bg-rust-500/15"
            >
              <Play size={12} /> Try it
            </button>
          )}
        </div>
      </div>
      <pre className="code-block !rounded-none !border-0">{highlight(code)}</pre>
    </div>
  );
}
