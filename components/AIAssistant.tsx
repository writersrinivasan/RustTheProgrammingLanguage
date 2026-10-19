"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, KeyRound, Send, Settings, Square, Trash2, X, Eye, EyeOff, ShieldCheck, Loader2, Sparkles } from "lucide-react";
import { highlight } from "./CodeBlock";

type Msg = { role: "user" | "assistant"; content: string; offTopic?: boolean; error?: boolean };

const KEY_STORE = "rustforge:groq-key";
const MODEL_STORE = "rustforge:groq-model";
const CHAT_STORE = "rustforge:chat";
const FALLBACK_MODELS = ["llama-3.3-70b-versatile", "openai/gpt-oss-120b", "openai/gpt-oss-20b", "llama-3.1-8b-instant", "qwen/qwen3-32b"];

const QUICK = [
  "Explain ownership like I'm new to systems programming",
  "When should I use Rc<RefCell<T>> vs Arc<Mutex<T>>?",
  "Show idiomatic error handling with thiserror and anyhow",
  "How do lifetimes work in structs?",
  "Build a minimal Axum REST endpoint",
];

const PAGE_CONTEXT: Record<string, string> = {
  "/learn": "Concept lessons (ownership, borrowing, lifetimes, traits, async, etc.)",
  "/nuances": "Rust nuances and gotchas page",
  "/evolution": "History and evolution of Rust page",
  "/roadmap": "Step-by-step Rust learning roadmap with developer tracks",
  "/playground": "Interactive Rust playground with coding challenges and tests",
  "/industry": "Industry use cases of Rust page",
};

function readKey() {
  try {
    return localStorage.getItem(KEY_STORE) ?? sessionStorage.getItem(KEY_STORE) ?? "";
  } catch {
    return "";
  }
}

