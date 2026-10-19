import { NextResponse } from "next/server";
import { DEFAULT_MODEL, GROQ_BASE, GUARD_PROMPT, OFF_TOPIC_REPLY, SYSTEM_PROMPT, obviouslyRust } from "@/lib/rustGuard";

export const runtime = "nodejs";

type Msg = { role: "user" | "assistant"; content: string };

function groqError(status: number, text: string) {
  let detail = text;
  try {
    detail = JSON.parse(text)?.error?.message ?? text;
  } catch {}
  const hint =
    status === 401
      ? "Your Groq API key was rejected. Check it in the assistant settings."
      : status === 429
        ? "Groq rate limit reached. Wait a moment and try again."
        : status === 404 || /model/i.test(detail)
          ? "That model isn't available on your Groq account. Pick another model in settings."
          : "Groq returned an error.";
  return NextResponse.json({ error: `${hint} (${status}: ${detail.slice(0, 200)})` }, { status });
}

async function isRustTopic(apiKey: string, model: string, messages: Msg[]) {
  const last = messages[messages.length - 1]?.content ?? "";
  if (obviouslyRust(last)) return true;
  const context = messages
    .slice(-5, -1)
    .map((m) => `${m.role.toUpperCase()}: ${m.content.slice(0, 600)}`)
    .join("\n");
  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 5,
      messages: [
        { role: "system", content: GUARD_PROMPT },
        {
          role: "user",
          content: `${context ? `Earlier conversation:\n${context}\n\n` : ""}LATEST MESSAGE:\n${last.slice(0, 2000)}`,
        },
      ],
    }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw { status: res.status, text: await res.text() };
  const data = await res.json();
  const verdict = String(data?.choices?.[0]?.message?.content ?? "").toUpperCase();
  return !verdict.includes("OFF_TOPIC");
}

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-groq-key")?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "Add your Groq API key in the assistant settings (BYOK)." }, { status: 401 });
  }

  let body: { messages?: Msg[]; model?: string; context?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-16)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 12_000) }));
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "No user message" }, { status: 400 });
  }
  const model = (body.model || DEFAULT_MODEL).slice(0, 100);

  // 1) Topic guard: refuse anything that isn't about Rust.
  try {
    if (!(await isRustTopic(apiKey, model, messages))) {
      return new Response(OFF_TOPIC_REPLY, {
        headers: { "Content-Type": "text/plain; charset=utf-8", "x-rust-guard": "off-topic" },
      });
    }
  } catch (e) {
    const err = e as { status?: number; text?: string };
    if (err?.status) return groqError(err.status, err.text ?? "");
    return NextResponse.json({ error: "Could not reach Groq." }, { status: 502 });
  }

  // 2) Stream the tutor's answer.
  const system = body.context
    ? `${SYSTEM_PROMPT}\n\nCurrent page context (what the learner is looking at):\n${body.context.slice(0, 4000)}`
    : SYSTEM_PROMPT;

  const upstream = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: true,
      temperature: 0.3,
      max_tokens: 2048,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  }).catch(() => null);

  if (!upstream) return NextResponse.json({ error: "Could not reach Groq." }, { status: 502 });
  if (!upstream.ok || !upstream.body) return groqError(upstream.status, await upstream.text());

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = upstream.body.getReader();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const t = line.trim();
            if (!t.startsWith("data:")) continue;
            const payload = t.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {}
          }
        }
      } catch {
        controller.enqueue(encoder.encode("\n\n_(stream interrupted)_"));
      } finally {
        controller.close();
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
