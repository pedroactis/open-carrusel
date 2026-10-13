import { NextResponse } from "next/server";
import { searchPinterest } from "@/lib/web-image-search";

export const maxDuration = 120;

// Preview only: returns candidates, downloads nothing.
export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const q = sp.get("q")?.trim();
  if (!q) return NextResponse.json({ error: "Digite o que você procura" }, { status: 400 });
  const limit = Math.min(Math.max(parseInt(sp.get("limit") ?? "30", 10) || 30, 1), 80);
  try {
    const results = await searchPinterest(q, limit);
    return NextResponse.json({ results, total: results.length });
  } catch (e) {
    console.error("pinterest search", e);
    return NextResponse.json({ error: "A busca no Pinterest falhou" }, { status: 502 });
  }
}
