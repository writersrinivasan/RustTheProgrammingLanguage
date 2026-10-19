import { NextResponse } from "next/server";
import { GROQ_BASE } from "@/lib/rustGuard";

export const runtime = "nodejs";

/** Lists chat-capable models available to the caller's Groq key (also validates the key). */
export async function POST(req: Request) {
  const apiKey = req.headers.get("x-groq-key")?.trim();
  if (!apiKey) return NextResponse.json({ error: "Missing API key" }, { status: 401 });

  const res = await fetch(`${GROQ_BASE}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(15_000),
  }).catch(() => null);
  if (!res) return NextResponse.json({ error: "Could not reach Groq" }, { status: 502 });
  if (!res.ok) {
    return NextResponse.json(
      { error: res.status === 401 ? "Invalid Groq API key" : `Groq error ${res.status}` },
      { status: res.status }
    );
  }
  const data = (await res.json()) as { data?: { id: string; active?: boolean }[] };
  const models = (data.data ?? [])
    .filter((m) => m.active !== false && !/whisper|tts|guard|playai|orpheus|prompt-guard|safeguard/i.test(m.id))
    .map((m) => m.id)
    .sort();
  return NextResponse.json({ models });
}
