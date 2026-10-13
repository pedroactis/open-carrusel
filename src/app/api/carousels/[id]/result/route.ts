import { NextResponse } from "next/server";
import { updateCarousel } from "@/lib/carousels";

const count = (v: unknown): number | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 ? n : NaN;
};

/** Saves the published post's numbers, typed by the user. */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  const fields = {
    likes: count(body?.likes),
    comments: count(body?.comments),
    saves: count(body?.saves),
    shares: count(body?.shares),
    follows: count(body?.follows),
  };

  if (!/^https:\/\/(www\.)?instagram\.com\//.test(url)) {
    return NextResponse.json({ error: "Cole o link do post no Instagram" }, { status: 400 });
  }
  if (fields.likes === undefined || fields.comments === undefined) {
    return NextResponse.json({ error: "Curtidas e comentários são obrigatórios" }, { status: 400 });
  }
  if (Object.values(fields).some((v) => Number.isNaN(v))) {
    return NextResponse.json({ error: "Use só números inteiros, sem pontos" }, { status: 400 });
  }

  const updated = await updateCarousel(id, {
    result: {
      url,
      likes: fields.likes,
      comments: fields.comments,
      ...(fields.saves !== undefined && { saves: fields.saves }),
      ...(fields.shares !== undefined && { shares: fields.shares }),
      ...(fields.follows !== undefined && { follows: fields.follows }),
      recordedAt: new Date().toISOString(),
    },
  });
  if (!updated) {
    return NextResponse.json({ error: "Carrossel não encontrado" }, { status: 404 });
  }
  return NextResponse.json(updated.result);
}