export default function AIAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"chat" | "settings">("chat");
  const [apiKey, setApiKey] = useState("");
  const [draftKey, setDraftKey] = useState("");
  const [remember, setRemember] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState(FALLBACK_MODELS[0]);
  const [models, setModels] = useState<string[]>(FALLBACK_MODELS);
  const [verifyMsg, setVerifyMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pendingAsk = useRef<string | null>(null);

  useEffect(() => {
    const k = readKey();
    setApiKey(k);
    setDraftKey(k);
    try {
      const m = localStorage.getItem(MODEL_STORE);
      if (m) setModel(m);
      const c = sessionStorage.getItem(CHAT_STORE);
      if (c) setMessages(JSON.parse(c));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_STORE, JSON.stringify(messages.slice(-30)));
    } catch {}
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || busy) return;
      if (!apiKey) {
        pendingAsk.current = content;
        setView("settings");
        setOpen(true);
        return;
      }
      const history: Msg[] = [...messages, { role: "user", content }];
      setMessages([...history, { role: "assistant", content: "" }]);
      setInput("");
      setBusy(true);
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-groq-key": apiKey },
          body: JSON.stringify({
            model,
            context: PAGE_CONTEXT[Object.keys(PAGE_CONTEXT).find((p) => pathname.startsWith(p)) ?? ""] ?? "Home page",
            messages: history.filter((m) => !m.error && !m.offTopic).map(({ role, content }) => ({ role, content })),
          }),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({ error: `Request failed (${res.status})` }));
          setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: `⚠️ ${data.error}`, error: true }]);
          return;
        }
        const offTopic = res.headers.get("x-rust-guard") === "off-topic";
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let acc = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += dec.decode(value, { stream: true });
          setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: acc, offTopic }]);
        }
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: "⚠️ Network error talking to the assistant.", error: true }]);
        }
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [apiKey, busy, messages, model, pathname]
  );

  // Other pages can ask the assistant questions.
  useEffect(() => {
    const handler = (e: Event) => {
      const prompt = (e as CustomEvent<string>).detail;
      setOpen(true);
      setView("chat");
      send(prompt);
    };
    window.addEventListener("rustforge:ask", handler);
    return () => window.removeEventListener("rustforge:ask", handler);
  }, [send]);

  const saveKey = async () => {
    const k = draftKey.trim();
    setVerifying(true);
    setVerifyMsg(null);
    try {
      const res = await fetch("/api/models", { method: "POST", headers: { "x-groq-key": k } });
      const data = await res.json();
      if (!res.ok) {
        setVerifyMsg({ ok: false, text: data.error ?? "Key verification failed" });
        return;
      }
      const list: string[] = data.models?.length ? data.models : FALLBACK_MODELS;
      setModels(list);
      if (!list.includes(model)) {
        const pick = list.find((m) => m.includes("llama-3.3-70b")) ?? list.find((m) => m.includes("gpt-oss-120b")) ?? list[0];
        setModel(pick);
        try { localStorage.setItem(MODEL_STORE, pick); } catch {}
      }
      try {
        localStorage.removeItem(KEY_STORE);
        sessionStorage.removeItem(KEY_STORE);
        (remember ? localStorage : sessionStorage).setItem(KEY_STORE, k);
      } catch {}
      setApiKey(k);
      setVerifyMsg({ ok: true, text: `Key verified · ${list.length} models available` });
      if (pendingAsk.current) {
        const q = pendingAsk.current;
        pendingAsk.current = null;
        setView("chat");
        setTimeout(() => window.dispatchEvent(new CustomEvent("rustforge:ask", { detail: q })), 50);
      }
    } catch {
      setVerifyMsg({ ok: false, text: "Could not reach the server" });
    } finally {
      setVerifying(false);
    }
  };

  const clearKey = () => {
    try {
      localStorage.removeItem(KEY_STORE);
      sessionStorage.removeItem(KEY_STORE);
    } catch {}
    setApiKey("");
    setDraftKey("");
    setVerifyMsg(null);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => {
            setOpen(true);
            if (!apiKey) setView("settings");
          }}
          className="group fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-rust-500 via-rose-500 to-purple-600 py-3 pl-3 pr-5 font-semibold text-white shadow-2xl shadow-rust-600/40 transition hover:scale-105"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-lg">🦀</span>
          Ask Ferris AI
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm sm:inset-auto sm:bottom-5 sm:right-5 sm:bg-transparent sm:backdrop-blur-none">
          <div className="flex h-full w-full flex-col overflow-hidden border border-white/10 bg-ink-900/95 shadow-2xl shadow-black/60 backdrop-blur-xl sm:h-[640px] sm:max-h-[calc(100vh-2.5rem)] sm:w-[440px] sm:rounded-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-rust-600/30 via-rose-600/20 to-purple-600/30 px-4 py-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-rust-400 to-purple-600 text-lg">🦀</span>
              <div className="min-w-0">
                <p className="font-bold leading-tight">Ferris AI</p>
                <p className="truncate text-[11px] text-white/50">
                  Rust-only tutor · {apiKey ? model : "BYOK: add your Groq key"}
                </p>
              </div>
              <div className="ml-auto flex gap-1">
                {view === "chat" && messages.length > 0 && (
                  <button onClick={() => setMessages([])} className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white" title="Clear chat">
                    <Trash2 size={16} />
                  </button>
                )}
                <button
                  onClick={() => setView(view === "chat" ? "settings" : "chat")}
                  className={`rounded-lg p-2 hover:bg-white/10 ${view === "settings" ? "text-rust-300" : "text-white/50 hover:text-white"}`}
                  title="Settings"
                >
                  <Settings size={16} />
                </button>
                <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white" title="Close">
                  <X size={16} />
                </button>
              </div>
            </div>

            {view === "settings" ? (
              <div className="flex-1 space-y-5 overflow-y-auto p-5 text-sm">
                <div className="rounded-xl border border-rust-500/30 bg-rust-500/10 p-4">
                  <p className="flex items-center gap-2 font-semibold text-rust-200">
                    <KeyRound size={16} /> Bring Your Own Key (Groq)
                  </p>
                  <p className="mt-1 text-white/60">
                    Get a free key at{" "}
                    <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-cyan-300 underline">
                      console.groq.com/keys
                    </a>
                    . It is stored only in your browser and sent with each request through this app&apos;s server to Groq. It is never logged or saved on the server.
                  </p>
                </div>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/50">Groq API key</span>
                  <div className="flex gap-2">
                    <input
                      type={showKey ? "text" : "password"}
                      value={draftKey}
                      onChange={(e) => setDraftKey(e.target.value)}
                      placeholder="gsk_..."
                      autoComplete="off"
                      spellCheck={false}
                      className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm outline-none focus:border-rust-400"
                    />
                    <button onClick={() => setShowKey((s) => !s)} className="rounded-lg border border-white/10 px-2 text-white/60 hover:bg-white/5">
                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>

                <label className="flex items-center gap-2 text-white/70">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-rust-500" />
                  Remember on this device (otherwise cleared when the tab closes)
                </label>

                <div className="flex gap-2">
                  <button
                    disabled={!draftKey.trim() || verifying}
                    onClick={saveKey}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-rust-500 to-rose-500 px-4 py-2 font-semibold disabled:opacity-40"
                  >
                    {verifying ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />} Verify & save
                  </button>
                  {apiKey && (
                    <button onClick={clearKey} className="rounded-lg border border-white/10 px-3 py-2 text-white/70 hover:bg-white/5">
                      Remove key
                    </button>
                  )}
                </div>
                {verifyMsg && <p className={verifyMsg.ok ? "text-emerald-300" : "text-rose-300"}>{verifyMsg.text}</p>}

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/50">Model</span>
                  <select
                    value={model}
                    onChange={(e) => {
                      setModel(e.target.value);
                      try { localStorage.setItem(MODEL_STORE, e.target.value); } catch {}
                    }}
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-rust-400"
                  >
                    {(models.includes(model) ? models : [model, ...models]).map((m) => (
                      <option key={m} value={m} className="bg-ink-900">
                        {m}
                      </option>
                    ))}
                  </select>
                  <span className="mt-1 block text-xs text-white/40">Verify your key to load the live model list from Groq.</span>
                </label>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-white/60">
                  <p className="font-semibold text-white/80">🛡️ Rust-only guard</p>
                  <p className="mt-1">
                    Every question passes a topic check first. Anything that isn&apos;t about Rust is politely declined without being answered.
                  </p>
                </div>

                {apiKey && (
                  <button onClick={() => setView("chat")} className="w-full rounded-lg border border-white/10 py-2 text-white/80 hover:bg-white/5">
                    Back to chat →
                  </button>
                )}
              </div>
            ) : (
              <>
                <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
                  {messages.length === 0 && (
                    <div className="animate-pop space-y-4 pt-4 text-center">
                      <div className="animate-float mx-auto text-5xl">🦀</div>
                      <p className="font-semibold">Hi, I&apos;m Ferris AI!</p>
                      <p className="text-sm text-white/50">Ask me anything about Rust — code, errors, crates, design, career.</p>
                      <div className="flex flex-col gap-2 pt-2">
                        {QUICK.map((q) => (
                          <button
                            key={q}
                            onClick={() => send(q)}
                            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm text-white/75 transition hover:border-rust-400/50 hover:bg-rust-500/10"
                          >
                            <Sparkles size={13} className="mr-2 inline text-rust-300" />
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm ${
                          m.role === "user"
                            ? "whitespace-pre-wrap bg-gradient-to-br from-rust-500 to-rose-600 text-white"
                            : m.error
                              ? "border border-rose-500/40 bg-rose-500/10"
                              : m.offTopic
                                ? "border border-amber-500/40 bg-amber-500/10"
                                : "border border-white/10 bg-white/[0.04]"
                        }`}
                      >
                        {m.role === "assistant" ? (
                          m.content ? (
                            <div className="prose-chat">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  code({ className, children }) {
                                    const text = String(children);
                                    if (/language-(rust|rs)/.test(className ?? "")) return <code>{highlight(text.replace(/\n$/, ""))}</code>;
                                    return <code className={className}>{children}</code>;
                                  },
                                  a: (props) => <a {...props} target="_blank" rel="noreferrer" />,
                                }}
                              >
                                {m.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <span className="flex items-center gap-2 text-white/50">
                              <Loader2 size={14} className="animate-spin" /> Ferris is thinking…
                            </span>
                          )
                        ) : (
                          m.content
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(input);
                  }}
                  className="border-t border-white/10 p-3"
                >
                  {!apiKey && (
                    <button type="button" onClick={() => setView("settings")} className="mb-2 flex w-full items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                      <KeyRound size={14} /> Add your Groq API key to start chatting
                    </button>
                  )}
                  <div className="flex items-end gap-2">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          send(input);
                        }
                      }}
                      rows={1}
                      placeholder="Ask about Rust… (Shift+Enter for newline)"
                      className="max-h-32 min-h-[42px] flex-1 resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm outline-none focus:border-rust-400"
                    />
                    {busy ? (
                      <button type="button" onClick={() => abortRef.current?.abort()} className="grid h-[42px] w-[42px] place-items-center rounded-xl bg-white/10 hover:bg-white/20" title="Stop">
                        <Square size={16} />
                      </button>
                    ) : (
                      <button type="submit" disabled={!input.trim()} className="grid h-[42px] w-[42px] place-items-center rounded-xl bg-gradient-to-br from-rust-500 to-rose-600 disabled:opacity-40" title="Send">
                        <Send size={16} />
                      </button>
                    )}
                  </div>
                  <p className="mt-1.5 flex items-center gap-1 text-[10px] text-white/30">
                    <Bot size={11} /> AI can be wrong — verify with the compiler in the Playground.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
