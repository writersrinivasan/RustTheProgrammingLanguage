import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RunBody = {
  code: string;
  tests?: boolean;
  mode?: "debug" | "release";
  channel?: "stable" | "beta" | "nightly";
  edition?: "2015" | "2018" | "2021" | "2024";
};

/** Proxies execution requests to the official Rust Playground (play.rust-lang.org). */
export async function POST(req: Request) {
  let body: RunBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (typeof body.code !== "string" || !body.code.trim()) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }
  if (body.code.length > 100_000) {
    return NextResponse.json({ error: "Code is too large (max 100KB)" }, { status: 413 });
  }

  const payload = {
    channel: body.channel ?? "stable",
    mode: body.mode ?? "debug",
    edition: body.edition ?? "2024",
    crateType: "bin",
    tests: !!body.tests,
    code: body.code,
    backtrace: false,
  };

  const started = Date.now();
  try {
    const res = await fetch("https://play.rust-lang.org/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Rust Playground returned ${res.status}: ${text.slice(0, 300)}` },
        { status: 502 }
      );
    }
    const data = (await res.json()) as { success: boolean; exitDetail?: string; stdout: string; stderr: string };
    return NextResponse.json({ ...data, elapsedMs: Date.now() - started });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `Could not reach the Rust Playground: ${msg}` }, { status: 502 });
  }
}
