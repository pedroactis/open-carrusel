import { NextResponse } from "next/server";
import { addImages, parseTags } from "@/lib/image-library";
import { saveLibraryBuffer } from "@/lib/library-store";
import { downloadCandidate, searchPinterest, type WebImageCandidate } from "@/lib/web-image-search";

export const maxDuration = 180;

/**
 * Two modes:
 *  - { items: [{full, fallback, alt}], category, tags }  → import the picked results
 *  - { query, limit, category?, tags? }                  → search + import in one shot (used by the agent)
 * Category defaults to the query; tags default to the query words.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const query = typeof body.query === "string" ? body.query.trim() : "";
  const category = String(body.category || query || "geral").trim().toLowerCase();
  const baseTags = parseTags(body.tags ?? query.split(/\s+/));

  let items: WebImageCandidate[] = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0 && query) {
    const limit = Math.min(Math.max(parseInt(body.limit, 10) || 12, 1), 100);
    try {
      items = await searchPinterest(query, limit);
    } catch (e) {
      console.error("pinterest search", e);
      return NextResponse.json({ error: "A busca no Pinterest falhou" }, { status: 502 });
    }
  }
  if (items.length === 0) {
    return NextResponse.json({ error: "Nada para importar" }, { status: 400 });
  }

  const saved = [];
  const errors: string[] = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    try {
      const buf = await downloadCandidate(it);
      const alt = it.alt && !/^salvar pins?$/i.test(it.alt.trim()) ? it.alt : "";
      const name = (alt || `${category}-${i + 1}`).slice(0, 80);
      saved.push(await saveLibraryBuffer(buf, name, category, baseTags));
    } catch (e) {
      errors.push(`${i + 1}: ${(e as Error).message}`);
    }
  }
  const created = await addImages(saved);
  return NextResponse.json({ created, errors }, { status: 201 });
}
